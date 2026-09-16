---
"@rottay/design-system": minor
---

WO-FAM-07 (DT ruling, 2026-09-16): the breakpoint ladder's zero step is no
longer projected as a CSS channel.

`--ds-breakpoint-xs` was emitted into every compiled tenant block and declared in
the breakpoint contract sheet, and nothing read it — measured at zero readers in
this package, the showroom and all three vertical apps. It could not have had
one: a `@media`/`@container` prelude cannot read a custom property, and the
routes that can (the Container measure ladder, JS, the compiled block) have no
use for a floor of `0`. The emitter now skips it and the contract sheet no longer
declares it.

The STEP is untouched. `xs: 0` remains a member of `RESPONSIVE_BREAKPOINTS` and
of the order every responsive hook cascades over; `ResponsiveValue` keys,
`useResponsiveValue` and every `{ xs: … }` prop are unaffected. What retires is
one CSS variable nobody could read.

The sibling steps went the other way in the same work order: `Container` now
resolves its measure rungs from `--ds-breakpoint-{sm..2xl}`, so a container framed
at `lg` is exactly the viewport step it frames instead of a second copy of the
ladder.

A tenant or consumer stylesheet that read `var(--ds-breakpoint-xs)` from the
compiled block should use `0` directly, which is what it always resolved to.
