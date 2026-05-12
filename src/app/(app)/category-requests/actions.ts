"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function requestCategoryAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false as const, error: "Not authenticated" };

    const label = ((formData.get("requested_label") as string) || "").trim();
    const line = ((formData.get("suggested_schedule_c_line") as string) || "").trim() || null;
    if (!label) return { success: false as const, error: "Category name is required" };

    const { error } = await supabase.from("category_requests").insert({
      user_id: user.id,
      requested_label: label,
      suggested_schedule_c_line: line,
    });
    if (error) throw new Error(error.message);
    revalidatePath("/admin/category-requests");
    return { success: true as const };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
}
