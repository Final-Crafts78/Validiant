/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VALIDIANT DASHBOARD - CLIENT LOGIC (v3.0)
 * ═══════════════════════════════════════════════════════════════════════════
 */

// 1. GLOBAL STATE
let allTasks = [];              
let currentFilteredTasks = null;       
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
  const colorClass = `toast-${type}`;
  toast.innerHTML = `<i class="fas ${icon} toast-icon"></i><span>${escapeHtml(message)}</span>`;
  toast.className = `toast show ${colorClass}`;
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// ═══════════════════════════════════════════════════════════════════════════
// CLOSE ALL MODALS
// ═══════════════════════════════════════════════════════════════════════════
function closeAllModals() {
  const modals = document.querySelectorAll('.modal-overlay, .modal.show');
  modals.forEach(modal => {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// ENHANCED MODAL SYSTEM - Matches Old UI
// ═══════════════════════════════════════════════════════════════════════════

function createModal(title, content, options = {}) {
  // Remove any existing modals first
  closeAllModals();
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-container ${options.size || 'medium'}">
      <div class="modal-header">
        <h3><i class="fas ${options.icon || 'fa-edit'}"></i> ${title}</h3>
        <button class="modal-close" onclick="closeAllModals()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        ${content}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Smooth fade-in
  setTimeout(() => modal.classList.add('show'), 10);
  
  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeAllModals();
  });
  
  // Close on ESC key
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
  
  return modal;
}

// ═══════════════════════════════════════════════════════════════════════════
// EMPLOYEE TASK DETAILS MODAL
// ═══════════════════════════════════════════════════════════════════════════

function openTaskDetailsModal(taskId) {
  console.log('Opening task details for ID:', taskId);
  
  // Find the task in the current list
  const task = allEmployeeTasks.find(t => t.id === taskId);
  
  if (!task) {
    showToast('Task not found', 'error');
    return;
  }
  
  const mapLink = task.map_url || task.mapUrl || task.mapurl;
  
  const content = `
    <div class="task-details-modal">
      <div class="task-header" style="margin-bottom: 25px; padding-bottom: 20px; border-bottom: 2px solid #374151;">
        <h2 style="margin: 0 0 10px 0; font-size: 20px; color: #E5E7EB; font-weight: 600;">
          <i class="fas fa-clipboard-list" style="color: #6366f1;"></i>
          ${escapeHtml(task.title)}
        </h2>
        <span class="status-badge status-${task.status.toLowerCase().replace(/\s/g, '-')}">
          ${escapeHtml(task.status)}
        </span>
      </div>
      
      <div class="task-info-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
        
        <div class="info-item">
          <div style="color: #9CA3AF; font-size: 12px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">
            <i class="fas fa-user-tie"></i> Client
          </div>
          <div style="color: #E5E7EB; font-size: 15px; font-weight: 500;">
            ${escapeHtml(task.client_name || task.clientName || 'Unknown Client')}
          </div>
        </div>
        
        <div class="info-item">
          <div style="color: #9CA3AF; font-size: 12px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">
            <i class="fas fa-map-pin"></i> Pincode
          </div>
          <div style="color: #E5E7EB; font-size: 15px; font-weight: 500;">
            ${escapeHtml(task.pincode)}
          </div>
        </div>
        
        <div class="info-item">
          <div style="color: #9CA3AF; font-size: 12px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">
            <i class="fas fa-calendar"></i> Assigned Date
          </div>
          <div style="color: #E5E7EB; font-size: 15px; font-weight: 500;">
            ${task.assigned_date || task.assignedDate || 'N/A'}
          </div>
        </div>
        
      </div>
      
      ${task.notes ? `
        <div class="info-section" style="margin-bottom: 20px; padding: 15px; background: rgba(99, 102, 241, 0.1); border-radius: 10px; border: 1px solid rgba(99, 102, 241, 0.3);">
          <div style="color: #C7D2FE; font-size: 12px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
            <i class="fas fa-sticky-note"></i> Notes
          </div>
          <div style="color: #E5E7EB; font-size: 14px; line-height: 1.6;">
            ${escapeHtml(task.notes)}
          </div>
        </div>
      ` : ''}
      
      ${mapLink ? `
        <div style="margin-bottom: 20px;">
          <a href="${escapeHtml(mapLink)}" target="_blank" class="btn btn-primary" style="width: 100%; padding: 12px; justify-content: center;">
            <i class="fas fa-map-marked-alt"></i> Open Location in Maps
          </a>
        </div>
      ` : `
        <div style="margin-bottom: 20px; padding: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; color: #FCA5A5; font-size: 13px; text-align: center;">
          <i class="fas fa-exclamation-triangle"></i> No map location available for this task
        </div>
      `}
      
      <div class="modal-actions" style="display: flex; gap: 10px; padding-top: 15px; border-top: 1px solid #374151;">
        <button class="btn btn-success" onclick="closeAllModals(); openStatusUpdateModal(${taskId}, '${escapeHtml(task.status)}');" style="flex: 1;">
          <i class="fas fa-sync-alt"></i> Update Status
        </button>
        <button class="btn btn-secondary" onclick="closeAllModals();" style="flex: 1;">
          <i class="fas fa-times"></i> Close
        </button>
      </div>
    </div>
  `;
  
  createModal('Task Details', content, { icon: 'fa-clipboard-list', size: 'medium' });
}

// Clean up function - called when switching menus
function cleanupCurrentView() {
  closeAllModals();
  
  // Clear any active filters
  isNearestSortActive = false;
  savedEmployeeLocation = null;
  
  // Remove any temporary elements
  const tempElements = document.querySelectorAll('.temp-edit-section, .inline-edit-form');
  tempElements.forEach(el => el.remove());
}

// ═══════════════════════════════════════════════════════════════════════════
// SIDEBAR TOGGLE
// ═══════════════════════════════════════════════════════════════════════════

// SIDEBAR TOGGLE
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const isMobile = window.innerWidth <= 768;
  
  if (isMobile) {
    // On mobile, toggle open/close
    sidebar.classList.toggle('open');
    
    // Add/remove backdrop
    let overlay = document.querySelector('.sidebar-overlay');
    if (sidebar.classList.contains('open')) {
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.onclick = () => toggleSidebar(); // Close on backdrop click
        document.body.appendChild(overlay);
      }
    } else {
      if (overlay) overlay.remove();
    }
  } else {
    // On desktop, toggle collapsed
    sidebar.classList.toggle('collapsed');
  }
  
  // Save preference
  const isCollapsed = sidebar.classList.contains('collapsed');
  localStorage.setItem('sidebarCollapsed', isCollapsed);
}

// Restore sidebar state on load
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const wasCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
  
  if (wasCollapsed && window.innerWidth > 768) {
    sidebar.classList.add('collapsed');
  }
});

// Helper to update bulk action panel visibility
function updateBulkActions() {
  const checkboxes = document.querySelectorAll('.task-checkbox:checked, .taskCheckbox:checked');
  const bulkPanel = document.getElementById('bulkActions');
  const countSpan = document.getElementById('selectedCount');
  
  if (bulkPanel) {
    if (checkboxes.length > 0) {
      bulkPanel.style.display = 'flex';
      if (countSpan) countSpan.textContent = checkboxes.length;
    } else {
      bulkPanel.style.display = 'none';
    }
  }
}

// Helper for select all checkbox
function toggleSelectAll(checkbox) {
  const allCheckboxes = document.querySelectorAll('.task-checkbox, .taskCheckbox');
  allCheckboxes.forEach(cb => {
    cb.checked = checkbox.checked;
  });
  updateBulkActions();
}

