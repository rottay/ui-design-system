# Source-to-Runtime Trace — Two Channels (Round 3)

Auditor: Claude (Fable 5), read-only against `/Users/daniel/Developer/Rottay/`.
Constraints honored: no edits/builds/tests/servers/git changes in the repo tree;
Rottay channel verified against the frozen snapshot at
`/private/tmp/rottay-design-platform-independent-audit-round-3/snapshots/rottay/`
(SHA256 recorded in `methodology.md`); BitHire channel verified against the live
repo artifact (its snapshot SHA is identical per the same methodology capture —
not itself re-verified in this pass, since only the Rottay hop was specified as
snapshot-mandatory by the task).

---

## CHANNEL 1 — `--ds-color-primary` for BitHire

### Hop table

| Hop | File:Line | Content excerpt | Author |
|---|---|---|---|
| Source (seed) | `foundation/tokens/ts/presentation/brand-themes/bithire/index.ts:38` | `primaryColor: "#3A6FB0",` | BrandTheme TS (compiler-owned) |
| Source (dark seed, declared but see Compiler note) | `.../bithire/index.ts:41` | `darkPrimaryColor: "#6BB5F5",` | BrandTheme TS |
| Compiler (flat emission) | `infrastructure/compilers/kernel/runtime/brand-theme/index.ts:471-472` | `if (bt.palette.primaryColor) vars["--ds-color-primary"] = bt.palette.primaryColor;` | `brandThemeToCssVariables()` |
| Compiler (ramp fn, not invoked for this seed at runtime for bithire) | `.../brand-theme/index.ts:315-336` (`deriveTenantColorRamps`), guarded by `isDarkSurfacePalette()` at `.../brand-theme/index.ts:268-272` | Derives `--ds-color-primary-{50..900}` via `deriveOklchRamp(seed, ground, surface)`; dark seed branch only fires when `isDarkSurfacePalette(palette)` is true. BitHire has `backgroundColor` set → classified **light-surface** → the dark branch (`role.dark`) is never taken for bithire; only the light seed (`#3A6FB0`) feeds the ramp. | `deriveTenantColorRamps()`, called at `.../brand-theme/index.ts:608` |
| Compiler (entry point) | `.../brand-theme/index.ts:975-1002` (`compileBrandTheme`) | Calls `brandThemeToCssVariables(brandTheme)` (line 1000) and `brandThemeToChromeVariables(brandTheme)` (line 1001); merges into one flat `cssVariables` map — no light/dark branching for chrome. | `compileBrandTheme()` |
| Generator selector spec | `infrastructure/compilers/runtime/tenant-css/artifact-renderer/index.ts:47-52` | `slug: 'bithire', selector: "html[data-tenant='bithire']"` — **unconditional**, no `[data-theme]` gate | `FIRST_PARTY_ARTIFACT_SPECS` |
| Artifact — compiled block | `foundation/tokens/css/facade/artifacts/bithire/index.css:14` (selector, unconditional) / `:227` (declaration) | `--ds-color-primary: #3A6FB0;` inside `:is(html[data-tenant='bithire'], :where([data-ds-root][data-vertical='bithire'])) { ... }` (lines 14–1039) | compileBrandTheme output |
| Extension source — light abstention | `.../bithire/_source/extension.css:1-11` | Selector `html[data-tenant="bithire"]:not([data-theme="dark"]):not(.dark) {` declares `--ds-color-primary-hover` and `--ds-focus-ring-color: var(--ds-color-primary)`, but **deliberately does not redeclare `--ds-color-primary`** — inline comment: *"declaring it here would silently shadow the derivation via this block's higher selector specificity"* | Hand-authored (documented abstention) |
| Extension source — dark override | `.../bithire/_source/extension.css:379-391` | Selector `html[data-tenant="bithire"][data-theme="dark"], html[data-tenant="bithire"].dark {` → `--ds-color-primary-50..900` fully hand-picked ramp; `--ds-color-primary: #1e84e6;` at line 391 | Hand-authored (second author) |
| Artifact — dark block | `.../bithire/index.css:1415-1416` (selector) / `:1432` (declaration) | `:is(html[data-tenant="bithire"], :where(...)) [data-theme="dark"], ....dark { --ds-color-primary: #1e84e6; ... }` — selector rewritten from extension.css's plain form by `projectFirstPartyArtifactScopes` (`kernel/foundation/css/scope-projection/`, invoked at `artifact-renderer/index.ts:124`) | Hand-authored, mechanically re-scoped |
| Generator assembly | `scripts/build-vertical-artifacts.mjs:112-125` + `artifact-renderer/index.ts:82-126` | `index.css = compileBrandTheme(...) → compiledBlock` then `extensionCss` (verbatim file read, line 122) concatenated after, both passed through one shared `projectFirstPartyArtifactScopes()` call | Generator (mechanical) |
| Bundle | `packages/core/styles/bithire.css:1498` (base engine default, layered/lower precedence) / `:81992` (compiled block, unconditional selector at `:81779`) / `:83197` (dark block, selector at `:83181`) | `--ds-color-primary: var(--ds-color-primary-500);` (base engine alias) → `#3A6FB0` (unconditional) → `#1e84e6` (`.dark`/`[data-theme="dark"]`) — same values/selectors as the artifact hop, just re-anchored at bundle-file line numbers because fonts + base engine CSS precede the tenant block | `build-vertical-css.mjs` (appends artifact after tenant-free base, unlayered) |

