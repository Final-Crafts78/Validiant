/**
 * Admin: Smart Bulk Upload Feature
 */
import { showToast, escapeHtml } from '../../utils/ui';
import { createModal, closeAllModals } from '../../utils/modals';
import { state } from '../../store/globalState';
import { loadAllTasks } from './allTasks';
import { showUnassignedTasks } from './unassignedTasks';

// 1. Dependency Loader (Legacy Precision)
async function loadDependencies() {
  const loadScript = (src, id) => {
    return new Promise((resolve, reject) => {
      if (document.getElementById(id)) return resolve();
      const script = document.createElement('script');
      script.src = src;
      script.id = id;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };
  try {
    showToast('Loading intelligent parsers...', 'info');
    await Promise.all([
      loadScript('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js', 'xlsx-lib'),
      loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js', 'tesseract-lib')
    ]);
    return true;
  } catch (e) {
    showToast('Failed to load libraries', 'error');
    return false;
  }
}

// 2. Main Modal (Legacy L2727 Parity)
export async function showBulkUpload() {
  const libsReady = await loadDependencies();
  if (!libsReady) return;
  
  if (!state.allEmployees || state.allEmployees.length === 0) {
    try {
      const response = await fetch('/api/users');
      state.allEmployees = await response.json();
    } catch (e) {
      console.error('Failed to load employees', e);
    }
  }

  const content = `
    <div class="smart-upload-tabs">
      <div class="tab-header">
        <button class="tab-btn active" data-tab="file"><i class="fas fa-file-excel"></i> Excel/CSV</button>
        <button class="tab-btn" data-tab="text"><i class="fas fa-paste"></i> Paste Text</button>
        <button class="tab-btn" data-tab="ocr"><i class="fas fa-camera"></i> Image OCR</button>
      </div>

      <div id="tab-file" class="tab-content active">
        <div class="file-drop-zone" id="smartDropZone">
          <i class="fas fa-cloud-upload-alt"></i>
          <h4>Drag & Drop Excel/CSV</h4>
          <p>We'll auto-detect columns like "Request ID", "Pin", "Client"</p>
          <input type="file" id="smartFileIn" accept=".xlsx,.xls,.csv" hidden>
          <button class="btn btn-primary" onclick="document.getElementById('smartFileIn').click()">Select File</button>
          
          <div style="margin-top:20px;">
             <button class="btn btn-secondary btn-sm" data-action="admin:downloadTemplate"><i class="fas fa-download"></i> Download Template</button>
          </div>
        </div>
      </div>

      <div id="tab-text" class="tab-content" style="display:none">
        <textarea id="smartTextIn" class="form-input" rows="10" placeholder="Paste data from Excel, Sheets, or Email...&#10;Example:&#10;CASE123 | 560001 | John Doe&#10;CASE124 | 560002 | Jane Smith"></textarea>
        <div class="form-hint"><i class="fas fa-info-circle"></i> Supports Tab, Comma, or Pipe (|) separators</div>
        <button class="btn btn-primary" style="margin-top:15px; width:100%" data-action="admin:processSmartText">Parse Text</button>
      </div>

      <div id="tab-ocr" class="tab-content" style="display:none">
        <div class="file-drop-zone" id="ocrDropZone">
          <i class="fas fa-magic"></i>
          <h4>Upload Image of Table</h4>
          <p>We'll extract text using AI (Tesseract.js)</p>
          <input type="file" id="smartImgIn" accept="image/*" hidden>
          <button class="btn btn-primary" onclick="document.getElementById('smartImgIn').click()">Select Image</button>
        </div>
        <div id="ocrProgress" style="display:none; margin-top:20px;">
          <div class="progress-bar-wrapper"><div class="progress-bar-fill" id="ocrBar" style="width:0%"></div></div>
          <p id="ocrStatus" style="text-align:center; font-size:12px; margin-top:5px; color:#9CA3AF">Initializing...</p>
        </div>
      </div>
    </div>
    
    <style>
      .smart-upload-tabs { display: flex; flex-direction: column; gap: 20px; }
      .tab-header { display: flex; border-bottom: 1px solid #374151; gap: 10px; }
      .tab-btn { background: none; border: none; padding: 10px 20px; color: #9CA3AF; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.3s; }
      .tab-btn.active { color: #6366F1; border-color: #6366F1; font-weight: 600; }
      .tab-btn:hover { color: #E5E7EB; }
      .file-drop-zone { border: 2px dashed #374151; border-radius: 12px; padding: 40px; text-align: center; cursor: pointer; transition: 0.3s; }
      .file-drop-zone:hover { border-color: #6366F1; background: rgba(99,102,241,0.05); }
      .file-drop-zone i { font-size: 3rem; color: #6366F1; margin-bottom: 15px; }
      .progress-bar-wrapper { background: #374151; height: 10px; border-radius: 5px; overflow: hidden; }
      .progress-bar-fill { background: #6366F1; height: 100%; transition: width 0.3s; }
    </style>
  `;

  createModal('Smart Import', content, { size: 'large', icon: 'fa-robot' });

  // Tab switching (Internal Logic)
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
      document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
      const tabId = e.target.closest('button').getAttribute('data-tab');
      document.getElementById(`tab-${tabId}`).style.display = 'block';
      e.target.closest('button').classList.add('active');
    });
  });

  // File Handler (Internal Logic)
  document.getElementById('smartFileIn')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const wb = window.XLSX.read(evt.target.result, {type: 'binary'});
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = window.XLSX.utils.sheet_to_json(ws);
        const mapped = smartColumnMapper(json);
        showSmartPreview(mapped);
      };
      reader.readAsBinaryString(file);
    }
  });

  // OCR Handler (Internal Logic)
  document.getElementById('smartImgIn')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      document.getElementById('ocrDropZone').style.display = 'none';
      document.getElementById('ocrProgress').style.display = 'block';
      try {
        const worker = await window.Tesseract.createWorker({
          logger: m => {
            if (m.status === 'recognizing text') {
              document.getElementById('ocrBar').style.width = `${m.progress * 100}%`;
              document.getElementById('ocrStatus').innerText = `Scanning... ${Math.round(m.progress * 100)}%`;
            }
          }
        });
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const { data: { text } } = await worker.recognize(file);
        await worker.terminate();
        document.getElementById('smartTextIn').value = text;
        document.querySelector('[data-tab="text"]').click();
        showToast('Text extracted! Please check and parse.', 'success');
      } catch (err) {
        showToast('OCR Failed', 'error');
        document.getElementById('ocrDropZone').style.display = 'block';
        document.getElementById('ocrProgress').style.display = 'none';
      }
    }
  });
}

