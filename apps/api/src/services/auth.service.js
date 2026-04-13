const bcrypt = require("bcryptjs");
const supabase = require("../config/supabase");
const { logActivity } = require("../utils/logger");

/**
 * Authentication and User management service
 */
class AuthService {
  /**
   * Authenticate a user
   */
  async login(email, password, userAgent) {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) throw new Error("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    await supabase
      .from("users")
      .update({ last_active: new Date() })
      .eq("id", user.id);

    const device = userAgent.includes('Mobile') ? 'Mobile App' : 'Web Browser';
    
    await logActivity(
      user.id,
      user.name,
      "LOGIN_SUCCESS",
      null,
      `Logged in via ${device}`
    );

    return {
      id: user.id,
      name: user.name,
      role: user.role,
      employeeId: user.employee_id
    };
  }

  /**
   * Reset a user's password
   */
  async resetPassword(userId, newPassword, adminId, adminName) {
    const tempPassword = newPassword || Math.random().toString(36).slice(-8).toUpperCase();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const { error } = await supabase
      .from("users")
      .update({ password: hashedPassword, updated_at: new Date() })
      .eq("id", userId);

    if (error) throw error;

    await logActivity(adminId, adminName, "PASSWORD_RESET", null, `Reset user ID ${userId}`);
    return tempPassword;
  }
}

module.exports = new AuthService();