### Effective winner per root state

- **Default / explicit light** (no `data-theme` attr, or `[data-theme="light"]`/`.light` — BitHire declares no separate light block, so "default" and "explicit light" both fall through to the unconditional compiled block): **`#3A6FB0`**, sole author = `compileBrandTheme`. No contest — extension.css documented its own abstention.
- **Dark** (`[data-theme="dark"]` or `.dark`): **`#1e84e6`**, sole author = hand-authored `extension.css`. Wins by genuine specificity (base selector + attribute/class beats the compiled block's base-only selector) — correct cascade mechanics, but the value is disconnected from the BrandTheme TS contract: `darkPrimaryColor: #6BB5F5` (the documented dark seed) is never the shipped `--ds-color-primary`. It survives only as `--ds-color-primary-700` (one incidental ramp step inside the extension's own hand-picked ramp) and as the unused `--ds-color-dark-primary` alias (`.../brand-theme/index.ts:497-498`, documented as "consumed by ThemeProvider" — a different, DB-tenant runtime path, not this static cascade).

### Six authority properties

1. **Author uniqueness** — PASSES for default/light (compiler sole author, extension documents its abstention). VIOLATES for dark: two independent declarants of "the tenant's dark primary" exist (TS `darkPrimaryColor` and CSS `#1e84e6`) and they disagree; only one ships.
2. **Emitter uniqueness** — PASSES in the narrow sense (no two emitters target the *same selector* for either state — the compiler never emits a dark `[data-theme="dark"]`-scoped rule at all, since `isDarkSurfacePalette()` is false for this light-surface tenant). VIOLATES in the broader sense: two channels (compiler-derivable ramp vs. hand CSS) both purport to represent the same design intent with no reconciliation step.
3. **Writer uniqueness** — Not applicable at the static-CSS layer (no runtime JS writer found competing here); DB-tenant `ThemeProvider` path is a separate code path not exercised by this first-party artifact. SIGHTED-PENDING for full confidence (see probe below).
4. **Precedence correctness** — PASSES. The dark block's selector is objectively more specific (base + attribute/class) than the compiled block's base-only selector; it wins deterministically and as apparently intended.
5. **Behavioral propagation** — PASSES for default/light (editing `palette.primaryColor` + regenerate changes the shipped value). VIOLATES for dark: editing `palette.darkPrimaryColor` + regenerate does **not** change the shipped dark `--ds-color-primary` (`#1e84e6` is a hardcoded literal in `extension.css`, requiring a separate manual edit) — the documented "source" is not behaviorally canonical for this sub-channel.
6. **Negative drill** — UNKNOWN this session. No gate (`lint:artifacts`, parity tests) was executed (read-only constraint). Unverified whether introducing a third declaration or widening the drift between `darkPrimaryColor` and the hand-picked `#1e84e6` would fail any existing check.

