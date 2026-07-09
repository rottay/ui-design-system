# DS Improvement Proposals — Owner Review Inbox

- **Status**: ALL rounds APPROVED by the owner 2026-07-07 — except P-07 (WITHDRAWN, kept for the
  record). Every approved proposal is converted to a `### WO-` block in a lane + a registry entry
  (round 1 + round 3 -> `gates.md` / `tokens.md` / `architecture.md` / the `craft.md` extension;
  round 2 -> `craft.md` WO-CRA-01..05). The inbox is EMPTY pending new proposals; new items follow
  the same law (owner approves 1:1, then a WO block + registry entry — the anti-sprawl law). This
  file remains the historical record of the proposal specs.
- **Date**: 2026-07-07. **Requested by**: davila ("would you improve the DS in any other way?
  we feel behind the best current trends; multi-engine stays; elevate modern to the maximum;
  be certain everything is whitelabel-able per tenant; assess whether the architecture is right").
- **Sources**: the 2026-07-06 visual audit (82 screenshots), the Quiet Premium spec
  (`docs-engineering/engineering/design-system/runtime/engines/modern/README.md`), the roadmap
  re-audit round (2026-07-07), and the current `ui-design-system/CLAUDE.md` architecture contract.
- **Relationship to the approved lane**: WO-ENG-01..11 fixes the WIRING of the modern engine
  (tokens, dark elevation, states, effects, drains, galleries). These proposals address what the
  lane deliberately does not touch: the engine implementation STRATEGY, the color/token engine,
  whitelabel proof, and the 2026 trend gap. Nothing here blocks the ENG lane; sequencing notes
  are per proposal.

## Operating context recorded (owner, 2026-07-07)

app-evnto and app-platform have NO meaningful prod/dev distinction yet: dev is the working
environment and the eventual prod migration is indistinct. Consequence for the DS: aggressive
DS adoption/migration work in those two apps needs no production caution. app-bithire is the
exception — it is live, pins published DS versions, and repins deliberately; DS releases must
keep classic untouched and pass the non-regression gates regardless.

---

## A. Architecture verdict — is the current DS architecture the right one?

**What is RIGHT and must not change**: the 4-tier taxonomy (primitives/structures/patterns/
surfaces) with its decision matrix; the `createEngineComponent` runtime factory and engine
registry; the BrandTheme model (~140 vars) + bounded TenantAppearanceAdvanced + compiler +
generated artifacts as the whitelabel chain; the curated icon factory; the D3 chart family with
personality hooks; the i18n runtime. These are genuinely good bones and ahead of most in-house
systems.

**What is WRONG and produced the "basic and unaesthetic" outcome**: three structural decisions,
not effort.

1. **Full per-engine forks dilute quality by 3-4x.** ~127 components x {classic, modern, rustic,
   custom} means every behavior, a11y detail, and state is re-implemented per engine. No team
   can keep 3-4 premium implementations of 127 components; the audit proved the consequence
   (modern is near-indistinguishable from rustic, and behavior like Button hover/press is
   hand-computed React state per engine). Multi-engine is the right PRODUCT decision; forking
   whole components is the wrong IMPLEMENTATION of it.
2. **Inline-style rendering blocks premium.** Modern components style via inline `style={}`
   objects, so real `:hover`/`:focus-visible`/`:active`, pseudo-elements, container queries, and
   cheap theming are unavailable, and every state transition needs JS. This is why motion and
   states feel dead.
3. **Two sources of truth.** The `.ts` BrandTheme files "MUST stay in sync" with CSS artifacts
   by hand (current CLAUDE.md law), the modern theme.css diverged from what renders (4,563 lines
   mostly dead — being drained by WO-ENG-08), and motion had 3 naming schemes. Manual-sync laws
   always rot; only generated artifacts stay true.

The proposals below unwind exactly these three, keeping multi-engine intact.

---

## B. Proposals

Effort: S (< 1 day agent work) / M (1-3 days) / L (1-2 weeks) / XL (multi-week program).

### P-01 Headless behavior core; engines become skins (XL — the architecture centerpiece)

> APPROVED (owner 2026-07-07) — converted to WO-ARC-02, WO-ARC-03, WO-ARC-04; the lane blocks are now the executable spec.

> **Owner clarification (2026-07-07): modern does NOT disappear — it becomes THE flagship.**
> This proposal changes how engines are implemented INTERNALLY (behavior written once instead
> of three times), not what renders. Everything the WO-ENG uplift builds — the Quiet Premium
> tokens, CSS, and signature — IS the modern skin and is preserved as-is; the refactor moves
> behavior, never appearance. Sequencing honors the owner's instinct: modern goes premium FIRST
> (the approved WO-ENG-01..11 lane, independent of this proposal), and this compatibility
> restructure comes LATER; rustic migrates first as the pilot, modern migrates onto its
> already-premium skin, classic is never touched.

- **What**: extract each component's behavior into ONE headless core (hooks + a `data-part` /
  `data-state` anatomy contract: keyboard nav, focus management, aria wiring, open/close state,
  selection, press/hover states as data attributes). Engines stop being full component forks and
  become STYLE PACKS over the same core: `modern` = the Quiet Premium skin, `rustic` = the
  minimal skin, `custom` = the white-label skin API. `classic` (Ant Design) is exempt — antd
  brings its own behavior; it stays a wrapper and remains the bithire-stability engine.
