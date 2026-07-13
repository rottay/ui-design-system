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

## C. Defects found by the WO-GAT-03 whitelabel proof — APPROVED by the owner 2026-07-09

All four are now work orders: P-23 -> WO-ENG-13, P-24 -> WO-TOK-05, P-25 -> WO-TOK-06, P-26 -> WO-TOK-04.

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

### P-26 The brand compiler emits two names per table-row channel; two are dead (S — `core lint` is red on main)

- **What** — `compilers/brand-theme/index.ts:768-771` emits `--ds-table-row-bg-hover` AND
  `--ds-table-row-hover-bg`, `--ds-table-row-bg-striped` AND `--ds-table-row-striped-bg`. Every
  component consumes only the `-bg-hover` / `-bg-striped` spelling (4 and 6 references under
  `src/components/`); the other two have no consumer anywhere in the DS or in app-bithire,
  app-platform, or app-evnto.
- **Why it matters** — `pnpm --filter @rottay/design-system run lint` fails on `audit-integration`
  with two `orphan-premium-var` violations, and has done so since before 2026-07-09 (reproduced
  against commit `494e7d85` in a throwaway worktree). A standing red gate hides the next real one.
  This is a FOURTH pre-existing gate failure, alongside the three known unit failures.
- **Shape** — delete the two dead emissions. Note this is not purely internal: the aliases are
  written into the generated tenant artifacts (e.g. `artifacts/bithire/index.css`), so the change
  must regenerate the artifacts and pass the regenerate-and-diff parity guard. Removing an emitted
  variable is also a public-surface decision for any tenant overriding it, which is why this is a
  WO and not a drive-by deletion.

---

## D. Found while certifying the CRA lane (2026-07-09), pending owner review

### P-27 A pending Button has no accessible name (S — a11y defect)

- **What** — A modern-engine Button in the `pending` state with no `pendingLabel` exposes NO accessible name: the resting label renders `visibility:hidden` + `aria-hidden`, and the visible overlay is a bare spinner SVG. A screen-reader user hears an unnamed button.
- **Why it matters** — Pre-existing (the old grid-based structure had the identical hidden/visible split), and it survives WO-CRA-02's width-stability rewrite. Classic and rustic are unaffected: they keep the original children visible when no label resolves. The WO-GAT-04 axe sweep does not cover a pending button, so no gate sees it.
- **Shape** — Keep the resting label available to the accessibility tree (e.g. `aria-hidden` only on the visual layer, or an `aria-label` derived from the resting content), and extend the axe sweep to a pending button so the gate holds it.

### P-28 A disabled+pending Button keeps its variant color (XS)

- **What** — `Button/engines/modern.tsx` gates the disabled-dim styling on `disabled && !loading`, which never learned about `pending`. A `disabled` + `pending` button (without the deprecated `loading`) keeps its full variant color instead of dimming.
- **Why it matters** — Same shape as the `hoverOverrides` bug WO-CRA-02 fixed (`!loading` → `!busy`), left deliberately unfixed because dimming is a visual decision with an existing comment asserting specific intent. It is a one-line change (`disabled && !loading` → `disabled && !busy`) and it moves pixels, so it wants a sighted check.

### P-29 A public symbol with no consumer is debt with green tests (M — the systemic one)

- **What** — Three unrelated defects found in a single session share one shape: a symbol exists, is typed, is passed around, and **nothing reads it**. Every test was green in all three cases.
  - `--ds-async-spinner-delay` / `--ds-async-skeleton-after` (`tokens/css/foundation/themes/default.css`): defined as tokens; no CSS read them and `useDeferredPending` hardcoded its own numbers, while a comment claimed the hook "mirrors" them. Fixed in WO-CRA-02.
  - `ButtonProps.loadingText`: never destructured in any of the three Button engines, so it leaked onto the DOM as a `loadingtext` attribute and never rendered — while `app-bithire`'s passkey prompt passes it in a live auth flow. Fixed in WO-CRA-02.
  - `BrandCompilerInput.baseTheme`: present in the contract, faithfully passed by callers including `torture-fixtures.test.ts`; `compileBrandTheme` never destructures or reads it. Still open.
  - Adjacent: `--ds-table-row-hover-bg` / `--ds-table-row-striped-bg`, emitted by the compiler and consumed by nothing — the ONLY one of these a gate caught, because `audit-integration.mjs` happens to scan premium chrome vars specifically. Fixed in WO-TOK-04.
- **Why it matters** — Unit tests prove that what runs, runs. They cannot prove that what is declared is read. Type checking cannot either: an unread prop, an unresolved parameter and an unconsumed token are all perfectly well-typed. This class ships silently, teaches consumers a lie (`loadingText` "works"), and creates two sources of truth that drift.
- **Shape** — Generalize `scripts/audit-integration.mjs` beyond premium chrome vars into a **consumer census** with three counters, all decrease-only, each with an allowlist whose entries carry a stated reason:
  1. `--ds-*` tokens defined in `tokens/css/**` with no consumer in `components/**`, `engines/**`, `tokens/css/**`, or a JS token read.
  2. Public component props declared in `*.types.ts` that no engine destructures.
  3. Exported contract fields that no implementation reads (start with `compilers/**` inputs).
- **Gate it bites** — The census must be seeded with a drill, per `roadmap/README.md` rule 3: reintroduce one of the four defects above, watch the counter rise, revert. A counter that has never been red is not a counter.

### P-30 The package ships the same 862KB stylesheet twice (S)

- **What** — `packages/core/styles/platform.css` and `packages/core/styles/rottay.css` are byte-identical (862,308 bytes each), and the package exports both (`./styles/platform`, `./styles/rottay`). `platform.css`'s only tenant selector is `html[data-tenant='rottay']`: "platform" is a legacy name for the rottay tenant, not a second tenant.
- **Why it matters** — Roughly 860KB of duplicated CSS in the published artifact, and a naming fiction that made a work order describe `rottay` as a "showcase tenant" when it is the DS `DEFAULT_TENANT` (`ThemeProvider.tsx:433`) and app-platform's base. The duplication is what allowed the fiction to survive.
- **Shape** — Keep one bundle. Either make `./styles/platform` re-export `./styles/rottay`, or deprecate the `platform` entry with a release-note migration. Verify no consumer imports it (`grep` across the three apps) before choosing. Gate: an assertion in the build that no two emitted style bundles are byte-identical.

### P-31 app-platform's engine flag is inverted (XS, cross-repo)

- **What** — `app-platform/src/core/providers/tenant-provider/index.tsx:78` and `dashboard-providers/index.tsx:203` both read
  `forceEngine={process.env.NEXT_PUBLIC_DS_ENGINE === 'modern' ? undefined : 'modern'}`.
  Setting `NEXT_PUBLIC_DS_ENGINE=modern` sets `forceEngine` to `undefined`, which falls through to the tenant's `engine: 'classic'`. The flag does the opposite of what it says.
- **Why it matters** — Anyone opting into the modern engine by that variable gets classic, silently. It is also the second symptom of the WO-ENG-17 root cause: the tenant registry's stale `engine: 'classic'` is what the fallback lands on.
- **Shape** — `app-platform` is READ-ONLY to this repo. Its own orchestrator owns the one-line fix; record the cross-repo notification in WO-ENG-17's handoff. Once WO-ENG-17 makes the vertical own the engine, both `forceEngine` expressions in app-platform and the hardcoded one in app-bithire become unnecessary.

### P-32 The APCA gate never exercises the treatment it now defaults to (S)

- **What** — `engine-token-audit.mjs:1433-1437` defines the badge pairings as `--ds-badge-{variant}-color` on `--ds-badge-{variant}-bg` — the SOLID tokens, read out of static theme files. WO-ENG-15 flipped the default to `soft`, whose pairing is a `-700`/`-600` text shade on an `--ds-color-alpha-{variant}-10` tint. **The gate cannot see the pairing the design system now ships by default.** Its counter stayed at 6 across the change, and that flatness is mechanical, not evidence.
- **Why it matters** — This is the same shape as WO-TOK-04 (the orphan-var gate scanned one of two compilers) and `source-governance.test.ts:144` (its exception list points at a directory that does not exist, so the check has always scanned nothing). Three gates in one session that were green about something they never looked at. The soft treatment is very likely fine — the executor deliberately routed soft text through the darker `-700` shades precisely because the solid token is tuned for white-on-top, not for small text on its own 10% tint, and bithire and evnto are light-first. But "likely fine" is what a gate is for.
- **Shape** — Add the soft (and outline) pairings to `APCA_PAIRINGS` and re-baseline honestly. If `apcaPairings` rises, the soft treatment has a real contrast problem on a light tenant and WO-ENG-15's text shades need revisiting — do not raise the baseline to absorb it. Seed with a drill per README rule 3.

### P-33 `badgeStyle` has never done anything in the classic engine (S)

- **What** — `Badge/engines/classic.tsx` at commit `9b6f7d86` never destructures the `badgeStyle` prop. It declares `const badgeStyle: React.CSSProperties` (`:138`) — a LOCAL style object reusing the prop's exact identifier — and applies it at `:222`. So `<Badge badgeStyle="soft">` has been a silent no-op in classic since the component existed, and the name collision is precisely why nobody saw it. WO-ENG-15 fixed it while implementing the soft default.
- **Why it matters** — Sixth member of the P-29 dead-symbol class in a single session, and the most instructive: the symbol is not merely unread, it is *shadowed by something that looks like it is read*. Neither TypeScript nor a test can see this — the local is well-typed and genuinely used.
- **Shape** — Fold into P-29's consumer census: for every prop declared in a `*.types.ts`, assert some engine destructures it. A local variable of the same name must not satisfy the check. Seed the census with this exact case as its drill.

### P-34 The personality memo key omits the very field it gates on (S)

- **What** — `SystemCssVariablesBridge.tsx:60` skips its effect unless a shallow fingerprint changes. That fingerprint tracks `colors.primary`, `animation.entrance`, `card.defaultElevation`, `typography.headingWeightBias`, `accent.barPosition`. It does NOT include `card.showBorder` — the exact field WO-ENG-19 exists to fix — nor `hoverElevation`, `hoverTint`, `badgeShape`, `dividerStyle`, `labelStyle`, any `animation.hover*/spring*/pulseSpeed`, or any `chart.*`.
- **Why it matters** — If only `showBorder` changes across a tenant or product-profile switch, the effect skips and the emitted rule keeps a stale value. Pre-existing (the old inline loop had the identical gate), so WO-ENG-19 did not widen its scope to touch it. A memoization key that omits most of what it memoizes is a correctness bug wearing a performance costume.
- **Shape** — Derive the key from the object it guards rather than hand-listing five of its fields, or drop the memo and let React's own dependency comparison do it. Whichever: a test must fail if a personality field is added without the key learning about it.

### P-35 Seven more variables were broken exactly like the two the probe caught (record, no action)

- **What** — WO-ENG-19's executor cross-referenced all 67 variables `resolvePersonalityCssVariables` emits against every `--ds-*` name both compilers emit. Nine collide, all `--ds-card-*`: the two the hostile-tenant probe caught (`--ds-card-border`, `--ds-card-border-hover`) plus `--ds-card-shadow`, `--ds-card-shadow-hover`, `--ds-card-bg-hover`, `--ds-card-hover-transform`, `--ds-card-header-padding`, `--ds-card-body-padding`, `--ds-card-footer-padding`. Independently reproduced by the orchestrator (`comm -12` over the two symbol sets): exactly nine. No other family collides.
- **Why it is worth recording rather than fixing** — WO-ENG-19 fixes all nine structurally, by moving the whole bridge to stylesheet precedence rather than suppressing the colliding names. That choice is what this finding justifies: **suppression would have fixed two and left seven.** The probe found what it happened to probe. A structural fix beats an enumerated one precisely because the enumeration is always short.

