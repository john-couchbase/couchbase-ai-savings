# Guided Couchbase Estimator Implementation Plan

Goal: Implement the approved baseline → workload → estimate flow, retain Couchbase branding, repair audited math and validation failures.
Architecture: Retain static HTML/CSS/JavaScript and existing calculation functions; add explicit wizard navigation and accessible disclosure elements. No build or runtime dependencies.
Spec: User-approved design in this chat, November 4, 2026.

- [x] Add failing regression cases for reserved billing, zero prices, finite bounds, zero/tie result copy.
- [x] Fix reserved billing (730 committed hours/month), bounded numeric handling, missing-vs-zero validation, and model-assumption wording.
- [x] Implement three guided steps, flat workload rows, source disclosures, one result comparison, accessible navigation and inline errors.
- [x] Verify regression suite, independent seeded generated scenarios, browser navigation/editing/keyboard controls, mobile reflow and desktop layout.
- [x] Independent final review and update handoff documentation. Leave changes local; no push or publish.

Review focus: empty/negative/extreme values; disabled reserved runtime field; zero/tie/loss outcomes; navigation preserving edits; source disclosures and rate-entry focus.
Ruling: Continue in the user's existing local clone on a new branch so the localhost preview and prior uncommitted fixes remain intact. No commits/push without need.

## Verification ledger

- 17 automated tests passed, including one million seeded generated scenarios
  compared with an independent remaining-cost oracle, savings bounds and breakdown identity.
- Browser checks passed: negative input blocks and focuses error, zero savings,
  zero GPU traffic, equal-cost crossover, loss case, mode switching and preserved edits.
- Keyboard Enter opens source disclosure and links remain reachable.
- Decimal rate12.5 persists through cache-shape rebuild; custom flag updates while input stays focused.
- Reflow at320 CSS px: no horizontal page overflow on baseline, workload/source, result and advanced-rate screens.
- DOM check: no duplicate IDs, no nested link/button or checkbox-label pseudo-buttons, one visible step.
- Desktop preview visually checked; temporary mobile viewport reset afterward.
- Independent review found three issues (FAQ link contrast, decimal rebuild precision, live custom marker); all verified and repaired. Final reviewer reported no new material regressions.
- Limits: not a complete assistive-technology/cross-browser audit. Generated cases validate formula consistency, not customer outcomes, source claim applicability or current vendor pricing.
