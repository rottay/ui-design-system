---
"@rottay/design-system": minor
---

WO-RET-01. Five rows of the consumer contract named WO-CAN-03 as the work order
that adjudicates their retirement. That work order is done, so the rows named
nobody. Each row now carries a disposition that someone holds.

`./styles/bithire` and `./styles/evnto` become `guaranteed`: each has a measured
product consumer (`app-bithire/src/app/globals.css:21`,
`app-evnto/src/app/globals.css:9`). `@rottay/no-unsanctioned-ds-subpath` stops
reporting imports of those two subpaths. `./styles/rottay`, `./styles/modern`
and `./dist/*.css` stay `retire-by` and are still reported; the work order named
in the message is now WO-RET-01.

No subpath was added or retired and every target is unchanged. The summary of
the contract document restates the split: 21 `guaranteed`, 18
`retire-by WO-RET-01`, 1 `lab`, 40 published.

The consumer census now enforces these dispositions: a published subpath with no
import consumer needs a verified attribution or a `lab` / `retire-by`
disposition naming an open work order, and a row naming a closed work order
fails. The consumer migration packets gain note X-07: the applications'
`scripts/ds-supplier-honesty.mjs` reads the installed package by filesystem path
and breaks on 3.0; the note states what breaks and the supported path.

```contract-diff
signature ./eslint#PUBLISHED_SUBPATHS — five rows change: ./styles/bithire and ./styles/evnto become { disposition: 'guaranteed', retiredBy: null }; ./styles/rottay, ./styles/modern and ./dist/*.css keep 'retire-by' with retiredBy 'WO-RET-01'; the other 35 rows and their order are unchanged
subpath ./styles/bithire — disposition retire-by (WO-CAN-03, done) becomes guaranteed; measured consumer app-bithire src/app/globals.css:21
subpath ./styles/evnto — disposition retire-by (WO-CAN-03, done) becomes guaranteed; measured consumer app-evnto src/app/globals.css:9
subpath ./styles/rottay — retire-by now names WO-RET-01 instead of the closed WO-CAN-03; no importer; designated replacement of the removed ./styles/platform
subpath ./styles/modern — retire-by now names WO-RET-01 instead of the closed WO-CAN-03; no importer; engine-bundle door
subpath ./dist/*.css — retire-by now names WO-RET-01 instead of the closed WO-CAN-03; its one importer (app-platform src/app/globals.css:14) names dist/platform.css, which is no longer built
```
