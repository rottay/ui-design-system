# W-D state — Codex C4 / C6.7 root-state ownership closure

Scope: DS export surface + root-attributes owner; app-bithire providers + runtime-tenant-theme hook.
IMPLEMENTATION ONLY. No tests, no build, no typecheck, no gates, no git ops were run.
Only read-only inspection plus `node -e` TypeScript parse probes and ONE read-only
`generate-supplier-contract.mjs --print` (stdout to scratchpad; no file written).

## Step 0 — porcelain law, per file, before every edit

| File | porcelain BEFORE | in phase0 census? | verdict |
|---|---|---|---|
| `ui-design-system/packages/core/src/index.ts` | CLEAN | no | ours to edit |
| `.../src/entrypoints/**` | CLEAN | no | not needed (see decision) |
| `.../packages/core/package.json` | CLEAN | no | not needed (see decision) |
| `.../foundation/root-attributes/index.ts` | CLEAN | no | READ ONLY (no edit needed) |
| `.../foundation/root-attributes/ssr/tests/arabic-document-parity.test.tsx` | `??` | no | OURS (W3) |
| `.../bootstrap/facade/react/provider/tests/root-attribute-authority.integration.test.tsx` | CLEAN | no | ours to edit |
| `app-bithire/src/core/providers/index.tsx` | ` M` | **no** | OURS (W3 manifest) |
| `app-bithire/src/core/hooks/runtime-tenant-theme/index.ts` | CLEAN | no | ours to edit |
| `ui-design-system/packages/core/supplier-contract.json` | ` M` | **YES (phase0-uids-porcelain.txt:124)** | **STOP — foreign** |

`grep -n 'src/core/providers/index.tsx' phase0-bithire-porcelain.txt` → exit 1 (absent), and the
file IS in `w3-state.md`'s manifest, so its ` M` is our own wave's.

## WRITER MAP — `data-tenant-theme-mode`

### BEFORE

| Phase | Writer | Location |
|---|---|---|
| server render | `resolveDocumentRootAttributes()` emits the key | `ui-design-system/packages/core/src/infrastructure/runtime/foundation/root-attributes/ssr/index.ts:81` |
| server render | app root layout spreads the projection onto `<html>` | `app-bithire/src/app/layout.tsx:180-193` (spread at `:196` via `...scopedRootAttributes`) |
| pre-paint | `buildThemePrepaintScript()` **READS ONLY** (`getAttribute`), returns early unless `auto` | `.../root-attributes/ssr/index.ts:112` |
| hydration | **raw `root.setAttribute`, no claim, no cleanup** | `app-bithire/src/core/hooks/runtime-tenant-theme/index.ts:95` (inside `installRuntimeStyle`) |
| DS client provider | **none** — `GOVERNED_ROOT_ATTRIBUTES` covers only `data-tenant`/`data-theme`/`data-engine`/`data-density` | census test, DS |

CORRECTION TO THE AUDIT TEXT (recorded, not hidden): C4 says "the server projection/**provider**
also own that channel". Verified false for the provider half — repo-wide grep for
`data-tenant-theme-mode` across the DS returns only `ssr/index.ts` + tests. The SSR projection owns
it; **no DS client provider claims it**. So the app write was the ONLY hydrated writer, not a
duplicate of a live DS owner.

### AFTER

| Phase | Writer | Location |
|---|---|---|
| server render | unchanged (`resolveDocumentRootAttributes` → layout spread) | `ssr/index.ts:81` |
| pre-paint | unchanged, still read-only | `ssr/index.ts:112` |
| hydration | `claimRootAttribute(...)` held by the resolution effect, released on cleanup | `app-bithire/src/core/hooks/runtime-tenant-theme/index.ts:187-200` |
| DS client provider | none (unchanged) | — |

Decision: **route through the registry, do not delete the app write.** Deleting it was the other
option the brief allowed, but it is only correct if the DS provider owns the channel at hydration —
it does not. A DB tenant that changes its configured mode mid-session (`refresh()` → new artifact)
must still move the attribute, and with the write deleted the SSR stamp would go stale with no other
owner to correct it. No third bridge was added: the app is now a *claimant* of a DS-projected
channel, not an independent writer.

Placement note: the stamp was moved OUT of `installRuntimeStyle()` (called from both the effect AND
from `refresh()`, i.e. outside any React lifecycle, so it had nowhere to hang a release) and INTO the
`activeResolution` effect, which already owns the lifecycle. No lost update: `refresh()` bails out of
`setThemeState` only when `runtimeTenantProviderEnvelopeSignature` matches, and that signature
includes `tenantConfig.theme` — so any mode change necessarily re-runs the effect.

### WRITER MAP — tenant-scope trio (`data-account-tenant`, `data-brand-artifact`, `data-css-tenant`)

