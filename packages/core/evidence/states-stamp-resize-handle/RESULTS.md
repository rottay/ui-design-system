# ResizeHandle stamps the interaction state its owners' skins paint

Packet: splitter's gutter stamps through the shared `ResizeHandle`
(stamp-truth adjudication route (b), the states-arm chain).
Tree HEAD at start: `61c3d5479dc4a40d19a15762a3d47a8053bac929` (main).

Instrument md5 at measurement time:

| file | md5 |
| --- | --- |
| `src/components/primitives/foundation/resize-handle/index.tsx` (AFTER) | `2d942b4baa43efae1f8b320bbd267f72` |
| `.../resize-handle/index.tsx` (BEFORE, `git show HEAD:`) | `815bf18c5b6890aa969c20a35cc63d6e` |
| `src/components/primitives/layout/splitter/engines/modern/index.tsx` | `e8acd32c9c828166f97a2da854ed8e35` (untouched) |
| `.../engines/modern/skin/splitter/index.css` | `e90811f101f38cd6f9c1db4c0f5ff17d` (untouched) |

## Consumers of the shared primitive

Two, both measured:

| owner | how it reaches the edge | anatomy it passes |
| --- | --- | --- |
| `primitives/layout/splitter/engines/modern` | `ResizeHandle` per gutter | `data-part='gutter'`, `data-orientation`, `data-dragging`, `data-resizable` — **no `data-state`** |
| `patterns/data/widget-board/engines/foundation` | `ResizeHandle` per edge, wrapped in its own `BoardResizeEdge` state host | `data-part='resize-handle'`, **`data-state` (its own)**, `data-edge`, `data-active` |

`primitives/display/table/.../parts/presentation/resize-handle` and the
`data-table` engines carry local components of the same name; neither imports
this primitive.

## Live Chromium probe

Real React mount of the modern Splitter (free gutter + a `resizable={false}`
gutter), the shipped `dist/styles.css`, `html[data-tenant='rottay']`,
transitions pinned off, real pointer and keyboard. `pageerrors: 0` in both
arms. Colours read through a 1x1 canvas (`color-mix` serializes as
`color(srgb …)`).

| step | `data-state` BEFORE | `data-state` AFTER | bg B -> A | ring B -> A |
| --- | --- | --- | --- | --- |
| 1 rest | null | null | `#e5e5e5` -> `#e5e5e5` | none -> none |
| 2 hover | null | `hovered` | `#a7a7a7` -> `#a7a7a7` | none -> none |
| 3 press / drag begins | null | `hovered pressed focused` | `#747474` -> `#747474` | 2px solid -> 2px solid |
| 4 dragged off the gutter | null | `hovered pressed focused` | `#747474` -> `#747474` | 2px solid -> 2px solid |
| 5 release, pointer OFF **[latch]** | null | `focused` | `#e5e5e5` -> `#e5e5e5` | 2px solid -> 2px solid |
| 6 pointer parked | null | `focused` | `#e5e5e5` -> `#e5e5e5` | 2px solid -> 2px solid |
| 7 keyboard Tab in | null | `focused focus-visible` | `#e5e5e5` -> `#e5e5e5` | 2px solid -> 2px solid |
| 8 ArrowRight resize | null | `focused focus-visible` | `#e5e5e5` -> `#e5e5e5` | 2px solid -> 2px solid |
| 9 Tab away | null | null | `#e5e5e5` -> `#e5e5e5` | none -> none |
| 10 after a mouse click | null | `focused` | `#e5e5e5` -> `#e5e5e5` | 2px solid -> 2px solid |
| 11 locked gutter, rest | null | null | `#e5e5e5` -> `#e5e5e5` | none -> none |
| 12 locked gutter, hovered | null | `hovered` | `#e5e5e5` -> `#e5e5e5` | none -> none |

**Paint cells that moved: 0 / 12. `data-state` cells that moved: 9 / 12.**

Non-vacuity floor: the instrument does read paint changes — steps 2 and 3 are
`#a7a7a7` and `#747474` against the `#e5e5e5` rest in BOTH arms.

Readings that decide the design:

- **BEFORE is null at every step.** The receipt's runtime measurement
  reproduces: the gutter paints three states and nothing stamps them.
- **Step 5, the latch.** Hover and press both clear on release even though the
  pointer ended off the rail under pointer capture. The stale-hover ghost Fable
  found on the table lot does not reproduce here; `pointerup` and
  `pointercancel` are the press boundaries a captured drag has.
- **Step 3 / 10, the ring.** The kernel stamps `focused` WITHOUT
  `focus-visible` on a pointer gesture, which is the contract. Chromium's own
  `:focus-visible` answers TRUE there (the engine's explicit `.focus()` after
  `preventDefault()` reads as a script focus), so the pseudo half of the
  `:is()` keeps the ring lit and the paint does not move. Registered as a
  standing F-37 divergence on splitter's gutter, not repaired here: the fix is
  the skin's, and the skin is not in this write set.
- **Step 8.** No `pressed` from the keyboard. A `div[role='separator']` never
  takes `:active` from the keyboard, so the twin must not invent it.
- **Step 12, the locked gutter.** The stamp lands and is inert: the skin
  refuses it through `:not([data-resizable='false'])`, exactly as it refuses
  `:hover`. The owner's vocabulary keeps its own authority.

## family-cut gate — the row does NOT clear

Byte-identical before and after, on every family (`findings` 6 -> 6):

| family | `statesConsumedNotStamped` | `stateContract` | `stateGoverned` |
| --- | --- | --- | --- |
| splitter BEFORE | 3 | false | false |
| splitter AFTER | 3 | false | false |

Cause, measured from the gate's own resolver: `resolveFamily`
(`scripts/check/family-cut/index.mjs:534-545`) builds `sources` by walking the
family's own owner directory and follows no imports, so splitter's corpus is
its three files under `src/components/primitives/layout/splitter/` and
`primitives/foundation/resize-handle/` can never enter it. The composed credit
integrated at `ace98c15d` does not reach it either: it grants only where the
owning compound carries `.ds-button`, and the gutter's compound is a bare
`[data-part='gutter']` (`stateComposedFrom: []`).

This is the STOP condition the packet named. The corpus attribution is the
DT's to adjudicate; the gate was not edited and no baseline was moved.
