import api from './axios';
import { mockPatients } from '../mock/data';
import { isDemoMode } from './demoAuth';
import {
    demoAddLinkedPatient,
    demoCreatePatient,
    demoDeletePatient,
    demoGetLinkedPatients,
    demoListPatients,
} from '../mock/demoStore';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

export const patientService = {
    list: () =>
        isDemoMode()
            ? Promise.resolve(demoListPatients())
            : useMock
                ? Promise.resolve(mockPatients)
            : api.get('/patients').then(({ data }) => data),

    getById: (id) =>
        isDemoMode()
            ? Promise.resolve(demoListPatients().find((patient) => Number(patient.id) === Number(id)))
            : useMock
                ? Promise.resolve(
                mockPatients.find(
                    (patient) => patient.id === Number(id)
                )
            )
            : api.get(`/patients/${id}`).then(({ data }) => data),

    listLinked: () =>
        isDemoMode()
            ? Promise.resolve(demoGetLinkedPatients())
            : api.get('/patients/me/linked').then(({ data }) => data),

    addLinked: (profile) =>
        isDemoMode()
            ? Promise.resolve(demoAddLinkedPatient(profile))
            : api.post('/patients/me/linked', profile).then(({ data }) => data),

    create: (patient) =>
        isDemoMode()
            ? Promise.resolve(demoCreatePatient(patient))
            : useMock
                ? Promise.resolve({ ...patient, id: Date.now() })
            : api.post('/patients', patient).then(({ data }) => data),

    remove: (id) =>
        isDemoMode()
            ? Promise.resolve(demoDeletePatient(id))
            : useMock
                ? Promise.resolve()
            : api.delete(`/patients/${id}`),
};