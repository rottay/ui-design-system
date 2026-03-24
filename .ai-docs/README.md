# Rottay Ecosystem - AI Documentation Hub

**Last Updated**: 2026-03-24
**Purpose**: Complete reference for AI agents (Claude, ChatGPT) to understand, audit, and iterate on the Rottay ecosystem.

---

## Architecture Overview

The Rottay ecosystem is a multi-tenant, multi-engine design system powering 3 vertical applications:

```
@rottay/design-system (DS)
  |-- 130+ multi-engine components (classic/modern/rustic)
  |-- 43+ patterns (data-table, stats-grid, filter-panel, etc.)
  |-- 36 surface types (list, detail, dashboard, form, settings, etc.)
  |-- 3 vertical presets (evnto, bithire, platform)
  |-- Shared hooks (useTenantBranding, useEngine, useTokens, etc.)
  |
  +-- app-platform (Admin Portal)
  |     engine: classic (default), tenant-configurable
  |     182 surface files, 131 pages
  |
  +-- app-bithire (Recruiting Platform)
  |     engine: classic (default), tenant-configurable
  |     180 surface files
  |
  +-- app-evnto (Event Management)
        engine: modern (default), tenant-configurable
        186 surface files
```

## Documentation Map

### Design System
| Document | Path | Content |
|----------|------|---------|
| **Patterns Catalog** | `design-system/patterns/CATALOG.md` | All 43+ patterns with engine support matrix |
| **Surfaces Catalog** | `design-system/surfaces/CATALOG.md` | All 36 surface types with config interfaces |
| **Surface Types** | `design-system/surfaces/TYPES.md` | Full type definitions for surface configs |
| **Engine Architecture** | `design-system/engines/ARCHITECTURE.md` | Multi-engine system, factory, resolution |
| **Verticals** | `design-system/engines/VERTICALS.md` | Vertical presets (evnto, bithire, platform) |
| **Component Coverage** | `design-system/engines/COMPONENT-COVERAGE.md` | 130+ components with engine implementations |
| **Hooks Catalog** | `design-system/hooks/CATALOG.md` | All hooks (useTenantBranding, useEngine, etc.) |

### Per-Pattern Detail
| Pattern | Path |
|---------|------|
| PatternDataTable | `design-system/patterns/data-table.md` |
| PatternStatsGrid | `design-system/patterns/stats-grid.md` |
| PatternListToolbar | `design-system/patterns/list-toolbar.md` |
| PatternFilterPanel | `design-system/patterns/filter-panel.md` |
| PatternCockpitHeader | `design-system/patterns/cockpit-header.md` |
| PatternPageShell | `design-system/patterns/page-shell.md` |
| PatternDetailPanel | `design-system/patterns/detail-panel.md` |
| PatternFormBuilder | `design-system/patterns/form-builder.md` |
| PatternStepWizard | `design-system/patterns/step-wizard.md` |
| PatternTimeline | `design-system/patterns/timeline.md` |

### Per-Surface Detail
| Surface | Path |
|---------|------|
| ListSurface | `design-system/surfaces/list-surface.md` |
| DetailSurface | `design-system/surfaces/detail-surface.md` |
| DashboardSurface | `design-system/surfaces/dashboard-surface.md` |
| FormSurface | `design-system/surfaces/form-surface.md` |
| SettingsSurface | `design-system/surfaces/settings-surface.md` |
| AuditSurface | `design-system/surfaces/audit-surface.md` |
| ChatSurface | `design-system/surfaces/chat-surface.md` |
| KanbanSurface | `design-system/surfaces/kanban-surface.md` |

### Apps
| App | Document | Path |
|-----|----------|------|
| **Platform** | Surface Catalog | `apps/platform/surfaces/CATALOG.md` |
| | Adapters | `apps/platform/surfaces/ADAPTERS.md` |
| | Route Map | `apps/platform/pages/ROUTE-MAP.md` |
| | Shared Components | `apps/platform/SHARED-COMPONENTS.md` |
| | Provider Tree | `apps/platform/PROVIDER-TREE.md` |
| **BitHire** | Surface Catalog | `apps/bithire/surfaces/CATALOG.md` |
| | Adapters | `apps/bithire/surfaces/ADAPTERS.md` |
| | Route Map | `apps/bithire/pages/ROUTE-MAP.md` |
| | Shared Components | `apps/bithire/SHARED-COMPONENTS.md` |
| | Provider Tree | `apps/bithire/PROVIDER-TREE.md` |
| | DS Integration | `apps/bithire/DS-INTEGRATION.md` |
| **Evnto** | Surface Catalog | `apps/evnto/surfaces/CATALOG.md` |
| | Adapters | `apps/evnto/surfaces/ADAPTERS.md` |
| | Route Map | `apps/evnto/pages/ROUTE-MAP.md` |
| | Provider Tree | `apps/evnto/PROVIDER-TREE.md` |
| | DS Integration | `apps/evnto/DS-INTEGRATION.md` |

### Cross-App
| Document | Path | Content |
|----------|------|---------|
| **Runtime Contract** | `cross-app/CANONICAL-MODEL.md` | Unified tenant/whitelabel/DS contract |
| **Consistency Audit** | `cross-app/CONSISTENCY-AUDIT.md` | Where apps diverge and why |
| **Improvement Roadmap** | `cross-app/ROADMAP.md` | What to build next |

---

## Key Concepts

### Engine System
Every DS component has 3 complete implementations:
- **classic**: Ant Design (enterprise, structured)
- **modern**: DaisyUI/Tailwind (contemporary, glassmorphism)
- **rustic**: Vanilla HTML/CSS (minimal, spacious)

Tenants can switch engines. The entire UI re-renders with a different component library.

### Surface Architecture
Apps delegate page rendering to "surfaces" -- screen-level components that compose DS patterns:
- **ListSurface**: Table + toolbar + filters + pagination + empty/loading states
- **DetailSurface**: Entity header + tabs + sidebar + actions
- **DashboardSurface**: Stats grid + sections + header actions
- **SettingsSurface**: Tab-based configuration forms

### Tenant Whitelabel (2-Step)
1. **Pre-login**: Branding from hostname (colors, logo) for themed login
2. **Post-login**: Full personality from DB (animations, tokens, surfaces)

### Vertical Presets
Each app belongs to a vertical with defaults:
- `evnto`: engine=modern, density=spacious, animations=expressive
- `bithire`: engine=classic, density=compact, animations=minimal
- `platform`: engine=classic, density=comfortable, animations=moderate
