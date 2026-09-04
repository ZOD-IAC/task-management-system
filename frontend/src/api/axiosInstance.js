import axios from 'axios';

// withCredentials is required so the browser attaches/receives the
// httpOnly auth cookie on every request — without it, the cookie set
// by the backend on login/register is silently dropped.
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// A 401 here means the cookie is missing/expired — bounce to login
// rather than letting every feature handle that case individually.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