- **Why**: this is the industry-converged answer (Radix/React Aria/Ark pattern: behavior once,
  skins many) and the only way "elevate modern to the maximum" stays true over time — today any
  premium polish must be re-written twice more or the engines drift apart again. It also makes
  the `custom` engine real: a white-label tenant ships CSS + tokens, not 127 React forks.
- **Sketch**: define the anatomy contract per component family (parts + states); build the core
  under `packages/core/src/behavior/`; migrate component-by-component behind
  `createEngineComponent` (the factory isolates engines, so migration is per-component and
  invisible to apps); rustic migrates first (smallest skin), modern second (on the ENG-lane
  tokens), classic untouched.
- **Sequencing**: after WO-ENG-04 (state tokens exist) or interleaved from there; pilot on
  Button/Input/Tabs/Modal before committing the fleet.
- **Risk**: the largest item here; mitigated by per-component migration + visual-regression CI
  (P-11) + the untouched classic engine as fallback.

### P-02 CSS-first styling with the data-attribute state contract (L)

> APPROVED (owner 2026-07-07) — converted to WO-ARC-02, WO-ARC-03; the lane blocks are now the executable spec.

- **What**: modern (and rustic) skins move from inline styles to real stylesheets (plain CSS
  with custom properties, organized under `@layer` for predictable cascade), keyed off the P-01
  `data-part`/`data-state` attributes. Interaction states become CSS (`:hover`,
  `:focus-visible`, `[data-state=pressed]`) consuming the WO-ENG-04 tokens.
- **Why**: unblocks native pseudo-states, pseudo-elements, container queries, and cheap
  per-tenant theming; kills the per-component JS state styling; reduces SSR payload.
- **Sequencing**: pairs with WO-ENG-04; can begin on components as ENG-04 touches them (do not
  restyle the same component twice — coordinate the Files lists).

### P-03 Retire the dead DaisyUI layer from modern (M)

> APPROVED (owner 2026-07-07) — converted to WO-TOK-03; the lane block is now the executable spec.

- **What**: the audit measured ~zero DaisyUI classes in rendered output while the docs still
  define modern as the "DaisyUI / Tailwind wrapper". Formally drop the DaisyUI dependency and
  the doc claim; rename the engine description to what it actually is (the Rottay-native premium
  skin). WO-ENG-08 already deletes the dead mappings; this proposal removes the dependency and
  fixes the architecture docs + CLAUDE.md engine table.
- **Why**: truthful architecture docs; one less dependency; removes the standing invitation to
  re-diverge (someone "fixing" a component back toward DaisyUI classes).