### P-36 The rottay artifact and the rottay BrandTheme disagree about the input surface
- **Found** — 2026-07-09, during WO-TOK-08.
- **Evidence** — `tokens/css/artifacts/rottay/index.css:158` hand-writes `--ds-color-bg-input: #0F0F12`. `rottayBrandTheme.chrome.controls.input.bg` is `#131316`, and the compiler now emits that. Same element, same variable, two values one step apart in the surface hierarchy. The artifact wins today because it is declared in the tenant scope and loads later, so no pixel moved (`test:gates` 58/58) — the disagreement is latent, not active.
- **Also** — the same artifact declares `--ds-select-bg: #131316` beside `--ds-color-bg-input: #0F0F12`, so within one file the select surface and the input surface disagree too. Measured live: rottay's native select computes `rgb(19,19,22)` while `--ds-surface-control` computes `#0f0f12`.
- **Why it matters** — `CLAUDE.md` states the `.ts` BrandTheme is the source of truth and the CSS artifact is a generated snapshot. For rottay the artifact is neither generated nor in sync. Whichever value is right, the other is a lie that will be copied by the next tenant someone bootstraps from rottay.
- **Ask** — decide which is canonical, then either regenerate rottay's artifact from its theme or correct the theme. Do not silently align one to the other; one of the two encodes a deliberate choice and the git history will not say which.
- **Update 2026-07-09 (WO-TOK-06)** — two more instances, measured in a browser. Every tenant whose CSS is GENERATED now paints the ground its theme declares: torture-dark asks `#050307` and paints `rgb(5,3,7)`; torture-light asks `#FDFDFF` and paints `rgb(253,253,255)` (it used to paint `#0a0a0c`, a near-black, under `data-theme='light'`); themanagementmiami asks `#FBF6EC` and paints it. The two tenants with HAND-WRITTEN artifacts do not: bithire asks `#F8FBFF` and paints `rgb(255,255,255)`; rottay asks `#0C0C0E` and paints `rgb(10,10,12)`. The artifact literal wins over the theme in both. This is also why the 48 visual baselines did not move — a fact worth stating, because "no pixels moved" reads as safety and here it is a symptom. The generated path is correct; the hand-written path is stale. WO-TOK-01 ("artifacts always generated") is the fix, and this raises its priority.
- **Update 2026-07-09 (WO-TOK-01, after)** — the artifacts are now build products for all three slugs, and `evnto` proves the pipeline: it declares `#131210` and paints `rgb(19,18,16)`. rottay and bithire still disagree with their own themes, **by design**: TOK-01's gate demanded zero rendered delta, so their ground literals survive in the declared residue -- `artifacts/rottay/_source/extension.css:138` writes `--ds-color-bg-primary: #0A0A0C` while `rottayBrandTheme.palette.darkBackgroundColor` says `#0C0C0E`; `artifacts/bithire/_source/extension.css:78` writes `#ffffff` while its theme says `#F8FBFF`. The disagreement moved from a hand-written artifact into a hand-written extension. It is now visible, gated and regenerable -- and still a disagreement. The `.ts` is documented as the source of truth for the ground; for two of three tenants it is not.
- **Status** — OPEN, needs owner decision: pick the canonical value per tenant, then delete the losing literal from the extension. Two candidate answers, one deliberate choice each; the git history does not say which.

### P-37 Two card variant tokens are dead, and no gate can see them
- **Found** — 2026-07-09, while certifying WO-ENG-14. `Card.real-engines.test.tsx` was RED in the working tree and GREEN at the pre-program commit `9d59a97a`. Bisected with `git log -S`: `ad501eca` (WO-ENG-06, "color purity") removed the only consumer of `--ds-card-elevated-shadow-hover` from `Card/engines/modern.tsx` and left the test asserting it. The failure was never attributed because the full suite was not run to completion at the time.
- **Evidence** — `--ds-card-elevated-shadow-hover` (defined `tokens/css/components/card.css:154`, mirrored `tokens/ts/components/card.ts:131`) and `--ds-card-elevated-shadow` (`card.css:153`) now have ZERO consumers across `packages/core/src` and `packages/showroom/src`. The collapse itself is correct: hover elevation became a personality channel (`--ds-card-shadow-hover`, driven by `CARD_HOVER_ELEVATION_MAP` in `runtime/personality/primitives.ts:170`), which is what WO-ENG-03 set out to do. The tokens are simply orphans now.
- **Why the gates missed it** — `audit-integration.mjs` has an `orphan-premium-var` check, but it scans variables *emitted by the compilers*. These two are declared in `tokens/css/components/*.css`, a source the orphan check never reads. There is a whole class of DS-declared tokens that no gate can prove are consumed.
- **Ask** — (a) delete the two dead tokens, or restore them as a real variant channel and decide which layer owns card elevation; (b) extend the orphan check to `tokens/css/components/**`, which is where most of the DS's own tokens live. That is a bigger gate than this WO should grow.
- **Status** — OPEN. The stale assertion has been corrected to the shipped contract; the dead tokens are untouched.

### P-38 There are two Modal component families
- **Found** — 2026-07-09, while attributing a test failure. **Not a new discovery:** WO-ARC-01's own "Why" section already names both (`primitives/feedback/Modal/Modal.types.ts:215` and `primitives/overlay/Modal/Modal.types.ts:15`, each with its own `engines/`, `compound/` and `tests/`), and its Do-NOT assigns the merge decision to WO-ARC-03. Recorded here so the finding is not lost between lanes, not as an independent find.
- **Evidence** — `packages/core/src/components/primitives/overlay/Modal/` and `packages/core/src/components/primitives/feedback/Modal/` both exist, both carry a `Modal.types.ts`, and both are engine-switched. The taxonomy in `CLAUDE.md` puts overlays under `overlay/` and feedback under `feedback/`; a Modal cannot be in both.
- **Why it matters** — This is the shape of every defect this program has found: one path follows a rule, a duplicated path ignores it, and a gate scans only one. A consumer importing `Modal` gets whichever the barrel exports; a fix applied to one is invisible in the other. The Toast `default` variant and the two chrome compilers were exactly this.
- **Ask** — Determine which is canonical, whether both are reachable from the public barrel, and whether any app imports the non-canonical one. Then delete or merge. Needs an owner decision because it may be a breaking export change.
- **Status** — OPEN.

### P-39 Two audit counters are blind to the syntax they exist to police
- **Found** — 2026-07-09, while attributing regressions in WO-ARC-01's certification.
- **Evidence** —
  1. `motion.rawDurationLiterals` reports **0**, while `components/primitives/display/Statistic/engines/modern.tsx:167` contains `animation: 'pulse 2s var(--ds-motion-ease-in-out) infinite'`. The counter scans for a duration in a longhand and cannot see one inside the `animation` shorthand. WO-ENG-01 closed with "all motion literal counters at zero"; that sentence is true and proves less than it sounds like it proves.
  2. `scale.fallbackParityViolations` reports **0**, while `components/primitives/feedback/Skeleton/engines/modern.tsx` shipped four chains of the form `var(--ds-skeleton-animation-duration, var(--ds-motion-slow))` -- a `var()` chain terminating in a variable with no literal. A consumer that loads the design system's JavaScript but not its stylesheet computes an invalid value. Measured directly against `happy-dom`: `getComputedStyle` resolves `var(--a, 2s)` to `2s` and `var(--a, var(--b))` to the string `"var(--a, )"`. The chains are now terminated with a literal; the counter never saw them.
- **Why it matters** — Both counters are load-bearing in `--check` and both were green while the defect they name was in the tree. This is the same shape as `effects.gradientConsumers`, which counted files while the pixels were flat, and as `audit-integration`, which scanned one emitter of two.
- **Ask** — extend `motion.rawDurationLiterals` to parse the `animation`/`transition` shorthands, and `scale.fallbackParityViolations` to require a literal at the end of every `var()` chain in an inline style. Each extension ships with a DRILL.
- **Status** — OPEN.

### P-40 This program shipped regressions that no gate caught
- **Found** — 2026-07-09, certifying WO-ARC-01. Three unit tests were RED in the working tree and GREEN at the pre-program commit `9d59a97a`, verified by running them in a throwaway worktree at that commit.
- **Evidence** —
  | test | passed at base | broken by |
  | --- | --- | --- |
  | `Card.real-engines` hover shadow | yes | `ad501eca` (WO-ENG-06) removed the only consumer of `--ds-card-elevated-shadow-hover` |
  | `Statistic.modern-engine-advanced` | yes | a motion/scale WO retimed the skeleton fallback from `2s` to `1.5s` |
  | `ColorPicker.engine-advanced` | yes | `ad501eca` (WO-ENG-06) changed `placeholder="#000000"` to `placeholder="#RRGGBB"` to lower the `color.modernHexLiterals` counter |
- **Why it happened** — the full suite was never run to completion during the program. An earlier session note recorded "3 stable pre-existing failures"; the real pre-existing count is at least 17, and the number was quoted forward without being remeasured. A partial run plus an inherited number is how a regression becomes a "known failure".
- **Ask** — run `pnpm test` to completion before every close, and keep the failure ledger in `roadmap/README.md` as the contract. Never quote the previous number.
- **The sharpest instance.** The `ColorPicker` break and the `Card` break came from the SAME commit, `ad501eca`, titled "color purity — modern-engine hardcoded colors to tokens". It lowered `color.modernHexLiterals` by editing what the ColorPicker shows the user: the input's placeholder went from `#000000`, a valid example colour, to `#RRGGBB`. The counter was a naive regex over the file text and could not tell a style from a string, so it was paid in copy. The counter now skips content-bearing attributes (`placeholder`, `aria-label`, `title`, `alt`) and is drilled in both directions: a hex in a style position turns it red, a hex in a placeholder does not.
- **Status** — OPEN as a class; the three instances are fixed. WO-ARC-01's executor restored the placeholder and was briefly mis-attributed the break by this orchestrator; the attribution has been corrected here.

### P-41 The default toast was not uniquely broken, and three more variants still are
- **Found** — 2026-07-09, reported by WO-ENG-21's executor, verified against the code.
- **Evidence** — `getAlertStyle()` in `Toast/engines/modern.tsx` had cases only for `success`/`error`/`warning`/`info`. `default` fell through to `{}` — and so do `primary`, `secondary` and `gradient`. All four inherit DaisyUI's own `.alert` defaults (`background-color: var(--alert-color, var(--color-base-200))`, `color: var(--color-base-content)`, from the real `daisyui@5.5.19` package, not this repo's theme.css). WO-ENG-21 fixed `default` because `default` is what was measured; the other three remain.
- **Two more, same component** — (a) DaisyUI's `.alert` sets `border-color` from `--alert-border-color` for EVERY variant, because the modern engine never applies the `alert-success`/`alert-error` modifier classes; the Toast border is un-tenanted across the whole component, including the variants the WO treats as reference-correct. (b) `theme.css:842-864` defines `[data-tenant] .toast .alert-success|-error|-warning|-info` — dead CSS, since those classnames are never applied.
- **A correction to WO-ENG-21's own framing** — its evidence said the Tailwind `animate-fade-in`/`animate-fade-out` classnames bypassed the reduced-motion guard. They did not: `keyframes.css:650` carries a universal `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01s !important } }`, which catches the inline animation too. The classnames were, in fact, entirely dead — never defined anywhere in this repo or in DaisyUI. They bypassed the `--ds-motion-*` canon, not the guard. Removed regardless.
- **Ask** — one WO covering the three remaining variants, the un-tenanted border, and the dead modifier CSS.
- **Status** — OPEN.

### P-42 `themeCss.unreferencedSelectors` marks a compound selector live when any one of its tokens is
- **Found** — 2026-07-10, by WO-TOK-03's executor, verified independently.
- **Evidence** — `engine-token-audit.mjs`'s `auditEngineTheme()` marks a whole compound selector "referenced" if ANY class token inside it matches a rendered `className` anywhere across the 128 modern engine files. So `.join .btn` (`theme.css:688-707`) reads as referenced because `btn` is live elsewhere, while a repo-wide grep proves **no component renders `join` at all**. `.toast .alert-success` (`:841-864`) reads as referenced because `toast` is live via `Notification` and `Message`, while `alert-success` is rendered by nobody. The counter reports `0` and nine whole theme.css sections are dead.
- **Why it matters** — WO-TOK-03's own `Depends on` line calls this counter "the authoritative inventory of surviving class hooks". It is not. This is the same shape as `effects.gradientConsumers` counting files while the pixels were flat, and `audit-integration` scanning one emitter of two, and `color.modernHexLiterals` counting a placeholder as a colour. Four counters, one disease: **each measures a proxy for the thing it is named after.**
- **Ask** — require every token in a compound selector to be proven live, not just one. Ship it with a drill: the nine dead sections must appear the moment the rule tightens.
- **CLOSED 2026-07-10 by WO-TOK-10.** Tightened to `matched.length < checkSet.length`. The counter went from **0 to 51** on the same file, unchanged. Fifty-one rules deleted; `theme.css` fell from 1,692 to 1,351 lines; `test:gates` 89/89 with zero pixel movement, which is what "nothing renders these" means when it is true. A caution for the next person: the first deletion pass used a line-based scanner and left orphaned selector runs with no `{` — grouped selectors span lines. The file was restored from HEAD (one file, never a directory) and re-pruned with a brace-matching parser, one rule per pass, re-measuring between each. Brace balance and orphan-run count are asserted after.
- **Status** — CLOSED.

