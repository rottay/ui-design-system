# Master Implementation Plan — R0 through R9

Generated from 6 parallel deep-code-inspection agents covering all mandatory files
from the rotate execution playbook.

Baseline: visible Rotate ~5.2/10, shell ~4.4/10, dashboard ~4.6/10, workspace ~5.4/10,
tenancy ~5.8/10, cross-app ~4.9/10, guardrails ~5.4/10.

Target: aggregate 7.0+ / 10.

---

## Execution Order and Dependencies

```
R0 (freeze)
 |
 +---> R1 (visual reset)  ----+
 |                             |
 +---> R2 (shell contract) ---+---> R3 (dashboard) ---> R4 (workspace)
                               |
                               +---> R5 (admin)  ---> R6 (adapter)
                                                        |
                                                        +---> R7 (cross-app)
                                                               |
                                                               +---> R8 (guardrails)
                                                                      |
                                                                      +---> R9 (QA)
```

R1 and R2 can run in parallel after R0.
R3 depends on R1 (visual primitives) and R2 (shell contract).
R4 depends on R1.
R5 is independent of R1/R2 but logically follows R0.
R6 depends on R5.
R7 depends on R2 (shell contract) and R6 (unified adapter).
R8 depends on R1-R7 for meaningful assertions.
R9 depends on R8.

---

## R0 — Freeze The Truth

**Scope:** Verification only, no code changes.

| # | Check | File | Pass Criteria |
|---|-------|------|---------------|
| 1 | TENANT_MODEL.md canonical | `docs/TENANT_MODEL.md` | Two tenant classes, merge chain, removed fields documented |
| 2 | BrandTheme contract stable | `foundation/contracts/composition/tenants/themes/index.ts` | No TODO/FIXME for structural changes |
| 3 | TenantAppearance matches TENANT_MODEL | `foundation/contracts/composition/tenants/themes/index.ts` | Removed/narrowed fields match doc table exactly |
| 4 | Rottay brand theme exports cleanly | `foundation/tokens/ts/presentation/brand-themes/platform/index.ts` | All BrandTheme fields populated |
| 5 | 4 bundled tenants listed | Brand-themes index + TENANT_MODEL | rottay, bithire, evnto have themes; themanagementmiami documented as missing |
| 6 | North-star visual direction locked | Verbal/doc | Dark-first, low-gloss, hierarchy through weight not decoration |
| 7 | Card token surface stable | `foundation/tokens/css/presentation/components/card.css` | 90+ tokens, no pending removal |
| 8 | Statistic tokens in Rottay artifact | `foundation/tokens/css/facade/artifacts/rottay/index.css` | `--ds-statistic-title-color`, `--ds-statistic-value-color` etc. defined |

**Repos:** ui-design-system only.
**Estimated effort:** 1 hour.

---

## R1 — Rotate Visual Direction Reset

**Scope:** 6-7 files in ui-design-system, ~320 lines changed (mostly deletion).

### R1-P1: Fix Statistic Modern Token Fidelity (Low complexity)

**File:** `components/primitives/display/Statistic/engines/modern.tsx`

The modern engine uses **zero** `--ds-statistic-*` tokens. It uses generic foundation tokens
(`--ds-font-size-sm`, `--ds-color-success`) instead of the canonical component surface.

Changes:
- Replace `VALUE_TYPE_STYLE_MAP` colors with `--ds-statistic-{value-color,positive-color,negative-color,warning-color}` (fallback to current generic tokens)
- Replace title style `fontSize`/`color` with `--ds-statistic-title-font-size`/`--ds-statistic-title-color`
- Replace value style `fontSize`/`fontWeight` with `--ds-statistic-value-font-size`/`--ds-statistic-value-font-weight`
- Add `--ds-statistic-prefix-color`/`--ds-statistic-suffix-color` to prefix/suffix spans
- Apply same fixes to Countdown component (same bypass pattern)
- Fix `CSS_VARS` in `Statistic.types.ts` to use `--ds-statistic-*` prefix (currently `--statistic-*`)

**Also:** Create `foundation/tokens/css/presentation/components/statistic.css` declaring the full surface (currently tokens only in artifact files). Import from `components/index.css`.

~40 lines across 3 files.

### R1-P2: Simplify CollectionHeader (Medium complexity)

**File:** `components/structures/headers/collection/index.tsx`

