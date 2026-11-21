import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ClipboardList, Clock3, UserRound, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { doctorPortalService } from '../api/doctorPortalService';
import { apiErrorMessage } from '../api/errorMessage';
import { Badge, Button, Card, EmptyState } from '../components/ui';

function localDate(date = new Date()) {
  const adjusted = new Date(date);
  adjusted.setMinutes(adjusted.getMinutes() - adjusted.getTimezoneOffset());
  return adjusted.toISOString().slice(0, 10);
}

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const today = localDate();

  useEffect(() => {
    doctorPortalService.listSchedule()
      .then(setAppointments)
      .catch((requestError) => {
        const message = apiErrorMessage(requestError, 'Your doctor schedule is not available.');
        setError(message);
        toast.error(message);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeAppointments = useMemo(() => appointments
    .filter((appointment) => !['Cancelled', 'Completed'].includes(appointment.status))
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)), [appointments]);
  const todayCount = activeAppointments.filter((appointment) => appointment.date === today).length;
  const nextAppointment = activeAppointments.find((appointment) => appointment.date >= today);
  const pendingCount = activeAppointments.length;

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="font-bold text-teal-700">Clinician workspace</p><h2 className="mt-1 text-3xl font-black text-ink sm:text-4xl">Doctor dashboard</h2><p className="mt-2 text-navy-700">Your schedule, assigned patients and consultation tasks.</p></div>
        <Link to="/doctor/schedule"><Button variant="secondary"><CalendarDays size={18} />Open my schedule</Button></Link>
      </header>
      {error && <Card className="border-red-200 bg-red-50"><p className="font-bold text-danger">Schedule could not be loaded</p><p className="mt-1 text-navy-700">{error}</p></Card>}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CalendarDays className="text-teal-700" /><p className="mt-3 font-bold text-navy-700">Today's patients</p><p className="mt-1 text-3xl font-black">{loading ? '…' : todayCount}</p></Card>
        <Card><Clock3 className="text-teal-700" /><p className="mt-3 font-bold text-navy-700">Next patient</p><p className="mt-1 font-extrabold">{loading ? 'Loading...' : nextAppointment?.patient?.name || 'No upcoming patient'}</p><p className="text-sm text-navy-700">{nextAppointment ? `${nextAppointment.date} at ${nextAppointment.time}` : 'Your schedule is clear.'}</p></Card>
        <Card><ClipboardList className="text-teal-700" /><p className="mt-3 font-bold text-navy-700">Pending visits</p><p className="mt-1 text-3xl font-black">{loading ? '…' : pendingCount}</p></Card>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/doctor/patients"><Card className="h-full"><Users className="text-teal-700" /><h3 className="mt-3 font-extrabold">My patients</h3><p className="mt-1 text-sm text-navy-700">Search patients assigned through your appointments.</p></Card></Link>
        <Link to="/doctor/availability"><Card className="h-full"><Clock3 className="text-teal-700" /><h3 className="mt-3 font-extrabold">Manage availability</h3><p className="mt-1 text-sm text-navy-700">Set working days, appointment hours and leave.</p></Card></Link>
        <Link to="/doctor/profile"><Card className="h-full"><UserRound className="text-teal-700" /><h3 className="mt-3 font-extrabold">My profile</h3><p className="mt-1 text-sm text-navy-700">Review professional details and contact information.</p></Card></Link>
      </div>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-xl font-extrabold">Next appointments</h3><p className="mt-1 text-sm text-navy-700">Only appointments assigned to your doctor account are shown.</p></div><Link to="/doctor/schedule"><Button variant="secondary">View full schedule</Button></Link></div>
        <div className="mt-5 space-y-3">
          {!loading && !error && !activeAppointments.length && <EmptyState title="No appointments to show">Your assigned appointments will appear here.</EmptyState>}
          {activeAppointments.slice(0, 4).map((appointment) => (
            <div key={appointment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy-100 p-4">
              <div><p className="font-extrabold">{appointment.patient?.name || 'Patient'}</p><p className="mt-1 text-sm text-navy-700">{appointment.date} at {appointment.time}</p></div>
              <div className="flex flex-wrap items-center gap-2"><Badge tone={appointment.status === 'Confirmed' ? 'success' : 'info'}>{appointment.status || 'Scheduled'}</Badge><Link to={`/doctor/patients/${appointment.patient?.id}`}><Button variant="secondary">Open patient chart</Button></Link><Link to={`/doctor/consultation/${appointment.id}`}><Button>Start consultation</Button></Link></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
