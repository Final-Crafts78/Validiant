/**
 * Admin: Map Modals (Consolidated)
 */
import { showToast, escapeHtml } from '../../utils/ui';
import { createModal, closeAllModals } from '../../utils/modals';
import { state } from '../../store/globalState';
import { loadUnassignedTasks } from './unassignedTasks';

export function showEditMapModal(taskId) {
  const task = state.allAdminTasks?.find(t => t.id === taskId) 
            || state.currentFilteredTasks?.find(t => t.id === taskId)
            || state.allUnassignedTasks?.find(t => t.id === taskId);
            
  if (!task) return showToast('Task not found', 'error');

  const currentMapUrl = escapeHtml(task.map_url || task.mapUrl || task.mapurl || '');
  const taskTitle = escapeHtml(task.title || 'Unknown Task');

  const content = `
    <div class="edit-map-form" style="display:flex; flex-direction:column; gap:20px;">
      <div class="form-info" style="background:rgba(99,102,241,0.1); border:1px solid rgba(99,102,241,0.3); padding:12px; border-radius:8px; color:#a5b4fc; font-size:13px;">
        <i class="fas fa-info-circle"></i> Editing map URL for: <strong>${taskTitle}</strong>
      </div>
      
      <div class="form-group">
        <label for="editMapUrl"><i class="fas fa-link"></i> Google Maps URL</label>
        <input type="url" id="editMapUrl" class="form-input" placeholder="Paste Google Maps link here" value="${currentMapUrl}" />
        <small class="form-hint" style="color:#64748b; font-size:11px;"><i class="fas fa-lightbulb"></i> Auto-extracts coordinates from long links</small>
      </div>

      <div class="form-row" style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
        <div class="form-group">
          <label for="editLatitude"><i class="fas fa-globe"></i> Latitude</label>
          <input type="number" id="editLatitude" step="any" placeholder="Manual Lat" class="form-input" />
        </div>
        <div class="form-group">
          <label for="editLongitude"><i class="fas fa-globe"></i> Longitude</label>
          <input type="number" id="editLongitude" step="any" placeholder="Manual Lng" class="form-input" />
        </div>
      </div>
      
      <div class="modal-actions" style="display:flex; gap:10px; justify-content:flex-end; border-top:1px solid #1f2937; padding-top:15px;">
        <button class="btn btn-primary" data-action="admin:saveMapUrl" data-id="${task.id}">
          <i class="fas fa-save"></i> Save Changes
        </button>
        <button class="btn btn-secondary" onclick="document.querySelector('.modal').remove()">
          <i class="fas fa-times"></i> Cancel
        </button>
      </div>
    </div>
  `;
  
  createModal('Edit Map URL', content, { icon: 'fa-map-marked-alt', size: 'medium' });
  
  setTimeout(() => {
    const mapInput = document.getElementById('editMapUrl');
    const latInput = document.getElementById('editLatitude');
    const lngInput = document.getElementById('editLongitude');
    
    if (mapInput) {
      mapInput.focus();
      mapInput.select();
      mapInput.addEventListener('input', function() {
        const url = this.value;
        if (url) {
          const latMatch = url.match(/@(-?[0-9.]+),(-?[0-9.]+)/);
          const qMatch = url.match(/\\?q=(-?[0-9.]+),(-?[0-9.]+)/);
          if (latMatch) {
            latInput.value = latMatch[1];
            lngInput.value = latMatch[2];
          } else if (qMatch) {
            latInput.value = qMatch[1];
            lngInput.value = qMatch[2];
          }
        }
      });
    }
  }, 100);
}

export async function saveEditedMapUrl(taskId) {
  const url = document.getElementById('editMapUrl')?.value?.trim();
  const lat = document.getElementById('editLatitude')?.value;
  const lng = document.getElementById('editLongitude')?.value;
  
  try {
    const latNum = lat ? parseFloat(lat) : null;
    const lngNum = lng ? parseFloat(lng) : null;
    
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ map_url: url, latitude: latNum, longitude: lngNum })
    });
    
    if (res.ok) {
      showToast('Map URL updated!', 'success');
      closeAllModals();
      if(document.getElementById('unassignedTasksList')) loadUnassignedTasks();
    } else {
      showToast('Failed to update URL', 'error');
    }
  } catch (err) {
    showToast('Network error', 'error');
  }
}
