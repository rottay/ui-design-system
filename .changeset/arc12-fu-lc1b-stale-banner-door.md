---
"@rottay/design-system": patch
---

`SurfaceStaleBanner` gains its owner class door: the stale banner root now also
carries `ds-stale-banner__banner` beside its `banner` part. In the
`surface-states` skin the two banner rules that reach that root by
`[data-part='banner']` now also reach it by class, as a second selector at the
same specificity; the doubled border rule doubles its class. The `[data-part]`
side stays, so every rule matches the same elements at the same specificity as
before, and the four vertical CSS bundles carry the same selectors. Rendered
markup changes only by the new class token. The surface lifecycle local-scope
integration pin now reads the banner root through the component syntax tree:
it accepts the legacy classes and this one class door, and refuses foreign,
split or overriding stamps.
