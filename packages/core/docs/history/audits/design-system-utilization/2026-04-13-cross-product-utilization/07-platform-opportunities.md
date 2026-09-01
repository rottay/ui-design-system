# Platform Opportunities

## Top Recommendations

### 1. Collection workspace as a first-class product pattern

Platform is full of list-and-operate workflows, but still carries a lot of local orchestration.

Proof:

- [entity-table-workspace](/Users/daniel/Developer/Rottay/app-platform/src/ui/tables/entity-table-workspace/index.tsx)
- [users list saved views](/Users/daniel/Developer/Rottay/app-platform/src/features/identity-access/identity/screens/list.tsx)
- [routes list saved views](/Users/daniel/Developer/Rottay/app-platform/src/features/platform-services/navigation/screens/routes-list.tsx)
- [DS collection workspace kit](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/structures/_kits/collection-workspace/index.ts)

### 2. Query-builder filtering and shareable investigative views

Platform has audit/compliance/security workflows that deserve more than search + pills.

Proof:

- [PatternFilterBuilder](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/patterns/forms/filter-builder/index.ts)
- [attributes screen](/Users/daniel/Developer/Rottay/app-platform/src/features/tenant-administration/settings/screens/attributes.tsx)
- [GDPR list](/Users/daniel/Developer/Rottay/app-platform/src/features/governance-risk/compliance/screens/gdpr-list.tsx)

### 3. Decision inbox for risky admin actions

A lot of high-stakes actions still terminate in one-step confirm flows.

Proof:

- [DecisionInboxSurface](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/surfaces/presentation/pages/workspace/decision-inbox/index.tsx)
- [API keys screen](/Users/daniel/Developer/Rottay/app-platform/src/features/tenant-administration/settings/screens/api-keys.tsx)
- [feature-flag rules](/Users/daniel/Developer/Rottay/app-platform/src/features/platform-services/feature-flags/screens/rules.tsx)
- [branding publish flow](/Users/daniel/Developer/Rottay/app-platform/src/features/tenant-administration/tenancy/screens/branding.tsx)

### 4. Unified notification center and delivery console

Inbox, webhooks, templates, and preferences should feel like one operating surface.

Proof:

- [NotificationSurface](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/surfaces/presentation/pages/experience/notification/index.tsx)
- [notifications inbox](/Users/daniel/Developer/Rottay/app-platform/src/features/platform-services/notifications/components/inbox/index.tsx)
- [notifications webhooks](/Users/daniel/Developer/Rottay/app-platform/src/features/platform-services/notifications/components/webhooks/index.tsx)
- [templates list](/Users/daniel/Developer/Rottay/app-platform/src/features/platform-services/notifications/screens/templates-list.tsx)

### 5. Investigation-grade activity/timeline standardization

Security and governance work should not keep reinventing local timelines.

Proof:

- [PatternActivityLog](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/patterns/communication/activity-log/index.ts)
- [PatternTimeline](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/patterns/visualization/timeline/index.ts)
- [security activity timeline](/Users/daniel/Developer/Rottay/app-platform/src/features/security-ops/security/components/activity-timeline/index.tsx)
- [breaches screen](/Users/daniel/Developer/Rottay/app-platform/src/features/governance-risk/compliance/screens/breaches.tsx)

### 6. Detail panels and preview rails for master-detail work

Operators should be able to inspect and act without constant route changes.

Proof:

- [PatternDetailPanel](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/patterns/data/detail-panel/index.ts)
- [DetailSurface](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/surfaces/presentation/pages/data/detail/index.tsx)
- [workspace preview](/Users/daniel/Developer/Rottay/app-platform/src/features/identity-access/identity/screens/workspace-preview.tsx)
- [tenant detail](/Users/daniel/Developer/Rottay/app-platform/src/features/tenant-administration/tenancy/screens/tenant-detail.tsx)

### 7. Role-based command centers instead of repeated KPI card grids

Platform has enough custom dashboard chrome now to justify a stronger command-center abstraction.

Proof:

- [PatternStatsGrid](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/patterns/data/stats-grid/index.ts)
- [CommandCenterSurface](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/surfaces/presentation/pages/workspace/command-center/index.tsx)
- [dashboard content](/Users/daniel/Developer/Rottay/app-platform/src/app/(dashboard)/dashboard/content/index.tsx)
- [security risk](/Users/daniel/Developer/Rottay/app-platform/src/features/security-ops/security/screens/risk.tsx)

### 8. Tenant preview and white-label publishing workbench

This is one of the cleanest premium-product opportunities in the whole repo.

Proof:

- [PatternTenantPreview](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/patterns/misc/tenant-preview/index.ts)
- [whitelabel settings](/Users/daniel/Developer/Rottay/app-platform/src/features/tenant-administration/settings/screens/whitelabel.tsx)
- [branding screen](/Users/daniel/Developer/Rottay/app-platform/src/features/tenant-administration/tenancy/screens/branding.tsx)
- [branding versions](/Users/daniel/Developer/Rottay/app-platform/src/features/tenant-administration/tenancy/screens/branding-versions.tsx)

### 9. Scheduler/calendar surfaces for compliance and ops deadlines

Date-driven risk work should not stay buried inside tables and detail views.

Proof:

- [PatternCalendarView](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/patterns/visualization/calendar-view/index.ts)
- [SchedulerSurface](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/surfaces/presentation/pages/operations/scheduler/index.tsx)
- [compliance overview](/Users/daniel/Developer/Rottay/app-platform/src/features/governance-risk/compliance/screens/overview.tsx)
- [privacy export](/Users/daniel/Developer/Rottay/app-platform/src/features/identity-access/profile/screens/privacy-export.tsx)

### 10. Real cross-entity command palette

Current global search is still too mock-like for the product role Platform plays.

Proof:

- [Platform global-search](/Users/daniel/Developer/Rottay/app-platform/src/ui/global-search/index.tsx)
- [topbar](/Users/daniel/Developer/Rottay/app-platform/src/vertical/shell/topbar/index.tsx)
- [PatternCommandPalette](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/patterns/navigation/command-palette/index.ts)
- [SearchSurface](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/surfaces/presentation/pages/data/search/index.tsx)

## Best Sequence

Highest near-term ROI:

1. collection workspace
2. decision inbox
3. notification center
4. tenant preview / white-label publishing
