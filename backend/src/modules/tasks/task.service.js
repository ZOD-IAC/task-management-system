const ApiError = require('../../utils/ApiError');
const taskRepository = require('./task.repository');
const { TASK_STATUS, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } = require('../../constants');

const createTask = async (userId, taskData) => {
  return taskRepository.create({ ...taskData, user: userId });
};

const getTaskById = async (userId, taskId) => {
  const task = await taskRepository.findByIdAndUser(taskId, userId);
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }
  return task;
};

const updateTask = async (userId, taskId, updates) => {
  const task = await taskRepository.updateByIdAndUser(taskId, userId, updates);
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }
  return task;
};

const deleteTask = async (userId, taskId) => {
  const task = await taskRepository.deleteByIdAndUser(taskId, userId);
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }
  return task;
};

const listTasks = async (userId, queryParams) => {
  const { search, status, priority, page = 1, limit = DEFAULT_PAGE_SIZE, sortBy = 'createdAt', order = 'desc' } = queryParams;

  const filters = {};
  if (search) {
    filters.title = { $regex: search, $options: 'i' };
  }
  if (status) {
    filters.status = status;
  }
  if (priority) {
    filters.priority = priority;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(limit, 10) || DEFAULT_PAGE_SIZE));
  const skip = (pageNum - 1) * limitNum;
  const sort = { [sortBy]: order === 'asc' ? 1 : -1 };

  const [tasks, total] = await Promise.all([
    taskRepository.findWithFilters(userId, filters, { skip, limit: limitNum, sort }),
    taskRepository.countWithFilters(userId, filters),
  ]);

  return {
    tasks,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

const getDashboardStats = async (userId) => {
  const grouped = await taskRepository.getStatusCounts(userId);

  // Start every known status at 0 so the frontend doesn't have to guard
  // against a missing key when a user has, say, zero completed tasks.
  const counts = Object.values(TASK_STATUS).reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {});

  let total = 0;
  grouped.forEach(({ _id, count }) => {
    counts[_id] = count;
    total += count;
  });

  return { total, ...counts };
};

module.exports = {
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  listTasks,
  getDashboardStats,
};
