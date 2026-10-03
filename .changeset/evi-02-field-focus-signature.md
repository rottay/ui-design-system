---
"@rottay/design-system": patch
---

Text fields wear the tenant's focus signature (`states.focus-style`), as Select
and the pickers already do.

Input, Input.TextArea, PasswordInput, Textarea, InputNumber, Mentions, OTPInput,
TagInput and the Transfer search painted one fixed shape under `ring`,
`underline` and `glow`. Two different recipes were behind it:

- a 3px wash from `--ds-input-shadow-focus` (the palette family on bithire, the
  `:root` alias on rottay and evnto) or, for TagInput, from the foundation
  literal `--ds-shadow-focus-ring`;
- a fixed double ring from `runtime/personality` — `input:focus-visible` in
  `layer(rottay-personality)`, which sits above `rottay-engines` and therefore
  beat every field skin on a native `<input>`: the standalone Input, InputNumber,
  the OTP slots, the Transfer search, and the inner control of an affixed Input,
  PasswordInput and TagInput, where it drew a second ring inside the shell. It
  also set `outline: none`, so those nodes had no focus indicator at all in
  forced colors.

Now the input family owns a Modern channel, `--ds-input-focus-ring`, produced by
its chrome deriver as `var(--ds-focus-ring)`. It is a derivation of the existing
`states.focus-style` decision, not a new one: no catalog row, no authored field.
The Input, Input.TextArea and PasswordInput skins read it; Textarea, InputNumber,
Mentions, OTPInput and the Transfer search rest their own channels on it
(`var(--ds-input-focus-ring, var(--ds-focus-ring))`); TagInput's channel rests on
the signature directly.

The personality rule is split by engine. Its fixed ring now applies only to a
frozen-engine input: one under `[data-engine='classic']` or
`[data-engine='rustic']`, one inside or carrying a `-rustic` class, or an
`ant-` input. Any other raw `<input>` wears the tenant signature with a
system-colour outline in forced colors, and an input the design system stamps
(`data-part`, or a class token starting with `ds-`) is left to its own skin, so a field's inner
control paints nothing and the shell is the only indicator.

DECLARED VISUAL CHANGE, measured in Chromium on the focused shell (computed
`box-shadow`, real keyboard focus, document scope and a nested
`[data-ds-root]`; all three presets are `ring`):

| scope | shell | before | after |
| --- | --- | --- | --- |
| bithire | Input with affix, PasswordInput, Textarea, Input.TextArea, Mentions | `rgb(47 91 232 / 0.2) 0 0 0 3px` | `#fff 0 0 0 2px, rgb(47 91 232) 0 0 0 4px` |
| bithire | standalone Input, InputNumber, OTP slot, Transfer search, raw input | `#fff 0 0 0 2px, rgb(75 123 255) 0 0 0 4px` | `#fff 0 0 0 2px, rgb(47 91 232) 0 0 0 4px` |
| rottay, evnto | Input with affix, PasswordInput, Textarea, Input.TextArea, Mentions | `rgb(23 23 23 / 0.1) 0 0 0 3px` | `rgb(250 250 250) 0 0 0 2px, rgb(23 23 23) 0 0 0 4px` |
| rottay, evnto | standalone Input, InputNumber, OTP slot, Transfer search, raw input | `rgb(250 250 250) 0 0 0 2px, rgb(163 163 163) 0 0 0 4px` | `rgb(250 250 250) 0 0 0 2px, rgb(23 23 23) 0 0 0 4px` |
| every vertical | TagInput | a 3px wash of the primary | the signature above |

A tenant on `underline` gets `0 -2px 0 0 inset` in the focus colour and one on
`glow` gets the 1px ring plus halo; before, both saw the shapes in the "before"
column. The footprint grows from 3px to 4px on the washed shells.

