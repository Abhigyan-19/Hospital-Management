import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080' });
let accessToken = null;
let refreshToken = localStorage.getItem('sebasethu-refresh-token') || null;

export function setAccessToken(token) {
  accessToken = token;
}

export function setRefreshToken(token) {
  refreshToken = token;
  if (token) {
    localStorage.setItem('sebasethu-refresh-token', token);
  } else {
    localStorage.removeItem('sebasethu-refresh-token');
  }
}

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isPublicAuthRequest = /^\/auth\/(login|register|forgot-password|reset-password|refresh)/.test(originalRequest?.url || '');

    if (error.response?.status === 401 && !originalRequest._retry && !isPublicAuthRequest && refreshToken) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/auth/refresh`,
          { refreshToken }
        );
        const newAccessToken = data.token;
        const newRefreshToken = data.refreshToken;
        setAccessToken(newAccessToken);
        if (newRefreshToken) setRefreshToken(newRefreshToken);
        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        accessToken = null;
        setRefreshToken(null);
        window.dispatchEvent(new Event('hospital-auth-expired'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 401 && accessToken && !isPublicAuthRequest) {
      accessToken = null;
      setRefreshToken(null);
      window.dispatchEvent(new Event('hospital-auth-expired'));
    }
    return Promise.reject(error);
  },
);

export default api;