BEFORE (at HEAD): raw `setAttribute` ×3 + destructive `removeAttribute` ×3 cleanup,
`app-bithire/src/core/providers/index.tsx:195-207`. W3 replaced this with a LOCAL value-based
`claimRootAttribute` copy (`:140-167`) because the canonical registry was not exported.

AFTER: local copy DELETED; `claimRootAttribute` + `composeRootAttributeReleases` imported from
`@rottay/design-system`, `app-bithire/src/core/providers/index.tsx:164-175`.

Server-side stamp of the trio confirmed live at `app-bithire/src/app/layout.tsx:200-206`, so the
non-destructive release is load-bearing, not cosmetic.

Bonus corroboration of the ownership split: the DS already treats two of these as app-owned paint
inputs it OBSERVES but never writes —
`PROVIDER_PAINT_ATTRIBUTE_FILTER` at
`.../src/infrastructure/runtime/dom/runtime/css-color-resolution/index.ts:13-22` lists
`data-css-tenant` and `data-brand-artifact` in a MutationObserver attribute filter (read-only).

## Export surface added (C4)

`ui-design-system/packages/core/src/index.ts:101-121` (new `ROOT ATTRIBUTE CLAIMS` section):

```ts
export {
  claimRootAttribute,
  claimRootClass,
  claimRootStyleProperty,
  composeRootAttributeReleases,
} from './infrastructure/runtime/foundation/root-attributes';
export type { ReleaseRootAttribute } from './infrastructure/runtime/foundation/root-attributes';
```

Entrypoint choice — `.` (the main barrel), NOT a new subpath:
- `src/index.ts` is the "." export source (`vite.config.ts:45`) and carries `'use client'` at line 1,
  so it is the client-safe barrel. The registry is DOM-only; it belongs there.
- app-bithire already imports `DesignSystemProvider`/`getKnownTenantConfig` from `@rottay/design-system`,
  so consumption needs no new resolution path.
- A new subpath would have required `vite.config.ts` (new rollup entry) + `package.json` exports +
  a new dist chunk + a new supplier-contract entrypoint. `package.json` was CLEAN and available, but
  none of that is needed — zero-churn was the better choice.
- Precedent for exporting a client-safe DOM projection from this barrel already exists at
  `src/index.ts:180-186` (`tenantThemeArtifactRootAttributes`).

`outstandingRootClaims` deliberately NOT exported — it is marked test-only in the registry and the
Phase-4 specs reach it by relative import.

Name-collision check: `grep -c 'claimRoot|ReleaseRootAttribute|composeRootAttributeReleases' dist/index.d.ts` → 0.

## Consumption

- `app-bithire/src/core/providers/index.tsx:19-20` — imports the two symbols; local copy and its
  DEBT JSDoc deleted (33 lines). Behaviour identical: three claims composed, released in reverse.
  Net diff vs HEAD is now the clean C4 end-state (destructive `removeAttribute` → DS registry);
  W3's local copy never survives into the committed diff.
- `app-bithire/src/core/hooks/runtime-tenant-theme/index.ts:5` — imports `claimRootAttribute`.

## Test specs WRITTEN (not run)

Both carry `// R1-P Phase4 — run in serial tanda` / an inline `R1-P Phase4` marker.

