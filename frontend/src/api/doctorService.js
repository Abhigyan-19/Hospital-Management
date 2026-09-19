import api from './axios';
import { mockDoctors } from '../mock/data';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';
export const doctorService = {
  list: () => useMock ? Promise.resolve(mockDoctors) : api.get('/doctors').then(({ data }) => data),
  getById: (id) => useMock ? Promise.resolve(mockDoctors.find((doctor) => doctor.id === Number(id))) : api.get(`/doctors/${id}`).then(({ data }) => data),
  create: (doctor) => useMock ? Promise.resolve({ ...doctor, id: Date.now() }) : api.post('/doctors', doctor).then(({ data }) => data),
  remove: (id) => useMock ? Promise.resolve() : api.delete(`/doctors/${id}`),
};
