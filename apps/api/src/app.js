const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

// Routes
const authRoutes = require("./routes/auth.routes");
const taskRoutes = require("./routes/task.routes");
const userRoutes = require("./routes/user.routes");
const adminRoutes = require("./routes/admin.routes");

const compression = require('compression');
const app = express();

// Middlewares
app.use(cors());
app.use(compression());
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

// Configuration routes
app.get("/api/config/maps-key", (req, res) => {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return res.status(503).json({ success: false, message: "Maps API key not configured" });
  res.json({ success: true, key });
});

// ORS Directions API Proxy — returns road-following route geometry for ALL waypoints
// Keeps ORS_API_KEY server-side, splits into segments if >50 coordinates
app.post("/api/routes/directions", async (req, res) => {
  try {
    const { coordinates } = req.body; // [[lng, lat], [lng, lat], ...]
    if (!coordinates || coordinates.length < 2) {
      return res.status(400).json({ success: false, message: "At least 2 coordinates required" });
    }

    const orsKey = process.env.ORS_API_KEY;
    if (!orsKey) {
      return res.status(503).json({ success: false, message: "ORS API key not configured" });
    }

    const MAX_ORS_COORDS = 50; // ORS free tier limit per request
    
    if (coordinates.length <= MAX_ORS_COORDS) {
      // Single request — all coordinates fit in one call
      const orsRes = await fetch("https://api.openrouteservice.org/v2/directions/driving-car/geojson", {
        method: "POST",
        headers: {
          "Authorization": orsKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ coordinates })
      });
      
      const data = await orsRes.json();
      if (!orsRes.ok) {
        console.error("ORS Directions error:", data);
        return res.status(orsRes.status).json({ success: false, message: data.error?.message || "ORS API error" });
      }

      const feature = data.features[0];
      const geojsonCoords = feature.geometry.coordinates; // [[lng, lat], ...]
      const summary = feature.properties.summary;

      return res.json({
        success: true,
        coordinates: geojsonCoords,
        distance: summary.distance, // meters
        duration: summary.duration  // seconds
      });
    }

    // Multi-segment: split into chunks of MAX_ORS_COORDS with 1-point overlap to stitch
    console.log(`📍 [ORS] Splitting ${coordinates.length} coordinates into segments of ${MAX_ORS_COORDS}`);
    const allCoords = [];
    let totalDistance = 0;
    let totalDuration = 0;

    for (let i = 0; i < coordinates.length; i += MAX_ORS_COORDS - 1) {
      const segment = coordinates.slice(i, i + MAX_ORS_COORDS);
      if (segment.length < 2) break;

      const orsRes = await fetch("https://api.openrouteservice.org/v2/directions/driving-car/geojson", {
        method: "POST",
        headers: {
          "Authorization": orsKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ coordinates: segment })
      });

      const data = await orsRes.json();
      if (!orsRes.ok) {
        console.error(`ORS Directions segment error:`, data);
        return res.status(orsRes.status).json({ success: false, message: data.error?.message || "ORS segment error" });
      }

      const feature = data.features[0];
      const segCoords = feature.geometry.coordinates;
      const summary = feature.properties.summary;

      // Skip first point of subsequent segments (it's the overlap point)
      if (allCoords.length > 0) {
        allCoords.push(...segCoords.slice(1));
      } else {
        allCoords.push(...segCoords);
      }
      totalDistance += summary.distance;
      totalDuration += summary.duration;
    }

    return res.json({
      success: true,
      coordinates: allCoords,
      distance: totalDistance,
      duration: totalDuration
    });

  } catch (err) {
    console.error("ORS Directions proxy error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Feature routes
app.use("/api", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use("/api", adminRoutes);
const settingsRoutes = require("./routes/settings.routes");
app.use("/api/settings", settingsRoutes);

// Static file serving for Frontend (Production)
app.use(express.static(webDistPath, {
  maxAge: '1d',
  etag: true,
  immutable: false
}));

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
