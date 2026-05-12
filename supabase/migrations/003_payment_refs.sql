-- Extra reference fields for non-card payment methods.
-- check_number: written on Check payments
-- reference_number: Zelle confirmation, wire reference, etc.
alter table public.expenses
  add column if not exists check_number text,
  add column if not exists reference_number text;
