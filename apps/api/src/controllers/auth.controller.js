const authService = require("../services/auth.service");

/**
 * Authentication Controller
 */
class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const userAgent = req.headers['user-agent'] || 'Unknown Device';
      
      const user = await authService.login(email, password, userAgent);
      res.json({ success: true, user });
    } catch (err) {
      console.error('Login Error:', err.message);
      res.status(401).json({ success: false, message: err.message });
    }
  }

  async resetPassword(req, res) {
    try {
      const { id } = req.params;
      const { adminId, adminName, newPassword } = req.body;
      const tempPassword = await authService.resetPassword(id, newPassword, adminId, adminName);
      res.json({ success: true, tempPassword });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new AuthController();
