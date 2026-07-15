---
title: "Design System Architecture Lane — Headless Core, CSS-First Skins, and API Normalization"
date: 2026-07-07
status: canonical
audience: ai-agent
sources:
  - roadmap/proposals.md (owner-review inbox; P-01, P-02, P-08, P-13 APPROVED 2026-07-07 — the source specs for this lane)
  - roadmap/engine-modern.md (WO-ENG-04 state tokens, WO-ENG-11 premium signature + release note, WO-ENG-12 responsive law — the ENG lane this lane sequences AFTER)
  - roadmap/gates.md (WO-GAT-01 visual-regression CI — the safety net every WO here runs behind)
  - ui-design-system/CLAUDE.md (architecture contract: 4-tier taxonomy, createEngineComponent runtime factory, BrandTheme white-label chain)
---

# Design System Architecture Lane

This lane carries the **architecture restructure** the owner approved from the proposals inbox
on 2026-07-07: the P-01 headless behavior core + P-02 CSS-first styling program (piloted, then
fleet), the P-13 component API normalization that precedes it, the P-01 custom-engine skin pack
API, and the P-08 container-query/fluid-scale mechanism upgrade. It unwinds the three structural
defects named in the proposals' architecture verdict — full per-engine forks that dilute quality
3-4x, inline-style rendering that blocks real `:hover`/`:focus-visible`/pseudo-elements/container
queries, and behavior re-implemented per engine — while keeping multi-engine intact as the
product decision it is.

**Owner sequencing law (2026-07-07, verbatim): modern goes premium FIRST; the architecture
restructure comes LATER.** This lane encodes that law in its dependencies and it must never be
weakened: **WO-ARC-03 (the fleet migration) has a HARD dependency on WO-ENG-11** — the premium
uplift completes and the owner signs off the signature gallery before the fleet is restructured —
and **WO-ARC-02 (the pilot) carries a start-order note: recommended to claim only after WO-ENG-11
certifies unless the orchestrator explicitly coordinates disjoint Files windows** (both lanes
edit the same modern engine skin files; the ENG lane holds the pen on them until it closes).

Three invariants, binding on every WO (owner clarification recorded in P-01):

1. **classic (Ant Design) is never touched.** antd brings its own behavior; classic stays a
   wrapper and remains the bithire-stability engine. Every WO's gate includes a zero-diff proof
   on classic engine files.
2. **Apps see zero API change through `createEngineComponent`.** The runtime factory
   (`packages/core/src/runtime/engines/factory.tsx`) lazy-loads per-engine implementations from
   `engines/{classic,modern,rustic}` loaders, so migration is per-component and invisible to
   consumers; public props stay the (ARC-01-normalized) contract.
3. **The Quiet Premium look is preserved as the modern skin.** Everything the WO-ENG-01..12
   uplift built — tokens, elevation, states, effects, signature — IS the modern skin; this lane
   moves behavior and styling MECHANISM, never appearance. The WO-GAT-01 visual diff proves it:
   zero unapproved pixel change on migrated components.

Lane-wide rules (binding on every WO):

- Repo: `/Users/daniel/Developer/Rottay/ui-design-system` (macOS, pnpm). All paths below are
  relative to the repo root unless prefixed. Component/behavior source lives in
  `packages/core/src/`; the render surface is `packages/showroom` (`@rottay/showroom`).
- **Gates are truth.** A WO is done when its acceptance gate passes AND the DS build/tests are
  green: `pnpm --filter @rottay/design-system run build` + `pnpm test` (root `test` runs
  `@rottay/design-system`'s suite). Executors are **edit-only**; the orchestrator certifies and
  commits. No WO commits.
- **The DS is a published package.** Editing `packages/core/src` does NOT change what any
  consuming app renders until a release + repin. No WO here publishes or repins; consuming-app
  codemods are RECORDED for the app orchestrators, never run against the apps.
- **Every migration step leaves a deployable state** (non-negotiable rule 7 of the system
  ownership contract): a category, a pilot component, or an API sweep is either fully landed
  with green gates or not landed; no half-migrated component ships.
- **The visual-regression suite from WO-GAT-01 is this lane's safety net.** Every WO that
  touches a rendering path runs it and resolves every diff as either "approved zero-visual-delta
  refactor artifact" (anti-aliasing-level) or a defect. WO-GAT-01 (roadmap/gates.md) creates the
  runner and registers its command in `package.json`; run it as registered there.
- **Sighted check is mandatory for every visual WO.** Run the showroom
  (`pnpm --filter @rottay/showroom run dev`, http://localhost:7001), capture the affected
  surfaces before/after under **both tenant palettes — a dark-surface tenant (rottay,
  `--ds-color-bg-primary: #0A0A0C`) AND a light-surface tenant (bithire or evnto)** — to
  `test-artifacts/architecture/<wo>/`, then actually LOOK at the PNGs. There is **no user-facing
  light/dark toggle** (owner decision 2026-07-07): the tenant palette decides the surface; both
  captures come from switching tenant via nested `DesignSystemProvider` columns.
- **The ratchet is `scripts/engine-token-audit.mjs`** (created by WO-ENG-01). WOs below EXTEND
  it with new counters (off-canon vocabulary, inline-state literals, anatomy coverage) — never
  fork it or create a parallel audit script.
- **Tenant-artifact rule (inherited).** `tokens/css/artifacts/**` are `compileBrandTheme`-generated
  snapshots of `tokens/ts/brand-themes/*.ts`. Any WO that changes a `--ds-*` token the compiler
  emits or that appears in an artifact must update the compiler/BrandTheme mapping, regenerate
  the snapshots in the same WO, and keep the `compilers/brand-theme` suite green.
- **Anti-sprawl.** New work = a new `### WO-ARC-NN` block in this file + a `registry.json`
  entry (`pnpm roadmap:check` forces the pairing). No new plan documents.
- No emojis anywhere. Repo docs in English. Never `git checkout/restore/reset` on directories.
  `app-bithire`, `docs-engineering`, and the other app repos are READ-ONLY references. The
  showroom dev server is allowed.

Ordering is the owner's law: ARC-01 first (it only reshapes TYPES and ships behind the GAT-01
diff, so it can run while the ENG lane finishes, on disjoint Files); ARC-02 after ENG-04 + GAT-01
+ ARC-01 and preferably after ENG-11 certifies; ARC-03 strictly after ENG-11; ARC-04 and ARC-05
after the fleet is on the core.

---

## WORK ORDERS

### WO-ARC-01 Component API normalization
- **AMENDMENT 2026-07-09 (what the code said back)** — four of this WO's factual claims did not survive contact:
  1. **Step 1 is impossible as written.** It instructs adding `Variant = 'solid'|'soft'|'outline'|'ghost'|'link'|'text'` to `contracts/common/index.ts`. That name is already taken at `:30` with semantic values, is publicly exported, and is imported by Badge, Tag, Avatar, Button and **Toast**. A second declaration is a duplicate-identifier error; redefining the existing one would silently invert `ToastVariant = Variant | 'info'`. The WO's own quoted line range (21-24) stops one line short of the collision. Resolution: `Variant` left byte-identical and `@deprecated`; a new `Tone` type added.
  2. **Six raw antd size unions, not five.** `ColorPicker.types.ts:53` has the byte-identical defect and is unnamed by the WO. Two further duplicate size vocabularies exist in files the WO never lists — `tokens/ts/components/space.ts` and `tokens/ts/components/collapse-token-utils.ts` — invisible until now because they never shared a barrel with the component types they shadow.
  3. **"No tone axis exists anywhere" is true of the name, not the capability.** Badge already shipped `variant` (semantic) beside `badgeStyle` (structural). The split existed; it lacked a name.
  4. **The acceptance gate contradicts step 1.** The gate demands an empty classic-engine diff; step 1 says the antd size translation "moves inside the classic adapters". There was no translation in classic to move — every classic engine passed `size` straight to antd. Honouring the gate literally would leave `<Collapse size="sm">` correct in modern and rustic and silently misrendered in classic: the exact one-engine-drops-the-prop bug this program has found repeatedly, caused this time by the gate's own wording. The executor added `toLegacySize()` to the six classic engines instead. With `tone` and the canonical sizes absent — which is every caller today — rendering is bit-identical, and `test:gates` 63/63 with zero pixel movement is the proof.
  Also: the WO's Files list points at `scripts/engine-token-audit.mjs` and a root `scripts/codemods/`. Both live under `packages/core/scripts/`.
- **Outcome** — ONE size/tone/variant vocabulary across all primitives and patterns, type-enforced from `packages/core/src/contracts/common/index.ts`: every component `size` derives from the canonical `Size` union (per-component subsets via `Extract`), a semantic `tone` axis is separated from the structural `variant` axis, duplicate type declarations are collapsed to single sources, deprecated prop aliases keep compiling (with `@deprecated` JSDoc) for exactly one release, and consuming-app codemods are recorded under `scripts/codemods/`. Zero rendering change — the WO-GAT-01 diff proves it.
- **Why** — P-13 (proposals.md, APPROVED 2026-07-07): "API consistency is what makes a DS feel designed; it is also what lets agents build correct UIs without reading every prop table." Verified divergence: `packages/core/src/contracts/common/index.ts:21-24` ships TWO parallel size vocabularies — `Size = 'xs'|'sm'|'md'|'lg'|'xl'|'2xl'|'3xl'` AND the antd-style `SizeType = 'small'|'middle'|'large'|'default'`. Five primitive types files still declare raw `'small' | 'middle' | 'large'` unions inline: `components/primitives/layout/Collapse/Collapse.types.ts`, `layout/Space/Space.types.ts`, `inputs/TreeSelect/TreeSelect.types.ts`, `inputs/AutoComplete/AutoComplete.types.ts`, `inputs/Cascader/Cascader.types.ts`. `TabsSize = 'sm' | 'md' | 'lg'` (`primitives/navigation/Tabs/Tabs.types.ts:109`) is an ad-hoc union not derived from `Size`. `ButtonSize` is declared TWICE (`primitives/inputs/Button/Button.types.ts:67` as `Size`; `tokens/ts/components/button.ts:249` as `keyof typeof buttonSize`), and `ModalSize = Size | '4xl' | '5xl' | 'full'` is declared TWICE because two full Modal primitives ship in parallel categories (`primitives/feedback/Modal/Modal.types.ts:215` and `primitives/overlay/Modal/Modal.types.ts:15`, each with its own `engines/`, `compound/`, `tests/`). No `tone` axis exists anywhere in primitives (a grep for `tone?:` over `*.types.ts` returns nothing): semantic color rides structural `variant` unions instead (`BadgeVariant`, `TagVariant`, `CalloutVariant`, and inline unions like `variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'link'`), conflating "what it means" with "how it renders". `Space.types.ts:91` accepts `size?: SpaceSize | number | [number, number]` — a third convention.
- **Depends on** — WO-GAT-01 (roadmap/gates.md — visual protection before a fleet-wide prop sweep; every alias must render pixel-identically and the diff suite is the proof). Independent of the ENG lane by Files (types files vs engine skin files), so it may run while ENG-08..11 are in flight provided the orchestrator confirms disjoint Files windows.
- **Steps** —
  1. Ratify the canon in `packages/core/src/contracts/common/index.ts`: `Size` stays the single size vocabulary; add `Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'` (the semantic axis) and `Variant = 'solid' | 'soft' | 'outline' | 'ghost' | 'link' | 'text'` (the structural axis); mark `SizeType` `@deprecated` (kept one release as an alias union; the classic engine's INTERNAL antd mapping may keep translating canon values to antd's `small/middle/large` — the translation moves inside the classic adapters, out of public prop types).
  2. Sweep the five raw-union files (`Collapse`, `Space`, `TreeSelect`, `AutoComplete`, `Cascader` types) onto `Size`-derived subsets (`Extract<Size, 'sm' | 'md' | 'lg'>` style), keeping the old string values accepted through the deprecated alias union for one release; normalize `TabsSize` to `Extract<Size, 'sm' | 'md' | 'lg'>`; keep `Space`'s numeric/tuple gap form but type the named steps on `Size`.
  3. Collapse duplicate declarations: `ButtonSize` gets ONE declaration (the `Button.types.ts` one; `tokens/ts/components/button.ts:249` re-exports or derives from it); `ModalSize` gets ONE declaration shared by both Modal primitives — and RECORD the `feedback/Modal` vs `overlay/Modal` duplication as a normalization finding in this WO's done evidence (the fleet decision on merging them belongs to WO-ARC-03's feedback/overlay categories; do not merge components here).
  4. Separate tone from variant on the conflated primitives (Badge, Tag, Callout, and any others the sweep finds): add the `tone` prop carrying the semantic values; `variant` keeps/receives only structural values; old conflated variant values remain accepted as deprecated aliases that map to the equivalent tone+variant pair, rendering pixel-identically.
  5. Sweep patterns (`packages/core/src/components/patterns/**`) for `size`/`variant` props that bypass the canon and normalize them the same way; patterns must re-export component subsets, never re-declare unions.
  6. Record codemods for consuming apps under `scripts/codemods/` (ts-morph or jscodeshift scripts, one per rename: `sizetype-to-size`, `variant-tone-split`), each with a dry-run mode and a README naming the release in which aliases are removed. Apps are READ-ONLY — codemods are recorded here and executed by the app orchestrators at repin time.
  7. Extend `scripts/engine-token-audit.mjs` with an `offcanon-vocabulary` counter: raw `'small' | 'middle' | 'large'` unions and duplicate `ButtonSize`/`ModalSize`-style declarations in `packages/core/src/components/**` types files, baseline measured, target 0, decrease-only.
