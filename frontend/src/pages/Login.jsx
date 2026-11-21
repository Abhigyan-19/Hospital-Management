import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authErrorMessage } from '../api/authService';
import { isDemoMode } from '../api/demoAuth';
import Logo from '../components/Logo';
import { Button, Card, Input } from '../components/ui';

const roles = [
  { value: 'PATIENT', label: 'Patient' },
  { value: 'DOCTOR', label: 'Doctor' },
  { value: 'ADMIN', label: 'Administrator' },
  { value: 'RECEPTIONIST', label: 'Receptionist' },
];

const demoAccounts = {
  PATIENT: 'patient@sebasethu.health',
  DOCTOR: 'doctor@sebasethu.health',
  ADMIN: 'admin@sebasethu.health',
  RECEPTIONIST: 'reception@sebasethu.health',
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({
    email: isDemoMode() ? demoAccounts.PATIENT : '',
    password: isDemoMode() ? 'demo123' : '',
    role: 'PATIENT',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      const user = await login(values);
      const destination = user.role === 'PATIENT' ? '/patient/dashboard' : user.role === 'DOCTOR' ? '/doctor/schedule' : user.role === 'RECEPTIONIST' ? '/reception/appointments' : '/dashboard';
      const requestedPath = location.state?.from?.pathname;
      navigate(requestedPath || destination, { replace: true });
    } catch (error) {
      const message = authErrorMessage(error, 'Sign-in could not be completed.');
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_.95fr]">
      <section className="hidden bg-navy-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Logo light />
        <div className="max-w-xl">
          <p className="mb-5 text-sm font-extrabold uppercase tracking-[.2em] text-teal-100">Care coordination, made clear</p>
          <h1 className="text-5xl font-black leading-tight">A calmer way to care for every patient.</h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-navy-100">Sign in to your patient, doctor, or hospital administrator workspace.</p>
        </div>
        <p className="text-sm text-navy-100">{isDemoMode() ? 'Sample workspaces for UI testing only.' : 'Your account type and permissions are verified by the hospital service.'}</p>
      </section>
      <section className="flex items-center justify-center bg-navy-50 p-5 sm:p-10">
        <Card className="w-full max-w-md p-7 sm:p-10">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <p className="text-sm font-extrabold uppercase tracking-widest text-teal-700">{isDemoMode() ? 'Demo portal' : 'Secure portal'}</p>
          <h2 className="mt-2 text-3xl font-black text-ink">Welcome back</h2>
          <p className="mt-2 text-navy-700">Sign in with the account type assigned to you.</p>
          {location.state?.sessionExpired && <p role="status" className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 font-bold text-amber-950">Your session ended. Please sign in again to continue.</p>}
          {location.state?.registrationMessage && <p role="status" className="mt-4 rounded-lg border border-teal-100 bg-teal-50 p-3 text-teal-900">{location.state.registrationMessage}</p>}
          {formError && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-900">{formError}</p>}
          <form onSubmit={submit} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block font-bold text-ink">I am signing in as</span>
              <select className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-4" value={values.role} onChange={(event) => setValues({ ...values, role: event.target.value, ...(isDemoMode() ? { email: demoAccounts[event.target.value], password: 'demo123' } : {}) })}>
                {roles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
              </select>
            </label>
            <Input label="Email address" type="email" autoComplete="email" required value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} />
            <Input label="Password" type="password" autoComplete="current-password" required value={values.password} onChange={(event) => setValues({ ...values, password: event.target.value })} />
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Signing in...' : <>Sign in <ArrowRight size={19} /></>}
            </Button>
          </form>
          {isDemoMode() ? (
            <div className="mt-7 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
              <div className="flex gap-3"><ShieldCheck className="shrink-0" size={20} /><p><strong>DEMO MODE — not for production.</strong> Password: <b>demo123</b>. Selecting a role fills its sample account; patient/doctor signups are saved in this browser.</p></div>
              <ul className="mt-3 grid gap-1 pl-4 sm:grid-cols-2">
                {roles.map((role) => <li key={role.value}><button type="button" className="text-left underline" onClick={() => setValues({ role: role.value, email: demoAccounts[role.value], password: 'demo123' })}>{role.label}: {demoAccounts[role.value]}</button></li>)}
              </ul>
              <p className="mt-2 text-xs">Demo accounts and any signup passwords are stored in browser local storage. Do not enter real patient information.</p>
            </div>
          ) : (
            <div className="mt-7 flex gap-3 rounded-xl bg-teal-50 p-4 text-sm text-teal-800">
              <ShieldCheck className="shrink-0" size={20} />
              <p>Access depends on the hospital authentication service. Administrator registration is restricted.</p>
            </div>
          )}
          <p className="mt-6 text-center text-sm text-navy-700">
            New patient? <Link className="font-extrabold text-teal-700" to="/register/patient">Create patient account</Link>
          </p>
          <p className="mt-2 text-center text-sm text-navy-700">
            Doctor? <Link className="font-extrabold text-teal-700" to="/register/doctor">Register your account</Link>
          </p>
          <p className="mt-2 text-center text-sm text-navy-700">
            <Link className="font-bold text-teal-700" to="/forgot-password">Forgot password?</Link>
          </p>
        </Card>
      </section>
    </main>
  );
}
