# Paid Ads — Xpenz 90-Day Builder Launch

**Budget framing:** test with $20–40/day on Meta for 2 weeks before scaling. Google Ads layered on top once Meta is profitable.

**Tracking goal:** see signup → trial-active → paid conversion by channel. Set up a UTM convention before spending anything.

**UTM convention:**
- `utm_source` — `meta` / `google` / `tiktok`
- `utm_medium` — `cpc`
- `utm_campaign` — `builders90`
- `utm_content` — ad creative identifier (`problem-led-v1`, `proof-led-v2`, etc.)

**No mention of any specific builder coach or named community.** Generic "investor-builders" / "GCs" / "flippers" only.

---

## Meta Ads (Facebook + Instagram)

Meta is the priority channel — the target investor-builder audience lives on Instagram and Facebook.

### Audience targeting

**Test audience 1 — Builder interests:**
- Interests: General Contractor, Real estate investing, House flipping, Construction management, Construction
- Age: 28–55
- Geo: United States (start nationwide, narrow to top-converting states after 14 days)
- Detailed targeting expansion: ON

**Test audience 2 — Lookalike (after you have 100+ signups):**
- LAL 1% of your `signup_complete` event
- Same geo + age as audience 1

**Test audience 3 — Real estate investor angle:**
- Interests: BiggerPockets, Real estate investing, Fix and flip, Rental property
- Same geo + age
- Behaviors: Small business owners

### Placements

- Instagram Feed
- Instagram Reels
- Facebook Feed
- Facebook Reels
- Stories (both)

Skip Audience Network and Messenger placements — they waste budget on low-intent traffic for SaaS.

### Ad creative — 3 variants

#### Variant 1: Problem-led

**Format:** vertical video, 9:16, 15s reel from the social content doc ("Truck door receipt")

**Primary text:**
> Every year. Same pile of receipts on the dashboard. Same April panic. Same CPA bill that doubles because they have to sort it.
>
> Snap receipts straight from the job site — AI tags the vendor, project, sub, and tax category. 90 days free. No credit card.

**Headline:** "Stop losing receipts. 90 days free."

**Description:** "Built for investor-builders running 3–30 jobs."

**CTA button:** "Sign Up"

**Destination:** `https://xpenz.us/?utm_source=meta&utm_medium=cpc&utm_campaign=builders90&utm_content=problem-led-v1`

---

#### Variant 2: Proof-led

**Format:** single image — clean dashboard screenshot showing 4 projects with per-project totals.

**Primary text:**
> One builder, four flips. After 90 days of Xpenz he realized one job was bleeding $1,800/mo in unbilled materials. He'd been working it for months thinking it was fine.
>
> That's the part QuickBooks doesn't tell you — which job specifically is the problem. Xpenz does.
>
> 90 days free. No credit card.

**Headline:** "Know which job is bleeding cash."

**Description:** "Per-project expense tracking for builders."

**CTA:** "Learn More" → landing page

**Destination:** `https://xpenz.us/?utm_source=meta&utm_medium=cpc&utm_campaign=builders90&utm_content=proof-led-v1`

---

#### Variant 3: Offer-led

**Format:** static image with bold offer copy. Gold/amber background, navy headline, phone mockup at right.

**Primary text:**
> 90 days of Pro. Free. No credit card.
>
> Snap a receipt. AI fills in vendor, amount, project, sub, tax category — in 3 seconds. CSV exports your CPA loves.
>
> If you're a builder running 3+ jobs, this is the tool you've been writing in your head.

**Headline:** "90 days free Pro — Xpenz"

**Description:** "Receipt scanner + job costing for builders."

**CTA:** "Sign Up"

**Destination:** `https://xpenz.us/?utm_source=meta&utm_medium=cpc&utm_campaign=builders90&utm_content=offer-led-v1`

---

### Meta budget + cadence

- **Days 1–7:** $20/day across all 3 variants, 1 ad set per audience, broad creative test
- **Days 8–14:** Kill bottom variant. Push $30/day into top 2 ads. Add custom audience of website visitors.
- **Day 15+:** If cost per signup ≤ $25, scale to $50–80/day. If cost per signup > $50, pause and rework creative — don't throw money at bad ads.

