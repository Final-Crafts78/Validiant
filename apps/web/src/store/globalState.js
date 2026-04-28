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
  savedEmployeeLocation: null,
  featureFlags: {},
  // Performance: cache timestamps to avoid redundant API calls
  _cacheTimes: {}
};

export const setState = (key, value) => {
  if (key in state) {
    state[key] = value;
    return true;
  }
  return false;
};

export const getCurrentUser = () => state.currentUser;
export const setCurrentUser = (user) => {
  state.currentUser = user;
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
};

/**
 * Performance: Fetch employees only if data is stale (older than maxAgeMs).
 * Eliminates up to 5 redundant /api/users calls per session.
 * @param {number} maxAgeMs - Max cache age in milliseconds (default: 60s)
 * @returns {Promise<Array>} - Employee list
 */
const EMPLOYEES_CACHE_KEY = 'allEmployees';
const DEFAULT_MAX_AGE = 60000; // 60 seconds

export async function fetchEmployeesIfStale(maxAgeMs = DEFAULT_MAX_AGE) {
  const lastFetch = state._cacheTimes[EMPLOYEES_CACHE_KEY] || 0;
  const now = Date.now();

  if (state.allEmployees.length > 0 && (now - lastFetch) < maxAgeMs) {
    return state.allEmployees;
  }

  try {
    const res = await fetch('/api/users');
    const employees = await res.json();
    state.allEmployees = employees;
    state._cacheTimes[EMPLOYEES_CACHE_KEY] = Date.now();
    return employees;
  } catch (err) {
    console.error('Failed to fetch employees:', err);
    return state.allEmployees; // Return stale data on error
  }
}

