import { useEffect, useState } from 'react';
import { ArrowRight, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { doctorService } from '../api/doctorService';
import { isDemoMode } from '../api/demoAuth';
import { Button, Card, EmptyState, Skeleton } from '../components/ui';
import { PublicSite } from '../components/PublicSite';

export default function PublicDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDepartments = () => {
    setLoading(true);
    setError('');
    doctorService.listPublic()
      .then((doctors) => setDepartments([...new Set(doctors.map((doctor) => doctor.specialization).filter(Boolean))].sort()))
      .catch(() => setError(isDemoMode() || import.meta.env.VITE_USE_MOCK === 'true'
        ? 'The demo department list could not be loaded. Please try again.'
        : 'Backend not connected. Public departments are derived from the documented GET /doctors endpoint.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  return (
    <PublicSite>
      <main className="surface-pattern min-h-[70vh]">
        <div className="mx-auto max-w-7xl space-y-7 px-5 py-12 sm:px-8 sm:py-16">
          <div><p className="font-extrabold text-teal-700">Care services</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">Departments</h1><p className="mt-3 max-w-2xl leading-7 text-navy-700">Browse the specialties currently listed by the hospital.</p></div>
          {loading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <Card key={item}><Skeleton className="h-12 w-12" /><Skeleton className="mt-5 h-6 w-2/3" /></Card>)}</div>
            : error ? <Card role="alert"><p className="font-extrabold">{error}</p><Button className="mt-4" onClick={loadDepartments}>Try again</Button></Card>
              : departments.length === 0 ? <EmptyState title="No departments are listed">The hospital has not provided specialty information yet.</EmptyState>
                : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{departments.map((department) => (
                  <Card key={department}>
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-teal-100 text-teal-700" aria-hidden="true"><Building2 size={24} /></span>
                    <h2 className="mt-5 text-xl font-extrabold">{department}</h2>
                    <p className="mt-2 leading-7 text-navy-700">Explore doctors listed for this specialty and review the information available from the hospital.</p>
                    <Link to={`/care/departments/${encodeURIComponent(department)}`} className="mt-4 inline-flex min-h-11 items-center gap-2 font-extrabold text-teal-700">View department <ArrowRight size={18} aria-hidden="true" /></Link>
                  </Card>
                ))}</div>}
        </div>
      </main>
    </PublicSite>
  );
}
