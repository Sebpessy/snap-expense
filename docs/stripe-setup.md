# Stripe setup

Snap Expense's Stripe integration is fully wired in code (checkout, billing portal, webhook handler for 4 events). To make it work end-to-end you need to fill in five env vars and configure one webhook endpoint.

## 1. Create products & prices in Stripe

In the [Stripe Dashboard](https://dashboard.stripe.com/products), create two recurring products:

| Product       | Recurring price            | Lookup key suggestion |
| ------------- | -------------------------- | --------------------- |
| Pro           | $9.99 / month              | `snap_expense_pro`    |
| Business      | $6.99 / month per user     | `snap_expense_biz`    |

Copy each **price ID** (looks like `price_xxxxxxxxxxxxxx`).

## 2. Fill in `.env.local`

```env
STRIPE_SECRET_KEY=sk_live_...            # or sk_test_... while testing
STRIPE_WEBHOOK_SECRET=whsec_...          # set after step 3
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_BUSINESS_PRICE_ID=price_...
```

Restart `npm run dev` after editing.

## 3. Local webhook testing (Stripe CLI)

Install the Stripe CLI: <https://stripe.com/docs/stripe-cli>

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The CLI prints `Ready! Your webhook signing secret is whsec_...` — copy that value into `STRIPE_WEBHOOK_SECRET` in `.env.local` and restart the dev server.

While `stripe listen` is running, real subscription events fire your local handler.

## 4. Production webhook

In Stripe Dashboard → **Developers → Webhooks → Add endpoint**:

- **URL**: `https://your-domain.com/api/webhooks/stripe`
- **Events to send**:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`

After creating the endpoint, copy its **Signing secret** (the `whsec_...` value) into the production `STRIPE_WEBHOOK_SECRET` env var.

## 5. Test the flow

1. As a free-trial user, go to **Settings → Upgrade to Pro**.
2. Stripe Checkout opens. Use [test card](https://stripe.com/docs/testing) `4242 4242 4242 4242`.
3. On completion the webhook fires `checkout.session.completed` → `subscriptions` row inserted, `profiles.plan` updated.
4. **Settings → Manage billing** opens the Stripe customer portal. Cancel or change plan there — `customer.subscription.updated` / `customer.subscription.deleted` keep the DB in sync.

## What's already in code

- `src/lib/stripe.ts` — lazy Stripe client + `createCheckoutSession`, `createBillingPortalSession`, `getOrCreateCustomer`
- `src/app/api/webhooks/stripe/route.ts` — signature verification + the 4 event handlers
- `src/lib/plans.ts` — plan limits (free: 15 scans/mo, pro/biz: unlimited)
- `src/app/(app)/settings/actions.ts` — `createCheckoutAction`, `openBillingPortalAction`
- `subscriptions` and `webhook_events` tables (migration `001_init.sql`)

## Common gotchas

- **Empty `ANTHROPIC_API_KEY` from parent shell**: if `npm run dev` is launched from a process that exports `ANTHROPIC_API_KEY=""`, that empty string masks the value in `.env.local`. Unset before launching: `unset ANTHROPIC_API_KEY && npm run dev`.
- **Webhook 400 errors**: usually a wrong `STRIPE_WEBHOOK_SECRET`. The signing secret from `stripe listen` is different from the one in your Dashboard webhook endpoint. Use the one matching your environment.
- **`createCheckoutSession` 400**: usually a missing or wrong `STRIPE_*_PRICE_ID`. Confirm the price exists in the same Stripe account as your `STRIPE_SECRET_KEY`.
