"use client";

import { useState, useMemo } from "react";
import { Search, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/types";

interface Subscription {
  id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  status: string;
  plan: string;
  quantity: number;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  user_email: string;
}

interface SubscriptionsClientProps {
  initialSubscriptions: Subscription[];
}

const STATUS_BADGES: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  trialing: "bg-amber-100 text-amber-700",
  canceled: "bg-gray-100 text-gray-700",
  past_due: "bg-red-100 text-red-700",
};

const PLAN_BADGES: Record<string, string> = {
  pro: "bg-blue-100 text-blue-700",
  business: "bg-purple-100 text-purple-700",
};

const PAGE_SIZE = 20;

export function SubscriptionsClient({
  initialSubscriptions,
}: SubscriptionsClientProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search.trim()) return initialSubscriptions;
    const q = search.toLowerCase();
    return initialSubscriptions.filter((s) =>
      s.user_email.toLowerCase().includes(q)
    );
  }, [initialSubscriptions, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-sm text-gray-500">
            {initialSubscriptions.length} total subscriptions
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  User Email
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Plan
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Period Start
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Period End
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Cancel at End
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Created
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Stripe
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    No subscriptions found
                  </td>
                </tr>
              ) : (
                paged.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {sub.user_email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          PLAN_BADGES[sub.plan] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {sub.plan.charAt(0).toUpperCase() + sub.plan.slice(1)}
                        {sub.quantity > 1 && ` (x${sub.quantity})`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_BADGES[sub.status] ??
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {sub.status.charAt(0).toUpperCase() +
                          sub.status.slice(1).replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(sub.current_period_start)}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(sub.current_period_end)}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {sub.cancel_at_period_end ? (
                        <span className="text-amber-600 font-medium">Yes</span>
                      ) : (
                        "No"
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(sub.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`https://dashboard.stripe.com/subscriptions/${sub.stripe_subscription_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <span className="text-sm text-gray-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 text-sm rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 text-sm rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
