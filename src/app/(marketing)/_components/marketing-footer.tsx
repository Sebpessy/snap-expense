import Link from "next/link";
import { Logo } from "@/components/logo";

export function MarketingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="inline-block">
              <Logo variant="wordmark" size={88} />
            </Link>
            <p className="mt-4 max-w-xs text-sm text-gray-600">
              Built for investor-builders, flippers, and small GCs who'd rather
              build than do paperwork.
            </p>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Product
            </div>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>
                <a href="#features" className="hover:text-brand-600">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-brand-600">
                  How it works
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-brand-600">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-brand-600">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Account
            </div>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/signup" className="hover:text-brand-600">
                  Start 90 days free
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-brand-600">
                  Sign in
                </Link>
              </li>
              <li>
                <Link
                  href="/forgot-password"
                  className="hover:text-brand-600"
                >
                  Forgot password
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Legal
            </div>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/privacy" className="hover:text-brand-600">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-brand-600">
                  Terms
                </Link>
              </li>
              <li>
                <a
                  href="mailto:hello@xpenz.us"
                  className="hover:text-brand-600"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-gray-200 pt-6 text-xs text-gray-500 sm:flex-row sm:items-center">
          <div>© {year} Xpenz. Built for builders.</div>
          <div>Made for the trades.</div>
        </div>
      </div>
    </footer>
  );
}
