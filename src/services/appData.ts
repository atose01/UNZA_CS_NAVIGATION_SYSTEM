import { navigationGraphEdges, navigationGraphNodes, type GraphEdge, type GraphNode } from '../components/MapData/navigationGraph';
import { rooms as staticRooms, type Room } from '../components/MapData/rooms';
import { outdoorDestinations as staticOutdoorDestinations } from '../components/MapData/outdoorDestinations';
import {
  deleteRows,
  countRows,
  insertRows,
  isSupabaseConfigured,
  selectRows,
  updateRows,
  type SupabaseRequestError,
} from '../lib/supabase';
import type { Announcement, EventRecord, LecturerProfile, TimetableEntry } from '../navigationLogic';
import type { OutdoorDestinationRecord, RoomRecord, NavigationEdgeRecord, NavigationNodeRecord } from '../types/database';
import type { OutdoorDestination } from '../components/MapData/outdoorDestinations';

export type IndoorMapData = {
  rooms: Room[];
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export type DashboardSummary = {
  totalLecturers: number;
  totalBuildings: number;
  totalRooms: number;
  upcomingEvents: number;
  upcomingClasses: number;
  recentAnnouncements: number;
};

function isNotConfigured(error: unknown) {
  return !isSupabaseConfigured || (error as SupabaseRequestError)?.status === 404;
}

function mapRoom(row: RoomRecord): Room {
  return {
    id: row.id,
    name: row.name,
    abbreviation: row.abbreviation || row.room_code || undefined,
    type: row.type,
    lecturerNames: row.lecturer_names || [],
    navigationNodeId: row.navigation_node_id || undefined,
    x: row.x,
    y: row.y,
  };
}

export async function getIndoorMapData(): Promise<IndoorMapData> {
  if (!isSupabaseConfigured) {
    return { rooms: staticRooms, nodes: navigationGraphNodes, edges: navigationGraphEdges };
  }

  try {
    const [roomRows, nodeRows, edgeRows, lecturerRows, restrictions] = await Promise.all([
      selectRows<RoomRecord>('rooms', { active: 'eq.true', order: 'name.asc' }),
      selectRows<NavigationNodeRecord>('navigation_nodes', { order: 'id.asc' }),
      selectRows<NavigationEdgeRecord>('navigation_edges', { available: 'eq.true', accessible: 'eq.true' }),
      selectRows<{ full_name: string; office_room_id: string | null }>('lecturers', { status: 'eq.active', select: 'full_name,office_room_id' }),
      selectRows<{ edge_id: string | null; node_id: string | null }>('navigation_restrictions', { active: 'eq.true' }),
    ]);

    const lecturersByRoom = new Map<string, string[]>();
    for (const lecturer of lecturerRows) {
      if (!lecturer.office_room_id) continue;
      lecturersByRoom.set(lecturer.office_room_id, [...(lecturersByRoom.get(lecturer.office_room_id) || []), lecturer.full_name]);
    }
    const nextRooms = roomRows.map((room) => mapRoom({ ...room, lecturer_names: lecturersByRoom.get(room.id) || [] }));
    const nextNodes = nodeRows.map((node) => ({
      id: node.id,
      label: node.name,
      x: node.x,
      y: node.y,
    }));
    const blockedEdges = new Set(restrictions.flatMap((restriction) => restriction.edge_id ? [restriction.edge_id] : []));
    const blockedNodes = new Set(restrictions.flatMap((restriction) => restriction.node_id ? [restriction.node_id] : []));
    const nextEdges = edgeRows.filter((edge) => !blockedEdges.has(edge.id) && !blockedNodes.has(edge.from_node_id) && !blockedNodes.has(edge.to_node_id)).map((edge) => ({
        from: edge.from_node_id,
        to: edge.to_node_id,
        weight: edge.distance,
        bidirectional: edge.bidirectional,
      }));

    if (nextRooms.length === 0 || nextNodes.length === 0 || edgeRows.length === 0) {
      return { rooms: staticRooms, nodes: navigationGraphNodes, edges: navigationGraphEdges };
    }

    return { rooms: nextRooms, nodes: nextNodes, edges: nextEdges };
  } catch (error) {
    if (isNotConfigured(error)) return { rooms: staticRooms, nodes: navigationGraphNodes, edges: navigationGraphEdges };
    throw error;
  }
}

export async function listLecturers(): Promise<LecturerProfile[]> {
  const rows = await selectRows<{
    id: string;
    user_id: string | null;
    full_name: string;
    academic_title: string;
    department: string;
    specialization: string | null;
    email: string | null;
    email_verified: boolean;
    phone: string | null;
    office_room_id: string | null;
    profile_image: string | null;
    status: 'active' | 'inactive';
  }>('lecturers', {
    select: 'id,full_name,academic_title,department,specialization,email,email_verified,phone,office_room_id,profile_image,status',
    status: 'eq.active',
    order: 'full_name.asc',
  });
  const roomRows = await selectRows<{ id: string; name: string }>('rooms', { select: 'id,name', active: 'eq.true' });
  const roomNames = new Map(roomRows.map((room) => [room.id, room.name]));
  const courses = await selectRows<{ lecturer_id: string; course_id: string }>('lecturer_courses');
  const courseIds = [...new Set(courses.map((course) => course.course_id))];
  const courseRows = courseIds.length > 0
    ? await selectRows<{ id: string; code: string; name: string }>('courses', { id: `in.(${courseIds.join(',')})` })
    : [];
  const courseNames = new Map(courseRows.map((course) => [course.id, `${course.code} ${course.name}`]));
  const lecturerCourses = new Map<string, string[]>();

  for (const course of courses) {
    const name = courseNames.get(course.course_id);
    if (!name) continue;
    lecturerCourses.set(course.lecturer_id, [...(lecturerCourses.get(course.lecturer_id) || []), name]);
  }

  return rows.map((lecturer) => ({
    id: lecturer.id,
    userId: lecturer.user_id || undefined,
    fullName: lecturer.full_name,
    academicTitle: lecturer.academic_title,
    department: lecturer.department,
    specialization: lecturer.specialization || undefined,
    emailVerified: lecturer.email_verified,
    coursesTaught: lecturerCourses.get(lecturer.id) || [],
    email: lecturer.email || '',
    phone: lecturer.phone || '',
    building: 'Computer Science Building',
    floor: 'Ground Floor',
    room: roomNames.get(lecturer.office_room_id || '') || 'Office not assigned',
    profileImage: lecturer.profile_image || undefined,
    officeRoomId: lecturer.office_room_id || undefined,
    status: lecturer.status,
  }));
}

export async function updateLecturer(lecturer: LecturerProfile) {
  const rows = await updateRows('lecturers', { id: `eq.${lecturer.id}` }, {
    full_name: lecturer.fullName,
    academic_title: lecturer.academicTitle,
    department: lecturer.department,
    specialization: lecturer.specialization || null,
    email: lecturer.email || null,
    email_verified: lecturer.emailVerified ?? false,
    phone: lecturer.phone || null,
    office_room_id: lecturer.officeRoomId || null,
    profile_image: lecturer.profileImage || null,
    status: lecturer.status || 'active',
  });
  if (!rows[0]) throw new Error('The lecturer profile was not updated. You may not have permission to edit it.');
  return lecturer;
}

export async function createLecturer(lecturer: LecturerProfile) {
  const rows = await insertRows<{
    id: string;
    user_id: string | null;
    full_name: string;
    academic_title: string;
    department: string;
    specialization: string | null;
    email: string | null;
    email_verified: boolean;
    phone: string | null;
    office_room_id: string | null;
    profile_image: string | null;
    status: 'active' | 'inactive';
  }>('lecturers', {
    full_name: lecturer.fullName,
    academic_title: lecturer.academicTitle,
    department: lecturer.department,
    specialization: lecturer.specialization || null,
    email: lecturer.email || null,
    email_verified: lecturer.emailVerified ?? false,
    phone: lecturer.phone || null,
    office_room_id: lecturer.officeRoomId || null,
    profile_image: lecturer.profileImage || null,
    status: lecturer.status || 'active',
  });
  const saved = rows[0];
  return saved ? { ...lecturer, id: saved.id, userId: saved.user_id || undefined } : lecturer;
}

function mapEvent(row: Record<string, unknown>): EventRecord {
  return {
    id: String(row.id),
    title: String(row.title || ''),
    description: String(row.description || ''),
    category: String(row.category || ''),
    startDateTime: String(row.start_date_time || row.startDateTime || ''),
    endDateTime: row.end_date_time || row.endDateTime ? String(row.end_date_time || row.endDateTime) : undefined,
    venue: String(row.venue || ''),
    building: row.building ? String(row.building) : undefined,
    room: row.room ? String(row.room) : undefined,
    organizer: String(row.organizer || ''),
    status: row.status === 'draft' ? 'draft' : 'published',
    image: row.image ? String(row.image) : undefined,
    venueRoomId: row.venue_room_id ? String(row.venue_room_id) : row.venueRoomId ? String(row.venueRoomId) : undefined,
  };
}

export async function listEvents() {
  const rows = await selectRows<Record<string, unknown>>('events', {
    select: 'id,title,description,category,start_date_time,end_date_time,venue,building,room,organizer,status,image,venue_room_id',
    status: 'eq.published',
    order: 'start_date_time.asc',
  });
  return rows.map(mapEvent);
}

export async function createEvent(event: EventRecord, userId?: string) {
  const venueRoomId = staticRooms.find((room) => room.id === event.venueRoomId || room.name === event.venueRoomId)?.id || event.venueRoomId || null;
  const rows = await insertRows<Record<string, unknown>>('events', {
    id: event.id,
    title: event.title,
    description: event.description,
    category: event.category,
    start_date_time: event.startDateTime,
    end_date_time: event.endDateTime || null,
    venue: event.venue,
    building: event.building || null,
    room: event.room || null,
    organizer: event.organizer,
    created_by: userId || null,
    status: event.status,
    image: event.image || null,
    venue_room_id: venueRoomId,
  });
  if (!rows[0]) throw new Error('The event was not created. You may not have permission to create events.');
  return mapEvent(rows[0]);
}

export async function updateEvent(event: EventRecord) {
  const venueRoomId = staticRooms.find((room) => room.id === event.venueRoomId || room.name === event.venueRoomId)?.id || event.venueRoomId || null;
  const rows = await updateRows<Record<string, unknown>>('events', { id: `eq.${event.id}` }, {
    title: event.title,
    description: event.description,
    category: event.category,
    start_date_time: event.startDateTime,
    end_date_time: event.endDateTime || null,
    venue: event.venue,
    building: event.building || null,
    room: event.room || null,
    organizer: event.organizer,
    status: event.status,
    image: event.image || null,
    venue_room_id: venueRoomId,
  });
  if (!rows[0]) throw new Error('The event was not updated. You may not have permission to edit this event.');
  return mapEvent(rows[0]);
}

export async function deleteEvent(id: string) {
  const rows = await updateRows('events', { id: `eq.${id}` }, { status: 'archived' });
  if (!rows[0]) throw new Error('The event was not archived. You may not have permission to remove it.');
}

function mapAnnouncement(row: Record<string, unknown>): Announcement {
  return {
    id: String(row.id),
    title: String(row.title || ''),
    body: String(row.body || ''),
    author: String(row.author || ''),
    date: String(row.date || row.created_at || ''),
    expiresAt: row.expires_at ? String(row.expires_at) : undefined,
    isUrgent: Boolean(row.is_urgent),
    status: row.status === 'draft' ? 'draft' : 'published',
    course: row.course ? String(row.course) : undefined,
    venue: row.venue ? String(row.venue) : undefined,
    type: row.type === 'urgent' || row.type === 'warning' || row.type === 'success' ? row.type : 'info',
  };
}

export async function listAnnouncements() {
  const rows = await selectRows<Record<string, unknown>>('announcements', {
    select: 'id,title,body,author,date,expires_at,is_urgent,status,course,venue,type',
    status: 'eq.published',
    order: 'date.desc',
  });
  return rows.map(mapAnnouncement);
}

export async function createAnnouncement(announcement: Announcement, authorId?: string) {
  const rows = await insertRows<Record<string, unknown>>('announcements', {
    id: announcement.id,
    title: announcement.title,
    body: announcement.body,
    author: announcement.author,
    author_id: authorId || null,
    date: announcement.date,
    expires_at: announcement.expiresAt || null,
    is_urgent: announcement.isUrgent,
    status: announcement.status,
    course: announcement.course || null,
    venue: announcement.venue || null,
    type: announcement.type || (announcement.isUrgent ? 'urgent' : 'info'),
  });
  return rows[0] ? mapAnnouncement(rows[0]) : announcement;
}

export async function updateAnnouncement(announcement: Announcement) {
  const rows = await updateRows<Record<string, unknown>>('announcements', { id: `eq.${announcement.id}` }, {
    title: announcement.title,
    body: announcement.body,
    expires_at: announcement.expiresAt || null,
    is_urgent: announcement.isUrgent,
    status: announcement.status,
    course: announcement.course || null,
    venue: announcement.venue || null,
    type: announcement.type || (announcement.isUrgent ? 'urgent' : 'info'),
  });
  return rows[0] ? mapAnnouncement(rows[0]) : announcement;
}

export async function deleteAnnouncement(id: string) {
  await updateRows('announcements', { id: `eq.${id}` }, { status: 'archived' });
}

function mapTimetable(row: Record<string, unknown>): TimetableEntry {
  return {
    id: String(row.id),
    courseCode: String(row.course_code || ''),
    courseName: String(row.course_name || ''),
    classTitle: String(row.class_title || ''),
    lecturer: String(row.lecturer || ''),
    venue: String(row.venue || ''),
    roomId: String(row.room_id || ''),
    date: String(row.date || ''),
    startTime: String(row.start_time || '').slice(0, 5),
    endTime: String(row.end_time || '').slice(0, 5),
    description: String(row.description || ''),
    recurrence: String(row.recurrence || ''),
    syncToGoogleCalendar: Boolean(row.sync_to_google_calendar),
  };
}

export async function listTimetable() {
  const rows = await selectRows<Record<string, unknown>>('timetable_entries', {
    select: 'id,course_code,course_name,class_title,lecturer,venue,room_id,date,start_time,end_time,description,recurrence,sync_to_google_calendar',
    order: 'date.asc,start_time.asc',
  });
  return rows.map(mapTimetable);
}

export async function createTimetableEntry(entry: TimetableEntry, userId?: string) {
  const roomId = staticRooms.find((room) => room.id === entry.roomId || room.name === entry.roomId)?.id || entry.roomId;
  const rows = await insertRows<Record<string, unknown>>('timetable_entries', {
    id: entry.id,
    course_code: entry.courseCode,
    course_name: entry.courseName,
    class_title: entry.classTitle,
    lecturer: entry.lecturer,
    venue: entry.venue,
    room_id: roomId,
    date: entry.date,
    start_time: entry.startTime,
    end_time: entry.endTime,
    description: entry.description,
    recurrence: entry.recurrence,
    sync_to_google_calendar: Boolean(entry.syncToGoogleCalendar),
    created_by: userId || null,
  });
  return rows[0] ? mapTimetable(rows[0]) : entry;
}

export async function updateTimetableEntry(entry: TimetableEntry) {
  const roomId = staticRooms.find((room) => room.id === entry.roomId || room.name === entry.roomId)?.id || entry.roomId;
  const rows = await updateRows<Record<string, unknown>>('timetable_entries', { id: `eq.${entry.id}` }, {
    course_code: entry.courseCode,
    course_name: entry.courseName,
    class_title: entry.classTitle,
    lecturer: entry.lecturer,
    venue: entry.venue,
    room_id: roomId,
    date: entry.date,
    start_time: entry.startTime,
    end_time: entry.endTime,
    description: entry.description,
    recurrence: entry.recurrence,
    sync_to_google_calendar: Boolean(entry.syncToGoogleCalendar),
  });
  return rows[0] ? mapTimetable(rows[0]) : entry;
}

export async function deleteTimetableEntry(id: string) {
  await deleteRows('timetable_entries', { id: `eq.${id}` });
}

export async function listOutdoorDestinations() {
  if (!isSupabaseConfigured) return staticOutdoorDestinations;
  const rows = await selectRows<OutdoorDestinationRecord>('outdoor_destinations', { active: 'eq.true', verified: 'eq.true', order: 'name.asc' });
  return rows.map((destination) => ({
    id: destination.id,
    name: destination.name,
    latitude: destination.latitude,
    longitude: destination.longitude,
    category: destination.category as OutdoorDestination['category'],
    description: destination.description || undefined,
    verified: destination.verified,
    openingHours: destination.opening_hours || undefined,
  }));
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [lecturers, buildings, rooms, events, classes, announcements] = await Promise.all([
    countRows('lecturers', { status: 'eq.active' }),
    countRows('buildings'),
    countRows('rooms', { active: 'eq.true' }),
    countRows('events', { status: 'eq.published', start_date_time: `gte.${new Date().toISOString()}` }),
    countRows('timetable_entries', { date: `gte.${new Date().toISOString().slice(0, 10)}` }),
    countRows('announcements', { status: 'eq.published' }),
  ]);

  return {
    totalLecturers: lecturers,
    totalBuildings: buildings,
    totalRooms: rooms,
    upcomingEvents: events,
    upcomingClasses: classes,
    recentAnnouncements: announcements,
  };
}
