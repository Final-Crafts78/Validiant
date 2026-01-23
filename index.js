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

// ✅ NEW: Serve static files (HTML, CSS, JS) from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

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
// NODEMAILER CONFIGURATION (Contact Form Emails)
// ═══════════════════════════════════════════════════════════════════════════
const nodemailer = require('nodemailer');

// Email transporter setup (Gmail)
let emailTransporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Use App Password, not regular password
    },
  });
  console.log('✅ Email service configured');
} else {
  console.warn('⚠️ EMAIL_USER or EMAIL_PASS not set. Contact form emails will be disabled.');
}

// Helper function to send emails
async function sendEmail(to, subject, html) {
  if (!emailTransporter) {
    console.warn('⚠️ Email not sent - transporter not configured');
    return { success: false, message: 'Email service not configured' };
  }
  
  try {
    await emailTransporter.sendMail({
      from: `"Validiant Notifications" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
    });
    console.log(`✅ Email sent to ${to}`);
    return { success: true };
  } catch (err) {
    console.error('❌ Email send failed:', err.message);
    return { success: false, message: err.message };
  }
}


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

// ═══════════════════════════════════════════════════════════════════════════
// API ROUTES - USER MANAGEMENT (FIXED)
// ═══════════════════════════════════════════════════════════════════════════

// 1. GET EMPLOYEES ONLY (Fixes "Admin in Dropdown" issue)
app.get("/api/users", async (req, res) => {
  try {
    // Only fetch users where role is 'employee'
    const { data: users, error } = await supabase
      .from("users")
      .select("id, name, email, role, employee_id, phone, last_active, is_active")
      .eq("role", "employee")  // <--- FILTER ADDED
      .order('name', { ascending: true });

    if (error) throw error;

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

// 2. CREATE NEW EMPLOYEE (Fixes "Null Role" error)
app.post("/api/users", async (req, res) => {
  try {
    const { name, email, password, employeeId, phone } = req.body;
    
    // Check if email exists
    const { data: existing } = await supabase.from("users").select("id").eq("email", email).single();
    if (existing) return res.status(400).json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password || "123456", 10); // Default password if empty

    const { data, error } = await supabase
      .from("users")
      .insert([{
        name,
        email,
        password: hashedPassword,
        role: "employee", // <--- FORCED ROLE (Fixes the crash)
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

// 6.5 RESET PASSWORD (New Feature)
app.post("/api/users/:id/reset-password", async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId, adminName, newPassword } = req.body;
    
    // Generate temp password if not provided
    const tempPassword = newPassword || Math.random().toString(36).slice(-8).toUpperCase();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    const { error } = await supabase
      .from("users")
      .update({ password: hashedPassword, updated_at: new Date() })
      .eq("id", id);
    
    if (error) throw error;
    
    await logActivity(adminId, adminName, "PASSWORD_RESET", null, `Reset password for user ID ${id}`, req);
    
    res.json({ success: true, tempPassword });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7. EDIT USER (New Feature)
app.put("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, employeeId, phone, password, adminId, adminName } = req.body;

    const updateData = {
      name, 
      email, 
      employee_id: employeeId, 
      phone, 
      updated_at: new Date()
    };

    // Only hash and update password if a new one is provided
    if (password && password.trim() !== "") {
       updateData.password = await bcrypt.hash(password, 10);
    }

    const { error } = await supabase.from("users").update(updateData).eq("id", id);
    if (error) throw error;

    await logActivity(adminId, adminName, "USER_UPDATED", null, `Updated Employee: ${name}`, req);
    res.json({ success: true, message: "Employee updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE EMPLOYEE (WITH ADMIN PASSWORD CHECK)
app.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { adminPassword } = req.body;
    
    // Verify admin password
    const { data: admin, error: adminError } = await supabase
      .from("users")
      .select("*")
      .eq("email", "admin@validiant.com")
      .single();
    
    if (adminError || !admin) {
      return res.status(401).json({ 
        success: false, 
        message: "Admin authentication failed" 
      });
    }
    
    const isMatch = await bcrypt.compare(adminPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid admin password" 
      });
    }
    
    // Get employee name before deletion (for logging)
    const { data: employee } = await supabase
      .from("users")
      .select("name, email")
      .eq("id", parseInt(id))
      .single();
    
    const employeeName = employee ? employee.name : `User ID ${id}`;
    
    // Step 1: Unassign all tasks from this employee
    const { error: unassignError } = await supabase
      .from("tasks")
      .update({ 
        assigned_to: null, 
        status: "Unassigned" 
      })
      .eq("assigned_to", parseInt(id));
    
    if (unassignError) {
      console.error("Error unassigning tasks:", unassignError);
    }
    
    // Step 2: Nullify user_id in activity_logs (preserve audit trail)
    const { error: logsError } = await supabase
      .from("activity_logs")
      .update({ user_id: null })
      .eq("user_id", parseInt(id));
    
    if (logsError) {
      console.error("Error updating activity logs:", logsError);
    }
    
    // Step 3: Delete the employee
    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("id", parseInt(id))
      .eq("role", "employee");
    
    if (deleteError) throw deleteError;
    
    // Log the deletion
    await logActivity(
      admin.id, 
      "Admin", 
      "EMPLOYEE_DELETED", 
      null, 
      `Deleted employee: ${employeeName}`, 
      req
    );
    
    res.json({ 
      success: true, 
      message: `Employee "${employeeName}" deleted successfully.` 
    });
    
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Failed to delete employee"
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// API ROUTES - DASHBOARD ANALYTICS (New Supabase Logic)
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
    console.error("Analytics Error:", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
// API ROUTES - DATA FETCHING (CORRECTED - SINGULAR)
// ═══════════════════════════════════════════════════════════════════════════

// 1. GET ACTIVITY LOGS (Fixes the "ActivityLog not defined" crash)
app.get("/api/activity-log", async (req, res) => { // <--- FIXED: SINGULAR
  try {
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    const formatted = data.map(log => ({
      id: log.id,
      userName: log.user_name || "System",
      action: log.action,
      taskTitle: log.task_id ? `Task #${log.task_id}` : "System",
      timestamp: log.created_at,
      details: log.details || ""
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Log Error:", err);
    res.json([]); // Return empty array instead of crashing
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// API ROUTES - THE "TYPE-SAFE" FIX (Solves ID Mismatch & Map)
// ═══════════════════════════════════════════════════════════════════════════

// 1. GET ALL TASKS
app.get("/api/tasks", async (req, res) => {
  try {
    // ✅ NEW: Read filter parameters from URL
    const { status, employeeId, pincode, search } = req.query;
    
    // A. Fetch Data (WITH FILTERS)
    let query = supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });
    
    // ✅ NEW: Apply database-level filters
    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (employeeId && employeeId !== "all") {
      query = query.eq("assigned_to", parseInt(employeeId));
    }
    if (pincode) {
      query = query.eq("pincode", pincode);
    }
    
    const { data: tasks, error: taskError } = await query;
    if (taskError) throw taskError;

    const { data: users, error: userError } = await supabase
      .from("users")
      .select("id, name, employee_id");
    if (userError) throw userError;

    // B. Build the Response
    const formatted = tasks.map(task => {
      // --- FIX 1: LOOSE EQUALITY FOR ID MATCHING ---
      const matchedUser = users.find(u => u.id == task.assigned_to);
      const userName = matchedUser ? matchedUser.name : "Unassigned";

      // --- FIX 2: FORCE MAP "YES" ---
      const addressText = task.address || ""; 
      const hasMapData = addressText.trim().length > 0;

      return {
        ...task,
        address: addressText,
        map: hasMapData ? "Yes" : "No",
        hasMap: hasMapData,
        isMapAvailable: hasMapData,
        location: addressText,
        clientName: task.client_name || "-",
        client: task.client_name || "-",
        assignedToName: userName, 
        assigneeName: userName,
        users: { name: userName },
        status: task.status
      };
    });

    // ✅ NEW: Apply search filter
    let finalResult = formatted;
    if (search) {
      const searchLower = search.toLowerCase();
      finalResult = formatted.filter(task => {
        return (
          (task.title && task.title.toLowerCase().includes(searchLower)) ||
          (task.clientName && task.clientName.toLowerCase().includes(searchLower)) ||
          (task.pincode && task.pincode.includes(searchLower)) ||
          (task.assignedToName && task.assignedToName.toLowerCase().includes(searchLower)) ||
          (task.notes && task.notes.toLowerCase().includes(searchLower))
        );
      });
    }

    res.json(finalResult);
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 2. CREATE TASK (Fixed - With Logging)
app.post("/api/tasks", async (req, res) => {
  try {
    const { 
      title, pincode, address, mapUrl, map_url, notes, 
      createdBy, createdByName, // 1. Added createdByName
      assignedTo, clientName, latitude, longitude 
    } = req.body;

    // Handle map URL and Coordinates
    const finalMapUrl = mapUrl || map_url || null;
    const finalAddress = address || finalMapUrl || null;
    
    let finalLat = latitude;
    let finalLng = longitude;
    
    if (finalMapUrl && (!finalLat || !finalLng)) {
      const coords = extractCoordinates(finalMapUrl);
      if (coords) { finalLat = coords.latitude; finalLng = coords.longitude; }
    }

    let initialStatus = "Unassigned";
    let finalAssignee = null;
    let assignedDate = null;

    if (assignedTo && assignedTo !== "Unassigned" && assignedTo !== "") {
      initialStatus = "Pending";
      finalAssignee = assignedTo;
      assignedDate = new Date().toISOString().split('T')[0];
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert([{
        title, pincode, address: finalAddress, map_url: finalMapUrl,
        latitude: finalLat, longitude: finalLng, notes,
        client_name: clientName, status: initialStatus,
        assigned_to: finalAssignee, assigned_date: assignedDate,
        created_by: createdBy,
      }])
      .select();

    if (error) throw error;

    // 2. LOG ACTIVITY
    const actionDetails = finalAssignee ? `Created & Assigned to ID ${finalAssignee}` : "Created in Unassigned Pool";
    await logActivity(createdBy, createdByName || "Admin", "TASK_CREATED", data[0].id, actionDetails, req);

    console.log(`✅ Task created: ${title}`);
    res.json({ success: true, task: data[0] });

  } catch (err) {
    console.error("❌ Create Task Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. UPDATE TASK (Fixed - With Logging)
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, pincode, address, notes, status, assignedTo, clientName, mapUrl,
      userId, userName // 1. Capture user info from frontend
    } = req.body;

    const updateData = { updated_at: new Date() };
    let actionType = "TASK_UPDATED";
    let actionDetails = "Task details updated";

    // Build update object and determine log action
    if (title) updateData.title = title;
    if (pincode) updateData.pincode = pincode;
    if (address) updateData.address = address;
    if (clientName) updateData.client_name = clientName;
    if (notes) updateData.notes = notes;
    
    if (mapUrl) {
      updateData.map_url = mapUrl;
      actionType = "MAP_UPDATED";
      actionDetails = "Map URL added/changed";
    }

    if (status) {
      updateData.status = status;
      actionType = `TASK_${status.toUpperCase().replace(/\s+/g, '_')}`; // e.g., TASK_COMPLETED
      actionDetails = `Status changed to ${status}`;
      
      if (status === 'Completed') updateData.completed_at = new Date();
      if (status === 'Verified') updateData.verified_at = new Date();
    }
    
    if (assignedTo) {
        updateData.assigned_to = assignedTo;
        if (status === "Unassigned") updateData.status = "Pending";
        actionType = "TASK_REASSIGNED";
    }

    const { error } = await supabase.from("tasks").update(updateData).eq("id", id);
    if (error) throw error;

    // 2. LOG ACTIVITY
    if (userId) {
      await logActivity(userId, userName || "Unknown", actionType, id, actionDetails, req);
    }

    res.json({ success: true, message: "Updated" });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ success: false, message: "Failed" });
  }
});

// 2. GET UNASSIGNED TASKS
app.get("/api/tasks/unassigned", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("status", "Unassigned")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. DELETE TASK (Fixed - With Logging)
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId, adminName } = req.query; // 1. Get User Info from Query Params
    
    // Delete from Supabase
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) throw error;

    // 2. LOG ACTIVITY
    if (adminId) {
      await logActivity(adminId, adminName || "Admin", "TASK_DELETED", id, `Task #${id} deleted`, req);
    }

    res.json({ success: true, message: "Task deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ success: false, message: "Failed to delete task" });
  }
});

// 4. KYC REQUESTS (Fixes "Loading KYC data...")
app.get("/api/kyc/list", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("verification_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data); 
  } catch (err) {
    res.status(500).json({ error: "Failed to load KYC" });
  }
});


// ═══════════════════════════════════════════════════════════════════════════
// 5. BULK UPLOAD TASKS (Merged: Fuzzy Matching + Auto-Assign + Validation)
app.post("/api/tasks/bulk-upload", upload.single("excelFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    const { adminId, adminName } = req.body;
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (rawData.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: "Excel file is empty." });
    }

        let successCount = 0;
    let errors = [];
    const tasksToInsert = []; // Batch collection
    
    for (let i = 0; i < rawData.length; i++) {
      const rawRow = rawData[i];
      const rowNumber = i + 2;

      try {
        // 🟢 STEP 1: Normalize Headers (The New "Fuzzy" Feature)
        const row = {};
        Object.keys(rawRow).forEach(key => {
          const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
          row[cleanKey] = rawRow[key];
        });

        // 🟢 STEP 2: Extract Fields using Multiple Variations
        const title = row.requestid || row.caseid || row.title || row.id || row.trackingid;
        const pincode = row.pincode || row.pin || row.zip || row.postalcode;
        const clientName = row.individualname || row.clientname || row.client || row.name;
        const mapUrl = row.mapurl || row.map || row.link || row.googlemap || row.url;
        const notes = row.notes || row.note || row.remarks;
        const address = row.address || row.location;
        
        // Employee Fields for Auto-Assign
        const empIdRaw = row.employeeid || row.empid || row.id;
        const empEmailRaw = row.employeeemail || row.email || row.mail;

        // 🟢 STEP 3: Strict Validation (From your original code)
        if (!title) {
          errors.push(`Row ${rowNumber}: Case ID/Title is missing`);
          continue;
        }
        if (!pincode) {
          errors.push(`Row ${rowNumber}: Pincode is missing`);
          continue;
        }
        
        const pincodeStr = String(pincode).trim();
        if (!/^[0-9]{6}$/.test(pincodeStr)) {
          errors.push(`Row ${rowNumber}: Invalid Pincode (must be 6 digits)`);
          continue;
        }

        // 🟢 STEP 4: Employee Auto-Assignment Logic (Restored)
        let assignedToId = null;
        let assignedDate = null;
        let taskStatus = "Unassigned";

        if (empIdRaw || empEmailRaw) {
           let query = supabase.from("users").select("id").eq("role", "employee").eq("is_active", true);
           
           if (empIdRaw) query = query.eq("employee_id", String(empIdRaw).trim());
           else if (empEmailRaw) query = query.eq("email", String(empEmailRaw).trim().toLowerCase());

           const { data: emp } = await query.single();
           
           if (emp) {
             assignedToId = emp.id;
             assignedDate = new Date().toISOString().split('T')[0];
             taskStatus = "Pending";
           } else {
             // Optional: Log that employee wasn't found, but still create task
             // errors.push(`Row ${rowNumber}: Employee not found, added to Unassigned pool.`);
           }
        }

        // 🟢 STEP 5: Coordinate Extraction
        let finalLat = row.latitude || row.lat;
        let finalLng = row.longitude || row.lng || row.long;

        if (mapUrl && (!finalLat || !finalLng)) {
          const coords = extractCoordinates(mapUrl);
          if (coords) { finalLat = coords.latitude; finalLng = coords.longitude; }
        }

        // 🟢 STEP 6: Collect for batch insert
        tasksToInsert.push({
          title: String(title),
          pincode: pincodeStr,
          client_name: clientName || "Unknown Client",
          map_url: mapUrl || null,
          address: address || null,
          latitude: finalLat || null,
          longitude: finalLng || null,
          notes: notes || null,
          status: taskStatus,
          assigned_to: assignedToId,
          assigned_date: assignedDate,
                  created_by: adminId || null
        });
        successCount++;

      } catch (err) {
        errors.push(`Row ${rowNumber}: ${err.message}`);
      }
    }

        // 🔥 BATCH INSERT (All-or-nothing transaction)
    if (tasksToInsert.length > 0) {
      console.log(`📦 Batch inserting ${tasksToInsert.length} tasks...`);
      const { error: batchError } = await supabase.from("tasks").insert(tasksToInsert);
      if (batchError) {
        console.error("❌ Batch insert failed:", batchError);
        throw new Error("Database batch insert failed: " + batchError.message);
      }
      console.log(`✅ Batch insert successful!`);
    }

    // Cleanup & Response
    fs.unlinkSync(req.file.path);
    
    await logActivity(adminId, adminName, "BULK_UPLOAD", null, `Uploaded ${successCount} tasks`, req);
    
    res.json({ 
      success: true, 
      message: `${successCount} tasks uploaded successfully.`, 
      successCount, 
      errors: errors.slice(0, 20), 
      hasMoreErrors: errors.length > 20 
    });

  } catch (err) {
    console.error("Bulk Upload Error:", err);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: err.message });
  }
});


