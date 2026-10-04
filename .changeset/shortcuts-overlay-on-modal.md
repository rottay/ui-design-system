---
"@rottay/design-system": major
---

`ShortcutsOverlay` (Modern engine) is now composed on `Modal`, and `Modal`
returns focus to its invoker after a controlled close. Seven published
`--ds-shortcuts-overlay-*` frame channels are retired with the hand-rolled
chamber (`-z-index`, `-inset-block-start`, `-narrow-inset-block-start`,
`-scrim`, `-scrim-tint`, `-scrim-filter`, `-dialog-radius`): the Modal
channels own that paint now, and a tenant that authored one of the retired
names loses that paint — the retirement is deliberate (major, precedent
`evi-02-overlay-focus-retired`), not silent.

**Modal: focus return on close (Modern engine)**

- Before: closing a `Modal` by flipping `open` to `false` left keyboard focus
  on `body` whenever the control that opened it lives outside the dialog. The
  browser's own restore runs while the page behind the dialog is still inert,
  so it cannot land on that control.
- After: once the dialog is gone and the page is released, a focus that is
  stranded on `body` goes back to the control that had it when the dialog
  opened.
- Unchanged: a focus the close moved somewhere on purpose stays there; an
  invoker that left the document is not refocused; a modal that never opened
  touches nothing; the unmount-while-open salvage is the same.

Every Modern `Modal` consumer gets this.

**ShortcutsOverlay: the chamber is Modal (Modern engine)**

The overlay no longer hand-rolls a `role="dialog"` frame, a backdrop, a Tab
trap or focus restore. It renders the native `<dialog>` chamber `Modal` owns.
Props and copy are unchanged.

| | before | after |
| --- | --- | --- |
| Page behind the overlay | scrollable and focusable | scroll locked, inert, overlay in the top layer |
| Tab | wraps inside the overlay | native trap; passes through the browser chrome once per cycle |
| Below 640px | top sheet with a backdrop | fullscreen, no backdrop; Close and Escape dismiss |
| Backdrop blur | the glass dial (12px at rest, none under reduced motion) | Modal's own (4px, kept under reduced motion) |
| Text the overlay does not size (key caps, row line height) | inherited from the page | Modal's body type role (key cap 12px -> 10.5px at rest) |
| Frame | no border | Modal's 1px border, keyline and surface lift |
| `className` / `style` | on the full-viewport root | on Modal's surface (the card) |

Measure, fill, elevation, ink and entrance timing still answer to the
overlay's own channels (`--ds-shortcuts-overlay-dialog-max-inline-size`,
`-padding-inline`, `-dialog-bg`, `-dialog-shadow`, `-dialog-color`,
`-enter-duration`, `-enter-easing`), which the skin now delivers through
Modal's.

**Retired channels**

Seven `--ds-shortcuts-overlay-*` channels are no longer produced and no longer
read. Each named a part of the frame that is now Modal's; an authored value
paints nothing.

| retired | tune instead |
| --- | --- |
| `--ds-shortcuts-overlay-z-index` | nothing: the native top layer |
| `--ds-shortcuts-overlay-inset-block-start` | Modal's `placement="top"` offset |
| `--ds-shortcuts-overlay-narrow-inset-block-start` | nothing: Modal is fullscreen on phones |
| `--ds-shortcuts-overlay-scrim` | Modal's scrim |
| `--ds-shortcuts-overlay-scrim-tint` | Modal's scrim |
| `--ds-shortcuts-overlay-scrim-filter` | Modal's backdrop blur |
| `--ds-shortcuts-overlay-dialog-radius` | `--ds-radius-xl` (Modal's `radius="xl"` rung) |

Classic and Rustic are frozen and unchanged: neither read any of the seven.
