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
 * Premium Toast Manager (Supports Stacking & Staggered Animations)
 */
const activeToasts = [];
export function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed; bottom:30px; right:30px; display:flex; flex-direction:column-reverse; gap:10px; z-index:10001;';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type} gpu-boost`;
  toast.style.cssText = 'position:static; transform:translateX(100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease; opacity:0; pointer-events:auto;';
  
  toast.innerHTML = `
    <i class="fas ${getIcon(type)} toast-icon"></i>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);
  
  // Force reflow for animation
  toast.offsetHeight;
  toast.style.transform = 'translateX(0)';
  toast.style.opacity = '1';

  const removeToast = () => {
    toast.style.transform = 'translateX(120%)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  };

  setTimeout(removeToast, 4000);
  toast.onclick = removeToast;
}

/**
 * Skeleton Loader Engine (Fluid Shimmer)
 */
export function renderSkeletons(container, count = 5, itemHeight = '70px') {
  if (!container) return;
  
  const skeletons = Array(count).fill(0).map(() => `
    <div class="card skeleton-container" style="height: ${itemHeight}; margin-bottom: 12px; display: flex; align-items: center; padding: 15px; gap: 15px; overflow: hidden; position: relative;">
      <div class="skeleton shimmer-effect" style="width: 40px; height: 40px; border-radius: 50%;"></div>
      <div style="flex: 1;">
        <div class="skeleton shimmer-effect" style="width: 60%; height: 12px; margin-bottom: 8px;"></div>
        <div class="skeleton shimmer-effect" style="width: 40%; height: 8px;"></div>
      </div>
      <div class="skeleton shimmer-effect" style="width: 80px; height: 24px; border-radius: 12px;"></div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="gpu-boost view-fade-in">
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

/**
 * Magnetic Micro-interactions
 * Makes buttons subtly "pull" towards the cursor for a high-prestige feel.
 */
export function initMagneticButtons() {
  const buttons = document.querySelectorAll('.btn-primary, .menu-item');
  
  buttons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

export function showLoading(msg = 'Refining View...') {
  const container = document.getElementById('mainContainer');
  if (!container) return;
  
  // If we're loading a list, use skeletons for premium feel
  renderSkeletons(container, 6);
}
