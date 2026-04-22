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
      const tasks = await taskService.getTasks({ status: 'Unassigned' });
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ error: err.message });
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
          const coords = extractCoordinates(row.mapurl || row.map);
          if (coords) { finalLat = coords.latitude; finalLng = coords.longitude; }
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
          created_by: adminId || null
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
}

module.exports = new TaskController();
