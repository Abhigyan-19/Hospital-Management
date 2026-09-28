import api from './axios';

export const prescriptionService = {
    list: () =>
        api.get('/prescriptions').then(({ data }) => data),

    create: (prescription) =>
        api.post('/prescriptions', prescription).then(({ data }) => data),
};