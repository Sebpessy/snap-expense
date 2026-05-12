"use client";

import { useState } from "react";
import { Check, ChevronDown, Search, X, Plus } from "lucide-react";
import {
  SCHEDULE_C_CATEGORIES,
  type ScheduleCCategory,
  getCategory,
} from "@/lib/categories";
import { requestCategoryAction } from "@/app/(app)/category-requests/actions";

type CategoryPickerProps = {
  value: string | null;
  onChange: (code: string) => void;
};

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showRequest, setShowRequest] = useState(false);
  const [requestLabel, setRequestLabel] = useState("");
  const [requestLine, setRequestLine] = useState("");
  const [requestState, setRequestState] = useState<"idle" | "sending" | "sent">("idle");
  const [requestError, setRequestError] = useState<string | null>(null);

  async function handleSubmitRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setRequestState("sending");
    setRequestError(null);
    const fd = new FormData(e.currentTarget);
    const result = await requestCategoryAction(fd);
    if (result.success) {
      setRequestState("sent");
      setRequestLabel("");
      setRequestLine("");
      setTimeout(() => {
        setShowRequest(false);
        setRequestState("idle");
      }, 1500);
    } else {
      setRequestError(result.error ?? "Failed to submit");
      setRequestState("idle");
    }
  }

  const selected = getCategory(value);

  const filtered = SCHEDULE_C_CATEGORIES.filter((cat) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      cat.label.toLowerCase().includes(q) ||
      cat.hint.toLowerCase().includes(q) ||
      cat.code.toLowerCase().includes(q) ||
      cat.line.toLowerCase().includes(q)
    );
  });

  const handleSelect = (code: string) => {
    onChange(code);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm transition-colors hover:bg-gray-50"
      >
        <div className="min-w-0">
          <p className="truncate font-medium text-gray-900">
            {selected.label}
          </p>
          <p className="truncate text-xs text-gray-400">{selected.hint}</p>
        </div>
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-gray-400" />
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center lg:justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setIsOpen(false);
              setSearch("");
            }}
          />

          {/* Panel */}
          <div className="relative w-full max-h-[85vh] flex flex-col rounded-t-2xl bg-white shadow-xl lg:max-w-lg lg:rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h3 className="text-base font-semibold text-gray-900">
                Select Category
              </h3>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSearch("");
                }}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search */}
            <div className="border-b border-gray-100 px-4 py-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                  autoFocus
                />
              </div>
            </div>

            {/* Category list */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-gray-400">
                  No categories found
                </p>
              )}
              {filtered.map((cat) => (
                <CategoryRow
                  key={cat.code}
                  category={cat}
                  isSelected={cat.code === value}
                  onSelect={handleSelect}
                />
              ))}
            </div>

            {/* Footer: request a category */}
            <div className="border-t border-gray-100 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => setShowRequest(true)}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-indigo-300 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
              >
                <Plus className="h-3.5 w-3.5" />
                Don&apos;t see your category? Request one
              </button>
            </div>
          </div>

          {/* Request modal — nested above the picker */}
          {showRequest && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget && requestState !== "sending") {
                  setShowRequest(false);
                  setRequestError(null);
                }
              }}
            >
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                {requestState === "sent" ? (
                  <div className="text-center">
                    <Check className="mx-auto mb-2 h-8 w-8 text-green-600" />
                    <p className="text-sm font-medium text-gray-900">
                      Request sent
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      We&apos;ll review and add it if it&apos;s a fit.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitRequest} className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Request a category
                    </h3>
                    {requestError && (
                      <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                        {requestError}
                      </div>
                    )}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">
                        Category name *
                      </label>
                      <input
                        name="requested_label"
                        required
                        value={requestLabel}
                        onChange={(e) => setRequestLabel(e.target.value)}
                        placeholder="e.g. Studio supplies"
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">
                        Suggested Schedule C line (optional)
                      </label>
                      <input
                        name="suggested_schedule_c_line"
                        value={requestLine}
                        onChange={(e) => setRequestLine(e.target.value)}
                        placeholder="e.g. Line 27a"
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowRequest(false);
                          setRequestError(null);
                        }}
                        disabled={requestState === "sending"}
                        className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={requestState === "sending" || !requestLabel.trim()}
                        className="flex-1 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                      >
                        {requestState === "sending" ? "Sending..." : "Submit"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function CategoryRow({
  category,
  isSelected,
  onSelect,
}: {
  category: ScheduleCCategory;
  isSelected: boolean;
  onSelect: (code: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(category.code)}
      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
        isSelected ? "bg-brand-50" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">
            {category.label}
          </span>
          <span className="text-xs text-gray-400">{category.line}</span>
        </div>
        <p className="mt-0.5 text-xs text-gray-500">{category.hint}</p>
      </div>
      {isSelected && <Check className="h-5 w-5 shrink-0 text-brand-600" />}
    </button>
  );
}