Validation status stays on the border. A focused field in error, warning or
success keeps its status border and takes the signature in the focus colour: the
default status halos are no longer painted by the Modern skins. A theme that
AUTHORS a status ring keeps it: `chrome.controls.input.errorShadowFocus`,
`.warningShadowFocus` and `.successShadowFocus` reach Modern through three more
derived channels, `--ds-input-focus-ring-error`, `-warning` and `-success`, each
`var(--ds-input-focus-ring)` until its leaf is stated and
`var(--ds-input-<status>-shadow-focus)` once it is. The status arms of Input,
Input.TextArea and PasswordInput read them, and Textarea, Mentions, OTPInput and
InputNumber rest their own status channels on them, so an authored status ring
replaces the signature on a focused field in that status (one shadow, never
two). A focused TagInput in error now keeps its error border, which focus used
to repaint, and a rejected tag flashes the border only while focus is inside.
InputNumber's limit cue no longer replaces the indicator: while the field is
focused the signature holds and the cue is added to it.

`variant="unstyled"` (Input, PasswordInput): a standalone unstyled Input wore the
personality fixed ring and now wears the signature; an unstyled PasswordInput's
shell painted nothing (its inner control wore the fixed ring) and now wears the
signature on the shell.

Tenant precedence is kept. An authored `chrome.controls.input.shadowFocus` still
wins on Modern: the deriver then emits `--ds-input-focus-ring:
var(--ds-input-shadow-focus)`, so the authored value paints Input,
Input.TextArea, PasswordInput and every sibling that follows the input channel.
`chrome.controls.textarea.shadowFocus` and `chrome.controls.inputNumber.shadowFocus`
keep outranking their family channels, and a tenant statement of
`--ds-input-focus-ring` or `--ds-tag-input-shadow-focus` outranks the derived
value.

FROZEN ENGINES, named: unchanged. `--ds-input-shadow-focus` and the three status
halos keep their producers and their values, so Classic and Rustic keep the halo
they read through them. The personality rule keeps its fixed ring for an input
under `[data-engine='classic']` or `[data-engine='rustic']`, inside or carrying a
`-rustic` class, or carrying an `ant-` class. Measured: a Rustic Input (inner
control and shell) and a Classic `.ant-input` compute the same focus style
before and after under all three signatures. No Classic or Rustic byte changed.

Forced colors: every field shell carries one arm, `outline: max(2px,
var(--ds-focus-ring-width)) solid Highlight` at `var(--ds-focus-ring-offset)`.
InputNumber, Mentions and the Transfer search had none; TagInput's and the
InputNumber stepper's dropped to 1px under `glow`.

Consumer note: `--ds-input-shadow-focus` no longer paints a Modern field unless a
theme authors `chrome.controls.input.shadowFocus`; the theme leaf (or a tenant
statement) is the door, as it was. An application that only READS the channel
(app-bithire's global search and detail chrome) keeps receiving the halo. A raw
`<input>` an application renders itself moves from the fixed ring to the tenant
signature. A composer that wraps an unstyled Input in its own focused frame
(app-bithire's global search, app-evnto's command palette) now shows the
signature on the inner control as well as its frame.

Known and unchanged in kind, each reported rather than fixed here:

- A field inside a container that clips (`overflow` other than `visible`) with
  less than 4px of clearance loses the outer part of the `ring`; the Transfer
  search has 7px, so its ring is whole and the `glow` halo is cut at 7px.
- A frozen-engine input that carries neither a `-rustic` nor an `ant-` class
  and is rendered under a Modern root (a Rustic pattern mounted by `engine`
  prop) is indistinguishable from a raw input and takes the signature.
- The data-table inline cell editor (`[data-part='editor-input']`,
  `[data-part='editor-checkbox']`) is stamped, so the raw-input rule no longer
  paints it and it has no rule of its own in this lot: repaired by the
  data-table lot that lands with this one.
- AutoComplete and TreeSelect still paint their default status halo on a focused
  field in error or warning; their skins are outside this lot.
