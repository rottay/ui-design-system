# Codex Reconciliation of the Kimi Independent Audit — 2026-07-23

Status: authoritative reconciliation for the next implementation tranche
Scope: Rottay Design Platform 10/10, Modern-first primitive program
Implementation authority: Kimi may implement; Codex alone certifies
Commit policy: no commit, push, PR or publish

This document reconciles:

- `KIMI-INDEPENDENT-DS-AUDIT-2026-07-23.md`;
- `KIMI-PROPOSED-EXECUTION-PLAN-2026-07-23.md`;
- the current dirty worktree;
- executable repository gates;
- the accepted OLA 1–5 architecture.

Where this document conflicts with either Kimi document, this document wins.
The original audit remains a useful independent opinion, not an execution
authority.

## 1. Executive verdict

Kimi's central diagnosis is correct:

- the platform architecture is worth preserving;
- the authority work in OLA 1–5 was necessary and is not a restart;
- Modern's uncertified primitive fleet is the largest visible quality gap;
- typography, recipe consumption, paint ownership and pattern/surface
  composition still prevent quality from emerging automatically;
- certification throughput must move from narrative, sequential waves to
  standardized family evidence and parallel non-overlapping implementation
  lanes;
- supplier decisions belong after a measured same-facade bake-off, never as
  a visual authority.

The proposed four primitive macro-waves are directionally sound. The immediate
approved tranche is a long autonomous **K0 + K1 macro-wave**, not another short
infrastructure-only wave.

## 2. Dominant priority: Modern must become extraordinary

Modern is the primary product engine and the visual quality authority under
active development. Classic remains the Ant compatibility path. Rustic remains
the minimal fallback and contrast engine. Their contracts must remain
compatible, but visual certification effort is Modern-first.

For every family touched, passing tests is necessary but insufficient. The
Modern implementation must be visually authored and sighted until it is:

- deliberate at rest, not merely correct;
- coherent across default, hover, focus-visible, pressed, selected, loading,
  disabled, error, empty and destructive states as applicable;
- clearly segmented through controlled borders, spacing, surface roles,
  headers, separators, icon containers and type hierarchy;
- refined rather than heavy: no arbitrary outlines, generic colored left
  rails, excessive glow, gratuitous gradients or decoration without meaning;
- responsive by container and usable on desktop, narrow layouts, mobile,
  coarse pointer and keyboard;
- motion-rich but calm, bounded, compositor-safe and reduced-motion complete;
- white-label by construction: the same markup must acquire materially
  different typography, geometry, density, depth, control and motion character
  from static `BrandTheme` and DB `Appearance`;
- locale-safe for EN/ES/AR, including RTL, long content and Arabic fallback;
- free of clipping, overlap, unreadable copy, accidental dead space, mixed
  radius grammar, misaligned controls and competing paint owners.

The goal is not to imitate a preview or another framework. The goal is a
premium Rottay-native default whose product applications look good before they
add product-specific composition.

## 3. Findings accepted as correct

### 3.1 Architecture and governance

- Keep the single canonical `--ds-*` authority and the static/DB compiler
  chain.
- Keep `visualAuthority="compiled-artifact"` and the SSR identity guard.
- Keep density as structural scale + semantic mode + local scope.
- Keep the 16 bounded motion recipes and reduced-motion policy.
- Keep `SemanticSurface` and its eight surface roles.
- Keep supplier imports confined behind Rottay contracts.
- Keep decrease-only gates and the current 14 certified primitives.

### 3.2 Current gaps

- The missing F2 same-tree density proof is real and blocks full closure of
  OLA 5.
- `daisy.classConsumers` is currently 12 while the ceiling remains 15; the
  baseline should tighten to 12 only with a green same-change gate.
- The first-party `platform`, `bithire` and `evnto` themes do not currently
  select a production recipe profile.
- Semantic typography roles exist but are not yet the fleet default. Implicit
  Modern `Text = md` remains frozen until a deterministic migration fixture
  proves the change.
- Select and DatePicker really are 1,138 and 1,267 lines in their Modern
  implementations; the shared overlay runtime is 2,101 lines. A supplier
  bake-off before the complex-control wave is justified.
