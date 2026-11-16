import { useEffect, useState } from 'react';
import { FileText, Plus, Printer, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../api/appointmentService';
import { apiErrorMessage } from '../api/errorMessage';
import { prescriptionService } from '../api/prescriptionService';
import { Button, Card, EmptyState, Input, Modal, Skeleton } from '../components/ui';

const blankMedicine = () => ({ name: '', dosage: '', frequency: '', duration: '', patientInstructions: '' });
const blankPrescription = () => ({ patientId: '', notes: '', medicines: [blankMedicine()] });

function clonePrescription(prescription) {
  return {
    patientId: String(prescription.patient?.id || prescription.patientId || ''),
    notes: prescription.notes || '',
    medicines: (prescription.medicines || []).map((medicine) => ({
      name: medicine.name || '',
      dosage: medicine.dosage || '',
      frequency: medicine.frequency || '',
      duration: medicine.duration || '',
      patientInstructions: medicine.patientInstructions || '',
    })),
  };
}

export default function Prescriptions() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isDoctor = user?.role === 'DOCTOR';
  const [prescriptions, setPrescriptions] = useState([]);
  const [eligiblePatients, setEligiblePatients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState(blankPrescription());
  const [createForm, setCreateForm] = useState(blankPrescription());
  const [previewOpen, setPreviewOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [records, appointments] = await Promise.all([
        isAdmin ? prescriptionService.list() : prescriptionService.listMine(),
        isDoctor ? appointmentService.listMine() : Promise.resolve([]),
      ]);
      setPrescriptions(records);
      const patients = appointments
        .filter((appointment) => appointment.status === 'Completed' && appointment.patient)
        .map((appointment) => appointment.patient);
      setEligiblePatients([...new Map(patients.map((patient) => [patient.id, patient])).values()]);
    } catch (requestError) {
      const message = apiErrorMessage(requestError, 'Prescription records could not be loaded.');
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [isAdmin, isDoctor]);

  const openPreview = (prescription) => {
    setSelected(prescription);
    setDraft(clonePrescription(prescription));
    setEditing(false);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setSelected(null);
    setEditing(false);
  };

  const changeDraft = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const changeMedicine = (index, key, value) => setDraft((current) => ({
    ...current,
    medicines: current.medicines.map((medicine, medicineIndex) => medicineIndex === index ? { ...medicine, [key]: value } : medicine),
  }));
  const addMedicine = () => setDraft((current) => ({ ...current, medicines: [...current.medicines, blankMedicine()] }));
  const removeMedicine = (index) => setDraft((current) => ({ ...current, medicines: current.medicines.filter((_, medicineIndex) => medicineIndex !== index) }));

  const saveEdit = async () => {
    if (!selected || !draft.medicines.length || draft.medicines.some((medicine) => !medicine.name.trim() || !medicine.dosage.trim() || !medicine.frequency.trim() || !medicine.duration.trim() || !medicine.patientInstructions.trim())) {
      return toast.error('Complete all medicine fields, including clear patient instructions, before saving.');
    }
    setSaving(true);
    try {
      const updated = await prescriptionService.update(selected.id, {
        notes: draft.notes,
        medicines: draft.medicines.map((medicine) => ({
          name: medicine.name.trim(),
          dosage: medicine.dosage.trim(),
          frequency: medicine.frequency.trim(),
          duration: medicine.duration.trim(),
          patientInstructions: medicine.patientInstructions.trim(),
        })),
      });
      setPrescriptions((current) => current.map((item) => item.id === updated.id ? updated : item));
      setSelected(updated);
      setDraft(clonePrescription(updated));
      setEditing(false);
      toast.success('Prescription changes saved.');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Prescription edits were not saved. The backend edit and audit APIs may not be available.'));
    } finally {
      setSaving(false);
    }
  };

  const createPrescription = async (event) => {
    event.preventDefault();
    if (!createForm.patientId || createForm.medicines.some((medicine) => !medicine.name.trim() || !medicine.dosage.trim() || !medicine.frequency.trim() || !medicine.duration.trim() || !medicine.patientInstructions.trim())) {
      return toast.error('Select a patient and complete all medicine fields, including clear patient instructions.');
    }
    setSaving(true);
    try {
      const created = await prescriptionService.create({
        patientId: Number(createForm.patientId),
        ...(user.doctorId ? { doctorId: Number(user.doctorId) } : {}),
        notes: createForm.notes,
        medicines: createForm.medicines.map((medicine) => ({
          ...medicine,
          name: medicine.name.trim(),
          dosage: medicine.dosage.trim(),
          frequency: medicine.frequency.trim(),
          duration: medicine.duration.trim(),
          patientInstructions: medicine.patientInstructions.trim(),
        })),
      });
      setPrescriptions((current) => [created, ...current]);
      setCreateOpen(false);
      setCreateForm(blankPrescription());
      toast.success('Prescription created.');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Prescription creation failed. The backend must authorize the signed-in doctor.'));
    } finally {
      setSaving(false);
    }
  };

  const updateCreateMedicine = (index, key, value) => setCreateForm((current) => ({
    ...current,
    medicines: current.medicines.map((medicine, medicineIndex) => medicineIndex === index ? { ...medicine, [key]: value } : medicine),
  }));

  const medicineFields = (medicine, index, onChange, onRemove, canRemove) => (
    <div key={index} className="rounded-xl border border-navy-100 p-4">
      <div className="mb-3 flex items-center justify-between"><p className="font-extrabold">Medicine {index + 1}</p>{canRemove && <button type="button" onClick={() => onRemove(index)} className="rounded p-1 text-danger" aria-label={`Remove medicine ${index + 1}`}><X size={18} /></button>}</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="Medicine name" required value={medicine.name} onChange={(event) => onChange(index, 'name', event.target.value)} />
        <Input label="Dosage" required value={medicine.dosage} onChange={(event) => onChange(index, 'dosage', event.target.value)} />
        <Input label="Frequency" required value={medicine.frequency} onChange={(event) => onChange(index, 'frequency', event.target.value)} />
        <Input label="Duration" required value={medicine.duration} onChange={(event) => onChange(index, 'duration', event.target.value)} />
        <label className="block sm:col-span-2"><span className="mb-2 block font-bold">How and when to take this medicine</span><textarea required rows="3" maxLength={500} className="w-full rounded-lg border border-navy-100 bg-white p-3 text-ink outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" value={medicine.patientInstructions} onChange={(event) => onChange(index, 'patientInstructions', event.target.value)} placeholder="Write the exact schedule in plain language, for example: Take one tablet after breakfast and one tablet before bed." /><span className="mt-1 block text-sm text-navy-700">Be specific about timing and any instructions the patient needs to follow.</span></label>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="font-bold text-teal-700">Medication records</p><h2 className="mt-1 text-3xl font-black text-ink sm:text-4xl">Prescriptions</h2><p className="mt-2 text-navy-700">{isAdmin ? 'Review prescriptions and correct records while preserving the prescribing doctor.' : isDoctor ? 'Create prescriptions for patients you are authorized to treat.' : 'View prescriptions in your patient record.'}</p></div>
        {isDoctor && <Button onClick={() => setCreateOpen(true)}><Plus size={18} />Create prescription</Button>}
      </div>
      {isAdmin && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><strong>Record integrity:</strong> Admin edits do not change the original prescribing doctor. Every edit must be recorded by the prescription service and shown in its audit history.</div>}
      {loadError && <Card role="alert" className="border-red-200 bg-red-50"><p className="font-bold text-danger">{loadError}</p><Button variant="secondary" className="mt-4" onClick={loadData} disabled={loading}>Try again</Button></Card>}
      {loading ? <Card><Skeleton className="h-16 w-full" /><Skeleton className="mt-4 h-10 w-2/3" /></Card> : loadError ? null : prescriptions.length === 0 ? <EmptyState title="No prescriptions available">{isDoctor ? 'Prescriptions for your account will appear here.' : 'No prescriptions were returned for this account.'}</EmptyState> : (
        <div className="space-y-4">{prescriptions.map((prescription) => (
          <Card key={prescription.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-teal-100 text-teal-700"><FileText size={23} /></span><div><h3 className="text-xl font-extrabold">{prescription.patient?.name || prescription.patient || 'Patient'}</h3><p className="mt-1 text-sm text-navy-700">Prescribed by {prescription.doctor?.name || 'Doctor'} · {prescription.createdAt || prescription.createdAtDate || 'Date unavailable'}</p><p className="mt-1 text-sm text-navy-500">{prescription.medicines?.length || 0} medicine(s)</p></div></div>
              <div className="flex gap-2"><Button variant="secondary" onClick={() => openPreview(prescription)}>Preview</Button><Button variant="ghost" onClick={() => { openPreview(prescription); window.setTimeout(() => window.print(), 0); }} aria-label="Print prescription"><Printer size={17} />Print</Button></div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">{(prescription.medicines || []).slice(0, 2).map((medicine, index) => <div key={`${prescription.id}-${index}`} className="rounded-lg bg-navy-50 p-3"><p className="font-extrabold">{medicine.name}</p><p className="text-sm text-navy-700">{medicine.dosage} · {medicine.frequency} · {medicine.duration}</p><p className="mt-2 leading-6 text-navy-800"><strong>How and when:</strong> {medicine.patientInstructions || 'Detailed instructions were not provided. Please ask your doctor or pharmacist before taking this medicine.'}</p></div>)}</div>
          </Card>
        ))}</div>
      )}

      <Modal open={previewOpen} title={editing ? 'Edit prescription' : 'Prescription preview'} onClose={closePreview}>
        {selected && <div className="print-document printable-prescription max-h-[75vh] space-y-5 overflow-y-auto pr-1">
          <div className="rounded-lg bg-navy-50 p-4"><p className="font-extrabold">{selected.patient?.name || selected.patient || 'Patient'}</p><p className="mt-1 text-sm text-navy-700">Original prescriber: {selected.doctor?.name || 'Doctor'} · Issued {selected.createdAt || 'date unavailable'}</p></div>
          {editing ? (
            <>
              {draft.medicines.map((medicine, index) => medicineFields(medicine, index, changeMedicine, removeMedicine, draft.medicines.length > 1))}
              <Button variant="secondary" onClick={addMedicine}><Plus size={17} />Add medicine</Button>
              <label className="block"><span className="mb-2 block font-bold">Notes</span><textarea rows="3" className="w-full rounded-lg border border-navy-100 p-3" value={draft.notes} onChange={(event) => changeDraft('notes', event.target.value)} /></label>
              <p className="text-sm text-amber-900">The original doctor remains the author. The API must record the admin editor, changed fields, and timestamp.</p>
              <div className="no-print flex justify-end gap-3"><Button variant="secondary" onClick={() => { setDraft(clonePrescription(selected)); setEditing(false); }}>Discard</Button><Button onClick={saveEdit} disabled={saving}><Save size={17} />{saving ? 'Saving...' : 'Save audited changes'}</Button></div>
            </>
          ) : (
            <>
              <div className="space-y-2">{(selected.medicines || []).map((medicine, index) => <div key={index} className="rounded-lg border border-navy-100 p-3"><p className="font-extrabold">{medicine.name}</p><p className="mt-1 text-sm text-navy-700">{medicine.dosage} · {medicine.frequency} · {medicine.duration}</p><p className="mt-2 whitespace-pre-wrap leading-7 text-navy-800"><strong>How and when to take:</strong> {medicine.patientInstructions || 'Detailed instructions were not provided. Please ask your doctor or pharmacist before taking this medicine.'}</p></div>)}</div>
              {selected.notes && <div><p className="font-bold">Notes</p><p className="mt-1 text-navy-700">{selected.notes}</p></div>}
              {isAdmin && <section className="border-t border-navy-100 pt-4"><h3 className="font-extrabold">Edit history</h3>{selected.auditHistory?.length ? <div className="mt-3 space-y-2">{selected.auditHistory.map((entry, index) => <div key={entry.id || index} className="rounded-lg bg-navy-50 p-3 text-sm"><p className="font-bold">{entry.editor?.name || entry.editorName || 'Administrator'} · {entry.editedAt || 'Timestamp unavailable'}</p><p className="mt-1 text-navy-700">{entry.summary || entry.changes || 'Prescription updated'}</p></div>)}</div> : <p className="mt-2 text-sm text-navy-700">No audit entries were returned. Audit history must be provided by the backend.</p>}</section>}
              <div className="no-print flex justify-end gap-3">{isAdmin && <Button onClick={() => setEditing(true)}>Edit prescription</Button>}<Button variant="secondary" onClick={closePreview}>Close</Button></div>
            </>
          )}
        </div>}
      </Modal>

      <Modal open={createOpen} title="Create doctor-authored prescription" onClose={() => setCreateOpen(false)}>
        <form className="max-h-[75vh] space-y-4 overflow-y-auto pr-1" onSubmit={createPrescription}>
          <label className="block"><span className="mb-2 block font-bold">Patient with a completed appointment</span><select required className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-4" value={createForm.patientId} onChange={(event) => setCreateForm((current) => ({ ...current, patientId: event.target.value }))}><option value="">Select patient</option>{eligiblePatients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}</select></label>
          {createForm.medicines.map((medicine, index) => medicineFields(medicine, index, updateCreateMedicine, (medicineIndex) => setCreateForm((current) => ({ ...current, medicines: current.medicines.filter((_, i) => i !== medicineIndex) })), createForm.medicines.length > 1))}
          <Button type="button" variant="secondary" onClick={() => setCreateForm((current) => ({ ...current, medicines: [...current.medicines, blankMedicine()] }))}><Plus size={17} />Add medicine</Button>
          <label className="block"><span className="mb-2 block font-bold">Notes</span><textarea rows="3" className="w-full rounded-lg border border-navy-100 p-3" value={createForm.notes} onChange={(event) => setCreateForm((current) => ({ ...current, notes: event.target.value }))} /></label>
          <p className="text-xs text-navy-500">The server must verify that you are the treating doctor and set the author from your account.</p>
          <Button type="submit" className="w-full" disabled={saving || !eligiblePatients.length}>{saving ? 'Saving...' : 'Create prescription'}</Button>
        </form>
      </Modal>
    </div>
  );
}
