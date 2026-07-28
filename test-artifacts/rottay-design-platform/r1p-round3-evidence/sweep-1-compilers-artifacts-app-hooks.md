# Sweep 1 — Dual-authority pattern: compilers, artifacts, app hooks

Round 3 independent audit. Read-only. Pattern under test: **one declared authority,
two effective sources** — the same semantic channel authored/emitted by two places
while docs or naming claim a single source of truth.

Repos: `/Users/daniel/Developer/Rottay/ui-design-system`, `/Users/daniel/Developer/Rottay/app-bithire`

---

## Baseline reproduction (given context, independently confirmed)

The known static-artifact dual-authoring reproduces exactly.

`ui-design-system/packages/core/src/foundation/tokens/css/facade/artifacts/bithire/index.css`:

- line 13 — `/* === Compiled from BrandTheme via compileBrandTheme — do not edit === */`
- line 1041 — `/* === Declared artifact extension (authored source, mechanically scoped) === */`

Measured over the two sections:

| Section | Distinct `--ds-*` properties declared |
|---|---|
| Compiled block (lines 13–1040) | 1024 |
| Extension section (lines 1041–end) | 557 |
| **Declared by BOTH** | **188** |

The 188 figure is confirmed. Both authors are assembled by
`packages/core/src/infrastructure/compilers/runtime/tenant-css/artifact-renderer/index.ts:112-122`
(`compiledBlock` then `extensionSection`), so the hand-authored extension always
wins by source order.

Note: the extension is *declared* (registered in the renderer header at
`artifact-renderer/index.ts:102`) and hand-edits are caught by `lint:artifacts`.
What is NOT governed is the 188-property **overlap** itself — no gate asserts
that the extension may only declare channels the compiler does not.

### The hard case inside the overlap: 44 compiler values are dead at identical specificity

Of the 188, most are shadowed through a *different* selector (dark-mode blocks,
higher-specificity scopes), which is at least arguable. But a subset collides on the
**same root selector**, where only source order decides — and the compiled block
loses every time because it is emitted first.

The two rules are textually different but semantically identical, differing only in
quote style:

```
index.css:14    :is(html[data-tenant='bithire'], :where([data-ds-root][data-vertical='bithire'])) {   ← compiled block
index.css:4457  :is(html[data-tenant="bithire"], :where([data-ds-root][data-vertical='bithire'])) {   ← extension
```

Both are specificity (0,1,1). Under that one selector pair:

| | count |
|---|---|
| Properties the compiled block declares there | 1024 |
| Properties the extension declares there | 246 |
| Declared by **both** | **48** |
| — of which values are **genuinely different** (compiled value is dead) | **44** |
| — of which are identical restatements (merely redundant) | 4 |

Worked example — `--ds-button-secondary-bg`:

- `index.css:102` (compiled) → `transparent`
- `index.css:4848` (extension) → `var(--ds-control-brand-tint)` — **this is what paints**

Further examples of overridden compiler output:

```
--ds-button-primary-bg        compiled #3A6FB0   → extension var(--ds-color-primary)
--ds-button-default-color     compiled #14283B   → extension var(--ds-control-ink)
--ds-card-radius              compiled 12px      → extension var(--ds-radius-md)
--ds-breadcrumb-color-active  compiled #14283B   → extension var(--ds-color-text-primary)
--ds-filter-pill-count-bg     compiled #ffffff   → extension color-mix(…)
```

The pattern is coherent as intent — the extension re-plumbs the compiler's *resolved
literals* back into `var()` indirections. But the effect is that for these 44
channels the BrandTheme compiler's per-tenant resolution is computed, emitted, and
then discarded, and nothing in the system declares that this is the design.

This also explains why a naive duplicate-selector scan reports nothing: a `grep -F`
for the compiled block's exact selector text matches **1** rule in the file. The
collision is invisible to any textual check because of the quote-style difference.

**Scope: BitHire only.** The same measurement on the other two artifacts returns zero
same-selector overlap:

| artifact | same-selector overlap | note |
|---|---|---|
| bithire | **48** (44 different) | compiled selector `:is(html[data-tenant='bithire'], …)` |
| evnto | 0 | — |
| rottay | 0 | compiled block is scoped to `[data-theme='light'], .light` |

rottay's zero is structural rather than clean: its compiled block is gated behind an
explicit light toggle (`artifacts/rottay/index.css:14`), so it cannot collide with the
extension's default-surface rules. That is the same condition the ramp ratchet
documents as rottay's accepted exception, and it is why rottay carries 124 of the 152
hand-authored ramp steps — the extension is serving the default surface that the
compiled block does not reach.

---

## Subsystem 1 — TenantTheme DB compiler vs subordinate bridges

