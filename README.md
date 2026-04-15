# Snap Expense

A mobile-first, AI-powered expense categorizer built for U.S. freelancers,
gig workers, and sole proprietors. Snap a receipt, Claude vision extracts
the fields and picks an IRS Schedule C category, you confirm in one tap.

> **Status:** MVP scaffold — iPhone app (Expo / React Native), Supabase
> backend (Postgres + Auth + Storage), Claude Sonnet 4.5 vision via
> Supabase Edge Function.

## Stack

- **Client:** Expo SDK 51 + React Native 0.74 + Expo Router (TypeScript)
- **Auth + DB + Storage:** Supabase (Postgres, Row-Level Security, Storage)
- **AI:** Anthropic Claude Sonnet 4.5 vision, called from a Supabase Edge
  Function (Deno) so the API key stays server-side

## App structure

```
app/
├── _layout.tsx            # Root layout + auth gate
├── index.tsx              # Redirect based on session
├── (auth)/
│   ├── login.tsx
│   └── signup.tsx
├── (tabs)/                # Bottom tab nav (Expenses / Capture / Settings)
│   ├── expenses.tsx       # List + month-to-date deductible total
│   ├── capture.tsx        # Camera → Claude extract → review → save
│   └── settings.tsx
└── expense/[id].tsx       # Edit / delete one expense

src/
├── lib/
│   ├── supabase.ts        # Client configured with AsyncStorage persistence
│   ├── api.ts             # Typed CRUD + signed URLs + extract-receipt RPC
│   ├── categories.ts      # 21 Schedule C categories (stable codes)
│   └── types.ts           # Expense, ExtractionResult, formatters
├── hooks/
│   └── useAuth.tsx        # Supabase session provider
└── components/
    ├── ExpenseCard.tsx
    └── CategoryPicker.tsx # Searchable modal sheet

supabase/
├── migrations/001_init.sql                  # profiles + expenses + RLS + bucket
└── functions/extract-receipt/index.ts       # Claude vision Edge Function
```

## Setup

### 1. Install

```bash
cd expense-categorizer
npm install         # or pnpm install / yarn
```

### 2. Supabase project

1. Create a project at https://supabase.com.
2. Apply the schema:
   - In Supabase SQL editor, paste `supabase/migrations/001_init.sql`, run it.
   - Or via CLI: `supabase db push`.
3. Deploy the Edge Function and set the Anthropic key:
   ```bash
   supabase functions deploy extract-receipt
   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
   ```
4. In Supabase Auth settings, disable "Confirm email" for fastest local
   testing (or leave it on and confirm via email link).

### 3. Environment variables

Copy `.env.example` to `.env` and fill in:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

Expo inlines `EXPO_PUBLIC_*` into the client bundle.

### 4. Run on iPhone

- Install **Expo Go** on your iPhone from the App Store.
- From the project root:
  ```bash
  npm run start
  ```
- Scan the QR code with the iPhone camera. The app opens in Expo Go with
  full camera + Supabase auth.

### 5. Building a real standalone `.ipa`

When you want a true distributable iOS build:

```bash
npm install -g eas-cli
eas login
eas build --platform ios   # runs in Expo's cloud — no Mac required
```

For App Store submission you'll need an Apple Developer account ($99/yr).

## How extraction works

1. User snaps a receipt (or picks from library).
2. Image is resized to 1600px and compressed (JPEG @ 70%).
3. Base64 payload is posted to the `extract-receipt` Edge Function.
4. Function calls Claude Sonnet 4.5 with a strict JSON schema prompt
   (21 Schedule C categories) and returns a normalized `ExtractionResult`.
5. Client pre-fills a review form. User confirms or edits, then saves.
6. Image is uploaded to the private `receipts` bucket under `{user_id}/...`
   (RLS ensures only the owner can read).
7. A row lands in `expenses` with `raw_extraction` stored as JSONB for
   future re-training / corrections.

## Schedule C categories

The AI is constrained to 21 stable category codes (see
`src/lib/categories.ts`). Codes are persisted verbatim — don't rename
without a migration.

## Security notes

- `ANTHROPIC_API_KEY` lives **only** as a Supabase Edge Function secret.
  It's never shipped to the client.
- The `anon` key is public by design; Row-Level Security is the real
  access boundary.
- Receipts bucket is **private**; clients fetch signed URLs with a
  30-minute TTL.
- Every `expenses` row is scoped by `auth.uid() = user_id` RLS policies.

## Roadmap (not in MVP)

- [ ] CSV / PDF export grouped by Schedule C line
- [ ] Mileage tracking (automatic GPS trip detection)
- [ ] Bank / card feed import with receipt matching
- [ ] Quarterly estimated-tax summaries
- [ ] Multi-currency, with FX at transaction date
- [ ] Model-in-the-loop: learn per-user category corrections
