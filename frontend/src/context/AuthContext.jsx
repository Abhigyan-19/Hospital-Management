import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';
import { setAccessToken } from '../api/axios';
import { getDemoUser, isDemoMode } from '../api/demoAuth';

const AuthContext = createContext(null);
const SESSION_IDLE_MS = 30 * 60 * 1000;
const SESSION_WARNING_MS = 25 * 60 * 1000;

function normalizeSession(response) {
  const user = response?.user;
  const role = String(user?.role || '').toUpperCase();
  if (!user?.id || !user?.email || !['ADMIN', 'DOCTOR', 'PATIENT', 'RECEPTIONIST'].includes(role)) {
    throw new Error('The authentication service returned an invalid user session.');
  }
  if (!response?.token) {
    throw new Error('The authentication service did not return an access token.');
  }
  if (role === 'DOCTOR' && user.approvalStatus !== 'APPROVED') {
    throw new Error(user.approvalStatus === 'PENDING'
      ? 'Your doctor account is pending verification by a hospital administrator.'
      : 'The hospital service could not confirm approval for this doctor account.');
  }
  return { user: { ...user, role }, token: response.token };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => isDemoMode() ? getDemoUser() : null);
  const navigate = useNavigate();

  useEffect(() => {
    const expireSession = () => {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('sebasethu-demo-session');
      navigate('/login', { replace: true, state: { sessionExpired: true } });
      toast.error('Your session expired. Please sign in again.');
    };
    window.addEventListener('hospital-auth-expired', expireSession);
    return () => window.removeEventListener('hospital-auth-expired', expireSession);
  }, [navigate]);

  useEffect(() => {
    if (!user) return undefined;
    let warningTimer;
    let expiryTimer;
    const resetTimers = () => {
      window.clearTimeout(warningTimer);
      window.clearTimeout(expiryTimer);
      toast.dismiss('session-timeout-warning');
      warningTimer = window.setTimeout(
        () => toast('You will be signed out in 5 minutes due to inactivity.', { id: 'session-timeout-warning' }),
        SESSION_WARNING_MS,
      );
      expiryTimer = window.setTimeout(() => {
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem('sebasethu-demo-session');
        navigate('/login', { replace: true, state: { sessionExpired: true } });
        toast.error('You were signed out after 30 minutes of inactivity.');
      }, SESSION_IDLE_MS);
    };
    const activityEvents = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach((eventName) => window.addEventListener(eventName, resetTimers, { passive: true }));
    resetTimers();
    return () => {
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, resetTimers));
      window.clearTimeout(warningTimer);
      window.clearTimeout(expiryTimer);
      toast.dismiss('session-timeout-warning');
    };
  }, [user, navigate]);

  const login = async (credentials) => {
    const response = normalizeSession(await authService.login(credentials));
    if (response.user.role !== credentials.role) {
      throw new Error('The selected account type does not match this account.');
    }
    setAccessToken(response.token);
    setUser(response.user);
    return response.user;
  };

  const register = async (details) => {
    const result = await authService.register(details);
    if (details.role === 'DOCTOR' && result?.status !== 'PENDING') {
      throw new Error('The registration service did not confirm that your doctor account is pending verification.');
    }
    return result;
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('sebasethu-demo-session');
    navigate('/login', { replace: true });
  };

  const value = useMemo(
    () => ({ user, login, register, logout }),
    [user, navigate],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