// ═══════════════════════════════════════════════════════════════════════════
// 6. CSV EXPORT (Fixed - Respects Filters & Date Range)
app.get("/api/export", async (req, res) => {
  try {
    const { status, employeeId, pincode, search, startDate, endDate } = req.query;
    console.log("📥 Exporting tasks with filters:", req.query);

    // 1. Build Query (Database Level Filters)
    let query = supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (status && status !== "all") query = query.eq("status", status);
    if (employeeId && employeeId !== "all") query = query.eq("assigned_to", parseInt(employeeId));
    if (pincode) query = query.eq("pincode", pincode);

    const { data: tasks, error: tasksError } = await query;
    if (tasksError) throw tasksError;

    // 2. Fetch Users (for names)
    const { data: users } = await supabase.from("users").select("id, name, email, employee_id");

    // 3. Apply Advanced Filters (In-Memory: Search & Date Range)
    let finalTasks = tasks.filter(task => {
      // Date Filter
      if (startDate || endDate) {
        const taskDate = task.assigned_date || task.assignedDate || (task.created_at ? task.created_at.split('T')[0] : null);
        if (!taskDate) return false;
        if (startDate && taskDate < startDate) return false;
        if (endDate && taskDate > endDate) return false;
      }

      // Search Filter (Fuzzy Match)
      if (search) {
        const s = search.toLowerCase();
        const employee = users.find(u => u.id == task.assigned_to);
        const empName = employee ? employee.name.toLowerCase() : "";
        
        return (
          (task.title && task.title.toLowerCase().includes(s)) ||
          (task.client_name && task.client_name.toLowerCase().includes(s)) ||
          (task.pincode && String(task.pincode).includes(s)) ||
          (task.notes && task.notes.toLowerCase().includes(s)) ||
          (empName.includes(s))
        );
      }
      return true;
    });

    console.log(`📊 Exporting ${finalTasks.length} filtered tasks`);

    // 4. Generate CSV
    let csv = "CaseID,ClientName,Employee,EmployeeID,Pincode,Status,AssignedDate,CompletedAt,TimeElapsed,MapURL,Address,Notes\n";

    finalTasks.forEach(task => {
      const employee = users.find(u => u.id == task.assigned_to);
      const empName = employee ? employee.name : "Unassigned";
      const empId = employee ? employee.employee_id : "";

      // SLA Calculation
      let slaStatus = "N/A";
      if (task.status === "Pending" && task.assigned_date) {
        const diff = (new Date() - new Date(task.assigned_date)) / (1000 * 60 * 60);
        slaStatus = `${Math.floor(diff)}h`;
      } else if (task.completed_at) {
        slaStatus = "Done";
      }

      const escape = (str) => {
        if (str === null || str === undefined) return "";
        return `"${String(str).replace(/"/g, '""')}"`; // Handle commas/quotes
      };

      csv += [
        escape(task.title),
        escape(task.client_name),
        escape(empName),
        escape(empId),
        escape(task.pincode),
        escape(task.status),
        escape(task.assigned_date),
        escape(task.completed_at ? new Date(task.completed_at).toISOString() : ""),
        escape(slaStatus),
        escape(task.map_url),
        escape(task.address),
        escape(task.notes)
      ].join(",") + "\n";
    });

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.header("Content-Disposition", `attachment; filename="tasks-export-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);

  } catch (error) {
    console.error("❌ Export error:", error);
    res.status(500).send("Export failed.");
  }
});


// ═══════════════════════════════════════════════════════════════════════════
// 7. CONTACT FORM (Landing Page Lead Generation - Supabase + Email)
// ═══════════════════════════════════════════════════════════════════════════
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, company, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required",
      });
    }

    // Save to Supabase
    const { data, error } = await supabase
      .from("contact_messages")
      .insert([{
        name: name,
        email: email,
        phone: phone || null,
        company: company || null,
        message: message,
        status: "new",
      }])
      .select();

    if (error) throw error;

    console.log(`✅ Contact form submitted by ${email}`);

    // Send email notification to admin
    if (emailTransporter) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">🔔 New Contact Form Submission</h2>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
            <p><strong>Message:</strong></p>
            <p style="background: white; padding: 15px; border-radius: 4px;">${message}</p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            Submitted on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
          </p>
        </div>
      `;

      await sendEmail(
        process.env.EMAIL_USER, // Send to yourself
        `🔔 New Contact Form: ${name} from ${company || 'Direct'}`,
        emailHtml
      );
    }

    res.json({
      success: true,
      message: "Thank you! We'll get back to you soon.",
    });
  } catch (err) {
    console.error("❌ Contact form error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to submit. Please try again.",
    });
  }
});


