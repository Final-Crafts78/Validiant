/**
 * UI Utilities (Toasts, Loading, Skeletons)
 */

export function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Premium Toast Manager
 */
let toastTimeout;
export function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toast');
  if (!toastContainer) return;

  // Clear existing timeout to prevent premature hiding
  if (toastTimeout) clearTimeout(toastTimeout);

  toastContainer.className = `toast toast-${type} show premium-shadow`;
  toastContainer.innerHTML = `
    <i class="fas ${getIcon(type)} toast-icon"></i>
    <span>${escapeHtml(message)}</span>
  `;

  toastTimeout = setTimeout(() => {
    toastContainer.classList.remove('show');
  }, 4000);
}

/**
 * Skeleton Loader Engine
 * Replaces jarring "Loading..." text with animated UI placeholders
 */
export function renderSkeletons(container, count = 5, itemHeight = '70px') {
  if (!container) return;
  
  const skeletons = Array(count).fill(0).map(() => `
    <div class="card skeleton-container" style="height: ${itemHeight}; margin-bottom: 12px; display: flex; align-items: center; padding: 15px; gap: 15px;">
      <div class="skeleton" style="width: 40px; height: 40px; border-radius: 50%;"></div>
      <div style="flex: 1;">
        <div class="skeleton" style="width: 60%; height: 12px; margin-bottom: 8px;"></div>
        <div class="skeleton" style="width: 40%; height: 8px;"></div>
      </div>
      <div class="skeleton" style="width: 80px; height: 24px; border-radius: 12px;"></div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="gpu-boost" style="animation: fadeIn 0.4s ease-out;">
      ${skeletons}
    </div>
  `;
}

export async function cleanupCurrentView() {
  try {
    const mod = await import('../features/routing/leafletEngine');
    mod.cleanupMapInstance();
  } catch (e) {
    // silently fail if no map
  }
  
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

export function showLoading(msg = 'Refining View...') {
  const container = document.getElementById('mainContainer');
  if (!container) return;
  
  // If we're loading a list, use skeletons for premium feel
  renderSkeletons(container, 6);
}
