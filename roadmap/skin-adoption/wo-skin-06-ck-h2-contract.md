# WO-SKIN-06 CK-H2 (misc, category-A family) — migration contract

## ORCHESTRATOR ADJUDICATION (settled — migration agents treat these as final)

Drafted by a peer, adjudicated by the orchestrator. Load-bearing claims DRILLED against source, all hold:
- **H1/H2 split + counts** — H2 = file-manager (35+29), user-profile-card (30+28), pricing-table
  (22+31), empty-state (11+10), token-inspector (20) = **216, counter-exact**, all under
  `patterns/misc/*`. The `surfaces/pages/experience/empty-state` dir is a DIFFERENT component (a
  surface) and is correctly NOT in scope. H1 (tenant-preview ×2 + branding-preview-sandbox +
  brand-studio, 237, runtime-color) stays deferred. RULING: ACCEPTED.
- **P-78 is a real, shipped law** — verified in `tokens/css/engines/modern/skin/invoice-template.css:23,29-30`
  ("lifting box-shadow (root) and background/color (badge) hands nothing back to the spread (P-78)").
  The shared `patterns/_internal/engines/modern/styles.ts` module is NEVER migrated (permanent counter
  entry); only the LOCAL keys layered AFTER the shared spread move to CSS, gated on the spread not
  already setting that property. **This is the SAME law family as CK-C Trap 5 (`searchInputStyle`
  shared with classic) and CK-G P-86 (`popupPanelStyle`/`menuItemStyle` cross-file spread)** — a
  shared-spread module that a migration must not gut. Cross-reference all three. RULING: ACCEPTED.
- **token-inspector inverts two universal rules** — confirmed 10 `React.createElement` calls (not
  JSX) AND hardcoded hex by design (`index.tsx:147-149` `#1a1a1e`/`#e4e4e8`/`#2a2a2f`). RULING:
  ACCEPTED, with one orchestrator addition (below).
- **empty-state `--ds-empty-state-*` phantom surface** — confirmed at `patterns.css:291-302`,
  zero references from empty-state's TSX. Do NOT wire it up (scope creep). RULING: ACCEPTED.

Judgment-call rulings:
1. **3-unit split by trap ownership** (H2-1 user-profile-card+pricing-table = P-78; H2-2
   file-manager+empty-state = DaisyUI STOP-AND-VERIFY; H2-3 token-inspector alone) — ACCEPTED.
2. **Thinner anatomy section** (the inventory summarizes H2 at component/shape level, not
   site-by-site) — ACCEPTED. Consequence the pre-step MUST honor: the pre-step agent DERIVES the
   per-element `data-part` vocabulary by READING each file (there is no site-by-site table to copy),
   then proves the two invariants as usual.
3. **file-manager DaisyUI STOP-AND-VERIFY** (a `tr.active` DaisyUI class with no matching
   `tokens/css` rule; a folder-link color reached only via a live personality-layer rule through a
   bare DaisyUI class) — ACCEPTED as a real STOP-AND-VERIFY: confirm empirically (production build,
   computed-style) what actually paints these today BEFORE writing the skin, and preserve THAT.
4. **token-inspector: preserve hardcoded hex byte-exact, do NOT tokenize** (it is an inspector whose
   job is to render raw literal values) — ACCEPTED.

**ORCHESTRATOR ADDITION — token-inspector's pre-step needs a createElement-aware invariant-2 probe.**
The JSX-AST-diff probe used for every other checkpoint parses JSX elements; token-inspector is
`React.createElement(...)` calls, so the same probe will not see its element tree the same way. The
pre-step for H2-3 must either (a) adapt the AST probe to diff `createElement` call trees
(attributes-stripped, same principle), or (b) fall back to a rendered-DOM snapshot diff for this one
file. Either is acceptable; what is NOT acceptable is silently running the JSX probe against a
createElement file and reporting a green invariant-2 it never actually checked. Stamp `data-part` in
the `createElement` props object (2nd arg), not as a JSX attribute.

---

## DRAFTER NOTES FOR THE ORCHESTRATOR

