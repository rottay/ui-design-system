---
"@rottay/design-system": major
---

Contract-diff reconciliation for the range after `f3b6d910a`. The published
declarations below moved shape and no `contract-diff` row in the range names them.
This file names each one and the commit that moved it, after the fact. It ships no
code: every behaviour below arrived with the commit it cites.

The bump is major because `docs/releasing.md` classes a change to a component's
default rendered output as major, and the Modern `compact` table below is one. This
file also declares `TENANT_THEME_COMPILER_VERSION`, whose major bump
`d5b-workspace-frame-namespace.md` already carries.

Documentation only, with every member and member type byte-identical once comments
are removed and no code changed in the declaring file:

- `BrandShellChrome`. The frame forwarding its JSDoc describes is the
  `d5b-workspace-frame-namespace.md` change; the tenant contract does not move.
- `CollectionWorkspaceProps`. Only the `density` JSDoc moved.

Members and types unchanged, behaviour moved in the same commit:

- `DataTablePatternProps`. The Modern `compact` padding no longer falls through to
  `--ds-table-cell-padding`, which the base theme always writes, so a standalone
  `compact` table with no authored padding renders the `0.5rem 0.75rem` its
  documentation already stated, not `0.75rem 1rem`. `comfortable` and `spacious` did
  not move; their JSDoc is corrected to the `0.75rem 1rem` they render at rest. A
  host that wants the previous `compact` density authors
  `chrome.table.cellPaddingCompact`.
- `BrandTableChrome`. An authored `cellPadding` also lowers to
  `--ds-density-cell-padding` at the tenant scope. A standalone table with that
  value renders as before. A tenant or preview scope nested inside a density
  container now keeps it, where the container's preset used to win.
- `FormFieldProps`. Modern generated IDs move from `formfield-${name}` to
  `formfield-${name}-${React.useId()}`, so they stay unique per instance and are
  opaque: code that selects `#formfield-<name>` must stop. The visible label names
  the first direct control through `aria-labelledby` unless that control names
  itself. The `name` JSDoc no longer claims an `id` on the wrapper, which never
  carried one.
- `Grid` is now a `forwardRef` wrapper that resets the adaptive track limit at each
  public root. Inside a Modern Grid, public `Grid.Item` clamps an automatic column
  span to that limit after measurement; anchored placement keeps its lines. Its
  props type is unchanged.

Additive:

- `FileManagerPathSegment` is a new root type export.
- `OTPInputProps` and `SliderProps` gain optional members. Only the Modern engines
  were changed to honor them.
- `UploadProps` gains the same kind of optional members, honored only by Modern.
  With no new prop involved, the Modern `picture-card` and `picture-circle` add
  button also moved: a component or interactive child no longer sits inside
  `<label role="button">`. The add button is a `<span>`, passive when that child is
  interactive and `role="button"` once a decorative component child has been
  measured. Text, plain non-interactive elements and the default icon keep the label.

Public type changed:

- `FileManagerProps.currentPath` accepts `FileManagerPathSegment` elements as well
  as strings, and string elements are deprecated. Code that passes `string[]` is
  unaffected. Code that reads `FileManagerProps['currentPath']` as `string[]`, or
  one element as `string`, no longer compiles and must handle segments.
- `PatternFileManager` follows those props. Classic, Rustic and the custom engine
  refuse a segment path by name, and Modern refuses an invalid segment, in
  development and production. String-only paths keep every route they had.

```contract-diff
signature ./server#TENANT_THEME_COMPILER_VERSION — moves from `tenant-theme-compiler@4` to `tenant-theme-compiler@5`, also published at `.`; an `@4` artifact is refused at every admission door until the host recompiles the stored document; bump carried by `d5b-workspace-frame-namespace.md` (88fd89604)
signature .#BrandShellChrome — documentation only: JSDoc names the shell channel each field compiles to; members and types unchanged (88fd89604)
signature .#BrandTableChrome — members and types unchanged; `cellPadding` also lowers to `--ds-density-cell-padding` at the tenant scope, so a tenant or preview scope nested inside a density container now keeps it, and JSDoc states the order (88fd89604)
signature .#CollectionWorkspaceProps — documentation only: `density` JSDoc states how the inline `--ds-density-cell-padding` ranks against tenant table padding; members, types and this surface's code unchanged (88fd89604)
signature .#DataTablePatternProps — `density` type unchanged; standalone Modern `compact` with no authored padding now renders `0.5rem 0.75rem`, not the base theme's `0.75rem 1rem`; JSDoc also corrects `comfortable` and `spacious` to the `0.75rem 1rem` they already rendered (88fd89604)
export .#FileManagerPathSegment — added: `{ readonly id: string; readonly name: string }`, the breadcrumb segment whose `id` an ancestor crumb hands to `onNavigate` (1014c24ff)
signature .#FileManagerProps — `currentPath` widens from `string[]` to a readonly array of strings or `FileManagerPathSegment`, and string elements are deprecated; passing `string[]` still compiles, reading the prop as `string[]` does not (1014c24ff)
signature .#PatternFileManager — props follow the widened `FileManagerProps`; Classic, Rustic and custom refuse a segment path by name and Modern refuses an invalid segment, in development and production; string-only paths keep every route (1014c24ff)
signature .#FormFieldProps — members and types unchanged; Modern generated IDs move from `formfield-${name}` to `formfield-${name}-${React.useId()}`, the visible label names the first direct control through `aria-labelledby`, and JSDoc states the binding and drops the wrapper `id` it wrongly claimed (51294e2f2)
signature .#Grid — now a `forwardRef` wrapper around the engine component that resets the adaptive track limit at each public root, and public `Grid.Item` clamps an automatic column span to the adaptive track limit of a Modern Grid; props type equal to the base (ec3077cea, 3546f9d1d)
signature .#OTPInputProps — gains optional `aria-label`, `aria-labelledby`, `aria-describedby` and `aria-invalid`, honored by the Modern engine; additive (51294e2f2)
signature .#SliderProps — gains optional `id`, `aria-labelledby`, `aria-describedby` and `aria-invalid`, honored by the Modern engine, and `aria-label` JSDoc now states that range mode names the group; additive (51294e2f2)
signature .#UploadProps — gains optional `id`, `aria-label`, `aria-labelledby`, `aria-describedby` and `aria-invalid`, honored by the Modern engine; Modern `picture-card` and `picture-circle` no longer wrap a component or interactive child in `<label role="button">`, and the add button is then a `<span>` (51294e2f2)
```
