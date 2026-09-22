insert into public.buildings (id, name, description, campus_name, latitude, longitude, number_of_floors)
values ('cs-building', 'Computer Science Building', 'Computer Science Department building.', 'UNZA Great East Road Campus', null, null, 1)
on conflict (id) do update set name = excluded.name, description = excluded.description;

insert into public.floors (id, building_id, name, floor_number, map_asset_path, map_width, map_height)
values ('cs-ground-floor', 'cs-building', 'Ground Floor', 0, 'floor-plans/cs-indoor-map.png', 451, 637)
on conflict (id) do update set map_asset_path = excluded.map_asset_path;

insert into public.navigation_nodes (id, name, node_type, floor_id, x, y) values
('entrance-door', 'Department Entrance', 'entrance', 'cs-ground-floor', 57, 97),
('main-corridor-1', 'Main Corridor 1', 'corridor', 'cs-ground-floor', 53, 82),
('main-corridor-2', 'Main Corridor 2', 'corridor', 'cs-ground-floor', 53, 60),
('main-corridor-3', 'Main Corridor 3', 'corridor', 'cs-ground-floor', 53, 40),
('main-corridor-4', 'Main Corridor 4', 'corridor', 'cs-ground-floor', 53, 20),
('left-corridor-1', 'Left Corridor 1', 'corridor', 'cs-ground-floor', 22, 82),
('left-corridor-2', 'Left Corridor 2', 'corridor', 'cs-ground-floor', 22, 60),
('left-corridor-3', 'Left Corridor 3', 'corridor', 'cs-ground-floor', 22, 40),
('left-corridor-4', 'Left Corridor 4', 'corridor', 'cs-ground-floor', 22, 20),
('right-corridor-1', 'Right Corridor 1', 'corridor', 'cs-ground-floor', 75, 82),
('right-corridor-2', 'Right Corridor 2', 'corridor', 'cs-ground-floor', 75, 60),
('right-corridor-3', 'Right Corridor 3', 'corridor', 'cs-ground-floor', 75, 40),
('right-corridor-4', 'Right Corridor 4', 'corridor', 'cs-ground-floor', 75, 20),
('hod-door', 'Head of Computer Science', 'room', 'cs-ground-floor', 12, 17),
('secretary-door', 'Secretary Office', 'room', 'cs-ground-floor', 12, 27),
('messenger-door', 'Messenger Office', 'room', 'cs-ground-floor', 12, 35),
('electrical-services-door', 'Electrical Services', 'room', 'cs-ground-floor', 9, 7),
('cs-r2-door', 'Computer Studies Room 2', 'room', 'cs-ground-floor', 12, 37),
('cs-r3-door', 'Computer Studies Room 3', 'room', 'cs-ground-floor', 12, 47),
('cs-r4-door', 'Computer Studies Room 4', 'room', 'cs-ground-floor', 12, 57),
('cs-r5-door', 'Computer Studies Room 5', 'room', 'cs-ground-floor', 12, 67),
('cs-r6-door', 'Computer Studies Room 6', 'room', 'cs-ground-floor', 12, 77),
('staff-only-door', 'Staff Only', 'restricted', 'cs-ground-floor', 12, 88),
('ladies-door', 'Ladies Toilet', 'room', 'cs-ground-floor', 7, 10),
('lab-1-door', 'Computer Lab 1', 'room', 'cs-ground-floor', 53, 22),
('lab-2-door', 'Computer Lab 2', 'room', 'cs-ground-floor', 53, 42),
('lab-3-door', 'Computer Lab 3', 'room', 'cs-ground-floor', 53, 62),
('seminar-door', 'Seminar Room', 'room', 'cs-ground-floor', 62, 87),
('visitors-toilet-door', 'Students and Visitors Toilet', 'room', 'cs-ground-floor', 73, 88),
('hardware-lab-door', 'Hardware Lab', 'room', 'cs-ground-floor', 91, 89)
on conflict (id) do nothing;

