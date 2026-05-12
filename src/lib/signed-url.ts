import "server-only";
import { createClient } from "@/lib/supabase/server";

const TTL_SECONDS = 60 * 30;

export async function signReceiptUrl(path: string | null | undefined): Promise<string | null> {
  if (!path) return null;
  const supabase = await createClient();
  const { data } = await supabase.storage
    .from("receipts")
    .createSignedUrl(path, TTL_SECONDS);
  return data?.signedUrl ?? null;
}

export async function signReceiptUrls(
  paths: (string | null | undefined)[],
): Promise<(string | null)[]> {
  const valid = paths.filter((p): p is string => Boolean(p));
  if (valid.length === 0) return paths.map(() => null);

  const supabase = await createClient();
  const { data } = await supabase.storage
    .from("receipts")
    .createSignedUrls(valid, TTL_SECONDS);

  const byPath = new Map<string, string>();
  for (const item of data ?? []) {
    if (item.path && item.signedUrl) byPath.set(item.path, item.signedUrl);
  }
  return paths.map((p) => (p ? byPath.get(p) ?? null : null));
}
