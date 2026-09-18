# Owner decision package — 2026-09-18 (Kimi DT)

Consolidated after reconciling the stale D1–D21 package: completed actions are marked done
(D1's backlog executed; D17's arithmetic corrected to 18), measured-stale entries dropped.
Each open item names the exact edit that follows a decision. Nothing here blocks the running
lanes unless it says so.

## A. Blocking the cascade ratchet's green (CI honesty)

**A1. Re-anchor the cascade-ratchet baseline.** The 2026-09-14 pin (2079/2114/5210) was never a
measurement — the write commit's own gate measures 2427 on its own tree (a hand enumeration was
substituted for the census; `evidence/r17-07-cascade-attribution/index.md`). The tree today
measures **5443 / 2342 / 2344** (honest, post-repair). Options:
- (a) Re-anchor to the measured values with the provenance note (recommended — it is a correction
  of a false record, not a widening; the decrease-only law binds measurements, and this never was
  one).
- (b) Pin the NAMED SET (the instrument learns to compare sets, not scalars — the attribution
  report's proposal; larger instrument lot, better long-term).
- (c) Leave it red and let it keep crying — not recommended: red-as-normal hides new violations.

**A2. The 330 frozen-only debt names.** They live only in Classic/Rustic skins; the freeze law
forbids repairing them, so no lot can ever drive the ratchet to zero while they count. Decide:
a declared frozen-only population excluded from the live ceiling (recommended), or an explicit
written exception standing.

## B. Blocking the chart lane's value half (WO-FAM-09)

**B1. (Q1) De-alias `default` from `accessible`.** Today `default` paints the accessible table.
De-aliasing repaints every default-scheme chart in the estate (the largest visual change
available). Recommendation: (a) de-alias, scheduled after the current wave so its diff is the
only change in its commit. Until then, five families' 20 scope rows stay honestly red.

**B2. (Q2) The `colors` prop.** Pie honours it, scatter declares-and-discards it. Recommendation:
retire it for all categorical families (the governed chain is the point); public-API break.

**B3. The 10-slot cap vs 12-colour overrides.** The resolver caps at 10 slots; five families
honour a 12-colour `colors` override today (pinned). Cap-or-keep changes public behaviour.

## C. Public-API retirements (one authorization covers all three, or pick per row)

- `useSortableList` (F-69 lot 9): zero consumers in repo and the three apps; replaced by the
  landed sortable kernel.
- `useChartTheme`: zero consumers anywhere (measured); 13 hardcoded hexes inside.
- `ChartFamilyFrame`: public, unused.
Each is a `major` changeset with the removal measured. Recommendation: authorize all three
(they are the retirement lot each wave already expects).

## D. App-side (cross-repo — nothing is written to apps without this)

**D21.** `ds-table-density-*` classes are LIVE in app-bithire (runtime reads) and app-evnto (CSS).
Authorize the consumer-migration lot (app-bithire first) before the DS retires the class.
Until then the class stays emitted and pinned.

## E. Answered by measurement this week (recorded, no decision needed)

- D15's DnD ownership: resolved by the handoff — FAM-08 owned the base kernel; landed.
- Q-B-DER07: milestone B no longer gates on the branding pick (machinery + test, `c4d5405b0`).
- The DnD kernel's shape: adopted after 4 Codex rounds + 5 revisions + my compile/probe
  verification (`evidence/dnd-kernel-debrief/`).
- The chart paint contract: adopted (`evidence/chart-paint-debrief/` + the root-or-read addendum).

## F. Quota (the current blocker)

`claude-admin` weekly limit hit 2026-09-17 ~23:59; resets **Sep 20, 1pm (America/New_York)**.
FAM-10 cohorts D/E drafts are preserved uncommitted in the tree (E nearly complete; D covers 3 of
7 headers; the one red is a probe value outside the rottay envelope — a one-line calibration).
No new writer lots until the reset or an authorized account change.
