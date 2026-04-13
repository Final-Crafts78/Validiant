/**
 * Validiant Corporate Frontend - Modular Entrypoint
 */
import { state, setCurrentUser } from './store/globalState';
import { initAuth, logout } from './core/auth';
import { showToast, showLoading } from './utils/ui';
import { showAssignTask } from './features/admin/dashboard';
import { showTodayTasks, loadTodayTasks } from './features/employee/taskBoard';
import { showMapRouting } from './features/routing/leafletEngine';
import { openTaskPanel, updateTaskStatus } from './features/employee/taskPanel';
import { initMenu } from './core/menu';

/**
 * 1. INITIALIZATION
 */
function init() {
  console.log('🚀 Validiant Enterprise Bootloader Starting...');
  
  // Security Check & Auth Boot
  initAuth();
  
  // Initialize Menu
  initMenu();

  // Initial View based on role
  if (state.currentUser.role === 'admin') {
    showAssignTask();
  } else {
    showTodayTasks();
  }

  // Bind Global Event Delegation
  setupEventDelegation();
}

/**
 * 2. ENTERPRISE EVENT DELEGATION
 * Standard: No more onclick="" in HTML. 
 * We catch everything via data-action attributes.
 */
function setupEventDelegation() {
  document.addEventListener('click', async (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.getAttribute('data-action');
    const id = target.getAttribute('data-id');
    const status = target.getAttribute('data-status');

    console.log(`🖱️ Action Dispatched: ${action}`, { id, status });

    // ROUTING / NAVIGATION
    switch (action) {
      // AUTH
      case 'auth:logout':
        logout();
        break;

      // TOP NAV / SIDEBAR
      case 'nav:toggleSidebar':
        document.getElementById('sidebar')?.classList.toggle('collapsed');
        break;

      // VIEWS
      case 'view:adminAssign':
        showAssignTask();
        break;
      case 'view:employeeToday':
        showTodayTasks();
        break;
      case 'view:mapRouting':
        showMapRouting(state.allEmployeeTasks, openTaskPanel);
        break;
      case 'view:adminPool':
        showToast('Unassigned Pool loading...', 'info');
        break;
      case 'view:adminAllTasks':
        showToast('All Tasks list loading...', 'info');
        break;
      case 'view:adminEmployees':
        showToast('Employee Management loading...', 'info');
        break;
      case 'view:kyc':
        showToast('Digital KYC Dashboard loading...', 'info');
        break;

      // ADMIN ACTIONS
      case 'admin:showBulkUpload':
        showToast('Bulk upload module loading...', 'info');
        // showBulkUpload(); // To be implemented
        break;

      // EMPLOYEE ACTIONS
      case 'employee:refreshTasks':
        loadTodayTasks();
        break;

      // TASK ACTIONS
      case 'task:openPanel':
        if (id) openTaskPanel(id);
        break;
      case 'task:updateStatus':
        if (id && status) updateTaskStatus(id, status);
        break;

      // SORTING
      case 'sorting:nearest':
        showToast('Recalculating nearest route...', 'info');
        // sortByNearest() logic...
        break;
      
      case 'routing:refresh':
        showMapRouting(state.allEmployeeTasks, openTaskPanel);
        break;

      default:
        console.warn(`⚠️ Unhandled action: ${action}`);
    }
  });
}

// Global Refresh Handler for Status Updates
window._currentRefreshHandler = () => {
    if (state.currentUser.role === 'employee') loadTodayTasks();
};

// Start the engine
document.addEventListener('DOMContentLoaded', init);
