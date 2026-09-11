/**
 * The drill for artifact coverage.
 *
 * The failure this gate exists against is a family the compiled transport
 * cannot reach. The failure the DRILL exists against is subtler and has already
 * happened twice in this tree: a scanner that quietly stops scanning reports
 * better coverage than yesterday, and a ratchet pointed the wrong way calls
 * that an improvement. So every case below makes the measurement WORSE in a
 * specific way and asserts the gate says so.
 */
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, describe, it } from 'node:test';

import {
  ARTIFACT_ROOT,
  BASELINE_PATH,
  artifactChannels,
  declaredChannels,
  evaluate,
  measure,
} from '../index.mjs';
import { packageRoot as findPackageRoot } from '../../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = findPackageRoot(HERE);
const SKIN_ROOT = 'src/foundation/tokens/css/runtime/engines/modern/skin';
const AGNOSTIC_SKIN_ROOT = 'src/foundation/tokens/css/presentation/components/skin';

const sandboxes = [];
after(() => { for (const dir of sandboxes) rmSync(dir, { recursive: true, force: true }); });

function sandbox() {
  const dir = mkdtempSync(join(tmpdir(), 'evi02-coverage-'));
  sandboxes.push(dir);
  for (const relative of [SKIN_ROOT, AGNOSTIC_SKIN_ROOT, ARTIFACT_ROOT]) {
    mkdirSync(join(dir, relative), { recursive: true });
    cpSync(join(ROOT, relative), join(dir, relative), { recursive: true });
  }
  mkdirSync(join(dir, 'src/contracts/theme/runtime/catalog'), { recursive: true });
  cpSync(
    join(ROOT, 'src/contracts/theme/runtime/catalog/index.ts'),
    join(dir, 'src/contracts/theme/runtime/catalog/index.ts'),
  );
  return dir;
}

/** A baseline that matches the sandbox exactly, so only the mutation can move it. */
function pinnedFor(dir) {
  const result = measure(dir);
  return {
    verticals: result.verticals,
    families: result.families,
    reads: result.reads,
    covered: result.covered,
    uncovered: result.uncovered,
    unreachableFamilies: result.unreachableFamilies,
  };
}

describe('artifact coverage — the measurement', () => {
  it('a declaration is a write, not a read', () => {
    const declared = declaredChannels('a { --ds-x: 1; color: var(--ds-y); /* --ds-z: 2; */ }');
    assert.ok(declared.has('--ds-x'));
    assert.ok(!declared.has('--ds-y'), 'var() is a read, not a declaration');
    assert.ok(!declared.has('--ds-z'), 'a commented declaration declares nothing');
  });

  it('every shipped vertical artifact declares thousands of channels', () => {
    const byVertical = artifactChannels(ROOT);
    assert.ok(byVertical.size >= 3, `expected the three first-party artifacts; got ${byVertical.size}`);
    for (const [vertical, channels] of byVertical) {
      assert.ok(channels.size > 1000, `${vertical}: only ${channels.size} channels — the reader is broken`);
    }
  });

  it('the gate passes on the tree its baseline was pinned against', () => {
    const failures = evaluate(measure(ROOT), JSON.parse(readFileSync(BASELINE_PATH, 'utf8')));
    assert.deepEqual(failures, [], failures.join('\n'));
  });
});

describe('artifact coverage drills — a worse tree is refused, and so is a lying scanner', () => {
  it('MUTANT: a channel disappearing from every artifact lowers coverage and goes red', () => {
    const dir = sandbox();
    const pinned = pinnedFor(dir);
    assert.deepEqual(evaluate(measure(dir), pinned), [], 'the sandbox must be green first');

    const victim = '--ds-color-primary';
    for (const vertical of Object.keys(pinned.verticals)) {
      const file = join(dir, ARTIFACT_ROOT, vertical, 'index.css');
      const source = readFileSync(file, 'utf8');
      const mutated = source.replaceAll(`${victim}:`, '--ds-drill-removed:');
      assert.notEqual(mutated, source, `${vertical}: the mutation must actually land`);
      writeFileSync(file, mutated);
    }
    const failures = evaluate(measure(dir), pinned);
    assert.ok(failures.some((line) => line.includes('coverage got WORSE')), failures.join(' | '));
  });

  it('MUTANT: an artifact emptied to nothing is a vacuity failure, not perfect coverage', () => {
    const dir = sandbox();
    const pinned = pinnedFor(dir);
    const vertical = Object.keys(pinned.verticals)[0];
    writeFileSync(join(dir, ARTIFACT_ROOT, vertical, 'index.css'), '/* drained */\n');
    const failures = evaluate(measure(dir), pinned);
    assert.ok(
      failures.some((line) => line.includes('declares no channel at all')),
      `an empty artifact must be named, not silently counted: ${failures.join(' | ')}`,
    );
  });

  it('MUTANT: a new family no artifact can reach is reported BY NAME', () => {
    const dir = sandbox();
    const pinned = pinnedFor(dir);
    mkdirSync(join(dir, SKIN_ROOT, 'drill-orphan'), { recursive: true });
    writeFileSync(
      join(dir, SKIN_ROOT, 'drill-orphan/index.css'),
      ".ds-drill-orphan { color: var(--ds-nobody-declares-this); }\n",
    );
    const failures = evaluate(measure(dir), pinned);
    assert.ok(
      failures.some((line) => line.startsWith('drill-orphan:') && line.includes('no tenant can reach')),
      failures.join(' | '),
    );
  });

  it('MUTANT: a family that stopped being unreachable must be removed from the pin', () => {
    const dir = sandbox();
    const pinned = pinnedFor(dir);
    pinned.unreachableFamilies = [...pinned.unreachableFamilies, 'a-family-that-is-fine'];
    const failures = evaluate(measure(dir), pinned);
    assert.ok(failures.some((line) => line.includes('is no longer; remove it from the baseline')), failures.join(' | '));
  });

  it('MUTANT: coverage that IMPROVED is red too, so the pin follows the tree', () => {
    const dir = sandbox();
    const pinned = pinnedFor(dir);
    pinned.uncovered += 1;
    const failures = evaluate(measure(dir), pinned);
    assert.ok(failures.some((line) => line.includes('lower the pin in this commit')), failures.join(' | '));
  });

  it('MUTANT: an unpinned counter is refused rather than defaulted to zero', () => {
    const dir = sandbox();
    const pinned = pinnedFor(dir);
    delete pinned.covered;
    const failures = evaluate(measure(dir), pinned);
    assert.ok(failures.some((line) => line.includes('an unpinned counter is not a ratchet')), failures.join(' | '));
  });

  it('MUTANT: a fourth artifact nobody pinned is refused', () => {
    const dir = sandbox();
    const pinned = pinnedFor(dir);
    mkdirSync(join(dir, ARTIFACT_ROOT, 'shadow'), { recursive: true });
    writeFileSync(join(dir, ARTIFACT_ROOT, 'shadow/index.css'), ':root { --ds-color-primary: red; }\n');
    const failures = evaluate(measure(dir), pinned);
    assert.ok(failures.some((line) => line.startsWith('shadow:')), failures.join(' | '));
  });
});
