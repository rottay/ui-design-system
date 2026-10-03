---
"@rottay/design-system": major
---

WO-RET-01 (RET-01-DETAIL-TAB-PERMISSION-ID). The deprecated `permissionId?: string` member retires from `DetailSurfaceTab`. A detail tab's presentation-access id is now `capabilityId ?? key`.

The marker described the member as a type-only migration alias. That was wrong: three runtime reads consumed it after `capabilityId` -- two in `filterDetailSurfaceTabs` (visibility and the disabled projection) and one in the `DetailSurface` capability registration. All three now read `capabilityId ?? key`. Nothing else moves: `SurfaceTabbedView.permissionId` is a separate member with its own reader (`filterSurfaceTabbedViews`), it stays published and deprecated, its code is untouched, and a focal test pins that a tabbed view authored with `permissionId` alone is still filtered, hidden and disabled by that id.

Census, over `packages/core/src`, `packages/showroom/src` and the `src` roots of app-bithire, app-evnto and app-platform, including multi-line JSX, spreads and typed config objects: no caller authored a `permissionId` value on a detail tab. The only site in the package was a `DetailSurface` test fixture, which now states `capabilityId` with its assertions unchanged. app-bithire's `DetailSurfaceTab` is a local type of the same name from its own detail shell, not this export. The `permissionId` values app-evnto authors are on its settings tabs, which are `SurfaceTabbedView`s and are unaffected.

Consumer note for app-evnto: its products and staff detail controllers declare a local optional `permissionId` on the tabs they pass into `DetailSurfaceConfig`, and compute access with their own `capabilityId ?? permissionId ?? key`. They still compile, because the tabs are not fresh object literals at the assignment. But a value authored there would no longer be read by the design system: the application would register the decision under `permissionId` while the surface looks it up under `key`, and under resolved access the tab would fail closed (hidden). Migrate any such value to `capabilityId`. An object literal typed `DetailSurfaceTab` that states `permissionId` fails at compile time on upgrade.

No minor was published between the deprecation (2026-07-17) and 3.0, and no consumer exists to claim a compatibility window.

```contract-diff
signature .#DetailSurfaceTab — member `permissionId?: string` removed; it was read at runtime after `capabilityId` in three places (not type-only), zero authored values on a detail tab across package, showroom and the three apps; the access id is now `capabilityId ?? key`; `SurfaceTabbedView.permissionId` is unchanged; migrate to `capabilityId` (RET-01-DETAIL-TAB-PERMISSION-ID)
```
