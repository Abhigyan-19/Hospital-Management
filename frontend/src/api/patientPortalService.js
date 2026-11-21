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

  downloadInvoicePdf: (patientId, invoiceId, invoiceNumber) =>
    api.get(`/patients/me/linked/${patientId}/invoices/${invoiceId}/pdf`, { responseType: 'blob' }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${invoiceNumber || invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }),
};
