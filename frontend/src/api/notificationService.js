import api from './axios';
import { isDemoMode } from './demoAuth';
import { demoListNotifications } from '../mock/demoStore';

function isInternalPath(path) {
  return typeof path === 'string' && path.startsWith('/') && !path.startsWith('//');
}

export const notificationService = {
  getRecentSms: () => api.get('/notifications/sms').then(({ data }) => data),
  getSmsForPatient: (patientId) => api.get(`/notifications/sms/patient/${patientId}`).then(({ data }) => data),

  async listMine() {
    if (isDemoMode()) {
      return demoListNotifications();
    }
    try {
      const response = await api.get('/notifications/me');
      const notifications = response.data;
      if (!Array.isArray(notifications) || notifications.some((item) =>
        !item || item.id == null || typeof item.title !== 'string'
        || typeof item.message !== 'string' || !isInternalPath(item.href),
      )) {
        return [];
      }
      return notifications;
    } catch {
      return [];
    }
  },
};

export default notificationService;
