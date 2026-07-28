# Sweep 2 — Dual-Authority Audit: Recipes/Profiles, Typography, Density, Motion

Repo: `/Users/daniel/Developer/Rottay/ui-design-system` (packages/core). All paths below are relative to
`packages/core/src/` unless stated otherwise. Read-only investigation; no edits made.

Pattern under test: "one declared authority, two effective sources" — the same semantic channel
(CSS custom property, or a config value with a claimed single source) authored by two different
places while a single source of truth is claimed.

---

## 1. Recipe profiles vs component defaults — SINGLE with explicit coverage (CSS-var channel); CLEAN (data-attribute channel)

There are two unrelated systems both called "profile" in this codebase and I checked both.

**Recipe profiles** (`DS-S001`, `infrastructure/runtime/foundation/recipes/profiles/index.ts`) govern
per-family axis defaults (button/card/tag/tabs/sectionCard/dataTable — `shape`/`size`/`variant`/etc.,
registry at `foundation/tokens/ts/presentation/recipe-profiles/index.ts:45-74`). This system does **not**
express itself as a CSS custom property at all for the axis values themselves: `RecipeProfileProvider`
(`infrastructure/runtime/foundation/recipes/profiles/index.ts:49-59`) resolves the profile once in React
context, and `useRecipeProfileDefaults` feeds unset props into each engine component, which then renders
as a `data-variant`/`data-shape`/`data-size` attribute. CSS only ever selects on the attribute
(`[data-variant='primary']`, etc.) — verified by sampling 3 of the 6 recipe-governed component CSS files
(`foundation/tokens/css/runtime/engines/modern/skin/button.css:69-78,218-270`, plus Card and Tag engine
files read directly) — each keys a closed enumerated set of `[data-*=value]` selectors with no
un-attributed fallback block that could apply a second, diverging default. There is structurally no
`var(--x, HARDCODED)` channel here to duplicate.

There **is** a separate CSS custom property, `--ds-recipe-profile`, written by the brand-theme and
tenant-theme compilers as a provenance label (not a resolution input). This is exactly the "two
representations of one decision" shape, but it is proven **inert** by a dedicated test suite:
`infrastructure/runtime/foundation/recipes/profiles/tests/recipe-profile-single-path.test.tsx`:
- A census over the full source tree (>1500 files, gate at line 97) shows the string
  `--ds-recipe-profile` appears **only** in its two declared emitters
  (`infrastructure/compilers/kernel/runtime/brand-theme/index.ts`,
  `infrastructure/compilers/composition/tenant-theme/index.ts`) — asserted at lines 100-104.
- A runtime test (lines 106-120) plants a document-level `--ds-recipe-profile` disagreeing with the
  mounted React context and shows zero component attributes move — the CSS variable cannot act as a
  second authority because nothing reads it.

Separately, the **product-profile** system (`foundation/presets/product-profiles/index.ts`) feeds
`personality`/`tokenOverrides` into CSS via two call sites: the static tenant-CSS generator
(`infrastructure/compilers/runtime/tenant-css/visual-config/index.ts:165-188`) and the runtime
`useTokens()` hook (`infrastructure/runtime/theming/composition/react/tokens/index.ts:150-320`). Both
branch identically on `config.brandTheme` presence (BrandTheme path skips `profile.personality` — only
`surfaceDefaults` survives, matching the documented rule in the repo's own CLAUDE.md — legacy path
composes `vertical → profile → tenant`), and both delegate the actual CSS-variable derivation to the same
shared function, `resolvePartialPersonalityCssVariables`
(`foundation/tokens/ts/runtime/personality/index.ts`), imported at `visual-config/index.ts:36` and
referenced from `useTokens`'s personality assembly. This is SINGLE with explicit coverage: shared
formula + mirrored branch condition, not independently reimplemented.

