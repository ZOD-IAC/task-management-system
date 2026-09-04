const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const taskService = require('./task.service');

const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.userId, req.body);
  res.status(201).json(new ApiResponse(201, task, 'Task created'));
});

const getTasks = asyncHandler(async (req, res) => {
  const result = await taskService.listTasks(req.userId, req.query);
  res.status(200).json(new ApiResponse(200, result));
});

const getTaskById = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.userId, req.params.id);
  res.status(200).json(new ApiResponse(200, task));
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.userId, req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, task, 'Task updated'));
});

const deleteTask = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.userId, req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Task deleted'));
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await taskService.getDashboardStats(req.userId);
  res.status(200).json(new ApiResponse(200, stats));
});

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getDashboardStats,
};
