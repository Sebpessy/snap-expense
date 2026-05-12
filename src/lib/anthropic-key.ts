import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Resolve the Anthropic API key to use for a given user.
 *
 * Preference order:
 *   1. The user's BYOK (decrypted via the `get_decrypted_key` RPC)
 *   2. The platform-wide `ANTHROPIC_API_KEY` env var
 *
 * Returns null if neither is available — caller decides how to surface that.
 */
export async function resolveAnthropicKey(userId: string): Promise<string | null> {
  const secret = process.env.API_KEY_ENCRYPTION_SECRET;
  if (secret) {
    const adminClient = createAdminClient();
    const { data } = await adminClient.rpc("get_decrypted_key", {
      user_uuid: userId,
      secret,
    });
    if (data) return data as string;
  }
  return process.env.ANTHROPIC_API_KEY ?? null;
}
