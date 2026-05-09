"use client";

import { useState, useMemo } from "react";
import { CheckCircle2, XCircle, ChevronDown, ChevronRight, Search } from "lucide-react";

interface WebhookEvent {
  id: string;
  stripe_event_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  processed: boolean;
  error_message: string | null;
  processed_at: string | null;
}

interface WebhooksClientProps {
  initialEvents: WebhookEvent[];
}

const PAGE_SIZE = 20;

export function WebhooksClient({ initialEvents }: WebhooksClientProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("");
  const [page, setPage] = useState(1);

  // Get unique event types for filter dropdown
  const eventTypes = useMemo(() => {
    const types = new Set(initialEvents.map((e) => e.event_type));
    return Array.from(types).sort();
  }, [initialEvents]);

  const filtered = useMemo(() => {
    if (!filterType) return initialEvents;
    return initialEvents.filter((e) => e.event_type === filterType);
  }, [initialEvents, filterType]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Webhook Events</h1>
          <p className="text-sm text-gray-500">
            Showing last {initialEvents.length} events
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white appearance-none"
          >
            <option value="">All event types</option>
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold text-gray-600 w-8" />
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Event Type
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Stripe Event ID
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Processed
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Error
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    No webhook events found
                  </td>
                </tr>
              ) : (
                paged.map((event) => (
                  <>
                    <tr
                      key={event.id}
                      onClick={() =>
                        setExpandedId(
                          expandedId === event.id ? null : event.id
                        )
                      }
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-4 py-3 text-gray-400">
                        {expandedId === event.id ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-800">
                        {event.event_type}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        {event.stripe_event_id}
                      </td>
                      <td className="px-4 py-3">
                        {event.processed ? (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600">
                            <XCircle className="w-4 h-4" />
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-red-600 text-xs max-w-[200px] truncate">
                        {event.error_message ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {event.processed_at
                          ? new Date(event.processed_at).toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                    {expandedId === event.id && (
                      <tr key={`${event.id}-payload`}>
                        <td
                          colSpan={6}
                          className="px-4 py-4 bg-gray-900"
                        >
                          <pre className="text-xs text-green-400 overflow-x-auto max-h-96">
                            {JSON.stringify(event.payload, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </>
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
