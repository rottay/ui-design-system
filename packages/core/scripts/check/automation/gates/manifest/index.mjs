/**
 * The single inventory of gates CI must run.
 *
 * WHY THIS FILE EXISTS. The blocking gates lived only in the `pretest` npm
 * hook. npm/pnpm fire `pre<name>` for the EXACT script name, and CI runs
 * `test:ci` -- so `pretest` never fired in CI and sixteen gates that looked
 * enforced were not. Their self-drills DID run, which made the dashboard
 * greener than the code. Re-listing the chain in YAML would have created a
 * second inventory to drift; this module is the ONE inventory, consumed by
 * both `pretest` and the CI job.
 *
 * THE RULE THIS ENCODES. A gate is either blocking or it is explicitly and
 * loudly excluded, with a reason and an owner. There is no third state. The
 * pattern that produced the worst finding of the audit -- `pnpm run motion-contracts:check
 * || echo "::warning"`, a gate declared blocking that could never block -- is
 * unrepresentable here: `blocking: false` REQUIRES `excluded`, and the runner
 * prints every exclusion in its summary.
 */

/**
 * Order is deterministic and meaningful: cheap correctness first, then
 * artifact/staleness checks, then the expensive census gates. A failure stops
 * the run, so the cheapest signal that can fail should fail first.
 */
