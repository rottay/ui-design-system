---
"@rottay/design-system": patch
---

Semantic TEXT tones read their governed ink channel instead of the saturated
semantic fill.

The three modern typography tone rules
(`foundation/tokens/css/runtime/engines/modern/skin/typography/index.css`)
painted `color: var(--ds-color-{success,warning,error})` — the FILL role, the
value a status dot, a track or a badge ground is painted with. A saturated fill
cannot clear 4.5:1 as TEXT on a near-white ground, and in a light-authored dark
vertical it cannot clear it on a near-black one either. Each rule now reads the
governed ink with the fill as its fallback:

```
color: var(--ds-color-success-ink, var(--ds-color-success));
color: var(--ds-color-warning-ink, var(--ds-color-warning));
color: var(--ds-color-error-ink,   var(--ds-color-error));
```

`--ds-color-{tone}-ink` (AUT-1) is the existing ink-over-a-tinted-well
authority: a derivation over whatever tone seeds the vertical states, mixed
toward `--ds-color-neutral-900`, which the dark block re-declares — so the
channel darkens in light mode and lightens in dark mode by construction. This
is the same rule the `primary` tone already follows on `<a>`, where the link
channel is the body-adjacent TEXT ink and the seed stays the accent. Fills are
untouched: the draft-status DOT, badge grounds, toggle tracks, checkbox and
radio marks all keep reading the fill from their own skins, so the
colour-carries-meaning cue survives at full saturation beside the label.

A scope that declares no ink channel renders byte-identical to before.

**DECLARED visual change, measured.** Through the productive door
(`documentThemeIntent -> compileThemeIntent -> emitThemeCss`) into real
Chromium, across ten production call sites x six vertical/mode scopes: 25 of
60 cells move fail -> pass, **zero** move pass -> fail. The pinned
`GuidedDraftFormSurface` `draft-status-label` node, from real server markup:

```
evnto light   success  2.82:1 -> 5.62:1
bithire dark  success  3.00:1 -> 6.26:1
rottay light  warning  2.72:1 -> 6.00:1
bithire light warning  4.29:1 -> 8.07:1
```

Both entries leave the `GuidedDraftForm` axe debt map, which closes that
family's contrast debt apart from the active pill's primary ink.

Residual, reported not smuggled: the `error` tone in **bithire dark** improves
(2.40-2.89:1 -> 3.33-4.01:1) but still fails, because `--ds-color-error` is
mode-blind in bithire — one light-mode literal in both modes — so its ink
derives from a red that was never graded for a dark ground. That is a seed
question in the bithire preset, tracked separately.
