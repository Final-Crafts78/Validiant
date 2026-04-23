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

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:20px;">
      <h2><i class="fas fa-satellite-dish"></i> Executive Live Tracker</h2>
      <div style="display:flex; gap:10px; align-items:center;">
        <div id="trackerStats" style="display:flex; gap:15px; font-size:13px; font-weight:600;">
          <span style="color:#10b981;"><i class="fas fa-circle"></i> Online: <span id="onlineCount">0</span></span>
          <span style="color:#f59e0b;"><i class="fas fa-circle"></i> Idle: <span id="idleCount">0</span></span>
          <span style="color:#ef4444;"><i class="fas fa-circle"></i> Offline: <span id="offlineCount">0</span></span>
        </div>
        <button class="btn btn-secondary btn-sm" id="refreshTrackerBtn" data-action="tracker:refresh">
          <i class="fas fa-sync"></i> Refresh Now
        </button>
      </div>
    </div>

    <div id="trackerMap" style="width: 100%; height: 70vh; border-radius: 12px; border: 1px solid #334155; position: relative;">
      <div id="trackerMapLoading" style="position:absolute; inset:0; background:rgba(15,23,42,0.8); z-index:1000; display:flex; flex-direction:column; align-items:center; justify-content:center; border-radius:12px;">
        <i class="fas fa-spinner fa-spin" style="font-size:2rem; color:#6366f1; margin-bottom:15px;"></i>
        <p>Connecting to satellite grid...</p>
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

  trackerMap = L.map('trackerMap').setView([20.5937, 78.9629], 5); // Center of India
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
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
    const response = await fetch('/api/users/locations');
    const executives = await response.json();
    
    markerLayer.clearLayers();
    
    let online = 0, idle = 0, offline = 0;
    const now = new Date();
    const bounds = [];

    executives.forEach(exec => {
      const lat = parseFloat(exec.latitude || exec.lat);
      const lng = parseFloat(exec.longitude || exec.lng);
      const lastActive = exec.lastActive ? new Date(exec.lastActive) : null;
      
      if (!lastActive || isNaN(lastActive.getTime())) {
        offline++;
        return;
      }

      const diffMinutes = (now - lastActive) / (1000 * 60);
      
      let statusColor = '#ef4444'; // Offline (>60m)
      let isActuallyOnline = false;
      
      if (diffMinutes < 10) {
        statusColor = '#10b981'; // Online (<10m)
        online++;
        isActuallyOnline = true;
      } else if (diffMinutes < 60) {
        statusColor = '#f59e0b'; // Idle (<60m)
        idle++;
        isActuallyOnline = true;
      } else {
        offline++;
      }

      // Only add to map if we have valid coordinates
      if (isNaN(lat) || isNaN(lng)) {
        return;
      }

      const icon = L.divIcon({
        className: 'tracker-pin',
        html: `
          <div style="position:relative;">
            <div style="background-color:${statusColor}; width:32px; height:32px; border-radius:50% 50% 50% 0; transform:rotate(-45deg); border:2px solid white; box-shadow:0 4px 10px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center;">
              <i class="fas fa-user" style="transform:rotate(45deg); color:white; font-size:14px;"></i>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      const lastSeenText = diffMinutes < 1 ? 'Just now' : `${Math.floor(diffMinutes)} mins ago`;

      const popupContent = `
        <div style="padding:5px; min-width:180px;">
          <div style="font-weight:700; font-size:14px; color:#1e293b; margin-bottom:5px; border-bottom:1px solid #e2e8f0; padding-bottom:5px;">
            ${exec.name}
          </div>
          <div style="font-size:12px; color:#64748b; margin-bottom:8px;">
            <i class="fas fa-id-badge"></i> ID: ${exec.employeeId || 'N/A'}<br>
            <i class="fas fa-clock"></i> Last Seen: ${lastSeenText}<br>
            <i class="fas fa-tasks"></i> Active Tasks: <b>${exec.activeTasks || 0}</b>
          </div>
          <button class="btn btn-primary btn-sm" style="width:100%; justify-content:center;" onclick="window.location.hash='#tasks'; /* Placeholder for deep link */">
            View Tasks
          </button>
        </div>
      `;

      L.marker([lat, lng], { icon }).bindPopup(popupContent).addTo(markerLayer);
      bounds.push([lat, lng]);
    });

    // Update Counts
    document.getElementById('onlineCount').textContent = online;
    document.getElementById('idleCount').textContent = idle;
    document.getElementById('offlineCount').textContent = offline;

    // Center map if we have data and it's the first load
    if (bounds.length > 0 && trackerMap.getZoom() <= 5) {
      trackerMap.fitBounds(bounds, { padding: [50, 50] });
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
