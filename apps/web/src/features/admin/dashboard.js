/**
 * Admin Dashboard & Task Creation
 */
import { state } from '../../store/globalState';
import { showToast, showLoading, escapeHtml } from '../../utils/ui';
import { createModal, closeAllModals } from '../../utils/modals';
import { showAllTasks } from './allTasks';

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
          <!-- Left Column: Task Information -->
          <div class="form-section">
            <h4 class="section-title">
              <i class="fas fa-info-circle"></i> Task Information
            </h4>
            
            <div class="form-group">
              <label for="caseId">
                <i class="fas fa-id-card"></i> Case ID / Title <span class="required">*</span>
              </label>
              <input 
                type="text" 
                id="caseId" 
                required 
                placeholder="Enter case ID or title"
                maxlength="500"
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label for="clientName">
                <i class="fas fa-user-tie"></i> Client Name
              </label>
              <input 
                type="text" 
                id="clientName" 
                placeholder="Enter client name (optional)"
                maxlength="200"
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label for="pincode">
                <i class="fas fa-map-pin"></i> Pincode <span class="required">*</span>
              </label>
              <input 
                type="text" 
                id="pincode" 
                required 
                placeholder="6-digit pincode"
                maxlength="6"
                pattern="[0-9]{6}"
                class="form-input"
              />
              <small class="form-hint" style="color: #94A3B8; font-size: 11px;">Enter valid 6-digit Indian pincode</small>
            </div>
            
            <div class="form-group">
              <label for="notes">
                <i class="fas fa-sticky-note"></i> Notes
              </label>
              <textarea 
                id="notes" 
                rows="3" 
                placeholder="Additional instructions or notes..."
                class="form-input"
              ></textarea>
            </div>
          </div>
          
          <!-- Right Column: Location & Assignment -->
          <div class="form-section">
            <h4 class="section-title">
              <i class="fas fa-map-marked-alt"></i> Location Details
            </h4>
            
            <div class="form-group">
              <label for="mapUrl">
                <i class="fas fa-link"></i> Google Maps URL
              </label>
              <input 
                type="url" 
                id="mapUrl" 
                placeholder="Paste Google Maps link (auto-extracts coordinates)"
                class="form-input"
              />
              <small class="form-hint" style="color: #6366F1; font-size: 11px;">
                <i class="fas fa-lightbulb"></i> Coordinates will be auto-extracted from Maps URL
              </small>
            </div>

            <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div class="form-group">
                <label for="latitude">
                  <i class="fas fa-globe"></i> Latitude
                </label>
                <input 
                  type="number" 
                  id="latitude" 
                  step="any" 
                  placeholder="Enter Latitude"
                  class="form-input"
                />
              </div>
              
              <div class="form-group">
                <label for="longitude">
                  <i class="fas fa-globe"></i> Longitude
                </label>
                <input 
                  type="number" 
                  id="longitude" 
                  step="any" 
                  placeholder="Enter Longitude"
                  class="form-input"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label for="assignedTo">
                <i class="fas fa-user-plus"></i> Assign To Employee
              </label>
              <select id="assignedTo" class="form-input">
                <option value="Unassigned">-- Leave Unassigned --</option>
                <option disabled>Loading employees...</option>
              </select>
              <small class="form-hint" style="color: #94A3B8; font-size: 11px;">Leave unassigned to add task to pool</small>
            </div>
          </div>
        </div>
        
        <div class="form-actions" style="display: flex; gap: 12px; justify-content: center; padding-top: 20px; border-top: 1px solid #1F2937; margin-top: 30px;">
          <button type="submit" class="btn btn-primary btn-lg">
            <i class="fas fa-check"></i> Create Task
          </button>
          <button type="button" class="btn btn-secondary" data-action="admin:showAllTasks">
            <i class="fas fa-times"></i> Cancel
          </button>
        </div>
      </form>
    </div>
  `;
  content.innerHTML = html;
  
  // Auto-coordinate extraction logic
  const mapUrlInput = document.getElementById('mapUrl');
  if (mapUrlInput) {
    mapUrlInput.addEventListener('input', function() {
      const url = this.value;
      const latInput = document.getElementById('latitude');
      const lngInput = document.getElementById('longitude');
      
      if (url) {
        // Try to find @lat,lng pattern
        const latMatch = url.match(/@(-?[0-9.]+),(-?[0-9.]+)/);
        if (latMatch) {
          latInput.value = latMatch[1];
          lngInput.value = latMatch[2];
          return;
        }
        
        // Try to find ?q=lat,lng pattern
        const qMatch = url.match(/\?q=(-?[0-9.]+),(-?[0-9.]+)/);
        if (qMatch) {
          latInput.value = qMatch[1];
          lngInput.value = qMatch[2];
          return;
        }
      }
    });
  }

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
      opt.textContent = `${escapeHtml(emp.name)} ${emp.employee_id ? '(' + emp.employee_id + ')' : '(No ID)'}`;
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
    notes: document.getElementById('notes').value,
    mapUrl: document.getElementById('mapUrl').value,
    latitude: document.getElementById('latitude').value ? parseFloat(document.getElementById('latitude').value) : null,
    longitude: document.getElementById('longitude').value ? parseFloat(document.getElementById('longitude').value) : null,
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
