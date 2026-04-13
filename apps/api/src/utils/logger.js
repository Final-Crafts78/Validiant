const supabase = require('../config/supabase');

/**
 * Activity Logging Utility
 * @param {string} userId
 * @param {string} userName
 * @param {string} action
 * @param {string|number} taskId
 * @param {object|string} details
 */
async function logActivity(userId, userName, action, taskId, details) {
  try {
    if (!userId || !action) return;

    await supabase.from('activity_logs').insert([{
      user_id: userId,
      user_name: userName || 'System',
      action: action,
      task_id: taskId || null,
      details: typeof details === 'object' ? JSON.stringify(details) : details,
      created_at: new Date()
    }]);
  } catch (err) {
    console.error('Logging failed:', err.message);
  }
}

module.exports = { logActivity };
