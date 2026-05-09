"use client";

import { useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import {
  SCHEDULE_C_CATEGORIES,
  type ScheduleCCategory,
  getCategory,
} from "@/lib/categories";

type CategoryPickerProps = {
  value: string | null;
  onChange: (code: string) => void;
};

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

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
            <div className="flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]">
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
          </div>
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
