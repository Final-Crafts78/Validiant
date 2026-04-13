/**
 * Admin Dashboard & Task Creation
 */
import { state } from '../../store/globalState';
import { showToast, showLoading, escapeHtml } from '../../utils/ui';
import { createModal, closeAllModals } from '../../utils/modals';

export async function showAssignTask() {
  const content = document.getElementById('mainContainer');
  if (!content) return;

  const html = `
    <div class="page-header">
      <div>
        <h2><i class="fas fa-tasks"></i> Assign New Task</h2>
        <p style="color: #9CA3AF; font-size: 13px; margin-top: 5px;">
          Create a new task and assign it to an employee or leave it unassigned
        </p>
      </div>
      <button class="btn btn-success" data-action="admin:showBulkUpload">
        <i class="fas fa-file-excel"></i> Bulk Upload Tasks
      </button>
    </div>
    
    <div class="form-container">
      <form id="taskForm" class="modern-form">
        <div class="form-grid">
          <div class="form-section">
            <h4 class="section-title"><i class="fas fa-info-circle"></i> Task Information</h4>
            <div class="form-group">
              <label for="caseId"><i class="fas fa-id-card"></i> Case ID / Title <span class="required">*</span></label>
              <input type="text" id="caseId" required placeholder="Enter case ID or title" class="form-input" />
            </div>
            <div class="form-group">
              <label for="clientName"><i class="fas fa-user-tie"></i> Client Name</label>
              <input type="text" id="clientName" placeholder="Enter client name (optional)" class="form-input" />
            </div>
            <div class="form-group">
              <label for="pincode"><i class="fas fa-map-pin"></i> Pincode <span class="required">*</span></label>
              <input type="text" id="pincode" required placeholder="6-digit pincode" maxlength="6" pattern="[0-9]{6}" class="form-input" />
            </div>
          </div>
          <div class="form-section">
            <h4 class="section-title"><i class="fas fa-map-marker-alt"></i> Location & Assignment</h4>
            <div class="form-group">
              <label for="mapUrl"><i class="fas fa-link"></i> Google Maps URL (Auto-Extracts Coordinates)</label>
              <input type="url" id="mapUrl" placeholder="https://www.google.com/maps/..." class="form-input" />
            </div>
            <div class="form-group">
              <label for="assignedTo"><i class="fas fa-user-plus"></i> Assign To</label>
              <select id="assignedTo" class="form-input">
                <option value="Unassigned">Leave Unassigned (Pool)</option>
              </select>
            </div>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary btn-lg"><i class="fas fa-paper-plane"></i> Create & Assign Task</button>
        </div>
      </form>
    </div>
  `;
  content.innerHTML = html;
  
  // Populate employees dropdown
  await populateEmployeesDropdown();
  
  // Bind form submit
  document.getElementById('taskForm').addEventListener('submit', handleTaskSubmit);
}

async function populateEmployeesDropdown() {
  try {
    const res = await fetch('/api/users');
    const employees = await res.json();
    state.allEmployees = employees;
    const select = document.getElementById('assignedTo');
    if (!select) return;
    
    employees.forEach(emp => {
      const opt = document.createElement('option');
      opt.value = emp.id;
      opt.textContent = `${emp.name} (${emp.employeeId})`;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error('Failed to load employees', err);
  }
}

async function handleTaskSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

  const payload = {
    title: document.getElementById('caseId').value,
    clientName: document.getElementById('clientName').value,
    pincode: document.getElementById('pincode').value,
    mapUrl: document.getElementById('mapUrl').value,
    assignedTo: document.getElementById('assignedTo').value,
    createdBy: state.currentUser.id,
    createdByName: state.currentUser.name
  };

  try {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showToast('Task created and assigned successfully!', 'success');
      e.target.reset();
    } else {
      showToast('Error: ' + data.message, 'error');
    }
  } catch (err) {
    showToast('Network error, please try again.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Create & Assign Task';
  }
}
