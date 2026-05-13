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

export async function getUserPlan(profile: {
  plan: string;
  trial_ends_at: string | null;
  scan_count_this_period: number;
  encrypted_anthropic_key: string | null;
}): Promise<UserPlan> {
  const plansByCode = await getPlansByCode();
  const planCode = profile.plan || "free";
  const planRow = plansByCode[planCode] ?? plansByCode.free ?? FALLBACK_FREE;
  const trialActive = profile.trial_ends_at
    ? new Date(profile.trial_ends_at) > new Date()
    : false;
  const effective =
    trialActive && planCode === "free"
      ? plansByCode.pro ?? planRow
      : planRow;
  const scanLimit = effective.scans_per_month;
  const canScan =
    scanLimit === null || profile.scan_count_this_period < scanLimit;

  return {
    plan: planCode,
    planName: planRow.name,
    trialActive,
    trialEndsAt: profile.trial_ends_at,
    scanCount: profile.scan_count_this_period,
    scanLimit,
    canScan,
    hasApiKey: profile.encrypted_anthropic_key !== null,
  };
}
