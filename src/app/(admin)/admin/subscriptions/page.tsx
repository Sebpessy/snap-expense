import { createAdminClient } from "@/lib/supabase/admin";
import { SubscriptionsClient } from "./subscriptions-client";

export default async function AdminSubscriptionsPage() {
  const supabase = createAdminClient();

  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select(
      `
      id,
      stripe_subscription_id,
      stripe_price_id,
      status,
      plan,
      quantity,
      current_period_start,
      current_period_end,
      cancel_at_period_end,
      created_at,
      user:profiles!user_id(email)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load subscriptions: ${error.message}`);
  }

  // Flatten the user email
  const flattened = (subscriptions ?? []).map((sub) => ({
    ...sub,
    user_email: Array.isArray(sub.user)
      ? sub.user[0]?.email ?? "Unknown"
      : (sub.user as { email: string } | null)?.email ?? "Unknown",
  }));

  return <SubscriptionsClient initialSubscriptions={flattened} />;
}
