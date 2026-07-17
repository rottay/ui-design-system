# Duplication And Inconsistencies

## Executive Read

The biggest duplication problem is not “many small components.”  
It is the repeated reimplementation of **whole screen systems**:

- list workspaces
- page headers
- shell chrome
- global search
- approval queues
- activity/timeline surfaces

In several places, the repo also duplicates the same implementation twice inside the same app.

## Intra-App Mirror Duplicates

### BitHire

These two page-header implementations are effectively the same component:

- [components/_shared page-header](/Users/daniel/Developer/Rottay/app-bithire/src/composition/components/_shared/layout-parts/page-header/index.tsx)
- [ui page-header](/Users/daniel/Developer/Rottay/app-bithire/src/ui/layout-parts/page-header/index.tsx)

### Evnto

These two status-badge implementations are effectively identical:

- [components/_shared status-badge](/Users/daniel/Developer/Rottay/app-evnto/src/composition/components/_shared/data-display/status-badge/index.tsx)
- [ui status-badge](/Users/daniel/Developer/Rottay/app-evnto/src/ui/data-display/status-badge/index.tsx)

## Highest-ROI Cross-App Duplications

### 1. Collection / list workspace spine

Proof:

- [BitHire data-table](/Users/daniel/Developer/Rottay/app-bithire/src/ui/tables/data-table/index.tsx)
- [Evnto data-table](/Users/daniel/Developer/Rottay/app-evnto/src/ui/tables/data-table/index.tsx)
- [Platform entity-table-workspace](/Users/daniel/Developer/Rottay/app-platform/src/ui/tables/entity-table-workspace/index.tsx)

Centralize toward:

- [ListSurface](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/surfaces/presentation/pages/data/list/index.tsx)
- [CollectionWorkspaceSurface](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/surfaces/presentation/pages/workspace/collection-workspace/index.tsx)

### 2. Page header family

Proof:

- [BitHire page-header](/Users/daniel/Developer/Rottay/app-bithire/src/ui/layout-parts/page-header/index.tsx)
- [Evnto page-header](/Users/daniel/Developer/Rottay/app-evnto/src/ui/layout-parts/page-header/index.tsx)
- [Platform command-header](/Users/daniel/Developer/Rottay/app-platform/src/ui/layout/command-header-component/index.tsx)

Centralize toward:

- [DetailHeader](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/structures/headers/detail/index.tsx)
- [CockpitHeader](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/patterns/misc/cockpit-header/index.ts)

### 3. Shell-adjacent chrome

Proof:

- [BitHire shell header](/Users/daniel/Developer/Rottay/app-bithire/src/vertical/shell/header/index.tsx)
- [Evnto layout header](/Users/daniel/Developer/Rottay/app-evnto/src/ui/layout/header/index.tsx)
- [Platform app layout](/Users/daniel/Developer/Rottay/app-platform/src/vertical/shell/app-layout/index.tsx)

Centralize toward:

- a shared shell contract around DS `AppShell`

### 4. Global search entrypoint

Proof:

- [BitHire global-search](/Users/daniel/Developer/Rottay/app-bithire/src/ui/search/global-search/index.tsx)
- [Evnto global-search](/Users/daniel/Developer/Rottay/app-evnto/src/ui/search/global-search/index.tsx)
- [Platform global-search](/Users/daniel/Developer/Rottay/app-platform/src/ui/global-search/index.tsx)

Centralize toward:

- shared shell search + DS search/command hooks

### 5. Command/cockpit headers

Proof:

- [BitHire command-header](/Users/daniel/Developer/Rottay/app-bithire/src/vertical/shell/command-header-component/index.tsx)
- [Evnto dashboard-header](/Users/daniel/Developer/Rottay/app-evnto/src/features/event-operations/dashboard/components/dashboard-header/index.tsx)
- [Platform command-header](/Users/daniel/Developer/Rottay/app-platform/src/ui/layout/command-header-component/index.tsx)

