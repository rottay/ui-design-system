---
"@rottay/design-system": minor
---

WO-FAM-10. The five space-sensitive families of this cut take the `adapt` slot,
and the guided-draft form stops rendering its sections as a card stack.

**`adapt` adoption.** `edit-fields` and the four form page recipes
(`FormSurface`, `DetailFormSurface`, `GuidedDraftFormSurface`, `WizardSurface`)
now accept `adapt` on the shared posture vocabulary and stamp `data-posture`,
resolving through `useAdaptation` against their OWN box rather than the
viewport. Two family contracts join the adaptation kernel —
`EditFieldsAdaptation` (the field region's tracks) and `FormSurfaceAdaptation`
(stacking, section-navigation layout, action bar, compact header), one contract
for the four recipes because they answer the same question about the same
space. Both declare narrowing-only defaults, so a caller that declares nothing
renders exactly as before: each family's existing resolution (`adaptive`,
`surfaceStackingValue`, the `columns` prop) became the base layer and an app's
`adapt` outranks it.

**Ledger doctrine.** `GuidedDraftFormSurface`'s scroll-mode sections are
`edit-fields` ledger blocks instead of nested Cards — section header, the
family's divider seam, then the fields on the ledger grid. The active and
errored locus moved with them: the two `--ds-card-bordered-border-color` writes
that used to mark those sections reached nothing once the Card was gone and, as
custom properties, inherited into any Card a consumer rendered inside
`section.render()`. They are replaced by a locus rail on the block's
inline-start edge.

**Entrypoint reach.** The two new contracts (`EditFieldsAdaptation`,
`FormSurfaceAdaptation`) are NOT aggregated into the adaptation kernel's family
barrel: a consumer takes `Adapt` from the kernel and the family's own shape from
`composition/families/<family>`, the pattern `overlay` set. The gate-only
`registry` left that barrel too — no runtime module imports
`LAYOUT_SENSITIVE_FAMILIES`, the `adapt-slot` gate reads it from source with the
TypeScript AST, so re-exporting it charged every public entrypoint that reaches
the kernel for a roster with no consumer, and charged them again for every row a
new adoption added. Adopting a family no longer grows any entrypoint's fan-out.

Additive only on the public surface: every changed declaration gains an
optional member, none changed shape for an existing caller, no subpath was
added or retired, and no published export was removed — the contracts above are
internal to the package.

```contract-diff
signature .#InlineEditGrid — changed; accepts the optional `adapt` slot and stamps `data-posture`
signature .#InlineEditor — changed; accepts the optional `id`, the ledger block's scroll anchor
signature .#FormSurface — changed; accepts the optional `adapt` slot
signature .#DetailFormSurface — changed; accepts the optional `adapt` slot
signature .#WizardSurface — changed; accepts the optional `adapt` slot
export .#InlineEditGridProps — changed; adds optional `adapt?: Adapt<EditFieldsAdaptation>`
export .#InlineEditorProps — changed; adds optional `id?: string`
export .#FormSurfaceProps — changed; adds optional `adapt?: Adapt<FormSurfaceAdaptation>`
export .#DetailFormSurfaceProps — changed; adds optional `adapt?: Adapt<FormSurfaceAdaptation>`
export .#WizardSurfaceProps — changed; adds optional `adapt?: Adapt<FormSurfaceAdaptation>`
export .#GuidedDraftFormSurfaceProps — changed; adds optional `adapt?: Adapt<FormSurfaceAdaptation>`, beside the existing `adaptive`
```
