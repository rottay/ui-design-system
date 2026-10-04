---
"@rottay/design-system": minor
---

WO-RET-01. Sixteen rows of the consumer contract named WO-RET-01 as the work
order that adjudicates their retirement. Each now carries the disposition the
owner-adopted amendment of 2026-10-03 gives it.

Five become `guaranteed`, each on measured or structural evidence:
`./icons/presets/bithire` (app-bithire source and tests),
`./hooks-manifest` (app-bithire, one test import),
`./tenant-theme-canary-fixtures` (app-bithire source and tests, and the
showroom), `./supplier-contract` and `./supplier-honesty-cli` (structural
admission verified by the consumer census on every run: the three applications
run `scripts/ds-supplier-honesty.mjs` in their test chain).
`@rottay/no-unsanctioned-ds-subpath` stops reporting imports of those five.

Eleven stay `retire-by` and are still reported; the work order named in the
message is now WO-RET-06, which carries per door its admitting consumer, its
retiring changeset row and its dependency: `./marks/brand`, `./marks/cloud`,
`./icons/roles/*`, `./icons/foundation`, `./icons/identity`,
`./icons/intelligence`, `./icons/operations`, `./pictograms`, `./styles/rottay`,
`./styles/modern`, `./dist/*.css`.

No subpath is added or retired by this change and every target is unchanged.
The showroom no longer imports the four icon pack doors; it renders the same
roles through `Icon` from `./icons`, and its lint allowlist drops them together
with `./tenant-theme-canary-fixtures`, which no longer needs one.

```contract-diff
signature ./eslint#PUBLISHED_SUBPATHS — sixteen rows change: five become { disposition: 'guaranteed', retiredBy: null }; eleven keep 'retire-by' with retiredBy 'WO-RET-06' instead of 'WO-RET-01'; the other rows and their order are unchanged
subpath ./icons/presets/bithire — disposition retire-by (WO-RET-01) becomes guaranteed; measured consumer app-bithire (source and tests)
subpath ./hooks-manifest — disposition retire-by (WO-RET-01) becomes guaranteed; measured consumer app-bithire tests/unit/lib/theme/app-theme-authority.unit.test.ts
subpath ./tenant-theme-canary-fixtures — disposition retire-by (WO-RET-01) becomes guaranteed; measured consumers app-bithire (one source module, two tests) and the showroom (two source modules, one script)
subpath ./supplier-contract — disposition retire-by (WO-RET-01) becomes guaranteed; structural admission verified by the consumer census in the three applications
subpath ./supplier-honesty-cli — disposition retire-by (WO-RET-01) becomes guaranteed; structural admission verified by the consumer census in the three applications
subpath ./marks/brand — retire-by now names WO-RET-06 instead of WO-RET-01; no importer
subpath ./marks/cloud — retire-by now names WO-RET-06 instead of WO-RET-01; no importer
subpath ./icons/roles/* — retire-by now names WO-RET-06 instead of WO-RET-01; no importer
subpath ./icons/foundation — retire-by now names WO-RET-06 instead of WO-RET-01; no importer (the showroom migrated to Icon from ./icons)
subpath ./icons/identity — retire-by now names WO-RET-06 instead of WO-RET-01; no importer (the showroom migrated to Icon from ./icons)
subpath ./icons/intelligence — retire-by now names WO-RET-06 instead of WO-RET-01; no importer (the showroom migrated to Icon from ./icons)
subpath ./icons/operations — retire-by now names WO-RET-06 instead of WO-RET-01; no importer (the showroom migrated to Icon from ./icons)
subpath ./pictograms — retire-by now names WO-RET-06 instead of WO-RET-01; its one importer is a showroom probe
subpath ./styles/rottay — retire-by now names WO-RET-06 instead of WO-RET-01; no importer
subpath ./styles/modern — retire-by now names WO-RET-06 instead of WO-RET-01; no importer
subpath ./dist/*.css — retire-by now names WO-RET-06 instead of WO-RET-01; its one importer (app-platform src/app/globals.css) names dist/platform.css, which is no longer built
```
