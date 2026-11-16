import { Ambulance, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const publicLinks = [
  { label: 'Home', to: '/' },
  { label: 'Find a doctor', to: '/find-a-doctor' },
  { label: 'Departments', to: '/care/departments' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
];

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-navy-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link to="/" onClick={closeMenu} aria-label="SEBASETHU home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Public navigation">
          {publicLinks.map((link) => link.href
            ? <a key={link.label} href={link.href} className="min-h-11 inline-flex items-center font-bold text-navy-700 hover:text-teal-700">{link.label}</a>
            : <Link key={link.label} to={link.to} className="min-h-11 inline-flex items-center font-bold text-navy-700 hover:text-teal-700">{link.label}</Link>)}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Link to="/login" className="inline-flex min-h-11 items-center rounded-lg px-3 font-extrabold text-navy-700 hover:bg-navy-50">Sign in</Link>
          <Link to="/register/patient" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-teal-600 px-5 font-bold text-white hover:bg-teal-700">Patient registration</Link>
        </div>
        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-navy-700 hover:bg-navy-50 lg:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </div>
      {menuOpen && (
        <nav className="border-t border-navy-100 bg-white px-5 py-3 lg:hidden" aria-label="Mobile public navigation">
          <div className="mx-auto max-w-7xl">
            {publicLinks.map((link) => link.href
              ? <a key={link.label} href={link.href} onClick={closeMenu} className="flex min-h-12 items-center rounded-lg px-3 font-bold text-navy-700 hover:bg-navy-50">{link.label}</a>
              : <Link key={link.label} to={link.to} onClick={closeMenu} className="flex min-h-12 items-center rounded-lg px-3 font-bold text-navy-700 hover:bg-navy-50">{link.label}</Link>)}
            <Link to="/login" onClick={closeMenu} className="mt-2 flex min-h-12 items-center rounded-lg bg-teal-50 px-3 font-extrabold text-teal-700">Sign in to your portal</Link>
            <Link to="/register/patient" onClick={closeMenu} className="mt-2 flex min-h-12 items-center rounded-lg px-3 font-extrabold text-teal-700 hover:bg-teal-50">Create patient account</Link>
          </div>
        </nav>
      )}
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-navy-100 bg-navy-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-3">
        <div>
          <Link to="/"><Logo /></Link>
          <p className="mt-4 max-w-sm leading-7 text-navy-700">Care information and hospital services, presented clearly for patients and families.</p>
        </div>
        <div>
          <h2 className="font-extrabold text-ink">Hospital information</h2>
          <p className="mt-3 leading-7 text-navy-700">Address, phone number, map, and visiting hours will be published here once confirmed by the hospital.</p>
        </div>
        <div>
          <Ambulance size={24} className="text-teal-700" aria-hidden="true" />
          <h2 className="font-extrabold text-ink">Emergency</h2>
          <p className="mt-3 leading-7 text-navy-700">Ambulance availability and dispatch contact are not yet confirmed. For immediate danger, call your local emergency service or go to the nearest emergency department.</p>
        </div>
      </div>
      <div className="border-t border-navy-100 px-5 py-4 text-center text-sm font-bold text-navy-700 sm:px-8">
        SEBASETHU · Hospital information portal
      </div>
    </footer>
  );
}

export function PublicSite({ children }) {
  return (
    <div className="min-h-screen bg-white text-ink">
      <PublicHeader />
      {children}
      <PublicFooter />
    </div>
  );
}
