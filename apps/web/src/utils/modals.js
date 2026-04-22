/**
 * Modal Management Utility
 */

let modalTimeout = null;

export function closeAllModals() {
  const container = document.getElementById('modalContainer');
  if (!container) return;
  console.log('[DEBUG] 🚪 Closing all modals...');
  
  if (modalTimeout) {
    clearTimeout(modalTimeout);
    modalTimeout = null;
  }

  const overlay = container.querySelector('.modal-overlay');
  if (overlay) {
    overlay.classList.remove('show');
    modalTimeout = setTimeout(() => {
      container.innerHTML = '';
      container.style.display = 'none';
      modalTimeout = null;
    }, 300);
  } else {
    container.innerHTML = '';
    container.style.display = 'none';
  }
}

export function createModal(title, content, options = {}) {
  console.log(`[DEBUG] 🖼️ Creating modal: ${title}`);
  
  if (modalTimeout) {
    console.log('[DEBUG] ⚠️ Cancelling pending modal cleanup');
    clearTimeout(modalTimeout);
    modalTimeout = null;
  }

  const container = document.getElementById('modalContainer');
  if (!container) {
    console.error('[DEBUG] ❌ modalContainer NOT FOUND in DOM');
    return;
  }

  const sizeClass = options.size || 'medium';
  
  container.style.display = 'flex';
  container.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-container ${sizeClass}">
        <div class="modal-header">
          <h3><i class="${options.icon || 'fas fa-info-circle'}"></i> ${title}</h3>
          <button class="modal-close" id="modalCloseBtn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
      </div>
    </div>
  `;

  // Entrance animation
  setTimeout(() => {
    container.querySelector('.modal-overlay').classList.add('show');
  }, 10);

  // Bind close event
  document.getElementById('modalCloseBtn').addEventListener('click', closeAllModals);

  // Close on backdrop click
  container.querySelector('.modal-overlay').addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      closeAllModals();
    }
  });

  return container;
}
