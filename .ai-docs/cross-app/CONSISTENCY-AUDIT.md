# Cross-App Consistency Audit

**Date**: 2026-03-24

---

## Current State Summary

| Dimension | evnto | bithire | platform |
|-----------|-------|---------|----------|
| **Surface files** | 186 | 180 | 182 |
| **Uses DS ListSurface** | No (PatternDataTable direct) | No (PatternDataTable direct) | Yes (55 files) |
| **Uses DS DetailSurface** | No | No | Yes (partial) |
| **Uses DS DashboardSurface** | No (custom widgets) | No | Yes (1 page) |
| **Uses PatternDataTable** | Yes (22 files) | Yes (5+ files) | Via ListSurface |
| **Uses StatsHeader** | Yes (via DS) | Yes (5 files) | No (uses DataTerminalCard) |
| **Uses CommandHeader (app-owned)** | No (0) | Yes (32) | Yes (44) |
| **Engine-aware chrome** | Yes (DS patterns) | Partial | No (app-owned chrome) |
| **Middleware tenant forwarding** | Yes (request headers) | Yes (request headers) | Yes (request headers) |
| **DS Toast (no sonner)** | Yes | Yes | Yes |
| **forceEngine** | Removed | Never had | Removed |
| **Locale** | Session-derived | Session-derived | tenantConfig/es default |
| **Branding endpoints** | :slug + by-host | :slug + by-host | :slug + by-host |
| **useTenantBranding hook** | Yes | Yes | No (server-side DB query) |

---

## Key Divergences

### 1. Surface Implementation Depth

**evnto** = Best: Uses DS patterns directly (PatternDataTable, StatsHeader, etc.)
**bithire** = Good: Uses DS patterns but also has legacy CommandHeader
**platform** = Mixed: Uses DS ListSurface but wraps with app-owned chrome

### 2. Chrome Components

| Component | DS Equivalent | evnto uses | bithire uses | platform uses |
|-----------|--------------|------------|-------------|---------------|
| Page header with stats | PatternCockpitHeader | DS | CommandHeader (app) | CommandHeader (app) |
| Stats cards | PatternStatsGrid | StatsHeader (DS) | StatsHeader (DS) | DataTerminalCard (app) |
| Table toolbar | PatternListToolbar | DS | DS | TableToolbar (app) |
| Filter pills | PatternFilterPanel | DS | DS | StatusFilterPills (app) |
| Pagination | In PatternDataTable | DS | DS | TablePagination (app) |

### 3. Data Flow Pattern

**evnto/bithire**: `useListController` hook + `PatternDataTable` (client-side orchestration)
**platform**: `ListSurface` wrapper + app-owned toolbar/pagination (hybrid)

---

## Improvement Opportunities

### Priority 1: Unify Platform Chrome
Replace platform's 5 app-owned components with DS Patterns:
- CommandHeader (44 files) -> PatternCockpitHeader
- DataTerminalCard (39 files) -> PatternStatsGrid
- TableToolbar (13 files) -> PatternListToolbar
- StatusFilterPills (13 files) -> PatternFilterPanel
- TablePagination (16 files) -> PatternDataTable pagination

### Priority 2: Align Surface Usage
- evnto and bithire should evaluate using DS Surface components (ListSurface, DetailSurface) for consistent chrome
- OR: DS Surface components should be optional wrappers, not mandatory

### Priority 3: Shared Patterns as DS Packages
Move `useListController` to `@rottay/design-system` since both evnto and bithire use it.
