/**
 * Runs the real app against a real MongoDB instance and exercises the full
 * auth + task flow, including cross-user ownership checks. Requires a
 * MongoDB instance reachable at MONGO_URI (defaults to local). Uses a
 * dedicated database that it drops at the end, so it's safe to run
 * against your dev Mongo without touching real data.
 *
 * Usage: make sure MongoDB is running locally, then `npm run smoke-test`
 */
const mongoose = require('mongoose');

(async () => {
  process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/task-manager-smoke-test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'smoke_test_secret';
  process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

  const request = require('supertest');
  const app = require('./src/app');
  const connectDB = require('./src/config/db');
  await connectDB();

  const assert = (cond, label) => {
    console.log(`${cond ? 'PASS' : 'FAIL'} - ${label}`);
    if (!cond) process.exitCode = 1;
  };

  // Register user A
  const registerRes = await request(app).post('/api/auth/register').send({
    name: 'Harshit',
    email: 'harshit@example.com',
    password: 'password123',
  });
  assert(registerRes.status === 201, 'register returns 201');
  const tokenA = registerRes.body.data.token;

  // Register user B (to test ownership isolation)
  const registerB = await request(app).post('/api/auth/register').send({
    name: 'Other User',
    email: 'other@example.com',
    password: 'password123',
  });
  const tokenB = registerB.body.data.token;

  // Duplicate email should fail
  const dupRes = await request(app).post('/api/auth/register').send({
    name: 'Dup',
    email: 'harshit@example.com',
    password: 'password123',
  });
  assert(dupRes.status === 409, 'duplicate email register returns 409');

  // Login
  const loginRes = await request(app).post('/api/auth/login').send({
    email: 'harshit@example.com',
    password: 'password123',
  });
  assert(loginRes.status === 200 && loginRes.body.data.token, 'login returns token');

  // Reject bad password
  const badLogin = await request(app).post('/api/auth/login').send({
    email: 'harshit@example.com',
    password: 'wrongpass',
  });
  assert(badLogin.status === 401, 'wrong password returns 401');

  // No token -> task routes blocked
  const noAuth = await request(app).get('/api/tasks');
  assert(noAuth.status === 401, 'unauthenticated task list returns 401');

  // Create tasks for user A
  const create1 = await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${tokenA}`)
    .send({ title: 'Write README', priority: 'High', status: 'Pending' });
  assert(create1.status === 201, 'create task returns 201');
  const taskId = create1.body.data._id;

  await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${tokenA}`)
    .send({ title: 'Deploy backend', priority: 'Medium', status: 'In Progress' });

  await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${tokenA}`)
    .send({ title: 'Write tests', priority: 'Low', status: 'Completed' });

  // Validation failure - empty title
  const badCreate = await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${tokenA}`)
    .send({ title: '' });
  assert(badCreate.status === 400, 'empty title returns 400 validation error');

  // Create a task for user B
  await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${tokenB}`)
    .send({ title: 'User B private task' });

  // List tasks for user A - should only see their own 3
  const listA = await request(app).get('/api/tasks').set('Authorization', `Bearer ${tokenA}`);
  assert(listA.body.data.tasks.length === 3, 'user A sees only their own 3 tasks');
  assert(listA.body.data.pagination.total === 3, 'pagination total is 3 for user A');

  // Search by title
  const searchRes = await request(app)
    .get('/api/tasks?search=readme')
    .set('Authorization', `Bearer ${tokenA}`);
  assert(searchRes.body.data.tasks.length === 1, 'case-insensitive title search works');

  // Filter by status
  const filterRes = await request(app)
    .get('/api/tasks?status=Completed')
    .set('Authorization', `Bearer ${tokenA}`);
  assert(filterRes.body.data.tasks.length === 1, 'status filter works');

  // Pagination
  const pageRes = await request(app)
    .get('/api/tasks?page=1&limit=2')
    .set('Authorization', `Bearer ${tokenA}`);
  assert(
    pageRes.body.data.tasks.length === 2 && pageRes.body.data.pagination.totalPages === 2,
    'pagination limit/totalPages works'
  );

  // User B cannot access/update/delete user A's task -> 404, not leaked
  const crossUserGet = await request(app)
    .get(`/api/tasks/${taskId}`)
    .set('Authorization', `Bearer ${tokenB}`);
  assert(crossUserGet.status === 404, "user B can't fetch user A's task (404)");

  const crossUserUpdate = await request(app)
    .put(`/api/tasks/${taskId}`)
    .set('Authorization', `Bearer ${tokenB}`)
    .send({ title: 'hijacked' });
  assert(crossUserUpdate.status === 404, "user B can't update user A's task (404)");

  const crossUserDelete = await request(app)
    .delete(`/api/tasks/${taskId}`)
    .set('Authorization', `Bearer ${tokenB}`);
  assert(crossUserDelete.status === 404, "user B can't delete user A's task (404)");

  // User A can update their own task
  const updateOwn = await request(app)
    .put(`/api/tasks/${taskId}`)
    .set('Authorization', `Bearer ${tokenA}`)
    .send({ status: 'Completed' });
  assert(updateOwn.status === 200 && updateOwn.body.data.status === 'Completed', 'owner can update own task');

  // Dashboard stats
  const dashboard = await request(app).get('/api/tasks/dashboard').set('Authorization', `Bearer ${tokenA}`);
  assert(
    dashboard.body.data.total === 3 && dashboard.body.data.Completed === 2,
    'dashboard stats reflect correct counts'
  );

  // User A can delete their own task
  const deleteOwn = await request(app)
    .delete(`/api/tasks/${taskId}`)
    .set('Authorization', `Bearer ${tokenA}`);
  assert(deleteOwn.status === 200, 'owner can delete own task');

  const afterDelete = await request(app).get('/api/tasks').set('Authorization', `Bearer ${tokenA}`);
  assert(afterDelete.body.data.pagination.total === 2, 'task count drops after delete');

  // Clean up: drop the dedicated smoke-test database so nothing lingers.
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();

  console.log('\nSmoke test complete.');
  process.exit(process.exitCode || 0);
})();
