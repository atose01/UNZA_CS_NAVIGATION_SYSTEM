import { Mail, MapPin, Phone, Search, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';

import { filterLecturers, type LecturerProfile } from './navigationLogic';

type LecturerDirectoryProps = {
  lecturers?: LecturerProfile[];
  canManage?: boolean;
  onCreateLecturer?: () => void;
  onSelectLecturer: (lecturer: LecturerProfile) => void;
  onNavigateToOffice: (lecturer: LecturerProfile) => void;
};

export function LecturerDirectory({ lecturers = [], canManage = false, onCreateLecturer, onSelectLecturer, onNavigateToOffice }: LecturerDirectoryProps) {
  const [query, setQuery] = useState('');

  const filteredLecturers = useMemo(() => filterLecturers(query, lecturers), [lecturers, query]);

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-100">Lecturer directory</h2>
          <p className="text-xs text-slate-400">Search by name, course code, room, building, or department</p>
        </div>
        {canManage && onCreateLecturer && <button type="button" onClick={onCreateLecturer} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-500">Add lecturer</button>}

        <div className="relative w-full md:max-w-md">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search lecturers or rooms"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {filteredLecturers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900 p-6 text-center text-sm text-slate-400">
          No lecturers match your search criteria.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filteredLecturers.map((lecturer) => (
            <div key={lecturer.id} className="rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-sm shadow-slate-950/30">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/20 text-sm font-semibold text-blue-200">
                  {lecturer.fullName
                    .split(' ')
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase() || <UserRound size={16} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-100">{lecturer.fullName}</div>
                  <div className="text-[11px] text-blue-400">{lecturer.academicTitle}</div>
                  <div className="mt-2 text-[11px] text-slate-400">{lecturer.department}</div>
                  {lecturer.specialization && <div className="text-[11px] text-slate-500">{lecturer.specialization}</div>}
                </div>
              </div>

              <div className="mt-3 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <MapPin size={12} className="text-blue-400" />
                  <span>{lecturer.room}</span>
                </div>
                {lecturer.coursesTaught.length > 0 && (
                  <div className="line-clamp-2 text-slate-400">{lecturer.coursesTaught.join(', ')}</div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onSelectLecturer(lecturer)}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-500"
                >
                  View Profile
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateToOffice(lecturer)}
                  className="rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-200 hover:border-blue-500 hover:text-white"
                >
                  Find Office
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-300">
                {lecturer.email && <a href={`mailto:${lecturer.email}`} className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-2 py-1 hover:border-blue-500 hover:text-blue-200">
                  <Mail size={12} /> Email
                </a>}
                {lecturer.phone && (
                  <a href={`tel:${lecturer.phone.replace(/\s+/g, '')}`} className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-2 py-1 hover:border-blue-500 hover:text-blue-200">
                    <Phone size={12} /> Call
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
