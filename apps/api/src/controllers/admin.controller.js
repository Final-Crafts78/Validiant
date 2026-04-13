const supabase = require("../config/supabase");

/**
 * Admin and Analytics Controller
 */
class AdminController {
  /**
   * Fetch Dashboard Analytics
   */
  async getAnalytics(req, res) {
    try {
      const [{ count: totalTasks }, { count: assignedTasks }, { count: completedTasks }, { count: verifiedTasks }, { count: activeEmployees }, { count: admins }] = await Promise.all([
        supabase.from("tasks").select("*", { count: "exact", head: true }),
        supabase.from("tasks").select("*", { count: "exact", head: true }).neq("status", "Unassigned"),
        supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "Completed"),
        supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "Verified"),
        supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "employee").eq("is_active", true),
        supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "admin")
      ]);

      res.json({
        totalTasks: totalTasks || 0,
        assignedTasks: assignedTasks || 0,
        completedTasks: completedTasks || 0,
        verifiedTasks: verifiedTasks || 0,
        activeEmployees: activeEmployees || 0,
        admins: admins || 0
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  }

  /**
   * Fetch Activity Logs
   */
  async getActivityLogs(req, res) {
    try {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(500).json([]);
    }
  }

  /**
   * Health Check
   */
  health(req, res) {
    res.json({ status: "healthy", uptime: process.uptime() });
  }
}

module.exports = new AdminController();
