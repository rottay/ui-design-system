---
"@rottay/design-system": patch
---

Correct the `allowSubpaths` schema description of `@rottay/no-unsanctioned-ds-subpath`: its baseline example named `./icons/presets/bithire`, which the consumer contract guarantees and the rule never reports, and now names `./icons/roles/data-sync`, a `retire-by` subpath the rule reports unless the app lists it. No option, schema shape, message or rule behaviour changes.

```contract-diff
signature ./eslint#rules — documentation only: the `allowSubpaths` description of `no-unsanctioned-ds-subpath` cites `./icons/roles/data-sync` (retire-by) as its baseline example instead of the guaranteed `./icons/presets/bithire`; schema shape and rule behaviour unchanged
```
