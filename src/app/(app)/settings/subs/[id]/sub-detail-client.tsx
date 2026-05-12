"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, Plus, Tag, X } from "lucide-react";
import {
  type Sub,
  type SubAlias,
  type Expense,
  type SubStatus,
  formatCents,
  formatDate,
} from "@/lib/types";
import {
  updateSubAction,
  deleteSubAction,
  addSubAliasAction,
  deleteSubAliasAction,
} from "../actions";

type Props = {
  sub: Sub;
  aliases: SubAlias[];
  expenses: Expense[];
  ytdCents: number;
  lifetimeCents: number;
};

export function SubDetailClient({ sub, aliases, expenses, ytdCents, lifetimeCents }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aliasInput, setAliasInput] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Editable fields
  const [name, setName] = useState(sub.name);
  const [trade, setTrade] = useState(sub.trade ?? "");
  const [contactName, setContactName] = useState(sub.contact_name ?? "");
  const [contactEmail, setContactEmail] = useState(sub.contact_email ?? "");
  const [contactPhone, setContactPhone] = useState(sub.contact_phone ?? "");
  const [taxId, setTaxId] = useState(sub.tax_id ?? "");
  const [status, setStatus] = useState<SubStatus>(sub.status);
  const [notes, setNotes] = useState(sub.notes ?? "");

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const result = await updateSubAction(sub.id, fd);
    if (!result.success) setError(result.error ?? "Failed to save");
    else router.refresh();
    setBusy(false);
  }

  async function handleAddAlias() {
    if (!aliasInput.trim()) return;
    setBusy(true);
    setError(null);
    const fd = new FormData();
    fd.set("alias", aliasInput.trim());
    const result = await addSubAliasAction(sub.id, fd);
    if (result.success) {
      setAliasInput("");
      router.refresh();
    } else {
      setError(result.error ?? "Failed to add alias");
    }
    setBusy(false);
  }

  async function handleDeleteAlias(aliasId: string) {
    setBusy(true);
    await deleteSubAliasAction(aliasId, sub.id);
    router.refresh();
    setBusy(false);
  }

  async function handleDelete() {
    setBusy(true);
    const result = await deleteSubAction(sub.id);
    if (result.success) {
      router.push("/settings/subs");
      router.refresh();
    } else {
      setError(result.error ?? "Failed to delete");
      setShowDeleteConfirm(false);
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pt-4 lg:pt-10 pb-12">
      <Link
        href="/settings/subs"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        All Subs
      </Link>

      {/* Header card with YTD spend */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-[10px] uppercase tracking-wider text-gray-400">YTD Paid</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{formatCents(ytdCents)}</p>
          <p className="mt-0.5 text-xs text-gray-500">
            {ytdCents >= 60000 ? "Likely 1099-NEC threshold (≥ $600)" : "Below $600 threshold"}
          </p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-[10px] uppercase tracking-wider text-gray-400">Lifetime Paid</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{formatCents(lifetimeCents)}</p>
          <p className="mt-0.5 text-xs text-gray-500">{expenses.length} expense{expenses.length === 1 ? "" : "s"}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Edit form */}
      <form onSubmit={handleSave} className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          Sub details
        </h2>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Name *</label>
          <input
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Trade</label>
            <input
              name="trade"
              value={trade}
              onChange={(e) => setTrade(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="e.g. Plumbing"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Status</label>
            <select
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as SubStatus)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blacklisted">Blacklisted</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Contact name</label>
          <input
            name="contact_name"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Email</label>
            <input
              name="contact_email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Phone</label>
            <input
              name="contact_phone"
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Tax ID / EIN</label>
          <input
            name="tax_id"
            value={taxId}
            onChange={(e) => setTaxId(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            placeholder="For 1099 prep"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Notes</label>
          <textarea
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={busy}
            className="flex-1 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {busy ? "Saving..." : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={busy}
            className="rounded-xl bg-red-50 px-3 py-2 text-red-600 hover:bg-red-100"
            aria-label="Delete sub"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </form>

      {/* Aliases */}
      <div className="mt-4 rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-gray-400">
          <Tag className="h-3.5 w-3.5" />
          Aliases
        </h2>
        <p className="mb-3 text-xs text-gray-500">
          Receipts where the merchant matches one of these names auto-link to this sub.
          E.g. add &quot;JM Plumbing&quot; if Jose&apos;s invoices print that way.
        </p>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {aliases.map((a) => (
            <span
              key={a.id}
              className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs text-indigo-700"
            >
              {a.alias}
              <button
                type="button"
                onClick={() => handleDeleteAlias(a.id)}
                aria-label={`Remove alias ${a.alias}`}
                className="hover:text-indigo-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {aliases.length === 0 && (
            <p className="text-xs text-gray-400">No aliases yet.</p>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={aliasInput}
            onChange={(e) => setAliasInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddAlias();
              }
            }}
            placeholder="e.g. JM Plumbing"
            className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <button
            type="button"
            onClick={handleAddAlias}
            disabled={busy || !aliasInput.trim()}
            className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Linked expenses */}
      <div className="mt-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Linked expenses
        </h2>
        {expenses.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
            No expenses linked yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {expenses.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/expense/${e.id}`}
                  className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm hover:shadow-md"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {e.merchant ?? "—"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(e.expense_date)}
                      {e.payment_method && (
                        <>
                          {" "}
                          <span className="text-gray-300">·</span> {e.payment_method.replace("_", " ")}
                          {e.card_last4 && ` ••••${e.card_last4}`}
                        </>
                      )}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCents(e.amount_cents, e.currency)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Delete sub?</h3>
            <p className="mt-2 text-sm text-gray-500">
              Past expenses linked to this sub will remain but lose the link.
              Aliases will be deleted.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={busy}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {busy ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
