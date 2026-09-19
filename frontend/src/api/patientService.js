import api from './axios';
import { mockPatients } from '../mock/data';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';
export const patientService = {
  list: () => useMock ? Promise.resolve(mockPatients) : api.get('/patients').then(({ data }) => data),
  getById: (id) => useMock ? Promise.resolve(mockPatients.find((patient) => patient.id === Number(id))) : api.get(`/patients/${id}`).then(({ data }) => data),
  create: (patient) => useMock ? Promise.resolve({ ...patient, id: Date.now() }) : api.post('/patients', patient).then(({ data }) => data),
  remove: (id) => useMock ? Promise.resolve() : api.delete(`/patients/${id}`),
};
