-- Admin backend foundation for the Docusaurus site.
-- Run this file manually in Supabase Dashboard > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_key text not null,
  section_key text not null,
  title text not null,
  content text not null default '',
  config jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  visible boolean not null default true,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_key, section_key)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  report_date date not null,
  description text not null default '',
  file_path text,
  cover_path text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  resource_type text not null check (resource_type in ('paper', 'dataset', 'github', 'tutorial')),
  description text not null default '',
  external_url text not null,
  tags text[] not null default '{}'::text[],
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  storage_path text not null unique,
  file_type text not null,
  file_size bigint not null check (file_size >= 0 and file_size <= 26214400),
  related_type text,
  related_id uuid,
  description text not null default '',
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists page_sections_page_sort_idx on public.page_sections (page_key, sort_order);
create index if not exists reports_date_idx on public.reports (report_date desc);
create index if not exists resources_type_idx on public.resources (resource_type);
create index if not exists files_related_idx on public.files (related_type, related_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists page_sections_set_updated_at on public.page_sections;
create trigger page_sections_set_updated_at
before update on public.page_sections
for each row execute function public.set_updated_at();

drop trigger if exists reports_set_updated_at on public.reports;
create trigger reports_set_updated_at
before update on public.reports
for each row execute function public.set_updated_at();

drop trigger if exists resources_set_updated_at on public.resources;
create trigger resources_set_updated_at
before update on public.resources
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.admin_users enable row level security;
alter table public.page_sections enable row level security;
alter table public.reports enable row level security;
alter table public.resources enable row level security;
alter table public.files enable row level security;

drop policy if exists "Admins can read admin users" on public.admin_users;
create policy "Admins can read admin users"
on public.admin_users for select to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert admin users" on public.admin_users;
create policy "Admins can insert admin users"
on public.admin_users for insert to authenticated
with check (public.is_admin());

drop policy if exists "Admins can delete admin users" on public.admin_users;
create policy "Admins can delete admin users"
on public.admin_users for delete to authenticated
using (public.is_admin());

drop policy if exists "Public can read published page sections" on public.page_sections;
create policy "Public can read published page sections"
on public.page_sections for select to anon, authenticated
using (published = true);

drop policy if exists "Admins manage page sections" on public.page_sections;
create policy "Admins manage page sections"
on public.page_sections for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read published reports" on public.reports;
create policy "Public can read published reports"
on public.reports for select to anon, authenticated
using (published = true);

drop policy if exists "Admins manage reports" on public.reports;
create policy "Admins manage reports"
on public.reports for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read published resources" on public.resources;
create policy "Public can read published resources"
on public.resources for select to anon, authenticated
using (published = true);

drop policy if exists "Admins manage resources" on public.resources;
create policy "Admins manage resources"
on public.resources for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read published file records" on public.files;
create policy "Public can read published file records"
on public.files for select to anon, authenticated
using (published = true);

drop policy if exists "Admins manage file records" on public.files;
create policy "Admins manage file records"
on public.files for all to authenticated
using (public.is_admin())
with check (public.is_admin());

grant usage on schema public to anon, authenticated;
grant select on public.page_sections, public.reports, public.resources, public.files to anon, authenticated;
grant select, insert, update, delete on public.admin_users to authenticated;
grant insert, update, delete on public.page_sections, public.reports, public.resources, public.files to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-assets',
  'site-assets',
  true,
  26214400,
  array[
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'text/plain',
    'text/markdown'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read site assets" on storage.objects;
create policy "Public can read site assets"
on storage.objects for select to public
using (bucket_id = 'site-assets');

drop policy if exists "Admins can upload site assets" on storage.objects;
create policy "Admins can upload site assets"
on storage.objects for insert to authenticated
with check (bucket_id = 'site-assets' and public.is_admin());

drop policy if exists "Admins can replace site assets" on storage.objects;
create policy "Admins can replace site assets"
on storage.objects for update to authenticated
using (bucket_id = 'site-assets' and public.is_admin())
with check (bucket_id = 'site-assets' and public.is_admin());

drop policy if exists "Admins can delete site assets" on storage.objects;
create policy "Admins can delete site assets"
on storage.objects for delete to authenticated
using (bucket_id = 'site-assets' and public.is_admin());

-- Bootstrap the first administrator manually after replacing the UUID:
-- insert into public.admin_users (user_id) values ('YOUR_AUTH_USER_UUID');
