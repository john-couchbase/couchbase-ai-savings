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

Input and output charges are calculated separately. In per-token mode, the visitor
enters the percentage of their bill spent on input tokens (50% is an illustrative,
editable assumption). In GPU mode, the input-cost fraction is derived from input/output
token counts multiplied by their respective prices.

For each enabled prompt-reduction lever, `f = workload share × reduction rate`.
Caching uses `c = cache-eligible share × hit rate` (zero when disabled).

```
input keep = (1 − c) × product(1 − f) over enabled prompt-reduction levers
output keep = 1 − c
remaining bill = annual input cost × input keep + annual output cost × output keep
lever savings = annual token bill − remaining bill
GPU total savings = annual dedicated fleet cost − remaining serverless bill
```

Low/high savings are computed separately. The bill comparison and break-even use
these combined bill reduction fractions. A complete bill reduction has no finite
break-even, rather than an infinite numeric value. Prompt reductions alone cannot
eliminate output charges. This remains a directional model assuming multiplicative
overlap; it does not measure overlap or net out Couchbase/implementation costs.

### Regression examples

Per-token defaults: $20,000/month and 50% of costs assigned to input tokens.

| Scenario | Annual savings |
|---|---|
| Caching only, Not sure yet | $16,200–$43,200 |
| Agent Memory only | $9,900–$13,500 |
| Retrieval only | $14,040–$22,320 |
| Tool search only | $8,820 |
| All four at defaults | $44,107–$75,738 |
| GPU defaults, no levers | $94,687 |
| GPU defaults, all four | $97,955–$100,636 |
| GPU defaults, tool search only, 100% workload share | $3,881 lever savings |
| GPU input price $0, prompt reductions only | $0 lever savings |

With all four on, default token-mode overlap is $4,853–$12,102, and the
remaining model bill is $164,262–$195,893/year. GPU fleet cost and the pre-lever
break-even are unchanged ($115,807/year and about 5.5M requests/month).

Run `node --test tests/math.test.cjs` for regression coverage. The page needs no
build step; Node is needed only to run these development tests.

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

## Guided estimate update — November 2026

The page now uses three steps: baseline spending, workload selection, and a single
result. Navigation preserves values. Sources use native disclosure controls outside
checkbox labels. Advanced rates remain editable, with no focus-stealing table rebuild.

Reserved presets model 730 committed billed hours per month regardless of runtime;
on-demand and custom rates use entered billed hours. This compares annualized cost,
not immediately cancellable reserved commitments or cash-flow ROI. Invalid/missing
values block forward navigation and suppress estimates. Zero values are allowed;
zero-price serverless models have no finite crossover. Inputs have explicit bounds
and instances must be whole numbers. Overlap is an assumption, not measured deduplication.

Run all tests: `node --test tests/*.test.cjs`. The seeded generated test checks one
million scenarios against a separate remaining-cost formula, savings bounds, and
breakdown identities. It validates implementation consistency, not empirical savings.
