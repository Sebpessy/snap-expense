import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type MerchantAlias } from "@/lib/types";
import { AliasesClient } from "./aliases-client";

export default async function AliasesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: aliases } = await supabase
    .from("merchant_aliases")
    .select("*")
    .eq("user_id", user.id)
    .order("canonical", { ascending: true });

  return <AliasesClient aliases={(aliases ?? []) as MerchantAlias[]} />;
}
