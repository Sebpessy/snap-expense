"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function reviewCategoryRequestAction(
  id: string,
  status: "approved" | "rejected",
  adminResponse: string | null = null,
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false as const, error: "Not authenticated" };

    const { error } = await supabase
      .from("category_requests")
      .update({ status, admin_response: adminResponse })
      .eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin/category-requests");
    return { success: true as const };
  } catch (err) {
    return { success: false as const, error: (err as Error).message };
  }
}