### P-43 `--ds-badge-hover-transform` is emitted and read by nobody
- **Found** — 2026-07-10, by WO-TOK-09's executor while deciding what its new audit rule could safely check.
- **Evidence** — the canonical personality emitter (`runtime/personality/primitives.ts`) emits it. Grep across `packages/core/src` and `packages/showroom/src` finds no CSS file, no component and no helper that reads it. It is a channel a tenant can set and nothing will honour.
- **Why it was not fixed** — closing it means wiring it into the Badge component, which was outside that executor's fence. It also could not be added to `audit-integration`'s orphan rule without immediately failing the build, so the rule was scoped to what it could guarantee, and the orphan was reported instead of hidden behind a widened exemption. That was the right call and is worth naming as the right call.
- **Ask** — either wire the Badge hover transform to it, or delete the emission. Then extend the orphan rule to personality variables, with a drill.
- **Status** — OPEN.

### P-44 The focus ring is the brand's primary colour, and nothing checks it against the ground
- **Found** — 2026-07-10, by WO-ARC-07's new interaction-state gate, while capturing what a keyboard focus paints.
- **Evidence** — measured in a real browser, ring composited over its own page ground, WCAG 1.4.11 relative-luminance contrast:

  | tenant / engine | indicator | composited ring | vs page ground | verdict |
  | --- | --- | --- | --- | --- |
  | rottay / modern | `outline 2px`, offset 2px | `rgb(255,255,255)` | 19.14:1 | pass |
  | bithire / modern | `outline 2px`, offset 2px | `rgb(58,111,176)` | 4.60:1 | pass |
  | torture-dark / modern | `outline 2px`, offset 2px | `rgb(119,3,89)` | **1.64:1** | FAIL |
  | rottay / rustic | `box-shadow` ring, α=0.20 | `rgb(63,63,65)` | **1.82:1** | FAIL |
  | bithire / rustic | `box-shadow` ring, α=0.12 | `rgb(214,213,210)` | **1.31:1** | FAIL |
  | torture-dark / rustic | `box-shadow` ring, α=0.55 | `rgb(148,11,111)` | **2.14:1** | FAIL |

- **The defect** — the ring is painted in the tenant's primary colour with no contrast guarantee against the surface it is drawn on. `outline-offset: 2px` puts it on the page ground, so the relevant comparison is ring-against-ground, and a tenant whose primary is close to its own ground gets an invisible keyboard affordance. The two engines disagree on the mechanism as well: modern draws an `outline`, rustic draws a low-alpha `box-shadow`, and rustic's alpha (0.12 on bithire) cannot reach 3:1 against anything.
- **Why the a11y gate is silent** — WO-GAT-04's axe harness has no rule for focus-indicator contrast; no automated axe rule does. The 48 visual baselines never focus a control. Both gates were green while four of six rings were unusable.
- **Why ARC-07 did not fix it** — ARC-07's own gate is "not one pixel moves". Fixing the ring moves pixels in four of six cells by construction. Repairing it inside a pixel-identical migration would have meant re-recording the very matrix that proves the migration is faithful.
- **Ask** — one WO. Derive the ring from a contrast-checked token rather than from `--ds-color-primary` directly: pick the tenant's primary when it clears 3:1 against `--ds-color-bg-primary`, otherwise fall back to the ground's own high-contrast ink. Give rustic the same mechanism as modern, or give its `box-shadow` ring an alpha the contrast maths can actually satisfy. The gate already exists: `states.spec.ts` records the ring per tenant per engine, and `_internal/a11y/contrast` already computes the ratio. Ship it with a drill that lowers a tenant's ring contrast and watches the WO's new assertion go red.
- **SCOPING, measured 2026-07-10.** This is bigger than a token swap, for three reasons found by tracing it:
  1. **Modern's failure is a fixture, the real failures are rustic.** `--ds-focus-ring-color` = `var(--ds-color-primary)` fails 3:1 only on torture-dark (a test fixture). Every REAL tenant's modern ring passes. The failing real-tenant rings (rottay 1.82:1, bithire 1.31:1) are all the RUSTIC `box-shadow` ring, whose colour is `--ds-button-focus-ring` — a low-alpha tint (α=0.20 on rottay, 0.12 on bithire) that no contrast maths can lift to 3:1 without changing its alpha, i.e. changing what the ring looks like on every tenant. That is a focus-affordance redesign, not a derivation, and it moves baselines by design.
  2. **The compiler seam collides with WO-TOK-02's deferred rottay architecture.** `--ds-focus-ring-color` would be derived in `brandThemeToCssVariables`, which emits the LIGHT block. rottay is dark-surface: its default rendering is the hand-authored extension, and its compiled block is shadowed by that extension (the exact `[data-theme='light']`-scoped asymmetry WO-TOK-02 documented and deferred to WO-ENG-22). So a compiler-emitted ring colour would not even be visible on rottay's default until that selector architecture is resolved — the same blocker, hit from a second direction.
  3. **The compiler already has the pieces.** `isDarkSurfacePalette`, a resolved `ground`, and a re-exported `apcaContrast` are all in `compilers/brand-theme/index.ts`. The derivation is a ~10-line function; the build gate is a copy of `checkGeneratedRampApca`. The work is not the maths, it is the two blockers above.
  So this WO must land AFTER (or alongside) WO-ENG-22's rottay artifact-selector fix, and it must make an explicit decision about the rustic ring's appearance. Not a quiet defect fix.
- **Status** — OPEN, sequenced behind WO-ENG-22, with a design decision on the rustic ring.
- **Note.** P-52 and P-55 fixed the two members of this family that WERE mechanical (a foreground colour that ignores its ground). P-44's remainder is the part that is genuinely a design change.

### P-45 No visual baseline photographs a ramp consumer
- **Found** — 2026-07-10, while certifying WO-TOK-02.
- **Evidence** — WO-TOK-02 replaced 171 published token values across the three first-party artifacts (every `--ds-color-{role}-{50..900}` step for every tenant). The 48 visual baselines and the whitelabel torture probe were **99/99 green, unchanged**. Yet those tokens have 1,061 consumer sites in `packages/core/src` and `packages/showroom/src` — `Tag.types.ts` (30), `Charts.types.ts` (30), `avatar.css` (23), `theme.css` (21), `DatePicker/engines/rustic.tsx` (21), among others.
- **The defect** — the gate is not wrong, it is blind in a specific place: none of the components that consume a numbered ramp step appear on the photographed pages. A change to every tenant's entire colour scale produced no visual evidence, in either direction. Had the derivation been wrong, the suite would have said the same thing it said when it was right.
- **The sharpest instance.** evnto's primary and secondary ramps did not merely change value, they changed DIRECTION: `--ds-color-primary-50` was `#171717` (near-black) running to `-900: #fafafa` (near-white), inverted, with the source file's own comment admitting it. WO-TOK-02 corrected them to `50: #FCFCFC → 900: #0D0D0D`. A tenant's entire primary scale flipped end for end and all 99 visual assertions were green.
- **Why it matters** — this program's recurring disease is a measure that stands in for the thing it is named after (`effects.gradientConsumers` counted files while the pixels were flat; `themeCss.unreferencedSelectors` read `0` on 51 dead rules). Here the measure is honest and simply does not reach. The result is the same: green tells you nothing about the change you made.
- **Ask** — one WO. Add a `ramp` fixture to the torture probe rendering a Tag, an Avatar and a chart legend for each of the seven roles, and take a baseline per tenant. Then a ramp change must show its diff, and a reviewer approves a picture instead of a hex.
- **Status** — OPEN.

### P-46 The artifact emitter is guarded; its twin is not
- **Found** — 2026-07-10, while committing WO-TOK-02.
- **Evidence** — `packages/core/src/tokens/css/artifacts/{bithire,evnto,rottay}/index.css` is generated by `build-vertical-artifacts.mjs`, and `lint:artifacts` (`--check`) regenerates and diffs it, chained into both `lint` and `pretest`. A hand-edit fails the build. `packages/core/styles/{index,modern,platform,rottay,bithire,evnto}.css` is generated by `build-vertical-css.mjs`, is tracked in git, and **nothing regenerates or diffs it**.
- **What that permitted** — WO-TOK-10 deleted 51 dead selectors from `engines/modern/theme.css` and committed. The generated bundles kept all 51. They were only regenerated as a side effect of a later build, arriving as a 2,187-line deletion in an unrelated working tree. For the interval between, the repo shipped bundles that disagreed with the source they are built from, and every gate was green.
- **The shape** — this is the same defect the program has now found in `audit-integration` (scanned one emitter of two), in the chrome variables (one compiler honoured a rule, its twin ignored it), and in `ThemeProvider` vs `compilers/brand-theme` (one stamped `'none'`, the other guarded against it). **A rule lives in one emitter and its twin ignores it, while the gate scans only one.**
- **Ask** — give `build-vertical-css.mjs` the same `--check` mode `build-vertical-artifacts.mjs` has, and chain it into `lint` and `pretest`. Ship it with a drill: hand-edit one byte of `styles/rottay.css` and watch `pnpm lint` reject it.
- **Status** — OPEN.

### P-47 Every design-system cascade layer loses to Tailwind's reset, so no DS layer can paint a component
- **Found** — 2026-07-10, by WO-ARC-07, on the first attempt to move a component's paint out of inline styles.
- **Measured in the shipped bundle**, on the real `rottay/modern` button, not reasoned from the spec:

  | step | `background-color` | `border-radius` | `border-top-width` |
  | --- | --- | --- | --- |
  | 1. as shipped (inline `style` present) | `rgb(255,255,255)` | `10px` | `1px` |
  | 2. inline `style` removed | `rgba(0,0,0,0)` | `0px` | `0px` |
  | 3. + rule in `@layer rottay-engines`, specificity (0,2,0) | `rgba(0,0,0,0)` | `0px` | `0px` |
  | 4. + the identical rule, **unlayered** | `rgb(4,5,6)` | `7px` | `6px` |

- **What it means** — with the inline style gone, Tailwind's preflight owns the button: `@layer base { button { background-color: transparent; border-radius: 0 } }` plus `* { border: 0 solid }`. `foundation/base.css` declares seven layers (`rottay-reset … rottay-responsive`) and then imports Tailwind, whose own `theme` / `base` / `utilities` layers are absent from that statement and therefore sort **after** all of them. Layer order beats specificity, so a DS engine rule at (0,2,0) loses to a preflight rule at (0,0,1). Step 4 shows an unlayered rule wins, which is why the modern engine paints inline: **inline style was the only place in this cascade a skin could stand.**
- **Corollary, also measured** — a `@layer rottay-engines` rule for `.alert` does not move DaisyUI's `.alert` (`oklch(0.165 0.005 286)` before and after); unlayered, it does. `engines/modern/theme.css` lives in `rottay-engines`. Every rule in it that targets a DaisyUI class is structurally incapable of overriding DaisyUI, independent of whether the class is rendered. This is the mechanism behind **P-41**: the modern Toast's variants "inherit DaisyUI's own `.alert` defaults" not because a case was missing, but because theme.css cannot reach them.
- **And it blinds a counter** — `themeCss.unreferencedSelectors` (WO-TOK-10) asks "does any component render this class?". The load-bearing question is "does this rule win?". A rendered class whose rule is out-layered is exactly as dead as an unrendered one, and the counter reports it live. The fifth instance of the program's recurring disease: **a measure standing in for the thing it is named after.**
- **Consequence for WO-ARC-07** — the WO's premise ("move the paint into a stylesheet keyed on the anatomy contract") is sound; its unstated assumption (that a DS layer can hold that stylesheet) is false. A CSS-first skin must be **unlayered** — the one position that beats preflight and DaisyUI while still yielding to a consumer's own inline `style` prop, which is the precedence the inline object has today.
- **Ask** — beyond ARC-07's own fix: decide the DS's intended relationship to Tailwind's layers. Either name them in the order statement (`@layer theme, base, components, rottay-reset, …, rottay-engines, utilities`) so the engine outranks the reset while Tailwind utilities still win, or accept unlayered engine skins as the contract and say so in the architecture doc. Then audit `engines/modern/theme.css` for rules that can never win, with a drill: a rule that loses on layer order must be reported by the audit, not counted as live.
- **A consequence WO-ARC-04 hit from the other side.** Its executor traced the rustic Button, found every visual property set inline, and concluded that a skin pack's `css` field "only works for pseudo-elements and the handful of properties an engine's inline object omits" -- so `tokenOverrides` was the only real reskinning lever. That was true, and it was a symptom of this defect, not a property of skin packs. With Button and Card now painting from unlayered stylesheets keyed on `[data-part]`/`[data-state]`, a pack's `css` reaches them the way WO-ARC-04's contract always promised. The remaining components inherit it as ARC-07 migrates them.
- **Status** — OPEN. ARC-07 proceeds with the unlayered skin, which the measurement above justifies and the interaction-state matrix verifies.

