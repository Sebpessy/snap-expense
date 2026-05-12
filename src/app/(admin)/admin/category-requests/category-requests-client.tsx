"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Clock, Tag } from "lucide-react";
import { type CategoryRequest, formatDate } from "@/lib/types";
import { reviewCategoryRequestAction } from "./actions";

type Props = {
  requests: CategoryRequest[];
  emailsByUserId: Record<string, string>;
};

const STATUS_FILTERS = ["pending", "approved", "rejected", "all"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const STATUS_STYLES: Record<CategoryRequest["status"], string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-gray-100 text-gray-600",
};

export function CategoryRequestsClient({ requests, emailsByUserId }: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [busy, setBusy] = useState<string | null>(null);

  const filtered = filter === "all"
    ? requests
    : requests.filter((r) => r.status === filter);

  async function review(id: string, status: "approved" | "rejected") {
    setBusy(id);
    await reviewCategoryRequestAction(id, status);
    router.refresh();
    setBusy(null);
  }

  return (
    <div className="mx-auto max-w-4xl p-4 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Category Requests</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review user-suggested Schedule C categories. Approval marks status only;
          adding to the global list requires a code update.
        </p>
      </div>

      <div className="mb-4 flex gap-1">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              filter === s
                ? "bg-indigo-600 text-white"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="ml-1 text-[10px] opacity-70">
              {requests.filter((r) => s === "all" || r.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <Tag className="mx-auto mb-2 h-8 w-8 text-gray-300" />
          <p className="text-sm text-gray-500">No {filter === "all" ? "" : filter} requests.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((r) => (
            <li key={r.id} className="rounded-xl bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {r.requested_label}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[r.status]}`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {r.suggested_schedule_c_line && (
                      <>
                        Suggested: <span className="font-medium">{r.suggested_schedule_c_line}</span>
                        {" · "}
                      </>
                    )}
                    {emailsByUserId[r.user_id] ?? r.user_id.slice(0, 8)}
                    {" · "}
                    {formatDate(r.created_at)}
                  </p>
                </div>
                {r.status === "pending" && (
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => review(r.id, "approved")}
                      disabled={busy === r.id}
                      className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-2 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => review(r.id, "rejected")}
                      disabled={busy === r.id}
                      className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" />
                      Reject
                    </button>
                  </div>
                )}
                {r.status !== "pending" && (
                  <Clock className="h-4 w-4 shrink-0 text-gray-300" />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
