"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Hammer, ChevronDown, Plus, X, ExternalLink, Search } from "lucide-react";
import { type Sub } from "@/lib/types";
import { createSubAction } from "@/app/(app)/settings/subs/actions";

type Props = {
  subId: string | null;
  onChange: (subId: string | null) => void;
  subs: Sub[];
  onSubCreated?: (sub: Sub) => void;
  disabled?: boolean;
  highlight?: boolean; // visually emphasize (e.g. when category=contract_labor)
};

export function SubPicker({
  subId,
  onChange,
  subs,
  onSubCreated,
  disabled,
  highlight,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const selected = useMemo(
    () => subs.find((s) => s.id === subId) ?? null,
    [subs, subId],
  );

  const filtered = useMemo(() => {
    const list = subs.filter((s) => s.status !== "blacklisted");
    if (!query) return list;
    const q = query.toLowerCase();
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.trade?.toLowerCase().includes(q) ?? false),
    );
  }, [subs, query]);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    const fd = new FormData(e.currentTarget);
    if (query && !fd.get("name")) fd.set("name", query);
    const result = await createSubAction(fd);
    if (result.success && result.id) {
      // Optimistic local add — caller may also refresh server-fetched list
      const fresh: Sub = {
        id: result.id,
        user_id: "",
        name: (fd.get("name") as string) ?? "",
        trade: (fd.get("trade") as string) || null,
        contact_name: null,
        contact_email: null,
        contact_phone: null,
        tax_id: null,
        status: "active",
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      onSubCreated?.(fresh);
      onChange(result.id);
      setShowCreate(false);
      setOpen(false);
      setQuery("");
    } else {
      setCreateError(result.error ?? "Failed to create sub");
    }
    setCreating(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-gray-500">
          Paid to (sub)
        </label>
        {selected && (
          <Link
            href={`/settings/subs/${selected.id}`}
            target="_blank"
            className="inline-flex items-center gap-0.5 text-xs text-gray-400 hover:text-gray-600"
          >
            View sub <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        className={`mt-1 flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
          highlight && !selected
            ? "border-indigo-300 bg-indigo-50"
            : "border-gray-300 bg-white"
        } hover:bg-gray-50 disabled:opacity-50`}
      >
        {selected ? (
          <span className="flex items-center gap-2">
            <Hammer className="h-3.5 w-3.5 text-indigo-500" />
            <span className="font-medium text-gray-900">{selected.name}</span>
            {selected.trade && (
              <span className="text-xs text-gray-400">{selected.trade}</span>
            )}
          </span>
        ) : (
          <span className="text-gray-500">
            {highlight ? "Pick or add a sub (recommended for Contract Labor)" : "— None —"}
          </span>
        )}
        <span className="flex items-center gap-2">
          {selected && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              role="button"
              aria-label="Clear sub"
              className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </span>
      </button>

      {open && !disabled && (
        <div className="mt-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search subs..."
              className="w-full rounded-lg border border-gray-200 py-1.5 pl-8 pr-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              autoFocus
            />
          </div>
          <ul className="max-h-56 space-y-0.5 overflow-y-auto">
            {filtered.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(s.id);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm hover:bg-indigo-50 ${
                    subId === s.id ? "bg-indigo-50 text-indigo-700" : "text-gray-700"
                  }`}
                >
                  <span>{s.name}</span>
                  {s.trade && (
                    <span className="text-xs text-gray-400">{s.trade}</span>
                  )}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-2.5 py-2 text-xs text-gray-400">
                No matches.
              </li>
            )}
          </ul>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="mt-1 flex w-full items-center gap-2 rounded-lg border border-dashed border-indigo-300 px-2.5 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Add new sub{query ? `: "${query}"` : ""}
          </button>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Quick add sub</h3>
            {createError && (
              <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {createError}
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Name *
                </label>
                <input
                  name="name"
                  required
                  defaultValue={query}
                  autoFocus
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Trade
                </label>
                <input
                  name="trade"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="e.g. Plumbing"
                />
              </div>
              <input type="hidden" name="status" value="active" />
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  disabled={creating}
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {creating ? "Adding..." : "Add &amp; select"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
