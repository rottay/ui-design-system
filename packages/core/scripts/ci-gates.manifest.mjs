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
  { id: 'cra17:licenses', run: ['pnpm', 'run', 'cra17:licenses'], blocking: true },
  { id: 'effects:provenance', run: ['pnpm', 'run', 'effects:provenance'], blocking: true },
  { id: 'contract:check', run: ['pnpm', 'run', 'contract:check'], blocking: true },
  { id: 'daisy-projection-contract', run: ['node', '--test', 'scripts/daisy-projection-contract.test.mjs'], blocking: true },

  // --- artifact freshness: a stale artifact invalidates every census below ---
  { id: 'build-vertical-artifacts', run: ['node', 'scripts/build-vertical-artifacts.mjs', '--check'], blocking: true },
  { id: 'build-vertical-css', run: ['node', 'scripts/build-vertical-css.mjs', '--check'], blocking: true },
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
