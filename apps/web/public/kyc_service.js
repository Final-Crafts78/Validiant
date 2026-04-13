// ═══════════════════════════════════════════════════════════════════════════
// VALIDIANT DIGITAL KYC SERVICE (v3.0)
// Integration with Didit.me
// ═══════════════════════════════════════════════════════════════════════════

function showKYCDashboard() {
  const content = document.getElementById('content');
  if (!content) return;

  let html = '<h2><i class="fas fa-fingerprint"></i> Digital KYC Requests</h2>';

  // Toolbar
  html += '<div class="filter-section">';
  html += '<button class="btn btn-primary btn-sm" onclick="openKYCModal()">';
  html += '<i class="fas fa-plus"></i> New Verification Request';
  html += '</button>';
  html += '<button class="btn btn-info btn-sm" onclick="loadKYCRequests()">';
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

function loadKYCRequests() {
  fetch('/api/kyc/list')
    .then(res => res.json())
    .then(data => {
      displayKYCTable(data);
    })
    .catch(err => {
      console.error('KYC Load Error:', err);
      showToast('Failed to load KYC requests', 'error');
    });
}

function displayKYCTable(requests) {
  const container = document.getElementById('kycList');
  if (!requests || requests.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-id-card"></i><h3>No Verification Requests</h3><p>Create a new request to verify a customer.</p></div>';
    return;
  }

  let html = '<table class="table">';
  html += '<thead><tr>';
  html += '<th>Ref ID</th>';
  html += '<th>Customer</th>';
  html += '<th>Client</th>';
  html += '<th>Status</th>';
  html += '<th>Risk Score</th>';
  html += '<th>Actions</th>';
  html += '</tr></thead><tbody>';

  requests.forEach(req => {
    let statusBadge = 'status-pending';
    if (req.status === 'Verified') statusBadge = 'status-completed';
    if (req.status === 'Rejected') statusBadge = 'status-incorrect-number';

    // Simulated Risk Score visualization
    let riskColor = '#10b981'; // green
    if (req.ipRiskLevel === 'High') riskColor = '#ef4444';
    if (req.ipRiskLevel === 'Medium') riskColor = '#f59e0b';

    html += '<tr>';
    html += `<td>${escapeHtml(req.referenceId)}</td>`;
    html += `<td><strong>${escapeHtml(req.customerName)}</strong></td>`;
    html += `<td>${escapeHtml(req.clientName)}</td>`;
    html += `<td><span class="status-badge ${statusBadge}">${escapeHtml(req.status)}</span></td>`;
    html += `<td><i class="fas fa-circle" style="color:${riskColor}; font-size:10px;"></i> ${escapeHtml(req.ipRiskLevel || 'Pending')}</td>`;
    html += '<td>';
    html += `<button class="btn btn-secondary btn-sm" onclick="viewKYCReport(${req.id})"><i class="fas fa-eye"></i> Report</button>`;
    if (req.verificationLink && req.status === 'Pending') {
      html += ` <button class="btn btn-info btn-sm" onclick="copyLink('${escapeHtml(req.verificationLink)}')"><i class="fas fa-copy"></i> Link</button>`;
    }
    html += '</td>';
    html += '</tr>';
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

function openKYCModal() {
  const modal = document.createElement('div');
  modal.className = 'modal show';
  
  let html = '<div class="modal-content">';
  html += '<h2><i class="fas fa-user-shield"></i> Create Verification Request</h2>';
  html += '<form id="kycForm">';
  
  html += '<div class="form-group">';
  html += '<label>Client Name (Bank/Institution)</label>';
  html += '<input type="text" id="kClient" required placeholder="e.g. HDFC Bank">';
  html += '</div>';

  html += '<div class="form-group">';
  html += '<label>Customer Name</label>';
  html += '<input type="text" id="kCustomer" required placeholder="Name of person to verify">';
  html += '</div>';

  html += '<div class="form-group">';
  html += '<label>Reference ID (Internal)</label>';
  html += '<input type="text" id="kRef" required placeholder="e.g. LOAN-2024-889">';
  html += '</div>';

  html += '<div style="display:flex; gap:12px; margin-top:20px;">';
  html += '<button type="submit" class="btn btn-primary">Generate Link</button>';
  html += '<button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>';
  html += '</div>';
  
  html += '</form></div>';
  modal.innerHTML = html;
  document.body.appendChild(modal);

  document.getElementById('kycForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

    const payload = {
      clientName: document.getElementById('kClient').value,
      customerName: document.getElementById('kCustomer').value,
      referenceId: document.getElementById('kRef').value,
      createdBy: currentUser.id // Global from main app
    };

    fetch('/api/kyc/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast('Verification session created!', 'success');
        closeModal();
        loadKYCRequests();
      } else {
        showToast(data.message, 'error');
        btn.disabled = false;
        btn.innerText = 'Generate Link';
      }
    })
    .catch(err => {
      showToast('Connection failed', 'error');
      btn.disabled = false;
    });
  });
}

function viewKYCReport(id) {
  // Fetch detailed report
  fetch(`/api/kyc/list?id=${id}`)
    .then(res => res.json())
    .then(data => {
      const req = Array.isArray(data) ? data[0] : data;
      if(!req) return;

      const modal = document.createElement('div');
      modal.className = 'modal show';
      
      let html = '<div class="modal-content">';
      html += `<h2><i class="fas fa-file-contract"></i> Verification Report: ${escapeHtml(req.referenceId)}</h2>`;
      
      // Biometric Score Card
      html += '<div style="background:rgba(0,0,0,0.3); padding:15px; border-radius:10px; margin-bottom:15px; display:flex; justify-content:space-between;">';
      html += `<div><small style="color:#94a3b8">Face Match Score</small><br><strong style="font-size:18px; color:${req.faceMatchScore > 80 ? '#4ade80' : '#f87171'}">${req.faceMatchScore || 0}%</strong></div>`;
      html += `<div><small style="color:#94a3b8">Liveness</small><br><strong>${escapeHtml(req.livenessStatus || 'N/A')}</strong></div>`;
      html += `<div><small style="color:#94a3b8">Est. Age</small><br><strong>${req.estimatedAge || 'N/A'}</strong></div>`;
      html += '</div>';

      // Details Grid
      html += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:13px;">';
      html += `<div><strong>Status:</strong> ${req.status}</div>`;
      html += `<div><strong>IP Country:</strong> ${escapeHtml(req.ipCountry || '-')}</div>`;
      html += `<div><strong>IP Risk:</strong> ${escapeHtml(req.ipRiskLevel || '-')}</div>`;
      html += `<div><strong>ID Type:</strong> ${escapeHtml(req.idType || '-')}</div>`;
      html += '</div>';
      
      html += '<div style="margin-top:20px; text-align:right;">';
      html += '<button class="btn btn-secondary" onclick="closeModal()">Close Report</button>';
      html += '</div>';
      
      html += '</div>';
      modal.innerHTML = html;
      document.body.appendChild(modal);
    });
}

function copyLink(link) {
  navigator.clipboard.writeText(link).then(() => {
    showToast('Link copied to clipboard', 'success');
  });
}