- **Sequencing**: after WO-ENG-08 lands.

### P-04 OKLCH color engine with generated ramps (L — the biggest whitelabel win)

> APPROVED (owner 2026-07-07) — converted to WO-TOK-02; the lane block is now the executable spec.

- **What**: rebuild the color layer on OKLCH: brand seed colors (per tenant) compile into
  perceptually-even ramps (the `--ds-tint-*` generalization), with automatic ramp derivation
  for dark-surface tenant palettes, `color-mix()` state shades (hover/press), P3 wide-gamut output with sRGB
  fallbacks, and APCA-checked text/surface pairings — all inside `compileBrandTheme`.
- **Why**: today ramps are hand-tuned hex; a tenant with an off-palette brand color gets
  inconsistent tints and unverified dark-mode contrast. OKLCH ramp generation means ANY tenant
  seed color yields a full, even, dark-capable palette mechanically — this is what makes
  "whitelabel per tenant" true for color without per-tenant design work. It is also the current
  industry direction (OKLCH-first systems).
- **Sequencing**: after WO-ENG-06 (color purity — components must consume tokens before the
  token VALUES are re-engineered); artifacts regenerate via the existing pipeline.

### P-05 Hostile-tenant whitelabel proof gate (M — the mechanical answer to "estar seguro")

> APPROVED (owner 2026-07-07) — converted to WO-GAT-03; the lane block is now the executable spec.

- **What**: a synthetic torture tenant checked into the DS (garish clashing palette, extreme
  radius/density, RTL locale + longest-string translations, both schemes) plus a CI gallery run
  that renders the flagship components and surfaces under it and (a) screenshots for the eye,
  (b) probes computed styles for any color/font/radius NOT derived from tokens.
- **Why**: today whitelabel confidence is by construction, not by proof. One gate answers "is
  EVERYTHING per-tenant?" forever, including regressions.
- **Sequencing**: needs WO-ENG-02 galleries; strongest after WO-ENG-06 (zero hardcoded colors).

### P-06 Single-source tokens: artifacts always generated + DTCG alignment (M)

> APPROVED (owner 2026-07-07) — converted to WO-TOK-01; the lane block is now the executable spec.

- **What**: kill the manual "keep .ts and CSS artifacts in sync" law: first-party tenant CSS
  artifacts become build products regenerated in CI (the bithire WO-DES-02 parity/staleness
  pattern generalized to rottay/bithire/evnto/platform), hand-editing an artifact fails the
  gate. Second step: evaluate emitting/accepting the W3C Design Tokens (DTCG) JSON format as the
  interchange layer, so future Figma/tooling sync is a converter, not a rewrite.
- **Why**: manual-sync laws rot (this repo already proved it with theme.css); generated-only is
  the standard; DTCG is where the ecosystem tooling is converging.
- **Sequencing**: independent; coordinates with evnto WO-IDN-06 (which extends the artifact
  pipeline to evnto).

### P-07 Tenant-independent light/dark axis (M)

> **WITHDRAWN (owner decision 2026-07-07)**: there is no user-facing light/dark requirement —
> each tenant defines ONE palette and the engine must render correctly on whatever surface it
> defines. Engine correctness on dark and light tenant surfaces is owned by WO-ENG-03
> (surface-aware elevation) and P-04 (ramp derivation from the tenant seed). Kept for the
> record; do not approve.

- **What**: make the color scheme a first-class axis orthogonal to tenant: every BrandTheme
  compiles BOTH schemes (P-04 derives dark automatically), `data-theme` always honored, and the
  DS contract stops treating "dark" as a property of the rottay tenant.
- **Why**: the visual audit could only reach modern-on-light by switching TENANT — scheme and
  brand are currently coupled. Per-tenant whitelabel requires every tenant to own both schemes.
- **Sequencing**: with P-04; the showroom toggle side arrives in WO-ENG-02.

### P-08 Container queries + fluid scales (M)

