import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/plans";
import { type Expense } from "@/lib/types";
import { signReceiptUrls } from "@/lib/signed-url";
import { ExpensesClient } from "./expenses-client";

export default async function ExpensesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [expensesResult, profileResult, projectsResult] = await Promise.all([
    supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .order("expense_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select(
        "plan, trial_ends_at, scan_count_this_period, scan_period_start, encrypted_anthropic_key",
      )
      .eq("id", user.id)
      .single(),
    supabase.from("projects").select("id, name").eq("user_id", user.id),
  ]);

  const expenses: Expense[] = expensesResult.data ?? [];
  const projectNamesById = Object.fromEntries(
    (projectsResult.data ?? []).map((p) => [p.id as string, p.name as string]),
  );

  // Batch-sign receipt URLs for visible expenses
  const signedUrls = await signReceiptUrls(expenses.map((e) => e.receipt_path));
  const thumbUrls = Object.fromEntries(
    expenses.map((e, i) => [e.id, signedUrls[i]] as const),
  );

  const userPlan = profileResult.data
    ? await getUserPlan(profileResult.data, user.id)
    : {
        plan: "free",
        planName: "Free",
        trialActive: false,
        trialEndsAt: null,
        scanCount: 0,
        scanLimit: 15,
        canScan: true,
        hasApiKey: false,
      };

  return (
    <ExpensesClient
      expenses={expenses}
      userPlan={userPlan}
      thumbUrls={thumbUrls}
      projectNamesById={projectNamesById}
    />
  );
}
