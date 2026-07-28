# W1 state (static path)

## Phase 0 (verify)
- `git status --porcelain` on all authorized areas + `contracts/composition/tenants/themes/index.ts`
  + `scripts/build-vertical-artifacts.mjs` + `scripts/build-vertical-css.mjs`: ALL CLEAN (exit 0, no output).
- None of them appear in phase0-uids-porcelain.txt.

## Design decisions taken before editing
- `color-scheme` is NOT a custom property, so it must not enter `CompiledBrand.cssVariables`
  (documented as "CSS variable map"; consumed by brand-studio inline styles and by
  visual-config's light block). Instead: `CompiledBrand.colorScheme` (new field) +
  `RenderVerticalArtifactInput.colorScheme`. This costs ONE line in
  `scripts/build-vertical-artifacts.mjs` (clean file, not in the census, not one of the 5
  dirty scripts) to forward `compiled.colorScheme`. Recorded as a deliberate, minimal
  out-of-listed-area edit.
- AD-6 font guard: `--ds-font-family-mono` is deliberately NOT Arabic-safed by the compiler
  (code faces carry no Arabic). A literal "any --ds-font-family-*" guard would fail all
  three themes. The contract constant therefore declares BOTH the mandatory fallback family
  AND the text-bearing channels it governs (base/heading/display) — exactly the channels
  `withArabicSafeFallback` already covers.

## Step 1-2 DONE (contract + compiler + renderer)
Files modified:
- `foundation/contracts/composition/tenants/themes/index.ts` — new `BrandAppearance {defaultMode}`,
  `BrandTheme.appearance?`, `CompiledBrand.colorScheme?`.
- `foundation/kernel/typography/index.ts` — exported `MANDATORY_FONT_FALLBACK_FAMILY`,
  `MANDATORY_FALLBACK_FONT_CHANNELS` (base/heading/display), `hasMandatoryFontFallback()`.
- `infrastructure/compilers/kernel/runtime/brand-theme/index.ts` — `assertMandatoryFontFallback()`
  (AD-6 guard, fail-closed), `buildCssString(..., colorScheme)`, returns `colorScheme`.
- `infrastructure/compilers/runtime/tenant-css/artifact-renderer/index.ts` — rottay selector
  `html[data-tenant='rottay'][data-theme='light'], html[data-tenant='rottay'].light`
  → `html[data-tenant='rottay']`; `colorScheme` input emitted first in the compiled block.
- `brand-themes/{bithire,evnto,platform}/index.ts` — `appearance: { defaultMode }`
  (light / light / dark).
- `scripts/build-vertical-artifacts.mjs` — ONE line: `colorScheme: compiled.colorScheme,`.

Verified from source: bithire/evnto light, rottay dark; all three PASS the AD-6 font guard
(base/heading/display all carry `"Noto Sans Arabic"`); rottay selector now unconditional.

## Tooling note (BLOCKER worked around, not deferred)
`scripts/build-vertical-artifacts.mjs` imports `../dist/`, and dist is FROZEN (AD-9 / no
package build). Running it now would compile the OLD dist compiler against the NEW extension
sources — silently changing pixels. Built
`r1p/scripts/{source-loader,build-artifacts-from-source}.mjs`: same inputs, same renderer,
same APCA gate, resolved from `src/` through vite SSR. Verified BEFORE any edit that it
reproduces all three committed artifacts byte-identically (`--check` green), so it is a
validated stand-in for a freshly built dist.

## Step 3 DONE (mechanical migration)
Scripts (all in r1p/scripts/, reproducible): `probe-theme-paths.mjs` (sentinel-probes every
BrandTheme leaf and records which channels emit it VERBATIM — this is both the var→field map
and the AD-1 "can the contract hold this value" test), `plan-migration.mjs`,
`ts-object-index.mjs` + `apply-ts-sets.mjs` (span-accurate TS writes),
`migrate-extensions.mjs`, `dedupe-color-scheme.mjs`, `effective-map.mjs` +
`compare-effective.mjs` (pixel-preservation acid test).

Counts (extension declarations removed / BrandTheme fields set / capability gaps):
- bithire: -60 decls (20 A duplicates + 40 B adopted), 39 fields set, 2 gaps.
  Plus CLEAR MODE GUARD region DELETED: 1 banner + 2 rules + 207 declarations.
- evnto:   -81 decls (79 A duplicates + 2 font rows where COMPILED wins), 0 fields, 0 gaps.
- rottay:  -190 decls (180 byte-identical to compiled + 10 adopted), 10 fields set, 77 gaps.
  Plus 1 duplicate `color-scheme: dark`.
Totals: 331 extension declarations deleted, 49 BrandTheme fields adopted, 79 capability gaps.

AD-2 headers: 29 declared regions in bithire (6 capability-gap, 1 mode-block, 15
component-local, 3 media, 2 reduced-motion, 2 structural), 2 in evnto, 2 in rottay.

PIXEL-PRESERVATION ACID TEST (effective root map, before vs after, per state):
- bithire default/light: +1 (`color-scheme`), 10 textual deltas — ALL verified equal after
  one-level var() resolution (8 rows) or pure whitespace tidy inside color-mix() (6 rows).
  ZERO real value changes.
- bithire dark: -94 / ~86 — the CLEAR MODE GUARD deletion, authorized by AD-3. Dark now
  serves the BITHIRE DARK MODE palette instead of the reverted-light one.
- evnto default/light: +1 (`color-scheme`), 2 changed = the two font families regaining
  `"Noto Sans Arabic"` (the AD-1 deliberate exception / i18n regression fix). dark identical.
- rottay default: +195 added, 0 changed, 0 dropped — the de-gated compiled block now supplies
  channels that had no base-state author, and NOT ONE existing value moved. light identical.

## Steps 4-8 DONE
- AD-6 font guard lives in `foundation/kernel/typography` (`assertMandatoryFontFallback`,
  `MANDATORY_FALLBACK_FONT_CHANNELS` = base/heading/display, `MANDATORY_FONT_FALLBACK_FAMILY`);
  compileBrandTheme calls it fail-closed. All three themes PASS.
- Provenance gate `scripts/artifact-provenance-gate.mjs` + `.baseline.json` + `.test.mjs`.
  Reads the compiler-emitted channel set from the ARTIFACT's compiled block, not dist.
  GREEN on the real tree; baseline bithire 2 / evnto 0 / rottay 77 (decrease-only).
  Registered blocking in ci-gates.manifest.mjs (gate + drill); run-ci-gates.test.mjs green.
- ROOT FIX (found by a failing test, not planned): three call sites hand-assembled
  RenderVerticalArtifactInput (build script, generated-artifacts test, my source script), so
  the new colorScheme field reached one of them. Collapsed into
  `renderFirstPartyArtifact(spec, brandTheme, extensionCss)` in the artifact-renderer;
  all three now call it.
- Tests: T1/T11/T12 (8) + AD-6 guard (6) + gate drills (10) + manifest drill (10) all green.
- Pre-existing tests re-anchored (values changed because the extension shadow was removed):
  first-party-artifacts-parity (3 entries only existed in the deleted CLEAR MODE GUARD),
  premium-regression (button primary color / secondary border), i0-inventory (button default bg).

## BLOCKER for W4 (must be in the handoff)
`node scripts/build-vertical-artifacts.mjs --check` now FAILS with
`does not provide an export named 'renderFirstPartyArtifact'` because dist/ is frozen
(AD-9). This is loud-by-design: before the change it would have run against the stale dist
and silently rewritten the artifacts with the OLD compiler. W4's serial chain must rebuild
dist (`pnpm -C packages/core build`, which sequences build:vertical-css anyway) before the
dist-backed gates. Source-equivalence is proven: the source generator reproduced all three
committed artifacts byte-identically BEFORE any edit, and `--check` is green now.
