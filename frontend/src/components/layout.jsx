import { Bell, CalendarDays, ChevronDown, ClipboardList, FileText, LayoutDashboard, Menu, Settings, Stethoscope, Users, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import { Button } from './ui';

const links = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Patients', to: '/patients', icon: Users },
  { label: 'Doctors & Staff', to: '/doctors', icon: Stethoscope },
  { label: 'Appointments', to: '/appointments', icon: CalendarDays },
  { label: 'Departments', to: '/departments', icon: ClipboardList },
  { label: 'Prescriptions', to: '/prescriptions', icon: FileText },
  { label: 'Reports & Analytics', to: '/reports', icon: ClipboardList },
];

export function Sidebar({ open, onClose }) {
  return <aside className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-navy-100 bg-white px-5 py-6 transition-transform lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
    <div className="flex items-center justify-between"><Link to="/dashboard" onClick={onClose}><Logo /></Link><button className="rounded-lg p-2 text-navy-700 hover:bg-navy-50 lg:hidden" onClick={onClose} aria-label="Close navigation"><X size={23} /></button></div>
    <div className="mt-10"><p className="mb-3 px-3 text-xs font-extrabold uppercase tracking-widest text-navy-500">Workspace</p><nav className="space-y-1" aria-label="Application navigation">{links.map(({ label, to, icon: Icon }) => <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => `flex min-h-12 items-center gap-3 rounded-xl px-3 font-bold transition-colors ${isActive ? 'bg-teal-50 text-teal-700' : 'text-navy-700 hover:bg-navy-50'}`}><Icon size={21} />{label}</NavLink>)}</nav></div>
    <div className="mt-auto hidden rounded-xl bg-navy-50 p-4 lg:block"><p className="font-extrabold text-navy-900">Need assistance?</p><p className="mt-1 text-sm text-navy-700">Contact the support desk for help with SEBASETHU.</p><button className="mt-3 font-extrabold text-teal-700">Open support</button></div>
  </aside>;
}

export function Topbar({ onMenu }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const current = links.find((link) => location.pathname.startsWith(link.to))?.label || 'Dashboard';
  return <header className="border-b border-navy-100 bg-white px-4 py-4 sm:px-8"><div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><button className="rounded-lg p-2 text-navy-700 hover:bg-navy-50 lg:hidden" onClick={onMenu} aria-label="Open navigation"><Menu size={24} /></button><div><p className="text-sm font-semibold text-navy-500">Workspace / {current}</p><h1 className="text-xl font-extrabold text-ink sm:text-2xl">Good morning, {user?.name?.split(' ')[0] || 'there'}</h1></div></div><div className="flex items-center gap-2 sm:gap-4"><button className="relative rounded-lg p-3 text-navy-700 hover:bg-navy-50" aria-label="View notifications"><Bell size={21} /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" /></button><div className="hidden h-9 w-px bg-navy-100 sm:block" /><div className="group relative"><button className="flex items-center gap-2 rounded-lg p-1 text-left hover:bg-navy-50"><span className="grid h-10 w-10 place-items-center rounded-full bg-teal-100 font-extrabold text-teal-700">AM</span><span className="hidden sm:block"><strong className="block text-sm">{user?.name || 'Guest user'}</strong><small className="block text-xs font-bold text-navy-500">{user?.role || 'STAFF'}</small></span><ChevronDown size={17} className="hidden text-navy-500 sm:block" /></button><div className="invisible absolute right-0 top-12 z-20 w-44 rounded-xl border border-navy-100 bg-white p-2 opacity-0 shadow-soft transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"><Link to="/settings" className="flex min-h-10 items-center gap-2 rounded-lg px-3 font-bold text-navy-700 hover:bg-navy-50"><Settings size={17} />Profile settings</Link><Button variant="ghost" className="w-full justify-start px-3" onClick={logout}>Sign out</Button></div></div></div></div></header>;
}

export function AppLayout({ children }) { const [sidebarOpen, setSidebarOpen] = useState(false); return <div className="flex min-h-screen bg-navy-50"><Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /><div className="min-w-0 flex-1"><Topbar onMenu={() => setSidebarOpen(true)} /><main className="surface-pattern min-h-[calc(100vh-81px)] p-4 sm:p-8">{children}</main></div>{sidebarOpen && <button className="fixed inset-0 z-30 bg-ink/30 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close navigation overlay" />}</div>; }
