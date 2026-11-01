---
"@rottay/design-system": major
---

## The workspace frame owns its ground, border and elevation names

`:where(.ds-workspace-frame)` now declares `--ds-workspace-frame-{bg,border,shadow}`
on the frame and paints from them. Each name forwards the matching
`--ds-workspace-shell-*` tenant door at the frame's own rest: `transparent`,
`var(--ds-color-border)` and `var(--ds-card-shadow)`. The `--list` and `--form`
variants declare `--ds-workspace-frame-bg` with the gradients they declared
before, and no longer declare `--ds-workspace-shell-bg`. The `::before` wash still
reads the one shared `--ds-workspace-shell-overlay`.

The tenant contract does not change. `chrome.shell.{bg,border,shadow,overlay}`
(`BrandShellChrome`, `TenantThemeShellChrome` through `./server`) keeps its field
names, schema admission and iso shape, and compiles to the same four shell names.
The compiler writes no frame name.

## `tenant-theme-compiler@5`

`TENANT_THEME_COMPILER_VERSION` moves from `tenant-theme-compiler@4` to
`tenant-theme-compiler@5`. The version is inside the artifact digest, so every
artifact digest, ETag and `{ tenantId, rowVersion, compilerVersion }` key changes
for every tenant. An artifact written by `tenant-theme-compiler@4` is refused
before use at every admission door, with an instruction to recompile the tenant's
stored document and republish the artifact. Stored documents are not edited. The
host owns the recompile.

Against the last commit on `tenant-theme-compiler@4`, the same document keeps
`variables`, mode deltas and the CSS body byte-identical, with one exception. A
document that authors `chrome.table.cellPadding` also emits
`--ds-density-cell-padding` with the authored value, beside the
`--ds-table-cell-padding` it already emitted. That adds one entry to `variables`
and one line to the CSS body. No stored document can state chrome per mode, so no
stored document's mode deltas move. The version string and this one write are the
only code changes that reach the output. This compares two compiles of one
document, not a recompile with a stored artifact, which can differ by more. The
guide says why.

Consumer impact: app-bithire reads `--ds-workspace-shell-bg` on
`.ds-workspace-frame--list` / `--form` (`src/styles/surfaces.css:23-28`,
`:34-40`). After adoption it must read `--ds-workspace-frame-bg` there, or those
two variants repaint. Its base frame read (`:15-18`) must stay on
`--ds-workspace-shell-bg`. Its architecture test
`tests/architecture/_shared/shared-card-artifact-cascade.arch.test.ts:58` asserts
the old read, so the app owner either retargets that assertion or uses the chained
read the guide gives.

Consumer impact: `@rottay/tenancy` owns a separate literal of this identity, and
app-platform compares the two, with the document and config schema digests, before
its theme contract, preview, draft, publish and rollback operations. Recompiling
does not clear that check. app-platform adopts this release only with a
`@rottay/tenancy` release that matches the DS on `tenant-theme-compiler@5` and both
schema digests, which the release owner and the Tenancy owner decide. Tenancy's
source already differs from the DS's on all three values before this release: its
literal is `tenant-theme-compiler@3` against `tenant-theme-compiler@4`, and both
digests differ, so the pair needs a schema resync. The installed pair
(`@rottay/tenancy` 6.0.2 with `@rottay/design-system` 2.19.37) is unmeasured.

See `packages/core/docs/consumer-contract/migration/workspace-frame-namespace/index.md`.
