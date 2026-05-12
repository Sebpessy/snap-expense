import { createClient } from "@/lib/supabase/server";
import { type Expense } from "@/lib/types";

export const runtime = "nodejs";

const COLUMNS = [
  "date",
  "merchant",
  "amount",
  "currency",
  "category_code",
  "business_purpose",
  "is_business",
  "payment_method",
  "card_last4",
  "check_number",
  "reference_number",
  "sub_name",
  "notes",
] as const;

function csvCell(v: string | number | boolean | null | undefined): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function csvRow(values: (string | number | boolean | null | undefined)[]): string {
  return values.map(csvCell).join(",") + "\r\n";
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  // Preload subs map for joining sub_name without N+1
  const { data: subs } = await supabase
    .from("subs")
    .select("id, name")
    .eq("user_id", user.id);
  const subById = new Map<string, string>((subs ?? []).map((s) => [s.id as string, s.name as string]));

  const PAGE = 1000;
  const filename = `expenses-${new Date().toISOString().split("T")[0]}.csv`;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      // UTF-8 BOM so Excel handles diacritics
      controller.enqueue(encoder.encode("﻿"));
      controller.enqueue(encoder.encode(COLUMNS.join(",") + "\r\n"));

      let offset = 0;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        let query = supabase
          .from("expenses")
          .select("*")
          .eq("user_id", user.id)
          .order("expense_date", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false })
          .range(offset, offset + PAGE - 1);
        if (from) query = query.gte("expense_date", from);
        if (to) query = query.lte("expense_date", to);

        const { data: rows, error } = await query;
        if (error) {
          controller.enqueue(encoder.encode(`# error: ${error.message}\r\n`));
          break;
        }
        if (!rows || rows.length === 0) break;

        for (const row of rows as Expense[]) {
          controller.enqueue(
            encoder.encode(
              csvRow([
                row.expense_date,
                row.merchant,
                row.amount_cents != null ? (row.amount_cents / 100).toFixed(2) : null,
                row.currency,
                row.category_code,
                row.business_purpose,
                row.is_business,
                row.payment_method,
                row.card_last4,
                row.check_number,
                row.reference_number,
                row.sub_id ? subById.get(row.sub_id) ?? "" : "",
                row.notes,
              ]),
            ),
          );
        }
        if (rows.length < PAGE) break;
        offset += PAGE;
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
