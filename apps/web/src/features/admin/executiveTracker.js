/**
 * Admin Executive Live Tracker
 */
import { cleanupMapInstance } from '../routing/leafletEngine';
import { showToast } from '../../utils/ui';

let trackerMap = null;
let markerLayer = null;
let refreshInterval = null;
const REFRESH_RATE = 30000; // 30 seconds

export async function showExecutiveTracker() {
  const container = document.getElementById('mainContainer');
  
  // Cleanup any existing views
  cleanupMapInstance();
  stopAutoRefresh();

  // Inject Styles for Premium Pins
  if (!document.getElementById('trackerStyles')) {
    const style = document.createElement('style');
    style.id = 'trackerStyles';
    style.innerHTML = `
      .tracker-pin-container {
        background: transparent !important;
        border: none !important;
      }
      .tracker-pin {
        position: relative;
        width: 38px;
        height: 38px;
        background: #1e293b;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid rgba(255,255,255,0.8);
        box-shadow: 0 4px 15px rgba(0,0,0,0.4);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
      }
      .tracker-pin:hover {
        transform: rotate(-45deg) scale(1.1);
        z-index: 1000 !important;
      }
      .tracker-pin-inner {
        transform: rotate(45deg);
        color: white;
        font-size: 16px;
        text-shadow: 0 1px 2px rgba(0,0,0,0.2);
      }
      .tracker-status-online { 
        background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
        border-color: #d1fae5;
      }
      .tracker-status-idle { 
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); 
        border-color: #fef3c7;
      }
      .tracker-status-offline { 
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); 
        border-color: #fee2e2;
      }
      
      .pulse-ring {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: #10b981;
        opacity: 0.6;
        animation: pin-pulse 2s infinite;
        z-index: -1;
      }
      
      @keyframes pin-pulse {
        0% { transform: scale(1); opacity: 0.6; }
        100% { transform: scale(2.8); opacity: 0; }
      }

      .tracker-popup .leaflet-popup-content-wrapper {
        background: #0f172a;
        color: #f8fafc;
        border-radius: 12px;
        padding: 0;
        overflow: hidden;
        border: 1px solid #334155;
      }
      .tracker-popup .leaflet-popup-tip {
        background: #0f172a;
      }
    `;
    document.head.appendChild(style);
  }

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:20px;">
      <h2><i class="fas fa-satellite-dish"></i> Executive Live Tracker</h2>
      <div style="display:flex; gap:10px; align-items:center;">
        <div id="trackerStats" style="display:flex; gap:15px; font-size:13px; font-weight:600;">
          <span style="color:#10b981;"><i class="fas fa-circle"></i> Online: <span id="onlineCount">0</span></span>
          <span style="color:#f59e0b;"><i class="fas fa-circle"></i> Idle: <span id="idleCount">0</span></span>
          <span style="color:#ef4444;"><i class="fas fa-circle"></i> Offline: <span id="offlineCount">0</span></span>
          <span style="color:#3b82f6; margin-left:10px;"><i class="fas fa-map-marker-alt"></i> Pending Tasks</span>
        </div>
        <button class="btn btn-secondary btn-sm" id="refreshTrackerBtn" data-action="tracker:refresh">
          <i class="fas fa-sync"></i> Refresh Now
        </button>
      </div>
    </div>

    <div id="trackerMap" style="width: 100%; height: 75vh; border-radius: 16px; border: 1px solid #334155; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <div id="trackerMapLoading" style="position:absolute; inset:0; background:rgba(15,23,42,0.8); z-index:1000; display:flex; flex-direction:column; align-items:center; justify-content:center; border-radius:16px; backdrop-filter: blur(4px);">
        <i class="fas fa-satellite fa-spin" style="font-size:2.5rem; color:#6366f1; margin-bottom:15px;"></i>
        <p style="font-weight: 500; color: #94a3b8;">Establishing satellite uplink...</p>
      </div>
    </div>
  `;

  // Initialize Map
  await initTrackerMap();
  
  // Start Refresh Cycle
  startAutoRefresh();
}

async function initTrackerMap() {
  // 1. Ensure Leaflet is loaded (shared logic with leafletEngine)
  if (!window.L) {
    await new Promise(resolve => {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = resolve;
      document.head.appendChild(script);
    });
  }

  trackerMap = L.map('trackerMap', {
    zoomControl: true,
    attributionControl: false
  }).setView([20.5937, 78.9629], 5); // Center of India
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap', maxZoom: 19
  }).addTo(trackerMap);

  markerLayer = L.layerGroup().addTo(trackerMap);

  await updateTrackerData();
  
  document.getElementById('trackerMapLoading').style.display = 'none';
  
  // Invalidate size to fix rendering issues
  setTimeout(() => trackerMap.invalidateSize(), 300);
}

export async function updateTrackerData() {
  if (!trackerMap) return;

  try {
    const [execResponse, taskResponse] = await Promise.all([
      fetch('/api/users/locations'),
      fetch('/api/tasks')
    ]);
    const executives = await execResponse.json();
    
    let tasks = [];
    if (taskResponse.ok) {
      const allTasks = await taskResponse.json();
      tasks = allTasks.filter(t => {
        const isCompleted = t.status === 'Completed' || t.status === 'Verified';
        const isUnassignedStatus = t.status === 'Unassigned';
        const hasNoAssignee = !t.assigned_to || t.assigned_to === 'Unassigned';
        const hasNoAssigneeName = !t.assigned_to_name || t.assigned_to_name === 'Unassigned';
        
        return !isCompleted && !isUnassignedStatus && !hasNoAssignee && !hasNoAssigneeName;
      });
    }
    
    console.log(`📍 Executive Pin Logic: Processing ${executives.length} executives and ${tasks.length} pending tasks`);
    
    markerLayer.clearLayers();
    
    let online = 0, idle = 0, offline = 0;
    const now = new Date();
    const bounds = [];

    // 1. PLOT PENDING TASKS
    const { resolveTaskCoordinates } = await import('../employee/sorting');
    tasks.forEach((t, index) => {
      const { lat, lng, source } = resolveTaskCoordinates(t);
      if (lat != null && lng != null) {
        bounds.push([lat, lng]);
        const isApprox = source === 'pincode-fallback' || source === '@-viewport';
        const pinColor = isApprox ? '#f59e0b' : '#3b82f6'; // Blue or Orange
        const taskIcon = L.divIcon({
          className: 'tracker-task-pin',
          html: `<div style="background-color: ${pinColor}; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.5); font-size:10px;">${index + 1}</div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        L.marker([lat, lng], {
          icon: taskIcon,
          title: `Task: ${t.title || t.case_id || 'Unknown'}`,
          riseOnHover: true
        }).bindPopup(`
          <div style="font-family:'Inter',sans-serif; padding:5px;">
            <b style="color:#2563eb;">${t.title || t.case_id || 'Task'}</b><br>
            <span style="font-size:12px; color:#64748b;">Status: ${t.status || 'Pending'}</span><br>
            <span style="font-size:12px; color:#64748b;">Assigned To: ${t.assigned_to_name || 'Unassigned'}</span>
          </div>
        `).addTo(markerLayer);
      }
    });

    // 2. PLOT EXECUTIVES
    executives.forEach(exec => {
      // Allow raw string parsing, handle cases where lat/lng properties might be differently named
      const latRaw = exec.latitude !== undefined && exec.latitude !== null ? exec.latitude : exec.lat;
      const lngRaw = exec.longitude !== undefined && exec.longitude !== null ? exec.longitude : exec.lng;
      const lat = parseFloat(latRaw);
      const lng = parseFloat(lngRaw);
      
      const lastActive = exec.lastActive ? new Date(exec.lastActive) : null;
      
      // Calculate status even if no coordinates
      let statusClass = 'tracker-status-offline';
      let isOnline = false;
      let diffMinutes = 9999;

      if (lastActive && !isNaN(lastActive.getTime())) {
        diffMinutes = Math.max(0, (now - lastActive) / (1000 * 60));
        
        if (diffMinutes < 10) {
          statusClass = 'tracker-status-online';
          online++;
          isOnline = true;
        } else if (diffMinutes < 60) {
          statusClass = 'tracker-status-idle';
          idle++;
        } else {
          offline++;
        }
      } else {
        offline++;
      }

      // Only add to map if we have valid coordinates
      if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
        return;
      }

      const icon = L.divIcon({
        className: 'tracker-pin-container',
        html: `
          <div class="tracker-pin ${statusClass}">
            <div class="tracker-pin-inner">
               <i class="fas fa-user-tie"></i>
            </div>
            ${isOnline ? '<div class="pulse-ring"></div>' : ''}
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -38]
      });

      const lastSeenText = diffMinutes < 1 ? 'Just now' : diffMinutes > 1440 ? 'Over a day ago' : `${Math.floor(diffMinutes)} mins ago`;

      const popupContent = `
        <div style="padding:12px; min-width:220px; font-family: 'Inter', sans-serif;">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px; border-bottom:1px solid #334155; padding-bottom:10px;">
            <div style="width:40px; height:40px; border-radius:10px; background:#1e293b; display:flex; align-items:center; justify-content:center; border:1px solid #475569;">
              <i class="fas fa-user-tie" style="color:#6366f1; font-size:20px;"></i>
            </div>
            <div>
              <div style="font-weight:700; font-size:15px; color:#f8fafc;">${exec.name}</div>
              <div style="font-size:11px; color:#94a3b8; font-weight:500;">${exec.employeeId || 'N/A'}</div>
            </div>
          </div>
          
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">
            <div style="background:rgba(255,255,255,0.05); padding:8px; border-radius:8px; text-align:center; border:1px solid rgba(255,255,255,0.05);">
              <div style="font-size:10px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:2px;">Last Seen</div>
              <div style="font-size:12px; color:#f1f5f9; font-weight:600;">${lastSeenText}</div>
            </div>
            <div style="background:rgba(255,255,255,0.05); padding:8px; border-radius:8px; text-align:center; border:1px solid rgba(255,255,255,0.05);">
              <div style="font-size:10px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:2px;">Active Tasks</div>
              <div style="font-size:12px; color:#6366f1; font-weight:700;">${exec.activeTasks || 0}</div>
            </div>
          </div>

          <button class="btn btn-primary btn-sm" style="width:100%; height:32px; font-size:12px; font-weight:600; border-radius:8px; display:flex; align-items:center; justify-content:center; gap:8px;" onclick="window.location.hash='#employees';">
            <i class="fas fa-external-link-alt"></i> View Profile
          </button>
        </div>
      `;

      L.marker([lat, lng], { 
        icon,
        title: exec.name,
        riseOnHover: true
      }).bindPopup(popupContent, {
        className: 'tracker-popup',
        maxWidth: 300
      }).addTo(markerLayer);
      
      bounds.push([lat, lng]);
    });

    // Update Counts
    document.getElementById('onlineCount').textContent = online;
    document.getElementById('idleCount').textContent = idle;
    document.getElementById('offlineCount').textContent = offline;

    // Center map if we have data and it's the first load or zoom is too high/low
    if (bounds.length > 0) {
      const currentZoom = trackerMap.getZoom();
      if (currentZoom <= 5 || currentZoom > 15) {
        trackerMap.fitBounds(bounds, { padding: [100, 100], maxZoom: 14 });
      }
    }

  } catch (err) {
    console.error('Tracker Data Fetch Error:', err);
    showToast('Failed to refresh executive locations', 'error');
  }
}

function startAutoRefresh() {
  stopAutoRefresh();
  refreshInterval = setInterval(updateTrackerData, REFRESH_RATE);
}

export function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

/**
 * Export a cleanup function for main.js
 */
export function cleanupTracker() {
  stopAutoRefresh();
  if (trackerMap) {
    trackerMap.off();
    trackerMap.remove();
    trackerMap = null;
    markerLayer = null;
  }
}
