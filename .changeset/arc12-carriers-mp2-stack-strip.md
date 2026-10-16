---
"@rottay/design-system": major
---

On the Modern engine, `Stack` now stamps its own `data-part="root"` after the
caller's attributes, so a caller `data-part` no longer replaces it, and it no
longer forwards a caller `data-state`. This follows the
`w25-p88-passthrough-law` ruling. `id`, `aria-*`, every other `data-*` and
`className` still reach the element. Compose through `className`. The owner
class doors of `arc12-carriers-mp1-stack-doors` (`ds-<owner>__<part>` and the
reused owner classes) are what the skins key on, and they are unchanged.
Classic and Rustic `Stack` are unchanged: they still forward a caller
`data-part` and `data-state` (structural carriers, read-only engines).

Divider slot, Modern only. A caller-supplied `divider` element is no longer
stamped with `data-part="divider"`. It keeps its own `data-part` and receives
the slot class `rottay-stack-divider` beside its own classes, plus
`aria-hidden`. The Stack's own divider (`divider={true}`) is unchanged: a
`<span class="rottay-stack-divider" data-part="divider">`. Style a divider slot
through `.rottay-stack-divider`. Classic and Rustic still stamp
`data-part="divider"` on a caller divider.

Descendant reach: the Modern and Rustic menu, dropdown, workspace-switcher and
context-menu skins style any `[data-part="divider"]` descendant. A caller
divider-Stack nested inside one of them was painted by those rules through the
stamped part; on Modern it no longer is. On Rustic nothing changes.

In-repo callers: the 46 caller parts on Modern Stacks now render `root`, and
their owners reach them through the M-P1 class doors. Brand Studio's root,
tenant preview and preview report Stacks now carry their status on
`data-status` (`idle`/`checked`, `valid`/`invalid`) instead of `data-state`. The
compare loading stack, the guided draft section list and the Brand Studio
preview column gain owner hooks (`ds-compare__compare-skeleton`,
`ds-guided-draft-form__section-nav-list`,
`ds-pattern-brand-studio__preview-column`), and the skeleton renderer gains
roles for the hooked names, so the loading bones are unchanged.

Break against the published 2.19.37: the Modern `Stack` spread the caller rest
over its default part, so a caller `data-part` and a caller `data-state`
rendered; neither does now. A caller divider element rendered
`data-part="divider"`; on Modern it now keeps its own part. Consumer census of
2026-10-16: app-bithire (forces `modern`) passes `data-state` to one `Stack`
(`features/jobs/surface/screens/record/listing/index.tsx:1226`), and
`.bh-jobs-listing__empty-state[data-state="error"]` (its `styles/index.css:62`
and `:92`) stops matching. app-evnto and app-platform: none. No application
passes a `divider` to a `Stack`.

Overlap exception (owner, 2026-10-15): these identified P-88 breaks ship
directly in this major, with an exact inventory, a migration guide,
replacements and reviewed evidence, by the owner's express exception to the
one-minor overlap rule. The exception does not extend to any other deprecation
or retirement. Migration guide:
`packages/core/docs/consumer-contract/migration/p88-caller-anatomy/index.md`.
