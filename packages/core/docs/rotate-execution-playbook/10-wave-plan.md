# Wave Plan

## R0 - Freeze The Truth

Goal:
Lock execution rules before redesign work starts.

Must-do:

- confirm `TENANT_MODEL.md` remains canonical
- confirm no new schema migration unless the JSONB path truly blocks progress
- freeze Rotate north-star and shell ownership decisions

Repos:

- `ui-design-system`
- `app-platform`

## R1 - Rotate Visual Direction Reset

Goal:
Replace the faux-premium dark template feel with a clearer flagship visual language.

Must-do:

- simplify `CollectionHeader`
- simplify `SearchCommandBar`
- strengthen material ladder in `Card modern`
- improve `Statistic` token fidelity
- update Rotate brand theme where needed

Repos:

- `ui-design-system`

## R2 - DS Shell Contract

Goal:
Move shell ownership from `app-platform` into the DS.

Must-do:

- define DS shell frame abstraction
- move sidebar/topbar geometry into DS structures
- replace app-local shell metrics and content inset logic

Repos:

- `ui-design-system`
- `app-platform`

## R3 - Dashboard Control Room Rebuild

Goal:
Turn the dashboard into one coherent operating surface.

Must-do:

- reduce above-the-fold competition
- create one primary attention panel
- replace local card zoo with DS-owned control-room surfaces
- demote edit chrome until needed

Repos:

- `ui-design-system`
- `app-platform`

## R4 - Data Workspace Rebuild

Goal:
Make the user workspace premium, readable, and operationally fast.

Must-do:

- simplify toolbar hierarchy
- improve table scan path
- make first-column affordance explicit
- upgrade `DataTable.Modern` keyboard and sort behavior

Repos:

- `ui-design-system`
- `app-platform`

## R5 - Tenant Admin Normalization

Goal:
Move DB tenant authoring onto the DS-first bounded contract.

Must-do:

- use `updateWhitelabelConfig` path for DS-facing customization
- migrate settings authoring from branding-first fields toward `appearance.general`
- keep legacy reads as migration shims

Repos:

- `app-platform`

## R6 - Adapter And Public Contract Cleanup

Goal:
Make runtime, preview, public endpoints, and provider boot tell one story.

Must-do:

- centralize DB-to-DS normalization
- align draft, preview, auth, dashboard, and public branding behavior
- decide whether to keep or replace legacy public branding payloads

Repos:

- `app-platform`

## R7 - Cross-App Coherence

Goal:
Make `platform`, `evnto`, and `bithire` siblings rather than cousins.

Must-do:

- shared tenant resolver
- shared DSP boot precedence
- shared shell contract
- aligned CSS entrypoint strategy

Repos:

- `ui-design-system`
- `app-platform`
- `app-evnto`
- `app-bithire`

## R8 - Guardrails, Tests, And Docs

Goal:
Make regressions obvious and expensive.

Must-do:

- docs truth pass
- host-aware tenancy tests
- modern behavior tests
- canonical token fidelity tests
- shell ownership guardrails

Repos:

- `ui-design-system`
- `app-platform`

## R9 - Final QA And Rubric Re-Score

Goal:
Re-run the quality rubric and confirm the new path actually feels flagship.

Must-do:

- manual visual QA on dashboard and user workspace
- cross-app sanity pass
- rubric re-score against `quality-reset-audit`

