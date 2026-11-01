---
"@rottay/design-system": patch
---

`HeaderSurface` now forwards `config.access` to `SurfaceActionBar`, so
`{ mode: 'all' }` keeps its declared contract on Header actions, as
`SidebarSurface` already does: an action hidden only by its `visible`
predicate now renders, and no action `visible` predicate runs. A host that
relied on `visible` to hide a Header action under `{ mode: 'all' }` now shows
it; leave that action out of `config.behavior.actions`, or use resolved or
omitted access, where the predicate still filters. Access stays presentation
only and grants no authorization. `{ mode: 'resolved' }`, omitted access and
tabs are unchanged, and `hideSecondaryActionsOnMobile` still selects which
actions render on a phone. No public API or dependency change.
