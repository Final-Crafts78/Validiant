const taskService = require("../services/task.service");

/**
 * Task Controller
 */
class TaskController {
  /**
   * List tasks with filters
   */
  async getTasks(req, res) {
    try {
      const tasks = await taskService.getTasks(req.query);
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * List unassigned tasks
   */
  async getUnassignedTasks(req, res) {
    try {
      const tasks = await taskService.getTasks({ ...req.query, status: 'Unassigned' });
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * Get task by ID
   */
  async getTaskById(req, res) {
    try {
      const task = await taskService.getTaskById(req.params.id);
      res.json(task);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }

  /**
   * Create a task
   */
  async createTask(req, res) {
    try {
      const task = await taskService.createTask(req.body);
      res.json({ success: true, task });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Update a task
   */
  async updateTask(req, res) {
    try {
      const { id } = req.params;
      const result = await taskService.updateTask(id, req.body, req.body.userId, req.body.userName);
      res.json({ success: true, message: "Updated" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Unassign a task
   */
  async unassignTask(req, res) {
    try {
      const { taskId } = req.params;
      const { userId, userName } = req.body;
      await taskService.unassignTask(taskId, userId, userName);
      res.json({ success: true, message: "Task moved to unassigned pool" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Assign a task
   */
  async assignTask(req, res) {
    try {
      const { taskId } = req.params;
      const { employeeId, userId, userName } = req.body;
      await taskService.assignTask(taskId, employeeId, userId, userName);
      res.json({ success: true, message: "Task assigned successfully" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Reassign a task
   */
  async reassignTask(req, res) {
    try {
      const { taskId } = req.params;
      const { newEmployeeId, userId, userName } = req.body;
      await taskService.reassignTask(taskId, newEmployeeId, userId, userName);
      res.json({ success: true, message: "Task reassigned successfully" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Update task status
   */
  async updateStatus(req, res) {
    try {
      const { taskId } = req.params;
      const { status, userId, userName } = req.body;
      await taskService.updateTask(taskId, { status }, userId, userName);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false });
    }
  }

  /**
   * Optimize tasks route
   */
  async optimize(req, res) {
    try {
      const { employeeLocation, tasks } = req.body;
      const optimizedTasks = await taskService.optimizeTasks(employeeLocation, tasks);
      res.json({ success: true, optimizedTasks });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Bulk upload tasks from Excel/CSV
   */
  async bulkUpload(req, res) {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: "No file." });
      
      const { adminId, adminName } = req.body;
      const xlsx = require("xlsx");
      const workbook = xlsx.readFile(req.file.path);
      const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
      const fs = require("fs");
      
      if (rawData.length === 0) {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, message: "Empty file." });
      }

      let successCount = 0;
      const tasksToInsert = [];
      const { extractCoordinates } = require("../utils/geo");
      
      for (let i = 0; i < rawData.length; i++) {
        const raw = rawData[i];
        const row = {};
        Object.keys(raw).forEach(k => row[k.toLowerCase().replace(/[^a-z0-9]/g, "")] = raw[k]);

        const title = row.requestid || row.caseid || row.title || row.id;
        const pincode = row.pincode || row.pin;
        
        if (!title || !pincode) continue; 
        
        let finalLat = row.latitude || row.lat;
        let finalLng = row.longitude || row.lng;
        
        if ((row.mapurl || row.map) && (!finalLat || !finalLng)) {
          const coords = await extractCoordinates(row.mapurl || row.map);
          if (coords) { finalLat = coords.latitude; finalLng = coords.longitude; }
        }

        let geocodeConfidence = null;
        let geocodeMatchLevel = null;
        let locationWarning = null;

        if ((!finalLat || !finalLng) && (row.address || pincode)) {
          const { geocodeFromAddress } = require("../utils/geocode");
          const geo = await geocodeFromAddress(row.address, pincode);
          if (geo) { 
            finalLat = geo.latitude; 
            finalLng = geo.longitude; 
            geocodeConfidence = geo.confidence;
            geocodeMatchLevel = geo.matchLevel;
            locationWarning = geo.warning;
          }
        }

        tasksToInsert.push({
          title: String(title),
          pincode: String(pincode).trim(),
          client_name: row.clientname || row.individualname || "Unknown Client",
          map_url: row.mapurl || row.map || null,
          address: row.address || null,
          latitude: finalLat || null,
          longitude: finalLng || null,
          notes: row.notes || null,
          status: "Unassigned",
          created_by: adminId || null,
          geocode_confidence: geocodeConfidence,
          geocode_match_level: geocodeMatchLevel,
          location_warning: locationWarning
        });
        successCount++;
      }

      if (tasksToInsert.length > 0) {
        await taskService.bulkCreate(tasksToInsert);
      }

      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      // Note: Activity logging would go here if needed, keeping it slim for now
      res.json({ success: true, message: `${successCount} tasks uploaded.`, successCount });
    } catch (err) {
      const fs = require("fs");
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(req, res) {
    try {
      const { id } = req.params;
      const { adminId } = req.query;
      await taskService.deleteTask(id, adminId);
      res.json({ success: true, message: "Task deleted successfully" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Bulk Operations
   */
  async bulkAssign(req, res) {
    try {
      const { taskIds, employeeId, userId, userName } = req.body;
      if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
        return res.status(400).json({ success: false, message: "No tasks provided" });
      }
      await taskService.bulkAssign(taskIds, employeeId, userId, userName);
      res.json({ success: true, message: "Tasks assigned successfully" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async bulkUpdateStatus(req, res) {
    try {
      const { taskIds, status, userId, userName } = req.body;
      if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
        return res.status(400).json({ success: false, message: "No tasks provided" });
      }
      await taskService.bulkUpdateStatus(taskIds, status, userId, userName);
      res.json({ success: true, message: "Task statuses updated successfully" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async bulkDelete(req, res) {
    try {
      const { taskIds, adminId } = req.body;
      if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
        return res.status(400).json({ success: false, message: "No tasks provided" });
      }
      await taskService.bulkDelete(taskIds, adminId);
      res.json({ success: true, message: "Tasks deleted successfully" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async bulkCheckDuplicates(req, res) {
    try {
      const { caseIds } = req.body;
      if (!caseIds || !Array.isArray(caseIds) || caseIds.length === 0) {
        return res.status(400).json({ success: false, message: "No case IDs provided" });
      }
      const existingTasks = await taskService.checkDuplicates(caseIds);
      res.json({ success: true, duplicates: existingTasks });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async bulkCreateJson(req, res) {
    try {
      const { tasks, adminId, adminName } = req.body;
      if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
        return res.status(400).json({ success: false, message: "No tasks provided" });
      }
      
      const { extractCoordinates } = require("../utils/geo");
      const { geocodeFromAddress } = require("../utils/geocode");
      const tasksToInsert = [];

      for (const taskData of tasks) {
        const { title, pincode, address, mapUrl, map_url, notes, createdBy, assignedTo, clientName, latitude, longitude } = taskData;
        const finalMapUrl = mapUrl || map_url || null;
        
        let finalLat = latitude || null;
        let finalLng = longitude || null;
        
        if (finalMapUrl && (!finalLat || !finalLng)) {
          const coords = await extractCoordinates(finalMapUrl);
          if (coords) { finalLat = coords.latitude; finalLng = coords.longitude; }
        }

        let geocodeConfidence = null;
        let geocodeMatchLevel = null;
        let locationWarning = null;

        if ((!finalLat || !finalLng) && (address || pincode)) {
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
        
        tasksToInsert.push({
          title, pincode, address: address || finalMapUrl, map_url: finalMapUrl,
          latitude: finalLat, longitude: finalLng, notes, client_name: clientName, 
          status: initialStatus, assigned_to: finalAssignee, 
          assigned_date: assignedDate, created_by: createdBy || adminId,
          geocode_confidence: geocodeConfidence,
          geocode_match_level: geocodeMatchLevel,
          location_warning: locationWarning
        });
      }

      await taskService.bulkCreate(tasksToInsert);
      res.json({ success: true, message: `${tasks.length} tasks created successfully` });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new TaskController();
