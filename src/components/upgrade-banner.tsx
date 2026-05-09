"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

type UpgradeBannerProps = {
  plan: string;
  trialActive: boolean;
};

export function UpgradeBanner({ plan, trialActive }: UpgradeBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || plan !== "free" || trialActive) return null;

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-400 to-brand-500 p-4 text-white shadow-sm">
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-2 top-2 rounded-lg p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      <p className="pr-8 text-sm font-semibold">
        Upgrade to Pro for unlimited scans — $9.99/mo
      </p>

      <Link
        href="/settings"
        className="mt-2 inline-block rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-white/90"
      >
        Upgrade
      </Link>
    </div>
  );
}
