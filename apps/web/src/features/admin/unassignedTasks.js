import { showToast, escapeHtml } from '../../utils/ui';
import { createModal, closeAllModals } from '../../utils/modals';
import { toggleSelectAll, handleSingleSelection, clearSelection } from './bulkOperations';
import { state, fetchEmployeesIfStale } from '../../store/globalState';

export function showUnassignedTasks() {
  const content = document.getElementById('mainContainer');
  if (!content) return;
  
  // Clear any previous selection when switching to this view
  clearSelection();

  content.innerHTML = `
    <div class="view-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
      <h2><i class="fas fa-inbox"></i> Unassigned Tasks Pool</h2>
    </div>

    <div class="filter-section" style="display:flex; gap:10px; align-items:center; background:#1e293b; padding:15px; border-radius:12px; margin-bottom:15px; border:1px solid #334155;">
      <div style="position:relative; flex:1; max-width:400px;">
        <i class="fas fa-search" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#94a3b8;"></i>
        <input type="text" id="unassignedSearch" class="search-box" placeholder="Search by Case ID, Client, or Pincode..." style="width:100%; padding-left:35px;">
      </div>
      <button class="btn btn-info btn-sm" data-action="admin:searchUnassigned"><i class="fas fa-filter"></i> Apply Filters</button>
    </div>

    <div id="bulkActionsContainer" class="bulk-actions-bar" style="display:none;">
      <div class="bulk-info">
        <i class="fas fa-check-double"></i>
        <span id="selectedCountText">0 task(s) selected</span>
      </div>
      <div class="bulk-buttons">
        <button class="btn btn-primary btn-sm" data-action="admin:bulkAssignTasks"><i class="fas fa-user-plus"></i> Bulk Assign</button>
        <button class="btn btn-success btn-sm" data-action="admin:bulkCompleteTasks"><i class="fas fa-check-double"></i> Bulk Complete</button>
        <button class="btn btn-danger btn-sm" data-action="admin:bulkDeleteTasks"><i class="fas fa-trash"></i> Bulk Delete</button>
      </div>
    </div>

    <div id="unassignedTasksList">
      <div class="loading-spinner show"><i class="fas fa-spinner"></i> Loading...</div>
    </div>
  `;
  
  document.getElementById('unassignedSearch')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loadUnassignedTasks();
  });
  
  loadUnassignedTasks();
}

export async function loadUnassignedTasks() {
  const term = document.getElementById('unassignedSearch') ? document.getElementById('unassignedSearch').value : '';
  const timestamp = Date.now();
  let url = `/api/tasks/unassigned?_t=${timestamp}`;
  if (term) url += `&search=${encodeURIComponent(term)}`;
  
  try {
    const [tasksRes, employees] = await Promise.all([
      fetch(url, { cache: 'no-store' }).then(r => r.json()),
      fetchEmployeesIfStale()
    ]);
    state.allUnassignedTasks = Array.isArray(tasksRes) ? tasksRes : [];
    
    displayUnassignedList(state.allUnassignedTasks, employees);
  } catch (err) {
    console.error('❌ Error loading tasks:', err);
    showToast('Failed to load unassigned tasks', 'error');
  }
}