### P-48 A tenant's `*` border floor outranks every single-class component rule
- **Found** — 2026-07-10, by WO-ARC-07, the moment the Button stopped painting inline.
- **Evidence** — every first-party tenant's `_source/extension.css` ships, unlayered:

  ```css
  html[data-tenant='rottay']:not([data-theme='light']):not(.light) {
    *, ::after, ::before, ::backdrop, ::file-selector-button {
      border-color: var(--ds-color-border);
    }
  }
  ```

  Its own comment explains the intent: Tailwind preflight sets `border: 0 solid` on `*`, which leaves `border-color: currentColor`, and on a dark tenant that is white. The floor replaces it with the tenant's border token.
- **The defect** — the selector's specificity is **(0,3,1)**. Every design-system component rule written as `.rottay-thing[data-variant='x']` is (0,2,0) and loses its border colour to it. The floor is meant for elements that have no opinion; it currently beats elements that do. The Button never noticed because it painted inline, at a precedence nothing in a stylesheet can reach — which is precisely how a defect of this shape stays invisible for a year.
- **Confirmed on the real bundle** — with the Button's inline style removed, rottay's primary button rendered `border-top-color: rgb(28,28,32)` (`--ds-color-border`) instead of the `transparent` its own `--ds-button-primary-border` declares. WO-ARC-07 clears it by reaching (0,4,0); it does not fix it.
- **Ask** — one WO. Wrap the floor's selector so it cannot outrank components: `:where(html[data-tenant='…']:not([data-theme='light']):not(.light)) *, …` drops it to (0,0,0), which still beats preflight's `*` by source order and yields to any component rule. Then audit which components' borders change, because those are the ones the floor has silently been painting. Ship it with a drill: a component that declares its own `border-color` must win, and an element that declares none must still get the tenant's token.
- **Status** — OPEN.

