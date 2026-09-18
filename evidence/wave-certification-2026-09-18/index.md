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
