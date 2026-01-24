/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VALIDIANT DASHBOARD - CLIENT LOGIC (v3.0)
 * ═══════════════════════════════════════════════════════════════════════════
 */

// 1. GLOBAL STATE
let currentUser = null;
let sessionTimeout = null;
let allEmployeeTasks = [];
let allHistoryTasks = [];
let allAdminTasks = [];
let allUnassignedTasks = [];
let allEmployees = [];
let isNearestSortActive = false;
let savedEmployeeLocation = null;

// 2. MASTER PINCODE DATABASE (Bangalore & Surroundings)
const pincodeData = {
  '560001':{lat:12.9716,lng:77.5946},'560002':{lat:12.9844,lng:77.5908},'560003':{lat:13.0067,lng:77.5713},
  '560004':{lat:12.944,lng:77.575},'560005':{lat:13.005,lng:77.588},'560006':{lat:12.9634,lng:77.5855},
  '560007':{lat:12.8431,lng:77.4863},'560008':{lat:13.0169,lng:77.64},'560009':{lat:13.031,lng:77.645},
  '560010':{lat:13.0208,lng:77.6344},'560011':{lat:13.032,lng:77.596},'560012':{lat:13.0048,lng:77.5956},
  '560013':{lat:13.035,lng:77.551},'560014':{lat:13.0305,lng:77.5575},'560015':{lat:13.045,lng:77.565},
  '560016':{lat:13.041,lng:77.559},'560017':{lat:13.0085,lng:77.65},'560018':{lat:12.952,lng:77.579},
  '560019':{lat:12.952,lng:77.5735},'560020':{lat:13.005,lng:77.5842},'560021':{lat:12.987,lng:77.565},
  '560022':{lat:13.013,lng:77.551},'560023':{lat:12.976,lng:77.542},'560024':{lat:12.968,lng:77.535},
  '560025':{lat:13.011,lng:77.562},'560026':{lat:12.972,lng:77.547},'560027':{lat:12.982,lng:77.574},
  '560029':{lat:12.955,lng:77.601},'560030':{lat:12.9716,lng:77.5946},'560032':{lat:12.958,lng:77.597},
  '560033':{lat:12.964,lng:77.596},'560034':{lat:12.9275,lng:77.6225},'560035':{lat:12.934,lng:77.668},
  '560036':{lat:12.994,lng:77.691},'560037':{lat:13.045,lng:77.69},'560038':{lat:12.9755,lng:77.64},
  '560039':{lat:12.968,lng:77.522},'560040':{lat:12.981,lng:77.519},'560041':{lat:12.932,lng:77.585},
  '560042':{lat:12.918,lng:77.599},'560043':{lat:13.014,lng:77.649},'560045':{lat:12.985,lng:77.607},
  '560046':{lat:13.007,lng:77.601},'560047':{lat:12.964,lng:77.609},'560048':{lat:13.036,lng:77.705},
  '560049':{lat:13.064,lng:77.728},'560050':{lat:13.064,lng:77.628},'560051':{lat:12.908,lng:77.597},
  '560053':{lat:12.965,lng:77.573},'560054':{lat:13.037,lng:77.562},'560055':{lat:13.0055,lng:77.569},
  '560056':{lat:13.006,lng:77.575},'560057':{lat:13.026,lng:77.521},'560058':{lat:13.01,lng:77.53},
  '560059':{lat:13.015,lng:77.533},'560060':{lat:13.009,lng:77.548},'560061':{lat:12.925,lng:77.535},
  '560062':{lat:12.896,lng:77.527},'560063':{lat:13.108,lng:77.575},'560064':{lat:13.0675,lng:77.598},
  '560065':{lat:13.08,lng:77.57},'560066':{lat:13.0875,lng:77.582},'560067':{lat:13.152,lng:77.605},
  '560068':{lat:13.068,lng:77.718},'560070':{lat:12.913,lng:77.547},'560071':{lat:12.957,lng:77.638},
  '560072':{lat:12.951,lng:77.485},'560073':{lat:13.043,lng:77.545},'560074':{lat:12.888,lng:77.498},
  '560075':{lat:13.0055,lng:77.578},'560076':{lat:12.9,lng:77.597},'560077':{lat:13.032,lng:77.585},
  '560078':{lat:12.91,lng:77.555},'560079':{lat:12.981,lng:77.541},'560080':{lat:13.005,lng:77.573},
  '560082':{lat:12.856,lng:77.542},'560083':{lat:12.897,lng:77.578},'560084':{lat:13.03,lng:77.616},
  '560085':{lat:12.911,lng:77.558},'560086':{lat:12.96,lng:77.541},'560087':{lat:13.028,lng:77.595},
  '560090':{lat:13.016,lng:77.709},'560091':{lat:12.977,lng:77.615},'560092':{lat:13.045,lng:77.667},
  '560093':{lat:12.984,lng:77.655},'560094':{lat:12.9695,lng:77.657},'560095':{lat:12.935,lng:77.627},
  '560096':{lat:12.942,lng:77.618},'560097':{lat:13.07,lng:77.784},'560098':{lat:13.009,lng:77.589},
  '560099':{lat:12.845,lng:77.679},'560100':{lat:12.845,lng:77.661},'560102':{lat:12.912,lng:77.638},
  '560103':{lat:12.926,lng:77.676},'560104':{lat:13.064,lng:77.748},'560105':{lat:13.087,lng:77.702},
  '562106':{lat:12.711,lng:77.695},'562107':{lat:12.776,lng:77.754},'562125':{lat:12.916,lng:77.782},
  '562130':{lat:13.006,lng:77.791},'562149':{lat:13.143,lng:77.709},'562157':{lat:13.178,lng:77.721}
};

// 3. AUTHENTICATION & STARTUP CHECK
const userStr = localStorage.getItem('currentUser');

// CHECK 1: If no user data found
if (!userStr) {
  window.location.href = '/signin.html'; // <--- UPDATED
  throw new Error('Not authenticated');
}

try {
  currentUser = JSON.parse(userStr);
  // Update Header with User Name
  const userChip = document.getElementById('userName');
  if(userChip) {
    userChip.innerHTML = `<i class="fas fa-user-circle"></i> ${escapeHtml(currentUser.name)} (${currentUser.role})`;
  }
} catch (e) {
  console.error('Error parsing user data:', e);
  // CHECK 2: If data is corrupted
  window.location.href = '/signin.html'; // <--- UPDATED
}

// CHECK 3: If object exists but has no role
if (!currentUser || !currentUser.role) {
  alert('Your session is invalid. Please login again.');
  localStorage.removeItem('currentUser');
  window.location.href = '/signin.html'; // <--- UPDATED
}

// 4. SESSION TIMEOUT (15 Minutes)
function resetSessionTimeout() {
  clearTimeout(sessionTimeout);
  sessionTimeout = setTimeout(() => {
    showToast('Session expired. Please login again.', 'error');
    setTimeout(() => logout(), 2000);
  }, 900000); // 15 mins
}

document.addEventListener('click', resetSessionTimeout);
document.addEventListener('keypress', resetSessionTimeout);
document.addEventListener('mousemove', resetSessionTimeout);
resetSessionTimeout(); // Start timer

// 5. UTILITY FUNCTIONS
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message, type) {
  const toast = document.getElementById('toast');
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    info: 'fa-info-circle',
    warning: 'fa-exclamation-triangle'
  };
  const icon = icons[type] || icons.info;
  const colorClass = `toast-${type}`; // Maps to CSS classes like .toast-success

  toast.innerHTML = `<i class="fas ${icon} toast-icon"></i> <span>${escapeHtml(message)}</span>`;
  toast.className = `toast show ${colorClass}`;

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// Optimized Logout
function logout(isAuto = false) {
  // Only ask for confirmation if the user clicked the button (not auto-timeout)
  if (typeof isAuto !== 'boolean' && !confirm('Are you sure you want to logout?')) return;

  localStorage.removeItem('currentUser');
  sessionStorage.clear();
  showToast('Logged out successfully!', 'success');
  
  // Redirect to LANDING PAGE
  setTimeout(() => { window.location.href = '/index.html'; }, 1000);
}