insert into public.rooms (id, name, room_code, building_id, floor_id, type, description, x, y, abbreviation, navigation_node_id, searchable_keywords) values
('entrance', 'Department Entrance', null, 'cs-building', 'cs-ground-floor', 'Entrance', 'Main entrance to the department.', 57, 97, null, 'entrance-door', array['entrance', 'main entrance']),
('hod', 'Head of Computer Science', 'HD, CS', 'cs-building', 'cs-ground-floor', 'Office', 'Head of Department office.', 12, 17, 'HD, CS', 'hod-door', array['hod', 'head of computer science', 'office']),
('secretary', 'Secretary''s Office', null, 'cs-building', 'cs-ground-floor', 'Office', 'Department secretary office.', 12, 27, null, 'secretary-door', array['secretary', 'office']),
('messenger', 'Messenger''s Office', null, 'cs-building', 'cs-ground-floor', 'Office', 'Department messenger office.', 12, 35, null, 'messenger-door', array['messenger', 'office']),
('electrical-services', 'Electrical Services', 'Es', 'cs-building', 'cs-ground-floor', 'Services', 'Electrical services room.', 9, 7, 'Es', 'electrical-services-door', array['electrical', 'services']),
('lab-1', 'Computer Lab 1', 'CL1', 'cs-building', 'cs-ground-floor', 'Laboratory', 'Computer laboratory.', 53, 22, 'CL1', 'lab-1-door', array['lab', 'lab 1', 'computer lab 1']),
('lab-2', 'Computer Lab 2', 'CL2', 'cs-building', 'cs-ground-floor', 'Laboratory', 'Computer laboratory.', 53, 42, 'CL2', 'lab-2-door', array['lab', 'lab 2', 'computer lab 2']),
('lab-3', 'Computer Lab 3', 'CL3', 'cs-building', 'cs-ground-floor', 'Laboratory', 'Computer laboratory.', 53, 62, 'CL3', 'lab-3-door', array['lab', 'lab 3', 'computer lab 3']),
('cs-r2', 'Computer Studies Room 2', 'CS, R2', 'cs-building', 'cs-ground-floor', 'Classroom', 'Computer studies classroom.', 12, 37, 'CS, R2', 'cs-r2-door', array['cs room 2', 'computer studies room 2']),
('cs-r3', 'Computer Studies Room 3', 'CS, R3', 'cs-building', 'cs-ground-floor', 'Classroom', 'Computer studies classroom.', 12, 47, 'CS, R3', 'cs-r3-door', array['cs room 3', 'computer studies room 3']),
('cs-r4', 'Computer Studies Room 4', 'CS, R4', 'cs-building', 'cs-ground-floor', 'Classroom', 'Computer studies classroom.', 12, 57, 'CS, R4', 'cs-r4-door', array['cs room 4', 'computer studies room 4']),
('cs-r5', 'Computer Studies Room 5', 'CS, R5', 'cs-building', 'cs-ground-floor', 'Classroom', 'Computer studies classroom.', 12, 67, 'CS, R5', 'cs-r5-door', array['cs room 5', 'computer studies room 5']),
('cs-r6', 'Computer Studies Room 6', 'CS, R6', 'cs-building', 'cs-ground-floor', 'Classroom', 'Computer studies classroom.', 12, 77, 'CS, R6', 'cs-r6-door', array['cs room 6', 'computer studies room 6']),
('staff-only', 'Staff Only', null, 'cs-building', 'cs-ground-floor', 'Restricted Area', 'Restricted staff area.', 12, 88, null, 'staff-only-door', array['staff only', 'restricted']),
('ladies', 'Ladies'' Toilet', null, 'cs-building', 'cs-ground-floor', 'Restroom', 'Restroom.', 7, 10, null, 'ladies-door', array['ladies', 'toilet']),
('visitors-toilet', 'Students and Visitors Toilet', 'V and Stu.', 'cs-building', 'cs-ground-floor', 'Restroom', 'Restroom for students and visitors.', 73, 88, 'V and Stu.', 'visitors-toilet-door', array['students', 'visitors', 'toilet']),
('seminar', 'Seminar Room', null, 'cs-building', 'cs-ground-floor', 'Seminar', 'Department seminar room.', 62, 87, null, 'seminar-door', array['seminar', 'room']),
('hardware-lab', 'Hardware Lab', null, 'cs-building', 'cs-ground-floor', 'Laboratory', 'Hardware laboratory.', 91, 89, null, 'hardware-lab-door', array['hardware', 'lab'])
on conflict (id) do nothing;

