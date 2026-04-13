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
      ${renderTaskSkeleton()}
    </div>
  `;
  content.innerHTML = html;
  
  // Attach search debounce
  const searchInput = document.getElementById('todayTaskSearch');
  if (searchInput) {
    let timeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(searchTodayTasks, 300);
    });
  }

  loadTodayTasks();
}

export function searchTodayTasks() {
  const searchEl = document.getElementById('todayTaskSearch');
  if (!searchEl) return;
  
  const term = searchEl.value.toLowerCase();
  const filtered = state.allEmployeeTasks.filter(t => 
    (t.title || '').toLowerCase().includes(term) || 
    String(t.pincode || '').includes(term) || 
    (t.address || '').toLowerCase().includes(term) ||
    (t.clientName || t.client_name || '').toLowerCase().includes(term)
  );
  
  displayEmployeeTasks(filtered);
}


export async function loadTodayTasks(searchTerm = '') {
  try {
    const list = document.getElementById('todayTasksList');
    if (list) list.innerHTML = renderTaskSkeleton();

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

function renderTaskSkeleton() {
  let skeletons = '';
  for (let i = 0; i < 4; i++) {
    skeletons += `
      <div class="mobile-optimized-card skeleton-card" style="background:#1e293b; border:1px solid #334155; border-radius:12px; padding:16px; margin-bottom:16px; opacity:0.6;">
        <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
           <div class="skeleton" style="height:18px; width:60%; border-radius:4px;"></div>
           <div class="skeleton" style="height:18px; width:60px; border-radius:10px;"></div>
        </div>
        <div class="skeleton" style="height:12px; width:40%; margin-bottom:10px;"></div>
        <div class="skeleton" style="height:10px; width:20%;"></div>
      </div>
    `;
  }
  return skeletons;
}

export function displayEmployeeTasks(tasks) {
  const list = document.getElementById('todayTasksList');
  if (!list) return;

  if (tasks.length === 0) {
    list.innerHTML = `<div class="empty-state view-fade-in">
      <i class="fas fa-check-circle" style="font-size:3rem; color:#10b981; margin-bottom:15px;"></i>
      <h3>All Clear!</h3>
      <p>No tasks assigned for today.</p>
    </div>`;
    return;
  }

  // Define logic for badges (SLA/Approx/Distance)
  const renderTask = (task) => {
    const statusClass = `status-${task.status.toLowerCase().replace(/\s/g, '-')}`;
    const mapLink = task.map_url || task.mapUrl || task.mapurl;
    const isApprox = (!parseFloat(task.latitude) || !parseFloat(task.longitude)) && task.pincode && pincodeData[task.pincode];
    const distanceBadge = task.distanceKm 
      ? `<span style="background:rgba(16,185,129,0.1); color:#34d399; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:600;"><i class="fas fa-route"></i> ${task.distanceKm} km</span>`
      : '';

    return `
      <div class="mobile-optimized-card gpu-boost" data-action="task:openPanel" data-id="${task.id}" style="opacity: 0; transform: translateY(15px); contain: layout style;">
        <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:12px;">
          <div style="flex:1;">
            <h3 style="margin:0 0 6px 0; color:#f8fafc; font-size:16px; font-weight:600;">
              <i class="fas fa-clipboard-list" style="color:#818cf8; margin-right:6px;"></i>
              ${escapeHtml(task.title)}
            </h3>
            <div style="font-size:13px; color:#94a3b8; display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
              <span><i class="fas fa-user-tie"></i> ${escapeHtml(task.clientName || task.client_name || 'No Client')}</span>
              <span class="pincode-tag"><i class="fas fa-map-pin" style="color:#60a5fa;"></i> ${task.pincode}</span>
              ${distanceBadge}
              ${isApprox ? `<span class="badge-approx">Approx Area</span>` : ''}
            </div>
          </div>
          <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
            <span class="status-badge ${statusClass}">${task.status}</span>
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px; border-top:1px solid rgba(255,255,255,0.05); padding-top:12px;">
          <span style="color:#6366f1; font-size:12px; font-weight:600;">View details <i class="fas fa-chevron-right" style="font-size:10px; margin-left:3px;"></i></span>
        </div>
      </div>
    `;
  };

  // Performance: Batch DOM updates using DocumentFragment
  const container = document.createElement('div');
  container.className = 'task-grid-container';
  container.style.cssText = 'display: grid; gap: 16px;';
  
  const header = `<div style="color:#94a3b8; font-size:13px; margin-bottom:15px; display:flex; align-items:center; gap:8px;" class="view-fade-in">
      <i class="fas fa-info-circle"></i>
      <span>Found <strong>${tasks.length}</strong> active task(s) for your current shift</span>
    </div>`;
  
  list.innerHTML = header;
  list.appendChild(container);

  // Lazy reveal logic
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        requestAnimationFrame(() => {
          entry.target.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '50px' });

  // Progressive rendering for ultra-smooth feel
  tasks.forEach((task, i) => {
    const div = document.createElement('div');
    div.innerHTML = renderTask(task);
    const card = div.firstElementChild;
    container.appendChild(card);
    observer.observe(card);
  });
}
