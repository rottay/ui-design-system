---
"@rottay/design-system": patch
---

DataTable's inline cell editor wears the tenant's focus signature.

The editor renders raw form controls: `input[data-part="editor-input"]` (text,
number, date), `select[data-part="editor-input"]` and
`input[data-part="editor-checkbox"]`. No primitive skin paints their focus, and
the family stated `outline: none` on the input, so once the global raw-input
ring stops reaching inputs the design system stamps, the open editor had no
focus indicator of its own (the checkbox kept the browser default). Each
control now carries `var(--ds-focus-ring)` on its own box, with a transparent
outline at the signature's offset. The editing cell is not clipped
(`overflow: visible`, 4px 6px padding), so the solid part of every signature
stays inside the cell.

The Modern engine bridge paints every bare `select` on focus with
`outline: none; box-shadow: 0 0 0 2px var(--ds-color-primary-100)`, from the
engine layer, above the family skin. That rule now excludes
`select[data-part="editor-input"]`, so the select editor wears the signature
like the other four; before, it kept the bridge's fixed pale ring and had no
indicator at all in forced colors. Its focused border no longer turns
`--ds-color-primary-500`: the signature is the focus indicator. Every other
`select` keeps the bridge rule.

DECLARED VISUAL CHANGE, measured in Chromium with the editor held open, after
keyboard focus, in the document scope and in a nested `[data-ds-root]`:

| `states.focus-style` | editor control |
| --- | --- |
| `ring` | the double ring around the control |
| `underline` | the 2px underline along the control's bottom edge |
| `glow` | the 1px ring and its halo |

The row, group header row and sortable header overlays now show only while
that node holds focus itself. The engine stamps `focus-visible` on a row or a
header cell whenever focus sits anywhere inside it, so the overlay used to ring
the whole row around a focused editor, selection checkbox or row action, and
the header cell around its focused resize handle: two indicators at once. With
a descendant focused, only the descendant's own indicator paints now, in forced
colors too.

A text, number or date input matches `:focus-visible` however it was focused,
so opening the editor with the pointer shows the signature too; the checkbox
shows none on pointer focus. Forced colors keep a system-colour outline,
`max(2px, var(--ds-focus-ring-width)) solid Highlight`. No channel is added,
removed or re-derived. A `custom` editor renders the consumer's own control and
is not painted by the family.
