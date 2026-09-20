# Claude Code Rules - Design System

## Owner restriction — 2026-09-19: never invoke Codex

Codex is completely outside autonomous execution, including consultation,
audits, checkpoints and quota fallback. Only the human owner may contact it.
Do not call Codex CLI/API/MCP, send its tasks messages, or create/reactivate
hooks, watchers, scheduled checks or notifications targeting it. Do not make
progress depend on a Codex verdict. Kimi coordinates, normal Claude Opus on
Daniel.Avila implements and real Fable independently audits under the current
roadmap policy. Existing Codex reports are static evidence to reuse, not a
request for follow-up. This restriction supersedes all older role instructions.

## Bootstrap — read before acting

1. **The Modern Rescue programme (WO-CRA-23) is SEALED** (2026-09-05): its R1+
   rounds are superseded by the derivation and family-cut lanes, and its family
   metric is replaced by the programme indicators in `roadmap/STATUS.md`. Its
   contracts — `packages/core/scripts/check/modern-rescue/README.md`,
   `program/index.json`, `orchestration/index.json` — and the quarantined
   `docs/history/inventories/customization-manifest/` are preserved as historical
   evidence. They are not runtime truth and not an acceptance authority: the
   runtime chain is the typed catalog, the per-family derivators, the
   roles/adapters and the emitter. Do not restart a Modern Rescue round against
   them. `AGENTS.md` remains the entry point to those preserved contracts.
2. Start operative work at `roadmap/README.md` and `pnpm roadmap:status`; the
   lane files and `roadmap/registry.json` are the current backlog. Read
   `audit/README.md` for the evidence and closure criteria behind them.
3. General project rules below apply only where those contracts are silent.

## Operating model (owner decree; execution amended 2026-08-30)

- **Kimi K3 is the DT/coordinator** (seat held by Kimi K3 from 2026-08-20,
  handed to Codex by owner order of 2026-08-21 on quota exhaustion of Kimi K3,
  and consummated back to Kimi K3 by explicit owner order of 2026-08-23 —
  `docs/history/prompts/architecture-refactor/2026-08/design-lead-session/index.md`). It decomposes work into
  bounded packets, makes every architecture/adjudication decision, and
  verifies every packet with gates and diff review before any commit. It may
  implement shared integration, delicate surgery or a critical unblock under
  an explicit write-set, but may never self-audit that code.
- **Opus is the primary source writer.** Multiple Opus writers run in parallel
  only on conflict-graph-proven disjoint worktrees. Shared compiler, contracts,
  recipes, manifest and generated authorities remain singleton-owned.
- **Sonnet is the scout and exact-mechanical lane.** It searches, maps
  dependencies and hardcodes, prepares write-sets, regenerates with official
  commands and performs closed substitutions. It does not decide APIs,
  semantics, recipes, fallbacks, compiler behaviour or visual direction.
- **Fable 5 is the primary independent auditor** on every integrated lot.
- **Codex has no execution or consultation seat** (owner restriction above).
  Kimi and the independent Fable reviewer resolve checkpoint/core review;
  agents must not invoke Codex or wait for its signature.
- Cross-model delegation uses real model terminals, each with a bounded brief,
  exact ownership and mechanical acceptance checks. A K3 subagent may not be
  relabelled Opus, Sonnet, Fable or Codex.
- The coordinator decides whether a terminal stays open (context reuse) or
  closes when its packet completes.
- One commit per lot, conventional format, **never push**. Version publishes
  are allowed.
- Default to zero new source comments. A comment is at most two lines and only
  explains non-obvious product behaviour, accessibility, a browser constraint
  or a public API. Never narrate agents, rounds, migrations or programme history.

## Non-Negotiable: No Cross-Module Direct Queries

