# BrandTheme → CSS compilation pipeline: capability map

Scope: `ui-design-system/packages/core`. All file:line references are read-only
observations; nothing in this repo was modified.

## 0. Pipeline actors (who calls whom)

- `compileBrandTheme` — `src/infrastructure/compilers/kernel/runtime/brand-theme/index.ts:975-1032`
  Pure function: `BrandTheme -> { cssVariables, cssString, personality, tokenOverrides, engineBridge, recipeProfile }`.
  This is the ONE emitter that turns `BrandTheme` fields into `--ds-*` CSS
  custom-property key/value pairs. Both consumption paths below call it.
- First-party path: `scripts/build-vertical-artifacts.mjs:116-127` calls
  `compileBrandTheme` then `renderVerticalArtifact` (artifact-renderer/index.ts:82-129)
  to produce `src/foundation/tokens/css/facade/artifacts/{bithire,evnto,rottay}/index.css`.
  `build-vertical-css.mjs` then concatenates that artifact into the shipped
  per-vertical bundle (unlayered, after base + modern engine).
- DB tenant path: `resolveTenantVisualConfig` (`visual-config/index.ts:130-189`)
  calls the SAME `compileBrandTheme` (imported at `visual-config/index.ts:14-20`),
  then `generateTenantCssFromResolvedVisualConfig` (`visual-config/index.ts:458-568`)
  wraps the resulting `cssVariables` in a differently-shaped, richer CSS string
  (light/dark/system-dark blocks) and layers a SEPARATE legacy color-scale
  generator and the Appearance compiler on top. See §4 for why this is a
  qualified "same emitter" answer, not a clean one.

## a. BrandTheme contract surface

Defined in `src/foundation/contracts/composition/tenants/themes/index.ts:77-1458`.

Top-level `BrandTheme` fields (line 77-101): `id`, `name`, `extends?`,
`palette?`, `typography?`, `surfaces?`, `motion?`, `charts?`, `recipes?`,
`chrome?`, `engineBridge?`.

- `palette` (`BrandPalette`, line 103-134): primary/secondary/accent +
  text(primary/secondary/muted/disabled) + border(primary/secondary) +
  dark twins (darkPrimary/darkSecondary/darkAccent/darkBackground) +
  backgroundColor + 4 semantic tones (success/warning/error/info). No `foreground`-on-X pairing beyond what's listed; no arbitrary color slots.
- `typography` (`BrandTypography`, 136-161): 4 font families, weight bias,
  heading letter spacing, label style (uppercase/sentence/capitalize),
  per-role type tokens (`roles: SemanticTypographyTokens`), per-context
  letter-spacing/line-height (display/heading/body/mono).
- `surfaces` (`BrandSurfaces`, 163-199): `surface`, `surfaceRoles` (semantic
  material roles: card/panel/control/raised/etc, each with
  background/backgroundHover/backgroundActive/backgroundSelected/
  backgroundDisabled/foreground/foregroundMuted/foregroundDisabled/border/
  borderStrong/borderHover/borderActive/borderSelected/borderDisabled/
  focusRing/shadow/shadowHover/shadowActive/shadowSelected/highlight/texture
  — see `semanticSurfaceRolesToCssVariables`, brand-theme/index.ts:346-434),
  `borderRadius` (sm/md/lg/xl), `shadows` (sm/md/lg/xl), `glass`, `gradients`,
  `overlays`, `densityScale` (numeric multiplier), `density` (semantic posture
  enum), `effectIntensity` (0-1 dial).
- `motion` (`BrandMotion`, 207-221, `@deprecated` open-ended shape):
  intensity, entrance type, entranceDuration, hoverLift/hoverScale,
  spring physics (tension/friction/useSpring), pulseSpeed, skeletonStyle,
  stagger delay/max, countUpEnabled. No arbitrary keyframes/loop topology.
- `charts` (`Partial<ChartPersonalityTokens>`, line 94): chart palette/animation
  posture only — not part of this audit's CSS-selector question.
