import { useEffect, useState } from 'react';
import { CalendarDays, FileText, FlaskConical, HeartPulse, ReceiptText, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { appointmentService } from '../api/appointmentService';
import { patientPortalService } from '../api/patientPortalService';
import { patientService } from '../api/patientService';
import { prescriptionService } from '../api/prescriptionService';
import { apiErrorMessage } from '../api/errorMessage';
import { Badge, Button, Card, EmptyState } from '../components/ui';

function getLocalDate() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      appointmentService.listMine(),
      prescriptionService.listMine(),
      patientService.listLinked(),
    ])
      .then(async ([appointmentData, prescriptionData, profiles]) => {
        const self = profiles.find((profile) => profile.isSelf || profile.relationshipToAccount === 'SELF') || profiles[0];
        if (!self) throw new Error('No patient profile is linked to your account.');
        const invoiceData = await patientPortalService.listInvoices(self.id);
        setAppointments(appointmentData);
        setPrescriptions(prescriptionData);
        setInvoices(invoiceData);
      })
      .catch((requestError) => {
        const message = apiErrorMessage(requestError, 'Your patient summary needs patient appointments, prescriptions, and invoice endpoints.');
        setError(message);
        toast.error(message);
      })
      .finally(() => setLoading(false));
  }, []);

  const nextAppointment = appointments
    .filter((appointment) => appointment.date >= getLocalDate() && !['Cancelled', 'Completed'].includes(appointment.status))
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))[0];
  const recentPrescription = [...prescriptions].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0];
  const pendingInvoices = invoices.filter((invoice) => !['PAID', 'Paid'].includes(invoice.status));

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <div>
        <p className="font-bold text-teal-700">Your care</p>
        <h2 className="mt-1 text-3xl font-black text-ink sm:text-4xl">Patient dashboard</h2>
        <p className="mt-2 text-navy-700">Review upcoming visits and your care records.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/my-appointments"><Card className="h-full"><CalendarDays className="text-teal-700" /><h3 className="mt-3 font-extrabold">Appointments</h3><p className="mt-1 text-sm text-navy-700">{nextAppointment ? `${nextAppointment.date} at ${nextAppointment.time}` : 'No upcoming appointments'}</p></Card></Link>
        <Link to="/prescriptions"><Card className="h-full"><FileText className="text-teal-700" /><h3 className="mt-3 font-extrabold">Prescriptions</h3><p className="mt-1 text-sm text-navy-700">{recentPrescription ? `Latest: ${recentPrescription.createdAt}` : 'No prescriptions to show'}</p></Card></Link>
        <Link to="/patient/billing"><Card className="h-full"><ReceiptText className="text-teal-700" /><h3 className="mt-3 font-extrabold">Pending bills</h3><p className="mt-1 text-sm text-navy-700">{loading ? 'Loading billing status...' : `${pendingInvoices.length} unpaid invoice${pendingInvoices.length === 1 ? '' : 's'}`}</p></Card></Link>
        <Link to="/patient/records"><Card className="h-full"><FlaskConical className="text-teal-700" /><h3 className="mt-3 font-extrabold">Health summary</h3><p className="mt-1 text-sm text-navy-700">Review visits, conditions and lab reports.</p></Card></Link>
        <Link to="/patient/profile"><Card className="h-full"><UserRound className="text-teal-700" /><h3 className="mt-3 font-extrabold">My health profile</h3><p className="mt-1 text-sm text-navy-700">Update allergies and emergency information.</p></Card></Link>
        <Link to="/urgent-help"><Card className="h-full"><HeartPulse className="text-danger" /><h3 className="mt-3 font-extrabold">Urgent help</h3><p className="mt-1 text-sm text-navy-700">Send an urgent request to hospital staff.</p></Card></Link>
      </div>
      {error && <Card className="border-red-200 bg-red-50"><p className="font-bold text-danger">Some patient information is unavailable</p><p className="mt-1 text-navy-700">{error}</p></Card>}
      <Card>
        <div className="flex items-center justify-between gap-3"><div><h3 className="text-xl font-extrabold">Upcoming appointments</h3><p className="mt-1 text-sm text-navy-700">Appointment information is loaded from your hospital account.</p></div><Link to="/my-appointments"><Button variant="secondary">View all</Button></Link></div>
        <div className="mt-5 space-y-3">
          {loading && <p className="text-sm text-navy-700">Loading your appointments...</p>}
          {!loading && !nextAppointment && <EmptyState title="No upcoming appointments">You can book a visit or review past appointments.</EmptyState>}
          {nextAppointment && (
            <div key={nextAppointment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy-100 p-4">
              <div><p className="font-extrabold">{nextAppointment.doctor?.name || 'Doctor'} · {nextAppointment.doctor?.specialization || nextAppointment.department || 'Department'}</p><p className="mt-1 text-sm text-navy-700">{nextAppointment.date} at {nextAppointment.time}</p><p className="text-sm text-navy-500">For {nextAppointment.patient?.name || 'your patient profile'}</p></div>
              <Badge tone={nextAppointment.status === 'Confirmed' ? 'success' : 'info'}>{nextAppointment.status || 'Status pending'}</Badge>
            </div>
          )}
          {nextAppointment && appointments.length > 1 && (
            <p className="text-sm text-navy-700">{appointments.length - 1} other appointment record{appointments.length === 2 ? '' : 's'} available in <Link className="font-bold text-teal-700 underline" to="/my-appointments">My appointments</Link>.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
