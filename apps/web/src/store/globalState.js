/**
 * Global State Management
 */

export const state = {
  allTasks: [],
  currentFilteredTasks: null,
  currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,
  sessionTimeout: null,
  allEmployeeTasks: [],
  allHistoryTasks: [],
  allAdminTasks: [],
  allUnassignedTasks: [],
  allEmployees: [],
  isNearestSortActive: false,
  savedEmployeeLocation: null
};

const listeners = new Set();

/**
 * Update state and notify all active listeners
 */
export const setState = (key, value) => {
  if (key in state) {
    state[key] = value;
    listeners.forEach(fn => fn(state, key));
    return true;
  }
  return false;
};

/**
 * Subscribe to state changes
 */
export const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const getCurrentUser = () => state.currentUser;
export const setCurrentUser = (user) => {
  state.currentUser = user;
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
  listeners.forEach(fn => fn(state, 'currentUser'));
};
