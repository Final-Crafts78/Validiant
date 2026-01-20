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

// ... (truncated in this commit tool payload for brevity)
