# P2 — Codex C6.6 closure: contract exported, consumed, negatively drilled; 142 → 0

Status: COMPLETE. Hook gate 0 grandfathered / 0 observed, 49/49 drills pass, freshness
gate registered blocking, contract resolvable by an installed consumer.

## 1. What the published contract is

| | |
|---|---|
| artifact | `ui-design-system/packages/core/hooks-manifest.json` (317 KB, tracked source) |
| export | `@rottay/design-system/hooks-manifest` |
| types | `packages/core/hooks-manifest.d.ts` (`HookManifest`, `DeclaredSlot`, `WhiteLabelCompat`) |
| generate | `pnpm hooks:generate` → `app-ds-hook-contract-gate.mjs --manifest-write` |
| verify | `pnpm hooks:check` → `--manifest-check`, chained into `prebuild` |
| CI | `app-ds-hook-manifest-freshness`, blocking, in `ci-gates.manifest.mjs` |
| contents | schemaVersion 2, `generatedFrom` anchors, 2843 `publicHooks`, 57 `declaredSlots`, 3498 `foundationTokens`, 1200 `tenantChannel` |

Why the package root and not `src/foundation/contracts/`: only paths in package.json
`files` reach an installed consumer, and that list ships `dist/**` plus root artifacts,
never `src/**`. A contract an app cannot resolve after `pnpm add` is not exported,
whatever the repo layout says. It sits beside `supplier-contract.json`, the existing
published-contract precedent, and follows the same generate/`--check`/prebuild shape.

## 2. Derivation defect found and fixed (this changed the routing)

The chrome emitter does not spell every variable it writes. Whole families are built by
interpolation:

```ts
vars[`--ds-button-${prefix}-bg`] = btn.bg;        // 12 variants
vars[`--ds-${namespace}-padding`] = card.padding; // 6 card families
const prefix = `--ds-${family}-${size}`;          // 2 x 5 controls
```

The manifest's literal-key regex could not see any of these, so the tenant channel was
under-reported by 474 names — the dangerous direction, because a variable the white-label
compiler writes at `:root` was being filed as an ordinary foundation token.

`deriveInterpolatedEmissions()` now expands them by derivation, not by hand-list: it
indexes the emitter's functions, takes substitution values from the call sites and from
literal-union parameter types, and expands the key templates. A thirteenth button variant
is picked up with no edit. 70 families / 503 names; tenantChannel 726 → 1200.

Effect on the corpus: **the total stayed exactly 142**, and no write that was already
classed `PUBLIC_HOOK_SCOPED` became a violation. 38 writes moved foundation-token →
tenant-channel. Codex's 63/58/21 is really **101 tenant-channel / 20 foundation-token /
21 undeclared**.

A new floor makes the loss of this half of the channel fatal: fewer than 30 interpolated
families throws `ANCHOR DRIFT`, so a refactor to a lookup table cannot silently halve the
channel.

## 3. Routing (full ledger in `p2-routing-ledger.{json,md}`)

| corrected category | RENAME | PROMOTE | DELETE | total |
|---|---|---|---|---|
| undeclared | 21 | 0 | 0 | 21 |
| foundation-token | 5 | 15 | 0 | 20 |
| tenant-channel | 0 | 100 | 1 | 101 |
| **total** | **26** | **115** | **1** | **142** |

### RENAME (26) — the app was the only reader

Five properties. Writers and readers moved in one pass so every chain resolves to the
same value; `--ds-chart-accent` needed a fallback-preserving shape because the DS
root-declares it but never reads it, so the app must still see that default outside its
own scopes:

```css
/* before */ var(--ds-chart-accent, var(--ds-color-primary))
/* after  */ var(--rt-chart-accent, var(--ds-chart-accent, var(--ds-color-primary)))
```

`--ds-progress-fill` was deliberately renamed and left inert rather than repointed at
`--ds-progress-fill-primary`, the name the DS Progress actually reads. Repointing would
have been a visual change and a fresh violation. The app's intended tint has never
landed — that is a latent product defect for the owner, not a P2 fix.

### DELETE (1) — provably redundant

`--ds-signal-card-top-line-display: none` on `.rt-metric-card`. Nothing in the DS or the
app reads it (whole-file scan), and the DS root default at `patterns.css:363` is `none`,
byte-identical. A no-op on two independent grounds, and its removal retires a latent
override of a tenant channel.

### PROMOTE (115 writes / 57 properties / 10 families)

