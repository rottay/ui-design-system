import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { packageRoot as findPackageRoot } from '../../../../libraries/repo-root/index.mjs';
import { distReachableFrom } from '../dist-reachability/index.mjs';

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
  // Drill first, as everywhere in this file: this gate walks `.github/workflows`
  // for script references, and a walker that stopped walking reports zero
  // dangling references and looks exactly like a wired pipeline.
  // The inventory's own suite and the runner's. Both existed and reached CI
  // only through `test:scripts`, AFTER the build -- so the file that decides
  // what CI runs was itself outside what CI ran until the gate ahead of it
  // failed.
  { id: 'gate-manifest-drill', run: ['node', '--test', 'scripts/check/automation/gates/manifest/tests/index.test.mjs', 'scripts/check/automation/runner/index.test.mjs'], blocking: true, phase: 'pre-build',
    noDrillReason:
      'This entry IS the drill for the inventory and the runner: it plants a gate with no drill, a one-way drill pointer, a placeholder reason, a pre-build entry that imports dist/, and an unknown prerequisite, and asserts each is refused.', },
  { id: 'workflow-script-wiring-drill', run: ['node', '--test', 'scripts/check/automation/wiring/workflows/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['workflow-script-wiring'], },
  // --- contract + provenance (cheap, fail fast) ---
  // First: a workflow that references a script which does not exist cannot be
  // trusted to run anything below.
  { id: 'workflow-script-wiring', run: ['node', 'scripts/check/automation/wiring/workflows/index.mjs'], blocking: true, phase: 'pre-build', drillId: 'workflow-script-wiring-drill', },
  // Release discipline. The graded check is range-scoped — it needs the pull
  // request merge base — so it runs in the `changeset` job of ci.yml. What
  // belongs here is the proof that it has teeth, which needs no range at all.
  { id: 'contract-changeset-drill', run: ['node', '--test', 'scripts/check/contract-changeset/tests/index.test.mjs'], blocking: true, phase: 'pre-build',
    noDrillReason:
      'This entry IS the drill for `contract-changeset`: it plants one range per class in `DRILLS` — twenty-two today, each pinned by name in the roster assertion of that suite — in throwaway git repositories, and asserts each lands in the direction it declares. Twelve must go red (a guaranteed-surface change with no changeset, one covered only by the changeset the base branch already carries, an unparseable declaration, a bump that declares nothing, a shipped change with no changeset, a signature that moves where it is defined, a published root symbol, a declaration naming another package, a changed public overload, an unresolvable published export, a star export the resolver cannot follow and an inferred public return type that changed) and the rest must stay green. The graded check itself is range-scoped and lives in the `changeset` job of .github/workflows/ci.yml; registering it here would compare main to itself on every checkout and pass vacuously.', },
  // A named import of a binding the target module never publishes is `undefined`
  // at runtime and renders an invalid element. A deep-path import rewrite landed
  // 22 of them at once because the short alias for a compound primitive lives in
  // the parent barrel; no other gate in this list can see that edge.
  { id: 'import-binding-integrity-drill', run: ['node', '--test', 'scripts/check/architecture/import-binding-integrity-gate/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['import-binding-integrity'], },
  { id: 'import-binding-integrity', run: ['node', 'scripts/check/architecture/import-binding-integrity-gate/index.mjs'], blocking: true, phase: 'pre-build', drillId: 'import-binding-integrity-drill', },
  // The §1.2/§2.9 law on the scripts/ tree itself, with a decrease-only
  // hand-adjudicated baseline (F0.5 Paso D). Without it the tree re-flattens
  // at the first new file.
  { id: 'scripts-tree-drill', run: ['node', '--test', 'scripts/check/architecture/conventions/scripts-tree/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['scripts-tree'], },
  { id: 'scripts-tree', run: ['node', 'scripts/check/architecture/conventions/scripts-tree/index.mjs'], blocking: true, phase: 'pre-build', drillId: 'scripts-tree-drill', ratchet: 'scripts/check/architecture/conventions/scripts-tree/baseline/index.json', },
  { id: 'retired-vertical-identity-drill', run: ['node', '--test', 'scripts/check/verticals/retired-identity/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['retired-vertical-identity'], },
  { id: 'retired-vertical-identity', run: ['node', 'scripts/check/verticals/retired-identity/index.mjs'], blocking: true, phase: 'pre-build', drillId: 'retired-vertical-identity-drill', },
  // WO-DER-06: a first-party vertical preset is decisions and nothing the
  // compiler already produces from them. The derivability half compiles each
  // override against the decisions alone through dist/server.js, so gate and
  // drill both run post-build behind fresh-dist; the structural half (shape,
  // closed domains, override reasons) needs no build and the drill covers it too.
  {
    id: 'preset-without-derivable-values-drill',
    run: ['node', '--test', 'scripts/check/verticals/preset-without-derivable-values/index.test.mjs'],
    blocking: true,
    phase: 'post-build',
    drillFor: ['preset-without-derivable-values'],
    prerequisites: ['fresh-dist'],
  },
  {
    id: 'preset-without-derivable-values',
    run: ['node', 'scripts/check/verticals/preset-without-derivable-values/index.mjs'],
    blocking: true,
    phase: 'post-build',
    drillId: 'preset-without-derivable-values-drill',
    prerequisites: ['fresh-dist'],
  },
  { id: 'graphics-licenses-drill', run: ['node', '--test', 'scripts/package/graphics/licenses/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['graphics-licenses:check'], },
  { id: 'graphics-licenses:check', run: ['pnpm', 'run', 'graphics-licenses:check'], blocking: true, phase: 'pre-build', drillId: 'graphics-licenses-drill', },
  { id: 'graphics-packaging-drill', run: ['node', '--test', 'scripts/check/graphics-packaging/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['graphics-packaging-integrity'], },
  // The structural packaging check composes the cheaper license check above
  // with supplier identity, entrypoint closure, declarations and retention.
  // Final acceptance remains a separate mode while sighted evidence is pending.
  { id: 'graphics-packaging-integrity', run: ['node', 'scripts/check/graphics-packaging/index.mjs', '--structural'], blocking: true, phase: 'pre-build', drillId: 'graphics-packaging-drill', },
  { id: 'effects-provenance-drill', run: ['node', '--test', '../../scripts/check/effects/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['effects:provenance'], },
  { id: 'effects:provenance', run: ['pnpm', 'run', 'effects:provenance'], blocking: true, phase: 'pre-build', drillId: 'effects-provenance-drill', },
  { id: 'supplier-contract-drill', run: ['node', '--test', 'scripts/package/contracts/supplier/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['contract:check'], },
  { id: 'contract:check', run: ['pnpm', 'run', 'contract:check'], blocking: true, phase: 'pre-build', drillId: 'supplier-contract-drill', },
  { id: 'daisy-projection-contract', run: ['node', '--test', 'scripts/generate/framework-class-paint/tests/index.test.mjs'], blocking: true, phase: 'pre-build', noDrillReason:
      'This entry IS a mutant-carrying suite, not a script with a separate drill: it plants a wrong projection and asserts the contract refuses it.', },
  // The 131 evidence-framework invariants, recreated co-located under the eight
  // real owners the structural refactor left behind. The monolith they came
  // from was deleted with no successor, so the eight suites -- not a restored
  // copy -- are what this gate now runs.
  { id: 'quality-evidence-v2-drills', run: ['node', '--test',
    'scripts/check/evidence/framework/admission/index.test.mjs',
    'scripts/check/evidence/framework/craft-scoring/index.test.mjs',
    'scripts/check/evidence/framework/eligibility/index.test.mjs',
    'scripts/check/evidence/framework/integration/index.test.mjs',
    'scripts/check/evidence/framework/inventory-correspondence/index.test.mjs',
    'scripts/check/evidence/framework/ownership-overlap/index.test.mjs',
    'scripts/check/evidence/framework/receipts/index.test.mjs',
    'scripts/check/evidence/framework/rounds/evidence/index.test.mjs',
  ], blocking: true,
    phase: 'pre-build',
    noDrillReason:
      'This entry IS the drill set -- the 131 evidence-framework invariants, each suite carrying its own planted negatives.',
  },
  // The `spacing.rhythm` control census the modern-rescue manifest asks for:
  // rhythm owns the room around a control, never the control's size, capacity,
  // touch target, icon, type or motion -- and never a physical inline side,
  // which would break RTL. It ships with NO baseline and NO file list: the
  // corpus is walked from the authored source root and the offending family is
  // resolved from `family-inventory/index.json`, so a NEW off-contract reader is a
  // failure rather than an unchanged count. Drill first: a classifier that
  // returned "allowed" for everything would report zero findings and look
  // exactly like a clean tree.
  { id: 'spacing-rhythm-contract-drill', run: ['node', '--test', 'scripts/check/tokens/contracts/spacing-rhythm/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['spacing-rhythm-contract'], },
  { id: 'spacing-rhythm-contract', run: ['node', 'scripts/check/tokens/contracts/spacing-rhythm/index.mjs'], blocking: true, phase: 'pre-build', drillId: 'spacing-rhythm-contract-drill', },
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
  { id: 'channel-liveness-drill', run: ['node', '--test', 'scripts/check/tokens/cascade/channels/liveness/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['channel-liveness', 'channel-liveness-dispositions'], },
  // The OWNERSHIP half of the liveness producer, and it BLOCKS.
  //
  // Audit 100 (2026-09-11, finding F2) established that the full `--check` was
  // red with 9 findings while the gate below was excluded wholesale, which put
  // a genuinely NEW dead channel in exactly the same silence as the 44 known
  // ones. The DT registered an exact channel-to-work-order disposition for
  // every one of those 44 rows; this entry enforces that registration and
  // nothing else. It fails on an unregistered non-LIVE row, a pin whose
  // channel left the universe, a pin whose channel has gone LIVE (the table
  // only shrinks) and a pin whose class drifted -- plus the preconditions
  // without which the classification could not be read at all. It does NOT
  // require the R1 artifact and does NOT enforce the standing analysis
  // findings the producer refuses to hide; those stay in the exclusion below.
  { id: 'channel-liveness-dispositions', run: ['node', 'scripts/check/tokens/cascade/channels/liveness/index.mjs', '--check-dispositions'], blocking: true, phase: 'pre-build', drillId: 'channel-liveness-drill', },
  // Excluded from blocking, with a reason that is now exact rather than a
  // census from 2026-08-20. With the 44 rows pinned and enforced by the entry
  // above, `--check` still carries FIVE findings the disposition registry does
  // not cover and must not pretend to:
  //   * the missing R1 `channel-liveness.json` artifact, which `--write`
  //     refuses to produce while the analysis is red -- it unblocks when the
  //     four below do;
  //   * three unresolved emitter patterns (`derivation/axes/index.ts:35`,
  //     `derivation/typography/scale/index.ts:48` and `:53`), where the key is
  //     the complement of a roster, or a table computed elsewhere, and is not
  //     enumerable from source text;
  //   * 54 consumer sites under `patterns/visualization` with no canonical
  //     family-inventory row -- inventory drift.
  // Return to blocking = those five drained, not re-baselined.
  {
    id: 'channel-liveness',
    run: ['node', 'scripts/check/tokens/cascade/channels/liveness/index.mjs', '--check'],
    blocking: false,
    excluded: {
      reason: 'The 44 known non-LIVE rows are pinned to work orders and enforced BLOCKING by channel-liveness-dispositions. What keeps the full --check red is outside that law: the missing R1 artifact, three emitter patterns not enumerable from source text (derivation/axes:35, typography/scale:48 and :53), and 54 consumer sites under patterns/visualization with no family-inventory row.',
      owner: 'WO-EVI-02 (emitter-pattern resolution + R1 artifact) and WO-RET-04 (family-inventory drift); the 44 channel rows are owned per CHANNEL_DISPOSITIONS',
      trackedSince: '2026-08-20',  // re-adjudicada 2026-09-11 tras la auditoria 100 (antes: censo 2026-08-20)
    },
    phase: 'pre-build',
    drillId: 'channel-liveness-drill',
  },
  // One responsive authority: no per-instance stylesheet, 100vh/vw, width query
  // outside `runtime/responsive` or unnamed @container; every surface adopts it.
  { id: 'responsive-single-authority-drill', run: ['node', '--test', 'scripts/check/responsive/single-authority/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['responsive-single-authority'], },
  { id: 'responsive-single-authority', run: ['node', 'scripts/check/responsive/single-authority/index.mjs', '--check'], blocking: true, phase: 'pre-build', drillId: 'responsive-single-authority-drill', },

  // --- one direction authority (WO-INV-01) ---
  // Keyed on the `[dir]` SELECTOR LITERAL in any call spelling plus the
  // computed-style read, because the WO's own roster was built by a grep for
  // one spelling and went green with sixteen probes still live.
  { id: 'direction-authority-drill', run: ['node', '--test', 'scripts/check/localization/direction-authority/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['direction-authority'], },
  { id: 'direction-authority', run: ['node', 'scripts/check/localization/direction-authority/index.mjs', '--check'], blocking: true, phase: 'pre-build', drillId: 'direction-authority-drill', ratchet: 'scripts/check/localization/direction-authority/baseline/index.json', },

  // --- the paint half of the same law (WO-INV-01) ---
  // `direction-authority` governs how a component ASKS for the direction; this
  // one governs what it writes with the answer. Three bands, because a
  // symmetric `left: 0` and a measured pointer coordinate are not the defect a
  // physical margin is, and collapsing them would make the count unreadable.
  { id: 'physical-properties-drill', run: ['node', '--test', 'scripts/check/localization/physical-properties/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['physical-properties'], },
  { id: 'physical-properties', run: ['node', 'scripts/check/localization/physical-properties/index.mjs', '--check'], blocking: true, phase: 'pre-build', drillId: 'physical-properties-drill', ratchet: 'scripts/check/localization/physical-properties/baseline/index.json', },

  // --- the stylesheet half of the same law (WO-INV-01 L2) ---
  // `physical-properties` reads style OBJECTS under src/components; the Modern
  // engine paints from its skins, so a `margin-left` or an unmirrored
  // `translateX` written in CSS was measured by nothing. Four classes, because
  // a placement-keyed stamp and an `env(safe-area-inset-left)` padding are not
  // the defect a physical margin is, and a translate mirrored by `:dir(rtl)`
  // is not a defect at all.
  { id: 'physical-css-drill', run: ['node', '--test', 'scripts/check/localization/physical-css/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['physical-css'], },
  { id: 'physical-css', run: ['node', 'scripts/check/localization/physical-css/index.mjs', '--check'], blocking: true, phase: 'pre-build', drillId: 'physical-css-drill', ratchet: 'scripts/check/localization/physical-css/baseline/index.json', },

  // --- chart paint (WO-FAM-09 lot 0): one resolver, one registry, bound tables ---
  { id: 'chart-paint-single-door-drill', run: ['node', '--test', 'scripts/check/charts/paint-single-door/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['chart-paint-single-door'], },
  { id: 'chart-paint-single-door', run: ['node', 'scripts/check/charts/paint-single-door/index.mjs', '--check'], blocking: true, phase: 'pre-build', drillId: 'chart-paint-single-door-drill', ratchet: 'scripts/check/charts/paint-single-door/baseline/index.json', },
  { id: 'chart-palette-table-parity-drill', run: ['node', '--test', 'scripts/check/charts/palette-table-parity/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['chart-palette-table-parity'], },
  { id: 'chart-palette-table-parity', run: ['node', 'scripts/check/charts/palette-table-parity/index.mjs', '--check'], blocking: true, phase: 'pre-build', drillId: 'chart-palette-table-parity-drill', },
  { id: 'chart-family-registry-closure-drill', run: ['node', '--test', 'scripts/check/charts/family-registry-closure/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['chart-family-registry-closure'], },
  { id: 'chart-family-registry-closure', run: ['node', 'scripts/check/charts/family-registry-closure/index.mjs', '--check'], blocking: true, phase: 'pre-build', drillId: 'chart-family-registry-closure-drill', },
  { id: 'chart-scheme-scope-causality-drill', run: ['node', '--test', 'scripts/check/charts/scheme-scope-causality/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['chart-scheme-scope-causality'], },
  { id: 'chart-scheme-scope-causality', run: ['node', 'scripts/check/charts/scheme-scope-causality/index.mjs', '--check'], blocking: true, phase: 'pre-build', drillId: 'chart-scheme-scope-causality-drill', },

  // --- source-owned artifact freshness: this manifest runs before Build ---
  // These gates execute the authored TypeScript roster and compile CSS from
  // source in memory. A dist/-backed check here is invalid on a clean clone and
  // can also compare committed output against a stale local build.
  { id: 'first-party-roster-drill', run: ['node', '--test', 'scripts/libraries/roster/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['first-party-artifacts-source-staleness'], },
  { id: 'first-party-artifacts-source-staleness', run: ['pnpm', 'exec', 'vitest', 'run', 'src/foundation/tokens/tests/first-party-artifacts-generated.test.ts'], blocking: true, phase: 'pre-build', drillId: 'first-party-roster-drill', },
  { id: 'vertical-css-source-staleness', run: ['node', '--test', 'scripts/build/verticals/css-freshness/index.mjs'], blocking: true, phase: 'pre-build', noDrillReason:
      'This entry IS the freshness suite: it recompiles each vertical bundle from source in memory and byte-compares it against the committed file, so a scanner that stopped scanning cannot report clean.', },
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
  { id: 'first-party-single-author-drill', run: ['node', '--test', 'scripts/check/verticals/single-author/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['first-party-single-author'], },
  { id: 'first-party-single-author', run: ['node', 'scripts/check/verticals/single-author/index.mjs', '--check'], blocking: true, phase: 'pre-build', drillId: 'first-party-single-author-drill', },
  { id: 'first-party-single-author-render-laws', run: ['pnpm', 'exec', 'vitest', 'run', 'src/infrastructure/compilers/runtime/tenant-css/artifact-renderer/tests/single-author.test.ts'], blocking: true, phase: 'pre-build', noDrillReason:
      'The render laws are asserted against fresh compiler output with planted second-author mutants inside the suite; there is no separate classifier to drill.', },

  // The folder-naming and ownership suites, which drill BOTH the naming gate
  // and the real-tree structure check below it. Until now they reached CI only
  // through `test:scripts`, after the build.
  { id: 'folder-naming-drill', run: ['node', '--test', 'scripts/check/architecture/conventions/folder-naming/index.test.mjs', 'scripts/check/architecture/audits/ownership/index.test.mjs', 'scripts/check/architecture/audits/structure/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['folder-naming', 'structure-check'], },
  // --- structural / ownership ---
  { id: 'folder-naming', run: ['pnpm', 'run', 'lint:folders'], blocking: true, phase: 'pre-build', drillId: 'folder-naming-drill', },
  // F-57: the DS published six governance ESLint rules to every Rottay app,
  // had no ESLint config of its own, and its `lint` script never invoked
  // ESLint. It does now, against the plugin's SOURCE (so no build is needed),
  // with three written file exemptions and zero errors.
  { id: 'eslint-config-drill', run: ['node', '--test', 'scripts/check/automation/lint/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['eslint'], },
  { id: 'eslint', run: ['pnpm', 'run', 'lint:eslint'], blocking: true, phase: 'pre-build', drillId: 'eslint-config-drill', },
  // F-103: the real-tree structure check, the CSS layer paint gate and the
  // container-query gate were maintained OUTSIDE this inventory, in the
  // `local_gates` CI job. Two inventories is how a gate stops running without
  // anybody noticing, and `structure:check` was additionally chained a second
  // time inside `lint:folders` -- the same law measured twice per pipeline.
  // `lint:folders` is now only the naming scan; these three are the manifest's.
  { id: 'structure-check', run: ['node', 'scripts/check/architecture/audits/structure/index.mjs', '--check'], blocking: true, phase: 'pre-build', drillId: 'folder-naming-drill', ratchet: 'scripts/check/architecture/audits/structure/baseline/index.json', },
  { id: 'csspaint', run: ['pnpm', 'run', 'csspaint:check'], blocking: true, phase: 'pre-build', drillId: 'csspaint-drill', },
  { id: 'csspaint-drill', run: ['node', '--test', 'scripts/check/engine/css/paint/layers/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['csspaint'], },
  { id: 'containerquery', run: ['pnpm', 'run', 'containerquery:check'], blocking: true, phase: 'pre-build', drillId: 'containerquery-drill', ratchet: 'scripts/check/engine/css/container-queries/baseline/index.json', },
  { id: 'containerquery-drill', run: ['node', '--test', 'scripts/check/engine/css/container-queries/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['containerquery'], },
  // The audit's own six suites. `engine-token-audit` computes 3,326 counters;
  // a classifier that stopped classifying reports plausible numbers and looks
  // exactly like a clean tree -- `themeCss.unreferencedSelectors` read 0 for
  // months for exactly that reason (see `tests/theme-css-consumers`).
  { id: 'engine-token-audit-drill', run: ['node', '--test',
    'scripts/check/engine/tokens/audit/tests/effects/index.test.mjs',
    'scripts/check/engine/tokens/audit/tests/exemptions/index.test.mjs',
    'scripts/check/engine/tokens/audit/tests/framework-classes/index.test.mjs',
    'scripts/check/engine/tokens/audit/tests/motion-recipes/index.test.mjs',
    'scripts/check/engine/tokens/audit/tests/runtime-svg/index.test.mjs',
    'scripts/check/engine/tokens/audit/tests/theme-css-consumers/index.test.mjs',
  ], blocking: true, phase: 'pre-build', drillFor: ['engine-token-audit'], },
  // RE-ARMED 2026-09-07 (WO-RET-02 drain, correction packet #2). This entry was
  // excluded on 2026-09-05 (WO-CAN-02) as a debt record, never as a downgrade:
  // `themeCss.unreferencedSelectors` had read 0 next to `daisy.classConsumers:
  // 0` -- two counters asserting opposite facts about the same stylesheet --
  // because the consumed-class scanner stripped only block comments and then
  // swept every `.join(` block in a file whether or not it was reachable from a
  // `className`. FloatButton's `getFloatButtonClassName` announced the DaisyUI
  // DRAIN in a `//` comment naming `btn`, `btn-primary`, `btn-ghost`; that
  // sentence certified the very rules it was announcing the death of. With the
  // scanner honest the counter measured 18.
  //
  // The stated return condition was "the 18 rules drained, not the ceiling
  // raised", and that is exactly what happened: the `.btn*`, `.checkbox*` and
  // `.radio*` rules are gone from the modern engine's `theme/index.css`, the
  // counter reads 0, and the ceiling in `baseline/index.json` is still 0 -- it
  // was never widened. So the exclusion is retired rather than re-worded.
  {
    id: 'engine-token-audit',
    run: ['node', 'scripts/check/engine/tokens/audit/index.mjs', '--check'],
    blocking: true,
    phase: 'pre-build',
    drillId: 'engine-token-audit-drill',
    ratchet: 'scripts/check/engine/tokens/audit/baseline/index.json',
  },
  // ARCHITECTURE §1.6: "a per-component channel with no path to any root is
  // debt, and the orphan count is a decrease-only ratchet". Este es ese
  // contador -- no existia. Drill primero, como en todo el archivo: el gate
  // COMPUTA una clasificacion, y un clasificador que dejo de clasificar
  // reporta un numero plausible y se ve igual que un arbol sano.
  {
    id: 'cascade-wiring-ratchet-drill',
    run: ['node', '--test', 'scripts/check/engine/cascade-wiring/index.test.mjs'],
    blocking: true,
    phase: 'pre-build',
    drillFor: ['cascade-wiring-ratchet'],
  },
  {
    id: 'cascade-wiring-ratchet',
    run: ['node', 'scripts/check/engine/cascade-wiring/index.mjs'],
    blocking: true,
    phase: 'pre-build',
    drillId: 'cascade-wiring-ratchet-drill',
    ratchet: 'scripts/check/engine/cascade-wiring/baseline/index.json',
  },
  // El gemelo del contador de arriba: aquel pregunta si un canal tiene CAMINO a
  // una raiz, este si el nombre que la pintura lee EXISTE. Un `var(--ds-x,
  // LITERAL)` sin productor resuelve siempre al literal, asi que el canal
  // parece personalizable y no lo es -- y ningun token nuevo lo mueve. Ambos
  // leen el mismo conjunto de productores, importado, nunca medido dos veces.
  {
    id: 'read-without-producer-ratchet-drill',
    run: ['node', '--test', 'scripts/check/engine/read-without-producer/index.test.mjs'],
    blocking: true,
    phase: 'pre-build',
    drillFor: ['read-without-producer-ratchet'],
  },
  {
    id: 'read-without-producer-ratchet',
    run: ['node', 'scripts/check/engine/read-without-producer/index.mjs'],
    blocking: true,
    phase: 'pre-build',
    drillId: 'read-without-producer-ratchet-drill',
    ratchet: 'scripts/check/engine/read-without-producer/baseline/index.json',
  },
  // El corte por familia comparte el mismo conjunto de productores (importado,
  // nunca medido dos veces) y baja la ley del template a cada familia: un canal
  // leido sin productor, pintura inline o una segunda clase de vocabulario en la
  // familia calibrada es rojo bloqueante aqui, no deuda global.
  {
    id: 'family-cut-drill',
    run: ['node', '--test', 'scripts/check/family-cut/index.test.mjs'],
    blocking: true,
    phase: 'pre-build',
    drillFor: ['family-cut'],
  },
  {
    id: 'family-cut',
    run: ['node', 'scripts/check/family-cut/index.mjs'],
    blocking: true,
    phase: 'pre-build',
    drillId: 'family-cut-drill',
    ratchet: 'scripts/check/family-cut/baseline/index.json',
  },
  // WO-DER-02: un canal de estado de componente declarado a raiz sin brazo
  // material es rojo bloqueante aqui; el resto de la poblacion es ratchet
  // decrease-only, no deuda invisible.
  {
    id: 'state-material-arm-drill',
    run: ['node', '--test', 'scripts/check/tokens/states/material-arm/index.test.mjs'],
    blocking: true,
    phase: 'pre-build',
    drillFor: ['state-material-arm'],
  },
  {
    id: 'state-material-arm',
    run: ['node', 'scripts/check/tokens/states/material-arm/index.mjs'],
    blocking: true,
    phase: 'pre-build',
    drillId: 'state-material-arm-drill',
    ratchet: 'scripts/check/tokens/states/material-arm/baseline/index.json',
  },
  // The layer statement in facade/entrypoints/base/index.css is a claim about
  // how a browser sorts the shipped bundle; only a browser settles it. The
  // probe's `--self-check` leg re-runs the same three subjects against the
  // REVERSED tier order and requires every one to flip, so a probe that reads
  // source order instead of the statement fails here.
  {
    id: 'cascade-tier-order-probe',
    run: ['node', 'scripts/check/engine/css/paint/layers/layers.cascade-tier-order.probe.mjs', '--self-check'],
    blocking: true,
    phase: 'pre-build',
    noDrillReason:
      'This entry IS its own drill: `--self-check` re-runs the same three subjects against the same bundle with the tier order REVERSED and requires every one to flip, so the planted negative rides in the same process as the measurement.',
    prerequisites: ['showroom-workspace'],
  },
  // THE BY-AXIS TENANT-DIFFERENCE PROBE (kit-2026-09 section 5 rule 4). Two
  // tenant documents of one vertical differing in exactly one group, measured
  // per family as COMPUTED STYLE in Chromium across three verticals and two
  // modes, with BOTH negative controls of the rule as first-class scenarios.
  // The drill is blocking and runs everywhere: its offline half plants a defect
  // in every verdict the gate can reach, and its browser half -- a NULL pair,
  // two identical documents, which must read 0 % -- runs wherever a Chromium
  // resolves and names the reason when none does.
  { id: 'axis-difference-drill', run: ['node', '--test', 'scripts/check/theme/axis-difference/tests/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['axis-difference'],
    distExemption:
      'MEASURED, not assumed: the probe imports dist/server.js lazily inside `run()`, and the only case that '
      + 'calls it is the browser half, which declares `skip` when dist/server.js is absent. Run with dist/ moved '
      + 'away the suite exits 0 with 21 passing assertions and the browser case skipped by written reason '
      + '(2026-09-11).', },
  {
    id: 'axis-difference',
    run: ['node', 'scripts/check/theme/axis-difference/index.mjs'],
    blocking: false,
    phase: 'post-build',
    prerequisites: ['fresh-dist', 'showroom-workspace', 'playwright-chromium'],
    drillId: 'axis-difference-drill',
    excluded: {
      reason:
        'NOT a softened law and not a widened baseline: the gate is green on this tree today (palette-only '
        + 'control at 0 % on 36 of 36 evidential cells and emphasis-only control at 0 % on 12 of 12 evidential '
        + 'cells, 3 verticals x 2 modes, run 2026-09-13, with the states-axis limits published in the run '
        + 'artifact) and its drill stays '
        + 'BLOCKING. What is missing is CI wiring this lot may not do: the `core` job ("Core Library"), whose two '
        + '"Quality gates (manifest-driven, ...)" steps run this inventory, installs no browser, and only the '
        + '`a11y` and `visual` jobs run `playwright install chromium`, so a blocking entry here would be '
        + 'PREREQ-MISSING on every CI run -- which is exactly how a gate gets downgraded (F-76). '
        + 'Run it by hand with `node scripts/check/theme/axis-difference/index.mjs` after a build.',
      owner: 'WO-EVI-02 fleet acceptance (browser install in the gates job of .github/workflows/ci.yml)',
      trackedSince: '2026-09-11',
    },
  },
  // WHAT EVERY RATCHET IN THIS REPOSITORY IS STANDING ON (F-86, F-75). A
  // decrease-only promise is about the DIRECTION of a number and says nothing
  // about its size; ~9,000 findings sat frozen while every ratchet reported OK.
  // This entry owns the discipline OF the ledgers -- a written subject, a
  // declared widening, a closed APCA set -- and the debt walk the runner prints
  // beside every gate is this module's, so there is one measurement.
  { id: 'baseline-discipline-drill', run: ['node', '--test', 'scripts/check/automation/gates/baselines/tests/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['baseline-discipline'], },
  { id: 'baseline-discipline', run: ['node', 'scripts/check/automation/gates/baselines/index.mjs'], blocking: true, phase: 'pre-build', drillId: 'baseline-discipline-drill', },
  // PER-FAMILY REACH OF THE COMPILED ARTIFACTS. The causal successor to the two
  // gates F-54 retired: a channel a family reads that no shipped artifact
  // declares is a channel no tenant document can move, whatever the source
  // producers say.
  { id: 'artifact-coverage-drill', run: ['node', '--test', 'scripts/check/theme/artifact-coverage/tests/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['artifact-coverage'], },
  { id: 'artifact-coverage', run: ['node', 'scripts/check/theme/artifact-coverage/index.mjs'], blocking: true, phase: 'pre-build', drillId: 'artifact-coverage-drill', ratchet: 'scripts/check/theme/artifact-coverage/baseline/index.json', },
  // THE DENOMINATOR OF EVERY CAUSAL PERCENTAGE THIS LANE PUBLISHES.
  // `WO-EVI-02` R4 amendment 3: each axis's denominator is the set of families
  // that declare they consume it, read from the typed catalog at a recorded
  // revision and published with the run; "a denominator may never be shrunk to
  // reach a threshold". A ratio whose bottom half can move is not a
  // measurement, so the population is pinned and moves in neither direction
  // without a commit that says so. Drill first: a walk that stopped finding
  // families would publish smaller denominators and every percentage above
  // them would go UP.
  // THE SINGLE DOOR OF `ThemeIntent`, on the AST (rubric J.1). F-24 showed the
  // bypass is reachable from outside the package: a caller that assembles the
  // four fields itself has an intent the ingress never normalised and
  // `assertThemeIntent` never saw. The walk covers `packages/showroom/src` as
  // well as core, because that is where the bypass was demonstrated. Drill
  // first: a walk that stopped finding literals would report a clean tree, so
  // the gate fails on an EMPTY result as well as on a bad one.
  { id: 'intent-literal-drill', run: ['node', '--test', 'scripts/check/theme/intent-literal/tests/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['intent-literal'], },
  { id: 'intent-literal', run: ['node', 'scripts/check/theme/intent-literal/index.mjs'], blocking: true, phase: 'pre-build', drillId: 'intent-literal-drill', },
  // TIER ENFORCEMENT AT BOTH TENANT DOORS (rubric J.7). F-03: the catalog
  // carried a tier, the document carried a plan, and nothing compared them.
  // Driven off the catalog in both directions, so a new pro control fails
  // until its own rejection is proven.
  //
  // SCOPE: `bithire` only (`const VERTICAL = "bithire"` in the suite). The
  // catalog's tier is not per vertical, so one vertical exercises the rule --
  // but a refusal that only bithire's envelope produces would not be caught
  // here, and the entry says so rather than reading as a fleet claim.
  { id: 'tier-rejection-drill', run: ['pnpm', 'exec', 'vitest', 'run', 'tests/integration/tier-rejection/drill/index.test.ts'], blocking: true, phase: 'pre-build', drillFor: ['tier-rejection'], },
  { id: 'tier-rejection', run: ['pnpm', 'exec', 'vitest', 'run', 'tests/integration/tier-rejection/index.test.ts'], blocking: true, phase: 'pre-build', drillId: 'tier-rejection-drill', },
  // F-72: the propagation suite probed doors that are not the control's --
  // `surfaces.shadows.md` for `surfaces.elevation-posture`, `chrome.sidebar.bg`
  // for `navigation.sidebar-tone`. Every mutator now has to write UNDER the
  // catalog's own `keypath.brandTheme` / `keypath.document` for its row, and
  // the comparison is mechanical, so the class cannot come back. Registering
  // the suite here is what makes it run: it reached CI through no inventory.
  { id: 'capability-propagation', run: ['pnpm', 'exec', 'vitest', 'run', 'tests/integration/capability-propagation/index.test.ts'], blocking: true, phase: 'pre-build',
    noDrillReason:
      'This entry IS a mutant-carrying suite. Its keypath guard was run against the tree as it stood and caught '
      + 'two wrong doors nobody had named (typography.pairing writing a font family, shape.radius-scale writing a '
      + 'raw radius) on top of the two F-72 reported; it also carries a near-miss matcher case asserting that '
      + 'surfaces.shadows.md is NOT under surfaces.elevation and chrome.sidebar.bg is NOT under '
      + 'chrome.sidebar.tone, plus a disjoint-territory control proving one dial cannot move another dial channel.', },
  // ONE DECISION, FOUR TRANSPORTS, COMPARED AS BYTES (rubric J.4 and J.5). The
  // vocabulary relation between static and DB is owned by
  // `compilers/composition/tenant-theme/tests/static-db-channel-vocabulary.test.ts`;
  // what this pair adds is the VALUE relation, plus the preview/publish half
  // J.5 asks for and the non-vacuity law that keeps a parity of two unchanged
  // maps from passing.
  //
  // SCOPE: `bithire` only (`const VERTICAL = "bithire"` in the suite). Parity is
  // a relation between four transports of the SAME document, which one vertical
  // demonstrates; a divergence that appears only under another vertical's
  // envelope or default mode is outside what this entry measures.
  { id: 'transport-parity-drill', run: ['pnpm', 'exec', 'vitest', 'run', 'tests/integration/transport-parity/drill/index.test.ts'], blocking: true, phase: 'pre-build', drillFor: ['theme-transport-parity'], },
  { id: 'theme-transport-parity', run: ['pnpm', 'exec', 'vitest', 'run', 'tests/integration/transport-parity/index.test.ts'], blocking: true, phase: 'pre-build', drillId: 'transport-parity-drill', },
  { id: 'theme-population-drill', run: ['node', '--test', 'scripts/check/theme/population/tests/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['theme-population'], },
  { id: 'theme-population', run: ['node', 'scripts/check/theme/population/index.mjs', '--check'], blocking: true, phase: 'pre-build', drillId: 'theme-population-drill', },
  { id: 'fanout-facts-drill', run: ['node', '--test', 'scripts/generate/tokens/manifest/fanout/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['fanout-facts-freshness'], },
  // Generated manifest views must match their live sources.
  { id: 'fanout-facts-freshness', run: ['node', 'scripts/generate/tokens/manifest/fanout/index.mjs', '--check'], blocking: true, phase: 'pre-build', drillId: 'fanout-facts-drill', },
  // The `decisions lit` indicator, which STATUS republishes verbatim from
  // `scripts/check/decisions-lit/evidence/index.json`.
  //
  // WHAT IS GATED HERE IS THE ARTIFACT, NOT THE RUN. The measurement drives a
  // Chromium through Playwright, and the job that runs this inventory installs
  // no browser -- only the a11y and visual jobs do. A blocking entry for the
  // run would therefore be red for a missing input on every CI run, which is
  // how a gate gets downgraded; and a run that CI could not perform would leave
  // the committed artifact unguarded either way. So the run stays a hand-run
  // measurement (`pnpm run decisions-lit`) and what CI enforces is that the
  // published measurement still describes this tree: the artifact carries a
  // content digest of the door roots it was measured through and of the
  // instrument that measured it, and `check` recomputes both. A stale artifact
  // is refused by name rather than republished as MEASURED.
  //
  // Source-and-artifact only, so it is valid on a clean checkout and declared
  // pre-build: the door digest is taken from `src/`, never from `dist/`.
  // Drill first, and here with a reason of its own: the guard's whole verdict
  // is a digest comparison, and a digest that stopped covering a file reports
  // agreement and looks exactly like a fresh artifact.
  { id: 'decisions-lit-drill', run: ['node', '--test', 'scripts/check/decisions-lit/tests/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['decisions-lit-freshness'],
    distExemption:
      'MEASURED, not assumed: the door import of `dist/server.js` is lazy and only fires when a decision is actually compiled, and this suite never compiles one. Run with `dist/` moved away it exits 0 (2026-09-08).',
  },
  { id: 'decisions-lit-freshness', run: ['pnpm', 'run', 'decisions-lit:check'], blocking: true, phase: 'pre-build', drillId: 'decisions-lit-drill',
    distExemption:
      'MEASURED, not assumed: the freshness read compares the committed artifact against its inputs and never reaches the lazy `dist/server.js` door. Run with `dist/` moved away it exits 0 (2026-09-08).',
  },
  { id: 'claim-exactness-drill', run: ['node', '--test', 'scripts/check/evidence/certification/claims/exactness/index.test.mjs', 'scripts/check/evidence/certification/claims/exactness/tests/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['claim-exactness'], prerequisites: ['docs-engineering-corpus'], },
  // The exact proof runs the audit above a second time inside two deterministic
  // passes and adds the planes no other gate covers: the claim/contract census in
  // the documentation, the code-derived vertical rows, the data-part corpus, and
  // the whole-file SHA-256 documentation seal. It was reachable only through
  // `pnpm run claim-exactness:check`, so a doc could contradict source with the whole
  // dashboard green. It sits AFTER the audit deliberately: when the audit is red
  // this gate is red for the same reason but far more slowly.
  { id: 'claim-exactness', run: ['node', 'scripts/check/evidence/certification/claims/exactness/index.mjs', '--check-artifact'], blocking: true, phase: 'pre-build', drillId: 'claim-exactness-drill', prerequisites: ['docs-engineering-corpus'], },
  { id: 'anatomy-variant-drill', run: ['node', '--test', 'scripts/check/engine/runtime/anatomy-variants/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['anatomy-variant-gate'], },
  { id: 'anatomy-variant-gate', run: ['node', 'scripts/check/engine/runtime/anatomy-variants/index.mjs', '--check'], blocking: true, phase: 'pre-build', drillId: 'anatomy-variant-drill', },
  { id: 'size-axis-law-drill', run: ['node', '--test', 'scripts/check/boundaries/components/sizing/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['size-axis-law-gate'], },
  { id: 'size-axis-law-gate', run: ['node', 'scripts/check/boundaries/components/sizing/index.mjs', '--check'], blocking: true, phase: 'pre-build', drillId: 'size-axis-law-drill', },
  { id: 'application-boundary-drill', run: ['node', '--test', 'scripts/check/boundaries/components/imports/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['application-boundary-gate'], },
  { id: 'application-boundary-gate', run: ['node', 'scripts/check/boundaries/components/imports/index.mjs', '--check'], blocking: true, phase: 'pre-build', drillId: 'application-boundary-drill', ratchet: 'scripts/check/boundaries/components/imports/baseline/index.json', },
  { id: 'pattern-surface-ownership-drill', run: ['node', '--test', 'scripts/check/boundaries/surfaces/ownership/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['pattern-surface-ownership'], },
  { id: 'pattern-surface-ownership', run: ['node', 'scripts/check/boundaries/surfaces/ownership/index.mjs', '--check'], blocking: true, phase: 'pre-build', drillId: 'pattern-surface-ownership-drill', ratchet: 'scripts/check/boundaries/surfaces/ownership/baseline/index.json', },
  // Este gate verifica DOS cosas por la misma corrida: la FORMA de los 77
  // entrypoints publicos (owner, boundary, simbolos, fan-out, barriles
  // prohibidos) y, desde el lote DRILL-77 (2026-08-28), el ANCLA DECRECE-SOLO de
  // su presupuesto. El ancla cubre las DOS dimensiones gobernadas --
  // `budget.maxReachableModules` y `budget.maxSourceBytes`: gobernar solo los
  // bytes dejaba media puerta abierta, y por ahi paso una ampliacion de modulos
  // con el gate en verde.
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
  // THE HALF OF ENTRYPOINT PARITY NOBODY CHECKED. `public-entrypoint-boundary`
  // compares the 76 governed subpaths exhaustively, but its reverse rule is
  // scoped to six owners: 44 of the 120 published subpaths -- ./icons, ./marks,
  // ./charts, ./styles/*, ./fonts/*, ./eslint, ./server, the CSS glob -- are
  // outside it entirely, so a 121st could join them unreviewed. This pair
  // classifies every subpath exactly once with a written reason per class, and
  // asks the reverse question nothing asked: which entrypoint owners on disk
  // does nobody publish.
  { id: 'entrypoint-parity-drill', run: ['node', '--test', 'scripts/check/boundaries/entrypoint-parity/tests/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['entrypoint-parity'], },
  { id: 'entrypoint-parity', run: ['node', 'scripts/check/boundaries/entrypoint-parity/index.mjs'], blocking: true, phase: 'pre-build', drillId: 'entrypoint-parity-drill', },
  { id: 'public-entrypoint-boundary-drill', run: ['node', '--test', 'scripts/check/boundaries/public-api/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['public-entrypoint-boundary'], },
  { id: 'public-entrypoint-boundary', run: ['node', 'scripts/check/boundaries/public-api/index.mjs'], blocking: true, phase: 'pre-build', drillId: 'public-entrypoint-boundary-drill', ratchet: 'scripts/check/boundaries/public-api/ceilings/index.json', },
  // The published root carries `use client`, so a server module that names a
  // server-safe symbol through it pulls the client graph into the RSC build.
  // Nothing above sees that: the parity gate reads the export map, not who
  // imports what, and the subpath lint reads a disposition table that cannot
  // tell a server module from a client one.
  { id: 'rsc-client-root-drill', run: ['node', '--test', 'scripts/check/boundaries/rsc-client-root/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['rsc-client-root'], },
  { id: 'rsc-client-root', run: ['node', 'scripts/check/boundaries/rsc-client-root/index.mjs'], blocking: true, phase: 'pre-build', drillId: 'rsc-client-root-drill', },
  // Drill first: the freeze gate's own self-test was 25/25 green while 43 of its
  // 78 written exceptions were keyed at paths git has never contained, because
  // nothing asserted that a key resolves. A detector that cannot be seen
  // refusing a planted mis-key is not evidence about the ledger.
  { id: 'engine-wiring-drill', run: ['node', '--test', 'scripts/check/engine/wiring/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['engine-wiring'], },
  { id: 'engine-wiring', run: ['node', 'scripts/check/engine/wiring/index.mjs'], blocking: true, phase: 'pre-build', drillId: 'engine-wiring-drill', },
  {
    id: 'engine-posture',
    run: [
      'pnpm',
      'exec',
      'vitest',
      'run',
      'src/infrastructure/compilers/runtime/theme/presentation/adapters/tests',
    ],
    blocking: true,
    phase: 'pre-build',
    noDrillReason:
      'The posture suite plants a wrong posture per adapter and asserts the classifier refuses it; the mutants live inside the suite.',
  },
  { id: 'engine-freeze-drill', run: ['node', '--test', 'scripts/check/engine/lifecycle/freeze/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['engine-freeze-gate'],
    distExemption:
      'MEASURED, not assumed: it imports the consumers module for its roster helpers and never calls `importDist`. Run with `dist/` moved away it exits 0 (2026-09-08).',
  },
  { id: 'engine-freeze-gate', run: ['node', 'scripts/check/engine/lifecycle/freeze/index.mjs', '--check'], blocking: true, phase: 'pre-build', drillId: 'engine-freeze-drill', ratchet: 'scripts/check/engine/lifecycle/freeze/baseline/index.json', },
  // The integration fence had NO manifest entry and NO test owner, so its three
  // silent-green defects could not be caught by anything. Drill first, for the
  // usual reason and for one of its own: a rename that disables an emitter and a
  // correct measurement of zero are indistinguishable by orphan count.
  { id: 'integration-audit-drill', run: ['node', '--test', 'scripts/check/architecture/audits/integration/tests/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['integration-audit'], },
  { id: 'integration-audit', run: ['node', 'scripts/check/architecture/audits/integration/index.mjs'], blocking: true, phase: 'pre-build', drillId: 'integration-audit-drill', },
  // ONE lowering. The property C2 exists to establish is invisible in a diff
  // and can be lost one import at a time, so it is asserted structurally: the
  // retired doors must not exist as productive symbols and nothing productive
  // may reach them. The suite carries its own planted mutants, so the gate has
  // been seen failing for each forbidden door rather than only passing.
  { id: 'theme-lowering-single-door', run: ['pnpm', 'exec', 'vitest', 'run', 'tests/architecture/theme-lowering-single-door/index.test.ts'], blocking: true, phase: 'pre-build', noDrillReason:
      'The suite carries its own planted mutants -- one per retired door -- so it has been seen failing for each forbidden door rather than only passing.', },
  // The lowering's bytes against the one oracle it cannot have written: the
  // committed first-party artifacts.
  { id: 'theme-lowering-artifact-oracle', run: ['pnpm', 'exec', 'vitest', 'run', 'src/infrastructure/compilers/runtime/theme/runtime/lowering/tests/artifact-oracle.test.ts'], blocking: true, phase: 'pre-build', noDrillReason:
      'The oracle is the committed artifact the lowering did not write; perturbing the lowering is what the suite already asserts.', },
  { id: 'portal-substrate-drill', run: ['node', '--test', 'scripts/check/boundaries/surfaces/portals/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['portal-substrate-gate'], },
  { id: 'portal-substrate-gate', run: ['node', 'scripts/check/boundaries/surfaces/portals/index.mjs', '--check'], blocking: true, phase: 'pre-build', drillId: 'portal-substrate-drill', },
  // Bidirectional identity between every `--_ds-proto-*` in the sources and its
  // row in `src/foundation/tokens/data/prototypes/index.json`. It ships with NO
  // baseline, so the drill carries the whole burden of proving the scan can
  // fail -- including that a name quoted in prose is not a declaration, and
  // that a governed prototoken compiled into a shipped bundle is legal while an
  // ungoverned one is not. Drill first: a census computed by a broken scanner
  // would report zero findings and look identical to a clean tree.
  { id: 'prototype-ledger-drill', run: ['node', '--test', 'scripts/check/tokens/governance/prototypes/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['prototype-ledger'], },
  { id: 'prototype-ledger', run: ['node', 'scripts/check/tokens/governance/prototypes/index.mjs', '--check'], blocking: true, phase: 'pre-build', drillId: 'prototype-ledger-drill', },

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
  { id: 'color-mix-argument-purity-drill', run: ['node', '--test', 'scripts/check/tokens/cascade/purity/color-mix/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['color-mix-argument-purity'], },
  { id: 'color-mix-argument-purity', run: ['node', 'scripts/check/tokens/cascade/purity/color-mix/index.mjs'], blocking: true, phase: 'pre-build', drillId: 'color-mix-argument-purity-drill', },
  // Shipped bundles carry no third-party framework CSS. Safe to run before
  // Build: the five committed `styles/*.css` mirrors are required and the
  // `dist/*` copies are audited only when present, so a clean clone certifies
  // the same law without a build step.
  // The palette seam: `--ds-chart-series-1..12` may be DEFINED only by a
  // tenant-scope compiler, never by anything closer to the marks. It was
  // orphaned and red on 2026-08-19 -- not because a component had defined the
  // channel, but because the palette authority moved into the brand-theme
  // compiler in dcc65ca34 without the allowlist moving with it. Allowlist
  // corrected, drill re-pinned at two sanctioned definers, gate wired here so
  // the next such move cannot land unreviewed.
  { id: 'chart-series-reserved-name-drill', run: ['node', '--test', 'scripts/check/tokens/contracts/chart-series/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['chart-series-reserved-name'], },
  { id: 'chart-series-reserved-name', run: ['node', 'scripts/check/tokens/contracts/chart-series/index.mjs', '--check'], blocking: true, phase: 'pre-build', drillId: 'chart-series-reserved-name-drill', },

  // --- D0 customization-surface truth (drill first: a census computed by a
  // broken scanner reports zero findings and looks identical to a clean
  // tree). The report is DERIVED from the existing authorities (hooks
  // manifest, capability registry, raw allowlist, expressive lists) plus a
  // PostCSS/TS-AST consumption scan; these gates keep it fresh, fully
  // classified, evidence-backed and decrease-only on dead writers.
  { id: 'customization-surface-drill', run: ['node', '--test', 'scripts/generate/tokens/customization/surface/tests/gate/index.test.mjs', 'scripts/generate/tokens/customization/surface/tests/classifier/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['customization-surface-freshness', 'customization-surface-classification', 'customization-capability-consumers', 'customization-dead-writers'], },
  { id: 'customization-surface-freshness', run: ['node', 'scripts/generate/tokens/customization/surface/index.mjs', '--check=freshness'], blocking: true, phase: 'pre-build', drillId: 'customization-surface-drill', },
  { id: 'customization-surface-classification', run: ['node', 'scripts/generate/tokens/customization/surface/index.mjs', '--check=classification'], blocking: true, phase: 'pre-build', drillId: 'customization-surface-drill', },
  { id: 'customization-capability-consumers', run: ['node', 'scripts/generate/tokens/customization/surface/index.mjs', '--check=capabilities'], blocking: true, phase: 'pre-build', drillId: 'customization-surface-drill', },
  { id: 'customization-dead-writers', run: ['node', 'scripts/generate/tokens/customization/surface/index.mjs', '--check=dead'], blocking: true, phase: 'pre-build', drillId: 'customization-surface-drill', ratchet: 'scripts/generate/tokens/customization/surface/dead-writers-baseline/index.json', },
  // Official tokens documentation is a deterministic projection; stale docs,
  // derivation cycles, undocumented public hooks, unknown capability
  // channels and unadjudicated dual authorities all block here.
  { id: 'tokens-catalog-drill', run: ['node', '--test', 'scripts/generate/tokens/customization/catalog/tests/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['tokens-catalog'], },
  // `--in-repo-only`: this gate's full `--check` reads the sibling
  // `docs-engineering` checkout, which CI does not carry and which C0 may not
  // write. The deferred cross-repo checks are PRINTED by name on every run, so
  // what is not being measured is visible rather than implied; the full form
  // stays available as `pnpm tokens:catalog:check` for the documentation
  // reconciliation that owns it.
  { id: 'tokens-catalog', run: ['node', 'scripts/generate/tokens/customization/catalog/index.mjs', '--check', '--in-repo-only'], blocking: true, phase: 'pre-build', drillId: 'tokens-catalog-drill', },
  // Preserve source provenance for every customization surface.
  { id: 'customization-preservation-drill', run: ['node', '--test', 'scripts/generate/tokens/customization/preservation/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['customization-preservation'], },
  { id: 'customization-preservation', run: ['node', 'scripts/generate/tokens/customization/preservation/index.mjs', '--check'], blocking: true, phase: 'pre-build', drillId: 'customization-preservation-drill', },

  // Every fenced read carries exactly one ownership row.
  { id: 'reads-adjudication', run: ['node', 'scripts/check/tokens/cascade/reads/index.mjs'], blocking: true, phase: 'pre-build', noDrillReason:
      'TRACKED DEBT, not a justification: this gate compares a hand-adjudicated ownership table against the fenced reads it finds, and nothing has ever been seen making it go red. Owner: WO-DER-05 (reads move into the derivation), which either gives it a drill or retires it.', },

  // Worklist bindings must resolve to shipped CSS and rendered nodes.
  { id: 'customization-worklist-drill', run: ['node', '--test', 'scripts/check/tokens/customization/visual-worklist/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['customization-worklist'], },
  { id: 'customization-worklist', run: ['node', 'scripts/check/tokens/customization/visual-worklist/index.mjs'], blocking: true, phase: 'pre-build', drillId: 'customization-worklist-drill', },

  // Every counted Modern font-size literal carries an ownership row.
  { id: 'literal-ownership-drill', run: ['node', '--test', 'scripts/check/engine/tokens/literal-ownership/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['literal-ownership'], },
  { id: 'literal-ownership', run: ['node', 'scripts/check/engine/tokens/literal-ownership/index.mjs'], blocking: true, phase: 'pre-build', drillId: 'literal-ownership-drill', },

  // WO-CAN-04 / F-18 / F-56: the three laws that keep a SECOND customization
  // path from reopening beside the compiler. Each is a census over authored
  // component source, so each is a classifier that can rot into a permanent
  // green -- drill first, in every case.
  //
  // Anatomy is never drawn by a die roll: `data-terminal-card` and `insights`
  // chose their skin with a random number, so the server rendered one product
  // and the client another.
  { id: 'component-determinism-drill', run: ['node', '--test', 'scripts/check/components/determinism/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['component-determinism'], },
  { id: 'component-determinism', run: ['node', 'scripts/check/components/determinism/index.mjs'], blocking: true, phase: 'pre-build', drillId: 'component-determinism-drill', },
  // An app cannot outrank the tenant from its own config: every declared
  // `SurfaceVisualOverrides` field is catalog-modelled, mapped to the tenant
  // channel it speaks for, and applied only through the admission door.
  { id: 'instance-override-subordination-drill', run: ['node', '--test', 'scripts/check/components/instance-override-subordination/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['instance-override-subordination'], },
  { id: 'instance-override-subordination', run: ['node', 'scripts/check/components/instance-override-subordination/index.mjs'], blocking: true, phase: 'pre-build', drillId: 'instance-override-subordination-drill', },
  // Structures and surfaces reach the browser through the declared runtime,
  // never around it: no `window.location`, no `localStorage`, no `CustomEvent`
  // channel with no owner and no types.
  { id: 'component-runtime-boundary-drill', run: ['node', '--test', 'scripts/check/components/runtime-boundary/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['component-runtime-boundary'], },
  { id: 'component-runtime-boundary', run: ['node', 'scripts/check/components/runtime-boundary/index.mjs'], blocking: true, phase: 'pre-build', drillId: 'component-runtime-boundary-drill', },

  // The published controls table is generated from current product contracts.
  // Both its freshness check and its drill suite need `dist/` -- the drill
  // suite imports `check()`/`build()` from the generator module, which loads
  // the compiled tenant capability registry the same way the freshness check
  // does -- so neither can run in this pre-build chain. Both run post-build
  // in CI instead.

  // --- white-label channel + theme parity ---
  // Drill first: the parity gate's own baseline test runs on synthetic fixtures,
  // so the transitional obligation -- the instrument that replaced an opaque
  // ceiling -- had no executable guard at all until now.
  { id: 'theme-channel-parity-drill', run: ['node', '--test', 'scripts/check/tokens/cascade/channels/theme-parity/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['theme-channel-parity'], },
  { id: 'theme-channel-parity', run: ['node', 'scripts/check/tokens/cascade/channels/theme-parity/index.mjs', '--check', '--quiet'], blocking: true, phase: 'pre-build', drillId: 'theme-channel-parity-drill', ratchet: 'scripts/check/tokens/cascade/channels/theme-parity/baseline/index.json', },
  // Drill first: the reachability census is baseline-backed, so a measurer that
  // quietly stopped resolving names would report zero violations and read as clean.
  { id: 'tenant-reachability-drill', run: ['node', 'scripts/check/orchestration/tests/drills/tenant-reachability/index.mjs'], blocking: true, phase: 'pre-build', drillFor: ['tenant-reachability'], },
  { id: 'tenant-reachability', run: ['node', 'scripts/check/orchestration/public/tenant-reachability/index.mjs'], blocking: true, phase: 'pre-build', drillId: 'tenant-reachability-drill', ratchet: 'scripts/check/orchestration/public/tenant-reachability/baseline/index.json', },
  { id: 'i18n-key-parity-drill', run: ['node', '--test', 'scripts/check/localization/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['i18n-key-parity'], },
  { id: 'i18n-key-parity', run: ['node', 'scripts/check/localization/index.mjs', '--check'], blocking: true, phase: 'pre-build', drillId: 'i18n-key-parity-drill', ratchet: 'scripts/check/localization/baseline/index.json', },
  // CI checks app-bithire out explicitly and local workspace runs discover the
  // sibling repository. NOT `--optional`: a missing corpus is a hard failure,
  // and the manifest validator forbids downgrading a blocking gate.
  // Answers the question the boundary gate above does not: WHICH `--ds-*`
  // properties an app may assign, and under what scope (audit 2026-07-26,
  // independent code audit C3). Its allowlist is derived from DS source, so the drill runs
  // first: an anchor that has drifted must surface as a drill failure, not as
  // a corpus verdict computed from a degraded allowlist.
  { id: 'app-ds-hook-contract-drill', run: ['node', '--test', 'scripts/check/boundaries/applications/hooks/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['app-ds-hook-contract', 'application-hook-contract-freshness'], },
  { id: 'app-ds-hook-contract', run: ['node', 'scripts/check/boundaries/applications/hooks/index.mjs', '--check'], blocking: true, phase: 'pre-build', drillId: 'app-ds-hook-contract-drill', ratchet: 'scripts/check/boundaries/applications/hooks/baseline/index.json', },
  // The contract is only "exported and consumed" (independent code audit C6.6) if the artifact an
  // app resolves matches the DS it was derived from. This gate fails on a stale
  // contracts/css/hooks/index.json, on a missing package export, and on an export that
  // resolves in-repo but would 404 for an installed consumer. Without it the
  // published contract can drift silently, which is worse than not publishing:
  // apps would consume a hook list the DS no longer honours.
  { id: 'application-hook-contract-freshness', run: ['node', 'scripts/check/boundaries/applications/hooks/index.mjs', '--manifest-check'], blocking: true, phase: 'pre-build', drillId: 'app-ds-hook-contract-drill', },
  // The same boundary at the DOM instead of the stylesheet (audit 2026-07-26,
  // independent code audit C6.7): governed root channels have one SSR projection and one
  // hydrated owner, so an application holds no raw `<html>` writer. It ships
  // with no baseline, so the drill carries the whole burden of proving the
  // scan can fail -- including on the computed attribute names the writer this
  // gate was built for actually used.
  { id: 'app-root-writer-drill', run: ['node', '--test', 'scripts/check/boundaries/applications/root-state/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['app-root-writer'], },
  { id: 'app-root-writer', run: ['node', 'scripts/check/boundaries/applications/root-state/index.mjs', '--check'], blocking: true, phase: 'pre-build', drillId: 'app-root-writer-drill', },

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
  { id: 'motion-contracts', run: ['node', 'scripts/check/contracts/motion/index.mjs', '--repositories', 'ui-design-system'], blocking: true, phase: 'pre-build', drillId: 'motion-contracts-drill', },
  { id: 'motion-contracts-drill', run: ['node', '--test', 'scripts/check/contracts/motion/tests/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['motion-contracts'], },

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
  // The manifest it reads is the SEALED QUARANTINE corpus (WO-RET-03,
  // 2026-09-19): `docs/history/inventories/customization-manifest`. Staleness
  // is its permanent state -- it can never agree with live source again,
  // because the corpus records 11 retired families whose source bindings no
  // longer resolve. That is exactly why the freshness gate that used to run
  // ahead of this chain is RETIRED (see RETIRED_GATES): enforcing freshness
  // on a sealed archive is unmeetable by construction, and green-on-stale is
  // what the quarantine README forbids a gate to claim. Taxonomy still reads
  // the corpus, as evidence, and its parity question is against the family
  // inventory, not against live source.
  {
    id: 'taxonomy-parity-drill',
    run: ['node', '--test', 'scripts/check/taxonomy/parity-gate/index.test.mjs'],
    blocking: true,
    phase: 'pre-build',
    drillFor: ['taxonomy-parity'],
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
    phase: 'pre-build',
    drillFor: ['taxonomy-parity'],
  },
  // The resolver is the taxonomy gate's only binding an incorrect inventory
  // cannot fake, which makes its own blind spots the weakest link in the chain.
  // Both drilled defects were live: alias re-exports invented ambiguity that did
  // not exist, and `Object.assign` compounds read as plain values.
  {
    id: 'taxonomy-public-root-drill',
    run: ['node', '--test', 'scripts/libraries/taxonomy/roots/index.test.mjs'],
    blocking: true,
    phase: 'pre-build',
    drillFor: ['taxonomy-parity'],
  },
  {
    id: 'taxonomy-parity',
    run: ['node', 'scripts/check/taxonomy/parity-gate/index.mjs'],
    blocking: true,
    phase: 'pre-build',
    drillId: 'taxonomy-parity-drill',
  },
  // The --ds_ experimentation space never reaches shipped CSS (canon: --ds-).
  {
    id: 'ds-prefix',
    run: ['node', 'scripts/check/tokens/governance/private-prefix/index.mjs'],
    blocking: true,
    phase: 'pre-build',
    noDrillReason:
      'TRACKED DEBT, not a justification: the `--ds_` scan has no planted negative, so a scanner that stopped scanning would report clean. Owner: WO-CAN-02 follow-up in WO-GAT lane; the gate ships with no baseline, which bounds but does not replace a drill.',
  },
  // The 63-root cascade catalog must agree with the tree it describes; until
  // this gate existed nothing read it at all.
  {
    id: 'root-catalog-freshness',
    run: ['node', 'scripts/check/tokens/cascade/roots/catalog-freshness/index.mjs'],
    blocking: true,
    phase: 'pre-build',
    noDrillReason:
      'TRACKED DEBT, not a justification: the 63-root catalog is compared against the tree it describes and nothing plants a divergence. Owner: WO-DER-01, which regenerates the catalog from the derivation and can then drill it.',
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
    phase: 'pre-build',
    drillFor: ['root-exposure'],
  },
  {
    id: 'root-exposure',
    run: ['node', 'scripts/check/tokens/cascade/roots/exposure/index.mjs'],
    blocking: true,
    phase: 'pre-build',
    drillId: 'root-exposure-drill',
    ratchet: 'scripts/check/tokens/cascade/roots/exposure/baseline/index.json',
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
    phase: 'pre-build',
    drillFor: ['dial-authority'],
  },
  {
    id: 'dial-authority',
    run: ['node', 'scripts/check/tokens/customization/authority/index.mjs'],
    blocking: true,
    phase: 'pre-build',
    drillId: 'dial-authority-drill',
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
    phase: 'post-build',
    drillFor: ['root-membership'],
    prerequisites: ['fresh-dist'],
  },
  {
    id: 'root-membership',
    run: ['node', 'scripts/check/tokens/cascade/roots/membership/index.mjs', '--check'],
    blocking: true,
    phase: 'post-build',
    drillId: 'root-membership-drill',
    prerequisites: ['fresh-dist'],
  },
  // WO-DER-02: la sonda de computed-style corre contra el artefacto compilado,
  // por eso va post-build con fresh-dist; su drill cierra la puerta a un
  // veredicto que no lee pintura real.
  {
    id: 'states-emphasis-probe-drill',
    run: ['node', '--test', 'scripts/check/tokens/states/emphasis-probe/index.test.mjs'],
    blocking: true,
    phase: 'post-build',
    drillFor: ['states-emphasis-probe'],
    prerequisites: ['fresh-dist'],
  },
  {
    id: 'states-emphasis-probe',
    run: ['node', 'scripts/check/tokens/states/emphasis-probe/index.mjs'],
    blocking: true,
    phase: 'post-build',
    drillId: 'states-emphasis-probe-drill',
    prerequisites: ['fresh-dist'],
  },
  // WO-DER-03: la misma disciplina para F-07. El gate textual `dial-authority`
  // certificaba un dial presente dentro de un calc() que se auto-cancelaba;
  // solo computed-style distingue "presente" de "causal".
  {
    id: 'shape-radius-probe-drill',
    run: ['node', '--test', 'scripts/check/tokens/shape/index.test.mjs'],
    blocking: true,
    phase: 'post-build',
    drillFor: ['shape-radius-probe'],
    prerequisites: ['fresh-dist'],
  },
  {
    id: 'shape-radius-probe',
    run: ['node', 'scripts/check/tokens/shape/index.mjs'],
    blocking: true,
    phase: 'post-build',
    drillId: 'shape-radius-probe-drill',
    prerequisites: ['fresh-dist'],
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
    phase: 'post-build',
    drillFor: ['slot-inventory'],
    prerequisites: ['fresh-dist'],
  },
  {
    id: 'slot-inventory',
    run: ['node', 'scripts/check/tokens/cascade/slots/index.mjs', '--check'],
    blocking: true,
    phase: 'post-build',
    drillId: 'slot-inventory-drill',
    prerequisites: ['fresh-dist'],
    ratchet: 'scripts/check/tokens/cascade/slots/baseline/index.json',
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
    phase: 'pre-build',
    drillFor: ['normalization-contract'],
  },
  {
    id: 'normalization-contract',
    run: ['node', 'scripts/check/tokens/cascade/normalization/index.mjs', '--check'],
    blocking: true,
    phase: 'pre-build',
    drillId: 'normalization-contract-drill',
    ratchet: 'scripts/check/tokens/cascade/normalization/baseline/index.json',
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
    phase: 'post-build',
    drillFor: ['purity'],
    prerequisites: ['fresh-dist'],
  },
  {
    id: 'purity',
    run: ['node', 'scripts/check/tokens/cascade/purity/references/index.mjs', '--check'],
    blocking: true,
    phase: 'post-build',
    drillId: 'purity-drill',
    prerequisites: ['fresh-dist'],
  },
  {
    id: 'resolved-map-drill',
    run: ['node', '--test', 'scripts/check/tokens/cascade/resolution/index.test.mjs'],
    blocking: true,
    phase: 'post-build',
    drillFor: ['resolved-map'],
    prerequisites: ['fresh-dist'],
  },
  {
    id: 'resolved-map',
    run: ['node', 'scripts/check/tokens/cascade/resolution/index.mjs', '--check'],
    blocking: true,
    phase: 'post-build',
    drillId: 'resolved-map-drill',
    prerequisites: ['fresh-dist'],
  },
  // The base environment is the `:root` projection of the static token layer
  // that the non-CSS token emitter resolves a compilation against. A stale
  // projection does not fail loudly: it answers with what the static layer used
  // to declare, so the emitted document reports values the browser never paints.
  {
    id: 'base-environment-freshness-drill',
    run: ['node', '--test', 'scripts/check/tokens/cascade/roots/base-environment-freshness/index.test.mjs'],
    blocking: true,
    phase: 'post-build',
    drillFor: ['base-environment-freshness'],
    prerequisites: ['fresh-dist'],
  },
  {
    id: 'base-environment-freshness',
    run: ['node', 'scripts/check/tokens/cascade/roots/base-environment-freshness/index.mjs', '--check'],
    blocking: true,
    phase: 'post-build',
    drillId: 'base-environment-freshness-drill',
    prerequisites: ['fresh-dist'],
  },
  { id: 'wiring-coverage-drill', run: ['node', '--test', 'scripts/check/automation/wiring/gate-coverage/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['wiring-coverage'], },
  // Every production script is wired through a declared channel (manifest,
  // lifecycle chain or ci.yml) or it does not exist. This gate is what makes
  // §1.10's "the wiring gate counts all three channels" true.
  {
    id: 'wiring-coverage',
    run: ['node', 'scripts/check/automation/wiring/gate-coverage/index.mjs'],
    blocking: true,
    phase: 'pre-build',
    drillId: 'wiring-coverage-drill',
  },
  // Drills for the three F0 honesty gates: a gate that cannot fail is not a
  // gate.
  // PACKAGE GATES — drills here, gates post-build, and the reason stated.
  //
  // `distfresh`, `packinv`, `public-declarations`, `public-barrel` and
  // `exports-artifact` all READ `dist/`. This manifest is consumed by `pretest`
  // and by the CI `gates:ci` step, both of which run BEFORE the build, so
  // listing the gates themselves here would make the inventory claim something
  // it cannot run: on a clean checkout there is no dist to audit, and a gate
  // that is red for that reason gets downgraded, which is the failure class this
  // file exists to prevent.
  //
  // WRITTEN EXCEPTION (C0.9): the five gates keep their post-build channel --
  // `distfresh:check` and `packinv:check` are named steps in `ci.yml` after the
  // build, and the three public-API gates chain from `postbuild`. What was
  // genuinely missing is that none of them had a drill proving it can go red,
  // and four of the dist-freshness mutants (a standalone re-stamp, a post-stamp
  // dist mutation, an emptied dist, a partial build) were GREEN. Those drills
  // are fixture-based and dist-independent, so they belong here.
  { id: 'dist-freshness-drill', run: ['node', '--test', 'scripts/package/artifacts/freshness/tests/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['dist-freshness'], },
  { id: 'pack-inventory-drill', run: ['node', '--test', 'scripts/package/artifacts/inventory/tests/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['pack-inventory'], },
  // Determinism of the generated cascade coverage document, whose artifact is
  // gitignored: the drills prove the document is a pure function of its inputs
  // and that the generator can create the directory it owns on a clean clone.
  { id: 'docs-public-set-drill', run: ['node', '--test', 'scripts/check/docs/tests/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['docs-public-set:check'], },
  // The published documentation set has no other mechanical guard: a broken
  // link, a legacy path reference, non-English prose or a malformed diagram
  // is otherwise silent until a reader hits it.
  { id: 'docs-public-set:check', run: ['pnpm', 'run', 'docs-public-set:check'], blocking: true, phase: 'pre-build', drillId: 'docs-public-set-drill', },

  // =========================================================================
  // POST-BUILD PHASE
  //
  // Everything below needs `dist/`. Until this split existed the inventory
  // claimed one phase and CI ran two: `gates:ci` before the build, and then a
  // hand-written list of named steps in `ci.yml` after it -- a SECOND
  // inventory, which is how `runtime-hardening:structural` and
  // `public-declarations:check` ended up wired only to `prepack`, a hook that
  // fires on `npm pack`/`npm publish` and therefore never in CI.
  //
  // These entries are not new laws. They are the laws `ci.yml` was carrying in
  // YAML, moved into the one inventory, plus the four cascade gates whose
  // transitive module graph reaches `dist/server.js` and which
  // `validateManifest()` now REFUSES to accept in the pre-build phase.
  // =========================================================================

  // The published controls table is regenerated from the compiled tenant
  // capability registry, so both the freshness check and its drill need dist.
  // WO-CAT-02. The typed catalog is the only list of controls, so three entries
  // guard it: the listing law itself, the schema it generates, and the coverage
  // law that cannot pass until the derivation lane lands.
  { id: 'theme-single-listing-drill', run: ['node', '--test', 'scripts/check/theme/single-listing/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['theme-single-listing'], },
  { id: 'theme-single-listing', run: ['node', 'scripts/check/theme/single-listing/index.mjs'], blocking: true, phase: 'pre-build', drillId: 'theme-single-listing-drill', },
  { id: 'theme-decision-schema-drill', run: ['node', '--test', 'scripts/generate/theme/schema/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['theme-decision-schema'], },
  { id: 'theme-decision-schema', run: ['node', 'scripts/generate/theme/schema/index.mjs', '--check'], blocking: true, phase: 'pre-build', drillId: 'theme-decision-schema-drill', },
  // WO-CAT-04. Two laws over the reusable-style contract, each with its drill.
  //
  // `theme-document-version` is the transport's retirement check: v3 is the
  // version a row is WRITTEN in and v2 is one it is READ in forever, so the
  // gate refuses a v2 literal in a WRITE position while keeping the migrate
  // chain's own literal legal -- and its drill plants both halves, because a
  // gate that refused every v2 literal would refuse the read path. It also
  // asserts the version fork is still called from `admitDocument`: deleting
  // that one line leaves every type correct and returns two public doors to a
  // bare TypeError that names neither the version nor the door.
  //
  // `theme-style-registry` holds a published style to the partition it may
  // author, the floor it must clear and the envelope of every vertical it
  // declares. The envelope half lives HERE rather than in the contract for a
  // structural reason: `contracts/theme/runtime/envelopes` is the style
  // owner's unranked peer, so a production edge to it is sibling debt.
  { id: 'theme-document-version-drill', run: ['node', '--test', 'scripts/check/theme/document-version/tests/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['theme-document-version'], },
  { id: 'theme-document-version', run: ['node', 'scripts/check/theme/document-version/index.mjs'], blocking: true, phase: 'pre-build', drillId: 'theme-document-version-drill', },
  { id: 'theme-style-registry-drill', run: ['node', '--test', 'scripts/check/theme/style-registry/tests/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['theme-style-registry'], },
  { id: 'theme-style-registry', run: ['node', 'scripts/check/theme/style-registry/index.mjs'], blocking: true, phase: 'pre-build', drillId: 'theme-style-registry-drill', },
  // The DRILL is blocking and green; the GATE is registered non-blocking with a
  // written reason because it cannot pass before the derivation lane exists.
  // That is the sanctioned shape, and the only alternative -- leaving the law
  // unregistered, or letting it report PASS on a partition nobody owns -- is
  // the fail-open this manifest exists to make unrepresentable. The drill is
  // what stops the measurement from rotting while the gate waits. Both legs
  // moved to post-build in D6-2c-ii: the universe is the COMPOSED first-party
  // baselines, read through the compiled door under a freshness proof, because
  // the authored `.ts` themes they used to read are retired.
  {
    id: 'theme-keypath-coverage-drill',
    run: ['node', '--test', 'scripts/check/theme/keypath-coverage/index.test.mjs'],
    blocking: true,
    phase: 'post-build',
    drillFor: ['theme-keypath-coverage'],
    prerequisites: ['fresh-dist'],
  },
  {
    id: 'theme-keypath-coverage',
    run: ['node', 'scripts/check/theme/keypath-coverage/index.mjs'],
    blocking: false,
    excluded: {
      reason: 'The three sets can only be total once a family derivator owns the subtrees no decision authors: the derived set is EMPTY by construction until the derivation lane lands, so the gate is RED by design, not by defect. It is registered here rather than left out so the debt is visible in the matrix, and its drill stays BLOCKING so the measurement cannot silently stop measuring. It flips to blocking in the lane that fills DERIVED_PREFIXES. D6-2c-ii moved the universe with its subject: the authored first-party themes are retired, so it now measures the composed baselines (neutral foundation + preset through the compile door), which is 59 keypaths with 6 uncovered instead of 2531 with 2501 uncovered. The uncovered set is now specific and readable -- two typography leaves a pairing deriver must own, three envelope schemaVersion leaves, and expressive.profiles.icon, which the catalog row lists in its `keys` but omits from its `keypath.brandTheme` -- and the capability the 2501 represented is registered as the derivation lane obligation in WO-DER-06, not carried as a counter here.',
      owner: 'derivation lane (WO-DER-*), roadmap/registry.json',
      trackedSince: '2026-09-07',
    },
    phase: 'post-build',
    drillId: 'theme-keypath-coverage-drill',
    prerequisites: ['fresh-dist'],
  },
  // The foundation's own colour declarations, projected into TypeScript so the
  // admission contrast floor can resolve a reference the CASCADE resolves. The
  // stylesheet is the source and the module is its projection, so the only
  // thing that can go wrong is the two disagreeing -- which is exactly what
  // `--check` measures. A hand-written second table is the defect class this
  // pair exists to make unnecessary.
  { id: 'foundation-defaults-drill', run: ['node', '--test', 'scripts/generate/tokens/foundation-defaults/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['foundation-defaults-freshness'], },
  { id: 'foundation-defaults-freshness', run: ['node', 'scripts/generate/tokens/foundation-defaults/index.mjs', '--check'], blocking: true, phase: 'pre-build', drillId: 'foundation-defaults-drill', },
  { id: 'customization-controls-drill', run: ['node', '--test', 'scripts/generate/theme/controls-doc/index.test.mjs'], blocking: true, phase: 'pre-build', drillFor: ['customization-controls-freshness'], },
  { id: 'customization-controls-freshness', run: ['node', 'scripts/generate/theme/controls-doc/index.mjs', '--check'], blocking: true, phase: 'pre-build', drillId: 'customization-controls-drill', },

  // MOVED OUT OF PRE-BUILD (2026-09-08, WO-CAN-02 amendment J.23; corrected
  // 2026-09-08 after the lot review measured the claim below).
  //
  // These EIGHT entries were declared `pre-build`. Measured by moving
  // `packages/core/dist` away and running each one:
  //
  //   SIX exit 1. `tenant-channel-consumer` and its `--modern-check` twin on a
  //   missing compiled contract; `app-ds-boundary` on a missing
  //   `dist/bithire.css`; `app-ds-boundary-drill` on seven of nine cases, whose
  //   fixture IS that stylesheet and the app corpus; `gate-honesty-drill` on
  //   the gate that walks every exported build target; and
  //   `modern-bundle-framework-drill` on ONE assertion of its own.
  //
  //   TWO exit 0, and neither one is the measurement its entry exists to make.
  //   `modern-bundle-framework` audits the five COMMITTED mirrors and skips the
  //   five `dist/` publish targets in silence -- the bytes a consumer installs
  //   are exactly what it is positioned to certify -- so what a dist-less run
  //   of that pair reports is its drill's count assertion (`audited >= 6`,
  //   which gets 5), not a missing output. `tenant-channel-consumer-drill`
  //   reports 21 green assertions with the only case that RUNS the gate
  //   self-skipped for the reason it prints: "dist is not built".
  //
  // Of the eight, `validateManifest()` reports FOUR: the three tenant-channel
  // entries and `app-ds-boundary`, whose dependency is a filesystem read or a
  // dynamic import through a path variable rather than an import specifier --
  // the shapes `dist-reachability` now follows, and the ones the old walk saw
  // none of. The other four need a build for reasons no static walk sees: a
  // count assertion, a self-skipping case, a fixture that is the built
  // stylesheet, and a spawned command named through a variable. Running them
  // without `dist/` is what found those, and it is the evidence recorded here.
  //
  // They are not deleted and not baselined: they run in the phase whose input
  // they need, after the build step of `.github/workflows/ci.yml`, with the
  // prerequisite declared so a run without one says PREREQ-MISSING and names it.
  { id: 'modern-bundle-framework-drill', run: ['node', '--test', 'scripts/check/engine/lifecycle/framework-bundle/index.test.mjs'], blocking: true, phase: 'post-build', drillFor: ['modern-bundle-framework'], prerequisites: ['fresh-dist'], },
  { id: 'modern-bundle-framework', run: ['node', 'scripts/check/engine/lifecycle/framework-bundle/index.mjs'], blocking: true, phase: 'post-build', drillId: 'modern-bundle-framework-drill', prerequisites: ['fresh-dist'], },
  { id: 'tenant-channel-consumer-drill', run: ['node', '--test', 'scripts/check/tokens/cascade/channels/consumers/index.test.mjs'], blocking: true, phase: 'post-build', drillFor: ['tenant-channel-consumer', 'tenant-channel-consumer-modern'], prerequisites: ['fresh-dist'], },
  { id: 'tenant-channel-consumer', run: ['node', 'scripts/check/tokens/cascade/channels/consumers/index.mjs', '--check'], blocking: true, phase: 'post-build', drillId: 'tenant-channel-consumer-drill', prerequisites: ['fresh-dist'], ratchet: 'scripts/check/tokens/cascade/channels/consumers/baselines/all-engines/index.json', },
  { id: 'tenant-channel-consumer-modern', run: ['node', 'scripts/check/tokens/cascade/channels/consumers/index.mjs', '--modern-check'], blocking: true, phase: 'post-build', drillId: 'tenant-channel-consumer-drill', prerequisites: ['fresh-dist'], ratchet: 'scripts/check/tokens/cascade/channels/consumers/baselines/modern/index.json', },
  { id: 'app-ds-boundary-drill', run: ['node', '--test', 'scripts/check/boundaries/applications/styles/index.test.mjs'], blocking: true, phase: 'post-build', drillFor: ['app-ds-boundary'], prerequisites: ['fresh-dist', 'app-bithire-corpus'], },
  { id: 'app-ds-boundary', run: ['node', 'scripts/check/boundaries/applications/styles/index.mjs', '--check'], blocking: true, phase: 'post-build', drillId: 'app-ds-boundary-drill', prerequisites: ['fresh-dist', 'app-bithire-corpus'], ratchet: 'scripts/check/boundaries/applications/styles/baseline/index.json', },
  {
    id: 'gate-honesty-drill',
    run: ['node', '--test', 'scripts/check/automation/gates/honesty/index.test.mjs'],
    blocking: true,
    phase: 'post-build',
    prerequisites: ['fresh-dist'],
    noDrillReason:
      'This entry IS the drill for the three F0 honesty gates; a drill of a drill has no separate subject. It runs post-build because one of the three gates it drills walks every exported build target, which a clean checkout does not have.',
  },

  // The prepack chain, which `npm pack` fires and CI never did.
  { id: 'dist-freshness', run: ['pnpm', 'run', 'distfresh:check'], blocking: true, phase: 'post-build', drillId: 'dist-freshness-drill', prerequisites: ['fresh-dist'], },
  { id: 'pack-inventory', run: ['pnpm', 'run', 'packinv:check'], blocking: true, phase: 'post-build', drillId: 'pack-inventory-drill', prerequisites: ['fresh-dist'], ratchet: 'scripts/package/artifacts/inventory/baseline/index.json', },
  { id: 'icon-embed-drill', run: ['node', '--test', 'scripts/package/graphics/icons/index.test.mjs'], blocking: true, phase: 'post-build', drillFor: ['icon-embed-inventory'], prerequisites: ['fresh-dist'], },
  { id: 'icon-embed-inventory', run: ['pnpm', 'run', 'iconembed:check'], blocking: true, phase: 'post-build', drillId: 'icon-embed-drill', prerequisites: ['fresh-dist'], ratchet: 'scripts/package/graphics/icons/baseline/index.json', },
  { id: 'public-declarations-drill', run: ['node', '--test', 'scripts/package/public-api/declarations/index.test.mjs'], blocking: true, phase: 'post-build', drillFor: ['public-declarations'], prerequisites: ['fresh-dist'], },
  { id: 'public-declarations', run: ['pnpm', 'run', 'public-declarations:check'], blocking: true, phase: 'post-build', drillId: 'public-declarations-drill', prerequisites: ['fresh-dist'], },
  { id: 'public-barrel', run: ['pnpm', 'run', 'public-barrel:check'], blocking: true, phase: 'post-build',
    noDrillReason:
      'TRACKED DEBT, not a justification: the barrel scan has no planted negative on disk. Owner: WO-CAT-03 (public surface), which owns the barrel law and can drill it there.',
    prerequisites: ['fresh-dist'], },
  { id: 'exports-artifact', run: ['pnpm', 'run', 'exports:artifact:check'], blocking: true, phase: 'post-build',
    noDrillReason:
      'TRACKED DEBT, not a justification: the export-map artifact check has no planted negative on disk. Owner: WO-CAT-03 (public surface).',
    prerequisites: ['fresh-dist'], },
  { id: 'runtime-hardening-drill', run: ['node', '--test', 'scripts/check/evidence/certification/runtime-hardening/index.test.mjs'], blocking: true, phase: 'post-build', drillFor: ['runtime-hardening-structural'], prerequisites: ['fresh-dist'], },
  { id: 'runtime-hardening-structural', run: ['pnpm', 'run', 'runtime-hardening:structural'], blocking: true, phase: 'post-build', drillId: 'runtime-hardening-drill', prerequisites: ['fresh-dist'], },

  // F-107: the showroom's node-only diagnostics were a HAND-WRITTEN list of
  // eleven files in `packages/showroom/package.json`, and the list omitted
  // `torture-scene-registry.unit.test.mjs` -- a real suite that therefore ran
  // in no job at all. The script is a glob now, and the run is here rather
  // than as a lone YAML step so the inventory is one.
  { id: 'showroom-diagnostics', run: ['pnpm', '--filter', '@rottay/showroom', 'run', 'test:diagnostics'], blocking: true, phase: 'post-build',
    noDrillReason:
      'This entry IS a suite set: eleven-plus node-only diagnostics over the showroom registries and the skin-rule corpus, each with its own assertions. The glob is what makes the set complete; `wiring-coverage` is what proves the glob names real files.',
    prerequisites: ['showroom-workspace'], },

  // The milestone A exit gate: an application that builds. The static legs prove
  // the fixture is admissible, `packed` compiles it against the `npm pack`
  // tarball with no source alias, and the last one runs it. `published` and
  // `packed` read the export map, the BUILT modules and the emitted
  // declarations, which is why this pair is post-build.
  { id: 'consumer-proof-drill', run: ['node', '--test', 'scripts/check/consumer-proof/tests/index.test.mjs'], blocking: true, phase: 'post-build', drillFor: ['consumer-proof'], prerequisites: ['fresh-dist'], },
  { id: 'consumer-proof', run: ['node', 'scripts/check/consumer-proof/index.mjs'], blocking: true, phase: 'post-build', drillId: 'consumer-proof-drill', prerequisites: ['fresh-dist'], },
]);

/**
 * Gates this inventory has RETIRED, with the reason and the instrument that
 * answers the question instead.
 *
 * A gate that simply disappears from `CI_GATES` leaves no trace: the next
 * reader finds a generator nobody runs and re-registers it. Worse, the entries
 * below were not merely unused -- they were measuring the wrong thing or the
 * unmeetable thing and reporting green or permanent red, which is the failure
 * class this whole file exists against. So a retirement is recorded, named
 * and validated: an id may not be in both lists, and every entry must say
 * what replaced it.
 *
 * The GENERATORS themselves live under `scripts/generate/tokens/manifest/**`
 * and are not deleted here; deleting them is a separate write set. What is
 * settled here is the only thing that made them law -- their place in the
 * inventory CI runs.
 */
export const RETIRED_GATES = Object.freeze([
  {
    id: 'variant-parity',
    drills: ['variant-parity-drill'],
    retiredOn: '2026-09-11',
    reason:
      'F-54: it measured PLACEHOLDERS, not parity. Its baseline accepted 3,943 placeholder pairs -- 52 % of the '
      + 'pair universe -- as the passing state, so three themes that share 12 % of their authored leaves read green. '
      + 'Parity between the three artifacts is a property of the DERIVATION, not of a docblock tag census.',
    replacedBy:
      'scripts/check/theme/artifact-coverage (per-family coverage of the compiled artifacts, measured from the '
      + 'typed catalog) and the per-family derivation cuts.',
    producerRemoved:
      'D6-2c-ii (2026-09-15): the producer itself is deleted, not just de-registered. Its universe was the '
      + 'docblock tags of the three authored `.ts` themes, and those themes are retired -- a first-party '
      + 'vertical is the neutral foundation plus its preset document, and a JSON carries no docblocks. The '
      + 'slot inventory, its only importer, retired the domicile dimension in the same lot.',
  },
  {
    id: 'mirror-parity-freshness',
    drills: ['cascade-coverage-ownership-drill'],
    retiredOn: '2026-09-11',
    reason:
      'F-54/F-04: the compiled mirror it froze is a generated view, and its agreement with the source was proof '
      + 'that one generator had been run, never that a decision reaches a family.',
    producerRemoved:
      'D6-2c-ii (2026-09-15): the producer itself is deleted. Its `sourceSkeleton` half read the three authored '
      + '`.ts` themes, which are retired; the other half froze a generated artifact nothing reads, and its only '
      + 'importer was variant-parity, deleted in the same lot. `root-checklists` keeps its own producer and is '
      + 'left in place: it now has no importer either, which is registered as follow-up rather than settled here.',
    replacedBy:
      'scripts/check/theme/artifact-coverage, which reads the same compiled artifacts and asks the causal question '
      + 'instead: which families does each catalog decision actually cover.',
  },
  {
    id: 'root-checklists-freshness',
    drills: ['root-checklists-clean-checkout-drill'],
    retiredOn: '2026-09-11',
    reason:
      'F-04/F-23: a checklist regenerated from the tree it describes agrees with itself by construction. It was '
      + 'text presence, which this lane may not accept as ground truth.',
    replacedBy:
      'scripts/check/engine/read-without-producer (a read with no producer is the real defect the checklist '
      + 'gestured at) and scripts/check/theme/artifact-coverage.',
  },
  {
    id: 'modern-rescue-customization-manifest-freshness',
    drills: ['manifest-generator-drill'],
    retiredOn: '2026-09-19',
    reason:
      'WO-RET-03 (D-05/D-08): the manifest corpus it kept fresh was quarantined to '
      + 'docs/history/inventories/customization-manifest as sealed evidence, and 11 of its retired-family '
      + 'bindings (callout, message, notification, toast, auto-complete, switch, collapse, modal, steps, '
      + 'tooltip, button, plus the notifier inventory row) can never resolve again -- the gate was unmeetable '
      + 'by construction and measured 361 permanent FAILs. A freshness gate over a sealed archive is a '
      + 'contradiction, not a measurement.',
    replacedBy:
      'the typed catalog (src/contracts/theme/runtime/catalog, enforced by scripts/check/theme/single-listing) '
      + 'is the live control listing; the quarantined corpus is read as evidence only, never as authority.',
    producerRemoved:
      'WO-RET-03 (2026-09-19): the producer itself is deleted with the lot. '
      + 'scripts/generate/tokens/manifest/generation/ (the writer and its --check freshness, '
      + 'validateCustomizationManifest and certifyCustomizationManifest) had no live productive consumer: its '
      + 'corpus was retired-listing evidence, its deep gate was already failing on the same 11 bindings inside '
      + 'the T-1 constitution check (which keeps its own direct schema/cascade/denominator measurements and '
      + 'loses only the dead noise), and the two function importers were rewired '
      + '(activePublicControls is three lines over parseRegistry in the superseded-ingress-key drill).',
  },
]);

const MANIFEST_PACKAGE_ROOT = findPackageRoot(dirname(fileURLToPath(import.meta.url)));

/** The two phases of the run, in order. */
export const PHASES = Object.freeze(['pre-build', 'post-build']);

/**
 * The inputs a gate may declare that CI must provide, each with a probe that
 * answers whether it is present RIGHT NOW.
 *
 * WHY THIS IS A CLOSED REGISTRY. A missing input and a broken law both come
 * back as exit 1, and a runner that cannot tell them apart teaches the reader
 * to ignore both. A prerequisite is therefore declared by name against a probe
 * this file owns, so `PREREQ-MISSING` is a measurement rather than a guess.
 * An unknown name is a malformed manifest, not a silently-skipped gate.
 */
export const PREREQUISITES = Object.freeze({
  'fresh-dist': {
    describe: 'packages/core/dist built from the current source (pnpm -C packages/core build)',
    satisfied: () => existsSync(join(MANIFEST_PACKAGE_ROOT, 'dist/build-stamp.json')),
  },
  'app-bithire-corpus': {
    describe: 'the app-bithire checkout the app<->DS boundary gate audits (APP_BITHIRE_ROOT, or a sibling repository)',
    satisfied: () => existsSync(process.env.APP_BITHIRE_ROOT ?? join(MANIFEST_PACKAGE_ROOT, '../../../app-bithire')),
  },
  'playwright-chromium': {
    describe:
      'a Playwright Chromium the workspace can resolve (pnpm --filter @rottay/showroom exec playwright '
      + 'install chromium). Computed-style evidence cannot be produced without one.',
    satisfied: () => {
      try {
        const require = createRequire(join(MANIFEST_PACKAGE_ROOT, '../showroom/package.json'));
        return Boolean(require('@playwright/test')?.chromium);
      } catch {
        return false;
      }
    },
  },
  'showroom-workspace': {
    describe: 'the @rottay/showroom workspace package',
    satisfied: () => existsSync(join(MANIFEST_PACKAGE_ROOT, '../showroom/package.json')),
  },
  'docs-engineering-corpus': {
    describe:
      'the sealed docs-engineering checkout the claim-exactness proof reads '
      + '(DOCS_ENGINEERING_ROOT, or a sibling repository) at the revision in '
      + 'scripts/check/evidence/certification/claims/exactness/documentation-seal/index.json',
    satisfied: () => existsSync(
      process.env.DOCS_ENGINEERING_ROOT ?? join(MANIFEST_PACKAGE_ROOT, '../../../docs-engineering'),
    ),
  },
});

/**
 * The module paths a gate's argv hands to `node`, and nothing else. A flag
 * value (`--repositories ui-design-system`) is a bare word, and a `pnpm run`
 * alias resolves through package.json rather than through the filesystem, so
 * neither is a script target here. The narrow shape is deliberate: this
 * predicate decides what MUST exist, so a loose one would report a phantom.
 */
export function manifestScriptTargets(run) {
  if (!Array.isArray(run) || run[0] !== 'node') return [];
  return run
    .slice(1)
    .filter((arg) => !arg.startsWith('--') && /\.(mjs|cjs|js|mts|cts)$/.test(arg));
}

/**
 * Every file a gate's argv makes node execute, including the ones behind a
 * `pnpm run` alias and the suites behind `pnpm exec vitest run <path>`. Wider
 * than `manifestScriptTargets` on purpose: that one answers "what must exist",
 * this one answers "what does this gate load", which is what the pre-build
 * `dist/` law has to walk.
 */
export function manifestEntryModules(run, packageRoot = MANIFEST_PACKAGE_ROOT) {
  if (!Array.isArray(run) || run.length === 0) return [];
  if (run[0] === 'node') return manifestScriptTargets(run);
  if (run[0] === 'pnpm' && run[1] === 'run') {
    let scripts;
    try {
      scripts = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8')).scripts ?? {};
    } catch {
      return [];
    }
    const command = scripts[run[2]];
    if (!command) return [];
    return [...command.matchAll(/(?:\.\.\/\.\.\/)?scripts\/[\w./-]+\.mjs/g)].map((match) => match[0]);
  }
  if (run[0] === 'pnpm' && run[1] === 'exec' && run[2] === 'vitest') {
    return run.slice(3).filter((arg) => !arg.startsWith('--') && arg !== 'run');
  }
  return [];
}

/** Gates the runner will actually enforce. */
export function blockingGates(phase) {
  return CI_GATES.filter((gate) => gate.blocking && (phase === undefined || gate.phase === phase));
}

/** Every entry of a phase, blocking or excluded. */
export function gatesForPhase(phase) {
  return CI_GATES.filter((gate) => gate.phase === phase);
}

/** The prerequisite ids of a gate that are NOT satisfied right now. */
export function missingPrerequisites(gate) {
  return (gate.prerequisites ?? []).filter((id) => {
    const prerequisite = PREREQUISITES[id];
    return prerequisite ? !prerequisite.satisfied() : true;
  });
}

/**
 * Structural validation of the manifest itself. Called by the runner and by the
 * drill, so a malformed entry cannot reach CI.
 */
/**
 * What a clean `validateManifest()` does and does NOT prove, in one sentence
 * the runner prints, so a green structural check is never read as a green run.
 */
export const MANIFEST_VALIDATION_SCOPE =
  'structural only: ids, phases, drills, prerequisites, script existence, and the three ways a pre-build entry '
  + 'can reach dist/ (import, filesystem read of a dist path, command it spawns). It does not execute a gate, so a '
  + 'pre-build entry that needs a built input through a path this walk cannot follow is caught by the run, not here.';

export function validateManifest(gates = CI_GATES, { packageRoot = MANIFEST_PACKAGE_ROOT } = {}) {
  const problems = [];
  const seen = new Set();
  const drillTargets = new Set();
  for (const gate of gates) {
    if (!gate.id) problems.push('a gate has no id');
    if (seen.has(gate.id)) problems.push(`duplicate gate id: ${gate.id}`);
    seen.add(gate.id);
    if (!Array.isArray(gate.run) || gate.run.length === 0) {
      problems.push(`${gate.id}: run must be a non-empty argv array`);
    }
    if (typeof gate.blocking !== 'boolean') problems.push(`${gate.id}: blocking must be a boolean`);
    if (!PHASES.includes(gate.phase)) {
      problems.push(`${gate.id}: phase must be one of ${PHASES.join(' | ')}; got ${gate.phase}`);
    }
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

    // DRILL FIRST, MADE MECHANICAL. Five gates carried no drill at all and
    // fifteen real drills existed on disk without a manifest entry, so the law
    // "a gate that cannot be seen failing is not evidence" was applied from
    // memory. Every entry now declares exactly one of: the drill that proves it
    // can go red (`drillId`), the gates it is itself the drill for
    // (`drillFor`), or a written reason (`noDrillReason`). Two of the three is
    // as malformed as none: it hides which claim the entry is making.
    const declarations = ['drillId', 'drillFor', 'noDrillReason'].filter((key) => gate[key] !== undefined);
    if (declarations.length === 0) {
      problems.push(`${gate.id}: must declare drillId, drillFor or noDrillReason`);
    } else if (declarations.length > 1) {
      problems.push(`${gate.id}: declares ${declarations.join(' and ')}; exactly one is allowed`);
    }
    if (gate.noDrillReason !== undefined
      && (typeof gate.noDrillReason !== 'string' || gate.noDrillReason.trim().length < 40)) {
      problems.push(`${gate.id}: noDrillReason must be a written sentence, not a placeholder`);
    }
    if (gate.drillFor !== undefined) {
      if (!Array.isArray(gate.drillFor) || gate.drillFor.length === 0) {
        problems.push(`${gate.id}: drillFor must be a non-empty array of gate ids`);
      } else {
        for (const target of gate.drillFor) drillTargets.add(`${target} ${gate.id}`);
      }
    }

    for (const id of gate.prerequisites ?? []) {
      if (!Object.hasOwn(PREREQUISITES, id)) problems.push(`${gate.id}: unknown prerequisite: ${id}`);
    }

    // PHASE HONESTY. `gates:ci` is consumed by `pretest` and by the CI step
    // that runs BEFORE the build. A pre-build entry that loads `dist/` cannot
    // pass on a clean checkout, and a gate that is red for a missing input is
    // a gate somebody downgrades.
    if (gate.phase === 'pre-build') {
      if ((gate.prerequisites ?? []).includes('fresh-dist')) {
        problems.push(`${gate.id}: a pre-build gate must not require a built dist/ (declare phase: 'post-build')`);
      }
      // Three shapes, not one: an import specifier, a filesystem read of a
      // `dist/` path however the path was built, and a child command followed
      // into its own graph. `validateManifest()` reported no problem for four
      // pre-build entries that reached `dist/` through the second shape --
      // three read a compiled contract through a path variable, one reads
      // `dist/bithire.css` -- because it only ever read the first (2026-09-08,
      // rubric J.23). A walk is not the whole answer either: four more entries
      // of that move need a build for reasons only running them reports.
      const reached = distReachableFrom(packageRoot, manifestEntryModules(gate.run, packageRoot));
      if (reached.length === 0 && gate.distExemption !== undefined) {
        problems.push(`${gate.id}: carries a distExemption and reaches no dist/ output; remove the exemption`);
      } else if (reached.length > 0 && gate.distExemption === undefined) {
        for (const hit of reached.slice(0, 3)) {
          problems.push(
            `${gate.id}: pre-build gate reaches dist/ through ${hit.file} -> ${hit.specifier} (${hit.kind}); `
            + "move it to phase: 'post-build' with prerequisites: ['fresh-dist'], or state a measured distExemption",
          );
        }
      }
    } else if (gate.distExemption !== undefined) {
      problems.push(`${gate.id}: distExemption belongs to a pre-build entry; this one is ${gate.phase}`);
    }
    if (gate.distExemption !== undefined
      && (typeof gate.distExemption !== 'string' || gate.distExemption.trim().length < 40)) {
      problems.push(`${gate.id}: distExemption must be a written, measured sentence, not a placeholder`);
    }

    // EXISTENCE. Eight gates spent a whole refactor pointing at scripts the
    // relocation had deleted, and only ONE of them was ever observed, because
    // the runner is fail-fast and dies at the first. `MODULE_NOT_FOUND` is not
    // a gate verdict: a manifest that names a script the tree does not carry is
    // malformed, and the runner refuses it before running anything.
    for (const script of manifestScriptTargets(gate.run)) {
      if (!existsSync(join(packageRoot, script))) {
        problems.push(`${gate.id}: names a script that does not exist: ${script}`);
      }
    }
  }

  // A RETIRED gate may not come back by accident, and a retirement may not be
  // a placeholder. Both halves are structural: an id in both lists is the
  // contradiction, and an entry without a written reason and a named successor
  // is a deletion wearing a ledger's clothes.
  const retiredIds = new Set();
  for (const entry of RETIRED_GATES) {
    if (!entry.id) problems.push('a retired-gate entry has no id');
    if (retiredIds.has(entry.id)) problems.push(`duplicate retired gate id: ${entry.id}`);
    retiredIds.add(entry.id);
    for (const key of ['reason', 'replacedBy', 'retiredOn']) {
      if (typeof entry[key] !== 'string' || entry[key].trim().length < 10) {
        problems.push(`retired ${entry.id}: ${key} must be a written value, not a placeholder`);
      }
    }
    for (const id of [entry.id, ...(entry.drills ?? [])]) {
      if (seen.has(id)) problems.push(`${id}: listed as retired and still registered in CI_GATES`);
    }
  }

  // A pointer is only evidence if it resolves BOTH ways: the named drill must
  // exist and must name this gate back. A one-way `drillId` is a decorative
  // reference, which is the class of defect this whole file exists against.
  for (const gate of gates) {
    if (gate.drillId !== undefined) {
      if (!seen.has(gate.drillId)) {
        problems.push(`${gate.id}: drillId names no manifest entry: ${gate.drillId}`);
      } else if (!drillTargets.has(`${gate.id} ${gate.drillId}`)) {
        problems.push(`${gate.id}: ${gate.drillId} does not declare drillFor: ['${gate.id}']`);
      }
    }
    for (const target of gate.drillFor ?? []) {
      if (!seen.has(target)) problems.push(`${gate.id}: drillFor names no manifest entry: ${target}`);
    }
  }
  return problems;
}