insert into public.navigation_edges (id, from_node_id, to_node_id, distance, floor_id, bidirectional) values
('edge-entrance-main-1', 'entrance-door', 'main-corridor-1', 15, 'cs-ground-floor', true),
('edge-main-1-left-1', 'main-corridor-1', 'left-corridor-1', 34, 'cs-ground-floor', true),
('edge-main-1-right-1', 'main-corridor-1', 'right-corridor-1', 22, 'cs-ground-floor', true),
('edge-main-1-main-2', 'main-corridor-1', 'main-corridor-2', 22, 'cs-ground-floor', true),
('edge-main-2-left-2', 'main-corridor-2', 'left-corridor-2', 31, 'cs-ground-floor', true),
('edge-main-2-right-2', 'main-corridor-2', 'right-corridor-2', 22, 'cs-ground-floor', true),
('edge-main-2-main-3', 'main-corridor-2', 'main-corridor-3', 20, 'cs-ground-floor', true),
('edge-main-3-left-3', 'main-corridor-3', 'left-corridor-3', 31, 'cs-ground-floor', true),
('edge-main-3-right-3', 'main-corridor-3', 'right-corridor-3', 22, 'cs-ground-floor', true),
('edge-main-3-main-4', 'main-corridor-3', 'main-corridor-4', 20, 'cs-ground-floor', true),
('edge-main-4-left-4', 'main-corridor-4', 'left-corridor-4', 31, 'cs-ground-floor', true),
('edge-main-4-right-4', 'main-corridor-4', 'right-corridor-4', 22, 'cs-ground-floor', true),
('edge-left-1-staff', 'left-corridor-1', 'staff-only-door', 8, 'cs-ground-floor', true),
('edge-left-1-r6', 'left-corridor-1', 'cs-r6-door', 8, 'cs-ground-floor', true),
('edge-left-2-r5', 'left-corridor-2', 'cs-r5-door', 8, 'cs-ground-floor', true),
('edge-left-2-r4', 'left-corridor-2', 'cs-r4-door', 8, 'cs-ground-floor', true),
('edge-left-3-r3', 'left-corridor-3', 'cs-r3-door', 8, 'cs-ground-floor', true),
('edge-left-3-r2', 'left-corridor-3', 'cs-r2-door', 8, 'cs-ground-floor', true),
('edge-left-4-secretary', 'left-corridor-4', 'secretary-door', 8, 'cs-ground-floor', true),
('edge-left-4-messenger', 'left-corridor-4', 'messenger-door', 8, 'cs-ground-floor', true),
('edge-left-4-hod', 'left-corridor-4', 'hod-door', 13, 'cs-ground-floor', true),
('edge-left-4-electrical', 'left-corridor-4', 'electrical-services-door', 12, 'cs-ground-floor', true),
('edge-left-4-ladies', 'left-corridor-4', 'ladies-door', 10, 'cs-ground-floor', true),
('edge-right-1-seminar', 'right-corridor-1', 'seminar-door', 12, 'cs-ground-floor', true),
('edge-right-1-visitors', 'right-corridor-1', 'visitors-toilet-door', 12, 'cs-ground-floor', true),
('edge-right-1-hardware', 'right-corridor-1', 'hardware-lab-door', 18, 'cs-ground-floor', true),
('edge-right-2-lab-3', 'right-corridor-2', 'lab-3-door', 8, 'cs-ground-floor', true),
('edge-right-3-lab-2', 'right-corridor-3', 'lab-2-door', 8, 'cs-ground-floor', true),
('edge-right-4-lab-1', 'right-corridor-4', 'lab-1-door', 8, 'cs-ground-floor', true)
on conflict (id) do nothing;

insert into public.courses (id, code, name, description) values
('00000000-0000-0000-0000-000000000211', 'CS2110', 'Programming Fundamentals', 'Programming fundamentals.'),
('00000000-0000-0000-0000-000000003120', 'CS3120', 'Data Structures', 'Core algorithms and data structures.'),
('00000000-0000-0000-0000-000000002201', 'CS2201', 'Database Systems', 'Database systems and design.')
on conflict (id) do nothing;

