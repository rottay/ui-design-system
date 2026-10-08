/**
 * The drill for artifact-name-intersection: every mutation runs against a sandbox copy of the tracked
 * bundles and the real baseline, so only the planted change can move the verdict.
 */
import assert from 'node:assert/strict';
import { appendFileSync, cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, describe, it } from 'node:test';

import {
  ARTIFACT_ROOT,
  BASELINE_PATH,
  FACADE_REASON,
  FACADE_ROOT,
  THRESHOLD,
  declaredNames,
  evaluate,
  measure,
} from '../index.mjs';
import { packageRoot as findPackageRoot } from '../../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = findPackageRoot(HERE);
const BASELINE = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));

const sandboxes = [];
after(() => { for (const dir of sandboxes) rmSync(dir, { recursive: true, force: true }); });

function sandbox() {
  const dir = mkdtempSync(join(tmpdir(), 'f54-name-intersection-'));
  sandboxes.push(dir);
  for (const relative of [ARTIFACT_ROOT, FACADE_ROOT]) {
    mkdirSync(join(dir, relative), { recursive: true });
    cpSync(join(ROOT, relative), join(dir, relative), { recursive: true });
  }
  return dir;
}

const bundle = (dir, vertical) => join(dir, ARTIFACT_ROOT, vertical, 'index.css');
const plant = (dir, vertical, css) => appendFileSync(bundle(dir, vertical), `\n${css}\n`);
const strip = (dir, vertical, name) => {
  const file = bundle(dir, vertical);
  const css = readFileSync(file, 'utf8');
  const pattern = new RegExp(`${name}\\s*:`, 'gu');
  assert.ok(pattern.test(css), `${name} is declared in the ${vertical} bundle before the drill strips it`);
  writeFileSync(file, css.replace(pattern, `--drill-stripped-${name.slice(2)}:`));
};
const verdict = (dir, baseline = BASELINE) => evaluate(measure(dir), baseline);

describe('artifact-name-intersection — the measurement', () => {
  it('a declaration is a write: var() reads, comments and non --ds-* names are not counted', () => {
    const names = declaredNames('a { --ds-x: 1; color: var(--ds-y); --other: 2; /* --ds-z: 3; */ }');
    assert.deepEqual([...names], ['--ds-x']);
  });

  it('(d) GREEN at HEAD: the tracked bundles meet the threshold and every tenant-only name is adjudicated', () => {
    const result = measure(ROOT);
    assert.deepEqual(Object.keys(result.verticals), ['bithire', 'evnto', 'rottay']);
    assert.ok(result.ratio >= THRESHOLD, `${result.shared}/${result.union}`);
    assert.deepEqual(evaluate(result, BASELINE).failures, []);
    assert.deepEqual(Object.keys(result.nonShared).sort(), Object.keys(BASELINE.residual).sort());
  });

  it('the ruled residual is exactly the 18 adjudicated names (17 bithire-only + the evnto display pack), none awaiting a ruling', () => {
    const ruled = Object.entries(BASELINE.residual).filter(([, entry]) => !entry.ruledBy.startsWith('OWED'));
    assert.equal(ruled.length, 18);
    assert.equal(ruled.filter(([, entry]) => entry.declaredBy.join() === 'bithire').length, 17);
    assert.equal(ruled.filter(([, entry]) => entry.declaredBy.join() === 'evnto').length, 1);
    const owed = Object.keys(BASELINE.residual).filter((name) => BASELINE.residual[name].ruledBy.startsWith('OWED'));
    assert.deepEqual(owed, []);
  });
});

