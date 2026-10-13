/**
 * Canonical projection tests for the semantic icon registry.
 *
 * The showroom icon explorer is a READ VIEW of the public
 * `@rottay/design-system/icons` corpus. These tests are the honest corpus
 * validation that replaces the old "missing export / fallback glyph"
 * diagnostic: the projection is exhaustive, current, unique, partitioned
 * exactly once by corpus domain, searchable by real role/intent only, and
 * every displayed role renders an actual SVG through the public facade —
 * a null render is a failure here, never a silent fallback.
 *
 * Run: node --experimental-strip-types --no-warnings --test \
 *        src/data/registry/icons/tests/corpus-projection.unit.test.mjs
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  ICON_CORPUS,
  Icon,
  isIconName as isIconNamePublic,
} from '@rottay/design-system/icons';

import {
  buildIconSnippet,
  iconCategories,
  icons,
  iconsByCategory,
  isIconName,
} from '../index.ts';

const COUNTS_SOURCE_PATH = fileURLToPath(new URL('../../counts/index.ts', import.meta.url));
const NAVIGATION_SOURCE_PATH = fileURLToPath(new URL('../../../navigation/index.ts', import.meta.url));
const FOUNDATIONS_PAGE_PATH = fileURLToPath(
  new URL('../../../../app/(docs)/foundations/page.tsx', import.meta.url),
);

const SPOTLIGHT_NAMES = [
  'navigation.menu',
  'navigation.back',
  'navigation.forward',
  'action.add',
  'action.confirm',
  'action.download',
  'status.success',
  'status.warning',
  'status.loading',
];

function normalizeIconSearchValue(value) {
  return value.toLowerCase().replace(/icon$/g, '').replace(/[\s._-]+/g, '');
}

function renderIcon(name, props = {}) {
  return renderToStaticMarkup(createElement(Icon, { name, ...props }));
}

test('projection is exhaustive and current against the public corpus', () => {
  assert.equal(icons.length, ICON_CORPUS.length);
  assert.ok(icons.length > 0);

  const corpusNames = new Set(ICON_CORPUS.map((entry) => entry.name));
  const registryNames = new Set(icons.map((entry) => entry.name));

  for (const name of registryNames) {
    assert.ok(corpusNames.has(name), `registry name ${name} is not in the canonical corpus`);
  }
  for (const name of corpusNames) {
    assert.ok(registryNames.has(name), `corpus name ${name} is missing from the registry`);
  }
});

test('every projected role is a governed IconName; unknown names cannot enter', () => {
  for (const entry of icons) {
    assert.equal(isIconName(entry.name), true, `${entry.name} fails the shared fail-closed guard`);
    assert.equal(isIconNamePublic(entry.name), true, `${entry.name} fails the public guard`);
  }

  assert.equal(isIconName('navigation.teleport'), false);
  assert.equal(isIconName('ArrowLeftIcon'), false, 'named vendor glyphs are not semantic roles');
  assert.equal(isIconName(''), false);
  assert.equal(isIconName(undefined), false);
});

test('slugs are unique, stable, and derived from the semantic id', () => {
  const slugs = new Set();

  for (const entry of icons) {
    assert.equal(entry.slug, entry.name.replace(/\./g, '-'));
    assert.ok(!slugs.has(entry.slug), `duplicate slug ${entry.slug}`);
    slugs.add(entry.slug);
  }
});

test('domain grouping partitions the full corpus exactly once', () => {
  const grouped = Object.values(iconsByCategory).flat();
  assert.equal(grouped.length, icons.length);

  const seen = new Set();
  for (const entry of grouped) {
    assert.ok(!seen.has(entry.name), `${entry.name} appears in more than one category`);
    seen.add(entry.name);
  }

  const categorySum = iconCategories.reduce((sum, category) => sum + category.count, 0);
  assert.equal(categorySum, icons.length);

  for (const category of iconCategories) {
    const group = iconsByCategory[category.slug];
    assert.ok(group, `iconsByCategory is missing ${category.slug}`);
    assert.equal(group.length, category.count, `count drift for ${category.slug}`);
    for (const entry of group) {
      assert.equal(entry.category, category.slug, `${entry.name} grouped under the wrong domain`);
    }
  }
});

test('search aliases are derived from canonical metadata and real intents resolve', () => {
  for (const entry of icons) {
    assert.ok(entry.searchAlias.length > 0, `${entry.name} has an empty search alias`);
    assert.ok(
      entry.searchAlias.includes(entry.name),
      `${entry.name} search alias is not derived from canonical metadata`,
    );
    assert.ok(entry.intent.length > 0, `${entry.name} has no governed intent`);
  }

  const search = (query) => {
    const normalized = normalizeIconSearchValue(query);
    return icons.filter((entry) =>
      [
        entry.name,
        entry.slug,
        entry.searchAlias,
        entry.intent,
        entry.category,
      ].some((value) => normalizeIconSearchValue(value).includes(normalized))
    );
  };

  for (const name of ['navigation.menu', 'action.download', 'status.warning', 'layout.grid']) {
    const tail = name.split('.').pop();
    assert.ok(
      search(tail).some((entry) => entry.name === name),
      `searching the real role tail "${tail}" must find ${name}`,
    );
  }

  assert.ok(
    search('append').some((entry) => entry.name === 'action.add'),
    'intent text ("Create or append a new item.") must find action.add',
  );
  assert.equal(search('teleport').length, 0, 'invented names must resolve to nothing');
});

test('clipboard snippet uses the genuine public semantic API for every role', () => {
  for (const entry of icons) {
    const snippet = buildIconSnippet(entry.name);
    assert.equal(
      snippet,
      `import { Icon } from '@rottay/design-system/icons';\n\n<Icon name="${entry.name}" decorative />`,
    );
    assert.ok(!snippet.includes('IconIcon'), `${entry.name} snippet invents a component name`);
  }
});

test('every displayed role renders a real SVG through the public facade; none render null', () => {
  const failures = [];

  for (const entry of icons) {
    const html = renderIcon(entry.name, { decorative: true });
    if (!html.includes('<svg')) {
      failures.push(entry.name);
    } else {
      assert.ok(
        html.includes('aria-hidden'),
        `${entry.name} decorative render must be explicitly aria-hidden`,
      );
    }
  }

  assert.deepEqual(failures, [], `roles that failed to render an SVG: ${failures.join(', ')}`);
});

test('labeled renders carry an accessible name; decorative renders do not', () => {
  const labeled = renderIcon('action.search', { label: 'Search' });
  assert.ok(labeled.includes('<svg'));
  assert.ok(
    labeled.includes('aria-label') || labeled.includes('<title'),
    'labeled render must expose an accessible name',
  );

  const decorative = renderIcon('action.search', { decorative: true });
  assert.ok(decorative.includes('aria-hidden'));
});

test('spotlight groups resolve to real corpus roles and render SVGs', () => {
  const corpusNames = new Set(icons.map((entry) => entry.name));

  for (const name of SPOTLIGHT_NAMES) {
    assert.ok(corpusNames.has(name), `spotlight name ${name} is not a governed role`);
    const html = renderIcon(name, { decorative: true });
    assert.ok(html.includes('<svg'), `spotlight role ${name} did not render an SVG`);
  }
});

test('DOC_COUNTS stays a live projection of the registry, never a seeded number', () => {
  const source = readFileSync(COUNTS_SOURCE_PATH, 'utf8');
  assert.ok(
    source.includes('icons: icons.length'),
    'counts must derive the icon count from the registry at module load',
  );
  assert.ok(!/icons:\s*\d+/.test(source), 'counts must not carry a hand-seeded icon number');
});

test('adjacent consumer labels derive from the projection, never hardcoded counts', () => {
  const navigationSource = readFileSync(NAVIGATION_SOURCE_PATH, 'utf8');
  const iconsNavEntry = navigationSource
    .split('\n')
    .find((line) => line.includes("path: '/foundations/icons'"));
  assert.ok(iconsNavEntry, 'the icons nav entry must exist');
  const badgeTemplate = iconsNavEntry.match(/badge: `([^`]+)`/);
  assert.ok(badgeTemplate, 'the icons nav badge must be a template derived from the registry');
  assert.equal(badgeTemplate[1], '${icons.length}');
  assert.equal(
    `${icons.length}`,
    `${ICON_CORPUS.length}`,
    'the rendered badge value must equal the current corpus size',
  );
  assert.ok(
    !/badge: '\d+'/.test(iconsNavEntry),
    'the icons nav badge must not carry a hardcoded number',
  );

  const foundationsSource = readFileSync(FOUNDATIONS_PAGE_PATH, 'utf8');
  assert.ok(
    /badge: `\$\{ICON_TOTAL\} semantic roles`/.test(foundationsSource),
    'the icons card badge must describe the complete projection as semantic roles',
  );
  assert.ok(
    /const ICON_TOTAL = iconCategories\.reduce\(/.test(foundationsSource),
    'ICON_TOTAL must derive from the registry categories',
  );
  assert.equal(
    iconCategories.reduce((sum, category) => sum + category.count, 0),
    icons.length,
    'the rendered badge total must equal the projected corpus size',
  );
  assert.ok(
    /metric: `\$\{iconCategories\.length\} corpus domains`/.test(foundationsSource),
    'the icons card metric must derive the domain count from the registry',
  );
  assert.equal(
    new Set(icons.map((entry) => entry.category)).size,
    iconCategories.length,
    'the rendered domain count must equal the projected domain count',
  );
  assert.ok(
    !foundationsSource.includes('semantic buckets'),
    'stale hand-counted bucket labels must not return',
  );
  assert.ok(
    !foundationsSource.includes('curated assets'),
    'stale curated-asset labels must not return',
  );
});
