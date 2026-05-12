import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type Sub, type SubAlias, type Expense } from "@/lib/types";
import { SubDetailClient } from "./sub-detail-client";

type Props = { params: Promise<{ id: string }> };

export default async function SubDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const yearStart = `${new Date().getFullYear()}-01-01`;

  const [{ data: sub }, { data: aliases }, { data: expenses }] = await Promise.all([
    supabase
      .from("subs")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("sub_aliases")
      .select("*")
      .eq("sub_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .eq("sub_id", id)
      .order("expense_date", { ascending: false, nullsFirst: false }),
  ]);

  if (!sub) redirect("/settings/subs");

  const ytdCents = (expenses ?? [])
    .filter(
      (e) =>
        e.is_business &&
        e.amount_cents != null &&
        e.expense_date &&
        e.expense_date >= yearStart,
    )
    .reduce((sum, e) => sum + (e.amount_cents ?? 0), 0);

  const lifetimeCents = (expenses ?? [])
    .filter((e) => e.is_business && e.amount_cents != null)
    .reduce((sum, e) => sum + (e.amount_cents ?? 0), 0);

  return (
    <SubDetailClient
      sub={sub as Sub}
      aliases={(aliases ?? []) as SubAlias[]}
      expenses={(expenses ?? []) as Expense[]}
      ytdCents={ytdCents}
      lifetimeCents={lifetimeCents}
    />
  );
}
