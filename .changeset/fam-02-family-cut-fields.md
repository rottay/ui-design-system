---
"@rottay/design-system": major
---

WO-FAM-02 (audit F-78, F-26, F-39, F-33 for this cut). The second family cut:
input, textarea, password-input, otp-input, tag-input, input-number, form-field
and form, each written once across its deriver, its Modern skin, its runtime and
its tests.

**Decisions reach the field families.** Eight compiler families
(`derivation/chrome/{input,textarea,password-input,otp-input,tag-input,input-number,form-field,form}`)
state each family's channels as relations to the decisions and to the input
field grammar a vertical authors; structural constants live in
`presentation/components/<family>`. Every name the eight Modern skins read now
has a producer. In a real browser the palette seeds, status seeds, neutral
temperature, type scale, radius scale, control height, density, border style,
spacing rhythm and motion dial each move the families they reach, with a
negative control. A vertical's own chrome still outranks each relation, so
sibling fields now wear the vertical's input surface, border, radius, depth and
transition timing (bithire's textarea, for example, now matches its input).

**One namespace per family.** Channels are named after the family folder:
`--ds-inputnumber-*` -> `--ds-input-number-*` (the vertical chrome emission of
`chrome.controls.inputNumber`, the neutral theme floors and the Rustic skin all
move; a tenant's input-number chrome now reaches the Modern InputNumber, which
never read the old names), `--ds-password-*` -> `--ds-password-input-*`,
`--ds-otp-*` -> `--ds-otp-input-*`. The Rustic InputNumber's corner radius floor
is `--ds-input-number-corner-radius`.

The Modern classes move to the `ds-` namespace: `rottay-input rottay-input--modern`
-> `ds-input-shell ds-input-shell--modern`, `rottay-input-field` ->
`ds-input-field`, `rottay-input__control` -> `ds-input-control`,
`rottay-input-addon*` -> `ds-input-addon*`, `rottay-input-group` ->
`ds-input-group`; `Input.TextArea` answers only to `ds-input-textarea` (the
`rottay-textarea*` classes are gone from the Modern compound). FormSurface
stops sharing the Form primitive's vocabulary: `ds-form`,
`ds-form--sticky-actions`, `ds-form__error-card`, `ds-form__aside-card` and
`ds-form__action-dock` -> `ds-form-surface*`. Product CSS selecting the old
Modern classes must be updated; Classic and Rustic keep theirs.

Migration:

```css
/* before */
.rottay-input.rottay-input--modern { --ds-inputnumber-bg: #fff; }
/* after */
.ds-input-shell.ds-input-shell--modern { --ds-input-number-bg: #fff; }
```

**One form runtime (F-78).** Modern and Rustic render from
`form/runtime/{state,validation}`: field registration, values, errors, touched
and validating state, submission, `validateFields`, `scrollToField` and
`useForm`. Rustic therefore gains what only Modern had: a removed item stops
failing submit, `validateFields` validates and rejects with `errorFields`,
`scrollToField` scrolls, and a changed field is marked touched (which makes the
`hasFeedback` success posture reachable). Rustic keeps its own default rule
messages. `Form.List` is one shared component (`displayName` `Form.List`).

**`FORM_DEFAULTS.layout` is `'vertical'` (D-22)**, what both engines always
rendered, and both engines read it from `FORM_DEFAULTS`.

**Form adapts.** `Form` accepts `adapt` (per-posture deltas such as
`{ phone: { layout: 'vertical' } }`) and stamps `data-posture`; the adapted
layout reaches every item. Without `adapt` nothing changes.

**Enter never commits an IME candidate (F-39).** `resolveSubmitIntent` and
`isComposingKey` are the shared kernel. `onPressEnter` of Input, PasswordInput,
InputNumber and Textarea, `Input.Search`'s `onSearch`, and TagInput's tag
creation (Enter or separator) no longer fire while a composition is open;
InputNumber also ignores stepping keys the IME consumes. Textarea's
`onPressEnter` no longer fires on Shift+Enter, which keeps inserting a new line.
OTPInput commits a composed character on `compositionend`.

**Behaviour.** State is decided by the interaction kernel on the input clear,
search and reveal actions (`useFieldAction`), the textarea root and clear
action, the password visibility toggle, the OTP slots, the TagInput container,
the InputNumber root and steppers, and the Form tooltip icon. The InputNumber
stepper no longer renders the hidden legacy glyph. The TagInput live region no
longer stamps `data-part="feedback"`. `STRENGTH_COLORS` values are theme
channels with no literal fallback. FormField's reserved message lines travel as
the `--ds-form-field-message-lines` channel.

**Accessibility fixes measured by axe in a real browser.** The Input.TextArea
and Textarea counters, InputNumber addons, TagInput and PasswordInput error
messages, FormField error ink and the Form optional badge read readable inks in
rottay dark and bithire light.

```contract-diff
subpath ./primitives/radio — its reachable source budget widens 155628 -> 157925 bytes: the behavior kernel barrel now also carries resolveSubmitIntent and useFieldAction
signature .#FormProps — adds `adapt?: Adapt<FormAdaptation>`
signature .#BrandControlsChrome — the inputNumber chrome documents its lowering to `--ds-input-number-*`
signature .#BrandInputNumberChrome — each field documents its `--ds-input-number-*` channel instead of `--ds-inputnumber-*`
signature .#STRENGTH_COLORS — values are `var(--ds-password-input-strength-*, var(--ds-color-*))` with no literal fallback
```
