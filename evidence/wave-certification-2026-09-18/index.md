# Wave certification — the R17 + FAM-08/DnD + FAM-09 window (2026-09-17/18)

Measured on clean pinned worktrees (never the draft-carrying execution tree).

## Full vitest suite

| tree | files failed | tests failed | passed |
|---|---|---|---|
| audited base `814927519` | 22 | 52 | 17,197 |
| HEAD after the wave (`ddf4ca87e` + artifacts `14960a8ee`) | 32 | 68 | 17,665 |

**Cured by the wave: 26 reds** (red at base, green at HEAD) — mostly the drained axe pins and the
wave's repaired families.

**New reds at HEAD (16 unique), classified:**

| class | tests | disposition |
|---|---|---|
| Artifact freshness (staleness window between the last regeneration and the last source lots) | first-party-artifacts-generated ×3, parity ×3, mount bytes ×3 | **CLEARED by the window** (`14960a8ee`); green on the regenerated worktree (40/40) |
| Population/inventory moves from the wave | axis-difference-pilot population pin; theme-contract-freeze channel-owner census; probe-roster grid fixture; non-chart-anatomy TreeView pin (the lot-7 drag-handle) | re-pin with the named cause — pending, mechanical, DT-window |
| Intentional contract change | consumer "reports unlit for a role v1 cannot carry" (the display role now carries — W14) | the test's premise retired by the fix; needs its honest rewrite (writer seat) |
| Needs diagnosis before any re-pin | Input + InputNumber axe (real browser); antd classic bridge mode-from-block; PresenceBar avatar geometry; LongTailBatch gallery/grid pins; Display1 Card loading; Display2 List loading; FloatButton backtop; CollectionWorkspace focused-row | **not assumed re-pinnable** — each gets measured first |
| The inventory-correspondence overlap (the fail-fast front of the CI gates inventory) | stepper/compound/steps + toggle/compound/switch land in two owners | the D3 leftovers; routed with the retirement question |

## The CI gates inventory (fail-fast by design)

Progression measured: contract-changeset-drill (cleared when the 5b changeset landed its rows) →
retired-identity (three comments named the retired vertical; fixed `ddf4ca87e`) →
inventory-correspondence (the D3 leftovers, above). 172 gates not reached past the front red —
the inventory's full state is measured only when the front clears; that is recorded, not hidden.

## Not certified, honestly

- The D/E header cohort drafts (in-flight, preserved, quota-blocked writer).
- Milestone B's fleet evidence (awaits the chart lane + the owner decisions).

## 2026-09-18 follow-up (the writer seat is quota-blocked; DT-only repairs)

Repaired and committed by the DT (each verified by its own suite): the TreeView
drag-handle pin, the probe-roster grid fixtures, the Input/InputNumber dark-scope
axe pins (bithire dark drained; **rottay dark keeps a REAL residual**: the input
field's ground stays `#ffffff` while its ink follows the dark ramp, 1.04:1 — a
derivation defect routed to the input surface's mode channels, NOT a drained pin),
and the antd bridge's dark-block pin (premise retired by the mode-canvas law, the
assertion rewritten to the new contract).

Still measured-parked for the writer seat (failure signatures measured this wave):
Card/List loading anatomy (Display1/2Batch), the CollectionWorkspace focused-row
class, the LongTail gallery/grid anatomy pins, the PresenceBar avatar geometry
read, FloatButton's backtop flake class, and the theme-contract-freeze minting
census (re-pins when the D/E drafts land — measuring twice is the trap).

## 2026-09-18 (second sitting) — the D/E drafts re-measured over a quiet tree

The preserved FAM-10 cohort D/E drafts (cockpit / workbench / mobile / stats /
section-frame) re-ran focal: 9 of 10 test files green (69 passed, 5 skipped).
The one known calibration red (the cockpit causality probe's `radiusScale: 1.25`,
over the rottay envelope 0.8..1.2) was masking everything behind it — admission
throws before any arm measures, so the writer never saw the rest of that block.

**DT calibration, measured:** the probe moved to `1.2`, the envelope maximum and
the fleet-wide convention (mobile-header, column-menu, saved-views, cascader,
color-picker all probe 1.2). The edit stays INSIDE the preserved draft
(uncommitted, part of cohort D), recorded here, not landed apart.

