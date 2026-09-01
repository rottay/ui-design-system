# Modern Inputs Audit

Scope:

- `src/ui/primitives/inputs/**/engines/modern.tsx`
- directly adjacent token/type/utils files when they alter runtime customization

## Category Summary

Inputs are the healthiest Modern category overall.

Most shells already read `--ds-*` variables for border, surface, focus, and basic states.
The main problem is not "no tokenization"; the main problem is that many inputs stop at the
shell and then fall back to:

- hardcoded size maps
- local geometry
- Daisy utility classes
- native browser widgets
- adjacent token maps that exist but are not actually read

Also important: none of the audited Modern input engines import `useTokens`,
`useColorTokens`, `useMotionTokens`, `personality`, `chrome`, or `brandTheme`
APIs directly. Their DS integration is almost entirely raw `var(--ds-*)`.

## Per Primitive

| Primitive | Status | Main note |
| --- | --- | --- |
| `AutoComplete` | Mixed | Shell tokenized; option rows are still bare/class-driven |
| `Button` | Strong | Global vars are used well; adjacent button maps still underused |
| `Cascader` | Mixed | Shell tokenized; rows and animation remain utility-driven |
| `Checkbox` | Mixed | Core vars are good; color/radius contract is bypassed |
| `ColorPicker` | Weak | Native color input bypasses DS for the main interaction |
| `DatePicker` | Mixed | Panel vars are good; size/motion/props remain hardcoded |
| `Form` | Limited | Validation colors are tokenized; layout/type scale remain local |
| `FormField` | Limited | Text/error vars only; size/gap are local |
| `Input` | Strong | Shell/focus are solid; scalar size tokens still bypassed |
| `InputNumber` | Mixed | Shell vars are good; utility classes and sizing remain local |
| `Mentions` | Mixed | Shell vars are good; suggestion rows are still bare |
| `OTPInput` | Mixed | Border/text are good; box geometry is local |
| `PasswordInput` | Mixed | Good shell; size/layout remain local |
| `Radio` | Strong | Core vars are good; size/motion remain local |
| `Select` | Strong | Shell/popup vars are good; density metrics remain local |
| `Slider` | Weak | Core control still leans on Daisy `range-*` classes |
| `Switch` | Strong | Pure var-driven shell; dimensions/motion still local |
| `TagInput` | Mixed | Border/tag vars are good; chip geometry remains local |
| `Textarea` | Strong | Core shell is strong; scalar size/padding remain local |
| `TimePicker` | Mixed | Panel vars are good; size/motion/props remain local |
| `Toggle` | Mixed | Reads vars, but ignores adjacent toggle token maps |
| `Transfer` | Mixed | Panel vars are good; utility/button states remain hardcoded |
| `TreeSelect` | Mixed | Shell vars are good; row styling/popup search remain hybrid |
| `Upload` | Weak | Tokenized shell mixed with raw black/white/RGBA/hex overlays |

## Highest-Value Findings

### 1. Existing token maps exist, but Modern does not use them

Examples:

- `Button` size maps vs runtime shell:
  `src/ui/primitives/inputs/Button/Button.types.ts:334`
  vs `src/ui/primitives/inputs/Button/engines/modern.tsx:128`
- `Input` size maps vs runtime shell:
  `src/ui/primitives/inputs/Input/Input.types.ts:290`
  vs `src/ui/primitives/inputs/Input/engines/modern.tsx:45`
- `Select` size/density maps vs runtime shell:
  `src/ui/primitives/inputs/Select/Select.types.ts:294`
  vs `src/ui/primitives/inputs/Select/engines/modern.tsx:57`
- `Toggle` token maps are redefined locally instead of reused:
  `src/ui/primitives/inputs/Toggle/Toggle.types.ts:99`
  vs `src/ui/primitives/inputs/Toggle/engines/modern.tsx:22`

This is a major parity problem because the contracts already look customizable, but the
Modern renderer is not consistently honoring them.

### 2. Several row/popup internals are still outside the DS

Examples:

- `AutoComplete` option rows:
  `src/ui/primitives/inputs/AutoComplete/engines/modern.tsx:223`
- `Mentions` option rows:
  `src/ui/primitives/inputs/Mentions/engines/modern.tsx:270`
- `Cascader` rows and popup shell:
  `src/ui/primitives/inputs/Cascader/engines/modern.tsx:359`
  and `src/ui/primitives/inputs/Cascader/engines/modern.tsx:440`
- `TreeSelect` rows and popup/search behavior:
  `src/ui/primitives/inputs/TreeSelect/engines/modern.tsx:223`
  and `src/ui/primitives/inputs/TreeSelect/engines/modern.tsx:582`

These are visually important surfaces, but they still depend on utility classes or local values.

### 3. Native widgets still block full customization

Examples:

- `ColorPicker` native color input:
  `src/ui/primitives/inputs/ColorPicker/engines/modern.tsx:190`
- `Slider` still depends on Daisy `range-*` classes and hardcoded white handles:
  `src/ui/primitives/inputs/Slider/engines/modern.tsx:184`
  `src/ui/primitives/inputs/Slider/engines/modern.tsx:205`
  `src/ui/primitives/inputs/Slider/engines/modern.tsx:265`

If the goal is maximum per-tenant styling, these controls need more DS-owned rendering.

### 4. `Upload` still mixes DS vars with raw colors

Examples:

- Preview backdrop:
  `src/ui/primitives/inputs/Upload/engines/modern.tsx:105`
- Picture-card overlay / fallback:
  `src/ui/primitives/inputs/Upload/engines/modern.tsx:208`
- Trigger card:
  `src/ui/primitives/inputs/Upload/engines/modern.tsx:464`
- Dragger hover state:
  `src/ui/primitives/inputs/Upload/engines/modern.tsx:644`

This makes `Upload` one of the weakest inputs for true tenant styling parity.

### 5. Some prop surfaces are wider than the implemented renderer

Examples:

- `Checkbox` accepts a richer color/radius contract but Modern ignores it:
  `src/ui/primitives/inputs/Checkbox/Checkbox.types.ts:319`
  vs `src/ui/primitives/inputs/Checkbox/engines/modern.tsx:95`
- `DatePicker` / `TimePicker` expose more style/icon/popup control than Modern actually honors:
  `src/ui/primitives/inputs/DatePicker/DatePicker.types.ts:148`
  `src/ui/primitives/inputs/TimePicker/TimePicker.types.ts:81`

## Strong Coverage Worth Preserving

- `Button`, `Input`, `Select`, `Switch`, `Radio`, and `Textarea` are the best starting point for a
  "Modern token-first inputs" standard.
- `Upload/shared.ts` is mostly behavioral and does not itself block styling.
- The category is already close enough that a focused pass can produce visible gains quickly.

## Recommended Waves For Inputs

1. Adopt adjacent token maps in `Button`, `Input`, `Select`, `Toggle`, and `Checkbox`.
2. Replace Daisy/native styling in `Slider`, `Upload`, `AutoComplete`, `Mentions`, `Cascader`, `TreeSelect`, `Transfer`, and `ColorPicker`.
3. Add explicit size/motion/spacing token contracts for `DatePicker`, `TimePicker`, `PasswordInput`, `OTPInput`, `InputNumber`, `TagInput`, `Form`, and `FormField`.
4. Close prop-contract parity gaps for `Checkbox`, `DatePicker`, and `TimePicker`.