3 decorative overlays + ~15 hardcoded px values.

Changes:
- **Delete** grid overlay (lines 108-121): `<Box aria-hidden>` with `linear-gradient` grid background
- **Delete** gloss overlay (lines 123-132): top-to-bottom gradient
- **Delete** accent bar (lines 170-180): 88px gradient underline
- **Simplify** root background: replace `linear-gradient(180deg, color-mix(...))` with flat `var(--ds-surface-card)`
- **Simplify** borderBottom: direct `var(--ds-color-border-subtle)` instead of `color-mix`
- **Tokenize**: hero title `fontSize: 36` -> `var(--ds-font-size-4xl, 36px)`, subtitle `fontSize: 12` -> `var(--ds-font-size-sm)`, padding `'18px 18px 14px'` -> `var(--ds-spacing-5) var(--ds-spacing-5) var(--ds-spacing-3)`
- **Differentiate chip hierarchy**: eyebrow (subtle bg, no border), meta (border, stronger tone), shortcuts (ghost, muted text only)

~115 lines (80 removed, 35 rewritten).

### R1-P3: Simplify SearchCommandBar (Medium complexity)

**File:** `components/structures/workspace/search-command-bar/index.tsx`

2 decorative overlays + 46 `color-mix()` ad-hoc expressions.

Changes:
- **Delete** grid overlay (lines 359-373)
- **Delete** horizontal gloss overlay (lines 374-383)
- **Simplify** root background to flat `var(--ds-surface-card)`
- **Simplify** search input pill: replace gradient background with `var(--ds-surface-panel)`, replace complex boxShadow with `var(--ds-elevation-2)`, simplify border to direct token
- **Simplify** suggestion chip: flat `var(--ds-surface-panel)` background, `var(--ds-color-border-subtle)` border
- **Move** keyframe animations out of inline `<style>` into CSS layer
- **Flag** voice help drawer (170 lines inline) for extraction in follow-up wave

~90 lines (60 removed, 30 rewritten).

### R1-P4: Strengthen Card Modern Material Ladder (Low-Medium)

**File:** `components/primitives/display/Card/engines/modern.tsx`

Card only wires 5 of ~90 `--ds-card-*` component tokens.

Changes:
- Wire `VARIANT_STYLES` to `--ds-card-*` tokens:
  - `elevated.border` -> `var(--ds-card-border-width, 1px) solid var(--ds-card-elevated-border-color, transparent)`
  - `elevated.boxShadow` -> `var(--ds-card-elevated-shadow, var(--ds-elevation-2))`
  - `outlined.border` -> `var(--ds-card-border-width, 1px) solid var(--ds-card-border-color, var(--ds-color-border-subtle))`
  - `filled.backgroundColor` -> `var(--ds-card-flat-bg, var(--ds-surface-panel))`
- Wire hover styles:
  - `elevated` hover: `var(--ds-card-elevated-shadow-hover)`, `var(--ds-card-interactive-transform-hover)`
  - `outlined` hover: `var(--ds-card-border-color-hover)`

~20 lines in modern.tsx.

### R1-P5: Update Rottay Brand Theme (Low complexity)

**File:** `foundation/tokens/ts/presentation/brand-themes/platform/index.ts`

Changes:
- Remove `chrome.shell.gridSize`/`gridLine`/`gridOpacity` (structures no longer consume grids)
- Add `surfaces.surface` object: `{ card: '#18181B', panel: '#131316', canvas: '#0C0C0E', inset: '#0D0D10' }`
- Consider `charts.tooltipStyle: 'solid'` instead of `'glass'` (north-star = no glass)

~15 lines.

### R1 Priority Order

R1-P1 and R1-P2 can proceed **in parallel**.
R1-P3 can proceed **in parallel** with R1-P2.
R1-P4 follows R1-P1 (statistic.css creation). Can overlap with P2/P3.
R1-P5 must be **last** (removes brand config that structures consumed).

**Repos:** ui-design-system only.
**Estimated effort:** 4-6 hours.

---

## R2 — DS Shell Contract

**Scope:** 11 new DS files, 6 modified DS files, ~8 modified app files, ~5 deleted app files.

### Current State

3 apps, 3 completely separate shell implementations:

