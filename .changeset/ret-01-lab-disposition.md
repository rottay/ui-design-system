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

Additive only: no subpath was added or retired, every import that passed
before still passes, and every import that was reported is still reported
unless it is allow-listed. A consumer that switches
exhaustively over `SubpathDisposition` gains one case to handle.

```contract-diff
signature ./eslint#SubpathDisposition — adds 'lab': a published, experimental subpath that is not counted as productive or certified; its import is reported unless the subpath is listed in allowSubpaths
signature ./eslint#ContractRow — retiredBy also names the owner work order of a lab row, whose review line is recorded in package.json releaseSync.lab; the field keeps its name and type
```
