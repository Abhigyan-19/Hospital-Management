import api from './axios';

export const patientService = {
    list: () =>
        api.get('/patients').then(({ data }) => data),

    getById: (id) =>
        api.get(`/patients/${id}`).then(({ data }) => data),

    create: (patient) =>
        api.post('/patients', patient).then(({ data }) => data),

    remove: (id) =>
        api.delete(`/patients/${id}`),
};
