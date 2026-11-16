import api from './axios';

export const doctorService = {
    list: () =>
        api.get('/doctors').then(({ data }) => data),

    getById: (id) =>
        api.get(`/doctors/${id}`).then(({ data }) => data),

    create: (doctor) =>
        api.post('/doctors', doctor).then(({ data }) => data),

    remove: (id) =>
        api.delete(`/doctors/${id}`),
};
