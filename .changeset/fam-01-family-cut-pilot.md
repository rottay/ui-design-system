---
"@rottay/design-system": major
---

WO-FAM-01 (audit F-41, F-33, F-63, F-15 for this cut). The first family cut:
button, checkbox, radio, the unified toggle and segmented, each written once
across its deriver, its Modern skin, its runtime and its tests.

**One binary switch family (D-16).** `Switch` and `Toggle` were the same
control with two contracts, two skins and two token namespaces. `Toggle` keeps
the richer contract and absorbs what only `Switch` had: a busy state that stays
a tab stop, is `aria-disabled` and commits no value; a ref forwarded to the
native switch; `tabIndex`, `aria-label`, `aria-labelledby` and
`aria-describedby`; a state label that never becomes the accessible name; and a
touch floor on both axes for a switch with no text. `Switch` survives as a
deprecated alias of `Toggle` (since 2026-09-12). The Modern skin reads only
`--ds-toggle-*`; `chrome.controls.switch` still compiles to `--ds-switch-*`,
which no Modern component reads any more.

Migration:

```tsx
// before
<Switch checked={on} onChange={setOn} checkedChildren="On" unCheckedChildren="Off" size="small" />

// after
<Toggle checked={on} onChange={(checked) => setOn(checked)} checkedLabel="On" uncheckedLabel="Off" size="sm" />
```

A busy `Toggle` is no longer `disabled`: assert `aria-disabled="true"` and
`aria-busy="true"` instead. A custom engine pack that registered a `Switch`
entry is no longer consulted; register `Toggle`.

**Decisions reach the families.** Five compiler families
(`derivation/chrome/{button,checkbox,radio,toggle,segmented}`) state each
family's channels as relations to the decisions that move them: the button's
depth on the control material and its label on the label role; checkbox, radio
and toggle fills, rings and ink on the palette decisions (lifting the literal
fills the neutral default theme pinned below every tenant); toggle and
segmented hover on `states.emphasis`; segmented geometry on the control ramp.
Every name the five Modern skins read now has a producer. A vertical's own
chrome still outranks each relation.

**One class vocabulary.** The Modern classes move to the `ds-` namespace:
`rottay-button*` -> `ds-button*`, `rottay-button-group*` -> `ds-button-group*`,
`rottay-checkbox-group*` -> `ds-checkbox-group*`, `rottay-radio-group*` ->
`ds-radio-group*`, `rottay-segmented*` -> `ds-segmented*`; `Button.Icon` no
longer carries `rottay-button-icon`. Product CSS selecting the old Modern
classes must be updated; Classic and Rustic keep theirs. The personality layer
no longer repaints `[data-engine] .ds-button`, `.ds-checkbox`, `.ds-radio`,
`.ds-toggle` or `.ds-switch`.

**Behaviour.** State is decided by the interaction kernel and stamped as
`data-state` on the checkbox, radio and toggle roots, on each `Radio.Group`
segment and on the segmented track. The selected Button posture keys on
`aria-pressed` and `aria-current` only (the `data-state~='selected'` arm could
never match). The busy accessible label of `Button` no longer carries
`data-part="accessible-label"`. The checkmark SVG of `Checkbox` has no numeric
`width`/`height`; the skin sizes it. `Radio.Group` in `buttonStyle` mode stamps
`data-color` instead of inline `--ds-rg-color-*` channels, and a status tone
selects as a tinted well with readable ink. The `COLOR_MAP` values of checkbox,
radio and toggle carry no literal fallback, and the checkbox and radio `check`
and `dot` inks are `var(--ds-color-text-on-primary)`.

**Accessibility fixes measured by axe in a real browser.** Checkbox, radio and
toggle descriptions read the muted type role; rottay's radio and toggle
descriptions (3.7:1 dark, 2.6:1 light) read the secondary ink; solid
`Radio.Group` segments on bithire dark no longer paint 13px labels below 4.5:1;
toggle error text reads the readable error ink.

```contract-diff
subpath ./primitives/switch — resolves the Toggle family module; `Switch` is its deprecated alias
signature .#Switch — a deprecated alias rendering `Toggle`; forwards its ref to the native switch and keeps `SwitchProps`
signature ./primitives/switch#Switch — the same alias on the subpath export
signature .#SwitchProps — deprecated; moves to the Toggle family contract with the same fields and types
signature .#ToggleProps — adds `tabIndex`, `aria-label`, `aria-labelledby` and `aria-describedby`
signature ./primitives/toggle#Toggle — the Modern engine forwards its ref to the native switch; a busy toggle stays focusable
signature .#Toggle — the same forwarded ref on the root export
```
