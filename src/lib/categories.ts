/**
 * IRS Schedule C (Form 1040) expense categories. These codes are persisted
 * to Postgres and expected by the Edge Function prompt, so treat them as
 * a stable contract.
 */

export type ScheduleCCategory = {
  code: string;
  label: string;
  line: string;
  hint: string;
  icon: string; // lucide-style icon hint; rendered by caller
};

export const SCHEDULE_C_CATEGORIES: ScheduleCCategory[] = [
  { code: "advertising", label: "Advertising", line: "Line 8", hint: "Ads, marketing, promo", icon: "megaphone" },
  { code: "car_truck", label: "Car & Truck", line: "Line 9", hint: "Fuel, maintenance, tolls", icon: "car" },
  { code: "commissions", label: "Commissions & Fees", line: "Line 10", hint: "Platform & referral fees", icon: "percent" },
  { code: "contract_labor", label: "Contract Labor", line: "Line 11", hint: "1099 contractors", icon: "users" },
  { code: "insurance", label: "Insurance", line: "Line 15", hint: "Business liability, E&O", icon: "shield" },
  { code: "interest", label: "Interest", line: "Line 16", hint: "Business loan interest", icon: "trending-up" },
  { code: "legal_professional", label: "Legal & Professional", line: "Line 17", hint: "Lawyers, accountants", icon: "briefcase" },
  { code: "office_expense", label: "Office Expense", line: "Line 18", hint: "Office supplies", icon: "paperclip" },
  { code: "rent_lease", label: "Rent or Lease", line: "Line 20", hint: "Office, equipment rent", icon: "home" },
  { code: "repairs", label: "Repairs", line: "Line 21", hint: "Equipment repair", icon: "wrench" },
  { code: "supplies", label: "Supplies", line: "Line 22", hint: "Materials & supplies", icon: "package" },
  { code: "taxes_licenses", label: "Taxes & Licenses", line: "Line 23", hint: "Permits, licenses", icon: "file-text" },
  { code: "travel", label: "Travel", line: "Line 24a", hint: "Airfare, hotels", icon: "plane" },
  { code: "meals", label: "Meals (50%)", line: "Line 24b", hint: "Business meals", icon: "utensils" },
  { code: "utilities", label: "Utilities", line: "Line 25", hint: "Internet, phone, power", icon: "zap" },
  { code: "wages", label: "Wages", line: "Line 26", hint: "W-2 employees", icon: "users" },
  { code: "software_subscriptions", label: "Software & Subscriptions", line: "Line 27a", hint: "SaaS, memberships", icon: "monitor" },
  { code: "education", label: "Education", line: "Line 27a", hint: "Courses, books", icon: "book-open" },
  { code: "bank_fees", label: "Bank & Payment Fees", line: "Line 27a", hint: "Stripe, card fees", icon: "credit-card" },
  { code: "other", label: "Other Business", line: "Line 27a", hint: "Other deductible", icon: "more-horizontal" },
  { code: "personal_non_deductible", label: "Personal", line: "—", hint: "Not deductible", icon: "user" },
];

export function getCategory(code: string | null | undefined): ScheduleCCategory {
  return (
    SCHEDULE_C_CATEGORIES.find((c) => c.code === code) ??
    SCHEDULE_C_CATEGORIES.find((c) => c.code === "other")!
  );
}

export function categoryCodes(): string[] {
  return SCHEDULE_C_CATEGORIES.map((c) => c.code);
}
