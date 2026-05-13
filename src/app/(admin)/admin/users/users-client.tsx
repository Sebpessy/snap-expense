"use client";

import { useState, useMemo } from "react";
import {
  Search,
  MoreHorizontal,
  ExternalLink,
  CalendarPlus,
  ArrowUpDown,
} from "lucide-react";
import { formatDate } from "@/lib/types";
import { extendTrialAction, changePlanAction } from "./actions";

interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  plan: string;
  trial_ends_at: string | null;
  scan_count_this_period: number | null;
  stripe_customer_id: string | null;
  created_at: string;
}

interface UsersClientProps {
  initialUsers: Profile[];
  planOptions: { code: string; name: string }[];
}

const PLAN_BADGE_COLORS: Record<string, string> = {
  free: "bg-gray-100 text-gray-700",
  pro: "bg-blue-100 text-blue-700",
  business: "bg-purple-100 text-purple-700",
};

const PAGE_SIZE = 20;

type SortKey = "email" | "plan" | "created_at" | "scan_count_this_period";
type SortDir = "asc" | "desc";

function getUserStatus(user: Profile): {
  label: string;
  color: string;
} {
  if (user.plan === "pro" || user.plan === "business") {
    return { label: "Active", color: "text-green-600" };
  }
  if (user.trial_ends_at && new Date(user.trial_ends_at) > new Date()) {
    return { label: "Trial", color: "text-amber-600" };
  }
  if (user.trial_ends_at && new Date(user.trial_ends_at) <= new Date()) {
    return { label: "Expired", color: "text-red-600" };
  }
  return { label: "Free", color: "text-gray-500" };
}

export function UsersClient({ initialUsers, planOptions }: UsersClientProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [extendingTrial, setExtendingTrial] = useState<string | null>(null);
  const [trialDays, setTrialDays] = useState(7);
  const [changingPlan, setChangingPlan] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = initialUsers;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          (u.display_name ?? "").toLowerCase().includes(q)
      );
    }

    result = [...result].sort((a, b) => {
      let cmp = 0;
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null && bv == null) cmp = 0;
      else if (av == null) cmp = -1;
      else if (bv == null) cmp = 1;
      else if (typeof av === "string" && typeof bv === "string")
        cmp = av.localeCompare(bv);
      else cmp = (av as number) - (bv as number);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [initialUsers, search, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const handleExtendTrial = async (userId: string) => {
    setIsSubmitting(true);
    setError(null);
    const result = await extendTrialAction(userId, trialDays);
    if (!result.success) {
      setError(result.error ?? "Failed to extend trial");
    } else {
      setExtendingTrial(null);
    }
    setIsSubmitting(false);
  };

  const handleChangePlan = async (userId: string, plan: string) => {
    setIsSubmitting(true);
    setError(null);
    const result = await changePlanAction(userId, plan);
    if (!result.success) {
      setError(result.error ?? "Failed to change plan");
    } else {
      setChangingPlan(null);
    }
    setIsSubmitting(false);
  };

  const SortHeader = ({
    label,
    sortKeyName,
  }: {
    label: string;
    sortKeyName: SortKey;
  }) => (
    <button
      onClick={() => toggleSort(sortKeyName)}
      className="flex items-center gap-1 font-semibold text-gray-600 hover:text-gray-900"
    >
      {label}
      <ArrowUpDown className="w-3.5 h-3.5" />
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500">
            {initialUsers.length} total users
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left">
                  <SortHeader label="Email" sortKeyName="email" />
                </th>
                <th className="px-4 py-3 text-left">
                  <SortHeader label="Plan" sortKeyName="plan" />
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Trial Ends
                </th>
                <th className="px-4 py-3 text-left">
                  <SortHeader
                    label="Scans"
                    sortKeyName="scan_count_this_period"
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <SortHeader label="Signed Up" sortKeyName="created_at" />
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                paged.map((user) => {
                  const status = getUserStatus(user);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-gray-900 font-medium">
                            {user.email}
                          </p>
                          {user.display_name && (
                            <p className="text-gray-400 text-xs">
                              {user.display_name}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            PLAN_BADGE_COLORS[user.plan] ?? PLAN_BADGE_COLORS.free
                          }`}
                        >
                          {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {user.trial_ends_at
                          ? formatDate(user.trial_ends_at)
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {user.scan_count_this_period ?? 0}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveDropdown(
                                activeDropdown === user.id ? null : user.id
                              )
                            }
                            className="p-1 rounded hover:bg-gray-100"
                          >
                            <MoreHorizontal className="w-4 h-4 text-gray-500" />
                          </button>

                          {activeDropdown === user.id && (
                            <div className="absolute right-0 top-8 z-20 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                              <button
                                onClick={() => {
                                  setExtendingTrial(user.id);
                                  setChangingPlan(null);
                                  setActiveDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <CalendarPlus className="w-4 h-4" /> Extend
                                Trial
                              </button>
                              <button
                                onClick={() => {
                                  setChangingPlan(user.id);
                                  setExtendingTrial(null);
                                  setActiveDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <ArrowUpDown className="w-4 h-4" /> Change Plan
                              </button>
                              {user.stripe_customer_id && (
                                <a
                                  href={`https://dashboard.stripe.com/customers/${user.stripe_customer_id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <ExternalLink className="w-4 h-4" /> View in
                                  Stripe
                                </a>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Extend trial inline form */}
                        {extendingTrial === user.id && (
                          <div className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <p className="text-xs font-medium text-amber-800 mb-2">
                              Extend trial by:
                            </p>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={1}
                                max={365}
                                value={trialDays}
                                onChange={(e) =>
                                  setTrialDays(parseInt(e.target.value) || 7)
                                }
                                className="w-20 px-2 py-1 text-sm border border-amber-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-400"
                              />
                              <span className="text-xs text-amber-700">
                                days
                              </span>
                              <button
                                onClick={() => handleExtendTrial(user.id)}
                                disabled={isSubmitting}
                                className="px-3 py-1 text-xs font-medium bg-amber-500 text-white rounded hover:bg-amber-600 disabled:opacity-50"
                              >
                                {isSubmitting ? "..." : "Apply"}
                              </button>
                              <button
                                onClick={() => setExtendingTrial(null)}
                                className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Change plan inline form */}
                        {changingPlan === user.id && (
                          <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-xs font-medium text-blue-800 mb-2">
                              Change plan to:
                            </p>
                            <div className="flex items-center gap-2">
                              <select
                                defaultValue={user.plan}
                                onChange={(e) =>
                                  handleChangePlan(user.id, e.target.value)
                                }
                                disabled={isSubmitting}
                                className="px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                              >
                                {planOptions.map((p) => (
                                  <option key={p.code} value={p.code}>
                                    {p.name}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => setChangingPlan(null)}
                                className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
