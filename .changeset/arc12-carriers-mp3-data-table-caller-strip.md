---
"@rottay/design-system": major
---

`PatternDataTable` no longer renders a caller `data-part` on the four `Stack`
elements of its phone and toolbar anatomy. On the Classic and Rustic engines,
which forward a caller `data-part`, these elements stop rendering it:

- the phone root, `data-part="mobile-root"`;
- the table toolbar slot (rendered when `toolbar` or `filterPanel` is set),
  `data-part="toolbar-stack"`;
- the phone record container, `data-part="record-cards"` in the cards
  presentation and `data-part="record-list"` in the list presentation;
- the default card's identity column, `data-part="mobile-card-primary"`.

Each of the four sites keeps a valueless `data-part={undefined}` key in
source, in the position the caller value used to hold. It renders no attribute
on any engine, so no caller part reaches the markup. On Modern it keeps the
`Stack`'s own `data-part="root"` (stamped since
`arc12-carriers-mp2-stack-strip`) as the first attribute, because React keeps
an attribute where its key was first inserted. The Modern markup of these
elements is therefore byte-equal to before this change, attribute order
included.

Replacement: select these elements by their owner class, which each one
carries on every engine: `ds-data-table__mobile-root`,
`ds-data-table__toolbar-stack`, `ds-data-table__record-cards`,
`ds-data-table__record-list` and `ds-data-table__mobile-card-primary`. Every
other attribute, `role`, `className` and `style` is unchanged.

In the data-table-mobile skin, the seven selectors that reached these elements
by `[data-part]` are removed. In the Modern data-table skin, the one
`toolbar-stack` selector is removed. Each rule keeps its class selector and its
declarations, so it matches the same elements at the same specificity as
before. The `record-list-item` and `record-list-open` parts and their selectors
are unchanged. The four vertical CSS bundles carry the same selectors.

Break against the published 2.19.37: these elements rendered the caller
`data-part` on every engine and carried none of the classes above. The Modern
half shipped with `arc12-carriers-mp2-stack-strip`; this entry covers Classic
and Rustic. Consumer census of 2026-10-27: app-bithire
`tests/e2e/two-systems/collection-responsive.spec.ts:72` asserts that
`[data-part="mobile-root"]` has a count of 0 in table mode. That assertion now
passes on every engine without checking anything; key it on
`.ds-data-table__mobile-root` instead. app-evnto and app-platform: none.
