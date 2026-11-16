import api from './axios';

export const departmentService = {
  list: () => api.get('/departments').then(({ data }) => data),
  create: (department) => api.post('/departments', department).then(({ data }) => data),
  remove: (id) => api.delete(`/departments/${id}`),
};
