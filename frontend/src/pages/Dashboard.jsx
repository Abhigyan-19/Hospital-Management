import { useEffect, useState } from 'react';
import { Activity, ArrowUpRight, BedDouble, CalendarCheck2, CalendarPlus, ChevronRight, Clock3, FilePlus2, UsersRound } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminService } from '../api/adminService';
import { apiErrorMessage } from '../api/errorMessage';
import { isDemoMode } from '../api/demoAuth';
import { Badge, Button, Card, EmptyState, Skeleton } from '../components/ui';

const departmentColors = ['#179c91', '#397d9e', '#e3a33b', '#248b62'];
const statIcons = {
  'Total patients': UsersRound,
  'Active doctors': Activity,
  "Today's appointments": CalendarCheck2,
  'Available beds': BedDouble,
};

function StatCard({ label, value, change, tone, icon: Icon }) {
  const toneClasses = { teal: 'bg-teal-100 text-teal-700', navy: 'bg-navy-100 text-navy-700', amber: 'bg-amber-100 text-warning', green: 'bg-emerald-100 text-success' };
  return <Card><div className={`mb-5 grid h-11 w-11 place-items-center rounded-xl ${toneClasses[tone] || toneClasses.teal}`}><Icon size={23} /></div><p className="font-bold text-navy-700">{label}</p><div className="mt-1 flex items-end justify-between gap-3"><p className="text-3xl font-black text-ink">{value}</p><span className="text-right text-sm font-extrabold text-navy-700">{change}</span></div></Card>;
}

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOverview = () => {
    setLoading(true);
    setError('');
    adminService.getOverview()
      .then(setOverview)
      .catch((requestError) => {
        const message = isDemoMode()
          ? requestError.message || 'Unable to load hospital analytics.'
          : apiErrorMessage(requestError, 'Backend not connected. Hospital dashboard analytics are unavailable.');
        setError(message);
        toast.error(message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadOverview(); }, []);

  return (
    <div className="mx-auto max-w-[1500px] space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="font-bold text-teal-700">{new Intl.DateTimeFormat('en', { dateStyle: 'full' }).format(new Date())}</p><h2 className="mt-1 text-3xl font-black tracking-tight text-ink sm:text-4xl">Today at a glance</h2><p className="mt-2 text-navy-700">Here is what needs your team&apos;s attention.</p></div>
        <Link to="/appointments" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-teal-600 px-5 font-bold text-white hover:bg-teal-700"><CalendarPlus size={19} />View appointments</Link>
      </div>
      {error && <Card role="alert" className="border-red-200 bg-red-50"><p className="font-bold text-danger">{error}</p><Button variant="secondary" className="mt-4" onClick={loadOverview} disabled={loading}>Try again</Button></Card>}
      {loading ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <Card key={item}><Skeleton className="h-28 w-full" /></Card>)}</div> : !error && overview && <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{overview.stats.map((stat) => <StatCard key={stat.label} {...stat} icon={statIcons[stat.label] || Activity} />)}</div>
        <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
          <Card><div><h3 className="text-xl font-extrabold">Appointments this week</h3><p className="mt-1 text-sm text-navy-700">Visits scheduled and completed by day</p></div>{overview.weeklyAppointments.length ? <div className="mt-7 h-64 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={overview.weeklyAppointments} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}><CartesianGrid stroke="#dcecf5" vertical={false} /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#397d9e', fontSize: 13, fontWeight: 700 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#397d9e', fontSize: 12 }} /><Tooltip cursor={{ fill: '#effaf8' }} contentStyle={{ border: '1px solid #dcecf5', borderRadius: 12, fontWeight: 700 }} /><Bar dataKey="scheduled" name="Scheduled" fill="#179c91" radius={[6, 6, 0, 0]} /><Bar dataKey="completed" name="Completed" fill="#397d9e" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div> : <EmptyState title="No appointment activity">Appointments will appear here when available.</EmptyState>}</Card>
          <Card><div className="flex items-start justify-between"><div><h3 className="text-xl font-extrabold">Patients by department</h3><p className="mt-1 text-sm text-navy-700">Patients with recorded appointments</p></div><Activity className="text-teal-600" size={22} /></div>{overview.departmentPatients.length ? <><div className="mt-3 h-52 w-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={overview.departmentPatients} dataKey="patients" nameKey="department" cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3}>{overview.departmentPatients.map((item, index) => <Cell key={item.department} fill={departmentColors[index % departmentColors.length]} />)}</Pie><Tooltip contentStyle={{ border: '1px solid #dcecf5', borderRadius: 12, fontWeight: 700 }} /></PieChart></ResponsiveContainer></div><div className="grid grid-cols-2 gap-3">{overview.departmentPatients.map((item, index) => <div key={item.department} className="flex items-center gap-2 text-sm font-bold text-navy-700"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: departmentColors[index % departmentColors.length] }} />{item.department}</div>)}</div></> : <EmptyState title="No department data">Department totals will appear after visits are recorded.</EmptyState>}</Card>
        </div>
        <Card><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h3 className="text-xl font-extrabold">Today&apos;s appointments</h3><p className="mt-1 text-sm text-navy-700">The next scheduled patient visits</p></div><Link to="/appointments" className="inline-flex items-center gap-1 font-extrabold text-teal-700">See all appointments <ChevronRight size={18} /></Link></div>{overview.appointments.length ? <div className="mt-6 divide-y divide-navy-100">{overview.appointments.map((appointment, index) => <div key={`${appointment.time}-${appointment.patient}-${index}`} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><span className="w-14 font-black text-navy-700">{appointment.time}</span><div><p className="font-extrabold">{appointment.patient}</p><p className="text-sm text-navy-700">{appointment.doctor} · {appointment.type}</p></div></div><div className="flex items-center gap-4 pl-[4.5rem] sm:pl-0"><Badge tone={appointment.status === 'Confirmed' || appointment.status === 'Completed' ? 'success' : 'warning'}>{appointment.status}</Badge><ArrowUpRight size={20} aria-hidden="true" /></div></div>)}</div> : <div className="mt-5"><EmptyState title="No appointments scheduled for today">Appointments scheduled for today will appear here.</EmptyState></div>}</Card>
        <div><h3 className="text-xl font-extrabold">Quick actions</h3><div className="mt-4 grid gap-4 sm:grid-cols-3"><Link to="/patients" className="group rounded-2xl border border-navy-100 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:border-teal-100"><span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-100 text-teal-700"><FilePlus2 size={22} /></span><p className="mt-4 font-extrabold">Add patient</p><p className="mt-1 text-sm text-navy-700">Create a new patient record</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-extrabold text-teal-700">Open form <ChevronRight size={16} /></span></Link><Link to="/appointments" className="group rounded-2xl border border-navy-100 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:border-teal-100"><span className="grid h-11 w-11 place-items-center rounded-xl bg-navy-100 text-navy-700"><CalendarCheck2 size={22} /></span><p className="mt-4 font-extrabold">Manage appointments</p><p className="mt-1 text-sm text-navy-700">Review hospital appointment bookings</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-extrabold text-teal-700">Open appointments <ChevronRight size={16} /></span></Link><Link to="/admin/staff" className="group rounded-2xl border border-navy-100 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:border-teal-100"><span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-100 text-warning"><UsersRound size={22} /></span><p className="mt-4 font-extrabold">View care team</p><p className="mt-1 text-sm text-navy-700">Review doctors and staff</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-extrabold text-teal-700">Open directory <ChevronRight size={16} /></span></Link></div></div>
        <div className="flex items-center gap-2 text-sm text-navy-500"><Clock3 size={17} />Metrics from hospital records</div>
      </>}
    </div>
  );
}
