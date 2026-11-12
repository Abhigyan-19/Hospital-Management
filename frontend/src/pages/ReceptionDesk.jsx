import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Plus, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentService } from '../api/appointmentService';
import { doctorService } from '../api/doctorService';
import { patientService } from '../api/patientService';
import { apiErrorMessage } from '../api/errorMessage';
import { Badge, Button, Card, ConfirmDialog, EmptyState, Input, Modal, SearchBox } from '../components/ui';
import { getDoctorTimeSlots } from '../utils/appointmentSlots';

const appointmentTimes = ['09:30', '11:00', '14:15', '16:00'];
const emptyBooking = { patientId: '', department: '', doctorId: '', date: '', time: '' };
const emptyPatient = { name: '', age: '', gender: '', phone: '' };

function localDate() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

export default function ReceptionDesk() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [patientOpen, setPatientOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [booking, setBooking] = useState({ ...emptyBooking, date: localDate(), time: appointmentTimes[0] });
  const [newPatient, setNewPatient] = useState(emptyPatient);
  const [reschedule, setReschedule] = useState({ date: localDate(), time: appointmentTimes[0] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const today = localDate();

  useEffect(() => {
    Promise.all([appointmentService.list(), patientService.list(), doctorService.list()])
      .then(([appointmentData, patientData, doctorData]) => {
        setAppointments(appointmentData);
        setPatients(patientData);
        setDoctors(doctorData);
      })
      .catch((requestError) => {
        const message = apiErrorMessage(requestError, 'Reception appointments, patients, and doctors could not be loaded.');
        setError(message);
        toast.error(message);
      })
      .finally(() => setLoading(false));
  }, []);

  const departments = useMemo(() =>
    [...new Set(doctors.map((doctor) => doctor.specialization || doctor.department?.name).filter(Boolean))].sort(),
  [doctors]);
  const availableDoctors = doctors.filter((doctor) =>
    (doctor.specialization || doctor.department?.name) === booking.department,
  );
  const selectedDoctor = doctors.find((doctor) => Number(doctor.id) === Number(booking.doctorId));
  const availableSlots = getDoctorTimeSlots(selectedDoctor, booking.date);
  const rescheduleSlots = getDoctorTimeSlots(rescheduleTarget?.doctor, reschedule.date);
  const booked = appointments.some((appointment) =>
    Number(appointment.doctor?.id) === Number(booking.doctorId) &&
    appointment.date === booking.date &&
    appointment.time === booking.time &&
    appointment.status !== 'Cancelled',
  );
  const visibleAppointments = appointments.filter((appointment) => {
    const matchesDate = showAll || appointment.date === today;
    const text = `${appointment.patient?.name || ''} ${appointment.doctor?.name || ''} ${appointment.doctor?.specialization || ''}`.toLowerCase();
    return matchesDate && text.includes(search.trim().toLowerCase());
  }).sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  useEffect(() => {
    if (booking.doctorId && booking.date && !availableSlots.includes(booking.time)) {
      setBooking((current) => ({ ...current, time: availableSlots[0] || '' }));
    }
  }, [booking.date, booking.doctorId, booking.time, availableSlots]);

  useEffect(() => {
    if (rescheduleTarget && reschedule.date && !rescheduleSlots.includes(reschedule.time)) {
      setReschedule((current) => ({ ...current, time: rescheduleSlots[0] || '' }));
    }
  }, [rescheduleTarget, reschedule.date, reschedule.time, rescheduleSlots]);

  const registerWalkIn = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const created = await patientService.create({ ...newPatient, age: Number(newPatient.age) });
      setPatients((current) => [...current, created]);
      setBooking((current) => ({ ...current, patientId: String(created.id) }));
      setNewPatient(emptyPatient);
      setPatientOpen(false);
      setBookingOpen(true);
      toast.success('Walk-in patient registered. You can now book a visit.');
    } catch (requestError) {
      toast.error(apiErrorMessage(requestError, 'The patient could not be registered.'));
    } finally {
      setSaving(false);
    }
  };

  const createBooking = async (event) => {
    event.preventDefault();
    if (!booking.patientId || !booking.doctorId || !booking.date || !booking.time) return toast.error('Complete all appointment details.');
    if (booked) return toast.error('That doctor is already booked for this time slot.');
    setSaving(true);
    try {
      const created = await appointmentService.create({
        patientId: Number(booking.patientId),
        doctorId: Number(booking.doctorId),
        date: booking.date,
        time: booking.time,
      });
      setAppointments((current) => [...current, created]);
      setBookingOpen(false);
      setBooking({ ...emptyBooking, date: today, time: appointmentTimes[0] });
      toast.success('Appointment booked.');
    } catch (requestError) {
      toast.error(apiErrorMessage(requestError, 'The appointment could not be booked.'));
    } finally {
      setSaving(false);
    }
  };

  const checkIn = async (appointment) => {
    setSaving(true);
    try {
      const updated = await appointmentService.checkIn(appointment.id);
      setAppointments((current) => current.map((item) => Number(item.id) === Number(updated.id) ? updated : item));
      toast.success(`${appointment.patient?.name || 'Patient'} checked in.`);
    } catch (requestError) {
      toast.error(apiErrorMessage(requestError, 'Patient check-in is not available.'));
    } finally {
      setSaving(false);
    }
  };

  const cancelAppointment = async () => {
    setSaving(true);
    try {
      const updated = await appointmentService.updateStatus(cancelTarget.id, 'Cancelled');
      setAppointments((current) => current.map((item) => Number(item.id) === Number(updated.id) ? updated : item));
      setCancelTarget(null);
      toast.success('Appointment cancelled.');
    } catch (requestError) {
      toast.error(apiErrorMessage(requestError, 'The appointment could not be cancelled.'));
    } finally {
      setSaving(false);
    }
  };

  const saveReschedule = async (event) => {
    event.preventDefault();
    if (!reschedule.date || !reschedule.time) return toast.error('Choose an available date and time.');
    setSaving(true);
    try {
      const updated = await appointmentService.rescheduleForStaff(rescheduleTarget.id, reschedule);
      setAppointments((current) => current.map((item) => Number(item.id) === Number(updated.id) ? updated : item));
      setRescheduleTarget(null);
      toast.success('Appointment rescheduled.');
    } catch (requestError) {
      toast.error(apiErrorMessage(requestError, 'The appointment could not be rescheduled.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1250px] space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-bold text-teal-700">Reception workspace</p><h2 className="mt-1 text-3xl font-black text-ink sm:text-4xl">Walk-ins and appointment queue</h2><p className="mt-2 text-navy-700">Register arriving patients, manage bookings, and check in today's appointments.</p></div><div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => setPatientOpen(true)}><UserPlus size={18} />Register walk-in</Button><Button onClick={() => setBookingOpen(true)}><Plus size={18} />Book for a patient</Button></div></header>
      {error && <Card className="border-red-200 bg-red-50"><p className="font-bold text-danger">Reception data could not be loaded</p><p className="mt-1 text-navy-700">{error}</p></Card>}
      <div className="grid gap-4 sm:grid-cols-3"><Card><p className="font-bold text-navy-700">Today's appointments</p><p className="mt-2 text-3xl font-black">{appointments.filter((item) => item.date === today).length}</p></Card><Card><p className="font-bold text-navy-700">Waiting for check-in</p><p className="mt-2 text-3xl font-black">{appointments.filter((item) => item.date === today && ['Scheduled', 'Confirmed'].includes(item.status)).length}</p></Card><Card><p className="font-bold text-navy-700">Registered patients</p><p className="mt-2 text-3xl font-black">{patients.length}</p></Card></div>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy-100 pb-5"><div><h3 className="text-xl font-extrabold">{showAll ? 'All appointments' : "Today's appointment queue"}</h3><button className="mt-2 min-h-11 font-bold text-teal-700 underline" onClick={() => setShowAll((current) => !current)}>{showAll ? "Show today's queue" : 'View all appointment dates'}</button></div><div className="w-full sm:max-w-sm"><SearchBox value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search patient or doctor" /></div></div>
        {loading ? <p className="py-6 text-navy-700">Loading the reception queue...</p> : !visibleAppointments.length ? <div className="py-6"><EmptyState title={search ? 'No matching appointments' : showAll ? 'No appointments' : 'No appointments today'}>{search ? 'Try another patient or doctor name.' : 'Register a walk-in patient or book an appointment for a future visit.'}</EmptyState></div> : (
          <div className="mt-5 space-y-3">{visibleAppointments.map((appointment) => (
            <article key={appointment.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-navy-100 p-4">
              <div><p className="font-extrabold">{appointment.time} · {appointment.patient?.name || 'Patient'}</p><p className="mt-1 text-sm text-navy-700">{appointment.date} · {appointment.doctor?.name || 'Doctor'} · {appointment.doctor?.specialization || 'Department'}</p></div>
              <div className="flex flex-wrap items-center gap-2"><Badge tone={appointment.status === 'Completed' ? 'success' : appointment.status === 'Cancelled' ? 'danger' : appointment.status === 'Checked In' ? 'success' : 'info'}>{appointment.status || 'Scheduled'}</Badge>{appointment.date === today && ['Scheduled', 'Confirmed'].includes(appointment.status) && <Button variant="secondary" disabled={saving} onClick={() => checkIn(appointment)}>Check in</Button>}{!['Completed', 'Cancelled'].includes(appointment.status) && <><Button variant="secondary" onClick={() => { setRescheduleTarget(appointment); setReschedule({ date: appointment.date, time: appointment.time || appointmentTimes[0] }); }}>Reschedule</Button><Button variant="danger" onClick={() => setCancelTarget(appointment)}>Cancel appointment</Button></>}</div>
            </article>
          ))}</div>
        )}
      </Card>
      <Modal open={patientOpen} title="Register a walk-in patient" onClose={() => !saving && setPatientOpen(false)}>
        <form className="space-y-4" onSubmit={registerWalkIn}>
          <Input label="Patient full name" required value={newPatient.name} onChange={(event) => setNewPatient((current) => ({ ...current, name: event.target.value }))} />
          <div className="grid gap-4 sm:grid-cols-2"><Input label="Age" type="number" min="0" max="125" required value={newPatient.age} onChange={(event) => setNewPatient((current) => ({ ...current, age: event.target.value }))} /><label className="block"><span className="mb-2 block font-bold">Gender</span><select required className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-3" value={newPatient.gender} onChange={(event) => setNewPatient((current) => ({ ...current, gender: event.target.value }))}><option value="">Select</option><option>Female</option><option>Male</option><option>Other</option><option>Prefer not to say</option></select></label></div>
          <Input label="Phone number" type="tel" required value={newPatient.phone} onChange={(event) => setNewPatient((current) => ({ ...current, phone: event.target.value }))} />
          <Button type="submit" className="w-full" disabled={saving}><UserPlus size={17} />{saving ? 'Registering...' : 'Register and continue to booking'}</Button>
        </form>
      </Modal>
      <Modal open={bookingOpen} title="Book an appointment for a patient" onClose={() => !saving && setBookingOpen(false)}>
        <form className="space-y-4" onSubmit={createBooking}>
          <label className="block"><span className="mb-2 block font-bold">Patient</span><select required className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-4" value={booking.patientId} onChange={(event) => setBooking((current) => ({ ...current, patientId: event.target.value }))}><option value="">Select a patient</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}</select></label>
          <label className="block"><span className="mb-2 block font-bold">Department</span><select required className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-4" value={booking.department} onChange={(event) => setBooking((current) => ({ ...current, department: event.target.value, doctorId: '', time: '' }))}><option value="">Choose a department</option>{departments.map((department) => <option key={department}>{department}</option>)}</select></label>
          <label className="block"><span className="mb-2 block font-bold">Doctor</span><select required disabled={!booking.department} className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-4" value={booking.doctorId} onChange={(event) => setBooking((current) => ({ ...current, doctorId: event.target.value, time: '' }))}><option value="">Select a doctor</option>{availableDoctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name}</option>)}</select></label>
          <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-2 block font-bold">Date</span><input type="date" min={today} required className="min-h-11 w-full rounded-lg border border-navy-100 px-3" value={booking.date} onChange={(event) => setBooking((current) => ({ ...current, date: event.target.value }))} /></label><label className="block"><span className="mb-2 block font-bold">Time slot</span><select required disabled={!availableSlots.length} className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-3" value={booking.time} onChange={(event) => setBooking((current) => ({ ...current, time: event.target.value }))}><option value="">{availableSlots.length ? 'Select time' : 'Choose an available date'}</option>{availableSlots.map((time) => <option key={time}>{time}</option>)}</select>{selectedDoctor && booking.date && !availableSlots.length && <p className="mt-1 text-sm text-navy-500">The doctor is not available on this date.</p>}</label></div>
          {booked && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">This doctor already has an appointment at that time.</p>}
          <Button type="submit" className="w-full" disabled={saving || !patients.length}><CalendarDays size={17} />{saving ? 'Booking...' : 'Book appointment'}</Button>
        </form>
      </Modal>
      <Modal open={Boolean(rescheduleTarget)} title="Reschedule appointment" onClose={() => !saving && setRescheduleTarget(null)}>
        <form className="space-y-4" onSubmit={saveReschedule}>
          <p className="text-navy-700">Reschedule {rescheduleTarget?.patient?.name || 'this patient'} with {rescheduleTarget?.doctor?.name || 'the assigned doctor'}.</p>
          <label className="block"><span className="mb-2 block font-bold">Date</span><input type="date" min={today} required className="min-h-11 w-full rounded-lg border border-navy-100 px-3" value={reschedule.date} onChange={(event) => setReschedule((current) => ({ ...current, date: event.target.value }))} /></label>
          <label className="block"><span className="mb-2 block font-bold">Time slot</span><select required disabled={!rescheduleSlots.length} className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-3" value={reschedule.time} onChange={(event) => setReschedule((current) => ({ ...current, time: event.target.value }))}>{rescheduleSlots.map((time) => <option key={time}>{time}</option>)}</select></label>
          <Button type="submit" className="w-full" disabled={saving || !rescheduleSlots.length}>{saving ? 'Saving...' : 'Save new appointment time'}</Button>
        </form>
      </Modal>
      <ConfirmDialog open={Boolean(cancelTarget)} title="Cancel this appointment?" message={cancelTarget ? `Cancel ${cancelTarget.patient?.name || 'this patient'}'s appointment on ${cancelTarget.date} at ${cancelTarget.time}?` : ''} confirmLabel={saving ? 'Cancelling...' : 'Yes, cancel appointment'} confirmDisabled={saving} onClose={() => !saving && setCancelTarget(null)} onConfirm={cancelAppointment} />
    </div>
  );
}