Produced the same way as CK-C: read `wo-skin-06-ck-h-inventory.md` in full, the CK-C/CK-F contracts
(templates), `migration-kit.md` + `migration-kit-addendum.md`, then independently re-ran the counter
and grepped every one of the 9 H2 files (not H1's 4) for imperative writes, portals, keyframes,
`<style>` injections, and the three counter-blind-spot shapes the team-lead named, before writing.

**1. H1/H2 split confirmed unambiguous.** Per the inventory's own headline table
(`wo-skin-06-ck-h-inventory.md:6-25`), H1 = `tenant-preview` (both engines) + `branding-preview-sandbox`
+ `brand-studio` — 237 sites, 4 files, the brand-preview trio whose job is to render a color the
tenant/admin picked (190 A + 37 B + 10 N). **H2 = `file-manager` (both engines) + `user-profile-card`
(both engines) + `pricing-table` (both engines) + `empty-state` (both engines) + `token-inspector` —
216 sites, 9 files, confirmed exactly 100% A (0 B, 0 C, 0 N).** This contract covers ONLY H2. None of
H1's four files are touched, read for migration purposes, or referenced below except to name them as
excluded. H1's own traps (the exemption-list miscount, the `buildPaletteSteps` interface-member blind
spot, brand-studio's contract-mutation blind spot) belong to a future CK-H1 contract, not this one —
do not assume they apply here; I independently re-checked H2 for analogous shapes (item 4) and found
none of them recur.

**2. Confirmed correct by independent re-verification (no note needed elsewhere):** counter output for
all 9 H2 files matches the inventory exactly (35/29/30/28/22/31/11/10/20, sum 216); classic.tsx for
all 4 dual-engine components is 0 sites / absent from the counter output entirely (out of scope, same
convention as every prior checkpoint); zero imperative `.style.` writes, zero `createPortal`, zero
`@keyframes`, zero injected `<style>` tags anywhere in all 9 files (this extends the inventory's
CK-H-wide claim with an H2-specific re-check, and adds the portal check the inventory's prose never
makes explicit); zero `data-part` anywhere; the `ds-pattern-<comp> ds-engine-modern` stamp exists on
modern-only for `file-manager`, `user-profile-card` (both its two root branches, lines 85 and 112),
`pricing-table`, and `empty-state`, and is **completely absent** from all 4 of their rustic engines
and from `token-inspector` entirely — matches the inventory's §10 claim exactly, re-verified by grep,
not taken on faith.

**3. A real, already-solved trap the inventory doesn't flag as H2-specific — the shared
`patterns/_internal/engines/modern/styles.ts` module, and I found the established fix already shipped.**
The inventory's §9 names this module as "the one genuine positive counterexample" to the
assumed-sharing trap and notes `user-profile-card` and `pricing-table` modern engines are 2 of its 11
fleet-wide importers — but doesn't say what a migration should DO about it. I grepped all 11 importers
and found **6 already have shipped skins**: `environment-toggle`, `command-palette`,
`workspace-switcher`, `invoice-template`, `approval-workflow`, `locale-switcher` (all under
`tokens/css/engines/{modern,rustic}/skin/`). Read `modern/skin/invoice-template.css` in full — it
documents the exact law needed here, cites it as **P-78**, and I re-derived why it's safe by reading
`_internal/engines/modern/styles.ts` itself (98 lines, 8 exports: `popupPanelStyle`, `menuListStyle`,
`menuItemStyle`, `panelCardStyle`, `pillBadgeStyle`, `pillBadgeSmStyle`, `inlineActionGroupStyle`,
`spinnerStyle`, `cardBodyStyle`, `menuSectionTitleStyle`). **The module itself is never migrated by
any checkpoint** — its own 18 counted sites live under its own counter entry
(`fleet.inlinePaint.patterns/_internal/engines/modern/styles.ts: 18`, confirmed), permanently separate
from every consumer's total. Full mechanics in Trap 1 below. This means H2's 111 sites in
`user-profile-card` + `pricing-table` do **not** include the shared module's own keys at all — they
were already excluded from the counter before I ever looked, which simplifies this checkpoint
considerably compared to what I expected going in.

**4. Independently checked H2 for the three counter-blind-spot shapes the team-lead named — two false
alarms, one real (but harmless) finding, zero of the interface-member-annotation shape H1 has.**
- Bare shorthand (`color,`/`background,`/`border,` with no colon): grep hit `user-profile-card/
  engines/modern.tsx:152` (`fill,` ×2) and `pricing-table/engines/rustic.tsx:70-71` (`color,`/`border,`).
  Both are **false alarms** — the first is inside a plain-English JSX comment ("primary fill, danger ->
  error fill"), the second is my own grep matching text **inside** `var(--ds-button-primary-color, ...)`
  fallback-syntax string literals, not actual JS object shorthand. Read both in context to confirm;
  neither is a real site.
- Inline function return-type annotations shaped `): { ... } {`: **zero hits across all 9 files**
  (grep-confirmed). H1's `buildPaletteSteps` shape (triage §7.5's interface-member blind spot) does
  not recur in H2 at all.
- SVG `fill=`/`stroke=` bare JSX attributes: **real, found in 2 files** —
  `file-manager/engines/modern.tsx:174,178,224,230,294,298` and `empty-state/engines/modern.tsx:75`.
  Read every one in context: all are literal `fill="none"`, `stroke="currentColor"`, or
  `fill="currentColor"` — **100% STATIC, none runtime** (unlike CK-F's presence trap, where the SVG
  attrs carried genuine per-user runtime color). Per CK-F's own established rule ("moving a static SVG
  presentation attr into a CSS `stroke:` rule is a channel change, not byte-exact — keep it inline"),
  these stay exactly where they are; a byte-exact migration doesn't touch them. See Trap 4.

**5. A new discovery not in the inventory: a dead, pre-existing `--ds-empty-state-*` token surface
that `empty-state`'s own TSX never consumes.** `tokens/css/components/patterns.css:291-302` defines
`--ds-empty-state-bg`, `--ds-empty-state-border`, `--ds-empty-state-icon-bg`,
`--ds-empty-state-icon-border` (plus `--ds-empty-*` short aliases pointing at them). Grep-confirmed:
**nothing in `patterns/misc/empty-state/` references any of these**, and nothing else in the codebase
consumes them either — they are defined once and read nowhere. This is the mirror image of CK-C's
`--ds-saved-views-menu-shadow` finding (there, a consumer referenced a var nobody ever set; here, vars
are set that nobody consumes). Flagged so the H2 migration does **not** "helpfully" wire `empty-state`'s
new skin up to these tokens — that would be scope creep and a real visual change (the component
currently renders its own separate literal/token values, not these), not a byte-exact migration. See
Trap 5 (informational only, not blocking).

**6. Judgment calls the orchestrator should bless or override:**
- **3 units, not the "one per component" or CK-C's 4-unit shape** — H2 has categorically less risk
  surface than CK-C (no imperative writes, no portals, no keyframe injections, no cross-engine-metaphor
  split), so I grouped by shared-trap-ownership instead of by raw site count: Unit H2-1 owns both
  `_internal/engines/modern/styles.ts` consumers together (so one agent applies the P-78 check
  consistently to both rather than two agents re-deriving it independently); Unit H2-2 owns
  `file-manager` + `empty-state` together (both hand-roll their own `ds-spin`-referencing spinner,
  distinct from Unit H2-1's shared-module `spin`-referencing `spinnerStyle()` — a deliberate contrast,
  and `file-manager` is the unit that owns the two DaisyUI STOP-AND-VERIFY findings); Unit H2-3 is
  `token-inspector` alone, isolated because its "preserve hardcoded hex, do not tokenize" law and its
  `React.createElement` mechanism are both inversions of every other rule in this checkpoint and I did
  not want them diluted into a larger unit's instructions.
- **The anatomy section below is thinner than CK-C's.** CK-H's inventory gives H1 a full site-by-site
  line table (because of the exemption-list controversy) but summarizes H2 at the component/shape level
  only (§6's bulleted list of named maps/functions, not a per-line table). I did not re-derive a
  full per-line paint table for all 9 files myself — that would mean re-doing the inventory's own job at
  draft-review depth, and the kit already requires each migrating agent to read its own files fully
  before writing CSS regardless of what a contract says. The `data-part` vocabulary in §2.2 below is
  the named maps/functions I independently confirmed (`getFileIconStyle`, `statusBadgeStyles`/
  `statusColors`, `action.variant` chains, `isHighlighted`/`billingCycle`, `renderFeatureValue`,
  `sizeClasses`/`sizeDefs`/`primaryBtn`/`defaultBtn`, `panelStyle`) plus generic structural parts —
  treat it as a strong starting vocabulary, not an exhaustive part list.
- `token-inspector` gets a **single** scope class (`ds-pattern-token-inspector`, (0,1,0)) — confirmed
  it has exactly one exported component (`TokenInspector()`) and one root `React.createElement('div', ...)`
  at line 159, no multi-export shape like CK-F's `assistant`/`presence`. Mirrors CK-C's
  `status-filter-pills` precedent, not a new invention.

**7. Scope-class freedom — grep-verified.** All 5 candidate `ds-pattern-<comp>` names
(`file-manager`, `user-profile-card`, `pricing-table`, `empty-state`, `token-inspector`) return **zero**
hits anywhere under `tokens/css/` (confirmed both as a class prefix search and narrowed to the
`tokens/css/` subtree specifically) — the modern-only stamps are exactly as dead as the inventory's
§10 claims. One near-miss: `ds-empty-state` as a bare substring hits `patterns.css`'s
`--ds-empty-state-*` custom-property *names* (item 5) — not a class collision, just the same string
appearing in an unrelated token name; the class itself is free.

---

Reads on top of `wo-skin-06-ck-h-inventory.md` (the site-by-site truth for H1, the component-level
truth for H2) and `migration-kit.md` + `migration-kit-addendum.md` (the mechanics). The inventory is
normative for *what* paint exists; this contract is normative for *how* it moves. Where they
disagree, the inventory wins on facts and this contract wins on method.

Scope: `packages/core/src/components/patterns/misc/{file-manager,user-profile-card,pricing-table,
empty-state,token-inspector}/` — **216 counted sites, 5 components, 9 files, confirmed exactly 100%
category A** (0 B, 0 C, 0 N — the cleanest result of any checkpoint in this program to date). Every
`{file-manager,user-profile-card,pricing-table,empty-state}/engines/classic.tsx` (AntD-wrapped, 0
counted sites) is **out of scope and must not be touched.** `patterns/misc/{tenant-preview,
branding-preview-sandbox,brand-studio}` (H1, 237 sites, the brand-preview trio) are **not part of
this checkpoint** — deferred to a future CK-H1 contract pending the category-B exemption machinery
(`wo-skin-06-plan.md`'s two-piece dependency list). `patterns/misc/{cockpit-header,page-shell,
workbench-header}` also live under `patterns/misc/` but belong to CK-B/CK-C and are untouched here.

---

## 0. The one law that governs this checkpoint: no vocabulary to adjudicate, but two files carry a fleet-shared spread that must never be edited

Unlike CK-C and CK-F, **H2 has no cross-component shared-vocabulary question to adjudicate** — the
inventory's §9 confirms every local map/factory in this checkpoint (`statusBadgeStyles`, `statusColors`,
`renderFeatureValue`, `sizeDefs`, `sizeClasses`, `getFileIconStyle`, etc.) is genuinely local, imports
nothing from and exports nothing to any other CK-H2 file, and shares no name with a construct in any
other checkpoint. There is nothing here shaped like CK-C's `FILTER_PILL_*`/`saved-views-menu` near-miss
problem. **The one governing law for this checkpoint instead concerns the module TWO of its nine files
import from outside the checkpoint entirely:**

`user-profile-card/engines/modern.tsx` and `pricing-table/engines/modern.tsx` both import
`panelCardStyle`/`pillBadgeSmStyle`/`spinnerStyle` from `patterns/_internal/engines/modern/styles.ts`
— a module shared with 9 other consumers fleet-wide (6 of which already have shipped skins; see
DRAFTER NOTE 3). **`_internal/engines/modern/styles.ts` is never migrated, by this checkpoint or any
other.** Its own 18 counted sites are permanently out of scope for the whole program (they live under
their own counter entry, not any consumer's). At every call site in this checkpoint, the shared spread
(`{ ...panelCardStyle, ... }`, `{ ...pillBadgeSmStyle, ... }`, `style={spinnerStyle(24)}`) stays inline,
byte-for-byte, forever. **Only the LOCAL keys a file layers on top of the shared spread — after the
`...` in the same object literal — are this checkpoint's paint to migrate.** See Trap 1 for the exact
mechanics and the P-78 safety check that makes this legal.

Two components have a real, deliberate cross-engine visual divergence worth recording (not a defect,
not to be reconciled): `user-profile-card`'s status badge is a **15%-tint translucent background with
colored text** on modern (`statusBadgeStyles`, `color-mix(in srgb, var(--ds-color-success) 15%,
transparent)` etc.) versus a **solid color fill** on rustic (`statusColors`, a flat hex/token string
used directly). Both are internally consistent within their own engine. Preserve both exactly as
written — do not converge them, the same "preserve every divergence" rule as every prior checkpoint.

---

## 1. Migration units — three parallel agents, grouped by shared-trap ownership, not raw site count

- **Unit H2-1 — `user-profile-card` + `pricing-table` (both engines)** (30+28+22+31 = 111 sites, 4
  files). Skins: `engines/modern/skin/user-profile-card.css`, `engines/rustic/skin/
  user-profile-card.css`, `engines/modern/skin/pricing-table.css`, `engines/rustic/skin/
  pricing-table.css` (4 files). Owns Trap 1 (the `_internal/engines/modern/styles.ts` shared spread)
  for both of this checkpoint's consumers of that module — grouped deliberately so the P-78 safety
  check is applied once, consistently, by one reader, rather than rediscovered twice. Also owns the
  `user-profile-card` engine-divergent status-badge finding (§0) and `pricing-table`'s
  `renderFeatureValue` tri-state switch / `isHighlighted`/`billingCycle` ternaries (independently
  defined per engine, different token depth per engine per inventory §9 — preserve, don't reconcile).
- **Unit H2-2 — `file-manager` + `empty-state` (both engines)** (35+29+11+10 = 85 sites, 4 files).
  Skins: `engines/modern/skin/file-manager.css`, `engines/rustic/skin/file-manager.css`,
  `engines/modern/skin/empty-state.css`, `engines/rustic/skin/empty-state.css` (4 files). Both
  components hand-roll their OWN spinner referencing the shared `ds-spin` keyframe (already defined
  once in `engines/rustic/theme.css:1052`, cross-engine-shared, not duplicated — nothing to inject or
  rename, just a literal `animation:` reference to carry over verbatim) — a deliberate contrast with
  Unit H2-1's `spinnerStyle()`-via-shared-module `spin` reference. `file-manager` owns Trap 2 (the two
  DaisyUI-sourced STOP-AND-VERIFY findings) and most of Trap 4 (the counter-invisible static SVG
  attributes). `empty-state` owns Trap 5 (the dead `--ds-empty-state-*` token surface — informational,
  do not wire it up).
- **Unit H2-3 — `token-inspector` alone** (20 sites, 1 file). Skin: `components/skin/
  token-inspector.css` (1 file). Isolated because it inverts two of this checkpoint's otherwise-universal
  rules: it is written with `React.createElement`, not JSX (no `style={{...}}` literal to find —
  paint lives in `style:` properties inside `createElement` option objects), and it hardcodes literal
  hex **by design**, which must be preserved verbatim, not tokenized (Trap 3). Engine-agnostic, single
  root, single exported component — gets a single scope class, not the two-class engine-split shape.

Agents run in parallel; each stages ONLY its own files by explicit path (never `git add -A` — shared
tree). **Entrypoint wiring is reserved for the orchestrator** — agents create skin files but do NOT
edit `foundation/base.css` or `entrypoints/styles.css`.

---

## 2. Anatomy pre-step (inert, runs BEFORE any migration; orchestrator-owned)

**H2 has a partial head start on scope classes, the same shape CK-F had — not CK-C's full greenfield.**
Zero `data-part` anywhere (confirmed, all 9 files). But 4 of 5 components already carry
`ds-pattern-<comp> ds-engine-modern` on their modern root (dead — grep-confirmed zero references
anywhere in `tokens/css/` — but real and consistent, not to be re-minted). The gap is symmetrical
across all 4: **rustic carries nothing.** `token-inspector` carries nothing on either "side" (it has
no engine split).

### 2.1 Scope-class convention

| Component | Tier | Scope class | Shape | Status |
|---|---|---|---|---|
| `file-manager` (modern) | patterns/misc, engine-split | `ds-pattern-file-manager ds-engine-modern` | (0,2,0) | **already stamped** |
| `file-manager` (rustic) | patterns/misc, engine-split | `ds-pattern-file-manager ds-engine-rustic` | (0,2,0) | **must be added** |
| `user-profile-card` (modern) | patterns/misc, engine-split | `ds-pattern-user-profile-card ds-engine-modern` | (0,2,0) | **already stamped** (both root branches, lines 85 + 112) |
| `user-profile-card` (rustic) | patterns/misc, engine-split | `ds-pattern-user-profile-card ds-engine-rustic` | (0,2,0) | **must be added** |
| `pricing-table` (modern) | patterns/misc, engine-split | `ds-pattern-pricing-table ds-engine-modern` | (0,2,0) | **already stamped** |
| `pricing-table` (rustic) | patterns/misc, engine-split | `ds-pattern-pricing-table ds-engine-rustic` | (0,2,0) | **must be added** |
| `empty-state` (modern) | patterns/misc, engine-split | `ds-pattern-empty-state ds-engine-modern` | (0,2,0) | **already stamped** |
| `empty-state` (rustic) | patterns/misc, engine-split | `ds-pattern-empty-state ds-engine-rustic` | (0,2,0) | **must be added** |
| `token-inspector` | patterns/misc, engine-agnostic, single root | `ds-pattern-token-inspector` | (0,1,0) | **must be added** (greenfield, no engine split) |

All 5 names grep-verified free across `tokens/css/` (DRAFTER NOTE 7). Adding the missing rustic stamps
is purely additive (a new className, nothing removed) — not a byte-exact hazard by itself, but it must
still pass the pre-step's two invariants (below) like every other change in this program.

### 2.2 `data-part` stamps

Stamp every painted element, named by role. The vocabulary below is the named maps/functions and
structural parts independently confirmed during drafting (DRAFTER NOTE 6) — read each file fully for
the complete part list per the kit's standing requirement; this is a strong starting point, not an
exhaustive inventory-backed list the way CK-C's was:

- **`file-manager`**: `root`, `toolbar`, `view-toggle`, `row` (state: `data-selected` — see Trap 2 for
  why this is NOT sufficient by itself to restore the `tr.active` highlight), `folder-icon`,
  `file-icon` (via `getFileIconStyle(item)`, a MIME-type 4-way switch — `data-file-type` or similar),
  `checkbox`, `folder-link` (see Trap 2 — this part currently carries NO inline color at all; stamping
  `data-part` here does not by itself decide whether the skin should re-declare the `a.link` color).
- **`user-profile-card`**: `root` (two render branches, both already carry the modern stamp — stamp
  `data-part='root'` on both), `avatar`, `name`, `role`, `status-badge` (`data-status` mirroring
  `statusBadgeStyles`/`statusColors`'s keys: `active`/`away`/`busy`/`offline`), `department-badge`,
  `action-button` (`action.variant` 3-way chain — `data-variant`), `spinner` (the shared
  `spinnerStyle()` call — see Trap 1, this part's OWN keys never move, only whatever local override, if
  any, sits beside it).
- **`pricing-table`**: `root`, `toggle` (`billingCycle` — `data-cycle`), `plan-card`
  (`isHighlighted` — `data-highlighted`), `plan-badge` (the `pillBadgeSmStyle`-based "Save 20%"/"Most
  Popular" spans — Trap 1 applies here too), `feature-row` (`renderFeatureValue`'s tri-state switch —
  `data-feature-state`), `cta-button` (`primaryBtn`/`defaultBtn`-shaped), `spinner`.
- **`empty-state`**: `root`, `icon`, `title`, `description`, `action`, `secondary-action`, `spinner`
  (this component's OWN hand-rolled spinner, not the shared module's — see Unit H2-2 note above).
- **`token-inspector`**: `panel`, `header`, `title`, `close`, `token-row`, `token-name`, `token-value`
  (`state.pinned` / `t.value.startsWith('#')` ternaries per inventory §6 — `data-pinned`, and a
  swatch-vs-text distinction for hex-shaped values).

Never a bare `[data-part]` — always anchor to the scope class.

### 2.3 The two invariants (inert until proven — kit + README law)

The pre-step must prove BOTH before any paint moves: (a) the counter is byte-identical to HEAD for all
9 files in scope, confirming the added rustic stamps and the fresh `token-inspector` stamp moved no
paint; (b) the element tree is unchanged, proven by a TS-compiler AST diff with attributes stripped,
DRILLED. Record visual baselines for all 5 components (both engines for the 4 dual-engine ones) after
stamping, and stability-pass them before any unit starts writing CSS.

---

## 3. The five traps — each is a STOP-AND-VERIFY, not a footnote

**Trap 1 — `patterns/_internal/engines/modern/styles.ts` is a fleet-shared module; its own keys never
move, and only the LOCAL keys layered after its spread are this checkpoint's paint.** Confirmed call
sites: `user-profile-card/engines/modern.tsx:74,113` (`{ ...panelCardStyle, boxShadow: 'var(--ds-
elevation-1)', ...style }`), `:76` (`style={spinnerStyle(24)}`, no local override), `:136,144`
(`{ ...pillBadgeSmStyle, background: '...', color: '...' }` / `{ ...pillBadgeSmStyle,
...statusBadgeStyles[user.status] }`); `pricing-table/engines/modern.tsx:65` (`style={spinnerStyle(24)}`,
no local override), `:86,107` (`{ ...pillBadgeSmStyle, background: '...', color: '...' }`). **Before
deleting any local key from a merged object literal, check P-78: does the shared spread ALSO define
that same property?** If yes, deleting the local override un-hides the shared value — which is STILL
INLINE, so the new CSS rule can never win over it (inline always beats any external stylesheet
regardless of specificity); the migration would silently change what renders. If no (the common case
here — `panelCardStyle` defines `background`/`border`/`borderRadius`, never `boxShadow`;
`pillBadgeSmStyle` defines layout/typography keys, never `background`/`color`), it is safe: delete
only the local literal key(s) from the JSX object, leave the `...sharedSpread` untouched, and write the
CSS rule for exactly those local keys. This is not a novel resolution — it is the **already-shipped**
pattern from `tokens/css/engines/modern/skin/invoice-template.css` (WO-SKIN-06 checkpoint CK-D/F), which
names this exact law P-78 in its own header comment; read it before writing either skin in Unit H2-1.
`_internal/engines/modern/styles.ts` itself is not touched by this checkpoint, full stop — its counter
reading (18) is permanent, fleet-wide infrastructure debt, not this checkpoint's to carry.

**Trap 2 — `file-manager` modern has two paint mechanisms with no traceable, confirmable CSS source in
this codebase; STOP-AND-VERIFY before touching either.** (1) `engines/modern.tsx:211` toggles a bare
`className={selectedItems.includes(item.id) ? 'active' : ''}` on the selected
table row — grep-confirmed **zero** `tr.active` or table-row `.active` rule anywhere in `tokens/css/`.
If this renders anything today, it comes entirely from DaisyUI's own compiled base stylesheet (outside
`tokens/css/`, not read for this inventory or this contract). Do not assume it's dead OR assume it's
live — get an empirical computed-style read on the production build before deciding whether the new
skin needs to reproduce a selected-row background at all. (2) `engines/modern.tsx:236-237` renders the
folder-name link as `<a className="link link-hover cursor-pointer">` with **no inline color** — but
`tokens/css/engines/modern/theme.css:753-763` carries a real, live, LAYERED `[data-tenant] a.link {
color: var(--ds-link-color); ... }` rule (`color` is a channel P-76's preflight never kills). This is
the FloatButton-shaped hazard from WO-SKIN-04: today's folder-link color comes entirely from a bare
DaisyUI class reaching a personality-layer rule, never from anything `file-manager` owns. A skin
scoping `.ds-pattern-file-manager` selectors must explicitly decide whether to inherit this (leave the
DaisyUI class in place, accept the personality-layer dependency) or re-declare `color` in the new skin
— either is legitimate, but doing neither (silently dropping the class while migrating) changes the
rendered link color. Report the decision, don't default silently.

**Trap 3 — `token-inspector`'s hardcoded literal hex is BY DESIGN and must be preserved verbatim, never
tokenized.** Its job is displaying the resolved value of `--ds-*` tokens on whatever element is
hovered, including a broken or in-flux theme — if its own panel depended on the same tokens it
inspects, it could become invisible or miscolored exactly when it's most needed. Confirmed: single
exported component `TokenInspector()` (`index.tsx:44`), single root `React.createElement('div', { ref:
panelRef, style: panelStyle }, ...)` at line 159, written entirely in `React.createElement` calls, not
JSX — there is no `style={{...}}` literal to find-and-replace; the paint lives in `style:` properties
inside `createElement`'s option objects. Transcribe every literal hex (`#1a1a1e`, `#2a2a2f`, `#60a5fa`,
etc.) byte-exact into the skin; do not replace any of them with a `var(--ds-*)` token, even where an
equivalent token exists elsewhere in the system. Flag any hex a migrating agent is tempted to "fix" —
don't fix it.

**Trap 4 — counter-invisible SVG presentation attributes exist in this checkpoint, and all of them are
STATIC — stay inline, do not move to a CSS `fill:`/`stroke:` rule.** Found in `file-manager/engines/
modern.tsx:174,178,224,230,294,298` (`fill="none"`, `stroke="currentColor"`, `fill="currentColor"`) and
`empty-state/engines/modern.tsx:75` (`fill="none"`, `stroke="currentColor"`). Every one is a literal
JSX attribute, none bound to a variable — unlike CK-F's presence trap (where the SVG attrs carried
genuine per-user runtime color and had to stay inline for a RUNTIME reason), these are static and
counter-invisible simply because they're bare attributes, not object-literal style keys. Per the
established rule from that trap: moving a static SVG presentation attribute into an external CSS rule
is a channel change (attribute → stylesheet), not a byte-exact no-op — leave every one of them exactly
where it is. They do not count toward either file's counter floor and never will; do not chase them.

