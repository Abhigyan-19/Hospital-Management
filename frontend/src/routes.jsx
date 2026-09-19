import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { AppLayout } from "./components/layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ComingSoon from "./pages/ComingSoon";
import Landing from "./pages/Landing";
import Patients from "./pages/Patients";
import Doctors from "./pages/Doctors";
import Appointments from "./pages/Appointments";
import Departments from "./pages/Departments";
import Prescriptions from "./pages/Prescriptions";

export function ProtectedRoute({ roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role))
    return <Navigate to="/dashboard" replace />;
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/patients"
          element={<Patients />}
        />
        <Route
          path="/doctors"
          element={<Doctors />}
        />
        <Route
          path="/appointments"
          element={<Appointments />}
        />
        <Route path="/departments" element={<Departments />} />
        <Route path="/prescriptions" element={<Prescriptions />} />
        <Route
          path="/reports"
          element={
            <ComingSoon
              title="Reports & Analytics"
              description="Reporting and data exports are coming in Phase 6."
            />
          }
        />
        <Route
          path="/settings"
          element={
            <ComingSoon
              title="Profile settings"
              description="Profile and password settings are planned for the application phase."
            />
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
