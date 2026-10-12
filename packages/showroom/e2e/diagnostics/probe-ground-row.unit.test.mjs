// The probe-ground row codec: a tenant read back from serialized row bytes mounts the exact
// artifact the in-memory fixture mounts, and a changed byte or a foreign column does not.
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';

import { hydrateTenantThemeConfig } from '@rottay/design-system/server';

import { mountLegacyGround } from '../../src/components/probe-ground/legacy/index.mjs';
import {
  decodeTenantThemeRow,
  encodeTenantThemeRow,
  TENANT_THEME_ROW_ENCODINGS,
  TenantThemeRowRefusal,
  tenantThemeRowOf,
} from '../../src/components/probe-ground/row/index.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** A TypeScript module loaded unchanged through node's type stripping. */
function loadTs(file, pick) {
  const run = spawnSync(
    process.execPath,
    ['--experimental-strip-types', '--no-warnings', '--input-type=module', '-e',
      `const m = await import(${JSON.stringify(file)}); process.stdout.write(JSON.stringify(${pick}));`],
    { encoding: 'utf8' },
  );
  assert.equal(run.status, 0, run.stderr);
  return JSON.parse(run.stdout);
}

const divergence = loadTs(join(ROOT, 'src/components/divergence-surface/fixtures/index.ts'), 'm.DIVERGENCE_FIXTURES');
const MOUNT = { themeMode: 'light', locale: 'en' };

const inputOf = (document, identity) => ({
  document,
  tenantId: identity.tenantId,
  slug: identity.slug,
  vertical: identity.verticalKey,
  rowVersion: identity.rowVersion,
});

/** What the probe page does with `?row=`: bytes and the trusted identity, nothing else. */
async function mountRowBytes(bytes, trusted) {
  const row = decodeTenantThemeRow(bytes);
  const { tenantId, slug, verticalKey, rowVersion, ...document } = hydrateTenantThemeConfig(row.document, row.identity, {
    expectedIdentity: trusted,
  });
  return mountLegacyGround(inputOf(document, { tenantId, slug, verticalKey, rowVersion }), MOUNT);
}

const rewrite = (bytes, from, to) => {
  const text = Buffer.from(bytes).toString('utf8');
  assert.equal(text.split(from).length - 1, 1, `${from} must occur exactly once in the row`);
  return new TextEncoder().encode(text.replace(from, to));
};

for (const id of ['sober', 'editorial']) {
  const { document, identity } = divergence[id];
  const row = tenantThemeRowOf(document, identity);

  test(`${id}: the two encodings are different bytes of the same row`, () => {
    const [json, jsonb] = TENANT_THEME_ROW_ENCODINGS.map((encoding) => Buffer.from(encodeTenantThemeRow(row, encoding)));
    assert.notDeepEqual(json, jsonb);
    assert.deepEqual(decodeTenantThemeRow(json), decodeTenantThemeRow(jsonb));
    assert.deepEqual(decodeTenantThemeRow(json), { document, identity });
  });

  for (const encoding of TENANT_THEME_ROW_ENCODINGS) {
    test(`${id} as ${encoding}: row bytes mount the static path's exact style element and root projection`, async () => {
      const fromStatic = await mountLegacyGround(inputOf(document, identity), MOUNT);
      const fromRow = await mountRowBytes(encodeTenantThemeRow(row, encoding), identity);
      assert.ok(Object.keys(fromStatic.artifact.variables).length > 0, 'the fixture must move the vertical');
      assert.equal(fromRow.artifact.digest, fromStatic.artifact.digest);
      assert.equal(fromRow.artifact.css, fromStatic.artifact.css);
      assert.deepEqual(fromRow.artifact, fromStatic.artifact);
      assert.equal(fromRow.mounted.styleElements.length, 1);
      assert.equal(fromRow.mounted.styleElements[0].css, fromStatic.mounted.styleElements[0].css);
      assert.deepEqual(fromRow.mounted.styleElements[0].attributes, fromStatic.mounted.styleElements[0].attributes);
      assert.deepEqual(fromRow.mounted.rootAttributes, fromStatic.mounted.rootAttributes);
    });

    test(`${id} as ${encoding}: one changed document byte mounts a different artifact`, async () => {
      const fromStatic = await mountLegacyGround(inputOf(document, identity), MOUNT);
      const seed = document.visualFoundation.general.palette.primary;
      const tampered = rewrite(encodeTenantThemeRow(row, encoding), `"${seed}"`, `"${seed.slice(0, -1)}0"`);
      const fromRow = await mountRowBytes(tampered, identity);
      assert.notEqual(fromRow.artifact.digest, fromStatic.artifact.digest);
      assert.notEqual(fromRow.mounted.styleElements[0].css, fromStatic.mounted.styleElements[0].css);
    });

    test(`${id} as ${encoding}: a row naming another version is refused against the trusted identity`, async () => {
      const separator = encoding === 'jsonb' ? ': ' : ':';
      const tampered = rewrite(encodeTenantThemeRow(row, encoding), `"rowVersion"${separator}1`, `"rowVersion"${separator}2`);
      await assert.rejects(mountRowBytes(tampered, identity), /\$\.rowVersion: Trusted row identity does not match/);
    });
  }
}

test('bytes that are not exactly one row are refused by name', () => {
  const bytes = encodeTenantThemeRow(tenantThemeRowOf(divergence.sober.document, divergence.sober.identity), 'json');
  assert.throws(() => decodeTenantThemeRow(bytes.slice(0, -1)), TenantThemeRowRefusal);
  assert.throws(() => decodeTenantThemeRow(new Uint8Array([0xff, 0xfe])), /not UTF-8/);
  assert.throws(() => decodeTenantThemeRow(rewrite(bytes, '"rowVersion"', '"compiledCss"')), /missing: rowVersion; extra: compiledCss/);
  assert.throws(() => decodeTenantThemeRow(rewrite(bytes, '"rowVersion":1', '"rowVersion":"1"')), /rowVersion is not an integer/);
});

test('the showroom codec emits the bytes of the core test-support codec', () => {
  const core = join(ROOT, '..', 'core', 'tests', 'support', 'tenant-theme-row', 'index.ts');
  for (const id of ['sober', 'editorial']) {
    const { document, identity } = divergence[id];
    for (const encoding of TENANT_THEME_ROW_ENCODINGS) {
      const fromCore = loadTs(
        core,
        `Buffer.from(m.encodeTenantThemeRow(m.tenantThemeRowOf(${JSON.stringify(document)}, ${JSON.stringify(identity)}), ${JSON.stringify(encoding)})).toString('base64')`,
      );
      assert.equal(Buffer.from(encodeTenantThemeRow(tenantThemeRowOf(document, identity), encoding)).toString('base64'), fromCore);
    }
  }
});
