# W2 state (DB path — visual-config legacy compatibility compiler)

Target file: `packages/core/src/infrastructure/compilers/runtime/tenant-css/visual-config/index.ts`
Tests: `.../visual-config/tests/generator.test.ts` (+ new files in that folder).

## Step 0 — mandatory reads + phase check DONE
- Read AD-4 (REFINED), AD-7 T5-T8, w1-state.md. dist/ is FROZEN and stale: no script that
  imports `../dist/` was run, and none will be.
- W1's files (brand-theme compiler, artifact-renderer, contracts, typography kernel,
  brand-themes) read as ground truth, not modified.
- `composition/tenant-theme` (canonical v1) confirmed structurally immune — NOT touched.
  Note: its real path is `src/infrastructure/compilers/composition/tenant-theme/index.ts`
  (not `.../runtime/tenant-css/composition/...` as the brief wrote); the APCA hookup is at
  lines 1405-1409 and reads `compileAppearanceVariables(normalizedAppearance)` whose output
  IS the whole v1 variable map — i.e. v1 already runs APCA over its FINAL map.

## Step 0b — measured collision census (probe, before any edit)
Fixture = the bug-triggering shape (branding + brandTheme seeds primary/secondary/accent,
NO appearance), seeds `#3A6FB0` / `#0F766E` / `#8B5CF6`:

- `compiledBrandVars` vs legacy `brandingVariables()`: **30 colliding keys**
  (`--ds-color-{primary,secondary,accent}-{50..900}`), legacy winning all 30.
  `--ds-color-primary-500`: compiled OKLCH `#386DAD` | legacy sRGB `#3A6FB0`.
  SHIPPED TODAY = `#3A6FB0` (the sRGB one) — bug reproduced from source.
  The bare `--ds-color-{role}` keys are also dual-emitted but agree by value
  (legacy scale[500] === normalizeHexColor(seed)), so they are a silent dual
  emission rather than a visible divergence.
- `compiledBrandVars` vs `tokenOverrideVariables()`: **2 collisions**
  (`--ds-density-scale` 0.9→1.2, `--ds-radius-md` 10px→18px) — these are the DOCUMENTED
  tenant-compat precedence ("tenant compat fields then override palette/structure"),
  not the bug.
- `compiledBrandVars` vs `personalityVariables()`: 0 on that fixture, but **3 on a
  chrome-rich BrandTheme** (`--ds-card-shadow`, `--ds-card-shadow-hover`,
  `--ds-card-border`) — also documented compat precedence.

Consequence for the assertion design: a blanket "compiled vs baseDeclarations" throw would
fire on legitimate compat overrides for real tenants. Scope is therefore declared per layer
(see Step 3).

## REFINEMENT of AD-4 §1 (recorded, NOT a silent deviation)
AD-4 §1 read literally ("brandingVariables must stop emitting the overlap set") deletes the
palette for every tenant that has legacy `branding` colors and NO `brandTheme`: nothing else
emits `--ds-color-{role}[-step]` for them (`compiledBrandVars` is `{}` without a brandTheme),
so they would silently fall back to the DS default palette. AD-4's own stated visual
consequence is a VALUE change ("OKLCH light ramps instead of sRGB"), not a disappearance,
and `buildPreviewCss()` (brand studio) accepts a TenantConfig with no brandTheme at all.
Implemented reading: **legacy emits a ramp/bare-role channel only where the OKLCH compiler
did not** — single emitter per key by construction, zero behavior loss for brandTheme-less
tenants, and the compiled OKLCH value wins wherever the compiler authored one.

## Step 5 (reachability) DONE — answered, no code change
The legacy path does NOT run for a tenant carrying a compiled v1 artifact:
- `TENANT_THEME_V1_COVERAGE` (contracts/.../tenant-theme) = `visual-branding`,
  `token-overrides`, `appearance`, `brand-chrome`.
- `resolveCompiledEnvelope()` returns `suppressedChannels: coverage`, so `brand-chrome`
  is always suppressed under `visualAuthority={{authority:'compiled-artifact', …}}`.
- bootstrap provider `index.tsx:617-623`: `generatedTenantCss` returns `undefined` when
  `suppressedChannels.includes('brand-chrome')`.
Reachable consumers of the buggy path are therefore exactly:
1. the provider for a DB tenant with `brandTheme` and NO compiled artifact declared
   (`origin: 'db-tenant'` or explicit `visualAuthority="provider"`), non-bundled slug;
