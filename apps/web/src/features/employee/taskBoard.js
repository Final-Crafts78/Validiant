/**
 * Employee Task Board
 */
import { state, setState } from '../../store/globalState';
import { showToast, escapeHtml } from '../../utils/ui';
import { pincodeData } from '../../store/pincodes';

export function showTodayTasks() {
  const content = document.getElementById('mainContainer');
  if (!content) return;

  const html = `
    <h2><i class="fas fa-tasks"></i> Today's Tasks</h2>
    <div class="filter-section">
      <input type="text" id="todayTaskSearch" class="search-box" placeholder="Search by Case ID, Pincode..." style="flex: 1; max-width: 500px;">
      <button class="btn btn-warning btn-sm" data-action="sorting:nearest">
        <i class="fas fa-location-arrow"></i> Sort by Nearest
      </button>
      <button class="btn btn-success btn-sm" data-action="sorting:pincode">
        <i class="fas fa-map-pin"></i> Sort by Pincode
      </button>
      <button class="btn btn-info btn-sm" data-action="employee:refreshTasks">
        <i class="fas fa-sync"></i> Refresh
      </button>
    </div>
    <div id="todayTasksList">
      <div class="loading-spinner show"><i class="fas fa-spinner"></i> Loading...</div>
    </div>
  `;
  content.innerHTML = html;
  
  // Setup search listener
  let searchTimeout;
  const searchInput = document.getElementById('todayTaskSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => loadTodayTasks(e.target.value), 300);
    });
  }

  loadTodayTasks();
}

export async function loadTodayTasks(searchTerm = "") {
  try {
    const ts = Date.now();
    const url = `/api/tasks?role=employee&status=active&employeeId=${state.currentUser.id}&_t=${ts}` + 
                (searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '');
    
    const res = await fetch(url, { cache: 'no-store' });
    const tasks = await res.json();
    
    const rawTasks = Array.isArray(tasks) ? tasks : [];
    const activeTasks = rawTasks.filter(task => {
      const s = (task.status || '').toLowerCase();
      return s === 'pending' || s === 'in progress';
    });

    state.allEmployeeTasks = activeTasks;
    displayEmployeeTasks(activeTasks);
  } catch (err) {
    console.error('Error loading tasks:', err);
    const list = document.getElementById('todayTasksList');
    if (list) list.innerHTML = '<div class="empty-state"><h3>Error Loading Tasks</h3></div>';
  }
}

function displayEmployeeTasks(tasks) {
  const list = document.getElementById('todayTasksList');
  if (!list) return;
  
  if (tasks.length === 0) {
    list.innerHTML = `<div class="empty-state"><h3>All Clear!</h3><p>No tasks assigned for today.</p></div>`;
    return;
  }

  list.innerHTML = tasks.map((task, index) => `
    <div class="mobile-optimized-card" data-action="task:openPanel" data-id="${task.id}">
      <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:12px;">
        <div style="flex:1;">
          <h3 style="margin:0 0 4px 0; color:#f8fafc; font-size:16px;">${escapeHtml(task.title)}</h3>
          <div style="font-size:12px; color:#94a3b8; display:flex; gap:10px; flex-wrap:wrap;">
            <span><i class="fas fa-user-tie"></i> ${escapeHtml(task.clientName)}</span>
            <span class="pincode-tag"><i class="fas fa-map-pin"></i> ${task.pincode}</span>
          </div>
        </div>
        <span class="status-badge status-${task.status.toLowerCase().replace(/ /g, '-')}">${task.status}</span>
      </div>
      <div style="display:flex; gap:10px; margin-top:10px;">
        <button class="btn btn-primary btn-sm" data-action="task:openPanel" data-id="${task.id}">View Details</button>
      </div>
    </div>
  `).join('');
}
