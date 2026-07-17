# WO-SKIN-06 CK-I paint inventory (read-only) — the long tail

Scope per the brief's grep: `fleet.inlinePaint.(surfaces/pages|patterns/data/(stats-grid|cell-renderers|grid-view|gallery-view|bulk-select-toggle)|surfaces/(foundation|layout))`.
**47 files, 466 sites** — machine-reproduced from `node scripts/engine-token-audit.mjs`, re-verified
line-by-line against the current (just-patched) `countArc09PaintInFile` with a script that
self-checks its own total against the real exported function on every file (all 47: `MATCH`, zero
drift). The brief's cited "439 sites / ~46 files" is stale — it predates this morning's lexer fix
(commit de431091); 466/47 is the current, correct figure. Classification legend matches CK-G/the
triage: **A** (STATIC or STATE-SELECTED — migratable), **B** (per-datum runtime, exempt), **C**
(custom-property hatch).

**A live, active defect in the counter was found and reported to the orchestrator mid-inventory,
not held for this report**: the `atKeyPosition` check added by this morning's fix (which correctly
kills the ternary-colon false-positive from CK-G) does not skip comments. Any `//` or `/* */`
comment between the previous `,`/`{` and a paint key — including a trailing comment on the prior
line — makes the key invisible to the counter. Reproduced in isolation (3 variants, all drop a real
site to 0) and confirmed in production code: `surfaces/foundation/personality-helpers.tsx:73`'s
`background:` key (real, live, consumed by 8 surfaces) is preceded by a 2-line comment and is not
counted — the file reports 1 site, the real number is 2. This is a false-**negative**, the opposite
direction from this morning's bug, and worse for a ratchet: a file can carry live paint immediately
after a comment and still show `inlinePaint: 0`. Not fixed here (read-only); flagged for the lexer
owner. **Every count in this document is the machine's current count, which under-counts by at
least this class of site** — treat totals below as a floor, not a ceiling.

---

## 0. Answers to the three questions the brief asked first

### Q1 — Do surfaces behave like components (thin recipes) or do they carry real paint of their own?

**Both, and the split is sharp, not gradual.** Two populations:

- **~30 of the 47 files are genuinely thin.** The ~27 small `surfaces/pages/{admin,data,experience,forms,operations}/*` files (1–12 sites each) overwhelmingly compose already-migrated primitives (`Card`, `Text`, `Box`, `Input`) and foundation helpers (`SurfaceActionBar`, `SurfaceSectionCard`, `SurfaceEmptyState`, `PatternFilterPanel`), and their own paint is a handful of `<Text style={{ color: 'var(--ds-color-text-muted)' }}>` overrides plus the occasional `borderColor`/`background` on a `Card`. Verified by direct read on `admin/*` (7 files), `data/search`, `data/report`, `data/compare`, plus dump-context on the rest — the shape repeats almost verbatim across every file. `patterns/data/grid-view` is the extreme case: its `renderCard` prop is caller-*required*, so 100% of the card content is the CALLER's paint, not the DS's — the pattern's own 9 sites are pure wrapper chrome (selection ring, empty state).
- **A handful of files are real, substantial page shells that own significant bespoke chrome, not recipes.** `surfaces/pages/workspace/collection-workspace/index.tsx` (64 sites, 2238 lines) is the clearest case: it hand-builds a `PageSizeControl` with a hidden-native-`<select>`-over-styled-picker trick, its own `UtilityIcon` toggle button, and a **real injected `:hover`/`:focus-within` stylesheet** (`PAGE_SIZE_CONTROL_CSS`, 6 selectors) — this is component-grade work sitting in a file classified as a "surface". `render-dispatch.tsx` (49 sites) hand-rolls its own Previous/Next pagination footer (`buttonStyle`/`disabledButtonStyle`) instead of reusing the DS `Pagination` primitive that `gallery-view` already uses two directories over — a real, avoidable duplication. `guided-draft-form` (66 sites, 1093 lines) owns a `DraftStatusBadge`, a responsive `SectionNav` (sidebar/pills/dropdown), and a validation-issue list with its own severity coloring. `stats-grid`, `gallery-view`, `cell-renderers` (technically `patterns/data`, not `surfaces/`, but in scope per the brief) are full components with real interaction mechanisms (imperative hover writes, injected keyframes), not recipes at all.

