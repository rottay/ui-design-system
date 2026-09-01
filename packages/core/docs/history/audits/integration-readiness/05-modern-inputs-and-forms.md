# Modern Inputs and Forms

## Overall View

Modern inputs are good enough for MVP, but they are not yet "maximum-customizable".

Best current shells:

- `Input`
- `Select`
- `DatePicker`
- `Mentions`

Weakest current paths:

- `Slider`
- `Upload`
- `ColorPicker`
- parts of `AutoComplete`, `TreeSelect`, `Cascader`, `TimePicker`

## Inputs Scorecard

| Category | Score | Notes |
|---|---:|---|
| Tokenization depth | 6 | Strong in core shells, weaker in internals and complex inputs. |
| Prop-contract parity | 5 | Several Modern renderers still ignore part of their public surface. |
| Popup/internal state theming | 6 | Improved, but not fully canonical. |
| Native/Daisy leakage control | 4 | Still a major weakness. |
| MVP readiness | 7 | Good enough for product, not yet perfect for premium customization. |

## Strongest Inputs

### Input

Strong shell discipline, good use of DS variables, and a reasonable path for tenant styling.

File:

- `ui-design-system/packages/core/src/ui/primitives/inputs/Input/engines/modern/index.tsx`

### Select

Probably the strongest popup + trigger combination in the set.

File:

- `ui-design-system/packages/core/src/ui/primitives/inputs/Select/engines/modern/index.tsx`

### DatePicker

Among the complex inputs, this one has the richest real token impact.

File:

- `ui-design-system/packages/core/src/ui/primitives/inputs/DatePicker/engines/modern/index.tsx`

## Highest-Impact Gaps

### Contract wider than runtime

Common offenders:

- `AutoComplete`
- `DatePicker`
- `TimePicker`
- `TreeSelect`
- `Cascader`
- `ColorPicker`

These still expose props that the Modern renderer only partially honors.

### Popup and selected-state drift

Option rows, active rows, popup shells, clear buttons, and selected states are still inconsistent across:

- `AutoComplete`
- `TreeSelect`
- `Cascader`
- `Mentions`
- `Transfer`
- `DatePicker`
- `TimePicker`

### Native/Daisy ownership

Still too present in:

- `Slider`
- `Upload`
- `ColorPicker`

## Recommended Waves

### Wave I1 - Contract Honesty

Narrow or implement inert props across:

- `AutoComplete`
- `DatePicker`
- `TimePicker`
- `TreeSelect`
- `Cascader`
- `ColorPicker`
- `PasswordInput`
- `InputNumber`
- `Slider`
- `Upload`

### Wave I2 - Canonical Token Surface

Replace local size maps, local selected-state vars, and local geometry with canonical DS token contracts across:

- `Input`
- `Select`
- `PasswordInput`
- `OTPInput`
- `InputNumber`
- `TagInput`
- `Form`
- `FormField`
- `TreeSelect`
- `Cascader`
- `ColorPicker`

### Wave I3 - Popup and Internal State Closure

Unify popup row styling and state ownership.

### Wave I4 - Native/Daisy Detox

Start with:

- `Slider`
- `ColorPicker`
- `Upload`

These are the biggest blockers for "premium customization visibly changes runtime UI".
