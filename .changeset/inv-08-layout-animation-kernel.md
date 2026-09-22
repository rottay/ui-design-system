---
"@rottay/design-system": minor
---

WO-INV-08. Layout animation kernel: one door for layout motion, zero new
dependency, and the property law given an instrument that can see its own corpus.

**The defect.** Five unrelated mechanisms moved layout in this package --
`useFlipLayout`, `usePresence`, `useViewTransition`, `recordMorphStyle` and a
hand-rolled WAAPI FLIP inside `widget-board/engines/foundation` -- with no entry
point naming them and three real gaps: animated size (`interpolate-size` shipped
as an enabler with zero consumers), group scoping for shared elements
(`recordMorphStyle` had zero production consumers and its duplicate-name hazard
was documented but unenforced), and list presence (`usePresence` documents itself
as single-node). `useFlipLayout` also defaulted to `--ds-motion-normal` +
`--ds-motion-ease-out` -- the calm alias and the ENTER curve -- for what is a
move; the unlinted widget-board FLIP already read the correct
`--ds-motion-rearrange` + `--ds-motion-ease-move` pair.

**The kernel.** `useLayoutAnimation({ kind })` at
`graphics/motion/react/runtime/layout/**`, with a return type discriminated on
the `kind` literal through overloads: `reflow` (FLIP over surviving keyed
children), `size` (keyword interpolation where `interpolate-size: allow-keywords`
is supported, a compositor-only `scale` invert otherwise, forced by
`sizeStrategy: 'measured'`), `presence` and `shared`. `LayoutGroup` is the scope
and animates nothing: it supplies the element the channels are read from, fans one
`measure()` out so siblings play on one commit, and owns the shared-key registry
that turns a duplicate `view-transition-name` into a development throw instead of
a silently skipped transition. `PresenceList` is the list equivalent of
`usePresence`. Reads are batched -- all rects, then the channels ONCE from the
group root, then every write -- because 12 interleaved read/write cycles on a
12-card grid reflow is the long task the budget exists to catch.

**No second cadence authority.** The kernel takes no `character` (the compiler
resolves it into `--ds-motion-ease-move`), no numeric duration and no numeric
easing: a call site names a CHANNEL and the kernel reads its computed value, so
the tenant dial and `motion.character` arrive with it. A channel that resolves to
no duration means no animation; the kernel never substitutes a literal.

**Reduced motion.** The WO's "reduces to opacity-only" clause is AMENDED, not
satisfied: the reduced-motion block zeroes thirteen `--ds-motion-*` channels with
`!important`, so under `prefers-reduced-motion: reduce` the kernel creates NO
animation and commits the final state on the same frame. Opacity-only would need
a new, deliberately un-zeroed duration channel -- a tenant-facing accessibility
decision that reopens WO-INV-05's universal kill switch, not something a layout
kernel decides by writing a number.

**Public API.** `useFlipLayout` keeps its name, signature and result shape and is
still exported from the root barrel; `flip-layout/` is DELETED rather than left as
a re-export, per the physical-move rule. Its two default channels change from
`--ds-motion-normal`/`--ds-motion-ease-out` to
`--ds-motion-rearrange`/`--ds-motion-ease-move` -- a behaviour change: a move now
runs at the deliberate cadence on the move curve. Its only consumer imports the
runtime barrel, so no consuming file changes.

**Contract diff (supplier).** `contracts/runtime/suppliers/index.json` is
regenerated. The lot DECLINES to break the `foundation/reduced-motion ->
@/infrastructure/runtime/motion` barrel edge, so five of the eight new root
exports trace to `["motion"]` exactly as `useFlipLayout`/`usePresence`/
`useReducedMotion` already do, and three (`LayoutGroup`, `useSharedElementKey`,
`LAYOUT_CHANNEL_DEFAULTS`) are supplier-free. Breaking that edge would fork the
single runtime motion authority, which is the motion provider owner's decision,
not this lot's. The BYTES are guarded separately and measurably: the new
`kernel-bundle` gate builds the kernel's exports through the bundle checker's own
instrument and asserts `retainedNodeModules === 0`, which is the clause that
bites -- a planted `MotionProvider` fixture retains five
framer-motion/motion-dom modules while its external set stays
`['react','react/jsx-runtime']`, inside any react-shaped allowance.

**The property law.** `@rottay/no-layout-property-animation` is new (ESLint, Arm
A) and `no-motion-literals`' subject widens from `engines/modern/**` to
`src/components/**` minus the frozen engines, which is what puts the two
`runtime/presentation/` inline writers and `progress/compound/line` -- an
engine-shared body publicly exported as `Progress.Line` -- in reach for the first
time. Arm B (`property-law`) is a source-only CSS census over
`foundation/tokens/css/**`, because ESLint cannot read a `.css` file at all, with
its declaration grammar frozen in the baseline BEFORE the count: the grammar term
moves this population by 57 sites, the token list by one. Both arms read one token
list and the drill fails when the two copies diverge. The new rule is OFF in
`recommended` until each app censuses its own debt.
