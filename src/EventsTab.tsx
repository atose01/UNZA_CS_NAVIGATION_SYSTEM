import { CalendarDays, MapPin, Search, Users, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { filterEvents, validateEvent, type EventRecord, type Session } from './navigationLogic';

type EventForm = {
  title: string;
  description: string;
  category: string;
  startDateTime: string;
  endDateTime: string;
  venue: string;
  building: string;
  room: string;
  organizer: string;
  venueRoomId: string;
};

const emptyForm: EventForm = {
  title: '',
  description: '',
  category: 'Academic',
  startDateTime: '',
  endDateTime: '',
  venue: '',
  building: 'Computer Science Building',
  room: '',
  organizer: '',
  venueRoomId: '',
};

export function EventsTab({
  session,
  events,
  canManage,
  onCreate,
  onUpdate,
  onDelete,
}: {
  session: Session;
  events: EventRecord[];
  canManage: boolean;
  onCreate: (event: EventRecord) => Promise<void>;
  onUpdate: (event: EventRecord) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const visibleEvents = useMemo(() => filterEvents(search, events), [events, search]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setOpen(true);
  };

  const openEdit = (event: EventRecord) => {
    setEditingId(event.id);
    setForm({
      title: event.title,
      description: event.description,
      category: event.category,
      startDateTime: event.startDateTime.slice(0, 16),
      endDateTime: event.endDateTime?.slice(0, 16) || '',
      venue: event.venue,
      building: event.building || 'Computer Science Building',
      room: event.room || '',
      organizer: event.organizer,
      venueRoomId: event.venueRoomId || '',
    });
    setError('');
    setOpen(true);
  };

  const submitEvent = async () => {
    const candidate: EventRecord = {
      id: editingId || `event-${Date.now()}`,
      ...form,
      endDateTime: form.endDateTime || undefined,
      status: 'published',
    };
    const validation = validateEvent(candidate);
    if (!validation.isValid) {
      setError(validation.errors.join(' '));
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (editingId) await onUpdate(candidate);
      else await onCreate(candidate);
      setOpen(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save event.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-100">Events</h2>
          <p className="text-xs text-slate-400">Upcoming university activities and seminars</p>
        </div>
        <div className="flex w-full gap-2 md:w-auto">
          <div className="relative w-full md:w-72">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search events, venues, or categories" className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none" />
          </div>
          {canManage && <button type="button" onClick={openCreate} className="shrink-0 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-500">Create event</button>}
        </div>
      </div>

      {visibleEvents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900 p-6 text-center text-sm text-slate-400">No upcoming events match your search.</div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {visibleEvents.map((event) => (
            <article key={event.id} className="rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-sm shadow-slate-950/30">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-blue-300">{event.category}</span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{event.status}</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-100">{event.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{event.description}</p>
              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <div className="flex items-start gap-2"><CalendarDays size={14} className="mt-0.5 text-blue-400" /><span>{new Date(event.startDateTime).toLocaleString('en-ZM', { dateStyle: 'medium', timeStyle: 'short' })}{event.endDateTime ? ` — ${new Date(event.endDateTime).toLocaleString('en-ZM', { dateStyle: 'medium', timeStyle: 'short' })}` : ''}</span></div>
                <div className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 text-blue-400" /><span>{event.venue}{event.room ? ` • ${event.room}` : ''}</span></div>
                <div className="flex items-start gap-2"><Users size={14} className="mt-0.5 text-blue-400" /><span>{event.organizer}</span></div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => setSelectedEvent(event)} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-500">View details</button>
                <button type="button" onClick={() => event.venueRoomId ? setSelectedEvent(event) : window.alert('Route data is not available for this event venue.')} className="rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-200 hover:border-blue-500 hover:text-white">Find venue</button>
                {canManage && <><button type="button" onClick={() => openEdit(event)} className="rounded-lg border border-slate-600 px-3 py-2 text-xs text-slate-300">Edit</button><button type="button" onClick={() => void onDelete(event.id)} className="rounded-lg border border-rose-800/60 px-3 py-2 text-xs text-rose-300">Archive</button></>}
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
          <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300"><div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Venue</div><div className="mt-1 font-medium text-slate-100">{selectedEvent.venue}</div><div className="text-slate-400">{selectedEvent.building ?? 'Campus location'}</div></div><div className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300"><div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Organizer</div><div className="mt-1 font-medium text-slate-100">{selectedEvent.organizer}</div><div className="text-slate-400">{selectedEvent.category}</div></div></div>
          <div className="mt-4 flex flex-wrap gap-2"><a href={selectedEvent.venueRoomId ? '#map' : undefined} onClick={(event) => { if (!selectedEvent.venueRoomId) { event.preventDefault(); window.alert('This event venue is unavailable for map routing.'); } }} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-500">Route to venue</a><button type="button" onClick={() => setSelectedEvent(null)} className="rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-200">Close</button></div>
        </div>
      )}

      {session.role !== 'student' && <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">Event administration is available for authorized lecturers and developers.</div>}

      {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-2xl"><div className="mb-4 flex items-center justify-between"><h3 className="text-base font-semibold text-slate-100">{editingId ? 'Edit event' : 'Create event'}</h3><button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-200"><X size={16} /></button></div>{error && <div className="mb-3 rounded border border-amber-700 bg-amber-950/20 p-2 text-xs text-amber-200">{error}</div>}<div className="grid gap-3 sm:grid-cols-2"><label className="sm:col-span-2"><span className="mb-1 block text-[11px] uppercase tracking-wide text-slate-400">Title</span><input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100" /></label><label><span className="mb-1 block text-[11px] uppercase tracking-wide text-slate-400">Category</span><input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100" /></label><label><span className="mb-1 block text-[11px] uppercase tracking-wide text-slate-400">Organizer</span><input value={form.organizer} onChange={(event) => setForm((current) => ({ ...current, organizer: event.target.value }))} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100" /></label><label><span className="mb-1 block text-[11px] uppercase tracking-wide text-slate-400">Start</span><input type="datetime-local" value={form.startDateTime} onChange={(event) => setForm((current) => ({ ...current, startDateTime: event.target.value }))} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100" /></label><label><span className="mb-1 block text-[11px] uppercase tracking-wide text-slate-400">End</span><input type="datetime-local" value={form.endDateTime} onChange={(event) => setForm((current) => ({ ...current, endDateTime: event.target.value }))} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100" /></label><label><span className="mb-1 block text-[11px] uppercase tracking-wide text-slate-400">Venue</span><input value={form.venue} onChange={(event) => setForm((current) => ({ ...current, venue: event.target.value }))} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100" /></label><label><span className="mb-1 block text-[11px] uppercase tracking-wide text-slate-400">Room ID</span><input value={form.venueRoomId} onChange={(event) => setForm((current) => ({ ...current, venueRoomId: event.target.value, room: event.target.value }))} placeholder="e.g. seminar" className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100" /></label><label className="sm:col-span-2"><span className="mb-1 block text-[11px] uppercase tracking-wide text-slate-400">Description</span><textarea rows={3} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100" /></label></div><div className="mt-5 flex justify-end gap-2"><button onClick={() => setOpen(false)} className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300">Cancel</button><button onClick={() => void submitEvent()} disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-60">{saving ? 'Saving…' : 'Save'}</button></div></div></div>}
    </div>
  );
}

