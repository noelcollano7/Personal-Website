create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  description text not null default '' check (char_length(description) <= 5000),
  youtube_url text not null,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.videos enable row level security;

grant select on table public.videos to anon, authenticated;
revoke insert, update, delete on table public.videos from anon;
grant insert, update, delete on table public.videos to authenticated;

drop policy if exists "Public can read published videos" on public.videos;
create policy "Public can read published videos"
  on public.videos
  for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "Owners can read their videos" on public.videos;
create policy "Owners can read their videos"
  on public.videos
  for select
  to authenticated
  using (owner_id = auth.uid());

drop policy if exists "Owners can insert videos" on public.videos;
create policy "Owners can insert videos"
  on public.videos
  for insert
  to authenticated
  with check (owner_id = auth.uid());

drop policy if exists "Owners can update videos" on public.videos;
create policy "Owners can update videos"
  on public.videos
  for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "Owners can delete videos" on public.videos;
create policy "Owners can delete videos"
  on public.videos
  for delete
  to authenticated
  using (owner_id = auth.uid());

create index if not exists videos_published_at_idx
  on public.videos (published_at desc)
  where is_published = true;

create or replace function public.set_videos_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_videos_updated_at on public.videos;
create trigger set_videos_updated_at
  before update on public.videos
  for each row execute function public.set_videos_updated_at();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'videos'
  ) THEN
    ALTER PUBLICATION supabase_realtime
    ADD TABLE public.videos;
  END IF;
END;
$$;
