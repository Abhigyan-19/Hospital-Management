import { mockAppointments } from '../mock/data';

let appointments = [...mockAppointments];
export const appointmentService = {
  list: () => Promise.resolve(appointments),
  create: (appointment) => { const created = { ...appointment, id: Date.now(), status: 'Scheduled' }; appointments = [...appointments, created]; return Promise.resolve(created); },
  updateStatus: (id, status) => { appointments = appointments.map((appointment) => appointment.id === id ? { ...appointment, status } : appointment); return Promise.resolve(appointments.find((appointment) => appointment.id === id)); },
};