> APPROVED (owner 2026-07-07) — converted to WO-ARC-05; the lane block is now the executable spec.

> **Scope note (2026-07-07)**: the BASIC full-responsive law was ratified by the owner and is
> now spec section 13, owned by WO-ENG-12 in the approved lane (intrinsic/token sizing, touch
> targets, viewport-matrix evidence). P-08 remains the deeper MECHANISM upgrade on top of it:
> container-adaptive components and systematic fluid scales.

- **What**: components adapt to their CONTAINER, not the viewport (`@container` for cards,
  tables, preview rails, split panes — the places the DS renders at many widths inside
  workspaces); type/space ramps gain `clamp()`-based fluid tokens.
- **Why**: the DS renders the same pattern at sidebar-width, rail-width, and full-width; today
  only viewport breakpoints exist (`useBreakpoint`). Container queries are baseline-supported
  and are the current responsive standard for design systems.
- **Sequencing**: after P-02 (needs real CSS).

### P-09 View Transitions + scroll-driven motion (M)

> APPROVED (owner 2026-07-07) — converted to WO-CRA-08; the lane block is now the executable spec.

- **What**: adopt the View Transitions API for page/surface-level transitions (Next.js
  supports it) and CSS scroll-driven animations for reveal-on-scroll, replacing JS observers.
  Keep the ratified motion law: 120/200/320ms cadence, stagger-once, `prefers-reduced-motion`.
- **Why**: this is the visible "2026 feel" gap — smooth page-to-page continuity and effortless
  reveals — and it rides the WO-ENG-01 motion canon instead of fighting it.
- **Sequencing**: after WO-ENG-01; surfaces tier first (`ListSurface`/`DetailSurface`
  transitions).

### P-10 Accessibility CI: axe + APCA + focus audit (M)

> APPROVED (owner 2026-07-07) — converted to WO-GAT-04; the lane block is now the executable spec.

- **What**: the WO-ENG-02 gallery pipeline additionally runs axe per component state, APCA
  contrast checks over token pairings in BOTH schemes (stricter and more accurate than WCAG 2
  ratios), and a focus-visible sweep (every interactive part shows the WO-ENG-04 ring).
- **Why**: premium without accessible states is not premium; today only reduced-motion and one
  contrast validator exist. This also hardens whitelabel: P-05 torture tenants get contrast
  checked mechanically.
- **Sequencing**: after WO-ENG-02 + ENG-04.

### P-11 Visual-regression CI on the showroom (M)

> APPROVED (owner 2026-07-07) — converted to WO-GAT-01; the lane block is now the executable spec.

- **What**: Playwright screenshot diffing per PR over the WO-ENG-02 galleries (self-hosted
  diff, no external service): any pixel change to a flagship component/surface must be
  explicitly approved in the PR.
- **Why**: the uplift is worthless if it can silently regress; this is the mechanism that keeps
  premium premium. It is also the safety net that makes P-01/P-02 migrations safe.
- **Sequencing**: right after WO-ENG-02; before P-01 starts.

### P-12 AI-surface kit (M)

> APPROVED (owner 2026-07-07) — converted to WO-CRA-09; the lane block is now the executable spec.

- **What**: promote the AI-product primitives to the DS (domain-agnostic per the promote-to-DS
  test): streaming-text primitive (token-by-token render, shimmer ONLY while live per the
  ratified law), tool-call/receipt cards, preview-diff + confirm cards matching the
  preview-confirm mutation-rail ceremony, agent status/typing indicators.
- **Why**: the AI door is a product pillar in all three verticals; today each app hand-rolls
  these (bithire has an app-level AI trust kit; evnto/platform will need the same). One kit,
  three consumers, honest reuse.
- **Sequencing**: independent; informs evnto WO-EXP-03+ and platform's future capability lane.

### P-13 Component API normalization sweep (M)

> APPROVED (owner 2026-07-07) — converted to WO-ARC-01; the lane block is now the executable spec.

