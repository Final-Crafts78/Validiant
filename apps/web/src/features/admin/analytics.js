/**
 * Admin: Analytics Dashboard Feature
 */
import { showToast } from '../../utils/ui';

export function showAnalyticsDashboard() {
  const content = document.getElementById('mainContainer');
  if (!content) return;

  content.innerHTML = `
    <h2><i class="fas fa-chart-pie"></i> Analytics Dashboard</h2>
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:15px; margin-bottom:30px;">
      <div class="panel" style="text-align:center; background:#1e293b; padding:20px; border-radius:12px; border:1px solid #334155;">
        <h3 id="statTotal" style="font-size:2rem; margin:0; color:#6366f1;">...</h3>
        <span style="color:#9ca3af; font-size:12px;">TOTAL TASKS</span>
      </div>
      <div class="panel" style="text-align:center; background:#1e293b; padding:20px; border-radius:12px; border:1px solid #334155;">
        <h3 id="statCompleted" style="font-size:2rem; margin:0; color:#10b981;">...</h3>
        <span style="color:#9ca3af; font-size:12px;">COMPLETED</span>
      </div>
      <div class="panel" style="text-align:center; background:#1e293b; padding:20px; border-radius:12px; border:1px solid #334155;">
        <h3 id="statPending" style="font-size:2rem; margin:0; color:#f59e0b;">...</h3>
        <span style="color:#9ca3af; font-size:12px;">PENDING</span>
      </div>
      <div class="panel" style="text-align:center; background:#1e293b; padding:20px; border-radius:12px; border:1px solid #334155;">
        <h3 id="statUnassigned" style="font-size:2rem; margin:0; color:#ef4444;">...</h3>
        <span style="color:#9ca3af; font-size:12px;">UNASSIGNED</span>
      </div>
    </div>
    
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:20px;">
      <div class="panel" style="background:#1e293b; padding:20px; border-radius:12px; border:1px solid #334155;">
        <h4 style="margin-top:0; color:#e5e7eb;">Task Distribution</h4>
        <div style="height:300px; display:flex; align-items:center; justify-content:center;">
          <canvas id="statusChart"></canvas>
        </div>
      </div>
      <div class="panel" style="background:#1e293b; padding:20px; border-radius:12px; border:1px solid #334155;">
        <h4 style="margin-top:0; color:#e5e7eb;">Employee Performance</h4>
        <div style="height:300px; display:flex; align-items:center; justify-content:center;">
          <canvas id="performanceChart"></canvas>
        </div>
      </div>
    </div>
  `;

  loadAnalyticsData();
}

async function loadAnalyticsData() {
  try {
    const res = await fetch('/api/analytics');
    
    // If the endpoint doesn't exist, we fallback gracefully
    if (!res.ok) {
        showToast('Analytics API not ready yet. Please implement backend.', 'warning');
        return;
    }
    
    const data = await res.json();
    
    document.getElementById('statTotal').innerText = data.totalTasks || 0;
    document.getElementById('statCompleted').innerText = data.completedTasks || 0;
    
    const pending = (data.assignedTasks || 0) - (data.completedTasks || 0);
    const unassigned = (data.totalTasks || 0) - (data.assignedTasks || 0);
    
    document.getElementById('statPending').innerText = pending > 0 ? pending : 0;
    document.getElementById('statUnassigned').innerText = unassigned > 0 ? unassigned : 0;

    // We assume Chart.js is loaded globally via index.html or dynamic import
    if (window.Chart) {
      new Chart(document.getElementById('statusChart'), {
        type: 'doughnut',
        data: {
          labels: ['Completed', 'Pending', 'Unassigned'],
          datasets: [{
            data: [
                data.completedTasks || 0, 
                pending > 0 ? pending : 0, 
                unassigned > 0 ? unassigned : 0
            ],
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
            borderWidth: 0
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });

      if (data.employeePerformance) {
        new Chart(document.getElementById('performanceChart'), {
          type: 'bar',
          data: {
            labels: data.employeePerformance.map(p => p.name),
            datasets: [{
              label: 'Completed Tasks',
              data: data.employeePerformance.map(p => p.completed),
              backgroundColor: '#6366f1'
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }
    }
  } catch (err) {
    console.error('Analytics load error', err);
    showToast('Failed to load analytics', 'error');
  }
}