// Loading Helper
function showLoading(msg = 'Loading...') {
  const content = document.getElementById('content');
  if (content) {
    content.innerHTML = `<div class="loading-spinner show" style="justify-content:center; padding:50px;"><i class="fas fa-spinner fa-spin"></i> ${msg}</div>`;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. MENU & NAVIGATION (Feature #15)
// ═══════════════════════════════════════════════════════════════════════════

function initMenu() {
  const menu = document.getElementById('menu');
  if (!menu) return;

  // Clear existing menu
  menu.innerHTML = '';

  if (currentUser.role === 'admin') {
    // ADMIN MENU
    const buttons = [
      { icon: 'fa-plus-circle', text: 'Assign Task', action: 'showAssignTask()', class: 'btn-primary' },
      { icon: 'fa-inbox', text: 'Unassigned Pool', action: 'showUnassignedTasks()', class: 'btn-primary' },
      { icon: 'fa-list', text: 'All Tasks', action: 'showAllTasks()', class: 'btn-primary' },
      { icon: 'fa-users', text: 'Employees', action: 'showEmployees()', class: 'btn-primary' },
      { icon: 'fa-history', text: 'Activity Log', action: 'showActivityLog()', class: 'btn-primary' },
      { icon: 'fa-chart-pie', text: 'Analytics', action: 'showAnalyticsDashboard()', class: 'btn-info' },
      { icon: 'fa-download', text: 'Export CSV', action: 'exportTasks()', class: 'btn-success' },
      { icon: 'fa-fingerprint', text: 'Digital KYC', action: 'showKYCDashboard()', class: 'btn-primary', style: 'background:#8b5cf6; border-color:#7c3aed;' }
    ];

    buttons.forEach(btn => {
      menu.innerHTML += `<button class="btn ${btn.class}" onclick="${btn.action}" style="${btn.style || ''}"><i class="fas ${btn.icon}"></i> ${btn.text}</button>`;
    });

    // Default view for Admin
    showAssignTask();

  } else {
    // EMPLOYEE MENU
    const buttons = [
      { icon: 'fa-tasks', text: 'Today\'s Tasks', action: 'showTodayTasks()', class: 'btn-primary' },
      { icon: 'fa-history', text: 'Task History', action: 'showTaskHistory()', class: 'btn-primary' }
    ];

    buttons.forEach(btn => {
      menu.innerHTML += `<button class="btn ${btn.class}" onclick="${btn.action}"><i class="fas ${btn.icon}"></i> ${btn.text}</button>`;
    });

    // Default view for Employee
    showTodayTasks();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. ADMIN: ASSIGN TASK FORM (Feature #1)
// ═══════════════════════════════════════════════════════════════════════════

function showAssignTask() {
  const content = document.getElementById('content');
  
  let html = `
    <h2><i class="fas fa-tasks"></i> Assign New Task</h2>
    <button class="btn btn-success" onclick="showBulkUpload()" style="margin-bottom: 25px;">
      <i class="fas fa-file-excel"></i> Bulk Upload Tasks (Excel)
    </button>

    <form id="taskForm" class="panel">
      <div class="form-group">
        <label for="caseId"><i class="fas fa-id-card"></i> Case ID / Title *</label>
        <input type="text" id="caseId" required placeholder="Enter case ID or title" maxlength="500">
      </div>

      <div class="form-group">
        <label for="clientName"><i class="fas fa-user-tie"></i> Client Name (Optional)</label>
        <input type="text" id="clientName" placeholder="Enter client name" maxlength="200">
      </div>

      <div class="form-group">
        <label for="pincode"><i class="fas fa-map-pin"></i> Pincode *</label>
        <input type="text" id="pincode" required placeholder="6-digit pincode" maxlength="6" pattern="[0-9]{6}">
      </div>

      <div class="form-group">
        <label for="mapUrl"><i class="fas fa-map-marked-alt"></i> Google Maps URL (Optional)</label>
        <input type="url" id="mapUrl" placeholder="Paste Google Maps link (coordinates extracted automatically)">
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div class="form-group">
          <label for="latitude"><i class="fas fa-globe"></i> Latitude</label>
          <input type="number" id="latitude" step="any" placeholder="Auto-filled">
        </div>
        <div class="form-group">
          <label for="longitude"><i class="fas fa-globe"></i> Longitude</label>
          <input type="number" id="longitude" step="any" placeholder="Auto-filled">
        </div>
      </div>

      <div class="form-group">
        <label for="employee"><i class="fas fa-user"></i> Assign to Employee</label>
        <select id="employee">
          <option value="">-- Leave Unassigned --</option>
          <option disabled>Loading employees...</option>
        </select>
      </div>

      <div class="form-group">
        <label for="notes"><i class="fas fa-sticky-note"></i> Notes</label>
        <textarea id="notes" rows="3" placeholder="Additional instructions..."></textarea>
      </div>

      <button type="submit" class="btn btn-primary btn-lg" style="width:100%; margin-top:10px;">
        <i class="fas fa-check"></i> Create Task
      </button>
    </form>
  `;

  content.innerHTML = html;

  // 1. Populate Employees Dropdown
  fetch('/api/users')
    .then(r => r.json())
    .then(users => {
      const select = document.getElementById('employee');
      if(select) {
        select.innerHTML = '<option value="">-- Leave Unassigned --</option>';
        users.forEach(u => {
          const option = document.createElement('option');
          option.value = u.id;
          option.textContent = `${escapeHtml(u.name)} (${u.employeeId || 'No ID'})`;
          select.appendChild(option);
        });
      }
    })
    .catch(err => {
      console.error('Error loading employees:', err);
      showToast('Failed to load employees', 'error');
    });

  // 2. Map URL Auto-Extractor Listener
  document.getElementById('mapUrl').addEventListener('input', function() {
    const url = this.value;
    if (url) {
      // Try to find @lat,lng
      const latMatch = url.match(/@(-?[0-9.]+),(-?[0-9.]+)/);
      if (latMatch) {
        document.getElementById('latitude').value = latMatch[1];
        document.getElementById('longitude').value = latMatch[2];
      } else {
        // Try to find ?q=lat,lng
        const qMatch = url.match(/\?q=(-?[0-9.]+),(-?[0-9.]+)/);
        if (qMatch) {
          document.getElementById('latitude').value = qMatch[1];
          document.getElementById('longitude').value = qMatch[2];
        }
      }
    }
  });

  // 3. Handle Form Submission
  document.getElementById('taskForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const pincode = document.getElementById('pincode').value;
    if (!/^[0-9]{6}$/.test(pincode)) {
      showToast('Pincode must be exactly 6 digits', 'error');
      return;
    }

    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';

    const formData = {
      title: document.getElementById('caseId').value,
      clientName: document.getElementById('clientName').value || null,
      pincode: pincode,
      mapUrl: document.getElementById('mapUrl').value || null,
      latitude: parseFloat(document.getElementById('latitude').value) || null,
      longitude: parseFloat(document.getElementById('longitude').value) || null,
      assignedTo: document.getElementById('employee').value ? parseInt(document.getElementById('employee').value) : null,
      notes: document.getElementById('notes').value || null,
      createdBy: currentUser.id,
      createdByName: currentUser.name
    };

    fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(data => {
      btn.disabled = false;
      btn.innerHTML = originalText;
      
      if (data.success) {
        showToast(formData.assignedTo ? 'Task assigned successfully!' : 'Task created as unassigned!', 'success');
        document.getElementById('taskForm').reset();
      } else {
        showToast(data.message || 'Error creating task', 'error');
      }
    })
    .catch(err => {
      console.error(err);
      btn.disabled = false;
      btn.innerHTML = originalText;
      showToast('Connection error. Please try again.', 'error');
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 8. EMPLOYEE: TODAY'S TASKS (Features #6, #7, #8)
// ═══════════════════════════════════════════════════════════════════════════

function showTodayTasks() {
  const content = document.getElementById('content');
  
  let html = `
    <h2><i class="fas fa-tasks"></i> Today's Tasks</h2>
    <div class="filter-section">
      <input type="text" id="todayTaskSearch" class="search-box" placeholder="Search by Case ID, Pincode, Address..." style="flex: 1; max-width: 500px;">
      <button class="btn btn-warning btn-sm" onclick="sortByNearest()">
        <i class="fas fa-location-arrow"></i> Sort by Nearest
      </button>
      <button class="btn btn-success btn-sm" onclick="sortByPincode()">
        <i class="fas fa-map-pin"></i> Sort by Pincode
      </button>
      <button class="btn btn-info btn-sm" onclick="loadTodayTasks()">
        <i class="fas fa-sync"></i> Refresh
      </button>
    </div>
    <div id="todayTasksList">
      <div class="loading-spinner show"><i class="fas fa-spinner"></i> Loading your tasks...</div>
    </div>
  `;
  
  content.innerHTML = html;
  
  document.getElementById('todayTaskSearch').addEventListener('input', searchTodayTasks);
  loadTodayTasks();
}

function loadTodayTasks(searchTerm) {
  // Use employeeId filter for security
  const url = `/api/tasks?role=employee&status=Pending&employeeId=${currentUser.id}` + (searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '');
  
  fetch(url)
    .then(res => res.json())
    .then(tasks => {
      allEmployeeTasks = Array.isArray(tasks) ? tasks : [];
      
      // Persist "Nearest" sort if active
      if (isNearestSortActive && savedEmployeeLocation) {
        allEmployeeTasks = reapplyDistanceSorting(allEmployeeTasks, savedEmployeeLocation.latitude, savedEmployeeLocation.longitude);
      }
      
      displayEmployeeTasks(allEmployeeTasks);
    })
    .catch(err => {
      console.error('Error loading tasks:', err);
      document.getElementById('todayTasksList').innerHTML = '<div class="empty-state"><h3>Error Loading Tasks</h3></div>';
    });
}

function displayEmployeeTasks(tasks) {
  const list = document.getElementById('todayTasksList');
  
  if (tasks.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-check-circle"></i>
        <h3>All Clear!</h3>
        <p>No tasks assigned for today.</p>
      </div>`;
    return;
  }

  let html = `<p style="color:#e5e7eb; font-size:13px; margin-bottom:14px;"><i class="fas fa-info-circle"></i> You have ${tasks.length} task(s) for today</p>`;
  
  tasks.forEach(task => {
    const statusClass = 'status-' + task.status.toLowerCase().replace(/ /g, '-');
    // Escape the task object for the onclick handler
    const taskJson = JSON.stringify(task).replace(/'/g, "&apos;").replace(/"/g, "&quot;");

    html += `
      <div class="panel" style="margin-bottom:10px; cursor:pointer;" onclick='openTaskPanel(${taskJson})'>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3 style="margin:0; font-size:15px; color:#e5e7eb;"><i class="fas fa-clipboard-list" style="color:#818cf8"></i> ${escapeHtml(task.title)}</h3>
          <span class="status-badge ${statusClass}">${escapeHtml(task.status)}</span>
        </div>
                <div style="margin-top:8px; display:flex; justify-content:space-between; align-items:center; color:#9ca3af; font-size:12px;">
          <span><i class="fas fa-map-pin"></i> ${escapeHtml(task.pincode || 'N/A')}</span>
          <span style="color:#60a5fa">Tap for details <i class="fas fa-chevron-right" style="font-size:10px"></i></span>
        </div>
        <button onclick="event.stopPropagation(); openStatusUpdateModal(${task.id}, '${task.status}')" style="width:100%;margin-top:8px;padding:8px;background:#10B981;color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:bold">
          <i class="fas fa-sync-alt"></i> Update Status
        </button>
      </div>
    `;
  });
  
  list.innerHTML = html;
}

function searchTodayTasks() {
  const term = document.getElementById('todayTaskSearch').value.toLowerCase();
  const filtered = allEmployeeTasks.filter(t => 
    t.title.toLowerCase().includes(term) || 
    (t.pincode || '').includes(term) || 
    (t.address || '').toLowerCase().includes(term)
  );
  displayEmployeeTasks(filtered);
}

// ═══════════════════════════════════════════════════════════════════════════
// 9. INTERACTIVE TASK PANEL & ACTIONS
// ═══════════════════════════════════════════════════════════════════════════

function openTaskPanel(task) {
  const panel = document.getElementById('taskDetailsPanel');
  const overlay = document.getElementById('panelOverlay');
  const content = document.getElementById('panelContent');
  const mapLink = task.mapurl || task.map_url || task.mapUrl || '';

  let html = `
    <h2 style="margin-top:0; font-size:18px; color:#111827">${escapeHtml(task.title)}</h2>
    <p style="color:#6b7280; font-size:13px; margin-bottom:15px">${escapeHtml(task.clientName || 'Unknown Client')}</p>
    
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px">
      <div style="background:#f3f4f6; padding:12px; border-radius:12px"><strong>Pincode</strong><br>${escapeHtml(task.pincode)}</div>
      <div style="background:#f3f4f6; padding:12px; border-radius:12px"><strong>Status</strong><br>${escapeHtml(task.status)}</div>
    </div>
  `;

  if (mapLink) {
    html += `<a href="${mapLink}" target="_blank" class="btn btn-primary" style="display:flex; width:100%; justify-content:center; padding:14px; margin-bottom:12px;"><i class="fas fa-location-arrow"></i> Navigate to Location</a>`;
  }

  html += `
    <div style="background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:15px; margin-top:15px">
      <label style="font-size:12px; color:#6b7280; display:block; margin-bottom:8px">UPDATE STATUS</label>
      <div style="display:flex; gap:10px">
        <select id="panel-status-${task.id}" style="flex:1; padding:10px; border-radius:8px; border:1px solid #d1d5db; color:#333;">
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Verified">Verified</option>
          <option value="Left Job">Left Job</option>
          <option value="Not Picking">Not Picking</option>
        </select>
        <button class="btn btn-primary" onclick="updateTaskStatus(${task.id})">Update</button>
      </div>
    </div>
  `;

  content.innerHTML = html;
  setTimeout(() => { document.getElementById(`panel-status-${task.id}`).value = task.status; }, 50);
  
  panel.classList.add('active');
  overlay.classList.add('active');
}

function closeTaskPanel() {
  document.getElementById('taskDetailsPanel').classList.remove('active');
  document.getElementById('panelOverlay').classList.remove('active');
}

function updateTaskStatus(taskId) {
  const select = document.getElementById(`panel-status-${taskId}`);
  const newStatus = select.value;
  
  if (newStatus === 'Pending' && !confirm('Status is Pending. Are you sure you are done?')) return;
  if (newStatus !== 'Pending' && !confirm(`Change status to "${newStatus}"?`)) return;

  const btn = select.nextElementSibling;
  btn.disabled = true;
  btn.innerHTML = '...';

  // Helper to send update
  const sendUpdate = (coords = {}) => {
    fetch(`/api/tasks/${taskId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: newStatus,
        userId: currentUser.id,
        userName: currentUser.name,
        ...coords
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast(`Status updated to ${newStatus}`, 'success');
        closeTaskPanel();
        loadTodayTasks();
      } else {
        showToast('Update failed', 'error');
        btn.disabled = false;
        btn.innerHTML = 'Update';
      }
    });
  };

  // Capture GPS if completing
  if (newStatus === 'Completed' && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => sendUpdate({ completedLat: pos.coords.latitude, completedLng: pos.coords.longitude }),
      err => { console.warn(err); sendUpdate(); },
      { timeout: 5000 }
    );
  } else {
    sendUpdate();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 10. SMART ROUTING & SORTING
// ═══════════════════════════════════════════════════════════════════════════

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

function reapplyDistanceSorting(tasks, userLat, userLng) {
  // Enrich with coordinates (MapURL > Pincode > Null)
  let pool = tasks.map(t => {
    let lat = parseFloat(t.latitude), lng = parseFloat(t.longitude);
    if ((isNaN(lat) || lat === 0) && t.pincode && pincodeData[t.pincode]) {
      lat = pincodeData[t.pincode].lat;
      lng = pincodeData[t.pincode].lng;
    }
    return { ...t, _lat: lat, _lng: lng };
  });

  const valid = pool.filter(t => !isNaN(t._lat) && !isNaN(t._lng));
  const invalid = pool.filter(t => isNaN(t._lat) || isNaN(t._lng));
  
  // Greedy Nearest Neighbor
  let sorted = [], currLat = userLat, currLng = userLng;
  while (valid.length > 0) {
    let nearestIdx = -1, minDst = Infinity;
    for(let i=0; i<valid.length; i++) {
      const dst = calculateDistance(currLat, currLng, valid[i]._lat, valid[i]._lng);
      if(dst < minDst) { minDst = dst; nearestIdx = i; }
    }
    if (nearestIdx !== -1) {
      sorted.push(valid[nearestIdx]);
      currLat = valid[nearestIdx]._lat;
      currLng = valid[nearestIdx]._lng;
      valid.splice(nearestIdx, 1);
    }
  }
  return [...sorted, ...invalid];
}

function sortByNearest() {
  if (!navigator.geolocation) return showToast('Geolocation not supported', 'error');
  showToast('Acquiring GPS...', 'info');
  
  navigator.geolocation.getCurrentPosition(pos => {
    savedEmployeeLocation = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
    isNearestSortActive = true;
    allEmployeeTasks = reapplyDistanceSorting(allEmployeeTasks, pos.coords.latitude, pos.coords.longitude);
    displayEmployeeTasks(allEmployeeTasks);
    showToast('Route optimized!', 'success');
  }, err => showToast('Location access denied', 'error'));
}

function sortByPincode() {
  isNearestSortActive = false;
  savedEmployeeLocation = null;
  allEmployeeTasks.sort((a, b) => (a.pincode || '999999').localeCompare(b.pincode || '999999'));
  displayEmployeeTasks(allEmployeeTasks);
  showToast('Grouped by Pincode', 'success');
}

// ═══════════════════════════════════════════════════════════════════════════
// 11. EMPLOYEE: HISTORY
// ═══════════════════════════════════════════════════════════════════════════

function showTaskHistory() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <h2><i class="fas fa-history"></i> Task History</h2>
    <div class="filter-section">
      <button class="btn btn-info btn-sm" onclick="loadTaskHistory()"><i class="fas fa-sync"></i> Refresh</button>
    </div>
    <div id="historyList"><div class="loading-spinner show">Loading...</div></div>
  `;
  loadTaskHistory();
}

function loadTaskHistory() {
  fetch(`/api/tasks?role=employee&employeeId=${currentUser.id}`)
    .then(res => res.json())
    .then(tasks => {
      const completed = tasks.filter(t => t.status === 'Completed' || t.status === 'Verified');
      const list = document.getElementById('historyList');
      if (completed.length === 0) {
        list.innerHTML = '<div class="empty-state"><h3>No History</h3></div>';
        return;
      }
      
      let html = '<table class="table"><thead><tr><th>Case ID</th><th>Client</th><th>Status</th><th>Date</th></tr></thead><tbody>';
      completed.forEach(t => {
        html += `<tr>
          <td><strong>${escapeHtml(t.title)}</strong></td>
          <td>${escapeHtml(t.clientName)}</td>
          <td><span class="status-badge status-${t.status.toLowerCase()}">${t.status}</span></td>
          <td>${escapeHtml(t.assigned_date || 'N/A')}</td>
        </tr>`;
      });
      html += '</tbody></table>';
      list.innerHTML = html;
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// 12. ADMIN: VIEW ALL TASKS (Features #5 & #6)
// ═══════════════════════════════════════════════════════════════════════════

function showAllTasks() {
  const content = document.getElementById('content');
  
  let html = `
    <h2><i class="fas fa-list"></i> All Tasks</h2>
    <div class="filter-section">
      <select id="allTasksStatusFilter" class="search-box" style="flex:0 0 150px;">
        <option value="all">Status: All</option>
        <option value="Unassigned">Unassigned</option>
        <option value="Pending">Pending</option>
        <option value="Completed">Completed</option>
        <option value="Verified">Verified</option>
        <option value="Left Job">Left Job</option>
        <option value="Not Picking">Not Picking</option>
        <option value="Switch Off">Switch Off</option>
        <option value="Wrong Address">Wrong Address</option>
      </select>

      <select id="allTasksEmployeeFilter" class="search-box" style="flex:0 0 200px;">
        <option value="all">Employee: All</option>
      </select>

      <input type="text" id="allTasksPincodeFilter" class="search-box" maxlength="6" placeholder="Filter by Pincode" style="flex:0 0 160px;">
      
      <input type="date" id="allTasksFromDate" class="search-box" style="flex:0 0 150px;">
      <input type="date" id="allTasksToDate" class="search-box" style="flex:0 0 150px;">

      <input type="text" id="allTasksSearch" class="search-box" placeholder="Search Case ID, notes..." style="flex:1 1 220px; max-width:360px;">

      <button class="btn btn-info btn-sm" onclick="loadAllTasks()"><i class="fas fa-filter"></i> Apply</button>
      <button class="btn btn-secondary btn-sm" onclick="resetAllTaskFilters()"><i class="fas fa-undo"></i> Reset</button>
    </div>

    <div id="allTasksActiveFilters" class="active-filters">
      <span class="filter-hint">No filters applied. Showing latest tasks.</span>
    </div>

    <div id="allTasksList">
      <div class="loading-spinner show"><i class="fas fa-spinner"></i> Loading all tasks...</div>
    </div>
  `;

  content.innerHTML = html;

  // Load Employees for Filter
  fetch('/api/users').then(r => r.json()).then(users => {
    const select = document.getElementById('allTasksEmployeeFilter');
    if (select) {
      users.forEach(u => {
        select.innerHTML += `<option value="${u.id}">${escapeHtml(u.name)}</option>`;
      });
    }
  });

  // Enter key listener
  document.getElementById('allTasksSearch').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loadAllTasks();
  });

  loadAllTasks();
}

function loadAllTasks() {
  const status = document.getElementById('allTasksStatusFilter').value;
  const empId = document.getElementById('allTasksEmployeeFilter').value;
  const pincode = document.getElementById('allTasksPincodeFilter').value.trim();
  const search = document.getElementById('allTasksSearch').value.trim();

  let url = `/api/tasks?role=admin`;
  if (status !== 'all') url += `&status=${encodeURIComponent(status)}`;
  if (empId !== 'all') url += `&employeeId=${encodeURIComponent(empId)}`;
  if (pincode) url += `&pincode=${encodeURIComponent(pincode)}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;

  fetch(url)
    .then(res => res.json())
    .then(tasks => {
      allAdminTasks = Array.isArray(tasks) ? tasks : [];
      const filtered = applyDateFilter(allAdminTasks); // Client-side date filter
      updateFilterChips();
      displayAllTasksList(filtered);
    })
    .catch(err => {
      console.error(err);
      document.getElementById('allTasksList').innerHTML = '<div class="empty-state"><h3>Error Loading Tasks</h3></div>';
    });
}

function applyDateFilter(tasks) {
  const fromVal = document.getElementById('allTasksFromDate').value;
  const toVal = document.getElementById('allTasksToDate').value;
  if (!fromVal && !toVal) return tasks;

  const fromDate = fromVal ? new Date(fromVal + 'T00:00:00') : null;
  const toDate = toVal ? new Date(toVal + 'T23:59:59') : null;

  return tasks.filter(t => {
    const d = new Date(t.assigned_date || t.assignedDate || t.created_at);
    if (fromDate && d < fromDate) return false;
    if (toDate && d > toDate) return false;
    return true;
  });
}

function resetAllTaskFilters() {
  document.getElementById('allTasksStatusFilter').value = 'all';
  document.getElementById('allTasksEmployeeFilter').value = 'all';
  document.getElementById('allTasksPincodeFilter').value = '';
  document.getElementById('allTasksFromDate').value = '';
  document.getElementById('allTasksToDate').value = '';
  document.getElementById('allTasksSearch').value = '';
  loadAllTasks();
}

function updateFilterChips() {
  const container = document.getElementById('allTasksActiveFilters');
  const chips = [];
  
  const status = document.getElementById('allTasksStatusFilter').value;
  if(status !== 'all') chips.push(`Status: ${status}`);
  
  const search = document.getElementById('allTasksSearch').value;
  if(search) chips.push(`Search: ${search}`);

  if (chips.length === 0) {
    container.innerHTML = '<span class="filter-hint">No filters applied.</span>';
  } else {
    container.innerHTML = chips.map(c => `<span class="filter-chip"><i class="fas fa-tag"></i> ${escapeHtml(c)}</span>`).join('');
  }
}

function displayAllTasksList(tasks) {
  const list = document.getElementById('allTasksList');
  if (tasks.length === 0) {
    list.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><h3>No Tasks Found</h3></div>';
    return;
  }

  let html = `<p style="color:#e5e7eb; font-size:13px; margin-bottom:14px;"><i class="fas fa-info-circle"></i> Found ${tasks.length} tasks</p>`;
  html += '<table class="table"><thead><tr><th><input type="checkbox" id="selectAllTasks" onchange="toggleSelectAll(this)" title="Select all"></th><th>Case ID</th><th>Client</th><th>Employee</th><th>Pincode</th><th>Status</th><th>Actions</th></tr></thead><tbody>';


  tasks.forEach(t => {
    const statusClass = 'status-' + t.status.toLowerCase().replace(/ /g, '-');
    const assignedTo = t.assignedToName || '<span style="color:#9ca3af;font-style:italic">Unassigned</span>';
    
        html += `<tr>
      <td><input type="checkbox" class="taskCheckbox" value="${t.id}" onchange="updateBulkActions()"></td>
      <td><strong>${escapeHtml(t.title)}</strong></td>
      <td>${escapeHtml(t.clientName)}</td>
      <td>${assignedTo}</td>
      <td><span class="pincode-highlight">${escapeHtml(t.pincode)}</span></td>
      <td><span class="status-badge ${statusClass}">${escapeHtml(t.status)}</span></td>
      <td>
        <div class="action-buttons" style="display:flex; gap:5px;">
          <button class="btn btn-warning btn-sm" onclick="openReassignModal(${t.id})" title="Reassign"><i class="fas fa-sync-alt"></i></button>
          <button class="btn btn-secondary btn-sm" onclick="openUnassignModal(${t.id}, '${escapeHtml(t.title).replace(/'/g, "\\'")}', '${escapeHtml(t.clientName)}')" title="Unassign"><i class="fas fa-times"></i></button>
          <button class="btn btn-danger btn-sm" onclick="deleteTask(${t.id})" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`;
  });
  html += '</tbody></table>';
    // Bulk action panel
  html += `
    <div id="bulkActions" style="display:none;margin-top:20px;padding:15px;background:#F3F4F6;border-radius:10px;border:2px solid #E5E7EB">
      <span style="font-weight:bold;color:#374151">
        <i class="fas fa-check-square"></i> 
        <span id="selectedCount">0</span> task(s) selected
      </span>
      <button onclick="bulkAssignTasks()" style="margin-left:15px;padding:8px 15px;background:#3B82F6;color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px">
        <i class="fas fa-user-plus"></i> Bulk Assign
      </button>
      <button onclick="bulkDeleteTasks()" style="margin-left:10px;padding:8px 15px;background:#EF4444;color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px">
        <i class="fas fa-trash"></i> Bulk Delete
      </button>
      <button onclick="clearSelection()" style="margin-left:10px;padding:8px 15px;background:#6B7280;color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px">
        <i class="fas fa-times"></i> Clear
      </button>
    </div>
  `;
  list.innerHTML = html;
}

// ═══════════════════════════════════════════════════════════════════════════
// 13. ADMIN: UNASSIGNED TASKS POOL (Feature #4)
// ═══════════════════════════════════════════════════════════════════════════

function showUnassignedTasks() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <h2><i class="fas fa-inbox"></i> Unassigned Tasks Pool</h2>
    <div class="filter-section">
      <input type="text" id="unassignedSearch" class="search-box" placeholder="Search by Case ID or Pincode..." style="max-width: 400px;">
      <button class="btn btn-info btn-sm" onclick="loadUnassignedTasks()"><i class="fas fa-search"></i> Search</button>
    </div>
    <div id="unassignedTasksList">
      <div class="loading-spinner show"><i class="fas fa-spinner"></i> Loading...</div>
    </div>
  `;
  
  document.getElementById('unassignedSearch').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loadUnassignedTasks();
  });
  
  loadUnassignedTasks();
}

function loadUnassignedTasks() {
  const term = document.getElementById('unassignedSearch') ? document.getElementById('unassignedSearch').value : '';
  const url = `/api/tasks/unassigned` + (term ? `?search=${encodeURIComponent(term)}` : '');

  fetch(url)
    .then(res => res.json())
    .then(tasks => {
      allUnassignedTasks = tasks;
      fetch('/api/users').then(r => r.json()).then(employees => {
        displayUnassignedList(tasks, employees);
      });
    })
    .catch(err => {
      console.error(err);
      showToast('Failed to load tasks', 'error');
    });
}

function displayUnassignedList(tasks, employees) {
  const list = document.getElementById('unassignedTasksList');
  if (tasks.length === 0) {
    list.innerHTML = '<div class="empty-state"><i class="fas fa-check-circle"></i><h3>All Clear!</h3><p>No unassigned tasks.</p></div>';
    return;
  }

  let html = `<p style="color:#e5e7eb; margin-bottom:14px;">Found ${tasks.length} unassigned task(s)</p>`;
  html += '<table class="table"><thead><tr><th>Case ID</th><th>Pincode</th><th>Map URL</th><th>Actions</th></tr></thead><tbody>';

  tasks.forEach(t => {
    const mapLink = t.mapUrl || t.map_url ? `<a href="${t.mapUrl || t.map_url}" target="_blank" style="color:#3b82f6;">View Map</a>` : '<span style="color:#9ca3af;">No map</span>';
    
    // Employee Dropdown for Quick Assign
    let empOptions = '<option value="">Select Employee</option>';
    employees.forEach(e => { empOptions += `<option value="${e.id}">${escapeHtml(e.name)}</option>`; });

    html += `<tr>
      <td><strong>${escapeHtml(t.title)}</strong><br><small style="color:#9ca3af">${escapeHtml(t.clientName)}</small></td>
      <td><span class="pincode-highlight">${escapeHtml(t.pincode)}</span></td>
      <td>${mapLink} <button class="btn btn-secondary btn-sm" onclick="showEditMapModal(${t.id})"><i class="fas fa-pen"></i></button></td>
      <td style="display:flex; gap:8px;">
        <select id="emp-${t.id}" style="padding:8px; border-radius:8px;">${empOptions}</select>
        <button class="btn btn-success btn-sm" onclick="assignTaskToEmployee(${t.id})"><i class="fas fa-user-check"></i> Assign</button>
      </td>
    </tr>`;
  });
  html += '</tbody></table>';
  list.innerHTML = html;
}

function assignTaskToEmployee(taskId) {
  const empId = document.getElementById(`emp-${taskId}`).value;
  if (!empId) return showToast('Please select an employee', 'error');

  fetch(`/api/tasks/${taskId}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId: parseInt(empId), adminId: currentUser.id, adminName: currentUser.name })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      showToast('Task assigned successfully!', 'success');
      loadUnassignedTasks();
    } else {
      showToast(data.message, 'error');
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 14. ADMIN: EMPLOYEE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

function showEmployees() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
      <h2><i class="fas fa-users"></i> Employees</h2>
      <button class="btn btn-primary" onclick="showAddEmployee()"><i class="fas fa-user-plus"></i> Add Employee</button>
    </div>
    <div id="employeesList"><div class="loading-spinner show">Loading...</div></div>
  `;

  fetch('/api/users')
    .then(res => res.json())
    .then(users => {
      allEmployees = users;
      const list = document.getElementById('employeesList');
      if (users.length === 0) {
        list.innerHTML = '<div class="empty-state"><h3>No Employees Yet</h3></div>';
        return;
      }

      let html = '<table class="table"><thead><tr><th>Name</th><th>ID</th><th>Email</th><th>Phone</th><th>Actions</th></tr></thead><tbody>';
      users.forEach(u => {
        html += `<tr>
          <td><strong>${escapeHtml(u.name)}</strong></td>
          <td>${escapeHtml(u.employeeId)}</td>
          <td>${escapeHtml(u.email)}</td>
          <td>${escapeHtml(u.phone)}</td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="showEditEmployeeModal(${u.id})"><i class="fas fa-edit"></i></button>
            <button class="btn btn-warning btn-sm" onclick="openResetPasswordModal(${u.id}, '${escapeHtml(u.email)}')"><i class="fas fa-key"></i></button>
            <button class="btn btn-danger btn-sm" onclick="deleteEmployeePrompt(${u.id}, '${escapeHtml(u.name)}')"><i class="fas fa-trash"></i></button>
          </td>
        </tr>`;
      });
      html += '</tbody></table>';
      list.innerHTML = html;
    });
}

function showAddEmployee() {
  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.innerHTML = `
    <div class="modal-content">
      <h2><i class="fas fa-user-plus"></i> Add Employee</h2>
      <form id="addEmpForm">
        <div class="form-group"><label>Name</label><input type="text" id="newEmpName" required></div>
        <div class="form-group"><label>Employee ID</label><input type="text" id="newEmpId" required></div>
        <div class="form-group"><label>Email</label><input type="email" id="newEmpEmail" required></div>
        <div class="form-group"><label>Phone</label><input type="tel" id="newEmpPhone"></div>
        <div class="form-group"><label>Password</label><input type="password" id="newEmpPass" value="123456" required></div>
        <div style="display:flex; gap:10px; margin-top:20px;">
          <button type="submit" class="btn btn-primary">Create</button>
          <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
        </div>
      </form>
    </div>`;
  document.body.appendChild(modal);

  document.getElementById('addEmpForm').addEventListener('submit', (e) => {
    e.preventDefault();
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: document.getElementById('newEmpName').value,
        employeeId: document.getElementById('newEmpId').value,
        email: document.getElementById('newEmpEmail').value,
        phone: document.getElementById('newEmpPhone').value,
        password: document.getElementById('newEmpPass').value
      })
    }).then(res => res.json()).then(data => {
      if(data.success) { showToast('Employee created!', 'success'); modal.remove(); showEmployees(); }
      else { showToast(data.message, 'error'); }
    });
  });
}

function deleteEmployeePrompt(id, name) {
  if (!confirm(`⚠️ DELETE EMPLOYEE: ${name}\n\nThis is permanent. Continue?`)) return;
  const pass = prompt('🔐 ADMIN PASSWORD REQUIRED:');
  if (!pass) return;

  fetch(`/api/users/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminPassword: pass })
  }).then(res => res.json()).then(data => {
    if(data.success) { showToast('Employee deleted', 'success'); showEmployees(); }
    else { showToast(data.message, 'error'); }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 15. UTILITY MODALS: REASSIGN, EDIT MAP, EDIT EMPLOYEE
// ═══════════════════════════════════════════════════════════════════════════

function showReassignModal(taskId) {
  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.innerHTML = `
    <div class="modal-content">
      <h2><i class="fas fa-sync-alt"></i> Reassign Task</h2>
      <select id="reassignEmp" style="width:100%; padding:10px; margin:15px 0;">
        <option value="">Loading employees...</option>
      </select>
      <div style="display:flex; gap:10px; justify-content:flex-end;">
        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
        <button class="btn btn-primary" onclick="confirmReassign(${taskId})">Assign</button>
      </div>
    </div>`;
  document.body.appendChild(modal);

  fetch('/api/users').then(r => r.json()).then(users => {
    const sel = document.getElementById('reassignEmp');
    sel.innerHTML = '<option value="">Select Employee</option>';
    users.forEach(u => {
      sel.innerHTML += `<option value="${u.id}">${escapeHtml(u.name)}</option>`;
    });
  });
}

function confirmReassign(taskId) {
  const empId = document.getElementById('reassignEmp').value;
  if (!empId) return showToast('Select an employee', 'error');

  fetch(`/api/tasks/${taskId}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId: parseInt(empId), adminId: currentUser.id, adminName: currentUser.name })
  }).then(res => res.json()).then(data => {
    if(data.success) {
      showToast('Task reassigned!', 'success');
      document.querySelector('.modal').remove();
      // Refresh current view
      if(document.getElementById('allTasksList')) loadAllTasks();
    }
  });
}

function showEditMapModal(taskId) {
  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.innerHTML = `
    <div class="modal-content">
      <h2><i class="fas fa-map-marked-alt"></i> Edit Map Link</h2>
      <input type="url" id="newMapUrl" placeholder="Paste new Google Maps URL" style="width:100%; padding:10px; margin:15px 0;">
      <div style="display:flex; gap:10px; justify-content:flex-end;">
        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
        <button class="btn btn-primary" onclick="saveMapUrl(${taskId})">Save</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

function saveMapUrl(taskId) {
  const url = document.getElementById('newMapUrl').value;
  fetch(`/api/tasks/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mapUrl: url, userId: currentUser.id, userName: currentUser.name })
  }).then(res => res.json()).then(data => {
    if(data.success) {
      showToast('Map URL updated', 'success');
      document.querySelector('.modal').remove();
      if(document.getElementById('unassignedTasksList')) loadUnassignedTasks();
      if(document.getElementById('allTasksList')) loadAllTasks();
    }
  });
}

function unassignTask(taskId) {
  if(!confirm('Unassign this task? It will return to the Unassigned Pool.')) return;
  fetch(`/api/tasks/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assignedTo: null, status: 'Unassigned', userId: currentUser.id, userName: currentUser.name })
  }).then(res => res.json()).then(data => {
    if(data.success) { showToast('Task unassigned', 'success'); loadAllTasks(); }
  });
}

function deleteTask(taskId) {
  if(!confirm('Delete this task permanently?')) return;
  fetch(`/api/tasks/${taskId}?adminId=${currentUser.id}&adminName=${currentUser.name}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(data => {
      if(data.success) { showToast('Task deleted', 'success'); loadAllTasks(); }
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// 16. BULK UPLOAD MODAL (Feature #3)
// ═══════════════════════════════════════════════════════════════════════════

function showBulkUpload() {
  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.innerHTML = `
    <div class="modal-content">
      <h2><i class="fas fa-file-upload"></i> Bulk Upload Tasks</h2>
      <p style="color:#666; font-size:13px; margin-bottom:15px;">
        Upload an Excel file (.xlsx) with columns: <strong>CaseID, Pincode, ClientName, MapURL, Notes</strong>.
      </p>
      
      <form id="bulkForm">
        <input type="file" id="excelFile" accept=".xlsx, .xls, .csv" required style="margin-bottom:15px;">
        <div class="progress-bar"><div class="progress-fill" style="width:0%"></div></div>
        
        <div style="display:flex; gap:10px; margin-top:15px;">
          <button type="submit" class="btn btn-success">Upload</button>
          <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
        </div>
      </form>
    </div>`;
  document.body.appendChild(modal);

  document.getElementById('bulkForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData();
    const file = document.getElementById('excelFile').files[0];
    formData.append('excelFile', file);
    formData.append('adminId', currentUser.id);
    formData.append('adminName', currentUser.name);

    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = 'Uploading...';

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/tasks/bulk-upload', true);
    
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = (e.loaded / e.total) * 100;
        document.querySelector('.progress-fill').style.width = percent + '%';
      }
    };

    xhr.onload = function() {
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText);
        showToast(res.message, 'success');
        modal.remove();
        showUnassignedTasks(); // Redirect to pool
      } else {
        showToast('Upload failed', 'error');
        btn.disabled = false;
        btn.innerHTML = 'Upload';
      }
    };

    xhr.send(formData);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 17. EDIT EMPLOYEE & PASSWORD RESET
// ═══════════════════════════════════════════════════════════════════════════

function showEditEmployeeModal(empId) {
  // Find employee data
  const emp = allEmployees.find(u => u.id === empId);
  if (!emp) return;

  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.innerHTML = `
    <div class="modal-content">
      <h2><i class="fas fa-user-edit"></i> Edit Employee</h2>
      <form id="editEmpForm">
        <div class="form-group"><label>Name</label><input type="text" id="editName" value="${escapeHtml(emp.name)}" required></div>
        <div class="form-group"><label>Employee ID</label><input type="text" id="editEmpId" value="${escapeHtml(emp.employeeId)}" required></div>
        <div class="form-group"><label>Email</label><input type="email" id="editEmail" value="${escapeHtml(emp.email)}" required></div>
        <div class="form-group"><label>Phone</label><input type="tel" id="editPhone" value="${escapeHtml(emp.phone || '')}"></div>
        <button type="submit" class="btn btn-primary" style="margin-top:15px; width:100%">Save Changes</button>
      </form>
      <button class="btn btn-secondary" onclick="this.closest('.modal').remove()" style="margin-top:10px; width:100%">Cancel</button>
    </div>`;
  document.body.appendChild(modal);

  document.getElementById('editEmpForm').addEventListener('submit', (e) => {
    e.preventDefault();
    fetch(`/api/users/${empId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: document.getElementById('editName').value,
        employeeId: document.getElementById('editEmpId').value,
        email: document.getElementById('editEmail').value,
        phone: document.getElementById('editPhone').value,
        adminId: currentUser.id,
        adminName: currentUser.name
      })
    }).then(res => res.json()).then(data => {
      if(data.success) { showToast('Employee updated', 'success'); modal.remove(); showEmployees(); }
    });
  });
}

