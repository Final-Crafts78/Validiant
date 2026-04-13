/**
 * Task Details Panel Feature
 */
import { state } from '../../store/globalState';
import { showToast, escapeHtml } from '../../utils/ui';
import { createModal, closeAllModals } from '../../utils/modals';

export async function openTaskPanel(taskId) {
  // Find task in state
  const task = state.allEmployeeTasks.find(t => t.id == taskId) || 
               state.allAdminTasks.find(t => t.id == taskId) ||
               state.allUnassignedTasks.find(t => t.id == taskId);
               
  if (!task) {
    showToast('Task details not found in current view.', 'error');
    return;
  }

  const html = `
    <div class="task-detail-view">
      <div style="margin-bottom:20px;">
        <h4 style="color:#94a3b8; font-size:12px; text-transform:uppercase; margin-bottom:5px;">Case Information</h4>
        <h2 style="margin:0; font-size:20px;">${escapeHtml(task.title)}</h2>
      </div>

      <div class="form-grid" style="grid-template-columns: 1fr; gap:15px;">
        <div class="info-row">
          <label><i class="fas fa-user-tie"></i> Client Name</label>
          <div>${escapeHtml(task.clientName)}</div>
        </div>
        <div class="info-row">
          <label><i class="fas fa-map-pin"></i> Pincode</label>
          <div>${task.pincode}</div>
        </div>
        <div class="info-row">
          <label><i class="fas fa-sticky-note"></i> Notes</label>
          <div style="background:rgba(0,0,0,0.2); padding:10px; border-radius:8px; font-size:13px; white-space:pre-wrap;">${escapeHtml(task.notes || 'No notes provided')}</div>
        </div>
      </div>

      <div class="modal-actions" style="margin-top:25px; display:flex; flex-direction:column; gap:10px;">
        ${task.map_url ? `
          <a href="${task.map_url}" target="_blank" class="btn btn-info" style="width:100%; justify-content:center;">
            <i class="fas fa-directions"></i> Open in Maps
          </a>
        ` : ''}
        
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
          <button class="btn btn-success" data-action="task:updateStatus" data-id="${task.id}" data-status="Completed">
            <i class="fas fa-check"></i> Mark Completed
          </button>
          <button class="btn btn-warning" data-action="task:updateStatus" data-id="${task.id}" data-status="In Progress">
            <i class="fas fa-clock"></i> In Progress
          </button>
        </div>
      </div>
    </div>
  `;

  createModal('Task Details', html, { icon: 'fas fa-info-circle', size: 'medium' });
}

export async function updateTaskStatus(taskId, status) {
  try {
    const res = await fetch(`/api/tasks/${taskId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        userId: state.currentUser.id,
        userName: state.currentUser.name
      })
    });
    
    if (res.ok) {
      showToast(`Status updated to ${status}`, 'success');
      closeAllModals();
      // Trigger a refresh of the current view if needed
      if (window._currentRefreshHandler) window._currentRefreshHandler();
    } else {
      showToast('Failed to update status', 'error');
    }
  } catch (err) {
    showToast('Network error', 'error');
  }
}
