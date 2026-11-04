# Messaging and claims review

Review of the original token estimator prototype as a vehicle for Couchbase AI Data Plane promotion, and the changes made in this version. Reviewed November 2026.

## Summary

The original had a useful structure: a top-down estimate against current spend, levers the visitor turns on, and assumptions shown on the page. The problems were in the claims and the math. One rate used the wrong baseline, two were invented, it said a real Couchbase capability didn't exist, the total could pass 100% of spend, and internal notes were visible on the public page. All of that is fixed below. The open items at the end still need confirmation before launch.

## What changed and why

### 1. Agent Memory claim used the wrong baseline

- **Was:** "33–45%, extrapolated from internal benchmark testing (LoCoMo, LongMemEval) comparing full-context vs. Agent Memory–selected context."
- **Problem:** The legal-approved claim compares Agent Memory with *leading agent memory alternatives*, not with full context. LongMemEval is not covered by the approval at all.
- **Now:** Tooltip and methodology use the approved website sentence word for word: "On the standard LoCoMo benchmark, Agent Memory cuts token usage by 33-45% compared to leading agent memory alternatives." LongMemEval is removed. Mem0 and Zep are not named, per the website-channel rule.
- **Added for accuracy:** the tooltip and methodology now also say Agent Memory scores 82.3% on LoCoMo (LLM score). That's the cleared figure already on the live product page. It's sourced to the Couchbase blog post [What We Learned Evaluating Agent Memory: The Results (Part 2)](https://www.couchbase.com/blog/what-we-learned-evaluating-agent-memorythe-results-part-2/) (July 2026), which is also linked as "How we tested." It sits in its own sentence, so the approved token sentence is unchanged.
- **Not used from that post:** its token figures (summaries cut context from about 13,000 to 6,200 tokens; k=10 at 6,782 tokens beat k=20 at 13,087). They compare Agent Memory with its own earlier settings, not with what a customer runs today, so they can't serve as a savings rate. Its LongMemEval figures stay out too, since they aren't covered by the Legal approval.

### 2. Caching was described as "not a Couchbase feature"

- **Was:** "Generic pattern, not a named Couchbase feature. None of Couchbase's six AI Data Plane features is a semantic cache."
- **Problem:** Capella Model Service does exact-match and semantic caching ([Configure LLM Value Adds](https://docs.couchbase.com/ai/build/model-service/configure-value-adds.html)). The live AI Data Plane product page also says so, under "Costs That Fall as You Scale."
- **Now:** The lever is "Exact and semantic caching" with a Capella Model Service badge and a docs link. The traffic shapes and ranges are unchanged and still match the Database TCO Calculator.

### 3. Two reduction rates had no source

- **Was:** Vector Search/RAG at 55–70% and Agent Catalog at 75–85%, both labeled "this tool's own estimate."
- **Problem:** Figures we made up shouldn't appear on a public page. Labeling them as our own estimate also tells the visitor not to trust them.
- **Now:**
  - **Hybrid Search retrieval: 39–62%.** From Li et al., EMNLP 2024, Table 1. A retrieval-first approach (Self-Route) used 38.4–61.4% of the long-context token count with comparable answer quality across GPT-4o, GPT-3.5-Turbo, and Gemini-1.5-Pro. Pure retrieval used even fewer tokens (17% at top-5 in their ablation) but lost some accuracy, so the more conservative figure is used.
  - **Agent Catalog tool search: 49%.** From RAG-MCP (arXiv 2505.03275), Table 1. Average prompt tokens fell from 2,133.84 to 1,084.00 per query, a 49.2% drop. The abstract rounds this to "over 50%". We use the table value. Agent Catalog maps to this pattern because its docs describe semantic search over tools "with support for catalogs of hundreds of tools" ([Integrate an Agent with the Agent Catalog](https://docs.couchbase.com/ai/build/integrate-agent-with-catalog.html)).
  - Both are labeled as third-party research, not Couchbase benchmarks. A new "Adjust reduction rates" panel lets the visitor or an SE replace any default with a measured rate.

### 4. The math could show more than 100% savings

- **Was:** Lever savings were added together. With every slider at 100%, the total reached 242% of spend. Even the defaults reached 63% of the bill at the high end, with no allowance for overlap.
- **Now:** Levers are combined, not added: `total = spend × [1 − Π(1 − share × rate)]`. Each lever only acts on the spend the others leave behind, so the total can't exceed the bill. Each lever still shows its estimate on its own. The breakdown adds a "Less overlap between levers" row so the arithmetic is visible. Defaults with all four levers on: $72,014–$108,276 a year on $20K/month, or 30–45% of spend. With every slider at maximum it tops out at 84–94%.

### 5. Internal content was visible on the public page

- The methodology section said "Doug's original framing showed…".
- The caching tooltip told reps what to say: "If you want a Couchbase tie-in when discussing this with a prospect…"
- The Agent Catalog tooltip said "don't present this range as a documented Couchbase claim."
- Code comments named reviewers. A commented-out block of old copy was still in the HTML source.
- **Now:** All of it is removed. The source is clean for a public page.

### 6. AI on Device removed

- **Was:** A fifth lever, shown separately and kept out of the total. Its copy explained that it isn't a cost saving, isn't part of the AI Data Plane, and points to Couchbase Mobile as an "offline-first product line."
- **Why removed:** It doesn't promote the AI Data Plane, it uses "offline-first" (house style is to frame around uptime and user experience regardless of connectivity), and most of its copy argues against itself. The original repo still has it if a Couchbase Mobile version of this calculator is ever wanted.

### 7. Copy rewritten around the AI Data Plane

- Headline: "Stop paying for tokens and GPU hours your agents don't need."
- The subhead names the four sources of waste (repeat questions, resent history, whole documents, unused tool lists), says the token bill "doesn't have to grow in step with the work your agents do," and invites GPU-fleet teams to compare against serverless.
- The levers are named after AI Data Plane capabilities, and each links to its docs.
- The FAQ was rewritten. New questions cover whether Couchbase costs are included, where Model Service runs, and whether an email is needed.
- The CTA mirrors the TCO calculator's 30-minute architect session and adds links to the product page, the docs, and the TCO calculator.
- The original's hedging ("not a named Couchbase feature," "not a Couchbase claim") is gone, because the claims are now either Couchbase's own approved wording or clearly attributed research.

### 8. Added: serverless vs. dedicated GPUs

- **Why:** The four levers only save money on a per-token bill. A team running a fixed GPU fleet pays the same whether it sends fewer tokens or not, unless it shrinks the fleet. So the serverless models in Capella Model Service (billed per token through Amazon Bedrock, nothing to pay while idle) are what turn token savings into dollars for those teams. This is the same story as the AIDP Air storm demo's cost tab.
- **How it works:** Step 1 now asks "How do you pay for inference today?"
  - **Per token** keeps the original flow.
  - **Dedicated GPUs** asks for fleet size, how the instances are paid for (on-demand, 1-year or 3-year reserved, or a custom rate), hours a month, monthly requests, tokens per request, and a serverless model price. The results panel shows the fleet cost per year, the serverless cost for the same traffic, the gap, and the break-even volume where the two cost the same. The four levers then apply to the serverless bill.
- **When the fleet costs less:** The page doesn't stop at "no savings." The headline says "No serverless savings at this traffic" and gives the gap. A recommendation box then points to the lower-cost AI Data Plane option at that volume: provisioned GPUs in Capella Model Service (dedicated GPUs through NVIDIA NIM, billed by the node-hour, per the Capella deploy screen). It also notes that the levers still cut tokens per request, so the same fleet serves more traffic. The box only appears when the fleet stays cheaper even at the best lever case. The break-even card shows the crossover before the levers, plus a note with the crossover once they're on (7.8M–10M requests a month at the defaults).
- **Defaults, and why they aren't the storm demo's:** The first version borrowed the AIDP Air fleet (four g6e.12xlarge at on-demand, always on) and paired it with steady traffic, which produced 17×. That pairing overstated things for a generic visitor. The storm fleet is sized for a burst peak and priced on-demand, which is the best case for serverless. A team running an always-on fleet is more likely on reserved pricing and sized closer to its normal load. The defaults now are:
  - **Fleet:** two g6e.12xlarge (a minimal setup with a spare for failover) at the 1-year reserved rate, $6.61/hour, always on. On-demand ($10.49) and 3-year reserved ($4.53) are one click away.
  - **Traffic:** 1M requests a month at 2,000 in / 400 out tokens. These are placeholders, not benchmarks.
  - **Model:** Amazon Nova 2 Lite, which AIDP Air also uses. Presets for Nova Micro, Lite, and Pro are included, and any price can be overridden.
  - **Result:** the fleet costs 5.5× serverless, $94,687 a year saved before the levers, break-even at about 5.5M requests a month. The 10M preset shows the fleet winning, so the crossover is visible without typing anything.
- **What still isn't modeled:** GPU throughput. The page can't tell whether two instances can actually serve the traffic entered, because that depends on the model running on them. The break-even figure is the honest stand-in. It tells the visitor where the money crosses over and leaves capacity to them.
- **AIDP Air stays the right story for live demos.** Its 356× is real for its scenario: a bursty, peak-sized fleet handling short classification calls. It's just not a neutral default for a calculator.
- **Caching on serverless:** The Capella deploy screen for a serverless (Amazon Bedrock) model shows standard, semantic, and combined caching plus conversational caching as value adds. The page now says caching works with serverless models.

### 9. Smaller fixes

- The caching blurb said "7–18% of the addressable slice." It's 7–18% of *total* spend. Now matches the TCO calculator wording.
- "Monthly token budget" is now "Monthly LLM token spend," which matches what the field asks for.
- Accessibility: labels tied to inputs, aria-live on results, keyboard-openable tooltips, readable link color inside tooltips.
- On mobile, the FAQ and methodology moved below the results so visitors see their number sooner.
- All em dashes removed from page copy.

## Open items before launch

These need a person to confirm. None of them can be settled from the docs alone.

| # | Item | Owner to confirm |
|---|---|---|
| 1 | **Agent Memory "as of" date.** The page shows "October 2026" (one config value at the top of the script). The approval asks for an "As of [DATE]" footnote on decks. Confirm what date to show on the web. | Legal |
| 2 | **Short form of the Agent Memory range.** The lever badge and rates panel show "33–45%, LoCoMo benchmark" as a label, with the approved sentence verbatim in the tooltip and methodology. Confirm the short label is acceptable. | Legal |
| 3 | **Li et al. (39–62%) as a retrieval figure.** New third-party citation, not yet in the claims register. Note that the study used dense retrievers, not Couchbase Hybrid Search specifically. The copy attributes the figure to research on retrieval in general. | Claims register / Legal |
| 4 | **RAG-MCP (49%) applied to Agent Catalog.** RAG-MCP was cleared for external citation earlier. Mapping its number to Agent Catalog is a new use and needs a claims register row. | Claims register |
| 5 | ~~**Model Service caching scope.**~~ **Resolved.** The Capella deploy screen shows caching available for serverless (Amazon Bedrock) models. One note: value adds are labeled "Free Preview until Nov 18, 2026, after which usage-based fees will apply." The estimator already says it doesn't net out the cost of caching. | Done |
| 6 | **Agent Catalog semantic search dependency.** Docs say it needs the Search Service on the cluster. Confirm that's available wherever Agent Catalog is offered in the October release. | Product |
| 7 | ~~**"Token spend stops tracking agent activity."**~~ **Rephrased.** This line was borrowed from the product page, and it can be read as "we stop tracking agent activity," which cuts against the Agent Catalog and Agent Tracer message. The estimator now says the token bill "doesn't have to grow in step with the work your agents do." **The same sentence is still live on the product page** in the "Costs That Fall as You Scale" accordion: "Persistent memory replaces resending conversation history every turn, so token spend stops tracking agent activity." Suggested fix: "...so your token bill doesn't have to grow with every turn your agents take." | PMM (product page) |
| 8 | **Full-history baseline for Agent Memory.** Teams that resend full conversation history today start from a higher token count than teams using another memory layer, so their savings would likely be larger. We have no approved number for that case, so the estimator uses the approved range for everyone. If a sourced figure becomes available, add a "how do your agents handle context today?" choice. | PMM / Legal |
| 9 | **CTA target.** It points to /contact/ as a placeholder. The web team should wire the same architect-session form the TCO calculator uses. | Web team |
| 10 | **Serverless price source.** Presets use Amazon Bedrock on-demand list prices (Nova Micro $0.035/$0.14, Nova Lite $0.06/$0.24, Nova 2 Lite $0.33/$2.75, Nova Pro $0.80/$3.20 per 1M tokens), checked through third-party price trackers because the AWS pricing tables load dynamically. Confirm against aws.amazon.com/bedrock/pricing, and decide whether the web version should show Bedrock dollars or Capella Credit rates. | Product / web team |
| 11 | **Capella deploy screen rates for nova-lite.** The deploy screen shows 0.03 input / 0.14 output credits per 1M tokens for `amazon.nova-lite-v1:0`. That matches Bedrock's *Nova Micro* list price, not Nova Lite's ($0.06/$0.24). It could be a UI issue, or credits may not map 1:1 to dollars. Worth a quick check with the Model Service team. | Product |
| 12 | ~~**GPU default rate region.**~~ **Resolved.** The g6e.12xlarge on-demand rate is $10.4926 in both us-east-1 and us-east-2, so the AIDP Air footnote and the page agree. The reserved rates ($6.6104 for 1-year and $4.5328 for 3-year, no upfront, EC2 Instance Savings Plan or Reserved) came from a third-party price tracker and should be checked against AWS before launch. | Web team |
| 13 | **Fleet capacity isn't modeled.** The comparison assumes the fleet can serve the traffic entered. At high volumes like the 10M preset, two instances may not keep up, depending on the model, so a "fleet is cheaper" result there can flatter the fleet. The break-even card is the honest stand-in. Fine for a directional tool, and it's stated in the methodology. | Note only |
| 14 | **Public source for the 33-45% token claim.** The claim is Legal-approved, but it isn't in the July 2026 Agent Memory blog post or anywhere else public that we've found. The web page currently makes the claim with no link behind it. Ask whether there's a published source to cite. If there isn't one, confirm Legal is fine with the claim standing alone on the web. | Legal / Agent Memory team |
| 15 | **Provisioned GPU recommendation.** When the fleet wins, the page recommends Capella Model Service provisioned GPUs. It doesn't claim Capella's node-hour price beats the visitor's own fleet, because we don't model Capella provisioned pricing. Two things to confirm: (a) whether the web version should add Capella provisioned rates so that path can be priced, and (b) that Model Service caching is available on provisioned deployments as well as serverless, since the box says the levers still apply. | Product |
