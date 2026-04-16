# BitHire Opportunities

## Top Recommendations

### 1. One recruiting workspace surface for candidates/jobs/interviews/offers/recruiters

These list screens keep rebuilding the same toolbar/search/saved-view/column/density/export grammar.

Proof:

- [candidates list](/Users/daniel/Developer/Rottay/app-bithire/src/features/candidates/screens/list/index.tsx)
- [jobs list](/Users/daniel/Developer/Rottay/app-bithire/src/features/jobs/screens/list/index.tsx)
- [interviews list](/Users/daniel/Developer/Rottay/app-bithire/src/features/interviews/screens/list/index.tsx)
- [offers list](/Users/daniel/Developer/Rottay/app-bithire/src/features/offers/screens/list/index.tsx)
- [recruiters list](/Users/daniel/Developer/Rottay/app-bithire/src/features/recruiters/screens/list/index.tsx)

### 2. Persona/system/custom saved views

Recruiter, hiring manager, and executive views are a natural fit for DS saved-views capabilities.

Proof:

- [BitHire saved-views](/Users/daniel/Developer/Rottay/app-bithire/src/ui/tables/saved-views/index.tsx)
- [DS SavedViewsMenu](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/structures/workspace/saved-views-menu/index.tsx)

### 3. Hiring workbench for record pages

Candidate/interview/offer/application details are bespoke tabbed pages that should converge on a shared workbench grammar.

Proof:

- [candidate detail](/Users/daniel/Developer/Rottay/app-bithire/src/features/candidates/screens/detail/index.tsx)
- [interview detail](/Users/daniel/Developer/Rottay/app-bithire/src/features/interviews/screens/detail/index.tsx)
- [offer detail](/Users/daniel/Developer/Rottay/app-bithire/src/features/offers/screens/detail/index.tsx)
- [application detail](/Users/daniel/Developer/Rottay/app-bithire/src/features/applications/screens/detail/index.tsx)
- [RecordWorkbenchSurface](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/surfaces/pages/workspace/record-workbench/index.tsx)

### 4. Offer approvals as a real decision inbox

This is one of the clearest current wins.

Proof:

- [approval center](/Users/daniel/Developer/Rottay/app-bithire/src/features/offers/screens/approval-center/index.tsx)
- [DecisionInboxSurface](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/surfaces/pages/workspace/decision-inbox/index.tsx)

### 5. Drag/drop pipeline instead of read-only analytic board

The pipeline wants to be operational, not just descriptive.

Proof:

- [visual pipeline](/Users/daniel/Developer/Rottay/app-bithire/src/features/pipeline/screens/visual/index.tsx)
- [KanbanSurface](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/surfaces/pages/operations/kanban/index.tsx)

### 6. Federated recruiting search with preview rails

Global search is still too thin for the product problem.

Proof:

- [header](/Users/daniel/Developer/Rottay/app-bithire/src/vertical/shell/header/index.tsx)
- [global-search](/Users/daniel/Developer/Rottay/app-bithire/src/ui/search/global-search/index.tsx)
- [SearchSurface](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/surfaces/pages/data/search/index.tsx)

### 7. Reusable evaluation/compare surface

Candidate comparison should grow into a broader evaluation capability.

Proof:

- [candidate compare](/Users/daniel/Developer/Rottay/app-bithire/src/features/candidates/screens/compare/index.tsx)
- [CompareSurface](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/surfaces/pages/data/compare/index.tsx)

### 8. Unified activity, notes, alerts, and audit history

These are still split across custom timelines, flat notes, and dropdown notifications.

Proof:

- [activity screen](/Users/daniel/Developer/Rottay/app-bithire/src/features/activity/screens/screen/index.tsx)
- [application timeline](/Users/daniel/Developer/Rottay/app-bithire/src/features/applications/components/applications/application-timeline/index.tsx)
- [application notes](/Users/daniel/Developer/Rottay/app-bithire/src/features/applications/components/applications/application-notes/index.tsx)
- [NotificationCenter](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/patterns/communication/notification-center/index.ts)

### 9. Recruiter scheduling workspace

Interview-heavy work deserves a real scheduler, not just lists and dashboard blocks.

Proof:

- [my interviews](/Users/daniel/Developer/Rottay/app-bithire/src/features/my-interviews/screens/screen/index.tsx)
- [today schedule](/Users/daniel/Developer/Rottay/app-bithire/src/features/dashboard/components/dashboard/command-center/today-schedule/today-schedule.tsx)
- [SchedulerSurface](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/surfaces/pages/operations/scheduler/index.tsx)

### 10. Normalize command-center chrome into DS-driven dashboards

BitHire has enough cockpit-style UI now to justify a stronger DS-backed command-center pattern.

Proof:

- [command-header component](/Users/daniel/Developer/Rottay/app-bithire/src/vertical/shell/command-header-component/index.tsx)
- [dashboard content](/Users/daniel/Developer/Rottay/app-bithire/src/app/(dashboard)/dashboard/content/index.tsx)
- [CommandCenterSurface](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/surfaces/pages/workspace/command-center/index.tsx)

### 11. Shared hiring intake/create workbench

The create/edit screens are some of the heaviest files in the repo and repeat the same grammar constantly.

Proof:

- [candidate create](/Users/daniel/Developer/Rottay/app-bithire/src/features/candidates/screens/create/index.tsx)
- [job create](/Users/daniel/Developer/Rottay/app-bithire/src/features/jobs/screens/create/index.tsx)
- [interview create](/Users/daniel/Developer/Rottay/app-bithire/src/features/interviews/screens/create/index.tsx)
- [rubric create](/Users/daniel/Developer/Rottay/app-bithire/src/features/ai-studio/screens/rubric-create/index.tsx)

### 12. Richer hiring-native analytics patterns

BitHire already charts a lot, but it is still leaving deeper visualization leverage unused.

Proof:

- [dashboard content](/Users/daniel/Developer/Rottay/app-bithire/src/app/(dashboard)/dashboard/content/index.tsx)
- [analytics trend chart](/Users/daniel/Developer/Rottay/app-bithire/src/features/analytics/components/analytics/trend-chart/index.tsx)
- [DS chart catalog](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/patterns/visualization/charts/index.ts)

## Best Sequence

Highest near-term ROI:

1. recruiting workspace
2. saved views
3. record workbench
4. offer decision inbox
5. intake/create workbench
