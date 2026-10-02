---
"@rottay/design-system": minor
---

WO-EVI-02 (ANAT-3a). `./server` publishes `staticVerticalAnatomyAttributes(vertical)`:
the `data-anatomy-*` root attributes a first-party vertical's authored baseline
(neutral foundation + its preset) selects, computed synchronously without the
async `mountTenantTheme` path. It is the same projection the static mount
stamps, so a consumer rendering its own root reaches the anatomy the vertical's
bytes were compiled for. bithire returns `card: framed`, `table: zebra`,
`sidebar: rail`; rottay and evnto select no anatomy and return `{}`. Tenant
overrides are never read.

```contract-diff
export ./server#staticVerticalAnatomyAttributes — added
```
