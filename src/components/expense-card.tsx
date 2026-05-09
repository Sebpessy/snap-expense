"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { type Expense, formatCents, formatDate } from "@/lib/types";
import { getCategory } from "@/lib/categories";

type ExpenseCardProps = {
  expense: Expense;
};

export function ExpenseCard({ expense }: ExpenseCardProps) {
  const category = getCategory(expense.category_code);
  const isPersonal = !expense.is_business;
  const lowConfidence =
    expense.category_confidence != null && expense.category_confidence < 0.6;

  return (
    <Link
      href={`/expense/${expense.id}`}
      className={`flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${
        isPersonal ? "opacity-60" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-semibold ${
            isPersonal ? "text-gray-400" : "text-gray-900"
          }`}
        >
          {expense.merchant || "Unknown merchant"}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5">
          {lowConfidence && (
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full bg-amber-400"
              title="Low confidence category"
            />
          )}
          <p className="truncate text-xs text-gray-500">
            {formatDate(expense.expense_date)}
            {category && (
              <>
                {" "}
                <span className="text-gray-300">&middot;</span>{" "}
                {category.label}
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <span
          className={`text-sm font-semibold ${
            isPersonal ? "text-gray-400 line-through" : "text-gray-900"
          }`}
        >
          {formatCents(expense.amount_cents, expense.currency)}
        </span>
        <ChevronRight className="h-4 w-4 text-gray-300" />
      </div>
    </Link>
  );
}
