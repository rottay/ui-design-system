---
"@rottay/design-system": major
---

WO-RET-01 (RET-01-S3, the grid/gallery ignored-props lot). The four deprecated props `columns` and `minColumnWidth` of `PatternGridView` (`GridViewProps`) and `PatternGalleryView` (`GalleryViewProps`) retire from the published prop types. Both were already documented as ignored: neither presentation read them, because the root of each pattern is the Grid primitive in its auto-fit mode and the column count is decided by the card footprint channels. Nothing renders differently. The consumer census measured zero `PatternGridView` / `PatternGalleryView` JSX in the three vertical apps; the in-package readers were the collection-workspace render dispatch, which forwarded `viewModes.grid.columns` / `viewModes.grid.minCardWidth` and `viewModes.gallery.columns` / `viewModes.gallery.minThumbnailWidth` into the ignored props and no longer does, and showroom specimens. The Grid primitive's own `columns` / `minColumnWidth` props, the collection-workspace `viewModes` config fields and the cards-mode `minCardWidth` channel are out of this lot and unchanged. Downstream apps: passing `columns` or `minColumnWidth` to either pattern fails at compile time on upgrade; delete the prop, or state `minItem` for the card footprint preset or `templateColumns` for an explicit track list.

```contract-diff
signature .#GridViewProps — `columns` (`number | 'auto'`, optional) and `minColumnWidth` (`number`, optional) removed; both were deprecated and ignored by the presentation, zero behavior change; zero PatternGridView JSX across the three apps; use `minItem`, or `templateColumns` for an explicit track list (RET-01-S3)
signature .#GalleryViewProps — `columns` (`number | 'auto'`, optional) and `minColumnWidth` (`number`, optional) removed; both were deprecated and ignored by the presentation, zero behavior change; zero PatternGalleryView JSX across the three apps; use `minItem`, or `templateColumns` for an explicit track list (RET-01-S3)
```