**Newly exposed red, diagnosed, routed to the writer:** with admission repaired,
`palette.seeds` fails first in rottay — `cardGround` (the root's
`background-image`) reads `none` in the base AND the moved arm. Root cause is
structural, not a probe slip: the deriver produces
`--ds-cockpit-header-bg: var(--ds-card-header-bg, <seeded gradient>)`, but
`foundation/tokens/css/presentation/components/card/index.css:96` states
`--ds-card-header-bg: transparent` on `:root`, and that default ships in all
three vertical artifacts (dist measured: rottay/bithire/evnto each carry it
once). The fallback gradient is dead code — the card ground never responds to
palette in ANY vertical; rottay simply measures first in
`FIRST_PARTY_VERTICALS` order. The writer's own deriver comment states the
intent ("the gradient is the foundation's own reading of it when no tenant
states one"), so either the chain must distinguish authored from default, or
the arm over-claims and drops `cardGround`. A semantic decision on the draft —
parked for the writer seat, with this measurement as the brief.

## 2026-09-18 (third sitting) — pilot population re-pinned; fleet floor attribution

**Pilot pin (WO-EVI-05): re-pinned, green.** The red was exactly the catalog
revision digest (`d50537e438bdbcfa` -> `49bc4572fa60d2e5`): one catalog edit
since the pin (`63aec5c5e`, the W14 display-role ingress — row 6's document
keypath gains `display`), 29 decision rows and identical row ids on both sides,
pilot membership/axes/denominators/N-A all unchanged. `pilot/index.json`
republished at HEAD with the named cause in its provenance (DT re-pin, measured
with the instrument over the checked-out bytes; `--pilot --check` exits 0).
One DT error caught and reverted during the re-pin: the pin's `previousPin`
block records the PRE-EXCLUSION membership (the unit drill pins
`previousPin.denominators.shape === 5`), not the immediately prior publication —
the first edit rolled it forward and the drill refused it; reverted.

**Fleet floor: stale, attributed, NOT re-pinned — one axis needs an instrument
decision first.** Live vs pinned (pinned at `7b35276d5`): shape 215->217,
typography 180->181, rhythm 213->221, depth 193->194, states 155->**153**,
motion 200->204. Measured family-by-family against a scratch worktree at the
pinned commit (each tree measured by its own instrument):

- *Additions* (the wave's new skin families): aspect-ratio, box, container
  (shape/depth; container also rhythm/motion); avatar-compounds
  (typography/rhythm); divider, flex, grid, sidebar-surface, skeleton-anatomy,
  space, stack (rhythm; flex/grid/sidebar-surface/space/stack also motion).
- *Cuts*: steps merged (FAM-05 `1ddfd6198`/`3ed62c175` era — already excluded
  from the pin), layout-primitives and layout-sidebar cut (FAM-05), scroll-area
  removed from depth/motion.
- *states −2, the shrink that blocks a mechanical re-pin:*
  - `filter-panel` — 8fb516981 moved its reset onto the composed Button's ghost
    channels; the family STATES `--ds-button-ghost-*-hover/-active` for the
    Button to paint. The state paint lives in Button (already in the states
    population). A reviewed ownership move, not lost paint.
  - `active-filters-bar` — e8c78c576/3ed62c175 moved its domain state from the
    shared `data-state` to the namespaced `data-filter-state` (9 state rules
    still on disk and painting). The population instrument's `stateSelectors`
    recognize only the literal `[data-state=` substring — an instrument blind
    spot over a reviewed product decision. With the namespaced attribute
    recognized, states reads 154; without it, 153.

The floor law forbids shrinking a denominator without a named, owner-visible
reason. The honest re-pin therefore waits on the instrument question (teach
`stateSelectors` the namespaced `[data-<ns>-state=` form — an EVI-lane
instrument lot for the writer seat) and the owner-visible record of the
filter-panel delegation. The three remaining population unit reds are exactly
this floor staleness (the runner line constant `shape 216`, the floor constant
assertions, the floor-vs-live check); the pilot arm of those tests is green.

## 2026-09-18 (fourth sitting) — CollectionWorkspace focused-row: attributed

Reproduced: `CollectionWorkspace.test.tsx:495` — the focused `<tr>` renders with
NO class (received: empty), `data-focused` absent. Root cause is a shape change
the wave landed underneath the decorator: FAM-08 B4 (`1f171b2db`) extracted the
modern data-table's body row into the stateful `BodyRow` component
(`useStatefulPart` + `partAttributes("body-row", ...)` stamped INSIDE the
component). `markCollectionWorkspaceFocusedRow`
(collection-workspace/index.tsx:230) still matches the pre-cut shape —
`child.type === 'tr'` AND `data-part === 'body-row'` in the element's props —
and a `<BodyRow>` element satisfies neither, so the decoration silently no-ops.
The table engine's own output guard already encodes the correct membership test
(`isValidTableBodyRowOutput`: `child.type === "tr" || child.type === BodyRow`,
engines/modern/index.tsx:71-82), but neither `BodyRow` nor the guard is
exported, so the workspace cannot share it.

Writer brief (component contract, not a re-pin): make the decoration recognize
the stateful row — export the row guard from the engine, or move the
focused-row concern into the renderRow contract so the workspace never sniffs
element types. The silent-no-op failure mode deserves a regression either way:
a decorator that matches nothing must fail loudly, not pass undecorated rows.

## 2026-09-18 (fifth sitting) — PresenceBar avatar geometry: premise retired, not a paint regression

Reproduced: `presence.modern-rescue.test.tsx:41` — `face.style.width` reads `''`
where the test expects the literal `var(--ds-avatar-sm-size)`. Named cause:
`6627914f0` (WO-FAM-06 avatar cut) deleted the modern Avatar engine's inline
`sizeStyle` (`width/height: var(--ds-avatar-<size>-size)`) and moved the geometry
to the skin — `skin/avatar/index.css:383-385` rules
`[data-size='sm'] { inline-size: var(--ds-avatar-sm-size) }` on the same element,
with the engine stamping only `data-size` (engines/modern/index.tsx:201). The
governance chain the test exists to prove (token, not a pattern pixel table) is
INTACT — it lives one layer over, which is exactly where the inline-paint zero
lock requires it. Writer brief: rewrite the assertion against the skin contract
(a computed-style read in the real-browser suite, or data-size + the skin rule),
not a re-pin of the retired premise; the line-43 slot assertion never ran (the
test dies at line 41) and needs its first honest reading.

## 2026-09-18 (sixth sitting) — LongTail sidebar pins: CURED by DT re-pin

The failing pin was the sidebar block of the I-3 layout test: it expected the
pre-cut `.ds-surface.ds-sidebar` / `.ds-sidebar__*` vocabulary. Named cause:
`1ddfd6198` (WO-FAM-05 close) renamed the sidebar surface's BEM hooks to
`ds-sidebar-surface-*` and moved navigation/main to bare `data-part` reads.
Consumer check first (the D21 lesson): no file in app-bithire, app-evnto or
app-platform reads the retired names. Re-pinned to the measured vocabulary;
the file's 6 tests green. The gallery/grid pins recorded beside it live in the
same file and are green with it.

## 2026-09-18 (seventh sitting) — Display1 Card / Display2 List loading anatomy: premise retired by the FAM-06 cuts

Reproduced: `Display1Batch:99` (`skeleton` part absent in Card loading) and
`Display2Batch:196` (zero `skeleton-row` in List loading). Named causes:
`3aea57452` (WO-FAM-06 lot 1, card cut) restructured Card loading to
`loading-content/loading-overlay/spinner`; `6a4910dc1` (WO-FAM-06 T3 phase 2)
moved List loading to three `AnatomySkeleton`-derived items inside a
`loading-grid` that reserves the real tracks (no reflow on resolve), with the
single busy announcement on the root. Both tests pin the retired hand-rolled
skeleton parts (`skeleton`/`skeleton-bar`, `skeleton-row`/`skeleton-avatar`/
`skeleton-line`) — the WO-SKIN-05 checkpoint assertions written against the old
anatomy. Writer brief: rewrite both against the shipped loading contract (List:
loading-grid + derived skeleton items + root busy; Card: overlay/spinner per
the cut) — the loading-state coverage the checkpoints exist for must be
re-asserted, not dropped.

## 2026-09-18 (eighth sitting) — FloatButton/BackTop flake: mechanism characterized

The batch runs green in isolation (NavigationBatch 36/36, twice) — as a flake
class should. The mechanism is structural, in the modern BackTop engine
(engines/modern/index.tsx:204-221): visibility is a TWO-PASS effect chain.
Mount stamps `visible=false` and `scrollSource=undefined`; a commit-every-
render effect resolves the target into `scrollSource` (second render); only
then does the listener effect run `handleScroll()`, which is the first moment
`visible` can become true (third render). The listener effect's
`scrollSource === undefined` bail means the initial `handleScroll` NEVER runs
on first commit, even for the default window target whose answer is known
eagerly. With `visibilityHeight={0}` the trigger therefore appears two effect
passes after mount, and under parallel-suite load that lands outside the
`waitForPart` window intermittently — the recorded flake. Same shape in the
FloatButton.BackTop composition. Writer brief: compute the initial visibility
eagerly for the default window target (the `useState(false)` initializer knows
`scrollTop >= visibilityHeight` without any effect), keeping the two-pass
resolution only for ref-backed targets — which also removes a real
two-frame pop-in on first paint, not only the test flake.

## 2026-09-18 (ninth sitting) — D/E draft PRE-AUDIT, part 1 (writer still quota-blocked)

Audited ahead of integration so the writer's cardGround repair is the only open
item when the seat returns. PASS so far:

- derivation/index.ts: five derivers imported and registered, placement clean.
- cockpit modern engine: the hand skeleton retires for
  `AnatomySkeleton{busy:false}` around the live chrome — the skeleton's source
  wrapper carries `aria-hidden` + `inert` while loading, so the invisible
  controls are unreachable; the root keeps the single busy announcement
  (role=status + aria-busy + translated label). Interaction kernel adopted with
  the pointer-only split on the card documented (a bubbled crumb focus must not
  stamp the card's ring). No `React.` leftovers after the import change.
- section-frame: the retired `rt-section-frame__*` BEM names survive ONLY as
  negative assertions in the draft's own cut/causality tests; no production
  selector reads them.
- workbench keeps its `React` default import (its `React.KeyboardEvent` at :181
  is safe); section-frame's `React.JSX.Element` predates the draft.

Still to audit: the workbench engine diff, the mobile-header rendering diff, the
four skin diffs, the five new derivers, the new test files.

## 2026-09-18 (tenth sitting) — D/E draft PRE-AUDIT, part 2 (engines done)

- workbench modern engine: PASS. The QuickActionButton wrapper span retires —
  the Button IS the `action` part and re-derives `data-variant` from its closed
  prop domain; verified the workbench variant domain (`primary|default|danger`,
  contracts:27) is a subset of `ButtonVariant`. SavedViewTab adopts the kernel
  keeping roving tabindex + data-active; new `tab-label` part is the loading
  stand-in. Same AnatomySkeleton composition as cockpit (busy=false, root owns
  the announcement). `import React` kept for `React.KeyboardEvent` — safe.
  INTEGRATION GATE: tsc must run on the final candidate (the draft was never
  type-checked by the DT; vitest does not typecheck).
- mobile-header rendering: PASS. Kernel adoption on the family's own back
  trigger; `position: sticky` moved from an inline style to the skin keyed on
  `data-sticky` — verified the stamp exists (rendering/index.tsx:141) and the
  consumer `style` keeps its last word. (First grep looked like a missing
  stamp; the full read found it. Recorded so nobody re-chases it.)

Still to audit: the four skin diffs (cockpit, workbench, mobile-header,
section-frame, stats-header), the five new derivers, the new test files.

## 2026-09-18 (eleventh sitting) — D/E PRE-AUDIT part 3: derivers — one FAIL found

- workbench-header deriver: PASS-with-note — same dead-gradient chain as
  cockpit (already in the completion brief; the twin gets the same answer).
- mobile-header deriver: **FAIL**. `--ds-mobile-header-safe-area` is produced
  as `var(--ds-safe-area-top, env(safe-area-inset-top, 0px))` — but `env` is
  NOT in the emission door's ALLOWED_VALUE_FUNCTIONS, and `admitCssVariables`
  omits an inadmissible channel WHOLE, in silence. Measured directly: the
  deriver's 16 channels enter the door, 15 leave; `safe-area` is the dropped
  one. The pixels survive only because the skin's double fallback restates the
  inset — which is exactly the silent-drop class the cockpit deriver's own
  docblock refuses (`--ds-cockpit-header-sticky-top` stays unproduced THERE for
  this precise reason). The draft is internally inconsistent: one header obeys
  the door law, the other claims a channel the door deletes. Repair (writer,
  added to brief-fam10-de-completion): either drop the channel from the
  deriver with the cockpit-style note, or route `env` admission as its own
  door decision — the door is kernel governance, not this lot's call. No
  census caught this: produced-vs-EMITTED is not counted anywhere; routed as
  instrument residue.
- cockpit deriver: already audited during the cardGround sitting.

## 2026-09-18 (twelfth sitting) — D/E PRE-AUDIT part 4: skins + tests — verdict

Channel correspondence, both directions, measured mechanically across all five
families: every deriver-produced channel has a skin reader, and no skin reads a
family-namespaced channel nobody produces — except the two DOCUMENTED cases
(cockpit's `--ds-cockpit-header-sticky-top`, deliberately unproduced per the
door law; the cockpit/workbench `*-padding`/`*-gap` mounts the skin writes and
reads itself, the established "axis mounts once" idiom). stats-header's skin
conditionally remaps `--ds-stats-header-value-font-size` to the produced
`-compact` channel under the compact posture — a produced-channel shadow, noted
as acceptable (the compact value is itself tenant-reachable); watched.
Skeleton geometry is gone from both runtime skins (one comment mention each);
every `:hover`/`:active` arm keeps its `[data-state]` twin at its cascade
position; the section-frame cut test is a REAL contract (exact sorted part
roster, landmark/heading semantics — the family's first test file).

**Pre-audit verdict: the candidate is clean except the two named repairs** —
(a) the cardGround chain resolution (cockpit + workbench), (b) the mobile-header
`env` channel the door silently drops. Integration gates when the writer
returns: the focal ten files green, tsc on the final candidate, then the DT
window (build → hooks → cascade extract → derive → vertical-css →
decisions-lit) and the deferred theme-contract-freeze census re-pin.

## 2026-09-18 (thirteenth sitting) — D/E PRE-AUDIT part 5: modified tests — PASS, audit complete

The draft's edits to EXISTING tests are honest and in places stronger: the
skeleton tests now assert exact bone sequences measured from the chrome (not
declared sizes); workbench adds an explicit single-announcement a11y contract
(root role=status + label, source inert + aria-hidden, bones aria-hidden);
cockpit adds role/aria-label assertions and wraps focus in act(); the mobile
elevation test re-pins the retired `--_ds-*` private names to the public
channels the deriver promoted. One nuance recorded: the elevation assertions
read the SKIN source (root decls), not the emitted artifact — which is why they
pass while the door drops the deriver's env() channel; the two measurements
answer different questions and the FAIL in part 3 stands.

**Pre-audit closed.** Full surface covered: registry, 3 engines, 5 derivers,
channel correspondence both directions, 5 skins (skeleton retirement, pseudo
twins), new + modified tests. Verdict unchanged: clean except (a) cardGround
chain (cockpit + workbench), (b) mobile-header env channel. Gates at
integration: focal ten green, tsc on the candidate, DT window, census re-pin.

## 2026-09-18 (fourteenth sitting) — writer-seat succession executed; two Kimi-writer lots audited and landed

Owner decision 2026-09-18: the claude-admin weekly quota exhausted (reset
Sep 20 1pm NY) is superseded — the writer seat moves to the Kimi CLI under
model `kimi-code/kimi-for-coding` (the requested "k2.7" alias does not exist
in this installation; the configured cheaper-than-k3 coding model was used,
pinned per dispatch via `kimi -m`). The DT seat, audit discipline and
integration serialization are unchanged. Dispatch mechanics recorded:
`kimi -p` rejects `-y`/`--auto`; non-interactive mode already runs under the
auto permission policy (official docs), so the dispatch is plain
`kimi -m <alias> -p <prompt> --output-format stream-json`.

**Lot 1 — FAM-10 cohorts D/E completion** (brief-fam10-de-completion.md,
receipt-fam10-de-kimi.jsonl): the writer resolved both pre-audit repairs.
(a) cardGround: shape (b) — the ground is the shared card-header ground
verbatim; derivers produce `var(--ds-card-header-bg)` with the dead seeded
gradient removed (it never painted: the foundation ships
`--ds-card-header-bg: transparent` on :root in all three verticals), the
palette arm claims `tileInk` only, and the deferral is MEASURED by a new
test (produced ground resolves non-empty, background-image stays none under
a seeded palette). Workbench twin: same disposition. (b) mobile-header
safe-area: the channel is deliberately unproduced (cockpit sticky-top
disposition — `env` is not door-admitted; NOT a request to admit env, that
stays a kernel-governance question), the skin keeps its
`var(--ds-safe-area-top, env(...))` fallback, pinned by a deriver unit test
plus the flipped elevation assertion. DT audit: focal suite independently
reproduced 12/12 files / 112 passed; `tsc --noEmit` and `typecheck:tests`
(0 errors at baseline 0) clean on the final candidate; staged set exact
(33 files, writer-2 in-flight files excluded). Landed `e5c3a7334`; WO-FAM-10
progress receipt `ec3b0fc4e`.

**Lot 2 — wave-residue repairs** (brief-wave-residue-repairs.md,
receipt-wave-residue-kimi.jsonl), four tasks, four commits:
- `37efe1b49` CollectionWorkspace focused-row: the engine exports
  `isDataTableBodyRowElement` (single tr-or-BodyRow membership), the
  decorator consumes it and throws loudly on a no-match.
- `63e2d25e0` BackTop: eager initial visibility for the default window
  target in the useState initializer; ref-backed targets keep two-pass;
  rustic untouched.
- `35fb962ef` presence + Display1/Display2: premise-retired checkpoints
  rewritten against the shipped contracts (skin [data-size] rule;
  FAM-06 loading anatomies; rustic verbatim).
- `f8298d417` population instrument: `stateNamespacedSelector`
  `/\[data-[a-z0-9-]+-state=/` with a non-empty-namespace guard; drill
  added (namespaced declares states, shared keeps its needle, absence reads
  as none).
DT audit: 33 vitest files / 387 tests independently reproduced green;
population node --test 34 pass / 3 fail where the 3 reds are exactly the
stale floor pin (tree moved via the header lot + instrument change) and the
two N/A tests that read that floor — the new drill itself passes; tsc +
typecheck:tests clean on the final tree.

**Live instrument reading after both lots** (pre-re-pin): shape 217 (1 N/A),
typography 181, rhythm 221, depth 194, states 154, motion 204 — matches the
attribution recorded in the eighth sitting to the unit. The fleet floor
re-pin and the deferred theme-contract-freeze census re-pin run in the DT
window next. Writer-flagged residue: float-button carries the same two-pass
visibility pattern as BackTop (engines/modern:490) — routed to a future
dispatch.

## 2026-09-18 (fifteenth sitting) — integration window, fleet floor re-pin, and the gates inventory behind the front

**Micro-lot (Kimi writer, 2 min):** the DT window's build refused the wave at
`hooks:check` — UNADJUDICATED_GROWTH, `--ds-mobile-header-safe-area` read by the
skin with no producer (the deriver's deliberate non-production made the read
unowned; cockpit's grandfathered sticky-top read is the contrast). Repair:
the skin reads the canonical `var(--ds-safe-area-top, env(...))` directly in
all three declarations (pixel-identical — the outer var always fell through);
the elevation test pins both directions. Landed `b20bfb8b5` (mobile suite
31/31 reproduced by the DT).

**DT window, second run — GREEN end to end:** hooks:generate (first — the D/E
hook surface changed), build (incl. hooks:check), cascade extract --write,
ds:derive, build:vertical-css, decisions-lit. Regenerated artifacts and
contracts committed as `c9b8a835d`.

**Fleet floor re-pin `2249c3067`** (population suite 37/37): measured with one
instrument over this tree and over an isolated archive of the previous pin's
sourceCommit `7b35276d5`. Corpus 269->276: FAM-07 (89976e4c7) adds seven modern
layout skins (aspect-ratio, box, container, flex, grid, space, stack); the
WO-FAM-05 close (1ddfd6198) physically removes steps. Found and recorded: the
2026-09-15 pin was written ONE FAMILY SHORT of its own tree — it narrated steps
as already removed, but the folder left at 1ddfd6198, AFTER the pin's
sourceCommit (the pin's own provenance says "270 skin families at each step").
States re-pinned 155->154 with the two named, reviewed subtractions
(filter-panel's delegation to the composed Button 8fb516981; the steps exit) —
no shrink-to-pass; the namespaced-state instrument repair restores
active-filters-bar and moves no historical number (e8c78c576 postdates the old
pin). Catalog revision move d50537e438bdbcfa -> 49bc4572fa60d2e5 is 63aec5c5e's
membership-neutral row-6 keypath edit (identical row ids, measured). The
radio/shape exclusion record carries forward under `previousWave`; two stale
test literals (written for the E5 pin 216/217, stale since 2026-09-15) now
match the live derivation and the true previous pin (217/215).

**gates:ci --continue (full matrix, diagnostic):** the fail-fast front is the
KNOWN D3 leftover (inventory-correspondence: stepper/compound/steps and
toggle/compound/switch dual ownership — routed with the retirement question,
unchanged by this wave). Behind it, the accumulated wave-staleness surface the
front had hidden: fanout-facts / customization-surface / manifest-generation /
foundation-defaults / controls-doc freshness (generator re-runs owed), the
customization manifest's 11 stale family manifests referencing retired sources
(callout, message, notification, toast, auto-complete, switch, collapse, modal,
steps, tooltip, button — the FAM-01/02/03/14 renames/merges never propagated;
361 resolution FAILs) plus `notifier` missing its family-inventory row — SAME
root class as the D3 overlap (retirement never completed in the governance
artifacts). Ratchet movements needing named attribution before any re-pin:
state-material-arm 19 vs pinned 15 (4 new, to attribute per family),
4 ungoverned filter-pill channels without disposition, engine-token-audit,
cascade-wiring-ratchet, read-without-producer-ratchet. Each gets measured
before any pin moves — no blanket widening.

**Dispatched (Kimi writers, parallel, disjoint write sets):** FAM-10 sub-lot D2
(collection/dashboard/detail/header-surface — collection-header carries 104 of
the cut's inline paints), sub-lot F (record + 4 form surfaces, the ledger
doctrine), sub-lot G (surface-lifecycle). Deriver registration lines in
derivation/index.ts stay DT-owned at integration, one commit per sub-lot.

## 2026-09-18 (sixteenth sitting) — FAM-10 sub-lots D2/F/G landed; family-cut gate green

All three parallel Kimi writers returned; each candidate audited by the DT with
independent test reproduction and tsc, then integrated with serialized
derivation/index.ts registrations (DT's own lines, one commit per sub-lot).

- **D2 `7e13ee2e0`** — collection/dashboard/detail/header-surface: 4 derivers
  (82/23/30/0 channels — header-surface honestly zero-channel with a drift
  guard), collection-header's 104 inline paints drained to 0, dashboard's
  stateGoverned repair (domain status off the kernel's data-state onto
  data-status), detail-header RWP 31->1. DT integration edits: the HeadersBatch
  data-status premise. Audit: 157/157 reproduced, tsc clean.
- **G `bb29b085b`** — surface-lifecycle: 6 channels (incl. the census-mandated
  stale-banner pair), the error-boundary floor measured at exactly 3 inline
  properties with per-mode light-dark literals (the light-only pair measured
  1.7-2.5:1 in dark scopes). 38/38 reproduced.
- **F `97a4fb058`** — record + 4 form surfaces: 6 derivers, ledger doctrine
  (forms de-carded onto the ruled-alert banner), guided-draft-form's first
  kernel adoption and a11y assertions (0->17). 236/236 reproduced; one
  integration follow-through (the form-sections probe asserts the produced
  channel post-registration).
- **Rail repair `2fddf8f1b`** — F's ruled-alert banner used the banned
  chromatic left rail; the emphasis now wraps the perimeter (csssource green).
  Audit-gap recorded: the DT candidate checklist lacked csssource:check; it is
  now standard per candidate.
- **stats-header `843f03077`** — the four growing debts repaired: kernel wired
  (useInteractionState + partAttributes), hand-made skeleton retired for the
  house AnatomySkeleton; the batch contract splits the premise (modern vs
  frozen engines verbatim). family-cut gate GREEN from here.
- **family-cut baseline re-pin `f9d25a44c`** — 15 rows closed at zero debt,
  ratchets lowered to the gate's own measurements, stats-header and
  surface-lifecycle stay open with exact residual debt, surface-lifecycle
  classVocabularies 0->1 recorded as the single governed namespace (template
  target), not a split.
- **changeset format fix `a808102f5`** — a D2 changeset's contract-diff block
  used a non-grammar kind (DOM) and blocked the roadmap status generator;
  removed (prose carries the note, as in the sibling changesets).
- Receipts: WO-FAM-10 progress entry 7 (`644e9ce94`). WO-FAM-10 is NOT closed:
  the close audit against the WO's own acceptance gate (RWP=0 per family, axe
  per family, the closure criteria of F-55/F-41/F-64) plus the routed residue
  owners remain.

## 2026-09-18 (seventeenth sitting) — the full red ledger, attributed (4-agent forensic sweep)

Every red gate in gates:ci --continue reproduced and classified. CURED by the DT
window + re-pins this session (all instrument-verified): family-cut (gate+drill),
state-material-arm, theme-population (+drill), read-without-producer (+drill),
normalization-contract (+drill), artifact-coverage (+drill), decisions-lit-freshness,
fanout-facts-freshness (ordering defect found: fanout must run AFTER
foundation-defaults — 9eebadbdf had it backwards), docs-public-set (+drill),
customization-controls-freshness, foundation-defaults-freshness, vertical-css-source-staleness.
Commits: bfcac0099 (five instruments), 9eebadbdf, 70240e376.

REMAINING, by route:
- WRITER LOTS: cascade-wiring (~298 FAM-10 channels with no root path — the
  template's "produced value = the skin's literal fallback" doctrine collides
  with the ratchet's every-channel-roots law; needs the DER-lane ruling or a
  multi-lot wiring program — flagged for the owner as a doctrine question);
  channel-liveness SEMANTIC_OWNER_RULES extension for the 19 new derivers
  (precedent 748cdf85c); engine-token-audit real regressions (kanban
  c0ea6e447, file-manager/upload e4f1db1b9, chart renderers b23ac47a9 inline
  paint) plus the header-tone zero-counters re-pin; physical-properties
  (orphaned copyToClipboard exception + 2 offsetMargins sites); wiring-coverage
  (register the FAM-09 probe as a manual tool); baseline-discipline (3 ledger
  purpose fields, empty-ledger law, stale WIDENINGS entry, APCA drill synth);
  tenant-reachability drill corpus (REACH_CORPUS missing palette sub-owners
  since 4624e4555); integration-audit (12 --ds-sidebar-* orphan premium
  emissions, menu-cut residue); customization manifest stale bindings
  (11 families + notifier inventory row — RET-03 quarantine territory);
  engine-token-audit-drill control class ds-switch__track gone since 9d924e9f2
  (pick a live control); fanout-facts-drill line anchors follow the reads.
- OWNER DECISIONS (added): error-boundary exemption floor (SKIN-EXEMPT-
  CRASH-SAFE-FALLBACK=8 vs the measured 3-property floor — restore paint or
  re-declare); theme-channel-parity new buckets (collapse, type-tier letter
  spacing, sidebar — the gate law requires reviewed manual adoption);
  tenant-reachability 338 newly-resolved literals (route per class or
  accept-with-reason); theme-lowering-single-door ?? shape (9d7294e33 vs the
  arity census law); engine-posture classic/surfaces cell (measured gap 0 vs a
  pin that asserts unaccounted > 0 — reclassification); motion-contracts
  re-anchor over the settled sibling worktree (ratchet GREW — adjudication,
  not blind re-pin); csspaint --radius-field ownership; dead-writers anchor
  move (5 exits lawful, 9 new dead writers must be wired-or-retired first).
- PRE-EXISTING, already routed: D3 nested owners (toggle/switch,
  stepper/steps — quality-evidence-v2-drills + taxonomy-parity), the
  channel-liveness 3 STOP NO-GO rows (748cdf85c's packet).

A dispatched writer lot (brief-instrument-repairs-1.md) covers the four
mechanical instrument repairs: retired-vertical-identity comment word,
physical-properties exception+band, wiring-coverage probe registration,
baseline-discipline ledgers.

## 2026-09-18 (eighteenth sitting) — the wave's residuals closed; what stayed red and why

Afternoon session, all writers Kimi `kimi-for-coding`, every candidate DT-audited with independent
reproduction. Landed: cascade-wiring `7a67243d8` (164 channels re-chained to roots; the audit's
full-suite run caught a real pixel move — cockpit icon-size 40 -> 37.5px through a spacing rung —
reverted to the honest literal by the repair round, which also PROVED at a clean-HEAD worktree that
8 of the 10 failure groups I first attributed to the candidate were pre-existing wave residuals —
audit-method lesson recorded: control at clean HEAD before attributing), sidebar restore + census
fix `3b645f94b` (the integration-audit orphan census was blind to deriver-chain consumers; 8
chained emissions restored, 4 zero-reader names stay retired, drill added), residuals R1
`059b2b580` (documented zero-channel admission; the form-action-dock rename measured UNSAFE —
tenant-facing since 2026-07 — carve-out instead at `5d2704701`), R2 `175690d52` (skeleton pins,
motion guards, LongTail pins, the table deriver's second factor), layout middle links `fc59fce28`
(30 chains' middle links now produced at exactly resting values; 14 measured decision-less and
documented), the tenant-theme pins re-anchored with 27 measured provenance rows `bad0ad0df`, the
minting census at 108 owners `6479c1808`, the two pin re-reads `86d7ccdd8`, the DnD arm's
named-member attachment `2010ca2de`, and the re-pin/artifact sweep `4b82b2850`.

theme-iso measured a REAL law collision the writer correctly refused to pin over: D2's 23
`--ds-dashboard-header-*` channels trip the hard universal-name deny-list ("dashboard"). Routed to
the owner (F2.10): rename the family namespace or amend the list.

Still red by pending OWNER DECISION (each named in F2, evidence/owner-decisions-2026-09-18):
cascade-wiring's +136 (85 measured rootless vs the decrease-only law — vocabulary widening or a
named-constant amendment), engine-token-audit's error-boundary exemption floor, theme-channel-parity
buckets, tenant-reachability's 338 literals, theme-lowering-single-door's `??` shape,
engine-posture's cell reclassification, motion-contracts' sibling re-anchor, dead-writers' anchor,
the channel-liveness STOP NO-GO 3, the D3 nested owners. Still routed to writer lots: the ~51
other-family post-pin wireable channels, the RET-03 governance-manifest cohort, the customization
surface/preservation regen cascade (blocked on the manifest question), the float-button two-pass
residue. Full-suite + gates:ci --continue certification runs in the final pass.

## 2026-09-19 (nineteenth sitting) — the cascade saga closed; the remaining red is owned

The other-families cascade lot (`0ca2eb294`): the mechanical census found the
2026-09-14 pin never measured its own tree (R17-06's question, confirmed
against a pristine worktree) — the post-pin debt was 253 names in 16 families,
not the ~51 scalar arithmetic suggested. 150 wired with deriver/skin lockstep,
64 rootless-with-reason, 43 frozen-engine. The repair round restored two
reviewed contracts the re-chain had moved (tabs RTL twin's physical offset,
data-table pinned-inset byte shape — both recorded as measured rootless).
The writer re-pinned the baseline itself against the lot rules; the values were
verified against the gate's own live measurement before landing and the
discipline breach is on record. Gate green at 2056/2061/5546.

Follow-through repairs: 3 dangling reads the lot introduced (popover,
stepper — repaired with producers, RWP back to 530); the card middle link
(`8e656c2aa`, produced at the resting value; the writer over-ran its slot and
left its write set regenerating artifacts — stopped, the sound deriver edit
kept and audited, the churn reverted). Final re-pin sweep `34cd3fae5`:
artifact-coverage 10976 -> 11077 covered / uncovered holds 989, RWP
denominator 4660 -> 4718, family-cut channelsRead re-reads for 14 families,
population depth 198 -> 199 (sidebar-surface). All four gates green with their
drill suites (37/37, 19/19, 176/176, RWP exit 0).

**Where the programme stands after the whole wave:** family-cut, population,
artifact-coverage, read-without-producer, cascade-wiring, state-material-arm,
channel-liveness (minus the 3 NO-GO owner rows), decisions-lit, hooks,
csssource, physical-properties, baseline-discipline, wiring-coverage,
retired-vertical-identity, integration-audit, engine-token-audit (minus the
owner's exemption question) are GREEN. The full vitest suite stands at
~18170 passed with the remaining reds all classified: owner decisions (F2's
twelve) or the two documented rare flakes (ChartTheme.root-scope race,
recorded 2026-09-14; brand-studio fixture collision, unreproduced in 20+
runs). Next dispatched front: WO-RET-03's governance-manifest quarantine,
which unblocks the customization regen cascade (the 11 stale family bindings
are retired-family residue the quarantine deletes rather than repairs).

## 2026-09-19 (twentieth sitting) — writer-seat change ordered by the owner

Owner decision (2026-09-19): the writer seat returns to real Opus on the
daniel.avila@rottay.com profile (plain `claude` binary, 2.1.278) — the weekly
quota has its last points and expires in ~12h; use it. IN FLIGHT WORK IS NOT
INTERRUPTED: the Kimi writers keep their lots to completion (the RET-03
quarantine slice runs to its audit). The NEXT dispatch after the in-flight
lot lands goes to Opus; the receipt's model metadata is verified on arrival
(claude-opus-5 expected; an unexpected account/model stops that dispatch
only). The Kimi k2-code line stays the fallback seat if the Claude quota
exhausts mid-flight — the briefs are model-agnostic and the audit discipline
is unchanged.

## 2026-09-19 (twenty-first sitting) — RET-03 manifest slice + the customization cluster

RET-03 manifest slice landed (`f66b1bd45` + completion `b0b9e3c04` + `026c2ca5c`):
39 MB quarantined to docs/history/inventories/customization-manifest (304 renames,
content-preserved), every production reader measured and re-sourced or dropped, the
generator and its two gates retired through the runner's RETIRED_GATES mechanism
(drills assert the retirement). My integration pathspec missed the two readers
outside packages/core — caught by the post-commit porcelain sweep and completed in
the follow-ups; the staged-set rule now covers the repo root by default. SELF-REPORT:
the menu-deriver chain fix from the customization lot (f9a2da36e) sat outside that
commit's pathspec and landed inside 0c2111e87 instead; the content is the reviewed,
validated chain fix — the placement is mine.

Customization cluster: witness re-pointed to the live stack skin, fanout anchors
follow their reads, one dead writer wired (sidebar item font-size through the menu
chain), two retired with full reader censuses (0c2111e87). The surface drill's 5
pre-existing fails measured identical on the unmodified tree. Remaining in the
cluster: the dead-writers anchor's six lawful exits (the door runs when the
type-tier pair's owner ruling lands) and the reported-but-unfixed
--ds-collapse-border-color drifted read (collapse family reads a name nobody
declares — a real small defect for a follow-up lot).