function openResetPasswordModal(userId, email) {
  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.innerHTML = `
    <div class="modal-content">
      <h2><i class="fas fa-key"></i> Reset Password</h2>
      <p>Reset password for <strong>${escapeHtml(email)}</strong>?</p>
      <div class="form-group">
        <label>New Password (Optional)</label>
        <input type="text" id="newPassInput" placeholder="Leave blank for auto-generated">
      </div>
      <div style="display:flex; gap:10px; margin-top:20px;">
        <button class="btn btn-warning" onclick="confirmResetPassword(${userId})">Reset Password</button>
        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

function confirmResetPassword(userId) {
  const newPass = document.getElementById('newPassInput').value;
  fetch(`/api/users/${userId}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      newPassword: newPass,
      adminId: currentUser.id,
      adminName: currentUser.name
    })
  }).then(res => res.json()).then(data => {
    if(data.success) {
      alert(`Password Reset Successful!\n\nNew Password: ${data.tempPassword}`);
      document.querySelector('.modal').remove();
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 18. ANALYTICS DASHBOARD (Feature #19)
// ═══════════════════════════════════════════════════════════════════════════

function showAnalyticsDashboard() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <h2><i class="fas fa-chart-pie"></i> Analytics Dashboard</h2>
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:15px; margin-bottom:30px;">
      <div class="panel" style="text-align:center;">
        <h3 id="statTotal" style="font-size:2rem; margin:0; color:#6366f1;">...</h3>
        <span style="color:#9ca3af; font-size:12px;">TOTAL TASKS</span>
      </div>
      <div class="panel" style="text-align:center;">
        <h3 id="statCompleted" style="font-size:2rem; margin:0; color:#10b981;">...</h3>
        <span style="color:#9ca3af; font-size:12px;">COMPLETED</span>
      </div>
      <div class="panel" style="text-align:center;">
        <h3 id="statPending" style="font-size:2rem; margin:0; color:#f59e0b;">...</h3>
        <span style="color:#9ca3af; font-size:12px;">PENDING</span>
      </div>
      <div class="panel" style="text-align:center;">
        <h3 id="statUnassigned" style="font-size:2rem; margin:0; color:#ef4444;">...</h3>
        <span style="color:#9ca3af; font-size:12px;">UNASSIGNED</span>
      </div>
    </div>
    
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
      <div class="panel">
        <h4 style="margin-top:0;">Task Distribution</h4>
        <canvas id="statusChart"></canvas>
      </div>
      <div class="panel">
        <h4 style="margin-top:0;">Employee Performance</h4>
        <canvas id="performanceChart"></canvas>
      </div>
    </div>
  `;

  fetch('/api/analytics').then(r => r.json()).then(data => {
    document.getElementById('statTotal').innerText = data.totalTasks || 0;
    document.getElementById('statCompleted').innerText = data.completedTasks || 0;
    document.getElementById('statPending').innerText = (data.assignedTasks || 0) - (data.completedTasks || 0);
    document.getElementById('statUnassigned').innerText = (data.totalTasks || 0) - (data.assignedTasks || 0);

    // Chart: Status Distribution
    new Chart(document.getElementById('statusChart'), {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'Pending', 'Unassigned', 'Verified'],
        datasets: [{
          data: [data.completedTasks, (data.assignedTasks - data.completedTasks), (data.totalTasks - data.assignedTasks), data.verifiedTasks],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
        }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });

    // Chart: Performance (Mock Data for Visuals, can be connected to real data later)
    new Chart(document.getElementById('performanceChart'), {
      type: 'bar',
      data: {
        labels: ['Tasks Done', 'Pending', 'Verified'],
        datasets: [{
          label: 'Count',
          data: [data.completedTasks, data.assignedTasks - data.completedTasks, data.verifiedTasks],
          backgroundColor: '#3b82f6'
        }]
      },
      options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
  });
}

function exportTasks() {
  window.open('/api/export?status=all&employeeId=all', '_blank');
}

// ═══════════════════════════════════════════════════════════════════════════
// 19. ACTIVITY LOG & DIGITAL KYC
// ═══════════════════════════════════════════════════════════════════════════

function showActivityLog() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <h2><i class="fas fa-history"></i> Activity Log</h2>
    <div id="activityLogList"><div class="loading-spinner show">Loading...</div></div>
  `;
  
  fetch('/api/activity-log').then(r => r.json()).then(logs => {
    const list = document.getElementById('activityLogList');
    if (logs.length === 0) {
      list.innerHTML = '<div class="empty-state"><h3>No Activity Found</h3></div>';
      return;
    }
    
    let html = '<table class="table"><thead><tr><th>Time</th><th>User</th><th>Action</th><th>Details</th></tr></thead><tbody>';
    logs.forEach(l => {
      html += `<tr>
        <td style="white-space:nowrap; color:#9ca3af; font-size:11px;">${new Date(l.timestamp).toLocaleString()}</td>
        <td><strong>${escapeHtml(l.userName)}</strong></td>
        <td><span class="status-badge status-pending">${escapeHtml(l.action)}</span></td>
        <td style="font-size:11px; color:#d1d5db;">${escapeHtml(typeof l.details === 'object' ? JSON.stringify(l.details) : l.details)}</td>
      </tr>`;
    });
    html += '</tbody></table>';
    list.innerHTML = html;
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// BULK SELECTION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════
function toggleSelectAll(checkbox) {
  const checkboxes = document.querySelectorAll('.taskCheckbox');
  checkboxes.forEach(cb => cb.checked = checkbox.checked);
  updateBulkActions();
}

function updateBulkActions() {
  const selected = document.querySelectorAll('.taskCheckbox:checked');
  const bulkDiv = document.getElementById('bulkActions');
  const countSpan = document.getElementById('selectedCount');
  
  if (selected.length > 0) {
    bulkDiv.style.display = 'block';
    countSpan.textContent = selected.length;
  } else {
    bulkDiv.style.display = 'none';
  }
}

function clearSelection() {
  const checkboxes = document.querySelectorAll('.taskCheckbox');
  checkboxes.forEach(cb => cb.checked = false);
  const selectAll = document.getElementById('selectAllTasks');
  if (selectAll) selectAll.checked = false;
  updateBulkActions();
}

// ═══════════════════════════════════════════════════════════════════════════
// REASSIGN TASK MODAL
// ═══════════════════════════════════════════════════════════════════════════
async function openReassignModal(taskId) {
  try {
    const response = await fetch('/api/users');
    const employees = await response.json();
    
    if (employees.length === 0) {
      showToast('No employees available', 'warning');
      return;
    }
    
    let employeeOptions = '';
    employees.forEach(emp => {
      employeeOptions += `<option value="${emp.id}">${emp.name} (${emp.employeeId || emp.employee_id})</option>`;
    });
    
    const modalHtml = `
      <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center" id="reassignModal" onclick="if(event.target.id==='reassignModal') document.getElementById('reassignModal').remove()">
        <div style="background:white;padding:30px;border-radius:15px;max-width:400px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.3)" onclick="event.stopPropagation()">
          <h3 style="margin-top:0;color:#1F2937"><i class="fas fa-exchange-alt"></i> Reassign Task</h3>
          <label style="display:block;margin-bottom:5px;font-weight:bold;color:#374151">Select New Employee:</label>
          <select id="newEmployeeSelect" style="width:100%;padding:12px;border:2px solid #E5E7EB;border-radius:8px;margin-bottom:20px;font-size:14px">
            ${employeeOptions}
          </select>
          <div style="display:flex;gap:10px">
            <button onclick="confirmReassign(${taskId})" style="flex:1;padding:12px;background:#3B82F6;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold">
              <i class="fas fa-check"></i> Reassign
            </button>
            <button onclick="document.getElementById('reassignModal').remove()" style="flex:1;padding:12px;background:#6B7280;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold">
              <i class="fas fa-times"></i> Cancel
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  } catch (err) {
    showToast('Failed to load employees', 'error');
  }
}

async function confirmReassign(taskId) {
  const newEmployeeId = document.getElementById('newEmployeeSelect').value;
  
  try {
    const response = await fetch(`/api/tasks/${taskId}/reassign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        newEmployeeId: parseInt(newEmployeeId),
        userId: currentUser.id,
        userName: currentUser.name
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      showToast(result.message, 'success');
      document.getElementById('reassignModal').remove();
      // Refresh the task list
      if (typeof loadAllTasks === 'function') loadAllTasks();
      if (typeof fetchAndDisplayTasks === 'function') fetchAndDisplayTasks();
    } else {
      showToast(result.message || 'Reassignment failed', 'error');
    }
  } catch (err) {
    showToast('Error reassigning task', 'error');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// UNASSIGN TASK MODAL
// ═══════════════════════════════════════════════════════════════════════════
function openUnassignModal(taskId, taskTitle, clientName) {
  const displayTitle = taskTitle || 'this task';
  const displayClient = clientName ? ` (${clientName})` : '';
  
  const modalHtml = `
    <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center" id="unassignModal" onclick="if(event.target.id==='unassignModal') document.getElementById('unassignModal').remove()">
      <div style="background:white;padding:30px;border-radius:15px;max-width:400px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.3)" onclick="event.stopPropagation()">
        <h3 style="margin-top:0;color:#DC2626"><i class="fas fa-user-slash"></i> Unassign Task</h3>
        <p style="color:#374151;line-height:1.6">
          Move task <strong>"${escapeHtml(displayTitle)}"</strong>${escapeHtml(displayClient)} back to the unassigned pool?
        </p>
        <div style="display:flex;gap:10px;margin-top:20px">
          <button onclick="confirmUnassign(${taskId})" style="flex:1;padding:12px;background:#F59E0B;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold">
            <i class="fas fa-check"></i> Unassign
          </button>
          <button onclick="document.getElementById('unassignModal').remove()" style="flex:1;padding:12px;background:#6B7280;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold">
            <i class="fas fa-times"></i> Cancel
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

async function confirmUnassign(taskId) {
  try {
    const response = await fetch(`/api/tasks/${taskId}/unassign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id,
        userName: currentUser.name
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      showToast(result.message, 'success');
      document.getElementById('unassignModal').remove();
      // Refresh the task list
      if (typeof loadAllTasks === 'function') loadAllTasks();
      if (typeof fetchAndDisplayTasks === 'function') fetchAndDisplayTasks();
    } else {
      showToast(result.message || 'Unassign failed', 'error');
    }
  } catch (err) {
    showToast('Error unassigning task', 'error');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// BULK ASSIGN TASKS
// ═══════════════════════════════════════════════════════════════════════════
async function bulkAssignTasks() {
  const selected = Array.from(document.querySelectorAll('.taskCheckbox:checked')).map(cb => cb.value);
  
  if (selected.length === 0) {
    showToast('No tasks selected', 'warning');
    return;
  }
  
  try {
    const response = await fetch('/api/users');
    const employees = await response.json();
    
    if (employees.length === 0) {
      showToast('No employees available', 'warning');
      return;
    }
    
    let employeeOptions = '';
    employees.forEach(emp => {
      employeeOptions += `<option value="${emp.id}">${emp.name} (${emp.employeeId || emp.employee_id})</option>`;
    });
    
    const modalHtml = `
      <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center" id="bulkAssignModal" onclick="if(event.target.id==='bulkAssignModal') document.getElementById('bulkAssignModal').remove()">
        <div style="background:white;padding:30px;border-radius:15px;max-width:400px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.3)" onclick="event.stopPropagation()">
          <h3 style="margin-top:0;color:#1F2937"><i class="fas fa-user-plus"></i> Bulk Assign ${selected.length} Tasks</h3>
          <label style="display:block;margin-bottom:5px;font-weight:bold;color:#374151">Select Employee:</label>
          <select id="bulkEmployeeSelect" style="width:100%;padding:12px;border:2px solid #E5E7EB;border-radius:8px;margin-bottom:20px;font-size:14px">
            ${employeeOptions}
          </select>
          <div style="display:flex;gap:10px">
            <button onclick="confirmBulkAssign()" style="flex:1;padding:12px;background:#3B82F6;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold">
              <i class="fas fa-check"></i> Assign All
            </button>
            <button onclick="document.getElementById('bulkAssignModal').remove()" style="flex:1;padding:12px;background:#6B7280;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold">
              <i class="fas fa-times"></i> Cancel
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  } catch (err) {
    showToast('Failed to load employees', 'error');
  }
}

async function confirmBulkAssign() {
  const selected = Array.from(document.querySelectorAll('.taskCheckbox:checked')).map(cb => parseInt(cb.value));
  const employeeId = parseInt(document.getElementById('bulkEmployeeSelect').value);
  
  let successCount = 0;
  let failCount = 0;
  
  showToast('Assigning tasks...', 'info');
  
  for (const taskId of selected) {
    try {
      const response = await fetch(`/api/tasks/${taskId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: employeeId,
          adminId: currentUser.id,
          adminName: currentUser.name
        })
      });
      
      if (response.ok) {
        successCount++;
      } else {
        failCount++;
      }
    } catch (err) {
      console.error('Assign failed for task', taskId);
      failCount++;
    }
  }
  
  showToast(`✓ ${successCount} assigned, ${failCount} failed`, successCount > 0 ? 'success' : 'error');
  document.getElementById('bulkAssignModal').remove();
  clearSelection();
  
  // Refresh task list
  if (typeof loadAllTasks === 'function') loadAllTasks();
  if (typeof fetchAndDisplayTasks === 'function') fetchAndDisplayTasks();
}

// ═══════════════════════════════════════════════════════════════════════════
// BULK DELETE TASKS
// ═══════════════════════════════════════════════════════════════════════════
async function bulkDeleteTasks() {
  const selected = Array.from(document.querySelectorAll('.taskCheckbox:checked')).map(cb => parseInt(cb.value));
  
  if (selected.length === 0) {
    showToast('No tasks selected', 'warning');
    return;
  }
  
  if (!confirm(`⚠️ Delete ${selected.length} task(s)?\n\nThis action cannot be undone!`)) {
    return;
  }
  
  let successCount = 0;
  let failCount = 0;
  
  showToast('Deleting tasks...', 'info');
  
  for (const taskId of selected) {
    try {
      const response = await fetch(`/api/tasks/${taskId}?adminId=${currentUser.id}&adminName=${encodeURIComponent(currentUser.name)}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        successCount++;
      } else {
        failCount++;
      }
    } catch (err) {
      console.error('Delete failed for task', taskId);
      failCount++;
    }
  }
  
  showToast(`✓ ${successCount} deleted, ${failCount} failed`, successCount > 0 ? 'success' : 'error');
  clearSelection();
  
  // Refresh task list
  if (typeof loadAllTasks === 'function') loadAllTasks();
  if (typeof fetchAndDisplayTasks === 'function') fetchAndDisplayTasks();
}

// ═══════════════════════════════════════════════════════════════════════════
// EMPLOYEE STATUS UPDATE
// ═══════════════════════════════════════════════════════════════════════════
function openStatusUpdateModal(taskId, currentStatus) {
  const statusOptions = {
    'Pending': ['In Progress', 'Completed', 'Verified'],
    'In Progress': ['Completed', 'Verified', 'Pending'],
    'Completed': ['Verified'],
    'Verified': ['Completed']
  };
  
  const availableStatuses = statusOptions[currentStatus] || ['Pending', 'In Progress', 'Completed', 'Verified'];
  
  let optionsHtml = '';
  availableStatuses.forEach(status => {
    optionsHtml += `<option value="${status}">${status}</option>`;
  });
  
  const modalHtml = `
    <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center" id="statusModal" onclick="if(event.target.id==='statusModal') document.getElementById('statusModal').remove()">
      <div style="background:white;padding:30px;border-radius:15px;max-width:400px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.3)" onclick="event.stopPropagation()">
        <h3 style="margin-top:0;color:#059669"><i class="fas fa-sync-alt"></i> Update Task Status</h3>
        <p style="color:#374151"><strong>Current Status:</strong> <span style="color:#059669">${currentStatus}</span></p>
        <label style="display:block;margin-bottom:5px;font-weight:bold;color:#374151">New Status:</label>
        <select id="newStatusSelect" style="width:100%;padding:12px;border:2px solid #E5E7EB;border-radius:8px;margin-bottom:20px;font-size:14px">
          ${optionsHtml}
        </select>
        <div style="display:flex;gap:10px">
          <button onclick="confirmStatusUpdate(${taskId})" style="flex:1;padding:12px;background:#10B981;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold">
            <i class="fas fa-check"></i> Update
          </button>
          <button onclick="document.getElementById('statusModal').remove()" style="flex:1;padding:12px;background:#6B7280;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold">
            <i class="fas fa-times"></i> Cancel
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

async function confirmStatusUpdate(taskId) {
  const newStatus = document.getElementById('newStatusSelect').value;
  
  try {
    const response = await fetch(`/api/tasks/${taskId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: newStatus,
        userId: currentUser.id,
        userName: currentUser.name
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      showToast(`✓ Status updated to ${newStatus}`, 'success');
      document.getElementById('statusModal').remove();
      // Refresh employee tasks
      if (typeof renderEmployeeTasks === 'function') renderEmployeeTasks();
    } else {
      showToast(result.message || 'Update failed', 'error');
    }
  } catch (err) {
    showToast('Error updating status', 'error');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 20. INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

// Start the app once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  
  // If we have a hash (e.g., #tasks), we could route there, 
  // but for now we rely on the initMenu() default views.
});