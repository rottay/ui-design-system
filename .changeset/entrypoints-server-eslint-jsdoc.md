---
"@rottay/design-system": patch
---

Correct three statements in `./server/static-markup` and `./eslint`. The `renderResolvedStaticMarkup` module note no longer calls `./server` React-free: `./server` imports `react`, and the separate subpath keeps it free of `react-dom`. The convention `recommended` note states the real severities instead of claiming every rule is an error. The `no-direct-lucide` report now names `@rottay/design-system/icons`, the guaranteed door, instead of an `icons/*` wildcard that also covers retire-by and retired subpaths, and its note no longer describes a transition period or a Lucide-wrapping catalog. Only the report text changes at runtime: its message id, matching, exemptions and severities stay as they were, and no type or export moves. Consumers need no change.

```contract-diff
signature ./eslint#configs — documentation only: the convention `recommended` note states `no-direct-lucide` as warn and `no-layout-property-animation` as off instead of every rule as an error; types, severities and behaviour unchanged
signature ./eslint#rules — `no-direct-lucide` reports `@rottay/design-system/icons` instead of the `icons/*` wildcard, and its note drops the transition and Lucide catalog wording; message id, matching, exemptions and types unchanged
signature ./server/static-markup#renderResolvedStaticMarkup — documentation only: the module note says `./server` stays free of `react-dom` instead of calling it React-free; types, exports and behaviour unchanged
```
