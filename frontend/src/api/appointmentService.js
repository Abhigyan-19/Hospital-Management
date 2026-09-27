import api from './axios';

export const appointmentService = {

    list: () =>
        api.get('/appointments')
            .then(({ data }) => data),

    create: (appointment) =>
        api.post('/appointments', appointment)
            .then(({ data }) => data),

    updateStatus: (id, status) =>
        api.put(`/appointments/${id}/status`, null, {
            params: { status }
        })
            .then(({ data }) => data),
};