**Consequence**: a checkpoint contract cannot treat CK-I as uniformly cheap. The 27 small pages are close to free (copy static values, done). The handful of large files are their own migrations, each needing the full per-component treatment (anatomy, suppression, keyframes, imperative writes) the smaller ones don't.

### Q2 — Is `surfaces/foundation/**` genuinely shared, or another false premise?

**Genuinely shared — this is the first CK in the whole WO-06 program where the "shared vocabulary" premise survives verification.** Unlike CK-C, CK-D, and CK-G's own false starts, every foundation file's importers were checked by grepping the actual relative import path, not inferred from the file's location:

| file | sites | real importers (verified by import path) | verdict |
|---|---:|---|---|
| `common/story-helpers.tsx` | 6 | 25 `.stories.tsx` files across patterns/misc, patterns/forms, patterns/navigation, patterns/_internal | shared, but **Storybook-only** — never ships to a real app |
| `common/test-utils.tsx` | 1 | **~50** `.test.tsx` files across primitives, patterns, structures, and every surfaces/pages family | shared, but **Jest-only** — its one paint site (a hardcoded `accentColor: '#0f766e'`) never renders in production |
| `personality-helpers.tsx` | 1 (real: 2, see the comment-bug above) | 8 real `surfaces/pages/**` files: chat, guided-draft-form, form, wizard, admin/settings, data/dashboard, data/detail, data/list | **real production sharing** — `SurfaceAccentBar` |
| `shared.tsx` | 1 | **21** real `surfaces/pages/**` + `surfaces/layout/**` files | **the single highest-leverage file in CK-I** — `SurfaceActionBar`/`SurfaceTabbedLabel` (both zero-paint, pure composition) + `SurfaceSectionCard` (owns the file's one paint site) |
| `states/index.tsx` + `states/surface-states.tsx` | 1 + 8 | 6+ real `surfaces/pages/**` importers (chat, notification, empty-state, media, form, wizard) plus internal use by `useSurfaceState.ts` | **real production sharing** — the 5-state lifecycle kit (`SurfaceLoadingSkeleton`, `SurfaceEmptyStateCard`, `SurfaceErrorStateCard`, `SurfaceStaleBanner`, `SurfaceOfflineBanner`) |
| `SurfaceErrorBoundary.tsx` | 8 | only re-exported via `surfaces/index.ts` (public API barrel) — real app-level usage would be in consuming apps outside this repo, unverifiable from here | **must never be migrated** — see below |

Two of the six files are real production infrastructure with double-digit verified importer counts, one is single-digit but real, and one (`SurfaceErrorBoundary`) is a deliberate exception. Migrating `shared.tsx`'s one site (`SurfaceSectionCard`'s description-text `color`) touches 21 files' worth of consumers at once — this is the highest-leverage single fix in the entire checkpoint, the mirror image of CK-C/CK-D's finding rather than a repeat of it.

**`SurfaceErrorBoundary.tsx`'s 8 hardcoded-hex sites (`#fca5a5`, `#fef2f2`, `#991b1b`, `#ffffff`) must be excluded from the migration entirely, and the reason is in the file's own comment**: "Default fallback uses inline styles so it renders correctly even when the theming provider or CSS variables are unavailable." Its whole purpose is to survive a crash in the DS's own theming infrastructure. An external, unlayered skin file is still a stylesheet dependency — if the crash is a CSS-loading or `ThemeProvider` failure, the skin might not apply either, while a literal inline `style={{}}` value always does. This is a new, principled exemption class distinct from anything in the triage's B/C taxonomy: **"paint that must survive CSS/theming failure by construction."** Recommend a named exemption (`SKIN-EXEMPT-CRASH-SAFE-FALLBACK`) rather than migrating it and quietly breaking the one component whose job is to work when everything else is broken.

