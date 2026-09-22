export type Role = 'student' | 'lecturer_admin' | 'developer_admin';
export type LoginMode = 'regular' | 'admin';
export type View = 'login' | 'dashboard';
export type Tab = 'home' | 'lecturers' | 'map' | 'events';

export type Session = {
  email: string;
  displayName: string;
  role: Role;
  mode: LoginMode;
  lecturerProfileId?: string;
};

export type LecturerProfile = {
  id: string;
  fullName: string;
  academicTitle: string;
  department: string;
  coursesTaught: string[];
  email: string;
  phone: string;
  building: string;
  floor: string;
  room: string;
  profileImage?: string;
  officeRoomId?: string;
  status?: 'active' | 'inactive';
};

export type EventRecord = {
  id: string;
  title: string;
  description: string;
  category: string;
  startDateTime: string;
  endDateTime?: string;
  venue: string;
  building?: string;
  room?: string;
  organizer: string;
  status: 'draft' | 'published';
  image?: string;
  venueRoomId?: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  author: string;
  date: string;
  expiresAt?: string;
  isUrgent: boolean;
  status: 'draft' | 'published';
  course?: string;
  venue?: string;
  type?: 'urgent' | 'info' | 'warning' | 'success';
};

export type TimetableEntry = {
  id: string;
  courseCode: string;
  courseName: string;
  classTitle: string;
  lecturer: string;
  venue: string;
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  recurrence: string;
  syncToGoogleCalendar?: boolean;
};

export const DEV_ACCOUNTS = [
  {
    email: import.meta.env.VITE_STUDENT_EMAIL || 'student@dev.local',
    password: import.meta.env.VITE_STUDENT_PASSWORD || 'ChangeMe123!',
    role: 'student' as Role,
    displayName: 'Student User',
  },
  {
    email: import.meta.env.VITE_LECTURER_EMAIL || 'lecturer@dev.local',
    password: import.meta.env.VITE_LECTURER_PASSWORD || 'ChangeMe123!',
    role: 'lecturer_admin' as Role,
    displayName: 'Lecturer Admin',
  },
  {
    email: import.meta.env.VITE_DEVELOPER_EMAIL || 'developer@dev.local',
    password: import.meta.env.VITE_DEVELOPER_PASSWORD || 'ChangeMe123!',
    role: 'developer_admin' as Role,
    displayName: 'Developer Admin',
  },
];

export function authenticateDevUser(email: string, password: string) {
  const account = DEV_ACCOUNTS.find(
    (entry) => entry.email.toLowerCase() === email.trim().toLowerCase(),
  );

  if (!account || account.password !== password) {
    return {
      isAuthenticated: false,
      role: 'student' as Role,
      email: email.trim(),
      displayName: 'Unknown User',
    };
  }

  return {
    isAuthenticated: true,
    role: account.role,
    email: account.email,
    displayName: account.displayName,
    lecturerProfileId: account.role === 'lecturer_admin' ? 'lecturer-1' : undefined,
  };
}

export function getRoleCapabilities(role: Role) {
  return {
    canCreateTimetable: role === 'lecturer_admin' || role === 'developer_admin',
    canEditTimetable: role === 'lecturer_admin' || role === 'developer_admin',
    canDeleteTimetable: role === 'lecturer_admin' || role === 'developer_admin',
    canManageAnnouncements: role === 'lecturer_admin' || role === 'developer_admin',
    canPublishAnnouncements: role === 'lecturer_admin' || role === 'developer_admin',
    canManageRooms: role === 'developer_admin',
    canManageMap: role === 'developer_admin' || role === 'lecturer_admin',
    canManageLecturers: role === 'developer_admin',
    canManageEvents: role === 'lecturer_admin' || role === 'developer_admin',
    canManageOwnProfile: role === 'lecturer_admin' || role === 'developer_admin',
    canRequestRoomChange: role === 'lecturer_admin',
  };
}

