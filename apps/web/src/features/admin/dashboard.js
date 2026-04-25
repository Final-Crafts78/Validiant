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
          <!-- Left Column -->
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
              <small class="form-hint">Enter valid 6-digit Indian pincode</small>
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
          
          <!-- Right Column -->
          <div class="form-section">
            <h4 class="section-title">
              <i class="fas fa-map-marked-alt"></i> Location Details
            </h4>

            <div class="form-group">
              <label for="address">
                <i class="fas fa-address-card"></i> Address
              </label>
              <textarea 
                id="address" 
                rows="2" 
                placeholder="Full street address..."
                class="form-input"
              ></textarea>
            </div>
            
            <div class="form-group">
              <label for="mapUrl">
                <i class="fas fa-link"></i> Google Maps URL
              </label>
              <input 
                type="url" 
                id="mapUrl" 
                placeholder="Paste Google Maps link (coordinates extracted automatically)"
                class="form-input"
              />
              <small class="form-hint">
                <i class="fas fa-lightbulb"></i> Coordinates will be auto-extracted from Maps URL
              </small>
            </div>
            
            <div class="form-row">
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
              <label for="employee">
                <i class="fas fa-user"></i> Assign to Employee
              </label>
              <select id="employee" class="form-input">
                <option value="">-- Leave Unassigned --</option>
                <option disabled>Loading employees...</option>
              </select>
              <small class="form-hint">Leave unassigned to add task to pool</small>
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary btn-lg">
            <i class="fas fa-check"></i> Create Task
          </button>
          <button type="button" class="btn btn-secondary" data-action="admin:showAllTasks">
            <i class="fas fa-times"></i> Cancel
          </button>
        </div>
      </form>
    </div>
    
    <style>
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 25px;
        padding-bottom: 20px;
        border-bottom: 1px solid #1F2937;
      }
      
      .form-container {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid #1F2937;
        border-radius: 16px;
        padding: 30px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      }
      
      .modern-form {
        display: flex;
        flex-direction: column;
        gap: 30px;
      }
      
      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 30px;
      }
      
      .form-section {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      
      .section-title {
        color: #E5E7EB;
        font-size: 15px;
        font-weight: 600;
        margin: 0 0 10px 0;
        padding-bottom: 10px;
        border-bottom: 2px solid #374151;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .section-title i {
        color: #6366F1;
      }
      
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .form-group label {
        color: #E5E7EB;
        font-size: 13px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      
      .form-group label i {
        color: #9CA3AF;
        font-size: 12px;
      }
      
      .required {
        color: #EF4444;
        font-weight: bold;
      }
      
      .form-input {
        width: 100%;
        padding: 12px 14px;
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid #374151;
        border-radius: 10px;
        color: #E5E7EB;
        font-size: 16px; 
        transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
        outline: none;
        font-family: inherit;
      }
      
      .form-input:focus {
        border-color: #6366F1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        background: rgba(15, 23, 42, 0.95);
      }
      
      .form-input::placeholder {
        color: #6B7280;
      }
      
      .form-input[readonly] {
        background: rgba(31, 41, 55, 0.5);
        cursor: not-allowed;
        color: #9CA3AF;
      }
      
      .form-hint {
        color: #9CA3AF;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 5px;
      }
      
      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
      }
      
      .form-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
        padding-top: 20px;
        border-top: 1px solid #1F2937;
      }
      
      @media (max-width: 768px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
        .page-header {
          flex-direction: column;
          gap: 15px;
        }
      }
    </style>
  `;
  content.innerHTML = html;

  // Auto-coordinate extraction logic — Precision Cascade: !3d/!4d > @ > ?q=
  const mapUrlInput = document.getElementById('mapUrl');
  if (mapUrlInput) {
    mapUrlInput.addEventListener('input', function() {
      const url = this.value;
      const latInput = document.getElementById('latitude');
      const lngInput = document.getElementById('longitude');
      
      if (url) {
        // 1. HIGHEST PRECISION: !3d/!4d (actual pin placement in Google Maps)
        const m3d = url.match(/!3d(-?\d+\.\d+)/);
        const m4d = url.match(/!4d(-?\d+\.\d+)/);
        if (m3d && m4d) {
          latInput.value = m3d[1];
          lngInput.value = m4d[1];
          return;
        }

        // 2. MEDIUM PRECISION: @lat,lng (viewport center — can be 200-500m off)
        const atMatch = url.match(/@(-?[0-9.]+),(-?[0-9.]+)/);
        if (atMatch) {
          latInput.value = atMatch[1];
          lngInput.value = atMatch[2];
          return;
        }
        
        // 3. FALLBACK: ?q=lat,lng (query parameter)
        const qMatch = url.match(/\?q=(-?[0-9.]+),(-?[0-9.]+)/);
        if (qMatch) {
          latInput.value = qMatch[1];
          lngInput.value = qMatch[2];
          return;
        }

        // Warning for non-extractable links
        showToast('Could not auto-extract coordinates. Please enter Lat/Lng manually for accurate routing!', 'warning');
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
    const select = document.getElementById('employee');
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Leave Unassigned --</option>';
    employees.forEach(emp => {
      const opt = document.createElement('option');
      opt.value = emp.id;
      opt.textContent = `${escapeHtml(emp.name)} ${emp.employee_id ? '(' + emp.employee_id + ')' : emp.employeeId ? '(' + emp.employeeId + ')' : '(No ID)'}`;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error('Failed to load employees', err);
  }
}

async function handleTaskSubmit(e) {
  e.preventDefault();

  const pincode = document.getElementById('pincode').value;
  if (!/^[0-9]{6}$/.test(pincode)) {
    showToast('Pincode must be exactly 6 digits', 'error');
    return;
  }

  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

  const payload = {
    title: document.getElementById('caseId').value,
    clientName: document.getElementById('clientName').value || null,
    pincode: pincode,
    address: document.getElementById('address') ? document.getElementById('address').value : null,
    notes: document.getElementById('notes').value || null,
    mapUrl: document.getElementById('mapUrl').value || null,
    latitude: document.getElementById('latitude').value ? parseFloat(document.getElementById('latitude').value) : null,
    longitude: document.getElementById('longitude').value ? parseFloat(document.getElementById('longitude').value) : null,
    assignedTo: document.getElementById('employee').value ? parseInt(document.getElementById('employee').value) : null,
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
      showToast(payload.assignedTo ? '✓ Task created and assigned successfully!' : '✓ Task created as unassigned!', 'success');
      e.target.reset();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      showToast('Error: ' + data.message, 'error');
    }
  } catch (err) {
    showToast('Network error, please try again.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

