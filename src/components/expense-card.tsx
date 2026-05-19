"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, ChevronRight, Receipt as ReceiptIcon } from "lucide-react";
import { type Expense, formatCents, formatDate } from "@/lib/types";
import { getCategory } from "@/lib/categories";
import { Lightbox } from "@/components/ui/lightbox";

type ExpenseCardProps = {
  expense: Expense;
  thumbUrl?: string | null;
  projectName?: string;
};

export function ExpenseCard({ expense, thumbUrl, projectName }: ExpenseCardProps) {
  const category = getCategory(expense.category_code);
  const isPersonal = !expense.is_business;
  const lowConfidence =
    expense.category_confidence != null && expense.category_confidence < 0.6;
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <div
        className={`flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm transition-shadow hover:shadow-md ${
          isPersonal ? "opacity-60" : ""
        }`}
      >
        {/* Thumbnail (clickable -> lightbox) */}
        {thumbUrl ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(true);
            }}
            aria-label="View receipt"
            className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100 transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <img
              src={thumbUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          </button>
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100">
            <ReceiptIcon className="h-5 w-5 text-gray-300" />
          </div>
        )}

        {/* Body (clickable -> detail page) */}
        <Link
          href={`/expense/${expense.id}`}
          className="flex min-w-0 flex-1 items-center gap-3"
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
            {projectName && (
              <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-indigo-600">
                <Building2 className="h-2.5 w-2.5" />
                <span className="truncate">{projectName}</span>
              </p>
            )}
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
      </div>

      {thumbUrl && (
        <Lightbox
          src={thumbUrl}
          alt={`Receipt for ${expense.merchant ?? "expense"}`}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
