import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", (err as Error).message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Stripe API 2025-03-31.preview moved current_period_* from the Subscription
  // root onto each SubscriptionItem. Read item-first, fall back to root so the
  // handler works against both the SDK's pinned apiVersion and live webhooks.
  const readPeriod = (sub: {
    current_period_start?: number | null;
    current_period_end?: number | null;
    items: {
      data: Array<{
        current_period_start?: number | null;
        current_period_end?: number | null;
      }>;
    };
  }) => {
    const item = sub.items.data[0];
    return {
      start: item?.current_period_start ?? sub.current_period_start ?? null,
      end: item?.current_period_end ?? sub.current_period_end ?? null,
    };
  };

  const toIso = (unixSeconds: number | null) =>
    unixSeconds != null ? new Date(unixSeconds * 1000).toISOString() : null;

  // Log the event
  await supabase.from("webhook_events").upsert(
    {
      stripe_event_id: event.id,
      event_type: event.type,
      payload: event.data.object as unknown as Record<string, unknown>,
      processed: true,
      error_message: null,
      processed_at: new Date().toISOString(),
    },
    { onConflict: "stripe_event_id" }
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as {
          customer: string;
          subscription: string;
        };
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        // Find user by stripe_customer_id
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (profile && subscriptionId) {
          // Fetch subscription details from Stripe
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = sub.items.data[0]?.price.id;
          const plan =
            priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ? "pro" : "business";
          const period = readPeriod(sub as unknown as Parameters<typeof readPeriod>[0]);

          // Create subscription record
          await supabase.from("subscriptions").upsert(
            {
              user_id: profile.id,
              stripe_subscription_id: subscriptionId,
              stripe_price_id: priceId,
              status: sub.status,
              plan,
              quantity: sub.items.data[0]?.quantity ?? 1,
              current_period_start: toIso(period.start),
              current_period_end: toIso(period.end),
              cancel_at_period_end: sub.cancel_at_period_end,
            },
            { onConflict: "stripe_subscription_id" }
          );

          // Update user plan
          await supabase
            .from("profiles")
            .update({ plan })
            .eq("id", profile.id);
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as {
          id: string;
          status: string;
          items: {
            data: Array<{
              price: { id: string };
              quantity: number;
              current_period_start?: number | null;
              current_period_end?: number | null;
            }>;
          };
          current_period_start?: number | null;
          current_period_end?: number | null;
          cancel_at_period_end: boolean;
        };
        const priceId = sub.items.data[0]?.price.id;
        const plan =
          priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ? "pro" : "business";
        const period = readPeriod(sub);

        await supabase
          .from("subscriptions")
          .update({
            status: sub.status,
            plan,
            stripe_price_id: priceId,
            quantity: sub.items.data[0]?.quantity ?? 1,
            current_period_start: toIso(period.start),
            current_period_end: toIso(period.end),
            cancel_at_period_end: sub.cancel_at_period_end,
          })
          .eq("stripe_subscription_id", sub.id);

        // Sync plan to profile
        const { data: subRecord } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", sub.id)
          .single();

        if (subRecord) {
          await supabase
            .from("profiles")
            .update({ plan })
            .eq("id", subRecord.user_id);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as { id: string };

        // Get user_id before updating status
        const { data: subRecord } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", sub.id)
          .single();

        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            cancel_at_period_end: false,
          })
          .eq("stripe_subscription_id", sub.id);

        // Downgrade to free
        if (subRecord) {
          await supabase
            .from("profiles")
            .update({ plan: "free" })
            .eq("id", subRecord.user_id);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as {
          subscription: string | null;
        };
        if (invoice.subscription) {
          await supabase
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("stripe_subscription_id", invoice.subscription);
        }
        break;
      }
    }
  } catch (err) {
    // Log error but don't fail the webhook
    console.error("Webhook processing error:", (err as Error).message);
    await supabase
      .from("webhook_events")
      .update({
        processed: false,
        error_message: (err as Error).message,
      })
      .eq("stripe_event_id", event.id);
  }

  return NextResponse.json({ received: true });
}
