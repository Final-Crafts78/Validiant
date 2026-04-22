const bcrypt = require("bcryptjs");
const supabase = require("../config/supabase");
const { logActivity } = require("../utils/logger");

/**
 * User and Employee management service
 */
class UserService {
  /**
   * Fetch all employees
   */
  async getEmployees() {
    const { data: users, error } = await supabase
      .from("users")
      .select("id, name, email, role, employee_id, phone, last_active, is_active")
      .eq("role", "employee")
      .order('name', { ascending: true });

    if (error) throw error;
    return users.map(u => ({ 
      ...u, 
      employeeId: u.employee_id, 
      lastActive: u.last_active, 
      isActive: u.is_active 
    }));
  }

  /**
   * Create a new employee
   */
  async createEmployee(userData, adminId, adminName) {
    const { name, email, password, employeeId, phone } = userData;
    const { data: existing } = await supabase.from("users").select("id").eq("email", email).single();
    if (existing) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password || "123456", 10);
    const { error } = await supabase.from("users").insert([{
      name, email, password: hashedPassword, role: "employee", employee_id: employeeId, phone, is_active: true
    }]);

    if (error) throw error;
    await logActivity(adminId, adminName, 'USER_CREATED', null, `Created employee: ${name} (${employeeId})`);
    return true;
  }

  /**
   * Update an employee
   */
  async updateEmployee(id, updateData, adminId, adminName) {
    const { name, email, employeeId, phone, password } = updateData;
    const dbUpdateData = { name, email, employee_id: employeeId, phone, updated_at: new Date() };

    if (password && password.trim() !== "") {
      dbUpdateData.password = await bcrypt.hash(password, 10);
    }

    const { error } = await supabase.from("users").update(dbUpdateData).eq("id", id);
    if (error) throw error;

    await logActivity(adminId, adminName, "USER_UPDATED", null, `Updated Employee: ${name}`);
    return true;
  }

  /**
   * Delete an employee
   */
  async deleteEmployee(id, adminPassword) {
    const { data: admin } = await supabase.from("users").select("*").eq("email", "abc@gmail.com").single();
    
    if (!admin || !(await bcrypt.compare(adminPassword, admin.password))) {
      throw new Error("Invalid admin password");
    }

    const { data: employee } = await supabase.from("users").select("name").eq("id", id).single();
    
    // Cleanup related records
    await supabase.from("tasks").update({ assigned_to: null, status: "Unassigned" }).eq("assigned_to", id);
    await supabase.from("activity_logs").update({ user_id: null }).eq("user_id", id);
    
    const { error } = await supabase.from("users").delete().eq("id", id).eq("role", "employee");
    if (error) throw error;

    await logActivity(admin.id, "Admin", "EMPLOYEE_DELETED", null, `Deleted: ${employee?.name}`);
    return true;
  }

  /**
   * Update employee location
   */
  async updateLocation(userId, latitude, longitude) {
    try {
      // Try primary column names first
      const { error } = await supabase
        .from("users")
        .update({ 
          latitude, 
          longitude, 
          last_active: new Date() 
        })
        .eq("id", userId);

      if (error && error.message.includes("latitude")) {
        console.warn('[DEBUG] ⚠️ Native latitude missing, trying lat/lng fallback...');
        const { error: fallbackError } = await supabase
          .from("users")
          .update({ 
            lat: latitude, 
            lng: longitude, 
            last_active: new Date() 
          })
          .eq("id", userId);
        
        if (fallbackError) throw fallbackError;
      } else if (error) {
        throw error;
      }

      return true;
    } catch (err) {
      console.error('[DEBUG] ❌ updateLocation failed:', err.message);
      throw err;
    }
  }

  /**
   * Get all employee locations for Admin Tracker
   */
  async getEmployeeLocations() {
    try {
      console.log('[DEBUG] 📍 Fetching employee locations...');
      
      const { data: users, error: userError } = await supabase
        .from("users")
        .select("id, name, employee_id, latitude, longitude, lat, lng, last_active")
        .eq("role", "employee")
        .eq("is_active", true);

      if (userError) {
        console.warn('[DEBUG] ⚠️ Native coordinate select failed, trying fallback...');
        // Fallback: select without coordinates first to avoid crash, then we'll see what we have
        const { data: fallbackUsers, error: fallbackError } = await supabase
          .from("users")
          .select("*")
          .eq("role", "employee")
          .eq("is_active", true);
          
        if (fallbackError) throw fallbackError;
        return this._formatLocationResponse(fallbackUsers);
      }

      return this._formatLocationResponse(users);
    } catch (err) {
      console.error('[DEBUG] ❌ getEmployeeLocations CRASHED:', err.message);
      throw err;
    }
  }

  async _formatLocationResponse(users) {
    // Simplified task count query
    const { data: taskCounts } = await supabase
      .from("tasks")
      .select("assigned_to, status")
      .neq("status", "Completed")
      .neq("status", "Verified");

    const countMap = (taskCounts || []).reduce((acc, t) => {
      if (t.assigned_to) {
        acc[t.assigned_to] = (acc[t.assigned_to] || 0) + 1;
      }
      return acc;
    }, {});

    return (users || []).map(u => ({
      ...u,
      employeeId: u.employee_id,
      lastActive: u.last_active,
      // Map whatever coordinate format we found to the frontend expectation
      latitude: u.latitude || u.lat || null,
      longitude: u.longitude || u.lng || null,
      lat: u.latitude || u.lat || null, // Provide both for safety
      lng: u.longitude || u.lng || null,
      activeTasks: countMap[u.id] || 0
    }));
  }
}

module.exports = new UserService();
