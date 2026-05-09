import { createAdminClient } from "@/lib/supabase/admin";
import { WebhooksClient } from "./webhooks-client";

export default async function AdminWebhooksPage() {
  const supabase = createAdminClient();

  const { data: events, error } = await supabase
    .from("webhook_events")
    .select(
      "id, stripe_event_id, event_type, payload, processed, error_message, processed_at"
    )
    .order("processed_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Failed to load webhook events: ${error.message}`);
  }

  return <WebhooksClient initialEvents={events ?? []} />;
}
