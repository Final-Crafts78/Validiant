/**
 * Admin: All Tasks Feature
 */
import { state } from '../../store/globalState';
import { showToast, escapeHtml } from '../../utils/ui';
import { createModal, closeAllModals } from '../../utils/modals';
import { toggleSelectAll, handleSingleSelection, clearSelection } from './bulkOperations';

let currentTaskPage = 1;
const TASKS_PER_PAGE = 25;

export function showAllTasks() {
  const content = document.getElementById('mainContainer');
  if (!content) return;

  // Clear any previous selection when switching to this view
  clearSelection();

  const html = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:20px;">
      <h2><i class="fas fa-list-alt"></i> All Tasks Overview</h2>
      <div>
        <button class="btn btn-success btn-sm" data-action="admin:exportTasks"><i class="fas fa-file-csv"></i> Export Data</button>
      </div>
    </div>
    
    <div class="filter-section" style="display:flex; flex-wrap:wrap; gap:10px; align-items:center; background:#1e293b; padding:15px; border-radius:12px; margin-bottom:15px; border:1px solid #334155;">
      <select id="allTasksStatusFilter" class="form-input" style="flex:1 1 140px;">
        <option value="all">All Statuses</option>
        <option value="Unassigned">Unassigned</option>
        <option value="Pending">Pending</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
        <option value="Verified">Verified</option>
        <option value="Rejected">Rejected</option>
        <option value="Left Job">Left Job</option>
        <option value="Not Picking Call">Not Picking</option>
        <option value="Switch Off">Switch Off</option>
        <option value="Wrong Address">Wrong Address</option>
        <option value="Does Not Reside">Does Not Reside</option>
        <option value="Unable To Verify">Unable To Verify</option>
      </select>

      <select id="allTasksEmployeeFilter" class="form-input" style="flex:1 1 180px;">
        <option value="all">All Employees / Unassigned</option>
      </select>

      <input type="text" id="allTasksPincodeFilter" class="form-input" placeholder="Pincode" style="flex:1 1 100px; max-width:120px;">
      <input type="date" id="allTasksFromDate" class="form-input" title="From Date" style="flex:1 1 130px; max-width:150px;">
      <input type="date" id="allTasksToDate" class="form-input" title="To Date" style="flex:1 1 130px; max-width:150px;">
      <input type="text" id="allTasksSearch" class="search-box" placeholder="Search Case ID, Client, Notes..." style="flex:1 1 220px; max-width:360px;">

      <button class="btn btn-info btn-sm" data-action="admin:loadAllTasks"><i class="fas fa-filter"></i> Apply</button>
      <button class="btn btn-secondary btn-sm" data-action="admin:resetTaskFilters"><i class="fas fa-undo"></i> Reset</button>
    </div>

    <div id="allTasksActiveFilters" class="active-filters" style="margin-bottom:15px;">
      <span class="filter-hint" style="color:#94a3b8; font-size:13px;">No filters applied. Showing latest tasks.</span>
    </div>

    <div id="bulkActionsContainer" class="bulk-actions-bar" style="display:none; margin-bottom:15px;">
      <div class="bulk-info">
        <i class="fas fa-check-double"></i>
        <span id="selectedCountText">0 task(s) selected</span>
      </div>
      <div class="bulk-buttons">
        <button class="btn btn-primary btn-sm" data-action="admin:bulkAssignTasks"><i class="fas fa-user-plus"></i> Bulk Assign</button>
        <button class="btn btn-danger btn-sm" data-action="admin:bulkDeleteTasks"><i class="fas fa-trash"></i> Bulk Delete</button>
      </div>
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
  document.getElementById('allTasksSearch')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loadAllTasks();
  });

  loadAllTasks();
}

