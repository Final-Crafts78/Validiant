/**
 * Admin Dashboard & Task Creation
 */
import { state, fetchEmployeesIfStale } from '../../store/globalState';
import { showToast, showLoading, escapeHtml } from '../../utils/ui';
import { createModal, closeAllModals } from '../../utils/modals';
import { showAllTasks } from './allTasks';

let plannerMap = null;
let plannerMapLayers = null;
let debounceTimer = null;

export async function showAssignTask() {
  const content = document.getElementById('mainContainer');
  if (!content) return;

  const html = `
    <div class="page-header">
      <div>
        <h2><i class="fas fa-tasks"></i> Assign New Task</h2>
        <p style="color: #9CA3AF; font-size: 13px; margin-top: 5px;">
          Create a new task and assign it to an employee or leave it unassigned
        </p>
      </div>
      <button class="btn btn-success" data-action="admin:showBulkUpload">
        <i class="fas fa-file-excel"></i> Bulk Upload Tasks
      </button>
    </div>
    
    <div class="form-container">
      <form id="taskForm" class="modern-form">
        <div class="form-grid">
          <!-- Left Column -->
          <div class="form-section">
            <h4 class="section-title">
              <i class="fas fa-info-circle"></i> Task Information
            </h4>
            
            <div class="form-group">
              <label for="caseId">
                <i class="fas fa-id-card"></i> Case ID / Title <span class="required">*</span>
              </label>
              <input 
                type="text" 
                id="caseId" 
                required 
                placeholder="Enter case ID or title"
                maxlength="500"
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label for="clientName">
                <i class="fas fa-user-tie"></i> Client Name
              </label>
              <input 
                type="text" 
                id="clientName" 
                placeholder="Enter client name (optional)"
                maxlength="200"
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label for="communityName">
                <i class="fas fa-building"></i> Community Name
              </label>
              <input 
                type="text" 
                id="communityName" 
                placeholder="Enter community name (optional)"
                maxlength="200"
                class="form-input"
              />
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="individualPhone">
                  <i class="fas fa-phone"></i> Individual Phone
                </label>
                <input 
                  type="tel" 
                  id="individualPhone" 
                  placeholder="Individual Phone"
                  class="form-input"
                />
              </div>
              
              <div class="form-group">
                <label for="individualAltPhone">
                  <i class="fas fa-phone-square-alt"></i> Alternate Phone
                </label>
                <input 
                  type="tel" 
                  id="individualAltPhone" 
                  placeholder="Alt Phone"
                  class="form-input"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label for="pincode">
                <i class="fas fa-map-pin"></i> Pincode <span class="required">*</span>
              </label>
              <input 
                type="text" 
                id="pincode" 
                required 
                placeholder="6-digit pincode"
                maxlength="6"
                pattern="[0-9]{6}"
                class="form-input"
              />
              <small class="form-hint">Enter valid 6-digit Indian pincode</small>
            </div>
            
            <div class="form-group">
              <label for="notes">
                <i class="fas fa-sticky-note"></i> Notes
              </label>
              <textarea 
                id="notes" 
                rows="3" 
                placeholder="Additional instructions or notes..."
                class="form-input"
              ></textarea>
            </div>
          </div>
          
          <!-- Right Column -->
          <div class="form-section">
            <h4 class="section-title">
              <i class="fas fa-map-marked-alt"></i> Location Details
            </h4>

            <div class="form-group">
              <label for="address">
                <i class="fas fa-address-card"></i> Address
              </label>
              <textarea 
                id="address" 
                rows="2" 
                placeholder="Full street address..."
                class="form-input"
              ></textarea>
            </div>
            
            <div class="form-group">
              <label for="mapUrl">
                <i class="fas fa-link"></i> Google Maps URL
              </label>
              <input 
                type="url" 
                id="mapUrl" 
                placeholder="Paste Google Maps link (coordinates extracted automatically)"
                class="form-input"
              />
              <small class="form-hint">
                <i class="fas fa-lightbulb"></i> Coordinates will be auto-extracted from Maps URL
              </small>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="latitude">
                  <i class="fas fa-globe"></i> Latitude
                </label>
                <input 
                  type="number" 
                  id="latitude" 
                  step="any" 
                  placeholder="Enter Latitude"
                  class="form-input"
                />
              </div>
              
              <div class="form-group">
                <label for="longitude">
                  <i class="fas fa-globe"></i> Longitude
                </label>
                <input 
                  type="number" 
                  id="longitude" 
                  step="any" 
                  placeholder="Enter Longitude"
                  class="form-input"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label for="employee">
                <i class="fas fa-user"></i> Assign to Employee
              </label>
              <select id="employee" class="form-input">
                <option value="">-- Leave Unassigned --</option>
                <option disabled>Loading employees...</option>
              </select>
              <small class="form-hint">Leave unassigned to add task to pool</small>
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary btn-lg">
            <i class="fas fa-check"></i> Create Task
          </button>
          <button type="button" class="btn btn-secondary" data-action="admin:showAllTasks">
            <i class="fas fa-times"></i> Cancel
          </button>
        </div>
      </form>
    </div>

    <!-- Pincode-Level Route Planner Container -->
    <div id="routePlannerContainer" class="route-planner-card" style="display: none; margin-top: 30px;">
      <h3 class="section-title" style="border-bottom: 2px solid #374151; padding-bottom: 10px; margin-bottom: 20px;">
        <i class="fas fa-route" style="color: #6366F1;"></i> Pincode-Level Route Planner & Proximity Analyzer
      </h3>
      <div class="planner-layout">
        <div id="plannerMap" style="height: 400px; border-radius: 12px; border: 1px solid #1F2937; position: relative;">
          <div id="plannerMapLoading" style="position: absolute; inset: 0; background: rgba(15, 23, 42, 0.85); display: flex; align-items: center; justify-content: center; z-index: 1000; font-size: 14px; color: #9CA3AF; border-radius: 12px;">
            <i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i> Loading Route Visualizer Map...
          </div>
        </div>
        
        <div class="proximity-panel" style="background: rgba(15, 23, 42, 0.4); border: 1px solid #1F2937; border-radius: 12px; padding: 20px;">
          <h4 style="font-size: 14px; font-weight: 600; color: #E5E7EB; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-street-view" style="color: #10B981;"></i> Executive Proximity Rankings (Bengaluru)
          </h4>
          <div class="table-container" style="border: 1px solid #1F2937;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Executive</th>
                  <th>Status</th>
                  <th>Pincode Load</th>
                  <th>Direct Dist.</th>
                  <th>Route Increment</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="proximityRankingsList">
                <tr>
                  <td colspan="7" style="text-align: center; color: #9CA3AF; padding: 20px;">
                    Enter a valid 6-digit pincode to analyze proximity.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <style>
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 25px;
        padding-bottom: 20px;
        border-bottom: 1px solid #1F2937;
      }
      
      .form-container {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid #1F2937;
        border-radius: 16px;
        padding: 30px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      }
      
      .modern-form {
        display: flex;
        flex-direction: column;
        gap: 30px;
      }
      
      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 30px;
      }
      
      .form-section {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      
      .section-title {
        color: #E5E7EB;
        font-size: 15px;
        font-weight: 600;
        margin: 0 0 10px 0;
        padding-bottom: 10px;
        border-bottom: 2px solid #374151;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .section-title i {
        color: #6366F1;
      }
      
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .form-group label {
        color: #E5E7EB;
        font-size: 13px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      
      .form-group label i {
        color: #9CA3AF;
        font-size: 12px;
      }
      
      .required {
        color: #EF4444;
        font-weight: bold;
      }
      
      .form-input {
        width: 100%;
        padding: 12px 14px;
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid #374151;
        border-radius: 10px;
        color: #E5E7EB;
        font-size: 16px; 
        transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
        outline: none;
        font-family: inherit;
      }
      
      .form-input:focus {
        border-color: #6366F1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        background: rgba(15, 23, 42, 0.95);
      }
      
      .form-input::placeholder {
        color: #6B7280;
      }
      
      .form-input[readonly] {
        background: rgba(31, 41, 55, 0.5);
        cursor: not-allowed;
        color: #9CA3AF;
      }
      
      .form-hint {
        color: #9CA3AF;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 5px;
      }
      
      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
      }
      
      .form-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
        padding-top: 20px;
        border-top: 1px solid #1F2937;
      }
      
      @media (max-width: 768px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
        .page-header {
          flex-direction: column;
          gap: 15px;
        }
      }
      .route-planner-card {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid #1F2937;
        border-radius: 16px;
        padding: 30px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      }
      .planner-layout {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      @keyframes pulse-red {
        0% {
          transform: scale(0.85);
          opacity: 1;
        }
        70% {
          transform: scale(1.3);
          opacity: 0;
        }
        100% {
          transform: scale(0.85);
          opacity: 0;
        }
      }
    </style>
  `;
  content.innerHTML = html;

  // Auto-coordinate extraction logic — Precision Cascade: !3d/!4d > @ > ?q=
  const mapUrlInput = document.getElementById('mapUrl');
  if (mapUrlInput) {
    mapUrlInput.addEventListener('input', function() {
      const url = this.value;
      const latInput = document.getElementById('latitude');
      const lngInput = document.getElementById('longitude');
      
      if (url) {
        // 1. HIGHEST PRECISION: !3d/!4d (actual pin placement in Google Maps)
        const m3d = url.match(/!3d(-?\d+\.\d+)/);
        const m4d = url.match(/!4d(-?\d+\.\d+)/);
        if (m3d && m4d) {
          latInput.value = m3d[1];
          lngInput.value = m4d[1];
          debouncedAnalyze();
          return;
        }

        // 2. MEDIUM PRECISION: @lat,lng (viewport center — can be 200-500m off)
        const atMatch = url.match(/@(-?[0-9.]+),(-?[0-9.]+)/);
        if (atMatch) {
          latInput.value = atMatch[1];
          lngInput.value = atMatch[2];
          debouncedAnalyze();
          return;
        }
        
        // 3. FALLBACK: ?q=lat,lng (query parameter)
        const qMatch = url.match(/\?q=(-?[0-9.]+),(-?[0-9.]+)/);
        if (qMatch) {
          latInput.value = qMatch[1];
          lngInput.value = qMatch[2];
          debouncedAnalyze();
          return;
        }

        // 4. SHORT LINK RESOLUTION: (goo.gl, maps.app.goo.gl, etc. resolved on-the-fly via API)
        const isShortLink = url.includes('goo.gl') || url.includes('maps.app.goo.gl') || url.includes('bit.ly') || url.trim().length < 50;
        if (isShortLink) {
          latInput.value = '';
          lngInput.value = '';
          latInput.placeholder = 'Resolving...';
          lngInput.placeholder = 'Resolving...';
          
          fetch(`/api/tasks/expand-url?url=${encodeURIComponent(url)}`)
            .then(res => res.json())
            .then(data => {
              if (data.success && data.coordinates) {
                latInput.value = data.coordinates.latitude;
                lngInput.value = data.coordinates.longitude;
                latInput.placeholder = 'Manual Lat';
                lngInput.placeholder = 'Manual Lng';
                showToast('✓ Short link expanded! Coordinates resolved successfully.', 'success');
                debouncedAnalyze();
              } else {
                latInput.placeholder = 'Manual Lat';
                lngInput.placeholder = 'Manual Lng';
              }
            })
            .catch(() => {
              latInput.placeholder = 'Manual Lat';
              lngInput.placeholder = 'Manual Lng';
            });
          return;
        }

        // Warning for non-extractable links
        showToast('Could not auto-extract coordinates. Please enter Lat/Lng manually for accurate routing!', 'warning');
      }
    });
  }

  // Populate employees dropdown
  await populateEmployeesDropdown();
  
  // Bind form submit
  document.getElementById('taskForm').addEventListener('submit', handleTaskSubmit);

  // Bind Route Planner listeners
  const inputsToListen = ['pincode', 'latitude', 'longitude', 'mapUrl'];
  inputsToListen.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', debouncedAnalyze);
    }
  });

  // Run initial analysis (e.g. if fields are prefilled)
  debouncedAnalyze();
}

