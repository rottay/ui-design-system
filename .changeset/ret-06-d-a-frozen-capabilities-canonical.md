---
"@rottay/design-system": patch
---

WO-RET-06, disposition lot of the owner's dated disposition D-A (2026-10-07).
Twenty-four props, union members and physical spellings that only the frozen
Classic and Rustic engines implement stop being deprecations. They stay
published, keep their exact types, and are canonical for the engines that
implement them. No frozen engine file changes, and no behaviour changes on any
engine.

- The `@deprecated` tag is removed from each declaration; every other line of
  its comment is kept as it was.
- The 24 `compat-frozen-sole-implementer` rows leave the deprecation ledger,
  with their 4 receipts and their 23 `notice` entries in the `release-3-0`
  codemod map (the two Slider placement rows share one entry). The 4.0 removal
  those notices announced no longer applies.
- `Callout` is in scope: AM-1 v3 adds it to WO-RET-06 as row 25 of the frozen
  group, and D-A disposes all 25 rows. It is deferred to its own companion lot
  because its codemod entry has kit exemplar and standing-register companions
  outside this lot's paths; its marker, row, receipt and notice stay as they
  are until then.

The capability table, with what Modern does today with each name, is documented
in `docs/consumer-contract/frozen-engine-capabilities`. A documented replacement
is not a measured equivalence: on Modern, `CardProps.backgroundColor` is a
silent no-op and `TablePaginationConfig.size` is not read.

```contract-diff
signature .#BoxProps — `paddingRight`, `pr`, `paddingLeft`, `pl`, `marginRight`, `mr`, `marginLeft`, `ml` lose the `@deprecated` tag (D-A); types unchanged
signature .#BadgeProps — `closable` (from `BadgeBaseProps`) loses the `@deprecated` tag (D-A); type unchanged
signature .#CalendarProps — `dateCellRender` and `monthCellRender` lose the `@deprecated` tag (D-A); types unchanged
signature .#CardProps — `backgroundColor` loses the `@deprecated` tag (D-A); type unchanged
signature .#TablePaginationConfig — `size` loses the `@deprecated` tag (D-A); type unchanged
signature .#TooltipPlacement — `'left'`, `'left-start'`, `'left-end'`, `'right'`, `'right-start'`, `'right-end'` lose the `@deprecated` tag (D-A); the union is unchanged
signature .#ModalProps — `closeOnOverlayClick` loses the `@deprecated` tag (D-A); type unchanged
signature .#SliderProps — `tooltip.placement` `'left'` and `'right'` lose the `@deprecated` tag (D-A); the union is unchanged
signature .#HoverCardSide — `'left'` and `'right'` lose the `@deprecated` tag (D-A); the union is unchanged
```
