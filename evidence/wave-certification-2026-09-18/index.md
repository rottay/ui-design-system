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
