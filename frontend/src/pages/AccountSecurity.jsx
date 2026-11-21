import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authErrorMessage, authService } from '../api/authService';
import { Button, Card, Input } from '../components/ui';

const emptyPassword = { currentPassword: '', newPassword: '', confirmPassword: '' };

export default function AccountSecurity() {
  const { user, logout } = useAuth();
  const [password, setPassword] = useState(emptyPassword);
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (password.newPassword !== password.confirmPassword) return toast.error('The new passwords do not match.');
    setSaving(true);
    try {
      const result = await authService.changePassword(password.currentPassword, password.newPassword);
      setPassword(emptyPassword);
      toast.success(result.message || 'Password updated. Please sign in again.');
      logout();
    } catch (error) {
      toast.error(authErrorMessage(error, 'Password could not be changed.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="font-bold text-teal-700">Account security</p>
        <h2 className="mt-1 text-3xl font-black text-ink sm:text-4xl">Change password</h2>
        <p className="mt-2 leading-7 text-navy-700">Update the password for your {user?.role?.toLowerCase() || 'hospital'} account.</p>
      </div>
      <Card>
        <form className="space-y-5" onSubmit={submit}>
          <Input label="Current password" type="password" autoComplete="current-password" minLength="8" required value={password.currentPassword} onChange={(event) => setPassword((current) => ({ ...current, currentPassword: event.target.value }))} />
          <Input label="New password" type="password" autoComplete="new-password" minLength="8" required value={password.newPassword} onChange={(event) => setPassword((current) => ({ ...current, newPassword: event.target.value }))} />
          <Input label="Confirm new password" type="password" autoComplete="new-password" minLength="8" required value={password.confirmPassword} onChange={(event) => setPassword((current) => ({ ...current, confirmPassword: event.target.value }))} />
          <p className="text-sm leading-6 text-navy-700">Changing your password signs you out so you can sign in again with the new one.</p>
          <Button type="submit" disabled={saving}>{saving ? 'Updating password...' : 'Update password'}</Button>
        </form>
      </Card>
    </div>
  );
}
