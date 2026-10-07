---
"@rottay/design-system": patch
---

`PatternDetailPanel` on the Modern engine renders its tab strip with the
canonical `Tabs` primitive instead of a hand-built `role="tab"` strip. The
Tabs recipe follows the tenant's governed recipe profile when one is selected
(`useRecipeProfileDefaults('tabs')`), with `contained` as the pattern's
default otherwise. Modern only; Classic and Rustic frozen.

Behaviour is unchanged where callers can observe it: the tablist keeps its
name (`detailPanel.tabs`, "Detail panel tabs", now through the Tabs
`aria-label`); selection stays pattern-owned (`activeTab` / `onTabChange`,
including the uncontrolled seed that skips a disabled first tab); a disabled
tab is natively disabled and never activates; activation is automatic; arrows
follow the reading direction, Home and End jump, and the selected tab is the
single tab stop. Tabs additionally answers ArrowUp/ArrowDown as previous/next.
Tab labels render whole (a label ending in a number is not split into a badge),
badges map to `TabItem.badge`, icons to `TabItem.icon`.

IDS CHANGE (a fix). The tab and panel ids were `tab-${key}` and `panel-${key}`:
not unique per page, so two detail panels on one page produced colliding ids and
cross-wired `aria-controls` / `aria-labelledby`. They are now generated per
instance by Tabs; `aria-controls` sits on the selected tab only and points at
the rendered panel, whose `aria-labelledby` names that tab. No consumer targets
the former ids.

DECLARED VISUAL CHANGE. The strip is painted by the Tabs skin, so its detailing
follows the shared Tabs anatomy: the track hugs its tabs instead of spanning the
column, the icon sits in the Tabs icon chip, badges are the Tabs outlined pill,
and the disabled tab dims to the Tabs value. Tab height, the coarse-pointer
44px floor and the raised active tab are kept. The content card keeps its
workspace-card paint, now on a pattern-owned surface inside the Tabs panel
(`data-part="panel-surface"`), and its text keeps the primary ink.

Further named deltas, all from the canonical anatomy (measured, reviewed): the
panel plays the Tabs panel-reveal animation and the directional view transition
on tab change (both honour reduced motion); the focused panel shows the Tabs
ring instead of the UA outline; and when the strip overflows at narrow widths,
Tabs' overflow controls (previous/next + "More tabs") apply instead of the old
silent scroller — at w360 the controls already render with 3 tabs (the third
was clipped at the old strip; the controls add the affordance). Under bithire's
artifact-selected `technical-sharp` profile the strip renders the governed
underline recipe (the strip is ~7px shorter, the content below moves up, the
card is unchanged) — that is the tenant decision propagating, not a regression.