- **Files** — `packages/core/src/contracts/common/index.ts`, `packages/core/src/components/primitives/layout/Collapse/Collapse.types.ts`, `.../layout/Space/Space.types.ts`, `.../inputs/TreeSelect/TreeSelect.types.ts`, `.../inputs/AutoComplete/AutoComplete.types.ts`, `.../inputs/Cascader/Cascader.types.ts`, `.../navigation/Tabs/Tabs.types.ts`, `.../inputs/Button/Button.types.ts`, `packages/core/src/tokens/ts/components/button.ts`, `.../feedback/Modal/Modal.types.ts`, `.../overlay/Modal/Modal.types.ts`, the Badge/Tag/Callout types + engine files touched by the tone/variant split, pattern prop-type files found by the sweep, `scripts/codemods/**` (new), `scripts/engine-token-audit.mjs`.
- **Acceptance gate** — `pnpm --filter @rottay/design-system run build` + `pnpm test` green (including typecheck); `node scripts/engine-token-audit.mjs --check` green with the `offcanon-vocabulary` counter at 0; the WO-GAT-01 visual-regression suite green with ZERO unapproved pixel diff (aliases render identically; run it via the command WO-GAT-01 registered in `package.json`); classic engine files zero diff (`git diff --stat` on `**/engines/classic*` empty); codemod scripts present under `scripts/codemods/` with recorded dry-run output; every removed-in-next-release alias carries `@deprecated` JSDoc naming the replacement.
- **Do NOT** — Do not change any rendered pixel (this is a TYPE sweep; the GAT-01 diff is the proof). Do not remove aliases in this WO (one-release deprecation window). Do not touch classic engine internals beyond relocating the antd size translation into the classic adapters. Do not merge the two Modal primitives here (record the finding; ARC-03 owns the fleet decision). Do not run codemods against any app repo. Never `git restore` directories.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, normalize the component API vocabulary from proposal P-13 (`roadmap/proposals.md`, APPROVED 2026-07-07). In `packages/core/src/contracts/common/index.ts` (which today ships BOTH `Size = 'xs'..'3xl'` at L21 and antd-style `SizeType = 'small'|'middle'|'large'|'default'` at L24): keep `Size` as the single size canon, add `Tone = 'neutral'|'primary'|'success'|'warning'|'danger'|'info'` and `Variant = 'solid'|'soft'|'outline'|'ghost'|'link'|'text'`, and mark `SizeType` `@deprecated` (one release; the classic engine's antd translation moves INSIDE the classic adapters, out of public prop types). Sweep the five raw `'small' | 'middle' | 'large'` union files (`primitives/layout/Collapse`, `layout/Space`, `inputs/TreeSelect`, `inputs/AutoComplete`, `inputs/Cascader` types) onto `Extract<Size, ...>` subsets with deprecated alias unions; normalize `TabsSize` (`navigation/Tabs/Tabs.types.ts:109`); collapse the duplicate `ButtonSize` (`Button.types.ts:67` vs `tokens/ts/components/button.ts:249`) and `ModalSize` (`feedback/Modal/Modal.types.ts:215` vs `overlay/Modal/Modal.types.ts:15`) declarations to single sources, and RECORD the feedback/overlay Modal duplication as a finding (do not merge components). Split tone from variant on Badge/Tag/Callout (+ sweep finds): add `tone` for semantics, keep `variant` structural, accept old conflated values as pixel-identical deprecated aliases. Sweep patterns so they re-export, never re-declare, unions. Record app codemods under `scripts/codemods/` (`sizetype-to-size`, `variant-tone-split`; dry-run mode + README naming the alias-removal release) — apps are READ-ONLY, do not run them. Extend `scripts/engine-token-audit.mjs` with an `offcanon-vocabulary` counter (raw antd unions + duplicate declarations, target 0, decrease-only). Gate: `pnpm --filter @rottay/design-system run build` + `pnpm test` green; audit `--check` green with `offcanon-vocabulary` = 0; the WO-GAT-01 visual-regression suite (command as registered by WO-GAT-01 in `package.json`) green with ZERO unapproved pixel diff; classic engine files zero diff; codemods + dry-run output present. Fences: no rendered-pixel change, no alias removal, no app writes, edit-only, no commits, never git-restore directories, app-bithire and docs-engineering read-only, showroom dev server allowed.

### WO-ARC-02 Headless behavior core + CSS-first pilot
- **AMENDMENT 2026-07-10 (the pilot is one component, not four, and the reason is recorded)** — the behavior core exists and is proven on **Button** across modern and rustic. The other three pilots (Input, Tabs, Modal) are deliberately not started here, and the CSS-first skin migration is not started at all. Both are honest scope calls, not omissions:
  - The contract had to be proven before it was applied. Proving it on one component with two skins is the smallest thing that can falsify it; proving it on four is the fleet migration WO-ARC-03 already owns.
  - The inline-style-to-CSS migration is a pixel-identical rewrite of four components across two engines. It cannot be certified honestly in the same pass that introduces the abstraction it depends on, because a pixel diff would then have two possible causes.
- **WHAT THE CODE SAID BACK** — the WO's premises hold: `packages/core/src/behavior/` did not exist, no `data-part` convention existed anywhere, and the pilot four each carried four `useState` calls per interactive engine while `classic` delegates to antd and carries none. Two findings the WO did not name:
  1. **The two engines disagreed on what a press is.** modern pressed via `scale(var(--ds-state-press-scale))`, rustic via `var(--ds-button-active-transform, scale(0.97))`. The tokens stay divergent (changing them is a pixel change); the *state* no longer can be, because one place decides when a part is pressed.
  2. **`data-focus-visible` was raised on ANY focus.** The modern Button set it in `onFocus`, so clicking with a mouse drew a keyboard affordance. Verified in a browser after the fix: a click yields `data-state="hovered focused"` with no ring; a Tab yields `data-state="focused focus-visible"` and `data-focus-visible="true"`.
  3. **A support probe of my own was looking the wrong way.** The first implementation asked `element.matches(':focus-visible')` and treated "does not throw" as "implements". Several DOM implementations answer that selector by returning `false` without implementing it, so every keyboard focus silently lost its ring — caught by the core's own test on the first run. Input modality decides the ring now, and the comment says how it knows.
- **Remaining for WO-ARC-03** — Input, Tabs and Modal onto the core; the inline-style-to-CSS skin migration for all four, proven pixel-identical by the visual gate; and the `data-state` skin selectors that make the CSS-first pilot mean anything.

- **Outcome** — The P-01 anatomy contract exists and is proven on the pilot four — **Button, Input, Tabs, Modal**: each pilot component's behavior (keyboard nav, focus management, aria wiring, open/close/selection state, hover/press/focus as `data-state` attributes on `data-part`-named parts) lives ONCE in a new headless core under `packages/core/src/behavior/` (to be created — the directory does not exist today), and the pilot four's **modern and rustic skins move from inline `style={}` objects to real CSS** (`@layer`-organized stylesheets on custom properties, states via `:hover`/`:focus-visible`/`[data-state=...]` consuming the WO-ENG-04 tokens). classic is untouched; apps see zero API change through `createEngineComponent`; the modern pilot skins render the Quiet Premium look pixel-identically (WO-GAT-01 proves it).
- **Why** — P-01 + P-02 (proposals.md, APPROVED 2026-07-07; pilot slice per P-01's own sequencing: "pilot on Button/Input/Tabs/Modal before committing the fleet"). This is the industry-converged Radix/React Aria/Ark pattern — behavior once, skins many — and the only way "elevate modern to the maximum" stays true over time. Verified current state: NO anatomy contract exists — a grep for `data-state` across `packages/core/src/components/**/*.tsx` returns zero files; `packages/core/src/behavior/` does not exist; the modern Button computes hover/press/focus in React state and inline styles (the engine-modern lane's WO-ENG-04 evidence: hardcoded `transform: scale(0.98)` at `primitives/inputs/Button/engines/modern.tsx` ~L387 before ENG-04 tokenizes the VALUES — the MECHANISM stays JS until this WO). The factory seam is real: `createEngineComponent` (`packages/core/src/runtime/engines/factory.tsx`) lazy-loads `engines/{classic,modern,rustic}` per component, so migration is per-component and invisible to apps. Pilot paths verified: `packages/core/src/components/primitives/inputs/Button/engines/{classic,modern,rustic}.tsx`, `primitives/inputs/Input/`, `primitives/navigation/Tabs/`, `primitives/overlay/Modal/` (the overlay Modal is the pilot; the parallel `feedback/Modal` is an ARC-01-recorded finding and migrates with its fleet category in ARC-03).
- **Depends on** — WO-ENG-04 (the interaction-state tokens the CSS skins consume), WO-GAT-01 (the pixel-diff safety net), WO-ARC-01 (the normalized prop contract the core exposes). **START-ORDER NOTE (owner law): recommended to claim only after WO-ENG-11 certifies unless the orchestrator explicitly coordinates disjoint Files windows** — this WO rewrites `Button/engines/modern.tsx` and the other pilot modern skins, the exact files WO-ENG-04/05/11 edit; modern goes premium FIRST, the restructure comes LATER.
- **Steps** —
  1. Create `packages/core/src/behavior/` with `contracts/` (per-family anatomy contracts as TS types + docs: the named parts, e.g. Button `root|icon|label`, Input `root|field|prefix|suffix|clear`, Tabs `root|list|trigger|indicator|panel`, Modal `root|overlay|content|header|body|footer|close`, and the state attributes `data-state` may carry: `hovered|pressed|focused|focus-visible|disabled|open|closed|selected|active`) and per-family hooks: `useButtonBehavior`, `useInputBehavior`, `useTabsBehavior`, `useModalBehavior`. Each hook owns keyboard nav, focus management (focus trap + return for Modal), aria wiring, open/close/selection state, and emits `data-part`/`data-state` prop bags for each part. Build on the existing a11y hooks (`packages/core/src/hooks/a11y/` — `useKeyboardNavigation`, and `useRovingTabindex` if WO-CRA-03 has landed) rather than re-inventing them.
  2. Author the pilot skins as real stylesheets: `packages/core/src/tokens/css/engines/modern/components/{button,input,tabs,modal}.css` and `packages/core/src/tokens/css/engines/rustic/components/{button,input,tabs,modal}.css` (new files, imported through the same chain that loads the existing engine `theme.css` entries), all rules inside `@layer ds-engine`, selectors keyed EXCLUSIVELY on `[data-part]`/`[data-state]`/pseudo-classes, values EXCLUSIVELY `var(--ds-*)` tokens (the ENG-01 motion canon, ENG-03 elevation, ENG-04 state tokens, ENG-05 effect roles). The modern skin transcribes the post-ENG-11 Quiet Premium rendering 1:1 — same tokens, same values, new mechanism.
  3. Rewire the pilot engine entries: `engines/modern.tsx` and `engines/rustic.tsx` for the pilot four render the behavior core's anatomy (spreading the hook's `data-part`/`data-state` prop bags) with NO inline state styling and NO JS-computed style values; `engines/classic.tsx` is byte-identical before/after (antd brings its own behavior). Public prop types stay the ARC-01 contract; `createEngineComponent` loader wiring unchanged.
  4. Keep `prefers-reduced-motion` and the focus-visible ring behavior intact (the CSS skins consume the composed transitions and `--ds-focus-ring` tokens; no JS motion).
  5. Extend `scripts/engine-token-audit.mjs` with two pilot counters: `pilot-inline-state-literals` (JS-computed interaction-state style values in the pilot four's modern/rustic files, target 0) and `anatomy-coverage` (each pilot component's rendered root carries `data-part`; target 4/4). Both decrease-/increase-only toward target.
  6. Sighted + mechanical proof: capture the pilot four's full variant+state galleries (WO-ENG-02 capture route) under both tenant palettes to `test-artifacts/architecture/arc-02/`; run the WO-GAT-01 suite — zero unapproved pixel diff on the pilot four; keyboard-walk each pilot (Tab/arrows/Escape/Enter) and record the focus order in the done evidence.