- **What**: one vocabulary for `size` / `tone` / `variant` across ALL primitives and patterns
  (the audit found divergent scales), type-enforced; deprecated aliases kept for one release
  with codemods for the apps.
- **Why**: API consistency is what makes a DS feel designed; it is also what lets agents build
  correct UIs without reading every prop table.
- **Sequencing**: independent; best before P-01 fixes behavior contracts.

### P-14 DS-side quality gates (S)

> APPROVED (owner 2026-07-07) — converted to WO-GAT-02; the lane block is now the executable spec.

- **What**: extend the package gates: an ESLint rule forbidding motion literals
  (`cubic-bezier(`, raw `ms` durations) outside token files; a token-coverage report (which
  `--ds-*` vars each component consumes vs hardcodes); a dead-selector gate generalized from
  WO-ENG-08; a per-component bundle-size budget.
- **Why**: WO-ENG-01..08 clean the tree once; these gates keep it clean at zero marginal cost.
- **Sequencing**: alongside the ENG lane (the eslint rule can ship with WO-ENG-01).

### P-15 Promotion pass: proven app kits into the DS (M)

> APPROVED (owner 2026-07-07) — converted to WO-CRA-10; the lane block is now the executable spec.

- **What**: a systematic promote-to-DS review of the app kits that already passed production
  use in bithire: the `src/ui/details` detail-shell family, signal-card, create-door chooser,
  and the collection table kit overlaps in evnto `src/ui/tables`. Each candidate gets the
  ownership test; what passes moves into structures/patterns with config seams; what fails is
  documented as app-owned forever.
- **Why**: bithire already paid the design cost of these; evnto/platform are about to rebuild
  them (their anatomy lanes). Promoting first means the two adoptions consume instead of fork —
  this was also flagged in the bithire roadmap follow-ups (DS craft pass).
- **Sequencing**: coordinate with the evnto/platform anatomy lanes — highest leverage BEFORE
  their detail/listing WOs execute.

### Round 2 additions (2026-07-07 — owner asked: "would you add anything more?")

### P-16 Keyboard-first interaction model (M)

> APPROVED (owner 2026-07-07) — converted to WO-CRA-03; the lane block is now the executable spec.

- **What**: a DS-level keyboard system: a shortcuts registry with per-surface scopes, roving
  tabindex in lists/tables/menus, j/k-style collection navigation, shortcut hints rendered in
  tooltips, and a cheatsheet overlay wired into the existing CommandPalette.
- **Why**: the defining feel of world-class enterprise tools (Linear-class) is that power users
  never touch the mouse; the DS has the palette but no keyboard model around it. Also compounds
  with P-01 (the headless core owns focus/keyboard once for everyone).
- **Sequencing**: independent; strongest after P-01 pilots land.

### P-17 Instant-feel choreography: optimistic UI + async-state law (M)

> APPROVED (owner 2026-07-07) — converted to WO-CRA-02; the lane block is now the executable spec.

- **What**: standardized pending/optimistic/rollback patterns bound to the canonical
  action-result envelope: button pending states, optimistic row updates with reconciliation,
  undo-window toasts aligned with the mutation-rail receipt ceremony, and a spinner-timing law
  (no indicator before ~150ms; skeleton, not spinner, after; interaction-latency budget tracked).
- **Why**: perceived speed is the most underrated premium signal; today every app hand-rolls
  pending states inconsistently. The receipts/undo side dovetails with the preview-confirm rail
  all three verticals adopt.
- **Sequencing**: independent; informs the app anatomy lanes (their controllers consume it).

### P-18 Craft pass: data visualization + flagship primitives (L)

> APPROVED (owner 2026-07-07) — converted to WO-CRA-04; the lane block is now the executable spec.

- **What**: the polish layer the token work cannot reach: unified chart tooltip/crosshair
  treatment, custom gauge/sparkline rendering, tabular numerals wherever data renders, chart
  palette discipline (defaults that stop inviting rainbow dashboards), plus the flagship
  primitive gaps already recorded in the bithire follow-ups — a REAL Popover primitive (the
  app create-chooser is hand-rolled), Badge tone-pill theming from the artifact (1,082 uses),
  and Combobox/date-range picker quality.