**Sample**: 2 test files, 1 profile registry, 1 runtime provider, 2 product-profile registries/compilers,
3 of 6 recipe-governed component CSS files (Button, Card, Tag) read directly. Not exhaustive — I did not
check `sectionCard`/`dataTable`/`tabs` CSS files individually, nor did I diff `visual-config/index.ts` and
`useTokens()` line-by-line beyond confirming they call the same shared resolver and branch identically.

---

## 2. Typography roles vs skin fallbacks — CONFIRMED dual-authoring (1 of 3 first-party verticals)

Typography **role** variables (as opposed to the numeric xs/sm/md/lg scale) are
`--ds-line-height-{display,heading,body,tight,relaxed}`,
`--ds-font-weight-{display,heading,body,...}`,
`--ds-letter-spacing-{display,heading,body,mono}`. The canonical source per the repo's own CLAUDE.md is:
"the `.ts` BrandTheme files are the source... First-party tenant CSS files
(`foundation/tokens/css/facade/artifacts/`) are generated snapshots, not the source of truth."

Checked all 3 first-party artifacts (bithire, evnto, rottay) end-to-end for the 3 line-height roles
(display/heading/body): **bithire diverges, evnto and rottay do not.**

**bithire — confirmed divergence:**
- Canonical source: `foundation/tokens/ts/presentation/brand-themes/bithire/index.ts:75-81` declares
  `typography.lineHeight.body: 1.55`.
- Compiler emission: `infrastructure/compilers/kernel/runtime/brand-theme/index.ts:550-551` — 
  `vars["--ds-line-height-body"] = String(ty.lineHeight.body)`.
- Generated artifact, light/base selector (`:is(html[data-tenant='bithire'], ...)`, opens at
  `foundation/tokens/css/facade/artifacts/bithire/index.css:14`):
  line **502** → `--ds-line-height-body: 1.55;` — correct, matches source.
  (letter-spacing/heading/display are also emitted here from the same block and match: `506` tight,
  `503` display 1.1, `504` heading 1.25.)
- Generated artifact, **dark-mode** selector (`:is(...).dark`, opens at
  `foundation/tokens/css/facade/artifacts/bithire/index.css:1416`):
  line **1508** → `--ds-line-height-body: 1.6;` — a **different, hand-authored** value. `.dark` adds one
  class to the selector, so this rule outranks the light-block rule by specificity and, being later in
  source order, wins whenever the tenant is in dark mode.
- Hand-authored origin of the divergent value:
  `foundation/tokens/css/facade/artifacts/bithire/_source/extension.css:449-469` (comment on line 449
  reads "Typography - Same family, dark mode inherits" — i.e. the author's own intent was parity with
  light mode) declares `--ds-line-height-body: 1.6;` at line **467**.
- Net effect: bithire's body line-height is 1.55 in light mode and silently becomes 1.6 in dark mode,
  contradicting both the documented single-source rule and the extension file's own "dark mode inherits"
  comment.
