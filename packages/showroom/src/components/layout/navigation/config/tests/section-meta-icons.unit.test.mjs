import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { getIconCorpusEntry, isIconName } from '@rottay/design-system/icons';

// Contract under test: the layout chrome renders only the semantic Icon
// facade, every section icon is a governed corpus name (never an invented
// role), and every render site is explicitly decorative or explicitly named.

const configDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const layoutDir = path.resolve(configDir, '..', '..');

const CONFIG_SOURCE = readFileSync(path.join(configDir, 'index.ts'), 'utf8');
const CONSUMER_SOURCES = Object.fromEntries(
  ['sidebar', 'header', 'search', 'footer', 'shell', 'state-toast'].map((name) => [
    name,
    readFileSync(path.join(layoutDir, name, 'index.tsx'), 'utf8'),
  ]),
);
const ALL_SOURCES = { config: CONFIG_SOURCE, ...CONSUMER_SOURCES };

const RETIRED_GLYPHS = [
  'BracesIcon', 'GlobeIcon', 'HomeIcon', 'LayersIcon', 'LayoutGridIcon',
  'LayoutTemplateIcon', 'RocketIcon', 'SettingsIcon', 'SparklesIcon',
  'ChevronDownIcon', 'ChevronRightIcon', 'ExternalLinkIcon', 'SearchIcon',
  'XIcon', 'MenuIcon', 'ArrowUpRightIcon', 'CheckCircleIcon',
];

const SECTION_ICON_NAMES = {
  showroom: 'navigation.home',
  foundations: 'layout.hierarchy',
  primitives: 'layout.grid',
  patterns: 'workflow.template',
  structures: 'content.code',
  surfaces: 'ai.sparkles',
  verticals: 'location.global',
  playground: 'action.play',
  developers: 'navigation.settings',
};

function iconRenderSites(source) {
  return source.match(/<Icon[\s\S]*?\/>/g) ?? [];
}

