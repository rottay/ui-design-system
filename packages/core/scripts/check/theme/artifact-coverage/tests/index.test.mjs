/**
 * The drill for artifact coverage.
 *
 * The failure this gate exists against is a family the compiled transport
 * cannot reach. The failure the DRILL exists against is subtler and has already
 * happened twice in this tree: a scanner that quietly stops scanning reports
 * better coverage than yesterday, and a ratchet pointed the wrong way calls
 * that an improvement. So every case below makes the measurement WORSE in a
 * specific way and asserts the gate says so.
 *
 * The roster cases are newer and answer a third failure that also happened: a
 * family population pinned as a COUNT went six families stale for four days,
 * and three of the eight commits responsible netted to zero, so no count could
 * ever have caught them.
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
    familyRoster: result.familyNames,
    retiredFamilies: {},
    familiesEverPinned: result.families,
    reads: result.reads,
    covered: result.covered,
    uncovered: result.uncovered,
    coveredEveryVertical: result.coveredEveryVertical,
    coveredPerVertical: result.coveredPerVertical,
    unreachableFamilies: result.unreachableFamilies,
    unreachablePerVertical: result.unreachablePerVertical,
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

  it('MUTANT: a channel leaving ONE artifact is red — the hole the union alone had', () => {
    // This is the case the union-only ratchet could not see: two artifacts still
    // declare the channel, so `covered` does not move by a single read, and
    // before the per-artifact counters existed the gate stayed green while one
    // tenant lost its reach.
    const dir = sandbox();
    const pinned = pinnedFor(dir);
    assert.deepEqual(evaluate(measure(dir), pinned), [], 'the sandbox must be green first');

    const [victimVertical] = Object.keys(pinned.verticals);
    const file = join(dir, ARTIFACT_ROOT, victimVertical, 'index.css');
    const source = readFileSync(file, 'utf8');
    const mutated = source.replaceAll('--ds-color-primary:', '--ds-drill-removed:');
    assert.notEqual(mutated, source, 'the mutation must actually land');
    writeFileSync(file, mutated);

    const mutant = measure(dir);
    assert.equal(mutant.covered, pinned.covered, 'the UNION is blind to this, which is why the halves differ');
    const failures = evaluate(mutant, pinned);
    assert.ok(
      failures.some((line) => line.startsWith(`covered reads (${victimVertical}):`) && line.includes('WORSE')),
      failures.join(' | '),
    );
    assert.ok(
      failures.some((line) => line.startsWith('covered reads (every artifact):') && line.includes('WORSE')),
      failures.join(' | '),
    );
  });

  it('MUTANT: a family only ONE artifact cannot reach is named with that artifact', () => {
    const dir = sandbox();
    const pinned = pinnedFor(dir);
    const [victimVertical] = Object.keys(pinned.verticals);
    // A skin whose every read is a channel nobody declares: unreachable on the
    // one artifact we drain it from, reachable nowhere else either — so it must
    // be named per artifact rather than folded into the union list.
    const family = join(dir, SKIN_ROOT, 'evi02-drill-family');
    mkdirSync(family, { recursive: true });
    writeFileSync(join(family, 'index.css'), '.ds-evi02-drill { color: var(--ds-color-primary); }\n');
    const file = join(dir, ARTIFACT_ROOT, victimVertical, 'index.css');
    writeFileSync(
      file,
      readFileSync(file, 'utf8').replaceAll('--ds-color-primary:', '--ds-drill-removed:'),
    );
    const failures = evaluate(measure(dir), pinned);
    assert.ok(
      failures.some((line) => line.startsWith('evi02-drill-family:') && line.includes(`the ${victimVertical} artifact`)),
      failures.join(' | '),
    );
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

  it('MUTANT: a family that disappears is named, and the reasoned re-anchor passes', () => {
    // The case that actually happened: eleven skins merged into five over eight
    // commits and the count pin said only "coverage got WORSE". Here the gate
    // must NAME the family, and accept it only once the reason is written.
    const dir = sandbox();
    const pinned = pinnedFor(dir);
    assert.deepEqual(evaluate(measure(dir), pinned), [], 'the sandbox must be green first');

    rmSync(join(dir, SKIN_ROOT, 'popconfirm'), { recursive: true, force: true });
    const unreasoned = evaluate(measure(dir), pinned);
    assert.ok(
      unreasoned.some((line) => line.startsWith('popconfirm:') && line.includes('its skin is gone')),
      `a vanished family must be named: ${unreasoned.join(' | ')}`,
    );

    // The re-anchor, as a real one is written: every counter re-measured (a
    // vanished skin takes its reads with it) and the family's departure
    // recorded with its reason. Only then is the gate green.
    const reanchored = {
      ...pinnedFor(dir),
      retiredFamilies: { popconfirm: 'drill: merged into the confirm-dialog family by the planted cut' },
      familiesEverPinned: pinned.familiesEverPinned,
    };
    assert.deepEqual(evaluate(measure(dir), reanchored), [], 'the reasoned re-anchor must pass');

    // ...and the same re-anchor WITHOUT the reason is refused, because the
    // eleven families that left this roster left it with one.
    const unrecorded = { ...pinnedFor(dir), familiesEverPinned: pinned.familiesEverPinned };
    const silent = evaluate(measure(dir), unrecorded);
    assert.ok(
      silent.some((line) => line.startsWith('familiesEverPinned:') && line.includes('without a record')),
      `a silent deletion from the roster must be refused: ${silent.join(' | ')}`,
    );
  });

  it('MUTANT: a RENAME is red, and it is exactly what the count pin could not see', () => {
    // autocomplete -> auto-complete, overlay-modal -> modal and
    // skeleton-compounds -> skeleton-anatomy all netted to zero. A count pin is
    // blind to all three by construction; the roster names both sides.
    const dir = sandbox();
    const pinned = pinnedFor(dir);
    cpSync(join(dir, SKIN_ROOT, 'popconfirm'), join(dir, SKIN_ROOT, 'pop-confirm'), { recursive: true });
    rmSync(join(dir, SKIN_ROOT, 'popconfirm'), { recursive: true, force: true });

    const mutant = measure(dir);
    assert.equal(mutant.families, pinned.families, 'a rename nets to zero — this is the blindness being closed');
    const failures = evaluate(mutant, pinned);
    assert.ok(
      failures.some((line) => line.startsWith('pop-confirm:') && line.includes('nobody pinned')),
      failures.join(' | '),
    );
    assert.ok(
      failures.some((line) => line.startsWith('popconfirm:') && line.includes('its skin is gone')),
      failures.join(' | '),
    );
  });

  it('MUTANT: a retirement with an empty reason is refused — the reason IS the re-anchor', () => {
    const dir = sandbox();
    const pinned = pinnedFor(dir);
    rmSync(join(dir, SKIN_ROOT, 'popconfirm'), { recursive: true, force: true });
    const failures = evaluate(measure(dir), {
      ...pinned,
      families: pinned.families - 1,
      familyRoster: pinned.familyRoster.filter((family) => family !== 'popconfirm'),
      retiredFamilies: { popconfirm: '   ' },
    });
    assert.ok(failures.some((line) => line.includes('retired with no written reason')), failures.join(' | '));
  });

  it('MUTANT: a retired family that comes back is refused', () => {
    const dir = sandbox();
    const pinned = pinnedFor(dir);
    const failures = evaluate(measure(dir), {
      ...pinned,
      retiredFamilies: { popconfirm: 'drill: recorded as merged, but its skin is still on disk' },
    });
    assert.ok(failures.some((line) => line.includes('its skin is back')), failures.join(' | '));
    assert.ok(failures.some((line) => line.includes('the two sets are disjoint')), failures.join(' | '));
  });

  it('MUTANT: a pinned count that disagrees with its own roster is refused', () => {
    const dir = sandbox();
    const pinned = pinnedFor(dir);
    const failures = evaluate(measure(dir), { ...pinned, families: pinned.families + 1 });
    assert.ok(failures.some((line) => line.includes('names disagree')), failures.join(' | '));
  });

  it('MUTANT: a baseline with no ever-pinned anchor is refused', () => {
    const dir = sandbox();
    const pinned = pinnedFor(dir);
    delete pinned.familiesEverPinned;
    const failures = evaluate(measure(dir), pinned);
    assert.ok(failures.some((line) => line.includes('a family can leave the roster with no record')), failures.join(' | '));
  });

  it('MUTANT: an unrostered family population is refused rather than counted', () => {
    const dir = sandbox();
    const pinned = pinnedFor(dir);
    delete pinned.familyRoster;
    const failures = evaluate(measure(dir), pinned);
    assert.ok(failures.some((line) => line.includes('cannot see a rename')), failures.join(' | '));
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
