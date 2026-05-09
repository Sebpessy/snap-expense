import type { UserPlan } from "./types";

export const PLAN_LIMITS = {
  free: { scansPerMonth: 15, historyDays: 90 },
  pro: { scansPerMonth: null, historyDays: null },
  business: { scansPerMonth: null, historyDays: null },
} as const;

export const PLAN_PRICES = {
  pro: { monthly: 999, label: "$9.99/mo" },
  business: { monthly: 699, label: "$6.99/user/mo" },
} as const;

export function getUserPlan(profile: {
  plan: string;
  trial_ends_at: string | null;
  scan_count_this_period: number;
  encrypted_anthropic_key: string | null;
}): UserPlan {
  const plan = (profile.plan as "free" | "pro" | "business") || "free";
  const trialActive = profile.trial_ends_at
    ? new Date(profile.trial_ends_at) > new Date()
    : false;
  const effectivePlan = trialActive && plan === "free" ? "pro" : plan;
  const limits = PLAN_LIMITS[effectivePlan];
  const scanLimit = limits.scansPerMonth;
  const canScan =
    scanLimit === null || profile.scan_count_this_period < scanLimit;

  return {
    plan,
    trialActive,
    trialEndsAt: profile.trial_ends_at,
    scanCount: profile.scan_count_this_period,
    scanLimit,
    canScan,
    hasApiKey: profile.encrypted_anthropic_key !== null,
  };
}
