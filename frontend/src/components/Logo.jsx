import { HeartPulse } from 'lucide-react';

export default function Logo({ compact = false }) {
  return <div className="flex items-center gap-3" aria-label="SEBASETHU home">
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-600 text-white shadow-md"><HeartPulse size={25} strokeWidth={2.2} /></span>
    {!compact && <span><strong className="block text-lg font-extrabold leading-none tracking-wide text-ink">SEBASETHU</strong><small className="mt-1 block text-xs font-bold tracking-wide text-teal-700">Bridging care and technology.</small></span>}
  </div>;
}
