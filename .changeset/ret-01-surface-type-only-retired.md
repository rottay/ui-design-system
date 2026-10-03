---
"@rottay/design-system": major
---

WO-RET-01 (RET-01-S1, the surface type-only policy lot). The three legacy app-policy migration shapes retire from `@rottay/design-system/contracts/surfaces`: they were type-only compatibility contracts, and the consumer census measured zero productive consumers across the package and the showroom — no DS surface config, runtime helper, or authored source imports, defines, or reads them. The canonical access contract is unchanged: `AppResolvedSurfaceAccess` / `SurfaceAccessInput` remain the only access input, and the `permissionId` migration aliases on `DetailSurfaceTab` / `SurfaceTabbedView` are not part of this lot and stay (live `capabilityId ?? permissionId ?? key` fallback consumers measured in the access runtime). Downstream apps: any app-local type-only import of the three retired names fails at compile time on upgrade; runtime, access-resolution, and visual-override behavior is unchanged.

```contract-diff
signature .#SurfacePermissionRule — removed (type-only legacy policy shape; zero productive consumers) (RET-01-S1)
signature .#SurfaceRuntimeContext — removed (type-only legacy policy shape; zero productive consumers) (RET-01-S1)
signature .#SurfacePermissionsConfig — removed (type-only legacy policy shape; zero productive consumers) (RET-01-S1)
```
