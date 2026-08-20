import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  collectPlatformIdentityFindings,
  findSemanticPlatformIdentity,
  isExcludedPlatformZeroPath,
} from './index.mjs';
import { packageRoot as findPackageRoot } from '../../lib/repo-root/index.mjs';

test('rejects each retired identity carrier', () => {
  const retired = ['plat', 'form'].join('');
  const planted = [
    `vertical: '${retired}'`,
    `data-vertical="${retired}"`,
    `data-theme="${retired}-dark"`,
    `./styles/${retired}`,
    `dist/${retired}.css`,
    `${retired}.admin`,
    `brand-themes/${retired}/index.ts`,
    `/verticals/${retired}/overview`,
    'Rottay Platform',
    'Platform vertical',
    'rottay platform',
  ].join('\n');
  const findings = findSemanticPlatformIdentity(planted, 'planted-negative.ts');
  assert.deepEqual(
    new Set(findings.map(({ rule }) => rule)),
    new Set([
      'identity-field',
      'root-selector',
      'style-export',
      'bundle-path',
      'profile-id',
      'source-route',
      'semantic-display-name',
    ]),
  );
});

test('allows only the non-identity meanings: process, WebAuthn and the physical app name', () => {
  const allowed = [
    'const operatingSystem = process.platform;',
    `const authenticatorAttachment = 'platform';`,
    'const supportsWebAuthn = PublicKeyCredential.isConditionalMediationAvailable;',
    `const applicationRoot = '../app-platform';`,
  ].join('\n');
  assert.deepEqual(findSemanticPlatformIdentity(allowed, 'positive.ts'), []);
});

test('walks operational manifests and unquoted CSS in the planted corpus', () => {
  const root = mkdtempSync(join(tmpdir(), 'platform-identity-zero-'));
  try {
    mkdirSync(join(root, 'ops'), { recursive: true });
    mkdirSync(join(root, 'ops', 'brand-themes', 'platform'), { recursive: true });
    writeFileSync(
      join(root, 'ops', 'verticals.manifest.json'),
      JSON.stringify({ verticalKey: 'platform' }, null, 2),
    );
    writeFileSync(
      join(root, 'ops', 'tenant.css'),
      '[data-vertical=platform] { color: red; }\n',
    );
    writeFileSync(join(root, 'ops', 'clean.mjs'), "export const app = '../app-platform';\n");
    writeFileSync(join(root, 'ops', 'brand-themes', 'platform', 'index.ts'), 'export {};\n');

    const findings = collectPlatformIdentityFindings({
      uiRoot: root,
      roots: [join(root, 'ops')],
      exclude: () => false,
    });
    assert.deepEqual(
      findings.map(({ path, rule }) => [path, rule]),
      [
        ['ops/brand-themes/platform/index.ts', 'source-path'],
        ['ops/tenant.css', 'root-selector'],
        ['ops/verticals.manifest.json', 'identity-field'],
      ],
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('JSON quoted registry keys are semantic identities, not invisible text', () => {
  const findings = findSemanticPlatformIdentity(
    JSON.stringify({ platform: { styleEntry: './styles/rottay' } }, null, 2),
    'verticals.manifest.json',
  );
  assert.equal(findings.some(({ rule }) => rule === 'registry-key'), true);
});

test('the own-name exemption is a NAME, not a licence: neighbours under verticals/ still fail', () => {
  const retired = ['plat', 'form'].join('');
  // The exempted string: this gate's own capability directory, exactly as the CI
  // manifest and OWN_FILES quote it. A gate that proves the identity is gone has
  // to be able to say its own name.
  assert.deepEqual(
    findSemanticPlatformIdentity(
      `run: ['node', 'scripts/verticals/${retired}-identity-zero-gate/index.mjs'],`,
      'ci-gates.manifest.mjs',
    ).filter(({ rule }) => rule === 'source-route'),
    [],
  );

  // Everything else under the same parents is still a vertical id and still fails.
  for (const planted of [
    `verticals/${retired}`,
    `verticals/${retired}/overview`,
    `verticals/${retired}-dark`,
    `verticals/${retired}-identity`,
    `brand-themes/${retired}/index.ts`,
    `demos/${retired}`,
  ]) {
    assert.ok(
      findSemanticPlatformIdentity(planted, 'planted.ts').some(({ rule }) => rule === 'source-route'),
      `the exemption must not shelter ${planted}`,
    );
  }
});

test('excludes only the gate files at their exact repository paths, not matching basenames', () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const core = findPackageRoot(here);
  assert.equal(isExcludedPlatformZeroPath(join(here, 'index.mjs')), true);
  // A same-named file anywhere else is NOT excluded: the exclusion is the exact
  // repository path of this capability, never a basename.
  assert.equal(
    isExcludedPlatformZeroPath(join(core, 'src/platform-identity-zero-gate/index.mjs')),
    false,
  );
  assert.equal(isExcludedPlatformZeroPath(join(core, 'src/index.mjs')), false);
});

test('rejects identity modifiers in fields and every root identity attribute', () => {
  const findings = findSemanticPlatformIdentity([
    `tenantSlug: 'platform-preview'`,
    `[data-tenant='platform.preview'] {}`,
    `[data-vertical=platform-dark] {}`,
    `[data-theme="platform/light"] {}`,
  ].join('\n'), 'modifiers.ts');
  assert.deepEqual(
    findings.map(({ rule }) => rule).sort(),
    ['identity-field', 'profile-id', 'root-selector', 'root-selector', 'root-selector'].sort(),
  );
});
