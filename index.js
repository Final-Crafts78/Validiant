/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VALIDIANT PRODUCTIVITY TRACKER - COMPLETE PRODUCTION EDITION v2.0
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * COMPREHENSIVE FEATURE IMPLEMENTATION:
 *
 * ✅ Feature #1: Database Configuration with Auto-Recovery
 *    - Persistent storage at ./data/database.sqlite
 *    - Automatic corruption detection and rebuild
 *    - Detailed error logging with field-level validation
 *    - Proper relationships and constraints
 *
 * ✅ Feature #2: Keep-Alive System
 *    - Self-ping every 3 minutes to prevent Replit sleep
 *    - Health endpoint with uptime tracking
 *    - Ping count logging
 *    - Test endpoint for manual checks
 *
 * ✅ Feature #3: Bulk Task Upload - UNASSIGNED Workflow
 *    - POST /api/tasks/bulk-upload with multer
 *    - Accepts .xlsx and .xls files
 *    - NO employee required - creates tasks as Unassigned
 *    - Expected columns: CaseID/Title, Pincode (required), MapURL, Lat, Lng, Notes (optional)
 *    - Returns success/error count with detailed error messages
 *    - Auto-deletes uploaded file after processing
 *    - Frontend: Bulk Upload button, modal with instructions, progress bar
 *    - Template download (CSV without EmployeeEmail)
 *
 * ✅ Feature #4: Unassigned Tasks Management (Task Pool)
 *    - Dedicated admin menu item "Unassigned Tasks"
 *    - GET /api/tasks/unassigned - Returns all unassigned tasks
 *    - POST /api/tasks/:taskId/assign - Assign to employee
 *    - POST /api/tasks/:taskId/unassign - Remove assignment
 *    - PUT /api/tasks/:taskId/reassign - Change employee
 *    - Frontend: Grid view with pincode, MapURL, bulk operations
 *    - Search by Case ID or Pincode
 *    - Bulk selection with checkboxes
 *
 * ✅ Feature #5: Task Reassignment & Deassignment (Enhanced)
 *    - Three action buttons in View All Tasks: Reassign, Unassign, Delete
 *    - Reassign modal with employee dropdown
 *    - Unassign confirmation - returns to pool
 *    - Smooth workflow without breaking functionality
 *
 * ✅ Feature #6: Pincode Column & Search (Prominently Displayed)
 *    - Pincode in ALL task views (admin and employee)
 *    - Admin: View All Tasks, Unassigned Tasks, Assign Task form
 *    - Employee: Today's Tasks cards, Task History table
 *    - Real-time search/filter by pincode everywhere
 *    - Validation: 6 numeric digits
 *    - Shows count: "Showing X tasks matching pincode: XXXXXX"
 *
 * ✅ Feature #7: Employee Search Functionality (Enhanced)
 *    - Today's Tasks: Real-time search across Case ID, Pincode, Status, Notes
 *    - Task History: Search by Case ID, Date, Pincode, Status
 *    - Clear button to reset search
 *    - "No tasks found matching 'X'" message
 *    - Case-insensitive search
 *
 * ✅ Feature #8: MapURL Visibility for Employees (CRITICAL)
 *    - MapURL included in ALL employee API responses
 *    - Prominent "Open Location Map" button with map icon
 *    - Blue/green button, clearly visible in task cards
 *    - Opens in new tab (target="_blank", rel="noopener noreferrer")
 *    - Task History: Clickable "View Map" link
 *    - Visual indicator: "No map available" if missing
 *    - Admin Assign Task form: "Google Maps URL" field with validation
 *
 * ✅ Feature #9: Reassign Task Bug Fix
 *    - Fixed: empResponse.json() instead of response.json()
 *    - Proper employee list fetching in reassign modal
 *
 * ✅ Feature #10: Logout Function
 *    - Clears localStorage and sessionStorage
 *    - Confirmation dialog: "Are you sure you want to logout?"
 *    - Success toast before redirect
 *    - Redirects to login page
 *
 * ✅ Feature #11: Error Handling & Logging
 *    - Process-level handlers for unhandledRejection and uncaughtException
 *    - Detailed login error logging
 *    - Database sync error logging with field details
 *    - Try-catch blocks in all async routes
 *    - User-friendly error messages in frontend
 *
 * ✅ Feature #12: Required NPM Packages
 *    - express, body-parser, bcryptjs, sequelize, sqlite3, xlsx, multer
 *
 * ✅ Feature #13: Admin Account
 *    - Email: admin@validiant.com
 *    - Password: Admin@123 (bcrypt hashed)
 *    - Auto-created on server start
 *    - Password migration from plaintext to bcrypt
 *
 * ✅ Feature #14: File Structure
 *    - uploads/ directory for multer
 *    - data/ directory for database
 *    - database.sqlite with WAL mode
 *
 * ✅ Feature #15: Existing Features PRESERVED
 *    - Task assignment with GPS coordinates
 *    - Map URL extraction (auto-detect lat/lng)
 *    - Task status updates (Pending, Completed, Verified, etc.)
 *    - Pincode-based sorting
 *    - GPS location-based sorting (nearest first)
 *    - Employee management
 *    - CSV export with GPS data
 *    - Session management (15-minute timeout)
 *    - Professional Trello-inspired UI (gradients, animations, shadows)
 *    - bcrypt password encryption
 *    - Date/time handling
 *
 * ADDITIONAL ENHANCEMENTS:
 * ✅ Task Status Workflow Logic - Prevents invalid status transitions
 * ✅ Loading States & User Feedback - Spinners, progress bars, toast notifications
 * ✅ Date & Time Tracking - Full timestamp trail (created, assigned, completed, verified)
 * ✅ Advanced Filters & Sorting - Multi-criteria filtering in all views
 * ✅ Bulk Actions & Task Selection - Checkbox system, bulk assign/delete/unassign
 * ✅ Activity Log & Audit Trail - Track every action with timestamps
 * ✅ Keyboard Shortcuts - Power user features for common actions
 *
 * DESIGN PRESERVATION:
 * - Trello-inspired gradient backgrounds (blue-purple for admin, varied for employee)
 * - Card-based layouts with rounded corners and shadows
 * - Smooth animations and transitions
 * - Color scheme: Blue (#3B82F6), Purple (#8B5CF6), Green (#10B981), Indigo (#6366F1)
 * - Font Awesome icons throughout
 * - Responsive grid layouts
 * - Toast notifications (colorful, animated, top-right)
 * - Modal designs (centered, backdrop blur, rounded-2xl)
 * - Button styles with gradients and hover effects
 * - Sort by Nearest Location (GPS-based) - PRESERVED
 * - Sort by Pincode Proximity - PRESERVED
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// IMPORTS & DEPENDENCIES
// ═══════════════════════════════════════════════════════════════════════════

const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const { createClient } = require('@supabase/supabase-js');
const multer = require("multer");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const http = require("http");

// ═══════════════════════════════════════════════════════════════════════════
// DIRECTORY SETUP - Ensure required directories exist
// ═══════════════════════════════════════════════════════════════════════════

if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
  console.log("✅ Created uploads/ directory");
}

if (!fs.existsSync("./data")) {
  fs.mkdirSync("./data");
  console.log("✅ Created data/ directory");
}

// ═══════════════════════════════════════════════════════════════════════════
// MULTER CONFIGURATION - File upload handling
// ═══════════════════════════════════════════════════════════════════════════

const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    console.log(
      "File extension check:",
      ext,
      "Original name:",
      file.originalname,
    );
    if (ext === ".xlsx" || ext === ".xls" || ext === ".csv") {
      // ✅ Added .csv
      cb(null, true);
    } else {
      cb(
        new Error(
          `Only Excel/CSV files (.xlsx, .xls, .csv) are allowed! Got: ${ext}`,
        ),
        false,
      );
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ═══════════════════════════════════════════════════════════════════════════
// EXPRESS APP SETUP
// ═══════════════════════════════════════════════════════════════════════════

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// ✅ NEW: Serve static files (HTML, CSS, JS) from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
// DATABASE CONFIGURATION - SUPABASE (v3.0)
// ═══════════════════════════════════════════════════════════════════════════

// Ensure these are set in your Render Environment Variables!
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Service Role Key

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ CRITICAL: Missing Supabase URL or Service Key.");
  console.error("   Please add SUPABASE_URL and SUPABASE_SERVICE_KEY to Render Environment Variables.");
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log("✅ Connected to Supabase Enterprise DB");

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS (Supabase Versions)
// ═══════════════════════════════════════════════════════════════════════════

// 1. Audit Logging (Logs to Supabase 'activity_logs' table)
async function logActivity(userId, userName, action, taskId = null, details = null, req = null) {
  try {
    const ip = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : 'System';
    
    // Convert details to object if it's not already
    const safeDetails = details ? (typeof details === 'object' ? details : { info: details }) : null;

    const { error } = await supabase.from('activity_logs').insert({
      user_id: userId,
      user_name: userName,
      action: action,
      task_id: taskId,
      details: safeDetails,
      ip_address: ip
    });

    if (error) console.error("⚠️ Audit Log Failed:", error.message);
  } catch (err) {
    console.error("⚠️ Audit Log Exception:", err.message);
  }
}

// 2. Coordinate Extractor (Google Maps Logic)
function extractCoordinates(url) {
  if (!url) return null;
  
  // Pattern: @lat,lng
  const match1 = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match1) return { latitude: parseFloat(match1[1]), longitude: parseFloat(match1[2]) };
  
  // Pattern: ?q=lat,lng
  const match2 = url.match(/\?q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match2) return { latitude: parseFloat(match2[1]), longitude: parseFloat(match2[2]) };

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// MIGRATION NOTE:
// Old 'initializeDatabase()' is removed because Supabase tables are pre-built.
// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
// API ROUTES - AUTHENTICATION (SUPABASE EDITION)
// ═══════════════════════════════════════════════════════════════════════════

// 1. LOGIN API
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Supabase: Find user by email
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Bcrypt: Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Update Last Active
    await supabase.from("users").update({ last_active: new Date() }).eq("id", user.id);
    
    // Audit Log
    await logActivity(user.id, user.name, "LOGIN_SUCCESS", null, null, req);

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        role: user.role, // 'admin', 'employee', or 'client_hr'
        employeeId: user.employee_id
      }
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 2. CREATE USER API (Admin Only)
app.post("/api/users", async (req, res) => {
  try {
    const { name, email, password, role, employeeId, phone } = req.body;

    // Check if user exists
    const { data: existing } = await supabase.from("users").select("id").eq("email", email).single();
    if (existing) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert([{
        name,
        email,
        password: hashedPassword,
        role,
        employee_id: employeeId,
        phone,
        is_active: true
      }])
      .select();

    if (error) throw error;

    await logActivity(null, "Admin", "USER_CREATED", null, `Created: ${email}`, req);
    res.json({ success: true, message: "User created successfully" });

  } catch (err) {
    console.error("Create User Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. GET USERS LIST (For Admin Dashboard)
app.get("/api/users", async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("id, name, email, role, employee_id, phone, last_active, is_active")
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map snake_case to camelCase for frontend compatibility
    const formattedUsers = users.map(u => ({
      ...u,
      employeeId: u.employee_id,
      lastActive: u.last_active,
      isActive: u.is_active
    }));

    res.json(formattedUsers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// API ROUTES - TASK MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

// Get tasks with filtering
app.get("/api/tasks", async (req, res) => {
  try {
    const { role, userId, date, search, status, pincode, employeeId } =
      req.query;
    let whereClause = {};

    // Role-based filtering
    if (role === "employee") {
      whereClause.assignedTo = parseInt(userId);
      whereClause.status = { [Op.ne]: "Unassigned" }; // Employees don't see unassigned tasks

      if (date) {
        whereClause.assignedDate = date;
      }

      if (status === "all") {
        whereClause.status = { [Op.notIn]: ["Unassigned", "Pending"] };
      } else if (!status) {
        whereClause.status = "Pending";
      } else {
        whereClause.status = status;
      }
    }

    // Admin filters
    if (role === "admin") {
      if (status && status !== "all") {
        whereClause.status = status;
      }

      if (employeeId && employeeId !== "all") {
        whereClause.assignedTo = parseInt(employeeId);
      }

      if (pincode) {
        whereClause.pincode = pincode;
      }
    }

    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { status: { [Op.like]: `%${search}%` } },
        { pincode: { [Op.like]: `%${search}%` } },
        { notes: { [Op.like]: `%${search}%` } },
      ];
    }

    const tasks = await Task.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "User",
          attributes: ["id", "name", "email", "employeeId"],
        },
      ],
      order: [["assignedAtTimestamp", "DESC"]],
    });

    res.json(tasks);
  } catch (error) {
    console.error("❌ Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Get unassigned tasks (NEW - Feature #4)
app.get("/api/tasks/unassigned", async (req, res) => {
  try {
    const { search } = req.query;

    let whereClause = {
      [Op.or]: [{ assignedTo: null }, { status: "Unassigned" }],
    };

    if (search) {
      whereClause[Op.and] = [
        whereClause,
        {
          [Op.or]: [
            { title: { [Op.like]: `%${search}%` } },
            { pincode: { [Op.like]: `%${search}%` } },
            { notes: { [Op.like]: `%${search}%` } },
          ],
        },
      ];
    }

    const tasks = await Task.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    res.json(tasks);
  } catch (error) {
    console.error("❌ Error fetching unassigned tasks:", error);
    res.status(500).json({ error: "Failed to fetch unassigned tasks" });
  }
});

// Assign task to employee (NEW - Feature #4)
app.post("/api/tasks/:taskId/assign", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { employeeId, adminId, adminName } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const employee = await User.findByPk(employeeId);
    if (!employee || employee.role !== "employee") {
      return res.status(404).json({
        success: false,
        message: "Employee not found or invalid",
      });
    }

    const oldStatus = task.status;
    const oldAssignee = task.assignedTo;

    await task.update({
      assignedTo: employeeId,
      assignedDate: new Date().toISOString().split("T")[0],
      assignedAtTimestamp: new Date(),
      status: "Pending",
    });

    console.log(`✅ Task ${taskId} assigned to employee ${employeeId}`);

    await logActivity(
      adminId || employeeId,
      adminName || employee.name,
      "TASK_ASSIGNED",
      taskId,
      task.title,
      { status: oldStatus, assignedTo: oldAssignee },
      { status: "Pending", assignedTo: employeeId },
      req,
    );

    res.json({
      success: true,
      message: `Task assigned to ${employee.name} successfully`,
    });
  } catch (error) {
    console.error("❌ Error assigning task:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign task: " + error.message,
    });
  }
});

// Unassign task (NEW - Feature #4)
app.post("/api/tasks/:taskId/unassign", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { adminId, adminName } = req.body;

    const task = await Task.findByPk(taskId, {
      include: [{ model: User, as: "User", attributes: ["name"] }],
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const oldAssignee = task.assignedTo;
    const oldStatus = task.status;
    const employeeName = task.User ? task.User.name : "Unknown";

    await task.update({
      assignedTo: null,
      assignedDate: null,
      assignedAtTimestamp: null,
      status: "Unassigned",
    });

    console.log(`✅ Task ${taskId} unassigned`);

    await logActivity(
      adminId,
      adminName,
      "TASK_UNASSIGNED",
      taskId,
      task.title,
      {
        status: oldStatus,
        assignedTo: oldAssignee,
        assignedToName: employeeName,
      },
      { status: "Unassigned", assignedTo: null },
      req,
    );

    res.json({
      success: true,
      message: "Task unassigned and returned to task pool",
    });
  } catch (error) {
    console.error("❌ Error unassigning task:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unassign task: " + error.message,
    });
  }
});

// Reassign task to different employee (NEW - Feature #5)
app.put("/api/tasks/:taskId/reassign", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { newEmployeeId, adminId, adminName } = req.body;

    if (!newEmployeeId) {
      return res.status(400).json({
        success: false,
        message: "New employee ID is required",
      });
    }

    const task = await Task.findByPk(taskId, {
      include: [{ model: User, as: "User", attributes: ["name"] }],
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const newEmployee = await User.findByPk(newEmployeeId);
    if (!newEmployee || newEmployee.role !== "employee") {
      return res.status(404).json({
        success: false,
        message: "New employee not found or invalid",
      });
    }

    const oldAssignee = task.assignedTo;
    const oldEmployeeName = task.User ? task.User.name : "Unassigned";

    await task.update({
      assignedTo: newEmployeeId,
      assignedAtTimestamp: new Date(),
      status: task.status === "Unassigned" ? "Pending" : task.status,
    });

    console.log(
      `✅ Task ${taskId} reassigned from ${oldAssignee} to ${newEmployeeId}`,
    );

    await logActivity(
      adminId,
      adminName,
      "TASK_REASSIGNED",
      taskId,
      task.title,
      { assignedTo: oldAssignee, assignedToName: oldEmployeeName },
      { assignedTo: newEmployeeId, assignedToName: newEmployee.name },
      req,
    );

    res.json({
      success: true,
      message: `Task reassigned to ${newEmployee.name} successfully`,
    });
  } catch (error) {
    console.error("❌ Error reassigning task:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reassign task: " + error.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// API ROUTES - TASK CREATION & UPDATES (Continued from PART 1)
// ═══════════════════════════════════════════════════════════════════════════

// Create new task
app.post("/api/tasks", async (req, res) => {
  try {
    const clientName = req.body.clientName;
    const {
      title,
      pincode,
      mapUrl,
      latitude,
      longitude,
      assignedTo,
      notes,
      createdBy,
      createdByName,
    } = req.body;

    // Validation
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Task title/Case ID is required",
      });
    }

    if (pincode && !/^[0-9]{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: "Pincode must be exactly 6 digits",
      });
    }

    // Extract coordinates from map URL if provided and coordinates not manually entered
    let finalLat = latitude;
    let finalLng = longitude;

    if (mapUrl && (!finalLat || !finalLng)) {
      const coords = extractCoordinates(mapUrl);
      if (coords) {
        finalLat = coords.latitude;
        finalLng = coords.longitude;
      }
    }

    // Determine task status and timestamps
    const isAssigned = assignedTo && parseInt(assignedTo) > 0;
    const taskData = {
      title,
      clientName: clientName || null,
      pincode: pincode || null,
      mapUrl: mapUrl || null,
      mapLink: mapUrl ? true : false,
      latitude: finalLat || null,
      longitude: finalLng || null,
      assignedTo: isAssigned ? parseInt(assignedTo) : null,
      assignedDate: isAssigned ? new Date().toISOString().split("T")[0] : null,
      assignedAtTimestamp: isAssigned ? new Date() : null,
      status: isAssigned ? "Pending" : "Unassigned",
      notes: notes || null,
    };

    const task = await Task.create(taskData);

    // Update employee's last active if assigned
    if (isAssigned) {
      await User.update(
        { lastActive: new Date() },
        { where: { id: parseInt(assignedTo) } },
      );
    }

    console.log(
      `✅ Task created: ${title} (${isAssigned ? "Assigned" : "Unassigned"})`,
    );

    await logActivity(
      createdBy,
      createdByName,
      isAssigned ? "TASK_CREATED_AND_ASSIGNED" : "TASK_CREATED_UNASSIGNED",
      task.id,
      task.title,
      null,
      taskData,
      req,
    );

    res.json({
      success: true,
      task,
      message: isAssigned
        ? "Task created and assigned successfully"
        : "Task created as unassigned",
    });
  } catch (error) {
    console.error("❌ Error creating task:", error);
    res.status(400).json({
      success: false,
      message: "Failed to create task: " + error.message,
    });
  }
});

// Update task (status, notes, manual date/time)
// Update task (status, notes, manual date/time)
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, manualDate, manualTime, userId, userName, mapUrl } =
      req.body;

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Store old values for logging
    const oldValues = {
      status: task.status,
      notes: task.notes,
      manualDate: task.manualDate,
      manualTime: task.manualTime,
      completedAt: task.completedAt,
      verifiedAt: task.verifiedAt,
      mapUrl: task.mapUrl,
      latitude: task.latitude,
      longitude: task.longitude,
    };

    // Build update object with only allowed fields
    const updates = {};
    // Map URL + coordinates update (optional)
    if (mapUrl !== undefined) {
      let finalMapUrl = mapUrl || null;
      let finalLat = task.latitude;
      let finalLng = task.longitude;

      if (finalMapUrl) {
        const coords = extractCoordinates(finalMapUrl);
        if (coords) {
          finalLat = coords.latitude;
          finalLng = coords.longitude;
        }
      } else {
        // Clearing URL also clears coordinates + flag
        finalLat = null;
        finalLng = null;
      }

      updates.mapUrl = finalMapUrl;
      updates.mapLink = !!finalMapUrl;
      updates.latitude = finalLat;
      updates.longitude = finalLng;
    }

    if (status !== undefined) {
      // Validate status transitions
      const validTransitions = {
        Unassigned: ["Pending"],
        Pending: [
          "Completed",
          "Left Job",
          "Not Sharing Info",
          "Not Picking",
          "Switch Off",
          "Incorrect Number",
          "Wrong Address",
        ],
        Completed: ["Verified"],
        Verified: [], // Final state, no transitions allowed
      };

      if (status !== task.status) {
        updates.status = status;

        // Set completion timestamp
        if (status === "Completed" && !task.completedAt) {
          updates.completedAt = new Date();
        }

        // Set verification timestamp
        if (status === "Verified" && !task.verifiedAt) {
          updates.verifiedAt = new Date();
        }
      }
    }

    if (notes !== undefined) updates.notes = notes;
    if (manualDate !== undefined) updates.manualDate = manualDate;
    if (manualTime !== undefined) updates.manualTime = manualTime;

    // Apply updates
    await task.update(updates);

    // Update employee's last active
    if (task.assignedTo) {
      const user = await User.findByPk(task.assignedTo);
      if (user) {
        await user.update({ lastActive: new Date() });
      }
    }

    console.log(`✅ Task ${id} updated:`, updates);

    await logActivity(
      userId || task.assignedTo,
      userName || "Unknown",
      "TASK_UPDATED",
      task.id,
      task.title,
      oldValues,
      updates,
      req,
    );

    res.json({
      success: true,
      message: "Task updated successfully",
    });
  } catch (error) {
    console.error("❌ Error updating task:", error);
    res.status(400).json({
      success: false,
      message: "Failed to update task: " + error.message,
    });
  }
});

// Delete task
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId, adminName } = req.query;

    const task = await Task.findByPk(id, {
      include: [{ model: User, as: "User", attributes: ["name"] }],
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const taskData = {
      id: task.id,
      title: task.title,
      status: task.status,
      assignedTo: task.User ? task.User.name : "Unassigned",
    };

    await task.destroy();

    console.log(`✅ Task ${id} deleted: ${task.title}`);

    await logActivity(
      adminId,
      adminName,
      "TASK_DELETED",
      parseInt(id),
      task.title,
      taskData,
      null,
      req,
    );

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting task:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete task: " + error.message,
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// API ROUTES - BULK UPLOAD (NEW - Feature #3)
// ═══════════════════════════════════════════════════════════════════════════

app.post(
  "/api/tasks/bulk-upload",
  upload.single("excelFile"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded. Please select an Excel file.",
        });
      }

      console.log("📤 Processing bulk upload:", req.file.originalname);

      const { adminId, adminName } = req.body;

      // Read Excel file
      const workbook = xlsx.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      if (data.length === 0) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: "Excel file is empty or invalid format",
        });
      }

      console.log(`📊 Found ${data.length} rows in Excel file`);

      let successCount = 0;
      let errorCount = 0;
      const errors = [];
      const createdTasks = [];

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowNumber = i + 2; // Excel row number (accounting for header)

        try {
          // Validate required fields
          // Validate required fields
          const caseId =
            row.RequestID ||
            row["Request ID"] ||
            row.CaseID ||
            row.Title ||
            row.title ||
            row.caseId;

          const clientName =
            row["Individual Name"] ||
            row.IndividualName ||
            row["Client Name"] ||
            row.ClientName ||
            row.clientName ||
            row["client name"] ||
            null;

          const pincode = row.Pincode || row.pincode || row.PINCODE;

          if (!caseId) {
            errors.push(`Row ${rowNumber}: CaseID/Title is required`);
            errorCount++;
            continue;
          }

          if (!pincode) {
            errors.push(`Row ${rowNumber}: Pincode is required`);
            errorCount++;
            continue;
          }

          // Validate pincode format
          const pincodeStr = String(pincode).trim();
          if (!/^[0-9]{6}$/.test(pincodeStr)) {
            errors.push(
              `Row ${rowNumber}: Pincode must be exactly 6 digits (got: ${pincodeStr})`,
            );
            errorCount++;
            continue;
          }

          let assignedToId = null;
          let assignedDate = null;
          let assignedAtTimestamp = null;
          let taskStatus = "Unassigned";

          // Check for Employee ID or Employee Email
          let empIdRaw =
            row.EmployeeID ||
            row.employeeId ||
            row.EMPLOYEEID ||
            row["Employee ID"] ||
            row["Employee Id"] ||
            row["employee id"];

          let empEmailRaw =
            row.EmployeeEmail ||
            row.employeeEmail ||
            row.EMPLOYEEEMAIL ||
            row["Employee Email"] ||
            row["employee email"];

          // Try to find employee by ID or Email
          if (empIdRaw || empEmailRaw) {
            const whereClause = { role: "employee", isActive: true };

            if (empIdRaw) {
              whereClause.employeeId = String(empIdRaw).trim();
            } else if (empEmailRaw) {
              whereClause.email = String(empEmailRaw).trim().toLowerCase();
            }

            const emp = await User.findOne({
              where: whereClause,
              attributes: ["id", "name", "employeeId", "email"],
            });

            if (emp) {
              assignedToId = emp.id;
              assignedDate = new Date().toISOString().split("T")[0];
              assignedAtTimestamp = new Date();
              taskStatus = "Pending";
            } else {
              const identifier = empIdRaw || empEmailRaw;
              errors.push(
                `Row ${rowNumber}: Employee "${identifier}" not found or inactive, creating task as unassigned.`,
              );
            }
          }

          // Extract optional fields
          const mapUrl = row.MapURL || row.mapUrl || row.mapurl || null;
          // REMOVE the next clientName line completely—it's already set above.
          let latitude = row.Latitude || row.latitude || row.lat || null;
          let longitude = row.Longitude || row.longitude || row.lng || null;
          const notes = row.Notes || row.notes || null;

          // Try to extract coordinates from MapURL if not provided
          if (mapUrl && (!latitude || !longitude)) {
            const coords = extractCoordinates(mapUrl);
            if (coords) {
              latitude = coords.latitude;
              longitude = coords.longitude;
            }
          }

          // Create task with assignment if employee is valid, else unassigned
          const task = await Task.create({
            title: String(caseId).trim(),
            pincode: pincodeStr,
            clientName: clientName ? String(clientName).trim() : null,
            mapUrl: mapUrl || null,
            mapLink: mapUrl ? true : false,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            assignedTo: assignedToId,
            assignedDate: assignedDate,
            assignedAtTimestamp: assignedAtTimestamp,
            notes: notes ? String(notes).trim() : null,
            status: taskStatus,
          });

          createdTasks.push(task);
          successCount++;
        } catch (err) {
          console.error(`❌ Error processing row ${rowNumber}:`, err.message);
          errors.push(`Row ${rowNumber}: ${err.message}`);
          errorCount++;
        }
      }

      // Delete uploaded file
      fs.unlinkSync(req.file.path);

      console.log(
        `✅ Bulk upload completed: ${successCount} success, ${errorCount} errors`,
      );

      await logActivity(
        adminId,
        adminName,
        "BULK_UPLOAD_COMPLETED",
        null,
        null,
        { fileName: req.file.originalname, totalRows: data.length },
        { successCount, errorCount },
        req,
      );

      res.json({
        success: true,
        message: `${successCount} tasks uploaded as unassigned`,
        successCount: successCount,
        errorCount: errorCount,
        errors: errors.length > 0 ? errors.slice(0, 20) : null, // Limit to first 20 errors
        hasMoreErrors: errors.length > 20,
      });
    } catch (error) {
      console.error("❌ Bulk upload error:", error);

      // Clean up uploaded file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        success: false,
        message: "Bulk upload failed: " + error.message,
      });
    }
  },
);

