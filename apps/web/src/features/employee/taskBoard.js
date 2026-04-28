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


export async function loadTodayTasks(searchTerm = "") {
  try {
    const list = document.getElementById('todayTasksList');
    if (list) list.innerHTML = renderTaskSkeleton();

    if (state.featureFlags.executive_map_edit === undefined) {
      try {
        const flagRes = await fetch('/api/settings/executive_map_edit');
        const flagData = await flagRes.json();
        state.featureFlags.executive_map_edit = (flagData.success && flagData.value) ? flagData.value : {};
      } catch (e) {
        state.featureFlags.executive_map_edit = {};
      }
    }

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
    list.innerHTML = `<div class="empty-state">
      <i class="fas fa-check-circle" style="font-size:3rem; color:#10b981; margin-bottom:15px;"></i>
      <h3>All Clear!</h3>
      <p>No tasks assigned for today.</p>
    </div>`;
    return;
  }

  const tasksHtml = tasks.map((task, index) => {
    const statusClass = `status-${task.status.toLowerCase().replace(/\s/g, '-')}`;
    const mapLink = task.map_url || task.mapUrl || task.mapurl;
    
    // SLA Badge Logic
    const createdDate = new Date(task.created_at);
    const now = new Date();
    const diffHours = (now - createdDate) / (1000 * 60 * 60);
    
    let slaBadge = '';
    if (diffHours < 24) {
      slaBadge = `<span class="status-badge" style="background:rgba(16,185,129,0.15); color:#34d399; border:1px solid rgba(16,185,129,0.2); font-size:11px;"><i class="fas fa-check-circle"></i> Day 1</span>`;
    } else if (diffHours < 48) {
      slaBadge = `<span class="status-badge" style="background:rgba(245,158,11,0.15); color:#f59e0b; border:1px solid rgba(245,158,11,0.2); font-size:11px;"><i class="fas fa-clock"></i> Day 2</span>`;
    } else {
      slaBadge = `<span class="status-badge" style="background:rgba(239,68,68,0.15); color:#f87171; border:1px solid rgba(239,68,68,0.2); font-size:11px;"><i class="fas fa-exclamation-triangle"></i> Day 3+</span>`;
    }

    // Approx Badge
    const isApprox = (!parseFloat(task.latitude) || !parseFloat(task.longitude)) && task.pincode && pincodeData[task.pincode];
    const approxBadge = isApprox
      ? `<span style="background:rgba(245,158,11,0.15); color:#f59e0b; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:500;" title="Pincode fallback location"><i class="fas fa-exclamation-triangle"></i> Approx Area</span>`
      : '';

    // Distance Badge (if available from VRP)
    const distanceBadge = task.distanceKm 
      ? `<span style="background:rgba(16,185,129,0.15); color:#34d399; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:500;"><i class="fas fa-route"></i> ${task.distanceKm} km</span>`
      : '';

    const canEditMap = state.featureFlags.executive_map_edit[state.currentUser.id] === true && state.currentUser.role === 'employee';
    const confidence = parseFloat(task.geocode_confidence) || 0;
    const hasCoords = parseFloat(task.latitude) && parseFloat(task.longitude);
    const noMapLink = !mapLink;
    
    // The inline 'Add Map Link' badge is removed since it's becoming a full button below
    const addMapBadge = '';

    return `
      <div class="mobile-optimized-card gpu-boost" data-action="task:openPanel" data-id="${task.id}" style="background:#1e293b; border:1px solid #334155; border-radius:12px; padding:16px; margin-bottom:16px; box-shadow:0 4px 6px rgba(0,0,0,0.1); cursor:pointer; opacity: 0; transform: translateY(20px); transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1); contain: content;">
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
              ${addMapBadge}
            </div>
            ${task.notes ? `
              <div class="task-notes-preview" style="font-size:12px; color:#64748b; margin-top:8px; display:flex; gap:6px; align-items:start; background:rgba(0,0,0,0.1); padding:6px 8px; border-radius:6px; border-left:2px solid #6366f1;">
                <i class="fas fa-sticky-note" style="margin-top:2px; color:#818cf8; font-size:10px;"></i>
                <span style="display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; line-height:1.4;">${escapeHtml(task.notes)}</span>
              </div>
            ` : ''}
          </div>
          <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
            <span class="status-badge ${statusClass}">${task.status}</span>
            ${slaBadge}
            <div onclick="event.stopPropagation();" style="margin-top:auto;">
              ${(() => {
                if (mapLink) {
                  return `
                    <button onclick="window.open('${escapeHtml(mapLink)}', '_blank')" 
                            class="btn btn-primary btn-sm navigate-btn-elite" 
                            style="padding:10px 20px; font-size:12px; background:#3b82f6; border:none; color:white; border-radius:8px; box-shadow:0 4px 6px -1px rgba(59, 130, 246, 0.5); width:100%; display:flex; align-items:center; justify-content:center; gap:8px; cursor:pointer; transition: transform 0.1s active;">
                      <i class="fas fa-location-arrow" style="font-size:14px;"></i> 
                      <span style="font-weight:600;">Navigate</span>
                    </button>
                  `;
                } else if (hasCoords && confidence >= 95) {
                  return `
                    <button onclick="window.open('https://www.google.com/maps/search/?api=1&query=${task.latitude},${task.longitude}', '_blank')" 
                            class="btn btn-primary btn-sm navigate-btn-elite" 
                            style="padding:10px 20px; font-size:12px; background:#3b82f6; border:none; color:white; border-radius:8px; box-shadow:0 4px 6px -1px rgba(59, 130, 246, 0.5); width:100%; display:flex; align-items:center; justify-content:center; gap:8px; cursor:pointer; transition: transform 0.1s active;">
                      <i class="fas fa-location-arrow" style="font-size:14px;"></i> 
                      <span style="font-weight:600;">Navigate</span>
                    </button>
                  `;
                } else if (hasCoords && confidence >= 75) {
                  return `
                    <button onclick="window.open('https://www.google.com/maps/search/?api=1&query=${task.latitude},${task.longitude}', '_blank')" 
                            class="btn btn-warning btn-sm navigate-btn-elite" 
                            style="padding:10px 20px; font-size:12px; background:#f59e0b; border:none; color:white; border-radius:8px; box-shadow:0 4px 6px -1px rgba(245, 158, 11, 0.5); width:100%; display:flex; align-items:center; justify-content:center; gap:8px; cursor:pointer; transition: transform 0.1s active;" title="Location is approximate">
                      <i class="fas fa-exclamation-triangle" style="font-size:14px;"></i> 
                      <span style="font-weight:600;">Navigate</span>
                    </button>
                  `;
                } else if (canEditMap) {
                  return `
                    <button onclick="event.stopPropagation(); const card = document.querySelector('[data-action=\\'task:openPanel\\'][data-id=\\'${task.id}\\']'); if(card) card.click(); setTimeout(() => { const btn = document.querySelector('#editMapContainer_${task.id}'); if(btn) { btn.style.display='block'; if(btn.previousElementSibling) btn.previousElementSibling.style.display='none'; } }, 300);" 
                            class="btn btn-primary btn-sm navigate-btn-elite" 
                            style="padding:10px 20px; font-size:12px; background:#6366f1; border:none; color:white; border-radius:8px; box-shadow:0 4px 6px -1px rgba(99, 102, 241, 0.5); width:100%; display:flex; align-items:center; justify-content:center; gap:8px; cursor:pointer; transition: transform 0.1s active;">
                      <i class="fas fa-plus-circle" style="font-size:14px;"></i> 
                      <span style="font-weight:600;">Add Map Link</span>
                    </button>
                  `;
                }
                return '';
              })()}
            </div>
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
