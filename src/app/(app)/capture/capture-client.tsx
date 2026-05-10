"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Camera, Loader2, AlertTriangle, Check, Receipt } from "lucide-react";
import { CategoryPicker } from "@/components/category-picker";
import { getCategory } from "@/lib/categories";
import { formatCents, type UserPlan, type ExtractionResult } from "@/lib/types";
import { extractReceiptAction, saveExpenseAction } from "./actions";

type Stage = "idle" | "extracting" | "review" | "saving";

export function CaptureClient({
  hasApiKey,
  userPlan,
}: {
  hasApiKey: boolean;
  userPlan: UserPlan;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stage, setStage] = useState<Stage>("idle");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Editable form fields (populated from extraction)
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [categoryCode, setCategoryCode] = useState("other");
  const [businessPurpose, setBusinessPurpose] = useState("");
  const [isBusiness, setIsBusiness] = useState(true);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setError(null);
  }

  async function handleExtract() {
    if (!imageFile) return;
    setStage("extracting");
    setError(null);

    const formData = new FormData();
    formData.append("image", imageFile);

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
    setStage("review");
  }

  async function handleSave() {
    if (!imageFile) return;
    setStage("saving");
    setError(null);

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("merchant", merchant);
    formData.append(
      "amount_cents",
      amount ? String(Math.round(parseFloat(amount) * 100)) : "",
    );
    formData.append("expense_date", expenseDate);
    formData.append("category_code", categoryCode);
    formData.append("business_purpose", businessPurpose);
    formData.append("is_business", isBusiness ? "true" : "false");
    formData.append("raw_extraction", JSON.stringify(extraction));

    const result = await saveExpenseAction(formData);

    if (!result.success) {
      setError(result.error ?? "Failed to save expense");
      setStage("review");
      return;
    }

    router.push("/expenses");
    router.refresh();
  }

  const category = getCategory(categoryCode);

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Snap Expense</h1>

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

          {imagePreviewUrl && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Change photo
              </button>
              <button
                type="button"
                onClick={handleExtract}
                disabled={!hasApiKey || !userPlan.canScan}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Receipt className="h-4 w-4" />
                Analyze receipt
              </button>
            </div>
          )}

          {/* Scan counter */}
          {userPlan.scanLimit !== null && (
            <p className="text-center text-xs text-gray-500">
              {userPlan.scanCount} / {userPlan.scanLimit} scans used this month
              {userPlan.trialActive && " (Pro trial)"}
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
                type="text"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                disabled={stage === "saving"}
                placeholder="YYYY-MM-DD"
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
            onClick={handleSave}
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
