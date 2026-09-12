---
"@rottay/design-system": major
---

WO-FAM-14. One loading-state renderer derived from the component's anatomy
replaces the nine hand-made skeleton compounds.

**The defect.** `Skeleton.Avatar`, `Skeleton.Button`, `Skeleton.Card`,
`Skeleton.Form`, `Skeleton.ListItem`, `Skeleton.Paragraph`, `Skeleton.Table`,
`Skeleton.Text` and `Skeleton.Transition` each drew a picture of a component by
hand, so every one of them drifted from the component it stood in for, and each
ran its own inline `ds-skeleton-shimmer` animation.

**What replaces it.** `AnatomySkeleton` renders the component it stands in for,
reads that component's stamped `data-part` anatomy and paints one bone per part
by role (`frame`, `block`, `line`, `round`; `pass` and `omit` draw nothing).
While `loading` is true the component keeps its exact geometry but is
`aria-hidden` and `inert`; when it ends, the component fades back in on
`--ds-motion-fast`. The shimmer and pulse of every Modern skeleton now run on the
foundation keyframes with `--ds-motion-attention` and `--ds-motion-ease-in-out`,
and under reduced motion every skeleton is a static flat surface.

Migration:

```tsx
// before
<Skeleton.Card hasImage lines={3} />
<Skeleton.Transition loading={isLoading} skeleton={<Skeleton.Card />}>
  <ProfileCard profile={profile} />
</Skeleton.Transition>

// after
<AnatomySkeleton loading={isLoading}>
  <ProfileCard profile={profile} />
</AnatomySkeleton>
```

The Modern Skeleton primitive no longer follows `BrandMotion.pulseSpeed`
(`--ds-skeleton-animation-duration`); its cadence follows the tenant motion
dial through `--ds-motion-attention`. Classic and Rustic are unchanged.

```contract-diff
signature .#Skeleton — the nine static compound members (`Avatar`, `Text`, `Button`, `Card`, `ListItem`, `Table`, `Form`, `Paragraph`, `Transition`) are removed; wrap the real component in `AnatomySkeleton` instead
signature ./primitives/skeleton#Skeleton — the same nine static members removed on the subpath export of the same declaration
export .#AnatomySkeleton — added; builds a component's loading state from its `data-part` anatomy
export .#AnatomySkeletonProps — added; `loading`, `children`, `animation`, `className`, `style`
export .#SkeletonPartRole — added; the role a stamped part plays in the loading surface
export .#SkeletonAvatar — removed; use `AnatomySkeleton` around the real avatar
export .#SkeletonText — removed; use `AnatomySkeleton` around the real text block
export .#SkeletonButton — removed; use `AnatomySkeleton` around the real button
export .#SkeletonCard — removed; use `AnatomySkeleton` around the real card
export .#SkeletonListItem — removed; use `AnatomySkeleton` around the real list item
export .#SkeletonTable — removed; use `AnatomySkeleton` around the real table
export .#SkeletonForm — removed; use `AnatomySkeleton` around the real form
export .#SkeletonParagraph — removed; use `AnatomySkeleton` around the real paragraph
export .#SkeletonCardProps — removed with `SkeletonCard`
export .#SkeletonListItemProps — removed with `SkeletonListItem`
export .#SkeletonTableProps — removed with `SkeletonTable`
export .#SkeletonFormProps — removed with `SkeletonForm`
export .#SkeletonParagraphProps — removed with `SkeletonParagraph`
signature .#useMotionPersonality — no shape change: the inferred return type prints the same `pulseSpeed` union (`"none" | "normal" | "slow" | "fast"`) with its members in a different order, because the type checker now creates those literal types in a different sequence
```