---

## CHANNEL 2 — `--ds-card-bg` for Rottay

Rottay's brand theme is authored under the **`platform`** folder (`brand-themes/platform/index.ts`, exporting `id: 'rottay'`); `FIRST_PARTY_ARTIFACT_SPECS` confirms `slug: 'rottay'` resolves `verticalKey: 'platform'` and `authoredThemePath` pointing at that same file — verified, not assumed.

### Hop table

| Hop | File:Line | Content excerpt | Author |
|---|---|---|---|
| Source | `foundation/tokens/ts/presentation/brand-themes/platform/index.ts:226` | `bg: '#18181B',` inside `chrome.cardComponent` (id: `'rottay'`) | BrandTheme TS |
| Compiler (chrome emission) | `infrastructure/compilers/kernel/foundation/css/chrome-variables/index.ts:1267-1286` | `if (chrome.cardComponent) { const cc = chrome.cardComponent; ... if (cc.bg) vars["--ds-card-bg"] = cc.bg; }` (declaration at line 1286, exact) | `chromeToVariables()`, exported at line 518 |
| Compiler (bridge) | `.../brand-theme/index.ts:946-950` | `export function brandThemeToChromeVariables(bt) { return chromeToVariables(bt.chrome); }` | brand-theme compiler → chrome-variables compiler |
| Compiler (entry point) | `.../brand-theme/index.ts:1001` | `const chromeVars = brandThemeToChromeVariables(brandTheme);` merged flat into `cssVariables`, no light/dark split (chrome has no per-mode sub-shape in the `BrandTheme` contract) | `compileBrandTheme()` |
| Generator selector spec | `artifact-renderer/index.ts:61-65` | `slug: 'rottay', verticalKey: 'platform', selector: "html[data-tenant='rottay'][data-theme='light'], html[data-tenant='rottay'].light"` — **gated to light only**, unlike BitHire's unconditional selector | `FIRST_PARTY_ARTIFACT_SPECS` (deliberate, explicit — not a bug in the spec table) |
| Artifact — compiled block | Snapshot `rottay/index.css:14` (selector, `[data-theme='light'], .light`, lines 14-477) / `:71` (declaration) | `--ds-card-bg: #18181B;` — a near-black value shipped under the **light**-mode selector | compileBrandTheme output |
| Extension source — default/dark | `.../rottay/_source/extension.css:1-8` (header + selector) / `:477` (declaration) | Header: *"ROTTAY DARK THEME (default for tenant) — rottayBrandTheme.chrome ... is single-valued and dark-authored; it cannot represent both themes, so palette and chrome for this state are declared in this governed extension."* Selector: `html[data-tenant='rottay']:not([data-theme='light']):not(.light) {` → `--ds-card-bg: #18181B;` (same value as compiled, hand-copied forward) | Hand-authored (documented necessity) |
| Extension source — explicit light | `.../rottay/_source/extension.css:1577` (selector) / `:2023` (declaration) | `html[data-tenant='rottay'].light {` → `--ds-card-bg: #FFFFFF;` — genuinely different (correct) light value | Hand-authored (second author, same selector as compiled block) |
| Artifact — default/dark block | Snapshot `rottay/index.css:486` (selector, lines 486-2046) / `:956` (declaration) | `:is(html[data-tenant='rottay'], :where(...)) :not([data-theme='light']):not(.light) { --ds-card-bg: #18181B; ... }` | Hand-authored, mechanically re-scoped |
| Artifact — explicit light block | Snapshot `rottay/index.css:2055-2056` (selector, lines 2055-3529) / `:2502` (declaration) | `:is(...) [data-theme='light'], :is(...) .light { --ds-card-bg: #FFFFFF; ... }` — **identical selector** to the compiled block, appears **later** in the file | Hand-authored, mechanically re-scoped |
| Bundle | `packages/core/styles/rottay.css:81758` (default/dark, selector at `:81701`... *correction, see note* ) / `:82643` (default/dark 2nd copy region, selector at `:82173`) / `:84189` (explicit light, selector at `:83743`) | Same three values/selectors as the artifact hop, re-anchored at bundle line numbers | `build-vertical-css.mjs` |
| Bundle identity | `packages/core/styles/rottay.css` vs `packages/core/styles/platform.css` | `cmp -s` → exit 0, **byte-identical**. Bundle's own header banner literally reads `/* @rottay/design-system - platform vertical bundle */` even inside the file named `rottay.css` | Confirms "rottay" is a re-exported alias of the "platform" bundle, not a separate compiled product |

