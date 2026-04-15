// Supabase Edge Function (Deno): extract-receipt
//
// Accepts { image_base64, mime_type } and returns a strongly-typed
// extraction of a receipt using Claude's vision capabilities. Keeps the
// ANTHROPIC_API_KEY server-side so it's never shipped to the client.
//
// Deploy:
//   supabase functions deploy extract-receipt --no-verify-jwt=false
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// The function REQUIRES an authenticated caller (verify JWT left on).

// deno-lint-ignore-file no-explicit-any

const CATEGORY_CODES = [
  "advertising",
  "car_truck",
  "commissions",
  "contract_labor",
  "insurance",
  "interest",
  "legal_professional",
  "office_expense",
  "rent_lease",
  "repairs",
  "supplies",
  "taxes_licenses",
  "travel",
  "meals",
  "utilities",
  "wages",
  "software_subscriptions",
  "education",
  "bank_fees",
  "other",
  "personal_non_deductible",
];

const SYSTEM_PROMPT = `You are a receipt-extraction assistant for U.S. freelancers and sole proprietors.
Given a photo of a receipt or invoice, extract the following as strict JSON and
nothing else. No prose, no markdown, no code fences.

Schema:
{
  "merchant": string | null,
  "expense_date": string | null,          // ISO "YYYY-MM-DD", best guess
  "amount_cents": integer | null,         // total paid, in cents
  "currency": string,                     // ISO 4217, default "USD"
  "category_code": string,                // one of the allowed codes below
  "category_confidence": number,          // 0..1
  "business_purpose": string | null,      // short, 3-10 words, your best guess
  "is_business": boolean,                 // true unless clearly personal
  "line_items": [ { "description": string, "amount_cents": integer } ],
  "warnings": string[]                    // e.g., "blurry total", "date missing"
}

Allowed category_code values (IRS Schedule C):
${CATEGORY_CODES.join(", ")}

Rules:
- Always output valid JSON matching the schema exactly. Unknown fields → null.
- amount_cents is integer cents. $12.34 → 1234. No decimals.
- Pick the single best category_code. If unclear, use "other" with lower confidence.
- If the image is not a receipt, return nulls and warnings: ["not a receipt"].`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) return json({ error: "ANTHROPIC_API_KEY not configured" }, 500);

    const body = await req.json().catch(() => null);
    const imageBase64: string | undefined = body?.image_base64;
    const mimeType: string = body?.mime_type ?? "image/jpeg";

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return json({ error: "image_base64 is required" }, 400);
    }
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mimeType)) {
      return json({ error: `Unsupported mime_type: ${mimeType}` }, 400);
    }

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
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
                  media_type: mimeType,
                  data: stripDataUrlPrefix(imageBase64),
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

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      return json(
        { error: `Anthropic API error: ${anthropicRes.status}`, detail: errText },
        502
      );
    }

    const data = await anthropicRes.json();
    const text: string =
      data?.content?.find((b: any) => b.type === "text")?.text ?? "";
    const parsed = safeParseJson(text);
    if (!parsed) {
      return json(
        { error: "Failed to parse JSON from model", raw: text },
        502
      );
    }

    const result = normalize(parsed);
    return json(result, 200);
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});

// ─── helpers ─────────────────────────────────────────────────────────
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json",
      ...corsHeaders(),
    },
  });
}

function stripDataUrlPrefix(b64: string): string {
  return b64.replace(/^data:[^;]+;base64,/, "");
}

function safeParseJson(text: string): any | null {
  const trimmed = text.trim();
  // Strip ```json fences if the model ignored instructions.
  const unfenced = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  try {
    return JSON.parse(unfenced);
  } catch {
    // Try to recover the first {...} block.
    const match = unfenced.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function normalize(raw: any): Record<string, unknown> {
  const category_code = CATEGORY_CODES.includes(raw?.category_code)
    ? raw.category_code
    : "other";
  const confidence = clamp01(Number(raw?.category_confidence ?? 0));
  const amount =
    raw?.amount_cents == null
      ? null
      : Math.round(Number(raw.amount_cents));

  return {
    merchant: strOrNull(raw?.merchant),
    expense_date: isoDateOrNull(raw?.expense_date),
    amount_cents: Number.isFinite(amount) ? amount : null,
    currency: typeof raw?.currency === "string" && raw.currency ? raw.currency : "USD",
    category_code,
    category_confidence: confidence,
    business_purpose: strOrNull(raw?.business_purpose),
    is_business: raw?.is_business !== false,
    line_items: Array.isArray(raw?.line_items)
      ? raw.line_items
          .map((li: any) => ({
            description: strOrNull(li?.description) ?? "",
            amount_cents:
              li?.amount_cents == null ? 0 : Math.round(Number(li.amount_cents)) || 0,
          }))
          .filter((li: any) => li.description)
      : [],
    warnings: Array.isArray(raw?.warnings)
      ? raw.warnings.map(String).filter(Boolean)
      : [],
  };
}

function strOrNull(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s ? s : null;
}

function isoDateOrNull(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const m = v.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}
