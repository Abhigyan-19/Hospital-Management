import api from './axios';
import { mockDoctors } from '../mock/data';
import { isDemoMode } from './demoAuth';
import { demoCreateDoctor, demoDeleteDoctor, demoListDoctors } from '../mock/demoStore';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

export const doctorService = {
    listPublic: () =>
        isDemoMode()
            ? Promise.resolve(demoListDoctors())
            : useMock
                ? Promise.resolve(mockDoctors)
                : api.get('/doctors').then(({ data }) => data),

    list: () =>
        doctorService.listPublic(),

    listByDepartment: (department) =>
        doctorService.list().then((doctors) =>
            doctors.filter((doctor) =>
                String(doctor.specialization || doctor.department?.name || '')
                    .trim()
                    .toLowerCase() === String(department || '').trim().toLowerCase(),
            ),
        ),

    getById: (id) =>
        isDemoMode()
            ? Promise.resolve(demoListDoctors().find((doctor) => Number(doctor.id) === Number(id)))
            : useMock
                ? Promise.resolve(
                mockDoctors.find(
                    (doctor) => doctor.id === Number(id)
                )
            )
            : api.get(`/doctors/${id}`).then(({ data }) => data),

    getPublicProfile: (id) => doctorService.getById(id),

    create: (doctor) =>
        isDemoMode()
            ? Promise.resolve(demoCreateDoctor(doctor))
            : useMock
                ? Promise.resolve({
                ...doctor,
                id: Date.now()
            })
            : api.post('/doctors', doctor).then(({ data }) => data),

    remove: (id) =>
        isDemoMode()
            ? Promise.resolve(demoDeleteDoctor(id))
            : useMock
                ? Promise.resolve()
            : api.delete(`/doctors/${id}`),
};