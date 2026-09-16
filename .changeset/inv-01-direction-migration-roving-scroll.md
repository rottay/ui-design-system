---
"@rottay/design-system": minor
---

WO-INV-01 migration 1: the two shared kernels that measured the DOM become
genuinely pure, and the reading direction they needed arrives from the i18n
authority.

`resolveReadingDirectionIsRtl` was the de-facto direction authority for
**thirteen families at seventeen call sites** — tabs, menu, sub-menu, anchor,
breadcrumb, calendar, dropdown, hover-card, tree-select, time-picker, cascader
and date-picker all reached one `element.closest('[dir]')` plus a
computed-style fallback. `revealInlineWithinScroller` did the same inside a
pure geometry helper shared by tabs, pagination, segmented and anchor. Both
are now direction-free: the resolver is deleted, the helper takes `isRtl` as a
parameter, and what stays is arithmetic.

Consumers read `useReadingDirectionIsRtl()` — ONE wrapper, added beside the
authority, never one per family, which is how the probe it replaces ended up
re-implemented thirteen times. `useRovingFocus`'s `rtl: 'auto'` now means "ask
the locale" instead of "probe the DOM", and its exported `resolveIsRtl()` drops
its element parameter: the answer is the locale's, not the element's.

Three things this fixes rather than moves. The kernel could not answer during
SSR, so server-rendered markup always assumed LTR. It paid a `closest()` plus a
computed-style read on every keydown. And its freshness law — resolve at the
start of every interaction, written to defeat an earlier cached-direction bug —
is now a property of the source: a locale switch re-renders every consumer, so
nothing has to re-measure. Two components lose state that existed only to hold
a probe result (`Tabs`'s `writingDirection`, which is derived now).

For a consumer: no public prop or class changes. As with the earlier sweeps,
direction signalled ONLY by a bare `dir` attribute with no `I18nProvider` above
no longer mirrors these families — the locale is the channel, and the provider
stamps `dir` itself. Twenty test cases across sixteen suites moved from a `dir`
wrapper (or `document.documentElement.dir`, or a manual `setAttribute('dir')`
on a portalled panel, which existed only to feed the probe across the portal
boundary) to `I18nProvider locale="ar"`, and every one of them passes with its
assertions unchanged.

```contract-diff
export .#useReadingDirectionIsRtl — added; `useOptionalDirection() === 'rtl'` as a boolean, the one wrapper consumers read instead of writing that comparison at seventeen call sites. Non-throwing, `false` without a provider, identical on server and client.
```
