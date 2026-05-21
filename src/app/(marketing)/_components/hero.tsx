import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden text-white">
      {/* Full-bleed hero photo */}
      <Image
        src="/marketing/hero-person.jpg"
        alt="A self-employed professional reviewing this week's expenses in the Xpenz app — categorized automatically by project, vendor, and tax line."
        fill
        priority
        sizes="100vw"
        className="object-cover object-[70%_center] lg:object-[60%_center]"
      />

      {/* Dark gradient — denser on the left so the copy reads, transparent on
          the right so the phone stays visible */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-brand-900/95 via-brand-900/80 to-brand-900/10 lg:via-brand-900/55 lg:to-transparent"
      />

      {/* subtle grid for texture (only on the dark-overlay side) */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 lg:px-8 lg:pb-36 lg:pt-32">
        <div className="max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-400/15 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-amber-200 backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-300" />
            Launch promo — 90 days free Pro
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight drop-shadow-md sm:text-5xl lg:text-6xl">
            Snap a receipt.
            <br />
            <span className="text-amber-300">Done.</span>
            <br />
            <span className="text-white/95">Built for the self-employed.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-blue-50 drop-shadow sm:text-xl">
            Track every business expense — by project, client, and tax category
            — in 3 seconds, from your phone. No more shoebox of receipts at tax
            time.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-4 text-base font-bold text-gray-900 shadow-lg shadow-amber-500/30 transition hover:bg-amber-300"
            >
              Start 90 Days Free
              <ArrowRight
                size={18}
                className="transition group-hover:translate-x-0.5"
              />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/10 px-6 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              See how it works
            </a>
          </div>

          <p className="mt-5 text-sm text-blue-100/90 drop-shadow-sm">
            No credit card required · Cancel anytime · Your data stays yours
          </p>
        </div>
      </div>

      {/* Reserve hero height so the photo has room to breathe even when the
          copy is short. On mobile the bg image is cropped tighter. */}
      <div aria-hidden className="pointer-events-none -mt-px h-0 lg:h-24" />
    </section>
  );
}
