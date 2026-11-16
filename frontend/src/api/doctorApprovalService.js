import api from './axios';
import { demoListPendingDoctors, demoReviewDoctor, isDemoMode } from './demoAuth';

export const doctorApprovalService = {
  listPending: async () => {
    const doctors = isDemoMode()
      ? await demoListPendingDoctors()
      : (await api.get('/admin/doctors/pending')).data;
    if (!Array.isArray(doctors)) {
      throw new Error('The doctor approval service returned an invalid response.');
    }
    return doctors;
  },

  review: async (id, approvalStatus) => {
    const doctor = isDemoMode()
      ? await demoReviewDoctor(id, approvalStatus)
      : (await api.patch(`/admin/doctors/${id}/verification`, { approvalStatus })).data;
    if (doctor?.approvalStatus !== approvalStatus) {
      throw new Error('The doctor approval service did not confirm the requested decision.');
    }
    return doctor;
  },
};
