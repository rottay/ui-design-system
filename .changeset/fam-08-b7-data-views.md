---
"@rottay/design-system": patch
---

WO-FAM-08 B7: the virtual-list, grid-view and gallery-view family cuts. Their
inline paint becomes skin rules over runtime-computed `--ds-<family>-*` channels
with resting declarations, the hand-made grid and gallery skeletons give way to
the shared anatomy renderer over each family's own anatomy, and hover/focus state
is decided once by the anatomy kernel. The layout props of all three lose their
implicit defaults: an omitted prop leaves the channel to the theme, a stated prop
stamps the channel and outranks it. No prop TYPE changed.

```contract-diff
signature .#PatternVirtualListProps — `height` keeps its type (`number | string`, optional) and loses its implicit default (`'100%'`): omitted, the skin's resting `--ds-virtual-list-block-size` paints; stated, the value stamps the channel. Documentation of that precedence moved into the prop's JSDoc, which is what changed the declaration fingerprint
signature .#GridViewProps — `gap` keeps its type (`number | string`, optional) and loses its implicit default (the collection-card gap chain): omitted, the Grid primitive's `md` rung applies; stated, a number is exact pixels and a Grid gap preset or any other CSS length rides `--ds-grid-gap`. Documentation of that precedence moved into the prop's JSDoc, which is what changed the declaration fingerprint. `columns` and `minColumnWidth` were deprecated and ignored by WO-FAM-12 and are removed by the WO-RET-01 changeset (`ret-01-grid-gallery-ignored-props`)
signature .#GalleryViewProps — `gap` and `aspectRatio` keep their types (`number | string`, `string`, both optional) and lose their implicit defaults (16 / `'1'`): an omitted `aspectRatio` leaves the skin's resting `--ds-gallery-view-aspect-ratio` (`1`) to paint and a stated one stamps the channel; an omitted `gap` takes the Grid primitive's `md` rung, which follows the tenant rhythm rather than a literal 16px, and a stated one is exact pixels for a number or rides `--ds-grid-gap` for a Grid gap preset or any other CSS length. Documentation of that precedence moved into the props' JSDoc, which is what changed the declaration fingerprint. `columns` and `minColumnWidth` were deprecated and ignored by WO-FAM-12 and are removed by the WO-RET-01 changeset (`ret-01-grid-gallery-ignored-props`)
```
