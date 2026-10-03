---
"@rottay/design-system": patch
---

Popover wears the tenant's focus signature (`states.focus-style`: ring,
underline or glow, emitted as the box-shadow `--ds-focus-ring`) instead of one
solid outline under every focus style, and every Popover-hosted family shows
exactly one indicator when it opens from the keyboard.

DECLARED VISUAL CHANGE, measured in Chromium on the real Modern components,
with `data-engine="modern"` on the document and on a nested `[data-ds-root]`:

| family | what paints, and when | before | ring | underline | glow | forced colors |
| --- | --- | --- | --- | --- | --- | --- |
| Popover | the surface, for its OWN keyboard focus (a keyboard-initiated open that parks focus on the surface) | solid outline whenever focus was anywhere inside, pointer included | double ring in front of the elevation | 2px underline on the surface's bottom edge, elevation kept | 1px ring and halo in front of the elevation | `max(2px, width) solid Highlight` |
| ColumnMenu (hosted in a Popover) | the Popover surface, which holds focus when the menu opens from the keyboard | the Popover's solid outline at open; the panel overlay as a second indicator once a control inside took focus | double ring in front of the panel elevation | 2px underline | 1px ring and halo | inset `max(2px, width) solid Highlight` |

A pointer-initiated open shows no indicator on the surface. A control that
takes focus inside a Popover shows only its own indicator. Where an elevation
is `none`, the surface wears the signature alone.

The Modern Popover surface now stamps `data-state` (`focused`,
`focus-visible`) for its own focus through the shared interaction anatomy.

No tenant hook changes its default. `--ds-column-menu-panel-focus-ring`,
`--ds-column-menu-panel-focus-outline` and
`--ds-column-menu-panel-focus-outline-offset` are now read by the ColumnMenu
surface as well as by its panel; an authored ring replaces the signature there,
and `none` leaves the elevation alone. Other Popover-hosted content that paints
its own `box-shadow` on the surface from a later layer must compose the
signature itself, as ColumnMenu now does.

Known and open, not changed here:

- The interaction kernel's modality rule
  (`foundation/behavior/runtime/interaction-state`, the focus handler): a
  script hand-off after a pointer open reads as keyboard, so a DS control that
  a Popover focuses after a pointer open shows its focus indicator.
- ListToolbar's filter option and the segmented density radio show no focus
  indicator in forced colors.
- Popover's first-control focus does not land when its content is DS-rooted
  (the surface takes focus instead).
- ColumnMenu's own focus effect on its panel is dead: the Popover has already
  placed focus when it runs.
