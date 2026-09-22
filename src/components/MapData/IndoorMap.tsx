import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import { CircleMarker, ImageOverlay, MapContainer, Polyline, Tooltip, useMap } from 'react-leaflet';
import type { LatLngBoundsExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

import floorPlanImage from '../../assets/CS Indoor Map.png';
import { getNodeCoordinates, navigationGraphNodes } from './navigationGraph';
import { rooms, type Room } from './rooms';

const FLOOR_PLAN_WIDTH = 451;
const FLOOR_PLAN_HEIGHT = 637;
const FLOOR_PLAN_BOUNDS: LatLngBoundsExpression = [
  [0, 0],
  [FLOOR_PLAN_HEIGHT, FLOOR_PLAN_WIDTH],
];

const getMapPoint = (room: Room): [number, number] => [
  FLOOR_PLAN_HEIGHT - (room.y / 100) * FLOOR_PLAN_HEIGHT,
  (room.x / 100) * FLOOR_PLAN_WIDTH,
];

const getMarkerColor = (room: Room) => {
  if (room.type === 'Restricted Area') return '#f97316';
  if (room.type === 'Restroom') return '#a855f7';
  if (room.type === 'Laboratory') return '#22c55e';
  if (room.type === 'Office') return '#60a5fa';
  if (room.type === 'Classroom') return '#38bdf8';
  if (room.type === 'Seminar') return '#facc15';
  return '#94a3b8';
};

function FitMapToFloorPlan() {
  const map = useMap();

  useEffect(() => {
    // Fit the image bounds once without repeatedly forcing the view.
    try {
      map.fitBounds(FLOOR_PLAN_BOUNDS, { padding: [20, 20] });

      // Create a slightly padded maxBounds so the user isn't trapped against exact edges
      // when the container size changes or when zooming.
      const padded = L.latLngBounds(FLOOR_PLAN_BOUNDS as any).pad(0.08);
      map.setMaxBounds(padded as any);

      map.setMinZoom(0.8);
      map.setMaxZoom(4);

      // Disable scroll-wheel zoom by default to avoid capturing page scroll.
      if (map.scrollWheelZoom) map.scrollWheelZoom.disable();

      // Enable wheel zoom only while mouse is over the map (and disable on leave).
      const enableWheel = () => map.scrollWheelZoom && map.scrollWheelZoom.enable();
      const disableWheel = () => map.scrollWheelZoom && map.scrollWheelZoom.disable();

      map.on('mouseover', enableWheel);
      map.on('mouseout', disableWheel);
      map.on('focus', enableWheel as any);
      map.on('blur', disableWheel as any);

      // Invalidate size once after setup to ensure proper initial rendering.
      requestAnimationFrame(() => map.invalidateSize());

      const handleResize = () => map.invalidateSize();
      window.addEventListener('resize', handleResize);

      return () => {
        map.off('mouseover', enableWheel);
        map.off('mouseout', disableWheel);
        map.off('focus', enableWheel as any);
        map.off('blur', disableWheel as any);
        window.removeEventListener('resize', handleResize);
      };
    } catch (e) {
      // defensive: if map operations fail, avoid crashing the app
      // eslint-disable-next-line no-console
      console.error('Map fit/setup failed', e);
    }
  }, [map]);

  return null;
}

function RoomMarker({
  room,
  isSelected,
  onSelect,
}: {
  room: Room;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const position = getMapPoint(room);
  const markerColor = getMarkerColor(room);

  return (
    <CircleMarker
      center={position}
      radius={isSelected ? 9 : 7}
      pathOptions={{
        color: isSelected ? '#f8fafc' : '#dbeafe',
        weight: isSelected ? 3 : 2,
        fillColor: markerColor,
        fillOpacity: isSelected ? 1 : 0.8,
      }}
      eventHandlers={{
        click: () => onSelect(room.id),
      }}
    >
      <Tooltip direction="top" offset={[0, -12]} opacity={1} permanent={false}>
        {room.name}
      </Tooltip>
    </CircleMarker>
  );
}

function RouteOverlay({
  path,
  startNodeId,
  endNodeId,
}: {
  path: string[];
  startNodeId: string | null;
  endNodeId: string | null;
}) {
  const routePoints = useMemo(() => {
    if (!path.length) return [] as [number, number][];

    return path
      .map((nodeId) => getNodeCoordinates(nodeId))
      .filter((point) => point !== null)
      .map((point) => {
        const { x, y } = point!;
        return [FLOOR_PLAN_HEIGHT - (y / 100) * FLOOR_PLAN_HEIGHT, (x / 100) * FLOOR_PLAN_WIDTH] as [number, number];
      });
  }, [path]);

  const startPoint = startNodeId ? getNodeCoordinates(startNodeId) : null;
  const endPoint = endNodeId ? getNodeCoordinates(endNodeId) : null;

  return (
    <>
      {routePoints.length > 1 && (
        <Polyline positions={routePoints} pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.85 }} />
      )}
      {startPoint && (
        <CircleMarker center={[FLOOR_PLAN_HEIGHT - (startPoint.y / 100) * FLOOR_PLAN_HEIGHT, (startPoint.x / 100) * FLOOR_PLAN_WIDTH]} radius={8} pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 1 }} />
      )}
      {endPoint && (
        <CircleMarker center={[FLOOR_PLAN_HEIGHT - (endPoint.y / 100) * FLOOR_PLAN_HEIGHT, (endPoint.x / 100) * FLOOR_PLAN_WIDTH]} radius={8} pathOptions={{ color: '#f43f5e', fillColor: '#f43f5e', fillOpacity: 1 }} />
      )}
    </>
  );
}

