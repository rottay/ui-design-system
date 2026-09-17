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
signature .#GridViewProps — `columns`, `minColumnWidth` and `gap` keep their types (`number | 'auto'`, `number`, `number | string`, all optional) and lose their implicit defaults (`'auto'` / 280 / the collection-card gap chain): omitted, the skin's resting `--ds-grid-view-columns` / `--ds-grid-view-gap` paint at exactly those values; stated, the value stamps the channel. Documentation of that precedence moved into the props' JSDoc, which is what changed the declaration fingerprint
signature .#GalleryViewProps — `columns`, `minColumnWidth`, `gap` and `aspectRatio` keep their types (`number | 'auto'`, `number`, `number | string`, `string`, all optional) and lose their implicit defaults (`'auto'` / 200 / 16 / `'1'`): omitted, the skin's resting `--ds-gallery-view-columns` / `--ds-gallery-view-gap` / `--ds-gallery-view-aspect-ratio` paint. The resting gap is now `var(--ds-spacing-4, 16px)` rather than a literal 16px, so a denser or more spacious tenant moves it — the same ruling the kanban-board cut took for its column gap. Documentation of that precedence moved into the props' JSDoc, which is what changed the declaration fingerprint
```
