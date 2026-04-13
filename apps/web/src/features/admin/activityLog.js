/**
 * Admin: Activity Log Feature
 */
import { escapeHtml } from '../../utils/ui';

export async function showActivityLog() {
  const container = document.getElementById('mainContainer');
  if (!container) return;

  container.innerHTML = `
    <h2><i class="fas fa-list-alt"></i> System Activity Log</h2>
    <div id="activityLogContent">
      <div class="loading-spinner show"><i class="fas fa-spinner fa-spin"></i> Loading logs...</div>
    </div>
  `;

  try {
    const response = await fetch('/api/activity-log');
    
    // Fallback if backend route isn't implemented
    if (!response.ok) {
        document.getElementById('activityLogContent').innerHTML = `
          <div class="empty-state">
            <h3 style="color:#94a3b8;"><i class="fas fa-exclamation-triangle"></i> Backend route pending</h3>
            <p>The /api/activity-log endpoint responds with 404.</p>
          </div>
        `;
        return;
    }
    
    const logs = await response.json();

    if (!logs || logs.length === 0) {
      document.getElementById('activityLogContent').innerHTML = `
        <div class="empty-state">
          <i class="fas fa-history" style="font-size: 3rem; color: #6B7280; margin-bottom: 15px;"></i>
          <h3 style="color: #9CA3AF;">No Activity Yet</h3>
        </div>
      `;
      return;
    }

    let html = `
      <div class="table-wrapper" style="overflow-x:auto;">
        <table class="data-table" style="width:100%; border-collapse:collapse; text-align:left;">
          <thead style="border-bottom:1px solid #334155;">
            <tr>
              <th style="padding:10px;">Time</th>
              <th style="padding:10px;">User</th>
              <th style="padding:10px;">Action</th>
              <th style="padding:10px;">Target Details</th>
            </tr>
          </thead>
          <tbody>
    `;

    logs.forEach(log => {
      const d = new Date(log.created_at || log.timestamp);
      html += `
        <tr style="border-bottom:1px solid #334155;">
          <td style="padding:12px 10px; color:#94a3b8; font-size:12px;">${d.toLocaleString()}</td>
          <td style="padding:12px 10px; font-weight:500;">${escapeHtml(log.user_name || log.userName || 'System')}</td>
          <td style="padding:12px 10px;">
            <span style="background:rgba(99,102,241,0.1); padding:3px 8px; border-radius:12px; font-size:12px; color:#a5b4fc;">
              ${escapeHtml(log.action)}
            </span>
          </td>
          <td style="padding:12px 10px; font-size:13px; color:#d1d5db;">${escapeHtml(log.details || 'N/A')}</td>
        </tr>
      `;
    });

    html += '</tbody></table></div>';
    document.getElementById('activityLogContent').innerHTML = html;
  } catch (err) {
    document.getElementById('activityLogContent').innerHTML = `
      <div class="empty-state">
        <h3 style="color:#ef4444;">Failed to load logs</h3>
      </div>
    `;
  }
}
