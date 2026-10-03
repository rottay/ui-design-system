---
"@rottay/design-system": major
---

RET-01/D19 retires the unadopted app-facing `useRouterState` and
`useNotificationPreferences` hooks, their two exclusive implementation owners,
and their six exclusive public types. A bounded current-source review found
no productive imports in DS, Showroom, app-bithire, app-evnto or app-platform,
including aliased imports, namespace access, dynamic module imports and
dependent types. Supplier-contract export rosters and historical audit notes
are not productive callers. Platform's identically named notification types
come from `@rottay/notifications`, not this package.

This remains a breaking public API change for any unobserved external consumer.
Keep URL synchronization, notification preference state and persistence in the
application's own router/domain layer and pass controlled data/callbacks into
the existing DS surfaces. No replacement hook, new alias or compatibility door
is added. The notification surface's separate `NotificationPreference` contract
and controlled surface props are unchanged.

The useful `useLayoutPreference` hook and all of its types remain public and
unchanged. Command-palette's actual callback and persisted frecency consumer
remain live and verified; this packet does not retire the application-runtime
tier. These are two bounded D19 dispositions, not completion of WO-RET-01 or
disposition of other effects, spatial or app-facing capabilities. Packaging
metadata and historical contract snapshots must be attributed and regenerated
by their integrator against a cohesive build, not weakened to accept stale
artifacts.

```contract-diff
signature .#useRouterState — removed unadopted app-facing URL-state hook (RET-01-D19)
signature .#UseRouterStateOptions — removed exclusive hook options type (RET-01-D19)
signature .#UseRouterStateReturn — removed exclusive hook return type (RET-01-D19)
signature .#useNotificationPreferences — removed unadopted preference-state hook (RET-01-D19)
signature .#NotificationChannel — removed exclusive hook channel type (RET-01-D19)
signature .#NotificationCategory — removed exclusive hook category type (RET-01-D19)
signature .#UseNotificationPreferencesOptions — removed exclusive hook options type (RET-01-D19)
signature .#UseNotificationPreferencesReturn — removed exclusive hook return type (RET-01-D19)
```
