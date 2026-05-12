"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { type SubStatus } from "@/lib/types";

const STATUSES: SubStatus[] = ["active", "inactive", "blacklisted"];

function parseSubFields(formData: FormData) {
  const name = ((formData.get("name") as string) || "").trim();
  const trade = ((formData.get("trade") as string) || "").trim() || null;
  const contact_name = ((formData.get("contact_name") as string) || "").trim() || null;
  const contact_email = ((formData.get("contact_email") as string) || "").trim() || null;
  const contact_phone = ((formData.get("contact_phone") as string) || "").trim() || null;
  const tax_id = ((formData.get("tax_id") as string) || "").trim() || null;
  const statusRaw = (formData.get("status") as string) || "active";
  const status = (STATUSES as string[]).includes(statusRaw)
    ? (statusRaw as SubStatus)
    : ("active" as SubStatus);
  const notes = ((formData.get("notes") as string) || "").trim() || null;
  return { name, trade, contact_name, contact_email, contact_phone, tax_id, status, notes };
}

export async function createSubAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false as const, error: "Not authenticated" };

    const fields = parseSubFields(formData);
    if (!fields.name) return { success: false as const, error: "Name is required" };

    const { data, error } = await supabase
      .from("subs")
      .insert({ user_id: user.id, ...fields })
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") {
        return { success: false as const, error: "A sub with that name already exists" };
      }
      throw new Error(error.message);
    }
    revalidatePath("/settings/subs");
    return { success: true as const, id: data.id as string };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
}

export async function updateSubAction(id: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false as const, error: "Not authenticated" };

    const fields = parseSubFields(formData);
    if (!fields.name) return { success: false as const, error: "Name is required" };

    const { error } = await supabase
      .from("subs")
      .update(fields)
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) throw new Error(error.message);
    revalidatePath("/settings/subs");
    revalidatePath(`/settings/subs/${id}`);
    return { success: true as const };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
}

export async function deleteSubAction(id: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false as const, error: "Not authenticated" };

    const { error } = await supabase
      .from("subs")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) throw new Error(error.message);
    revalidatePath("/settings/subs");
    return { success: true as const };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
}

export async function addSubAliasAction(subId: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false as const, error: "Not authenticated" };

    const alias = ((formData.get("alias") as string) || "").trim();
    if (!alias) return { success: false as const, error: "Alias is required" };

    const { error } = await supabase.from("sub_aliases").insert({
      user_id: user.id,
      sub_id: subId,
      alias,
    });
    if (error) {
      if (error.code === "23505") return { success: false as const, error: "Alias already exists" };
      throw new Error(error.message);
    }
    revalidatePath(`/settings/subs/${subId}`);
    return { success: true as const };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
}

export async function deleteSubAliasAction(aliasId: string, subId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false as const, error: "Not authenticated" };

    const { error } = await supabase
      .from("sub_aliases")
      .delete()
      .eq("id", aliasId)
      .eq("user_id", user.id);
    if (error) throw new Error(error.message);
    revalidatePath(`/settings/subs/${subId}`);
    return { success: true as const };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
}
