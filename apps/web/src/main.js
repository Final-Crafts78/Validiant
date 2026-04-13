/**
 * Validiant Corporate Frontend - Modular Entrypoint
 */
import { state, setCurrentUser } from './store/globalState';
import { initAuth, logout } from './core/auth';
import { showToast, showLoading, initMagneticButtons } from './utils/ui';
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
  openReassignModal, confirmReassign, openUnassignModal, confirmUnassign, deleteTask, exportTasks,
  openEditNoteModal, confirmEditNote
} from './features/admin/adminActions';
import { 
  toggleSelectAll, handleSingleSelection, bulkAssignTasks, 
  confirmBulkAssign, bulkDeleteTasks 
} from './features/admin/bulkOperations';
import { showBulkUpload, processSmartText, submitFinalBulkUpload, handleBulkDuplicateChoice } from './features/admin/bulkUpload';
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
 * Adds a smooth fade-out before wiping the DOM.
 */
async function fullCleanup() {
  const container = document.getElementById('mainContainer');
  if (container) {
    container.style.opacity = '0';
    container.style.transition = 'opacity 0.2s ease-out';
    // Wait for fade-out to complete
    await new Promise(r => setTimeout(r, 200));
  }
  
  await cleanupCurrentView();
  cleanupTracker();
  
  if (container) {
    container.style.opacity = '1'; // Reset for next view
  }
}
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
    // Start background location reporting for executives
    startLocationReporting(state.currentUser.id);
  }

  // Bind Global Event Delegation
  setupEventDelegation();

  // Start Session Monitor
  setInterval(checkSession, 30000); // Check every 30 seconds

  // 💎 Premium: Initialize magnetic micro-interactions
  initMagneticButtons();
}

/**
 * 2. ENTERPRISE EVENT DELEGATION (ROUTER)
 * Registry of handlers for data-action attributes.
 */
