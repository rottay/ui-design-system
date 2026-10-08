---
"@rottay/design-system": patch
---

Internal restructure: `CollectionWorkspaceSurface` (`surfaces/presentation/pages/workspace/collection-workspace`) is split into owned modules for its row and density helpers, view resolution, preview rail, rows, compact preview, row activation, column settings, filter disclosure, overlays, toolbar utilities, premium chrome and the legacy layout. The existing path stays the entry point. `CollectionWorkspaceProps` keeps its declaration there, and `CollectionWorkspace` stays the alias of `CollectionWorkspaceSurface`. Hook order, ids, rendered output, focus, keys, density and inline-edit behavior are unchanged. The published package API does not change.