-- Prototype-only provisional emails. They are intentionally marked unverified until
-- the protected demo-account provisioning helper creates matching Auth users.
insert into public.lecturers (id, full_name, academic_title, department, specialization, email, email_verified, phone, office_room_id, status) values
('00000000-0000-0000-0000-000000000001', 'Dr E. Lampi', 'Lecturer', 'Computer Science', null, 'e.lampi@cs.unza.zm', false, null, 'cs-r2', 'active'),
('00000000-0000-0000-0000-000000000002', 'Mr Mofya Phiri', 'Lecturer', 'Computer Science', null, 'mofya.phiri@cs.unza.zm', false, null, 'cs-r2', 'active'),
('00000000-0000-0000-0000-000000000003', 'Mr A. Theu', 'Lecturer', 'Computer Science', null, 'a.theu@cs.unza.zm', false, null, 'cs-r3', 'active'),
('00000000-0000-0000-0000-000000000004', 'Mr M. Phiri', 'Lecturer', 'Computer Science', null, 'm.phiri@cs.unza.zm', false, null, 'cs-r3', 'active'),
('00000000-0000-0000-0000-000000000005', 'Mr D. Zulu', 'Lecturer', 'Computer Science', null, 'd.zulu@cs.unza.zm', false, null, 'cs-r4', 'active'),
('00000000-0000-0000-0000-000000000006', 'Prof J. Phiri', 'Professor', 'Computer Science', null, 'j.phiri@cs.unza.zm', false, null, 'cs-r5', 'active'),
('00000000-0000-0000-0000-000000000007', 'Mrs Monica M. Kabemba', 'Senior Lecturer', 'Computer Science', null, 'monica.kabemba@cs.unza.zm', false, null, 'cs-r6', 'active')
on conflict (id) do update set
  full_name = excluded.full_name,
  academic_title = excluded.academic_title,
  department = excluded.department,
  specialization = excluded.specialization,
  email = excluded.email,
  email_verified = excluded.email_verified,
  phone = excluded.phone,
  office_room_id = excluded.office_room_id,
  status = excluded.status;

insert into public.timetable_entries (id, course_id, course_code, course_name, class_title, lecturer_id, lecturer, venue, room_id, date, start_time, end_time, description, recurrence)
values
('entry-1', '00000000-0000-0000-0000-000000003120', 'CS3120', 'Data Structures', 'Lecture', '00000000-0000-0000-0000-000000000004', 'Mr M. Phiri', 'Computer Lab 1', 'lab-1', '2026-09-21', '08:00', '10:00', 'Core algorithms practice', 'Weekly'),
('entry-2', '00000000-0000-0000-0000-000000000211', 'CS2110', 'Programming Fundamentals', 'Tutorial', '00000000-0000-0000-0000-000000000001', 'Dr E. Lampi', 'CS Room 2', 'cs-r2', '2026-09-21', '10:00', '12:00', 'Programming workshop', 'Weekly')
on conflict (id) do nothing;

insert into public.outdoor_destinations (id, name, category, description, latitude, longitude, active, verified)
values ('unza-campus', 'University of Zambia (UNZA) - Great East Road Campus', 'campus', 'Great East Road campus area (University of Zambia)', -15.394873, 28.3315259, true, true)
on conflict (id) do nothing;

insert into public.events (id, title, description, category, start_date_time, end_date_time, venue, building, room, organizer, status, venue_room_id)
values
('event-1', 'CS Research Seminar', 'A faculty seminar on modern systems, AI, and software engineering research directions.', 'Academic Seminar', '2026-09-28T10:00:00+02:00', '2026-09-28T12:00:00+02:00', 'Seminar Room', 'Computer Science Building', 'Seminar Room', 'Computer Science Department', 'published', 'seminar'),
('event-2', 'Student Tech Workshop', 'A practical programming workshop focused on web application design and debugging.', 'Workshop', '2026-09-30T14:00:00+02:00', '2026-09-30T17:00:00+02:00', 'Computer Lab 1', 'Computer Science Building', 'Computer Lab 1', 'Innovation Hub', 'published', 'lab-1'),
('event-3', 'Department Open Day', 'Students and parents can meet lecturers, explore labs, and learn about the CS programme.', 'Open Event', '2026-10-05T09:00:00+02:00', '2026-10-05T13:00:00+02:00', 'Main Entrance', 'Computer Science Building', 'Department Entrance', 'Department Office', 'published', 'entrance')
on conflict (id) do nothing;

insert into public.announcements (id, title, body, author, date, is_urgent, status, type, venue, course)
values
('announcement-1', 'Mid-Year Lecturer Evaluation Open', 'The evaluation is now open. All students must evaluate their lecturers on the SET system before the exam slip deadline.', 'Department Office', '2026-09-18T09:00:00+02:00', true, 'published', 'urgent', 'Department-wide', 'General'),
('announcement-2', 'Computer Lab 1 Maintenance', 'Computer Lab 1 will be closed for routine maintenance on Saturday 20 September. Use Lab 2 or Lab 3 as alternatives.', 'Department Office', '2026-09-17T09:00:00+02:00', false, 'published', 'info', 'Computer Lab 1', 'General')
on conflict (id) do nothing;
