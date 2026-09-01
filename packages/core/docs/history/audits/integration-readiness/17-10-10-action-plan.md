# 10/10 Action Plan

Goal: move the system from a strong-but-mixed `6.2/10` to a truthful `10/10` on the Modern MVP path.

This plan assumes the target is not "good enough to demo". The target is:

- first-party bundled verticals feel fully authored and deeply differentiated
- runtime DB tenants have a safe, explicit, powerful core contract
- advanced styling is intentional, not accidental
- Modern primitives/patterns/surfaces/hooks all read the same truthful system
- app hosts stop bypassing the DS in visible areas

## Definition of 10/10

We should only call the system `10/10` when all of these are true:

1. Every declared contract in the touched scope has a real runtime consumer.
2. Every high-value Modern primitive is governed by one canonical token/bridge path.
3. Bundled first-party tenants are file-first from the earliest app boundary.
4. Runtime DB tenants have a bounded v1 contract and validated upgrade path to advanced styling.
5. Rotate visibly looks like the DS owns it, not like the app is painting over the DS.
6. Cross-app usage (`app-platform`, `app-evnto`, `app-bithire`) follows one understandable tenant/vertical model.
7. Docs, previews, static generation, tests, and guardrails tell the same story as runtime.

## Program Structure

### Phase 0 - Architecture Freeze

Purpose:

Lock the product rules so implementation stops drifting.

Decisions to freeze:

- bundled first-party verticals are `file-first`
- runtime DB tenants are `core-first` in v1
- `appearance.general` is the primary DB customization contract
- `appearance.advanced` is optional and bounded
- `brandTheme` remains the richest premium source for first-party bundled verticals
- `brandThemeId` removed from TenantConfig (A0 — no runtime consumer existed)

Exit criteria:

- one written model in contracts + docs
- app-platform whitelabel plan aligned to it

### Phase 1 - Boundary Correction

Purpose:

Fix the highest-leverage seam: bundled-vs-DB tenant resolution.

Must-do:

- short-circuit bundled tenants before DB fetch in `app-platform`
- stop letting `app-platform` be a silent special case
- decide whether `app-platform` joins the DS storage path or remains a deliberate adapter host

Exit criteria:

- bundled tenants never pay DB styling cost by default
- DB tenant path is intentionally separate and documented

### Phase 2 - DB Tenant Contract v1

Purpose:

Create a clean runtime-tenant contract that is safe, real, and sufficient.

Required v1 fields:

- company identity
- logos / favicon
- core palette
- base typography
- button style
- density
- elevation
- sidebar tone
- locale
- optional vertical

Optional later:

- advanced chrome
- rich controls
- full premium `brandTheme`

Exit criteria:

- app-platform authoring/UI writes this contract
- adapter code reads it
- DS runtime consumes it

### Phase 3 - Modern Primitive Truth Pass

Purpose:

Close the big gap between declared customization and rendered output.

Priority order:

1. display/content
2. inputs/forms
3. navigation/overlay/accessibility

Exit criteria:

- no more major primitive where contract, theme bridge, and renderer tell different stories

### Phase 4 - Rotate Host Assimilation

Purpose:

Move visible Rotate identity under DS ownership.

Targets:

- shell chrome
- sidebar geometry/states
- header chrome
- command/search surface
- whitelabel workflow

Exit criteria:

- a user looking at Rotate is mostly looking at DS-owned styling

### Phase 5 - System Integration Truth Pass

Purpose:

Activate or narrow exported system stories.

Targets:

- command/search
- data/routing/state
- notifications
- DnD
- AI

Exit criteria:

- each family is either truly fused or clearly app-facing

### Phase 6 - Static / Preview / Docs / Guardrails / Non-Functional Closure

Purpose:

Make the system honest and durable.

Targets:

- static generator parity
- tenant preview parity
- docs truth pass
- provider-level tests
- stronger guardrails
- performance cleanup
- accessibility hardening
- DB payload validation

Exit criteria:

- runtime, preview, docs, and tests agree
- core regressions are hard to reintroduce

## Recommended Wave Order

1. `A0` Tenant model freeze
2. `A1` True file-first bundled tenants
3. `A2` DB tenant contract v1
4. `A3` Static/preview/runtime parity
5. `A4` Modern display truth pass
6. `A5` Modern inputs closure
7. `A6` Navigation/overlay/accessibility
8. `A7` Rotate host assimilation
9. `A8` Hook/system story decision
10. `A9` Docs/tests/guardrails/non-functional closure

## Acceptance Gates Per Wave

Every wave should satisfy all of these:

1. no new contract surface without real runtime effect
2. no "temporary" divergence between renderer and token path left undocumented
3. tests prove behavior, not just string presence
4. STOP includes changed files, exact gains, removed bypasses, and remaining deferrals

## What Not To Do

- do not widen contracts ahead of implementation
- do not solve app-platform by adding more app-owned shell CSS
- do not keep both legacy and new tenant models alive without an explicit ownership rule
- do not mark features "live" because CSS vars compile if nobody reads them
- do not ship more mocked boot tests while critical provider paths remain under-tested

## Practical Success Sequence

If speed matters, the minimum sequence to materially move the score is:

1. `A0 + A1 + A2`
2. `A4 + A5`
3. `A6 + A7`
4. `A3 + A8 + A9`

That order fixes the architecture first, then the biggest visible Modern gaps, then the host seam, then the long-tail truth/guardrail work.
