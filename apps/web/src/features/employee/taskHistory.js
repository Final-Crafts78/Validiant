/**
 * Employee: Task History Feature
 */
import { showToast, escapeHtml } from '../../utils/ui';
import { state } from '../../store/globalState';

export function showTaskHistory() {
  const content = document.getElementById('mainContainer');
  if (!content) return;

  const html = `
    <h2><i class="fas fa-history"></i> My Task History</h2>
    <div class="filter-section" style="display:flex; flex-wrap:wrap; gap:10px; background:#1e293b; padding:15px; border-radius:12px; margin-bottom:15px;">
      <input type="text" id="historySearch" class="search-box" placeholder="Search past tasks..." style="flex:1 1 200px;">
      <select id="historyStatusFilter" class="form-input" style="flex:0 1 150px;">
        <option value="all">All Rest</option>
        <option value="Completed">Completed</option>
        <option value="Verified">Verified</option>
        <option value="Rejected">Rejected</option>
      </select>
      <button class="btn btn-info btn-sm" data-action="employee:loadHistory"><i class="fas fa-search"></i> Apply</button>
    </div>
    
    <div id="historyTasksList">
      <div class="loading-spinner show"><i class="fas fa-spinner"></i> Fetching history...</div>
    </div>
  `;

  content.innerHTML = html;
  
  document.getElementById('historySearch')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loadHistoryTasks();
  });

  loadHistoryTasks();
}

export async function loadHistoryTasks() {
  const search = document.getElementById('historySearch')?.value || '';
  const status = document.getElementById('historyStatusFilter')?.value || 'all';

  let url = `/api/tasks?role=employee&employeeId=${state.currentUser.id}`;
  if (status !== 'all') url += `&status=${encodeURIComponent(status)}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;

  try {
    const res = await fetch(url);
    const tasks = await res.json();
    
    // Filter to only show inactive/completed statuses if "all" is selected
    const historyTasks = tasks.filter(t => {
      const s = (t.status || '').toLowerCase();
      if (status === 'all') {
        return s === 'completed' || s === 'verified' || s === 'rejected';
      }
      return true;
    });

    displayHistoryTasks(historyTasks);
  } catch (err) {
    console.error(err);
    const list = document.getElementById('historyTasksList');
    if (list) list.innerHTML = '<div class="empty-state"><h3>Error Loading History</h3></div>';
  }
}

function displayHistoryTasks(tasks) {
  const list = document.getElementById('historyTasksList');
  if (!list) return;

  if (!tasks || tasks.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-check-double" style="font-size: 3rem; color: #10B981; margin-bottom: 15px;"></i>
        <h3 style="color: #9CA3AF;">No History Found</h3>
      </div>
    `;
    return;
  }

  let html = `
    <div class="table-wrapper" style="overflow-x:auto;">
      <table class="data-table" style="width:100%; border-collapse:collapse; text-align:left;">
        <thead style="border-bottom:1px solid #334155;">
          <tr>
            <th style="padding:10px;">Date</th>
            <th style="padding:10px;">Case Details</th>
            <th style="padding:10px;">Pincode</th>
            <th style="padding:10px;">Status</th>
          </tr>
        </thead>
        <tbody>
  `;

  tasks.forEach(t => {
    const d = new Date(t.updated_at || t.created_at);
    html += `
      <tr style="border-bottom:1px solid #334155;">
        <td style="padding:12px 10px; color:#9ca3af; font-size:13px;">${d.toLocaleDateString()}</td>
        <td style="padding:12px 10px;">
          <strong style="color:#e5e7eb;">${escapeHtml(t.title)}</strong>
          ${t.clientName ? `<div style="font-size:11px; color:#6b7280;">${escapeHtml(t.clientName)}</div>` : ''}
        </td>
        <td style="padding:12px 10px; font-size:13px;">${escapeHtml(t.pincode)}</td>
        <td style="padding:12px 10px;">
          <span class="status-badge status-${(t.status || '').replace(/ /g, '-').toLowerCase()}">${escapeHtml(t.status)}</span>
        </td>
      </tr>
    `;
  });

  html += '</tbody></table></div>';
  list.innerHTML = html;
}