| Metric | Platform | Evnto | BitHire |
|--------|----------|-------|---------|
| Sidebar expanded | 296px | 256px | 256px |
| Sidebar collapsed | 96px | 64px | 64px |
| Header height | 64px | ~56px | ~56px |
| Responsive | Desktop only | Show/Hide + overlay | Tailwind + hook |

DS already owns ~35 `--ds-sidebar-*` tokens per brand but **no shell structure component**.

### New DS Shell Contract

**Location:** `components/structures/shell/`

**Contract types** (`shell/types/index.ts`):
- `ShellConfig`: identity, navigation, topbar, account, route, visual overrides
- `ShellIdentityConfig`: name, logoSrc, logoMarkSrc, productLabel, href
- `ShellNavigationConfig`: groups -> items -> children
- `ShellTopbarConfig`: center slot, actions slot, leading slot, optional subHeader slot
- `ShellAccountConfig`: name, email, avatar, menuItems, onMenuAction
- `ShellVisualOverrides`: sidebarWidth, sidebarCollapsedWidth, headerHeight, variant

**Main component** (`shell/app-shell/index.tsx`):
```typescript
interface AppShellProps {
  config: ShellConfig;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  defaultCollapsed?: boolean;
  children: React.ReactNode;
}
```

**Internal components:**
- `ShellSidebar` — sidebar chrome, scroll area, footer
- `ShellHeader` — sticky header with slots
- `ShellNavigation` — accordion menu from nav tree
- `ShellIdentity` — logo + product label
- `ShellAccountCard` — user card + dropdown
- `ShellContext` — collapsed state, metrics provider

**New CSS tokens** (in `default.css`):
```css
--ds-shell-sidebar-width: 296px;
--ds-shell-sidebar-collapsed-width: 96px;
--ds-shell-header-height: 64px;
--ds-shell-content-padding: clamp(12px, 2vw, 24px);
--ds-shell-sidebar-transition: 220ms cubic-bezier(0.16, 1, 0.3, 1);
```

### Migration Plan (5 phases, incremental)

**R2a:** DS shell types + context + geometry tokens (no app changes)
**R2b:** DS shell components (ShellSidebar, ShellHeader, ShellNavigation, etc.)
**R2c:** Migrate app-platform (first consumer — rewrite AppLayout to `<AppShell>`, delete shell-metrics.ts)
**R2d:** Migrate app-bithire
**R2e:** Migrate app-evnto (update CLAUDE.md that previously said "shell NOT migrated")

### App stays app-owned

Navigation tree config, icon mapping, topbar content (GlobalSearch), account dropdown items/handlers, super admin badge, focus mode, RadialMenu/CommandPalette/FloatingChat, breadcrumb logic.

**Repos:** ui-design-system + app-platform + app-evnto + app-bithire.
**Estimated effort:** 12-16 hours.

---

## R3 — Dashboard Control Room Rebuild

**Scope:** 4 new DS structures + major recomposition of builder/index.tsx (2,976 -> ~800-1,000 lines).

### Current Problems

- `builder/index.tsx` is **2,976 lines** with 9 inlined card types
- Hero shell alone: ~465 lines of JSX (3 body paragraphs, Intel triptych, operating mode panel)
- 9 local card patterns: HeroMetric, SectionPanel, CompactSignalCard, InsightCard, BoardSignalPill, BriefingStatCard, IntelCard, PeekSignalButton, RankedLinkRow
- No single dominant attention panel

### Target Zone Layout

```
[A] Headline + Brief (compact, max 120px)
    Kicker badges + one headline sentence + inline alert indicator

[B] Primary Attention Panel (hero, 60% above-fold)
    Tabbed: Control Plane | Access Posture | Launch Readiness
    Compact stat strip at top, ranked signals in body

[C] Compact Actions Rail
    Preset picker (dropdown), resize, widget catalog, refresh, share

[D] Widget Grid (below fold, unchanged structurally)
```

### New DS Structures

| Structure | Location | Purpose |
|-----------|----------|---------|
| `control-room-headline/` | `structures/dashboard/` | Compact headline strip with kicker badges |
| `attention-panel/` | `structures/dashboard/` | Tabbed primary-attention panel with stat-strip header |
| `compact-actions-rail/` | `structures/dashboard/` | Action bar with overflow menu |
| `signal-card/` | `structures/dashboard/` | Consolidated card replacing 9 local types |

### App-Platform Changes