- **Why**: data-heavy screens are where enterprise users live; chart and picker craft is the
  most visible difference between mid-tier and world-class. Evidence-backed by the 2026-07-04
  bithire DS-craft-pass note.
- **Sequencing**: after the ENG lane token foundation; overlaps P-13 (API normalization).

### P-19 Micro-typography pack (S)

> APPROVED (owner 2026-07-07) — converted to WO-CRA-01; the lane block is now the executable spec.

- **What**: variable font with optical sizing, tabular numerals for all data/metric contexts,
  text-wrap balance for headings and pretty for body, correct hyphenation, and typographic
  punctuation defaults — all as tokens/utilities.
- **Why**: the cheapest world-class signal that exists; the audit flagged hardcoded weights
  and letter-spacing, and nothing in the system speaks to numeric alignment in tables today.
- **Sequencing**: anytime; pairs with WO-ENG-07 (scale hygiene).

### P-20 Tenant Brand Studio (L)

> APPROVED (owner 2026-07-07) — converted to WO-CRA-05; the lane block is now the executable spec.

- **What**: productize the showroom theme-builder as a DS pattern consumed by the app-platform
  branding admin: live preview of a tenant BrandTheme against the flagship galleries, OKLCH
  ramp preview (P-04), APCA contrast validation inline, hostile-check probes (P-05 machinery),
  and export to BrandTheme / TenantAppearanceAdvanced.
- **Why**: this turns whitelabel-per-tenant from an engineering property into a PRODUCT
  feature — tenants (or the console operator) style their brand safely with validation, which
  is exactly what a whitelabel platform sells. Platform is the sanctioned DB-branding vertical,
  so the consumer app already exists.
- **Sequencing**: after P-04 + P-05 (it previews real ramps and reuses the proof machinery).

### Round 3 additions (2026-07-07 — owner asked: anything more on animations/transitions/motion?)

### P-21 Motion choreography system: springs, presence, layout motion (L)

> APPROVED (owner 2026-07-07) — converted to WO-CRA-06; the lane block is now the executable spec.

- **What**: the layer ABOVE the WO-ENG-01 token canon — how motion is orchestrated, not just
  timed. Four pieces: (1) **spring physics as tokens** — generate CSS `linear()` spring curves
  from the `BrandTheme.motion` personality (the spring field exists in the contract today and
  drives nothing), so interactive motion feels physical and stays tenant-tunable; (2)
  **presence orchestration** — DS-owned mount/UNMOUNT choreography for modals, drawers, toasts,
  menus, and list items (exit animations are what React apps silently drop; today things pop
  out of existence); (3) **layout motion** — FLIP-based reorder for lists/kanban cards and the
  sliding tab indicator, so position changes glide instead of teleport; (4) **interruptibility
  law** — interactive motion must be interruptible and redirectable mid-flight (springs, never
  fixed keyframes on interactive elements).
- **Why**: a premium engine with perfect duration tokens still feels cheap if elements pop in,
  vanish abruptly, and teleport on reorder. Choreography is what Linear-class products actually
  ship; none of it exists in the DS today (the 10 motion primitives cover entrances only).
- **Guardrail (gate-able)**: compositor-only law — animate `transform`/`opacity` only; an
  engine-token-audit counter flags animation of layout properties (top/left/width/height/
  margin). `prefers-reduced-motion` disables presence/layout motion wholesale.
- **Sequencing**: after WO-ENG-01 (rides the canon); pairs with P-09 (View Transitions own
  page-level continuity; P-21 owns component-level choreography).

### P-22 Micro-interaction catalog (M)

> APPROVED (owner 2026-07-07) — converted to WO-CRA-07; the lane block is now the executable spec.

