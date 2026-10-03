import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SHOWROOM_ROOT = path.resolve(HERE, '../..');
const REPO_ROOT = path.resolve(SHOWROOM_ROOT, '../..');

/**
 * RET-01 P5 write set: the whitelabel divergence surface's app-owned sidebar
 * chrome (the four NAV glyphs). The surface is a verification harness: the
 * compiled TenantThemeArtifact stays the single visual owner (CMP-02), so
 * this migration swaps ONLY the icon import and the four JSX tags — every
 * artifact root/anatomy projection, probe payload and sider geometry fact
 * must remain byte-identical.
 */
const SURFACE = 'src/components/divergence-surface/index.tsx';

/** The four vendor glyphs this surface retired. */
const RETIRED = ['BarChart3Icon', 'BriefcaseIcon', 'SettingsIcon', 'UsersIcon'];

/** Exact adjudicated render sites, governed by the actual NAV label. */
const NAV_LABEL_TO_ICON = [
  ['Pipeline', 'bithire.pipeline'],
  ['Candidates', 'bithire.candidate'],
  ['Analytics', 'data.chart'],
  ['Settings', 'navigation.settings'],
];

const EXPECTED_TAGS = NAV_LABEL_TO_ICON.map(
  ([, name]) => `<Icon name="${name}" decorative size={18} />`,
);

const source = readFileSync(path.join(SHOWROOM_ROOT, SURFACE), 'utf8');

const corpusManifest = JSON.parse(
  readFileSync(path.join(REPO_ROOT, 'packages/core/src/graphics/icons/semantic/sources/corpus/manifest.json'), 'utf8'),
);
const manifestIds = new Set(corpusManifest.entries.map((entry) => entry.id));
const generatedCorpus = readFileSync(
  path.join(REPO_ROOT, 'packages/core/src/graphics/icons/semantic/generated/corpus/index.ts'),
  'utf8',
);

function iconTags(sourceText) {
  return [...sourceText.matchAll(/<Icon\b[^>]*>/g)].map((match) => match[0]);
}

test('the divergence surface is free of retired vendor glyph references', () => {
  for (const name of RETIRED) {
    assert.ok(
      !new RegExp(`\\b${name}\\b`).test(source),
      `${SURFACE} still references retired glyph ${name}`,
    );
  }
  assert.ok(!/from '@rottay\/design-system\/icons'/.test(source.split("import { Icon } from '@rottay/design-system/icons';").join('')), 'residual icons-door import beyond the Icon facade');
});

test('the four NAV render sites match the governed mapping exactly', () => {
  const tags = iconTags(source);
  assert.deepEqual(tags, EXPECTED_TAGS, `${SURFACE} NAV icon tags drifted`);
  for (const [label, name] of NAV_LABEL_TO_ICON) {
    assert.ok(
      source.includes(`label: '${label}', icon: <Icon name="${name}" decorative size={18} />`),
      `${SURFACE} lost its ${label} -> ${name} nav binding`,
    );
  }
});

test('every migrated icon name resolves in the governed and generated corpus', () => {
  for (const tag of iconTags(source)) {
    const name = tag.match(/name="([^"]+)"/)?.[1];
    assert.ok(name, `${SURFACE} has an <Icon> without a name: ${tag}`);
    assert.ok(manifestIds.has(name), `${SURFACE} uses "${name}", absent from the governed corpus manifest`);
    assert.ok(
      generatedCorpus.includes(`"${name}"`),
      `${SURFACE} uses "${name}", absent from the generated corpus (would render null at runtime)`,
    );
  }
  assert.equal(iconTags(source).length, 4, `${SURFACE} must render exactly the four NAV icons`);
});

test('every migrated icon keeps an explicit numeric size and decorative accessibility intent', () => {
  for (const tag of iconTags(source)) {
    assert.match(tag, /decorative/, `${SURFACE} has an icon without decorative semantics: ${tag}`);
    assert.match(tag, /size=\{18\}/, `${SURFACE} has an icon without its size-18 constant: ${tag}`);
  }
});

test('artifact wiring, probe payload and sidebar geometry are untouched by the migration', () => {
  // Scope root spreads the artifact's own root/anatomy projections (CMP-02).
  assert.match(source, /\{\.\.\.rootAttributes\}/);
  assert.match(source, /\{\.\.\.anatomyAttributes\}/);
  assert.match(source, /tenantThemeArtifactRootAttributes\(artifact\)/);
  assert.match(source, /tenantThemeAnatomyAttributes\(artifact\)/);
  assert.match(source, /data-testid="divergence-root"/);
  assert.match(source, /colorScheme: `var\(--ds-color-scheme, \$\{ground\}\)`/);
  // Machine probe payload under DIVERGENCE_PROBE_KEY.
  assert.match(source, /export const DIVERGENCE_PROBE_KEY = '__divergenceProbe';/);
  for (const fact of ['slug', 'digest', 'compilerVersion', 'adjustments', 'anatomy', 'variables']) {
    assert.ok(source.includes(fact), `${SURFACE} probe payload lost the ${fact} fact`);
  }
  assert.match(source, /data-testid="divergence-primary-swatch"/);
  // Sidebar typed geometry driven by the anatomy contract, sizes unchanged.
  assert.match(source, /rail: 76/);
  assert.match(source, /panel: 264/);
  assert.match(source, /default: 264/);
  assert.match(source, /<Layout\.Sider\s+width=\{siderWidth\}/);
  assert.match(source, /anatomyAttributes\['data-anatomy-sidebar'\] \?\? 'default'/);
  assert.match(source, /padding: isRail \? '16px 8px' : '16px 12px'/);
  assert.match(source, /padding: isRail \? '10px 0' : '8px 10px'/);
  // Non-icon render sites and their style values are unchanged.
  for (const testid of [
    'divergence-logo',
    'divergence-title',
    'divergence-primary-button',
    'divergence-route-list',
  ]) {
    assert.ok(source.includes(`data-testid="${testid}"`), `${SURFACE} lost ${testid}`);
  }
  assert.match(source, /\{route === 'dashboard' && <RecruiterDashboardDemo \/>\}/);
  assert.match(source, /\{route === 'list' && <PipelineListRoute \/>\}/);
  assert.match(source, /\{route === 'detail' && <ScorecardDemo \/>\}/);
  // The sidebar nav keeps its governed labels beside each decorative icon.
  for (const [label] of NAV_LABEL_TO_ICON) {
    assert.ok(source.includes(`{item.label}`) && source.includes(`label: '${label}'`), `${SURFACE} lost the ${label} nav label`);
  }
});
