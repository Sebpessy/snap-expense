# Paid Ads — Xpenz 90-Day Launch

**Budget framing:** test with $20–40/day on Meta for 2 weeks before scaling. Google Ads layered on top once Meta is profitable.

**Tracking goal:** see signup → trial-active → paid conversion by channel. Set up a UTM convention before spending anything.

**UTM convention:**
- `utm_source` — `meta` / `google` / `tiktok` / `linkedin`
- `utm_medium` — `cpc`
- `utm_campaign` — `launch90`
- `utm_content` — ad creative identifier (`problem-led-v1`, `proof-led-v2`, etc.)

**No mention of any specific coach, mastermind, or named community** in ad creative. Generic "independents / self-employed / freelancers / small business" only.

---

## Meta Ads (Facebook + Instagram)

Meta is the priority channel — broad self-employed and small-business audiences live on Instagram and Facebook.

### Audience targeting

**Test audience 1 — Self-employed interests:**
- Interests: Self-employment, Small business, Freelancing, Entrepreneurship, Sole proprietorship
- Age: 25–55
- Geo: United States (start nationwide, narrow to top-converting states after 14 days)
- Detailed targeting expansion: ON

**Test audience 2 — Creative/agency interests:**
- Interests: Graphic design, Photography business, Freelance writing, Copywriting, Web design, Marketing agency
- Same geo + age
- Behaviors: Small business owners

**Test audience 3 — Service / trades interests:**
- Interests: General contractor, Real estate investing, House flipping, Consulting, Coaching (business)
- Same geo + age
- Behaviors: Engaged shoppers

**Test audience 4 — Lookalike (after you have 100+ signups):**
- LAL 1% of your `signup_complete` event
- Same geo + age as audience 1

### Placements

- Instagram Feed
- Instagram Reels
- Facebook Feed
- Facebook Reels
- Stories (both)

Skip Audience Network and Messenger placements — they waste budget on low-intent traffic for SaaS.

### Ad creative — 3 variants

#### Variant 1: Problem-led

**Format:** vertical video, 9:16, 15s reel from the social content doc ("Receipt avalanche")

**Primary text:**
> Every year. Same pile of receipts in your bag / inbox / desk drawer. Same April panic. Same CPA bill that doubles because they have to sort it.
>
> Snap receipts straight from your phone — AI tags the vendor, project, client, and tax category. 90 days free. No credit card.

**Headline:** "Stop losing receipts. 90 days free."

**Description:** "Built for independents and small business owners."

**CTA button:** "Sign Up"

**Destination:** `https://xpenz.us/?utm_source=meta&utm_medium=cpc&utm_campaign=launch90&utm_content=problem-led-v1`

---

#### Variant 2: Proof-led

**Format:** single image — clean dashboard screenshot showing 4 active client projects with per-project totals.

**Primary text:**
> One freelancer, four clients. After 90 days of Xpenz she realized one client was costing her $1,800/mo in unbilled materials + software. She'd been working that client for months thinking it was fine.
>
> That's the part QuickBooks doesn't tell you — which project specifically is the problem. Xpenz does.
>
> 90 days free. No credit card.

**Headline:** "Know which client is bleeding cash."

**Description:** "Per-project expense tracking for independents."

**CTA:** "Learn More" → landing page

**Destination:** `https://xpenz.us/?utm_source=meta&utm_medium=cpc&utm_campaign=launch90&utm_content=proof-led-v1`

---

#### Variant 3: Offer-led

**Format:** static image with bold offer copy. Gold/amber background, navy headline, phone mockup at right.

**Primary text:**
> 90 days of Pro. Free. No credit card.
>
> Snap a receipt. AI fills in vendor, amount, project, client, tax category — in 3 seconds. CSV exports your CPA loves.
>
> If you're self-employed or running a small business, this is the tool you've been writing in your head.

**Headline:** "90 days free Pro — Xpenz"

**Description:** "Receipt scanner + project tracking for independents."

