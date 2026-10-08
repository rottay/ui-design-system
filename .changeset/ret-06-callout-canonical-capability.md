---
"@rottay/design-system": patch
---

WO-RET-06, companion lot of the owner's dated disposition D-A (2026-10-07) for
`Callout`, row 25 of the frozen group (added by AM-1 v3, 2026-10-06). `Callout`
stops being a deprecation: it stays published with its exact props type and
engines, and is canonical for the engines that implement it. No frozen engine
file changes, and no behaviour changes on any engine.

- The `@deprecated` tag is removed from the `Callout` declaration; every other
  line of the file is kept as it was.
- Its `compat-frozen-sole-implementer` row leaves the deprecation ledger with its
  one app-evnto receipt; the dated audit record of that receipt is unchanged.
- The `member-changed/.#Callout` codemod entry stays: it predates the ledger and
  still reports each file that imports `Callout`, with the Modern `Alert` advisory.
  Only its `notice` (removal on the 4.0 line) is removed, and its `change` and
  `guidance` no longer call `Callout` deprecated or scheduled for removal. The
  four standing-register rows of that entry keep their file, count, class and
  proof, and the ceiling stays 25; only their `why` is restated.

On Modern, `Callout` is painted by Alert's callout presentation; the committed
parity test measures its markup equal to `<Alert emphasis="subtle" announce="tone">`
across 64 combinations, except that a title change re-opens a dismissed Alert.
Nothing is measured on Classic or Rustic, where `Alert` does not read `action`,
`emphasis` or `announce`. The capability row is documented in
`docs/consumer-contract/frozen-engine-capabilities`.

```contract-diff
signature .#Callout — loses the `@deprecated` tag (D-A); the component, `CalloutProps` and its engines are unchanged
```
