# Vertical Style Consumption Matrix

## Executive Read

The three apps do not consume their vertical layers with the same depth.

- Platform has the healthiest operational use of recipes and shell behavior, but still relies more on tokens and local styling than on direct profile/recipe governance.
- BitHire has a strong shell frame, but vertical identity/profile/navigation are barely used outside shell entrypoints.
- Evnto is the weakest on vertical consumption depth: recipes exist, but profile/navigation are mostly bypassed and a lot of layout logic is still local.

## Matrix

| Metric | Platform | BitHire | Evnto |
| --- | ---: | ---: | ---: |
| Operational files inspected | `523` | `651` ts/tsx, `335` tsx | app-layer subset + `82` dashboard routes |
| Files with `@/vertical/*` in app UI layers | `48` | `38` | `5` |
| Dominant vertical import | `useFocusMode` in `38` files | `CommandHeader` in `30+` files | route/layout + settings/dashboard configs |
| Recipe usage | real but narrow | very narrow | real but narrow |
| Profile usage downstream | `0` direct | `0` | effectively `0` |
| Navigation usage downstream | minimal | `0` | `0` |
| Hardcoded or local styling pressure | high | very high | very high |

## Platform

### What is working

- `WORKSPACE_RECIPE` is genuinely live in [entity-table-workspace](/Users/daniel/Developer/Rottay/app-platform/src/ui/tables/entity-table-workspace/index.tsx).
- `DASHBOARD_RECIPE` is real in [dashboard builder](/Users/daniel/Developer/Rottay/app-platform/src/features/security-ops/dashboard/screens/builder/index.tsx).
- `SETTINGS_RECIPE` is consumed in [settings overview](/Users/daniel/Developer/Rottay/app-platform/src/features/tenant-administration/settings/screens/overview.tsx).
- `useFocusMode` is meaningfully spread through operational UI, including [radial menu](/Users/daniel/Developer/Rottay/app-platform/src/ui/feedback/radial-menu/index.tsx) and [audit list](/Users/daniel/Developer/Rottay/app-platform/src/features/governance-risk/compliance/screens/audit-list.tsx).

### What is weak

- Direct downstream reads of `PLATFORM_PROFILE`, `SHELL_RECIPE`, or `useRouteMeta` in `src/features`, `src/ui`, and `src/components/_shared` are effectively `0`.
- Vertical logic is centralized in the shell, but most product UI still styles itself locally.
- In the operational subset:
  - vertical users: `48` files, about `9.2%`
  - token users: `225` files, about `43%`
  - hardcoded-style-like files: `234`, about `45%`

### Read

Platform is the strongest vertical implementation, but the vertical layer is governing shell behavior more than it is governing product styling.

## BitHire

### What is working

- The dashboard shell is truly vertical-owned through [layout.tsx](/Users/daniel/Developer/Rottay/app-bithire/src/app/(dashboard)/layout.tsx) and [vertical/shell](/Users/daniel/Developer/Rottay/app-bithire/src/vertical/shell).
- `useRouteMeta` is used in [main-content](/Users/daniel/Developer/Rottay/app-bithire/src/vertical/shell/main-content/index.tsx) for padding behavior.
- `WORKSPACE_RECIPE` is used in [candidates list](/Users/daniel/Developer/Rottay/app-bithire/src/features/candidates/screens/list/index.tsx).
- `SETTINGS_RECIPE` is used in [settings general](/Users/daniel/Developer/Rottay/app-bithire/src/features/settings/screens/general/index.tsx).

### What is weak

- `BITHIRE_PROFILE` is effectively dead outside its definition in [vertical/profile](/Users/daniel/Developer/Rottay/app-bithire/src/vertical/profile/index.ts).
- `BITHIRE_MANIFEST` is effectively dead outside [manifest.ts](/Users/daniel/Developer/Rottay/app-bithire/src/vertical/manifest.ts).
- `@/vertical/navigation` is unused by consumers; the shell still reads core constants directly.
- Shared UI and feature screens are overwhelmingly token-driven and inline-style-heavy rather than profile/recipe-driven.

### Counts

- In `src/components + src/features + src/ui`, only `38` files import any `@/vertical/*`.
- Breakdown:
  - `@/vertical/shell/command-header`: `30` files
  - `@/vertical/shell/form-header`: `5`
  - `@/vertical/recipes`: `2`
  - `@/vertical/profile`: `0`
  - `@/vertical/navigation`: `0`
- In the `335` visual `.tsx` files:
  - `261` import `@rottay/design-system`
  - `313` use inline `style={{}}`
  - `286` reference `var(--ds-...)`
  - `73` contain raw `rgba/hex/hsl`

### Read

BitHire has a real vertical shell, but the rest of the product mostly uses DS primitives plus manual composition. The vertical layer is present, but not yet acting as a strong styling/control grammar for the app.

## Evnto

### What is working

- `WORKSPACE_RECIPE` reaches the app indirectly through [use-list-controller](/Users/daniel/Developer/Rottay/app-evnto/src/core/hooks/use-list-controller/index.ts), influencing `11` list screens.
- `DASHBOARD_RECIPE` is consumed in [organizer config](/Users/daniel/Developer/Rottay/app-evnto/src/features/event-operations/dashboard/screens/organizer/config.ts).
- `SETTINGS_RECIPE` is consumed in both settings config factories:
  - [settings general config](/Users/daniel/Developer/Rottay/app-evnto/src/features/settings/screens/general/config.ts)
  - [intelligence-admin settings config](/Users/daniel/Developer/Rottay/app-evnto/src/features/intelligence-admin/settings/screens/general/config.ts)
- `useRouteMeta()` is read in [app/(dashboard)/layout.tsx](/Users/daniel/Developer/Rottay/app-evnto/src/app/(dashboard)/layout.tsx) to drive content padding.

### What is weak

- `EVNTO_PROFILE` is effectively dead.
- `@/vertical/navigation` is unused.
- Shell widths/heights are hardcoded in layout and shell components instead of being profile-driven.
- Route meta is overdeclared and underconsumed:
  - `16` feature route-meta constants
  - only `5` patterns registered in [vertical/routes](/Users/daniel/Developer/Rottay/app-evnto/src/vertical/routes/index.ts)
- A lot of shell/navigation logic is duplicated between `src/ui` and `src/components/_shared`.

### Counts

- Direct `@/vertical/*` imports in audited app layers: `5` files total
- Breakdown:
  - `3` in `src/features`
  - `1` in `src/core`
  - `1` in `src/app`
  - `0` in `src/ui`
  - `0` in `src/components/_shared`
- Inline-style-heavy files in `src/features`, `src/ui`, and `src/components/_shared`: `222`
- Shared-layer duplication:
  - `src/ui`: `36` files
  - `src/components/_shared`: `36` files

### Read

Evnto has real vertical ingredients, but they are not yet the primary source of truth for shell, navigation, or styling. The vertical layer is currently more “config adjacency” than “product-wide grammar.”

## Cross-App Conclusion

The repo does not have a vertical-architecture absence problem anymore.

It has a **vertical depth** problem:

- Platform: strongest
- BitHire: shell-strong, styling-weak
- Evnto: config-real, but still largely local/hardcoded in practice

If the goal is to make the vertical layer feel truly alive, the next frontier is not route boundaries. It is:

1. making profiles real runtime sources of truth
2. making recipes govern more than a few screens
3. removing duplicated shell/nav logic from `ui` / `_shared`
4. reducing manual inline style composition where DS + vertical data already exist
