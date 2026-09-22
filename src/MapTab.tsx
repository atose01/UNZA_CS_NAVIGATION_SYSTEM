import { useState } from 'react';
import {
  ArrowRight,
  Bike,
  Building2,
  Car,
  Compass,
  Footprints,
  MapPin,
  Navigation,
  Trees,
} from 'lucide-react';

import type { Role } from './navigationLogic';

type NavigationMode = 'indoor' | 'outdoor';

const indoorZones = [
  { name: 'Reception', position: 'left-[8%] top-[14%]', size: 'w-28 h-16' },
  { name: 'CS Lobby', position: 'left-[32%] top-[12%]', size: 'w-32 h-16' },
  { name: 'Lecture Hall', position: 'left-[58%] top-[12%]', size: 'w-28 h-20' },
  { name: 'Computer Lab', position: 'left-[12%] top-[42%]', size: 'w-36 h-20' },
  { name: 'Seminar Room', position: 'left-[52%] top-[42%]', size: 'w-28 h-20' },
  { name: 'Admin Office', position: 'left-[66%] top-[62%]', size: 'w-28 h-20' },
  { name: 'Student Hub', position: 'left-[22%] top-[68%]', size: 'w-32 h-18' },
];

const outdoorPlaces = [
  { name: 'Main Gate', x: '10%', y: '18%' },
  { name: 'Library', x: '38%', y: '28%' },
  { name: 'CS Building', x: '63%', y: '34%' },
  { name: 'Student Centre', x: '28%', y: '62%' },
  { name: 'Sports Field', x: '68%', y: '70%' },
];

