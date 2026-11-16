import { useEffect, useState } from 'react';
import { ArrowLeft, Stethoscope } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { doctorService } from '../api/doctorService';
import { isDemoMode } from '../api/demoAuth';
import { Button, Card, EmptyState, Skeleton } from '../components/ui';
import { PublicSite } from '../components/PublicSite';

export default function PublicDepartment() {
  const { department } = useParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const title = department || '';

  const loadDoctors = () => {
    setLoading(true);
    setError('');
    doctorService.listPublic()
      .then((items) => setDoctors(items.filter((doctor) => String(doctor.specialization || '').toLowerCase() === title.toLowerCase())))
      .catch(() => setError(isDemoMode() || import.meta.env.VITE_USE_MOCK === 'true'
        ? 'The demo department information could not be loaded. Please try again.'
        : 'Backend not connected. Department doctors are derived from the documented GET /doctors endpoint.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDoctors();
  }, [title]);

  return (
    <PublicSite>
      <main className="surface-pattern min-h-[70vh]">
        <div className="mx-auto max-w-5xl space-y-6 px-5 py-12 sm:px-8 sm:py-16">
          <Link to="/care/departments" className="inline-flex min-h-11 items-center gap-2 font-bold text-teal-700"><ArrowLeft size={18} aria-hidden="true" />All departments</Link>
          <div><p className="font-extrabold text-teal-700">Department</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">{title}</h1><p className="mt-3 leading-7 text-navy-700">Doctors currently listed for this specialty are shown below.</p></div>
          {loading ? <Card><Skeleton className="h-6 w-1/2" /></Card>
            : error ? <Card role="alert"><p className="font-extrabold">{error}</p><Button className="mt-4" onClick={loadDoctors}>Try again</Button></Card>
              : doctors.length === 0 ? <EmptyState title="No doctors listed for this department">The hospital has not connected provider details for this specialty yet.</EmptyState>
                : <div className="grid gap-4 sm:grid-cols-2">{doctors.map((doctor) => (
                  <Card key={doctor.id} className="flex items-center gap-4">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-teal-100 text-teal-700" aria-hidden="true"><Stethoscope size={26} /></span>
                    <div className="min-w-0"><h2 className="font-extrabold">{doctor.name}</h2><p className="mt-1 text-navy-700">{doctor.experience == null ? 'Experience not provided' : `${doctor.experience} years of experience`}</p><Link to={`/doctors/${doctor.id}`} className="mt-2 inline-flex min-h-11 items-center font-bold text-teal-700">View profile</Link></div>
                  </Card>
                ))}</div>}
        </div>
      </main>
    </PublicSite>
  );
}
