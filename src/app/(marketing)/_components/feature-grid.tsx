import {
  ScanLine,
  MapPinned,
  Users,
  FileSpreadsheet,
  CreditCard,
  Receipt,
} from "lucide-react";

const FEATURES = [
  {
    icon: ScanLine,
    title: "AI receipt scan",
    body: "Claude Vision reads the merchant, total, date, and category off the photo. You snap — it types.",
  },
  {
    icon: MapPinned,
    title: "Per-project allocation",
    body: "Tag every expense to a specific job site. Finally know which house is bleeding cash before it closes.",
  },
  {
    icon: Users,
    title: "Subcontractor ledger",
    body: "Track every sub, their trade, and exactly what you paid them. 1099 season stops being a fire drill.",
  },
  {
    icon: Receipt,
    title: "Schedule C categories",
    body: "20+ IRS-mapped expense buckets. Contract labor, materials, repairs, vehicle — it's already filed for you.",
  },
  {
    icon: CreditCard,
    title: "Payment-method audit trail",
    body: "Log credit card last-4, check number, Zelle reference, or wire. Audit-ready without lifting a finger.",
  },
  {
    icon: FileSpreadsheet,
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
            Built around how investor-builders actually work — not how generic
            expense apps think you should.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-gray-200 bg-white p-7 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-100/60"
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                <f.icon size={24} strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{f.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-gray-600">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
