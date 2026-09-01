# Cloud Implementation Blueprint

## Purpose

This blueprint translates the audit into an execution plan that a coding agent can actually follow.

It is intentionally specific about:

- what to build
- in what order
- what should live in the DS vs app layers
- how to preserve vertical differentiation
- how to avoid regressing architecture while improving product quality

## Success Criteria

Cloud should consider this program successful when all of the following are true:

1. shared surface systems exist for the highest-value repeated flows
2. Platform, BitHire, and Evnto are visibly different in shell, lists, cards, forms, and motion
3. mobile behavior is adaptive by surface type, not just compressed
4. first-party tenants resolve from static/bundled sources cleanly
5. remote tenants layer on top without breaking vertical identity

## Program Structure

Run the work in six phases.

## Phase 0: Baseline And Guardrails

### Goals

- preserve the architecture that was just cleaned up
- prevent new duplication while deeper UI work lands

### Tasks

1. Extend `lint:vertical` or related audit scripts to guard:
   - forbidden `components/` growth outside documented exceptions
   - direct shell geometry drift outside `vertical/`
   - new local one-off header/workspace/form systems when DS-owned variants exist
2. Freeze ownership rules in the three `CLAUDE.md` files and architecture docs.
3. Add documentation pointers from app docs to this audit package.

### Output

- stronger guardrails
- one truthful architecture story

## Phase 1: Design-System Foundation Upgrades

This is the highest-leverage phase.

### 1. Collection Workspace Spine

Build or harden a DS-owned workspace family that includes:

- title and page context
- search
- scopes
- saved views
- filters
- bulk actions
- table/list/card view modes
- selection rail
- preview/supporting pane hooks
- phone transform rules

Primary targets:

- existing workspace/search/filter/table primitives in the DS
- Platform `entity-table-workspace`
- BitHire tables and recruiter list wrappers
- Evnto list + filter + expanded-row systems

### 2. Header / Cockpit Family

Build a DS-owned family for:

- command headers
- page headers
- cockpit headers
- compact mobile headers

Must support:

- title/subtitle
- scope chips
- utility actions
- search slot
- status summary slot
- compact collapse behavior

### 3. Draft-Safe Form System

Build or consolidate a DS-owned form surface family with:

- grouped sections
- field descriptions
- validation and review states
- unsaved-change behavior
- sticky action footer for compact screens
- optional stepper/wizard mode

### 4. Adaptive Surface Contracts

Introduce explicit adaptive contracts for major surface types:

- collection workspace
- object/detail page
- form surface
- dashboard/cockpit
- filter sheet
- action dock

### 5. Activity / Decision Spine

Add shared primitives/patterns for:

- timeline/activity
- approvals/decision inbox
- audit history
- follow-up action lists

## Phase 2: Platform Productization

Platform should become the reference control plane.

### Build Priorities

1. object-page family for tenant, identity, compliance, notification, and payment detail screens
2. analytical workbench family for dashboard/investigative screens
3. overview dashboard family with role-based cards and quick actions
4. decision/audit/timeline patterns

### Visual Direction

- denser
- more precise
- lower-chroma
- analytical

### Mobile Direction

- compact approvals
- compact incident/inbox flows
- phone-safe entity lookup
- no forced wide-table experience on small screens

## Phase 3: BitHire Workflow Elevation

BitHire should become a structured hiring system, not just a set of recruiting pages.

### Build Priorities

1. recruiter inbox / review queue
2. candidate compare + roundup workspace
3. scorecard / interview kit family
4. scheduler and interviewer coordination surfaces
5. offer approval and decision surfaces

### Visual Direction

- human but structured
- clearer people signals
- stronger stage grammar
- recruiter throughput optimized

### Mobile Direction

- quick candidate review
- interview schedule
- feedback capture
- approvals

Deep configuration flows can remain desktop-primary as long as phone behavior is safe and honest.

## Phase 4: Evnto Operational Differentiation

Evnto should become the most operationally distinct app in the set.

### Build Priorities

1. event-day command center
2. run-of-show / agenda system
3. check-in and queue management system
4. staffing and assignment board
5. inventory and quick-adjust flows

### Visual Direction

- live-status heavy
- more modular widgets
- stronger time/sequence hierarchy
- action-dock friendly

### Mobile Direction

- phone/tablet first for event-day work
- compact queue/search/scan experiences
- stronger bottom action patterns

## Phase 5: Tenant And Branding Expansion

### Goals

- make bundled tenants first-class references
- make customer tenants safe to author and override

### Tasks

1. Document the canonical tenant config authoring flow.
2. Decide which curated tenants are bundled vs static-file vs remote/API.
3. Add authoring examples for:
   - full bundled tenant
   - static-file tenant
   - DB-override tenant
4. Ensure product profiles and tenant personality work together instead of competing.

## Phase 6: QA, Validation, And Measurement

### Required Checks

For every major wave:

- `pnpm lint:vertical`
- `pnpm typecheck`
- responsive review at phone, tablet, desktop widths
- reduced-motion sanity check
- tenant switch sanity check

### Manual QA Checklist

For each app:

1. list workspace
2. detail page
3. create/edit flow
4. dashboard
5. command/search
6. one approval or decision flow
7. one tenant switch or branded tenant render

## Suggested DS Backlog Order

If Cloud needs a strict order, use this:

1. collection workspace spine
2. header/cockpit family
3. draft-safe forms
4. adaptive object/detail scaffold
5. activity/decision spine
6. tenant authoring examples

## Suggested App Backlog Order

1. Platform
   - easiest place to prove the system
2. BitHire
   - strongest workflow payoff
3. Evnto
   - strongest mobile/live-ops payoff once the DS pieces exist

## File-Level Attack Zones

### Design System

Primary likely areas:

- `ui-design-system/packages/core/src/ui/structures`
- `ui-design-system/packages/core/src/ui/surfaces`
- `ui-design-system/packages/core/src/infrastructure/runtime/responsive`
- `ui-design-system/packages/core/src/infrastructure/runtime/tenant`
- `ui-design-system/packages/core/src/graphics/motion`

### Platform

Primary likely areas:

- `app-platform/src/vertical`
- `app-platform/src/ui`
- `app-platform/src/features/*/*/screens`
- `app-platform/src/features/*/*/components`

### BitHire

Primary likely areas:

- `app-bithire/src/vertical`
- `app-bithire/src/ui`
- `app-bithire/src/features/*/*/screens`
- `app-bithire/src/features/*/*/components`

### Evnto

Primary likely areas:

- `app-evnto/src/vertical`
- `app-evnto/src/ui`
- `app-evnto/src/features/*/*/screens`
- `app-evnto/src/features/*/*/components`

## Working Rules For Cloud

1. Do not add more thin wrappers when a shared surface should exist.
2. Do not remove visual differentiation in the name of consistency.
3. Do not ship desktop-first surfaces without an explicit compact strategy.
4. Do not fork tenant behavior inside feature code when the DS/runtime can own it.
5. Prefer one strong shared system over three similar app-local systems.

## Bottom Line

If Cloud follows this blueprint, the repo should end up with:

- stronger DS leverage
- stronger app differentiation
- better mobile behavior
- cleaner tenant scaling

That is the real next level for the platform.
