---
"@rottay/design-system": minor
---

WO-FAM-09 (owner resolution R3). The categorical chart vocabulary is now
twelve slots, declared once in `charts/foundation/palettes`
(`CHART_SCHEME_LITERALS`); the four former copies (TS fallbacks, both CSS
modes, the generated paint bridge) are views or regenerations of the one
table. Slots 1–10 are byte-identical in every scheme and mode; slots 11/12
are derived through each scheme's own OKLab chain (maximized minimum distance
inside the scheme's envelope, ≥3:1 on the representative surfaces), never
repeats of 1/2. `CHART_CATEGORICAL_SIZE` is 12 (was 10) and
`DEFAULT_COLORS`/`ACCESSIBLE_COLORS` are now `readonly` views of the table
(lowercase hex — no production consumer compares case). Series beyond 12
cycle deterministically in the resolver alone; scatter's second, hidden
modulus is removed.

Migration note: categorical families now stamp `data-series-index="10"` and
`"11"` — a consumer with its own per-slot CSS for indices 0–9 (one measured
in app-bithire) needs the two extra rules on its next DS upgrade. Branded
tenant documents keep their ten `--ds-chart-category-*` slots until the
adoption lot extends the tenant allowlist; slots 11/12 resolve from the DS
scheme chain meanwhile.
