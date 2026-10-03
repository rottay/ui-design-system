---
"@rottay/design-system": patch
---

Picker fields follow the field law the text fields already obey: a focused field
in a validation status wears the tenant's focus signature (`states.focus-style`)
and keeps its status on the border, and every focused node keeps a system-colour
outline in forced colors. Select, AutoComplete, TreeSelect, Cascader, DatePicker,
TimePicker and ColorPicker.

DECLARED VISUAL CHANGE 1 — AutoComplete and TreeSelect, focused in `error` or
`warning`. Their status rings rested on `--ds-input-error-shadow-focus` and
`--ds-input-warning-shadow-focus`, which are always defined, so the default halo
painted under every signature while Input, Textarea and the other text fields
already showed the signature. Measured in Chromium on the focused field (computed
`box-shadow`, real keyboard focus, document scope and a nested `[data-ds-root]`;
all three presets are `ring`):

| scope | status | before | after |
| --- | --- | --- | --- |
| bithire | error | `rgba(239 68 68 / 0.25) 0 0 0 2px` | `#fff 0 0 0 2px, rgb(47 91 232) 0 0 0 4px` |
| bithire | warning | `rgb(180 83 9 / 0.34) 0 0 0 3px` | `#fff 0 0 0 2px, rgb(47 91 232) 0 0 0 4px` |
| rottay, evnto | error | `rgba(239 68 68 / 0.25) 0 0 0 2px` | `rgb(250 250 250) 0 0 0 2px, rgb(23 23 23) 0 0 0 4px` |
| rottay, evnto | warning | `rgba(245 158 11 / 0.2) 0 0 0 3px` | `rgb(250 250 250) 0 0 0 2px, rgb(23 23 23) 0 0 0 4px` |

A tenant on `underline` gets `0 -2px 0 0 inset` in the focus colour and one on
`glow` the 1px ring plus halo; before, both saw the halos in the "before" column.
The status border is unchanged: the field still reads as invalid by its frame.

A theme that AUTHORS a status ring keeps it. `--ds-auto-complete-error-shadow-focus`,
`--ds-auto-complete-warning-shadow-focus`, `--ds-tree-select-error-shadow-focus`
and `--ds-tree-select-warning-shadow-focus` stay published and stay read by the
skins; only their derived value moves. Each is the field's own ring
(`var(--ds-<family>-shadow-focus, var(--ds-focus-ring))`) until
`chrome.controls.input.errorShadowFocus` or `.warningShadowFocus` is stated, at
vertical or tenant rank, and the input family's gated ring
(`var(--ds-input-focus-ring-<status>, var(--ds-focus-ring))`) once it is, so the
authored ring replaces the signature on a focused field in that status (one
shadow, never two). A theme that authors only `chrome.controls.input.shadowFocus`
does not reach these two families, in a status or out of one: their ring is their
own channel, as before. A tenant statement of any of the four channels still
outranks the derived value.

Select, Cascader, DatePicker and TimePicker needed no change here: their status
was already border-only and a focused status frame already wore the signature.

DECLARED VISUAL CHANGE 2 — forced colors. One arm on every focused node:
`outline: max(2px, var(--ds-focus-ring-width)) solid Highlight` at
`var(--ds-focus-ring-offset)`.

| node | before | after |
| --- | --- | --- |
| DatePicker and RangePicker trigger inputs | no indicator | the arm |
| TimePicker and its RangePicker trigger inputs | no indicator | the arm |
| ColorPicker hex field | no indicator | the arm |
| ColorPicker format select | no indicator (the arm lost to the engine's native `select:focus` reset) | the arm |
| DatePicker time selects (`showTime`) | no indicator | the arm |
| Select dropdown search frame, tag remove, clear | no indicator | the arm |
| Select trigger | `2px` at `2px` under every signature | the arm |
| AutoComplete, TreeSelect, Cascader, ColorPicker triggers and controls; DatePicker cells, navigation and Today; TimePicker Now | `2px` at `1px` under every signature | the arm |
| Cascader options, TimePicker column options | `2px` at `1px`, at the edge of the scrolling column that clips them (4px and 2.8px of clearance) | the arm inset by its own width, whole inside the option |

The offset now follows the signature: 2px on `ring`, 0 on `underline` and `glow`.

DECLARED VISUAL CHANGE 3 — two focused nodes that did not wear the signature:

- The DatePicker time selects had no rule of their own and showed the engine's
  native `select:focus` recipe, a 2px wash of `--ds-color-primary-100`
  (`rgb(206 221 255) 0 0 0 2px` on bithire), under every signature. They now wear
  `--ds-date-picker-shadow-focus` with the focus border, on `:focus-visible`, which
  Chromium also reports for a clicked `<select>`; the engine recipe no longer
  reaches them, nor the ColorPicker format select.
- A selected ColorPicker preset showed no focus indicator at all: its selection
  keyline replaced the ring. It now wears the signature over the keyline; the inner
  keyline and the check still say selected.

FROZEN ENGINES, named: unchanged. No Classic or Rustic file is edited, and the four
status channels are read by Modern only. Measured: Rustic and Classic renderings of
Select, AutoComplete, TreeSelect and DatePicker compute the same box-shadow,
outline, border and background on every node, focused, before and after, under all
three signatures.

Known and unchanged in kind, each reported rather than fixed here:

- A Cascader option has 3px and a TimePicker column option 1.8px of clearance
  inside its scrolling column, so the outer part of the `ring` is cut on the inline
  sides (the `underline` is whole, the `glow` keeps its 1px ring and loses the
  halo). The forced-colors outline is inset for that reason; the box-shadow is not
  restructured here.
- The range pickers mark the endpoint being edited with
  `--ds-date-picker-active-ring` / `--ds-time-picker-active-ring`, a one-width ring
  in the primary. It is an open-state mark, not a focus indicator (the focused
  input wears the signature over it), and it has no forced-colors counterpart.
- In forced colors a focused selected ColorPicker preset shows nearly the same
  system outline as an unfocused selected one: only the offset moves.
- `--ds-select-error-shadow-focus`, `-warning-` and `-success-` are produced by the
  root alias table and the Select token sheet and read by no skin of any engine.
