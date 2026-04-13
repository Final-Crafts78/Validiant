/**
 * Admin: Unassigned Tasks Pool Feature
 */
import { showToast, escapeHtml } from '../../utils/ui';
import { createModal, closeAllModals } from '../../utils/modals';

export function showUnassignedTasks() {
  const content = document.getElementById('mainContainer');
  if (!content) return;
  
  content.innerHTML = `
    <h2><i class="fas fa-inbox"></i> Unassigned Tasks Pool</h2>
    <div class="filter-section">
      <input type="text" id="unassignedSearch" class="search-box" placeholder="Search by Case ID or Pincode..." style="max-width: 400px;">
      <button class="btn btn-info btn-sm" data-action="admin:searchUnassigned"><i class="fas fa-search"></i> Search</button>
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
    const res = await fetch(url, { cache: 'no-store' });
    const tasks = await res.json();
    
    const empRes = await fetch(`/api/users?_t=${timestamp}`, { cache: 'no-store' });
    const employees = await empRes.json();
    
    displayUnassignedList(tasks, employees);
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
      <tr class="task-row">
        <td class="case-col">
          <div class="task-info">
            <strong class="case-id" style="color:#e5e7eb;">${escapeHtml(t.title)}</strong>
            ${t.clientName ? `<small class="client-name" style="color:#9ca3af;">${escapeHtml(t.clientName)}</small>` : ''}
          </div>
        </td>
        <td class="pincode-col">
          <span class="pincode-badge" style="background:rgba(99,102,241,0.2);color:#818cf8;padding:2px 8px;border-radius:12px;">${escapeHtml(t.pincode)}</span>
        </td>
        <td class="map-col">
          <div class="map-actions">
            ${mapLink 
              ? `<a href="${escapeHtml(mapLink)}" target="_blank" class="map-link btn-sm" style="color:#60a5fa;"><i class="fas fa-map-marker-alt"></i> View</a>` 
              : `<span class="no-map" style="color:#ef4444;font-size:12px;">No map</span>`
            }
          </div>
        </td>
        <td class="assign-col">
          <select id="emp-${t.id}" class="assign-select form-input" style="padding:5px;">
            ${empOptions}
          </select>
        </td>
        <td class="actions-col">
          <button class="btn btn-success btn-sm" data-action="admin:quickAssign" data-id="${t.id}">
            <i class="fas fa-user-check"></i> Assign
          </button>
        </td>
      </tr>
    `;
  }).join('');

  list.innerHTML = `
    <div class="table-header-info" style="margin-bottom:15px;color:#cbd5e1;">
      <i class="fas fa-inbox"></i> Found <strong>${tasks.length}</strong> unassigned tasks
    </div>
    <div class="table-wrapper" style="overflow-x:auto;">
      <table class="data-table unassigned-table" style="width:100%; border-collapse:collapse; text-align:left;">
        <thead>
          <tr style="border-bottom:1px solid #334155;">
            <th style="padding:10px;">Task Details</th>
            <th style="padding:10px;">Pincode</th>
            <th style="padding:10px;">Location</th>
            <th style="padding:10px;">Assign To</th>
            <th style="padding:10px;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
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
      body: JSON.stringify({ employeeId: empId })
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
