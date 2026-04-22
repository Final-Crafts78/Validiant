const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.resolve(__dirname, '../../../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({ dest: uploadDir });

router.get('/', taskController.getTasks);
router.post('/', taskController.createTask);
router.post('/bulk-upload', upload.single('excelFile'), taskController.bulkUpload);
router.get('/unassigned', taskController.getUnassignedTasks);
router.get('/:id', taskController.getTaskById);
router.post('/optimize', taskController.optimize);
router.put('/:id', taskController.updateTask);
router.post('/:taskId/unassign', taskController.unassignTask);
router.put('/:taskId/assign', taskController.assignTask);
router.put('/:taskId/reassign', taskController.reassignTask);
router.put('/:taskId/status', taskController.updateStatus);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