### Verdict: **MIXED — SINGLE with explicit coverage on the provider/artifact axis; CONFIRMED dual-authoring inside the runtime tenant-CSS generator**

#### 1a. Provider vs compiled artifact — SINGLE with explicit coverage (clean)

This axis is genuinely well-engineered and should not be flagged.

`packages/core/src/infrastructure/runtime/theming/foundation/visual-authority/index.ts`
resolves, **per channel**, which emitter owns each tenant visual channel. A
`compiled-artifact` declaration carries the artifact's `coverage` set, and the
provider silences exactly those emitters:

- `visual-authority/index.ts:120-123` — `suppressedChannels` is the resolution output
- `visual-authority/index.ts:246-256` — a channel the artifact does NOT cover is
  explicitly "a channel the provider legitimately still owns"
- `foundation/contracts/composition/tenants/themes/tenant-theme/index.ts:559-585` —
  `TENANT_VISUAL_CHANNELS` (5) and `TENANT_THEME_V1_COVERAGE` (4). `personality` is
  deliberately outside coverage so the bridge "COMPLETES the channels the artifact
  does not cover".

The subordination is mechanical, not documentary. The personality bridge
(`infrastructure/runtime/theming/presentation/adapters/react/css-variables-bridge/index.tsx:141-151`)
writes into a `:root {}` rule (specificity `0,1,0`), while the artifact is scoped
`:is(html[data-tenant='x'], :where([data-ds-root][data-vertical='x']))` (`0,1,1`),
so the artifact deterministically wins any overlap. This matches the rationale in
`scripts/build-vertical-css.mjs:287-306`.

The DB compiler itself is also single-emitter by construction:
`infrastructure/compilers/composition/tenant-theme/index.ts:1407-1409` routes
everything through `compileAppearanceVariables` with the explicit note *"The shared
runtime/static Appearance compiler owns APCA autocorrection so artifact, provider
and generated-CSS paths cannot drift."* It emits no `--ds-*` of its own except the
validated `--ds-recipe-profile` channel (line 1428-1430).

#### 1b. CONFIRMED dual-authoring: two different colour-ramp algorithms, same channel

`packages/core/src/infrastructure/compilers/runtime/tenant-css/visual-config/index.ts`
composes the runtime/generated tenant stylesheet. Two independent derivations write
`--ds-color-{primary,secondary,accent}-{50..900}`, and the *second silently wins*.

**Emitter A — the declared authority (OKLCH, perceptual, ground-aware, gamut-mapped):**
`infrastructure/compilers/kernel/runtime/brand-theme/index.ts:315-334` — `deriveTenantColorRamps()`
emits `vars['--ds-color-${role.name}-${step}']` from `deriveOklchRamp(seed, ground, surface)`.
Invoked at `brand-theme/index.ts:608` (`Object.assign(vars, deriveTenantColorRamps(bt.palette))`).

**Emitter B — a second, unrelated sRGB mix ramp:**
`visual-config/index.ts:227-231` — `brandingVariables()` calls `buildRuntimeScale(colorValue)`
and emits `declarations['--ds-color-${tokenName}-${step}']` for the same 10 steps.
`buildRuntimeScale` (`kernel/foundation/css/color-math/index.ts:96-109`) is a naive
sRGB mix toward `#ffffff`/`#000000` — it is neither perceptual, nor ground-aware,
nor gamut-mapped.

**The collision point:** `visual-config/index.ts:485`

```ts
const lightDeclarations = { ...compiledBrandVars, ...baseDeclarations, ...appearanceVars };
```

`baseDeclarations` (line 476-480) contains `brandingVariables(...)`, so **Emitter B
overwrites Emitter A** for every ramp step of primary/secondary/accent. The dark
path repeats it at line 525-527 via `darkBrandingVariables()` → `buildDarkRuntimeScale`.

**Why this matters beyond aesthetics — the APCA gate validates a value that is not shipped.**
`scripts/build-vertical-artifacts.mjs:93-107` runs the compile-time APCA pairing check
against `compiledCssVariables` — i.e. against **Emitter A's** `--ds-color-{role}-900`.
On the runtime/DB path the value actually painted is **Emitter B's**, which was never
APCA-checked.

**Scope of the exposure.** The subordination that exists is partial and applies only
to bundled first-party tenants: `visual-config/index.ts:56-62` (`useCssOwnedBranding`)
→ `stripVisualBrandingFields` (line 94-101) removes the colour fields so
`brandingVariables()` returns `{}`. That flag is set only for bundled tenants —
`infrastructure/runtime/bootstrap/facade/react/provider/index.tsx:537,541`
(`isBundledTenant(slug) && !hasVisualBrandingFields(...)`). **For every DB customer
tenant the flag is false**, `branding` is repopulated from the brandTheme itself
(`visual-config/index.ts:146`, `mergeDefinedBranding(brandThemeToBranding(...), ...)`),
and both ramps are computed with the sRGB one winning.

