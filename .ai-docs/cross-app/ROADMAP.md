# Improvement Roadmap

**Date**: 2026-03-24

---

## Phase 1: Full Engine Compatibility (all chrome multi-engine)

### Goal
When a tenant switches engine, 100% of the UI adapts -- not just tables but headers, stats, toolbar, filters.

### Actions
1. **Platform**: Replace CommandHeader with PatternCockpitHeader (44 surfaces)
2. **Platform**: Replace DataTerminalCard with PatternStatsGrid (39 surfaces)
3. **Platform**: Replace TableToolbar with PatternListToolbar (13 surfaces)
4. **Platform**: Replace StatusFilterPills with PatternFilterPanel (13 surfaces)
5. **Platform**: Remove TablePagination, use PatternDataTable built-in (16 surfaces)
6. **BitHire**: Replace CommandHeader with PatternCockpitHeader (32 surfaces)

### Result
All 3 apps fully engine-adaptive. A tenant switching from classic to modern sees everything change.

---

## Phase 2: Pattern DRY (shared hooks in DS)

### Goal
No copypaste between apps. Shared logic lives in DS.

### Actions
1. Move `useListController` from app-level to DS (both evnto and bithire use it)
2. Ensure `useTenantBranding` is used by all 3 (platform still uses server-side DB query)
3. Create `useSurfacePermissions` in DS (platform already has it locally)
4. Create `useSurfaceFocusMode` in DS (platform already has it locally)

---

## Phase 3: Surface Depth (DS Surfaces everywhere)

### Goal
All apps use DS Surface components for page composition, not just patterns.

### Actions
1. Evaluate whether ListSurface/DetailSurface should wrap PatternDataTable+useListController
2. If yes: migrate evnto and bithire list surfaces to use DS ListSurface
3. If no: document that apps can choose between Surface-level and Pattern-level composition

### Decision Point
Is the Surface layer (ListSurface, DetailSurface) valuable, or is Pattern-level (PatternDataTable + PatternCockpitHeader + PatternListToolbar) sufficient?

Arguments for Surfaces:
- Unified chrome (title, breadcrumbs, loading, error, empty)
- Less boilerplate per page
- DS controls layout consistency

Arguments for Patterns:
- More flexibility per page
- Apps can compose their own layout
- Already working in evnto/bithire

---

## Phase 4: Custom Engine Packs

### Goal
Tenants can register custom component implementations.

### Actions
1. Expose custom engine pack API to tenants
2. Build a pack builder UI in the settings/whitelabel page
3. Allow tenants to override specific components (e.g., custom Card, custom Table)

### Already Built
The DS already has `custom` engine with pack-scoped registry. Just needs app-level integration.

---

## Phase 5: Personality Editor

### Goal
Tenants can live-preview personality changes (animations, typography, density, etc.)

### Actions
1. Wire tenantOverrides to a live editor component
2. Use DesignSystemProvider's onTenantResolved callback for real-time updates
3. Build personality presets (formal, playful, minimal, expressive)

### Already Built
- DesignSystemProvider accepts tenantOverrides
- Personality token system exists with full type definitions
- WhitelabelSettingsSurface exists (needs SECTION_PATHS fix)

---

## Phase 6: Visual Regression + CI

### Goal
Every PR is validated against visual regression.

### Actions
1. Add Playwright screenshot comparison to CI
2. Create baseline screenshots for each engine
3. Block PRs that introduce unintended visual changes
4. Add build time + bundle size tracking
