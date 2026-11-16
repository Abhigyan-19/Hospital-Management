import api from './axios';
import { isDemoMode } from './demoAuth';
import { demoCreatePrescription, demoListPrescriptions, demoUpdatePrescription } from '../mock/demoStore';

export const prescriptionService = {
    list: () =>
        isDemoMode()
            ? Promise.resolve(demoListPrescriptions())
            : api.get('/prescriptions').then(({ data }) => data),

    listMine: () =>
        isDemoMode()
            ? Promise.resolve(demoListPrescriptions())
            : api.get('/prescriptions/me').then(({ data }) => data),

    create: (prescription) =>
        isDemoMode()
            ? Promise.resolve(demoCreatePrescription(prescription))
            : api.post('/prescriptions', prescription).then(({ data }) => data),

    update: (id, prescription) =>
        isDemoMode()
            ? Promise.resolve(demoUpdatePrescription(id, prescription))
            : api.put(`/prescriptions/${id}`, prescription).then(({ data }) => data),
};