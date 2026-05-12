-- Enable pgcrypto for API key encryption
create extension if not exists pgcrypto;

-- ═══════════════════════════════════════════════════════
-- PROFILES
-- ═══════════════════════════════════════════════════════
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  default_currency text not null default 'USD',
  role text not null default 'user',
  encrypted_anthropic_key text,
  stripe_customer_id text,
  plan text not null default 'free',
  trial_ends_at timestamptz,
  scan_count_this_period integer not null default 0,
  scan_period_start date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- SECURITY DEFINER helper to check admin role — avoids RLS recursion when
-- admin policies on profiles reference profiles.
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

-- Users can read their own profile (but NOT the encrypted_anthropic_key via RLS —
-- we use a security definer function for that)
create policy "profiles self read" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles self update" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles self insert" on public.profiles
  for insert with check (auth.uid() = id);

-- Admin can read all profiles
create policy "admin read all profiles" on public.profiles
  for select using (public.is_admin());
create policy "admin update all profiles" on public.profiles
  for update using (public.is_admin());

-- Auto-create profile on signup with 14-day trial
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, trial_ends_at, scan_period_start)
  values (new.id, new.email, now() + interval '14 days', current_date)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Function to check if user has API key (without exposing it)
create or replace function public.has_anthropic_key(user_uuid uuid)
returns boolean language sql security definer stable as $$
  select encrypted_anthropic_key is not null
  from public.profiles where id = user_uuid;
$$;

-- Function to get decrypted API key (server-side only, via service role)
create or replace function public.get_decrypted_key(user_uuid uuid, secret text)
returns text language sql security definer stable as $$
  select pgp_sym_decrypt(encrypted_anthropic_key::bytea, secret)
  from public.profiles where id = user_uuid and encrypted_anthropic_key is not null;
$$;

-- Function to set encrypted API key
create or replace function public.set_encrypted_key(user_uuid uuid, api_key text, secret text)
returns void language sql security definer as $$
  update public.profiles
  set encrypted_anthropic_key = pgp_sym_encrypt(api_key, secret),
      updated_at = now()
  where id = user_uuid;
$$;

-- ═══════════════════════════════════════════════════════
-- EXPENSES
-- ═══════════════════════════════════════════════════════
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

create index if not exists expenses_user_date_idx on public.expenses (user_id, expense_date desc nulls last);
create index if not exists expenses_user_category_idx on public.expenses (user_id, category_code);

alter table public.expenses enable row level security;

create policy "expenses owner select" on public.expenses for select using (auth.uid() = user_id);
create policy "expenses owner insert" on public.expenses for insert with check (auth.uid() = user_id);
create policy "expenses owner update" on public.expenses for update using (auth.uid() = user_id);
create policy "expenses owner delete" on public.expenses for delete using (auth.uid() = user_id);

-- Admin can read all expenses
create policy "admin read all expenses" on public.expenses
  for select using (public.is_admin());

-- Auto-update updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger expenses_touch before update on public.expenses
  for each row execute function public.touch_updated_at();

-- ═══════════════════════════════════════════════════════
-- SUBSCRIPTIONS
-- ═══════════════════════════════════════════════════════
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_subscription_id text unique,
  stripe_price_id text,
  status text not null,
  plan text not null,
  quantity integer default 1,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_idx on public.subscriptions (user_id);
create index if not exists subscriptions_stripe_idx on public.subscriptions (stripe_subscription_id);

alter table public.subscriptions enable row level security;

create policy "subscriptions owner select" on public.subscriptions
  for select using (auth.uid() = user_id);
create policy "admin read all subscriptions" on public.subscriptions
  for select using (public.is_admin());

create trigger subscriptions_touch before update on public.subscriptions
  for each row execute function public.touch_updated_at();

-- ═══════════════════════════════════════════════════════
-- WEBHOOK EVENTS (admin log)
-- ═══════════════════════════════════════════════════════
create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text unique not null,
  event_type text not null,
  payload jsonb,
  processed boolean not null default true,
  error_message text,
  processed_at timestamptz not null default now()
);

alter table public.webhook_events enable row level security;

create policy "admin read webhook events" on public.webhook_events
  for select using (public.is_admin());

-- ═══════════════════════════════════════════════════════
-- STORAGE: private receipts bucket
-- ═══════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

create policy "receipts owner read" on storage.objects for select
  using (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "receipts owner insert" on storage.objects for insert
  with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "receipts owner delete" on storage.objects for delete
  using (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);
