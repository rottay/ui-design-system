# Overlap Classification A-I — FINAL (Round 3)

Date: 2026-07-27. Adjudicated by the orchestrator (Claude) over the machine classification
produced from the three overlap JSONs. Full per-name data: `classification.json`
(every name, every state, decisive file:line, equality verdicts — all counts recomputable).

## Orchestrator adjudication decisions

1. **Primary counts = rendered equality** (whitespace/case-folded + one-level `var()`
   resolution); the strict-textual variant is preserved alongside so both are recomputable.
2. **The 3 `--ds-motion-{instant,calm,deliberate}` names are FINAL category C** — an
   `@media (prefers-reduced-motion: reduce)` zeroing is a genuinely separate conditional
   context the compiler structurally cannot express (see `compiler-capability-map.md`).
   This is the only deliberate divergence from the upstream `cascadeByState` root counts,
   and it is documented in §1 of the draft below.
3. **Rottay = D(+F facet) across all 267, with a NEEDS_OWNER_DECISION attached**: the
   compiled block is a DARK palette emitted under a `[data-theme='light']`-gated selector
   (`artifact-renderer/index.ts:65`) — 180/267 compiled values are byte-identical to the
   extension's dark-default block. Whether the light-gated spec reflects unfinished intent
   or a defect changes the fix (correct the spec selector vs teach the compiler modes), not
   the classification.
4. **D is not "safe" and carries its caveat inline**: the showroom reaches light and dark
   today via `forceTheme` (k1-lane-a/index.tsx:266, probe/wl-canary/page.tsx:836,
   K4LaneDProbe.tsx:315). Every D contradiction is observable in the showroom now and goes
   live in a product the moment a mode switch ships. D means "inert under current product
   policy", not "harmless".
5. **Guardrails section: H-ELIGIBLE, NOT H.** Reason + work order cited, but no owner and
   no retirement condition; and its stated premise ("the app pins data-theme='light'") is
   FALSE — all three products ship `data-theme="base"`; the light outcome holds only by
   negation. H status requires owner + retirement + non-growth test during R1-P.
6. **UNKNOWN stays UNKNOWN**: 85 bithire rows (25 in the shipped state) with
   color-mix/calc chains are B with `resolvedEquality: UNKNOWN`, pending Codex
   computed-style capture. They are never counted as pass.
7. **Headline shipped-state defects elevated from the B set**: bithire canvas
   `--ds-color-bg-primary` `#F4F8FB`→`#ffffff`, `--ds-surface-panel` gradient→flat fill,
   muted/disabled ink lightened (contrast re-check needed), badge/card geometry changed,
   breadcrumb `rem`→`px` (a11y), and evnto dropping the `"Noto Sans Arabic"` fallback from
   both font families — a live i18n regression.

The machine-produced draft below is adopted as the classification record.

---
# Overlap classification (A-I) — DRAFT for orchestrator

Machine-produced from `bithire-overlap.json` / `evnto-overlap.json` / `rottay-overlap.json`.
Companion data: `classification.json` (every name, every state, every decisive `file:line`).
Scripts: `scripts/classify/{selector-lib,resolve,classify2,finalize}.js`. Read-only analysis; nothing under `/Users/daniel/Developer/Rottay/` was modified.

---

## 0. The two findings that outrank the counts

**F-1. The rottay compiled block is a DARK palette emitted under a `[data-theme='light']` selector, so in the shipped app it never applies at all.**

`FIRST_PARTY_ARTIFACT_SPECS` hardcodes rottay's scope as
`html[data-tenant='rottay'][data-theme='light'], html[data-tenant='rottay'].light`
(`ui-design-system/packages/core/src/infrastructure/compilers/runtime/tenant-css/artifact-renderer/index.ts:65`), while the bithire and evnto entries in the same array use the plain `html[data-tenant='<slug>']`. The values inside that block are the dark palette: 180 of the 267 shared names are byte-identical to the extension's **dark-default** block, versus only 46 identical to the extension's **light** block. `--ds-sidebar-bg` compiles to `#0D0D10` under a *light* selector; `--ds-modal-bg` to `#1A1A1E`; `--ds-table-row-bg` to `#0C0C0E`.

Because app-platform stamps `data-theme="base"`, the light-gated block matches nothing, and the extension's dark-default block is the sole author of all 267 names. The 218 value contradictions in the light state are therefore not a rogue extension overriding the compiler — they are the extension supplying the only correct light palette on top of a mislabelled block.

