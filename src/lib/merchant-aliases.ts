import "server-only";
import { createClient } from "@/lib/supabase/server";

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Look up a user-defined merchant alias and return the canonical name if the
 * raw merchant matches one of the patterns. Globals (user_id IS NULL) and per-user
 * rules are both eligible; per-user rules win on tie.
 */
export async function canonicalizeMerchant(
  userId: string,
  raw: string | null | undefined,
): Promise<string | null> {
  if (!raw) return null;
  const norm = normalize(raw);
  if (!norm) return raw;

  const supabase = await createClient();
  const { data } = await supabase
    .from("merchant_aliases")
    .select("user_id, pattern, canonical")
    .or(`user_id.eq.${userId},user_id.is.null`);

  if (!data || data.length === 0) return raw;

  // Per-user rules first, then globals — first contains-match wins
  const sorted = [...data].sort((a, b) =>
    a.user_id === userId ? -1 : b.user_id === userId ? 1 : 0,
  );
  for (const row of sorted) {
    if (norm.includes(normalize(row.pattern as string))) {
      return row.canonical as string;
    }
  }
  return raw;
}