Apps, verticals, and modules must never query tables owned by another module/schema directly. Cross-module communication must go through the owning module's exported use cases, actions, factories, or repository ports. If a needed capability does not exist, create and export it in the owning module first; do not import foreign Drizzle schemas, create local bridge queries, or duplicate tables across schemas. Infrastructure-only health checks such as `SELECT 1` may test connectivity, but they must not read or mutate module-owned tables.

## Git Rules

- **Author**: davila23 <daniel.avila@rottay.com>
- **NEVER include Co-Authored-By** in commit messages
- **NEVER include "Generated with Claude Code"** in commit messages
- Use conventional commit format: `type(scope): description`

## AI Documentation

- **Capability Map (read first)**: `/docs-engineering/engineering/design-system/capability-map/README.md` — what a tenant can white-label, what an app can consume, with the app-bithire reference adoption per row. Read it BEFORE building new UI, adding a tenant knob, or hand-rolling anything the DS already ships.
- **Component reference**: `/docs-engineering/engineering/design-system/` (hub `/docs-engineering/README.md`); its `architecture/README.md` and `catalog/decision-matrix/README.md` are the ownership contract. **Architecture (target law)**: [`docs/architecture/index.md`](docs/architecture/index.md) — doctrine, the full target tree, and the delta against the current tree. Read it before moving, renaming or deleting anything.
- **Before proposing that anything is redundant**, read [`docs/history/inventories/repository-map/2026-08/index.md`](docs/history/inventories/repository-map/2026-08/index.md) (what every folder does, where something is written twice), [`docs/history/programs/architecture-refactor/2026-08/retention/index.md`](docs/history/programs/architecture-refactor/2026-08/retention/index.md) (which duplicate is canonical; eight owners a liveness-only reading wrongly marked orphan) and [`docs/history/audits/architecture-refactor/2026-08/coordination/index.md`](docs/history/audits/architecture-refactor/2026-08/coordination/index.md) (overturned four removals — `Sheet`, `Popover`, `Statistic`, `Tree` all have in-DS production consumers).

**Documentation Update Rule (CRITICAL).** Changing the catalog means updating its doc in the SAME session, under `docs-engineering/engineering/design-system/`: `components/primitives/{category}/README.md`, `components/patterns/{group}/README.md`, `components/structures/{group}/README.md` or `components/surfaces/pages/README.md` for a tier member; `foundations/{hooks,motion,tokens,contracts}/README.md` for a hook, motion primitive/effect, token structure or contract type; `runtime/engines/README.md` for engine behavior and `runtime/tenancy/README.md` for the tenant/branding model. Update the hub `README.md` inventory counts when component totals change.

## Project Context

- Four canonical engine realms: `classic` (Ant Design 5.21 wrapper), `modern`, `rustic` (vanilla CSS) and `custom` (runtime-registered white-label packs, not a fourth physical implementation). The legacy names `titan` / `hermes` / `apollo` are gone — do not reintroduce them.
- **Modern is the only productive engine** (owner decision 2026-09-05): Classic and Rustic stay in the package, frozen and fail-closed; no work order adds content, tokens, tests or accessibility work to them. Modern is not a DaisyUI skin — `daisy.classConsumers` measures 0 in `engine-token-audit` and the ratchet is decrease-only. Read the counter, not this sentence.
- Engine-backed components may have `engines/{classic,modern,rustic}/index.tsx` siblings selected at runtime via `createEngineComponent()`; do not create fake forwarding engines when one is absent.
- `packages/showroom/` is the standalone Next.js commercial showcase (port 7001, `workspace:*` DS dependency, deploys to showroom.rottay.com). Its marketing landing page is the only Tailwind + lucide-react exception; every other page uses DS components and `@rottay/design-system/icons`, and `src/data/registry/` must stay in sync with `packages/core/`. Reference: `docs-engineering/engineering/design-system/showroom/README.md`.

## Core source-tree hierarchy (NON-NEGOTIABLE)