- The 4,074 pattern/surface ownership findings are real ratcheted debt.
- The governed icon corpus exposed by the current `IconName` contract contains
  282 names. Current documentation that describes a live 50-name facade is
  stale.
- The current state matrix contains 216 cells; 132 describes only the older
  Button subset.
- `modern/theme.css` is currently 617 lines.
- Modern default craft is substantially weaker outside the certified island.
  Inline literals, raw utilities, Daisy residues and multiple paint owners
  are causal defects, not cosmetic trivia.

## 4. Corrections to the Kimi audit

### 4.1 `MaterialSurface` is not dead implementation code

There are no tracked `MaterialSurface` contracts, tests, exports or
implementation. The prior work renamed the concept to `SemanticSurface`.
An empty untracked directory may exist locally, but Git does not version empty
directories and there is no code-deletion ticket here.

Decision: do not create a `MaterialSurface` cleanup or migration. Preserve
`SemanticSurface` as the canonical name.

### 4.2 The “1,026 hardcoded literals” count is real

The live `engine-token-audit --check` reports:

```text
1166 files scanned
1227 unique --ds-* tokens consumed
1026 hardcoded literals outstanding
3232 counters
```

`1,026` is an aggregate reported by the gate, not a top-level JSON key. It must
remain visible. The old `3,227` counter count is stale; `3,232` is current.

Decision: retain the 1,026 debt statement and drain it by owner. Do not remove
it as “phantom”.

### 4.3 Canonical surface targets are planned owners, not proof that surfaces
are absent

`OverviewSurface`, `RecordSurface`, `DecisionSurface`, `WidgetWorkspace` and
`AIWorkspace` are queued certification targets. The repository already ships
analogous capabilities including `DashboardSurface`, `DetailSurface`,
`CompareSurface`, `CollectionWorkspaceSurface`, `RecordWorkbenchSurface` and
`ChatSurface`.

Decision: before implementing a canonical target, map the existing analogue
and choose one of:

1. certify it under the canonical target;
2. evolve/rename it with compatibility;
3. compose it behind a thin canonical owner;
4. create a new owner only when the existing capability cannot satisfy the
   target.

Do not duplicate a full surface merely to satisfy a planned name.

### 4.4 `densityScopeAttributes` should remain internal

The public root already exports `DensityScope` and `useDensity`.
`densityScopeAttributes` is an implementation helper used by DS owners to
stamp internal boundaries.

Decision: do not root-export it without a demonstrated external composition
case. Applications should consume the public React boundary, not manually
author DS metadata.

### 4.5 Density propagation and density craft are different questions

Density metadata already reaches DataTable, MarkdownView, decision comparison,
record facts and several surfaces. The weaker statement that only Input and
Button have coordinated end-to-end geometry is useful; the literal claim that
only those two consume density is too broad.

Decision: certify geometry consumption family by family while preserving the
existing propagation contract.

### 4.6 Existing surfaces and accepted layout families are not reopened

The framework bridge and current surface naming deserve future ownership work,
but neither observation invalidates the accepted 14 or authorizes a wholesale
surface rewrite.

Decision: re-anchor evidence when bridge-owned paint moves. Do not reset
accepted statuses.

### 4.7 Kimi's visual scores were not sighted

Kimi explicitly did not run the showroom or browser. Its visual scorecard is a
useful code-based risk assessment, not visual certification.

Decision: Kimi must sight and iterate its own implementation; Codex will repeat
the independent browser audit before certification.

### 4.8 The taxonomy regeneration is plausible but not attributable

`packages/core/docs/TAXONOMY.generated.md` currently reflects the expanded
dirty-worktree source inventory (96 counted component directories and new
pattern owners) and its date changed to 2026-07-23. Kimi could not prove which
process regenerated it.

Decision: do not revert it blindly and do not use its directory count as the
certification denominator. K0 must run the sanctioned taxonomy generator once
after source owners are stable, compare the output, and retain it only if it is
deterministic and source-accurate. The 93-family certification denominator is a
governed public-family selection, not the taxonomy generator's raw directory
count.

## 5. Certification denominator decision

