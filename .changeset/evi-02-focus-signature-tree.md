---
"@rottay/design-system": patch
---

Tree wears the tenant's focus signature (`states.focus-style`: ring, underline
or glow, emitted as the box-shadow `--ds-focus-ring`) on its row and its move
control, instead of one solid inset outline under every focus style.

DECLARED VISUAL CHANGE, measured in Chromium on the Modern Tree with real
keyboard focus (Tab in, ArrowDown, Tab to the move control), in the document
scope and in a nested `[data-ds-root]`:

| focus target | before | ring | underline | glow | forced colors |
| --- | --- | --- | --- | --- | --- |
| row | solid inset outline, plus the 30% primary ring of the current item | double ring on an overlay inside the row | 2px underline along the row | 1px ring inside the row; its halo is cut by whatever scrolls the tree | inset `max(2px, width) solid Highlight` |
| move control | solid inset outline | double ring | 2px underline | 1px ring and halo | `max(2px, width) solid Highlight` |

One indicator at a time: the row paints its overlay only while the row itself
holds focus, and the current-item mark (`data-focused`, the 30% primary ring)
no longer paints while the row or its move control shows the signature. The
mark is otherwise unchanged: the engine keeps the roving position after focus
leaves the tree, so it still shows the current item on a blurred tree and after
a pointer press. A pointer press shows no focus signature.
