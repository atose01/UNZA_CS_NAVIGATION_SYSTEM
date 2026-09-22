import { CalendarDays, MapPin, Search, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

import { filterEvents, INITIAL_EVENTS, type EventRecord, type Session } from './navigationLogic';

export function EventsTab({ session }: { session: Session }) {
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);

  const events = useMemo(() => filterEvents(search, INITIAL_EVENTS), [search]);

  const openNavigation = (event: EventRecord) => {
    if (!event.venueRoomId) {
      window.alert('Route data is not available for this event venue.');
      return;
    }

    setSelectedEvent(event);
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-100">Events</h2>
          <p className="text-xs text-slate-400">Upcoming university activities and seminars</p>
        </div>

        <div className="relative w-full md:max-w-sm">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search events, venues, or categories"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900 p-6 text-center text-sm text-slate-400">
          No upcoming events match your search.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {events.map((event) => (
            <article key={event.id} className="rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-sm shadow-slate-950/30">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-blue-300">
                  {event.category}
                </span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{event.status}</span>
              </div>

              <h3 className="text-lg font-semibold text-slate-100">{event.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{event.description}</p>

              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <div className="flex items-start gap-2">
                  <CalendarDays size={14} className="mt-0.5 text-blue-400" />
                  <span>
                    {new Date(event.startDateTime).toLocaleString('en-ZM', { dateStyle: 'medium', timeStyle: 'short' })}
                    {event.endDateTime ? ` — ${new Date(event.endDateTime).toLocaleString('en-ZM', { dateStyle: 'medium', timeStyle: 'short' })}` : ''}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="mt-0.5 text-blue-400" />
                  <span>{event.venue}{event.room ? ` • ${event.room}` : ''}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Users size={14} className="mt-0.5 text-blue-400" />
                  <span>{event.organizer}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(event)}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-500"
                >
                  View details
                </button>
                <button
                  type="button"
                  onClick={() => openNavigation(event)}
                  className="rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-200 hover:border-blue-500 hover:text-white"
                >
                  Find venue
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedEvent && (
        <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900 p-4">
          <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.2em] text-blue-400">Event details</div>
          <h3 className="text-xl font-semibold text-slate-100">{selectedEvent.title}</h3>
          <p className="mt-2 text-sm text-slate-300">{selectedEvent.description}</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300">
              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Venue</div>
              <div className="mt-1 font-medium text-slate-100">{selectedEvent.venue}</div>
              <div className="text-slate-400">{selectedEvent.building ?? 'Campus location'}</div>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300">
              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Organizer</div>
              <div className="mt-1 font-medium text-slate-100">{selectedEvent.organizer}</div>
              <div className="text-slate-400">{selectedEvent.category}</div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={selectedEvent.venueRoomId ? `#map` : undefined}
              onClick={(event) => {
                if (!selectedEvent.venueRoomId) {
                  event.preventDefault();
                  window.alert('This event venue is unavailable for map routing.');
                }
              }}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-500"
            >
              Route to venue
            </a>
            <button
              type="button"
              onClick={() => setSelectedEvent(null)}
              className="rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-200 hover:border-slate-500 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {session.role !== 'student' && (
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
          Event administration is available for authorized lecturers and developers.
        </div>
      )}
    </div>
  );
}
