---
"@rottay/design-system": patch
---

Internal restructure: the internal `CollectionRenderDispatch` of `CollectionWorkspaceSurface` (`surfaces/presentation/pages/workspace/collection-workspace/render-dispatch`) is split into owned modules for its key and column helpers, error anatomy, cards rendering and pagination footers, and the existing path stays the dispatch entry point. `CollectionRenderDispatch` and `CollectionRenderDispatchProps` keep their declarations, and render, hook order, focus, density and locale behavior are unchanged. The published package API does not change.
