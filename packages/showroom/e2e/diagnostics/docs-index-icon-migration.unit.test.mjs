import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SHOWROOM_ROOT = path.resolve(HERE, '../..');
const REPO_ROOT = path.resolve(SHOWROOM_ROOT, '../..');

/** The ten docs index pages that form the RET-01 P2 write set. */
const PAGES = [
  'src/app/(docs)/patterns/page.tsx',
  'src/app/(docs)/structures/page.tsx',
  'src/app/(docs)/primitives/page.tsx',
  'src/app/(docs)/surfaces/page.tsx',
  'src/app/(docs)/foundations/page.tsx',
  'src/app/(docs)/foundations/tokens/page.tsx',
  'src/app/(docs)/playground/page.tsx',
  'src/app/(docs)/developers/page.tsx',
  'src/app/(docs)/developers/getting-started/page.tsx',
  'src/app/(docs)/developers/architecture/page.tsx',
];

/**
 * Vendor-named glyph bindings retired from the icons door. Every one of the
 * ten docs index pages must be free of all of them; the first-day board on
 * the developers hub migrated to the governed `workflow.step` role.
 */
const RETIRED = [
  'ActivityIcon', 'AlertCircleIcon', 'ArrowLeftIcon', 'BarChart3Icon',
  'BracesIcon', 'Building2Icon', 'CreditCardIcon', 'EditIcon', 'EyeIcon',
  'FileTextIcon', 'GitCompareIcon', 'LayersIcon', 'LayoutDashboardIcon',
  'LayoutGridIcon', 'LayoutTemplateIcon', 'LoaderCircleIcon',
  'MessageSquareIcon', 'PaletteIcon', 'PanelRightCloseIcon', 'RocketIcon',
  'ScanSearchIcon', 'SettingsIcon', 'SparklesIcon', 'UsersRoundIcon', 'ZapIcon',
];

/** Editorial record keys that must survive the migration unchanged. */
const EDITORIAL_KEYS = [
  ['src/app/(docs)/patterns/page.tsx', 'PATTERN_EDITORIAL', ['data', 'forms', 'visualization', 'communication', 'workflow', 'navigation', 'feedback', 'commerce', 'customization', 'identity', 'shell']],
  ['src/app/(docs)/structures/page.tsx', 'STRUCTURE_EDITORIAL', ['headers', 'workspace', 'record', 'dashboard', 'feedback', 'shell']],
  ['src/app/(docs)/primitives/page.tsx', 'CATEGORY_EDITORIAL', ['display', 'inputs', 'feedback', 'layout', 'navigation', 'overlay']],
  ['src/app/(docs)/surfaces/page.tsx', 'SURFACE_EDITORIAL', ['admin', 'data', 'experience', 'forms', 'operations', 'workspace']],
];

/** Routes that must survive the migration unchanged. */
const ROUTES = [
  ['src/app/(docs)/patterns/page.tsx', ['/patterns/data', '/patterns/forms', '/patterns/visualization', '/patterns/workflow', '/patterns/visualization/charts']],
  ['src/app/(docs)/foundations/page.tsx', ['/foundations/tokens', '/foundations/themes', '/foundations/engines', '/foundations/icons']],
  ['src/app/(docs)/foundations/tokens/page.tsx', ['/foundations/tokens/colors', '/foundations/tokens/spacing', '/foundations/tokens/typography', '/foundations/tokens/motion']],
  ['src/app/(docs)/playground/page.tsx', ['/playground/theme-builder', '/foundations/engines', '/foundations/themes']],
  ['src/app/(docs)/developers/page.tsx', ['/developers/getting-started', '/developers/architecture', '/playground']],
  ['src/app/(docs)/developers/getting-started/page.tsx', ['/developers', '/developers/architecture', '/playground', '/playground/theme-builder']],
  ['src/app/(docs)/developers/architecture/page.tsx', ['/developers']],
];

const sources = new Map(PAGES.map((p) => [p, readFileSync(path.join(SHOWROOM_ROOT, p), 'utf8')]));

const corpusManifest = JSON.parse(
  readFileSync(path.join(REPO_ROOT, 'packages/core/src/graphics/icons/semantic/sources/corpus/manifest.json'), 'utf8'),
);
const manifestIds = new Set(corpusManifest.entries.map((entry) => entry.id));
const generatedCorpus = readFileSync(
  path.join(REPO_ROOT, 'packages/core/src/graphics/icons/semantic/generated/corpus/index.ts'),
  'utf8',
);

function iconTags(source) {
  return [...source.matchAll(/<Icon\b[^>]*>/g)].map((match) => match[0]);
}

test('all ten docs pages reject every retired vendor glyph', () => {
  for (const [page, source] of sources) {
    for (const name of RETIRED) {
      assert.ok(
        !new RegExp(`\\b${name}\\b`).test(source),
        `${page} still references retired glyph ${name}`,
      );
    }
  }
});

test('the first-day implementation board uses the workflow.step role', () => {
  const source = sources.get('src/app/(docs)/developers/page.tsx');
  assert.ok(
    source.includes('<Icon name="workflow.step" decorative size={18} />'),
    'developers hub first-day board must render the workflow.step semantic icon',
  );
  assert.ok(manifestIds.has('workflow.step'), 'workflow.step absent from the governed corpus manifest');
  assert.ok(
    generatedCorpus.includes('"workflow.step"'),
    'workflow.step absent from the generated corpus (would render null at runtime)',
  );
});

test('every semantic icon name resolves in the governed and generated corpus', () => {
  for (const [page, source] of sources) {
    for (const tag of iconTags(source)) {
      const name = tag.match(/name="([^"]+)"/)?.[1];
      assert.ok(name, `${page} has an <Icon> without a name: ${tag}`);
      assert.ok(manifestIds.has(name), `${page} uses "${name}", absent from the governed corpus manifest`);
      assert.ok(
        generatedCorpus.includes(`"${name}"`),
        `${page} uses "${name}", absent from the generated corpus (would render null at runtime)`,
      );
    }
  }
});

test('every migrated icon is explicitly decorative', () => {
  for (const [page, source] of sources) {
    const tags = iconTags(source);
    assert.ok(tags.length > 0, `${page} has no <Icon> usages; migration regressed`);
    for (const tag of tags) {
      assert.ok(
        /\bdecorative\b/.test(tag),
        `${page} has an <Icon> without explicit decorative intent: ${tag}`,
      );
    }
  }
});

test('editorial category keys and navigation routes stayed intact', () => {
  for (const [page, declaration, keys] of EDITORIAL_KEYS) {
    const source = sources.get(page);
    assert.ok(source.includes(`${declaration}:`), `${page} lost ${declaration}`);
    for (const key of keys) {
      assert.ok(
        new RegExp(`^\\s{2}${key}: \\{`, 'm').test(source),
        `${page} lost the "${key}" entry of ${declaration}`,
      );
    }
  }
  const areaTitles = ['Tokens', 'Themes', 'Engines', 'Icons'];
  for (const title of areaTitles) {
    assert.ok(
      sources.get('src/app/(docs)/foundations/page.tsx').includes(`title: '${title}'`),
      `foundations page lost the "${title}" track`,
    );
  }
  for (const [page, routes] of ROUTES) {
    for (const route of routes) {
      assert.ok(sources.get(page).includes(route), `${page} lost route ${route}`);
    }
  }
});
