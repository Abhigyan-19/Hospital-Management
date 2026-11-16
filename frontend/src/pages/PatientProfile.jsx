import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { patientService } from '../api/patientService';
import { patientPortalService } from '../api/patientPortalService';
import { apiErrorMessage } from '../api/errorMessage';
import { Button, Card, Input, Loading } from '../components/ui';

const emptyProfile = { bloodGroup: '', allergies: '', emergencyContact: '', insuranceProvider: '', insurancePolicy: '' };

export default function PatientProfile() {
  const { user } = useAuth();
  const [profileId, setProfileId] = useState('');
  const [form, setForm] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const profiles = await patientService.listLinked();
      const self = profiles.find((item) => item.isSelf || item.relationshipToAccount === 'SELF') || profiles[0];
      if (!self) throw new Error('No patient profile is linked to this account.');
      setProfileId(String(self.id));
      const details = await patientPortalService.getProfile(self.id);
      setForm({
        bloodGroup: details.bloodGroup || '',
        allergies: Array.isArray(details.allergies) ? details.allergies.join(', ') : details.allergies || '',
        emergencyContact: details.emergencyContact || '',
        insuranceProvider: details.insuranceProvider || '',
        insurancePolicy: details.insurancePolicy || '',
      });
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'Your patient profile service is not available.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await patientPortalService.updateProfile(profileId, {
        ...form,
        allergies: form.allergies.split(',').map((item) => item.trim()).filter(Boolean),
      });
      toast.success('Your patient profile was saved.');
    } catch (requestError) {
      toast.error(apiErrorMessage(requestError, 'Your profile could not be saved.'));
    } finally {
      setSaving(false);
    }
  };

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  return (
    <div className="mx-auto max-w-[850px] space-y-6">
      <header><p className="font-bold text-teal-700">Patient portal</p><h2 className="mt-1 text-3xl font-black text-ink sm:text-4xl">My health profile</h2><p className="mt-2 text-navy-700">Keep important information available to your care team.</p></header>
      <Card>
        {loading ? <Loading label="Loading your profile..." /> : error ? (
          <div role="alert"><p className="font-bold text-danger">Profile could not be loaded</p><p className="mt-1 text-navy-700">{error}</p><Button variant="secondary" className="mt-4" onClick={loadProfile}>Try again</Button></div>
        ) : (
          <form className="space-y-5" onSubmit={save}>
            <p className="text-sm text-navy-700">Signed in as {user?.name}. Your name and account email are managed by the hospital.</p>
            <label className="block"><span className="mb-2 block font-bold">Blood group</span><select className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-4" value={form.bloodGroup} onChange={update('bloodGroup')}><option value="">Not provided</option>{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => <option key={group}>{group}</option>)}</select></label>
            <Input label="Allergies (separate with commas)" value={form.allergies} onChange={update('allergies')} placeholder="For example: penicillin, peanuts" />
            <Input label="Emergency contact" value={form.emergencyContact} onChange={update('emergencyContact')} placeholder="Name and phone number" />
            <div className="grid gap-5 sm:grid-cols-2"><Input label="Insurance provider" value={form.insuranceProvider} onChange={update('insuranceProvider')} /><Input label="Insurance policy number" value={form.insurancePolicy} onChange={update('insurancePolicy')} /></div>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save health profile'}</Button>
          </form>
        )}
      </Card>
    </div>
  );
}