export const CI_GATES = Object.freeze([
  // --- contract + provenance (cheap, fail fast) ---
  // First: a workflow that references a script which does not exist cannot be
  // trusted to run anything below.
  { id: 'workflow-script-wiring', run: ['node', 'scripts/check/automation/wiring/workflows/index.mjs'], blocking: true },
  // A named import of a binding the target module never publishes is `undefined`
  // at runtime and renders an invalid element. A deep-path import rewrite landed
  // 22 of them at once because the short alias for a compound primitive lives in
  // the parent barrel; no other gate in this list can see that edge.
  { id: 'import-binding-integrity-drill', run: ['node', '--test', 'scripts/check/architecture/import-binding-integrity-gate/index.test.mjs'], blocking: true },
  { id: 'import-binding-integrity', run: ['node', 'scripts/check/architecture/import-binding-integrity-gate/index.mjs'], blocking: true },
  // The §1.2/§2.9 law on the scripts/ tree itself, with a decrease-only
  // hand-adjudicated baseline (F0.5 Paso D). Without it the tree re-flattens
  // at the first new file.
  { id: 'scripts-tree-drill', run: ['node', '--test', 'scripts/check/architecture/conventions/scripts-tree/index.test.mjs'], blocking: true },
  { id: 'scripts-tree', run: ['node', 'scripts/check/architecture/conventions/scripts-tree/index.mjs'], blocking: true },
  { id: 'retired-vertical-identity-drill', run: ['node', '--test', 'scripts/check/verticals/retired-identity/index.test.mjs'], blocking: true },
  { id: 'retired-vertical-identity', run: ['node', 'scripts/check/verticals/retired-identity/index.mjs'], blocking: true },
  { id: 'graphics-licenses:check', run: ['pnpm', 'run', 'graphics-licenses:check'], blocking: true },
  // The structural packaging check composes the cheaper license check above
  // with supplier identity, entrypoint closure, declarations and retention.
  // Final acceptance remains a separate mode while sighted evidence is pending.
  { id: 'graphics-packaging-integrity', run: ['node', 'scripts/check/graphics-packaging/index.mjs', '--structural'], blocking: true },
  { id: 'effects:provenance', run: ['pnpm', 'run', 'effects:provenance'], blocking: true },
  { id: 'contract:check', run: ['pnpm', 'run', 'contract:check'], blocking: true },
  { id: 'daisy-projection-contract', run: ['node', '--test', 'scripts/generate/framework-class-paint/tests/index.test.mjs'], blocking: true },
  { id: 'quality-evidence-v2-drills', run: ['node', '--test', 'scripts/quality-evidence/v2/drills.test.mjs'], blocking: true },
  // The `spacing.rhythm` control census the modern-rescue manifest asks for:
  // rhythm owns the room around a control, never the control's size, capacity,
  // touch target, icon, type or motion -- and never a physical inline side,
  // which would break RTL. It ships with NO baseline and NO file list: the
  // corpus is walked from the authored source root and the offending family is
  // resolved from `family-inventory/index.json`, so a NEW off-contract reader is a
  // failure rather than an unchanged count. Drill first: a classifier that
  // returned "allowed" for everything would report zero findings and look
  // exactly like a clean tree.
  { id: 'spacing-rhythm-contract-drill', run: ['node', '--test', 'scripts/check/tokens/contracts/spacing-rhythm/index.test.mjs'], blocking: true },
  { id: 'spacing-rhythm-contract', run: ['node', 'scripts/check/tokens/contracts/spacing-rhythm/index.mjs'], blocking: true },
  // The channel-liveness producer for the modern-rescue evidence-contract
  // artifact `channel-liveness.json` (execution gate 5: "complete
  // control/family edges, recipe groups and CHANNEL LIVENESS"). Scoped to
  // TENANT_THEME_OVERRIDE_TOKENS / TENANT_THEME_REFERENCE_TOKENS / the
  // brand-theme compiler's own emissions -- NOT a restatement of
  // customization-surface-census.mjs, tenant-channel-consumer-gate.mjs or
  // theme-channel-parity-gate.mjs (see the producer's own docblock for the
  // boundary). A false negative here looks like: the tint-4/tint-16
  // protected bucket (a channel on the public tenant-reference var()
  // allowlist) silently collapsing into an unprotected "no known route"
  // verdict, the word "dead" reappearing in a classification, a NEW
  // off-contract unread channel shipping without tripping the
  // self-referential ratchet against the previously written evidence
  // artifact, or a family-inventory drift (a new component folder landing
  // before its family row) going unreported because the unknown-family
  // check stopped firing. Drill first: a classifier that returned a
  // live/protected verdict for everything would report zero findings and
  // look exactly like a clean tree.
  { id: 'channel-liveness-drill', run: ['node', '--test', 'scripts/check/tokens/cascade/channels/liveness/index.test.mjs'], blocking: true },
  // Excluded from blocking: the channel debt this gate measures is
  // authorship/theme-value work, not zero-delta rewiring — proven empirically
  // on 2026-08-20 when the 12 zero-delta recables of F2.4 drained ZERO
  // findings (24 AUTHORABLE_UNPROVEN_EFFECT + 3 READ_NO_PRODUCTIVE_TERMINAL
  // + 1 READ_UNPROVEN + 4 UNREAD_EMITTED_NO_KNOWN_ROUTE + 52 unknown-family
  // consumer sites; census identical to 2026-08-19). Drain ownership per the
  // sequence amendment (2026-08-20): accent/tints/overlays/glass ladders are
  // theme-value decisions -> F4A/F4B; the remainder + unknown-family ->
  // F2-asymmetric (post-F4B). The drill stays blocking so the classifier
  // itself cannot rot. Return to blocking = findings drained, not
  // re-baselined.
  {
    id: 'channel-liveness',
    run: ['node', 'scripts/check/tokens/cascade/channels/liveness/index.mjs', '--check'],
    blocking: false,
    excluded: {
      reason: 'Channel debt is authorship/theme-value work, not zero-delta rewiring (proven 2026-08-20: 12 recables drained 0 findings). Ladders accent/tints/overlays/glass drain in F4A/F4B; the rest + 52 unknown-family in F2-asymmetric. Drill remains blocking.',
      owner: 'F4A/F4B + F2-asymmetric (sequence amendment 2026-08-20, roadmap §5/§12)',
      trackedSince: '2026-08-20',  // re-adjudicada en el cierre de F2-seguro (antes: c8063fdb9, F2 monolítico)
    },
  },

  // --- source-owned artifact freshness: this manifest runs before Build ---
  // These gates execute the authored TypeScript roster and compile CSS from
  // source in memory. A dist/-backed check here is invalid on a clean clone and
  // can also compare committed output against a stale local build.
  { id: 'first-party-roster-drill', run: ['node', '--test', 'scripts/libraries/roster/index.test.mjs'], blocking: true },
  { id: 'first-party-artifacts-source-staleness', run: ['pnpm', 'exec', 'vitest', 'run', 'src/foundation/tokens/tests/first-party-artifacts-generated.test.ts'], blocking: true },
  { id: 'vertical-css-source-staleness', run: ['node', '--test', 'scripts/build/verticals/css-freshness/index.mjs'], blocking: true },
  // Single-author law, replacing the retired artifact-provenance trio. That
  // gate BOUNDED a second author (the hand-written `_source/extension.css`)
  // by reading the compiled block back out of the committed artifact; the
  // second author is now gone, so the stronger law is enforced instead of the
  // weaker bound. The split below is deliberate:
  //   * the source-plane gate reads only authored files, so it is valid on a
  //     clean clone and cannot be fooled by a stale local dist/;
  //   * the render laws run under vitest against the TypeScript renderer,
  //     because fresh-render ink causality cannot be asserted by a node gate
  //     without importing dist/.
  // Committed-byte closure is by composition: the render laws pin the fresh
  // output, and `first-party-artifacts-source-staleness` above byte-compares
  // that same fresh output against the committed artifact.
  { id: 'first-party-single-author-drill', run: ['node', '--test', 'scripts/check/verticals/single-author/index.test.mjs'], blocking: true },
  { id: 'first-party-single-author', run: ['node', 'scripts/check/verticals/single-author/index.mjs', '--check'], blocking: true },
  { id: 'first-party-single-author-render-laws', run: ['pnpm', 'exec', 'vitest', 'run', 'src/infrastructure/compilers/runtime/tenant-css/artifact-renderer/tests/single-author.test.ts'], blocking: true },

  // --- structural / ownership ---
  { id: 'folder-naming', run: ['pnpm', 'run', 'lint:folders'], blocking: true },
  { id: 'engine-token-audit', run: ['node', 'scripts/check/engine/tokens/audit/index.mjs', '--check'], blocking: true },
  // ARCHITECTURE §1.6: "a per-component channel with no path to any root is
  // debt, and the orphan count is a decrease-only ratchet". Este es ese
  // contador -- no existia. Drill primero, como en todo el archivo: el gate
  // COMPUTA una clasificacion, y un clasificador que dejo de clasificar
  // reporta un numero plausible y se ve igual que un arbol sano.
  {
    id: 'cascade-wiring-ratchet-drill',
    run: ['node', '--test', 'scripts/check/engine/cascade-wiring/index.test.mjs'],
    blocking: true,
  },
  {
    id: 'cascade-wiring-ratchet',
    run: ['node', 'scripts/check/engine/cascade-wiring/index.mjs'],
    blocking: true,
  },
  // Generated manifest views must match their live sources.
  { id: 'fanout-facts-freshness', run: ['node', 'scripts/generate/tokens/manifest/fanout/index.mjs', '--check'], blocking: true },
  { id: 'root-checklists-freshness', run: ['node', 'scripts/generate/tokens/manifest/root-checklists/index.mjs', '--check'], blocking: true },
  { id: 'mirror-parity-freshness', run: ['node', 'scripts/generate/tokens/manifest/mirror-parity/index.mjs', '--check'], blocking: true },
  // El cuarto mide la FUENTE, no el artefacto: variant-parity es el canon
  // estructural de los 3 themes y corre sin build. Su `--check` es frescura Y
  // trinquete (divergentSlots / untaggedAuthoredLeaves, decrease-only).
  { id: 'variant-parity', run: ['node', 'scripts/generate/tokens/manifest/variant-parity/index.mjs', '--check'], blocking: true },
  // The exact proof runs the audit above a second time inside two deterministic
  // passes and adds the planes no other gate covers: the claim/contract census in
  // the documentation, the code-derived vertical rows, the data-part corpus, and
  // the whole-file SHA-256 documentation seal. It was reachable only through
  // `pnpm run claim-exactness:check`, so a doc could contradict source with the whole
  // dashboard green. It sits AFTER the audit deliberately: when the audit is red
  // this gate is red for the same reason but far more slowly.
  { id: 'claim-exactness', run: ['node', 'scripts/check/evidence/certification/claims/exactness/index.mjs', '--check-artifact'], blocking: true },
  { id: 'anatomy-variant-gate', run: ['node', 'scripts/check/engine/runtime/anatomy-variants/index.mjs', '--check'], blocking: true },
  { id: 'size-axis-law-gate', run: ['node', 'scripts/check/boundaries/components/sizing/index.mjs', '--check'], blocking: true },
  { id: 'application-boundary-drill', run: ['node', '--test', 'scripts/check/boundaries/components/imports/index.test.mjs'], blocking: true },
  { id: 'application-boundary-gate', run: ['node', 'scripts/check/boundaries/components/imports/index.mjs', '--check'], blocking: true },
  { id: 'pattern-surface-ownership', run: ['node', 'scripts/check/boundaries/surfaces/ownership/index.mjs', '--check'], blocking: true },
  // Este gate verifica DOS cosas por la misma corrida: la FORMA de los 77
  // entrypoints publicos (owner, boundary, simbolos, fan-out, barriles
  // prohibidos) y, desde el lote DRILL-77 (2026-08-28), el ANCLA DECRECE-SOLO de
  // sus `budget.maxSourceBytes`.
  //
  // POR QUE ENTRA AL BARRIDO AHORA. Hasta hoy corria SOLO en `prebuild` y
  // `prepack` (`public-entrypoints:check`): 0 entradas aca. Eso alcanzaba
  // mientras la unica ley era la forma, que cambia cuando alguien toca el
  // manifest a proposito. El techo es otra cosa: engorda por acumulacion, un
  // import a la vez, y enterarse recien al empaquetar es enterarse tarde. El
  // asiento E-2 dejo la ley decrece-solo escrita en prosa y sin verificador; el
  // lote DRILL-77 le puso el ancla y esta entrada le pone la corrida.
  //
  // EL DRILL VA PRIMERO, y aca la razon vale doble. `public-entrypoints:test`
  // estaba definido en package.json y no lo invocaba NADIE -- una sola aparicion
  // en el archivo, la de su propia definicion -- asi que estos drills no corrian
  // ni en el barrido, ni en prebuild, ni en prepack. El gate se entera tarde si
  // solo corre en prepack; sus drills no se enteraban nunca. Y sin ellos el
  // ancla decrece-solo se puede desarmar sin que nada enrojezca: medido en este
  // mismo lote, `isValidCeiling` devolviendo `true` deja pasar diez formas
  // corruptas de techo con el gate en verde.
  { id: 'public-entrypoint-boundary-drill', run: ['node', '--test', 'scripts/check/boundaries/public-api/index.test.mjs'], blocking: true },
  { id: 'public-entrypoint-boundary', run: ['node', 'scripts/check/boundaries/public-api/index.mjs'], blocking: true },
  { id: 'engine-freeze-gate', run: ['node', 'scripts/check/engine/lifecycle/freeze/index.mjs', '--check'], blocking: true },
  { id: 'portal-substrate-gate', run: ['node', 'scripts/check/boundaries/surfaces/portals/index.mjs', '--check'], blocking: true },
  // Bidirectional identity between every `--_ds-proto-*` in the sources and its
  // row in `governance/tokens/prototypes/index.json`. It ships with NO
  // baseline, so the drill carries the whole burden of proving the scan can
  // fail -- including that a name quoted in prose is not a declaration, and
  // that a governed prototoken compiled into a shipped bundle is legal while an
  // ungoverned one is not. Drill first: a census computed by a broken scanner
  // would report zero findings and look identical to a clean tree.
  { id: 'prototype-ledger-drill', run: ['node', '--test', 'scripts/check/tokens/governance/prototypes/index.test.mjs'], blocking: true },
  { id: 'prototype-ledger', run: ['node', 'scripts/check/tokens/governance/prototypes/index.mjs', '--check'], blocking: true },

  // --- paint validity + shipped-bundle honesty ---
  //
  // Both gates existed with passing drills and were reachable only by hand, so
  // nothing in CI held the law they encode. Triage 2026-08-19: both green on
  // the current tree, so they enter blocking rather than being deleted.
  //
  // color-mix argument purity: an argument that resolves to a gradient, a
  // shadow list or a bare number makes the WHOLE declaration invalid at
  // computed-value time, so the surface paints nothing. Invalid CSS does not
  // throw, does not warn and does not move a snapshot -- no suite can see it.
  // The script parses no flags; its own corpus floor (300 stylesheets) is what
  // stops a broken glob from passing by scanning nothing.
  { id: 'color-mix-argument-purity-drill', run: ['node', '--test', 'scripts/check/tokens/cascade/purity/color-mix/index.test.mjs'], blocking: true },
  { id: 'color-mix-argument-purity', run: ['node', 'scripts/check/tokens/cascade/purity/color-mix/index.mjs'], blocking: true },
  // Shipped bundles carry no third-party framework CSS. Safe to run before
  // Build: the five committed `styles/*.css` mirrors are required and the
  // `dist/*` copies are audited only when present, so a clean clone certifies
  // the same law without a build step.
  { id: 'modern-bundle-framework-drill', run: ['node', '--test', 'scripts/check/engine/lifecycle/framework-bundle/index.test.mjs'], blocking: true },
  { id: 'modern-bundle-framework', run: ['node', 'scripts/check/engine/lifecycle/framework-bundle/index.mjs'], blocking: true },
  // The palette seam: `--ds-chart-series-1..10` may be DEFINED only by a
  // tenant-scope compiler, never by anything closer to the marks. It was
  // orphaned and red on 2026-08-19 -- not because a component had defined the
  // channel, but because the palette authority moved into the brand-theme
  // compiler in dcc65ca34 without the allowlist moving with it. Allowlist
  // corrected, drill re-pinned at two sanctioned definers, gate wired here so
  // the next such move cannot land unreviewed.
  { id: 'chart-series-reserved-name-drill', run: ['node', '--test', 'scripts/check/tokens/contracts/chart-series/index.test.mjs'], blocking: true },
  { id: 'chart-series-reserved-name', run: ['node', 'scripts/check/tokens/contracts/chart-series/index.mjs', '--check'], blocking: true },

  // --- D0 customization-surface truth (drill first: a census computed by a
  // broken scanner reports zero findings and looks identical to a clean
  // tree). The report is DERIVED from the existing authorities (hooks
  // manifest, capability registry, raw allowlist, expressive lists) plus a
  // PostCSS/TS-AST consumption scan; these gates keep it fresh, fully
  // classified, evidence-backed and decrease-only on dead writers.
  { id: 'customization-surface-drill', run: ['node', '--test', 'scripts/generate/tokens/customization/surface/tests/gate/index.test.mjs', 'scripts/generate/tokens/customization/surface/tests/classifier/index.test.mjs'], blocking: true },
  { id: 'customization-surface-freshness', run: ['node', 'scripts/generate/tokens/customization/surface/index.mjs', '--check=freshness'], blocking: true },
  { id: 'customization-surface-classification', run: ['node', 'scripts/generate/tokens/customization/surface/index.mjs', '--check=classification'], blocking: true },
  { id: 'customization-capability-consumers', run: ['node', 'scripts/generate/tokens/customization/surface/index.mjs', '--check=capabilities'], blocking: true },
  { id: 'customization-dead-writers', run: ['node', 'scripts/generate/tokens/customization/surface/index.mjs', '--check=dead'], blocking: true },
  // Official tokens documentation is a deterministic projection; stale docs,
  // derivation cycles, undocumented public hooks, unknown capability
  // channels and unadjudicated dual authorities all block here.
  { id: 'tokens-catalog-drill', run: ['node', '--test', 'scripts/generate/tokens/customization/catalog/tests/index.test.mjs'], blocking: true },
  { id: 'tokens-catalog', run: ['node', 'scripts/generate/tokens/customization/catalog/index.mjs', '--check'], blocking: true },
  // Preserve source provenance for every customization surface.
  { id: 'customization-preservation-drill', run: ['node', '--test', 'scripts/generate/tokens/customization/preservation/index.test.mjs'], blocking: true },
  { id: 'customization-preservation', run: ['node', 'scripts/generate/tokens/customization/preservation/index.mjs', '--check'], blocking: true },

  // Every fenced read carries exactly one ownership row.
  { id: 'reads-adjudication', run: ['node', 'scripts/check/tokens/cascade/reads/index.mjs'], blocking: true },

  // Worklist bindings must resolve to shipped CSS and rendered nodes.
  { id: 'customization-worklist-drill', run: ['node', '--test', 'scripts/check/tokens/customization/visual-worklist/index.test.mjs'], blocking: true },
  { id: 'customization-worklist', run: ['node', 'scripts/check/tokens/customization/visual-worklist/index.mjs'], blocking: true },

  // Every counted Modern font-size literal carries an ownership row.
  { id: 'literal-ownership-drill', run: ['node', '--test', 'scripts/check/engine/tokens/literal-ownership/index.test.mjs'], blocking: true },
  { id: 'literal-ownership', run: ['node', 'scripts/check/engine/tokens/literal-ownership/index.mjs'], blocking: true },

  // The published controls table is generated from current product contracts.
  // Both its freshness check and its drill suite need `dist/` -- the drill
  // suite imports `check()`/`build()` from the generator module, which loads
  // the compiled tenant capability registry the same way the freshness check
  // does -- so neither can run in this pre-build chain. Both run post-build
  // in CI instead.

  // --- white-label channel + theme parity ---
  { id: 'theme-channel-parity', run: ['node', 'scripts/check/tokens/cascade/channels/theme-parity/index.mjs', '--check', '--quiet'], blocking: true },
  { id: 'tenant-channel-consumer', run: ['node', 'scripts/check/tokens/cascade/channels/consumers/index.mjs', '--check'], blocking: true },
  { id: 'tenant-channel-consumer-modern', run: ['node', 'scripts/check/tokens/cascade/channels/consumers/index.mjs', '--modern-check'], blocking: true },
  // Drill first: the reachability census is baseline-backed, so a measurer that
  // quietly stopped resolving names would report zero violations and read as clean.
  { id: 'tenant-reachability-drill', run: ['node', 'scripts/check/orchestration/tests/drills/tenant-reachability/index.mjs'], blocking: true },
  { id: 'tenant-reachability', run: ['node', 'scripts/check/orchestration/public/tenant-reachability/index.mjs'], blocking: true },
  { id: 'i18n-key-parity', run: ['node', 'scripts/check/localization/index.mjs', '--check'], blocking: true },
  // CI checks app-bithire out explicitly and local workspace runs discover the
  // sibling repository. NOT `--optional`: a missing corpus is a hard failure,
  // and the manifest validator forbids downgrading a blocking gate.
  { id: 'app-ds-boundary', run: ['node', 'scripts/check/boundaries/applications/styles/index.mjs', '--check'], blocking: true },
  { id: 'app-ds-boundary-drill', run: ['node', '--test', 'scripts/check/boundaries/applications/styles/index.test.mjs'], blocking: true },
  // Answers the question the boundary gate above does not: WHICH `--ds-*`
  // properties an app may assign, and under what scope (audit 2026-07-26,
  // independent code audit C3). Its allowlist is derived from DS source, so the drill runs
  // first: an anchor that has drifted must surface as a drill failure, not as
  // a corpus verdict computed from a degraded allowlist.
  { id: 'app-ds-hook-contract-drill', run: ['node', '--test', 'scripts/check/boundaries/applications/hooks/index.test.mjs'], blocking: true },
  { id: 'app-ds-hook-contract', run: ['node', 'scripts/check/boundaries/applications/hooks/index.mjs', '--check'], blocking: true },
  // The contract is only "exported and consumed" (independent code audit C6.6) if the artifact an
  // app resolves matches the DS it was derived from. This gate fails on a stale
  // contracts/css/hooks/index.json, on a missing package export, and on an export that
  // resolves in-repo but would 404 for an installed consumer. Without it the
  // published contract can drift silently, which is worse than not publishing:
  // apps would consume a hook list the DS no longer honours.
  { id: 'application-hook-contract-freshness', run: ['node', 'scripts/check/boundaries/applications/hooks/index.mjs', '--manifest-check'], blocking: true },
  // The same boundary at the DOM instead of the stylesheet (audit 2026-07-26,
  // independent code audit C6.7): governed root channels have one SSR projection and one
  // hydrated owner, so an application holds no raw `<html>` writer. It ships
  // with no baseline, so the drill carries the whole burden of proving the
  // scan can fail -- including on the computed attribute names the writer this
  // gate was built for actually used.
  { id: 'app-root-writer-drill', run: ['node', '--test', 'scripts/check/boundaries/applications/root-state/index.test.mjs'], blocking: true },
  { id: 'app-root-writer', run: ['node', 'scripts/check/boundaries/applications/root-state/index.mjs', '--check'], blocking: true },

  // --- motion governance, DS slice ---
  //
  // BLOCKING again as of 2026-07-26. It was excluded while its 12 findings
  // looked like R1 regressions; scanning a clean archive of the ACCEPTED commit
  // a5a4c3b4 reproduced every one of them, so the registry -- authored
  // 2026-07-17 -- had simply gone stale. The ui-design-system rows were
  // re-anchored to that commit ONCE, with provenance recorded in
  // `scripts/check/contracts/motion/registry/index.json` under `reanchor`.
  //
  // The cross-repo slice stays out of this job: it audits four sibling
  // repositories and throws on a missing one. app-bithire and app-platform
  // carry their own motion debt and own their own rows.
  { id: 'motion-contracts', run: ['node', 'scripts/check/contracts/motion/index.mjs', '--repositories', 'ui-design-system'], blocking: true },
  { id: 'motion-contracts-drill', run: ['node', '--test', 'scripts/check/contracts/motion/tests/index.test.mjs'], blocking: true },

  // --- canonical taxonomy parity (WO-CRA-23 source-plumbing item 10) ---
  //
  // The gate is blocking. Every condition its exclusion was owed to is closed.
  //
  // All four bindings compute on all 255 rows. `public` is the one a wrong
  // inventory cannot fake: `libraries/taxonomy/roots` reads source and
  // never consults a row about itself, so `sourceResolution` and
  // `declaredComponentsPublic` are deliberately not read.
  //
  // The reverse projection is fail-closed. A public name that does not resolve
  // to a declaration is reported BY NAME -- `MISSING`, `UNRESOLVED`,
  // `AMBIGUOUS`, `CYCLE_ONLY`, and any state the resolver grows later, via the
  // fallback at the call site. `TYPE_ONLY` is the single explicit skip, because
  // a published type is legal public API that owes no family row. The earlier
  // `state !== 'VALUE' -> continue` was the opposite: it hid 21 exports whose
  // terminal file nobody could see, and printed OK.
  //
  // Freshness is a PREREQUISITE, not a nicety, and it is listed here rather
  // than left to the `validateCustomizationManifest()` side effect inside
  // program-check. Taxonomy reads `governance/manifest/index.json` and the per-family
  // cells as evidence; against a manifest nobody regenerated it can green on
  // stale rows. The explicit entry below, and its position ahead of this
  // chain, are the CI-level contract -- a hidden side effect is not one.
  //
  // Drill first: a generator that has quietly stopped detecting drift reports
  // zero findings and looks identical to a clean tree.
  {
    id: 'manifest-generator-drill',
    run: ['node', '--test', 'scripts/generate/tokens/manifest/generation/index.test.mjs'],
    blocking: true,
  },
  {
    id: 'modern-rescue-customization-manifest-freshness',
    run: ['node', 'scripts/generate/tokens/manifest/generation/index.mjs', '--check'],
    blocking: true,
  },
  // The drill runs on synthetic fixtures and fails if the gate stops detecting
  // any planted category, wrong component name or wrong group -- which is what
  // keeps the gate from decaying into a file nobody has run.
  {
    id: 'taxonomy-parity-drill',
    run: ['node', '--test', 'scripts/check/taxonomy/parity-gate/index.test.mjs'],
    blocking: true,
  },
  // A nested sourceOwner is not a style question: the inner family's folder sits
  // inside the outer family's declared territory, so every containment-based
  // reading -- ownership, reverse attribution, derived lane exclusion -- has two
  // defensible answers. Its planted negative is the real
  // connected-command-palette/search-command-bar defect this drill was written
  // against, so a regression to `return []` fails rather than reporting clean.
  {
    id: 'taxonomy-owner-nesting-drill',
    run: ['node', '--test', 'scripts/libraries/taxonomy/owners/index.test.mjs'],
    blocking: true,
  },
  // The resolver is the taxonomy gate's only binding an incorrect inventory
  // cannot fake, which makes its own blind spots the weakest link in the chain.
  // Both drilled defects were live: alias re-exports invented ambiguity that did
  // not exist, and `Object.assign` compounds read as plain values.
  {
    id: 'taxonomy-public-root-drill',
    run: ['node', '--test', 'scripts/libraries/taxonomy/roots/index.test.mjs'],
    blocking: true,
  },
  {
    id: 'taxonomy-parity',
    run: ['node', 'scripts/check/taxonomy/parity-gate/index.mjs'],
    blocking: true,
  },
  // The --ds_ experimentation space never reaches shipped CSS (canon: --ds-).
  {
    id: 'ds-prefix',
    run: ['node', 'scripts/check/tokens/governance/private-prefix/index.mjs'],
    blocking: true,
  },
  // The 63-root cascade catalog must agree with the tree it describes; until
  // this gate existed nothing read it at all.
  {
    id: 'root-catalog-freshness',
    run: ['node', 'scripts/check/tokens/cascade/roots/catalog-freshness/index.mjs'],
    blocking: true,
  },
  // Companion to the freshness gate and deliberately disjoint from it: that one
  // answers whether a head channel EXISTS, this one answers WHO is allowed to
  // move it. Drill first, as everywhere in this file -- the gate computes a
  // verdict, and a computation that has quietly stopped detecting anything
  // reports zero findings and looks exactly like a clean tree.
  {
    id: 'root-exposure-drill',
    run: ['node', '--test', 'scripts/check/tokens/cascade/roots/exposure/index.test.mjs'],
    blocking: true,
  },
  {
    id: 'root-exposure',
    run: ['node', 'scripts/check/tokens/cascade/roots/exposure/index.mjs'],
    blocking: true,
  },
  // Decision 19 (owner, 2026-08-26) hecha ejecutable: un dial publico conserva
  // autoridad sobre sus canales en cada vertical. El drill va primero por la
  // misma razon que arriba, y con un motivo propio: conserva como fixtures los
  // dos casos que el owner adjudico, de modo que ablandar la regla en vez de
  // corregir la fuente se ve como rojo y no como verde.
  {
    id: 'dial-authority-drill',
    run: ['node', '--test', 'scripts/check/tokens/customization/authority/index.test.mjs'],
    blocking: true,
  },
  {
    id: 'dial-authority',
    run: ['node', 'scripts/check/tokens/customization/authority/index.mjs'],
    blocking: true,
  },
  // COHORTE 0 del frente de normalizacion profunda: el JOIN slot<->canal<->raiz.
  // El drill va primero porque este inventario se MIDE por diferencia contra el
  // compilador real, y una medicion que dejo de detectar emite un inventario
  // vacio que pasa el --check byte a byte contra su propia salida vacia. Los
  // drills plantan el arbol sintetico donde dos slots comparten valor y raiz
  // distinta -- la coincidencia textual no puede volver a ser evidencia.
  // COHORTE 1: la membresia canal->raiz persistida. Va ANTES del inventario en
  // la cadena y tambien aca, porque el inventario la CONSULTA: un orden al
  // reves dejaria al inventario leyendo una membresia de la corrida anterior.
  // El drill primero, por la razon de siempre y por una propia: la regla de
  // admision de la tabla es por CONCORDANCIA de tier, y una regla de
  // concordancia que dejo de rechazar el desacuerdo atribuye de mas en
  // silencio -- los tres drills de V3 van juntos y ninguno alcanza solo.
  {
    id: 'root-membership-drill',
    run: ['node', '--test', 'scripts/check/tokens/cascade/roots/membership/index.test.mjs'],
    blocking: true,
  },
  {
    id: 'root-membership',
    run: ['node', 'scripts/check/tokens/cascade/roots/membership/index.mjs', '--check'],
    blocking: true,
  },
  // El `--check` del inventario verifica DOS cosas por la misma puerta: que el
  // artefacto sea byte-identico a su recomputo, y que sus seis contadores esten
  // en `baseline/index.json`. Lo segundo se cableo el 2026-08-28 y no
  // es un agregado cosmetico: el baseline existia desde la cohorte 1 y no lo
  // leia NADIE -- `BASELINE_PATH` estaba declarado y sin un solo lector, y solo
  // un drill del norm-gate acoplaba `unassignedRows`. Con el ancla ciega,
  // `rowsWithoutRootAttribution` derivo 1707 -> 1467 sin que ninguna corrida
  // pusiera una linea roja. Una cifra que nadie verifica no es un ancla: es una
  // nota al margen que envejece.
  {
    id: 'slot-inventory-drill',
    run: ['node', '--test', 'scripts/check/tokens/cascade/slots/index.test.mjs'],
    blocking: true,
  },
  {
    id: 'slot-inventory',
    run: ['node', 'scripts/check/tokens/cascade/slots/index.mjs', '--check'],
    blocking: true,
  },
  // LA PUERTA DEL FRENTE DE NORMALIZACION PROFUNDA. Va DESPUES del inventario y
  // de la membresia porque las consume a las dos: sin membresia no hay con que
  // agrupar dos seeds por raiz, y la deteccion de sombra vuelve a ser la
  // aproximacion de 20 pines que era antes. El drill primero, y aca la razon es
  // mas fuerte que de costumbre: tres de las cinco leyes se gobiernan por
  // trinquete, y un detector que dejo de detectar reporta cero hallazgos, baja
  // sus contadores y parece una mejora.
  {
    id: 'normalization-contract-drill',
    run: ['node', '--test', 'scripts/check/tokens/cascade/normalization/index.test.mjs'],
    blocking: true,
  },
  {
    id: 'normalization-contract',
    run: ['node', 'scripts/check/tokens/cascade/normalization/index.mjs', '--check'],
    blocking: true,
  },
  // COHORTE 2A: los dos instrumentos que el frente necesita ANTES de colapsar.
  // `purity` responde si una fila puede colapsar sin mover un valor resuelto, y
  // su tercera clase -- cabeza no emitida -- es una LEY, no una categoria:
  // protege a las raices nuevas del eje paso, que nacen sin cabeza.
  // `resolved-map-diff` es la ley cero-delta resuelto hecha CONTINUA: la
  // byte-identidad de los artifacts deja de poder cumplirse en cuanto el frente
  // colapsa (un slot colapsado viaja al artefacto como texto var()), asi que lo
  // que se pinea es el mapa RESUELTO. Cualquier edicion de tema que mueva un
  // valor que el usuario ve lo enrojece; una que solo colapse forma, no.
  {
    id: 'purity-drill',
    run: ['node', '--test', 'scripts/check/tokens/cascade/purity/references/index.test.mjs'],
    blocking: true,
  },
  {
    id: 'purity',
    run: ['node', 'scripts/check/tokens/cascade/purity/references/index.mjs', '--check'],
    blocking: true,
  },
  {
    id: 'resolved-map-drill',
    run: ['node', '--test', 'scripts/check/tokens/cascade/resolution/index.test.mjs'],
    blocking: true,
  },
  {
    id: 'resolved-map',
    run: ['node', 'scripts/check/tokens/cascade/resolution/index.mjs', '--check'],
    blocking: true,
  },
  // Every production script is wired through a declared channel (manifest,
  // lifecycle chain or ci.yml) or it does not exist. This gate is what makes
  // §1.10's "the wiring gate counts all three channels" true.
  {
    id: 'wiring-coverage',
    run: ['node', 'scripts/check/automation/wiring/gate-coverage/index.mjs'],
    blocking: true,
  },
  // Drills for the three F0 honesty gates: a gate that cannot fail is not a
  // gate.
  {
    id: 'gate-honesty-drill',
    run: ['node', '--test', 'scripts/check/automation/gates/honesty/index.test.mjs'],
    blocking: true,
  },
  // The published documentation set has no other mechanical guard: a broken
  // link, a legacy path reference, non-English prose or a malformed diagram
  // is otherwise silent until a reader hits it.
  { id: 'docs-public-set:check', run: ['pnpm', 'run', 'docs-public-set:check'], blocking: true },
]);

