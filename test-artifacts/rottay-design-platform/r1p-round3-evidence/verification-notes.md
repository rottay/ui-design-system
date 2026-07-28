# Verification Notes — Round 3

Date: 2026-07-27. All analysis against frozen snapshots (see `methodology.md` for SHA256
table). No repo file was modified; no artifact regenerated; no build/typecheck/test/gate/
server executed against the repos. The only executions were read-only analysis scripts in
this directory (postcss 8.5.10 `require()`d read-only from
`ui-design-system/packages/core/node_modules/postcss`).

## What was verified, and how

| Claim | Verification | Result |
| --- | --- | --- |
| Snapshot artifacts correspond to their sources | Re-rendered each artifact from `dist` compileBrandTheme output + snapshot `_source/extension.css` through the real `renderVerticalArtifact` (same code path as `build-vertical-artifacts.mjs`), byte-compared | **Byte-identical, SHA256 equal, all 3 verticals** (`{v}-overlap.json → correspondence.fullArtifactReproduction`) |
| No staleness from concurrent WIP | `find src -type f -newermt "2026-07-27 06:12"` over packages/core/src → 0 hits; plus the byte-identical re-render above | **No staleness** (`scripts/composition-map.md §4`) |
| Extension embedded verbatim? | Not verbatim: `projectFirstPartyArtifactScopes()` rewrites `html[data-tenant='slug']` compounds in rule preludes to `:is(html[data-tenant='slug'], :where([data-ds-root][data-vertical='key']))`; values/comments/strings untouched | Transformation documented (`correspondence.transformation`) |
| Declaration extraction | postcss AST `walkDecls()` with parent walk for selector + at-rule chain; line offsets preserved so artifact line numbers are absolute | `scripts/extract-declarations.mjs`; every count reconstructible from the three JSONs |
| Overlap counts | Name-set intersection per vertical, then per-declaration records kept for all shared names | bithire 188 / evnto 82 / rottay 267 (`counts` in each JSON) |
| Independent cross-check of the intersection | A separate agent split the concatenated artifacts at the extension banner and diffed name sets (different method, different operator) | Same intersections: 188 / 82 / 267 |
| Cascade winners per root state | Specificity scoring of the compiled block's selector arms vs every extension declaration of each shared name, per state (default/light/dark), `:is()` = max-of-list static | `cascadeByState` in each JSON; corroborated at bundle level by the styles/bithire.css census (223 identical-selector duplicate groups) |
| color-scheme contradiction | AST extraction of every `color-scheme` declaration in source + artifact | bithire `_source/extension.css:376` (`dark`) vs `:647` (`light`), byte-identical selector, lastWins=light; absent in evnto/rottay (`contradictionCheck`) |

## Deltas vs Codex's provisional numbers (BitHire)

| Metric | Codex | Round 3 (AST) | Explanation |
| --- | --- | --- | --- |
| Compiled unique vars | 1024 | 1024 | Exact match; also equals the compiler's own output count (`compiledVarCountFromCompiler: 1024`) |
| Extension unique vars | 576 | **575** | Codex's flat regex counted `--clickable` from the SELECTOR `.rottay-tag--clickable:hover` (extension.css:3332) as a custom property. AST has no such declaration. The delta is a regex false positive — a concrete instance of law L1 (no grep as semantic evidence). (`regexArtifacts` in bithire-overlap.json) |
| Shared names | 188 | 188 | Exact match |
| light subset | 14 | 14 | Exact match (mode=light by selector) |
| dark subset | 114 | 114 | Exact match when defined as the `BITHIRE DARK MODE` banner section; note the dark-by-SELECTOR count is 154 (includes the clear-guard block, which also uses the dark selector) — the two definitions must not be conflated |
| clear guard subset | 83 | **79** | Banner-section attribution (nearest preceding root-level `====` banner). Codex's bucket definition is unavailable; the Δ4 is method-dependent. Our definition and per-name membership are in `bucketCounts`/`buckets` of the JSON, so the 79 is reconstructible; the 83 is not (no published method). |
| production guardrails | 48 | 48 | Exact match |

Codex's core finding is CONFIRMED in substance and extended: the overlap exists in all
three verticals (Rottay is the worst at 267, with its compiled block additionally inert in
the default state), not only BitHire.

## What was NOT verified (UNKNOWN stays UNKNOWN)

- **DOM/computed-style winners.** No browser was run (session constraint). All cascade
  winners are static selector/order analysis; final confirmation is Codex R2 sighted work.
  Probe spec in `source-to-runtime-trace.md`.
- **Reachability of Evnto dark and Rottay light states in their apps** — adjudicated only
  to the level recorded in `classification.json` (bounded grep for writers); anything
  ambiguous is classified I, not C.
- **Codex's clear-guard=83 bucket definition** — unavailable; we publish ours instead.
- **The prior R1 evidence bundle** (`/private/tmp/rottay-design-platform-independent-audit/`)
  no longer exists (host reboot reaped /private/tmp before this round; dir timestamps show
  13:09 today). R1 methodology statements are sourced from the official doc's
  self-descriptions only. This loss is recorded as an evidence-governance finding.

## Scratch files in this directory

`compiled.txt`, `ext.txt`, `overlap.txt`, `app-rt.txt`, `ds-rt.txt` are intermediate agent
outputs retained for reproducibility; the authoritative data is the three `*-overlap.json`
files plus `classification.json`. Scripts: `scripts/extract-declarations.mjs`,
`scripts/cascade-by-state.mjs`, `scripts/reproduce-artifact.mjs` (all read-only).

## Session hygiene confirmations

- `ui-design-system`, `app-bithire` (and all other repos): zero writes, zero git-state
  changes, zero builds/tests/servers from this session. Only reads and read-only scripts.
- Writes confined to: this directory and
  `docs-engineering/archive/audits/2026-07-26-ds-modern-whitelabel-independent-audit-davila.md`
  (append-only Round 3 section).
- No commit, push, PR, publish, or tag anywhere.
