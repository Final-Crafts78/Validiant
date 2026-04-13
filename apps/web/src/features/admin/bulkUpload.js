/**
 * Admin: Smart Bulk Upload Feature
 */
import { showToast, escapeHtml } from '../../utils/ui';
import { createModal, closeAllModals } from '../../utils/modals';
import { state } from '../../store/globalState';
import { loadUnassignedTasks, showUnassignedTasks } from './unassignedTasks';
import { loadAllTasks, showAllTasks } from './allTasks';

// 1. Dependency Loader
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
    showToast('Loading import tools...', 'info');
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

// 2. Main Modal
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
    <div class="smart-upload-tabs" style="display:flex; flex-direction:column; gap:20px;">
      <div class="tab-header" style="display:flex; border-bottom:1px solid #374151; gap:10px;">
        <button class="tab-btn active" data-tab="file"><i class="fas fa-file-excel"></i> Excel/CSV</button>
        <button class="tab-btn" data-tab="text"><i class="fas fa-paste"></i> Paste Text</button>
        <button class="tab-btn" data-tab="ocr"><i class="fas fa-camera"></i> Image OCR</button>
      </div>

      <div id="tab-file" class="tab-content active">
        <div class="file-drop-zone" id="smartDropZone" style="border:2px dashed #374151; border-radius:12px; padding:40px; text-align:center; cursor:pointer;">
          <i class="fas fa-cloud-upload-alt" style="font-size:3rem; color:#6366F1; margin-bottom:15px;"></i>
          <h4 style="color:#e5e7eb; margin-bottom:10px;">Drag & Drop Excel/CSV</h4>
          <p style="color:#9ca3af; font-size:13px; margin-bottom:20px;">We'll auto-detect columns like "Case ID" and "Pincode"</p>
          <input type="file" id="smartFileIn" accept=".xlsx,.xls,.csv" hidden>
          <button class="btn btn-primary" onclick="document.getElementById('smartFileIn').click()">Select File</button>
          
          <div style="margin-top:20px;">
             <button class="btn btn-secondary btn-sm" onclick="window._downloadBulkUploadTemplate()"><i class="fas fa-download"></i> Download Template</button>
          </div>
        </div>
      </div>

      <div id="tab-text" class="tab-content" style="display:none">
        <textarea id="smartTextIn" class="form-input" rows="8" placeholder="Paste data from Excel, Sheets, or Email..."></textarea>
        <button class="btn btn-primary" style="margin-top:15px; width:100%" data-action="admin:processSmartText">Parse Text</button>
      </div>

      <div id="tab-ocr" class="tab-content" style="display:none">
        <div class="file-drop-zone" id="ocrDropZone" style="border:2px dashed #374151; border-radius:12px; padding:40px; text-align:center; cursor:pointer;">
          <i class="fas fa-magic" style="font-size:3rem; color:#6366F1; margin-bottom:15px;"></i>
          <h4 style="color:#e5e7eb; margin-bottom:10px;">Upload Image of Table</h4>
          <input type="file" id="smartImgIn" accept="image/*" hidden>
          <button class="btn btn-primary" onclick="document.getElementById('smartImgIn').click()">Select Image</button>
        </div>
        <div id="ocrProgress" style="display:none; margin-top:20px;">
          <div style="background:#374151; height:8px; border-radius:4px;"><div id="ocrBar" style="background:#6366F1; height:100%; border-radius:4px; width:0%"></div></div>
          <p id="ocrStatus" style="text-align:center; font-size:12px; margin-top:5px; color:#9CA3AF">Initializing...</p>
        </div>
      </div>
    </div>
  `;

  createModal('Smart Import', content, { size: 'large', icon: 'fa-robot' });

  // Tab switching logic
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
      document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active', 'custom-active-style'));
      const tabId = e.target.closest('button').getAttribute('data-tab');
      document.getElementById(`tab-${tabId}`).style.display = 'block';
      e.target.closest('button').classList.add('active');
    });
  });

  // Excel File Handler
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

  // OCR Image Handler
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
        showToast('Text extracted! Please adjust rows and parse.', 'success');
      } catch (err) {
        showToast('OCR Failed', 'error');
        document.getElementById('ocrDropZone').style.display = 'block';
        document.getElementById('ocrProgress').style.display = 'none';
      }
    }
  });
  
  // Template wrapper
  window._downloadBulkUploadTemplate = () => downloadBulkUploadTemplate();
}

export function processSmartText() {
  const text = document.getElementById('smartTextIn')?.value;
  if (!text?.trim()) return showToast('Please paste data', 'warning');

  const lines = text.split('\n').filter(l => l.trim());
  const firstLine = lines[0];
  let delimiter = ',';
  if (firstLine.includes('\\t')) delimiter = '\\t';
  else if (firstLine.includes('|')) delimiter = '|';

  const headers = lines[0].split(delimiter).map(h => h.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter);
    if (values.length < 2) continue;
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ? values[idx].trim() : '';
    });
    data.push(row);
  }

  const mapped = smartColumnMapper(data);
  showSmartPreview(mapped);
}

function downloadBulkUploadTemplate() {
  const csvContent = `CaseID,Pincode,ClientName,EmployeeID,MapURL,Notes\nCASE001,560001,ABC Company,,http://maps.google.com/example,Priority task\nCASE002,560002,XYZ Corp,EMP123,,Assign to specific ID`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Validiant_Bulk_Upload_Template.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 3. Intelligent Column Mapper
