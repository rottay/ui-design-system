---
"@rottay/design-system": major
---

WO-FAM-03 (audit F-77, F-21, F-39 for this cut). The third family cut: select,
auto-complete, cascader, tree-select, mentions, transfer, date-picker,
time-picker and color-picker, each written once across its deriver, its Modern
skin, its runtime and its tests.

**Decisions reach the selection families.** Nine compiler families
(`derivation/chrome/{select,auto-complete,cascader,tree-select,mentions,transfer,date-picker,time-picker,color-picker}`)
state each family's channels as relations to the decisions, the input field
grammar and the control and overlay materials; structural constants live in
`presentation/components/<family>`. Every name the nine Modern skins read now has
a producer. In a real browser the palette seeds, status seeds, neutral
temperature, focus style, emphasis, type scale, radius scale, control height,
density, border style, elevation posture and motion dial each move the families
they reach, with a negative control. A vertical's own chrome still outranks each
relation. In rottay dark the select, auto-complete, date-picker and time-picker
error frames now paint the tenant's dark error tone instead of the neutral floor.

**One namespace per family.** Channels are named after the family folder:
`--ds-autocomplete-*` -> `--ds-auto-complete-*`, `--ds-datepicker-*` ->
`--ds-date-picker-*`, `--ds-timepicker-*` -> `--ds-time-picker-*` (the vertical
chrome emission of `chrome.controls.{autocomplete,datePicker,timePicker}` moves,
so a tenant's picker chrome now reaches the Modern pickers), and
`--ds-colorpicker-{swatch,preset}-color` -> `--ds-color-picker-{swatch,preset}-color`.
The frozen Classic and Rustic skins keep reading their own names, so the
compiled chrome keeps those names as compatibility channels
(`FROZEN_ENGINE_COMPAT_CHANNELS` in the chrome-variables kernel): whenever a
vertical authors the family channel, its value is restated under the pre-cut
name. The retained channels are:

- `--ds-autocomplete-{bg,border,border-focus,clear-color,dropdown-bg,dropdown-shadow,empty-color,error-border,option-bg-hover,warning-border}`
- `--ds-datepicker-{bg,bg-disabled,border,border-focus,clear-color,color,error-border,icon-color,panel-shadow,separator-color,shadow-focus,warning-border}`
- `--ds-timepicker-{bg,bg-disabled,border,border-focus,clear-color,color,error-border,icon-color,separator-color,shadow-focus,warning-border}`

The rottay dark Rustic AutoComplete therefore still paints `#131316`.
`--ds-datepicker-border-hover` and `--ds-timepicker-panel-shadow` are not
retained: no frozen skin reads them.

The Modern classes move to the `ds-` namespace:

- `ds-autocomplete*` -> `ds-auto-complete*` (the skin folder is `skin/auto-complete`)
- `rottay-select-option` / `rottay-select-optgroup` -> `ds-select-option` /
  `ds-select-optgroup`; the search input answers to `ds-select-shell__search-input`
- `rottay-mentions__input` and `rottay-mentions__popup` are gone
- `rottay-transfer rottay-transfer--modern` -> `ds-transfer ds-transfer--modern`
- `rottay-datepicker*` -> `ds-date-picker`, `ds-date-picker-range`, `ds-date-picker-panel`
- `rottay-timepicker*` -> `ds-time-picker`, `ds-time-picker-range`, `ds-time-picker-panel`
- `rottay-colorpicker*` -> `ds-color-picker`, `ds-color-picker-panel`

Product CSS selecting the old Modern classes or channels must be updated.

Migration:

```css
/* before */
.rottay-datepicker.rottay-datepicker--modern { --ds-datepicker-bg: #fff; }
/* after */
.ds-date-picker.ds-date-picker--modern { --ds-date-picker-bg: #fff; }
```

**One listbox law (F-21).** A shared listbox kernel over roving focus,
type-ahead and the combobox foundation decides every arrow, edge, page and
type-ahead key in Select, AutoComplete, Cascader, TreeSelect, Mentions, Transfer
and the TimePicker columns. A fresh character searches from the next option, a
growing prefix from the current one, a repeated character cycles same-initial
options, disabled options are skipped, and PageUp/PageDown move ten rows.

**One calendar (F-77).** `generateCalendarGrid` accepts `{ weekStartsOn }`; the
Modern Calendar and DatePicker build their grid, week start, weekday order, day
labels and grid keyboard from the same kernel: arrows mirror under RTL, Home and
End reach the week edges, PageUp/PageDown move a month (a year with Shift) and
disabled dates are stepped over. DatePicker day cells are named with the
localized full date (`Sunday, March 15, 2026`) instead of `2026-03-15`.

**Enter never commits an IME candidate (F-39).** AutoComplete commits through
`resolveSubmitIntent`; Mentions ignores Enter and Tab while a composition is open.

**Panels.** TimePicker, DatePicker and ColorPicker place their panels through
the field overlay kernel from the contract placement; ColorPicker honours every
placement instead of collapsing to the start edge. TreeSelect and DatePicker
render without an `I18nProvider`. The ColorPicker hex placeholder is `#RRGGBB`.

**Accessibility fixes measured by axe in a real browser.** Transfer rows no
longer claim list-item semantics inside the checkbox group; Select and Cascader
placeholders read the readable muted role.

```contract-diff
signature .#generateCalendarGrid — adds an optional fourth parameter `{ weekStartsOn?: 0|1|2|3|4|5|6 }`; without it the grid still starts on Sunday
signature .#BrandControlsChrome — the autocomplete, datePicker and timePicker chrome documents its lowering to `--ds-auto-complete-*`, `--ds-date-picker-*` and `--ds-time-picker-*`
signature .#BrandAutocompleteChrome — each field documents its `--ds-auto-complete-*` channel instead of `--ds-autocomplete-*`
signature .#BrandDatePickerChrome — each field documents its `--ds-date-picker-*` channel instead of `--ds-datepicker-*`
signature .#BrandTimePickerChrome — each field documents its `--ds-time-picker-*` channel instead of `--ds-timepicker-*`
```