async function populateEmployeesDropdown() {
  try {
    const employees = await fetchEmployeesIfStale();
    const select = document.getElementById('employee');
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Leave Unassigned --</option>';
    employees.forEach(emp => {
      const opt = document.createElement('option');
      opt.value = emp.id;
      opt.textContent = `${escapeHtml(emp.name)} ${emp.employee_id ? '(' + emp.employee_id + ')' : emp.employeeId ? '(' + emp.employeeId + ')' : '(No ID)'}`;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error('Failed to load employees', err);
  }
}

async function handleTaskSubmit(e) {
  e.preventDefault();

  const pincode = document.getElementById('pincode').value;
  if (!/^[0-9]{6}$/.test(pincode)) {
    showToast('Pincode must be exactly 6 digits', 'error');
    return;
  }

  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

  const payload = {
    title: document.getElementById('caseId').value,
    clientName: document.getElementById('clientName').value || null,
    communityName: document.getElementById('communityName')?.value || null,
    individual_phone: document.getElementById('individualPhone').value || null,
    individual_alt_phone: document.getElementById('individualAltPhone').value || null,
    pincode: pincode,
    address: document.getElementById('address') ? document.getElementById('address').value : null,
    notes: document.getElementById('notes').value || null,
    mapUrl: document.getElementById('mapUrl').value || null,
    latitude: document.getElementById('latitude').value ? parseFloat(document.getElementById('latitude').value) : null,
    longitude: document.getElementById('longitude').value ? parseFloat(document.getElementById('longitude').value) : null,
    assignedTo: document.getElementById('employee').value ? parseInt(document.getElementById('employee').value) : null,
    createdBy: state.currentUser.id,
    createdByName: state.currentUser.name
  };

  try {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showToast(payload.assignedTo ? '✓ Task created and assigned successfully!' : '✓ Task created as unassigned!', 'success');
      e.target.reset();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      showToast('Error: ' + data.message, 'error');
    }
  } catch (err) {
    showToast('Network error, please try again.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

function debouncedAnalyze() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    const pincode = document.getElementById('pincode')?.value?.trim();
    if (!pincode || !/^[0-9]{6}$/.test(pincode)) {
      const container = document.getElementById('routePlannerContainer');
      if (container) container.style.display = 'none';
      cleanupPlannerMap();
      return;
    }
    
    const container = document.getElementById('routePlannerContainer');
    if (container) container.style.display = 'block';
    
    await analyzePincodeRoutes(pincode);
  }, 500);
}

function getPlannerInputs() {
  const pincode = document.getElementById('pincode')?.value?.trim();
  const latitude = parseFloat(document.getElementById('latitude')?.value);
  const longitude = parseFloat(document.getElementById('longitude')?.value);
  const mapUrl = document.getElementById('mapUrl')?.value?.trim();
  return { pincode, latitude, longitude, mapUrl };
}

async function initPlannerMap() {
  if (plannerMap) {
    setTimeout(() => { if (plannerMap) plannerMap.invalidateSize(); }, 300);
    return;
  }
  
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

  const mapEl = document.getElementById('plannerMap');
  if (!mapEl) return;

  plannerMap = L.map('plannerMap', {
    zoomControl: true,
    attributionControl: false
  }).setView([12.9716, 77.5946], 11); 

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap', maxZoom: 19
  }).addTo(plannerMap);

  setTimeout(() => { if (plannerMap) plannerMap.invalidateSize(); }, 300);
}

