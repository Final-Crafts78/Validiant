const settingsService = require("../services/settings.service");
const { logActivity } = require("../utils/logger");

/**
 * Settings Controller
 */
class SettingsController {
  /**
   * Fetch a setting by key
   */
  async getSetting(req, res) {
    try {
      const { key } = req.params;
      const value = await settingsService.getSetting(key);
      res.json({ success: true, value });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Update a setting by key
   */
  async updateSetting(req, res) {
    try {
      const { key } = req.params;
      const { value, adminId, adminName } = req.body;
      
      await settingsService.setSetting(key, value, adminId);
      
      if (adminId && adminName) {
         await logActivity(adminId, adminName, 'SETTING_UPDATED', null, `Updated setting: ${key}`);
      }
      
      res.json({ success: true, message: "Setting updated successfully" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new SettingsController();
