---
"@rottay/design-system": patch
---

WO-INV-01 L7 residual: the Box family index re-exports the alignment
vocabulary it migrated. `BoxTextAlign`, `BoxTextAlignInput` and
`LegacyPhysicalBoxTextAlign` are now named by
`components/primitives/layout/box/index.ts` alongside `BoxProps` and the rest
of the family's types.

Without them the family index published a `BoxProps` whose `textAlign` a reader
could satisfy structurally but could not NAME. A caller writing a helper over
the prop -- a wrapper component, a config table, a mapper from a domain
alignment to a Box one -- had to spell the union out again by hand, and a
hand-copied union does not follow the deprecation: when `left` / `right` are
finally dropped, the copy keeps accepting them and keeps pinning text to a
physical edge under RTL, which is the exact defect L7 removed.

Types only. `BOX_TEXT_ALIGN_ALIASES` and `normalizeBoxTextAlign` stay unexported
from the family index: the normalization is applied ONCE, at the Modern
engine's style boundary, and a second public caller of it would be a second
place the aliases get resolved.

WHY PATCH AND NOT MINOR, measured rather than assumed. No published subpath
gains a symbol. `./primitives/box` publishes `{ Box }` alone, and the root `.`
reaches this family through `components/primitives/layout/index.ts`, which
re-exports an ENUMERATED list of names from `./box` -- `BoxProps`,
`BoxSpacing`, `BoxBorderRadius`, `BoxShadow`, `BoxDisplay`, `BoxPosition`,
`BoxOverflow` -- and therefore drops these three, exactly as it already drops
`BoxMotion` (verifiable in `dist/components/primitives/layout/index.d.ts`,
which carries `BoxMotion` in `box/index.d.ts` and not in its own line). The
`contract-changeset` surface derivation agrees: over this change it reports the
path as `library`, with zero published declarations changing shape, so this
changeset carries no `contract-diff` block -- a row here would name a symbol
the package does not publish.

NAMED RESIDUE. The logical alignment vocabulary is therefore importable from
the family index but not yet from `@rottay/design-system`, while
`docs-engineering/.../components/primitives/layout/README.md` already lists
`BoxTextAlign` and `BoxTextAlignInput` under Box's Types. Closing that gap is
one line in `components/primitives/layout/index.ts`, which is outside this
lot's write set; it is a public-surface addition (minor) and is registered for
the DT rather than taken here.
