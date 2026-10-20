---
"@rottay/design-system": patch
---

The theme `population` check recognizes a reviewed shape exclusion across the
carrier class door, so pairing a reviewed rule with its class twin no longer
returns the family to an axis the review withdrew (ARC-12 M-P3, pin micro-lot
PM-P14 before Wave C lot LC14; no public surface, no door, no skin and no TSX
change). A reviewed declaration now matches a rule whose whole selector list is
exactly its reviewed selector S, exactly the ordered pair `S, C`, or exactly C,
where C replaces each `[data-part='p']` of S by `.ds-<family>__p`. Context,
property and value still match verbatim, and the entry stays bound to its family,
axis and skin. C is derived only from a restricted grammar (classes, quoted
plain part identifiers, a final `::before`/`::after`, descendant or `>` `+` `~`
combinators) and only when S carries the family's own block as a class; any other
selector keeps its HEAD behaviour and has no twin. The registry, its revision,
the floor, the pilot pin and `cssRules` are unchanged. The law applies to all
seven reviewed declarations; a lot that arms one of them still owes its own
own-element, mount, specificity and cascade proofs. Eighteen tests cover HEAD
identity, the derivation and its sixteen unsupported shapes, the armed pair and
class-only forms, non-vacuity, and value, width, context, variant, widening,
foreign-block, part, member, duplicate, order and ownership negatives.
