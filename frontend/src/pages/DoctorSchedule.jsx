import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { doctorPortalService } from '../api/doctorPortalService';
import { apiErrorMessage } from '../api/errorMessage';
import { Badge, Button, Card, EmptyState } from '../components/ui';

function dateKey(date) {
  const adjusted = new Date(date);
  adjusted.setMinutes(adjusted.getMinutes() - adjusted.getTimezoneOffset());
  return adjusted.toISOString().slice(0, 10);
}

export default function DoctorSchedule() {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dateKey(new Date()));
  const [view, setView] = useState('day');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    doctorPortalService.listSchedule()
      .then((data) => {
        setAppointments(data);
        const today = dateKey(new Date());
        if (!data.some((appointment) => appointment.date === today)) {
          const nextAppointment = data.find((appointment) => appointment.date >= today && !['Completed', 'Cancelled'].includes(appointment.status));
          if (nextAppointment) setSelectedDate(nextAppointment.date);
        }
      })
      .catch((requestError) => {
        const message = apiErrorMessage(requestError, 'Your schedule service is not available.');
        setError(message);
        toast.error(message);
      })
      .finally(() => setLoading(false));
  }, []);

  const visibleAppointments = useMemo(() => {
    let start = selectedDate;
    let end = selectedDate;
    if (view === 'week') {
      const weekStart = new Date(`${selectedDate}T12:00:00`);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      start = dateKey(weekStart);
      end = dateKey(weekEnd);
    }
    return appointments.filter((appointment) => appointment.date >= start && appointment.date <= end)
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  }, [appointments, selectedDate, view]);

  const moveDate = (days) => {
    const date = new Date(`${selectedDate}T12:00:00`);
    date.setDate(date.getDate() + days);
    setSelectedDate(dateKey(date));
  };

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-bold text-teal-700">Clinician workspace</p><h2 className="mt-1 text-3xl font-black text-ink sm:text-4xl">My schedule</h2><p className="mt-2 text-navy-700">Appointments assigned to your doctor account.</p></div><Link to="/doctor/availability"><Button variant="secondary">Manage availability</Button></Link></header>
      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <label className="block"><span className="mb-1 block font-bold">Date</span><input aria-label="Schedule date" type="date" className="min-h-11 rounded-lg border border-navy-100 bg-white px-3" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} /></label>
          <div className="flex gap-2 self-end"><Button variant="secondary" aria-label="Previous period" onClick={() => moveDate(view === 'day' ? -1 : -7)}><ChevronLeft size={18} />Previous</Button><Button variant="secondary" aria-label="Next period" onClick={() => moveDate(view === 'day' ? 1 : 7)}>Next<ChevronRight size={18} /></Button></div>
          <div className="ml-auto flex gap-2 self-end" role="group" aria-label="Schedule view">
            <Button variant={view === 'day' ? 'primary' : 'secondary'} aria-pressed={view === 'day'} onClick={() => setView('day')}>Day view</Button>
            <Button variant={view === 'week' ? 'primary' : 'secondary'} aria-pressed={view === 'week'} onClick={() => setView('week')}>Week view</Button>
          </div>
        </div>
      </Card>
      {error && <Card className="border-red-200 bg-red-50"><p className="font-bold text-danger">Schedule could not be loaded</p><p className="mt-1 text-navy-700">{error}</p></Card>}
      <Card>
        <div className="flex items-center gap-2"><CalendarDays className="text-teal-700" /><h3 className="text-xl font-extrabold">{view === 'day' ? selectedDate : `Week of ${selectedDate}`}</h3></div>
        {loading ? <p className="mt-5 text-navy-700">Loading your schedule...</p> : !visibleAppointments.length ? <div className="mt-5"><EmptyState title="No appointments in this period">Appointments assigned to you will appear on the selected day or week.</EmptyState></div> : (
          <div className="mt-5 space-y-3">{visibleAppointments.map((appointment) => (
            <article key={appointment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy-100 p-4">
              <div><p className="font-extrabold">{appointment.time} · {appointment.patient?.name || 'Patient'}</p><p className="mt-1 text-sm text-navy-700">{appointment.date}{appointment.patient?.phone ? ` · ${appointment.patient.phone}` : ''}</p></div>
              <div className="flex flex-wrap items-center gap-2"><Badge tone={appointment.status === 'Completed' ? 'success' : appointment.status === 'Cancelled' ? 'danger' : 'info'}>{appointment.status || 'Scheduled'}</Badge>{appointment.patient?.id && <Link to={`/doctor/patients/${appointment.patient.id}`}><Button variant="secondary">Patient chart</Button></Link>}{!['Completed', 'Cancelled'].includes(appointment.status) && <Link to={`/doctor/consultation/${appointment.id}`}><Button>Consultation</Button></Link>}</div>
            </article>
          ))}</div>
        )}
      </Card>
    </div>
  );
}
