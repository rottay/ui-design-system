---
"@rottay/design-system": patch
---

The evnto experience baseline is authored against the animation personality
contract instead of the open-ended `BrandMotion` interface.

`EVNTO_CANONICAL_MOTION`
(`foundation/presets/policy/experience-baselines/evnto`) is consumed in exactly
one place, as `PRODUCT_PROFILES['events.organizer'].personality.animation`, a
slot typed `AnimationPersonalityTokens`. It was nevertheless checked with
`satisfies BrandMotion`, the theme-document motion interface, which it never
travelled through. It is now checked with `satisfies AnimationPersonalityTokens`,
the contract its only reader requires. That contract has exactly the preset's
thirteen fields (`intensity`, `entrance`, `entranceDuration`, `hoverLift`,
`hoverScale`, `useSpring`, `springTension`, `springFriction`, `staggerDelay`,
`staggerMax`, `pulseSpeed`, `skeletonStyle`, `countUpEnabled`), all required, so
the check is stricter than before: `BrandMotion` declares every field optional
and would have accepted a preset that dropped one.

No value, no object identity and no emitted channel changes. Measured before
and after through the productive compile door for `rottay`, `bithire` and
`evnto` (every compiled channel, the mode blocks, the runtime half, the scoped
CSS string) and through the personality projection for all five product
profiles: the two dumps are byte-identical. No bundled preset under
`foundation/presets/**` names `BrandMotion` any more; a co-located test holds
that, the thirteen values, the reference identity with the profile and the
projected animation channels.

No public type changes shape beyond docblock text, which is why this is a patch: the preset is not
reachable from a published entrypoint, `PRODUCT_PROFILES` keeps its declared
type, and `BrandMotion` keeps every field. Only the text of its `@deprecated`
marker changes, to state the true situation: no bundled preset authors the
interface, it still types `FlatTheme.motion`, and the theme-document schema
still admits and lowers its open-ended fields. The design system's own Brand
Studio editor still authors six of them into drafts (`entrance`,
`entranceDuration`, `hoverLift`, `hoverScale`, `pulseSpeed`, `skeletonStyle`),
its file export reads `entranceDuration`, and `DEFAULT_MOTION_SHAPE` in
`themes/iso` states the whole shape. The `character` docblock now counts four
governed fields (`intensity`, `durationScale`, `ambient`, `character`), the same
number the marker states. The interface is not narrowed and the marker is not
removed by this change.

```contract-diff
signature .#BrandMotion — docblock text only: the `@deprecated` marker and the `character` member docblock are reworded; no member, type or optionality changes
```
