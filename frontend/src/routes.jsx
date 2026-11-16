import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { AppLayout } from "./components/layout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import MyAppointments from "./pages/MyAppointments";
import EmergencyHelp from "./pages/EmergencyHelp";
import Landing from "./pages/Landing";
import Patients from "./pages/Patients";
import Doctors from "./pages/Doctors";
import Appointments from "./pages/Appointments";
import Departments from "./pages/Departments";
import Prescriptions from "./pages/Prescriptions";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Operations from "./pages/Operations";
import Beds from "./pages/Beds";
import FindDoctors from "./pages/FindDoctors";
import ClinicianProfile from "./pages/ClinicianProfile";
import ReceptionDesk from "./pages/ReceptionDesk";
import ReceptionBilling from "./pages/ReceptionBilling";
import ReceptionWards from "./pages/ReceptionWards";
import PublicDepartments from "./pages/PublicDepartments";
import PublicDepartment from "./pages/PublicDepartment";
import ResetPassword from "./pages/ResetPassword";
import AccountSecurity from "./pages/AccountSecurity";
import Unauthorized from "./pages/Unauthorized";
import AdminDoctorApprovals from "./pages/AdminDoctorApprovals";
import AdminUsers from "./pages/AdminUsers";
import AdminAuditLog from "./pages/AdminAuditLog";
import PatientRecords from "./pages/PatientRecords";
import PatientProfile from "./pages/PatientProfile";
import DoctorSchedule from "./pages/DoctorSchedule";
import DoctorAvailability from "./pages/DoctorAvailability";
import DoctorPatients from "./pages/DoctorPatients";
import DoctorPatientChart from "./pages/DoctorPatientChart";
import DoctorConsultation from "./pages/DoctorConsultation";
import DoctorProfile from "./pages/DoctorProfile";

export function ProtectedRoute({ roles }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles && !roles.includes(user.role))
    return <Navigate to="/unauthorized" replace />;
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

function RolePage({ roles, children }) {
  const { user } = useAuth();
  if (!roles.includes(user?.role))
    return <Navigate to="/unauthorized" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/find-a-doctor" element={<FindDoctors />} />
      <Route path="/doctors/:doctorId" element={<DoctorProfile />} />
      <Route path="/care/departments" element={<PublicDepartments />} />
      <Route path="/care/departments/:department" element={<PublicDepartment />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register/:role" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/account/security" element={<AccountSecurity />} />
        <Route path="/admin/doctor-approvals" element={<RolePage roles={["ADMIN"]}><AdminDoctorApprovals /></RolePage>} />
        <Route path="/admin/users" element={<RolePage roles={["ADMIN"]}><AdminUsers /></RolePage>} />
        <Route path="/admin/audit-log" element={<RolePage roles={["ADMIN"]}><AdminAuditLog /></RolePage>} />
        <Route path="/dashboard" element={<RolePage roles={["ADMIN"]}><Dashboard /></RolePage>} />
        <Route path="/doctor" element={<RolePage roles={["DOCTOR"]}><DoctorDashboard /></RolePage>} />
        <Route path="/doctor/schedule" element={<RolePage roles={["DOCTOR"]}><DoctorSchedule /></RolePage>} />
        <Route path="/doctor/availability" element={<RolePage roles={["DOCTOR"]}><DoctorAvailability /></RolePage>} />
        <Route path="/doctor/patients" element={<RolePage roles={["DOCTOR"]}><DoctorPatients /></RolePage>} />
        <Route path="/doctor/patients/:patientId" element={<RolePage roles={["DOCTOR"]}><DoctorPatientChart /></RolePage>} />
        <Route path="/doctor/consultation" element={<RolePage roles={["DOCTOR"]}><DoctorConsultation /></RolePage>} />
        <Route path="/doctor/consultation/:appointmentId" element={<RolePage roles={["DOCTOR"]}><DoctorConsultation /></RolePage>} />
        <Route path="/doctor/profile" element={<RolePage roles={["DOCTOR"]}><ClinicianProfile /></RolePage>} />
        <Route path="/patient" element={<RolePage roles={["PATIENT"]}><PatientDashboard /></RolePage>} />
        <Route path="/patient/dashboard" element={<RolePage roles={["PATIENT"]}><PatientDashboard /></RolePage>} />
        <Route path="/patient/book" element={<RolePage roles={["PATIENT"]}><MyAppointments /></RolePage>} />
        <Route path="/patient/records" element={<RolePage roles={["PATIENT"]}><PatientRecords type="history" /></RolePage>} />
        <Route path="/patient/labs" element={<RolePage roles={["PATIENT"]}><PatientRecords type="labs" /></RolePage>} />
        <Route path="/patient/billing" element={<RolePage roles={["PATIENT"]}><PatientRecords type="bills" /></RolePage>} />
        <Route path="/patient/profile" element={<RolePage roles={["PATIENT"]}><PatientProfile /></RolePage>} />
        <Route path="/reception/appointments" element={<RolePage roles={["RECEPTIONIST"]}><ReceptionDesk /></RolePage>} />
        <Route path="/reception/wards" element={<RolePage roles={["RECEPTIONIST"]}><ReceptionWards /></RolePage>} />
        <Route path="/reception/billing" element={<RolePage roles={["RECEPTIONIST"]}><ReceptionBilling /></RolePage>} />
        <Route path="/patients" element={<RolePage roles={["ADMIN"]}><Patients /></RolePage>} />
        <Route path="/doctors" element={<RolePage roles={["ADMIN"]}><Doctors /></RolePage>} />
        <Route path="/admin/staff" element={<RolePage roles={["ADMIN"]}><Doctors /></RolePage>} />
        <Route path="/appointments" element={<RolePage roles={["ADMIN"]}><Appointments /></RolePage>} />
        <Route path="/my-appointments" element={<RolePage roles={["PATIENT"]}><MyAppointments /></RolePage>} />
        <Route path="/departments" element={<RolePage roles={["ADMIN"]}><Departments /></RolePage>} />
        <Route path="/prescriptions" element={<RolePage roles={["ADMIN", "DOCTOR", "PATIENT"]}><Prescriptions /></RolePage>} />
        <Route path="/reports" element={<RolePage roles={["ADMIN"]}><Reports /></RolePage>} />
        <Route path="/billing" element={<RolePage roles={["ADMIN"]}><Operations type="billing" /></RolePage>} />
        <Route path="/beds" element={<RolePage roles={["ADMIN"]}><Beds /></RolePage>} />
        <Route path="/labs" element={<RolePage roles={["ADMIN"]}><Operations type="labs" /></RolePage>} />
        <Route path="/settings" element={<RolePage roles={["ADMIN"]}><Settings /></RolePage>} />
        <Route path="/urgent-help" element={<RolePage roles={["PATIENT"]}><EmergencyHelp /></RolePage>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
