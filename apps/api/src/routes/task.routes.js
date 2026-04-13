const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');

router.get('/', taskController.getTasks);
router.post('/', taskController.createTask);
router.get('/unassigned', taskController.getUnassignedTasks);
router.post('/optimize', taskController.optimize);
router.put('/:id', taskController.updateTask);
router.post('/:taskId/unassign', taskController.unassignTask);
router.put('/:taskId/reassign', taskController.reassignTask);
router.put('/:taskId/status', taskController.updateStatus);

module.exports = router;