const actionHandlers = {
  // AUTH
  'auth:logout': () => {
    stopLocationReporting();
    logout();
  },

  // NAVIGATION & VIEWS
  'nav:toggleSidebar': () => toggleSidebar(),
  
  // View Transitions Helper - Butter Smooth Navigation
  'view:transition': async (callback) => {
    if (!document.startViewTransition) {
      await fullCleanup();
      callback();
      return;
    }

    document.startViewTransition(async () => {
      await cleanupCurrentView();
      cleanupTracker();
      callback();
    });
  },

  // ADMIN VIEWS
  'view:adminAssign': async (e) => actionHandlers['view:transition'](showAssignTask),
  'view:adminPool': async (e) => actionHandlers['view:transition'](showUnassignedTasks),
  'view:adminAllTasks': async (e) => actionHandlers['view:transition'](showAllTasks),
  'view:adminEmployees': async (e) => actionHandlers['view:transition'](showEmployees),
  'view:analytics': async (e) => actionHandlers['view:transition'](showAnalyticsDashboard),
  'view:kyc': async (e) => actionHandlers['view:transition'](showKYCDashboard),
  'view:activityLog': async (e) => actionHandlers['view:transition'](showActivityLog),
  'view:trackExecutives': async (e) => actionHandlers['view:transition'](showExecutiveTracker),

  // EMPLOYEE VIEWS
  'view:employeeToday': async (e) => actionHandlers['view:transition'](showTodayTasks),
  'view:mapRouting': async (e) => {
    await fullCleanup();
    showMapRouting(state.allEmployeeTasks, openTaskPanel);
  },
  'view:employeeHistory': async (e) => actionHandlers['view:transition'](showTaskHistory),

  // ADMIN ACTIONS
  'admin:bulkDuplicateChoice': (e, target) => {
    const choice = target.getAttribute('data-choice');
    if (choice) handleBulkDuplicateChoice(choice);
  },
  'admin:showBulkUpload': () => showBulkUpload(),
  'admin:processSmartText': () => processSmartText(),
  'admin:submitFinalBulk': () => submitFinalBulkUpload(),
  'admin:searchUnassigned': () => loadUnassignedTasks(),
  'admin:quickAssign': (e, target) => {
    const id = target.getAttribute('data-id');
    if (id) quickAssignTask(id);
  },
  'admin:loadAllTasks': () => loadAllTasks(),
  'admin:resetTaskFilters': () => resetAllTaskFilters(),
  'admin:prevPage': () => prevTaskPage(),
  'admin:nextPage': () => nextTaskPage(),
  'admin:showAddEmployee': () => showAddEmployee(),
  'admin:deleteEmployee': (e, target) => {
    const id = target.getAttribute('data-id');
    const name = target.getAttribute('data-name');
    if (id && name) deleteEmployee(id, name);
  },
  'admin:editEmployee': (e, target) => {
    const id = target.getAttribute('data-id');
    if (id) showEditEmployeeModal(id);
  },
  'admin:openResetPassword': (e, target) => {
    const id = target.getAttribute('data-id');
    const email = target.getAttribute('data-email');
    if (id) openResetPasswordModal(id, email);
  },
  'admin:confirmResetPassword': (e, target) => {
    const id = target.getAttribute('data-id');
    if (id) confirmResetPassword(id);
  },
  'admin:exportTasks': () => exportTasks(),
  'admin:viewEmployeeTasks': async (e, target) => {
    const id = target.getAttribute('data-id');
    if (id) {
      await fullCleanup();
      showAllTasks();
      setTimeout(() => {
        const filterSelect = document.getElementById('allTasksEmployeeFilter');
        if (filterSelect) {
          filterSelect.value = id;
          loadAllTasks();
        }
      }, 50);
    }
  },

  // TASK MODALS (Single)
  'admin:openTaskDetails': (e, target) => {
    const id = target.getAttribute('data-id');
    if (id) openTaskDetailsModal(id);
  },
  'admin:openStatusUpdate': (e, target) => {
    const id = target.getAttribute('data-id');
    const status = target.getAttribute('data-status');
    if (id) openStatusUpdateModal(id, status || '');
  },
  'admin:confirmStatusUpdate': (e, target) => {
    const id = target.getAttribute('data-id');
    if (id) confirmStatusUpdate(id);
  },
  'admin:openReassign': (e, target) => {
    const id = target.getAttribute('data-id');
    if (id) openReassignModal(id);
  },
  'admin:confirmReassign': (e, target) => {
    const id = target.getAttribute('data-id');
    if (id) confirmReassign(id);
  },
  'admin:openUnassign': (e, target) => {
    const id = target.getAttribute('data-id');
    if (id) openUnassignModal(id);
  },
  'admin:confirmUnassign': (e, target) => {
    const id = target.getAttribute('data-id');
    if (id) confirmUnassign(id);
  },
  'admin:deleteTask': (e, target) => {
    const id = target.getAttribute('data-id');
    if (id) deleteTask(id);
  },
  'admin:editMapUrl': (e, target) => {
    const id = target.getAttribute('data-id');
    if (id) showEditMapModal(id);
  },
  'admin:saveMapUrl': (e, target) => {
    const id = target.getAttribute('data-id');
    if (id) saveEditedMapUrl(id);
  },
  'admin:openEditNote': (e, target) => {
    const id = target.getAttribute('data-id');
    if (id) openEditNoteModal(id);
  },
  'admin:confirmEditNote': (e, target) => {
    const id = target.getAttribute('data-id');
    if (id) confirmEditNote(id);
  },

  // BULK OPS
  'admin:bulkAssignTasks': () => bulkAssignTasks(),
  'admin:confirmBulkAssign': () => confirmBulkAssign(),
  'admin:bulkDeleteTasks': () => bulkDeleteTasks(),

  // EMPLOYEE ACTIONS
  'employee:refreshTasks': () => loadTodayTasks(),
  'employee:loadHistory': () => loadHistoryTasks(),
  'task:openPanel': (e, target) => {
    const id = target.getAttribute('data-id');
    if (id) openTaskPanel(id);
  },
  'task:updateStatus': (e, target) => {
    const id = target.getAttribute('data-id');
    const status = target.getAttribute('data-status');
    if (id && status) updateTaskStatus(id, status);
  },

  // UTILS & SORTING
  'sorting:nearest': (e) => sortByNearest(e),
  'sorting:pincode': () => sortByPincode(),
  'tracker:refresh': () => updateTrackerData(),
  'routing:refresh': (e) => sortByNearest(e),

  // KYC
  'kyc:openModal': () => openKYCModal(),
  'kyc:refresh': () => loadKYCRequests(),
  'kyc:viewReport': (e, target) => {
    const id = target.getAttribute('data-id');
    if (id) viewKYCReport(id);
  },
  'kyc:copyLink': (e, target) => {
    const link = target.getAttribute('data-link');
    if (link) copyKYCLink(link);
  }
};

function setupEventDelegation() {
  document.addEventListener('click', async (e) => {
    lastActivityTime = Date.now();
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.getAttribute('data-action');
    if (actionHandlers[action]) {
      console.log(`🚀 [ROUTER] Routing Action: ${action}`);
      try {
        await actionHandlers[action](e, target);
      } catch (err) {
        console.error(`❌ [ROUTER] Action ${action} failed:`, err);
        showToast('A premium action failed. Please refresh.', 'error');
      }
    } else {
      console.warn(`⚠️ [ROUTER] Unhandled action: ${action}`);
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