`packages/core/` has seven source-controlled authority roots: `src/`,
`scripts/`, `tests/`, `contracts/`, `governance/`, `artifacts/`, and `docs/`.
`dist/` is disposable build output, not an authority root.

`packages/core/src` is an ownership and dependency tree, not a flat file
catalog. Its physical hierarchy must make architectural importance and
dependency direction visible.

D-21 (b) (owner, 2026-09-05) fixes the first level as `contracts/`, `kernel/`,
`tokens/`, `graphics/`, `compilers/`, `runtime/`, `components/` and
`entrypoints/`. The legacy aggregate roots `foundation/` and `infrastructure/`
remain declared while they still hold the unmigrated tree; WO-RET-04 normalizes
them. New code is born under the first-level grammar. `components/` owns the
four UI tiers; `entrypoints/` owns classified package boundaries. Every public
subpath boundary lives below it as `folder/index.ts`; `src/index.ts` is the only
file allowed directly at the source root. A top-level `composition/` owner is
forbidden.

The admitted set is declared by name in `ARCHITECTURE_TIERS` /
`CLASSIFIED_SUPPORT_ROOTS` of
`packages/core/scripts/check/architecture/audits/structure/index.mjs`; a root
outside it fails `structure:check` rather than widening the identity baseline.

`packages/core/scripts/` has exactly six intent roots: `build/`, `check/`,
`generate/`, `libraries/`, `maintain/`, and `package/`. Source-layout names are
not valid script roots.

The local dependency order is
`foundation|kernel|contracts|policy|quality|spec|validation` → `runtime` →
`composition|react` → `presentation` → `facade|public`. At the macro
level, `foundation` is lower than the owners that consume it,
`infrastructure/compilers` is lower than `infrastructure/runtime`, and the UI
stack is `primitives → patterns → structures → surfaces`.

- Every authored production unit uses `folder/index.ts` or
  `folder/index.tsx`; free-standing leaf modules are forbidden.
- A barrel may aggregate child owners, but it must not share its level with
  authored production peers. The implementations belong in their own folders.
- Two or more related units form a named family and therefore require another
  grouping level in the tree.
- Once an owner declares named layers, every capability—including manifests
  and generated outputs—must live inside its owning layer; layer folders and
  unlayered capability folders never coexist as peers.
- Foundations must be physically above the runtimes and presentations that
  depend on them. A dependent owner must not sit beside its dependency as an
  architectural peer.
- Unit tests live under the owning unit's `tests/` folder. Cross-unit contract
  tests live under an explicitly named `integration/tests/` or
  `architecture/tests/` owner; tests never sit beside production modules.
- Public package entrypoints, generated sources, declarations, fixtures,
  examples, and stories are explicit classified exceptions. They are not a
  precedent for authored product code.
- Physical moves preserve the package's public subpaths and exported API;
  internal compatibility files must not be left behind merely to keep old
  private paths alive.

Run `pnpm --filter @rottay/design-system structure:check` for every core tree
change. The identity baseline is decrease-only: update it only after reviewing
that all differences are resolved debt caused by an intentional hierarchy
wave. Never baseline a new finding.

When a physical move changes path-keyed paint counters, first dry-run
`pnpm --filter @rottay/design-system engine-audit:relocate-paths`; pass explicit
`--old-root`/`--new-root` for a root migration and add `--write` only after
reviewing the Git rename inventory. This relocates keys without changing a
single ceiling. `--adopt-new-zero` may add only newly discovered zero-valued
path counters and refuses every positive counter; neither mode is permission to
regenerate paint counts.

## Ownership rules

This package is the **single source of truth** for reusable, domain-agnostic UI capability across all Rottay apps.

