const userService = require("../services/user.service");

/**
 * User Controller
 */
class UserController {
  async getEmployees(req, res) {
    try {
      const employees = await userService.getEmployees();
      res.json(employees);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async createEmployee(req, res) {
    try {
      const { adminId, adminName } = req.body;
      await userService.createEmployee(req.body, adminId, adminName);
      res.json({ success: true, message: "User created successfully" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async updateEmployee(req, res) {
    try {
      const { id } = req.params;
      const { adminId, adminName } = req.body;
      await userService.updateEmployee(id, req.body, adminId, adminName);
      res.json({ success: true, message: "Employee updated successfully" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async deleteEmployee(req, res) {
    try {
      const { id } = req.params;
      const { adminPassword } = req.body;
      await userService.deleteEmployee(id, adminPassword);
      res.json({ success: true, message: "Employee deleted" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new UserController();
