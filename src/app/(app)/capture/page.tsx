import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/plans";
import { type PaymentCard, type Project, type Sub } from "@/lib/types";
import { CaptureClient } from "./capture-client";

export default async function CapturePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: profile },
    hasUserKey,
    { data: cards },
    { data: subs },
    { data: projects },
    { data: recentByProject },
  ] = await Promise.all([
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
    supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("name"),
    // Pull the 200 most recent expense → project links so we can rank active
    // projects by how recently they've been used as a fallback when geolocation
    // is unavailable.
    supabase
      .from("expenses")
      .select("project_id, created_at")
      .eq("user_id", user.id)
      .not("project_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  // Build a "days since last expense" ranking per project (lower = more recent).
  const recencyByProjectId: Record<string, number> = {};
  const now = Date.now();
  for (const row of (recentByProject ?? []) as { project_id: string; created_at: string }[]) {
    if (recencyByProjectId[row.project_id] !== undefined) continue;
    const days = (now - new Date(row.created_at).getTime()) / (1000 * 60 * 60 * 24);
    recencyByProjectId[row.project_id] = days;
  }

  const hasPlatformKey = Boolean(process.env.ANTHROPIC_API_KEY);
  const hasApiKey = (hasUserKey.data ?? false) || hasPlatformKey;

  const userPlan = await getUserPlan(
    profile ?? {
      plan: "free",
      trial_ends_at: null,
      scan_count_this_period: 0,
      scan_period_start: null,
      encrypted_anthropic_key: null,
    },
    user.id,
  );

  return (
    <CaptureClient
      hasApiKey={hasApiKey}
      userPlan={userPlan}
      existingCards={(cards ?? []) as PaymentCard[]}
      existingSubs={(subs ?? []) as Sub[]}
      existingProjects={(projects ?? []) as Project[]}
      projectRecencyDays={recencyByProjectId}
    />
  );
}
