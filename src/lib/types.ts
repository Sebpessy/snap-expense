export type PaymentMethod =
  | "credit_card"
  | "check"
  | "zelle"
  | "wire"
  | "cash"
  | "other";

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
  payment_method: PaymentMethod | null;
  card_last4: string | null;
  card_id: string | null;
  check_number: string | null;
  reference_number: string | null;
  sub_id: string | null;
  project_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectStatus = "active" | "completed" | "archived";

export type Project = {
  id: string;
  user_id: string;
  name: string;
  client_name: string | null;
  formatted_address: string | null;
  place_id: string | null;
  lat: number | null;
  lng: number | null;
  notes: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
};

export type SubStatus = "active" | "inactive" | "blacklisted";

export type Sub = {
  id: string;
  user_id: string;
  name: string;
  trade: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  tax_id: string | null;
  status: SubStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type SubAlias = {
  id: string;
  user_id: string;
  sub_id: string;
  alias: string;
  created_at: string;
};

export type LineItem = {
  description: string;
  amount_cents: number;
};

export type ExtractionResult = {
  merchant: string | null;
  expense_date: string | null;
  amount_cents: number | null;
  currency: string;
  category_code: string;
  category_confidence: number;
  business_purpose: string | null;
  is_business: boolean;
  line_items: LineItem[];
  warnings: string[];
  payment_method: PaymentMethod | null;
  card_last4: string | null;
};

export type PaymentCard = {
  id: string;
  user_id: string;
  last4: string;
  nickname: string | null;
  is_business: boolean;
  created_at: string;
};

export type MerchantAlias = {
  id: string;
  user_id: string | null; // null = global rule
  pattern: string;
  canonical: string;
  created_at: string;
};

export type CategoryRequest = {
  id: string;
  user_id: string;
  requested_label: string;
  suggested_schedule_c_line: string | null;
  status: "pending" | "approved" | "rejected";
  admin_response: string | null;
  created_at: string;
};

export type UserPlan = {
  plan: string;
  planName: string;
  trialActive: boolean;
  trialEndsAt: string | null;
  scanCount: number;
  scanLimit: number | null; // null = unlimited
  canScan: boolean;
  hasApiKey: boolean;
};

export type Plan = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  monthly_price_cents: number | null;
  scans_per_month: number | null;
  history_days: number | null;
  is_active: boolean;
  sort_order: number;
  stripe_price_id: string | null;
  created_at?: string;
  updated_at?: string;
};

export function formatCents(
  cents: number | null | undefined,
  currency = "USD",
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
  // For YYYY-MM-DD strings, parse as a LOCAL date — otherwise `new Date(iso)`
  // interprets it as UTC midnight, which shifts back a day in negative-UTC zones.
  const ymd = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const d = ymd
    ? new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]))
    : new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
