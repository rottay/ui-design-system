---
"@rottay/design-system": patch
---

ListToolbar's own controls and every Segmented option keep a system-colour
focus outline in forced colors.

Both Modern skins cleared the outline on the control (`outline: none`) and
painted keyboard focus as a box-shadow only. Forced colors drops box-shadows,
and ListToolbar's rule also outranked the Button skin's forced-colors arm, so a
keyboard user saw no focus indicator at all on these nodes:

| family | nodes | forced colors before | forced colors after |
| --- | --- | --- | --- |
| ListToolbar | filter trigger, filter option, icon buttons (export, settings, more options), density option, mobile overflow item, clear-all, primary action (desktop and compact) | nothing | `max(2px, var(--ds-focus-ring-width)) solid Highlight` at `var(--ds-focus-ring-offset)` |
| Segmented | every option, standalone and inside ListToolbar (view switch, density switch, mobile overflow panel) | nothing | the same outline |

Measured in Chromium with forced colors emulated, on the real Modern
components, with `data-engine="modern"` on the document and on a nested
`[data-ds-root]`, under ring, underline and glow, after real keyboard focus:
234 of 234 readings of these nodes showed no indicator before and show exactly
one outline after, including inside the filter menu, the settings panel and
the mobile overflow panel. Under the ring signature a sliver of that outline was still cut on each side by the filter rail and by the settings panel, because the clearance was 0.25rem against a 4px ring extent: 0.25px at evnto's 15px root (3.75px) and 0.48px at bithire's 14.1px root (3.525px); under underline and glow nothing was cut. The changeset evi-02-focus-toolbar-shell derives the clearance from the signature and removes the cut.

Outside forced colors the indicator is unchanged: the same nodes wear the
tenant focus signature (`--ds-focus-ring`) under all three focus styles, in
both scopes, and a pointer click shows nothing. The focus rules now state a
transparent outline instead of `outline: none`, and the Segmented rule also
matches native `:focus-visible`, not only the stamped state.

DECLARED LAYOUT CHANGE, so the indicator is no longer cut to its box in two
scrolling hosts that clipped its sides:

- the desktop filter rail gains the inline focus clearance it already had on
  the block axis (`--ds-toolbar-rail-focus-clearance`), given back by an equal
  negative margin: no trigger or neighbour moves; the first and last trigger's
  ring, previously cut by its full 4px on the outer side, now keeps all but 0.25px of it on evnto and 0.48px on bithire;
- the density options inside the settings panel are inset by the same
  clearance on each side (300px to 292.5px wide at evnto's 15px root, 282px to 274.97px at bithire's 14.1px root).

No channel is added, removed or re-pointed. `--ds-toolbar-control-focus-ring`
and `--ds-filter-pill-focus-ring` keep precedence over the default.

NOT IN THIS RELEASE:

- The toolbar shell still wears the signature whenever focus is anywhere
  inside it (`--ds-toolbar-focus-ring`), next to the focused control's own
  indicator, pointer focus included.
- In forced colors the label of a selected Segmented option, of an active
  filter trigger and of an active density option is not legible.
- The settings panel's tab panel shows no focus indicator in forced colors and
  keeps its signature while a control inside it holds focus.
