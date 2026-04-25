/**
 * Admin Executive Live Tracker
 */
import { cleanupMapInstance } from '../routing/leafletEngine';
import { showToast } from '../../utils/ui';

let trackerMap = null;
let markerLayer = null;
let refreshInterval = null;
let filterClickListener = null;
let selectedExecutivesFilter = [];
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
      
      /* Multi-select filter styles */
      .tracker-filter-dropdown { position: relative; display: inline-block; }
      .tracker-filter-btn { background: #1e293b; border: 1px solid #334155; color: #f8fafc; padding: 6px 14px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 500; transition: all 0.2s; font-size:12px; }
      .tracker-filter-btn:hover { background: #334155; }
      .tracker-filter-panel { display: none; position: absolute; top: 100%; right: 0; margin-top: 8px; background: #0f172a; border: 1px solid #334155; border-radius: 12px; width: 260px; max-height: 350px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); z-index: 2000; padding: 12px; flex-direction: column; }
      .tracker-filter-panel.show { display: flex; }
      .tracker-filter-item { display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: 6px; cursor: pointer; transition: background 0.2s; font-size:13px; color:#e2e8f0; margin:0; }
      .tracker-filter-item:hover { background: rgba(255,255,255,0.05); }
      .tracker-filter-item input[type="checkbox"] { accent-color: #6366f1; width: 16px; height: 16px; cursor:pointer; margin:0; }
      .tracker-filter-footer { margin-top: 10px; padding-top: 10px; border-top: 1px solid #334155; display: flex; justify-content: space-between; }
    `;
    document.head.appendChild(style);
  }

  // Handle outside click for filter panel
  if (filterClickListener) document.removeEventListener('click', filterClickListener);
  filterClickListener = (e) => {
    const container = document.getElementById('executiveFilterContainer');
    const panel = document.getElementById('trackerFilterPanel');
    if (container && panel && !container.contains(e.target)) {
      panel.classList.remove('show');
    }
  };
  document.addEventListener('click', filterClickListener);

  // Global functions for the filter
  window._applyTrackerFilter = () => {
    const checkboxes = document.querySelectorAll('.tracker-filter-checkbox');
    selectedExecutivesFilter = Array.from(checkboxes).filter(c => c.checked).map(c => c.value);
    
    const badge = document.getElementById('trackerFilterBadge');
    if (selectedExecutivesFilter.length > 0) {
      badge.style.display = 'inline-block';
      badge.textContent = selectedExecutivesFilter.length;
    } else {
      badge.style.display = 'none';
    }
    
    const panel = document.getElementById('trackerFilterPanel');
    if (panel) panel.classList.remove('show');
    renderTrackerMap(); // Re-render map visually without fetching
  };

  window._clearTrackerFilter = () => {
    const checkboxes = document.querySelectorAll('.tracker-filter-checkbox');
    checkboxes.forEach(c => c.checked = false);
    window._applyTrackerFilter();
  };

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
        
        <div class="tracker-filter-dropdown" id="executiveFilterContainer">
          <button class="tracker-filter-btn" onclick="document.getElementById('trackerFilterPanel').classList.toggle('show')">
            <i class="fas fa-filter"></i> Filter Tasks
            <span id="trackerFilterBadge" style="background:#6366f1; color:white; font-size:10px; padding:2px 6px; border-radius:10px; display:none;">0</span>
          </button>
          <div class="tracker-filter-panel" id="trackerFilterPanel">
            <div style="font-size:11px; color:#94a3b8; margin-bottom:10px; font-weight:600; text-transform:uppercase;">Select Executives</div>
            <div id="trackerFilterList" style="display:flex; flex-direction:column; gap:2px; max-height:200px; overflow-y:auto; flex:1;">
              <!-- Checkboxes injected here -->
            </div>
            <div class="tracker-filter-footer">
              <button class="btn btn-secondary btn-sm" onclick="window._clearTrackerFilter()" style="padding:4px 8px; font-size:11px;">Clear</button>
              <button class="btn btn-primary btn-sm" onclick="window._applyTrackerFilter()" style="padding:4px 12px; font-size:11px;">Apply</button>
            </div>
          </div>
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
      fetch(`/api/users/locations?_t=${Date.now()}`, { cache: 'no-store' }),
      fetch(`/api/tasks?_t=${Date.now()}`, { cache: 'no-store' })
    ]);
    const executives = await execResponse.json();
    
    let tasks = [];
    if (taskResponse.ok) {
      const allTasks = await taskResponse.json();
      if (Array.isArray(allTasks)) {
        tasks = allTasks.filter(t => {
          const isCompleted = t.status === 'Completed' || t.status === 'Verified';
          const isUnassignedStatus = t.status === 'Unassigned';
          const hasNoAssignee = !t.assigned_to || t.assigned_to === 'Unassigned';
          const assigneeName = t.assignedToName || t.assigned_to_name;
          const hasNoAssigneeName = !assigneeName || assigneeName === 'Unassigned';
          
          return !isCompleted && !isUnassignedStatus && !hasNoAssignee && !hasNoAssigneeName;
        });
      }
    }
    
    // Ensure executives is a valid array
    const execArray = Array.isArray(executives) ? executives : [];
    
    window._trackerCache = { execArray, tasks };
    populateFilterDropdown();
    
    console.log(`📍 Executive Pin Logic: Processing ${execArray.length} executives and ${tasks.length} pending tasks`);
    renderTrackerMap();
    
  } catch (error) {
    console.error("❌ Failed to update tracker data:", error);
  }
}

function populateFilterDropdown() {
  const list = document.getElementById('trackerFilterList');
  if (!list || !window._trackerCache) return;
  
  const execs = [...window._trackerCache.execArray].sort((a,b) => (a.name || '').localeCompare(b.name || ''));
  
  list.innerHTML = execs.map(exec => `
    <label class="tracker-filter-item">
      <input type="checkbox" class="tracker-filter-checkbox" value="${exec.id}" ${selectedExecutivesFilter.includes(String(exec.id)) ? 'checked' : ''}>
      ${exec.name || 'Unknown'} <span style="color:#94a3b8; font-size:11px;">(${exec.employeeId || exec.employee_id || 'N/A'})</span>
    </label>
  `).join('');
}

async function renderTrackerMap() {
  if (!window._trackerCache) return;
  const { execArray, tasks } = window._trackerCache;

  markerLayer.clearLayers();
    
    let online = 0, idle = 0, offline = 0;
    const now = new Date();
    const bounds = [];

    // 1. PLOT PENDING TASKS
    const { resolveTaskCoordinates } = await import('../employee/sorting');
    
    const filteredTasks = selectedExecutivesFilter.length > 0 
      ? tasks.filter(t => selectedExecutivesFilter.includes(String(t.assigned_to))) 
      : tasks;

    filteredTasks.forEach((t, index) => {
      const { lat, lng, source } = resolveTaskCoordinates(t);
      if (lat != null && lng != null) {
        bounds.push([lat, lng]);
        const isApprox = source === 'pincode-fallback' || source === '@-viewport' || source === 'address-pincode';
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
            <span style="font-size:12px; color:#64748b;">Assigned To: ${t.assignedToName || t.assigned_to_name || 'Unassigned'}</span>
          </div>
        `).addTo(markerLayer);
      }
    });

    // 2. PLOT EXECUTIVES
    execArray.forEach(exec => {
      // Allow raw string parsing, handle cases where lat/lng properties might be differently named
      const latRaw = exec.latitude !== undefined && exec.latitude !== null ? exec.latitude : exec.lat;
      const lngRaw = exec.longitude !== undefined && exec.longitude !== null ? exec.longitude : exec.lng;
      const lat = parseFloat(latRaw);
      const lng = parseFloat(lngRaw);
      
      const lastActiveDate = exec.lastActive || exec.last_active;
      const lastActive = lastActiveDate ? new Date(lastActiveDate) : null;
      
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
      const displayEmployeeId = exec.employeeId || exec.employee_id || 'N/A';
      const activeTaskCount = exec.activeTasks || exec.active_tasks || 0;
      const slaBreachedCount = exec.slaBreachedTasks || 0;

      const popupContent = `
        <div style="padding:12px; min-width:280px; font-family: 'Inter', sans-serif;">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px; border-bottom:1px solid #334155; padding-bottom:10px;">
            <div style="width:40px; height:40px; border-radius:10px; background:#1e293b; display:flex; align-items:center; justify-content:center; border:1px solid #475569;">
              <i class="fas fa-user-tie" style="color:#6366f1; font-size:20px;"></i>
            </div>
            <div>
              <div style="font-weight:700; font-size:15px; color:#f8fafc;">${exec.name || 'Unknown Executive'}</div>
              <div style="font-size:11px; color:#94a3b8; font-weight:500;">${displayEmployeeId}</div>
            </div>
          </div>
          
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:15px;">
            <div style="background:rgba(255,255,255,0.05); padding:8px 4px; border-radius:8px; text-align:center; border:1px solid rgba(255,255,255,0.05);">
              <div style="font-size:9px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:2px;">Last Seen</div>
              <div style="font-size:12px; color:#f1f5f9; font-weight:600;">${lastSeenText}</div>
            </div>
            <div style="background:rgba(255,255,255,0.05); padding:8px 4px; border-radius:8px; text-align:center; border:1px solid rgba(255,255,255,0.05);">
              <div style="font-size:9px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:2px;">Pending</div>
              <div style="font-size:12px; color:#6366f1; font-weight:700;">${activeTaskCount}</div>
            </div>
            <div style="background:rgba(239,68,68,0.1); padding:8px 4px; border-radius:8px; text-align:center; border:1px solid rgba(239,68,68,0.2);">
              <div style="font-size:9px; color:#ef4444; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:2px;">3+ Days SLA</div>
              <div style="font-size:12px; color:#ef4444; font-weight:700;">${slaBreachedCount}</div>
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
