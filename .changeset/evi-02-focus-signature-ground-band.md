---
"@rottay/design-system": patch
---

EVI-02. The `underline` and `glow` focus signatures were invisible on a control
filled with the focus colour: on the primary Button the indicator measured 1.00:1
against its host in bithire (light), evnto and rottay (light), and 1.09:1 in
bithire dark. Both signatures now carry the canvas colour the `ring` signature
already uses for its gap, as a 1px layer inside the control. The change is in the
states derivation only; every reader of `--ds-focus-ring` inherits it and no
component rule changed.

What a tenant on `states.focus-style: underline` gets: the 2px line in the focus
colour is unchanged, and a 1px band in `--ds-color-bg-primary` now sits directly
above it.

```
inset 0 calc(-1 * var(--ds-focus-ring-width)) 0 0 var(--ds-focus-ring-color),
inset 0 calc(-1 * var(--ds-focus-ring-width) - 1px) 0 0 var(--ds-color-bg-primary)
```

What a tenant on `states.focus-style: glow` gets: the 1px ring and the halo are
unchanged, and a 1px hairline in `--ds-color-bg-primary` now sits just inside the
ring. The hairline is a literal 1px, so `prefers-contrast: more` widens the ring
and not the hairline. This is a functional repair; the inner-hairline look is
provisional and the owner may adjust it.

```
0 0 0 var(--ds-focus-ring-width) var(--ds-focus-ring-color),
inset 0 0 0 1px var(--ds-color-bg-primary),
0 0 12px 2px color-mix(in srgb, var(--ds-focus-ring-color) 45%, transparent)
```

Primary Button, contrast of the new ground layer against the Button fill and
against the indicator beside it (real Modern component, document root and a
nested `[data-ds-root]`, identical in both):

| vertical, mode | underline before (line vs fill) | underline after (band vs fill / band vs line) | glow before (ring vs fill) | glow after (hairline vs fill) |
| --- | --- | --- | --- | --- |
| bithire light | 1.00, no pixel changed | 5.55 / 5.55 | 1.00 | 5.55 |
| bithire dark | 1.09, no pixel changed at 3:1 | 3.57 / 3.28 | 1.09 | 3.57 |
| evnto, rottay light | 1.00, no pixel changed | 17.18 / 17.18 | 1.10 | 17.18 |
| evnto, rottay dark | 7.11, already visible | line 7.42 vs band (band 1.1 vs fill, not the visible element here; the line itself reads 7.11) | 7.85, already visible | unchanged (ring 7.85) |

The same repair reaches the danger and success Buttons, the filled Tag and the
calendar event chip.

What does not change:

- `ring`: its text, width and offset are untouched.
- Width and offset of `underline` (2px, 0px) and `glow` (1px, 0px), the channel
  names, the catalog row and the tenant decision. No token value moved and no
  colour was added: the second operand is the one `ring` already reads.
- Controls whose fill is the canvas: outlined Button, Input and Card in light
  themes show no pixel changed at 1.1:1 or more.
- Forced colours: the shadow is dropped and the system-colour outline stands in,
  pixel-identical to before.
- Pointer focus shows no indicator, as before.
- An authored `--ds-focus-ring` still replaces the whole signature.

What does change beyond the repaired controls, and should be expected:

- On a tinted or raised host the ground layer is a faint 1px strip: the focused
  data-table row (1.14 to 1.48:1), Card and kanban card on a dark surface (1.22
  to 1.28:1 under `underline`, up to 2.04:1 under `glow`). Under `glow` the
  kanban card also shows it at its corners in light themes (1.61 to 2.24:1 on
  about 130 device pixels).
- Under `glow`, a link wrapped on several lines shows the hairline of one line
  cutting the halo of the next (up to 2.45:1 inside the link boxes).
- evnto and rottay light, danger Button under `underline`: the line was already
  visible (4.76:1) and now reads as a 3px two-tone stripe (3.61:1 against the
  fill).

Not repaired by this change, because these do not read the signature's shadow or
lose it to another rule. Each has its own receiver:

- Tabs, selected tab of the card, pills, segmented and contained variants: no
  focus indicator under any signature (Tabs skin, in repair).
- Horizontal Menu: ring and glow are clipped by the menu root and the selected
  item's ink bar coincides with the underline (Menu skin, in repair).
- Toggle, Checkbox and Radio draw a solid outline at the signature's offset; under
  `underline` and `glow` it merges with a checked control (their skins).
- bithire dark: the focus colour measures 3.28:1 on the canvas and 2.63:1 on
  `#182235` surfaces, so `underline` stays under 3:1 on Card, table row and the
  selected Segmented item (focus-colour derivation).
- A nested root in the opposite mode to its document resolves the document's
  focus colour and canvas in evnto and rottay (tenant-scope emission).
- `prefers-contrast: more` reaches the document root only; a nested root keeps
  2px.

The ring -> glow axis measurement has not been re-run after this change; it is
owed before WO-EVI-02 closes.