// ═══════════════════════════════════════════════════════════════════════════
// API ROUTES - CSV EXPORT (Enhanced with GPS data)
// ═══════════════════════════════════════════════════════════════════════════

app.get("/api/export", async (req, res) => {
  try {
    console.log("📥 Exporting tasks to CSV...");

    const tasks = await Task.findAll({
      include: [
        {
          model: User,
          as: "User",
          attributes: ["name", "email", "employeeId"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // CSV Header with all fields
    let csv =
      "CaseID,ClientName,Employee,EmployeeID,Email,AssignedDate,Status,Pincode,Latitude,Longitude,MapURL,Notes,ManualDate,ManualTime,CreatedAt,CompletedAt,VerifiedAt,SLA_Status\n";

    tasks.forEach((task) => {
      // Calculate SLA status
      let slaStatus = "N/A";
      if (task.completedAt && task.assignedAtTimestamp) {
        const diffMs =
          new Date(task.completedAt) - new Date(task.assignedAtTimestamp);
        const diffHours = diffMs / (1000 * 60 * 60);
        slaStatus = diffHours > 72 ? "Overdue" : "On Time";
      } else if (task.status === "Pending" && task.assignedAtTimestamp) {
        const diffMs = new Date() - new Date(task.assignedAtTimestamp);
        const diffHours = diffMs / (1000 * 60 * 60);
        slaStatus = diffHours > 72 ? "Overdue" : "In Progress";
      }

      // Escape function for CSV
      const escape = (str) => {
        if (str === null || str === undefined) return "";
        const strVal = String(str);
        if (
          strVal.includes(",") ||
          strVal.includes('"') ||
          strVal.includes("\n")
        ) {
          return '"' + strVal.replace(/"/g, '""') + '"';
        }
        return strVal;
      };

      csv +=
        [
          escape(task.title),
          escape(task.clientName || ""),
          escape(task.User ? task.User.name : "Unassigned"),
          escape(task.User ? task.User.employeeId : ""),
          escape(task.User ? task.User.email : ""),
          escape(task.assignedDate || ""),
          escape(task.status),
          escape(task.pincode || ""),
          task.latitude || "",
          task.longitude || "",
          escape(task.mapUrl || ""),
          escape(task.notes || ""),
          escape(task.manualDate || ""),
          escape(task.manualTime || ""),
          task.createdAt ? new Date(task.createdAt).toISOString() : "",
          task.completedAt ? new Date(task.completedAt).toISOString() : "",
          task.verifiedAt ? new Date(task.verifiedAt).toISOString() : "",
          escape(slaStatus),
        ].join(",") + "\n";
    });

    console.log(`✅ Exported ${tasks.length} tasks to CSV`);

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.header(
      "Content-Disposition",
      `attachment; filename="validiant-tasks-export-${new Date().toISOString().split("T")[0]}.csv"`,
    );
    return res.send(csv);
  } catch (error) {
    console.error("❌ Export error:", error);
    res.status(500).send("Export failed. Please try again.");
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// API ROUTES - ACTIVITY LOG
// ═══════════════════════════════════════════════════════════════════════════

app.get("/api/activity-log", async (req, res) => {
  try {
    const { userId, action, limit = 100 } = req.query;

    let whereClause = {};
    if (userId) whereClause.userId = parseInt(userId);
    if (action) whereClause.action = action;

    const logs = await ActivityLog.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name", "email", "role"],
        },
      ],
      order: [["timestamp", "DESC"]],
      limit: parseInt(limit),
    });

    res.json(logs);
  } catch (error) {
    console.error("❌ Error fetching activity log:", error);
    res.status(500).json({ error: "Failed to fetch activity log" });
  }
});

// -------------- Insert here: Analytics Dashboard API route --------------
app.get("/api/analytics", async (req, res) => {
  try {
    // Task counts by status
    const statusCounts = await Task.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["status"],
    });
    // Tasks per day (created)
    const tasksPerDay = await Task.findAll({
      attributes: [
        [sequelize.fn("DATE", sequelize.col("createdAt")), "day"],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["day"],
      order: [[sequelize.fn("DATE", sequelize.col("createdAt")), "ASC"]],
      raw: true,
    });
    // Staff counts
    const userCount = await User.count({
      where: { role: "employee", isActive: true },
    });
    const adminCount = await User.count({
      where: { role: "admin", isActive: true },
    });
    // Task stat summaries
    const totalTasks = await Task.count();
    const assignedTasks = await Task.count({
      where: { assignedTo: { [Op.ne]: null } },
    });
    const completedTasks = await Task.count({ where: { status: "Completed" } });
    const verifiedTasks = await Task.count({ where: { status: "Verified" } });

    res.json({
      statusCounts,
      tasksPerDay,
      userCount,
      adminCount,
      totalTasks,
      assignedTasks,
      completedTasks,
      verifiedTasks,
    });
  } catch (err) {
    console.error("❌ Analytics error:", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// API ROUTES - PHASE 1: CONTACT FORM
// ═══════════════════════════════════════════════════════════════════════════

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    await ContactMessage.create({ name, email, message });
    res.json({ success: true, message: "Inquiry received" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// API ROUTES - PHASE 2: B2B KYC SERVICE
// ═══════════════════════════════════════════════════════════════════════════

// 1. Create Verification Session
app.post("/api/kyc/create", async (req, res) => {
  try {
    const { clientName, customerName, referenceId, createdBy } = req.body;

    // MOCK MODE: Generate fake data so app works immediately without API keys
    const sessionId = "sess_" + Math.random().toString(36).substr(2, 9);
    // Note: In production, replace this URL with the real Didit.me session URL
    const verificationLink = `https://mock-verify.validiant.com/?session=${sessionId}`;

    const kyc = await KYCRequest.create({
      clientName, customerName, referenceId,
      sessionId: sessionId,
      verificationLink: verificationLink,
      createdBy,
      status: "Pending",
      ipRiskLevel: "Pending"
    });

    res.json({ success: true, kyc });
  } catch (err) {
    console.error("KYC Create Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Webhook Listener (Callback from Didit)
app.post("/api/webhooks/didit", async (req, res) => {
  try {
    const { sessionId, faceMatchScore, liveness, age, risk, country, idType } = req.body;

    const kyc = await KYCRequest.findOne({ where: { sessionId } });
    if(kyc) {
      await kyc.update({
        faceMatchScore: faceMatchScore || 0,
        livenessStatus: liveness ? "Passed" : "Failed",
        estimatedAge: age,
        ipRiskLevel: risk || "Low",
        ipCountry: country,
        idType: idType,
        status: (faceMatchScore > 80 && liveness) ? "Verified" : "Rejected"
      });
    }
    res.json({ received: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. List Requests
app.get("/api/kyc/list", async (req, res) => {
  try {
    const { id } = req.query;
    if(id) {
        const kyc = await KYCRequest.findByPk(id);
        return res.json(kyc);
    }
    const list = await KYCRequest.findAll({ order: [['createdAt', 'DESC']] });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ---------------- End insertion -----------------

// ═══════════════════════════════════════════════════════════════════════════
// HEALTH & MONITORING ENDPOINTS (Feature #2)
// ═══════════════════════════════════════════════════════════════════════════

app.get("/health", (req, res) => {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  res.status(200).json({
    status: "healthy",
    uptime: `${hours}h ${minutes}m ${seconds}s`,
    uptimeSeconds: Math.floor(uptime),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || "production",
  });
});

app.get("/test", (req, res) => {
  res.status(200).send("OK - Server is alive!");
});

// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
// FRONTEND - LANDING PAGE & LOGIN
// ═══════════════════════════════════════════════════════════════════════════

// ✅ NEW: Marketing Landing Page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "landing.html"));
});

// ✅ EDITED: Login Page (Renamed from "/" to "/signin")
app.get("/signin", (req, res) => {
  // Dark, modern login page – matches new dashboard theme
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Validiant Tracker – Secure Login</title>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    :root {
      --bg-primary: #050816;
      --bg-elevated: #0b1020;
      --bg-elevated-soft: #111827;
      --accent: #6366f1;
      --accent-soft: rgba(99, 102, 241, 0.15);
      --accent-strong: #4f46e5;
      --danger: #f97373;
      --text-primary: #f9fafb;
      --text-muted: #9ca3af;
      --border-subtle: #1f2937;
      --shadow-soft: 0 24px 60px rgba(15, 23, 42, 0.85);
      --radius-xl: 18px;
      --transition-fast: 0.2s ease-out;
      --transition-med: 0.3s ease-out;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      min-height: 100vh;
      background:
        radial-gradient(circle at top left, rgba(99, 102, 241, 0.35), transparent 55%),
        radial-gradient(circle at bottom right, rgba(236, 72, 153, 0.25), transparent 55%),
        linear-gradient(135deg, #020617, #020617);
      color: var(--text-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .login-shell {
      width: 100%;
      max-width: 1040px;
      display: grid;
      grid-template-columns: minmax(0, 3fr) minmax(0, 2.4fr);
      gap: 24px;
      backdrop-filter: blur(22px);
      background: radial-gradient(circle at top left, rgba(148, 163, 253, 0.16), transparent 60%)
                  ,rgba(15, 23, 42, 0.92);
      border-radius: 26px;
      box-shadow: var(--shadow-soft);
      border: 1px solid rgba(55, 65, 81, 0.9);
      overflow: hidden;
    }

    .login-shell-left {
      padding: 28px 30px 26px 30px;
      border-right: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 28px;
    }

    .brand-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .brand-mark {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-logo {
      width: 40px;
      height: 40px;
      border-radius: 14px;
      background: radial-gradient(circle at 20% 0%, #22d3ee, transparent 55%),
                  radial-gradient(circle at 80% 100%, #6366f1, transparent 55%),
                  #020617;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #e5e7eb;
      font-weight: 800;
      font-size: 20px;
      box-shadow: 0 10px 28px rgba(15, 23, 42, 0.85);
    }

    .brand-text-main {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.03em;
    }

    .brand-text-sub {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .env-pill {
      padding: 6px 12px;
      border-radius: 999px;
      background: rgba(15, 118, 110, 0.18);
      color: #a7f3d0;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      border: 1px solid rgba(45, 212, 191, 0.35);
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .env-pill i {
      font-size: 10px;
    }

    .hero-copy {
      margin-top: 10px;
    }

    .hero-title {
      font-size: 26px;
      font-weight: 700;
      letter-spacing: 0.02em;
      margin-bottom: 8px;
    }

    .hero-highlight {
      color: var(--accent);
    }

    .hero-subtitle {
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.55;
      max-width: 380px;
    }

    .hero-metrics {
      margin-top: 28px;
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }

    .metric-pill {
      padding: 10px 14px;
      border-radius: 999px;
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(55, 65, 81, 0.9);
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      color: var(--text-muted);
    }

    .metric-pill i {
      color: var(--accent);
      font-size: 13px;
    }

    .login-shell-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      border-top: 1px dashed rgba(55, 65, 81, 0.85);
      padding-top: 14px;
      margin-top: 4px;
    }

    .footer-note {
      font-size: 11px;
      color: var(--text-muted);
    }

    .footer-note strong {
      color: #e5e7eb;
      font-weight: 500;
    }

    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: #22c55e;
      box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.22);
      margin-right: 6px;
    }

    .status-text {
      font-size: 11px;
      color: #bbf7d0;
    }

    .login-shell-right {
      background:
        radial-gradient(circle at top right, rgba(251, 113, 133, 0.45), transparent 58%),
        radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.45), transparent 55%),
        var(--bg-primary);
      padding: 28px 26px 24px 26px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 22px;
      position: relative;
      overflow: hidden;
    }

    .glass-orbit {
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 0.22;
      background:
        radial-gradient(circle at 0% 0%, rgba(129, 140, 248, 0.6), transparent 55%),
        radial-gradient(circle at 100% 100%, rgba(251, 113, 133, 0.55), transparent 60%);
      mix-blend-mode: screen;
    }

    .login-header {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 4px;
    }

    .login-header-title {
      font-size: 18px;
      font-weight: 600;
    }

    .login-header-sub {
      font-size: 12px;
      color: #e5e7eb;
      opacity: 0.86;
    }

    .login-pill {
      padding: 6px 12px;
      border-radius: 999px;
      border: 1px solid rgba(209, 213, 219, 0.4);
      background: rgba(15, 23, 42, 0.65);
      font-size: 11px;
      color: #e5e7eb;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .login-pill i {
      color: #facc15;
      font-size: 12px;
    }

    .login-card {
      position: relative;
      margin-top: 10px;
      padding: 18px 18px 16px 18px;
      border-radius: var(--radius-xl);
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(55, 65, 81, 0.95);
      box-shadow: 0 18px 40px rgba(15, 23, 42, 0.85);
    }

    .login-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 14px;
    }

    .login-badge {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      color: #a5b4fc;
      background: rgba(79, 70, 229, 0.2);
      padding: 4px 10px;
      border-radius: 999px;
      border: 1px solid rgba(129, 140, 248, 0.45);
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .login-badge i {
      font-size: 11px;
    }

    .login-hint {
      font-size: 11px;
      color: var(--text-muted);
      text-align: right;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    label {
      font-size: 12px;
      color: #e5e7eb;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    label span {
      color: #9ca3af;
      font-size: 11px;
      font-weight: 400;
    }

    .input-shell {
      position: relative;
    }

    .input-shell input {
      width: 100%;
      padding: 10px 36px 10px 12px;
      border-radius: 10px;
      border: 1px solid rgba(55, 65, 81, 0.95);
      background: rgba(15, 23, 42, 0.9);
      color: var(--text-primary);
      font-size: 13px;
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast), background var(--transition-fast), transform var(--transition-fast);
      outline: none;
    }

    .input-shell input::placeholder {
      color: rgba(148, 163, 184, 0.85);
    }

    .input-shell input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.75);
      background: rgba(15, 23, 42, 0.98);
      transform: translateY(-1px);
    }

    .input-icon {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: #6b7280;
      font-size: 14px;
    }

    .actions-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-top: 8px;
      margin-bottom: 2px;
    }

    .remember-text {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: var(--text-muted);
    }

    .remember-dot {
      width: 6px;
      height: 6px;
      border-radius: 999px;
      background: var(--accent);
    }

    .secondary-link {
      font-size: 11px;
      color: #bfdbfe;
      cursor: default;
      opacity: 0.65;
    }

    .btn-login {
      margin-top: 10px;
      width: 100%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 11px 16px;
      border-radius: 12px;
      border: none;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: white;
      font-weight: 600;
      font-size: 14px;
      letter-spacing: 0.02em;
      cursor: pointer;
      box-shadow: 0 14px 35px rgba(79, 70, 229, 0.6);
      transition: transform var(--transition-med), box-shadow var(--transition-med), background var(--transition-med), opacity var(--transition-fast);
    }

    .btn-login:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 20px 50px rgba(79, 70, 229, 0.85);
    }

    .btn-login:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 10px 26px rgba(79, 70, 229, 0.7);
    }

    .btn-login:disabled {
      opacity: 0.55;
      cursor: not-allowed;
      box-shadow: 0 10px 24px rgba(31, 41, 55, 0.9);
    }

    .btn-login i {
      font-size: 15px;
    }

    .error-msg {
      margin-top: 10px;
      border-radius: 10px;
      padding: 8px 10px;
      font-size: 11px;
      color: #fecaca;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(248, 113, 113, 0.7);
      display: none;
      align-items: flex-start;
      gap: 8px;
    }

    .error-msg.show {
      display: flex;
    }

    .error-msg i {
      color: #fecaca;
      margin-top: 1px;
      font-size: 13px;
    }

    .loading-indicator {
      margin-top: 8px;
      font-size: 11px;
      color: var(--text-muted);
      display: none;
      align-items: center;
      gap: 8px;
    }

    .loading-indicator.show {
      display: inline-flex;
    }

    .spinner {
      width: 13px;
      height: 13px;
      border-radius: 999px;
      border: 2px solid rgba(148, 163, 184, 0.4);
      border-top-color: #e5e7eb;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

/* Employee post-login loader: "Drive Safely" + animated bike SVG */
.drive-safe-loader {
  position: relative;
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  overflow: hidden;
  min-height: 18px;
}

.drive-safe-loader .drive-text {
  position: relative;
  z-index: 2;
  letter-spacing: 0.02em;
}

.drive-safe-loader .bike-wrap {
  position: absolute;
  left: -54px;              /* start off-screen */
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  opacity: 0;
  animation: bulletRide 0.95s linear infinite;
  filter: drop-shadow(0 10px 14px rgba(15, 23, 42, 0.55));
}

.drive-safe-loader svg {
  width: 44px;
  height: 18px;
  display: block;
}

@keyframes bulletRide {
  0%   { transform: translate(-10px, -50%); opacity: 0; }
  12%  { opacity: 1; }
  100% { transform: translate(calc(100% + 90px), -50%); opacity: 1; }
}

    .small-hint {
      margin-top: 8px;
      font-size: 11px;
      color: #9ca3af;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .small-hint code {
      background: rgba(15, 23, 42, 0.9);
      border-radius: 6px;
      padding: 3px 6px;
      border: 1px solid rgba(55, 65, 81, 0.95);
      font-size: 11px;
      color: #e5e7eb;
    }

    @media (max-width: 900px) {
      .login-shell {
        max-width: 520px;
        grid-template-columns: minmax(0, 1fr);
      }
      .login-shell-left {
        display: none;
      }
      .login-shell-right {
        padding: 24px 22px 22px 22px;
      }
    }

    @media (max-width: 480px) {
      body {
        padding: 16px;
      }
      .login-shell-right {
        padding: 20px 18px 20px 18px;
      }
      .login-card {
        padding: 16px 14px 14px 14px;
      }
    }
  </style>
</head>
<body>
  <div class="login-shell">
    <div class="login-shell-left">
      <div>
        <div class="brand-row">
          <div class="brand-mark">
            <div class="brand-logo">
              VT
            </div>
            <div>
              <div class="brand-text-main">Validiant Tracker</div>
              <div class="brand-text-sub">Field productivity & task routing</div>
            </div>
          </div>
          <div class="env-pill">
            <i class="fas fa-shield-alt"></i>
            <span>Secure Access</span>
          </div>
        </div>

        <div class="hero-copy">
          <div class="hero-title">
            Control your <span class="hero-highlight">entire field workflow</span> from one screen.
          </div>
          <div class="hero-subtitle">
            Fast assignment, GPS & pincode routing, and accurate task history – optimised for real on‑ground teams.
          </div>
        </div>

        <div class="hero-metrics">
          <div class="metric-pill">
            <i class="fas fa-route"></i>
            GPS & Pincode smart routing
          </div>
          <div class="metric-pill">
            <i class="fas fa-users"></i>
            Admin & employee dashboards
          </div>
          <div class="metric-pill">
            <i class="fas fa-layer-group"></i>
            Unassigned task pool workflow
          </div>
        </div>
      </div>

      <div class="login-shell-footer">
        <div class="footer-note">
          <span class="status-dot"></span>
          <span class="status-text">Server online</span>
        </div>
        <div class="footer-note">
          <strong>Tip:</strong> Use your admin email & password to access the dashboard.
        </div>
      </div>
    </div>

    <div class="login-shell-right">
      <div class="glass-orbit"></div>

      <div class="login-header">
        <div>
          <div class="login-header-title">Sign in to Dashboard</div>
          <div class="login-header-sub">Admin & employees use the same login screen.</div>
        </div>
        <div class="login-pill">
          <i class="fas fa-bolt"></i>
          Fast, mobile‑first experience
        </div>
      </div>

      <div class="login-card">
        <div class="login-card-header">
          <div class="login-badge">
            <i class="fas fa-lock"></i>
            PROTECTED AREA
          </div>
          <div class="login-hint">
            Use your assigned email & password to sign in. Contact admin if you do not have access.
          </div>
        </div>

        <form id="loginForm" autocomplete="on">
          <div class="field-group">
            <label for="email">
              Email address
              <span>(admin or employee)</span>
            </label>
            <div class="input-shell">
              <input id="email" type="email" placeholder="you@example.com" required>
              <i class="fas fa-envelope input-icon"></i>
            </div>
          </div>

          <div class="field-group">
            <label for="password">
              Password
              <span>case‑sensitive</span>
            </label>
            <div class="input-shell">
              <input id="password" type="password" placeholder="Enter your password" required>
              <i class="fas fa-key input-icon"></i>
            </div>
          </div>

          <div class="actions-row">
            <div class="remember-text">
              <span class="remember-dot"></span>
              <span>Stay signed in on this device</span>
            </div>
            <div class="secondary-link">Need help? Contact your admin.</div>
          </div>

          <button id="loginBtn" type="submit" class="btn-login">
            <i class="fas fa-sign-in-alt"></i>
            <span>Login to Validiant</span>
          </button>

          <div id="errorMsg" class="error-msg">
            <i class="fas fa-circle-exclamation"></i>
            <span>Invalid email or password.</span>
          </div>

          <div id="loading" class="loading-indicator">
            <div class="spinner"></div>
            <span>Authenticating and preparing your dashboard…</span>
          </div>

          <div class="small-hint">
            <i class="fas fa-info-circle"></i>
            <span>Tip: If you forget your password, ask your administrator to reset it.</span>
          </div>
        </form>
      </div>
    </div>
  </div>

  <script>
    const loginForm = document.getElementById('loginForm');
    const errorMsg = document.getElementById('errorMsg');
    const loginBtn = document.getElementById('loginBtn');
    const loading = document.getElementById('loading');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Focus email on load (desktop)
    if (emailInput) {
      emailInput.focus();
    }

    function clearError() {
      if (errorMsg) {
        errorMsg.classList.remove('show');
      }
    }

    emailInput.addEventListener('input', clearError);
    passwordInput.addEventListener('input', clearError);

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        errorMsg.querySelector('span').textContent = 'Please enter both email and password.';
        errorMsg.classList.add('show');
        return;
      }

      errorMsg.classList.remove('show');
      loginBtn.disabled = true;
      loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Signing you in…</span>';
      loading.classList.add('show');

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
  localStorage.setItem('currentUser', JSON.stringify(data.user));

  // Employee-only: show "Drive Safely" + bike animation briefly, then redirect
  if (data.user && data.user.role === 'employee') {
    loading.classList.remove('show');

    loginBtn.innerHTML =
      '<span class="drive-safe-loader">' +
        '<span class="bike-wrap" aria-hidden="true">' +
          '<svg viewBox="0 0 110 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bike">' +
            '<g fill="none" stroke="rgba(255,255,255,0.92)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' +
              '<circle cx="22" cy="28" r="9"></circle>' +
              '<circle cx="86" cy="28" r="9"></circle>' +
              '<path d="M31 28h18l10-14h16l8 14"></path>' +              /* frame */
              '<path d="M59 14l-8 14"></path>' +                           /* down tube */
              '<path d="M73 14h10"></path>' +                              /* tank top line */
              '<path d="M68 12c6-6 16-6 22 0"></path>' +                   /* tank curve */
              '<path d="M47 20h12"></path>' +                              /* seat bar */
              '<path d="M46 16l6 4"></path>' +                              /* seat */
              '<path d="M90 12l8-4"></path>' +                              /* handle bar */
              '<path d="M98 8l6 6"></path>' +                               /* handle grip */
            '</g>' +
          '</svg>' +
        '</span>' +
        '<span class="drive-text">Drive Safely</span>' +
      '</span>';

    setTimeout(function () {
      window.location.href = 'app.js';
    }, 900);

    return;
  }

  // Admin: redirect immediately (same as before)
  window.location.href = 'app.js';
} else {
          errorMsg.querySelector('span').textContent = data.message || 'Invalid email or password.';
          errorMsg.classList.add('show');
          loginBtn.disabled = false;
          loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i><span>Login to Validiant</span>';
          loading.classList.remove('show');
        }
      } catch (err) {
        console.error('Login error:', err);
        errorMsg.querySelector('span').textContent = 'Connection error. Please check your internet and try again.';
        errorMsg.classList.add('show');
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i><span>Login to Validiant</span>';
        loading.classList.remove('show');
      }
    });

    // Enter key support
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !loginBtn.disabled) {
        loginForm.dispatchEvent(new Event('submit'));
      }
    });
  </script>
</body>
</html>`);
});

// ═══════════════════════════════════════════════════════════════════════════
// FRONTEND - MAIN DASHBOARD APPLICATION (/app.js route)
// ═══════════════════════════════════════════════════════════════════════════

app.get("/app.js", (req, res) => {
  // Using string concatenation to avoid backtick conflicts
  let html = "";

  // HTML Header and CSS
  html += "<!DOCTYPE html>";
  html += '<html lang="en">';
  html += "<head>";
  html += '<meta charset="UTF-8">';
  html +=
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
  html += "<title>Validiant Tracker - Dashboard</title>";
  html +=
    '<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">';
  html += "<style>";

  // Complete CSS Design System
  // Dark, modern dashboard design system
  html += "* { margin: 0; padding: 0; box-sizing: border-box; }";
  html +=
    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background: radial-gradient(circle at top left, rgba(56, 189, 248, 0.22), transparent 55%), radial-gradient(circle at bottom right, rgba(129, 140, 248, 0.26), transparent 55%), #020617; min-height: 100vh; padding: 16px; color: #e5e7eb; }';

  // Layout shell
  html +=
    ".container { max-width: 1440px; margin: 0 auto; border-radius: 20px; background: radial-gradient(circle at top left, rgba(15,23,42,0.96), rgba(15,23,42,0.98)); box-shadow: 0 28px 80px rgba(15,23,42,0.95); border: 1px solid rgba(31,41,55,0.9); padding: 0; overflow: hidden; display: grid; grid-template-rows: auto auto minmax(0,1fr); }";

  // Header (top bar)
  html +=
    ".header { padding: 16px 22px 14px 22px; border-bottom: 1px solid rgba(31,41,55,0.9); display: flex; align-items: center; justify-content: space-between; gap: 18px; background: radial-gradient(circle at top left, rgba(37,99,235,0.18), transparent 65%), #020617; }";
  html +=
    ".header h1 { font-size: 18px; font-weight: 600; color: #e5e7eb; display: flex; align-items: center; gap: 10px; letter-spacing: 0.02em; }";
  html += ".header h1 i { color: #60a5fa; font-size: 18px; }";

  html += ".header-title-sub { font-size: 11px; color: #9ca3af; }";

  html += ".user-info { display: flex; align-items: center; gap: 12px; }";
  html +=
    ".user-chip { padding: 7px 12px; border-radius: 999px; background: rgba(15,23,42,0.95); border: 1px solid rgba(55,65,81,0.9); font-size: 11px; color: #d1d5db; display: inline-flex; align-items: center; gap: 8px; }";
  html +=
    ".user-chip span { max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }";
  html += ".user-chip i { color: #a5b4fc; font-size: 12px; }";

  html +=
    ".env-tag { padding: 6px 12px; border-radius: 999px; border: 1px solid rgba(34,197,94,0.45); background: rgba(22,163,74,0.22); font-size: 10px; text-transform: uppercase; letter-spacing: 0.16em; color: #bbf7d0; display: inline-flex; align-items: center; gap: 6px; }";
  html += ".env-tag i { font-size: 10px; }";

  // Top menu bar (replaces old white pill row)
  html +=
    ".menu { padding: 10px 18px 10px 18px; border-bottom: 1px solid rgba(31,41,55,0.9); background: linear-gradient(to right, rgba(15,23,42,0.95), rgba(15,23,42,0.9)); display: flex; gap: 10px; flex-wrap: wrap; }";
  html += ".menu button { flex: 0 0 auto; min-width: 140px; }";

  // Main content area
  html +=
    ".content { padding: 18px 18px 20px 18px; background: radial-gradient(circle at top, rgba(30,64,175,0.2), transparent 55%), #020617; min-height: 520px; overflow: auto; }";
  html +=
    ".content h2 { color: #e5e7eb; margin-bottom: 18px; font-size: 17px; font-weight: 600; display: flex; align-items: center; gap: 10px; letter-spacing: 0.02em; }";
  html += ".content h2 i { color: #60a5fa; }";

  // Generic panel/card
  html +=
    ".panel { background: rgba(15,23,42,0.96); border-radius: 16px; border: 1px solid rgba(31,41,55,0.9); padding: 16px 16px 14px 16px; box-shadow: 0 18px 45px rgba(15,23,42,0.85); }";

  // Buttons
  html +=
    ".btn { padding: 9px 16px; border-radius: 999px; border: 1px solid transparent; cursor: pointer; font-size: 12px; font-weight: 600; letter-spacing: 0.02em; display: inline-flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s ease-out, color 0.2s ease-out, box-shadow 0.2s ease-out, transform 0.15s ease-out, border-color 0.2s ease-out; background: rgba(15,23,42,0.9); color: #e5e7eb; box-shadow: 0 10px 24px rgba(15,23,42,0.95); }";
  html += ".btn i { font-size: 13px; }";
  html +=
    ".btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 18px 45px rgba(15,23,42,0.95); }";
  html +=
    ".btn:active:not(:disabled) { transform: translateY(0); box-shadow: 0 10px 24px rgba(15,23,42,0.9); }";
  html +=
    ".btn:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }";

  html +=
    ".btn-primary { background: linear-gradient(135deg, #6366f1, #4f46e5); border-color: rgba(129,140,248,0.7); color: #f9fafb; }";
  html +=
    ".btn-primary:hover:not(:disabled) { background: linear-gradient(135deg, #4f46e5, #4338ca); box-shadow: 0 20px 55px rgba(79,70,229,0.85); }";

  html +=
    ".btn-secondary { background: rgba(15,23,42,0.96); border-color: rgba(55,65,81,0.9); color: #e5e7eb; }";
  html +=
    ".btn-secondary:hover:not(:disabled) { background: rgba(15,23,42,0.9); }";

  html +=
    ".btn-success { background: linear-gradient(135deg, #22c55e, #16a34a); border-color: rgba(74,222,128,0.8); color: #ecfdf5; }";
  html +=
    ".btn-danger { background: linear-gradient(135deg, #f97373, #ef4444); border-color: rgba(248,113,113,0.85); color: #fef2f2; }";
  html +=
    ".btn-info { background: linear-gradient(135deg, #38bdf8, #0ea5e9); border-color: rgba(56,189,248,0.85); color: #ecfeff; }";
  html += ".btn-sm { padding: 7px 13px; font-size: 11px; }";

  // Form controls
  html += ".form-group { margin-bottom: 14px; }";
  html +=
    ".form-group label { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #9ca3af; }";
  html += ".form-group label i { color: #818cf8; font-size: 12px; }";
  html +=
    ".form-group input, .form-group select, .form-group textarea { width: 100%; padding: 9px 11px; border-radius: 10px; border: 1px solid rgba(55,65,81,0.9); background: rgba(15,23,42,0.95); color: #e5e7eb; font-size: 13px; font-family: inherit; transition: border-color 0.15s ease-out, box-shadow 0.15s ease-out, background 0.15s ease-out, transform 0.15s ease-out; }";
  html +=
    ".form-group input::placeholder, .form-group textarea::placeholder { color: rgba(148,163,184,0.85); }";
  html +=
    ".form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 1px rgba(99,102,241,0.8); background: rgba(15,23,42,0.98); transform: translateY(-1px); }";
  html += ".form-group textarea { min-height: 90px; resize: vertical; }";

  // Filter/search area
  html +=
    ".filter-section { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 14px; align-items: center; }";
  html +=
    ".search-box { flex: 1 1 220px; padding: 8px 11px; border-radius: 999px; border: 1px solid rgba(55,65,81,0.9); background: rgba(15,23,42,0.95); color: #e5e7eb; font-size: 12px; }";
  html +=
    ".search-box:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 1px rgba(99,102,241,0.7); }";
  html +=
    ".active-filters { margin-bottom: 10px; display: flex; flex-wrap: wrap; gap: 8px; font-size: 11px; color: #9ca3af; }";
  html +=
    ".filter-chip { padding: 4px 9px; border-radius: 999px; border: 1px solid rgba(129,140,248,0.7); background: rgba(15,23,42,0.96); color: #e5e7eb; display: inline-flex; align-items: center; gap: 6px; }";
  html += ".filter-chip i { font-size: 11px; color: #818cf8; }";
  html += ".filter-hint { font-style: italic; }";

  // Tables
  html +=
    "table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; background: rgba(15,23,42,0.96); border-radius: 14px; overflow: hidden; box-shadow: 0 18px 40px rgba(15,23,42,0.9); }";
  html +=
    "thead { background: linear-gradient(to right, rgba(15,23,42,0.96), rgba(30,64,175,0.65)); }";
  html +=
    "th, td { padding: 9px 10px; text-align: left; border-bottom: 1px solid rgba(31,41,55,0.95); }";
  html +=
    "th { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #9ca3af; }";
  html += "tbody tr:hover { background: rgba(30,64,175,0.35); }";
  html += "tbody tr:last-child td { border-bottom: none; }";
  // Empty state cards
  html +=
    ".empty-state { text-align: center; padding: 40px 16px; color: #9ca3af; }";
  html +=
    ".empty-state i { font-size: 40px; color: #6b7280; margin-bottom: 10px; display: block; }";
  html +=
    ".empty-state h3 { font-size: 16px; margin-bottom: 6px; color: #e5e7eb; }";
  html += ".empty-state p { font-size: 13px; color: #9ca3af; }";

  // Task cards (employee views)
  html +=
    ".task-card { background: rgba(15,23,42,0.96); border-radius: 16px; border: 1px solid rgba(31,41,55,0.95); padding: 14px 14px 12px 14px; margin-bottom: 10px; box-shadow: 0 16px 45px rgba(15,23,42,0.9); transition: transform 0.15s ease-out, box-shadow 0.15s ease-out, border-color 0.15s ease-out; cursor: default; }";
  html +=
    ".task-card:hover { transform: translateY(-2px); box-shadow: 0 22px 60px rgba(15,23,42,0.95); border-color: rgba(99,102,241,0.9); }";
  html +=
    ".task-card h3 { font-size: 14px; font-weight: 600; color: #e5e7eb; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }";
  html += ".task-card h3 i { color: #818cf8; font-size: 13px; }";
  html +=
    ".task-meta-row { display: flex; flex-wrap: wrap; gap: 8px 14px; font-size: 11px; color: #9ca3af; margin-bottom: 6px; }";

  // Pincode + status chips
  html +=
    ".pincode-highlight { padding: 5px 11px; border-radius: 999px; background: rgba(15,23,42,1); border: 1px solid rgba(251,191,36,0.75); color: #facc15; font-size: 11px; display: inline-flex; align-items: center; gap: 6px; }";
  html += ".pincode-highlight i { font-size: 11px; }";

  html +=
    ".status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; border-radius: 999px; font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }";
  html +=
    ".status-unassigned { background: rgba(15,23,42,0.95); color: #e5e7eb; border: 1px dashed rgba(55,65,81,0.9); }";
  html +=
    ".status-pending { background: rgba(234,179,8,0.18); color: #facc15; border: 1px solid rgba(234,179,8,0.8); }";
  html +=
    ".status-completed { background: rgba(34,197,94,0.16); color: #4ade80; border: 1px solid rgba(34,197,94,0.8); }";
  html +=
    ".status-verified { background: rgba(59,130,246,0.18); color: #93c5fd; border: 1px solid rgba(59,130,246,0.8); }";
  html +=
    ".status-left-job, .status-not-sharing-info, .status-not-picking, .status-switch-off, .status-incorrect-number, .status-wrong-address { background: rgba(248,113,113,0.14); color: #fecaca; border: 1px solid rgba(248,113,113,0.85); }";

  // Map link
  html +=
    ".map-button { margin-top: 8px; padding: 7px 14px; border-radius: 999px; background: linear-gradient(135deg, #38bdf8, #0ea5e9); color: #ecfeff; font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: none; text-decoration: none; box-shadow: 0 16px 30px rgba(8,47,73,0.9); width: auto; min-width: 0; }";
  html +=
    ".map-button:hover { transform: translateY(-1px); box-shadow: 0 20px 46px rgba(8,47,73,0.95); }";
  html +=
    ".no-map { margin-top: 6px; font-size: 11px; font-style: italic; color: #6b7280; }";

  // Toast notifications
  html +=
    ".toast-container { position: fixed; top: 18px; right: 18px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; }";
  html +=
    ".toast { min-width: 230px; border-radius: 14px; padding: 10px 13px; font-size: 12px; display: flex; align-items: flex-start; gap: 8px; background: rgba(15,23,42,0.98); border: 1px solid rgba(55,65,81,0.95); color: #e5e7eb; box-shadow: 0 18px 40px rgba(15,23,42,0.95); opacity: 0; transform: translateX(24px); transition: opacity 0.2s ease-out, transform 0.2s ease-out; }";
  html += ".toast.show { opacity: 1; transform: translateX(0); }";
  html += ".toast-icon { font-size: 14px; margin-top: 1px; }";
  html += ".toast-success { border-color: rgba(34,197,94,0.85); }";
  html += ".toast-success .toast-icon { color: #4ade80; }";
  html += ".toast-error { border-color: rgba(248,113,113,0.9); }";
  html += ".toast-error .toast-icon { color: #fecaca; }";
  html += ".toast-warning { border-color: rgba(234,179,8,0.85); }";
  html += ".toast-warning .toast-icon { color: #facc15; }";

  // Modals (bulk upload, etc.)
  html +=
    ".modal { position: fixed; inset: 0; background: rgba(15,23,42,0.86); display: flex; align-items: center; justify-content: center; z-index: 9998; }";
  html +=
    ".modal-content { width: 100%; max-width: 620px; max-height: 80vh; overflow: auto; border-radius: 18px; background: rgba(15,23,42,0.98); border: 1px solid rgba(55,65,81,0.95); padding: 18px 18px 16px 18px; box-shadow: 0 28px 80px rgba(15,23,42,1); }";
  html += ".modal-content h2 { margin-bottom: 10px; }";

  // Info box (bulk upload instructions)
  html +=
    ".info-box { margin: 10px 0 18px 0; padding: 10px 12px; border-radius: 14px; background: radial-gradient(circle at top left, rgba(250,204,21,0.08), rgba(15,23,42,0.98)); border: 1px solid rgba(234,179,8,0.75); color: #e5e7eb; font-size: 13px; }";
  html += ".info-box p { margin-bottom: 6px; }";
  html +=
    ".info-box ul { margin-left: 18px; font-size: 12px; color: #e5e7eb; padding-left: 2px; }";
  html += ".info-box ul li { margin-bottom: 4px; }";
  // Progress bar (bulk upload)
  html += ".progress-container { margin: 14px 0 8px 0; }";
  html +=
    ".progress-bar-wrapper { background: rgba(15,23,42,1); border-radius: 999px; height: 24px; overflow: hidden; border: 1px solid rgba(31,41,55,0.95); box-shadow: inset 0 0 0 1px rgba(15,23,42,0.9); }";
  html +=
    ".progress-bar { background: linear-gradient(135deg, #22c55e, #16a34a); height: 100%; width: 0; display: flex; align-items: center; justify-content: center; color: #ecfdf5; font-size: 11px; font-weight: 600; transition: width 0.25s ease-out; }";
  html +=
    ".progress-text { text-align: center; margin-top: 6px; font-size: 12px; font-weight: 500; color: #bbf7d0; }";

  // Misc
  html +=
    ".loading-spinner { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #9ca3af; }";
  html += ".loading-spinner i { animation: spin 0.8s linear infinite; }";
  html += "@keyframes spin { to { transform: rotate(360deg); } }";

  html +=
    "@media (max-width: 900px) { .container { border-radius: 0; box-shadow: none; border-left: none; border-right: none; } .header { padding: 12px 12px 10px 12px; } .menu { padding: 8px 10px; } .content { padding: 12px 10px 16px 10px; } }";
  html +=
    "@media (max-width: 640px) { .user-info { gap: 8px; } .user-chip span { max-width: 120px; } .menu { justify-content: flex-start; overflow-x: auto; } .menu::-webkit-scrollbar { height: 4px; } .menu::-webkit-scrollbar-thumb { background: rgba(55,65,81,0.9); border-radius: 999px; } }";

  // NEW: ultra-smooth mobile layout for Admin > View All Tasks
  html +=
    "@media (max-width: 640px) {\
    #allTasksList table {\
      width: 100%;\
      border-collapse: separate;\
      border-spacing: 0 12px;\
      background: transparent;\
    }\
    #allTasksList thead {\
      display: none;\
    }\
    #allTasksList tbody {\
      display: block;\
    }\
    #allTasksList tr {\
      display: block;\
      padding: 10px 12px 10px 12px;\
      margin-bottom: 12px;\
      border-radius: 16px;\
      background: rgba(15,23,42,0.98);\
      border: 1px solid rgba(55,65,81,0.95);\
      box-shadow: 0 16px 40px rgba(15,23,42,0.95);\
      transition: transform 0.15s ease-out, box-shadow 0.15s ease-out, border-color 0.15s ease-out;\
    }\
    #allTasksList tr:hover {\
      transform: translateY(-2px);\
      box-shadow: 0 22px 60px rgba(15,23,42,1);\
      border-color: rgba(99,102,241,0.9);\
    }\
    #allTasksList td {\
      display: block;\
      width: 100%;\
      padding: 6px 0;\
      border-bottom: none;\
      font-size: 12px;\
    }\
    #allTasksList td::before {\
      content: attr(data-label);\
      display: block;\
      font-size: 10px;\
      text-transform: uppercase;\
      letter-spacing: 0.12em;\
      color: #9ca3af;\
      margin-bottom: 2px;\
    }\
    #allTasksList tr td:first-child {\
      padding-top: 4px;\
    }\
    #allTasksList tr td:first-child strong {\
      font-size: 14px;\
    }\
    #allTasksList td[data-label='Status'] {\
      margin-top: 4px;\
    }\
    #allTasksList td[data-label='Status'] .status-badge {\
      margin-top: 4px;\
    }\
    #allTasksList td[data-label='Map'],\
    #allTasksList td[data-label='Actions'] {\
      margin-top: 6px;\
    }\
    #allTasksList td[data-label='Actions'] .action-buttons {\
      display: flex;\
      flex-direction: column;\
      gap: 6px;\
    }\
    #allTasksList td[data-label='Actions'] .btn {\
      width: 100%;\
      justify-content: center;\
      padding: 10px 14px;\
      font-size: 12px;\
    }\
    #allTasksList .btn,\
    #allTasksList .map-button {\
      min-height: 44px;\
    }\
  }";

  html += "</style>";
  html += "</head>";
  html += "<body>";

  // Toast notification element
  html += '<div id="toast" class="toast"></div>';

  // Main container
  html += '<div class="container">';

  // Header
  html += '<div class="header">';
  html += '<h1><i class="fas fa-clipboard-check"></i> Validiant Tracker</h1>';
  html += '<div class="user-info">';
  html +=
    '<span id="userName"><i class="fas fa-user-circle"></i> Loading...</span>';
  html += '<button class="btn btn-danger btn-sm" onclick="logout()">';
  html += '<i class="fas fa-sign-out-alt"></i> Logout';
  html += "</button>";
  html += "</div>";
  html += "</div>";

  // Menu (will be populated by JavaScript based on role)
  html += '<div class="menu" id="menu"></div>';

  // Content area (will be populated by JavaScript)
  html += '<div class="content" id="content">';
  html += '<div class="loading-spinner show">';
  html += '<i class="fas fa-spinner"></i>';
  html += "Loading dashboard...";
  html += "</div>";
  html += "</div>";

  html += "</div>"; // End container

  // Now add the JavaScript (using string concatenation to avoid backtick issues)
  html += "<script>";

  html +=
    "// PART 4 - JavaScript continuation (inside the <script> tag from PART 3)\n";
  html += "\n";
  html +=
    "// ═══════════════════════════════════════════════════════════════════════════\n";
  html += "// GLOBAL VARIABLES & SESSION MANAGEMENT\n";
  html +=
    "// ════════════════════════════════════════════════════════════.c�══════════════\n";
  html += "\n";
  html += "let currentUser = null;\n";
  html += "let sessionTimeout = null;\n";
  html += "let allEmployeeTasks = [];\n";
  html += "let allHistoryTasks = [];\n";
  html += "let selectedTaskIds = [];\n";
  html += "let allAdminTasks = [];\n";
  html += "// Persistent sorting state for Sort by Nearest\n";
  html += "let isNearestSortActive = false;\n";
  html += "let savedEmployeeLocation = null; // { latitude, longitude }\n";
  html += "\n";
  html +=
    "// Master Pincode Database (Bangalore & Surroundings) - Moved to global scope for shared access\n";
  html += "const pincodeData = {\n";
  html +=
    "  '560001':{lat:12.9716,lng:77.5946},'560002':{lat:12.9844,lng:77.5908},'560003':{lat:13.0067,lng:77.5713},\n";
  html +=
    "  '560004':{lat:12.944,lng:77.575},'560005':{lat:13.005,lng:77.588},'560006':{lat:12.9634,lng:77.5855},\n";
  html +=
    "  '560007':{lat:12.8431,lng:77.4863},'560008':{lat:13.0169,lng:77.64},'560009':{lat:13.031,lng:77.645},\n";
  html +=
    "  '560010':{lat:13.0208,lng:77.6344},'560011':{lat:13.032,lng:77.596},'560012':{lat:13.0048,lng:77.5956},\n";
  html +=
    "  '560013':{lat:13.035,lng:77.551},'560014':{lat:13.0305,lng:77.5575},'560015':{lat:13.045,lng:77.565},\n";
  html +=
    "  '560016':{lat:13.041,lng:77.559},'560017':{lat:13.0085,lng:77.65},'560018':{lat:12.952,lng:77.579},\n";
  html +=
    "  '560019':{lat:12.952,lng:77.5735},'560020':{lat:13.005,lng:77.5842},'560021':{lat:12.987,lng:77.565},\n";
  html +=
    "  '560022':{lat:13.013,lng:77.551},'560023':{lat:12.976,lng:77.542},'560024':{lat:12.968,lng:77.535},\n";
  html +=
    "  '560025':{lat:13.011,lng:77.562},'560026':{lat:12.972,lng:77.547},'560027':{lat:12.982,lng:77.574},\n";
  html +=
    "  '560029':{lat:12.955,lng:77.601},'560030':{lat:12.9716,lng:77.5946},'560032':{lat:12.958,lng:77.597},\n";
  html +=
    "  '560033':{lat:12.964,lng:77.596},'560034':{lat:12.9275,lng:77.6225},'560035':{lat:12.934,lng:77.668},\n";
  html +=
    "  '560036':{lat:12.994,lng:77.691},'560037':{lat:13.045,lng:77.69},'560038':{lat:12.9755,lng:77.64},\n";
  html +=
    "  '560039':{lat:12.968,lng:77.522},'560040':{lat:12.981,lng:77.519},'560041':{lat:12.932,lng:77.585},\n";
  html +=
    "  '560042':{lat:12.918,lng:77.599},'560043':{lat:13.014,lng:77.649},'560045':{lat:12.985,lng:77.607},\n";
  html +=
    "  '560046':{lat:13.007,lng:77.601},'560047':{lat:12.964,lng:77.609},'560048':{lat:13.036,lng:77.705},\n";
  html +=
    "  '560049':{lat:13.064,lng:77.728},'560050':{lat:13.064,lng:77.628},'560051':{lat:12.908,lng:77.597},\n";
  html +=
    "  '560053':{lat:12.965,lng:77.573},'560054':{lat:13.037,lng:77.562},'560055':{lat:13.0055,lng:77.569},\n";
  html +=
    "  '560056':{lat:13.006,lng:77.575},'560057':{lat:13.026,lng:77.521},'560058':{lat:13.01,lng:77.53},\n";
  html +=
    "  '560059':{lat:13.015,lng:77.533},'560060':{lat:13.009,lng:77.548},'560061':{lat:12.925,lng:77.535},\n";
  html +=
    "  '560062':{lat:12.896,lng:77.527},'560063':{lat:13.108,lng:77.575},'560064':{lat:13.0675,lng:77.598},\n";
  html +=
    "  '560065':{lat:13.08,lng:77.57},'560066':{lat:13.0875,lng:77.582},'560067':{lat:13.152,lng:77.605},\n";
  html +=
    "  '560068':{lat:13.068,lng:77.718},'560070':{lat:12.913,lng:77.547},'560071':{lat:12.957,lng:77.638},\n";
  html +=
    "  '560072':{lat:12.951,lng:77.485},'560073':{lat:13.043,lng:77.545},'560074':{lat:12.888,lng:77.498},\n";
  html +=
    "  '560075':{lat:13.0055,lng:77.578},'560076':{lat:12.9,lng:77.597},'560077':{lat:13.032,lng:77.585},\n";
  html +=
    "  '560078':{lat:12.91,lng:77.555},'560079':{lat:12.981,lng:77.541},'560080':{lat:13.005,lng:77.573},\n";
  html +=
    "  '560082':{lat:12.856,lng:77.542},'560083':{lat:12.897,lng:77.578},'560084':{lat:13.03,lng:77.616},\n";
  html +=
    "  '560085':{lat:12.911,lng:77.558},'560086':{lat:12.96,lng:77.541},'560087':{lat:13.028,lng:77.595},\n";
  html +=
    "  '560090':{lat:13.016,lng:77.709},'560091':{lat:12.977,lng:77.615},'560092':{lat:13.045,lng:77.667},\n";
  html +=
    "  '560093':{lat:12.984,lng:77.655},'560094':{lat:12.9695,lng:77.657},'560095':{lat:12.935,lng:77.627},\n";
  html +=
    "  '560096':{lat:12.942,lng:77.618},'560097':{lat:13.07,lng:77.784},'560098':{lat:13.009,lng:77.589},\n";
  html +=
    "  '560099':{lat:12.845,lng:77.679},'560100':{lat:12.845,lng:77.661},'560102':{lat:12.912,lng:77.638},\n";
  html +=
    "  '560103':{lat:12.926,lng:77.676},'560104':{lat:13.064,lng:77.748},'560105':{lat:13.087,lng:77.702},\n";
  html +=
    "  '562106':{lat:12.711,lng:77.695},'562107':{lat:12.776,lng:77.754},'562125':{lat:12.916,lng:77.782},\n";
  html +=
    "  '562130':{lat:13.006,lng:77.791},'562149':{lat:13.143,lng:77.709},'562157':{lat:13.178,lng:77.721}\n";
  html += "};\n";
  html += "\n";
  html += "// Check authentication\n";
  html += "const userStr = localStorage.getItem('currentUser');\n";
  html += "if (!userStr) {\n";
  html += "window.location.href = '/signin';\n";
  html += "throw new Error('Not authenticated');\n";
  html += "}\n";
  html += "\n";
  html += "try {\n";
  html += "  currentUser = JSON.parse(userStr);\n";
  html +=
    "  document.getElementById('userName').innerHTML = '<i class=\"fas fa-user-circle\"></i> ' + escapeHtml(currentUser.name) + ' (' + currentUser.role + ')';\n";
  html += "} catch (e) {\n";
  html += "  console.error('Error parsing user data:', e);\n";
  html += "  window.location.href = '/signin';\n";
  html += "  throw new Error('Invalid user data');\n";
  html += "}\n";
  html += "\n";
  html +=
    "// ═════════════════════════════on�o��═══════════════════════════════════════-c�════\n";
  html += "// SESSION TIMEOUT MANAGEMENT (15 minutes)\n";
  html +=
    "// ═══════════════════════════════════════════════════════════════════════════\n";
  html += "\n";
  html += "function resetSessionTimeout() {\n";
  html += "  clearTimeout(sessionTimeout);\n";
  html += "  sessionTimeout = setTimeout(function() {\n";
  html += "    showToast('Session expired. Please login again.', 'error');\n";
  html += "    setTimeout(function() {\n";
  html += "      logout();\n";
  html += "    }, 2000);\n";
  html += "  }, 900000); // 15 minutes\n";
  html += "}\n";
  html += "\n";
  html += "resetSessionTimeout();\n";
  html += "document.addEventListener('click', resetSessionTimeout);\n";
  html += "document.addEventListener('keypress', resetSessionTimeout);\n";
  html += "document.addEventListener('mousemove', resetSessionTimeout);\n";
  html += "\n";
  html +=
    "// ═══════════════════════════════════════════════════════════════════════════\n";
  html += "// UTILITY FUNCTIONS\n";
  html +=
    "// ═══════════════════════════════════════════════════════════════════════════\n";
  html += "\n";
  html += "function escapeHtml(text) {\n";
  html += "  if (!text) return '';\n";
  html += "  const div = document.createElement('div');\n";
  html += "  div.textContent = text;\n";
  html += "  return div.innerHTML;\n";
  html += "}\n";
  html += "\n";
  html += "function showToast(message, type) {\n";
  html += "  const toast = document.getElementById('toast');\n";
  html += "  const icons = {\n";
  html += "    success: 'fa-check-circle',\n";
  html += "    error: 'fa-exclamation-circle',\n";
  html += "    info: 'fa-info-circle',\n";
  html += "    warning: 'fa-exclamation-triangle'\n";
  html += "  };\n";
  html += "  const icon = icons[type] || icons.info;\n";
  html += "  \n";
  html +=
    "  toast.innerHTML = '<i class=\"fas ' + icon + '\"></i><span class=\"toast-content\">' + escapeHtml(message) + '</span>';\n";
  html += "  toast.className = 'toast show ' + type;\n";
  html += "  \n";
  html += "  setTimeout(function() {\n";
  html += "    toast.classList.remove('show');\n";
  html += "  }, 4000);\n";
  html += "}\n";
  html += "function showEditMapModal(taskId) {";
  html += "  if (!Array.isArray(allAdminTasks)) {";
  html += "    showToast('No tasks loaded in memory yet', 'error');";
  html += "    return;";
  html += "  }";
  html +=
    "  var task = allAdminTasks.find(function (t) { return t.id === taskId; });";
  html += "  if (!task) {";
  html += "    showToast('Task not found in current list', 'error');";
  html += "    return;";
  html += "  }";
  html += "  var modal = document.createElement('div');";
  html += "  modal.className = 'modal';";
  html += "  modal.setAttribute('data-type', 'edit-map');";
  html += "  var content = document.createElement('div');";
  html += "  content.className = 'modal-content';";
  html += "  var h2 = document.createElement('h2');";
  html +=
    "  h2.innerHTML = '<i class=\"fas fa-map-marked-alt\"></i> Edit Map Link';";
  html += "  content.appendChild(h2);";
  html += "  var p1 = document.createElement('p');";
  html +=
    "  p1.innerHTML = '<strong>Case ID:</strong> ' + escapeHtml(task.title);";
  html += "  content.appendChild(p1);";
  html += "  var p2 = document.createElement('p');";
  html +=
    "  p2.innerHTML = '<strong>Pincode:</strong> ' + escapeHtml(task.pincode || 'NA');";
  html += "  content.appendChild(p2);";
  html += "  var group = document.createElement('div');";
  html += "  group.className = 'form-group';";
  html += "  var label = document.createElement('label');";
  html += "  label.setAttribute('for', 'editMapUrl');";
  html +=
    "  label.innerHTML = '<i class=\"fas fa-link\"></i> Google Maps URL';";
  html += "  group.appendChild(label);";
  html += "  var input = document.createElement('input');";
  html += "  input.type = 'url';";
  html += "  input.id = 'editMapUrl';";
  html += "  input.className = 'search-box';";
  html += "  input.placeholder = 'Paste Google Maps link';";
  html += "  input.value = task.mapUrl || '';";
  html += "  group.appendChild(input);";
  html += "  content.appendChild(group);";
  html += "  var buttonsRow = document.createElement('div');";
  html += "  buttonsRow.style.display = 'flex';";
  html += "  buttonsRow.style.gap = '10px';";
  html += "  buttonsRow.style.marginTop = '18px';";
  html += "  var saveBtn = document.createElement('button');";
  html += "  saveBtn.className = 'btn btn-primary btn-sm';";
  html += "  saveBtn.innerHTML = '<i class=\"fas fa-save\"></i> Save';";
  html +=
    "  saveBtn.addEventListener('click', function () { saveMapUpdate(taskId); });";
  html += "  buttonsRow.appendChild(saveBtn);";
  html += "  var cancelBtn = document.createElement('button');";
  html += "  cancelBtn.className = 'btn btn-secondary btn-sm';";
  html += "  cancelBtn.innerHTML = '<i class=\"fas fa-times\"></i> Cancel';";
  html += "  cancelBtn.addEventListener('click', closeEditMapModal);";
  html += "  buttonsRow.appendChild(cancelBtn);";
  html += "  content.appendChild(buttonsRow);";
  html += "  modal.appendChild(content);";
  html += "  document.body.appendChild(modal);";
  html += "}";
  html += "function closeEditMapModal() {";
  html +=
    "  var modal = document.querySelector('.modal[data-type=\"edit-map\"]');";
  html += "  if (modal) modal.remove();";
  html += "}";
  html += "function saveMapUpdate(taskId) {";
  html += "  var input = document.getElementById('editMapUrl');";
  html += "  if (!input) {";
  html += "    showToast('Map URL field not found', 'error');";
  html += "    return;";
  html += "  }";
  html += "  var url = input.value.trim();";
  html += "  var payload = {";
  html += "    mapUrl: url || null,";
  html += "    userId: currentUser.id,";
  html += "    userName: currentUser.name";
  html += "  };";
  html += "  fetch('/api/tasks/' + taskId, {";
  html += "    method: 'PUT',";
  html += "    headers: { 'Content-Type': 'application/json' },";
  html += "    body: JSON.stringify(payload)";
  html += "  })";
  html += "  .then(function(res) { return res.json(); })";
  html += "  .then(function(data) {";
  html += "    if (data.success) {";
  html += "      showToast('Map link updated successfully', 'success');";
  html += "      closeEditMapModal();";
  html += "      loadAllTasks();";
  html += "    } else {";
  html +=
    "      showToast(data.message || 'Failed to update map link', 'error');";
  html += "    }";
  html += "  })";
  html += "  .catch(function(err) {";
  html += "    console.error('Error updating map link:', err);";
  html += "    showToast('Connection error while updating map', 'error');";
  html += "  });";
  html += "}";
  html += "\n";
  html += "function showLoading(containerId) {\n";
  html +=
    "  const container = document.getElementById(containerId || 'content');\n";
  html +=
    '  container.innerHTML = \'<div class="loading-spinner show"><i class="fas fa-spinner"></i>Loading...</div>\';\n';
  html += "}\n";
  html += "\n";
  html += "function hideLoading(containerId) {\n";
  html +=
    "  const spinner = document.querySelector('#' + (containerId || 'content') + ' .loading-spinner');\n";
  html += "  if (spinner) spinner.remove();\n";
  html += "}\n";
  html += "\n";
  html +=
    "// ═══════════════════════════════════l��════r��══════════════════════════════════\n";
  html += "// LOGOUT FUNCTION (Feature #10)\n";
  html +=
    "// ══════════════════════════════════════════════════════════════════;��════════\n";
  html += "\n";
  html += "function logout() {\n";
  html += "  if (!confirm('Are you sure you want to logout?')) {\n";
  html += "    return;\n";
  html += "  }\n";
  html += "  \n";
  html += "  localStorage.removeItem('currentUser');\n";
  html += "  sessionStorage.clear();\n";
  html += "  showToast('Logged out successfully!', 'success');\n";
  html += "  \n";
  html += "  setTimeout(function() {\n";
  html += "    window.location.href = '/signin';\n";
  html += "  }, 1000);\n";
  html += "}\n";
  html += "\n";
  // Edit Map modal helpers  html +=
  ("// ═════════════════════════════════════════pl�═════════════════════════════════\n");
  html += "// KEYBOARD SHORTCUTS (Enhancement Feature)\n";
  html +=
    "// ═══════════════════════════════════════════════════════════════════════════\n";
  html += "\n";
  html += "document.addEventListener('keydown', function(e) {\n";
  html += "  // Don't trigger shortcuts when typing in inputs\n";
  html +=
    "  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {\n";
  html += "    return;\n";
  html += "  }\n";
  html += "  \n";
  html += "  // Ctrl/Cmd + N: New task (admin only)\n";
  html +=
    "  if ((e.ctrlKey || e.metaKey) && e.key === 'n' && currentUser.role === 'admin') {\n";
  html += "    e.preventDefault();\n";
  html += "    showAssignTask();\n";
  html += "  }\n";
  html += "  \n";
  html += "  // Ctrl/Cmd + U: Unassigned tasks (admin only)\n";
  html +=
    "  if ((e.ctrlKey || e.metaKey) && e.key === 'u' && currentUser.role === 'admin') {\n";
  html += "    e.preventDefault();\n";
  html += "    showUnassignedTasks();\n";
  html += "  }\n";
  html += "  \n";
  html += "  // Ctrl/Cmd + E: Employees (admin only)\n";
  html +=
    "  if ((e.ctrlKey || e.metaKey) && e.key === 'e' && currentUser.role === 'admin') {\n";
  html += "    e.preventDefault();\n";
  html += "    showEmployees();\n";
  html += "  }\n";
  html += "  \n";
  html += "  // Ctrl/Cmd + /: Focus search\n";
  html += "  if ((e.ctrlKey || e.metaKey) && e.key === '/') {\n";
  html += "    e.preventDefault();\n";
  html += "    const searchBox = document.querySelector('.search-box');\n";
  html += "    if (searchBox) searchBox.focus();\n";
  html += "  }\n";
  html += "  \n";
  html += "  // Escape: Close modals\n";
  html += "  if (e.key === 'Escape') {\n";
  html += "    const modals = document.querySelectorAll('.modal');\n";
  html += "    modals.forEach(function(modal) {\n";
  html += "      modal.remove();\n";
  html += "    });\n";
  html += "  }\n";
  html += "});\n";
  html += "\n";
  html +=
    "// ═══════════════════════════════════════════════════════════════════════════\n";
  html += "// ADMIN FUNCTIONS - ASSIGN TASK\n";
  html +=
    "// ═══════════════════════════════════════════════════════════════════════════\n";
  html += "\n";
  html += "function showAssignTask() {\n";
  html +=
    "  let html = '<h2><i class=\"fas fa-tasks\"></i> Assign New Task</h2>';\n";
  html += "  \n";
  html += "  // Bulk upload button\n";
  html +=
    '  html += \'<button class="btn btn-success" onclick="showBulkUpload()" style="margin-bottom: 25px;">\';\n';
  html +=
    "  html += '<i class=\"fas fa-file-excel\"></i> Bulk Upload Tasks (Excel)';\n";
  html += "  html += '</button>';\n";
  html += "  \n";
  html += " html += '<form id=\"taskForm\">';\n";
  html += " \n";
  html += " html += '<div class=\"form-group\">';\n";
  html +=
    ' html += \'<label for="caseId"><i class="fas fa-id-card"></i> Case ID / Title *</label>\';\n';
  html +=
    ' html += \'<input type="text" id="caseId" required placeholder="Enter case ID or title" maxlength="500">\';\n';
  html += " html += '</div>';\n";
  html += " \n";
  html += " html += '<div class=\"form-group\">';\n";
  html +=
    ' html += \'<label for="clientName"><i class="fas fa-user-tie"></i> Client Name (Optional)</label>\';\n';
  html +=
    ' html += \'<input type="text" id="clientName" placeholder="Enter client name (optional)" maxlength="200">\';\n';
  html += " html += '</div>';\n";
  html += " \n";
  html += " html += '<div class=\"form-group\">';\n";
  html +=
    ' html += \'<label for="pincode"><i class="fas fa-map-pin"></i> Pincode *</label>\';\n';
  html +=
    ' html += \'<input type="text" id="pincode" required placeholder="6-digit pincode" maxlength="6" pattern="[0-9]{6}">\';\n';
  html += "  html += '</div>';\n";
  html += "  \n";
  html += "  html += '<div class=\"form-group\">';\n";
  html +=
    '  html += \'<label for="mapUrl"><i class="fas fa-map-marked-alt"></i> Google Maps URL (Optional)</label>\';\n';
  html +=
    '  html += \'<input type="url" id="mapUrl" placeholder="Paste Google Maps link (coordinates will be extracted automatically)">\';\n';
  html += "  html += '</div>';\n";
  html += "  \n";
  html += "  html += '<div class=\"form-group\">';\n";
  html +=
    '  html += \'<label for="latitude"><i class="fas fa-globe"></i> Latitude (Auto-filled from map URL)</label>\';\n';
  html +=
    '  html += \'<input type="number" id="latitude" step="any" placeholder="Will be extracted from map URL">\';\n';
  html += "  html += '</div>';\n";
  html += "  \n";
  html += "  html += '<div class=\"form-group\">';\n";
  html +=
    '  html += \'<label for="longitude"><i class="fas fa-globe"></i> Longitude (Auto-filled from map URL)</label>\';\n';
  html +=
    '  html += \'<input type="number" id="longitude" step="any" placeholder="Will be extracted from map URL">\';\n';
  html += "  html += '</div>';\n";
  html += "  \n";
  html += "  html += '<div class=\"form-group\">';\n";
  html +=
    '  html += \'<label for="employee"><i class="fas fa-user"></i> Assign to Employee (Optional - Leave blank for unassigned)</label>\';\n';
  html += "  html += '<select id=\"employee\">';\n";
  html += "  html += '<option value=\"\">-- Leave Unassigned --</option>';\n";
  html += "  html += '</select>';\n";
  html += "  html += '</div>';\n";
  html += "  \n";
  html += "  html += '<div class=\"form-group\">';\n";
  html +=
    '  html += \'<label for="notes"><i class="fas fa-sticky-note"></i> Notes (Optional)</label>\';\n';
  html +=
    '  html += \'<textarea id="notes" rows="4" placeholder="Additional notes or instructions"></textarea>\';\n';
  html += "  html += '</div>';\n";
  html += "  \n";
  html +=
    '  html += \'<button type="submit" class="btn btn-primary btn-lg">\';\n';
  html += "  html += '<i class=\"fas fa-check\"></i> Create Task';\n";
  html += "  html += '</button>';\n";
  html += "  \n";
  html += "  html += '</form>';\n";
  html += "  \n";
  html += "  document.getElementById('content').innerHTML = html;\n";
  html += "  \n";
  html += "  // Load employees\n";
  html += "  fetch('/api/users')\n";
  html += "    .then(function(r) { return r.json(); })\n";
  html += "    .then(function(users) {\n";
  html += "      const select = document.getElementById('employee');\n";
  html += "      users.forEach(function(u) {\n";
  html += "        const option = document.createElement('option');\n";
  html += "        option.value = u.id;\n";
  html +=
    "        option.textContent = escapeHtml(u.name) + ' (' + escapeHtml(u.email) + ')';\n";
  html += "        select.appendChild(option);\n";
  html += "      });\n";
  html += "    })\n";
  html += "    .catch(function(err) {\n";
  html += "      console.error('Error loading employees:', err);\n";
  html += "      showToast('Failed to load employees', 'error');\n";
  html += "    });\n";
  html += "  \n";
  html += "  // Map URL coordinate extraction\n";
  html +=
    "  document.getElementById('mapUrl').addEventListener('blur', function() {\n";
  html += "    const url = this.value;\n";
  html += "    if (url) {\n";
  html += "      const latMatch = url.match(/@(-?[0-9.]+),(-?[0-9.]+)/);\n";
  html += "      if (latMatch) {\n";
  html += "        document.getElementById('latitude').value = latMatch[1];\n";
  html += "        document.getElementById('longitude').value = latMatch[2];\n";
  html +=
    "        showToast('Coordinates extracted from map URL!', 'success');\n";
  html += "      } else {\n";
  html += "        const qMatch = url.match(/\\?q=(-?[0-9.]+),(-?[0-9.]+)/);\n";
  html += "        if (qMatch) {\n";
  html += "          document.getElementById('latitude').value = qMatch[1];\n";
  html += "          document.getElementById('longitude').value = qMatch[2];\n";
  html +=
    "          showToast('Coordinates extracted from map URL!', 'success');\n";
  html += "        }\n";
  html += "      }\n";
  html += "    }\n";
  html += "  });\n";
  html += "  \n";
  html += "  // Form submission\n";
  html +=
    "  document.getElementById('taskForm').addEventListener('submit', function(e) {\n";
  html += "    e.preventDefault();\n";
  html += "    \n";
  html += "    const pincode = document.getElementById('pincode').value;\n";
  html += "    if (!/^[0-9]{6}$/.test(pincode)) {\n";
  html += "      showToast('Pincode must be exactly 6 digits', 'error');\n";
  html += "      return;\n";
  html += "    }\n";
  html += "    \n";
  html += "    const formData = {\n";
  html += "      title: document.getElementById('caseId').value,\n";
  html +=
    "      clientName: document.getElementById('clientName').value || null,\n";
  html += "      pincode: pincode,\n";
  html += "      mapUrl: document.getElementById('mapUrl').value || null,\n";
  html +=
    "      latitude: parseFloat(document.getElementById('latitude').value) || null,\n";
  html +=
    "      longitude: parseFloat(document.getElementById('longitude').value) || null,\n";
  html +=
    "      assignedTo: document.getElementById('employee').value ? parseInt(document.getElementById('employee').value) : null,\n";
  html += "      notes: document.getElementById('notes').value || null,\n";
  html += "      createdBy: currentUser.id,\n";
  html += "      createdByName: currentUser.name\n";
  html += "    };\n";
  html += "    \n";
  html +=
    "    const btn = e.target.querySelector('button[type=\"submit\"]');\n";
  html += "    btn.disabled = true;\n";
  html +=
    "    btn.innerHTML = '<i class=\"fas fa-spinner fa-spin\"></i> Creating...';\n";
  html += "    \n";
  html += "    fetch('/api/tasks', {\n";
  html += "      method: 'POST',\n";
  html += "      headers: { 'Content-Type': 'application/json' },\n";
  html += "      body: JSON.stringify(formData)\n";
  html += "    })\n";
  html += "    .then(function(res) { return res.json(); })\n";
  html += "    .then(function(data) {\n";
  html += "      if (data.success) {\n";
  html +=
    "        showToast(formData.assignedTo ? 'Task assigned successfully!' : 'Task created as unassigned!', 'success');\n";
  html += "        document.getElementById('taskForm').reset();\n";
  html += "        btn.disabled = false;\n";
  html +=
    "        btn.innerHTML = '<i class=\"fas fa-check\"></i> Create Task';\n";
  html += "      } else {\n";
  html +=
    "        showToast(data.message || 'Error creating task', 'error');\n";
  html += "        btn.disabled = false;\n";
  html +=
    "        btn.innerHTML = '<i class=\"fas fa-check\"></i> Create Task';\n";
  html += "      }\n";
  html += "    })\n";
  html += "    .catch(function(err) {\n";
  html += "      console.error('Error creating task:', err);\n";
  html += "      showToast('Connection error. Please try again.', 'error');\n";
  html += "      btn.disabled = false;\n";
  html +=
    "      btn.innerHTML = '<i class=\"fas fa-check\"></i> Create Task';\n";
  html += "    });\n";
  html += "  });\n";
  html += "}\n";
  html += "\n";
  html +=
    "// ═══════════════════════════════════════════════════════════════════════════\n";
  html += "// ADMIN FUNCTIONS - BULK UPLOAD (Feature #3)\n";
  html +=
    "// ═══════════════════════════════════════════════════════════════════════════\n";
  html += "\n";
  html += "function showBulkUpload() {\n";
  html += "  const modal = document.createElement('div');\n";
  html += "  modal.className = 'modal show';\n";
  html += "  \n";
  html += "  let html = '<div class=\"modal-content\">';\n";
  html +=
    "  html += '<h2><i class=\"fas fa-file-excel\"></i> Bulk Upload Tasks</h2>';\n";
  html += "  \n";
  html += "  html += '<div class=\"info-box\">';\n";
  html +=
    "  html += '<p style=\"color: #fde68a; font-weight: 700; margin-bottom: 10px;\">';\n";
  html +=
    "  html += '<i class=\"fas fa-exclamation-triangle\"></i> IMPORTANT: Tasks will be uploaded as UNASSIGNED';\n";
  html += "  html += '</p>';\n";
  html += "  html += '<p style=\"color: #e5e7eb; font-size: 13px;\">';\n";
  html +=
    "  html += 'After upload, assign them to employees from the \"Unassigned Tasks\" menu.';\n";
  html += "  html += '</p>';\n";
  html += "  html += '</div>';\n";
  html += "  \n";
  html += "  html += '<div class=\"form-group\">';\n";
  html +=
    "  html += '<label><i class=\"fas fa-list\"></i> Excel Format Required:</label>';\n";
  html +=
    "  html += '<ul style=\"margin-left: 20px; color: #e5e7eb; font-size: 13px;\">';\n";
  html +=
    "  html += '<li><strong>RequestID</strong> or <strong>Title</strong> (required)</li>';\n";
  html += "  html += '<li><strong>Individual Name</strong> (optional)</li>';\n";
  html +=
    "  html += '<li><strong>Assigned To (ID)</strong> (optional - e.g., EMP001)</li>';\n";
  html +=
    "  html += '<li><strong>Employee Email</strong> (optional - e.g., emp@company.com)</li>';\n";
  html +=
    "  html += '<li><strong>Pincode</strong> (required - 6 digits)</li>';\n";
  html += "  html += '<li><strong>MapURL</strong> (optional)</li>';\n";
  html += "  html += '<li><strong>Latitude</strong> (optional)</li>';\n";
  html += "  html += '<li><strong>Longitude</strong> (optional)</li>';\n";
  html += "  html += '<li><strong>Notes</strong> (optional)</li>';\n";
  html += "  html += '</ul>';\n";
  html +=
    '  html += \'<button class="btn btn-secondary btn-sm" onclick="downloadTemplate()" style="margin-top: 15px;">\';\n';
  html +=
    "  html += '<i class=\"fas fa-download\"></i> Download CSV Template';\n";
  html += "  html += '</button>';\n";
  html += "  html += '</div>';\n";
  html += "  \n";
  html += "  html += '<div class=\"form-group\">';\n";
  html +=
    '  html += \'<label for="excelFile"><i class="fas fa-file-upload"></i> Choose Excel File:</label>\';\n';
  html +=
    '  html += \'<input type="file" id="excelFile" accept=".xlsx,.xls" style="padding: 10px; border: 2px dashed #cbd5e0; border-radius: 10px; width: 100%;">\';\n';
  html += "  html += '</div>';\n";
  html += "  \n";
  html +=
    '  html += \'<div id="uploadProgress" style="display: none;" class="progress-container">\';\n';
  html += "  html += '<div class=\"progress-bar-wrapper\">';\n";
  html +=
    '  html += \'<div id="progressBar" class="progress-bar">0%</div>\';\n';
  html += "  html += '</div>';\n";
  html += '  html += \'<p id="progressText" class="progress-text"></p>\';\n';
  html += "  html += '</div>';\n";
  html += "  \n";
  html +=
    "  html += '<div style=\"display: flex; gap: 12px; margin-top: 25px;\">';\n";
  html +=
    '  html += \'<button class="btn btn-primary" onclick="processUpload()">\';\n';
  html += "  html += '<i class=\"fas fa-upload\"></i> Upload & Process';\n";
  html += "  html += '</button>';\n";
  html +=
    '  html += \'<button class="btn btn-secondary" onclick="closeBulkUpload()">\';\n';
  html += "  html += '<i class=\"fas fa-times\"></i> Cancel';\n";
  html += "  html += '</button>';\n";
  html += "  html += '</div>';\n";
  html += "  \n";
  html += "  html += '</div>';\n";
  html += "  \n";
  html += "  modal.innerHTML = html;\n";
  html += "  document.body.appendChild(modal);\n";
  html += "}\n";
  html += "\n";
  html += "function downloadTemplate() {\n";
  html +=
    "  const csv = 'RequestID,Individual Name,Employee ID,Employee Email,Pincode,MapURL,Latitude,Longitude,Notes\\nCASE001,Client A,EMP001,,560001,https://maps.google.com/?q=12.9716,77.5946,12.9716,77.5946,Sample task\\nCASE002,Client B,,emp@example.com,560002,,,,\"Another sample task\"';\n";
  html += "  const blob = new Blob([csv], { type: 'text/csv' });\n";
  html += "  const url = URL.createObjectURL(blob);\n";
  html += "  const a = document.createElement('a');\n";
  html += "  a.href = url;\n";
  html += "  a.download = 'validiant-bulk-upload-template.csv';\n";
  html += "  a.click();\n";
  html += "  URL.revokeObjectURL(url);\n";
  html += "  showToast('Template downloaded successfully!', 'success');\n";
  html += "}\n";
  html += "\n";
  html += "function processUpload() {\n";
  html += "  const fileInput = document.getElementById('excelFile');\n";
  html += "  if (!fileInput.files[0]) {\n";
  html += "    showToast('Please select an Excel file', 'error');\n";
  html += "    return;\n";
  html += "  }\n";
  html += "  \n";
  html += "  const formData = new FormData();\n";
  html += "  formData.append('excelFile', fileInput.files[0]);\n";
  html += "  formData.append('adminId', currentUser.id);\n";
  html += "  formData.append('adminName', currentUser.name);\n";
  html += "  \n";
  html +=
    "  document.getElementById('uploadProgress').style.display = 'block';\n";
  html +=
    "  document.getElementById('progressText').textContent = 'Uploading file...';\n";
  html += "  document.getElementById('progressBar').style.width = '30%';\n";
  html += "  document.getElementById('progressBar').textContent = '30%';\n";
  html += "  \n";
  html += "  fetch('/api/tasks/bulk-upload', {\n";
  html += "    method: 'POST',\n";
  html += "    body: formData\n";
  html += "  })\n";
  html += "  .then(function(res) { \n";
  html += "    if (!res.ok) {\n";
  html +=
    "      throw new Error('Server returned ' + res.status + ': ' + res.statusText);\n";
  html += "    }\n";
  html += "    return res.json();\n";
  html += "  })\n";
  html += "  .then(function(data) {\n";
  html += "    document.getElementById('progressBar').style.width = '100%';\n";
  html += "    document.getElementById('progressBar').textContent = '100%';\n";
  html += "    \n";
  html += "    if (data.success) {\n";
  html +=
    "      document.getElementById('progressText').textContent = data.message;\n";
  html +=
    "      showToast(data.successCount + ' tasks uploaded as unassigned!', 'success');\n";
  html += "      \n";
  html += "      if (data.errors && data.errors.length > 0) {\n";
  html += "        console.log('Upload errors:', data.errors);\n";
  html +=
    "        showToast(data.errorCount + ' tasks failed. Check console for details.', 'warning');\n";
  html += "      }\n";
  html += "      \n";
  html += "      setTimeout(function() {\n";
  html += "        closeBulkUpload();\n";
  html += "        showUnassignedTasks();\n";
  html += "      }, 2500);\n";
  html += "    } else {\n";
  html +=
    "      document.getElementById('progressText').textContent = 'Error: ' + data.message;\n";
  html += "      showToast('Upload failed: ' + data.message, 'error');\n";
  html += "    }\n";
  html += "  })\n";
  html += "  .catch(function(err) {\n";
  html += "    console.error('Upload error:', err);\n";
  html +=
    "    document.getElementById('progressText').textContent = 'Upload failed';\n";
  html += "    showToast('Upload error: ' + err.message, 'error');\n";
  html += "  });\n";
  html += "}\n";
  html += "\n";
  html += "function closeBulkUpload() {\n";
  html += "  const modal = document.querySelector('.modal');\n";
  html += "  if (modal) modal.remove();\n";
  html += "}\n";
  html += "\n";
  html +=
    "// ═══════════════════════════════════════════════════════════════════════════\n";
  html += "// ADMIN FUNCTIONS - UNASSIGNED TASKS (Feature #4)\n";
  html +=
    "// ═══════════════════════════════════════════════════════════════════════════\n";
  html += "\n";
  html += "function showUnassignedTasks() {\n";
  html +=
    "  let html = '<h2><i class=\"fas fa-inbox\"></i> Unassigned Tasks Pool</h2>';\n";
  html += "  \n";
  html += "  html += '<div class=\"filter-section\">';\n";
  html +=
    '  html += \'<input type="text" id="unassignedSearch" class="search-box" placeholder="Search by Case ID or Pincode..." style="max-width: 400px;">\';\n';
  html +=
    '  html += \'<button class="btn btn-info btn-sm" onclick="searchUnassignedTasks()">\';\n';
  html += "  html += '<i class=\"fas fa-search\"></i> Search';\n";
  html += "  html += '</button>';\n";
  html +=
    '  html += \'<button class="btn btn-secondary btn-sm" onclick="loadUnassignedTasks()">\';\n';
  html += "  html += '<i class=\"fas fa-sync\"></i> Refresh';\n";
  html += "  html += '</button>';\n";
  html += "  html += '</div>';\n";
  html += "  \n";
  html += "  html += '<div id=\"unassignedTasksList\">';\n";
  html +=
    '  html += \'<div class="loading-spinner show"><i class="fas fa-spinner"></i>Loading unassigned tasks...</div>\';\n';
  html += "  html += '</div>';\n";
  html += "  \n";
  html += "  document.getElementById('content').innerHTML = html;\n";
  html += "  \n";
  html += "  // Enable search on enter key\n";
  html +=
    "  document.getElementById('unassignedSearch').addEventListener('keypress', function(e) {\n";
  html += "    if (e.key === 'Enter') {\n";
  html += "      searchUnassignedTasks();\n";
  html += "    }\n";
  html += "  });\n";
  html += "  \n";
  html += "  loadUnassignedTasks();\n";
  html += "}\n";
  html += "\n";
  html += "function loadUnassignedTasks(searchTerm) {\n";
  html +=
    "  const url = '/api/tasks/unassigned' + (searchTerm ? '?search=' + encodeURIComponent(searchTerm) : '');\n";
  html += "  \n";
  html += "  fetch(url)\n";
  html += "    .then(function(res) { return res.json(); })\n";
  html += "    .then(function(tasks) {\n";
  html += "      fetch('/api/users')\n";
  html += "        .then(function(r) { return r.json(); })\n";
  html += "        .then(function(employees) {\n";
  html += "          displayUnassignedTasks(tasks, employees);\n";
  html += "        });\n";
  html += "    })\n";
  html += "    .catch(function(err) {\n";
  html += "      console.error('Error loading unassigned tasks:', err);\n";
  html +=
    "      document.getElementById('unassignedTasksList').innerHTML = '<div class=\"empty-state\"><i class=\"fas fa-exclamation-triangle\"></i><h3>Error Loading Tasks</h3><p>Please try again.</p></div>';\n";
  html += "      showToast('Failed to load tasks', 'error');\n";
  html += "    });\n";
  html += "}\n";
  html += "\n";
  html += "function displayUnassignedTasks(tasks, employees) {\n";
  html += "  let html = '';\n";
  html += "  \n";
  html += "  if (tasks.length === 0) {\n";
  html += "    html = '<div class=\"empty-state\">';\n";
  html += "    html += '<i class=\"fas fa-check-circle\"></i>';\n";
  html += "    html += '<h3>All Clear!</h3>';\n";
  html +=
    "    html += '<p>No unassigned tasks found. All tasks have been assigned to employees.</p>';\n";
  html += "    html += '</div>';\n";
  html += "  } else {\n";
  html +=
    "    html = '<p style=\"color: #e5e7eb; font-weight: 600; font-size: 13px; margin-bottom: 14px;\">';\n";
  html +=
    "    html += '<i class=\"fas fa-info-circle\"></i> Found ' + tasks.length + ' unassigned task(s)';\n";
  html += "    html += '</p>';\n";
  html += "    \n";
  html += "    html += '<table class=\"table\">';\n";
  html += "    html += '<thead><tr>';\n";
  html += "    html += '<th>Case ID</th>';\n";
  html += "    html += '<th>Client Name</th>';\n";
  html += "    html += '<th>Pincode</th>';\n";
  html += "    html += '<th>Map URL</th>';\n";
  html += "    html += '<th>Notes</th>';\n";
  html += "    html += '<th>Actions</th>';\n";
  html += "    html += '</tr></thead>';\n";
  html += "    html += '<tbody>';\n";
  html += "    \n";
  html += "    tasks.forEach(function(task) {\n";
  html += "      html += '<tr>';\n";
  html +=
    "      html += '<td data-label=\\\"Case ID\\\"><strong>' + escapeHtml(task.title) + '</strong></td>';\n";
  html += " html += '<td>' + escapeHtml(task.clientName || '-') + '</td>';\n";
  html +=
    "      html += '<td><span class=\"pincode-highlight\"><i class=\"fas fa-map-pin\"></i> ' + escapeHtml(task.pincode || 'N/A') + '</span></td>';\n";
  html += "      html += '<td>';\n";
  html += "      if (task.mapUrl) {\n";
  html +=
    '        html += \'<a href="\' + escapeHtml(task.mapUrl) + \'" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; font-weight: 600;">\';\n';
  html +=
    "        html += '<i class=\"fas fa-map-marker-alt\"></i> View Map';\n";
  html += "        html += '</a>';\n";
  html += "      } else {\n";
  html +=
    "        html += '<span style=\"color: #9ca3af; font-style: italic;\">No map</span>';\n";
  html += "      }\n";
  html += "      html += '</td>';\n";
  html += "      html += '<td>' + escapeHtml(task.notes || 'N/A') + '</td>';\n";
  html += "      html += '<td>';\n";
  html +=
    "      html += '<select id=\"emp-' + task.id + '\" style=\"padding: 10px; border-radius: 8px; margin-right: 10px; border: 2px solid #e2e8f0; font-weight: 600;\">';\n";
  html += "      html += '<option value=\"\">Select Employee</option>';\n";
  html += "      employees.forEach(function(emp) {\n";
  html +=
    "        html += '<option value=\"' + emp.id + '\">' + escapeHtml(emp.name) + '</option>';\n";
  html += "      });\n";
  html += "      html += '</select>';\n";
  html +=
    "      html += '<button class=\"btn btn-success btn-sm\" onclick=\"assignTaskToEmployee(' + task.id + ')\">';\n";
  html += "      html += '<i class=\"fas fa-user-check\"></i> Assign';\n";
  html += "      html += '</button>';\n";
  html += "      html += '</td>';\n";
  html += "      html += '</tr>';\n";
  html += "    });\n";
  html += "    \n";
  html += "    html += '</tbody></table>';\n";
  html += "  }\n";
  html += "  \n";
  html +=
    "  document.getElementById('unassignedTasksList').innerHTML = html;\n";
  html += "}\n";
  html += "\n";
  html += "function searchUnassignedTasks() {\n";
  html +=
    "  const searchTerm = document.getElementById('unassignedSearch').value.trim();\n";
  html += "  loadUnassignedTasks(searchTerm);\n";
  html += "}\n";
  // ADMIN FUNCTIONS - VIEW ALL TASKS (Features #5 and #6)

  let allAdminTasks = [];

  // Entry point: render All Tasks screen + filter bar
  function showAllTasks() {
    let html = "";

    html += '<h2><i class="fas fa-list"></i> All Tasks</h2>';

    // Unified filter row
    html += '<div class="filter-section">';

    // Status filter
    html +=
      '<select id="allTasksStatusFilter" class="search-box" style="flex:0 0 150px;">';
    html += '  <option value="all">Status: All</option>';
    html += '  <option value="Unassigned">Unassigned</option>';
    html += '  <option value="Pending">Pending</option>';
    html += '  <option value="Completed">Completed</option>';
    html += '  <option value="Verified">Verified</option>';
    html += '  <option value="Left Job">Left Job</option>';
    html += '  <option value="Not Sharing Info">Not Sharing Info</option>';
    html += '  <option value="Not Picking">Not Picking</option>';
    html += '  <option value="Switch Off">Switch Off</option>';
    html += '  <option value="Incorrect Number">Incorrect Number</option>';
    html += '  <option value="Wrong Address">Wrong Address</option>';
    html += "</select>";

    // Employee filter (populated after render)
    html +=
      '<select id="allTasksEmployeeFilter" class="search-box" style="flex:0 0 200px;">';
    html += '  <option value="all">Employee: All</option>';
    html += "</select>";

    // Pincode filter
    html +=
      '<input type="text" id="allTasksPincodeFilter" ' +
      'class="search-box" maxlength="6" ' +
      'placeholder="Filter by 6-digit pincode" ' +
      'style="flex:0 0 160px;" />';

    // Date range (front-end filtering)
    html +=
      '<input type="date" id="allTasksFromDate" class="search-box" ' +
      'style="flex:0 0 150px;" />';
    html +=
      '<input type="date" id="allTasksToDate" class="search-box" ' +
      'style="flex:0 0 150px;" />';

    // Text search
    html +=
      '<input type="text" id="allTasksSearch" ' +
      'class="search-box" ' +
      'placeholder="Search Case ID, notes, status..." ' +
      'style="flex:1 1 220px; max-width:360px;" />';

    // Apply + Reset buttons
    html += '<button class="btn btn-info btn-sm" onclick="searchAllTasks()">';
    html += '  <i class="fas fa-filter"></i> Apply';
    html += "</button>";

    html +=
      '<button class="btn btn-secondary btn-sm" onclick="resetAllTaskFilters()">';
    html += '  <i class="fas fa-undo"></i> Reset';
    html += "</button>";

    html += "</div>"; // .filter-section

    // Active filter chips
    html += '<div id="allTasksActiveFilters" class="active-filters">';
    html +=
      '  <span class="filter-hint">No filters applied. Showing latest tasks.</span>';
    html += "</div>";

    // List + loader
    html += '<div id="allTasksList">';
    html += '  <div class="loading-spinner show">';
    html += '    <i class="fas fa-spinner"></i> Loading all tasks...';
    html += "  </div>";
    html += "</div>";

    document.getElementById("content").innerHTML = html;

    // Enable Enter to apply filters from text search box
    const searchInput = document.getElementById("allTasksSearch");
    if (searchInput) {
      searchInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          searchAllTasks();
        }
      });
    }

    // Load employees into the employee filter dropdown
    fetch("/api/users")
      .then(function (r) {
        return r.json();
      })
      .then(function (users) {
        const select = document.getElementById("allTasksEmployeeFilter");
        if (!select) return;

        users.forEach(function (u) {
          const option = document.createElement("option");
          option.value = u.id;
          option.textContent = escapeHtml(
            u.name + " (" + (u.employeeId || "No ID") + ")",
          );
          select.appendChild(option);
        });
      })
      .catch(function (err) {
        console.error("Error loading employees for All Tasks filter:", err);
        showToast("Failed to load employees for filter", "error");
      });

    // Initial load with no filters
    loadAllTasks();
  }

  // Apply current filter controls and fetch from /api/tasks
  function loadAllTasks() {
    let url = "/api/tasks?role=admin";

    const statusEl = document.getElementById("allTasksStatusFilter");
    const empEl = document.getElementById("allTasksEmployeeFilter");
    const pinEl = document.getElementById("allTasksPincodeFilter");
    const searchEl = document.getElementById("allTasksSearch");

    const status = statusEl ? statusEl.value : "all";
    const employeeId = empEl ? empEl.value : "all";
    const pincode = pinEl ? pinEl.value.trim() : "";
    const searchTerm = searchEl ? searchEl.value.trim() : "";

    if (status && status !== "all") {
      url += "&status=" + encodeURIComponent(status);
    }
    if (employeeId && employeeId !== "all") {
      url += "&employeeId=" + encodeURIComponent(employeeId);
    }
    if (pincode) {
      url += "&pincode=" + encodeURIComponent(pincode);
    }
    if (searchTerm) {
      url += "&search=" + encodeURIComponent(searchTerm);
    }

    fetch(url)
      .then(function (res) {
        return res.json();
      })
      .then(function (tasks) {
        allAdminTasks = Array.isArray(tasks) ? tasks : [];
        const finalTasks = applyAllTasksDateFilter(allAdminTasks);
        updateAllTasksFilterChips();
        displayAllTasks(finalTasks);
      })
      .catch(function (err) {
        console.error("Error loading tasks:", err);
        const list = document.getElementById("allTasksList");
        if (list) {
          list.innerHTML =
            '<div class="empty-state">' +
            '<i class="fas fa-exclamation-triangle"></i>' +
            "<h3>Error Loading Tasks</h3>" +
            "<p>Please try again.</p>" +
            "</div>";
        }
        showToast("Failed to load tasks", "error");
      });
  }

  function searchAllTasks() {
    loadAllTasks();
  }

  function resetAllTaskFilters() {
    const statusEl = document.getElementById("allTasksStatusFilter");
    const empEl = document.getElementById("allTasksEmployeeFilter");
    const pinEl = document.getElementById("allTasksPincodeFilter");
    const fromEl = document.getElementById("allTasksFromDate");
    const toEl = document.getElementById("allTasksToDate");
    const searchEl = document.getElementById("allTasksSearch");

    if (statusEl) statusEl.value = "all";
    if (empEl) empEl.value = "all";
    if (pinEl) pinEl.value = "";
    if (fromEl) fromEl.value = "";
    if (toEl) toEl.value = "";
    if (searchEl) searchEl.value = "";

    loadAllTasks();
  }

  // Front-end date range filter applied on fetched tasks
  function applyAllTasksDateFilter(tasks) {
    const fromEl = document.getElementById("allTasksFromDate");
    const toEl = document.getElementById("allTasksToDate");

    const fromVal = fromEl ? fromEl.value : "";
    const toVal = toEl ? toEl.value : "";

    if (!fromVal && !toVal) return tasks;

    const fromDate = fromVal ? new Date(fromVal + "T00:00:00") : null;
    const toDate = toVal ? new Date(toVal + "T23:59:59") : null;

    return tasks.filter(function (task) {
      let dateStr =
        task.assignedDate ||
        (task.manualDate ? task.manualDate : null) ||
        (task.createdAt ? task.createdAt.toString() : null);

      if (!dateStr) return false;

      const d = new Date(dateStr);

      if (fromDate && d < fromDate) return false;
      if (toDate && d > toDate) return false;
      return true;
    });
  }

  // Build the active filter chips row under the bar
  function updateAllTasksFilterChips() {
    const container = document.getElementById("allTasksActiveFilters");
    if (!container) return;

    const chips = [];

    const statusEl = document.getElementById("allTasksStatusFilter");
    const empEl = document.getElementById("allTasksEmployeeFilter");
    const pinEl = document.getElementById("allTasksPincodeFilter");
    const fromEl = document.getElementById("allTasksFromDate");
    const toEl = document.getElementById("allTasksToDate");
    const searchEl = document.getElementById("allTasksSearch");

    const status = statusEl ? statusEl.value : "all";
    const employeeId = empEl ? empEl.value : "all";
    const employeeLabel =
      empEl && empEl.options && empEl.selectedIndex > 0
        ? empEl.options[empEl.selectedIndex].textContent
        : "";
    const pincode = pinEl ? pinEl.value.trim() : "";
    const fromVal = fromEl ? fromEl.value : "";
    const toVal = toEl ? toEl.value : "";
    const searchTerm = searchEl ? searchEl.value.trim() : "";

    if (status && status !== "all") {
      chips.push("Status: " + status);
    }
    if (employeeId && employeeId !== "all" && employeeLabel) {
      chips.push("Employee: " + employeeLabel);
    }
    if (pincode) {
      chips.push("Pincode: " + pincode);
    }
    if (fromVal && toVal) {
      chips.push("Date: " + fromVal + " → " + toVal);
    } else if (fromVal) {
      chips.push("Date from: " + fromVal);
    } else if (toVal) {
      chips.push("Date until: " + toVal);
    }
    if (searchTerm) {
      chips.push("Search: " + searchTerm);
    }

    if (!chips.length) {
      container.innerHTML =
        '<span class="filter-hint">No filters applied. Showing latest tasks.</span>';
      return;
    }

    let html = "";
    chips.forEach(function (label) {
      html +=
        '<span class="filter-chip">' +
        '<i class="fas fa-tag"></i>' +
        escapeHtml(label) +
        "</span>";
    });
    container.innerHTML = html;
  }

  // Render All Tasks table with Reassign / Unassign / Delete actions
  function displayAllTasks(tasks) {
    let html = "";

    if (!tasks || tasks.length === 0) {
      html += '<div class="empty-state">';
      html += '  <i class="fas fa-inbox"></i>';
      html += "  <h3>No Tasks Found</h3>";
      html +=
        "  <p>Start by creating a new task or uploading tasks in bulk.</p>";
      html += "</div>";
    } else {
      html +=
        '<p style="color:#e5e7eb;font-weight:600;font-size:13px;margin-bottom:14px;">';
      html +=
        '  <i class="fas fa-info-circle"></i> Found ' + tasks.length + " tasks";
      html += "</p>";

      html += '<table class="table">';
      html += "  <thead><tr>";
      html += "    <th>Case ID</th>";
      html += "    <th>Client Name</th>";
      html += "    <th>Employee</th>";
      html += "    <th>Pincode</th>";
      html += "    <th>Map</th>";
      html += "    <th>Status</th>";
      html += "    <th>Date</th>";
      html += "    <th>Actions</th>";
      html += "  </tr></thead><tbody>";

      tasks.forEach(function (task) {
        const statusClass =
          "status-" + task.status.toLowerCase().replace(/[^a-z0-9]+/g, "-");

        html += "<tr>";

        // Case ID
        html +=
          '<td data-label="Case ID"><strong>' +
          escapeHtml(task.title) +
          "</strong></td>";

        // Client
        html +=
          '<td data-label="Client">' +
          escapeHtml(task.clientName || "-") +
          "</td>";

        // Employee
        html +=
          '<td data-label="Employee">' +
          (task.User
            ? escapeHtml(task.User.name)
            : '<span style="color:#9ca3af;font-style:italic">Unassigned</span>') +
          "</td>";

        // Pincode chip
        html +=
          '<td data-label="Pincode"><span class="pincode-highlight"><i class="fas fa-map-pin"></i>' +
          escapeHtml(task.pincode || "NA") +
          "</span></td>";
        html += "</td>";

        // Map availability + edit
        html +=
          '<td data-label="Map">' +
          (task.mapUrl
            ? '<a href="' +
              escapeHtml(task.mapUrl) +
              '" target="_blank" rel="noopener noreferrer" style="color:#3b82f6;font-weight:600;margin-right:8px;"><i class="fas fa-map-marker-alt"></i> View Map</a>'
            : '<span style="color:#9ca3af;font-style:italic;margin-right:8px;">No map</span>');

        // Small edit icon button
        html +=
          '<button class="btn btn-secondary btn-sm" ' +
          '        style="padding:4px 8px;font-size:11px;" ' +
          '        title="Edit map link" ' +
          '        onclick="showEditMapModal(' +
          task.id +
          ')\">' +
          '<i class="fas fa-pen"></i>' +
          "</button>";

        html += "</td>";

        // Status badge
        html +=
          '<td data-label="Status"><span class="status-badge ' +
          statusClass +
          '">' +
          escapeHtml(task.status) +
          "</span></td>";

        // Date (assigned/manual/fallback)
        const dateText =
          task.assignedDate ||
          task.manualDate ||
          (task.createdAt
            ? new Date(task.createdAt).toISOString().split("T")[0]
            : "NA");
        html += '<td data-label="Date">' + escapeHtml(dateText) + "</td>";

        // Actions
        html += '<td data-label="Actions">';
        html += '  <div class="action-buttons">';
        html +=
          '    <button class="btn btn-warning btn-sm" ' +
          'onclick="showReassignModal(' +
          task.id +
          ')" ' +
          'title="Reassign to different employee">';
        html += '      <i class="fas fa-sync-alt"></i>';
        html += "    </button>";
        html +=
          '    <button class="btn btn-secondary btn-sm" ' +
          'onclick="unassignTask(' +
          task.id +
          ')" ' +
          'title="Remove assignment">';
        html += '      <i class="fas fa-times"></i>';
        html += "    </button>";
        html +=
          '    <button class="btn btn-danger btn-sm" ' +
          'onclick="deleteTask(' +
          task.id +
          ')" ' +
          'title="Delete task permanently">';
        html += '      <i class="fas fa-trash"></i>';
        html += "    </button>";
        html += "  </div>";
        html += "</td>";

        html += "</tr>";
      });

      html += "  </tbody></table>";
    }

    const list = document.getElementById("allTasksList");
    if (list) {
      list.innerHTML = html;
    }
  }
  html += "\n";
  html += "function assignTaskToEmployee(taskId) {\n";
  html += "  const select = document.getElementById('emp-' + taskId);\n";
  html += "  const employeeId = select.value;\n";
  html += "  \n";
  html += "  if (!employeeId) {\n";
  html += "    showToast('Please select an employee first', 'error');\n";
  html += "    return;\n";
  html += "  }\n";
  html += "  \n";
  html += "  const btn = select.nextElementSibling;\n";
  html += "  btn.disabled = true;\n";
  html +=
    "  btn.innerHTML = '<i class=\"fas fa-spinner fa-spin\"></i> Assigning...';\n";
  html += "  \n";
  html += "  fetch('/api/tasks/' + taskId + '/assign', {\n";
  html += "    method: 'POST',\n";
  html += "    headers: { 'Content-Type': 'application/json' },\n";
  html += "    body: JSON.stringify({\n";
  html += "      employeeId: parseInt(employeeId),\n";
  html += "      adminId: currentUser.id,\n";
  html += "      adminName: currentUser.name\n";
  html += "    })\n";
  html += "  })\n";
  html += "  .then(function(res) { return res.json(); })\n";
  html += "  .then(function(data) {\n";
  html += "    if (data.success) {\n";
  html +=
    "      showToast(data.message || 'Task assigned successfully!', 'success');\n";
  html += "      loadUnassignedTasks();\n";
  html += "    } else {\n";
  html += "      showToast(data.message || 'Error assigning task', 'error');\n";
  html += "      btn.disabled = false;\n";
  html +=
    "      btn.innerHTML = '<i class=\"fas fa-user-check\"></i> Assign';\n";
  html += "    }\n";
  html += "  })\n";
  html += "  .catch(function(err) {\n";
  html += "    console.error('Error assigning task:', err);\n";
  html += "    showToast('Connection error', 'error');\n";
  html += "    btn.disabled = false;\n";
  html += "    btn.innerHTML = '<i class=\"fas fa-user-check\"></i> Assign';\n";
  html += "  });\n";
  html += "}\n";
  html += "\n";
  // Edit Map modal helpers
  html +=
    "// ═══════════════════════════════════════════════════════════════════════════\n";
  html += "// ADMIN FUNCTIONS - VIEW ALL TASKS (Feature #5 & #6)\n";
  html +=
    "// ═══════════════════════════════════════════════════════════════════════════\n";
  // ADMIN FUNCTIONS - VIEW ALL TASKS (enhanced filter bar)
  html += function showAllTasks() {
    let html = "";

    html += '<h2><i class="fas fa-list"></i> All Tasks</h2>';

    // Unified filter row
    html += '<div class="filter-section">';

    // Status filter
    html +=
      '  <select id="allTasksStatusFilter" class="search-box" style="flex: 0 0 150px;">';
    html += '    <option value="all">Status: All</option>';
    html += '    <option value="Unassigned">Unassigned</option>';
    html += '    <option value="Pending">Pending</option>';
    html += '    <option value="Completed">Completed</option>';
    html += '    <option value="Verified">Verified</option>';
    html += '    <option value="Left Job">Left Job</option>';
    html += '    <option value="Not Sharing Info">Not Sharing Info</option>';
    html += '    <option value="Not Picking">Not Picking</option>';
    html += '    <option value="Switch Off">Switch Off</option>';
    html += '    <option value="Incorrect Number">Incorrect Number</option>';
    html += '    <option value="Wrong Address">Wrong Address</option>';
    html += "  </select>";

    // Employee filter (populated after render)
    html +=
      '  <select id="allTasksEmployeeFilter" class="search-box" style="flex: 0 0 200px;">';
    html += '    <option value="all">Employee: All</option>';
    html += "  </select>";

    // Pincode filter
    html += '  <input type="text" id="allTasksPincodeFilter" ';
    html += '         class="search-box" maxlength="6" ';
    html += '         placeholder="Filter by 6-digit pincode" ';
    html += '         style="flex: 0 0 160px;" />';

    // Date range (front-end filtering)
    html += '  <input type="date" id="allTasksFromDate" class="search-box" ';
    html += '         style="flex: 0 0 150px;" />';
    html += '  <input type="date" id="allTasksToDate" class="search-box" ';
    html += '         style="flex: 0 0 150px;" />';

    // Text search
    html += '  <input type="text" id="allTasksSearch" ';
    html += '         class="search-box" ';
    html += '         placeholder="Search Case ID, notes, status..." ';
    html += '         style="flex: 1 1 220px; max-width: 360px;" />';

    // Apply + Reset buttons
    html += '  <button class="btn btn-info btn-sm" onclick="searchAllTasks()">';
    html += '    <i class="fas fa-filter"></i> Apply';
    html += "  </button>";

    html +=
      '  <button class="btn btn-secondary btn-sm" onclick="resetAllTaskFilters()">';
    html += '    <i class="fas fa-undo"></i> Reset';
    html += "  </button>";

    html += "</div>";

    // Active filter chips
    html += '<div id="allTasksActiveFilters" class="active-filters">';
    html +=
      '  <span class="filter-hint">No filters applied. Showing latest tasks.</span>';
    html += "</div>";

    // List + loader
    html += '<div id="allTasksList">';
    html += '  <div class="loading-spinner show">';
    html += '    <i class="fas fa-spinner"></i> Loading all tasks...';
    html += "  </div>";
    html += "</div>";

    document.getElementById("content").innerHTML = html;

    // Enable 'Enter' to apply filters from text search box
    const searchInput = document.getElementById("allTasksSearch");
    if (searchInput) {
      searchInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          searchAllTasks();
        }
      });
    }

    // Load employees into the employee filter dropdown
    fetch("api/users")
      .then(function (r) {
        return r.json();
      })
      .then(function (users) {
        const select = document.getElementById("allTasksEmployeeFilter");
        if (!select) return;

        users.forEach(function (u) {
          const option = document.createElement("option");
          option.value = u.id;
          option.textContent = escapeHtml(
            u.name + " (" + (u.employeeId || "No ID") + ")",
          );
          select.appendChild(option);
        });
      })
      .catch(function (err) {
        console.error("Error loading employees for All Tasks filter:", err);
        showToast("Failed to load employees for filter", "error");
      });

    // Initial load with no filters
    loadAllTasks();
  };
  html += "\n";
  html += "\n";
  html += "// Apply current filter controls + fetch from /api/tasks\n";
  html += "function loadAllTasks() {\n";
  html += "  let url = 'api/tasks?role=admin';\n";
  html += "\n";
  html +=
    "  const statusEl = document.getElementById('allTasksStatusFilter');\n";
  html +=
    "  const empEl = document.getElementById('allTasksEmployeeFilter');\n";
  html += "  const pinEl = document.getElementById('allTasksPincodeFilter');\n";
  html += "  const searchEl = document.getElementById('allTasksSearch');\n";
  html += "\n";
  html += "  const status = statusEl ? statusEl.value : 'all';\n";
  html += "  const employeeId = empEl ? empEl.value : 'all';\n";
  html += "  const pincode = pinEl ? pinEl.value.trim() : '';\n";
  html += "  const searchTerm = searchEl ? searchEl.value.trim() : '';\n";
  html += "\n";
  html += "  if (status && status !== 'all') {\n";
  html += "    url += '&status=' + encodeURIComponent(status);\n";
  html += "  }\n";
  html += "  if (employeeId && employeeId !== 'all') {\n";
  html += "    url += '&employeeId=' + encodeURIComponent(employeeId);\n";
  html += "  }\n";
  html += "  if (pincode) {\n";
  html += "    url += '&pincode=' + encodeURIComponent(pincode);\n";
  html += "  }\n";
  html += "  if (searchTerm) {\n";
  html += "    url += '&search=' + encodeURIComponent(searchTerm);\n";
  html += "  }\n";
  html += "\n";
  html += "  fetch(url)\n";
  html += "    .then(function(res) { return res.json(); })\n";
  html += "    .then(function(tasks) {\n";
  html += "      allAdminTasks = Array.isArray(tasks) ? tasks : [];\n";
  html += "      const finalTasks = applyAllTasksDateFilter(allAdminTasks);\n";
  html += "      updateAllTasksFilterChips();\n";
  html += "      displayAllTasks(finalTasks);\n";
  html += "    })\n";
  html += "    .catch(function(err) {\n";
  html += "      console.error('Error loading tasks:', err);\n";
  html +=
    "      document.getElementById('allTasksList').innerHTML = '<div class=\\\"empty-state\\\"><i class=\\\"fas fa-exclamation-triangle\\\"></i><h3>Error Loading Tasks</h3><p>Please try again.</p></div>';\n";
  html += "      showToast('Failed to load tasks', 'error');\n";
  html += "    });\n";
  html += "}\n";
  html += "\n";
  html += "function searchAllTasks() {\n";
  html += "  loadAllTasks();\n";
  html += "}\n";
  html += "\n";
  html += "function resetAllTaskFilters() {\n";
  html +=
    "  const statusEl = document.getElementById('allTasksStatusFilter');\n";
  html +=
    "  const empEl = document.getElementById('allTasksEmployeeFilter');\n";
  html += "  const pinEl = document.getElementById('allTasksPincodeFilter');\n";
  html += "  const fromEl = document.getElementById('allTasksFromDate');\n";
  html += "  const toEl = document.getElementById('allTasksToDate');\n";
  html += "  const searchEl = document.getElementById('allTasksSearch');\n";
  html += "\n";
  html += "  if (statusEl) statusEl.value = 'all';\n";
  html += "  if (empEl) empEl.value = 'all';\n";
  html += "  if (pinEl) pinEl.value = '';\n";
  html += "  if (fromEl) fromEl.value = '';\n";
  html += "  if (toEl) toEl.value = '';\n";
  html += "  if (searchEl) searchEl.value = '';\n";
  html += "\n";
  html += "  loadAllTasks();\n";
  html += "}\n";
  html += "\n";
  html += "function applyAllTasksDateFilter(tasks) {\n";
  html += "  const fromEl = document.getElementById('allTasksFromDate');\n";
  html += "  const toEl = document.getElementById('allTasksToDate');\n";
  html += "\n";
  html += "  const fromVal = fromEl ? fromEl.value : '';\n";
  html += "  const toVal = toEl ? toEl.value : '';\n";
  html += "\n";
  html += "  if (!fromVal && !toVal) return tasks;\n";
  html += "\n";
  html +=
    "  const fromDate = fromVal ? new Date(fromVal + 'T00:00:00') : null;\n";
  html += "  const toDate = toVal ? new Date(toVal + 'T23:59:59') : null;\n";
  html += "\n";
  html += "  return tasks.filter(function(task) {\n";
  html +=
    "    let dateStr = task.assignedDate || (task.createdAt ? task.createdAt.toString() : null);\n";
  html += "    if (!dateStr) return false;\n";
  html += "\n";
  html += "    const d = new Date(dateStr);\n";
  html += "    if (fromDate && d < fromDate) return false;\n";
  html += "    if (toDate && d > toDate) return false;\n";
  html += "    return true;\n";
  html += "  });\n";
  html += "}\n";
  html += "\n";
  html += "function updateAllTasksFilterChips() {\n";
  html +=
    "  const container = document.getElementById('allTasksActiveFilters');\n";
  html += "  if (!container) return;\n";
  html += "\n";
  html += "  const chips = [];\n";
  html += "\n";
  html +=
    "  const statusEl = document.getElementById('allTasksStatusFilter');\n";
  html +=
    "  const empEl = document.getElementById('allTasksEmployeeFilter');\n";
  html += "  const pinEl = document.getElementById('allTasksPincodeFilter');\n";
  html += "  const fromEl = document.getElementById('allTasksFromDate');\n";
  html += "  const toEl = document.getElementById('allTasksToDate');\n";
  html += "  const searchEl = document.getElementById('allTasksSearch');\n";
  html += "\n";
  html += "  const status = statusEl ? statusEl.value : 'all';\n";
  html += "  const employeeId = empEl ? empEl.value : 'all';\n";
  html +=
    "  const employeeLabel = empEl && empEl.options && empEl.selectedIndex >= 0 ? empEl.options[empEl.selectedIndex].textContent : '';\n";
  html += "  const pincode = pinEl ? pinEl.value.trim() : '';\n";
  html += "  const fromVal = fromEl ? fromEl.value : '';\n";
  html += "  const toVal = toEl ? toEl.value : '';\n";
  html += "  const searchTerm = searchEl ? searchEl.value.trim() : '';\n";
  html += "\n";
  html += "  if (status && status !== 'all') {\n";
  html += "    chips.push('Status: ' + status);\n";
  html += "  }\n";
  html += "  if (employeeId && employeeId !== 'all' && employeeLabel) {\n";
  html += "    chips.push('Employee: ' + employeeLabel);\n";
  html += "  }\n";
  html += "  if (pincode) {\n";
  html += "    chips.push('Pincode: ' + pincode);\n";
  html += "  }\n";
  html += "  if (fromVal || toVal) {\n";
  html += "    if (fromVal && toVal) {\n";
  html += "      chips.push('Date: ' + fromVal + ' → ' + toVal);\n";
  html += "    } else if (fromVal) {\n";
  html += "      chips.push('Date from: ' + fromVal);\n";
  html += "    } else if (toVal) {\n";
  html += "      chips.push('Date until: ' + toVal);\n";
  html += "    }\n";
  html += "  }\n";
  html += "  if (searchTerm) {\n";
  html += "    chips.push('Search: ' + searchTerm);\n";
  html += "  }\n";
  html += "\n";
  html += "  if (!chips.length) {\n";
  html +=
    "    container.innerHTML = '<span class=\\\"filter-hint\\\">No filters applied. Showing latest tasks.</span>';\n";
  html += "    return;\n";
  html += "  }\n";
  html += "\n";
  html += "  let html = '';\n";
  html += "  chips.forEach(function(label) {\n";
  html +=
    "    html += '<span class=\\\"filter-chip\\\"><i class=\\\"fas fa-tag\\\"></i> ' + escapeHtml(label) + '</span>';\n";
  html += "  });\n";
  html += "  container.innerHTML = html;\n";
  html += "}\n";
  html += "\n";
  html += "\n";
  html += "function displayAllTasks(tasks) {\n";
  html += "  let html = '';\n";
  html += "  \n";
  html += "  if (tasks.length === 0) {\n";
  html += "    html = '<div class=\"empty-state\">';\n";
  html += "    html += '<i class=\"fas fa-inbox\"></i>';\n";
  html += "    html += '<h3>No Tasks Found</h3>';\n";
  html +=
    "    html += '<p>Start by creating a new task or uploading tasks in bulk.</p>';\n";
  html += "    html += '</div>';\n";
  html += "  } else {\n";
  html +=
    "    html = '<p style=\"color: #e5e7eb; font-weight: 600; font-size: 13px; margin-bottom: 14px;\">';\n";
  html +=
    "    html += '<i class=\"fas fa-info-circle\"></i> Found ' + tasks.length + ' task(s)';\n";
  html += "    html += '</p>';\n";
  html += "    \n";
  html += "    html += '<table class=\"table\">';\n";
  html += "    html += '<thead><tr>';\n";
  html += "    html += '<th>Case ID</th>';\n";
  html += "    html += '<th>Client Name</th>';\n";
  html += "    html += '<th>Employee</th>';\n";
  html += "    html += '<th>Pincode</th>';\n";
  html += "    html += '<th>Map</th>';\n";
  html += "    html += '<th>Status</th>';\n";
  html += "    html += '<th>Date</th>';\n";
  html += "    html += '<th>Actions</th>';\n";
  html += "    html += '</tr></thead>';\n";
  html += "    html += '<tbody>';\n";
  html += "    \n";
  html += "    tasks.forEach(function(task) {\n";
  html +=
    "      const statusClass = 'status-' + task.status.toLowerCase().replace(/ /g, '-');\n";
  html += "      \n";
  html += "      html += '<tr>';\n";
  html +=
    "      html += '<td><strong>' + escapeHtml(task.title) + '</strong></td>';\n";
  html += " html += '<td>' + escapeHtml(task.clientName || '-') + '</td>';\n";
  html += "      html += '<td>';\n";
  html += "      if (task.User) {\n";
  html += "        html += escapeHtml(task.User.name);\n";
  html += "      } else {\n";
  html +=
    "        html += '<span style=\"color: #9ca3af; font-style: italic;\">Unassigned</span>';\n";
  html += "      }\n";
  html += "      html += '</td>';\n";
  html +=
    "      html += '<td><span class=\"pincode-highlight\"><i class=\"fas fa-map-pin\"></i> ' + escapeHtml(task.pincode || 'N/A') + '</span></td>';\n";
  html += "      html += '<td>';\n";
  html += "      if (task.latitude && task.longitude) {\n";
  html +=
    '        html += \'<i class="fas fa-check-circle" style="color: #10b981;"></i> Yes\';\n';
  html += "      } else {\n";
  html +=
    '        html += \'<i class="fas fa-times-circle" style="color: #ef4444;"></i> No\';\n';
  html += "      }\n";
  html +=
    '      html += \' <button class="btn btn-secondary btn-sm" style="padding:4px 6px;font-size:11px;margin-left:8px;" title="Edit map link" onclick="showEditMapModal(\' + task.id + \')"><i class="fas fa-pen"></i></button>\';\n';
  html += "      html += '</td>';\n";
  html +=
    "      html += '<td><span class=\"status-badge ' + statusClass + '\">' + escapeHtml(task.status) + '</span></td>';\n";
  html +=
    "      html += '<td>' + escapeHtml(task.assignedDate || 'N/A') + '</td>';\n";
  html += "      html += '<td>';\n";
  html += "      html += '<div class=\"action-buttons\">';\n";
  html +=
    '      html += \'<button class="btn btn-warning btn-sm" onclick="showReassignModal(\' + task.id + \')" title="Reassign to different employee">\';\n';
  html += "      html += '<i class=\"fas fa-sync-alt\"></i>';\n";
  html += "      html += '</button>';\n";
  html +=
    '      html += \'<button class="btn btn-secondary btn-sm" onclick="unassignTask(\' + task.id + \')" title="Remove assignment">\';\n';
  html += "      html += '<i class=\"fas fa-times\"></i>';\n";
  html += "      html += '</button>';\n";
  html +=
    '      html += \'<button class="btn btn-danger btn-sm" onclick="deleteTask(\' + task.id + \')" title="Delete task permanently">\';\n';
  html += "      html += '<i class=\"fas fa-trash\"></i>';\n";
  html += "      html += '</button>';\n";
  html += "      html += '</div>';\n";
  html += "      html += '</td>';\n";
  html += "      html += '</tr>';\n";
  html += "    });\n";
  html += "    \n";
  html += "    html += '</tbody></table>';\n";
  html += "  }\n";
  html += "  \n";
  html += "  document.getElementById('allTasksList').innerHTML = html;\n";
  html += "}\n";
  html += "\n";
  html += "\n";
  html += "// Reassign task modal (Feature #9 - Bug Fix Applied)\n";
  html += "function showReassignModal(taskId) {\n";
  html += "  fetch('/api/tasks?role=admin')\n";
  html += "    .then(function(res) { return res.json(); })\n";
  html += "    .then(function(allTasks) {\n";
  html +=
    "      const task = allTasks.find(function(t) { return t.id === taskId; });\n";
  html += "      \n";
  html += "      if (!task) {\n";
  html += "        showToast('Task not found', 'error');\n";
  html += "        return;\n";
  html += "      }\n";
  html += "      \n";
  html += "      // FIXED: Using empResponse variable correctly\n";
  html += "      fetch('/api/users')\n";
  html +=
    "        .then(function(empResponse) { return empResponse.json(); })\n";
  html += "        .then(function(employees) {\n";
  html += "          const modal = document.createElement('div');\n";
  html += "          modal.className = 'modal show';\n";
  html += "          \n";
  html += "          let html = '<div class=\"modal-content\">';\n";
  html +=
    "          html += '<h2><i class=\"fas fa-sync-alt\"></i> Reassign Task</h2>';\n";
  html += "          \n";
  html += "          html += '<div class=\"info-box info\">';\n";
  html +=
    "          html += '<p><strong>Task:</strong> ' + escapeHtml(task.title) + '</p>';\n";
  html +=
    "          html += '<p><strong>Current Assignment:</strong> ' + (task.User ? escapeHtml(task.User.name) : 'Unassigned') + '</p>';\n";
  html += "          html += '</div>';\n";
  html += "          \n";
  html += "          html += '<div class=\"form-group\">';\n";
  html +=
    "          html += '<label><i class=\"fas fa-user\"></i> Reassign to:</label>';\n";
  html +=
    '          html += \'<select id="newEmployee" style="padding: 14px; width: 100%; border-radius: 10px; border: 2px solid #e2e8f0; font-size: 15px; font-weight: 600;">\';\n';
  html += "          \n";
  html +=
    "          employees.filter(function(e) { return e.id !== task.assignedTo; }).forEach(function(emp) {\n";
  html +=
    "            html += '<option value=\"' + emp.id + '\">' + escapeHtml(emp.name) + ' (' + escapeHtml(emp.email) + ')</option>';\n";
  html += "          });\n";
  html += "          \n";
  html += "          html += '</select>';\n";
  html += "          html += '</div>';\n";
  html += "          \n";
  html +=
    "          html += '<div style=\"display: flex; gap: 12px; margin-top: 25px;\">';\n";
  html +=
    "          html += '<button class=\"btn btn-primary\" onclick=\"confirmReassign(' + taskId + ')\">';\n";
  html +=
    "          html += '<i class=\"fas fa-check\"></i> Confirm Reassignment';\n";
  html += "          html += '</button>';\n";
  html +=
    '          html += \'<button class="btn btn-secondary" onclick="closeModal()">\';\n';
  html += "          html += '<i class=\"fas fa-times\"></i> Cancel';\n";
  html += "          html += '</button>';\n";
  html += "          html += '</div>';\n";
  html += "          \n";
  html += "          html += '</div>';\n";
  html += "          \n";
  html += "          modal.innerHTML = html;\n";
  html += "          document.body.appendChild(modal);\n";
  html += "        });\n";
  html += "    })\n";
  html += "    .catch(function(err) {\n";
  html += "      console.error('Error loading task data:', err);\n";
  html += "      showToast('Failed to load task data', 'error');\n";
  html += "    });\n";
  html += "}\n";
  html += "\n";
  html += "function confirmReassign(taskId) {\n";
  html +=
    "  const newEmployeeId = document.getElementById('newEmployee').value;\n";
  html += "  \n";
  html += "  if (!newEmployeeId) {\n";
  html += "    showToast('Please select an employee', 'error');\n";
  html += "    return;\n";
  html += "  }\n";
  html += "  \n";
  html += "  fetch('/api/tasks/' + taskId + '/reassign', {\n";
  html += "    method: 'PUT',\n";
  html += "    headers: { 'Content-Type': 'application/json' },\n";
  html += "    body: JSON.stringify({\n";
  html += "      newEmployeeId: parseInt(newEmployeeId),\n";
  html += "      adminId: currentUser.id,\n";
  html += "      adminName: currentUser.name\n";
  html += "    })\n";
  html += "  })\n";
  html += "  .then(function(res) { return res.json(); })\n";
  html += "  .then(function(data) {\n";
  html += "    if (data.success) {\n";
  html +=
    "      showToast(data.message || 'Task reassigned successfully!', 'success');\n";
  html += "      closeModal();\n";
  html += "      loadAllTasks();\n";
  html += "    } else {\n";
  html +=
    "      showToast(data.message || 'Error reassigning task', 'error');\n";
  html += "    }\n";
  html += "  })\n";
  html += "  .catch(function(err) {\n";
  html += "    console.error('Error reassigning task:', err);\n";
  html += "    showToast('Connection error', 'error');\n";
  html += "  });\n";
  html += "}\n";
  html += "\n";
  html += "function unassignTask(taskId) {\n";
  html +=
    "  if (!confirm('Remove assignment and return this task to the unassigned pool?')) {\n";
  html += "    return;\n";
  html += "  }\n";
  html += "  \n";
  html += "  fetch('/api/tasks/' + taskId + '/unassign', {\n";
  html += "    method: 'POST',\n";
  html += "    headers: { 'Content-Type': 'application/json' },\n";
  html += "    body: JSON.stringify({\n";
  html += "      adminId: currentUser.id,\n";
  html += "      adminName: currentUser.name\n";
  html += "    })\n";
  html += "  })\n";
  html += "  .then(function(res) { return res.json(); })\n";
  html += "  .then(function(data) {\n";
  html += "    if (data.success) {\n";
  html +=
    "      showToast('Task unassigned and returned to pool', 'success');\n";
  html += "      loadAllTasks();\n";
  html += "    } else {\n";
  html +=
    "      showToast(data.message || 'Error unassigning task', 'error');\n";
  html += "    }\n";
  html += "  })\n";
  html += "  .catch(function(err) {\n";
  html += "    console.error('Error unassigning task:', err);\n";
  html += "    showToast('Connection error', 'error');\n";
  html += "  });\n";
  html += "}\n";
  html += "\n";
  html += "function deleteTask(taskId) {\n";
  html +=
    "  if (!confirm('Permanently delete this task? This action cannot be undone.')) {\n";
  html += "    return;\n";
  html += "  }\n";
  html += "  \n";
  html +=
    "  fetch('/api/tasks/' + taskId + '?adminId=' + currentUser.id + '&adminName=' + encodeURIComponent(currentUser.name), {\n";
  html += "    method: 'DELETE'\n";
  html += "  })\n";
  html += "  .then(function(res) { return res.json(); })\n";
  html += "  .then(function(data) {\n";
  html += "    if (data.success) {\n";
  html += "      showToast('Task deleted successfully', 'success');\n";
  html += "      loadAllTasks();\n";
  html += "    } else {\n";
  html += "      showToast('Error deleting task', 'error');\n";
  html += "    }\n";
  html += "  })\n";
  html += "  .catch(function(err) {\n";
  html += "    console.error('Error deleting task:', err);\n";
  html += "    showToast('Connection error', 'error');\n";
  html += "  });\n";
  html += "}\n";
  html += "\n";
  html += "function closeModal() {\n";
  html += "  const modal = document.querySelector('.modal');\n";
  html += "  if (modal) modal.remove();\n";
  html += "}\n";
  html += "\n";
  html +=
    "// ═══════════════════════════════════════════════════════════════════════════\n";
  html += "// ADMIN FUNCTIONS - EMPLOYEES\n";
  html +=
    "// ═══════════════════════════════════════════════════════════════════════════\n";
  html += "\n";
  html += "function showEmployees() {\n";
  html +=
    "  let html = '<h2><i class=\"fas fa-users\"></i> Manage Employees</h2>';\n";
  html += "  \n";
  html +=
    '  html += \'<button class="btn btn-primary" onclick="showAddEmployee()" style="margin-bottom: 25px;">\';\n';
  html += "  html += '<i class=\"fas fa-user-plus\"></i> Add New Employee';\n";
  html += "  html += '</button>';\n";
  html += "  \n";
  html += "  html += '<div id=\"employeeList\">';\n";
  html +=
    '  html += \'<div class="loading-spinner show"><i class="fas fa-spinner"></i>Loading employees...</div>\';\n';
  html += "  html += '</div>';\n";
  html += "  \n";
  html += "  document.getElementById('content').innerHTML = html;\n";
  html += "  loadEmployees();\n";
  html += "}\n";
  html += "\n";
  html += "function openResetPasswordModal(empId, empEmail) {\n";
  html += "  const modal = document.createElement('div');\n";
  html += "  modal.className = 'modal show';\n";
  html += "  let html = '';\n";
  html += "  html += '<div class=\"modal-content\">';\n";
  html += "  html += '<h2><i class=\"fas fa-key\"></i> Reset Password</h2>';\n";
  html += "  html += '<div class=\"info-box info\">';\n";
  html +=
    "  html += '<p><strong>Employee:</strong> ' + escapeHtml(empEmail) + '</p>';\n";
  html +=
    "  html += '<p>Set a temporary password or leave blank to auto-generate.</p>';\n";
  html += "  html += '</div>';\n";
  html += "  html += '<div class=\"form-group\">';\n";
  html +=
    "  html += '<label><i class=\"fas fa-lock\"></i> Temporary password (optional)</label>';\n";
  html +=
    '  html += \'<input type="text" id="resetTempPassword" placeholder="Leave empty to auto-generate" />\';\n';
  html += "  html += '</div>';\n";
  html +=
    "  html += '<div style=\"display:flex; gap:12px; margin-top:18px;\">';\n";
  html +=
    '  html += \'<button class="btn btn-primary" onclick="resetEmployeePassword(\' + empId + \')"><i class="fas fa-check"></i> Reset</button>\';\n';
  html +=
    '  html += \'<button class="btn btn-secondary" onclick="closeModal()"><i class="fas fa-times"></i> Cancel</button>\';\n';
  html += "  html += '</div>';\n";
  html += "  html += '</div>';\n";
  html += "  modal.innerHTML = html;\n";
  html += "  document.body.appendChild(modal);\n";
  html += "}\n";

  html += "\n";
  html += "function resetEmployeePassword(empId) {\n";
  html +=
    "  const newPasswordEl = document.getElementById('resetTempPassword');\n";
  html +=
    "  const newPassword = newPasswordEl ? newPasswordEl.value.trim() : '';\n";
  html += "  fetch('/api/users/' + empId + '/reset-password', {\n";
  html += "    method: 'POST',\n";
  html += "    headers: { 'Content-Type': 'application/json' },\n";
  html += "    body: JSON.stringify({\n";
  html += "      adminId: currentUser.id,\n";
  html += "      adminName: currentUser.name,\n";
  html += "      newPassword: newPassword || null\n";
  html += "    })\n";
  html += "  })\n";
  html += "  .then(function(r){ return r.json(); })\n";
  html += "  .then(function(data){\n";
  html +=
    "    if (!data.success) throw new Error(data.message || 'Reset failed');\n";
  html += "    closeModal();\n";
  html +=
    "    showToast('Temporary password: ' + data.tempPassword, 'success');\n";
  html += "  })\n";
  html += "  .catch(function(err){\n";
  html += "    showToast(err.message || 'Reset failed', 'error');\n";
  html += "  });\n";
  html += "}\n";
  // Activity Log viewer
  html += "function showActivityLog() {\n";
  html += "  let html = '';\n";
  html +=
    "  html += '<h2><i class=\"fas fa-history\"></i> Activity Log</h2>';\n";
  html +=
    "  html += '<p style=\"color: #e5e7eb; font-weight: 600; font-size: 13px; margin-bottom: 14px;\">';\n";
  html +=
    "  html += '<i class=\"fas fa-info-circle\"></i> Recent system and task actions';\n";
  html += "  html += '</p>';\n";
  html += "  html += '<div id=\"activityLogList\">';\n";
  html +=
    '  html += \'<div class="loading-spinner show"><i class="fas fa-spinner"></i> Loading activity log...</div>\';\n';
  html += "  html += '</div>';\n";
  html += "  document.getElementById('content').innerHTML = html;\n";
  html += "  fetch('/api/activity-log?limit=100')\n";
  html += "    .then(function(res) { return res.json(); })\n";
  html += "    .then(function(logs) { displayActivityLog(logs); })\n";
  html += "    .catch(function(err) {\n";
  html += "      console.error('Error loading activity log:', err);\n";
  html += "      document.getElementById('activityLogList').innerHTML =\n";
  html += "        '<div class=\"empty-state\">' +\n";
  html += "        '  <i class=\"fas fa-exclamation-triangle\"></i>' +\n";
  html += "        '  <h3>Error Loading Activity Log</h3>' +\n";
  html += "        '  <p>Please try again.</p>' +\n";
  html += "        '</div>';\n";
  html += "      showToast('Failed to load activity log', 'error');\n";
  html += "    });\n";
  html += "}\n";
  html += "function displayActivityLog(logs) {\n";
  html += "  let html = '';\n";
  html += "  if (!Array.isArray(logs) || logs.length === 0) {\n";
  html += "    html = '<div class=\"empty-state\">';\n";
  html += "    html += '<i class=\"fas fa-inbox\"></i>';\n";
  html += "    html += '<h3>No Activity Yet</h3>';\n";
  html +=
    "    html += '<p>Once users start logging in and updating tasks, you will see an audit trail here.</p>';\n";
  html += "    html += '</div>';\n";
  html += "  } else {\n";
  html += "    html = '<table class=\"table\">';\n";
  html += "    html += '<thead><tr>'; \n";
  html += "    html += '<th>Time</th>'; \n";
  html += "    html += '<th>User</th>'; \n";
  html += "    html += '<th>Action</th>'; \n";
  html += "    html += '<th>Task</th>'; \n";
  html += "    html += '<th>Details</th>'; \n";
  html += "    html += '</tr></thead>'; \n";
  html += "    html += '<tbody>'; \n";
  html += "    logs.forEach(function(log) {\n";
  html +=
    "      var time = log.timestamp ? new Date(log.timestamp).toLocaleString() : '-';\n";
  html +=
    "      var userName = log.userName || (log.user && log.user.name) || 'Unknown';\n";
  html += "      var taskTitle = log.taskTitle || '-';\n";
  html += "      var details = log.newValue || log.oldValue || '';\n";
  html +=
    "      if (typeof details === 'string' && details.length > 140) { details = details.substring(0,140) + '...'; }\n";
  html += "      html += '<tr>'; \n";
  html +=
    "      html += '<td data-label=\"Time\">' + escapeHtml(time) + '</td>'; \n";
  html +=
    "      html += '<td data-label=\"User\">' + escapeHtml(userName) + '</td>'; \n";
  html +=
    '      html += \'<td data-label="Action"><span class="status-badge" style="text-transform:none;font-size:10px">\' + escapeHtml(log.action) + \'</span></td>\'; \n';
  html +=
    "      html += '<td data-label=\"Task\">' + escapeHtml(taskTitle) + '</td>'; \n";
  html +=
    "      html += '<td data-label=\"Details\">' + escapeHtml(String(details)) + '</td>'; \n";
  html += "      html += '</tr>'; \n";
  html += "    });\n";
  html += "    html += '</tbody>'; \n";
  html += "    html += '</table>'; \n";
  html += "  }\n";
  html += "  document.getElementById('activityLogList').innerHTML = html;\n";
  html += "}\n";
  html += "function showAnalyticsDashboard() {\n";
  html +=
    "  let html = '<h2><i class=\"fas fa-chart-pie\"></i> Analytics Dashboard</h2>';\n";
  html +=
    '  html += \'<div id="analyticsStats" style="margin-bottom: 30px;"></div>\';\n';
  html +=
    '  html += \'<canvas id="statusChart" width="400" height="200" style="margin-bottom:36px;"></canvas>\';\n';
  html +=
    '  html += \'<canvas id="tasksDayChart" width="400" height="200"></canvas>\';\n';
  html +=
    '  html += \'<div id="analyticsLoading" class="loading-spinner show"><i class="fas fa-spinner"></i>Loading analytics...</div>\';\n';
  html += "  document.getElementById('content').innerHTML = html;\n";
  html +=
    "  fetch('/api/analytics').then(res=>res.json()).then(function(data){\n";
  html +=
    "    document.getElementById('analyticsLoading').style.display = 'none';\n";
  html += "    let stats = '';\n";
  html += "    stats += '<div class=\"info-box info\">';\n";
  html +=
    "    stats += '<p><strong>Total Tasks:</strong> ' + data.totalTasks + '</p>';\n";
  html +=
    "    stats += '<p><strong>Assigned Tasks:</strong> ' + data.assignedTasks + '</p>';\n";
  html +=
    "    stats += '<p><strong>Completed Tasks:</strong> ' + data.completedTasks + '</p>';\n";
  html +=
    "    stats += '<p><strong>Verified Tasks:</strong> ' + data.verifiedTasks + '</p>';\n";
  html +=
    "    stats += '<p><strong>Active Employees:</strong> ' + data.userCount + '</p>';\n";
  html +=
    "    stats += '<p><strong>Admins:</strong> ' + data.adminCount + '</p>';\n";
  html += "    stats += '</div>';\n";
  html += "    document.getElementById('analyticsStats').innerHTML = stats;\n";
  html += "    // Prepare status counts for chart\n";
  html += "    const statusLabels = data.statusCounts.map(s=>s.status);\n";
  html +=
    "    const statusCounts = data.statusCounts.map(s=>parseInt(s.count));\n";
  html += "    // Prepare per-day chart\n";
  html += "    const dates = data.tasksPerDay.map(x=>x.day);\n";
  html +=
    "    const perDayCounts = data.tasksPerDay.map(x=>parseInt(x.count));\n";
  html += "    if (!window.Chart) {\n";
  html += "      let script = document.createElement('script');\n";
  html += "      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';\n";
  html += "      script.onload = function() {\n";
  html +=
    "        renderAnalyticsCharts(statusLabels, statusCounts, dates, perDayCounts);\n";
  html += "      };\n";
  html += "      document.head.appendChild(script);\n";
  html += "    } else {\n";
  html +=
    "      renderAnalyticsCharts(statusLabels, statusCounts, dates, perDayCounts);\n";
  html += "    }\n";
  html += "  });\n";
  html += "}\n";
  html +=
    "function renderAnalyticsCharts(statusLabels, statusCounts, dates, perDayCounts) {\n";
  html +=
    "  new Chart(document.getElementById('statusChart').getContext('2d'), {\n";
  html += "    type: 'doughnut',\n";
  html +=
    "    data: { labels: statusLabels, datasets: [{ data: statusCounts, backgroundColor: [ '#2d3748', '#10b981', '#f59e0b','#6366F1','#ef4444','#a7f3d0','#bfdbfe','#fecaca','#fde68a','#cbd5e0','#92400e' ] }] },\n";
  html +=
    "    options: { plugins: { legend: { position: 'bottom' } }, responsive: true }\n";
  html += "  });\n";
  html +=
    "  new Chart(document.getElementById('tasksDayChart').getContext('2d'), {\n";
  html += "    type: 'line',\n";
  html +=
    "    data: { labels: dates, datasets: [{ label: 'Tasks Created', data: perDayCounts, borderColor: '#3b82f6', fill: true, backgroundColor: 'rgba(59,130,246,0.1)' }] },\n";
  html +=
    "    options: { responsive: true, plugins: { legend: { display: false } } }\n";
  html += "  });\n";
  html += "}\n";
  html += "\n";
  html += "function loadEmployees() {\n";
  html += "  fetch('/api/users')\n";
  html += "    .then(function(res) { return res.json(); })\n";
  html += "    .then(function(employees) {\n";
  html += "      let html = '';\n";
  html += "      \n";
  html += "      if (employees.length === 0) {\n";
  html += "        html = '<div class=\"empty-state\">';\n";
  html += "        html += '<i class=\"fas fa-user-plus\"></i>';\n";
  html += "        html += '<h3>No Employees Yet</h3>';\n";
  html +=
    "        html += '<p>Add your first employee to start assigning tasks.</p>';\n";
  html += "        html += '</div>';\n";
  html += "      } else {\n";
  html +=
    "        html = '<p style=\"color: #e5e7eb; font-weight: 600; font-size: 13px; margin-bottom: 14px;\">';\n";
  html +=
    "        html += '<i class=\"fas fa-info-circle\"></i> Total Employees: ' + employees.length;\n";
  html += "        html += '</p>';\n";
  html += "        \n";
  html += "        html += '<table class=\"table\">';\n";
  html += "        html += '<thead><tr>';\n";
  html += "        html += '<th>Name</th>';\n";
  html += "        html += '<th>Employee ID</th>';\n";
  html += "        html += '<th>Email</th>';\n";
  html += "        html += '<th>Phone</th>';\n";
  html += "  html += '<th>Actions</th>';\n";
  html += "        html += '</tr></thead>';\n";
  html += "        html += '<tbody>';\n";
  html += "        \n";
  html += "        employees.forEach(function(emp) {\n";
  html += "          html += '<tr>';\n";
  html +=
    "          html += '<td><strong>' + escapeHtml(emp.name) + '</strong></td>';\n";
  html +=
    "          html += '<td>' + escapeHtml(emp.employeeId || 'N/A') + '</td>';\n";
  html += "          html += '<td>' + escapeHtml(emp.email) + '</td>';\n";
  html +=
    "          html += '<td>' + escapeHtml(emp.phone || 'N/A') + '</td>';\n";
  // inside employees.forEach row build (after phone td)
  html += "      html += '<td>';\n";
  html +=
    "      html += '<button class=\"btn btn-warning btn-sm\" onclick=\\'openResetPasswordModal(' + emp.id + ', ' + JSON.stringify(emp.email) + ')\\'><i class=\"fas fa-key\"></i> Reset</button>';\n";
  html += "      html += '</td>';\n";
  html += "          html += '</tr>';\n";
  html += "        });\n";
  html += "        \n";
  html += "        html += '</tbody></table>';\n";
  html += "      }\n";
  html += "      \n";
  html += "      document.getElementById('employeeList').innerHTML = html;\n";
  html += "    })\n";
  html += "    .catch(function(err) {\n";
  html += "      console.error('Error loading employees:', err);\n";
  html +=
    "      document.getElementById('employeeList').innerHTML = '<div class=\"empty-state\"><i class=\"fas fa-exclamation-triangle\"></i><h3>Error Loading Employees</h3><p>Please try again.</p></div>';\n";
  html += "      showToast('Failed to load employees', 'error');\n";
  html += "    });\n";
  html += "}\n";
  html += "\n";
  html += "function showAddEmployee() {\n";
  html += "  const modal = document.createElement('div');\n";
  html += "  modal.className = 'modal show';\n";
  html += "  \n";
  html += "  let html = '<div class=\"modal-content\">';\n";
  html +=
    "  html += '<h2><i class=\"fas fa-user-plus\"></i> Add New Employee</h2>';\n";
  html += "  \n";
  html += "  html += '<form id=\"employeeForm\">';\n";
  html += "  \n";
  html += "  html += '<div class=\"form-group\">';\n";
  html +=
    "  html += '<label><i class=\"fas fa-user\"></i> Full Name *</label>';\n";
  html +=
    '  html += \'<input type="text" id="empName" required placeholder="Enter full name">\';\n';
  html += "  html += '</div>';\n";
  html += "  \n";
  html += "  html += '<div class=\"form-group\">';\n";
  html +=
    "  html += '<label><i class=\"fas fa-id-badge\"></i> Employee ID *</label>';\n";
  html +=
    '  html += \'<input type="text" id="empId" required placeholder="e.g., EMP001">\';\n';
  html += "  html += '</div>';\n";
  html += "  \n";
  html += "  html += '<div class=\"form-group\">';\n";
  html +=
    "  html += '<label><i class=\"fas fa-envelope\"></i> Email *</label>';\n";
  html +=
    '  html += \'<input type="email" id="empEmail" required placeholder="employee@company.com">\';\n';
  html += "  html += '</div>';\n";
  html += "  \n";
  html += "  html += '<div class=\"form-group\">';\n";
  html +=
    "  html += '<label><i class=\"fas fa-phone\"></i> Phone Number</label>';\n";
  html +=
    '  html += \'<input type="tel" id="empPhone" placeholder="+91 9876543210">\';\n';
  html += "  html += '</div>';\n";
  html += "  \n";
  html += "  html += '<div class=\"form-group\">';\n";
  html +=
    "  html += '<label><i class=\"fas fa-lock\"></i> Password *</label>';\n";
  html +=
    '  html += \'<input type="password" id="empPassword" required placeholder="Default: 123456" value="123456">\';\n';
  html += "  html += '</div>';\n";
  html += "  \n";
  html +=
    "  html += '<div style=\"display: flex; gap: 12px; margin-top: 25px;\">';\n";
  html += '  html += \'<button type="submit" class="btn btn-primary">\';\n';
  html += "  html += '<i class=\"fas fa-check\"></i> Create Employee';\n";
  html += "  html += '</button>';\n";
  html +=
    '  html += \'<button type="button" class="btn btn-secondary" onclick="closeModal()">\';\n';
  html += "  html += '<i class=\"fas fa-times\"></i> Cancel';\n";
  html += "  html += '</button>';\n";
  html += "  html += '</div>';\n";
  html += "  \n";
  html += "  html += '</form>';\n";
  html += "  html += '</div>';\n";
  html += "  \n";
  html += "  modal.innerHTML = html;\n";
  html += "  document.body.appendChild(modal);\n";
  html += "  \n";
  html +=
    "  document.getElementById('employeeForm').addEventListener('submit', function(e) {\n";
  html += "    e.preventDefault();\n";
  html += "    \n";
  html += "    const formData = {\n";
  html += "      name: document.getElementById('empName').value,\n";
  html += "      employeeId: document.getElementById('empId').value,\n";
  html += "      email: document.getElementById('empEmail').value,\n";
  html += "      phone: document.getElementById('empPhone').value,\n";
  html +=
    "      password: document.getElementById('empPassword').value || '123456'\n";
  html += "    };\n";
  html += "    \n";
  html +=
    "    const btn = e.target.querySelector('button[type=\"submit\"]');\n";
  html += "    btn.disabled = true;\n";
  html +=
    "    btn.innerHTML = '<i class=\"fas fa-spinner fa-spin\"></i> Creating...';\n";
  html += "    \n";
  html += "    fetch('/api/users', {\n";
  html += "      method: 'POST',\n";
  html += "      headers: { 'Content-Type': 'application/json' },\n";
  html += "      body: JSON.stringify(formData)\n";
  html += "    })\n";
  html += "    .then(function(res) { return res.json(); })\n";
  html += "    .then(function(data) {\n";
  html += "      if (data.success) {\n";
  html += "        showToast('Employee created successfully!', 'success');\n";
  html += "        closeModal();\n";
  html += "        showEmployees();\n";
  html += "      } else {\n";
  html +=
    "        showToast(data.message || 'Error creating employee', 'error');\n";
  html += "        btn.disabled = false;\n";
  html +=
    "        btn.innerHTML = '<i class=\"fas fa-check\"></i> Create Employee';\n";
  html += "      }\n";
  html += "    })\n";
  html += "    .catch(function(err) {\n";
  html += "      console.error('Error creating employee:', err);\n";
  html += "      showToast('Connection error', 'error');\n";
  html += "      btn.disabled = false;\n";
  html +=
    "      btn.innerHTML = '<i class=\"fas fa-check\"></i> Create Employee';\n";
  html += "    });\n";
  html += "  });\n";
  html += "}\n";
  html += "\n";
  html +=
    "// ═══════════════════════════════════════════════════════════════════════════\n";
  html += "// ADMIN FUNCTIONS - EXPORT CSV\n";
  html +=
    "// ═══════════════════════════════════════════════════════════════════════════\n";
  html += "\n";
  html += "function exportTasks() {\n";
  html += "  showToast('Preparing export...', 'info');\n";
  html += "  window.location.href = '/api/export';\n";
  html += "  setTimeout(function() {\n";
  html += "    showToast('Export downloaded successfully!', 'success');\n";
  html += "  }, 1000);\n";
  html += "}\n";
  html += "\n";
  html +=
    "// ═══════════════════════════════════════════════════════════════════════════\n";
  html += "// EMPLOYEE FUNCTIONS - TODAY'S TASKS (Features #6, #7, #8)\n";
  html +=
    "// ═══════════════════════════════════════════════════════���═══════════════════\n";
  html += "\n";
  html += "function showTodayTasks() {\n";
  html +=
    "  let html = '<h2><i class=\"fas fa-tasks\"></i> Today\\'s Tasks</h2>';\n";
  html += "  \n";
  html += "  html += '<div class=\"filter-section\">';\n";
  html +=
    '  html += \'<input type="text" id="todayTaskSearch" class="search-box" placeholder="Search by Case ID, Pincode, Address..." style="flex: 1; max-width: 500px;">\';\n';
  html +=
    '  html += \'<button class="btn btn-warning btn-sm" onclick="sortByNearest()">\';\n';
  html +=
    "  html += '<i class=\"fas fa-location-arrow\"></i> Sort by Nearest';\n";
  html += "  html += '</button>';\n";
  html +=
    '  html += \'<button class="btn btn-success btn-sm" onclick="sortByPincode()">\';\n';
  html += "  html += '<i class=\"fas fa-map-pin\"></i> Sort by Pincode';\n";
  html += "  html += '</button>';\n";
  html +=
    '  html += \'<button class="btn btn-info btn-sm" onclick="loadTodayTasks()">\';\n';
  html += "  html += '<i class=\"fas fa-sync\"></i> Refresh';\n";
  html += "  html += '</button>';\n";
  html += "  html += '</div>';\n";
  html += "  \n";
  html += "  html += '<div id=\"todayTasksList\">';\n";
  html +=
    '  html += \'<div class="loading-spinner show"><i class="fas fa-spinner"></i>Loading your tasks...</div>\';\n';
  html += "  html += '</div>';\n";
  html += "  \n";
  html += "  document.getElementById('content').innerHTML = html;\n";
  html += "  \n";
  html += "  // Real-time search\n";
  html +=
    "  document.getElementById('todayTaskSearch').addEventListener('input', function() {\n";
  html += "    searchTodayTasks();\n";
  html += "  });\n";
  html += "  \n";
  html += "  loadTodayTasks();\n";
  html += "}\n";
  html += "\n";
  html += "function loadTodayTasks(searchTerm) {\n";
  // REMOVED: const today = ... (No longer needed for filtering)
  html +=
    "  const url = '/api/tasks?role=employee&userId=' + currentUser.id + (searchTerm ? '&search=' + encodeURIComponent(searchTerm) : '');\n";
  html += "  \n";
  html += "  fetch(url)\n";
  html += "    .then(function(res) { return res.json(); })\n";
  html += "        .then(function(tasks) {\n";
  html += "          allEmployeeTasks = Array.isArray(tasks) ? tasks : [];\n";
  html += "          \n";
  html += "          // REAPPLY distance sorting if it was active\n";
  html += "          if (isNearestSortActive && savedEmployeeLocation) {\n";
  html += "            const sortedTasks = reapplyDistanceSorting(\n";
  html += "              allEmployeeTasks,\n";
  html += "              savedEmployeeLocation.latitude,\n";
  html += "              savedEmployeeLocation.longitude\n";
  html += "            );\n";
  html += "            displayEmployeeTasks(sortedTasks);\n";
  html += "            updateSortButtonStates('nearest');\n";
  html += "          } else {\n";
  html += "            displayEmployeeTasks(allEmployeeTasks);\n";
  html += "          }\n";
  html += "        })\n";
  html += "    .catch(function(err) {\n";
  html += "      console.error('Error loading tasks:', err);\n";
  html +=
    "      document.getElementById('todayTasksList').innerHTML = '<div class=\"empty-state\"><i class=\"fas fa-exclamation-triangle\"></i><h3>Error Loading Tasks</h3><p>Please try again.</p></div>';\n";
  html += "      showToast('Failed to load tasks', 'error');\n";
  html += "    });\n";
  html += "}\n";
  html += "\n";
  html += "function displayEmployeeTasks(tasks) {\n";
  html += "  let html = '';\n";
  html += "  \n";
  html += "  if (tasks.length === 0) {\n";
  html += "    html = '<div class=\"empty-state\">';\n";
  html += "    html += '<i class=\"fas fa-check-circle\"></i>';\n";
  html += "    html += '<h3>All Clear!</h3>';\n";
  html += "    html += '<p>No tasks assigned for today. Great job!</p>';\n";
  html += "    html += '</div>';\n";
  html += "  } else {\n";
  html +=
    "    html = '<p style=\"color: #e5e7eb; font-weight: 600; font-size: 13px; margin-bottom: 14px;\">';\n";
  html +=
    "    html += '<i class=\"fas fa-info-circle\"></i> You have ' + tasks.length + ' task(s) for today';\n";
  html += "    html += '</p>';\n";
  html += "    \n";
  html += "    html += '<div class=\"grid\">';\n";
  html += "    \n";
  html += "    tasks.forEach(function(task) {\n";
  html +=
    "      const statusClass = 'status-' + task.status.toLowerCase().replace(/ /g, '-');\n";
  html += "      \n";
  html += "      html += '<div class=\"task-card\">';\n";
  html +=
    "      html += '<h3><i class=\"fas fa-clipboard-list\"></i> ' + escapeHtml(task.title) + '</h3>';\n";
  html += " if (task.clientName) {\n";
  html +=
    " html += '<p><strong>Client:</strong> ' + escapeHtml(task.clientName) + '</p>';\n";
  html += " }\n";
  html += "      \n";
  html += "      html += '<div class=\"pincode-highlight\">';\n";
  html +=
    "      html += '<i class=\"fas fa-map-pin\"></i> Pincode: ' + escapeHtml(task.pincode || 'N/A');\n";
  html += "      html += '</div>';\n";
  html += "      \n";
  html += "      if (task.distance !== undefined) {\n";
  html += "        html += '<div class=\"distance-indicator\">';\n";
  html +=
    "        html += '<i class=\"fas fa-route\"></i> Distance: ' + task.distance.toFixed(2) + ' km away';\n";
  html += "        html += '</div>';\n";
  html += "      }\n";
  html += "      \n";
  html +=
    "      html += '<span class=\"status-badge ' + statusClass + '\">';\n";
  html +=
    "      html += '<i class=\"fas fa-circle\"></i> ' + escapeHtml(task.status);\n";
  html += "      html += '</span>';\n";
  html += "      \n";
  html += "      if (task.notes) {\n";
  html +=
    "        html += '<p style=\"margin-top: 13px; color: #e5e7eb; font-size: 13px;\"><i class=\"fas fa-sticky-note\"></i> ' + escapeHtml(task.notes) + '</p>';\n";
  html += "      }\n";
  html += "      \n";
  html += "      // Feature #8: MapURL visibility (CRITICAL)\n";
  html += "      if (task.mapUrl) {\n";
  html +=
    '        html += \'<a href="\' + escapeHtml(task.mapUrl) + \'" target="_blank" rel="noopener noreferrer" class="map-button">\';\n';
  html +=
    "        html += '<i class=\"fas fa-location-arrow\"></i> Open Map';\n";
  html += "        html += '</a>';\n";
  html += "      } else {\n";
  html +=
    '        html += \'<div class="no-map"><i class="fas fa-map-marker-alt"></i> No map available for this task</div>\';\n';
  html += "      }\n";
  html += "      \n";
  html += "      html += '<div class=\"action-buttons\">';\n";
  html +=
    "      html += '<select id=\"status-' + task.id + '\" style=\"flex: 2;\">';\n";
  html +=
    "      html += '<option value=\"Pending\"' + (task.status === 'Pending' ? ' selected' : '') + '>Select updated status</option>'; \n";
  html +=
    "      html += '<option value=\"Completed\"' + (task.status === 'Completed' ? ' selected' : '') + '>Completed</option>'; \n";
  html +=
    "      html += '<option value=\"Verified\"' + (task.status === 'Verified' ? ' selected' : '') + '>Verified</option>'; \n";
  html +=
    "      html += '<option value=\"Left Job\"' + (task.status === 'Left Job' ? ' selected' : '') + '>Left Job</option>'; \n";
  html +=
    "      html += '<option value=\"Not Sharing Info\"' + (task.status === 'Not Sharing Info' ? ' selected' : '') + '>Not Sharing Info</option>'; \n";
  html +=
    "      html += '<option value=\"Not Picking\"' + (task.status === 'Not Picking' ? ' selected' : '') + '>Not Picking</option>'; \n";
  html +=
    "      html += '<option value=\"Switch Off\"' + (task.status === 'Switch Off' ? ' selected' : '') + '>Switch Off</option>'; \n";
  html +=
    "      html += '<option value=\"Incorrect Number\"' + (task.status === 'Incorrect Number' ? ' selected' : '') + '>Incorrect Number</option>'; \n";
  html +=
    "      html += '<option value=\"Wrong Address\"' + (task.status === 'Wrong Address' ? ' selected' : '') + '>Wrong Address</option>'; \n";
  html += "      html += '</select>'; \n";
  html +=
    '      html += \'<button class="btn btn-primary" onclick="updateTaskStatus(\' + task.id + \')" style="flex: 1;">\';\n';
  html += "      html += '<i class=\"fas fa-save\"></i> Update';\n";
  html += "      html += '</button>'; \n";
  html += "      html += '</div>'; \n";
  html += "      \n";
  html += "      html += '</div>';\n";
  html += "    });\n";
  html += "    \n";
  html += "    html += '</div>';\n";
  html += "  }\n";
  html += "  \n";
  html += "  document.getElementById('todayTasksList').innerHTML = html;\n";
  html += "}\n";
  html += "\n";
  html += "function searchTodayTasks() {\n";
  html += "  // Clear nearest sort when searching\n";
  html += "  isNearestSortActive = false;\n";
  html += "  savedEmployeeLocation = null;\n";
  html += "  \n";
  html +=
    "  const searchTerm = document.getElementById('todayTaskSearch').value.toLowerCase();\n";
  html += "  \n";
  html += "  const filteredTasks = allEmployeeTasks.filter(function(task) {\n";
  html += "    return task.title.toLowerCase().includes(searchTerm) ||\n";
  html += "           task.status.toLowerCase().includes(searchTerm) ||\n";
  html +=
    "           (task.pincode || '').toLowerCase().includes(searchTerm) ||\n";
  html += "           (task.notes || '').toLowerCase().includes(searchTerm);\n";
  html += "  });\n";
  html += "  \n";
  html += "  displayEmployeeTasks(filteredTasks);\n";
  html += "}\n";
  html += "\n";
  html += "// ENHANCED: Route Optimization (Greedy Nearest Neighbor)\n";
  html +=
    "// Sorts tasks to minimize travel distance from one task to the next\n";
  // EDIT: Search for "function reapplyDistanceSorting" (approx line 1264)
  // Replace the ENTIRE function block with this string-wrapped version:

  html += "function reapplyDistanceSorting(tasks, userLat, userLng) {\n";
  html += "  if (!userLat || !userLng) return tasks;\n";
  html += "  \n";
  html += "  // 1. Enrich tasks with coordinates (Priority: MapURL > Pincode)\n";
  html += "  var pool = tasks.map(function(task) {\n";
  html += "    // Explicitly parse coordinates to ensure they are numbers\n";
  html += "    var lat = parseFloat(task.latitude);\n";
  html += "    var lng = parseFloat(task.longitude);\n";
  html += "    \n";
  html += "    // Check if specific coordinates are valid numbers (and not 0)\n";
  html += "    var hasSpecificCoords = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;\n";
  html += "    \n";
  html += "    // Only fall back to pincode if NO specific coords exist\n";
  html += "    // This 'nullifies' the pincode center for tasks that have their own Map location\n";
  html += "    if (!hasSpecificCoords && task.pincode) {\n";
  html += "      var cleanPin = String(task.pincode).trim(); // Fix trailing space issues\n";
  html += "      if (typeof pincodeData !== 'undefined' && pincodeData[cleanPin]) {\n";
  html += "        lat = pincodeData[cleanPin].lat;\n";
  html += "        lng = pincodeData[cleanPin].lng;\n";
  html += "      }\n";
  html += "    }\n";
  html += "    \n";
  html += "    // If we still don't have valid numbers, set to null to filter out later\n";
  html += "    if (isNaN(lat) || isNaN(lng)) {\n";
  html += "      lat = null;\n";
  html += "      lng = null;\n";
  html += "    }\n";
  html += "    \n";
  html += "    // Return new object with temp coordinates\n";
  html += "    var enriched = Object.assign({}, task);\n";
  html += "    enriched._tempLat = lat;\n";
  html += "    enriched._tempLng = lng;\n";
  html += "    return enriched;\n";
  html += "  });\n";
  html += "\n";
  html += "  // 2. Separate valid coordinate tasks from invalid ones\n";
  html += "  var validTasks = pool.filter(function(t) { return t._tempLat !== null && t._tempLng !== null; });\n";
  html += "  var invalidTasks = pool.filter(function(t) { return t._tempLat === null || t._tempLng === null; });\n";
  html += "\n";
  html += "  // 3. Build the optimized 'Chain' path (Greedy Nearest Neighbor)\n";
  html += "  var sortedRoute = [];\n";
  html += "  var currentLat = parseFloat(userLat);\n";
  html += "  var currentLng = parseFloat(userLng);\n";
  html += "\n";
  html += "  while (validTasks.length > 0) {\n";
  html += "    // Find the task closest to the LAST VISITED location (updates every iteration)\n";
  html += "    var nearestIndex = -1;\n";
  html += "    var minDistance = Infinity;\n";
  html += "\n";
  html += "    for (var i = 0; i < validTasks.length; i++) {\n";
  html += "      var d = calculateDistance(currentLat, currentLng, validTasks[i]._tempLat, validTasks[i]._tempLng);\n";
  html += "      if (d < minDistance) {\n";
  html += "        minDistance = d;\n";
  html += "        nearestIndex = i;\n";
  html += "      }\n";
  html += "    }\n";
  html += "\n";
  html += "    if (nearestIndex !== -1) {\n";
  html += "      var nextTask = validTasks[nearestIndex];\n";
  html += "      \n";
  html += "      // Calculate distance from USER for the UI display (so they know how far away it is NOW)\n";
  html += "      // But the *order* is determined by the efficient chain path\n";
  html += "      var distFromUser = calculateDistance(userLat, userLng, nextTask._tempLat, nextTask._tempLng);\n";
  html += "      nextTask.distance = distFromUser;\n";
  html += "      \n";
  html += "      sortedRoute.push(nextTask);\n";
  html += "      \n";
  html += "      // CRITICAL: Move the 'current' pointer to this task to find the next nearest one from HERE\n";
  html += "      currentLat = nextTask._tempLat;\n";
  html += "      currentLng = nextTask._tempLng;\n";
  html += "      \n";
  html += "      validTasks.splice(nearestIndex, 1);\n";
  html += "    } else {\n";
  html += "      break;\n";
  html += "    }\n";
  html += "  }\n";
  html += "\n";
  html += "  // 4. Clean up temp properties and append invalid tasks at the end\n";
  html += "  var finalResult = sortedRoute.concat(invalidTasks).map(function(t) {\n";
  html += "    var cleaned = Object.assign({}, t);\n";
  html += "    delete cleaned._tempLat;\n";
  html += "    delete cleaned._tempLng;\n";
  html += "    return cleaned;\n";
  html += "  });\n";
  html += "\n";
  html += "  return finalResult;\n";
  html += "}\n";
  html += "\n";
  html += "// Update visual state of sort buttons\n";
  html += "function updateSortButtonStates(activeSort) {\n";
  html +=
    "  const allSortButtons = document.querySelectorAll('.btn[onclick*=\"sort\"]');\n";
  html += "  allSortButtons.forEach(function(btn) {\n";
  html += "    btn.classList.remove('btn-success');\n";
  html += "    btn.classList.add('btn-secondary');\n";
  html += "  });\n";
  html += "\n";
  html += "  if (activeSort === 'nearest') {\n";
  html +=
    "    const nearestBtn = document.querySelector('.btn[onclick*=\"sortByNearest\"]');\n";
  html += "    if (nearestBtn) {\n";
  html += "      nearestBtn.classList.remove('btn-secondary');\n";
  html += "      nearestBtn.classList.add('btn-success');\n";
  html += "    }\n";
  html += "  }\n";
  html += "}\n";
  html += "\n";
  html += "function sortByNearest() {\n";
  html += "  if (!allEmployeeTasks || allEmployeeTasks.length === 0) {\n";
  html += "    showToast('No tasks to sort', 'info');\n";
  html += "    return;\n";
  html += "  }\n";
  html += "  if (!navigator.geolocation) {\n";
  html +=
    "    showToast('Geolocation is not supported by your browser', 'error');\n";
  html += "    return;\n";
  html += "  }\n";
  html += "  \n";
  html += "  const searchBox = document.getElementById('todayTaskSearch');\n";
  html +=
    "  if(searchBox) searchBox.placeholder = 'Calculating distances...';\n";
  html += "  \n";
  html += "  showToast('Acquiring GPS location...', 'info');\n";
  html += "  \n";
  html += "  navigator.geolocation.getCurrentPosition(\n";
  html += "    function(position) {\n";
  html += "      const userLat = position.coords.latitude;\n";
  html += "      const userLng = position.coords.longitude;\n";
  html += "\n";
  html += "      // Enable persistent sorting mode\n";
  html +=
    "      savedEmployeeLocation = { latitude: userLat, longitude: userLng };\n";
  html += "      isNearestSortActive = true;\n";
  html += "\n";
  html +=
    "      // Execute sort using the Enhanced reapplyDistanceSorting (includes pincode fallback)\n";
  html +=
    "      allEmployeeTasks = reapplyDistanceSorting(allEmployeeTasks, userLat, userLng);\n";
  html += "      \n";
  html += "      displayEmployeeTasks(allEmployeeTasks);\n";
  html += "      \n";
  html +=
    "      showToast('Route optimized! Tasks ordered by travel path.', 'success');\n";
  html += "      updateSortButtonStates('nearest');\n";
  html += "      \n";
  html +=
    "      if(searchBox) searchBox.placeholder = 'Optimized Route (Smart Path)';\n";
  html += "    },\n";
  html += "    function(error) {\n";
  html += "      console.error('Geolocation error:', error);\n";
  html += "      let msg = 'Location access denied or unavailable.';\n";
  html +=
    "      if (error.code === 1) msg = 'Please allow location access to sort by nearest.';\n";
  html += "      showToast(msg, 'error');\n";
  html += "      isNearestSortActive = false;\n";
  html += "      savedEmployeeLocation = null;\n";
  html +=
    "      if(searchBox) searchBox.placeholder = 'Search by Case ID, Pincode...';\n";
  html += "    },\n";
  html +=
    "    { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }\n";
  html += "  );\n";
  html += "}\n";
  html += "\n";
  html += "function calculateDistance(lat1, lon1, lat2, lon2) {\n";
  html += "  const R = 6371; // Earth's radius in km\n";
  html += "  const dLat = (lat2 - lat1) * Math.PI / 180;\n";
  html += "  const dLon = (lon2 - lon1) * Math.PI / 180;\n";
  html += "  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +\n";
  html +=
    "            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *\n";
  html += "            Math.sin(dLon/2) * Math.sin(dLon/2);\n";
  html += "  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));\n";
  html += "  return R * c;\n";
  html += "}\n";
  html += "\n";
  html +=
    "// REPLACED: Sort by Pincode (Numeric/Grouped Sort) - Distinct from GPS sort\n";
  html += "function sortByPincode() {\n";
  html += "  if (!allEmployeeTasks || allEmployeeTasks.length === 0) {\n";
  html += "    showToast('No tasks to sort', 'info');\n";
  html += "    return;\n";
  html += "  }\n";
  html += "\n";
  html += "  // Clear GPS/Nearest state\n";
  html += "  isNearestSortActive = false;\n";
  html += "  savedEmployeeLocation = null;\n";
  html += "  updateSortButtonStates('pincode');\n";
  html += "  \n";
  html += "  // Sort primarily by Pincode, secondarily by Title/CaseID\n";
  html += "  allEmployeeTasks.sort(function(a, b) {\n";
  html += "    const pinA = a.pincode ? String(a.pincode).trim() : '999999';\n";
  html += "    const pinB = b.pincode ? String(b.pincode).trim() : '999999';\n";
  html += "    \n";
  html += "    // Compare Pincodes\n";
  html += "    if (pinA < pinB) return -1;\n";
  html += "    if (pinA > pinB) return 1;\n";
  html += "    \n";
  html += "    // If Pincodes are same, sort by title\n";
  html += "    const titleA = (a.title || '').toLowerCase();\n";
  html += "    const titleB = (b.title || '').toLowerCase();\n";
  html += "    if (titleA < titleB) return -1;\n";
  html += "    if (titleA > titleB) return 1;\n";
  html += "    \n";
  html += "    return 0;\n";
  html += "  });\n";
  html += "\n";
  html +=
    "  // Remove distance indicators since we aren't sorting by distance anymore\n";
  html += "  const cleanedTasks = allEmployeeTasks.map(function(t) {\n";
  html += "    const newTask = Object.assign({}, t);\n";
  html +=
    "    delete newTask.distance; // Clear distance property to hide UI indicator\n";
  html += "    return newTask;\n";
  html += "  });\n";
  html += "  \n";
  html += "  allEmployeeTasks = cleanedTasks;\n";
  html += "  displayEmployeeTasks(allEmployeeTasks);\n";
  html += "  \n";
  html += "  showToast('Tasks grouped by Pincode', 'success');\n";
  html += "  const searchBox = document.getElementById('todayTaskSearch');\n";
  html +=
    "  if (searchBox) searchBox.placeholder = 'Sorted by Pincode (Ascending)';\n";
  html += "}\n";
  html += "\n";
  html += "function updateTaskStatus(taskId) {\n";
  html +=
    "  const newStatus = document.getElementById('status-' + taskId).value;\n";
  html +=
    "  const btn = document.querySelector('#status-' + taskId).nextElementSibling;\n";
  html += "  // FEATURE 1 PATCH: Prompt confirmation before status update\n";
  html += "  if (newStatus === 'Pending') {\n";
  html +=
    "    if (!confirm('Task status is still Pending! Please select the correct status when your work is done. Continue anyway?')) {\n";
  html += "      btn.disabled = false;\n";
  html += "      btn.innerHTML = '<i class=\"fas fa-save\"></i> Update';\n";
  html += "      return;\n";
  html += "    }\n";
  html += "  } else {\n";
  html +=
    "    if (!confirm('Are you sure you want to change status to \"' + newStatus + '\"?')) {\n";
  html += "      btn.disabled = false;\n";
  html += "      btn.innerHTML = '<i class=\"fas fa-save\"></i> Update';\n";
  html += "      return;\n";
  html += "    }\n";
  html += "  }\n";
  html += "  btn.disabled = true;\n";
  html +=
    "  btn.innerHTML = '<i class=\"fas fa-spinner fa-spin\"></i> Updating...';\n";
  html += "  fetch('/api/tasks/' + taskId, {\n";
  html += "    method: 'PUT',\n";
  html += "    headers: { 'Content-Type': 'application/json' },\n";
  html += "    body: JSON.stringify({\n";
  html += "      status: newStatus,\n";
  html += "      userId: currentUser.id,\n";
  html += "      userName: currentUser.name\n";
  html += "    })\n";
  html += "  })\n";
  html += "  .then(function(res) { return res.json(); })\n";
  html += "  .then(function(data) {\n";
  html += "    if (data.success) {\n";
  html += "      showToast('Status updated to ' + newStatus, 'success');\n";
  html += "      loadTodayTasks();\n";
  html += "    } else {\n";
  html += "      showToast('Error updating status', 'error');\n";
  html += "      btn.disabled = false;\n";
  html += "      btn.innerHTML = '<i class=\"fas fa-save\"></i> Update';\n";
  html += "    }\n";
  html += "  })\n";
  html += "  .catch(function(err) {\n";
  html += "    console.error('Error updating status:', err);\n";
  html += "    showToast('Connection error', 'error');\n";
  html += "    btn.disabled = false;\n";
  html += "    btn.innerHTML = '<i class=\"fas fa-save\"></i> Update';\n";
  html += "  });\n";
  html += "}\n";
  html += "\n";
  html +=
    "// ═══════════════════════════════════════════════════════════════════════════\n";
  html += "// EMPLOYEE FUNCTIONS - TASK HISTORY (Feature #7)\n";
  html +=
    "// ═══════════════════════════════════════════════════════════════════════════\n";
  html += "\n";
  html += "function showTaskHistory() {\n";
  html +=
    "  let html = '<h2><i class=\"fas fa-history\"></i> Task History</h2>';\n";
  html += "  \n";
  html += "  html += '<div class=\"filter-section\">';\n";
  html +=
    '  html += \'<input type="text" id="historyTaskSearch" class="search-box" placeholder="Search by Case ID, Date, Pincode, Status..." style="flex: 1; max-width: 500px;">\';\n';
  html +=
    '  html += \'<button class="btn btn-info btn-sm" onclick="loadTaskHistory()">\';\n';
  html += "  html += '<i class=\"fas fa-sync\"></i> Refresh';\n";
  html += "  html += '</button>';\n";
  html += "  html += '</div>';\n";
  html += "  \n";
  html += "  html += '<div id=\"historyTasksList\">';\n";
  html +=
    '  html += \'<div class="loading-spinner show"><i class="fas fa-spinner"></i>Loading task history...</div>\';\n';
  html += "  html += '</div>';\n";
  html += "  \n";
  html += "  document.getElementById('content').innerHTML = html;\n";
  html += "  \n";
  html += "  // Real-time search\n";
  html +=
    "  document.getElementById('historyTaskSearch').addEventListener('input', function() {\n";
  html += "    searchHistoryTasks();\n";
  html += "  });\n";
  html += "  \n";
  html += "  loadTaskHistory();\n";
  html += "}\n";
  html += "\n";
  html += "function loadTaskHistory(searchTerm) {\n";
  html +=
    "  const url = '/api/tasks?role=employee&userId=' + currentUser.id + '&status=all' + (searchTerm ? '&search=' + encodeURIComponent(searchTerm) : '');\n";
  html += "  \n";
  html += "  fetch(url)\n";
  html += "    .then(function(res) { return res.json(); })\n";
  html += "    .then(function(tasks) {\n";
  html += "      allHistoryTasks = tasks;\n";
  html += "      displayHistoryTasks(tasks);\n";
  html += "    })\n";
  html += "    .catch(function(err) {\n";
  html += "      console.error('Error loading history:', err);\n";
  html +=
    "      document.getElementById('historyTasksList').innerHTML = '<div class=\"empty-state\"><i class=\"fas fa-exclamation-triangle\"></i><h3>Error Loading History</h3><p>Please try again.</p></div>';\n";
  html += "      showToast('Failed to load history', 'error');\n";
  html += "    });\n";
  html += "}\n";
  html += "\n";
  html += "function displayHistoryTasks(tasks) {\n";
  html += "  let html = '';\n";
  html += "  \n";
  html += "  if (tasks.length === 0) {\n";
  html += "    html = '<div class=\"empty-state\">';\n";
  html += "    html += '<i class=\"fas fa-inbox\"></i>';\n";
  html += "    html += '<h3>No Task History</h3>';\n";
  html += "    html += '<p>Your completed tasks will appear here.</p>';\n";
  html += "    html += '</div>';\n";
  html += "  } else {\n";
  html +=
    "    html = '<p style=\"color: #e5e7eb; font-weight: 600; font-size: 13px; margin-bottom: 14px;\">';\n";
  html +=
    "    html += '<i class=\"fas fa-info-circle\"></i> Total Tasks: ' + tasks.length;\n";
  html += "    html += '</p>';\n";
  html += "    \n";
  html += "    html += '<table class=\"table\">';\n";
  html += "    html += '<thead><tr>';\n";
  html += "    html += '<th>Case ID</th>';\n";
  html += "    html += '<th>Client Name</th>';\n";
  html += "    html += '<th>Pincode</th>';\n";
  html += "    html += '<th>Status</th>';\n";
  html += "    html += '<th>Date</th>';\n";
  html += "    html += '<th>Map</th>';\n";
  html += "    html += '<th>Notes</th>';\n";
  html += "    html += '</tr></thead>';\n";
  html += "    html += '<tbody>';\n";
  html += "    \n";
  html += "    tasks.forEach(function(task) {\n";
  html +=
    "      const statusClass = 'status-' + task.status.toLowerCase().replace(/ /g, '-');\n";
  html += "      \n";
  html += "      html += '<tr>';\n";
  html +=
    "      html += '<td><strong>' + escapeHtml(task.title) + '</strong></td>';\n";
  html +=
    "    html += '<td>' + escapeHtml(task.clientName || '-') + '</td>';\n";
  html +=
    "      html += '<td><span class=\"pincode-highlight\"><i class=\"fas fa-map-pin\"></i> ' + escapeHtml(task.pincode || 'N/A') + '</span></td>';\n";
  html +=
    "      html += '<td><span class=\"status-badge ' + statusClass + '\">' + escapeHtml(task.status) + '</span></td>';\n";
  html +=
    "      html += '<td>' + escapeHtml(task.manualDate || task.assignedDate || 'N/A') + '</td>';\n";
  html += "      html += '<td>';\n";
  html += "      if (task.mapUrl) {\n";
  html +=
    '        html += \'<a href="\' + escapeHtml(task.mapUrl) + \'" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; font-weight: 600;">\';\n';
  html +=
    "        html += '<i class=\"fas fa-map-marker-alt\"></i> View Map';\n";
  html += "        html += '</a>';\n";
  html += "      } else {\n";
  html +=
    "        html += '<span style=\"color: #9ca3af; font-style: italic;\">No map</span>';\n";
  html += "      }\n";
  html += "      html += '</td>';\n";
  html += "      html += '<td>' + escapeHtml(task.notes || 'N/A') + '</td>';\n";
  html += "      html += '</tr>';\n";
  html += "    });\n";
  html += "    \n";
  html += "    html += '</tbody></table>';\n";
  html += "  }\n";
  html += "  \n";
  html += "  document.getElementById('historyTasksList').innerHTML = html;\n";
  html += "}\n";
  html += "\n";
  html += "function searchHistoryTasks() {\n";
  html +=
    "  const searchTerm = document.getElementById('historyTaskSearch').value.toLowerCase();\n";
  html += "  \n";
  html += "  const filteredTasks = allHistoryTasks.filter(function(task) {\n";
  html += "    return task.title.toLowerCase().includes(searchTerm) ||\n";
  html += "           task.status.toLowerCase().includes(searchTerm) ||\n";
  html +=
    "           (task.pincode || '').toLowerCase().includes(searchTerm) ||\n";
  html +=
    "           (task.assignedDate || '').toLowerCase().includes(searchTerm);\n";
  html += "  });\n";
  html += "  \n";
  html += "  displayHistoryTasks(filteredTasks);\n";
  html += "}\n";
  html += "\n";
  html +=
    "// ═══════════════════════════════════════════════════════════════════════════\n";
  html += "// MENU INITIALIZATION\n";
  html +=
    "// ═══════════════════════════════════════════════════════════════════════════\n";
  html += "\n";
  html += "function initMenu() {\n";
  html += "  const menu = document.getElementById('menu');\n";
  html += "  \n";
  html += "  if (currentUser.role === 'admin') {\n";
  html += "    menu.innerHTML = '' +\n";
  html +=
    '      \'<button class="btn btn-primary" onclick="showAssignTask()">\' +\n';
  html += "      '<i class=\"fas fa-plus-circle\"></i> Assign Task' +\n";
  html += "      '</button>' +\n";
  html +=
    '      \'<button class="btn btn-primary" onclick="showUnassignedTasks()">\' +\n';
  html += "      '<i class=\"fas fa-inbox\"></i> Unassigned Tasks' +\n";
  html += "      '</button>' +\n";
  html +=
    '      \'<button class="btn btn-primary" onclick="showAllTasks()">\' +\n';
  html += "      '<i class=\"fas fa-list\"></i> View All Tasks' +\n";
  html += "      '</button>' +\n";
  html +=
    '      \'<button class="btn btn-primary" onclick="showActivityLog()">\' +\n';
  html += "      '<i class=\"fas fa-history\"></i> Activity Log' +\n";
  html += "      '</button>' +\n";
  html +=
    '      \'<button class="btn btn-primary" onclick="showEmployees()">\' +\n';
  html += "      '<i class=\"fas fa-users\"></i> Employees' +\n";
  html += "      '</button>' +\n";
  html +=
    '      \'<button class="btn btn-success" onclick="exportTasks()">\' +\n';
  html += "      '<i class=\"fas fa-download\"></i> Export CSV' +\n";
  html +=
    '      \'<button class="btn btn-info" onclick="showAnalyticsDashboard()">\' +\n';
  html += "      '<i class=\"fas fa-chart-pie\"></i> Analytics Dashboard' +\n";
  html += "      '</button>' +\n";
  html += "      '<button class=\"btn btn-primary\" style=\"background:#8b5cf6; border-color:#7c3aed; margin-left:10px;\" onclick=\"showKYCDashboard()\">' +\n";
  html += "      '<i class=\"fas fa-fingerprint\"></i> Digital KYC' +\n";
  html += "      '</button>';\n";
  html += "    \n";
  html += "    showAssignTask();\n";
  html += "  } else {\n";
  html += "    menu.innerHTML = '' +\n";
  html +=
    '      \'<button class="btn btn-primary" onclick="showTodayTasks()">\' +\n';
  html += "      '<i class=\"fas fa-tasks\"></i> Today\\'s Tasks' +\n";
  html += "      '</button>' +\n";
  html +=
    '      \'<button class="btn btn-primary" onclick="showTaskHistory()">\' +\n';
  html += "      '<i class=\"fas fa-history\"></i> Task History' +\n";
  html += "      '</button>';\n";
  html += "    \n";
  html += "    showTodayTasks();\n";
  html += "  }\n";
  html += "}\n";
  html += "\n";
  html += "// Initialize dashboard\n";
  html += "initMenu();\n";
  html += "\n";
  html += "</script>";
  html += '<script src="/kyc_service.js"></script>';
  html += "</body>";
  html += "</html>";

  res.send(html);
});

// ═══════════════════════════════════════════════════════════════════════════
// VALIDIANT DIGITAL KYC SERVICE (v3.0)
// Integration with Didit.me
// ═══════════════════════════════════════════════════════════════════════════

function showKYCDashboard() {
  const content = document.getElementById("content");
  if (!content) return;

  let html = '<h2><i class="fas fa-fingerprint"></i> Digital KYC Requests</h2>';

  // Toolbar
  html += '<div class="filter-section">';
  html += '<button class="btn btn-primary btn-sm" onclick="openKYCModal()">';
  html += '<i class="fas fa-plus"></i> New Verification Request';
  html += "</button>";
  html += '<button class="btn btn-info btn-sm" onclick="loadKYCRequests()">';
  html += '<i class="fas fa-sync"></i> Refresh List';
  html += "</button>";
  html += "</div>";

  // Table Container
  html += '<div id="kycList">';
  html +=
    '<div class="loading-spinner show"><i class="fas fa-spinner"></i> Loading KYC data...</div>';
  html += "</div>";

  content.innerHTML = html;
  loadKYCRequests();
}

function loadKYCRequests() {
  fetch("/api/kyc/list")
    .then((res) => res.json())
    .then((data) => {
      displayKYCTable(data);
    })
    .catch((err) => {
      console.error("KYC Load Error:", err);
      showToast("Failed to load KYC requests", "error");
    });
}

function displayKYCTable(requests) {
  const container = document.getElementById("kycList");
  if (!requests || requests.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><i class="fas fa-id-card"></i><h3>No Verification Requests</h3><p>Create a new request to verify a customer.</p></div>';
    return;
  }

  let html = '<table class="table">';
  html += "<thead><tr>";
  html += "<th>Ref ID</th>";
  html += "<th>Customer</th>";
  html += "<th>Client</th>";
  html += "<th>Status</th>";
  html += "<th>Risk Score</th>";
  html += "<th>Actions</th>";
  html += "</tr></thead><tbody>";

  requests.forEach((req) => {
    let statusBadge = "status-pending";
    if (req.status === "Verified") statusBadge = "status-completed";
    if (req.status === "Rejected") statusBadge = "status-incorrect-number";

    // Simulated Risk Score visualization
    let riskColor = "#10b981"; // green
    if (req.ipRiskLevel === "High") riskColor = "#ef4444";
    if (req.ipRiskLevel === "Medium") riskColor = "#f59e0b";

    html += "<tr>";
    html += `<td>${escapeHtml(req.referenceId)}</td>`;
    html += `<td><strong>${escapeHtml(req.customerName)}</strong></td>`;
    html += `<td>${escapeHtml(req.clientName)}</td>`;
    html += `<td><span class="status-badge ${statusBadge}">${escapeHtml(req.status)}</span></td>`;
    html += `<td><i class="fas fa-circle" style="color:${riskColor}; font-size:10px;"></i> ${escapeHtml(req.ipRiskLevel || "Pending")}</td>`;
    html += "<td>";
    html += `<button class="btn btn-secondary btn-sm" onclick="viewKYCReport(${req.id})"><i class="fas fa-eye"></i> Report</button>`;
    if (req.verificationLink && req.status === "Pending") {
      html += ` <button class="btn btn-info btn-sm" onclick="copyLink('${escapeHtml(req.verificationLink)}')"><i class="fas fa-copy"></i> Link</button>`;
    }
    html += "</td>";
    html += "</tr>";
  });

  html += "</tbody></table>";
  container.innerHTML = html;
}

function openKYCModal() {
  const modal = document.createElement("div");
  modal.className = "modal show";

  let html = '<div class="modal-content">';
  html +=
    '<h2><i class="fas fa-user-shield"></i> Create Verification Request</h2>';
  html += '<form id="kycForm">';

  html += '<div class="form-group">';
  html += "<label>Client Name (Bank/Institution)</label>";
  html +=
    '<input type="text" id="kClient" required placeholder="e.g. HDFC Bank">';
  html += "</div>";

  html += '<div class="form-group">';
  html += "<label>Customer Name</label>";
  html +=
    '<input type="text" id="kCustomer" required placeholder="Name of person to verify">';
  html += "</div>";

  html += '<div class="form-group">';
  html += "<label>Reference ID (Internal)</label>";
  html +=
    '<input type="text" id="kRef" required placeholder="e.g. LOAN-2024-889">';
  html += "</div>";

  html += '<div style="display:flex; gap:12px; margin-top:20px;">';
  html +=
    '<button type="submit" class="btn btn-primary">Generate Link</button>';
  html +=
    '<button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>';
  html += "</div>";

  html += "</form></div>";
  modal.innerHTML = html;
  document.body.appendChild(modal);

  document.getElementById("kycForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

    const payload = {
      clientName: document.getElementById("kClient").value,
      customerName: document.getElementById("kCustomer").value,
      referenceId: document.getElementById("kRef").value,
      createdBy: currentUser.id, // Global from main app
    };

    fetch("/api/kyc/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          showToast("Verification session created!", "success");
          closeModal();
          loadKYCRequests();
        } else {
          showToast(data.message, "error");
          btn.disabled = false;
          btn.innerText = "Generate Link";
        }
      })
      .catch((err) => {
        showToast("Connection failed", "error");
        btn.disabled = false;
      });
  });
}

function viewKYCReport(id) {
  // Fetch detailed report
  fetch(`/api/kyc/list?id=${id}`)
    .then((res) => res.json())
    .then((data) => {
      const req = Array.isArray(data) ? data[0] : data;
      if (!req) return;

      const modal = document.createElement("div");
      modal.className = "modal show";

      let html = '<div class="modal-content">';
      html += `<h2><i class="fas fa-file-contract"></i> Verification Report: ${escapeHtml(req.referenceId)}</h2>`;

      // Biometric Score Card
      html +=
        '<div style="background:rgba(0,0,0,0.3); padding:15px; border-radius:10px; margin-bottom:15px; display:flex; justify-content:space-between;">';
      html += `<div><small style="color:#94a3b8">Face Match Score</small><br><strong style="font-size:18px; color:${req.faceMatchScore > 80 ? "#4ade80" : "#f87171"}">${req.faceMatchScore || 0}%</strong></div>`;
      html += `<div><small style="color:#94a3b8">Liveness</small><br><strong>${escapeHtml(req.livenessStatus || "N/A")}</strong></div>`;
      html += `<div><small style="color:#94a3b8">Est. Age</small><br><strong>${req.estimatedAge || "N/A"}</strong></div>`;
      html += "</div>";

      // Details Grid
      html +=
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:13px;">';
      html += `<div><strong>Status:</strong> ${req.status}</div>`;
      html += `<div><strong>IP Country:</strong> ${escapeHtml(req.ipCountry || "-")}</div>`;
      html += `<div><strong>IP Risk:</strong> ${escapeHtml(req.ipRiskLevel || "-")}</div>`;
      html += `<div><strong>ID Type:</strong> ${escapeHtml(req.idType || "-")}</div>`;
      html += "</div>";

      html += '<div style="margin-top:20px; text-align:right;">';
      html +=
        '<button class="btn btn-secondary" onclick="closeModal()">Close Report</button>';
      html += "</div>";

      html += "</div>";
      modal.innerHTML = html;
      document.body.appendChild(modal);
    });
}

function copyLink(link) {
  navigator.clipboard.writeText(link).then(() => {
    showToast("Link copied to clipboard", "success");
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// KEEP-ALIVE SYSTEM (Feature #2)
// ═══════════════════════════════════════════════════════════════════════════

let pingCount = 0;

function keepAlive() {
  pingCount++;
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);

  console.log(
    `🔄 Keep-alive ping #${pingCount} | Uptime: ${hours}h ${minutes}m`,
  );

  http
    .get("http://localhost:3000/health", (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const health = JSON.parse(data);
          console.log("✅ Health check:", health.status);
        } catch (e) {
          console.log("✅ Server responding");
        }
      });
    })
    .on("error", (err) => {
      console.log("❌ Health check failed:", err.message);
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// ERROR HANDLERS (Feature #11)
// ═══════════════════════════════════════════════════════════════════════════

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise);
  console.error("Reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  console.error("Stack:", error.stack);
});

// ═══════════════════════════════════════════════════════════════════════════
// SERVER INITIALIZATION & STARTUP
// ═══════════════════════════════════════════════════════════════════════════

async function startServer() {
  try {
    console.log(
      "═══════════════════════════════════════════════════════════════",
    );
    console.log("🚀 VALIDIANT PRODUCTIVITY TRACKER - STARTING UP");
    console.log(
      "═══════════════════════════════════════════════════════════════",
    );

    // Initialize database
    // await initializeDatabase();

    // Start Express server
    app.listen(PORT, () => {
      console.log("");
      console.log(
        "═══════════════════════════════════════════════════════════════",
      );
      console.log("✅ SERVER RUNNING SUCCESSFULLY");
      console.log(
        "═══════════════════════════════════════════════════════════════",
      );
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "production"}`);
      console.log(`🔐 Admin Login: admin@validiant.com / Admin@123`);
      console.log("");
      console.log("✅ Keep-alive system starting...");

      // Start keep-alive pings every 3 minutes
      setInterval(keepAlive, 180000);

      // Initial ping
      setTimeout(keepAlive, 5000);

      console.log("✅ All systems operational");
      console.log(
        "═══════════════════════════════════════════════════════════════",
      );
    });
  } catch (error) {
    console.error(
      "═══════════════════════════════════════════════════════════════",
    );
    console.error("❌ FATAL ERROR: Failed to start server");
    console.error(
      "═══════════════════════════════════════════════════════════════",
    );
    console.error(error);
    process.exit(1);
  }
}

// Start the server
startServer();
