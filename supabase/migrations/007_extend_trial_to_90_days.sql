-- Extend new-signup Pro trial from 14 days to 90 days for the
-- investor-builders launch campaign.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, trial_ends_at, scan_period_start)
  values (new.id, new.email, now() + interval '90 days', current_date)
  on conflict (id) do nothing;
  return new;
end;
$$;
