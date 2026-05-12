"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createCardAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false as const, error: "Not authenticated" };

    const last4 = (formData.get("last4") as string || "").replace(/\D/g, "");
    if (!/^\d{4}$/.test(last4)) {
      return { success: false as const, error: "Last 4 must be 4 digits" };
    }
    const nickname = (formData.get("nickname") as string) || null;
    const isBusiness = formData.get("is_business") === "true";

    const { error } = await supabase.from("payment_cards").insert({
      user_id: user.id,
      last4,
      nickname,
      is_business: isBusiness,
    });
    if (error) {
      if (error.code === "23505") {
        return { success: false as const, error: "A card ending in those 4 digits already exists" };
      }
      throw new Error(error.message);
    }
    revalidatePath("/settings/cards");
    return { success: true as const };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
}

export async function updateCardAction(id: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false as const, error: "Not authenticated" };

    const nickname = (formData.get("nickname") as string) || null;
    const isBusiness = formData.get("is_business") === "true";

    const { error } = await supabase
      .from("payment_cards")
      .update({ nickname, is_business: isBusiness })
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) throw new Error(error.message);
    revalidatePath("/settings/cards");
    return { success: true as const };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
}

export async function deleteCardAction(id: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false as const, error: "Not authenticated" };

    const { error } = await supabase
      .from("payment_cards")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) throw new Error(error.message);
    revalidatePath("/settings/cards");
    return { success: true as const };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
}
