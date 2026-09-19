import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { Button, Card, Input } from '../components/ui';
import { useForm } from 'react-hook-form';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues: { email: 'admin@sebasethu.health', password: 'demo123' } });
  const onSubmit = async (values) => { await login(values); navigate('/dashboard'); };
  return <main className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_.95fr]"><section className="hidden bg-navy-900 p-12 text-white lg:flex lg:flex-col lg:justify-between"><Logo /><div className="max-w-xl"><p className="mb-5 text-sm font-extrabold uppercase tracking-[.2em] text-teal-100">Care coordination, made clear</p><h1 className="text-5xl font-black leading-tight">A calmer way to care for every patient.</h1><p className="mt-6 max-w-lg text-lg leading-8 text-navy-100">SEBASETHU brings your hospital teams, patient records and daily priorities into one dependable workspace.</p></div><p className="text-sm text-navy-100">Secure staff access for your care team.</p></section><section className="flex items-center justify-center bg-navy-50 p-5 sm:p-10"><Card className="w-full max-w-md p-7 sm:p-10"><div className="mb-10 lg:hidden"><Logo /></div><p className="text-sm font-extrabold uppercase tracking-widest text-teal-700">Staff portal</p><h2 className="mt-2 text-3xl font-black text-ink">Welcome back</h2><p className="mt-2 text-navy-700">Sign in to continue to your workspace.</p><form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5"><Input label="Work email" type="email" autoComplete="email" error={errors.email?.message} {...register('email', { required: 'Please enter your work email.' })} /><Input label="Password" type="password" autoComplete="current-password" error={errors.password?.message} {...register('password', { required: 'Please enter your password.' })} /><Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Signing in...' : <>Sign in <ArrowRight size={19} /></>}</Button></form><div className="mt-8 flex gap-3 rounded-xl bg-teal-50 p-4 text-sm text-teal-700"><ShieldCheck className="shrink-0" size={20} /><p><strong>Demo access:</strong> use any email and password to preview the staff workspace.</p></div></Card></section></main>;
}
