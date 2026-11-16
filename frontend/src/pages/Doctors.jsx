import { useEffect, useMemo, useState } from 'react';
import { Eye, Plus, Stethoscope, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiErrorMessage } from '../api/errorMessage';
import { doctorService } from '../api/doctorService';
import { Button, Card, ConfirmDialog, EmptyState, Input, Modal, SearchBox, Skeleton } from '../components/ui';

const emptyDoctor = { name: '', specialization: '', experience: '' };
const pageSize = 6;

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [form, setForm] = useState(emptyDoctor);

  const loadDoctors = () => {
    setLoading(true);
    setError('');
    doctorService.list()
      .then(setDoctors)
      .catch((requestError) => {
        const message = apiErrorMessage(requestError, 'The doctor directory could not be loaded.');
        setError(message);
        toast.error(message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadDoctors(); }, []);

  const filtered = useMemo(() => doctors.filter((doctor) =>
    `${doctor.name} ${doctor.specialization}`.toLowerCase().includes(search.trim().toLowerCase()),
  ), [doctors, search]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { setPage((current) => Math.min(current, pageCount)); }, [pageCount]);

  const submit = async (event) => {
    event.preventDefault();
    const experience = Number(form.experience);
    if (!form.name.trim() || !form.specialization.trim() || form.experience === ''
      || !Number.isFinite(experience) || experience < 0) {
      toast.error('Enter the doctor’s name, specialty, and valid years of experience.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const created = await doctorService.create({
        ...form,
        name: form.name.trim(),
        specialization: form.specialization.trim(),
        experience,
      });
      setDoctors((current) => [...current, created]);
      setForm(emptyDoctor);
      setFormOpen(false);
      setSearch('');
      setPage(1);
      toast.success('Doctor added to the directory.');
    } catch (requestError) {
      const message = apiErrorMessage(requestError, 'The doctor record could not be saved.');
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!doctorToDelete) return;
    setSaving(true);
    setError('');
    try {
      await doctorService.remove(doctorToDelete.id);
      setDoctors((current) => current.filter((doctor) => Number(doctor.id) !== Number(doctorToDelete.id)));
      setDoctorToDelete(null);
      toast.success('Doctor record deleted.');
    } catch (requestError) {
      const message = apiErrorMessage(requestError, 'The doctor record was not deleted.');
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-bold text-teal-700">Care team directory</p>
          <h2 className="mt-1 text-3xl font-black text-ink sm:text-4xl">Doctors &amp; staff</h2>
          <p className="mt-2 text-navy-700">Review provider specialties and experience.</p>
        </div>
        <Button onClick={() => setFormOpen(true)}><Plus size={19} aria-hidden="true" />Add doctor</Button>
      </header>

      {error && <div role="alert"><Card className="border-red-200 bg-red-50">
        <p className="font-bold text-danger">{error}</p>
        <Button variant="secondary" className="mt-4" onClick={loadDoctors} disabled={loading}>Try again</Button>
      </Card></div>}

      <Card>
        <div className="flex flex-col justify-between gap-4 border-b border-navy-100 pb-5 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-xl font-extrabold">Provider directory</h3>
            <p className="mt-1 text-sm text-navy-700">{loading ? 'Loading providers…' : `${filtered.length} providers found`}</p>
          </div>
          <div className="w-full sm:max-w-sm">
            <SearchBox value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search doctors or specialties" />
          </div>
        </div>

        {loading ? <div className="grid gap-4 py-6 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => <div key={item} className="rounded-xl border border-navy-100 p-5"><Skeleton className="h-14 w-14" /><Skeleton className="mt-5 h-6 w-2/3" /><Skeleton className="mt-3 h-5 w-1/2" /></div>)}
        </div> : !error && !filtered.length ? <div className="py-8">
          <EmptyState title="No doctors found">Try another search or add a provider record.</EmptyState>
        </div> : !error && <>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((doctor) => <article key={doctor.id} className="rounded-xl border border-navy-100 p-5 transition-shadow hover:shadow-soft">
              <div className="flex items-center justify-between">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-teal-100 text-lg font-black text-teal-700" aria-hidden="true">
                  {doctor.name.replace(/^Dr\.\s*/i, '').split(' ').map((part) => part[0]).join('').slice(0, 2)}
                </span>
                <span className="rounded-full bg-navy-50 px-3 py-1 text-sm font-bold text-navy-700">Provider record</span>
              </div>
              <h4 className="mt-5 text-xl font-extrabold">{doctor.name}</h4>
              <p className="mt-1 font-bold text-teal-700">{doctor.specialization}</p>
              <p className="mt-4 text-navy-700">{doctor.experience == null ? 'Experience not listed' : `${doctor.experience} years of clinical experience`}</p>
              <div className="mt-5 flex flex-wrap gap-2 border-t border-navy-100 pt-4">
                <Button variant="secondary" className="flex-1 px-3" onClick={() => setSelected(doctor)}><Eye size={17} aria-hidden="true" />View profile</Button>
                <Button variant="ghost" className="px-3 text-danger" onClick={() => setDoctorToDelete(doctor)}><Trash2 size={17} aria-hidden="true" />Delete</Button>
              </div>
            </article>)}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-navy-100 pt-4">
            <p className="text-sm font-bold text-navy-700">Page {page} of {pageCount}</p>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button>
              <Button variant="secondary" disabled={page >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>Next</Button>
            </div>
          </div>
        </>}
      </Card>

      <Modal open={formOpen} title="Add doctor" onClose={() => !saving && setFormOpen(false)}>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Doctor name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Dr. Full Name" />
          <Input label="Specialization" required value={form.specialization} onChange={(event) => setForm({ ...form, specialization: event.target.value })} placeholder="Cardiology" />
          <Input label="Experience in years" type="number" min="0" required value={form.experience} onChange={(event) => setForm({ ...form, experience: event.target.value })} placeholder="Years" />
          <Button type="submit" className="w-full" disabled={saving}>{saving ? 'Saving…' : 'Save doctor'}</Button>
        </form>
      </Modal>

      <Modal open={Boolean(selected)} title="Doctor profile" onClose={() => setSelected(null)}>
        {selected && <div className="text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-teal-100 text-xl font-black text-teal-700"><Stethoscope size={28} aria-hidden="true" /></span>
          <h3 className="mt-4 text-2xl font-extrabold">{selected.name}</h3>
          <p className="mt-1 font-bold text-teal-700">{selected.specialization}</p>
          <p className="mt-5 text-navy-700">{selected.experience == null ? 'Experience not listed' : `${selected.experience} years of clinical experience`}</p>
          <p className="mt-3 text-sm text-navy-500">Contact details and availability are managed by hospital staff.</p>
        </div>}
      </Modal>

      <ConfirmDialog
        open={Boolean(doctorToDelete)}
        title="Delete doctor record?"
        message={doctorToDelete ? `Are you sure you want to delete ${doctorToDelete.name}? Doctors with appointment history or active accounts cannot be deleted.` : ''}
        confirmDisabled={saving}
        onClose={() => !saving && setDoctorToDelete(null)}
        onConfirm={remove}
      />
    </div>
  );
}