- The DS owns: primitives, patterns, generic surfaces, page shells, detail shells, detail-form shells, collection workspace shells, layout shells, reusable widget chrome, runtime tenant contracts, product-profile contracts, engine extension points, motion vocabulary, and reusable lane layouts (ranked-row, signal-lane, feed-lane, action-lane).
- The DS does **not** own: tenant/company/user/role/candidate/interview/event semantics, control-plane narrative, recruiting copy, dashboard storytelling, or any product-specific AI/operator narration.
- Before adding a new component, ask: *"Could another app use this without knowing what a tenant, candidate, role, company, interview, or event is?"* If no, it does not belong here — it belongs in the consuming app.
- See `docs-engineering/engineering/design-system/architecture/README.md` and `docs-engineering/engineering/design-system/catalog/decision-matrix/README.md` for the full ownership contract.

## Component taxonomy (4 physical tiers, 5 manifest layers)

`components/` has four tiers: `primitives/` (engine-switched leaves; 6 categories — display, inputs, feedback, layout, navigation, overlay), `patterns/` (generic task widgets; 11 product groups plus the `foundation`/`runtime`/`tooling` support owners), `structures/` (page chrome; `headers`, `workspace`, `record`, `dashboard`, `feedback`, `shell`) and `surfaces/` (declarative page recipes; `foundation/`, `runtime/`, `presentation/pages/`). Anything that must know what a tenant, candidate, role, company, interview or event IS belongs in the consuming app.

The family manifest has exactly five logical layers: `primitive | pattern | structure | surface | chart`. `chart` is an inventory/review cohort whose owner lives under `components/patterns/visualization/charts/`. No sixth layer. `commercial` is a marketing adjective and may never be a layer, family kind or path; `composition` is a dependency role inside an owner, never a tier — `surface-composition` and `commercial/commercial/*` are forbidden forms. A layout shell is `structure/shell/*`; a complete page recipe is `surface/<group>/*`. Support owners (`foundation`, `runtime`, `composition`, `presentation`, `facade`, tests, fixtures, generated artifacts) never create family rows. Every public component has exactly one canonical family ID and one source owner; aliases and compatibility paths resolve to the same row and cannot inflate the denominator. The denominator is an OUTPUT, derived from `family-inventory/index.json` once the reverse public projection reports zero unowned components, and stated in exactly one place — `program/index.json` -> `denominators.visibleFamilies`. Never retain a ghost row to keep a number stable, and never quote the count in prose.

## Premium white-label model (FlatTheme / Theme-ISO)

The control catalog is `packages/core/src/contracts/theme/runtime/catalog` and nothing else (WO-CAT-02): one typed row per approved kit decision. The DB decision schema, the public control document and every gate are views of it; `theme-single-listing` keeps them views. The canonical visual source of truth is the total nested **Theme** under `foundation/contracts/composition/tenants/themes/`; `FlatTheme` is its flat projection (read view plus draft transport — WO-DER-08 splits them), never a patch and never a second authority. Merge chain: `DS base -> vertical baseline -> Theme -> compileTheme -> artifacts`.