The load-bearing finding: **the DS reads almost every one of these properties itself**.
`--ds-button-secondary-bg` is read by the modern, rustic and classic Button skins;
`--ds-command-grid-opacity` by `:where(.ds-command-grid)`; `--ds-tabs-list-*` by the Tabs
skin. The app writes them under feature scopes precisely to retune those DS components —
which is C3 point 3, "component tuning occurs under an explicit application/feature
scope". Renaming them to `--rt-*` would not preserve value: it would revert every one of
those components to its root default. CSS custom-property cascade leaves no third option
— to change what a DS component reads you must declare the name it reads.

So each family is promoted with the full seven-point declaration (owner, slot, valueType,
fallback, sinceVersion, whiteLabelCompat, subtreeRepaint) plus a rationale, and the
promotion legalises the existing write unchanged — not one character of any declaration
or value was edited, so value preservation is by construction.

Families: `command-grid-overlay`, `chart-plot-surface`, `listing-grid-geometry`,
`signal-card-tone`, `metric-card-anatomy`, `tabs-chrome`, `button-variant-chrome`,
`control-geometry`, `table-in-card-bridge`, `workspace-shell-overlay`.

## 4. Promotion is bounded, not a rubber stamp

Three mechanisms stop this from being "declare it and it's legal":

1. **The derivation refuses** to promote a property the DS does not read. A stale entry
   throws rather than being silently dropped. Drilled.
2. **An enforced value constraint.** A write to a public hook may not contain a raw colour
   literal (`#hex`, `rgb()`, `hsl()`, `oklch()`, …). A hook exists so an app can
   re-express the tenant's own tokens for one surface, never to pin brand paint the tenant
   cannot re-theme. New `HOOK_VALUE_LITERAL` classification, fenced and drilled RED.
   All 142 fenced writes and all 165 current hook writes already satisfy it, so it ships
   with **zero grandfathering** — the constraint is live, not aspirational.
3. **`whiteLabelCompat` is declared per family**, so residual risk is stated:
   - `not-tenant-emitted` — the compiler never writes it; nothing can be overridden.
   - `propagates-channel` — the assignment reads the tenant's own channel.
   - `derives-from-palette` — brand colour propagates, but a tenant's explicit override of
     *this* channel does not reach the scope.

**Residual risk, stated plainly:** `tabs-chrome` and `button-variant-chrome`
(55 of the 115 promoted writes) are `derives-from-palette`. A tenant setting
`chrome.tabs` or `chrome.controls` does not reach inside those app scopes. Every value
chains through `--ds-surface-*` / `--ds-color-*` so a palette change still flows, but the
per-channel override does not. The clean fix is a DS-side per-scope override slot —
`var(--ds-button-secondary-bg-local, var(--ds-button-secondary-bg, …))` — which is
outside P2's write scope (it needs edits across the engine skins). Recorded here as the
follow-up that would let these two families be demoted again.

## 5. Gate + drill evidence

| check | command | exit |
|---|---|---|
| hook contract | `app-ds-hook-contract-gate.mjs --check` | 0 — 165 PUBLIC_HOOK_SCOPED / 0 ROOT_EQUIVALENT / 0 UNKNOWN_HOOK / 0 HOOK_VALUE_LITERAL, "no growth (0 grandfathered, 0 observed)" |
| freshness | `--manifest-check` | 0 — "published contract is current" |
| drills | `node --test app-ds-hook-contract-gate.test.mjs` | 0 — 49/49 pass |
| CI manifest | `validateManifest()` | `[]`, 30 blocking gates |
| sibling boundary (regression) | `app-ds-boundary-gate.mjs --check` | 0 — 165 SCOPED, 0 SHADOWED/GLOBAL-OWN/ORPHAN |

New drills (all isolated, each asserting the other checks stayed quiet):

