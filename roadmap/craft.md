---
title: "Design System Craft Lane — Interaction, Craft, and Brand Tooling"
date: 2026-07-07
status: canonical
audience: ai-agent
sources:
  - roadmap/proposals.md (owner-review inbox; P-16..P-20 round-2 block APPROVED 2026-07-07 — the source specs for this lane)
  - docs-engineering/archive/audits/2026-07-06-modern-engine-visual-audit-davila.md (evidence base: hardcoded weights/letter-spacing, dead pending states, rainbow-chart risk)
  - ui-design-system/CLAUDE.md (architecture contract: 4-tier taxonomy, BrandTheme white-label chain, ownership rules)
---

# Design System Craft Lane

This lane carries the DS-wide **interaction, craft, and brand-tooling** work the owner approved
from the proposals inbox on 2026-07-07 (proposals P-16..P-20, the round-2 block). Where the
`engine-modern` lane fixes the WIRING of the modern engine (tokens, dark elevation, states,
effects, drains, galleries), this lane addresses the layers that engine-token work cannot reach:
micro-typography, perceived-speed choreography, a keyboard-first model, data-visualization and
flagship-primitive craft, and a productized Tenant Brand Studio. Each WO builds on primitives
that ALREADY exist on disk (a shortcuts registry, an optimistic-update hook, a chart family, the
brand compiler, the theme-builder page) rather than rebuilding — the pattern of this repo is
consolidate-and-elevate, not green-field.

**Relationship to the `engine-modern` lane.** The two lanes are **mostly disjoint by Files**:
`engine-modern` edits engine skins and token artifacts (`foundation/tokens/css/runtime/engines/modern/**`,
`infrastructure/compilers/kernel/runtime/brand-theme`, per-engine `engines/modern.tsx` files); this lane edits behavior, hooks,
patterns, charts, and the showroom Studio. Where both touch `packages/core` (the shared Button,
`foundation/themes/default.css`, the compiler, or the artifacts), the orchestrators **coordinate
windows before claiming** — the same no-conflict discipline the README already applies to the
external co-editor (app-evnto WO-IDN-06). Because both lanes certify with `pnpm test` / `build`
in `packages/core`, do not run a CRA executor and an ENG executor that touch the same file
concurrently in the same working tree. Per-WO coordination notes below name the exact overlap.

The five approved proposals map 1:1 to the five WOs: CRA-01 from P-19, CRA-02 from P-17, CRA-03
from P-16, CRA-04 from P-18, CRA-05 from P-20. The unapproved proposal rounds (round 1 P-01..P-15, round 3 P-21/P-22)
are NOT part of this lane; where a WO would benefit from a not-yet-approved proposal it is noted
as future synergy only, never a dependency.

Lane-wide rules (binding on every WO):

- Repo: `/Users/daniel/Developer/Rottay/ui-design-system` (macOS, pnpm). All paths below are
  relative to the repo root unless prefixed. Component/behavior source lives in `packages/core/src/`;
  the render surface is `packages/showroom`.
