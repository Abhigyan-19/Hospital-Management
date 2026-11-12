import { useEffect, useState } from 'react';
import { BadgeCheck, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';
import { doctorApprovalService } from '../api/doctorApprovalService';
import { isDemoMode } from '../api/demoAuth';
import { Badge, Button, Card, ConfirmDialog, EmptyState, Skeleton } from '../components/ui';

export default function AdminDoctorApprovals() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  const [doctorToReject, setDoctorToReject] = useState(null);

  const loadPending = () => {
    setLoading(true);
    setError('');
    doctorApprovalService.listPending()
      .then(setDoctors)
      .catch((requestError) => {
        const message = isDemoMode()
          ? requestError.message || 'Unable to load pending doctor registrations.'
          : requestError.response?.data?.message || 'Backend not connected. Doctor verification needs the documented admin approval endpoints.';
        setError(message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPending();
  }, []);

  const review = async (doctor, approvalStatus) => {
    setSavingId(doctor.id);
    setError('');
    try {
      await doctorApprovalService.review(doctor.id, approvalStatus);
      setDoctors((current) => current.filter((item) => item.id !== doctor.id));
      toast.success(approvalStatus === 'APPROVED' ? 'Doctor account approved.' : 'Doctor registration rejected.');
      return true;
    } catch (requestError) {
      const message = requestError.response?.data?.message || requestError.message || 'The doctor registration could not be reviewed.';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setSavingId(null);
    }
  };

  const confirmReject = async () => {
    if (!doctorToReject) return;
    if (await review(doctorToReject, 'REJECTED')) setDoctorToReject(null);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="font-bold text-teal-700">Account verification</p>
        <h2 className="mt-1 text-3xl font-black text-ink sm:text-4xl">Doctor approval queue</h2>
        <p className="mt-2 leading-7 text-navy-700">Doctor registrations remain unable to sign in until an administrator approves them.</p>
      </div>
      {error && <Card role="alert" className="border-amber-200 bg-amber-50"><p className="font-bold text-amber-950">{error}</p>{!isDemoMode() && <p className="mt-2 text-amber-950">The backend must authorize the current administrator and return a successful review response before the queue changes.</p>}<Button variant="secondary" className="mt-4" onClick={loadPending} disabled={loading}>Try again</Button></Card>}
      {loading ? (
        <div className="space-y-4" aria-label="Loading doctor approvals">
          {[1, 2].map((item) => <Card key={item}><Skeleton className="h-6 w-1/2" /><Skeleton className="mt-3 h-4 w-2/3" /></Card>)}
        </div>
      ) : !error && doctors.length === 0 ? (
        <EmptyState title="No doctor registrations need review">New doctor registrations will appear here while they wait for approval.</EmptyState>
      ) : !error && (
        <div className="space-y-4">
          {doctors.map((doctor) => (
            <Card key={doctor.id}>
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div className="flex items-start gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-teal-100 text-teal-700" aria-hidden="true"><Stethoscope size={24} /></span>
                  <div>
                    <h3 className="text-xl font-extrabold">{doctor.name}</h3>
                    <p className="mt-1 text-navy-700">{doctor.email}</p>
                    <p className="mt-1 text-navy-700">{doctor.specialization || 'Specialty not provided'}{doctor.experience == null ? '' : ` · ${doctor.experience} years of experience`}</p>
                    <Badge tone="warning">Pending verification</Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" disabled={savingId === doctor.id} onClick={() => setDoctorToReject(doctor)}>Reject registration</Button>
                  <Button disabled={savingId === doctor.id} onClick={() => review(doctor, 'APPROVED')}><BadgeCheck size={18} aria-hidden="true" />{savingId === doctor.id ? 'Saving...' : 'Approve doctor'}</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={Boolean(doctorToReject)}
        title="Reject doctor registration?"
        message={doctorToReject ? `Reject the registration for ${doctorToReject.name}? They will not be able to sign in.` : ''}
        confirmLabel="Reject registration"
        onClose={() => setDoctorToReject(null)}
        onConfirm={confirmReject}
      />
    </div>
  );
}
