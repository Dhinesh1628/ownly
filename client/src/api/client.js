import axios from 'axios';

const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL;
  if (!url) return '/api';

  // Strip leading protocols
  url = url.replace(/^https?:\/\//, '');

  // If Render passed an internal service name like 'ownly-api-xxxx' without dots, append .onrender.com
  const hostPart = url.split('/')[0];
  if (!hostPart.includes('.')) {
    url = url.replace(hostPart, `${hostPart}.onrender.com`);
  }

  url = `https://${url}`;
  return url.endsWith('/api') ? url : `${url.replace(/\/$/, '')}/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      // Token invalid or expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
