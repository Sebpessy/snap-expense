import { Check, X } from "lucide-react";
import { CompareSplit } from "./illustrations";

const COMPARISON = [
  {
    label: "Per-project / per-client allocation",
    xpenz: true,
    quickbooks: "Sort-of (class tracking, manual)",
    expensify: false,
  },
  {
    label: "Built-in contractor & vendor directory",
    xpenz: true,
    quickbooks: "Vendor list, no tagging",
    expensify: false,
  },
  {
    label: "Check / Zelle / wire payment tracking",
    xpenz: true,
    quickbooks: "Yes, but clunky",
    expensify: "Card only",
  },
  {
    label: "Schedule C tax categories out of the box",
    xpenz: true,
    quickbooks: true,
    expensify: false,
  },
  {
    label: "Designed phone-first for people who work outside a desk",
    xpenz: true,
    quickbooks: false,
    expensify: true,
  },
  {
    label: "Costs less than your monthly coffee subscription",
    xpenz: true,
    quickbooks: false,
    expensify: false,
  },
];

function Cell({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-green-700">
        <Check size={16} strokeWidth={3} />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-600">
        <X size={16} strokeWidth={3} />
      </span>
    );
  }
  return <span className="text-xs text-gray-500">{value}</span>;
}

export function BuiltForIndependents() {
  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <CompareSplit className="mx-auto mb-12 w-full max-w-4xl rounded-2xl border border-gray-200 shadow-sm" />

        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="mb-3 text-sm font-bold uppercase tracking-wider text-brand-600">
              Why independents pick Xpenz
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              Generic expense apps weren't built for the way you work.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-gray-600">
              QuickBooks is built for accountants. Expensify is built for
              office workers expensing lunches. Neither one understands what
              it means to run multiple projects or clients, pay people in
              mixed methods, and need every expense pinned to the right
              bucket for tax day.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              Xpenz starts wherever you are — phone in hand, receipt in
              hand, work to get back to — and quietly produces clean books.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                "Snap as it happens, tag to a project in two taps",
                "1099 totals per contractor, ready before January",
                "Profit-per-project view, not just per-month",
                "Your CPA gets one clean CSV, not 14 emails",
              ].map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  <span className="text-[15px] text-gray-700">{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Comparison table */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr] gap-3 bg-gradient-to-r from-brand-700 to-brand-600 px-4 py-4 text-xs font-bold uppercase tracking-wider text-white sm:px-5">
              <div></div>
              <div className="text-center">Xpenz</div>
              <div className="text-center opacity-80">QuickBooks</div>
              <div className="text-center opacity-80">Expensify</div>
            </div>
            <div className="divide-y divide-gray-100">
              {COMPARISON.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr] items-center gap-3 px-4 py-4 sm:px-5"
                >
                  <div className="text-[13px] font-medium text-gray-800 sm:text-sm">
                    {row.label}
                  </div>
                  <div className="flex justify-center">
                    <Cell value={row.xpenz} />
                  </div>
                  <div className="flex justify-center">
                    <Cell value={row.quickbooks} />
                  </div>
                  <div className="flex justify-center">
                    <Cell value={row.expensify} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
