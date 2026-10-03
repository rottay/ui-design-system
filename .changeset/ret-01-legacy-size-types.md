---
"@rottay/design-system": major
---

WO-RET-01 (the Ant-style size spellings of five primitives). Two things retire together.

1. The five deprecated type aliases `LegacyAutoCompleteSize`, `LegacyCascaderSize`, `LegacyCollapseSize`, `LegacyColorPickerSize` and `LegacyTreeSelectSize` are removed from the package root. Each was a name for the literal union `'small' | 'middle' | 'large'`.
2. The `size` prop of `AutoComplete`, `Cascader`, `Collapse`, `ColorPicker` and `TreeSelect` no longer accepts `'small'`, `'middle'` or `'large'`. It is typed as the component's canonical `<Component>Size`, which is `'sm' | 'md' | 'lg'`.

Replacement: `'small'` -> `'sm'`, `'middle'` -> `'md'`, `'large'` -> `'lg'`. The three canonical steps were already accepted by all five components in every engine and render exactly what the Ant spelling rendered, so the migration is a literal rename with no visual change.

Defaults. The published `AUTOCOMPLETE_DEFAULTS.size`, `CASCADER_DEFAULTS.size`, `COLORPICKER_DEFAULTS.size`, `TREESELECT_DEFAULTS.size` and `COLLAPSE_DEFAULTS.size` change value from `'middle'` to `'md'`. The default rendering does not change: the engines resolve the step before they stamp or look anything up. New focal tests pin this for the four inputs (a render with no `size` and a render with `size="md"` stamp the same Modern `data-size` and carry the same Rustic size class as before the change; the tests were run green against the old default first), and the existing Modern Collapse contract test pins `data-size="md"` for a Collapse with no `size`.

Engines. No Classic or Rustic file changes, and none needed to: they keep resolving the prop through the kernel `toLegacySize`, and all of them type-check against the narrowed props. The Modern engines of Cascader, ColorPicker and TreeSelect are untouched and keep stamping the Ant spelling as `data-size` for their skins; that is an internal attribute, not something a consumer passes. In the Modern Collapse engine the unpublished helper `normalizeCollapseSize` loses its `'small'` and `'large'` cases, which the narrowed type made unreachable. The kernel `LegacySizeAlias`, `SizeType` and `toLegacySize` are not part of this change, and neither is the `useCollapseTokens` hook, whose own `size` option keeps its token vocabulary.

Census (2026-10-03), measured over whole JSX opening tags (multi-line and spread props included), typed `*Props` / `*_DEFAULTS` objects and `createElement` calls. The three applications (app-bithire, app-evnto, app-platform) render none of the five components and import none of the five type names. The showroom renders 37 such tags, passes `size` once (`<Collapse size="sm">`, already canonical) and spreads props into none. Inside the package no pattern, structure or surface passes `size` to any of the five (the form builder renders `ColorPicker` without one); the Ant spellings reached these components only from their own stories, unit tests and three JSDoc examples, all migrated here.

Tests. The `renders size %s` cases of the five component tests and the stories move to `sm | md | lg`. In the Modern Collapse contract test the assertions that existed only to prove the Ant spellings were accepted (`normalizeCollapseSize('small' | 'middle' | 'large')` and the three `data-size` rows for them) are removed with the acceptance; the canonical assertions stay and a `md` row is added.

Compatibility promise. The aliases were introduced on 2026-07-09 marked "retained for one release so existing values keep compiling". Only 2.19.x patch releases shipped between that marker and 3.0; no minor ever did, and no consumer exists to claim the window: nothing outside the package passes these spellings to these five components.

Migration. Replace the literal on the `size` prop of the five components (`small` -> `sm`, `middle` -> `md`, `large` -> `lg`); the 3.0 codemod rewrites string literals and reports a value that arrives through a variable, a ternary or a spread. A consumer that imported one of the five type names uses the canonical `<Component>Size`, which stays exported.

```contract-diff
signature .#AutoCompleteProps — `size` narrows from `AutoCompleteSize | 'small' | 'middle' | 'large'` to `AutoCompleteSize` (`'sm' | 'md' | 'lg'`); pass `sm`, `md` or `lg` (RET-01)
signature .#CascaderProps — `size` narrows from `CascaderSize | 'small' | 'middle' | 'large'` to `CascaderSize` (`'sm' | 'md' | 'lg'`); pass `sm`, `md` or `lg` (RET-01)
signature .#CollapseProps — `size` narrows from `CollapseSize | 'small' | 'middle' | 'large'` to `CollapseSize` (`'sm' | 'md' | 'lg'`); pass `sm`, `md` or `lg` (RET-01)
signature .#ColorPickerProps — `size` narrows from `ColorPickerSize | 'small' | 'middle' | 'large'` to `ColorPickerSize` (`'sm' | 'md' | 'lg'`); pass `sm`, `md` or `lg` (RET-01)
signature .#TreeSelectProps — `size` (on its unpublished `TreeSelectBaseProps` constituent) narrows from `TreeSelectSize | 'small' | 'middle' | 'large'` to `TreeSelectSize` (`'sm' | 'md' | 'lg'`); pass `sm`, `md` or `lg` (RET-01)
signature .#COLLAPSE_DEFAULTS — `size` changes from the literal `'middle'` to `'md'`; the default rendering is unchanged (RET-01)
signature .#AUTOCOMPLETE_DEFAULTS — `size` changes from `'middle'` to `'md'`; the default rendering is unchanged (RET-01)
signature .#CASCADER_DEFAULTS — `size` changes from `'middle'` to `'md'`; the default rendering is unchanged (RET-01)
signature .#COLORPICKER_DEFAULTS — `size` changes from `'middle'` to `'md'`; the default rendering is unchanged (RET-01)
signature .#TREESELECT_DEFAULTS — `size` changes from `'middle'` to `'md'`; the default rendering is unchanged (RET-01)
export .#LegacyAutoCompleteSize — removed; name of the literal union `'small' | 'middle' | 'large'`, zero importers across package, showroom and the three apps; use `AutoCompleteSize` (RET-01)
export .#LegacyCascaderSize — removed; name of the literal union `'small' | 'middle' | 'large'`, zero importers across package, showroom and the three apps; use `CascaderSize` (RET-01)
export .#LegacyCollapseSize — removed; name of the literal union `'small' | 'middle' | 'large'`, zero importers across package, showroom and the three apps; use `CollapseSize` (RET-01)
export .#LegacyColorPickerSize — removed; name of the literal union `'small' | 'middle' | 'large'`, zero importers across package, showroom and the three apps; use `ColorPickerSize` (RET-01)
export .#LegacyTreeSelectSize — removed; name of the literal union `'small' | 'middle' | 'large'`, zero importers across package, showroom and the three apps; use `TreeSelectSize` (RET-01)
```
