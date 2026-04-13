/**
 * Authentication & Session Management
 */
import { state, setCurrentUser } from '../store/globalState';
import { showToast, escapeHtml } from '../utils/ui';

let sessionTimeout = null;
let lastActivityTime = Date.now();
const SESSION_DURATION = 30 * 60 * 1000;

export function initAuth() {
  const user = state.currentUser;
  
  if (!user || !user.role) {
    window.location.href = '/signin.html';
    return;
  }

  // Update Header
  const userChip = document.getElementById('userName');
  const roleChip = document.getElementById('userRole');
  const initialsChip = document.getElementById('userInitials');

  if (userChip) userChip.textContent = user.name;
  if (roleChip) roleChip.textContent = user.role.toUpperCase();
  if (initialsChip) initialsChip.textContent = user.name.charAt(0).toUpperCase();

  setupSessionManagement();
}

function setupSessionManagement() {
  const updateActivity = () => {
    lastActivityTime = Date.now();
  };

  ['click', 'keypress', 'touchstart'].forEach(type => {
    document.addEventListener(type, updateActivity, { passive: true });
  });

  checkSession();
}

function checkSession() {
  if (Date.now() - lastActivityTime >= SESSION_DURATION) {
    showToast('Session expired due to inactivity. Please login again.', 'error');
    setTimeout(() => logout(true), 2000);
  } else {
    clearTimeout(sessionTimeout);
    sessionTimeout = setTimeout(checkSession, 10000);
  }
}

export function logout(isAuto = false) {
  setCurrentUser(null);
  window.location.href = '/signin.html';
}
