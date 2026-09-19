---
"@rottay/design-system": minor
---

WO-FAM-11 sub-lot D: the command chain (`command-palette`,
`connected-command-palette`, `shortcuts-overlay`, `search-command-bar`) and the
package's single keyboard owner.

THE KEYBOARD OWNER. `DesignSystemProvider` now mounts `ShortcutProvider`, once,
inside `CommandRegistryProvider`. It was a standalone provider an app had to
mount itself, so `useGlobalShortcut` threw unless it did -- which is exactly why
owners in this package hand-rolled document `keydown` listeners instead. The
registry's listener is capture-phase and the command registry's is bubble-phase,
so a chord registered in both fires once, in the shortcut registry. The cut's
three internal listeners retire onto it:

  - `shortcuts-overlay` closed on a document `keydown` -- a third keyboard
    authority that fired for a dialog the user need not even be focused in. Its
    Escape is now the chamber's own decision, beside the focus trap that was
    already there. Drilled both ways: Escape inside the dialog dismisses, Escape
    on a control outside it no longer does.
  - `connected-command-palette` parsed `mod+k` itself, with its own platform
    detection, its own modifier table and its own editable policy. It now
    registers the chord with `ShortcutProvider` through the sanctioned
    `useHasShortcutProvider` opt-in, so the chord is finally visible to the
    cheatsheet this same component populates -- it never was before.
  - `search-command-bar` held a window listener for `/` with a hand-written
    `isTypingContext` guard that restated the registry's own suppression rule.

  MEASURED CONSEQUENCE, stated rather than hidden: the registry suppresses every
  shortcut while focus is in a text field, and an OPEN palette's search box is
  one. `mod+k` therefore opens the palette and no longer toggles it shut;
  Escape, the backdrop and the close control dismiss it, as they already did.
  Restoring the typing-context exemption means a flag on `ShortcutDefinition`,
  which is the shortcut kernel's singleton contract and outside this write set.

THE DERIVERS. Three new `derivation/chrome/*` owners, none of which existed:
`command-palette` (54 channels), `shortcuts-overlay` (45) and
`search-command-bar` (143). Every produced value is the single chained fallback
its Modern skin reads it with, and each family's contract suite pins the two
texts equal channel by channel, so producing a name changes WHO can reach the
value and not what it rests at. `search-command-bar` additionally pins the
namespace CLOSED: the skin reads no `--ds-search-command-bar-*` name the deriver
does not produce. The DT registers all three in `derivation/index.ts`.

THE FALSE GREEN, ANSWERED. `search-command-bar` was pinned at
`readWithoutProducer=0` with 22 channels read -- all of them ROOT tokens. The
namespace did not exist, so there was nothing for a tenant to reach and nothing
for a ratchet to see. It is created here and the skin is rewired onto it; the
denominator moves 22 -> 167, and that movement, not the zero, is the
measurement.

THE PRODUCERS WITH NO READER. Of the eight `--ds-command-palette-*` channels the
theme root and `chrome-variables` already emit, the Modern skin read zero. Three
now land, each measured paint-neutral in BOTH the artifact-present and
artifact-absent cases because the root's rest and the family's paint already
agree: `-border` on the search and footer hairlines (both `--ds-color-border`),
`-group-color` on the section headings behind the narrower
`--ds-search-category-color` a tenant may also author, and `-shortcut-border`
through the composed Kbd's own `--ds-kbd-frame`.

  FIVE ARE REFUSED ON MEASUREMENT, and the refusal is drilled. They name paint
  this pattern gave away when it adopted certified primitives, and their root
  rests disagree with the rests those primitives hold: `-bg` rests on
  `--ds-color-bg-elevated` where `--ds-modal-bg` rests on
  `--ds-material-overlay-background`; `-shadow` on `--ds-shadow-dialog` against
  `--ds-elevation-4`; `-backdrop` is the dialog's `::backdrop`, an ancestor a
  property set on the surface cannot reach; `-empty-color` is the composed
  Empty's description ink (`--ds-color-text-secondary` against the root's
  `--ds-color-text-muted`), behind a rule a palette selector could only beat by
  the specificity war this file forbids; `-item-hover-bg` rests on
  `--ds-material-card-background-hover` where the row rests on
  `--ds-surface-inset`. Wiring any of them repaints every tenant that never
  authored the field. Routed to the owner of the bridge, not taken here.