**No test pins the interaction.** `buildRuntimeScale` appears in only three files —
`visual-config/index.ts`, `color-math/index.ts`, `color-math/tests/index.test.ts` —
and none of them compares it against `deriveTenantColorRamps`. The divergence suites
(`composition/tenant-theme/tests/divergence-fixtures.test.ts`,
`kernel/runtime/brand-theme/tests/tenant-divergence-matrix.test.ts`) cover
document-to-document divergence, not emitter-to-emitter. This is unacknowledged.

#### 1c. Bridge CSS — CLEAN (negative result, verified)

The task asked specifically whether bridge CSS re-declares tenant channels. It does not.

- `src/foundation/tokens/css/runtime/bridges/collapse.css` (240 lines) — **0** `--ds-*`
  declarations; it only *reads* them (`var(--ds-collapse-*)`).
- `src/foundation/tokens/css/runtime/bridges/collapse-paint.css` (27 lines) — **0**
  `--ds-*` declarations. Header marks it a deprecated compatibility source not
  imported by either public entrypoint.

Bridges consume channels; they do not author them. No finding here.

#### 1d. Third emitter for `--ds-motion-spring` (build-script authored)

`scripts/build-vertical-css.mjs:252-273` — `springOverrideBlock()` emits
`--ds-motion-spring` in a build-script-authored, unlayered block appended after the
tenant CSS (line 324). The script's own comment (lines 232-245) names the other two
authors: the `:root` cubic-bezier baseline in
`foundation/animations/transitions.css`, and the runtime `tokenOverrides` path
(`visual-config/index.ts:286`, `'--ds-motion-spring': overrides?.motion?.spring`).

Three authors for one channel. The precedence is reasoned in the comment and works,
but the authority lives in a build script rather than in a compiler, so nothing
type-checks or gates it.

---

## Subsystem 4 — App `--rt-*` hooks vs DS `--ds-*` channels

### Verdict: **CONFIRMED dual-authoring, in both directions**

Counts across `app-bithire/src` (`.css` files):

| Channel | Declarations | Distinct names |
|---|---|---|
| `--rt-*` declared by the app | 2038 | 599 |
| `--ds-*` declared by the app | **190** | — |
| `--ds-*` declared in app `.ts`/`.tsx` | 0 | — |

#### 4a. The app writes DS-owned chrome channels (190 declarations)

These are not app-local names — they are channels the BrandTheme chrome compiler
emits and the shipped artifact already declares. Verified three-way overlap:

| Channel | DS compiler emitter | Shipped bithire artifact | App re-declaration |
|---|---|---|---|
| `--ds-radius-button` | `kernel/foundation/css/chrome-variables/index.ts:862` | `artifacts/bithire/index.css:643` | `features/candidates/.../form-primitives/styles/index.css:132` |
| `--ds-sidebar-border` | `chrome-variables/index.ts:528` | `artifacts/bithire/index.css:719` | `vertical/surface/shell/app-layout/styles/index.css:16` |
| `--ds-tab-color` | `chrome-variables/index.ts:1641` | `artifacts/bithire/index.css:769` | `features/candidates/surface/components/feature-tabs/styles.css:60` |
| `--ds-tabs-list-bg` | `chrome-variables/index.ts:1646` | `artifacts/bithire/index.css:828` | `features/candidates/surface/components/feature-tabs/styles.css:28` |
| `--ds-button-secondary-bg` | (chrome.controls) | `artifacts/bithire/index.css:102` | `features/candidates/.../form-primitives/styles/index.css:188` |

Worst files by `--ds-*` declaration count:

```
23  features/candidates/surface/screens/record/create/view/sections/form-primitives/styles/index.css
17  features/candidates/surface/components/feature-tabs/styles.css
16  styles/detail-chrome.css
15  vertical/surface/shell/app-layout/styles/index.css
13  ui/cards/metric-signal-card/styles/index.css
12  ui/surfaces/styles/index.css
12  features/candidates/surface/screens/record/detail/wiring/styles/index.css
```

**The app's writes outrank the tenant artifact.** `app-bithire/src/styles/detail-chrome.css:2001-2060`
re-authors 16 DS button chrome channels under `:root[data-ds-root] :where(.rt-detail-actions, ...)`:

