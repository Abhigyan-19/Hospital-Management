import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import { doctorService } from '../api/doctorService';
import { isDemoMode } from '../api/demoAuth';
import { Button, Card, EmptyState, SearchBox, Skeleton } from '../components/ui';
import { PublicSite } from '../components/PublicSite';

function directoryError() {
  return isDemoMode() || import.meta.env.VITE_USE_MOCK === 'true'
    ? 'The demo doctor list could not be loaded. Please try again.'
    : 'Backend not connected. Doctor search needs the documented GET /doctors endpoint.';
}

export default function FindDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [availability, setAvailability] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDoctors = () => {
    setLoading(true);
    setError('');
    doctorService.listPublic()
      .then(setDoctors)
      .catch(() => setError(directoryError()))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const departments = useMemo(
    () => [...new Set(doctors.map((doctor) => doctor.specialization).filter(Boolean))].sort(),
    [doctors],
  );
  const availabilityDays = useMemo(
    () => [...new Set(doctors.flatMap((doctor) => (
      Array.isArray(doctor.availability)
        ? doctor.availability
        : typeof doctor.availability === 'string'
          ? [doctor.availability]
          : []
    )))].sort(),
    [doctors],
  );
  const filtered = useMemo(() => doctors.filter((doctor) => {
    const text = `${doctor.name || ''} ${doctor.specialization || ''}`.toLowerCase();
    const hasSchedule = Boolean(doctor.availability?.length || doctor.timings);
    const listedDays = Array.isArray(doctor.availability)
      ? doctor.availability
      : typeof doctor.availability === 'string'
        ? [doctor.availability]
        : [];
    return text.includes(search.trim().toLowerCase())
      && (!department || doctor.specialization === department)
      && (availability === 'all'
        || (availability === 'missing' ? !hasSchedule : listedDays.includes(availability)));
  }), [doctors, search, department, availability]);

  return (
    <PublicSite>
      <main className="surface-pattern min-h-[70vh]">
        <div className="mx-auto max-w-7xl space-y-7 px-5 py-12 sm:px-8 sm:py-16">
          <div>
            <p className="font-extrabold text-teal-700">Find care</p>
            <h1 className="mt-2 text-3xl font-black text-ink sm:text-4xl">Find a doctor</h1>
            <p className="mt-3 max-w-2xl leading-7 text-navy-700">Search by doctor name or department. Profile details are shown only when supplied by the hospital.</p>
          </div>

          <Card>
            <div className="grid gap-4 md:grid-cols-[1.4fr_1fr_1fr]">
              <SearchBox value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by doctor or specialty" />
              <label className="block">
                <span className="sr-only">Filter by department</span>
                <select className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-4" value={department} onChange={(event) => setDepartment(event.target.value)}>
                  <option value="">All departments</option>
                  {departments.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="sr-only">Filter by availability</span>
                <select className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-4" value={availability} onChange={(event) => setAvailability(event.target.value)}>
                  <option value="all">Any availability</option>
                  {availabilityDays.map((day) => <option key={day} value={day}>{day}</option>)}
                  <option value="missing">Schedule not provided</option>
                </select>
              </label>
            </div>
            {!isDemoMode() && import.meta.env.VITE_USE_MOCK !== 'true' && doctors.length > 0 && !doctors.some((doctor) => doctor.availability?.length) && (
              <p className="mt-4 rounded-lg bg-amber-50 p-3 text-amber-950">The backend does not provide appointment availability yet. Confirm actual appointment slots through the patient portal.</p>
            )}
          </Card>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading doctors">
              {[1, 2, 3].map((item) => <Card key={item}><Skeleton className="h-14 w-14 rounded-full" /><Skeleton className="mt-5 h-6 w-2/3" /><Skeleton className="mt-3 h-4 w-1/2" /></Card>)}
            </div>
          ) : error ? (
            <Card role="alert">
              <p className="font-extrabold text-ink">{error}</p>
              <Button className="mt-4" onClick={loadDoctors}>Try again</Button>
            </Card>
          ) : filtered.length === 0 ? (
            <EmptyState title="No doctors match these filters">Try another name, department, or schedule filter.</EmptyState>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((doctor) => (
                <Card key={doctor.id} className="flex h-full flex-col">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-teal-100 text-teal-700" aria-hidden="true"><Stethoscope size={26} /></span>
                  <h2 className="mt-5 text-xl font-extrabold">{doctor.name}</h2>
                  <p className="mt-1 font-bold text-teal-700">{doctor.specialization || 'Department not provided'}</p>
                  <p className="mt-3 text-navy-700">{doctor.experience == null ? 'Experience not provided' : `${doctor.experience} years of experience`}</p>
                  <p className="mt-2 text-sm text-navy-700">{doctor.availability?.length || doctor.timings ? 'Schedule information provided' : 'Schedule information not provided'}</p>
                  <Link to={`/doctors/${doctor.id}`} className="mt-5 inline-flex min-h-11 items-center gap-2 font-extrabold text-teal-700">
                    View doctor profile <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </PublicSite>
  );
}
