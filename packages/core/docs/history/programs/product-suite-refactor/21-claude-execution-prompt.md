# Claude Execution Prompt — Rotate Quality Program R0-R9

Copy this entire file as a prompt to Claude Code to begin execution.

---

## Mission

Execute the Rotate quality-reset program across `ui-design-system`, `app-platform`, `app-evnto`, and `app-bithire`.

Read these files first (mandatory):

- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/rotate-execution-playbook/20-master-implementation-plan.md`
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/rotate-execution-playbook/00-definition-of-done.md`
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/TENANT_MODEL.md`
- `/Users/daniel/Developer/Rottay/ui-design-system/CLAUDE.md`

Take the visible Rotate MVP path from "functional but under-authored" (~5.2/10) to truthful flagship quality (7.0+/10).

This is NOT a token-expansion task. This is a product-quality, system-ownership, and contract-honesty program.

---

## Non-Negotiable Rules

1. Bundled first-party verticals are file-first. No DB for `rottay`/`bithire`/`evnto`.
2. DB tenants are bounded via `appearance.general`. No unbounded tokenOverrides.
3. Shell ownership moves into the DS via `structures/shell/AppShell`.
4. Do not invent new contract surface without a real runtime reader.
5. Do not start with a schema migration. `whitelabelConfigs.config` JSONB is sufficient.
6. Prefer fewer stronger primitives over more one-off local surfaces.
7. Prefer deletion and simplification over addition.
8. Every wave must leave the codebase deployable.

---

## Execution Waves

Execute in this order. After each wave, produce a STOP report.

### R0 — Freeze The Truth (verify only, no code)

Verify these 8 checks pass:
1. `docs/TENANT_MODEL.md` is canonical (two tenant classes, merge chain, narrowed fields)
2. `foundation/contracts/composition/tenants/themes/index.ts` BrandTheme contract is stable (no TODO for structural changes)
3. TenantAppearance narrowed fields match TENANT_MODEL doc
4. `foundation/tokens/ts/presentation/brand-themes/platform/index.ts` exports cleanly
5. 4 bundled tenants listed; 3 have brand themes
6. North-star: dark-first, low-gloss, hierarchy through weight not decoration
7. `foundation/tokens/css/presentation/components/card.css` has 90+ stable tokens
8. Rottay artifact defines `--ds-statistic-{title,value,prefix,suffix}-color`

### R1 — Rotate Visual Direction Reset (DS only)

Priority order:

**R1-P1: Statistic token fidelity** (~40 lines, 3 files)
- Wire `--ds-statistic-*` tokens into modern engine (currently uses zero)
- Replace VALUE_TYPE_STYLE_MAP colors with `--ds-statistic-{value,positive,negative,warning}-color`
- Replace title/value fontSize/fontWeight with `--ds-statistic-title-font-size` etc.
- Add prefix/suffix color tokens
- Apply same to Countdown component
- Fix CSS_VARS in Statistic.types.ts (`--statistic-*` -> `--ds-statistic-*`)
- Create `foundation/tokens/css/presentation/components/statistic.css` with full surface

**R1-P2: Simplify CollectionHeader** (~115 lines, 1 file)
- DELETE grid overlay (lines ~108-121)
- DELETE gloss overlay (lines ~123-132)
- DELETE accent bar (lines ~170-180)
- SIMPLIFY root background to `var(--ds-surface-card)`
- TOKENIZE: hero fontSize 36 -> `var(--ds-font-size-4xl)`, subtitle 12 -> `var(--ds-font-size-sm)`, padding -> spacing tokens
- DIFFERENTIATE chip hierarchy: eyebrow (subtle bg), meta (border), shortcuts (ghost)

**R1-P3: Simplify SearchCommandBar** (~90 lines, 1 file)
- DELETE grid overlay (lines ~359-373)
- DELETE gloss overlay (lines ~374-383)
- SIMPLIFY root background to `var(--ds-surface-card)`
- SIMPLIFY search input pill: flat `var(--ds-surface-panel)`, `var(--ds-elevation-2)` shadow
- SIMPLIFY suggestion chip: flat background + border token

**R1-P4: Strengthen Card material ladder** (~20 lines, 1 file)
- Wire VARIANT_STYLES to `--ds-card-*` tokens (elevated border, shadow, hover)
- Wire outlined border to `--ds-card-border-color`
- Wire filled bg to `--ds-card-flat-bg`

**R1-P5: Update Rottay brand theme** (~15 lines, 1 file)
- Remove `chrome.shell.gridSize/gridLine/gridOpacity`
- Add `surfaces.surface` object (card, panel, canvas, inset hex values)

### R2 — DS Shell Contract (DS + all apps)

Build `structures/shell/` with:
- `types/index.ts` — ShellConfig, ShellIdentityConfig, ShellNavigationConfig, ShellTopbarConfig, ShellAccountConfig, ShellVisualOverrides
- `app-shell/index.tsx` — main component (sidebar + header + content, collapse, mobile overlay)
- `shell-sidebar/index.tsx` — sidebar chrome, scroll area, footer
- `shell-header/index.tsx` — sticky header with center/actions/leading/subHeader slots
- `shell-navigation/index.tsx` — accordion menu from ShellNavGroup[]
- `shell-identity/index.tsx` — logo + product label
- `shell-account-card/index.tsx` — user card + dropdown
- `shell-context/index.tsx` — collapsed state + metrics provider

Add geometry tokens to `default.css`:
```css
--ds-shell-sidebar-width, --ds-shell-sidebar-collapsed-width,
--ds-shell-header-height, --ds-shell-content-padding, --ds-shell-sidebar-transition
```

Then migrate apps in order: Platform -> BitHire -> Evnto.
- Platform: rewrite AppLayout to `<AppShell config={shellConfig}>`, delete shell-metrics.ts
- BitHire/Evnto: same pattern, simplify sidebar/header to adapters

### R3 — Dashboard Control Room Rebuild (DS + platform)

Create 4 DS structures: `control-room-headline`, `attention-panel`, `compact-actions-rail`, `signal-card`.

Recompose `builder/index.tsx` from 2,976 lines to ~800-1,000:
- Collapse hero from 465 lines to ~120 (one headline + one attention panel)
- Delete 9 inlined card types (~1,200 lines) in favor of DS signal-card
- Move preset/mode picker into GlobalFilterBar

### R4 — Data Workspace Rebuild (DS + platform)

DataTable.Modern keyboard + a11y:
- Add `aria-sort` to sortable columns
- Add keyboard sort activation (Enter/Space on headers)
- Add arrow-key row navigation, `role="grid"`
- Add `primaryColumn` flag (bolder, left-accent, hover-reveal action)
- Add `cellEmphasis` per-column

SearchCommandBar: evolve `suggestions` to `operatorPresets` with structured filters.

### R5 — Tenant Admin Normalization (platform only)

Create `actions/tenancy/appearance/index.ts` that writes `TenantAppearanceGeneral` to `config.appearance.general` via `updateWhitelabelConfig()`.

Rewrite Branding tab in `settings/overview.tsx` to call new action.
Add form fields: density, buttonStyle, elevation, sidebarTone, backgroundMode.
Mirror to legacy branding fields for backward compat.
Deprecate `updateBranding()`.

### R6 — Adapter Cleanup (platform + DS docs)

Update `buildBrandingResponse()`: read `config.appearance.general` first, fall back to legacy.
Simplify `brandingToTenantConfig()`: prefer `branding.appearance`, extract legacy synthesis as shim.
Add `appearance` to public API response (additive).
Update deprecation table in TENANT_MODEL.md.

### R7 — Cross-App Coherence (DS + all apps)

DS: create `createAppTenantResolver` factory, promote `brandingToTenantConfig` to DS/server.

All apps:
- Standardize provider order: DSP outermost
- Add `NavigationLinkProvider` to evnto/bithire
- Add `isKnownTenant()` check to evnto/bithire layouts
- Remove Platform `forceEngine`
- Platform: migrate fonts to `next/font/google`, remove separate `styles/modern` import

### R8 — Guardrails, Tests, Docs (DS)

Create 4 test/guardrail files:
1. `host-tenancy-boundary.test.ts` — bundled short-circuit, DB normalization, artifact existence
2. `token-fidelity.test.ts` — static analysis: modern engines reference `--ds-{component}-*` tokens
3. `modern-appearance-behavior.test.tsx` — provider renders vars on primitives, engine switch
4. `audit-shell-ownership.mjs` — DS shell inventory, host pattern detection

Add 3 rules to `audit-integration.mjs`: token consumption ratio, stale doc overclaim, deprecated field usage.

Docs truth pass: add datestamps, deprecation warnings, historical snapshot banners.

### R9 — Final QA + Re-Score

Visual QA checklists (dashboard 8 checks, workspace 8 checks, cross-app 7 checks).
Re-score 120-point rubric. Target: aggregate 7.0+/10.
Write results to `docs/quality-reset-audit/17-r9-rescore-results.md`.

---

## STOP Report Format (after every wave)

```
Wave: R{N} — {name}
Commit: {hash}
Repos changed: {list}
Files changed: {list with +/- lines}
Runtime-visible gains: {what changed visually or behaviorally}
Ownership shifts: {what moved from app to DS or vice versa}
Contract changes: {added/removed/narrowed fields}
Tests added: {count and what they prove}
Docs updated: {list}
Remaining deferrals: {what was explicitly deferred}
Rubric dimensions improved: {which ones and why}
```

---

## Key Constraints

- No Co-Authored-By in commits
- No emojis
- Conventional commits: `type(scope): description`
- Author: davila23 <daniel.avila@rottay.com>
- Never use `git checkout --` on directories
- Do not add features beyond what each wave specifies
- Every wave must leave a deployable state
- No new contract surface without a real runtime reader