A DEAD RULE MADE LIVE, AND THE PIXELS IT MOVES. The palette's own
`max-inline-size: 32rem` was authored at (0,3,0) against the modal skin's
(0,4,0) surface rule and has not applied since the Modal composition landed; the
chamber has been running on `--ds-modal-width-md`, 560px. It now reaches the
chamber through `--ds-modal-max-inline-size`, which is how one owner tunes a
composed primitive. The palette narrows 560px -> 512px: the measure the rule
always stated. Named here because it is the one deliberate paint change in the
lot.

THE ANATOMY AND THE STATE. The palette row becomes a component so it can run
`useInteractionState` and stamp `partAttributes`: the skin's bare `:hover` is now
`:is([data-state~='hovered'], :hover)` and one place decides when a row is
hovered. `data-loading` becomes the governed `data-state~='loading'`. The
`style={{ maxHeight }}` inline paint becomes
`--ds-command-palette-list-max-block-size`, the one thing the contract lets a
style object carry. The hand-made three-row skeleton -- 14 constructs across the
TSX and the skin, including a per-component shimmer -- is replaced by the shared
`AnatomySkeleton` drawing the real row anatomy. `search-command-bar` stopped
stamping `data-part='voice-help-confirm'`, a name the skin never painted -- the
drawer's forward action is the certified primary Button exactly as the primitive
ships it -- and its lone `:focus-visible` rule is gone: it gated a CHANNEL behind
a second opinion about keyboard focus, and the Button already draws
`--ds-button-focus-ring` only inside its own paired arm.

THE FIRST HONEST COVERAGE. `search-command-bar` had no `tests/` directory at
all. Its first suite (9 cases) measures the accessible anatomy, and it found a
real defect on the way: the command input carried a placeholder and no
accessible name, so it reached AT as an unnamed textbox. Fixed with the
`aria-label` the sibling `shortcuts-overlay` search box already carries. Plus
three cut suites: `command-palette` (8), `shortcuts-overlay` (4) and the
`connected-command-palette` ASSEMBLY contract (6) -- the composition owner has
no skin anywhere and is deliberately NOT in the roster, because a family enters
when its paint exists and inventing paint so a row could be pinned is the wrong
fix. What it owns is the import chain and the keyboard authority at its middle,
and that is what its suite pins, listener count included.

MEASURED, per family (`node scripts/check/family-cut/index.mjs --family=<id>`):

  command-palette      inlineStyleViolations 1 -> 0, skeletonHandMade 14 -> 0,
                       partsStampedNotConsumed 1 -> 0, partsConsumedNotStamped
                       1 -> 0, unpairedStatePseudoSelectors 1 -> 0,
                       skeletonPartsWithoutRole 11 -> 10;
                       channelsRead 25 -> 76, partsStamped/Consumed 24 -> 19.
  shortcuts-overlay    every ratchet already 0 and still 0;
                       channelsRead 24 -> 70.
  search-command-bar   a11yAssertions 1 -> 0 (the arm passes),
                       partsStampedNotConsumed 1 -> 0,
                       unpairedStatePseudoSelectors 1 -> 0,
                       skeletonPartsWithoutRole 27 -> 26;
                       channelsRead 22 -> 167, partsStamped 33 -> 32.

ROUTED, NOT FIXED. The 42 surviving `skeletonPartsWithoutRole` across the three
families need entries in `SKELETON_PART_ROLES`, the shared renderer's singleton
vocabulary, which is outside this write set (FAM-11 sub-lot B set the precedent
by routing its twelve). The palette's cut suite carries the routing slip for its
own two, `item-main` and `item-text`, and fails the day the DT adds them. The
`@status` note in `runtime/application/interaction/shortcuts` still says
`ShortcutProvider` is NOT mounted by `DesignSystemProvider`; that file is the
kernel's and is now one sentence stale. The baseline re-pins and the three
`derivation/index.ts` registrations are the DT's, per the sub-lot protocol.
