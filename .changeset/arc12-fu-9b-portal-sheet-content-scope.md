---
"@rottay/design-system": patch
---

Fix the `CollectionWorkspaceSurface` filter sheet and preview sheet content
rule, which never painted. The Modern `Sheet` always portals, so both content
wrappers mount outside the workspace root, and their selectors required a
`.ds-surface.ds-collection-workspace` ancestor. The two selectors now use the
same own class and `[data-part]` scope as the filter dropdown content selector
in the same rule, at specificity (0,2,0). The declaration stays
`min-inline-size: 0`, so the computed `min-inline-size` of the two wrappers
changes from `auto` to `0`. Component markup, portal behaviour and every other
selector are unchanged. The four vertical CSS bundles carry the same selectors.