- `builder/index.tsx`: gut to ~800-1000 lines, import DS structures, delete ~1200 lines of local card components
- `global-filter-bar/index.tsx`: absorb preset picker and mode selection
- `builder/styles.css`: update layout classes

**Repos:** ui-design-system + app-platform.
**Estimated effort:** 10-14 hours.

---

## R4 — Data Workspace Rebuild

**Scope:** DataTable.Modern keyboard+a11y, typography rebalancing, operator presets.

### DataTable.Modern Keyboard Gaps (Critical)

Current state: **zero keyboard navigation**.
- No `aria-sort` on sortable columns
- No `tabIndex` or `onKeyDown` on `<th>` elements
- No row arrow-key navigation
- No `role="grid"` or `role="row"` beyond implicit table semantics
- Only keyboard-capable element: resize handles

### Changes

**DataTable.Modern** (`patterns/data/data-table/engines/modern/index.tsx`):
- Add `aria-sort` to sortable `<th>` (ascending/descending/none)
- Add `tabIndex={0}`, `role="columnheader"`, `onKeyDown` (Enter/Space to sort) to sortable headers
- Add `role="grid"` to table, arrow-key row navigation, Enter for row activation
- Add `primaryColumn` flag support: bolder font-weight, subtle left-border accent, hover-reveal action
- Add `cellEmphasis: 'primary' | 'secondary' | 'muted'` per-column typography control
- Add alternating micro-background for even rows (2% tint difference)
- Increase row separator contrast from `border-subtle` to `border-secondary`

**DataTable.types.ts**: Add `primaryColumn`, `cellEmphasis`, `onRowActivate` to ColumnDef.

**SearchCommandBar**: Evolve `suggestions` to `operatorPresets` with structured filter expressions:
```typescript
interface OperatorPreset {
  key: string;
  label: string;
  filters: Array<{ field: string; operator: string; value: unknown }>;
  sort?: { field: string; direction: 'asc' | 'desc' };
}
```

**users/workspace-config.tsx**: Migrate suggestions to operator presets, add `primaryColumn: true` to name column.

**Repos:** ui-design-system + app-platform.
**Estimated effort:** 8-10 hours.

---

## R5 — Tenant Admin Normalization

**Scope:** New action file + settings UI rewrite in app-platform.

### Key Finding

The DS pipeline is **already fully wired**: `appearance.general` -> `appearanceToVariables()` -> `ThemeProvider` CSS vars. The gap is that **nothing writes appearance natively to DB**.

### Steps

1. **New action** `actions/tenancy/appearance/index.ts`: typed `TenantAppearanceGeneral` payload, writes to `config.appearance.general` via `updateWhitelabelConfig()`, mirrors palette/typography to legacy `branding.*` for backward compat.

2. **Rewrite Branding tab** in `settings/overview.tsx`: replace `updateBranding()` with `updateAppearanceGeneral()`. Add new form fields: density, buttonStyle, elevation, sidebarTone, backgroundMode.

3. **Partial rewrite** `settings/whitelabel.tsx`: reroute 7-10 fields to `appearance.general`, ~10 to `appearance.advanced.chrome`, keep ~40 in legacy pending DS contract expansion.

4. **Rewrite** `tenants/branding.tsx`: switch to appearance action for visual fields, keep identity fields separate.

5. **Deprecate** `updateBranding()` in `workflows/index.ts` with `@deprecated` JSDoc.

6. **No schema migration needed.** `whitelabelConfigs.config` JSONB can hold `appearance.general` today.

**Risk:** Preview of appearance-first drafts won't render correctly until R6. Mitigated by mirroring to legacy fields.

**Repos:** app-platform only.
**Estimated effort:** 6-8 hours.

---

## R6 — Adapter and Public Contract Cleanup

**Scope:** Unify read path, update public endpoints, deprecation schedule.

### Steps

1. **Rewrite `buildBrandingResponse()`** in `get-tenant-branding.ts`: read `config.appearance.general` first, fall back to legacy `config.branding.*`. Add `appearance` to `TenantBranding` interface.

2. **Simplify `brandingToTenantConfig()`**: when `branding.appearance` exists (migrated tenant), use directly. Otherwise, call `synthesizeLegacyAppearance()` (extracted current synthesis logic). Remove TODOs for buttonStyle/sidebarTone (now read from appearance).

