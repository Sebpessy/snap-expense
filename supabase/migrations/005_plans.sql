-- ═══════════════════════════════════════════════════════
-- PLANS — admin-managed subscription tiers
-- ═══════════════════════════════════════════════════════
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  code text unique not null check (code ~ '^[a-z][a-z0-9_]*$'),
  name text not null,
  description text,
  monthly_price_cents integer check (monthly_price_cents is null or monthly_price_cents >= 0),
  scans_per_month integer check (scans_per_month is null or scans_per_month >= 0),
  history_days integer check (history_days is null or history_days >= 0),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  stripe_price_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists plans_active_sort_idx on public.plans (is_active, sort_order);

create trigger plans_touch_updated_at
  before update on public.plans
  for each row execute function public.touch_updated_at();

alter table public.plans enable row level security;

-- All authenticated users can read active plans (for the upgrade banner, etc.)
create policy "plans read all" on public.plans
  for select to authenticated using (true);

-- Only admins may insert/update/delete
create policy "plans admin write" on public.plans
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Seed existing hardcoded plans (idempotent on re-run)
insert into public.plans (code, name, description, monthly_price_cents, scans_per_month, history_days, sort_order)
values
  ('free',     'Free',     'Limited free tier — 15 scans/month, 90-day history', null, 15,   90,   0),
  ('pro',      'Pro',      'Unlimited scans and full history',                    999,  null, null, 10),
  ('business', 'Business', 'Per-seat business plan',                              699,  null, null, 20)
on conflict (code) do nothing;
