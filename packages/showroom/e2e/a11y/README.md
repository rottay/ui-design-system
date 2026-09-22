# Route-level accessibility — what lives here and what it is a ledger OF

Owner: WO-INV-03 while it is open; thereafter the DS a11y CI job
(`.github/workflows/ci.yml`, the a11y specs step).
Established at `db759703a`, 2026-09-22.

## The single-owner split

| Level | Subject | Owner | Where |
| --- | --- | --- | --- |
| family | component markup + compiled tenant arm + 4 scopes | WO-EVI-02 | `packages/core/tests/support/family-causality` + the per-family `AXE_DEBT` maps (78 suites) |
| route | assembled page + real bundle + real SSR artifact + real tenant document | WO-INV-03 | this folder |

WO-INV-03 adds **no** family pin. A route-level finding whose node is already
pinned in a family `AXE_DEBT` map is recorded here as `routed` with a pointer
to that pin and never re-litigated (L4).

## The matrix, and why it is not `/probe/engine-modern`

`/probe/engine-modern` cannot serve the WO's matrix: its tenant union is
`rottay | bithire | evnto`, so there is no **second** BitHire tenant and
"Modern × bithire (two tenants)" is unsatisfiable there.

`/probe/ds-reference` is exactly it — two BitHire-vertical grounds:

- `bithire` — a static FlatTheme, stamped as root attributes;
- `the-management` — a published DB document, hydrated, compiled and
  SSR-embedded as an artifact, with the provider deferred past hydration.

25 identical scene routes per ground, which between them render all 24
`primitives/inputs` families. 2 × 25 = **50 page loads**, one worker, serial.

The matrix is written once, as literals, in `baseline/index.ts`. A roster
derived by scanning the route directory would shrink silently when a route is
deleted; `axe-baseline.spec.ts` checks the literals against the disk instead.

## Files

| File | What it is |
| --- | --- |
| `baseline/index.ts` | the matrix, the ledger's schema and its five laws. No Playwright import, so it is executable on its own. |
| `axe.spec.ts` | the 50-load batch. **Gated off** — see below. |
| `axe-baseline.spec.ts` | the browserless half: the laws, and the drills that prove each bites. Runs on every CI pass. |
| `axe-baseline.json` | the ledger. |
| `focus.spec.ts` | the focus-visible sweep (WO-GAT-04), untouched. |
| `contrast-channel-arms.spec.ts` | WO-INV-03 Lot B's increased-contrast arms, also gated (`DS_CONTRAST_ARMS=1`). |

## The batch is gated, and that is a deliberate coverage gap

```
DS_AXE_ROUTE_BATCH=1 pnpm --filter @rottay/showroom exec playwright test e2e/a11y/axe.spec.ts
```

**No measurement has been taken against this matrix.** Landing a 50-load batch
live in CI over findings nobody has looked at would red the a11y job on unknown
debt, so it is gated until the DT's booked serial slot runs it. The gap is
real and is stated here rather than absorbed: until that slot runs, CI's a11y
job exercises `focus.spec.ts` and the laws in `axe-baseline.spec.ts`, and no
route-level axe assertion. Flipping it on is deleting one `test.skip`.

Budget after the first Next compile: roughly 3–5 minutes.

## The five laws

- **L1 — the higher blocking impact is structurally inadmissible.** It fails
  the run and can never be written into `entries`. The acceptance command
  `grep -c <impact> axe-baseline.json` then reads 0 because the word cannot
  occur, not because somebody removed it. Q10 ruled **both**: the prose says
  "blocking impact" so the grep keeps holding, *and* `ledgerProblems()`
  asserts it over parsed JSON — drilled by planting one, or the assertion is a
  comment.
- **L2 — every entry carries a disposition, an owner and a WO.** `routed`
  requires a named WO row; `adjudicated` requires a written reason and an
  owner signature; `repair-here` is valid only while the WO is open. A
  `routed` entry may name a **closed root that promised the reach** instead of
  an open owner, when a residual table is the authority — which is how the
  WO-DER-06 residual table models N2 (menu ink) and R3 (mode seeding).
- **L3 — decrease-only**, keyed `rule|scene|ground|target`, so the same rule on
  two scenes is two separate adjudications.
- **L4 — no double adjudication** (see the split above).
- **L5 — a missing ledger FAILS.** Three clauses, all implemented:
  1. there is **no self-generation path**. The old spec wrote its own baseline
     when absent and then passed, recording every finding as accepted — a
     fail-open in the one authority the acceptance gate greps. An absent
     ledger now throws and names how to seed it.
  2. `AXE_UPDATE_BASELINE=1` is the **only** write path to the ledger, and it
     is intersection-only: repaired entries drop out, a novel finding can never
     be admitted by a flag. Seeding is therefore a **hand** edit — L2's
     disposition, owner and WO are not things a machine can infer.
  3. `AXE_NO_WRITE=1` suppresses **both** writes — the ledger *and* the
     unconditional CI report artifact — so the batch is reviewable read-only
     whatever else is set.

## `deferred` and `retired` — kept as evidence, not deleted

**`deferred` (3 rows).** The three `color-contrast` entries on `tenant=rottay`
tabs. D-24's matrix is two BitHire tenants, so their subject left the matrix
entirely. Q4(b): moved to `deferred` with D-24 named, **not** deleted — the pin
is evidence.

**`retired` (2 rows).** The two entries recorded at the blocking impact L1 now
refuses (`label|.ds-input-ph-…`, `select-name|.ds-sel-…`). Both are **stale by
key**: WO-INV-04 removed those class prefixes and they survive only as negative
assertions at
`packages/core/src/components/primitives/tests/EmbeddedCssRecovery.contract.test.ts:801,805`.
Whether the underlying defect reproduces under the new selectors is
**unmeasured**, and it decides the disposition:

- reproduces with a DS control that cannot be labelled without `FormField` →
  a real fix, routed to the inputs family owner;
- reproduces only because the *specimen* renders a bare `Input placeholder=`
  → a showroom specimen repair, and the DS is clean;
- does not reproduce → deleted with provenance, in the FAM-10 stale-pin drain
  class.

That re-measurement is a **DT serial browser slot**, not this lot's. The rows
carry no impact field, so the acceptance grep holds; the fact is recorded in
full here. **This batch does not inherit them.**
