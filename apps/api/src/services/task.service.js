const supabase = require("../config/supabase");
const { logActivity } = require("../utils/logger");
const { extractCoordinates } = require("../utils/geo");

/**
 * Task Management Service
 */
class TaskService {
  /**
   * Fetch all tasks with filters and search
   */
  async getTasks(filters) {
    const { status, employeeId, pincode, search, page = 1, limit = 0, fromDate, toDate } = filters;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    let query = supabase.from("tasks")
      .select("*, employees:users!tasks_assigned_to_fkey(name)", { count: "exact" })
      .order("created_at", { ascending: false });
    
    if (status && status !== "all") {
      if (status === "active") {
        query = query.in("status", ["Pending", "In Progress"]);
      } else {
        query = query.eq("status", status);
      }
    }
    if (employeeId && employeeId !== "all") query = query.eq("assigned_to", parseInt(employeeId));
    if (pincode) query = query.eq("pincode", pincode);
    if (fromDate) query = query.gte("created_at", `${fromDate}T00:00:00`);
    if (toDate) query = query.lte("created_at", `${toDate}T23:59:59`);
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,client_name.ilike.%${search}%,pincode.ilike.%${search}%`);
    }

    if (limitNum > 0) {
      const from = (pageNum - 1) * limitNum;
      const to = from + limitNum - 1;
      query = query.range(from, to);
    }
    
    const { data: tasks, error, count } = await query;
    if (error) throw error;

    const formatted = tasks.map(task => {
      const addressText = task.address || ""; 
      return {
        ...task,
        address: addressText,
        map: addressText.length > 0 ? "Yes" : "No",
        clientName: task.client_name || "-",
        assignedToName: task.employees ? task.employees.name : "Unassigned",
        status: task.status
      };
    });

    if (limitNum > 0) {
      return { 
        data: formatted, 
        totalCount: count || 0, 
        totalPages: Math.ceil((count || 0) / limitNum),
        currentPage: pageNum
      };
    }
    return formatted;
  }

  /**
   * Get a single task by ID
   */
  async getTaskById(taskId) {
    const { data: task, error } = await supabase
      .from("tasks")
      .select("*, employees:users!tasks_assigned_to_fkey(name)")
      .eq("id", taskId)
      .single();

    if (error) throw error;
    if (!task) throw new Error("Task not found");

    return {
      ...task,
      clientName: task.client_name || "-",
      assignedToName: task.employees ? task.employees.name : "Unassigned"
    };
  }

  /**
   * Create a new task
   */
  async createTask(taskData) {
    const { title, pincode, address, mapUrl, map_url, notes, createdBy, createdByName, assignedTo, clientName, latitude, longitude } = taskData;
    const finalMapUrl = mapUrl || map_url || null;
    let finalLat = latitude, finalLng = longitude;
    
    // Always re-extract from URL when present — overrides frontend-supplied coords
    // because admin forms historically sent imprecise @viewport coordinates.
    if (finalMapUrl) {
      const coords = await extractCoordinates(finalMapUrl);
      if (coords) { 
        finalLat = coords.latitude; 
        finalLng = coords.longitude; 
      }
    }

    let geocodeConfidence = null;
    let geocodeMatchLevel = null;
    let locationWarning = null;

    if ((!finalLat || !finalLng) && (address || pincode)) {
      const { geocodeFromAddress } = require("../utils/geocode");
      const geo = await geocodeFromAddress(address, pincode);
      if (geo) {
        finalLat = geo.latitude;
        finalLng = geo.longitude;
        geocodeConfidence = geo.confidence;
        geocodeMatchLevel = geo.matchLevel;
        locationWarning = geo.warning;
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
      geocode_confidence: geocodeConfidence,
      geocode_match_level: geocodeMatchLevel,
      location_warning: locationWarning
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
    
    // Fetch current task state to detect transitions and for logging
    const { data: currentTask } = await supabase.from("tasks").select("status, assigned_to, title, client_name").eq("id", id).single();
    
    const updateData = { updated_at: new Date() };
    let changes = [];

    if (title) { updateData.title = title; changes.push("Title"); }
    if (latitude !== undefined) { updateData.latitude = (latitude != null && latitude !== '') ? parseFloat(latitude) : null; changes.push("Coordinates"); }
    if (longitude !== undefined) { updateData.longitude = (longitude != null && longitude !== '') ? parseFloat(longitude) : null; }
    if (pincode) { updateData.pincode = pincode; changes.push(`Pincode to ${pincode}`); }
    if (address) { updateData.address = address; changes.push("Address"); }
    if (clientName) { updateData.client_name = clientName; changes.push("Client Name"); }
    if (notes) { updateData.notes = notes; changes.push("Notes"); }
    
    const finalMapUrl = map_url || mapUrl;
    if (finalMapUrl !== undefined) {
      updateData.map_url = finalMapUrl;
      changes.push("Map URL");

      // Re-extract precise coordinates from new URL (same precision cascade as createTask)
      if (finalMapUrl) {
        const coords = await extractCoordinates(finalMapUrl);
        if (coords) {
          updateData.latitude = coords.latitude;
          updateData.longitude = coords.longitude;
          changes.push("Coordinates (auto-extracted)");
        }
      }
    }

    if (status) {
      updateData.status = status;
      changes.push(`Status: ${status}`);
      if (status === 'Completed') updateData.completed_at = new Date();
      if (status === 'Verified') updateData.verified_at = new Date();
    }

    if (assignedTo && assignedTo !== currentTask?.assigned_to) {
        updateData.assigned_to = assignedTo;
        updateData.assigned_date = new Date().toISOString().split('T')[0];
        changes.push("Assigned Employee");
        
        // If it was unassigned, move to Pending
        if (currentTask?.status === "Unassigned" || !status) {
          updateData.status = "Pending";
        }
    }

    const { error } = await supabase.from("tasks").update(updateData).eq("id", id);
    if (error) throw error;

    if (userId) {
        const taskTitle = currentTask?.title || id;
        const client = currentTask?.client_name || "Unknown";
        const logDetail = changes.length > 0 
          ? `Case: ${taskTitle} | Client: ${client} | Updated: ${changes.join(", ")}` 
          : `Case: ${taskTitle} | Client: ${client} | Task details updated`;
        
        await logActivity(userId, userName, "TASK_UPDATED", id, logDetail);
    }
    return true;
  }

  /**
   * Unassign a task
   */
  async unassignTask(taskId, userId, userName) {
    const { data: task } = await supabase.from("tasks").select("title, client_name").eq("id", taskId).single();
    
    const { error } = await supabase.from("tasks").update({
      assigned_to: null,
      status: "Unassigned",
      updated_at: new Date()
    }).eq("id", taskId);

    if (error) throw error;

    const taskTitle = task?.title || taskId;
    const client = task?.client_name || "Unknown";
    await logActivity(userId, userName, "TASK_UNASSIGNED", taskId, `Case: ${taskTitle} | Client: ${client} | Moved to unassigned pool`);
    return true;
  }

  /**
   * Assign a task (initial assignment)
   */
  async assignTask(taskId, employeeId, userId, userName) {
    // Legacy behavior: assignment sets status to Pending and captures current date
    const [empRes, taskRes] = await Promise.all([
      supabase.from("users").select("name").eq("id", employeeId).single(),
      supabase.from("tasks").select("title, client_name").eq("id", taskId).single()
    ]);

    if (!empRes.data) throw new Error("Employee not found");
    const task = taskRes.data;
    
    const { error } = await supabase.from("tasks").update({
      assigned_to: employeeId,
      assigned_date: new Date().toISOString().split('T')[0],
      status: "Pending",
      updated_at: new Date()
    }).eq("id", taskId);

    if (error) throw error;

    const taskTitle = task?.title || taskId;
    const client = task?.client_name || "Unknown";
    await logActivity(userId, userName, "TASK_ASSIGNED", taskId, `Case: ${taskTitle} | Client: ${client} | Assigned to ${empRes.data.name}`);
    return true;
  }

  /**
   * Reassign a task
   */
  async reassignTask(taskId, newEmployeeId, userId, userName) {
    const [empRes, taskRes] = await Promise.all([
      supabase.from("users").select("name").eq("id", newEmployeeId).single(),
      supabase.from("tasks").select("status, title, client_name").eq("id", taskId).single()
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

    const taskTitle = currentTask?.title || taskId;
    const client = currentTask?.client_name || "Unknown";
    await logActivity(userId, userName, "TASK_REASSIGNED", taskId, `Case: ${taskTitle} | Client: ${client} | Reassigned to ${empRes.data.name}`);
    return true;
  }

  /**
   * Optimize tasks using Google Directions API with ORS fallback
   */
  async optimizeTasks(employeeLocation, tasks) {
    const routableTasks = tasks.filter(t => t._lat != null && t._lng != null);
    const unroutableTasks = tasks.filter(t => t._lat == null || t._lng == null);
    
    if (routableTasks.length === 0) return [...unroutableTasks];

    try {
      // PRIMARY: Google Maps Directions API (optimize:true)
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) throw new Error("No Google API Key");
      
      const origin = `${employeeLocation.lat},${employeeLocation.lng}`;
      // Set destination same as origin for a closed-loop round trip
      const destination = origin;
      
      const waypointsStr = routableTasks.map(t => `${t._lat},${t._lng}`).join('|');
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&waypoints=optimize:true|${waypointsStr}&key=${apiKey}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.status === "OK" && data.routes && data.routes.length > 0) {
        console.log("📍 [OPTIMIZE] Google Directions API succeeded");
        const order = data.routes[0].waypoint_order;
        // order is an array like [2, 0, 1] representing the optimized sequence of the provided waypoints
        const optimizedTasks = order.map(index => routableTasks[index]);
        return [...optimizedTasks, ...unroutableTasks];
      } else {
        throw new Error(`Google API failed with status: ${data.status}`);
      }
    } catch (googleError) {
      console.warn("⚠️ [OPTIMIZE] Google Maps optimization failed, falling back to ORS:", googleError.message);
      
      // FALLBACK: OpenRouteService (ORS)
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

  /**
   * Bulk create tasks
   */
  async bulkCreate(tasks) {
    const { error } = await supabase.from("tasks").insert(tasks);
    if (error) throw error;
    return true;
  }

  /**
   * Bulk assign tasks
   */
  async bulkAssign(taskIds, employeeId, userId, userName) {
    const { data: employee } = await supabase.from("users").select("name").eq("id", employeeId).single();
    if (!employee) throw new Error("Employee not found");

    const { error } = await supabase.from("tasks").update({
      assigned_to: employeeId,
      assigned_date: new Date().toISOString().split('T')[0],
      status: "Pending",
      updated_at: new Date()
    }).in("id", taskIds);

    if (error) throw error;

    await logActivity(userId, userName, "BULK_ASSIGN", null, `Assigned ${taskIds.length} tasks to ${employee.name}`);
    return true;
  }

  /**
   * Bulk update status
   */
  async bulkUpdateStatus(taskIds, status, userId, userName) {
    const updateData = { status, updated_at: new Date() };
    if (status === 'Completed') updateData.completed_at = new Date();
    if (status === 'Verified') updateData.verified_at = new Date();

    const { error } = await supabase.from("tasks").update(updateData).in("id", taskIds);
    if (error) throw error;

    await logActivity(userId, userName, "BULK_STATUS_UPDATE", null, `Updated status to ${status} for ${taskIds.length} tasks`);
    return true;
  }

  /**
   * Bulk delete tasks
   */
  async bulkDelete(taskIds, adminId) {
    const { error } = await supabase.from("tasks").delete().in("id", taskIds);
    if (error) throw error;

    if (adminId) {
      await logActivity(adminId, "Admin", "BULK_DELETE", null, `Deleted ${taskIds.length} tasks`);
    }
    return true;
  }

  /**
   * Check duplicates
   */
  async checkDuplicates(caseIds) {
    const lowerCaseIds = caseIds.map(id => id.trim().toLowerCase());
    
    // We can't do `.in(lower(title), array)` easily without raw SQL or checking client-side. 
    // Since this is for duplicate checking on case IDs, we fetch titles that match the array. 
    // To handle case insensitivity, we could fetch matching rows and then filter.
    // Or we just use `in` and assume standard case or check both.
    // Supabase JS doesn't support case-insensitive IN natively. So we'll fetch exact matches or use a custom filter.
    // Given the array might be large (500 items), pulling only potentially matching rows is best.
    
    // A better approach for case-insensitive matching with IN is to query existing records
    // Since we need to be case-insensitive, we fetch all tasks that have titles in the list (case-sensitive)
    // Wait, let's just fetch all tasks' titles if the table is small, but the goal is to optimize.
    // Let's use `in` with the exact case IDs, and maybe also upper/lower versions.
    const uniqueIds = [...new Set([...caseIds, ...lowerCaseIds, ...caseIds.map(id => id.toUpperCase())])];

    const { data: existingTasks, error } = await supabase
      .from("tasks")
      .select("id, title")
      .in("title", uniqueIds);

    if (error) throw error;

    return existingTasks || [];
  }
}

module.exports = new TaskService();
