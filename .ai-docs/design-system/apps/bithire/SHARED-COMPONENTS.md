# BitHire Shared Components

> Auto-generated: 2026-03-23
> Source: `app-bithire/src/components/_shared/`

## Overview

The `_shared/` directory contains domain-agnostic reusable components used
across multiple surfaces. These are app-level components that sit between
the Design System (`@rottay/design-system`) and domain-specific components.

All shared components use DS primitives internally (Box, Flex, Text, Card, etc.)
and DS color tokens (`var(--ds-color-*)`) -- no hardcoded colors.

---

## Component Categories

### 1. Cards (`_shared/cards/`)

| Component | Description | DS Pattern Equivalent |
|-----------|-------------|----------------------|
| `StatsCard` | Dashboard KPI card with trend indicator | Uses DS `Card` internally |
| `SummaryCard` | Composable card with Header/Section/Footer | Wraps DS `Card` with structured slots |
| `CardHeader` | Card header slot | DS `Flex` + `Text` |
| `CardSection` | Card content section | DS `Box` |
| `CardDivider` | Section divider | DS `Divider` equivalent |
| `CardFooter` | Card footer slot | DS `Flex` |
| `DataTerminalCard` | Futuristic metric card with navigation | Custom (no DS equivalent) |
| `DataTerminalStat` | Non-clickable metric widget | Custom (no DS equivalent) |

### 2. Forms (`_shared/forms/`)

| Component | Description | DS Pattern Equivalent |
|-----------|-------------|----------------------|
| `FormPageHeader` | Page header with progress indicator | App-specific (no DS pattern) |
| `FormAccordionSection` | Collapsible form section | Could use DS `Collapse` if exists |
| `FormFieldLabel` | Styled label with required/hint | App-level form primitive |
| `FormStatusBar` | Auto-save status + keyboard shortcuts | App-specific |
| `FormSubmitBar` | Sticky footer with actions | App-specific |
| `TemplateModal` | Save/load form templates | Wraps DS `Modal` |
| `AddItemModal` | Generic add-to-collection modal | Wraps DS `Modal` |
| `AISuggestionButton` | AI content generation trigger | Wraps DS `Button` |
| `DraftRecoveryBanner` | Unsaved draft notification | App-specific |

### 3. Feedback (`_shared/feedback/`)

| Component | Description | DS Pattern Equivalent |
|-----------|-------------|----------------------|
| `Skeleton` | Base skeleton primitive | DS `Skeleton` (if available) |
| `SkeletonText` | Multi-line text placeholder | - |
| `SkeletonAvatar` | Circular avatar placeholder | - |
| `SkeletonCard` | Card with optional header | - |
| `SkeletonTable` | Table with header and rows | - |
| `SkeletonList` | List with avatar + text | - |
| `SkeletonStats` | Dashboard stats cards | - |
| `SkeletonForm` | Form with labels and inputs | - |
| `SkeletonPage` | Full page layout | - |
| `CandidateCardSkeleton` | Candidate card loading | Domain-shaped skeleton |
| `JobCardSkeleton` | Job card loading | Domain-shaped skeleton |
| `ApplicationCardSkeleton` | Application card loading | Domain-shaped skeleton |
| `KanbanCardSkeleton` | Kanban card loading | Domain-shaped skeleton |
| `DetailCardSkeleton` | Generic detail card loading | Domain-shaped skeleton |
| `CompletenessBar` | Single-value progress bar | App-specific |
| `SegmentedBar` | Multi-segment distribution bar | App-specific |
| `ConfirmDialog` | Confirmation dialog | Wraps DS `Modal` |
| `ConfirmProvider` | Global confirm dialog provider | Mounts inside DS provider stack |
| `EmptyState` | Empty state illustration | App-specific |

### 4. Tables (`_shared/tables/`)

| Component | Description | DS Pattern Equivalent |
|-----------|-------------|----------------------|
| `DataTable` | Legacy data table (pre-surfaces) | Superseded by DS `PatternDataTable` |
| `BulkActions` | Multi-row action bar | App-specific bulk operations |
| `commonBulkActions` | Pre-built bulk actions (delete, etc.) | - |
| `ListToolbar` | Search + filters + view mode + density + export | **App-owned orchestrator for DS PatternDataTable** |
| `ColumnSettingsDropdown` | Column show/hide, reorder, pin | Companion to PatternDataTable column management |
| `SavedViewsDropdown` | Save/load/delete table views | Companion to useListController |
| `StatsHeader` | KPI cards above list | App-specific stats row |
| `ExpandedPanelLayout` | Side panel for row details | App-specific detail panel |
| `DetailField` | Key-value field in expanded panel | - |

### 5. Layout Parts (`_shared/layout-parts/`)

| Component | Description | DS Pattern Equivalent |
|-----------|-------------|----------------------|
| `PageHeader` | Standard page header (icon, title, actions) | App-specific page frame |
| `QuickStat` | Individual stat in header | - |
| `QuickStatsRow` | Horizontal stat container | - |
| `PageTransition` | Route transition animation | App-specific animation |
| `AnimatedContent` | Content entry animation | - |
| `StaggeredList` | Staggered item entry | - |

### 6. UI Primitives (`_shared/ui/`)

| Component | Description | DS Pattern Equivalent |
|-----------|-------------|----------------------|
| `CheckItem` | Full checklist item (label, value, status) | App-specific |
| `MiniCheck` | Compact check/x indicator | App-specific |
| `FocusHideable` | Hides content during focus mode | Integrates with FocusModeProvider |
| `AnimatedGridBackground` | Decorative full-screen background | App-specific |
| `SortDropdown` | Combined sort field + order selector | App-specific |

### 7. Loading (`_shared/loading/`)

| Component | Description | DS Pattern Equivalent |
|-----------|-------------|----------------------|
| `PageSkeleton` | Full page loading skeleton | App-specific |

### 8. Other (`_shared/`)

| Component | Description | DS Pattern Equivalent |
|-----------|-------------|----------------------|
| `QuotaDisplay` (`quota-display/`) | Tenant quota usage indicator | App-specific |
| `CareerCoach` (`career-coach/`) | AI career coaching widget | App-specific |

---

## Relationship to DS PatternDataTable

The core list surfaces use a coordinated set of app-owned + DS-owned components:

```
App-owned (components/_shared/tables/):
  ListToolbar          -- search, filters, view mode, density, export, actions
  StatsHeader          -- KPI cards above the list
  ColumnSettingsDropdown  -- column visibility/order/pin controls
  SavedViewsDropdown   -- view persistence
  FilterPills          -- segmented filter buttons (in surfaces/_shared/)

DS-owned (from @rottay/design-system):
  PatternDataTable     -- the actual table rendering (columns, sort, select, paginate)

App-owned (hooks/):
  useListController    -- state machine for all list concerns
```

This split means the DS provides the rendering engine while the app owns
the orchestration and interaction chrome around it.