| drill | expected | result |
|---|---|---|
| public hook assigned a raw colour literal | RED `HOOK_VALUE_LITERAL` | pass |
| `rgb()` / `hsl()` / `oklch()` / literal inside `color-mix()` | RED | pass |
| tenant-derived chain on the same hook | GREEN | pass |
| geometry literal (`12px`) on a hook | GREEN | pass |
| tenant-derived value on a non-hook still fails | RED `UNKNOWN_HOOK` | pass |
| interpolated `--ds-x-${p}-y` family expands into the channel | asserted, no invented names | pass |
| literal-union parameter type enumerates itself | asserted | pass |
| unresolvable interpolation slot yields nothing | asserted | pass |
| emitter loses its interpolated families | THROWS `ANCHOR DRIFT` | pass |
| every promotion names a property the DS reads | asserted on the real tree | pass |
| promotion of a name nothing reads | THROWS | pass |
| every declared slot carries all seven terms | asserted | pass |
| committed artifact matches re-derivation and is exported | GREEN | pass |
| manifest-stale | RED `MANIFEST_STALE` | pass |
| manifest-missing | RED `MANIFEST_MISSING` | pass |
| export-missing | RED `EXPORT_MISSING` | pass |
| export-unshipped (resolves in-repo, 404 for a consumer) | RED `EXPORT_UNSHIPPED` | pass |
| installed-consumer resolution + set disjointness | GREEN | pass |
| published contract names its derivation sources | asserted | pass |

The freshness gate proved itself during the session: a concurrent agent edited DS token
sources and `--manifest-check` went RED with `MANIFEST_STALE` until the artifact was
regenerated. That is the failure mode it exists to catch.

Consumer resolution is the real thing — `createRequire` from the app root resolving
`@rottay/design-system/hooks-manifest` through node module resolution and the package
`exports` map, exactly as a published install would, not a relative import of `src/` or
`scripts/`:

```
RESOLVED: /Users/daniel/Developer/Rottay/ui-design-system/packages/core/hooks-manifest.json
schemaVersion 2 | publicHooks 2843 | declaredSlots 57
```

## 6. Files

DS (`ui-design-system/packages/core/`):
- `hooks-manifest.json` — NEW, the published contract
- `hooks-manifest.d.ts` — NEW, consumer types
- `scripts/lib/ds-hook-manifest.mjs` — interpolated-family derivation, `PROMOTIONS`
  registry, value constraint, richer artifact serializer, injectable `promotions`
- `scripts/app-ds-hook-contract-gate.mjs` — `HOOK_VALUE_LITERAL`,
  `checkManifestFreshness()`, `--manifest-check` / `--manifest-write`
- `scripts/app-ds-hook-contract-gate.test.mjs` — 30 → 49 drills
- `scripts/app-ds-hook-contract-gate.baseline.json` — reseeded to `{}`
- `package.json` — `./hooks-manifest` export, `files` entries, `hooks:check` /
  `hooks:generate`, `hooks:check` in `prebuild` (shared file, dirty from other agents)
- `scripts/ci-gates.manifest.mjs` — freshness gate registered blocking (shared file)

app-bithire — 16 files, all CSS/TSX variable renames plus one deletion. Promotion required
**zero** app edits, which is why only 1 of the 3 files dirty from the concurrent visual WIP
was touched at all:

- `src/features/candidates/surface/screens/record/detail/wiring/styles/index.css` — DIRTY
  from concurrent work. Exactly one line changed, documented:
  `--ds-button-secondary-border-color` → `--rt-candidate-detail-button-secondary-border-color`
  (value `var(--ds-button-secondary-border)` untouched). The other two dirty files
  (`create/view/sections/form-primitives/styles/index.css`,
  `create/wiring/styles/index.css`) were NOT touched — their fenced writes were all
  promoted.
- 15 clean files: activity content, insights heatmap + team-activity-chart, interviews
  ai/mobile-card + feedback/queue + preparation, offers onboarding-collection + listing
  card, settings security, sprints signal-metric-card, teams overview signal-card,
  ui/cards/metric-signal-card, ui/charts, ui/surfaces (`index.tsx` + `styles/index.css`).

## 7. Laws observed

No git operations. No `!important`. No builds, no typecheck, no test suites — only the
single focal drill file, run one at a time. No BrandTheme global-value moves. No
`SIGHTED_PENDING` entries: every routing preserves the effective computed value, argued
per row in the ledger.

## 8. Open for the owner

1. **Per-scope override slots for `tabs-chrome` and `button-variant-chrome`** (§4). The
   only change that would let those 55 writes stop shadowing a tenant channel. Needs DS
   engine-skin edits.
2. **`--ds-progress-fill` never worked** (§3). The offers onboarding progress tint has
   never rendered. Product decision, not a contract issue.
3. The sibling `app-ds-boundary-gate` still calls all 165 writes "legitimate by
   construction". Its SCOPED verdict should call this manifest and report the hook
   classification alongside, or its green keeps meaning "not bare `:root`" — the exact
   weakness C3 named. Carried forward from W-1B §"future consolidation".
