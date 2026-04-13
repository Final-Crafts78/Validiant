const authService = require("../services/auth.service");
const logger = require("../utils/logger");

/**
 * Authentication Controller
 */
class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const userAgent = req.headers['user-agent'] || 'Unknown Device';
      
      const user = await authService.login(email, password, userAgent);
      logger.info(`Successful login for user: ${email}`, { userAgent });
      res.json({ success: true, user });
    } catch (err) {
      logger.error('Login failure', err, { email: req.body.email });
      res.status(401).json({ success: false, message: err.message });
    }
  }

  async resetPassword(req, res) {
    try {
      const { id } = req.params;
      const { adminId, adminName, newPassword } = req.body;
      const tempPassword = await authService.resetPassword(id, newPassword, adminId, adminName);
      logger.info(`Password reset successfully for user ID: ${id}`, { adminId });
      res.json({ success: true, tempPassword });
    } catch (err) {
      logger.error('Password reset failure', err, { userId: req.params.id });
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new AuthController();