// 3. Smart Text Parser (Legacy L4151 Strategy A/B)
export function processSmartText() {
  const text = document.getElementById('smartTextIn').value;
  if (!text.trim()) return showToast('Please paste some data', 'warning');

  const lines = text.split('\n').filter(l => l.trim());
  let data = [];

  // Strategy A: Key-Value Pairs
  const isKeyValue = lines.slice(0, 3).every(l => l.includes(':') || l.includes('-'));
  
  if (isKeyValue) {
    let currentObj = {};
    lines.forEach(line => {
      const [key, ...valParts] = line.split(/[:\t-]+/); 
      const val = valParts.join(' ').trim();
      if (!key || !val) return;
      const lowerKey = key.toLowerCase();
      if ((lowerKey.includes('case') || lowerKey.includes('id')) && currentObj.title) {
        data.push(currentObj);
        currentObj = {};
      }
      if (lowerKey.includes('case') || lowerKey.includes('id')) currentObj.title = val;
      if (lowerKey.includes('pin')) currentObj.pincode = val;
      if (lowerKey.includes('client')) currentObj.clientName = val;
    });
    if (currentObj.title) data.push(currentObj);
  } else {
    // Strategy B: Delimiter Table
    const firstLine = lines[0];
    let delimiter = ',';
    if (firstLine.includes('\t')) delimiter = '\t';
    else if (firstLine.includes('|')) delimiter = '|';
    const headers = lines[0].split(delimiter).map(h => h.trim());
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(delimiter);
      if (values.length < 2) continue; 
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] ? values[idx].trim() : '';
      });
      data.push(row);
    }
  }

  const mapped = smartColumnMapper(data);
  if(mapped.length === 0) return showToast('Could not parse data. Try Excel format.', 'error');
  showSmartPreview(mapped);
}

