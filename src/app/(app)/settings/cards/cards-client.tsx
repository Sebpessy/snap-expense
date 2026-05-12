"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, CreditCard } from "lucide-react";
import { type PaymentCard } from "@/lib/types";
import { createCardAction, updateCardAction, deleteCardAction } from "./actions";

export function CardsClient({ cards }: { cards: PaymentCard[] }) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Add form state
  const [last4, setLast4] = useState("");
  const [nickname, setNickname] = useState("");
  const [isBusiness, setIsBusiness] = useState(true);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData();
    fd.set("last4", last4);
    fd.set("nickname", nickname);
    fd.set("is_business", isBusiness ? "true" : "false");
    const result = await createCardAction(fd);
    if (result.success) {
      setShowAdd(false);
      setLast4("");
      setNickname("");
      setIsBusiness(true);
      router.refresh();
    } else {
      setError(result.error ?? "Failed to add card");
    }
    setBusy(false);
  }

  async function handleToggleBusiness(card: PaymentCard) {
    const fd = new FormData();
    fd.set("nickname", card.nickname ?? "");
    fd.set("is_business", card.is_business ? "false" : "true");
    await updateCardAction(card.id, fd);
    router.refresh();
  }

  async function handleRename(card: PaymentCard) {
    const next = prompt("Nickname (leave empty to clear)", card.nickname ?? "");
    if (next === null) return;
    const fd = new FormData();
    fd.set("nickname", next);
    fd.set("is_business", card.is_business ? "true" : "false");
    await updateCardAction(card.id, fd);
    router.refresh();
  }

  async function handleDelete(card: PaymentCard) {
    if (!confirm(`Delete card ending in ${card.last4}? Past expenses paid with this card will remain but lose the card link.`)) return;
    await deleteCardAction(card.id);
    router.refresh();
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
          <h1 className="text-2xl font-bold text-gray-900">Payment Cards</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track which cards are business vs personal for cleaner reconciliation.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Add card
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {cards.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <CreditCard className="mx-auto mb-2 h-8 w-8 text-gray-300" />
          <p className="text-sm text-gray-500">
            No cards yet. They&apos;ll appear here automatically as you record
            receipts paid by card, or add one manually.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {cards.map((card) => (
            <li
              key={card.id}
              className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm"
            >
              <CreditCard className="h-5 w-5 shrink-0 text-gray-400" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold tracking-wider text-gray-900">
                    •••• {card.last4}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleToggleBusiness(card)}
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      card.is_business
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {card.is_business ? "Business" : "Personal"}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleRename(card)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  {card.nickname || "Add nickname"}
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(card)}
                aria-label="Delete card"
                className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Add a card</h3>
            <form onSubmit={handleAdd} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Last 4 digits
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={last4}
                  onChange={(e) => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="1234"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm tracking-widest focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Nickname (optional)
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. Amex Plat"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 text-sm">
                  <input
                    type="radio"
                    checked={isBusiness}
                    onChange={() => setIsBusiness(true)}
                  />
                  Business
                </label>
                <label className="flex items-center gap-1.5 text-sm">
                  <input
                    type="radio"
                    checked={!isBusiness}
                    onChange={() => setIsBusiness(false)}
                  />
                  Personal
                </label>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={busy}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy || !/^\d{4}$/.test(last4)}
                  className="flex-1 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {busy ? "Adding…" : "Add card"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
