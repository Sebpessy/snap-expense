"use server";

import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/plans";
import { extractReceiptWithUserKey } from "@/lib/extract";
import { canonicalizeMerchant } from "@/lib/merchant-aliases";
import type { ExtractionResult } from "@/lib/types";

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

    const userPlan = getUserPlan(profile);
    if (!userPlan.canScan) {
      return { success: false as const, error: "scan_limit_reached" };
    }

    // Extract receipt data via Claude
    const extraction = await extractReceiptWithUserKey({
      userId: user.id,
      imageBase64,
      mimeType: "image/jpeg",
    });

    // Increment scan count
    await supabase
      .from("profiles")
      .update({
        scan_count_this_period: (profile.scan_count_this_period ?? 0) + 1,
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

export async function saveExpenseAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false as const, error: "Not authenticated" };

    // Upload image to Supabase Storage
    const imageFile = formData.get("image") as File | null;
    let receiptPath: string | null = null;

    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const resized = await sharp(buffer)
        .resize({ width: 1600, withoutEnlargement: true })
        .jpeg({ quality: 70 })
        .toBuffer();

      const timestamp = Date.now();
      const storagePath = `${user.id}/${timestamp}-receipt.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(storagePath, resized, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
      receiptPath = storagePath;
    }

    // Parse form fields
    const rawMerchant = formData.get("merchant") as string | null;
    // Apply user-defined merchant alias rules (e.g. "STARBUCKS #4321" → "Starbucks")
    const merchant = rawMerchant ? await canonicalizeMerchant(user.id, rawMerchant) : null;
    const amountCentsRaw = formData.get("amount_cents") as string | null;
    const amountCents =
      amountCentsRaw && amountCentsRaw !== ""
        ? parseInt(amountCentsRaw, 10)
        : null;
    const expenseDate = (formData.get("expense_date") as string) || null;
    const categoryCode = (formData.get("category_code") as string) || "other";
    const businessPurpose =
      (formData.get("business_purpose") as string) || null;
    const isBusiness = formData.get("is_business") === "true";
    const skipDupeCheck = formData.get("skip_dupe_check") === "true";

    // Payment fields
    const paymentMethodRaw = (formData.get("payment_method") as string | null) ?? null;
    const ALLOWED_METHODS = ["credit_card","check","zelle","wire","cash","other"];
    const paymentMethod = paymentMethodRaw && ALLOWED_METHODS.includes(paymentMethodRaw)
      ? paymentMethodRaw
      : null;
    const cardLast4Raw = (formData.get("card_last4") as string | null) ?? null;
    const cardLast4 = cardLast4Raw && /^\d{4}$/.test(cardLast4Raw) ? cardLast4Raw : null;
    let cardId = (formData.get("card_id") as string | null) || null;
    const newCardIsBusiness = formData.get("new_card_is_business") === "true";
    const newCardNickname = (formData.get("new_card_nickname") as string | null) || null;
    const checkNumber = (formData.get("check_number") as string | null) || null;
    const referenceNumber = (formData.get("reference_number") as string | null) || null;
    let subId = (formData.get("sub_id") as string | null) || null;

    // Auto-link sub via alias / canonical name if user didn't pick one
    if (!subId && merchant) {
      const { data: resolved } = await supabase.rpc("resolve_sub_for_merchant", {
        p_user: user.id,
        p_merchant: merchant,
      });
      if (resolved) subId = resolved as string;
    }

    let rawExtraction: ExtractionResult | null = null;
    const rawJson = formData.get("raw_extraction") as string | null;
    if (rawJson) {
      try {
        rawExtraction = JSON.parse(rawJson);
      } catch {
        // Ignore parse errors for raw extraction
      }
    }

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