### P-49 Two tests fail intermittently under full-suite load, and the ledger cannot see it
- **Found** — 2026-07-10, running `pnpm test` twice in a row on an identical tree during WO-ARC-07's certification.
- **Evidence** — run A: 21 failures. Run B, same tree, same command: 17 failures, matching `roadmap/README.md`'s ledger test-for-test. The four-test delta was one real regression (`token-fidelity`, fixed in WO-ARC-07) and three intermittent failures across two files:

  | file | failure in run A | in run B | in isolation |
  | --- | --- | --- | --- |
  | `patterns/data/list-toolbar/tests/ListToolbar.integration.test.tsx` | `Unable to find an accessible element with the role "button" and name /create event/i` (×2) | passed | 3/3 passed |
  | `surfaces/pages/workspace/collection-workspace/tests/CollectionWorkspace.test.tsx` | `renders a direct Export button when a single format is configured` | passed | 35/35 passed |
  | `surfaces/pages/admin/audit/tests/AuditSurface.test.tsx` | `Unable to find an element with the text: user.created` (observed 2026-07-10, during WO-ARC-07's Card certification) | passed on the re-run | 2/2 passed |

- **A fourth instance, and a mechanism.** `structures/record/edit-fields/tests/EditFields.test.tsx` joined the family on 2026-07-10 (`Unable to find an accessible element with the role "button" and name "Hide more fields"`), and its shape names the cause: it awaits `findByRole`, then calls `rerender`, then queries **synchronously** with `getByRole`. Every component here mounts through an engine's lazy boundary, so a query that does not wait can run before the re-render has resolved -- usually it does not, under full-suite load it does. All four files mix sync `getBy*` with async `findBy*`: EditFields 8/21, ListToolbar 3/1, AuditSurface 4/2, CollectionWorkspace 3/24. The EditFields instance is fixed by awaiting the query, which is strictly more correct and cannot regress anything.
- **A third instance, same shape** — every one of them fails to FIND a rendered element under full-suite load and passes alone. That is a rendering or timing leak, not three unrelated bugs.
- **Why it matters** — the ledger is the contract this program certifies against: "17 failures, and here is each one." A suite that returns 17 or 21 depending on the run makes that contract unfalsifiable, and it is exactly how a real regression gets waved through as "one of the known flaky ones". This program has already been burned once by an inherited failure count (P-40).
- **A REPRODUCER, 2026-07-10.** Two files, run together, fail in either order:

  ```
  npx vitest run --config vitest.config.ts \
    src/components/patterns/data/list-toolbar \
    src/components/surfaces/pages/workspace/collection-workspace
  #  x ListToolbar > renders the compact mobile toolbar through the modern engine  (1808ms)
  #    Unable to find an accessible element with the role "button" and name /create event/i
  #  Tests  1 failed | 40 passed (41)
  ```

  Each file alone passes. Order does not matter, so it is not sequential pollution -- vitest runs the two files in parallel threads, and the failing test spends **1808ms** before giving up. `findByRole`'s default timeout is 1000ms. The button it cannot find lives behind an engine's lazy boundary; under CPU contention the chunk does not resolve inside the window.

  **CORRECTION, same day.** This entry first called the reproducer "deterministic", on two observations out of two. Measured properly under a machine running six agents: **3 failures in 11 runs**. It is a probabilistic race whose failure rate rises with load, not a certainty. Two observations are not a rate. The distinction matters: a fix validated against a reproducer that fires 1 run in 4 has told you almost nothing, and one candidate fix passed that reproducer 15 times in a row while breaking **498 of 795 tests** in `src/components/primitives/display` and doubling that subset's wall time. A race is closed by measuring the class, never by watching the instance.
- **The fix is not a longer timeout.** Widening a race window hides it. Make the resolution deterministic -- preload the engine module in the test setup, or render through a resolved component -- so the assertion no longer competes with a scheduler.
- **Ask** — one WO. Start from the reproducer above. Then sweep every `getBy*` that follows a `rerender` or a preceding `await findBy*` in a `renderSurface`/engine-lazy tree and make it wait. Then, if instances remain, reproduce under `--sequence.shuffle` with a fixed seed to find the polluting test, or `--pool=forks --poolOptions.forks.singleFork` to prove it is cross-test state rather than timing. Fix the leak; do not raise a timeout. Then record in the ledger that the count is exact, not typical.
- **Status** — OPEN.

### P-50 The rustic Button drops the busy posture the modern Button honours
- **Found** — 2026-07-10, by WO-ARC-07, while checking whether the rustic skin could be keyed on `data-state` without guards.
- **Evidence** — measured, not read:

  | render | `data-state` after `pointerEnter` / `pointerDown` |
  | --- | --- |
  | `<ModernButton pending>` | `disabled` — no hover, no press |
  | `<RusticButton pending>` | **`hovered`** |
  | `<RusticButton loading>` | **`pressed`** |

- **The cause** — `Button/engines/modern.tsx` constructs the triad with `useInteractionState({ disabled: disabled || busy })`. `Button/engines/rustic.tsx` constructs it with `useInteractionState({ disabled })`. A busy rustic button therefore publishes hover and press on the DOM, and its inline paint only partly compensates: the guards read `!loading`, not `!busy`, so a `pending` rustic button paints its hover background while a `pending` modern button does not.
- **Why this one stings** — `behavior/anatomy.ts` opens with the sentence this defect violates: *"a state that one engine honours and its twin silently drops is the defect this design system has found nine times."* WO-ARC-02 centralised the triad so the two skins could not disagree about what a press is. They still disagree about whether a busy control has one, because the disagreement moved into the hook's argument.
- **Consequence for CSS-first skins** — a skin keyed on `[data-state~='hovered']` would animate a busy rustic button. Encoding `:not([data-loading])` into the stylesheet would carry the defect forward into the layer meant to be free of it.
- **Ask** — pass `disabled: disabled || busy` in the rustic engine, drop the now-redundant `!loading` guards, and pin it with a cross-engine parity test that renders both engines busy and demands the same `data-state`. Any component that takes a busy prop should be swept the same way.
- **Status** — OPEN.

### P-51 A modern Card that says it is clickable cannot be clicked by a keyboard
- **Found** — 2026-07-10, by WO-ARC-07, while checking whether the Card's focus ring could be certified before migrating it.
- **Evidence** — rendered, not read:

  | `<Card clickable />` | `cursor` | `tabindex` | `role` |
  | --- | --- | --- | --- |
  | modern | `pointer` | **absent** | **absent** |
  | rustic | `pointer` | `0` | `button` |

- **The cause** — `Card/engines/modern.tsx` gates the tab stop on `onClick`: `tabIndex={onClick ? 0 : undefined}`, `role={onClick ? 'button' : undefined}`, `onKeyDown={onClick ? handleKeyDown : undefined}`. Its cursor, though, is gated on `clickable || onClick`. `Card/engines/rustic.tsx` gates all of them on `clickable || onClick`.
- **What it costs** — a modern card with `clickable` and no `onClick` paints a pointer cursor, announces nothing to a screen reader, takes no focus, and its Enter/Space handler is unreachable. The same markup under rustic is a focusable button. Same prop, same component, two answers.
- **A second, quieter consequence** — `cardStyle`'s focus branch is `isFocused && onClick ? <shadow>, <ring> : <shadow>`. On a `clickable`-only card that branch can never run. It is not merely unreachable in the modern engine: it is unreachable *by construction*, and no test in the suite notices, because no test focuses a Card.
- **Why ARC-07 did not fix it** — it is behaviour, not paint, and ARC-07's gate is pixel-identical. But it **blocks** the Card skin: a stylesheet that keys the ring on `[data-clickable][data-state~='focus-visible']` would be keying on a state the modern engine cannot enter.
- **Ask** — one WO. Gate `tabIndex`, `role` and `onKeyDown` on `clickable || onClick` in the modern engine, matching rustic and matching its own cursor. Pin it with a cross-engine parity test in the shape of `Button.busy-parity.test.tsx`. Then add a clickable Card to a probe slug of its own — not to the flagship gallery, whose 48 baselines must not move — so `states.spec.ts` can photograph the focus ring the skin is about to inherit.
- **CORRECTION 2026-07-10, before any fix was written.** The direction above is wrong, and the code said so. `handleKeyDown` in the modern engine only calls `onClick` when `onClick` exists, so "gate the tab stop on `clickable || onClick`" would have minted a `role="button"`, focusable element with no activation path. Rendered and measured instead:

  | `<Card clickable />` | `role` | `tabindex` | Enter fires `onClick` |
  | --- | --- | --- | --- |
  | modern, `clickable` only | absent | absent | n/a |
  | modern, with `onClick` | `button` | `0` | **yes** |
  | rustic, `clickable` only | `button` | `0` | no handler exists |
  | rustic, **with `onClick`** | `button` | `0` | **no** |

  `Card/engines/rustic.tsx` contains **zero** `onKeyDown`. It announces every `clickable || onClick` card as a button, gives it a tab stop, and a keyboard user cannot activate it — not even when a handler is passed. That is WCAG 2.1.1: the function is available to a mouse and not to a keyboard. The modern engine is correct on both counts; a `clickable`-only card is a styling flag, and styling a card as clickable is not a promise that it does anything.

- **Restated ask** — give the rustic engine the modern engine's `handleKeyDown`, and gate its `role` / `tabIndex` on `onClick`, not on `clickable`. Pin both engines with a cross-engine parity test in the shape of `Button.busy-parity.test.tsx`. The Card skin can then key its focus ring on a state both engines can actually enter.
- **Method note** — this proposal was filed from a rendered `tabindex` and a read of one engine. One more render, of the other engine, reversed it. "A work order is a hypothesis, the code is the law" applies to proposals too, and to the ones this program writes about itself.
- **Status** — OPEN. Card's CSS-first migration is blocked on it.

### P-52 The classic engine paints white text on a white button, on the platform's own brand
- **Found** — 2026-07-10, by a sighted check of `/structures/record/edit-fields` under two tenants, the acceptance-gate item WO-CRA-10's executor could not run.
- **Evidence** — the showroom's three-engine comparison renders one Save button per engine. On rottay, the classic column's button is a white rectangle with no readable label. Measured on the torture probe, per engine, per tenant:

  | tenant / engine | background | text | contrast |
  | --- | --- | --- | --- |
  | rottay / classic | `rgb(255,255,255)` | `rgb(255,255,255)` | **1.00:1** |
  | rottay / modern | `rgb(255,255,255)` | `rgb(12,12,14)` | 19.54:1 |
  | rottay / rustic | `rgb(255,255,255)` | `rgb(12,12,14)` | 19.54:1 |
  | evnto / classic | `rgb(232,232,224)` | `rgb(255,255,255)` | **1.14:1** |
  | bithire / classic | `rgb(58,111,176)` | `rgb(255,255,255)` | 5.15:1 |

- **The cause** — `runtime/engines/AntdConfigProvider.tsx` maps nine antd tokens from `--ds-*` variables. `colorTextLightSolid` — the colour antd paints ON a solid primary surface (`.ant-btn-primary`, `.ant-tag`, `.ant-badge-count`) — was not among them, so antd kept its own default of `#fff`. It is not derived from `colorPrimary`; antd treats it as an independent map token. Every tenant whose primary is light therefore got an invisible label.
- **Why no gate saw it** — WO-ENG-22's `contrast.spec.ts` never selects an engine, so it measured the probe's default, `modern`. Its primary-button selector is `.rottay-button--primary`, a class the antd button does not carry. The classic engine has been outside every contrast assertion since the gate was written.
- **FIXED 2026-07-10.** `colorTextLightSolid` now maps to `--ds-color-text-on-primary` (rottay `#0c0c0e`, bithire/evnto `#fff`), and `contrast.spec.ts` gained four assertions for the classic primary button, one per tenant. Drilled in the correct order: the assertions were written first and went red on rottay (delta 0.0) and evnto (delta 23.6); the mapping turned them green. Full gate 122/122, no baseline moved.
- **Status** — CLOSED, with P-53 open behind it.

### P-53 The classic engine's select, badge and input are still outside every contrast assertion
- **Found** — 2026-07-10, while closing P-52.
- **Evidence** — `contrast.spec.ts` measures four controls. P-52 added an engine axis for exactly one of them, the primary button, because the other three have antd handles of their own (`.ant-select-selector`, `.ant-input`, `.ant-badge-*`) that the current selectors do not match. Measured on the torture probe under `engine=classic`: `.ant-select-selector` × 4, `.ant-input` × 6, `[class*="badge"]` × 2 — all present, none asserted.
- **Why it was not closed in the same pass** — opening the whole gate to classic could turn up several defects at once, and a red gate left standing is worse than a named gap. This is that name.
- **Ask** — one WO. Give `CONTROLS` a per-engine selector map, run all four controls across all three engines and all four tenants (48 assertions), and fix what turns red. The classic engine is Ant Design's tokens, not the DS's; every one of them that the DS does not map is a default antd chose for a light theme.
- **Status** — OPEN.

### P-54 The modern Input's focus outline has never rendered
- **Found** — 2026-07-10, by WO-ARC-07, while measuring what the Input paints before moving its paint into CSS.
- **Evidence** — focus a modern Input on rottay and read the element back:

  ```
  inline, after focus : outline: var(--ds-focus-ring-width, 2px) solid var(--ds-input-shadow-focus, var(--ds-focus-ring-color))
  computed            : outline-style: none
  ```

  `--ds-input-shadow-focus` is a **box-shadow value**, not a colour: `0 0 0 3px rgba(255,255,255,0.10)` on rottay, `0 0 0 1px #3A6FB0` on bithire, `0 0 0 5px rgba(255,0,170,0.4)` on torture-dark. Substituted into `outline: <width> solid <color>` it makes the declaration invalid at computed-value time, and the browser drops the whole thing. The `var(--ds-focus-ring-color)` fallback never runs, because the custom property IS defined — `tokens/css/components/input.css:121` defines it for every tenant.
- **What the user actually sees** — a two-layer halo drawn by `box-shadow` from a rule in `@layer rottay-personality` keyed on `:focus-visible`. That rule is correct and is doing the whole job. Text inputs match `:focus-visible` even when focus arrives from a pointer, per the CSS selectors spec, so a click rings them too, which is the right behaviour for a field.
- **Two smaller consequences** — on focus the element also loses the resting `outline: 2px solid transparent` that `buildShellStyle` sets, because the same declaration is what gets dropped; and the `flushed` variant's `base.outline = 'none'` on focus is a correction to a rule that was never in force.
- **Why nothing caught it** — no test focuses an Input, and `outline-style: none` is what the element reports at rest too, so a snapshot of the resting state is identical to a snapshot of the broken focused state on this channel.
- **Ask** — delete the dead declaration rather than repair it. The ring is already drawn, correctly, one layer up; adding a real outline would double it. If a component ever wants an outline ring it must reference `--ds-focus-ring-color`, and a token whose name ends in `-shadow-` belongs in `box-shadow`. WO-ARC-07's Input skin does this by construction: a reviewer reading `outline: 2px solid var(--ds-input-shadow-focus)` in a stylesheet sees a value that cannot parse.
- **Status** — OPEN, and owned by WO-ARC-07's Input slice.

### P-55 The rustic Badge's solid foreground is a flat token, not derived from its fill
- **Found** — 2026-07-10, by WO-P-53's extension of the contrast gate to every engine, and independently confirmed by the orchestrator.
- **Evidence** — the primary badge, on rottay, measured on the torture probe:

  | engine | background | text | contrast |
  | --- | --- | --- | --- |
  | rustic | `rgb(255,255,255)` | `rgb(236,236,236)` | **1.18:1** |
  | modern | `rgb(255,255,255)` | `rgb(12,12,14)` | 19.54:1 |
  | classic | `rgb(255,255,255)` | `rgb(12,12,14)` | 19.54:1 |

- **The cause** — three engines, three different sources for the same foreground. `ModernBadge` reads `--ds-color-primary-foreground`; `ClassicBadge` reads antd's `colorTextLightSolid` (which P-52 just wired to `--ds-color-text-on-primary`). `RusticBadge` alone reads `--ds-badge-text-color`, a single flat value that is not derived per-tenant from the fill it sits on. rottay's artifact sets it to a near-white, and rottay's primary badge fill is white, so the label is invisible. The same defect archetype as P-52 and P-44: a foreground colour that does not know what it sits on.
- **Why the gate now sees it and did not before** — WO-P-53 gave `contrast.spec.ts` a per-engine selector map and a full 4×3×4 matrix. This cell is carried in that file's `KNOWN_GAPS` with the measurement and the reason, rather than as a red assertion that would fail every run — a named gap, not a silent one, and not a broken gate.
- **Ask** — one WO. Give `RusticBadge`'s solid variant the same on-primary foreground the other two engines already use, or derive `--ds-badge-text-color` per-tenant against `--ds-badge-primary-bg`.
- **FIXED 2026-07-10.** Added `VARIANT_SOLID_TEXT_COLOR_MAP` to `Badge.types` — the per-variant on-primary table modern already used inline, now shared — and pointed the rustic engine at it. rottay's rustic primary badge went from 1.18:1 to 19.54:1, matching modern and classic. The `KNOWN_GAPS` entry was removed and the assertion runs live: full gate 146/146, up from 145 as the four rustic-badge cells joined. A parity test pins all three engines to the shared map and is drilled (restore the flat `#ffffff` and it goes red). No baseline moved — the badge is on the contrast probe, not a flagship capture.
- **Status** — CLOSED.

### P-56 WO-ARC-05's container-query half is blocked on skins that do not exist
- **Found** — 2026-07-10, closing out the DS program's actionable roadmap.
- **State.** WO-ARC-05 has two halves. The FOUNDATION half — 16 `clamp()` fluid ramps and the `viewportMqInSkins` counter — is shipped and gated (fd21437a). The CONTAINER half — steps 1, 2, 4 of the WO: `container-type: inline-size` contexts on the card/table/rail/pane skins, `@container` adaptations, and a sighted container-axis gallery — is not started, and its acceptance gate (a reviewed gallery of the same component at rail-width vs full-width) was never produced.
- **Why it is blocked, measured.** The container half hangs `@container` rules on the card, **table/data-table**, **preview-rail** and **split-pane** skins. After WO-ARC-07, exactly three components have CSS skins: Button, Card, Input. The table, the preview rail and the split pane still paint from inline `style={}` objects and from app-level or pattern-level CSS, not from an engine skin an `@container` rule can attach to. `@container` needs a `container-type` declaration on an ancestor the DS controls; those ancestors are the workspace-region and table skins, which do not exist.
- **So the honest dependency is:** ARC-05's container half depends on a table/rail/pane CSS-skin migration of the same shape ARC-07 did for Button/Card/Input — a real, separate, `patterns/structures`-tier piece of work, larger than three primitives, not a fragment of ARC-05.
- **Ask** — owner decision. Either (a) mint a WO to migrate the table, preview-rail and split-pane paint into engine skins (the ARC-07 pattern, applied to the workspace tier), and only then a WO for the `@container` contexts + fluid-scale consumption + sighted gallery; or (b) rescope ARC-05 to its foundation half, which is done, and track the container mechanism as its own program. Both are honest; (a) is the fuller finish. What is NOT acceptable is marking ARC-05 done with its sighted gate unproduced, which is why this is filed rather than closed.
- **RESOLVED 2026-07-10 (owner-delegated: option a).** Minted **WO-ARC-08** "Workspace-tier CSS skins + container queries" in the architecture lane, carrying the container half; amended ARC-05's acceptance gate to its foundation half and marked it done against exactly that (the ramps landed in `fd21437a`). Mirrors the WO-ARC-03 -> WO-ARC-07 carve-out precedent in this same lane. Board: 53/54 done, WO-ARC-08 actionable, `roadmap:check` green.
- **Status** — CLOSED.

### P-57 Twenty-six personality variables are emitted with zero readers
- **Found** — 2026-07-10, by WO-P-43's executor while building the personality-orphan reader search against the full source tree.
- **Evidence** — beyond `--ds-badge-hover-transform` (which P-43 wired), the reader search surfaced 26 more `--ds-*` personality variables that `resolvePartialPersonalityCssVariables()` emits and nothing reads: almost entirely the raw `--ds-personality-{animation,chart,card,accent,typography}-*` mirror of each personality field (as opposed to the derived component-shorthand variables like `--ds-card-shadow`, which DO have readers), plus `--ds-duration-normal`. Verified not a pattern-matching artifact: cross-checked against a loose substring search, handled the one legitimate non-`var()` idiom (`Toast/utils/animations.ts` reads a token via `getPropertyValue`), and confirmed consumed siblings (`--ds-duration-fast`/`-slow`) are correctly excluded. The full list is the `PRE_EXISTING_PERSONALITY_ORPHANS` set in `scripts/audit-integration.mjs`.
- **How it is held today** — a named, dated, decrease-only exemption list, NOT a count ratchet (a count masks a same-window swap when several WOs land concurrently). A companion `stale-personality-orphan-exemption` rule fails if an exempted name is no longer emitted, so the list cannot rot. Any NEW orphan outside the list fails the audit immediately (drilled). Shrinking the list is welcome, never required.
- **Ask** — one WO to drain it: for each of the 26, either wire the variable to a real reader (the personality mirror was presumably meant to be consumed) or stop emitting it. Remove each from the exemption list as it drains; the staleness rule already guards the list's honesty.
- **Status** — OPEN.

### P-58 The vertical-CSS check verifies its engine input exists, not that it is fresh
- **Found** — 2026-07-10, by WO-P-46's executor while shipping `build-vertical-css.mjs --check`.
- **Evidence** — the styles/ bundles have three inputs: `base.css` (a plain source file, no build step), the tenant artifacts (freshness-guaranteed by `build-vertical-artifacts.mjs --check`, which runs immediately before this in `lint`/`pretest`), and `dist/modern-engine.css` (built from `src/tokens/css/engines/modern/compiled.css` via `postcss`, i.e. `build:modern-css`). The new `--check` detects `dist/modern-engine.css`'s **absence** and fails loudly, but cannot detect its **staleness**: edit the modern engine CSS source, forget `build:modern-css`, and `--check` certifies `styles/*.css` as "in sync" against a stale engine bundle.
- **Why it matters** — it is the one input in the chain with no freshness guard. Same shape as the artifact-vs-source staleness P-46 closed for the styles/ bundles, one level down.
- **Ask** — give `build:modern-css` a `--check` mode (regenerate `dist/modern-engine.css` in memory, diff against disk) chained before `build-vertical-css --check`, or have `build-vertical-css --check` recompute the engine CSS from source rather than trusting the `dist/` mirror. Drill: edit the modern compiled source, forget the build, watch `--check` catch it.
- **Status** — OPEN.

### P-59 A live theme.css rule is dead property-by-property against DaisyUI, not just rule-by-rule
- **Found** — 2026-07-10, by WO-P-41's executor via the "cuts both ways" check P-47 implies.
- **Evidence** — the `.toast` rule that survives in `engines/modern/theme.css` (background-color, border-radius, box-shadow, padding, gap, max-width) is genuinely live-by-class: `Notification` and `Message` modern engines render `'toast toast-top toast-center'`. But diffed property-by-property against the real `daisyui` package's own `.toast`: DaisyUI declares `background-color:#0000`, `gap:.5rem`, and `max-width:calc(100vw - 2rem)` on the identical selector. Those three sit in `@layer rottay-engines`, which loses to DaisyUI (P-47), so `--ds-toast-bg`, `--ds-toast-gap`, `--ds-toast-max-width` are structurally unable to reach the DOM through this rule. The other three (border-radius, box-shadow, padding) DaisyUI never declares, so they apply normally. One live rule, half dead-by-layer.
- **Why it matters** — `themeCss.unreferencedSelectors` (WO-TOK-10) asks "does any component render this class?" and this rule passes, because `toast` is rendered. The load-bearing question P-47 raised — "does this rule WIN?" — is per-PROPERTY here, not per-rule. It affects Notification and Message, not just Toast. (Structural read from the DaisyUI source + confirmed layer wiring, the method P-47 used to generalize beyond its one measured case; not measured in a live browser.)
- **Ask** — fold into the theme.css/layer-order proposal (the P-47 follow-on): the audit that decides a theme.css rule is live must ask, per declared property, whether a DaisyUI rule in a later layer overrides it — not merely whether the class is rendered. Then the half-dead `.toast` properties surface for deletion or relocation to an unlayered skin.
- **Status** — OPEN.

### P-60 The container-query collapse rule wins by author-beats-UA, not by being unlayered
- **Found** — 2026-07-10, by WO-ARC-08 checkpoint 2's executor, verifying the CONTRACT against the bundle.
- **Evidence** — the ARC-08 contract (and Fable's advisory) said the data-table collapse rule "lives in shared engine-agnostic pattern CSS (unlayered `patterns.css`)" and leaned on "an unlayered rule wins." But `patterns.css` is imported `layer(rottay-components)` in both `entrypoints/styles.css:62` and `foundation/base.css:52` — it is NOT unlayered. The skin files (button/card/input/badge) ARE deliberately unlayered (P-47), `patterns.css` is not.
- **Why it works anyway, TODAY** — the collapse rule is `@container ds-table (max-width:640px) { :where(.ds-pattern-data-table [data-col-priority='low']) { display:none } }`. `display` on a td/th cell has exactly one author competitor: none. Verified: no `display` rule in `engines/{modern,rustic}/theme.css` targets table cells (the 6 hits are `.menu li`, `details>summary`, `.breadcrumbs li`, `.ds-input`), and the modern table carries no DaisyUI `.table` class (its class is `ds-modern-table`, all paint inline). So the rule beats only the UA default `display:table-cell`, and any author rule — layered or not — beats UA. Proven end-to-end: the low-priority column collapses at cw=380 and is present at cw=1160 (sighted, gate 162/162).
- **The fragility** — this is NOT the unlayered guarantee a skin has. A future `display` rule on these cells in a LATER layer (rottay-engines/tenants/personality/responsive) or unlayered, or a Tailwind/DaisyUI base rule that ever targets them, would win and un-collapse the column silently. The rule's correctness rests on "nothing else sets display on these cells," which is a fact about today's CSS, not a structural guarantee.
- **Ask** — decide the durable home for engine-agnostic `@container` adaptations: either (a) a new UNLAYERED engine-agnostic container-query stylesheet (imported without `layer()` beside the skins), which gives the same structural guarantee the skins have; or (b) keep them in layered `patterns.css` and add an audit assertion that no later-layer/unlayered rule sets `display` on `[data-col-priority]` cells. Correct the contract's "unlayered" language either way (done in the ARC-08 block).
- **Status** — OPEN.

### P-61 WO-ARC-08 owes a docs-engineering catalog update that this session could not write
- **Found** — 2026-07-10, at WO-ARC-08 done, by the DS agent honoring the session's docs-engineering READ-ONLY constraint.
- **Evidence** — ARC-08 made three catalog-visible changes that the DS CLAUDE.md documentation rule says MUST be reflected in `docs-engineering/engineering/design-system/`: (1) a contract-type addition — `priority?: 'low'` on `ColumnDef` (`patterns/foundation/types.ts`), which belongs in `foundations/contracts/README.md`; (2) a new responsive capability on the data-table pattern — container-query column-priority collapse (`container-name: ds-table` + the `@container ds-table (max-width:640px)` rule), which belongs in `components/patterns/data/README.md`; (3) the first two consumers of ARC-05's container-fluid type ramps (collection title + metric-card value), a `foundations/tokens/README.md` note that the fluid ramps are no longer zero-consumer. The `roadmap-status.mjs done` reminder ("update the matching docs-engineering CURRENT lines") points at the same debt.
- **Why it matters** — docs-engineering is the AI documentation hub; a contract field and a responsive mechanism that are undocumented there are invisible to every other agent that reads the catalog before the code. The gap is small but it is exactly the "convention not gate" class that rots silently.
- **Ask** — one docs-authorized pass (or an owner lift of the READ-ONLY fence for the DS's own catalog) to add the three notes above. Purely documentation; no code. Scope is the DS catalog only — no product/vertical chapters are touched.
- **Status** — OPEN.

### P-62 Two engine-token-audit baselines are stale — one may be masking a gradient regression
- **Found** — 2026-07-10, by the WO-ARC-09 infra executor: running `--update-baseline` to seed the new `arc09.inlinePaint.*` counters rewrote the whole baseline and surfaced two counters whose committed baseline no longer matches reality.
- **Evidence** — `effects.gradientConsumers`: baseline 3, current **1**. `themeCss.lineCount`: baseline 1692, current **1351**. The line-count drop is benign (theme.css legitimately drained ~341 lines since the baseline; decrease-only, so it just went un-refreshed). The gradient-consumer drop is the concerning one: two render-layer files that used to read `var(--ds-gradient-*)` no longer do. It still PASSES `--check` because `effects.gradientConsumers` is a MIN floor of 1 (WO-ENG-05 wired the 1/0/0 dead layer up) and the baseline VALUE is informational to that check — so a drop from 3 to 1 gates nothing. The pixel gate for gradient is `effects.spec.ts` (decodes a screenshot), not this counter.
- **Why it matters** — WO-ENG-05 raised gradient consumers off the dead floor; a silent regression back toward it is exactly the "convention not gate" erosion the counter was meant to stop, but the MIN-floor design lets it slide from 3 to 1 unnoticed. I reverted both baseline values to their committed state so the ARC-09 infra commit stays surgical (only the 13 `arc09.inlinePaint.*` keys added), which means the staleness is preserved, not fixed.
- **Ask** — (a) identify which two files stopped consuming `var(--ds-gradient-*)` (git-blame the count from 3→1) and decide whether that is an intended change or a regression; if intended, refresh the baseline to 1 and consider raising the MIN floor is NOT wanted (floor stays 1); if a regression, restore the consumers. (b) Refresh `themeCss.lineCount` to 1351 in a deliberate, explained commit. Drill for (a): re-run `node scripts/engine-token-audit.mjs` and read `effects.gradientConsumers`.
- **Status** — OPEN.

### P-63 Table pre-existing visual defects ARC-09 surfaced but (correctly) preserved byte-exact
- **Found** — 2026-07-11, by Fable's 10/10 review of the WO-ARC-09 checkpoint-1 modern Table migration. The byte-exact mandate correctly preserved these, so they are now legible in CSS but still latent; each fix is a DELIBERATE visual change with a re-recorded baseline, not part of the byte-exact checkpoint.
- **Evidence** — (1) The expand-column and selection-column header `<th>`s never received the header hairline (a visible GAP under those columns in the header/body separator) nor, under `sticky`, the sticky header background (TRANSPARENT at z-20, body rows visibly scrolling beneath). Confirmed against `d7189325~1`. The checkpoint brings them onto the contract (stamping `data-part="header-cell"`, zero visual); adding `data-hairline`/`data-sticky` closes both holes. (2) The field skin codifies `outline: none` with NO `:focus-visible` replacement — a keyboard-a11y hole the skin now owns in writing; plus dead transitions mapping skin silences: sortable `<th>` `transition: color` with no color rule, filter input `transition: border-color` with no `:focus` (modern), expand/pagination buttons `transition: all` with no `:hover` (modern). ARC-07's Button got exactly this cleanup. (3) The sticky+fixed header two-tone quirk (fixed-column `--ds-table-bg` wins over the sticky-header bg at z-index 10) is pre-existing, now legible; do not fix silently.
- **Why it matters** — the pattern-setter should reach a11y + interaction-state parity with ARC-07's primitives BEFORE the pattern multiplies across five more components; a frozen-off-contract defect is one the next five copy as "some painted cells live outside the contract."
- **Ask** — one follow-up WO after checkpoint 1: add the header-cell hairline/sticky to the two chrome columns, add a `:focus-visible` ring to `[data-part='field']`, reconcile each dead `transition` with a real state rule (or drop it). Each is a re-recorded visual change; drill = the flagship `table` slug with `rowSelection` + `scroll.y` (add fixtures — neither is in a baseline today).
- **Status** — OPEN.

### P-64 The DS unlayered-skin naming + specificity law needs writing down, and the data-part contract is now public API
- **Found** — 2026-07-11, by Fable's review, at the moment WO-ARC-09 adds the THIRD skin-class shape to the design system.
- **Evidence** — skin class naming drifted across three eras: `rottay-button`/`rottay-input`/`rottay-badge` (ARC-07 legacy), `ds-card`/`ds-table` (newer, engine-split), and the WO-ARC-09 contract's `ds-pattern-data-table ds-engine-modern` / `ds-structure ds-selection-preview-rail` (agnostic). Nothing breaks (all reach (0,2,0)), but this is the last moment to legislate before five components multiply the choices. Two more rules the Table skins now encode in their headers but the DS doc does not: (a) a PAINTING `border`/`border-color` rule must reach (0,4,0) by REPEATING the data-part (`[data-part='x'][data-part='x']`), never by borrowing an incidental attribute (`role`/`aria-label`/`placeholder`) — those rot when the attribute moves; pure `border: none` resets are exempt. (b) The engine-state idiom: both engines now express transient state as CSS `:hover`/`:active`/`:focus` keyed on the SAME `data-part` names (rustic's five React hover-state hooks were removed).
- **Why it matters** — the `data-part` contract is now the tenant re-skinning surface, which is the entire point of the migration, yet lives only in CSS comments + the WO. Per the repo's documentation rule (and P-61's standing example), a public contract belongs in `docs-engineering`.
- **Ask** — (a) a short DS skin authoring law in `docs-engineering/engineering/design-system/runtime/engines/` covering class naming, the (0,4,0)/repeat-data-part rule, and the `:hover` idiom. (b) document the Table `data-part` contract (primitives/display + modern engine README). Docs-only; deferred because `docs-engineering` is READ-ONLY this session (same fence as P-61).
- **Status** — OPEN.

### P-65 Pre-existing suppressed interaction paint, now legible in the ARC-09 skins
- **Found** — 2026-07-11, during WO-ARC-09 checkpoints 2 and 4. In both cases a component's inline `style` was silently beating a child primitive's own skin states, and the byte-exact mandate correctly reproduced the suppression via escalated selectors instead of "fixing" it.
- **Evidence** — (1) FieldFiltersPanel: the rustic Input landing (`[data-part='root']`) has its focused border/ring rules ((0,6,0)) outranked by the panel's (0,8,0) control rule — focusing the text filter paints NOTHING, pinned by 4 equality tests in `field-filters.spec.ts`. (2) SelectionPreviewRail: the customPreview close Button (ghost variant) has its button.css rest (0,4,0) and hover (0,5,0) background outranked by the rail's (0,6,0) suppression rule — pinned by the close-rest/close-hovered baselines. Both suppressions predate the migration (they were inline styles); the skins now state them in writing with their specificity arithmetic.
- **Why it matters** — a keyboard user gets no focus affordance on the rail-side filter input, and the close button ignores its own engine's hover language. Both are now one-rule deletions away from being fixed deliberately.
- **Ask** — per site, decide re-enable vs keep: deleting the suppression rule (or narrowing its channels) re-exposes the primitive's own states; each is a deliberate visual change with re-recorded baselines, one commit per site.
- **Status** — OPEN.

### P-66 classic Text cannot express the new subtle/inherit colors (lossy, same as primary)
- **Found** — 2026-07-11, WO-ARC-09 checkpoint 2, adding `TextColor` values `subtle` (→ `--ds-color-text-muted`) and `inherit`.
- **Evidence** — modern/rustic map both exactly (`COLOR_STYLES`/`COLOR_MAP`). Classic maps through AntD's `type`: `subtle` → `'secondary'` (the same treatment `muted` already gets) and `inherit` → undefined (AntD default). Under the classic engine, micro-labels that used to render the exact tenant `--ds-color-text-muted` var (via the old inline style) now render AntD secondary; `inherit`-labels render AntD default. Classic was ALREADY lossy this way for `primary` (documented in its TYPE_MAP header).
- **Why it matters** — invisible to the ARC-09 gates (classic is excluded by construction) but a real cross-engine fidelity gap if any product ever ships classic surfaces using these components.
- **Ask** — decide the classic story once: either classic Text gains an inline-style fallback for map-missing colors (a deliberate classic behavior change covering `primary`/`subtle`/`inherit` together), or the lossiness is accepted and documented in the Typography README.
- **Status** — OPEN.

### P-67 detail-panel pre-existing cross-engine gaps ARC-09 surfaced but preserved
- **Found** — 2026-07-11, WO-ARC-09 checkpoint 5 inventory + migration.
- **Evidence** — (1) `status.color` (a runtime prop) is honored by rustic (now via `--ds-detail-panel-status-bg/fg` custom properties) and silently IGNORED by modern — same prop, two behaviors. (2) rustic's skeleton pulse dims to opacity .4 while the global `@keyframes pulse` mid-point is .5; the migration had to RENAME rustic's local copy (`ds-detail-panel-pulse`) to move it into the globally-loaded skin without redefining the global — the divergence is now named in CSS instead of hidden in a per-render `<style>` tag. (3) rustic's back-button and tab-button have no interaction paint at all (modern's have hover+focus) — a design divergence, preserved. (4) rustic's old imperative mouse-leave reset wrote `''`/`'transparent'` rather than restoring the factory base; the CSS conversion structurally replaced reset semantics with cascade returns — if any variant's base differed from its reset target, that post-hover state is now (correctly) the base.
- **Why it matters** — (1) is an API contract violation one consumer bug report away; (2) is a shipping visual inconsistency between rustic skeletons and every other pulse consumer.
- **Ask** — (1) wire `status.color` into modern's status badge or deprecate the prop field; (2) pick .4 or .5 and converge; (3)/(4) confirm-and-document or schedule parity work.
- **Status** — OPEN.

