import api from './axios';
import { mockDepartments } from '../mock/data';
import { mockDoctors } from '../mock/data';
import { isDemoMode } from './demoAuth';
import { demoCreateDepartment, demoListDepartments, demoListDoctors } from '../mock/demoStore';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';
let departments = [...mockDepartments];

export const departmentService = {
  list: () =>
    isDemoMode()
      ? Promise.resolve(demoListDepartments())
      : useMock
      ? Promise.resolve(departments)
      : api.get('/departments').then(({ data }) => data),
  listDoctors: (department) =>
    isDemoMode()
      ? Promise.resolve(demoListDoctors().filter((doctor) => doctor.specialization.toLowerCase() === department.toLowerCase()))
      : useMock
      ? Promise.resolve(mockDoctors.filter((doctor) => doctor.specialization.toLowerCase() === department.toLowerCase()))
      : api.get(`/departments/${encodeURIComponent(department)}/doctors`).then(({ data }) => data),
  create: (department) =>
    isDemoMode()
      ? Promise.resolve(demoCreateDepartment(department))
      : useMock
      ? Promise.resolve().then(() => {
          const created = { ...department, id: Date.now() };
          departments = [...departments, created];
          return created;
        })
      : api.post('/departments', department).then(({ data }) => data),
};
