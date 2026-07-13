-- Article editor extension for the Docusaurus admin workspace.
-- Run manually in Supabase Dashboard > SQL Editor after admin-backend-setup.sql.

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text not null default '',
  cover_path text,
  body_markdown text not null default '',
  category text not null default '',
  tags text[] not null default '{}'::text[],
  status text not null default 'draft' check (status in ('draft', 'published')),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists articles_published_updated_idx
on public.articles (published, updated_at desc);

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at
before update on public.articles
for each row execute function public.set_updated_at();

alter table public.articles enable row level security;

drop policy if exists "Public can read published articles" on public.articles;
create policy "Public can read published articles"
on public.articles for select to anon, authenticated
using (published = true);

drop policy if exists "Admins manage articles" on public.articles;
create policy "Admins manage articles"
on public.articles for all to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select on public.articles to anon, authenticated;
grant insert, update, delete on public.articles to authenticated;

comment on table public.articles is
'Markdown articles managed by authenticated administrators and read publicly only when published.';
