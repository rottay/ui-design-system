---
"@rottay/design-system": major
---

WO-DER-07. `TenantThemeArtifact` carries the non-CSS half of the compile that
produced its CSS, and the provider publishes that half to the runtime instead of
waiting for the application to hand it over.

WHAT CHANGED. `TenantThemeArtifact` gains an optional `runtime` block holding the
`EngineVisualDeclaration` the same lowering produced — the personality, token
overrides and governed selections `useTokens` reads, plus the engine projection
that seeds a third-party library. `DesignSystemProvider` publishes the mounted
artifact's own half when the artifact was compiled for the engine that renders,
and the `engineVisual` prop remains for a compile that publishes no artifact.

WHY IT MOVES STORED DIGESTS. The block governs at render, so it is inside the
artifact digest for the same reason `provenance` is: an edit in transit must fail
the mount proof rather than verify and then take effect. This is a change to the
digest SOURCE, so every artifact already persisted against a tenant row is
invalidated and must be recompiled. The re-anchor is measured and attributed in
`canonical-extraction-pre-change-digests.json`; nothing any fixture document
PAINTS moved (0 / 65 / 25 delta channels before and after) and both vertical
envelope digests are unchanged.

TOKEN LAYERING. The documented order — engine → vertical → product profile →
compiled artifact — is unchanged, but the last layer is now reachable by every
mounted tenant rather than only by an application that passed `engineVisual`. A
tenant whose compile states a channel outranks the product-profile preset on it;
a channel the compile publishes empty leaves the preset standing.

MIGRATION. None at the call site. An artifact compiled before this release has no
`runtime` block and mounts exactly as it did. An application that passes
`engineVisual` beside a freshly compiled artifact may drop the prop.

```contract-diff
signature ./server#TenantThemeArtifact — gains optional `runtime: EngineVisualDeclaration`, the non-CSS half of the compile that produced `variables`/`css`. It is inside the artifact digest, so every stored artifact must be recompiled; absent on an artifact compiled before this release, which mounts unchanged
signature .#DesignSystemProviderProps — `engineVisual` is no longer the only route for the compiled runtime half: the provider publishes `visualAuthority.artifact.runtime` when the artifact was compiled for the rendering engine, and falls back to the prop otherwise. The prop's own type and refusals are unchanged
signature ./server#engineVisualOf — the projected declaration now carries only properties that are present, so it round-trips through a database row unchanged. A channel the compile leaves unset no longer erases the preset under it in `useTokens`
```
