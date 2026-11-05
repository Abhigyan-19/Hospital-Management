import api from './axios';

export const billService = {
  list: () => api.get('/bills').then(({ data }) => data),
  getByPatient: (patientId) => api.get(`/bills/patient/${patientId}`).then(({ data }) => data),
  create: (bill) => api.post('/bills', bill).then(({ data }) => data),
  updateStatus: (id, status) => api.patch(`/bills/${id}/status`, { status }).then(({ data }) => data),
};

