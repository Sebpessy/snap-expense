"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all ${
        scrolled
          ? "border-b border-gray-200 bg-white/85 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={40} />
          <span className="text-lg font-bold tracking-tight text-gray-900">
            Xpenz
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          <a
            href="#features"
            className="text-sm font-medium text-gray-700 hover:text-brand-600"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-medium text-gray-700 hover:text-brand-600"
          >
            How it works
          </a>
          <a
            href="#pricing"
            className="text-sm font-medium text-gray-700 hover:text-brand-600"
          >
            Pricing
          </a>
          <a
            href="#faq"
            className="text-sm font-medium text-gray-700 hover:text-brand-600"
          >
            FAQ
          </a>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-700 hover:text-brand-600"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Start 90 Days Free
          </Link>
        </div>

        <button
          aria-label="Open menu"
          className="inline-flex items-center justify-center rounded-lg p-2 text-gray-700 lg:hidden"
          onClick={() => setMenuOpen((s) => !s)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-3">
            <a
              href="#features"
              className="rounded-lg px-3 py-2 text-base font-medium text-gray-800 hover:bg-gray-50"
              onClick={() => setMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="rounded-lg px-3 py-2 text-base font-medium text-gray-800 hover:bg-gray-50"
              onClick={() => setMenuOpen(false)}
            >
              How it works
            </a>
            <a
              href="#pricing"
              className="rounded-lg px-3 py-2 text-base font-medium text-gray-800 hover:bg-gray-50"
              onClick={() => setMenuOpen(false)}
            >
              Pricing
            </a>
            <a
              href="#faq"
              className="rounded-lg px-3 py-2 text-base font-medium text-gray-800 hover:bg-gray-50"
              onClick={() => setMenuOpen(false)}
            >
              FAQ
            </a>
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-base font-medium text-gray-800 hover:bg-gray-50"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="mt-2 inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-3 text-base font-semibold text-white shadow-sm hover:bg-brand-700"
            >
              Start 90 Days Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