export function cleanupPlannerMap() {
  if (plannerMap) {
    plannerMap.off();
    plannerMap.remove();
    plannerMap = null;
  }
  plannerMapLayers = null;
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}

async function analyzePincodeRoutes(pincode) {
  await initPlannerMap();
  if (!plannerMap) return;
  
  const loading = document.getElementById('plannerMapLoading');
  if (loading) loading.style.display = 'flex';
  
  try {
    const tasksRes = await fetch(`/api/tasks?pincode=${pincode}&status=active`);
    const allPincodeTasks = await tasksRes.json();
    const activeTasks = Array.isArray(allPincodeTasks) ? allPincodeTasks.filter(t => 
      t.status === 'Pending' || t.status === 'In Progress'
    ) : [];
    
    const execsRes = await fetch('/api/users/locations');
    const executives = await execsRes.json();
    const execArray = Array.isArray(executives) ? executives : [];
    
    let targetLat = parseFloat(document.getElementById('latitude')?.value);
    let targetLng = parseFloat(document.getElementById('longitude')?.value);
    let targetSource = 'manual';
    
    if (isNaN(targetLat) || !isFinite(targetLat) || isNaN(targetLng) || !isFinite(targetLng)) {
      const mapUrl = document.getElementById('mapUrl')?.value;
      if (mapUrl) {
        const m3d = mapUrl.match(/!3d(-?\d+(?:\.\d+)?)/);
        const m4d = mapUrl.match(/!4d(-?\d+(?:\.\d+)?)/);
        const matchPath = mapUrl.match(/\/(?:place|search)\/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
        if (m3d && m4d) {
          targetLat = parseFloat(m3d[1]);
          targetLng = parseFloat(m4d[1]);
          targetSource = '!3d/4d-url';
        } else if (matchPath) {
          targetLat = parseFloat(matchPath[1]);
          targetLng = parseFloat(matchPath[2]);
          targetSource = 'path-url';
        } else {
          const matchAt = mapUrl.match(/@(-?[0-9.]+),(-?[0-9.]+)/);
          const matchQ = mapUrl.match(/\?q=(-?[0-9.]+),(-?[0-9.]+)/);
          if (matchAt) {
            targetLat = parseFloat(matchAt[1]);
            targetLng = parseFloat(matchAt[2]);
            targetSource = '@-viewport';
          } else if (matchQ) {
            targetLat = parseFloat(matchQ[1]);
            targetLng = parseFloat(matchQ[2]);
            targetSource = '?q-query';
          }
        }
      }
    }
    
    const { pincodeData } = await import('../../store/pincodes');
    if ((isNaN(targetLat) || isNaN(targetLng)) && pincodeData[pincode]) {
      targetLat = pincodeData[pincode].lat;
      targetLng = pincodeData[pincode].lng;
      targetSource = 'pincode-centroid';
    }
    
    const hasTargetCoords = !isNaN(targetLat) && isFinite(targetLat) && !isNaN(targetLng) && isFinite(targetLng);
    
    if (plannerMapLayers) {
      plannerMapLayers.clearLayers();
    } else {
      plannerMapLayers = L.layerGroup().addTo(plannerMap);
    }
    
    const mapBounds = [];
    
    if (hasTargetCoords) {
      mapBounds.push([targetLat, targetLng]);
      const targetIcon = L.divIcon({
        className: 'proposed-task-pin-container',
        html: `
          <div style="background-color: #ef4444; border: 2px solid white; box-shadow: 0 0 10px rgba(239, 68, 68, 0.7); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative;">
            <div style="position: absolute; width: 44px; height: 44px; border: 2px solid #ef4444; border-radius: 50%; animation: pulse-red 2s infinite; opacity: 0.6; pointer-events: none; left: -8px; top: -8px;"></div>
            <i class="fas fa-star" style="color: white; font-size: 14px;"></i>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
      
      L.marker([targetLat, targetLng], {
        icon: targetIcon,
        title: 'Proposed New Task',
        zIndexOffset: 1000
      }).bindPopup(`
        <div style="font-family:'Inter',sans-serif; padding:5px; color:#fff;">
          <b style="color:#ef4444;"><i class="fas fa-star"></i> Proposed New Task</b><br>
          <span style="font-size:12px; color:#cbd5e1;">Source: ${targetSource}</span><br>
          <span style="font-size:12px; color:#cbd5e1;">Coords: ${targetLat.toFixed(5)}, ${targetLng.toFixed(5)}</span>
        </div>
      `).addTo(plannerMapLayers);
    }
    
    const { resolveTaskCoordinates } = await import('../employee/sorting');
    
    const tasksByExec = {};
    activeTasks.forEach((t) => {
      const { lat, lng } = resolveTaskCoordinates(t);
      if (lat != null && lng != null) {
        const assignedTo = t.assigned_to;
        if (assignedTo) {
          if (!tasksByExec[assignedTo]) tasksByExec[assignedTo] = [];
          tasksByExec[assignedTo].push({ ...t, lat, lng });
        } else {
          if (!tasksByExec['unassigned']) tasksByExec['unassigned'] = [];
          tasksByExec['unassigned'].push({ ...t, lat, lng });
        }
      }
    });
    
    const executiveColors = [
      '#6366f1', // Indigo
      '#10b981', // Emerald
      '#06b6d4', // Cyan
      '#f59e0b', // Amber
      '#ec4899', // Pink
      '#8b5cf6', // Violet
      '#14b8a6', // Teal
      '#f97316'  // Orange
    ];
    
    const getExecColor = (execId) => {
      if (!execId || execId === 'unassigned') return '#94a3b8';
      const hash = parseInt(execId) || 0;
      return executiveColors[hash % executiveColors.length];
    };
    
    if (tasksByExec['unassigned']) {
      tasksByExec['unassigned'].forEach(t => {
        mapBounds.push([t.lat, t.lng]);
        const taskIcon = L.divIcon({
          className: 'planner-task-pin-unassigned',
          html: `<div style="background-color: #94a3b8; color: white; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.4); font-size:10px;"><i class="fas fa-question" style="font-size: 8px;"></i></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });
        
        L.marker([t.lat, t.lng], {
          icon: taskIcon,
          title: `Unassigned Task: ${t.title || t.case_id}`
        }).bindPopup(`
          <div style="font-family:'Inter',sans-serif; padding:5px; color:#fff;">
            <b style="color:#cbd5e1;">${escapeHtml(t.title || t.case_id || 'Task')}</b><br>
            <span style="font-size:11px; color:#ef4444; font-weight:600;">Status: Unassigned</span><br>
            <span style="font-size:11px; color:#cbd5e1;">Address: ${escapeHtml(t.address || 'N/A')}</span>
          </div>
        `).addTo(plannerMapLayers);
      });
    }
    
    const proximityAnalysis = [];
    const now = new Date();
    
    execArray.forEach(exec => {
      const execLat = parseFloat(exec.latitude !== undefined && exec.latitude !== null ? exec.latitude : exec.lat);
      const execLng = parseFloat(exec.longitude !== undefined && exec.longitude !== null ? exec.longitude : exec.lng);
      const hasExecCoords = !isNaN(execLat) && !isNaN(execLng);
      
      const lastActiveDate = exec.lastActive || exec.last_active;
      const lastActive = lastActiveDate ? new Date(lastActiveDate) : null;
      let statusClass = 'tracker-status-offline';
      let statusLabel = 'Offline';
      let isOnline = false;
      
      if (lastActive && !isNaN(lastActive.getTime())) {
        const diffMinutes = Math.max(0, (now - lastActive) / (1000 * 60));
        if (diffMinutes < 10) {
          statusClass = 'tracker-status-online';
          statusLabel = 'Online';
          isOnline = true;
        } else if (diffMinutes < 60) {
          statusClass = 'tracker-status-idle';
          statusLabel = 'Idle';
        }
      }
      
      const execColor = getExecColor(exec.id);
      const execTasks = tasksByExec[exec.id] || [];
      const numActiveTasksInPincode = execTasks.length;
      
      let directDistance = null;
      let incrementalDistance = null;
      
      if (hasExecCoords) {
        mapBounds.push([execLat, execLng]);
        
        const execIcon = L.divIcon({
          className: 'planner-exec-pin-container',
          html: `
            <div class="tracker-pin ${statusClass}" style="background-color: ${execColor};">
              ${isOnline ? '<div class="pulse-ring" style="border-color: ' + execColor + ';"></div>' : ''}
              <div class="tracker-pin-inner" style="color: white; display: flex; align-items: center; justify-content: center; height: 100%;">
                <i class="fas fa-motorcycle" style="font-size: 13px;"></i>
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 36]
        });
        
        L.marker([execLat, execLng], {
          icon: execIcon,
          title: `Executive: ${exec.name || 'Unknown'}`
        }).bindPopup(`
          <div style="font-family:'Inter',sans-serif; padding:5px; color:#fff;">
            <b style="color:${execColor};">${escapeHtml(exec.name || 'Executive')}</b><br>
            <span style="font-size:11px; color:#cbd5e1;">Status: ${statusLabel}</span><br>
            <span style="font-size:11px; color:#cbd5e1;">Active Tasks in Pincode: ${numActiveTasksInPincode}</span>
          </div>
        `).addTo(plannerMapLayers);
        
        if (numActiveTasksInPincode > 0) {
          const sortedExecTasks = [...execTasks].sort((a,b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
          const polylineCoords = [[execLat, execLng]];
          
          sortedExecTasks.forEach((t, i) => {
            polylineCoords.push([t.lat, t.lng]);
            mapBounds.push([t.lat, t.lng]);
            
            const taskIcon = L.divIcon({
              className: 'planner-task-pin-exec',
              html: `<div style="background-color: ${execColor}; color: white; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.4); font-size:10px;">${i + 1}</div>`,
              iconSize: [22, 22],
              iconAnchor: [11, 11]
            });
            
            L.marker([t.lat, t.lng], {
              icon: taskIcon,
              title: `Task: ${t.title || t.case_id}`
            }).bindPopup(`
              <div style="font-family:'Inter',sans-serif; padding:5px; color:#fff;">
                <b style="color:${execColor};">${escapeHtml(t.title || t.case_id || 'Task')}</b><br>
                <span style="font-size:11px; color:#cbd5e1;">Sequence: ${i + 1}</span><br>
                <span style="font-size:11px; color:#cbd5e1;">Address: ${escapeHtml(t.address || 'N/A')}</span>
              </div>
            `).addTo(plannerMapLayers);
          });
          
          L.polyline(polylineCoords, {
            color: execColor,
            weight: 3,
            opacity: 0.75,
            dashArray: '5, 5'
          }).addTo(plannerMapLayers);
        }
        
        if (hasTargetCoords) {
          directDistance = calculateDistance(execLat, execLng, targetLat, targetLng);
          
          if (numActiveTasksInPincode > 0) {
            const sortedExecTasks = [...execTasks].sort((a,b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
            const lastTask = sortedExecTasks[sortedExecTasks.length - 1];
            incrementalDistance = calculateDistance(lastTask.lat, lastTask.lng, targetLat, targetLng);
          }
        }
      }
      
      proximityAnalysis.push({
        id: exec.id,
        name: exec.name || 'Unknown',
        employeeId: exec.employeeId || exec.employee_id || 'N/A',
        status: statusLabel,
        statusClass,
        activeTasksCount: numActiveTasksInPincode,
        directDistance,
        incrementalDistance,
        hasCoords: hasExecCoords,
        color: execColor
      });
    });
    
    if (mapBounds.length > 0) {
      plannerMap.fitBounds(mapBounds, { padding: [40, 40], maxZoom: 14 });
    }
    
    const sortedAnalysis = proximityAnalysis.sort((a, b) => {
      if (!a.hasCoords && !b.hasCoords) return 0;
      if (!a.hasCoords) return 1;
      if (!b.hasCoords) return -1;
      
      const distA = a.incrementalDistance !== null ? a.incrementalDistance : a.directDistance;
      const distB = b.incrementalDistance !== null ? b.incrementalDistance : b.directDistance;
      return distA - distB;
    });
    
    let suggestedExecId = null;
    let bestScore = -999999;
    
    sortedAnalysis.forEach(exec => {
      if (!exec.hasCoords) return;
      
      let score = 0;
      const distance = exec.incrementalDistance !== null ? exec.incrementalDistance : exec.directDistance;
      
      score -= distance * 10;
      
      if (exec.status === 'Online') score += 100;
      else if (exec.status === 'Idle') score += 50;
      else score -= 100;
      
      score -= exec.activeTasksCount * 15;
      
      if (score > bestScore) {
        bestScore = score;
        suggestedExecId = exec.id;
      }
    });
    
    const tbody = document.getElementById('proximityRankingsList');
    if (tbody) {
      if (sortedAnalysis.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align: center; color: #9CA3AF; padding: 20px;">
              No executives available.
            </td>
          </tr>
        `;
      } else {
        tbody.innerHTML = sortedAnalysis.map((exec, index) => {
          const isSuggested = exec.id === suggestedExecId;
          const displayDirect = exec.hasCoords && exec.directDistance !== null 
            ? `${exec.directDistance.toFixed(2)} km` 
            : '<span style="color:#64748b;">N/A</span>';
          const displayInc = exec.hasCoords && exec.incrementalDistance !== null 
            ? `${exec.incrementalDistance.toFixed(2)} km` 
            : '<span style="color:#64748b;">N/A (No Tasks)</span>';
          
          return `
            <tr style="${isSuggested ? 'background: rgba(99, 102, 241, 0.1); border-left: 4px solid #6366f1;' : ''}">
              <td style="font-weight: 600; padding: 12px 10px;">
                ${isSuggested ? '<span style="background:#6366f1; color:white; padding:2px 6px; border-radius:4px; font-size:10px;"><i class="fas fa-thumbs-up"></i> Best</span>' : `#${index + 1}`}
              </td>
              <td>
                <span style="font-weight: 500; color: #E5E7EB; display: flex; align-items: center; gap: 8px;">
                  <span style="width: 10px; height: 10px; border-radius: 50%; background-color: ${exec.color}; display: inline-block;"></span>
                  ${escapeHtml(exec.name)} 
                  <span style="color:#94A3B8; font-size:11px;">(${escapeHtml(exec.employeeId)})</span>
                </span>
              </td>
              <td>
                <span class="status-badge ${exec.status === 'Online' ? 'status-completed' : exec.status === 'Idle' ? 'status-pending' : 'status-unassigned'}" style="font-size: 11px;">
                  ${exec.status}
                </span>
              </td>
              <td>
                <span style="color: ${exec.activeTasksCount > 3 ? '#F59E0B' : '#E5E7EB'}; font-weight: 500;">
                  ${exec.activeTasksCount} tasks
                </span>
              </td>
              <td>${displayDirect}</td>
              <td>${displayInc}</td>
              <td>
                <button type="button" class="btn btn-sm btn-secondary quick-assign-btn" data-exec-id="${exec.id}" data-exec-name="${escapeHtml(exec.name)}" style="padding: 4px 10px; font-size: 12px;">
                  Select
                </button>
              </td>
            </tr>
          `;
        }).join('');
        
        const selectButtons = tbody.querySelectorAll('.quick-assign-btn');
        selectButtons.forEach(btn => {
          btn.addEventListener('click', function(e) {
            e.preventDefault();
            const execId = this.getAttribute('data-exec-id');
            const execName = this.getAttribute('data-exec-name');
            applyAssignment(execId, execName);
          });
        });
      }
    }
  } catch (err) {
    console.error("Failed route analysis:", err);
  } finally {
    const loading = document.getElementById('plannerMapLoading');
    if (loading) loading.style.display = 'none';
  }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  const d = R * c;
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function applyAssignment(execId, execName) {
  const select = document.getElementById('employee');
  if (select) {
    select.value = execId;
    
    const employeeGroup = select.closest('.form-group');
    if (employeeGroup) {
      employeeGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      select.style.borderColor = '#6366F1';
      select.style.boxShadow = '0 0 10px rgba(99, 102, 241, 0.5)';
      setTimeout(() => {
        select.style.borderColor = '';
        select.style.boxShadow = '';
      }, 1500);
    }
    
    showToast(`✓ Selected ${execName} as task assignee!`, 'success');
  }
}

