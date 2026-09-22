create extension if not exists pgcrypto;

create table if not exists public.buildings (
  id text primary key,
  name text not null,
  description text,
  campus_name text,
  latitude double precision,
  longitude double precision,
  number_of_floors integer not null default 1 check (number_of_floors > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.floors (
  id text primary key,
  building_id text not null references public.buildings(id) on delete cascade,
  name text not null,
  floor_number integer not null,
  map_asset_path text,
  map_width integer,
  map_height integer,
  unique (building_id, floor_number)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  computer_id text unique,
  full_name text not null,
  email text not null,
  phone_number text,
  role text not null default 'student' check (role in ('student', 'lecturer_admin', 'developer_admin')),
  password_change_required boolean not null default false,
  department text,
  office_room text,
  profile_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_computer_id_idx on public.profiles (lower(computer_id));
create index if not exists profiles_role_idx on public.profiles (role);

create table if not exists public.rooms (
  id text primary key,
  name text not null,
  room_code text,
  building_id text not null references public.buildings(id) on delete cascade,
  floor_id text not null references public.floors(id) on delete cascade,
  type text not null,
  description text,
  x double precision not null,
  y double precision not null,
  abbreviation text,
  navigation_node_id text,
  accessible boolean not null default true,
  active boolean not null default true,
  searchable_keywords text[] not null default '{}'
);

create index if not exists rooms_search_idx on public.rooms using gin (searchable_keywords);
create index if not exists rooms_floor_idx on public.rooms (floor_id);

create table if not exists public.navigation_nodes (
  id text primary key,
  name text not null,
  node_type text not null,
  floor_id text not null references public.floors(id) on delete cascade,
  x double precision not null,
  y double precision not null
);

alter table public.rooms
  add constraint rooms_navigation_node_fk
  foreign key (navigation_node_id) references public.navigation_nodes(id) on delete set null;

create table if not exists public.navigation_edges (
  id text primary key,
  from_node_id text not null references public.navigation_nodes(id) on delete cascade,
  to_node_id text not null references public.navigation_nodes(id) on delete cascade,
  distance double precision not null check (distance >= 0),
  direction text,
  floor_id text not null references public.floors(id) on delete cascade,
  accessible boolean not null default true,
  available boolean not null default true,
  bidirectional boolean not null default true,
  check (from_node_id <> to_node_id)
);

create index if not exists navigation_edges_from_idx on public.navigation_edges (from_node_id, available);
create index if not exists navigation_edges_to_idx on public.navigation_edges (to_node_id, available);

create table if not exists public.navigation_restrictions (
  id text primary key,
  edge_id text references public.navigation_edges(id) on delete cascade,
  node_id text references public.navigation_nodes(id) on delete cascade,
  reason text not null,
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  check (edge_id is not null or node_id is not null)
);

create table if not exists public.lecturers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  full_name text not null,
  academic_title text not null default 'Lecturer',
  department text not null default 'Computer Science',
  specialization text,
  email text unique,
  email_verified boolean not null default false,
  phone text,
  office_room_id text references public.rooms(id) on delete set null,
  profile_image text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lecturer_courses (
  lecturer_id uuid not null references public.lecturers(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  primary key (lecturer_id, course_id)
);

create table if not exists public.events (
  id text primary key,
  title text not null,
  description text not null default '',
  category text not null,
  start_date_time timestamptz not null,
  end_date_time timestamptz,
  venue text not null,
  building text,
  room text,
  organizer text not null,
  created_by uuid references auth.users(id) on delete set null,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  image text,
  venue_room_id text references public.rooms(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date_time is null or end_date_time >= start_date_time)
);

create index if not exists events_upcoming_idx on public.events (status, start_date_time);

create table if not exists public.announcements (
  id text primary key,
  title text not null,
  body text not null,
  author text not null,
  author_id uuid references auth.users(id) on delete set null,
  date timestamptz not null default now(),
  expires_at timestamptz,
  is_urgent boolean not null default false,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  course text,
  venue text,
  type text check (type in ('urgent', 'info', 'warning', 'success')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists announcements_feed_idx on public.announcements (status, date desc);

create table if not exists public.timetable_entries (
  id text primary key,
  course_id uuid references public.courses(id) on delete set null,
  course_code text not null,
  course_name text not null,
  class_title text not null,
  lecturer_id uuid references public.lecturers(id) on delete set null,
  lecturer text not null,
  venue text not null,
  room_id text not null references public.rooms(id) on delete restrict,
  date date not null,
  start_time time not null,
  end_time time not null,
  description text not null default '',
  recurrence text not null default '',
  sync_to_google_calendar boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);

create index if not exists timetable_room_time_idx on public.timetable_entries (room_id, date, start_time, end_time);
create index if not exists timetable_date_idx on public.timetable_entries (date, start_time);

create or replace function public.prevent_timetable_room_conflict()
returns trigger
language plpgsql
security invoker
as $$
begin
  if exists (
    select 1
    from public.timetable_entries existing
    where existing.id <> new.id
      and existing.room_id = new.room_id
      and existing.date = new.date
      and new.start_time < existing.end_time
      and new.end_time > existing.start_time
  ) then
    raise exception 'A room booking conflict was detected for this time and venue';
  end if;
  return new;
end;
$$;

drop trigger if exists timetable_room_conflict on public.timetable_entries;
create trigger timetable_room_conflict
  before insert or update on public.timetable_entries
  for each row execute function public.prevent_timetable_room_conflict();

create table if not exists public.outdoor_destinations (
  id text primary key,
  name text not null,
  category text not null,
  description text,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  building_id text references public.buildings(id) on delete set null,
  accessibility_info text,
  opening_hours text,
  active boolean not null default true,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists outdoor_destinations_category_idx on public.outdoor_destinations (category, active);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array['buildings', 'profiles', 'lecturers', 'courses', 'events', 'announcements', 'timetable_entries', 'outdoor_destinations'] loop
    execute format('drop trigger if exists %I_updated_at on public.%I', table_name, table_name);
    execute format('create trigger %I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
  end loop;
end;
$$;

create or replace function public.is_developer_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'developer_admin'
  );
$$;

create or replace function public.is_lecturer_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('lecturer_admin', 'developer_admin')
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)), new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role is distinct from new.role and not public.is_developer_admin() then
    raise exception 'Only a developer administrator can change account roles';
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists prevent_profile_role_change on public.profiles;
create trigger prevent_profile_role_change
  before update on public.profiles
  for each row execute function public.prevent_profile_role_change();

alter table public.buildings enable row level security;
alter table public.floors enable row level security;
alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.navigation_nodes enable row level security;
alter table public.navigation_edges enable row level security;
alter table public.navigation_restrictions enable row level security;
alter table public.lecturers enable row level security;
alter table public.courses enable row level security;
alter table public.lecturer_courses enable row level security;
alter table public.events enable row level security;
alter table public.announcements enable row level security;
alter table public.timetable_entries enable row level security;
alter table public.outdoor_destinations enable row level security;

create policy buildings_public_read on public.buildings for select using (true);
create policy floors_public_read on public.floors for select using (true);
create policy rooms_public_read on public.rooms for select using (active = true);
create policy nodes_public_read on public.navigation_nodes for select using (true);
create policy edges_public_read on public.navigation_edges for select using (available = true);
create policy restrictions_public_read on public.navigation_restrictions for select using (active = true and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now()));
create policy lecturers_public_read on public.lecturers for select using (status = 'active');
create policy courses_public_read on public.courses for select using (active = true);
create policy lecturer_courses_public_read on public.lecturer_courses for select using (true);
create policy events_public_read on public.events for select using (status = 'published' and (start_date_time >= now() - interval '30 days'));
create policy announcements_public_read on public.announcements for select using (status = 'published' and (expires_at is null or expires_at > now()));
create policy timetable_public_read on public.timetable_entries for select using (true);
create policy destinations_public_read on public.outdoor_destinations for select using (active = true and verified = true);

create policy profiles_self_read on public.profiles for select using (id = auth.uid() or public.is_developer_admin());
create policy profiles_self_update on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_developer_update on public.profiles for update using (public.is_developer_admin()) with check (public.is_developer_admin());

create policy lecturers_self_update on public.lecturers for update using (user_id = auth.uid() or public.is_developer_admin()) with check (user_id = auth.uid() or public.is_developer_admin());
create policy lecturers_admin_insert on public.lecturers for insert with check (public.is_developer_admin());
create policy lecturers_admin_delete on public.lecturers for delete using (public.is_developer_admin());
create policy lecturer_courses_admin_manage on public.lecturer_courses for all using (public.is_developer_admin()) with check (public.is_developer_admin());

create policy events_admin_insert on public.events for insert with check (public.is_lecturer_admin() and (created_by is null or created_by = auth.uid()));
create policy events_admin_update on public.events for update using (public.is_lecturer_admin()) with check (public.is_lecturer_admin() and (created_by is null or created_by = auth.uid() or public.is_developer_admin()));
create policy events_admin_delete on public.events for delete using (public.is_lecturer_admin());
create policy announcements_admin_insert on public.announcements for insert with check (public.is_lecturer_admin() and (author_id is null or author_id = auth.uid()));
create policy announcements_admin_update on public.announcements for update using (public.is_lecturer_admin()) with check (public.is_lecturer_admin() and (author_id is null or author_id = auth.uid() or public.is_developer_admin()));
create policy announcements_admin_delete on public.announcements for delete using (public.is_lecturer_admin());
create policy timetable_admin_insert on public.timetable_entries for insert with check (public.is_lecturer_admin() and (created_by is null or created_by = auth.uid()));
create policy timetable_admin_update on public.timetable_entries for update using (public.is_lecturer_admin()) with check (public.is_lecturer_admin() and (created_by is null or created_by = auth.uid() or public.is_developer_admin()));
create policy timetable_admin_delete on public.timetable_entries for delete using (public.is_lecturer_admin());

create policy buildings_admin_manage on public.buildings for all using (public.is_developer_admin()) with check (public.is_developer_admin());
create policy floors_admin_manage on public.floors for all using (public.is_developer_admin()) with check (public.is_developer_admin());
create policy rooms_admin_manage on public.rooms for all using (public.is_developer_admin()) with check (public.is_developer_admin());
create policy nodes_admin_manage on public.navigation_nodes for all using (public.is_developer_admin()) with check (public.is_developer_admin());
create policy edges_admin_manage on public.navigation_edges for all using (public.is_developer_admin()) with check (public.is_developer_admin());
create policy restrictions_admin_manage on public.navigation_restrictions for all using (public.is_developer_admin()) with check (public.is_developer_admin());
create policy destinations_admin_manage on public.outdoor_destinations for all using (public.is_developer_admin()) with check (public.is_developer_admin());
