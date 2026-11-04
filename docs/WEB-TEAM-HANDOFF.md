# Web team handoff

Notes for turning this prototype into a couchbase.com asset that sits next to the [Database TCO Calculator](https://www.couchbase.com/database-tco-calculator/).

## What you're getting

- One static file, `index.html`, about 46 KB. Vanilla HTML, CSS, and JavaScript, with no framework and no build step.
- The visual system copies the TCO calculator's styles: cream background, red primary result card, dark FAQ tiles, Inter font.
- Nothing is sent anywhere. All calculation happens in the browser.

## Relationship to the TCO calculator

The TCO calculator already has a "monthly LLM token budget" field, a workload-shape selector, and an "Estimated annual token savings" card. That card models caching only. This estimator uses the **same four traffic shapes with the same numbers** and adds three more AI Data Plane levers: Agent Memory, Hybrid Search retrieval, and Agent Catalog tool search.

Options, in order of preference:

1. **Standalone page that shares the TCO calculator's components**, for example `/ai-token-savings-calculator/`. Link the TCO calculator's token savings card to it ("See the full AI Data Plane estimate"), and link back from this page's CTA (already in place).
2. **A deeper step inside the TCO calculator.** This is harder: the TCO page mixes stack costs and token costs, and this page's levers would make that step crowded.

If either page's traffic-shape numbers change, update both. They live in `ARCHETYPES` at the top of the script.

## Where to change things

Everything editable sits in the config block at the top of the `<script>`:

| Constant | What it controls |
|---|---|
| `AGENT_MEMORY_AS_OF` | Date shown next to the Agent Memory benchmark result (methodology and disclaimer) |
| `ARCHETYPES` | Caching traffic shapes: cache-eligible share, hit-rate range, label, blurb |
| `PRICES_AS_OF` | Date shown next to GPU and model list prices. Update it every time prices are re-checked |
| `GPU_DEFAULTS` | Default fleet: instance count, hours a month, and which rate preset to start on |
| `GPU_RATE_PRESETS` | g6e.12xlarge hourly rates: on-demand, 1-year reserved, 3-year reserved |
| `TRAFFIC_DEFAULTS` | Default requests a month and input/output tokens per request (placeholders, not benchmarks) |
| `MODEL_PRESETS`, `DEFAULT_MODEL` | Serverless model presets with USD per 1M input and output tokens |
| `LEVERS` | Each lever's name, badge, blurb, share-slider label and default, default rate range, and tooltip text with docs link |

**Do not edit the Agent Memory `source` sentence** without Legal sign-off. It is the approved website wording, and a code comment marks it.

## Calculation spec

```
annual spend          = monthly spend × 12
lever fraction (f)    = share of spend × reduction rate
caching fraction (f)  = cache-eligible share × hit rate          (from the selected traffic shape)
lever on its own      = annual spend × f                         (low and high calculated separately)
total savings         = annual spend × [1 − Π(1 − f_i)]          over enabled levers
overlap row           = Σ(lever on its own) − total savings
% of spend            = total savings ÷ annual spend
```

The total doesn't depend on lever order and is always below annual spend.

### Dedicated GPU path

When the visitor picks "Dedicated GPUs" in Step 1, the token spend the levers act on becomes the serverless bill for their traffic:

```
dedicated per year    = instances × hourly rate × hours per month × 12
serverless per year   = requests per month × 12 × (input tokens × input price + output tokens × output price) ÷ 1,000,000
switch savings (D)    = dedicated − serverless                     (can be negative)
lever savings (L)     = serverless × [1 − Π(1 − f_i)]              (low and high)
total savings         = D + L
fleet multiple        = dedicated ÷ serverless
break-even requests   = (dedicated ÷ 12) ÷ serverless cost per request
```

Display rules:

- If the high end of the total is 0 or less, show "No savings at this traffic" and the warning that the fleet costs less.
- If only the low end is below 0, show "Up to $X".
- The warning message appears whenever D ≤ 0, even if the levers close the gap.

### Test cases

Use these to check a port. All of them use $20,000 per month ($240,000 per year), default shares (Agent Memory 25%, retrieval 30%, tool search 15%), and default rates.

| Scenario | Expected total | % of spend |
|---|---|---|
| Caching only, "Not sure yet" | $16,200 – $43,200 | 7–18% |
| Agent Memory only | $19,800 – $27,000 | 8–11% |
| Hybrid Search retrieval only | $28,080 – $44,640 | 12–19% |
| Agent Catalog tool search only | $17,640 | 7% |
| All four, "Not sure yet" | $72,014 – $108,276 | 30–45% |
| All four, "FAQ knowledge base", all three sliders at 100% | $202,231 – $225,163 | 84–94% |

With all four on at defaults, the overlap row shows −$9,706 to −$24,204.

**Before/after bars ("Your annual model bill").** These appear under the savings card once there's something to compare. "Today" is the annual token spend on the per-token path, or the fleet cost on the GPU path. "With the AI Data Plane" is that bill minus the savings, with the solid bar running to the low end and a lighter band out to the high end. Both bars share one scale, the larger of the two, so the gap between them shows the savings.

| Scenario | Today | With the AI Data Plane | Caption |
|---|---|---|---|
| Per token, all four levers, defaults | $240,000 | $131,724 – $167,986 | 30–45% less than you spend today |
| GPU path, no levers, defaults | $115,807 | $21,120 | 82% less than the fleet costs today |
| GPU path, all four levers, defaults | $115,807 | $11,592 – $14,783 | 87–90% less than the fleet costs today |
| GPU path, 10M requests/mo, no levers | $115,807 | $211,200 (longer bar) | At this traffic, serverless costs more than the fleet |

**Dedicated GPU path.** Defaults: 2 instances × $6.61/hour (1-year reserved) × 730 hours; 1M requests a month at 2,000 in / 400 out tokens; Nova 2 Lite at $0.33 / $2.75.

| Scenario | Fleet / yr | Serverless / yr | Expected total | Break-even |
|---|---|---|---|---|
| No levers | $115,807 | $21,120 | $94,687 | 5.5M requests/mo |
| All four levers, "Not sure yet" | $115,807 | $21,120 | $101,024 – $104,216 (levers $6,337 – $9,528) | 5.5M |
| On-demand rate, no levers | $183,785 | $21,120 | $162,665 | 8.7M |
| 3-year reserved rate, no levers | $79,366 | $21,120 | $58,246 | 3.8M |
| 10M requests/mo, no levers | $115,807 | $211,200 | "No savings at this traffic" (serverless costs $95,393 more) | 5.5M |

## Lead capture

The TCO calculator doesn't gate the estimate. It offers a 30-minute architect session through a "Start Now" form. Do the same here:

- Keep the estimate ungated. The FAQ tells visitors no email is needed.
- Point "Talk to an architect" (`#ctaPrimary`, currently a `/contact/` placeholder) at the same form.
- Optional: pass the estimate into hidden form fields so the architect has context. The useful values are monthly spend, enabled levers, traffic shape, the total savings range, and whether any rate was customized. All of them are in the `state` object and the return value of `computeTotal()`.

If analytics capture what visitors enter, update the FAQ answer "nothing you enter is sent anywhere" so it stays true.

## Suggested analytics events

`lever_toggled` (lever id, on/off), `traffic_shape_selected`, `spend_preset_clicked`, `rates_customized`, `breakdown_opened`, `cta_clicked` (which link).

## Before launch

- [ ] Swap the CSS logo placeholder (`.logo-mark`) for the real brand asset and header/footer
- [ ] Confirm the font matches couchbase.com (the prototype loads Inter to match the TCO calculator)
- [ ] Wire the architect-session form
- [ ] Resolve the open items in `MESSAGING-REVIEW.md` (Legal: as-of date and claim display; claims register: two third-party figures; product: Model Service caching scope)
- [ ] Accessibility pass (the prototype has labels, aria-live results, and keyboard tooltips, but no full audit)
- [ ] SEO: title and meta description are in place; consider FAQPage structured data for the FAQ block
- [ ] Check all docs links resolve at launch, since docs URLs move between releases
- [ ] Add the trademark line for the model names cited in the methodology (GPT-4o, Gemini), if the house rule requires it beyond the generic footer line