`SemanticSurface` is a public root-exported generic primitive with its own
contract and tests. It belongs in the primitive certification ledger.

Decision:

- public primitive denominator: **93**;
- overall artifact denominator: **120**;
- current accepted primitives: **14/93 = 15.1%**;
- current accepted overall: **14/120 = 11.7%**;
- `SemanticSurface` begins as `audit`, not accepted;
- historical wave evidence may retain the denominator that existed when the
  evidence was written, but current status uses 93/120.

No quality progress is claimed by correcting the denominator.

## 6. Approved execution model

### 6.1 One long autonomous tranche

The next Kimi engagement must continue through:

1. K0 closure and evidence infrastructure;
2. K1 Lane A;
3. K1 Lane B;
4. K1 Lane C;
5. aggregate serial validation;
6. a complete handoff.

Kimi must not stop merely because K0 is green or because one lane is finished.
It may stop only for a genuine architecture/permission blocker, an accepted-14
regression it cannot isolate, or exhausted execution context after leaving a
machine-readable checkpoint and an exact continuation command.

### 6.2 Parallel work without uncontrolled integration

- Up to four non-overlapping implementation/evidence lanes may work in
  parallel.
- One coordinator owns shared contracts, barrels, generated artifacts,
  baselines and final integration.
- Builds, broad tests, generated-artifact commands and browser servers run
  serially, one at a time.
- No two lanes edit the same family, skin, barrel or generated artifact.
- Every lane begins by falsifying its assumptions against the current code.

### 6.3 Risk-based evidence, not an accidental Cartesian explosion

Every family receives contract, state, accessibility and visual evidence.
The entire tenant × locale × direction × density × container × motion cross
product is not duplicated 21 times.

Use:

- full cross-product evidence for K0 density authority;
- one flagship family per lane under the full torture matrix;
- pairwise coverage for remaining families;
- family-specific critical cells for keyboard, error, loading, overlay or
  content stress;
- the same markup under BitHire static and The Management DB in every lane.

This preserves the bar while making a 21-family macro-wave auditable.

## 7. Immediate macro-wave

### K0 — closure and shared proof

- close F2 same-tree density proof;
- tighten Daisy 15 → 12 if the live gate remains at 12;
- correct documentation drift, including the corrections in this document;
- add `SemanticSurface` to the current certification denominator;
- wire first-party recipe profiles only after same-tree sighted evidence proves
  that the mapping improves each vertical; no blind profile assignment;
- leave implicit `Text = md`;
- add no external supplier.

### K1 Lane A — identity and compact chrome

- Avatar;
- Badge;
- Tag;
- Link;
- Kbd.

### K1 Lane B — text and boolean controls

- Input;
- Textarea;
- PasswordInput;
- FormField;
- Checkbox;
- Radio;
- Switch;
- Toggle.

### K1 Lane C — feedback and readiness

- Alert;
- Callout;
- Message;
- Progress;
- Skeleton;
- Spinner;
- Empty;
- Result.

Target: 21 implemented families ready for Codex review. Kimi cannot mark them
accepted or update certification percentages. Expected certification after
independent audit is 18 conservative / 21 best case:

- conservative: 32/93 primitives = 34.4%; 32/120 overall = 26.7%;
- best case: 35/93 primitives = 37.6%; 35/120 overall = 29.2%.

## 8. Deferred decisions

- No React Aria or Base UI installation in K0/K1. The isolated same-facade
  bake-off belongs immediately before K2.
- No TanStack Table or React Grid Layout adoption in K0/K1.
- No Modal consolidation in K0/K1.
- No implicit typography default migration without its fixture.
- No Candidates route redesign in K0/K1. Candidates may be used only as a
  read-only canary after DS evidence is green.
- No canonical-surface duplication before analogue mapping.
- No new visual authority, token system or app-side shared-chrome repair.

## 9. Acceptance ownership

Kimi implements, tests, visually iterates and reports. Kimi may recommend
scores but cannot:

- certify a primitive;
- change an accepted status;
- widen a baseline;
- claim a percentage increase;
- commit, push, publish or create a PR.

Codex independently inspects the diff, runs the serial verification, sights
Modern in the browser and accepts or rejects each family.
