import React, { useCallback, useEffect, useRef, useState } from 'react';

import type { OutdoorDestination } from './outdoorDestinations';
import { outdoorDestinations, outdoorDestinationsPending, csDepartmentConfig } from './outdoorDestinations';

const UNZA_CENTER = { lat: -15.3923, lng: 28.3285 };
const UNZA_ZOOM = 16;

function loadGoogleMapsScript(apiKey: string) {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('No window object'));
    if ((window as any).google && (window as any).google.maps) return resolve();

    const existing = document.querySelector(`script[data-google-maps]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Maps')));
      return;
    }

    const script = document.createElement('script');
    script.setAttribute('data-google-maps', '1');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });
}

export function OutdoorMap() {
  const mapRef = useRef<google.maps.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [locating, setLocating] = useState(false);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const accuracyCircleRef = useRef<google.maps.Circle | null>(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      setError('Google Maps API key is not configured. Set VITE_GOOGLE_MAPS_API_KEY in your .env file.');
      return;
    }

    loadGoogleMapsScript(apiKey)
      .then(() => {
        if (!containerRef.current) return;
        const map = new (window as any).google.maps.Map(containerRef.current, {
          center: UNZA_CENTER,
          zoom: UNZA_ZOOM,
          mapTypeId: 'roadmap',
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
        });

        mapRef.current = map;

        // Add campus rectangle bounds to limit view but still allow panning/zooming
        const campusBounds = new (window as any).google.maps.LatLngBounds(
          { lat: UNZA_CENTER.lat - 0.02, lng: UNZA_CENTER.lng - 0.03 },
          { lat: UNZA_CENTER.lat + 0.02, lng: UNZA_CENTER.lng + 0.03 },
        );

        // Optionally restrict but not trap: listen to bounds_changed and clamp at zoom extremes
        map.addListener('bounds_changed', () => {
          // no-op for now; placeholder for future clamp logic
        });

        // Add markers for verified destinations with category-based icons and info windows
        const markers: google.maps.Marker[] = [];
        const infoWindow = new (window as any).google.maps.InfoWindow();

        function iconForCategory(category: string) {
          // simple colored dot icons using SVG data URIs
          const colorMap: Record<string, string> = {
            academic: '#0ea5e9',
            library: '#8b5cf6',
            hostel: '#f97316',
            food: '#ef4444',
            health: '#10b981',
            entrance: '#64748b',
            parking: '#94a3b8',
            campus: '#06b6d4',
            other: '#c084fc',
          };
          const color = colorMap[category] ?? '#06b6d4';
          const svg = encodeURIComponent(`<?xml version="1.0" encoding="UTF-8"?><svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' fill='${color}' stroke='%23fff' stroke-width='2'/></svg>`);
          return `data:image/svg+xml;charset=UTF-8,${svg}`;
        }

        for (const dest of outdoorDestinations) {
          if (!dest.verified) continue;

          const marker = new (window as any).google.maps.Marker({
            position: { lat: dest.latitude, lng: dest.longitude },
            map,
            title: dest.name,
            icon: {
              url: iconForCategory(dest.category),
              scaledSize: new (window as any).google.maps.Size(28, 28),
            },
          });

          marker.addListener('click', () => {
            const content = `<div style="min-width:160px"><strong>${dest.name}</strong><div style="font-size:12px;color:#64748b;margin-top:6px">${dest.category}</div>${dest.description ? `<div style='margin-top:6px;font-size:13px'>${dest.description}</div>` : ''}<div style='margin-top:8px'><button id=\"getdir\" style=\"padding:6px 8px;background:#0ea5e9;color:#fff;border-radius:6px;border:none;cursor:pointer\">Get Directions</button></div></div>`;
            infoWindow.setContent(content);
            infoWindow.open(map, marker);

            // attach a click handler to the directions button after the DOM appears
            setTimeout(() => {
              const btn = document.getElementById('getdir');
              if (btn) {
                btn.addEventListener('click', () => {
                  // use DirectionsService if available
                  try {
                    const google = (window as any).google;
                    if (!google || !google.maps || !google.maps.DirectionsService) {
                      alert('Directions are not available with the current Maps API key.');
                      return;
                    }

                    const directionsService = new google.maps.DirectionsService();
                    const directionsRenderer = new google.maps.DirectionsRenderer({ map });

                    // Try routing from user's location if known
                    const origin = userLocation ?? UNZA_CENTER;
                    directionsService.route(
                      {
                        origin,
                        destination: { lat: dest.latitude, lng: dest.longitude },
                        travelMode: google.maps.TravelMode.WALKING,
                      },
                      (resp: any, status: any) => {
                        if (status === 'OK' && resp) {
                          directionsRenderer.setDirections(resp);
                        } else {
                          alert('Could not compute directions: ' + status);
                        }
                      },
                    );
                  } catch (e) {
                    // eslint-disable-next-line no-console
                    console.error('Directions failed', e);
                    alert('Directions failed to start. Check console for details.');
                  }
                });
              }
            }, 200);
          });

          markers.push(marker);
        }

        // Expose markers array for potential clustering/filtering (kept local for now)

        // If CS department coords are present, add marker (kept separate)
        if (csDepartmentConfig.latitude && csDepartmentConfig.longitude) {
          new (window as any).google.maps.Marker({
            position: { lat: csDepartmentConfig.latitude, lng: csDepartmentConfig.longitude },
            map,
            title: 'Computer Science Department',
          });
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Google Maps load error', err);
        setError('Failed to load Google Maps. Check your API key and network.');
      });
  }, [apiKey]);

  const handleMyLocation = useCallback(() => {
    if (locating) return;

    if (!navigator.geolocation) {
      setError('Geolocation is not available in this browser.');
      return;
    }

    setError(null);
    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy;
        const coords = { lat, lng };
        console.log('My Location: coordinates received', coords, 'accuracy:', accuracy);
        setUserLocation(coords);

        if (!mapRef.current) {
          console.warn('My Location: map instance not ready');
          setError('Map is not ready yet. Please try again in a moment.');
          setLocating(false);
          return;
        }

        try {
          // use setCenter and setZoom for deterministic behavior
          console.log('My Location: centering map on', coords);
          mapRef.current.setCenter(coords as any);
          const targetZoom = 17;
          try {
            mapRef.current.setZoom(targetZoom);
          } catch (e) {
            console.warn('My Location: setZoom failed', e);
          }

          // Create or update a visible marker for the user
          if (userMarkerRef.current) {
            console.log('My Location: moving existing marker');
            userMarkerRef.current.setPosition(coords as any);
            userMarkerRef.current.setMap(mapRef.current);
          } else {
            console.log('My Location: creating new marker');
            userMarkerRef.current = new (window as any).google.maps.Marker({
              position: coords,
              map: mapRef.current,
              title: 'Your location',
              zIndex: 9999,
              icon: {
                path: (window as any).google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#06b6d4',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              },
            });
          }

          // show accuracy circle if available
          if (typeof accuracy === 'number') {
            if (accuracyCircleRef.current) {
              accuracyCircleRef.current.setCenter(coords as any);
              accuracyCircleRef.current.setRadius(accuracy);
              accuracyCircleRef.current.setMap(mapRef.current);
            } else {
              accuracyCircleRef.current = new (window as any).google.maps.Circle({
                strokeColor: '#06b6d4',
                strokeOpacity: 0.6,
                strokeWeight: 2,
                fillColor: '#06b6d4',
                fillOpacity: 0.15,
                map: mapRef.current,
                center: coords,
                radius: accuracy,
              });
            }
          }

          // Check whether location is inside a reasonable campus bounding box
          const insideCampus =
            lat >= UNZA_CENTER.lat - 0.02 &&
            lat <= UNZA_CENTER.lat + 0.02 &&
            lng >= UNZA_CENTER.lng - 0.03 &&
            lng <= UNZA_CENTER.lng + 0.03;

          if (!insideCampus) {
            setError('Your location appears to be outside the UNZA campus area. The map was centered on your location.');
          }

          // show a transient confirmation
          setSuccessMessage('Your location is shown on the map.');
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Failed to display user location', e);
          setError('Failed to display your location on the map.');
        } finally {
          setLocating(false);
        }
      },
      (err) => {
            console.log('My Location: error callback', err);
            if (err.code === err.PERMISSION_DENIED) setError('Location permission denied. Allow location access in your browser settings and retry.');
            else if (err.code === err.POSITION_UNAVAILABLE) setError('Location unavailable. Your device could not determine a location.');
            else if (err.code === err.TIMEOUT) setError('Location request timed out. Please try again.');
            else setError('Failed to obtain location.');
            setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }, [locating]);

  // Simple in-component filters for categories
  const [visibleCategories, setVisibleCategories] = useState<Record<string, boolean>>(() => {
    return {
      campus: true,
      academic: true,
      library: true,
      hostel: true,
      food: true,
      health: true,
      entrance: true,
      parking: true,
      other: true,
    };
  });

  // quick search box state (searches local destination names)
  const [searchQuery, setSearchQuery] = useState('');
  const handleSearchSelect = (dest: OutdoorDestination) => {
    if (!mapRef.current) return;
    mapRef.current.setCenter({ lat: dest.latitude, lng: dest.longitude } as any);
    try {
      mapRef.current.setZoom(18);
    } catch (e) {
      // ignore
    }
    // trigger a synthetic click by opening an InfoWindow programmatically
    // since markers are local to the initializer above, we'll simply create a temporary InfoWindow
    const google = (window as any).google;
    if (!google) return;
    const iw = new google.maps.InfoWindow({ content: `<div style='min-width:160px'><strong>${dest.name}</strong><div style='font-size:12px;color:#64748b'>${dest.category}</div></div>` });
    iw.setPosition({ lat: dest.latitude, lng: dest.longitude });
    iw.open(mapRef.current);
  };

  // cleanup marker when component unmounts
  useEffect(() => {
    return () => {
      if (userMarkerRef.current) {
        try {
          userMarkerRef.current.setMap(null);
        } catch (e) {
          // ignore
        }
        userMarkerRef.current = null;
      }
    };
  }, []);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!successMessage) return;
    const id = setTimeout(() => setSuccessMessage(null), 4000);
    return () => clearTimeout(id);
  }, [successMessage]);

  return (
    <div className="w-full">
      {error ? (
        <div className="rounded-xl border border-red-600/30 bg-red-900/10 p-3 text-sm text-red-200">{error}</div>
      ) : (
        <div className="relative">
          <div className="absolute top-3 left-3 z-50 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                console.log('My Location button clicked');
                handleMyLocation();
              }}
              disabled={locating}
              className={`rounded px-3 py-2 text-xs text-white ${locating ? 'bg-slate-600' : 'bg-blue-600 hover:bg-blue-500'}`}
            >
              {locating ? 'Locating...' : 'My Location'}
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <div className="hidden sm:block text-xs text-slate-300">Outdoor map: UNZA Great East Road Campus</div>
              <div className="ml-2 flex gap-2">
                <input
                  placeholder="Search places"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded bg-slate-800/60 px-2 py-1 text-xs text-slate-200 outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const q = searchQuery.trim().toLowerCase();
                    if (!q) return;
                    const found = outdoorDestinations.find((d) => d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q));
                    if (found) handleSearchSelect(found);
                  }}
                  className="rounded bg-slate-700/40 px-2 py-1 text-xs text-slate-200"
                >
                  Go
                </button>
              </div>
            </div>
          </div>

          {/* category filters (desktop) */}
          <div className="absolute top-3 left-44 z-50 hidden gap-2 rounded bg-slate-900/70 p-2 shadow sm:flex">
            {Object.keys(visibleCategories).map((cat) => (
              <label key={cat} className="flex items-center gap-2 text-xs text-slate-200">
                <input
                  type="checkbox"
                  checked={Boolean(visibleCategories[cat])}
                  onChange={(e) => setVisibleCategories((s) => ({ ...s, [cat]: e.target.checked }))}
                />
                <span className="capitalize">{cat}</span>
              </label>
            ))}
            <button
              type="button"
              onClick={() => setVisibleCategories(Object.fromEntries(Object.keys(visibleCategories).map((k) => [k, true])))}
              className="ml-2 rounded bg-blue-600 px-2 py-1 text-xs text-white"
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setVisibleCategories(Object.fromEntries(Object.keys(visibleCategories).map((k) => [k, false])))}
              className="ml-1 rounded bg-slate-700 px-2 py-1 text-xs text-slate-200"
            >
              Clear
            </button>
          </div>

          <div ref={containerRef} style={{ height: 420 }} className="w-full rounded-2xl border border-slate-700" />

          {successMessage && (
            <div className="absolute top-3 right-3 z-50 rounded bg-emerald-700/80 px-3 py-2 text-xs text-white">
              {successMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OutdoorMap;
