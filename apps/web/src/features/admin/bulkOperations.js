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
  const checkboxes = document.querySelectorAll('.task-checkbox, #selectAllCb');
  checkboxes.forEach(cb => cb.checked = false);
  document.querySelectorAll('.selected-row').forEach(row => row.classList.remove('selected-row'));
  updateBulkActions();
}

export function updateBulkActions() {
  const count = window.selectedTasks.size;
  const bulkContainer = document.getElementById('bulkActionsContainer');
  
  if (!bulkContainer) return;

  if (count > 0) {
    bulkContainer.style.display = 'flex';
    bulkContainer.querySelector('#selectedCountText').innerText = `${count} task(s) selected`;
  } else {
    bulkContainer.style.display = 'none';
  }
}

export function bulkAssignTasks() {
  if (window.selectedTasks.size === 0) return;
  
  let empOptions = '<option value="">Choose Employee...</option>';
  state.allEmployees?.forEach(e => {
    empOptions += `<option value="${e.id}">${e.name}</option>`;
  });

  const content = `
    <div style="margin-bottom: 20px;">
      Assigning <strong>${window.selectedTasks.size}</strong> tasks to:
    </div>
    <select id="bulkAssignEmpId" class="form-input">
      ${empOptions}
    </select>
    <div class="modal-actions" style="margin-top:20px;">
      <button class="btn btn-primary" data-action="admin:confirmBulkAssign"><i class="fas fa-check"></i> Confirm</button>
      <button class="btn btn-secondary" onclick="closeAllModals()"><i class="fas fa-times"></i> Cancel</button>
    </div>
  `;
  
  createModal('Bulk Assign', content, { size: 'medium' });
}

export async function confirmBulkAssign() {
  const empId = document.getElementById('bulkAssignEmpId')?.value;
  if (!empId) return showToast('Select an employee', 'warning');
  
  const tasksToUpdate = Array.from(window.selectedTasks);
  
  try {
    showToast('Assigning tasks...', 'info');
    let success = 0;
    
    for (const taskId of tasksToUpdate) {
      const res = await fetch(`/api/tasks/${taskId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: empId })
      });
      if (res.ok) success++;
    }
    
    showToast(`Successfully assigned ${success} tasks`, 'success');
    closeAllModals();
    clearSelection();
    
    // Refresh current view
    if (document.getElementById('unassignedTasksList')) loadUnassignedTasks();
    if (document.getElementById('allTasksList')) loadAllTasks();
    
  } catch (err) {
    showToast('Bulk update error', 'error');
  }
}

export async function bulkDeleteTasks() {
  if (window.selectedTasks.size === 0) return;
  
  if (!confirm(`Are you sure you want to permanently delete ${window.selectedTasks.size} tasks?`)) return;
  
  try {
    const tasksToUpdate = Array.from(window.selectedTasks);
    let success = 0;
    
    for (const taskId of tasksToUpdate) {
      const res = await fetch(`/api/tasks/${taskId}?adminId=${state.currentUser.id}`, { method: 'DELETE' });
      if (res.ok) success++;
    }
    
    showToast(`Deleted ${success} tasks`, 'success');
    clearSelection();
    
    if (document.getElementById('unassignedTasksList')) loadUnassignedTasks();
    if (document.getElementById('allTasksList')) loadAllTasks();
    
  } catch (err) {
    showToast('Bulk delete error', 'error');
  }
}
