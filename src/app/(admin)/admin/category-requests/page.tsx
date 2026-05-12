import { createClient } from "@/lib/supabase/server";
import { type CategoryRequest } from "@/lib/types";
import { CategoryRequestsClient } from "./category-requests-client";

export default async function CategoryRequestsPage() {
  const supabase = await createClient();

  const { data: requests } = await supabase
    .from("category_requests")
    .select("*")
    .order("created_at", { ascending: false });

  // Also fetch user emails (admin RLS allows reading all profiles via is_admin())
  const userIds = Array.from(new Set((requests ?? []).map((r) => r.user_id as string)));
  const emails = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", userIds);
    for (const p of profiles ?? []) {
      if (p.email) emails.set(p.id as string, p.email as string);
    }
  }

  return (
    <CategoryRequestsClient
      requests={(requests ?? []) as CategoryRequest[]}
      emailsByUserId={Object.fromEntries(emails)}
    />
  );
}
