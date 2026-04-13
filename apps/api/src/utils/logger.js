/**
 * Validiant Premium Logging System
 * Handles both standard server logging and persistent activity logs (Supabase)
 */

const logger = {
  /**
   * Standard INFO Log
   */
  info: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] ${message}`, meta);
  },

  /**
   * Standard WARN Log
   */
  warn: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [WARN] ${message}`, meta);
  },

  /**
   * Standard ERROR Log
   */
  error: (message, error = null, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [ERROR] ${message}`, {
      message: error?.message,
      stack: error?.stack,
      ...meta
    });
  },

  /**
   * PERSISTENT Activity Log (Supabase)
   * Records user actions for audit trails
   */
  logActivity: async (userId, userName, action, taskId, details) => {
    // Lazy load supabase to avoid circular dependency
    const supabase = require('../config/supabase');
    try {
      if (!userId || !action) return;

      const logData = {
        user_id: userId,
        user_name: userName || 'System',
        action: action,
        task_id: taskId || null,
        details: typeof details === 'object' ? JSON.stringify(details) : details,
        created_at: new Date()
      };

      const { error } = await supabase.from('activity_logs').insert([logData]);
      
      if (error) {
        logger.error('Failed to persist activity log to Supabase', error, { logData });
      } else {
        logger.info(`Activity Log Persisted: ${action}`, { userId, taskId });
      }
    } catch (err) {
      logger.error('Critical failure in logActivity', err);
    }
  }
};

module.exports = logger;
