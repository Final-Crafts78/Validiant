const supabase = require("../config/supabase");
const { logActivity } = require("../utils/logger");
const { extractCoordinates } = require("../utils/geo");

/**
 * Task Management Service
 */
class TaskService {
  /**
   * Fetch all tasks with filters and search
   * Optimized with Supabase joins for high performance
   * @param {Object} filters - Search and filter criteria
   * @returns {Promise<Array>} Formatted task list
   */
  async getTasks(filters) {
    const { status, employeeId, pincode, search } = filters;
    
    // 💎 Performance Optimization: Using Supabase Join (!) to fetch assignee name in ONE query
    // This removes the need to fetch all users independently and doing an O(N*M) lookup.
    const selectFields = search ? "*, users:assigned_to(name)" : "id, title, status, pincode, client_name, latitude, longitude, map_url, assigned_to, created_at, assigned_date, verified_at, completed_at, notes, users:assigned_to(name)";
    
    let query = supabase.from("tasks")
      .select(selectFields)
      .order("created_at", { ascending: false });
    
    if (status && status !== "all") {
      if (status === "active") {
        query = query.in("status", ["Pending", "In Progress"]);
      } else {
        query = query.eq("status", status);
      }
    }
    
    if (employeeId && employeeId !== "all") {
      query = query.eq("assigned_to", parseInt(employeeId));
    }
    
    if (pincode) {
      query = query.eq("pincode", pincode);
    }
    
    const { data: tasks, error } = await query;
    if (error) throw error;

    // 💎 Performance Optimization: Formatting in a single pass
    const formatted = tasks.map(task => ({
        ...task,
        address: task.address || "",
        map: (task.address || "").length > 0 ? "Yes" : "No",
        clientName: task.client_name || "-",
        assignedToName: task.users ? task.users.name : "Unassigned",
        // Flattening joined data for frontend compatibility
        users: undefined 
    }));

    if (search) {
      const s = search.toLowerCase();
      return formatted.filter(t => 
        (t.title && t.title.toLowerCase().includes(s)) ||
        (t.clientName && t.clientName.toLowerCase().includes(s)) ||
        (t.pincode && t.pincode.includes(s)) ||
        (t.assignedToName && t.assignedToName.toLowerCase().includes(s))
      );
    }
    return formatted;
  }

  /**
   * Create a new task
   */
  async createTask(taskData) {
    const { title, pincode, address, mapUrl, map_url, notes, createdBy, createdByName, assignedTo, clientName, latitude, longitude } = taskData;
    const finalMapUrl = mapUrl || map_url || null;
    let finalLat = latitude, finalLng = longitude;
    
    if (finalMapUrl && (!finalLat || !finalLng)) {
      const coords = extractCoordinates(finalMapUrl);
      if (coords) { 
        finalLat = coords.latitude; 
        finalLng = coords.longitude; 
      }
    }

    let initialStatus = "Unassigned";
    let finalAssignee = null;
    let assignedDate = null;

    if (assignedTo && assignedTo !== "Unassigned") {
      initialStatus = "Pending";
      finalAssignee = assignedTo;
      assignedDate = new Date().toISOString().split('T')[0];
    }

    const { data, error } = await supabase.from("tasks").insert([{
      title, pincode, address: address || finalMapUrl, map_url: finalMapUrl,
      latitude: finalLat, longitude: finalLng, notes,
      client_name: clientName, status: initialStatus,
      assigned_to: finalAssignee, assigned_date: assignedDate,
      created_by: createdBy,
    }]).select();

    if (error) throw error;

    await logActivity(createdBy, createdByName, 'TASK_CREATED', data[0].id, `Created task: ${title}`);
    return data[0];
  }

