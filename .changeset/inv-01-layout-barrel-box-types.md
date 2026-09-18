---
"@rottay/design-system": minor
---

WO-INV-01 L7 residual, second half: the layout barrel stops dropping four of
Box's type names, so the package root publishes the vocabulary the family index
already exported.

`components/primitives/layout/index.ts` re-exports an ENUMERATED name list from
`./box`, and that list had not been revisited since before the alignment cut or
the motion prop landed. It carried `BoxProps`, `BoxSpacing`, `BoxBorderRadius`,
`BoxShadow`, `BoxDisplay`, `BoxPosition` and `BoxOverflow`, and silently dropped
`BoxMotion`, `BoxTextAlign`, `BoxTextAlignInput` and
`LegacyPhysicalBoxTextAlign`. An enumerated re-export is the one shape where an
omission is invisible: the props still typecheck, so nothing goes red, and the
reader discovers the gap only when they try to NAME the union.

```contract-diff
export .#BoxMotion — added
export .#BoxTextAlign — added
export .#BoxTextAlignInput — added
export .#LegacyPhysicalBoxTextAlign — added
```

WHY MINOR, measured rather than assumed. The sibling changeset
`inv-01-box-text-align-types.md` is correctly a patch: it added the three
alignment names to the FAMILY index, which no published subpath reaches, and
the surface derivation reported zero declarations changing shape. This change
edits the same class of file and gets the opposite verdict, because this barrel
IS on the root's re-export chain: over it the `contract-changeset` derivation
reports `.#BoxMotion`, `.#BoxTextAlign`, `.#BoxTextAlignInput` and
`.#LegacyPhysicalBoxTextAlign` as added on `.`. Four names arrive at a subpath
an application imports; that is an addition, and an addition is a minor. It
also discharges the residue that changeset registered by name.

WHY `BoxMotion` TRAVELS WITH THEM. It was evaluated on its own evidence, not
swept in. `motion` is a live behavioural prop: the Modern engine reads it at
render, resolves `--ds-transition-resize` / `--ds-transition-rearrange` into the
inline transition and stamps `data-layout-motion`. Its omission from this list
is documented nowhere, guarded by nothing, and is the same defect as the
alignment one -- a caller can write `motion="resize"` but cannot name the union
to type a wrapper over it. Publishing the prop and withholding its domain is not
a narrower API, it is an API a caller has to re-spell by hand.

NAMED RESIDUE, not fixed here. `FlexMotion`, `StackMotion` and `GridMotion` are
each exported by their own family index and each dropped by this same barrel, so
three sibling families still publish a motion prop whose domain the root cannot
name. That is one gap per family outside this lot's box-area write set; it is
registered rather than taken, so the fix arrives with the family that owns it.
