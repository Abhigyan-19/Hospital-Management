import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Ambulance,
  CalendarDays,
  CheckCircle2,
  Clock3,
  HeartPulse,
  MapPinned,
  ShieldAlert,
  Stethoscope,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { doctorService } from '../api/doctorService';
import { isDemoMode } from '../api/demoAuth';
import { Button, Card, EmptyState, Skeleton } from '../components/ui';
import { PublicSite } from '../components/PublicSite';

const services = [
  ['Appointments', 'Find a doctor and prepare for a hospital visit.', CalendarDays],
  ['Specialist care', 'Browse the departments and doctors listed by the hospital.', Stethoscope],
  ['Patient portal', 'Sign in to review your appointments and available care records.', HeartPulse],
];

const faqs = [
  {
    question: 'How do I find a doctor?',
    answer: 'Use Find a doctor to search by name or department. Profile details appear when the hospital has provided them.',
  },
  {
    question: 'How can I book an appointment?',
    answer: 'Sign in to a patient account to request an appointment. If you need help, contact the hospital reception desk.',
  },
  {
    question: 'Can I manage appointments for a family member?',
    answer: 'A signed-in patient can select a linked family profile when booking. The hospital service must verify profile access.',
  },
  {
    question: 'What should I do in an emergency?',
    answer: 'This website is not an emergency service. If someone is in immediate danger, contact local emergency services or go to the nearest emergency department.',
  },
];

