import { Bell, Calendar, Clock, Map as MapIcon, Megaphone, Users } from 'lucide-react';

import type { Session, Tab } from './navigationLogic';

export function HomeTab({ session, onTabChange }: { session: Session; onTabChange: (tab: Tab) => void }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const cards = [
    ['lecturers', 'Lecturers', 'View staff and offices', <Users size={18} />, '#1e3a6e'],
    ['map', 'Map', 'Navigation and rooms', <MapIcon size={18} />, '#2a1d4d'],
    ['events', 'Events', 'Upcoming activities and seminars', <Calendar size={18} />, '#153b2a'],
  ] as const;

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="mb-4 rounded-xl border border-blue-700/30 bg-gradient-to-r from-[#091833] to-[#132a4b] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-blue-400">Welcome back</div>
            <h2 className="mt-1 text-xl font-semibold text-slate-100">{session.displayName}</h2>
            <p className="mt-1 text-xs text-slate-400">Department of Computer Science — Ground Floor Navigation</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
            <MapIcon size={28} className="text-blue-500/60" />
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([id, title, subtitle, icon, background]) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className="rounded-xl border border-slate-700 p-3 text-left transition hover:border-slate-500"
            style={{ background }}
          >
            <div className="mb-3 text-blue-300">{icon}</div>
            <div className="text-sm font-medium text-slate-100">{title}</div>
            <div className="mt-1 text-xs text-slate-400">{subtitle}</div>
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-4" />
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-4" />
      </div>
    </div>
  );
}
