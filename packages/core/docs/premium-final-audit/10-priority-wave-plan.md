# Priority Wave Plan

This plan is ordered for premium impact, not just technical neatness.

## R10. First-Paint Tenant Parity

Goal:

- stop DB tenants from first-painting in a legacy-only theme state on client apps

Do:

- carry bounded `appearance.general` through the session/bootstrap path
- make `useTenantBranding` first paint closer to final runtime state
- add behavior tests for first paint vs post-fetch parity

Repos:

- `ui-design-system`
- likely small app session-shape adjustments where needed

## R11. Truthful Preview And Authoring

Goal:

- make the DS preview and authoring path reflect the current canonical model

Do:

- move preview props away from `TenantCreationConfig` as the primary contract
- accept canonical tenant config / `appearance` inputs
- render real DS primitives and patterns in preview
- add tests proving preview uses live components

Repos:

- `ui-design-system`

## R12. Shell Hardening Across DS And Apps

Goal:

- finish the shell story so it is accessible and reusable

Do:

- upgrade `AppShell` mobile drawer to modal-grade behavior
- move Evnto and BitHire toward the DS shell contract or a DS-owned equivalent
- eliminate app-owned shell geometry and overlay duplication

Repos:

- `ui-design-system`
- `app-evnto`
- `app-bithire`

## R13. App-Platform Product Grammar Extraction

Goal:

- stop `app-platform` from acting like a second design system

Do:

- upstream dashboard widget shell, metric tile, feed row, toolbar actions, signal pills, filter clusters
- upstream workspace utility actions and selection/action strip patterns
- remove raw `<style>` reskinning from workspace

Repos:

- `ui-design-system`
- `app-platform`

## R14. Premium Visual Reset For Rotate

Goal:

- move from “dark internal tool” to “premium product”

Do:

- recompose dashboard hierarchy
- simplify workspace control stack
- sharpen row/action affordances
- calm shell rhythm and command/search styling

Repos:

- `app-platform`
- plus DS structures/patterns where extracted

## R15. Settings Family Convergence

Goal:

- make settings/admin feel like one product family across apps

Do:

- keep `overview.tsx` as the basic canonical tenant styling surface
- demote `whitelabel.tsx` to expert mode explicitly
- converge Evnto and BitHire settings/page-shell/header grammar toward shared DS-owned structures

Repos:

- `app-platform`
- `app-evnto`
- `app-bithire`
- `ui-design-system`

## R16. Hybrid Primitive And Pattern Cleanup

Goal:

- remove remaining truth gaps in the DS itself

Do:

- finish `Descriptions`
- add keyboard parity to DataTable column reorder
- audit the remaining hybrid Modern primitives against their declared surfaces

Repos:

- `ui-design-system`

## R17. Guardrails And Docs Sign-Off Pass

Goal:

- make the system self-defending

Do:

- add behavior-first tests for first paint, preview truth, shell accessibility
- add cross-app coherence guardrails
- prune stale rubric/playbook statements

Repos:

- `ui-design-system`
- targeted app tests where needed