- **Files** — `packages/core/src/behavior/**` (new: contracts + the four hooks + tests), `packages/core/src/components/primitives/inputs/Button/engines/{modern,rustic}.tsx`, `.../inputs/Input/engines/**`, `.../navigation/Tabs/engines/**`, `.../overlay/Modal/engines/**` (modern/rustic only — classic byte-identical), `packages/core/src/tokens/css/engines/modern/components/*.css` (new), `packages/core/src/tokens/css/engines/rustic/components/*.css` (new) + the engine CSS import chain, `scripts/engine-token-audit.mjs`, `test-artifacts/architecture/arc-02/`.
- **Acceptance gate** — `pnpm --filter @rottay/design-system run build` + `pnpm test` green (behavior hooks unit-tested: keyboard nav, focus trap/return, aria attributes, data-state transitions); `node scripts/engine-token-audit.mjs --check` green with `pilot-inline-state-literals` = 0 and `anatomy-coverage` = 4/4; the WO-GAT-01 visual-regression suite green with zero unapproved pixel diff on the pilot four under both tenant palettes; classic engine files byte-identical (`git diff` empty on `**/engines/classic*`); sighted galleries in `test-artifacts/architecture/arc-02/` reviewed under both tenant palettes (dark-surface rottay + one light-surface tenant) showing live `:hover`/`:focus-visible`/`[data-state=pressed]` states; if the WO-GAT-04 accessibility suite exists, it is green on the pilot pages.
- **Do NOT** — Do not change any public prop, any rendered pixel, or any `createEngineComponent` loader signature. Do not touch classic engine files. Do not migrate any component beyond the pilot four (ARC-03 owns the fleet, gated on WO-ENG-11). Do not put product/domain semantics in the behavior core. Do not invent new tokens (consume the ENG canon). Never `git restore` directories.
- **Size** — L.

## DS improvements — Wave 0

### WO-ARC-10 Root dependency honesty
- **Source IDs / phase** — DS-IMP-001 and DS-IMP-115; Phase 0.
- **Outcome** — A root export cannot statically reach a dependency labelled optional; the clean core graph has one React, ReactDOM and Dayjs identity; each app declares the suppliers it renders. A hard dependency, focused subpath or split package is acceptable when its graph/tarball/consumer proof is honest.
- **Steps** — Trace every root export to D3, Motion, Lucide, Three and antd; remove zero-importer peers; isolate or promote each reachable dependency; add clean-install graph, packed-tarball and non-consuming consumer-bundle sentinels; compare app imports to manifests.
- **Acceptance gate** — Frozen clean install; identity check exactly one each; a non-consuming root fixture contains none of the five supplier families through a false optional path; importer fixtures fail when their peer is undeclared; packed exports resolve without workspace links.
- **Execution control** — Preserve the prior entry/subpath for one release when moving an import boundary. Telemetry: root graph, identity count and bundle sentinels. Stop on duplicate runtime identity, false optional reachability or undeclared app supplier.
- **Files** — Root/core manifests and exports, focused subpath entrypoints, graph/bundle checks and consumer fixtures; app manifests only when their own imports require it.
- **Do NOT** — Do not hide a static import behind `peerDependenciesMeta`, repin an app without its release gate, or use filesystem links as certification.

