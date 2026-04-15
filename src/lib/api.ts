import { supabase } from "./supabase";
import type { ExtractionResult, Expense } from "./types";

/**
 * Calls the `extract-receipt` Supabase Edge Function, which forwards the
 * image to Claude vision and returns structured extraction.
 */
export async function extractReceipt(params: {
  imageBase64: string;
  mimeType: string;
}): Promise<ExtractionResult> {
  const { data, error } = await supabase.functions.invoke<ExtractionResult>(
    "extract-receipt",
    {
      body: {
        image_base64: params.imageBase64,
        mime_type: params.mimeType,
      },
    }
  );
  if (error) throw new Error(error.message);
  if (!data) throw new Error("No data returned from extraction");
  return data;
}

export async function uploadReceiptImage(params: {
  userId: string;
  filename: string;
  base64: string;
  mimeType: string;
}): Promise<string> {
  // React Native's Blob/atob are flaky — use the base64 SDK path directly.
  const path = `${params.userId}/${Date.now()}-${params.filename}`;
  const bytes = decodeBase64(params.base64);
  const { error } = await supabase.storage
    .from("receipts")
    .upload(path, bytes, {
      contentType: params.mimeType,
      upsert: false,
    });
  if (error) throw new Error(error.message);
  return path;
}

export async function createExpense(params: {
  userId: string;
  extraction: ExtractionResult;
  receiptPath: string | null;
}): Promise<Expense> {
  const { extraction, receiptPath, userId } = params;
  const row = {
    user_id: userId,
    merchant: extraction.merchant,
    expense_date: extraction.expense_date,
    amount_cents: extraction.amount_cents,
    currency: extraction.currency || "USD",
    category_code: extraction.category_code,
    category_confidence: extraction.category_confidence,
    business_purpose: extraction.business_purpose,
    is_business: extraction.is_business,
    receipt_path: receiptPath,
    raw_extraction: extraction,
  };
  const { data, error } = await supabase
    .from("expenses")
    .insert(row)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as Expense;
}

export async function listExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Expense[];
}

export async function getExpense(id: string): Promise<Expense | null> {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Expense) ?? null;
}

export async function updateExpense(
  id: string,
  patch: Partial<Expense>
): Promise<Expense> {
  const { data, error } = await supabase
    .from("expenses")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as Expense;
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function signedReceiptUrl(
  path: string,
  expiresSec = 60 * 30
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from("receipts")
    .createSignedUrl(path, expiresSec);
  if (error) return null;
  return data?.signedUrl ?? null;
}

// --- base64 -> Uint8Array (works in React Native without Buffer) ---
function decodeBase64(b64: string): Uint8Array {
  const clean = b64.replace(/^data:[^;]+;base64,/, "");
  // React Native provides `atob` in its Hermes runtime.
  const binary = atob(clean);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
