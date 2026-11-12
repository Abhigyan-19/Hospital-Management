import { useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, Clock3, Stethoscope } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { doctorService } from '../api/doctorService';
import { isDemoMode } from '../api/demoAuth';
import { Button, Card, EmptyState, Skeleton } from '../components/ui';
import { PublicSite } from '../components/PublicSite';
import { useAuth } from '../context/AuthContext';

function missingValue() {
  return isDemoMode() || import.meta.env.VITE_USE_MOCK === 'true'
    ? 'Not included in this demo profile'
    : 'Not provided by the connected backend';
}

export default function DoctorProfile() {
  const { doctorId } = useParams();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    doctorService.getPublicProfile(doctorId)
      .then((record) => {
        if (!record) setError('This doctor profile was not found.');
        else setDoctor(record);
      })
      .catch(() => setError(isDemoMode() || import.meta.env.VITE_USE_MOCK === 'true'
        ? 'The doctor profile could not be loaded. Please try again.'
        : 'Backend not connected. Doctor profiles need the documented GET /doctors/{id} endpoint.'))
      .finally(() => setLoading(false));
  }, [doctorId]);

  const bookLink = user?.role === 'PATIENT' ? '/patient/book' : '/login';

  return (
    <PublicSite>
      <main className="surface-pattern min-h-[70vh]">
        <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
          <Link to="/find-a-doctor" className="inline-flex min-h-11 items-center gap-2 font-bold text-teal-700"><ArrowLeft size={18} aria-hidden="true" />Back to doctor search</Link>
          {loading ? (
            <Card className="mt-6"><Skeleton className="h-16 w-16 rounded-2xl" /><Skeleton className="mt-5 h-7 w-1/2" /><Skeleton className="mt-3 h-4 w-1/3" /></Card>
          ) : error ? (
            <div className="mt-6"><EmptyState title="Profile unavailable">{error}</EmptyState>{!error.includes('not found') && <Button className="mt-4" onClick={() => window.location.reload()}>Try again</Button>}</div>
          ) : doctor && (
            <Card className="mt-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-teal-100 text-teal-700" aria-hidden="true"><Stethoscope size={34} /></span>
                <div>
                  <p className="font-bold text-teal-700">{doctor.specialization || 'Specialty not provided'}</p>
                  <h1 className="mt-1 text-3xl font-black">{doctor.name}</h1>
                </div>
              </div>
              <dl className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-navy-50 p-4"><dt className="font-bold text-navy-700">Qualification</dt><dd className="mt-1 font-extrabold">{doctor.qualification || missingValue()}</dd></div>
                <div className="rounded-xl bg-navy-50 p-4"><dt className="font-bold text-navy-700">Clinical experience</dt><dd className="mt-1 font-extrabold">{doctor.experience == null ? missingValue() : `${doctor.experience} years`}</dd></div>
                <div className="rounded-xl bg-navy-50 p-4"><dt className="flex items-center gap-2 font-bold text-navy-700"><Clock3 size={18} aria-hidden="true" />Clinic timings</dt><dd className="mt-1 font-extrabold">{doctor.timings || (doctor.availability?.length ? doctor.availability.join(', ') : missingValue())}</dd></div>
                <div className="rounded-xl bg-navy-50 p-4"><dt className="font-bold text-navy-700">Consultation fee</dt><dd className="mt-1 font-extrabold">{doctor.consultationFee == null ? missingValue() : `₹${Number(doctor.consultationFee).toLocaleString('en-IN')}`}</dd></div>
              </dl>
              <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950">
                {isDemoMode() || import.meta.env.VITE_USE_MOCK === 'true'
                  ? 'Demo profile details are examples only. Confirm all information with the hospital before visiting.'
                  : 'Only information returned by the hospital service is shown. Missing qualification, schedule, or fee details are not yet connected.'}
              </p>
              <Link to={bookLink} className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-teal-600 px-5 font-bold text-white hover:bg-teal-700"><CalendarDays size={18} aria-hidden="true" />{user?.role === 'PATIENT' ? 'Book an appointment' : 'Sign in to book an appointment'}</Link>
            </Card>
          )}
        </div>
      </main>
    </PublicSite>
  );
}
