---
"@rottay/design-system": major
---

WO-RET-01 (the last Ant Design size spellings on a public `size` prop, and the kernel `LegacySizeAlias`). Two things retire together.

1. The `size` prop of `Descriptions`, `List`, `Segmented`, `Space` and the deprecated `Steps` alias no longer accepts `'small'`, `'middle'`, `'large'` or `'default'`. It takes canonical steps:

| Component | `size` before | `size` after | Default (unchanged rendering) |
|---|---|---|---|
| `Descriptions` | `'default' \| 'small' \| 'middle'` | `'sm' \| 'md' \| 'lg'` | `lg` |
| `List` | `'default' \| 'small' \| 'large'` | `'sm' \| 'md' \| 'lg'` | `md` |
| `Segmented` | `'large' \| 'middle' \| 'small'` | `'sm' \| 'md' \| 'lg'` | `md` |
| `Space` | `'sm' \| 'md' \| 'lg' \| 'small' \| 'middle' \| 'large' \| number \| [number, number]` | `'sm' \| 'md' \| 'lg' \| number \| [number, number]` | `sm` |
| `Steps` | `'default' \| 'small'` | `'sm' \| 'md'` | `md` |

2. The deprecated kernel type `LegacySizeAlias` (`'small' | 'middle' | 'large' | 'default'`) is removed from the package root. It had zero importers; it stayed published only as vocabulary of the sizing gate, which no longer needs it.

Replacement, per component (not one table for all five: `Descriptions` differs):

| Old literal | `Descriptions` | `List` | `Segmented` | `Space` | `Steps` |
|---|---|---|---|---|---|
| `small` | `sm` | `sm` | `sm` | `sm` | `sm` |
| `middle` | `md` | not accepted before | `md` | `md` | not accepted before |
| `default` | `lg` | `md` | not accepted before | not accepted before | `md` |
| `large` | not accepted before | `lg` | `lg` | `lg` | not accepted before |

