import { mockDepartments } from '../mock/data';

let departments = [...mockDepartments];
export const departmentService = {
  list: () => Promise.resolve(departments),
  create: (department) => { const created = { ...department, id: Date.now() }; departments = [...departments, created]; return Promise.resolve(created); },
};
