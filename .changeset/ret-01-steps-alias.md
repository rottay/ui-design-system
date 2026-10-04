---
"@rottay/design-system": major
---

WO-RET-01 (RET-01-STEPS-ALIAS). The deprecated `Steps` component and its two types, `StepsProps` and `ProgressDotInfo`, retire from the package root. `Stepper` and `StepperProps` are the one step-progress family.

`Steps` had no engine, skin or token namespace of its own. Since the family merge it was a module that rendered `Stepper` and mapped its props onto it. Member by member:

| `StepsProps` member | On `Stepper` | Same rendering? |
|---|---|---|
| `current`, `direction`, `labelPlacement`, `percent`, `responsive`, `status`, `items`, `className`, `style`, `engine` | same name, same type | yes |
| `size` (`'sm' \| 'md'`, default `md`) | `size` (`'sm' \| 'md' \| 'lg'`, default `md`) | yes |
| `initial` | `defaultCurrent` | yes: the alias passed it as `defaultCurrent` |
| `type` (`'default' \| 'navigation' \| 'inline'`) | no such prop: delete it | yes: the alias discarded it, every value rendered the same |
| `onChange` | `clickable` and `onChange` | only with `clickable` added: the alias turned the steps into buttons whenever `onChange` was stated; `Stepper` does that for `clickable` and calls `onChange` only then |
| `progressDot` as a boolean | `progressDot` | yes |
| `progressDot={(info) => ...}` | `progressDot={(dot, info) => ...}` | yes once the function takes the default dot as its first parameter; `info` is the same object |
| `items` (required) | `items` (optional) | yes |

`ProgressDotInfo` named the `info` object. `StepperProps.progressDot` states that shape inline (`{ index: number; status: StepStatus; title: ReactNode; description: ReactNode }`), so the name has no successor: type the parameter inline where a name was used. `Stepper` also accepts what `StepsProps` did not declare and the alias forwarded anyway, such as `aria-label`.

The one difference that does not fail to compile: a `Stepper` that states `onChange` without `clickable` renders a display track and never calls the handler. Every other difference (`initial`, `type`, the Ant Design size spellings, a one-parameter render function that reads `info`) is a type error on `Stepper`.

Census, 2026-10-03, TypeScript AST over `packages/core/src`, `packages/showroom/src` and the `src` roots of app-bithire, app-evnto and app-platform. `StepsProps` and `ProgressDotInfo` have zero imports outside the package. No application states `initial`, `type`, `onChange` or `progressDot` on a `Steps`, none spreads props into one and none wraps it. Inside the package no productive module rendered `Steps`; the test sites render `Stepper`. The showroom's three sites were migrated by hand, one of them with `clickable` added beside its `onChange`, and none remains.

What an application must change:

- app-bithire: 2 `Steps` elements in 2 files. Rename the import and the tag to `Stepper`, and write `size="sm"` where the element says `size="small"`:
  - `src/features/candidates/surface/screens/record/detail/view/sections/overview-summary/index.tsx` (import at line 38, element at line 432: `size="small"`, `current`, `aria-label`, `items`).
  - `src/features/candidates/surface/screens/record/detail/view/tabs/activity/index.tsx` (import at line 18, element at line 192: `direction="vertical"`, `size="small"`, `items`).
- app-evnto: 1 `Steps` element in 1 file, `src/features/commerce/bar/surface/screens/orders/detail/index.tsx` (import at line 27, element at line 376: `items`, `current`, `status`, `size="default"`). Rename the import and the tag to `Stepper` and write `size="md"`, or delete `size`: `md` is the default.
- app-platform: 3 `Steps` elements in 3 files, each `<Steps current={...} items={...} />`. Rename the import and the tag to `Stepper`; no prop changes:
  - `src/features/identity/auth/surface/components/mfa-setup/index.tsx` (import at line 61, element at line 231).
  - `src/features/identity/profile/surface/screens/privacy/deletion/index.tsx` (import at line 77, element at line 897).
  - `src/features/identity/profile/surface/screens/security/mfa/index.tsx` (import at line 70, element at line 525).

None of the six elements needs `clickable`: none states `onChange`.

Codemod. The 3.0 map writes what carries its meaning and reports the rest. On an element proven to be the design-system `Steps` it renames `initial` to `defaultCurrent` and deletes `type`, and the two `size` entries of `.changeset/ret-01-legacy-size-acceptors.md` (`small` to `sm`, `default` to `md`) keep working in the same run. It does not rename the `Steps` import or tag and does not retype `StepsProps`: both are reported with the member mapping above, because the rename is the same rendering only with `clickable` added where `onChange` is stated and with a render-function `progressDot` given its first parameter, and the kit renames and deletes attributes but does not add one or edit a function. `ProgressDotInfo` is reported with the inline shape. A spread, a `StepsProps`-typed object and a consumer wrapper are reported. Run the codemod over a tree that still says `Steps`, then rename the reported imports and tags by hand. Dry-run over the three applications: 3 literal rewrites (app-bithire 2, app-evnto 1) and 6 reports, the six imports above.

Tests. The alias suites are removed with the module: their assertions were the mapping itself (`onChange` alone making the steps buttons, `initial` as the seed, the one-parameter render function, the discarded `type`) and the alias rendering what `Stepper` renders for `sm`, `md` and no size, which is exactly what retires. What they held about the family moves to `Stepper` with the assertions kept: the anatomy and the status of each item, the display track that stays inert without `clickable`, the seed from `defaultCurrent`, the one-argument `onChange`, the render-function `progressDot`, and the `md` default on Modern, Classic and Rustic. The navigation batch suite and the public smoke suite render `Stepper`. The retired names and the members only the alias took are refused by the compiler in the test project.

```contract-diff
export .#Steps — removed; it rendered `Stepper` with `initial` as `defaultCurrent`, `type` discarded, `clickable` implied by `onChange` and the render-function `progressDot` taking `(info)`; 6 elements in 6 application files (app-bithire 2, app-evnto 1, app-platform 3), none stating `onChange`, `initial`, `type` or `progressDot`; migrate to `Stepper` (RET-01-STEPS-ALIAS)
export .#StepsProps — removed; zero imports outside the package; `initial` is `defaultCurrent`, `type` has no successor, `onChange` needs `clickable`; migrate to `StepperProps` (RET-01-STEPS-ALIAS)
export .#ProgressDotInfo — removed; zero imports outside the package; the second parameter of `StepperProps.progressDot` states the same shape inline (RET-01-STEPS-ALIAS)
```
