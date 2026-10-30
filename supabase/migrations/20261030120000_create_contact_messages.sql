create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (name = btrim(name) and char_length(name) between 1 and 120),
  email text not null check (
    email = btrim(email)
    and char_length(email) between 3 and 254
    and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  subject text not null check (subject = btrim(subject) and char_length(subject) between 1 and 200),
  message text not null check (message = btrim(message) and char_length(message) between 15 and 5000),
  website text not null default '' check (website = ''),
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

revoke all on table public.contact_messages from public, anon, authenticated;
grant insert on table public.contact_messages to anon, authenticated;

drop policy if exists "Public can submit contact messages" on public.contact_messages;
create policy "Public can submit contact messages"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (
    name = btrim(name)
    and char_length(name) between 1 and 120
    and email = btrim(email)
    and char_length(email) between 3 and 254
    and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    and subject = btrim(subject)
    and char_length(subject) between 1 and 200
    and message = btrim(message)
    and char_length(message) between 15 and 5000
    and website = ''
  );
