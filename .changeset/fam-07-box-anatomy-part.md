---
"@rottay/design-system": minor
---

WO-FAM-07 (DT ruling, 2026-09-16): the modern `Box` stamps
`data-part="box-surface"`, and its skin anchors there.

Box was the one family in the layout cut with no anatomy of its own, because the
obvious names are both hazardous. It is the style-injection escape hatch 75 DS
components and 113 showroom modules compose with, so whatever part it stamps
lands on every nested Box in the fleet:

- `root` is out — every family reads its own root, so `.rottay-x
  [data-part='root']` would reach into X's Boxes and any query for X's own root
  would match them;
- `box` is out — `checkbox` already owns it for its indicator and reads it with
  descendant selectors in both engine skins, and a contract test pins exactly one
  such node inside a Checkbox tree. A Box nested in a checkbox label would have
  taken the indicator's paint.

`box-surface` was censused clear against all three axes a part name lives on —
what stamps it, which skins read it, and whether `SKELETON_PART_ROLES` already
names it — and takes the `pass` skeleton role: a Box is a container, so its
children are drawn and it is not, unlike checkbox's solid `block` square.

For a consumer this is additive: the element keeps its class, its
`data-component`, and every channel it already carried. A caller querying
`[data-part]` inside a subtree that contains a Box will now see one more node.
