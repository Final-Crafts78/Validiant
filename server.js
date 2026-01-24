const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const { createClient } = require('@supabase/supabase-js');
const multer = require("multer");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const http = require("http");
const nodemailer = require('nodemailer');

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL ERROR HANDLERS - Prevents server crashes
// ═══════════════════════════════════════════════════════════════════════════
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1); // Restart server
});

// ═══════════════════════════════════════════════════════════════════════════
// MULTER CONFIGURATION - File upload handling
// ═══════════════════════════════════════════════════════════════════════════

const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".xlsx" || ext === ".xls" || ext === ".csv") {
      cb(null, true);
    } else {
      cb(new Error(`Only Excel/CSV files allowed! Got: ${ext}`), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Ensure upload directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPRESS APP SETUP
// ═══════════════════════════════════════════════════════════════════════════

const app = express();
const PORT = process.env.PORT || 10000;
const HOST = '0.0.0.0';

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// ✅ Serve static files (HTML, CSS, JS) from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ═══════════════════════════════════════════════════════════════════════════
// DATABASE CONFIGURATION - SUPABASE
// ═══════════════════════════════════════════════════════════════════════════

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ CRITICAL: Missing Supabase URL or Service Key.");
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log("✅ Connected to Supabase Enterprise DB");

// ═══════════════════════════════════════════════════════════════════════════
// NODEMAILER CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

let emailTransporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  console.log('✅ Email service configured');
} else {
  console.warn('⚠️ EMAIL_USER or EMAIL_PASS not set. Emails disabled.');
}

async function sendEmail(to, subject, html) {
  if (!emailTransporter) return { success: false, message: 'Email not configured' };
  try {
    await emailTransporter.sendMail({
      from: `"Validiant Notifications" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
    });
    return { success: true };
  } catch (err) {
    console.error('❌ Email failed:', err.message);
    return { success: false, message: err.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

async function logActivity(userId, userName, action, taskId = null, details = null, req = null) {
  try {
    const ip = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : 'System';
    const safeDetails = details ? (typeof details === 'object' ? details : { info: details }) : null;
    await supabase.from('activity_logs').insert({
      user_id: userId,
      user_name: userName,
      action: action,
      task_id: taskId,
      details: safeDetails,
      ip_address: ip
    });
  } catch (err) {
    console.error("⚠️ Audit Log Exception:", err.message);
  }
}

function extractCoordinates(url) {
  if (!url) return null;
  const match1 = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match1) return { latitude: parseFloat(match1[1]), longitude: parseFloat(match1[2]) };
  const match2 = url.match(/\?q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match2) return { latitude: parseFloat(match2[1]), longitude: parseFloat(match2[2]) };
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// API ROUTES - AUTH & USERS
// ═══════════════════════════════════════════════════════════════════════════

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data: user, error } = await supabase.from("users").select("*").eq("email", email).single();

    if (error || !user) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    await supabase.from("users").update({ last_active: new Date() }).eq("id", user.id);
    await logActivity(user.id, user.name, "LOGIN_SUCCESS", null, null, req);

    res.json({ success: true, user: { id: user.id, name: user.name, role: user.role, employeeId: user.employee_id } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("id, name, email, role, employee_id, phone, last_active, is_active")
      .eq("role", "employee")
      .order('name', { ascending: true });

    if (error) throw error;
    res.json(users.map(u => ({ ...u, employeeId: u.employee_id, lastActive: u.last_active, isActive: u.is_active })));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const { name, email, password, employeeId, phone } = req.body;
    const { data: existing } = await supabase.from("users").select("id").eq("email", email).single();
    if (existing) return res.status(400).json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password || "123456", 10);
    const { error } = await supabase.from("users").insert([{
      name, email, password: hashedPassword, role: "employee", employee_id: employeeId, phone, is_active: true
    }]);

    if (error) throw error;
    await logActivity(null, "Admin", "USER_CREATED", null, `Created: ${email}`, req);
    res.json({ success: true, message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/users/:id/reset-password", async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId, adminName, newPassword } = req.body;
    const tempPassword = newPassword || Math.random().toString(36).slice(-8).toUpperCase();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    const { error } = await supabase.from("users").update({ password: hashedPassword, updated_at: new Date() }).eq("id", id);
    if (error) throw error;
    
    await logActivity(adminId, adminName, "PASSWORD_RESET", null, `Reset user ID ${id}`, req);
    res.json({ success: true, tempPassword });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, employeeId, phone, password, adminId, adminName } = req.body;
    const updateData = { name, email, employee_id: employeeId, phone, updated_at: new Date() };

    if (password && password.trim() !== "") updateData.password = await bcrypt.hash(password, 10);

    const { error } = await supabase.from("users").update(updateData).eq("id", id);
    if (error) throw error;

    await logActivity(adminId, adminName, "USER_UPDATED", null, `Updated Employee: ${name}`, req);
    res.json({ success: true, message: "Employee updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { adminPassword } = req.body;
    const { data: admin } = await supabase.from("users").select("*").eq("email", "admin@validiant.com").single();
    
    if (!admin || !(await bcrypt.compare(adminPassword, admin.password))) {
      return res.status(401).json({ success: false, message: "Invalid admin password" });
    }

    const { data: employee } = await supabase.from("users").select("name").eq("id", id).single();
    await supabase.from("tasks").update({ assigned_to: null, status: "Unassigned" }).eq("assigned_to", id);
    await supabase.from("activity_logs").update({ user_id: null }).eq("user_id", id);
    await supabase.from("users").delete().eq("id", id).eq("role", "employee");

    await logActivity(admin.id, "Admin", "EMPLOYEE_DELETED", null, `Deleted: ${employee?.name}`, req);
    res.json({ success: true, message: "Employee deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// API ROUTES - DASHBOARD ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════

app.get("/api/analytics", async (req, res) => {
  try {
    const [
      { count: totalTasks },
      { count: assignedTasks },
      { count: completedTasks },
      { count: verifiedTasks },
      { count: activeEmployees },
      { count: admins }
    ] = await Promise.all([
      supabase.from("tasks").select("*", { count: "exact", head: true }),
      supabase.from("tasks").select("*", { count: "exact", head: true }).neq("status", "Unassigned"),
      supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "Completed"),
      supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "Verified"),
      supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "employee").eq("is_active", true),
      supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "admin")
    ]);

    res.json({
      totalTasks: totalTasks || 0,
      assignedTasks: assignedTasks || 0,
      completedTasks: completedTasks || 0,
      verifiedTasks: verifiedTasks || 0,
      activeEmployees: activeEmployees || 0,
      admins: admins || 0
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// API ROUTES - DATA FETCHING
// ═══════════════════════════════════════════════════════════════════════════

app.get("/api/activity-log", async (req, res) => {
  try {
    const { data, error } = await supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(50);
    if (error) throw error;
    res.json(data.map(log => ({
      id: log.id,
      userName: log.user_name || "System",
      action: log.action,
      taskTitle: log.task_id ? `Task #${log.task_id}` : "System",
      timestamp: log.created_at,
      details: log.details || ""
    })));
  } catch (err) {
    res.json([]);
  }
});

