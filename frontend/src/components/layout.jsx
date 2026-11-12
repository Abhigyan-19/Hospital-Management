import {
  Bell,
  BadgeCheck,
  BedDouble,
  CalendarDays,
  ChevronDown,
  Clock3,
  ClipboardList,
  ClipboardCheck,
  FileText,
  FlaskConical,
  LayoutDashboard,
  KeyRound,
  HeartPulse,
  Menu,
  ReceiptText,
  Search,
  Settings,
  Stethoscope,
  Users,
  UserCog,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../api/notificationService';
import { apiErrorMessage } from '../api/errorMessage';
import { isDemoMode } from '../api/demoAuth';
import Logo from './Logo';
import { Button } from './ui';

const links = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN'] },
  { label: 'Doctor approval queue', to: '/admin/doctor-approvals', icon: BadgeCheck, roles: ['ADMIN'] },
  { label: 'Users & roles', to: '/admin/users', icon: UserCog, roles: ['ADMIN'] },
  { label: 'Audit log', to: '/admin/audit-log', icon: ClipboardCheck, roles: ['ADMIN'] },
  { label: 'My dashboard', to: '/patient', icon: LayoutDashboard, roles: ['PATIENT'] },
  { label: 'My dashboard', to: '/doctor', icon: LayoutDashboard, roles: ['DOCTOR'] },
  { label: 'My schedule', to: '/doctor/schedule', icon: CalendarDays, roles: ['DOCTOR'] },
  { label: 'My patients', to: '/doctor/patients', icon: Users, roles: ['DOCTOR'] },
  { label: 'Availability', to: '/doctor/availability', icon: Clock3, roles: ['DOCTOR'] },
  { label: 'My profile', to: '/doctor/profile', icon: Stethoscope, roles: ['DOCTOR'] },
  { label: 'Walk-ins & queue', to: '/reception/appointments', icon: CalendarDays, roles: ['RECEPTIONIST'] },
  { label: 'Ward & bed view', to: '/reception/wards', icon: BedDouble, roles: ['RECEPTIONIST'] },
  { label: 'Billing & receipts', to: '/reception/billing', icon: ReceiptText, roles: ['RECEPTIONIST'] },
  { label: 'Patients', to: '/patients', icon: Users, roles: ['ADMIN'] },
  { label: 'Doctors & Staff', to: '/doctors', icon: Stethoscope, roles: ['ADMIN'] },
  { label: 'Appointments', to: '/appointments', icon: CalendarDays, roles: ['ADMIN'] },
  { label: 'My appointments', to: '/my-appointments', icon: CalendarDays, roles: ['PATIENT'] },
  { label: 'Health summary', to: '/patient/records', icon: ClipboardList, roles: ['PATIENT'] },
  { label: 'Lab reports', to: '/patient/labs', icon: FlaskConical, roles: ['PATIENT'] },
  { label: 'Bills & payments', to: '/patient/billing', icon: ReceiptText, roles: ['PATIENT'] },
  { label: 'My health profile', to: '/patient/profile', icon: HeartPulse, roles: ['PATIENT'] },
  { label: 'Departments', to: '/departments', icon: ClipboardList, roles: ['ADMIN'] },
  { label: 'Prescriptions', to: '/prescriptions', icon: FileText, roles: ['ADMIN', 'DOCTOR', 'PATIENT'] },
  { label: 'Reports & Analytics', to: '/reports', icon: ClipboardList, roles: ['ADMIN'] },
  { label: 'Billing & Invoices', to: '/billing', icon: ReceiptText, roles: ['ADMIN'] },
  { label: 'Beds & Wards', to: '/beds', icon: BedDouble, roles: ['ADMIN'] },
  { label: 'Lab Tests', to: '/labs', icon: FlaskConical, roles: ['ADMIN'] },
  { label: 'Urgent help', to: '/urgent-help', icon: Bell, roles: ['PATIENT'] },
  { label: 'Hospital settings', to: '/settings', icon: Settings, roles: ['ADMIN'] },
];

