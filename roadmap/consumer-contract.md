---
title: "Design System Consumer contract: the productive base for the apps"
date: 2026-09-05
status: canonical (adopted 2026-09-05 from audit/70-plan/roadmap-draft; state lives in roadmap/registry.json)
audience: ai-agent
sources:
  - audit/70-plan/roadmap-draft/consumer-contract.md (the contract itself)
  - audit/50-matrices/cascade/index.md §1 (what propagates today)
  - audit/30-findings/** (closure criteria of every F-nn cited below)
---

# Consumer contract: the productive base for the apps

Milestone A ("apps can build"; owner, 2026-09-05: "hasta acá es todo lo que necesitás saber"): from its exit gate (WO-CON-04) two autonomous tracks run in parallel and never block each other: **track APP** (app-bithire builds and redesigns its pages in its own preview area, against this contract only) and **track DS** (the remaining lanes of this roadmap, behind the contract). The apps code against a frozen contract (sanctioned import surface, `mountTenantTheme`, tenant document v2) while the DS is finished behind it. Everything in this lane ships with the **final** signatures over the **current** pipeline; the real implementations (WO-EMI-02, WO-CAT-02, WO-DER-06) replace the temporary facades without changing a signature. The facades are dated exceptions to the uniqueness rule and each names the WO that deletes it.

Lane-wide rules (binding on every WO):

- Repo: `/Users/daniel/Developer/Rottay/ui-design-system` (macOS, pnpm). Paths are relative to the repo root unless prefixed; "logical path" means the target-tree grammar of `audit/40-architecture/target` §5. D-21 is decided (owner, 2026-09-05): grammar (b), first level — `packages/core/src/{contracts,kernel,tokens,graphics,compilers,runtime,components,entrypoints}`. A logical path written `.../src/infrastructure/compilers/theme/**` therefore materializes as `.../src/compilers/theme/**`, `.../src/foundation/contracts/theme/**` as `.../src/contracts/theme/**`, and `.../src/infrastructure/runtime/<x>/**` as `.../src/runtime/<x>/**`. New code is born with this grammar from WO-CAT-02; what is not rewritten is normalized in WO-RET-04. `packages/core/scripts/check/architecture/audits/structure/index.mjs` and `CLAUDE.md` still pin the four-tier grammar, so WO-CAT-02 — the first WO that materializes a new first-level root — also amends that gate, its test and the written law.
- Engines: Modern is the only admitted engine; Classic and Rustic stay in the package frozen and fail-closed; no WO in any lane adds content, tokens, tests or a11y work to them (owner decision 2026-09-05).
- Every WO names the audit findings it closes (`Closes`) and is done only when the closure criterion of each cited `F-nn` (`audit/30-findings`) passes on the working tree, in addition to its own acceptance gate and a green DS build/test.
- Uniqueness: a WO that leaves two files or two processes with the same responsibility is not done.
- Executors are edit-only; the coordinator certifies and commits one lot at a time; never push.
- Write sets are declared before claiming; two in-flight WOs never share a file; the coordinator integrates shared files (`package.json`, CI, gate manifests).
- Lane-specific addition: no WO here changes a public signature after it ships; a later WO may only replace the implementation behind it.

### WO-CON-01 Sanctioned import surface: consumer contract document and lint rule
- **Outcome** — `packages/core/docs/consumer-contract/index.md` (from `audit/70-plan/roadmap-draft/consumer-contract.md`, updated to the post-C4 tree) lists every published subpath with its disposition (guaranteed / forbidden / retire-by); the ESLint rule `@rottay/no-unsanctioned-ds-subpath` (published from `./eslint`) fails on any forbidden subpath; the three apps and the showroom run it (findings baselined per app, decrease-only).
- **Why** — 97 of 121 subpaths have no consumer and the apps import fixtures, product packs and an unexported `commercial` subpath (F-42, F-94, F-113); without an executable allowlist the apps keep coupling to what WO-RET-01 removes.
- **Closes** — (decision / enabling WO; F-42 and F-94 close in WO-RET-01) (closure criteria in `audit/30-findings`).
- **Wave** — 1 (milestone A); parallel with WO-CAN-02…06.
- **Depends on** — WO-CAN-01.
- **Steps** —
  1. Copy and update the contract document; record the `commercial.css` situation as forbidden with no DS action (owner scope 2026-09-05: app-platform and the commercial program are out of scope; app-platform resolves it on its side later).
  2. Write the rule with an allowlist read from the document's table (single source); add a fixture test with a forbidden import.
  3. Run the rule over the apps and record the per-app baseline in the contract document (numbers, not promises).
- **Files** — `packages/core/docs/consumer-contract/index.md` (new); `packages/core/src/entrypoints/eslint/rules/no-unsanctioned-ds-subpath/**` (new); `packages/core/src/entrypoints/eslint/index.ts`.
- **Acceptance gate** — Rule fails on `import x from "@rottay/design-system/primitives/button"` and on `./tenant-theme-canary-fixtures`; passes on the guaranteed list; `pnpm --filter @rottay/design-system lint` green; the document lists 121/121 subpaths.
- **Do NOT** — Do not remove any export here (that is WO-RET-01); do not add a subpath to the guaranteed list without a measured consumer.
- **Size** — S.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-CON-01 (Sanctioned import surface: consumer contract document and lint rule) exactly as specified in `roadmap/consumer-contract.md`: read first `audit/README.md` and `audit/70-plan/roadmap-draft/consumer-contract.md`; declare your write set; finish when the acceptance gate passes; report the commands you ran and their output.

### WO-CON-02 mountTenantTheme facade with the final signature over the current pipeline
- **Outcome** — `@rottay/design-system/server` exports `mountTenantTheme(intent) → { rootAttributes, styleElements, artifactDigest, hydrationProof }` with the final signature of WO-EMI-02, implemented today as a thin facade over `compileThemeIntent` + the current artifact renderer + root attributes; the three apps replace their `runtime-tenant-theme/{ssr,contracts,artifact-resolution}` trios by one call (codemod shipped); bytes are identical to the current pipeline. Dated exception: the facade is deleted by WO-EMI-02, which keeps the signature.
- **Why** — Every app re-implements the mount in three files (X-01…X-04 in `audit/70-plan/risks`); freezing the call now means WO-EMI-02 lands without touching the apps (F-19, F-20 close there).
- **Closes** — (decision / enabling WO; F-19 closes in WO-EMI-02) (closure criteria in `audit/30-findings`).
- **Wave** — 1 (milestone A).
- **Depends on** — WO-CAN-01.
- **Steps** —
  1. `infrastructure/runtime/theming/mount/index.ts` (logical path) with the final types; facade over the existing pipeline; `hydrationProof` carries bytes today (scope arrives in WO-EMI-02).
  2. Export from `entrypoints/server`; showroom root layout mounts through it (proof).
  3. Codemod for the apps' trios + a consumer note per app in `docs/consumer-contract`.
- **Files** — `packages/core/src/infrastructure/runtime/theming/mount/**` (new); `packages/core/src/entrypoints/server/index.ts`; `packages/showroom/src/app/layout.tsx`; `packages/core/scripts/maintain/codemods/mount-tenant-theme/**` (new).
- **Acceptance gate** — Test: `mountTenantTheme(staticThemeIntent({vertical}))` bytes equal the current `compileTenantTheme` path for the three verticals; showroom SSR renders with one call; the codemod applied to a copy of app-evnto's trio compiles.
- **Do NOT** — Do not implement scope verification or SSR responsive here (WO-EMI-02); do not leave both the trio and the call alive in the showroom.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-CON-02 (mountTenantTheme facade with the final signature over the current pipeline) exactly as specified in `roadmap/consumer-contract.md`: read first `audit/README.md` and `audit/70-plan/roadmap-draft/consumer-contract.md` §2; declare your write set; finish when the acceptance gate passes; report the commands you ran and their output.

### WO-CON-03 Tenant document v2 accepted at the door, decisions mapped to today's fan-out, "decisions lit" indicator
- **Outcome** — `contracts/theme/decisions` (types of the approved kit, closed domains) and `TenantThemeDocument` v2 `{ version: 2, plan, decisions, overrides? }` exist; `migrate v1→v2` is total and fail-closed; `documentThemeIntent`/`previewThemeIntent` accept v2 and map each decision to what the current lowering propagates today (a dated adapter, deleted by WO-DER-06/WO-CAT-02); decisions without fan-out yet are accepted, recorded and reported; STATUS publishes `decisions lit = n / 29` measured by a computed-style probe (a decision counts when it moves ≥ 1 family in ≥ 1 vertical).
- **Why** — app-platform must write the final document shape from day one so that the derivation lane lights decisions without touching the apps; today only 7 of 22 controls have full effect (`audit/50-matrices/cascade` §1).
- **Closes** — F-06 (partial: document reaches the catalog; keypath coverage completes in WO-CAT-02) (closure criteria in `audit/30-findings`).
- **Wave** — 1 (milestone A).
- **Depends on** — WO-CAN-01, WO-CAT-01.
- **Steps** —
  1. Types from the approved kit (`roadmap/kit-2026-09.md`); v2 document; `migrate v1→v2` with fixtures from real documents.
  2. Door acceptance of v2 for document and preview origins; adapter table decision → current keypaths (single file, ≤ 250 lines, with the deleting WO named in its header).
  3. Probe `decisions-lit` (Playwright computed styles, 3 verticals) and the STATUS indicator.
- **Files** — `packages/core/src/foundation/contracts/theme/decisions/**` (new, logical path); `packages/core/src/foundation/contracts/composition/tenants/themes/tenant-theme/**`; `packages/core/src/infrastructure/compilers/runtime/theme/runtime/ingress/**`; `packages/core/scripts/check/decisions-lit/**` (new); `scripts/maintain/roadmap/status/index.mjs` (indicator).
- **Acceptance gate** — A v2 document with `palette.seeds` compiles to the same bytes as its v1 equivalent; a v2 document with `states.emphasis` is accepted and reported as "not lit"; `decisions-lit` prints `7/22 (+0/10 new)` on the current tree; `migrate v1→v2` fixtures green; `plan` outside the enum refused by name.
- **Do NOT** — Do not derive anything here (no new channels); do not accept `--ds-*` raw overrides in v2 (D-03).
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-CON-03 (Tenant document v2 accepted at the door, decisions mapped to today's fan-out, "decisions lit" indicator) exactly as specified in `roadmap/consumer-contract.md`: read first `audit/README.md`, `audit/70-plan/roadmap-draft/consumer-contract.md` §3–§4 and the fiche of F-06 in `audit/30-findings`; declare your write set; finish when the acceptance gate passes; report the commands you ran and their output.

### WO-CON-04 Milestone A exit gate: a consumer proof and the app migration packets
- **Outcome** — An integration fixture (`tests/integration/consumer/**`) that behaves like an app: mounts through `mountTenantTheme`, writes a v2 document, renders only the sanctioned surface, and passes the lint rule; the migration packet for app-bithire (X-01…X-06 of `audit/70-plan/risks` restricted to bithire, with the codemods of WO-CON-01/02/03) is written as a delegable brief for `app-bithire/roadmap/`; evnto and platform packets are deferred (owner scope 2026-09-05); STATUS shows milestone A as reached only when this gate is green.
- **Why** — "Apps can build" must be a measured state, not a feeling: one fixture that fails when any contract signature changes.
- **Closes** — (decision / enabling WO) (closure criteria in `audit/30-findings`).
- **Wave** — 1 (milestone A; last of the milestone).
- **Depends on** — WO-CON-01, WO-CON-02, WO-CON-03.
- **Steps** —
  1. Fixture app under `tests/integration/consumer` using only guaranteed subpaths.
  2. Migration packet in `docs/consumer-contract/migration/app-bithire.md` (steps, codemod command, acceptance); stubs naming the deferral for evnto/platform.
  3. Gate wired in the gates manifest (post-build) with a drill (planted forbidden import).
- **Files** — `packages/core/tests/integration/consumer/**` (new); `packages/core/docs/consumer-contract/migration/**` (new); `packages/core/scripts/check/automation/gates/manifest/index.mjs`.
- **Acceptance gate** — Fixture green; a planted signature change in `mountTenantTheme` turns it red; the bithire packet exists and names its codemods.
- **Do NOT** — Do not migrate the apps from inside the DS repo; the packets are executed in each app repo by their owners.
- **Size** — S.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-CON-04 (Milestone A exit gate: a consumer proof and the app migration packets) exactly as specified in `roadmap/consumer-contract.md`: read first `audit/README.md` and `audit/70-plan/roadmap-draft/consumer-contract.md`; declare your write set; finish when the acceptance gate passes; report the commands you ran and their output.

### WO-CON-05 Two-track operating protocol: versioned releases, capability-request path, no app-side DS forks
- **Outcome** — After milestone A the two tracks are decoupled by mechanism, not by discipline: the DS publishes versioned releases with changesets (semver; a breaking change only in the 3.0 changeset of WO-RET-01, with codemod); app-bithire pins an exact version and upgrades on its own schedule (no `workspace:*`/local-link in production builds); an app that needs a capability the DS lacks files a WO through the roadmap (`new_work` rule) with the promote-to-DS test, never a `_shared` bridge nor an inline restyle; a weekly "contract diff" (STATUS section) lists every public signature or subpath that changed since the pinned version, so track APP knows exactly what to read.
- **Why** — Owner decision 2026-09-05: one agent improves the DS while another builds BitHire, both autonomous. Without version pinning and a single request path the app track re-grows `_shared/` as a second design system (CLAUDE.md `_shared/` policy) or breaks on every DS commit.
- **Closes** — (decision / enabling WO) (closure criteria in `audit/30-findings`).
- **Wave** — 1 (milestone A; ships with WO-CON-04).
- **Depends on** — WO-CON-04.
- **Steps** —
  1. Release discipline: changesets required for any change under `entrypoints/**` or `docs/consumer-contract/**`; CI fails a PR that changes a guaranteed signature without a changeset.
  2. `docs/consumer-contract/protocol/index.md`: capability-request path (template of the WO, promote-to-DS test, acceptance), version-pinning rule for the apps, upgrade checklist.
  3. STATUS "Contract diff since <pinned version>" section generated from the changesets.
- **Files** — `.changeset/config.json`; `.github/workflows/ci.yml`; `packages/core/docs/consumer-contract/protocol/**` (new); `scripts/maintain/roadmap/status/index.mjs` (contract-diff section).
- **Acceptance gate** — A planted signature change in `entrypoints/server` without a changeset fails CI; the protocol document exists and is linked from `roadmap/README.md`; STATUS prints the contract diff (empty on the first run).
- **Do NOT** — Do not add app-specific components to the DS through this path (promote-to-DS test applies); do not let the DS track edit any app repo.
- **Size** — S.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-CON-05 (Two-track operating protocol: versioned releases, capability-request path, no app-side DS forks) exactly as specified in `roadmap/consumer-contract.md`: read first `audit/README.md` and `audit/70-plan/roadmap-draft/consumer-contract.md`; declare your write set; finish when the acceptance gate passes; report the commands you ran and their output.