// 4. Intelligent Column Mapper (Legacy L3969 Precision)
function smartColumnMapper(rawData) {
  const normalized = [];
  const mapRules = {
    title: ['caseid', 'requestid', 'id', 'title', 'case', 'ticket', 'ref', 'number'],
    clientName: ['client', 'customer', 'individual', 'name', 'party'],
    pincode: ['pincode', 'pin', 'zip', 'postal'],
    address: ['address', 'location', 'addr', 'site'],
    mapUrl: ['map', 'url', 'link', 'google', 'location_link'],
    notes: ['notes', 'remarks', 'comments', 'desc'],
    assignedTo: ['employee', 'empid', 'assigned', 'agent', 'field_executive', 'fe']
  };

  rawData.forEach(row => {
    const newRow = {};
    const rowKeys = Object.keys(row);
    const findValue = (field) => {
      const match = rowKeys.find(k => {
        const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
        return mapRules[field].some(rule => cleanKey.includes(rule));
      });
      return match ? row[match] : null;
    };

    newRow.title = findValue('title') || `CASE-${Math.floor(Math.random()*100000)}`;
    newRow.clientName = findValue('clientName');
    newRow.pincode = findValue('pincode');
    newRow.address = findValue('address');
    newRow.mapUrl = findValue('mapUrl');
    newRow.notes = findValue('notes');
    
    // Legacy Employee Matching (ID OR Name)
    const empVal = findValue('assignedTo');
    if (empVal && state.allEmployees && state.allEmployees.length > 0) {
      const cleanInput = String(empVal).toLowerCase().replace(/[^a-z0-9]/g, '');
      const emp = state.allEmployees.find(e => {
        const dbId = String(e.employeeId || e.employee_id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const dbName = String(e.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return (dbId === cleanInput) || (dbName === cleanInput);
      });
      newRow.assignedTo = emp ? emp.id : null;
    } else {
      newRow.assignedTo = null;
    }

    // Smart Pincode Extraction from Address
    if (!newRow.pincode && newRow.address) {
      const pinMatch = String(newRow.address).match(/\b[1-9][0-9]{5}\b/); 
      if (pinMatch) newRow.pincode = pinMatch[0];
    }
    
    if (newRow.title || newRow.pincode) normalized.push(newRow);
  });
  return normalized;
}

// 5. Smart Preview Modal (Legacy L4048 Parity)
function showSmartPreview(tasks) {
  closeAllModals();
  window._pendingBulkTasks = tasks;
  
  const content = `
    <div class="preview-container">
      <div class="preview-header" style="margin-bottom:15px; display:flex; justify-content:space-between;">
        <div class="stats">
          <span class="info-badge">Total: ${tasks.length}</span>
          <span class="info-badge" style="color:#10B981; border-color:#10B981">Assigned: ${tasks.filter(t => t.assignedTo).length}</span>
        </div>
      </div>
      
      <div class="table-wrapper" style="max-height: 400px; overflow: auto; margin-bottom: 20px; border: 1px solid #374151; border-radius: 8px;">
        <table class="data-table" id="previewTable" style="width:100%">
          <thead style="position:sticky; top:0; background:#1F2937; z-index:10;">
            <tr>
              <th>Case ID / Title</th>
              <th>Pincode</th>
              <th>Client</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${tasks.map((t, idx) => `
              <tr data-idx="${idx}">
                <td><input type="text" value="${escapeHtml(t.title)}" class="form-input text-sm" name="title"></td>
                <td><input type="text" value="${escapeHtml(t.pincode || '')}" class="form-input text-sm" name="pincode" style="width:80px"></td>
                <td>${escapeHtml(t.clientName || '-')}</td>
                <td>${t.assignedTo ? '<span class="status-badge status-verified">Matched</span>' : '<span class="status-badge status-unassigned">Pool</span>'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="modal-actions">
        <button id="confirmUploadBtn" class="btn btn-primary btn-lg" data-action="admin:submitFinalBulk">
          <i class="fas fa-cloud-upload-alt"></i> Upload Valid Tasks
        </button>
        <button id="cancelUploadBtn" class="btn btn-secondary" data-action="admin:showBulkUpload">Back</button>
      </div>
    </div>
  `;

  createModal('Review & Edit Data', content, { size: 'large', icon: 'fa-edit' });
}

export async function submitFinalBulkUpload() {
  const btn = document.getElementById('confirmUploadBtn');
  const cancelBtn = document.getElementById('cancelUploadBtn');
  const tasks = window._pendingBulkTasks;

  const rows = document.querySelectorAll('#previewTable tbody tr');
  const updatedTasks = [];

  rows.forEach(row => {
    const idx = row.getAttribute('data-idx');
    const task = tasks[idx];
    task.title = row.querySelector('input[name="title"]').value;
    task.pincode = row.querySelector('input[name="pincode"]').value;
    if (task.title && task.pincode) updatedTasks.push(task);
  });

  if (updatedTasks.length === 0) return showToast('No valid tasks to upload', 'error');

  btn.disabled = true;
  if(cancelBtn) cancelBtn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking Duplicates...';

  try {
    const { duplicates, newTasks } = await checkDuplicateCases(updatedTasks);
    if (duplicates.length > 0) {
      showDuplicateModal(duplicates, newTasks);
    } else {
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
      await processBulkUpload(newTasks);
      closeAllModals();
    }
  } catch (err) {
    showToast('Error processing upload', 'error');
    btn.disabled = false;
    if(cancelBtn) cancelBtn.disabled = false;
    btn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Upload Valid Tasks';
  }
}

// 6. Duplicate Checker (Legacy L2907)
async function checkDuplicateCases(tasks) {
  const response = await fetch('/api/tasks?role=admin');
  const existingTasks = await response.json();
  const existingCaseIds = new Set(existingTasks.filter(t => t.title).map(t => t.title.trim().toLowerCase()));
  const duplicates = [];
  const newTasks = [];
  tasks.forEach(task => {
    const caseId = task.title.trim().toLowerCase();
    if (existingCaseIds.has(caseId)) {
      const existing = existingTasks.find(e => e.title && e.title.trim().toLowerCase() === caseId);
      duplicates.push({ ...task, existingId: existing.id });
    } else {
      newTasks.push(task);
    }
  });
  return { duplicates, newTasks };
}

// 7. Duplicate Modal (Legacy L2978)
function showDuplicateModal(duplicates, newTasks) {
  const content = `
    <div class="form-info" style="margin-bottom: 20px;">
      <i class="fas fa-exclamation-triangle"></i>
      <span><strong>${duplicates.length}</strong> duplicate case(s) found. What would you like to do?</span>
    </div>
    
    <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 15px; margin-bottom: 20px;">
      <div style="color: #FCA5A5; font-size: 13px; font-weight: 500; margin-bottom: 8px;">Duplicate Cases:</div>
      <div style="max-height: 150px; overflow-y: auto; color: #D1D5DB; font-size: 12px;">
        ${duplicates.map(d => `• ${escapeHtml(d.title)}`).join('<br>')}
      </div>
    </div>
    
    <div class="modal-actions" style="display: flex; flex-direction: column; gap: 10px;">
      <button class="btn btn-primary" data-action="admin:bulkDuplicateChoice" data-choice="create">
        <i class="fas fa-plus"></i> Create New (${duplicates.length + newTasks.length} total tasks)
      </button>
      <button class="btn btn-warning" data-action="admin:bulkDuplicateChoice" data-choice="update">
        <i class="fas fa-sync-alt"></i> Update Existing (${duplicates.length} updated + ${newTasks.length} new)
      </button>
      <button class="btn btn-secondary" data-action="admin:bulkDuplicateChoice" data-choice="cancel">
        <i class="fas fa-times"></i> Cancel Duplicates (${newTasks.length} new only)
      </button>
    </div>
  `;
  window._bulkUploadContext = { duplicates, newTasks };
  createModal('Duplicate Cases Found', content, { icon: 'fa-exclamation-triangle', size: 'medium' });
}

export async function handleBulkDuplicateChoice(choice) {
  const ctx = window._bulkUploadContext;
  if (!ctx) return;
  closeAllModals();
  if (choice === 'create') {
    showToast('Creating all tasks...', 'info');
    await processBulkUpload([...ctx.duplicates, ...ctx.newTasks]);
  } else if (choice === 'update') {
    showToast('Updating existing and creating new tasks...', 'info');
    await updateExistingTasks(ctx.duplicates);
    await processBulkUpload(ctx.newTasks);
  } else if (choice === 'cancel') {
    showToast('Skipping duplicates, creating new tasks only...', 'info');
    await processBulkUpload(ctx.newTasks);
  }
}

async function updateExistingTasks(duplicates) {
  let updated = 0;
  for (const dup of duplicates) {
    if (dup.assignedTo) {
      const res = await fetch(`/api/tasks/${dup.existingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo: dup.assignedTo, userId: state.currentUser.id, userName: state.currentUser.name })
      });
      if (res.ok) updated++;
    }
  }
  showToast(`${updated} task(s) reassigned successfully!`, 'success');
}

async function processBulkUpload(tasks) {
  let successCount = 0;
  for (const task of tasks) {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...task, createdBy: state.currentUser.id, createdByName: state.currentUser.name })
    });
    if (response.ok) successCount++;
  }
  showToast(`✓ ${successCount} task(s) created successfully!`, 'success');
  if (document.getElementById('allTasksList')) loadAllTasks();
  else if (document.getElementById('unassignedTasksList')) showUnassignedTasks();
}

export function downloadBulkUploadTemplate() {
  const csvContent = `CaseID,Pincode,ClientName,EmployeeID,MapURL,Notes
CASE001,560001,ABC Company,,http://maps.google.com/example,Priority task
CASE002,560002,XYZ Corp,EMP123,,Assign to specific ID
CASE003,560003,Test Client,,,Leave EmployeeID empty for pool`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Validiant_Bulk_Upload_Template_${new Date().toISOString().split('T')[0]}.csv`);
  link.click();
  showToast('Template downloaded successfully!', 'success');
}
