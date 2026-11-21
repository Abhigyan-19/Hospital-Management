import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { doctorPortalService } from '../api/doctorPortalService';
import { apiErrorMessage } from '../api/errorMessage';
import { Badge, Button, Card, EmptyState, Loading, Modal } from '../components/ui';

export default function DoctorPatientChart() {
  const { patientId } = useParams();
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followUpSource, setFollowUpSource] = useState(null);
  const [followUp, setFollowUp] = useState({ date: '', time: '09:30' });
  const [savingFollowUp, setSavingFollowUp] = useState(false);

  useEffect(() => {
    doctorPortalService.getPatientChart(patientId)
      .then(setChart)
      .catch((requestError) => {
        const message = apiErrorMessage(requestError, 'This patient chart is not available to your doctor account.');
        setError(message);
        toast.error(message);
      })
      .finally(() => setLoading(false));
  }, [patientId]);

  const scheduleFollowUp = async (event) => {
    event.preventDefault();
    setSavingFollowUp(true);
    try {
      const created = await doctorPortalService.scheduleFollowUp(followUpSource.id, followUp);
      setChart((current) => ({ ...current, appointments: [...current.appointments, created] }));
      setFollowUpSource(null);
      setFollowUp({ date: '', time: '09:30' });
      toast.success('Follow-up appointment scheduled.');
    } catch (requestError) {
      toast.error(apiErrorMessage(requestError, 'The follow-up could not be scheduled.'));
    } finally {
      setSavingFollowUp(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-bold text-teal-700">Clinician workspace</p><h2 className="mt-1 text-3xl font-black text-ink sm:text-4xl">Patient chart</h2><p className="mt-2 text-navy-700">Clinical information is limited to patients assigned through your appointments.</p></div><Link to="/doctor/patients"><Button variant="secondary">Back to my patients</Button></Link></header>
      {loading ? <Card><Loading label="Loading the patient chart..." /></Card> : error ? <Card className="border-red-200 bg-red-50"><p className="font-bold text-danger">Patient chart unavailable</p><p className="mt-1 text-navy-700">{error}</p></Card> : chart && (
        <>
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="text-2xl font-extrabold">{chart.patient.name}</h3><p className="mt-1 text-navy-700">{chart.patient.age ? `${chart.patient.age} years` : 'Age not provided'}{chart.patient.gender ? ` · ${chart.patient.gender}` : ''}</p><p className="mt-1 text-navy-700">{chart.patient.phone || 'Phone not provided'}</p></div><div className="flex flex-wrap gap-2">{(Array.isArray(chart.patient.allergies) ? chart.patient.allergies : chart.patient.allergies ? [chart.patient.allergies] : []).map((allergy) => <Badge key={allergy} tone="danger">Allergy: {allergy}</Badge>)}</div></div>
            <p className="mt-4"><strong>Blood group:</strong> {chart.patient.bloodGroup || 'Not recorded'}</p>
            {chart.patient.emergencyContact && <p className="mt-1"><strong>Emergency contact:</strong> {chart.patient.emergencyContact}</p>}
          </Card>
          <div className="grid gap-5 lg:grid-cols-2">
            <Card><h3 className="text-xl font-extrabold">Visit history</h3><div className="mt-4 space-y-3">{chart.appointments.length ? chart.appointments.map((appointment) => <div key={appointment.id} className="rounded-xl border border-navy-100 p-4"><div className="flex flex-wrap justify-between gap-2"><p className="font-bold">{appointment.date} · {appointment.time}</p><Badge tone={appointment.status === 'Completed' ? 'success' : appointment.status === 'Cancelled' ? 'danger' : 'info'}>{appointment.status}</Badge></div>{appointment.id && !['Cancelled', 'Completed'].includes(appointment.status) && <Link className="mt-3 inline-block" to={`/doctor/consultation/${appointment.id}`}><Button variant="secondary">Open consultation</Button></Link>}{appointment.status === 'Completed' && <Button variant="secondary" className="mt-3" onClick={() => setFollowUpSource(appointment)}>Schedule follow-up</Button>}</div>) : <EmptyState title="No visits">This patient has no appointment history with your account.</EmptyState>}</div></Card>
            <Card><h3 className="text-xl font-extrabold">Medical history</h3><div className="mt-4 space-y-3">{chart.medicalHistory.length ? chart.medicalHistory.map((entry) => <div key={entry.id} className="rounded-xl border border-navy-100 p-4"><p className="font-bold">{entry.title}</p><p className="mt-1 text-sm text-navy-500">{entry.date} · {entry.type}</p><p className="mt-2 leading-7 text-navy-700">{entry.detail || entry.description}</p></div>) : <EmptyState title="No history recorded">There are no previous medical-history entries for this patient.</EmptyState>}</div></Card>
            <Card><h3 className="text-xl font-extrabold">Prescriptions</h3><div className="mt-4 space-y-3">{chart.prescriptions.length ? chart.prescriptions.map((prescription) => <div key={prescription.id} className="rounded-xl border border-navy-100 p-4"><p className="font-bold">{prescription.createdAt}</p>{prescription.medicines?.map((medicine, index) => <div key={`${medicine.name}-${index}`} className="mt-3 rounded-lg bg-navy-50 p-3"><p className="font-extrabold">{medicine.name}</p><p className="mt-1 text-navy-700">{medicine.dosage} · {medicine.frequency} · {medicine.duration}</p><p className="mt-2 leading-7 text-navy-800"><strong>How and when to take:</strong> {medicine.patientInstructions || 'Detailed instructions were not provided. Confirm how to take this medicine with the prescribing doctor or pharmacist.'}</p></div>)}</div>) : <EmptyState title="No prescriptions">Your prescriptions for this patient will appear here.</EmptyState>}</div></Card>
            <Card><h3 className="text-xl font-extrabold">Lab results</h3><div className="mt-4 space-y-3">{chart.labReports.length ? chart.labReports.map((report) => <div key={report.id} className="rounded-xl border border-navy-100 p-4"><div className="flex flex-wrap justify-between gap-2"><p className="font-bold">{report.name}</p><Badge tone={report.status === 'Ready' || report.status === 'COMPLETED' ? 'success' : 'warning'}>{report.status}</Badge></div><p className="mt-1 text-sm text-navy-500">{report.date}</p>{report.result && <p className="mt-2 text-navy-700">{report.result}</p>}</div>) : <EmptyState title="No lab results">Lab results for this patient will appear here.</EmptyState>}</div></Card>
          </div>
          <Modal open={Boolean(followUpSource)} title="Schedule a follow-up" onClose={() => !savingFollowUp && setFollowUpSource(null)}>
            <form className="space-y-4" onSubmit={scheduleFollowUp}>
              <p className="text-navy-700">Schedule another visit for {chart.patient.name}. The hospital service checks your availability and slot.</p>
              <label className="block"><span className="mb-2 block font-bold">Date</span><input type="date" min={new Date().toISOString().slice(0, 10)} required className="min-h-11 w-full rounded-lg border border-navy-100 px-3" value={followUp.date} onChange={(event) => setFollowUp((current) => ({ ...current, date: event.target.value }))} /></label>
              <label className="block"><span className="mb-2 block font-bold">Time</span><input type="time" required className="min-h-11 w-full rounded-lg border border-navy-100 px-3" value={followUp.time} onChange={(event) => setFollowUp((current) => ({ ...current, time: event.target.value }))} /></label>
              <Button type="submit" className="w-full" disabled={savingFollowUp}>{savingFollowUp ? 'Scheduling...' : 'Schedule follow-up'}</Button>
            </form>
          </Modal>
        </>
      )}
    </div>
  );
}
