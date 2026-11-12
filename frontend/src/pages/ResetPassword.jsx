import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authErrorMessage, authService } from '../api/authService';
import Logo from '../components/Logo';
import { Button, Card, Input } from '../components/ui';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!token) return toast.error('This reset link is incomplete. Request a new password reset link.');
    if (password !== confirmPassword) return toast.error('The passwords do not match.');
    setSubmitting(true);
    try {
      const result = await authService.resetPassword(token, password);
      toast.success(result.message || 'Password updated. Sign in with your new password.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(authErrorMessage(error, 'Password could not be reset. The link may have expired.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-navy-50 p-5">
      <Card className="w-full max-w-md">
        <Link to="/"><Logo /></Link>
        <h1 className="mt-7 text-2xl font-black text-ink">Choose a new password</h1>
        <p className="mt-2 leading-7 text-navy-700">Use at least 8 characters. Reset links expire and can be used once.</p>
        {!token ? (
          <div className="mt-5 rounded-lg bg-amber-50 p-4 text-amber-950">
            This reset link is incomplete or expired. <Link className="font-extrabold underline" to="/forgot-password">Request another link</Link>.
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={submit}>
            <Input label="New password" type="password" autoComplete="new-password" minLength="8" required value={password} onChange={(event) => setPassword(event.target.value)} />
            <Input label="Confirm new password" type="password" autoComplete="new-password" minLength="8" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
            <Button type="submit" className="w-full" disabled={submitting}>{submitting ? 'Updating password...' : 'Set new password'}</Button>
          </form>
        )}
        <Link to="/login" className="mt-5 inline-block font-bold text-teal-700">Back to sign in</Link>
      </Card>
    </main>
  );
}
