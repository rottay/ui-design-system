# W-B · static/DB channel-vocabulary convergence

Mission: eliminate the 5 DB-only-in-core channels so BrandTheme static and
Appearance DB emit the same semantic names, no slug branches.

Pinned in
`packages/core/src/infrastructure/compilers/composition/tenant-theme/tests/static-db-channel-vocabulary.test.ts`:

```
--ds-color-text-on-primary
--ds-layout-header-height
--ds-shell-header-block-size
--ds-shell-sidebar-width
--ds-sidebar-width
```

## Step 0 — baseline

`npx vitest run .../static-db-channel-vocabulary.test.ts` → **7/7 green**,
`dbOnlyCore` = exactly the 5 pinned. staticChannels 1024, dbChannels 126,
dbCore 104, staticOnlyCore 534.

## Step 1 — HEADLINE FINDING: the 5 are a MEASUREMENT artifact, not a divergence

The test's own docblock claims, of `--ds-shell-sidebar-width` and
`--ds-color-text-on-primary`, that *"the typed contract cannot express them, so
both paths reach for something outside it."*

**That claim is false for all five channels.** Both compile paths already share
their emitters:

| channel | shared emitter | static field |
|---|---|---|
| `--ds-sidebar-width` + `--ds-shell-sidebar-width` | `kernel/foundation/css/chrome-variables/index.ts:532-533` | `BrandChrome.sidebar.width` |
| `--ds-layout-header-height` + `--ds-shell-header-block-size` | `kernel/foundation/css/chrome-variables/index.ts:579-580` | `BrandChrome.layout.headerHeight` |
| `--ds-color-text-on-primary` | `kernel/runtime/brand-theme/index.ts:476` (`EXTENDED_PALETTE_CHANNELS`) | `BrandPalette.onPrimaryColor` |

`chromeToVariables` is imported by BOTH `kernel/runtime/brand-theme`
(line 55) and `kernel/runtime/appearance` (line 51). One function, one
vocabulary. There is no second name and no slug branch anywhere in the path.

### Proof A — a BrandTheme carrying the SAME authored intent emits all five, at identical values

Compiled a BrandTheme mirroring the test's own maximal customer document
(`chrome.sidebar.width`, `chrome.layout.headerHeight`, `palette.onPrimaryColor`):

| channel | DB path (customer doc) | static path (mirror BrandTheme) |
|---|---|---|
| `--ds-color-text-on-primary` | `#ffffff` | `#ffffff` |
| `--ds-layout-header-height` | `64px` | `64px` |
| `--ds-shell-header-block-size` | `64px` | `64px` |
| `--ds-shell-sidebar-width` | `284px` | `284px` |
| `--ds-sidebar-width` | `284px` | `284px` |

Zero divergence — same names, same values, same emitter.

### Proof B — shipped first-party themes already emit them

`compileBrandTheme` per vertical, base block + mode blocks:

```
                                  bithire            evnto            rottay
--ds-color-text-on-primary   dark=#ffffff     dark=#131210     light=#FFFFFF
--ds-shell-sidebar-width            -                -           base=296px
--ds-sidebar-width                  -                -           base=296px
--ds-layout-header-height           -                -                -
--ds-shell-header-block-size        -                -                -
```

rottay authors `chrome.sidebar.width: '296px'`
(`foundation/tokens/ts/presentation/brand-themes/platform/index.ts:605`) and the
static compiler emits BOTH sidebar names from it — visible in the shipped
artifact at `artifacts/rottay/index.css:274,295`.

### Root cause of the "5"

Two independent measurement defects, neither of them a vocabulary drift:

1. **`staticChannels` reads only `compileBrandTheme(...).cssVariables`** — the
   BASE block. `compileModeBlocks` puts a channel in a mode block whenever its
   value moves, so `--ds-color-text-on-primary` (which all three verticals
   author, per-mode) is invisible to the measurement. The DB side has NO mode
   blocks (`compileTenantThemeConfig(...).variables` is one flat map, confirmed:
   result keys are schemaVersion/tenantId/slug/verticalKey/rowVersion/
   compilerVersion/verticalEnvelopeDigest/digest/coverage/normalizedAppearance/
   variables/css/scopes), so the comparison was base-vs-everything.
   bithire base = 1024, base+modes = **1069**.
