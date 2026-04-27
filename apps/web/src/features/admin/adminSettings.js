import { state } from '../../store/globalState';
import { showToast, showLoading } from '../../utils/ui';

export async function showAdminSettings() {
  const content = document.getElementById('mainContainer');
  if (!content) return;

  const html = `
    <div class="page-header">
      <div>
        <h2><i class="fas fa-cog"></i> Settings</h2>
        <p style="color: #9CA3AF; font-size: 13px; margin-top: 5px;">
          Manage application-wide configurations and feature flags
        </p>
      </div>
    </div>
    
    <div class="settings-container" style="background: rgba(15, 23, 42, 0.6); border: 1px solid #1F2937; border-radius: 16px; padding: 30px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);">
      <div id="settingsList" style="display: flex; flex-direction: column; gap: 20px;">
        <div style="color: #9CA3AF; font-size: 14px;"><i class="fas fa-spinner fa-spin"></i> Loading settings...</div>
      </div>
    </div>
    
    <style>
      .setting-item {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding-bottom: 20px;
        border-bottom: 1px solid #1F2937;
      }
      .setting-item:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
      .setting-info {
        flex: 1;
        padding-right: 20px;
      }
      .setting-title {
        color: #E5E7EB;
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 5px;
      }
      .setting-desc {
        color: #9CA3AF;
        font-size: 13px;
        line-height: 1.5;
      }
      
      /* Toggle Switch */
      .switch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 24px;
      }
      .switch input { 
        opacity: 0;
        width: 0;
        height: 0;
      }
      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #374151;
        transition: .4s;
        border-radius: 34px;
      }
      .slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
      }
      input:checked + .slider {
        background-color: #10B981;
      }
      input:focus + .slider {
        box-shadow: 0 0 1px #10B981;
      }
      input:checked + .slider:before {
        transform: translateX(26px);
      }
    </style>
  `;
  content.innerHTML = html;

  await loadSettings();
}

async function loadSettings() {
  const container = document.getElementById('settingsList');
  if (!container) return;

  try {
    const res = await fetch('/api/settings/executive_map_edit');
    const data = await res.json();
    
    // Default to false if setting is missing or api fails
    let isEnabled = false;
    if (data.success && data.value) {
      isEnabled = data.value.enabled === true;
    }

    container.innerHTML = `
      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-title"><i class="fas fa-map-marked-alt" style="color: #6366F1; margin-right: 8px;"></i> Executive Map Link Editing</div>
          <div class="setting-desc">
            Allow field executives to edit and update map links on their assigned tasks. 
            This enables them to provide precise location data for routing if the original link is missing or inaccurate.
          </div>
        </div>
        <div class="setting-action" style="padding-top: 5px;">
          <label class="switch">
            <input type="checkbox" id="toggle_executive_map_edit" ${isEnabled ? 'checked' : ''} onchange="window._toggleExecutiveMapEdit(this.checked)">
            <span class="slider"></span>
          </label>
        </div>
      </div>
    `;

    // Bind global handler
    window._toggleExecutiveMapEdit = async (checked) => {
      const toggle = document.getElementById('toggle_executive_map_edit');
      if (toggle) toggle.disabled = true;
      
      try {
        const payload = {
          value: { enabled: checked },
          adminId: state.currentUser.id,
          adminName: state.currentUser.name
        };
        
        const res = await fetch('/api/settings/executive_map_edit', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        const result = await res.json();
        if (result.success) {
          showToast(`Executive map link editing ${checked ? 'enabled' : 'disabled'}`, 'success');
        } else {
          showToast('Failed to save setting', 'error');
          if (toggle) toggle.checked = !checked; // revert UI
        }
      } catch (err) {
        showToast('Network error', 'error');
        if (toggle) toggle.checked = !checked; // revert UI
      } finally {
        if (toggle) toggle.disabled = false;
      }
    };

  } catch (err) {
    console.error('Failed to load settings:', err);
    container.innerHTML = `<div style="color: #EF4444;"><i class="fas fa-exclamation-circle"></i> Failed to load settings. Please try again.</div>`;
  }
}
