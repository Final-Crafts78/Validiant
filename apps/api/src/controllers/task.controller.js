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
}

module.exports = new TaskController();
