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
      const [{ count: totalTasks }, { count: assignedTasks }, { count: combinedCompleted }, { count: activeEmployees }, { count: admins }] = await Promise.all([
        supabase.from("tasks").select("*", { count: "exact", head: true }),
        supabase.from("tasks").select("*", { count: "exact", head: true }).neq("status", "Unassigned"),
        supabase.from("tasks").select("*", { count: "exact", head: true }).in("status", ["Completed", "Verified"]),
        supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "employee").eq("is_active", true),
        supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "admin")
      ]);

      res.json({
        totalTasks: totalTasks || 0,
        assignedTasks: assignedTasks || 0,
        completedTasks: combinedCompleted || 0,
        verifiedTasks: 0, // Set to 0 as it's now bundled into completed
        activeEmployees: activeEmployees || 0,
        admins: admins || 0
      });
    } catch (err) {
      console.error('Analytics Error:', err);
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
   * Export Tasks to CSV
   */
  async exportTasks(req, res) {
    try {
      const { status, employeeId } = req.query;
      let query = supabase.from("tasks").select("*, employees:users!tasks_assigned_to_fkey(name)");
      
      if (status && status !== 'all') query = query.eq('status', status);
      if (employeeId && employeeId !== 'all') query = query.eq('assigned_to', employeeId);
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Generate CSV
      const headers = ["Task ID", "Title", "Client", "Pincode", "Status", "Assigned To", "Assigned Date", "Created At"];
      const rows = data.map(t => [
        t.id,
        t.title,
        t.client_name || t.clientName || '',
        t.pincode,
        t.status,
        t.employees ? t.employees.name : 'Unassigned',
        t.assigned_date || '',
        t.created_at
      ]);
      
      const csvString = [headers, ...rows].map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(",")).join("\n");
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=validiant_export_${new Date().toISOString().split('T')[0]}.csv`);
      res.status(200).send(csvString);
    } catch (err) {
      console.error('Export Error:', err);
      res.status(500).send("Export failed");
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
