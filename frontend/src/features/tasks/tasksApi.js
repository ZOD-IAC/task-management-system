import axiosInstance from '../../api/axiosInstance';

export const fetchTasks = (params) =>
  axiosInstance.get('/tasks', { params }).then((res) => res.data);

export const fetchTask = (id) =>
  axiosInstance.get(`/tasks/${id}`).then((res) => res.data);

export const createTask = (payload) =>
  axiosInstance.post('/tasks', payload).then((res) => res.data);

export const updateTask = (id, payload) =>
  axiosInstance.patch(`/tasks/${id}`, payload).then((res) => res.data);

export const deleteTask = (id) =>
  axiosInstance.delete(`/tasks/${id}`).then((res) => res.data);

export const fetchDashboardStats = () =>
  axiosInstance.get('/tasks/dashboard').then((res) => res.data);
