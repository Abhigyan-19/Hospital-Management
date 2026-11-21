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

  async unreadCount() {
    const result = isDemoMode()
      ? { count: demoListNotifications().filter((item) => !item.read).length }
      : (await api.get('/notifications/me/unread-count')).data;
    if (!Number.isInteger(result?.count) || result.count < 0) {
      throw new Error('The notification service returned an invalid unread count.');
    }
    return result.count;
  },

  async markRead(id) {
    return isDemoMode()
      ? { id, read: true }
      : (await api.patch(`/notifications/me/${id}/read`)).data;
  },
};
