# P3 state — Codex C6.7 closure: dynamic attribute-set claims, zero direct app root writers

Scope: DS root-attribute registry (dynamic-set claim API + export), app-bithire runtime tenant
theme hook (consume it, delete the raw writers), NEW blocking gate + drills, CI manifest
registration.

No git operations. No suites, no typecheck, no builds. Focal single-file test runs only.

## Step 0 — porcelain, per file, before every edit

| File | porcelain BEFORE | verdict |
|---|---|---|
| `packages/core/src/infrastructure/runtime/foundation/root-attributes/index.ts` | CLEAN | ours |
| `.../root-attributes/tests/attribute-set-claims.test.tsx` | absent | ours (NEW) |
| `packages/core/src/index.ts` | ` M` (W-D, this wave) | ours |
| `packages/core/scripts/ci-gates.manifest.mjs` | ` M` (P-siblings, this wave) | shared — additive insert only |
| `packages/core/scripts/app-root-writer-gate{,.test}.mjs` | absent | ours (NEW) |
| `app-bithire/src/core/hooks/runtime-tenant-theme/index.ts` | ` M` (W-D, this wave) | ours |
| `app-bithire/tests/unit/lib/theme/runtime-tenant-theme-hydration.unit.test.ts` | CLEAN | ours (see "harness" below) |
| `packages/core/supplier-contract.json` | ` M` | **FOREIGN — not touched** (handoff below) |

## API shipped

`claimRootAttributeSet(element, namespace, initial?) -> RootAttributeSetClaim`
with `{ reconcile(next: Record<string,string>): void; release(): void }`, exported from the main
barrel beside `claimRootAttribute`.

Contract:

- Owns a PREFIX namespace as one claim unit. A key outside the namespace THROWS and applies none
  of the map — a set that could reach `data-theme` would be a second authority over a channel with
  a different owner. Keys come from a closed DS map, never from tenant data, so the throw is a
  source-drift signal, not a data path.
- Each key is an ordinary claim in the SAME per-channel identity stack, so a set claimant and a
  single-attribute claimant over one key resolve exactly as two single claims do: top wins,
  releasing a covered claim touches no DOM, releasing the top hands down to the next claim or to
  the baseline captured at first claim.
- `reconcile` releases keys that disappeared (each to its own baseline), moves keys present in
  both IN PLACE (no stack churn, no baseline flash), claims new keys.
- A key the claim never claimed is never touched — this is what lets the vertical's static anatomy
  survive a tenant artifact that declares fewer families.
- `release()` hands back every held key, reverse order. Idempotent; a released claim is inert.

Two supporting changes in the same registry:

- `claimChannel` now returns `{ release, update }`; `update` moves a live claim's value without
  leaving the stack. The three public single-channel claims are unchanged in signature.
- Writing a value that is already live performs NO DOM mutation, on all four paths: claim, update,
  hand-down to the claim below, and restore to baseline. Hydration over an identical SSR stamp is
  the common case, and a redundant `setAttribute` wakes every MutationObserver on the root. The
  previous hand-rolled app reconciler had this guard; the registry now owns it for all three
  channel families.

## ROOT WRITER MAP — every governed channel, before → after

| Channel | SSR projection | Hydrated owner (AFTER) | App writers AFTER |
|---|---|---|---|
| `data-theme` | `resolveDocumentRootAttributes` → layout spread | DS ThemeProvider (claim) | 0 |
| `data-engine` | same projection | DS EngineProvider (claim) | 0 |
| `data-density` | DS provider | DS RootDensityProvider (claim) | 0 |
| `data-tenant` / `data-vertical` / `data-ds-root` | same projection | DS TenantProvider (claim) | 0 |
| `lang` / `dir` | same projection | DS I18nProvider | 0 |
| `data-tenant-theme-mode` | same projection | app hook, `claimRootAttribute` (W-D) | 0 raw |
| `data-account-tenant` / `data-brand-artifact` / `data-css-tenant` | app layout | app providers, `claimRootAttribute` (W-D) | 0 raw |
| **`data-anatomy-*`** | app layout (`bundledAnatomyAttributes` + artifact `anatomyAttributes`) | **app hook, ONE `claimRootAttributeSet`** | **0 raw (was 3)** |
| `color-scheme` (inline style) | pre-paint script | DS ThemeProvider (claim) | 0 |
| `dark` (class) | pre-paint script | DS ThemeProvider (claim) | 0 |

BEFORE, `data-anatomy-*` had three raw writers in two functions plus a DOM-resident ownership
ledger:

- `syncRuntimeAnatomyAttributes()` — `root.removeAttribute(key)` + `root.setAttribute(key, value)`
  over a computed key set, called from `installRuntimeStyle()`, which runs both inside the effect
  and from `refresh()` outside any React lifecycle;
