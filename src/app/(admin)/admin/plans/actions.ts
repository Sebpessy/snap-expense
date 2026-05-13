"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type ActionResult = { success: true } | { success: false; error: string };

async function requireAdmin(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "Not signed in";

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "admin") return "Forbidden";
  return null;
}

type PlanInput = {
  code: string;
  name: string;
  description: string;
  monthly_price_cents: number | null;
  scans_per_month: number | null;
  history_days: number | null;
  is_active: boolean;
  sort_order: number;
};

function parseFormData(formData: FormData): { input: PlanInput; error: string | null } {
  const code = (formData.get("code") as string | null)?.trim().toLowerCase() ?? "";
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const description = (formData.get("description") as string | null)?.trim() ?? "";

  const priceStr = (formData.get("monthly_price_cents") as string | null)?.trim() ?? "";
  const scansStr = (formData.get("scans_per_month") as string | null)?.trim() ?? "";
  const historyStr = (formData.get("history_days") as string | null)?.trim() ?? "";
  const sortStr = (formData.get("sort_order") as string | null)?.trim() ?? "0";

  const is_active = formData.get("is_active") === "on" || formData.get("is_active") === "true";

  if (!code) return { input: null as unknown as PlanInput, error: "Code is required" };
  if (!/^[a-z][a-z0-9_]*$/.test(code)) {
    return {
      input: null as unknown as PlanInput,
      error: "Code must start with a letter and contain only lowercase letters, digits, and underscores",
    };
  }
  if (!name) return { input: null as unknown as PlanInput, error: "Name is required" };

  const parseOptionalInt = (s: string, label: string): { value: number | null; error: string | null } => {
    if (s === "") return { value: null, error: null };
    const n = Number(s);
    if (!Number.isInteger(n) || n < 0) return { value: null, error: `${label} must be a non-negative integer` };
    return { value: n, error: null };
  };

  const price = parseOptionalInt(priceStr, "Monthly price");
  if (price.error) return { input: null as unknown as PlanInput, error: price.error };
  const scans = parseOptionalInt(scansStr, "Scans per month");
  if (scans.error) return { input: null as unknown as PlanInput, error: scans.error };
  const history = parseOptionalInt(historyStr, "History days");
  if (history.error) return { input: null as unknown as PlanInput, error: history.error };
  const sort = parseOptionalInt(sortStr, "Sort order");
  if (sort.error) return { input: null as unknown as PlanInput, error: sort.error };

  return {
    input: {
      code,
      name,
      description,
      monthly_price_cents: price.value,
      scans_per_month: scans.value,
      history_days: history.value,
      is_active,
      sort_order: sort.value ?? 0,
    },
    error: null,
  };
}

export async function createPlanAction(formData: FormData): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return { success: false, error: authError };

  const { input, error } = parseFormData(formData);
  if (error) return { success: false, error };

  const supabase = createAdminClient();
  const { error: dbError } = await supabase.from("plans").insert({
    code: input.code,
    name: input.name,
    description: input.description || null,
    monthly_price_cents: input.monthly_price_cents,
    scans_per_month: input.scans_per_month,
    history_days: input.history_days,
    is_active: input.is_active,
    sort_order: input.sort_order,
  });

  if (dbError) {
    if (dbError.code === "23505") return { success: false, error: `A plan with code "${input.code}" already exists` };
    return { success: false, error: dbError.message };
  }

  revalidatePath("/admin/plans");
  return { success: true };
}

export async function updatePlanAction(planId: string, formData: FormData): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return { success: false, error: authError };

  const { input, error } = parseFormData(formData);
  if (error) return { success: false, error };

  const supabase = createAdminClient();

  // Block deactivating a plan that still has users assigned
  if (!input.is_active) {
    const { data: current } = await supabase
      .from("plans")
      .select("code, is_active")
      .eq("id", planId)
      .single();

    if (current && current.is_active) {
      if (current.code === "free") {
        return { success: false, error: "The free plan cannot be deactivated" };
      }
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("plan", current.code);
      if ((count ?? 0) > 0) {
        return {
          success: false,
          error: `${count} user(s) are still on this plan. Move them off first, then deactivate.`,
        };
      }
    }
  }

  const { error: dbError } = await supabase
    .from("plans")
    .update({
      code: input.code,
      name: input.name,
      description: input.description || null,
      monthly_price_cents: input.monthly_price_cents,
      scans_per_month: input.scans_per_month,
      history_days: input.history_days,
      is_active: input.is_active,
      sort_order: input.sort_order,
    })
    .eq("id", planId);

  if (dbError) {
    if (dbError.code === "23505") return { success: false, error: `A plan with code "${input.code}" already exists` };
    return { success: false, error: dbError.message };
  }

  revalidatePath("/admin/plans");
  revalidatePath("/admin");
  revalidatePath("/admin/users");
  return { success: true };
}

export async function deletePlanAction(planId: string): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return { success: false, error: authError };

  const supabase = createAdminClient();
  const { data: plan } = await supabase
    .from("plans")
    .select("code")
    .eq("id", planId)
    .single();

  if (!plan) return { success: false, error: "Plan not found" };
  if (plan.code === "free") return { success: false, error: "The free plan cannot be deleted" };

  const { count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("plan", plan.code);
  if ((count ?? 0) > 0) {
    return {
      success: false,
      error: `${count} user(s) are still on this plan. Move them off first, then delete.`,
    };
  }

  const { error: dbError } = await supabase.from("plans").delete().eq("id", planId);
  if (dbError) return { success: false, error: dbError.message };

  revalidatePath("/admin/plans");
  revalidatePath("/admin");
  revalidatePath("/admin/users");
  return { success: true };
}