- `recipes` (`BrandRecipeSelection`, 70-75): `schemaVersion` + a namespaced
  versioned `profile` id validated fail-closed against a closed first-party
  registry (`validateRecipeProfileSelection`, referenced at
  brand-theme/index.ts:1006-1012). Not a free-form CSS channel.
- `chrome` (`BrandChrome`, 223-272): 24 named component families — `card`,
  `accent`, `sidebar`, `layout`, `shell`, `toolbar`, `filterPill`, `badge`,
  `breadcrumb`, `search`, `controls` (buttonGeometry/fieldGeometry/segmented/
  10 button-variant blocks/disabled/focusRing/input), `table`, `cardComponent`,
  `metricCard`, `signalCard`, `workspaceCard`, `compactCard`, `tallCard`,
  `collectionCard`, `listingGrid`, `modal`, `tooltip`, `popover`, `tabs`. Each
  family is a closed, enumerated field list (e.g. `BrandTableChrome` has ~30
  fields, `BrandTabsChrome` ~90, `BrandBadgeChrome` ~110) — no open/dynamic keys.
- `engineBridge` (line 100): `Partial<Record<EngineName, Record<string, unknown>>>`
  — the one genuinely open-ended escape hatch, but it is passed through
  UNCOMPILED (brand-theme/index.ts:1020-1022, 1029) directly into
  `CompiledBrand.engineBridge`; it never becomes part of `cssVariables` or
  `cssString`, so it cannot emit CSS at all through this pipeline — a
  consumer (engine runtime) has to separately interpret it.

### Capability checklist (contract-level)

| Capability | Contract support |
|---|---|
| Per-mode (light/dark) values | Only via a fixed, small set of explicit `dark*` palette fields (darkPrimaryColor, darkSecondaryColor, darkAccentColor, darkBackgroundColor). No `dark` variant exists for `surfaces`, `motion`, or any `chrome.*` family — confirmed by the DB-path comment at `visual-config/index.ts:502-506`: "chrome.controls ... chrome.cardComponent, and chrome.modal carry no separate dark variant ... Scoped to these three sub-objects only". Sidebar/layout/shell/table/tabs chrome has **no** dark path at all in the contract. |
| Media queries | Not expressible. No field in `BrandTheme` or any `Brand*Chrome` interface takes a media condition, breakpoint, or `prefers-*` value. |
| Arbitrary selectors | Not expressible. Every field compiles to a named `--ds-*` custom property (see §b); there is no mechanism to target a CSS selector the contract doesn't already know about. |
| Component-scoped overrides | Yes, but only for the 24 named `chrome.*` families and only for their pre-enumerated fields — see `chromeToVariables`, `src/infrastructure/compilers/kernel/foundation/css/chrome-variables/index.ts:518+` (24 `if (chrome.X)` blocks, each hand-listing its fields). A new component or a new field on an existing component requires a contract change, not tenant authoring. |
| State variants (hover/active/focus/disabled/selected) | Only as separate NAMED custom properties per state per component (e.g. `buttonPrimary.bgHover`, `card.borderHover`, `badge.hoverTransform`) — never as a raw `:hover` selector. The component's own (compiler-independent) CSS is what wires `--ds-button-primary-bg-hover` to an actual `:hover` rule. A tenant cannot introduce a NEW state on a component that doesn't already have a `bgHover`/`bgActive`/etc. slot. |
| `color-scheme` property | Never emitted. Grep of the compiler source (`brand-theme/index.ts`, `chrome-variables/index.ts`, `artifact-renderer/index.ts`, `visual-config/index.ts`) for `color-scheme` returns zero hits. Both `bithire/_source/extension.css` and `rottay/_source/extension.css` declare `color-scheme` by hand (2 occurrences each) — direct evidence this is real, currently-used residue. |

## b. What `compileBrandTheme` emits

