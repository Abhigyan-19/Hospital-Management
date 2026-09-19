import {
  ArrowRight,
  Baby,
  Brain,
  CheckCircle2,
  Clock3,
  HeartPulse,
  Menu,
  PhoneCall,
  ShieldCheck,
  Stethoscope,
  Syringe,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import { Button } from "../components/ui";

const services = [
  [
    "Patient Management",
    "Register and manage demographics, medical history and visit details.",
    Users,
  ],
  [
    "Doctor & Staff Management",
    "Coordinate schedules, roles and access for every provider.",
    Stethoscope,
  ],
  [
    "Appointment Scheduling",
    "Make bookings and availability easier for patients and teams.",
    Clock3,
  ],
  [
    "Prescription Tracking",
    "Keep medication instructions accurate, clear and connected.",
    Syringe,
  ],
  [
    "Reporting & Analytics",
    "Turn everyday hospital activity into useful decisions.",
    Brain,
  ],
  [
    "Secure Access",
    "Keep sensitive medical data protected with role-based access.",
    ShieldCheck,
  ],
];

const departments = [
  ["Cardiology", "Heart and vascular care", HeartPulse],
  ["Paediatrics", "Care for growing families", Baby],
  ["General Medicine", "Everyday health support", Stethoscope],
];

const doctors = [
  {
    name: "Dr. Anika Sharma",
    specialty: "Cardiology",
    initials: "AS",
    color: "bg-teal-100 text-teal-700",
  },
  {
    name: "Dr. Kabir Menon",
    specialty: "Orthopaedics",
    initials: "KM",
    color: "bg-navy-100 text-navy-700",
  },
  {
    name: "Dr. Priya Rao",
    specialty: "Paediatrics",
    initials: "PR",
    color: "bg-amber-100 text-warning",
  },
];

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-extrabold uppercase tracking-[.18em] text-teal-700">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-ink sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 leading-7 text-navy-700">{description}</p>
    </div>
  );
}

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  return (
    <div className="overflow-hidden bg-white text-ink">
      <header className="sticky top-0 z-40 border-b border-navy-100/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" onClick={closeMenu}>
            <Logo />
          </Link>
          <nav
            className="hidden items-center gap-7 lg:flex"
            aria-label="Public navigation"
          >
            <a href="#home" className="font-bold text-teal-700">
              Home
            </a>
            <a
              href="#services"
              className="font-bold text-navy-700 hover:text-teal-700"
            >
              Services
            </a>
            <a
              href="#departments"
              className="font-bold text-navy-700 hover:text-teal-700"
            >
              Departments
            </a>
            <a
              href="#doctors"
              className="font-bold text-navy-700 hover:text-teal-700"
            >
              Doctors
            </a>
            <a
              href="#contact"
              className="font-bold text-navy-700 hover:text-teal-700"
            >
              Contact
            </a>
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              to="/login"
              className="font-extrabold text-navy-700 hover:text-teal-700"
            >
              Staff login
            </Link>
            <Button
              onClick={() =>
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Book appointment <ArrowRight size={18} />
            </Button>
          </div>
          <button
            className="rounded-lg p-2 text-navy-700 hover:bg-navy-50 lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={25} /> : <Menu size={25} />}
          </button>
        </div>
        {menuOpen && (
          <nav
            className="border-t border-navy-100 bg-white px-5 py-4 lg:hidden"
            aria-label="Mobile navigation"
          >
            <div className="mx-auto max-w-7xl space-y-1">
              <a
                href="#services"
                onClick={closeMenu}
                className="flex min-h-11 items-center rounded-lg px-3 font-bold text-navy-700"
              >
                Services
              </a>
              <a
                href="#departments"
                onClick={closeMenu}
                className="flex min-h-11 items-center rounded-lg px-3 font-bold text-navy-700"
              >
                Departments
              </a>
              <a
                href="#doctors"
                onClick={closeMenu}
                className="flex min-h-11 items-center rounded-lg px-3 font-bold text-navy-700"
              >
                Doctors
              </a>
              <a
                href="#contact"
                onClick={closeMenu}
                className="flex min-h-11 items-center rounded-lg px-3 font-bold text-navy-700"
              >
                Contact
              </a>
              <Link
                to="/login"
                onClick={closeMenu}
                className="mt-2 flex min-h-11 items-center rounded-lg bg-teal-50 px-3 font-extrabold text-teal-700"
              >
                Staff login
              </Link>
            </div>
          </nav>
        )}
      </header>

      <main>
        <section id="home" className="surface-pattern relative">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.05fr_.95fr] lg:py-28">
            <div className="relative z-10">
              <p className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-4 py-2 text-sm font-extrabold text-teal-700">
                <span className="h-2 w-2 rounded-full bg-success" /> Trusted
                care, thoughtfully connected
              </p>
              <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[1.04] tracking-tight text-ink sm:text-6xl lg:text-7xl">
                Better care starts with a clearer view.
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-navy-700 sm:text-xl">
                SEBASETHU brings patients, doctors and hospital teams together
                so every important moment gets the attention it deserves.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() =>
                    document
                      .getElementById("contact")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Book an appointment <ArrowRight size={19} />
                </Button>
                <Link
                  to="/login"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-navy-100 bg-white px-5 font-extrabold text-navy-700 hover:bg-navy-50"
                >
                  Staff login
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm font-bold text-navy-700">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="text-success" size={18} />{" "}
                  Compassionate teams
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="text-success" size={18} /> Modern
                  facilities
                </span>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-lg">
              <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-teal-100/70" />
              <div className="relative rounded-[2rem] bg-navy-900 p-5 shadow-2xl sm:p-7">
                <div className="rounded-2xl bg-white p-5 sm:p-7">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-navy-500">
                        Today at SEBASETHU
                      </p>
                      <p className="mt-1 text-2xl font-black">Care in motion</p>
                    </div>
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-teal-100 text-teal-700">
                      <HeartPulse size={27} />
                    </span>
                  </div>
                  <div className="mt-7 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-teal-50 p-4">
                      <p className="text-3xl font-black text-teal-700">1,284</p>
                      <p className="mt-1 text-sm font-bold text-navy-700">
                        Patients supported
                      </p>
                    </div>
                    <div className="rounded-xl bg-navy-50 p-4">
                      <p className="text-3xl font-black text-navy-700">48</p>
                      <p className="mt-1 text-sm font-bold text-navy-700">
                        Specialist doctors
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 rounded-xl border border-navy-100 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-extrabold">Your care team</p>
                      <span className="text-sm font-bold text-success">
                        Available today
                      </span>
                    </div>
                    <div className="mt-4 flex items-center">
                      <span className="grid h-11 w-11 place-items-center rounded-full bg-amber-100 font-black text-warning">
                        AS
                      </span>
                      <span className="-ml-2 grid h-11 w-11 place-items-center rounded-full bg-teal-100 font-black text-teal-700">
                        PR
                      </span>
                      <span className="-ml-2 grid h-11 w-11 place-items-center rounded-full bg-navy-100 font-black text-navy-700">
                        KM
                      </span>
                      <span className="ml-3 text-sm font-bold text-navy-700">
                        + 45 care professionals
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-5 flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-xl">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 text-success">
                  <ShieldCheck size={21} />
                </span>
                <span>
                  <strong className="block text-sm">
                    Your privacy matters
                  </strong>
                  <small className="font-bold text-navy-500">
                    Secure by design
                  </small>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-navy-100 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-navy-100 px-5 py-7 sm:grid-cols-4 sm:px-8">
            <div className="px-4 text-center sm:px-6">
              <p className="text-3xl font-black text-teal-700">12k+</p>
              <p className="mt-1 text-sm font-bold text-navy-700">
                Patients served
              </p>
            </div>
            <div className="px-4 text-center sm:px-6">
              <p className="text-3xl font-black text-navy-700">48</p>
              <p className="mt-1 text-sm font-bold text-navy-700">
                Expert doctors
              </p>
            </div>
            <div className="border-t border-navy-100 px-4 pt-6 text-center sm:border-t-0 sm:px-6 sm:pt-0">
              <p className="text-3xl font-black text-teal-700">16</p>
              <p className="mt-1 text-sm font-bold text-navy-700">
                Departments
              </p>
            </div>
            <div className="border-t border-navy-100 px-4 pt-6 text-center sm:border-t-0 sm:px-6 sm:pt-0">
              <p className="text-3xl font-black text-navy-700">15 yrs</p>
              <p className="mt-1 text-sm font-bold text-navy-700">
                Of trusted care
              </p>
            </div>
          </div>
        </section>

        <section
          id="services"
          className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28"
        >
          <SectionHeading
            eyebrow="Care, connected"
            title="Everything your care journey needs"
            description="From a first consultation to ongoing treatment, our people and systems work together around what matters most: your health."
          />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map(([title, description, Icon]) => (
              <article
                key={title}
                className="group rounded-2xl border border-navy-100 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:border-teal-100"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-teal-50 text-teal-700 transition group-hover:bg-teal-600 group-hover:text-white">
                  <Icon size={24} />
                </span>
                <h3 className="mt-6 text-xl font-extrabold">{title}</h3>
                <p className="mt-2 leading-7 text-navy-700">{description}</p>
                <span className="mt-5 inline-flex items-center gap-1 font-extrabold text-teal-700">
                  Learn more <ArrowRight size={17} />
                </span>
              </article>
            ))}
          </div>
        </section>

        <section id="departments" className="bg-navy-50">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
            <SectionHeading
              eyebrow="Find your care"
              title="Specialists who listen first"
              description="Our departments bring experience and empathy together, so you can feel informed and supported at every step."
            />
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {departments.map(([title, description, Icon]) => (
                <article
                  key={title}
                  className="flex items-center gap-5 rounded-2xl bg-white p-6 shadow-soft"
                >
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-teal-100 text-teal-700">
                    <Icon size={27} />
                  </span>
                  <div>
                    <h3 className="text-xl font-extrabold">{title}</h3>
                    <p className="mt-1 text-navy-700">{description}</p>
                    <a
                      href="#contact"
                      className="mt-3 inline-flex items-center gap-1 font-extrabold text-teal-700"
                    >
                      Explore department <ArrowRight size={16} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="doctors"
          className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28"
        >
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="max-w-xl">
              <p className="text-sm font-extrabold uppercase tracking-[.18em] text-teal-700">
                Meet your doctors
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                A team you can talk to
              </h2>
              <p className="mt-4 leading-7 text-navy-700">
                Experienced clinicians who make room for your questions and your
                whole story.
              </p>
            </div>
            <a
              href="#contact"
              className="inline-flex items-center gap-1 font-extrabold text-teal-700"
            >
              View all doctors <ArrowRight size={18} />
            </a>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {doctors.map((doctor) => (
              <article
                key={doctor.name}
                className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft"
              >
                <div
                  className={`flex h-48 items-center justify-center rounded-xl text-6xl font-black ${doctor.color}`}
                >
                  {doctor.initials}
                </div>
                <div className="flex items-start justify-between gap-3 pt-5">
                  <div>
                    <h3 className="text-xl font-extrabold">{doctor.name}</h3>
                    <p className="mt-1 font-bold text-teal-700">
                      {doctor.specialty}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-success">
                    Available
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-teal-700 text-white">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[.18em] text-teal-100">
                A better hospital experience
              </p>
              <h2 className="mt-3 max-w-2xl text-3xl font-black sm:text-4xl">
                Simple tools for the people who make care possible.
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-teal-50">
                Our connected approach helps hospital teams spend less time
                searching and more time being present with patients.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 font-extrabold text-teal-700 hover:bg-teal-50"
            >
              Explore staff portal <ArrowRight size={19} />
            </Link>
          </div>
        </section>

        <section
          id="contact"
          className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28"
        >
          <div className="grid gap-8 rounded-3xl bg-navy-900 p-7 text-white sm:p-12 lg:grid-cols-[1fr_.8fr] lg:items-center">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[.18em] text-teal-100">
                Start with a conversation
              </p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Ready to plan your visit?
              </h2>
              <p className="mt-4 max-w-xl leading-7 text-navy-100">
                Call our appointments desk and our team will help you find the
                right department and time.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-6">
              <p className="text-sm font-bold text-teal-100">
                Appointments desk
              </p>
              <a
                href="tel:+911800123456"
                className="mt-2 flex items-center gap-3 text-2xl font-black text-white"
              >
                <PhoneCall size={24} /> 1800 123 456
              </a>
              <p className="mt-3 flex items-center gap-2 text-sm font-bold text-navy-100">
                <Clock3 size={17} /> Mon - Sat, 8:00 AM - 8:00 PM
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-navy-100 bg-navy-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.2fr_.8fr_.8fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm leading-7 text-navy-700">
              Bridging care and technology for a healthier, more connected
              community.
            </p>
          </div>
          <div>
            <h3 className="font-extrabold">Visit us</h3>
            <p className="mt-4 leading-7 text-navy-700">
              24 Care Avenue
              <br />
              New Delhi, India
            </p>
          </div>
          <div>
            <h3 className="font-extrabold">Urgent care</h3>
            <p className="mt-4 text-2xl font-black text-danger">
              Emergency: 112
            </p>
            <p className="mt-1 text-navy-700">Available 24 hours a day</p>
          </div>
        </div>
        <div className="border-t border-navy-100 px-5 py-5 text-center text-sm font-bold text-navy-500 sm:px-8">
          © 2026 SEBASETHU. Bridging care and technology.
        </div>
      </footer>
    </div>
  );
}
