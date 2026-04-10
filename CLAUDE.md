# Claude Code Rules - Design System

## AI Documentation

- **Catálogo Central**: `/docs-engineering/README.md`
- **Component Reference**: `/docs-engineering/engineering/design-system/`

---

## GitHub Configuration

- **Token**: `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`
- **Author**: davila23 <daniel.avila@rottay.com>

## Git Rules

- **NEVER include Co-Authored-By** in commit messages
- **NEVER include "Generated with Claude Code"** in commit messages
- Use conventional commit format: `type(scope): description`

## Project Context

- Multi-engine design system with four engines:
  - **classic** — Ant Design 5.21 wrapper
  - **modern** — Tailwind / DaisyUI wrapper
  - **rustic** — Vanilla CSS fallback
  - **custom** — Reserved for white-label tenants (pluggable component pack registered at runtime)
- Components in `packages/core/src/components/`
- Each component has `engines/{classic,modern,rustic}/index.tsx` siblings selected at runtime via `createEngineComponent()` and the active engine context
- Follow existing component patterns for new additions
- The canonical engine names are `classic` / `modern` / `rustic` / `custom`. The legacy names `titan` / `hermes` / `apollo` are gone — do not reintroduce them.

## Ownership rules

This package is the **single source of truth** for reusable, domain-agnostic UI capability across all Rottay apps.

- The DS owns: primitives, patterns, generic surfaces, page shells, detail shells, detail-form shells, collection workspace shells, layout shells, reusable widget chrome, runtime tenant contracts, product-profile contracts, engine extension points, motion vocabulary, and reusable lane layouts (ranked-row, signal-lane, feed-lane, action-lane).
- The DS does **not** own: tenant/company/user/role/candidate/interview/event semantics, control-plane narrative, recruiting copy, dashboard storytelling, or any product-specific AI/operator narration.
- Before adding a new component, ask: *"Could another app use this without knowing what a tenant, candidate, role, company, interview, or event is?"* If no, it does not belong here — it belongs in the consuming app.
- See `docs-engineering/archive/audits/2026-04-07-home-ai-agent-audit-davila/11-system-ownership-boundaries.md` for the full ownership contract.

## Component taxonomy (4 tiers)

The design system has 4 single-word tiers under `packages/core/src/components/`:

### primitives/
Engine-switched leaf components (Button, Input, Card, Modal, Tabs, etc).
Each primitive has 4 engine implementations: classic, modern, rustic, custom.
6 categories: display, inputs, feedback, layout, navigation, overlay.

### structures/
Page-structure families that wrap or accompany patterns to form page chrome.
Think: headers, toolbars, command bars, record panels, metric cards, loading overlays.
5 groups: `headers/`, `workspace/`, `record/`, `dashboard/`, `feedback/`.

**Example:** CollectionHeader, SearchCommandBar, TableToolbar, RecordFieldGrid, StatsHeader, LoadingOverlay.

### patterns/
Engine-agnostic, task-level compositions that solve generic UI tasks.
Think: tables, forms, charts, kanban boards, timelines, command palettes.
7 groups: `data/`, `forms/`, `visualization/`, `communication/`, `workflow/`, `navigation/`, `misc/`.
Plus `foundation/` (shared types, hooks, header-actions) and `_internal/` (truly private).

**Example:** PatternDataTable, PatternFormBuilder, PatternKanbanBoard, PatternStatsGrid.

### surfaces/
Page-level config objects that describe a whole screen declaratively.
3 tiers: `foundation/` (types, builders, helpers), `layout/` (page-shell, header, sidebar), `pages/` (6 domain groups).

**Example:** ListSurface, DashboardSurface, FormSurface, CollectionWorkspaceSurface.

### Decision rules

| If the piece... | It belongs in... |
|---|---|
| Is a leaf component with an engine switch | **primitives** |
| Solves a generic reusable task (table, form, chart) | **patterns** |
| Wraps or accompanies a pattern as page chrome (header, toolbar, record panel, metric card) | **structures** |
| Describes a whole page as a config object | **surfaces** |
| Depends on specific business domain, route, API, or copy | **the consuming app** |

### What does NOT go in the DS

- `CandidatePipelineHealthCard` — domain-specific, stays in app-bithire
- `CompanyBillingEscalationPanel` — domain-specific, stays in app-platform
- `EvntoVenueSettlementWidget` — domain-specific, stays in app-evnto
- Anything that requires knowing what a tenant, candidate, role, company, interview, or event IS

### Where duplications happen (avoid these)

- Putting page chrome inside patterns (creates structures-tier confusion)
- Putting full screen recipes inside the app (should be a surface config)
- Promoting domain-specific components to the DS too early
- Patterns knowing about page layout (patterns should not know what screen they're in)
- Structures knowing about business domain (structures should only know about layout roles)

## Premium white-label model (BrandTheme)

The canonical premium visual source of truth is **BrandTheme** (`contracts/themes/`).
First-party brand sources live in `tokens/ts/brand-themes/`.

Visual merge chain: `DS base -> vertical baseline -> BrandTheme -> generated artifacts`

- `BrandTheme` owns: palette, typography, surfaces, motion, charts, chrome (sidebar, layout, shell, controls, table), engineBridge
- `TenantConfig.brandTheme` is the canonical field. Legacy `personality`/`tokenOverrides` fields are deprecated compat.
- Product profile is **not** part of the visual merge when brandTheme is present — only `surfaceDefaults` survives.
- First-party tenant CSS files are **generated snapshots**, not the source of truth.
- Domain-specific tokens (`--ds-ticket-*`, `--ds-event-*`) belong in consuming apps, not DS core.
- The brand compiler (`runtime/brand-compiler/`) converts BrandTheme to legacy shapes for runtime and static generation.
