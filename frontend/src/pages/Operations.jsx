import { useEffect, useState } from 'react';
import { BedDouble, FlaskConical, MessageSquare, Plus, ReceiptText } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Card, Input, Modal, Badge } from '../components/ui';
import { billService } from '../api/billService';
import { patientService } from '../api/patientService';
import { notificationService } from '../api/notificationService';

export default function Operations({ type = 'billing' }) {
  const isBilling = type === 'billing';
  const isLabs = type === 'labs';

  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [smsLogs, setSmsLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Billing Form State
  const [patientId, setPatientId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  // Fallback items for labs
  const [labItems, setLabItems] = useState([
    { id: 1, label: 'LAB-2091 · Ramesh Kumar', detail: 'Complete blood count · Blood Pathology', status: 'Ready' },
    { id: 2, label: 'LAB-2092 · Sunita Devi', detail: 'Lipid profile & Liver function', status: 'Processing' },
    { id: 3, label: 'LAB-2093 · Amit Verma', detail: 'Calcium & Vitamin D3 Panel', status: 'Ready' },
  ]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (isBilling) {
        const [billsData, patientsData, smsData] = await Promise.all([
          billService.list().catch(() => []),
          patientService.list().catch(() => []),
          notificationService.getRecentSms().catch(() => []),
        ]);
        setBills(billsData || []);
        setPatients(patientsData || []);
        setSmsLogs(smsData || []);
        if (patientsData && patientsData.length > 0) {
          setPatientId(patientsData[0].id);
        }
      }
    } catch {
      toast.error('Failed to load operations data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [type]);

  const submitBill = async (event) => {
    event.preventDefault();
    if (!patientId) return toast.error('Please select a patient.');
    if (!amount || isNaN(amount) || Number(amount) <= 0) return toast.error('Please enter a valid bill amount.');
    if (!description.trim()) return toast.error('Please enter an invoice description.');

    try {
      const newBill = await billService.create({
        patientId: Number(patientId),
        amount: Number(amount),
        description: description.trim(),
        status: 'PAID',
      });
      setBills((prev) => [newBill, ...prev]);
      setOpen(false);
      setAmount('');
      setDescription('');
      toast.success('Invoice created & SMS notification sent to patient!');
      // Refresh SMS logs
      notificationService.getRecentSms().then(setSmsLogs).catch(() => {});
    } catch {
      toast.error('Failed to generate invoice.');
    }
  };

  const toggleBillStatus = async (billId, currentStatus) => {
    const newStatus = currentStatus === 'PAID' ? 'PENDING' : 'PAID';
    try {
      const updated = await billService.updateStatus(billId, newStatus);
      setBills((prev) => prev.map((b) => (b.id === billId ? updated : b)));
      toast.success(`Bill marked as ${newStatus}. SMS notification sent!`);
      notificationService.getRecentSms().then(setSmsLogs).catch(() => {});
    } catch {
      toast.error('Failed to update bill status.');
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-bold text-teal-700">Hospital Administration</p>
          <h2 className="mt-1 text-3xl font-black text-ink sm:text-4xl">
            {isBilling ? 'Billing, Invoices & SMS Alerts' : 'Diagnostic Lab Tests'}
          </h2>
          <p className="mt-2 text-navy-700">
            {isBilling
              ? 'Generate patient invoices and automatically dispatch SMS notifications with bill details.'
              : 'Track laboratory diagnostic tests from request to clinical result.'}
          </p>
        </div>
        {isBilling && (
          <Button onClick={() => setOpen(true)}>
            <Plus size={19} />
            Generate Invoice
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="font-bold text-navy-700">{isBilling ? 'Total Invoices' : 'Total Tests'}</p>
          <p className="mt-2 text-3xl font-black">{isBilling ? bills.length : labItems.length}</p>
        </Card>
        <Card>
          <p className="font-bold text-navy-700">{isBilling ? 'Unpaid Invoices' : 'Processing'}</p>
          <p className="mt-2 text-3xl font-black text-warning">
            {isBilling
              ? bills.filter((b) => b.status === 'PENDING').length
              : labItems.filter((i) => i.status === 'Processing').length}
          </p>
        </Card>
        <Card>
          <p className="font-bold text-navy-700">SMS Notifications Dispatched</p>
          <p className="mt-2 text-3xl font-black text-teal-700">{smsLogs.length}</p>
        </Card>
      </div>

      {isBilling ? (
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Invoices List */}
          <Card>
            <div className="flex items-center gap-3 border-b border-navy-100 pb-5">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-teal-100 text-teal-700">
                <ReceiptText size={24} />
              </span>
              <div>
                <h3 className="text-xl font-extrabold">Patient Invoices</h3>
                <p className="text-sm text-navy-700">Live invoices with automatic SMS delivery.</p>
              </div>
            </div>

            <div className="divide-y divide-navy-100">
              {loading ? (
                <p className="py-8 text-center text-sm font-bold text-navy-500">Loading invoices...</p>
              ) : bills.length === 0 ? (
                <p className="py-8 text-center text-sm font-bold text-navy-500">No invoices generated yet.</p>
              ) : (
                bills.map((bill) => (
                  <div key={bill.id} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-teal-700">{bill.invoiceNumber}</span>
                        <span className="text-navy-400">·</span>
                        <span className="font-extrabold">{bill.patient?.name}</span>
                      </div>
                      <p className="mt-1 text-sm text-navy-700">
                        ₹{Number(bill.amount).toLocaleString()} · {bill.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge tone={bill.status === 'PAID' ? 'success' : 'warning'}>{bill.status}</Badge>
                      <button
                        onClick={() => toggleBillStatus(bill.id, bill.status)}
                        className="rounded-lg border border-navy-200 px-3 py-1.5 text-xs font-extrabold text-navy-700 hover:bg-navy-50"
                      >
                        {bill.status === 'PAID' ? 'Mark Pending' : 'Mark Paid'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* SMS Notification History */}
          <Card>
            <div className="flex items-center gap-3 border-b border-navy-100 pb-5">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                <MessageSquare size={24} />
              </span>
              <div>
                <h3 className="text-xl font-extrabold">Recent SMS Dispatches</h3>
                <p className="text-sm text-navy-700">Live SMS sent to patients</p>
              </div>
            </div>

            <div className="mt-4 max-h-[500px] space-y-3 overflow-y-auto pr-1">
              {smsLogs.length === 0 ? (
                <p className="py-8 text-center text-sm font-bold text-navy-500">No SMS logged yet.</p>
              ) : (
                smsLogs.map((sms) => (
                  <div key={sms.id} className="rounded-xl border border-navy-100 bg-navy-50/50 p-3.5">
                    <div className="flex items-center justify-between text-xs font-bold text-navy-500">
                      <span>{sms.recipientName} ({sms.recipientPhone})</span>
                      <span className="rounded bg-teal-100 px-2 py-0.5 text-[10px] font-extrabold text-teal-800">
                        {sms.type}
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-medium leading-relaxed text-ink">{sms.message}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-navy-500">
                      <span>Status: {sms.status}</span>
                      <span>{sms.sentAt ? new Date(sms.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      ) : (
        <Card>
          <div className="flex items-center gap-3 border-b border-navy-100 pb-5">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-teal-100 text-teal-700">
              <FlaskConical size={24} />
            </span>
            <div>
              <h3 className="text-xl font-extrabold">Diagnostic Lab Tests</h3>
              <p className="text-sm text-navy-700">Pathology, radiology, and biochemistry orders.</p>
            </div>
          </div>

          <div className="divide-y divide-navy-100">
            {labItems.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-extrabold">{item.label}</p>
                  <p className="mt-1 text-sm text-navy-700">{item.detail}</p>
                </div>
                <Badge tone={item.status === 'Processing' ? 'warning' : 'success'}>{item.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Modal to create a new bill */}
      <Modal open={open} title="Generate Patient Invoice & Send SMS" onClose={() => setOpen(false)}>
        <form onSubmit={submitBill} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-bold text-navy-700">Select Patient</label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full rounded-xl border border-navy-200 bg-white px-3.5 py-2.5 font-bold text-ink outline-none focus:border-teal-500"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.phone})
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Bill Amount (₹)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 4500"
          />
          <Input
            label="Description / Services Rendered"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Inpatient ward charges, consultations, and pharmacy"
          />
          <div className="rounded-xl bg-teal-50 p-3 text-xs font-bold text-teal-800">
            📱 An instant SMS with the invoice amount and details will be sent to the patient&apos;s phone upon saving.
          </div>
          <Button type="submit" className="w-full">
            Generate & Dispatch SMS
          </Button>
        </form>
      </Modal>
    </div>
  );
}
