---
"@rottay/design-system": major
---

WO-RET-01 (the kernel `SizeType`, its lint rule, and the Ant-style size spellings of six more components). Three things retire together.

1. The deprecated kernel type `SizeType` (`'small' | 'middle' | 'large' | 'default'`) is removed from the package root.
2. The ESLint rule `@rottay/no-size-type-outside-classic` is removed from `@rottay/design-system/eslint`: from `rules`, from `plugin.rules` and from `configs.recommended`. The rule did one thing, restrict the import of `SizeType`, and has no subject once the type is gone.
3. The `size` prop of `Table`, `Form`, `InputNumber`, `TimePicker` (and `TimePicker.RangePicker`), `DatePicker` (and `DatePicker.RangePicker`) and the deprecated `Switch` alias no longer accepts `'small'`, `'middle'`, `'large'` or `'default'`. `TableSize`, `FormSize`, `InputNumberSize`, `TimePickerSize`, `DatePickerSize` and `SwitchSize` are `'sm' | 'md' | 'lg'`.

Replacement: `'small'` -> `'sm'`, `'middle'` -> `'md'`, `'default'` -> `'md'`, `'large'` -> `'lg'`. A consumer that imported `SizeType` uses `Size` (or the component's own `<Component>Size`).

What the rewrite renders. For `Table`, `Form`, `InputNumber`, `TimePicker` and `DatePicker` every engine resolved both spellings to the same step before it stamped or looked anything up (Modern and Rustic through the kernel `toCanonicalSize`, Classic through `toLegacySize(toCanonicalSize(size))`), so the literal rename renders the same in the three engines. `Switch` is different: it forwards `size` to `Toggle`, and only the Modern Toggle engine normalised the Ant spelling. Classic and Rustic look the raw value up in step tables keyed `xs | sm | md | lg | xl`, so every Ant spelling missed and rendered the `md` fallback. Rendered step, before -> after the rename:

| `Switch` literal | Modern | Classic | Rustic |
|---|---|---|---|
| `small` -> `sm` | sm -> sm | md -> sm | md -> sm |
| `middle` -> `md` | md -> md | md -> md | md -> md |
| `default` -> `md` | md -> md | md -> md | md -> md |
| `large` -> `lg` | lg -> lg | md -> lg (state-label font only; Ant Design has no large switch track) | md -> lg |

On Classic and Rustic the root also carries the class token `rottay-toggle--<size>`, which no stylesheet in the package selects; it follows the literal. The codemod therefore rewrites `middle` and `default` on `Switch` and only reports `small` and `large`: an application on Classic or Rustic that wants what is on screen today writes `md`, one that wants the step the old literal named writes `sm` or `lg`.

Defaults. The published `TABLE_DEFAULTS.size`, `FORM_DEFAULTS.size`, `INPUT_NUMBER_DEFAULTS.size`, `TIME_PICKER_DEFAULTS.size` and `DATE_PICKER_DEFAULTS.size` change value from `'default'` to `'md'`; their declared types (`Partial<TableProps>`, `Partial<FormProps> & { layout: FormLayout }`, `Partial<InputNumberProps>`, `Partial<TimePickerProps>`, `Partial<DatePickerProps>`) are unchanged. No engine reads `size` from those constants, and no engine file changes, so the default rendering does not change. New focal tests pin it: for each of the five, a render with no `size` and a render with `size="md"` stamp the same Modern `data-size="md"` and carry the same Rustic size class (for `Table` and `Form`, whose Rustic engines stamp no size class, the same markup); for `Switch`, on each of the three engines a render with no `size` produces the same markup as `size="md"` and a different one from `size="sm"`; that test was green against the old default with only the root class token differing. The `Switch` alias itself now defaults `size` to `md` and passes it to `Toggle` uncast (it defaulted to the Ant spelling `default`); the root class of a `Switch` with no `size` on Classic and Rustic becomes `rottay-toggle--md` (it was `rottay-toggle--default`, a token no stylesheet selects), and the rendered markup is otherwise identical on the three engines.

Engines. No Classic, Rustic or Modern engine file changes. The frozen engines type-check against the narrowed props untouched: they read `size` through the kernel helpers, whose signatures take any string. The kernel `toLegacySize` and `toCanonicalSize` stay; 11 Classic, 9 Rustic and 10 Modern engine files, the Form runtime and the Collapse token utility call them. The Modern engines keep resolving an Ant spelling that reaches them from an untyped caller.

Inside the package. One surface passed an Ant spelling: `CompareSurface` rendered its `Table` with `size={compact ? "small" : "default"}` and now passes `compact ? "sm" : "md"`. A new focal test pins the result on both sides of the change: Modern `data-size` `sm` (compact) and `md`, Classic `ant-table-small` and `ant-table-middle`.

Not in this change. `TablePaginationConfig.size` (`'default' | 'small'`) is a different member: no Modern or Rustic code reads it and the Classic engine hands the whole `pagination` object to Ant Design, which is the only implementer of that spelling, so it stays, now marked `@deprecated` with that reason. `LegacySizeAlias` stays, deprecated, now declared as the literal union instead of as an alias of `SizeType`; its members are unchanged and no `*Size` contract is widened with it any more. `Space` (`LegacySpaceSize`), `Segmented`, `Descriptions`, `List` and the deprecated `Steps` have their own size vocabularies and are not touched.

Census (2026-10-03), measured with the TypeScript parser over whole JSX opening tags (multi-line tags, spreads, member tags such as `DatePicker.RangePicker`, `createElement` calls and aliased imports included) in `packages/core/src` (frozen engines included), `packages/showroom/src` and the `src` roots of app-bithire, app-evnto and app-platform.

- `SizeType`: zero importers anywhere. Inside the package only the retired lint rule named it; no application ESLint config names the rule id.
- `TableSize`, `FormSize`, `InputNumberSize`, `TimePickerSize`, `DatePickerSize`, `SwitchSize`: zero imports outside the package.
- Showroom: 53 tags of the six components (`Form.Item` not counted), one passes `size` (`<Table size="sm">`, already canonical), none spreads props.
- Applications: 168 tags of the six components (`Form.Item` not counted), eight pass `size`, none spreads props. One is already canonical (app-bithire, `<Table size="sm">`); seven pass the literal `small`, each on an element imported from `@rottay/design-system`: app-platform `Table` at `features/compliance/audit-trail/surface/screens/audit/overview/index.tsx:716`, `features/organization/admin/surface/screens/plan-simulator/index.tsx:538` and `:555`, `features/organization/admin/surface/screens/sessions/overview/index.tsx:1199` and `features/security/authentication/surface/components/events-table/index.tsx:265`; app-platform `Switch` at `features/services/feature-flags/surface/screens/relations/rules/index.tsx:429`; app-evnto `DatePicker` at `features/commerce/purchasing/surface/components/goods-receipt-form/index.tsx:443`. They stop compiling against 3.0 until they are migrated; the applications are not edited by this change.
- Inside the package the one composer that passed an Ant spelling is `CompareSurface`, migrated here; otherwise the spellings reached the six only from their own stories and tests, also migrated here. The two Classic pattern engines that write `size="small"` on a `Table` render Ant Design's own component, not this one.

Tests. The `renders size %s` cases, the engine suites and the stories of the six components move to `sm | md | lg`; every assertion on the rendered result is unchanged. The `Switch` alias case that passed `size="small"` to prove the Ant spelling was accepted now passes `size="sm"` and keeps its `data-size="sm"` assertion. The suite of the retired lint rule is removed with the rule.

Compatibility promise. `SizeType` was marked on 2026-07-09, at 2.16.6, "retained for one release"; 2.17.0, 2.18.0 and 2.19.0 through 2.19.36 in this repository (the applications install 2.19.37 from the registry) were released after that marker. The six contracts were widened on 2026-07-18, at 2.19.34, with the Ant spellings "accepted for one release"; 2.19.35 and 2.19.36 were released after it. Both windows have elapsed. The releases are evidenced by the version-bump commits and the CHANGELOG; the repository carries no release tag past 2.8.16.

Migration. Replace the literal on the `size` prop of the six components; the 3.0 codemod rewrites string literals, including each literal branch of a ternary, and reports a value that arrives through a variable, any other expression, a spread or a consumer wrapper. On `Switch` it reports `small` and `large` instead of rewriting them, for the reason in the table above. The kit matches the component's own tag: member tags `DatePicker.RangePicker` / `TimePicker.RangePicker` are not reached by the kit and are migrated by hand (census: zero such sites). Remove `'@rottay/no-size-type-outside-classic'` from any ESLint config that names it (a config that spreads `configs.recommended` needs no change).

```contract-diff
export .#SizeType — removed; name of the literal union `'small' | 'middle' | 'large' | 'default'`, zero importers across package, showroom and the three apps; use `Size` (RET-01)
signature .#LegacySizeAlias — declared as the literal union `'small' | 'middle' | 'large' | 'default'` instead of as an alias of the removed `SizeType`; same members (RET-01)
signature .#TableSize — narrows from `'sm' | 'md' | 'lg' | 'small' | 'middle' | 'large' | 'default'` to `'sm' | 'md' | 'lg'`; pass `sm`, `md` or `lg` (RET-01)
signature .#FormSize — narrows from `'sm' | 'md' | 'lg' | 'small' | 'middle' | 'large' | 'default'` to `'sm' | 'md' | 'lg'`; pass `sm`, `md` or `lg` (RET-01)
signature .#InputNumberSize — narrows from `'sm' | 'md' | 'lg' | 'small' | 'middle' | 'large' | 'default'` to `'sm' | 'md' | 'lg'`; pass `sm`, `md` or `lg` (RET-01)
signature .#TimePickerSize — narrows from `'sm' | 'md' | 'lg' | 'small' | 'middle' | 'large' | 'default'` to `'sm' | 'md' | 'lg'`; pass `sm`, `md` or `lg` (RET-01)
signature .#DatePickerSize — narrows from `'sm' | 'md' | 'lg' | 'small' | 'middle' | 'large' | 'default'` to `'sm' | 'md' | 'lg'`; pass `sm`, `md` or `lg` (RET-01)
signature .#SwitchSize — the type of `SwitchProps.size`; narrows from `'sm' | 'md' | 'lg' | 'small' | 'middle' | 'large' | 'default'` to `'sm' | 'md' | 'lg'`; pass `sm`, `md` or `lg` (RET-01)
signature .#Switch — defaults `size` to `md` instead of the Ant spelling `default` and passes it to `Toggle` uncast; a `Switch` with no `size` renders the same `md` step on the three engines (RET-01)
signature .#TablePaginationConfig — `size` (`'default' | 'small'`) is marked `@deprecated`: only the frozen Classic engine forwards it, to Ant Design; its type is unchanged (RET-01)
signature ./eslint#rules — the `no-size-type-outside-classic` rule is removed; it restricted the import of the removed `SizeType` (RET-01)
signature ./eslint#plugin — `plugin.rules` no longer carries `no-size-type-outside-classic` (RET-01)
signature ./eslint#configs — `configs.recommended` no longer sets `@rottay/no-size-type-outside-classic` (RET-01)
```
