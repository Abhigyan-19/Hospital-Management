import api from './axios';
import { isDemoMode } from './demoAuth';
import {
  demoGetPatientProfile,
  demoListInvoices,
  demoListLabReports,
  demoListMedicalHistory,
  demoUpdatePatientProfile,
} from '../mock/demoStore';

export const patientPortalService = {
  getProfile: (patientId) =>
    isDemoMode()
      ? Promise.resolve(demoGetPatientProfile(patientId))
      : api.get(`/patients/me/linked/${patientId}`).then(({ data }) => data),

  updateProfile: (patientId, changes) =>
    isDemoMode()
      ? Promise.resolve(demoUpdatePatientProfile(patientId, changes))
      : api.patch(`/patients/me/linked/${patientId}`, changes).then(({ data }) => data),

  listMedicalHistory: (patientId) =>
    isDemoMode()
      ? Promise.resolve(demoListMedicalHistory(patientId))
      : api.get(`/patients/me/linked/${patientId}/history`).then(({ data }) => data),

  listLabReports: (patientId) =>
    isDemoMode()
      ? Promise.resolve(demoListLabReports(patientId))
      : api.get(`/patients/me/linked/${patientId}/lab-reports`).then(({ data }) => data),

  listInvoices: (patientId) =>
    isDemoMode()
      ? Promise.resolve(demoListInvoices(patientId))
      : api.get(`/patients/me/linked/${patientId}/invoices`).then(({ data }) => data),
};
