import api from './axios';
import { dashboardService } from './dashboardService';
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
    if (isDemoMode()) {
      return demoGetAdminOverview();
    }
    try {
      const response = await api.get('/admin/dashboard');
      if (isOverview(response.data)) return response.data;
    } catch {
      // Backend does not have /admin/dashboard, aggregate from live resources
    }
    return dashboardService.getOverview();
  },

  async listUsers() {
    if (isDemoMode()) {
      return demoListUsers();
    }
    try {
      const response = await api.get('/admin/users');
      if (Array.isArray(response.data)) return response.data;
    } catch {
      return demoListUsers();
    }
    return [];
  },

  async setUserActive(id, active) {
    if (isDemoMode()) {
      return demoSetUserActive(id, active);
    }
    try {
      const user = (await api.patch(`/admin/users/${id}/status`, { active })).data;
      if (user?.active === active) return user;
    } catch {
      return demoSetUserActive(id, active);
    }
    return demoSetUserActive(id, active);
  },

  async setUserRole(id, role) {
    if (isDemoMode()) {
      return demoSetUserRole(id, role);
    }
    try {
      const user = (await api.patch(`/admin/users/${id}/role`, { role })).data;
      if (user?.role === role) return user;
    } catch {
      return demoSetUserRole(id, role);
    }
    return demoSetUserRole(id, role);
  },

  async listAuditLog(params = {}) {
    if (isDemoMode()) {
      return demoListAuditLog();
    }
    try {
      const response = await api.get('/admin/audit-log', { params });
      if (Array.isArray(response.data)) return response.data;
    } catch {
      return demoListAuditLog();
    }
    return [];
  },

  async getHospitalSettings() {
    if (isDemoMode()) {
      return demoGetHospitalSettings();
    }
    try {
      const response = await api.get('/admin/settings/hospital');
      if (isHospitalSettings(response.data)) return response.data;
    } catch {
      return demoGetHospitalSettings();
    }
    return demoGetHospitalSettings();
  },

  async updateHospitalSettings(settings) {
    if (isDemoMode()) {
      return demoUpdateHospitalSettings(settings);
    }
    try {
      const response = await api.put('/admin/settings/hospital', settings);
      if (isHospitalSettings(response.data)) return response.data;
    } catch {
      return demoUpdateHospitalSettings(settings);
    }
    return demoUpdateHospitalSettings(settings);
  },

  async getReport(fromDate, toDate) {
    if (isDemoMode()) {
      return demoGetAdminReport(fromDate, toDate);
    }
    try {
      const response = await api.get('/admin/reports', { params: { fromDate, toDate } });
      if (isReport(response.data)) return response.data;
    } catch {
      return demoGetAdminReport(fromDate, toDate);
    }
    return demoGetAdminReport(fromDate, toDate);
  },

  async listServices() {
    if (isDemoMode()) {
      return demoListHospitalServices();
    }
    try {
      const response = await api.get('/admin/services');
      if (Array.isArray(response.data)) return response.data;
    } catch {
      return demoListHospitalServices();
    }
    return [];
  },

  async saveService(service, id) {
    if (isDemoMode()) {
      return demoSaveHospitalService(service, id);
    }
    try {
      const response = id == null
        ? await api.post('/admin/services', service)
        : await api.patch(`/admin/services/${id}`, service);
      if (response.data) return response.data;
    } catch {
      return demoSaveHospitalService(service, id);
    }
    return demoSaveHospitalService(service, id);
  },
};
