import { useState } from 'react';
import { BedDouble, FlaskConical, Plus, ReceiptText } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Card, Input, Modal, Badge } from '../components/ui';

const modules = {
  billing: {
    title: 'Billing & invoices',
    icon: ReceiptText,
    description: 'Create invoices and track payment status.',
    items: [
      { id: 1, label: 'INV-1001 · Ramesh Kumar', detail: '₹4,500 · Cardiology consultation', status: 'Paid' },
      { id: 2, label: 'INV-1002 · Amit Verma', detail: '₹2,800 · Orthopedics review', status: 'Pending' },
      { id: 3, label: 'INV-1003 · Meera Iyer', detail: '₹6,200 · Neurological scan', status: 'Paid' },
    ],
  },
  beds: {
    title: 'Beds & wards',
    icon: BedDouble,
    description: 'Monitor ward capacity and availability.',
    items: [
      { id: 1, label: 'General Ward A', detail: '28 beds · 6 available', status: 'Available' },
      { id: 2, label: 'Cardiology Wing B', detail: '20 beds · 2 available', status: 'Limited' },
      { id: 3, label: 'Pediatric Care', detail: '18 beds · 8 available', status: 'Available' },
    ],
  },
  labs: {
    title: 'Lab tests & reports',
    icon: FlaskConical,
    description: 'Track laboratory diagnostic tests from request to clinical result.',
    items: [
      { id: 1, label: 'LAB-2091 · Ramesh Kumar', detail: 'Complete blood count · Blood Pathology', status: 'Ready' },
      { id: 2, label: 'LAB-2092 · Sunita Devi', detail: 'Lipid profile & Liver function', status: 'Processing' },
    ],
  },
};

export default function Operations({ type }) {
  const data = modules[type] || modules.billing;
  const Icon = data.icon;
  const [items, setItems] = useState(data.items);
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [detail, setDetail] = useState('');

  const submit = (event) => {
    event.preventDefault();
    if (!label.trim()) return toast.error('Please enter a record name.');
    const newItem = {
      id: Date.now(),
      label,
      detail: detail || 'Standard clinical record',
      status: 'Ready',
    };
    setItems((prev) => [newItem, ...prev]);
    setOpen(false);
    setLabel('');
    setDetail('');
    toast.success(`${data.title} record saved.`);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-bold text-teal-700">Hospital operations</p>
          <h2 className="mt-1 text-3xl font-black text-ink sm:text-4xl">{data.title}</h2>
          <p className="mt-2 text-navy-700">{data.description}</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={19} />
          Create new
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="font-bold text-navy-700">Total records</p>
          <p className="mt-2 text-3xl font-black">{items.length}</p>
        </Card>
        <Card>
          <p className="font-bold text-navy-700">Needs attention</p>
          <p className="mt-2 text-3xl font-black text-warning">
            {items.filter((item) => ['Pending', 'Limited', 'Processing'].includes(item.status)).length}
          </p>
        </Card>
        <Card>
          <p className="font-bold text-navy-700">System status</p>
          <p className="mt-2 font-extrabold text-success">Operational</p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-3 border-b border-navy-100 pb-5">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-teal-100 text-teal-700">
            <Icon size={24} />
          </span>
          <div>
            <h3 className="text-xl font-extrabold">Active Records</h3>
            <p className="text-sm text-navy-700">Live operation and invoice monitoring.</p>
          </div>
        </div>

        <div className="divide-y divide-navy-100">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-extrabold">{item.label}</p>
                <p className="mt-1 text-sm text-navy-700">{item.detail}</p>
              </div>
              <Badge tone={['Pending', 'Limited', 'Processing'].includes(item.status) ? 'warning' : 'success'}>
                {item.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      <Modal open={open} title={`Create ${data.title.toLowerCase()} record`} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="space-y-4">
          <Input
            label="Record name / ID"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="e.g. INV-1004 · Patient Name"
          />
          <Input
            label="Details & amount"
            value={detail}
            onChange={(event) => setDetail(event.target.value)}
            placeholder="e.g. ₹3,500 · Consultation"
          />
          <Button type="submit" className="w-full">
            Save record
          </Button>
        </form>
      </Modal>
    </div>
  );
}
