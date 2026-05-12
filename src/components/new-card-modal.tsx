"use client";

import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";

type Props = {
  open: boolean;
  last4: string;
  onConfirm: (args: { isBusiness: boolean; nickname: string }) => void;
  onCancel: () => void;
};

export function NewCardModal({ open, last4, onConfirm, onCancel }: Props) {
  const [isBusiness, setIsBusiness] = useState(true);
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    if (!open) return;
    setIsBusiness(true);
    setNickname("");
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Confirm new card"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">New card detected</h3>
        </div>

        <p className="mb-4 text-sm text-gray-600">
          We don&apos;t recognize <span className="font-medium tracking-wider">•••• {last4}</span>.
          Is this a business or personal card? You can change this anytime in Settings → Cards.
        </p>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsBusiness(true)}
            className={`rounded-xl border p-3 text-sm font-medium transition-colors ${
              isBusiness
                ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >
            Business
            <p className="mt-0.5 text-[11px] font-normal text-gray-500">
              Tax-deductible
            </p>
          </button>
          <button
            type="button"
            onClick={() => setIsBusiness(false)}
            className={`rounded-xl border p-3 text-sm font-medium transition-colors ${
              !isBusiness
                ? "border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/20"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >
            Personal
            <p className="mt-0.5 text-[11px] font-normal text-gray-500">
              Needs reimbursement
            </p>
          </button>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Nickname (optional)
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="e.g. Citi Business, Amex Plat"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
            autoFocus
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm({ isBusiness, nickname })}
            className="flex-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Save card &amp; expense
          </button>
        </div>
      </div>
    </div>
  );
}
