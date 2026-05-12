import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type Sub } from "@/lib/types";
import { SubsClient } from "./subs-client";

export default async function SubsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Subs + YTD spend (business expenses in current calendar year)
  const yearStart = `${new Date().getFullYear()}-01-01`;

  const [{ data: subs }, { data: ytdExpenses }] = await Promise.all([
    supabase
      .from("subs")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true }),
    supabase
      .from("expenses")
      .select("sub_id, amount_cents, expense_date, is_business")
      .eq("user_id", user.id)
      .gte("expense_date", yearStart)
      .not("sub_id", "is", null),
  ]);

  const ytdBySub = new Map<string, number>();
  for (const e of ytdExpenses ?? []) {
    if (!e.sub_id || !e.is_business || e.amount_cents == null) continue;
    ytdBySub.set(e.sub_id, (ytdBySub.get(e.sub_id) ?? 0) + e.amount_cents);
  }

  const subsWithYtd = (subs ?? []).map((s) => ({
    ...(s as Sub),
    ytd_cents: ytdBySub.get((s as Sub).id) ?? 0,
  }));

  return <SubsClient subs={subsWithYtd} />;
}
