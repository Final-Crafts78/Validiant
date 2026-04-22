/**
 * Admin Actions - Single Task Interventions
 */
import { showToast, escapeHtml } from '../../utils/ui';
import { createModal, closeAllModals } from '../../utils/modals';
import { state } from '../../store/globalState';
import { loadUnassignedTasks } from './unassignedTasks';
import { loadAllTasks } from './allTasks';

export function openTaskDetailsModal(taskId) {
  const task = state.allAdminTasks?.find(t => t.id == taskId) 
            || state.currentFilteredTasks?.find(t => t.id == taskId);
            
  if (!task) {
    showToast('Task not found in current view', 'error');
    return;
  }
  
  const mapLink = task.map_url || task.mapUrl || task.mapurl;
  
  const content = `
    <div class="task-details-modal">
      <div class="task-header" style="margin-bottom: 25px; padding-bottom: 20px; border-bottom: 2px solid #374151;">
        <h2 style="margin: 0 0 10px 0; font-size: 20px; color: #E5E7EB; font-weight: 600;">
          <i class="fas fa-clipboard-list" style="color: #6366f1;"></i>
          ${escapeHtml(task.title)}
        </h2>
        <span class="status-badge status-${task.status.toLowerCase().replace(/\s/g, '-')}">
          ${escapeHtml(task.status)}
        </span>
      </div>
      
      <div class="task-info-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
        <div class="info-item">
          <div style="color: #9CA3AF; font-size: 12px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Client</div>
          <div style="color: #E5E7EB; font-size: 15px; font-weight: 500;">${escapeHtml(task.client_name || task.clientName || 'Unknown')}</div>
        </div>
        <div class="info-item">
          <div style="color: #9CA3AF; font-size: 12px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Pincode</div>
          <div style="color: #E5E7EB; font-size: 15px; font-weight: 500;">${escapeHtml(task.pincode)}</div>
        </div>
        <div class="info-item">
          <div style="color: #9CA3AF; font-size: 12px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Assigned To</div>
          <div style="color: #E5E7EB; font-size: 15px; font-weight: 500;">${task.employees ? escapeHtml(task.employees.name) : 'Unassigned'}</div>
        </div>
      </div>
      
      <div class="task-notes-section" style="background: rgba(15, 23, 42, 0.4); padding: 15px; border-radius: 8px; margin-bottom: 25px; position:relative;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div style="color: #9CA3AF; font-size: 12px; text-transform: uppercase;"><i class="fas fa-sticky-note"></i> Notes</div>
          <button class="btn btn-info btn-xs" data-action="admin:openEditNote" data-id="${task.id}" style="padding: 2px 8px; font-size: 11px;">
            <i class="fas fa-edit"></i> ${task.notes ? 'Edit' : 'Add'}
          </button>
        </div>
        <p style="margin: 0; color: #D1D5DB; font-size: 14px; line-height: 1.5; white-space: pre-wrap;">${task.notes ? escapeHtml(task.notes) : '<span style="color:#64748b; font-style:italic;">No remarks yet.</span>'}</p>
      </div>

      <div class="task-actions-section" style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #374151;">
        <button class="btn btn-warning" data-action="admin:openStatusUpdate" data-id="${task.id}" data-status="${escapeHtml(task.status)}">
          <i class="fas fa-tasks"></i> Update Status
        </button>
        <button class="btn btn-primary" data-action="admin:openReassign" data-id="${task.id}">
          <i class="fas fa-user-edit"></i> Reassign
        </button>
        <button class="btn btn-secondary" data-action="admin:openUnassign" data-id="${task.id}">
          <i class="fas fa-user-minus"></i> Unassign
        </button>
        ${mapLink ? `
          <a href="${escapeHtml(mapLink)}" target="_blank" class="btn btn-info">
            <i class="fas fa-map-marker-alt"></i> View Map
          </a>
        ` : ''}
        <button class="btn btn-secondary" data-action="admin:editMapUrl" data-id="${task.id}">
           <i class="fas fa-link"></i> Edit URL
        </button>
        <button class="btn btn-danger" data-action="admin:deleteTask" data-id="${task.id}">
          <i class="fas fa-trash-alt"></i> Delete Task
        </button>
      </div>
    </div>
  `;
  
  createModal('Task Details', content, { size: 'large' });
}

