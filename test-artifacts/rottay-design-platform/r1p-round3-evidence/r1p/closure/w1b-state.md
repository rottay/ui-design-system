# W-1B — Application customization contract gate (Codex C3 / C6.6)

Status: COMPLETE. Gate GREEN on app-bithire, 30/30 drills pass, registered blocking in CI.

## Anchor decision (and why the literal C3 instruction was not followed)

C3 says "a public-hook allowlist generated from the supplier contract".
That is not implementable as written: `packages/core/supplier-contract.json` is the
npm SUPPLIER-REACHABILITY map (which external packages each entrypoint pulls in).
It contains zero CSS custom properties, and `generate-supplier-contract.mjs`
delegates to `deriveSupplierContract()` in `scripts/dependency-honesty.mjs` with
byte-exact schema invariants. Adding a CSS vocabulary to it would corrupt an
unrelated contract that another gate byte-diffs. So the allowlist is derived from
the DS sources that actually declare custom-property ownership. That substitution
is stated in the module header, not hidden.

No public-hook declaration existed in the DS before this work (searched
foundation/contracts, docs-engineering design-system tree, token trees; the only
"hooks" documentation is React hooks). The declaration point is created here, as
a DERIVATION over three authored anchors — never a hand-list.

### Three anchors (all authored DS source; none generated)

| # | Anchor | Path | Yield | Meaning |
|---|--------|------|-------|---------|
| A1 | tenant channel | `src/infrastructure/compilers/kernel/foundation/css/chrome-variables/index.ts` | 726 | assignment keys (`vars["--ds-card-bg"] = …`) — the governed white-label compiler writes these at `:root` per tenant |
| A2 | foundation tokens | `src/foundation/tokens/css/**` (authored) | 3498 | root-equivalent declarations in DS CSS — the DS owns the value |
| A3 | public hooks | A2 reads + `src/ui/**` `var()` reads, minus A1, minus A2 | 2821 | DS consumes the property but supplies no value = open extension point |

Rule: **a `--ds-*` property is a PUBLIC HOOK iff the DS reads it and neither the
tenant chrome channel nor a DS root declaration owns its value.** This is the
documented component-variable pattern (`var(--ds-{component}-{property},
var(--ds-{generic-fallback}))`) turned into a machine-checkable predicate.

### Circularity trap found and closed

`foundation/tokens/css/facade/artifacts/{bithire,evnto,rottay}/index.css` are BUILD
PRODUCTS that concatenate the vertical's own `_source/extension.css`. An early
derivation over the full tree classified `--ds-listing-grid-gap` and
`--ds-tabs-list-bg` as DS-owned purely because the bithire artifact had absorbed
them — i.e. an app could legalize any invented name by rebuilding the artifact.
Artifacts, fixtures and tests are excluded, and two drills lock that shut.

Two derivation bugs were found and fixed during implementation:
1. the artifact exclusion never fired (multi-segment pattern tested against a bare
   entry name) — 443 files scanned instead of 437;
2. the tenant-channel key regex could match CSS text inside a template literal
   (now requires a backreferenced closing quote).

## Classification of the 190 app-bithire `--ds-*` writes

The sibling boundary gate reports these 190 as SCOPED and legitimate by
construction. This gate reproduces the same 190 and splits them:

| Class | Count | Meaning |
|---|---|---|
| PUBLIC_HOOK_SCOPED | 44 | supported customization path |
| ROOT_EQUIVALENT | 0 | app authoring DS root state |
| UNKNOWN_HOOK | 146 | scoped, but the property is not a public hook |

UNKNOWN_HOOK by reason:

| reason | count | remedy |
|---|---|---|
| tenant-channel | 67 | white-label compiler owns it at `:root`; a scoped app write beats `:root` and overrides the tenant brand. Use the governed channel. |
| foundation-token | 58 | DS root-declares it; assigning it repaints every reader below the scope. |
| undeclared | 21 | DS neither reads nor declares it — namespace squatting; belongs in `--rt-*`. |

`--rt-*` writes: 2090, always legal, counted only.
Corpus: 906 stylesheets under `app-bithire/src`.

**So 146 of 190 (77%) of the writes the previous gate called legitimate are open
violations of the C3 contract.** ROOT_EQUIVALENT is genuinely 0 — the only
root-looking app selector, `:root[data-ds-root] :where(.rt-detail-actions)`,
declares onto the feature subject, not the root.

Spot-verified against source, not assumed:
- `--ds-signal-card-soft` → `chrome-variables/index.ts:1590` `vars["--ds-signal-card-soft"] = sc.soft`
- `--ds-listing-grid-gap` → `chrome-variables/index.ts:491`
- `--ds-command-grid-opacity` → `presentation/components/patterns.css:236`, inside the `:root {` block opened at line 15

Out of scope but recorded: 8 inline `--ds-*` writes in app-bithire `.tsx`.

## Drill table (30/30 pass)

