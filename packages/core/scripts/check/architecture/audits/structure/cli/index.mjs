/**
 * The structure gate's command line: --check, --report, the two baseline
 * producers (--update-baseline tightens; --re-anchor is the sighted adoption)
 * and the rename door (--relocate --map <file.json>; dry run unless --write).
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';

import { auditCoreStructure, compareStructureBaseline, parseCliArguments } from '../index.mjs';
import { STRUCTURE_LAWS, compareStructureLaws, listTrackedFiles, measureStructureLaws } from '../laws/index.mjs';
import { gitTrees, relocateStructureBaseline } from '../relocate/index.mjs';
import { reanchorStructureBaseline, tightenStructureBaseline } from '../tighten/index.mjs';

function printSummary(result, laws) {
  const { inventory } = result;
  console.log([
    'core-structure-audit',
    `files=${inventory.totalFiles}`,
    `source=${inventory.sourceFiles}`,
    `authored-leaves=${inventory.authoredLeafModules}`,
    `indexes=${inventory.productionIndexes}`,
    `barrels=${inventory.barrels}`,
    `findings=${result.findings.length}`,
  ].join(' | '));
  for (const [rule, count] of Object.entries(inventory.findingsByRule)) {
    console.log(`  ${rule}: ${count}`);
  }
  console.log(`structure-laws | ${STRUCTURE_LAWS.map((law) => `${law}=${laws.members[law].length}`).join(' | ')}`);
  const { informational, definitions } = laws;
  console.log(`  definitions: line-count >${definitions['authored-line-count'].limit} in ${definitions['authored-line-count'].scope}; repeated-path-word ${definitions['repeated-path-word'].definition}`);
  console.log(`  line-count by scope: ${JSON.stringify(informational.lineCountByScope)}; split ${JSON.stringify(informational.lineCountSplit)}`);
  console.log(`  repeated-path-word by definition: ${JSON.stringify(informational.repeatedPathWordByDefinition)}`);
  console.log(`  generated-banner exempt (not charged by the line-count law): ${informational.generatedBannerExempt}`);
  if (informational.registeredWorktreeEmptyDirectoriesPresent.length > 0) {
    console.log(`  registered worktree-only empty folders present: ${informational.registeredWorktreeEmptyDirectoriesPresent.join(', ')}`);
  }
}

function readBaseline(path) {
  if (!existsSync(path)) throw new Error(`missing core structure baseline: ${path}`);
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeProduced(path, produced, label) {
  if (produced.refused.length > 0) {
    console.error(`core-structure-audit: ${label} refused; nothing written:`);
    for (const reason of produced.refused) console.error(`  - ${reason}`);
    process.exitCode = 1;
    return false;
  }
  writeFileSync(path, `${JSON.stringify(produced.baseline, null, 2)}\n`);
  console.log(`baseline written (${label}): ${path}`);
  return true;
}

function runRelocate({ options, result, laws, baseline }) {
  if (!options.mapPath) {
    console.error('core-structure-audit: --relocate needs --map <file.json> ({ "<old repo path>": "<new repo path>" })');
    process.exitCode = 1;
    return;
  }
  const { before, after } = gitTrees({ repoRoot: options.repoRoot, rev: options.fromRev, liveFiles: listTrackedFiles(options.repoRoot) });
  const produced = relocateStructureBaseline({
    baseline,
    mapText: readFileSync(options.mapPath, 'utf8'),
    result,
    laws,
    before,
    after,
    specifierEdits: options.specifierEdits,
  });
  if (produced.noop) {
    console.log('relocate: empty map; nothing to re-key, nothing written');
    return;
  }
  for (const entry of produced.content) console.log(`  ${entry.status}: ${entry.from} -> ${entry.to}`);
  if (produced.refused.length === 0) {
    console.log(`relocate: ${produced.rekeyed.length} key(s) re-keyed from ${produced.content.length} map entr(ies) against ${options.fromRev}`);
    for (const move of produced.rekeyed) console.log(`  ${move.class}: ${move.from} -> ${move.to}`);
    for (const stale of produced.staleUntouched) console.log(`  stale pin untouched by the map (tighten after): ${stale}`);
    if (!options.write) {
      console.log('relocate: dry run; pass --write after reviewing the re-keyed keys');
      return;
    }
  }
  writeProduced(options.baselinePath, produced, 'relocate');
}

export function runStructureCli(argv = process.argv.slice(2)) {
  if (argv.includes('--write-baseline')) {
    console.error('core-structure-audit: --write-baseline is retired; the baseline is decrease-only. Use --update-baseline (tighten) or, for an unpinned law or a ruled definition change, --re-anchor (sighted).');
    process.exitCode = 1;
    return;
  }
  const options = parseCliArguments(argv);
  const result = auditCoreStructure(options);
  const laws = measureStructureLaws({ repoRoot: options.repoRoot });
  printSummary(result, laws);

  if (options.mode === 'report') {
    if (options.json) console.log(JSON.stringify({ ...result, laws }, null, 2));
    else {
      const limit = Number.isFinite(options.details) ? Math.max(0, options.details) : 20;
      for (const entry of result.findings.slice(0, limit)) console.log(`  [${entry.rule}] ${entry.path} — ${entry.message}`);
    }
    return;
  }

  const baseline = readBaseline(options.baselinePath);
  if (options.mode === 'update-baseline') {
    const produced = tightenStructureBaseline({ result, laws, baseline });
    if (writeProduced(options.baselinePath, produced, 'tighten')) {
      const lawsRemoved = Object.entries(produced.removed.laws).filter(([, members]) => members.length > 0);
      console.log(`  removed: ${produced.removed.findings.length} finding(s); ${lawsRemoved.map(([law, members]) => `${law} -${members.length}`).join(', ') || 'no law pin'}`);
    }
    return;
  }
  if (options.mode === 'relocate') {
    runRelocate({ options, result, laws, baseline });
    return;
  }
  if (options.mode === 're-anchor') {
    const produced = reanchorStructureBaseline({ result, laws, baseline });
    if (writeProduced(options.baselinePath, produced, 're-anchor')) {
      console.log(`  inventory: ${JSON.stringify(produced.previous.inventory?.totalFiles ?? null)} -> ${result.inventory.totalFiles} files`);
      console.log(`  re-keyed (unpinned or definition changed): ${produced.rekeyed.map((law) => `${law}=${laws.members[law].length}`).join(', ')}`);
      console.log(`  tightened (definition unchanged): ${STRUCTURE_LAWS.filter((law) => !produced.rekeyed.includes(law)).join(', ') || 'none'}`);
    }
    return;
  }

  const findings = compareStructureBaseline(result, baseline);
  const lawComparison = compareStructureLaws(laws, baseline.laws);
  if (findings.added.length > 0) {
    console.error(`core-structure-audit: ${findings.added.length} new finding(s):`);
    for (const id of findings.added.slice(0, options.details)) console.error(`  + ${id}`);
    process.exitCode = 1;
  }
  if (!lawComparison.passed) {
    console.error('core-structure-audit: structure laws off their pins:');
    for (const problem of lawComparison.problems) console.error(`  - ${problem}`);
    process.exitCode = 1;
  }
  if (process.exitCode === 1) return;
  if (findings.resolved.length > 0) {
    console.log(`ratchet opportunity: ${findings.resolved.length} finding(s) resolved; tighten with --update-baseline.`);
  }
  console.log('core-structure-audit: passed (no new structural debt; every structure law at its pin).');
}