export async function loadAllTasks() {
  const status = document.getElementById('allTasksStatusFilter')?.value || 'all';
  const empId = document.getElementById('allTasksEmployeeFilter')?.value || 'all';
  const pincode = document.getElementById('allTasksPincodeFilter')?.value?.trim() || '';
  const search = document.getElementById('allTasksSearch')?.value?.trim() || '';

  let url = `/api/tasks?role=admin`;
  if (status !== 'all') url += `&status=${encodeURIComponent(status)}`;
  if (empId !== 'all') url += `&employeeId=${encodeURIComponent(empId)}`;
  if (pincode) url += `&pincode=${encodeURIComponent(pincode)}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;

  try {
    // Premium Skeleton Loader while fetching
    const list = document.getElementById('allTasksList');
    if (list) list.innerHTML = renderTableSkeleton();

    const res = await fetch(url);
    const tasks = await res.json();
    
    state.allAdminTasks = Array.isArray(tasks) ? tasks : [];
    const filtered = applyDateFilter(state.allAdminTasks); 
    state.currentFilteredTasks = filtered;

    updateFilterChips();
    displayAllTasksList(filtered);
  } catch (err) {
    console.error(err);
    const list = document.getElementById('allTasksList');
    if (list) list.innerHTML = '<div class="empty-state"><h3>Error Loading Tasks</h3></div>';
  }
}

function renderTableSkeleton() {
  let rows = '';
  for (let i = 0; i < 8; i++) {
    rows += `
      <tr style="border-bottom: 1px solid #334155;">
        <td style="padding: 15px;"><div class="skeleton" style="height: 14px; width: 20px;"></div></td>
        <td style="padding: 15px;"><div class="skeleton" style="height: 14px; width: 60px;"></div></td>
        <td style="padding: 15px;"><div class="skeleton" style="height: 14px; width: 100px;"></div></td>
        <td style="padding: 15px;"><div class="skeleton" style="height: 14px; width: 80px;"></div></td>
        <td style="padding: 15px;"><div class="skeleton" style="height: 14px; width: 100px;"></div></td>
        <td style="padding: 15px;"><div class="skeleton" style="height: 14px; width: 50px;"></div></td>
        <td style="padding: 15px;"><div class="skeleton" style="height: 14px; width: 40px;"></div></td>
        <td style="padding: 15px;"><div class="skeleton" style="height: 20px; width: 70px; border-radius: 10px;"></div></td>
        <td style="padding: 15px;"><div class="skeleton" style="height: 14px; width: 60px;"></div></td>
        <td style="padding: 15px;"><div class="skeleton" style="height: 24px; width: 50px; border-radius: 6px;"></div></td>
      </tr>
    `;
  }
  return `
    <div class="table-wrapper skeleton-table" style="overflow: hidden; background: #1e293b; border-radius: 8px; border: 1px solid #334155; opacity: 0.6;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead><tr style="border-bottom: 1px solid #475569;"><th colspan="10" style="padding: 20px;"><div class="skeleton" style="height: 10px; width: 30%;"></div></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function applyDateFilter(tasks) {
  const fromVal = document.getElementById('allTasksFromDate')?.value;
  const toVal = document.getElementById('allTasksToDate')?.value;
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

export function resetAllTaskFilters() {
  if (document.getElementById('allTasksStatusFilter')) document.getElementById('allTasksStatusFilter').value = 'all';
  if (document.getElementById('allTasksEmployeeFilter')) document.getElementById('allTasksEmployeeFilter').value = 'all';
  if (document.getElementById('allTasksPincodeFilter')) document.getElementById('allTasksPincodeFilter').value = '';
  if (document.getElementById('allTasksFromDate')) document.getElementById('allTasksFromDate').value = '';
  if (document.getElementById('allTasksToDate')) document.getElementById('allTasksToDate').value = '';
  if (document.getElementById('allTasksSearch')) document.getElementById('allTasksSearch').value = '';
  loadAllTasks();
}

function updateFilterChips() {
  const container = document.getElementById('allTasksActiveFilters');
  if (!container) return;
  const chips = [];
  
  const status = document.getElementById('allTasksStatusFilter')?.value;
  if(status && status !== 'all') chips.push(`Status: ${status}`);
  
  const search = document.getElementById('allTasksSearch')?.value;
  if(search) chips.push(`Search: ${search}`);

  if (chips.length === 0) {
    container.innerHTML = '<span class="filter-hint" style="color:#94a3b8; font-size:13px;">No filters applied. Showing latest tasks.</span>';
  } else {
    container.innerHTML = chips.map(c => `<span class="filter-chip" style="display:inline-block; background:rgba(99,102,241,0.2); border:1px solid #6366f1; color:#a5b4fc; margin-right:5px; padding:3px 8px; border-radius:12px; font-size:12px;"><i class="fas fa-tag"></i> ${escapeHtml(c)}</span>`).join('');
  }
}

function displayAllTasksList(tasks) {
  const list = document.getElementById('allTasksList');
  if (!list) return;

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

  const totalPages = Math.ceil(tasks.length / TASKS_PER_PAGE);
  if (currentTaskPage > totalPages) currentTaskPage = 1; 
  
  const startIndex = (currentTaskPage - 1) * TASKS_PER_PAGE;
  const endIndex = startIndex + TASKS_PER_PAGE;
  const tasksToDisplay = tasks.slice(startIndex, endIndex);

  let html = `
    <div class="table-header-info gpu-boost" style="margin-bottom:15px; color:#cbd5e1; display:flex; justify-content:space-between; align-items:center;">
      <span><i class="fas fa-list"></i> Showing <strong>${startIndex + 1}-${Math.min(endIndex, tasks.length)}</strong> of <strong>${tasks.length}</strong> tasks</span>
      
      <div id="bulkActionsContainer" style="display:none; animation: slideIn 0.2s ease;">
        <div style="display:flex; align-items:center; gap:12px; background:rgba(99,102,241,0.1); border:1px solid rgba(99,102,241,0.3); padding:6px 15px; border-radius:12px;">
          <span id="selectedCountText" style="font-size:13px; color:#a5b4fc; font-weight:600;">0 selected</span>
          <div style="width:1px; height:16px; background:rgba(255,255,255,0.1);"></div>
          <button class="btn btn-primary btn-sm" data-action="admin:bulkAssignTasks" style="padding:4px 10px; font-size:12px;"><i class="fas fa-user-plus"></i> Assign</button>
          <button class="btn btn-danger btn-sm" data-action="admin:bulkDeleteTasks" style="padding:4px 10px; font-size:12px; background:rgba(239,68,68,0.2); border-color:rgba(239,68,68,0.4);"><i class="fas fa-trash"></i> Delete</button>
        </div>
      </div>
    </div>
    <div class="table-wrapper gpu-boost" style="overflow-x: auto; background: #1e293b; border-radius: 8px; border: 1px solid #334155; contain: content;">
      <table class="data-table" id="allTasksTable" style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead style="border-bottom: 1px solid #334155;">
          <tr>
            <th style="padding: 12px 15px; color: #94A3B8; width:40px;"><input type="checkbox" id="selectAllCb"></th>
            <th style="padding: 12px 15px; color: #94A3B8; min-width: 80px;">Date</th>
            <th style="padding: 12px 15px; color: #94A3B8;">Case ID</th>
            <th style="padding: 12px 15px; color: #94A3B8;">Client</th>
            <th style="padding: 12px 15px; color: #94A3B8;">Employee</th>
            <th style="padding: 12px 15px; color: #94A3B8;">Pincode</th>
            <th style="padding: 12px 15px; color: #94A3B8;">Map</th>
            <th style="padding: 12px 15px; color: #94A3B8;">Status</th>
            <th style="padding: 12px 15px; color: #94A3B8;">SLA (72h)</th>
            <th style="padding: 12px 15px; color: #94A3B8; text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody>
  `;

  tasksToDisplay.forEach(t => {
    // Legacy Date Format
    let dateStr = '-';
    if(t.created_at || t.assigned_date) {
       const d = new Date(t.created_at || t.assigned_date);
       dateStr = d.toLocaleDateString('en-IN', {day:'2-digit', month:'short'});
    }

    const isUnassigned = !t.assigned_to || t.assigned_to === 'Unassigned' || !t.assignedToName;
    const assigneeName = isUnassigned ? 'Unassigned' : t.assignedToName;
    
    // SLA Calculation Logic
    let slaBadge = '<span class="status-badge" style="background:#374151; color:#9ca3af; font-size:11px;">N/A</span>';
    const assignedDate = t.assigned_date || t.assignedDate;
    if (t.status !== 'Unassigned' && assignedDate) {
        const assignedTime = new Date(assignedDate).getTime();
        let endTime = new Date().getTime(); 
        
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

    const mapLink = t.map_url || t.mapUrl || '';
    const mapDisplay = `
      <div class="map-actions" style="display:flex; align-items:center; gap:8px;">
        ${mapLink 
          ? `<a href="${mapLink}" target="_blank" class="btn btn-secondary btn-sm" style="padding:4px 10px; font-size:12px; background:rgba(30,41,59,0.5); border-color:#334155;">
               <i class="fas fa-external-link-alt" style="margin-right:4px;"></i> View
             </a>` 
          : `<span class="no-map" style="color:#94a3b8; font-size:11px; font-style:italic;">No map</span>`
        }
        <button class="btn btn-secondary btn-sm" style="padding:4px 8px;" data-action="admin:editMapUrl" data-id="${t.id}">
          <i class="fas fa-pen"></i>
        </button>
      </div>
    `;

    html += `
      <tr class="task-row" style="border-bottom: 1px solid #334155;">
        <td style="padding: 12px 15px;"><input type="checkbox" class="task-checkbox all-tasks-cb" value="${t.id}"></td>
        <td style="padding: 12px 15px; color: #94A3B8; font-size: 13px;">${dateStr}</td>
        <td style="padding: 12px 15px; font-weight: 500; color: #F8FAFC;">${escapeHtml(t.title)}</td>
        <td style="padding: 12px 15px; color: #cbd5e1; font-size: 13px;">
          <div style="display:flex; align-items:center; gap:6px;">
            <i class="fas fa-user-tie" style="color:#64748b; font-size:11px;"></i>
            ${escapeHtml(t.clientName || '-')}
          </div>
        </td>
        <td style="padding: 12px 15px;">
          ${isUnassigned 
            ? `<span style="color: #F59E0B; font-size: 13px;"><i class="fas fa-exclamation-circle"></i> Unassigned</span>`
            : `<span style="color: #60A5FA; font-size: 13px;"><i class="fas fa-user-circle"></i> ${escapeHtml(assigneeName)}</span>`
          }
        </td>
        <td style="padding: 12px 15px; font-size: 13px; color: #94A3B8;">${escapeHtml(t.pincode)}</td>
        <td style="padding: 12px 15px;">${mapDisplay}</td>
        <td style="padding: 12px 15px;">
          <span class="status-badge status-${t.status.replace(/ /g, '-').toLowerCase()}" style="font-size: 11px;">
            ${t.status}
          </span>
        </td>
        <td style="padding: 12px 15px;">${slaBadge}</td>
        <td style="padding: 12px 15px; text-align:right;">
          <button class="btn btn-primary btn-sm" data-action="admin:openTaskDetails" data-id="${t.id}" style="padding: 5px 12px; font-weight: 600;">
            <i class="fas fa-eye"></i> View Details
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

  // Pagination UI
  if (totalPages > 1) {
    html += `
      <div class="pagination" style="display: flex; justify-content: center; align-items: center; gap: 15px; margin-top: 20px;">
        <button class="btn btn-secondary btn-sm" data-action="admin:prevPage" ${currentTaskPage === 1 ? 'disabled' : ''}>
          <i class="fas fa-chevron-left"></i> Previous
        </button>
        <span style="color: #94A3B8; font-size: 14px;">Page ${currentTaskPage} of ${totalPages}</span>
        <button class="btn btn-secondary btn-sm" data-action="admin:nextPage" ${currentTaskPage === totalPages ? 'disabled' : ''}>
          Next <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    `;
  }

  list.innerHTML = html;

  // Attach Selection Event Listeners
  const selectAll = document.getElementById('selectAllCb');
  const bulkContainer = document.getElementById('bulkActionsContainer');
  const countText = document.getElementById('selectedCountText');

  const updateBulkUI = () => {
    const selected = document.querySelectorAll('.all-tasks-cb:checked');
    if (bulkContainer) {
      bulkContainer.style.display = selected.length > 0 ? 'block' : 'none';
    }
    if (countText) {
      countText.textContent = `${selected.length} selected`;
    }
  };

  selectAll?.addEventListener('change', () => {
    toggleSelectAll('all-tasks-cb');
    updateBulkUI();
  });

  document.querySelectorAll('.all-tasks-cb').forEach(cb => {
    cb.addEventListener('change', () => {
      handleSingleSelection(cb);
      updateBulkUI();
    });
  });
}

export function prevTaskPage() {
  if (currentTaskPage > 1) {
    currentTaskPage--;
    displayAllTasksList(state.currentFilteredTasks || state.allAdminTasks);
  }
}

export function nextTaskPage() {
  const tasks = state.currentFilteredTasks || state.allAdminTasks;
  const totalPages = Math.ceil(tasks.length / TASKS_PER_PAGE);
  if (currentTaskPage < totalPages) {
    currentTaskPage++;
    displayAllTasksList(tasks);
  }
}
