import { ArrowLeft, Building2, Mail, MapPin, Phone, Save, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';

import { validateLecturerProfile, type LecturerProfile } from './navigationLogic';

type LecturerProfileManagerProps = {
  lecturer: LecturerProfile;
  onBack: () => void;
  onSave: (lecturer: LecturerProfile) => void;
  editable?: boolean;
};

export function LecturerProfileManager({ lecturer, onBack, onSave, editable = false }: LecturerProfileManagerProps) {
  const [form, setForm] = useState<LecturerProfile>(lecturer);
  const [error, setError] = useState('');

  const canEdit = editable;

  const summary = useMemo(
    () => [form.department, form.building, form.floor, form.room].filter(Boolean).join(' • '),
    [form],
  );

  const handleSave = () => {
    const validation = validateLecturerProfile(form);
    if (!validation.isValid) {
      setError(validation.errors[0]);
      return;
    }

    setError('');
    onSave(form);
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:border-slate-500"
        >
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600/20 text-xl font-semibold text-blue-200">
            {form.fullName
              .split(' ')
              .map((part) => part[0])
              .slice(0, 2)
              .join('')
              .toUpperCase() || <UserRound size={24} />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-blue-400">Profile</div>
            <h2 className="mt-1 text-2xl font-bold text-slate-100">{form.fullName}</h2>
            <div className="mt-1 text-sm text-blue-300">{form.academicTitle}</div>
            <div className="mt-2 text-xs text-slate-400">{summary}</div>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-amber-700/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">{error}</div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.15em] text-slate-400">
            Full name
            <input
              value={form.fullName}
              onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
              disabled={!canEdit}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.15em] text-slate-400">
            Academic title
            <input
              value={form.academicTitle}
              onChange={(event) => setForm((current) => ({ ...current, academicTitle: event.target.value }))}
              disabled={!canEdit}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.15em] text-slate-400">
            Department
            <input
              value={form.department}
              onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))}
              disabled={!canEdit}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.15em] text-slate-400">
            Email
            <input
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              disabled={!canEdit}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.15em] text-slate-400">
            Phone
            <input
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              disabled={!canEdit}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.15em] text-slate-400">
            Building
            <input
              value={form.building}
              onChange={(event) => setForm((current) => ({ ...current, building: event.target.value }))}
              disabled={!canEdit}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.15em] text-slate-400">
            Floor
            <input
              value={form.floor}
              onChange={(event) => setForm((current) => ({ ...current, floor: event.target.value }))}
              disabled={!canEdit}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.15em] text-slate-400">
            Room
            <input
              value={form.room}
              onChange={(event) => setForm((current) => ({ ...current, room: event.target.value }))}
              disabled={!canEdit}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300">
            <div className="flex items-center gap-2 text-slate-400"><Mail size={12} /> Email</div>
            <div className="mt-2 break-all">{form.email}</div>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300">
            <div className="flex items-center gap-2 text-slate-400"><Phone size={12} /> Phone</div>
            <div className="mt-2 break-all">{form.phone || 'No phone provided'}</div>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300">
            <div className="flex items-center gap-2 text-slate-400"><Building2 size={12} /> Office</div>
            <div className="mt-2 break-all">{form.building} • {form.room}</div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!canEdit}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={14} /> Save changes
          </button>
          <a href={`mailto:${form.email}`} className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-200 hover:border-blue-500 hover:text-white">
            <Mail size={14} /> Email lecturer
          </a>
          <a href={`tel:${form.phone.replace(/\s+/g, '')}`} className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-200 hover:border-blue-500 hover:text-white">
            <Phone size={14} /> Call lecturer
          </a>
          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-200">
            <MapPin size={14} /> {form.building} • {form.room}
          </div>
        </div>
      </div>
    </div>
  );
}
