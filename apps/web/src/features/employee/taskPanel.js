/**
 * Task Details Panel Feature
 */
import { state } from '../../store/globalState';
import { showToast, escapeHtml } from '../../utils/ui';
import { createModal, closeAllModals } from '../../utils/modals';

export async function openTaskPanel(taskId) {
  // Find task in state
  let task = state.allEmployeeTasks.find(t => t.id == taskId) || 
             state.allAdminTasks.find(t => t.id == taskId) ||
             state.allUnassignedTasks.find(t => t.id == taskId);

  // Fallback: fetch directly from API if not found in local state
  // This handles stale map markers after status updates without requiring a page refresh
  if (!task) {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { cache: 'no-store' });
      if (res.ok) {
        task = await res.json();
      }
    } catch (e) {
      console.error('[TaskPanel] API fallback fetch failed:', e);
    }
  }

  if (!task) {
    showToast('Task details not found. It may have been deleted.', 'error');
    return;
  }

  const html = `
    <div class="task-detail-view">
      <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:20px;">
        <div style="flex:1;">
          <h4 style="color:#94a3b8; font-size:12px; text-transform:uppercase; margin-bottom:5px;">Case Information</h4>
          <h2 style="margin:0; font-size:20px;">${escapeHtml(task.title)}</h2>
        </div>
        <div>
          ${getSlaBadge(task.created_at)}
        </div>
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

      <div class="task-actions-section" style="margin-top:25px; padding-top:20px; border-top:1px solid rgba(255,255,255,0.1);">
        <label style="display:block; font-size:11px; color:#94a3b8; text-transform:uppercase; margin-bottom:10px; font-weight:600;"><i class="fas fa-sync-alt"></i> Update Task Status</label>
        
        <div style="display:flex; gap:10px; margin-bottom:15px;">
          <select id="employee-panel-status" class="form-input" style="flex:1; background:#1e293b; border:1px solid #334155; color:#f8fafc; padding:10px; border-radius:8px;">
            <option value="Pending" ${task.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
            <option value="Left Job" ${task.status === 'Left Job' ? 'selected' : ''}>Left Job</option>
            <option value="Not Picking Call" ${task.status === 'Not Picking Call' ? 'selected' : ''}>Not Picking Call</option>
            <option value="Switch Off" ${task.status === 'Switch Off' ? 'selected' : ''}>Switch Off</option>
            <option value="Wrong Address" ${task.status === 'Wrong Address' ? 'selected' : ''}>Wrong Address</option>
            <option value="Does Not Reside" ${task.status === 'Does Not Reside' ? 'selected' : ''}>Does Not Reside</option>
            <option value="Unable To Verify" ${task.status === 'Unable To Verify' ? 'selected' : ''}>Unable To Verify</option>
          </select>
          <button class="btn btn-primary" onclick="window._updatePanelStatus(${task.id}, this)" style="padding:0 20px;">
            <i class="fas fa-save"></i> Save
          </button>
        </div>

        ${(task.map_url || task.mapUrl) ? `
          <div style="margin-top:20px;">
            <a href="${task.map_url || task.mapUrl}" target="_blank" class="btn btn-primary" 
               style="width:100%; justify-content:center; padding:14px; border-radius:10px; background:#3b82f6; border:none; color:white; font-weight:600; display:flex; align-items:center; gap:10px; box-shadow:0 4px 6px -1px rgba(59, 130, 246, 0.5); text-decoration:none;">
              <i class="fas fa-location-arrow"></i> Navigate to Location
            </a>
          </div>
        ` : (task.address ? `
          <div style="margin-top:20px;">
            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.address)}" target="_blank" class="btn btn-primary" 
               style="width:100%; justify-content:center; padding:14px; border-radius:10px; background:#8b5cf6; border:none; color:white; font-weight:600; display:flex; align-items:center; gap:10px; box-shadow:0 4px 6px -1px rgba(139, 92, 246, 0.5); text-decoration:none;">
              <i class="fas fa-search-location"></i> Search Address on Maps
            </a>
          </div>
        ` : '')}
      </div>
    </div>
  `;

  // Attach global handler for the save button
  window._updatePanelStatus = (tid, btnElem) => {
    if (btnElem) {
      btnElem.disabled = true;
      btnElem.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    }
    const sel = document.getElementById('employee-panel-status');
    if (sel) updateTaskStatus(tid, sel.value);
  };

  createModal('Task Details', html, { icon: 'fas fa-clipboard-list', size: 'medium' });
}

function getSlaBadge(createdAt) {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffHours = (now - createdDate) / (1000 * 60 * 60);
  
  if (diffHours < 24) {
    return `<span class="status-badge" style="background:rgba(16,185,129,0.15); color:#34d399; border:1px solid rgba(16,185,129,0.2); font-size:11px;"><i class="fas fa-check-circle"></i> Day 1</span>`;
  } else if (diffHours < 48) {
    return `<span class="status-badge" style="background:rgba(245,158,11,0.15); color:#f59e0b; border:1px solid rgba(245,158,11,0.2); font-size:11px;"><i class="fas fa-clock"></i> Day 2</span>`;
  } else {
    return `<span class="status-badge" style="background:rgba(239,68,68,0.15); color:#f87171; border:1px solid rgba(239,68,68,0.2); font-size:11px;"><i class="fas fa-exclamation-triangle"></i> Day 3+</span>`;
  }
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
