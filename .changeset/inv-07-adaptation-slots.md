---
"@rottay/design-system": major
---

WO-INV-07 (audit F-35 in part). Adaptation slots: one typed `adapt` contract,
one posture vocabulary, and a reference implementation on `PatternDataTable`.

**The defect.** Every layout-sensitive pattern improvised its own adaptation:
its own pixel threshold (`PatternDataTable`'s `mobileBreakpoint = 768`), its own
posture names (`ContainerPosture` said `standard` where the programme says
`regular`), and no typed place where an application could say "these are the
columns that stay on a phone".

**What replaces it.** Postures are one vocabulary with two axes: viewport
`phone | tablet | desktop`, resolved on the server from the request's viewport
hint through the one responsive snapshot, and container
`compact | regular | expanded`, resolved from the family's own box on the
tenant's container ladder. A layout-sensitive family accepts
`adapt?: Adapt<FamilyAdaptation>` — per-posture deltas the application
declares — and stamps the postures in force as `data-posture`, a token list
(`desktop compact`) a skin selects with `[data-posture~='compact']`.

`PatternDataTable` is the reference: `adapt` takes
`columns: { keep, priority, shrink }`, `presentation: table | cards | list` and
`rowActions: inline | menu | swipe`. `cards` and `list` are generated from the
same `columns` model; there is no second component. By default a phone request
and a compact box present cards.

```tsx
<PatternDataTable
  columns={columns}
  adapt={{
    phone: { columns: { keep: ["name", "status", "owner"], shrink: ["status"] }, presentation: "cards", rowActions: "swipe" },
    tablet: { columns: { keep: ["name", "status", "owner", "updatedAt"] } },
  }}
/>
```

**Breaking.** `ContainerPosture` is `'compact' | 'regular' | 'expanded'`: the
middle band is `regular`, and `resolveContainerPosture` answers it. A
`minPosture: 'standard'` becomes `minPosture: 'regular'`.
`PatternDataTable` no longer defaults `mobileBreakpoint` to 768: without it the
table follows the shared postures (cards on a phone request or on a box of the
compact band, 639px on the balanced ladder), so a standalone table in a
640-767px box now stays a table. `mobileBreakpoint` is deprecated; when set it
keeps its pixel behaviour.

```contract-diff
export .#Adapt — added; per-posture deltas of a family's adaptation
export .#Posture — added; the viewport and container posture names in one union
export .#ViewportPosture — added; phone | tablet | desktop
export .#ResolvedPosture — added; the viewport posture and the measured container posture of one instance
export .#ContainerPosture — changed; the middle band is `regular`, not `standard`
export .#resolveContainerPosture — changed; answers `regular` for the middle band
export .#resolveActiveResponsivePosture — changed; owned by the adaptation runtime, same input and result
export .#DataTableAdaptation — added; columns, presentation and rowActions per posture
export .#DataTableColumnAdaptation — added; keep, priority and shrink by column key
export .#DataTablePresentation — added; table | cards | list
export .#DataTableRowActions — added; inline | menu | swipe
export .#DataTablePatternProps — changed; `adapt` added, `mobileBreakpoint` deprecated with no default
export .#DataTableMessages — changed; `rowActions` names the row-actions menu and swipe disclosure
```
