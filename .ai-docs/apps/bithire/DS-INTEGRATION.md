# BitHire DS Integration

> How app-bithire uses @rottay/design-system: patterns, hooks, engine flow.

## Overview

BitHire is a recruiting platform that fully integrates the DS Surface architecture. All 132 surface
files import from `@rottay/design-system`. The app uses the `bithire` vertical with tenant-specific
theming via `useTenantBranding()`.

## DS Configuration

| Setting | Value |
|---------|-------|
| **vertical** | `"bithire"` |
| **productProfile** | `BITHIRE_PRODUCT_PROFILE` (from `@/lib/theme`) |
| **default tenant** | `"bithire"` (rottay maps to bithire) |
| **toast position** | `"bottom-right"` |
| **locale** | Session-based via `toSupportedLocale()` |

## Surface Patterns Used

### ListSurface
Used for entity list views (jobs, candidates, interviews, offers, applications, recruiters).
- Config factories in `_shared/adapter.ts` provide `EntityAdapter<Source, View>`
- Permission gating via `useSurfacePermissions()` from `@/surfaces/_shared/permissions`
- Cell renderers from `@/surfaces/_shared/cell-renderers`
- Filter pills from `@/surfaces/_shared/filter-pills`

**Example flow**:
```
page.tsx -> SurfaceScreen component -> useSurfacePermissions() -> ListSurface config -> render
```

### DetailSurface
Used for entity detail views (job detail, candidate detail, interview detail, offer detail).
- Detail sections as separate components in `detail/sections/` subdirectory
- Each section is a standalone component (e.g., `job-header`, `job-overview`, `job-requirements`)

### DashboardSurface
Used for the recruiter dashboard (`dashboard/recruiter/index.tsx`).
- Server-side data loading with 17 parallel fetches via `Promise.all`
- Data passed as props from server component (RSC) to client surface screen
- Permission gating via `ANALYTICS_ACTION_PERMISSIONS`

### Custom Surface Screens
Many screens are custom (not using ListSurface/DetailSurface configs) but still:
- Import DS components (Box, Flex, Text, Card, Stack, Grid, Button, Table, Tag, Badge, etc.)
- Use `useSurfacePermissions()` for action gating
- Follow the thin page.tsx wrapper pattern

## Permission System

File: `app-bithire/src/surfaces/_shared/permissions/`

### Permission Maps (`permission-maps.ts`)
Domain-specific action permission maps consumed by `useSurfacePermissions()`:
- `JOB_ACTION_PERMISSIONS`
- `CANDIDATE_ACTION_PERMISSIONS`
- `INTERVIEW_ACTION_PERMISSIONS`
- `SCORING_ACTION_PERMISSIONS`
- `OFFER_ACTION_PERMISSIONS`
- `APPLICATION_ACTION_PERMISSIONS`
- `RECRUITER_ACTION_PERMISSIONS`
- `ANALYTICS_ACTION_PERMISSIONS`

### useSurfacePermissions Hook (`use-surface-permissions.ts`)
- Takes `{ actions: ActionPermissionMap }` as input
- Reads user permissions from auth context
- Calls `computePermissions()` (pure function, testable)
- Returns `{ permissions }` object with boolean flags per action

### Route Guard (`route-guard.tsx`)
- Route-level permission guard component
- Wraps page content, shows forbidden state if user lacks required permissions

## Adapter Pattern

Each CRUD domain has a `_shared/adapter.ts`:

```
candidates/_shared/adapter.ts  -> candidateListAdapter
jobs/_shared/adapter.ts        -> jobListAdapter
interviews/_shared/adapter.ts  -> interviewListAdapter
offers/_shared/adapter.ts      -> offerListAdapter
applications/_shared/adapter.ts -> applicationListAdapter
recruiters/_shared/adapter.ts  -> recruiterListAdapter
```

Each adapter:
1. Imports `EntityAdapter` type from `@rottay/design-system`
2. Defines a flat `View` interface (e.g., `CandidateListView`)
3. Exports an adapter object with `entity`, `version`, `map()`, and `fields[]`
4. Uses helper functions from sibling `helpers.ts` file

## Component Import Pattern

All surface screens follow this import convention:

```typescript
// DS components
import {
  Box, Flex, Text, Stack, Card, Grid, Button, Table, Tag, Badge,
  Input, Select, Modal, Spinner, Empty, Divider, Avatar, Tabs,
  useSurfacePermissions,
} from "@rottay/design-system";

// Adapters
import { candidateListAdapter } from "./_shared/adapter";

// Permissions
import { CANDIDATE_ACTION_PERMISSIONS } from "@/surfaces/_shared/permissions";
```

## DS Hooks Used

| Hook | Source | Usage |
|------|--------|-------|
| `useSurfacePermissions` | `@/surfaces/_shared/permissions` | Action gating in every surface |
| `useTenantBranding` | `@rottay/design-system` | 2-step branding in provider |
| `toSupportedLocale` | `@rottay/design-system` | Locale normalization |

## DS Color Tokens

All colors use CSS variables -- no hardcoded values:
- `var(--ds-color-primary)` through `var(--ds-color-primary-900)`
- `var(--ds-color-text-primary)`, `var(--ds-color-text-secondary)`, `var(--ds-color-text-muted)`
- `var(--ds-color-bg-primary)`, `var(--ds-color-bg-secondary)`
- `var(--ds-color-success)`, `var(--ds-color-warning)`, `var(--ds-color-error)`, `var(--ds-color-info)`
- `var(--ds-color-border)`, `var(--ds-color-border-secondary)`
