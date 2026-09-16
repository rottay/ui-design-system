---
"@rottay/design-system": major
---

WO-FAM-07 batch L5: the flex, stack, box and grid cuts.

Each of the four now has its own chrome deriver and its own Modern skin under
`runtime/engines/modern/skin/<family>`. The shared
`presentation/components/skin/layout-primitives` sheet painted Modern and the two
frozen engines from one unscaled rule set; Modern's arm moved out whole, and what
stays there is scoped to `--classic`/`--rustic` by name with its declarations
unchanged, so the frozen engines keep the cascade position they always had.

**The class names do not change.** `rottay-flex`, `rottay-stack`, `rottay-box`
and `rottay-grid` stay exactly as they are: app-bithire selects them in live CSS
and in `querySelectorAll`, so a rename here would break that product silently.
The namespace migration is registered to the consumer-readiness lane.

What moved in the DOM, and what it means for a caller:

- Each family stamps `data-part` (`root`, plus `divider` on Stack and
  `grid-cell` on Grid.Item) and the skin keys on it. `Box` is the exception and
  deliberately stamps none: it is the escape hatch 75 DS components compose with,
  so a default part would land on every nested Box in the fleet.
- The shrink floors (`min-inline-size: 0`), the grid formatting context and the
  reflow transition are no longer inline: the skin owns them, keyed on the part
  and on `data-layout-motion`. A caller reading `style.minInlineSize` or
  `style.transition` off one of these roots now reads `""`.
- `Grid` accepts `adapt?: Adapt<GridAdaptation>` (`columns`, `gap`) and stamps
  the resolved `data-posture`, per WO-INV-07. It is the one layout family the
  adaptation contract declares layout-sensitive.
- Depth and corner rungs resolve from the shared ramps through
  `--ds-box-{corner,depth}-*`, so `shape.radius-scale` and
  `surfaces.elevation-posture` reach every Box.

`SHADOW_MAP` is replaced by `SHADOW_RUNGS`. The map held literal elevation
fallbacks read by exactly one frozen engine; those values move into
`engines/classic` as `CLASSIC_BOX_SHADOWS`, byte-identical (proven by rendering
the frozen engines across the whole ladder before and after: the markup is
unchanged), and the contract keeps only the closed rung domain. The frozen path
carries a written, content-pinned exception in the engine-freeze baseline.

```contract-diff
export .#SHADOW_MAP — removed; its values were one frozen engine's own depth ladder and moved to `engines/classic` as `CLASSIC_BOX_SHADOWS`
export .#SHADOW_RUNGS — added; the closed `BoxShadow` rung domain the contract keeps
export .#GridProps — changed; gains the optional `adapt?: Adapt<GridAdaptation>` posture slot
```
