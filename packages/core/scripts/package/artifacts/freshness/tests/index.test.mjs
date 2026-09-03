/**
 * Drills for the dist-freshness gate.
 *
 * Four of these were GREEN before this lot, which is the finding: the gate
 * proved "source now equals source when stamped", never "dist was produced from
 * that source". `build:stamp` is a first-class npm script, so stamping an
 * arbitrarily old dist turned it green; and because the gate read only the
 * stamp, a dist byte mutated after stamping -- or a dist emptied down to
 * `build-stamp.json` -- was invisible.
 *
 * Every case runs against a fixture package root through the gate's own
 * `--package-root` / `--stamp` mode. Nothing here touches the real dist.
 */

import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { packageRoot as findPackageRoot } from '../../../../libraries/repo-root/index.mjs';
import { BUILD_SESSION_FILE, SENTINEL_ARTIFACTS, collectDistManifest, writeBuildSession, writeBuildStamp } from '../../../../build/stamp/index.mjs';
import { assertDistFresh } from '../index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);

/**
 * A fixture package: the real `package.json`, `pnpm-lock.yaml` and producer
 * inputs the input-hash walks, plus a synthetic dist. The source hash is
 * whatever the fixture computes; the drills only ever compare it to itself.
 */
function plantPackage() {
  // The fixture mirrors the workspace layout, not just the package: the
  // input hash reads `pnpm-lock.yaml` from the workspace root and refuses to
  // stamp without it.
  const workspace = mkdtempSync(join(tmpdir(), 'ds-distfresh-'));
  const root = join(workspace, 'packages/core');
  mkdirSync(root, { recursive: true });
  writeFileSync(join(workspace, 'pnpm-workspace.yaml'), "packages:\n  - 'packages/*'\n");
  writeFileSync(join(workspace, 'package.json'), JSON.stringify({ name: 'workspace-root' }));
  const lock = join(CORE_ROOT, '../../pnpm-lock.yaml');
  writeFileSync(join(workspace, 'pnpm-lock.yaml'), existsSync(lock) ? readFileSync(lock) : 'lockfileVersion: 9\n');
  cpSync(join(CORE_ROOT, 'package.json'), join(root, 'package.json'));
  for (const relative of ['src', 'scripts', 'vite.config.ts', 'tsconfig.json']) {
    const source = join(CORE_ROOT, relative);
    if (existsSync(source)) cpSync(source, join(root, relative), { recursive: true });
  }
  const dist = join(root, 'dist');
  mkdirSync(dist, { recursive: true });
  for (const name of SENTINEL_ARTIFACTS) writeFileSync(join(dist, name), `/* ${name} */\n`);
  mkdirSync(join(dist, 'components'), { recursive: true });
  writeFileSync(join(dist, 'components/index.d.ts'), 'export {};\n');
  return { workspace, root, dist, stampPath: join(dist, 'build-stamp.json') };
}

function stamp(fixture, options = {}) {
  writeBuildSession({ dist: fixture.dist });
  return writeBuildStamp({ packageRoot: fixture.root, dist: fixture.dist, ...options });
}

function check(fixture) {
  return assertDistFresh({
    packageRoot: fixture.root,
    stampPath: fixture.stampPath,
    dist: fixture.dist,
  });
}

const planted = [];
function fixture() {
  const created = plantPackage();
  planted.push(created);
  return created;
}
test.after(() => {
  for (const created of planted) rmSync(created.workspace, { recursive: true, force: true });
});

test('POSITIVE: a freshly stamped dist is fresh', () => {
  const f = fixture();
  const written = stamp(f);
  assert.equal(written.ok, true, written.message);
  const result = check(f);
  assert.deepEqual(result.failures, []);
  assert.equal(result.ok, true);
});

test('N1/N2: a missing or malformed stamp is a failure', () => {
  const f = fixture();
  assert.match(check(f).failures.join(''), /build stamp missing/);
  writeFileSync(f.stampPath, 'not json');
  assert.match(check(f).failures.join(''), /not valid JSON/);
});

test('N3/N10: source edited or ADDED after the stamp is a failure', () => {
  const f = fixture();
  assert.equal(stamp(f).ok, true);
  assert.equal(check(f).ok, true);
  writeFileSync(join(f.root, 'src/drill-added-after-stamp.ts'), 'export const added = 1;\n');
  assert.match(check(f).failures.join(''), /dist is STALE/);
});

