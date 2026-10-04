---
"@rottay/design-system": major
---

WO-RET-01 (RET-01-SWITCH-ALIAS). The deprecated `Switch` component and its two types, `SwitchProps` and `SwitchSize`, retire from the package root. `Toggle`, `ToggleProps` and `ToggleSize` are the one binary switch family.

`Switch` had no engine, skin or token namespace of its own. Since the family merge it was a module that rendered `Toggle` and mapped three legacy props onto it: `checkedChildren` to `checkedLabel`, `unCheckedChildren` to `uncheckedLabel`, and `onClick(checked, event)` folded into Toggle's change handler. It defaulted `size` to `md`, which is Toggle's own default. Every other `SwitchProps` member (`checked`, `defaultChecked`, `disabled`, `loading`, `size`, `onChange`, `className`, `style`, `autoFocus`, `tabIndex`, `id`, `name`, `aria-label`) is a `ToggleProps` member of the same name. A `Toggle` written with the renamed props therefore renders what the `Switch` rendered on Modern, Classic and Rustic.

Replacement:

| Before | After |
|---|---|
| `Switch` | `Toggle` |
| `SwitchProps` | `ToggleProps` |
| `SwitchSize` (`'sm' \| 'md' \| 'lg'`) | `ToggleSize` (`'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`) |
| `checkedChildren` | `checkedLabel` |
| `unCheckedChildren` | `uncheckedLabel` |
| `onClick={(checked, event) => ...}` | `onChange={(checked, event) => ...}` |

Two differences to read before migrating by hand. `Toggle`'s `onChange` receives `(checked, event)` where `SwitchProps.onChange` declared `(checked)` only; the alias already called the handler from Toggle's change event, so a one-parameter handler behaves the same. The event `Switch` passed to `onClick` was that same change event typed as a mouse event; on `Toggle` it is typed as the change event it always was. An element that stated both `onClick` and `onChange` had `onClick` called first, then `onChange`, with the same value: merge the two into one `onChange`.

Census, 2026-10-03, over `packages/core/src`, `packages/showroom/src` and the `src` roots of app-bithire, app-evnto and app-platform. `SwitchProps` and `SwitchSize` have zero imports outside the package. Inside the package the one productive site (`NotificationSurface`, the preference rows) and the test sites now render `Toggle`; the showroom's sites were migrated by hand and none remains. No application states `checkedChildren`, `unCheckedChildren` or `onClick` on a `Switch`, no application spreads props into one and none wraps it.

What an application must change:

- app-bithire: 14 `Switch` elements in 10 files, each imported from the package root. Rename the import and the tag to `Toggle`. No prop changes.
- app-evnto: 3 `Switch` elements in 1 file (`src/features/admin/settings/surface/screens/general/view/tabs/notifications/index.tsx`). Rename the import and the tag to `Toggle`. No prop changes.
- app-platform: 47 `Switch` elements in 22 files. Rename the import and the tag to `Toggle`. One site also needs a decision: `src/features/services/feature-flags/surface/screens/relations/rules/index.tsx` passes `size="small"`, a literal `SwitchSize` stopped accepting earlier in this line (`.changeset/ret-01-size-type-and-legacy-size-values.md`) and `ToggleSize` does not accept either. Write `sm` for the step Modern renders today, or `md` for what Classic and Rustic render today.

Codemod. The 3.0 map moves the three import bindings (`Switch`, `SwitchProps`, `SwitchSize`) to their successors and every reference bound to them follows, and it renames `checkedChildren`, `unCheckedChildren` and `onClick` on an element proven to be the design-system `Switch`, in the same run. It reports, and does not write, an element that states both `onClick` and `onChange`, a spread and a consumer wrapper. The four `size` entries for `Switch` (`small`, `middle`, `large`, `default`) keep working in that same run; they match the `Switch` tag, so run the codemod once over a tree that still says `Switch`: after the tag is `Toggle` a remaining Ant size literal is found by the compiler, not by the kit. Dry-run over the three applications: 33 import rewrites (10, 1 and 22 files), zero prop rewrites and one report, the `size="small"` above.

Tests. The alias suite is removed with the module: its assertions were the legacy prop mapping, the one-argument `onChange`, the `onClick` order and the ref forwarding of the alias, which is exactly what retires. The default-size suite moves to `Toggle` with its assertions unchanged, and the two field-batch suites render `Toggle` with `checkedLabel` and `uncheckedLabel` and keep their anatomy and no-inline-paint assertions.

No minor was published between the deprecation (2026-09-12) and 3.0.

```contract-diff
export .#Switch — removed; it rendered `Toggle` with three renamed props on every engine; 64 elements in 33 application files (app-bithire 14 in 10, app-evnto 3 in 1, app-platform 47 in 22); migrate to `Toggle` (RET-01-SWITCH-ALIAS)
export .#SwitchProps — removed; zero imports outside the package; `checkedChildren`, `unCheckedChildren` and `onClick` are `checkedLabel`, `uncheckedLabel` and `onChange` on `ToggleProps`; migrate to `ToggleProps` (RET-01-SWITCH-ALIAS)
export .#SwitchSize — removed; zero imports outside the package; `sm`, `md` and `lg` are members of `ToggleSize`; migrate to `ToggleSize` (RET-01-SWITCH-ALIAS)
```