- **Gates are truth.** A WO is done when its acceptance gate passes AND the DS build/tests are
  green: `pnpm --filter @rottay/design-system run build` + `pnpm test` (root `test` runs
  `@rottay/design-system`'s vitest). Executors are **edit-only**; the orchestrator certifies and
  commits. No WO commits.
- **The DS is a published package.** Editing `packages/core/src` does NOT change what any consuming
  app renders until a release + repin. No WO in this lane publishes or repins; the craft work ships
  through the normal release train alongside the engine uplift.
- **Sighted check is mandatory for every visual WO.** Run the showroom
  (`pnpm --filter @rottay/showroom run dev`, http://localhost:7001), capture the affected surfaces
  before/after under **both tenant palettes — a dark-surface tenant (rottay, `--ds-color-bg-primary: #0A0A0C`)
  AND a light-surface tenant (bithire or evnto)** — to `test-artifacts/craft/<wo>/`, then actually
  LOOK at the PNGs and score them. There is **no user-facing light/dark toggle** (owner decision
  2026-07-07): the tenant palette decides the surface, so both captures come from switching tenant
  via nested `DesignSystemProvider` columns (the pattern `/foundations/engines` and the theme-builder
  page already use). The owner approves signature moments — never self-approve visuals.
- **Anti-sprawl.** New work = a new `### WO-CRA-NN` block in this file + a `registry.json` entry
  (`pnpm roadmap:check` forces the pairing). No new plan documents.
- No emojis anywhere. Repo docs in English. Never `git checkout/restore/reset` on directories.
  `app-bithire` is READ-ONLY (build DS capability so an app can adopt it later; never write into the
  app). `docs-engineering` is a READ-ONLY reference in this lane. The showroom dev server is allowed.
- **Tenant-artifact rule (inherited from the engine lane).** `foundation/tokens/css/facade/artifacts/**` are
  `compileBrandTheme`-generated snapshots of `foundation/tokens/ts/presentation/brand-themes/*/index.ts`. Any WO that changes a
  `--ds-*` token the compiler emits, or that appears in an artifact, must update the compiler/BrandTheme
  mapping, regenerate the artifact snapshots in the same WO, and keep the `infrastructure/compilers/kernel/runtime/brand-theme` test
  suite green. A token change that leaves a stale artifact override is a gate failure.

Ordering is by leverage: CRA-01 is the cheapest, highest-signal item and has no dependencies;
CRA-02 and CRA-03 are independent behavior/hook work that coordinate with the engine lane by note;
CRA-04 and CRA-05 need the engine lane's foundations (the token ratchet from ENG-01 and the real
galleries from ENG-02) to land first.

---

## WORK ORDERS

### WO-CRA-01 Micro-typography pack
- **Outcome** — A tokenized micro-typography layer at the foundation, consumed (never re-invented inline) by the Typography primitive and every data-bearing surface: tabular numerals available as a token/utility for all data/metric contexts, `text-wrap: balance` on headings and `text-wrap: pretty` on body, optical sizing enabled (`font-optical-sizing: auto`) so tenant variable fonts render at their designed optical size, a hyphenation utility, and typographic-punctuation guidance — all as `--ds-*` tokens / utility classes, with ZERO new hardcoded font-weight or letter-spacing literals introduced in the touched files. No new font binary is bundled (font family stays a BrandTheme choice).
- **Why** — P-19 (proposals.md round 2, APPROVED 2026-07-07): "the cheapest world-class signal that exists." The 2026-07-06 audit flagged hardcoded weights and letter-spacing and the absence of any numeric-alignment mechanism. Verified: `packages/core/src/foundation/tokens/css/foundation/base/typography.css` defines font families/sizes/weights/line-heights/letter-spacing but contains NO `font-variant-numeric`, `font-feature-settings`, `text-wrap`, or `font-optical-sizing` (a grep for those returns nothing in the tokens tree). Tables and metric tiles therefore render proportional digits that jitter and misalign column-to-column, and multi-line headings wrap raggedly. The TS mirror is `packages/core/src/foundation/tokens/ts/foundation/base/typography/index.ts`; the heading/text primitive family is `packages/core/src/ui/primitives/display/Typography/` (its `compound/Text` is the body text component).
- **Depends on** — none. Pairs WO-ENG-07 (which removes the Button's `fontWeight: 500` / `letterSpacing: '0.01em'` literals) — it is NOT a dependency. Coordination: only if CRA-01 and ENG-07 edit `foundation/base/typography.css` or `foundation/themes/default.css` in the same window; CRA-01's ADDITIONS (numeric/wrap/optical tokens) occupy a distinct region from ENG-07's radius/spacing hygiene, so a coordinated sequence avoids conflict.
- **Steps** —
  1. Add micro-typography tokens/utilities to `packages/core/src/foundation/tokens/css/foundation/base/typography.css`: a tabular-numerals utility class `.ds-nums-tabular` (`font-variant-numeric: tabular-nums; font-feature-settings: "tnum" 1, "lnum" 1;`), wrap utilities `.ds-text-balance` (`text-wrap: balance`) and `.ds-text-pretty` (`text-wrap: pretty`), a hyphenation utility `.ds-hyphenate` (`hyphens: auto`), and a global `font-optical-sizing: auto` on the root/body rule (harmless on non-optical fonts; tenant variable fonts get optical sizing automatically). Mirror the atomic references in `packages/core/src/foundation/tokens/ts/foundation/base/typography/index.ts` (e.g. `numericTabular`, `textWrapBalance`, `textWrapPretty`) so TS/styled consumers use tokens, not string literals.
  2. Apply wrap defaults in the Typography primitive (`packages/core/src/ui/primitives/display/Typography/`): headings emit `text-wrap: balance`, body emits `text-wrap: pretty`, via the primitive's class/style output, degrading gracefully where unsupported (the properties are ignored, not broken).
  3. Add a `numeric?: 'tabular' | 'proportional'` prop to the Typography/Text primitive (default `proportional`) that applies the tabular token/class, and route the number-rendering data surfaces to tabular numerals: `packages/core/src/ui/patterns/data/stats-grid/`, `packages/core/src/ui/patterns/data/data-table/`, and the chart `TooltipValue`/`TooltipSeries` in `packages/core/src/ui/patterns/visualization/charts/tooltip/index.tsx`. Consume the token/class — do NOT inline `font-variant-numeric`.
  4. Document the punctuation guidance in the Typography primitive's story/types (curly quotes / em-dashes are CONTENT, not CSS — provide `.ds-hyphenate` and the guidance; do not transform textual content).
  5. Sighted showroom demo: a page (or extension of an existing tokens/typography page) that shows a metric grid + a data table with tabular digits, a balanced multi-line heading, and a body paragraph, under both tenant palettes.
- **Files** — `packages/core/src/foundation/tokens/css/foundation/base/typography.css`, `packages/core/src/foundation/tokens/ts/foundation/base/typography/index.ts`, `packages/core/src/ui/primitives/display/Typography/**` (wrap defaults + `numeric` prop), `packages/core/src/ui/patterns/data/stats-grid/**`, `packages/core/src/ui/patterns/data/data-table/**`, `packages/core/src/ui/patterns/visualization/charts/tooltip/index.tsx`, a `packages/showroom` demo/capture page.
- **Acceptance gate** — `pnpm --filter @rottay/design-system run build` + `pnpm test` green; sighted before/after in `test-artifacts/craft/cra-01/` under a dark-surface tenant (rottay) AND a light-surface tenant (bithire or evnto) showing (a) column-aligned tabular digits in a table/metric grid, (b) a balanced multi-line heading, (c) `text-wrap: pretty` body with no single-word last line; a grep over the touched files proves NO new inline `font-variant-numeric`, `fontWeight: <number>`, or `letterSpacing: '<em>'` literals were added (numerics flow through the tokens/utilities). If WO-ENG-01's `scripts/engine-token-audit.mjs` has already landed, optionally extend it with a typographic-literal counter; the grep is the standing gate either way.
- **Do NOT** — Do not bundle a font binary or hardcode a specific typeface (family stays a BrandTheme choice). Do not transform textual content for punctuation (utility + guidance only). Do not inline `font-variant-numeric`/weight/tracking. Do not force tabular numerals onto prose text. Never `git restore` directories.
- **Size** — S.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, build the micro-typography pack from proposal P-19 (`roadmap/proposals.md`, APPROVED 2026-07-07). Add tokenized micro-typography to `packages/core/src/foundation/tokens/css/foundation/base/typography.css`: a `.ds-nums-tabular` utility (`font-variant-numeric: tabular-nums; font-feature-settings: "tnum" 1, "lnum" 1;`), `.ds-text-balance` (`text-wrap: balance`), `.ds-text-pretty` (`text-wrap: pretty`), `.ds-hyphenate` (`hyphens: auto`), and a global `font-optical-sizing: auto`; mirror atomic references in `packages/core/src/foundation/tokens/ts/foundation/base/typography/index.ts`. In the Typography primitive (`packages/core/src/ui/primitives/display/Typography/`) emit `text-wrap: balance` on headings and `text-wrap: pretty` on body, and add a `numeric?: 'tabular' | 'proportional'` prop (default proportional) applying the tabular token. Route number-rendering surfaces to tabular numerals: `patterns/data/stats-grid`, `patterns/data/data-table`, and `patterns/visualization/charts/tooltip/index.tsx` (`TooltipValue`/`TooltipSeries`) — consume the token/class, never inline `font-variant-numeric`. Document punctuation guidance in the Typography story/types (content, not CSS; do not transform text). Do NOT bundle a font. Gate: `pnpm --filter @rottay/design-system run build` + `pnpm test` green; sighted before/after in `test-artifacts/craft/cra-01/` under rottay (dark surface, `#0A0A0C`) AND a light-surface tenant (bithire or evnto) showing aligned tabular digits, a balanced heading, and pretty body; grep proves no new inline `font-variant-numeric`/`fontWeight:<number>`/`letterSpacing:'<em>'` in the touched files. Run the showroom (`pnpm --filter @rottay/showroom run dev`, http://localhost:7001) and LOOK at the PNGs. Fences: edit-only, no commits, never git-restore directories, app-bithire and docs-engineering read-only, showroom dev server allowed.

### WO-CRA-02 Instant-feel choreography: optimistic UI and async-state law
- **Outcome** — A DS-standard async-state law consumed (not re-invented) by mutation-bearing components: a spinner-timing rule (no busy indicator before ~150ms; a Skeleton, not a spinner, for longer waits), a Button pending posture (label/spinner swap, disabled, preserved width so nothing jumps), an optimistic row/list reconciliation recipe over the existing `useOptimisticUpdate` hook, and an undo-window Toast (countdown + Undo action) — all driven by `--ds-motion-*`/state tokens and reduced-motion aware. The law is DS-generic: it standardizes the STATES; apps bind them to their own action-result envelope (the DS ships no such envelope type).
- **Why** — P-17 (APPROVED 2026-07-07): "perceived speed is the most underrated premium signal; today every app hand-rolls pending states inconsistently." The primitives exist but are unbound: `packages/core/src/infrastructure/runtime/application/data/runtime/optimistic/index.ts` (`useOptimisticUpdate<T>` — `mutate`/`isPending`/`error`/`rollback`/`data`, `rollbackDelay`, mutation-id guard), `packages/core/src/ui/primitives/feedback/Skeleton/` (with compound Card/Table/ListItem/Paragraph/Button/Avatar), and `packages/core/src/ui/primitives/feedback/Toast/`. There is no spinner-timing law, no standard Button pending posture, and no undo-window Toast recipe tying them together. `BrandMotion.skeletonStyle` (`'pulse' | 'shimmer' | 'wave'`) already exists in the contract (`packages/core/src/foundation/contracts/composition/tenants/themes/index.ts:142`), so skeleton personality is tenant-tunable; the law wires it.
- **Depends on** — none. Coordination: the visual pending states consume the **WO-ENG-04** interaction-state tokens (hover/press/disabled/focus) once they land; if CRA-02 and ENG-04 both edit `packages/core/src/ui/primitives/inputs/Button/engines/modern/index.tsx`, coordinate the window (both certify with `pnpm test`/`build` in `packages/core`). Until ENG-04 lands, CRA-02 consumes the current disabled/press tokens and swaps to the ENG-04 tokens at integration.
- **Steps** —
  1. Spinner-timing law as tokens + a hook: define `--ds-async-spinner-delay: 150ms` and `--ds-async-skeleton-after` (a longer threshold) in `packages/core/src/foundation/tokens/css/foundation/themes/default.css`; add a `useDeferredPending(isPending)` hook under `packages/core/src/infrastructure/runtime/application/data/` that returns `{ showSpinner, showSkeleton }` gated on those thresholds (nothing before ~150ms; Skeleton after the longer threshold), and disables the deferral entirely under `prefers-reduced-motion` in a way that still avoids the sub-150ms flash.
  2. Button pending posture: formalize a `pending?: boolean` (with optional `pendingLabel`) posture on the Button (`packages/core/src/ui/primitives/inputs/Button/`) that swaps label/spinner WITHOUT a width jump (reserve the label's width), stays `disabled`/`aria-busy`, and transitions on `--ds-motion-fast` / `--ds-motion-ease-out`. Consume state tokens, not inline literals.
  3. Optimistic reconciliation recipe: export a thin, domain-agnostic helper over `useOptimisticUpdate` (`packages/core/src/infrastructure/runtime/application/data/runtime/optimistic/`) for row/list updates — apply the optimistic value, reconcile on confirm, roll back on error with `rollbackDelay` — documented for `patterns/data` consumers. No app/domain semantics.
  4. Undo-window Toast: a Toast compound/recipe under `packages/core/src/ui/primitives/feedback/Toast/compound/` with a countdown ring/bar and an Undo action, aligned to `--ds-motion-*` and disabled/collapsed under reduced motion (no looping animation).
  5. Sighted proof of the timing law: a showroom demo triggering a FAST (<150ms) mutation (NO spinner appears), a MEDIUM one (spinner), and a LONG one (skeleton), plus a Button pending swap and an undo Toast — captured under both tenant palettes and once with reduced motion.
- **Files** — `packages/core/src/foundation/tokens/css/foundation/themes/default.css` (async tokens), `packages/core/src/infrastructure/runtime/application/data/**` (the `useDeferredPending` hook), `packages/core/src/ui/primitives/inputs/Button/**` (pending posture; `engines/modern.tsx` is the ENG-04 coordination point), `packages/core/src/ui/primitives/feedback/Toast/compound/**` (undo-window recipe), `packages/core/src/infrastructure/runtime/application/data/runtime/optimistic/**` (reconciliation recipe/export), a `packages/showroom` demo/capture page.
- **Acceptance gate** — `pnpm --filter @rottay/design-system run build` + `pnpm test` green (add a unit test asserting `useDeferredPending` shows nothing before the delay and a skeleton after the threshold); sighted before/after in `test-artifacts/craft/cra-02/` under both tenant palettes proving (a) no spinner under 150ms, (b) Skeleton (not spinner) on long waits, (c) a Button pending swap with no width jump, (d) an undo Toast with a working countdown + Undo; a reduced-motion capture shows the countdown/animations disabled.
- **Do NOT** — Do not add product/domain semantics or an "action-result envelope" TYPE to the DS (apps own that; expose generic states only). Do not show a busy indicator before the delay. Do not let the pending Button change width. Do not loop the undo countdown. Never `git restore` directories.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, build the instant-feel async-state law from proposal P-17 (`roadmap/proposals.md`, APPROVED 2026-07-07). Add `--ds-async-spinner-delay: 150ms` + `--ds-async-skeleton-after` to `packages/core/src/foundation/tokens/css/foundation/themes/default.css`; add a `useDeferredPending(isPending)` hook in `packages/core/src/infrastructure/runtime/application/data/` returning `{ showSpinner, showSkeleton }` gated on those thresholds (nothing < ~150ms; Skeleton after the longer threshold; reduced-motion aware without a sub-150ms flash). Formalize a Button `pending?: boolean` (+ `pendingLabel`) posture in `packages/core/src/ui/primitives/inputs/Button/` that swaps label/spinner with NO width jump, stays disabled/`aria-busy`, transitions on `--ds-motion-fast`/`ease-out` (consume state tokens, coordinate `engines/modern.tsx` with WO-ENG-04 if it is live). Export a domain-agnostic row/list reconciliation recipe over `useOptimisticUpdate` (`packages/core/src/infrastructure/runtime/application/data/runtime/optimistic/`). Add an undo-window Toast compound (countdown ring/bar + Undo) in `packages/core/src/ui/primitives/feedback/Toast/compound/`, reduced-motion safe (no looping). Do NOT add an app "action-result envelope" type to the DS. Gate: `pnpm --filter @rottay/design-system run build` + `pnpm test` green (unit-test the timing hook); sighted `test-artifacts/craft/cra-02/` under rottay (dark) + a light-surface tenant proving no spinner <150ms, skeleton on long waits, Button swap with no width jump, working undo Toast, and a reduced-motion capture. Run the showroom (`pnpm --filter @rottay/showroom run dev`, http://localhost:7001) and LOOK at the PNGs. Fences: edit-only, no commits, never git-restore directories, app-bithire and docs-engineering read-only, showroom dev server allowed.

### WO-CRA-03 Keyboard-first interaction model
- **Outcome** — A DS keyboard model layered on the EXISTING shortcuts registry: per-surface shortcut SCOPES (a surface's shortcuts fire only while that surface is active), a roving-tabindex helper for lists/tables/menus, j/k-style collection navigation, shortcut hints rendered in tooltips, and the cheatsheet overlay reachable from the CommandPalette. Power users drive the flagship surfaces without a mouse; the global `ctrl+k` / key-sequence behavior and input-suppression do not regress.
- **Why** — P-16 (APPROVED 2026-07-07): the defining feel of Linear-class tools is that power users never touch the mouse. The DS already ships the pieces but they are global-only and unconnected: `packages/core/src/infrastructure/runtime/application/interaction/shortcuts/index.ts` (`ShortcutProvider`, `useGlobalShortcut(s)`, `useRegisteredShortcuts`, `formatShortcutKey`, `ShortcutDefinition` with `key`/`handler`/`description`/`category`/`when` — combos + sequences + input auto-suppression + conflict warnings, but NO per-surface scope), `packages/core/src/ui/patterns/navigation/shortcuts-overlay/` (the cheatsheet `PatternShortcutsOverlay`, 3 engines), `packages/core/src/ui/patterns/navigation/command-palette/`, and `packages/core/src/infrastructure/runtime/application/accessibility/index.ts` (`useKeyboardNavigation` — arrows/Home/End/Enter/Escape, orientation, loop, but no roving-tabindex management). There is no scope model, no roving tabindex, no j/k collection nav, and the cheatsheet is not reachable from the palette.
- **Depends on** — none. **Future synergy (NOT a dependency):** proposal P-01 (headless behavior core) is unapproved; if it is later approved, the scope + roving-tabindex helpers built here become the natural home for the shared focus/keyboard model P-01 would own once for every engine. Do not wait on P-01 or build toward its API.
- **Steps** —
  1. Per-surface scopes: extend `ShortcutDefinition`/`ShortcutProvider` (`packages/core/src/infrastructure/runtime/application/interaction/shortcuts/`) with an optional `scope` id plus a `ShortcutScope` provider/hook so a surface registers shortcuts that fire only while that scope is active (active = focus within the scope container, or the scope is the topmost mounted scope). Global (scope-less) shortcuts keep firing. Preserve conflict-warning + editable-element suppression.
  2. Roving tabindex: add a `useRovingTabindex` hook under `packages/core/src/infrastructure/runtime/application/accessibility/` (built on `useKeyboardNavigation`) that manages `tabIndex` 0/-1 across an item set so Tab enters the group once and arrows move within; wire it into the list/menu/table patterns that render item sets.
  3. j/k collection navigation: a scoped shortcut set (`j` next, `k` previous, `x` select, `enter` open) opt-in for collection patterns under `packages/core/src/ui/patterns/data/`, gated by scope so it never fires globally.
  4. Shortcut hints in tooltips: the Tooltip primitive (`packages/core/src/ui/primitives/display/Tooltip/`) gains an optional `shortcut?: string` that renders `formatShortcutKey` chips inline; wire Button/menu-item to pass their bound shortcut so hovering shows the key.
  5. Cheatsheet from the palette: register a built-in CommandPalette command ("Keyboard shortcuts", default `?`) that opens `PatternShortcutsOverlay` populated from `useRegisteredShortcuts` (now scope-aware, grouping by scope/category).
  6. Sighted proof: a showroom demo with a scoped list (j/k + roving tabindex + visible focus ring), a tooltip showing a shortcut hint, and the palette opening the cheatsheet.
- **Files** — `packages/core/src/infrastructure/runtime/application/interaction/shortcuts/**` (scopes), `packages/core/src/infrastructure/runtime/application/accessibility/**` (`useRovingTabindex`), `packages/core/src/ui/patterns/navigation/command-palette/**`, `packages/core/src/ui/patterns/navigation/shortcuts-overlay/**`, `packages/core/src/ui/primitives/display/Tooltip/**` (the `shortcut` prop), the collection patterns under `packages/core/src/ui/patterns/data/**`, a `packages/showroom` demo/capture page.
- **Acceptance gate** — `pnpm --filter @rottay/design-system run build` + `pnpm test` green, including a test that a scoped shortcut does NOT fire outside its scope and DOES within it (extend `packages/core/src/infrastructure/runtime/application/interaction/shortcuts/tests/`); sighted before/after in `test-artifacts/craft/cra-03/` under both tenant palettes showing roving-tabindex + j/k focus movement (focus ring visible), a tooltip shortcut hint, and the palette-opened cheatsheet.
- **Do NOT** — Do not break the global registry, key-sequence matching, or editable-element suppression. Do not make j/k global (scope-gated only). Do not hijack native Tab semantics beyond roving tabindex. Never `git restore` directories.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, build the keyboard-first interaction model from proposal P-16 (`roadmap/proposals.md`, APPROVED 2026-07-07), layering on the EXISTING registry (`packages/core/src/infrastructure/runtime/application/interaction/shortcuts/index.ts`), a11y hooks (`packages/core/src/infrastructure/runtime/application/accessibility/index.ts`), cheatsheet (`packages/core/src/ui/patterns/navigation/shortcuts-overlay/`), and CommandPalette (`packages/core/src/ui/patterns/navigation/command-palette/`). (1) Add per-surface `scope` to `ShortcutDefinition`/`ShortcutProvider` + a `ShortcutScope` provider so scoped shortcuts fire only while active (focus-within or topmost mounted scope); keep global shortcuts, conflict warnings, and editable-element suppression. (2) Add `useRovingTabindex` in `packages/core/src/infrastructure/runtime/application/accessibility/` (built on `useKeyboardNavigation`) managing `tabIndex` 0/-1; wire into list/menu/table patterns. (3) Add scoped j/k collection nav (`j` next, `k` prev, `x` select, `enter` open) opt-in for `packages/core/src/ui/patterns/data/` collections — never global. (4) Add a `shortcut?: string` prop to the Tooltip primitive (`packages/core/src/ui/primitives/display/Tooltip/`) rendering `formatShortcutKey` chips; wire Button/menu-item. (5) Register a "Keyboard shortcuts" (`?`) CommandPalette command opening `PatternShortcutsOverlay` from `useRegisteredShortcuts`. Note P-01 (headless core) is UNAPPROVED — future synergy only, not a dependency. Gate: `pnpm --filter @rottay/design-system run build` + `pnpm test` green with a scoped-shortcut test (fires in-scope, not out); sighted `test-artifacts/craft/cra-03/` under rottay (dark) + a light-surface tenant showing roving tabindex + j/k focus, a tooltip hint, and the palette cheatsheet. Run the showroom (`pnpm --filter @rottay/showroom run dev`, http://localhost:7001) and LOOK at the PNGs. Fences: edit-only, no commits, never git-restore directories, app-bithire and docs-engineering read-only, showroom dev server allowed.

### WO-CRA-04 Data-visualization and flagship-primitive craft
- **Outcome** — A craft pass the token work cannot reach: a unified chart tooltip + crosshair treatment across the D3 chart family, tabular numerals wherever data renders (consuming CRA-01), a disciplined DEFAULT chart palette that stops inviting rainbow dashboards, gauge/sparkline polish, and the flagship-primitive gaps closed — Badge tone-pills themed from the BrandTheme artifact, the existing Popover primitive elevated so an app create-chooser can compose it instead of hand-rolling, and Select/AutoComplete combobox + DatePicker range-mode quality. Charts are engine-agnostic, so this is mostly disjoint from the engine-modern skin files.
- **Why** — P-18 (APPROVED 2026-07-07), evidence-backed by the 2026-07-04 bithire DS-craft-pass note. Data-heavy screens are where enterprise users live; chart and picker craft is the most visible mid-tier→world-class difference. The chart family lives at `packages/core/src/ui/patterns/visualization/charts/` (19 types + `tooltip/index.tsx` with `useChartTooltip`/`ChartTooltip`/`TooltipValue`/`TooltipSeries` + auto-flip, `gauge/`, `sparkline/`, and `hooks/` including `use-chart-theme.ts`, `use-chart-personality.ts`, `use-chart-brush.ts`); the tooltip exists but there is no shared crosshair and each chart styles hover independently, and the default categorical palette invites rainbows. `packages/core/src/ui/primitives/display/Badge/` exposes `BadgeVariant` color variants that are NOT driven from the artifact tone tokens. `packages/core/src/ui/primitives/overlay/Popover/` exists (classic/modern/rustic) but is a thin wrapper (36-line `Popover.tsx`) that app create-choosers bypass by hand-rolling. `packages/core/src/ui/primitives/inputs/Select/` + `AutoComplete/` are the combobox family, and `packages/core/src/ui/primitives/inputs/DatePicker/` already supports range selection (`RangePickerProps`) but needs a craft pass.
- **Depends on** — **WO-ENG-01** (token discipline + `scripts/engine-token-audit.mjs`, so new craft consumes tokens, not literals) and **WO-ENG-02** (the real component galleries + tenant-palette axis are the sighted-check surface). Coordination: if the chart/Badge color work overlaps WO-ENG-06 (color purity) on the same files, coordinate the window; charts sit OUTSIDE the ENG modern-skin file set, so overlap is limited to Badge and any shared color token.
- **Steps** —
  1. Unified chart tooltip + crosshair: extend `packages/core/src/ui/patterns/visualization/charts/tooltip/` with a shared crosshair (vertical/horizontal guide + focus dot, building on `hooks/use-chart-brush.ts` where useful) and a single tooltip treatment (tokened elevation, tabular values via CRA-01, series swatches) adopted by line/area/bar/scatter; remove per-chart bespoke hover styling.
  2. Chart palette discipline: curate the DEFAULT categorical palette in `charts/hooks/use-chart-theme.ts` / `use-chart-personality.ts` to a restrained, accessible set (order the accessible/Wong palette first) so a no-config chart never renders a rainbow; keep the 5 named palettes; steer ordered data toward sequential/diverging usage.
  3. Tabular numerals everywhere data renders: route axis labels, tooltip values, gauge/sparkline readouts, and BulletChart numbers through CRA-01's tabular-nums token/utility.
  4. Gauge/sparkline polish: refine `charts/gauge/` and `charts/sparkline/` (needle/arc easing on `--ds-motion-*`, disciplined end-dot + area-fill, tabular readout).
  5. Badge tone-pills from the artifact: make `BadgeVariant` tones resolve from `--ds-color-*` / BrandTheme tone tokens (via the compiler emission) so every tenant themes badges; remove any hardcoded tone hex. If a compiler mapping changes, regenerate `foundation/tokens/css/facade/artifacts/**` and keep the `infrastructure/compilers/kernel/runtime/brand-theme` suite green (tenant-artifact rule).
  6. Popover elevation: bring `packages/core/src/ui/primitives/overlay/Popover/` to flagship quality (positioning/flip, focus trap + return, dismiss-on-outside/escape, arrow, motion on `--ds-motion-*`, tokened surface/elevation) so an app create-chooser can COMPOSE it; document the composition seam in the story. Build the DS capability only — do NOT reach into `app-bithire` (READ-ONLY).
  7. Combobox + date-range craft: a quality pass on `packages/core/src/ui/primitives/inputs/Select/` + `AutoComplete/` (keyboard nav via CRA-03's roving tabindex where applicable, tokened surface/elevation) and the `DatePicker/` range mode (tokened surface, tabular date/number readouts).
  8. Sighted proof across the WO-ENG-02 flagship galleries under both tenant palettes.
- **Files** — `packages/core/src/ui/patterns/visualization/charts/tooltip/**`, `charts/hooks/use-chart-theme.ts`, `charts/hooks/use-chart-personality.ts`, `charts/gauge/**`, `charts/sparkline/**`, `charts/utils/**`, `packages/core/src/ui/primitives/display/Badge/**`, `packages/core/src/infrastructure/compilers/kernel/runtime/brand-theme/**` + `packages/core/src/foundation/tokens/css/facade/artifacts/**` (ONLY if the Badge tone mapping changes), `packages/core/src/ui/primitives/overlay/Popover/**`, `packages/core/src/ui/primitives/inputs/Select/**`, `packages/core/src/ui/primitives/inputs/AutoComplete/**`, `packages/core/src/ui/primitives/inputs/DatePicker/**`, `packages/showroom` galleries.
- **Acceptance gate** — `pnpm --filter @rottay/design-system run build` + `pnpm test` green; if a compiler/artifact mapping changed, artifacts regenerated + `infrastructure/compilers/kernel/runtime/brand-theme` suite green; sighted before/after in `test-artifacts/craft/cra-04/` under both tenant palettes showing the unified tooltip + crosshair, the restrained default palette (no rainbow on a no-config chart), tabular chart numbers, gauge/sparkline polish, artifact-themed Badge tones (they shift with the tenant), the elevated Popover, and the combobox/date-range craft.
- **Do NOT** — Do not add product/domain semantics to charts or primitives. Do not write into `app-bithire`. Do not reintroduce rainbow defaults. Do not swap one hardcoded tone hex for another (resolve from tokens). Never `git restore` directories.
- **Size** — L.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, run the data-viz + flagship-primitive craft pass from proposal P-18 (`roadmap/proposals.md`, APPROVED 2026-07-07). Depends on WO-ENG-01 (token ratchet) + WO-ENG-02 (real galleries) being done. (1) Unify the chart tooltip + add a shared crosshair in `packages/core/src/ui/patterns/visualization/charts/tooltip/` (build on `hooks/use-chart-brush.ts`), adopted by line/area/bar/scatter; remove per-chart hover styling. (2) Curate the DEFAULT categorical palette in `charts/hooks/use-chart-theme.ts` + `use-chart-personality.ts` to a restrained accessible set (accessible/Wong first) so no-config charts never rainbow; keep the 5 named palettes. (3) Route axis/tooltip/gauge/sparkline/BulletChart numbers through CRA-01's tabular-nums token. (4) Polish `charts/gauge/` + `charts/sparkline/` (easing on `--ds-motion-*`, end-dot/area-fill discipline, tabular readouts). (5) Make `BadgeVariant` tones (`packages/core/src/ui/primitives/display/Badge/`) resolve from `--ds-color-*`/BrandTheme tone tokens via the compiler; remove hardcoded tone hex; if the compiler mapping changes, regenerate `foundation/tokens/css/facade/artifacts/**` and keep the `infrastructure/compilers/kernel/runtime/brand-theme` suite green. (6) Elevate `packages/core/src/ui/primitives/overlay/Popover/` to flagship quality (flip, focus trap + return, dismiss, arrow, `--ds-motion-*`, tokened elevation) so an app create-chooser can compose it — do NOT touch app-bithire. (7) Craft-pass the combobox family (`Select/`, `AutoComplete/`) and the `DatePicker/` range mode (roving tabindex via CRA-03 where applicable, tokened surface, tabular readouts). Gate: `pnpm --filter @rottay/design-system run build` + `pnpm test` green; artifacts regenerated + compiler suite green if a mapping changed; sighted `test-artifacts/craft/cra-04/` under rottay (dark) + a light-surface tenant showing the unified tooltip+crosshair, restrained palette, tabular numbers, gauge/sparkline polish, tenant-shifting Badge tones, the elevated Popover, and combobox/date-range craft. Run the showroom (`pnpm --filter @rottay/showroom run dev`, http://localhost:7001) and LOOK at the PNGs. Fences: no domain semantics, no rainbow defaults, no hex-for-hex swaps, edit-only, no commits, never git-restore directories, app-bithire and docs-engineering read-only, showroom dev server allowed.

### WO-CRA-05 Tenant Brand Studio
- **Outcome** — The showroom theme-builder productized into a reusable, domain-agnostic DS pattern (`PatternBrandStudio` under `patterns/misc/`) that the app-platform branding admin can consume: live preview of a tenant `BrandTheme` against the flagship galleries, inline contrast validation via `validateBrandingContrast`, a hostile-input check, and export to `BrandTheme` / `TenantAppearanceAdvanced`. v1 compiles with the CURRENT `compileBrandTheme` + `validateBrandingContrast`; the OKLCH ramp preview deepens ONLY if proposal P-04 is later approved (P-04 is NOT a dependency).
- **Why** — P-20 (APPROVED 2026-07-07): this turns whitelabel-per-tenant from an engineering property into a PRODUCT feature — the operator styles a brand safely with validation, which is exactly what a whitelabel platform sells (app-platform is the sanctioned DB-branding vertical, so the consumer app exists). The machinery is present but only as a showroom comparison viewer: `packages/showroom/src/app/(docs)/playground/theme-builder/page.tsx` renders the three brand tenants side-by-side via nested `DesignSystemProvider` columns but is NOT an interactive builder and is NOT a DS-owned, app-consumable pattern. The compile + validate primitives exist: `packages/core/src/infrastructure/compilers/kernel/runtime/brand-theme/index.ts` (`compileBrandTheme`) and `validateBrandingContrast` (exported from `packages/core/src/server.ts`, implemented at `packages/core/src/foundation/internal/kernel/accessibility/branding-contrast/`). The bounded BrandTheme contract is `packages/core/src/foundation/contracts/composition/tenants/themes/index.ts` (`BrandMotion`, palette/typography/surfaces/chrome).
- **Depends on** — **WO-ENG-02** (the real flagship galleries + tenant-palette axis are the Studio's live-preview target). The OKLCH ramp preview is a **P-04 deepening only** — P-04 is UNAPPROVED and NOT a dependency; v1 uses `compileBrandTheme` + `validateBrandingContrast` as they exist today, and the ramp preview shows the current hand-tuned ramp until P-04 (if approved) replaces the derivation.
- **Steps** —
  1. Promote the pattern to the DS: create `packages/core/src/ui/patterns/misc/brand-studio/` — a domain-agnostic `PatternBrandStudio` that takes a `BrandTheme` (or partial) + a galleries slot and renders an editor for the BOUNDED BrandTheme fields (palette, typography, surfaces, motion, chrome) plus a live preview. It must know nothing about tenants/candidates/events — it edits a `BrandTheme`; the consuming app passes the tenant wiring.
  2. Live preview: render the WO-ENG-02 flagship galleries inside the Studio under the in-progress `BrandTheme` (via `DesignSystemProvider` + `compileBrandTheme`) so edits reflect immediately, shown on BOTH a dark-surface and a light-surface preview (a tenant defines one surface; there is no light/dark toggle).
  3. Inline validation: run `validateBrandingContrast` on the edited palette against the preview surfaces and surface violations + suggestions inline as the user edits.
  4. Hostile-input check: a "check" action that stress-tests the current `BrandTheme` (garish/extreme values) and reports any preview surface where a color/font/radius fails contrast — reuse the contrast validator (the deeper hostile-tenant CI gate is proposal P-05, NOT this WO).
  5. Export: serialize the edited `BrandTheme` to a `BrandTheme` object and to `TenantAppearanceAdvanced` (bounded fields only) for an app to persist; round-trip must re-import cleanly.
  6. Showroom consumer: mount `PatternBrandStudio` in `packages/showroom/src/app/(docs)/playground/theme-builder/page.tsx` as the living example and the sighted-check surface.
- **Files** — `packages/core/src/ui/patterns/misc/brand-studio/**` (new pattern + `index.ts`), `packages/core/src/infrastructure/compilers/kernel/runtime/brand-theme/**` (consume; add an export helper only if strictly needed), `packages/core/src/foundation/contracts/composition/tenants/themes/**` (READ the contract; no unbounded additions), `packages/showroom/src/app/(docs)/playground/theme-builder/page.tsx` (mount the pattern), a `packages/showroom` capture route.
- **Acceptance gate** — `pnpm --filter @rottay/design-system run build` + `pnpm test` green (add a test that `validateBrandingContrast` is invoked on edit and that the `BrandTheme` export round-trips); `pnpm --filter @rottay/showroom run typecheck` + `pnpm --filter @rottay/showroom run build` green; sighted before/after in `test-artifacts/craft/cra-05/` under both tenant palettes showing the Studio editing a `BrandTheme` with live gallery preview, inline contrast validation flagging a low-contrast pair, the hostile-check report, and a valid `BrandTheme`/`TenantAppearanceAdvanced` export.
- **Do NOT** — Do not add tenant/candidate/event semantics to the pattern (it edits a `BrandTheme`; the app owns tenant wiring). Do not emit unbounded `tokenOverrides` beyond the bounded contract. Do not make P-04/OKLCH a hard requirement (v1 uses the current compiler). Do not write into `app-platform` or `app-bithire`. Never `git restore` directories.
- **Size** — L.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, productize the Tenant Brand Studio from proposal P-20 (`roadmap/proposals.md`, APPROVED 2026-07-07). Depends on WO-ENG-02 (real galleries) being done. Create a domain-agnostic `PatternBrandStudio` at `packages/core/src/ui/patterns/misc/brand-studio/` that takes a `BrandTheme` (or partial) + a galleries slot and renders (1) an editor for the BOUNDED BrandTheme fields (palette, typography, surfaces, motion, chrome — see `packages/core/src/foundation/contracts/composition/tenants/themes/index.ts`) and (2) a live preview of the WO-ENG-02 galleries under the in-progress theme via `DesignSystemProvider` + `compileBrandTheme` (`packages/core/src/infrastructure/compilers/kernel/runtime/brand-theme/index.ts`), shown on a dark-surface AND a light-surface preview (no light/dark toggle — the tenant defines one surface). Run `validateBrandingContrast` (from `packages/core/src/server.ts`) inline on edit to flag violations/suggestions; add a hostile-input "check" that stress-tests the theme and reports contrast failures (the deeper P-05 CI gate is out of scope). Add export to a `BrandTheme` object and to `TenantAppearanceAdvanced` (bounded fields only), round-trippable. Mount the pattern in `packages/showroom/src/app/(docs)/playground/theme-builder/page.tsx` as the living example. The OKLCH ramp preview deepens only if P-04 is later approved — P-04 is UNAPPROVED and NOT a dependency; v1 uses the current compiler + validator. Gate: `pnpm --filter @rottay/design-system run build` + `pnpm test` green (test that `validateBrandingContrast` runs on edit and the export round-trips); `pnpm --filter @rottay/showroom run typecheck` + `run build` green; sighted `test-artifacts/craft/cra-05/` under rottay (dark) + a light-surface tenant showing the editor + live preview, inline contrast validation, the hostile-check, and a valid export. Run the showroom (`pnpm --filter @rottay/showroom run dev`, http://localhost:7001) and LOOK at the PNGs. Fences: no tenant/domain semantics in the pattern, no unbounded tokenOverrides, edit-only, no commits, never git-restore directories, app-platform/app-bithire/docs-engineering read-only, showroom dev server allowed.

**Lane extension (2026-07-07).** After this lane was drafted, the owner approved EVERY remaining
proposal round ("quiero que sea 10/10 el ds"): round 1 (P-01..P-06, P-08..P-15; P-07 stays
WITHDRAWN) and round 3 (P-21, P-22). Five of those proposals convert HERE as WO-CRA-06..10
(P-21 -> CRA-06, P-22 -> CRA-07, P-09 -> CRA-08, P-12 -> CRA-09, P-15 -> CRA-10); the rest convert
in the sibling lanes (`roadmap/gates.md`, `roadmap/tokens.md`, `roadmap/architecture.md`). The intro
statement above that rounds 1/3 "are NOT part of this lane" is superseded accordingly, as are the
in-block references to P-01/P-04/P-05 as unapproved inside WO-CRA-03 and WO-CRA-05 (those blocks are
preserved verbatim; read P-01 as WO-ARC-02, P-04 as WO-TOK-02, P-05 as WO-GAT-03 — the "not a
dependency" rulings stand unchanged). All lane-wide rules above bind WO-CRA-06..10 unmodified.

### WO-CRA-06 Motion choreography system
- **AMENDMENT 2026-07-10 (corrections to this WO and to its done evidence)** —
  1. **The WO cites the wrong file and line twice.** It says the hardcoded spring lives at `foundation/tokens/css/runtime/engines/modern/theme.css:111`. That line is `padding-right: var(--ds-button-md-padding-x);`. The real hardcode was `foundation/tokens/css/foundation/animations/transitions.css:93`.
  2. **"No animation library" was never true.** `framer-motion@^12` is an installed peer dependency used by fourteen existing motion primitives. Everything this WO added is plain CSS, DOM events and the Web Animations API, but the module was not framer-free before and is not now.
  3. **The done evidence claimed "no eslint-disable, no !important, no @ts-ignore in the diff (grepped)". The grep was run over `git diff`, which does not see new files.** There are two `@ts-expect-error` in `motion/hooks/tests/use-flip-layout.test.tsx`, both deleting `Element.prototype.animate`/`getAnimations` in a test-local WAAPI polyfill cleanup — the same pattern `use-view-transition.test.tsx` already established, and legitimate. They were disclosed by the executor and missed by the orchestrator's check. A check that cannot see new files is a check looking where the defect is not.
  4. Not done, by the executor's own account: the standalone `<Toast>` engine's hand-rolled presence (works, fragile), list reorder in `patterns/data`, and Menu (both of its submenu implementations are in-place expand/collapse, not overlay mount/unmount, so Presence is the wrong tool).

- **Outcome** — The choreography layer ABOVE the WO-ENG-01 motion canon — how motion is orchestrated, not just timed: spring physics as CSS `linear()` easing tokens generated from the `BrandTheme.motion` personality (tenant-tunable, replacing the hardcoded cubic-bezier approximation); presence (mount/UNMOUNT) orchestration for modals, drawers, toasts, menus, and list items so nothing pops out of existence; FLIP-based layout motion for list reorder, kanban card moves, and the sliding tab indicator so position changes glide instead of teleport; and an interruptibility law — interactive motion is retargetable mid-flight (transitions/springs, never fixed-duration keyframes on interactive elements). Compositor-only law enforced mechanically: animate `transform`/`opacity` only, with a counter in `scripts/engine-token-audit.mjs` flagging animation of layout properties as a defect. `prefers-reduced-motion` disables presence/layout motion wholesale.
- **Why** — P-21 (proposals.md round 3, APPROVED 2026-07-07): "a premium engine with perfect duration tokens still feels cheap if elements pop in, vanish abruptly, and teleport on reorder." Verified: the contract already carries spring personality that drives NOTHING — `BrandMotion` has `entrance?: 'none' | 'fade' | 'slideUp' | 'spring' | 'bounce'` plus `springTension`/`springFriction` (`packages/core/src/foundation/contracts/composition/tenants/themes/index.ts:134,139-140`), and `compileBrandTheme` copies them into personality (`packages/core/src/infrastructure/compilers/kernel/runtime/brand-theme/index.ts:64-65`) while emitting only fixed cadence durations (`--ds-motion-instant: 120ms` / `--ds-motion-calm` / `--ds-motion-deliberate: 320ms`, lines 267-269); no spring curve is ever generated — the modern engine hardcodes one `--ds-motion-spring` cubic-bezier at `packages/core/src/foundation/tokens/css/runtime/engines/modern/theme.css:111`. The motion module ships entrance-only primitives (`packages/core/src/graphics/motion/react/presentation/primitives/`: fade-in, slide-in, scale-in, stagger-children, scroll-reveal, text-reveal, count-up, morph, magnetic, parallax) — no unmount choreography and no FLIP anywhere; Modal/Drawer/Toast/Dropdown/Menu unmount instantly today. The reduced-motion plumbing to ride exists: `--ds-motion-reduce` + the `--ds-duration-*`/`--ds-ease-*` foundation block (`packages/core/src/foundation/tokens/css/foundation/animations/transitions.css:265-286`).
- **Depends on** — **WO-ENG-01** (the motion canon + `scripts/engine-token-audit.mjs`; the compositor-only counter EXTENDS that script — lane law: extend the ratchet, never fork it). Pairs WO-CRA-08 (View Transitions own PAGE-level continuity; this WO owns COMPONENT-level choreography — disjoint by scope; coordinate only if both edit `foundation/animations/transitions.css` in the same window).
- **Steps** —
  1. Spring `linear()` tokens: in `packages/core/src/infrastructure/compilers/kernel/runtime/brand-theme/`, generate CSS `linear()` easing curves from `springTension`/`springFriction` (sample a damped-spring solution into `linear()` stops) and emit `--ds-motion-spring` (plus a gentler variant, e.g. `--ds-motion-spring-gentle`) from the compiler so the modern theme's hardcoded cubic-bezier becomes a fallback, not the source; regenerate `foundation/tokens/css/facade/artifacts/**` (tenant-artifact rule) and keep the `infrastructure/compilers/kernel/runtime/brand-theme` suite green.
  2. Presence orchestration: a `usePresence` hook + `Presence` wrapper under `packages/core/src/graphics/motion/` (keeps the node mounted until its exit animation completes; drives `data-state="open" | "closed"` so CSS owns enter AND exit); wire the overlay/feedback family — `primitives/overlay/Modal`, `primitives/feedback/Drawer`, `primitives/feedback/Toast`, `primitives/overlay/Dropdown` + `ContextMenu`, `primitives/navigation/Menu` — and list-item exit in the collection patterns.
  3. FLIP layout motion: a `useFlipLayout` hook under `packages/core/src/graphics/motion/react/runtime/hooks/` (measure -> invert -> play, transform-only); wire list reorder in `patterns/data`, kanban card moves (`packages/core/src/ui/patterns/visualization/kanban-board/`), and the Tabs active indicator (`primitives/navigation/Tabs`).
  4. Interruptibility law: implement interactive motion as retargetable transitions (CSS transitions on `data-state`, or Web Animations API with `commitStyles` where JS drives) and document the law in `packages/core/src/graphics/motion/foundation/contracts/`; no fixed-duration keyframes on interactive elements.
  5. Compositor-only counter: extend `scripts/engine-token-audit.mjs` with a counter flagging `transition`/`animation` of layout properties (top/left/width/height/margin/padding) in component source; ratchet: zero NEW occurrences, and zero remaining in files this WO touches. (The known Collapse `max-height` transition is WO-CRA-07's step 4 — the counter counts it; do not fix it here.)
  6. Reduced motion: presence and layout motion collapse to instant show/hide under `prefers-reduced-motion` (ride `--ds-motion-reduce` / the zeroed duration block).
  7. Sighted proof: showroom captures of modal/drawer/toast EXIT choreography, a list reorder gliding, and the tab indicator sliding, under both tenant palettes, plus one reduced-motion capture proving it all disables.
- **Files** — `packages/core/src/infrastructure/compilers/kernel/runtime/brand-theme/**` + `packages/core/src/foundation/tokens/css/facade/artifacts/**` (regenerated), `packages/core/src/graphics/motion/**` (`usePresence`/`Presence`/`useFlipLayout` — to be created inside the existing module), `packages/core/src/foundation/tokens/css/runtime/engines/modern/theme.css` (spring var handoff), `packages/core/src/ui/primitives/overlay/Modal/**`, `packages/core/src/ui/primitives/feedback/Drawer/**`, `packages/core/src/ui/primitives/feedback/Toast/**`, `packages/core/src/ui/primitives/overlay/Dropdown/**` + `ContextMenu/**`, `packages/core/src/ui/primitives/navigation/Menu/**` + `Tabs/**`, `packages/core/src/ui/patterns/visualization/kanban-board/**`, `scripts/engine-token-audit.mjs` (extend), a `packages/showroom` demo/capture page.
- **Acceptance gate** — `pnpm --filter @rottay/design-system run build` + `pnpm test` green; `infrastructure/compilers/kernel/runtime/brand-theme` suite green with regenerated artifacts, including a test asserting the emitted `--ds-motion-spring` is a `linear()` curve derived from the theme's tension/friction; a presence unit test proves a closing Modal/Toast stays mounted until exit completes, then unmounts; `node scripts/engine-token-audit.mjs --check` green with the new compositor-only counter at zero over touched files; sighted before/after in `test-artifacts/craft/cra-06/` under both tenant palettes showing exit choreography (modal/drawer/toast), a FLIP reorder, the sliding tab indicator, and a reduced-motion capture with presence/layout motion off.
- **Do NOT** — Do not add an animation library (framer-motion or similar — CSS + Web Animations API only). Do not animate layout properties. Do not add looping/ambient motion. Do not fork `engine-token-audit.mjs`. Do not fix the Collapse max-height hack here (WO-CRA-07 owns it). Never `git restore` directories.
- **Size** — L.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, build the motion choreography system from proposal P-21 (`roadmap/proposals.md`, APPROVED 2026-07-07). Depends on WO-ENG-01 (motion canon + `scripts/engine-token-audit.mjs`) being done. (1) In `packages/core/src/infrastructure/compilers/kernel/runtime/brand-theme/`, generate CSS `linear()` spring curves from `BrandMotion.springTension`/`springFriction` (`packages/core/src/foundation/contracts/composition/tenants/themes/index.ts:139-140` — carried into personality at `infrastructure/compilers/kernel/runtime/brand-theme/index.ts:64-65` but driving nothing today) and emit `--ds-motion-spring` + `--ds-motion-spring-gentle` from the compiler (the hardcoded cubic-bezier at `packages/core/src/foundation/tokens/css/runtime/engines/modern/theme.css:111` becomes a fallback); regenerate `foundation/tokens/css/facade/artifacts/**` and keep the compiler suite green. (2) Add `usePresence` + a `Presence` wrapper in `packages/core/src/graphics/motion/` (node stays mounted until exit completes; drives `data-state="open"|"closed"`); wire `primitives/overlay/Modal`, `primitives/feedback/Drawer`, `primitives/feedback/Toast`, `primitives/overlay/Dropdown`+`ContextMenu`, `primitives/navigation/Menu`, and collection list-item exit. (3) Add `useFlipLayout` in `packages/core/src/graphics/motion/react/runtime/hooks/` (measure-invert-play, transform-only); wire list reorder (`patterns/data`), kanban card moves (`patterns/visualization/kanban-board`), and the Tabs indicator (`primitives/navigation/Tabs`). (4) Interruptibility law: retargetable transitions / WAAPI with `commitStyles`, never fixed keyframes on interactive elements; document in `packages/core/src/graphics/motion/foundation/contracts/`. (5) Extend `scripts/engine-token-audit.mjs` (never fork) with a compositor-only counter flagging transition/animation of top/left/width/height/margin/padding; zero over touched files (the Collapse max-height hack is WO-CRA-07's — count, do not fix). (6) `prefers-reduced-motion` disables presence/layout motion wholesale (ride `--ds-motion-reduce`). No animation library dependency. Gate: `pnpm --filter @rottay/design-system run build` + `pnpm test` green; compiler suite green with regenerated artifacts + a theme-derived `linear()` test; a presence unit test (closing Modal/Toast unmounts only after exit); `node scripts/engine-token-audit.mjs --check` green with the compositor counter at zero over touched files; sighted `test-artifacts/craft/cra-06/` under rottay (dark surface, `#0A0A0C`) AND a light-surface tenant (bithire or evnto) showing modal/drawer/toast exit choreography, a FLIP reorder, the sliding tab indicator, plus a reduced-motion capture with it all off. Run the showroom (`pnpm --filter @rottay/showroom run dev`, http://localhost:7001) and LOOK at the PNGs. Fences: edit-only, no commits, never git-restore directories, app-bithire and docs-engineering read-only, showroom dev server allowed.

### WO-CRA-07 Micro-interaction catalog
- **Outcome** — A consistent, tokenized micro-interaction catalog — every item riding the `--ds-motion-*` cadence and the `--ds-effect-intensity` dial, reduced-motion aware: a number ticker/count-up for metric tiles with tabular numerals so digits never jitter (pairs CRA-01); skeleton-to-content CROSSFADE (content never pops over a skeleton); toast stacking physics that pairs CRA-02's undo countdown ring; collapse/accordion height animation done right (the `grid-template-rows` technique, no `max-height` hacks); icon state morphs (hamburger-to-x, copy-to-check); a data-changed single-pulse discipline for live cells/rows (ONE subtle flash, tenant-intensity-tunable, never looping); and a success/confirm choreography (animated check) for completed confirm flows.
- **Why** — P-22 (proposals.md round 3, APPROVED 2026-07-07): micro-interactions are where users FEEL quality without knowing why; today every app hand-rolls or skips them. Verified — the pieces exist but are inconsistent or use the wrong technique: `packages/core/src/graphics/motion/react/presentation/primitives/count-up/` exists but applies NO tabular numerals (a grep for `tabular`/`font-variant` in it returns nothing — digits jitter as they tick); the Collapse primitive animates `max-height` with an arbitrary 1000px bound (`packages/core/src/ui/primitives/layout/Collapse/engines/rustic/index.tsx:75-85`) and the modern engine transitions `max-height` too (`engines/modern.tsx:28`) — exactly the hack P-22 names; Skeleton (compound Card/Table/ListItem/Paragraph/Button/Avatar) and Toast exist under `primitives/feedback/` but there is no skeleton-to-content crossfade and no stacking physics; `motion/primitives/morph/` exists as the generic base for icon state morphs. CRA-01 supplies the tabular utility, CRA-02 the undo countdown — this WO completes the catalog around them.
- **Depends on** — **WO-ENG-01** (motion canon) and **WO-ENG-04** (interaction-state tokens for pulse/success states). Coordination: the `--ds-effect-intensity` dial ships with WO-ENG-05 — until it lands, intensity-tunable items read `var(--ds-effect-intensity, 1)` so nothing blocks. Consumes CRA-01's tabular token and CRA-02's undo Toast where they have landed; otherwise ships the catalog items standalone and wires at integration (same swap-at-integration discipline as CRA-02/ENG-04).
- **Steps** —
  1. Number ticker: upgrade `packages/core/src/graphics/motion/react/presentation/primitives/count-up/` to apply tabular numerals via CRA-01's token/utility (never a new inline `font-variant-numeric` literal) and ease on `--ds-motion-*`; expose it as an opt-in for `patterns/data/stats-grid` metric values.
  2. Skeleton-to-content crossfade: a crossfade recipe on the Skeleton primitive (`packages/core/src/ui/primitives/feedback/Skeleton/`) — outgoing skeleton fades under incoming content (opacity-only, `--ds-motion-fast`), exposed as a prop/compound so `useSurfaceState`-driven surfaces adopt it.
  3. Toast stacking physics: stacked toasts compress/fan with transform-only offsets and re-settle on dismiss (`packages/core/src/ui/primitives/feedback/Toast/`); align with CRA-02's undo compound (the countdown ring is CRA-02's; the STACKING is this WO's).
  4. Collapse done right: replace the `max-height` transitions in `primitives/layout/Collapse/engines/modern.tsx` + `rustic.tsx` with the `grid-template-rows: 0fr -> 1fr` technique (inner wrapper `min-height: 0`), preserving the existing `--ds-collapse-*` var hooks; the classic (Ant) engine stays as-is.
  5. Icon state morphs: a small morph set built on `packages/core/src/graphics/motion/react/presentation/primitives/morph/` for hamburger-to-x and copy-to-check (success), consumable by Button/menu chrome; transform/opacity only.
  6. Data-changed pulse: a `.ds-pulse-changed` single-flash utility (one background/outline pulse; intensity via `--ds-effect-intensity`; duration on `--ds-motion-*`; NEVER looping) + a `usePulseOnChange` helper; opt-in wiring for `patterns/data/data-table` live cells and `patterns/communication/live-feed` rows.
  7. Success/confirm choreography: an animated-check moment (SVG stroke draw on `--ds-motion-*`) exposed as a compound consumable by Toast/ConfirmDialog for completed confirm flows.
  8. Sighted proof of every catalog item under both tenant palettes + one reduced-motion capture (all items static but fully legible).
- **Files** — `packages/core/src/graphics/motion/react/presentation/primitives/count-up/**`, `packages/core/src/graphics/motion/react/presentation/primitives/morph/**`, `packages/core/src/ui/primitives/feedback/Skeleton/**`, `packages/core/src/ui/primitives/feedback/Toast/**`, `packages/core/src/ui/primitives/layout/Collapse/engines/modern/index.tsx` + `rustic.tsx`, `packages/core/src/ui/patterns/data/stats-grid/**`, `packages/core/src/ui/patterns/data/data-table/**`, `packages/core/src/ui/patterns/communication/live-feed/**`, `packages/core/src/foundation/tokens/css/foundation/animations/transitions.css` (pulse/crossfade utilities), a `packages/showroom` demo/capture page.
- **Acceptance gate** — `pnpm --filter @rottay/design-system run build` + `pnpm test` green (unit tests: count-up renders tabular digits; the pulse fires ONCE per change and never loops); a grep over `Collapse/engines/modern.tsx` + `rustic.tsx` proves zero remaining `max-height`/`maxHeight` transitions; sighted before/after in `test-artifacts/craft/cra-07/` under both tenant palettes showing the jitter-free ticker, a skeleton crossfade (no pop), stacked toasts settling, a smooth grid-rows Collapse, an icon morph, a single data-changed pulse, and the animated check; a reduced-motion capture shows every item disabled/static.
- **Do NOT** — Do not loop any pulse or ambient animation. Do not keep or reintroduce `max-height` animation. Do not inline motion literals (durations/easings ride `--ds-motion-*`). Do not duplicate CRA-02's countdown ring or CRA-01's typography tokens — consume them. Do not touch the classic engine's Collapse. Never `git restore` directories.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, build the micro-interaction catalog from proposal P-22 (`roadmap/proposals.md`, APPROVED 2026-07-07). Depends on WO-ENG-01 + WO-ENG-04 being done; the `--ds-effect-intensity` dial ships with WO-ENG-05 — read it as `var(--ds-effect-intensity, 1)` until then. (1) Upgrade `packages/core/src/graphics/motion/react/presentation/primitives/count-up/` with tabular numerals via WO-CRA-01's token/utility (no inline `font-variant-numeric`), easing on `--ds-motion-*`; opt-in for `patterns/data/stats-grid`. (2) Add a skeleton-to-content crossfade to `packages/core/src/ui/primitives/feedback/Skeleton/` (opacity-only, `--ds-motion-fast`). (3) Add toast stacking physics to `primitives/feedback/Toast/` (transform-only compress/fan, re-settle on dismiss; CRA-02 owns the undo countdown ring). (4) Replace the `max-height` transitions in `primitives/layout/Collapse/engines/modern.tsx` (line 28) + `rustic.tsx` (lines 75-85, arbitrary 1000px bound) with `grid-template-rows: 0fr -> 1fr` (inner `min-height: 0`), preserving `--ds-collapse-*` hooks; classic stays as-is. (5) Build hamburger-to-x and copy-to-check icon morphs on `motion/primitives/morph/` (transform/opacity only). (6) Add a `.ds-pulse-changed` single-flash utility + `usePulseOnChange` helper (ONE pulse, `--ds-effect-intensity`-tunable, never looping) with opt-in wiring for `patterns/data/data-table` live cells and `patterns/communication/live-feed` rows. (7) Add an animated-check success choreography (SVG stroke draw on `--ds-motion-*`) consumable by Toast/ConfirmDialog. Gate: `pnpm --filter @rottay/design-system run build` + `pnpm test` green (count-up tabular test; pulse-fires-once test); grep proves zero `max-height`/`maxHeight` transitions left in the two Collapse engine files; sighted `test-artifacts/craft/cra-07/` under rottay (dark) + a light-surface tenant showing all seven items, plus a reduced-motion capture with everything static. Run the showroom (`pnpm --filter @rottay/showroom run dev`, http://localhost:7001) and LOOK at the PNGs. Fences: no looping animation, no inline motion literals, edit-only, no commits, never git-restore directories, app-bithire and docs-engineering read-only, showroom dev server allowed.

### WO-CRA-08 View Transitions + scroll-driven motion
- **Outcome** — Page/surface-level continuity via the View Transitions API and CSS scroll-driven reveals that replace JS observers — both riding the ratified motion law (120/200/320 cadence, stagger-once, `prefers-reduced-motion`) and degrading to no-ops where unsupported: a DS view-transition helper with named transition seams on the surfaces tier (list -> detail continuity first), and a CSS-first scroll-reveal path (`animation-timeline: view()`) behind `@supports`, keeping the existing IntersectionObserver implementation as the fallback.
- **Why** — P-09 (proposals.md round 1, APPROVED 2026-07-07): "the visible 2026-feel gap — smooth page-to-page continuity and effortless reveals — and it rides the WO-ENG-01 motion canon instead of fighting it." Verified: scroll reveals today are JS-driven — `packages/core/src/graphics/motion/react/presentation/primitives/scroll-reveal/index.tsx` and `packages/core/src/graphics/motion/react/runtime/hooks/runtime/use-in-view/index.ts` are built on IntersectionObserver, and nothing in `packages/core/src/graphics/motion/` touches the View Transitions API. The surfaces-tier targets exist: `packages/core/src/ui/surfaces/presentation/pages/data/list/index.tsx` and `.../data/detail/index.tsx`, with the shared shell at `packages/core/src/ui/surfaces/composition/layout/page-shell/`. The cadence to ride exists: the compiler emits `--ds-motion-instant: 120ms` / `--ds-motion-calm` / `--ds-motion-deliberate: 320ms` (`packages/core/src/infrastructure/compilers/kernel/runtime/brand-theme/index.ts:267-269`). The showroom (Next.js 16) is the proving ground for the navigation demo.
- **Depends on** — **WO-ENG-01** (the cadence/tokens this rides). Pairs WO-CRA-06 (P-21 owns component-level choreography; this WO owns page-level continuity and scroll reveals); coordinate only on shared edits to `foundation/animations/transitions.css`.
- **Steps** —
  1. View-transition helper: a `useViewTransition` / `startDsViewTransition` helper under `packages/core/src/graphics/motion/` wrapping `document.startViewTransition` with progressive enhancement (no support -> immediate DOM update, zero errors) and a reduced-motion short-circuit.
  2. Named transition seams on surfaces: `view-transition-name` seams on the page-shell and list/detail surfaces (`surfaces/layout/page-shell/`, `surfaces/pages/data/list/`, `surfaces/pages/data/detail/`) so shared elements (title, primary card) morph across navigation; default `::view-transition-*` enter/exit rules on the 120/200/320 cadence in `packages/core/src/foundation/tokens/css/foundation/animations/transitions.css`.
  3. CSS scroll-driven reveals: extend `motion/primitives/scroll-reveal/` with a CSS-first path (`animation-timeline: view()` behind `@supports (animation-timeline: view())`) that skips the IntersectionObserver work where supported and keeps the IO fallback otherwise; preserve stagger-once (a reveal fires once — no re-trigger on scroll-up).
  4. Reduced motion: both features disable wholesale under `prefers-reduced-motion` (instant navigation; content visible without reveal).
  5. Showroom adoption + sighted proof: wire a showroom list -> detail navigation demo through the helper and a long scroll page with reveals; capture under both tenant palettes + a reduced-motion capture.
- **Files** — `packages/core/src/graphics/motion/**` (view-transition helper; scroll-reveal CSS path), `packages/core/src/foundation/tokens/css/foundation/animations/transitions.css` (`::view-transition-*` rules + scroll-driven keyframes), `packages/core/src/ui/surfaces/composition/layout/page-shell/**`, `packages/core/src/ui/surfaces/presentation/pages/data/list/**`, `packages/core/src/ui/surfaces/presentation/pages/data/detail/**`, `packages/showroom` demo routes/capture page.
- **Acceptance gate** — `pnpm --filter @rottay/design-system run build` + `pnpm test` green, including a unit test that the helper falls back to an immediate update when `startViewTransition` is absent (the test DOM has none, so CI exercises exactly the fallback path); a grep proves the new CSS path is guarded by `@supports (animation-timeline: view())` and the IntersectionObserver fallback remains; sighted before/after in `test-artifacts/craft/cra-08/` under both tenant palettes showing a list -> detail transition with element continuity and scroll reveals firing once; a reduced-motion capture shows instant navigation and no reveals.
- **Do NOT** — Do not make View Transitions load-bearing (unsupported browsers must navigate identically, just without the morph). Do not delete the IntersectionObserver fallback. Do not re-trigger reveals on scroll (stagger-once law). Do not add router/framework coupling to `packages/core` (the helper wraps the DOM API only; the showroom wires Next.js). Never `git restore` directories.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, build View Transitions + scroll-driven motion from proposal P-09 (`roadmap/proposals.md`, APPROVED 2026-07-07). Depends on WO-ENG-01 (motion canon) being done. (1) Add a `useViewTransition`/`startDsViewTransition` helper in `packages/core/src/graphics/motion/` wrapping `document.startViewTransition` with progressive enhancement (absent API -> immediate update, zero errors) and a reduced-motion short-circuit. (2) Add `view-transition-name` seams to `surfaces/layout/page-shell/`, `surfaces/pages/data/list/`, and `surfaces/pages/data/detail/` so shared elements morph across navigation, with default `::view-transition-*` rules on the 120/200/320 cadence in `packages/core/src/foundation/tokens/css/foundation/animations/transitions.css`. (3) Extend `motion/primitives/scroll-reveal/` (today IntersectionObserver-based, with `hooks/use-in-view/`) with a CSS-first path behind `@supports (animation-timeline: view())`, keeping the IO fallback and the stagger-once law (reveals fire once, never re-trigger). (4) Both features disable wholesale under `prefers-reduced-motion`. (5) Wire a showroom list -> detail navigation demo + a long scroll-reveal page. No router/framework coupling in `packages/core`. Gate: `pnpm --filter @rottay/design-system run build` + `pnpm test` green with a fallback unit test (no `startViewTransition` in the test DOM -> immediate update); grep proves the `@supports` guard + surviving IO fallback; sighted `test-artifacts/craft/cra-08/` under rottay (dark) + a light-surface tenant showing list -> detail continuity and once-only scroll reveals, plus a reduced-motion capture (instant navigation, no reveals). Run the showroom (`pnpm --filter @rottay/showroom run dev`, http://localhost:7001) and LOOK at the PNGs. Fences: edit-only, no commits, never git-restore directories, app-bithire and docs-engineering read-only, showroom dev server allowed.

### WO-CRA-09 AI-surface kit
- **Outcome** — The DS AI-surface kit, domain-agnostic per the promote-to-DS test, elevated from the EXISTING assistant pattern (never a parallel new one): a streaming-text primitive whose shimmer runs ONLY while tokens are live (never after completion, per the ratified law), tool-call/receipt cards, preview-diff + confirm cards matching the preview-confirm mutation-rail ceremony, and agent status indicators — one kit that bithire/evnto/platform consume instead of hand-rolling. No new `AgentChatSurface`: `ChatSurface` already exists and stays the surface-tier entry (monorepo non-negotiable).
- **Why** — P-12 (proposals.md round 1, APPROVED 2026-07-07): the AI door is a product pillar in all three verticals; today each app hand-rolls these (bithire ships an app-level AI trust kit; evnto/platform are about to need the same — one kit, three consumers, honest reuse). Verified: the DS base ALREADY exists and must be elevated, not duplicated — `packages/core/src/ui/patterns/communication/assistant/index.tsx` exports `AssistantStatusBadge`, `StreamingText`, `TypingIndicator`, `ToolCallCard`, and `MessageBubble`, over an `AssistantMessagePart` union in `assistant/types.ts` (text / tool-status / artifact / attachments parts, `AssistantToolStatus = 'queued' | 'running' | 'complete' | 'error'`); the surface-tier host is `ChatSurface` at `packages/core/src/ui/surfaces/presentation/pages/experience/chat/index.tsx`. What is MISSING: the shimmer-only-while-live law hardened on `StreamingText`, a terminal receipt posture for completed tool calls, preview-diff + confirm cards, and a full agent status set.
- **Depends on** — **WO-ENG-02** (the real galleries + tenant-palette axis are the sighted-evidence surface). Pairs CRA-02 (pending/undo ceremony) and CRA-06 (presence for streaming mount/unmount) as consumers of their primitives where landed — not dependencies.
- **Steps** —
  1. Streaming-text law: harden `StreamingText` in `packages/core/src/ui/patterns/communication/assistant/` so shimmer/caret run ONLY while streaming is live and stop dead on completion (no post-completion ambient motion); reduced motion swaps shimmer for a static caret.
  2. Tool-call/receipt cards: extend `ToolCallCard` with a terminal receipt posture (complete/error summary line, duration, status tones resolved from `--ds-color-*` semantic tokens via `AssistantToolStatus`) so a finished call reads as a compact receipt.
  3. Preview-diff + confirm cards: new compounds in the assistant pattern — `PreviewDiffCard` (before/after field rows, added/removed emphasis on semantic tokens) and `ConfirmActionCard` (proposed action summary + confirm/cancel slots) matching the preview-confirm mutation-rail ceremony. Domain-agnostic: field labels/values/actions arrive as props; the DS knows no entities.
  4. Agent status indicators: extend `AssistantStatusBadge`/`TypingIndicator` into a status set (idle / thinking / streaming / acting / error) with tokened dots; live-only animation (indicators animate only while their state is live; static under reduced motion).
  5. Export the kit through the pattern index and document the composition seam with `ChatSurface` (`surfaces/pages/experience/chat/`) — the surface consumes the parts; no new surface is created.
  6. Sighted proof: a showroom demo streaming a response (shimmer live, stops on completion), a tool call running -> receipt, a preview-diff + confirm flow, and the status set, under both tenant palettes + one reduced-motion capture.
- **Files** — `packages/core/src/ui/patterns/communication/assistant/**` (hardened `StreamingText`/`ToolCallCard`, new `PreviewDiffCard`/`ConfirmActionCard` compounds, extended types + tests), `packages/core/src/ui/surfaces/presentation/pages/experience/chat/**` (composition seam only, if wiring is needed), a `packages/showroom` demo/capture page.
- **Acceptance gate** — `pnpm --filter @rottay/design-system run build` + `pnpm test` green, extending `assistant/tests/`: shimmer present while streaming and ABSENT after completion; the confirm card fires its confirm/cancel callbacks; the diff card renders added/removed rows from props alone; sighted before/after in `test-artifacts/craft/cra-09/` under both tenant palettes showing all four kit pieces + a reduced-motion capture. NOTIFICATION STEP (cross-repo): on completion, record in the done evidence AND `registry.json` notes for WO-CRA-09 that the kit is available, naming the exported components — the orchestrator relays this note to the app-evnto orchestrator (it informs evnto WO-EXP-03+) and the app-platform orchestrator (its AI capability decision); the app repos are READ-ONLY here and adopt only via the normal release train.
- **Do NOT** — Do not create a new `AgentChatSurface` (`ChatSurface` exists — monorepo non-negotiable). Do not add product/domain semantics (no candidate/event/tenant knowledge; parts take generic props). Do not let shimmer or status animation run after the live state ends. Do not write into app repos. Never `git restore` directories.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, build the AI-surface kit from proposal P-12 (`roadmap/proposals.md`, APPROVED 2026-07-07) by ELEVATING the existing assistant pattern (`packages/core/src/ui/patterns/communication/assistant/` — it already exports `AssistantStatusBadge`, `StreamingText`, `TypingIndicator`, `ToolCallCard`, `MessageBubble` over the `AssistantMessagePart` union in `types.ts`); the surface host is `ChatSurface` (`packages/core/src/ui/surfaces/presentation/pages/experience/chat/index.tsx`) — do NOT create a new AgentChatSurface (monorepo non-negotiable). Depends on WO-ENG-02 (galleries) being done. (1) Harden `StreamingText`: shimmer/caret ONLY while streaming, stopping dead on completion; static caret under reduced motion. (2) Extend `ToolCallCard` with a terminal receipt posture (complete/error summary, duration, tones from `--ds-color-*` semantic tokens via `AssistantToolStatus`). (3) Add `PreviewDiffCard` (before/after field rows, added/removed semantic emphasis) and `ConfirmActionCard` (action summary + confirm/cancel slots) matching the preview-confirm mutation-rail ceremony — fully domain-agnostic, props only. (4) Extend the status set to idle/thinking/streaming/acting/error with live-only animation. (5) Export through the pattern index and document the `ChatSurface` composition seam. Gate: `pnpm --filter @rottay/design-system run build` + `pnpm test` green with extended `assistant/tests/` (shimmer live-only; confirm callbacks; diff rows from props); sighted `test-artifacts/craft/cra-09/` under rottay (dark) + a light-surface tenant showing streaming, receipt, diff+confirm, and statuses, plus a reduced-motion capture. Then record the NOTIFICATION note in the done evidence + `registry.json` notes for WO-CRA-09 (kit available, exported component names) for the orchestrator to relay to the app-evnto (WO-EXP-03+) and app-platform orchestrators — app repos are READ-ONLY and adopt via the release train. Run the showroom (`pnpm --filter @rottay/showroom run dev`, http://localhost:7001) and LOOK at the PNGs. Fences: no new surface, no domain semantics, no post-completion shimmer, edit-only, no commits, never git-restore directories, app-bithire and docs-engineering read-only, showroom dev server allowed.

### WO-CRA-10 Promotion pass: proven app kits into the DS
- **Outcome** — A systematic promote-to-DS review of the app kits that already paid their design cost in production, with every candidate receiving a WRITTEN verdict: PROMOTE (rebuilt in the DS as a domain-agnostic structure/pattern with config seams) or APP-OWNED FOREVER (the domain coupling that fails the ownership test is named). Candidates: the bithire detail-shell family, the signal-card family, the create door (bithire's create chooser/flow chrome), and the evnto collection-table kit overlaps. Promotion = REBUILDING the capability in the DS from the pattern — never moving files (all app repos are READ-ONLY).
- **Why** — P-15 (proposals.md round 1, APPROVED 2026-07-07): bithire already paid the design cost of these kits; evnto/platform are about to rebuild them in their anatomy lanes — promoting FIRST means the two adoptions consume instead of fork (also flagged in the bithire roadmap follow-ups' DS craft pass). Verified candidates (read-only): `app-bithire/src/ui/details/` (ai-provenance-affordance, changed-banner, command-model, dictation-enhancer, field-coverage-panel, inline-editor, overview-grid, presence, return-to), the signal-card family (canonical `app-bithire/src/ui/signals/signal-card/`, plus siblings `src/ui/cards/metric-signal-card/` and `src/ui/tables/listing/signal-card/`), the create door (`app-bithire/src/ui/forms/create/`: add-item-modal, flow-modal, mode-toggle, page-shell; plus `src/ui/forms/ai/create-flow-header/` and `create-page-shell/`), and `app-evnto/src/ui/tables/` (bulk-actions, column-settings, data-table, expanded-panel-layout, list-toolbar, saved-views, stats-header) overlapping the DS `patterns/data/data-table` + workspace structures. The gate question for each: "could another app use this without knowing what a tenant, candidate, role, company, interview, or event is?"
- **Depends on** — none. SEQUENCING (cross-repo leverage): highest value BEFORE the evnto/platform detail/listing anatomy WOs execute — the notification step below makes that real. Coordination: promoted detail/signal chrome lands in the `structures/` record/dashboard groups and `patterns/`; where a promoted piece overlaps WO-CRA-04's flagship work (the Popover-composed create chooser, the data-table) coordinate windows before claiming.
- **Steps** —
  1. Inventory + verdict table: for each candidate family (detail-shell, signal-card, create door, evnto table kit), record the promote-to-DS verdict with one-line evidence in the done notes: PROMOTE (naming the target DS tier + component) or APP-OWNED FOREVER (naming the domain coupling). No candidate is left undecided.
  2. Rebuild the PROMOTE set in the DS as domain-agnostic components with config seams (labels/fields/actions as props/slots): detail-shell chrome into `packages/core/src/ui/structures/record/`, signal/metric-card chrome into `packages/core/src/ui/structures/dashboard/` (a slot-based signal tile), create-door chrome (chooser modal + mode toggle + flow shell) into `patterns/`/`structures/` per the decision matrix, and the evnto table-kit deltas (expanded-panel layout, saved views, stats header behaviors missing from the DS) as EXTENSIONS of the existing `patterns/data/data-table` + workspace structures — never parallel kits (anti-duplication law).
  3. Ship each rebuilt component with tests + a showroom page (the sighted surface); a grep over the new DS sources proves zero domain vocabulary (tenant/candidate/role/company/interview/event/recruiter).
  4. Record the APP-OWNED verdict list alongside the promoted list in the done evidence + `registry.json` notes (`docs-engineering` is read-only in this lane; the catalog-docs sync rides the normal release train).
  5. Sighted proof for every promoted component under both tenant palettes.
  6. NOTIFICATION STEP (cross-repo): on completion, the orchestrator relays the promoted-component list + APP-OWNED verdicts to BOTH the app-evnto and app-platform orchestrators BEFORE their detail/listing anatomy WOs execute, so those lanes consume the promoted kits instead of forking. `app-bithire`, `app-evnto`, and `app-platform` are READ-ONLY throughout: promotion is a rebuild in the DS from the observed pattern, never a file move; apps adopt via the release train.
- **Files** — read-only evidence: `app-bithire/src/ui/details/**`, `app-bithire/src/ui/signals/signal-card/**`, `app-bithire/src/ui/forms/create/**`, `app-evnto/src/ui/tables/**`; writes: `packages/core/src/ui/structures/record/**`, `packages/core/src/ui/structures/dashboard/**`, `packages/core/src/ui/patterns/data/data-table/**` (deltas), new structure/pattern folders for the promoted set (to be created per the step-1 verdicts), `packages/showroom` pages for each promoted component.
- **Acceptance gate** — `pnpm --filter @rottay/design-system run build` + `pnpm test` green; every candidate family has a written PROMOTE / APP-OWNED verdict recorded in the done evidence (no unreviewed candidate); a grep over the new DS sources proves zero domain vocabulary; sighted before/after in `test-artifacts/craft/cra-10/` under both tenant palettes for each promoted component; the cross-repo notification note (promoted list + verdicts, addressed to the evnto and platform orchestrators) is recorded in `registry.json` notes for WO-CRA-10.
- **Do NOT** — Do not move or copy files from app repos (rebuild from the pattern). Do not write into `app-bithire`/`app-evnto`/`app-platform`. Do not promote anything that fails the ownership test. Do not build parallel table/detail kits when extending the existing DS component suffices. Never `git restore` directories.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, run the promotion pass from proposal P-15 (`roadmap/proposals.md`, APPROVED 2026-07-07). No dependencies; highest leverage BEFORE the evnto/platform detail/listing anatomy WOs execute. Candidates (READ-ONLY evidence — never write into app repos): `app-bithire/src/ui/details/` (ai-provenance-affordance, changed-banner, field-coverage-panel, inline-editor, overview-grid, presence, return-to, command-model, dictation-enhancer), the signal-card family (`app-bithire/src/ui/signals/signal-card/` + `src/ui/cards/metric-signal-card/` + `src/ui/tables/listing/signal-card/`), the create door (`app-bithire/src/ui/forms/create/`: add-item-modal, flow-modal, mode-toggle, page-shell; plus `src/ui/forms/ai/create-flow-header/`, `create-page-shell/`), and `app-evnto/src/ui/tables/` (bulk-actions, column-settings, data-table, expanded-panel-layout, list-toolbar, saved-views, stats-header). (1) Give EVERY candidate a written verdict — PROMOTE (target DS tier + component named) or APP-OWNED FOREVER (domain coupling named) — using the ownership test: usable without knowing what a tenant/candidate/role/company/interview/event is. (2) REBUILD the PROMOTE set in the DS with config seams: detail-shell chrome into `packages/core/src/ui/structures/record/`, signal/metric tile into `structures/dashboard/`, create-door chrome into `patterns/`/`structures/` per the decision matrix, evnto table-kit deltas as extensions of `patterns/data/data-table` + workspace structures (never parallel kits); coordinate windows with WO-CRA-04 on Popover/data-table overlap. (3) Tests + a showroom page per promoted component; grep the new DS sources for zero domain vocabulary. (4) Record the promoted list + APP-OWNED verdicts in the done evidence AND `registry.json` notes for WO-CRA-10 as the NOTIFICATION note the orchestrator relays to the app-evnto and app-platform orchestrators before their anatomy WOs run (promotion = rebuild from the pattern, never file moves; apps adopt via the release train). Gate: `pnpm --filter @rottay/design-system run build` + `pnpm test` green; all verdicts written; domain-vocabulary grep clean; sighted `test-artifacts/craft/cra-10/` under rottay (dark) + a light-surface tenant for each promoted component; notification note recorded. Run the showroom (`pnpm --filter @rottay/showroom run dev`, http://localhost:7001) and LOOK at the PNGs. Fences: edit-only, no commits, never git-restore directories, app-bithire/app-evnto/app-platform and docs-engineering read-only, showroom dev server allowed.

## Dependency summary

```
WO-CRA-01 (micro-typography)        — no deps; pairs WO-ENG-07 (typographic-literal hygiene)
WO-CRA-02 (async-state law)         — no deps; consumes WO-ENG-04 state tokens when they land
WO-CRA-03 (keyboard model)          — no deps; future synergy with WO-ARC-02 (headless core; not a dep)
WO-CRA-04 (data-viz + primitives)  ── needs WO-ENG-01 + WO-ENG-02
WO-CRA-05 (Tenant Brand Studio)    ── needs WO-ENG-02   (OKLCH preview deepens once WO-TOK-02 lands)
WO-CRA-06 (motion choreography)    ── needs WO-ENG-01; pairs CRA-08 (page vs component scope)
WO-CRA-07 (micro-interactions)     ── needs WO-ENG-01 + WO-ENG-04 (ENG-05 dial read via fallback)
WO-CRA-08 (view transitions)       ── needs WO-ENG-01; pairs CRA-06
WO-CRA-09 (AI-surface kit)         ── needs WO-ENG-02; notify evnto/platform orchestrators on done
WO-CRA-10 (promotion pass)          — no deps; run BEFORE evnto/platform detail/listing anatomy WOs;
                                      notify both app orchestrators on done
```

Start order: **CRA-01 anytime** — the cheapest, highest-signal item, no dependencies. **CRA-02 and
CRA-03 anytime**, honoring the engine-lane coordination notes (CRA-02's Button pending posture and
CRA-04's Badge/color work are the only real overlaps with the engine lane). **CRA-10 anytime, and
EARLY** — it has no dependencies and its leverage is highest before the evnto/platform anatomy lanes
run. **CRA-04 after WO-ENG-01 + WO-ENG-02**; **CRA-05 and CRA-09 after WO-ENG-02**; **CRA-06 and
CRA-08 after WO-ENG-01** (they pair: CRA-08 owns page-level continuity, CRA-06 owns component-level
choreography — coordinate shared `transitions.css` edits); **CRA-07 after WO-ENG-01 + WO-ENG-04**.
Every visual WO's acceptance gate additionally REQUIRES the sighted before/after captures under both
tenant palettes (a dark-surface and a light-surface tenant); the owner approves signature moments.

## DS improvements — Wave 0

### WO-CRA-11 Adaptive contract truth
- **Source IDs / phase** — DS-IMP-073; Phase 0.
- **Depends on** — WO-GAT-05, WO-GAT-06, WO-GAT-07, WO-ARC-11 and WO-ENG-23.
- **Outcome** — No adaptive/mobile field exists only in a type, builder or test. Every retained value has a production renderer and behavior fixture; dead config is wired or deleted. Evnto gets an immediate phone navigation door before full topology work.
- **Steps** — Build a field-to-renderer inventory across DS and apps; remove false options or wire them end to end; add 360px keyboard/safe-area/overflow fixtures; restore the minimal Evnto phone navigation path.
- **Acceptance gate** — Zero type-only adaptive fields; zero dead `create*Config` exports; every retained field changes production output in a fixture; required phone routes expose navigation and primary action without undeclared horizontal overflow.
- **Execution control** — Roll back one adaptive field/route at a time and retain the desktop path. Telemetry: field-consumer coverage, dead factories and phone navigation availability. Stop on hidden primary action, unreachable navigation or fake configuration.
- **Do NOT** — Do not shrink desktop tables as the only mobile strategy or claim Phase-2B task projection here.

### WO-CRA-12 Motion authority and unit floor
- **Source IDs / phase** — DS-IMP-083, 084 and 085; Phase 0.
- **Depends on** — WO-GAT-05, WO-GAT-06 and WO-ARC-10. Coordinate the `use-chart-personality` ownership window with WO-CRA-13.
- **Outcome** — Public motion values use explicit milliseconds; one SSR-safe MotionProvider is the runtime authority; CSS reduced-motion is the aligned pre-hydration/no-JS fail-safe; global motion is namespaced before new recipes land.
- **Steps** — Normalize ambiguous callers against 80/120/200/320/500/900ms boundary tests; consolidate reduced-motion and preference resolution; namespace bare keyframes; gate `transition: all`, raw route timing and direct product-route choreography.
- **Acceptance gate** — Boundary tests pass; SSR first paint and hydration agree; reduced-motion fixtures reach final values immediately, including CountUp; fleet scans report zero unapproved global keyframes, `transition: all`, raw product timing and direct library choreography.
- **Execution control** — Preserve compatibility mapping for one minor; disable a recipe to static final output. Telemetry: ambiguous units, authority count and forbidden paths. Stop on hydration motion, reduced-motion animation or multiple authorities.
- **Do NOT** — Do not mandate a particular hook/spring implementation or add new expressive motion before this floor is green.

### WO-CRA-13 Chart correctness floor
- **Source IDs / phase** — DS-IMP-095, 096 and 097; Phase 0.
- **Depends on** — WO-GAT-05, WO-GAT-06 and WO-ARC-10.
- **Outcome** — Existing charts resolve colors from their owning provider root, handle negative/zero/constant/invalid/cyclic/empty transitions deterministically, keep accessible React DOM intact, and expose only public props with real consumers/fixtures.
- **Steps** — Add two-root SSR/hydration/export color fixtures; repair domain/scale/definition identity and empty transitions; reject cyclic quantitative Sankey input with a typed visible fallback; move accessible title/description ownership outside imperative D3 redraw; inventory public props.
- **Acceptance gate** — Two simultaneous roots render distinct monotonic heatmap steps; all edge fixtures pass or return typed errors; D3 cannot delete accessible name/description; compact mode is explicit; every public prop has production consumption/fixture or is removed.
- **Execution control** — Keep legacy chart exports/rendering while correcting semantics; disable a broken family to its deterministic static/error fallback. Telemetry: color resolution, edge-case results, accessible DOM and prop coverage. Stop on silent data-semantic change or inaccessible output.
- **Do NOT** — Do not start ChartKernel/renderer migration or use Three to mask correctness defects.

#### Owner continuation — VIZ-01 bounded projection pilot (2026-07-16)

WO-CRA-13 is complete, so the owner authorized the first additive visualization slice without
claiming the Phase 2C source items complete. VIZ-01 introduces a focused
`@rottay/design-system/charts` boundary containing a JSON-serializable `ChartProjectionSpec`, a
deterministic phone/tablet/desktop resolver, and an accessible `ChartFrame`. The application keeps
semantic ownership: it names renderer, metric, summary and omission IDs; the DS only chooses the
declared responsive posture and renders common title, question, insight, toolbar, legend, source,
freshness and state anatomy. A phone projection cannot be `full`.

The first real consumer is BitHire's activity heatmap: desktop/tablet retain the calendar while
phone renders a meaningful summary of event count, active days, peak and covered period, with no
wide hidden SVG. The same spec and component contract must serve BitHire and The Management;
provider/DB tokens may change paint and personality, but neither the DS nor the app may branch on a
tenant slug or hostname. Acceptance requires focused resolver/frame tests, isolated packed ESM/CJS
and TypeScript-consumer proof for the new subpath, a 360/768/1280 canary contract, and reduced-motion,
keyboard/touch and forced-colors coverage. This pilot is evidence toward DS-IMP-099/100 only; it does
not transition DS-IMP-098/099/100 or certify the production white-label canary. The next checkpoint
is React-owned Bar, Line and HeatMap renderers on this frame, followed by vertical `ChartGrammar` and
`InsightLayer`.

#### Owner continuation — VIZ-02 React-owned renderer pilot (2026-07-16)

VIZ-02 adds the focused `@rottay/design-system/charts/renderers` boundary with React-owned
`SvgBarRenderer`, `SvgLineRenderer` and `SvgHeatMapRenderer`. D3 is restricted to immutable geometry,
UTC time scales, paths and interpolation; it cannot select, append, remove, mutate or transition DOM.
The renderers preserve stable semantic IDs, reject duplicate coordinates, handle negative/invalid/
constant domains deterministically, resolve HeatMap colors from the owning provider root and reflow
geometry from one container `ResizeObserver` instead of shrinking SVG typography. A fixed opt-out
retains intrinsic dimensions and constructs no observer.

This pilot intentionally uses one static `role="img"` model without per-mark tab stops. Roving
keyboard/touch exploration, a summary/table/download alternative, vertical `ChartGrammar` and the
`InsightLayer` remain under DS-IMP-100/101 and are not claimed complete here. The legacy chart family
continues to coexist for at least one minor.

Release acceptance is fail-closed: public types plus packed ESM/CJS must resolve from an installed
tarball; `/charts` remains supplier-free while `/charts/renderers` declares only D3; named Bar, Line
and HeatMap builds must retain neither sibling renderers nor sibling geometry builders and must keep
React/D3 external; measured bundle and public-CSS budgets, engine paint ratchets, provider-root,
SSR/hydration, responsive/fixed, reduced-motion and forced-colors contracts must remain green. The
first application canary is BitHire Teams Performance (placements by sprint + revenue trend) with a
declared phone summary projection; it must not branch on tenant slug or hostname.

#### Owner continuation — VIZ-03 semantic grammar and interaction pilot (2026-07-16)

VIZ-03 continues the additive visualization kernel and now has a locally implemented, focused-test
baseline; this evidence does **not** declare DS-IMP-099/100/101 or the visualization program complete.
The server-safe, JSON-only `@rottay/design-system/charts/spec` boundary contains the closed first-party
`neutral | bithire | platform | evnto` ChartGrammar registry and typed insight contracts without React,
browser, D3, tenant-runtime or renderer imports. Grammar owns visual posture and separation of the
categorical, sequential, diverging and status channels; the application continues to own the question,
data, units, aggregation, thresholds, annotations and phone priority. The registry is immutable and
JSON-round-trippable; unknown/hostile grammar input resolves to neutral, while non-finite values,
inverted bands, excess keys and generated summaries without provenance fail closed in focused tests.

Runtime personality is also implemented without identity branching. The shared resolver applies
`DEFAULT -> vertical -> (BrandTheme.charts | ProductProfile.chart) -> tenant DB chart`, where the
BrandTheme path excludes legacy ProductProfile leakage and the final tenant layer remains the bounded
DB-owned override. Provider-root fixtures exercise BitHire and The Management with the same component
tree and data but distinct chart finish; neither the resolver, grammar nor renderer reads a tenant slug
or hostname. Bar and Line consume the grammar/personality defaults, and D3 remains geometry-only.

The palette baseline now resolves five bounded schemes through ten provider-scoped category channels,
keeps status colors out of arbitrary categorical series, and lets tenant-owned
`--ds-chart-category-*` channels retain final precedence. The light/dark contrast matrix is executable:
all audited scheme entries clear 3:1 against their chart surfaces, with a measured minimum of 4.00:1;
raw black/yellow is not the accessible default.

Accessible interaction is implemented for the React-owned Bar, Line and HeatMap pilots through one
`static | explore | select | drill` state contract. Hover, visible/roving focus, keyboard, mouse,
touch/pen pinning, Enter/Space, Escape/reset, outside dismissal and controlled/uncontrolled state
converge on opaque datum keys. Scroll gestures do not create phantom touch selections, synthesized AT
clicks remain operable, dense overlapping marks use nearest visual geometry, RTL navigation uses the
visual grid, and static mode does not acquire interactive hover/motion. Focus targets, reduced-motion,
high-contrast and forced-colors fallbacks have focused DOM/CSS coverage; real-browser certification is
still an exit gate below.

The initial non-interactive `InsightLayer` is implemented for app-declared target, band, direct-label
and event facts using React-owned SVG plus pure geometry. Invalid/out-of-range facts fail closed,
direct labels require an unambiguous datum, and `ChartInsightSummary` renders only app-owned copy while
stamping mode, source IDs and method provenance. The focused `@rottay/design-system/charts/access`
companion adds at most five summary facts plus an on-demand table capped at 50 rows per page; the table
is absent from the DOM while closed, labels remain app-owned/localizable, and close/Escape returns
focus. Full-data CSV export uses CRLF/RFC-style quoting, neutralizes spreadsheet formulas after leading
whitespace, sanitizes the filename and exposes an injectable downloader.

Focused grammar, hostile-input, personality SSR/provider-root, palette-contrast, interaction,
renderer, insight, data-access/CSV and public supplier-contract tests are green locally, as is the
package TypeScript gate. Release acceptance remains fail-closed and open: brush/zoom, the complete
analytical-purpose/insight catalog and production drill workflows are not implemented; real-browser
assistive-technology and forced-colors canaries (including 200% zoom and 360/768/1280 postures) are not
yet certified. Installed-tarball ESM/CJS/TypeScript proof and final isolated/transitive bundle budgets
must also pass before release/adoption is claimed. The BitHire Teams Performance canary may remove its
visual hardcodes only after those gates; no hostname-specific CSS or tenant-specific component branch
is permitted.

#### Owner continuation — MOT-01 semantic motion and runtime policy (2026-07-16)

MOT-01 opens the first bounded Phase-2B motion slice without reimplementing the completed unit,
Presence, FLIP, View Transition or reduced-motion floors. It introduces the focused
`@rottay/design-system/motion` boundary, reuses the canonical `precise | calm | expressive`
`MotionProfile`, and restricts tenant configuration to a DB-safe `{ intensity, durationScale,
ambient: off | subtle }` dial. The vertical owns curve, cadence and displacement envelopes; a
tenant can scale those values but cannot author springs, bounce, keyframes or loop topology.

One runtime policy combines OS reduced motion, pointer posture, save-data/2g, document visibility
and the tenant dial. Active product state is distinct from ambient decoration: a tenant may disable
ambient atmosphere without suppressing finite feedback or a genuinely running AI/tool state.
Coarse, reduced, constrained and hidden environments receive stable final output; continuous work
has a one-slot ceiling, finite emphasis is capped at 500ms, and public recipes name only transform
and opacity. `DesignSystemProvider` derives the profile from the vertical and the dial from
`appearance.general.motion`; neither the DS nor an app may branch on tenant slug or hostname.

Release acceptance requires hostile-input bounds, the complete policy matrix, SSR/hydration and
live preference changes, one browser source set with cleanup, real duration/stagger consumption,
vertical/tenant invariance, supplier-contract parity, isolated packed ESM/CJS/types and measured
bundle budgets. The first application canary is BitHire's shared ambient backdrop: at most one
offscreen-aware desktop loop when ambient policy allows it and zero loops on coarse, reduced,
constrained, hidden or offscreen states. This is evidence toward DS-IMP-086/088/089 only; those
source items remain open until the full Motion.List/AI-state and fleet adoption gates complete.

#### Owner continuation — EFX-01A effect registry (2026-07-16)

EFX-01A opens the source-only governance kernel for expressive effects without promoting any
runtime or claiming DS-IMP-106/110 complete. Registry version 1 is a closed catalog of exactly
eleven canonical capabilities: Aurora, GlassCard, GlowEffect, GradientBackground, GridPattern,
Magnetic, NoiseTexture, Parallax, ParticleField, ShimmerText and Spotlight. `Particles` remains a
compatibility component name, never a second registry ID. Tenant input cannot add definitions,
change admission or open a lab kill switch.

Every definition separates its target `product | expressive | lab` tier from observed runtime
facts and carries purpose, renderer/loop/lazy posture, canonical verticals, built-in engines,
static/touch/reduced fallbacks, ARIA strategy, lifecycle posture, provenance and a byte-exact
budget state. Admission is fail-closed: the ten lightweight capabilities remain `candidate` and
ParticleField remains `quarantined`; none is `certified`. The inventory deliberately records that
Aurora, GlowEffect, GradientBackground, GridPattern and ShimmerText are currently non-lazy and do
not suspend offscreen/hidden work. Certification, not aspiration, is what enforces product
non-perpetual loops, expressive/lab lazy loading, measured gzip/layer/loop budgets, verified
authorized source and continuous-loop suspension. Lab additionally requires owner, telemetry and
an exact registry-owned kill switch.

Research provenance pins React Bits, Motion Primitives, Magic UI and Cult UI revisions, license
identifiers and license hashes as `reference-only`; React Bits stays restricted research and none
of those records claims copied source. The audit cross-checks those public records against the
byte-verified ledger and refuses any certified definition until an authorized-source ledger exists.
The pure resolver exposes only canonical-ID lookup publicly, returns static output for
candidate/quarantined/ambiguous policy and cannot accept a caller-forged certified definition.

The packaging continuation authorizes the governance-only `./effects` subpath with nine frozen
runtime values plus its public types. The cohesive 2.19.17 producer build measured the raw ESM/CJS
entries at 652/676 bytes and the all-export consumer fixture at 4,829 bytes gzip; ratchets are
800 bytes raw per entry and 5,500 bytes gzip. Release gates reject React, suppliers, dynamic imports,
assets, any visual/client module, an impure CJS closure or an impure declaration graph, and the
packed TypeScript fixture proves the definition-level resolver stays unimportable. This continuation
still authorizes no visual effect export or rewrite, ParticleField promotion, Platform route reopen,
DS-IMP-106/110 completion claim or source-item transition.

### WO-CRA-14 ParticleField Stage-A quarantine
- **Source IDs / phase** — Supports DS-IMP-106 Stage A in Phase 0; it has no final source authority. WO-CRA-15 remains the only DS-IMP-106 completion authority.
- **Depends on** — WO-GAT-05 and WO-GAT-06.
- **Outcome** — The five live Platform high-intensity `ai-field` routes mount no ParticleField/Canvas/RAF and use a meaningful labelled static fallback until the complete runtime hardening certifies.
- **Steps** — Inventory the five routes; add one independently controllable route-level kill switch; replace live exposure with the shared static alternative; prove the ParticleField lazy chunk is absent on quarantined routes.
- **Acceptance gate** — Every targeted route has zero live ParticleField/Canvas mount, zero ParticleField chunk request and a labelled fallback; toggling the kill switch deterministically restores the fallback. Completing this WO leaves DS-IMP-106 open.
- **Execution control** — Return every route to the shared static fallback and never restore high-intensity exposure before WO-CRA-15. Telemetry: route inventory, kill-switch state, live mounts, fallback activation and lazy-chunk presence. Stop on any bypass, Canvas/RAF work, absent/unlabelled fallback or false source completion.
- **Do NOT** — Do not harden the runtime here, count Stage A as DS-IMP-106 completion, enable WebGPU, or add ambient Three scenes in Wave 0.

### WO-CRA-16 Semantic Icon v2/v3 BitHire Global Search and Auth/Login canaries
- **Source IDs / phase** — Supports DS-IMP-090 and DS-IMP-091 in Phase 0; it has no final source authority. WO-CRA-17 remains the only completion authority for both source items.
- **Depends on** — WO-GAT-05 and WO-GAT-06.
- **Outcome** — Two bounded BitHire canaries consume supplier-free assets through the established facades: Semantic Icon v2 covers Global Search, Semantic Icon v3 covers Auth/Login, and Google OAuth uses `BrandMark` rather than a functional icon or supplier component. `CloudServiceMark` remains a separate asset class and every existing compatibility path keeps working.
- **Steps** — Preserve the v2 navigation/job/offer registry, provenance, Phosphor SSR adapter and Global Search adoption; add only the bounded v3 Auth/Login semantics to that same canonical icon pipeline; migrate only the contracted BitHire Auth/Login surfaces through `Icon`; route Google OAuth branding through `BrandMark name="google"`; extend focused architecture coverage to reject direct supplier use, supplier-shaped DS aliases and asset-class conflation in both canaries.
- **Acceptance gate** — Registry, provenance and adapter are one-to-one and duplicate-free; every v2/v3 semantic name server-renders with supplier-free public props; Global Search and every contracted Auth/Login action resolve through `Icon`; the Google OAuth control owns its accessible name and renders a decorative Google `BrandMark`; focused DS SSR/API tests plus both BitHire architecture contracts pass. Completing this WO leaves DS-IMP-090 and DS-IMP-091 open.
- **Execution control** — Roll back either bounded consumer canary or its additive names independently and retain the established facade/compatibility aliases. Telemetry: v2/v3 semantic-name parity, unknown-name and SSR failures, Global Search and Auth/Login semantic coverage, Google OAuth asset-class resolution, and direct-supplier or supplier-shaped alias paths in either canary. Stop on a public supplier type, missing provenance, inaccessible output, unresolved name, Google rendered outside `BrandMark`, an ungoverned supplier path or false source completion.
- **Do NOT** — Do not claim the supplier bakeoff, `FeaturePictogram`, fleet migration, vertical recipes, signature glyphs or DS-IMP-093 here; do not remove Lucide compatibility aliases in this milestone.

## DS improvements — Phase 2B final authority

### WO-CRA-17 Icon supplier decision and semantic asset facades
- **Source IDs / phase** — DS-IMP-090 and DS-IMP-091; Phase 2B final authority.
- **Depends on** — WO-GAT-05, WO-GAT-06 and WO-CRA-16. Phase 2B must also be explicitly open.
- **Outcome** — A timeboxed Hugeicons Pro versus Phosphor decision is reproducible and licensed for Rottay's internal distribution model, and the public `Icon`, `BrandMark`, `CloudServiceMark` and `FeaturePictogram` facades fully separate functional, brand/provider and large illustrative assets without leaking supplier types.
- **Steps** — Run the canonical 40-icon bakeoff across roles, vertical grammars, supported engines, 12–24px, light/dark and mobile; obtain the required written Hugeicons build/distribution terms or retain Phosphor at the deadline; complete the four facades, registries/codegen, pinned provenance, offline adapters and accessible renderer contracts; use `roadmap/iconography-fleet-census-2026-07-16.md` as the measured input for pack boundaries and the eventual 345–430-role catalog; keep compatibility aliases for one minor.
- **Acceptance gate** — The decision ledger covers license/internal distribution, hermetic CI, visual/optical results, SSR/RSC, build, tree-shaking and measured one-icon bundle output; Hugeicons builds make zero `npm.hugeicons.com` calls or the decision records Phosphor fallback. Public types and packed ESM/CJS remain supplier-free; all four facades pass semantic-name, decorative/named, SSR/hydration, RTL, forced-colors, variant/optical fallback, provenance and asset-class separation tests across the certified matrix.
- **Execution control** — Retain the prior certified adapter and one-minor compatibility aliases; disable one supplier or asset-class adapter independently without conflating functional icons, marks and pictograms. Telemetry: unmapped names, direct supplier paths, per-entry bundle retention, SSR/RSC failures, accessible-name failures and provenance coverage. Stop on absent written distribution rights, network-dependent builds, supplier leakage, asset-class conflation, inaccessible SVG output or an uncertified optical variant.
- **Do NOT** — Do not absorb DS-IMP-092 fleet migration or DS-IMP-093 vertical recipes/signature glyphs into this authority; do not treat a canary, package publish or supplier fallback alone as completion.

#### CRA17 integral gate contract (2026-07-17)

`node packages/core/scripts/cra-17-integral-gate.mjs --structural` composes the selected
Phosphor 2.1.10 supplier, the semantic catalog, the four separate facade entries, packaged
provenance/licenses, supplier-free public declarations, independent ESM/CJS bundle-retention
evidence and the optical capture manifest. Structural mode may report final-only evidence as
pending, but it still fails on source, manifest, provenance, facade or artifact drift. The same
command without `--structural` is the final gate: every pending item is blocking.

In particular, `sightedReview: "pending"` is never interpreted as visual approval. It keeps the
final gate red and `completionEligible` false even when every capture byte and all 1,920 matrix
cells are present. The gate also reads roadmap authority and cannot turn WO-CRA-17 or
DS-IMP-090/091 into done state. Roadmap status remains registry-owned and phase 2B remains subject
to its explicit owner-GO control.

## DS improvements — Phase 2C final authority

### WO-CRA-15 ParticleField and Canvas/WebGL hardening
- **Source IDs / phase** — DS-IMP-106; Phase 2C final authority.
- **Depends on** — WO-GAT-05, WO-GAT-06, WO-CRA-12, WO-CRA-13 and WO-CRA-14. Phase 2C must also be explicitly open.
- **Outcome** — ParticleField and the existing governed Canvas/WebGL paths use provider-scoped colors, bounded DPR/count/context budgets, suspend hidden/offscreen/background work, clean every resource/listener, recover or fall back on context loss, and preserve accessible meaning under reduced/coarse/save-data policies.
- **Steps** — Centralize lifecycle/resource bounds; add provider-root color resolution; implement visibility/intersection/device policies; prove rapid mount/unmount cleanup and context-loss handling; retain the Stage-A kill switch and static alternative independently of the live runtime.
- **Acceptance gate** — Two roots keep distinct colors; adaptive DPR/count caps hold; hidden/offscreen work reaches zero RAF; cleanup and context-loss fixtures pass; reduced motion, coarse pointer, save-data and unsupported devices receive meaningful fallback; long-task, bundle and one-context budgets stay within their recorded ceilings.
- **Execution control** — Keep all Platform routes on the Stage-A fallback and disable the runtime globally or per route without losing the static alternative. Telemetry covers color isolation, DPR/count, RAF state, cleanup, context loss, fallback/a11y and performance budgets.
- **Do NOT** — Do not reopen live exposure merely because Stage A is done, hide missing meaning behind a poster, enable WebGPU without its later gate, or start ambient Three work before this WO certifies.

#### Owner continuation — Spatial v1 policy kernel and lifecycle host (2026-07-16)

The first bounded Spatial v1 source slice now exists as evidence beneath WO-CRA-15 without reopening
any Platform route or completing DS-IMP-106/107/108. The focused `./spatial/spec` entry is server-safe
and supplier-neutral: it contains no React, browser, Three or R3F runtime and exposes the exact v1
scene-module protocol `{ version: 1, backend: 'webgl2', Scene }`, hostile-input validation, the
`static | reduced | live-low | live-high` policy resolver and immutable quality ceilings. WebGL2 is
the only admitted v1 backend; WebGL1 and WebGPU-shaped input fail closed. `live-low` caps DPR at 1.25,
disables antialiasing and uses default power preference; `live-high` caps DPR at 1.5, permits
antialiasing and uses high-performance preference. Missing evidence can only lower or disable work.

The focused client-only `./spatial` entry exposes `SpatialExperience` without importing or owning a
renderer supplier. It server-renders the app-owned poster without probing or loading, treats reduced
motion as final, waits for hydration, intersection, shared visibility/pointer/power posture, desktop
viewport evidence and an exact WebGL2 probe, and releases the temporary probe context. A document-wide
FIFO lease admits at most one live host. Lazy module/load/render/scene/context failures fail back to the
poster, a loader that does not settle within 15 seconds fails safe and releases its lease, Canvas
registration accepts only one descendant Canvas and transactionally restores its prior accessibility
attributes on cleanup, context loss prevents the default browser path and invokes the app-provided
disposer, and retry explicitly invalidates the failed probe/module state. Stale scene callbacks are
revoked across unmount, loader replacement, offscreen and hidden transitions. Eight sustained reported
frames at or above 25ms can downgrade `auto` quality from high to low but never promote or replace
meaning.

The host renders a labelled region with app-owned description and keeps the renderer Canvas
presentational. Any `inspect | navigate | manipulate` scene is rejected before probing unless the app
supplies both keyboard/domain controls and a labelled equivalent 2D/list alternative; optional
pause/resume and retry controls remain app copy. Scene graph, Three/R3F dependency, data, domain
interaction, copy, controls, poster/reduced content and equivalent alternative remain app-owned. The
two source entrypoints are wired only as focused package/Vite entries and are absent from the root
barrel; that source wiring is not an installed-tarball or bundle certification.

Current focused evidence is 51/51 green tests (28 policy/validation and 23 lifecycle-host contracts):
fail-closed policy precedence and all static/low/high
postures; immutable DPR/antialias/power ceilings; exact/hostile scene-module validation; WebGL2-only
probe caching and temporary-context release; FIFO lease and stale-waiter cleanup; SSR and reduced
no-load/no-probe behavior; admission after hydration/in-view/capability/lease; second-host contention;
context-loss disposal, fallback and explicit retry; interactive alternative/controls enforcement; and
sustained-frame adaptive downgrade. The host suite also covers loader timeout and late settlement,
loader replacement, rapid unmount, hidden/offscreen callback revocation, phone/coarse/constrained
admission denial, modern/legacy media-listener cleanup, duplicate/hostile Canvas registration,
idempotent disposal, event deduplication and stable pause focus/2D alternatives. These are deterministic
unit/JSDOM contracts, not real-browser or production-device certification.

No source item moves to complete from this continuation. DS-IMP-106 remains open because the current
ParticleField color/count/DPR/RAF/lifecycle hardening has only focused unit evidence: the five
quarantined Platform routes, the independent Stage-A kill switch, the other existing Canvas/WebGL
paths and measured real-browser/performance certification remain incomplete. DS-IMP-107 remains open
because feature-flagged WebGPU parity is intentionally absent, the Platform constellation has not
adopted the host, and packed ESM/CJS/types, supplier-isolation, bundle, real context creation/loss and
cross-host browser evidence are pending. DS-IMP-108 remains open until real-browser phone/coarse/
save-data/visibility/offscreen behavior, zero suspended RAF and demand-loop enforcement, actual R3F
mount/unmount/context lifecycle, keyboard/AT equivalence and long-task/frame/memory/DPR budgets pass.

### WO-CRA-19 Overlay layer kernel
- **Source IDs / phase** — DS-IMP-078; Phase 2B.
- **Depends on** — WO-GAT-05, WO-GAT-06.
- **Outcome** — The W5 overlay layer-stack kernel: a single z-authority, one Escape router, focus restore, and a scroll-lock refcount shared across every overlay primitive.
- **Steps** — Build the z-authority + layer stack; route Escape through one owner; add focus restore; refcount scroll-lock.
- **Acceptance gate** — One z-authority governs stacking; a single Escape router closes the top layer; focus restores on close; scroll-lock refcounts correctly; unit and visual green.
- **Execution control** — Rollback: Revert the overlay layer kernel; per-overlay z, Escape and scroll-lock handling fall back to their current local implementations. Disable: Keep the single Escape router and z-authority kernel behind the W5 layer-stack seam until adopted. Telemetry: gate results for the WO acceptance and counter deltas in engine-token-audit. Stop if any decrease-only counter regresses or the acceptance gate cannot pass without weakening a floor.
- **Do NOT** — Do not weaken a floor or baseline to pass the gate; do not add product/domain semantics to the DS; edit-only, no commits, never git-restore directories.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, build the overlay layer kernel (DS-IMP-078): single z-authority, one Escape router, focus restore, scroll-lock refcount. Gate: one z-authority, single Escape owner, focus restores, refcounted scroll-lock, unit/visual green. Fences: edit-only, no commits, never git-restore directories.

### WO-CRA-18 One chart system convergence with a11y, grammar and governance
- **Source IDs / phase** — DS-IMP-098, DS-IMP-099, DS-IMP-100, DS-IMP-101, DS-IMP-102, DS-IMP-104; Phase 2C.
- **Depends on** — WO-GAT-05, WO-GAT-06.
- **Outcome** — The W5 Part 1 chart convergence: every chart family onto the one engine, chart states, CSV/a11y output, annotation/streaming, the census gate and the budget ceilings — one chart system, not many.
- **Steps** — Converge families onto the engine; add states + CSV/a11y + annotation/streaming; add the family census gate and budgets.
- **Acceptance gate** — All families render on the one engine with states + a11y/CSV + annotation/streaming; the census gate holds one system; budgets not exceeded; build/unit/visual green.
- **Execution control** — Rollback: Revert the chart-family engine convergence per family; the legacy chart export and rendering path is retained. Disable: Disable a converged chart family back to its deterministic static rendering until the W5 census gate passes. Telemetry: gate results for the WO acceptance and counter deltas in engine-token-audit. Stop if any decrease-only counter regresses or the acceptance gate cannot pass without weakening a floor.
- **Do NOT** — Do not weaken a floor or baseline to pass the gate; do not add product/domain semantics to the DS; edit-only, no commits, never git-restore directories.
- **Size** — XL.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, converge the one chart system (DS-IMP-098/099/100/101/102/104): families onto the engine, states, CSV/a11y, annotation/streaming, census gate, budgets. Gate: one engine, a11y/CSV present, census + budgets green, build/unit/visual green. Fences: edit-only, no commits, never git-restore directories.

### WO-CRA-20 Icon preset weight pruning
- **Source IDs / phase** — Support milestone (supports DS-IMP-060 / WO-GAT-09, final phase 6); Phase 2C.
- **Depends on** — WO-GAT-05, WO-GAT-06.
- **Outcome** — The icon generator emits only preset-used weights, shrinking the generated corpus. Promised in the WO-CRA-17 R2 retention evidence. Recorded as a non-completing support milestone against the final claim-integrity certification.
- **Steps** — Determine the preset-used weight set; make the generator emit only those; regenerate and prove every consumer still resolves.
- **Acceptance gate** — The generator emits only preset-used weights; every consumer resolves; generated corpus shrinks with no missing glyph; icon gates green.
- **Execution control** — Rollback: Revert the generator weight-pruning change; the full preset weight set is regenerated. Disable: Keep the generator emitting all preset weights until the pruned set is proven against every consumer. Telemetry: gate results for the WO acceptance and counter deltas in engine-token-audit. Stop if any decrease-only counter regresses or the acceptance gate cannot pass without weakening a floor.
- **Do NOT** — Do not weaken a floor or baseline to pass the gate; do not add product/domain semantics to the DS; edit-only, no commits, never git-restore directories.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, prune icon-preset weights at the generator level (support milestone for DS-IMP-060) so only preset-used weights emit. Gate: consumers all resolve, corpus shrinks, no missing glyph, icon gates green. Fences: edit-only, no commits, never git-restore directories.

### WO-CRA-21 BrandMark ground-keyed contrast variant
- **Source IDs / phase** — Support milestone (supports DS-IMP-060 / WO-GAT-09, final phase 6); Phase 2C.
- **Depends on** — WO-GAT-05, WO-GAT-06.
- **Outcome** — BrandMark contrast-variant selection keys to the local surface ground rather than the scheme flag (a sighted-review finding). Recorded as a non-completing support milestone against the final certification.
- **Steps** — Detect the local surface ground; key variant selection to it; verify against the sighted review.
- **Acceptance gate** — The correct contrast variant is chosen from local ground on both light and dark surfaces regardless of the scheme flag; sighted captures reviewed.
- **Execution control** — Rollback: Revert the ground-keyed BrandMark variant selection; the scheme-flag keyed variant is restored. Disable: Hold the ground-keyed BrandMark variant behind the existing mark facade until the sighted review confirms it. Telemetry: gate results for the WO acceptance and counter deltas in engine-token-audit. Stop if any decrease-only counter regresses or the acceptance gate cannot pass without weakening a floor.
- **Do NOT** — Do not weaken a floor or baseline to pass the gate; do not add product/domain semantics to the DS; edit-only, no commits, never git-restore directories.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, key BrandMark contrast-variant selection to local surface ground, not the scheme flag (support milestone for DS-IMP-060). Gate: correct variant on light/dark ground independent of scheme flag, sighted captures reviewed. Fences: edit-only, no commits, never git-restore directories.

### WO-CRA-22 Root-entry supplier purity
- **Source IDs / phase** — Support milestone (supports DS-IMP-060 / WO-GAT-09, final phase 6); Phase 2C.
- **Depends on** — WO-GAT-05, WO-GAT-06.
- **Outcome** — The ~30 root-reachable ui files migrate off catalog names onto the semantic supplier facade (W2 pinned 13 root-reachable importers). Recorded as a non-completing support milestone against the final certification.
- **Steps** — Enumerate the root-reachable importers; migrate each to the semantic facade; add a guard against catalog-name reintroduction at the root entry.
- **Acceptance gate** — Zero root-reachable catalog-name imports; the semantic facade is the only root-entry supplier path; a guard prevents regression; build green.
- **Execution control** — Rollback: Revert the root-entry facade migration per file; the prior catalog-name imports are restored. Disable: Not-applicable as a runtime flag; revert the specific root-entry import instead of gating the supplier facade. Telemetry: gate results for the WO acceptance and counter deltas in engine-token-audit. Stop if any decrease-only counter regresses or the acceptance gate cannot pass without weakening a floor.
- **Do NOT** — Do not weaken a floor or baseline to pass the gate; do not add product/domain semantics to the DS; edit-only, no commits, never git-restore directories.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, migrate the ~30 root-reachable ui files onto the semantic supplier facade (support milestone for DS-IMP-060), adding a root-entry guard. Gate: zero root-reachable catalog-name imports, guard green, build green. Fences: edit-only, no commits, never git-restore directories.

### WO-CRA-23 Claude multi-agent DS normalization and world-class family elevation
- **Source IDs / phase** — Owner-authorized standalone `modern-rescue` program; not a shadow status for the locked DS-improvements phases.
- **Depends on** — WO-GAT-05, WO-GAT-06.
- **Outcome** — Elevate the complete 252-family visible UI universe through one governed composition system so BitHire becomes a BitHire-original Professional Network Hiring OS and The Management becomes a monochrome, square, editorial/rustic Executive Ledger on the same component tree, then prove post-certification that the same Modern system has complete customization depth, five coherent art-direction postures and catalog parity without creating a second DS.
- **Steps** — Execute R0–R7 from the governed Modern-rescue pack one owner-authorized round at a time: truth/instrumentation and profile migration plan; twelve reference canaries against the binding tenant art direction in the isolated hardcoded `/probe/ds-reference` showroom lab; primitives; patterns/charts; structures/surfaces/commercial; canon closure; independent R6 Codex certification; then R7 customization depth, token/CSS liveness, 252-family anatomy dispositions, recipe expansion, art-direction postures, product-editor ergonomics and capability-level public-system benchmarking. The lab renders the same DS tree under BitHire's static BrandTheme and The Management's published DB document, with zero product-app imports, styles, routes, APIs or fixtures; Candidates is a later adoption consumer, never the R1 visual authority. Every round includes dynamic conflict-graph delegation, implementation, canon reconciliation, tests, i18n, documentation, hashed evidence and a Codex stop/go boundary. Kimi may add temporary proposal-only files under `KIMI-ANNOTATIONS/inbox`; Codex reproduces useful observations, incorporates accepted amendments into the canon and deletes the raw submission before Claude receives the reconciled program.
- **Acceptance gate** — R6 first certifies 252 families with fresh evidence, all applicable binary contracts green, zero hard vetoes, every family above its layer threshold (90–95), every critical dimension at least 4/5, resilient viewport/container/density/rhythm/type-scale behavior and same-tree BitHire/TMM divergence in at least eight observable axes and six non-color axes. R7 then requires 252/252 customization/anatomy dispositions, 14/14 productive recipe groups, five coherent reference postures and all ten pairwise comparisons, zero dead/unowned CSS or dormant public channels, static/DB exact-restore parity, explicit catalog-gap dispositions, no R6 regression, coverage/resilience/canonClosure/pathParity equal 1 and unknown targeted impact equal 0. Both rounds require Codex serial and sighted acceptance; R7 may not rewrite R0-R6 history.
- **Execution control** — Rollback: revert only the exact family lane or integrator batch that violates the reference grammar. Disable: keep a family on its pre-wave implementation until its disjoint replacement passes Codex review. Telemetry: family-status denominator, prototype ledger decisions, tenant divergence axes, responsive defects, gate counters and source/artifact freshness. Stop if ownership cannot be proven, shared-file writers overlap, static/DB parity would be broken, or an existing Kimi capability lacks successor/death proof.
- **Do NOT** — Do not treat file visitation as quality; do not add public `--ds-*` from visual lanes; do not create tenant selectors, product branches, a second icon provider or a parallel theming/compiler path; do not edit app-bithire, Classic/Rustic, tests, baselines, generated styles/dist or shared contracts outside the integrator; edit-only, no commits, never mutate stashes or use destructive git.
- **Size** — XL, multi-wave.
- **Delegation prompt** — Use `packages/core/scripts/quality-evidence/programs/modern-rescue/CLAUDE-PROMPT.md`. The binding tenant direction is `tenant-art-direction.json`; no Kimi audit is active after final reconciliation. Claude top-tier is coordinator and calculates the safe agent count from a file/conflict graph; only writers in the current independent set edit. Claude never reads the Kimi inbox. Codex owns any future advisory reconciliation and deletion, every round gate, final validation, screenshots and audited local commits. This program never pushes.

#### 0. Authority and relationship to existing documentation

This is an **execution work order**, not a new architectural authority.

Architectural law remains in the active documentation:

1. `docs-engineering/engineering/design-system/architecture/README.md`
2. `docs-engineering/engineering/design-system/catalog/decision-matrix/README.md`
3. `docs-engineering/engineering/design-system/capability-map/README.md`
4. `docs-engineering/engineering/design-system/runtime/engines/modern/README.md`
5. `docs-engineering/engineering/design-system/tokens/README.md`
6. `docs-engineering/engineering/design-system/tokens/authoring-guide.md`
7. `docs-engineering/engineering/design-system/tokens/app-customization.md`

Operational status and prior adjudications remain in:

1. `docs-engineering/archive/audits/2026-07-26-ds-modern-whitelabel-independent-audit-davila.md`
2. `docs-engineering/archive/audits/2026-07-31-kimi-phase-b-premium-execution-roadmap.md`
3. `ui-design-system/packages/core/KIMI-CUSTOMIZATION-PRESERVATION-MANIFEST.json`
4. `ui-design-system/packages/core/KIMI-VISUAL-WORKLIST.json`
5. `ui-design-system/packages/core/CANARY-MANIFEST.json`
6. `ui-design-system/packages/core/customization-surface-report.json`
7. `ui-design-system/packages/core/hooks-manifest.json`

The archived audit is the central **program ledger**, but it does not override active architectural documentation. If this roadmap discovers a real architectural decision, the lead must update the owning active document and append only a status pointer to the audit ledger.

No agent may create another competing roadmap, token catalog, design doctrine, or status dashboard.

Execution spends premium-model context on judgment instead of deterministic
repetition. The preferred adaptive route is Opus/strongest coordinator-capable
Claude as MAIN for coordination, architecture, integration and creative family
elevation; Fable/strongest independent reviewer as read-only advisor; and
Sonnet/efficient reliable model for censuses, wiring, i18n and evidence.
Availability and measured output may change the route; the conflict graph and
exact ownership remain authoritative. Per-agent narratives are rejected in
favor of bounded family packets and structured receipts.

The execution pack at
`packages/core/scripts/quality-evidence/programs/modern-rescue/` is a
machine-readable specification subordinate to this WO. It contains no mutable
status; `roadmap/registry.json` remains the sole status authority.

The product-art-direction contract in that pack is binding implementation
input, not another theme engine. Raw files under `KIMI-ANNOTATIONS/inbox/` are
temporary, non-canonical creative proposals. Claude never reads them; Codex
incorporates accepted observations into the owning canonical contract and
deletes the raw submission before delegation.

#### 1. Why this wave exists

The architecture is materially stronger than the visual output:

- static `BrandTheme` and DB `TenantThemeDocument` are legitimate ingress paths to the same compiler and semantic channels;
- Standard/Pro/Expert exposure is governed;
- profiles, recipes, floors, compiler parity, hydration ownership and CI gates exist;
- BitHire and The Management already diverge causally;
- Kimi introduced and preserved useful craft, responsive behavior, icons, accessibility and private proposals.

But the visible product is still not acceptable:

- families were often marked complete after shallow or one-line changes;
- headings and cells can wrap per-character or collide;
- DataTable and workspace composition can compress a desktop model instead of adapting it;
- density/type/radius changes do not always cause intelligent reflow;
- the tenants can still read as the same mediocre system painted differently;
- visual hierarchy, materials, edge grammar, motion and responsive composition are inconsistent across layers;
- catalog coverage is not the same thing as reference-grade craft.

The objective is not to touch every file. The objective is to make every public family either:

1. reference-grade and demonstrably coherent with the system;
2. intentionally unchanged with concrete evidence;
3. blocked by a named architectural or product decision.

#### 2. Binding outcome

At the end of the program:

- the same component tree can look and feel materially different under BitHire and The Management;
- Standard controls produce broad coherent changes with few decisions;
- Pro controls expose curated family/profile depth;
- Expert remains a bounded raw allowlist, never arbitrary access to internal `--ds-*`;
- family-private implementation stays private;
- Kimi's useful visual capacity is preserved, connected or explicitly adjudicated;
- primitives, patterns, charts, structures, compositions and page surfaces share one grammar;
- mobile is a deliberate simplified product posture, not a squeezed desktop layout;
- large type, density, rhythm, radius and responsive changes cause resilient reflow rather than overlap, clipping or dead space;
- there is no new tenant selector, engine branch, parallel token compiler, app-owned DS clone or second icon system;
- no family is called premium merely because it was visited.

The two visual north stars are deliberately asymmetric:

- BitHire: cool professional-network canvas, white work surfaces, confident
  blue action grammar, people-first hierarchy, approachable medium geometry,
  calm material and mobile task priority. It may evoke a mature professional
  network but must not copy LinkedIn assets, marks, copy or exact trade dress.
- The Management: paper white, black and grayscale, square geometry, strong
  rules, dossier/ledger composition, restrained depth, content-safe texture
  and crisp mechanical motion. Accessible semantic statuses remain governed
  exceptions to monochrome brand chrome.

The current selections are known migration inputs, not the target: BitHire is
`technical-sharp`/`bithire-technical`; The Management is
`editorial-round`/`management-editorial` with warm Art Deco authorship. R0
must resolve this through versioned entries in the existing closed profile and
recipe registries; changing a published profile's meaning in place is a veto.


Final status vocabulary is closed:

- per family: `ELEVATED_PENDING_CODEX_AUDIT`,
  `ALREADY_REFERENCE_GRADE_PENDING_CODEX_AUDIT`,
  `ASSESSED_NOT_ELEVATED` or `BLOCKED_OWNER_DECISION`;
- per round: `IMPLEMENTED_PENDING_CODEX_AUDIT` or an honest blocked handoff.

Architecture/product ownership and untouched/partial reasons are mandatory
receipt fields, not alternate completion statuses. No pending family is
accepted progress until Codex independently certifies it.

Claude must never claim `ACCEPTED`, `VERIFIED_VISUAL`, `10/10` or `PRODUCTION_READY`. Those verdicts belong to Codex after machine and sighted review.

#### 3. Frozen starting state and preservation law

Observed before authoring this roadmap:

- DS HEAD: `a97ddd7361d0` with a large uncommitted visual/architecture tree and one DataTable stash;
- app-bithire HEAD: `bd1142d3a589` with large foreign WIP and four stashes;
- docs HEAD: `04431ba9824c` with concurrent generated-token and audit changes;
- generated `packages/core/styles/*.css` are present in the dirty tree;
- recent Candidates work and the hydration correction are uncommitted.

The executor must reproduce the exact HEADs, porcelain, stashes and per-file hashes at start. Differences are not permission to clean, restore or overwrite anything.

Forbidden operations:

- `git reset`, `git restore`, `git checkout --`, cleaning untracked files, applying/dropping stashes;
- mass rewrites, mass formatters or broad scripted substitutions across family files;
- editing apps, Classic or Rustic unless the lead records a specific cross-engine defect and obtains owner permission;
- editing generated `dist/**` or `packages/core/styles/*.css` from a family lane;
- commits, pushes, PRs, publishes, tags or version bumps;
- deleting a Kimi capability because a census calls a writer dead;
- changing tests to preserve obsolete anatomy or to make a failing contract green.

Every writer must declare its exact file ownership before editing. One file has one writer for the whole batch. If two lanes need the same file, the integrator owns it and both lanes submit a change request.

#### 4. Real inventory and denominators

##### 4.1 Visible UI universe

The source/barrel audit on 2026-08-04 found:

| Layer | Public families | Notes |
|---|---:|---|
| Primitives | 100 | 93 in Showroom registry; 7 public omissions |
| Patterns, excluding charts | 56 | 48 in Showroom registry; 8 public omissions |
| Charts | 18 | exact 18/18 registry correspondence |
| Structures | 27 | 25 in Showroom registry; AppShell and ConnectedCommandPalette omitted |
| Page surfaces | 36 | registry count complete; Onboarding category/path drift |
| Surface composition | 4 | separate composition layer |
| Commercial kit | 11 | separate entrypoint and CSS; not part of the root patterns barrel |
| **Visible total** | **252** | 237 root UI families + 4 composition + 11 commercial |

Showroom's 220 entries are a projection, not the family authority. The source tree and public barrels win.

Source volume for planning: primitives 1,143 files; patterns 618; structures 94; surfaces 152. UI tests: 672 files. Stories: 126. These are coverage surfaces, not automatic quality proof.

##### 4.2 Primitives — exact 100

Display (21): Avatar, Badge, Calendar, Callout, Card, Carousel, CodeBlock, Descriptions, Empty, Image, Kbd, List, MarkdownView, QRCode, Statistic, Table, Tag, Timeline, Tooltip, Tree, Typography.

Inputs (25): AutoComplete, Button, Cascader, Checkbox, ColorPicker, DatePicker, Form, FormField, Input, InputNumber, Mentions, OTPInput, PasswordInput, Radio, Select, Slider, Switch, TagInput, Textarea, TimePicker, Toggle, Transfer, TreeSelect, Upload, VoiceInputButton.

Feedback (11): Alert, Drawer, Message, Modal, Notification, Progress, Rate, Result, Skeleton, Spinner, Toast.

Layout and responsive (16): AspectRatio, Box, Collapse, Container, Divider, Flex, Grid, Layout, ScrollArea, SemanticSurface, Space, Splitter, Stack, Show, Hide, ResponsiveSlot.

Navigation (12): Affix, Anchor, BackTop, Breadcrumb, FloatButton, Link, Menu, Pagination, Segmented, Stepper, Steps, Tabs.

Overlay (10): AlertDialog, ConfirmDialog, ContextMenu, Dropdown, HoverCard, Popconfirm, Popover, Sheet, Tour, Watermark.


Foundation visual (5): IconFrame, Meter, ResizeHandle, VisuallyHidden, LoadingIndicator.

SemanticSurface is a canonical public primitive exported from the layout barrel. It occupies the former deprecated `OverlayModal`-alias row, keeping the denominator at 100. `OverlayModal` is only a compatibility alias of canonical feedback `Modal`; R0 counts its consumers and R5 may retire the alias only with death proof.

##### 4.3 Patterns — exact 56 plus 18 charts

Data (18): PatternDataTable, VirtualList, PatternGridView, PatternGalleryView, DetailPanel, FileManager, ListToolbar, ColumnSettings, SavedViews, PatternStatsGrid, BulkSelectToggle, StatusFilterPills, TableCheckboxStyles, DecisionComparison, DecisionPanorama, RecordFacts, WidgetBoard, CellRenderers.

Forms (5): PatternFormBuilder, FilterBuilder, FilterPanel, StepWizard, InvoiceTemplate.

Visualization non-chart (5): PatternCalendarView, PatternMapView, PatternTimeline, PatternTreeView, PatternKanbanBoard.

Communication (6): Assistant, CommentThread, NotificationCenter, LiveFeed, ActivityLog, Presence.

Workflow (5): ApprovalInbox, ApprovalWorkflow, OperationalLedger, ModerationGallery, ShiftMatrix.

Navigation (5): CommandPalette, ShortcutsOverlay, EnvironmentToggle, WorkspaceSwitcher, PatternLocaleSwitcher.

Commerce (1): PricingTable.

Customization (4): TenantPreview, TokenInspector, BrandingPreviewSandbox, PatternBrandStudio.

Feedback (2): EmptyState, AdaptiveOverlay.

Identity (1): UserProfileCard.

Shell (4): CockpitHeader, FeatureWorkspaceFrame, PatternPageShell, WorkbenchHeader.

Charts (18): AreaChart, BarChart, BulletChart, CalendarHeatMap, FunnelChart, GanttChart, GaugeChart, HeatMap, Histogram, LineChart, NetworkGraph, PieChart, RadarChart, SankeyChart, ScatterChart, Sparkline, TreeMap, WaterfallChart.

##### 4.4 Structures — exact 27

Headers (6): CollectionHeader, DashboardHeader, DetailHeader, EditHeader, FormHeader, MobileHeader.

Workspace (12): ActionDock, ActiveFiltersBar, ColumnMenu, ConnectedCommandPalette, SearchCommandBar, ExportButton, FieldFiltersPanel, SavedViewsMenu, ScopeSwitcher, SelectionPreviewRail, TableToolbar, ViewModeSwitcher.

Record (3 family roots): Record content family, FormSections, EditFields.

Dashboard (3): StatsHeader, DataTerminalCard, DashboardInsights.

Feedback (1): LoadingOverlay.

Shell (2): AppShell, BottomTabBar.

##### 4.5 Page surfaces — exact 36, plus 4 compositions

Admin (8): AuditSurface, BillingSurface, FileBrowserSurface, ImportExportSurface, IntegrationSurface, ProfileSurface, SettingsSurface, TeamSurface.

Data (7): CompareSurface, DashboardSurface, DetailSurface, ListSurface, ReportSurface, SearchSurface, VisualizationSurface.

Experience (9): AuthSurface, ChatSurface, EditorSurface, EmptyStateSurface, MarketingSurface, MediaSurface, NotificationSurface, OAuthTransitionSurface, PricingSurface.

Forms (4 roots, 5 public surfaces): DetailFormSurface, FormSurface, GuidedDraftFormSurface, WizardSurface, OnboardingSurface. Onboarding lives under forms/wizard but is cataloged as experience; do not silently move it.

Operations (4): ActivitySurface, KanbanSurface, OperationalSurface, SchedulerSurface.

Workspace (4): CollectionWorkspaceSurface, CommandCenterSurface, DecisionInboxSurface, RecordWorkbenchSurface.

Composition (4): PageShellSurface, HeaderSurface, WorkspaceShell, SidebarSurface.

##### 4.6 Commercial kit — separate 11

AsciiFrame, CropMarks, InvertSection, SectionFrame, TextureBackdrop, AsciiDiagram, TerminalBlock, commercial TreeView, Typewriter, MonoStat, ProductWindow.

The commercial entrypoint is legitimate and deliberately separate. Do not let it become a second general product engine or leak hardcoded commercial identity into Modern families.

##### 4.7 Known layer ambiguities that must not be multiplied

- feedback Modal is canonical; overlay `OverlayModal` is a deprecated adapter;

- PatternPageShell, FeatureWorkspaceFrame, AppShell, PageShellSurface and WorkspaceShell have distinct contracts but overlapping names;
- Table vs PatternDataTable vs ListSurface;
- Empty vs EmptyState vs EmptyStateSurface;
- Calendar vs CalendarView vs CalendarHeatMap vs SchedulerSurface;
- Tree vs PatternTreeView vs commercial TreeView;
- engine-locked facades are internal seams, not permission to create a second Modern implementation;
- tooling/runtime/foundation folders are infrastructure, not additional families.
- `BrandTheme.engineBridge` is an unbounded, dormant Daisy-era escape hatch: freeze it, forbid new Modern writes and let only the architecture integrator retire it after a consumer census;
- deprecated `ComponentExtensions` / `EngineAwareProps.extensions` is an inert second API shape: no lane may build on it; retire it only after proving external imports are zero;
- the 93 manifest-declared public hooks and app-owned `--rt-*` are the only application styling boundary; fenced reads are debt, not public API.

Any new component proposal must prove it cannot be expressed honestly by one of these existing owners.

#### 5. Token, control and customization inventory

##### 5.1 Product-facing control model

Claude must treat controls, recipes, channels and component-private values as different levels.

| Tier | Count | Purpose |
|---|---:|---|
| Standard / base | 13 | Few high-impact inputs suitable for ordinary tenant customization |
| Pro / premium | 7 | Curated family/profile/anatomy control |
| Expert | 294 | Closed, typed raw override allowlist; maximum 200 entries per tenant document |
| Internal active | 1 | dark-mode compatibility; tenant palette remains authoritative |
| Frontier | 1 | status palette seeds; not exposed until formally opened |

Standard 13:

1. `palette.seeds`
2. `typography.pairing`
3. `typography.families`
4. `typography.scale`
5. `shape.radius-scale`
6. `shape.button-style`
7. `density.mode`
8. `spacing.rhythm`
9. `motion.dial`
10. `surfaces.elevation-posture`
11. `surfaces.effect-intensity`
12. `navigation.sidebar-tone`
13. `experience.profile`

Pro 7:

1. `chrome.families`
2. `chrome.anatomy`
3. `token-overrides`
4. `recipe-profile`
5. `profiles.expressive`
6. `profiles.icon`
7. `responsive.posture`

Expert is the exact allowlist generated at `docs-engineering/engineering/design-system/tokens/exposure-tiers.md`; never paste or maintain a second list here.

##### 5.2 Live internal corpus

Generated census snapshot:

- 7,470 `--ds-*` names in the productive corpus;
- 4,811 writers;
- 3,367 foundation writers;
- 550 component writers;
- 1,544 tenant-channel writers;
- 93 application public hooks;
- 2,691 fenced reads that are debt, not an API;
- 270 dead writers, all classified but not automatically deletable;
- 20 frontier names;
- 3 legacy alias families;
- 0 unclassified rows;
- 274 live family-private `--_ds-*` names;
- 0 productive `--_ds-proto-*` names.


The 80 names in the prototype ledger are historical rows already adjudicated/retired: 59 private, 11 derived, 4 promoted to foundation, 3 merged, 1 recipe, 1 runtime bridge and 1 retired. They are not 80 live prototypes.

Kimi preservation classification currently includes 183 premium dead-writer candidates. They must be reconnected or promoted when useful; the preservation gate forbids automatic retirement. A `dead-writer` census is never deletion authorization.

##### 5.3 Existing composition depth

- 2 experience profiles: BitHire technical and The Management editorial;
- expressive profiles across type, geometry, edge, material, elevation, motif and icon;
- density and motion participate in the composed experience profile;
- 3 responsive postures;
- 2 recipe profiles across 6 recipe families;
- 16 motion recipes and 3 motion profiles;
- family emphasis: card, toolbar, metric-card and panel, each with quantized intensity;
- 3 static BrandTheme sources: BitHire, Evnto, Platform;
- DB simple/advanced appearance contracts, with BitHire/Evnto envelopes and fail-closed Platform behavior.

The goal is to increase **downstream coverage and composition quality**, not multiply top-level knobs.

#### 6. Canonical authoring law

For every visual decision, use this search order:

1. existing semantic channel;
2. existing Standard control and its derivations;
3. existing Pro profile/recipe/anatomy/family control;
4. existing family emphasis mechanism;
5. existing Expert allowlisted channel;
6. existing app public hook, only when the concern genuinely belongs to the app;
7. existing family-private `--_ds-*` implementation value;
8. new temporary `--_ds-proto-<family>-<axis>` only when a real observable capability is missing.

Family agents may not add new public `--ds-*` names.

A new prototype is valid only when all are true:

- it moves an observable rendered property;
- two plausible profiles need different values;
- no existing control/channel/recipe/emphasis can express it;
- it is family-scoped;
- it has an exact fallback preserving the current default;
- its type, range, owner, consumer and proposed destination are recorded;
- it does not require the app or component to know the tenant.

Only the architecture integrator may adjudicate a prototype as:

- `DERIVE_FROM_EXISTING`
- `KEEP_COMPONENT_PRIVATE`
- `RECIPE_AXIS`
- `PROMOTE_STANDARD`
- `PROMOTE_PRO`
- `ADD_TO_EXPERT_ALLOWLIST`
- `PUBLIC_APP_HOOK`
- `MERGE_ALIAS`
- `RETIRE_WITH_DEATH_PROOF`

Promotion requires parity through both static BrandTheme and DB TenantThemeDocument paths, a real consumer, bounded validation and restore-to-default evidence. No promotion may exist only in CSS.

##### 6.1 Productive CSS ownership law

Every visible selector, declaration and custom-property edge in accepted round
scope has exactly one canonical family or named foundation/runtime owner. A
tenant-variable rendered decision must be reachable from both static
`BrandTheme` and DB `TenantThemeDocument` through the same compiler model:
directly for bounded brand/Advanced authorship, or indirectly through
capability → profile → semantic channel → group recipe/anatomy/emphasis →
family-private value. Indirect propagation is the expected way a small number
of tenant decisions changes many families coherently.

This does not require moving structural component CSS into BrandTheme. A local
literal may remain only as an explicit non-tenant structural invariant. It may
not silently encode identity or be sold as configurable.

Accepted scope has zero unimported sheets, unreachable selectors/states,
writers without readers, reads without canonical emitter/fallback/owner, rules
always superseded, mirrors without consumers or generated rules without live
source. Every retirement needs attribution, reachability/consumer proof,
successor adjudication when visual capacity exists and source/artifact
reconciliation. R5/R6 apply this census to the complete productive Modern CSS,
not merely the files touched by the program; R7 repeats it after
customization-depth changes.

#### 7. Universal 10/10 product-quality contract

Every family must be evaluated across the following dimensions. A one-line token read, new border or generic gradient does not satisfy a dimension.

The binding quantitative contract is
`packages/core/scripts/quality-evidence/programs/modern-rescue/quality-rubric.json`.
Binary contracts award no craft points. Craft is scored over 100 weighted
points; a family must clear its own layer threshold, keep every critical
dimension at 4/5 or above, and have zero hard vetoes. Claude may propose scores;
only Codex can approve them.

Family completion is governed by
`quality-rubric.json#familyCompletionContract`, not by file visitation. Every
family needs a paired before/after scorecard for all applicable dimensions, a
material-delta table tied to productive source and rendered properties, full
applicable state/stress coverage, tenant causality/restore and proof for every
dimension left unchanged. The normal breadth floor is 6 improved dimensions
for reference canaries, 4 for primitives, 5 for patterns/charts, 6 for
structures, 7 for surfaces/compositions and 5 for commercial. Fewer changes
close a family only when every unchanged applicable dimension is independently
proven at 4/5 or above and no P0/P1 defect remains. Otherwise its status is
`ASSESSED_NOT_ELEVATED`, it remains in the current round and it does not count
as progress. `ALREADY_REFERENCE_GRADE_PENDING_CODEX_AUDIT` requires zero
make-work source edits and the same evidence packet. Only Codex acceptance
increments the completed-family numerator.

##### 7.0 Integrated craft and anti-ordinary floor

The binding detail lives in `visual-craft-contract.json` and
`VISUAL-CRAFT-CONTRACT.md`. Twelve reproduced incident classes are now hard
inputs: Steps connectors crossing content; miniature generic Badge/Tag;
Transfer peers that look like unrelated boxes; accidental native desktop
Select chrome; undersized Toggle/Switch with paint-only states; and compound
fields with one rounded full border inside another; semantic icon bypass and
placeholder reuse; raw chart geometry without an editorial scaffold; outline-
only surfaces without anatomy; indiscriminate micro-pills; strip-built headers;
and adaptive regions collapsed below a readable measure. Claude must eliminate
each general failure class, not patch only the photographed selector.

The exhaustive review is the closed twenty-category, 120-check taxonomy in the
JSON contract. Every family returns `PASS`, `FAIL` or
`NOT_APPLICABLE_WITH_REASON` for every row. Any applicable failure keeps the
family `ASSESSED_NOT_ELEVATED`; no screenshot-specific patch or false N/A can
advance the cohort.

One semantic region has one dominant boundary. Lines, rules and motifs never
cross content-safe zones. Peer panels align unless priority explicitly differs.
Focus, error, selected and hover do not stack unrelated outlines. Whitespace
has an intrinsic or task reason. Native desktop chrome, random pills, tiny
control type and gradients/shadows/saturation used as a premium shortcut are
hard vetoes.

Optional DS icons support none/leading/trailing/assistive modes and collapse
their slot/gap completely when absent. An AI signifier is allowed only for real
suggested, generated, automated or confidence-bearing behavior; decorative
sparkle inflation is forbidden. Removing it must preserve balance, accessible
name and task priority.

Importing from `@rottay/design-system/icons` is not itself proof of compliance:
the historical named catalog is compatibility-only. R0 must replace generic
`TagIcon` reuse and functional unicode/span stand-ins in the reference lab with
the supplier-independent semantic `Icon` facade or a focused generated semantic
pack. R2–R4 repeat that drain per family, R5/R6 close the full
Modern-reachable corpus and R7 replays closure after its changes. A universal
square icon well, arbitrary local SVG, emoji,
external provider or hardcoded optical treatment is a veto; allowed vector
geometry is limited to charts/data, QR/barcode/progress/rating, governed marks,
user media and proven non-functional structure. In charts this exception covers
encoded marks, axes and structural drawing only; toolbar actions, interactive
legend controls, statuses, annotations and navigation still use semantic
`Icon` roles.

Premium does not require a border or shadow on every region. Borderless, ruled
and elevated compositions are all valid, but each visible footprint needs
purposeful grouping, anatomy and hierarchy. A rounded outline around loose text
or a colored rectangle masquerading as a completed chart remains a failure.

The current BitHire and The Management palettes are rejected as targets.
BitHire is rebuilt as a restrained cool-neutral professional workspace with
clean surfaces, deep ink and one disciplined action-blue hierarchy. The
Management is rebuilt as an independently desirable paper/near-white,
near-black, grayscale and rule-led ledger with accessible semantic exceptions.
Both travel through the existing static/DB tenant authority.

##### 7.1 Anatomy and composition

- one clear root and stable semantic parts;
- header/body/footer/action anatomy where applicable;
- no invalid HTML, wrapper pollution or hydration mismatch;
- no reconstructed Button/Input/Card/Table behavior inside higher layers;
- nested components preserve ownership and do not fight specificity;
- primitives compose into patterns, patterns into structures, structures into surfaces.


##### 7.2 Typography

- deliberate display/page-title/section/body/supporting/label/caption/code/numeric roles;
- stable line-height, letter-spacing, weight and optical alignment;
- tabular numerals where data comparison matters;
- long EN/ES/AR content and high type-scale without collision;
- never wrap a word per character merely to preserve a fixed column;
- truncation only when the full value remains available through a deliberate interaction.

##### 7.3 Geometry, edge and shape

- nested radius grammar;
- button/control silhouette coherence;
- contextual hairlines, seams, dividers, inset rules and selected/current posture;
- border widths remain within expressive and accessibility floors;
- no random pill proliferation;
- editorial and technical profiles differ structurally, not just by color.

##### 7.4 Material, background and depth

- coherent canvas/shell/panel/card/inset/control/raised/overlay model;
- one light/elevation logic per profile;
- backgrounds may use restrained gradients, tint, highlights, ruled grids, dots, paper/noise or texture only through protected content zones;
- text and data contrast must not depend on decorative imagery;
- no blanket glass, glow or gradient as a shortcut for premium.

##### 7.5 Spacing, density and adaptive size

- rhythm and density affect composition rather than scaling isolated pixels;
- controls and text retain usable proportions;
- grids use intrinsic sizing, `minmax`, `clamp`, auto-fit, container queries and explicit priority;
- resizing cards/widgets redistributes tracks and spans without dead gaps;
- token changes cannot create overlap, orphan whitespace or broken pagination.

##### 7.6 Responsive and mobile product posture

- validate 320, 390, 768 and 1,440px plus narrow containers inside wide pages;
- mobile is simplified by priority, disclosure and stacking;
- data tables use column priority, frozen identity, card/row projection or detail disclosure; never squeeze six desktop columns into 390px;
- touch targets, safe areas, keyboards, coarse pointers and thumb reach are deliberate;
- sticky elements know their actual scroll container or remain deterministic.

##### 7.7 Interaction and motion

- rest, hover, pressed, focus-visible, current, selected, disabled, read-only, loading, success, warning, error and destructive states;
- drag, resize, reorder, disclosure, optimistic actions and progress completion where relevant;
- motion uses semantic recipes and communicates continuity;
- reduced motion, reduced transparency and forced colors preserve meaning;
- no perpetual decorative animation;
- haptic intent belongs behind an app bridge, never direct device APIs in core.

##### 7.8 Icons and multimodal meaning

- only the DS semantic icon system;
- no downloaded SVGs, emoji substitutes or a second icon provider;
- role/state/size/weight follow icon policy and profile;
- status meaning uses color plus icon/shape/label;
- icon wells and alignment are purposeful, not universal decoration.

##### 7.9 Accessibility and localization

- semantic names and relationships;
- complete keyboard flow and focus return;
- no color-only state;
- EN/ES/AR RTL as first-class layouts; FR/PT catalog parity preserved;
- zoom and type-scale resilience;
- overlay focus, Escape, top layer and background inertness are correct.

##### 7.10 Lifecycle and data states


- loading reserves final footprint;
- empty state explains the condition and recovery;
- partial/error/retry states do not destroy surrounding layout;
- late data does not cause avoidable layout shift;
- streaming/AI surfaces expose provenance, confidence, cancel and retry without decorative AI glow.

##### 7.11 White-label divergence

The same tree must diverge across at least six independent axes when the family supports them:

1. typography;
2. geometry/radius;
3. edge/divider grammar;
4. material/elevation;
5. density/rhythm;
6. icon treatment;
7. motion;
8. motif/background;
9. responsive composition;
10. family anatomy/recipe.

No tenant selectors, conditional TSX, duplicated markup or separate CSS systems are allowed.

#### 8. Parallel execution architecture

##### 8.1 Agent count is computed, never fixed

“Twenty agents” expresses desired scale, not a role topology. Before every
cohort Claude builds the conflict graph defined in
`agent-orchestration.json`: nodes are family lanes with exact read/write sets;
edges represent shared files, authorities, parent/child anatomy, i18n, tests,
generated outputs or shared channels/recipes. Claude executes the largest safe
independent set permitted by available slots. The result may be 3, 8, 20 or
another useful number.

Architecture integration and quality/test/i18n/documentation integration are
singleton serial owners. Reviewers run after writers and never edit the files
they review. Throughput is measured in families clearing their own rubric, not
in active agents, token count or files touched.

##### 8.2 Reserved files — integrator only

Family writers may not edit:

- `package.json` or exports;
- public barrels and registries;
- BrandTheme/TenantTheme contracts and compilers;
- capability registries and bounds;
- hooks manifest;
- prototype/preservation ledgers;
- customization census/reconciliation;
- shared i18n catalogs;
- gates, baselines, snapshots and tests;
- generated token documentation;
- generated artifacts, `styles/*.css` and `dist/**`;
- the official audit ledger.

Writers submit concise change requests for those files. The integrator applies approved shared changes once per batch.

##### 8.3 Per-agent efficiency rules

- read the assigned family, immediate composition parents and current tokens;
- do not read the whole repository;
- do not run builds, full typecheck, lint, suites, gates or browser matrices;
- do not write long narrative reports;
- do not touch a family solely to create a diff;
- use one compact handoff: files, observable changes, reused controls, prototype requests, expected deltas, blockers;
- return immediately when the assigned family is already reference-grade, with concrete evidence;

- the coordinator runs at most one cheap scoped check per batch and leaves certification to Codex.

#### 9. Round R0 — dynamic read-only census and instrumentation

Before family writes, cover these inspection domains with as many disjoint
scouts as are useful; one scout may own multiple related domains and no fixed
count is required:

1. worktree/HEAD/stash/foreign-WIP preservation;
2. static BrandTheme authority;
3. DB TenantThemeDocument authority;
4. compiler/profile/recipe parity;
5. token tiers, hooks and prototype state;
6. typography and type-scale propagation;
7. color/material/elevation propagation;
8. geometry/radius/edge propagation;
9. spacing/density/rhythm propagation;
10. motion/icon/responsive propagation;
11. display primitives;
12. input primitives;
13. feedback/overlay primitives;
14. layout/navigation/foundation primitives;
15. data/forms patterns;
16. communication/workflow/navigation patterns;
17. charts and visualization;
18. structures;
19. surfaces/composition/commercial;
20. same-tree BitHire/TMM canary and current visual failures.

The lead produces one ownership/conflict manifest from these reports. Scouts do
not edit family code. R0 also upgrades quality evidence from the existing
primitive subset to the 252-family v2 contracts and establishes an honest
baseline with zero premium claim.

R0 must additionally: resolve all 252 source/public-export chains before lane
assignment; census `OverlayModal`, `BrandTheme.engineBridge` and
`ComponentExtensions`/`EngineAwareProps.extensions`; prove that a document
with 201 Advanced token overrides fails with one named error rather than being
silently truncated; label quality-evidence v1 historical; reconcile stale icon
profile comments and generated lifecycle/read-count wording; and measure the
reach of the existing edge/material/motif/icon/motion vocabulary before any
new public concept can be proposed. The current registry explicitly records
WO-CRA-23 as an owner-authorized standalone program, so this gated R0-R7
program is the narrow authorized exception to the earlier inventory-wide
freeze; normal roadmap claim semantics still apply.

#### 10. Round R1 — reference grammar before broad propagation

R1 runs exclusively in the showroom-owned `/probe/ds-reference` laboratory.
The lab reuses one deterministic hardcoded DS catalog across eight scenes
(`primitives`, `forms`, `data`, `workflow`, `dashboard`, `shell`, `surfaces`,
`all` coverage atlas) and renders BitHire static versus The Management DB in separate document
roots. It must not import or depend on app-bithire, Candidates, product APIs,
product fixtures or app CSS. Product screens become downstream integration
checks only after their DS layers have passed the relevant round. Complete
coverage is the union of the focused scenes; mounting all 252 families in one
DOM is explicitly rejected as a non-iterable evidence strategy.

El bootstrap inicial ya reprodujo dos defectos R0: el substrate sigue siendo
un módulo monolítico de 5.796 líneas con cold compile de minutos, y el primer
frame SSR pinta el ground dark/default antes de hidratar BitHire o The
Management light. R0 debe separar imports/render por escena sin duplicar el
árbol y debe hacer que first paint y settled tenant paint sean idénticos.

Do not spread styling across 252 families until these twelve canaries establish reusable grammar. Attack Button, then PatternDataTable, then AppShell first; they are the first-failing grammars consumed by the remaining canaries:

1. Button + action cluster;
2. Input/Select/FormField compound field;
3. Card + SemanticSurface;
4. Modal/Drawer + Popover/Dropdown;
5. ListToolbar + SavedViews + filters;
6. PatternDataTable + mobile projection;
7. CollectionHeader + PageShell;
8. Dashboard + MetricCard + WidgetBoard;
9. Chart frame + line/bar + tooltip/legend;
10. lifecycle feedback family;
11. AppShell + sidebar + BottomTabBar;
12. record/detail composition.

Each canary must eliminate its dominant product defect, prove responsive resilience and demonstrate material BitHire/TMM divergence. The lead then extracts reusable recipes and assigns their downstream families. No propagation occurs from a canary that still overlaps, clips, wraps per-character or reads as recoloring only.

#### 11. Round R2 — primitives batch

Use these disjoint ownership bundles. The lead may split a bundle only when files remain disjoint.

| Lane | Families |
|---|---|
| P01 | Typography, Badge, Tag, Kbd, Callout |
| P02 | Avatar, Image, QRCode, CodeBlock, MarkdownView |
| P03 | Table, List, Tree, Descriptions, Statistic |
| P04 | Calendar, Carousel, Timeline, Tooltip, Empty |
| P05 | Button, Toggle, Checkbox, Radio, Switch |
| P06 | Input, Textarea, PasswordInput, OTPInput, Mentions, TagInput |
| P07 | Select, AutoComplete, Cascader, TreeSelect, Transfer |
| P08 | InputNumber, Slider, ColorPicker, DatePicker, TimePicker |
| P09 | Form, FormField, Upload, VoiceInputButton |
| P10 | Alert, Message, Notification, Toast, Result |
| P11 | Progress, Rate, Skeleton, Spinner |
| P12 | canonical Modal, Drawer, Sheet |
| P13 | Popover, Dropdown, ContextMenu, HoverCard, Popconfirm |
| P14 | AlertDialog, ConfirmDialog, Tour, Watermark |
| P15 | Box, Stack, Flex, Grid, Space, Divider |
| P16 | Container, AspectRatio, Collapse, ScrollArea, Splitter, Layout, Show, Hide, ResponsiveSlot |

| P17 | Link, Anchor, Breadcrumb, Pagination, Tabs, Segmented |
| P18 | Menu, Stepper, Steps, Affix, BackTop, FloatButton |
| P19 | IconFrame, Meter, ResizeHandle, VisuallyHidden, LoadingIndicator, SemanticSurface |
| P20 | read-only cross-family reviewer: icon policy, focus, RTL, touch, invalid DOM and recipe coherence |

Exit: 100 canonical public primitives classified, compatibility aliases separately censused, zero accidental public token names and no family closed by token substitution alone.

#### 12. Round R3 — patterns and charts batch

| Lane | Families |
|---|---|
| Q01 | PricingTable |
| Q02 | ActivityLog, LiveFeed, Presence kit (`PresenceBar`, `PresenceTypingIndicator`, `LiveCursor`) |
| Q03 | Assistant kit (`AssistantStatusBadge`, `AssistantStatusIndicator`, `StreamingText`, `TypingIndicator`, `ToolCallCard`, `PreviewDiffCard`, `ConfirmActionCard`, `MessageBubble`), CommentThread, NotificationCenter |
| Q04 | TenantPreview, TokenInspector, BrandingPreviewSandbox, PatternBrandStudio |
| Q05 | PatternDataTable, TableCheckboxStyles, CellRenderers |
| Q06 | PatternGridView, PatternGalleryView, VirtualList |
| Q07 | ListToolbar, ColumnSettings, SavedViews, StatusFilterPills, BulkSelectToggle |
| Q08 | DecisionComparison, DecisionPanorama, DetailPanel, RecordFacts |
| Q09 | FileManager, WidgetBoard, PatternStatsGrid |
| Q10 | PatternFormBuilder, FilterBuilder, FilterPanel |
| Q11 | StepWizard, InvoiceTemplate, EmptyState (compose canonical primitive `Empty`, never rebuild it), AdaptiveOverlay |
| Q12 | CommandPalette, ShortcutsOverlay, EnvironmentToggle, PatternLocaleSwitcher, WorkspaceSwitcher |
| Q13 | UserProfileCard, CockpitHeader, FeatureWorkspaceFrame, PatternPageShell, WorkbenchHeader |
| Q14 | PatternCalendarView, PatternMapView, PatternTimeline, PatternTreeView, PatternKanbanBoard |
| Q15 | shared chart scaffold, AreaChart, BarChart, LineChart |
| Q16 | PieChart, ScatterChart, RadarChart |
| Q17 | GaugeChart, Histogram, FunnelChart, WaterfallChart |
| Q18 | SankeyChart, GanttChart, NetworkGraph |
| Q19 | Sparkline, CalendarHeatMap, HeatMap, TreeMap, BulletChart |
| Q20 | ApprovalInbox, ApprovalWorkflow, OperationalLedger, ModerationGallery, ShiftMatrix |

Patterns must compose primitives rather than rebuild them. Charts must diverge through plot surface, grid, axes, markers, labels, legend, tooltip and annotation — not merely series color.

#### 13. Round R4 — structures, surfaces and composition batch

| Lane | Families |
|---|---|
| R01 | CollectionHeader, DashboardHeader, DetailHeader, EditHeader, FormHeader, MobileHeader |
| R02 | ActionDock, ActiveFiltersBar, FieldFiltersPanel, ExportButton |
| R03 | ConnectedCommandPalette, SearchCommandBar, SavedViewsMenu, ScopeSwitcher |
| R04 | SelectionPreviewRail, TableToolbar, ViewModeSwitcher, ColumnMenu |
| R05 | Record content, FormSections, EditFields |
| R06 | StatsHeader, DataTerminalCard |
| R07 | DashboardInsights, LoadingOverlay |
| R08 | AppShell, BottomTabBar |
| R09 | PageShellSurface, HeaderSurface, WorkspaceShell, SidebarSurface |
| R10 | AuditSurface, BillingSurface, SettingsSurface, ProfileSurface |
| R11 | FileBrowserSurface, ImportExportSurface, IntegrationSurface, TeamSurface |
| R12 | ListSurface, SearchSurface |
| R13 | DetailSurface, CompareSurface |
| R14 | DashboardSurface, ReportSurface, VisualizationSurface |
| R15 | AuthSurface, OAuthTransitionSurface, EmptyStateSurface |
| R16 | ChatSurface, EditorSurface, MediaSurface, NotificationSurface, MarketingSurface, PricingSurface |
| R17 | DetailFormSurface, FormSurface, GuidedDraftFormSurface, WizardSurface, OnboardingSurface |
| R18 | ActivitySurface, KanbanSurface, OperationalSurface, SchedulerSurface |
| R19 | CollectionWorkspaceSurface, CommandCenterSurface, DecisionInboxSurface, RecordWorkbenchSurface |
| R20 | 11 commercial-kit components, preserving their separate entrypoint and preventing a second general product engine |

Structures organize page chrome; surfaces compose full screens; neither may absorb product-domain logic. Apps retain data, routes, permissions, product copy and entity mapping.

#### 14. Round R5 — canon reconciliation

After all family batches, the architecture integrator must process every proposal exactly once:

1. diff all new names and synonyms against the generated token catalog;
2. reject duplicate public authority;
3. reconcile prototypes using the vocabulary in section 6;
4. preserve Kimi capabilities or record successor/death proof;
5. update static and DB contracts together for approved promotions;

6. ensure Standard remains small and high-impact;
7. ensure Pro remains curated by family/profile, not hundreds of raw fields;
8. add Expert entries only when a bounded advanced override is genuinely needed;
9. regenerate manifests/catalogs once after source is frozen;
10. do not regenerate dist/styles repeatedly while writers are active.

Required resulting documentation truths:

- no active prototype is described as retired and no retired row is presented as active;
- Expert is 294 unless the canonical allowlist intentionally changes;
- current hook/read counts are generated, not hand-copied into guides;
- manual authoring/app guides must stop publishing the stale 2,706-read and 71/color-only Expert claims;
- lifecycle documentation must say that the 80 prototype-ledger rows are retired historical decisions, not 80 live prototypes;
- the active docs describe architecture; the audit ledger describes execution state;
- the Showroom registry drift is either fixed or explicitly retained with owner and reason.

#### 15. Family work-order template

The lead gives every writer this exact compact contract:

```text
LANE:
OWNED FAMILIES:
OWNED FILES/GLOBS:
READ-ONLY DEPENDENCIES:
DOM/ANATOMY DEFECTS BY SEVERITY:
VISUAL/UX DEFECTS BY SEVERITY:
DOMINANT PRODUCT DEFECT:
BEFORE SCORE + RECEIPT FOR ALL APPLICABLE DIMENSIONS:
APPLICABLE STATES/STRESS MATRIX FLOOR:
STANDARD CONTROLS USED:
PRO CONTROLS/RECIPES USED:
EXPERT CHANNELS USED:
PRIVATE CHANNELS USED:
NEW PROTOTYPE REQUESTS:
RESPONSIVE STRATEGY:
MOBILE SIMPLIFICATION:
INTERACTION/MOTION STATES:
RTL/A11Y/FORCED-COLORS:
EXPECTED BITHIRE/TMM DIVERGENCE:
PRODUCTIVE SOURCE DELTAS BY DEFECT/PART/PROPERTY:
AFTER SCORE + RECEIPT FOR ALL APPLICABLE DIMENSIONS:
UNCHANGED-DIMENSION 4/5 PROOF:
STATIC/DB CAUSAL MUTATION + EXACT RESTORE:
REMAINING P0/P1 DEFECTS:
FILES ACTUALLY CHANGED:
BLOCKERS/INTEGRATOR REQUESTS:
STATUS:
```

If a lane cannot fill the defect ledger, before score, responsive strategy,
stress floor and divergence fields, it is not ready to edit. If it cannot fill
the material-delta and after-proof fields, it is not elevated regardless of
how many files it touched.

#### 16. Coordinator validation policy

Claude coordinates and develops; Codex certifies.

Claude must:

- inspect every agent diff against declared ownership;
- reject undeclared shared-file edits;
- reject shallow “visited” changes;
- run `git diff --check` centrally after each batch;
- run at most targeted syntax/type checks needed to avoid handing off broken code;
- keep a running list of expected visual deltas and owner decisions;
- stop a lane that starts writing tests, generated artifacts or app overrides to conceal a DS defect.
- implement only three representative families when calibrating a new layer or
  shared grammar, then stop for explicit Codex GO;
- stop after every closed cohort in `visual-craft-contract.json`, never more
  than twenty-five families between Codex checkpoints;
- invalidate and repeat dependent checkpoints when a shared palette, recipe,
  anatomy or composition grammar changes after calibration.

Family writers must not spend each lane on full builds, suites, gates or
screenshots, and they never edit shared tests. At the end of every round, the
singleton quality integrator must update observable contracts, negative drills,
i18n catalogs/parity and active/generated documentation for the completed
scope. A test is respecified only when it pins obsolete private anatomy; it is
never weakened to preserve a regression.

Claude runs bounded round-level source checks and produces hashed evidence. The
full serial, bundle regeneration, app build, browser matrix, screenshots,
acceptance and audited local commit belong to Codex at every stop/go boundary.
This program never pushes.

#### 17. Round R6 — Codex audit matrix

Claude's handoff must leave enough evidence for Codex to run:

- DS typecheck, lint, gates and full suite in memory-safe chunks;
- a single source→artifact rebuild and stale check;
- app-bithire typecheck/build and focused contracts;
- DOM validity and hydration checks;
- BitHire/TMM same-tree captures at 320, 390, 768 and 1,440px;
- Standard: compact/balanced/expansive, tight/normal/airy, type-scale bounds;
- Pro: expressive profiles, anatomy, recipe and responsive posture;
- Expert: selected override propagation and invalid-name rejection;

- EN, ES, AR RTL, large text, coarse pointer, reduced motion, reduced transparency and forced colors;
- loading, empty, partial, error, success, drag and resize states;
- grayscale three-second differentiation test;
- no per-character headers, overlap, clipping, inaccessible truncation or dead grid space.

#### 18. Round R7 — customization depth, tenant distinctiveness and catalog parity

R7 is an owner-authorized post-certification extension. It starts only from a
Codex-accepted frozen R6 tree and may not weaken or silently reclassify any
R0-R6 outcome. Its detailed executable contract is
`packages/core/scripts/quality-evidence/programs/modern-rescue/R7-CUSTOMIZATION-10-10.md`.

R7 uses public systems as non-normative references: Spectrum CSS for
base/theme/context and modifier-fallback ideas; PatternFly for naming
discipline; Material Web for reference/system/component layering; React Aria
and Base UI for accessible behavior, parts, slots, focus and state edges; DTCG
for typed interchange. Existing Rottay names and authorities win whenever they
already represent the same semantic decision. R7 never copies wholesale CSS,
markup, components, names, visual identity or trade dress.

The round executes eight gated waves:

1. freeze and reproduce R6, regenerate the live census and disposition every
   benchmark idea against the local 252-family catalog;
2. close the complete Modern token/CSS writer-reader graph, including dead,
   unowned, disconnected, generated-only and dormant public channels;
3. record all 252 family roots/parts/states/property groups, eligible and
   invariant axes, fallbacks, restore digests, static/DB probes, responsive,
   i18n, accessibility and SSR/portal obligations;
4. reconcile the six current recipe families into all fourteen target
   semantic groups, requiring two productive families and two plausible tenant
   postures per admitted group;
5. prove five coherent non-product reference postures and all ten pairwise
   comparisons on at least eight observable and six non-color axes, including
   grayscale and neutralized-primary review;
6. productize Standard, Pro and Expert authoring without growing raw control
   authority for editor convenience;
7. disposition external catalog gaps as already equivalent, improve existing,
   propose capability, propose separately owned new-family follow-on or reject;
8. repeat independent frozen-tree machine, browser, posture, parity, restore,
   accessibility, responsive and performance certification.

The fixed 252 denominator remains unchanged during R7. A genuinely missing
family requires a separate owner-approved work order after the gap census.
Existing families are improved in place. Standard stays at 13 unless an
independently admitted control remains under the owner maximum of 15; Pro stays
at seven capability IDs with 20-30 grouped editor fields; Expert remains the
exact bounded searchable vocabulary rather than hundreds of sliders.

R7 runs with one Opus MAIN, at most one read-only Fable advisor and at most two
disjoint Sonnet mechanical writers. Shared contracts, compiler, recipes,
generated CSS, i18n merge, harness and canon retain one writer. There is one
heavy build/test, one server and one Chromium. MAIN works in long
checkpoint-sized iterations and lanes return durable JSON receipts before
releasing ownership.

R7 exit requires: 252/252 complete customization dispositions; 14/14 productive
recipe groups; coverage, resilience, canonClosure, pathParity and static/DB
exact restore equal 1; unknown targeted impact, dead/unowned Modern CSS and
dormant public channels equal 0; five posture and ten pairwise matrices green;
no BitHire/TMM or R6 regression; zero hard vetoes; fresh source-bound evidence;
and Codex sighted approval. R7 produces local audited commits only and never
pushes.

#### 19. Required round and final handoffs from Claude

One consolidated coordinator report is required per round; raw agent narratives
are not copied into the roadmap. The report uses
`ROUND-REPORT-TEMPLATE.md`, is stored under the hashed evidence root and is
referenced by one `roadmap:status progress` entry. The final handoff
accumulates the accepted round evidence. Every report must contain:

1. verdict `IMPLEMENTED_PENDING_CODEX_AUDIT` or honest blocked status;
2. start/end HEAD, porcelain and stash counts;
3. exact families by final status;
4. exact files by lane;
5. canary reference grammar extracted;
6. Standard/Pro/Expert usage by family;
7. every prototype proposal and adjudication;
8. every Kimi capability preserved, connected, merged or blocked;
9. every public API/contract change;
10. responsive/mobile strategies by family;
11. state/motion/accessibility work;
12. expected BitHire/TMM deltas;
13. shared-file changes applied only by integrator;
14. registry/documentation drift fixed or retained;
15. unresolved architecture and product decisions;
16. declared non-goals and untouched areas;
17. scoped checks actually run with real exits;
18. explicit confirmation: no push, publish, tag, stash mutation or destructive
    git operation; local commits belong only to Codex after acceptance.

#### 20. Stop conditions

Stop and report rather than improvise when:

- HEAD or worktree ownership cannot be reconciled;
- two writers touched the same file;
- a change requires app-domain knowledge;
- a public control would need to be added without static/DB parity;
- a tenant-specific selector or TSX branch appears necessary;
- a family requires restoring Daisy/Ant CSS or external icon providers;
- a generated artifact must be edited by hand;
- an existing Kimi capability seems removable but lacks successor/death proof;
- the family cannot meet responsive requirements without a product-level decision.

Do not stop for ordinary type errors, hard implementation work or the size of the inventory. Repair in scope, reassign a failed lane and continue through the current batch.

#### 21. Launch prompt for the Claude coordinator

The canonical bootstrap prompt is:

`packages/core/scripts/quality-evidence/programs/modern-rescue/CLAUDE-PROMPT.md`

The prompt, `program.json`, `family-inventory.json`,
`quality-rubric.json`, `customization-model.json`, `rounds.json`,
`agent-orchestration.json` and `evidence-contract.json` are one binding
execution packet. Claude must run the program contract and its negative drills,
claim WO-CRA-23, and execute only the owner-authorized round supplied in the
launch instruction. The bootstrap contains no default write-authorized round.
No coordinator may cross a round boundary without the preceding Codex audit
and explicit owner GO; R7 additionally requires the accepted frozen R6 entry.