describe('artifact-name-intersection drills — a tenant-only name fails closed', () => {
  it('(a) RED: a name only one bundle declares, outside the residual', () => {
    const dir = sandbox();
    plant(dir, 'rottay', ':root { --ds-drill-tenant-only: 1px; }');
    const { failures } = verdict(dir);
    assert.equal(failures.length, 1);
    assert.match(failures[0], /--ds-drill-tenant-only: declared by rottay only and not adjudicated/u);
  });

  it('RED: an adjudicated name declared by a vertical outside its declaredBy', () => {
    const dir = sandbox();
    plant(dir, 'rottay', ':root { --ds-chart-series-1: red; }');
    const { failures } = verdict(dir);
    assert.equal(failures.length, 1);
    assert.match(failures[0], /--ds-chart-series-1: adjudicated for bithire and now also declared by rottay/u);
  });

  it('RED: a shared name one bundle stops declaring becomes tenant-only and is not adjudicated', () => {
    const dir = sandbox();
    strip(dir, 'evnto', '--ds-color-primary');
    const { failures } = verdict(dir);
    assert.equal(failures.length, 1);
    assert.match(failures[0], /--ds-color-primary: declared by bithire \+ rottay only/u);
  });

  it('RED: a residual entry without its written identity', () => {
    const baseline = structuredClone(BASELINE);
    baseline.residual['--ds-chart-series-1'].identity = ' ';
    assert.match(evaluate(measure(ROOT), baseline).failures.join('\n'), /--ds-chart-series-1: adjudicated with no written identity/u);
  });
});

describe('artifact-name-intersection drills — the threshold', () => {
  it('(b) RED below 90%, even when every tenant-only name is adjudicated', () => {
    const dir = sandbox();
    const before = measure(dir);
    const extra = Math.ceil(before.shared / THRESHOLD) - before.union + 1;
    const names = Array.from({ length: extra }, (_, i) => `--ds-drill-population-${i}`);
    plant(dir, 'bithire', `:root { ${names.map((name) => `${name}: 0;`).join(' ')} }`);
    const baseline = structuredClone(BASELINE);
    for (const name of names) baseline.residual[name] = { declaredBy: ['bithire'], identity: 'drill', ruledBy: 'drill' };
    const result = measure(dir);
    assert.ok(result.ratio < THRESHOLD);
    const { failures } = evaluate(result, baseline);
    assert.equal(failures.length, 1);
    assert.match(failures[0], /< 90% — the three composed bundles no longer declare one vocabulary/u);
  });

  it('the threshold is the code constant: a baseline field cannot lower it', () => {
    const result = { ...measure(ROOT), ratio: 0.5 };
    assert.equal(evaluate(result, { ...BASELINE, threshold: 0.1 }).failures.length, 1);
  });
});

describe('artifact-name-intersection drills — vacuity and population', () => {
  it('RED: a bundle that declares nothing', () => {
    const dir = sandbox();
    writeFileSync(bundle(dir, 'evnto'), '/* emptied */\n');
    assert.match(verdict(dir).failures.join('\n'), /evnto: its composed bundle declares no --ds-\* name at all/u);
  });

  it('RED: a pinned vertical whose bundle is missing, and an unpinned bundle', () => {
    const dir = sandbox();
    rmSync(join(dir, ARTIFACT_ROOT, 'rottay'), { recursive: true });
    mkdirSync(join(dir, ARTIFACT_ROOT, 'drillvertical'));
    cpSync(bundle(ROOT, 'evnto'), bundle(dir, 'drillvertical'));
    const failures = verdict(dir).failures.join('\n');
    assert.match(failures, /rottay: pinned but its composed bundle was not found/u);
    assert.match(failures, /drillvertical: a composed bundle nobody pinned/u);
  });
});

describe('artifact-name-intersection — what stays green', () => {
  it('a residual name disappearing is lawful (shrink-only): a notice, never a failure', () => {
    const dir = sandbox();
    strip(dir, 'bithire', '--ds-material-card-texture');
    const { failures, notices } = verdict(dir);
    assert.deepEqual(failures, []);
    assert.deepEqual(notices, ['--ds-material-card-texture: adjudicated residual no longer tenant-only — lawful (shrink-only); it may leave the baseline']);
  });

  it('(c) out of scope: a name leaving every bundle does not move this gate', () => {
    const dir = sandbox();
    for (const vertical of ['bithire', 'evnto', 'rottay']) strip(dir, vertical, '--ds-color-primary');
    assert.deepEqual(verdict(dir).failures, []);
  });

  it('the facade class is reported and never gates', () => {
    const dir = sandbox();
    appendFileSync(join(dir, FACADE_ROOT, 'rottay', 'index.css'), '\n:root { --ds-drill-facade-only: 1; }\n');
    const result = measure(dir);
    assert.ok(result.facade.available && result.facade.union > result.facade.shared);
    assert.deepEqual(evaluate(result, BASELINE).failures, []);
    assert.match(FACADE_REASON, /D-30/u);
  });
});
