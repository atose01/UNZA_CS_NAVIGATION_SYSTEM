import type { EventRecord, LecturerProfile, TimetableEntry, Announcement } from '../navigationLogic';

export type DatabaseRole = 'student' | 'lecturer_admin' | 'developer_admin';

export type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

export type SupabaseSession = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  expires_at?: number;
  token_type?: string;
  user: SupabaseUser;
};

export type ProfileRecord = {
  id: string;
  computer_id: string | null;
  full_name: string;
  email: string;
  phone_number: string | null;
  role: DatabaseRole;
  password_change_required: boolean;
  department: string | null;
  office_room: string | null;
  profile_image: string | null;
  created_at: string;
  updated_at: string;
};

export type BuildingRecord = {
  id: string;
  name: string;
  description: string | null;
  campus_name: string | null;
  latitude: number | null;
  longitude: number | null;
  number_of_floors: number;
  created_at?: string;
  updated_at?: string;
};

export type FloorRecord = {
  id: string;
  building_id: string;
  name: string;
  floor_number: number;
  map_asset_path: string | null;
  map_width: number | null;
  map_height: number | null;
};

export type RoomRecord = {
  id: string;
  name: string;
  room_code: string | null;
  building_id: string;
  floor_id: string;
  type: string;
  description: string | null;
  x: number;
  y: number;
  abbreviation: string | null;
  navigation_node_id: string | null;
  accessible: boolean;
  active: boolean;
  searchable_keywords: string[];
  lecturer_names?: string[];
};

export type NavigationNodeRecord = {
  id: string;
  name: string;
  node_type: string;
  floor_id: string;
  x: number;
  y: number;
};

export type NavigationEdgeRecord = {
  id: string;
  from_node_id: string;
  to_node_id: string;
  distance: number;
  direction: string | null;
  floor_id: string;
  accessible: boolean;
  available: boolean;
  bidirectional: boolean;
};

export type LecturerRecord = LecturerProfile & {
  user_id?: string | null;
  email_verified?: boolean;
};

export type CourseRecord = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
};

export type EventRecordRow = EventRecord & {
  created_by: string | null;
  created_at?: string;
  updated_at?: string;
};

export type AnnouncementRecordRow = Announcement & {
  author_id: string | null;
  created_at?: string;
  updated_at?: string;
};

export type TimetableRecordRow = TimetableEntry & {
  course_id: string | null;
  lecturer_id: string | null;
  room_id: string;
  created_by: string | null;
  created_at?: string;
  updated_at?: string;
};

export type OutdoorDestinationRecord = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  latitude: number;
  longitude: number;
  building_id: string | null;
  accessibility_info: string | null;
  opening_hours: string | null;
  active: boolean;
  verified: boolean;
  created_at?: string;
  updated_at?: string;
};