3. **Update public API shape**: `appearance` field added to response (additive, no breaking change). Existing `branding.*` preserved for backward compat.

4. **Update seed data**: add `appearance.general` alongside legacy fields in whitelabel config seeds.

5. **Deprecation table** added to TENANT_MODEL.md: `branding.primaryColor` -> `appearance.general.palette.primary`, etc.

**Repos:** app-platform + ui-design-system (docs only).
**Estimated effort:** 4-6 hours.

---

## R7 — Cross-App Coherence

**Scope:** 18 divergences across 5 axes. DS infrastructure + changes in all 3 apps.

### 18 Divergences Found

**Tenant resolution (6):** isKnownTenant missing in verticals, brandingToTenantConfig missing, header constant vs hardcoded string, different fallback chains, server vs client resolution, middleware architecture differs.

**DSP boot (5):** Provider nesting order differs (DSP outermost in Platform, nested in verticals), forceEngine only in Platform, locale strategy differs, no NavigationLinkProvider in verticals, different auth providers.

**CSS (3):** Platform imports 2 CSS files vs 1, font loading differs (link vs next/font), Platform globals.css has ~400 lines of shell CSS.

**Shell (3):** Three different responsive approaches, shell metrics hardcoded differently, server vs client layout rendering.

### Plan

**DS changes:**
- Create `createAppTenantResolver` factory in `@rottay/design-system/server`
- Promote `brandingToTenantConfig` to DS as shared utility with standardized `TenantBranding` interface

**Per-app alignment:**

| Step | Platform | Evnto | BitHire |
|------|----------|-------|---------|
| Tenant resolver | Migrate to factory | Migrate to factory + add isKnownTenant | Migrate to factory + add isKnownTenant |
| Provider order | Already correct | Reorder: DSP outermost | Reorder: DSP outermost |
| NavigationLinkProvider | Already present | Add | Add |
| CSS import | Remove separate `styles/modern` | Already correct | Already correct |
| Font loading | Migrate to `next/font/google` | Already correct | Already correct |
| Shell | Consumes AppShell (R2) | Consumes AppShell (R2) | Consumes AppShell (R2) |
| forceEngine | Remove (rely on registry) | Already absent | Already absent |
| Locale | Standardize precedence | Standardize precedence | Standardize precedence |

**Repos:** ui-design-system + app-platform + app-evnto + app-bithire.
**Estimated effort:** 8-10 hours.

---

## R8 — Guardrails, Tests, and Docs

**Scope:** 4 new test files, 1 new guardrail script, 3 new rules in existing script, 8 docs updated.

### New Test Files

| File | Category | What It Proves |
|------|----------|---------------|
| `system/tests/host-tenancy-boundary.test.ts` | Host-aware tenancy | Bundled tenants short-circuit, DB tenants normalize, artifacts exist |
| `system/tests/token-fidelity.test.ts` | Static analysis | Modern engines reference their canonical `--ds-{component}-*` tokens above minimum threshold |
| `system/tests/modern-appearance-behavior.test.tsx` | Provider behavior | Rendered Modern primitives consume appearance vars, engine switch produces different DOM |
| `scripts/audit-shell-ownership.mjs` | Guardrail | DS shell export inventory, host pattern detection, growth tracking |

### Guardrail Enhancements to `audit-integration.mjs`

- **Rule 5:** Token surface consumption ratio (flag under-consumed component token files)
- **Rule 6:** Stale doc overclaim detection (warn on "all primitives", "fully governed", "zero hardcoded")
- **Rule 7:** Deprecated field usage detection in new code (`personality`, `tokenOverrides` as config)

### Docs Truth Pass

| Doc | Action |
|-----|--------|
| `TENANT_MODEL.md` | Add verification datestamp |
| `reference/contracts/README.md` | Add deprecation warnings for personality/tokenOverrides |
| `galactic-integration-rubric/README.md` | Add "Historical Snapshot" banner |
| `modern-customization-audit/README.md` | Add "Status: Complete" banner |
| `modern-customization-audit/04-wave-plan.md` | Mark all M/F/A waves complete with dates |
| `quality-reset-audit/12-docs-tests-guardrails.md` | Update post-R8 |
| `rotate-execution-playbook/09-guardrails-and-release-gates.md` | Update implementation status |

**Repos:** ui-design-system.
**Estimated effort:** 6-8 hours.

---

