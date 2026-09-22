export type DestinationCategory =
  | 'campus'
  | 'academic'
  | 'library'
  | 'hostel'
  | 'food'
  | 'health'
  | 'entrance'
  | 'parking'
  | 'other';

export interface OutdoorDestination {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category: DestinationCategory;
  description?: string;
  verified: boolean;
  openingHours?: string;
  details?: Record<string, unknown>;
}

// Export two lists: verified destinations (rendered on the map) and pending verification.
export const outdoorDestinations: OutdoorDestination[] = [
  // Verified: University of Zambia (UNZA) - Great East Road Campus (from OpenStreetMap/Nominatim)
  {
    id: 'unza-campus',
    name: 'University of Zambia (UNZA) - Great East Road Campus',
    latitude: -15.394873,
    longitude: 28.3315259,
    category: 'campus',
    description: 'Great East Road campus area (University of Zambia)',
    verified: true,
  },
];

// Destinations known but needing coordinate verification. Keep these out of the rendered map until verified.
export const outdoorDestinationsPending: Array<{
  id: string;
  name: string;
  category?: DestinationCategory;
  note?: string;
}> = [
  { id: 'cs-dept', name: 'Computer Science Department', category: 'academic', note: 'Coordinates need verification' },
];

export const csDepartmentConfig = {
  // Keep null until verified coordinates are available
  latitude: null as number | null,
  longitude: null as number | null,
};
