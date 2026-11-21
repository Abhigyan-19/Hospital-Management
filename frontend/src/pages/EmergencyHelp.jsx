import { useEffect, useState } from 'react';
import { AlertTriangle, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { emergencyService } from '../api/emergencyService';
import { apiErrorMessage } from '../api/errorMessage';
import { Button, Card, EmptyState, Skeleton } from '../components/ui';

export default function EmergencyHelp() {
  const [requests, setRequests] = useState([]);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');

  const loadRequests = async () => {
    setLoading(true);
    setLoadError('');
    try {
      setRequests(await emergencyService.listMine());
    } catch (requestError) {
      const message = apiErrorMessage(requestError, 'Urgent-help requests could not be loaded.');
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRequests(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (!reason.trim()) return toast.error('Please describe why you need urgent help.');
    setSubmitting(true);
    try {
      const request = await emergencyService.submit({ reason: reason.trim(), details: details.trim() });
      setRequests((current) => [request, ...current]);
      setReason('');
      setDetails('');
      toast.success(request.status === 'DEMO_ONLY_NOT_SENT' ? 'Demo request saved locally; hospital staff were not notified.' : 'Your request was accepted by the hospital service.');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'The urgent-help service could not accept your request.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <div><p className="font-bold text-danger">Urgent support</p><h2 className="mt-1 text-3xl font-black text-ink sm:text-4xl">Request urgent help</h2><p className="mt-2 text-navy-700">Send a request to the hospital team and check its status.</p></div>
      <div role="alert" className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900"><AlertTriangle className="mt-0.5 shrink-0" /><p><strong>Immediate danger?</strong> Do not wait for this portal. Call your local emergency services or go to the nearest emergency department. Submitting this form does not contact emergency services.</p></div>
      <Card>
        <h3 className="text-xl font-extrabold">Send a request to hospital staff</h3>
        <form className="mt-5 space-y-4" onSubmit={submit}>
          <label className="block"><span className="mb-2 block font-bold">What do you need help with?</span><input className="min-h-11 w-full rounded-lg border border-navy-100 px-4" required maxLength={120} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Briefly describe the issue" /></label>
          <label className="block"><span className="mb-2 block font-bold">Additional information (optional)</span><textarea className="w-full rounded-lg border border-navy-100 p-4" rows="4" maxLength={1000} value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Share details that may help the hospital team respond." /></label>
          <Button type="submit" disabled={submitting}><Send size={17} />{submitting ? 'Sending...' : 'Send urgent request'}</Button>
        </form>
      </Card>
      <Card>
        <h3 className="text-xl font-extrabold">Request status</h3>
        <div className="mt-4 space-y-3">
          {loadError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4"><p className="font-bold text-danger">{loadError}</p><Button variant="secondary" className="mt-4" onClick={loadRequests} disabled={loading}>Try again</Button></div>}
          {loading && <><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></>}
          {!loading && !loadError && requests.length === 0 && <EmptyState title="No request history">Requests appear here after the hospital urgent-help service is connected.</EmptyState>}
          {!loading && !loadError && requests.map((request) => <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy-100 p-4"><div><p className="font-extrabold">{request.reason}</p><p className="mt-1 text-sm text-navy-700">{request.createdAt || 'Submitted time unavailable'}</p><p className="text-sm text-navy-500">{request.acknowledgement || 'No acknowledgement details provided.'}</p></div><span className="rounded-full bg-navy-50 px-3 py-1 text-sm font-bold text-navy-700">{request.status || 'Status unavailable'}</span></div>)}
        </div>
      </Card>
    </div>
  );
}
