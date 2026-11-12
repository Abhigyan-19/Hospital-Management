import api from './axios';
import { apiErrorMessage } from './errorMessage';
import {
  demoChangePassword,
  demoLogin,
  demoPasswordReset,
  demoRegister,
  demoResetPassword,
  isDemoMode,
} from './demoAuth';

export const authErrorMessage = apiErrorMessage;

export const authService = {
  login: (credentials) =>
    isDemoMode()
      ? demoLogin(credentials)
      : api.post('/auth/login', credentials).then(({ data }) => data),

  register: (details) =>
    isDemoMode()
      ? demoRegister(details)
      : api.post('/auth/register', details).then(({ data }) => data),

  requestPasswordReset: (email) =>
    isDemoMode()
      ? demoPasswordReset(email)
      : api.post('/auth/forgot-password', { email }).then(({ data }) => data),

  resetPassword: (token, newPassword) =>
    isDemoMode()
      ? demoResetPassword(token, newPassword)
      : api.post('/auth/reset-password', { token, newPassword }).then(({ data }) => data),

  changePassword: (currentPassword, newPassword) =>
    isDemoMode()
      ? demoChangePassword({ currentPassword, newPassword })
      : api.post('/auth/change-password', { currentPassword, newPassword }).then(({ data }) => data),
};