**Trap 5 — a dead, pre-existing `--ds-empty-state-*` custom-property surface exists in `tokens/css/
components/patterns.css:291-302`, and `empty-state`'s own TSX never references any of it.**
`--ds-empty-state-bg`, `--ds-empty-state-border`, `--ds-empty-state-icon-bg`,
`--ds-empty-state-icon-border` (plus `--ds-empty-*` short aliases) are defined once and grep-confirmed
consumed nowhere in the codebase — not by `empty-state` itself, not by anything else. This is
informational, not blocking: **do not wire the new `empty-state` skin up to these tokens** as part of
this migration. Doing so would be a real visual change (the component currently paints from its own
separate literal/token values) disguised as tidiness. If the team wants `empty-state` to eventually
consume this pre-existing token surface, that's a deliberate follow-up decision with its own baseline,
not something this byte-exact migration should do as a side effect.

---

## 4. Runtime, exemptions, specificity

**Zero RUNTIME sites in this checkpoint (inventory §6, confirmed: "Grep-verified: `creationConfig`/
tenant-hex-style identifiers do not exist in this half at all") — no `SKIN-EXEMPT-RUNTIME-VALUE`
exemption entry needed for H2, and no C-category custom-property hatch required.** This is the
cleanest result of any checkpoint so far on this axis, same footing as CK-C. Do not add a
`skin-exemptions.json` entry for anything in this checkpoint.

**Specificity (P-48).**
- The 4 dual-engine roots get the standard two-class `.ds-pattern-<comp>.ds-engine-<engine>` — (0,2,0).
  Border-COLOR rules need the target's `data-part` REPEATED ×2 to reach (0,4,0) and beat the tenant
  floor `html[data-tenant]…*` at (0,3,1). Non-border paint wins unlayered at (0,3,0) with a single
  `data-part`. **EXCEPTION: `color` on a composed `<Text>`/`Typography.Text` needs (0,5,0)** — the
  Typography engine skin paints every `<Text>` at (0,4,0) via `[data-color]`, so a (0,3,0) color rule
  loses once the inline color is stripped — data-part ×3 on these two-class roots (×4 on token-inspector's
  single-class root); raw-element/icon color stays (0,3,0). See the migration-kit specificity law.
- `token-inspector` is the one **single-class** root in this checkpoint (0,1,0) — mirrors CK-C's
  `status-filter-pills` precedent (itself mirroring CK-F's `assistant`/`presence`), not the
  `data-terminal-card` mistake the kit warns against. Border-color rules there need `data-part`
  REPEATED **×3** to reach (0,4,0) — count the actual root classes, do not assume the ×2 recipe applies.
  I did not independently enumerate whether `token-inspector`'s panel carries a border-color site (the
  inventory doesn't break it down channel-by-channel); Unit H2-3 must check the live file and apply ×3
  if any border-color rule is needed.

**All skins are UNLAYERED** (P-76/P-47). State the reason in each skin's header comment. **Never write
`*/` inside a skin comment** — it closes the block comment early and voids every rule after it.

---

## 5. Keyframes disposition

**No `@keyframes` injected anywhere in this checkpoint (grep-confirmed, all 9 files) — nothing to
rename, nothing to move out of a `<style>` tag, because none exists.** Two files reference
already-globally-defined keyframes by name in their `animation:` property, and both references are
safe to carry over verbatim as-is:

| File | Reference | Source | Action |
|---|---|---|---|
| `file-manager/engines/modern.tsx`, `empty-state/engines/modern.tsx` | `animation: 'ds-spin var(--ds-motion-glacial) linear infinite'` (hand-rolled local spinner style, own `border`/`borderTopColor` keys) | `ds-spin` keyframe defined once in `engines/rustic/theme.css:1052`, cross-engine-shared, not duplicated here | Migrate the `border`/`borderTopColor` keys as normal counted paint (`data-part='spinner'`); keep the `animation:` value exactly as written — it is a reference to an existing global name, not an injection, nothing to rename. |
| `user-profile-card/engines/modern.tsx`, `pricing-table/engines/modern.tsx` | `style={spinnerStyle(24)}` (entirely from the shared `_internal` module) | Resolves to the shared module's own `spin` keyframe reference (`spinnerStyle()`'s own `animation:` property, defined in `_internal/engines/modern/styles.ts`, never this checkpoint's file) | Nothing to do — this call site contributes zero paint to either consuming file (see Trap 1); do not touch it. |

The `ds-spin`/`spin` naming split between these two pairs is not a defect — it is the same
already-documented split CK-D found (`ds-spin` cross-engine-shared via `theme.css`; `spin` reached
through the `_internal` module) recurring here, not a new one.

---

## 6. Certification

Per unit, in order: (1) **byte-exact** = the component's visual spec passes against the committed
pre-step baselines (both engines for all 4 dual-engine components), 0 pixels over
`maxDiffPixelRatio: 0.0005`, stability-re-run; (2) **counter delta reconciled** — this checkpoint's
counter is reliable (no imperative-write blind spots, unlike CK-C) but Unit H2-1 must additionally
confirm by hand that `user-profile-card`'s and `pricing-table`'s post-migration counter floor reflects
ONLY their local keys, not a phantom expectation that the shared module's keys should also disappear
(they never will — Trap 1); (3) **no cross-component bleed** = every rule scope-anchored (zero bare
`[data-part]`), wiring append-only; (4) **no core regression** = the `patterns/misc/{file-manager,
user-profile-card,pricing-table,empty-state,token-inspector}` vitest suites green. The full visual +
full core suites are the belt-and-suspenders pass when the environment has headroom; if resource
pressure kills them, certify byte-exact via the per-component spec + no-bleed-by-construction and
record the owed confirmatory pass. Unit H2-2 additionally reports its STOP-AND-VERIFY findings for
Trap 2 (the `tr.active` and `a.link` decisions) explicitly in its certification report, even though
neither is a counted site — silence on either would read as "confirmed dead," which is not established.
Only after a unit certifies does the orchestrator append its `@import` lines to `foundation/base.css`
and commit that unit — units may certify and land in any order.

---

## 7. What this checkpoint does NOT do

- Does not touch any of `{file-manager,user-profile-card,pricing-table,empty-state}/engines/classic.tsx`
  (0 sites each, AntD-wrapped, out of scope).
- Does not touch `tenant-preview`, `branding-preview-sandbox`, or `brand-studio` (H1 — deferred to a
  future CK-H1 contract pending the category-B exemption machinery).
- Does not edit `patterns/_internal/engines/modern/styles.ts` — its shared spread stays inline at every
  call site in this checkpoint, permanently (Trap 1).
- Does not tokenize `token-inspector`'s hardcoded hex values (Trap 3 — preserve verbatim, by design).
- Does not move any of the confirmed-static SVG `fill=`/`stroke=` attributes into CSS (Trap 4).
- Does not wire `empty-state`'s new skin up to the pre-existing, currently-dead `--ds-empty-state-*`
  token surface in `patterns.css` (Trap 5 — that would be a real visual change, not a byte-exact move).
- Does not resolve the `tr.active`/`a.link` STOP-AND-VERIFY findings unilaterally — Unit H2-2 reports,
  the orchestrator or team decides (Trap 2).
- Does not reconcile `user-profile-card`'s engine-divergent status-badge treatment (translucent tint on
  modern vs. solid fill on rustic) — preserve both (§0).
- Does not add any `skin-exemptions.json` entry (§4 — zero runtime sites, nothing to exempt).
- Does not let agents wire entrypoints (`foundation/base.css`/`entrypoints/styles.css` —
  orchestrator-owned).