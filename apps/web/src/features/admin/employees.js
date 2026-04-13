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
    <div id="employeesList"><div class="loading-spinner show">Loading...</div></div>
  `;

  loadEmployeesList();
}

export async function loadEmployeesList() {
  try {
    const res = await fetch('/api/users');
    const users = await res.json();
    state.allEmployees = users;
    
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    users.forEach(u => {
      const activeTasks = u.tasks ? u.tasks.filter(t => t.status !== 'Completed' && t.status !== 'Verified').length : 0;
      html += `<tr style="border-bottom:1px solid #334155;">
        <td style="padding:12px 15px;"><strong>${escapeHtml(u.name)}</strong></td>
        <td style="padding:12px 15px;">${escapeHtml(u.employeeId)}</td>
        <td style="padding:12px 15px;">${escapeHtml(u.email)}</td>
        <td style="padding:12px 15px; text-align:center;">
          <button class="btn btn-sm" data-action="admin:viewEmployeeTasks" data-id="${u.id}" style="background:rgba(49,46,129,0.2); border:1px solid #312e81; color:#c7d2fe; cursor:pointer; font-weight:700; border-radius:12px; padding:2px 10px;">
            ${activeTasks}
          </button>
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

