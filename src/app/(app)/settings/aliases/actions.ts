"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

export async function createAliasAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false as const, error: "Not authenticated" };

    const pattern = ((formData.get("pattern") as string) || "").trim();
    const canonical = ((formData.get("canonical") as string) || "").trim();
    if (!pattern || !canonical) {
      return { success: false as const, error: "Pattern and canonical name are required" };
    }

    const { error } = await supabase.from("merchant_aliases").insert({
      user_id: user.id,
      pattern,
      canonical,
    });
    if (error) throw new Error(error.message);
    revalidatePath("/settings/aliases");
    return { success: true as const };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
}

export async function deleteAliasAction(id: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false as const, error: "Not authenticated" };

    const { error } = await supabase
      .from("merchant_aliases")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) throw new Error(error.message);
    revalidatePath("/settings/aliases");
    return { success: true as const };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
}

export async function previewAliasMatches(pattern: string): Promise<{ count: number; samples: string[] }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { count: 0, samples: [] };

  const norm = normalize(pattern);
  if (!norm) return { count: 0, samples: [] };

  const { data } = await supabase
    .from("expenses")
    .select("merchant")
    .eq("user_id", user.id)
    .not("merchant", "is", null);

  const matches = (data ?? [])
    .map((r) => r.merchant as string)
    .filter((m) => normalize(m).includes(norm));

  return {
    count: matches.length,
    samples: Array.from(new Set(matches)).slice(0, 5),
  };
}
