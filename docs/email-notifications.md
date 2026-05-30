# Email Notifications

Two events email you the moment they happen:

| Event | When | Subject |
|-------|------|---------|
| **Visit** | First landing-page view in a browser session (once per visitor session) | `👀 New Xpenz visitor — [city, country]` |
| **Signup** | Right after `supabase.auth.signUp` resolves successfully | `🎉 New Xpenz signup — user@example.com` |

Each email includes IP, country/region/city (via Vercel headers in production), referrer, UTM params, language, screen size, and user-agent. Signup emails also include the email address, Supabase user ID, and whether email-confirmation is pending.

## Setup (5 minutes)

### 1. Create a Resend account

[resend.com](https://resend.com) — free tier covers 100 emails/day, 3000/month. No credit card required for the free plan.

### 2. Get an API key

Resend dashboard → API Keys → Create API Key → name it "xpenz-production" → copy the `re_xxxxx` string.

### 3. Set environment variables

**Required:**
```
RESEND_API_KEY=re_xxxxx                  # the key you just copied
NOTIFY_EMAIL_TO=sebpessy@gmail.com       # where alerts go
```

**Optional:**
```
NOTIFY_EMAIL_FROM=Xpenz <notifications@xpenz.us>
# Defaults to "Xpenz <onboarding@resend.dev>" if not set.
# Switch to your own xpenz.us address once you verify the domain
# in Resend (Dashboard → Domains → Add Domain → add the DNS records).
```

**Local dev:** add these to `.env.local` and restart `npm run dev`.

**Production (Vercel):** Project Settings → Environment Variables → add the three vars → redeploy or wait for the next build.

If `RESEND_API_KEY` or `NOTIFY_EMAIL_TO` is missing, notifications are **silently skipped** — no errors, no logs. Useful for preview deploys where you don't want spam.

## Verify your domain (for production)

Sending from `onboarding@resend.dev` works out of the box but:
- The "From" address looks generic
- Some email clients flag it as suspicious

For a polished setup, verify `xpenz.us` in Resend:

1. Resend Dashboard → Domains → Add Domain → `xpenz.us`
2. Add the four DNS records Resend gives you (MX, SPF, DKIM × 2) to your DNS provider
3. Wait 5–30 min, click "Verify"
4. Set `NOTIFY_EMAIL_FROM=Xpenz <notifications@xpenz.us>` in your env vars
5. Redeploy

## What the emails look like

**Signup email** — green header, table with email, user ID, status, UTC time, location, IP, referrer, UTM.

**Visit email** — blue header, table with path, location, IP, referrer, UTM, language, screen size, user-agent.

Both render cleanly in Gmail, Apple Mail, and Outlook on desktop + mobile.

## Throttling (if visits get noisy)

Visit emails fire once per **browser session** (debounced in `sessionStorage`), not once per page view. For a quiet launch site this is fine — maybe 5–50 emails/day.

If traffic ramps and you start getting too many visit emails, options in order of effort:

1. **Disable visit emails** — comment out the `notifyVisit(...)` call in [`src/app/api/webhooks/visit/route.ts`](../src/app/api/webhooks/visit/route.ts)
2. **Only first-time visitors** — extend the `sessionStorage` check to `localStorage` (persists across sessions per device)
3. **Rate-limit at the API level** — add a per-IP rate limit (e.g. once per IP per day) using a small in-memory cache or Redis
4. **Daily digest** — switch to a scheduled job that emails a once-daily summary instead of per-event

Tell me when you're ready for any of these.

## Test it locally

1. Set `RESEND_API_KEY` and `NOTIFY_EMAIL_TO` in `.env.local`
2. `npm run dev`
3. Open `http://localhost:3000/` in a private window → check your inbox for the visit email within a few seconds
4. Go to `/signup` and create a test account → check inbox for the signup email

## Implementation files

- [`src/lib/notify.ts`](../src/lib/notify.ts) — Resend client, email templates, `notifyVisit` / `notifySignup` functions
- [`src/app/api/webhooks/visit/route.ts`](../src/app/api/webhooks/visit/route.ts) — API endpoint that receives client beacon, enriches with IP/country, calls `notifyVisit`
- [`src/app/api/webhooks/signup/route.ts`](../src/app/api/webhooks/signup/route.ts) — same pattern for signup events
- [`src/app/(marketing)/_components/visit-beacon.tsx`](../src/app/(marketing)/_components/visit-beacon.tsx) — client beacon that fires once per session on landing
- [`src/app/(auth)/signup/signup-client.tsx`](../src/app/(auth)/signup/signup-client.tsx) — fires signup beacon after `auth.signUp` succeeds
