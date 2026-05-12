-- ═══════════════════════════════════════════════════════
-- PER-EXPENSE PAYMENT FIELDS
-- ═══════════════════════════════════════════════════════
alter table public.expenses
  add column if not exists payment_method text
    check (payment_method in ('credit_card','check','zelle','wire','cash','other')),
  add column if not exists card_last4 text check (card_last4 ~ '^[0-9]{4}$'),
  add column if not exists card_id uuid;

-- ═══════════════════════════════════════════════════════
-- PAYMENT CARDS (one row per CC the user uses)
-- ═══════════════════════════════════════════════════════
create table if not exists public.payment_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  last4 text not null check (last4 ~ '^[0-9]{4}$'),
  nickname text,
  is_business boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, last4)
);

create index if not exists payment_cards_user_idx on public.payment_cards (user_id);

-- Wire expenses.card_id → payment_cards.id (set null on card delete so history survives)
alter table public.expenses
  drop constraint if exists expenses_card_id_fkey;
alter table public.expenses
  add constraint expenses_card_id_fkey
  foreign key (card_id) references public.payment_cards(id) on delete set null;

alter table public.payment_cards enable row level security;

create policy "own cards select" on public.payment_cards
  for select using (auth.uid() = user_id);
create policy "own cards insert" on public.payment_cards
  for insert with check (auth.uid() = user_id);
create policy "own cards update" on public.payment_cards
  for update using (auth.uid() = user_id);
create policy "own cards delete" on public.payment_cards
  for delete using (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════
-- MERCHANT ALIASES (canonicalize merchant names)
-- user_id null = global rule (admin-seeded). Per-user rules override globals.
-- ═══════════════════════════════════════════════════════
create table if not exists public.merchant_aliases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  pattern text not null,
  canonical text not null,
  created_at timestamptz not null default now()
);

create index if not exists merchant_aliases_user_idx on public.merchant_aliases (user_id);

alter table public.merchant_aliases enable row level security;

create policy "global or own aliases read" on public.merchant_aliases
  for select using (user_id is null or auth.uid() = user_id);
create policy "own aliases insert" on public.merchant_aliases
  for insert with check (auth.uid() = user_id);
create policy "own aliases update" on public.merchant_aliases
  for update using (auth.uid() = user_id);
create policy "own aliases delete" on public.merchant_aliases
  for delete using (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════
-- CATEGORY REQUESTS (user-suggested categories awaiting admin review)
-- ═══════════════════════════════════════════════════════
create table if not exists public.category_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  requested_label text not null,
  suggested_schedule_c_line text,
  status text not null default 'pending'
    check (status in ('pending','approved','rejected')),
  admin_response text,
  created_at timestamptz not null default now()
);

create index if not exists category_requests_user_idx on public.category_requests (user_id);
create index if not exists category_requests_status_idx on public.category_requests (status);

alter table public.category_requests enable row level security;

create policy "own requests select" on public.category_requests
  for select using (auth.uid() = user_id);
create policy "own requests insert" on public.category_requests
  for insert with check (auth.uid() = user_id);
create policy "admin read all category requests" on public.category_requests
  for select using (public.is_admin());
create policy "admin update category requests" on public.category_requests
  for update using (public.is_admin());

-- ═══════════════════════════════════════════════════════
-- DEDUP INDEX (warn on near-duplicate expense entries)
-- ═══════════════════════════════════════════════════════
create index if not exists expenses_dedup_idx
  on public.expenses (user_id, expense_date, amount_cents, merchant);
