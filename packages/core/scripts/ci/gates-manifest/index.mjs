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
 * pattern that produced the worst finding of the audit -- `pnpm run cra12:check
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
  { id: 'workflow-script-wiring', run: ['node', 'scripts/ci/workflow-script-wiring-gate/index.mjs'], blocking: true },
  // A named import of a binding the target module never publishes is `undefined`
  // at runtime and renders an invalid element. A deep-path import rewrite landed
  // 22 of them at once because the short alias for a compound primitive lives in
  // the parent barrel; no other gate in this list can see that edge.
  { id: 'import-binding-integrity-drill', run: ['node', '--test', 'scripts/structure/import-binding-integrity-gate/index.test.mjs'], blocking: true },
  { id: 'import-binding-integrity', run: ['node', 'scripts/structure/import-binding-integrity-gate/index.mjs'], blocking: true },
  // The §1.2/§2.9 law on the scripts/ tree itself, with a decrease-only
  // hand-adjudicated baseline (F0.5 Paso D). Without it the tree re-flattens
  // at the first new file.
  { id: 'scripts-tree-drill', run: ['node', '--test', 'scripts/structure/scripts-tree-gate/index.test.mjs'], blocking: true },
  { id: 'scripts-tree', run: ['node', 'scripts/structure/scripts-tree-gate/index.mjs'], blocking: true },
  { id: 'platform-identity-zero-drill', run: ['node', '--test', 'scripts/verticals/platform-identity-zero-gate/index.test.mjs'], blocking: true },
  { id: 'platform-identity-zero', run: ['node', 'scripts/verticals/platform-identity-zero-gate/index.mjs'], blocking: true },
  { id: 'cra17:licenses', run: ['pnpm', 'run', 'cra17:licenses'], blocking: true },
  // The NAMED acceptance instrument of WO-CRA-17, wired here by owner decision
  // (2026-08-19, `docs/ROADMAP-EJECUCION-2026-08-19.md` §12.2). It was the
  // other half of the "two gates with no invoker" finding: reachable only by
  // hand while the work order it accepts is still `todo`, so the thing that
  // decides whether CRA-17 may close was the one thing nothing ran.
  //
  // It COMPOSES the entry above -- `auditGraphicsPackaging` is imported from
  // the same module `cra17:licenses` runs -- and adds the planes no single
  // gate covers: supplier/catalog identity, the no-Lucide boundary outside the
  // adapter, asset entrypoint closure, public declaration closure, bundle
  // retention, the optical matrix and roadmap truth. The overlap is
  // deliberate: `cra17:licenses` fails cheaper and therefore first.
  //
  // `--structural`, NOT the default `final`, and the distinction is the whole
  // reason this can be blocking at all. Structural asks whether the WO's
  // invariants hold TODAY and is green; final additionally asks whether the
  // work order may CLOSE, which is false while two evidence items are pending
  // (bundle retention behind the version bump, phase 2B awaiting owner GO).
  // Wiring `final` would enlist a knowingly-red gate, which is exactly the
  // habit the docstring at the top of this file exists to refuse. Same split
  // as `cra15:gate` (`--check --structural`) versus `cra15:gate:final`. When
  // WO-CRA-17 closes, this flag is what changes.
  //
  // Its drill (`scripts/evidence/cra-17-integral-gate/index.test.mjs`) is reached by
  // `test:scripts`, which globs `scripts/**/*.test.mjs` recursively.
  { id: 'cra-17-integral', run: ['node', 'scripts/evidence/cra-17-integral-gate/index.mjs', '--structural'], blocking: true },
  { id: 'effects:provenance', run: ['pnpm', 'run', 'effects:provenance'], blocking: true },
  { id: 'contract:check', run: ['pnpm', 'run', 'contract:check'], blocking: true },
  { id: 'daisy-projection-contract', run: ['node', '--test', 'scripts/engine/daisy-painted-classes/daisy-painted-classes.projection-contract.test.mjs'], blocking: true },
  // WO-CRA-23 quality tooling. These live under `scripts/quality-evidence/v2/`
  // and `scripts/quality-evidence/programs/modern-rescue/`. `test:scripts` now
  // globs `scripts/**/*.test.mjs` (recursive), which DOES reach every test
  // file under `scripts/` -- including these. They are still listed here by
  // name because passing under `test:scripts` is not the same as blocking CI:
  // this manifest is the ONE inventory `pretest` and the CI job both consume
  // (see the module docstring above), and a test that only lives inside
  // `test:scripts` does not block a CI run that never invokes it. The drills
  // for the two modern-rescue production gates below
  // (`modern-rescue-program-contract` and
  // `modern-rescue-customization-manifest-freshness`) are the same case one
  // level down: 48 assertions that read as their safety net had to be listed
  // here explicitly to actually gate CI, glob reach notwithstanding.
  //
  // Drill first, exactly as everywhere else in this file: program-check and the
  // generator both COMPUTE a verdict, and a computation that has silently
  // stopped detecting anything reports zero findings and looks identical to a
  // clean tree. Proving the detectors still fail on planted defects is only
  // evidence if it happens BEFORE the verdicts they vouch for.
  //
  // One entry, both files: they are a single drill cohort for a single pair of
  // gates, and `node --test` takes multiple paths.
  {
    id: 'modern-rescue-tooling-drills',
    run: [
      'node',
      '--test',
      'scripts/quality-evidence/programs/modern-rescue/program-check.test.mjs',
      'manifest/generator/index.test.mjs',
    ],
    blocking: true,
  },
  { id: 'modern-rescue-program-contract', run: ['node', 'scripts/quality-evidence/programs/modern-rescue/program-check.mjs'], blocking: true },
  // The programme's human entry point (`program.json.humanEntry` AND
  // `workOrderAuthority`) is a GENERATED section, and until now nothing in CI
  // checked that it was still the output of the command that produces it. The
  // measured result: the block published a superseded wave, a `blockedOn` that
  // was not the intent's, and a retired audit model, all while gates:ci was
  // green. The tool that catches it already existed and was simply not wired --
  // `lane-control-drills` does not cover it (it is EXCLUDED, and it runs
  // against a sandbox clone rather than the live document).
  //
  // Placed AFTER `modern-rescue-program-contract` on purpose: `--check` re-derives
  // from `manifest/index.json` and `family-inventory.json`, so if those
  // denominators are broken the gate above fails first with the precise message
  // instead of this one dying in the derivation.
  {
    id: 'modern-rescue-checkpoint-state',
    run: [
      'node',
      'src/tooling/lane-control/public/program-state/index.mjs',
      '--check',
      '--intent',
      'scripts/quality-evidence/programs/modern-rescue/checkpoint.intent.json',
    ],
    blocking: true,
  },
  { id: 'quality-evidence-v2-drills', run: ['node', '--test', 'scripts/quality-evidence/v2/drills.test.mjs'], blocking: true },
  // The `spacing.rhythm` control census the modern-rescue manifest asks for:
  // rhythm owns the room around a control, never the control's size, capacity,
  // touch target, icon, type or motion -- and never a physical inline side,
  // which would break RTL. It ships with NO baseline and NO file list: the
  // corpus is walked from the authored source root and the offending family is
  // resolved from `family-inventory.json`, so a NEW off-contract reader is a
  // failure rather than an unchanged count. Drill first: a classifier that
  // returned "allowed" for everything would report zero findings and look
  // exactly like a clean tree.
  { id: 'spacing-rhythm-contract-drill', run: ['node', '--test', 'scripts/tokens/spacing-rhythm-contract-gate/index.test.mjs'], blocking: true },
  { id: 'spacing-rhythm-contract', run: ['node', 'scripts/tokens/spacing-rhythm-contract-gate/index.mjs'], blocking: true },
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
  { id: 'channel-liveness-drill', run: ['node', '--test', 'scripts/tokens/channel-liveness-gate/index.test.mjs'], blocking: true },
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
    run: ['node', 'scripts/tokens/channel-liveness-gate/index.mjs', '--check'],
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
  { id: 'first-party-roster-source-drill', run: ['node', '--test', 'scripts/lib/verticals/first-party-roster-source/index.test.mjs'], blocking: true },
  { id: 'first-party-artifacts-source-staleness', run: ['pnpm', 'exec', 'vitest', 'run', 'src/foundation/tokens/__tests__/first-party-artifacts-generated.test.ts'], blocking: true },
  { id: 'vertical-css-source-staleness', run: ['node', '--test', 'scripts/verticals/css-staleness-gate/index.mjs'], blocking: true },
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
  { id: 'first-party-single-author-drill', run: ['node', '--test', 'scripts/verticals/first-party-single-author-gate/index.test.mjs'], blocking: true },
  { id: 'first-party-single-author', run: ['node', 'scripts/verticals/first-party-single-author-gate/index.mjs', '--check'], blocking: true },
  { id: 'first-party-single-author-render-laws', run: ['pnpm', 'exec', 'vitest', 'run', 'src/infrastructure/compilers/runtime/tenant-css/artifact-renderer/tests/single-author.test.ts'], blocking: true },
  // The three staleness surfaces immediately above are RED on purpose while the
  // generated artifacts are unregenerated, and a knowingly-red gate is exactly
  // how an inventory turns into a habit: the count drifts, a row is quietly
  // dropped, a class is softened, and nobody can tell an accepted red from a new
  // one. This gate pins that inventory as a reviewed pair -- a sealed
  // constitution in the gate SOURCE against the human-readable ledger -- so any
  // add, removal, rename, class flip, surface move, shape drift or identity
  // re-point is red until both sides are edited together. It deliberately does
  // NOT execute the censuses (that is `--reconcile <observation.json>`), so it
  // stays cheap enough to run before the expensive gates below.
  { id: 'red-inventory', run: ['node', 'scripts/ci/red-inventory-gate/index.mjs', '--check', '--quiet'], blocking: true },

  // --- structural / ownership ---
  { id: 'engine-token-audit', run: ['node', 'scripts/engine/token-audit/index.mjs', '--check'], blocking: true },
  // ARCHITECTURE §1.6: "a per-component channel with no path to any root is
  // debt, and the orphan count is a decrease-only ratchet". Este es ese
  // contador -- no existia. Drill primero, como en todo el archivo: el gate
  // COMPUTA una clasificacion, y un clasificador que dejo de clasificar
  // reporta un numero plausible y se ve igual que un arbol sano.
  {
    id: 'cascade-wiring-ratchet-drill',
    run: ['node', '--test', 'scripts/engine/cascade-wiring-ratchet/index.test.mjs'],
    blocking: true,
  },
  {
    id: 'cascade-wiring-ratchet',
    run: ['node', 'scripts/engine/cascade-wiring-ratchet/index.mjs'],
    blocking: true,
  },
  // Los tres artefactos de `manifest/generated/` describen el arbol: los hechos
  // de fanout, la paridad de los tres temas y las listas de alcance por raiz.
  // Hasta F2.3 NADIE los leia -- ni siquiera una comprobacion de frescura -- asi
  // que podian pudrirse en silencio, y se pudrieron: llegaron a F2 con un mes de
  // deriva y con nueve tests de la suite rojos por eso. Estos cuatro `--check`
  // cierran ese agujero. La PARIDAD real (que los numeros sean los correctos, no
  // solo los actuales) es F4; esto es frescura.
  { id: 'fanout-facts-freshness', run: ['node', 'manifest/fanout-facts/index.mjs', '--check'], blocking: true },
  { id: 'root-checklists-freshness', run: ['node', 'manifest/root-checklist/index.mjs', '--check'], blocking: true },
  { id: 'mirror-parity-freshness', run: ['node', 'manifest/mirror-parity/index.mjs', '--check'], blocking: true },
  // El cuarto mide la FUENTE, no el artefacto: variant-parity es el canon
  // estructural de los 3 themes y corre sin build. Su `--check` es frescura Y
  // trinquete (divergentSlots / untaggedAuthoredLeaves, decrease-only).
  { id: 'variant-parity', run: ['node', 'manifest/variant-parity/index.mjs', '--check'], blocking: true },
  // The exact proof runs the audit above a second time inside two deterministic
  // passes and adds the planes no other gate covers: the claim/contract census in
  // the documentation, the code-derived vertical rows, the data-part corpus, and
  // the whole-file SHA-256 documentation seal. It was reachable only through
  // `pnpm run gat07:check`, so a doc could contradict source with the whole
  // dashboard green. It sits AFTER the audit deliberately: when the audit is red
  // this gate is red for the same reason but far more slowly.
  { id: 'gat-07-exact-proof', run: ['node', 'scripts/evidence/gat-07-exact-proof/index.mjs', '--check-artifact'], blocking: true },
  { id: 'anatomy-variant-gate', run: ['node', 'scripts/engine/anatomy-variant-gate/index.mjs', '--check'], blocking: true },
  { id: 'size-axis-law-gate', run: ['node', 'scripts/boundaries/size-axis-law-gate/index.mjs', '--check'], blocking: true },
  { id: 'application-boundary-drill', run: ['node', '--test', 'scripts/boundaries/application-boundary-gate/index.test.mjs'], blocking: true },
  { id: 'application-boundary-gate', run: ['node', 'scripts/boundaries/application-boundary-gate/index.mjs', '--check'], blocking: true },
  { id: 'pattern-surface-ownership', run: ['node', 'scripts/boundaries/pattern-surface-ownership-gate/index.mjs', '--check'], blocking: true },
  { id: 'engine-freeze-gate', run: ['node', 'scripts/engine/freeze-gate/index.mjs', '--check'], blocking: true },
  { id: 'portal-substrate-gate', run: ['node', 'scripts/boundaries/portal-substrate-gate/index.mjs', '--check'], blocking: true },
  // Bidirectional identity between every `--_ds-proto-*` in the sources and its
  // row in `foundation/tokens/prototype-ledger.json`. It ships with NO
  // baseline, so the drill carries the whole burden of proving the scan can
  // fail -- including that a name quoted in prose is not a declaration, and
  // that a governed prototoken compiled into a shipped bundle is legal while an
  // ungoverned one is not. Drill first: a census computed by a broken scanner
  // would report zero findings and look identical to a clean tree.
  { id: 'prototype-ledger-drill', run: ['node', '--test', 'scripts/tokens/prototype-ledger-gate/index.test.mjs'], blocking: true },
  { id: 'prototype-ledger', run: ['node', 'scripts/tokens/prototype-ledger-gate/index.mjs', '--check'], blocking: true },

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
  { id: 'color-mix-argument-purity-drill', run: ['node', '--test', 'scripts/tokens/color-mix-argument-purity-gate/index.test.mjs'], blocking: true },
  { id: 'color-mix-argument-purity', run: ['node', 'scripts/tokens/color-mix-argument-purity-gate/index.mjs'], blocking: true },
  // Shipped bundles carry no third-party framework CSS. Safe to run before
  // Build: the five committed `styles/*.css` mirrors are required and the
  // `dist/*` copies are audited only when present, so a clean clone certifies
  // the same law without a build step.
  { id: 'modern-bundle-framework-drill', run: ['node', '--test', 'scripts/engine/modern-bundle-framework-gate/index.test.mjs'], blocking: true },
  { id: 'modern-bundle-framework', run: ['node', 'scripts/engine/modern-bundle-framework-gate/index.mjs'], blocking: true },
  // The palette seam: `--ds-chart-series-1..10` may be DEFINED only by a
  // tenant-scope compiler, never by anything closer to the marks. It was
  // orphaned and red on 2026-08-19 -- not because a component had defined the
  // channel, but because the palette authority moved into the brand-theme
  // compiler in dcc65ca34 without the allowlist moving with it. Allowlist
  // corrected, drill re-pinned at two sanctioned definers, gate wired here so
  // the next such move cannot land unreviewed.
  { id: 'chart-series-reserved-name-drill', run: ['node', '--test', 'scripts/tokens/chart-series-reserved-name-gate/index.test.mjs'], blocking: true },
  { id: 'chart-series-reserved-name', run: ['node', 'scripts/tokens/chart-series-reserved-name-gate/index.mjs', '--check'], blocking: true },

  // --- D0 customization-surface truth (drill first: a census computed by a
  // broken scanner reports zero findings and looks identical to a clean
  // tree). The report is DERIVED from the existing authorities (hooks
  // manifest, capability registry, raw allowlist, expressive lists) plus a
  // PostCSS/TS-AST consumption scan; these gates keep it fresh, fully
  // classified, evidence-backed and decrease-only on dead writers.
  { id: 'customization-surface-drill', run: ['node', '--test', 'scripts/tokens/customization-surface-census/customization-surface-census.surface-gate.test.mjs', 'scripts/tokens/customization-surface-census/customization-surface-census.classifier.test.mjs'], blocking: true },
  { id: 'customization-surface-freshness', run: ['node', 'scripts/tokens/customization-surface-census/index.mjs', '--check=freshness'], blocking: true },
  { id: 'customization-surface-classification', run: ['node', 'scripts/tokens/customization-surface-census/index.mjs', '--check=classification'], blocking: true },
  { id: 'customization-capability-consumers', run: ['node', 'scripts/tokens/customization-surface-census/index.mjs', '--check=capabilities'], blocking: true },
  { id: 'customization-dead-writers', run: ['node', 'scripts/tokens/customization-surface-census/index.mjs', '--check=dead'], blocking: true },
  // Official tokens documentation is a deterministic projection; stale docs,
  // derivation cycles, undocumented public hooks, unknown capability
  // channels and unadjudicated dual authorities all block here.
  { id: 'tokens-catalog-drill', run: ['node', '--test', 'scripts/tokens/catalog/catalog-gate.test.mjs'], blocking: true },
  { id: 'tokens-catalog', run: ['node', 'scripts/tokens/catalog/index.mjs', '--check'], blocking: true },
  // Binding preservation correction: premium depth is preserved, never
  // cleaned away — 80/80 protos decided, dead writers classified by
  // provenance, Kimi-premium RETIRE unrepresentable.
  { id: 'kimi-preservation-drill', run: ['node', '--test', 'scripts/tokens/kimi-preservation-manifest/kimi-preservation-manifest.preservation-gate.test.mjs'], blocking: true },
  { id: 'kimi-preservation', run: ['node', 'scripts/tokens/kimi-preservation-manifest/index.mjs', '--check'], blocking: true },

  // FASE K (Codex 2026-08-02): every read the hook contract fences as
  // unadjudicated carries exactly one ownership row — 0 reads without owner.
  { id: 'reads-adjudication', run: ['node', 'scripts/tokens/reads-adjudication-gate/index.mjs'], blocking: true },

  // Codex blocker 2: the binding worklist may never point Kimi at CSS that
  // does not ship — owners shipping-reachable, renderProof is a node (path
  // shape enforced), zero tombstone references in rows.
  // Codex final remediation blocker 4: the drill SUITES run in CI, grouped,
  // with named-cause assertions and a no-op meta-drill — a gate whose drills
  // only fire by hand certifies nothing.
  { id: 'kimi-worklist-drill', run: ['node', '--test', 'scripts/tokens/kimi-worklist-gate/index.test.mjs'], blocking: true },
  { id: 'kimi-worklist', run: ['node', 'scripts/tokens/kimi-worklist-gate/index.mjs'], blocking: true },

  // Codex blocker 4B: every counted Modern font-size literal carries an
  // adjudicated ownership row — a sold typography.scale control may not fail
  // silently behind an unowned literal.
  { id: 'literal-ownership-drill', run: ['node', '--test', 'scripts/engine/literal-ownership-gate/index.test.mjs'], blocking: true },
  { id: 'literal-ownership', run: ['node', 'scripts/engine/literal-ownership-gate/index.mjs'], blocking: true },

  // FASE 4 (normalización integral 2026-08-02): la tabla de controles Standard/Pro/Expert
  // es API de producto generada de los contratos reales — fresca y completa o roja.
  // Codex blocker 5: the drills must run IN CI, grouped — a gate whose drills
  // only fire by hand certifies nothing.
  { id: 'controls-catalog-drill', run: ['node', '--test', 'scripts/tokens/controls-catalog/controls-catalog-gate.test.mjs'], blocking: true },
  { id: 'controls-catalog', run: ['node', 'scripts/tokens/controls-catalog/index.mjs', '--check'], blocking: true },

  // --- white-label channel + theme parity ---
  { id: 'theme-channel-parity', run: ['node', 'scripts/tokens/theme-channel-parity-gate/index.mjs', '--check', '--quiet'], blocking: true },
  { id: 'tenant-channel-consumer', run: ['node', 'scripts/tokens/tenant-channel-consumer-gate/index.mjs', '--check'], blocking: true },
  { id: 'tenant-channel-consumer-modern', run: ['node', 'scripts/tokens/tenant-channel-consumer-gate/index.mjs', '--modern-check'], blocking: true },
  { id: 'i18n-key-parity', run: ['node', 'scripts/i18n/key-parity-gate/index.mjs', '--check'], blocking: true },
  // CI checks app-bithire out explicitly and local workspace runs discover the
  // sibling repository. NOT `--optional`: a missing corpus is a hard failure,
  // and the manifest validator forbids downgrading a blocking gate.
  { id: 'app-ds-boundary', run: ['node', 'scripts/boundaries/app-ds-boundary-gate/index.mjs', '--check'], blocking: true },
  { id: 'app-ds-boundary-drill', run: ['node', '--test', 'scripts/boundaries/app-ds-boundary-gate/index.test.mjs'], blocking: true },
  // Answers the question the boundary gate above does not: WHICH `--ds-*`
  // properties an app may assign, and under what scope (audit 2026-07-26,
  // Codex C3). Its allowlist is derived from DS source, so the drill runs
  // first: an anchor that has drifted must surface as a drill failure, not as
  // a corpus verdict computed from a degraded allowlist.
  { id: 'app-ds-hook-contract-drill', run: ['node', '--test', 'scripts/boundaries/app-ds-hook-contract-gate/index.test.mjs'], blocking: true },
  { id: 'app-ds-hook-contract', run: ['node', 'scripts/boundaries/app-ds-hook-contract-gate/index.mjs', '--check'], blocking: true },
  // The contract is only "exported and consumed" (Codex C6.6) if the artifact an
  // app resolves matches the DS it was derived from. This gate fails on a stale
  // hooks-manifest.json, on a missing package export, and on an export that
  // resolves in-repo but would 404 for an installed consumer. Without it the
  // published contract can drift silently, which is worse than not publishing:
  // apps would consume a hook list the DS no longer honours.
  { id: 'app-ds-hook-manifest-freshness', run: ['node', 'scripts/boundaries/app-ds-hook-contract-gate/index.mjs', '--manifest-check'], blocking: true },
  // The same boundary at the DOM instead of the stylesheet (audit 2026-07-26,
  // Codex C6.7): governed root channels have one SSR projection and one
  // hydrated owner, so an application holds no raw `<html>` writer. It ships
  // with no baseline, so the drill carries the whole burden of proving the
  // scan can fail -- including on the computed attribute names the writer this
  // gate was built for actually used.
  { id: 'app-root-writer-drill', run: ['node', '--test', 'scripts/boundaries/app-root-writer-gate/index.test.mjs'], blocking: true },
  { id: 'app-root-writer', run: ['node', 'scripts/boundaries/app-root-writer-gate/index.mjs', '--check'], blocking: true },

  // --- motion governance, DS slice ---
  //
  // BLOCKING again as of 2026-07-26. It was excluded while its 12 findings
  // looked like R1 regressions; scanning a clean archive of the ACCEPTED commit
  // a5a4c3b4 reproduced every one of them, so the registry -- authored
  // 2026-07-17 -- had simply gone stale. The ui-design-system rows were
  // re-anchored to that commit ONCE, with provenance recorded in
  // `evidence/cra-12-motion-governance/cra-12-motion-governance.registry.json` under `reanchor`.
  //
  // The cross-repo slice stays out of this job: it audits four sibling
  // repositories and throws on a missing one. app-bithire and app-platform
  // carry their own motion debt and own their own rows.
  { id: 'cra12-motion-governance', run: ['node', 'scripts/evidence/cra-12-motion-governance/index.mjs', '--repositories', 'ui-design-system'], blocking: true },
  { id: 'cra12-motion-governance-drill', run: ['node', '--test', 'scripts/evidence/cra-12-motion-governance/cra-12-motion-governance.reanchor.test.mjs'], blocking: true },

  // --- canonical taxonomy parity (WO-CRA-23 source-plumbing item 10) ---
  //
  // The gate is blocking. Every condition its exclusion was owed to is closed.
  //
  // All four bindings compute on all 255 rows. `public` is the one a wrong
  // inventory cannot fake: `lib/root-public-resolver.mjs` reads source and
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
  // program-check. Taxonomy reads `manifest/index.json` and the per-family
  // cells as evidence; against a manifest nobody regenerated it can green on
  // stale rows. The explicit entry below, and its position ahead of this
  // chain, are the CI-level contract -- a hidden side effect is not one.
  {
    id: 'modern-rescue-customization-manifest-freshness',
    run: ['node', 'manifest/generator/index.mjs', '--check'],
    blocking: true,
  },
  // The drill runs on synthetic fixtures and fails if the gate stops detecting
  // any planted category, wrong component name or wrong group -- which is what
  // keeps the gate from decaying into a file nobody has run.
  {
    id: 'taxonomy-parity-drill',
    run: ['node', '--test', 'scripts/taxonomy/parity-gate/index.test.mjs'],
    blocking: true,
  },
  // A nested sourceOwner is not a style question: the inner family's folder sits
  // inside the outer family's declared territory, so every containment-based
  // reading -- ownership, reverse attribution, derived lane exclusion -- has two
  // defensible answers. Its planted negative is the real
  // connected-command-palette/search-command-bar defect this drill was written
  // against, so a regression to `return []` fails rather than reporting clean.
  {
    id: 'owner-nesting-drill',
    run: ['node', '--test', 'scripts/lib/taxonomy/owner-nesting/index.test.mjs'],
    blocking: true,
  },
  // The resolver is the taxonomy gate's only binding an incorrect inventory
  // cannot fake, which makes its own blind spots the weakest link in the chain.
  // Both drilled defects were live: alias re-exports invented ambiguity that did
  // not exist, and `Object.assign` compounds read as plain values.
  {
    id: 'root-public-resolver-drill',
    run: ['node', '--test', 'scripts/lib/taxonomy/root-public-resolver/index.test.mjs'],
    blocking: true,
  },
  {
    id: 'taxonomy-parity',
    run: ['node', 'scripts/taxonomy/parity-gate/index.mjs'],
    blocking: true,
  },
  // The lane-control drill runner runs all five suites and goes red on any
  // misbehaving one. tenant-reachability is red 10/13 since the 2026-08-18
  // checkpoint: three interpolated emitters (`--ds-button-${x}-hover-bg`,
  // `--ds-chart-series-${i}`, `--ds-chart-category-${i}`) have no enumerator,
  // and the checker is fail-closed about reporting a number it cannot
  // enumerate. Wiring it EXCLUDED makes the red visible in every CI summary.
  // Supplying the enumerators is AUTHORSHIP, not zero-delta rewiring — it
  // belongs to the F2-asymmetric phase (post-F4B, sequence amendment
  // 2026-08-20); it returns to blocking when the enumerators exist
  // (findings drained, not re-baselined).
  {
    id: 'lane-control-drills',
    run: ['node', 'src/tooling/lane-control/integration/tests/drills/index.mjs'],
    blocking: false,
    excluded: {
      reason: 'tenant-reachability is red 10/13 (three interpolated emitters without enumerators; union 606 vs rottay 625). The other four suites pass. The enumerators are authorship — F2-asymmetric (post-F4B) supplies them and this returns to blocking.',
      owner: 'F2-asymmetric phase (sequence amendment 2026-08-20, roadmap §5/§12)',
      trackedSince: '2026-08-20',  // re-adjudicada en el cierre de F2-seguro (antes: 14dee7dc3, F2 monolítico)
    },
  },
  // The --ds_ experimentation space never reaches shipped CSS (canon: --ds-).
  {
    id: 'ds-prefix',
    run: ['node', 'scripts/tokens/ds-underscore-prefix-gate/index.mjs'],
    blocking: true,
  },
  // The 63-root cascade catalog must agree with the tree it describes; until
  // this gate existed nothing read it at all.
  {
    id: 'root-catalog-freshness',
    run: ['node', 'scripts/tokens/root-catalog-freshness-gate/index.mjs'],
    blocking: true,
  },
  // Companion to the freshness gate and deliberately disjoint from it: that one
  // answers whether a head channel EXISTS, this one answers WHO is allowed to
  // move it. Drill first, as everywhere in this file -- the gate computes a
  // verdict, and a computation that has quietly stopped detecting anything
  // reports zero findings and looks exactly like a clean tree.
  {
    id: 'root-exposure-drill',
    run: ['node', '--test', 'scripts/tokens/root-exposure-gate/index.test.mjs'],
    blocking: true,
  },
  {
    id: 'root-exposure',
    run: ['node', 'scripts/tokens/root-exposure-gate/index.mjs'],
    blocking: true,
  },
  // Decision 19 (owner, 2026-08-26) hecha ejecutable: un dial publico conserva
  // autoridad sobre sus canales en cada vertical. El drill va primero por la
  // misma razon que arriba, y con un motivo propio: conserva como fixtures los
  // dos casos que el owner adjudico, de modo que ablandar la regla en vez de
  // corregir la fuente se ve como rojo y no como verde.
  {
    id: 'dial-authority-drill',
    run: ['node', '--test', 'scripts/tokens/dial-authority-gate/index.test.mjs'],
    blocking: true,
  },
  {
    id: 'dial-authority',
    run: ['node', 'scripts/tokens/dial-authority-gate/index.mjs'],
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
    run: ['node', '--test', 'scripts/tokens/root-membership/index.test.mjs'],
    blocking: true,
  },
  {
    id: 'root-membership',
    run: ['node', 'scripts/tokens/root-membership/index.mjs', '--check'],
    blocking: true,
  },
  // El `--check` del inventario verifica DOS cosas por la misma puerta: que el
  // artefacto sea byte-identico a su recomputo, y que sus seis contadores esten
  // en `slot-inventory.baseline.json`. Lo segundo se cableo el 2026-08-28 y no
  // es un agregado cosmetico: el baseline existia desde la cohorte 1 y no lo
  // leia NADIE -- `BASELINE_PATH` estaba declarado y sin un solo lector, y solo
  // un drill del norm-gate acoplaba `unassignedRows`. Con el ancla ciega,
  // `rowsWithoutRootAttribution` derivo 1707 -> 1467 sin que ninguna corrida
  // pusiera una linea roja. Una cifra que nadie verifica no es un ancla: es una
  // nota al margen que envejece.
  {
    id: 'slot-inventory-drill',
    run: ['node', '--test', 'scripts/tokens/slot-inventory/index.test.mjs'],
    blocking: true,
  },
  {
    id: 'slot-inventory',
    run: ['node', 'scripts/tokens/slot-inventory/index.mjs', '--check'],
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
    run: ['node', '--test', 'scripts/tokens/normalization-contract-gate/index.test.mjs'],
    blocking: true,
  },
  {
    id: 'normalization-contract',
    run: ['node', 'scripts/tokens/normalization-contract-gate/index.mjs', '--check'],
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
    run: ['node', '--test', 'scripts/tokens/purity/index.test.mjs'],
    blocking: true,
  },
  {
    id: 'purity',
    run: ['node', 'scripts/tokens/purity/index.mjs', '--check'],
    blocking: true,
  },
  {
    id: 'resolved-map-drill',
    run: ['node', '--test', 'scripts/tokens/resolved-map-diff/index.test.mjs'],
    blocking: true,
  },
  {
    id: 'resolved-map',
    run: ['node', 'scripts/tokens/resolved-map-diff/index.mjs', '--check'],
    blocking: true,
  },
  // Every production script is wired through a declared channel (manifest,
  // lifecycle chain or ci.yml) or it does not exist. This gate is what makes
  // §1.10's "the wiring gate counts all three channels" true.
  {
    id: 'wiring-coverage',
    run: ['node', 'scripts/ci/wiring-coverage-gate/index.mjs'],
    blocking: true,
  },
  // Drills for the three F0 honesty gates: a gate that cannot fail is not a
  // gate.
  {
    id: 'f0-honesty-gates-drill',
    run: ['node', '--test', 'scripts/ci/f0-honesty-gates/index.test.mjs'],
    blocking: true,
  },
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
