import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080' });
let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isPublicAuthRequest = /^\/auth\/(login|register|forgot-password|reset-password)/.test(error.config?.url || '');
    if (error.response?.status === 401 && accessToken && !isPublicAuthRequest) {
      accessToken = null;
      window.dispatchEvent(new Event('hospital-auth-expired'));
    }
    return Promise.reject(error);
  },
);

export default api;
