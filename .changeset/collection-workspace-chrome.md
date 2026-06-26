---
"@rottay/design-system": minor
---

feat(surfaces): CollectionWorkspace gains `surfaceMode` (`"page" | "embed"`) and a `chrome` config to control which workspace regions (header, command, context, stats, insights, activeFilters, ...) render per instance. Embedded workspaces (nested inside another surface) default to minimal chrome; page workspaces render the full collection chrome. Enables consuming apps to embed collection workspaces inside record-detail sections without the full page chrome.
