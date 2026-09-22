import { LECTURERS } from './navigationLogic';

export function LecturersTab() {
  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-100">Department lecturers</h2>
        <p className="text-xs text-slate-500">Computer Science Department — University of Zambia</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {LECTURERS.map((lecturer, index) => (
          <div key={lecturer.name} className="rounded-xl border border-slate-700 bg-slate-900 p-3">
            <div className="flex items-start gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: `hsl(${(index * 47 + 210) % 360} 55% 32%)` }}
              >
                {lecturer.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-100">{lecturer.name}</div>
                <div className="text-[11px] text-blue-400">{lecturer.title}</div>
                <div className="mt-2 text-[11px] text-slate-500">{lecturer.specialization}</div>
                <div className="mt-2 text-[10px] text-slate-400">{lecturer.email}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
