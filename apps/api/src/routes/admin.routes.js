const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

router.get('/analytics', adminController.getAnalytics);
router.get('/activity-log', adminController.getActivityLogs);
router.get('/export', adminController.exportTasks);

module.exports = router;
