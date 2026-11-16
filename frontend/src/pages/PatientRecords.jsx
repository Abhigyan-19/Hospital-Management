import { useCallback, useEffect, useState } from 'react';
import { FileDown, Printer, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { patientService } from '../api/patientService';
import { patientPortalService } from '../api/patientPortalService';
import { apiErrorMessage } from '../api/errorMessage';
import { Badge, Button, Card, EmptyState, Loading } from '../components/ui';

const pageDetails = {
  history: { title: 'Health summary', description: 'Visits and health information for you and your linked family profiles.' },
  labs: { title: 'Lab reports', description: 'View available laboratory results for your linked profiles.' },
  bills: { title: 'Bills and payments', description: 'Review invoices and payment status for a selected patient profile.' },
};

export default function PatientRecords({ type = 'history' }) {
  const [profiles, setProfiles] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [records, setRecords] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [error, setError] = useState('');
  const [printTarget, setPrintTarget] = useState(null);
  const detail = pageDetails[type];

  const loadProfiles = useCallback(async () => {
    setError('');
    setLoadingProfiles(true);
    try {
      const data = await patientService.listLinked();
      setProfiles(data);
      setSelectedId((current) => current || String(data.find((profile) => profile.isSelf || profile.relationshipToAccount === 'SELF')?.id || data[0]?.id || ''));
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'Linked patient profiles are not available.'));
    } finally {
      setLoadingProfiles(false);
    }
  }, []);

  const loadRecords = useCallback(async () => {
    if (!selectedId) return;
    setError('');
    setLoadingRecords(true);
    try {
      const request = type === 'labs'
        ? patientPortalService.listLabReports(selectedId)
        : type === 'bills'
          ? patientPortalService.listInvoices(selectedId)
          : patientPortalService.listMedicalHistory(selectedId);
      setRecords(await request);
    } catch (requestError) {
      setRecords([]);
      setError(apiErrorMessage(requestError, 'The patient records service is not available.'));
    } finally {
      setLoadingRecords(false);
    }
  }, [selectedId, type]);

  useEffect(() => { loadProfiles(); }, [loadProfiles]);
  useEffect(() => { loadRecords(); }, [loadRecords]);

  const downloadReport = (report) => {
    if (report.downloadUrl) {
      window.open(report.downloadUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    setPrintTarget({ kind: 'lab', record: report });
    window.setTimeout(() => window.print(), 0);
  };

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <header>
        <p className="font-bold text-teal-700">Patient portal</p>
        <h2 className="mt-1 text-3xl font-black text-ink sm:text-4xl">{detail.title}</h2>
        <p className="mt-2 text-navy-700">{detail.description}</p>
      </header>
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <label className="block min-w-64 flex-1">
            <span className="mb-2 block font-bold">Patient profile</span>
            <select className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-4" value={selectedId} onChange={(event) => setSelectedId(event.target.value)} disabled={loadingProfiles || !profiles.length}>
              {profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}{profile.isSelf || profile.relationshipToAccount === 'SELF' ? ' (you)' : ` (${profile.relationship || 'family member'})`}</option>)}
            </select>
          </label>
          <Button variant="secondary" onClick={() => { loadProfiles(); loadRecords(); }} disabled={loadingProfiles || loadingRecords}><RefreshCw size={17} />Refresh records</Button>
        </div>
      </Card>
      {error && <Card className="border-red-200 bg-red-50"><p className="font-bold text-danger">Records could not be loaded</p><p className="mt-1 text-navy-700">{error}</p><Button variant="secondary" className="mt-4" onClick={loadRecords}>Try again</Button></Card>}
      <Card>
        {loadingProfiles || loadingRecords ? <Loading label="Loading your records..." /> : error ? null : records.length === 0 ? (
          <EmptyState title="No records to show">There are no {type === 'labs' ? 'lab reports' : type === 'bills' ? 'invoices' : 'health history entries'} available for this profile yet.</EmptyState>
        ) : type === 'history' ? (
          <ol className="space-y-4">{records.map((record) => (
            <li key={record.id} className="rounded-xl border border-navy-100 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-extrabold">{record.title}</h3><Badge tone="info">{record.type || 'Health record'}</Badge></div>
              <p className="mt-1 text-sm text-navy-500">{record.date}</p>
              <p className="mt-2 leading-7 text-navy-700">{record.detail || record.description}</p>
            </li>
          ))}</ol>
        ) : type === 'labs' ? (
          <div className="space-y-3">{records.map((report) => (
            <article key={report.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy-100 p-4">
              <div><h3 className="font-extrabold">{report.name || report.testName || 'Lab report'}</h3><p className="mt-1 text-sm text-navy-700">{report.date || report.createdAt}</p>{report.result && <p className="mt-2 leading-7 text-navy-700">{report.result}</p>}</div>
              <div className="flex items-center gap-3"><Badge tone={report.status === 'Ready' || report.status === 'COMPLETED' ? 'success' : 'warning'}>{report.status || 'Status unavailable'}</Badge><Button variant="secondary" onClick={() => downloadReport(report)}><FileDown size={17} />View / print</Button></div>
            </article>
          ))}</div>
        ) : (
          <div className="space-y-3">{records.map((invoice) => (
            <article key={invoice.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy-100 p-4">
              <div><h3 className="font-extrabold">{invoice.description || invoice.invoiceNumber || 'Invoice'}</h3><p className="mt-1 text-sm text-navy-700">{invoice.invoiceNumber} · {invoice.date}</p><p className="mt-2 font-bold">₹{Number(invoice.amount || invoice.total || 0).toLocaleString('en-IN')}</p></div>
              <div className="flex items-center gap-3"><Badge tone={invoice.status === 'Paid' || invoice.status === 'PAID' ? 'success' : 'warning'}>{invoice.status || 'Payment status unavailable'}</Badge><Button variant="secondary" onClick={() => { setPrintTarget({ kind: 'invoice', record: invoice }); window.setTimeout(() => window.print(), 0); }}><Printer size={17} />Print invoice</Button></div>
            </article>
          ))}</div>
        )}
      </Card>
      {printTarget && <article className="print-document print-document-only" aria-hidden="true">
        <p className="text-sm font-bold uppercase tracking-widest text-navy-500">SEBASETHU patient record</p>
        <h1 className="mt-3 text-3xl font-black">{printTarget.kind === 'lab' ? 'Laboratory report' : 'Invoice'}</h1>
        <p className="mt-4"><strong>Patient:</strong> {profiles.find((profile) => String(profile.id) === String(selectedId))?.name || 'Patient'}</p>
        {printTarget.kind === 'lab' ? <>
          <p className="mt-2"><strong>Test:</strong> {printTarget.record.name || printTarget.record.testName || 'Lab report'}</p>
          <p className="mt-2"><strong>Date:</strong> {printTarget.record.date || printTarget.record.createdAt || 'Date unavailable'}</p>
          <p className="mt-2"><strong>Status:</strong> {printTarget.record.status || 'Unavailable'}</p>
          <p className="mt-4 whitespace-pre-wrap">{printTarget.record.result || 'No result text was supplied.'}</p>
        </> : <>
          <p className="mt-2"><strong>Invoice:</strong> {printTarget.record.invoiceNumber || 'Not provided'}</p>
          <p className="mt-2"><strong>Description:</strong> {printTarget.record.description || 'Invoice'}</p>
          <p className="mt-2"><strong>Date:</strong> {printTarget.record.date || 'Date unavailable'}</p>
          <p className="mt-2"><strong>Amount:</strong> ₹{Number(printTarget.record.amount || printTarget.record.total || 0).toLocaleString('en-IN')}</p>
          <p className="mt-2"><strong>Payment status:</strong> {printTarget.record.status || 'Unavailable'}</p>
        </>}
      </article>}
    </div>
  );
}
