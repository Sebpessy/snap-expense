import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/plans";
import { type PaymentCard, type Sub } from "@/lib/types";
import { CaptureClient } from "./capture-client";

export default async function CapturePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, hasUserKey, { data: cards }, { data: subs }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "plan, trial_ends_at, scan_count_this_period, scan_period_start, encrypted_anthropic_key",
      )
      .eq("id", user.id)
      .single(),
    supabase.rpc("has_anthropic_key", { user_uuid: user.id }),
    supabase
      .from("payment_cards")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("subs")
      .select("*")
      .eq("user_id", user.id)
      .neq("status", "blacklisted")
      .order("name"),
  ]);

  const hasPlatformKey = Boolean(process.env.ANTHROPIC_API_KEY);
  const hasApiKey = (hasUserKey.data ?? false) || hasPlatformKey;

  const userPlan = getUserPlan(
    profile ?? {
      plan: "free",
      trial_ends_at: null,
      scan_count_this_period: 0,
      encrypted_anthropic_key: null,
    },
  );

  return (
    <CaptureClient
      hasApiKey={hasApiKey}
      userPlan={userPlan}
      existingCards={(cards ?? []) as PaymentCard[]}
      existingSubs={(subs ?? []) as Sub[]}
    />
  );
}
