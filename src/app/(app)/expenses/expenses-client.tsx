"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search, RefreshCw, Camera } from "lucide-react";
import { ExpenseCard } from "@/components/expense-card";
import { UpgradeBanner } from "@/components/upgrade-banner";
import { type Expense, type UserPlan, formatCents } from "@/lib/types";

type ExpensesClientProps = {
  expenses: Expense[];
  userPlan: UserPlan;
};

export function ExpensesClient({ expenses, userPlan }: ExpensesClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate MTD deductible total (business expenses this month)
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const mtdTotal = expenses
    .filter(
      (e) =>
        e.is_business &&
        e.amount_cents != null &&
        e.expense_date &&
        e.expense_date >= monthStart,
    )
    .reduce((sum, e) => sum + (e.amount_cents ?? 0), 0);

  // Filter expenses by search
  const filtered = expenses.filter((e) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (e.merchant && e.merchant.toLowerCase().includes(q)) ||
      (e.category_code && e.category_code.toLowerCase().includes(q)) ||
      (e.business_purpose && e.business_purpose.toLowerCase().includes(q)) ||
      (e.notes && e.notes.toLowerCase().includes(q))
    );
  });

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 lg:pt-10">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="mt-1 text-sm text-gray-500">
            {formatCents(mtdTotal)} deductible this month
          </p>
        </div>
        <button
          onClick={() => router.refresh()}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Refresh"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* Upgrade banner */}
      <div className="mb-4">
        <UpgradeBanner plan={userPlan.plan} trialActive={userPlan.trialActive} />
      </div>

      {/* Search bar */}
      {expenses.length > 0 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
          />
        </div>
      )}

      {/* Expense list */}
      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} />
          ))}
        </div>
      ) : expenses.length > 0 && searchQuery ? (
        <div className="py-16 text-center">
          <p className="text-sm text-gray-500">
            No expenses match &ldquo;{searchQuery}&rdquo;
          </p>
        </div>
      ) : (
        <div className="py-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Camera className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">
            No expenses yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Snap your first receipt to get started
          </p>
          <Link
            href="/capture"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            <Camera className="h-4 w-4" />
            Capture Receipt
          </Link>
        </div>
      )}

      {/* FAB */}
      <Link
        href="/capture"
        className="fixed bottom-[72px] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-colors hover:bg-brand-700 lg:bottom-8"
        aria-label="Add expense"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
}