`Descriptions` is the one place where `default` is not `md`. It has three rendered densities and `default` is the largest of them (Ant Design's own scale: `small` < `middle` < `default`); the Modern skin already names the two smaller ones `--ds-descriptions-row-padding-sm` and `--ds-descriptions-row-padding-md`. Keeping all three reachable therefore gives `sm`, `md`, `lg` with `lg` as the default. A two-step `sm | md` contract would have left the `middle` density, which the Classic and Modern engines both paint, with no public name.

How it is done. The engines are not touched. For `Descriptions`, `List` and `Segmented` the three engines read the Ant Design spelling raw (Classic hands it to the Ant Design component, Rustic keys a style table by it, Modern stamps it on `data-size` and the Modern skin selects on that stamp). Their contracts now state two types: the public props, declared next to the component, whose `size` is the canonical step; and the props the engines implement (`DescriptionsEngineProps`, `ListEngineProps`, `SegmentedEngineProps`, not exported from the package root), whose `size` keeps the spelling the engines read. The component entry resolves the step to that spelling before an engine is chosen, so the three engines and any registered custom pack receive exactly the value they received before. `Space` needs no resolution: its Classic and Rustic engines already pass the value through the kernel `toLegacySize`, and its Modern engine and skin already read both spellings; only its public type narrows. `Steps` already mapped its size onto `Stepper`; it now passes the step through unchanged.

What the rewrite renders, before -> after:

| Literal | Modern | Classic | Rustic |
|---|---|---|---|
| `Descriptions` `small` -> `sm` | `data-size="small"` -> same | Ant Design `small` -> same | 12px font -> same |
| `Descriptions` `middle` -> `md` | `data-size="middle"` -> same | Ant Design `middle` -> same | 14px font -> same |
| `Descriptions` `default` -> `lg` | `data-size="default"` -> same | Ant Design `default` -> same | 14px font -> same |
| `List` `small` / `default` / `large` -> `sm` / `md` / `lg` | `data-size` `small` / `default` / `large` -> same | Ant Design `small` / `default` / `large` -> same | 12px / 14px / 16px font -> same |
| `Segmented` `small` / `middle` / `large` -> `sm` / `md` / `lg` | `data-size` `small` / `middle` / `large` -> same | Ant Design `small` / `middle` / `large` -> same | small / middle / large button styles -> same |
| `Space` `small` / `middle` / `large` -> `sm` / `md` / `lg` | same gap; the stamp `data-size` follows the literal (`small` -> `sm`, `middle` -> `md`, `large` -> `lg`) | Ant Design `small` / `middle` / `large` -> same | same `--ds-space-{small,middle,large}-size` gap |
| `Steps` `small` / `default` -> `sm` / `md` | `Stepper` `sm` / `md` -> same | same | same |

The one visible difference in that table is the Modern `Space` stamp: the Modern engine stamps the literal it is given, and the skin gives both spellings of a step one rule (`[data-size='small'], [data-size='sm']`), so the painted gap is the same and only the attribute value differs. A selector an application wrote against `[data-size="small"]` on a `Space` no longer matches after the literal is renamed. On the Rustic `Descriptions`, `middle` and `default` were already the same 14px step and remain so as `md` and `lg`.

Defaults. No default rendering changes. `DESCRIPTIONS_DEFAULTS.size` (`'default'`), `LIST_DEFAULTS.size` (`'default'`), `SEGMENTED_DEFAULTS.size` (`'middle'`) and `SPACE_DEFAULTS.size` (`'small'`) keep their values: the engines read them, and they are the engine spelling of the default step. `DESCRIPTIONS_DEFAULTS`, `LIST_DEFAULTS`, `SEGMENTED_DEFAULTS` and `SPACE_DEFAULTS` carry the engine spelling of their default step, so a consumer that passed any of their `.size` to the public `size` prop no longer compiles (census: zero such uses in the showroom and the three applications; the only `LIST_DEFAULTS` hit is app-platform's unrelated `USER_LIST_DEFAULTS`). A `Space` with no `size` on Modern still stamps `data-size="small"`.

Tests. One `<Component>.default-size.test.tsx` per component renders through the public component on the real Modern, Classic and Rustic engines and compares the markup with the same engine rendered directly with the spelling the step replaces: every step and the no-`size` default are identical, and the steps differ from each other wherever the engine tells them apart. The Rustic `Descriptions` and `Space` paint their step as an inline `var()` the test DOM drops, so those two are compared on the static renderer's markup. For `Space` on Modern the comparison is exact up to the stamp, and the test reads the skin to pin that both spellings share one rule; the existing browser suite `Space.causality.integration` already measures the same computed gap for `middle` and `md`. The unit suites that passed an Ant Design spelling through the public component now pass the step and assert the spelling the engine receives; suites that render an engine directly keep the engine spelling. The `Steps` alias case that passed `size="small"` passes `size="sm"` and keeps its `data-size="sm"` assertion.

Inside the package. `ListToolbar` (Modern, two controls) and `ImportExportSurface` passed `size="small"` to `Segmented` and pass `size="sm"`. `ViewModeSwitcher` and `ScopeSwitcher` render the Modern `Segmented` engine directly, not the public component, and keep the engine spelling. The two Classic pattern engines that write `size="small"` on a `Space` (`NotificationCenter`, `FileManager`) render Ant Design's own component. Showroom: one `Space` (`middle` -> `md`), one `Descriptions` (`small` -> `sm`) and two `List` (`small` -> `sm`) literals are migrated.

The sizing gate (`scripts/check/boundaries/components/sizing`). Its vocabulary is `Size | ModalSize`; the Ant Design spellings are no longer vocabulary. They survive in four named engine bindings (`DescriptionsEngineProps`, `ListEngineProps`, `SegmentedEngineProps`, `SpaceEngineProps`), each held to its exact literal set, required to exist, and required to sit behind a public `size` field that is canonical. Its drill plants a new Ant-spelled `*Props.size`, and a facade that takes the Ant spelling back, in the program the checker resolves and requires both to be named.

Census (2026-10-03), measured with the TypeScript parser over whole JSX opening tags of elements imported from `@rottay/design-system` (multi-line tags, spreads and aliased imports included) in the `src` roots of app-bithire, app-evnto and app-platform and in `packages/showroom/src`.

- `LegacySizeAlias`: zero importers anywhere.
- `DescriptionsSize`, `LegacySpaceSize`, `SpaceSize`, `DescriptionsProps`, `ListProps`, `SegmentedProps`, `SpaceProps`, `StepsProps`, `SEGMENTED_DEFAULTS`, `SPACE_DEFAULTS`, `SPACE_SIZE_MAP`: zero imports in the three applications.
- `Space`: app-platform 232 tags, 115 pass an Ant spelling: 114 string literals (`small` 28, `middle` 37, `large` 49) and one ternary of two literals (`features/identity/auth/surface/components/oauth-buttons/index.tsx:137`); 19 pass a number. app-evnto 1 tag, no `size`. app-bithire 0.
- `Descriptions`: app-platform 5 tags, one passes `small` (`features/identity/profile/surface/screens/account/details/index.tsx:242`). No application passes `middle` or `default`.
- `List`: app-platform 2 tags, none passes `size`.
- `Segmented`: three pass `large`: app-bithire `features/home/surface/screens/hiring-command/index.tsx:446`, app-evnto `features/insights/analytics/surface/screens/consumption/index.tsx:1063` and `features/insights/analytics/surface/screens/portfolio/index.tsx:546`. app-platform 1 tag, no `size`.
- `Steps`: app-bithire two pass `small` (`features/candidates/surface/screens/record/detail/view/sections/overview-summary/index.tsx:433`, `features/candidates/surface/screens/record/detail/view/tabs/activity/index.tsx:194`); app-evnto one passes `default` (`features/commerce/bar/surface/screens/orders/detail/index.tsx:380`); app-platform 3 tags, no `size`.
- None of these tags spreads props.

Those sites stop compiling against 3.0 until they are migrated; the applications are not edited by this change.

Compatibility promise. `LegacySpaceSize` was marked on 2026-07-09, at 2.16.6, "retained for one release so existing values keep compiling"; 2.17.0, 2.18.0 and 2.19.0 through 2.19.36 were released after that marker, so the window has elapsed. The type name `LegacySpaceSize` stays exported and deprecated in this change: it is the key of `SPACE_SIZE_MAP`, which the Rustic engine reads. `Steps` was deprecated on 2026-09-15 with no term. `Descriptions`, `List` and `Segmented` never carried a marker or a promise for their size spellings.

Migration. Replace the literal on the `size` prop per the replacement table; the 3.0 codemod rewrites string literals, including each literal branch of a ternary, and reports a value that arrives through a variable, any other expression, a spread or a consumer wrapper. On `Descriptions`, `default` becomes `lg`, not `md`.

```contract-diff
export .#LegacySizeAlias — removed; the literal union `'small' | 'middle' | 'large' | 'default'`, zero importers across package, showroom and the three apps; use `Size` (RET-01)
signature .#DescriptionsSize — changes from `'default' | 'small' | 'middle'` to `'sm' | 'md' | 'lg'`; `small` is `sm`, `middle` is `md`, `default` is `lg` (RET-01)
signature .#DescriptionsProps — `size` takes `DescriptionsSize` (`'sm' | 'md' | 'lg'`, default `lg`) instead of `'default' | 'small' | 'middle'`; the other members are unchanged (RET-01)
signature .#Descriptions — resolves the `size` step to the spelling the three engines read before an engine is chosen; same rendering for every step and for no `size` (RET-01)
signature .#ListProps — `size` narrows from `'default' | 'small' | 'large'` to `'sm' | 'md' | 'lg'` (default `md`); the other members are unchanged (RET-01)
signature .#List — resolves the `size` step to the spelling the three engines read before an engine is chosen; same rendering for every step and for no `size` (RET-01)
signature .#SegmentedProps — `size` narrows from `'large' | 'middle' | 'small'` to `'sm' | 'md' | 'lg'` (default `md`); the other members are unchanged (RET-01)
signature .#Segmented — resolves the `size` step to the spelling the three engines read before an engine is chosen; same rendering for every step and for no `size` (RET-01)
signature .#SEGMENTED_DEFAULTS — typed by the props the engines implement; `size` keeps the value `'middle'`, the engine spelling of the `md` step (RET-01)
signature .#DESCRIPTIONS_DEFAULTS — unchanged value `'default'`, the engine spelling of the `lg` step; no longer assignable to the public `DescriptionsProps.size` (RET-01)
signature .#LIST_DEFAULTS — unchanged value `'default'`, the engine spelling of the `md` step; no longer assignable to the public `ListProps.size` (RET-01)
signature .#SpaceProps — `size` narrows from `SpaceSize | LegacySpaceSize | number | [number, number]` to `SpaceSize | number | [number, number]`; pass `sm`, `md` or `lg` (RET-01)
signature .#Space — its props are the narrowed `SpaceProps`; the component and what it renders are unchanged (RET-01)
signature .#SPACE_DEFAULTS — typed by the props the engines implement; `size` keeps the value `'small'`, the engine spelling of the `sm` step (RET-01)
signature .#LegacySpaceSize — no longer accepted by `SpaceProps.size`; stays exported and deprecated as the key of `SPACE_SIZE_MAP` (RET-01)
signature .#StepsProps — `size` narrows from `'default' | 'small'` to `'sm' | 'md'` (default `md`) (RET-01)
signature .#Steps — passes `size` to `Stepper` unchanged instead of mapping `small` and `default`; same rendering for `sm`, `md` and no `size` (RET-01)
```
