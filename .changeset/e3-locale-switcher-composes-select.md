---
"@rottay/design-system": patch
---

E-3 lot 2: the Modern `PatternLocaleSwitcher` composes the canonical Select
(`chrome="none"` plus the render channel) instead of its hand-built combobox.
Props, the locale data, the flag and the autoglottonym content (with its `lang`,
`dir="auto"`) are unchanged; keyboard, focus, selection, type-ahead, the panel
and its placement are Select's. The two last productive ownership rows drain.

Visible changes: the panel is Select's (portaled, minimum width 240px, Select's
row paint and check glyph) and the trigger chevron is Select's (16px, muted ink,
primary when open; the open trigger wears Select's focus ring). The trigger
value uses Select's weight 500 and, in dark, Select's value ink (D-1, kept: the
switcher now follows the tenant's Select value settings — the governed
outcome). The option text uses Select's row size (D-3: it differs where a
vertical sets the option font size apart from --ds-font-size-sm — bithire
12.34px vs 11.60px; rottay and evnto equal). An Arabic autoglottonym now sits
next to its flag at the row's inline start under LTR (D-4; the row chrome
follows the page). The private
test hooks `locale-switcher-menu` and `locale-option-<code>` are gone
(`locale-switcher-trigger` stays, on the trigger); `data-active` on a row now
means the active descendant, and the current locale is
`aria-selected`/`data-selected`. The `panel`, `check`, `trigger-label` and
`trigger-code` parts are replaced by Select's anatomy plus the pattern's
`locale-content`, `flag`, `autoglottonym` and `code`. Classic and Rustic are
unchanged.
