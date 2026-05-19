"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { type ProjectStatus } from "@/lib/types";

const STATUSES: ProjectStatus[] = ["active", "completed", "archived"];

function parseProjectFields(formData: FormData) {
  const name = ((formData.get("name") as string) || "").trim();
  const client_name = ((formData.get("client_name") as string) || "").trim() || null;
  const formatted_address =
    ((formData.get("formatted_address") as string) || "").trim() || null;
  const place_id = ((formData.get("place_id") as string) || "").trim() || null;

  const latRaw = (formData.get("lat") as string) || "";
  const lngRaw = (formData.get("lng") as string) || "";
  const lat = latRaw && !isNaN(Number(latRaw)) ? Number(latRaw) : null;
  const lng = lngRaw && !isNaN(Number(lngRaw)) ? Number(lngRaw) : null;

  const statusRaw = ((formData.get("status") as string) || "active").trim();
  const status = (STATUSES as string[]).includes(statusRaw)
    ? (statusRaw as ProjectStatus)
    : ("active" as ProjectStatus);
  const notes = ((formData.get("notes") as string) || "").trim() || null;
  return { name, client_name, formatted_address, place_id, lat, lng, status, notes };
}

export async function createProjectAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false as const, error: "Not authenticated" };

    const fields = parseProjectFields(formData);
    if (!fields.name) return { success: false as const, error: "Name is required" };

    const { data, error } = await supabase
      .from("projects")
      .insert({ user_id: user.id, ...fields })
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") {
        return {
          success: false as const,
          error: "A project with that name already exists",
        };
      }
      throw new Error(error.message);
    }
    revalidatePath("/settings/projects");
    revalidatePath("/capture");
    return { success: true as const, id: data.id as string };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
}

export async function updateProjectAction(id: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false as const, error: "Not authenticated" };

    const fields = parseProjectFields(formData);
    if (!fields.name) return { success: false as const, error: "Name is required" };

    const { error } = await supabase
      .from("projects")
      .update(fields)
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) {
      if (error.code === "23505") {
        return {
          success: false as const,
          error: "A project with that name already exists",
        };
      }
      throw new Error(error.message);
    }
    revalidatePath("/settings/projects");
    revalidatePath(`/settings/projects/${id}`);
    revalidatePath("/capture");
    return { success: true as const };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
}

export async function changeProjectStatusAction(id: string, status: ProjectStatus) {
  try {
    if (!(STATUSES as string[]).includes(status)) {
      return { success: false as const, error: "Invalid status" };
    }
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false as const, error: "Not authenticated" };

    const { error } = await supabase
      .from("projects")
      .update({ status })
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) throw new Error(error.message);
    revalidatePath("/settings/projects");
    revalidatePath(`/settings/projects/${id}`);
    revalidatePath("/capture");
    return { success: true as const };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
}

export async function deleteProjectAction(id: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false as const, error: "Not authenticated" };

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) throw new Error(error.message);
    revalidatePath("/settings/projects");
    revalidatePath("/capture");
    return { success: true as const };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
}