- **Why the guard doesn't catch it**: `foundation/tokens/__tests__/first-party-artifacts-parity.test.ts`
  exists specifically to police this ("Every variable emitted by `compileBrandTheme` must exist, with an
  equal value, somewhere in the committed artifact" — docstring, lines 4-7). Its implementation
  (`collectDeclaredValues`, lines 39-48, and the assertion at lines 66-83) collects **all** values ever
  declared for a custom-property name across the **entire file** into a `Set`, then checks
  `declaredValues.has(compiledValue)` — set membership, not "does the value that wins the cascade equal
  the compiled value." Because 1.55 *is* declared somewhere in the file (the light block), the test
  passes even though a later, higher-specificity `.dark` rule silently overrides it with 1.6. This is a
  structural gap, not a one-off miss — the same gap could hide divergences on any of the ~140
  BrandTheme-scoped variables wherever an artifact has more than one selector context (light/dark being
  the common case). I did not exhaustively check every property for the same drift, only the 3
  line-height roles.

**evnto — clean**: only one declaration site for `--ds-line-height-body/display/heading`
(`foundation/tokens/css/facade/artifacts/evnto/index.css:153-155`, values 1.6/1.1/1.2), matching
`foundation/tokens/ts/presentation/brand-themes/evnto/index.ts:54-60` exactly. No dark-mode block
redeclares these.

**rottay — clean by coincidence of correct authoring**: `_source/extension.css` hand-declares the same 3
roles twice (light block at lines 277-279, dark-equivalent block at 1837-1839: display 1.1 / heading 1.2 /
body 1.6 both times), and both match `foundation/tokens/ts/presentation/brand-themes/platform/index.ts:63-69`
(display 1.1, heading 1.2, body 1.6) exactly. Still two independently hand-typed sources for one channel —
no divergence today, but nothing pins them together, so a future edit to either side (BrandTheme.ts or
extension.css) can silently drift the same way bithire did, and the parity test's Set-membership check
would not catch it.

**Sample**: 3/3 first-party verticals checked for exactly 3 line-height role variables. Font-weight and
letter-spacing roles were spot-read for bithire only (matched); not checked for evnto/rottay divergence
in the same depth. Denominator: 3 verticals × 3 roles = 9 checks, 1 confirmed divergence.

---

## 3. Density compiler vs component-local geometry — CONFIRMED dual-authoring, two distinct instances

Canonical authority: `foundation/tokens/css/foundation/base/density.css`. Non-root `[data-density=X]`
writes `--ds-density-local-factor` (lines 37-47: compact 0.85 / comfortable 1 / spacious 1.15); root
`:root[data-density=X]` writes the separate `--ds-density-mode-factor` (lines 175-181). A parity test,
`foundation/tokens/css/foundation/base/tests/density-scale-parity.test.ts`, pins these CSS literals
against the canonical TS resolver (`DENSITY_MODE_FACTORS`) — but **only** for `density.css`, `spacing.css`,
`default.css`, `useTokens`, and the appearance compiler (see the file list at test lines 28-36). It does
not know about component-local files.

**Instance A — JS/context split, admitted and ratcheted (not a live bug, but a real, tracked instance):**
`ui/structures/workspace/action-dock/runtime/rendering/index.tsx:277` —
```
data-density={density}
```
stamps the attribute straight from ActionDock's own prop, without calling `DensityScope` /
`densityScopeAttributes()` and without publishing `DensityContext`. This is explicitly documented as a
"deviation" (as opposed to a sanctioned "re-stamp") in
`infrastructure/runtime/foundation/density/tests/density-writer-ratchet.test.ts:64-70`, pinned at exactly
1 site, with a decrease-only ratchet test (lines 120-130) that fails if the deviation count ever grows.
Effect: inside ActionDock, CSS geometry follows the locally-stamped posture while `useDensity()` (JS)
still reports the ambient/parent posture — textbook "declared authority (DensityContext) vs. effective
source (CSS attribute)" split. It is the *only* sanctioned instance and is explicitly capped from
growing, so I score this SINGLE-with-explicit-coverage-that-is-currently-imperfect rather than an
unbounded finding — but it is real today, at the file:line above.

**Instance B — CSS-level redeclaration, NOT tracked, NOT tested:**
`foundation/tokens/css/presentation/components/skin/data-table-mobile.css:100-129` re-declares the
canonical `--ds-density-local-factor` channel on its own selector:
```css
.ds-pattern-data-table.ds-data-table--mobile[data-part="mobile-root"][data-density="compact"] {
  --ds-density-local-factor: var(--ds-density-factor-compact, 0.85);
  ...
}
```
(repeated for `comfortable` → 1 and `spacious` → 1.15, lines 111-120 and 122-130).

- Specificity: this selector is `(0,4,0)` (2 classes + 2 attribute selectors) versus density.css's
  `[data-density='compact']:not(:root)` at `(0,2,0)` (line 37). Neither file uses `@layer` (confirmed by
  grep — zero `@layer` hits in either file; data-table-mobile.css line 9 documents itself as
  "DELIBERATELY UNLAYERED (P-47)"), so plain specificity applies and the component rule **wins** whenever
  both selectors match the same element.
- The fallback variable names `--ds-density-factor-compact` / `-comfortable` / `-spacious` referenced
  inside the `var()` calls are **never defined anywhere else in the repository** (verified by a full-tree
  grep for the exact names — zero other hits). This means the `var(..., 0.85)` etc. always resolves to
  the literal fallback — i.e., this is a hardcoded local copy of density.css's values, not a reference to
  a shared token, despite superficially looking like a token indirection.
- The values (0.85/1/1.15) currently match density.css's canon by manual coincidence, not by any pinning
  mechanism — `density-scale-parity.test.ts` does not read this file (confirmed: its `source()` calls at
  lines 28-36 list 3 CSS files and 2 TS files, `data-table-mobile.css` is not among them), and I found no
  other test referencing `data-table-mobile` that checks density values (checked
  `DataTable.pass2-craft-contract.test.ts`, `DataTable.real-engines.test.tsx` — neither mentions density).
  If density.css's canonical factors are ever changed, this file will silently not follow.

**Sample**: read the density runtime module, both density-authority test files in full, the density.css
authority file in full, and the density-scale-parity test in full. Grepped all `--ds-density-local-factor`
declarations repo-wide (3 hits total outside the authority file, all in data-table-mobile.css — exhaustive
for that specific variable name). Additionally scanned ~10 modern-engine CSS files for hardcoded px
geometry; the rest were legitimate shape-only literals (`50%` circles, `9999px` pills, `0` square-shape
overrides) unrelated to the density channel — CLEAN, not evidence of duplication.

---

## 4. Motion policy vs CSS literals/fallbacks — CONFIRMED policy bypass + widespread local reimplementation

Canonical policy: `foundation/tokens/css/foundation/animations/transitions.css` — durations
`--ds-motion-fast: 120ms` / `--ds-motion-normal: 200ms` / `--ds-motion-slow: 320ms` (lines 94-96), five
named easing curves e.g. `--ds-motion-ease-out: cubic-bezier(0.16, 1, 0.3, 1)` (lines 123-127), and a
**global reduced-motion collapse**: every `--ds-motion-*` variable forced to `0s !important` inside
`@media (prefers-reduced-motion: reduce)` (lines 427-439, mirrored in `foundation/tokens/css/runtime/personality.css:782-785`).
The transitions.css comment is explicit about intent: "Important is intentional here... Accessibility
preference must win over both static and DB-authored brand cadence, including inline custom-property
injection." There is also a dedicated ESLint rule, `tooling/eslint/runtime/rules/no-motion-literals/index.ts`,
that forbids raw `cubic-bezier()` / sub-second duration literals — but its scope is explicitly `**/engines/modern*.{ts,tsx}`
files only (line 21's regex, and the file's own docstring at lines 8-9: "classic... and rustic legitimately
use the legacy catalog and are not linted"). **It does not run against `.css` files at all** — it's an
AST rule over JS/TS `Literal`/`TemplateElement` nodes (lines 51-60), so raw literals inside the actual
engine CSS files are structurally invisible to it.

**Confirmed bypass, with a real accessibility consequence:**
`foundation/tokens/css/runtime/engines/modern/theme.css:223` and `:279` —
```css
[data-tenant] .rottay-menu li > a,
[data-tenant] .rottay-menu li > button {
  ...
  transition: all 0.2s ease;   /* line 223 */
```
and the equivalent `details > summary` rule at line 279. This is a raw literal: no `var(--ds-motion-*)`
duration reference, and the easing keyword `ease` is not one of the DS's five named curves. Consequences:
- It is **not** covered by the global `!important` reduced-motion collapse — that collapse only affects
  values that reference the `--ds-motion-*` custom properties; a literal `0.2s` never reads them.
- `theme.css` has **zero** `@media (prefers-reduced-motion: reduce)` blocks anywhere in its 440 lines
  (confirmed: `rg -c "prefers-reduced-motion" theme.css` → no matches), so there is no local guard either.
- Net: this sidebar-menu hover/focus transition will animate for a user with
  `prefers-reduced-motion: reduce` set, with no mechanism in the codebase that silences it.
- This is not a wholesale opt-out of the token system: the same file correctly uses
  `transition: var(--ds-button-transition)` (line 30), `var(--ds-input-transition)` (line 107), and
  `var(--ds-transition-fast)` (lines 141, 166, 393) for other components — so the bypass is a local,
  inconsistent authoring choice within an otherwise-compliant file, not a structural exemption.

**Widespread local reimplementation of the reduced-motion guard (separate finding, large scale):**
A repo-wide grep for `@media (prefers-reduced-motion: reduce)` outside `dist/`/`facade/artifacts/` hit
**~115 files**, the large majority under `foundation/tokens/css/{presentation/components/skin,runtime/engines/{modern,rustic}/skin}/`
— i.e., nearly every individual component "skin" file declares its **own** local reduced-motion block,
in addition to (not instead of) the canonical global `!important` collapse in transitions.css. Sampled 5
of these in full (`spinner.css:82-86`, `badge.css:508-514`, `tabs.css:820-826`, `action-dock.css:173-177`,
`toast.css:177-183`) and found at least 4 different idioms for achieving "no motion": `animation: none`,
`transition: none`, `transition-duration: 0.01ms`, `scroll-behavior: auto` — i.e., each component
independently reinvents the guard rather than the codebase relying on one canonical mechanism. This
doesn't currently produce disagreement in visible *outcome* (all converge on "no motion"), so it is not
as sharp a finding as the theme.css case above, but it is structurally exactly the pattern asked about
("re-implements reduced-motion guards locally") and it means protection is uneven: components with a
local guard are doubly protected; a component with neither a token reference nor a local guard (like
`.rottay-menu` above) is unprotected by either mechanism.

**Sample**: read the full motion policy file (`transitions.css`), the ESLint rule source in full, grepped
all `transition:`/`transition-duration:`/`animation-duration:` declarations across
`foundation/tokens/css/runtime/engines/modern/**/*.css` (238 `transition:`-family declarations total) and
manually triaged every non-token-referencing hit (~30 lines) — the large majority were `transition: none;`
(intentional, inside reduced-motion or disabled-state blocks) or single hardcoded values inside otherwise
token-compliant files; `theme.css:223/279` was the clearest case of a live, unguarded, interactive-element
bypass. The 115-file reduced-motion-block count is a grep census (file names only, not full content), of
which 5 files (~4%) were read in full to characterize the guard pattern.

---

## Summary table

| # | Subsystem | Verdict | Strongest evidence |
|---|---|---|---|
| 1 | Recipe/product profiles vs component CSS | SINGLE (explicit, tested coverage) for the CSS-var channel; CLEAN for the data-attribute channel | `recipe-profile-single-path.test.tsx` (census + inertness proof); shared `resolvePartialPersonalityCssVariables` call in both static and runtime paths |
| 2 | Typography roles vs skin fallbacks | CONFIRMED (1 of 3 verticals) | `bithire/index.css:502` (1.55, light) vs `:1508` (1.6, dark) for `--ds-line-height-body`; source: `_source/extension.css:467`; guard gap: `first-party-artifacts-parity.test.ts:66-83` (Set-membership, not cascade-winner) |
| 3 | Density compiler vs component geometry | CONFIRMED (2 instances) | JS split: `action-dock/runtime/rendering/index.tsx:277` (tracked, ratcheted at 1). CSS split: `data-table-mobile.css:100-129` re-declares `--ds-density-local-factor` at higher specificity, untracked by `density-scale-parity.test.ts` |
| 4 | Motion policy vs CSS literals | CONFIRMED (unguarded bypass + widespread local reimplementation) | `theme.css:223,279` — raw `0.2s ease`, no token reference, no local guard, file has zero reduced-motion handling despite correct token usage elsewhere in the same file; ~115 files separately reimplement local reduced-motion guards alongside the global `!important` collapse |

File written: `/private/tmp/rottay-design-platform-independent-audit-round-3/sweep-2-recipes-typography-density-motion.md`