- **What**: the small moments, tokenized and personality-tunable: number ticker/count-up for
  metric tiles (with tabular-nums so digits do not jitter — pairs WO-CRA-01); skeleton-to-content
  CROSSFADE (content never pops over a skeleton); toast stacking physics + undo countdown ring
  (pairs WO-CRA-02 receipts); collapse/accordion height animation done right
  (grid-template-rows technique, no max-height hacks); icon state morphs (hamburger-to-x,
  copy-to-check success); a data-changed pulse discipline for live cells/rows (ONE subtle
  flash, tenant-intensity-tunable, never looping); and a success/confirm choreography (animated
  check) for completed governed mutations.
- **Why**: micro-interactions are where users FEEL quality without knowing why; today every app
  hand-rolls or skips them. Each item is small; the value is the catalog being consistent,
  reduced-motion aware, and wired to the same `--ds-motion-*`/`--ds-effect-intensity` dials as
  everything else.
- **Sequencing**: after WO-ENG-01 + WO-ENG-04 (states/tokens); several items pair with the
  craft lane (CRA-01 numerals, CRA-02 pending/undo).

---

## C. Whitelabel-per-tenant completeness assessment (today vs target)

| Dimension | Today | Gap closed by |
| --- | --- | --- |
| Brand palette, typography, surfaces, motion personality | BrandTheme ~140 vars + compiler | sound (keep) |
| Per-component chrome (buttons/inputs/table/modal/sidebar) | component CSS-var pattern + TenantAppearanceAdvanced (~140 fields) | sound (keep) |
| Color ramps (incl. dark-surface tenants) from any brand seed | hand-tuned hex ramps; dark-surface contrast unverified | P-04 (+ WO-ENG-03) |
| Effects intensity per vertical (gradients/glow) | unowned before the re-audit | WO-ENG-05 (+ bithire zero-intensity ownership) |
| Engine-local tokens surviving missing tenant attr | fallback literals, silent divergence | WO-ENG-01/03/07 (fallback-parity) |
| Hardcoded colors in components | 78 hex + 30 rgba | WO-ENG-06 |
| Artifact generation honesty (all first-party tenants) | bithire only; others hand-authored | P-06 + evnto WO-IDN-06 |
| Vertical registration openness | closed `VerticalId` union | evnto WO-IDN-06 |
| Locale/RTL per tenant | i18n runtime + tenant `locale` (ratified law in both apps) | sound; proven by P-05 |
| Mechanical whitelabel PROOF | none (confidence by construction) | P-05 (+ P-10 contrast) |
| App class-name neutrality | `rt-*` law in evnto/platform; bithire migrating | app roadmaps (WO-UX-07) |

## D. Suggested review order for the owner

1. **P-11 + P-14** (cheap safety nets — protect everything else).
2. **P-03** (truth in docs, trivial after ENG-08).
3. **P-04 + P-06** (the color/token engine — biggest whitelabel payoff).
4. **P-05 + P-10** (proof gates — "estar seguro que todo es whitelabel").
5. **P-01 + P-02 + P-13** (the architecture centerpiece — approve as a program, pilot first).
6. **P-08 + P-09 + P-12 + P-15** (experience layer and reuse).
7. Round 2 (added 2026-07-07): APPROVED by the owner the same day — converted into the `craft`
   lane (WO-CRA-01..05); the blocks below carry their conversion notes.
8. Round 3 (added 2026-07-07, motion depth): **P-21** (choreography: springs, presence/exit,
   layout motion, interruptibility + compositor-only gate) and **P-22** (micro-interaction
   catalog). Awaiting owner review.

Approving an item means: it gets a full `### WO-` block (bithire format) in a lane —
`engine-modern.md` for ENG-adjacent items, or a new lane file for the P-01 program — plus a
registry entry, and only then enters STATUS.

---

## C. New proposals — found by the WO-GAT-03 whitelabel proof (pending owner review)

These three are DEFECTS the hostile-tenant gate surfaced on 2026-07-09, not ideas. Each is
outside WO-GAT-03's Files fence, so none was fixed drive-by. They are reproducible against
`/probe/whitelabel-torture` and against `packages/showroom/e2e/whitelabel/torture-baseline.json`.

