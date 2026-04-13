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
import { showUnassignedTasks, loadUnassignedTasks, quickAssignTask } from './features/admin/unassignedTasks';
import { showAllTasks, loadAllTasks, resetAllTaskFilters, prevTaskPage, nextTaskPage } from './features/admin/allTasks';
import { showEmployees, showAddEmployee, deleteEmployee } from './features/admin/employees';
import { showAnalyticsDashboard } from './features/admin/analytics';
import { showTaskHistory, loadHistoryTasks } from './features/employee/taskHistory';
import { initMenu } from './core/menu';
import { cleanupCurrentView } from './utils/ui';

// New Phase 9 Modules:
import { 
  openTaskDetailsModal, openStatusUpdateModal, confirmStatusUpdate, 
  openReassignModal, confirmReassign, openUnassignModal, confirmUnassign, deleteTask, exportTasks 
} from './features/admin/adminActions';
import { 
  toggleSelectAll, handleSingleSelection, bulkAssignTasks, 
  confirmBulkAssign, bulkDeleteTasks 
} from './features/admin/bulkOperations';
import { showBulkUpload, processSmartText, submitFinalBulkUpload } from './features/admin/bulkUpload';
import { showEditMapModal, saveEditedMapUrl } from './features/admin/mapModals';
import { showActivityLog } from './features/admin/activityLog';
import { sortByNearest, sortByPincode } from './features/employee/sorting';
import { showEditEmployeeModal, openResetPasswordModal, confirmResetPassword } from './features/admin/employees';

/**
 * 1. INITIALIZATION
 */
function init() {
  console.log('🚀 Validiant Enterprise Bootloader Starting...');
  
  // Security Check & Auth Boot
  initAuth();
  
  // Initialize Menu
  initMenu();

  // Restore sidebar state from localStorage
  const sidebar = document.getElementById('sidebar');
  if (sidebar && localStorage.getItem('sidebarCollapsed') === 'true') {
    sidebar.classList.add('collapsed');
  }

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
        toggleSidebar();
        break;

      // VIEWS
      case 'view:adminAssign':
        cleanupCurrentView();
        showAssignTask();
        break;
      case 'view:employeeToday':
        cleanupCurrentView();
        showTodayTasks();
        break;
      case 'view:mapRouting':
        cleanupCurrentView();
        showMapRouting(state.allEmployeeTasks, openTaskPanel);
        break;
      case 'view:adminPool':
        cleanupCurrentView();
        showUnassignedTasks();
        break;
      case 'view:adminAllTasks':
        cleanupCurrentView();
        showAllTasks();
        break;
      case 'view:adminEmployees':
        cleanupCurrentView();
        showEmployees();
        break;
      case 'view:analytics':
        cleanupCurrentView();
        showAnalyticsDashboard();
        break;
      case 'view:kyc':
        cleanupCurrentView();
        showToast('Digital KYC is handled via internal script', 'info');
        if (typeof window.showKYCDashboard === 'function') window.showKYCDashboard();
        break;
      case 'view:employeeHistory':
        cleanupCurrentView();
        showTaskHistory();
        break;
      case 'view:activityLog':
        cleanupCurrentView();
        showActivityLog();
        break;

      // ADMIN ACTIONS
      // ADMIN ACTIONS
      case 'admin:showBulkUpload':
        showBulkUpload();
        break;
      case 'admin:processSmartText':
        processSmartText();
        break;
      case 'admin:submitFinalBulk':
        submitFinalBulkUpload();
        break;
      case 'admin:searchUnassigned':
        loadUnassignedTasks();
        break;
      case 'admin:quickAssign':
        if (id) quickAssignTask(id);
        break;
      case 'admin:loadAllTasks':
        loadAllTasks();
        break;
      case 'admin:resetTaskFilters':
        resetAllTaskFilters();
        break;
      case 'admin:prevPage':
        prevTaskPage();
        break;
      case 'admin:nextPage':
        nextTaskPage();
        break;
      case 'admin:showAddEmployee':
        showAddEmployee();
        break;
      case 'admin:deleteEmployee':
        if (id && target.getAttribute('data-name')) {
          deleteEmployee(id, target.getAttribute('data-name'));
        }
        break;
      case 'admin:editEmployee':
        if(id) showEditEmployeeModal(id);
        break;
      case 'admin:openResetPassword':
        if(id) openResetPasswordModal(id, target.getAttribute('data-email'));
        break;
      case 'admin:confirmResetPassword':
        if(id) confirmResetPassword(id);
        break;
      case 'admin:exportTasks':
        exportTasks();
        break;

      // ADMIN TASK ACTIONS (Single)
      case 'admin:openTaskDetails':
        if(id) openTaskDetailsModal(id);
        break;
      case 'admin:openStatusUpdate':
        if(id) openStatusUpdateModal(id, status || '');
        break;
      case 'admin:confirmStatusUpdate':
        if(id) confirmStatusUpdate(id);
        break;
      case 'admin:openReassign':
        if(id) openReassignModal(id);
        break;
      case 'admin:confirmReassign':
        if(id) confirmReassign(id);
        break;
      case 'admin:openUnassign':
        if(id) openUnassignModal(id);
        break;
      case 'admin:confirmUnassign':
        if(id) confirmUnassign(id);
        break;
      case 'admin:deleteTask':
        if(id) deleteTask(id);
        break;
      case 'admin:editMapUrl':
        if(id) showEditMapModal(id);
        break;
      case 'admin:saveMapUrl':
        if(id) saveEditedMapUrl(id);
        break;

      // ADMIN BULK OPERATIONS
      case 'admin:bulkAssignTasks':
        bulkAssignTasks();
        break;
      case 'admin:confirmBulkAssign':
        confirmBulkAssign();
        break;
      case 'admin:bulkDeleteTasks':
        bulkDeleteTasks();
        break;

      // EMPLOYEE ACTIONS
      case 'employee:refreshTasks':
        loadTodayTasks();
        break;
      case 'employee:loadHistory':
        loadHistoryTasks();
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
        sortByNearest(e);
        break;
      case 'sorting:pincode':
        sortByPincode();
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

/**
 * 3. SIDEBAR TOGGLE (Mobile + Desktop)
 */
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    sidebar.classList.toggle('open');

    let overlay = document.querySelector('.sidebar-overlay');
    if (sidebar.classList.contains('open')) {
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.onclick = () => toggleSidebar();
        document.body.appendChild(overlay);
      }
    } else {
      if (overlay) overlay.remove();
    }
  } else {
    sidebar.classList.toggle('collapsed');
  }

  const isCollapsed = sidebar.classList.contains('collapsed');
  localStorage.setItem('sidebarCollapsed', isCollapsed);
}

// Start the engine
document.addEventListener('DOMContentLoaded', init);
