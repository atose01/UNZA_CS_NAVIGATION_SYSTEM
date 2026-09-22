-- The protected provisioning Edge Function uses the service role to assign
-- developer_admin to the two initial development accounts. Normal clients
-- must still be unable to change account roles.
create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role is distinct from new.role
    and auth.role() <> 'service_role'
    and not public.is_developer_admin() then
    raise exception 'Only a developer administrator can change account roles';
  end if;
  return new;
end;
$$;