function smartColumnMapper(rawData) {
  const normalized = [];
  const mapRules = {
    title: ['caseid', 'requestid', 'id', 'title', 'case', 'ticket', 'ref', 'number'],
    clientName: ['client', 'customer', 'individual', 'name', 'party'],
    pincode: ['pincode', 'pin', 'zip', 'postal'],
    address: ['address', 'location', 'addr', 'site'],
    mapUrl: ['map', 'url', 'link', 'google', 'location_link'],
    notes: ['notes', 'remarks', 'comments', 'desc'],
    assignedTo: ['employee', 'empid', 'assigned', 'eid']
  };

  rawData.forEach(row => {
    const newRow = {};
    const rowKeys = Object.keys(row);
    
    const findValue = (field) => {
      const match = rowKeys.find(k => {
        const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
        return mapRules[field].some(syn => cleanK.includes(syn));
      });
      return match ? row[match] : '';
    };

    newRow.title = findValue('title') || `CASE-${Math.floor(Math.random()*100000)}`;
    newRow.clientName = findValue('clientName');
    
    // Extractor fallback for pincode
    let pin = findValue('pincode').toString();
    if (!pin && findValue('address')) {
      const pinMatch = findValue('address').match(/\\b\\d{6}\\b/);
      if (pinMatch) pin = pinMatch[0];
    }
    newRow.pincode = pin;

    newRow.mapUrl = findValue('mapUrl');
    newRow.notes = findValue('notes');
    
    const empIdStr = findValue('assignedTo')?.toString();
    if (empIdStr && state.allEmployees) {
      const emp = state.allEmployees.find(e => 
        e.employeeId?.toLowerCase() === empIdStr.toLowerCase() || 
        e.id.toString() === empIdStr
      );
      newRow.assignedTo = emp ? emp.id : null;
    } else {
      newRow.assignedTo = null;
    }
    
    normalized.push(newRow);
  });
  
  return normalized;
}

