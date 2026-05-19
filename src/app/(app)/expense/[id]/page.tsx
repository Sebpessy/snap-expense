import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type Expense, type PaymentCard, type Project, type Sub } from "@/lib/types";
import { signReceiptUrl } from "@/lib/signed-url";
import { ExpenseDetailClient } from "./expense-detail-client";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ExpenseDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: expense }, { data: cards }, { data: subs }, { data: projects }] = await Promise.all([
    supabase
      .from("expenses")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("payment_cards")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("subs")
      .select("*")
      .eq("user_id", user.id)
      .neq("status", "blacklisted")
      .order("name"),
    supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("name"),
  ]);

  if (!expense) redirect("/expenses");

  const receiptUrl = await signReceiptUrl((expense as Expense).receipt_path);

  return (
    <ExpenseDetailClient
      expense={expense as Expense}
      receiptUrl={receiptUrl}
      existingCards={(cards ?? []) as PaymentCard[]}
      existingSubs={(subs ?? []) as Sub[]}
      existingProjects={(projects ?? []) as Project[]}
    />
  );
}
