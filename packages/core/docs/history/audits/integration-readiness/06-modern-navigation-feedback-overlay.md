# Modern Navigation, Feedback, and Overlay

## Overall View

This area is visually closer to MVP than it is structurally complete.

Strongest pieces:

- `Menu`
- `Modal`
- `Drawer`
- `PageShell`
- `ActivityLog`

Weakest pieces:

- `CommandPalette`
- `ShortcutsOverlay`
- `Link`
- `Breadcrumb`
- `Tabs`
- `Stepper`
- `Steps`
- `Skeleton`
- `NotificationCenter`

## Scorecard

| Category | Score | Notes |
|---|---:|---|
| DS token ownership | 6 | Mixed. Some components are clean, others still Daisy-first. |
| Tenant customization reach | 6 | Works in the visible shell, not equally across all primitives/patterns. |
| Daisy/local fallback discipline | 5 | Still too much Daisy visual ownership in several components. |
| UX/accessibility consistency | 6 | Modal-quality behavior is not consistent across overlay-like patterns. |
| MVP readiness | 8 | Looks good enough in product, but is not yet fully system-owned. |

## Biggest Risks

### Overlay semantics

`CommandPalette` and `ShortcutsOverlay` still lag behind the DS modal primitives in:

- `role="dialog"`
- `aria-modal`
- focus trap
- Escape close
- focus return

This is both an accessibility issue and a system-coherence issue.

### Navigation token ownership

`Link`, `Breadcrumb`, `Tabs`, `Stepper`, and `Steps` still allow Daisy/local styling to own too much of the visual result.

### Pattern local geometry

`NotificationCenter` is the clearest example of "token-colored but not token-governed".

## Best Examples

### Menu

Modern `Menu` is the best navigation example:

- low Daisy dependency
- strong sidebar token ownership
- healthy active/hover/focus behavior

### Modal and Drawer

These are among the strongest overlay/foundation examples in the repo.

### PageShell

This is one of the strongest visible product patterns in the system.

## Recommended Waves

### Wave N1 - Overlay Accessibility Hardening

Targets:

- `CommandPalette`
- `ShortcutsOverlay`

### Wave N2 - Navigation Token Ownership

Targets:

- `Link`
- `Breadcrumb`
- `Tabs`
- `Stepper`
- `Steps`

### Wave N3 - Pattern Primitive Adoption

Targets:

- `NotificationCenter`
- `CommentThread`

Shift them toward DS primitives for:

- buttons
- inputs
- badges
- spacing
- typography

### Wave N4 - Feedback Cleanup

Start with `Skeleton`, then review `Notification`, `Toast`, and `Message`.
