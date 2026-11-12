import api from './axios';
import { isDemoMode } from './demoAuth';
import { demoCreateUrgentRequest, demoListUrgentRequests } from '../mock/demoStore';

export const emergencyService = {
  submit: (request) =>
    isDemoMode()
      ? Promise.resolve(demoCreateUrgentRequest(request))
      : api.post('/urgent-help', request).then(({ data }) => data),

  listMine: () =>
    isDemoMode()
      ? Promise.resolve(demoListUrgentRequests())
      : api.get('/urgent-help/me').then(({ data }) => data),
};
