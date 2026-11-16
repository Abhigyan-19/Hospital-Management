import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { adminService } from '../api/adminService';
import { apiErrorMessage } from '../api/errorMessage';
import { isDemoMode } from '../api/demoAuth';
import { Button, Card, EmptyState, SearchBox, Skeleton } from '../components/ui';

const pageSize = 10;

function localDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function recentRange() {
  const today = new Date();
  const from = new Date(today);
  from.setDate(from.getDate() - 30);
  return { fromDate: localDateValue(from), toDate: localDateValue(today) };
}

export default function AdminAuditLog() {
  const [range, setRange] = useState(recentRange);
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadEntries = (requestedRange = range) => {
    if (requestedRange.fromDate > requestedRange.toDate) {
      const message = 'The start date must be on or before the end date.';
      setError(message);
      toast.error(message);
      return;
    }
    setLoading(true);
    setError('');
    adminService.listAuditLog(requestedRange)
      .then(setEntries)
      .catch((requestError) => {
        const message = isDemoMode()
          ? requestError.message || 'Unable to load the audit log.'
          : apiErrorMessage(requestError, 'Backend not connected. Audit records are unavailable.');
        setError(message);
        toast.error(message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadEntries(recentRange()); }, []);

  const filtered = useMemo(() => entries.filter((entry) => {
    const date = String(entry.occurredAt || '').slice(0, 10);
    const inRange = !isDemoMode() || (date >= range.fromDate && date <= range.toDate);
    const text = `${entry.actorName} ${entry.actorRole} ${entry.action} ${entry.entityType} ${entry.entityId} ${entry.summary}`.toLowerCase();
    return inRange && text.includes(search.trim().toLowerCase());
  }), [entries, range, search]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visibleEntries = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="mx-auto max-w-[1300px] space-y-6">
      <header><p className="font-bold text-teal-700">Accountability and traceability</p><h2 className="mt-1 text-3xl font-black text-ink sm:text-4xl">Audit log</h2><p className="mt-2 text-navy-700">Review administrative changes with actor, time, and affected record.</p></header>
      {error && <Card role="alert" className="border-red-200 bg-red-50"><p className="font-bold text-danger">{error}</p><Button variant="secondary" className="mt-4" onClick={() => loadEntries(range)} disabled={loading}>Try again</Button></Card>}
      <Card><form onSubmit={(event) => { event.preventDefault(); setPage(1); loadEntries(range); }} className="grid gap-4 sm:grid-cols-[1fr_1fr_1.5fr_auto] sm:items-end"><label className="block"><span className="mb-2 block font-bold">From date</span><input type="date" value={range.fromDate} onChange={(event) => setRange({ ...range, fromDate: event.target.value })} className="min-h-11 w-full rounded-lg border border-navy-100 px-4" /></label><label className="block"><span className="mb-2 block font-bold">To date</span><input type="date" value={range.toDate} onChange={(event) => setRange({ ...range, toDate: event.target.value })} className="min-h-11 w-full rounded-lg border border-navy-100 px-4" /></label><div><span className="mb-2 block font-bold">Search log</span><SearchBox value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search action, actor or record" /></div><Button type="submit" disabled={loading}>Apply filters</Button></form>
        {loading ? <div className="mt-5 space-y-3">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-16 w-full" />)}</div> : !error && !filtered.length ? <div className="mt-5"><EmptyState title="No audit entries found">Administrative changes will be listed here when recorded.</EmptyState></div> : !error && <>
          <div className="responsive-table mt-5 overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead><tr className="border-b border-navy-100 text-sm text-navy-500"><th className="px-3 py-3">Date and time</th><th className="px-3 py-3">Actor</th><th className="px-3 py-3">Action</th><th className="px-3 py-3">Affected record</th><th className="px-3 py-3">Details</th></tr></thead>
              <tbody>{visibleEntries.map((entry) => <tr key={entry.id} className="border-b border-navy-100 align-top last:border-0">
                <td data-label="Date and time" className="px-3 py-4 font-bold">{entry.occurredAt ? new Date(entry.occurredAt).toLocaleString() : 'Time unavailable'}</td>
                <td data-label="Actor" className="px-3 py-4"><p className="font-extrabold">{entry.actorName || 'Administrator'}</p><p className="mt-1 text-sm text-navy-700">{entry.actorRole || 'ADMIN'}</p></td>
                <td data-label="Action" className="px-3 py-4 font-bold">{entry.action}</td>
                <td data-label="Affected record" className="px-3 py-4">{entry.entityType || 'Record'}{entry.entityId ? ` · ${entry.entityId}` : ''}</td>
                <td data-label="Details" className="max-w-sm px-3 py-4 text-navy-700">{entry.summary || 'No details provided.'}</td>
              </tr>)}</tbody>
            </table>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-bold text-navy-700">{filtered.length} audit entr{filtered.length === 1 ? 'y' : 'ies'} · Page {page} of {pageCount}</p><div className="flex gap-2"><Button variant="secondary" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button><Button variant="secondary" disabled={page >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>Next</Button></div></div>
        </>}
      </Card>
    </div>
  );
}
