import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/plans";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "plan, trial_ends_at, scan_count_this_period, encrypted_anthropic_key, stripe_customer_id",
    )
    .eq("id", user.id)
    .single();

  const userPlan = profile
    ? await getUserPlan(profile)
    : {
        plan: "free",
        planName: "Free",
        trialActive: false,
        trialEndsAt: null,
        scanCount: 0,
        scanLimit: 15,
        canScan: true,
        hasApiKey: false,
      };

  return (
    <SettingsClient
      email={user.email ?? ""}
      userPlan={userPlan}
      stripeCustomerId={profile?.stripe_customer_id ?? null}
    />
  );
}