- Single pure function, `brand-theme/index.ts:975-1032`. Input: `BrandCompilerInput`
  (`brandTheme`, `tenantSlug`, optional vertical baseline personality/tokenOverrides,
  optional `baseTheme`). Output `CompiledBrand`:
  - `cssVariables: Record<string,string>` — the actual payload every consumer uses.
    Built by `brandThemeToCssVariables` (line 443-614, palette/typography/surfaces/
    ramps/tint-scale/type-ramp/semantic-typography/motion) merged with
    `brandThemeToChromeVariables` (line 946-950, delegates to `chromeToVariables`).
    This is a **flat key→value map**, not selector-shaped.
  - `cssString: string` — built by the internal `buildCssString` helper
    (line 926-934): `` `html[data-tenant='${tenantSlug}'] {\n  ...\n}` ``. **This
    field is not actually consumed by either downstream path** — `renderVerticalArtifact`
    re-derives its own block from `cssVariables` directly (artifact-renderer/index.ts:108-117),
    and `resolveTenantVisualConfig`/`generateTenantCssFromResolvedVisualConfig` only reads
    `.cssVariables`, `.personality`, `.tokenOverrides` (`visual-config/index.ts:149-160, 466`).
    `cssString`/`buildCssString` is effectively vestigial in the current pipeline.
  - `personality`, `tokenOverrides`, `engineBridge`, optional `recipeProfile` —
    non-CSS-string outputs consumed by the runtime provider / recipe system,
    out of scope for the extension.css question.
- `compileBrandTheme` itself NEVER emits a selector, a `@media` block, or more
  than one implicit "block" of declarations — its entire surface is one
  `Record<string,string>`. All selector shaping, dark-mode splitting, and
  multi-block assembly is owned by the CALLERS (see below), not by the compiler.
- Dark mode inside `compileBrandTheme`: limited to the few `dark*` palette
  fields being folded into flat vars like `--ds-color-dark-primary`,
  `--ds-color-dark-bg` (line 497-511) and into `deriveTenantColorRamps`
  (line 268-336, OKLCH-derived `--ds-color-{role}-{50..900}` keyed to whichever
  surface — light or dark — the tenant's palette declares as canonical via
  `isDarkSurfacePalette`, line 268-272). It does NOT itself produce a
  `[data-theme='dark']` selector or an `@media (prefers-color-scheme: dark)`
  block — those are entirely the DB path's responsibility (see below).

### Caller 1 — first-party artifact (`renderVerticalArtifact`, `artifact-renderer/index.ts:82-129`)

