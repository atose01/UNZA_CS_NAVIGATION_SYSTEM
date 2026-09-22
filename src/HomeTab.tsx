import { Bell, Calendar, Map as MapIcon, Megaphone, Users } from 'lucide-react';

import type { Announcement, EventRecord, Session, Tab, TimetableEntry } from './navigationLogic';
import type { DashboardSummary } from './services/appData';

export function HomeTab({
  session,
  onTabChange,
  summary,
  announcements,
  events,
  timetable,
}: {
  session: Session;
  onTabChange: (tab: Tab) => void;
  summary: DashboardSummary | null;
  announcements: Announcement[];
  events: EventRecord[];
  timetable: TimetableEntry[];
}) {
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
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-200"><Bell size={15} className="text-blue-400" /> Department overview</div>
          {summary ? (
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
              <div className="rounded-lg bg-slate-950 p-2">Lecturers <span className="float-right text-slate-100">{summary.totalLecturers}</span></div>
              <div className="rounded-lg bg-slate-950 p-2">Rooms <span className="float-right text-slate-100">{summary.totalRooms}</span></div>
              <div className="rounded-lg bg-slate-950 p-2">Upcoming events <span className="float-right text-slate-100">{summary.upcomingEvents}</span></div>
              <div className="rounded-lg bg-slate-950 p-2">Upcoming classes <span className="float-right text-slate-100">{summary.upcomingClasses}</span></div>
            </div>
          ) : <div className="text-xs text-slate-500">Loading department information…</div>}
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-200"><Megaphone size={15} className="text-emerald-400" /> Latest updates</div>
          {announcements.length > 0 ? (
            <div className="space-y-2">
              {announcements.slice(0, 2).map((announcement) => <div key={announcement.id} className="block w-full rounded-lg bg-slate-950 p-2 text-left text-xs text-slate-300"><span className="font-medium text-slate-100">{announcement.title}</span><span className="mt-1 block line-clamp-1 text-slate-500">{announcement.body}</span></div>)}
            </div>
          ) : events.length > 0 || timetable.length > 0 ? <div className="text-xs text-slate-500">No recent announcements.</div> : <div className="text-xs text-slate-500">Loading department updates…</div>}
        </div>
      </div>
    </div>
  );
}
