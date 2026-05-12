"use client";

import { CreditCard, Banknote, Wallet, CircleDollarSign, ArrowRightLeft, MoreHorizontal, AlertTriangle } from "lucide-react";
import { type PaymentMethod, type PaymentCard } from "@/lib/types";

type Props = {
  paymentMethod: PaymentMethod | null;
  cardLast4: string | null;
  cardId: string | null;
  checkNumber: string;
  referenceNumber: string;
  newCardIsBusiness: boolean;
  newCardNickname: string;
  onPaymentMethodChange: (m: PaymentMethod | null) => void;
  onCardLast4Change: (v: string) => void;
  onCardIdChange: (id: string | null) => void;
  onCheckNumberChange: (v: string) => void;
  onReferenceNumberChange: (v: string) => void;
  onNewCardIsBusinessChange: (b: boolean) => void;
  onNewCardNicknameChange: (v: string) => void;
  existingCards: PaymentCard[];
  disabled?: boolean;
};

type QuickMethod = {
  value: Extract<PaymentMethod, "cash" | "check" | "zelle" | "wire" | "other">;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const QUICK_METHODS: QuickMethod[] = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "check", label: "Check", icon: Wallet },
  { value: "zelle", label: "Zelle", icon: CircleDollarSign },
  { value: "wire", label: "Wire", icon: ArrowRightLeft },
  { value: "other", label: "Other", icon: MoreHorizontal },
];

export function PaymentMethodPicker({
  paymentMethod,
  cardLast4,
  cardId,
  checkNumber,
  referenceNumber,
  newCardIsBusiness,
  newCardNickname,
  onPaymentMethodChange,
  onCardLast4Change,
  onCardIdChange,
  onCheckNumberChange,
  onReferenceNumberChange,
  onNewCardIsBusinessChange,
  onNewCardNicknameChange,
  existingCards,
  disabled,
}: Props) {
  const matchingCard =
    cardLast4 && /^\d{4}$/.test(cardLast4)
      ? existingCards.find((c) => c.last4 === cardLast4) ?? null
      : null;
  const isNewCardEntry =
    paymentMethod === "credit_card" &&
    !cardId &&
    !!cardLast4 &&
    /^\d{4}$/.test(cardLast4) &&
    !matchingCard;

  function selectCard(c: PaymentCard) {
    onPaymentMethodChange("credit_card");
    onCardIdChange(c.id);
    onCardLast4Change(c.last4);
    onCheckNumberChange("");
    onReferenceNumberChange("");
  }

  function selectQuickMethod(v: QuickMethod["value"]) {
    onPaymentMethodChange(v);
    onCardIdChange(null);
    onCardLast4Change("");
  }

  function selectManualCardEntry() {
    onPaymentMethodChange("credit_card");
    onCardIdChange(null);
    // keep whatever last4 is there (might be extracted from receipt)
    onCheckNumberChange("");
    onReferenceNumberChange("");
  }

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium text-gray-500">
        Payment method
      </label>

      {/* Registered cards (tiles) */}
      {existingCards.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {existingCards.map((c) => {
            const selected =
              paymentMethod === "credit_card" && cardId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => selectCard(c)}
                disabled={disabled}
                className={`flex items-start gap-2 rounded-xl border p-3 text-left transition-colors ${
                  selected
                    ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20"
                    : "border-gray-200 bg-white hover:border-gray-300"
                } ${!c.is_business ? "border-l-4 border-l-amber-400" : ""} disabled:opacity-50`}
              >
                <CreditCard
                  className={`mt-0.5 h-4 w-4 shrink-0 ${
                    selected ? "text-indigo-600" : "text-gray-400"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {c.nickname || "Card"}
                  </p>
                  <p className="text-xs text-gray-500">
                    •••• {c.last4}
                    {!c.is_business && (
                      <span className="ml-1 text-amber-700">· Personal</span>
                    )}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Personal-card warning */}
      {paymentMethod === "credit_card" && matchingCard && !matchingCard.is_business && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Personal card — flag for reimbursement.
        </div>
      )}

      {/* Quick payment row */}
      <div>
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-gray-400">
          Quick payment
        </p>
        <div className="flex flex-wrap gap-2">
          {/* "Use a different card" option — only when there's an extracted last4 with no card match */}
          {paymentMethod === "credit_card" && !cardId && (
            <button
              type="button"
              onClick={selectManualCardEntry}
              disabled={disabled}
              className="flex items-center gap-1.5 rounded-lg border border-indigo-500 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 ring-2 ring-indigo-500/20 disabled:opacity-50"
            >
              <CreditCard className="h-3.5 w-3.5" />
              New card
            </button>
          )}
          {QUICK_METHODS.map((m) => {
            const selected = paymentMethod === m.value;
            const Icon = m.icon;
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => selectQuickMethod(m.value)}
                disabled={disabled}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  selected
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                } disabled:opacity-50`}
              >
                <Icon className="h-3.5 w-3.5" />
                {m.label}
              </button>
            );
          })}
          {/* Show "New card" trigger when no method picked yet and no existing cards */}
          {paymentMethod === null && existingCards.length === 0 && (
            <button
              type="button"
              onClick={selectManualCardEntry}
              disabled={disabled}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-gray-300 disabled:opacity-50"
            >
              <CreditCard className="h-3.5 w-3.5" />
              Credit / debit card
            </button>
          )}
        </div>
      </div>

      {/* Sub-form: Check */}
      {paymentMethod === "check" && (
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Check number
          </label>
          <input
            type="text"
            value={checkNumber}
            onChange={(e) => onCheckNumberChange(e.target.value)}
            disabled={disabled}
            placeholder="e.g. 1042"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none disabled:opacity-50"
          />
        </div>
      )}

      {/* Sub-form: Zelle */}
      {paymentMethod === "zelle" && (
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Zelle reference
          </label>
          <input
            type="text"
            value={referenceNumber}
            onChange={(e) => onReferenceNumberChange(e.target.value)}
            disabled={disabled}
            placeholder="Confirmation code (optional)"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none disabled:opacity-50"
          />
        </div>
      )}

      {/* Sub-form: Wire */}
      {paymentMethod === "wire" && (
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Wire reference
          </label>
          <input
            type="text"
            value={referenceNumber}
            onChange={(e) => onReferenceNumberChange(e.target.value)}
            disabled={disabled}
            placeholder="Wire confirmation / IMAD ref"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none disabled:opacity-50"
          />
        </div>
      )}

      {/* Sub-form: Credit card last-4 (only when no registered card selected) */}
      {paymentMethod === "credit_card" && !cardId && (
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Card last 4
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={cardLast4 ?? ""}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/\D/g, "").slice(0, 4);
              onCardLast4Change(cleaned);
              const match = existingCards.find((x) => x.last4 === cleaned) ?? null;
              onCardIdChange(match?.id ?? null);
            }}
            disabled={disabled}
            placeholder="1234"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm tracking-widest focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none disabled:opacity-50"
          />
          {isNewCardEntry && (
            <p className="mt-1.5 text-xs text-indigo-700">
              New card — you&apos;ll be asked to confirm business/personal on save.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