Verified with an explicit selector/close-brace boundary scan (not just nearest-line-above): `rottay.css:81701-82164` is the compiled block (`[data-theme='light'], .light`, declaration at `:81758` = `#18181B`); `:82173-83733` is the extension default/dark block (`:not(light)`, declaration at `:82643` = `#18181B`); `:83742-83743`→close is the extension explicit-light block (`[data-theme='light'], .light` again, declaration at `:84189` = `#FFFFFF`). Matches the artifact hop 1:1 by selector, order, and value.

### Effective winner per root state

- **Default** (no `data-theme` attribute, no `.light`/`.dark` class): compiled block's selector (`[data-theme='light'], .light`) does **not match** → compiler contributes nothing. Only the extension's `:not([data-theme='light']):not(.light)` block matches → **`#18181B`**, sole author = `extension.css`.
- **Dark** (`[data-theme='dark']` or `.dark`): Rottay has **no dedicated `[data-theme='dark']` selector anywhere** (confirmed: zero matches for `data-theme='dark'` or `.dark` in both the extension source and the compiled artifact). Dark falls through to the same `:not(light)` catch-all as default → **`#18181B`**, same sole author.
- **Light** (`[data-theme='light']` or `.light`): **both** the compiled block and the extension's light block target the identical selector at equal specificity. The extension's declaration appears **later in the concatenated file** (compiled block is emitted first per `renderVerticalArtifact`, lines 112-121 of `artifact-renderer/index.ts`) → wins by **CSS source-order tiebreak**, not specificity. Effective value: **`#FFFFFF`**. The compiled `#18181B` is present in the shipped CSS but is dead paint in every reachable state.

### Six authority properties

