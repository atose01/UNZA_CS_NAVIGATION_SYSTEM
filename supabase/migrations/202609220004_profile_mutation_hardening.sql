-- Prevent client-side profile updates from changing account identity or
-- bypassing the temporary-password workflow.

create or replace function public.prevent_protected_profile_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() <> 'service_role' and not public.is_developer_admin() then
    if old.computer_id is distinct from new.computer_id then
      raise exception 'Only a trusted provisioning workflow can change a computer number';
    end if;

    if old.password_change_required is distinct from new.password_change_required
      and current_setting('app.allow_password_change', true) is distinct from 'true' then
      raise exception 'Use the password-change workflow to update temporary-password status';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_protected_profile_changes on public.profiles;
create trigger prevent_protected_profile_changes
  before update on public.profiles
  for each row execute function public.prevent_protected_profile_changes();

create or replace function public.mark_password_changed()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('app.allow_password_change', 'true', true);
  update public.profiles
  set password_change_required = false
  where id = auth.uid();
end;
$$;

revoke all on function public.mark_password_changed() from public;
grant execute on function public.mark_password_changed() to authenticated;
