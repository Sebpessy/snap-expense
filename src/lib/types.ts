export type Expense = {
  id: string;
  user_id: string;
  merchant: string | null;
  expense_date: string | null;
  amount_cents: number | null;
  currency: string;
  category_code: string | null;
  category_confidence: number | null;
  business_purpose: string | null;
  is_business: boolean;
  notes: string | null;
  receipt_path: string | null;
  raw_extraction: ExtractionResult | null;
  created_at: string;
  updated_at: string;
};

export type LineItem = {
  description: string;
  amount_cents: number;
};

export type ExtractionResult = {
  merchant: string | null;
  expense_date: string | null; // YYYY-MM-DD
  amount_cents: number | null;
  currency: string;
  category_code: string;
  category_confidence: number; // 0-1
  business_purpose: string | null;
  is_business: boolean;
  line_items: LineItem[];
  warnings: string[];
};

export function formatCents(
  cents: number | null | undefined,
  currency = "USD"
): string {
  if (cents == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