1. **Author uniqueness** — VIOLATES. Confirmed by the extension.css's own header comment: the TS contract is structurally single-valued and cannot represent both themes, so a second author (hand CSS) is *necessary* — not an oversight, but still two authors for one semantic channel.
2. **Emitter uniqueness** — VIOLATES, and more severely than Channel 1: the compiled emitter and the hand emitter target the **exact same selector** (`[data-theme='light'], .light`) with **different values**, a genuine same-selector collision.
3. **Writer uniqueness** — SIGHTED-PENDING (static analysis only; no competing runtime writer found in this layer, but not verified live).
4. **Precedence correctness** — VIOLATES. The light-state winner is decided by concatenation order (compiled-then-extension), not by any selector-specificity design. Nothing in the CSS itself signals that the compiled declaration is meant to be inert; a future reordering of the generator's assembly (or moving the compiled block after the extension) would silently flip which value ships, with the CSS at each end structurally identical.
5. **Behavioral propagation** — VIOLATES for all three states as currently shipped: editing `chrome.cardComponent.bg` in `platform/index.ts` and regenerating changes the compiled `#18181B` line (artifact line 71 / snapshot), but that line has **zero observable effect** in Default/Dark (compiler doesn't match there) and **zero observable effect** in Light (shadowed by the later, same-specificity extension rule). The "canonical" TS source for this channel currently has no reachable output — this is the strongest violation found in either channel.
6. **Negative drill** — UNKNOWN this session (no gates executed, read-only constraint).

---

## SIGHTED-PENDING — DOM/computed-style probe spec (for Codex or a live session to close)

Both channels' artifact-and-bundle-layer conclusions above are CSS-source-level (static reasoning about selector text, specificity, and file order). They have **not** been confirmed against a live browser's cascade resolution or against any runtime JS that might additionally write inline styles/CSS custom properties on `document.documentElement` (e.g. a `ThemeProvider` effect). Close this with:

**Servers** (per each app's `package.json`, confirmed this session):
- BitHire app: `app-bithire`, `pnpm dev` → `next dev --webpack -p 3001` → `http://localhost:3001`
- DS Showroom (hosts the `rottay` tenant as its own default/marketing brand — confirmed via `theme-switcher`, `theme-preview-grid.tsx`, and `probe/brand-studio/page.tsx` all defaulting to `slug: 'rottay'`): `ui-design-system/packages/showroom`, `pnpm dev` → `next dev --webpack --port 7001` → `http://localhost:7001` (candidate route: `/foundations/themes`, or `/probe/brand-studio`)

**Probe (run in each page's browser console, or via a Playwright/CDP script)**:

```js
// Channel 1 — BitHire, on http://localhost:3001 (or showroom /verticals/bithire/*)
const root = document.documentElement;
const read = () => getComputedStyle(root).getPropertyValue('--ds-color-primary').trim();

console.log('default/light:', read());              // expect #3A6FB0
root.setAttribute('data-theme', 'dark');
console.log('dark:', read());                        // expect #1e84e6 (NOT #6BB5F5)
root.removeAttribute('data-theme');
```

```js
// Channel 2 — Rottay, on http://localhost:7001
const root = document.documentElement; // expect data-tenant="rottay" already present
const read = () => getComputedStyle(root).getPropertyValue('--ds-card-bg').trim();

console.log('default (no data-theme):', read());     // expect #18181B
root.setAttribute('data-theme', 'dark');
console.log('explicit dark:', read());                // expect #18181B (same — no dedicated dark rule)
root.setAttribute('data-theme', 'light');
console.log('explicit light:', read());                // expect #FFFFFF — confirms source-order win over the compiled #18181B
root.removeAttribute('data-theme');
```

**Deeper authorship check** (optional, resolves property #2/#4 with certainty rather than static inference): enumerate matched rules directly via CSSOM instead of trusting `getComputedStyle`'s single resolved value —

```js
[...document.styleSheets].flatMap(s => {
  try { return [...s.cssRules]; } catch { return []; }
}).filter(r => r.selectorText?.includes("data-tenant='rottay'") && r.style?.getPropertyValue('--ds-card-bg'))
  .map(r => ({ selector: r.selectorText, value: r.style.getPropertyValue('--ds-card-bg') }));
```
This lists every rule that declares `--ds-card-bg` for the rottay selector family in file/parse order, which is the ground truth for the "wins by later source order" claim above (currently inferred from static file concatenation order, not from a live `CSSStyleSheet.cssRules` walk).

Also worth checking live: whether any React effect (`ThemeProvider`, `DesignSystemProvider`) sets `root.style.setProperty('--ds-color-primary', ...)` or `--ds-card-bg` as an **inline style** — that would outrank every stylesheet rule regardless of the static analysis above, and was out of scope for a read-only source pass.

---

## Files written

- `/private/tmp/rottay-design-platform-independent-audit-round-3/source-to-runtime-trace.md` (this file)