2. **One shipped theme is used as a proxy for "the static path."** A channel
   bithire declines to author reads as a channel the static path cannot emit.
   That is an authoring gap in one product identity, not a contract gap.

## Step 2 — per-channel decision

| channel | decision | evidence |
|---|---|---|
| `--ds-color-text-on-primary` | **(a) static already emits it** — no code change. Measurement fixed. | bithire dark block emits `#ffffff`; evnto `#131210`; rottay light `#FFFFFF` |
| `--ds-shell-sidebar-width` | **(a) contract expresses it** via `chrome.sidebar.width`; rottay ships it. bithire authors `256px` by hand in its extension instead. | `_source/extension.css:200` |
| `--ds-sidebar-width` | same — same field, same emitter, emitted as a pair | `chrome-variables:532-533` |
| `--ds-layout-header-height` | **(a) contract expresses it** via `chrome.layout.headerHeight`. No first-party theme authors it; bithire expresses the same intent as `--ds-shell-topbar-height: 56px`. | `_source/extension.css:199` |
| `--ds-shell-header-block-size` | same field, emitted as a pair | `chrome-variables:579-580` |

**(b) — "the DB side should stop emitting" — is rejected for all five.** Every
one has a live reader, so a reachability proof is unavailable:

- `--ds-shell-sidebar-width` → `ui/structures/shell/index.tsx:180`
- `--ds-shell-header-block-size` → `ui/structures/shell/index.tsx:182`
- `--ds-sidebar-width` → classic `theme.css:2147-2149` (`.ant-layout-sider`)
- `--ds-layout-header-height` → classic `theme.css:2136,2138` (`.ant-layout-header`)
- `--ds-color-text-on-primary` → ~14 DS call sites (Badge, Toast, kanban,
  calendar, detail-panel, modern framework projection) + `default.css:212,2370`

## Step 3 — STOP + RECORD: what I did NOT convert, and why

Closing the remaining 4 against the *shipped bithire identity* requires
authoring `chrome.sidebar.width` / `chrome.layout.headerHeight` in
`foundation/tokens/ts/presentation/brand-themes/bithire/index.ts` and deleting
the extension echoes. Not done, three reasons:

1. **It changes shipped effective values.** The two `--ds-layout-*` /
   `--ds-sidebar-*` names are the CLASSIC engine's vocabulary and are currently
   unset for bithire:
   - `--ds-sidebar-width`: unset → `256px` ⇒ classic `.ant-layout-sider`
     width/min/max `200px` (the `var()` fallback) → `256px`.
   - `--ds-layout-header-height`: unset → `56px` ⇒ classic `.ant-layout-header`
     `height`/`line-height` invalid-at-computed-value-time (→ `auto`) → `56px`.

   bithire pins `engine: 'modern'`, so no render changes in practice, but the
   artifact is engine-independent and the law is preserve-effective-values.
   The other two names are free: `--ds-shell-sidebar-width` already ships at
   `256px` from the extension, and `--ds-shell-header-block-size` already
   resolves to `56px` through the documented fallback chain
   `var(--ds-shell-header-block-size, var(--ds-shell-topbar-height, …))`.

2. **Theme source data is outside this wave's write scope** (brand-theme
   COMPILER only).

3. **It would collide with the extension-retirement wave already in flight**
   (tasks #6/#7: "Ground migration … into BrandTheme palette", "Retirement
   batches per vertical with regen + gate + acid"). Two agents regenerating the
   same three artifacts concurrently is the collision class the fleet laws
   forbid. Handed off instead — see FINAL REPORT.

Consequently **no artifact was regenerated and no `_source/extension.css` was
touched**: the brief's condition ("delete the two echoes IF the static compiler
takes them over at identical values") is not met by a compiler-only change,
because the static compiler has no value to take over without the theme data.

## Step 4 — the re-anchor

`static-db-channel-vocabulary.test.ts` now asserts two separate laws instead of
one conflated pin:

- **Law A (vocabulary, asserts ZERO).** The static mirror is built MECHANICALLY
  from the DB compile's own `normalizedAppearance` (`advanced.chrome` is
  structurally `BrandChrome`; `general.palette` carries the seeds), handed to
  `compileBrandTheme`, and every DB core-family channel must appear. A customer
  dial the BrandTheme contract cannot express goes red — no pin to grow.
