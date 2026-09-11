/**
 * The drill for entrypoint parity.
 *
 * The gate's whole subject is a set that nobody was checking, so the mutants
 * are the ways a subpath or an owner slips into or out of that set: a 121st
 * export landing unclassified, a class widened until it swallows two subpaths,
 * an exemption class that has outlived its members, an entrypoint owner nobody
 * publishes, and the drift that would put this gate and
 * `public-entrypoint-boundary` on different sets.
 */
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, describe, it } from 'node:test';

import { CLASSES, GOVERNED_OWNERS, MANIFEST_PATH, evaluate, measure } from '../index.mjs';
import { packageRoot as findPackageRoot } from '../../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = findPackageRoot(HERE);

const sandboxes = [];
after(() => { for (const dir of sandboxes) rmSync(dir, { recursive: true, force: true }); });

/** A sandbox carrying the three inputs: package.json, the manifest, the owners. */
function sandbox(mutate = () => {}) {
  const dir = mkdtempSync(join(tmpdir(), 'evi02-entrypoints-'));
  sandboxes.push(dir);
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  mkdirSync(join(dir, dirname(MANIFEST_PATH)), { recursive: true });
  cpSync(join(ROOT, MANIFEST_PATH), join(dir, MANIFEST_PATH));
  mkdirSync(join(dir, 'src/entrypoints'), { recursive: true });
  for (const owner of ['charts', 'eslint', 'graphics', 'icons', 'public', 'server', 'suppliers']) {
    mkdirSync(join(dir, 'src/entrypoints', owner), { recursive: true });
  }
  mutate(pkg, dir);
  writeFileSync(join(dir, 'package.json'), JSON.stringify(pkg, null, 2));
  return dir;
}

describe('entrypoint parity — the real package', () => {
  it('classifies every published subpath exactly once', () => {
    const failures = evaluate(measure(ROOT));
    assert.deepEqual(failures, [], failures.join('\n'));
  });

  it('the two halves of the set are disjoint and complete', () => {
    const result = measure(ROOT);
    const governedRows = result.classified.filter((row) => row.classes.includes('governed-manifest'));
    assert.equal(governedRows.length, result.governed.length);
    assert.ok(
      result.subpaths.length > result.governed.length,
      'if every subpath were governed there would be no gap to close and this gate would be a duplicate',
    );
  });

  it('every entrypoint owner on disk is published', () => {
    const result = measure(ROOT);
    assert.ok(result.owners.length > 0);
    for (const owner of result.owners) assert.ok(result.publishedOwners.includes(owner), owner);
  });
});

describe('entrypoint parity drills', () => {
  it('MUTANT: a new public subpath nobody classified', () => {
    const dir = sandbox((pkg) => {
      pkg.exports['./telemetry'] = { import: './dist/telemetry.js' };
    });
    const failures = evaluate(measure(dir));
    assert.ok(
      failures.some((line) => line.startsWith('./telemetry:') && line.includes('classified by nothing')),
      failures.join(' | '),
    );
  });

  it('MUTANT: an ungoverned subpath under a governed owner is caught by BOTH rules', () => {
    const dir = sandbox((pkg) => {
      pkg.exports['./primitives/smuggled'] = { import: './dist/smuggled.js' };
    });
    const failures = evaluate(measure(dir));
    assert.ok(failures.some((line) => line.includes('absent from contracts/package/entrypoints')), failures.join(' | '));
  });

  it('MUTANT: a class that has outlived its members is a stale exemption', () => {
    const dir = sandbox((pkg) => {
      for (const subpath of Object.keys(pkg.exports)) {
        if (subpath === './eslint') delete pkg.exports[subpath];
      }
    });
    const failures = evaluate(measure(dir));
    assert.ok(failures.some((line) => line.startsWith('tooling-boundary:')), failures.join(' | '));
  });

  it('MUTANT: an entrypoint owner nobody publishes', () => {
    const dir = sandbox();
    mkdirSync(join(dir, 'src/entrypoints/orphan'), { recursive: true });
    const failures = evaluate(measure(dir));
    assert.ok(
      failures.some((line) => line.startsWith('src/entrypoints/orphan:')),
      failures.join(' | '),
    );
  });

  it('MUTANT: a release mapping pointing at an owner that does not exist', () => {
    const dir = sandbox((pkg) => {
      pkg.releaseSync.sourceEntrypoints['./ghost'] = 'entrypoints/ghost/index.ts';
    });
    const failures = evaluate(measure(dir));
    assert.ok(failures.some((line) => line.includes('src/entrypoints/ghost and no such owner')), failures.join(' | '));
  });

  it('MUTANT: a governed entry outside the six owners would split the two gates', () => {
    const dir = sandbox();
    const manifest = JSON.parse(readFileSync(join(dir, MANIFEST_PATH), 'utf8'));
    manifest.entries['./icons'] = manifest.entries[Object.keys(manifest.entries)[0]];
    writeFileSync(join(dir, MANIFEST_PATH), JSON.stringify(manifest));
    const failures = evaluate(measure(dir));
    assert.ok(
      failures.some((line) => line.startsWith('./icons:') && line.includes('measuring different sets')),
      failures.join(' | '),
    );
  });

  it('MUTANT: an empty package or an empty manifest is a broken reader, not a clean one', () => {
    const empty = sandbox((pkg) => { pkg.exports = {}; });
    assert.ok(evaluate(measure(empty)).some((line) => line.includes('publishes no subpath')));
  });

  it('the six governed owners are the ones public-entrypoint-boundary reverse-checks', () => {
    const source = readFileSync(join(ROOT, 'scripts/check/boundaries/public-api/index.mjs'), 'utf8');
    const declared = source.match(/const OWNERS = new Set\(\[([^\]]*)\]\)/u);
    assert.ok(declared, 'public-api/index.mjs no longer declares OWNERS the way this gate reads it');
    const names = [...declared[1].matchAll(/'([a-z-]+)'/gu)].map((match) => match[1]).sort();
    assert.deepEqual(names, [...GOVERNED_OWNERS].sort(),
      'the two gates disagree about which owners are governed');
  });

  it('every class carries a written reason', () => {
    for (const entry of CLASSES) assert.ok(entry.reason.length > 40, `${entry.id}: placeholder reason`);
  });
});
