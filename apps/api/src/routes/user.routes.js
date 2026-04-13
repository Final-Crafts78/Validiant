const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

router.get('/', userController.getEmployees);
router.get('/locations', userController.getLocations);
router.post('/', userController.createEmployee);
router.put('/:id/location', userController.updateLocation);
router.put('/:id', userController.updateEmployee);
router.delete('/:id', userController.deleteEmployee);

module.exports = router;
