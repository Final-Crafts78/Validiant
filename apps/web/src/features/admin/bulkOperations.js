/**
 * Admin: Bulk Operations Feature
 */
import { showToast } from '../../utils/ui';
import { createModal, closeAllModals } from '../../utils/modals';
import { state } from '../../store/globalState';
import { loadUnassignedTasks } from './unassignedTasks';
import { loadAllTasks } from './allTasks';

// Global selection state
window.selectedTasks = new Set();

export function toggleSelectAll(checkboxClass) {
  const isChecked = document.getElementById('selectAllCb')?.checked;
  const checkboxes = document.querySelectorAll(`.${checkboxClass}`);
  
  checkboxes.forEach(cb => {
    cb.checked = isChecked;
    const taskId = parseInt(cb.value);
    if (isChecked) {
      window.selectedTasks.add(taskId);
      cb.closest('tr')?.classList.add('selected-row');
    } else {
      window.selectedTasks.delete(taskId);
      cb.closest('tr')?.classList.remove('selected-row');
    }
  });
  
  updateBulkActions();
}

export function handleSingleSelection(cb) {
  const taskId = parseInt(cb.value);
  if (cb.checked) {
    window.selectedTasks.add(taskId);
    cb.closest('tr')?.classList.add('selected-row');
  } else {
    window.selectedTasks.delete(taskId);
    cb.closest('tr')?.classList.remove('selected-row');
    
    // Uncheck "Select All" if a single box is unchecked
    const selectAllCb = document.getElementById('selectAllCb');
    if (selectAllCb) selectAllCb.checked = false;
  }
  
  updateBulkActions();
}

export function clearSelection() {
  window.selectedTasks.clear();
  // Clear any checkbox and remove selected-row class from any tr
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(cb => cb.checked = false);
  document.querySelectorAll('.selected-row').forEach(row => row.classList.remove('selected-row'));
  updateBulkActions();
}

export function updateBulkActions() {
  const count = window.selectedTasks.size;
  const bulkContainer = document.getElementById('allTasksBulkActions') || 
                        document.getElementById('unassignedBulkActions') ||
                        document.getElementById('bulkActionsContainer');
  
  if (!bulkContainer) return;

  if (count > 0) {
    bulkContainer.style.display = 'flex';
    // Try all possible count span IDs
    const countSpan = bulkContainer.querySelector('#allTasksSelectedCount') || 
                      bulkContainer.querySelector('#unassignedSelectedCount') ||
                      bulkContainer.querySelector('#selectedCountText');
                      
    if (countSpan) countSpan.innerText = `${count} task(s) selected`;
  } else {
    bulkContainer.style.display = 'none';
  }
}

export async function bulkAssignTasks() {
  if (window.selectedTasks.size === 0) return;
  
  // Ensure employees are loaded
  if (!state.allEmployees || state.allEmployees.length === 0) {
    try {
      const res = await fetch('/api/users');
      state.allEmployees = await res.json();
    } catch (err) {
      return showToast('Failed to load employee list', 'error');
    }
  }
  
  let empOptions = '<option value="">Choose Employee...</option>';
  state.allEmployees?.forEach(e => {
    empOptions += `<option value="${e.id}">${escapeHtml(e.name)} (${e.employeeId})</option>`;
  });

  const content = `
    <div style="margin-bottom: 20px; color:#cbd5e1; font-size:14px;">
      <i class="fas fa-info-circle" style="color:#6366f1; margin-right:8px;"></i>
      Assigning <strong>${window.selectedTasks.size}</strong> selected tasks to:
    </div>
    <div class="form-group">
      <select id="bulkAssignEmpId" class="form-input" style="width:100%; height:45px; border-radius:8px; background:#1e293b; border:1px solid #334155; color:white; padding:0 15px;">
        ${empOptions}
      </select>
    </div>
    <div class="modal-actions" style="margin-top:25px; padding-top:20px; border-top:1px solid #334155; display:flex; gap:10px;">
      <button class="btn btn-primary btn-lg" data-action="admin:confirmBulkAssign" style="flex:2;">
        <i class="fas fa-check"></i> Confirm Assignment
      </button>
      <button class="btn btn-secondary btn-lg" onclick="closeAllModals()" style="flex:1;">
        <i class="fas fa-times"></i> Cancel
      </button>
    </div>
  `;
  
  createModal('Bulk Assignment', content, { icon: 'fa-user-plus', size: 'medium' });
}

