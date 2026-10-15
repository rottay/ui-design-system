---
"@rottay/design-system": patch
---

Contract-diff reconciliation for the ARC-12 caller-anatomy wave (P-88) and one
EVI-02 prose lot. Fourteen published declarations moved shape in commits that
shipped no changeset; this file names each one and the commit that moved it,
registered after the fact. No public type is removed or narrowed:

- Documentation only (`@deprecated` or JSDoc text; the member list and every
  member type are byte-identical once comments are removed): `SpinnerProps`,
  `UserProfileCardProps`.
- Additive: `LoadingIndicatorAnatomy` is a new root type export, and
  `LoadingIndicatorProps` gains the optional `anatomy` member that carries it.
  `LoadingIndicatorProps['data-part']` stays in the type, now `@deprecated`.
- Binding pattern only: `ImageFallback`, `ImageSkeleton`,
  `SemanticSurfaceSupport`, `LoadingIndicator`, `MenuDivider`, `MenuGroup`,
  `MenuItem`, `MenuSubMenu`, `StepperContent` and `StepperStep` keep their
  parameter type annotation, `forwardRef` generics and return type as they
  were. Only the destructuring inside the declaration changed: the components
  now pull out the caller `data-part`/`data-state` so they are not forwarded.

Runtime note: the binding changes are the P-88 strip. A caller `data-part`
(and, where the old rest spread forwarded it, `data-state`) no longer reaches
the DOM on these primitives. Each one stamps its own part (`root`, `divider`,
`group`, `item`, `support`, `panel`). `LoadingIndicator` takes the part a
composing DS primitive hands down through `anatomy`. Consumers compose through
`className`. This follows the `w25-p88-passthrough-law` ruling and the
`e8b-typography-engine-strip` precedent.

```contract-diff
signature .#SpinnerProps — `data-part` JSDoc rewritten as inert and tagged `@deprecated` (use `className`); type unchanged (ba108dece)
signature .#UserProfileCardProps — JSDoc of `actions` and `onClick` expanded (compact variant omits actions; card activates through one stretched Button); members and types unchanged (6fab307ca)
signature .#LoadingIndicatorProps — gains optional `anatomy?: LoadingIndicatorAnatomy` (composition-only part hand-down); `data-part` stays typed, now inert (f9d5844eb) and `@deprecated` (ba108dece); additive
signature .#LoadingIndicator — destructures `anatomy` instead of the caller `data-part`; signature `(props: LoadingIndicatorProps) => React.ReactElement` unchanged; the caller part is no longer stamped (f9d5844eb)
signature .#ImageFallback — binding pattern only (`allProps` destructured in the body to strip caller `data-part`/`data-state`); `forwardRef<HTMLDivElement, ImageFallbackProps>` and its JSX.Element render return unchanged (febd8eae5)
signature .#ImageSkeleton — binding pattern only (`allProps` destructured in the body to strip caller `data-part`/`data-state`); `forwardRef<HTMLDivElement, ImageSkeletonProps>` and its JSX.Element render return unchanged (febd8eae5)
signature .#SemanticSurfaceSupport — expression body becomes a block body that strips caller `data-part`/`data-state`; `forwardRef<HTMLSpanElement, SemanticSurfaceSupportProps>` and its certified JSX.Element return unchanged (b02e74875)
signature .#MenuDivider — binding pattern strips caller `data-part`/`data-state` (part fixed to `divider`); `(props: MenuDividerProps) => React.ReactElement` unchanged (febd8eae5)
signature .#MenuGroup — binding pattern strips caller `data-part`/`data-state` (part fixed to `group`); `(props: MenuGroupProps) => React.ReactElement` unchanged (febd8eae5)
signature .#MenuItem — binding pattern strips caller `data-part`/`data-state` (part fixed to `item`); `(props: MenuItemProps) => React.ReactElement` unchanged (febd8eae5)
signature .#MenuSubMenu — binding pattern strips caller `data-part`/`data-state` before the rest spread; `(props: MenuSubMenuProps) => React.ReactElement` unchanged (febd8eae5; defining folder renamed `sub-menu` -> `submenu` in 046b207fe without moving the fingerprint)
signature .#StepperContent — binding pattern strips caller `data-part`/`data-state` before the rest spread; `(props: StepContentInternalProps) => React.ReactElement | null` unchanged (febd8eae5)
signature .#StepperStep — binding pattern strips caller `data-part`/`data-state` before the rest spread; `(props: StepInternalProps) => React.ReactElement` unchanged (febd8eae5)
export .#LoadingIndicatorAnatomy — added: `Readonly<{ 'data-part'?: string }>`, declared in f9d5844eb and published through the root barrel in fe4ee847f
```