/** Gates the runner will actually enforce. */
export function blockingGates() {
  return CI_GATES.filter((gate) => gate.blocking);
}

/**
 * Structural validation of the manifest itself. Called by the runner and by the
 * drill, so a malformed entry cannot reach CI.
 */
export function validateManifest(gates = CI_GATES) {
  const problems = [];
  const seen = new Set();
  for (const gate of gates) {
    if (!gate.id) problems.push('a gate has no id');
    if (seen.has(gate.id)) problems.push(`duplicate gate id: ${gate.id}`);
    seen.add(gate.id);
    if (!Array.isArray(gate.run) || gate.run.length === 0) {
      problems.push(`${gate.id}: run must be a non-empty argv array`);
    }
    if (typeof gate.blocking !== 'boolean') problems.push(`${gate.id}: blocking must be a boolean`);
    // The anti-laundering invariant.
    if (gate.blocking === false) {
      if (!gate.excluded?.reason) problems.push(`${gate.id}: a non-blocking gate MUST carry excluded.reason`);
      if (!gate.excluded?.owner) problems.push(`${gate.id}: a non-blocking gate MUST carry excluded.owner`);
    } else if (gate.excluded) {
      problems.push(`${gate.id}: a blocking gate must not carry an exclusion record`);
    }
    // A blocking gate may never be told to skip itself. `--optional` (and any
    // future equivalent) turns "corpus missing" into a pass, which is how a
    // gate goes green without looking at anything.
    if (gate.blocking && Array.isArray(gate.run) && gate.run.includes('--optional')) {
      problems.push(`${gate.id}: a blocking gate must not pass --optional`);
    }
  }
  return problems;
}