// Helper to clear selection
function clearSelection() {
  const allCheckboxes = document.querySelectorAll('.task-checkbox, .taskCheckbox');
  allCheckboxes.forEach(cb => {
    cb.checked = false;
  });
  const selectAll = document.getElementById('selectAllTasks');
  if (selectAll) selectAll.checked = false;
  updateBulkActions();
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
  const content = document.getElementById('mainContainer');
  if (content) {
    content.innerHTML = `<div class="loading-spinner show" style="justify-content:center; padding:50px;"><i class="fas fa-spinner fa-spin"></i> ${msg}</div>`;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. MENU & NAVIGATION (Feature #15)
// ═══════════════════════════════════════════════════════════════════════════

function initMenu() {
  console.log('🔧 initMenu() called');
  console.log('Current user role:', currentUser.role);
  
  const menu = document.getElementById('sidebarMenu');
  console.log('sidebarMenu element:', menu);
  
  if (!menu) {
    console.error('❌ CRITICAL: sidebarMenu element NOT FOUND in HTML!');
    return;
  }
  
  // Clear existing menu
  menu.innerHTML = '';
  console.log('✓ Menu cleared');
  
  if (currentUser.role === 'admin') {
    console.log('✓ Building ADMIN menu...');
    
    // ADMIN MENU
    const buttons = [
      { icon: 'fa-plus-circle', text: 'Assign Task', action: 'showAssignTask', class: 'btn-primary' },
      { icon: 'fa-inbox', text: 'Unassigned Pool', action: 'showUnassignedTasks', class: 'btn-primary' },
      { icon: 'fa-list', text: 'All Tasks', action: 'showAllTasks', class: 'btn-primary' },
      { icon: 'fa-users', text: 'Employees', action: 'showEmployees', class: 'btn-primary' },
      { icon: 'fa-history', text: 'Activity Log', action: 'showActivityLog', class: 'btn-primary' },
      { icon: 'fa-chart-pie', text: 'Analytics', action: 'showAnalyticsDashboard', class: 'btn-info' },
      { icon: 'fa-download', text: 'Export CSV', action: 'exportTasks', class: 'btn-success' },
      { icon: 'fa-fingerprint', text: 'Digital KYC', action: 'showKYCDashboard', class: 'btn-primary' }
    ];
    
    console.log('Creating', buttons.length, 'menu buttons...');
    
    buttons.forEach((btn, index) => {
  const button = document.createElement('button');
  button.className = `menu-item`;
  button.setAttribute('data-view', btn.action);
  button.innerHTML = `<i class="fas ${btn.icon}"></i> <span>${btn.text}</span>`;  // ← WRAPPED IN SPAN!
  if (btn.style) button.setAttribute('style', btn.style);
  
  button.onclick = function() {
    console.log('Menu clicked:', btn.text);
    
    // Remove active class from all menu items
    document.querySelectorAll('.menu-item').forEach(item => {
      item.classList.remove('active');
    });
    
    // Add active class to clicked item
    this.classList.add('active');
    
    cleanupCurrentView();
    window[btn.action]();
  };
  
  menu.appendChild(button);
  console.log(`✓ Button ${index + 1} created:`, btn.text);
});

// Set first button as active by default
menu.querySelector('.menu-item')?.classList.add('active');
    
    console.log('✓ All admin menu buttons created');
    console.log('Calling showAssignTask()...');
    
    // Default view for Admin
    showAssignTask();
    
  } else {
    console.log('✓ Building EMPLOYEE menu...');
    
    // EMPLOYEE MENU
    const buttons = [
      { icon: 'fa-tasks', text: "Today's Tasks", action: 'showTodayTasks', class: 'btn-primary' },
      { icon: 'fa-history', text: 'Task History', action: 'showTaskHistory', class: 'btn-primary' }
    ];
    
    buttons.forEach((btn, index) => {
  const button = document.createElement('button');
  button.className = `menu-item`;
  button.setAttribute('data-view', btn.action);
  button.innerHTML = `<i class="fas ${btn.icon}"></i> <span>${btn.text}</span>`;  // ← WRAPPED IN SPAN!
  
  button.onclick = function() {
    console.log('Menu clicked:', btn.text);
    
    // Remove active class from all menu items
    document.querySelectorAll('.menu-item').forEach(item => {
      item.classList.remove('active');
    });
    
    // Add active class to clicked item
    this.classList.add('active');
    
    cleanupCurrentView();
    window[btn.action]();
  };
  
  menu.appendChild(button);
  console.log(`✓ Button ${index + 1} created:`, btn.text);
});

// Set first button as active by default
menu.querySelector('.menu-item')?.classList.add('active');
    
    console.log('✓ All employee menu buttons created');
    console.log('Calling showTodayTasks()...');
    
    // Default view for Employee
    showTodayTasks();
  }
  
  console.log('🎉 initMenu() complete!');
}


// ═══════════════════════════════════════════════════════════════════════════
// 7. ADMIN: ASSIGN TASK FORM (Feature #1)
// ═══════════════════════════════════════════════════════════════════════════

function showAssignTask() {
  cleanupCurrentView(); // Clear any lingering modals/forms
  
  const content = document.getElementById('mainContainer');
  let html = `
    <div class="page-header">
      <div>
        <h2><i class="fas fa-tasks"></i> Assign New Task</h2>
        <p style="color: #9CA3AF; font-size: 13px; margin-top: 5px;">
          Create a new task and assign it to an employee or leave it unassigned
        </p>
      </div>
      <button class="btn btn-success" onclick="showBulkUpload()">
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
                  placeholder="Auto-filled"
                  class="form-input"
                  readonly
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
                  placeholder="Auto-filled"
                  class="form-input"
                  readonly
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
          <button type="button" class="btn btn-secondary" onclick="showAllTasks()">
            <i class="fas fa-times"></i> Cancel
          </button>
        </div>
      </form>
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
        font-size: 14px;
        transition: all 0.3s ease;
        outline: none;
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
    </style>
  `;
  
  content.innerHTML = html;
  
  // 1. Load employees into dropdown
  fetch('/api/users')
    .then(r => r.json())
    .then(users => {
      const select = document.getElementById('employee');
      if (select) {
        select.innerHTML = '<option value="">-- Leave Unassigned --</option>';
        users.forEach(u => {
          const option = document.createElement('option');
          option.value = u.id;
          option.textContent = `${escapeHtml(u.name)} ${u.employeeId ? '(' + u.employeeId + ')' : '(No ID)'}`;
          select.appendChild(option);
        });
      }
    })
    .catch(err => {
      console.error('Error loading employees:', err);
      showToast('Failed to load employees', 'error');
    });
  
  // 2. Map URL auto-coordinate extraction
  const mapUrlInput = document.getElementById('mapUrl');
  if (mapUrlInput) {
    mapUrlInput.addEventListener('input', function() {
      const url = this.value;
      const latInput = document.getElementById('latitude');
      const lngInput = document.getElementById('longitude');
      
      if (url) {
        // Try to find @lat,lng pattern
        const latMatch = url.match(/@(-?[0-9.]+),(-?[0-9.]+)/);
        if (latMatch) {
          latInput.value = latMatch[1];
          lngInput.value = latMatch[2];
          latInput.removeAttribute('readonly');
          lngInput.removeAttribute('readonly');
          return;
        }
        
        // Try to find ?q=lat,lng pattern
        const qMatch = url.match(/\?q=(-?[0-9.]+),(-?[0-9.]+)/);
        if (qMatch) {
          latInput.value = qMatch[1];
          lngInput.value = qMatch[2];
          latInput.removeAttribute('readonly');
          lngInput.removeAttribute('readonly');
        }
      }
    });
  }
  
  // 3. Form submission handler
  const taskForm = document.getElementById('taskForm');
  if (taskForm) {
    taskForm.addEventListener('submit', function(e) {
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
            showToast(
              formData.assignedTo 
                ? '✓ Task assigned successfully!' 
                : '✓ Task created as unassigned!', 
              'success'
            );
            document.getElementById('taskForm').reset();
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
}

// ═══════════════════════════════════════════════════════════════════════════
// 8. EMPLOYEE: TODAY'S TASKS (Features #6, #7, #8)
// ═══════════════════════════════════════════════════════════════════════════

function showTodayTasks() {
  const content = document.getElementById('mainContainer');
  
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
      const rawTasks = Array.isArray(tasks) ? tasks : [];
      
      // Strictly filter out inactive tasks
      allEmployeeTasks = rawTasks.filter(task => {
        const s = (task.status || '').toLowerCase();
        return s !== 'verified' && s !== 'completed';
      });
      
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
    list.innerHTML = `<div class="empty-state">
      <i class="fas fa-check-circle"></i>
      <h3>All Clear!</h3>
      <p>No tasks assigned for today.</p>
    </div>`;
    return;
  }

  let html = `<p style="color:#e5e7eb; font-size:13px; margin-bottom:14px">
    <i class="fas fa-info-circle"></i> You have ${tasks.length} task(s) for today</p>`;
  
  tasks.forEach(task => {
    const statusClass = `status-${task.status.toLowerCase().replace(/\s/g, '-')}`;
    const mapLink = task.map_url || task.mapUrl || task.mapurl; // Get map URL
    const distanceBadge = task.distanceKm 
      ? `<span style="margin-left: 8px; background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500;"><i class="fas fa-route"></i> ${task.distanceKm} km</span>`
      : '';
    
    html += `
    <div class="task-card" onclick="openTaskDetailsModal(${task.id})" style="margin-bottom: 15px; cursor: pointer; padding: 16px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 12px; border: 1px solid #334155; transition: all 0.3s ease;" 
         onmouseover="this.style.borderColor='#6366f1'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(99, 102, 241, 0.3)';" 
         onmouseout="this.style.borderColor='#334155'; this.style.transform='translateY(0)'; this.style.boxShadow='none';">
      
      <!-- Header with Title and Status/Map -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
        <h3 style="margin: 0; font-size: 16px; color: #e5e7eb; font-weight: 600;">
          <i class="fas fa-clipboard-list" style="color: #818cf8; margin-right: 8px;"></i>
          ${escapeHtml(task.title)}
        </h3>
        
        <!-- Right side: Map button + Status -->
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
          ${mapLink ? `
            <button onclick="event.stopPropagation(); window.open('${escapeHtml(mapLink)}', '_blank')" 
                    class="map-quick-btn"
                    title="Open in Google Maps"
                    style="background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.4); color: #60A5FA; padding: 6px 12px; border-radius: 6px; cursor: pointer; transition: all 0.2s ease; font-size: 12px; font-weight: 500; display: flex; align-items: center; gap: 5px;"
                    onmouseover="this.style.background='rgba(59, 130, 246, 0.3)'; this.style.borderColor='#3B82F6';"
                    onmouseout="this.style.background='rgba(59, 130, 246, 0.2)'; this.style.borderColor='rgba(59, 130, 246, 0.4)';">
              <i class="fas fa-map-marker-alt"></i>
              <span>Maps</span>
            </button>
          ` : ''}
          <span class="status-badge ${statusClass}">${escapeHtml(task.status)}</span>
        </div>
      </div>
      
      <!-- Footer with Pincode and Tap info -->
      <div style="display: flex; justify-content: space-between; align-items: center; color: #9ca3af; font-size: 13px; margin-bottom: 12px;">
        <span><i class="fas fa-map-pin" style="color: #60a5fa;"></i> ${escapeHtml(task.pincode || 'N/A')} ${distanceBadge}</span>
        <span style="color: #60a5fa; font-weight: 500;">Tap for details <i class="fas fa-chevron-right" style="font-size: 10px;"></i></span>
      </div>
      
      <!-- Update Status Button -->
      <button onclick="event.stopPropagation(); openStatusUpdateModal(${task.id}, '${escapeHtml(task.status)}')" 
              style="width: 100%; padding: 10px; background: #10B981; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s ease;"
              onmouseover="this.style.background='#059669';"
              onmouseout="this.style.background='#10B981';">
        <i class="fas fa-sync-alt"></i> Update Status
      </button>
    </div>`;
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
      valid[nearestIdx].distanceKm = minDst.toFixed(1); 
      
      sorted.push(valid[nearestIdx]);
      currLat = valid[nearestIdx]._lat;
      currLng = valid[nearestIdx]._lng;
      valid.splice(nearestIdx, 1);
    }
  }
  return [...sorted, ...invalid];
}

function sortByNearest() {
  if (!navigator.geolocation) {
    showToast('Geolocation not supported by your browser', 'error');
    return;
  }
  
  showToast('Calculating elite route...', 'info');
  const sortBtn = event ? event.target : null;
  if (sortBtn) {
    sortBtn.disabled = true;
    sortBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Optimizing...';
  }
  
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        savedEmployeeLocation = { latitude: userLat, longitude: userLng };
        isNearestSortActive = true;
        
        const enrichedTasks = allEmployeeTasks.map(t => {
          let lat = parseFloat(t.latitude) || null;
          let lng = parseFloat(t.longitude) || null;
          if ((!lat || !lng) && t.pincode && pincodeData[t.pincode]) {
            lat = pincodeData[t.pincode].lat;
            lng = pincodeData[t.pincode].lng;
          }
          return { ...t, _lat: lat, _lng: lng };
        });
        
        const requestPayload = {
          employeeLocation: { lat: userLat, lng: userLng },
          tasks: enrichedTasks.map(t => ({
            id: t.id, _lat: t._lat, _lng: t._lng, title: t.title, pincode: t.pincode
          }))
        };
        
        const response = await fetch('/api/tasks/optimize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload)
        });
        
        const result = await response.json();
        
        if (result.success && result.optimizedTasks) {
          const optimizedOrder = result.optimizedTasks.map(opt => {
            const task = allEmployeeTasks.find(t => t.id === opt.id);
            if (task) task.distanceKm = opt.distance ? opt.distance.toFixed(1) : null;
            return task;
          }).filter(t => t);
          
          allEmployeeTasks = optimizedOrder;
          displayEmployeeTasks(allEmployeeTasks);
          showToast('✓ Route optimized successfully!', 'success');
        } else {
          throw new Error('Optimization failed');
        }
      } catch (error) {
        console.error('VRP Error:', error);
        showToast('Optimization failed, using fallback sorting', 'warning');
        allEmployeeTasks = reapplyDistanceSorting(allEmployeeTasks, pos.coords.latitude, pos.coords.longitude);
        displayEmployeeTasks(allEmployeeTasks);
      }
      
      if (sortBtn) {
        sortBtn.disabled = false;
        sortBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Sort by Nearest';
      }
    },
    (err) => {
      showToast('Location access denied. Please enable GPS.', 'error');
      if (sortBtn) {
        sortBtn.disabled = false;
        sortBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Sort by Nearest';
      }
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
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
  const content = document.getElementById('mainContainer');
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
      const completed = tasks.filter(t => 
  t.status === 'Verified' || 
  t.status === 'Unable To Verify' || 
  t.status === 'Not Picking Call' || 
  t.status === 'Does Not Reside'
);
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
  const content = document.getElementById('mainContainer');
  
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
      // ✅ FIX 1: Use 'allTasks' (matches the global variable at the top)
      allTasks = Array.isArray(tasks) ? tasks : [];
      
      const filtered = applyDateFilter(allTasks); 
      
      // ✅ FIX 2: Save 'currentFilteredTasks' so pagination knows what list to use
      currentFilteredTasks = filtered;

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

// ══════════════════════════════════════════════════════════════════════════
// 1. PAGINATION STATE (Global Variables)
// ══════════════════════════════════════════════════════════════════════════
let currentTaskPage = 1;
const TASKS_PER_PAGE = 25;

// ══════════════════════════════════════════════════════════════════════════
// 2. MAIN DISPLAY FUNCTION
// ══════════════════════════════════════════════════════════════════════════
function displayAllTasksList(tasks) {
  const list = document.getElementById('allTasksList');
  
  if (!tasks || tasks.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-inbox" style="font-size: 3rem; color: #6B7280; margin-bottom: 15px;"></i>
        <h3 style="color: #9CA3AF;">No Tasks Found</h3>
        <p style="color: #6B7280; font-size: 13px;">Try adjusting your filters or create a new task</p>
      </div>
    `;
    return;
  }

  // ---------------------------------------------------------
  // 🧠 LOGIC: Pagination & Filtering
  // ---------------------------------------------------------
  const totalPages = Math.ceil(tasks.length / TASKS_PER_PAGE);
  if (currentTaskPage > totalPages) currentTaskPage = 1; 
  
  const startIndex = (currentTaskPage - 1) * TASKS_PER_PAGE;
  const endIndex = startIndex + TASKS_PER_PAGE;
  const tasksToDisplay = tasks.slice(startIndex, endIndex);

  // ---------------------------------------------------------
  // 🎨 UI: Header & Table Construction
  // ---------------------------------------------------------
  let html = `
    <div class="table-header-info">
      <div class="info-badge">
        <i class="fas fa-list"></i>
        <span>Showing <strong>${startIndex + 1}-${Math.min(endIndex, tasks.length)}</strong> of <strong>${tasks.length}</strong> tasks</span>
      </div>
    </div>
  `;
  
  // Wrapper adds horizontal scroll support
  html += `
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th class="checkbox-col"><input type="checkbox" id="selectAllTasks" onchange="toggleSelectAll(this)"></th>
            <th style="min-width: 100px;">Date</th> <th class="case-id-col">Case ID</th>
            <th class="client-col">Client</th>
            <th class="employee-col">Employee</th>
            <th class="pincode-col">Pincode</th>
            <th class="map-col">Map</th>
            <th class="status-col">Status</th>
            <th class="sla-col">SLA (72h)</th>
            <th class="actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
  `;

  tasksToDisplay.forEach(t => {
    // Logic: Date Format
    let dateStr = '-';
    if(t.created_at) {
       dateStr = new Date(t.created_at).toLocaleDateString('en-IN', {day:'2-digit', month:'short'});
    }

    // Logic: Status & Assignment
    const statusClass = `status-${t.status.toLowerCase().replace(/ /g, '-')}`;
    const assignedTo = t.assignedToName 
      ? `<span class="employee-name">${escapeHtml(t.assignedToName)}</span>` 
      : `<span class="unassigned-label">Unassigned</span>`;

    // Logic: Map Button
    const mapLink = t.map_url || t.mapUrl || '';
    const mapDisplay = mapLink 
      ? `<a href="${mapLink}" target="_blank" class="map-link"><i class="fas fa-map-marker-alt"></i> View</a>`
      : `<span class="no-map">No map</span>`;

    // Logic: SLA Calculation
    let slaBadge = '<span class="status-badge" style="background:#374151; color:#9ca3af; font-size:11px;">N/A</span>';
    if (t.status !== 'Unassigned' && t.assigned_date) {
        const assignedTime = new Date(t.assigned_date).getTime();
        let endTime = new Date().getTime(); // Default to now
        
        // If completed/verified, stop the clock
        if (['Completed', 'Verified', 'Rejected'].includes(t.status) && (t.completed_at || t.verified_at)) {
           endTime = new Date(t.completed_at || t.verified_at).getTime();
        }

        const hours = (endTime - assignedTime) / (1000 * 60 * 60);
        if (hours <= 72) {
          slaBadge = `<span class="status-badge" style="background:rgba(16, 185, 129, 0.15); color:#34d399; font-size:11px; border:1px solid rgba(16, 185, 129, 0.2);"><i class="fas fa-check"></i> On Time</span>`;
        } else {
          const days = Math.floor(hours/24);
          slaBadge = `<span class="status-badge" style="background:rgba(239, 68, 68, 0.15); color:#f87171; font-size:11px; border:1px solid rgba(239, 68, 68, 0.2);"><i class="fas fa-exclamation-circle"></i> ${days}d Overdue</span>`;
        }
    }

    html += `
      <tr class="task-row">
        <td class="checkbox-col"><input type="checkbox" class="task-checkbox" value="${t.id}" onchange="updateBulkActions()"></td>
        <td style="color:#D1D5DB; padding:12px;">${dateStr}</td>
        <td class="case-id-col"><strong class="case-id">${escapeHtml(t.title)}</strong></td>
        <td class="client-col">${escapeHtml(t.clientName || '-')}</td>
        <td class="employee-col">${assignedTo}</td>
        <td class="pincode-col"><span class="pincode-badge">${escapeHtml(t.pincode || '-')}</span></td>
        <td class="map-col">
           <div style="display:flex; align-items:center; justify-content:center; gap:5px;">
             ${mapDisplay}
             <button onclick="showEditMapModalClean(${t.id}, '${escapeHtml(mapLink)}', '${escapeHtml(t.title)}')" style="border:none; background:none; color:#6B7280; cursor:pointer;" title="Edit Map"><i class="fas fa-pen" style="font-size:12px"></i></button>
           </div>
        </td>
        <td class="status-col"><span class="status-badge ${statusClass}">${t.status}</span></td>
        <td class="sla-col" style="text-align:center;">${slaBadge}</td>
        <td class="actions-col">
          <div class="action-buttons">
            <button class="btn-icon btn-warning" onclick="openReassignModal(${t.id})" title="Reassign"><i class="fas fa-sync-alt"></i></button>
            <button class="btn-icon btn-secondary" onclick="openUnassignModal(${t.id}, '${escapeHtml(t.title)}', '${escapeHtml(t.clientName || '')}')" title="Unassign"><i class="fas fa-times"></i></button>
            <button class="btn-icon btn-danger" onclick="deleteTask(${t.id})" title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `;
  });

  html += `</tbody></table></div>`;

  // ---------------------------------------------------------
  // 🦶 UI: Pagination Footer (New Feature)
  // ---------------------------------------------------------
  if (totalPages > 1) {
    html += `
      <div class="pagination-controls" style="display:flex; justify-content:flex-end; align-items:center; gap:15px; margin-top:15px;">
        <span style="color:#9CA3AF; font-size:13px;">Page ${currentTaskPage} of ${totalPages}</span>
        <div class="btn-group" style="display:flex; gap:5px;">
          <button class="btn btn-secondary btn-sm" ${currentTaskPage === 1 ? 'disabled' : ''} onclick="changePage(-1)">
            <i class="fas fa-chevron-left"></i> Prev
          </button>
          <button class="btn btn-secondary btn-sm" ${currentTaskPage === totalPages ? 'disabled' : ''} onclick="changePage(1)">
            Next <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    `;
  }

  // ---------------------------------------------------------
  // 🔨 UI: Bulk Actions & Styling (Restored from your Original)
  // ---------------------------------------------------------
  html += `
    <div id="bulkActions" class="bulk-actions-panel">
      <div class="bulk-info">
        <i class="fas fa-check-square"></i> <span id="selectedCount">0</span> tasks selected
      </div>
      <div class="bulk-buttons">
        <button onclick="bulkAssignTasks()" class="btn btn-primary btn-sm"><i class="fas fa-user-plus"></i> Bulk Assign</button>
        <button onclick="bulkDeleteTasks()" class="btn btn-danger btn-sm"><i class="fas fa-trash"></i> Bulk Delete</button>
        <button onclick="clearSelection()" class="btn btn-secondary btn-sm"><i class="fas fa-times"></i> Clear</button>
      </div>
    </div>
  `;
  
  html += `
    <style>
      .table-header-info { margin-bottom: 15px; }
      .info-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); padding: 8px 16px; border-radius: 8px; color: #A5B4FC; font-size: 13px; }
      .info-badge strong { color: #C7D2FE; }
      
      /* ✅ SCROLLABLE TABLE CSS */
      .table-wrapper { overflow-x: auto; border-radius: 12px; border: 1px solid #1F2937; background: rgba(15, 23, 42, 0.6); width: 100%; }
      .data-table { width: 100%; min-width: 1200px; border-collapse: collapse; font-size: 13px; }
      
      .data-table thead { background: rgba(31, 41, 55, 0.8); border-bottom: 2px solid #374151; }
      .data-table th { padding: 14px 12px; text-align: left; color: #E5E7EB; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
      .data-table tbody tr { border-bottom: 1px solid #1F2937; transition: background 0.2s ease; }
      .data-table tbody tr:hover { background: rgba(99, 102, 241, 0.05); }
      .data-table td { padding: 12px; color: #D1D5DB; vertical-align: middle; }
      
      /* Column Widths */
      .checkbox-col { width: 40px; text-align: center; }
      .case-id-col { min-width: 150px; }
      .client-col { min-width: 120px; }
      .employee-col { min-width: 130px; }
      .pincode-col { width: 100px; text-align: center; }
      .map-col { width: 100px; text-align: center; }
      .status-col { width: 120px; text-align: center; }
      .sla-col { width: 110px; text-align: center; }
      .actions-col { width: 130px; }
      
      /* Badges & Text */
      .case-id { color: #E5E7EB; font-weight: 500; }
      .employee-name { color: #A5B4FC; }
      .unassigned-label { color: #9CA3AF; font-style: italic; font-size: 12px; }
      .pincode-badge { background: rgba(139, 92, 246, 0.2); color: #C4B5FD; padding: 4px 10px; border-radius: 6px; font-weight: 500; font-family: 'Courier New', monospace; }
      .map-link { display: inline-flex; align-items: center; gap: 4px; color: #3B82F6; text-decoration: none; padding: 4px 8px; border-radius: 6px; transition: all 0.2s ease; }
      .map-link:hover { background: rgba(59, 130, 246, 0.1); color: #60A5FA; }
      .no-map { color: #6B7280; font-size: 12px; }
      
      /* Buttons */
      .action-buttons { display: flex; gap: 6px; justify-content: center; }
      .btn-icon { width: 32px; height: 32px; padding: 0; display: inline-flex; align-items: center; justify-content: center; border: none; border-radius: 6px; cursor: pointer; transition: all 0.2s ease; font-size: 13px; }
      .btn-icon.btn-warning { background: rgba(245, 158, 11, 0.2); color: #FCD34D; }
      .btn-icon.btn-warning:hover { background: rgba(245, 158, 11, 0.3); transform: translateY(-1px); }
      .btn-icon.btn-secondary { background: rgba(107, 114, 128, 0.2); color: #D1D5DB; }
      .btn-icon.btn-secondary:hover { background: rgba(107, 114, 128, 0.3); transform: translateY(-1px); }
      .btn-icon.btn-danger { background: rgba(239, 68, 68, 0.2); color: #FCA5A5; }
      .btn-icon.btn-danger:hover { background: rgba(239, 68, 68, 0.3); transform: translateY(-1px); }
      
      /* Bulk Panel */
      .bulk-actions-panel { display: none; margin-top: 20px; padding: 15px 20px; background: rgba(31, 41, 55, 0.8); border: 1px solid #374151; border-radius: 10px; align-items: center; justify-content: space-between; }
      .bulk-info { display: flex; align-items: center; gap: 8px; color: #E5E7EB; font-weight: 500; }
      .bulk-info i { color: #6366F1; }
      .bulk-buttons { display: flex; gap: 10px; }
    </style>
  `;

  list.innerHTML = html;
}

// ══════════════════════════════════════════════════════════════════════════
// 3. PAGINATION HELPER (Required)
// ══════════════════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════
// PAGINATION HELPER (Safe Version)
// ════════════════════════════════════════════════════════════
window.changePage = (direction) => {
  // Safety Check: If variables aren't defined, stop to prevent crash
  if (typeof allTasks === 'undefined') {
    console.error("Error: 'allTasks' variable is missing. Make sure it is defined at the top of client.js");
    return;
  }

  currentTaskPage += direction;
  
  // Logic: Use filtered list if it exists, otherwise use allTasks
  const listToUse = (currentFilteredTasks && currentFilteredTasks.length > 0) 
    ? currentFilteredTasks 
    : allTasks;

  // Prevent going out of bounds
  const totalPages = Math.ceil(listToUse.length / TASKS_PER_PAGE);
  if (currentTaskPage < 1) currentTaskPage = 1;
  if (currentTaskPage > totalPages) currentTaskPage = totalPages;

  displayAllTasksList(listToUse);
};

// ═══════════════════════════════════════════════════════════════════════════
// 13. ADMIN: UNASSIGNED TASKS POOL (Feature #4)
// ═══════════════════════════════════════════════════════════════════════════

function showUnassignedTasks() {
  const content = document.getElementById('mainContainer');
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
  
  // Force fresh data by adding timestamp
  const timestamp = Date.now();
  let url = `/api/tasks/unassigned?_t=${timestamp}`;
  if (term) url += `&search=${encodeURIComponent(term)}`;
  
  console.log('📡 Fetching unassigned tasks from:', url);
  
  fetch(url, {
    cache: 'no-store',  // Disable browser caching
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  })
    .then(res => res.json())
    .then(tasks => {
      console.log('✓ Received', tasks.length, 'unassigned tasks');
      allUnassignedTasks = tasks;
      
      // Fetch employees with cache-busting
      return fetch(`/api/users?_t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
    })
    .then(r => r.json())
    .then(employees => {
      console.log('✓ Received', employees.length, 'employees');
      displayUnassignedList(allUnassignedTasks, employees);
    })
    .catch(err => {
      console.error('❌ Error loading tasks:', err);
      showToast('Failed to load tasks', 'error');
    });
}

function displayUnassignedList(tasks, employees) {
  const list = document.getElementById('unassignedTasksList');
  
  if (tasks.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-check-circle" style="font-size: 3rem; color: #10B981; margin-bottom: 15px;"></i>
        <h3 style="color: #E5E7EB;">All Clear!</h3>
        <p style="color: #9CA3AF; font-size: 14px;">No unassigned tasks in the pool</p>
      </div>
    `;
    return;
  }

  let html = `
    <div class="table-header-info">
      <div class="info-badge">
        <i class="fas fa-inbox"></i>
        <span>Found <strong>${tasks.length}</strong> unassigned ${tasks.length === 1 ? 'task' : 'tasks'}</span>
      </div>
    </div>
  `;
  
  html += `
    <div class="table-wrapper">
      <table class="data-table unassigned-table">
        <thead>
          <tr>
            <th class="case-col">Task Details</th>
            <th class="pincode-col">Pincode</th>
            <th class="map-col">Location</th>
            <th class="assign-col">Assign To</th>
            <th class="actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
  `;

  tasks.forEach(t => {
    const mapLink = t.map_url || t.mapUrl || t.mapurl; 
    
    // Employee Dropdown for Quick Assign
    let empOptions = '<option value="">Choose Employee</option>';
    employees.forEach(e => {
      empOptions += `<option value="${e.id}">${escapeHtml(e.name)}</option>`;
    });

    html += `
      <tr class="task-row">
        <td class="case-col">
          <div class="task-info">
            <strong class="case-id">${escapeHtml(t.title)}</strong>
            ${t.clientName ? `<small class="client-name">${escapeHtml(t.clientName)}</small>` : ''}
          </div>
        </td>
        <td class="pincode-col">
          <span class="pincode-badge">${escapeHtml(t.pincode)}</span>
        </td>
        <td class="map-col">
          <div class="map-actions">
            ${mapLink 
              ? `<a href="${escapeHtml(mapLink)}" target="_blank" class="map-link" title="Open in Maps">
                   <i class="fas fa-map-marker-alt"></i> View
                 </a>` 
              : `<span class="no-map">No map</span>`
            }
            <button class="btn-icon btn-edit" onclick="showEditMapModalClean(${t.id}, '${escapeHtml(mapLink || '')}', '${escapeHtml(t.title).replace(/'/g, "\\'")}')
" title="Edit Map URL">
              <i class="fas fa-pen"></i>
            </button>
          </div>
        </td>
        <td class="assign-col">
          <select id="emp-${t.id}" class="assign-select">
            ${empOptions}
          </select>
        </td>
        <td class="actions-col">
          <button class="btn btn-success btn-sm" onclick="assignTaskToEmployee(${t.id})">
            <i class="fas fa-user-check"></i> Assign
          </button>
        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;
  
  html += `
    <style>
      .unassigned-table .case-col {
        min-width: 200px;
      }
      
      .unassigned-table .pincode-col {
        width: 110px;
        text-align: center;
      }
      
      .unassigned-table .map-col {
        width: 140px;
      }
      
      .unassigned-table .assign-col {
        width: 200px;
      }
      
      .unassigned-table .actions-col {
        width: 120px;
        text-align: center;
      }
      
      .task-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      
      .task-info .case-id {
        color: #E5E7EB;
        font-size: 14px;
        font-weight: 500;
      }
      
      .task-info .client-name {
        color: #9CA3AF;
        font-size: 12px;
      }
      
      .map-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        justify-content: center;
      }
      
      .btn-edit {
        background: rgba(139, 92, 246, 0.2);
        color: #C4B5FD;
      }
      
      .btn-edit:hover {
        background: rgba(139, 92, 246, 0.3);
        transform: translateY(-1px);
      }
      
      .assign-select {
        width: 100%;
        padding: 8px 10px;
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid #374151;
        border-radius: 8px;
        color: #E5E7EB;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .assign-select:focus {
        border-color: #6366F1;
        outline: none;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }
      
      .assign-select option {
        background: #0F172A;
        color: #E5E7EB;
      }
    </style>
  `;

  list.innerHTML = html;
}

// NEW: Clean Modal for Map Editing (Centered, Professional)
function showEditMapModalClean(taskId, currentMapUrl, taskTitle) {
  const content = `
    <div class="edit-map-form">
      <div class="form-info">
        <i class="fas fa-info-circle"></i>
        <span>Editing map URL for: <strong>${escapeHtml(taskTitle)}</strong></span>
      </div>
      
      <div class="form-group">
        <label for="editMapUrl">
          <i class="fas fa-link"></i> Google Maps URL
        </label>
        <input 
          type="url" 
          id="editMapUrl" 
          class="form-input" 
          placeholder="Paste Google Maps link here"
          value="${escapeHtml(currentMapUrl)}"
        />
        <small class="form-hint">
          <i class="fas fa-lightbulb"></i> Right-click on location in Google Maps and copy link
        </small>
      </div>
      
      <div class="modal-actions">
        <button class="btn btn-primary" onclick="saveEditedMapUrl(${taskId})">
          <i class="fas fa-save"></i> Save Changes
        </button>
        <button class="btn btn-secondary" onclick="closeAllModals()">
          <i class="fas fa-times"></i> Cancel
        </button>
      </div>
    </div>
    
    <style>
      .edit-map-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      
      .form-info {
        background: rgba(99, 102, 241, 0.1);
        border: 1px solid rgba(99, 102, 241, 0.3);
        border-radius: 8px;
        padding: 12px 15px;
        display: flex;
        align-items: center;
        gap: 10px;
        color: #A5B4FC;
        font-size: 13px;
      }
      
      .form-info i {
        color: #6366F1;
        font-size: 16px;
      }
      
      .form-info strong {
        color: #C7D2FE;
      }
      
      .modal-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        padding-top: 10px;
        border-top: 1px solid #1F2937;
      }
    </style>
  `;
  
  createModal('Edit Map URL', content, { icon: 'fa-map-marked-alt', size: 'medium' });
  
  // Focus on input
  setTimeout(() => {
    const input = document.getElementById('editMapUrl');
    if (input) {
      input.focus();
      input.select();
    }
  }, 100);
}

// Save function for map URL
function saveEditedMapUrl(taskId) {
  const input = document.getElementById('editMapUrl');
  
  if (!input) {
    console.error('❌ editMapUrl input not found!');
    return;
  }
  
  const url = input.value.trim();
  
  console.log('💾 Saving map URL for task', taskId);
  console.log('New URL:', url);
  
  // Disable the save button to prevent double-clicks
  const saveBtn = document.querySelector('.modal-overlay .btn-primary');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  }
  
  fetch(`/api/tasks/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      map_url: url,  // ← Correct database column name
      userId: currentUser.id,
      userName: currentUser.name
    })
  })
    .then(res => {
      console.log('Response status:', res.status);
      return res.json();
    })
    .then(data => {
      console.log('Server response:', data);
      
      if (data.success) {
        showToast('✓ Map URL updated successfully!', 'success');
        closeAllModals();
        
        // Force refresh with a small delay to ensure server has processed
        setTimeout(() => {
          // Check which view is currently active and refresh it
          if (document.getElementById('unassignedTasksList')) {
            console.log('🔄 Refreshing unassigned tasks view...');
            loadUnassignedTasks();
          }
          if (document.getElementById('allTasksList')) {
            console.log('🔄 Refreshing all tasks view...');
            loadAllTasks();
          }
        }, 300);
        
      } else {
        console.error('Update failed:', data.message);
        showToast(data.message || 'Update failed', 'error');
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
        }
      }
    })
    .catch(err => {
      console.error('❌ Error updating map URL:', err);
      showToast('Connection error. Please try again.', 'error');
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
      }
    });
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
  const content = document.getElementById('mainContainer');
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
  const content = `
    <form id="addEmpForm" class="employee-form">
      <div class="form-grid-2col">
        <div class="form-group">
          <label for="newEmpName">
            <i class="fas fa-user"></i> Full Name <span class="required">*</span>
          </label>
          <input 
            type="text" 
            id="newEmpName" 
            class="form-input" 
            required 
            placeholder="Enter full name"
          />
        </div>
        
        <div class="form-group">
          <label for="newEmpId">
            <i class="fas fa-id-badge"></i> Employee ID <span class="required">*</span>
          </label>
          <input 
            type="text" 
            id="newEmpId" 
            class="form-input" 
            required 
            placeholder="e.g., EMP001"
          />
        </div>
      </div>
      
      <div class="form-group">
        <label for="newEmpEmail">
          <i class="fas fa-envelope"></i> Email <span class="required">*</span>
        </label>
        <input 
          type="email" 
          id="newEmpEmail" 
          class="form-input" 
          required 
          placeholder="employee@company.com"
        />
      </div>
      
      <div class="form-group">
        <label for="newEmpPhone">
          <i class="fas fa-phone"></i> Phone Number
        </label>
        <input 
          type="tel" 
          id="newEmpPhone" 
          class="form-input" 
          placeholder="+91 XXXXX XXXXX"
        />
      </div>
      
      <div class="form-group">
        <label for="newEmpPass">
          <i class="fas fa-lock"></i> Password <span class="required">*</span>
        </label>
        <input 
          type="password" 
          id="newEmpPass" 
          class="form-input" 
          value="123456" 
          required
        />
        <small class="form-hint">
          <i class="fas fa-info-circle"></i> Default password: 123456 (can be changed later)
        </small>
      </div>
      
      <div class="modal-actions">
        <button type="submit" class="btn btn-primary">
          <i class="fas fa-user-plus"></i> Create Employee
        </button>
        <button type="button" class="btn btn-secondary" onclick="closeAllModals()">
          <i class="fas fa-times"></i> Cancel
        </button>
      </div>
    </form>
    
    <style>
      .employee-form {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      
      .form-grid-2col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
      }
      
      @media (max-width: 600px) {
        .form-grid-2col {
          grid-template-columns: 1fr;
        }
      }
    </style>
  `;
  
  createModal('Add New Employee', content, { icon: 'fa-user-plus', size: 'medium' });
  
  // Form submission
  document.getElementById('addEmpForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
    
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
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showToast('✓ Employee created successfully!', 'success');
          closeAllModals();
          showEmployees(); // Refresh list
        } else {
          showToast(data.message || 'Failed to create employee', 'error');
          btn.disabled = false;
          btn.innerHTML = originalText;
        }
      })
      .catch(err => {
        console.error(err);
        showToast('Connection error. Please try again.', 'error');
        btn.disabled = false;
        btn.innerHTML = originalText;
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
// SMART BULK UPLOAD SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

async function showBulkUpload() {
  // Ensure libs are loaded
  const libsReady = await loadDependencies();
  if (!libsReady) return;
  if (!allEmployees || allEmployees.length === 0) {
    try {
      showToast('Loading employee database...', 'info');
      const response = await fetch('/api/users');
      allEmployees = await response.json();
    } catch (e) {
      console.error('Failed to load employees', e);
    }
  }

  const content = `
    <div class="smart-upload-tabs">
      <div class="tab-header">
        <button class="tab-btn active" onclick="switchTab('file')"><i class="fas fa-file-excel"></i> Excel/CSV</button>
        <button class="tab-btn" onclick="switchTab('text')"><i class="fas fa-paste"></i> Paste Text</button>
        <button class="tab-btn" onclick="switchTab('ocr')"><i class="fas fa-camera"></i> Image OCR</button>
      </div>

      <div id="tab-file" class="tab-content active">
        <div class="file-drop-zone" id="smartDropZone">
          <i class="fas fa-cloud-upload-alt"></i>
          <h4>Drag & Drop Excel/CSV</h4>
          <p>We'll auto-detect columns like "Request ID", "Pin", "Client"</p>
          <input type="file" id="smartFileIn" accept=".xlsx,.xls,.csv" hidden>
          <button class="btn btn-primary" onclick="document.getElementById('smartFileIn').click()">Select File</button>
        </div>
      </div>

      <div id="tab-text" class="tab-content" style="display:none">
        <textarea id="smartTextIn" class="form-input" rows="10" placeholder="Paste data from Excel, Sheets, or Email...&#10;Example:&#10;CASE123 | 560001 | John Doe&#10;CASE124 | 560002 | Jane Smith"></textarea>
        <div class="form-hint"><i class="fas fa-info-circle"></i> Supports Tab, Comma, or Pipe (|) separators</div>
        <button class="btn btn-primary" style="margin-top:15px; width:100%" onclick="processSmartText()">Parse Text</button>
      </div>

      <div id="tab-ocr" class="tab-content" style="display:none">
        <div class="file-drop-zone" id="ocrDropZone">
          <i class="fas fa-magic"></i>
          <h4>Upload Image of Table</h4>
          <p>We'll extract text using AI (Tesseract.js)</p>
          <input type="file" id="smartImgIn" accept="image/*" hidden>
          <button class="btn btn-primary" onclick="document.getElementById('smartImgIn').click()">Select Image</button>
        </div>
        <div id="ocrProgress" style="display:none; margin-top:20px;">
          <div class="progress-bar-wrapper"><div class="progress-bar-fill" id="ocrBar" style="width:0%"></div></div>
          <p id="ocrStatus" style="text-align:center; font-size:12px; margin-top:5px; color:#9CA3AF">Initializing...</p>
        </div>
      </div>
    </div>
    
    <style>
      .smart-upload-tabs { display: flex; flex-direction: column; gap: 20px; }
      .tab-header { display: flex; border-bottom: 1px solid #374151; gap: 10px; }
      .tab-btn { background: none; border: none; padding: 10px 20px; color: #9CA3AF; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.3s; }
      .tab-btn.active { color: #6366F1; border-color: #6366F1; font-weight: 600; }
      .tab-btn:hover { color: #E5E7EB; }
      .file-drop-zone { border: 2px dashed #374151; border-radius: 12px; padding: 40px; text-align: center; cursor: pointer; transition: 0.3s; }
      .file-drop-zone:hover { border-color: #6366F1; background: rgba(99,102,241,0.05); }
      .file-drop-zone i { font-size: 3rem; color: #6366F1; margin-bottom: 15px; }
    </style>
  `;

  createModal('Smart Import', content, { size: 'large', icon: 'fa-robot' });

  // Event Listeners for Tabs
  window.switchTab = (tab) => {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(`tab-${tab}`).style.display = 'block';
    event.target.closest('button').classList.add('active');
  };

  // 1. File Handler
  const fileIn = document.getElementById('smartFileIn');
  fileIn.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const wb = XLSX.read(e.target.result, {type: 'binary'});
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws);
        const mapped = smartColumnMapper(json);
        showSmartPreview(mapped);
      };
      reader.readAsBinaryString(file);
    }
  });

  // 3. OCR Handler
  const imgIn = document.getElementById('smartImgIn');
  imgIn.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      document.getElementById('ocrDropZone').style.display = 'none';
      document.getElementById('ocrProgress').style.display = 'block';
      
      try {
        const worker = await Tesseract.createWorker({
          logger: m => {
            if (m.status === 'recognizing text') {
              document.getElementById('ocrBar').style.width = `${m.progress * 100}%`;
              document.getElementById('ocrStatus').innerText = `Scanning... ${Math.round(m.progress * 100)}%`;
            }
          }
        });
        
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const { data: { text } } = await worker.recognize(file);
        await worker.terminate();
        
        // Populate text tab with result
        document.getElementById('smartTextIn').value = text;
        switchTab('text');
        showToast('Text extracted! Please check and parse.', 'success');
        
      } catch (err) {
        console.error(err);
        showToast('OCR Failed', 'error');
        document.getElementById('ocrDropZone').style.display = 'block';
        document.getElementById('ocrProgress').style.display = 'none';
      }
    }
  });
}

// 2. Text Parser Logic (Exposed to Window)
window.processSmartText = () => {
  const text = document.getElementById('smartTextIn').value;
  if (!text.trim()) return showToast('Please paste some data', 'warning');

  // Detect delimiter
  const lines = text.split('\n').filter(l => l.trim());
  const firstLine = lines[0];
  let delimiter = ',';
  if (firstLine.includes('\t')) delimiter = '\t';
  else if (firstLine.includes('|')) delimiter = '|';

  // Parse to JSON
  const headers = lines[0].split(delimiter).map(h => h.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter);
    if (values.length < 2) continue; // Skip empty/malformed
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ? values[idx].trim() : '';
    });
    data.push(row);
  }

  const mapped = smartColumnMapper(data);
  showSmartPreview(mapped);
};

// Template Download Function
function downloadBulkUploadTemplate() {
  // FIX: Added 'EmployeeID' to the header and sample data
  const csvContent = `CaseID,Pincode,ClientName,EmployeeID,MapURL,Notes
CASE001,560001,ABC Company,,http://maps.google.com/example,Priority task
CASE002,560002,XYZ Corp,EMP123,,Assign to specific ID
CASE003,560003,Test Client,,,Leave EmployeeID empty for pool`;
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Validiant_Bulk_Upload_Template_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  showToast('Template downloaded successfully!', 'success');
}

// Form Submit Handler

function handleBulkUploadSubmit(e) {
  e.preventDefault();
  
  const fileInput = document.getElementById('bulkExcelFile');
  const file = fileInput.files[0];
  
  if (!file) {
    showToast('Please select a file', 'error');
    return;
  }
  
  // Call the new handleBulkUpload function
  handleBulkUpload(file);
}

// Check for duplicate cases in bulk upload
async function checkDuplicateCases(tasksFromExcel) {
  try {
    const response = await fetch('/api/tasks?role=admin');
    const existingTasks = await response.json();
    
    const existingCaseIds = new Set(existingTasks.map(t => t.title.trim().toLowerCase()));
    
    const duplicates = [];
    const newTasks = [];
    
    tasksFromExcel.forEach(task => {
      const caseId = task.title.trim().toLowerCase();
      if (existingCaseIds.has(caseId)) {
        duplicates.push(task);
      } else {
        newTasks.push(task);
      }
    });
    
    return { duplicates, newTasks };
  } catch (err) {
    console.error('Error checking duplicates:', err);
    return { duplicates: [], newTasks: tasksFromExcel }; // If error, treat all as new
  }
}

async function handleBulkUpload(file) {
  const reader = new FileReader();
  
  reader.onload = async function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(firstSheet);
      
      if (rows.length === 0) {
        showToast('Excel file is empty!', 'error');
        return;
      }
      
      // Parse tasks from Excel
      const tasksFromExcel = rows.map(row => ({
        title: row['Case ID'] || row['Title'] || '',
        clientName: row['Client Name'] || '',
        pincode: row['Pincode'] || '',
        mapUrl: row['Map URL'] || '',
        notes: row['Notes'] || '',
        assignedTo: row['Employee ID'] ? parseInt(row['Employee ID']) : null
      })).filter(t => t.title); // Remove empty rows
      
      // Check for duplicates
      const { duplicates, newTasks } = await checkDuplicateCases(tasksFromExcel);
      
      if (duplicates.length > 0) {
        // Show modal with options
        showDuplicateModal(duplicates, newTasks);
      } else {
        // No duplicates, proceed normally
        processBulkUpload(newTasks);
      }
      
    } catch (err) {
      console.error('Error reading file:', err);
      showToast('Failed to read Excel file', 'error');
    }
  };
  
  reader.readAsArrayBuffer(file);
}

function showDuplicateModal(duplicates, newTasks) {
  const content = `
    <div class="form-info" style="margin-bottom: 20px;">
      <i class="fas fa-exclamation-triangle"></i>
      <span><strong>${duplicates.length}</strong> duplicate case(s) found. What would you like to do?</span>
    </div>
    
    <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 15px; margin-bottom: 20px;">
      <div style="color: #FCA5A5; font-size: 13px; font-weight: 500; margin-bottom: 8px;">Duplicate Cases:</div>
      <div style="max-height: 150px; overflow-y: auto; color: #D1D5DB; font-size: 12px;">
        ${duplicates.map(d => `• ${escapeHtml(d.title)}`).join('<br>')}
      </div>
    </div>
    
    <div class="modal-actions" style="display: flex; flex-direction: column; gap: 10px;">
      <button class="btn btn-primary" onclick="handleDuplicateChoice('create', ${duplicates.length}, ${newTasks.length})">
        <i class="fas fa-plus"></i> Create New (${duplicates.length + newTasks.length} total tasks)
      </button>
      <button class="btn btn-warning" onclick="handleDuplicateChoice('update', ${duplicates.length}, ${newTasks.length})">
        <i class="fas fa-sync-alt"></i> Update Existing (${duplicates.length} updated + ${newTasks.length} new)
      </button>
      <button class="btn btn-secondary" onclick="handleDuplicateChoice('cancel', ${duplicates.length}, ${newTasks.length})">
        <i class="fas fa-times"></i> Cancel Duplicates (${newTasks.length} new only)
      </button>
    </div>
  `;
  
  // Store in global variable for access
  window._bulkUploadData = { duplicates, newTasks };
  
  createModal('Duplicate Cases Found', content, { icon: 'fa-exclamation-triangle', size: 'medium' });
}

async function handleDuplicateChoice(choice, dupCount, newCount) {
  closeAllModals();
  
  const { duplicates, newTasks } = window._bulkUploadData;
  
  if (choice === 'create') {
    // Create ALL tasks (including duplicates as new entries)
    showToast('Creating all tasks...', 'info');
    await processBulkUpload([...duplicates, ...newTasks]);
    
  } else if (choice === 'update') {
    // Update duplicates + Create new
    showToast('Updating existing and creating new tasks...', 'info');
    await updateExistingTasks(duplicates);
    await processBulkUpload(newTasks);
    
  } else if (choice === 'cancel') {
    // Skip duplicates, only create new
    showToast('Skipping duplicates, creating new tasks only...', 'info');
    await processBulkUpload(newTasks);
  }
  
  // Clean up
  delete window._bulkUploadData;
}

async function updateExistingTasks(duplicates) {
  try {
    // Get all existing tasks
    const response = await fetch('/api/tasks?role=admin');
    const existingTasks = await response.json();
    
    let updated = 0;
    
    for (const dup of duplicates) {
      const existing = existingTasks.find(t => t.title.trim().toLowerCase() === dup.title.trim().toLowerCase());
      
      if (existing && dup.assignedTo) {
        // Update only the employee assignment
        const updateResponse = await fetch(`/api/tasks/${existing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assignedTo: dup.assignedTo,
            userId: currentUser.id,
            userName: currentUser.name
          })
        });
        
        if (updateResponse.ok) updated++;
      }
    }
    
    showToast(`${updated} task(s) reassigned successfully!`, 'success');
  } catch (err) {
    console.error('Error updating tasks:', err);
    showToast('Some tasks failed to update', 'error');
  }
}

async function processBulkUpload(tasks) {
  if (!tasks || tasks.length === 0) {
    showToast('No tasks to upload', 'info');
    return;
  }
  
  try {
    let successCount = 0;
    
    for (const task of tasks) {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...task,
          createdBy: currentUser.id,
          createdByName: currentUser.name
        })
      });
      
      if (response.ok) successCount++;
    }
    
    showToast(`✓ ${successCount} task(s) created successfully!`, 'success');
    
    // Redirect to unassigned pool or all tasks
    setTimeout(() => {
      const hasUnassigned = tasks.some(t => !t.assignedTo);
      if (hasUnassigned) {
        showUnassignedTasks();
      } else {
        showAllTasks();
      }
    }, 1000);
    
  } catch (err) {
    console.error('Error uploading tasks:', err);
    showToast('Failed to upload tasks', 'error');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 17. EDIT EMPLOYEE & PASSWORD RESET
// ═══════════════════════════════════════════════════════════════════════════

function showEditEmployeeModal(empId) {
  // Find employee data
  const emp = allEmployees.find(u => u.id === empId);
  
  if (!emp) {
    showToast('Employee not found', 'error');
    return;
  }
  
  const content = `
    <form id="editEmpForm" class="employee-form">
      <div class="form-grid-2col">
        <div class="form-group">
          <label for="editName">
            <i class="fas fa-user"></i> Full Name <span class="required">*</span>
          </label>
          <input 
            type="text" 
            id="editName" 
            class="form-input" 
            value="${escapeHtml(emp.name)}" 
            required
          />
        </div>
        
        <div class="form-group">
          <label for="editEmpId">
            <i class="fas fa-id-badge"></i> Employee ID <span class="required">*</span>
          </label>
          <input 
            type="text" 
            id="editEmpId" 
            class="form-input" 
            value="${escapeHtml(emp.employeeId || '')}" 
            required
          />
        </div>
      </div>
      
      <div class="form-group">
        <label for="editEmail">
          <i class="fas fa-envelope"></i> Email <span class="required">*</span>
        </label>
        <input 
          type="email" 
          id="editEmail" 
          class="form-input" 
          value="${escapeHtml(emp.email)}" 
          required
        />
      </div>
      
      <div class="form-group">
        <label for="editPhone">
          <i class="fas fa-phone"></i> Phone Number
        </label>
        <input 
          type="tel" 
          id="editPhone" 
          class="form-input" 
          value="${escapeHtml(emp.phone || '')}"
        />
      </div>
      
      <div class="form-info">
        <i class="fas fa-info-circle"></i>
        <span>Leave password field empty to keep current password</span>
      </div>
      
      <div class="form-group">
        <label for="editPassword">
          <i class="fas fa-lock"></i> New Password (Optional)
        </label>
        <input 
          type="password" 
          id="editPassword" 
          class="form-input" 
          placeholder="Leave blank to keep current"
        />
      </div>
      
      <div class="modal-actions">
        <button type="submit" class="btn btn-primary">
          <i class="fas fa-save"></i> Save Changes
        </button>
        <button type="button" class="btn btn-secondary" onclick="closeAllModals()">
          <i class="fas fa-times"></i> Cancel
        </button>
      </div>
    </form>
  `;
  
  createModal('Edit Employee', content, { icon: 'fa-user-edit', size: 'medium' });
  
  // Form submission
  document.getElementById('editEmpForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    
    const updateData = {
      name: document.getElementById('editName').value,
      employeeId: document.getElementById('editEmpId').value,
      email: document.getElementById('editEmail').value,
      phone: document.getElementById('editPhone').value,
      adminId: currentUser.id,
      adminName: currentUser.name
    };
    
    const newPassword = document.getElementById('editPassword').value;
    if (newPassword && newPassword.trim() !== '') {
      updateData.password = newPassword;
    }
    
    fetch(`/api/users/${empId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showToast('✓ Employee updated successfully!', 'success');
          closeAllModals();
          showEmployees(); // Refresh list
        } else {
          showToast(data.message || 'Update failed', 'error');
          btn.disabled = false;
          btn.innerHTML = originalText;
        }
      })
      .catch(err => {
        console.error(err);
        showToast('Connection error. Please try again.', 'error');
        btn.disabled = false;
        btn.innerHTML = originalText;
      });
  });
}

function openResetPasswordModal(userId, email) {
  const content = `
    <div class="reset-password-form">
      <div class="form-info">
        <i class="fas fa-key"></i>
        <span>Reset password for: <strong>${escapeHtml(email)}</strong></span>
      </div>
      
      <div class="form-group">
        <label for="newPassInput">
          <i class="fas fa-lock"></i> New Password
        </label>
        <input 
          type="text" 
          id="newPassInput" 
          class="form-input" 
          placeholder="Leave blank for auto-generated password"
        />
        <small class="form-hint">
          <i class="fas fa-lightbulb"></i> If left empty, a random password will be generated
        </small>
      </div>
      
      <div class="modal-actions">
        <button class="btn btn-warning" onclick="confirmResetPassword(${userId})">
          <i class="fas fa-key"></i> Reset Password
        </button>
        <button class="btn btn-secondary" onclick="closeAllModals()">
          <i class="fas fa-times"></i> Cancel
        </button>
      </div>
    </div>
    
    <style>
      .reset-password-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
    </style>
  `;
  
  createModal('Reset Password', content, { icon: 'fa-key', size: 'medium' });
}

function confirmResetPassword(userId) {
  const newPass = document.getElementById('newPassInput').value;
  
  const btn = event.target;
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resetting...';
  
  fetch(`/api/users/${userId}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      newPassword: newPass,
      adminId: currentUser.id,
      adminName: currentUser.name
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        // Show password in alert
        alert(`✓ Password Reset Successful!\n\nNew Password: ${data.tempPassword}\n\nPlease save this password and share with the employee.`);
        closeAllModals();
      } else {
        showToast(data.message || 'Reset failed', 'error');
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    })
    .catch(err => {
      console.error(err);
      showToast('Connection error. Please try again.', 'error');
      btn.disabled = false;
      btn.innerHTML = originalText;
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// 18. ANALYTICS DASHBOARD (Feature #19)
// ═══════════════════════════════════════════════════════════════════════════

function showAnalyticsDashboard() {
  const content = document.getElementById('mainContainer');
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
  const content = document.getElementById('mainContainer');
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
async function showActivityLog() {
  const container = document.getElementById('mainContainer');
  container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading logs...</div>';

  try {
    const response = await fetch('/api/activity-log');
    const logs = await response.json();

    if (logs.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-history" style="font-size: 3rem; color: #6B7280; margin-bottom: 15px;"></i>
          <h3 style="color: #9CA3AF;">No Activity Found</h3>
        </div>`;
      return;
    }

    let html = `
      <div class="header-actions" style="margin-bottom: 20px;">
        <h2 style="margin:0; color: #E5E7EB;"><i class="fas fa-history"></i> System Activity Log</h2>
        <span class="info-badge">Last 100 Events</span>
      </div>
      
      <div class="table-wrapper" style="overflow-x: auto; border: 1px solid #374151; border-radius: 8px;">
        <table class="data-table" style="width:100%">
          <thead>
            <tr>
              <th style="width: 180px;">Time</th>
              <th style="width: 150px;">User</th>
              <th style="width: 150px;">Action</th>
              <th style="width: 100px;">Ref ID</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
    `;

    logs.forEach(log => {
      // ✅ FIX: "Invalid Date" issue
      // We explicitly check if created_at exists, otherwise show '-'
      let dateDisplay = '-';
      if (log.created_at) {
        try {
           dateDisplay = new Date(log.created_at).toLocaleString('en-IN', {
             day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
           });
        } catch (e) {
           dateDisplay = 'Invalid Date';
        }
      }

      // ✅ FIX: Handle different Action colors
      let actionColor = '#9CA3AF'; // Default Grey
      if (log.action.includes('CREATED')) actionColor = '#34D399'; // Green
      if (log.action.includes('DELETED')) actionColor = '#F87171'; // Red
      if (log.action.includes('UPDATED')) actionColor = '#60A5FA'; // Blue
      if (log.action.includes('LOGIN')) actionColor = '#FBBF24';   // Yellow

      // Format Details (clean up quotes if it's a JSON string)
      let detailsText = log.details || '-';
      if (typeof detailsText === 'string' && detailsText.startsWith('"')) {
        detailsText = detailsText.replace(/"/g, '');
      }

      html += `
        <tr>
          <td style="color:#D1D5DB; font-size:13px;">${dateDisplay}</td>
          <td style="font-weight:500; color:#E5E7EB;">${escapeHtml(log.user_name || 'System')}</td>
          <td><span class="status-badge" style="background:${actionColor}20; color:${actionColor}; border:1px solid ${actionColor}40">${escapeHtml(log.action)}</span></td>
          <td style="font-family:monospace; color:#9CA3AF;">${log.task_id || '-'}</td>
          <td style="color:#9CA3AF; font-size:13px;">${escapeHtml(detailsText)}</td>
        </tr>
      `;
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;

  } catch (error) {
    console.error('Log Error:', error);
    container.innerHTML = `<div class="error-state">Failed to load activity logs</div>`;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// REASSIGN TASK MODAL
// ═══════════════════════════════════════════════════════════════════════════

function openReassignModal(taskId) {
  const content = `
    <div class="reassign-form">
      <div class="form-info">
        <i class="fas fa-info-circle"></i>
        <span>Select a new employee to assign this task</span>
      </div>
      
      <div class="form-group">
        <label for="reassignEmp">
          <i class="fas fa-user"></i> Choose Employee
        </label>
        <select id="reassignEmp" class="form-input">
          <option value="">Loading employees...</option>
        </select>
      </div>
      
      <div class="modal-actions">
        <button class="btn btn-primary" onclick="confirmReassign(${taskId})">
          <i class="fas fa-check"></i> Reassign Task
        </button>
        <button class="btn btn-secondary" onclick="closeAllModals()">
          <i class="fas fa-times"></i> Cancel
        </button>
      </div>
    </div>
    
    <style>
      .reassign-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
    </style>
  `;
  
  createModal('Reassign Task', content, { icon: 'fa-sync-alt', size: 'medium' });
  
  // Load employees
  fetch('/api/users')
    .then(r => r.json())
    .then(users => {
      const sel = document.getElementById('reassignEmp');
      if (sel) {
        sel.innerHTML = '<option value="">Select Employee</option>';
        users.forEach(u => {
          sel.innerHTML += `<option value="${u.id}">${escapeHtml(u.name)}</option>`;
        });
      }
    })
    .catch(err => {
      showToast('Failed to load employees', 'error');
    });
}

function confirmReassign(taskId) {
  const empId = document.getElementById('reassignEmp').value;
  
  if (!empId) {
    showToast('Please select an employee', 'error');
    return;
  }
  
  fetch(`/api/tasks/${taskId}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      employeeId: parseInt(empId),
      adminId: currentUser.id,
      adminName: currentUser.name
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast('✓ Task reassigned successfully!', 'success');
        closeAllModals();
        // Refresh current view
        if (document.getElementById('allTasksList')) loadAllTasks();
        if (document.getElementById('unassignedTasksList')) loadUnassignedTasks();
      } else {
        showToast(data.message || 'Reassignment failed', 'error');
      }
    })
    .catch(err => {
      console.error(err);
      showToast('Connection error. Please try again.', 'error');
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// UNASSIGN TASK MODAL
// ═══════════════════════════════════════════════════════════════════════════

function openUnassignModal(taskId, taskTitle, clientName) {
  const displayTitle = taskTitle || 'this task';
  const displayClient = clientName ? ` (${clientName})` : '';
  
  const content = `
    <div class="unassign-form">
      <div class="warning-box">
        <i class="fas fa-exclamation-triangle"></i>
        <div>
          <h4 style="margin: 0 0 8px 0; color: #FCD34D;">Move task back to unassigned pool?</h4>
          <p style="margin: 0; color: #D1D5DB; font-size: 13px;">
            Task: <strong>"${escapeHtml(displayTitle)}"</strong>${escapeHtml(displayClient)}
          </p>
        </div>
      </div>
      
      <div class="modal-actions">
        <button class="btn btn-warning" onclick="confirmUnassign(${taskId})">
          <i class="fas fa-check"></i> Yes, Unassign
        </button>
        <button class="btn btn-secondary" onclick="closeAllModals()">
          <i class="fas fa-times"></i> Cancel
        </button>
      </div>
    </div>
    
    <style>
      .unassign-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      
      .warning-box {
        background: rgba(245, 158, 11, 0.1);
        border: 1px solid rgba(245, 158, 11, 0.3);
        border-radius: 10px;
        padding: 20px;
        display: flex;
        gap: 15px;
        align-items: flex-start;
      }
      
      .warning-box i {
        color: #FCD34D;
        font-size: 24px;
        flex-shrink: 0;
      }
    </style>
  `;
  
  createModal('Unassign Task', content, { icon: 'fa-times-circle', size: 'medium' });
}

function confirmUnassign(taskId) {
  fetch(`/api/tasks/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      assignedTo: null,
      status: 'Unassigned',
      userId: currentUser.id,
      userName: currentUser.name
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast('✓ Task moved to unassigned pool', 'success');
        closeAllModals();
        if (document.getElementById('allTasksList')) loadAllTasks();
      } else {
        showToast(data.message || 'Unassignment failed', 'error');
      }
    })
    .catch(err => {
      console.error(err);
      showToast('Connection error. Please try again.', 'error');
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// LEGACY MAP EDIT MODAL (kept for backward compatibility - redirects to new one)
// ═══════════════════════════════════════════════════════════════════════════

function showEditMapModal(taskId) {
  // Find the task to get its current map URL and title
  fetch(`/api/tasks?roleadmin`)
    .then(r => r.json())
    .then(tasks => {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        showEditMapModalClean(taskId, task.mapurl || task.mapUrl || '', task.title || 'Unknown Task');
      } else {
        showEditMapModalClean(taskId, '', 'Task');
      }
    })
    .catch(err => {
      showEditMapModalClean(taskId, '', 'Task');
    });
}


// ═══════════════════════════════════════════════════════════════════════════
// BULK ASSIGN TASKS
// ═══════════════════════════════════════════════════════════════════════════
async function bulkAssignTasks() {
  // FIX: Changed '.taskCheckbox:checked' to '.task-checkbox:checked' to match HTML
  const selected = Array.from(document.querySelectorAll('.task-checkbox:checked')).map(cb => cb.value);
  
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
      employeeOptions += `<option value="${emp.id}">${escapeHtml(emp.name)} (${emp.employeeId || 'No ID'})</option>`;
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
  // FIX: Changed '.taskCheckbox:checked' to '.task-checkbox:checked'
  const selected = Array.from(document.querySelectorAll('.task-checkbox:checked')).map(cb => parseInt(cb.value));
  
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
}

// ═══════════════════════════════════════════════════════════════════════════
// EMPLOYEE STATUS UPDATE
// ═══════════════════════════════════════════════════════════════════════════
function openStatusUpdateModal(taskId, currentStatus) {
  const statusOptions = {
    'Pending': ['In Progress', 'Verified', 'Unable To Verify', 'Not Picking Call', 'Does Not Reside'],
    'In Progress': ['Verified', 'Unable To Verify', 'Not Picking Call', 'Does Not Reside', 'Pending'],
    'Verified': ['In Progress'],
    'Unable To Verify': ['In Progress', 'Verified'],
    'Not Picking Call': ['In Progress', 'Verified'],
    'Does Not Reside': ['In Progress', 'Verified']
  };
  
  const availableStatuses = statusOptions[currentStatus] || ['In Progress', 'Verified', 'Unable To Verify', 'Not Picking Call', 'Does Not Reside'];
  
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
      // 1. Update the local task status
      const idx = allEmployeeTasks.findIndex(t => String(t.id) === String(taskId));
      if (idx !== -1) {
        allEmployeeTasks[idx].status = newStatus;
      }
      
      // 2. Remove the task from the view if it was marked as verified or completed
      allEmployeeTasks = allEmployeeTasks.filter(task => {
        const s = (task.status || '').toLowerCase();
        return s !== 'verified' && s !== 'completed';
      });

      showToast(`✓ Status updated to ${newStatus}`, 'success');
      document.getElementById('statusModal').remove();
      
      // 3. Reactively re-render
      displayEmployeeTasks(allEmployeeTasks);
    } else {
      showToast(result.message || 'Update failed', 'error');
    }
  } catch (err) {
    showToast('Error updating status', 'error');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SMART UPLOAD HELPERS (v2 - 100% Feature Complete)
// ═══════════════════════════════════════════════════════════════════════════

// 1. Dynamic Script Loader
async function loadDependencies() {
  const loadScript = (src, id) => {
    return new Promise((resolve, reject) => {
      if (document.getElementById(id)) return resolve();
      const script = document.createElement('script');
      script.src = src;
      script.id = id;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };
  try {
    showToast('Loading intelligent parsers...', 'info');
    await Promise.all([
      loadScript('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js', 'xlsx-lib'),
      loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js', 'tesseract-lib')
    ]);
    return true;
  } catch (e) {
    showToast('Failed to load libraries', 'error');
    return false;
  }
}

// 2. Intelligent Column Mapper (⭐ Features: Any Name, Any Order, Pincode Extraction)
function smartColumnMapper(rawData) {
  const normalized = [];
  
  // 1. Define synonyms for column headers
  const mapRules = {
    title: ['caseid', 'requestid', 'id', 'title', 'case', 'ticket', 'ref', 'number'],
    clientName: ['client', 'customer', 'individual', 'name', 'party'],
    pincode: ['pincode', 'pin', 'zip', 'postal'],
    address: ['address', 'location', 'addr', 'site'],
    mapUrl: ['map', 'url', 'link', 'google', 'location_link'],
    notes: ['notes', 'remarks', 'comments', 'desc'],
    assignedTo: ['employee', 'empid', 'assigned', 'agent', 'field_executive', 'fe']
  };

  rawData.forEach(row => {
    const newRow = {};
    const rowKeys = Object.keys(row);
    
    // Helper to find value based on synonyms
    const findValue = (field) => {
      const match = rowKeys.find(k => {
        const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
        return mapRules[field].some(rule => cleanKey.includes(rule));
      });
      return match ? row[match] : null;
    };

    newRow.title = findValue('title') || `CASE-${Math.floor(Math.random()*100000)}`;
    newRow.clientName = findValue('clientName');
    newRow.pincode = findValue('pincode');
    newRow.address = findValue('address');
    newRow.mapUrl = findValue('mapUrl');
    newRow.notes = findValue('notes');
    
    // ═════════════════════════════════════════════════════════════════════
    // ⭐ UPDATED: Robust Employee Matching (ID OR Name)
    // ═════════════════════════════════════════════════════════════════════
    const empVal = findValue('assignedTo');
    
    if (empVal && allEmployees && allEmployees.length > 0) {
      // 1. "Clean" the input from Excel
      // "Name D." -> "named" | "EMP-001" -> "emp001"
      const cleanInput = String(empVal).toLowerCase().replace(/[^a-z0-9]/g, '');

      const emp = allEmployees.find(e => {
        // 2. "Clean" the DB values to match the input format
        const dbId = String(e.employeeId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const dbName = String(e.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');

        // 3. The Match Logic: Does Input match ID OR Name?
        // We use 'includes' for name to handle "John" matching "John Doe" if preferred, 
        // OR strict equality for precision. Here I use strict equality on the cleaned string for safety.
        return (dbId === cleanInput) || (dbName === cleanInput);
      });
      
      newRow.assignedTo = emp ? emp.id : null;
    } else {
      newRow.assignedTo = null;
    }
    // ═════════════════════════════════════════════════════════════════════

    // Smart Pincode Extraction from Address (if pincode column missing)
    if (!newRow.pincode && newRow.address) {
      const addressStr = String(newRow.address);
      const pinMatch = addressStr.match(/\b[1-9][0-9]{5}\b/); 
      if (pinMatch) newRow.pincode = pinMatch[0];
    }
    
    // Only add valid rows
    if (newRow.title || newRow.pincode) {
      normalized.push(newRow);
    }
  });

  return normalized;
}

// 3. Smart Preview Modal (👁️ Features: Editable Table, Live Save)
// 3. Smart Preview Modal (👁️ Features: Editable, Loading State, Duplicate Check)
function showSmartPreview(tasks) {
  closeAllModals();
  
  const content = `
    <div class="preview-container">
      <div class="preview-header" style="margin-bottom:15px; display:flex; justify-content:space-between;">
        <div class="stats">
          <span class="info-badge">Total: ${tasks.length}</span>
          <span class="info-badge" style="color:#10B981; border-color:#10B981">Assigned: ${tasks.filter(t => t.assignedTo).length}</span>
        </div>
      </div>
      
      <div class="table-wrapper" style="max-height: 400px; overflow: auto; margin-bottom: 20px; border: 1px solid #374151; border-radius: 8px;">
        <table class="data-table" id="previewTable" style="width:100%">
          <thead style="position:sticky; top:0; background:#1F2937; z-index:10;">
            <tr>
              <th>Case ID / Title</th>
              <th>Pincode</th>
              <th>Client</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${tasks.map((t, idx) => `
              <tr data-idx="${idx}">
                <td><input type="text" value="${escapeHtml(t.title)}" class="form-input text-sm" name="title"></td>
                <td><input type="text" value="${escapeHtml(t.pincode || '')}" class="form-input text-sm" name="pincode" style="width:80px"></td>
                <td>${escapeHtml(t.clientName || '-')}</td>
                <td>${t.assignedTo ? '<span class="status-badge status-verified">Matched</span>' : '<span class="status-badge status-unassigned">Pool</span>'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="modal-actions">
        <button id="confirmUploadBtn" class="btn btn-primary btn-lg">
          <i class="fas fa-cloud-upload-alt"></i> Upload Valid Tasks
        </button>
        <button id="cancelUploadBtn" class="btn btn-secondary" onclick="showBulkUpload()">Back</button>
      </div>
    </div>
  `;

  createModal('Review & Edit Data', content, { size: 'large', icon: 'fa-edit' });

  // ⭐ UPDATED LOGIC: Capture Edits -> Loading State -> Check Duplicates -> Upload
  document.getElementById('confirmUploadBtn').onclick = async () => {
    const btn = document.getElementById('confirmUploadBtn');
    const cancelBtn = document.getElementById('cancelUploadBtn');
    const originalText = btn.innerHTML;

    // 1. Gather Data from Inputs
    const rows = document.querySelectorAll('#previewTable tbody tr');
    const updatedTasks = [];

    rows.forEach(row => {
      const idx = row.getAttribute('data-idx');
      const task = tasks[idx]; // Get original object ref
      
      // Update with values from inputs
      task.title = row.querySelector('input[name="title"]').value;
      task.pincode = row.querySelector('input[name="pincode"]').value;

      if (task.title && task.pincode) {
        updatedTasks.push(task);
      }
    });

    if (updatedTasks.length === 0) return showToast('No valid tasks to upload', 'error');

    // 2. UI Feedback: LOCK BUTTONS
    btn.disabled = true;
    cancelBtn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking Duplicates...';

    try {
      // 3. Check for Duplicates First
      const { duplicates, newTasks } = await checkDuplicateCases(updatedTasks);
      
      if (duplicates.length > 0) {
        // If duplicates found, switch to duplicate modal
        closeAllModals(); 
        showDuplicateModal(duplicates, newTasks);
      } else {
        // 4. No duplicates? Upload Immediately
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        await processBulkUpload(newTasks);
        closeAllModals();
      }

    } catch (err) {
      console.error(err);
      showToast('Error processing upload', 'error');
      // Restore buttons on error
      btn.disabled = false;
      cancelBtn.disabled = false;
      btn.innerHTML = originalText;
    }
  };
}

// 4. Smart Text Parser (Kept mostly same, matches your existing logic)
window.processSmartText = () => {
  const text = document.getElementById('smartTextIn').value;
  if (!text.trim()) return showToast('Please paste some data', 'warning');

  const lines = text.split('\n').filter(l => l.trim());
  let data = [];

  // Strategy A: Key-Value Pairs
  const isKeyValue = lines.slice(0, 3).every(l => l.includes(':') || l.includes('-'));
  
  if (isKeyValue) {
    let currentObj = {};
    lines.forEach(line => {
      const [key, ...valParts] = line.split(/[:\t-]+/); 
      const val = valParts.join(' ').trim();
      
      if (!key || !val) return;
      const lowerKey = key.toLowerCase();

      if ((lowerKey.includes('case') || lowerKey.includes('id')) && currentObj.title) {
        data.push(currentObj);
        currentObj = {};
      }
      
      if (lowerKey.includes('case') || lowerKey.includes('id')) currentObj.title = val;
      if (lowerKey.includes('pin')) currentObj.pincode = val;
      if (lowerKey.includes('client')) currentObj.clientName = val;
    });
    if (currentObj.title) data.push(currentObj);

  } else {
    // Strategy B: Delimiter Table
    const firstLine = lines[0];
    let delimiter = ',';
    if (firstLine.includes('\t')) delimiter = '\t';
    else if (firstLine.includes('|')) delimiter = '|';

    const headers = lines[0].split(delimiter).map(h => h.trim());
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(delimiter);
      if (values.length < 2) continue; 
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] ? values[idx].trim() : '';
      });
      data.push(row);
    }
  }

  const mapped = smartColumnMapper(data);
  if(mapped.length === 0) return showToast('Could not parse data. Try Excel format.', 'error');
  showSmartPreview(mapped);
};

// ═══════════════════════════════════════════════════════════════════════════
// 20. INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

// Start the app once DOM is ready
// ═══════════════════════════════════════════════════════════════════════════
// PAGE INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  console.log('✓ Dashboard loaded, initializing...');
  console.log('Current user:', currentUser);
  
  // Verify user is authenticated
  if (!currentUser || !currentUser.role) {
    console.error('❌ No user found, redirecting to signin...');
    window.location.href = 'signin.html';
    return;
  }
  
  // Update user info in header
  const userName = document.getElementById('userName');
  const userRole = document.getElementById('userRole');
  const userInitials = document.getElementById('userInitials');
  
  if (userName) {
    userName.innerHTML = `<i class="fas fa-user-circle"></i> ${escapeHtml(currentUser.name)}`;
    console.log('✓ User name updated:', currentUser.name);
  } else {
    console.error('❌ userName element not found');
  }
  
  if (userRole) {
    userRole.textContent = currentUser.role;
    console.log('✓ User role updated:', currentUser.role);
  } else {
    console.error('❌ userRole element not found');
  }
  
  if (userInitials) {
    const initials = currentUser.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
    userInitials.textContent = initials;
    console.log('✓ User initials updated:', initials);
  } else {
    console.error('❌ userInitials element not found');
  }
  
  // Initialize the menu and default view
  console.log('✓ Calling initMenu() for role:', currentUser.role);
  initMenu();
    // Restore sidebar collapsed state
  const sidebar = document.getElementById('sidebar');
  const wasCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
  if (wasCollapsed && window.innerWidth > 768) {
    sidebar.classList.add('collapsed');
  }
  
  console.log('✓ Dashboard initialization complete!');
});













