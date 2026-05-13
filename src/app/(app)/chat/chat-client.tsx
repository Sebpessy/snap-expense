"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Send, MessageSquare, AlertTriangle, Check, ArrowLeft, Mic, Square } from "lucide-react";
import { CategoryPicker } from "@/components/category-picker";
import { PaymentMethodPicker } from "@/components/payment-method-picker";
import { NewCardModal } from "@/components/new-card-modal";
import { SubPicker } from "@/components/sub-picker";
import { getCategory } from "@/lib/categories";
import { useVoiceInput } from "@/lib/use-voice-input";
import {
  formatCents,
  type UserPlan,
  type ExtractionResult,
  type PaymentMethod,
  type PaymentCard,
  type Sub,
} from "@/lib/types";
import { saveExpenseAction } from "@/app/(app)/capture/actions";

type Stage = "idle" | "thinking" | "review" | "saving";

export function ChatClient({
  hasApiKey,
  userPlan,
  existingCards,
  existingSubs,
}: {
  hasApiKey: boolean;
  userPlan: UserPlan;
  existingCards: PaymentCard[];
  existingSubs: Sub[];
}) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("idle");
  const [message, setMessage] = useState("");
  const [lastMessage, setLastMessage] = useState("");
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Review fields
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [categoryCode, setCategoryCode] = useState("other");
  const [businessPurpose, setBusinessPurpose] = useState("");
  const [isBusiness, setIsBusiness] = useState(true);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [cardLast4, setCardLast4] = useState<string | null>(null);
  const [cardId, setCardId] = useState<string | null>(null);
  const [checkNumber, setCheckNumber] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [newCardIsBusiness, setNewCardIsBusiness] = useState(true);
  const [newCardNickname, setNewCardNickname] = useState("");
  const [showNewCardModal, setShowNewCardModal] = useState(false);

  const [subId, setSubId] = useState<string | null>(null);
  const [localSubs, setLocalSubs] = useState<Sub[]>([]);
  const allSubs = [...existingSubs, ...localSubs];

  const voice = useVoiceInput({
    onFinal: (text) => {
      setMessage((prev) => {
        const trimmed = prev.trimEnd();
        const sep = trimmed && !/[.!?]$/.test(trimmed) ? " " : trimmed ? " " : "";
        return trimmed + sep + text.trim();
      });
    },
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (voice.listening) voice.stop();
    if (!message.trim()) return;
    setStage("thinking");
    setError(null);
    setLastMessage(message);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Request failed");
        setStage("idle");
        return;
      }
      const ext = data.extraction as ExtractionResult;
      setExtraction(ext);
      setMerchant(ext.merchant ?? "");
      setAmount(ext.amount_cents != null ? (ext.amount_cents / 100).toFixed(2) : "");
      setExpenseDate(ext.expense_date ?? "");
      setCategoryCode(ext.category_code);
      setBusinessPurpose(ext.business_purpose ?? "");
      setIsBusiness(ext.is_business);
      setPaymentMethod(ext.payment_method);
      setCardLast4(ext.card_last4);
      if (ext.card_last4) {
        const match = existingCards.find((c) => c.last4 === ext.card_last4);
        setCardId(match?.id ?? null);
      }
      // Chat extraction may include check_number / reference_number — prefill if present
      const extWithRefs = ext as ExtractionResult & {
        check_number?: string | null;
        reference_number?: string | null;
      };
      if (extWithRefs.check_number) setCheckNumber(extWithRefs.check_number);
      if (extWithRefs.reference_number) setReferenceNumber(extWithRefs.reference_number);
      setMessage("");
      setStage("review");
    } catch (err) {
      setError((err as Error).message || "Network error");
      setStage("idle");
    }
  }

  async function doSave(opts?: { newCard?: { isBusiness: boolean; nickname: string } }) {
    if (!extraction) return;
    setStage("saving");
    setError(null);

    // saveExpenseAction handles missing image — chat entries have no receipt
    const formData = new FormData();
    formData.append("merchant", merchant);
    formData.append("amount_cents", amount ? String(Math.round(parseFloat(amount) * 100)) : "");
    formData.append("expense_date", expenseDate);
    formData.append("category_code", categoryCode);
    formData.append("business_purpose", businessPurpose);
    formData.append("is_business", isBusiness ? "true" : "false");
    formData.append("raw_extraction", JSON.stringify(extraction));
    if (paymentMethod) formData.append("payment_method", paymentMethod);
    if (cardLast4) formData.append("card_last4", cardLast4);
    if (cardId) formData.append("card_id", cardId);
    if (checkNumber) formData.append("check_number", checkNumber);
    if (referenceNumber) formData.append("reference_number", referenceNumber);
    if (subId) formData.append("sub_id", subId);
    const effectiveIsBusiness = opts?.newCard?.isBusiness ?? newCardIsBusiness;
    const effectiveNickname = opts?.newCard?.nickname ?? newCardNickname;
    formData.append("new_card_is_business", effectiveIsBusiness ? "true" : "false");
    if (effectiveNickname) formData.append("new_card_nickname", effectiveNickname);
    formData.append("skip_dupe_check", "true"); // chat entries skip the photo dedup check

    const result = await saveExpenseAction(formData);
    if (!result.success) {
      setError(result.error ?? "Save failed");
      setStage("review");
      return;
    }

    router.push("/expenses");
    router.refresh();
  }

  function handleSaveClick() {
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
  }

  function handleNewCardConfirm({ isBusiness: biz, nickname }: { isBusiness: boolean; nickname: string }) {
    setNewCardIsBusiness(biz);
    setNewCardNickname(nickname);
    setShowNewCardModal(false);
    doSave({ newCard: { isBusiness: biz, nickname } });
  }

  function handleBack() {
    setStage("idle");
    setExtraction(null);
    setError(null);
    setMessage(lastMessage);
  }

  const category = getCategory(categoryCode);

  return (
    <div className="mx-auto max-w-lg px-4 py-6 pb-24">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Chat entry</h1>
        <Link href="/capture" className="text-xs text-gray-500 hover:text-gray-700">
          Use camera instead →
        </Link>
      </div>
      <p className="mb-4 text-sm text-gray-500">
        Describe an expense in plain English. Example:{" "}
        <em>&ldquo;Spent $12 at Starbucks yesterday on coffee with a client.&rdquo;</em>
      </p>

      {!hasApiKey && (
        <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            Add your Anthropic API key in{" "}
            <Link href="/settings" className="font-semibold underline">Settings</Link>{" "}
            to use chat entry.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Compose stage */}
      {(stage === "idle" || stage === "thinking") && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <textarea
              value={message + (voice.interim ? (message.trimEnd() ? " " : "") + voice.interim : "")}
              onChange={(e) => setMessage(e.target.value)}
              disabled={stage === "thinking" || !hasApiKey || !userPlan.canScan}
              rows={4}
              placeholder={voice.listening ? "Listening… speak now" : "Spent $45 on home depot lumber last Tuesday, business…"}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 pr-12 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
              autoFocus
            />
            {voice.supported && (
              <button
                type="button"
                onClick={() => (voice.listening ? voice.stop() : voice.start())}
                disabled={stage === "thinking" || !hasApiKey || !userPlan.canScan}
                aria-label={voice.listening ? "Stop voice input" : "Start voice input"}
                aria-pressed={voice.listening}
                className={
                  "absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 " +
                  (voice.listening
                    ? "animate-pulse bg-red-600 hover:bg-red-700"
                    : "bg-indigo-600 hover:bg-indigo-700")
                }
              >
                {voice.listening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            )}
          </div>
          {voice.error && (
            <p className="text-xs text-red-600">{voice.error}</p>
          )}
          {!voice.supported && (
            <p className="text-xs text-gray-400">
              Voice input isn&rsquo;t supported in this browser — try Safari or Chrome.
            </p>
          )}
          <button
            type="submit"
            disabled={stage === "thinking" || !message.trim() || !hasApiKey || !userPlan.canScan}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {stage === "thinking" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Parsing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Parse expense
              </>
            )}
          </button>
          {userPlan.scanLimit !== null && (
            <p className="text-center text-xs text-gray-500">
              {userPlan.scanCount} / {userPlan.scanLimit} scans used this month
            </p>
          )}
        </form>
      )}

      {/* Review stage — same shape as capture review */}
      {(stage === "review" || stage === "saving") && extraction && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleBack}
            disabled={stage === "saving"}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Edit message
          </button>

          {lastMessage && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <p className="flex items-start gap-1.5 text-xs text-gray-500">
                <MessageSquare className="mt-0.5 h-3 w-3 shrink-0" />
                <span>{lastMessage}</span>
              </p>
            </div>
          )}

          {extraction.warnings.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div className="space-y-1">
                  {extraction.warnings.map((w, i) => (
                    <p key={i} className="text-sm text-amber-800">{w}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <Field label="Merchant">
              <input
                type="text"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                disabled={stage === "saving"}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
              />
            </Field>
            <Field label="Amount ($)">
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={stage === "saving"}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
              />
            </Field>
            <Field label="Date">
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                disabled={stage === "saving"}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
              />
            </Field>
            <Field label="Category">
              <CategoryPicker value={categoryCode} onChange={setCategoryCode} />
              <p className="mt-1 text-xs text-gray-400">
                {category.label} · confidence {Math.round(extraction.category_confidence * 100)}%
              </p>
            </Field>
            <Field label="Business Purpose">
              <input
                type="text"
                value={businessPurpose}
                onChange={(e) => setBusinessPurpose(e.target.value)}
                disabled={stage === "saving"}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
              />
            </Field>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={isBusiness}
                onChange={(e) => setIsBusiness(e.target.checked)}
                disabled={stage === "saving"}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Business expense (tax deductible)</span>
            </label>

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
              disabled={stage === "saving"}
            />

            <SubPicker
              subId={subId}
              onChange={setSubId}
              subs={allSubs}
              onSubCreated={(s) => setLocalSubs((prev) => [...prev, s])}
              disabled={stage === "saving"}
              highlight={categoryCode === "contract_labor"}
            />
          </div>

          <button
            type="button"
            onClick={handleSaveClick}
            disabled={stage === "saving"}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {stage === "saving" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Save expense
              </>
            )}
          </button>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-500">{label}</label>
      {children}
    </div>
  );
}
