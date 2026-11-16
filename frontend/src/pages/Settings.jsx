import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authErrorMessage, authService } from '../api/authService';
import { adminService } from '../api/adminService';
import { apiErrorMessage } from '../api/errorMessage';
import { isDemoMode } from '../api/demoAuth';
import { Button, Card, Input } from '../components/ui';

export default function Settings() {
  const { logout } = useAuth();
  const [settings, setSettings] = useState({ name: '', hours: '', contactPhone: '', emergencyPhone: '', address: '' });
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [password, setPassword] = useState({ current: '', next: '', confirm: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  const loadSettings = () => {
    setLoadingSettings(true);
    setSettingsError('');
    adminService.getHospitalSettings()
      .then(setSettings)
      .catch((error) => {
        const message = isDemoMode()
          ? error.message || 'Hospital settings could not be loaded.'
          : apiErrorMessage(error, 'Backend not connected. Hospital settings are unavailable.');
        setSettingsError(message);
        toast.error(message);
      })
      .finally(() => setLoadingSettings(false));
  };

  useEffect(() => { loadSettings(); }, []);

  const saveHospitalSettings = async (event) => {
    event.preventDefault();
    setSavingSettings(true);
    try {
      const saved = await adminService.updateHospitalSettings(settings);
      setSettings(saved);
      toast.success('Hospital settings saved.');
    } catch (error) {
      const message = isDemoMode()
        ? error.message || 'Hospital settings were not saved.'
        : apiErrorMessage(error, 'Backend not connected. Hospital settings were not saved.');
      setSettingsError(message);
      toast.error(message);
    } finally {
      setSavingSettings(false);
    }
  };
  const savePassword = async (event) => {
    event.preventDefault();
    if (password.next.length < 8 || password.next !== password.confirm) {
      return toast.error('Use at least 8 characters and make sure the new passwords match.');
    }
    setSavingPassword(true);
    try {
      const result = await authService.changePassword(password.current, password.next);
      setPassword({ current: '', next: '', confirm: '' });
      toast.success(result.message || 'Password updated. Please sign in again.');
      logout();
    } catch (error) {
      toast.error(authErrorMessage(error, 'Password could not be changed.'));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div><p className="font-bold text-teal-700">Hospital administration</p><h2 className="mt-1 text-3xl font-black text-ink sm:text-4xl">Hospital settings</h2><p className="mt-2 text-navy-700">Manage contact details, operating hours, and emergency information.</p></div>
      {settingsError && <Card role="alert" className="border-red-200 bg-red-50"><p className="font-bold text-danger">{settingsError}</p><Button variant="secondary" className="mt-4" onClick={loadSettings} disabled={loadingSettings}>Try again</Button></Card>}
      <Card>
        <h3 className="text-xl font-extrabold">Public hospital information</h3>
        <p className="mt-1 text-sm leading-6 text-navy-700">{isDemoMode() ? 'Demo values are examples saved only in this browser.' : 'Keep the emergency number accurate. These details do not place calls or contact emergency services.'}</p>
        {loadingSettings ? <p className="mt-5 text-navy-700">Loading hospital settings…</p> : !settingsError && <form onSubmit={saveHospitalSettings} className="mt-5 grid gap-5 sm:grid-cols-2">
          <Input label="Hospital name" required value={settings.name} onChange={(event) => setSettings({ ...settings, name: event.target.value })} />
          <Input label="Contact phone" required type="tel" value={settings.contactPhone} onChange={(event) => setSettings({ ...settings, contactPhone: event.target.value })} />
          <Input label="Emergency phone" required type="tel" value={settings.emergencyPhone} onChange={(event) => setSettings({ ...settings, emergencyPhone: event.target.value })} />
          <Input label="Working hours" required value={settings.hours} onChange={(event) => setSettings({ ...settings, hours: event.target.value })} />
          <Input label="Address" required value={settings.address} onChange={(event) => setSettings({ ...settings, address: event.target.value })} />
          <Button type="submit" className="sm:col-span-2" disabled={savingSettings || loadingSettings}>{savingSettings ? 'Saving settings…' : 'Save hospital settings'}</Button>
        </form>
        }
      </Card>
      <Card>
        <h3 className="text-xl font-extrabold">Change password</h3>
        <form onSubmit={savePassword} className="mt-5 space-y-5">
          <Input label="Current password" type="password" autoComplete="current-password" minLength="8" required value={password.current} onChange={(event) => setPassword({ ...password, current: event.target.value })} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="New password" type="password" autoComplete="new-password" minLength="8" required value={password.next} onChange={(event) => setPassword({ ...password, next: event.target.value })} />
            <Input label="Confirm new password" type="password" autoComplete="new-password" minLength="8" required value={password.confirm} onChange={(event) => setPassword({ ...password, confirm: event.target.value })} />
          </div>
          <Button type="submit" variant="secondary" disabled={savingPassword}>{savingPassword ? 'Updating password...' : 'Update password'}</Button>
        </form>
      </Card>
    </div>
  );
}
