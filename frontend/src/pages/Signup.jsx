import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button, Card, Input } from '../components/ui';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { authErrorMessage } from '../api/authService';

export default function Signup() {
  const { role: routeRole } = useParams();
  const role = String(routeRole || '').toUpperCase();
  const isPatient = role === 'PATIENT';
  const { register: registerAccount } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    age: '',
    gender: '',
    patientRelationship: 'SELF',
    relationship: '',
    patientName: '',
    specialization: '',
    experience: '',
  });

  if (!['PATIENT', 'DOCTOR'].includes(role)) {
    return <main className="grid min-h-screen place-items-center bg-navy-50 p-5"><Card><p className="font-extrabold">Registration is not available for this account type.</p><Link className="mt-4 inline-block font-bold text-teal-700" to="/login">Return to sign in</Link></Card></main>;
  }

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    const details = {
      ...form,
      role,
      age: isPatient ? Number(form.age) : undefined,
      experience: isPatient ? undefined : Number(form.experience),
      relationship: isPatient && form.patientRelationship === 'FAMILY' ? form.relationship : undefined,
      patientName: isPatient ? (form.patientRelationship === 'SELF' ? form.name : form.patientName) : undefined,
    };
    try {
      const result = await registerAccount(details);
      const message = result?.message || (isPatient
        ? 'Registration submitted. Sign in after the hospital service confirms your account.'
        : 'Registration submitted. Your doctor account is pending administrator approval.');
      toast.success(message);
      navigate('/login', {
        replace: true,
        state: { registrationMessage: message, doctorPending: !isPatient },
      });
    } catch (error) {
      toast.error(authErrorMessage(error, 'Registration could not be completed.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-navy-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6"><Link to="/"><Logo /></Link></div>
        <Card>
          <p className="font-bold text-teal-700">{isPatient ? 'Patient portal' : 'Doctor portal'}</p>
          <h1 className="mt-1 text-3xl font-black text-ink">{isPatient ? 'Create a patient account' : 'Doctor registration'}</h1>
          <p className="mt-2 text-navy-700">
            {isPatient ? 'Register for yourself or as a family representative. Patient records are linked by the hospital service.' : 'Submit your professional details. Account eligibility is verified by the hospital service.'}
          </p>
          <form onSubmit={submit} className="mt-7 grid gap-4 sm:grid-cols-2">
            <Input label={isPatient && form.patientRelationship === 'FAMILY' ? 'Your name (family representative)' : 'Full name'} required value={form.name} onChange={update('name')} />
            <Input label="Email address" type="email" autoComplete="email" required value={form.email} onChange={update('email')} />
            <Input label="Password" type="password" autoComplete="new-password" minLength="8" required value={form.password} onChange={update('password')} />
            <Input label="Phone number" type="tel" required value={form.phone} onChange={update('phone')} />
            {isPatient ? (
              <>
                <label className="block sm:col-span-2">
                  <span className="mb-2 block font-bold text-ink">Who are you registering for?</span>
                  <select className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-4" value={form.patientRelationship} onChange={update('patientRelationship')}>
                    <option value="SELF">Myself (I am the patient)</option>
                    <option value="FAMILY">A family member (I am their representative)</option>
                  </select>
                </label>
                {form.patientRelationship === 'FAMILY' && <Input label="Relationship to patient" required placeholder="For example: daughter, son, spouse" value={form.relationship} onChange={update('relationship')} />}
                {form.patientRelationship === 'FAMILY' && <Input label="Patient's full name" required value={form.patientName} onChange={update('patientName')} />}
                <Input label="Patient age" type="number" min="0" max="125" required value={form.age} onChange={update('age')} />
                <label className="block">
                  <span className="mb-2 block font-bold text-ink">Patient gender</span>
                  <select className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-4" required value={form.gender} onChange={update('gender')}>
                    <option value="">Select</option><option>Female</option><option>Male</option><option>Other</option><option>Prefer not to say</option>
                  </select>
                </label>
              </>
            ) : (
              <>
                <Input label="Professional department / specialty" required placeholder="Cardiology, Urology..." value={form.specialization} onChange={update('specialization')} />
                <Input label="Years of experience" type="number" min="0" required value={form.experience} onChange={update('experience')} />
                <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 sm:col-span-2">Doctor accounts and professional details must be verified by the hospital service before access is granted.</p>
              </>
            )}
            <div className="flex flex-col gap-3 pt-2 sm:col-span-2 sm:flex-row sm:justify-end">
              <Link to="/login" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-navy-100 px-5 font-bold text-navy-700">Back to sign in</Link>
              <Button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit registration'}</Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