function displayUnassignedList(tasks, employees) {
  const list = document.getElementById('unassignedTasksList');
  if (!list) return;
  
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

  let empOptions = '<option value="">Choose Employee</option>';
  employees.forEach(e => {
    empOptions += `<option value="${e.id}">${escapeHtml(e.name)}</option>`;
  });

  let rows = tasks.map(t => {
    const mapLink = t.map_url || t.mapUrl || t.mapurl;
    return `
      <tr class="task-row" style="border-bottom:1px solid #334155; transition: background 0.2s;">
        <td style="padding:12px 15px; width:40px;">
          <input type="checkbox" class="task-checkbox unassigned-cb" value="${t.id}">
        </td>
        <td class="case-col" style="padding:12px 15px;">
          <strong class="case-id" style="color:#e5e7eb; font-weight:600;">${escapeHtml(t.title)}</strong>
        </td>
        <td class="client-col" style="padding:12px 15px;">
          <div style="display:flex; align-items:center; gap:8px; color:#cbd5e1;">
            <i class="fas fa-user-tie" style="color:#94a3b8; font-size:12px;"></i>
            <span>${escapeHtml(t.clientName || '---')}</span>
          </div>
        </td>
        <td class="pincode-col" style="padding:12px 15px;">
          <span class="pincode-badge" style="background:rgba(99,102,241,0.15); color:#a5b4fc; padding:4px 10px; border-radius:12px; font-size:12px; font-weight:500; border:1px solid rgba(99,102,241,0.3);">
            <i class="fas fa-map-pin" style="margin-right:4px; font-size:10px;"></i>${escapeHtml(t.pincode)}
          </span>
        </td>
        <td class="map-col" style="padding:12px 15px;">
          <div class="map-actions" style="display:flex; align-items:center; gap:8px;">
            ${mapLink 
              ? `<a href="${escapeHtml(mapLink)}" target="_blank" class="btn btn-secondary btn-sm" style="padding:4px 10px; font-size:12px; background:rgba(30,41,59,0.5); border-color:#334155;">
                   <i class="fas fa-external-link-alt" style="margin-right:4px;"></i> View
                 </a>` 
              : `<span class="no-map" style="color:#94a3b8; font-size:11px; font-style:italic;">No map</span>`
            }
            <button class="btn btn-secondary btn-sm" style="padding:4px 8px;" data-action="admin:editMapUrl" data-id="${t.id}">
              <i class="fas fa-pen"></i>
            </button>
          </div>
        </td>
        <td class="assign-col" style="padding:12px 15px;">
          <select id="emp-${t.id}" class="assign-select form-input" style="padding:6px; font-size:13px; width:100%; height:32px;">
            ${empOptions}
          </select>
        </td>
        <td class="actions-col" style="padding:12px 15px; text-align:right;">
          <button class="btn btn-success btn-sm" data-action="admin:quickAssign" data-id="${t.id}" style="padding:5px 12px;">
            <i class="fas fa-user-check"></i> Assign
          </button>
        </td>
      </tr>
    `;
  }).join('');

  list.innerHTML = `
    <div class="table-header-info" style="margin-bottom:15px; color:#94a3b8; font-size:13px;">
      <i class="fas fa-info-circle"></i> Found <strong>${tasks.length}</strong> tasks in the pool
    </div>
    <div class="table-wrapper" style="overflow-x:auto; background:#1e293b; border-radius:12px; border:1px solid #334155;">
      <table class="data-table unassigned-table" style="width:100%; border-collapse:collapse; text-align:left;">
        <thead style="background:rgba(15,23,42,0.4);">
          <tr style="border-bottom:1px solid #334155;">
            <th style="padding:12px 15px; width:40px;"><input type="checkbox" id="selectAllCb"></th>
            <th style="padding:12px 15px; color:#94a3b8; font-weight:600; text-transform:uppercase; font-size:11px; letter-spacing:0.5px;">Task Details</th>
            <th style="padding:12px 15px; color:#94a3b8; font-weight:600; text-transform:uppercase; font-size:11px; letter-spacing:0.5px;">Client Name</th>
            <th style="padding:12px 15px; color:#94a3b8; font-weight:600; text-transform:uppercase; font-size:11px; letter-spacing:0.5px;">Pincode</th>
            <th style="padding:12px 15px; color:#94a3b8; font-weight:600; text-transform:uppercase; font-size:11px; letter-spacing:0.5px;">Location</th>
            <th style="padding:12px 15px; color:#94a3b8; font-weight:600; text-transform:uppercase; font-size:11px; letter-spacing:0.5px;">Assign To</th>
            <th style="padding:12px 15px; color:#94a3b8; font-weight:600; text-transform:uppercase; font-size:11px; letter-spacing:0.5px; text-align:right;">Quick Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;

  // Attach Selection Event Listeners
  const selectAll = document.getElementById('selectAllCb');
  selectAll?.addEventListener('change', () => toggleSelectAll('unassigned-cb'));

  document.querySelectorAll('.unassigned-cb').forEach(cb => {
    cb.addEventListener('change', () => handleSingleSelection(cb));
  });
}

export async function quickAssignTask(taskId) {
  const select = document.getElementById(`emp-${taskId}`);
  if (!select) return;
  
  const empId = select.value;
  if (!empId) {
    showToast('Please select an employee first', 'warning');
    return;
  }
  
  try {
    const res = await fetch(`/api/tasks/${taskId}/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        employeeId: empId,
        userId: state.currentUser.id,
        userName: state.currentUser.name
      })
    });
    
    if (res.ok) {
      showToast('Task assigned successfully!', 'success');
      loadUnassignedTasks(); // refresh
    } else {
      const data = await res.json();
      showToast(data.message || 'Failed to assign task', 'error');
    }
  } catch (err) {
    showToast('Network error, assignment failed', 'error');
  }
}
