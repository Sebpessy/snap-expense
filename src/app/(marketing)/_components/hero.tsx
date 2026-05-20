import Link from "next/link";
import { Camera, MapPin, FileText, ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-700 to-brand-600 text-white">
      {/* decorative grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 lg:px-8 lg:pb-32 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: copy */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-400/15 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-amber-200">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-300" />
              Launch promo — 90 days free Pro
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Snap a receipt.
              <br />
              <span className="text-amber-300">Done.</span>
              <br />
              <span className="text-white/90">Built for investor-builders.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-blue-100 sm:text-xl">
              Track every job-site expense by project, sub, and tax category — in
              3 seconds, from your phone. No more shoebox of receipts at tax time.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-4 text-base font-bold text-gray-900 shadow-lg shadow-amber-500/20 transition hover:bg-amber-300"
              >
                Start 90 Days Free
                <ArrowRight
                  size={18}
                  className="transition group-hover:translate-x-0.5"
                />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10"
              >
                See how it works
              </a>
            </div>

            <p className="mt-5 text-sm text-blue-200/80">
              No credit card required · Cancel anytime · Your data stays yours
            </p>
          </div>

          {/* Right: phone mockup */}
          <div className="relative mx-auto w-full max-w-sm lg:max-w-md">
            <div className="relative aspect-[9/19] rounded-[2.5rem] border-[10px] border-gray-900 bg-gray-900 shadow-2xl shadow-blue-950/50">
              <div className="absolute left-1/2 top-2 z-10 h-5 w-28 -translate-x-1/2 rounded-full bg-gray-900" />
              <div className="absolute inset-0 m-1 overflow-hidden rounded-[2rem] bg-gradient-to-b from-gray-50 to-white">
                {/* Mock screen */}
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between px-5 pb-2 pt-8 text-xs font-semibold text-gray-700">
                    <span>9:41</span>
                    <span>Xpenz</span>
                  </div>
                  <div className="border-b border-gray-100 px-5 pb-3 pt-1">
                    <div className="text-[11px] font-medium uppercase tracking-wide text-brand-600">
                      Snap a receipt
                    </div>
                    <div className="mt-1 text-lg font-bold text-gray-900">
                      Today
                    </div>
                  </div>

                  <div className="space-y-3 px-5 py-4">
                    <MockExpense
                      vendor="Home Depot"
                      amount="$842.17"
                      category="Materials & Supplies"
                      project="412 Cedar — kitchen reno"
                      tint="blue"
                    />
                    <MockExpense
                      vendor="Lowe's"
                      amount="$287.40"
                      category="Repairs & Maintenance"
                      project="House #3 — Cedar Hill"
                      tint="green"
                    />
                    <MockExpense
                      vendor="Mike's Concrete (sub)"
                      amount="$3,200.00"
                      category="Contract Labor"
                      project="412 Cedar — driveway"
                      tint="amber"
                      sub
                    />
                  </div>

                  <div className="mt-auto border-t border-gray-100 bg-gradient-to-t from-brand-50 to-transparent px-5 py-4">
                    <div className="flex items-center justify-around text-[10px] font-semibold text-gray-500">
                      <div className="flex flex-col items-center gap-1 text-brand-600">
                        <Camera size={20} />
                        Capture
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <MapPin size={20} />
                        Projects
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <FileText size={20} />
                        Export
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating receipt thumb */}
            <div className="absolute -left-4 top-12 hidden rotate-[-8deg] rounded-2xl border border-white/30 bg-white p-3 shadow-xl sm:block">
              <div className="h-32 w-24 rounded-md bg-gradient-to-b from-gray-100 to-gray-200" />
              <div className="mt-2 text-[10px] font-semibold text-gray-700">
                IMG_4821.jpg
              </div>
              <div className="text-[10px] text-gray-400">Captured 2s ago</div>
            </div>

            {/* Floating badge */}
            <div className="absolute -right-2 bottom-16 hidden rotate-[6deg] rounded-2xl bg-white px-4 py-3 shadow-xl sm:block">
              <div className="text-[10px] font-bold uppercase tracking-wider text-green-600">
                Categorized
              </div>
              <div className="mt-0.5 text-sm font-bold text-gray-900">
                Schedule C · Line 22
              </div>
              <div className="text-[10px] text-gray-500">Materials & Supplies</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MockExpense({
  vendor,
  amount,
  category,
  project,
  tint,
  sub,
}: {
  vendor: string;
  amount: string;
  category: string;
  project: string;
  tint: "blue" | "green" | "amber";
  sub?: boolean;
}) {
  const tints = {
    blue: "bg-brand-100 text-brand-700",
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
  };
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="text-sm font-bold text-gray-900">{vendor}</div>
        <div className="text-sm font-bold text-gray-900">{amount}</div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tints[tint]}`}
        >
          {category}
        </span>
        {sub && (
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
            1099 sub
          </span>
        )}
      </div>
      <div className="mt-1.5 truncate text-[11px] text-gray-500">{project}</div>
    </div>
  );
}
