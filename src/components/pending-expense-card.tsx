"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Receipt as ReceiptIcon,
  WifiOff,
  Copy,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { expenseQueue, type QueuedExpense } from "@/lib/expense-queue";
import { formatCents, formatDate } from "@/lib/types";
import { getCategory } from "@/lib/categories";

type Props = {
  item: QueuedExpense;
};

export function PendingExpenseCard({ item }: Props) {
  const [thumb, setThumb] = useState<string | null>(null);
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    if (!item.image_blob) {
      setThumb(null);
      return;
    }
    const url = URL.createObjectURL(item.image_blob);
    setThumb(url);
    return () => URL.revokeObjectURL(url);
  }, [item.image_blob]);

  const category = getCategory(item.draft.category_code);
  const isPersonal = !item.draft.is_business;

  const statusBadge = (() => {
    if (item.status === "duplicate") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
          <Copy className="h-3 w-3" />
          Possible duplicate
        </span>
      );
    }
    if (item.status === "failed_image") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-800">
          <AlertTriangle className="h-3 w-3" />
          Receipt upload failed
        </span>
      );
    }
    if (item.last_error && item.attempts >= 2) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
          <AlertTriangle className="h-3 w-3" />
          Retrying…
        </span>
      );
    }
    if (!online) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-700">
          <WifiOff className="h-3 w-3" />
          Offline — will sync
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-800">
        <Loader2 className="h-3 w-3 animate-spin" />
        Syncing…
      </span>
    );
  })();

  return (
    <div
      className={`rounded-xl border border-dashed border-indigo-200 bg-white p-3 shadow-sm ${
        isPersonal ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        {thumb ? (
          <img
            src={thumb}
            alt=""
            className="h-12 w-12 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100">
            <ReceiptIcon className="h-5 w-5 text-gray-300" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-sm font-semibold ${
              isPersonal ? "text-gray-400" : "text-gray-900"
            }`}
          >
            {item.draft.merchant || "Unknown merchant"}
          </p>
          <div className="mt-0.5 flex items-center gap-1.5">
            <p className="truncate text-xs text-gray-500">
              {formatDate(item.draft.expense_date)}
              {category && (
                <>
                  {" "}
                  <span className="text-gray-300">&middot;</span>{" "}
                  {category.label}
                </>
              )}
            </p>
          </div>
          <div className="mt-1">{statusBadge}</div>
        </div>

        <div className="shrink-0 text-right">
          <span
            className={`text-sm font-semibold ${
              isPersonal ? "text-gray-400 line-through" : "text-gray-900"
            }`}
          >
            {formatCents(item.draft.amount_cents)}
          </span>
        </div>
      </div>

      {item.status === "duplicate" && item.duplicate_of && (
        <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-amber-100 pt-2 text-xs">
          <span className="text-amber-800">
            Matches {item.duplicate_of.merchant || "an existing expense"} ·{" "}
            {formatCents(item.duplicate_of.amount_cents)} ·{" "}
            {formatDate(item.duplicate_of.expense_date)}
          </span>
          <Link
            href={`/expense/${item.duplicate_of.id}`}
            className="rounded-md border border-amber-300 bg-white px-2 py-1 text-amber-900 hover:bg-amber-50"
          >
            View existing
          </Link>
          <button
            type="button"
            onClick={async () => {
              await expenseQueue.remove(item.local_id);
              const draft = { ...item.draft, skip_dupe_check: true };
              await expenseQueue.enqueue(draft, item.image_blob, item.receipt_path);
            }}
            className="rounded-md bg-amber-600 px-2 py-1 font-medium text-white hover:bg-amber-700"
          >
            Save anyway
          </button>
          <button
            type="button"
            onClick={() => expenseQueue.discard(item.local_id)}
            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-gray-700 hover:bg-gray-50"
          >
            Discard
          </button>
        </div>
      )}

      {item.status === "failed_image" && (
        <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-red-100 pt-2 text-xs">
          <span className="text-red-700">{item.last_error}</span>
          <button
            type="button"
            onClick={() => expenseQueue.saveWithoutReceipt(item.local_id)}
            className="rounded-md bg-indigo-600 px-2 py-1 font-medium text-white hover:bg-indigo-700"
          >
            Save without receipt
          </button>
          <button
            type="button"
            onClick={() => expenseQueue.retryNow(item.local_id)}
            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="mr-1 inline h-3 w-3" />
            Retry
          </button>
          <button
            type="button"
            onClick={() => expenseQueue.discard(item.local_id)}
            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-gray-700 hover:bg-gray-50"
          >
            Discard
          </button>
        </div>
      )}

      {item.status !== "duplicate" &&
        item.status !== "failed_image" &&
        item.last_error &&
        item.attempts >= 2 && (
          <div className="mt-2 flex items-center justify-between gap-2 border-t border-amber-100 pt-2 text-xs">
            <span className="truncate text-amber-700">{item.last_error}</span>
            <button
              type="button"
              onClick={() => expenseQueue.retryNow(item.local_id)}
              className="shrink-0 rounded-md border border-gray-200 bg-white px-2 py-1 text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw className="mr-1 inline h-3 w-3" />
              Retry now
            </button>
          </div>
        )}
    </div>
  );
}
