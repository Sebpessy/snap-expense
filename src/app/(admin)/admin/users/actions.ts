"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false as const, error: "Not authenticated" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { authorized: false as const, error: "Not authorized" };
  }

  return { authorized: true as const };
}

export async function extendTrialAction(userId: string, days: number) {
  const auth = await requireAdmin();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  if (days < 1 || days > 365) {
    return { success: false, error: "Days must be between 1 and 365" };
  }

  const supabase = createAdminClient();

  // Use raw SQL via rpc or manual calculation
  // First get current trial_ends_at
  const { data: profile } = await supabase
    .from("profiles")
    .select("trial_ends_at")
    .eq("id", userId)
    .single();

  if (!profile) {
    return { success: false, error: "User not found" };
  }

  // Calculate new trial end: greatest(trial_ends_at, now()) + days
  const now = new Date();
  const currentEnd = profile.trial_ends_at
    ? new Date(profile.trial_ends_at)
    : now;
  const base = currentEnd > now ? currentEnd : now;
  const newEnd = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

  const { error } = await supabase
    .from("profiles")
    .update({ trial_ends_at: newEnd.toISOString() })
    .eq("id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

export async function changePlanAction(userId: string, plan: string) {
  const auth = await requireAdmin();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  const supabase = createAdminClient();

  // Validate the plan code exists and is active
  const { data: planRow, error: planErr } = await supabase
    .from("plans")
    .select("code, is_active")
    .eq("code", plan)
    .single();
  if (planErr || !planRow) {
    return { success: false, error: "Unknown plan" };
  }
  if (!planRow.is_active) {
    return { success: false, error: "Plan is not active" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ plan })
    .eq("id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/users");
  return { success: true };
}