```
detail-chrome.css:2001  --ds-button-default-bg: color-mix(…)
detail-chrome.css:2022  --ds-button-secondary-bg: color-mix(…)
detail-chrome.css:2043  --ds-button-error-bg: color-mix(…)
detail-chrome.css:2058  --ds-button-danger-bg: var(--ds-button-error-bg)
```

`data-ds-root` is stamped on the **`<html>` element**, confirmed end-to-end:
`ui-design-system/.../runtime/foundation/root-attributes/ssr/index.ts:86-90` sets it in
`resolveDocumentRootAttributes`, and `app-bithire/src/app/layout.tsx:196-199` spreads
`scopedRootAttributes` onto `<html>`. Therefore `:root[data-ds-root]` = **(0,2,0)**,
which beats the artifact's `:is(html[data-tenant='bithire'], :where(…))` = **(0,1,1)**.
There are **168** `:root[data-ds-root]`-keyed rules in the app's CSS.

#### 4b. The DS writes app-namespace `--rt-*` channels (the sharper finding)

`--rt-*` is not an app-private namespace. The DS declares 54 `--rt-*` — 27 in
`artifacts/bithire/_source/extension.css` and their 27 generated copies in
`artifacts/bithire/index.css` — spanning **18 distinct names**. The DS also *reads*
`var(--rt-…)` in 183 places.

**13 of those 18 names are also declared by app-bithire**:

```
--rt-collection-preview-tone      --rt-detail-field-border
--rt-detail-control-inline-size   --rt-detail-field-divider
--rt-detail-coverage-border       --rt-detail-field-track-min
--rt-detail-coverage-cell-bg      --rt-detail-more-divider-line
--rt-detail-coverage-guide        --rt-detail-phone-bg
--rt-detail-soft-accent           --rt-detail-phone-border
--rt-premium-card-grid
```

**Strongest single piece of evidence — the same rule exists in both repos, with
different values.**

DS side, `artifacts/bithire/_source/extension.css:4343-4365`:

```css
html[data-tenant="bithire"]
  :where([data-bithire-detail-edit-panel="true"])
  :where([data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"]) {
  --rt-detail-field-border: color-mix(in srgb, var(--ds-color-primary) 9%, var(--ds-color-border-secondary));
  --rt-detail-field-divider: color-mix(in srgb, var(--ds-color-primary) 5%, var(--ds-color-border-secondary));
  --rt-detail-field-track-min: 308px;
}
```

App side, `app-bithire/src/styles/detail-chrome.css:282-292`:

```css
:root[data-ds-root]
  :where([data-bithire-detail-edit-panel="true"])
  :where([data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"]) {
  --rt-detail-field-border: var(--ds-card-border, var(--ds-color-border));
  --rt-detail-field-divider: var(--ds-card-header-border, var(--rt-detail-field-border));
  --rt-detail-field-track-min: 308px;
}
```

Identical descendant structure, identical `data-bithire-detail-*` hooks, same three
channels — two different authors, two different values. The DS's brand-tinted
`color-mix` (the Quiet Premium intent) loses: `:root[data-ds-root]` (0,2,0) beats
`html[data-tenant="bithire"]` (0,1,1). The DS's authored premium tint is dead code
wherever the app rule also matches.

Other confirmed collisions with file:line:

- `--rt-collection-preview-tone` — DS `extension.css:1839,1987,2839`; app
  `ui/tables/collection/preview/styles/index.css:9,25,41,57,73,89,105` (7 declarations)
- `--rt-premium-card-grid` — DS `extension.css:3527`; app `styles/foundation.css:19`
- `--rt-detail-soft-accent` — DS `extension.css:4131`; app `styles/detail-chrome.css:97`
- `--rt-detail-coverage-border` — DS `extension.css:6067`; app `styles/detail-chrome.css:1821`