export function openStatusUpdateModal(taskId, currentStatus) {
  const content = `
    <div style="margin-bottom:15px; color:#9ca3af; font-size:13px;"><i class="fas fa-info-circle"></i> Update status for tracking:</div>
    <select id="updateStatusSelect" class="form-input">
      <option value="Unassigned" ${currentStatus==='Unassigned'?'selected':''}>Unassigned</option>
      <option value="Pending" ${currentStatus==='Pending'?'selected':''}>Pending</option>
      <option value="In Progress" ${currentStatus==='In Progress'?'selected':''}>In Progress</option>
      <option value="Completed" ${currentStatus==='Completed'?'selected':''}>Completed</option>
      <option value="Verified" ${currentStatus==='Verified'?'selected':''}>Verified (Admin)</option>
      <option value="Rejected" ${currentStatus==='Rejected'?'selected':''}>Rejected</option>
      <option value="Left Job" ${currentStatus==='Left Job'?'selected':''}>Left Job</option>
      <option value="Not Picking Call" ${currentStatus==='Not Picking Call'?'selected':''}>Not Picking</option>
      <option value="Switch Off" ${currentStatus==='Switch Off'?'selected':''}>Switch Off</option>
      <option value="Wrong Address" ${currentStatus==='Wrong Address'?'selected':''}>Wrong Address</option>
      <option value="Does Not Reside" ${currentStatus==='Does Not Reside'?'selected':''}>Does Not Reside</option>
      <option value="Unable To Verify" ${currentStatus==='Unable To Verify'?'selected':''}>Unable To Verify</option>
    </select>
    <div class="modal-actions" style="margin-top:20px;">
      <button class="btn btn-primary" data-action="admin:confirmStatusUpdate" data-id="${taskId}"><i class="fas fa-save"></i> Save Status</button>
    </div>
  `;
  createModal('Update Status', content, { size: 'medium' });
}

export async function confirmStatusUpdate(taskId) {
  const newStatus = document.getElementById('updateStatusSelect')?.value;
  if (!newStatus) return;

  try {
    const res = await fetch(`/api/tasks/${taskId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, userId: state.currentUser.id })
    });
    
    if (res.ok) {
      showToast('Status updated successfully', 'success');
      closeAllModals();
      if(document.getElementById('allTasksList')) loadAllTasks();
    } else {
      showToast('Failed to update status', 'error');
    }
  } catch (err) {
    showToast('Network error', 'error');
  }
}

export function openReassignModal(taskId) {
  let empOptions = '<option value="">Select Employee</option>';
  state.allEmployees?.forEach(e => {
    empOptions += `<option value="${e.id}">${escapeHtml(e.name)}</option>`;
  });

  const content = `
    <div class="reassign-form" style="display:flex; flex-direction:column; gap:20px;">
      <div class="form-info" style="display:flex; gap:12px; align-items:center; background:rgba(99,102,241,0.1); border:1px solid rgba(99,102,241,0.3); padding:15px; border-radius:8px; color:#a5b4fc; font-size:13px;">
        <i class="fas fa-info-circle"></i>
        <span>Select a new employee to assign this task</span>
      </div>
      
      <div class="form-group">
        <label for="reassignEmpId"><i class="fas fa-user"></i> Target Employee</label>
        <select id="reassignEmpId" class="form-input">${empOptions}</select>
      </div>
      <div class="modal-actions" style="display:flex; gap:10px; justify-content:flex-end; margin-top:10px; border-top:1px solid #1f2937; padding-top:15px;">
        <button class="btn btn-primary" data-action="admin:confirmReassign" data-id="${taskId}"><i class="fas fa-check"></i> Reassign Task</button>
        <button class="btn btn-secondary" onclick="document.querySelector('.modal').remove()"><i class="fas fa-times"></i> Cancel</button>
      </div>
    </div>
  `;
  createModal('Reassign Task', content, { icon: 'fa-sync-alt', size: 'medium' });
}

export async function confirmReassign(taskId) {
  const newEmpId = document.getElementById('reassignEmpId')?.value;
  if (!newEmpId) return showToast('Please select new employee', 'warning');

  try {
    const res = await fetch(`/api/tasks/${taskId}/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        employeeId: newEmpId, 
        userId: state.currentUser.id,
        userName: state.currentUser.name
      })
    });
    if (res.ok) {
      showToast('Task assigned successfully', 'success');
      closeAllModals();
      if(document.getElementById('allTasksList')) loadAllTasks();
      if(document.getElementById('unassignedTasksList')) loadUnassignedTasks();
    }
  } catch (err) {
    showToast('Failed to assign', 'error');
  }
}

