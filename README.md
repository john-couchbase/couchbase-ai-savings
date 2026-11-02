# AI Data Plane Token Savings Estimator

A one-page calculator that estimates how much the Couchbase AI Data Plane could take off a team's model bill. It has two starting points:

- **Per token:** the visitor enters monthly token spend, turns on the levers that match their workload, and gets a directional annual savings range.
- **Dedicated GPUs:** the visitor enters their GPU fleet and traffic. The estimator prices the same traffic on a serverless model in Capella Model Service (billed per token through Amazon Bedrock), shows the fleet vs. serverless gap, then applies the levers to the serverless bill.

Every assumption and source is shown on the page.

**Status:** prototype for the couchbase.com web team. It's built to sit next to the [Database TCO Calculator](https://www.couchbase.com/database-tco-calculator/) and uses the same visual style and caching assumptions.

Based on an earlier internal prototype by Mike Broberg (`mikebroberg-couchbase/token-estimator`), with the messaging, claims, and math reworked for AI Data Plane promotion.

## Run it

Open `index.html` in a browser. It has no build step and no dependencies apart from the Inter font from Google Fonts. All the logic is plain JavaScript in the same file.

## The four levers

| # | Lever | Couchbase capability | Default reduction | Source |
|---|---|---|---|---|
| 1 | Exact and semantic caching | Capella Model Service | Set by traffic shape (2–42% of total spend) | Traffic shapes from the Database TCO Calculator; mechanism from [Model Service docs](https://docs.couchbase.com/ai/build/model-service/configure-value-adds.html) |
| 2 | Agent Memory | Agent Memory | 33–45% of the assigned share | Couchbase LoCoMo result, legal-approved website wording |
| 3 | Hybrid Search retrieval | Hybrid Search + Vectorization Service | 39–62% of the assigned share | [Li et al., EMNLP 2024](https://arxiv.org/abs/2407.16833), Table 1 (third-party) |
| 4 | Agent Catalog tool search | Agent Catalog | 49% of the assigned share | [RAG-MCP, arXiv 2505.03275](https://arxiv.org/abs/2505.03275), Table 1 (third-party) |

The total combines the levers instead of adding them, so it can never exceed the visitor's bill:

```
lever fraction = share of spend × reduction rate      (caching: cache-eligible share × hit rate)
lever savings  = token spend × [1 − (1 − f1)(1 − f2)(1 − f3)(1 − f4)]
```

On the dedicated GPU path, token spend is the serverless bill for the visitor's traffic:

```
dedicated GPUs per year = instances × hourly rate × hours per month × 12
serverless per year     = requests per month × 12 × (input tokens × input price + output tokens × output price) ÷ 1,000,000
total savings           = (dedicated − serverless) + lever savings on the serverless bill
```

Defaults: two g6e.12xlarge instances (4× NVIDIA L40S each) at the 1-year reserved rate of $6.61/hour, always on; 1M requests a month at 2,000 input and 400 output tokens; Amazon Nova 2 Lite at $0.33 / $2.75 per 1M tokens. That gives a 5.5× gap and a break-even of about 5.5M requests a month. The defaults are deliberately more conservative than the AIDP Air storm demo, which models a bursty, peak-sized fleet. When the fleet is cheaper, the page says so.

## Files

| File | What it is |
|---|---|
| `index.html` | The calculator (markup, styles, and script in one file) |
| `docs/MESSAGING-REVIEW.md` | What changed from the original prototype, why, and the open items that still need sign-off |
| `docs/WEB-TEAM-HANDOFF.md` | Integration notes, the calculation spec, test cases, and the pre-launch checklist |

## Before this goes live

Read the open items in `docs/MESSAGING-REVIEW.md`. A few claims and scope details still need Legal or product confirmation before external use.