// ═══════════════════════════════════════════════════════════════════════════
// 8. KYC/VERIFICATION SERVICE (B2B Feature - Supabase Version)
// ═══════════════════════════════════════════════════════════════════════════

// Create Verification Request
app.post("/api/kyc/create", async (req, res) => {
  try {
    const { clientName, customerName, referenceId, createdBy } = req.body;

    // Validate required fields
    if (!clientName || !customerName || !referenceId) {
      return res.status(400).json({
        success: false,
        message: "Client name, customer name, and reference ID are required",
      });
    }

    // Generate mock session ID (replace with real API in production)
    const sessionId = `sess_${Math.random().toString(36).substr(2, 9)}`;
    const verificationLink = `https://verify.validiant.com?session=${sessionId}`;

    // Save to Supabase
    const { data, error } = await supabase
      .from("verification_requests")
      .insert([{
        reference_id: referenceId,
        client_name: clientName,
        customer_name: customerName,
        session_id: sessionId,
        verification_link: verificationLink,
        created_by: createdBy,
        status: "Pending",
        ip_risk_level: "Pending",
      }])
      .select();

    if (error) throw error;

    console.log(`✅ KYC request created: ${referenceId}`);

    res.json({
      success: true,
      kyc: data[0],
    });
  } catch (err) {
    console.error("❌ KYC Create Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// Webhook Listener (Callback from verification service)
app.post("/api/webhooks/didit", async (req, res) => {
  try {
    const { sessionId, faceMatchScore, liveness, age, risk, country, idType } = req.body;

    // Find request by session ID
    const { data: kyc, error: findError } = await supabase
      .from("verification_requests")
      .select("*")
      .eq("session_id", sessionId)
      .single();

    if (findError || !kyc) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Update verification results
    const { error: updateError } = await supabase
      .from("verification_requests")
      .update({
        face_match_score: faceMatchScore || 0,
        liveness_status: liveness ? "Passed" : "Failed",
        estimated_age: age,
        ip_risk_level: risk || "Low",
        ip_country: country,
        id_type: idType,
        status: (faceMatchScore >= 80 && liveness) ? "Verified" : "Rejected",
        updated_at: new Date(),
      })
      .eq("session_id", sessionId);

    if (updateError) throw updateError;

    console.log(`✅ KYC webhook processed: ${sessionId}`);

    res.json({ received: true });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    res.status(500).json({ error: err.message });
  }
});

// List All Verification Requests (or get single by ID)
app.get("/api/kyc/list", async (req, res) => {
  try {
    const { id } = req.query;

    if (id) {
      // Get single request
      const { data, error } = await supabase
        .from("verification_requests")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return res.json(data);
    }

    // Get all requests
    const { data, error } = await supabase
      .from("verification_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("❌ KYC List error:", err);
    res.status(500).json({ error: "Failed to load verification requests" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// API ROUTES - TASK ACTIONS (Create, Assign, Update)
// ═══════════════════════════════════════════════════════════════════════════

// 1. ASSIGN TASK TO EMPLOYEE
app.post("/api/tasks/:taskId/assign", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { employeeId, adminId, adminName } = req.body;

    // 1. Get Employee Details (to verify they exist)
    const { data: employee } = await supabase
      .from("users")
      .select("id, name")
      .eq("id", employeeId)
      .single();

    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

    // 2. Update the Task
    const { error } = await supabase
      .from("tasks")
      .update({
        assigned_to: employeeId,
        assigned_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        status: "Pending",
        updated_at: new Date()
      })
      .eq("id", taskId);

    if (error) throw error;

    // 3. Log it
    await logActivity(adminId, adminName, "TASK_ASSIGNED", taskId, `Assigned to ${employee.name}`, req);

    res.json({ success: true, message: `Assigned to ${employee.name}` });

  } catch (err) {
    console.error("Assign Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. UPDATE TASK STATUS (Completed, Verified, etc.)
app.put("/api/tasks/:taskId/status", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, userId, userName, notes, location } = req.body;

    const updateData = {
      status: status,
      updated_at: new Date()
    };

    // Add specific timestamps based on status
    if (status === 'Completed') updateData.completed_at = new Date();
    if (status === 'Verified') updateData.verified_at = new Date();

    // Perform Update
    const { error } = await supabase
      .from("tasks")
      .update(updateData)
      .eq("id", taskId);

    if (error) throw error;

    // Log Activity
    await logActivity(userId, userName, `TASK_${status.toUpperCase()}`, taskId, notes, req);

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

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
// SERVICE WORKER - Offline Support
// ═══════════════════════════════════════════════════════════════════════════
app.get("/sw.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");
  res.send(`
const CACHE_NAME = 'validiant-v1';
const ASSETS_TO_CACHE = [
  '/signin',
  '/app.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  // Cache-first for static assets
  if (event.request.url.includes('font-awesome') || event.request.url.includes('.css')) {
    event.respondWith(
      caches.match(event.request).then((response) => response || fetch(event.request))
    );
  }
  // Network-first for API (with offline message)
  else if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => new Response(
        JSON.stringify({ success: false, message: '📴 Offline - Changes will sync when online' }),
        { headers: { 'Content-Type': 'application/json' } }
      ))
    );
  }
});
  `);
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
    "@media (max-width: 640px) { .user-info { gap: 8px; } .user-chip span { max-width: 120px; } .menu { justify-content: flex-start; overflow-x: auto; } .menu::-webkit-scrollbar { height: 4px; } .menu::-webkit-scrollbar-thumb { background: rgba(55,65,81,0.9); border-radius: 999px; } ";
  html += "/* iOS Touch Optimization */ ";
  html += ".btn, .map-button, button { min-height: 44px; -webkit-tap-highlight-color: rgba(99, 102, 241, 0.2); touch-action: manipulation; } ";
  html += ".content, .modal-content, table { -webkit-overflow-scrolling: touch; } ";
  html += "input, select, textarea { font-size: 16px !important; } }";

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
  html += "    #taskDetailsPanel {\n";
  html += "      position: fixed; bottom: 0; left: 0; right: 0; background: #fff; z-index: 2000;\n";
  html += "      border-radius: 20px 20px 0 0; box-shadow: 0 -10px 40px rgba(0,0,0,0.3);\n";
  html += "      transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);\n";
  html += "      max-height: 85vh; overflow-y: auto; padding-bottom: 30px;\n";
  html += "    }\n";
  html += "    #taskDetailsPanel.active { transform: translateY(0); }\n";
  html += "    #panelOverlay {\n";
  html += "      position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6);\n";
  html += "      z-index: 1999; opacity: 0; pointer-events: none; transition: opacity 0.3s;\n";
  html += "    }\n";
  html += "    #panelOverlay.active { opacity: 1; pointer-events: auto; }\n";
  html += "    .panel-handle-bar { width: 50px; height: 5px; background: #e5e7eb; border-radius: 10px; margin: 15px auto; }\n";
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
  html += '<div id="panelOverlay" onclick="closeTaskPanel()"></div>';
  html += '<div id="taskDetailsPanel">';
  html += '  <div class="panel-handle-bar" onclick="closeTaskPanel()"></div>';
  html += '  <div id="panelContent" style="padding: 0 20px 20px 20px; color: #333;"></div>';
  html += '</div>';
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
  html += "let allUnassignedTasks = [];\n";
  html += "let allEmployees = [];\n";
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
  html += "  \n";
  html += "  // Warning at 13 minutes (2 min before expiry)\n";
  html += "  setTimeout(function() {\n";
  html += "    if (!sessionWarningShown) {\n";
  html += "      showToast('⏰ Your session will expire in 2 minutes. Move your mouse to stay logged in.', 'warning');\n";
  html += "      sessionWarningShown = true;\n";
  html += "    }\n";
  html += "  }, 780000); // 13 minutes\n";
  html += "  \n";
  html += "  sessionTimeout = setTimeout(function() {\n";
  html += "    showToast('Session expired. Please login again.', 'error');\n";
  html += "    setTimeout(function() {\n";
  html += "      logout();\n";
  html += "    }, 2000);\n";
  html += "  }, 900000); // 15 minutes\n";
  html += "}\n";
  html += "\n";
  html += "let sessionWarningShown = false;\n";
  html += "\n";
  html += "resetSessionTimeout();\n";
  html += "document.addEventListener('click', function() { resetSessionTimeout(); sessionWarningShown = false; });\n";
  html += "document.addEventListener('keypress', function() { resetSessionTimeout(); sessionWarningShown = false; });\n";
  html += "document.addEventListener('mousemove', function() { resetSessionTimeout(); sessionWarningShown = false; });\n";
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
  html += "function showEditMapModal(taskId) {\n";
  html += "  // 🟢 Search in both lists (Admin View OR Unassigned Pool)\n";
  html += "  var task = null;\n";
  html += "  if (Array.isArray(allAdminTasks)) task = allAdminTasks.find(function(t) { return t.id === taskId; });\n";
  html += "  if (!task && typeof allUnassignedTasks !== 'undefined' && Array.isArray(allUnassignedTasks)) {\n";
  html += "    task = allUnassignedTasks.find(function(t) { return t.id === taskId; });\n";
  html += "  }\n";
  html += "\n";
  html += "  if (!task) {\n";
  html += "    showToast('Task data not found in memory. Please refresh.', 'error');\n";
  html += "    return;\n";
  html += "  }\n";
  html += "\n";
  html += "  var modal = document.createElement('div');\n";
  html += "  modal.className = 'modal show';\n"; // Ensure 'show' class is added
  html += "  modal.setAttribute('data-type', 'edit-map');\n";
  html += "  \n";
  html += "  var content = document.createElement('div');\n";
  html += "  content.className = 'modal-content';\n";
  html += "  \n";
  html += "  var h2 = document.createElement('h2');\n";
  html += "  h2.innerHTML = '<i class=\"fas fa-map-marked-alt\"></i> Edit Map Link';\n";
  html += "  content.appendChild(h2);\n";
  html += "  \n";
  html += "  var p1 = document.createElement('p');\n";
  html += "  p1.innerHTML = '<strong>Case ID:</strong> ' + escapeHtml(task.title);\n";
  html += "  content.appendChild(p1);\n";
  html += "  \n";
  html += "  var p2 = document.createElement('p');\n";
  html += "  p2.innerHTML = '<strong>Pincode:</strong> ' + escapeHtml(task.pincode || 'NA');\n";
  html += "  content.appendChild(p2);\n";
  html += "  \n";
  html += "  var group = document.createElement('div');\n";
  html += "  group.className = 'form-group';\n";
  html += "  \n";
  html += "  var label = document.createElement('label');\n";
  html += "  label.setAttribute('for', 'editMapUrl');\n";
  html += "  label.innerHTML = '<i class=\"fas fa-link\"></i> Google Maps URL';\n";
  html += "  group.appendChild(label);\n";
  html += "  \n";
  html += "  var input = document.createElement('input');\n";
  html += "  input.type = 'url';\n";
  html += "  input.id = 'editMapUrl';\n";
  html += "  input.className = 'search-box';\n";
  html += "  input.style.width = '100%';\n";
  html += "  input.placeholder = 'Paste Google Maps link';\n";
  html += "  input.value = task.mapurl || task.map_url || task.mapUrl || '';\n";
  html += "  group.appendChild(input);\n";
  html += "  content.appendChild(group);\n";
  html += "  \n";
  html += "  var buttonsRow = document.createElement('div');\n";
  html += "  buttonsRow.style.display = 'flex';\n";
  html += "  buttonsRow.style.gap = '10px';\n";
  html += "  buttonsRow.style.marginTop = '18px';\n";
  html += "  \n";
  html += "  var saveBtn = document.createElement('button');\n";
  html += "  saveBtn.className = 'btn btn-primary btn-sm';\n";
  html += "  saveBtn.innerHTML = '<i class=\"fas fa-save\"></i> Save';\n";
  html += "  saveBtn.addEventListener('click', function () { saveMapUpdate(taskId); });\n";
  html += "  buttonsRow.appendChild(saveBtn);\n";
  html += "  \n";
  html += "  var cancelBtn = document.createElement('button');\n";
  html += "  cancelBtn.className = 'btn btn-secondary btn-sm';\n";
  html += "  cancelBtn.innerHTML = '<i class=\"fas fa-times\"></i> Cancel';\n";
  html += "  cancelBtn.addEventListener('click', closeEditMapModal);\n";
  html += "  buttonsRow.appendChild(cancelBtn);\n";
  html += "  \n";
  html += "  content.appendChild(buttonsRow);\n";
  html += "  modal.appendChild(content);\n";
  html += "  document.body.appendChild(modal);\n";
  html += "}\n";
  html += "function closeEditMapModal() {";
  html +=
    "  var modal = document.querySelector('.modal[data-type=\"edit-map\"]');";
  html += "  if (modal) modal.remove();";
  html += "}";
  html += "function saveMapUpdate(taskId) {\n";
  html += "  var input = document.getElementById('editMapUrl');\n";
  html += "  if (!input) return;\n";
  html += "  \n";
  html += "  var newUrl = input.value.trim();\n";
  html += "  /* Optional: Basic validation to ensure it's not empty, or allow empty to clear it */\n";
  html += "  \n";
  html += "  var btn = document.querySelector('.modal .btn-primary');\n";
  html += "  if(btn) btn.innerHTML = '<i class=\"fas fa-spinner fa-spin\"></i> Saving...';\n";
  html += "  \n";
  html += "  fetch('/api/tasks/' + taskId, {\n";
  html += "    method: 'PUT',\n";
  html += "    headers: { 'Content-Type': 'application/json' },\n";
  html += "    body: JSON.stringify({ mapUrl: newUrl, userId: currentUser.id, userName: currentUser.name })\n";
  html += "  })\n";
  html += "  .then(function(res) { return res.json(); })\n";
  html += "  .then(function(data) {\n";
  html += "    if (data.success) {\n";
  html += "      showToast('Map URL updated successfully', 'success');\n";
  html += "      closeEditMapModal();\n";
  html += "      \n";
  html += "      // 🟢 SMART REFRESH LOGIC\n";
  html += "      // Check if this task exists in the Unassigned list\n";
  html += "      var isUnassigned = false;\n";
  html += "      if (typeof allUnassignedTasks !== 'undefined' && Array.isArray(allUnassignedTasks)) {\n";
  html += "        if (allUnassignedTasks.find(function(t) { return t.id === taskId; })) {\n";
  html += "          isUnassigned = true;\n";
  html += "        }\n";
  html += "      }\n";
  html += "      \n";
  html += "      // Refresh the correct view based on where the task was found\n";
  html += "      if (isUnassigned) {\n";
  html += "        loadUnassignedTasks(); // Refresh Unassigned Table\n";
  html += "      } else {\n";
  html += "        loadAllTasks(); // Refresh Main Admin Table\n";
  html += "      }\n";
  html += "    } else {\n";
  html += "      showToast('Failed to update map: ' + data.message, 'error');\n";
  html += "      if(btn) btn.innerHTML = '<i class=\"fas fa-save\"></i> Save';\n";
  html += "    }\n";
  html += "  })\n";
    html += "  .catch(function(err) {\n";
  html += "    console.error(err);\n";
  html += "    showToast('Error saving map update', 'error');\n";
  html += "    if(btn) btn.innerHTML = '<i class=\"fas fa-save\"></i> Save';\n";
  html += "  });\n";
  html += "}\n";
  html += "\n";
  html += "// Attach change listeners to All Tasks filters\n";
  html += "function attachAllTasksFilterListeners() {\n";
  html += "  const statusEl = document.getElementById('allTasksStatusFilter');\n";
  html += "  if (statusEl) statusEl.addEventListener('change', function() { loadAllTasks(); });\n";
  html += "  \n";
  html += "  const empEl = document.getElementById('allTasksEmployeeFilter');\n";
  html += "  if (empEl) empEl.addEventListener('change', function() { loadAllTasks(); });\n";
  html += "  \n";
  html += "  const pinEl = document.getElementById('allTasksPincodeFilter');\n";
  html += "  if (pinEl) pinEl.addEventListener('input', function() {\n";
  html += "    const val = this.value.trim();\n";
  html += "    if (val.length === 0 || val.length === 6) loadAllTasks();\n";
  html += "  });\n";
  html += "  \n";
  html += "  const searchEl = document.getElementById('allTasksSearch');\n";
  html += "  let searchTimeout;\n";
  html += "  if (searchEl) searchEl.addEventListener('input', function() {\n";
  html += "    clearTimeout(searchTimeout);\n";
  html += "    searchTimeout = setTimeout(function() { loadAllTasks(); }, 500);\n";
  html += "  });\n";
  html += "  \n";
  html += "  const fromDateEl = document.getElementById('allTasksFromDate');\n";
  html += "  const toDateEl = document.getElementById('allTasksToDate');\n";
  html += "  if (fromDateEl) fromDateEl.addEventListener('change', function() { loadAllTasks(); });\n";
  html += "  if (toDateEl) toDateEl.addEventListener('change', function() { loadAllTasks(); });\n";
  html += "}\n";
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
  html += "  const url = '/api/tasks/unassigned' + (searchTerm ? '?search=' + encodeURIComponent(searchTerm) : '');\n";
  html += "  \n";
  html += "  fetch(url)\n";
  html += "    .then(function(res) { return res.json(); })\n";
  html += "    .then(function(tasks) {\n";
  html += "      allUnassignedTasks = tasks; // 🟢 Store globally so Edit Modal can find them\n";
  html += "      fetch('/api/users')\n";
  html += "        .then(function(r) { return r.json(); })\n";
  html += "        .then(function(employees) {\n";
  html += "          displayUnassignedTasks(tasks, employees);\n";
  html += "        });\n";
  html += "    })\n";
  html += "    .catch(function(err) {\n";
  html += "      console.error('Error loading unassigned tasks:', err);\n";
  html += "      document.getElementById('unassignedTasksList').innerHTML = '<div class=\"empty-state\"><i class=\"fas fa-exclamation-triangle\"></i><h3>Error Loading Tasks</h3><p>Please try again.</p></div>';\n";
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
  html += "    html += '<p>No unassigned tasks found. All tasks have been assigned to employees.</p>';\n";
  html += "    html += '</div>';\n";
  html += "  } else {\n";
  html += "    html = '<p style=\"color: #e5e7eb; font-weight: 600; font-size: 13px; margin-bottom: 14px;\">';\n";
  html += "    html += '<i class=\"fas fa-info-circle\"></i> Found ' + tasks.length + ' unassigned task(s)';\n";
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
  html += "      // 🟢 Robust map URL check\n";
  html += "      const finalMapUrl = task.mapUrl || task.map_url || task.mapurl || null;\n";
  html += "      \n";
  html += "      html += '<tr>';\n";
  html += "      html += '<td data-label=\"Case ID\"><strong>' + escapeHtml(task.title) + '</strong></td>';\n";
  html += "      html += '<td>' + escapeHtml(task.clientName || '-') + '</td>';\n";
  html += "      html += '<td><span class=\"pincode-highlight\"><i class=\"fas fa-map-pin\"></i> ' + escapeHtml(task.pincode || 'N/A') + '</span></td>';\n";
  html += "      \n";
  html += "      html += '<td>';\n";
  html += "      if (finalMapUrl) {\n";
  html += "        html += '<a href=\"' + escapeHtml(finalMapUrl) + '\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color: #3b82f6; font-weight: 600; margin-right:8px;\">';\n";
  html += "        html += '<i class=\"fas fa-map-marker-alt\"></i> View Map';\n";
  html += "        html += '</a>';\n";
  html += "      } else {\n";
  html += "        html += '<span style=\"color: #9ca3af; font-style: italic; margin-right:8px;\">No map</span>';\n";
  html += "      }\n";
  html += "      // 🟢 The Edit Map Button\n";
  html += "      html += '<button class=\"btn btn-secondary btn-sm\" style=\"padding:4px 8px;font-size:11px;\" title=\"Edit map link\" onclick=\"showEditMapModal(' + task.id + ')\"><i class=\"fas fa-pen\"></i></button>';\n";
  html += "      html += '</td>';\n";
  html += "      \n";
  html += "      html += '<td>' + escapeHtml(task.notes || 'N/A') + '</td>';\n";
  html += "      html += '<td>';\n";
  html += "      html += '<select id=\"emp-' + task.id + '\" style=\"padding: 10px; border-radius: 8px; margin-right: 10px; border: 2px solid #e2e8f0; font-weight: 600;\">';\n";
  html += "      html += '<option value=\"\">Select Employee</option>';\n";
  html += "      employees.forEach(function(emp) {\n";
  html += "        html += '<option value=\"' + emp.id + '\">' + escapeHtml(emp.name) + '</option>';\n";
  html += "      });\n";
  html += "      html += '</select>';\n";
  html += "      html += '<button class=\"btn btn-success btn-sm\" onclick=\"assignTaskToEmployee(' + task.id + ')\">';\n";
  html += "      html += '<i class=\"fas fa-user-check\"></i> Assign';\n";
  html += "      html += '</button>';\n";
  html += "      html += '</td>';\n";
  html += "      html += '</tr>';\n";
  html += "    });\n";
  html += "    \n";
  html += "    html += '</tbody></table>';\n";
  html += "  }\n";
  html += "  \n";
  html += "  document.getElementById('unassignedTasksList').innerHTML = html;\n";
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
        
        attachAllTasksFilterListeners();  // ⬅️ ADD THIS ONE LINE!
        
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
      let dateStr = task.assigned_date || task.assignedDate || task.manualDate || 
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

// ═══════════════════════════════════════════════════════════════════════════
// MISSING FUNCTION: DISPLAY ALL TASKS
// ═══════════════════════════════════════════════════════════════════════════

html += "function displayAllTasks(tasks) {\n";
html += "  let html = '';\n";
html += "\n";
html += "  if (!tasks || tasks.length === 0) {\n";
html += "    html += '<div class=\"empty-state\">';\n";
html += "    html += '  <i class=\"fas fa-inbox\"></i>';\n";
html += "    html += '  <h3>No Tasks Found</h3>';\n";
html += "    html += '  <p>Start by creating a new task or uploading tasks in bulk.</p>';\n";
html += "    html += '</div>';\n";
html += "  } else {\n";
html += "    html += '<p style=\"color:#e5e7eb;font-weight:600;font-size:13px;margin-bottom:14px;\">';\n";
html += "    html += '  <i class=\"fas fa-info-circle\"></i> Found ' + tasks.length + ' tasks';\n";
html += "    html += '</p>';\n";
html += "\n";
html += "    html += '<table class=\"table\">';\n";
html += "    html += '  <thead><tr>';\n";
html += "    html += '    <th>Case ID</th>';\n";
html += "    html += '    <th>Client Name</th>';\n";
html += "    html += '    <th>Employee</th>';\n";
html += "    html += '    <th>Pincode</th>';\n";
html += "    html += '    <th>Map</th>';\n";
html += "    html += '    <th>Status</th>';\n";
html += "    html += '    <th>Date</th>';\n";
html += "    html += '    <th>Time Elapsed</th>';\n";
html += "    html += '    <th>Actions</th>';\n";
html += "    html += '  </tr></thead><tbody>';\n";
html += "\n";
html += "    tasks.forEach(function (task) {\n";
html += "      const statusClass = 'status-' + task.status.toLowerCase().replace(/[^a-z0-9]+/g, '-');\n";
html += "\n";
html += "      // --- FIX 1: ROBUST MAP CHECK ---\n";
html += "      const finalMapUrl = task.mapUrl || task.map_url || task.mapurl || null;\n";
html += "\n";
html += "      html += '<tr>';\n";
html += "      html += '<td data-label=\"Case ID\"><strong>' + escapeHtml(task.title) + '</strong></td>';\n";
html += "      html += '<td data-label=\"Client\">' + escapeHtml(task.clientName || '-') + '</td>';\n";
html += "      html += '<td data-label=\"Employee\">' + (task.assignedToName ? escapeHtml(task.assignedToName) : '<span style=\"color:#9ca3af;font-style:italic\">Unassigned</span>') + '</td>';\n";
html += "      html += '<td data-label=\"Pincode\"><span class=\"pincode-highlight\"><i class=\"fas fa-map-pin\"></i> ' + escapeHtml(task.pincode || 'NA') + '</span></td>';\n";
html += "\n";
html += "      html += '<td data-label=\"Map\">';\n";
html += "      html += (finalMapUrl ? '<a href=\"' + escapeHtml(finalMapUrl) + '\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color:#3b82f6;font-weight:600;margin-right:8px;\"><i class=\"fas fa-map-marker-alt\"></i> View Map</a>' : '<span style=\"color:#9ca3af;font-style:italic;margin-right:8px;\">No map</span>');\n";
html += "      html += '<button class=\"btn btn-secondary btn-sm\" style=\"padding:4px 8px;font-size:11px;\" title=\"Edit map link\" onclick=\"showEditMapModal(' + task.id + ')\"><i class=\"fas fa-pen\"></i></button>';\n";
html += "      html += '</td>';\n";
html += "\n";
html += "      html += '<td data-label=\"Status\"><span class=\"status-badge ' + statusClass + '\">' + escapeHtml(task.status) + '</span></td>';\n";
html += "\n";
html += "      const dateText = task.assigned_date || task.assignedDate || task.manualDate || (task.createdAt ? new Date(task.createdAt).toISOString().split('T')[0] : 'N/A');\n";
html += "      html += '<td data-label=\"Date\">' + escapeHtml(dateText) + '</td>';\n";
html += "\n";
html += "      // SLA Logic\n";
html += "      let slaStatus = 'N/A';\n";
html += "      let slaColor = '#6b7280';\n";
html += "      let startDateStr = task.assigned_date || task.assignedDate || task.created_at || task.createdAt;\n";
html += "      if (startDateStr && task.status === 'Pending') {\n";
html += "        const startTime = new Date(startDateStr).getTime();\n";
html += "        const nowTime = new Date().getTime();\n";
html += "        const hoursPassed = Math.floor((nowTime - startTime) / (1000 * 60 * 60));\n";
html += "        if (hoursPassed < 48) { slaStatus = hoursPassed + 'h passed'; slaColor = '#10b981'; }\n";
html += "        else if (hoursPassed < 72) { slaStatus = hoursPassed + 'h passed'; slaColor = '#f59e0b'; }\n";
html += "        else { slaStatus = hoursPassed + 'h passed (Overdue)'; slaColor = '#ef4444'; }\n";
html += "      } else if (task.status === 'Completed' || task.status === 'Verified') {\n";
html += "         slaStatus = 'Done'; slaColor = '#10b981';\n";
html += "      }\n";
html += "      html += '<td data-label=\"Time Elapsed\"><span style=\"color: ' + slaColor + '; font-weight: 600;\">' + escapeHtml(slaStatus) + '</span></td>';\n";
html += "\n";
html += "      html += '<td data-label=\"Actions\">';\n";
html += "      html += '  <div class=\"action-buttons\">';\n";
html += "      html += '    <button class=\"btn btn-warning btn-sm\" onclick=\"showReassignModal(' + task.id + ')\"><i class=\"fas fa-sync-alt\"></i></button>';\n";
html += "      html += '    <button class=\"btn btn-secondary btn-sm\" onclick=\"unassignTask(' + task.id + ')\"><i class=\"fas fa-times\"></i></button>';\n";
html += "      html += '    <button class=\"btn btn-danger btn-sm\" onclick=\"deleteTask(' + task.id + ')\"><i class=\"fas fa-trash\"></i></button>';\n";
html += "      html += '  </div>';\n";
html += "      html += '</td>';\n";
html += "      html += '</tr>';\n";
html += "    });\n";
html += "\n";
html += "    html += '  </tbody></table>';\n";
html += "  }\n";
html += "  const list = document.getElementById('allTasksList');\n";
html += "  if (list) list.innerHTML = html;\n";
html += "}\n";
  
// ═══════════════════════════════════════════════════════════════════════════
// ATTACH EVENT LISTENERS FOR ALL TASKS FILTERS
// ═══════════════════════════════════════════════════════════════════════════
function attachAllTasksFilterListeners() {
  // Status filter
  const statusEl = document.getElementById("allTasksStatusFilter");
  if (statusEl) {
    statusEl.addEventListener("change", function() {
      console.log("Status filter changed");
      loadAllTasks();
    });
  }

  // Employee filter
  const empEl = document.getElementById("allTasksEmployeeFilter");
  if (empEl) {
    empEl.addEventListener("change", function() {
      console.log("Employee filter changed");
      loadAllTasks();
    });
  }

  // Pincode filter
  const pinEl = document.getElementById("allTasksPincodeFilter");
  if (pinEl) {
    pinEl.addEventListener("input", function() {
      const val = this.value.trim();
      // Only trigger if 6 digits or empty
      if (val.length === 0 || val.length === 6) {
        console.log("Pincode filter changed:", val);
        loadAllTasks();
      }
    });
  }

  // Search box
  const searchEl = document.getElementById("allTasksSearch");
  if (searchEl) {
    searchEl.addEventListener("input", function() {
      console.log("Search changed:", this.value);
      loadAllTasks();
    });
    
    // Also handle Enter key
    searchEl.addEventListener("keypress", function(e) {
      if (e.key === "Enter") {
        loadAllTasks();
      }
    });
  }

  // Date filters
  const fromDateEl = document.getElementById("allTasksFromDate");
  const toDateEl = document.getElementById("allTasksToDate");
  
  if (fromDateEl) {
    fromDateEl.addEventListener("change", function() {
      console.log("From date changed");
      loadAllTasks();
    });
  }
  
  if (toDateEl) {
    toDateEl.addEventListener("change", function() {
      console.log("To date changed");
      loadAllTasks();
    });
  }

  // Reset button (if it exists in your HTML)
  const resetBtn = document.getElementById("allTasksResetFilter");
  if (resetBtn) {
    resetBtn.addEventListener("click", function() {
      console.log("Reset filters clicked");
      resetAllTaskFilters();
      loadAllTasks();
    });
  }

  console.log("✅ All Tasks filter listeners attached");
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
  html += "  let url = '/api/tasks?role=admin';\n";
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
  html += "    attachAllTasksFilterListeners();\n";
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
  "    let dateStr = task.assigned_date || task.assignedDate || (task.createdAt ? task.createdAt.toString() : null);\n";
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
    "          html += '<p><strong>Current Assignment:</strong> ' + (task.assignedToName ? escapeHtml(task.assignedToName) : 'Unassigned') + '</p>';\n";
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
  html += "  fetch('/api/users')\n";
  html += "    .then(function(res) { return res.json(); })\n";
  html += "    .then(function(users) {\n";
  html += "      allEmployees = users; // 🟢 Store globally\n";
  html += "      var container = document.getElementById('employeesList');\n";
  html += "      \n";
  html += "      if (users.length === 0) {\n";
  html += "        container.innerHTML = '<p>No employees found.</p>';\n";
  html += "        return;\n";
  html += "      }\n";
  html += "      \n";
  html += "      var html = '<table class=\"table\">';\n";
  html += "      html += '<thead><tr><th>Name</th><th>ID</th><th>Email</th><th>Phone</th><th>Status</th><th>Actions</th></tr></thead>';\n";
  html += "      html += '<tbody>';\n";
  html += "      \n";
  html += "      users.forEach(function(u) {\n";
  html += "        html += '<tr>';\n";
  html += "        html += '<td>' + escapeHtml(u.name) + '</td>';\n";
  html += "        html += '<td>' + escapeHtml(u.employeeId || '-') + '</td>';\n";
  html += "        html += '<td>' + escapeHtml(u.email) + '</td>';\n";
  html += "        html += '<td>' + escapeHtml(u.phone || '-') + '</td>';\n";
  html += "        html += '<td>' + (u.isActive ? '<span class=\"status-pill status-verified\">Active</span>' : '<span class=\"status-pill status-unassigned\">Inactive</span>') + '</td>';\n";
  html += "        html += '<td>';\n";
  html += "        \n";
  html += "        // 🟢 Edit Button\n";
  html += "        html += '<button class=\"btn btn-secondary btn-sm\" onclick=\"showEditEmployeeModal(' + u.id + ')\" style=\"margin-right:5px;\"><i class=\"fas fa-edit\"></i> Edit</button>';\n";
  html += "        \n";
  html += "        // Delete Button\n";
  html += "        html += '<button class=\"btn btn-danger btn-sm\" onclick=\"deleteEmployee(' + u.id + ')\"><i class=\"fas fa-trash\"></i></button>';\n";
  html += "        \n";
  html += "        html += '</td>';\n";
  html += "        html += '</tr>';\n";
  html += "      });\n";
  html += "      \n";
  html += "      html += '</tbody></table>';\n";
  html += "      container.innerHTML = html;\n";
  html += "    });\n";
  html += "}\n";
  html += "function showEditEmployeeModal(userId) {\n";
  html += "  var user = allEmployees.find(function(u) { return u.id === userId; });\n";
  html += "  if (!user) return;\n";
  html += "\n";
  html += "  var modal = document.createElement('div');\n";
  html += "  modal.className = 'modal show';\n";
  html += "  \n";
  html += "  var content = document.createElement('div');\n";
  html += "  content.className = 'modal-content';\n";
  html += "  \n";
  html += "  var h2 = document.createElement('h2');\n";
  html += "  h2.innerHTML = '<i class=\"fas fa-user-edit\"></i> Edit Employee';\n";
  html += "  content.appendChild(h2);\n";
  html += "  \n";
  html += "  // Form Generation Helper\n";
  html += "  function createInput(label, id, value, type = 'text', placeholder = '') {\n";
  html += "    var div = document.createElement('div'); div.className = 'form-group';\n";
  html += "    div.innerHTML = '<label>' + label + '</label><input type=\"' + type + '\" id=\"' + id + '\" value=\"' + (value || '') + '\" class=\"search-box\" style=\"width:100%\" placeholder=\"' + placeholder + '\">';\n";
  html += "    return div;\n";
  html += "  }\n";
  html += "  \n";
  html += "  content.appendChild(createInput('Full Name', 'editEmpName', user.name));\n";
  html += "  content.appendChild(createInput('Email', 'editEmpEmail', user.email, 'email'));\n";
  html += "  content.appendChild(createInput('Employee ID', 'editEmpId', user.employeeId));\n";
  html += "  content.appendChild(createInput('Phone', 'editEmpPhone', user.phone, 'tel'));\n";
  html += "  content.appendChild(createInput('New Password (Optional)', 'editEmpPass', '', 'password', 'Leave blank to keep current'));\n";
  html += "  \n";
  html += "  // Buttons\n";
  html += "  var btnRow = document.createElement('div');\n";
  html += "  btnRow.style.marginTop = '20px';\n";
  html += "  btnRow.style.display = 'flex';\n";
  html += "  btnRow.style.gap = '10px';\n";
  html += "  \n";
  html += "  var saveBtn = document.createElement('button');\n";
  html += "  saveBtn.className = 'btn btn-primary';\n";
  html += "  saveBtn.innerText = 'Save Changes';\n";
  html += "  saveBtn.onclick = function() { saveEmployeeUpdate(userId, modal); };\n";
  html += "  \n";
  html += "  var cancelBtn = document.createElement('button');\n";
  html += "  cancelBtn.className = 'btn btn-secondary';\n";
  html += "  cancelBtn.innerText = 'Cancel';\n";
  html += "  cancelBtn.onclick = function() { document.body.removeChild(modal); };\n";
  html += "  \n";
  html += "  btnRow.appendChild(saveBtn);\n";
  html += "  btnRow.appendChild(cancelBtn);\n";
  html += "  content.appendChild(btnRow);\n";
  html += "  \n";
  html += "  modal.appendChild(content);\n";
  html += "  document.body.appendChild(modal);\n";
  html += "}\n";

  html += "function saveEmployeeUpdate(userId, modal) {\n";
  html += "  var name = document.getElementById('editEmpName').value;\n";
  html += "  var email = document.getElementById('editEmpEmail').value;\n";
  html += "  var empId = document.getElementById('editEmpId').value;\n";
  html += "  var phone = document.getElementById('editEmpPhone').value;\n";
  html += "  var pass = document.getElementById('editEmpPass').value;\n";
  html += "  \n";
  html += "  fetch('/api/users/' + userId, {\n";
  html += "    method: 'PUT',\n";
  html += "    headers: { 'Content-Type': 'application/json' },\n";
  html += "    body: JSON.stringify({\n";
  html += "      name: name, email: email, employeeId: empId, phone: phone, password: pass,\n";
  html += "      adminId: currentUser.id, adminName: currentUser.name\n";
  html += "    })\n";
  html += "  })\n";
  html += "  .then(function(r) { return r.json(); })\n";
  html += "  .then(function(data) {\n";
  html += "    if (data.success) {\n";
  html += "      showToast('Employee updated successfully', 'success');\n";
  html += "      document.body.removeChild(modal);\n";
  html += "      showEmployees(); // Refresh list\n";
  html += "    } else {\n";
  html += "      showToast('Error: ' + data.message, 'error');\n";
  html += "    }\n";
  html += "  });\n";
  html += "}\n";
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
  html += "function deleteEmployeePrompt(employeeId, employeeName) {\n";
  html += "  const confirmDelete = confirm('⚠️ DELETE EMPLOYEE: ' + employeeName + '\\\\n\\\\nThis will permanently delete this employee.\\\\nClick OK to proceed with admin authentication.');\n";
  html += "  if (!confirmDelete) return;\n";
  html += "  const adminPassword = prompt('🔐 ADMIN AUTHENTICATION REQUIRED\\\\n\\\\nEnter admin password to delete employee:');\n";
  html += "  if (!adminPassword) { showToast('Delete cancelled', 'info'); return; }\n";
  html += "  fetch('/api/users/' + employeeId, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ adminPassword: adminPassword }) })\n";
  html += "  .then(function(res) { return res.json(); })\n";
  html += "  .then(function(data) {\n";
  html += "    if (data.success) { showToast('✅ Employee deleted: ' + employeeName, 'success'); showEmployees(); }\n";
  html += "    else { showToast('❌ ' + data.message, 'error'); }\n";
  html += "  })\n";
  html += "  .catch(function(err) { console.error('Delete error:', err); showToast('Failed to delete employee', 'error'); });\n";
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
  html += "      html += ' ';\n";
  html +=
    "      html += '<button class=\"btn btn-danger btn-sm\" onclick=\\'deleteEmployeePrompt(' + emp.id + ', ' + JSON.stringify(emp.name) + ')\\'><i class=\"fas fa-trash\"></i> Delete</button>';\n";
  html += "      html += '</td>';\n";
  html += "      html += '</tr>';\n";
  html += "    });\n";
  html += "    html += '</tbody></table>';\n";
  html += "  }\n";
  html += "  document.getElementById('employeesList').innerHTML = html;\n";
  html += "})\n";
  html += ".catch(function(err) {\n";
  html += "  console.error('Error loading employees:', err);\n";
  html += "  document.getElementById('employeesList').innerHTML = '<p>Error loading list.</p>';\n";
  html += "});\n";
  html += "}\n";
  
  // Password Reset Modal Function
  html += "\n";
  html += "function openResetPasswordModal(empId, empEmail) {\n";
  html += "  const modal = document.createElement('div');\n";
  html += "  modal.className = 'modal show';\n";
  html += "  modal.setAttribute('data-type', 'reset-password');\n";
  html += "  \n";
  html += "  let modalHtml = '<div class=\"modal-content\">';\n";
  html += "  modalHtml += '<h2><i class=\"fas fa-key\"></i> Reset Password</h2>';\n";
  html += "  modalHtml += '<p style=\"color: #9ca3af; margin-bottom: 16px;\">Reset password for: <strong>' + escapeHtml(empEmail) + '</strong></p>';\n";
  html += "  \n";
  html += "  modalHtml += '<div class=\"form-group\">';\n";
  html += "  modalHtml += '<label for=\"newPassword\"><i class=\"fas fa-lock\"></i> New Password (leave blank for auto-generate)</label>';\n";
  html += "  modalHtml += '<input type=\"text\" id=\"newPassword\" class=\"search-box\" placeholder=\"Auto-generate if empty\" style=\"width: 100%;\">';\n";
  html += "  modalHtml += '</div>';\n";
  html += "  \n";
  html += "  modalHtml += '<div style=\"display: flex; gap: 12px; margin-top: 20px;\">';\n";
  html += "  modalHtml += '<button class=\"btn btn-primary\" onclick=\"submitPasswordReset(' + empId + ')\"><i class=\"fas fa-check\"></i> Reset Password</button>';\n";
  html += "  modalHtml += '<button class=\"btn btn-secondary\" onclick=\"closeResetPasswordModal()\"><i class=\"fas fa-times\"></i> Cancel</button>';\n";
  html += "  modalHtml += '</div>';\n";
  html += "  modalHtml += '</div>';\n";
  html += "  \n";
  html += "  modal.innerHTML = modalHtml;\n";
  html += "  document.body.appendChild(modal);\n";
  html += "}\n";
  html += "\n";
  html += "function closeResetPasswordModal() {\n";
  html += "  const modal = document.querySelector('.modal[data-type=\"reset-password\"]');\n";
  html += "  if (modal) modal.remove();\n";
  html += "}\n";
  html += "\n";
  html += "function submitPasswordReset(empId) {\n";
  html += "  const newPassword = document.getElementById('newPassword').value.trim();\n";
  html += "  const btn = event.target;\n";
  html += "  btn.disabled = true;\n";
  html += "  btn.innerHTML = '<i class=\"fas fa-spinner fa-spin\"></i> Resetting...';\n";
  html += "  \n";
  html += "  fetch('/api/users/' + empId + '/reset-password', {\n";
  html += "    method: 'POST',\n";
  html += "    headers: { 'Content-Type': 'application/json' },\n";
  html += "    body: JSON.stringify({\n";
  html += "      adminId: currentUser.id,\n";
  html += "      adminName: currentUser.name,\n";
  html += "      newPassword: newPassword || null\n";
  html += "    })\n";
  html += "  })\n";
  html += "  .then(function(res) { return res.json(); })\n";
  html += "  .then(function(data) {\n";
  html += "    if (data.success) {\n";
  html += "      showToast('Password reset! New password: ' + data.tempPassword, 'success');\n";
  html += "      closeResetPasswordModal();\n";
  html += "      \n";
  html += "      // Show password in alert for admin to share with employee\n";
  html += "      alert('✅ Password Reset Successful!\\n\\nNew temporary password:\\n' + data.tempPassword + '\\n\\nPlease share this with the employee securely.');\n";
  html += "    } else {\n";
  html += "      showToast('Failed: ' + data.message, 'error');\n";
  html += "      btn.disabled = false;\n";
  html += "      btn.innerHTML = '<i class=\"fas fa-check\"></i> Reset Password';\n";
  html += "    }\n";
  html += "  })\n";
  html += "  .catch(function(err) {\n";
  html += "    console.error(err);\n";
  html += "    showToast('Connection error', 'error');\n";
  html += "    btn.disabled = false;\n";
  html += "    btn.innerHTML = '<i class=\"fas fa-check\"></i> Reset Password';\n";
  html += "  });\n";
  html += "}\n";
  html += "\n";
  html += "          html += '</tr>';\n";
  html += "        });\n";
  html += "        \n";
  html += "        html += '</tbody></table>';\n";
  html += "      }\n";
  html += "      \n";
  html += "      document.getElementById('employeesList').innerHTML = html;\n";
  html += "    })\n";
  html += "    .catch(function(err) {\n";
  html += "      console.error('Error loading employees:', err);\n";
  html +=
    "      document.getElementById('employeesList').innerHTML = '<div class=\"empty-state\"><i class=\"fas fa-exclamation-triangle\"></i><h3>Error Loading Employees</h3><p>Please try again.</p></div>';\n";
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
  html += "  // Read values from the 'All Tasks' filter bar\n";
  html += "  const statusEl = document.getElementById('allTasksStatusFilter');\n";
  html += "  const empEl = document.getElementById('allTasksEmployeeFilter');\n";
  html += "  const pinEl = document.getElementById('allTasksPincodeFilter');\n";
  html += "  const searchEl = document.getElementById('allTasksSearch');\n";
  html += "  const fromEl = document.getElementById('allTasksFromDate');\n";
  html += "  const toEl = document.getElementById('allTasksToDate');\n";
  html += "\n";
  html += "  const params = new URLSearchParams();\n";
  html += "\n";
  html += "  if (statusEl && statusEl.value !== 'all') params.append('status', statusEl.value);\n";
  html += "  if (empEl && empEl.value !== 'all') params.append('employeeId', empEl.value);\n";
  html += "  if (pinEl && pinEl.value.trim()) params.append('pincode', pinEl.value.trim());\n";
  html += "  if (searchEl && searchEl.value.trim()) params.append('search', searchEl.value.trim());\n";
  html += "  if (fromEl && fromEl.value) params.append('startDate', fromEl.value);\n";
  html += "  if (toEl && toEl.value) params.append('endDate', toEl.value);\n";
  html += "\n";
  html += "  showToast('Preparing export with current filters...', 'info');\n";
  html += "  window.location.href = '/api/export?' + params.toString();\n";
  html += "\n";
  html += "  setTimeout(function() {\n";
  html += "    showToast('Download started!', 'success');\n";
  html += "  }, 2000);\n";
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
  html += "function openTaskPanel(task) {\n";
  html += "  var panel = document.getElementById('taskDetailsPanel');\n";
  html += "  var overlay = document.getElementById('panelOverlay');\n";
  html += "  var content = document.getElementById('panelContent');\n";
  html += "  \n";
  html += "  // Safe map URL check\n";
  html += "  var mapLink = task.mapurl || task.map_url || task.mapUrl || '';\n";
  html += "  \n";
  html += "  var html = '';\n";
  html += "  html += '<h2 style=\"margin-top:0; font-size:18px; color:#111827\">' + escapeHtml(task.title) + '</h2>';\n";
  html += "  html += '<p style=\"color:#6b7280; font-size:13px; margin-bottom:15px\">' + escapeHtml(task.clientName || 'Unknown Client') + '</p>';\n";
  html += "  \n";
  html += "  html += '<div style=\"display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px\">';\n";
  html += "  html += '  <div style=\"background:#f3f4f6; padding:12px; border-radius:12px\"><strong>Pincode</strong><br>' + escapeHtml(task.pincode) + '</div>';\n";
  html += "  html += '  <div style=\"background:#f3f4f6; padding:12px; border-radius:12px\"><strong>Status</strong><br>' + escapeHtml(task.status) + '</div>';\n";
  html += "  html += '</div>';\n";
  html += "  \n";
  html += "  if (mapLink) {\n";
  html += "    html += '<a href=\"' + mapLink + '\" target=\"_blank\" class=\"btn btn-primary\" style=\"display:flex; width:100%; justify-content:center; padding:14px; margin-bottom:12px; font-size:14px\"><i class=\"fas fa-location-arrow\"></i> Navigate to Location</a>';\n";
  html += "  }\n";
  html += "  \n";
  html += "  html += '<div style=\"background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:15px; margin-top:15px\">';\n";
  html += "  html += '  <label style=\"font-size:12px; color:#6b7280; display:block; margin-bottom:8px\">UPDATE STATUS</label>';\n";
  html += "  html += '  <div style=\"display:flex; gap:10px\">';\n";
  html += "  html += '    <select id=\"panel-status-' + task.id + '\" style=\"flex:1; padding:10px; border-radius:8px; border:1px solid #d1d5db\">';\n";
  html += "  html += '      <option value=\"Pending\">Pending</option>';\n";
  html += "  html += '      <option value=\"Completed\">Completed</option>';\n";
  html += "  html += '      <option value=\"Verified\">Verified</option>';\n";
  html += "  html += '      <option value=\"Left Job\">Left Job</option>';\n";
  html += "  html += '      <option value=\"Not Picking\">Not Picking</option>';\n";
  html += "  html += '    </select>';\n";
  html += "  html += '    <button class=\"btn btn-primary\" onclick=\"updateTaskStatus(' + task.id + ', true)\">Update</button>';\n";
  html += "  html += '  </div>';\n";
  html += "  html += '</div>';\n";
  html += "  \n";
  html += "  content.innerHTML = html;\n";
  html += "  \n";
  html += "  // Set current status in dropdown\n";
  html += "  setTimeout(function() { document.getElementById('panel-status-' + task.id).value = task.status; }, 50);\n";
  html += "  \n";
  html += "  panel.classList.add('active');\n";
  html += "  overlay.classList.add('active');\n";
  html += "}\n";
  html += "\n";
  html += "function closeTaskPanel() {\n";
  html += "  document.getElementById('taskDetailsPanel').classList.remove('active');\n";
  html += "  document.getElementById('panelOverlay').classList.remove('active');\n";
  html += "}\n";
  html += "function loadTodayTasks(searchTerm) {\n";
  html += "  // --- FIX 2: PRIVACY FIX ---\n";
  html += "  // Changed userId= to employeeId= so backend filters correctly\n";
  html += "  const url = '/api/tasks?role=employee&status=Pending&employeeId=' + currentUser.id + (searchTerm ? '&search=' + encodeURIComponent(searchTerm) : '');\n";
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
  html += "      document.getElementById('todayTasksList').innerHTML = '<div class=\"empty-state\"><i class=\"fas fa-exclamation-triangle\"></i><h3>Error Loading Tasks</h3><p>Please try again.</p></div>';\n";
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
  html += "      const statusClass = 'status-' + task.status.toLowerCase().replace(/ /g, '-');\n";
  html += "      \n";
  html += "      // 🟢 COMPACT CARD (Click to Open Panel)\n";
  html += "      html += '<div class=\"task-card\" onclick=\\'openTaskPanel(' + JSON.stringify(task).replace(/'/g, \"&apos;\") + ')\\'>';\n";
  html += "      html += '  <div style=\"display:flex; justify-content:space-between; align-items:center;\">';\n";
  html += "      html += '    <h3 style=\"margin:0; font-size:15px; color:#e5e7eb;\"><i class=\"fas fa-clipboard-list\" style=\"color:#818cf8\"></i> ' + escapeHtml(task.title) + '</h3>';\n";
  html += "      html += '    <span class=\"status-badge ' + statusClass + '\" style=\"font-size:10px\">' + escapeHtml(task.status) + '</span>';\n";
  html += "      html += '  </div>';\n";
  html += "      html += '  <div style=\"margin-top:8px; display:flex; justify-content:space-between; align-items:center; color:#9ca3af; font-size:12px;\">';\n";
  html += "      html += '    <span><i class=\"fas fa-map-pin\"></i> ' + escapeHtml(task.pincode || 'N/A') + '</span>';\n";
  html += "      html += '    <div style=\"display:flex; gap:10px; align-items:center;\">';\n";
  html += "      if (task.mapurl || task.map_url || task.mapUrl) {\n";
  html += "         // Stop propagation prevents the panel from opening when clicking the map icon\n";
  html += "         html += ' <a href=\"' + (task.mapurl || task.map_url || task.mapUrl) + '\" target=\"_blank\" onclick=\"event.stopPropagation()\" style=\"color:#38bdf8; font-size:16px;\"><i class=\"fas fa-location-arrow\"></i></a>';\n";
  html += "      }\n";
  html += "      html += '    <span style=\"color:#60a5fa\">Tap for details <i class=\"fas fa-chevron-right\" style=\"font-size:10px\"></i></span>';\n";    
  html += "      html += '    </div>';\n";
  html += "      html += '  </div>';\n";
  html += "      html += '</div>';\n";
  html += "    });\n";
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
  html += "function updateTaskStatus(taskId, fromPanel) {\n";
  html += "  // 🟢 FIX: Check which dropdown to read from (Panel vs List)\n";
  html += "  var selectId = fromPanel ? 'panel-status-' + taskId : 'status-' + taskId;\n";
  html += "  var selectEl = document.getElementById(selectId);\n";
  html += "  \n";
  html += "  if (!selectEl) {\n";
  html += "    showToast('Error: Status dropdown not found', 'error');\n";
  html += "    return;\n";
  html += "  }\n";
  html += "  \n";
  html += "  const newStatus = selectEl.value;\n";
  html += "  const btn = selectEl.nextElementSibling;\n"; // The button next to the select
  html += "  \n";
  html += "  // FEATURE 1 PATCH: Prompt confirmation before status update\n";
  html += "  if (newStatus === 'Pending') {\n";
  html += "    if (!confirm('Task status is still Pending! Please select the correct status when your work is done. Continue anyway?')) {\n";
  html += "      return;\n";
  html += "    }\n";
  html += "  } else {\n";
  html += "    if (!confirm('Are you sure you want to change status to \"' + newStatus + '\"?')) {\n";
  html += "      return;\n";
  html += "    }\n";
  html += "  }\n";
  html += "  \n";
  html += "  if(btn) {\n";
  html += "    btn.disabled = true;\n";
  html += "    btn.innerHTML = '<i class=\"fas fa-spinner fa-spin\"></i> Updating...';\n";
  html += "  }\n";
  html += "  \n";
  html += "  // 📍 Get GPS location if completing task\n";
  html += "  if (newStatus === 'Completed' && navigator.geolocation) {\n";
  html += "    navigator.geolocation.getCurrentPosition(function(position) {\n";
  html += "      sendTaskUpdate(taskId, {\n";
  html += "        status: newStatus,\n";
  html += "        userId: currentUser.id,\n";
  html += "        userName: currentUser.name,\n";
  html += "        completedLat: position.coords.latitude,\n";
  html += "        completedLng: position.coords.longitude\n";
  html += "      }, btn, fromPanel);\n";
  html += "    }, function(error) {\n";
  html += "      console.warn('📍 Location unavailable:', error.message);\n";
  html += "      sendTaskUpdate(taskId, { status: newStatus, userId: currentUser.id, userName: currentUser.name }, btn, fromPanel);\n";
  html += "    }, { enableHighAccuracy: true, timeout: 5000 });\n";
  html += "  } else {\n";
  html += "    sendTaskUpdate(taskId, { status: newStatus, userId: currentUser.id, userName: currentUser.name }, btn, fromPanel);\n";
  html += "  }\n";
  html += "}\n";
  html += "\n";
  html += "function sendTaskUpdate(taskId, updateData, btn, fromPanel) {\n";
  html += "  fetch('/api/tasks/' + taskId + '/status', {\n";
  html += "    method: 'PUT',\n";
  html += "    headers: { 'Content-Type': 'application/json' },\n";
  html += "    body: JSON.stringify(updateData)\n";
  html += "  })\n";
  html += "  .then(function(res) { return res.json(); })\n";
  html += "  .then(function(data) {\n";
  html += "    if (data.success) {\n";
  html += "      showToast('Status updated to ' + newStatus, 'success');\n";
  html += "      if (fromPanel) closeTaskPanel();\n";
  html += "      loadTodayTasks();\n";
  html += "    } else {\n";
  html += "      showToast('Error updating status', 'error');\n";
  html += "      if(btn) {\n";
  html += "        btn.disabled = false;\n";
  html += "        btn.innerHTML = '<i class=\"fas fa-save\"></i> Update';\n";
  html += "      }\n";
  html += "    }\n";
  html += "  })\n";
  html += "  .catch(function(err) {\n";
  html += "    console.error('Error updating status:', err);\n";
  html += "    showToast('Connection error', 'error');\n";
  html += "    if(btn) {\n";
  html += "      btn.disabled = false;\n";
  html += "      btn.innerHTML = '<i class=\"fas fa-save\"></i> Update';\n";
  html += "    }\n";
  html += "  });\n";
  html += "}\n";
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
  html += "  // --- FIX 3: HISTORY LOGIC ---\n";
  html += "  // 1. Use employeeId for security\n";
  html += "  // 2. Fetch all tasks for this employee, then filter in JS\n";
  html += "  const url = '/api/tasks?role=employee&employeeId=' + currentUser.id + (searchTerm ? '&search=' + encodeURIComponent(searchTerm) : '');\n";
  html += "  \n";
  html += "  fetch(url)\n";
  html += "    .then(function(res) { return res.json(); })\n";
  html += "    .then(function(tasks) {\n";
  html += "      // Only show Completed or Verified tasks in history\n";
  html += "      const historyTasks = tasks.filter(function(t) {\n";
  html += "        return t.status === 'Completed' || t.status === 'Verified';\n";
  html += "      });\n";
  html += "      \n";
  html += "      allHistoryTasks = historyTasks;\n";
  html += "      displayHistoryTasks(historyTasks);\n";
  html += "    })\n";
  html += "    .catch(function(err) {\n";
  html += "      console.error('Error loading history:', err);\n";
  html += "      document.getElementById('historyTasksList').innerHTML = '<div class=\"empty-state\"><i class=\"fas fa-exclamation-triangle\"></i><h3>Error Loading History</h3><p>Please try again.</p></div>';\n";
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
    "      html += '<td>' + escapeHtml(task.assigned_date || task.assignedDate || task.manualDate || 'N/A') + '</td>';\n";
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
  html += "\n";
  html += "// 🔌 Service Worker Registration for Offline Support\n";
  html += "if ('serviceWorker' in navigator) {\n";
  html += "  window.addEventListener('load', function() {\n";
  html += "    navigator.serviceWorker.register('/sw.js')\n";
  html += "      .then(function(reg) { console.log('✅ Service Worker registered'); })\n";
  html += "      .catch(function(err) { console.warn('⚠️ SW registration failed:', err); });\n";
  html += "  });\n";
  html += "}\n";
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
    app.listen(PORT, HOST, () => {
  console.log("");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("✅ SERVER RUNNING SUCCESSFULLY");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`🌐 URL: http://${HOST}:${PORT}`);
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
