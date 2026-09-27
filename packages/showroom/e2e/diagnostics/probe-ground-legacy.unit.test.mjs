// The probe-ground legacy source: a v1 document rides the kernel byte-identically to the compile
// each mechanism runs today, and anything it cannot prove is refused by name before it mounts.
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  compileTenantThemeConfig,
  emitTenantThemeArtifactForSsr,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from '@rottay/design-system/server';
import canaryFixtures from '@rottay/design-system/tenant-theme-canary-fixtures' with { type: 'json' };

import {
  compileLegacyGroundDocument,
  LegacyGroundRefusal,
  mountLegacyGround,
} from '../../src/components/probe-ground/legacy/index.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ENVELOPE = getTenantThemeVerticalEnvelope('bithire');

/** The probes' own TypeScript modules, loaded unchanged through node's type stripping. */
function loadTs(relative, pick) {
  const file = join(ROOT, relative);
  const run = spawnSync(
    process.execPath,
    ['--experimental-strip-types', '--no-warnings', '--input-type=module', '-e',
      `const m = await import(${JSON.stringify(file)}); process.stdout.write(JSON.stringify(${pick}));`],
    { encoding: 'utf8' },
  );
  assert.equal(run.status, 0, run.stderr);
  return JSON.parse(run.stdout);
}

const specimen = canaryFixtures.specimens.themanagement;
const divergence = loadTs('src/components/divergence-surface/fixtures/index.ts', 'm.DIVERGENCE_FIXTURES');
const { identity: VISUAL_AUTHORITY_IDENTITY, document: visualAuthority } = loadTs(
  'src/components/visual-authority-probe/config/index.ts',
  '{ identity: m.THEMANAGEMENT_IDENTITY, document: m.THEMANAGEMENT_DOCUMENT }',
);

// Each `today` is the call its mechanism makes now, verbatim.
const DOCUMENTS = [
  {
    name: 'the-management DB ground (canary)',
    identity: specimen.identity,
    document: specimen.document,
    today: () => compileTenantThemeConfig(hydrateTenantThemeConfig(specimen.document, specimen.identity), {
      verticalEnvelope: getTenantThemeVerticalEnvelope(specimen.identity.verticalKey),
    }),
  },
  ...['sober', 'editorial'].map((id) => ({
    name: `divergence ${id}`,
    identity: divergence[id].identity,
    document: divergence[id].document,
    today: () => compileTenantThemeConfig({ ...divergence[id].document, ...divergence[id].identity }, { verticalEnvelope: ENVELOPE }),
  })),
  {
    name: 'visual-authority themanagement',
    identity: VISUAL_AUTHORITY_IDENTITY,
    document: visualAuthority,
    today: () => compileTenantThemeConfig({ ...visualAuthority, ...VISUAL_AUTHORITY_IDENTITY }, { verticalEnvelope: ENVELOPE }),
  },
];

const inputOf = ({ document, identity }) => ({
  document,
  tenantId: identity.tenantId,
  slug: identity.slug,
  vertical: identity.verticalKey,
  rowVersion: identity.rowVersion,
});

for (const entry of DOCUMENTS) {
  test(`${entry.name}: the legacy source compiles and mounts today's exact artifact`, async () => {
    const today = entry.today();
    const { artifact, mounted } = await mountLegacyGround(inputOf(entry), { themeMode: 'light', locale: 'en' });
    assert.equal(artifact.digest, today.digest);
    assert.equal(artifact.css, today.css);
    assert.ok(isDeepStrictEqual(artifact, today), 'the artifact differs beyond digest and css');
    const emission = emitTenantThemeArtifactForSsr(today, { slug: today.slug, verticalKey: today.verticalKey });
    assert.equal(mounted.styleElements.length, 1);
    assert.equal(mounted.styleElements[0].css, emission.css);
    assert.deepEqual(mounted.styleElements[0].attributes, emission.attributes);
    assert.equal(mounted.rootAttributes['data-tenant'], entry.identity.slug);
  });
}

test('a garbage document is refused by name before any compile', () => {
  assert.throws(
    () => compileLegacyGroundDocument({ document: { hello: 'world' }, tenantId: 'tenant_garbage', slug: 'garbage' }),
    (error) => error instanceof LegacyGroundRefusal && error.slug === 'garbage' && /"garbage" refused: the v1 validator rejects/.test(error.message),
  );
});

test('a decision (V2) document is not a legacy document', () => {
  assert.throws(
    () => compileLegacyGroundDocument({ document: { version: 2, decisions: {} }, tenantId: 'tenant_v2', slug: 'v2-doc' }),
    (error) => error instanceof LegacyGroundRefusal && /v1 validator rejects/.test(error.message),
  );
});

test('a vertical without an envelope is refused instead of compiling unenveloped', () => {
  assert.throws(
    () => compileLegacyGroundDocument({ ...inputOf(DOCUMENTS[1]), vertical: 'no-such-vertical' }),
    (error) => error instanceof LegacyGroundRefusal && /no tenant-theme envelope for vertical "no-such-vertical"/.test(error.message),
  );
});

test('an identity the join refuses never reaches the compiler', () => {
  assert.throws(() => compileLegacyGroundDocument({ ...inputOf(DOCUMENTS[1]), tenantId: '' }), /tenantId/);
  assert.throws(() => compileLegacyGroundDocument({ ...inputOf(DOCUMENTS[1]), rowVersion: -1 }), /rowVersion/);
});
