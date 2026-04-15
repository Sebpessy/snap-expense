-- Snap Expense — initial schema
-- Run via: supabase db push   (or paste into SQL editor)

-- ────────────────────────────────────────────────────────────────
-- profiles: one row per auth user, created by trigger on signup
-- ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  default_currency text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles self upsert" on public.profiles;
create policy "profiles self upsert"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ────────────────────────────────────────────────────────────────
-- expenses
-- ────────────────────────────────────────────────────────────────
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  merchant text,
  expense_date date,
  amount_cents integer,
  currency text not null default 'USD',
  category_code text,
  category_confidence numeric(4,3),
  business_purpose text,
  is_business boolean not null default true,
  notes text,
  receipt_path text,
  raw_extraction jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists expenses_user_date_idx
  on public.expenses (user_id, expense_date desc nulls last);
create index if not exists expenses_user_category_idx
  on public.expenses (user_id, category_code);

alter table public.expenses enable row level security;

drop policy if exists "expenses owner select" on public.expenses;
create policy "expenses owner select"
  on public.expenses for select
  using (auth.uid() = user_id);

drop policy if exists "expenses owner insert" on public.expenses;
create policy "expenses owner insert"
  on public.expenses for insert
  with check (auth.uid() = user_id);

drop policy if exists "expenses owner update" on public.expenses;
create policy "expenses owner update"
  on public.expenses for update
  using (auth.uid() = user_id);

drop policy if exists "expenses owner delete" on public.expenses;
create policy "expenses owner delete"
  on public.expenses for delete
  using (auth.uid() = user_id);

-- touch updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists expenses_touch on public.expenses;
create trigger expenses_touch
  before update on public.expenses
  for each row execute function public.touch_updated_at();

-- ────────────────────────────────────────────────────────────────
-- storage bucket for receipts (private; access via signed URLs)
-- ────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

-- Users can read/write only inside their own folder: `<uid>/...`
drop policy if exists "receipts owner read" on storage.objects;
create policy "receipts owner read"
  on storage.objects for select
  using (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "receipts owner insert" on storage.objects;
create policy "receipts owner insert"
  on storage.objects for insert
  with check (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "receipts owner delete" on storage.objects;
create policy "receipts owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
