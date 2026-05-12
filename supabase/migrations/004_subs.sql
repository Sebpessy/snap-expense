-- ═══════════════════════════════════════════════════════
-- SUBCONTRACTORS (a.k.a. subs) — 1099 contractors the user pays
-- ═══════════════════════════════════════════════════════
create table if not exists public.subs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  normalized_name text generated always as (
    lower(regexp_replace(name, '\s+', ' ', 'g'))
  ) stored,
  trade text,
  contact_name text,
  contact_email text,
  contact_phone text,
  tax_id text,
  status text not null default 'active'
    check (status in ('active','inactive','blacklisted')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, normalized_name)
);

create index if not exists subs_user_idx on public.subs (user_id);
create index if not exists subs_status_idx on public.subs (user_id, status);

alter table public.subs enable row level security;

create policy "own subs select" on public.subs
  for select using (auth.uid() = user_id);
create policy "own subs insert" on public.subs
  for insert with check (auth.uid() = user_id);
create policy "own subs update" on public.subs
  for update using (auth.uid() = user_id);
create policy "own subs delete" on public.subs
  for delete using (auth.uid() = user_id);

create trigger subs_touch before update on public.subs
  for each row execute function public.touch_updated_at();

-- ═══════════════════════════════════════════════════════
-- SUB ALIASES — map raw merchant strings (e.g. "JM Plumbing") to a canonical sub
-- ═══════════════════════════════════════════════════════
create table if not exists public.sub_aliases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sub_id uuid not null references public.subs(id) on delete cascade,
  alias text not null,
  alias_normalized text generated always as (
    lower(regexp_replace(alias, '\s+', ' ', 'g'))
  ) stored,
  created_at timestamptz not null default now(),
  unique (user_id, alias_normalized)
);

create index if not exists sub_aliases_user_idx on public.sub_aliases (user_id);
create index if not exists sub_aliases_sub_idx on public.sub_aliases (sub_id);

alter table public.sub_aliases enable row level security;

create policy "own sub_aliases select" on public.sub_aliases
  for select using (auth.uid() = user_id);
create policy "own sub_aliases insert" on public.sub_aliases
  for insert with check (auth.uid() = user_id);
create policy "own sub_aliases update" on public.sub_aliases
  for update using (auth.uid() = user_id);
create policy "own sub_aliases delete" on public.sub_aliases
  for delete using (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════
-- LINK EXPENSES → SUBS
-- ═══════════════════════════════════════════════════════
alter table public.expenses
  add column if not exists sub_id uuid;
alter table public.expenses
  drop constraint if exists expenses_sub_id_fkey;
alter table public.expenses
  add constraint expenses_sub_id_fkey
  foreign key (sub_id) references public.subs(id) on delete set null;

create index if not exists expenses_sub_idx on public.expenses (sub_id);

-- ═══════════════════════════════════════════════════════
-- RESOLVER — given a raw merchant string, return the sub_id (or null)
-- ═══════════════════════════════════════════════════════
create or replace function public.resolve_sub_for_merchant(p_user uuid, p_merchant text)
returns uuid language sql stable security definer set search_path = public as $$
  with norm as (
    select lower(regexp_replace(coalesce(p_merchant, ''), '\s+', ' ', 'g')) as v
  )
  select sub_id
  from public.sub_aliases, norm
  where user_id = p_user and alias_normalized = norm.v
  union all
  select id from public.subs, norm
  where user_id = p_user and normalized_name = norm.v
  limit 1;
$$;