## R9 — Final QA and Rubric Re-Score

**Scope:** Manual QA checklists + re-score of 120-point rubric.

### Visual QA Checklists

**Dashboard (8 checks):** Hero prioritizes meaning, card variants distinct, stats hierarchy, sidebar matches brand, dark mode, responsive, motion language, activity feed ordering.

**Workspace (8 checks):** Row scanability, header hierarchy, search premium feel, filter/sort keyboard access, bulk actions bar, row actions discoverable, empty state, tenant brand applied.

**Cross-app (7 checks):** All 3 boot clean, shell geometry DS-owned, engine switch works, brand tokens visible, sidebar tone differs per vertical, DB tenant bounded, dark mode identical.

### Target Scores

| Dimension | Baseline | Target |
|-----------|----------|--------|
| Visual Direction | 4.6 | 6.5+ |
| Brand Differentiation | 4.2 | 6.0+ |
| Shell Layout | 4.4 | 7.0+ |
| Dashboard | 4.5 | 6.5+ |
| Data Workspaces | 5.8 | 7.0+ |
| Modern Primitives | 5.4 | 7.0+ |
| Customization | 6.0 | 7.5+ |
| Accessibility | 5.1 | 6.5+ |
| Content Hierarchy | 5.0 | 6.0+ |
| Cross-App | 6.1 | 7.5+ |
| Architecture | 5.8 | 7.0+ |
| Docs/Tests/Guardrails | 6.2 | 8.0+ |
| **Aggregate** | **~5.2** | **~7.0+** |

**Output:** `docs/quality-reset-audit/17-r9-rescore-results.md`

---

## Complete File Inventory

### New Files (DS)

| Wave | File |
|------|------|
| R1 | `foundation/tokens/css/presentation/components/statistic.css` |
| R2 | `components/structures/shell/index.ts` |
| R2 | `components/structures/shell/types/index.ts` |
| R2 | `components/structures/shell/app-shell/index.tsx` |
| R2 | `components/structures/shell/shell-sidebar/index.tsx` |
| R2 | `components/structures/shell/shell-header/index.tsx` |
| R2 | `components/structures/shell/shell-navigation/index.tsx` |
| R2 | `components/structures/shell/shell-identity/index.tsx` |
| R2 | `components/structures/shell/shell-account-card/index.tsx` |
| R2 | `components/structures/shell/shell-context/index.tsx` |
| R2 | `components/structures/shell/tests/AppShell.test.tsx` |
| R3 | `structures/dashboard/control-room-headline/index.tsx` |
| R3 | `structures/dashboard/attention-panel/index.tsx` |
| R3 | `structures/dashboard/compact-actions-rail/index.tsx` |
| R3 | `structures/dashboard/signal-card/index.tsx` |
| R7 | Shared `brandingToTenantConfig` utility in DS/server |
| R7 | Shared `TenantBranding` interface in DS/server |
| R8 | `tooling/testing/system/tests/host-tenancy-boundary.test.ts` |
| R8 | `tooling/testing/system/tests/token-fidelity.test.ts` |
| R8 | `tooling/testing/system/tests/modern-appearance-behavior.test.tsx` |
| R8 | `scripts/audit-shell-ownership.mjs` |
| R9 | `docs/quality-reset-audit/17-r9-rescore-results.md` |

### New Files (Apps)

| Wave | File |
|------|------|
| R5 | `app-platform/src/actions/tenancy/appearance/index.ts` |
| R2 | `app-platform/src/composition/components/_shared/layouts/app-layout/shell-config/index.ts` |

### Modified Files (DS) — Key Only

