import { Camera, Tag, Download } from "lucide-react";

const STEPS = [
  {
    n: "01",
    icon: Camera,
    title: "Snap",
    body: "Open the app, take a photo of the receipt. AI pulls the merchant, total, date, and tax category instantly.",
  },
  {
    n: "02",
    icon: Tag,
    title: "Tag",
    body: "Pick the project and the sub (if any). Add a payment method. The whole thing takes about six seconds.",
  },
  {
    n: "03",
    icon: Download,
    title: "Export",
    body: "At month-end (or any time), download a CSV with every column your CPA needs — sub names included.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-gradient-to-b from-gray-50 to-white py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 text-sm font-bold uppercase tracking-wider text-brand-600">
            How it works
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            From truck-seat to tax-ready in three steps.
          </h2>
        </div>

        <div className="relative mt-14">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-12 hidden h-0.5 bg-gradient-to-r from-transparent via-brand-200 to-transparent lg:block"
          />
          <div className="grid gap-8 lg:grid-cols-3 lg:gap-10">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
              >
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-md shadow-brand-200">
                  <s.icon size={26} strokeWidth={2} />
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-brand-500">
                  Step {s.n}
                </div>
                <h3 className="mt-1 text-2xl font-extrabold text-gray-900">
                  {s.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-gray-600">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <p className="text-base font-semibold text-amber-900">
            Average builder logs 47 expenses a month in under 5 minutes total.
          </p>
          <p className="mt-1 text-sm text-amber-800/80">
            (vs. ~3 hours wrestling QuickBooks at month-end)
          </p>
        </div>
      </div>
    </section>
  );
}
