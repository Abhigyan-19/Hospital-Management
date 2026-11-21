import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { doctorPortalService } from '../api/doctorPortalService';
import { apiErrorMessage } from '../api/errorMessage';
import { Button, Card, Loading } from '../components/ui';

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const blankAvailability = { workingDays: [], startTime: '09:00', endTime: '17:00', slotMinutes: '30', leaveDates: [] };

export default function DoctorAvailability() {
  const [form, setForm] = useState(blankAvailability);
  const [leaveDate, setLeaveDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    doctorPortalService.getAvailability()
      .then((data) => setForm({
        ...blankAvailability,
        ...data,
        workingDays: data.workingDays || [],
        leaveDates: data.leaveDates || [],
        slotMinutes: String(data.slotMinutes || 30),
      }))
      .catch((requestError) => setError(apiErrorMessage(requestError, 'Your availability service is not available.')))
      .finally(() => setLoading(false));
  }, []);

  const toggleDay = (day) => setForm((current) => ({
    ...current,
    workingDays: current.workingDays.includes(day)
      ? current.workingDays.filter((item) => item !== day)
      : [...current.workingDays, day],
  }));

  const addLeaveDate = () => {
    if (!leaveDate || form.leaveDates.includes(leaveDate)) return;
    setForm((current) => ({ ...current, leaveDates: [...current.leaveDates, leaveDate].sort() }));
    setLeaveDate('');
  };

  const save = async (event) => {
    event.preventDefault();
    if (!form.workingDays.length) return toast.error('Choose at least one working day.');
    if (form.startTime >= form.endTime) return toast.error('End time must be after start time.');
    setSaving(true);
    setError('');
    try {
      const saved = await doctorPortalService.updateAvailability({
        ...form,
        slotMinutes: Number(form.slotMinutes),
      });
      setForm({ ...saved, slotMinutes: String(saved.slotMinutes) });
      toast.success('Your availability was saved.');
    } catch (requestError) {
      const message = apiErrorMessage(requestError, 'Your availability could not be saved.');
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-[900px] space-y-6">
      <header><p className="font-bold text-teal-700">Clinician workspace</p><h2 className="mt-1 text-3xl font-black text-ink sm:text-4xl">Manage availability</h2><p className="mt-2 text-navy-700">Set your regular hours and planned leave for appointment scheduling.</p></header>
      {error && <Card className="border-red-200 bg-red-50"><p className="font-bold text-danger">Availability update</p><p className="mt-1 text-navy-700">{error}</p></Card>}
      <Card>
        {loading ? <Loading label="Loading your availability..." /> : (
          <form className="space-y-6" onSubmit={save}>
            <fieldset><legend className="font-extrabold">Working days</legend><div className="mt-3 grid gap-2 sm:grid-cols-4">{weekdays.map((day) => <label key={day} className="flex min-h-11 items-center gap-3 rounded-lg border border-navy-100 px-3 font-semibold"><input type="checkbox" checked={form.workingDays.includes(day)} onChange={() => toggleDay(day)} className="h-5 w-5 accent-teal-700" />{day}</label>)}</div></fieldset>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block"><span className="mb-2 block font-bold">Start time</span><input type="time" required className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-3" value={form.startTime} onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))} /></label>
              <label className="block"><span className="mb-2 block font-bold">End time</span><input type="time" required className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-3" value={form.endTime} onChange={(event) => setForm((current) => ({ ...current, endTime: event.target.value }))} /></label>
              <label className="block"><span className="mb-2 block font-bold">Appointment slot</span><select className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-3" value={form.slotMinutes} onChange={(event) => setForm((current) => ({ ...current, slotMinutes: event.target.value }))}>{[15, 20, 30, 45, 60].map((minutes) => <option key={minutes} value={minutes}>{minutes} minutes</option>)}</select></label>
            </div>
            <fieldset><legend className="font-extrabold">Planned leave</legend><div className="mt-3 flex flex-wrap gap-3"><label className="block flex-1"><span className="mb-2 block font-bold">Add leave date</span><input aria-label="Leave date" type="date" min={new Date().toISOString().slice(0, 10)} className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-3" value={leaveDate} onChange={(event) => setLeaveDate(event.target.value)} /></label><Button type="button" variant="secondary" className="self-end" onClick={addLeaveDate} disabled={!leaveDate}>Add leave date</Button></div>
              {form.leaveDates.length > 0 && <ul className="mt-3 flex flex-wrap gap-2">{form.leaveDates.map((date) => <li key={date} className="flex min-h-10 items-center gap-2 rounded-full bg-navy-50 px-3 font-semibold">{date}<button type="button" className="font-bold text-danger underline" onClick={() => setForm((current) => ({ ...current, leaveDates: current.leaveDates.filter((item) => item !== date) }))} aria-label={`Remove leave date ${date}`}>Remove</button></li>)}</ul>}
            </fieldset>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save availability'}</Button>
          </form>
        )}
      </Card>
    </div>
  );
}