Secondary observation (outside this sweep's remit, worth recording): the DS ships
CSS keyed on `data-bithire-detail-edit-panel` and `--rt-detail-*`. That is BitHire
product semantics living inside the design system, which the monorepo ownership
rules forbid.

#### 4c. Why the artifact's protection does not reach the app — the load-bearing gap

The artifact is made unlayered specifically so it outranks everything beneath it
(§2). That defence is aimed at the DS's own layered base, and there it works. It
provides **zero** protection against app CSS, because the app sits in the *same*
unlayered tier — later in source order and at higher specificity.

`app-bithire/src/app/globals.css`:

```
21  @import "@rottay/design-system/styles/bithire";   /* DS bundle: artifact is its unlayered tail */
24  @import "../styles/tab-transitions.css";
27  @import "../styles/index.css";
30  @import "../styles/ramps.css";
34  @import "../styles/detail-chrome.css";            /* app CSS, imported AFTER */
```

`@layer` occurrences in the whole of `app-bithire/src` CSS: **0**.

So both cascade mechanisms favour the app:

| | Artifact | App |
|---|---|---|
| Layer | unlayered | unlayered (same tier) |
| Source order | earlier (line 21) | later (lines 24–34) |
| Root-scope specificity | `:is(html[data-tenant='bithire'], …)` = **(0,1,1)** | `:root[data-ds-root]` = **(0,2,0)** |

The app wins on specificity *and* on source order. The 190 `--ds-*` and 13 `--rt-*`
app re-declarations are therefore not merely co-declared — they are the **effective**
values, silently replacing compiler-derived ones. The DS's own governance
(`lint:artifacts`, `engine-token-audit`, the visual-authority coverage model) all
stop at the package boundary and cannot see any of it.

---

## Subsystem 2 — Static vertical artifacts vs `packages/core/styles`

### Verdict: **SINGLE with explicit coverage** (869 shared channels, mechanically subordinated)

Measured on the shipped bundle `packages/core/styles/bithire.css` (89,053 lines).
Section boundaries:

| Section | Lines | Distinct `--ds-*` declared |
|---|---|---|
| Font packs + base tokens (`base.css`, imports inlined) | 5–80,156 | 3,574 |
| Modern engine | 80,157–81,764 | **0** |
| bithire tenant artifact | 81,765–end | 1,393 |
| **base ∩ artifact** | — | **869** |
| engine ∩ artifact | — | 0 |

869 channels are declared by both the base token layer and the tenant artifact in the
same shipped file. **This is not dual authorship** — the subordination is mechanical
and total:

- The base layer is inside declared cascade layers. Bundle line 107 declares the order:
  `@layer theme, base, rottay-framework, rottay-reset, rottay-tokens, rottay-motion,
  rottay-components, rottay-engines, rottay-personality, rottay-responsive, components,
  utilities;` — 405 `@layer` blocks in the bundle.
- The **artifact section is completely unlayered** (verified: zero `@layer` occurrences
  after line 81,765).

Unlayered rules outrank every cascade layer unconditionally, regardless of specificity.
So the artifact deterministically wins all 869. This is the design stated in
`scripts/build-vertical-css.mjs:287-306`, and it holds. The modern engine declares no
`--ds-*` at all — it only reads them.

There is also only **one emitter** into the bundle: `build-vertical-css.mjs:309-325`
builds a single in-memory string and writes it to both `dist/` and `styles/`.

Structural facts established:

- `packages/core/styles/{index,bithire,evnto,platform,rottay,modern}.css` are
  **generated build outputs**, not authored sources — `scripts/build-vertical-css.mjs:362-366`
  writes `dist/` and `styles/` from the same in-memory bundle.
- Assembly order per vertical bundle (`build-vertical-css.mjs:309-325`):
  font packs → `base.css` (with `@import`s inlined) → modern engine → tenant artifact
  → spring override block.
- `styles/rottay.css` is a byte-identical duplicate of `styles/platform.css`
  (line 364-366) — one bundle, two committed filenames (`cmp` confirms identical).
  The package export `./styles/rottay` resolves to `./dist/platform.css`, so this is
  an alias, not a second source. `styles/` is excluded from the npm `files` field;
  only `dist/` ships.
- Tenant CSS is deliberately **unlayered** (`build-vertical-css.mjs:287-306`) so the
  artifact outranks every `@layer`ed emitter beneath it. That is an explicit,
  reasoned subordination of the base-token layer to the artifact.

The remaining question — whether base tokens and the artifact declare overlapping
channels, and whether any property is emitted twice under an *identical* selector —
is a measurement over the ~89k-line bundle.

---

## Subsystem 3 — Generated artifacts vs manually authored guardrails

### Verdict: **CONFIRMED — one governing ratchet exists, covers one family, is parked at 152**

`_source/extension.css` is the one *declared* manual layer over generated output
(renderer header, `artifact-renderer/index.ts:99-105`). What matters is how much of
its 188-property overlap with the compiled block is actually governed.

**Exactly one gate governs it, and only for the colour-ramp family.**
`scripts/engine-token-audit.mjs:2432-2463` — `countHandAuthoredRampHex()`. Its own
doc comment states the mechanism explicitly and correctly:

> "`compileBrandTheme` (deriveTenantColorRamps) now derives this ramp mechanically per
> tenant surface, so a hand-authored ramp step here is drift, not intent: it either
> duplicates (redundant, will silently rot out of sync) or — because the extension's
> selector always has equal-or-higher specificity than the compiled block's —
> **shadows the derivation outright**."

The team knows the extension shadows the compiler. Three limits on that gate:

1. **It is a decrease-only ratchet parked at 152, not 0.**
   `scripts/engine-token-audit.baseline.json:20` → `"color.handAuthoredRampSteps": 152`.
   Measured live, matching the baseline exactly:

   | slug | hand-authored ramp hex steps in `_source/extension.css` |
   |---|---|
   | bithire | 28 (all in the dark block) |
   | evnto | 0 |
   | rottay | 124 |
   | **total** | **152** |

2. **The counter's documented exception does not match what it measures.** The comment
   sanctions "rottay's dark-default block" as "the one accepted, documented exception"
   and says "bithire's and evnto's default (light) blocks … must stay at 0". The light
   blocks are indeed 0 — but bithire carries 28 hand-authored ramp steps in its **dark**
   block (`artifacts/bithire/_source/extension.css:374-404`, under
   `html[data-tenant="bithire"][data-theme="dark"], html[data-tenant="bithire"].dark`).
   The counter is global across slugs and modes, so those 28 are inside the 152 with no
   documented exception covering them.

3. **The gate is blind to non-hex values.** Its regex requires `#[0-9a-fA-F]{3,8};`
   (`engine-token-audit.mjs:2452-2453`). A ramp step written as `color-mix(...)`,
   `oklch(...)` or `var(...)` shadows the derivation identically and is never counted.

**Coverage of the wider overlap: 28 of 188.** Only 28 of the 188 dual-declared
properties are colour-ramp steps. The other **160** — `--ds-table-header-*`,
`--ds-input-{bg,border}-*`, `--ds-card-*`, `--ds-sidebar-*`, `--ds-shadow-*`,
`--ds-radius-*`, `--ds-font-family-*`, `--ds-letter-spacing-*`, `--ds-line-height-*`,
`--ds-workspace-shell-*`, `--ds-motion-*` — have **no gate at all**.

`scripts/css-source-integrity-gate.mjs` does not close this: it checks patch residue,
conflict markers, chromatic left rails and an invalid spacing family — not
generated-vs-authored channel overlap.

No other banner-marked manual override layer was found redefining compiler-owned
variables (bridges verified clean in §1c).

---

## Summary of verdicts

| # | Subsystem | Verdict |
|---|---|---|
| 1 | TenantTheme DB compiler vs subordinate bridges | **MIXED** — provider/artifact axis is SINGLE with explicit coverage (clean); bridge CSS CLEAN (0 declarations); **CONFIRMED dual-authoring** inside `visual-config` (two colour-ramp algorithms) and a build-script third author for `--ds-motion-spring` |
| 2 | Static vertical artifacts vs `packages/core/styles` | **SINGLE with explicit coverage** — 869 shared channels, but base is layered and artifact is unlayered, so subordination is total and mechanical; one emitter builds the bundle |
| 3 | Generated artifacts vs manually authored guardrails | **CONFIRMED** — `_source/extension.css` dual-declares 188 channels with the compiled block, **44 of them at identical specificity where the compiler's value is simply dead**; only the 28 colour-ramp steps are governed, by a decrease-only ratchet parked at **152** (not 0) that is blind to non-hex values; the other 160 have no gate |
| 4 | App `--rt-*` hooks vs DS `--ds-*` channels | **CONFIRMED, bidirectional** — app declares 190 `--ds-*` (DS-owned chrome channels); DS declares 18 `--rt-*` of which 13 collide with app declarations; app wins on both specificity and source order |

**See the Addendum below** for breadth-sweep results that strengthen Subsystem 3:
BitHire's half-reverted dark palette with an inverted-polarity ramp (§A, highest
severity in this sweep), a same-file `:root` duplicate defeating a themed token for
every tenant (§B), and 223 identical-selector duplicate groups bundle-wide (§D).