export function MapTab({ role }: { role: Role }) {
  const [navigationMode, setNavigationMode] = useState<NavigationMode>('indoor');

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/30">
        <div className="mb-3 flex items-center gap-2 text-blue-400">
          <Compass size={16} />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Wayfinding</span>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-slate-100">UNZA CS NAVIGATION</h2>
        <p className="mt-1 text-sm text-slate-400">Navigate around the University of Zambia.</p>

        <div className="mt-4 inline-flex rounded-xl border border-slate-700 bg-slate-950 p-1">
          {(['indoor', 'outdoor'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setNavigationMode(mode)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                navigationMode === mode
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {mode === 'indoor' ? 'Indoor Navigation' : 'Outdoor Navigation'}
            </button>
          ))}
        </div>
      </div>

      {navigationMode === 'indoor' ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_320px]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-blue-400">Indoor map</div>
                <div className="text-lg font-semibold text-slate-100">Department Floor Plan</div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[11px] text-blue-200">
                <Navigation size={12} /> Active route
              </div>
            </div>

            <div className="relative h-[420px] overflow-hidden rounded-2xl border border-slate-700 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.12),_transparent_55%),linear-gradient(180deg,#0b1220,#090f17)]">
              <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />

              <div className="absolute left-[6%] top-[8%] h-[78%] w-[88%] rounded-2xl border border-slate-700 bg-slate-950/25" />
              <div className="absolute left-[14%] top-[18%] h-[62%] w-[72%] rounded-2xl border border-dashed border-slate-600/60" />

              {indoorZones.map((zone) => (
                <div
                  key={zone.name}
                  className={`absolute ${zone.position} ${zone.size} flex items-center justify-center rounded-xl border border-blue-500/40 bg-blue-500/10 text-center text-[11px] font-medium text-blue-100 shadow-lg shadow-blue-900/20`}
                >
                  {zone.name}
                </div>
              ))}

              <div className="absolute left-[48%] top-[36%] flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-blue-300 bg-blue-500 text-white shadow-lg shadow-blue-900/50">
                <MapPin size={12} />
              </div>

              <div className="absolute bottom-4 left-4 rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-300">
                Suggested route: Main entrance → CS Lobby → Computer Lab
              </div>
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="mb-4 flex items-center gap-2 text-slate-200">
              <Building2 size={16} className="text-blue-400" />
              <span className="text-sm font-semibold">Building guide</span>
            </div>

            <div className="space-y-3 text-sm text-slate-300">
              <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-100">Reception</span>
                  <span className="text-[10px] uppercase tracking-wide text-blue-300">Start</span>
                </div>
                <p className="text-xs text-slate-400">Entry point for visitors and student check-ins.</p>
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-100">Computer Lab</span>
                  <span className="text-[10px] uppercase tracking-wide text-blue-300">2 min</span>
                </div>
                <p className="text-xs text-slate-400">Hands-on practicals and department workshops.</p>
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-100">Lecture Hall</span>
                  <span className="text-[10px] uppercase tracking-wide text-blue-300">4 min</span>
                </div>
                <p className="text-xs text-slate-400">Large-form teaching sessions and critical lectures.</p>
              </div>
            </div>

            {role === 'developer_admin' && (
              <div className="mt-4 rounded-xl border border-emerald-700/40 bg-emerald-900/10 p-3 text-xs text-emerald-200">
                Developer admin controls are enabled for indoor map updates.
              </div>
            )}
          </aside>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_320px]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-blue-400">Outdoor map</div>
                <div className="text-lg font-semibold text-slate-100">Campus Wayfinding</div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[11px] text-blue-200">
                <Footprints size={12} /> On foot
              </div>
            </div>

            <div className="relative h-[420px] overflow-hidden rounded-2xl border border-slate-700 bg-[radial-gradient(circle_at_center,_rgba(34,197,94,0.1),_transparent_55%),linear-gradient(180deg,#0b1220,#090f17)]">
              <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.07)_1px,transparent_1px)] [background-size:26px_26px]" />

              <div className="absolute left-[10%] top-[18%] h-24 w-24 rounded-full border border-emerald-500/40 bg-emerald-500/10" />
              <div className="absolute left-[42%] top-[22%] h-20 w-20 rounded-full border border-amber-500/40 bg-amber-500/10" />
              <div className="absolute right-[12%] top-[28%] h-28 w-28 rounded-2xl border border-blue-500/40 bg-blue-500/10" />
              <div className="absolute left-[28%] bottom-[18%] h-20 w-28 rounded-2xl border border-slate-600 bg-slate-700/40" />
              <div className="absolute right-[18%] bottom-[20%] h-24 w-24 rounded-full border border-violet-500/40 bg-violet-500/10" />

              {outdoorPlaces.map((place) => (
                <div
                  key={place.name}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: place.x, top: place.y }}
                >
                  <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/80 px-2.5 py-1 text-[10px] text-slate-200 shadow-lg">
                    <MapPin size={10} className="text-blue-400" />
                    {place.name}
                  </div>
                </div>
              ))}

              <div className="absolute left-[12%] top-[48%] h-0.5 w-[68%] bg-gradient-to-r from-blue-400 via-blue-300 to-slate-500" />
              <div className="absolute left-[46%] top-[18%] h-[52%] w-0.5 bg-gradient-to-b from-blue-400 via-blue-300 to-slate-500" />

              <div className="absolute bottom-4 left-4 rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-300">
                Campus path: Main Gate → CS Building → Student Centre
              </div>
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="mb-4 flex items-center gap-2 text-slate-200">
              <Compass size={16} className="text-blue-400" />
              <span className="text-sm font-semibold">Travel options</span>
            </div>

            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/50 p-3">
                <Footprints className="text-blue-400" size={16} />
                <div>
                  <div className="font-medium text-slate-100">Walking route</div>
                  <div className="text-xs text-slate-400">7 minutes from main gate</div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/50 p-3">
                <Bike className="text-blue-400" size={16} />
                <div>
                  <div className="font-medium text-slate-100">Cycling path</div>
                  <div className="text-xs text-slate-400">Well-marked and shaded route</div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/50 p-3">
                <Car className="text-blue-400" size={16} />
                <div>
                  <div className="font-medium text-slate-100">Vehicle access</div>
                  <div className="text-xs text-slate-400">Visitor parking by the main gate</div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/50 p-3">
                <Trees className="text-blue-400" size={16} />
                <div>
                  <div className="font-medium text-slate-100">Green route</div>
                  <div className="text-xs text-slate-400">Most scenic path between campus blocks</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">Quick guidance</div>
            <div className="text-sm font-medium text-slate-200">Need help finding a place?</div>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm text-blue-200">
            Get directions <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
