# Mobile Responsive Audit And Adaptive Strategy

## Executive Read

The repo is **not** non-responsive.

But the responsiveness is uneven:

- the design system has strong responsive infrastructure
- the apps do not all consume it the same way
- several important surfaces are still desktop-first and only partially adaptive

The right target is not “everything shrinks nicely.”

The right target is:

- each surface has an intentional phone mode
- each surface has an intentional desktop mode
- tablet is treated as a transition zone, not an accident

## Current Evidence From The Repo

### Design-System Responsive Runtime

Local evidence:

- `ui-design-system/packages/core/src/runtime/responsive/ResponsiveProvider.tsx`
- `ui-design-system/packages/core/src/runtime/responsive/index.ts`
- `ui-design-system/packages/core/src/hooks/responsive/index.ts`

What exists today:

- shared responsive context
- SSR-safe mobile defaults
- device classes: phone, tablet, desktop
- pointer awareness: coarse vs fine
- orientation awareness
- reduced-motion awareness

Important nuance:

- the provider is mobile-first on the runtime side
- the shared CSS entrypoint still describes its media-query layer as “web-first design, NOT mobile-first”
- the CSS bundle does enforce coarse-pointer touch targets at `44x44px`

That means the infrastructure is strong, but the authoring model is still mixed.

### App-Level Responsive Signals

These counts are broad heuristics from repo scans of app source:

| Signal | Platform | BitHire | Evnto |
| --- | ---: | ---: | ---: |
| Responsive primitive refs (`Show`, `Hide`, `ResponsiveSlot`, responsive hooks) | `45` | `67` | `95` |
| Files with those refs | `31` | `37` | `30` |
| `AppShell` refs | `11` | `0` | `0` |
| Effective DS global stylesheet entry | `1` | `1` | `1` |

Interpretation:

- Platform has the strongest DS shell ownership
- BitHire has real responsive branching, but more of it is app-local
- Evnto uses the most explicit responsive primitives, especially `Show`, `Hide`, and `ResponsiveSlot`

### Shell Findings By App

#### Platform

Evidence:

- `app-platform/src/vertical/shell/app-layout/index.tsx`

What is healthy:

- uses DS `AppShell`
- shell geometry comes from vertical profile constants
- mobile overlay behavior exists
- content padding changes by route intent

Read:

Platform has the best shell foundation for adaptive behavior.

Main risk:

- dense data screens can still become desktop-primary if surface-level transforms are not codified

#### BitHire

Evidence:

- `app-bithire/src/app/(dashboard)/layout.tsx`
- `app-bithire/src/vertical/shell/main-content/index.tsx`

What is healthy:

- explicit desktop/mobile split exists
- sidebar collapses for desktop and becomes off-canvas on mobile
- main content padding changes based on sidebar width and route meta

Main risk:

- much of the behavior is still hardcoded locally
- many flows are manual compositions rather than DS-adaptive surfaces
- mobile safety exists, but mobile optimization is still weak on workflow-heavy screens

#### Evnto

Evidence:

- `app-evnto/src/app/(dashboard)/layout.tsx`
- `app-evnto/src/ui/layout/header/index.tsx`
- `app-evnto/src/ui/filters/filter-bar/index.tsx`

What is healthy:

- strongest use of `Show`, `Hide`, and `ResponsiveSlot`
- mobile `ActionDock` exists
- shell explicitly swaps desktop/mobile header and breadcrumb behavior

Main risk:

- more shell geometry is still local than it should be
- some dense operational components still need stronger mobile-specific composition

## Current Readiness By App

### Platform

Readiness: `desktop-strong, mobile-safe, not yet fully adaptive`

Best current qualities:

- strongest shell ownership
- most mature table workspace direction
- clearest route-intent-aware layout behavior

Remaining gap:

- many data-dense surfaces still need a first-class phone treatment

### BitHire

Readiness: `hybrid, but still desktop-biased in deep workflows`

Best current qualities:

- dashboard shell is responsive
- recruiter quick actions are present
- several shell elements already split cleanly between desktop and mobile

Remaining gap:

- forms, compare flows, roundups, and list/detail workspaces need more deliberate compact layouts

### Evnto

Readiness: `most adaptive in intent, still uneven in execution`

Best current qualities:

- explicit responsive primitives in real product screens
- action-dock posture matches the domain
- the domain itself naturally supports mobile-forward operation

Remaining gap:

- needs more standardization so adaptive behavior is not re-authored screen by screen

## Surface Strategy: Desktop vs Mobile

This is the most important section for implementation.

### 1. Collection Workspace

| Desktop | Mobile | Needed DS/App Behavior |
| --- | --- | --- |
| table + filters + saved views + bulk actions + preview pane | summary list or card list + search + filter sheet + row tap into full detail route/sheet | a single workspace system that can switch table-first to card/list-first without reauthoring the whole screen |

