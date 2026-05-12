import "server-only";
import { resolveAnthropicKey } from "@/lib/anthropic-key";
import { categoryCodes } from "./categories";

const CATEGORY_CODE_LIST = categoryCodes();

const SYSTEM_PROMPT = `You are a receipt-extraction assistant for U.S. freelancers and sole proprietors.
Given a photo of a receipt or invoice, extract the following as strict JSON and nothing else. No prose, no markdown, no code fences.

Schema:
{
  "merchant": string | null,
  "expense_date": string | null,          // ISO "YYYY-MM-DD", best guess
  "amount_cents": integer | null,         // total paid, in cents ($12.34 → 1234)
  "currency": string,                     // ISO 4217, default "USD"
  "category_code": string,                // one of the allowed codes below
  "category_confidence": number,          // 0..1
  "business_purpose": string | null,      // short, 3-10 words
  "is_business": boolean,                 // true unless clearly personal
  "line_items": [ { "description": string, "amount_cents": integer } ],
  "warnings": string[],                   // e.g. "blurry total", "date missing"
  "payment_method": string | null,        // one of: "credit_card","check","zelle","wire","cash","other"
  "card_last4": string | null             // 4-digit string if a card was used and the last 4 are visible
}

Allowed category_code values (IRS Schedule C):
${CATEGORY_CODE_LIST.join(", ")}

Rules:
- Always output valid JSON matching the schema exactly.
- amount_cents is integer cents. No decimals.
- Pick the single best category_code. If unclear, use "other" with lower confidence.
- If a credit or debit card was used and the last 4 digits are printed on the receipt, set card_last4 to those exact 4 digits and payment_method to "credit_card". If the payment method is unclear, leave both null.
- If the image is not a receipt, return nulls and warnings: ["not a receipt"].`;

export async function extractReceiptWithUserKey(params: {
  userId: string;
  imageBase64: string;
  mimeType: string;
}) {
  const apiKey = await resolveAnthropicKey(params.userId);

  if (!apiKey)
    throw new Error(
      "No Anthropic API key available. Set ANTHROPIC_API_KEY or add a key in Settings.",
    );

  // Call Claude vision
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: params.mimeType,
                data: params.imageBase64.replace(/^data:[^;]+;base64,/, ""),
              },
            },
            {
              type: "text",
              text: "Extract this receipt as JSON per the schema.",
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    if (response.status === 401)
      throw new Error(
        "Invalid API key. Please check your Anthropic key in Settings.",
      );
    throw new Error(`Claude API error: ${response.status} — ${errText}`);
  }

  const result = await response.json();
  const text =
    result?.content?.find((b: any) => b.type === "text")?.text ?? "";
  const parsed = safeParseJson(text);
  if (!parsed) throw new Error("Failed to parse Claude response");
  return normalize(parsed);
}

function safeParseJson(text: string): any | null {
  const trimmed = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

const ALLOWED_PAYMENT_METHODS = new Set([
  "credit_card",
  "check",
  "zelle",
  "wire",
  "cash",
  "other",
]);

function normalize(raw: any) {
  const category_code = CATEGORY_CODE_LIST.includes(raw?.category_code)
    ? raw.category_code
    : "other";
  const confidence = Math.max(
    0,
    Math.min(1, Number(raw?.category_confidence ?? 0) || 0),
  );
  const amount =
    raw?.amount_cents == null ? null : Math.round(Number(raw.amount_cents));

  const payment_method =
    typeof raw?.payment_method === "string" &&
    ALLOWED_PAYMENT_METHODS.has(raw.payment_method)
      ? (raw.payment_method as
          | "credit_card"
          | "check"
          | "zelle"
          | "wire"
          | "cash"
          | "other")
      : null;

  const card_last4 =
    typeof raw?.card_last4 === "string" && /^\d{4}$/.test(raw.card_last4)
      ? raw.card_last4
      : null;

  return {
    merchant:
      typeof raw?.merchant === "string" && raw.merchant.trim()
        ? raw.merchant.trim()
        : null,
    expense_date:
      typeof raw?.expense_date === "string"
        ? (raw.expense_date.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? null)
        : null,
    amount_cents: Number.isFinite(amount) ? amount : null,
    currency:
      typeof raw?.currency === "string" && raw.currency ? raw.currency : "USD",
    category_code,
    category_confidence: confidence,
    business_purpose:
      typeof raw?.business_purpose === "string" && raw.business_purpose.trim()
        ? raw.business_purpose.trim()
        : null,
    is_business: raw?.is_business !== false,
    line_items: Array.isArray(raw?.line_items)
      ? raw.line_items
          .filter((li: any) => li?.description)
          .map((li: any) => ({
            description: String(li.description).trim(),
            amount_cents: Math.round(Number(li.amount_cents) || 0),
          }))
      : [],
    warnings: Array.isArray(raw?.warnings)
      ? raw.warnings.map(String).filter(Boolean)
      : [],
    payment_method,
    card_last4,
  };
}
