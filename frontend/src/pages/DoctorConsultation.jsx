import { useEffect, useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { doctorPortalService } from '../api/doctorPortalService';
import { apiErrorMessage } from '../api/errorMessage';
import { Badge, Button, Card, EmptyState, Input, Loading } from '../components/ui';

const blankMedicine = () => ({ name: '', dosage: '', frequency: '', duration: '', patientInstructions: '' });
const emptyForm = () => ({ diagnosis: '', notes: '', labTests: '', createPrescription: false, prescriptionNotes: '', medicines: [blankMedicine()] });

export default function DoctorConsultation() {
  const { appointmentId: routeAppointmentId } = useParams();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [selectedId, setSelectedId] = useState(routeAppointmentId || '');
  const [chart, setChart] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    doctorPortalService.listSchedule()
      .then((data) => {
        setAppointments(data);
        if (routeAppointmentId) {
          setSelectedId(String(routeAppointmentId));
        } else {
          const firstOpen = data.find((appointment) => !['Completed', 'Cancelled'].includes(appointment.status));
          if (firstOpen) setSelectedId(String(firstOpen.id));
        }
      })
      .catch((requestError) => setError(apiErrorMessage(requestError, 'Your appointments are not available.')))
      .finally(() => setLoading(false));
  }, [routeAppointmentId]);

  const appointment = useMemo(() => appointments.find((item) => String(item.id) === String(selectedId)), [appointments, selectedId]);

  useEffect(() => {
    if (!appointment?.patient?.id) {
      setChart(null);
      return;
    }
    setError('');
    setChart(null);
    doctorPortalService.getPatientChart(appointment.patient.id)
      .then(setChart)
      .catch((requestError) => {
        const message = apiErrorMessage(requestError, 'The assigned patient chart could not be loaded.');
        setError(message);
        toast.error(message);
      });
  }, [appointment?.id, appointment?.patient?.id]);

  const updateMedicine = (index, key, value) => setForm((current) => ({
    ...current,
    medicines: current.medicines.map((medicine, medicineIndex) => medicineIndex === index ? { ...medicine, [key]: value } : medicine),
  }));

  const submit = async (event) => {
    event.preventDefault();
    if (!appointment || !form.diagnosis.trim() || !form.notes.trim()) return toast.error('Choose an appointment and enter the diagnosis and consultation notes.');
    if (form.createPrescription && form.medicines.some((medicine) => !medicine.name.trim() || !medicine.dosage.trim() || !medicine.frequency.trim() || !medicine.duration.trim() || !medicine.patientInstructions.trim())) {
      return toast.error('Complete all medicine details, including clear patient instructions, or turn off prescription creation.');
    }
    setSaving(true);
    setError('');
    try {
      await doctorPortalService.saveConsultation(appointment.id, {
        diagnosis: form.diagnosis.trim(),
        notes: form.notes.trim(),
        labTests: form.labTests.split(',').map((name) => name.trim()).filter(Boolean),
        createPrescription: form.createPrescription,
        prescriptionNotes: form.prescriptionNotes.trim(),
        medicines: form.createPrescription ? form.medicines.map((medicine) => ({
          name: medicine.name.trim(),
          dosage: medicine.dosage.trim(),
          frequency: medicine.frequency.trim(),
          duration: medicine.duration.trim(),
          patientInstructions: medicine.patientInstructions.trim(),
        })) : [],
      });
      toast.success('Consultation saved and appointment marked complete.');
      navigate('/doctor/schedule');
    } catch (requestError) {
      const message = apiErrorMessage(requestError, 'Consultation could not be saved.');
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const openAppointments = appointments.filter((item) => !['Completed', 'Cancelled'].includes(item.status));

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <header><p className="font-bold text-teal-700">Clinician workspace</p><h2 className="mt-1 text-3xl font-black text-ink sm:text-4xl">Consultation</h2><p className="mt-2 text-navy-700">Record the visit, diagnosis, prescription, and lab orders for your assigned patient.</p></header>
      {error && <Card className="border-red-200 bg-red-50"><p className="font-bold text-danger">Consultation service</p><p className="mt-1 text-navy-700">{error}</p></Card>}
      {loading ? <Card><Loading label="Loading your appointments..." /></Card> : appointments.length === 0 ? <Card><EmptyState title="No assigned appointments">Consultation is available only for patients assigned to your doctor account.</EmptyState></Card> : (
        <>
          <Card>
            <label className="block"><span className="mb-2 block font-bold">Appointment</span><select className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-4" value={selectedId} onChange={(event) => { setSelectedId(event.target.value); setForm(emptyForm()); }}><option value="">Select an appointment</option>{appointments.map((item) => <option key={item.id} value={item.id}>{item.patient?.name || 'Patient'} · {item.date} {item.time} · {item.status}</option>)}</select></label>
          </Card>
          {!appointment && openAppointments.length > 0 && <Card><EmptyState title="Select an appointment">Choose one of your open appointments to start the consultation.</EmptyState></Card>}
          {appointment && (
            <>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-xl font-extrabold">{appointment.patient?.name || 'Patient'}</h3><p className="mt-1 text-navy-700">{appointment.date} at {appointment.time}</p></div><div className="flex flex-wrap gap-2"><Badge tone={appointment.status === 'Completed' ? 'success' : 'info'}>{appointment.status}</Badge><Link to={`/doctor/patients/${appointment.patient?.id}`}><Button variant="secondary">Open full chart</Button></Link></div></div>
                {chart && <div className="mt-4 rounded-xl bg-navy-50 p-4"><p><strong>Allergies:</strong> {Array.isArray(chart.patient.allergies) && chart.patient.allergies.length ? chart.patient.allergies.join(', ') : chart.patient.allergies || 'None recorded'}</p><p className="mt-1"><strong>Recent history:</strong> {chart.medicalHistory[0]?.title || 'No previous notes'}</p><p className="mt-1"><strong>Recent prescriptions:</strong> {chart.prescriptions[0]?.medicines?.map((medicine) => medicine.name).join(', ') || 'None from your visits'}</p></div>}
              </Card>
              {['Completed', 'Cancelled'].includes(appointment.status) ? <Card><EmptyState title="This appointment is closed">Completed or cancelled appointments cannot be edited in a consultation.</EmptyState></Card> : (
                <Card>
                  <form className="space-y-5" onSubmit={submit}>
                    <Input label="Diagnosis" required value={form.diagnosis} onChange={(event) => setForm((current) => ({ ...current, diagnosis: event.target.value }))} />
                    <label className="block"><span className="mb-2 block font-bold">Consultation notes</span><textarea required rows="5" className="w-full rounded-lg border border-navy-100 bg-white p-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} /></label>
                    <Input label="Order lab tests (comma-separated)" value={form.labTests} onChange={(event) => setForm((current) => ({ ...current, labTests: event.target.value }))} placeholder="For example: CBC, lipid profile" />
                    <label className="flex min-h-11 items-center gap-3 font-bold"><input type="checkbox" className="h-5 w-5 accent-teal-700" checked={form.createPrescription} onChange={(event) => setForm((current) => ({ ...current, createPrescription: event.target.checked }))} />Create a prescription for this visit</label>
                    {form.createPrescription && <div className="space-y-4 rounded-xl border border-navy-100 p-4"><label className="block"><span className="mb-2 block font-bold">Prescription instructions</span><textarea rows="2" className="w-full rounded-lg border border-navy-100 p-3" value={form.prescriptionNotes} onChange={(event) => setForm((current) => ({ ...current, prescriptionNotes: event.target.value }))} /></label>{form.medicines.map((medicine, index) => <div key={index} className="grid gap-3 rounded-xl bg-navy-50 p-4 sm:grid-cols-2"><div className="flex items-center justify-between sm:col-span-2"><p className="font-extrabold">Medicine {index + 1}</p>{form.medicines.length > 1 && <button type="button" className="font-bold text-danger underline" onClick={() => setForm((current) => ({ ...current, medicines: current.medicines.filter((_, itemIndex) => itemIndex !== index) }))} aria-label={`Remove medicine ${index + 1}`}><X size={18} /></button>}</div><Input label="Medicine name" required value={medicine.name} onChange={(event) => updateMedicine(index, 'name', event.target.value)} /><Input label="Dosage" required value={medicine.dosage} onChange={(event) => updateMedicine(index, 'dosage', event.target.value)} /><Input label="Frequency" required value={medicine.frequency} onChange={(event) => updateMedicine(index, 'frequency', event.target.value)} /><Input label="Duration" required value={medicine.duration} onChange={(event) => updateMedicine(index, 'duration', event.target.value)} /><label className="block sm:col-span-2"><span className="mb-2 block font-bold">How and when to take this medicine</span><textarea required rows="3" maxLength={500} className="w-full rounded-lg border border-navy-100 bg-white p-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" value={medicine.patientInstructions} onChange={(event) => updateMedicine(index, 'patientInstructions', event.target.value)} placeholder="Write the exact schedule in plain language, for example: Take one tablet after breakfast and one tablet before bed." /><span className="mt-1 block text-sm text-navy-700">Be specific about timing and any instructions the patient needs to follow.</span></label></div>)}<Button type="button" variant="secondary" onClick={() => setForm((current) => ({ ...current, medicines: [...current.medicines, blankMedicine()] }))}><Plus size={17} />Add medicine</Button></div>}
                    <div className="flex flex-wrap gap-3"><Button type="submit" disabled={saving}>{saving ? 'Saving consultation...' : 'Save and complete appointment'}</Button><Link to="/doctor/schedule"><Button variant="secondary" type="button">Return to schedule</Button></Link></div>
                  </form>
                </Card>
              )}
            </>
          )}
          {!appointment && !openAppointments.length && <Card><EmptyState title="No open appointments">All assigned visits are completed or cancelled.</EmptyState></Card>}
        </>
      )}
    </div>
  );
}
