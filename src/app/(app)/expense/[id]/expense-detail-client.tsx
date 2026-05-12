"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Receipt, ZoomIn } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryPicker } from "@/components/category-picker";
import { PaymentMethodPicker } from "@/components/payment-method-picker";
import { NewCardModal } from "@/components/new-card-modal";
import { SubPicker } from "@/components/sub-picker";
import { Lightbox } from "@/components/ui/lightbox";
import {
  type Expense,
  type PaymentMethod,
  type PaymentCard,
  type Sub,
  formatCents,
} from "@/lib/types";
import { updateExpenseAction, deleteExpenseAction } from "./actions";

type ExpenseDetailClientProps = {
  expense: Expense;
  receiptUrl: string | null;
  existingCards: PaymentCard[];
  existingSubs: Sub[];
};

export function ExpenseDetailClient({
  expense,
  receiptUrl,
  existingCards,
  existingSubs,
}: ExpenseDetailClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Form state
  const [merchant, setMerchant] = useState(expense.merchant ?? "");
  const [amount, setAmount] = useState(
    expense.amount_cents != null
      ? (expense.amount_cents / 100).toFixed(2)
      : "",
  );
  const [expenseDate, setExpenseDate] = useState(expense.expense_date ?? "");
  const [categoryCode, setCategoryCode] = useState(
    expense.category_code ?? "other",
  );
  const [businessPurpose, setBusinessPurpose] = useState(
    expense.business_purpose ?? "",
  );
  const [notes, setNotes] = useState(expense.notes ?? "");
  const [isBusiness, setIsBusiness] = useState(expense.is_business);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(expense.payment_method);
  const [cardLast4, setCardLast4] = useState<string | null>(expense.card_last4);
  const [cardId, setCardId] = useState<string | null>(expense.card_id);
  const [checkNumber, setCheckNumber] = useState(expense.check_number ?? "");
  const [referenceNumber, setReferenceNumber] = useState(expense.reference_number ?? "");
  const [newCardIsBusiness, setNewCardIsBusiness] = useState(true);
  const [newCardNickname, setNewCardNickname] = useState("");
  const [showNewCardModal, setShowNewCardModal] = useState(false);
  const [subId, setSubId] = useState<string | null>(expense.sub_id);
  const [localSubs, setLocalSubs] = useState<Sub[]>([]);
  const allSubs = [...existingSubs, ...localSubs];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      paymentMethod === "credit_card" &&
      cardLast4 &&
      /^\d{4}$/.test(cardLast4) &&
      !cardId &&
      !existingCards.find((c) => c.last4 === cardLast4)
    ) {
      setShowNewCardModal(true);
      return;
    }
    doSave();
  };

  const handleNewCardConfirm = ({ isBusiness, nickname }: { isBusiness: boolean; nickname: string }) => {
    setNewCardIsBusiness(isBusiness);
    setNewCardNickname(nickname);
    setShowNewCardModal(false);
    doSave({ newCard: { isBusiness, nickname } });
  };

  const doSave = async (opts?: { newCard?: { isBusiness: boolean; nickname: string } }) => {
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.set("merchant", merchant);
    formData.set("amount", amount);
    formData.set("expense_date", expenseDate);
    formData.set("category_code", categoryCode);
    formData.set("business_purpose", businessPurpose);
    formData.set("notes", notes);
    formData.set("is_business", isBusiness ? "true" : "false");
    if (paymentMethod) formData.set("payment_method", paymentMethod);
    if (cardLast4) formData.set("card_last4", cardLast4);
    if (cardId) formData.set("card_id", cardId);
    if (checkNumber) formData.set("check_number", checkNumber);
    if (referenceNumber) formData.set("reference_number", referenceNumber);
    if (subId) formData.set("sub_id", subId);
    else formData.set("sub_id", "");
    const effectiveIsBusiness = opts?.newCard?.isBusiness ?? newCardIsBusiness;
    const effectiveNickname = opts?.newCard?.nickname ?? newCardNickname;
    formData.set("new_card_is_business", effectiveIsBusiness ? "true" : "false");
    if (effectiveNickname) formData.set("new_card_nickname", effectiveNickname);

    const result = await updateExpenseAction(expense.id, formData);

    if (result.success) {
      router.push("/expenses");
      router.refresh();
    } else {
      setError(result.error || "Failed to save changes");
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteExpenseAction(expense.id);

    if (result.success) {
      router.push("/expenses");
      router.refresh();
    } else {
      setError(result.error || "Failed to delete expense");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pt-4 lg:pt-10">
      {/* Back button */}
      <Link
        href="/expenses"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Expenses
      </Link>

      {/* Receipt image */}
      <div className="mb-6 overflow-hidden rounded-xl bg-gray-100">
        {receiptUrl ? (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label="View full receipt"
            className="group relative block w-full focus:outline-none"
          >
            <img
              src={receiptUrl}
              alt="Receipt"
              className="mx-auto max-h-64 w-auto object-contain transition-opacity group-hover:opacity-90"
            />
            <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100">
              <ZoomIn className="h-4 w-4" />
            </span>
          </button>
        ) : (
          <div className="flex h-40 items-center justify-center">
            <Receipt className="h-12 w-12 text-gray-300" />
          </div>
        )}
      </div>

      {receiptUrl && (
        <Lightbox
          src={receiptUrl}
          alt={`Receipt for ${expense.merchant ?? "expense"}`}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* Amount display */}
      <div className="mb-6 text-center">
        <p className="text-3xl font-bold text-gray-900">
          {formatCents(expense.amount_cents, expense.currency)}
        </p>
        {expense.merchant && (
          <p className="mt-1 text-sm text-gray-500">{expense.merchant}</p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Edit form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Merchant"
          name="merchant"
          value={merchant}
          onChange={(e) => setMerchant(e.target.value)}
          placeholder="Business name"
        />

        <Input
          label="Amount ($)"
          name="amount"
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
        />

        <Input
          label="Date"
          name="expense_date"
          type="date"
          value={expenseDate}
          onChange={(e) => setExpenseDate(e.target.value)}
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Category
          </label>
          <CategoryPicker value={categoryCode} onChange={setCategoryCode} />
        </div>

        <Input
          label="Business Purpose"
          name="business_purpose"
          value={businessPurpose}
          onChange={(e) => setBusinessPurpose(e.target.value)}
          placeholder="e.g., Client lunch meeting"
        />

        <div>
          <label
            htmlFor="notes"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes..."
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
          />
        </div>

        {/* Business toggle */}
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Business Expense
            </p>
            <p className="text-xs text-gray-500">
              Mark as tax-deductible business expense
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isBusiness}
            onClick={() => setIsBusiness(!isBusiness)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
              isBusiness ? "bg-brand-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                isBusiness ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Payment method */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <PaymentMethodPicker
            paymentMethod={paymentMethod}
            cardLast4={cardLast4}
            cardId={cardId}
            checkNumber={checkNumber}
            referenceNumber={referenceNumber}
            newCardIsBusiness={newCardIsBusiness}
            newCardNickname={newCardNickname}
            onPaymentMethodChange={setPaymentMethod}
            onCardLast4Change={(v) => setCardLast4(v || null)}
            onCardIdChange={setCardId}
            onCheckNumberChange={setCheckNumber}
            onReferenceNumberChange={setReferenceNumber}
            onNewCardIsBusinessChange={setNewCardIsBusiness}
            onNewCardNicknameChange={setNewCardNickname}
            existingCards={existingCards}
          />
        </div>

        {/* Sub linkage */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <SubPicker
            subId={subId}
            onChange={setSubId}
            subs={allSubs}
            onSubCreated={(s) => setLocalSubs((prev) => [...prev, s])}
            highlight={categoryCode === "contract_labor"}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 pb-8">
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Delete Expense?
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              This action cannot be undone. The expense and its receipt will be
              permanently removed.
            </p>
            <div className="mt-4 flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <NewCardModal
        open={showNewCardModal}
        last4={cardLast4 ?? ""}
        onConfirm={handleNewCardConfirm}
        onCancel={() => setShowNewCardModal(false)}
      />
    </div>
  );
}
