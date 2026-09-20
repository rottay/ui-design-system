---
"@rottay/design-system": patch
---

Tree's node padding has ONE producer in Modern: the tree deriver.

`presentation/components/tree/index.css` declared `--ds-tree-node-padding:
4px 8px` at `:root`, where it headed the Modern skin's row chain as the FIRST
`var()` and so shadowed the dial-bearing fallback behind it. Measured, that
made `tree` a rhythm NON-MOVER in every cell the `axis-difference` probe reads
— 0/1 in all three verticals, both modes — and left the family with two
disagreeing authorities: the row part painted the legacy `4px 8px` while the
`.rottay-tree-node` compound painted the deriver's
`--ds-tree-node-padding-block/-inline`.

The legacy shorthand is now declared on `.ant-tree` instead of `:root`. That
selector is an ancestor-or-self of every element the one rule still reading it
can match (`html[data-tenant] .ant-tree .ant-tree-treenode`), so the frozen
Classic engine resolves the identical value and nothing is left with an
unresolvable `var()`. The Modern skin's row part now reads the deriver's two
channels, and the Modern theme bridge's `padding` declaration — which was
silently outranking the skin's own `.rottay-tree-node` rule — is drained; its
colour and motion channels stay.

DECLARED VISUAL CHANGE, measured in Chromium on the composed bundle, at rest,
per vertical and mode. Modern tree rows and node wrappers converge onto the
value the node compound already painted:

| vertical | before (block/inline) | after | cause |
| --- | --- | --- | --- |
| bithire | 4px / 8px | 2.996px / 5.993px | `density.mode: compact` finally reaching tree rows |
| evnto | 4px / 8px | 3.75px / 7.5px | the deriver's rung is `0.25rem`/`0.5rem` on a 15px fluid root, not a 16px-era px literal |
| rottay | 4px / 8px | 3.75px / 7.5px | same |

Classic's `.ant-tree-treenode` stays `4px 8px` in all six cells, and the node
compound is byte-identical — it was already on the deriver. `tree` now reads
1/1 = 100 % on the rhythm axis in all six cells, with the palette negative
control still at 0 %.

Consequence, named: a tenant can no longer retune Classic's tree rows by
declaring `--ds-tree-node-padding` at the tenant root, because an
element-level declaration outranks an inherited one. Classic is frozen and no
first-party artifact declares that name.
