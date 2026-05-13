import { createAdminClient } from "@/lib/supabase/admin";
import { getActivePlans } from "@/lib/plans";
import { UsersClient } from "./users-client";

export default async function AdminUsersPage() {
  const supabase = createAdminClient();

  const [{ data: profiles, error }, plans] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, email, display_name, role, plan, trial_ends_at, scan_count_this_period, stripe_customer_id, created_at",
      )
      .order("created_at", { ascending: false }),
    getActivePlans(),
  ]);

  if (error) {
    throw new Error(`Failed to load users: ${error.message}`);
  }

  return (
    <UsersClient
      initialUsers={profiles ?? []}
      planOptions={plans.map((p) => ({ code: p.code, name: p.name }))}
    />
  );
}
