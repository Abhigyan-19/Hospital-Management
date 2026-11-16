import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentService } from '../api/appointmentService';
import { apiErrorMessage } from '../api/errorMessage';
import { departmentService } from '../api/departmentService';
import { patientService } from '../api/patientService';
import { Badge, Button, Card, ConfirmDialog, EmptyState, Input, Modal } from '../components/ui';
import { getDoctorTimeSlots } from '../utils/appointmentSlots';

const slots = ['09:30', '11:00', '14:15', '16:00'];
const initialBooking = { patientId: '', department: '', doctorId: '', date: '', time: slots[0] };

function getLocalDate() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(initialBooking);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [familyOpen, setFamilyOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', time: slots[0] });
  const [appointmentView, setAppointmentView] = useState('upcoming');
  const [familyForm, setFamilyForm] = useState({ name: '', age: '', gender: '', phone: '', relationship: '' });
  const today = getLocalDate();

  useEffect(() => {
    Promise.all([
      appointmentService.listMine(),
      patientService.listLinked(),
      departmentService.list(),
    ]).then(([appointmentData, profileData, departmentData]) => {
      setAppointments(appointmentData);
      setProfiles(profileData);
      setDepartments(departmentData);
      const self = profileData.find((profile) => profile.relationshipToAccount === 'SELF' || profile.isSelf);
      if (self) setForm((current) => ({ ...current, patientId: String(self.id) }));
    }).catch((error) => {
      const message = apiErrorMessage(error, 'Appointment, family-profile, and department services are not available.');
      setProfileError(message);
      toast.error(message);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!form.department) {
      setDoctors([]);
      return;
    }
    departmentService.listDoctors(form.department)
      .then(setDoctors)
      .catch((error) => {
        setDoctors([]);
        toast.error(apiErrorMessage(error, 'Doctors for this department are not available.'));
      });
  }, [form.department]);

  const booked = useMemo(() => appointments.some((appointment) =>
    Number(appointment.doctor?.id) === Number(form.doctorId) &&
    appointment.date === form.date &&
    appointment.time === form.time &&
    appointment.status !== 'Cancelled',
  ), [appointments, form.doctorId, form.date, form.time]);
  const selectedDoctor = doctors.find((doctor) => Number(doctor.id) === Number(form.doctorId));
  const availableSlots = getDoctorTimeSlots(selectedDoctor, form.date);
  const rescheduleSlots = getDoctorTimeSlots(rescheduleTarget?.doctor, rescheduleForm.date);

  useEffect(() => {
    if (form.date && form.doctorId && !availableSlots.includes(form.time)) {
      setForm((current) => ({ ...current, time: availableSlots[0] || '' }));
    }
  }, [availableSlots, form.date, form.doctorId, form.time]);

  useEffect(() => {
    if (rescheduleTarget && rescheduleForm.date && !rescheduleSlots.includes(rescheduleForm.time)) {
      setRescheduleForm((current) => ({ ...current, time: rescheduleSlots[0] || '' }));
    }
  }, [rescheduleTarget, rescheduleSlots, rescheduleForm.date, rescheduleForm.time]);

  const submit = async (event) => {
    event.preventDefault();
    if (profileError) return toast.error('Booking is unavailable until your account profiles load.');
    if (!form.patientId || !form.department || !form.doctorId || !form.date || !form.time) return toast.error('Complete all appointment details.');
    if (new Date(`${form.date}T${form.time}`) <= new Date()) return toast.error('Choose a future date and time.');
    if (booked) return toast.error('That doctor appears booked for this time. Choose another slot.');
    setSubmitting(true);
    try {
      const created = await appointmentService.createMine({
        patientId: Number(form.patientId),
        doctorId: Number(form.doctorId),
        date: form.date,
        time: form.time,
      });
      setAppointments((current) => [...current, created]);
      setBookingOpen(false);
      setForm(initialBooking);
      toast.success('Appointment request submitted.');
      if (created.emailNotificationStatus) toast(created.emailNotificationStatus === 'SENT' ? 'Confirmation email sent.' : `Email status: ${created.emailNotificationStatus}`);
    } catch (error) {
      toast.error(apiErrorMessage(error, 'The appointment service could not complete this booking.'));
    } finally {
      setSubmitting(false);
    }
  };

  const addFamilyProfile = async (event) => {
    event.preventDefault();
    if (!familyForm.name.trim() || !familyForm.age || !familyForm.gender || !familyForm.relationship.trim()) {
      return toast.error('Complete the family member details.');
    }
    setSubmitting(true);
    try {
      const created = await patientService.addLinked({
        ...familyForm,
        age: Number(familyForm.age),
      });
      setProfiles((current) => [...current, created]);
      setFamilyForm({ name: '', age: '', gender: '', phone: '', relationship: '' });
      setFamilyOpen(false);
      toast.success('Family profile added.');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'The family profile service could not add this member.'));
    } finally {
      setSubmitting(false);
    }
  };

  const saveCancellation = async () => {
    setSubmitting(true);
    try {
      const updated = await appointmentService.cancelMine(cancelTarget.id);
      setAppointments((current) => current.map((item) => item.id === updated.id ? updated : item));
      setCancelTarget(null);
      toast.success('Appointment cancelled.');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'The appointment could not be cancelled.'));
    } finally {
      setSubmitting(false);
    }
  };

  const saveReschedule = async (event) => {
    event.preventDefault();
    if (!rescheduleForm.date || !rescheduleForm.time) return toast.error('Choose a new date and time.');
    if (new Date(`${rescheduleForm.date}T${rescheduleForm.time}`) <= new Date()) return toast.error('Choose a future date and time.');
    const conflict = appointments.some((item) =>
      Number(item.id) !== Number(rescheduleTarget.id) &&
      Number(item.doctor?.id) === Number(rescheduleTarget.doctor?.id) &&
      item.date === rescheduleForm.date &&
      item.time === rescheduleForm.time &&
      item.status !== 'Cancelled',
    );
    if (conflict) return toast.error('That doctor appears booked for this time. Choose another slot.');
    setSubmitting(true);
    try {
      const updated = await appointmentService.rescheduleMine(rescheduleTarget.id, rescheduleForm);
      setAppointments((current) => current.map((item) => item.id === updated.id ? updated : item));
      setRescheduleTarget(null);
      toast.success('Appointment rescheduled.');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'The appointment could not be rescheduled.'));
    } finally {
      setSubmitting(false);
    }
  };

  const isUpcoming = (appointment) =>
    appointment.date >= today && !['Cancelled', 'Completed'].includes(appointment.status);
  const visibleAppointments = appointments.filter((appointment) =>
    appointmentView === 'upcoming' ? isUpcoming(appointment) : !isUpcoming(appointment),
  );

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-bold text-teal-700">Patient portal</p><h2 className="mt-1 text-3xl font-black text-ink sm:text-4xl">My appointments</h2><p className="mt-2 text-navy-700">Book for yourself or a linked family member.</p></div><div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => setFamilyOpen(true)}><Plus size={18} />Add family member</Button><Button onClick={() => setBookingOpen(true)}><Plus size={18} />Book appointment</Button></div></div>
      <Card>
        <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Appointment list">
          <Button variant={appointmentView === 'upcoming' ? 'primary' : 'secondary'} aria-pressed={appointmentView === 'upcoming'} onClick={() => setAppointmentView('upcoming')}>Upcoming appointments</Button>
          <Button variant={appointmentView === 'past' ? 'primary' : 'secondary'} aria-pressed={appointmentView === 'past'} onClick={() => setAppointmentView('past')}>Past and cancelled</Button>
        </div>
        {loading ? <p className="text-navy-700">Loading your appointments...</p> : appointments.length === 0 ? <EmptyState title="No appointments yet">Book an appointment when the hospital booking service is available.</EmptyState> : visibleAppointments.length === 0 ? <EmptyState title={appointmentView === 'upcoming' ? 'No upcoming appointments' : 'No past appointments'}>{appointmentView === 'upcoming' ? 'Book an appointment when you are ready.' : 'Completed and cancelled appointments will appear here.'}</EmptyState> : (
          <div className="space-y-3">{visibleAppointments.map((appointment) => (
            <div key={appointment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy-100 p-4">
              <div><p className="font-extrabold">{appointment.doctor?.name || 'Doctor'} · {appointment.doctor?.specialization || 'Department'}</p><p className="mt-1 text-sm text-navy-700">{appointment.date} at {appointment.time} · {appointment.patient?.name || 'Patient'}</p><p className="mt-1 text-xs text-navy-500">Confirmation email: {appointment.emailNotificationStatus === 'NOT_SENT_DEMO' ? 'Not sent (demo mode)' : appointment.emailNotificationStatus || 'Status unavailable'}</p></div>
              <div className="flex flex-wrap items-center gap-2"><Badge tone={appointment.status === 'Confirmed' ? 'success' : appointment.status === 'Cancelled' ? 'danger' : 'info'}>{appointment.status || 'Pending'}</Badge>{isUpcoming(appointment) && <><Button variant="secondary" onClick={() => { setRescheduleTarget(appointment); setRescheduleForm({ date: appointment.date, time: appointment.time || slots[0] }); }}>Reschedule</Button><Button variant="danger" onClick={() => setCancelTarget(appointment)}>Cancel appointment</Button></>}</div>
            </div>
          ))}</div>
        )}
      </Card>
      <ConfirmDialog open={Boolean(cancelTarget)} title="Cancel this appointment?" message={cancelTarget ? `Cancel the appointment with ${cancelTarget.doctor?.name || 'your doctor'} on ${cancelTarget.date} at ${cancelTarget.time}?` : ''} confirmLabel={submitting ? 'Cancelling...' : 'Yes, cancel appointment'} confirmDisabled={submitting} onClose={() => !submitting && setCancelTarget(null)} onConfirm={saveCancellation} />
      <Modal open={Boolean(rescheduleTarget)} title="Reschedule appointment" onClose={() => !submitting && setRescheduleTarget(null)}>
        <form className="space-y-4" onSubmit={saveReschedule}>
          <p className="text-navy-700">Choose a new date and time with {rescheduleTarget?.doctor?.name || 'your doctor'}.</p>
          <label className="block"><span className="mb-2 block font-bold">Date</span><input type="date" min={today} required className="min-h-11 w-full rounded-lg border border-navy-100 px-3" value={rescheduleForm.date} onChange={(event) => setRescheduleForm((current) => ({ ...current, date: event.target.value }))} /></label>
          <label className="block"><span className="mb-2 block font-bold">Time</span><select className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-3" required disabled={!rescheduleSlots.length} value={rescheduleForm.time} onChange={(event) => setRescheduleForm((current) => ({ ...current, time: event.target.value }))}><option value="">{rescheduleSlots.length ? 'Select a time slot' : 'Choose an available date'}</option>{rescheduleSlots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}</select>{rescheduleForm.date && !rescheduleSlots.length && <p className="mt-1 text-sm text-navy-500">The doctor is not available on the selected date.</p>}</label>
          <Button type="submit" className="w-full" disabled={submitting}>{submitting ? 'Saving...' : 'Save new appointment time'}</Button>
        </form>
      </Modal>
      <Modal open={bookingOpen} title="Book an appointment" onClose={() => setBookingOpen(false)}>
        <form className="space-y-4" onSubmit={submit}>
          <label className="block"><span className="mb-2 block font-bold">Appointment for</span><select className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-4" required value={form.patientId} onChange={(event) => setForm((current) => ({ ...current, patientId: event.target.value }))}><option value="">Select a linked patient</option>{profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}{profile.relationshipToAccount === 'SELF' || profile.isSelf ? ' (you)' : ` (${profile.relationship || 'family member'})`}</option>)}</select></label>
          <label className="block"><span className="mb-2 block font-bold">Department</span><select className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-4" required value={form.department} onChange={(event) => setForm((current) => ({ ...current, department: event.target.value, doctorId: '' }))}><option value="">Choose a department first</option>{departments.map((department) => <option key={department.id} value={department.name}>{department.name}</option>)}</select></label>
          <label className="block"><span className="mb-2 block font-bold">Doctor</span><select className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-4" required disabled={!form.department} value={form.doctorId} onChange={(event) => setForm((current) => ({ ...current, doctorId: event.target.value, time: '' }))}><option value="">{form.department ? 'Select a doctor' : 'Select a department first'}</option>{doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name}</option>)}</select>{form.department && doctors.length === 0 && <p className="mt-1 text-sm text-navy-500">No doctors are currently listed for this department.</p>}</label>
          <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-2 block font-bold">Date</span><input type="date" min={today} className="min-h-11 w-full rounded-lg border border-navy-100 px-3" required value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} /></label><label className="block"><span className="mb-2 block font-bold">Time</span><select className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-3" required disabled={!availableSlots.length} value={form.time} onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}><option value="">{availableSlots.length ? 'Select a time slot' : 'Choose an available date'}</option>{availableSlots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}</select>{form.date && !availableSlots.length && <p className="mt-1 text-sm text-navy-500">This doctor is not available on the selected date.</p>}</label></div>
          {booked && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">This slot appears booked. The booking API will make the final availability decision.</p>}
          <p className="text-xs text-navy-500">Email confirmation status will appear after the hospital notification service responds.</p>
          <Button type="submit" className="w-full" disabled={submitting || !profiles.length || !departments.length}><CalendarDays size={17} />{submitting ? 'Submitting...' : 'Request appointment'}</Button>
        </form>
      </Modal>
      <Modal open={familyOpen} title="Add a linked family member" onClose={() => setFamilyOpen(false)}>
        <form className="space-y-4" onSubmit={addFamilyProfile}>
          <Input label="Patient full name" required value={familyForm.name} onChange={(event) => setFamilyForm((current) => ({ ...current, name: event.target.value }))} />
          <label className="block"><span className="mb-2 block font-bold">Relationship to patient</span><input className="min-h-11 w-full rounded-lg border border-navy-100 px-4" required value={familyForm.relationship} onChange={(event) => setFamilyForm((current) => ({ ...current, relationship: event.target.value }))} placeholder="For example: parent, spouse, child" /></label>
          <div className="grid gap-4 sm:grid-cols-2"><Input label="Age" type="number" min="0" max="125" required value={familyForm.age} onChange={(event) => setFamilyForm((current) => ({ ...current, age: event.target.value }))} /><label className="block"><span className="mb-2 block font-bold">Gender</span><select className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-3" required value={familyForm.gender} onChange={(event) => setFamilyForm((current) => ({ ...current, gender: event.target.value }))}><option value="">Select</option><option>Female</option><option>Male</option><option>Other</option><option>Prefer not to say</option></select></label></div>
          <Input label="Phone number (optional)" type="tel" value={familyForm.phone} onChange={(event) => setFamilyForm((current) => ({ ...current, phone: event.target.value }))} />
          <p className="text-xs text-navy-500">The hospital service must verify your permission to manage this patient profile.</p>
          <Button type="submit" className="w-full" disabled={submitting}>{submitting ? 'Saving...' : 'Add linked profile'}</Button>
        </form>
      </Modal>
    </div>
  );
}
