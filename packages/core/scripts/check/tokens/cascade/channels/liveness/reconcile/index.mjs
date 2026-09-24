#!/usr/bin/env node
/**
 * channel-liveness --reconcile: the source universe against a real compile of the first-party verticals, post-build.
 * Kept apart from the source gate so no pre-build row that imports the gate reaches dist/.
 *
 * Usage: node scripts/check/tokens/cascade/channels/liveness/reconcile/index.mjs
 */

import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { CORE_ROOT, collectFamilyRosters, reconcileCompiledEmission, runGate } from '../index.mjs';

/** The first-party compile of every vertical the build publishes, from the built door. */
export async function compileFirstPartyEmission(distRoot = CORE_ROOT) {
  const door = await import(pathToFileURL(resolve(distRoot, 'dist/server.js')).href);
  for (const name of ['compileThemeIntent', 'staticThemeIntent', 'FIRST_PARTY_VERTICAL_SLUGS']) {
    if (door[name] === undefined) throw new Error(`channel-liveness --reconcile: dist/server.js exports no ${name}; build first`);
  }
  const compiled = new Map();
  for (const vertical of door.FIRST_PARTY_VERTICAL_SLUGS) {
    const { compiled: output } = door.compileThemeIntent(door.staticThemeIntent(vertical));
    const names = new Set(Object.keys(output.cssVariables));
    for (const block of output.modeBlocks ?? []) for (const name of Object.keys(block.cssVariables ?? {})) names.add(name);
    compiled.set(vertical, names);
  }
  return compiled;
}

const groupNames = (rows, keyOf) => Object.entries(Object.groupBy(rows, keyOf))
  .map(([key, members]) => `    ${key} (${members.length}): ${members.map((row) => row.name).join(', ')}`);

async function main() {
  const started = Date.now();
  const { result } = runGate({ requireArtifact: false });
  const analysed = Date.now();
  const compiled = await compileFirstPartyEmission();
  const outcome = reconcileCompiledEmission({ channels: result.channels, compiled, rosters: collectFamilyRosters() });
  const lines = [
    `channel-liveness --reconcile: ${outcome.compiledNames} name(s) compiled for ${[...compiled.keys()].join(', ')}; universe ${result.channels.length}`,
    `  forward gap (compiled, absent from the universe): ${outcome.forward.length}, owned ${outcome.forward.filter((row) => row.owner).length}`,
    ...groupNames(outcome.forward, (row) => row.owner ?? 'UNOWNED'),
    `  reverse gap (universe emitted, no first-party compile produces it): ${outcome.reverse.length}`,
    ...groupNames(outcome.reverse, (row) => row.emittedVia ?? 'none'),
    `  measured: source analysis ${analysed - started} ms, dist import + compile + comparison ${Date.now() - analysed} ms`,
    ...outcome.failures.map((failure) => `  - ${failure}`),
    `channel-liveness --reconcile ${outcome.ok ? 'OK' : `FAIL -- ${outcome.failures.length} finding(s)`}`,
  ];
  (outcome.ok ? console.log : console.error)(lines.join('\n'));
  process.exitCode = outcome.ok ? 0 : 1;
}

const isCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) await main();
