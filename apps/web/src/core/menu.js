/**
 * Sidebar Menu Generator
 */
import { state } from '../store/globalState';

export function initMenu() {
  const menu = document.getElementById('sidebarMenu');
  if (!menu) return;

  menu.innerHTML = '';
  
  const config = state.currentUser.role === 'admin' ? [
    { icon: 'fa-plus-circle', text: 'Assign Task', action: 'view:adminAssign' },
    { icon: 'fa-inbox', text: 'Unassigned Pool', action: 'view:adminPool' },
    { icon: 'fa-list', text: 'All Tasks', action: 'view:adminAllTasks' },
    { icon: 'fa-users', text: 'Employees', action: 'view:adminEmployees' },
    { icon: 'fa-history', text: 'Activity Log', action: 'view:activityLog' },
    { icon: 'fa-chart-pie', text: 'Analytics', action: 'view:analytics' },
    { icon: 'fa-upload', text: 'Bulk Upload', action: 'admin:showBulkUpload' },
    { icon: 'fa-download', text: 'Export CSV', action: 'admin:exportTasks' },
    { icon: 'fa-fingerprint', text: 'Digital KYC', action: 'view:kyc' },
    { icon: 'fa-sign-out-alt', text: 'Logout', action: 'auth:logout', style: 'margin-top: auto; color: #ef4444;' }
  ] : [
    { icon: 'fa-tasks', text: "Today's Tasks", action: 'view:employeeToday' },
    { icon: 'fa-map-marked-alt', text: 'Map Routing', action: 'view:mapRouting' },
    { icon: 'fa-history', text: 'Task History', action: 'view:employeeHistory' },
    { icon: 'fa-sign-out-alt', text: 'Logout', action: 'auth:logout', style: 'margin-top: auto; color: #ef4444;' }
  ];

  config.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'menu-item';
    btn.setAttribute('data-action', item.action);
    if (item.style) btn.setAttribute('style', item.style);
    btn.innerHTML = `<i class="fas ${item.icon}"></i> <span>${item.text}</span>`;
    menu.appendChild(btn);
  });
}
