---
"@rottay/design-system": patch
---

ListToolbar shows one focus indicator: the focused control wears the tenant
signature and the shell around it no longer does.

The Modern skin painted `--ds-toolbar-focus-ring` on the toolbar shell
whenever anything inside it held focus (`:focus-within`). A keyboard user saw
two signatures at every stop, the control's and the shell's, and a pointer
click on a button inside the toolbar lit the shell with nothing on the
control. The shell read is retired; under focus the shell keeps its resting
shadow.

| | before | after |
| --- | --- | --- |
| keyboard stop inside the toolbar | signature on the control and on the shell | signature on the control only |
| pointer click on a toolbar button (export, primary action, view switch) | signature on the shell | nothing |
| forced colors | one `Highlight` outline on the control | unchanged |

`--ds-toolbar-focus-ring` is RETIRED with its only reader: the compiler no longer produces it and no rule reads it (changeset evi-02-toolbar-focus-ring-retired). The shell cannot take focus itself, so there is no state left for it to paint. `--ds-toolbar-focus-border` is untouched: the shell's edge still deepens to it while focus is inside, pointer focus included (a 1px edge, #e5e5e5 to #d4d4d4 on both first-party verticals); it is not the focus signature and forced colors do not show it.

The focus ring of a filter trigger in the rail and of a density option in the
settings panel is no longer cut. `--ds-toolbar-rail-focus-clearance` was a
fixed `0.25rem`, narrower than the 4px ring signature at the root sizes the
first-party verticals ship (3.525px on bithire, 3.75px on evnto), which cut
0.48px and 0.25px of the ring on each clipped side. It is now derived from the
signature geometry:

```
max(0.25rem, calc(var(--ds-focus-ring-offset) + max(2px, var(--ds-focus-ring-width))))
```

The `max(2px, …)` term is the forced-colors outline, which is never thinner
than 2px; the `0.25rem` floor keeps the gutter the underline and glow
signatures had. DECLARED LAYOUT CHANGE under the ring signature only: the
rail's padding and its equal negative margin grow from `0.25rem` to 4px, so
the rail box grows by the difference on each side (0.48px on bithire, 0.25px
on evnto) and no other node of the toolbar moves, wide or compact, ltr or rtl;
each density option narrows by twice the difference (274.97px to 274px on
bithire and 292.5px to 292px on evnto). Under underline and glow the value still resolves to `0.25rem` and
nothing moves. Under `prefers-contrast: more` the document signature is 3px + 3px for every focus style, so the clearance is 6px: the ring, cut by 2.48px (bithire) and 2.25px (evnto) before, is whole, and each density option is 270px (bithire) or 288px (evnto) wide. A tenant that states `--ds-toolbar-rail-focus-clearance` keeps
its own value.

The fallbacks of `--ds-toolbar-control-focus-ring` and `--ds-filter-pill-focus-ring` now end in
`var(--ds-focus-ring)` instead of a low-alpha literal ring, in the compiled
channel, in the skin and in the exported `FILTER_PILL_FOCUS_RING` token. The
literals were unreachable wherever the material focus rings are declared, so
no first-party render changes; a render that reaches the end of the chain now
gets the signature rather than a 3px tint. The `:root` declaration of `--ds-filter-pill-focus-ring` and the StatusFilterPills skin keep their literal tail.

NOT IN THIS RELEASE:

- The glow signature's 12px halo is still cut by the filter rail and by the
  settings panel beyond the clearance; its solid ring is whole.
- Focus that a script moves after a pointer action is still drawn as keyboard
  focus on the control that receives it: the first option when a click opens
  the filter menu, the trigger when a click picks an option, the first radio
  and the "More options" button around the compact overflow panel.
- The tab panel inside the settings panel is still cut by 2px in forced
  colors.
- The filter menu still cuts a focused option's ring on three sides (1.02px on bithire, 0.25px on evnto).
