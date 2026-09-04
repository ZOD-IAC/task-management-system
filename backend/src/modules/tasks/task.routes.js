const express = require('express');
const taskController = require('./task.controller');
const validate = require('../../middlewares/validate.middleware');
const protect = require('../../middlewares/auth.middleware');
const { createTaskSchema, updateTaskSchema } = require('./task.validator');

const router = express.Router();

// Every task route requires a valid JWT - applied once here rather than
// repeated on each route.
router.use(protect);

router.get('/dashboard', taskController.getDashboardStats);
router.get('/', taskController.getTasks);
router.post('/', validate(createTaskSchema), taskController.createTask);
router.get('/:id', taskController.getTaskById);
router.patch('/:id', validate(updateTaskSchema), taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
