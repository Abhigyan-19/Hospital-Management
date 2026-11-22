import api from './axios';
import { isDemoMode } from './demoAuth';
import {
    demoCreateAppointment,
    demoCreateStaffAppointment,
    demoCheckInAppointment,
    demoListAppointments,
    demoRescheduleAppointment,
    demoRescheduleStaffAppointment,
    demoUpdateAppointment,
} from '../mock/demoStore';

export const appointmentService = {

    list: () =>
        isDemoMode()
            ? Promise.resolve(demoListAppointments())
            : api.get('/appointments').then(({ data }) => data),

    queue: (doctorId) => {
        if (!isDemoMode()) {
            return api.get('/appointments/queue', { params: { doctorId } }).then(({ data }) => data);
        }

        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        const today = now.toISOString().slice(0, 10);
        const appointments = demoListAppointments()
            .filter((appointment) =>
                Number(appointment.doctor?.id) === Number(doctorId) &&
                appointment.date === today &&
                appointment.status === 'Checked In' &&
                appointment.checkedInAt,
            )
            .sort((left, right) =>
                left.checkedInAt.localeCompare(right.checkedInAt) || Number(left.id) - Number(right.id),
            );

        return Promise.resolve(appointments.map((appointment, index) => ({
            position: index + 1,
            appointment,
        })));
    },

    listMine: () =>
        isDemoMode()
            ? Promise.resolve(demoListAppointments())
            : api.get('/appointments/me').then(({ data }) => data),

    create: (appointment) =>
        isDemoMode()
            ? Promise.resolve(demoCreateStaffAppointment(appointment))
            : api.post('/appointments', appointment).then(({ data }) => data),

    createMine: (appointment) =>
        isDemoMode()
            ? Promise.resolve(demoCreateAppointment(appointment))
            : api.post('/appointments/me', appointment).then(({ data }) => data),

    cancelMine: (id) =>
        isDemoMode()
            ? Promise.resolve(demoUpdateAppointment(id, 'Cancelled'))
            : api.put(`/appointments/me/${id}/status`, null, { params: { status: 'Cancelled' } }).then(({ data }) => data),

    rescheduleMine: (id, changes) =>
        isDemoMode()
            ? Promise.resolve(demoRescheduleAppointment(id, changes))
            : api.patch(`/appointments/me/${id}/reschedule`, changes).then(({ data }) => data),

    checkIn: (id) =>
        isDemoMode()
            ? Promise.resolve(demoCheckInAppointment(id))
            : api.post(`/reception/appointments/${id}/check-in`).then(({ data }) => data),

    rescheduleForStaff: (id, changes) =>
        isDemoMode()
            ? Promise.resolve(demoRescheduleStaffAppointment(id, changes))
            : api.patch(`/reception/appointments/${id}/reschedule`, changes).then(({ data }) => data),

    approve: (id) =>
        isDemoMode()
            ? Promise.resolve(demoUpdateAppointment(id, 'Confirmed'))
            : api.post(`/reception/appointments/${id}/approve`).then(({ data }) => data),

    reject: (id, reason) =>
        isDemoMode()
            ? Promise.resolve(demoUpdateAppointment(id, 'Rejected'))
            : api.post(`/reception/appointments/${id}/reject`, { reason }).then(({ data }) => data),

    updateStatus: (id, status) =>
        isDemoMode()
            ? Promise.resolve(demoUpdateAppointment(id, status))
            : api.put(`/appointments/${id}/status`, null, { params: { status } }).then(({ data }) => data),
};