---
"@rottay/design-system": minor
---

WO-FAM-10 sub-lot D2: the `header-surface` family cut completes with a
zero-channel chrome deriver.

THE DERIVER. `derivation/chrome/header-surface` exports
`headerSurfaceChromeDeriver` (family `header-surface`, rank `derived`) with an
EMPTY `produces` set, and that is a measurement rather than an omission: the
surface reads zero custom properties and carries zero inline paint, because
every visual decision it renders belongs to a component it composes —
PageShellSurface, Tabs, Stack and Typography each own their own chrome,
channels and family row. The one rule left in the family's skin
(`skin/layout-header`) is `min-inline-size: 0` flex/grid resilience under the
compact mobile posture — layout with no tenant-meaningful value, so producing
a channel for it would name a dial nobody turns (a `var(--ds-x, LITERAL)` no
producer writes looks customizable and is not). The deriver's contract test
pins the empty set against the skin file itself: the day the skin grows a
family channel, the producer must land in the same change. The DT registers
the deriver in `derivation/index.ts` at integration; a precedence case proves
the ranked-merge path carries a tenant statement of a `--ds-header-surface-*`
channel once registered.

THE CUT TEST. `HeaderSurface.cut.test.tsx` pins the anatomy contract the
skin's one rule selects (`data-part='root'` plus `data-loading` /
`data-mobile-compact` / `data-mobile-actions`), the loading passthrough to
PageShellSurface (the shell's `aria-busy` skeleton replaces the surface body,
announced by a `role='status'` carrier), zero family-owned inline paint (the
surface root carries composed `--ds-*` channels only), and the family's own
accessibility evidence: labelled tabs, the config description, and a root that
is a plain container rather than an improper landmark. No painted-causality
probe is added: the family owns zero paint channels, so a probe here would
claim causality for paint owned by the composed families and probed in their
own cuts. No prop shape moved; nothing here is a runtime change until the DT's
registration line lands.
