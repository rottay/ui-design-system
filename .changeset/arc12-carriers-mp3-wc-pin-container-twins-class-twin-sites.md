---
"@rottay/design-system": patch
---

The container-query gate's self-referential check counts a class twin once.
Inside one rule, a branch that only spells the live site's one
`[data-part='p']` as `.X__p` (X a class the site already carries), declared by
the same twin pair of one declaring rule, is that site: it is reported as a
collapsed class twin under the site's ledger id instead of failing as a new
site, and the gate prints every collapse. A twin alone, in another rule,
reordered, widened, narrowed, with another scope or part, a changed combinator,
a non-exact part token, an ambiguous pairing or a pseudo-element is judged
exactly as before. The ledger, the dead-name and viewport checks, and the
ancestor and pseudo-element rules are unchanged; no public surface, door, skin
or TSX change (ARC-12 class-C pin before the FU-F11R functional commit). Eight
tests cover the collapse in both branch orders, repeated rules and ordinals,
the post-strip twin, same-line rules, facts without rule identity, the
declarer pair, ambiguity and the CLI report.