- **Law B (shipped-identity authoring gap, decrease-only).** Channels the DB
  path emits that the shipped bithire identity does not author, measured
  against base ∪ mode blocks. **5 → 4**, each annotated with where bithire
  authors the same intent instead.

## Step 5 — results

```
dbOnlyCoreVsContract : []                       ← 5 → 0   TARGET MET
dbOnlyCoreVsBithire  : 4 (geometry family)      ← 5 → 4
mirrorSize 259 · bithireSize 1069 · dbSize 132 · dbCore 110
```

## Commands run (serially, one at a time)

| command | result |
|---|---|
| `npx vitest run .../static-db-channel-vocabulary.test.ts` (baseline) | 7/7 green, dbOnlyCore = the 5 |
| probe: `compileBrandTheme` × 3 verticals, base + modeBlocks | Proof B |
| probe: mirror BrandTheme vs customer document | Proof A |
| `npx vitest run .../static-db-channel-vocabulary.test.ts` (after) | **9/9 green** |
| `npx vitest run .../composition/tenant-theme/tests/` | 136/139 — **3 pre-existing failures, not mine** (below) |
| `npx vitest run .../brand-theme/tests/tenant-color-propagation.test.ts` | 17/17 green |
| `npx vitest run .../artifact-renderer/tests/extension-cannot-beat-tenant.test.ts` | 8/9 — **1 pre-existing failure, not mine** (below) |
| `node scripts/build-vertical-artifacts.mjs --check` | **all 3 artifacts STALE** — not mine (below) |

## Step 6 — CONCURRENT-WAVE BREAKAGE FOUND (attributed, not caused by this wave)

My only source edit is `static-db-channel-vocabulary.test.ts`, a test file no
other module imports. Every failure below reproduces with that file excluded.

**(1) W-C's `palette-derivations` broke the DB tenant-theme digest — 3 tests.**
`kernel/runtime/appearance` now merges `derivePaletteSemantics`, so the DB
artifact gained 18 channels (`--ds-button-primary-bg`, `--ds-input-border-focus`,
`--ds-input-shadow-focus`, the ground ladder …). The stored artifact digest moved:

```
canonical-digest-identity.test.ts:143   sha256-63b2aa3e… → sha256-03f7df98…
  × keeps the populated simple artifact digest byte-identical
  × produces one digest for a document authored in any key order
tenant-theme-artifact-stability.test.ts:177
  × keeps the populated simple document stable modulo the generated chart series
    additions expected 12, got 18 (+ --ds-input-border-focus, --ds-input-shadow-focus, …)
```

W-C's checkpoint (`wcprop-state.md`) lists the gates it ran — provenance, acid,
tokens, boundary, css-census — and `composition/tenant-theme/**` is not among
them. Measured drift between my own two runs: dbSize 126 → 132, dbCore 104 → 110
(23:43 → 23:50), i.e. it landed mid-session.

**(2) The brand-theme migration wave (tasks #6/#7) moved a pinned floor — 1 test.**
```
extension-cannot-beat-tenant.test.ts:144
  × a channel the compiled side authors only in the OTHER mode is not a conflict
    darkOnlyOverlap: expected 40 to be greater than 40 (pinned "44 today")
```
All three `brand-themes/{bithire,platform,evnto}/index.ts` were modified at
23:40-23:55 by that wave. The floor needs re-seeding as part of it.

**(3) All three vertical artifacts are STALE** (`build-vertical-artifacts.mjs
--check`) — the same brand-theme edits, not yet regenerated. Regeneration is
task #7's own step ("Retirement batches per vertical with regen + gate + acid");
regenerating from here would clobber a migration in flight. **Not done.**

No git operations. No `!important`. No slug branches. No artifact regeneration.
No theme-source or extension edit.
