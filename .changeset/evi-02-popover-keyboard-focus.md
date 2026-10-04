---
"@rottay/design-system": patch
---

Popover (Modern) moves initial focus to the first control of a panel whose
content mounts after the surface.

An activation-driven open (click, Enter, Space) focuses the first focusable
control of the panel one frame after it opens, and falls back to the surface
when there is none. Engine-switched primitives suspend on first use, so a panel
built from them was still empty in that frame: focus was parked on the surface
and stayed there, and a keyboard user had to press Tab again to reach the first
control (the list-toolbar settings panel, column settings).

The surface now keeps watching its content while it holds that parked focus and
hands it to the first control that mounts within one second. It stops when focus
leaves the surface, when the popover closes or when that second has passed, so a
focus the user has moved is never taken back and content that loads later does
not pull focus; read-only content keeps focus on the surface as before. Hover
and focus discovery, touch and controlled opens still never move focus.

ColumnMenu lands every open on its panel, including the first one, and never on
Reset.

No API, anatomy or paint change.