### P-68 data-table pre-existing artifacts: a dead dirty-cell rule, a hardcoded resize color, and Card's dead selection API
- **Found** — 2026-07-11, WO-ARC-09 checkpoint 6 inventory + pre-step.
- **Evidence** — (1) modern's per-instance `<style>` (engines/modern.tsx:904 block) styles `td[data-cell-dirty="true"]::before`, but no JSX in the file ever sets `data-cell-dirty` — dead selector. (2) rustic's resize bar paints hardcoded `rgba(0,0,0,0.12)` (no token), transcribed as-is into the rustic skin per the byte-exact law. (3) `Card.types.ts` declares `selected?`/`selectable?`/`onSelect?` but no Card engine consumes them, and no Card engine forwards `data-*` to its root — DataTableMobileCards now works around both with `ds-data-table__mobile-card--selected` className modifiers.
- **Ask** — (1) delete the dead rule or wire the dirty-cell feature; (2) tokenize the resize color (one-line deliberate visual change on dark tenants); (3) either implement Card's selection props (and migrate the mobile card onto them) or remove the dead API surface.
- **Status** — OPEN.

### P-69 The first honest dist rebuild exposed three latent gate findings (none caused by ARC-09)
- **Found** — 2026-07-11, at the WO-ARC-09 program close: the day's first full `pnpm build` of core since the 07-10 sessions, followed by the first FULL visual-suite run in the same period. A worktree bisect at 96360ad3 (pre-ARC-09-checkpoints-2-6) reproduced all three findings with identical numbers, proving none of the six checkpoint migrations moved a foreign pixel.
- **Evidence** — (1) FONT-RACE BASELINES: all six `table` flagship baselines were recorded under a lost font race — the table gallery is the only flagship surface referencing the tabular-numerals face, `document.fonts.ready` does not cover a face that has not STARTED loading, so recordings and every subsequent green gate photographed the fallback metrics (~3.7-4.0k px of text ghosting vs the webfont). Fixed in this close-out: flagships.spec.ts now forces every registered face to load before the shot, and the six baselines are re-recorded under the deterministic webfont state (48/48 twice consecutively). (2) HAIRLINE CALIBRATION: `signature.spec.ts`'s dark-elevation hairline assertion reads 1.38 against MIN_HAIRLINE_DELTA=4 on rottay — the computed card shadow DOES carry `inset 0 1px 0 rgba(255,255,255,0.04)` (elevation-1, faithful to buildElevationScale), so the 4% alpha simply measures below the threshold calibrated for an earlier alpha/ramp (WO-TOK-02 OKLCH era). Left HONEST-RED: raising the alpha is an engine-owner visual decision, lowering the threshold is a fudge. (3) STALE-BUNDLE RESIDUE: the committed styles/ bundles still carried daisy `.radio-sm` although d7189325 removed its last consumer — the regenerated bundles dropped it (harmless: no element carries the class), confirming the 07-10 sessions' bundles were not regenerated after their final source edits.
- **Why it matters** — a gate that records and re-verifies under the same lost race certifies the wrong pixels forever; a stale dist masks real behavior changes until an unrelated rebuild ships them as a surprise.
- **Ask** — (a) engine owner: pick the dark-elevation hairline story (raise elevation-1's inset alpha to clear >=4, or re-derive MIN_HAIRLINE_DELTA from the intended alpha) — one deliberate commit either way; (b) consider the force-load idiom for the other screenshot specs (they are stable today, but by luck of their face usage, not by construction); (c) any future session that regenerates bundles diffs them against HEAD and treats ANY unexplained subtraction as a stale-dist alarm, not a ratchet win (this session initially mis-adjudicated the .radio-sm drop as harmless shrink — it was harmless, but for the wrong reason).
- **Status** — OPEN (a/b); (c) is a working rule, recorded in session memory.

### P-70 Hardcoded paint literals the WO-SKIN-02 migrations transcribed byte-exact
- **Found** — 2026-07-12/13, across the inputs batch (WO-SKIN-02). The byte-exact law forbids tokenizing mid-migration, so every literal moved verbatim from inline styles into the skins where it is now grep-able.
- **Evidence** — the `#1677ff` family (Select/TreeSelect/Cascader rustic focus+selection borders, search rings, `rgba(22,119,255,...)` shadows), `#ef4444`/`#3b82f6`/`#d1d5db`/`#f3f4f6`/`#dbeafe`/`#1d4ed8` (TagInput rustic), `#374151`/`#6b7280` (FormField rustic), `#1a1a1a`/`#666`/`#d9d9d9`/`#1890ff`/`#ff4d4f` (PasswordInput rustic), OTP/Form/Toggle/Switch rustic focus-ring rgba sets, Transfer rustic move-button shadows, Upload rustic 4px progress radius. Full lists in the ckpt A/B/C commit messages and agent reports.
- **Ask** — one tokenization pass over the new skins mapping each literal to its semantic token (deliberate visual change on tenants whose tokens differ from the literals; re-record affected baselines). Batchable with the stage-2 visual program.
- **Status** — OPEN.

### P-71 Pre-existing component defects the inputs-batch migration made legible (preserved, not fixed)
- **Found** — 2026-07-12/13, WO-SKIN-02.
- **Evidence** — (1) TreeSelect/Cascader rustic triggers reference `--ds-treeselect-*`/`--ds-cascader-*` tokens NO tenant defines: their border/background inline declarations were invalid-at-computed-value, so both components have always shipped borderless/transparent-trigger; the skins now encode this with atomic border shorthands that die with the token (defining the tokens turns the chrome on per tenant). (2) Select rustic option rows set `fontSize: \`\${sizeConfig.fontSize}px\`` where sizeConfig.fontSize is already a var() string, producing the invalid value `var(...)px` — font-size silently inherits (both engines' size tiers dead on options). (3) Select modern's virtual vs non-virtual option forks paint the same states differently (flat color-mix + inset divider vs linear-gradient + translateY lift). (4) Mentions rustic textarea sets no color channel. (5) AutoComplete rustic input color hardcodes a neutral token rather than a component token. (6) Button.Group's connected-edge suppression spreads inline paint onto heterogeneous children (incl. classic) — left at fleet counter 3, the batch's one residual; needs connected-group anatomy. (7) Slider modern paints no hover/focus state while rustic has a focus ring. (8) Button.Icon bypasses the engine system entirely. (9) TimePicker has 6 pre-existing behavioral test failures (onChange spies vs the modern text trigger; worktree-verified at 23c51dd1). (10) TreeSelect/Cascader search-focus visual pins need `showSearch` torture instances (their popup search inputs never render today, so the two pins recorded no baseline and were removed from the spec).
- **Ask** — each is a deliberate follow-up: define-or-delete the dead token families; fix the `var()px` template; reconcile the Select forks; the rest per site.
- **Status** — OPEN.

### P-72 Pre-existing feedback-family defects the WO-SKIN-03 migration made legible (preserved, not fixed)

- **Context** — The overlay + status migrations transcribed every value byte-exact. Reading the paint out of the components exposed defects that were always shipping but were unreadable while buried in inline style objects. None were fixed: fixing them would have moved pixels, and the batch's contract is byte-exactness.
- **Evidence** — (1) NOTIFICATION EXIT-TIMER DRIFT: the JS unmount timer runs 240ms while the CSS exit animation runs 180ms, so the panel sits invisible-but-mounted for 60ms on every dismissal. (2) NOTIFICATION SLIDE DIRECTION: rustic always slides on `translateX` regardless of which of the six corners is active, though its own comment claims it slides from the nearest edge — bottom-anchored notifications slide sideways, not up. (3) DRAWER RUSTIC DEAD TRANSITION: `transition: transform` is declared but no transform is ever assigned (positioning is `top/left/right/bottom`), so it never fires. (4) THE DAISYUI `.alert` COUPLING: Toast, Message and Notification's MODERN roots carry DaisyUI's structural `alert` class, which `personality.css` targets with a 4px accent bar — an implicit, undocumented cross-file dependency that makes their border a shorthand-or-bust channel (now a documented hard constraint). (5) MODAL CLOSE-BUTTON COLOR FORK: three divergent fallbacks (`inherit` / none / `rgba(0,0,0,0.45)`) across modern / rustic / the compound, all nominally sharing `--ds-modal-close-color`. (6) UNDEFINED `--ds-toast-*` TOKEN FAMILY: Message/Notification modern's stacking containers reference six tokens no tenant defines (a `theme.css` override point that is dead on arrival — a theme defect, not a component one). (7) PROGRESS RUSTIC STATUS COLORS: `var(--undefined-token, #hex)` chains whose tenant hook is dead; they compute to the hex today and were transcribed verbatim. (8) SKELETON'S FOUR-WAY ANIMATION SPLIT: modern is DaisyUI-owned, rustic injects its own pulse, the compounds reference a third global keyframe, and a fourth (`ds-skeleton-pulse` at 0.5 in rustic/theme.css) is dead — preserved mechanism-by-mechanism.
- **One behavior delta introduced BY CONSTRUCTION** — Drawer-modern's placement border-zeroing used to be applied AFTER the consumer's `...style` spread, so it beat a consumer-supplied border width; it is now a CSS rule, so an inline consumer `style.borderLeftWidth` wins instead. It bites only a caller who passes a border width AND uses the matching placement. Faithful transcription was judged the right call over preserving a spread-order accident, but it is a real delta and is recorded here rather than buried.
- **Ask** — each is a deliberate follow-up; (1) and (2) are user-visible bugs and should lead.
- **Status** — OPEN.

### P-73 The Steps theme.css bridge is dead on both channels — Steps is not tenant-themable today

- **Context** — WO-SKIN-04's navigation inventory flagged Steps/Stepper modern as STOP-AND-REPORT: two mechanisms (the component's inline `--step-color`/`--step-neutral` custom properties, consumed by DaisyUI's own `.step::before`/`::after` rules, vs a first-party `theme.css` bridge) compete for the same pixels, and which one wins cannot be decided by reading. Adjudicated empirically in a real browser via CDP `CSS.getMatchedStylesForNode` on the pseudo-elements (hand-rolled stylesheet walkers lie).
- **Evidence** — Both `theme.css` bridge rules LOSE, each for a different reason:
  - `[data-tenant] .steps .step::before { background-color: var(--ds-steps-line-color) }` (`engines/modern/theme.css:641`) wins on specificity (0,3,1) over DaisyUI's `.steps .step::before` (0,2,1) — but **`--ds-steps-line-color` is defined NOWHERE** (0 declarations across tokens/ and compilers/). The declaration is invalid-at-computed-value and is dropped; DaisyUI's `var(--step-bg)` paints the connector.
  - `[data-tenant] .steps .step::after { background-color: var(--ds-steps-item-bg) }` (`theme.css:645`) ties DaisyUI's `.steps .step:not(:has(.step-icon))::after` at **(0,3,1) exactly** — `:not(:has(.step-icon))` contributes a class's worth of specificity — so **source order decides, and DaisyUI is emitted later**. Measured: `--ds-steps-item-bg` resolves to `#2a2a2f` on rottay and the circle nonetheless paints `oklch(1 0 0)` (white, DaisyUI's `--step-bg`).
- **Impact** — A tenant that sets `--ds-steps-item-bg` / `--ds-steps-item-color` in its artifact changes nothing on screen. Steps has no working tenant theming hook, and the token family reads as supported. This is a white-label defect, not a cascade curiosity.
- **Frozen for WO-SKIN-04** — the migration is byte-exact, so it must PRESERVE this outcome: the skin must not out-specificity DaisyUI on those pseudo-element channels, and must not "fix" the undefined token. Doing either changes the shipped color under the guise of a cleanup. The component's inline custom properties move to the skin as-is.
- **Ask** — decide the mechanism (own the pseudo-elements with a first-party rule that beats DaisyUI on both channels, or delete the dead bridge and the token family and let DaisyUI own it), then land it as a VISUAL change with its own baselines, not inside a byte-exact migration.
- **Status** — OPEN.

### P-74 Two navigation compounds are documented, typed, and never rendered

- **Context** — Surfaced by WO-SKIN-04's navigation pre-step while stamping anatomy: two compound components have a public, documented composition API that silently does nothing. Found by test, not by reading — the pre-step's contract test asserted the compounds' stamps reach the DOM and they did not.
- **Evidence** — (1) `Stepper.Step`: composing `<Stepper><Stepper.Step/></Stepper>` never mounts `Stepper.Step`. Both root engines convert the children into a plain items array (extracting title/description/subTitle/icon/status/disabled — and NOT `active`) and re-render through their own internal path, so the compound's own render, its props, and its `active` state are unreachable in the documented usage. It only renders standalone. (2) `Breadcrumb.Item`: `BreadcrumbProps.children` is typed, and `compound/Item`'s own header comment shows `<Breadcrumb items={[]}><Breadcrumb.Item/></Breadcrumb>` as the basic usage — but neither engine destructures or renders `children` at all. A `Breadcrumb.Item` passed as a child is silently dropped.
- **Evidence (third case, found by the WO-SKIN-04 docs pass)** — (3) `Tabs.TabPane`: the worst of the three. Neither engine references `TabPane` or reads React `children` at all — both consume only the `items` prop and render `activeItem.children` from it. `<Tabs><Tabs.TabPane tab="Tab 1" key="1">Content 1</Tabs.TabPane></Tabs>` — the exact usage printed in `Tabs.tsx`'s own header comment (line 23) and in `TabPane`'s own doc comment — renders nothing. `TabPane` stamps no anatomy either, so unlike `Stepper.Step` it does not even have a correct standalone shape.
- **Impact** — All three are the same defect class: an API that typechecks, is documented with a worked example, and produces nothing. A consumer following the docs gets an empty render with no error. `Stepper.Step`'s `active` prop is dead in every usage. Three independent components converged on it, which suggests the compound-API convention was documented before it was wired, and nobody ran the documented example.
- **Frozen for WO-SKIN-04** — the migration is byte-exact and does not fix this. The pre-step stamps the compounds anyway (their anatomy is correct when they DO render), and the contract test pins the reality rather than the documentation.
- **Ask** — decide per component: wire the children path, or delete the compound and the documentation that promises it. Do not leave a third state. Whichever is chosen, add ONE test per compound that renders the documented example and asserts it produces DOM — that is the gate this class of defect never had.
- **Status** — OPEN.

### P-75 Avatar's size prop is broken in the modern engine — large avatars are clipped, small ones get a halo

- **Context** — Surfaced by WO-SKIN-05's inventory, then MEASURED in a live browser (getBoundingClientRect + computed styles against the production build), not inferred from reading.
- **Evidence** — `engines/modern/theme.css:1069` declares `[data-tenant] .avatar { width: 40px; height: 40px; border-radius: 50%; background-color: var(--ds-color-primary-100); overflow: hidden; }`. The modern engine puts DaisyUI's structural `avatar` class on the CONTAINER (`engines/modern.tsx:135`) and the real, size-driven dimensions INLINE ON A CHILD (`:100-102`, `width: var(--ds-avatar-${size}-size)`). Nothing inline contests the container, so the hard 40x40 wins on every Avatar in every tenant. Measured on the production showroom: a child of 40x45 inside a 40x40 container with `overflow: hidden` — **clipped**; a 30x30 child centered in a 40px painted circle — a visible **halo** ring of `--ds-color-primary-100` around every small avatar.
- **Impact** — `size` does not work in the modern engine. Any avatar whose size token exceeds 40px is cut off; any avatar below 40px is framed by an unintended colored disc. This ships today, in every tenant, on the most common display primitive in the fleet.
- **Frozen for WO-SKIN-05** — the migration is byte-exact and must PRESERVE this. A skin that "helpfully" sizes the container fixes the bug and moves pixels, which is a visual change wearing a migration's clothes. Same shape as P-73.
- **Ask** — decide the mechanism (size the container from the same `--ds-avatar-*-size` token the child uses, or drop the DaisyUI class and own the container), then land it as a VISUAL change with its own baselines. Note the two sub-decisions: the container's `background-color` is what creates the halo, and `overflow: hidden` is what does the clipping — they are independently removable.
- **Related** — Divider modern is a second candidate of the same caliber (an uncontested `border-top`/`border-left` on the with-text divider root, whose actual lines live on child spans, likely painting an extra full-width rule). Traced structurally by the inventory; NOT yet measured. Measure it before acting.
- **Status** — OPEN.

### P-76 The theme.css bridge layer is dead on every border/margin/padding channel — Tailwind's preflight outranks it by LAYER ORDER

- **Context** — Surfaced while a WO-SKIN-05 lead (an "extra line" on Divider) was being REFUTED. The refutation was correct, and its mechanism turned out to be systemic, not local. Adjudicated in a live browser with CDP `CSS.getMatchedStylesForNode` on two independent components (Divider, Collapse), against the production build.
- **The mechanism** — `tokens/css/entrypoints/styles.css:19` declares the cascade order: `@layer rottay-reset, rottay-tokens, rottay-components, rottay-engines, rottay-tenants, rottay-personality, rottay-responsive;`. Per the cascade spec, **a layer NOT named in that statement sorts AFTER every named one**. Tailwind's `base` layer is not named — and the preflight ships INSIDE the DS bundle itself (`styles/bithire.css` carries 15 `@layer base` blocks and the `*, ::before, ::after { border: 0 solid; margin: 0; padding: 0 }` reset). So preflight outranks EVERY `rottay-*` layer, including `rottay-engines`, where every `theme.css` bridge rule lives — by layer order alone, regardless of specificity.
- **Measured** — CDP on `.rottay-collapse` (modern), matched rules in increasing precedence: (1) `[data-tenant] .rottay-collapse { border-color: var(--ds-collapse-border) }` — the bridge; (2) `*, ::backdrop, ::after, ::before { border: 0 solid; border-*-width: 0px; border-*-color: currentcolor }` — preflight, which BEATS it; (3) the tenant's unlayered `html[data-tenant] * { border-color: var(--ds-color-border) }` floor (P-48), which beats both. Computed result: **`border-top-width: 0px`**. `--ds-collapse-border` is a dead token: a tenant can set it and nothing happens, because the width is already zero.
- **Blast radius** — declarations sitting on channels preflight resets, per engine `theme.css`: modern 39 border + 45 margin/padding · rustic 58 + 33 · classic 104 + 66. That is the first-party surface a tenant is supposed to theme through, and on these channels it has never worked in any Tailwind-hosting app — which is every app: both `app-bithire` and `app-platform` import the DS bundle, and the preflight is inside it.
- **Channels that are SAFE (do not over-correct)** — preflight resets `border-*`, `margin`, `padding`. It does NOT reset `color`, `background-color`, `box-shadow`, or `border-radius`. Bridge rules on those channels are unaffected and DO paint (measured: Collapse's `border-radius` from the same dead rule survives). 26/29/60 `border-radius` declarations per engine are live.
- **Why this matters beyond the dead tokens** — it explains the shape of the whole codebase. Inline paint was the only mechanism that beat preflight, which is why the components are full of it. And it is the strongest argument for the WO-SKIN program: **an unlayered skin is the only first-party mechanism that outranks preflight**. Every skin this program has shipped is unlayered by law (P-47) and therefore works. The migration is not just a refactor — it is the fix.
- **Ask** — name Tailwind's `base` layer FIRST in the layer statement (`@layer base, rottay-reset, …`), which restores the bridge layer's intended precedence, and then re-record every visual baseline: this WILL move pixels (dead border declarations across three engines come alive at once). It is a large, deliberate visual change and belongs in its own work order with its own baselines — never inside a byte-exact migration. Until then, every WO-SKIN contract must treat theme.css border/margin/padding bridges as DEAD and preserve that.
- **Status** — OPEN.
