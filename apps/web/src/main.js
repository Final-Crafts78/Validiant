/**
 * Validiant Corporate Frontend - Modular Entrypoint
 */
import { state, setCurrentUser } from './store/globalState';
import { initAuth, logout } from './core/auth';
import { showToast, showLoading } from './utils/ui';
import { showAssignTask } from './features/admin/dashboard';
import { showTodayTasks, loadTodayTasks } from './features/employee/taskBoard';
import { showMapRouting } from './features/routing/googleMapsEngine';
import { openTaskPanel, updateTaskStatus } from './features/employee/taskPanel';
import { showUnassignedTasks, loadUnassignedTasks, quickAssignTask } from './features/admin/unassignedTasks';
import { showAllTasks, loadAllTasks, resetAllTaskFilters, prevTaskPage, nextTaskPage } from './features/admin/allTasks';
import { showEmployees, showAddEmployee, deleteEmployee } from './features/admin/employees';
import { showAnalyticsDashboard } from './features/admin/analytics';
import { showTaskHistory, loadHistoryTasks } from './features/employee/taskHistory';
import { initMenu, setActiveMenuItem } from './core/menu';
import { cleanupCurrentView } from './utils/ui';

// New Phase 9 Modules:
import { 
  openTaskDetailsModal, openStatusUpdateModal, confirmStatusUpdate, 
  openReassignModal, confirmReassign, openUnassignModal, confirmUnassign, deleteTask, exportTasks,
  openEditNoteModal, confirmEditNote
} from './features/admin/adminActions';
import { 
  toggleSelectAll, handleSingleSelection, bulkAssignTasks, 
  confirmBulkAssign, bulkCompleteTasks, confirmBulkComplete, bulkDeleteTasks 
} from './features/admin/bulkOperations';
import { showBulkUpload, processSmartText, submitFinalBulkUpload, handleBulkDuplicateChoice, downloadBulkUploadTemplate } from './features/admin/bulkUpload';
import { showEditMapModal, saveEditedMapUrl } from './features/admin/mapModals';
import { showActivityLog } from './features/admin/activityLog';
import { sortByNearest, sortByPincode } from './features/employee/sorting';
import { showEditEmployeeModal, openResetPasswordModal, confirmResetPassword } from './features/admin/employees';
import { 
  showKYCDashboard, openKYCModal, loadKYCRequests, 
  viewKYCReport, copyKYCLink 
} from './features/admin/kycService';
import { startLocationReporting, stopLocationReporting } from './core/locationReporter';
import { showExecutiveTracker, cleanupTracker, updateTrackerData } from './features/admin/executiveTracker';
import { showAdminSettings } from './features/admin/adminSettings';

/**
 * SESSION MANAGEMENT (30 Minutes Inactivity Timeout)
 */
let lastActivityTime = Date.now();
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

function checkSession() {
  if (Date.now() - lastActivityTime >= SESSION_DURATION) {
    showToast('Session expired due to inactivity. Please login again.', 'error');
    setTimeout(() => logout(), 2000);
  }
}

/**
 * Centralized cleanup for all view transitions.
 * Kills any active map, tracker map, and temp DOM elements.
 */
async function fullCleanup() {
  await cleanupCurrentView();
  cleanupTracker();
}
async function init() {
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

  // Initial View based on role and saved preference
  const lastView = localStorage.getItem('lastView');
  const role = state.currentUser.role;
  
  if (lastView && lastView.startsWith('view:')) {
    console.log(`🧭 Restoring last view: ${lastView}`);
    // Simulate a click on the menu item to trigger the view logic
    const mockTarget = document.createElement('div');
    mockTarget.setAttribute('data-action', lastView);
    
    // We need to handle the initial view load logic which is normally in setupEventDelegation
    // But since the delegator is attached to document, we can just trigger a manual load
    await triggerInitialView(lastView, role);
  } else {
    // Default Fallback
    if (role === 'admin') {
      await showAssignTask();
      setActiveMenuItem('view:adminAssign');
    } else {
      showTodayTasks();
      setActiveMenuItem('view:employeeToday');
    }
  }

  // Start background location reporting for executives regardless of view (if they are employees)
  if (role === 'employee') {
    startLocationReporting(state.currentUser.id);
  }

  // Bind Global Event Delegation
  setupEventDelegation();

  // 🚀 Hide initial loader (Step 1 Optimization)
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.classList.add('fade-out');
    setTimeout(() => loader.remove(), 500);
  }

  // Start Session Monitor
  setInterval(checkSession, 30000); // Check every 30 seconds
}

/**
 * 2. ENTERPRISE EVENT DELEGATION
 * Standard: No more onclick="" in HTML. 
 * We catch everything via data-action attributes.
 */
