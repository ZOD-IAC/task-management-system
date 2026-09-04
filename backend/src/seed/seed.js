/**
 * Seeds the database with one test user and a spread of tasks so the
 * project can be evaluated immediately, without manually creating an
 * account and typing in tasks one at a time.
 *
 * Usage: npm run seed        -> wipes and recreates test data
 *        npm run seed:destroy -> removes only the seeded test user + their tasks
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../modules/auth/user.model');
const Task = require('../modules/tasks/task.model');
const { TASK_STATUS, TASK_PRIORITY } = require('../constants');

const TEST_USER = {
  name: 'Admin User',
  email: 'admin@tms.com',
  password: 'admin123', // hashed automatically by the User model's pre-save hook
};

// A spread across every status/priority combination + varied due dates
// (past/overdue, today, future, none) so filters, search, and the
// dashboard counts all have something real to show immediately.
const buildTasks = (userId) => {
  const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

  return [
    { title: 'Design database schema', description: 'Define collections and relationships for the task manager', status: TASK_STATUS.COMPLETED, priority: TASK_PRIORITY.HIGH, dueDate: daysFromNow(-10) },
    { title: 'Set up Express project structure', description: 'Modules, middlewares, routes wiring', status: TASK_STATUS.COMPLETED, priority: TASK_PRIORITY.HIGH, dueDate: daysFromNow(-9) },
    { title: 'Implement JWT authentication', description: 'Register, login, httpOnly cookie handling', status: TASK_STATUS.COMPLETED, priority: TASK_PRIORITY.HIGH, dueDate: daysFromNow(-8) },
    { title: 'Build task CRUD endpoints', description: 'Create, read, update, delete with ownership checks', status: TASK_STATUS.COMPLETED, priority: TASK_PRIORITY.MEDIUM, dueDate: daysFromNow(-6) },
    { title: 'Add search and filter support', description: 'Search by title, filter by status and priority', status: TASK_STATUS.COMPLETED, priority: TASK_PRIORITY.MEDIUM, dueDate: daysFromNow(-5) },
    { title: 'Add pagination to task list', description: 'Page and limit query params on GET /tasks', status: TASK_STATUS.IN_PROGRESS, priority: TASK_PRIORITY.MEDIUM, dueDate: daysFromNow(-1) },
    { title: 'Build dashboard stats endpoint', description: 'Aggregate task counts by status', status: TASK_STATUS.IN_PROGRESS, priority: TASK_PRIORITY.HIGH, dueDate: daysFromNow(0) },
    { title: 'Style login and register pages', description: 'Match shadcn/ui components across auth screens', status: TASK_STATUS.IN_PROGRESS, priority: TASK_PRIORITY.LOW, dueDate: daysFromNow(1) },
    { title: 'Wire up task filters on frontend', description: 'Sync search/status/priority with URL query params', status: TASK_STATUS.IN_PROGRESS, priority: TASK_PRIORITY.MEDIUM, dueDate: daysFromNow(2) },
    { title: 'Build task creation modal', description: 'Form with validation for title, description, status, priority, due date', status: TASK_STATUS.PENDING, priority: TASK_PRIORITY.HIGH, dueDate: daysFromNow(2) },
    { title: 'Build inline status update dropdown', description: 'PATCH request from the task card without opening full edit form', status: TASK_STATUS.PENDING, priority: TASK_PRIORITY.MEDIUM, dueDate: daysFromNow(3) },
    { title: 'Add delete confirmation', description: 'Prevent accidental task deletion', status: TASK_STATUS.PENDING, priority: TASK_PRIORITY.LOW, dueDate: daysFromNow(4) },
    { title: 'Handle 401 redirect on frontend', description: 'Bounce to login when the auth cookie is missing or expired', status: TASK_STATUS.PENDING, priority: TASK_PRIORITY.MEDIUM, dueDate: daysFromNow(5) },
    { title: 'Write README setup instructions', description: 'Env vars, install steps, seed script usage', status: TASK_STATUS.PENDING, priority: TASK_PRIORITY.HIGH, dueDate: daysFromNow(6) },
    { title: 'Deploy backend to Render', description: 'Set production env vars and test live cookie auth', status: TASK_STATUS.PENDING, priority: TASK_PRIORITY.LOW, dueDate: daysFromNow(8) },
    { title: 'Deploy frontend to Vercel', description: 'Point VITE_API_BASE_URL at the deployed backend', status: TASK_STATUS.PENDING, priority: TASK_PRIORITY.LOW, dueDate: daysFromNow(9) },
    { title: 'Cross-browser test login flow', description: 'Confirm cookie auth works in Chrome, Firefox, Safari', status: TASK_STATUS.PENDING, priority: TASK_PRIORITY.MEDIUM, dueDate: daysFromNow(10) },
    { title: 'Review error handling edge cases', description: 'Invalid ObjectId, missing fields, expired token', status: TASK_STATUS.PENDING, priority: TASK_PRIORITY.MEDIUM, dueDate: null },
    { title: 'Clean up unused code and console.logs', description: 'Final pass before submission', status: TASK_STATUS.PENDING, priority: TASK_PRIORITY.LOW, dueDate: null },
    { title: 'Record final walkthrough notes', description: 'Summarize architecture decisions for the README', status: TASK_STATUS.PENDING, priority: TASK_PRIORITY.LOW, dueDate: null },
  ].map((task) => ({ ...task, user: userId }));
};

const seed = async () => {
  await connectDB();

  const existing = await User.findOne({ email: TEST_USER.email });
  if (existing) {
    await Task.deleteMany({ user: existing._id });
    await User.deleteOne({ _id: existing._id });
  }

  const user = await User.create(TEST_USER);
  const tasks = await Task.insertMany(buildTasks(user._id));

  console.log('Seed complete.');
  console.log(`Test user: ${TEST_USER.email} / ${TEST_USER.password}`);
  console.log(`Created ${tasks.length} tasks.`);

  await mongoose.disconnect();
  process.exit(0);
};

const destroy = async () => {
  await connectDB();

  const user = await User.findOne({ email: TEST_USER.email });
  if (user) {
    const { deletedCount } = await Task.deleteMany({ user: user._id });
    await User.deleteOne({ _id: user._id });
    console.log(`Removed test user and ${deletedCount} tasks.`);
  } else {
    console.log('No test user found — nothing to remove.');
  }

  await mongoose.disconnect();
  process.exit(0);
};

if (process.argv.includes('--destroy')) {
  destroy();
} else {
  seed();
}
