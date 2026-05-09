"use server";

import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/plans";
import { extractReceiptWithUserKey } from "@/lib/extract";
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
    const merchant = formData.get("merchant") as string | null;
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

    let rawExtraction: ExtractionResult | null = null;
    const rawJson = formData.get("raw_extraction") as string | null;
    if (rawJson) {
      try {
        rawExtraction = JSON.parse(rawJson);
      } catch {
        // Ignore parse errors for raw extraction
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
