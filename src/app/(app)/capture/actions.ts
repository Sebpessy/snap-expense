"use server";

import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/plans";
import { extractReceiptWithUserKey } from "@/lib/extract";
import { canonicalizeMerchant } from "@/lib/merchant-aliases";
import type { ExtractionResult, PaymentMethod } from "@/lib/types";

export async function extractReceiptAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false as const, error: "Not authenticated" };

    const imageFile = formData.get("image") as File | null;
    if (!imageFile) return { success: false as const, error: "No image provided" };

    // Resize image with Sharp
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const resized = await sharp(buffer)
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 70 })
      .toBuffer();

    const imageBase64 = resized.toString("base64");

    // Check plan limits
    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "plan, trial_ends_at, scan_count_this_period, scan_period_start, encrypted_anthropic_key",
      )
      .eq("id", user.id)
      .single();

    if (!profile) return { success: false as const, error: "Profile not found" };

    const userPlan = await getUserPlan(profile, user.id);
    if (!userPlan.canScan) {
      return { success: false as const, error: "scan_limit_reached" };
    }

    // Extract receipt data via Claude
    const extraction = await extractReceiptWithUserKey({
      userId: user.id,
      imageBase64,
      mimeType: "image/jpeg",
    });

    // Increment scan count (userPlan.scanCount reflects any period rollover)
    await supabase
      .from("profiles")
      .update({
        scan_count_this_period: userPlan.scanCount + 1,
      })
      .eq("id", user.id);

    return {
      success: true as const,
      extraction: extraction as ExtractionResult,
    };
  } catch (err) {
    return {
      success: false as const,
      error: (err as Error).message || "Failed to extract receipt",
    };
  }
}

type CommitInput = {
  merchant: string;
  amount_cents: number | null;
  expense_date: string | null;
  category_code: string;
  business_purpose: string | null;
  is_business: boolean;
  payment_method: PaymentMethod | null;
  card_last4: string | null;
  card_id: string | null;
  check_number: string | null;
  reference_number: string | null;
  sub_id: string | null;
  project_id: string | null;
  new_card_is_business: boolean;
  new_card_nickname: string | null;
  skip_dupe_check: boolean;
  raw_extraction: ExtractionResult | null;
  receipt_path: string | null;
};

export async function commitExpenseAction(input: CommitInput) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false as const, error: "Not authenticated" };

    const rawMerchant = input.merchant || null;
    const merchant = rawMerchant
      ? await canonicalizeMerchant(user.id, rawMerchant)
      : null;
    const amountCents = input.amount_cents;
    const expenseDate = input.expense_date || null;
    const categoryCode = input.category_code || "other";
    const businessPurpose = input.business_purpose || null;
    const isBusiness = !!input.is_business;
    const skipDupeCheck = !!input.skip_dupe_check;

    const ALLOWED_METHODS: PaymentMethod[] = [
      "credit_card",
      "check",
      "zelle",
      "wire",
      "cash",
      "other",
    ];
    const paymentMethod =
      input.payment_method && ALLOWED_METHODS.includes(input.payment_method)
        ? input.payment_method
        : null;
    const cardLast4 =
      input.card_last4 && /^\d{4}$/.test(input.card_last4)
        ? input.card_last4
        : null;
    let cardId = input.card_id || null;
    const newCardIsBusiness = !!input.new_card_is_business;
    const newCardNickname = input.new_card_nickname || null;
    const checkNumber = input.check_number || null;
    const referenceNumber = input.reference_number || null;
    let subId = input.sub_id || null;
    const projectId = input.project_id || null;
    const receiptPath = input.receipt_path || null;

    // Auto-link sub via alias / canonical name if user didn't pick one
    if (!subId && merchant) {
      const { data: resolved } = await supabase.rpc("resolve_sub_for_merchant", {
        p_user: user.id,
        p_merchant: merchant,
      });
      if (resolved) subId = resolved as string;
    }

    const rawExtraction = input.raw_extraction;

    // Dedup check: same merchant + date + amount in past 7 days
    if (!skipDupeCheck && merchant && expenseDate && amountCents != null) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { data: dupeRows } = await supabase
        .from("expenses")
        .select("id, merchant, expense_date, amount_cents")
        .eq("user_id", user.id)
        .eq("merchant", merchant)
        .eq("amount_cents", amountCents)
        .eq("expense_date", expenseDate)
        .gte("created_at", sevenDaysAgo.toISOString())
        .limit(1);
      if (dupeRows && dupeRows.length > 0) {
        return {
          success: false as const,
          error: "duplicate",
          duplicateOf: {
            id: dupeRows[0].id as string,
            merchant: dupeRows[0].merchant as string | null,
            expense_date: dupeRows[0].expense_date as string | null,
            amount_cents: dupeRows[0].amount_cents as number | null,
          },
        };
      }
    }

    // Upsert payment card if credit_card + last4 given and no existing card_id
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

    // Insert expense
    const { data: expense, error: insertError } = await supabase
      .from("expenses")
      .insert({
        user_id: user.id,
        merchant: merchant || null,
        expense_date: expenseDate,
        amount_cents: amountCents,
        currency: rawExtraction?.currency ?? "USD",
        category_code: categoryCode,
        category_confidence: rawExtraction?.category_confidence ?? null,
        business_purpose: businessPurpose,
        is_business: isBusiness,
        receipt_path: receiptPath,
        raw_extraction: rawExtraction as any,
        payment_method: paymentMethod,
        card_last4: paymentMethod === "credit_card" ? cardLast4 : null,
        card_id: paymentMethod === "credit_card" ? cardId : null,
        check_number: paymentMethod === "check" ? checkNumber : null,
        reference_number:
          paymentMethod === "zelle" || paymentMethod === "wire"
            ? referenceNumber
            : null,
        sub_id: subId,
        project_id: projectId,
      })
      .select("id")
      .single();

    if (insertError) throw new Error(insertError.message);

    revalidatePath("/expenses");
    return { success: true as const, id: expense.id as string };
  } catch (err) {
    return {
      success: false as const,
      error: (err as Error).message || "Failed to save expense",
    };
  }
}