## The one-line finding

The design system's single-authority mechanisms are real and well-built **inside**
the package — the per-channel `coverage` model, the layered/unlayered split, the
`lint:artifacts` parity gate. Every one of them stops at the package boundary. The
consuming app writes the same channels, unlayered, later, and more specific, and
nothing in the system can observe it.

## What would raise confidence further (not required for the verdicts above)

- Runtime confirmation (DB → SSR → browser `getComputedStyle`) that Emitter B's sRGB
  ramp is the painted value for a DB customer tenant. The verdict rests on static
  merge order at `visual-config/index.ts:485`, which is unambiguous, but a live read
  would close it.
- A per-property diff of the 869 base∩artifact overlap to see how many artifact
  values are byte-identical to the base default (redundant emission vs real override).
  The equivalent diff was completed for the compiled-vs-extension collision (44
  different / 4 identical of 48); the base∩artifact set was not diffed by value
  because its subordination is total either way.
- A value-level diff of the remaining 140 overlapping properties that collide through
  *different* selectors, to separate legitimate mode-scoped overrides (dark blocks)
  from unintended shadowing.

---

# Addendum — breadth sweep results (independently re-verified)

Two parallel breadth passes surfaced material the targeted analysis above missed.
Every claim below was re-checked directly against the files before being recorded;
where the original framing overstated the evidence, the correction is noted.