export default function Landing() {
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [doctorError, setDoctorError] = useState(false);

  useEffect(() => {
    doctorService.listPublic()
      .then(setDoctors)
      .catch(() => setDoctorError(true))
      .finally(() => setLoadingDoctors(false));
  }, []);

  const departments = useMemo(
    () => [...new Set(doctors.map((doctor) => doctor.specialization).filter(Boolean))].slice(0, 3),
    [doctors],
  );
  const doctorLoadMessage = isDemoMode() || import.meta.env.VITE_USE_MOCK === 'true'
    ? 'Demo doctor information could not be loaded.'
    : 'Backend not connected. Doctor previews need GET /doctors.';

  return (
    <PublicSite>
      <main>
        <section className="surface-pattern">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-4 py-2 font-extrabold text-teal-700">
                <CheckCircle2 size={18} aria-hidden="true" /> Care information made clear
              </p>
              <h1 className="mt-6 max-w-2xl text-4xl font-black leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl">
                A clearer path to the care you need.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-navy-700">
                Find hospital departments, review doctor information, and use your patient portal to manage appointments and care.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/find-a-doctor"><Button><Stethoscope size={19} aria-hidden="true" />Find a doctor</Button></Link>
                <Link to="/register/patient" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-navy-100 bg-white px-5 font-extrabold text-navy-700 hover:bg-navy-50">Create patient account</Link>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-navy-800">
                <span className="inline-flex items-center gap-2"><CheckCircle2 size={18} className="text-teal-700" aria-hidden="true" />Clear next steps</span>
                <span className="inline-flex items-center gap-2"><CheckCircle2 size={18} className="text-teal-700" aria-hidden="true" />Support for families</span>
              </div>
            </div>
            <Card className="relative overflow-hidden border-teal-100 p-6 sm:p-8">
              <span className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-teal-50" aria-hidden="true" />
              <div className="relative">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-teal-100 text-teal-700" aria-hidden="true"><HeartPulse size={30} /></span>
                <h2 className="mt-5 text-2xl font-black">Your visit, step by step</h2>
                <ol className="mt-5 space-y-4">
                  <li className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-teal-50 font-extrabold text-teal-700">1</span><span><strong className="block">Choose a department</strong><span className="text-navy-700">Start with the type of care you need.</span></span></li>
                  <li className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-teal-50 font-extrabold text-teal-700">2</span><span><strong className="block">Review doctor details</strong><span className="text-navy-700">Check the information provided by the hospital.</span></span></li>
                  <li className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-teal-50 font-extrabold text-teal-700">3</span><span><strong className="block">Request an appointment</strong><span className="text-navy-700">Sign in to manage your booking.</span></span></li>
                </ol>
                <Link to="/care/departments" className="mt-6 inline-flex min-h-11 items-center gap-2 font-extrabold text-teal-700">Browse departments <ArrowRight size={18} aria-hidden="true" /></Link>
              </div>
            </Card>
          </div>
        </section>

        <section id="about" className="scroll-mt-24 mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="font-extrabold text-teal-700">About SEBASETHU</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">One place to start your hospital visit.</h2>
            <p className="mt-4 leading-8 text-navy-700">SEBASETHU brings public hospital information and role-based care tools together. Patients, doctors, receptionists, and administrators use separate workspaces for their responsibilities.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {services.map(([title, description, Icon]) => (
              <article key={title} className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft">
                <Icon size={24} className="text-teal-700" aria-hidden="true" />
                <h3 className="mt-3 font-extrabold">{title}</h3>
                <p className="mt-2 leading-6 text-navy-700">{description}</p>
              </article>
            ))}
            <article className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft">
              <ShieldAlert size={24} className="text-teal-700" aria-hidden="true" />
              <h3 className="mt-3 font-extrabold">Responsible information</h3>
              <p className="mt-2 leading-6 text-navy-700">Profile and appointment details are shown only when supplied by the hospital system.</p>
            </article>
          </div>
        </section>

        <section className="bg-navy-50">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div><p className="font-extrabold text-teal-700">Care specialties</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Explore departments</h2><p className="mt-3 max-w-2xl leading-7 text-navy-700">Department listings come from the doctors currently provided by the hospital.</p></div>
              <Link to="/care/departments" className="inline-flex min-h-11 items-center gap-2 font-extrabold text-teal-700">All departments <ArrowRight size={18} aria-hidden="true" /></Link>
            </div>
            {loadingDoctors ? <div className="mt-8 grid gap-4 md:grid-cols-3" aria-label="Loading departments">{[1, 2, 3].map((item) => <Card key={item}><Skeleton className="h-6 w-2/3" /><Skeleton className="mt-3 h-4 w-full" /></Card>)}</div>
              : doctorError ? <p role="alert" className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">{doctorLoadMessage}</p>
                : departments.length === 0 ? <p className="mt-7 rounded-xl border border-dashed border-navy-100 bg-white p-6 text-navy-700">No department information has been published yet.</p>
                  : <div className="mt-8 grid gap-4 md:grid-cols-3">{departments.map((department) => (
                    <Card key={department}>
                      <h3 className="text-xl font-extrabold">{department}</h3>
                      <p className="mt-2 leading-7 text-navy-700">View doctors listed for this specialty and the profile details available.</p>
                      <Link to={`/care/departments/${encodeURIComponent(department)}`} className="mt-4 inline-flex min-h-11 items-center gap-2 font-extrabold text-teal-700">Explore department <ArrowRight size={18} aria-hidden="true" /></Link>
                    </Card>
                  ))}</div>}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="font-extrabold text-teal-700">Meet the care team</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Find a doctor</h2><p className="mt-3 max-w-2xl leading-7 text-navy-700">Search the hospital's doctor directory and open a profile for available details.</p></div>
            <Link to="/find-a-doctor" className="inline-flex min-h-11 items-center gap-2 font-extrabold text-teal-700">Search all doctors <ArrowRight size={18} aria-hidden="true" /></Link>
          </div>
          {loadingDoctors ? <div className="mt-8 grid gap-4 md:grid-cols-3" aria-label="Loading doctors">{[1, 2, 3].map((item) => <Card key={item}><Skeleton className="h-14 w-14" /><Skeleton className="mt-5 h-5 w-2/3" /></Card>)}</div>
            : doctorError ? <p role="alert" className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">{doctorLoadMessage}</p>
              : doctors.length === 0 ? <EmptyState title="No doctors are listed yet">The hospital has not published doctor details.</EmptyState>
                : <div className="mt-8 grid gap-4 md:grid-cols-3">{doctors.slice(0, 3).map((doctor) => (
                  <Card key={doctor.id}>
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-teal-100 text-teal-700" aria-hidden="true"><Stethoscope size={27} /></span>
                    <h3 className="mt-4 text-xl font-extrabold">{doctor.name}</h3>
                    <p className="mt-1 font-bold text-teal-700">{doctor.specialization || 'Specialty not provided'}</p>
                    <p className="mt-3 text-navy-700">{doctor.experience == null ? 'Experience not provided' : `${doctor.experience} years of experience`}</p>
                    <Link to={`/doctors/${doctor.id}`} className="mt-4 inline-flex min-h-11 items-center gap-2 font-extrabold text-teal-700">View profile <ArrowRight size={18} aria-hidden="true" /></Link>
                  </Card>
                ))}</div>}
        </section>

        <section className="bg-teal-50">
          <div className="mx-auto grid max-w-7xl gap-6 px-5 py-14 sm:px-8 md:grid-cols-2">
            <Card>
              <h2 className="text-2xl font-black">Health packages</h2>
              <p className="mt-3 leading-7 text-navy-700">Package details and prices are not connected to the hospital system yet. Please ask reception to confirm current services and costs.</p>
              <a href="/#contact" className="mt-4 inline-flex min-h-11 items-center gap-2 font-extrabold text-teal-700">Contact information <ArrowRight size={18} aria-hidden="true" /></a>
            </Card>
            <Card>
              <h2 className="text-2xl font-black">Patient stories</h2>
              <p className="mt-3 leading-7 text-navy-700">No patient testimonials have been published. Stories will appear here only after the hospital receives permission to share them.</p>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <p className="text-center font-extrabold text-teal-700">Helpful information</p>
            <h2 className="mt-2 text-center text-3xl font-black sm:text-4xl">Frequently asked questions</h2>
            <div className="mt-8 space-y-3">
              {faqs.map((faq) => (
                <details key={faq.question} className="rounded-xl border border-navy-100 bg-white p-5 shadow-sm">
                  <summary className="min-h-11 cursor-pointer py-2 font-extrabold text-ink">{faq.question}</summary>
                  <p className="pb-2 leading-7 text-navy-700">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="ambulance-heading" className="bg-teal-50">
          <div className="mx-auto grid max-w-7xl gap-6 px-5 py-14 sm:px-8 sm:py-16 md:grid-cols-[auto_1fr] md:items-center">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white text-teal-700 shadow-soft" aria-hidden="true"><Ambulance size={34} /></span>
            <div>
              <p className="font-extrabold text-teal-700">Transport and emergency information</p>
              <h2 id="ambulance-heading" className="mt-2 text-3xl font-black">Ambulance services</h2>
              <p className="mt-3 max-w-3xl leading-7 text-navy-700">The hospital&apos;s ambulance availability, coverage, and dispatch phone number have not yet been confirmed for this website. Please contact hospital reception to ask about ambulance or patient-transfer arrangements.</p>
              <p className="mt-3 max-w-3xl leading-7 font-bold text-navy-900">If someone is in immediate danger, call your local emergency services now. This website cannot dispatch an ambulance, and the urgent-help form is not an emergency service.</p>
              <a href="/#contact" className="mt-4 inline-flex min-h-11 items-center gap-2 font-extrabold text-teal-700">Contact hospital information <ArrowRight size={18} aria-hidden="true" /></a>
            </div>
          </div>
        </section>

        <section id="contact" className="scroll-mt-24 bg-navy-900 text-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 sm:py-16 lg:grid-cols-2">
            <div>
              <p className="font-extrabold text-teal-100">Plan your visit</p>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">Contact and location</h2>
              <p className="mt-4 max-w-xl leading-7 text-navy-100">Hospital phone, address, and working hours have not yet been provided to this website. Please confirm these details with hospital reception before travelling.</p>
              <p className="mt-6 inline-flex items-center gap-2 font-extrabold text-teal-100"><Clock3 size={19} aria-hidden="true" />Working hours: not yet published</p>
              <p className="mt-4 inline-flex items-start gap-2 leading-7 text-white"><ShieldAlert size={20} className="mt-1 shrink-0 text-amber-300" aria-hidden="true" /><span><strong>Emergency:</strong> If someone is in immediate danger, contact your local emergency services. This website does not dispatch emergency help.</span></p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/find-a-doctor" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 font-extrabold text-teal-700 hover:bg-teal-50"><Stethoscope size={18} aria-hidden="true" />Find a doctor</Link>
                <Link to="/login" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/40 px-5 font-extrabold text-white hover:bg-white/10">Patient and staff sign in</Link>
              </div>
            </div>
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-white/20 bg-white/5 p-6 text-center" role="img" aria-label="Map placeholder. Hospital address and map are not connected.">
              <MapPinned size={38} className="text-teal-100" aria-hidden="true" />
              <h3 className="mt-4 text-xl font-extrabold">Hospital map</h3>
              <p className="mt-2 max-w-sm leading-7 text-navy-100">Address and map will appear here when the hospital location is confirmed.</p>
            </div>
          </div>
        </section>
      </main>
    </PublicSite>
  );
}