**F-2. All three verticals ship in `data-theme="base"`, which no one seems to have modelled.**

Every bundled first-party registry config declares `theme: 'base'` (`registry/index.ts:41,66,88`), no app passes `forceTheme`, and the DS `ThemeProvider` stamps whatever resolves — so `data-theme="base"` lands on `<html>` in all three products. Since no selector in any of the six snapshot files tests a `data-theme` value other than `light`/`dark`, "base" is selector-equivalent to the modelled *default* state. That is what makes light and dark unreachable in the product shells, and it is also why the bithire guardrails banner's premise ("the app pins `data-theme="light"`") is false.

---

## 1. Category counts per vertical

Primary counts use **rendered** equality (whitespace, hex letter case, and one-level `var()` resolution). The strict-textual column is the same classification with byte comparison only, so both are recomputable from `classification.json`.

| Vertical | Shared names | A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|---|---|
| bithire | 188 | 20 | 42 | 3 | 122 | 1 | 0 | 0 | 0 | 0 |
| evnto | 82 | 79 | 2 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |
| rottay | 267 | 0 | 0 | 0 | 267 | 0 | 0 | 0 | 0 | 0 |

Strict-textual variant (no case folding, no `var()` resolution):

| Vertical | A | B | C | D | E |
|---|---|---|---|---|---|
| bithire | 5 | 57 | 3 | 122 | 1 |
| evnto | 75 | 6 | 0 | 1 | 0 |
| rottay | 0 | 0 | 0 | 267 | 0 |

