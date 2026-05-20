"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const FAQS = [
  {
    q: "Do I need a credit card to start?",
    a: "No. You sign up with email, get 90 days of Pro for free, and we only ask for a card if you choose to keep going after that.",
  },
  {
    q: "What happens after my 90 days?",
    a: "Your account quietly drops to the Free plan (15 scans/month) unless you upgrade. Nothing gets deleted — your projects, subs, and expense history stay with you. You can upgrade any time.",
  },
  {
    q: "Can I export to QuickBooks?",
    a: "Today we export a clean CSV with every column your CPA or QuickBooks needs (vendor, amount, project, sub, payment method, Schedule C category). A direct QuickBooks Online sync is on the roadmap.",
  },
  {
    q: "How does the AI scan work? Is my data private?",
    a: "When you snap a receipt, the image goes to Claude (Anthropic) which extracts the merchant, total, date, and category. Your expense data lives in your own Supabase row, scoped to you by row-level security. You can also bring your own Anthropic key if you want every byte to flow through your account.",
  },
  {
    q: "Does it work on iPhone and Android?",
    a: "Yes — Xpenz is a progressive web app. Open xpenz.us in Safari or Chrome, tap 'Add to Home Screen', and it behaves like a native app: full-screen, offline-capable, fast.",
  },
  {
    q: "Can my bookkeeper or CPA have access?",
    a: "Yes. The Business plan adds multi-user team access, so your bookkeeper can log in directly instead of waiting for an email export. Each user is $6.99/mo.",
  },
  {
    q: "Will this work if I'm not a GC — just a flipper / landlord / handyman?",
    a: "Absolutely. The product is built for anyone running projects with mixed expenses and 1099 contractors — flippers, BRRRR investors, small remodelers, handymen scaling up. The Schedule C structure works the same way.",
  },
  {
    q: "What if I have hundreds of receipts already piled up?",
    a: "Snap as many as you want during your 90-day Pro trial — unlimited scans. People typically catch up an entire year of receipts in a single evening on the couch.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-gray-50 py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-4 lg:px-8">
        <div className="text-center">
          <div className="mb-3 text-sm font-bold uppercase tracking-wider text-brand-600">
            FAQ
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Straight answers.
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                <button
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-gray-50"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-bold text-gray-900 sm:text-lg">
                    {item.q}
                  </span>
                  <span
                    className={`inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                      isOpen
                        ? "bg-brand-600 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5">
                    <p className="text-[15px] leading-relaxed text-gray-600">
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
