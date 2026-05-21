-- Default new-signup Pro trial is 30 days. The longer 90-day window is now
-- gated behind a separate promo code (handled in app logic, not the trigger).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, trial_ends_at, scan_period_start)
  values (new.id, new.email, now() + interval '30 days', current_date)
  on conflict (id) do nothing;
  return new;
end;
$$;