| Wave | File | Change |
|------|------|--------|
| R1 | `Statistic/engines/modern.tsx` | Wire --ds-statistic-* tokens |
| R1 | `Statistic.types.ts` | Fix CSS_VARS prefix |
| R1 | `headers/collection/index.tsx` | Remove 3 overlays, tokenize, simplify |
| R1 | `search-command-bar/index.tsx` | Remove 2 overlays, simplify |
| R1 | `Card/engines/modern.tsx` | Wire --ds-card-* tokens to VARIANT_STYLES |
| R1 | `brand-themes/platform/index.ts` | Remove grid config, add surfaces |
| R2 | `structures/index.ts` | Add shell export |
| R2 | `foundation/contracts/composition/tenants/themes/index.ts` | Extend BrandChrome with shellGeometry |
| R2 | `foundation/tokens/css/foundation/themes/default.css` | Add --ds-shell-* geometry tokens |
| R2 | `foundation/tokens/css/facade/artifacts/{rottay,bithire,evnto}/index.css` | Add --ds-shell-* values |
| R4 | `data-table/engines/modern/index.tsx` | Keyboard nav, aria-sort, primaryColumn |
| R4 | `DataTable.types.ts` | Add primaryColumn, cellEmphasis |
| R4 | `search-command-bar/index.tsx` | Add operatorPresets |
| R7 | `runtime/tenant/resolution/resolve-request-tenant.ts` | Add createAppTenantResolver |
| R8 | `scripts/audit-integration.mjs` | Add Rules 5-7 |

### Modified Files (Apps) — Key Only

| Wave | File | Change |
|------|------|--------|
| R2 | `app-platform: app-layout/index.tsx` | Rewrite to use AppShell |
| R2 | `app-platform: sidebar/index.tsx` | Simplify to adapter |
| R2 | `app-platform: topbar/index.tsx` | Simplify to adapter |
| R3 | `app-platform: dashboard/builder/index.tsx` | Major recomposition (2976 -> ~800 lines) |
| R3 | `app-platform: dashboard/global-filter-bar/index.tsx` | Absorb preset picker |
| R4 | `app-platform: users/workspace-config.tsx` | Operator presets, primaryColumn |
| R4 | `app-platform: entity-table-workspace/index.tsx` | Toolbar simplification |
| R5 | `app-platform: settings/overview.tsx` | Branding tab -> appearance.general |
| R5 | `app-platform: settings/whitelabel.tsx` | Partial rewrite |
| R5 | `app-platform: tenants/branding.tsx` | Switch to appearance action |
| R6 | `app-platform: get-tenant-branding.ts` | Appearance-first read |
| R6 | `app-platform: branding-to-tenant-config.ts` | Prefer appearance, extract legacy shim |
| R7 | `app-platform: root layout.tsx` | Font migration, CSS consolidation |
| R7 | `app-evnto: providers/index.tsx` | Reorder providers, add NavigationLinkProvider |
| R7 | `app-evnto: layout.tsx` | Add isKnownTenant, TENANT_HEADER |
| R7 | `app-bithire: providers/index.tsx` | Reorder providers, add NavigationLinkProvider |
| R7 | `app-bithire: layout.tsx` | Add isKnownTenant, TENANT_HEADER |

### Deleted Files

| Wave | File | Reason |
|------|------|--------|
| R2 | `app-platform: shell-metrics.ts` | Geometry now from DS tokens |
| R2 | `app-platform: logo/index.tsx` | DS ShellIdentity handles this |
| R2 | `app-evnto: layout/main-content/index.tsx` | Shell handles content area |
| R2 | `app-bithire: layout/main-content/index.tsx` | Shell handles content area |

---

## Effort Summary

| Wave | Scope | Hours (est.) | Repos |
|------|-------|-------------|-------|
| R0 | Verification checklist | 1 | DS |
| R1 | Visual reset (6-7 files) | 4-6 | DS |
| R2 | Shell contract (25+ files) | 12-16 | DS + 3 apps |
| R3 | Dashboard rebuild (8 files) | 10-14 | DS + platform |
| R4 | Workspace rebuild (5 files) | 8-10 | DS + platform |
| R5 | Admin normalization (6 files) | 6-8 | platform |
| R6 | Adapter cleanup (5 files) | 4-6 | platform + DS docs |
| R7 | Cross-app coherence (12+ files) | 8-10 | DS + 3 apps |
| R8 | Guardrails + tests (12 files) | 6-8 | DS |
| R9 | QA + re-score | 2-3 | all |
| **Total** | | **~60-80** | |

## Fastest Path (Minimum Sequence for Visible Impact)

If speed matters:

1. **R0 + R1** (freeze + visual reset) — immediate visual improvement
2. **R5 + R6** (admin + adapter) — architectural honesty
3. **R2** (shell contract) — biggest structural win
4. **R3 + R4** (dashboard + workspace) — biggest visible quality jump
5. **R7** (cross-app) — coherence across verticals
6. **R8 + R9** (guardrails + QA) — lock the gains

This prioritizes visible quality first, then structural integrity, then durability.
