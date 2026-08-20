// Self-test for dist-freshness-gate.mjs + write-build-stamp.mjs (BLD).
//
// Hermetic: every case runs against a synthetic package tree in a temp dir, so
// it needs no real build and is safe in the pre-build `test:scripts` slot. It
// drills the round-trip (a stamp written from a source state verifies against
// that same state) and every staleness vector (edited source, version drift,
// missing/corrupt stamp, unbuilt dist).

import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { assertDistFresh } from './index.mjs';
import { writeBuildStamp } from '../../builders/write-build-stamp/index.mjs';
import { computeBuildInputHash } from '../../lib/build-input-hash.mjs';

function scaffold({ version = '2.19.34', withDist = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'dist-freshness-'));
  const write = (rel, body) => {
    const full = join(root, rel);
    mkdirSync(join(full, '..'), { recursive: true });
    writeFileSync(full, body);
    return full;
  };
  write('package.json', JSON.stringify({ name: '@rottay/design-system', version, scripts: { build: 'tsc' } }));
  write('pnpm-lock.yaml', "lockfileVersion: '9.0'\n");
  write('vite.config.ts', 'export default {};\n');
  write('tsconfig.json', '{}\n');
  write('postcss.config.mjs', 'export default {};\n');
  write('scripts/lib/build-input-hash.mjs', '// fingerprint producer\n');
  write('scripts/builders/write-build-stamp/index.mjs', '// stamp producer\n');
  write('src/index.ts', 'export const answer = 42;\n');
  write('src/ui/button/index.tsx', 'export const Button = () => null;\n');
  // Non-shipping inputs that must NOT influence the hash.
  write('src/ui/button/index.test.tsx', 'test stub\n');
  write('src/ui/button/README.md', '# button\n');
  if (withDist) {
    for (const name of ['index.js', 'index.cjs', 'index.d.ts']) write(`dist/${name}`, '// built\n');
  }
  const stampPath = join(root, 'dist/build-stamp.json');
  return { root, write, stampPath, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

test('a stamp written from a source state verifies against that same state', () => {
  const f = scaffold();
  try {
    const result = writeBuildStamp({ packageRoot: f.root, dist: join(f.root, 'dist') });
    assert.equal(result.ok, true, result.message);
    const { ok, failures } = assertDistFresh({ packageRoot: f.root, stampPath: f.stampPath });
    assert.equal(ok, true, failures.join('\n'));
  } finally {
    f.cleanup();
  }
});

test('editing a shippable source file after the stamp is written flags STALE', () => {
  const f = scaffold();
  try {
    writeBuildStamp({ packageRoot: f.root, dist: join(f.root, 'dist') });
    f.write('src/ui/button/index.tsx', 'export const Button = () => "changed";\n');
    const { ok, failures } = assertDistFresh({ packageRoot: f.root, stampPath: f.stampPath });
    assert.equal(ok, false);
    assert.match(failures.join('\n'), /STALE/);
    assert.match(failures.join('\n'), /pnpm --filter @rottay\/design-system build/);
  } finally {
    f.cleanup();
  }
});

test('editing a test/story/markdown input does NOT flag stale (non-shipping input)', () => {
  const f = scaffold();
  try {
    writeBuildStamp({ packageRoot: f.root, dist: join(f.root, 'dist') });
    f.write('src/ui/button/index.test.tsx', 'different test body\n');
    f.write('src/ui/button/README.md', '# button changed\n');
    const { ok } = assertDistFresh({ packageRoot: f.root, stampPath: f.stampPath });
    assert.equal(ok, true);
  } finally {
    f.cleanup();
  }
});

test('a version bump after the build flags the stamp as stale', () => {
  const f = scaffold({ version: '2.19.34' });
  try {
    writeBuildStamp({ packageRoot: f.root, dist: join(f.root, 'dist') });
    f.write('package.json', JSON.stringify({ name: '@rottay/design-system', version: '2.19.35', scripts: { build: 'tsc' } }));
    const { ok, failures } = assertDistFresh({ packageRoot: f.root, stampPath: f.stampPath });
    assert.equal(ok, false);
    assert.match(failures.join('\n'), /2\.19\.34.*2\.19\.35|2\.19\.35/);
  } finally {
    f.cleanup();
  }
});

test('a missing stamp fails with the build command named', () => {
  const f = scaffold();
  try {
    const { ok, failures } = assertDistFresh({ packageRoot: f.root, stampPath: f.stampPath });
    assert.equal(ok, false);
    assert.match(failures.join('\n'), /build stamp missing/);
    assert.match(failures.join('\n'), /pnpm --filter @rottay\/design-system build/);
  } finally {
    f.cleanup();
  }
});

test('a corrupt stamp fails closed', () => {
  const f = scaffold();
  try {
    writeFileSync(f.stampPath, '{ not json');
    const { ok, failures } = assertDistFresh({ packageRoot: f.root, stampPath: f.stampPath });
    assert.equal(ok, false);
    assert.match(failures.join('\n'), /not valid JSON/);
  } finally {
    f.cleanup();
  }
});

test('write-build-stamp refuses to stamp an unbuilt dist (no sentinel artifacts)', () => {
  const f = scaffold({ withDist: false });
  try {
    const result = writeBuildStamp({ packageRoot: f.root, dist: join(f.root, 'dist') });
    assert.equal(result.ok, false);
    assert.match(result.message, /unbuilt dist/);
    assert.match(result.message, /index\.js/);
  } finally {
    f.cleanup();
  }
});

test('the build-input hash is stable across repeated computation', () => {
  const f = scaffold();
  try {
    const a = computeBuildInputHash(f.root);
    const b = computeBuildInputHash(f.root);
    assert.equal(a.sourceHash, b.sourceHash);
    assert.equal(a.buildInputFingerprint, b.buildInputFingerprint);
    assert.deepEqual(a.buildInputManifest, b.buildInputManifest);
    assert.equal(a.fileCount, 2, 'only src/index.ts and src/ui/button/index.tsx are shippable inputs');
  } finally {
    f.cleanup();
  }
});

test('editing pnpm-lock.yaml invalidates build inputs without changing sourceHash', () => {
  const f = scaffold();
  try {
    const before = computeBuildInputHash(f.root);
    writeBuildStamp({ packageRoot: f.root, dist: join(f.root, 'dist') });
    f.write('pnpm-lock.yaml', "lockfileVersion: '9.0'\n# dependency drift\n");
    const after = computeBuildInputHash(f.root);
    assert.equal(after.sourceHash, before.sourceHash);
    assert.notEqual(after.buildInputFingerprint, before.buildInputFingerprint);
    const { ok, failures } = assertDistFresh({ packageRoot: f.root, stampPath: f.stampPath });
    assert.equal(ok, false);
    assert.match(failures.join('\n'), /build inputs changed/);
  } finally {
    f.cleanup();
  }
});

test('editing a producer script invalidates the build-input fingerprint', () => {
  const f = scaffold();
  try {
    writeBuildStamp({ packageRoot: f.root, dist: join(f.root, 'dist') });
    f.write('scripts/builders/write-build-stamp/index.mjs', '// changed stamp producer\n');
    const { ok, failures } = assertDistFresh({ packageRoot: f.root, stampPath: f.stampPath });
    assert.equal(ok, false);
    assert.match(failures.join('\n'), /build inputs changed/);
  } finally {
    f.cleanup();
  }
});

test('a legacy stamp without the build-input attestation fails closed', () => {
  const f = scaffold();
  try {
    writeBuildStamp({ packageRoot: f.root, dist: join(f.root, 'dist') });
    const stamp = JSON.parse(readFileSync(f.stampPath, 'utf8'));
    delete stamp.buildInputFingerprint;
    delete stamp.buildInputManifest;
    writeFileSync(f.stampPath, `${JSON.stringify(stamp)}\n`);
    const { ok, failures } = assertDistFresh({ packageRoot: f.root, stampPath: f.stampPath });
    assert.equal(ok, false);
    assert.match(failures.join('\n'), /no buildInputFingerprint/);
  } finally {
    f.cleanup();
  }
});

test('a stamp whose embedded manifest was altered fails closed', () => {
  const f = scaffold();
  try {
    writeBuildStamp({ packageRoot: f.root, dist: join(f.root, 'dist') });
    const stamp = JSON.parse(readFileSync(f.stampPath, 'utf8'));
    stamp.buildInputManifest.package.sha256 = 'tampered';
    writeFileSync(f.stampPath, `${JSON.stringify(stamp)}\n`);
    const { ok, failures } = assertDistFresh({ packageRoot: f.root, stampPath: f.stampPath });
    assert.equal(ok, false);
    assert.match(failures.join('\n'), /manifest fingerprint is inconsistent/);
  } finally {
    f.cleanup();
  }
});
