import { describe, expect, it } from 'vitest';
import { rooms } from './components/MapData/rooms';
import {
  filterEvents,
  filterLecturers,
  getRoleCapabilities,
  validateTimetableEntry,
  hasTimetableConflict,
} from './navigationLogic';
import { isEmailIdentifier } from './services/authService';

describe('authentication', () => {
  it('recognizes email identifiers', () => {
    expect(isEmailIdentifier('student@example.com')).toBe(true);
  });

  it('recognizes computer ID identifiers', () => {
    expect(isEmailIdentifier('CS-2026-001')).toBe(false);
  });
});

describe('role capabilities', () => {
  it('keeps student users read-only', () => {
    expect(getRoleCapabilities('student')).toMatchObject({
      canCreateTimetable: false,
      canEditTimetable: false,
      canManageRooms: false,
    });
  });

  it('allows lecturer admins to manage teaching content', () => {
    expect(getRoleCapabilities('lecturer_admin')).toMatchObject({
      canCreateTimetable: true,
      canManageAnnouncements: true,
      canManageRooms: false,
    });
  });
});

describe('map room data', () => {
  it('includes the required CS department destinations and restricted staff area', () => {
    const roomNames = rooms.map((room) => room.name);
    const requiredRoomNames = [
      'Department Entrance',
      'Head of Computer Science',
      "Secretary's Office",
      "Messenger's Office",
      'Electrical Services',
      'Computer Lab 1',
      'Computer Lab 2',
      'Computer Lab 3',
      'Computer Studies Room 2',
      'Computer Studies Room 3',
      'Computer Studies Room 4',
      'Computer Studies Room 5',
      'Computer Studies Room 6',
      'Staff Only',
      "Ladies' Toilet",
      'Students and Visitors Toilet',
      'Seminar Room',
      'Hardware Lab',
    ];

    expect(requiredRoomNames.every((name) => roomNames.includes(name))).toBe(true);
    expect(rooms.find((room) => room.name === 'Staff Only')?.type).toBe('Restricted Area');
  });
});

describe('lecturer and event search', () => {
  it('matches lecturer records by name, department, room and building', () => {
    const resultsByName = filterLecturers('lampi');
    const resultsByRoom = filterLecturers('CS Room 2');
    const resultsByDepartment = filterLecturers('computer science');

    expect(resultsByName.length).toBeGreaterThan(0);
    expect(resultsByRoom.length).toBeGreaterThan(0);
    expect(resultsByDepartment.length).toBeGreaterThan(0);
  });

  it('matches events by title and venue', () => {
    const titleMatches = filterEvents('workshop');
    const venueMatches = filterEvents('seminar');

    expect(titleMatches.length).toBeGreaterThan(0);
    expect(venueMatches.length).toBeGreaterThan(0);
  });
});

describe('timetable validation', () => {
  it('rejects invalid time ranges', () => {
    const result = validateTimetableEntry({
      id: '1',
      courseCode: 'CS2201',
      courseName: 'Database Systems',
      classTitle: 'Lecture',
      lecturer: 'Mr A. Theu',
      venue: 'Computer Lab 1',
      date: '2026-09-19',
      startTime: '12:00',
      endTime: '10:00',
      description: '',
      recurrence: '',
      roomId: 'comp_lab1',
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('End time must be later than start time.');
  });

  it('detects room conflicts', () => {
    const existing = [{
      id: 'existing',
      courseCode: 'CS1010',
      courseName: 'Intro to CS',
      classTitle: 'Tutorial',
      lecturer: 'Dr E. Lampi',
      venue: 'Computer Lab 1',
      date: '2026-09-19',
      startTime: '09:00',
      endTime: '10:30',
      description: '',
      recurrence: '',
      roomId: 'comp_lab1',
    }];

    const result = hasTimetableConflict({
      id: 'new',
      courseCode: 'CS2201',
      courseName: 'Database Systems',
      classTitle: 'Lecture',
      lecturer: 'Mr A. Theu',
      venue: 'Computer Lab 1',
      date: '2026-09-19',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      recurrence: '',
      roomId: 'comp_lab1',
    }, existing);

    expect(result).toBe(true);
  });
});
