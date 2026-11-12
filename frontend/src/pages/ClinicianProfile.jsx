import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { doctorPortalService } from '../api/doctorPortalService';
import { apiErrorMessage } from '../api/errorMessage';
import { Button, Card, Input, Loading } from '../components/ui';

export default function ClinicianProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ phone: '', professionalBiography: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    doctorPortalService.getProfile()
      .then((data) => {
        setProfile(data);
        setForm({ phone: data.phone || '', professionalBiography: data.professionalBiography || '' });
      })
      .catch((requestError) => setError(apiErrorMessage(requestError, 'Your doctor profile is not available.')))
      .finally(() => setLoading(false));
  }, []);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const updated = await doctorPortalService.updateProfile(form);
      setProfile((current) => ({ ...current, ...updated }));
      toast.success('Your contact profile was updated.');
    } catch (requestError) {
      const message = apiErrorMessage(requestError, 'Your contact profile could not be updated.');
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-[850px] space-y-6">
      <header><p className="font-bold text-teal-700">Clinician workspace</p><h2 className="mt-1 text-3xl font-black text-ink sm:text-4xl">My profile</h2><p className="mt-2 text-navy-700">Your verified professional details are managed by the hospital.</p></header>
      {error && <Card className="border-red-200 bg-red-50"><p className="font-bold text-danger">Profile update</p><p className="mt-1 text-navy-700">{error}</p></Card>}
      <Card>
        {loading ? <Loading label="Loading your professional profile..." /> : profile && (
          <form className="space-y-5" onSubmit={save}>
            <div className="grid gap-4 sm:grid-cols-2"><div><p className="font-bold">Name</p><p className="mt-1 text-navy-700">{profile.name || 'Not provided'}</p></div><div><p className="font-bold">Email</p><p className="mt-1 text-navy-700">{profile.email || 'Not provided'}</p></div><div><p className="font-bold">Department</p><p className="mt-1 text-navy-700">{profile.specialization || profile.department?.name || 'Not provided'}</p></div><div><p className="font-bold">Qualification and experience</p><p className="mt-1 text-navy-700">{profile.qualification || 'Qualification not provided'}{profile.experience ? ` · ${profile.experience} years` : ''}</p></div></div>
            <Input label="Contact phone" type="tel" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
            <label className="block"><span className="mb-2 block font-bold">Professional biography</span><textarea rows="4" className="w-full rounded-lg border border-navy-100 bg-white p-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" value={form.professionalBiography} onChange={(event) => setForm((current) => ({ ...current, professionalBiography: event.target.value }))} /></label>
            <p className="text-sm text-navy-700">Name, qualification, department, and experience can only be changed through hospital verification.</p>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save contact details'}</Button>
          </form>
        )}
      </Card>
    </div>
  );
}