Centralize toward:

- [CockpitHeader](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/patterns/misc/cockpit-header/index.ts)

### 6. Approval / decision inboxes

Proof:

- [BitHire offer approval center](/Users/daniel/Developer/Rottay/app-bithire/src/features/offers/screens/approval-center/index.tsx)
- [Evnto purchasing detail](/Users/daniel/Developer/Rottay/app-evnto/src/features/commerce-operations/purchasing/screens/detail/index.tsx)
- [Platform impersonation requests](/Users/daniel/Developer/Rottay/app-platform/src/features/identity-access/impersonation/screens/requests.tsx)

Centralize toward:

- [ApprovalInbox](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/patterns/workflow/approval-inbox/index.ts)
- [DecisionInboxSurface](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/surfaces/presentation/pages/workspace/decision-inbox/index.tsx)

### 7. Activity feeds / timelines

Proof:

- [BitHire activity stream](/Users/daniel/Developer/Rottay/app-bithire/src/features/dashboard/components/dashboard/activity/stream/index.tsx)
- [Evnto activity feed widget](/Users/daniel/Developer/Rottay/app-evnto/src/features/event-operations/dashboard/components/widgets/activity-feed/index.tsx)
- [Platform activity timeline](/Users/daniel/Developer/Rottay/app-platform/src/features/security-ops/security/components/activity-timeline/index.tsx)

Centralize toward:

- [ActivitySurface](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/surfaces/presentation/pages/operations/activity/index.tsx)
- [ActivityLog](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/patterns/communication/activity-log/index.ts)

### 8. Filter bars / pills / scope controls

Proof:

- [BitHire filter-pills](/Users/daniel/Developer/Rottay/app-bithire/src/features/_shared/filter-pills/index.tsx)
- [Evnto filter-bar](/Users/daniel/Developer/Rottay/app-evnto/src/ui/filters/filter-bar/index.tsx)
- [Platform global-filter-bar](/Users/daniel/Developer/Rottay/app-platform/src/features/security-ops/dashboard/screens/global-filter-bar/index.tsx)

### 9. Status badge + status registry

Proof:

- [BitHire application-status-badge](/Users/daniel/Developer/Rottay/app-bithire/src/features/applications/components/applications/application-status-badge/index.tsx)
- [Evnto status-badge](/Users/daniel/Developer/Rottay/app-evnto/src/ui/data-display/status-badge/index.tsx)
- [Platform inline status config](/Users/daniel/Developer/Rottay/app-platform/src/features/identity-access/impersonation/screens/history.tsx)

### 10. Empty states / loading states

Proof:

- [BitHire empty-state](/Users/daniel/Developer/Rottay/app-bithire/src/ui/feedback/empty-state/index.tsx)
- [Evnto empty-state](/Users/daniel/Developer/Rottay/app-evnto/src/ui/feedback/empty-state/index.tsx)
- [Platform home-copilot empty-state](/Users/daniel/Developer/Rottay/app-platform/src/features/security-ops/home-copilot/screens/components/empty-state/index.tsx)
- [BitHire page-skeleton](/Users/daniel/Developer/Rottay/app-bithire/src/ui/loading/page-skeleton/index.tsx)
- [Evnto loading-state](/Users/daniel/Developer/Rottay/app-evnto/src/ui/feedback/loading-state/index.tsx)

## Root Cause

The repo tends to solve a problem in this order:

1. use DS primitives
2. build a local app wrapper
3. repeat the wrapper in another app
4. only later notice the pattern was really cross-app

That means the right response is **not** “add more thin wrappers.”

It is:

- centralize whole screen/controller patterns
- make apps provide adapters/configuration
- let verticals customize behavior rather than own entire duplicated implementations

## Best Consolidation Targets

If we only pick a few families to attack, the highest ROI order is:

1. list/collection workspace
2. headers/cockpit headers
3. shell search + command infrastructure
4. approvals/activity/timelines