export function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const visibleLinks = links.filter(({ roles }) => roles.includes(user?.role));

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-navy-100 bg-white px-5 py-6 transition-transform lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between">
        <Link to={user?.role === 'PATIENT' ? '/patient/dashboard' : user?.role === 'DOCTOR' ? '/doctor/schedule' : user?.role === 'RECEPTIONIST' ? '/reception/appointments' : '/dashboard'} onClick={onClose}><Logo /></Link>
        <button className="rounded-lg p-2 text-navy-700 hover:bg-navy-50 lg:hidden" onClick={onClose} aria-label="Close navigation"><X size={23} /></button>
      </div>
      <div className="mt-10">
        <p className="mb-3 px-3 text-xs font-extrabold uppercase tracking-widest text-navy-500">Workspace</p>
        <nav className="space-y-1" aria-label="Application navigation">
          {visibleLinks.map(({ label, to, icon: Icon }) => (
            <NavLink key={`${to}-${label}`} to={to} end={['/patient', '/doctor', '/dashboard'].includes(to)} onClick={onClose} className={({ isActive }) => `flex min-h-12 items-center gap-3 rounded-xl px-3 font-bold transition-colors ${isActive ? 'bg-teal-50 text-teal-700' : 'text-navy-700 hover:bg-navy-50'}`}>
              <Icon size={21} aria-hidden="true" focusable="false" />{label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="mt-auto hidden rounded-xl bg-navy-50 p-4 lg:block">
        <p className="font-extrabold text-navy-900">Need assistance?</p>
        <p className="mt-1 text-sm text-navy-700">Contact the support desk for help with SEBASETHU.</p>
      </div>
    </aside>
  );
}

function homePath(role) {
  if (role === 'PATIENT') return '/patient/dashboard';
  if (role === 'DOCTOR') return '/doctor/schedule';
  if (role === 'RECEPTIONIST') return '/reception/appointments';
  if (role === 'ADMIN') return '/dashboard';
  return '/';
}

function PageSearch({ user, query, setQuery, onNavigate, id }) {
  const availablePages = links.filter((link) => link.roles.includes(user?.role));
  const results = useMemo(() => query.trim()
    ? availablePages.filter((link) => link.label.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 6)
    : [], [availablePages, query]);

  return (
    <div className="relative w-full">
      <label className="sr-only" htmlFor={id}>Search workspace pages</label>
      <input id={id} type="search" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === 'Escape' && setQuery('')} placeholder="Search workspace pages" aria-controls={`${id}-results`} aria-expanded={Boolean(query.trim())} className="min-h-11 w-full rounded-lg border border-navy-100 bg-white px-4 text-ink outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
      {query.trim() && <div id={`${id}-results`} role="region" aria-label="Search results" className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-navy-100 bg-white p-2 shadow-soft">
        {results.length ? <ul>{results.map((result) => <li key={`${result.to}-${result.label}`}><Link to={result.to} onClick={onNavigate} className="flex min-h-11 items-center rounded-lg px-3 font-bold text-navy-700 hover:bg-teal-50 hover:text-teal-700">{result.label}</Link></li>)}</ul> : <p className="p-3 text-sm text-navy-700">No workspace pages match that search.</p>}
      </div>}
    </div>
  );
}

export function Topbar({ onMenu }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');
  const current = links
    .filter((link) => link.roles.includes(user?.role) && location.pathname.startsWith(link.to))
    .sort((a, b) => b.to.length - a.to.length)[0]?.label || 'Workspace';
  const greetingName = (user?.name || 'there').replace(/^(Dr\.|Doctor)\s+/i, '').split(' ')[0];
  const initials = (user?.name || 'User').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const workspaceHome = homePath(user?.role);

  const loadNotifications = () => {
    setNotificationsLoading(true);
    setNotificationsError('');
    notificationService.listMine()
      .then(setNotifications)
      .catch((error) => {
        const message = isDemoMode()
          ? error.message || 'Notifications could not be loaded.'
          : apiErrorMessage(error, 'Backend not connected. Notifications are unavailable.');
        setNotificationsError(message);
      })
      .finally(() => setNotificationsLoading(false));
  };

  useEffect(() => {
    if (notificationsOpen) loadNotifications();
  }, [notificationsOpen, user?.id]);

  const closeSearch = () => {
    setQuery('');
    setMobileSearchOpen(false);
  };

  return (
    <header className="border-b border-navy-100 bg-white px-4 py-4 sm:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button className="rounded-lg p-2 text-navy-700 hover:bg-navy-50 lg:hidden" onClick={onMenu} aria-label="Open navigation"><Menu size={24} aria-hidden="true" /></button>
          <div className="min-w-0"><nav aria-label="Breadcrumb"><ol className="flex items-center gap-2 text-sm font-semibold text-navy-500"><li><Link to={workspaceHome} className="rounded text-teal-700 hover:underline">Workspace</Link></li><li aria-hidden="true">/</li><li aria-current="page" className="truncate">{current}</li></ol></nav><h1 className="truncate text-xl font-extrabold text-ink sm:text-2xl">Hello, {greetingName}</h1></div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <div className="hidden w-56 lg:block xl:w-72"><PageSearch user={user} query={query} setQuery={setQuery} onNavigate={closeSearch} id="workspace-search-desktop" /></div>
          <button className="grid h-11 w-11 place-items-center rounded-lg text-navy-700 hover:bg-navy-50 lg:hidden" onClick={() => setMobileSearchOpen((open) => !open)} aria-label={mobileSearchOpen ? 'Close global search' : 'Open global search'} aria-expanded={mobileSearchOpen}><Search size={21} aria-hidden="true" /></button>
          <div className="relative">
            <button className="relative grid h-11 w-11 place-items-center rounded-lg text-navy-700 hover:bg-navy-50" onClick={() => setNotificationsOpen((open) => !open)} aria-label={`Notifications${notifications.length ? `, ${notifications.length} items` : ''}`} aria-expanded={notificationsOpen} aria-controls="notification-panel"><Bell size={21} aria-hidden="true" />{notifications.length > 0 && <span className="absolute right-1 top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-teal-700 px-1 text-xs font-black text-white" aria-hidden="true">{notifications.length > 9 ? '9+' : notifications.length}</span>}</button>
            {notificationsOpen && <section id="notification-panel" role="region" aria-label="Notifications" className="absolute right-0 top-full z-50 mt-2 w-[min(90vw,24rem)] rounded-2xl border border-navy-100 bg-white p-4 shadow-soft">
              <div className="flex items-center justify-between"><h2 className="text-lg font-extrabold">Notifications</h2><button className="min-h-11 rounded-lg px-3 font-bold text-teal-700 hover:bg-teal-50" onClick={() => setNotificationsOpen(false)}>Close</button></div>
              {notificationsLoading ? <p className="py-5 text-navy-700" aria-live="polite">Loading notifications…</p> : notificationsError ? <div role="alert" className="mt-3 rounded-xl bg-red-50 p-3"><p className="text-sm font-bold text-danger">{notificationsError}</p><Button variant="secondary" className="mt-3" onClick={loadNotifications}>Try again</Button></div> : !notifications.length ? <p className="py-5 text-navy-700">You&apos;re all caught up. There are no new notifications.</p> : <ul className="mt-3 max-h-[60vh] space-y-2 overflow-y-auto">{notifications.map((item) => <li key={item.id}><Link to={item.href} onClick={() => setNotificationsOpen(false)} className="block rounded-xl border border-navy-100 p-3 hover:bg-teal-50"><p className="font-extrabold">{item.title}</p><p className="mt-1 text-sm leading-6 text-navy-700">{item.message}</p>{item.createdAt && <p className="mt-2 text-xs font-bold text-navy-500">{new Date(item.createdAt).toLocaleString()}</p>}</Link></li>)}</ul>}
            </section>}
          </div>
          <div className="hidden h-9 w-px bg-navy-100 sm:block" />
          <div className="group relative">
            <button className="flex min-h-11 items-center gap-2 rounded-lg p-1 text-left hover:bg-navy-50" aria-label={`Account menu for ${user?.name || 'User'}`} aria-haspopup="true">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-teal-100 font-extrabold text-teal-700">{initials}</span>
              <span className="hidden sm:block"><strong className="block text-sm">{user?.name || 'User'}</strong><small className="block text-xs font-bold text-navy-500">{user?.role || 'ACCOUNT'}</small></span>
              <ChevronDown size={17} className="hidden text-navy-500 sm:block" aria-hidden="true" />
            </button>
            <div className="invisible absolute right-0 top-12 z-20 w-52 rounded-xl border border-navy-100 bg-white p-2 opacity-0 shadow-soft transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              <Link to="/account/security" className="flex min-h-11 items-center gap-2 rounded-lg px-3 font-bold text-navy-700 hover:bg-navy-50"><KeyRound size={17} aria-hidden="true" />Account security</Link>
              {user?.role === 'ADMIN' && <Link to="/settings" className="flex min-h-11 items-center gap-2 rounded-lg px-3 font-bold text-navy-700 hover:bg-navy-50"><Settings size={17} aria-hidden="true" />Hospital settings</Link>}
              <Button variant="ghost" className="w-full justify-start px-3" onClick={logout}>Sign out</Button>
            </div>
          </div>
        </div>
      </div>
      {mobileSearchOpen && <div className="mt-4 lg:hidden"><PageSearch user={user} query={query} setQuery={setQuery} onNavigate={closeSearch} id="workspace-search-mobile" /></div>}
    </header>
  );
}

export function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-navy-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-w-0 flex-1"><Topbar onMenu={() => setSidebarOpen(true)} /><main className="surface-pattern min-h-[calc(100vh-81px)] p-4 sm:p-8">{children}</main></div>
      {sidebarOpen && <button className="fixed inset-0 z-30 bg-ink/30 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close navigation overlay" />}
    </div>
  );
}
