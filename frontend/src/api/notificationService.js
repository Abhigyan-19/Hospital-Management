import api from './axios';

export const notificationService = {
  getRecentSms: () => api.get('/notifications/sms').then(({ data }) => data),
  getSmsForPatient: (patientId) => api.get(`/notifications/sms/patient/${patientId}`).then(({ data }) => data),
};

