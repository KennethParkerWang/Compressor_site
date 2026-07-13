-- Personal account data for the Docusaurus research workspace.
-- Run this file once in Supabase SQL Editor.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_path text,
  local_import_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_tasks (
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id text not null,
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, task_id)
);

create table if not exists public.user_notes (
  user_id uuid not null references auth.users(id) on delete cascade,
  note_id text not null,
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, note_id)
);

create table if not exists public.user_reading_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  literature_id text not null,
  status text not null default 'unread' check (status in ('unread', 'reading', 'finished', 'paused')),
  progress integer not null default 0 check (progress between 0 and 100),
  last_read_at timestamptz,
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (user_id, literature_id)
);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now()
);

create index if not exists user_tasks_updated_idx on public.user_tasks (user_id, updated_at desc);
create index if not exists user_notes_updated_idx on public.user_notes (user_id, updated_at desc);
create index if not exists user_reading_updated_idx on public.user_reading_state (user_id, updated_at desc);

create or replace function public.set_personal_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_personal_updated_at();

drop trigger if exists user_tasks_set_updated_at on public.user_tasks;
create trigger user_tasks_set_updated_at before update on public.user_tasks
for each row execute function public.set_personal_updated_at();

drop trigger if exists user_notes_set_updated_at on public.user_notes;
create trigger user_notes_set_updated_at before update on public.user_notes
for each row execute function public.set_personal_updated_at();

drop trigger if exists user_reading_set_updated_at on public.user_reading_state;
create trigger user_reading_set_updated_at before update on public.user_reading_state
for each row execute function public.set_personal_updated_at();

drop trigger if exists user_preferences_set_updated_at on public.user_preferences;
create trigger user_preferences_set_updated_at before update on public.user_preferences
for each row execute function public.set_personal_updated_at();

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1), '')
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists create_profile_after_signup on auth.users;
create trigger create_profile_after_signup
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

insert into public.profiles (user_id, display_name)
select
  id,
  coalesce(raw_user_meta_data ->> 'display_name', raw_user_meta_data ->> 'full_name', split_part(email, '@', 1), '')
from auth.users
on conflict (user_id) do nothing;

alter table public.profiles enable row level security;
alter table public.user_tasks enable row level security;
alter table public.user_notes enable row level security;
alter table public.user_reading_state enable row level security;
alter table public.user_preferences enable row level security;

drop policy if exists "Users manage own profile" on public.profiles;
create policy "Users manage own profile" on public.profiles
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own tasks" on public.user_tasks;
create policy "Users manage own tasks" on public.user_tasks
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own notes" on public.user_notes;
create policy "Users manage own notes" on public.user_notes
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own reading state" on public.user_reading_state;
create policy "Users manage own reading state" on public.user_reading_state
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own preferences" on public.user_preferences;
create policy "Users manage own preferences" on public.user_preferences
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.user_tasks to authenticated;
grant select, insert, update, delete on public.user_notes to authenticated;
grant select, insert, update, delete on public.user_reading_state to authenticated;
grant select, insert, update, delete on public.user_preferences to authenticated;

-- Verification helpers. These should all report row_security = true.
select relname, relrowsecurity
from pg_class
where relnamespace = 'public'::regnamespace
  and relname in ('profiles', 'user_tasks', 'user_notes', 'user_reading_state', 'user_preferences')
order by relname;
