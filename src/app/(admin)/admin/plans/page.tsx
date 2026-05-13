import { createAdminClient } from "@/lib/supabase/admin";
import { PlansClient } from "./plans-client";
import type { Plan } from "@/lib/types";

export default async function AdminPlansPage() {
  const supabase = createAdminClient();

  const [{ data: plans, error }, { data: profiles }] = await Promise.all([
    supabase
      .from("plans")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase.from("profiles").select("plan"),
  ]);

  if (error) {
    throw new Error(`Failed to load plans: ${error.message}`);
  }

  // Count assigned users per plan code
  const userCountsByCode = new Map<string, number>();
  for (const p of profiles ?? []) {
    const code = (p.plan as string) || "free";
    userCountsByCode.set(code, (userCountsByCode.get(code) ?? 0) + 1);
  }

  const plansWithCounts = (plans ?? []).map((p) => ({
    ...(p as Plan),
    user_count: userCountsByCode.get((p as Plan).code) ?? 0,
  }));

  return <PlansClient initialPlans={plansWithCounts} />;
}