export function openUnassignModal(taskId) {
  const task = state.allAdminTasks?.find(t => t.id == taskId) 
            || state.currentFilteredTasks?.find(t => t.id == taskId);
  const displayTitle = task ? escapeHtml(task.title) : 'this task';
  const displayClient = task?.client_name || task?.clientName ? ` (${escapeHtml(task.client_name || task.clientName)})` : '';

  const content = `
    <div class="unassign-form">
      <div class="warning-box" style="display:flex; gap:15px; align-items:flex-start; background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.3); padding:20px; border-radius:12px; margin-bottom:20px;">
        <i class="fas fa-exclamation-triangle" style="color:#FCD34D; font-size:24px; margin-top:2px;"></i>
        <div>
          <h4 style="margin: 0 0 8px 0; color: #FCD34D;">Move task back to unassigned pool?</h4>
          <p style="margin: 0; color: #D1D5DB; font-size: 13px;">
            Task: <strong>"${displayTitle}"</strong>${displayClient}
          </p>
        </div>
      </div>
      <div class="modal-actions" style="display:flex; gap:10px; justify-content:flex-end;">
        <button class="btn btn-warning" data-action="admin:confirmUnassign" data-id="${taskId}" style="color:#111827;"><i class="fas fa-check"></i> Yes, Unassign</button>
        <button class="btn btn-secondary" onclick="document.querySelector('.modal').remove()"><i class="fas fa-times"></i> Cancel</button>
      </div>
    </div>
  `;
  createModal('Unassign Task', content, { icon: 'fa-times-circle', size: 'medium' });
}

export async function confirmUnassign(taskId) {
  try {
    const res = await fetch(`/api/tasks/${taskId}/unassign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: state.currentUser.id,
        userName: state.currentUser.name
      })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Task moved to unassigned pool', 'success');
      closeAllModals();
      if(document.getElementById('allTasksList')) loadAllTasks();
      if(document.getElementById('unassignedTasksList')) loadUnassignedTasks();
    } else {
      showToast(data.message || 'Failed to unassign', 'error');
    }
  } catch (err) {
    showToast('Failed to unassign', 'error');
  }
}

export async function deleteTask(taskId) {
  if (!confirm('WARNING: Permanently delete this task?')) return;
  try {
    const res = await fetch(`/api/tasks/${taskId}?adminId=${state.currentUser.id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Task deleted permanently', 'success');
      closeAllModals();
      if(document.getElementById('allTasksList')) loadAllTasks();
      if(document.getElementById('unassignedTasksList')) loadUnassignedTasks();
    }
  } catch (err) {
    showToast('Deletion failed', 'error');
  }
}

export function exportTasks() {
  window.open('/api/export?status=all&employeeId=all', '_blank');
}

export function openEditNoteModal(taskId) {
  const task = state.allAdminTasks?.find(t => t.id == taskId) 
            || state.currentFilteredTasks?.find(t => t.id == taskId);
  
  const content = `
    <div class="edit-note-form">
      <div style="margin-bottom:10px; color:#9ca3af; font-size:13px;"><i class="fas fa-info-circle"></i> Update internal remarks for this task:</div>
      <textarea id="editNoteValue" class="form-input" style="width:100%; min-height:120px; font-family:inherit; resize:vertical; padding:12px;">${task?.notes || ''}</textarea>
      <div class="modal-actions" style="margin-top:20px; display:flex; gap:10px; justify-content:flex-end;">
        <button class="btn btn-primary" data-action="admin:confirmEditNote" data-id="${taskId}"><i class="fas fa-save"></i> Save Remarks</button>
        <button class="btn btn-secondary" onclick="closeAllModals()"><i class="fas fa-times"></i> Cancel</button>
      </div>
    </div>
  `;
  createModal('Edit Task Notes', content, { icon: 'fa-edit', size: 'medium' });
}

export async function confirmEditNote(taskId) {
  const notes = document.getElementById('editNoteValue')?.value;
  const btn = document.querySelector('[data-action="admin:confirmEditNote"]');
  
  if (btn) btn.disabled = true;

  try {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        notes,
        userId: state.currentUser.id,
        userName: state.currentUser.name
      })
    });
    
    if (res.ok) {
      showToast('Notes updated successfully', 'success');
      closeAllModals();
      // Update local state to avoid full reload if possible, but loadAllTasks is safer
      if(document.getElementById('allTasksList')) await loadAllTasks();
      if(document.getElementById('unassignedTasksList')) await loadUnassignedTasks();
      
      // Re-open details if we were in it (to show the update)
      openTaskDetailsModal(parseInt(taskId));
    } else {
      showToast('Failed to update notes', 'error');
      if (btn) btn.disabled = false;
    }
  } catch (err) {
    showToast('Network error', 'error');
    if (btn) btn.disabled = false;
  }
}
