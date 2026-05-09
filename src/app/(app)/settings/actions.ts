"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createCheckoutSession,
  createBillingPortalSession,
  getOrCreateCustomer,
} from "@/lib/stripe";

export async function saveApiKeyAction(formData: FormData) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const apiKey = formData.get("api_key") as string;

    if (!apiKey || !apiKey.startsWith("sk-ant-")) {
      return {
        success: false,
        error: "Invalid API key format. Must start with sk-ant-",
      };
    }

    // Store encrypted key via RPC
    const { error } = await supabase.rpc("set_encrypted_key", {
      user_uuid: user.id,
      api_key: apiKey,
      secret: process.env.API_KEY_ENCRYPTION_SECRET!,
    });

    if (error) throw new Error(error.message);

    revalidatePath("/settings");
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function removeApiKeyAction() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { error } = await supabase
      .from("profiles")
      .update({ encrypted_anthropic_key: null })
      .eq("id", user.id);

    if (error) throw new Error(error.message);

    revalidatePath("/settings");
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function createCheckoutAction(priceId: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateCustomer(user.email!, user.id);

    // Save stripe_customer_id to profile if not already set
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id)
      .is("stripe_customer_id", null);

    const origin =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await createCheckoutSession({
      customerId,
      priceId,
      successUrl: `${origin}/settings?checkout=success`,
      cancelUrl: `${origin}/settings?checkout=cancelled`,
    });

    return { success: true, url: session.url };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function openBillingPortalAction() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return { success: false, error: "No billing account found" };
    }

    const origin =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await createBillingPortalSession({
      customerId: profile.stripe_customer_id,
      returnUrl: `${origin}/settings`,
    });

    return { success: true, url: session.url };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
