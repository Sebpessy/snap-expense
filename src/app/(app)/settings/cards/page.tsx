import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type PaymentCard } from "@/lib/types";
import { CardsClient } from "./cards-client";

export default async function CardsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: cards } = await supabase
    .from("payment_cards")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <CardsClient cards={(cards ?? []) as PaymentCard[]} />;
}