## A. BitHire's dark mode is half-reverted by a same-selector guard — and the ramp polarity inverts

`artifacts/bithire/_source/extension.css` contains two blocks with **byte-identical
selector text**:

```
:374  html[data-tenant="bithire"][data-theme="dark"], html[data-tenant="bithire"].dark {   /* BITHIRE DARK MODE */
      color-scheme: dark;
:641  html[data-tenant="bithire"][data-theme="dark"], html[data-tenant="bithire"].dark {   /* BITHIRE CLEAR MODE GUARD */
      color-scheme: light;
```

**The guard is intentional and documented.** Its banner reads: *"BitHire intentionally
stays in a light, ownable blue aesthetic even when the shell receives `.dark` from
system/host preferences."* This is a deliberate product decision, not a bug, and must
not be reported as one.

**Corrected measurement.** A parallel pass reported "all 55 differ — the entire
authored dark palette is dead." Direct measurement shows that is overstated:

| | count |
|---|---|
| Declarations in the DARK MODE block | 190 |
| Declarations in the CLEAR MODE GUARD block | 106 |
| Dark declarations the guard overrides | **55** (54 with different values) |
| Guard-only declarations | 51 |
| **Dark declarations that SURVIVE the guard** | **135** |

So the palette is not wholly dead — it is **half-reverted**, which is the actual
problem. The guard reverts grounds and text but **does not revert the brand ramp**:

```
guard installs:        --ds-color-bg-primary: #ffffff
dark block survives:   --ds-color-primary-50:  #0d1b2a   (darkest)
                       --ds-color-primary-500: #1e84e6
                       --ds-color-primary-900: #d6eafd   (lightest)
```

In a **dark** ramp the polarity is inverted: step 900 is the *lightest* value, because
it is the far-from-ground extreme against a dark canvas. The guard puts a **white**
ground underneath it. Under `.dark`, BitHire therefore paints
`--ds-color-primary-900` = `#d6eafd` on `--ds-color-bg-primary` = `#ffffff` —
near-white on white.