// 4. Preview Window (Restored Legacy Perfection: Editable Table)
function showSmartPreview(tasks) {
  closeAllModals();
  window._pendingBulkTasks = tasks;
  
  const content = `
    <div class="preview-container">
      <div class="preview-header" style="margin-bottom:15px; display:flex; justify-content:space-between; align-items:center;">
        <span class="info-badge" style="color:#94a3b8;"><i class="fas fa-list"></i> Total: <strong>${tasks.length}</strong> tasks parsed</span>
        <span class="info-badge" style="color:#6366F1; border-color:rgba(99,102,241,0.3)"><i class="fas fa-edit"></i> Click fields to edit</span>
      </div>
      
      <div class="table-wrapper" style="max-height: 400px; overflow: auto; border: 1px solid #374151; border-radius: 8px;">
        <table class="data-table" id="previewTable" style="width:100%">
          <thead style="position:sticky; top:0; background:#1F2937; z-index:10;">
            <tr>
              <th style="padding:12px;">Case ID</th>
              <th style="padding:12px;">Pincode</th>
              <th style="padding:12px;">Client Name</th>
              <th style="padding:12px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${tasks.map((t, idx) => `
              <tr data-idx="${idx}" style="border-bottom:1px solid #334155;">
                <td style="padding:8px;"><input type="text" value="${escapeHtml(t.title)}" class="form-input text-sm" name="title" style="background:rgba(0,0,0,0.2); border:1px solid transparent; width:100%"></td>
                <td style="padding:8px;"><input type="text" value="${escapeHtml(t.pincode || '')}" class="form-input text-sm" name="pincode" style="background:rgba(0,0,0,0.2); border:1px solid transparent; width:100%"></td>
                <td style="padding:12px; color:#94a3b8;">${escapeHtml(t.clientName || '-')}</td>
                <td style="padding:12px;">${t.assignedTo ? '<span style="color:#60a5fa; font-size:12px;"><i class="fas fa-user-check"></i> Matched</span>' : '<span style="color:#f59e0b; font-size:12px;"><i class="fas fa-layer-group"></i> Pool</span>'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div class="modal-actions" style="margin-top:20px; display:flex; gap:10px; justify-content:flex-end;">
         <button class="btn btn-primary" data-action="admin:submitFinalBulk"><i class="fas fa-upload"></i> Complete Import</button>
         <button class="btn btn-secondary" onclick="closeAllModals()"><i class="fas fa-times"></i> Cancel</button>
      </div>
    </div>
  `;
  
  createModal('Review Data Import', content, { size: 'large', icon: 'fa-robot' });
}

export async function submitFinalBulkUpload() {
  const btn = document.querySelector('.modal .btn-primary');
  const rows = document.querySelectorAll('#previewTable tbody tr');
  const updatedTasks = [];

  rows.forEach(row => {
    const idx = row.getAttribute('data-idx');
    const task = window._pendingBulkTasks[idx];
    task.title = row.querySelector('input[name="title"]').value;
    task.pincode = row.querySelector('input[name="pincode"]').value;
    if (task.title) updatedTasks.push(task);
  });

  if (updatedTasks.length === 0) return showToast('No tasks to upload', 'error');

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking Duplicates...';
  }
  
  try {
    // 1. Fetch existing tasks to check for duplicates
    const exRes = await fetch('/api/tasks?role=admin');
    const existing = await exRes.json();
    const existingMap = new Map(existing.map(e => [e.title.trim().toLowerCase(), e]));

    const duplicates = [];
    const newTasks = [];

    tasks.forEach(t => {
      if (existingMap.has(t.title.trim().toLowerCase())) {
        duplicates.push({ ...t, existingId: existingMap.get(t.title.trim().toLowerCase()).id });
      } else {
        newTasks.push(t);
      }
    });

    if (duplicates.length > 0) {
      showDuplicateModal(duplicates, newTasks);
    } else {
      await processBulkUpload(newTasks);
    }
  } catch (err) {
    showToast('Failed during duplicate check', 'error');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-upload"></i> Complete Import';
    }
  }
}

function showDuplicateModal(duplicates, newTasks) {
  const content = `
    <div style="display:flex; flex-direction:column; gap:20px;">
      <div class="form-info" style="background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.3); padding:15px; border-radius:8px; display:flex; gap:12px; align-items:center;">
        <i class="fas fa-exclamation-triangle" style="color:#f59e0b; font-size:24px;"></i>
        <span style="color:#e5e7eb;"><strong>${duplicates.length}</strong> duplicate case IDs found. What would you like to do?</span>
      </div>

      <div style="max-height:150px; overflow-y:auto; background:#111827; padding:15px; border-radius:8px; border:1px solid #374151;">
        <div style="color:#9ca3af; font-size:12px; margin-bottom:8px; font-weight:600; text-transform:uppercase;">Duplicate Case List:</div>
        <div style="color:#d1d5db; font-size:13px; line-height:1.6;">
          ${duplicates.map(d => `• ${escapeHtml(d.title)}`).join('<br>')}
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr; gap:10px;">
        <button class="btn btn-primary" data-action="admin:bulkDuplicateChoice" data-choice="create" style="justify-content:center; padding:12px;">
          <i class="fas fa-plus"></i> Create New (${duplicates.length + newTasks.length} total)
        </button>
        <button class="btn btn-warning" data-action="admin:bulkDuplicateChoice" data-choice="update" style="justify-content:center; padding:12px; color:#111827;">
          <i class="fas fa-sync-alt"></i> Update Existing (${duplicates.length} updated + ${newTasks.length} new)
        </button>
        <button class="btn btn-secondary" data-action="admin:bulkDuplicateChoice" data-choice="cancel" style="justify-content:center; padding:12px;">
          <i class="fas fa-times"></i> Skip Duplicates (${newTasks.length} new only)
        </button>
      </div>
    </div>
  `;
  
  window._bulkUploadContext = { duplicates, newTasks };
  createModal('Duplicate Cases Found', content, { size: 'medium', icon: 'fa-exclamation-triangle' });
}

export async function handleBulkDuplicateChoice(choice) {
  const ctx = window._bulkUploadContext;
  if (!ctx) return;
  
  closeAllModals();
  
  if (choice === 'create') {
    showToast(`Creating all ${ctx.duplicates.length + ctx.newTasks.length} tasks...`, 'info');
    await processBulkUpload([...ctx.duplicates, ...ctx.newTasks]);
  } else if (choice === 'update') {
    showToast('Updating existing and creating new...', 'info');
    await updateExistingTasks(ctx.duplicates);
    await processBulkUpload(ctx.newTasks);
  } else if (choice === 'cancel') {
    showToast(`Skipping ${ctx.duplicates.length} duplicates...`, 'info');
    await processBulkUpload(ctx.newTasks);
  }
  
  delete window._bulkUploadContext;
}

async function updateExistingTasks(duplicates) {
  let success = 0;
  for (const dup of duplicates) {
    if (!dup.assignedTo) continue;
    try {
      const res = await fetch(`/api/tasks/${dup.existingId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          employeeId: dup.assignedTo,
          userId: state.currentUser.id,
          userName: state.currentUser.name
        })
      });
      if (res.ok) success++;
    } catch (e) { console.error(e); }
  }
  showToast(`${success} task(s) reassigned successfully`, 'success');
}

async function processBulkUpload(tasks) {
  if (!tasks || tasks.length === 0) {
    showToast('Import complete (no new tasks)', 'success');
    refreshAfterUpload();
    return;
  }

  let successCount = 0;
  for (const t of tasks) {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...t,
          createdBy: state.currentUser.id,
          createdByName: state.currentUser.name
        })
      });
      if (response.ok) successCount++;
    } catch (e) { console.error(e); }
  }

  showToast(`${successCount} task(s) imported successfully`, 'success');
  refreshAfterUpload();
}

function refreshAfterUpload() {
  closeAllModals();
  delete window._pendingBulkTasks;
  if (document.getElementById('allTasksList')) loadAllTasks();
  else if (document.getElementById('unassignedTasksList')) showUnassignedTasks();
  else showAllTasks();
}
