---
"@rottay/design-system": major
---

WO-RET-01 (finding F-94, owner ruling R19 item 3). `createTenantConfig` and `useCreateTenant` leave the public tenant facade. Both were reachable from the root entrypoint through `src/index.ts` -> `infrastructure/runtime/tenant` -> `tenant/facade`, so this is a breaking removal.

There is no public replacement, and none is invented toward a private module:

- `createTenantConfig` stays as the internal implementation the tenant-preview pattern imports by relative path (`infrastructure/runtime/tenant/runtime/authoring/configuration`). The three tenant-preview engines are not edited. An application that needs a `TenantConfig` builds the object itself against the public `TenantConfig` type, or loads it through `getTenantConfig`.
- `useCreateTenant` is deleted with its module. Off the facade it had no importer left (the facade line was its only one), and an unreachable module may not stay in the package. What it did, and what goes with it: `createTenant` was a pass-through to `createTenantConfig`; `injectTenantCss` / `removeTenantCss` mounted a compiled `TenantThemeArtifact` as a `<style>` element on the client and restored the element it replaced, with per-hook ownership. That client-side mount capability is removed, not moved: no other module provides it. A draft is previewed through `TenantPreview`, which compiles and scopes the draft itself; a persisted tenant is painted by `DesignSystemProvider` from its served artifact. The module-local type `TenantCssSource` was never exported from an entrypoint.
- `TenantCreationConfig` stays public and unchanged: it is the type of `TenantPreviewProps['config']`. `TenantPreview` is unchanged.

Census (JSX/TS-aware search for both identifiers, including aliased and namespace imports of the package, over `packages/core/src`, `packages/showroom/src`, `app-bithire`, `app-evnto`, `app-platform`): zero imports of either symbol from the package in the showroom and in the three applications. Inside the package `createTenantConfig` is imported by the three tenant-preview engines and by tests, all by relative path to the owning module, none through the facade. The applications are not edited by this change and no automatic upgrade is claimed; each application's `scripts/ds-supplier-contract.snapshot.json` still lists both names and goes stale at the application's next supplier refresh.

Tests: `use-create-tenant/tests/artifact-mount-restore.test.tsx` is deleted with the hook. It guarded only the hook's own behaviour (exact verified bytes and the digest/slug/vertical attributes on the mounted element, restoration of the exact predecessor node and order on removal and on unmount, refusal of a tampered artifact before any DOM mutation, refusal of reserved identities, single-owner enforcement between two hook instances, and not overwriting an external takeover). None of that behaviour survives, so nothing is left unguarded; artifact verification and reserved-identity refusal keep their own suites at their owners. The law test `compile-door-census` is kept, moved beside the surviving authoring module, and re-pinned to the measured set: one runtime compile door (the server mount) and no client compile door, where it previously admitted two doors and exactly one client door.

```contract-diff
export .#createTenantConfig — removed from the public facade; no public replacement. The function stays internal to the package as the implementation tenant-preview imports
export .#useCreateTenant — removed with its module; no public replacement. The client-side artifact mount it provided is retired, not moved
```
