import { useEffect, useMemo, useState } from 'react';
import { BedDouble, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { bedService } from '../api/bedService';
import { apiErrorMessage } from '../api/errorMessage';
import { Badge, Button, Card, EmptyState, Skeleton } from '../components/ui';

const statusNames = { AVAILABLE: 'Available', OCCUPIED: 'Occupied', MAINTENANCE: 'Maintenance' };
const statusTones = { AVAILABLE: 'success', OCCUPIED: 'info', MAINTENANCE: 'warning' };

export default function ReceptionWards() {
  const [wards, setWards] = useState([]);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [wardData, bedData] = await Promise.all([bedService.listWards(), bedService.listBeds()]);
      setWards(wardData);
      setBeds(bedData);
    } catch (requestError) {
      const message = apiErrorMessage(requestError, 'Ward and bed information is not available.');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const counts = useMemo(() => ({
    available: beds.filter((bed) => bed.status === 'AVAILABLE').length,
    occupied: beds.filter((bed) => bed.status === 'OCCUPIED').length,
    maintenance: beds.filter((bed) => bed.status === 'MAINTENANCE').length,
  }), [beds]);

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <header><p className="font-bold text-teal-700">Reception workspace</p><h2 className="mt-1 text-3xl font-black text-ink sm:text-4xl">Ward and bed view</h2><p className="mt-2 text-navy-700">A read-only view of current ward occupancy and bed status.</p></header>
      {error && <Card role="alert" className="border-red-200 bg-red-50"><p className="font-bold text-danger">Ward information could not be loaded</p><p className="mt-1 text-navy-700">{error}</p><Button variant="secondary" className="mt-4" onClick={loadData} disabled={loading}>Try again</Button></Card>}
      <div className="grid gap-4 sm:grid-cols-3"><Card><p className="font-bold text-navy-700">Available beds</p><p className="mt-2 text-3xl font-black text-success">{loading ? '…' : counts.available}</p></Card><Card><p className="font-bold text-navy-700">Occupied beds</p><p className="mt-2 text-3xl font-black">{loading ? '…' : counts.occupied}</p></Card><Card><p className="font-bold text-navy-700">Maintenance</p><p className="mt-2 text-3xl font-black text-warning">{loading ? '…' : counts.maintenance}</p></Card></div>
      {loading ? <div className="grid gap-5 lg:grid-cols-2"><Card><Skeleton className="h-24 w-full" /><Skeleton className="mt-4 h-10 w-full" /></Card><Card><Skeleton className="h-24 w-full" /><Skeleton className="mt-4 h-10 w-full" /></Card></div> : error ? null : !wards.length ? <EmptyState title="No wards to show">Ward capacity will appear here when the hospital service is connected.</EmptyState> : (
        <div className="grid gap-5 lg:grid-cols-2">{wards.map((ward) => {
          const wardBeds = beds.filter((bed) => Number(bed.wardId) === Number(ward.id));
          return (
            <Card key={ward.id}>
              <div className="flex items-start gap-3"><span className="grid h-12 w-12 place-items-center rounded-xl bg-teal-50 text-teal-700"><Building2 size={24} /></span><div><h3 className="text-xl font-extrabold">{ward.name}</h3><p className="mt-1 text-sm text-navy-700">{ward.department || 'Department not listed'} · Floor {ward.floor ?? 'not listed'}</p></div></div>
              <p className="mt-4 flex items-center gap-2 font-bold text-navy-700"><BedDouble size={18} />{wardBeds.length} bed{wardBeds.length === 1 ? '' : 's'}</p>
              {!wardBeds.length ? <p className="mt-3 text-sm text-navy-700">No beds are registered in this ward.</p> : <div className="mt-4 space-y-2">{wardBeds.map((bed) => <div key={bed.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-navy-100 p-3"><div><p className="font-bold">{bed.bedNumber}</p>{bed.patientName && <p className="mt-1 text-sm text-navy-700">Patient: {bed.patientName}</p>}</div><Badge tone={statusTones[bed.status] || 'info'}>{statusNames[bed.status] || bed.status || 'Status unavailable'}</Badge></div>)}</div>}
            </Card>
          );
        })}</div>
      )}
    </div>
  );
}
