import api from './axios';
import { isDemoMode } from './demoAuth';
import { demoListNotifications } from '../mock/demoStore';

function isInternalPath(path) {
  return typeof path === 'string' && path.startsWith('/') && !path.startsWith('//');
}

export const notificationService = {
  async listMine() {
    const notifications = isDemoMode()
      ? demoListNotifications()
      : (await api.get('/notifications/me')).data;
    if (!Array.isArray(notifications) || notifications.some((item) =>
      !item || item.id == null || typeof item.title !== 'string'
      || typeof item.message !== 'string' || !isInternalPath(item.href),
    )) {
      throw new Error('The notification service returned an invalid response.');
    }
    return notifications;
  },
};
