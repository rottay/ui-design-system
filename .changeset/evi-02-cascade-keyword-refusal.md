---
"@rottay/design-system": minor
---

WO-EVI-02 residual: the productive token resolver now REFUSES a cascade-wide
keyword instead of passing it off as a leaf. `UnresolvedToken["reason"]` gains
a seventh member, `cascade-keyword`.

**The defect.** `--ds-collection-header-overline-family` is deliberately
`inherit` — a prior lot's written finding, since the retired inline read
resolved to inherit in every shipped context, so inherit is the honest resting
fallback in the collection-header skin. The emitter was handing that value to a
JSON consumer as `{ kind: "keyword", value: "inherit" }`. A cascade-wide keyword
is an instruction to the cascade, not a value: a browser holding an element tree
knows exactly what to do with it, and a consumer reading a resolved document has
no element tree and can do nothing at all. Stating it as an actionable leaf was
a lie in the document's own terms — the same terms under which `unit-mix` and
`unevaluable` already refuse rather than guess.

**It is a class fix, not a one-channel fix.** The refusal is on the closed CSS
roster (`inherit`, `unset`, `revert`, `revert-layer`), tested over every leaf of
every document rather than over one channel name, so the next channel that
resolves to a keyword is refused on arrival instead of needing a second finding.
A keyword reached through a fallback (`var(--absent, inherit)`) takes the same
path: what a consumer can act on is a property of the FINAL value, not of how it
was reached. A keyword inside a LARGER value (`1px solid inherit`) is a
different class and is deliberately NOT claimed — guessing there would be
inventing; the tree has zero such cases today and the drill pins that.

**`initial` keeps its stricter name.** It is a cascade-wide keyword too, and is
admitted to the roster and never produced under it: a custom property declared
`initial` is guaranteed-invalid, which is the stronger statement and additionally
says what the consuming reference's fallback does. Reclassifying it would have
moved the 24 material rows that already carry the better name.

**Substitution is untouched.** The refusal is declared beside the resolved text,
which is unchanged, so the resolved-map zero-delta law does not move: no channel
changed its resolved value, the compiled CSS artifacts are byte-identical, and
the whole delta is six new `unresolved` rows — one channel across the three
verticals' two scopes each.

**The instrument mirrors the productive semantics rather than keeping its own
grammar.** The cascade drill used to assert that the tree contained ZERO
cascade keywords, because it had no model for them; it now binds the productive
`isCascadeWideKeyword` out of `dist/` — alongside the resolver it already binds
— and asserts that every one it finds is refused under the reason the resolver
assigns it. One implementation, one semantics, no second roster to drift.

```contract-diff
signature ./server#UnresolvedToken — `reason` widens with the `'cascade-keyword'` member (additive union): a channel whose resolved value is exactly one CSS-wide keyword is recorded in `unresolved` instead of emitted as a `{ kind: 'keyword' }` leaf. A consumer that switches exhaustively over the reason gains a case; one that reads the field as a label is unaffected
```

No export was added or retired, no subpath moved, and no other signature
changed. Consumer impact is nil by measurement: the channel was unusable to a
document consumer under either spelling, and it is the tree's only member.