app.get("/api/tasks", async (req, res) => {
  try {
    const { status, employeeId, pincode, search } = req.query;
    let query = supabase.from("tasks").select("*").order("created_at", { ascending: false });
    
    if (status && status !== "all") query = query.eq("status", status);
    if (employeeId && employeeId !== "all") query = query.eq("assigned_to", parseInt(employeeId));
    if (pincode) query = query.eq("pincode", pincode);
    
    const { data: tasks, error } = await query;
    if (error) throw error;

    const { data: users } = await supabase.from("users").select("id, name, employee_id");

    const formatted = tasks.map(task => {
      const matchedUser = users.find(u => u.id == task.assigned_to);
      const userName = matchedUser ? matchedUser.name : "Unassigned";
      const addressText = task.address || ""; 
      return {
        ...task,
        address: addressText,
        map: addressText.length > 0 ? "Yes" : "No",
        clientName: task.client_name || "-",
        assignedToName: userName,
        status: task.status
      };
    });

    let finalResult = formatted;
    if (search) {
      const s = search.toLowerCase();
      finalResult = formatted.filter(t => 
        (t.title && t.title.toLowerCase().includes(s)) ||
        (t.clientName && t.clientName.toLowerCase().includes(s)) ||
        (t.pincode && t.pincode.includes(s)) ||
        (t.assignedToName && t.assignedToName.toLowerCase().includes(s))
      );
    }
    res.json(finalResult);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/tasks", async (req, res) => {
  try {
    const { title, pincode, address, mapUrl, map_url, notes, createdBy, createdByName, assignedTo, clientName, latitude, longitude } = req.body;
    const finalMapUrl = mapUrl || map_url || null;
    let finalLat = latitude, finalLng = longitude;
    
    if (finalMapUrl && (!finalLat || !finalLng)) {
      const coords = extractCoordinates(finalMapUrl);
      if (coords) { finalLat = coords.latitude; finalLng = coords.longitude; }
    }

    let initialStatus = "Unassigned";
    let finalAssignee = null;
    let assignedDate = null;

    if (assignedTo && assignedTo !== "Unassigned") {
      initialStatus = "Pending";
      finalAssignee = assignedTo;
      assignedDate = new Date().toISOString().split('T')[0];
    }

    const { data, error } = await supabase.from("tasks").insert([{
      title, pincode, address: address || finalMapUrl, map_url: finalMapUrl,
      latitude: finalLat, longitude: finalLng, notes,
      client_name: clientName, status: initialStatus,
      assigned_to: finalAssignee, assigned_date: assignedDate,
      created_by: createdBy,
    }]).select();

    if (error) throw error;
    await logActivity(createdBy, createdByName || "Admin", "TASK_CREATED", data[0].id, finalAssignee ? `Assigned to ${finalAssignee}` : "Unassigned Pool", req);
    res.json({ success: true, task: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, pincode, address, notes, status, assignedTo, clientName, mapUrl, userId, userName } = req.body;
    const updateData = { updated_at: new Date() };

    if (title) updateData.title = title;
    if (pincode) updateData.pincode = pincode;
    if (address) updateData.address = address;
    if (clientName) updateData.client_name = clientName;
    if (notes) updateData.notes = notes;
    if (mapUrl) updateData.map_url = mapUrl;
    if (status) {
      updateData.status = status;
      if (status === 'Completed') updateData.completed_at = new Date();
      if (status === 'Verified') updateData.verified_at = new Date();
    }
    if (assignedTo) {
        updateData.assigned_to = assignedTo;
        if (status === "Unassigned") updateData.status = "Pending";
    }

    const { error } = await supabase.from("tasks").update(updateData).eq("id", id);
    if (error) throw error;
    if (userId) await logActivity(userId, userName, "TASK_UPDATED", id, "Details updated", req);
    res.json({ success: true, message: "Updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed" });
  }
});

app.get("/api/tasks/unassigned", async (req, res) => {
  try {
    const { data, error } = await supabase.from("tasks").select("*").eq("status", "Unassigned").order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// NEW: UNASSIGN TASK (Move back to pool)
// ═══════════════════════════════════════════════════════════════════════════
app.post("/api/tasks/:taskId/unassign", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userId, userName } = req.body;

    await supabase.from("tasks").update({
      assigned_to: null,
      status: "Unassigned",
      updated_at: new Date()
    }).eq("id", taskId);

    await logActivity(userId, userName, "TASK_UNASSIGNED", taskId, "Moved to unassigned pool", req);
    res.json({ success: true, message: "Task moved to unassigned pool" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// NEW: REASSIGN TASK (Change employee)
// ═══════════════════════════════════════════════════════════════════════════
app.put("/api/tasks/:taskId/reassign", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { newEmployeeId, userId, userName } = req.body;

    if (!newEmployeeId) {
      return res.status(400).json({ success: false, message: "Employee ID required" });
    }

    const { data: employee } = await supabase
      .from("users")
      .select("name")
      .eq("id", newEmployeeId)
      .single();

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    await supabase.from("tasks").update({
      assigned_to: newEmployeeId,
      assigned_date: new Date().toISOString().split('T')[0],
      status: "Pending",
      updated_at: new Date()
    }).eq("id", taskId);

    await logActivity(userId, userName, "TASK_REASSIGNED", taskId, `Reassigned to ${employee.name}`, req);
    res.json({ success: true, message: `Reassigned to ${employee.name}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId, adminName } = req.query;
    await supabase.from("tasks").delete().eq("id", id);
    if (adminId) await logActivity(adminId, adminName, "TASK_DELETED", id, "Deleted", req);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// BULK UPLOAD & EXPORT
// ═══════════════════════════════════════════════════════════════════════════

app.post("/api/tasks/bulk-upload", upload.single("excelFile"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file." });
    
    const { adminId, adminName } = req.body;
    const workbook = xlsx.readFile(req.file.path);
    const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    
    if (rawData.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: "Empty file." });
    }

    let successCount = 0;
    const tasksToInsert = [];
    
    for (let i = 0; i < rawData.length; i++) {
      const raw = rawData[i];
      const row = {};
      Object.keys(raw).forEach(k => row[k.toLowerCase().replace(/[^a-z0-9]/g, "")] = raw[k]);

      const title = row.requestid || row.caseid || row.title || row.id;
      const pincode = row.pincode || row.pin;
      
      if (!title || !pincode) continue; // Skip invalid rows
      
      let finalLat = row.latitude || row.lat;
      let finalLng = row.longitude || row.lng;
      
      if ((row.mapurl || row.map) && (!finalLat || !finalLng)) {
        const coords = extractCoordinates(row.mapurl || row.map);
        if (coords) { finalLat = coords.latitude; finalLng = coords.longitude; }
      }

      tasksToInsert.push({
        title: String(title),
        pincode: String(pincode).trim(),
        client_name: row.clientname || row.individualname || "Unknown Client",
        map_url: row.mapurl || row.map || null,
        address: row.address || null,
        latitude: finalLat || null,
        longitude: finalLng || null,
        notes: row.notes || null,
        status: "Unassigned",
        created_by: adminId || null
      });
      successCount++;
    }

    if (tasksToInsert.length > 0) {
      await supabase.from("tasks").insert(tasksToInsert);
    }

    fs.unlinkSync(req.file.path);
    await logActivity(adminId, adminName, "BULK_UPLOAD", null, `Uploaded ${successCount} tasks`, req);
    res.json({ success: true, message: `${successCount} tasks uploaded.`, successCount });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/export", async (req, res) => {
  try {
    const { status, employeeId, pincode } = req.query;
    let query = supabase.from("tasks").select("*").order("created_at", { ascending: false });
    if (status && status !== "all") query = query.eq("status", status);
    if (employeeId && employeeId !== "all") query = query.eq("assigned_to", parseInt(employeeId));
    if (pincode) query = query.eq("pincode", pincode);
    const { data: tasks } = await query;
    const { data: users } = await supabase.from("users").select("id, name, employee_id, email");
    
    // Enhanced CSV with ALL columns including SLA
    let csv = "CaseID,ClientName,Employee,EmployeeID,Email,Pincode,Status,AssignedDate,CompletedDate,";
    csv += "Latitude,Longitude,MapURL,Address,Notes,SLAStatus,CreatedAt\n";
    
    tasks.forEach(task => {
      const emp = users.find(u => u.id == task.assigned_to);
      
      // Calculate SLA (72 hours target)
      let slaStatus = "N/A";
      if (task.completed_at && task.assigned_date) {
        const assigned = new Date(task.assigned_date).getTime();
        const completed = new Date(task.completed_at).getTime();
        const hours = (completed - assigned) / (1000 * 60 * 60);
        slaStatus = hours <= 72 ? "On Time" : "Overdue";
      } else if (task.status === "Pending" && task.assigned_date) {
        const assigned = new Date(task.assigned_date).getTime();
        const now = new Date().getTime();
        const hours = (now - assigned) / (1000 * 60 * 60);
        slaStatus = hours <= 72 ? "In Progress" : "Overdue";
      }
      
      const escape = (str) => {
        if (!str) return "";
        const s = String(str);
        return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
      };
      
      csv += [
        escape(task.title),
        escape(task.client_name || ""),
        escape(emp ? emp.name : "Unassigned"),
        escape(emp ? emp.employee_id : ""),
        escape(emp ? emp.email : ""),
        escape(task.pincode || ""),
        escape(task.status),
        escape(task.assigned_date || ""),
        escape(task.completed_at || task.verified_at || ""),
        task.latitude || "",
        task.longitude || "",
        escape(task.map_url || ""),
        escape(task.address || ""),
        escape(task.notes || ""),
        escape(slaStatus),
        task.created_at ? new Date(task.created_at).toISOString() : ""
      ].join(",") + "\n";
    });
    
    res.header("Content-Type", "text/csv; charset=utf-8");
    res.header("Content-Disposition", `attachment; filename="validiant-export-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error("Export error:", err);
    res.status(500).send("Export failed.");
  }
});


app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    await supabase.from("contact_messages").insert([{ name, email, message, status: "new" }]);
    if (emailTransporter) {
       await sendEmail(process.env.EMAIL_USER, `Contact: ${name}`, `Message: ${message}`);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// TASK ACTIONS
// ═══════════════════════════════════════════════════════════════════════════

app.post("/api/tasks/:taskId/assign", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { employeeId, adminId, adminName } = req.body;
    const { data: employee } = await supabase.from("users").select("name").eq("id", employeeId).single();
    
    await supabase.from("tasks").update({
      assigned_to: employeeId,
      assigned_date: new Date().toISOString().split('T')[0],
      status: "Pending",
      updated_at: new Date()
    }).eq("id", taskId);

    await logActivity(adminId, adminName, "TASK_ASSIGNED", taskId, `Assigned to ${employee?.name}`, req);
    res.json({ success: true, message: "Assigned" });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.put("/api/tasks/:taskId/status", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, userId, userName } = req.body;
    const updateData = { status, updated_at: new Date() };
    if (status === 'Completed') updateData.completed_at = new Date();
    if (status === 'Verified') updateData.verified_at = new Date();

    await supabase.from("tasks").update(updateData).eq("id", taskId);
    await logActivity(userId, userName, `TASK_${status.toUpperCase()}`, taskId, null, req);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.get("/health", (req, res) => res.json({ status: "healthy", uptime: process.uptime() }));
app.get("/test", (req, res) => res.send("OK"));

// ═══════════════════════════════════════════════════════════════════════════
// SERVER STARTUP (Skipping HTML Routes)
// ═══════════════════════════════════════════════════════════════════════════

// Start keep-alive pings
let pingCount = 0;
function keepAlive() {
  pingCount++;
  http.get(`http://localhost:${PORT}/health`, (res) => {});
}

app.listen(PORT, HOST, () => {
  console.log(`✅ SERVER RUNNING ON PORT ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "production"}`);
  setInterval(keepAlive, 180000); // 3 minutes
});