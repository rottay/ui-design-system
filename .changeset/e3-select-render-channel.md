---
"@rottay/design-system": minor
---

E-3 (owner packet 2026-10-07, shape a): the canonical Select gains a content
render channel. `renderOption` and `renderValue` replace only the option and
selected-value CONTENT; Select keeps the option element, keyboard, focus,
selection, type-ahead, search, disabled and ARIA. `SelectOption` gains
`textValue` (the single text source for type-ahead, search, tokens and names;
rendered output is never read), `lang` and `dir` (stamped on the label text,
never on the row; `dir` defaults to `auto` when `lang` is set). `listboxLabel`
names the open listbox. Either hook renders the custom listbox. All four props
are Modern-only (`modernOnlyProps`); unset, every engine's markup is
byte-identical.

```contract-diff
signature .#SelectProps — gains renderOption?, renderValue?, listboxLabel? (E-3)
signature .#SelectOption — gains textValue?, lang?, dir? (E-3)
export .#Select — the canonical Select carries the render channel props (E-3)
export .#SelectOptionRenderState — new (E-3)
export .#SelectValueRenderState — new (E-3)
export .#SelectLabelProps — new (E-3)
export .#SelectTextDirection — new (E-3)
```
