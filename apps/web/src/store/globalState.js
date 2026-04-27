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
  featureFlags: {}
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
