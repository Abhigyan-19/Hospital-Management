import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Card } from '../components/ui';

function homeForRole(role) {
  if (role === 'PATIENT') return '/patient/dashboard';
  if (role === 'DOCTOR') return '/doctor/schedule';
  if (role === 'RECEPTIONIST') return '/reception/appointments';
  return '/dashboard';
}

export default function Unauthorized() {
  const { user } = useAuth();
  return (
    <div className="mx-auto grid min-h-[60vh] max-w-2xl place-items-center">
      <Card className="w-full text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-50 text-amber-800" aria-hidden="true"><ShieldAlert size={32} /></span>
        <h2 className="mt-5 text-3xl font-black text-ink">This page is not available to your account</h2>
        <p className="mt-3 leading-7 text-navy-700">Your role does not have permission to open this page. Your account information remains private.</p>
        <Link to={homeForRole(user?.role)} className="mt-6 inline-block"><Button>Return to your workspace</Button></Link>
      </Card>
    </div>
  );
}