test('section metadata names are the approved meanings and resolve via the public canonical registry', () => {
  const declared = Object.fromEntries(
    [...CONFIG_SOURCE.matchAll(/^\s{2}(\w+): \{[\s\S]*?iconName: '([a-z0-9.-]+)',/gm)]
      .map((match) => [match[1], match[2]]),
  );

  assert.deepEqual(declared, SECTION_ICON_NAMES);
  for (const name of Object.values(declared)) {
    assert.equal(isIconName(name), true, `"${name}" is not in the canonical icon corpus`);
    assert.ok(getIconCorpusEntry(name).intent.length > 0);
  }
});

test('section metadata no longer stores component icons', () => {
  assert.doesNotMatch(CONFIG_SOURCE, /\bicon:\s/);
  assert.doesNotMatch(CONFIG_SOURCE, /ComponentType/);
});

test('every section consumer renders the facade from iconName, not the legacy component field', () => {
  assert.match(CONSUMER_SOURCES.header, /name=\{presentation\.sectionMeta\.iconName\}/);
  assert.match(CONSUMER_SOURCES.shell, /name=\{sectionMeta\.iconName\}/);
  assert.match(CONSUMER_SOURCES.shell, /name=\{route\.sectionMeta\.iconName\}/);
  assert.match(CONSUMER_SOURCES.sidebar, /name=\{meta\.iconName\}/);

  for (const [name, source] of Object.entries(CONSUMER_SOURCES)) {
    assert.doesNotMatch(source, /sectionMeta\.icon\b/, `${name} still reads the legacy icon field`);
    assert.match(
      source,
      /import \{ Icon \} from "@rottay\/design-system\/icons";/,
      `${name} does not import the semantic facade`,
    );
  }
});

test('every icon render site declares explicit accessibility and keeps its size', () => {
  const expectedSiteCounts = { sidebar: 7, header: 4, search: 3, footer: 1, shell: 3, stateToast: 1 };

  for (const [name, source] of Object.entries(CONSUMER_SOURCES)) {
    const key = name === 'state-toast' ? 'stateToast' : name;
    const sites = iconRenderSites(source);
    assert.equal(sites.length, expectedSiteCounts[key], `${name} icon site count drifted`);
    for (const site of sites) {
      assert.match(site, /decorative|label=/, `${name} has an icon without explicit accessibility: ${site}`);
      assert.match(site, /size=\{/, `${name} has an icon without its numeric size: ${site}`);
    }
  }
});

test('sidebar disclosure affordances follow the actual expanded state', () => {
  const { sidebar } = CONSUMER_SOURCES;
  const isOpenSite = sidebar.match(/<Icon[\s\S]*?isOpen[\s\S]*?\/>/);
  const isExpandedSite = sidebar.match(/<Icon[\s\S]*?isExpanded[\s\S]*?\/>/);

  assert.ok(isOpenSite, 'NavNode disclosure render site missing');
  assert.ok(isExpandedSite, 'section disclosure render site missing');
  assert.match(isOpenSite[0], /"navigation\.collapse"\s*:\s*"navigation\.expand"/);
  assert.match(isExpandedSite[0], /"navigation\.collapse"\s*:\s*"navigation\.expand"/);
  assert.match(isOpenSite[0], /decorative/, 'aria-labeled trigger keeps its icon decorative');
  assert.match(isExpandedSite[0], /label=/, 'unnamed trigger gains its accessible name from the icon');
});

test('internal navigation never poses as an external-open role', () => {
  assert.match(CONSUMER_SOURCES.header, /<Icon name="navigation\.forward" decorative size=\{12\} \/>/);
  assert.match(CONSUMER_SOURCES.search, /<Icon name="navigation\.forward" decorative size=\{14\} \/>/);
  assert.match(CONSUMER_SOURCES.sidebar, /<Icon name="navigation\.forward" decorative size=\{12\} \/>/);
  assert.doesNotMatch(CONSUMER_SOURCES.sidebar, /action\.open-external/, 'sidebar has no external links');

  assert.match(CONSUMER_SOURCES.footer, /link\.href\.startsWith\("http"\)/, 'footer external gate removed');
  assert.match(CONSUMER_SOURCES.footer, /<Icon name="action\.open-external" decorative size=\{11\} \/>/);
});

test('direct glyph mappings stay on the approved semantic roles', () => {
  const { header, search, footer, stateToast } = {
    header: CONSUMER_SOURCES.header,
    search: CONSUMER_SOURCES.search,
    footer: CONSUMER_SOURCES.footer,
    stateToast: CONSUMER_SOURCES['state-toast'],
  };

  assert.match(header, /<Icon name="navigation\.menu" decorative size=\{16\} \/>/);
  assert.match(header, /<Icon name="action\.search" decorative size=\{16\} \/>/);
  assert.match(search, /<Icon name="action\.search" decorative size=\{18\} \/>/);
  assert.match(search, /<Icon name="ai\.sparkles" decorative size=\{16\} \/>/);
  assert.match(footer, /action\.open-external/);
  assert.match(stateToast, /<Icon name="status\.success" decorative size=\{16\} \/>/);
  assert.match(CONSUMER_SOURCES.sidebar, /<Icon name="action\.close" label="Close navigation" size=\{15\} \/>/);
  assert.match(CONSUMER_SOURCES.sidebar, /<Icon name="navigation\.home" decorative size=\{14\} \/>/);
  assert.match(CONSUMER_SOURCES.shell, /<Icon name="action\.search" decorative size=\{14\} \/>/);
});

test('retired vendor glyph imports are gone from the whole packet', () => {
  for (const glyph of RETIRED_GLYPHS) {
    for (const [name, source] of Object.entries(ALL_SOURCES)) {
      assert.ok(!source.includes(glyph), `${name} still references retired glyph ${glyph}`);
    }
  }
});
