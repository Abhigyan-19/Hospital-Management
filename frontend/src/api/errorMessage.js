import { isDemoMode } from './demoAuth';

export function apiErrorMessage(error, fallback) {
  if (isDemoMode()) return error.message || fallback;
  if (error.response?.status === 404 || (error.isAxiosError && !error.response)) {
    return `Backend not connected. ${fallback}`;
  }
  return error.response?.data?.message || error.message || fallback;
}
