"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateExpenseAction(id: string, formData: FormData) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from("expenses")
      .select("id, user_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!existing) {
      return { success: false, error: "Expense not found" };
    }

    const amountStr = formData.get("amount") as string;
    const amountCents = amountStr
      ? Math.round(parseFloat(amountStr) * 100)
      : null;

    const { error } = await supabase
      .from("expenses")
      .update({
        merchant: (formData.get("merchant") as string) || null,
        amount_cents: amountCents,
        expense_date: (formData.get("expense_date") as string) || null,
        category_code: (formData.get("category_code") as string) || null,
        business_purpose: (formData.get("business_purpose") as string) || null,
        notes: (formData.get("notes") as string) || null,
        is_business: formData.get("is_business") === "true",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw new Error(error.message);

    revalidatePath("/expenses");
    revalidatePath(`/expense/${id}`);

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function deleteExpenseAction(id: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Fetch expense to get receipt_path before deleting
    const { data: expense } = await supabase
      .from("expenses")
      .select("id, user_id, receipt_path")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!expense) {
      return { success: false, error: "Expense not found" };
    }

    // Delete receipt from storage if present
    if (expense.receipt_path) {
      await supabase.storage.from("receipts").remove([expense.receipt_path]);
    }

    // Delete expense row
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw new Error(error.message);

    revalidatePath("/expenses");

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
