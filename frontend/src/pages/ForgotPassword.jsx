import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authErrorMessage, authService } from '../api/authService';
import { isDemoMode } from '../api/demoAuth';
import Logo from '../components/Logo';
import { Button, Card, Input } from '../components/ui';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [resetUrl, setResetUrl] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setResultMessage('');
    setResetUrl('');
    try {
      const result = await authService.requestPasswordReset(email);
      setResultMessage(result.message || 'If an account exists, password reset instructions will be sent.');
      setResetUrl(result.resetUrl || '');
      toast(result.message || 'If an account exists, password reset instructions will be sent.');
    } catch (error) {
      toast.error(authErrorMessage(error, 'Password reset is unavailable.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-navy-50 p-5">
      <Card className="w-full max-w-md">
        <Link to="/"><Logo /></Link>
        <h1 className="mt-7 text-2xl font-black text-ink">Reset your password</h1>
        <p className="mt-2 text-sm text-navy-700">Enter your account email to request reset instructions.</p>
        {isDemoMode() && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Demo reset links are generated in this browser only. No email is sent.</p>}
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <Input label="Email address" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          <Button type="submit" className="w-full" disabled={submitting}>{submitting ? 'Submitting...' : 'Request password reset'}</Button>
        </form>
        {resultMessage && <p role="status" className="mt-4 rounded-lg border border-teal-100 bg-teal-50 p-3 leading-6 text-teal-900">{resultMessage}</p>}
        {resetUrl && <Link to={resetUrl} className="mt-3 inline-flex min-h-11 items-center font-extrabold text-teal-700">Open local demo reset link</Link>}
        <Link to="/login" className="mt-5 inline-block font-bold text-teal-700">Back to sign in</Link>
      </Card>
    </main>
  );
}
