"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { canonicalizeMerchant } from "@/lib/merchant-aliases";

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

    // Payment fields
    const ALLOWED_METHODS = ["credit_card","check","zelle","wire","cash","other"];
    const pmRaw = (formData.get("payment_method") as string) || null;
    const paymentMethod = pmRaw && ALLOWED_METHODS.includes(pmRaw) ? pmRaw : null;
    const cardLast4Raw = (formData.get("card_last4") as string) || null;
    const cardLast4 = cardLast4Raw && /^\d{4}$/.test(cardLast4Raw) ? cardLast4Raw : null;
    let cardId = (formData.get("card_id") as string) || null;
    const newCardIsBusiness = formData.get("new_card_is_business") === "true";
    const newCardNickname = (formData.get("new_card_nickname") as string) || null;
    const checkNumber = (formData.get("check_number") as string) || null;
    const referenceNumber = (formData.get("reference_number") as string) || null;
    const subId = (formData.get("sub_id") as string) || null;

    if (paymentMethod === "credit_card" && cardLast4 && !cardId) {
      const { data: existing } = await supabase
        .from("payment_cards")
        .select("id")
        .eq("user_id", user.id)
        .eq("last4", cardLast4)
        .maybeSingle();
      if (existing?.id) {
        cardId = existing.id as string;
      } else {
        const { data: newCard, error: cardErr } = await supabase
          .from("payment_cards")
          .insert({
            user_id: user.id,
            last4: cardLast4,
            nickname: newCardNickname,
            is_business: newCardIsBusiness,
          })
          .select("id")
          .single();
        if (cardErr) throw new Error(`Card create failed: ${cardErr.message}`);
        cardId = newCard.id as string;
      }
    }

    const rawMerchant = (formData.get("merchant") as string) || null;
    const canonicalMerchant = rawMerchant
      ? await canonicalizeMerchant(user.id, rawMerchant)
      : null;

    const { error } = await supabase
      .from("expenses")
      .update({
        merchant: canonicalMerchant,
        amount_cents: amountCents,
        expense_date: (formData.get("expense_date") as string) || null,
        category_code: (formData.get("category_code") as string) || null,
        business_purpose: (formData.get("business_purpose") as string) || null,
        notes: (formData.get("notes") as string) || null,
        is_business: formData.get("is_business") === "true",
        payment_method: paymentMethod,
        card_last4: paymentMethod === "credit_card" ? cardLast4 : null,
        card_id: paymentMethod === "credit_card" ? cardId : null,
        check_number: paymentMethod === "check" ? checkNumber : null,
        reference_number:
          paymentMethod === "zelle" || paymentMethod === "wire"
            ? referenceNumber
            : null,
        sub_id: subId,
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
