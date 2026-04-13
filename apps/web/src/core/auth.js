/**
 * Authentication & Session Management
 * Handles login state, redirection, and inactivity timeouts.
 */
import { state, setCurrentUser } from '../store/globalState';
import { showToast, escapeHtml } from '../utils/ui';

let sessionTimeout = null;
let lastActivityTime = Date.now();
const SESSION_DURATION = 30 * 60 * 1000; // 30 Minutes

/**
 * Initializes the authentication for the current page.
 * Redirects to sign-in if no active session is found.
 */
export function initAuth() {
  const user = state.currentUser;
  
  if (!user || !user.role) {
    window.location.href = '/signin.html';
    return;
  }

  // 💎 Premium UI Update: Map user data to header chips
  const userChip = document.getElementById('userName');
  const roleChip = document.getElementById('userRole');
  const initialsChip = document.getElementById('userInitials');

  if (userChip) userChip.textContent = user.name;
  if (roleChip) roleChip.textContent = user.role.toUpperCase();
  if (initialsChip) initialsChip.textContent = user.name.charAt(0).toUpperCase();

  setupSessionManagement();
}

/**
 * Sets up global event listeners to track user activity.
 */
function setupSessionManagement() {
  const updateActivity = () => {
    lastActivityTime = Date.now();
  };

  ['click', 'keypress', 'touchstart'].forEach(type => {
    document.addEventListener(type, updateActivity, { passive: true });
  });

  checkSession();
}

/**
 * Recursive session monitor that triggers logout after persistent inactivity.
 */
function checkSession() {
  const inactiveDuration = Date.now() - lastActivityTime;
  
  if (inactiveDuration >= SESSION_DURATION) {
    showToast('Session expired due to inactivity. Please login again.', 'error');
    setTimeout(() => logout(true), 2000);
  } else {
    clearTimeout(sessionTimeout);
    // 💎 Performance: Check specifically every 10s to reduce main thread overhead
    sessionTimeout = setTimeout(checkSession, 10000);
  }
}

/**
 * Logs the current user out and clears the session.
 * @param {boolean} [isAuto=false] - Whether the logout was triggered automatically.
 */
export function logout(isAuto = false) {
  setCurrentUser(null);
  window.location.href = '/signin.html';
}
