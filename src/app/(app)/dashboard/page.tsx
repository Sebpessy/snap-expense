import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type Expense } from "@/lib/types";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const now = new Date();
  const yearStart = `${now.getFullYear()}-01-01`;
  const twelveMonthsAgoYear = now.getFullYear() - 1;
  const twelveMonthsAgoMonth = now.getMonth() + 1; // 1-indexed
  const trendStart = `${twelveMonthsAgoYear}-${String(twelveMonthsAgoMonth).padStart(2, "0")}-01`;

  // Pull YTD + 12-month trend window in two parallel queries
  const [{ data: ytdRows }, { data: trendRows }] = await Promise.all([
    supabase
      .from("expenses")
      .select("amount_cents, expense_date, category_code, is_business, merchant, sub_id")
      .eq("user_id", user.id)
      .gte("expense_date", yearStart),
    supabase
      .from("expenses")
      .select("amount_cents, expense_date, is_business")
      .eq("user_id", user.id)
      .gte("expense_date", trendStart),
  ]);

  return (
    <DashboardClient
      ytd={(ytdRows ?? []) as Pick<Expense, "amount_cents" | "expense_date" | "category_code" | "is_business" | "merchant" | "sub_id">[]}
      trend={(trendRows ?? []) as Pick<Expense, "amount_cents" | "expense_date" | "is_business">[]}
    />
  );
}
