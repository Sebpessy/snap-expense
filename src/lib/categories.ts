export type ScheduleCCategory = {
  code: string;
  label: string;
  line: string;
  hint: string;
};

export const SCHEDULE_C_CATEGORIES: ScheduleCCategory[] = [
  { code: "advertising", label: "Advertising", line: "Line 8", hint: "Ads, marketing, promo" },
  { code: "car_truck", label: "Car & Truck", line: "Line 9", hint: "Fuel, maintenance, tolls" },
  { code: "commissions", label: "Commissions & Fees", line: "Line 10", hint: "Platform & referral fees" },
  { code: "contract_labor", label: "Contract Labor", line: "Line 11", hint: "1099 contractors" },
  { code: "insurance", label: "Insurance", line: "Line 15", hint: "Business liability, E&O" },
  { code: "interest", label: "Interest", line: "Line 16", hint: "Business loan interest" },
  { code: "legal_professional", label: "Legal & Professional", line: "Line 17", hint: "Lawyers, accountants" },
  { code: "office_expense", label: "Office Expense", line: "Line 18", hint: "Office supplies" },
  { code: "rent_lease", label: "Rent or Lease", line: "Line 20", hint: "Office, equipment rent" },
  { code: "repairs", label: "Repairs", line: "Line 21", hint: "Equipment repair" },
  { code: "supplies", label: "Supplies", line: "Line 22", hint: "Materials & supplies" },
  { code: "taxes_licenses", label: "Taxes & Licenses", line: "Line 23", hint: "Permits, licenses" },
  { code: "travel", label: "Travel", line: "Line 24a", hint: "Airfare, hotels" },
  { code: "meals", label: "Meals (50%)", line: "Line 24b", hint: "Business meals" },
  { code: "utilities", label: "Utilities", line: "Line 25", hint: "Internet, phone, power" },
  { code: "wages", label: "Wages", line: "Line 26", hint: "W-2 employees" },
  { code: "software_subscriptions", label: "Software & Subscriptions", line: "Line 27a", hint: "SaaS, memberships" },
  { code: "education", label: "Education", line: "Line 27a", hint: "Courses, books" },
  { code: "bank_fees", label: "Bank & Payment Fees", line: "Line 27a", hint: "Stripe, card fees" },
  { code: "other", label: "Other Business", line: "Line 27a", hint: "Other deductible" },
  { code: "personal_non_deductible", label: "Personal", line: "—", hint: "Not deductible" },
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