### Q3 — `cell-renderers`: per-datum (B) or per-column-type (A)?

**Per-column-type. 38 of 41 sites are category A** (19 STATIC, 19 STATE-SELECTED via bounded enums/thresholds), **3 are genuine C-hatch**. The file is not a component at all — it's a library of 12 plain functions (`avatarName`, `statusBadge`, `mono`, `score`, `boolean`, …) that a consuming app selects *per column*, and each function's paint is either fixed or selected from a small closed set:

- `statusBadge`/`simpleBadge`: a 6-way bounded enum (`primary|secondary|success|warning|error|info`) indexing a static lookup table — the triage's own canonical "static map index" example, verbatim. A.
- `score`: `barColor` is a 3-way **threshold bucket** over the numeric `value` — `value <= low ? error : value <= mid ? warning : success` — structurally identical to the triage's own canonical `getProgressColor` example (§2). A, not the triage's claimed C.
- `boolean`, `iconText`: 2-way ternaries between two static leaves. A.
- `mono`'s `options?.color` and `score`'s `height / 2` (×2, feeding `borderRadius`): genuinely open-ended, caller-supplied values with no bounded set. C — real hatch, 3 sites.

**Correction to the triage**: §5 lists cell-renderers at 5 C-hatch sites (`options?.color, barColor, height / 2`), naming `barColor` as hatch. `barColor` is a 3-way threshold bucket, not an open-ended value — it belongs in category A behind a `[data-band="low|mid|high"]` rule, exactly like its own canonical discriminator example. The real hatch count for this file is **3, not 5**. A second, independent instance of the same shape turned up in `guided-draft-form.tsx:141-147` (`DraftStatusBadge`'s `color`, destructured from a 4-way `statusMap[status]` lookup) — the triage's §5 also lists this one (`:164 color`) as the file's sole C-hatch site; it is category A. **Both corrections share a root cause: `background: <bareIdentifier>` was pattern-matched as hatch-shaped without checking whether the identifier resolves through a bounded enum table** (it does, in both cases) **or reaches an open-ended caller value** (only `mono`'s `options?.color` and `score`'s `height`/`stat.color` actually do). This is the same class of error as CK-C/CK-D's falsified sharing, applied to hatch classification instead of vocabulary sharing: infer from shape, not from tracing where the identifier terminates.

Also load-bearing: `cell-renderers`' own file header claims "All renderers use DS primitives (Box, Flex, Stack, Text, Badge, Avatar)"; the code imports only `React` and builds every element via raw `React.createElement('div', …)`/`('span', …)`. Zero primitive imports anywhere. Same stale-doc-comment defect class WO-SKIN-04 found in Pagination and CK-G found in shortcuts-overlay's `<kbd>` claim — third occurrence today.

---

## 1. `surfaces/foundation/**` (7 files, 26 sites, real: 27+) — the checkpoint's highest-leverage cluster

Covered in full above (Q2). Per-file detail:

- **`personality-helpers.tsx`** (1 counted / 2 real site): `SurfaceAccentBar` — `background` STATE-SELECTED (2-way, `barStyle==='gradient'` ternary between two fixed gradient strings; the comment bug hides this site from the counter), `borderRadius` **C-hatch** (`thickness`-driven magnitude embedded in a position-selected template shape). `barStyle === 'animated'` sets `animation: 'ds-accent-bar-shimmer 3s ease-in-out infinite'` — **`ds-accent-bar-shimmer` is referenced but never defined anywhere in the repo** (grep-confirmed), the component's own comment even says it "must be defined in the global DS stylesheet" and never was. Any of the 8 consuming surfaces that pass `accentBarStyle: 'animated'` render a static gradient with no shimmer. Second occurrence today of the exact "undefined `@keyframes` referenced by name" defect class (first was CK-G's `ds-pulse` in environment-toggle/rustic) — a real, recurring pattern worth a team-wide grep, not a one-off.
- **`shared.tsx`** (1 site): `SurfaceSectionCard`'s description `color`, STATIC. `SurfaceActionBar`/`SurfaceTabbedLabel` (the file's other two exports, together covering most of the 21 importers) carry **zero** inline paint — pure composition over `Button`/`Card`/`Flex`/`Stack`/`Text`.
- **`states/index.tsx`** (1 site) + **`states/surface-states.tsx`** (8 sites): all STATIC. `SurfaceLoadingState`/`SurfaceLoadingSkeleton`/`SurfaceOfflineBanner` own zero paint (delegate to `Skeleton`/`Alert`); `SurfaceEmptyStateCard`/`SurfaceErrorStateCard` own a little (icon/title/description color); `SurfaceStaleBanner` owns most of it (background/border/color on the banner itself, 5 of the 9 combined sites).
- **`SurfaceErrorBoundary.tsx`** (8 sites): all STATIC, all deliberately hardcoded hex — see Q2, must be exempted, not migrated.
- **`common/story-helpers.tsx`** (6 sites) / **`common/test-utils.tsx`** (1 site): real but dev/test-only, out of scope for a user-facing skin (their paint never ships). `test-utils.tsx`'s one site is ALSO a hardcoded hex (`accentColor: '#0f766e'`) in a chart-testing fixture — same reasoning as SurfaceErrorBoundary could apply (test fixtures may want a fixed reference color independent of theme) but lower stakes since it's not user-facing at all; flag, don't block on it.

