---
"@rottay/design-system": major
---

`--ds-tooltip-focus-color` and `--ds-hover-card-focus-color` are retired.

Each channel coloured an outline on a node that is never a tab stop: the
keyboard never lands on the Tooltip bubble or the HoverCard surface. It lands
on the trigger and on the controls inside, and each of those wears its own
focus indicator. The
outline was transparent unless a tenant stated a colour, so by default it
painted nothing. The Modern skins no longer carry that rule or its
forced-colors twin, the tooltip and hover-card derivers no longer produce the
two channels, and both names leave the published hook contract. A stylesheet or
tenant statement that still sets either one has no effect. There is no
replacement: a focused control inside either overlay is styled by the focus
signature (`--ds-focus-ring`) like any other control.

The Modern Tooltip bubble and HoverCard surface no longer stamp `data-state`
(`focused`, `focus-visible`) for focus held inside them; that stamp existed
only for the retired rule. Keyboard behaviour is unchanged: where focus lands,
the interactive Tooltip's Tab bridge, focus return on Escape and close on blur.

An interactive Tooltip bubble can still take focus from a pointer press on its
padding or from a script. When it does and the keyboard is in use, it now shows
the browser's default focus outline; the retired rule hid that outline on the
script route only.

This supersedes the consumer note of the earlier overlay entry, which said both
hooks stay read and that an authored colour still outlines the bubble or the
card: it no longer does.

No typed tenant field maps to either channel (`BrandTooltipChrome` has no focus
field and HoverCard has no typed chrome). Census: zero readers and zero authors
in the package, the showroom, app-bithire, app-evnto and app-platform sources.
