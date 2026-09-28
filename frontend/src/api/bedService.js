import api from "./axios";

export const bedService = {
  listBeds: () => api.get("/beds").then(({ data }) => data),
  listWards: () => api.get("/wards").then(({ data }) => data),
  listPatients: () => api.get("/patients").then(({ data }) => data),
  createBed: (bed) => api.post("/beds", bed).then(({ data }) => data),
  createWard: (ward) => api.post("/wards", ward).then(({ data }) => data),
  assignPatient: (bedId, patientId) =>
    api.patch(`/beds/${bedId}/assign`, { patientId }).then(({ data }) => data),
  releaseBed: (bedId) =>
    api.patch(`/beds/${bedId}/release`).then(({ data }) => data),
  updateStatus: (bedId, status) =>
    api.patch(`/beds/${bedId}/status`, { status }).then(({ data }) => data),
  removeBed: (bedId) => api.delete(`/beds/${bedId}`),
  removeWard: (wardId) => api.delete(`/wards/${wardId}`),
};
