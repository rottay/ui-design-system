#!/usr/bin/env node
/**
 * @fileoverview Runs every drill in this folder.
 *
 * One command, one exit code. If any check in lane-control can no longer be
 * seen failing on an injected violation, this goes red — which is the only
 * evidence any of these checks are worth running at all.
 *
 *   node packages/core/src/tooling/lane-control/drills/index.mjs
 */
import { runDrills as intersection } from './intersection/index.mjs';
import { runDrills as containment } from './containment/index.mjs';
import { runDrills as workOrder } from './work-order/index.mjs';
import { runDrills as programState } from './program-state/index.mjs';
import { runDrills as tenantReachability } from './tenant-reachability/index.mjs';

const SUITES = [
  ['write-set intersection', intersection],
  ['containment', containment],
  ['work-order', workOrder],
  ['program-state', programState],
  ['tenant-reachability', tenantReachability],
];

const results = [];
for (const [name, suite] of SUITES) {
  console.log(`\n━━ ${name} ━━`);
  results.push([name, suite()]);
}

console.log('\n━━ lane-control drills ━━');
for (const [name, ok] of results) console.log(`  ${ok ? '✓' : '✗'} ${name}`);

const failed = results.filter(([, ok]) => !ok);
if (failed.length > 0) {
  console.error(`\n✗ ${failed.length} drill suite(s) did not behave as specified: ${failed.map(([name]) => name).join(', ')}`);
  process.exit(1);
}
console.log('\n✓ every check in lane-control was seen refusing an injected violation, and passing its control');
process.exit(0);
