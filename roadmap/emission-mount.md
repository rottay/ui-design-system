---
title: "Design System Emission and mount: one artifact, one preview, one mount law"
date: 2026-09-05
status: canonical (adopted 2026-09-05 from audit/70-plan/roadmap-draft; state lives in roadmap/registry.json)
audience: ai-agent
sources:
  - audit/README.md (verdict, guide for the executor)
  - audit/30-findings/** (closure criteria of every F-nn cited below)
  - audit/70-plan/index.md (blocks, waves, indicators)
  - audit/50-matrices/customization-inventory/index.md §5 (identity kit, approved as-is by the owner on 2026-09-05, D-27)
---

# Emission and mount: one artifact, one preview, one mount law

Station 6 and the mount. One emitter family, one preview, one `mountTenantTheme`, root attributes with a complete SSR projection, runtime that consumes the artifact and never recompiles.

Lane-wide rules (binding on every WO):

- Repo: `/Users/daniel/Developer/Rottay/ui-design-system` (macOS, pnpm). Paths are relative to the repo root unless prefixed; "logical path" means the target-tree grammar of `audit/40-architecture/target` §5. D-21 is decided (owner, 2026-09-05): grammar (b), first level — `packages/core/src/{contracts,kernel,tokens,graphics,compilers,runtime,components,entrypoints}`. A logical path written `.../src/infrastructure/compilers/theme/**` therefore materializes as `.../src/compilers/theme/**`, `.../src/foundation/contracts/theme/**` as `.../src/contracts/theme/**`, and `.../src/infrastructure/runtime/<x>/**` as `.../src/runtime/<x>/**`. New code is born with this grammar from WO-CAT-02; what is not rewritten is normalized in WO-RET-04. `packages/core/scripts/check/architecture/audits/structure/index.mjs` and `CLAUDE.md` still pin the four-tier grammar, so WO-CAT-02 — the first WO that materializes a new first-level root — also amends that gate, its test and the written law.
- Engines: Modern is the only admitted engine; Classic and Rustic stay in the package frozen and fail-closed; no WO in any lane adds content, tokens, tests or a11y work to them (owner decision 2026-09-05).
- Every WO names the audit findings it closes (`Closes`) and is done only when the closure criterion of each cited `F-nn` (`audit/30-findings`) passes on the working tree, in addition to its own acceptance gate and a green DS build/test.
- Uniqueness: a WO that leaves two files or two processes with the same responsibility is not done.
- Executors are edit-only; the coordinator certifies and commits one lot at a time; never push.
- Write sets are declared before claiming; two in-flight WOs never share a file; the coordinator integrates shared files (`package.json`, CI, gate manifests).


### WO-EMI-01 One emitter family, one artifact for every origin, one preview
- **Outcome** — `compilers/theme/emission/{css,artifact,ssr,tokens}`; `emitThemeArtifact(intent, scope)` produces the DB artifact and the first-party artifact through the same path (`TenantThemeArtifact` → `ThemeArtifact`); `EmissionScope` has one grammar and one emission order; one tenant preview in container replaces `preview-scope`, `preview-css` (textual rescoping), `PREVIEW_GROUNDS` and the sandbox's own emission; previews always include `modeBlocks`.
- **Why** — F-17: ≥ 7 CSS text emitters and five previews; F-59: two scope grammars, two rescopers, three emission orders; previews drop modes.
- **Closes** — F-17, F-59, F-05 (closure criteria in `audit/30-findings`).
- **Wave** — 3; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-CAT-03.
- **Steps** —
  1. Emitters; artifact renderer uses `emitThemeArtifact`; scope grammar fixed by `EmissionScope` (the roster no longer carries selector text).
  2. One `TenantPreview` component over `containerScope(id)`; delete the four other preview paths.
  3. Bytes test: preview == publish except the scope.
- **Files** — `packages/core/src/infrastructure/compilers/theme/emission/** (logical path)`; `packages/core/src/infrastructure/compilers/runtime/theme/runtime/emission/**`; `packages/core/src/infrastructure/compilers/runtime/tenant-css/artifact-renderer/**`; `packages/core/src/components/patterns/customization/{brand-studio,branding-preview-sandbox,tenant-preview}/**`; `packages/core/src/infrastructure/compilers/kernel/foundation/css/{tenant-selectors,scope-projection}/**`.
- **Acceptance gate** — Census of functions concatenating CSS text outside `emission/` = 0; `grep -rl "compileThemeIntent\|compileTenantTheme" src/components/patterns/customization | wc -l` = 1; bytes of a published artifact equal the preview bytes modulo scope; every preview emits `modeBlocks.length > 0`.
- **AMENDMENT (R4, 2026-09-08; the original acceptance above stands, this is added to it)** — **RT05** (`audit/95-reaudit-2026-09-08/implementation/findings.md:93`) is routed here from `WO-CAT-03`: publishing a profile compiles a different document than previewing it. The artifact terminal expands `experienceProfile` and injects those defaults into a REPLACEMENT document before calling the facade, while direct preview sends only the profile selection — so the published artifact adds editorial fonts, `--ds-motion-intensity: 0.7` and `--ds-radius-scale: 1.15` among 41 differing base-delta entries, over 12 of 141 representable valid V1 cases. Existing explicit baseline fields outrank the profile's weak defaults on one path; terminal-injected fields gain tenant authorship on the other. The completed "same admission / same door" refactor moved emitted grammar but did not remove this semantic fork. Durable acceptance, verbatim: "profile-to-effective-decision/default expansion must occur once before both preview and publication obtain their authored/provenance facts. Artifact runtime metadata should be projected from that common effective result, not allowed to create new authoring facts independently." Added to this WO's acceptance: preview and publication of the same document yield equivalent **admitted delta objects** (compared as admitted deltas, not as digests, scopes or declaration ordering), and a fixture per registered experience ID × vertical proves it.
- **Do NOT** — Do not keep `preview-css` textual rewriting "for the showroom".
- **Size** — L.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-EMI-01 (One emitter family, one artifact for every origin, one preview) exactly as specified in `roadmap/emission-mount.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-17, F-59, F-05 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-EMI-02 mountTenantTheme: one mount law, complete SSR projection, runtime that never recompiles
- **Outcome** — `@rottay/design-system/server` exports `mountTenantTheme()` (root attributes theme/engine/dir/density/motion/tenant/vertical + `<style data-ds-tenant-theme-*>` + a hydration proof of bytes AND scope); one owner of root attributes with a complete SSR projection; `ResponsiveProvider` publishes its snapshot through `useSyncExternalStore` from an SSR hint (no more mobile-first first paint); `useTokens` reads `ThemeCompilation.runtime` from the mounted artifact; `getCodeOwnedRuntimeConfig` no longer discards `appearance`; `recipeProfile` travels in the artifact only (D-26); `TenantConfig` is identity + bounded branding + artifact reference.
- **Why** — F-19: admission proves bytes but not scope (an admitted artifact may paint nothing); no client writer of `data-ds-root`/`data-vertical`; three root-attribute disciplines; F-20: every first paint is mobile; F-112: the recipe profile channel has no reader and the runtime channel is `undefined` for static tenants.
- **Closes** — F-19, F-20, F-46, F-112, F-89, F-12 (closure criteria in `audit/30-findings`).
- **Wave** — 4; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-EMI-01, WO-CON-02 (whose facade this WO replaces, keeping the signature).
- **Steps** —
  1. `mountTenantTheme` + `resolveVisualAuthority` with scope verification (replace the WO-CON-02 facade in place; signature unchanged; consumer fixture of WO-CON-04 must stay green); delete the app-side and showroom-side mount variants (consumers migrate: X-01…X-04).
  2. Root attributes: single owner; SSR projection complete; `data-density`/`data-ds-motion` before first paint.
  3. Responsive snapshot via `useSyncExternalStore` + SSR hint; `Modal adaptiveFullscreen` renders desktop on desktop SSR.
  4. `useTokens` from the artifact; `TenantConfig` stripped of `brandTheme`, `tokenOverrides`, `personality`, `appearance`, `engine`.
- **Files** — `packages/core/src/infrastructure/runtime/{theming,foundation/root-attributes,tenant,bootstrap,responsive}/**`; `packages/core/src/entrypoints/server/index.ts`; `packages/core/src/foundation/contracts/composition/tenants/index.ts`.
- **Acceptance gate** — Test: valid artifact + `<html>` without `data-ds-root` → `conflict: 'scope'`; `grep -rn "setAttribute('data-" src/infrastructure/runtime` → one owner; SSR test: desktop request renders `<Modal adaptiveFullscreen>` non-fullscreen; integration test: `<Button>` under `RecipeProfileProvider` fed from the artifact receives a profile for a code-owned tenant.
- **Do NOT** — Do not keep a provider-side visual layer (`visualAuthority="provider"`) that compiles in the client.
- **Size** — L.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-EMI-02 (mountTenantTheme: one mount law, complete SSR projection, runtime that never recompiles) exactly as specified in `roadmap/emission-mount.md`: read first `audit/README.md` (guide for the executor) and the fiches of F-19, F-20, F-46, F-112, F-89, F-12 in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.

### WO-EMI-03 Non-CSS token emitter for mobile readiness
- **Outcome** — `emission/tokens` emits a resolved `tokens.json` (expressions resolved in the lowering; no `var()`/`calc()`/`color-mix()` in the output) with a parity test against the CSS artifact; the contracts stop embedding CSS except for declared CSS-typed leaves.
- **Why** — Rubric G.12: today the compilation is a CSS map (25–45 % non-literal values in artifacts) and there is no non-CSS emitter; the motion contracts are the model to copy.
- **Closes** — (decision / enabling WO; closes no finding by itself) (closure criteria in `audit/30-findings`).
- **Wave** — 4; parallel with the other WOs of the same wave whose write sets are disjoint.
- **Depends on** — WO-EMI-01.
- **Steps** —
  1. Resolve expressions in the lowering (or a resolver stage) with typed leaves.
  2. Emit `tokens.json`; parity test CSS ↔ JSON per channel.
- **Files** — `packages/core/src/infrastructure/compilers/theme/emission/tokens/** (logical path)`; `packages/core/src/contracts/theme/compilation/** (new; D-21 (b) first-level grammar, logical path `foundation/contracts/theme/compilation/**` in the audit tree)`.
- **Acceptance gate** — `emitThemeTokens(intent)` produces a JSON with 0 `var(`/`calc(`/`color-mix(` strings and a parity test with the CSS artifact green.
- **Do NOT** — Do not ship a second compilation to produce JSON; it is the same `ThemeCompilation` emitted twice.
- **Size** — M.
- **Delegation prompt** — In `/Users/daniel/Developer/Rottay/ui-design-system`, execute WO-EMI-03 (Non-CSS token emitter for mobile readiness) exactly as specified in `roadmap/emission-mount.md`: read first `audit/README.md` (guide for the executor) and the fiches of the decisions it enables in `audit/30-findings`; declare your write set; Modern is the only engine you may touch; finish when the acceptance gate and every closure criterion pass; report the commands you ran and their output.
