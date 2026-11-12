import api from './axios';
import {
  demoGetHospitalSettings,
  demoListAuditLog,
  demoListUsers,
  demoSetUserActive,
  demoSetUserRole,
  demoUpdateHospitalSettings,
  isDemoMode,
} from './demoAuth';
import {
  demoGetAdminOverview,
  demoGetAdminReport,
  demoListHospitalServices,
  demoSaveHospitalService,
} from '../mock/demoStore';

function isOverview(value) {
  return value && Array.isArray(value.stats) && Array.isArray(value.weeklyAppointments)
    && Array.isArray(value.departmentPatients) && Array.isArray(value.appointments);
}

function isReport(value) {
  return value && Array.isArray(value.registrations) && Array.isArray(value.appointmentStatuses)
    && Array.isArray(value.revenueByDepartment);
}

function isHospitalSettings(value) {
  return value && ['name', 'hours', 'contactPhone', 'emergencyPhone', 'address']
    .every((field) => typeof value[field] === 'string');
}

export const adminService = {
  async getOverview() {
    const overview = isDemoMode()
      ? demoGetAdminOverview()
      : (await api.get('/admin/dashboard')).data;
    if (!isOverview(overview)) throw new Error('The admin dashboard returned an invalid response.');
    return overview;
  },

  async listUsers() {
    const users = isDemoMode()
      ? await demoListUsers()
      : (await api.get('/admin/users')).data;
    if (!Array.isArray(users)) throw new Error('The user management service returned an invalid response.');
    return users;
  },

  async setUserActive(id, active) {
    const user = isDemoMode()
      ? await demoSetUserActive(id, active)
      : (await api.patch(`/admin/users/${id}/status`, { active })).data;
    if (user?.active !== active) throw new Error('The backend did not confirm the requested account status.');
    return user;
  },

  async setUserRole(id, role) {
    const user = isDemoMode()
      ? await demoSetUserRole(id, role)
      : (await api.patch(`/admin/users/${id}/role`, { role })).data;
    if (user?.role !== role) throw new Error('The backend did not confirm the requested account role.');
    return user;
  },

  async listAuditLog(params = {}) {
    const entries = isDemoMode()
      ? await demoListAuditLog()
      : (await api.get('/admin/audit-log', { params })).data;
    if (!Array.isArray(entries)) throw new Error('The audit log service returned an invalid response.');
    return entries;
  },

  async getHospitalSettings() {
    const settings = isDemoMode()
      ? await demoGetHospitalSettings()
      : (await api.get('/admin/settings/hospital')).data;
    if (!isHospitalSettings(settings)) throw new Error('Hospital settings returned an invalid response.');
    return settings;
  },

  async updateHospitalSettings(settings) {
    const saved = isDemoMode()
      ? await demoUpdateHospitalSettings(settings)
      : (await api.put('/admin/settings/hospital', settings)).data;
    if (!isHospitalSettings(saved) || saved.name !== settings.name) throw new Error('The backend did not confirm the hospital settings update.');
    return saved;
  },

  async getReport(fromDate, toDate) {
    const report = isDemoMode()
      ? demoGetAdminReport(fromDate, toDate)
      : (await api.get('/admin/reports', { params: { fromDate, toDate } })).data;
    if (!isReport(report)) throw new Error('The report service returned an invalid response.');
    return report;
  },

  async listServices() {
    const services = isDemoMode()
      ? demoListHospitalServices()
      : (await api.get('/admin/services')).data;
    if (!Array.isArray(services)) throw new Error('The hospital services service returned an invalid response.');
    return services;
  },

  async saveService(service, id) {
    const saved = isDemoMode()
      ? demoSaveHospitalService(service, id)
      : (id == null
        ? (await api.post('/admin/services', service)).data
        : (await api.patch(`/admin/services/${id}`, service)).data);
    if (!saved || Number(saved.price) !== Number(service.price)) {
      throw new Error('The backend did not confirm the hospital service price.');
    }
    return saved;
  },
};
