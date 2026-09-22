import { useEffect, useMemo, useState } from 'react';
import { Compass, MapPinned, ShieldAlert } from 'lucide-react';

import type { Role } from '../../navigationLogic';
import { runDijkstra } from './dijkstra';
import { IndoorMap } from './IndoorMap';
import OutdoorMap from './OutdoorMap';
import { navigationGraphEdges, navigationGraphNodes } from './navigationGraph';
import { rooms } from './rooms';

type NavigationMode = 'indoor' | 'outdoor';

const WALKING_SPEED_METERS_PER_MINUTE = 80;

export function MapTab({ role, destinationRoomId: destinationRoomIdProp }: { role: Role; destinationRoomId?: string | null }) {
  const [navigationMode, setNavigationMode] = useState<NavigationMode>('indoor');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [startRoomId, setStartRoomId] = useState<string>('entrance');
  const [destinationRoomId, setDestinationRoomId] = useState<string>('lab-1');
  const [routePath, setRoutePath] = useState<string[]>([]);
  const [routeInfo, setRouteInfo] = useState<{ totalDistance: number; walkingTime: number; steps: string[] } | null>(null);

  useEffect(() => {
    if (!destinationRoomIdProp) {
      return;
    }

    setDestinationRoomId(destinationRoomIdProp);
    setSelectedRoomId(destinationRoomIdProp);
    setNavigationMode('indoor');
    const room = rooms.find((entry) => entry.id === destinationRoomIdProp);
    if (room && room.navigationNodeId) {
      handleGetDirectionsForRoom(destinationRoomIdProp);
    }
  }, [destinationRoomIdProp]);

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === selectedRoomId) ?? null,
    [selectedRoomId],
  );

  const showOutdoorMode = navigationMode === 'outdoor';

  const graph = useMemo(() => {
    const adjacency: Record<string, { id: string; neighbors: Array<{ nodeId: string; weight: number }> }> = {};

    for (const node of navigationGraphNodes) {
      adjacency[node.id] = { id: node.id, neighbors: [] };
    }

    for (const edge of navigationGraphEdges) {
      adjacency[edge.from]?.neighbors.push({ nodeId: edge.to, weight: edge.weight });
      adjacency[edge.to]?.neighbors.push({ nodeId: edge.from, weight: edge.weight });
    }

    return adjacency;
  }, []);

  const getNodeIdForRoom = (roomId: string) => {
    const room = rooms.find((entry) => entry.id === roomId);
    return room?.navigationNodeId ?? null;
  };

  const handleGetDirectionsForRoom = (nextDestinationRoomId: string) => {
    if (!startRoomId || !nextDestinationRoomId) return;

    const startNodeId = getNodeIdForRoom(startRoomId);
    const destinationNodeId = getNodeIdForRoom(nextDestinationRoomId);

    if (!startNodeId || !destinationNodeId) {
      setRouteInfo(null);
      setRoutePath([]);
      return;
    }

    if (startNodeId === destinationNodeId) {
      setRoutePath([startNodeId]);
      setRouteInfo({
        totalDistance: 0,
        walkingTime: 0,
        steps: ['You are already at the selected destination.'],
      });
      return;
    }

    const result = runDijkstra(graph, startNodeId, destinationNodeId);

    if (!result.found || result.path.length === 0) {
      setRouteInfo({
        totalDistance: 0,
        walkingTime: 0,
        steps: ['No valid route could be computed for the selected rooms.'],
      });
      setRoutePath([]);
      return;
    }

    const walkingTimeMinutes = result.totalDistance / WALKING_SPEED_METERS_PER_MINUTE;
    const roomStart = rooms.find((room) => room.id === startRoomId);
    const roomDestination = rooms.find((room) => room.id === destinationRoomId);
    const steps = [
      `Start at ${roomStart?.name ?? 'the selected start point'}.`,
      'Continue along the corridor network.',
      `Follow the walkable path to ${roomDestination?.name ?? 'your destination'}.`,
      `Arrive at ${roomDestination?.name ?? 'your destination'}.`,
    ];

    setRoutePath(result.path);
    setRouteInfo({
      totalDistance: result.totalDistance,
      walkingTime: walkingTimeMinutes,
      steps,
    });
  };

  const handleGetDirections = () => {
    handleGetDirectionsForRoom(destinationRoomId);
  };

  const handleClearRoute = () => {
    setRoutePath([]);
    setRouteInfo(null);
  };

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-4">
      <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg shadow-slate-950/30">
        <div className="mb-3 flex items-center gap-2 text-blue-400">
          <Compass size={16} />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Navigation</span>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-slate-100">Navigation</h2>
        <p className="mt-1 text-sm text-slate-400">Indoor and outdoor campus wayfinding.</p>

        <div className="mt-4 inline-flex w-full flex-wrap gap-2 rounded-xl border border-slate-700 bg-slate-950 p-1 sm:w-auto">
          {(['indoor', 'outdoor'] as const).map((mode) => {
            const isActive = navigationMode === mode;

            return (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setNavigationMode(mode);
                  if (mode === 'outdoor') {
                    setSelectedRoomId(null);
                  }
                }}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition sm:px-4 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {mode === 'indoor' ? 'Indoor Navigation' : 'Outdoor Navigation'}
              </button>
            );
          })}
        </div>
      </div>

      {!showOutdoorMode ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_320px]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-blue-400">Indoor map</div>
                <div className="text-lg font-semibold text-slate-100">Department Floor Plan</div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[11px] text-blue-200">
                <MapPinned size={12} /> Interactive map
              </div>
            </div>

            <div className="mb-4 space-y-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
                  Start
                  <select
                    value={startRoomId}
                    onChange={(event) => setStartRoomId(event.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
                  >
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
                  Destination
                  <select
                    value={destinationRoomId}
                    onChange={(event) => setDestinationRoomId(event.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
                  >
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleGetDirections}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
                >
                  Get Directions
                </button>
                <button
                  type="button"
                  onClick={handleClearRoute}
                  className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
                >
                  Clear Route
                </button>
              </div>

              {routeInfo && (
                <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-sm text-slate-200">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-slate-100">Route summary</span>
                    <span className="text-xs uppercase tracking-[0.18em] text-blue-300">
                      {routeInfo.totalDistance.toFixed(0)} m • {routeInfo.walkingTime.toFixed(1)} min
                    </span>
                  </div>
                  <div className="space-y-2">
                    {routeInfo.steps.map((step, index) => (
                      <div key={`${step}-${index}`} className="text-slate-300">
                        {index + 1}. {step}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <IndoorMap
              selectedRoomId={selectedRoomId}
              onSelectRoom={setSelectedRoomId}
              routePath={routePath}
              startNodeId={getNodeIdForRoom(startRoomId)}
              endNodeId={getNodeIdForRoom(destinationRoomId)}
            />
          </div>

          <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="mb-4 flex items-center gap-2 text-slate-200">
              <MapPinned size={16} className="text-blue-400" />
              <span className="text-sm font-semibold">Room information</span>
            </div>

            {selectedRoom ? (
              <div className="space-y-3 text-sm text-slate-300">
                <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-100">{selectedRoom.name}</h3>
                      {selectedRoom.abbreviation && (
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-blue-300">
                          {selectedRoom.abbreviation}
                        </p>
                      )}
                    </div>
                    {selectedRoom.type === 'Restricted Area' && (
                      <span className="rounded-full border border-orange-500/40 bg-orange-500/10 px-2 py-1 text-[10px] font-medium text-orange-300">
                        Restricted
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-3">
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">Type</div>
                  <p className="mt-1 text-slate-100">{selectedRoom.type}</p>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-3">
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">Associated lecturers</div>
                  {selectedRoom.lecturerNames && selectedRoom.lecturerNames.length > 0 ? (
                    <ul className="mt-2 space-y-1 text-slate-200">
                      {selectedRoom.lecturerNames.map((lecturer) => (
                        <li key={lecturer}>• {lecturer}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-slate-400">No lecturer information available.</p>
                  )}
                </div>

                {selectedRoom.type === 'Restricted Area' && (
                  <div className="flex items-start gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 p-3 text-orange-200">
                    <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                    <p>Access is restricted to authorised staff only.</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedRoomId(null)}
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-blue-500 hover:text-white"
                >
                  Clear selection
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/50 p-4 text-sm text-slate-400">
                Select a room on the map to view its information.
              </div>
            )}
          </aside>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
          <div className="mb-3 flex items-center gap-2 text-blue-400">
            <Compass size={16} />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Outdoor navigation</span>
          </div>

            <OutdoorMap />
        </div>
      )}

      {role === 'developer_admin' && !showOutdoorMode && (
        <div className="mt-4 rounded-2xl border border-emerald-700/40 bg-emerald-900/10 p-3 text-xs text-emerald-200">
          Developer admin controls are enabled for the indoor map.
        </div>
      )}
    </div>
  );
}