function setupEventDelegation() {
  document.addEventListener('click', async (e) => {
    lastActivityTime = Date.now(); // Track activity
    const target = e.target.closest('[data-action]');
    if (!target) return;

    // Prevent default to stop form submissions or link navigation
    e.preventDefault();

    const action = target.getAttribute('data-action');
    const id = target.getAttribute('data-id');
    const status = target.getAttribute('data-status');

    console.log(`[DEBUG] 🖱️ Action: ${action} | ID: ${id} | Status: ${status}`);

    try {
      // Automatic Menu Highlighting for View Transitions
      if (action.startsWith('view:')) {
        setActiveMenuItem(action);
        localStorage.setItem('lastView', action);
      }

      // Only prevent default for buttons/links that are part of our action system
      // and NOT checkbox inputs which need default behavior
      if (target.tagName !== 'INPUT') {
        e.preventDefault();
      }

      // ROUTING / NAVIGATION
      switch (action) {
        // AUTH
        case 'auth:logout':
          stopLocationReporting();
          logout();
          break;

        // TOP NAV / SIDEBAR
        case 'nav:toggleSidebar':
          toggleSidebar();
          break;

        // VIEWS
        case 'view:adminAssign':
          await fullCleanup();
          showAssignTask();
          break;
        case 'view:employeeToday':
          await fullCleanup();
          showTodayTasks();
          window._currentRefreshHandler = () => {
            if (state.currentUser.role === 'employee') loadTodayTasks();
          };
          break;
        case 'view:mapRouting':
          await fullCleanup();
          if (state.allEmployeeTasks.length === 0) {
            await loadTodayTasks();
          }
          showMapRouting(state.allEmployeeTasks, openTaskPanel);
          window._currentRefreshHandler = async () => {
            await loadTodayTasks();
            showMapRouting(state.allEmployeeTasks, openTaskPanel);
          };
          break;
        case 'view:adminPool':
          await fullCleanup();
          showUnassignedTasks();
          break;
        case 'view:adminAllTasks':
          await fullCleanup();
          showAllTasks();
          break;
        case 'view:adminEmployees':
          await fullCleanup();
          showEmployees();
          break;
        case 'view:analytics':
          await fullCleanup();
          showAnalyticsDashboard();
          break;
        case 'view:kyc':
          await fullCleanup();
          showKYCDashboard();
          break;
        case 'view:employeeHistory':
          await fullCleanup();
          showTaskHistory();
          break;
        case 'view:activityLog':
          await fullCleanup();
          showActivityLog();
          break;
        
        case 'view:trackExecutives':
          await fullCleanup();
          showExecutiveTracker();
          break;
        case 'view:adminSettings':
          await fullCleanup();
          showAdminSettings();
          break;

        case 'tracker:refresh':
          updateTrackerData();
          break;

        // ADMIN ACTIONS
        case 'admin:downloadTemplate':
          downloadBulkUploadTemplate();
          break;
        case 'admin:bulkDuplicateChoice': {
          const choice = target.getAttribute('data-choice');
          if (choice) handleBulkDuplicateChoice(choice);
          break;
        }
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
          if(id) await openTaskDetailsModal(id);
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
        case 'admin:openEditNote':
          if(id) openEditNoteModal(id);
          break;
        case 'admin:confirmEditNote':
          if(id) confirmEditNote(id);
          break;

        // ADMIN BULK OPERATIONS
        case 'admin:bulkAssignTasks':
          bulkAssignTasks();
          break;
        case 'admin:confirmBulkAssign':
          confirmBulkAssign();
          break;
        case 'admin:bulkCompleteTasks':
          bulkCompleteTasks();
          break;
        case 'admin:confirmBulkComplete':
          confirmBulkComplete();
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
        case 'routing:custom':
          {
            const { calculateGreedyRoute } = await import('./features/employee/sorting');
            calculateGreedyRoute(e);
          }
          break;
        
        // KYC ACTIONS
        case 'kyc:openModal':
          openKYCModal();
          break;
        case 'kyc:refresh':
          loadKYCRequests();
          break;
        case 'kyc:viewReport':
          if(id) viewKYCReport(id);
          break;
        case 'kyc:copyLink': {
          const link = target.getAttribute('data-link');
          if(link) copyKYCLink(link);
          break;
        }
        
        case 'routing:refresh':
          // fulfill user request: Refresh Map now also triggers Sort by Nearest for optimized route
          sortByNearest(e);
          break;

        default:
          console.warn(`⚠️ Unhandled action: ${action}`);
      }
    } catch (error) {
      console.error(`[DEBUG] ❌ Global Controller Error [${action}]:`, error);
      showToast('A premium UX error occurred. Please refresh.', 'error');
    }
  }, true); // Use capture phase to catch events earlier
}

// Global Refresh Handler for Status Updates (default — views override as needed)
window._currentRefreshHandler = () => {
    if (state.currentUser.role === 'employee') loadTodayTasks();
    else if (state.currentUser.role === 'admin') loadAllTasks();
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

/**
 * Helper to trigger view logic without a click event
 */
async function triggerInitialView(action, role) {
  setActiveMenuItem(action);
  await fullCleanup();
  
  switch (action) {
    case 'view:adminAssign':
      if (role === 'admin') await showAssignTask();
      break;
    case 'view:employeeToday':
      showTodayTasks();
      window._currentRefreshHandler = () => {
        if (state.currentUser.role === 'employee') loadTodayTasks();
      };
      break;
    case 'view:mapRouting':
      if (state.allEmployeeTasks.length === 0) {
        await loadTodayTasks();
      }
      showMapRouting(state.allEmployeeTasks, openTaskPanel);
      window._currentRefreshHandler = async () => {
        await loadTodayTasks();
        showMapRouting(state.allEmployeeTasks, openTaskPanel);
      };
      break;
    case 'view:adminPool':
      if (role === 'admin') showUnassignedTasks();
      break;
    case 'view:adminAllTasks':
      if (role === 'admin') showAllTasks();
      break;
    case 'view:adminEmployees':
      if (role === 'admin') showEmployees();
      break;
    case 'view:analytics':
      if (role === 'admin') showAnalyticsDashboard();
      break;
    case 'view:trackExecutives':
      if (role === 'admin') showExecutiveTracker();
      break;
    case 'view:adminSettings':
      if (role === 'admin') showAdminSettings();
      break;
    case 'view:kyc':
      if (role === 'admin') showKYCDashboard();
      break;
    case 'view:employeeHistory':
      showTaskHistory();
      break;
    case 'view:activityLog':
      if (role === 'admin') showActivityLog();
      break;
    default:
      // Fallback
      if (role === 'admin') showAssignTask();
      else showTodayTasks();
  }
}

// Start the engine
document.addEventListener('DOMContentLoaded', init);