1. **NEW** `ui-design-system/packages/core/src/infrastructure/runtime/foundation/root-attributes/tests/app-channel-claims.test.tsx`
   (unit project — `.test.tsx`, not `*.integration.*`). 7 specs:
   - anti-vacuity: StrictMode really double-invokes the effects (fails loudly rather than passing
     vacuously if React resolves to a production build);
   - claimed values stay live across the double mount (**the exact case the value-based local copy
     failed**: first mount's cleanup vs second mount holding the same value);
   - DRILL: remount at the SSR value does not blank the channel;
   - unmount hands all four channels back to the server + `outstandingRootClaims === 0`;
   - a runtime mode change moves the channel and still restores the SSR baseline;
   - census: every write to the four channels routes through the claim registry (with a
     no-write-observed anti-cheat per channel);
   - DRILL: a planted clandestine raw `setAttribute` inside the tree is reported, AND the same
     channel is shown to carry legitimate registry writes in the same lifecycle.

   Fixtures MIRROR the two app effects rather than importing them: this owner is the foundation the
   app consumes, so it must not depend on an application (and `foundation/` must not import
   `bootstrap/`). Attribution is by "did the stack cross `root-attributes/index.ts`", which is a
   stricter question than the DS census's "which module wrote it".

2. **MODIFIED** `.../bootstrap/facade/react/provider/tests/root-attribute-authority.integration.test.tsx`
   — additive only: `APP_OWNED_ROOT_CHANNELS` + `isCensusedChannel()` widen the interceptor, the
   `afterEach` cleans the four channels, and one new spec asserts the DS tree **never writes a
   channel an application claims**.

   WHY NOT the literal brief instruction ("extend that census's governed map"): `GOVERNED_ROOT_ATTRIBUTES`
   is asserted with a `no writer observed` anti-cheat AND `toHaveLength(1)` per channel. This census
   mounts `DesignSystemProvider` ALONE — no app code — so nothing in the tree writes the four app
   channels. Adding them to that map would have produced a guaranteed FALSE RED. The new spec is the
   sound form of the same property; the claim-routing half is censused in file (1), where the tree
   contains the app-shaped claimants. Verified non-vacuous and currently green-by-construction:
   grep confirms zero DS writers of the trio (only the read-only observer filter) and zero DS writers
   of `data-tenant-theme-mode`. If a future decision moves a channel INTO a DS provider, this spec
   turns red — deliberately, so the transfer is explicit and the app claim is removed in the same change.

Self-caught bug during authoring (recorded): the new census spec plants SSR values AFTER the
interceptor is installed, so its own writes read as the trespass. Fixed with an explicit
`writes = []` reset and a comment saying why.

## BLOCKED / handoff to the orchestrator

1. **`packages/core/supplier-contract.json` needs regeneration — I did NOT touch it.**
   It is dirty at phase 0 (`phase0-uids-porcelain.txt:124`) and appears in NO wave manifest
   (`grep supplier-contract w1-state.md w2-state.md w3-state.md` → exit 1). Per the wave law that
   makes it another agent's file: STOP + record.
   - Its in-flight foreign change is unrelated to us: `+renderFirstPartyArtifact` and three icon
     supplier shifts (`EditHeader` loses `@ant-design/icons`; `OverlayModal` and one other gain
     `@phosphor-icons/react`).
   - PROVEN drift caused by my export change (read-only `--print`, diffed against the working tree):
     exactly `claimRootAttribute`, `claimRootClass`, `claimRootStyleProperty`,
     `composeRootAttributeReleases` added to `entrypoints["."].exports` and to
     `entrypoints["."].supplierFreeExports` (supplier-free, as expected — the registry imports nothing).
     No other key moves. Derived output kept at
     `<scratchpad>/supplier-contract.derived.json`.
   - **CONSEQUENCE IF SKIPPED: the DS build fails.** `prebuild` runs `contract:check`, which byte-diffs
     the committed file. Whoever owns that file must run
     `node scripts/generate-supplier-contract.mjs --write` — it is source-traced and immune to a stale
     `dist/`, so it picks up their change and mine together.

2. **Serial-tanda ordering requirement.** app-bithire resolves `@rottay/design-system` through a
   symlink (`node_modules/@rottay/design-system -> ui-design-system/packages/core`) whose exports map
   points at `./dist/index.d.ts`. My new exports exist only in `src/` until a DS build runs, so
   **the DS build MUST precede the app-bithire typecheck**, or both app files fail with
   "no exported member 'claimRootAttribute'". This is a build-order artifact, not a defect.

## Explicitly NOT done (deliberate, recorded)

- **`syncRuntimeAnatomyAttributes` left as-is** (`runtime-tenant-theme/index.ts:107-133`). Not
  trivially routable: it reconciles a VARIABLE key set whose ownership token is the `<style>`
  element's `dataset.anatomy`, it is invoked from `refresh()` outside the React lifecycle, and
  `removeRuntimeStyleForOtherTenant()` is a second release path for the same keys on a cross-tenant
  swap. Converting it needs a per-key claim map with hand-off semantics — a distinct correctness
  model, and a redesign rather than a routing change. Note the key DERIVATION is already DS-owned
  (`tenantThemeAnatomyAttributes`, exported from the main barrel); only the DOM reconciliation is
  app-owned.
- No DS provider was changed to take ownership of `data-tenant-theme-mode` (outside my write scope,
  and it would need the app claim removed in the same change).
- No tests/build/typecheck/gates run; no git operations; no `!important`; no new dependencies;
  no `package.json` / `vite.config.ts` / `entrypoints/**` edits (none were needed).

## FILE MANIFEST

```
ui-design-system
  M  packages/core/src/index.ts
  M  packages/core/src/infrastructure/runtime/bootstrap/facade/react/provider/tests/root-attribute-authority.integration.test.tsx
  ?? packages/core/src/infrastructure/runtime/foundation/root-attributes/tests/app-channel-claims.test.tsx
app-bithire
  M  src/core/providers/index.tsx
  M  src/core/hooks/runtime-tenant-theme/index.ts
```

Parse-verified (`ts.createSourceFile`, 0 diagnostics) on all five files.
