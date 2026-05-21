# Snap Expense

AI-powered receipt scanner and expense categorizer for freelancers and small businesses. Snap a photo of any receipt and Snap Expense uses Claude Vision to extract merchant, amount, date, and category -- then saves it to your expense log automatically.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, Tailwind CSS 4
- **Database & Auth**: Supabase (PostgreSQL + Row Level Security + Auth)
- **Payments**: Stripe (subscriptions, webhooks)
- **AI**: Claude Vision API (receipt extraction via BYOK)
- **Deployment**: PWA-ready (installable on mobile)

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Next.js App                           │
├──────────────┬───────────────┬───────────────────────────────┤
│  (app)       │  (admin)      │  API Routes                   │
│  /expenses   │  /admin       │  /api/webhooks/stripe         │
│  /capture    │  /admin/users │                               │
│  /settings   │  /admin/subs  │                               │
│              │  /admin/hooks │                               │
├──────────────┴───────────────┴───────────────────────────────┤
│  Server Actions     │  Data Layer (lib/data/)                │
│  (mutations)        │  (Supabase queries)                    │
├─────────────────────┴────────────────────────────────────────┤
│  Supabase (Auth + PostgreSQL + RLS)   │  Stripe (Billing)   │
├───────────────────────────────────────┴──────────────────────┤
│  Claude Vision API (BYOK - user provides their own key)      │
└──────────────────────────────────────────────────────────────┘
```

## BYOK (Bring Your Own Key)

Snap Expense uses a BYOK model for the Claude Vision API. Each user provides their own Anthropic API key, which is encrypted at rest using AES-256 and stored in the `profiles.encrypted_anthropic_key` column. Keys are decrypted server-side only at the moment of an API call and never exposed to the client.

## Pricing Tiers

| Feature | Free | Pro ($9.99/mo) | Business ($6.99/user/mo) |
|---------|------|----------------|--------------------------|
| Scans per month | 5 | Unlimited | Unlimited |
| Categories | Basic | Full set | Full set + custom |
| Export | CSV | CSV, PDF | CSV, PDF, QuickBooks |
| Team members | 1 | 1 | Unlimited |
| API key storage | BYOK | BYOK | BYOK |
| Trial | 30 days Pro | - | - |

## Setup Instructions

### 1. Install Dependencies

```bash
cd expense-categorizer
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com).
2. Apply the database migration:

```bash
npx supabase db push
```

This creates the following tables: `profiles`, `expenses`, `subscriptions`, `webhook_events`.

3. Enable Row Level Security (RLS) on all tables. Admin RLS policies should allow users with `role = 'admin'` to read/write all rows.

### 3. Set Up Stripe

1. Create a Stripe account at [stripe.com](https://stripe.com).
2. Create two products with recurring prices:
   - **Pro**: $9.99/month
   - **Business**: $6.99/month (per-seat)
3. Configure a webhook endpoint pointing to `https://your-domain.com/api/webhooks/stripe` with the following events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy the webhook signing secret.

### 4. Environment Variables

Create a `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_BUSINESS_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Encryption (for BYOK key storage)
ENCRYPTION_KEY=your-256-bit-hex-key
```

### 5. Run the Dev Server

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

### 6. Set Yourself as Admin

After signing up, promote your account to admin:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'you@example.com';
```

Then navigate to `/admin` to access the admin dashboard.

## File Structure

```
expense-categorizer/
├── src/
│   ├── app/
│   │   ├── (app)/                    # User-facing routes
│   │   │   ├── expenses/             # Expense list + detail
│   │   │   ├── capture/              # Receipt scanner
│   │   │   └── settings/             # User settings + billing
│   │   ├── (admin)/                  # Admin route group
│   │   │   ├── layout.tsx            # Admin layout + role guard
│   │   │   ├── admin-sidebar.tsx     # Sidebar navigation
│   │   │   └── admin/
│   │   │       ├── page.tsx          # Dashboard (stats, charts)
│   │   │       ├── users/            # User management
│   │   │       ├── subscriptions/    # Subscription viewer
│   │   │       └── webhooks/         # Webhook event log
│   │   ├── api/
│   │   │   └── webhooks/
│   │   │       └── stripe/
│   │   │           └── route.ts      # Stripe webhook handler
│   │   └── (auth)/                   # Login, signup
│   ├── components/
│   │   └── ui/
│   │       ├── data-table.tsx        # Reusable data table
│   │       └── chart.tsx             # Recharts area chart wrapper
│   └── lib/
│       ├── data/                     # Supabase query functions
│       ├── supabase/
│       │   ├── server.ts             # Cookie-based client (respects RLS)
│       │   └── admin.ts              # Service role client (bypasses RLS)
│       ├── stripe.ts                 # Stripe instance
│       ├── plans.ts                  # Plan config + prices
│       ├── types.ts                  # Shared types + formatters
│       └── utils.ts                  # Utility functions
```

## How Receipt Extraction Works

1. **Capture**: User takes a photo or uploads an image via the camera interface.
2. **Resize**: Image is resized client-side to max 1024px to reduce API costs.
3. **Claude Vision**: The resized image is sent to the Claude API (using the user's own API key) with a structured extraction prompt.
4. **Normalize**: The AI response is parsed and normalized (merchant name cleanup, amount to cents, date formatting, category code mapping).
5. **Save**: The structured expense record is saved to Supabase via a server action.

## Admin Dashboard Features

- **Stats Overview**: Total users, paying users, trial users, MRR
- **User Growth Chart**: 30-day signup trend (recharts AreaChart)
- **Churn Rate**: Rolling 30-day cancellation percentage
- **User Management**: Search, sort, extend trials, change plans, link to Stripe
- **Subscription Viewer**: All subscriptions with status badges and Stripe links
- **Webhook Event Log**: Expandable JSON payloads, error tracking, type filtering

## PWA Installation

Snap Expense is a Progressive Web App. On supported devices:

1. Visit the app in Chrome or Safari
2. Tap "Add to Home Screen" (or the install prompt)
3. The app launches in standalone mode with native-like navigation
4. Camera access works directly from the installed app

## Security Notes

- **BYOK Encryption**: User API keys are encrypted with AES-256 before storage; the encryption key is stored only in environment variables, never in the database.
- **Row Level Security**: All Supabase tables have RLS enabled. Users can only access their own data. Admin policies grant elevated access to admin-role users.
- **Signed URLs**: Any receipt images stored in Supabase Storage use short-lived signed URLs (never public).
- **Webhook Verification**: The Stripe webhook endpoint verifies signatures using `stripe.webhooks.constructEvent` before processing any event.
- **Admin Guard**: The admin layout performs server-side role checks on every request; non-admin users are redirected.
- **No Secrets in Client**: Stripe secret key, Supabase service role key, and encryption keys are never exposed to the browser.
