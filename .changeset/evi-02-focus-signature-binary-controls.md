---
"@rottay/design-system": patch
---

EVI-02. The Modern Toggle, Checkbox and Radio wear the tenant's focus signature
(`states.focus-style`: ring, underline or glow, emitted as the box-shadow
`--ds-focus-ring`) on the track, the box and the circle, instead of one solid outline alone under every focus style. Where the signature has no offset (underline, glow) the outline keeps the focus colour around the control, because the signature's inset layers alone measured 4 to 30 times fewer pixels at 3:1 than the outline they replaced.

DECLARED VISUAL CHANGE, measured in Chromium on the real Modern components with
real keyboard focus, in the document scope and in a nested `[data-ds-root]`,
bithire, evnto and rottay in both modes (12 cells). Under `ring`, the signature both shipped style presets state (the bithire candidate documents editorial-quiet and warm-humanist state underline and glow), the computed shadow equals the signature in all
12 cells and the ring measures 5.55:1 to 5.61:1 against the canvas in bithire
light, 3.28:1 in bithire dark, 17.18:1 in evnto and rottay light and 7.42:1 in
evnto and rottay dark.

| control | before | ring | underline | glow | forced colors |
| --- | --- | --- | --- | --- | --- |
| Toggle track | solid outline at the signature's offset; under underline and glow it hugged the track and merged with a checked one | double ring, same geometry as before | the solid outline kept around the control, plus a 2px line on the track's bottom edge, 1px canvas band above it | 1px ring, 1px canvas hairline inside, halo; the 1px outline lies on that ring | `max(2px, width) solid Highlight`, never closer than 2px |
| Checkbox box | same | double ring, same geometry | the solid outline kept around the control, plus a 2px line and 1px band inside the box's bottom edge | 1px ring, hairline inside the box, halo; the 1px outline lies on that ring | same outline |
| Radio circle | same | double ring, same geometry | the solid outline kept around the control, plus a 2px crescent and 1px band inside the circle's bottom edge | 1px ring, hairline, halo; the 1px outline lies on that ring | same outline |

Checked controls, the part of the indicator that is not the fill's own colour
against the fill it sits on: bithire light 5.55:1 to 5.63:1, bithire dark
3.57:1, evnto and rottay light 17.18:1, evnto and rottay dark 7.11:1 (the line; the band reads 1.04:1 against that fill and is not the visible element there).

A pointer press no longer shows an indicator. Before, a click on the control or
on its label drew the focus outline on all three families under every
signature, because the label hands focus to the input after the pointer is
released. Keyboard focus is unchanged, and a disabled control shows nothing. Focus moved by script after a pointer press shows nothing until the first key press, as on a native control.

Forced colors: Checkbox and Radio had no rule of their own and drew the outline
in the text colour at the signature's offset; Toggle drew Highlight at that
offset. Under underline and glow the offset is 0, so the outline touched a
checked control filled with Highlight. All three now draw Highlight at 2px or
more, and the shadow is dropped.

## DECLARED LIMITATION: `underline` on a small state control

The shared signature is kept as it is. Its `underline` layers are inset, so on
these controls they are drawn inside the box that also carries the state glyph:

- Checked Checkbox: the 1px canvas band crosses the foot of the tick. The band
  measures 5.55:1 against the fill in bithire light, 3.57:1 in bithire dark,
  17.18:1 in evnto and rottay light; in evnto and rottay dark the band is 1.04:1 against the fill and the line carries the indicator at 7.11:1, so the
  indicator is visible, but it touches the glyph.
- Unchecked Checkbox: a 2px line inside the box's bottom edge (5.55:1, 3.28:1,
  17.18:1, 7.42:1 in the same order). It can be read as a partial fill.
- Radio: a 2px crescent inside the circle's bottom edge, same contrasts; on a
  checked Radio the band passes under the dot.
- Checked Toggle: the band is partly covered by the thumb.
- bithire dark, unchecked Toggle: the line sits on the track and measures
  2.42:1 against it, under 3:1 (the outline around the track, kept, measures 3.28:1 against the canvas).
- bithire, unchecked standalone Checkbox: the line measures 2.86:1 (light) and 2.57:1 (dark) against the tinted fill, under 3:1; the outline around the box carries the indicator.

Neither shipped style preset states `underline`; the bithire candidate document editorial-quiet does. `ring` is not affected; under `glow` the inner hairline frames the glyph without crossing it.
Receiver: a design packet for an outward carrier on Toggle, Checkbox and Radio,
with an owner look; the bithire dark figure also belongs to the focus-colour
derivation.

Tenant hooks, none removed:

| hook | before | after |
| --- | --- | --- |
| `--ds-toggle-focus-ring-width`, `--ds-checkbox-focus-ring-width`, `--ds-radio-focus-ring-width` | outline width | width of the transparent outline, and of the system-colour outline in forced colors |
| `--ds-toggle-focus-ring-offset`, `--ds-checkbox-focus-ring-offset`, `--ds-radio-focus-ring-offset` | outline offset | the same, with a 2px floor in forced colors |
| `--ds-toggle-focus-ring-color`, `--ds-checkbox-focus-ring-color`, `--ds-radio-focus-ring-color` | outline colour, always painted | the outline colour wherever the signature has no offset (underline, glow); under ring, painted as a solid outline on the signature's own band only when the tenant states a value different from `--ds-focus-ring-color`; in browsers without container style queries it is not painted |

Not changed: the segmented `RadioGroup` options keep their solid outline, and
`--ds-toggle-focus-ring`, `--ds-checkbox-focus-ring` and `--ds-radio-focus-ring`
are still not read by the Modern skins (their root value is the legacy 3px
tint, not the signature).