Per-state results before the reachability filter (this is where the D's come from):

| Vertical | default (shipped) | light | dark |
|---|---|---|---|
| bithire | B 42, A 20, compiled-survives 122, E 1, C 3 | identical to default | B 120, A 64, E 1, C 3 |
| evnto | A 79, B 2, compiled-survives 1 | identical to default | B 36, A 19, compiled-survives 27 |
| rottay | **F 267** (compiled does not apply) | B 218, A 46, compiled-survives 3 | **F 267** |

Note on F: no name carries F as its *final* label, because rule 3 ranks D above F and every F name also competes in an unreachable state. The F facet is recorded per name in `classification.json` (`facets: ["F-facet:default", ...]`) and is the operative fact for rottay — all 267.

**Reconciliation with upstream `cascadeByState`.** Name-for-name identical in every state where upstream emitted lists, except three: `--ds-motion-calm`, `--ds-motion-deliberate`, `--ds-motion-instant`. Upstream counts them as `overriddenAtRoot`; this classification treats an `@media`-gated declaration as a separate conditional context (category C). That single modelling difference accounts for bithire's 62-vs-65 and 184-vs-187 root counts. evnto (81/81, 55/55) and rottay light (264/264) match exactly.

---

## 2. Reachability verdicts

| State | bithire | evnto | rottay |
|---|---|---|---|
| default (`base`) | REACHABLE — shipped | REACHABLE — shipped | REACHABLE — shipped, and the only one |
| light | UNREACHABLE-BY-ABSENCE (immaterial: identical outcome to default) | UNREACHABLE-BY-ABSENCE (immaterial: identical to default) | **UNREACHABLE-BY-ABSENCE** (material: this is where 218 contradictions live) |
| dark | UNREACHABLE (given; independently corroborated) | **UNREACHABLE-BY-ABSENCE** | UNREACHABLE-BY-ABSENCE (immaterial) |

Evidence, with grep scopes stated (full detail in `classification.json → reachability.evidence`):

- **evnto dark.** `app-evnto/src/app/layout.tsx:79` always writes `data-theme={serverTheme}`. `runtime-tenant-theme/ssr/index.ts:53-58` sets `configuredTheme='base'` whenever `runtimeTheme` is null, and `layout.tsx:71` skips `getTenantBranding` for bundled tenants — so bundled evnto is `serverTheme='base'`. The `prefers-color-scheme` pre-paint script at `layout.tsx:89` is rendered only when `configuredTheme === 'auto'`, which requires a DB-configured tenant; such a tenant carries its own slug in `data-tenant`, so the `html[data-tenant='evnto']` extension rules cannot match it. Grep scope: `app-evnto/src`, `*.ts|*.tsx`, pattern `data-theme|dataTheme` — 7 hits, 3 in tests.
- **rottay light and dark.** `app-platform/src` has exactly one `data-theme` hit (`app/layout.tsx:100`), a boot script that only *reads* `localStorage["ds-theme-preference"]`. That key is never written by production code anywhere in the monorepo (4 hits: one read in app-platform, two build fixtures, one `setItem` in `app-evnto/tests/unit/theme-source/index.test.ts:354`). `app-platform/src` contains zero `setTheme|useTheme|ThemeToggle|toggleTheme` hits, `DesignSystemProvider` is mounted without `forceTheme` (`tenant-provider/index.tsx:90`, `dashboard-providers/index.tsx:201`), the bundled registry config is `theme: 'base'`, and `rottayBrandTheme` declares no `appearance.backgroundMode`. The resolution chain at `bootstrap/facade/react/provider/index.tsx:644` therefore yields `'base'`, and `theming/composition/react/provider/index.tsx:1105-1135` stamps `data-theme="base"`.
- **bithire dark.** Taken as given by the task, and corroborated by a different mechanism than the one the extension comment claims: registry theme is `'base'`, and `app-bithire/src` writes no `data-theme` at all (2 hits, both comments, one of which says "The DS remains responsible for resolving and stamping `data-theme`").

**Scope caveat that must survive into the final report.** These verdicts describe the *product shells*. `ui-design-system/packages/showroom` passes `forceTheme` explicitly alongside a tenant config — `components/k1-lane-a/index.tsx:266` (`forceTheme="light"`), `app/probe/wl-canary/page.tsx:836`, `components/K4LaneDProbe.tsx:315` — so light and dark **are** reachable there. Every D-labelled contradiction below is observable in the showroom today and goes live in a product the moment a mode switch ships. D means "inert under current product policy", not "harmless".

---

## 3. The 23 overlaps that matter

Owner heuristic used: **Codex** for deterministic compiler/build work, **Claude** for design-semantic or accessibility adjudication (which value is canonical), **Kimi** for bulk mechanical sweeps.

| # | Variable | Compiled value | Extension value | Selector / mode | Winner | Cat | Impact | Owner | Destination |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `--ds-surface-panel` | `linear-gradient(180deg, rgba(249,252,254,.98), rgba(241,247,251,.96))` | `#f4f8fd` | root, mode-agnostic (pre-banner, ext:43) | extension | B | The authored gradient "material" panel never renders; every panel ships as a flat fill | Claude | BrandTheme-field |
| 2 | `--ds-color-bg-primary` (bithire) | `#F4F8FB` | `#ffffff` | root, mode-agnostic (ext:33) | extension | B | App canvas ships white, not the authored blue-tinted canvas — changes the whole ground | Claude | BrandTheme-field |
| 3 | `--ds-color-text-muted` | `#5B7187` | `#8a9aaa` | root, mode-agnostic (ext:49) | extension | B | Muted ink lightens ~2 steps against a now-white ground; contrast needs re-checking | Claude | BrandTheme-field |
| 4 | `--ds-color-text-disabled` | `#566E84` | `#b2b6c5` | root, mode-agnostic (ext:50) | extension | B | Disabled ink far lighter than authored; likely below 4.5:1 on white | Claude | BrandTheme-field |
| 5 | `--ds-color-text-secondary` | `#516980` | `#53697e` | root, mode-agnostic (ext:47) | extension | B | Near-miss divergence — two sources of truth for the same ink, 3 units apart | Kimi | delete (extension) |
| 6 | `--ds-badge-radius` | `7px` | `var(--ds-radius-full)` → `9999px` | guardrails, root (ext:3941) | extension | B | Badges render as pills, not rounded rects — a shape-language change, not a token cleanup | Claude | BrandTheme-field |
| 7 | `--ds-card-radius` / `--ds-card-border-radius` | `12px` | `var(--ds-radius-md)` → `10px` | guardrails, root (ext:3481,3482) | extension | B | Every card is 2px tighter than the authored geometry | Claude | BrandTheme-field |
| 8 | `--ds-breadcrumb-link-color` | `#3A6FB0` | `var(--ds-color-text-secondary)` → `#53697e` | guardrails, root (ext:3620) | extension | B | Breadcrumb links lose the brand-blue affordance and read as plain text | Claude | BrandTheme-field |
| 9 | `--ds-breadcrumb-font-size` | `0.75rem` | `11px` | guardrails, root (ext:3618) | extension | B | rem → px: breaks user font scaling for this element only | Codex | BrandTheme-field |
| 10 | `--ds-badge-font-weight` | `650` | `700` | guardrails, root (ext:3943) | extension | B | Variable-weight 650 collapses to 700; loses the authored optical weight | Kimi | BrandTheme-field |
| 11 | `--ds-filter-pill-count-ring` | `inset 0 0 0 1px color-mix(in srgb, #D4E0EA 82%, transparent)` | `none` | guardrails, root (ext:3978) | extension | B | The count ring is deleted outright; compiled emits a ring nobody sees | Claude | BrandTheme-field |
| 12 | `--ds-button-primary-bg` (bithire) | `#3A6FB0` | `var(--ds-color-primary)` → `#3A6FB0` | guardrails, root (ext:3796) | extension | A | Pure indirection: identical paint, two authorities. Representative of 14 such guardrail entries | Kimi | delete (extension) |
| 13 | `--ds-font-family-base` (evnto) | `'Inter', …, Roboto, "Noto Sans Arabic", sans-serif` | `'Inter', …, Roboto, sans-serif` | light-by-negation, root (ext:64) | extension | B | **Arabic fallback dropped**: Arabic text falls to generic sans-serif. i18n regression in the shipped state | Claude | delete (extension) |
| 14 | `--ds-font-family-heading` (evnto) | same as above | same as above | light-by-negation, root (ext:65) | extension | B | Same regression on headings | Claude | delete (extension) |
| 15 | `--ds-color-bg-primary` (evnto) | `#FFFFFF` | `#ffffff` | light-by-negation, root (ext:43) | extension | A | Hex-case-only difference. Stands for evnto's 79 pure duplications — the entire light block re-states the compiled block | Kimi | delete (extension) |
| 16 | `--ds-color-bg-input` (evnto) | `#ffffff` | `#131210` (dark block only, ext:297) | dark selector | compiled (dark unreachable) | D | evnto's only D: a dark value with no reachable dark state | Codex | compiler-capability |
| 17 | `--ds-sidebar-bg` (rottay) | `#0D0D10` under `[data-theme='light']` | light `#F4F4F3` / default `#0D0D10` | compiled light-gated; ext light + dark-default | extension (sole author in base) | D (+F) | Compiled emits a near-black sidebar under a *light* selector; extension supplies both the real dark and the real light | Codex | compiler-capability |
| 18 | `--ds-modal-bg` (rottay) | `#1A1A1E` under light | light `#FFFFFF` / default `#1A1A1E` | same | extension | D (+F) | Same inversion on modals | Codex | compiler-capability |
| 19 | `--ds-button-primary-bg` (rottay) | `#FFFFFF` under light | light `#0A0A0A` / default `#FFFFFF` | same | extension | D (+F) | Exactly inverted pair — proves the compiled block is the dark palette | Codex | compiler-capability |
| 20 | `--ds-table-row-bg` (rottay) | `#0C0C0E` under light | light `#FFFFFF` / default `#0C0C0E` | same | extension | D (+F) | Same inversion across the table surface | Codex | compiler-capability |
| 21 | `--ds-sidebar-width` (rottay) | `296px` | `296px` (default block only) | compiled light-gated; ext dark-default | extension | D (+F) | One of only 3 names the compiled block "survives" in light — and even that survival is unreachable | Kimi | delete (extension) |
| 22 | `--ds-motion-instant` / `-calm` / `-deliberate` | `120ms` / `200ms` / `320ms` | `0ms` | root, `@media (prefers-reduced-motion: reduce)` (ext:3381-3383) | extension, only under the media query | C | Legitimate accessibility override the compiler structurally cannot express | Codex | compiler-capability |
| 23 | `--ds-listing-grid-min-card-width` | `260px` | `min(300px,100%)`, and `100%` under `@media (max-width:720px)` | `html[data-tenant] :where(.bithire-collection-polish)` (ext:1224,1332) | compiled at root; extension inside the subtree | E | Component-local, correctly scoped; no root competition | — | extension-remains |

---

## 4. Guardrails section — H-eligibility

`BITHIRE PRODUCTION GUARDRAILS (TOKEN REMAP)`, `bithire/_source/extension.css:3391-4010`, 48 shared names (all 48 inspected, not just the 15 required).

**What it remaps.** It replaces the compiled block's baked literals with references to semantic tokens (`--ds-color-primary`, `--ds-control-*`, `--ds-surface-*`, `--ds-radius-*`, `--ds-premium-card-*`). Mechanically: **34 B / 14 A** by rendered value (44 B / 4 A strict-textual). So roughly a third of the section is pure indirection that resolves to the identical paint, and two thirds actually change what renders — which is more than "remap" implies.

**Verdict: H-ELIGIBLE, NOT H.** The section states a reason and cites a work order, but names no owner and sets no retirement condition. Keyword scan of lines 3391-4010 for `owner|retire|remove by|TODO|FIXME|expires|deadline|sunset|temporary|until|ticket` matched only `WO-` twice (`WO-UX-05`, region `UX05-R01`).

Verbatim comment text:

> `:3391` — "BITHIRE PRODUCTION GUARDRAILS (TOKEN REMAP) / Relocated verbatim from app-bithire src/app/globals.css region UX05-R01 (WO-UX-05 stage E). Plain tenant-root scope, appended after every other artifact block so these declarations win by source order over the compiled BrandTheme block above -- mirroring the app, where globals.css loaded after the artifact. The higher-specificity light/dark theme blocks earlier in this file keep their runtime winners for the var names they also declare, exactly as in production today (**the app pins data-theme="light" for bithire, so the light block always applies and the dark blocks never do**). Deliberate exception to the verbatim copy: the two legacy "-text"-suffixed button ink aliases (primary/secondary) are NOT relocated. …"

> `:3408` — "BitHire production guardrails. / The imported DS package still contains platform fallback literals for generic tenants. Keep this app on semantic BitHire/DS tokens so controls stay readable in production bundles and button/pill text cannot disappear against light surfaces."

**The bolded premise is false.** app-bithire pins nothing — it delegates root attributes to the DS (`app-bithire/src/core/hooks/runtime-tenant-theme/index.ts:92`), which resolves the bundled registry theme `'base'` and stamps `data-theme="base"`. There is no `[data-theme='light']`-gated bithire block anywhere; the guard is light-*by-negation* (`:not([data-theme="dark"]):not(.dark)`). The conclusion ("the dark blocks never do") happens to hold, but a maintainer trusting this comment would go looking for a pin that does not exist.

Missing for H: a named owner, a retirement condition, and a tracking item that closes the window.

---

## 5. G — domain-specific tokens out of place

**Within the overlap set: G = 0, all three verticals.** Every shared name is generic UI vocabulary (`color`, `surface`, `button`, `input`, `card`, `table`, `sidebar`, `modal`, `breadcrumb`, `filter-pill`, `tab`, `shell-grid`, `workspace-shell`, `listing-grid`, `command-glow`). Borderline names reviewed and cleared: `--ds-command-glow`, `--ds-listing-grid-min-card-width`, `--ds-workspace-shell-{bg,border,overlay,shadow}`, the 9 `--ds-filter-pill-*`, the 7 `--ds-breadcrumb-*`, `--ds-shell-grid-{line,size}`. All pass the promote-to-DS test — a second product could consume them without knowing what a candidate, ticket, or event is.

**Outside the overlap set, G is real and worth reporting.** Domain-semantic tokens live under the shared `--ds-*` namespace in the extension-only sets:

- bithire, 12: `--ds-candidate-{new,screening,interview,offer,hired,rejected}` and each `-text` pair.
- evnto, 21: `--ds-event-{draft,published,live,ended,cancelled}`, `--ds-ticket-{available,reserved,sold,pending}`, each `-text` pair, plus `--ds-evnto-accent-primary`, `--ds-evnto-accent-secondary`, `--ds-evnto-highlight`.
- rottay, 0.

These never collide with the compiler, so they are not overlap findings — but `--ds-candidate-hired` in a design-system namespace is exactly what G is for.

---

## 6. UNKNOWN — resolvedEquality undecided

Never converted to a pass. These stay category **B** with `resolvedEquality: UNKNOWN`; a color-mix/calc expression is not declared equal or unequal by computation.

| Vertical | UNKNOWN rows | in a reachable state |
|---|---|---|
| bithire | 85 | 25 |
| evnto | 0 | 0 |
| rottay | 1 | 0 |

The 25 reachable bithire cases (shipped `base` state) — all in the guardrails or the pre-banner block:

`--ds-button-default-bg`, `--ds-button-default-bg-hover`, `--ds-button-default-color`, `--ds-button-ghost-bg-hover`, `--ds-button-ghost-color`, `--ds-button-primary-border`, `--ds-button-primary-color`, `--ds-button-secondary-bg`, `--ds-button-secondary-bg-hover`, `--ds-button-secondary-border`, `--ds-card-bg-hover`, `--ds-card-border`, `--ds-card-border-color`, `--ds-card-footer-bg`, `--ds-card-shadow`, `--ds-card-shadow-hover`, `--ds-filter-pill-active-border`, `--ds-filter-pill-active-shadow`, `--ds-filter-pill-count-active-bg`, `--ds-filter-pill-count-active-ring`, `--ds-filter-pill-count-bg`, `--ds-filter-pill-count-ring`, `--ds-filter-pill-frame-border`, `--ds-filter-pill-hover-bg`, `--ds-filter-pill-hover-border`.

Two shapes: (a) compiled bakes a literal while the extension routes through a `color-mix()` chain — e.g. `--ds-card-shadow` compiled `0 1px 2px rgba(20,40,59,.06)` vs extension `var(--ds-surface-shadow, var(--ds-shadow-sm))` which resolves to a two-layer `color-mix` shadow; (b) both sides are `color-mix()` with different percentages — e.g. `--ds-filter-pill-hover-border` `color-mix(in srgb, #3A6FB0 16%, #D4E0EA)` vs `color-mix(in srgb, var(--ds-color-primary) 20%, var(--ds-color-border))`. Deciding these needs computed-style capture in a browser, not static analysis. Note `--ds-filter-pill-count-active-ring` and `--ds-filter-pill-count-ring` are only nominally UNKNOWN — the extension value is literally `none` against a compiled inset ring, which is a definite visual difference.

rottay's single row: `--ds-button-focus-ring`, light state (unreachable), compiled `0 0 0 2px rgba(255,255,255,.20)` vs extension `var(--ds-focus-ring)`.

---

## 7. Method notes the final report should keep

1. **State model.** default / light / dark, where the shipped state of all three verticals is `data-theme="base"`. Selector-equivalence of "base" to the default state is proven, not assumed: across the six snapshot files the only `data-theme` values appearing in any selector are `light` and `dark`.
2. **Winner determination.** Among extension declarations matching the root element in a state and not gated by an at-rule: highest specificity, ties by later source order. The extension is appended after the compiled block inside the shipped `index.css`, so equal specificity always favours the extension. `:where()` scores 0, `:is()`/`:not()` take the max of their arguments.
3. **Value comparison, three stages.** whitespace-collapsed textual → case-insensitive → one-level `var()` resolution against the effective root map built from the shipped `<vertical>/index.css` with postcss 8.5.10. A pair resolving to the same literal is reported as rendered-equal (A) with the strict-textual verdict (B) preserved in `finalStrictTextual` and in the facet list. `color-mix()`/`calc()` are never computed.
4. **Severity order applied for the final label:** B > A > G > D > E > C/F, with D assigned when a name's only competition lies in an unreachable state.
5. **Every count is recomputable.** `finalCategoryCounts` tallies `names[*].final`; `perStateResultCounts.<state>` tallies `names[*].perState.<state>.result`; each name carries `compiled.fileLine`, every extension declaration's `fileLine`, and the decisive `extensionFileLine` plus the equality verdict per state.

---

## 8. Open items for the orchestrator

- **Owner decision, rottay:** does the rottay artifact spec's `[data-theme='light']` selector reflect an intent that was never finished (a light skin for the admin console), or is it a defect? The classification is the same either way (the compiled block is inert), but the fix differs: correct the selector to plain `html[data-tenant='rottay']` and let the extension own only the light block, versus teaching the compiler to emit modes.
- **Category C vs upstream.** Confirm the 3 `@media (prefers-reduced-motion)` motion names should read as C rather than as root overrides; this is the only place the counts diverge from `cascadeByState`.
- **D is not "safe".** The showroom already reaches light and dark. If the final report keeps D as a low-severity bucket, it should carry the showroom caveat inline, not in a footnote.