| Drill | Expected | Result |
|---|---|---|
| unknown/undeclared property, scoped | RED (only UNKNOWN_HOOK) | pass |
| foundation token under feature scope | RED, reason `foundation-token` | pass |
| tenant-channel property under feature scope | RED, reason `tenant-channel` | pass |
| `html[data-tenant='bithire']` | RED ROOT_EQUIVALENT | pass |
| bare `[data-vertical='bithire']` | RED (root outranks hook legality) | pass |
| `[data-tenant='x'] *` global under tenant | RED ROOT_EQUIVALENT | pass |
| nested `html { &[data-tenant] { … } }` | RED (nesting cannot hide root) | pass |
| `:is(html, :root)` | RED ROOT_EQUIVALENT | pass |
| declaration outside any rule | RED ROOT_EQUIVALENT | pass |
| public hook under feature scope | GREEN | pass |
| public hook under tenant DESCENDANT | GREEN | pass |
| `:root[data-ds-root] :where(.rt-x)` | GREEN | pass |
| `--rt-*` anywhere incl. root | GREEN | pass |
| public hook inside `@media` | GREEN | pass |
| green wording says "no growth", never "legitimate" | asserted | pass |
| seeded finding fenced; a 2nd instance | GREEN then RED | pass |
| same property, new file | RED (per-file keying) | pass |
| UNKNOWN_HOOK budget funding a ROOT_EQUIVALENT | RED | pass |
| decrease below baseline | GREEN, reported | pass |
| missing corpus | THROWS (never an empty pass) | pass |
| manifest derives 3 ownership classes | asserted | pass |
| ANCHOR DRIFT: anchor file deleted | THROWS, names the anchor | pass |
| ANCHOR DRIFT: anchor emptied | THROWS `ANCHOR DRIFT` | pass |
| ANCHOR DRIFT: style root relocated | THROWS | pass |
| generated artifact cannot confer DS ownership | asserted | pass |
| test/fixture dirs cannot confer ownership | asserted | pass |
| selector-list / subject-compound / nesting units | asserted | pass |

The drills found a real bug: `compoundParts` incremented bracket depth before
testing for a simple-selector boundary, so `html[data-tenant="x"]` never split and
root detection missed it. Fixed; re-derivation moved 5 properties from hooks to
foundation tokens and left the app classification unchanged (44/0/146).

End-to-end red proof (real manifest, temp corpus): exit 1 with 3 growth rows.
Real corpus `--check`: exit 0.

## Files

- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/scripts/lib/ds-hook-manifest.mjs` (new) — anchors, derivation, selector analysis
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/scripts/app-ds-hook-contract-gate.mjs` (new) — the gate
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/scripts/app-ds-hook-contract-gate.baseline.json` (new) — 146 grandfathered, decrease-only
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/scripts/app-ds-hook-contract-gate.test.mjs` (new) — 30 drills
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/scripts/ci-gates.manifest.mjs` (ours-dirty) — registration block: `app-ds-hook-contract-drill` then `app-ds-hook-contract`, both blocking. `validateManifest()` clean; 27 blocking gates.

`postcss` only (already a dependency); no new deps; no builds/suites/typecheck; no git ops.
Foreign files untouched: `app-ds-boundary-gate.*` never read, `supplier-contract.json` read-only.

## Modes

`--check` (default) · `--write` (reseed, decrease only) · `--json` · `--verbose`
· `--app-root <path>` / `APP_DS_HOOK_APP_ROOT` · `--baseline <path>`
· `--emit-manifest <path>` (writes the consumable public contract:
2821 publicHooks / 3498 foundationTokens / 726 tenantChannel)

## What a future consolidation with the foreign boundary gate should do

1. Keep two questions separate but run them in one pass: the boundary gate answers
   "may app CSS write here at all", this one answers "which property, under which
   scope". Merge the CORPUS WALK and the selector resolver; do not merge the
   verdicts.
2. The foreign gate's SCOPED verdict must stop being terminal. It should call this
   manifest and report the hook classification alongside, or its green will keep
   meaning "not bare `:root`" — the exact weakness C3 named.
3. Adopt `lib/ds-hook-manifest.mjs` as the single selector authority. Two
   root-equivalence implementations will drift, and the bug found here
   (`html[data-tenant]` not splitting) is exactly the kind that hides in a
   duplicate.
4. Unify the baselines only if both become per-property; a per-file-only baseline
   cannot express "this property stopped being written here".
5. C3 point 5 ("app developers consume this public contract without modifying the
   DS repository") is NOT yet met: `--emit-manifest` produces the artifact on
   demand, but nothing publishes it. Committing it needs a freshness check, and
   exporting it needs a `package.json` exports entry — both outside this closure's
   write scope. This is the remaining C6.6 "exported and consumed" step.
6. The 146 grandfathered findings need owner routing, not a rewrite: 67
   tenant-channel writes are the white-label risk (an app scoped write beats the
   tenant's `:root`), 58 foundation-token writes are subtree repaints, 21
   undeclared are a mechanical `--ds-*` → `--rt-*` rename.