// Helper to escape HTML safely
function escapeHtml(text) {
  if (typeof text !== 'string') return text || '';
  return text.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m];
  });
}

export async function confirmBulkAssign() {
  const empId = document.getElementById('bulkAssignEmpId')?.value;
  if (!empId) return showToast('Please select an employee', 'warning');
  
  const tasksToUpdate = Array.from(window.selectedTasks);
  
  try {
    showToast(`Assigning ${tasksToUpdate.length} tasks...`, 'info');
    
    const res = await fetch(`/api/tasks/bulk/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        taskIds: tasksToUpdate,
        employeeId: empId,
        userId: state.currentUser.id,
        userName: state.currentUser.name
      })
    });
    
    if (res.ok) {
      showToast(`Successfully assigned ${tasksToUpdate.length} tasks`, 'success');
      closeAllModals();
      clearSelection();
      
      // Refresh current view
      if (document.getElementById('unassignedTasksList')) loadUnassignedTasks();
      if (document.getElementById('allTasksList')) loadAllTasks();
    } else {
      const data = await res.json();
      showToast(data.message || 'Bulk assign error', 'error');
    }
  } catch (err) {
    showToast('Bulk update error', 'error');
  }
}

export async function bulkCompleteTasks() {
  if (window.selectedTasks.size === 0) return;
  
  const content = `
    <div style="margin-bottom: 20px; color:#cbd5e1; font-size:14px;">
      <i class="fas fa-exclamation-triangle" style="color:#f59e0b; margin-right:8px;"></i>
      Are you sure you want to mark <strong>${window.selectedTasks.size}</strong> tasks as <strong>Completed</strong>?
    </div>
    <div class="modal-actions" style="margin-top:25px; padding-top:20px; border-top:1px solid #334155; display:flex; gap:10px;">
      <button class="btn btn-success btn-lg" data-action="admin:confirmBulkComplete" style="flex:2;">
        <i class="fas fa-check"></i> Yes, Mark Completed
      </button>
      <button class="btn btn-secondary btn-lg" onclick="closeAllModals()" style="flex:1;">
        <i class="fas fa-times"></i> Cancel
      </button>
    </div>
  `;
  
  createModal('Bulk Complete', content, { icon: 'fa-check-double', size: 'medium' });
}

export async function confirmBulkComplete() {
  const tasksToUpdate = Array.from(window.selectedTasks);
  
  try {
    showToast(`Completing ${tasksToUpdate.length} tasks...`, 'info');
    
    const res = await fetch(`/api/tasks/bulk/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        taskIds: tasksToUpdate,
        status: 'Completed',
        userId: state.currentUser.id,
        userName: state.currentUser.name
      })
    });
    
    if (res.ok) {
      showToast(`Successfully completed ${tasksToUpdate.length} tasks`, 'success');
      closeAllModals();
      clearSelection();
      
      if (document.getElementById('unassignedTasksList')) loadUnassignedTasks();
      if (document.getElementById('allTasksList')) loadAllTasks();
    } else {
      const data = await res.json();
      showToast(data.message || 'Bulk complete error', 'error');
    }
  } catch (err) {
    showToast('Bulk complete error', 'error');
  }
}

export async function bulkDeleteTasks() {
  if (window.selectedTasks.size === 0) return;
  
  if (!confirm(`CAUTION: Are you sure you want to permanently delete ${window.selectedTasks.size} tasks?`)) return;
  
  try {
    const tasksToUpdate = Array.from(window.selectedTasks);
    showToast(`Deleting ${tasksToUpdate.length} tasks...`, 'info');
    
    const res = await fetch(`/api/tasks/bulk/delete`, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskIds: tasksToUpdate,
        adminId: state.currentUser.id
      })
    });
    
    if (res.ok) {
      showToast(`Deleted ${tasksToUpdate.length} tasks`, 'success');
      clearSelection();
      
      if (document.getElementById('unassignedTasksList')) loadUnassignedTasks();
      if (document.getElementById('allTasksList')) loadAllTasks();
    } else {
      const data = await res.json();
      showToast(data.message || 'Bulk delete error', 'error');
    }
  } catch (err) {
    showToast('Bulk delete error', 'error');
  }
}
