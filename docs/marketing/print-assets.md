# Print Asset Specs — Xpenz 90-Day Builder Launch

Two pieces. Both designed to hand to a builder at an event, drop on a job site, or stick in a binder.

**Primary CTA on every piece:** `xpenz.us` with a QR code.

**No mention of any specific builder coach or named community.** Generic "investor-builders" / "builders" framing only.

---

## Asset 1 — QR business card

### Specs

| Field | Value |
|-------|-------|
| Size | 3.5" × 2" (standard US business card) |
| Bleed | 0.125" all sides |
| Color | CMYK + spot navy + spot amber |
| Stock | 16pt or 18pt matte, soft-touch laminate optional |
| Print quantity | 500 to start (cheap to reprint) |

### Front layout

```
+------------------------------------------+
|                                          |
|   XPENZ                  [QR CODE]      |
|                                          |
|   Snap a receipt.                        |
|   Done.                                  |
|                                          |
|   --------                               |
|                                          |
|   90 days free.    xpenz.us              |
|   No credit card.                        |
|                                          |
+------------------------------------------+
```

- **Wordmark** (top-left): "Xpenz" in Inter ExtraBold, white on navy.
- **QR code** (top-right): scan target = `https://xpenz.us/?utm_source=card&utm_medium=print&utm_campaign=builders90`
- **Headline:** "Snap a receipt. Done." — Inter ExtraBold, ~22pt
- **Offer line:** "90 days free. No credit card." — Inter Semibold, amber accent
- **URL:** "xpenz.us" — Inter Bold

### Back layout

```
+------------------------------------------+
|                                          |
|   For investor-builders running          |
|   3–30 active jobs.                      |
|                                          |
|   ✓  Snap receipts on-site               |
|   ✓  Tag every expense to a project      |
|   ✓  Track every sub for 1099s           |
|   ✓  Export CSV your CPA loves           |
|                                          |
|   xpenz.us  ·  90 days free              |
|                                          |
+------------------------------------------+
```

Background: white. Type: Inter, 9–10pt for bullets, dark gray (#1f2937). Amber checkmarks.

### Color tokens (from brand palette)

- Navy: `#1e3a8a` (brand-900)
- Brand blue: `#2563eb` (brand-600)
- Amber: `#f59e0b` (warning/promo)
- Dark gray: `#1f2937`

### File format for the printer

- PDF/X-1a with embedded fonts
- Two-page (front, back)
- Final dimensions 3.625" × 2.125" (with bleed)

---

## Asset 2 — Event flyer (letter-size handout)

### Specs

| Field | Value |
|-------|-------|
| Size | 8.5" × 11" (US Letter) |
| Bleed | 0.125" all sides |
| Color | CMYK |
| Stock | 80–100lb matte text or gloss |
| Sides | Single-sided for handout speed |

### Layout (top-to-bottom)

```
+--------------------------------------------------+
|                                                  |
|   XPENZ                                          |
|                                                  |
|   Snap a receipt.                                |
|   Done.                                          |
|                                                  |
|   Built for investor-builders.                   |
|                                                  |
|   ============================================   |
|   |                                          |   |
|   |        [ LARGE PRODUCT SCREENSHOT ]      |   |
|   |          (phone mockup, capture)         |   |
|   |                                          |   |
|   ============================================   |
|                                                  |
|   What you get:                                  |
|                                                  |
|   ✓  AI receipt scan — vendor, amount,           |
|      category in 3 seconds                       |
|                                                  |
|   ✓  Per-project allocation — know which         |
|      job is bleeding cash before it closes       |
|                                                  |
|   ✓  Subcontractor + 1099 tracking — 1099        |
|      season stops being a fire drill             |
|                                                  |
|   ✓  Schedule C tax categories — 20+ IRS lines  |
|      mapped out of the box                       |
|                                                  |
|   ✓  CSV export your CPA actually wants          |
|                                                  |
|                                                  |
|   ============================================   |
|   |                                          |   |
|   |   90 DAYS FREE PRO.                      |   |
|   |   NO CREDIT CARD.                        |   |
|   |                                          |   |
|   |   xpenz.us           [LARGE QR CODE]     |   |
|   |                                          |   |
|   ============================================   |
|                                                  |
|   Made for the trades.                           |
|                                                  |
+--------------------------------------------------+
```

### Typography

- **Wordmark:** Inter ExtraBold, 36pt, navy.
- **Headline ("Snap a receipt. Done."):** Inter Black, 72pt, navy with amber drop on "Done."
- **Subheading ("Built for investor-builders."):** Inter Semibold, 24pt, brand blue.
- **Bullet body:** Inter Medium, 16pt, dark gray.
- **Promo box:** amber background (#f59e0b), white text, 32pt Inter ExtraBold for "90 DAYS FREE PRO."

### Print-friendly grayscale fallback

If the venue's printer is b&w only, design must legibly degrade to grayscale. Don't rely on color alone for the QR or for the bullet checkmarks. Use bold weight and high contrast instead.

### QR code URL

`https://xpenz.us/?utm_source=flyer&utm_medium=print&utm_campaign=builders90`

Test with three different phones (iPhone front camera, Android default, older iPhone) before sending to the printer.

---

## Production notes

### Cheapest reliable printers

- **Vistaprint** — fast turnaround, ~$30 for 500 business cards, ~$50–80 for 100 flyers.
- **Moo** — better quality, soft-touch finish, ~$60–80 for 500 cards.
- **Local printer** — usually beats Moo on flyer pricing if you're doing 250+.

### What to bring to events

- 250 business cards in shirt pocket / wallet
- 50 flyers stacked on the table or near a coffee station
- A Sharpie — sometimes the personal scribble on the back of a card ("hit me up — Seb") is what gets remembered

### Tracking attribution

Every printed asset MUST have a UTM-tagged URL or QR code so you can see in analytics which channel actually converted. Don't print anything without it.

---

## Generation

To produce the actual PDF files, use the `pdf` skill with the layouts above. If Seb wants the build, ask and we'll generate proofs.
