import api from "./axios";
import { isDemoMode } from "./demoAuth";
import {
  demoAssignPatient,
  demoCreateBed,
  demoCreateWard,
  demoListBeds,
  demoListPatients,
  demoListWards,
  demoReleaseBed,
  demoRemoveBed,
  demoRemoveWard,
  demoUpdateBedStatus,
} from "../mock/demoStore";

export const bedService = {
  listBeds: () => isDemoMode() ? Promise.resolve(demoListBeds()) : api.get("/beds").then(({ data }) => data),
  listWards: () => isDemoMode() ? Promise.resolve(demoListWards()) : api.get("/wards").then(({ data }) => data),
  listPatients: () => isDemoMode() ? Promise.resolve(demoListPatients()) : api.get("/patients").then(({ data }) => data),
  createBed: (bed) => isDemoMode() ? Promise.resolve(demoCreateBed(bed)) : api.post("/beds", bed).then(({ data }) => data),
  createWard: (ward) => isDemoMode() ? Promise.resolve(demoCreateWard(ward)) : api.post("/wards", ward).then(({ data }) => data),
  assignPatient: (bedId, patientId) =>
    isDemoMode() ? Promise.resolve(demoAssignPatient(bedId, patientId)) : api.patch(`/beds/${bedId}/assign`, { patientId }).then(({ data }) => data),
  releaseBed: (bedId) =>
    isDemoMode() ? Promise.resolve(demoReleaseBed(bedId)) : api.patch(`/beds/${bedId}/release`).then(({ data }) => data),
  updateStatus: (bedId, status) =>
    isDemoMode() ? Promise.resolve(demoUpdateBedStatus(bedId, status)) : api.patch(`/beds/${bedId}/status`, { status }).then(({ data }) => data),
  removeBed: (bedId) => isDemoMode() ? Promise.resolve(demoRemoveBed(bedId)) : api.delete(`/beds/${bedId}`),
  removeWard: (wardId) => isDemoMode() ? Promise.resolve(demoRemoveWard(wardId)) : api.delete(`/wards/${wardId}`),
};
