---
"@rottay/design-system": major
---

WO-FAM-04. The fourth family cut: modal, drawer, sheet, alert-dialog,
confirm-dialog, popover, dropdown, hover-card, tooltip and tour; one Notifier
for toast, notification and message (D-17); and Alert with Callout folded in.
Each family is written once across its deriver, its Modern skin, its runtime
and its tests.

**Decisions reach the overlay and feedback families.** Twelve compiler families
(`derivation/chrome/{modal,drawer,sheet,alert-dialog,confirm-dialog,popover,dropdown,hover-card,tooltip,tour,notifier,alert}`)
state each family's channels as relations to the palette, the materials, the
elevation scale, the typographic roles, the focus and press decisions and the
tint ramps; structural constants live in `presentation/components/<family>`.
Every name the twelve Modern skins read has a producer, and each read names its
root. In a real browser the palette and status seeds, focus style, emphasis,
type scale, radius scale, density, border style, elevation posture and motion
dial each move the families they reach, with a negative control. A vertical's
own chrome still outranks each relation.

Paint that moves for first-party tenants: the Modern tooltip tone bubbles read
the tenant palette (rottay dark: the error bubble is the dark error seed and its
ink the dark on-primary instead of foundation red and white); the Modern modal
radius stays on `--ds-modal-radius` (the default theme's `--ds-radius-xl`);
tour, notifier and alert surfaces paint from the overlay material and the tint
ramps. The Modern theme's dead `[data-engine='modern'] .loading` rule is removed.

**Adaptation.** `Modal`, `Drawer` and `Sheet` accept `adapt` and stamp
`data-posture`; on a phone the overlay presentation defaults to `fullscreen`
(`100dvh`), and a bottom sheet keeps its own posture.

**One class namespace per family.** The Modern classes move to `ds-`:

- `rottay-modal-*` / `rottay-overlay-modal-*` -> `ds-modal`, `ds-modal-header`, `ds-modal-body`, `ds-modal-footer`, `ds-modal-close`
- drawer -> `ds-drawer`, `ds-drawer-backdrop`, `ds-drawer-trap`, `ds-drawer-*` compounds; `rottay-focus-trap` -> `ds-focus-trap`
- sheet -> `ds-sheet`, `ds-sheet-focus-scope`; alert-dialog -> `ds-alert-dialog`; confirm-dialog -> `ds-confirm-dialog`
- popover -> `ds-popover` (the recipe is `data-variant`); hover-card -> `ds-hover-card`
- dropdown -> `ds-dropdown`, `ds-dropdown-surface`; tooltip -> `ds-tooltip`, `ds-tooltip-bubble`, `ds-tooltip-content`, `ds-tooltip-trigger`
- `rottay-tour--modern` -> `ds-tour ds-tour--modern`
- `rottay-toast--modern`, `rottay-notification--modern`, `rottay-notification-stack--modern`, `rottay-message--modern`, `rottay-message-stack--modern` -> `ds-notifier ds-notifier--modern` (role on `data-variant`) and `ds-notifier-stack`
- `rottay-alert-shell--modern`, `rottay-callout-shell--modern` -> `ds-alert ds-alert--modern`; `rottay-alert-description` -> `ds-alert-description`; `rottay-undo-toast` is gone

Engines no longer claim caller geometry inline: Modal, Drawer and Dropdown drop
a caller's `position`, `zIndex` and the coordinates the placement owns from
`style` before it reaches the surface; the layer band travels as
`--ds-<family>-layer`, the measured tour spotlight as `--ds-tour-spotlight-*`
and the dropdown position as `--ds-dropdown-position-*`.

**One Notifier (D-17).** Toast, Notification and Message keep their public
contracts; under the Modern engine they are the toast, notification and message
roles of one Notifier surface and stack, with one countdown (paused while the
pointer or focus is inside) and one exit lifecycle. Modern anatomy changes
product CSS may select: tones are `neutral`, `primary`, `secondary`, `gradient`,
`info`, `success`, `warning`, `error`, `loading` (toast `default` and
notification `open` are `neutral`); presence is `data-open`; the lifetime part
is `progress` on `--ds-notifier-lifetime`; notification caller actions sit in
`actions`; stack placements are logical (`top-start`, `top-end`,
`bottom-start`, `bottom-end`), so start and end toast stacks mirror under RTL.

Tenant message and notification chrome now lowers to
`--ds-notifier-message-{bg,close-color,close-color-hover,shadow}` and
`--ds-notifier-notification-{bg,shadow,title-color}`. The frozen skins keep
their names through `FROZEN_ENGINE_COMPAT_CHANNELS`: whenever a vertical
authors the channel, its value is restated under
`--ds-message-{bg,close-color,close-color-hover,shadow}` and
`--ds-notification-{bg,shadow,title-color}`.

**Callout is folded into Alert.** `Callout` is deprecated and keeps working;
under the Modern engine it renders the alert surface. `Alert` gains `action`, the
tray the Callout carried. The Modern alert's message line is the `title` part
and its dismiss the `close-button` part.

Migration:

```tsx
// before
<Callout tone="warning" title="Attention" action={<Button>Renew</Button>} closable>
  Your subscription expires in 3 days.
</Callout>
// after
<Alert tone="warning" message="Attention" description="Your subscription expires in 3 days."
  action={<Button>Renew</Button>} closable />
```

```css
/* before */
.rottay-toast--modern[data-tone='success'] { --ds-toast-accent: teal; }
/* after */
.ds-notifier--modern[data-variant='toast'][data-tone='success'] { --ds-notifier-success-edge: teal; }
```

**Shared kernels.** Modal, AlertDialog and ConfirmDialog promote their native
dialog through one top-layer dialog kernel. Dropdown menus take arrow, edge and
type-ahead keys from the listbox kernel and submenu keys from the roving-focus
navigation intent; tour step keys use the same intent. Close controls, actions
and menu items decide hover, press and focus through the interaction kernel.
Loading states are drawn by the anatomy skeleton from each family's parts.

**Public entry budgets.** `./primitives/modal` reaches 52 modules (the
`ModalCloseButton` compound names its dismiss from the active catalog) and
`./primitives/message` 63 (the statically imported Modern message engine is the
Notifier's message role).

```contract-diff
signature .#ModalProps — adds `adapt?: Adapt<OverlayAdaptation>`; the resolved presentation and posture are stamped on the dialog
signature .#DrawerProps — adds `adapt?: Adapt<OverlayAdaptation>`; the resolved presentation and posture are stamped on the panel
signature .#SheetProps — adds `adapt?: Adapt<OverlayAdaptation>`; side sheets default to fullscreen on a phone, a bottom sheet keeps its posture
signature .#AlertProps — adds `action?: ReactNode`, the action tray Callout carried, rendered by the Modern engine
signature .#Callout — deprecated in favour of Alert (`message`, `description`, `action`); the Modern engine renders the alert surface
signature .#CALLOUT_COLORS — the colour values name the palette steps without literal hex fallbacks
signature .#CONFIRM_DIALOG_VARIANT_COLORS — the colour values name the palette steps without literal hex fallbacks
subpath ./primitives/modal — reachable-module budget 31 -> 52 and source bytes 168791 -> 185473
subpath ./primitives/message — reachable-module budget 54 -> 63 and source bytes 256096 -> 265545
```
