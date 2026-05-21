"use client";

import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import {
  PlanFreeIcon,
  PlanProIcon,
  PlanBusinessIcon,
} from "./illustrations";
import { Stagger, StaggerItem } from "./motion/stagger";
import type { Plan } from "@/lib/types";

const PLAN_ICONS: Record<
  string,
  (p: { className?: string }) => React.ReactElement
> = {
  free: PlanFreeIcon,
  pro: PlanProIcon,
  business: PlanBusinessIcon,
};

function formatPrice(cents: number | null | undefined) {
  if (cents == null) return "Free";
  return `$${(cents / 100).toFixed(2)}`;
}

const FEATURE_BULLETS: Record<string, string[]> = {
  free: [
    "15 receipt scans / month",
    "Unlimited manual entries",
    "Project & contractor tracking",
    "CSV export",
  ],
  pro: [
    "Unlimited AI receipt scans",
    "All Schedule C categories",
    "Contractor + 1099 tracking",
    "Payment-method audit trail",
    "Priority support",
  ],
  business: [
    "Everything in Pro, per user",
    "Multi-user team access",
    "Bookkeeper / CPA seat",
    "Centralized project oversight",
    "Priority support",
  ],
};

export function PricingCardsClient({ plans }: { plans: Plan[] }) {
  return (
    <Stagger className="mt-14 grid gap-6 lg:grid-cols-3" stagger={0.1}>
      {plans.map((plan) => {
        const isPro = plan.code === "pro";
        const bullets = FEATURE_BULLETS[plan.code] ?? FEATURE_BULLETS.free;
        const PlanIcon = PLAN_ICONS[plan.code] ?? PLAN_ICONS.free;
        return (
          <StaggerItem
            key={plan.id}
            className={`relative flex flex-col rounded-2xl border p-7 ${
              isPro
                ? "border-amber-300 bg-gradient-to-b from-amber-50/60 to-white shadow-xl shadow-amber-100/40 lg:-mt-4 lg:mb-0"
                : "border-gray-200 bg-white shadow-sm"
            }`}
          >
            {isPro && (
              <div className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-amber-400 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-gray-900 shadow-md">
                <Sparkles size={12} strokeWidth={3} />
                30 days free
              </div>
            )}

            <PlanIcon className="mb-3 h-10 w-10" />
            <div className="text-sm font-bold uppercase tracking-wider text-brand-600">
              {plan.name}
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-5xl font-extrabold tracking-tight text-gray-900">
                {formatPrice(plan.monthly_price_cents)}
              </span>
              {plan.monthly_price_cents != null && (
                <span className="text-base font-medium text-gray-500">
                  / {plan.code === "business" ? "user / mo" : "mo"}
                </span>
              )}
            </div>

            {plan.description && (
              <p className="mt-3 text-[15px] text-gray-600">
                {plan.description}
              </p>
            )}

            <ul className="mt-6 space-y-3">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5">
                  <span
                    className={`mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                      isPro
                        ? "bg-amber-400 text-gray-900"
                        : "bg-brand-100 text-brand-700"
                    }`}
                  >
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span className="text-[15px] leading-relaxed text-gray-700">
                    {b}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Link
                href="/signup"
                className={`inline-flex w-full items-center justify-center rounded-xl px-5 py-3.5 text-sm font-bold transition ${
                  isPro
                    ? "bg-gray-900 text-white shadow-md hover:bg-gray-800"
                    : "border border-gray-300 bg-white text-gray-900 hover:border-brand-600 hover:text-brand-600"
                }`}
              >
                {isPro
                  ? "Start 30 Days Free"
                  : plan.code === "free"
                    ? "Start Free"
                    : "Get Business"}
              </Link>
            </div>

            {isPro && (
              <p className="mt-3 text-center text-xs text-gray-500">
                No credit card required during your 30-day trial.
              </p>
            )}
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}