### P-23 Badge renders no chrome when given children (S — a live product defect)

- **What** — `Badge/engines/modern.tsx:215` computes
  `shouldShowBadge = visible && (dot || (formattedValue !== undefined && (Number(formattedValue) > 0 || showZero)))`.
  With `children` and no `content`/`count`, the standalone branch at `:309` is skipped, the
  condition is false, and `:353` returns a bare `<div>{children}</div>` — no background, no
  radius, no padding, no `overflow`/`ellipsis`. `Number('Beta') > 0` is also false, so a string
  `content` passed alongside `children` hides the badge too.
- **Why it matters** — `<Badge variant="success">Ready</Badge>` is the natural API and the form
  used by the WO-ENG-02 badge gallery and the flagship table's status column. Both currently
  render unstyled text under the modern engine; it is visible in
  `test-artifacts/gates/gat-03/torture-dark.png`. This is the likely root cause of the standing
  "bithire badge background weak/absent in production" flag — the cause is neither a DaisyUI
  purge nor a `color-mix`/APCA skip, so WO-TOK-03 will not fix it.
- **Shape** — treat a non-empty string `formattedValue` as showable; keep the numeric
  `> 0 || showZero` rule for `count`. Cross-engine parity check (classic/rustic render the
  label today) and a regression test per engine. Visual baselines will move — intended.

### P-24 A dynamic dark tenant loses its BrandTheme chrome (M — the biggest whitelabel hole)

- **What** — the tenant CSS generator emits a dark block scoped
  `html[data-tenant='x'][data-theme='dark']` (specificity 0,2,1) containing hardcoded literals,
  e.g. `'--ds-card-bg': '#111827'` (`runtime/tenant/storage/static/generator/index.ts:565`).
  The compiled BrandTheme chrome rides in the light block (0,1,1), so the dark block wins and the
  tenant's own `chrome.controls.input.*`, `chrome.cardComponent.*`, and `chrome.modal.*` are
  discarded.
- **Evidence** — torture-dark asks for `input.bg: '#1A0014'` and paints `#0F172A`; it asks for
  `cardComponent.bg: '#120010'` and paints `#111827`. The LIGHT fixture honours the same channels,
  so the defect is dark-path-only. These are the six `not-derived` entries in the GAT-03 baseline.
- **Why it matters** — every DB-driven dark tenant silently renders DS-default inputs, cards, and
  modals. First-party verticals are immune only because their generated artifacts re-state the
  chrome, which is exactly the "true by construction" blind spot P-05 was written to expose.
- **Shape** — the dark block must layer the compiled dark chrome, not literals. Ratchet: the six
  baseline entries drop to zero and the gate holds them there.

### P-25 The app canvas is not a BrandTheme channel (M)

- **What** — `palette.darkBackgroundColor` compiles to `--ds-color-dark-bg` and never reaches
  `--ds-color-bg-primary`, and `BrandPalette` has no light background field at all. The foundation
  is dark-first (`:root { --ds-color-bg-primary: #0A0A0C }`) with no `[data-theme='light']` canvas
  block, so a dynamic light tenant paints light components on a dark canvas — visible in
  `test-artifacts/gates/gat-03/torture-light.png`. Only generated first-party artifacts set the
  canvas per tenant.
- **Why it matters** — the owner's 2026-07-07 decision is that the tenant palette decides the
  ground and there is no user-facing light/dark toggle. That decision is currently unimplementable
  for any tenant that is not first-party. (This is NOT the withdrawn P-07: no toggle is proposed.)
- **Shape** — add a light `backgroundColor` to `BrandPalette`, bridge both background fields onto
  the canvas tokens in the compiler, and extend the GAT-03 probe with a canvas entry once the
  channel exists (today a canvas probe would pass for the wrong reason: the two fixtures differ
  only because each falls back to a different default).