export function IndoorMap({
  selectedRoomId,
  onSelectRoom,
  routePath,
  startNodeId,
  endNodeId,
}: {
  selectedRoomId: string | null;
  onSelectRoom: (id: string | null) => void;
  routePath: string[];
  startNodeId: string | null;
  endNodeId: string | null;
}) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const observer = new ResizeObserver(() => {
      // use the stored Leaflet map instance to invalidate size
      if (mapRef.current) mapRef.current.invalidateSize();
    });

    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={mapContainerRef} className="relative min-h-[360px] w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-lg shadow-slate-950/30">
      <MapContainer
        className="h-[420px] w-full md:h-[500px]"
        center={[FLOOR_PLAN_HEIGHT / 2, FLOOR_PLAN_WIDTH / 2]}
        zoom={1}
        minZoom={0.8}
        maxZoom={4}
        scrollWheelZoom
        zoomControl
        attributionControl={false}
        dragging
        doubleClickZoom
        tap={false}
        touchZoom
        boxZoom
        crs={L.CRS.Simple}
        whenCreated={(map) => {
          mapRef.current = map;
          // ensure correct sizing once created
          map.invalidateSize();
        }}
      >
        <FitMapToFloorPlan />
        <ImageOverlay url={floorPlanImage} bounds={FLOOR_PLAN_BOUNDS} />
        {rooms.map((room) => (
          <RoomMarker
            key={room.id}
            room={room}
            isSelected={room.id === selectedRoomId}
            onSelect={onSelectRoom}
          />
        ))}
        {routePath.length > 0 && <RouteOverlay path={routePath} startNodeId={startNodeId} endNodeId={endNodeId} />}
      </MapContainer>
      {/* Custom controls that call Leaflet API directly to ensure predictable zoom behavior */}
      <div className="absolute top-3 right-3 z-50 flex flex-col gap-2">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => {
            if (mapRef.current) mapRef.current.zoomIn();
          }}
          className="rounded bg-slate-800/80 px-2 py-1 text-sm text-white shadow"
        >
          +
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => {
            if (mapRef.current) mapRef.current.zoomOut();
          }}
          className="rounded bg-slate-800/80 px-2 py-1 text-sm text-white shadow"
        >
          −
        </button>
        <button
          type="button"
          aria-label="Fit full map"
          onClick={() => {
            if (mapRef.current) {
              try {
                mapRef.current.fitBounds(FLOOR_PLAN_BOUNDS, { padding: [20, 20] });
              } catch (e) {
                // eslint-disable-next-line no-console
                console.error('Failed to fit bounds', e);
              }
            }
          }}
          className="rounded bg-slate-800/80 px-2 py-1 text-xs text-white shadow"
        >
          Full
        </button>
      </div>
    </div>
  );
}

export { FLOOR_PLAN_HEIGHT, FLOOR_PLAN_WIDTH, navigationGraphNodes };
