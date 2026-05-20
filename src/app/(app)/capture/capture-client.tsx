"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Camera,
  Loader2,
  AlertTriangle,
  Check,
  ArrowLeft,
  Mic,
  Square,
  Send,
  MessageSquare,
} from "lucide-react";
import { CategoryPicker } from "@/components/category-picker";
import { PaymentMethodPicker } from "@/components/payment-method-picker";
import { NewCardModal } from "@/components/new-card-modal";
import { SubPicker } from "@/components/sub-picker";
import { ProjectPicker } from "@/components/project-picker";
import { getCategory } from "@/lib/categories";
import { useVoiceInput } from "@/lib/use-voice-input";
import {
  formatCents,
  type UserPlan,
  type ExtractionResult,
  type PaymentMethod,
  type PaymentCard,
  type Sub,
  type Project,
} from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { expenseQueue, type ExpenseDraft } from "@/lib/expense-queue";
import { resizeImageForUpload } from "@/lib/resize-image";
import { extractReceiptAction } from "./actions";

type Stage = "idle" | "extracting" | "thinking" | "review" | "saving";

type EntrySource = "photo" | "chat" | null;

export function CaptureClient({
  hasApiKey,
  userPlan,
  existingCards,
  existingSubs,
  existingProjects,
  projectRecencyDays,
}: {
  hasApiKey: boolean;
  userPlan: UserPlan;
  existingCards: PaymentCard[];
  existingSubs: Sub[];
  existingProjects: Project[];
  projectRecencyDays: Record<string, number>;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Background receipt upload state — populated as soon as extraction succeeds.
  // By the time the user clicks Log Expense, the receipt is usually already in
  // Supabase Storage and the commit becomes a tiny DB-only request.
  const resizedBlobRef = useRef<Blob | null>(null);
  const receiptPathRef = useRef<string | null>(null);

  const [stage, setStage] = useState<Stage>("idle");
  const [entrySource, setEntrySource] = useState<EntrySource>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Chat-style entry
  const [chatMessage, setChatMessage] = useState("");
  const [lastChatMessage, setLastChatMessage] = useState("");
  const voice = useVoiceInput({
    onFinal: (text) => {
      setChatMessage((prev) => {
        const trimmed = prev.trimEnd();
        const sep = trimmed && !/[.!?]$/.test(trimmed) ? " " : "";
        return trimmed + sep + text.trim();
      });
    },
  });

  // Editable form fields (populated from extraction)
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [categoryCode, setCategoryCode] = useState("other");
  const [businessPurpose, setBusinessPurpose] = useState("");
  const [isBusiness, setIsBusiness] = useState(true);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Payment fields
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [cardLast4, setCardLast4] = useState<string | null>(null);
  const [cardId, setCardId] = useState<string | null>(null);
  const [checkNumber, setCheckNumber] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [newCardIsBusiness, setNewCardIsBusiness] = useState(true);
  const [newCardNickname, setNewCardNickname] = useState("");
  const [showNewCardModal, setShowNewCardModal] = useState(false);

  // Sub linkage
  const [subId, setSubId] = useState<string | null>(null);
  // Local-only optimistic subs (newly created via picker) so they appear immediately
  const [localSubs, setLocalSubs] = useState<Sub[]>([]);
  const allSubs = [...existingSubs, ...localSubs];

  // Project linkage (same pattern as subs)
  const [projectId, setProjectId] = useState<string | null>(null);
  const [localProjects, setLocalProjects] = useState<Project[]>([]);
  const allProjects = [...existingProjects, ...localProjects];

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setEntrySource("photo");
    setError(null);
    resizedBlobRef.current = null;
    receiptPathRef.current = null;
    // Reset the input so picking the SAME file again still triggers onChange
    e.target.value = "";
    // Fire extraction immediately — no need for the user to tap "Analyze"
    if (hasApiKey && userPlan.canScan) {
      handleExtract(file);
    }
  }

  // Resize the receipt and start uploading it to Supabase Storage in the
  // background while the user reviews the extracted fields. If they click
  // Log Expense before this finishes, the queue worker will pick it up.
  async function startBackgroundReceiptUpload(file: File) {
    try {
      const resized = await resizeImageForUpload(file);
      resizedBlobRef.current = resized;
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}.jpg`;
      const { error } = await supabase.storage
        .from("receipts")
        .upload(path, resized, {
          contentType: "image/jpeg",
          upsert: false,
        });
      if (!error) receiptPathRef.current = path;
    } catch {
      // Swallow — the queue worker will retry the upload at save time.
    }
  }

  async function handleChatSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (voice.listening) voice.stop();
    if (!chatMessage.trim()) return;
    setEntrySource("chat");
    setStage("thinking");
    setError(null);
    setLastChatMessage(chatMessage);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: chatMessage }),
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
      setAmount(
        ext.amount_cents != null ? (ext.amount_cents / 100).toFixed(2) : "",
      );
      setExpenseDate(ext.expense_date ?? "");
      setCategoryCode(ext.category_code);
      setBusinessPurpose(ext.business_purpose ?? "");
      setIsBusiness(ext.is_business);
      setPaymentMethod(ext.payment_method);
      setCardLast4(ext.card_last4);
      if (ext.card_last4) {
        const match = existingCards.find((c) => c.last4 === ext.card_last4);
        setCardId(match?.id ?? null);
        if (match) setNewCardIsBusiness(match.is_business);
      }
      // Chat extraction may include check_number / reference_number — prefill if present
      const extWithRefs = ext as ExtractionResult & {
        check_number?: string | null;
        reference_number?: string | null;
      };
      if (extWithRefs.check_number) setCheckNumber(extWithRefs.check_number);
      if (extWithRefs.reference_number) setReferenceNumber(extWithRefs.reference_number);
      setChatMessage("");
      setStage("review");
    } catch (err) {
      setError((err as Error).message || "Network error");
      setStage("idle");
    }
  }

  async function handleExtract(fileOverride?: File) {
    const file = fileOverride ?? imageFile;
    if (!file) return;
    setStage("extracting");
    setError(null);

    const formData = new FormData();
    formData.append("image", file);

    const result = await extractReceiptAction(formData);

    if (!result.success) {
      setError(
        result.error === "scan_limit_reached"
          ? `You've reached your ${userPlan.scanLimit} scans this month. Upgrade to Pro for unlimited scans.`
          : result.error ?? "Failed to analyze receipt",
      );
      setStage("idle");
      return;
    }

    const ext = result.extraction!;
    setExtraction(ext);
    setMerchant(ext.merchant ?? "");
    setAmount(
      ext.amount_cents != null ? (ext.amount_cents / 100).toFixed(2) : "",
    );
    setExpenseDate(ext.expense_date ?? "");
    setCategoryCode(ext.category_code);
    setBusinessPurpose(ext.business_purpose ?? "");
    setIsBusiness(ext.is_business);
    setPaymentMethod(ext.payment_method);
    setCardLast4(ext.card_last4);
    if (ext.card_last4) {
      const match = existingCards.find((c) => c.last4 === ext.card_last4);
      setCardId(match?.id ?? null);
      if (match) setNewCardIsBusiness(match.is_business);
    } else {
      setCardId(null);
    }
    setStage("review");
    // Kick off the background upload now that extraction succeeded.
    void startBackgroundReceiptUpload(file);
  }

  async function handleSave(opts?: {
    skipDupeCheck?: boolean;
    newCard?: { isBusiness: boolean; nickname: string };
  }) {
    // Photo entries need a file; chat entries don't have one.
    if (entrySource === "photo" && !imageFile) return;
    setStage("saving");
    setError(null);

    const effectiveIsBusiness = opts?.newCard?.isBusiness ?? newCardIsBusiness;
    const effectiveNickname = opts?.newCard?.nickname ?? newCardNickname;

    const draft: ExpenseDraft = {
      merchant,
      amount_cents: amount ? Math.round(parseFloat(amount) * 100) : null,
      expense_date: expenseDate || null,
      category_code: categoryCode,
      business_purpose: businessPurpose || null,
      is_business: isBusiness,
      payment_method: paymentMethod,
      card_last4: cardLast4,
      card_id: cardId,
      check_number: checkNumber || null,
      reference_number: referenceNumber || null,
      sub_id: subId,
      project_id: projectId,
      new_card_is_business: effectiveIsBusiness,
      new_card_nickname: effectiveNickname || null,
      // Chat entries skip dedup (no photo to compare against) — same convention as the old /chat page
      skip_dupe_check: !!opts?.skipDupeCheck || entrySource === "chat",
      raw_extraction: extraction,
    };

    // Prefer the already-uploaded receipt path; otherwise queue the (resized)
    // blob and let the worker upload it. Either way, the user navigates away
    // immediately — no spinner that can hang forever.
    const path = receiptPathRef.current;
    const blob =
      path || entrySource === "chat"
        ? null
        : resizedBlobRef.current ??
          (imageFile ? await resizeImageForUpload(imageFile) : null);

    await expenseQueue.enqueue(draft, blob, path);

    router.push("/expenses");
    router.refresh();
  }

  function handleBack() {
    setStage("idle");
    setExtraction(null);
    setError(null);
    resizedBlobRef.current = null;
    receiptPathRef.current = null;
    // Restore the previous chat draft so the user can edit it
    if (entrySource === "chat" && lastChatMessage) {
      setChatMessage(lastChatMessage);
    }
    setEntrySource(null);
  }

  // Save click — if a new card is being introduced, prompt for biz/personal first
  const [pendingSaveOpts, setPendingSaveOpts] = useState<{ skipDupeCheck?: boolean } | null>(null);

  function handleSaveClick(opts?: { skipDupeCheck?: boolean }) {
    if (
      paymentMethod === "credit_card" &&
      cardLast4 &&
      /^\d{4}$/.test(cardLast4) &&
      !cardId &&
      !existingCards.find((c) => c.last4 === cardLast4)
    ) {
      setPendingSaveOpts(opts ?? null);
      setShowNewCardModal(true);
      return;
    }
    handleSave(opts);
  }

  function handleNewCardConfirm({ isBusiness, nickname }: { isBusiness: boolean; nickname: string }) {
    setNewCardIsBusiness(isBusiness);
    setNewCardNickname(nickname);
    setShowNewCardModal(false);
    handleSave({
      ...(pendingSaveOpts ?? {}),
      newCard: { isBusiness, nickname },
    });
    setPendingSaveOpts(null);
  }

  const category = getCategory(categoryCode);

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Xpenz</h1>

      {/* API Key Banner */}
      {!hasApiKey && (
        <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            Add your Anthropic API key to start scanning receipts.{" "}
            <Link
              href="/settings"
              className="font-semibold underline hover:text-blue-900"
            >
              Go to Settings
            </Link>
          </p>
        </div>
      )}

      {/* Plan Limit Banner */}
      {hasApiKey && !userPlan.canScan && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            You&apos;ve used {userPlan.scanCount} of {userPlan.scanLimit} scans
            this month.{" "}
            <Link
              href="/settings/billing"
              className="font-semibold underline hover:text-amber-900"
            >
              Upgrade to Pro
            </Link>{" "}
            for unlimited scans.
          </p>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Stage: idle */}
      {stage === "idle" && (
        <div className="space-y-4">
          {/* File Input Area */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={!hasApiKey || !userPlan.canScan}
            className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-colors hover:border-indigo-400 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {imagePreviewUrl ? (
              <img
                src={imagePreviewUrl}
                alt="Receipt preview"
                className="max-h-64 rounded-xl object-contain"
              />
            ) : (
              <>
                <Camera className="h-10 w-10 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">
                  Tap to take a photo or choose from gallery
                </span>
              </>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Scan counter */}
          {userPlan.scanLimit !== null && (
            <p className="text-center text-xs text-gray-500">
              {userPlan.scanCount} / {userPlan.scanLimit} scans used this month
              {userPlan.trialActive && " (Pro trial)"}
            </p>
          )}

          {/* Or describe it — chat entry */}
          <div className="flex items-center gap-3 pt-2">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
              or describe it
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <form onSubmit={handleChatSubmit} className="space-y-3">
            <div className="relative">
              <textarea
                value={chatMessage + (voice.interim ? (chatMessage.trimEnd() ? " " : "") + voice.interim : "")}
                onChange={(e) => setChatMessage(e.target.value)}
                disabled={!hasApiKey || !userPlan.canScan}
                rows={3}
                placeholder={voice.listening ? "Listening… speak now" : "Spent $45 on home depot lumber last Tuesday, business…"}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 pr-12 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
              />
              {voice.supported && (
                <button
                  type="button"
                  onClick={() => (voice.listening ? voice.stop() : voice.start())}
                  disabled={!hasApiKey || !userPlan.canScan}
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
            <button
              type="submit"
              disabled={!chatMessage.trim() || !hasApiKey || !userPlan.canScan}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Parse expense
            </button>
          </form>
        </div>
      )}

      {/* Stage: thinking (chat) */}
      {stage === "thinking" && (
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">Parsing your expense…</span>
          </div>
          {lastChatMessage && (
            <p className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
              <MessageSquare className="mr-1.5 inline h-3 w-3" />
              {lastChatMessage}
            </p>
          )}
        </div>
      )}

      {/* Stage: extracting */}
      {stage === "extracting" && (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl">
            {imagePreviewUrl && (
              <img
                src={imagePreviewUrl}
                alt="Receipt"
                className="w-full object-contain opacity-50"
              />
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/60">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">
                Reading receipt with AI...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Stage: review / saving */}
      {(stage === "review" || stage === "saving") && extraction && (
        <div className="space-y-4">
          {/* Back button */}
          <button
            type="button"
            onClick={handleBack}
            disabled={stage === "saving"}
            className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700 disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {/* Receipt thumbnail */}
          {imagePreviewUrl && (
            <div className="flex justify-center">
              <img
                src={imagePreviewUrl}
                alt="Receipt"
                className="max-h-32 rounded-xl object-contain shadow-sm"
              />
            </div>
          )}

          {/* Warnings */}
          {extraction.warnings.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div className="space-y-1">
                  {extraction.warnings.map((w, i) => (
                    <p key={i} className="text-sm text-amber-800">
                      {w}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Editable Fields */}
          <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            {/* Merchant */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Merchant
              </label>
              <input
                type="text"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                disabled={stage === "saving"}
                placeholder="Store or vendor name"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none disabled:opacity-50"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Amount ($)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={stage === "saving"}
                placeholder="0.00"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none disabled:opacity-50"
              />
            </div>

            {/* Date */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Date
              </label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                disabled={stage === "saving"}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none disabled:opacity-50"
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Category
              </label>
              <button
                type="button"
                onClick={() => setShowCategoryPicker(true)}
                disabled={stage === "saving"}
                className="flex w-full items-center justify-between rounded-xl border border-gray-300 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                <span>
                  {category.label}{" "}
                  <span className="text-gray-400">({category.line})</span>
                </span>
                {extraction.category_confidence > 0 && (
                  <span className="text-xs text-gray-400">
                    {Math.round(extraction.category_confidence * 100)}%
                    confidence
                  </span>
                )}
              </button>
            </div>

            {/* Business Purpose */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Business Purpose
              </label>
              <input
                type="text"
                value={businessPurpose}
                onChange={(e) => setBusinessPurpose(e.target.value)}
                disabled={stage === "saving"}
                placeholder="Brief description"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none disabled:opacity-50"
              />
            </div>

            {/* Business Toggle */}
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={isBusiness}
                onChange={(e) => setIsBusiness(e.target.checked)}
                disabled={stage === "saving"}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">
                Business expense (tax deductible)
              </span>
            </label>

            {/* Payment method */}
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

            {/* Sub linkage */}
            <SubPicker
              subId={subId}
              onChange={setSubId}
              subs={allSubs}
              onSubCreated={(s) => setLocalSubs((prev) => [...prev, s])}
              disabled={stage === "saving"}
              highlight={categoryCode === "contract_labor"}
            />

            {/* Project linkage */}
            <ProjectPicker
              projectId={projectId}
              onChange={setProjectId}
              projects={allProjects}
              recencyByProjectId={projectRecencyDays}
              onProjectCreated={(p) => setLocalProjects((prev) => [...prev, p])}
              disabled={stage === "saving"}
            />
          </div>

          {/* Line Items */}
          {extraction.line_items.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="mb-2 text-xs font-medium text-gray-500">
                Line Items
              </h3>
              <ul className="space-y-1">
                {extraction.line_items.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-700">{item.description}</span>
                    <span className="font-medium text-gray-900">
                      {formatCents(item.amount_cents)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Save Button */}
          <button
            type="button"
            onClick={() => handleSaveClick()}
            disabled={stage === "saving"}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
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

      {/* New Card Confirmation Modal */}
      <NewCardModal
        open={showNewCardModal}
        last4={cardLast4 ?? ""}
        onConfirm={handleNewCardConfirm}
        onCancel={() => {
          setShowNewCardModal(false);
          setPendingSaveOpts(null);
        }}
      />

      {/* Category Picker Modal */}
      {showCategoryPicker && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setShowCategoryPicker(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-auto p-4" onClick={(e) => e.stopPropagation()}>
            <CategoryPicker
              value={categoryCode}
              onChange={(code) => {
                setCategoryCode(code);
                setShowCategoryPicker(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