  /**
   * Update task details
   */
  async updateTask(id, updateFields, userId, userName) {
    const { title, pincode, address, notes, status, assignedTo, clientName, mapUrl, map_url, latitude, longitude } = updateFields;
    const updateData = { updated_at: new Date() };
    let changes = [];

    if (title) { updateData.title = title; changes.push("Title"); }
    if (latitude !== undefined) { updateData.latitude = latitude ? parseFloat(latitude) : null; changes.push("Coordinates"); }
    if (longitude !== undefined) { updateData.longitude = longitude ? parseFloat(longitude) : null; }
    if (pincode) { updateData.pincode = pincode; changes.push(`Pincode to ${pincode}`); }
    if (address) { updateData.address = address; changes.push("Address"); }
    if (clientName) { updateData.client_name = clientName; changes.push("Client Name"); }
    if (notes) { updateData.notes = notes; changes.push("Notes"); }
    
    const finalMapUrl = map_url || mapUrl;
    if (finalMapUrl !== undefined) {
      updateData.map_url = finalMapUrl;
      changes.push("Map URL");
    }

    if (status) {
      updateData.status = status;
      changes.push(`Status: ${status}`);
      if (status === 'Completed') updateData.completed_at = new Date();
      if (status === 'Verified') updateData.verified_at = new Date();
    }

    if (assignedTo) {
        updateData.assigned_to = assignedTo;
        changes.push("Reassigned Employee");
        if (status === "Unassigned") updateData.status = "Pending";
    }

    const { error } = await supabase.from("tasks").update(updateData).eq("id", id);
    if (error) throw error;

    if (userId) {
        const logDetail = changes.length > 0 ? `Updated: ${changes.join(", ")}` : "Task details updated";
        await logActivity(userId, userName, "TASK_UPDATED", id, logDetail);
    }
    return true;
  }

  /**
   * Unassign a task
   */
  async unassignTask(taskId, userId, userName) {
    const { error } = await supabase.from("tasks").update({
      assigned_to: null,
      status: "Unassigned",
      updated_at: new Date()
    }).eq("id", taskId);

    if (error) throw error;

    await logActivity(userId, userName, "TASK_UNASSIGNED", taskId, "Moved to unassigned pool");
    return true;
  }

  /**
   * Assign a task (initial assignment)
   */
  async assignTask(taskId, employeeId, userId, userName) {
    // Legacy behavior: assignment sets status to Pending and captures current date
    const [empRes, taskRes] = await Promise.all([
      supabase.from("users").select("name").eq("id", employeeId).single(),
      supabase.from("tasks").select("status").eq("id", taskId).single()
    ]);

    if (!empRes.data) throw new Error("Employee not found");
    
    const { error } = await supabase.from("tasks").update({
      assigned_to: employeeId,
      assigned_date: new Date().toISOString().split('T')[0],
      status: "Pending",
      updated_at: new Date()
    }).eq("id", taskId);

    if (error) throw error;

    await logActivity(userId, userName, "TASK_ASSIGNED", taskId, `Assigned to ${empRes.data.name}`);
    return true;
  }

  /**
   * Reassign a task
   */
  async reassignTask(taskId, newEmployeeId, userId, userName) {
    const [empRes, taskRes] = await Promise.all([
      supabase.from("users").select("name").eq("id", newEmployeeId).single(),
      supabase.from("tasks").select("status").eq("id", taskId).single()
    ]);

    if (!empRes.data) throw new Error("Employee not found");
    const currentTask = taskRes.data;

    const terminalStatuses = ['Completed', 'Verified'];
    const newStatus = terminalStatuses.includes(currentTask?.status) ? currentTask.status : "Pending";

    const { error } = await supabase.from("tasks").update({
      assigned_to: newEmployeeId,
      assigned_date: new Date().toISOString().split('T')[0],
      status: newStatus,
      updated_at: new Date()
    }).eq("id", taskId);

    if (error) throw error;

    await logActivity(userId, userName, "TASK_REASSIGNED", taskId, `Reassigned to ${empRes.data.name}`);
    return true;
  }

  /**
   * Optimize tasks using ORS
   */
  async optimizeTasks(employeeLocation, tasks) {
    const routableTasks = tasks.filter(t => t._lat != null && t._lng != null);
    const unroutableTasks = tasks.filter(t => t._lat == null || t._lng == null);
    
    if (routableTasks.length === 0) return [...unroutableTasks];

    const orsPayload = {
      vehicles: [{
        id: 1,
        profile: "driving-car",
        start: [employeeLocation.lng, employeeLocation.lat]
      }],
      jobs: routableTasks.map((task, index) => ({
        id: index,
        location: [task._lng, task._lat]
      }))
    };

    const response = await fetch("https://api.openrouteservice.org/optimization", {
      method: "POST",
      headers: {
        "Authorization": process.env.ORS_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(orsPayload)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "ORS API Failed");

    const steps = data.routes[0].steps.filter(s => s.type === "job");
    const optimizedTasks = steps.map(step => routableTasks[step.job]);
    return [...optimizedTasks, ...unroutableTasks];
  }

  /**
   * Delete a task permanently
   */
  async deleteTask(taskId, adminId) {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) throw error;
    
    if (adminId) {
      await logActivity(adminId, "Admin", "TASK_DELETED", taskId, "Task permanently deleted");
    }
    return true;
  }
}

module.exports = new TaskService();
