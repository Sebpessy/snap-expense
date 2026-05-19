import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      // stripe-node v17's types only know "2025-02-24.acacia", but the account
      // default is "2026-04-22.dahlia" — pin to that so SDK responses match
      // what live webhook events carry (notably current_period_* on items).
      apiVersion: "2026-04-22.dahlia" as Stripe.LatestApiVersion,
    });
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as any)[prop];
  },
});

export async function createCheckoutSession(params: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  quantity?: number;
}) {
  return stripe.checkout.sessions.create({
    customer: params.customerId,
    mode: "subscription",
    line_items: [{ price: params.priceId, quantity: params.quantity ?? 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    subscription_data: { trial_period_days: undefined },
  });
}

export async function createBillingPortalSession(params: {
  customerId: string;
  returnUrl: string;
}) {
  return stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  });
}

export async function getOrCreateCustomer(
  email: string,
  userId: string,
): Promise<string> {
  // Check if customer exists
  const existing = await stripe.customers.list({ email, limit: 1 });
  if (existing.data.length > 0) return existing.data[0].id;

  const customer = await stripe.customers.create({
    email,
    metadata: { supabase_user_id: userId },
  });
  return customer.id;
}
