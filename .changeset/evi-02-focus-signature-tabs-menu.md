---
"@rottay/design-system": patch
---

Tabs and Menu show the tenant's focus signature on every focused row, selected
or not.

Tabs. A selected `contained` / `card` / `segmented` / `pills` tab showed no
focus indicator under any `states.focus-style` signature: its selected rule's
shadow replaced the focus shadow. In `underline` / `line`, and on any tab at
the edge of a scrolling list, the list cut the ring. The signature now rides an
overlay inside the focused tab, inset by its own reach
(`--ds-focus-ring-offset` + width), in every variant; the tab keeps its
selected fill and elevation beneath it.

Menu. In the horizontal mode the menubar cut the ring and the halo above and
below every row, and the selected row's 2px rule sat exactly where the
`underline` signature painted. There the signature now rides an overlay inside
the row, under its content, so the underline lands above the rule. In the
vertical, inline and collapsed modes the signature stays on the row and is
stated first, composed with the selected shadow and keyline, or with the hover
shadow, instead of replacing them; a hovered or pressed row no longer loses its
focus indicator. Each composition applies only where the composed shadow is not
`none` (`--ds-menu-item-shadow-active`, `--ds-elevation-2`,
`--ds-menu-item-keyline`; `--ds-menu-item-shadow-hover`, `--ds-elevation-1`),
so a flat elevation posture keeps the indicator.

Both families read `--ds-tabs-focus-ring` / `--ds-menu-focus-ring`, which alias
`--ds-focus-ring`, so an authored signature keeps precedence. A
pointer-initiated focus shows no indicator, as before.

DECLARED VISUAL CHANGE, measured in Chromium on the real Modern components
after real keyboard focus, in the document scope and in a nested
`[data-ds-root]`, light and dark:

| node | before | after: `ring` | after: `underline` | after: `glow` | forced colors |
| --- | --- | --- | --- | --- | --- |
| tab, selected, `contained` / `card` / `segmented` / `pills` | nothing | double ring inside the tab | 2px line inside the tab | 1px ring inside the tab | inset Highlight outline with a HighlightText ring inside it |
| tab, any other | ring outside the tab, cut above and below in `underline` / `line` and at a scrolled edge | double ring inside the tab | 2px line inside the tab | 1px ring inside the tab | inset Highlight outline |
| horizontal menu row | ring cut above and below; underline on the selected rule | double ring inside the row | 2px line above the selected rule | 1px ring inside the row | inset Highlight outline (HighlightText on the selected row) |
| vertical menu row, selected | signature, selected shadow and keyline dropped | signature over the selected shadow and keyline | same | same | inset HighlightText outline |
| vertical menu row, hovered or pressed | hover shadow, no signature | signature over the hover shadow | same | same | Highlight outline |

Inside a tab or a menubar row the soft halo of `glow` is no longer drawn
outside the row. On a selected `pills` tab, whose fill is the focus colour, the
`underline` line and the `glow` ring are still not distinguishable from the
fill; that follows the signature's own text and is unchanged by this patch.