**CTA:** "Sign Up"

**Destination:** `https://xpenz.us/?utm_source=meta&utm_medium=cpc&utm_campaign=launch90&utm_content=offer-led-v1`

---

### Meta budget + cadence

- **Days 1–7:** $20/day across all 3 variants, 1 ad set per audience, broad creative test
- **Days 8–14:** Kill bottom variant. Push $30/day into top 2 ads. Add custom audience of website visitors.
- **Day 15+:** If cost per signup ≤ $25, scale to $50–80/day. If cost per signup > $50, pause and rework creative — don't throw money at bad ads.

**Target CAC math:**
- Pro plan = $9.99/mo. Average user who converts probably stays 12+ months → LTV ~$120.
- Target CAC: ≤ 33% of LTV → $40 per paid signup is the ceiling.
- Plenty of slack for $20–25 per signup at launch pricing.

---

## Google Ads (Search)

Layer Google on top of Meta after week 2. Lower volume, higher intent.

### Keyword groups

| Group | Sample keywords | Notes |
|-------|-----------------|-------|
| Self-employed expense apps | "self employed expense tracker", "1099 expense tracker", "freelancer expense app", "sole proprietor receipt scanner" | High commercial intent, mid-volume |
| Small business receipt scanners | "small business receipt scanner", "AI receipt scanner business", "scan receipts for taxes" | Broader, exclude bookkeeper keywords |
| Project / client tracking | "freelance project tracker", "client expense tracker", "track expenses per client" | Independents actively shopping |
| 1099 / contractor tracking | "1099 contractor tracker", "track payments to freelancers", "contractor payment tracker" | January spike — schedule budget for Q1 lift |
| Schedule C / tax categories | "schedule C app", "self employed tax categories", "irs schedule C tracker" | Lower volume but specific |

### Sample RSAs (Responsive Search Ads)

#### Group 1 — Self-employed expense apps

**Headlines (15 max, pick 10–12):**
- Receipts → categorized in 3 seconds
- For freelancers & small business
- Snap, tag, export. 90 days free.
- The expense app for independents
- 90 days free Pro · No credit card
- Built for your phone, not a cubicle
- Per-project expense tracking
- Schedule C ready out of the box
- 1099 totals when you need them
- AI receipt scanner for independents

**Descriptions (4 max):**
- Snap a receipt, AI tags vendor, project, client, tax category. CSV export. 90 days free.
- Built for self-employed and small business. Per-project tracking, contractor directory, tax-ready export.
- Stop losing receipts. Per-project cost tracking. 1099 totals ready in January. Try free for 90 days.
- No credit card required. Built by an independent, for independents. Sign up at xpenz.us.

### Negative keywords (exclude these)

- `free template`
- `excel`
- `pdf form`
- `download`
- `course`
- `job estimating` (different product)
- `corporate`
- `enterprise`

### Google budget

- Start: $10/day on each of the top 2 groups
- Scale on top of any keyword with CPA ≤ $30

---

## LinkedIn (optional, phase 2)

LinkedIn fits the consultant / agency / freelance-professional segment. Higher CPC ($8–15) but much higher intent if targeted well.

**Test audience:**
- Job titles: Freelance / Consultant / Owner / Founder / Solo Practitioner / Self-Employed
- Company size: 1–10 employees (and "Self-Employed" company)
- Industries: Design, Photography, Writing, Marketing, IT, Real Estate, Construction, Consulting

**Format:** single-image sponsored content or carousel.

**Budget:** $30/day for 2-week test, before scaling.

---

## TikTok (optional, phase 2)

Skip at launch. Revisit if Meta CPA is great and you want to scale volume. The same 5 reel scripts in `social-content.md` work directly as TikTok ads.

---

## What NOT to spend money on

- **Programmatic display banners** — wasted budget for SaaS at this stage.
- **YouTube pre-roll** — too expensive for the funnel size today.
- **X/Twitter Ads** — high cost, low conversion for independent-audience SaaS.

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