**Target CAC math:**
- Pro plan = $9.99/mo. Average builder who converts probably stays 12+ months → LTV ~$120.
- Target CAC: ≤ 33% of LTV → $40 per paid signup is the ceiling.
- Plenty of slack for $20–25 per signup at launch pricing.

---

## Google Ads (Search)

Layer Google on top of Meta after week 2. Lower volume, higher intent.

### Keyword groups

| Group | Sample keywords | Notes |
|-------|-----------------|-------|
| Contractor expense tools | "contractor expense app", "construction expense tracker", "general contractor accounting app" | High commercial intent, mid-volume |
| Job costing | "job costing software", "construction job cost tracker", "flip cost tracker app" | Builders actively shopping |
| Receipt scanners | "receipt scanner app for business", "AI receipt scanner", "scan receipts for taxes" | Broader audience — exclude bookkeeper keywords |
| 1099 tracking | "1099 contractor tracker", "subcontractor payment tracker", "track payments to subs" | January spike — schedule budget for Q1 lift |
| Schedule C / small biz tax | "schedule C app", "self employed expense tracker", "tax categories for contractors" | Lower volume but specific |

### Sample RSAs (Responsive Search Ads)

#### Group 1 — Contractor expense tools

**Headlines (15 max, pick 10–12):**
- Receipts → categorized in 3 seconds
- For investor-builders & GCs
- Snap, tag, export. 90 days free.
- The contractor expense app
- 90 days free Pro · No credit card
- Built for the truck seat, not the office
- Per-project expense tracking
- Schedule C ready out of the box
- 1099 totals when you need them
- AI receipt scanner for builders

**Descriptions (4 max):**
- Snap a receipt, AI tags vendor, project, sub, tax category. CSV export. 90 days free.
- Built for builders running 3–30 jobs. Per-project tracking, sub directory, tax-ready export.
- Stop losing receipts. Per-project cost tracking. 1099 totals ready in January. Try free for 90 days.
- No credit card required. Built by a builder, for builders. Sign up at xpenz.us.

### Negative keywords (exclude these)

- `free template`
- `excel`
- `pdf form`
- `download`
- `course`
- `job estimating` (different product)

### Google budget

- Start: $10/day on each of the top 2 groups
- Scale on top of any keyword with CPA ≤ $30

---

## TikTok (optional, phase 2)

Skip at launch. Revisit if Meta CPA is great and you want to scale volume. The same 5 reel scripts in `social-content.md` work directly as TikTok ads.

---

## What NOT to spend money on

- **Programmatic display banners** — wasted budget for SaaS at this stage.
- **LinkedIn Ads** — your audience is on IG, not LinkedIn.
- **YouTube pre-roll** — too expensive for the funnel size today.

---

## Measurement

### Tracking events (set up before launch)

| Event | Where |
|-------|-------|
| `landing_view` | Root page load |
| `cta_click` | Any "Start 90 Days Free" button click |
| `signup_start` | /signup page load |
| `signup_complete` | After successful auth.signUp |
| `first_scan` | First receipt logged |
| `subscription_active` | Stripe webhook on paid conversion |

Wire these to:
- Meta Pixel + Conversions API
- Google Ads tag
- Internal analytics (Supabase event log or PostHog)

### Weekly review

Every Monday, look at:
- Cost per signup by channel + creative
- Trial → paid conversion rate (overall + by channel)
- Top-converting UTM source/medium combo
- Worst-performing ad: kill or rework

---

## Phase 2 — Retargeting

After 30+ days of data:

- **Retarget landing-page visitors who didn't sign up** — Meta carousel showing 3 features, headline "Still on the fence?"
- **Retarget signups who didn't scan** — drip email + Meta ad showing a 6-second reel of the snap flow
- **Retarget free users at day 75 of their 90-day trial** — soft upgrade nudge with a 20% off first 3 months offer to convert before the trial ends