No suppression risk anywhere in this cluster — grep of `theme.css`/`personality.css` for `surface-accent`, `surface-action-bar`, `surface-tabbed`, `surface-empty`, `surface-error`, `surface-stale`, `surface-offline` returns zero hits. Zero DaisyUI coupling. Zero data-part anywhere.

## 2. `patterns/data/cell-renderers/index.tsx` (41 sites) — see Q3 in full

## 3. `patterns/data/stats-grid` (66 sites, 2 files) — real component, real hover mechanism, real keyframe-name collision risk

Full component with imperative hover writes (rustic) and per-instance injected keyframes (both
engines) — not a thin wrapper.

**Anatomy**: neither engine stamps a `ds-pattern-stats-grid` root class; the loading-skeleton
branch carries BEM-ish classes (`ds-stats-grid-skeleton`, `__item`, `__bar`) on modern only,
unreferenced by any stylesheet (dead hooks, same shape as CK-G's Menu compounds). `className="ds-nums-tabular"` appears on the value span in both engines (a tabular-nums utility, not paint).

**Token vocabulary split, same shape as CK-G's command-palette**: `--ds-stats-grid-*` is a real,
declared, tenant-themeable namespace (`foundation/tokens/css/foundation/themes/default.css`, 14 declarations:
card-bg/border/filled-bg/glass-bg/glass-border, trend-positive/negative/neutral, label/value/description-color, skeleton-bg/wave-gradient). **Rustic honors it throughout** (every `variantStyles` entry and every text color reads `var(--ds-stats-grid-*, fallback)`). **Modern uses it zero times** — confirmed 0 hits — modern reads generic `--ds-surface-card`/`--ds-elevation-1`/`--ds-color-*` instead. A tenant overriding `--ds-stats-grid-card-bg` today changes rustic's card fill and has zero effect on modern's. Preserve both vocabularies separately; do not consolidate.

**`stat.color` hatch, confirmed exactly 3 sites** (matches the triage): modern's icon color (`:267`) and value color (`:295`), rustic's value color (`:226`) — all `stat.color || <fallback token>`, a genuine caller-supplied per-stat accent (`StatDef.color?: string`). `--ds-stats-grid-accent` (or similar) is the natural hatch name; not yet claimed anywhere (grep-confirmed free).

**Imperative writes — 6, rustic only, all LIVE**: `onFocus`/`onBlur` write `boxShadow` (double-ring focus pattern), `onMouseEnter`/`onMouseLeave` write `boxShadow`+`transform` (hover-lift). `StatCard`'s root `<div>` carries no className in either engine, so nothing contests these writes — same LIVE conclusion as CK-G's command-palette, for the same reason (no CSS hook exists to race against).

**Two real keyframe blocks, both injected per-mount, named very differently**:
- Modern: `@keyframes ds-stats-shimmer` — prefixed, low collision risk, but still unnamespaced-per-instance (single global name, re-declared on every `LoadingSkeleton` mount with no dedup guard — same "harmless only because byte-identical" shape as CK-G's Tabs).
- Rustic: `@keyframes pulse` and `@keyframes wave` — **bare, unprefixed, extremely generic names.** Grepped for collisions: **9 other files in this repo independently declare `@keyframes pulse` and/or `@keyframes wave`** with these exact bare names — `patterns/visualization/tree-view/engines/rustic/index.tsx`, `patterns/forms/step-wizard/engines/{modern,rustic}/index.tsx`, `patterns/workflow/approval-workflow/engines/rustic/index.tsx`, `patterns/communication/live-feed/engines/rustic/index.tsx`, `structures/dashboard/stats-header/StatsHeader.tsx`, plus a test file. CSS `@keyframes` are global and unscoped by container — if any two of these mount on one page simultaneously and their keyframe *bodies* differ (they likely do — different components, different animation intents), the later-parsed one silently wins for **every** element on the page using `animation: pulse …`/`animation: wave …`, including components that never intended to be affected. This is a live, real, cross-component visual-bug risk today, independent of migration — worth flagging to the team beyond just this checkpoint's skin work.

**Suppression, DaisyUI**: none — zero hits in theme.css/personality.css for `stats-grid`; zero bare DaisyUI classes in either engine.

## 4. `patterns/data/gallery-view/PatternGalleryView.tsx` (18 sites) — real, working, unmigrated hover CSS

Engine-free (single implementation, no modern/rustic split — a genuine architectural difference from every component in CK-G and most of CK-I). Root cards carry real, referenced first-party classNames (`ds-gallery-card`, `ds-gallery-checkbox` — grep-confirmed collision-free) consumed by a module-level injected stylesheet (`GALLERY_HOVER_STYLES`, `<style>` tag, 5 selectors: `:hover` box-shadow+transform on the card, `:hover img` zoom, checkbox-reveal-on-hover via `:has(input:checked)`, `:focus-visible` outline). Unlike most keyframe/style-tag findings in this program, this one is **not dead or orphaned** — it is the component's actual, working hover mechanism, just counter-invisible and not yet in a skin file. Paint sites are mostly STATIC; the one STATE-SELECTED site is the card border (`selected ? primary : default`). Zero hatch, zero imperative writes, zero DaisyUI, zero suppression risk.

## 5. `patterns/data/grid-view/PatternGridView.tsx` (9 sites) — the thinnest wrapper in the checkpoint

`renderCard` is a *required* prop (no built-in default card, unlike GalleryView) — 100% of card content paint belongs to the caller. The pattern's own 9 sites are: card shell (borderRadius/boxShadow, STATE-SELECTED on `selected`), checkbox-overlay chrome (STATIC), and an empty-state block (STATIC). Zero hatch, zero imperative writes, zero keyframes.

## 6. `surfaces/layout/**` (3 files, 10 sites) — thin, real foundation consumers

`collection-shell/index.tsx` (7 sites): STATE-SELECTED `background`/`boxShadow` driven by an `isAtmospheric` prop and a computed `overlayBackground`/`borderColor` — genuine per-instance chrome logic, not a hatch (values resolve to static tokens per branch). `header/index.tsx` (2) and `sidebar/index.tsx` (1) both import `SurfaceActionBar`/`SurfaceTabbedLabel`/`SurfaceActionBar` from `foundation/shared` — confirmed real consumers from Q2's importer list — and their own paint is a single muted-text color each.

## 7. `surfaces/pages/workspace/**` (5 files, 141 sites) — the biggest, richest cluster; real page shells, not recipes

- **`collection-workspace/index.tsx`** (64 sites, 2238 lines) — see Q1. Owns a genuinely bespoke `PageSizeControl` (hidden-native-`<select>`-over-styled-picker) with a **real injected 6-selector `:hover`/`:focus-within` stylesheet** (`PAGE_SIZE_CONTROL_CSS`) scoped to real, referenced BEM classNames (`ds-collection-page-size-control` + 4 children) — grep-confirmed collision-free, and NOT dead (the classes are consumed by both the JSX and the injected CSS). A `UtilityIcon` toggle button with `active`-keyed STATE-SELECTED border/background/color (`color-mix()`-based, same idiom as CK-C's "diverged recipes" — worth checking against list-toolbar's canonical tokens before assuming this is a fresh recipe, out of scope to resolve here). Extensive `color-mix(in srgb, var(--ds-color-primary) N%, …)` usage throughout the filter-bar/pagination region (lines 1642–2219) at several different percentages (7%, 9%, 10%, 20%, 24%, 28%, 34%) — the same "unstructured opacity spread" shape CK-C's saved-views-menu correction flagged; not verified against a canonical token here, worth a follow-up read before contracting this file. Only partially read (targeted clusters around lines 495–735 and 447–490); the 1055–2219 region was sampled via the dump, not fully read — flag for whoever picks this file up next.
- **`render-dispatch.tsx`** (49 sites, 756 lines) — internal-only (explicitly marked "should NOT be exported from the DS public API"), a pure view-mode router (table/cards/grid/kanban/gallery/calendar) that dispatches to `PatternDataTable`/`PatternGridView`/`PatternGalleryView` for most modes and owns its own paint only for the card-mode renderer and a **hand-rolled Previous/Next pagination footer** that duplicates functionality the DS `Pagination` primitive already provides (used two directories over by `gallery-view`) — a real, avoidable duplication worth a team flag. All sampled sites STATIC or STATE-SELECTED; no hatch found in the sampled ~200 lines (full file not read; 49 sites classified via dump context + 200 lines of direct read).
- **`guided-draft-form/index.tsx`** (66 sites, 1093 lines, the single largest surfaces/pages file) — confirmed real importer of `personality-helpers.tsx`'s `SurfaceAccentBarWrapper` (Q2 cross-reference). Owns `DraftStatusBadge` (4-way bounded enum, A — see Q3's correction), a responsive `SectionNav` with three layouts (sidebar/pills/dropdown) and `isActive`/`hasErrors` STATE-SELECTED chrome duplicated across at least two of the three layout branches (lines ~262–402, near-identical `borderRadius`/`background`/`color`/`border` blocks for the sidebar and pills variants — worth a de-dup flag, not a migration blocker), and a validation-issue list with 2-way severity coloring (`issue.severity === 'error'`). Zero real hatch (triage's claimed 1 site corrected to 0, see Q3). Not read past the sampled clusters (lines 1–210); the 66 sites' classification is dump-context-derived for the remainder, cross-checked against the two clusters actually read.
- **`command-center/index.tsx`** (10 sites) — `INSIGHT_TOKENS` is a 4-way bounded enum (info/warning/success/error), same canonical shape as everywhere else today. **Counter false-positive found**: `L99` (`border: string;`) is a property inside `Record<string, { border: string; bg: string; accent: string }>` — a mapped-type annotation on a `const` declaration. The lexer's type-body exemption only recognizes literal `interface X {` / `type X = {` openers (documented in the triage's §7.5); a `Record<K, {...}>` generic type literal is neither, so this property is miscounted as real paint. **A new variant of the §7.5 blind-spot class**, distinct from the plain-interface-member case already catalogued — worth folding into the same exemption/fix. Real paint: 9 of the 10 reported sites.
- **`decision-inbox/index.tsx`** (7 sites) — thin; composes `PatternFilterPanel`, `Card`, `Badge`, `Textarea`; own paint is a batch-selection-bar `borderColor`/`background` (STATIC) plus two `borderBottom` separators.
- **`record-workbench/index.tsx`** (11 sites) — thin page shell; `statusColors[status.variant ?? 'default']` is the same bounded-lookup shape (A); tab-bar `isActive` ternaries are clean 2-leaf STATE-SELECTED, directly `[data-active]`-shaped.

## 8. `surfaces/pages/{admin,data,experience,forms,operations}/**` (~27 files, ~150 sites) — the thin tail, confirmed by sampling

Full-read confirmed on 7 admin files, `data/search`, `data/report`, `data/compare`; dump-context-verified (exact line, property, and verbatim value, machine-checked against the current counter) for the rest. **The pattern is uniform enough to report as one class rather than 20 separate write-ups**: every file in this group composes `Card`/`Text`/`Box`/`Badge`/`Input` plus, in the majority, one or more `foundation/shared`, `foundation/states`, or `foundation/personality-helpers` imports (confirmed cross-references: `data/search` imports `SurfaceActionBar`, `SurfaceSectionCard`, `SurfaceEmptyState`; `experience/chat`, `forms/{guided-draft-form,form,wizard}`, `admin/settings`, `data/{dashboard,detail,list}` import `personality-helpers`; 21 files import `shared.tsx`). Their own paint is almost entirely:

- `<Text style={{ color: 'var(--ds-color-text-muted)' }}>` (by far the single most repeated site in the whole checkpoint — dozens of near-identical occurrences across admin/billing, admin/import-export, admin/integration, admin/team, data/compare, data/report, data/search, experience/{auth,editor,marketing,media,notification,pricing}, forms/{form,wizard}, operations/activity), STATIC.
- One or two `borderBottom: '1px solid var(--ds-color-border)'` row separators, STATIC (repeated verbatim string across admin/import-export, admin/integration, admin/team, decision-inbox — a real candidate for a single shared "list-row divider" skin rule).
- Occasional STATE-SELECTED chrome: `experience/chat:255` (`borderColor` on `isActive`-equivalent), `experience/media:37` (`borderColor: selected ? primary : undefined`), `experience/notification:75` (`borderLeft` keyed on `notification.read`), `data/search:34-40` (`backgroundColor`/`borderColor` on `selected`, plus a real `'--ds-card-bg-hover'` custom-property SET inline — a working hatch-adjacent pattern already in use, not a defect).
- One confirmed real hatch: **`operations/kanban/index.tsx:42`** — `color: col.color`, a per-column caller-supplied accent, matching the triage's own C-table entry exactly (1 site, correctly classified there).

No suppression risk, no DaisyUI coupling, no keyframes, no imperative writes found anywhere in this group (grep- and sample-confirmed). This is the cheapest 150 sites in the whole WO-06 program to date — closer to "copy the string" than any checkpoint inventoried so far.

---

## 9. Totals

```
                                    A (STATIC+STATE-SELECTED)   B   C   total
foundation (7 files)                              25 (+1 hidden)  0   1      26 (27 real)
cell-renderers                                    38             0   3      41
stats-grid (2 files)                              63             0   3      66
gallery-view                                      18             0   0      18
grid-view                                          9             0   0       9
layout (3 files)                                  10             0   0      10
workspace (5 files)                              140             0   0*    141
admin/data/experience/forms/operations (27 files) 148             0   1     149  (approx, some counter false-positives not individually purged)
                                                  ----            --  --    ----
                                                  ~451             0   8    ~466
```

(*workspace cluster's hatch count is provisionally 0 based on sampled reads; `collection-workspace/index.tsx`'s unread 1055–2219 region was not exhaustively checked for hatch sites and should be treated as unverified, not confirmed-zero.)

**Zero category-B sites found anywhere in CK-I** — same as CK-G, and consistent with the triage's
own program-level finding that B is concentrated almost entirely in the brand-preview trio and
chart leaves, neither of which fall in this checkpoint's scope. Real hatch is **8 sites**, corrected
down from the triage's implied 11 (cell-renderers 5→3, guided-draft-form 1→0) — CK-I's true C-hatch
burden is smaller than estimated, for the specific, checkable reason in Q3.

---

## 10. Coverage — what got full treatment vs. dump-verified only

**Full or substantial direct read**: all 7 `surfaces/foundation/**` files, `cell-renderers`,
`stats-grid` (both engines, full), `gallery-view` (full), `grid-view` (partial, ~40%),
`collection-workspace/index.tsx` (targeted clusters, ~15% of 2238 lines), `render-dispatch.tsx`
(targeted, ~25% of 756 lines), `guided-draft-form` (targeted, ~20% of 1093 lines),
`command-center` (targeted, ~45%), `decision-inbox` (targeted), `record-workbench` (targeted, ~35%),
7 `admin/**` files (full), `data/search` (full), `data/report` and `data/compare` (dump + partial).

**Dump-verified only** (exact machine-checked line/property/value data, not a full-file read):
the remaining ~18 small `surfaces/pages/{data,experience,forms,operations}/**` files. Classification
confidence on these is high given the extreme uniformity of the pattern (confirmed by the files that
WERE fully read), but anatomy details (className presence, `data-*` attributes beyond what appears
on the counted lines, imperative writes outside the paint-key scan, keyframes) were not independently
verified for this subset the way they were for the fully-read files. All 47 files' site counts are
machine-verified exact (self-checking dump script, zero mismatches).

**All 47 of 47 files covered** at least at dump-verified granularity; no file was skipped entirely.

---

## 11. The three biggest traps

1. **The lexer's comment-adjacency false negative** (detailed at the top). This is the single most
   consequential finding in this inventory because it is not local to CK-I — it is a defect in the
   shared counting tool the whole WO-06 program measures progress against, and it under-counts
   silently. Already reported to the orchestrator mid-task; repeated here because the brief asks for
   it in the final report.

2. **`background: <bareIdentifier>` is not sufficient evidence of a hatch.** Two independent,
   confirmed corrections to the triage's own C-hatch table (cell-renderers' `barColor`,
   guided-draft-form's `DraftStatusBadge` color) turn out to be bounded-enum STATE-SELECTED (A) once
   the identifier is traced to its source. Both look identical in shape to the checkpoint's *actual*
   hatch cases (`stat.color`, `col.color`, `options?.color`) at the point where the paint key is
   written — the only way to tell them apart is tracing the identifier backward to either a closed
   lookup table (A) or an open caller-supplied prop (C). A migration agent working file-by-file from
   a pre-written hatch list, rather than re-deriving it, will get this wrong in the same direction
   the triage did.

3. **Two real, working, unmigrated hover/focus stylesheets hide inside "surface" files that look
   like thin recipes from their site count alone**: `gallery-view`'s `GALLERY_HOVER_STYLES` (5
   selectors, real `:hover`/`:has()`/`:focus-visible` mechanism on grep-confirmed real classNames)
   and `collection-workspace`'s `PAGE_SIZE_CONTROL_CSS` (6 selectors, same shape). Neither is dead,
   neither is orphaned — both are the actual live mechanism for their component's interactivity, and
   both are completely invisible to the site counter. A checkpoint plan built only from
   `fleet.inlinePaint` counts will not budget for moving either of these, and the migration will
   silently not happen unless someone reads the file rather than the number.

**Runner-up, worth carrying forward**: the generic, unprefixed `@keyframes pulse`/`@keyframes wave`
collision across 9 independent files (stats-grid/rustic among them) is a live cross-component bug
risk today, not just a migration-hygiene concern — flag to the team independent of WO-SKIN scheduling.