Rules:

- Do not force 10-column tables onto phone.
- Keep no more than 3 to 5 critical fields in compact list rows.
- Move advanced filters into a sheet or full-screen filter route on phone.
- Move saved views and bulk actions into an overflow or command sheet on compact widths.

### 2. Detail + Inspector

| Desktop | Mobile | Needed DS/App Behavior |
| --- | --- | --- |
| detail page + side inspector or supporting pane | stacked sections or full-screen detail, inspector content moves to sheet/accordion | a shared object-page/supporting-pane family that knows how to collapse |

Rules:

- Use anchored or tabbed sections on desktop for long objects.
- Convert supporting panes to sheets or collapsible cards on phone.
- Keep critical summary fields visible at the top.

### 3. Create / Edit Forms

| Desktop | Mobile | Needed DS/App Behavior |
| --- | --- | --- |
| grouped multi-column sections, sidebar help or review | one-column grouped sections, sticky action footer, optional step flow | draft-safe form system with compact and comfortable recipes |

Rules:

- Phone forms should be one-column by default.
- Primary submit/save actions should remain sticky and reachable.
- Secondary controls should move into an overflow or bottom sheet where needed.
- Large descriptive review blocks should collapse progressively.

### 4. Dashboards

| Desktop | Mobile | Needed DS/App Behavior |
| --- | --- | --- |
| multi-card canvas, charts + tables + filters | KPI strip + one primary chart or queue + prioritized cards | dashboard recipe families with rank-ordered content for compact screens |

Rules:

- Do not merely wrap desktop cards into one long vertical pile.
- Decide what the “one thing to act on now” is for phone.
- Preserve alerting, queue health, and top metrics above secondary visualization.

### 5. Filters And Search

| Desktop | Mobile | Needed DS/App Behavior |
| --- | --- | --- |
| inline filter bar, side filters, persistent search | search-first top bar or full-screen search, filter sheet, chips for active filters | command/search/filter system with explicit compact behaviors |

Rules:

- Search should become more prominent, not less, on phone.
- Advanced filters should move out of inline bars into sheets.
- Active filter chips must remain legible after the sheet closes.

### 6. Action Clusters

| Desktop | Mobile | Needed DS/App Behavior |
| --- | --- | --- |
| distributed buttons in headers, tables, side rails | action dock, sticky footer, or compact overflow menu | shared compact action patterns |

Rules:

- Use 1 to 3 high-value actions on mobile, not the full desktop action set.
- Put destructive or low-frequency actions behind overflow.
- Prefer stable bottom placement for high-frequency operational actions.

## Recommended Mobile Posture By App

### Platform

Platform should be:

- desktop-primary
- mobile-safe
- selective on phone

Phone-first surface types:

- approvals
- incident alerts
- notifications
- quick entity lookup
- compact dashboard summaries

Desktop-primary surface types:

- wide investigative tables
- dashboard builders
- policy editors
- bulk admin consoles

### BitHire

BitHire should be:

- dual-posture
- recruiter-safe on phone
- full-fidelity on desktop for heavy setup and evaluation

Phone-first surface types:

- candidate review
- interview schedule
- recruiter inbox
- feedback submission
- offer approval

Desktop-primary surface types:

- job configuration
- scorecard design
- analytics
- complex scheduling coordination
- multi-candidate comparison

### Evnto

Evnto should be:

- the most mobile-forward of the three
- explicitly optimized for tablet and phone use in the field

Phone/tablet-first surface types:

- check-in
- staffing assignment
- run-of-show
- venue readiness
- product/inventory quick updates
- event-day dashboards

Desktop-primary surface types:

- pricing/finance administration
- dense sponsor and procurement admin
- historical reporting and setup-heavy maintenance screens

## Design-System Changes Needed

If Cloud is going to implement this well, the DS should grow the following adaptive contracts:

1. `CollectionWorkspace` with `desktop`, `tablet`, and `phone` transforms
2. `ObjectPage` with optional supporting pane that can collapse to a sheet
3. `FormSurface` with compact recipe + sticky action footer
4. `CommandHeader` / `PageHeader` compact variants
5. `FilterSheet` and `SavedViewsSheet`
6. `ActionDock` recipes by vertical
7. `DashboardStack` / `MetricStrip` compact dashboard primitives

## Concrete Rule For Cloud

When implementing or refactoring a surface:

1. classify it as list-detail, dashboard, form, detail, queue, or workbench
2. define phone/tablet/desktop behavior before coding
3. do not accept “same layout, narrower width” as a finished adaptive design

That discipline matters more than any single CSS tweak.
