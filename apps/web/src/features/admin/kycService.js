/**
 * VALIDIANT DIGITAL KYC SERVICE (v3.0) - Modularized
 * Integration with Didit.me
 */
import { state } from '../../store/globalState';
import { showToast, escapeHtml } from '../../utils/ui';
import { createModal, closeAllModals } from '../../utils/modals';

export function showKYCDashboard() {
  const content = document.getElementById('mainContainer'); // Standardized container
  if (!content) return;

  let html = '<h2><i class="fas fa-fingerprint"></i> Digital KYC Requests</h2>';

  // Toolbar
  html += '<div class="filter-section" style="display:flex; gap:10px; margin-bottom:20px;">';
  html += '<button class="btn btn-primary btn-sm" data-action="kyc:openModal">';
  html += '<i class="fas fa-plus"></i> New Verification Request';
  html += '</button>';
  html += '<button class="btn btn-info btn-sm" data-action="kyc:refresh">';
  html += '<i class="fas fa-sync"></i> Refresh List';
  html += '</button>';
  html += '</div>';

  // Table Container
  html += '<div id="kycList">';
  html += '<div class="loading-spinner show"><i class="fas fa-spinner"></i> Loading KYC data...</div>';
  html += '</div>';

  content.innerHTML = html;
  loadKYCRequests();
}

export async function loadKYCRequests() {
  try {
    const res = await fetch('/api/kyc/list');
    const data = await res.json();
    displayKYCTable(data);
  } catch (err) {
    console.error('KYC Load Error:', err);
    showToast('Failed to load KYC requests', 'error');
  }
}

function displayKYCTable(requests) {
  const container = document.getElementById('kycList');
  if (!container) return;
  
  if (!requests || requests.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-id-card"></i><h3>No Verification Requests</h3><p>Create a new request to verify a customer.</p></div>';
    return;
  }

  let html = `
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Ref ID</th>
            <th>Customer</th>
            <th>Client</th>
            <th>Status</th>
            <th>Risk Score</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
  `;

  requests.forEach(req => {
    let statusBadge = 'status-pending';
    if (req.status === 'Verified') statusBadge = 'status-completed';
    if (req.status === 'Rejected') statusBadge = 'status-incorrect-number';

    let riskColor = '#10b981'; // green
    if (req.ipRiskLevel === 'High') riskColor = '#ef4444';
    if (req.ipRiskLevel === 'Medium') riskColor = '#f59e0b';

    html += `
      <tr style="border-bottom:1px solid #334155;">
        <td style="padding:12px 15px;">${escapeHtml(req.referenceId)}</td>
        <td style="padding:12px 15px;"><strong>${escapeHtml(req.customerName)}</strong></td>
        <td style="padding:12px 15px;">${escapeHtml(req.clientName)}</td>
        <td style="padding:12px 15px;"><span class="status-badge ${statusBadge}">${escapeHtml(req.status)}</span></td>
        <td style="padding:12px 15px;"><i class="fas fa-circle" style="color:${riskColor}; font-size:10px;"></i> ${escapeHtml(req.ipRiskLevel || 'Pending')}</td>
        <td style="padding:12px 15px; display:flex; gap:6px;">
          <button class="btn btn-secondary btn-sm" data-action="kyc:viewReport" data-id="${req.id}"><i class="fas fa-eye"></i> Report</button>
          ${req.verificationLink && req.status === 'Pending' ? `
            <button class="btn btn-info btn-sm" data-action="kyc:copyLink" data-link="${escapeHtml(req.verificationLink)}"><i class="fas fa-copy"></i> Link</button>
          ` : ''}
        </td>
      </tr>
    `;
  });

  html += '</tbody></table></div>';
  container.innerHTML = html;
}

export function openKYCModal() {
  const content = `
    <form id="kycForm">
      <div class="form-group">
        <label>Client Name (Bank/Institution)</label>
        <input type="text" id="kClient" class="form-input" required placeholder="e.g. HDFC Bank">
      </div>
      <div class="form-group">
        <label>Customer Name</label>
        <input type="text" id="kCustomer" class="form-input" required placeholder="Name of person to verify">
      </div>
      <div class="form-group">
        <label>Reference ID (Internal)</label>
        <input type="text" id="kRef" class="form-input" required placeholder="e.g. LOAN-2024-889">
      </div>
      <div class="modal-actions" style="margin-top:20px;">
        <button type="submit" class="btn btn-primary">Generate Link</button>
        <button type="button" class="btn btn-secondary" onclick="closeAllModals()">Cancel</button>
      </div>
    </form>
  `;
  
  createModal('Create Verification Request', content, { size: 'medium', icon: 'fa-user-shield' });

  document.getElementById('kycForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

    const payload = {
      clientName: document.getElementById('kClient').value,
      customerName: document.getElementById('kCustomer').value,
      referenceId: document.getElementById('kRef').value,
      createdBy: state.currentUser.id
    };

    try {
      const res = await fetch('/api/kyc/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        showToast('Verification session created!', 'success');
        closeAllModals();
        loadKYCRequests();
      } else {
        showToast(data.message, 'error');
        btn.disabled = false;
        btn.innerText = 'Generate Link';
      }
    } catch (err) {
      showToast('Connection failed', 'error');
      btn.disabled = false;
    }
  });
}

export async function viewKYCReport(id) {
  try {
    const res = await fetch(`/api/kyc/list?id=${id}`);
    const data = await res.json();
    const req = Array.isArray(data) ? data[0] : data;
    if(!req) return;

    const content = `
      <div style="background:rgba(0,0,0,0.3); padding:15px; border-radius:10px; margin-bottom:15px; display:flex; justify-content:space-between;">
        <div><small style="color:#94a3b8">Face Match Score</small><br><strong style="font-size:18px; color:${req.faceMatchScore > 80 ? '#4ade80' : '#f87171'}">${req.faceMatchScore || 0}%</strong></div>
        <div><small style="color:#94a3b8">Liveness</small><br><strong>${escapeHtml(req.livenessStatus || 'N/A')}</strong></div>
        <div><small style="color:#94a3b8">Est. Age</small><br><strong>${req.estimatedAge || 'N/A'}</strong></div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:13px;">
        <div><strong>Status:</strong> ${req.status}</div>
        <div><strong>IP Country:</strong> ${escapeHtml(req.ipCountry || '-')}</div>
        <div><strong>IP Risk:</strong> ${escapeHtml(req.ipRiskLevel || '-')}</div>
        <div><strong>ID Type:</strong> ${escapeHtml(req.idType || '-')}</div>
      </div>
      <div class="modal-actions" style="margin-top:20px;">
        <button class="btn btn-secondary" onclick="closeAllModals()">Close Report</button>
      </div>
    `;
    
    createModal(`Verification Report: ${escapeHtml(req.referenceId)}`, content, { size: 'medium', icon: 'fa-file-contract' });
  } catch (err) {
    showToast('Failed to load report', 'error');
  }
}

export function copyKYCLink(link) {
  navigator.clipboard.writeText(link).then(() => {
    showToast('Link copied to clipboard', 'success');
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// BRIDGE TO GLOBAL (Temporarily for any direct calls while migrating)
// ═══════════════════════════════════════════════════════════════════════════
window.showKYCDashboard = showKYCDashboard;
window.loadKYCRequests = loadKYCRequests;
window.openKYCModal = openKYCModal;
window.viewKYCReport = viewKYCReport;
window.copyLink = copyKYCLink;