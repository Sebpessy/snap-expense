import { createAdminClient } from "@/lib/supabase/admin";
import { SubscriptionsClient } from "./subscriptions-client";

export default async function AdminSubscriptionsPage() {
  const supabase = createAdminClient();

  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select(
      `
      id,
      user_id,
      stripe_subscription_id,
      stripe_price_id,
      status,
      plan,
      quantity,
      current_period_start,
      current_period_end,
      cancel_at_period_end,
      created_at
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load subscriptions: ${error.message}`);
  }

  const userIds = Array.from(new Set((subscriptions ?? []).map((s) => s.user_id as string)));
  const emailsByUserId = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", userIds);
    for (const p of profiles ?? []) {
      emailsByUserId.set(p.id as string, (p.email as string) ?? "Unknown");
    }
  }

  const flattened = (subscriptions ?? []).map((sub) => ({
    ...sub,
    user_email: emailsByUserId.get(sub.user_id as string) ?? "Unknown",
  }));

  return <SubscriptionsClient initialSubscriptions={flattened} />;
}