export function validateLecturerProfile(profile: Partial<LecturerProfile>) {
  const errors: string[] = [];

  if (!profile.fullName || !String(profile.fullName).trim()) {
    errors.push('Full name is required.');
  }
  if (!profile.department || !String(profile.department).trim()) {
    errors.push('Department is required.');
  }
  if (!profile.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(profile.email).trim())) {
    errors.push('A valid email address is required.');
  }
  if (profile.phone && !/^[+0-9()\-\s]{7,20}$/.test(String(profile.phone).trim())) {
    errors.push('Phone number format is invalid.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateEvent(event: Partial<EventRecord>) {
  const errors: string[] = [];

  if (!event.title || !String(event.title).trim()) {
    errors.push('Event title is required.');
  }
  if (!event.category || !String(event.category).trim()) {
    errors.push('Event category is required.');
  }
  if (!event.startDateTime || !/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(String(event.startDateTime))) {
    errors.push('A valid start date and time is required.');
  }
  if (event.endDateTime && event.startDateTime && new Date(event.startDateTime) > new Date(event.endDateTime)) {
    errors.push('End date and time must be after the start date and time.');
  }
  if (!event.venue || !String(event.venue).trim()) {
    errors.push('Event venue is required.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export const LECTURER_PROFILES: LecturerProfile[] = [
  {
    id: 'lecturer-1',
    fullName: 'Dr E. Lampi',
    academicTitle: 'Lecturer',
    department: 'Computer Science',
    coursesTaught: ['CS2110 Programming Fundamentals', 'CS3105 Computer Systems'],
    email: 'e.lampi@cs.unza.zm',
    phone: '+260 955 100 111',
    building: 'Computer Science Building',
    floor: 'Ground Floor',
    room: 'CS Room 2',
    profileImage: '',
    officeRoomId: 'cs-r2',
    status: 'active',
  },
  {
    id: 'lecturer-2',
    fullName: 'Mr Mofya Phiri',
    academicTitle: 'Lecturer',
    department: 'Computer Science',
    coursesTaught: ['CS2201 Database Systems', 'CS3120 Software Engineering'],
    email: 'm.phiri@cs.unza.zm',
    phone: '+260 955 100 222',
    building: 'Computer Science Building',
    floor: 'Ground Floor',
    room: 'CS Room 2',
    profileImage: '',
    officeRoomId: 'cs-r2',
    status: 'active',
  },
  {
    id: 'lecturer-3',
    fullName: 'Mr A. Theu',
    academicTitle: 'Lecturer',
    department: 'Computer Science',
    coursesTaught: ['CS1030 Introduction to Computing', 'CS2205 Database Management'],
    email: 'a.theu@cs.unza.zm',
    phone: '+260 955 100 333',
    building: 'Computer Science Building',
    floor: 'Ground Floor',
    room: 'CS Room 3',
    profileImage: '',
    officeRoomId: 'cs-r3',
    status: 'active',
  },
  {
    id: 'lecturer-4',
    fullName: 'Mr M. Phiri',
    academicTitle: 'Lecturer',
    department: 'Computer Science',
    coursesTaught: ['CS3120 Data Structures', 'CS4201 Algorithms'],
    email: 'm.phiri2@cs.unza.zm',
    phone: '+260 955 100 444',
    building: 'Computer Science Building',
    floor: 'Ground Floor',
    room: 'CS Room 3',
    profileImage: '',
    officeRoomId: 'cs-r3',
    status: 'active',
  },
  {
    id: 'lecturer-5',
    fullName: 'Mr D. Zulu',
    academicTitle: 'Lecturer',
    department: 'Computer Science',
    coursesTaught: ['CS3204 Computer Networks', 'CS4010 Cloud Computing'],
    email: 'd.zulu@cs.unza.zm',
    phone: '+260 955 100 555',
    building: 'Computer Science Building',
    floor: 'Ground Floor',
    room: 'CS Room 4',
    profileImage: '',
    officeRoomId: 'cs-r4',
    status: 'active',
  },
  {
    id: 'lecturer-6',
    fullName: 'Prof J. Phiri',
    academicTitle: 'Professor',
    department: 'Computer Science',
    coursesTaught: ['CS4301 Artificial Intelligence', 'CS5100 Research Methods'],
    email: 'j.phiri@cs.unza.zm',
    phone: '+260 955 100 666',
    building: 'Computer Science Building',
    floor: 'Ground Floor',
    room: 'CS Room 5',
    profileImage: '',
    officeRoomId: 'cs-r5',
    status: 'active',
  },
  {
    id: 'lecturer-7',
    fullName: 'Mrs Monica Kabemba',
    academicTitle: 'Senior Lecturer',
    department: 'Computer Science',
    coursesTaught: ['CS2105 Human-Computer Interaction', 'CS4303 HCI Design Studio'],
    email: 'm.kabemba@cs.unza.zm',
    phone: '+260 955 100 777',
    building: 'Computer Science Building',
    floor: 'Ground Floor',
    room: 'CS Room 6',
    profileImage: '',
    officeRoomId: 'cs-r6',
    status: 'active',
  },
  {
    id: 'lecturer-8',
    fullName: 'Head of Department',
    academicTitle: 'HoD & Professor',
    department: 'Computer Science',
    coursesTaught: ['Department Administration', 'Research Guidance'],
    email: 'hod.cs@unza.zm',
    phone: '+260 955 100 888',
    building: 'Computer Science Building',
    floor: 'First Floor',
    room: 'Head of Department Office',
    profileImage: '',
    officeRoomId: 'hod',
    status: 'active',
  },
];

export function filterLecturers(query: string, records: LecturerProfile[] = LECTURER_PROFILES) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return records;
  }

  const normalizedQuery = trimmedQuery.toLowerCase();
  return records.filter((lecturer) => {
    const searchableText = [
      lecturer.fullName,
      lecturer.academicTitle,
      lecturer.department,
      lecturer.email,
      lecturer.phone,
      lecturer.building,
      lecturer.floor,
      lecturer.room,
      lecturer.coursesTaught.join(' '),
    ]
      .join(' ')
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}

export const INITIAL_EVENTS: EventRecord[] = [
  {
    id: 'event-1',
    title: 'CS Research Seminar',
    description: 'A faculty seminar on modern systems, AI, and software engineering research directions.',
    category: 'Academic Seminar',
    startDateTime: '2026-09-28T10:00:00',
    endDateTime: '2026-09-28T12:00:00',
    venue: 'Seminar Room',
    building: 'Computer Science Building',
    room: 'Seminar Room',
    organizer: 'Computer Science Department',
    status: 'published',
    venueRoomId: 'seminar',
  },
  {
    id: 'event-2',
    title: 'Student Tech Workshop',
    description: 'A practical programming workshop focused on web application design and debugging.',
    category: 'Workshop',
    startDateTime: '2026-09-30T14:00:00',
    endDateTime: '2026-09-30T17:00:00',
    venue: 'Computer Lab 1',
    building: 'Computer Science Building',
    room: 'Computer Lab 1',
    organizer: 'Innovation Hub',
    status: 'published',
    venueRoomId: 'lab-1',
  },
  {
    id: 'event-3',
    title: 'Department Open Day',
    description: 'Students and parents can meet lecturers, explore labs, and learn about the CS programme.',
    category: 'Open Event',
    startDateTime: '2026-10-05T09:00:00',
    endDateTime: '2026-10-05T13:00:00',
    venue: 'Main Entrance',
    building: 'Computer Science Building',
    room: 'Department Entrance',
    organizer: 'Department Office',
    status: 'published',
    venueRoomId: 'entrance',
  },
];

export function filterEvents(query: string, records: EventRecord[] = INITIAL_EVENTS) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return records;
  }

  const normalizedQuery = trimmedQuery.toLowerCase();
  return records.filter((event) => {
    const searchableText = [
      event.title,
      event.description,
      event.category,
      event.venue,
      event.building ?? '',
      event.room ?? '',
      event.organizer,
    ]
      .join(' ')
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}

export const LECTURERS = LECTURER_PROFILES.map(({ fullName, academicTitle, department, email }) => ({
  name: fullName,
  title: academicTitle,
  specialization: department,
  email,
}));

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

export function validateTimetableEntry(entry: Partial<TimetableEntry>) {
  const errors: string[] = [];

  if (!entry.courseCode || !String(entry.courseCode).trim()) {
    errors.push('Course code is required.');
  }
  if (!entry.courseName || !String(entry.courseName).trim()) {
    errors.push('Course name is required.');
  }
  if (!entry.classTitle || !String(entry.classTitle).trim()) {
    errors.push('Class title is required.');
  }
  if (!entry.venue || !String(entry.venue).trim()) {
    errors.push('Venue is required.');
  }
  if (!entry.date || !/^\d{4}-\d{2}-\d{2}$/.test(String(entry.date))) {
    errors.push('A valid date is required.');
  }
  if (!entry.startTime || !/^\d{2}:\d{2}$/.test(String(entry.startTime))) {
    errors.push('Start time is required.');
  }
  if (!entry.endTime || !/^\d{2}:\d{2}$/.test(String(entry.endTime))) {
    errors.push('End time is required.');
  }

  if (entry.startTime && entry.endTime) {
    const startMinutes = timeToMinutes(String(entry.startTime));
    const endMinutes = timeToMinutes(String(entry.endTime));
    if (startMinutes >= endMinutes) {
      errors.push('End time must be later than start time.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function hasTimetableConflict(entry: TimetableEntry, existingEntries: TimetableEntry[]) {
  return existingEntries.some((existing) => {
    if (existing.date !== entry.date) {
      return false;
    }

    const sameRoom = (existing.roomId || existing.venue).toLowerCase() === (entry.roomId || entry.venue).toLowerCase();
    if (!sameRoom) {
      return false;
    }

    const existingStart = timeToMinutes(existing.startTime);
    const existingEnd = timeToMinutes(existing.endTime);
    const candidateStart = timeToMinutes(entry.startTime);
    const candidateEnd = timeToMinutes(entry.endTime);

    return candidateStart < existingEnd && candidateEnd > existingStart;
  });
}

export const ROOM_OPTIONS = [
  'Computer Lab 1',
  'Computer Lab 2',
  'Computer Lab 3',
  'CS Room 2',
  'CS Room 3',
  'CS Room 4',
  'CS Room 5',
  'CS Room 6',
  'Seminar Room',
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'announcement-1',
    title: 'Mid-Year Lecturer Evaluation Open',
    body: 'The evaluation is now open. All students must evaluate their lecturers on the SET system before the exam slip deadline.',
    author: 'Department Office',
    date: '2026-09-18T09:00:00.000Z',
    isUrgent: true,
    status: 'published',
    type: 'urgent',
    venue: 'Department-wide',
    course: 'General',
  },
  {
    id: 'announcement-2',
    title: 'Computer Lab 1 Maintenance',
    body: 'Computer Lab 1 will be closed for routine maintenance on Saturday 20 September. Use Lab 2 or Lab 3 as alternatives.',
    author: 'Department Office',
    date: '2026-09-17T09:00:00.000Z',
    isUrgent: false,
    status: 'published',
    type: 'info',
    venue: 'Computer Lab 1',
    course: 'General',
  },
];

export const INITIAL_TIMETABLE: TimetableEntry[] = [
  {
    id: 'entry-1',
    courseCode: 'CS3120',
    courseName: 'Data Structures',
    classTitle: 'Lecture',
    lecturer: 'Mr M. Phiri',
    venue: 'Computer Lab 1',
    roomId: 'Computer Lab 1',
    date: '2026-09-21',
    startTime: '08:00',
    endTime: '10:00',
    description: 'Core algorithms practice',
    recurrence: 'Weekly',
    syncToGoogleCalendar: false,
  },
  {
    id: 'entry-2',
    courseCode: 'CS2110',
    courseName: 'Programming Fundamentals',
    classTitle: 'Tutorial',
    lecturer: 'Dr E. Lampi',
    venue: 'CS Room 2',
    roomId: 'CS Room 2',
    date: '2026-09-21',
    startTime: '10:00',
    endTime: '12:00',
    description: 'Programming workshop',
    recurrence: 'Weekly',
    syncToGoogleCalendar: false,
  },
];

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
