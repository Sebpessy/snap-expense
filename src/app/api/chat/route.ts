import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveAnthropicKey } from "@/lib/anthropic-key";
import { SCHEDULE_C_CATEGORIES, categoryCodes } from "@/lib/categories";

export const runtime = "nodejs";

const ALLOWED_METHODS = ["credit_card","check","zelle","wire","cash","other"] as const;
const ALLOWED_CATEGORIES = new Set(categoryCodes());
const TODAY_ISO = () => new Date().toISOString().split("T")[0];

const SYSTEM_PROMPT = (today: string) => `You parse natural-language expense descriptions into strict JSON. The current date is ${today} (use it to resolve relative dates like "yesterday" or "last Friday").

Output STRICT JSON matching this schema and nothing else. No prose, no markdown, no code fences:
{
  "merchant": string | null,
  "expense_date": string | null,
  "amount_cents": integer | null,
  "currency": string,
  "category_code": string,
  "category_confidence": number,
  "business_purpose": string | null,
  "is_business": boolean,
  "payment_method": string | null,
  "card_last4": string | null,
  "check_number": string | null,
  "reference_number": string | null,
  "warnings": string[]
}

Allowed category_code values (IRS Schedule C):
${SCHEDULE_C_CATEGORIES.map((c) => `- ${c.code}: ${c.label} (${c.hint})`).join("\n")}

Allowed payment_method values: credit_card, check, zelle, wire, cash, other.

Rules:
- amount_cents is integer cents ($12.34 → 1234).
- expense_date is ISO YYYY-MM-DD. If not stated, leave null.
- If the input is not an expense, return all nulls and warnings: ["not an expense"].
- card_last4 is a 4-digit string if mentioned, else null.
- Pick the single best category_code; use "other" with low confidence when uncertain.
- is_business defaults to true unless the user clearly indicates personal.`;

function safeParseJson(text: string): any | null {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
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

function normalize(raw: any) {
  const category_code = raw?.category_code && ALLOWED_CATEGORIES.has(raw.category_code)
    ? raw.category_code
    : "other";
  const confidence = Math.max(0, Math.min(1, Number(raw?.category_confidence ?? 0) || 0));
  const amount = raw?.amount_cents == null ? null : Math.round(Number(raw.amount_cents));
  const payment_method =
    typeof raw?.payment_method === "string" && (ALLOWED_METHODS as readonly string[]).includes(raw.payment_method)
      ? raw.payment_method
      : null;
  const card_last4 =
    typeof raw?.card_last4 === "string" && /^\d{4}$/.test(raw.card_last4) ? raw.card_last4 : null;
  const check_number =
    typeof raw?.check_number === "string" && raw.check_number.trim() ? raw.check_number.trim() : null;
  const reference_number =
    typeof raw?.reference_number === "string" && raw.reference_number.trim() ? raw.reference_number.trim() : null;

  return {
    merchant: typeof raw?.merchant === "string" && raw.merchant.trim() ? raw.merchant.trim() : null,
    expense_date:
      typeof raw?.expense_date === "string"
        ? (raw.expense_date.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? null)
        : null,
    amount_cents: Number.isFinite(amount) ? amount : null,
    currency: typeof raw?.currency === "string" && raw.currency ? raw.currency : "USD",
    category_code,
    category_confidence: confidence,
    business_purpose:
      typeof raw?.business_purpose === "string" && raw.business_purpose.trim()
        ? raw.business_purpose.trim()
        : null,
    is_business: raw?.is_business !== false,
    line_items: [],
    warnings: Array.isArray(raw?.warnings) ? raw.warnings.map(String).filter(Boolean) : [],
    payment_method,
    card_last4,
    check_number,
    reference_number,
  };
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!message) return NextResponse.json({ error: "Empty message" }, { status: 400 });

  const apiKey = await resolveAnthropicKey(user.id);
  if (!apiKey) {
    return NextResponse.json(
      { error: "No Anthropic API key. Add one in Settings or set ANTHROPIC_API_KEY." },
      { status: 400 },
    );
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 512,
      system: SYSTEM_PROMPT(TODAY_ISO()),
      messages: [{ role: "user", content: message }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return NextResponse.json(
      { error: res.status === 401 ? "Invalid API key" : `Claude error: ${res.status} — ${errText}` },
      { status: 502 },
    );
  }

  const result = await res.json();
  const text = result?.content?.find((b: any) => b.type === "text")?.text ?? "";
  const parsed = safeParseJson(text);
  if (!parsed) {
    return NextResponse.json({ error: "Failed to parse Claude response", raw: text }, { status: 502 });
  }

  return NextResponse.json({ extraction: normalize(parsed) });
}
