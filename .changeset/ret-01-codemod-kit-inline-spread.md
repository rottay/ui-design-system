---
"@rottay/design-system": patch
---

WO-RET-01: the codemod kit stops reporting a spread it can prove does not carry
the prop, and two parity fixtures record why `variant` stays on `Badge` and
`Tag`. No public surface moves: nothing under `scripts/` or `src/` is published
(the package `files` list names `dist/`, five files under `contracts/`,
`governance/graphics/`, the third-party notices and the README), so neither the
kit nor the two new component tests ship, and no entrypoint, subpath, export,
signature or component behaviour changes.

What changes for someone running `pnpm -C packages/core codemods <dir>`:

- A JSX spread on a design-system component used to be reported as `spread`
  for every prop entry of that component, whatever it spread. A spread whose
  operand is an object literal written in place (through parentheses, `as` and
  `satisfies`) and whose every key is a static name other than the entry's
  prop is no longer reported: `<Box {...({ type: "button" } as any)}>` is not
  a use of `textAlign`. This holds for the three prop classes alike
  (`prop-renamed`, `prop-removed`, `union-member-removed`).
- Everything else about a spread is reported as before, and a spread is never
  rewritten: a literal that states the prop under any spelling of the key
  (`size: …`, `'size': …`, shorthand `{ size }`, a method or an accessor named
  `size`), a literal with a computed key or a nested spread, and any operand
  that is not a literal (an identifier, a call, a conditional, a non-null
  assertion).
- In `prop-renamed`, on an element that states the old prop, a literal spread
  that states the new name is still reported as `spread`, next to the rename:
  `<TooltipValue {...{ swatchColor: 'blue' }} color="red" />` leaves two values
  for one prop and a person decides which survives. Where the element does not
  state the old prop, a literal that states only the new name is not reported.
- No rewrite is added or removed by this change.

Measured with `--check packages/core/src packages/showroom/src`: 52 reports
become 32, 0 rewrites before and after. The 20 that leave are the `spread`
reports of `union-member-removed/.#BoxProps.left` and `.#BoxProps.right` at ten
showroom layout sites (`components/layout/{footer,header,search,sidebar}`),
each a `Box` spread of an inline literal with the keys `type` or `href`,
`target`, `rel`. The other 32 are the same finding at the same file, line and
column. The independent audit of 2026-10-04 ran the same comparison on the
application working trees: app-bithire 0 reports leave, app-evnto 2,
app-platform 30, all of the same two ids and the same reason, and the rewrite
sets are identical.

Two fixtures are added under `tests/fixtures/prop-renamed/`:
`badge-variant-secondary` and `tag-variant-secondary`. Each runs the kit with a
value map from `variant` to `tone` (`default` to `neutral`, `primary`,
`success`, `warning`, `error` to `danger`; `Badge` also `info`) and records
that `variant="secondary"` and a value that is not a string literal are
reported and left as written. They are fixtures of the kit, not entries of the
3.0 map: the 3.0 map does not rename `variant` on `Badge` or `Tag`, and the
prop is neither removed nor changed here. Two component tests,
`Badge.variant-tone-parity.test.tsx` and `Tag.variant-tone-parity.test.tsx`,
render the Modern, Classic and Rustic engines and hold the two facts the
fixtures rest on: each mapped `variant` renders the markup of its `tone`, and
no `tone` renders what `variant="secondary"` renders. `gradient` is not mapped
either. A third fixture, `union-member-removed/inline-spread`, pins the spread
rule above.
