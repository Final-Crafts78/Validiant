/**
 * Admin: Employee Management Feature
 */
import { state } from '../../store/globalState';
import { showToast, escapeHtml } from '../../utils/ui';
import { createModal, closeAllModals } from '../../utils/modals';

export function showEmployees() {
  const content = document.getElementById('mainContainer');
  if (!content) return;
  
  content.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
      <h2><i class="fas fa-users"></i> Employees</h2>
      <button class="btn btn-primary" data-action="admin:showAddEmployee"><i class="fas fa-user-plus"></i> Add Employee</button>
    </div>
    </div>
    <div id="employeesList"><div class="loading-spinner show">Loading...</div></div>
    <style>
      /* Toggle Switch */
      .switch { position: relative; display: inline-block; width: 50px; height: 24px; }
      .switch input { opacity: 0; width: 0; height: 0; }
      .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #374151; transition: .4s; border-radius: 34px; }
      .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
      input:checked + .slider { background-color: #10B981; }
      input:focus + .slider { box-shadow: 0 0 1px #10B981; }
      input:checked + .slider:before { transform: translateX(26px); }
    </style>
  `;

  loadEmployeesList();
}

export async function loadEmployeesList() {
  try {
    const [usersRes, mapSettingRes] = await Promise.all([
      fetch('/api/users'),
      fetch('/api/settings/executive_map_edit').catch(() => ({ ok: false }))
    ]);
    
    const users = await usersRes.json();
    state.allEmployees = users;
    
    let mapAccess = {};
    if (mapSettingRes && mapSettingRes.ok) {
       const settingData = await mapSettingRes.json();
       if (settingData.success && settingData.value) {
           mapAccess = settingData.value;
       }
    }
    
    const list = document.getElementById('employeesList');
    if (!list) return;

    if (users.length === 0) {
      list.innerHTML = '<div class="empty-state"><h3>No Employees Yet</h3></div>';
      return;
    }

    let html = `
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>ID</th>
              <th>Email</th>
              <th>Active Tasks</th>
              <th>Map Access</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    users.forEach(u => {
      const activeTasks = u.tasks ? u.tasks.filter(t => t.status !== 'Completed' && t.status !== 'Verified').length : 0;
      const hasMapAccess = mapAccess[u.id] === true;
      html += `<tr style="border-bottom:1px solid #334155;">
        <td style="padding:12px 15px;"><strong>${escapeHtml(u.name)}</strong></td>
        <td style="padding:12px 15px;">${escapeHtml(u.employeeId)}</td>
        <td style="padding:12px 15px;">${escapeHtml(u.email)}</td>
        <td style="padding:12px 15px; text-align:center;"><span class="info-badge" style="background:#312e81; color:#c7d2fe;">${activeTasks}</span></td>
        <td style="padding:12px 15px; text-align:center;">
          <label class="switch" style="transform: scale(0.8); margin: 0;">
            <input type="checkbox" ${hasMapAccess ? 'checked' : ''} onchange="window._toggleEmployeeMapAccess(${u.id}, this.checked, this)">
            <span class="slider"></span>
          </label>
        </td>
        <td style="padding:12px 15px; display:flex; gap:6px; flex-wrap:wrap;">
          <button class="btn btn-primary btn-sm" data-action="admin:editEmployee" data-id="${u.id}">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn btn-warning" data-action="admin:openResetPassword" data-id="${u.id}" data-email="${escapeHtml(u.email)}" style="padding:4px 8px; font-size:12px; color:#111827;">
            <i class="fas fa-key"></i> Reset
          </button>
          <button class="btn btn-danger btn-sm" data-action="admin:deleteEmployee" data-id="${u.id}" data-name="${escapeHtml(u.name)}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>`;
    });
    
    html += '</tbody></table></div>';
    list.innerHTML = html;

    window._toggleEmployeeMapAccess = async (empId, isEnabled, checkboxElem) => {
      checkboxElem.disabled = true;
      try {
        const payload = {
          enabled: isEnabled,
          adminId: state.currentUser.id,
          adminName: state.currentUser.name
        };
        const res = await fetch(`/api/settings/executive_map_edit/${empId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
          showToast(`Map access ${isEnabled ? 'enabled' : 'disabled'} for employee`, 'success');
        } else {
          showToast('Failed to save setting', 'error');
          checkboxElem.checked = !isEnabled; // Revert
        }
      } catch (err) {
        showToast('Network error', 'error');
        checkboxElem.checked = !isEnabled; // Revert
      } finally {
        checkboxElem.disabled = false;
      }
    };
  } catch (err) {
    showToast('Failed to load employees', 'error');
  }
}

export function showAddEmployee() {
  const content = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
        <div class="form-group">
          <label><i class="fas fa-user"></i> Full Name *</label>
          <input type="text" id="newEmpName" class="form-input" required placeholder="Enter full name" />
        </div>
        <div class="form-group">
          <label><i class="fas fa-id-badge"></i> Employee ID *</label>
          <input type="text" id="newEmpId" class="form-input" required placeholder="e.g., EMP001" />
        </div>
        <div class="form-group">
          <label><i class="fas fa-envelope"></i> Email *</label>
          <input type="email" id="newEmpEmail" class="form-input" required placeholder="emp@company.com" />
        </div>
        <div class="form-group">
          <label><i class="fas fa-phone"></i> Phone</label>
          <input type="tel" id="newEmpPhone" class="form-input" placeholder="+91 XXXXX XXXXX" />
        </div>
      </div>
      <div class="form-group">
        <label><i class="fas fa-lock"></i> Default Password *</label>
        <input type="text" id="newEmpPass" class="form-input" value="123456" required />
      </div>
      <div class="modal-actions" style="margin-top:10px;">
        <button type="submit" class="btn btn-primary"><i class="fas fa-plus"></i> Create</button>
        <button type="button" class="btn btn-secondary" onclick="document.querySelector('.modal').remove()"><i class="fas fa-times"></i> Cancel</button>
      </div>
    </form>
  `;
  
  createModal('Add New Employee', content, { icon: 'fa-user-plus', size: 'medium' });
  
  document.getElementById('addEmpForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: document.getElementById('newEmpName').value,
          employeeId: document.getElementById('newEmpId').value,
          email: document.getElementById('newEmpEmail').value,
          phone: document.getElementById('newEmpPhone').value,
          password: document.getElementById('newEmpPass').value
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Employee created!', 'success');
        closeAllModals();
        loadEmployeesList();
      } else {
        showToast(data.message || 'Failed to create', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    } finally {
      btn.disabled = false;
    }
  });
}

export async function deleteEmployee(id, name) {
  if (!confirm(`DELETE EMPLOYEE: ${name}\n\nThis is permanent. Continue?`)) return;
  const pass = prompt('ADMIN PASSWORD REQUIRED:');
  if (!pass) return;

  try {
    const res = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPassword: pass })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Employee deleted', 'success');
      showEmployees();
    } else {
      showToast(data.message || 'Failed to delete', 'error');
    }
  } catch (err) {
    showToast('Network error', 'error');
  }
}

export function showEditEmployeeModal(empId) {
  const emp = state.allEmployees?.find(u => u.id === empId);
  if (!emp) return showToast('Employee data not found', 'error');

  const content = `
    <form id="editEmpForm" style="display:flex; flex-direction:column; gap:15px;">
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
        <div class="form-group">
          <label><i class="fas fa-user"></i> Full Name</label>
          <input type="text" id="editEmpName" class="form-input" value="${escapeHtml(emp.name)}" required />
        </div>
        <div class="form-group">
          <label><i class="fas fa-id-badge"></i> Employee ID</label>
          <input type="text" id="editEmpId" class="form-input" value="${escapeHtml(emp.employeeId)}" required />
        </div>
        <div class="form-group">
          <label><i class="fas fa-envelope"></i> Email</label>
          <input type="email" id="editEmpEmail" class="form-input" value="${escapeHtml(emp.email)}" required />
        </div>
        <div class="form-group">
          <label><i class="fas fa-phone"></i> Phone</label>
          <input type="tel" id="editEmpPhone" class="form-input" value="${escapeHtml(emp.phone || '')}" />
        </div>
      </div>
      <div class="modal-actions" style="margin-top:10px;">
        <button type="button" class="btn btn-primary" onclick="window._saveEditEmployee(${emp.id})"><i class="fas fa-save"></i> Save Changes</button>
        <button type="button" class="btn btn-secondary" onclick="document.querySelector('.modal').remove()"><i class="fas fa-times"></i> Cancel</button>
      </div>
    </form>
  `;
  createModal('Edit Employee', content, { size: 'medium' });
  
  // Expose to window temporarily because this form uses onclick rather than data-action due to simple scope
  window._saveEditEmployee = async (id) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: document.getElementById('editEmpName').value,
          employeeId: document.getElementById('editEmpId').value,
          email: document.getElementById('editEmpEmail').value,
          phone: document.getElementById('editEmpPhone').value
        })
      });
      if (res.ok) {
        showToast('Employee updated successfully', 'success');
        closeAllModals();
        loadEmployeesList();
      }
    } catch {
      showToast('Network error', 'error');
    }
  };
}

export function openResetPasswordModal(userId, email) {
  const content = `
    <p>Resetting password for <strong>${escapeHtml(email)}</strong>.</p>
    <div class="form-group">
      <label>New Password</label>
      <input type="text" id="resetPassValue" class="form-input" value="123456" />
    </div>
    <div class="modal-actions" style="margin-top:10px;">
      <button class="btn btn-warning" data-action="admin:confirmResetPassword" data-id="${userId}"><i class="fas fa-key"></i> Confirm Reset</button>
    </div>
  `;
  createModal('Reset Password', content, { size: 'small' });
}

export async function confirmResetPassword(userId) {
  const newPass = document.getElementById('resetPassValue')?.value;
  try {
    const res = await fetch(`/api/users/${userId}/reset-password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword: newPass })
    });
    if (res.ok) {
      showToast('Password reset successfully to: ' + newPass, 'success');
      closeAllModals();
    }
  } catch {
    showToast('Failed to reset', 'error');
  }
}