- Produces exactly ONE compiled selector block:
  `` :is(html[data-tenant='<slug>'], :where([data-ds-root][data-vertical='<vertical>'])) `` —
  the dual-scope form is applied by `projectFirstPartyArtifactScopes`
  (`kernel/foundation/css/scope-projection`, invoked at line 124-128) on top of
  the plain `selector` string declared per-artifact in
  `FIRST_PARTY_ARTIFACT_SPECS` (`artifact-renderer/index.ts:45-67`, e.g. rottay's
  is `"html[data-tenant='rottay'][data-theme='light'], html[data-tenant='rottay'].light"`
  — note rottay's own spec selector is ALREADY light-scoped only; nothing in
  this renderer emits rottay's dark block).
- Declarations are sorted alphabetically by key (line 108-111) — deterministic
  byte-for-byte output, no light/dark split, no `@media`.
- After that one compiled block, it verbatim-appends `extensionCss` (the
  hand-authored `_source/extension.css`) under a second banner comment
  (line 119-122) — trimmed of leading/trailing whitespace, otherwise
  UNTOUCHED. The extension file can contain literally anything CSS allows:
  new selectors, `@media`, `:hover`, `::before`, `@supports`, `color-scheme`.
  Confirmed empirically: `bithire/_source/extension.css` contains 10 `@media`,
  8 `:hover`, 16 `:focus`, 10 `::before`, 4 `::after`, 1 `@supports`, 2
  `color-scheme`, and 464 `!important` occurrences;
  `rottay/_source/extension.css` contains 2 `color-scheme` occurrences and no
  `@media`/`:hover`/`:focus`/`@supports`.
- **Net effect: for first-party artifacts, 100% of dark-mode handling, media
  queries, hover/focus states beyond named chrome slots, and `color-scheme`
  live in the hand-authored extension.css.** `compileBrandTheme` +
  `renderVerticalArtifact` structurally cannot produce any of those for the
  bundled verticals — confirmed by reading the actual generated artifact head
  (`facade/artifacts/bithire/index.css:1-20`): one compiled block, then
  (per file structure) the extension section, no second selector block from
  the compiler side.

### Caller 2 — DB tenant path (`generateTenantCssFromResolvedVisualConfig`, `visual-config/index.ts:458-568`)

- Produces up to THREE selector blocks per tenant, none of which match the
  first-party shape:
  1. Light block: `` `${selector}, ${selector} [data-ds-root]` `` (line 497)
     where `selector = buildTenantSelector(slug) = "html[data-tenant='<slug>']"`
     (line 442-444) — note this is a DIFFERENT selector shape than the
     first-party `:is(html[...], :where([data-ds-root][data-vertical=...]))`
     form; no `:is()`/`:where()` here, and it uses `data-vertical` nowhere.
  2. Dark block (if `includeDarkSelector`, default true): triple selector
     `` `${selector}[data-theme='dark'], ${selector}.dark, ${selector}:is([data-theme='dark'])` ``
     (line 536-540) — genuinely emits a dark selector, unlike the first-party path.
  3. System-dark block (if `includeSystemDarkSelector`, default true): wraps
     the same dark declarations in `@media (prefers-color-scheme: dark) { ${selector}:not([data-theme]):not(.light):not(.dark) { ... } }`
     (line 543-554) — this is the ONE place in the entire pipeline that emits
     a real `@media` query, and it's DB-tenant-only; first-party artifacts get none.
- Still: `color-scheme` is never emitted here either (grep confirms 0 hits in
  `visual-config/index.ts`). Dark declarations flip variable VALUES
  (`darkSemanticVariables`, line 330-436, hardcoded dark palette defaults +
  tenant overrides), they do not set the `color-scheme` CSS property itself.

## c. Structural residue — what the contract cannot express, confirmed by real usage

1. **Component-part / descendant selectors.** The contract only ever emits
   flat custom properties scoped to the tenant root selector; it cannot
   target `.some-component .sub-part` or any DOM structure the enumerated
   `chrome.*` families don't already name a slot for.
2. **New pseudo-classes/pseudo-elements beyond the compiler's pre-wired ones.**
   `:hover`/`:active`/`:focus` exist ONLY as named property pairs
   (`xBg` / `xBgHover`) on already-modeled components; `::before`/`::after`/
   `:focus-visible`/`:disabled` structural rules are entirely extension.css
   territory (bithire's extension.css uses 10 `::before`, 4 `::after`, 16 `:focus`).
3. **`@media` guards of any kind** for first-party artifacts (viewport,
   `prefers-reduced-motion` beyond the one hardcoded guard injected by
   `build-vertical-css.mjs:143-189` from `runtime/personality.css`, container
   queries, `prefers-contrast`, print, etc.) — bithire's extension.css uses
   10 `@media` blocks the compiler has no equivalent for.
4. **`@supports` feature queries** — bithire's extension.css has 1; the
   contract has no equivalent.
5. **`color-scheme` property** — never emitted by the compiler (§a, §b);
   both bithire and rottay hand-author it twice each.
6. **Non-custom-property declarations in general.** `compileBrandTheme`
   ONLY ever writes `--ds-*: value;` pairs. Anything that must be a literal
   CSS declaration on a real property (e.g. `content: "..."`, `mask-image`,
   `clip-path`, `@font-face`, `@keyframes` bodies) is structurally outside
   its output shape, even though a component might consume a `--ds-*`
   variable inside such a declaration.
7. **New component families / new fields on existing families.** Since
   `chrome.*` is a closed, hand-enumerated set (`chrome-variables/index.ts`),
   a selector for a component the contract doesn't model (or a state the
   family doesn't carry a slot for) cannot be reached without a contract change.
8. **`!important`.** Not part of the contract's vocabulary at all; bithire's
   extension.css uses it 464 times — this is arguably not "capability the
   contract cannot express" so much as specificity-escape-hatch usage, but
   it's worth flagging separately from (F)-classification: an `!important`
   rule in extension.css could be masking a cascade-order problem rather than
   expressing a genuinely inexpressible capability.

Concrete field-population evidence: `bithire/index.ts` (the authored
`BrandTheme`) populates `palette`, `typography`, `surfaces`, `motion`,
`charts`, `recipes`, and 22 of the 24 `chrome.*` families (all except
`tooltip` and `popover`) — so most of the ~140-variable contract surface IS
in active use for bithire; the residue in its 6247-line extension.css is not
explained by "the theme just didn't populate the field," it has to be
explained by one of items 1-8 above (or by genuine duplication/override,
which is a separate question from this capability map).

## d. Same-emitter verdict for the DB tenant path

**Qualified same-emitter.** For the core palette/typography/surfaces/chrome
mapping, the DB path calls the exact same `compileBrandTheme` function
(imported at `visual-config/index.ts:14-20` from
`@/infrastructure/compilers/kernel/runtime/brand-theme`) that the first-party
artifact build calls (`build-vertical-artifacts.mjs:30-32`). There is only
one implementation of `BrandTheme -> --ds-* variables`.

However, the DB path additionally runs a SECOND, independent color-scale
generator that overlaps the compiler's own ramp derivation and wins the
merge:

- `compileBrandTheme`'s `deriveTenantColorRamps` (`brand-theme/index.ts:315-336`)
  derives `--ds-color-{primary,secondary,accent,success,warning,error,info}-{50..900}`
  using OKLCH perceptual interpolation (`deriveOklchRamp`,
  `foundation/kernel/color/oklch/ramp/index.ts:82-96`), keyed to the tenant's
  own light/dark ground.
- `visual-config/index.ts`'s `brandingVariables()` (line 214-242) and
  `darkBrandingVariables()` (line 245-273) independently derive
  `--ds-color-{primary,secondary,accent}-{50..900}` using a DIFFERENT, sRGB-based
  `buildRuntimeScale`/`buildDarkRuntimeScale` (imported from
  `kernel/foundation/css/color-math`, line 21-30) over `config.branding.*Color`
  (which is itself bridged FROM `brandTheme.palette` by `brandThemeToBranding`,
  `brand-theme/index.ts:165-190` — so both derivations trace back to the same
  seed color, but run different math and land on different step counts:
  compiler ramp = 7 roles × 10 steps; legacy scale = only
  primary/secondary/accent × 10 steps, no success/warning/error/info).
- At `visual-config/index.ts:485`: `` const lightDeclarations = { ...compiledBrandVars, ...baseDeclarations, ...appearanceVars }; ``
  where `baseDeclarations` includes `brandingVariables(effectiveConfig)`
  (line 477). Object spread means **`baseDeclarations` overrides
  `compiledBrandVars` for every colliding key** — so for primary/secondary/accent,
  the DB tenant path's final `--ds-color-primary-{50..900}` values come from
  the legacy sRGB scale, NOT from `compileBrandTheme`'s OKLCH ramp, even
  though both were computed from the same seed. Success/warning/error/info
  ramps (only derived by the compiler, never by the legacy generator) DO
  survive from `compileBrandTheme` untouched.
- On top of both of those, `compileAppearanceVariables` (a third compiler,
  `infrastructure/compilers/kernel/runtime/appearance/`, invoked at
  `visual-config/index.ts:471-473`) layers `TenantAppearance`
  General/Advanced-tier variables last, so it wins over everything above for
  any key it also writes. This audit did not read that compiler's source in
  detail — flagged as a follow-up if the overlap/contradiction question needs
  to extend to Appearance too.

So: one canonical `BrandTheme -> chrome/palette/typography/surfaces` emitter,
shared correctly. But the DB tenant CSS-string assembly is a genuinely
separate, independently-authored piece of logic from the first-party
artifact renderer (different selector shapes, dark/media handling only on
the DB side), AND it runs its own parallel (non-OKLCH) color-ramp generator
for primary/secondary/accent that silently overrides the shared compiler's
ramp for those three roles via merge order. This second point is a real
"second emitter" for a slice of the palette output, not just a wrapper
difference.

## e. What `--check` actually verifies (build-vertical-artifacts.mjs)

Two checks only, both purely mechanical — **no overlap/contradiction check
between compiled output and extension.css exists anywhere in this script or
in `build-vertical-css.mjs`**:

1. **Byte-parity / hand-edit detection** (`build-vertical-artifacts.mjs:129-137`):
   re-runs `compileBrandTheme` + `renderVerticalArtifact` in memory and does a
   strict string-equality diff against the committed `index.css`. This only
   catches drift between the generator and its own output (e.g. someone
   hand-editing the generated file, or the extension.css changing without
   regenerating) — it says nothing about whether extension.css rules conflict
   with, duplicate, or shadow the compiled block's declarations.
2. **APCA contrast regression on the generated ramp only**
   (`checkGeneratedRampApca`, line 93-107, called at line 117): for each
   generated `--ds-color-{role}-900` variable, checks APCA contrast against
   the tenant's own ground color, failing the build if `|Lc| < APCA_BODY_TEXT_MIN_LC`.
   Explicitly scoped to the WO-TOK-02 ramp derivation only (see the comment at
   line 74-92 explaining it deliberately does NOT re-check pre-existing seed
   colors like bithire's warningColor, which already fails APCA against its
   own ground and is tracked by a separate decrease-only counter
   `a11y.apcaPairings` in `engine-token-audit.mjs`, not by this script).

`build-vertical-css.mjs --check` (separate script) additionally verifies:
byte-parity of the full bundle against `styles/*.css` and
`dist/modern-engine.css` (lines 116-126, 355-450), and a cross-vertical
contamination scan that greps for another vertical's
`data-tenant='x'`/`data-vertical='x'` selector strings appearing outside
comments (lines 327-353) — this is a same-file namespace-collision check
across DIFFERENT verticals' bundles, not an overlap check between a single
vertical's compiled block and its OWN extension.css.

**Conclusion for the audit's classification question:** nothing in the build
pipeline mechanically distinguishes "(F) extension.css rule covering a gap
the contract cannot express" from "extension.css rule duplicating/overriding
a capability the contract already has." Both pass `--check` identically as
long as the artifact is regenerated and the APCA ramp check passes. That
classification has to be done by hand (or by a new script), using the
capability boundary documented in §a-§c above.

## Files read (all read-only)

- `src/infrastructure/compilers/kernel/runtime/brand-theme/index.ts` (1032 lines, full read)
- `src/infrastructure/compilers/runtime/tenant-css/artifact-renderer/index.ts` (full read)
- `src/infrastructure/compilers/runtime/tenant-css/index.ts` (full read)
- `src/infrastructure/compilers/runtime/tenant-css/visual-config/index.ts` (full read)
- `src/foundation/contracts/composition/tenants/themes/index.ts` (full read, 1695 lines)
- `src/infrastructure/compilers/kernel/foundation/css/chrome-variables/index.ts` (partial read, lines 1-911 of 1816 — sidebar/layout/shell/toolbar/filterPill/badge/breadcrumb/search/controls-buttonGeometry blocks; remaining families follow the identical `if (field) vars[name] = value` pattern per the file's own doc comment, confirmed no selector/media emission anywhere in the pattern)
- `src/foundation/kernel/color/oklch/ramp/index.ts` (full read)
- `scripts/build-vertical-css.mjs` (full read)
- `scripts/build-vertical-artifacts.mjs` (full read)
- `src/foundation/tokens/ts/presentation/brand-themes/bithire/index.ts` (grepped for top-level + chrome sub-keys, not fully read line-by-line)
- `src/foundation/tokens/css/facade/artifacts/bithire/index.css`, `.../rottay/index.css` (head only, to confirm generated selector shape)
- `src/foundation/tokens/css/facade/artifacts/{bithire,rottay}/_source/extension.css` (grepped for selector/at-rule pattern counts, not fully read)

Not read (out of this task's stated scope, flagged for follow-up if needed):
`infrastructure/compilers/kernel/runtime/appearance/` (the Appearance
compiler layered on top of the DB path), `kernel/foundation/css/scope-projection`
(the `:is()/:where()` projection logic itself), `evnto/_source/extension.css`
content (only line-count and grep counts gathered).
