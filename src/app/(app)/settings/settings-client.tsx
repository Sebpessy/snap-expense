"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Key,
  CreditCard,
  LogOut,
  Shield,
  Check,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlanBadge } from "@/components/plan-badge";
import { type UserPlan } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import {
  saveApiKeyAction,
  removeApiKeyAction,
  createCheckoutAction,
  openBillingPortalAction,
} from "./actions";

type SettingsClientProps = {
  email: string;
  userPlan: UserPlan;
  stripeCustomerId: string | null;
};

export function SettingsClient({
  email,
  userPlan,
  stripeCustomerId,
}: SettingsClientProps) {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [apiKeySaving, setApiKeySaving] = useState(false);
  const [apiKeyRemoved, setApiKeyRemoved] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(!userPlan.hasApiKey);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState<string | null>(
    null,
  );

  const hasApiKey = userPlan.hasApiKey && !apiKeyRemoved;

  // Trial days remaining
  const trialDaysRemaining = userPlan.trialEndsAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(userPlan.trialEndsAt).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : 0;

  const handleSaveApiKey = async () => {
    setApiKeyError(null);

    if (!apiKey.startsWith("sk-ant-")) {
      setApiKeyError("API key must start with sk-ant-");
      return;
    }

    setApiKeySaving(true);
    const formData = new FormData();
    formData.set("api_key", apiKey);

    const result = await saveApiKeyAction(formData);

    if (result.success) {
      setApiKey("");
      setShowApiKeyInput(false);
      setApiKeyRemoved(false);
      router.refresh();
    } else {
      setApiKeyError(result.error || "Failed to save API key");
    }
    setApiKeySaving(false);
  };

  const handleRemoveApiKey = async () => {
    const result = await removeApiKeyAction();
    if (result.success) {
      setApiKeyRemoved(true);
      setShowApiKeyInput(true);
      router.refresh();
    }
  };

  const handleCheckout = async (priceId: string) => {
    setIsCheckoutLoading(priceId);
    const result = await createCheckoutAction(priceId);

    if (result.success && result.url) {
      window.location.href = result.url;
    }
    setIsCheckoutLoading(null);
  };

  const handleBillingPortal = async () => {
    const result = await openBillingPortalAction();

    if (result.success && result.url) {
      window.location.href = result.url;
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 pb-8 lg:pt-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Settings</h1>

      {/* Section 1: Account */}
      <section className="mb-6 rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Account
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Email</span>
            <span className="text-sm font-medium text-gray-900">{email}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Plan</span>
            <PlanBadge
              plan={userPlan.plan}
              trialActive={userPlan.trialActive}
            />
          </div>

          {userPlan.trialActive && userPlan.trialEndsAt && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Trial ends</span>
              <span className="text-sm text-amber-600">
                {new Date(userPlan.trialEndsAt).toLocaleDateString()} (
                {trialDaysRemaining} day{trialDaysRemaining !== 1 ? "s" : ""}{" "}
                left)
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Scans this month</span>
            <span className="text-sm font-medium text-gray-900">
              {userPlan.scanCount}
              {userPlan.scanLimit != null
                ? ` / ${userPlan.scanLimit}`
                : ""}{" "}
              scans
            </span>
          </div>
        </div>
      </section>

      {/* Section 2: API Key */}
      <section className="mb-6 rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Key className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            API Key (BYOK)
          </h2>
        </div>

        {hasApiKey && !showApiKeyInput ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-700">
                API key saved (sk-ant-...****)
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowApiKeyInput(true)}
              >
                Update
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveApiKey}
                className="text-red-500 hover:bg-red-50 hover:text-red-600"
              >
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              Enter your Anthropic API key to use your own Claude credits.
            </p>
            <Input
              name="api_key"
              type="password"
              placeholder="sk-ant-..."
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setApiKeyError(null);
              }}
              error={apiKeyError ?? undefined}
            />
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveApiKey}
                disabled={apiKeySaving || !apiKey}
              >
                {apiKeySaving ? "Saving..." : "Save API Key"}
              </Button>
              {hasApiKey && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowApiKeyInput(false);
                    setApiKey("");
                    setApiKeyError(null);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Section 3: Billing */}
      <section className="mb-6 rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Billing
          </h2>
        </div>

        {userPlan.plan === "free" && !userPlan.trialActive ? (
          <div className="space-y-3">
            <button
              onClick={() =>
                handleCheckout(process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!)
              }
              disabled={
                isCheckoutLoading ===
                process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
              }
              className="flex w-full items-center justify-between rounded-xl border border-brand-200 bg-brand-50 p-4 text-left transition-colors hover:bg-brand-100"
            >
              <div>
                <p className="text-sm font-semibold text-brand-700">
                  Upgrade to Pro
                </p>
                <p className="text-xs text-brand-600">
                  Unlimited scans — $9.99/mo
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-brand-400" />
            </button>

            <button
              onClick={() =>
                handleCheckout(
                  process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID!,
                )
              }
              disabled={
                isCheckoutLoading ===
                process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID
              }
              className="flex w-full items-center justify-between rounded-xl border border-purple-200 bg-purple-50 p-4 text-left transition-colors hover:bg-purple-100"
            >
              <div>
                <p className="text-sm font-semibold text-purple-700">
                  Upgrade to Business
                </p>
                <p className="text-xs text-purple-600">
                  Team features — $6.99/user/mo
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-purple-400" />
            </button>
          </div>
        ) : (
          <div>
            <Button
              variant="secondary"
              onClick={handleBillingPortal}
              disabled={!stripeCustomerId}
              className="w-full"
            >
              <span className="flex items-center justify-center gap-2">
                <Shield className="h-4 w-4" />
                Manage Billing
              </span>
            </Button>
            {!stripeCustomerId && (
              <p className="mt-2 text-xs text-gray-400">
                No billing account found.
              </p>
            )}
          </div>
        )}
      </section>

      {/* Section 4: Sign out */}
      <section className="rounded-xl bg-white p-4 shadow-sm">
        <Button
          variant="secondary"
          className="w-full border-red-200 text-red-600 hover:bg-red-50"
          onClick={() => setShowLogoutConfirm(true)}
        >
          <span className="flex items-center justify-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </span>
        </Button>
      </section>

      {/* Sign out confirmation */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Sign out?</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to sign out of your account?
            </p>
            <div className="mt-4 flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
