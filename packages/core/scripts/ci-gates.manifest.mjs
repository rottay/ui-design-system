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
  { id: 'workflow-script-wiring', run: ['node', 'scripts/workflow-script-wiring-gate.mjs'], blocking: true },
  // A named import of a binding the target module never publishes is `undefined`
  // at runtime and renders an invalid element. A deep-path import rewrite landed
  // 22 of them at once because the short alias for a compound primitive lives in
  // the parent barrel; no other gate in this list can see that edge.
  { id: 'import-binding-integrity-drill', run: ['node', '--test', 'scripts/import-binding-integrity-gate.test.mjs'], blocking: true },
  { id: 'import-binding-integrity', run: ['node', 'scripts/import-binding-integrity-gate.mjs'], blocking: true },
  { id: 'platform-identity-zero-drill', run: ['node', '--test', 'scripts/platform-identity-zero-gate.test.mjs'], blocking: true },
  { id: 'platform-identity-zero', run: ['node', 'scripts/platform-identity-zero-gate.mjs'], blocking: true },
  { id: 'cra17:licenses', run: ['pnpm', 'run', 'cra17:licenses'], blocking: true },
  { id: 'effects:provenance', run: ['pnpm', 'run', 'effects:provenance'], blocking: true },
  { id: 'contract:check', run: ['pnpm', 'run', 'contract:check'], blocking: true },
  { id: 'daisy-projection-contract', run: ['node', '--test', 'scripts/daisy-projection-contract.test.mjs'], blocking: true },
  // WO-CRA-23 quality tooling. These live under `scripts/quality-evidence/v2/`,
  // which the `scripts/*.test.mjs` glob cannot reach -- a non-recursive glob is
  // exactly how a gate ends up looking enforced without ever running.
  // The drills for the two modern-rescue production gates below
  // (`modern-rescue-program-contract` and
  // `modern-rescue-customization-manifest-freshness`). They sit under
  // `scripts/quality-evidence/programs/modern-rescue/`, which NEITHER glob in
  // `test:scripts` reaches: `scripts/quality-evidence/v2/*.test.mjs` stops at
  // the v2 folder and `scripts/*.test.mjs` is non-recursive. So 48 assertions
  // that read as the safety net for those two gates were never executed by any
  // command -- the same "enforced but never run" defect this manifest exists to
  // close, one level down.
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
      'scripts/quality-evidence/programs/modern-rescue/manifest/generator.test.mjs',
    ],
    blocking: true,
  },
  { id: 'modern-rescue-program-contract', run: ['node', 'scripts/quality-evidence/programs/modern-rescue/program-check.mjs'], blocking: true },
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
  { id: 'spacing-rhythm-contract-drill', run: ['node', '--test', 'scripts/spacing-rhythm-contract-gate.test.mjs'], blocking: true },
  { id: 'spacing-rhythm-contract', run: ['node', 'scripts/spacing-rhythm-contract-gate.mjs'], blocking: true },
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
  { id: 'channel-liveness-drill', run: ['node', '--test', 'scripts/channel-liveness-gate.test.mjs'], blocking: true },
  { id: 'channel-liveness', run: ['node', 'scripts/channel-liveness-gate.mjs', '--check'], blocking: true },

  // --- source-owned artifact freshness: this manifest runs before Build ---
  // These gates execute the authored TypeScript roster and compile CSS from
  // source in memory. A dist/-backed check here is invalid on a clean clone and
  // can also compare committed output against a stale local build.
  { id: 'first-party-roster-source-drill', run: ['node', '--test', 'scripts/lib/first-party-roster-source.test.mjs'], blocking: true },
  { id: 'first-party-artifacts-source-staleness', run: ['pnpm', 'exec', 'vitest', 'run', 'src/foundation/tokens/__tests__/first-party-artifacts-generated.test.ts'], blocking: true },
  { id: 'vertical-css-source-staleness', run: ['node', '--test', 'scripts/vertical-css-staleness.gate.mjs'], blocking: true },
  // Reads the compiled block out of the artifact above, so it runs after the
  // freshness check: on a stale artifact its channel set would be last build's.
  { id: 'artifact-provenance-drill', run: ['node', '--test', 'scripts/artifact-provenance-gate.test.mjs'], blocking: true },
  { id: 'artifact-provenance', run: ['node', 'scripts/artifact-provenance-gate.mjs', '--check'], blocking: true },

  // --- structural / ownership ---
  { id: 'engine-token-audit', run: ['node', 'scripts/engine-token-audit.mjs', '--check'], blocking: true },
  { id: 'anatomy-variant-gate', run: ['node', 'scripts/anatomy-variant-gate.mjs', '--check'], blocking: true },
  { id: 'size-axis-law-gate', run: ['node', 'scripts/size-axis-law-gate.mjs', '--check'], blocking: true },
  { id: 'application-boundary-drill', run: ['node', '--test', 'scripts/application-boundary-gate.test.mjs'], blocking: true },
  { id: 'application-boundary-gate', run: ['node', 'scripts/application-boundary-gate.mjs', '--check'], blocking: true },
  { id: 'pattern-surface-ownership', run: ['node', 'scripts/pattern-surface-ownership-gate.mjs', '--check'], blocking: true },
  { id: 'engine-freeze-gate', run: ['node', 'scripts/engine-freeze-gate.mjs', '--check'], blocking: true },
  { id: 'portal-substrate-gate', run: ['node', 'scripts/portal-substrate-gate.mjs', '--check'], blocking: true },
  // Bidirectional identity between every `--_ds-proto-*` in the sources and its
  // row in `foundation/tokens/prototype-ledger.json`. It ships with NO
  // baseline, so the drill carries the whole burden of proving the scan can
  // fail -- including that a name quoted in prose is not a declaration, and
  // that a governed prototoken compiled into a shipped bundle is legal while an
  // ungoverned one is not. Drill first: a census computed by a broken scanner
  // would report zero findings and look identical to a clean tree.
  { id: 'prototype-ledger-drill', run: ['node', '--test', 'scripts/prototype-ledger-gate.test.mjs'], blocking: true },
  { id: 'prototype-ledger', run: ['node', 'scripts/prototype-ledger-gate.mjs', '--check'], blocking: true },

  // --- D0 customization-surface truth (drill first: a census computed by a
  // broken scanner reports zero findings and looks identical to a clean
  // tree). The report is DERIVED from the existing authorities (hooks
  // manifest, capability registry, raw allowlist, expressive lists) plus a
  // PostCSS/TS-AST consumption scan; these gates keep it fresh, fully
  // classified, evidence-backed and decrease-only on dead writers.
  { id: 'customization-surface-drill', run: ['node', '--test', 'scripts/customization-surface-gate.test.mjs', 'scripts/customization-census-classifier.test.mjs'], blocking: true },
  { id: 'customization-surface-freshness', run: ['node', 'scripts/customization-surface-census.mjs', '--check=freshness'], blocking: true },
  { id: 'customization-surface-classification', run: ['node', 'scripts/customization-surface-census.mjs', '--check=classification'], blocking: true },
  { id: 'customization-capability-consumers', run: ['node', 'scripts/customization-surface-census.mjs', '--check=capabilities'], blocking: true },
  { id: 'customization-dead-writers', run: ['node', 'scripts/customization-surface-census.mjs', '--check=dead'], blocking: true },
  // Official tokens documentation is a deterministic projection; stale docs,
  // derivation cycles, undocumented public hooks, unknown capability
  // channels and unadjudicated dual authorities all block here.
  { id: 'tokens-catalog-drill', run: ['node', '--test', 'scripts/tokens-catalog-gate.test.mjs'], blocking: true },
  { id: 'tokens-catalog', run: ['node', 'scripts/tokens-catalog.mjs', '--check'], blocking: true },
  // Binding preservation correction: premium depth is preserved, never
  // cleaned away — 80/80 protos decided, dead writers classified by
  // provenance, Kimi-premium RETIRE unrepresentable.
  { id: 'kimi-preservation-drill', run: ['node', '--test', 'scripts/kimi-preservation-gate.test.mjs'], blocking: true },
  { id: 'kimi-preservation', run: ['node', 'scripts/kimi-preservation-manifest.mjs', '--check'], blocking: true },

  // FASE K (Codex 2026-08-02): every read the hook contract fences as
  // unadjudicated carries exactly one ownership row — 0 reads without owner.
  { id: 'reads-adjudication', run: ['node', 'scripts/reads-adjudication-gate.mjs', '--check'], blocking: true },

  // Codex blocker 2: the binding worklist may never point Kimi at CSS that
  // does not ship — owners shipping-reachable, renderProof is a node (path
  // shape enforced), zero tombstone references in rows.
  // Codex final remediation blocker 4: the drill SUITES run in CI, grouped,
  // with named-cause assertions and a no-op meta-drill — a gate whose drills
  // only fire by hand certifies nothing.
  { id: 'kimi-worklist-drill', run: ['node', '--test', 'scripts/kimi-worklist-gate.test.mjs'], blocking: true },
  { id: 'kimi-worklist', run: ['node', 'scripts/kimi-worklist-gate.mjs', '--check'], blocking: true },

  // Codex blocker 4B: every counted Modern font-size literal carries an
  // adjudicated ownership row — a sold typography.scale control may not fail
  // silently behind an unowned literal.
  { id: 'literal-ownership-drill', run: ['node', '--test', 'scripts/literal-ownership-gate.test.mjs'], blocking: true },
  { id: 'literal-ownership', run: ['node', 'scripts/literal-ownership-gate.mjs', '--check'], blocking: true },

  // FASE 4 (normalización integral 2026-08-02): la tabla de controles Standard/Pro/Expert
  // es API de producto generada de los contratos reales — fresca y completa o roja.
  // Codex blocker 5: the drills must run IN CI, grouped — a gate whose drills
  // only fire by hand certifies nothing.
  { id: 'controls-catalog-drill', run: ['node', '--test', 'scripts/controls-catalog-gate.test.mjs'], blocking: true },
  { id: 'controls-catalog', run: ['node', 'scripts/controls-catalog.mjs', '--check'], blocking: true },

  // --- white-label channel + theme parity ---
  { id: 'theme-channel-parity', run: ['node', 'scripts/theme-channel-parity-gate.mjs', '--check', '--quiet'], blocking: true },
  { id: 'tenant-channel-consumer', run: ['node', 'scripts/tenant-channel-consumer-gate.mjs', '--check'], blocking: true },
  { id: 'tenant-channel-consumer-modern', run: ['node', 'scripts/tenant-channel-consumer-gate.mjs', '--modern-check'], blocking: true },
  { id: 'i18n-key-parity', run: ['node', 'scripts/i18n-key-parity-gate.mjs', '--check'], blocking: true },
  // CI checks app-bithire out explicitly and local workspace runs discover the
  // sibling repository. NOT `--optional`: a missing corpus is a hard failure,
  // and the manifest validator forbids downgrading a blocking gate.
  { id: 'app-ds-boundary', run: ['node', 'scripts/app-ds-boundary-gate.mjs', '--check'], blocking: true },
  { id: 'app-ds-boundary-drill', run: ['node', '--test', 'scripts/app-ds-boundary-gate.test.mjs'], blocking: true },
  // Answers the question the boundary gate above does not: WHICH `--ds-*`
  // properties an app may assign, and under what scope (audit 2026-07-26,
  // Codex C3). Its allowlist is derived from DS source, so the drill runs
  // first: an anchor that has drifted must surface as a drill failure, not as
  // a corpus verdict computed from a degraded allowlist.
  { id: 'app-ds-hook-contract-drill', run: ['node', '--test', 'scripts/app-ds-hook-contract-gate.test.mjs'], blocking: true },
  { id: 'app-ds-hook-contract', run: ['node', 'scripts/app-ds-hook-contract-gate.mjs', '--check'], blocking: true },
  // The contract is only "exported and consumed" (Codex C6.6) if the artifact an
  // app resolves matches the DS it was derived from. This gate fails on a stale
  // hooks-manifest.json, on a missing package export, and on an export that
  // resolves in-repo but would 404 for an installed consumer. Without it the
  // published contract can drift silently, which is worse than not publishing:
  // apps would consume a hook list the DS no longer honours.
  { id: 'app-ds-hook-manifest-freshness', run: ['node', 'scripts/app-ds-hook-contract-gate.mjs', '--manifest-check'], blocking: true },
  // The same boundary at the DOM instead of the stylesheet (audit 2026-07-26,
  // Codex C6.7): governed root channels have one SSR projection and one
  // hydrated owner, so an application holds no raw `<html>` writer. It ships
  // with no baseline, so the drill carries the whole burden of proving the
  // scan can fail -- including on the computed attribute names the writer this
  // gate was built for actually used.
  { id: 'app-root-writer-drill', run: ['node', '--test', 'scripts/app-root-writer-gate.test.mjs'], blocking: true },
  { id: 'app-root-writer', run: ['node', 'scripts/app-root-writer-gate.mjs', '--check'], blocking: true },

  // --- motion governance, DS slice ---
  //
  // BLOCKING again as of 2026-07-26. It was excluded while its 12 findings
  // looked like R1 regressions; scanning a clean archive of the ACCEPTED commit
  // a5a4c3b4 reproduced every one of them, so the registry -- authored
  // 2026-07-17 -- had simply gone stale. The ui-design-system rows were
  // re-anchored to that commit ONCE, with provenance recorded in
  // `cra-12-motion-governance.registry.json` under `reanchor`.
  //
  // The cross-repo slice stays out of this job: it audits four sibling
  // repositories and throws on a missing one. app-bithire and app-platform
  // carry their own motion debt and own their own rows.
  { id: 'cra12-motion-governance', run: ['node', 'scripts/cra-12-motion-governance.mjs', '--repositories', 'ui-design-system'], blocking: true },
  { id: 'cra12-motion-governance-drill', run: ['node', '--test', 'scripts/cra-12-motion-governance.reanchor.test.mjs'], blocking: true },

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
    run: ['node', 'scripts/quality-evidence/programs/modern-rescue/manifest/generator.mjs', '--check'],
    blocking: true,
  },
  // The drill runs on synthetic fixtures and fails if the gate stops detecting
  // any planted category, wrong component name or wrong group -- which is what
  // keeps the gate from decaying into a file nobody has run.
  {
    id: 'taxonomy-parity-drill',
    run: ['node', '--test', 'scripts/taxonomy-parity-gate.test.mjs'],
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
    run: ['node', '--test', 'scripts/lib/owner-nesting.test.mjs'],
    blocking: true,
  },
  // The resolver is the taxonomy gate's only binding an incorrect inventory
  // cannot fake, which makes its own blind spots the weakest link in the chain.
  // Both drilled defects were live: alias re-exports invented ambiguity that did
  // not exist, and `Object.assign` compounds read as plain values.
  {
    id: 'root-public-resolver-drill',
    run: ['node', '--test', 'scripts/lib/root-public-resolver.test.mjs'],
    blocking: true,
  },
  {
    id: 'taxonomy-parity',
    run: ['node', 'scripts/taxonomy-parity-gate.mjs'],
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
