import { useState } from 'react';
import { X } from 'lucide-react';

import { formatDate, type Announcement, type Session } from './navigationLogic';

export function AnnouncementsTab({
  session,
  announcements,
  canManage,
  onPublish,
  onDelete,
  onUpdate,
}: {
  session: Session;
  announcements: Announcement[];
  canManage: boolean;
  onPublish: (entry: Announcement) => void;
  onDelete: (id: string) => void;
  onUpdate: (entry: Announcement) => void;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    body: '',
    isUrgent: false,
    expiresAt: '',
    course: '',
    venue: '',
    status: 'published' as const,
  });

  const submitAnnouncement = () => {
    if (!form.title.trim() || !form.body.trim()) {
      setError('Title and message are required.');
      return;
    }

    const next: Announcement = {
      id: `announcement-${Date.now()}`,
      title: form.title.trim(),
      body: form.body.trim(),
      author: session.displayName,
      date: new Date().toISOString(),
      expiresAt: form.expiresAt || undefined,
      isUrgent: form.isUrgent,
      status: form.status,
      course: form.course || undefined,
      venue: form.venue || undefined,
      type: form.isUrgent ? 'urgent' : 'info',
    };

    onPublish(next);
    setForm({
      title: '',
      body: '',
      isUrgent: false,
      expiresAt: '',
      course: '',
      venue: '',
      status: 'published',
    });
    setError('');
    setOpen(false);
  };

  return (
    <div className="relative h-full overflow-y-auto p-4 pb-24">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-100">Announcements</h2>
          <p className="text-xs text-slate-500">Latest notices from the CS Department</p>
        </div>
        {canManage && (
          <button
            onClick={() => setOpen(true)}
            className="flex h-12 w-12 items-center justify-center rounded-full text-2xl font-light text-white shadow-lg transition hover:scale-105"
            style={{ background: '#22c55e' }}
            aria-label="Create announcement"
          >
            +
          </button>
        )}
      </div>

      <div className="space-y-3">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="rounded-xl border border-slate-700 bg-slate-900 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span
                className="rounded border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider"
                style={{
                  background: announcement.isUrgent ? '#2a0808' : '#0a1a3e',
                  color: announcement.isUrgent ? '#fca5a5' : '#93c5fd',
                  borderColor: announcement.isUrgent ? '#7f1d1d' : '#1e3a6e',
                }}
              >
                {announcement.isUrgent ? 'urgent' : announcement.type || 'info'}
              </span>
              <span className="text-[11px] text-slate-500">{formatDate(announcement.date)}</span>
            </div>

            <h3 className="text-sm font-medium text-slate-100">{announcement.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">{announcement.body}</p>
            {announcement.course && <div className="mt-2 text-[10px] text-blue-300">Course: {announcement.course}</div>}
            {announcement.venue && <div className="text-[10px] text-slate-400">Venue: {announcement.venue}</div>}

            {canManage && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() =>
                    onUpdate({
                      ...announcement,
                      isUrgent: !announcement.isUrgent,
                      type: announcement.isUrgent ? 'info' : 'urgent',
                    })
                  }
                  className="rounded border border-slate-700 px-2 py-1 text-[10px] text-slate-200"
                >
                  {announcement.isUrgent ? 'Mark normal' : 'Mark urgent'}
                </button>
                <button
                  onClick={() => onDelete(announcement.id)}
                  className="rounded border border-rose-800/50 px-2 py-1 text-[10px] text-rose-300"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-100">Publish announcement</h3>
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-200">
                <X size={16} />
              </button>
            </div>

            {error && <div className="mb-3 rounded border border-amber-700 bg-amber-950/20 p-2 text-xs text-amber-200">{error}</div>}

            <div className="space-y-3 text-sm">
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-slate-400">Title</label>
                <input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wide text-slate-400">Message</label>
                <textarea
                  value={form.body}
                  onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
                  rows={4}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] uppercase tracking-wide text-slate-400">Course</label>
                  <input
                    value={form.course}
                    onChange={(event) => setForm((current) => ({ ...current, course: event.target.value }))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] uppercase tracking-wide text-slate-400">Venue</label>
                  <input
                    value={form.venue}
                    onChange={(event) => setForm((current) => ({ ...current, venue: event.target.value }))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] uppercase tracking-wide text-slate-400">Expires</label>
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={(event) => setForm((current) => ({ ...current, expiresAt: event.target.value }))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none"
                  />
                </div>
                <label className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200">
                  <input
                    type="checkbox"
                    checked={form.isUrgent}
                    onChange={(event) => setForm((current) => ({ ...current, isUrgent: event.target.checked }))}
                  />
                  Mark urgent
                </label>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300">
                Cancel
              </button>
              <button onClick={submitAnnouncement} className="rounded-lg px-4 py-2 text-white" style={{ background: '#22c55e' }}>
                Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
