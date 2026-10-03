---
"@rottay/design-system": minor
---

WO-RET-01. The consumer contract gains a fourth disposition, `lab`, for a
published subpath that is experimental. A `lab` subpath stays in `exports` and
is importable, but it is not counted as productive or certified surface: it is
not `guaranteed`, and it names the work order that owns it in the same table
cell a `retire-by` row uses. Its review line lives in `package.json`
`releaseSync.lab`, keyed by subpath, as `{ owner, reviewBy }`, where `reviewBy`
is a `major.minor` release line later than the package version.

`@rottay/no-unsanctioned-ds-subpath` reports an import of a `lab` subpath with
the new `lab` message, which names the status and the owner, unless the
consuming configuration lists that subpath in `allowSubpaths`. Imports of
`guaranteed`, `retire-by`, `forbidden` and unlisted subpaths are reported
exactly as before.

One subpath takes the new disposition: `./spatial` moves from `retire-by`
(WO-RET-01) to `lab`, owner WO-CRA-15, review line 4.0. It stays published and
resolves to the same module. Importing it was reported before and is still
reported, now with the `lab` message, unless the consuming configuration
allow-lists it; the showroom already does. The summary of the contract document
restates the split: 19 `guaranteed`, 15 `retire-by WO-RET-01`, 5
`retire-by WO-CAN-03`, 1 `lab`, 40 published.

No subpath was added or retired, every import that passed before still passes,
and every import that was reported is still reported unless it is allow-listed.
A consumer that switches exhaustively over `SubpathDisposition` gains one case
to handle, and one that reads `PUBLISHED_SUBPATHS` sees the `./spatial` row
change.

```contract-diff
signature ./eslint#SubpathDisposition — adds 'lab': a published, experimental subpath that is not counted as productive or certified; its import is reported unless the subpath is listed in allowSubpaths
signature ./eslint#ContractRow — retiredBy also names the owner work order of a lab row, whose review line is recorded in package.json releaseSync.lab; the field keeps its name and type
signature ./eslint#PUBLISHED_SUBPATHS — the ./spatial row is now { disposition: 'lab', retiredBy: 'WO-CRA-15' }; the other 39 rows and their order are unchanged
subpath ./spatial — disposition retire-by (WO-RET-01) becomes lab, owner WO-CRA-15, reviewBy 4.0; still published; importing it is reported unless allow-listed (the showroom already allow-lists it)
```
