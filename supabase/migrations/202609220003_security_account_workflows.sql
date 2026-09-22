-- Account workflow and policy hardening for the existing schema.
-- This migration deliberately keeps unverified lecturer contact fields nullable.

alter table public.profiles
  add column if not exists password_change_required boolean not null default false;

alter table public.lecturers
  add column if not exists specialization text;

alter table public.lecturers
  add column if not exists email_verified boolean not null default false;

alter table public.lecturers alter column email drop not null;
alter table public.lecturers alter column phone drop not null;

create index if not exists lecturers_office_room_idx on public.lecturers (office_room_id);
create index if not exists events_created_by_idx on public.events (created_by, start_date_time);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'lecturers_email_format_check'
      and conrelid = 'public.lecturers'::regclass
  ) then
    alter table public.lecturers
      add constraint lecturers_email_format_check
      check (email is null or email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_computer_id_format_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_computer_id_format_check
      check (computer_id is null or computer_id ~ '^[0-9]{10}$');
  end if;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, password_change_required)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, new.id::text), '@', 1)),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'password_change_required', '') = 'true'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.prevent_lecturer_account_link_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() <> 'service_role'
    and not public.is_developer_admin()
    and (
      old.user_id is distinct from new.user_id
      or old.status is distinct from new.status
    ) then
    raise exception 'Only a developer administrator can change lecturer account linking or status';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_lecturer_account_link_change on public.lecturers;
create trigger prevent_lecturer_account_link_change
  before update on public.lecturers
  for each row execute function public.prevent_lecturer_account_link_change();

create or replace function public.mark_password_changed()
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles
  set password_change_required = false
  where id = auth.uid();
$$;

revoke all on function public.mark_password_changed() from public;
grant execute on function public.mark_password_changed() to authenticated;

-- Recreate policies so this migration is safe to apply after the initial scaffold.
drop policy if exists profiles_self_read on public.profiles;
drop policy if exists profiles_self_update on public.profiles;
drop policy if exists profiles_developer_update on public.profiles;
create policy profiles_self_read on public.profiles
  for select using (id = auth.uid() or public.is_developer_admin());
create policy profiles_self_update on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_developer_update on public.profiles
  for update using (public.is_developer_admin()) with check (public.is_developer_admin());

drop policy if exists lecturers_public_read on public.lecturers;
drop policy if exists lecturers_self_update on public.lecturers;
drop policy if exists lecturers_admin_insert on public.lecturers;
drop policy if exists lecturers_admin_delete on public.lecturers;
create policy lecturers_public_read on public.lecturers
  for select using (status = 'active' or user_id = auth.uid() or public.is_developer_admin());
create policy lecturers_self_update on public.lecturers
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy lecturers_admin_insert on public.lecturers
  for insert with check (public.is_developer_admin());
create policy lecturers_admin_delete on public.lecturers
  for delete using (public.is_developer_admin());

drop policy if exists events_public_read on public.events;
drop policy if exists events_admin_insert on public.events;
drop policy if exists events_admin_update on public.events;
drop policy if exists events_admin_delete on public.events;
create policy events_public_read on public.events
  for select using (status = 'published' and start_date_time >= now() - interval '30 days');
create policy events_lecturer_insert on public.events
  for insert with check (
    public.is_lecturer_admin()
    and created_by = auth.uid()
  );
create policy events_owner_update on public.events
  for update using (created_by = auth.uid())
  with check (created_by = auth.uid());
create policy events_developer_update on public.events
  for update using (public.is_developer_admin())
  with check (public.is_developer_admin());
create policy events_owner_delete on public.events
  for delete using (created_by = auth.uid());
create policy events_developer_delete on public.events
  for delete using (public.is_developer_admin());

-- A lecturer is not a map administrator. Recreate all map-management policies
-- with developer-only write access while leaving public reads intact.
drop policy if exists buildings_admin_manage on public.buildings;
drop policy if exists floors_admin_manage on public.floors;
drop policy if exists rooms_admin_manage on public.rooms;
drop policy if exists nodes_admin_manage on public.navigation_nodes;
drop policy if exists edges_admin_manage on public.navigation_edges;
drop policy if exists restrictions_admin_manage on public.navigation_restrictions;
drop policy if exists destinations_admin_manage on public.outdoor_destinations;
create policy buildings_admin_manage on public.buildings for all using (public.is_developer_admin()) with check (public.is_developer_admin());
create policy floors_admin_manage on public.floors for all using (public.is_developer_admin()) with check (public.is_developer_admin());
create policy rooms_admin_manage on public.rooms for all using (public.is_developer_admin()) with check (public.is_developer_admin());
create policy nodes_admin_manage on public.navigation_nodes for all using (public.is_developer_admin()) with check (public.is_developer_admin());
create policy edges_admin_manage on public.navigation_edges for all using (public.is_developer_admin()) with check (public.is_developer_admin());
create policy restrictions_admin_manage on public.navigation_restrictions for all using (public.is_developer_admin()) with check (public.is_developer_admin());
create policy destinations_admin_manage on public.outdoor_destinations for all using (public.is_developer_admin()) with check (public.is_developer_admin());
