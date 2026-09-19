import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ComingSoon from './pages/ComingSoon';

export function ProtectedRoute({ roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <AppLayout><Outlet /></AppLayout>;
}

export default function AppRoutes() {
  return <Routes><Route path="/login" element={<Login />} /><Route element={<ProtectedRoute />}><Route path="/dashboard" element={<Dashboard />} /><Route path="/patients" element={<ComingSoon title="Patients" description="Patient records, search, forms and profiles are coming in Phase 4." />} /><Route path="/doctors" element={<ComingSoon title="Doctors & Staff" description="Doctor and staff management is coming in Phase 4." />} /><Route path="/appointments" element={<ComingSoon title="Appointments" description="Appointment scheduling and calendar views are coming in Phase 5." />} /><Route path="/reports" element={<ComingSoon title="Reports & Analytics" description="Reporting and data exports are coming in Phase 6." />} /><Route path="/settings" element={<ComingSoon title="Profile settings" description="Profile and password settings are planned for the application phase." />} /></Route><Route path="*" element={<Navigate to="/dashboard" replace />} /></Routes>;
}
