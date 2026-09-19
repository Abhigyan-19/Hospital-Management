import { mockPrescriptions } from '../mock/data';

let prescriptions = [...mockPrescriptions];
export const prescriptionService = {
  list: () => Promise.resolve(prescriptions),
  create: (prescription) => { const created = { ...prescription, id: Date.now(), createdAt: new Date().toISOString().slice(0, 10) }; prescriptions = [created, ...prescriptions]; return Promise.resolve(created); },
};
