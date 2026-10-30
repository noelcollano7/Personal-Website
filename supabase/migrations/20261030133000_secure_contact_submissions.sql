revoke insert on table public.contact_messages from public, anon, authenticated;
grant insert on table public.contact_messages to service_role;

drop policy if exists "Public can submit contact messages" on public.contact_messages;

create table if not exists public.contact_submission_attempts (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_submission_attempts enable row level security;
revoke all on table public.contact_submission_attempts from public, anon, authenticated;
grant all on table public.contact_submission_attempts to service_role;
grant usage, select on sequence public.contact_submission_attempts_id_seq to service_role;

create or replace function public.consume_contact_rate_limit(p_ip_hash text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  attempt_count integer;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_ip_hash));

  delete from public.contact_submission_attempts
  where created_at < pg_catalog.now() - interval '1 day';

  select count(*)::integer
  into attempt_count
  from public.contact_submission_attempts
  where ip_hash = p_ip_hash
    and created_at > pg_catalog.now() - interval '1 hour';

  if attempt_count >= 5 then
    return false;
  end if;

  insert into public.contact_submission_attempts (ip_hash) values (p_ip_hash);
  return true;
end;
$$;

revoke all on function public.consume_contact_rate_limit(text) from public, anon, authenticated;
grant execute on function public.consume_contact_rate_limit(text) to service_role;