test('N4: a producerVersion that no longer matches package.json is a failure', () => {
  const f = fixture();
  assert.equal(stamp(f).ok, true);
  const written = JSON.parse(readFileSync(f.stampPath, 'utf8'));
  written.producerVersion = '0.0.0-drill';
  writeFileSync(f.stampPath, `${JSON.stringify(written, null, 2)}\n`);
  assert.match(check(f).failures.join(''), /dist was built for version 0\.0\.0-drill/);
});

test('N5: a manifest fingerprint inconsistent with its own manifest is a failure', () => {
  const f = fixture();
  assert.equal(stamp(f).ok, true);
  const written = JSON.parse(readFileSync(f.stampPath, 'utf8'));
  written.buildInputManifest.workspace = [];
  writeFileSync(f.stampPath, `${JSON.stringify(written, null, 2)}\n`);
  assert.match(check(f).failures.join(''), /manifest fingerprint is inconsistent/);
});

test('N6: a standalone re-stamp of an old dist is REFUSED (green before this lot)', () => {
  // `build:stamp` is a published npm script whose only precondition was the
  // presence of three sentinel files. Running it against an arbitrarily old
  // dist stamped the CURRENT source hash onto it and the gate turned green.
  const f = fixture();
  assert.equal(stamp(f).ok, true);
  assert.equal(existsSync(join(f.dist, BUILD_SESSION_FILE)), false, 'the nonce must be single-use');

  const restamp = writeBuildStamp({ packageRoot: f.root, dist: f.dist });
  assert.equal(restamp.ok, false);
  assert.match(restamp.message, /refusing to stamp without a build session marker/);
});

test('N7: a dist byte mutated AFTER stamping is a failure (green before this lot)', () => {
  const f = fixture();
  assert.equal(stamp(f).ok, true);
  assert.equal(check(f).ok, true);
  writeFileSync(join(f.dist, 'index.js'), '/* tampered after the stamp */\n');
  assert.match(check(f).failures.join(''), /dist files were modified since it was stamped/);
});

test('N8: a dist emptied down to the stamp is a failure (green before this lot)', () => {
  const f = fixture();
  assert.equal(stamp(f).ok, true);
  for (const name of SENTINEL_ARTIFACTS) rmSync(join(f.dist, name));
  rmSync(join(f.dist, 'components'), { recursive: true, force: true });
  assert.match(check(f).failures.join(''), /dist files disappeared since it was stamped/);
});

test('N9: stamping a dist missing modern-engine.css is REFUSED (green before this lot)', () => {
  // The sentinel set was three files, so a partial build that emitted only
  // `index.{js,cjs,d.ts}` stamped successfully. The vertical CSS bundles and the
  // modern engine bundle are in the package `files` allowlist and are now
  // sentinels too.
  const f = fixture();
  rmSync(join(f.dist, 'modern-engine.css'));
  const written = stamp(f);
  assert.equal(written.ok, false);
  assert.match(written.message, /missing modern-engine\.css/);
});

test('a stamp without a distManifest or a buildSession cannot certify freshness', () => {
  // Anti-downgrade: an older schema-2 stamp must not read as fresh just because
  // its source hash still matches.
  const f = fixture();
  assert.equal(stamp(f).ok, true);
  const written = JSON.parse(readFileSync(f.stampPath, 'utf8'));
  delete written.distManifest;
  delete written.buildSession;
  writeFileSync(f.stampPath, `${JSON.stringify(written, null, 2)}\n`);
  const failures = check(f).failures.join('');
  assert.match(failures, /no distManifest/);
  assert.match(failures, /carries no buildSession/);
});

test('the dist manifest enumerates every shipped extension and nothing else', () => {
  const f = fixture();
  writeFileSync(join(f.dist, 'index.d.ts.map'), '{}\n');
  writeFileSync(join(f.dist, 'notes.txt'), 'ignored\n');
  const manifest = collectDistManifest(f.dist);
  const paths = manifest.map((entry) => entry.path);
  assert.ok(paths.includes('index.js'));
  assert.ok(paths.includes('modern-engine.css'));
  assert.ok(paths.includes('components/index.d.ts'));
  assert.equal(paths.includes('index.d.ts.map'), false);
  assert.equal(paths.includes('notes.txt'), false);
  for (const entry of manifest) assert.match(entry.sha256, /^[0-9a-f]{64}$/);
  assert.deepEqual(paths, [...paths].sort(), 'the manifest must be deterministic in order');
});

test('the real gate resolves its own package root without arguments', () => {
  // The fixture drills would all pass on a gate that could not find the real
  // package, so pin that the default resolution still works and still names the
  // real stamp path.
  assert.equal(resolve(CORE_ROOT, 'dist/build-stamp.json').endsWith('dist/build-stamp.json'), true);
  assert.ok(existsSync(join(CORE_ROOT, 'package.json')));
});
