-- ═══════════════════════════════════════════════════════
-- PROJECTS — allocate expenses to a specific job/project
-- ═══════════════════════════════════════════════════════
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  normalized_name text generated always as (lower(trim(name))) stored,
  client_name text,
  -- Google Places fields
  formatted_address text,
  place_id text,
  lat double precision,
  lng double precision,
  notes text,
  status text not null default 'active'
    check (status in ('active','completed','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, normalized_name)
);

create index if not exists projects_user_status_idx on public.projects(user_id, status);

drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at
  before update on public.projects
  for each row execute function public.touch_updated_at();

alter table public.projects enable row level security;

drop policy if exists "own projects select" on public.projects;
create policy "own projects select" on public.projects
  for select using (auth.uid() = user_id);

drop policy if exists "own projects insert" on public.projects;
create policy "own projects insert" on public.projects
  for insert with check (auth.uid() = user_id);

drop policy if exists "own projects update" on public.projects;
create policy "own projects update" on public.projects
  for update using (auth.uid() = user_id);

drop policy if exists "own projects delete" on public.projects;
create policy "own projects delete" on public.projects
  for delete using (auth.uid() = user_id);

-- Link expenses → projects (nullable, set null on delete to preserve history)
alter table public.expenses add column if not exists project_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'expenses_project_id_fkey'
  ) then
    alter table public.expenses
      add constraint expenses_project_id_fkey
      foreign key (project_id) references public.projects(id) on delete set null;
  end if;
end $$;

create index if not exists expenses_project_idx on public.expenses(project_id);