This directly contradicts the contract the APCA gate asserts for that exact channel
(`scripts/build-vertical-artifacts.mjs:78-91`: step-900 is "the far-from-ground
extreme, meant to be usable as readable text/icon color"). The gate never catches it,
because it checks the *compiled* ramp against the *compiled* ground; this hybrid state
is assembled by two hand-authored blocks the compiler never sees.

**This is the highest-severity item in the sweep**: an intentional guard, implemented
as same-selector dead-code layering, producing a colour state neither block was
designed for.

## B. Genuine same-file, same-`:root` duplicate — `--ds-divider-text-color`

`src/foundation/tokens/css/foundation/themes/default.css`, both declarations inside
the **same** `:root {` block opened at line 12 (verified by brace-depth: depth is 1 at
both lines and never returns to 0 between them):

```
:1092   --ds-divider-text-color: var(--ds-color-text-primary);
:2019   --ds-divider-text-color: #737373;          ← wins
```

A hardcoded neutral defeats the themed token for **every tenant**, 927 lines apart in
one file, with no override justification. No specificity or layering subtlety is
involved — this is a straightforward defect.

## C. Two token files emit into the same layer and selector (documented, intentional)

165 properties are declared twice under the identical selector `@layer rottay-tokens`
→ `:root`, sourced from two files both imported into that one layer by
`facade/entrypoints/styles.css:43-44` (and `base.css:31-32`):

```
@import "../../foundation/base/index.css"      layer(rottay-tokens);
@import "../../foundation/themes/default.css"  layer(rottay-tokens);
```

Families affected: `--ds-type-*` (56), `--ds-spacing-*` (22), `--ds-font-size-*` (16),
`--ds-z-index-*` (11), `--ds-shadow-*` (11), `--ds-border-*` (9), `--ds-font-weight-*` (8),
plus line-height, letter-spacing, divider, font-family and density.

This one is **declared**: `foundation/base/spacing.css:27` and
`foundation/base/typography.css:57` both state that "themes/default.css redefines …
and wins the cascade". It is still two emitters for one channel, and 3 of the 165
change semantics rather than merely restating (`--ds-font-family-base`,
`--ds-border-color-default`, `--ds-type-body-font-size`) — e.g.
`--ds-font-family-base` is a literal `-apple-system` stack at bundle line 466 and
`var(--ds-font-sans)` at line 1752, with the first dead.

## D. Bundle-wide identical-selector duplicates

`packages/core/styles/bithire.css`: 6,741 `--ds-*` declarations across 4,098 distinct
names. **223 (property, identical-selector) groups are declared two or more times** —
451 declarations, 228 redundant. Of those 223, **121 carry differing values** (silent
override, one emitter dead) and 102 are byte-identical waste.

Worst case is a **three-way** collision on the table family, all under one selector:
`--ds-table-border` at `bithire.css:83319` (`#1d2a38`) → `:83497` (`#d4e0ea`) →
`:83675` (`var(--ds-color-border)`). Same pattern for `--ds-table-header-bg`,
`--ds-table-row-bg-hover`, `--ds-table-row-bg-striped`, `--ds-table-row-border`.

Explicitly **not** problems: the highest-count names (`--ds-chart-mark-color` 10×,
`--ds-tooltip-*` 9×, `--ds-card-*` 9×, `--ds-badge-tone-*` 7×) each sit under a
different tone/variant selector, and `--ds-color-primary` (3×) is a clean three-tier
cascade. Raw redeclaration counts are not evidence without selector context.

## E. Two more banner-marked manual layers that declare compiler-owned channels

Correcting §3 above, which reported no other banner-marked override layer:

- `foundation/responsive/language-arabic-root.css:2` — *"Arabic tracking guard — ROOT
  scope, unlayered."* ~30 letter-spacing declarations under `html[lang]:lang(ar)` at
  `:31`. Its header (`:9-11`) states outright that it exists to beat a compiler-owned
  channel ("bithire ships `--ds-letter-spacing-display: -0.035em`"). Unlayered by
  design, so it outranks the layered token base.
- `runtime/personality.css:2` — *"Personality CSS Overrides"*. 20 declarations: 7
  typography-dial vars in `:root` at `:37-50`, and 13 `--ds-motion-*: 0s !important`
  under `html[data-ds-motion='reduced']` at `:778-790`. Its header (`:31-34`) concedes
  that `SystemCssVariablesBridge` writes the same `:root` vars unlayered and wins.
  (This is a distinct pair from §1a: there the bridge loses to the *artifact*; here
  `personality.css`'s own layered `:root` loses to the *bridge*. Both hold.)

Additional verified clean negatives (banner present, zero `--ds-*` declared):
`runtime/engines/modern/framework-bridge.css` (450 lines, header: "Temporary ownership
boundary … utility shims") and `packages/showroom/src/app/globals.css` (1289 lines,
declares only `--showroom-*`).

## F. Artifact tree, complete

Six files, nothing else under `foundation/tokens/css/facade/artifacts/`:

| file | lines | `--ds-*` decls |
|---|---|---|
| `bithire/_source/extension.css` | 6247 | 848 |
| `bithire/index.css` (GENERATED) | 7288 | 1872 |
| `evnto/_source/extension.css` | 340 | 227 |
| `evnto/index.css` (GENERATED) | 676 | 546 |
| `rottay/_source/extension.css` | 3050 | 1935 |
| `rottay/index.css` (GENERATED) | 3529 | 2397 |

Any-selector compiled∩authored overlap per artifact — **note this is a different
measure from the same-selector figures in §3**, which is why rottay shows 267 here and
0 there:

| artifact | compiled unique | authored unique | overlap (any selector) | overlap (same selector) |
|---|---|---|---|---|
| bithire | 1024 | 557 | 188 | **48** |
| evnto | 319 | 159 | 82 | 0 |
| rottay | 462 | 976 | **267** | 0 |

rottay is the most heavily hand-authored artifact by a wide margin: its extension
declares 1935 `--ds-*` against a 462-property compiled block, and its authored
selectors (`:not([data-theme='light']):not(.light)` = 977 decls at `_source:7`, and
`.light` = 958 at `_source:1577`) are (0,2,1)–(0,3,1) against the compiled block's
(0,1,1), so the authored half wins every contested channel. Verified examples in
`artifacts/rottay/index.css`: `--ds-card-bg` compiled `#18181B` at `:71` vs authored
`#FFFFFF` at `:2502`; `--ds-button-primary-bg` compiled `#FFFFFF` at `:44` vs authored
`#0A0A0A` at `:2357` — inverted in both cases.

## Revised verdict for Subsystem 3

Unchanged in direction, stronger in degree. Beyond the 44 dead compiler values already
recorded, the artifact layer also contains an intentional same-selector guard that
half-reverts BitHire's dark palette and leaves an inverted-polarity ramp on a light
ground (§A), plus a same-file `:root` duplicate defeating a themed token for all
tenants (§B). 223 identical-selector duplicate groups exist bundle-wide, 121 with
differing values.
