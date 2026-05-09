import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type Expense } from "@/lib/types";
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

  const { data: expense } = await supabase
    .from("expenses")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!expense) redirect("/expenses");

  // Get signed URL for receipt image if present
  let receiptUrl: string | null = null;
  if ((expense as Expense).receipt_path) {
    const { data: signedData } = await supabase.storage
      .from("receipts")
      .createSignedUrl((expense as Expense).receipt_path!, 60 * 30);
    receiptUrl = signedData?.signedUrl ?? null;
  }

  return (
    <ExpenseDetailClient
      expense={expense as Expense}
      receiptUrl={receiptUrl}
    />
  );
}
