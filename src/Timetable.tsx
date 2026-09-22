import { useMemo, useState } from 'react';
import { X } from 'lucide-react';

import { formatDate, ROOM_OPTIONS, validateTimetableEntry, hasTimetableConflict, type Session, type TimetableEntry } from './navigationLogic';

export function TimetableTab({
  session,
  entries,
  canManage,
  onAdd,
  onUpdate,
  onDelete,
}: {
  session: Session;
  entries: TimetableEntry[];
  canManage: boolean;
  onAdd: (entry: TimetableEntry) => Promise<void> | void;
  onUpdate: (entry: TimetableEntry) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
}) {
  const [selectedDate, setSelectedDate] = useState(entries[0]?.date || '2026-09-21');
  const [mode, setMode] = useState<'daily' | 'weekly' | 'upcoming'>('weekly');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    id: '',
    courseCode: 'CS2201',
    courseName: 'Database Systems',
    classTitle: 'Lecture',
    lecturer: 'Mr A. Theu',
    venue: 'Computer Lab 1',
    roomId: 'Computer Lab 1',
    date: '2026-09-21',
    startTime: '09:00',
    endTime: '10:30',
    description: '',
    recurrence: 'Weekly',
    syncToGoogleCalendar: false,
  });

  const visibleEntries = useMemo(() => {
    if (mode === 'daily') {
      return entries.filter((entry) => entry.date === selectedDate);
    }
    if (mode === 'upcoming') {
      return [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    return entries.filter((entry) => entry.date === selectedDate).slice(0, 5);
  }, [entries, mode, selectedDate]);

  const uniqueDates = useMemo(() => [...new Set(entries.map((entry) => entry.date))].sort(), [entries]);

  const submitEntry = async () => {
    const candidate: TimetableEntry = {
      id: editingId || `entry-${Date.now()}`,
      courseCode: form.courseCode.trim(),
      courseName: form.courseName.trim(),
      classTitle: form.classTitle.trim(),
      lecturer: form.lecturer.trim(),
      venue: form.venue.trim(),
      roomId: form.roomId.trim(),
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      description: form.description.trim(),
      recurrence: form.recurrence.trim(),
      syncToGoogleCalendar: form.syncToGoogleCalendar,
    };

    const validation = validateTimetableEntry(candidate);
    if (!validation.isValid) {
      setError(validation.errors.join(' '));
      return;
    }

    if (hasTimetableConflict(candidate, entries.filter((item) => item.id !== candidate.id))) {
      setError('A room booking conflict was detected for this time and venue.');
      return;
    }

    try {
      if (editingId) await onUpdate(candidate);
      else await onAdd(candidate);

      setSelectedDate(candidate.date);
      setError('');
      setOpen(false);
      setEditingId(null);
      setForm({
        id: '',
        courseCode: 'CS2201',
        courseName: 'Database Systems',
        classTitle: 'Lecture',
        lecturer: 'Mr A. Theu',
        venue: 'Computer Lab 1',
        roomId: 'Computer Lab 1',
        date: candidate.date,
        startTime: '09:00',
        endTime: '10:30',
        description: '',
        recurrence: 'Weekly',
        syncToGoogleCalendar: false,
      });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save timetable entry.');
    }
  };

  return (
    <div className="relative h-full overflow-y-auto p-3 pb-24 sm:p-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-100">Timetable</h2>
          <p className="text-xs text-slate-500">Academic schedule and room bookings</p>
        </div>
        {canManage && (
          <button
            onClick={() => setOpen(true)}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl font-light text-white shadow-lg transition hover:scale-105"
            style={{ background: '#f59e0b' }}
            aria-label="Create timetable entry"
          >
            +
          </button>
        )}
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {(['daily', 'weekly', 'upcoming'] as const).map((option) => (
          <button
            key={option}
            onClick={() => setMode(option)}
            className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium ${
              mode === option
                ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                : 'border-slate-700 bg-slate-900 text-slate-400'
            }`}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {uniqueDates.map((date) => (
          <button
            key={date}
            onClick={() => setSelectedDate(date)}
            className={`rounded-lg border px-2.5 py-1.5 text-[11px] ${
              selectedDate === date ? 'border-blue-500 bg-blue-900/20 text-blue-300' : 'border-slate-700 bg-slate-900 text-slate-400'
            }`}
          >
            {formatDate(date)}
          </button>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-slate-700 bg-slate-900 sm:block">
        <div className="grid grid-cols-12 border-b border-slate-800 px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-500">
          <span className="col-span-3">Time</span>
          <span className="col-span-4">Course</span>
          <span className="col-span-2">Room</span>
          <span className="col-span-2">Lecturer</span>
          <span className="col-span-1 text-right">Action</span>
        </div>

        {visibleEntries.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-slate-500">No timetable entries available.</div>
        ) : (
          visibleEntries.map((entry) => (
            <div key={entry.id} className="grid grid-cols-12 items-start border-b border-slate-800 px-4 py-3 last:border-0 hover:bg-slate-800/30">
              <div className="col-span-3 min-w-0 text-[11px] font-mono text-blue-400">
                {entry.startTime}–{entry.endTime}
              </div>
              <div className="col-span-4 min-w-0">
                <div className="text-xs font-medium text-slate-100 break-words">{entry.courseCode} — {entry.courseName}</div>
                <div className="text-[10px] text-slate-500">{entry.classTitle}</div>
              </div>
              <div className="col-span-2 min-w-0 text-[11px] text-slate-400 break-words">{entry.venue}</div>
              <div className="col-span-2 min-w-0 text-[11px] text-slate-400 break-words">{entry.lecturer}</div>
              <div className="col-span-1 flex min-w-0 justify-end gap-2 text-[10px]">
                {canManage && (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(entry.id);
                        setForm({
                          id: entry.id,
                          courseCode: entry.courseCode,
                          courseName: entry.courseName,
                          classTitle: entry.classTitle,
                          lecturer: entry.lecturer,
                          venue: entry.venue,
                          roomId: entry.roomId,
                          date: entry.date,
                          startTime: entry.startTime,
                          endTime: entry.endTime,
                          description: entry.description,
                          recurrence: entry.recurrence,
                          syncToGoogleCalendar: !!entry.syncToGoogleCalendar,
                        });
                        setOpen(true);
                      }}
                      className="text-slate-300"
                    >
                      Edit
                    </button>
                    <button onClick={() => void onDelete(entry.id)} className="text-rose-300">
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="space-y-3 sm:hidden">
        {visibleEntries.length === 0 ? (
          <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-6 text-center text-sm text-slate-500">
            No timetable entries available.
          </div>
        ) : (
          visibleEntries.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-slate-700 bg-slate-900 p-3">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-100 break-words">{entry.courseCode} — {entry.courseName}</div>
                  <div className="text-[11px] text-slate-500">{entry.classTitle}</div>
                </div>
                <span className="shrink-0 rounded border border-blue-700/40 bg-blue-900/20 px-1.5 py-0.5 text-[10px] font-mono text-blue-300">
                  {entry.startTime}–{entry.endTime}
                </span>
              </div>

              <div className="space-y-1 text-[11px] text-slate-300">
                <div><span className="text-slate-500">Venue:</span> {entry.venue}</div>
                <div><span className="text-slate-500">Lecturer:</span> {entry.lecturer}</div>
              </div>

              {canManage && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setEditingId(entry.id);
                      setForm({
                        id: entry.id,
                        courseCode: entry.courseCode,
                        courseName: entry.courseName,
                        classTitle: entry.classTitle,
                        lecturer: entry.lecturer,
                        venue: entry.venue,
                        roomId: entry.roomId,
                        date: entry.date,
                        startTime: entry.startTime,
                        endTime: entry.endTime,
                        description: entry.description,
                        recurrence: entry.recurrence,
                        syncToGoogleCalendar: !!entry.syncToGoogleCalendar,
                      });
                      setOpen(true);
                    }}
                    className="rounded border border-slate-600 px-2 py-1 text-[10px] text-slate-200"
                  >
                    Edit
                  </button>
                  <button onClick={() => void onDelete(entry.id)} className="rounded border border-rose-900/60 px-2 py-1 text-[10px] text-rose-300">
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-100">
                {editingId ? 'Edit timetable entry' : 'Create timetable entry'}
              </h3>
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-200">
                <X size={16} />
              </button>
            </div>

            {error && <div className="mb-3 rounded border border-amber-700 bg-amber-950/20 p-2 text-xs text-amber-200">{error}</div>}

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-slate-400">Course code</label>
                <input
                  value={form.courseCode}
                  onChange={(event) => setForm((current) => ({ ...current, courseCode: event.target.value }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-slate-400">Course name</label>
                <input
                  value={form.courseName}
                  onChange={(event) => setForm((current) => ({ ...current, courseName: event.target.value }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-slate-400">Class title</label>
                <input
                  value={form.classTitle}
                  onChange={(event) => setForm((current) => ({ ...current, classTitle: event.target.value }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-slate-400">Lecturer</label>
                <input
                  value={form.lecturer}
                  onChange={(event) => setForm((current) => ({ ...current, lecturer: event.target.value }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-slate-400">Venue</label>
                <select
                  value={form.venue}
                  onChange={(event) => setForm((current) => ({ ...current, venue: event.target.value, roomId: event.target.value }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none"
                >
                  {ROOM_OPTIONS.map((room) => (
                    <option key={room} value={room}>{room}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-slate-400">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-slate-400">Start time</label>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-slate-400">End time</label>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(event) => setForm((current) => ({ ...current, endTime: event.target.value }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-slate-400">Description</label>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={form.syncToGoogleCalendar}
                  onChange={(event) => setForm((current) => ({ ...current, syncToGoogleCalendar: event.target.checked }))}
                />
                Add to Google Calendar when configured
              </label>
              <div className="flex gap-2">
                <button onClick={() => setOpen(false)} className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300">
                  Cancel
                </button>
                <button onClick={() => void submitEntry()} className="rounded-lg px-4 py-2 text-white" style={{ background: '#f59e0b' }}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
