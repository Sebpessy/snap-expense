import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Plan, UserPlan } from "./types";

const FALLBACK_FREE: Plan = {
  id: "fallback-free",
  code: "free",
  name: "Free",
  description: null,
  monthly_price_cents: null,
  scans_per_month: 15,
  history_days: 90,
  is_active: true,
  sort_order: 0,
  stripe_price_id: null,
};

export const getAllPlans = cache(async (): Promise<Plan[]> => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error || !data || data.length === 0) return [FALLBACK_FREE];
  return data as Plan[];
});

export const getActivePlans = cache(async (): Promise<Plan[]> => {
  const plans = await getAllPlans();
  return plans.filter((p) => p.is_active);
});

export const getPlansByCode = cache(async (): Promise<Record<string, Plan>> => {
  const plans = await getAllPlans();
  return Object.fromEntries(plans.map((p) => [p.code, p]));
});

export async function getUserPlan(
  profile: {
    plan: string;
    trial_ends_at: string | null;
    scan_count_this_period: number;
    scan_period_start: string | null;
    encrypted_anthropic_key: string | null;
  },
  userId?: string,
): Promise<UserPlan> {
  const plansByCode = await getPlansByCode();
  const planCode = profile.plan || "free";
  const planRow = plansByCode[planCode] ?? plansByCode.free ?? FALLBACK_FREE;
  // Trial only applies to free users — once they've paid, the trial concept
  // is moot even if trial_ends_at is still in the future.
  const trialActive =
    planCode === "free" &&
    !!profile.trial_ends_at &&
    new Date(profile.trial_ends_at) > new Date();
  const effective =
    trialActive && planCode === "free"
      ? plansByCode.pro ?? planRow
      : planRow;
  const scanLimit = effective.scans_per_month;

  // Roll over the scan counter if the 30-day period has elapsed.
  // Without this, free users get permanently stuck at the scan limit.
  let scanCount = profile.scan_count_this_period;
  const today = new Date();
  const periodStart = profile.scan_period_start
    ? new Date(profile.scan_period_start)
    : null;
  const msInDay = 1000 * 60 * 60 * 24;
  const periodExpired =
    !periodStart ||
    (today.getTime() - periodStart.getTime()) / msInDay >= 30;

  if (periodExpired && userId) {
    const todayDate = today.toISOString().slice(0, 10);
    const admin = createAdminClient();
    await admin
      .from("profiles")
      .update({ scan_count_this_period: 0, scan_period_start: todayDate })
      .eq("id", userId);
    scanCount = 0;
  }

  const canScan = scanLimit === null || scanCount < scanLimit;

  return {
    plan: planCode,
    planName: planRow.name,
    trialActive,
    trialEndsAt: profile.trial_ends_at,
    scanCount,
    scanLimit,
    canScan,
    hasApiKey: profile.encrypted_anthropic_key !== null,
  };
}