2. `buildPreviewCss()` — the brand-studio tenant preview (highest-visibility consumer,
   and the only one reachable with no brandTheme at all);
3. the public `generateTenantCss` / `generateTenantCssFile` build-time exports.

## Step 1 DONE — light overlap fix (single author per palette channel)
`brandingVariables(config, compilerOwnedChannels)` now skips any
`--ds-color-{role}` / `--ds-color-{role}-{step}` the compiled map already wrote.
The four legacy-only channels (`--ds-color-primary-foreground`, `--ds-color-link`,
`--ds-color-link-hover`, `--ds-color-border-focus`) are still written unconditionally
from the internal `buildRuntimeScale` (verified by grep: the brand compiler emits none of
them), so an unexpected future compiler claim trips the assertion instead of being
silently swallowed. `buildRuntimeScale` is NOT deleted (AD-4 §5 debt kept).

EVIDENCE (bug-triggering fixture, seed #3A6FB0):
  `--ds-color-primary-500` BEFORE `#3A6FB0` (sRGB) → AFTER `#386DAD` (OKLCH).
  All 30 ramp keys of the 3 seeded roles now equal `deriveTenantColorRamps` exactly.

## Step 2 DONE — dark ramps kept, exception declared
`darkBrandingVariables` carries an `@ds-exception kind=capability-gap … reachability=mode:dark
retire="until OKLCH dark ramp derivation exists"` header. No dark OKLCH derivation invented.

## Step 3 DONE — fail-closed light merge
`assertSingleLightEmitter(compiledBrandVars, layers, slug)`, called before
`lightDeclarations` is built. Layers declare authority: `legacy-branding` = exclusive,
`tenant-token-overrides` + `tenant-personality` = compat, `appearanceVars` not a layer
(sanctioned final authority). Throws with the full offending key list when (1) an exclusive
layer re-declares a compiled channel at all, or (2) ANY layer re-declares a palette channel.
Scope justified by the Step 0b census: a blanket compiled-vs-baseDeclarations throw would
fire on the 2 documented tokenOverride overrides and the 3 documented personality/card-chrome
overrides that real tenants depend on.

## Step 4 DONE — APCA over the shipped map
`withEnforcedTextContrast(map, backgroundMode)` wraps BOTH final `lightDeclarations` and
`darkDeclarations`, replacing the appearance-slice-only pass (mirrors v1's
compileAppearanceVariables-over-the-whole-map at composition/tenant-theme:1405-1409).
Light mode is read from `appearance.general.palette.backgroundMode`, else from
`isDarkSurfacePalette(brandTheme.palette)` — otherwise a dark-surface theme's near-white ink
would be "corrected" to near-black against the default light ground. Dark block is always
'dark'. Empty map short-circuits (no autocorrected noise for an unauthored tenant).
Declaration ORDER is preserved (the pass only rewrites keys it was given).

## Tests (single-file, one command at a time, all --project unit unless noted)
- generator.test.ts (pre-existing)                      14/14 PASS, exit 0, ZERO re-anchors
- single-emitter.test.ts (NEW, T5+T6)                    8/8  PASS, exit 0
- text-contrast-composition.test.ts (NEW, T7)            6/6  PASS, exit 0
- tenant-divergence-matrix.test.ts (T8, read-only)      36/36 PASS, exit 0
- brand-compiler.test.ts (heaviest consumer)            42/42 PASS, exit 0
- preview-css.test.ts                                    6/6  PASS, exit 0
- tenant-preview.test.tsx                               15/15 PASS, exit 0
- QRCode __pass2_specimens.test.tsx                      1/1  PASS, exit 0
- provider visual-authority.integration.test.tsx         7/7  PASS, exit 0
Probe file zz-probe.test.ts deleted after use.

## NOT DONE (deliberate)
- No typecheck / no suite / no build run (agent law). Source types were checked by reading
  the contracts: `backgroundMode?: "light"|"dark"|"auto"` matches `TextContrastBackgroundMode`
  exactly; `isDarkSurfacePalette(palette: BrandPalette|undefined)` accepts undefined.
- `buildRuntimeScale` not deleted; dark OKLCH derivation not invented; composition/tenant-theme
  untouched; nothing outside visual-config/** modified.
