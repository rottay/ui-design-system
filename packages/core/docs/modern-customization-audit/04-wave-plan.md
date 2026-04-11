# Modern Customization Wave Plan

Goal: make the Modern engine genuinely "maximum customizable" from contract to rendered UI.

This plan is intentionally scoped to Modern first. It should not broaden to Classic or Rustic
until Modern has parity between declared customization and real runtime impact.

## Wave M1 - Foundation Tokenization

### Goal

Remove the biggest theming bypass at the primitive base layer.

### Focus

- `layout/Box`
- `layout/Stack`
- `layout/Grid`
- `layout/Container`
- `layout/Divider`
- any shared helper maps that currently hardcode rem/radius/shadow scales

### Acceptance

- Spacing, radius, and shadow decisions come from DS tokens or CSS variables, not fixed local maps.
- A tenant-level override for spacing/radius/shadow changes rendered output in at least one real Modern layout primitive.

## Wave M2 - Bridge Reconnect

### Goal

Eliminate "bridge exists but renderer never emits it".

### Focus

- `display/Calendar`
- `display/Descriptions`
- `display/List`
- `display/Empty`
- `display/Image`
- `display/QRCode`
- `display/Tree`
- `layout/Collapse`
- `tokens/css/engines/modern/theme.css`

### Acceptance

- Every kept bridge selector in `modern/theme.css` has at least one real Modern primitive emitter.
- Every audited Modern primitive either emits the bridge on purpose or stops pretending that bridge exists.

## Wave M3 - Scalar Contract Parity

### Goal

Make scalar size/layout paths use the same token contracts as responsive paths.

### Focus

- `display/Badge`
- `display/Typography`
- `display/Image`
- `display/Kbd`
- `inputs/Button`
- `inputs/Input`
- `inputs/Select`
- `inputs/Toggle`
- `inputs/Checkbox`
- `feedback/Spinner`

### Acceptance

- Scalar sizing and geometry read the same token maps as the responsive/tokenized path.
- Adjacent token/type files are no longer "documentation only" for Modern.

## Wave M4 - Input Internals Hardening

### Goal

Move high-traffic input internals off native/default-heavy styling.

### Focus

- `inputs/Slider`
- `inputs/Upload`
- `inputs/AutoComplete`
- `inputs/Mentions`
- `inputs/Cascader`
- `inputs/TreeSelect`
- `inputs/Transfer`
- `inputs/ColorPicker`
- `inputs/DatePicker`
- `inputs/TimePicker`
- `inputs/Form`
- `inputs/FormField`

### Acceptance

- Option rows, dragger cards, handles, popup shells, and focus states are DS-driven.
- Native/Daisy defaults no longer own the key interaction visuals for these primitives.

## Wave M5 - Navigation / Feedback / Overlay Parity

### Goal

Bring default-heavy Modern primitives onto real DS customization paths.

### Focus

- `navigation/Link`
- `navigation/Breadcrumb`
- `navigation/Stepper`
- `navigation/Steps`
- `navigation/ActionDock`
- `navigation/BottomTabBar`
- `navigation/MobileHeader`
- `feedback/Progress`
- `feedback/Skeleton`
- `feedback/Spinner`
- `overlay/AlertDialog`
- `overlay/Watermark`

### Acceptance

- Declared props/token maps for these primitives affect rendered output.
- At least one chrome/personality-aware path exists in each family where the contract implies it should.

## Wave M6 - Runtime Model Completion

### Goal

Wire the new DB-safe customization model into the actual runtime.

### Focus

- `contracts/themes`
- `contracts/tenants`
- `runtime/bootstrap/DesignSystemProvider`
- `hooks/tokens`
- `compilers/brand-theme`
- any runtime normalization layer needed for `appearance.general` / `appearance.advanced`

### Acceptance

- `appearance.general` and `appearance.advanced` are no longer declaration-only.
- The runtime merge chain becomes:

```text
DS base
  -> vertical baseline
    -> Vertical Theme / BrandTheme
      -> Tenant Appearance General
        -> Tenant Appearance Advanced
          -> runtime safety normalization
            -> modern/theme.css + primitive renderers
```

## Wave M7 - Regression Harness

### Goal

Prove customization with tests, not docs.

### Focus

- add representative override tests for one primitive per family
- add a small audit script or invariant test suite if needed

### Acceptance

- A token override test exists for:
  - one foundation primitive
  - one display primitive
  - one input primitive
  - one navigation primitive
  - one feedback primitive
  - one overlay primitive
- Tests fail when a declared token/prop stops affecting rendered output.

## Recommended Order

1. `M1`
2. `M2`
3. `M3`
4. `M4`
5. `M5`
6. `M6`
7. `M7`

Reason:

- `M1` and `M2` fix structural blockers that otherwise keep breaking higher-level work.
- `M3` and `M4` produce the fastest visible customization gains.
- `M5` closes the remaining user-facing bypasses.
- `M6` only makes sense once the Modern renderer can actually honor the richer model.
- `M7` prevents the repo from drifting back.
