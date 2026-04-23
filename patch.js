const fs = require('fs');
let f = fs.readFileSync('apps/web/src/features/admin/bulkUpload.js', 'utf8');

f = f.replace(/const existing = existingTasks\.find\([\s\S]*?=== caseId\);\r?\n\s*/g, '');
f = f.replace(/existingId: existing\.id/g, 'existingId: existingCaseIds.get(caseId)');

const oldUpload = /async function processBulkUpload\(tasks\) \{[\s\S]*?showUnassignedTasks\(\);\r?\n\}/;
const newUpload = `async function processBulkUpload(tasks) {
  if (!tasks || tasks.length === 0) return;
  const payloadTasks = tasks.map(t => ({
    ...t,
    createdBy: state.currentUser.id,
    createdByName: state.currentUser.name
  }));
  const response = await fetch('/api/tasks/bulk/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      tasks: payloadTasks,
      adminId: state.currentUser.id,
      adminName: state.currentUser.name
    })
  });
  if (response.ok) {
    showToast(\`✓ \${tasks.length} task(s) created successfully!\`, 'success');
    if (document.getElementById('allTasksList')) loadAllTasks();
    else if (document.getElementById('unassignedTasksList')) showUnassignedTasks();
  } else {
    showToast('Failed to bulk upload tasks', 'error');
  }
}`;

f = f.replace(oldUpload, newUpload);
fs.writeFileSync('apps/web/src/features/admin/bulkUpload.js', f);
console.log('Done');
