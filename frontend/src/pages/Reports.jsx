import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Download, FileBarChart, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../api/adminService';
import { apiErrorMessage } from '../api/errorMessage';
import { isDemoMode } from '../api/demoAuth';
import { Button, Card, EmptyState, Skeleton } from '../components/ui';

function localDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function initialRange() {
  const now = new Date();
  return {
    fromDate: localDateValue(new Date(now.getFullYear(), now.getMonth(), 1)),
    toDate: localDateValue(now),
  };
}

function csvCell(value) {
  const text = String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}

function exportCsv(report) {
  const rows = [
    ['Report', 'From', report.fromDate],
    ['Report', 'To', report.toDate],
    [],
    ['Metric', 'Value'],
    ['Patients registered', report.registeredPatients],
    ['Appointments completed', report.completedAppointments],
    ['Recorded revenue', report.recordedRevenue],
    [],
    ['Appointment status', 'Total'],
    ...report.appointmentStatuses.map((item) => [item.status, item.total]),
    [],
    ['Department', 'Revenue'],
    ...report.revenueByDepartment.map((item) => [item.department, item.revenue]),
  ];
  const content = rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sebasethu-report-${report.fromDate}-to-${report.toDate}.csv`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
  toast.success('CSV report downloaded.');
}

export default function Reports() {
  const [range, setRange] = useState(initialRange);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReport = (requestedRange = range) => {
    if (requestedRange.fromDate > requestedRange.toDate) {
      const message = 'The start date must be on or before the end date.';
      setError(message);
      toast.error(message);
      return;
    }
    setLoading(true);
    setError('');
    adminService.getReport(requestedRange.fromDate, requestedRange.toDate)
      .then(setReport)
      .catch((requestError) => {
        const message = isDemoMode()
          ? requestError.message || 'Unable to load hospital reports.'
          : apiErrorMessage(requestError, 'Backend not connected. Hospital reports are unavailable.');
        setError(message);
        toast.error(message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadReport(initialRange()); }, []);

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="font-bold text-teal-700">Decisions with context</p><h2 className="mt-1 text-3xl font-black text-ink sm:text-4xl">Reports & analytics</h2><p className="mt-2 text-navy-700">Filter patient flow, appointments, and recorded revenue by date.</p></div><Button onClick={() => report && exportCsv(report)} disabled={!report || loading}><Download size={19} />Export CSV</Button></div>
      <Card><form onSubmit={(event) => { event.preventDefault(); loadReport(range); }} className="flex flex-col gap-4 sm:flex-row sm:items-end"><label className="block flex-1"><span className="mb-2 block font-bold">From date</span><input type="date" value={range.fromDate} onChange={(event) => setRange({ ...range, fromDate: event.target.value })} className="min-h-11 w-full rounded-lg border border-navy-100 px-4" /></label><label className="block flex-1"><span className="mb-2 block font-bold">To date</span><input type="date" value={range.toDate} onChange={(event) => setRange({ ...range, toDate: event.target.value })} className="min-h-11 w-full rounded-lg border border-navy-100 px-4" /></label><Button type="submit" disabled={loading}>Apply range</Button></form></Card>
      {error && <Card role="alert" className="border-red-200 bg-red-50"><p className="font-bold text-danger">{error}</p><Button variant="secondary" className="mt-4" onClick={() => loadReport(range)} disabled={loading}>Try again</Button></Card>}
      {loading ? <div className="grid gap-4 sm:grid-cols-3">{[1, 2, 3].map((item) => <Card key={item}><Skeleton className="h-24 w-full" /></Card>)}</div> : !error && report && <>
        <p className="text-sm font-bold text-navy-700">Report period: {report.fromDate} to {report.toDate}{isDemoMode() ? ' · Demo records' : ''}</p>
        <div className="grid gap-4 sm:grid-cols-3"><Card><p className="font-bold text-navy-700">Patients registered</p><p className="mt-2 text-3xl font-black">{report.registeredPatients}</p></Card><Card><p className="font-bold text-navy-700">Appointments completed</p><p className="mt-2 text-3xl font-black">{report.completedAppointments}</p></Card><Card><p className="font-bold text-navy-700">Recorded revenue</p><p className="mt-2 text-3xl font-black">₹{Number(report.recordedRevenue).toLocaleString('en-IN')}</p></Card></div>
        <div className="grid gap-6 xl:grid-cols-2"><Card><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-100 text-teal-700"><TrendingUp size={22} /></span><div><h3 className="text-xl font-extrabold">Patient registrations</h3><p className="text-sm text-navy-700">Within the selected period</p></div></div>{report.registrations.length ? <div className="mt-6 h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={report.registrations}><CartesianGrid stroke="#dcecf5" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} /><Tooltip /><Line type="monotone" dataKey="patients" name="Patients" stroke="#179c91" strokeWidth={3} dot={{ fill: '#179c91', r: 4 }} /></LineChart></ResponsiveContainer></div> : <div className="mt-5"><EmptyState title="No registrations in this period">Patient registration data will appear when it is available.</EmptyState></div>}</Card><Card><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-navy-100 text-navy-700"><FileBarChart size={22} /></span><div><h3 className="text-xl font-extrabold">Appointments by status</h3><p className="text-sm text-navy-700">Within the selected period</p></div></div>{report.appointmentStatuses.length ? <div className="mt-6 h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={report.appointmentStatuses} layout="vertical" margin={{ left: 12, right: 12 }}><CartesianGrid stroke="#dcecf5" horizontal={false} /><XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} /><YAxis dataKey="status" type="category" axisLine={false} tickLine={false} width={90} /><Tooltip /><Bar dataKey="total" name="Appointments" fill="#397d9e" radius={[0, 6, 6, 0]} /></BarChart></ResponsiveContainer></div> : <div className="mt-5"><EmptyState title="No appointments in this period">Appointment status counts will appear when visits are recorded.</EmptyState></div>}</Card></div>
        <Card><h3 className="text-xl font-extrabold">Recorded revenue by department</h3>{report.revenueByDepartment.length ? <div className="responsive-table mt-5 overflow-x-auto">
          <table className="w-full min-w-[500px] text-left">
            <thead><tr className="border-b border-navy-100 text-sm text-navy-500"><th className="px-3 py-3">Department</th><th className="px-3 py-3">Revenue</th><th className="px-3 py-3">Share of listed revenue</th></tr></thead>
            <tbody>{report.revenueByDepartment.map((item) => <tr key={item.department} className="border-b border-navy-100 last:border-0">
              <td data-label="Department" className="px-3 py-4 font-extrabold">{item.department}</td>
              <td data-label="Revenue" className="px-3 py-4">₹{Number(item.revenue).toLocaleString('en-IN')}</td>
              <td data-label="Share" className="px-3 py-4 font-bold text-teal-700">{report.recordedRevenue ? `${Math.round((item.revenue / report.recordedRevenue) * 100)}%` : '0%'}</td>
            </tr>)}</tbody>
          </table>
        </div> : <div className="mt-5"><EmptyState title="No recorded revenue in this period">Only invoices marked paid are included in revenue reports.</EmptyState></div>}</Card>
      </>}
    </div>
  );
}
