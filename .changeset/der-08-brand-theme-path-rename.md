---
"@rottay/design-system": major
---

WO-DER-08 — BREAKING. The capability registry's static-door member is
`themePath`, not `brandThemePath`.

WHAT MOVED. `TenantCapabilityDeclaration.brandThemePath` is renamed to
`themePath`, and the 22 rows of `TENANT_CAPABILITY_REGISTRY` are renamed with
it. Because the registry is declared `as const satisfies`, every row publishes
that member as a LITERAL type (`readonly brandThemePath: "surfaces.radiusScale"`
becomes `readonly themePath: "surfaces.radiusScale"`), so this is a change to a
published type AND to a serialized data shape — the same class as the sibling
`staticBrandThemePath` -> `staticThemePath` rename, which was the manifest half
of the same door. The values are untouched: no keypath, no channel, no
document path, no lowering read changes. `TenantCapabilityEntry`,
`TenantCapabilityId` and `ActiveTenantCapabilityId` are derived from the
registry and follow automatically.

WHY THE NAME. The member addresses a path inside the governed `Theme`, read
through the flat view; it was named after the transport, not after the thing it
addresses, and the flat shape is no longer an authoring surface (this work
order's core). The rename is the last serialized use of the old spelling in
`packages/core/src`.

WHY MAJOR. A consumer reading `control.brandThemePath` off the published
registry — or declaring its own `TenantCapabilityDeclaration` — stops
compiling. This repository's policy accumulates every public-API break of the
remediation programme in the 3.0 major (`major-canonical-tree.md`), and the
sibling changeset `der-08-studio-callback-governed-theme.md` declared this
rename as this work order's open sub-lot, to be declared by its own release.
This is that release.

MIGRATION. Rename the read; there is no behaviour to port.

```ts
// BEFORE (2.19.x)
const path = control.brandThemePath;
// AFTER
const path = control.themePath;
```

THE SUPERSEDED WINDOW, AND IT IS ONE WINDOW. The static door now declares both
spellings of both its keys on `INGRESS_ARMS['static-brand-theme']`
(`manifestIngressKey`/`supersededIngressKey` for the committed manifest,
`registryKey`/`supersededRegistryKey` for the capability row), and every reader
— `buildIngressInput`, `assertArmsMatchManifest`, and now the manifest
generator's producer read — goes through the single `readIngressKey` lookup
instead of its own `??`. A registry row still carrying `brandThemePath`
resolves identically and is reported by the producer's window warning, never
silently.

The window closes on a gate, not a date, and on the SAME trigger as the
manifest half: the test `window trigger: the superseded key is still carried by
a committed manifest` in
`scripts/check/tokens/cascade/probe/runtime/ingress/tests/superseded-ingress-key/`
fails on the first committed manifest regeneration. That failure deletes
`supersededIngressKey` and `supersededRegistryKey`, their arms in
`readIngressKey`, the cascade-normalization fallback, the producer's window
warning, and the pin tests that hold them.

```contract-diff
signature .#TenantCapabilityDeclaration — BREAKING: the member `brandThemePath` is renamed to `themePath` (same `readonly string` type, same meaning: the path inside FlatTheme, the lowering's read view of the governed `Theme`). A declaration typed on the old member no longer satisfies the interface. Migration: rename the member
export .#TENANT_CAPABILITY_REGISTRY — BREAKING: all 22 rows publish the renamed member, and because the registry is `as const satisfies` each row's literal type moves with it (`readonly brandThemePath: "surfaces.radiusScale"` -> `readonly themePath: "surfaces.radiusScale"`). No row is added, removed or revalued. The derived `TenantCapabilityEntry` / `TenantCapabilityId` / `ActiveTenantCapabilityId` follow from it and need no separate migration
```