### WO-ARC-11 Superadmin presentation bypass
- **Source IDs / phase** — DS-IMP-072; Phase 0.
- **Outcome** — Authorization remains app/server-owned. Passing resolved access `all` bypasses every DS presentation filter for routes, fields, columns, tabs and actions; a data/Prisma failure renders a visible error state and never makes registered capability anatomy disappear.
- **Steps** — Inventory all DS permission/grant/cascade interpretations; replace them with resolved `all | resolved` presentation input; generate fixtures for every registered capability; add failing-data fixtures while keeping server authorization tests intact.
- **Acceptance gate** — Superadmin fixtures expose 100% of registered routes/fields/columns/tabs/actions; deny/resolved fixtures remain deterministic; injected Prisma/data failures show the capability plus error state; server authorization suites remain green.
- **Execution control** — Roll back individual presentation adapters without changing server policy. Telemetry: registered-versus-visible capability counts, `all` short-circuit use and load-error rendering. Stop if `all` hides anything or a data error removes anatomy.
- **Files** — DS surface access contracts/tests plus app adapters and generated registries in their owning repos.
- **Do NOT** — Do not implement authorization, grants or Prisma policy in the DS; do not hide capabilities to make an error disappear.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, build the headless behavior core + CSS-first PILOT from proposals P-01 + P-02 (`roadmap/proposals.md`, APPROVED 2026-07-07; pilot four = Button, Input, Tabs, Modal). Owner law: modern went premium FIRST — this WO is recommended only after WO-ENG-11 certified, unless the orchestrator coordinated disjoint Files windows; confirm with the orchestrator before claiming. Create `packages/core/src/behavior/` (does not exist) with per-family anatomy contracts (named `data-part`s — Button `root|icon|label`, Input `root|field|prefix|suffix|clear`, Tabs `root|list|trigger|indicator|panel`, Modal `root|overlay|content|header|body|footer|close` — and `data-state` values `hovered|pressed|focused|focus-visible|disabled|open|closed|selected|active`) and hooks `useButtonBehavior`/`useInputBehavior`/`useTabsBehavior`/`useModalBehavior` owning keyboard nav, focus management (trap + return for Modal), aria wiring, and state as data attributes — build on `packages/core/src/hooks/a11y/` (`useKeyboardNavigation`, plus `useRovingTabindex` if WO-CRA-03 landed). Author real stylesheets `packages/core/src/tokens/css/engines/{modern,rustic}/components/{button,input,tabs,modal}.css` (imported through the same chain as each engine's `theme.css`), all rules in `@layer ds-engine`, selectors ONLY on `[data-part]`/`[data-state]`/pseudo-classes, values ONLY `var(--ds-*)` tokens (ENG-01 motion, ENG-03 elevation, ENG-04 states, ENG-05 effects); the modern skin transcribes the post-ENG-11 Quiet Premium rendering 1:1. Rewire the pilot `engines/modern.tsx`/`engines/rustic.tsx` (paths: `packages/core/src/components/primitives/inputs/Button/engines/`, `inputs/Input/`, `navigation/Tabs/`, `overlay/Modal/` — the overlay Modal, NOT `feedback/Modal`) to render the hook's `data-part`/`data-state` prop bags with zero inline state styling; `engines/classic.tsx` stays byte-identical; public props stay the WO-ARC-01 contract; `createEngineComponent` untouched. Keep `prefers-reduced-motion` + `--ds-focus-ring` behavior. Extend `scripts/engine-token-audit.mjs` with `pilot-inline-state-literals` (target 0) and `anatomy-coverage` (target 4/4) counters. Gate: `pnpm --filter @rottay/design-system run build` + `pnpm test` green (unit-test the hooks: keyboard, focus trap/return, aria, data-state); audit `--check` green with both new counters at target; the WO-GAT-01 visual-regression suite (command as registered by WO-GAT-01 in `package.json`) green with ZERO unapproved pixel diff on the pilot four; classic byte-identical; sighted galleries in `test-artifacts/architecture/arc-02/` under rottay (dark, `#0A0A0C`) AND a light-surface tenant (bithire or evnto) showing live pseudo-state styling — run the showroom (`pnpm --filter @rottay/showroom run dev`, http://localhost:7001) and LOOK at the PNGs. Fences: pilot four ONLY, classic untouched, zero API/pixel change, no domain semantics in the core, no new tokens, edit-only, no commits, never git-restore directories, app-bithire and docs-engineering read-only, showroom dev server allowed.

### WO-ARC-03 Fleet migration to the headless core
- **AMENDMENT 2026-07-10 (the checkpoint unit is wrong, and the WO is two work orders)** —
  1. **Category is the wrong checkpoint unit.** Measured across all six primitive categories: 22 components carry the interaction triad, in 29 engine files, and **17 of them are in `inputs`**. `display` has two (Card, Image); `feedback`, `layout` and `overlay` have none. Tooltip's state is visibility, Carousel's is which slide, Tree's eight `useState` are expansion and selection. A `useState` is not an interaction state, and a category is not a unit of this defect.
  2. **`isFocused` is not `focusVisible`, and conflating them would have shipped a regression the pixel gate could not see.** A button's focus RING is a keyboard affordance. A text field's focus BORDER must appear when a pointer lands in it. Mapping every `isFocused` to `focusVisible` would have deleted the border from every input on click — and no visual baseline focuses anything, so 89 green gate tests would have said nothing.
  3. **The CSS-first skin migration is a separate work order.** This WO's outcome bundles "every primitive on the headless core" with "modern and rustic skins move from inline `style={}` to real CSS". The first is mechanical and provable by zero pixel movement. The second is a pixel-identical rewrite of ~127 components across two engines, and its only honest gate is per-component. Bundling them means a pixel diff has two possible causes. Carved out as **WO-ARC-07**.
- **DELIVERED HERE** — 18 engine files read `behavior/interaction-state`. Twelve were skipped by a shape-aware migrator that printed a reason for each rather than guessing: a setter called outside a recognised handler (7), a component that already distinguishes `focusVisible` (3 — Checkbox, Radio, Switch modern), a `useState<T>` the pattern could not see. Menu's modern skin uses its setters inside a nested render function; the migrator produced code that did not compile and it was restored from HEAD as a single file and recorded as a skip. Thirteen engine files still declare the triad locally, each with a named reason.

- **Outcome** — Every engine-switched primitive is on the WO-ARC-02 headless core with CSS-first modern + rustic skins, migrated **category by category — display, inputs, feedback, layout, navigation, overlay** (the six verified categories under `packages/core/src/components/primitives/`), each category landing as a deployable checkpoint with build + tests + visual diff green before the next begins; the engine-bearing pattern skins (e.g. `patterns/data/data-table/engines/modern.tsx`) migrate in a closing sweep on the same contract. The modern skins carry the Quiet Premium look UNCHANGED — WO-GAT-01 proves it per category — and classic is never touched.
- **Why** — P-01 + P-02 fleet slice (proposals.md, APPROVED 2026-07-07). The pilot proves the mechanism; the payoff — "behavior, a11y detail, and state implemented once instead of three times" for the ~127-component fleet, ending the 3-4x quality dilution the proposals' architecture verdict names as defect #1 — only arrives when the whole fleet is on the core. Per-category migration is the deployable-state law applied to an L-size program: the six primitive category directories are verified on disk (`display`, `feedback`, `inputs`, `layout`, `navigation`, `overlay` under `packages/core/src/components/primitives/`), and each is small enough to land green in one window. The HARD WO-ENG-11 dependency is the owner's sequencing decision recorded 2026-07-07: **modern goes premium FIRST; the fleet restructure begins only after the premium uplift completes and the owner has signed the ENG-11 signature gallery** — the fleet migration then transcribes that certified look into CSS skins without touching its appearance.
- **Depends on** — WO-ARC-02 (the proven core + skin mechanism), **WO-ENG-11 (HARD: the premium uplift completes first — owner decision 2026-07-07; never weaken this edge)**. Also inherits WO-GAT-01 as the per-category proof.
- **Steps** —
  1. Fix the category order by risk: `inputs` (largest, but the pilot already proved Button/Input) -> `display` -> `feedback` -> `overlay` -> `navigation` -> `layout`. For each category, enumerate its components and their `engines/` files before editing; the ARC-01-recorded `feedback/Modal` vs `overlay/Modal` duplication is resolved here (one implementation on the core, the other becoming a thin re-export alias for one release — record the decision in done evidence).
  2. Per category, per component: extend `packages/core/src/behavior/` with the family's anatomy contract + behavior hook (reusing shared internals — selection, disclosure, list navigation — across families); author the modern + rustic skin CSS under `packages/core/src/tokens/css/engines/{modern,rustic}/components/`; rewire `engines/{modern,rustic}.tsx` to the core; leave `engines/classic.tsx` byte-identical.
  3. Close each category as a checkpoint: `pnpm --filter @rottay/design-system run build` + `pnpm test` green, `node scripts/engine-token-audit.mjs --check` green, the WO-GAT-01 suite green with zero unapproved pixel diff for that category, sighted spot-check under both tenant palettes captured to `test-artifacts/architecture/arc-03/<category>/`. A category that cannot close green is fixed forward before the next category starts.
  4. Closing sweep: migrate the engine-bearing PATTERN skins (the `patterns/**/engines/modern.tsx` files, e.g. `patterns/data/data-table/engines/modern.tsx`) onto the same `data-part`/`data-state` + CSS-skin contract, reusing the primitive cores they compose.
  5. Generalize the ratchet: `scripts/engine-token-audit.mjs`'s `pilot-inline-state-literals` counter widens to `fleet-inline-state-literals` over ALL modern/rustic engine files (target 0 at lane close, decrease-only per category) and `anatomy-coverage` widens to the fleet component count.
  6. Record in done evidence the release-note delta for the next DS release (new CSS files in the package output, no public API change) so the release train and app repins are informed.
- **Files** — `packages/core/src/behavior/**` (extended per family), `packages/core/src/components/primitives/{display,inputs,feedback,layout,navigation,overlay}/**/engines/{modern,rustic}*` (rewired), `packages/core/src/components/patterns/**/engines/{modern,rustic}*` (closing sweep), `packages/core/src/tokens/css/engines/{modern,rustic}/components/**` (new skin files), `scripts/engine-token-audit.mjs` + `scripts/engine-token-audit.baseline.json`, `test-artifacts/architecture/arc-03/**`.
- **Acceptance gate** — Per category AND at close: `pnpm --filter @rottay/design-system run build` + `pnpm test` green; `node scripts/engine-token-audit.mjs --check` green with `fleet-inline-state-literals` = 0 and `anatomy-coverage` at the fleet count at lane close; the WO-GAT-01 visual-regression suite green with zero unapproved pixel diff per category under both tenant palettes (dark-surface rottay + one light-surface tenant); classic engine files byte-identical across the whole WO (`git diff` empty on `**/engines/classic*`); the `compilers/brand-theme` suite green and artifacts regenerated if any token mapping moved; sighted per-category captures in `test-artifacts/architecture/arc-03/` reviewed.
- **Do NOT** — Do not start before WO-ENG-11 is certified (HARD owner dependency — never weaken it). Do not change the Quiet Premium appearance (transcribe, never redesign; GAT-01 is the proof). Do not touch classic. Do not land a half-migrated category (deployable-state law). Do not re-declare prop unions (ARC-01 canon only). Never `git restore` directories.
- **Size** — L.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, migrate the component fleet onto the WO-ARC-02 headless core per proposals P-01 + P-02 (`roadmap/proposals.md`, APPROVED 2026-07-07). HARD precondition (owner decision 2026-07-07, "modern goes premium FIRST"): WO-ENG-11 must be certified DONE before you start — verify in `roadmap/registry.json` / `pnpm roadmap:status` and STOP if it is not. Migrate category by category in this order — inputs, display, feedback, overlay, navigation, layout (the six dirs under `packages/core/src/components/primitives/`) — and for each component: extend `packages/core/src/behavior/` with the family anatomy contract + hook (reuse shared selection/disclosure/list-nav internals), author modern + rustic skin CSS under `packages/core/src/tokens/css/engines/{modern,rustic}/components/` (`@layer ds-engine`, `[data-part]`/`[data-state]` selectors, `var(--ds-*)` values only), rewire `engines/{modern,rustic}.tsx` to the core, and leave `engines/classic.tsx` byte-identical. Resolve the ARC-01-recorded `feedback/Modal` vs `overlay/Modal` duplication (one core implementation, the other a one-release re-export alias; record the decision). Close EACH category as a deployable checkpoint: build + `pnpm test` green, `node scripts/engine-token-audit.mjs --check` green, the WO-GAT-01 visual-regression suite (command as registered by WO-GAT-01) green with ZERO unapproved pixel diff, sighted spot-check under both tenant palettes (dark-surface rottay `#0A0A0C` + a light-surface tenant) to `test-artifacts/architecture/arc-03/<category>/` — fix forward before the next category. Then a closing sweep migrates the engine-bearing pattern skins (e.g. `patterns/data/data-table/engines/modern.tsx`) onto the same contract. Widen the audit counters: `fleet-inline-state-literals` (target 0, decrease-only) and fleet-wide `anatomy-coverage`; regenerate `tokens/css/artifacts/**` + keep `compilers/brand-theme` green if any token mapping moves; record the release-note delta in done evidence. Gate (per category and at close): build + tests green, audit `--check` green, GAT-01 zero unapproved diff, classic byte-identical, sighted captures reviewed. Fences: the Quiet Premium look is transcribed UNCHANGED (never redesign), classic untouched, no half-migrated category, ARC-01 canon only, edit-only, no commits, never git-restore directories, app-bithire and docs-engineering read-only, showroom dev server allowed.

### WO-ARC-04 Custom-engine skin pack API
- **Outcome** — The `custom` engine becomes what P-01 promises: a white-label tenant ships a **CSS + tokens skin pack, not 127 React component forks**. A `registerSkinPack` API layers onto the existing custom-engine slot (`packages/core/src/runtime/engines/custom.ts`): a pack = an id + a stylesheet targeting the WO-ARC-02/03 anatomy contract (`[data-part]`/`[data-state]` selectors) + a token set (BrandTheme or a compiled `--ds-*` bundle); when a pack is registered and no bespoke React component is registered for a given component, the custom engine renders the shared behavior core with the pack's skin. `registerCustomComponents` survives as the escape hatch for genuinely bespoke components. Docs + a checked-in example pack + a showroom demo prove the path end to end.
- **Why** — P-01, custom slice (proposals.md, APPROVED 2026-07-07): "It also makes the `custom` engine real: a white-label tenant ships CSS + tokens, not 127 React forks." Verified current state: `packages/core/src/runtime/engines/custom.ts` is component-registration-only — `registerCustomComponents({ Button: AcmeButton, Card: AcmeCard }, 'acme-pack')` (~L201) plus a global `configureCustomEngine`/`CustomEngineConfig` (~L94-128) — so today a white-label tenant that wants a custom engine must hand-build React implementations per component; the factory's custom path (`createCustomWrapper` consumed by `packages/core/src/runtime/engines/factory.tsx`) falls back per registration. After WO-ARC-03 the behavior is shared and skins are CSS, so the missing piece is only the registration + loading seam. This is also the whitelabel completeness answer: the tenant chain (BrandTheme -> `compileBrandTheme` -> artifacts) already themes the first-party engines; the skin pack extends the same token discipline to fully bespoke looks.
- **Depends on** — WO-ARC-03 (the fleet must be on the anatomy contract before a skin pack can target it).
- **Steps** —
  1. Define the pack contract in `packages/core/src/runtime/engines/custom.ts` (or a sibling `skin-pack.ts` in the same directory): `SkinPack = { id, css (a stylesheet URL/string targeting `[data-part]`/`[data-state]`), tokens (a `BrandTheme` or a bounded `--ds-*` override map, validated against the bounded TenantAppearanceAdvanced limits — no unbounded overrides), components? (optional bespoke React overrides via the existing `registerCustomComponents` path) }` plus `registerSkinPack(pack)` / `getRegisteredSkinPack()`.
  2. Wire the loading seam: when the active engine is `custom` and a skin pack is registered, `createCustomWrapper`/the factory resolve a component to the shared behavior core rendered with the pack's stylesheet + tokens injected (via the existing provider/artifact injection path); a bespoke React component registered for that name still wins. No change to `createEngineComponent` call sites.
  3. Build the example pack: a checked-in, obviously-different-but-token-clean demonstration skin (its own CSS file targeting the anatomy contract + a token set) under the DS package (e.g. `packages/core/src/tokens/css/engines/custom/example-pack/` with its registration snippet), used by tests and the showroom demo. Keep it domain-agnostic.
  4. Showroom demo + docs: a showroom page rendering the flagship set (button, input, select, card, badge, table, tabs, modal) under the example pack next to modern, with the registration code shown; document the pack contract and the escape hatch in the component-level docs/stories inside this repo (docs-engineering is read-only in this lane — the orchestrator syncs the hub docs at certification).
  5. Tests: unit-test registration precedence (pack skin vs bespoke component vs unregistered fallback) and the bounded-token validation (an unbounded override is rejected); extend `scripts/engine-token-audit.mjs` only if a new counter is warranted (e.g. example-pack selectors must all be `[data-part]`-keyed).
- **Files** — `packages/core/src/runtime/engines/custom.ts` (+ a sibling `skin-pack.ts` if cleaner), `packages/core/src/runtime/engines/factory.tsx` (custom resolution seam only), `packages/core/src/runtime/engines/tests/**`, `packages/core/src/tokens/css/engines/custom/example-pack/**` (new), a `packages/showroom` demo page, `scripts/engine-token-audit.mjs` (only if a counter is added), `test-artifacts/architecture/arc-04/`.
- **Acceptance gate** — `pnpm --filter @rottay/design-system run build` + `pnpm test` green including the new precedence + bounded-validation tests; the showroom demo renders the flagship set under the example pack with ZERO bespoke React components registered (proof the pack path alone suffices), captured to `test-artifacts/architecture/arc-04/` under both tenant palettes and reviewed; the WO-GAT-01 suite green (modern/rustic baselines unchanged — the pack adds, never mutates); classic untouched; `pnpm --filter @rottay/showroom run build` green.
- **Do NOT** — Do not allow unbounded token overrides through the pack (bounded contract only). Do not break `registerCustomComponents` (it remains the bespoke escape hatch). Do not change modern/rustic/classic rendering. Do not put product/domain semantics in the example pack. Never `git restore` directories.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, build the custom-engine skin pack API from proposal P-01's custom slice (`roadmap/proposals.md`, APPROVED 2026-07-07). Depends on WO-ARC-03 being done (the fleet is on the `data-part`/`data-state` anatomy contract). Today `packages/core/src/runtime/engines/custom.ts` only offers `registerCustomComponents({ Button: AcmeButton }, 'pack-id')` (~L201) + a global `configureCustomEngine` — a white-label tenant would need per-component React forks. Add a `SkinPack` contract (`{ id, css, tokens, components? }` — css targets `[data-part]`/`[data-state]`; tokens = a BrandTheme or a BOUNDED `--ds-*` override map validated against the TenantAppearanceAdvanced limits, unbounded overrides rejected) with `registerSkinPack`/`getRegisteredSkinPack` in `custom.ts` (or sibling `skin-pack.ts`); wire the factory's custom resolution (`createCustomWrapper` in `packages/core/src/runtime/engines/`) so a registered pack renders the shared behavior core with the pack's stylesheet + injected tokens, while a bespoke registered React component still wins and unregistered names fall back as today — zero change at `createEngineComponent` call sites. Check in a domain-agnostic example pack under `packages/core/src/tokens/css/engines/custom/example-pack/` and mount a showroom demo page rendering the flagship set (button, input, select, card, badge, table, tabs, modal) under it next to modern, registration code shown; document the contract + escape hatch in in-repo docs/stories (docs-engineering is READ-ONLY — the orchestrator syncs the hub). Unit-test precedence (pack vs bespoke vs fallback) and bounded-token rejection. Gate: `pnpm --filter @rottay/design-system run build` + `pnpm test` green; showroom demo renders the flagship set under the example pack with ZERO bespoke React components, captured to `test-artifacts/architecture/arc-04/` under both tenant palettes (dark-surface rottay + a light-surface tenant) and REVIEWED; the WO-GAT-01 suite green with modern/rustic baselines unchanged; `pnpm --filter @rottay/showroom run build` green. Run the showroom (`pnpm --filter @rottay/showroom run dev`, http://localhost:7001) and LOOK at the PNGs. Fences: bounded tokens only, keep `registerCustomComponents`, no modern/rustic/classic rendering change, no domain semantics, edit-only, no commits, never git-restore directories, app-bithire and docs-engineering read-only, showroom dev server allowed.

### WO-ARC-05 Container queries + fluid scales
- **RESOLUTION 2026-07-10 (owner-delegated: split, mark done for the delivered half).** This WO is
  two halves (see the amendment below). The FOUNDATION half — steps 3 and 5, the `clamp()` fluid ramps
  (`--ds-font-size-fluid-*`, `--ds-space-fluid-*`) and the `viewport-mq-in-skins` decrease-only counter —
  is DELIVERED and gated (commit `fd21437a`): 16 ramps bounded by adjacent static steps, 35 assertions,
  three drills, plus a `--check` that now refuses an unbaselined counter. That is this WO's closeable scope,
  and it is marked done against exactly that. The CONTAINER half — steps 1, 2, 4 (`container-type` contexts,
  `@container` adaptations, the sighted container-axis gallery) — is **carved into WO-ARC-08**, following the
  same precedent by which WO-ARC-03 carved its CSS-skin migration into WO-ARC-07. The carve-out is not a
  deferral of convenience: those steps need table/preview-rail/split-pane CSS skins that do not exist, and
  minting them is itself ARC-07-pattern work (a workspace-tier skin migration), which WO-ARC-08 owns. This
  WO's acceptance gate is hereby scoped to the foundation half; the container-gallery gate moves to ARC-08.
- **AMENDMENT 2026-07-10 (the dependency is satisfied in the registry and not in the code)** —
  This WO's `Depends on` line reads "WO-ARC-03 (real CSS skins to hang `@container`
  rules on)". WO-ARC-03 is `done`, and it explicitly **carved the CSS-first skin
  migration out into WO-ARC-07** in its own amendment. So the skins this WO needs
  were never ARC-03's to deliver. Measured on 2026-07-10, after ARC-07's Button
  slice landed:

  | thing this WO hangs its work on | how many exist |
  | --- | --- |
  | CSS skins under `tokens/css/engines/{modern,rustic}/skin/` | 2 (Button, both engines) |
  | `@container` rules in `packages/core/src` | 1 (`tokens/css/components/patterns.css:926`) |
  | `container-type` declarations | 1 (the same rule) |
  | `clamp()` in `tokens/css/foundation/base/typography.css` | 0 |

  Steps 1 and 2 name the card, table/data-table, preview-rail/pane and
  workspace-region skins. **None of those skins exist.** Those components still
  paint from inline `style={}` objects, which cannot express an `@container` rule —
  which is exactly the reason this WO declared the dependency in the first place.

  Two paths, and the WO must pick one before a successor starts:

  1. **Sequence it.** ARC-07 migrates Card, then table/data-table, then the rail and
     pane, and ARC-05 hangs container contexts on each skin as it lands. Honest, and
     it makes ARC-05 the tail of ARC-07 rather than a peer.
  2. **Split it.** Steps 3 and 5 — the `clamp()` fluid ramps in the foundation and the
     `viewport-mq-in-skins` decrease-only counter — depend on no skin at all and can
     land now. Steps 1, 2 and 4 wait on the skins.

  Path 2's unblocked half is being executed under this WO; steps 1, 2 and 4 stay
  open and are blocked on ARC-07, not on ARC-03.

- **Outcome** — Components adapt to their **container**, not the viewport: the CSS-first skins gain named `container-type: inline-size` contexts and `@container` rules for the places the DS renders at many widths inside workspaces (cards, tables, preview rails, split panes), and the foundation gains `clamp()`-based fluid type/space tokens (`--ds-font-size-fluid-*`, `--ds-space-fluid-*`) that skins and surfaces consume opt-in. This EXTENDS the WO-ENG-12 responsive law — which stays intrinsic-sizing based until this WO, per its own Do-NOT ("container-query adoption is proposal P-08, not this WO") — with the deeper mechanism, without loosening any ENG-12 counter.
- **Why** — P-08 (proposals.md, APPROVED 2026-07-07; scope note: WO-ENG-12 owns the BASIC responsive law, P-08 is the MECHANISM upgrade on top). Verified current state: exactly ONE `@container` rule exists in the entire `packages/core/src` tree (`packages/core/src/tokens/css/components/patterns.css:926`, a 230px max-width special case) — container adaptation is effectively absent; responsiveness is viewport-only via `useBreakpoint` (`packages/core/src/runtime/responsive/ResponsiveProvider.tsx`); and there is NO systematic fluid scale — `packages/core/src/tokens/css/foundation/base/typography.css` contains zero `clamp()`, and the `clamp()` occurrences that do exist sit in `tokens/css/components/patterns.css` and the bithire artifact `_source/extension.css`, not in a foundation token ramp. The same pattern renders at sidebar-width, rail-width, and full-width in the workspace surfaces; only this WO makes it adapt to that fact. It requires WO-ARC-03 because `@container` rules need the real CSS skins — inline `style={}` objects (the pre-ARC mechanism) cannot express them.
- **Depends on** — WO-ARC-03 (real CSS skins to hang `@container` rules on). Coordinates WO-ENG-12 (its viewport-matrix capture preset and responsive counters are extended, never weakened).
- **Steps** —
  1. Mint the container contexts at the skin layer: the card, table/data-table, preview-rail/pane, and workspace-region skins declare `container-type: inline-size` with documented container names (`--ds-container: card|table|rail|pane` naming scheme) in `packages/core/src/tokens/css/engines/{modern,rustic}/components/**` and the shared pattern CSS; document which components are containers in the behavior contracts.
  2. Add `@container` adaptations where the DS renders at many widths: cards (stacked meta below a named width), tables/data-table (column priority — low-priority columns collapse under narrow containers, consistent with the component-owned layout law of spec section 10), preview rails and split panes (density/posture step-down). Adaptations are skin-level presentation only; layout INTENT stays component-owned.
  3. Add the fluid scales at the foundation: `--ds-font-size-fluid-*` and `--ds-space-fluid-*` `clamp()` ramps in `packages/core/src/tokens/css/foundation/base/typography.css` and the spacing foundation, derived from the existing static steps (each fluid token's bounds are two adjacent static steps — no new magnitudes); wire opt-in consumption in the skins/surfaces where ENG-12 evidence showed cramped or oversized extremes. If any fluid token is compiler-emitted or appears in an artifact, apply the tenant-artifact rule (regenerate + compiler suite green).
  4. Extend the evidence harness: the WO-ENG-12 viewport-matrix capture gains a CONTAINER-width axis (the same component captured at rail-width, half-width, and full-width inside one viewport) on the WO-ENG-02 capture route, under both tenant palettes, to `test-artifacts/architecture/arc-05/`.
  5. Extend `scripts/engine-token-audit.mjs`: a `viewport-mq-in-skins` counter (viewport media queries inside engine skin files must not grow — container queries are the sanctioned mechanism; baseline measured, decrease-only) and keep the ENG-12 responsive counters green unchanged.
- **Files** — `packages/core/src/tokens/css/engines/{modern,rustic}/components/**` (container contexts + `@container` rules), `packages/core/src/tokens/css/components/patterns.css` (fold the lone existing `@container` rule at :926 into the named-container scheme), `packages/core/src/tokens/css/foundation/base/typography.css` + the spacing foundation file (fluid ramps), `packages/core/src/behavior/**` (container documentation in contracts), `packages/showroom` capture route (container-width axis), `scripts/engine-token-audit.mjs` + baseline, `test-artifacts/architecture/arc-05/`, `packages/core/src/tokens/css/artifacts/**` + `compilers/brand-theme` (only if a fluid token is compiler-emitted).
- **Acceptance gate** — `pnpm --filter @rottay/design-system run build` + `pnpm test` green; `node scripts/engine-token-audit.mjs --check` green with the ENG-12 responsive counters unchanged and `viewport-mq-in-skins` at or below baseline; sighted container-axis gallery in `test-artifacts/architecture/arc-05/` under both tenant palettes (dark-surface rottay + one light-surface tenant) REVIEWED showing the same card/table/rail adapting at rail-width vs full-width inside one viewport; the WO-GAT-01 suite green (full-width renderings unchanged; narrow-container adaptations approved explicitly as new baselines); classic untouched; artifacts regenerated + compiler suite green if a fluid token is emitted.
- **Do NOT** — Do not weaken or bypass any WO-ENG-12 counter or its 360/768/1280 capture law. Do not move layout intent into the engine (spec section 10 — adaptations are presentation, the component owns layout). Do not add viewport media queries to engine skins (container queries are the mechanism). Do not invent fluid magnitudes outside the existing static steps. Never `git restore` directories.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, add container-query adaptation + fluid scales from proposal P-08 (`roadmap/proposals.md`, APPROVED 2026-07-07). Depends on WO-ARC-03 (real CSS skins). Today exactly ONE `@container` rule exists in `packages/core/src` (`tokens/css/components/patterns.css:926`) and there is no foundation fluid scale (`foundation/base/typography.css` has zero `clamp()`). (1) Declare named container contexts (`container-type: inline-size`; names card|table|rail|pane) in the card, table/data-table, preview-rail/pane, and workspace-region skins under `packages/core/src/tokens/css/engines/{modern,rustic}/components/**`, folding the lone patterns.css rule into the scheme and documenting containers in the behavior contracts. (2) Add `@container` adaptations — cards stack meta below a named width, data-table collapses low-priority columns, rails/panes step density down — presentation only, layout intent stays component-owned (spec section 10). (3) Add `--ds-font-size-fluid-*` + `--ds-space-fluid-*` `clamp()` ramps to `packages/core/src/tokens/css/foundation/base/typography.css` and the spacing foundation, bounded by adjacent EXISTING static steps (no new magnitudes), consumed opt-in; apply the tenant-artifact rule (regenerate artifacts + `compilers/brand-theme` green) if any fluid token is compiler-emitted. (4) Extend the WO-ENG-12/WO-ENG-02 capture preset with a container-width axis (same component at rail-, half-, and full-width in one viewport) captured to `test-artifacts/architecture/arc-05/` under both tenant palettes (dark-surface rottay `#0A0A0C` + a light-surface tenant — no light/dark toggle, tenant palette decides). (5) Extend `scripts/engine-token-audit.mjs` with a `viewport-mq-in-skins` counter (decrease-only; container queries are the sanctioned mechanism) keeping every ENG-12 responsive counter green unchanged. Gate: build + `pnpm test` green; audit `--check` green (ENG-12 counters unchanged, new counter at/below baseline); sighted container-axis gallery reviewed; the WO-GAT-01 suite (command as registered by WO-GAT-01) green with full-width baselines unchanged and narrow-container adaptations explicitly approved; classic untouched. Run the showroom (`pnpm --filter @rottay/showroom run dev`, http://localhost:7001) and LOOK at the PNGs. Fences: never weaken ENG-12, no viewport media queries in skins, no layout intent in engines, no new magnitudes, edit-only, no commits, never git-restore directories, app-bithire and docs-engineering read-only, showroom dev server allowed.

### WO-ARC-08 Workspace-tier container queries + fluid consumption (ADDITIVE)
- **CONTRACT 2026-07-10 (Fable advisory, supersedes the paint-migration language below).** This WO is ADDITIVE
  and does NOT migrate paint — that is WO-ARC-09. The container-query value is delivered on the components AS
  THEY ARE (inline paint intact) by three additive moves, and this is what makes ARC-08 and ARC-09 independent:
  - **Container contexts** on component ROOTS that ALREADY impose their own width (so `container-type: inline-size`
    changes no sizing): the data-table root (modern `:893-899` already ships `width:100%; minWidth:0; contain:layout style`; rustic `styles.container` ships only `width:100%` — CORRECTED from the draft, which wrongly claimed rustic had containment too. Zero-pixel holds regardless: `container-type:inline-size` implies the containment, every absolutely-positioned descendant already has a closer positioned ancestor, and the width was already extrinsic) and the rail root (`width:min(100%,380px)`). Pre-ARC-09 the
    declaration rides the existing inline style object (`containerType`/`containerName` in the TSX); ARC-09's
    skins absorb it later, unchanged.
  - **Container NAMES are idents, not custom properties.** A `@container` prelude cannot read a custom property,
    and an unnamed query resolves the NEAREST container (wrong the moment a card sits in a rail). The scheme is
    `container-name: ds-table | ds-rail | ds-card` (drop "pane" — no split-pane component exists). EVERY `@container`
    prelude is name-qualified; an audit counter enforces it and the sanctioned widths.
  - **`@container` rules may do ONLY two things** until ARC-09: set `--ds-*` custom properties (inline paint
    consumes them via `var()`; where an inline value is a literal, first change it to `var(--ds-x, <old literal>)`
    — zero-pixel by construction), and set `display` on priority-stamped cells (nothing paints `display` on
    th/td inline or via preflight/DaisyUI). This is the proven mechanism of the lone existing rule at
    `patterns.css:926`, which this WO folds into the scheme.
  - **Two documented breakpoint LITERALS:** `640px` (column-priority collapse) and `480px` (density/meta-stack).
    Not one — a 600px table wants fewer columns but not compact density.
  - **Column priority:** a new minimal `priority?: 'low'` field on the column def, stamped `data-col-priority` on
    every th/td, CONSUMER-assigned (never a default/heuristic — `display:none` makes the column's data
    unreachable in a narrow container, so it is opt-in per column). Does NOT overload `pin` (pinned never
    collapses) or `mobileCardBreakpoint` (a viewport-gated whole-table posture switch, a different coexisting
    mechanism).
  - **§10 (component-owned layout):** collapse is component-owned IFF the axis is declared in `DataTable.types.ts`
    + the behavior contract, the threshold is a documented component constant, and the rule lives in shared
    ENGINE-AGNOSTIC pattern CSS (`patterns.css`, one `:where()` rule covering both engines via the shared root
    class), NOT duplicated per-engine skin. NOTE: `patterns.css` imports into `layer(rottay-components)`, NOT unlayered as the draft claimed. This is fine for THIS rule specifically -- `display:none` on a `[data-col-priority]` cell has no author competitor (verified: no `display` rule in theme.css targets table cells; the modern table carries no DaisyUI `.table` class), so it wins over the UA `table-cell` default regardless of layer. It is NOT the general unlayered guarantee P-47 gives a skin; a future later-layer `display` rule on these cells would break it (filed as P-60). Classic (antd) never stamps priorities and never collapses — a
    declared divergence so the §10 metric does not misfire.
  - **Fluid consumption is SCOPED, never blanket** (the ramps ship "opt-in, nothing consumes by default"). First
    spots: `collection/index.tsx:241` default-title branch → `--ds-font-size-fluid-4xl` (moves the 1280 baseline
    too: 30→36px, a real improvement — the hand-rolled `clamp(3xl, 2vw, 4xl)` is inert below ~1500px today); the
    metric-card value via `--ds-metric-card-value-size: var(--ds-font-size-fluid-4xl)` (retires `patterns.css:926`);
    rail/pane `--ds-space-fluid-*` only where ENG-12 evidence shows cramping. The off-scale header branches
    (42-58px) are magnitudes the fluid tokens cannot express — leave them, file a spec-§7 finding.
  - **SEQUENCE (each a deployable checkpoint, ~1 build+gate cycle):** (1) capture harness + container-axis gallery
    FIRST (a probe route capturing one component at ~380/620/1160 wrappers inside one 1280 viewport, per tenant,
    in the `flagships.spec.ts` idiom -- toHaveScreenshot with committed baselines, NOT signature.spec.ts which is pixel-math with none) — zero component change, zero baseline movement, and its "before" gallery is
    the evidence base for every later approval; (2) the data-table contract (priority field + stamps + container
    context + the two collapse rules + a demo page) — fleet-wide INERT (nobody sets priority, the container
    declaration adds no pixel), so the gate must show zero diff outside the demo baselines; (3) rail density +
    card meta-stack; (4) fluid consumption LAST (a container context changes what `cqi` means beneath it, so
    consume-then-contain would move the same pixels twice and double-approve).
  - **BIGGEST RISK:** treating `container-type: inline-size` as styling when it is a PUBLIC LAYOUT CONTRACT — it
    permanently zeroes the element's intrinsic-width contribution (collapses any consumer that sizes it by
    content), and every `cqi` consumer beneath a new context silently re-resolves. Mitigated exactly by the
    sequence above: contexts only on roots that already impose their width (both targets verified), contexts
    before any consumption, every query named.
  - **Gate reword:** "full-width renderings unchanged EXCEPT the enumerated fluid-consumption approvals" (step-4
    fluid legitimately moves the 1280 header title 30→36px; "byte-identical" would force the executor to skip
    sanctioned consumption or fudge the diff).
- **Provenance** — Carved from WO-ARC-05 on 2026-07-10 (owner-delegated decision), exactly as WO-ARC-07 was
  carved from WO-ARC-03. ARC-05 shipped the fluid-scale foundation; this WO carries the container-query half
  it could not. (The paint-migration language in the Outcome/Steps below is SUPERSEDED by the additive contract
  above and lives in WO-ARC-09.)
- **Outcome** — The workspace-tier components the DS renders at many widths inside one viewport — the table /
  data-table, the preview rail, and the split pane — paint from unlayered engine skins in the WO-ARC-07
  pattern (`tokens/css/engines/{modern,rustic}/skin/*.css`, keyed on the `data-part`/`data-state` contract),
  instead of inline `style={}`. On those real skins, and on the Card skin ARC-07 already shipped, the WO then
  hangs named `container-type: inline-size` contexts (`--ds-container: card|table|rail|pane`) and `@container`
  adaptations: cards stack their meta below a named width, the data-table collapses low-priority columns, and
  rails/panes step density down — presentation only, layout intent stays component-owned (spec §10). The
  opt-in fluid ramps ARC-05 shipped get consumed where the ENG-12 evidence showed cramped or oversized
  extremes. A component adapts to its box, not to the window.
- **Why** — P-08 (proposals.md, APPROVED 2026-07-07) and the P-56 measurement: after ARC-07, exactly three
  components have CSS skins (Button, Card, Input), and the workspace tier the container work targets is not
  among them. `@container` needs a `container-type` ancestor the DS controls; those ancestors are the table
  and workspace-region skins, which must exist first. This WO makes them exist, then adapts them.
- **Depends on** — WO-ARC-07 (the skin pattern + the Card skin to build on; done). Coordinates WO-ENG-12
  (its viewport-matrix capture and responsive counters are extended, never weakened) and consumes WO-ARC-05's
  shipped fluid ramps.
- **Steps** —
  1. Migrate the table/data-table, preview-rail, and split-pane paint from inline `style={}` into unlayered
     `tokens/css/engines/{modern,rustic}/skin/*.css`, in the WO-ARC-07 pattern (measured before-table, a
     mechanical transcription generator, zero-pixel gate against the WO-GAT-01 baselines + the states matrix,
     verified positively that the shipped component carries no inline paint). Each component is a deployable
     checkpoint.
  2. Declare named `container-type: inline-size` contexts on those skins and the Card skin, with the
     `--ds-container: card|table|rail|pane` naming scheme; document which components are containers in the
     behavior contracts. Fold the lone existing `@container` rule (`tokens/css/components/patterns.css:926`)
     into the scheme.
  3. Add the `@container` adaptations (card meta stack, data-table column-priority collapse, rail/pane density
     step-down) — presentation only. Consume ARC-05's fluid ramps where ENG-12 evidence showed the need.
  4. Extend the WO-ENG-12/WO-ENG-02 capture preset with a container-width axis (same component at rail-,
     half-, and full-width in one viewport) under both tenant palettes, to `test-artifacts/architecture/arc-08/`.
- **Acceptance gate** — build + `pnpm test` green (17-failure ledger unchanged); the WO-GAT-01 visual suite +
  the `states.spec.ts` interaction-state matrix green with full-width renderings byte-identical and any
  narrow-container adaptation approved explicitly as a new baseline; `node scripts/engine-token-audit.mjs
  --check` green with the ENG-12 responsive counters unchanged and `viewport-mq-in-skins` at or below
  baseline; sighted container-axis gallery in `test-artifacts/architecture/arc-08/` under a dark-surface
  (rottay) and a light-surface tenant, REVIEWED, showing the same table/rail adapting at rail-width vs
  full-width in one viewport; classic untouched; artifacts regenerated + compiler suite green if a fluid token
  is emitted.
- **Do NOT** — Do not weaken any WO-ENG-12 counter or its 360/768/1280 capture law. Do not move layout intent
  into the engine (spec §10). Do not add viewport media queries to engine skins (`@container` is the
  mechanism). Do not invent fluid magnitudes outside ARC-05's existing ramps. Do not layer the skins (P-47:
  every `rottay-*` layer loses to Tailwind preflight — skins are unlayered, at specificity >= (0,4,0) to clear
  the tenant `*` border floor, P-48). Never `git restore` directories.
- **Size** — L.

### WO-ARC-09 Workspace-tier paint migration to unlayered skins
- **Provenance** — Carved from WO-ARC-08 on 2026-07-10 after measuring the surface (rule: a WO is a hypothesis,
  the code is the law). The container-query VALUE (ARC-08) is deliverable additively without this; this WO is
  the pure paint plumbing, separated because it is XL and has no user-facing change of its own.
- **Measured surface** — ~379 inline `style={}` sites across six workspace-tier components: `primitives/display/Table`
  (62), `patterns/data/data-table` (121), `patterns/data/detail-panel` (74), `patterns/forms/filter-panel` (59),
  `structures/workspace/selection-preview-rail` (41), `structures/workspace/field-filters-panel` (22). Ten times
  ARC-07's ~27 sites across three primitives.
- **Outcome** — Each of the six paints from an UNLAYERED skin keyed on a `data-part`/`data-state` contract
  instead of inline `style={}`, extending ARC-07's maintainability + white-label-reskin benefit to the workspace
  tier. Classic is never touched (Ant Design keeps its own paint), so the migratable surface is modern + rustic
  only (~340 of the 379 sites; the rest are classic).
- **CONTRACT 2026-07-10 (Fable advisory, supersedes the generator language below).** Verified against the code:
  - **Two skin homes, both unlayered, both imported in `foundation/base.css` AND `entrypoints/styles.css`** in
    the existing unlayered block after the `layer(rottay-engines)` import (where the eight ARC-07 skins sit,
    `base.css:62-69` / `styles.css:78-85`): (a) the four engine-split components (Table, data-table,
    detail-panel, filter-panel) use `tokens/css/engines/{modern,rustic}/skin/<name>.css` per the ARC-07 idiom;
    (b) the engine-AGNOSTIC files — the two structures (`selection-preview-rail`, `field-filters-panel`) and the
    three shared data-table files (`cell-editors`, `DataTableMobileCards`, `PatternDataTable`) — use ONE
    engine-agnostic `tokens/css/components/skin/<name>.css`, no `--modern`/`--rustic` discriminator. Production
    proof this home wins: `build-vertical-css.mjs` assembles every dist bundle as `resolveImports(base.css)` +
    Tailwind modern-engine + the tenant artifact unlayered-and-source-LAST, so an unlayered rule in base.css's
    skin block beats Tailwind preflight (P-47) and yields to caller inline `style`.
  - **Two-class roots, specificity >= (0,4,0).** data-table + detail-panel already stamp the engine pair
    (`ds-pattern-data-table ds-engine-modern`, `ds-pattern-detail-panel ds-engine-modern`); filter-panel's root
    is bare `className={className}` and gets the pair added; the agnostic files stamp NOTHING today and get a
    two-class root (`ds-structure ds-selection-preview-rail` etc.) + `data-part`, mirroring
    `.ds-card.ds-card--modern[data-part='root'][data-variant]` for unit count. Any rule that declares
    `border`/`border-color` must reach (0,4,0) to clear the source-later (0,3,1) tenant `*` floor (P-48).
  - **HAND transcription, NO generator.** The paint is not statically extractable (Table's row hover is an
    `onMouseEnter` DOM mutation, not a style object; object merges are spread-order-dependent — the exact defect
    class ARC-07 surfaced). A faithful generator is a CSS-in-JS compiler that reproduces the bugs; an unfaithful
    one is wrong; either needs the same per-cell byte-exact verification the hand path needs. The MEASUREMENT
    half is already mechanical (`RECORD_STATE_MATRIX=1` records 12 computed channels per subject/state): record
    subjects, hand-transcribe against the recorded values, let the byte-exact matrix + screenshots catch errors.
  - **Positive "no inline paint" verification = a NEW audit counter, not a value regex.** Add
    `arc09.inlinePaintProps` to `engine-token-audit.mjs` over an explicit file list (the six components'
    modern+rustic engine files + the five agnostic files; classic excluded by construction), counting paint
    property NAMES inside `style={{…}}` spans — `background*`, `color`, `border*`, `boxShadow`, `outline*`,
    `textShadow`, `fill`/`stroke`, `accentColor`, `filter`/`backdropFilter`, `transform` (state transforms are
    paint) — baselined per file, decrease-only, each checkpoint's exit criterion being that component's files at
    0. Exemptions are property CLASSES, never value patterns: layout (size/padding/margin/flex/grid/position/
    zIndex/display/overflow), the ARC-08 container contract (`containerType`/`containerName` ride inline until the
    skin absorbs them), runtime-measured dynamics (column widths, virtual offsets), and the two residuals ARC-07
    legitimately kept — `opacity` and `animation`. Leave the existing `inlineStateLiterals` counter untouched (it
    measures something else). TRAP: `countViewportMediaQueriesInSkins` walks only `engines/**/skin/` — extend its
    walk to `components/skin/` in the same commit or the agnostic skins escape that ratchet.
  - **Per-component gate.** Table is already gated by the `table` flagship slug (6 committed baselines that
    exercise the primitive paint), but flagships photograph REST only — ADD a `table` states-matrix subject (row
    hover, sortable header, selected row) BEFORE migrating. The five uncovered components do NOT get new flagship
    slugs (heaviest instrument, re-photographs unrelated chrome); use the `container-axis.spec.ts` +
    `/probe/container-axis` ELEMENT-screenshot idiom (data-table + rail already have 16 committed baselines
    there): per component, an inert capture-first pre-step committing element-screenshot baselines (2 tenants ×
    2-3 widths) + states-matrix subjects for every part that paints on hover/focus/press + a Card-pattern
    `*.real-engines.test.tsx` (reads the shipped skin strings via `readFileSync`, asserts the DOM contract,
    `data-state` absent at rest). The matrix is the only instrument that sees states, the screenshots the only
    one that sees rest composition; neither alone is a proof. The real-engines test is required even where the
    counter reads 0, because the counter proves inline paint is GONE, not that the contract that replaced it is
    RIGHT.
- **Depends on** — WO-ARC-07 (the skin pattern + machinery; done). WO-ARC-08 (the container contract data-table
  must preserve; done).
- **Steps** — One deployable checkpoint per component, in the Fable order (Table proven first under its
  pre-existing gate, then the novel agnostic mechanism on the smallest surface, then routine volume, data-table
  last as the compound case): **Table → field-filters-panel → filter-panel → selection-preview-rail →
  detail-panel → data-table.** Each: (pre-step, inert) build the gate coverage above and commit the baselines;
  then record the states subjects, hand-transcribe the skin CSS against the recorded computed values, rewrite the
  engine(s) to stamp the two-class root + `data-*` contract and drop the inline paint object (keeping layout /
  container / measured / opacity / animation residuals), rewrite any test that reads `element.style.*` onto the
  DOM contract or the shipped stylesheet, build, gate zero-pixel, drive the counter for that component's files to
  0, commit. Expect real defects to surface (ARC-07 found ~6 across three primitives); each is a fix + a filed
  proposal, not a papered diff.
- **data-table (the compound case, last)** — its checkpoint MUST carry the three shared files in the same commit
  (`PatternDataTable` renders `DataTableMobileCards` INSTEAD of the engine table below the mobile breakpoint, so
  a migration that skips them still paints inline on every phone), preserve the per-instance `<style>` tags
  (`engines/modern.tsx:904/:1069`), and absorb the ARC-08 `containerType`/`containerName`/`data-col-priority`
  declarations into the skin UNCHANGED (they are the ARC-08 contract, not paint to delete).
- **Acceptance gate** — per component: build + `pnpm test` green (17-failure ledger unchanged); the flagship
  visual suite + the component's element-screenshot baselines byte-identical + its `states.spec.ts` matrix
  subjects green; `arc09.inlinePaintProps` for that component's files at 0 and `engine-token-audit.mjs --check`
  green with `viewport-mq-in-skins` at or below baseline (walk extended to `components/skin/`); the Card-pattern
  real-engines test green; positive verification the shipped component carries no inline paint but the caller's
  own `style` prop; classic untouched. The WO is done when all six are migrated and green.
- **Do NOT** — Layer the skins (P-47: unlayered; specificity >= (0,4,0) for any `border-color`, P-48). Build a
  generator (hand-transcribe; the byte-exact gate is the safety net). Distinguish paint from layout by value
  regex (use the property-name class). Fudge a pixel diff to hide a token-layer finding — stop and file it. Drop
  the data-table shared files from its checkpoint. Touch classic. Never `git restore` directories.
- **Size** — XL.

## Dependency summary

```
WO-GAT-01 (visual-regression CI) ──► WO-ARC-01 (API normalization) ──┐
WO-ENG-04 (state tokens) ────────────────────────────────────────────┼──► WO-ARC-02 (headless core + CSS-first PILOT)
WO-GAT-01 ───────────────────────────────────────────────────────────┘         │  [start-order note: claim after WO-ENG-11
                                                                                │   certifies, unless the orchestrator
                                                                                │   coordinates disjoint Files windows]
WO-ENG-11 (premium signature, HARD — owner law) ──► WO-ARC-03 (fleet migration) ◄┘
                                                            │
                                                            ├──► WO-ARC-04 (custom-engine skin pack API)
                                                            └──► WO-ARC-05 (container queries + fluid scales;
                                                                  extends WO-ENG-12's responsive law)
```

Start order: **this lane runs LAST among the new lanes (owner sequencing law: modern goes premium
FIRST; the architecture restructure comes LATER).** ARC-01 may start once WO-GAT-01 certifies —
it is a types-only sweep on Files disjoint from the ENG lane, but the orchestrator confirms the
window. ARC-02 needs WO-ENG-04 + WO-GAT-01 + WO-ARC-01 and is recommended only after WO-ENG-11
certifies unless the orchestrator explicitly coordinates disjoint Files windows. ARC-03 is HARD
blocked on WO-ENG-11 (never weaken this edge) plus ARC-02, and lands category by category, each
category a deployable checkpoint. ARC-04 and ARC-05 follow ARC-03. Every visual WO's acceptance
gate additionally REQUIRES sighted captures under both tenant palettes (a dark-surface tenant —
rottay — and a light-surface tenant — bithire or evnto; there is no user-facing light/dark
toggle) and runs behind the WO-GAT-01 diff; classic is never touched anywhere in this lane, and
apps see zero API change through `createEngineComponent`.

### WO-ARC-06 Verticals own their tenants in the file tree
- **Outcome** — The file tree says what the architecture says. A vertical is a folder; its tenants live inside it. `evnto` and `themanagementmiami` stop sitting at the same level, because they are not the same kind of thing: one is a product, the other is a customer of a different product.
- **Why** — Owner request 2026-07-09. The flat tree is not cosmetic; it produced two naming fictions this session had to unpick. (a) `packages/core/styles/platform.css` is a BYTE-IDENTICAL copy of `styles/rottay.css` (862,308 bytes each) whose only tenant selector is `html[data-tenant='rottay']` — "platform" is the vertical, "rottay" is its tenant, and the flat namespace let them look like two tenants (filed as P-30). (b) `tokens/ts/brand-themes/{rottay,bithire,evnto}.ts` sit beside each other as peers while `themanagementmiami` was exiled to `tokens/css/legacy/`, which is how a live customer's theme became invisible to everyone reading the tree. A structure that cannot express "this tenant belongs to that vertical" will keep producing decisions that assume they are peers.
- **Depends on** — none, but it should land AFTER WO-ENG-20 (which authors the first second-tenant) so the move has two tenants under one vertical to prove itself against, and after WO-ENG-17 (which makes the vertical the owner of the engine) so the tree and the resolution law agree.
- **Steps** —
  1. Restructure `packages/core/src/tokens/ts/brand-themes/` by vertical: `platform/rottay.ts`, `bithire/{bithire,themanagementmiami}.ts`, `evnto/evnto.ts`, and `_fixtures/torture.ts` (proof fixtures are not a vertical). Keep barrel exports so the public API does not move — the package root must keep exporting the same names.
  2. Do the same for `tokens/css/artifacts/`, and decide what `tokens/css/legacy/themanagementmiami/` becomes: it is 899 lines imported by `entrypoints/styles.css:81` and present 153 times in the built `styles/index.css`, yet app-bithire imports `styles/bithire` (zero occurrences) and the live site therefore falls back to the vertical's default tenant via `ThemeProvider`'s `onFallback` path. It is dead for the product and alive for the full bundle. Prove which consumers load `styles/index.css` before removing anything.
  3. Reconcile the style bundle exports with the tree: `./styles/platform` and `./styles/rottay` cannot both ship 862KB of the same bytes (P-30).
  4. Respect the existing folder lint (`packages/core/scripts/lint-folder-index.mjs`, run by `pnpm lint:folders`). If the rule and the new shape disagree, change the rule deliberately and say why — do not work around it.
- **Files** — `packages/core/src/tokens/ts/brand-themes/**`, `packages/core/src/tokens/css/artifacts/**`, `packages/core/src/tokens/css/legacy/**`, `packages/core/src/tokens/css/entrypoints/*.css`, `packages/core/src/index.ts`, `packages/core/package.json` (the `./styles/*` export map), `packages/core/scripts/build-vertical-artifacts.mjs`, every import of a moved file.
- **Acceptance gate** — The package's public exports are UNCHANGED (a test asserts the same symbol set before and after); `pnpm --filter @rottay/design-system run lint` green including `lint:folders`; `build` green and the emitted `styles/*.css` bundles byte-identical to before EXCEPT the deliberate de-duplication in step 3; `pnpm test` + `test:gates` green with ZERO pixel movement — this is a move, not a redesign, and a moved pixel means a rule changed scope.
- **Do NOT** — Do not change a single token value in this WO. Do not delete the legacy tenant CSS without proving nothing loads it. Do not let the public API move.
- **Size** — M.

### WO-ARC-07 CSS-first skins for the primitives on the headless core
- **Outcome** — The modern and rustic skins of every primitive already reading `behavior/interaction-state` move from inline `style={}` objects to real stylesheets: `@layer`-organized CSS on custom properties, states via `:hover` / `:focus-visible` / `[data-state~='...']` consuming the WO-ENG-04 tokens. classic is never touched. Apps see zero API change through `createEngineComponent`. Every component's pixels are unchanged, proven per component.
- **Why** — carved out of WO-ARC-03 on 2026-07-10. The behavior extraction is mechanical and provable by zero pixel movement across the whole gate. The skin rewrite is a pixel-identical rewrite of two engines per component, and its only honest gate is per-component: bundled with the extraction, a pixel diff has two possible causes and neither can be ruled out. The parts and states are already on the DOM -- `data-part` and `data-state` -- which is what makes a CSS-first skin possible at all.
- **Depends on** — WO-ARC-03 (the parts and states must be on the DOM first).
- **Steps** — one component at a time, in this order: Button (both skins already read the core and it carries a focus ring, a press and a hover), then Card, then Input. Each lands as its own commit with the visual gate green. Stop and report the first component whose inline styles cannot be expressed in CSS without moving a pixel; that is a finding about the token layer, not a reason to fudge the diff.
- **Acceptance gate** — per component: `test:gates` green with the component's own baselines byte-unchanged; `pnpm typecheck`, build, and `pnpm test` green; the inline `style={}` object gone from that component's modern and rustic engines; a DRILL proving the new stylesheet actually paints (delete a rule, watch the visual baseline go red, restore).
- **Do NOT** — do not migrate a component whose interaction state still lives in its engine; wire it to the core first. Do not touch classic. Never `git restore` directories.
- **Size** — L.
