import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { doctorPortalService } from '../api/doctorPortalService';
import { apiErrorMessage } from '../api/errorMessage';
import { Button, Card, EmptyState, SearchBox } from '../components/ui';

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    doctorPortalService.listPatients(search)
      .then((data) => { if (active) setPatients(data); })
      .catch((requestError) => {
        const message = apiErrorMessage(requestError, 'Your assigned patient list is not available.');
        if (active) {
          setError(message);
          toast.error(message);
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [search]);

  return (
    <div className="mx-auto max-w-[1050px] space-y-6">
      <header><p className="font-bold text-teal-700">Clinician workspace</p><h2 className="mt-1 text-3xl font-black text-ink sm:text-4xl">My patients</h2><p className="mt-2 text-navy-700">Only patients from appointments assigned to your doctor account are listed.</p></header>
      <Card><SearchBox value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search patients by name or phone" /></Card>
      {error && <Card className="border-red-200 bg-red-50"><p className="font-bold text-danger">Patient list could not be loaded</p><p className="mt-1 text-navy-700">{error}</p></Card>}
      <Card>
        {loading ? <p className="text-navy-700">Loading your assigned patients...</p> : !error && !patients.length ? <EmptyState title={search ? 'No matching patients' : 'No assigned patients'}>{search ? 'Try another name or phone number.' : 'Patients from your appointments will appear here.'}</EmptyState> : (
          <div className="space-y-3">{patients.map((patient) => (
            <article key={patient.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy-100 p-4">
              <div><h3 className="font-extrabold">{patient.name}</h3><p className="mt-1 text-sm text-navy-700">{patient.age ? `${patient.age} years` : 'Age not provided'}{patient.gender ? ` · ${patient.gender}` : ''}{patient.phone ? ` · ${patient.phone}` : ''}</p></div>
              <Link to={`/doctor/patients/${patient.id}`}><Button variant="secondary">Open patient chart</Button></Link>
            </article>
          ))}</div>
        )}
      </Card>
    </div>
  );
}