- What a tenant authors is `ThemePatch = DeepPartial<ThemeDecisions & SanctionedOverrides>`; it exists only at ingestion and never reaches the compiler. The Theme-shaped layer the resolver merges is `ThemeLayerPatch`, ingestion-only, and may not carry `id` or `name`.
- A first-party vertical is the neutral foundation (`foundation/presets/neutral-theme`) plus its preset document (`foundation/presets/verticals/<slug>/document`), admitted through the same door a DB `TenantThemeDocument` takes. No second compiler, no subset parity fixture, no authored first-party theme.
- First-party tenant CSS (`foundation/tokens/css/facade/artifacts/`) are generated snapshots, not source. `_source/extension.css` is temporary drain debt, not an authority — do not regenerate, hand-edit or rely on it. Domain-specific tokens (`--ds-ticket-*`, `--ds-event-*`, `--rt-*`) belong in consuming apps, not DS core. Production styling is compiled on the server and embedded for SSR; the client hydrates the exact artifact with `visualAuthority="compiled-artifact"`, so browser components do not query the DB and the provider must not emit a competing visual layer.
- The single lowering lives under `packages/core/src/infrastructure/compilers/runtime/theme/runtime/lowering/` and owns the whole `resolveTheme -> compileTheme -> EngineAdapter.project` chain. `docs/architecture/index.md` §"No second compiler" is the law; `tests/architecture/theme-lowering-single-door/` fails if a second one reappears.
- `TenantAppearanceAdvanced` is the normalized compiler/compat shape, not the DB write contract. `TenantThemeDocument` exposes bounded advanced fields compiling into `chrome.{controls,table,cardComponent,modal,tabs,sidebar,layout,shell}` plus `tokenOverrides` (raw `--ds-*`, max 200), sharing its chrome mapping through `kernel/foundation/css/chrome-variables`.
- **Paint is skin-first.** Modern components are painted by their skin file (`foundation/tokens/css/runtime/engines/modern/skin/<component>.css`), keyed on the `data-part` / `data-state` / `data-variant` anatomy the TSX stamps; the TSX owns structure and interaction state only. The skin reads component channels with a chained fallback to the cascade roots — `var(--ds-button-primary-bg, var(--ds-color-primary))`. Nobody restyles a primitive's internals and nobody edits an engine TSX to change how a component looks. Inline `var(--ds-*)` reads left in engine files are migration debt tracked by the decrease-only paint censuses, not the pattern to copy. Reference implementation: `Button`.

## Icons, marks and charts

New product code uses supplier-independent semantic names: `import { Icon } from '@rottay/design-system/icons'` with `<Icon name="action.search" decorative />` or a non-empty `label` — `IconProps` requires one of the two. Phosphor is the pinned default supplier and is confined to the adapter/generator boundary under `packages/core/src/graphics/icons/`; apps MUST NOT import Phosphor, Lucide or Ant icons directly, and the Lucide-shaped named catalog is compatibility-only. Tenants may change semantic tone only, never supplier, glyph, role mapping, weight family or motion recipe. Add a governed role to `graphics/icons/semantic/sources/corpus/manifest.json`, map it in the pinned adapter manifest, then run `pnpm -C packages/core icons:generate`. Size via `--ds-icon-{xs|sm|md|lg|xl|2xl}-size`; color via `currentColor`. Brand identity is a separate asset class: use `BrandMark` / `CloudServiceMark` from `@rottay/design-system/marks`; `@thesvg/react` stays inside `graphics/marks/runtime/adapters/`. Never use a brand mark for an action/navigation concept, never load one remotely, never pass supplier types through the public API. Charts are D3-backed, engine-agnostic, token-aware, personality-driven and accessible, living under `components/patterns/visualization/charts/families/`; they consume `var(--ds-color-*)` natively in SVG and resolve to hex through `useChartTheme` only for D3 color math, with `FlatTheme.charts` driving personality.

## Governed claim contracts

The generated GAT07 blocks below are gated by hash — do not edit, reflow or relocate them by hand; regenerate with `pnpm -C packages/core claim-exactness:write`.

<!-- GAT07-CLAIM surface-profile-overrides: active; runtime=declared-32-applied-31; affirmative-behavior=true; owner=DS-IMP-022 -->

GAT07-CONTRACT surface-profile-overrides: symbols=[SurfaceVisualOverrides, useSurfaceProfileDefaultsWithOverrides, visual.profileOverrides]; disposition=active; runtime-status=declared-32-applied-31; affirmative-behavior=true; production-consumers=31; executable-assertions=2; owner=design-system-program/DS-IMP-022; target-phase=2A.

Census, checker-measured from source and deliberately NOT a parity claim: **32** governed field declarations across **2** definition owners (`structures/foundation/chrome/contracts`, `surfaces/foundation/contracts`); **31** applied by a direct call to the governed hook, giving **31** production consumers; **0** showroom references; **0** unsupported governed references. The single declared-but-never-applied field belongs to `SidebarSurfaceVisualConfig`.
