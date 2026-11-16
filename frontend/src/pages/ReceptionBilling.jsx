import { useEffect, useMemo, useState } from 'react';
import { Printer, Plus, ReceiptText } from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentService } from '../api/appointmentService';
import { billingService } from '../api/billingService';
import { patientService } from '../api/patientService';
import { apiErrorMessage } from '../api/errorMessage';
import { Badge, Button, Card, EmptyState, Input, Modal, SearchBox } from '../components/ui';

const blankInvoice = { patientId: '', appointmentId: '', description: '', amount: '' };
const invoicePageSize = 8;

export default function ReceptionBilling() {
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(blankInvoice);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [printTarget, setPrintTarget] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = () => {
    setLoading(true);
    setError('');
    Promise.all([billingService.listStaffInvoices(), patientService.list(), appointmentService.list()])
      .then(([invoiceData, patientData, appointmentData]) => {
        setInvoices(invoiceData);
        setPatients(patientData);
        setAppointments(appointmentData);
      })
      .catch((requestError) => {
        const message = apiErrorMessage(requestError, 'Reception billing and patient data could not be loaded.');
        setError(message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const invoiceAppointments = useMemo(() => appointments.filter((appointment) =>
    Number(appointment.patient?.id) === Number(form.patientId),
  ), [appointments, form.patientId]);
  const filteredInvoices = invoices.filter((invoice) => {
    const patientName = patients.find((patient) => Number(patient.id) === Number(invoice.patientId))?.name || '';
    return `${invoice.invoiceNumber || ''} ${invoice.description || ''} ${patientName}`.toLowerCase().includes(search.trim().toLowerCase());
  });
  const pageCount = Math.max(1, Math.ceil(filteredInvoices.length / invoicePageSize));
  const visibleInvoices = filteredInvoices.slice((page - 1) * invoicePageSize, page * invoicePageSize);
  const pendingCount = invoices.filter((invoice) => !['PAID', 'Paid'].includes(invoice.status)).length;
  const printInvoice = (invoice, patientName) => {
    setPrintTarget({ invoice, patientName });
    window.setTimeout(() => window.print(), 0);
  };

  const createInvoice = async (event) => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!form.patientId || !form.description.trim() || !Number.isFinite(amount) || amount <= 0) {
      return toast.error('Choose a patient, enter an item description, and enter an amount greater than zero.');
    }
    setSaving(true);
    try {
      const created = await billingService.createInvoice({
        patientId: Number(form.patientId),
        ...(form.appointmentId ? { appointmentId: Number(form.appointmentId) } : {}),
        description: form.description.trim(),
        amount,
      });
      setInvoices((current) => [created, ...current]);
      setCreateOpen(false);
      setForm(blankInvoice);
      toast.success('Invoice created.');
    } catch (requestError) {
      toast.error(apiErrorMessage(requestError, 'The invoice could not be created.'));
    } finally {
      setSaving(false);
    }
  };

  const markPaid = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await billingService.markPaid(paymentTarget.id, paymentMethod);
      setInvoices((current) => current.map((invoice) => Number(invoice.id) === Number(updated.id) ? updated : invoice));
      setPaymentTarget(null);
      toast.success('Payment recorded.');
    } catch (requestError) {
      toast.error(apiErrorMessage(requestError, 'Payment could not be recorded.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-bold text-teal-700">Reception workspace</p><h2 className="mt-1 text-3xl font-black text-ink sm:text-4xl">Billing and receipts</h2><p className="mt-2 text-navy-700">Create patient invoices, record payments, and print receipts.</p></div><Button onClick={() => setCreateOpen(true)}><Plus size={18} />Create invoice</Button></header>
      {error && <Card className="border-red-200 bg-red-50"><p className="font-bold text-danger">Billing data could not be loaded</p><p className="mt-1 text-navy-700">{error}</p><Button variant="secondary" className="mt-4" onClick={loadData}>Try again</Button></Card>}
      <div className="grid gap-4 sm:grid-cols-3"><Card><p className="font-bold text-navy-700">Invoices</p><p className="mt-2 text-3xl font-black">{loading ? '…' : invoices.length}</p></Card><Card><p className="font-bold text-navy-700">Pending payment</p><p className="mt-2 text-3xl font-black text-warning">{loading ? '…' : pendingCount}</p></Card><Card><p className="font-bold text-navy-700">Payments recorded</p><p className="mt-2 text-3xl font-black text-success">{loading ? '…' : invoices.length - pendingCount}</p></Card></div>
      <Card>
        <div className="mb-5 w-full sm:max-w-md"><SearchBox value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search invoice or patient" /></div>
        {loading ? <p className="py-5 text-navy-700">Loading invoices...</p> : error ? null : !visibleInvoices.length ? <EmptyState title={search ? 'No matching invoices' : 'No invoices yet'}>Create an invoice when a patient needs a billing record.</EmptyState> : (
          <div className="space-y-3">{visibleInvoices.map((invoice) => {
            const patient = patients.find((item) => Number(item.id) === Number(invoice.patientId));
            const paid = ['PAID', 'Paid'].includes(invoice.status);
            return (
              <article key={invoice.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-navy-100 p-4">
                <div><h3 className="font-extrabold">{invoice.invoiceNumber || 'Invoice'} · {patient?.name || 'Patient'}</h3><p className="mt-1 text-sm text-navy-700">{invoice.description} · {invoice.date}</p><p className="mt-2 text-lg font-black">₹{Number(invoice.amount || invoice.total || 0).toLocaleString('en-IN')}</p>{invoice.paymentMethod && <p className="text-sm text-navy-500">Payment: {invoice.paymentMethod}</p>}</div>
                <div className="flex flex-wrap items-center gap-2"><Badge tone={paid ? 'success' : 'warning'}>{invoice.status || 'Pending'}</Badge>{!paid && <Button variant="secondary" onClick={() => setPaymentTarget(invoice)}>Mark paid</Button>}<Button variant="secondary" onClick={() => printInvoice(invoice, patient?.name || 'Patient')}><Printer size={17} />{paid ? 'Print receipt' : 'Print invoice'}</Button></div>
              </article>
            );
          })}</div>
        )}
        {!loading && !error && filteredInvoices.length > invoicePageSize && <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-bold text-navy-700">Page {page} of {pageCount}</p><div className="flex gap-2"><Button variant="secondary" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button><Button variant="secondary" disabled={page >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>Next</Button></div></div>}
      </Card>
      <Modal open={createOpen} title="Create patient invoice" onClose={() => !saving && setCreateOpen(false)}>
        <form className="space-y-4" onSubmit={createInvoice}>
          <label className="block"><span className="mb-2 block font-bold">Patient</span><select required className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-4" value={form.patientId} onChange={(event) => setForm((current) => ({ ...current, patientId: event.target.value, appointmentId: '' }))}><option value="">Select a patient</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}</select></label>
          <label className="block"><span className="mb-2 block font-bold">Related appointment (optional)</span><select className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-4" value={form.appointmentId} onChange={(event) => setForm((current) => ({ ...current, appointmentId: event.target.value }))}><option value="">No appointment selected</option>{invoiceAppointments.map((appointment) => <option key={appointment.id} value={appointment.id}>{appointment.date} · {appointment.time} · {appointment.doctor?.name}</option>)}</select></label>
          <Input label="Invoice description" required value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="For example: consultation fee" />
          <Input label="Amount (₹)" type="number" min="0.01" step="0.01" required value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} />
          <p className="text-sm text-navy-700">Creating an invoice does not charge a payment method.</p>
          <Button type="submit" className="w-full" disabled={saving || !patients.length}><ReceiptText size={17} />{saving ? 'Creating...' : 'Create invoice'}</Button>
        </form>
      </Modal>
      <Modal open={Boolean(paymentTarget)} title="Record payment" onClose={() => !saving && setPaymentTarget(null)}>
        <form className="space-y-4" onSubmit={markPaid}>
          <p className="text-navy-700">Record the payment received for {paymentTarget?.invoiceNumber || 'this invoice'}. This does not process a card or bank transaction.</p>
          <label className="block"><span className="mb-2 block font-bold">Payment method</span><select className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-4" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}><option>Cash</option><option>Card terminal</option><option>UPI</option><option>Other</option></select></label>
          <Button type="submit" className="w-full" disabled={saving}>{saving ? 'Saving payment...' : 'Confirm payment received'}</Button>
        </form>
      </Modal>
      {printTarget && <article className="print-document print-document-only" aria-hidden="true">
        <p className="text-sm font-bold uppercase tracking-widest text-navy-500">SEBASETHU reception</p>
        <h1 className="mt-3 text-3xl font-black">{['PAID', 'Paid'].includes(printTarget.invoice.status) ? 'Payment receipt' : 'Patient invoice'}</h1>
        <p className="mt-4"><strong>Patient:</strong> {printTarget.patientName}</p>
        <p className="mt-2"><strong>Invoice:</strong> {printTarget.invoice.invoiceNumber || 'Not provided'}</p>
        <p className="mt-2"><strong>Description:</strong> {printTarget.invoice.description || 'Invoice'}</p>
        <p className="mt-2"><strong>Date:</strong> {printTarget.invoice.date || 'Date unavailable'}</p>
        <p className="mt-2"><strong>Amount:</strong> ₹{Number(printTarget.invoice.amount || printTarget.invoice.total || 0).toLocaleString('en-IN')}</p>
        <p className="mt-2"><strong>Payment status:</strong> {printTarget.invoice.status || 'Pending'}</p>
        {printTarget.invoice.paymentMethod && <p className="mt-2"><strong>Payment method:</strong> {printTarget.invoice.paymentMethod}</p>}
      </article>}
    </div>
  );
}
