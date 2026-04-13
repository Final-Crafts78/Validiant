/**
 * UI Utilities (Toasts, Loading, Helpers)
 */

export function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toast');
  if (toastContainer) {
    toastContainer.className = `toast toast-${type} show`;
    toastContainer.innerHTML = `
      <i class="fas ${getIcon(type)} toast-icon"></i>
      <span>${escapeHtml(message)}</span>
    `;
    setTimeout(() => toastContainer.classList.remove('show'), 4000);
  } else {
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }
}

export function cleanupCurrentView() {
  // Lazy import to break circular dependency: ui.js ↔ leafletEngine.js
  // leafletEngine imports showToast from ui.js, so we can't statically import from leafletEngine here.
  import('../features/routing/leafletEngine').then(mod => {
    mod.cleanupMapInstance();
  }).catch(() => {});
  const tempEls = document.querySelectorAll('.temp-edit-section, .inline-edit-form');
  tempEls.forEach(el => el.remove());
}

function getIcon(type) {
  switch(type) {
    case 'success': return 'fa-check-circle';
    case 'error': return 'fa-exclamation-circle';
    case 'warning': return 'fa-exclamation-triangle';
    default: return 'fa-info-circle';
  }
}

export function showLoading(msg = 'Loading...') {
  const container = document.getElementById('mainContainer');
  if (!container) return;
  container.innerHTML = `
    <div class="loading-spinner">
      <i class="fas fa-spinner"></i>
      <span>${msg}</span>
    </div>
  `;
}
