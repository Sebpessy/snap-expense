import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CTAPattern } from "./illustrations";

export function CTABanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-amber-400 via-amber-300 to-amber-400 py-20 lg:py-24">
      <CTAPattern className="absolute inset-0 h-full w-full" />
      <div
        aria-hidden
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.6), transparent 40%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.4), transparent 40%)",
        }}
      />
      <div className="relative mx-auto max-w-4xl px-4 text-center lg:px-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
          Stop losing receipts.
          <br />
          Start running your business like a CFO.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-800/90">
          90 days of Pro, on the house. No credit card. Your tax season gets
          quieter starting the day you sign up.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-gray-800"
          >
            Start 90 Days Free
            <ArrowRight
              size={18}
              className="transition group-hover:translate-x-0.5"
            />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl border-2 border-gray-900/15 bg-white/30 px-8 py-4 text-base font-bold text-gray-900 backdrop-blur transition hover:bg-white/50"
          >
            Sign in
          </Link>
        </div>
        <p className="mt-6 text-sm text-gray-800/80">
          Takes about 30 seconds. Snap your first receipt before the kettle boils.
        </p>
      </div>
    </section>
  );
}