- `removeRuntimeStyleForOtherTenant()` — a SECOND release path, `root.removeAttribute(key)` for
  the outgoing tenant's keys on a cross-tenant swap;
- the memory of which keys were owned lived on the `<style>` element's `dataset.anatomy`.

AFTER: one claim, held by the `activeResolution` effect and released by its cleanup.
`installRuntimeStyle()` installs the stylesheet and nothing else.
`removeRuntimeStyleForOtherTenant()` removes the stale `<style>` element and nothing else — the
second release path collapsed into the one owner's `release`/`reconcile`.
`refresh()` reconciles through a ref to the live claim, so the artifact CSS and the anatomy
attributes it selects on move together instead of the attributes waiting for a re-render.

`style.dataset.anatomy` REMOVED, fully superseded: the key ledger is the claim's own map and the
per-key baseline lives in the registry. Nothing else read it (verified: zero references left in
`app-bithire/src`).

Behavioral consequences worth recording:

- A key that drops out of the artifact now returns to the SSR value instead of being deleted. The
  old delete destroyed the vertical's static stamp whenever a DB tenant declared fewer families.
- `refresh()` resolving after unmount is now a no-op on the root (the ref is nulled by cleanup);
  previously it could stamp attributes onto a document nothing owned.

## NEW GATE — `app-root-writer` (blocking, no baseline)

`packages/core/scripts/app-root-writer-gate.mjs`, registered in `ci-gates.manifest.mjs` as
`app-root-writer-drill` (drills first) then `app-root-writer`.

AST-based (TypeScript compiler API from `node_modules`, no new dependency), syntactic only — no
program, no checker, no tsconfig, so it still runs when the app does not typecheck. Two finding
classes, `RAW_ROOT_WRITE` and `LOCAL_CLAIM_COPY`. There is NO allowlist and no baseline file:
zero is the only passing count.

Detected write forms on the document root (resolved through local `const` aliases and
`const { documentElement } = document` destructuring): `setAttribute` / `removeAttribute` /
`toggleAttribute`, `classList.add|remove|toggle|replace`, `style.setProperty|removeProperty`,
assignment to `lang` / `dir` / `className` / `style.<prop>` / `dataset.<key>`, `delete
dataset.<key>`, and `Object.assign(root, …)`. A channel name that is not statically knowable is a
finding on purpose — the writer this gate exists for computed its keys from tenant data.

Governed set: `data-theme`, `data-engine`, `data-density`, `data-ds-motion`, `data-ds-root`,
`data-vertical`, `data-account-tenant`, `data-brand-artifact`, `data-css-tenant`, `lang`, `dir`,
prefixes `data-tenant*` and `data-anatomy-*`, style `color-scheme`, class `dark`.
Deliberately NOT governed: an app's own root `data-*` marker, `overflow`/`overscroll-behavior`,
and any governed NAME written to a non-root element.

### Drill table

| Drill | Expectation | Exit |
|---|---|---|
| historical reconciler shape (computed keys, aliased root, second removal path) | RED, 2× `<computed>` | pass |
| literal governed channel written directly | RED `data-tenant-theme-mode` | pass |
| root via `const { documentElement } = document` | RED `data-theme` | pass |
| governed channel behind a named constant | RED `data-anatomy-card` | pass |
| `dataset` assignment + `delete` | RED ×2 | pass |
| theme class + `color-scheme` (assignment and `setProperty`) | RED ×3 | pass |
| `lang`, `dir`, `className` | RED ×3 | pass |
| claim API usage (`claimRootAttribute` + `claimRootAttributeSet`) | GREEN | pass |
| app-owned `data-*` root marker | GREEN | pass |
| `overflow`/`overscroll-behavior`/app class | GREEN | pass |
| read-only (`getAttribute`, `observe`, `.lang` read) | GREEN | pass |
| governed name on a NON-root element | GREEN | pass |
| claim re-implemented in the app | RED `LOCAL_CLAIM_COPY` | pass |
| claim imported from a non-DS module | RED `LOCAL_CLAIM_COPY` | pass |
| missing corpus | throws, never a pass | pass |
| governed-set family matching | prefixes + exact, app names excluded | pass |
| line attribution | exact line | pass |
| REAL app-bithire corpus | zero findings | pass |

`node --test scripts/app-root-writer-gate.test.mjs` → **18/18 pass**.
`node scripts/app-root-writer-gate.mjs --check` → 4284 sources, 30 root references, 4 claim
usages, **0 findings**.

Adversarial evidence the gate is not green by construction — run against the code at HEAD:

- `git show HEAD:src/core/hooks/runtime-tenant-theme/index.ts` → **4 findings**
  (`data-tenant-theme-mode` literal + three `<computed>`).
- `git show HEAD:src/core/providers/index.tsx` → **6 findings** (the tenant-scope trio, set and
  remove).

## Test runs (focal, one file at a time)

| Suite | Result |
|---|---|
| DS `root-attributes/tests/attribute-set-claims.test.tsx` (NEW) | 17/17 pass |
| DS `root-attributes/tests/index.test.ts` | 19/19 pass |
| DS `root-attributes/tests/app-channel-claims.test.tsx` | 7/7 pass |
| DS `provider/tests/root-attribute-authority.integration.test.tsx` | 6/6 pass |
| DS `scripts/app-root-writer-gate.test.mjs` (NEW) | 18/18 pass |
| DS `scripts/run-ci-gates.test.mjs` (manifest drill) | 10/10 pass |
| DS `scripts/workflow-script-wiring-gate.mjs` | OK |
| app `tests/unit/lib/theme/runtime-tenant-theme-hydration.unit.test.ts` | 13/13 pass † |
| app `tests/unit/lib/theme/runtime-tenant-theme.unit.test.ts` | 17/17 pass † |
| app `tests/unit/lib/theme/runtime-tenant-ssr-boundary.unit.test.ts` | 10/10 pass † |

† The app's jest maps `@rottay/design-system` to `dist/index.cjs`, which predates this export.
The three app suites were run through a SCRATCHPAD-ONLY jest config that overlays the
root-attributes module compiled from the same source (`esbuild --format=cjs`); nothing was written
into either repository and no DS build was run. After the DS build these run unmodified.

Registry module typechecks in isolation: `tsc --noEmit --ignoreConfig --strict` → clean.
All five edited/created source files parse with 0 diagnostics.

### App test harness change (recorded, not hidden)

`runtime-tenant-theme-hydration.unit.test.ts` mocks `useEffect` to run setup inline and DISCARDED
the cleanup. Under a claim model that is not a simplification, it is a different lifecycle: two of
its assertions ("retires it with the artifact", "retires the DB artifact when the session returns
to the static vertical") passed only because the previous mount's claim was never released.

Changes: the mock now collects cleanups, and `hydrateSteps` runs the previous step's cleanups
before the next step's render (the last step stays mounted, since its writes are the state under
assertion). `HydrationStep` gained an optional `ssr` seed, used by the return-to-static test —
that document was server-rendered for the DB tenant, so `data-tenant-theme-mode` returns to the
server's value rather than to absence. Both assertions are unchanged in value; both were RED
before the harness fix and are GREEN after, which is the proof the harness now runs cleanups.

Two comments describing the deleted `<style>`-element ledger were rewritten to state the current
constraint.

## HANDOFF / BLOCKED

1. **`packages/core/supplier-contract.json` needs regeneration — NOT touched** (dirty at phase 0,
   foreign). PROVEN drift from this wave, computed read-only with
   `node scripts/generate-supplier-contract.mjs --print` and diffed against the working tree:
   exactly `claimRootAttributeSet` added to `entrypoints["."].exports` and to
   `supplierFreeExports`. No other key moves. (W-D's four symbols are already present in the
   committed file.) **If skipped the DS build fails** — `prebuild` runs `contract:check`, which
   byte-diffs the file. Owner runs `node scripts/generate-supplier-contract.mjs --write`.
2. **Serial-tanda ordering.** app-bithire resolves the DS through a symlink whose exports map
   points at `dist/`. `claimRootAttributeSet` exists only in `src/` until a DS build runs, so the
   **DS build must precede the app-bithire typecheck and the app jest run**. Build-order artifact,
   not a defect.
3. The gate scans **app-bithire only**. app-platform and app-evnto are copy-first adopters of the
   same architecture and will need the same corpus added (`--app-root`) once their root state is
   claim-owned; adding them today would register findings this wave cannot fix.

## FILE MANIFEST

```
ui-design-system
  M  packages/core/src/infrastructure/runtime/foundation/root-attributes/index.ts
  M  packages/core/src/index.ts
  M  packages/core/scripts/ci-gates.manifest.mjs      (additive: 2 gate entries)
  ?? packages/core/src/infrastructure/runtime/foundation/root-attributes/tests/attribute-set-claims.test.tsx
  ?? packages/core/scripts/app-root-writer-gate.mjs
  ?? packages/core/scripts/app-root-writer-gate.test.mjs
app-bithire
  M  src/core/hooks/runtime-tenant-theme/index.ts
  M  tests/unit/lib/theme/runtime-tenant-theme-hydration.unit.test.ts
```
