"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, ArrowRight, Tag } from "lucide-react";
import { type MerchantAlias } from "@/lib/types";
import { createAliasAction, deleteAliasAction, previewAliasMatches } from "./actions";

export function AliasesClient({ aliases }: { aliases: MerchantAlias[] }) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pattern, setPattern] = useState("");
  const [canonical, setCanonical] = useState("");
  const [preview, setPreview] = useState<{ count: number; samples: string[] } | null>(null);

  async function handlePreview() {
    if (!pattern.trim()) return setPreview(null);
    const result = await previewAliasMatches(pattern.trim());
    setPreview(result);
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const result = await createAliasAction(fd);
    if (result.success) {
      setShowAdd(false);
      setPattern("");
      setCanonical("");
      setPreview(null);
      router.refresh();
    } else {
      setError(result.error ?? "Failed to add alias");
    }
    setBusy(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this alias rule? Existing expenses keep their merchant names; only future scans are affected.")) {
      return;
    }
    setBusy(true);
    await deleteAliasAction(id);
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pt-4 lg:pt-10">
      <Link
        href="/settings"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Settings
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Merchant aliases</h1>
          <p className="mt-1 text-sm text-gray-500">
            Normalize merchant names. E.g. &ldquo;STARBUCKS #4321&rdquo; → &ldquo;Starbucks&rdquo;.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Add alias
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {aliases.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <Tag className="mx-auto mb-2 h-8 w-8 text-gray-300" />
          <p className="text-sm text-gray-500">
            No aliases yet. Add one to clean up merchant names from receipts.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {aliases.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="truncate text-gray-500">{a.pattern}</span>
                  <ArrowRight className="h-3 w-3 shrink-0 text-gray-300" />
                  <span className="truncate font-medium text-gray-900">{a.canonical}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(a.id)}
                disabled={busy}
                aria-label="Delete alias"
                className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Add alias rule</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Pattern (case-insensitive contains match)
                </label>
                <input
                  name="pattern"
                  required
                  value={pattern}
                  onChange={(e) => {
                    setPattern(e.target.value);
                    setPreview(null);
                  }}
                  onBlur={handlePreview}
                  placeholder="e.g. STARBUCKS"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  autoFocus
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Canonical name
                </label>
                <input
                  name="canonical"
                  required
                  value={canonical}
                  onChange={(e) => setCanonical(e.target.value)}
                  placeholder="e.g. Starbucks"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {preview && (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-xs text-indigo-900">
                  <p className="font-medium">
                    {preview.count} existing expense{preview.count === 1 ? "" : "s"} would have matched this pattern.
                  </p>
                  {preview.samples.length > 0 && (
                    <ul className="mt-1 list-disc pl-4 text-indigo-700">
                      {preview.samples.map((s) => (
                        <li key={s} className="truncate">{s}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  disabled={busy}
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy || !pattern.trim() || !canonical.trim()}
                  className="flex-1 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {busy ? "Adding..." : "Add alias"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
