import { useEffect, useMemo, useState } from 'react';
import { Eye, Plus, Trash2, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { patientService } from '../api/patientService';
import { apiErrorMessage } from '../api/errorMessage';
import { Button, Card, ConfirmDialog, EmptyState, Input, Modal, SearchBox, Skeleton } from '../components/ui';

const emptyPatient = { name: '', age: '', gender: '', phone: '' };
const pageSize = 5;

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [form, setForm] = useState(emptyPatient);

  const loadPatients = () => {
    setLoading(true);
    setError('');
    patientService.list()
      .then(setPatients)
      .catch((requestError) => {
        const message = apiErrorMessage(requestError, 'Patient records could not be loaded.');
        setError(message);
        toast.error(message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPatients(); }, []);

  const filtered = useMemo(() => patients.filter((patient) =>
    `${patient.id} ${patient.name} ${patient.phone} ${patient.gender}`.toLowerCase().includes(search.trim().toLowerCase()),
  ), [patients, search]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { setPage((current) => Math.min(current, pageCount)); }, [pageCount]);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.age || !form.gender.trim() || !form.phone.trim()) {
      toast.error('Please complete all patient fields.');
      return;
    }
    if (!/^[0-9+()\-\s]{7,15}$/.test(form.phone.trim())) {
      toast.error('Please enter a valid phone number.');
      return;
    }
    setSaving(true);
    try {
      const created = await patientService.create({ ...form, name: form.name.trim(), age: Number(form.age) });
      setPatients((current) => [...current, created]);
      setForm(emptyPatient);
      setFormOpen(false);
      setPage(1);
      toast.success('Patient added successfully.');
    } catch (requestError) {
      toast.error(apiErrorMessage(requestError, 'The patient record could not be saved.'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!patientToDelete) return;
    setSaving(true);
    try {
      await patientService.remove(patientToDelete.id);
      setPatients((current) => current.filter((patient) => Number(patient.id) !== Number(patientToDelete.id)));
      setPatientToDelete(null);
      toast.success('Patient deleted.');
    } catch (requestError) {
      const message = apiErrorMessage(requestError, 'The patient record was not deleted.');
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="font-bold text-teal-700">Patient records</p><h2 className="mt-1 text-3xl font-black text-ink sm:text-4xl">Patients</h2><p className="mt-2 text-navy-700">Search by patient ID, name, or phone; review and manage records.</p></div><Button onClick={() => setFormOpen(true)}><Plus size={19} aria-hidden="true" />Add patient</Button></header>
      {error && <div role="alert"><Card className="border-red-200 bg-red-50"><p className="font-bold text-danger">{error}</p><Button variant="secondary" className="mt-4" onClick={loadPatients} disabled={loading}>Try again</Button></Card></div>}
      <Card><div className="flex flex-col justify-between gap-4 border-b border-navy-100 pb-5 sm:flex-row sm:items-center"><div><h3 className="text-xl font-extrabold">Patient directory</h3><p className="mt-1 text-sm text-navy-700">{loading ? 'Loading records…' : `${filtered.length} records found`}</p></div><div className="w-full sm:max-w-xs"><SearchBox value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Patient ID, name or phone" /></div></div>
        {loading ? <div className="space-y-3 py-6">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-14 w-full" />)}</div> : !error && !filtered.length ? <div className="py-8"><EmptyState title="No patients found">Try another search or add a new patient record.</EmptyState></div> : !error && <>
          <div className="responsive-table mt-5 hidden overflow-x-auto md:block"><table className="w-full text-left"><thead><tr className="border-b border-navy-100 text-sm text-navy-500"><th className="px-3 py-3">Patient</th><th className="px-3 py-3">Age</th><th className="px-3 py-3">Gender</th><th className="px-3 py-3">Phone</th><th className="px-3 py-3 text-right">Actions</th></tr></thead><tbody>{visible.map((patient) => <tr key={patient.id} className="border-b border-navy-100 last:border-0"><td data-label="Patient" className="px-3 py-4 font-extrabold">{patient.name}<span className="ml-2 text-xs font-bold text-navy-500">#{patient.id}</span></td><td data-label="Age" className="px-3 py-4">{patient.age}</td><td data-label="Gender" className="px-3 py-4">{patient.gender}</td><td data-label="Phone" className="px-3 py-4">{patient.phone}</td><td data-label="Actions" className="px-3 py-4"><div className="flex justify-end gap-2"><Button variant="ghost" className="px-3" onClick={() => setSelected(patient)}><Eye size={18} aria-hidden="true" />View</Button><Button variant="ghost" className="px-3 text-danger" onClick={() => setPatientToDelete(patient)}><Trash2 size={18} aria-hidden="true" />Delete</Button></div></td></tr>)}</tbody></table></div>
          <div className="mt-5 space-y-3 md:hidden">{visible.map((patient) => <article key={patient.id} className="rounded-xl border border-navy-100 p-4"><div className="flex items-start justify-between"><div><p className="font-extrabold">{patient.name}</p><p className="mt-1 text-sm text-navy-700">#{patient.id} · {patient.age} years · {patient.gender}</p></div><UserRound className="text-teal-600" size={22} aria-hidden="true" /></div><p className="mt-3 font-bold text-navy-700">{patient.phone}</p><div className="mt-3 flex gap-2"><Button variant="secondary" className="flex-1 px-3" onClick={() => setSelected(patient)}><Eye size={17} aria-hidden="true" />View</Button><Button variant="ghost" className="px-3 text-danger" onClick={() => setPatientToDelete(patient)}><Trash2 size={17} aria-hidden="true" />Delete</Button></div></article>)}</div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-navy-100 pt-4"><p className="text-sm font-bold text-navy-700">Page {page} of {pageCount}</p><div className="flex gap-2"><Button variant="secondary" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button><Button variant="secondary" disabled={page >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>Next</Button></div></div>
        </>}
      </Card>
      <Modal open={formOpen} title="Add patient" onClose={() => !saving && setFormOpen(false)}><form onSubmit={submit} className="space-y-4"><Input label="Full name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Enter patient name" /><div className="grid gap-4 sm:grid-cols-2"><Input label="Age" type="number" min="1" required value={form.age} onChange={(event) => setForm({ ...form, age: event.target.value })} placeholder="Age" /><Input label="Gender" required value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })} placeholder="Female, Male or Other" /></div><Input label="Phone number" type="tel" required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Enter phone number" /><Button type="submit" className="w-full" disabled={saving}>{saving ? 'Saving…' : 'Save patient'}</Button></form></Modal>
      <Modal open={Boolean(selected)} title="Patient details" onClose={() => setSelected(null)}>{selected && <div className="space-y-4"><div className="rounded-xl bg-teal-50 p-4"><p className="text-xl font-extrabold">{selected.name}</p><p className="mt-1 text-teal-700">Patient #{selected.id}</p></div><dl className="grid grid-cols-2 gap-4"><div><dt className="text-sm font-bold text-navy-500">Age</dt><dd className="mt-1 font-extrabold">{selected.age} years</dd></div><div><dt className="text-sm font-bold text-navy-500">Gender</dt><dd className="mt-1 font-extrabold">{selected.gender}</dd></div><div className="col-span-2"><dt className="text-sm font-bold text-navy-500">Phone</dt><dd className="mt-1 font-extrabold">{selected.phone}</dd></div></dl></div>}</Modal>
      <ConfirmDialog open={Boolean(patientToDelete)} title="Delete patient record?" message={patientToDelete ? `Are you sure you want to delete ${patientToDelete.name}? This action cannot be undone.` : ''} confirmDisabled={saving} onClose={() => !saving && setPatientToDelete(null)} onConfirm={remove} />
    </div>
  );
}
