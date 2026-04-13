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
      <div class="loading-spinner show"><i class="fas fa-spinner fa-spin"></i> Loading...</div>
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

export function displayEmployeeTasks(tasks) {
  const list = document.getElementById('todayTasksList');
  if (!list) return;

  if (tasks.length === 0) {
    list.innerHTML = `<div class="empty-state">
      <i class="fas fa-check-circle" style="font-size:3rem; color:#10b981; margin-bottom:15px;"></i>
      <h3>All Clear!</h3>
      <p>No tasks assigned for today.</p>
    </div>`;
    return;
  }

  // Define logic for badges (SLA/Approx/Distance)
  const tasksHtml = tasks.map((task, index) => {
    const statusClass = `status-${task.status.toLowerCase().replace(/\s/g, '-')}`;
    const mapLink = task.map_url || task.mapUrl || task.mapurl;
    
    // Approx Badge
    const isApprox = (!parseFloat(task.latitude) || !parseFloat(task.longitude)) && task.pincode && pincodeData[task.pincode];
    const approxBadge = isApprox
      ? `<span style="background:rgba(245,158,11,0.15); color:#f59e0b; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:500;" title="Pincode fallback location"><i class="fas fa-exclamation-triangle"></i> Approx Area</span>`
      : '';

    // Distance Badge (if available from VRP)
    const distanceBadge = task.distanceKm 
      ? `<span style="background:rgba(16,185,129,0.15); color:#34d399; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:500;"><i class="fas fa-route"></i> ${task.distanceKm} km</span>`
      : '';

    return `
      <div class="mobile-optimized-card" data-action="task:openPanel" data-id="${task.id}" style="opacity: 0; transform: translateY(20px); transition: all 0.3s ease;">
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
              ${approxBadge}
            </div>
          </div>
          <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
            ${mapLink ? `
              <button onclick="event.stopPropagation(); window.open('${escapeHtml(mapLink)}', '_blank')" 
                      class="btn btn-primary btn-sm" style="padding:5px 10px; font-size:11px; background:rgba(59,130,246,0.2); border:1px solid rgba(59,130,246,0.4); color:#60a5fa;">
                <i class="fas fa-map-marker-alt"></i> Navigate
              </button>
            ` : ''}
            <span class="status-badge ${statusClass}">${task.status}</span>
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px; border-top:1px solid rgba(255,255,255,0.05); padding-top:12px;">
          <span style="color:#6366f1; font-size:12px; font-weight:600;">Tap to view details <i class="fas fa-chevron-right" style="font-size:10px; margin-left:3px;"></i></span>
        </div>
      </div>
    `;
  }).join('');

  list.innerHTML = `
    <div style="color:#94a3b8; font-size:13px; margin-bottom:15px; display:flex; align-items:center; gap:8px;">
      <i class="fas fa-info-circle"></i>
      <span>Found <strong>${tasks.length}</strong> active task(s) for your current shift</span>
    </div>
    ${tasksHtml}
  `;

  // Hardware Accelerated Scroll Reveal (Legacy parity)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  list.querySelectorAll('.mobile-optimized-card').forEach(card => observer.observe(card));
}
