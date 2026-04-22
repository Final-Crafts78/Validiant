const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

// Routes
const authRoutes = require("./routes/auth.routes");
const taskRoutes = require("./routes/task.routes");
const userRoutes = require("./routes/user.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Diagnostic log for static paths
const webDistPath = path.resolve(__dirname, "../../web/dist");
console.log(`📂 [STATIC] Serving frontend from: ${webDistPath}`);
const fs = require('fs');
if (!fs.existsSync(webDistPath)) {
  console.error(`❌ [STATIC] CRITICAL: Static directory not found at ${webDistPath}`);
} else if (!fs.existsSync(path.join(webDistPath, 'index.html'))) {
  console.error(`❌ [STATIC] CRITICAL: index.html not found in ${webDistPath}`);
} else {
  console.log(`✅ [STATIC] index.html found at ${path.join(webDistPath, 'index.html')}`);
}

// Generic routes
app.get("/health", (req, res) => res.json({ status: "healthy", uptime: process.uptime() }));
app.get("/test", (req, res) => res.send("OK"));

// Feature routes
app.use("/api", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use("/api", adminRoutes);

// Static file serving for Frontend (Production)
app.use(express.static(webDistPath));

// Fallback to index.html for unknown routes (SPA support)
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(webDistPath, "index.html"), (err) => {
    if (err) {
      console.error(`❌ [FALLBACK] Failed to send index.html: ${err.message}`);
      next();
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

module.exports = app;
