---
"@rottay/design-system": minor
---

`Tabs` can name its tab list: `TabsProps` gains `'aria-label'` and
`'aria-labelledby'`. Modern only; Classic and Rustic frozen.

Before this release `TabsProps` had neither member and the Modern engine spread
nothing onto its elements, so `<Tabs aria-label="…">` type-checked (TypeScript
does not check a hyphenated JSX attribute missing from the props type) and the
value was dropped. A page holding more than one tablist, or a tablist no
visible heading introduces, could not be named.

The Modern engine now forwards both props to the `role="tablist"` element and
to nothing else: the root and the panel are untouched. An empty string is not
forwarded. When both are supplied both are emitted, and `aria-labelledby` wins
the accessible name by the platform's name computation. Tabs supplies no
default name: the name is product copy, resolved and localized by the caller.
When neither prop is passed the emitted DOM is unchanged.

Classic and Rustic are frozen (engine-freeze policy) and do not forward the
props; the docblocks state this.

```contract-diff
signature .#TabsProps — added: optional `'aria-label'?: string` and `'aria-labelledby'?: string`, forwarded by the Modern engine to the `role="tablist"` element only (root and panel untouched); both emitted when both are supplied and `aria-labelledby` wins the accessible name; Classic and Rustic are frozen and do not forward them; before this release a hyphenated attribute on `Tabs` type-checked and was dropped (WO-EVI-02 packet T, G1)
```
