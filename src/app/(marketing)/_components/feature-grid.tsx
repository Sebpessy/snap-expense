"use client";

import {
  FeatureScanTile,
  FeatureProjectsTile,
  FeatureLedgerTile,
  FeatureCategoriesTile,
  FeaturePaymentsTile,
  FeatureExportTile,
} from "./illustrations";
import { Stagger, StaggerItem } from "./motion/stagger";

const FEATURES = [
  {
    tile: FeatureScanTile,
    title: "AI receipt scan",
    body: "Claude Vision pulls the vendor, total, date, tax category, and even your card's last 4 — straight off the photo. You snap, it types.",
  },
  {
    tile: FeatureProjectsTile,
    title: "Per-project allocation",
    body: "Tag every expense to a specific project or client. Finally know which work is making money before it wraps.",
  },
  {
    tile: FeatureLedgerTile,
    title: "Pay-anyone ledger",
    body: "Track every contractor, vendor, and freelancer you pay. 1099 season stops being a fire drill.",
  },
  {
    tile: FeatureCategoriesTile,
    title: "Schedule C categories",
    body: "20+ IRS-mapped expense buckets. Contract labor, supplies, software, travel, vehicle — already filed for you.",
  },
  {
    tile: FeaturePaymentsTile,
    title: "Payment-method audit trail",
    body: "Log credit card last-4, check number, Zelle reference, or wire. Audit-ready without lifting a finger.",
  },
  {
    tile: FeatureExportTile,
    title: "CSV export for your CPA",
    body: "One click, one file, everything they need. Hand off your books in seconds, not an afternoon.",
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 text-sm font-bold uppercase tracking-wider text-brand-600">
            What you get
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Six tools that replace the shoebox.
          </h2>
          <p className="mt-5 text-lg text-gray-600">
            Built around how independent professionals actually work — not how
            generic expense apps think you should.
          </p>
        </div>

        <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <StaggerItem
              key={f.title}
              className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-100/60"
            >
              <f.tile className="block h-36 w-full" />
              <div className="px-7 pb-7 pt-6">
                <h3 className="text-lg font-bold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-gray-600">
                  {f.body}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
