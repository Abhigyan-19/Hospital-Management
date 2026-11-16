import api from './axios';
import { isDemoMode } from './demoAuth';
import {
  demoGetDoctorAvailability,
  demoGetDoctorPatientChart,
  demoGetDoctorProfile,
  demoListDoctorPatients,
  demoListDoctorSchedule,
  demoSaveDoctorConsultation,
  demoScheduleDoctorFollowUp,
  demoUpdateDoctorAvailability,
  demoUpdateDoctorProfile,
} from '../mock/demoStore';

export const doctorPortalService = {
  listSchedule: () =>
    isDemoMode()
      ? Promise.resolve(demoListDoctorSchedule())
      : api.get('/appointments/me').then(({ data }) => data),

  getAvailability: () =>
    isDemoMode()
      ? Promise.resolve(demoGetDoctorAvailability())
      : api.get('/doctors/me/availability').then(({ data }) => data),

  updateAvailability: (availability) =>
    isDemoMode()
      ? Promise.resolve(demoUpdateDoctorAvailability(availability))
      : api.patch('/doctors/me/availability', availability).then(({ data }) => data),

  listPatients: (search = '') =>
    isDemoMode()
      ? Promise.resolve(demoListDoctorPatients(search))
      : api.get('/doctors/me/patients', { params: { search } }).then(({ data }) => data),

  getPatientChart: (patientId) =>
    isDemoMode()
      ? Promise.resolve(demoGetDoctorPatientChart(patientId))
      : api.get(`/doctors/me/patients/${patientId}/chart`).then(({ data }) => data),

  saveConsultation: (appointmentId, consultation) =>
    isDemoMode()
      ? Promise.resolve(demoSaveDoctorConsultation(appointmentId, consultation))
      : api.post(`/doctors/me/appointments/${appointmentId}/consultation`, consultation).then(({ data }) => data),

  scheduleFollowUp: (appointmentId, slot) =>
    isDemoMode()
      ? Promise.resolve(demoScheduleDoctorFollowUp(appointmentId, slot))
      : api.post(`/doctors/me/appointments/${appointmentId}/follow-ups`, slot).then(({ data }) => data),

  getProfile: () =>
    isDemoMode()
      ? Promise.resolve(demoGetDoctorProfile())
      : api.get('/doctors/me/profile').then(({ data }) => data),

  updateProfile: (changes) =>
    isDemoMode()
      ? Promise.resolve(demoUpdateDoctorProfile(changes))
      : api.patch('/doctors/me/profile', changes).then(({ data }) => data),
};
