# Marketing — Xpenz 90-Day Launch

Generic, broad-audience framing throughout. Target: independent workers and small business owners — freelancers, consultants, contractors, agencies, e-commerce sellers, photographers, trades, anyone with 1099 income or self-employment expenses. No coach / community / niche references in any deliverable — verified by grep before each ship.

## Deliverables in this folder

| File | What it is |
|------|------------|
| [outreach-playbook.md](./outreach-playbook.md) | **Priority 1.** Cold-DM templates (3 variants), reply ladder, 3-email outreach sequence, 5-email in-product drip, cadence rules, personalization checklist. |
| [social-content.md](./social-content.md) | 10 IG caption-ready posts, 5 short-form reel scripts, 3 IG Story templates, hashtag sets, weekly posting cadence. |
| [print-assets.md](./print-assets.md) | QR business card + letter-size event flyer specs (dimensions, layout, typography, UTM-tagged URLs, printer notes). |
| [paid-ads.md](./paid-ads.md) | Meta + Google Ads playbook: audience targeting, 3 ad-copy variants, keyword groups, RSA examples, budgets, retargeting roadmap. |

## Campaign at a glance

- **Offer:** 90 days of Pro, free, no credit card required.
- **Mechanism:** universal — applies to every new signup during the campaign window. Set via Supabase trigger in [migrations/007_extend_trial_to_90_days.sql](../../supabase/migrations/007_extend_trial_to_90_days.sql).
- **Landing page:** root of xpenz.us. Code lives in [src/app/page.tsx](../../src/app/page.tsx) + [src/app/(marketing)/_components/](../../src/app/(marketing)/_components/).
- **Primary CTA everywhere:** "Start 90 Days Free" → `/signup`.

## UTM convention (use everywhere)

`?utm_source={source}&utm_medium={medium}&utm_campaign=launch90&utm_content={creative}`

- `utm_source`: `ig`, `fb`, `meta`, `google`, `card`, `flyer`, `email`, `dm`, `tiktok`
- `utm_medium`: `dm`, `cpc`, `print`, `organic`, `email`
- `utm_campaign`: always `launch90` for this push
- `utm_content`: specific creative identifier

## Operating cadence

| Cadence | Activity |
|---------|----------|
| Daily | 15–20 personalized DMs (cap to avoid spam flags) |
| 3× / week | One social post (Tue reel, Thu carousel, Sat stories) |
| Weekly | Mon review of channel CAC + creative performance |
| Monthly | Refresh top-performing creatives, kill bottom 20% |

## What's NOT in scope yet

- Transactional email sender (Resend / Postmark) for the in-product drip — flagged as phase 2.
- UTM persistence on `profiles` for attribution-in-app — flagged in the original plan as optional.
- Direct QuickBooks Online sync — CSV export only today.
