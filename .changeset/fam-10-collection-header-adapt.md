---
"@rottay/design-system": minor
---

WO-FAM-10. `CollectionHeader` takes the `adapt` slot: the compact composition
follows the header's own box instead of the window.

`compactLayout` was `compact ?? isPhoneOrTablet`, and it decides which clusters
render at all — the editorial-tech subtitle divider and rule, whether the
eyebrow leads the identity column or sits in the secondary rail, the overflow
menu, the icon-only action collapse — plus the rail's gaps and justification.
Keyed on the viewport alone, a header in a narrow rail on a desktop page
rendered its full editorial layout into space that cannot hold it. The header
now resolves that decision through `useAdaptation` against its OWN measured
box, accepts `adapt` on the shared posture vocabulary, and stamps the postures
in force as `data-posture` on its root.

One family contract joins the adaptation kernel: `CollectionHeaderAdaptation`,
a single `compactLayout` boolean, because the family asks its space exactly one
question. Its default narrows and never widens — a `compact` box runs the
compact composition whatever the viewport says — and carries deliberately NO
viewport entry, because `compact ?? isPhoneOrTablet` is already the base layer
and a `phone` default would be a second, competing decision about the same axis
that silently outranked an explicit `compact={false}`. The consequence is that
`compact` stays the last word on an unmeasured render, in both directions: the
rendered markup of an unmeasured header is byte-for-byte HEAD's, minus the new
`data-posture` stamp (measured over two viewports × six prop shapes).

`compact` is therefore the BASE layer of the resolution, not the final one: a
measured compact box narrows over it. A caller that wants the full composition
inside a narrow rail declares
`adapt={{ compact: { compactLayout: false } }}`.

`CollectionHeaderAdaptation` is NOT aggregated into the adaptation kernel's
family barrel — a consumer takes `Adapt` from the kernel and the family's shape
from `composition/families/collection-header`, the reach law in that barrel's
docblock. Adoption charges one module to the single entrypoint that reaches
this family (`./surfaces/collection-workspace`, 636 → 637 reachable, ceiling
778) and nothing to any other.

Additive only on the public surface: both changed declarations gain one
optional member, neither changed shape for an existing caller, no subpath was
added or retired, no published export was removed, and the contract above is
internal to the package.

```contract-diff
signature .#CollectionHeader — changed; accepts the optional `adapt` slot and stamps `data-posture`
signature .#WorkspaceHeader — changed; the deprecated alias of `.#CollectionHeader`, same signature
export .#CollectionHeaderProps — changed; adds optional `adapt?: Adapt<CollectionHeaderAdaptation>`
export .#WorkspaceHeaderProps — changed; the deprecated alias of `.#CollectionHeaderProps`, same shape
```
