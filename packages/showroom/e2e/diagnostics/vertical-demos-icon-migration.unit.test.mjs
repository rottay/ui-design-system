import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SHOWROOM_ROOT = path.resolve(HERE, '../..');
const REPO_ROOT = path.resolve(SHOWROOM_ROOT, '../..');

/**
 * RET-01 P3 write set: retired vendor glyph imports under the verticals routes
 * and the demo components. The sweep is closed for the whole packet: every
 * retired glyph, including the Check-ins thumbnail, is gone from all 15 files.
 */
const PAGES = [
  'src/app/(docs)/verticals/page.tsx',
  'src/app/(docs)/verticals/evnto/page.tsx',
  'src/app/(docs)/verticals/rottay/page.tsx',
  'src/app/(docs)/verticals/bithire/page.tsx',
  'src/app/(docs)/verticals/vertical-category-appendix.tsx',
  'src/app/(docs)/verticals/evnto/[category]/page.tsx',
  'src/app/(docs)/verticals/rottay/[category]/page.tsx',
  'src/app/(docs)/verticals/bithire/[category]/page.tsx',
  'src/components/demos/evnto/event-dashboard/index.tsx',
  'src/components/demos/evnto/ticket-builder/index.tsx',
  'src/components/demos/bithire/recruiter-dashboard/index.tsx',
  'src/components/demos/bithire/scorecard/index.tsx',
  'src/components/demos/rottay/dashboard/index.tsx',
  'src/components/demos/rottay/tenant-form/index.tsx',
  'src/components/demos/rottay/user-list/index.tsx',
];

const RETIRED = [
  'ActivityIcon', 'BarChart3Icon', 'BellIcon', 'BriefcaseIcon', 'Building2Icon',
  'CalendarIcon', 'CheckCircleIcon', 'CheckIcon', 'ChevronLeftIcon', 'ClockIcon',
  'EditIcon', 'FlagIcon', 'LockIcon', 'SettingsIcon', 'ShieldIcon', 'SparklesIcon',
  'StarIcon', 'Trash2Icon', 'TrendingUpIcon', 'UserCheckIcon', 'UsersIcon', 'ZapIcon',
];

/** Exact adjudicated render sites: file -> [expected icon tags]. */
const MAPPED_SITES = {
  'src/app/(docs)/verticals/page.tsx': [
    '<Icon name="navigation.settings" decorative size={26} />',
    '<Icon name="bithire.job" decorative size={26} />',
    '<Icon name="ai.sparkles" decorative size={26} />',
  ],
  'src/app/(docs)/verticals/evnto/page.tsx': [
    '<Icon name="time.schedule" decorative size={20} />',
    '<Icon name="location.place" decorative size={20} />',
    '<Icon name="status.featured" decorative size={20} />',
    '<Icon name="navigation.settings" decorative size={20} />',
    '<Icon name="entity.group" decorative size={20} />',
    '<Icon name="data.chart" decorative size={20} />',
    '<Icon name="status.instant" decorative size={20} />',
    '<Icon name="analytics.activity" decorative size={20} />',
  ],
  'src/app/(docs)/verticals/rottay/page.tsx': [
    '<Icon name="entity.group" decorative size={20} />',
    '<Icon name="entity.organization" decorative size={20} />',
    '<Icon name="security.protection" decorative size={20} />',
    '<Icon name="security.protection" decorative size={20} />',
    '<Icon name="status.priority" decorative size={20} />',
    '<Icon name="navigation.settings" decorative size={20} />',
    '<Icon name="communication.notification" decorative size={20} />',
  ],
  'src/app/(docs)/verticals/bithire/page.tsx': [
    '<Icon name="bithire.pipeline" decorative size={20} />',
    '<Icon name="entity.group" decorative size={20} />',
    '<Icon name="ai.sparkles" decorative size={20} />',
    '<Icon name="security.protection" decorative size={20} />',
    '<Icon name="analytics.bar" decorative size={20} />',
    '<Icon name="entity.group" decorative size={20} />',
    '<Icon name="navigation.settings" decorative size={20} />',
  ],
  'src/app/(docs)/verticals/vertical-category-appendix.tsx': [
    '<Icon name="navigation.back" decorative size={16} />',
  ],
  'src/app/(docs)/verticals/evnto/[category]/page.tsx': [
    '<Icon name="navigation.back" decorative size={16} />',
  ],
  'src/app/(docs)/verticals/rottay/[category]/page.tsx': [
    '<Icon name="navigation.back" decorative size={16} />',
  ],
  'src/app/(docs)/verticals/bithire/[category]/page.tsx': [
    '<Icon name="navigation.back" decorative size={16} />',
  ],
  'src/components/demos/evnto/event-dashboard/index.tsx': [
    '<Icon name="time.schedule" decorative size={20} />',
    '<Icon name="data.trend" decorative size={20} />',
    '<Icon name="entity.person" decorative size={20} />',
    '<Icon name="status.featured" decorative size={20} />',
  ],
  'src/components/demos/evnto/ticket-builder/index.tsx': [
    '<Icon name="status.featured" decorative size={18} />',
    '<Icon name="ai.sparkles" decorative size={18} />',
    '<Icon name="action.confirm" decorative size={18} />',
    '<Icon name="status.featured" decorative size={18} />',
  ],
  'src/components/demos/bithire/recruiter-dashboard/index.tsx': [
    '<Icon name="bithire.job" decorative size={20} />',
    '<Icon name="entity.group" decorative size={20} />',
    '<Icon name="time.timestamp" decorative size={20} />',
    '<Icon name="status.success" decorative size={20} />',
  ],
  'src/components/demos/bithire/scorecard/index.tsx': [
    '<Icon name="status.featured" decorative size={22} />',
  ],
  'src/components/demos/rottay/dashboard/index.tsx': [
    '<Icon name="entity.organization" decorative size={18} />',
    '<Icon name="entity.group" decorative size={18} />',
    '<Icon name="security.protection" decorative size={18} />',
    '<Icon name="operations.health" decorative size={18} />',
  ],
  'src/components/demos/rottay/tenant-form/index.tsx': [
    '<Icon name="security.protection" decorative size={18} />',
    '<Icon name="navigation.settings" decorative size={18} />',
    '<Icon name="ai.sparkles" decorative size={18} />',
    '<Icon name="entity.organization" decorative size={18} />',
  ],
  'src/components/demos/rottay/user-list/index.tsx': [
    '<Icon name="action.edit" decorative size={14} />',
    '<Icon name="security.protection" decorative size={14} />',
    '<Icon name="action.delete" decorative size={14} />',
  ],
};

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

test('every write-set file is free of retired vendor glyph imports', () => {
  for (const [page, source] of sources) {
    for (const name of RETIRED) {
      assert.ok(
        !new RegExp(`\\b${name}\\b`).test(source),
        `${page} still references retired glyph ${name}`,
      );
    }
  }
});

test('check-ins KPI is a decorative people-count thumbnail on entity.person', () => {
  const source = sources.get('src/components/demos/evnto/event-dashboard/index.tsx');
  const checkIns = source.match(/label: 'Check-ins',[\s\S]*?\},/)?.[0] ?? '';
  assert.match(checkIns, /<Icon name="entity\.person" decorative size=\{20\} \/>/);
  assert.match(checkIns, /value: '1,890'/, 'check-ins count must be preserved');
  assert.match(checkIns, /sub: 'current throughput'/, 'check-ins throughput context must be preserved');
  assert.match(checkIns, /trend: '80\.7%'/, 'check-ins trend must be preserved');
  assert.ok(manifestIds.has('entity.person'), 'entity.person absent from the governed corpus manifest');
  assert.ok(
    generatedCorpus.includes('"entity.person"'),
    'entity.person absent from the generated corpus (would render null at runtime)',
  );
  assert.doesNotMatch(source, /status\.verified|commerce\.checkout/, 'the thumbnail must not pose as verification or checkout semantics');
});

test('every adjudicated render site matches the approved mapping exactly', () => {
  for (const [page, expected] of Object.entries(MAPPED_SITES)) {
    const source = sources.get(page);
    for (const tag of expected) {
      assert.ok(source.includes(tag), `${page} lost its expected render site: ${tag}`);
    }
    assert.equal(
      iconTags(source).length,
      expected.length,
      `${page} icon site count drifted (expected ${expected.length})`,
    );
  }
});

test('every semantic icon name resolves in the governed and generated corpus', () => {
  const allTags = Object.values(MAPPED_SITES).flat();
  assert.ok(new Set(allTags).size >= 19, 'expected at least 19 distinct migrated render sites');
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

test('every migrated icon keeps an explicit numeric size and accessibility intent', () => {
  for (const [page, source] of sources) {
    for (const tag of iconTags(source)) {
      assert.match(tag, /decorative|label=/, `${page} has an icon without explicit accessibility: ${tag}`);
      assert.match(tag, /size=\{\d+\}/, `${page} has an icon without its numeric size: ${tag}`);
    }
  }
});

test('back links keep their visible label text and use the logical navigation.back role', () => {
  const appendix = sources.get('src/app/(docs)/verticals/vertical-category-appendix.tsx');
  assert.match(appendix, /<Icon name="navigation\.back" decorative size=\{16\} \/>/);
  assert.match(appendix, /\{backLabel\}/, 'appendix back link lost its visible label');
  for (const [page, backText] of [
    ['src/app/(docs)/verticals/evnto/[category]/page.tsx', 'Back to Evnto'],
    ['src/app/(docs)/verticals/rottay/[category]/page.tsx', 'Back to Rottay'],
    ['src/app/(docs)/verticals/bithire/[category]/page.tsx', 'Back to BitHire'],
  ]) {
    const source = sources.get(page);
    assert.match(source, /<Icon name="navigation\.back" decorative size=\{16\} \/>/);
    assert.ok(source.includes(backText), `${page} lost its visible back label`);
    assert.match(source, /<Link href="\/verticals\//, `${page} back link lost its route`);
  }
  const backEntry = corpusManifest.entries.find((entry) => entry.id === 'navigation.back');
  assert.equal(backEntry.autoMirror, true, 'navigation.back must mirror logically in RTL');
});

test('row action buttons keep their aria labels and decorative icons', () => {
  const source = sources.get('src/components/demos/rottay/user-list/index.tsx');
  for (const [label, name] of [
    ['Edit ${row.name}', 'action.edit'],
    ['Review ${row.name}', 'security.protection'],
    ['Delete ${row.name}', 'action.delete'],
  ]) {
    assert.ok(source.includes(`aria-label={\`${label}\`}`), `user list lost aria-label ${label}`);
    assert.ok(source.includes(`name="${name}"`), `user list lost ${name}`);
  }
});

test('rating stars are native toggle buttons with an accessible name and selected state', () => {
  const source = sources.get('src/components/demos/bithire/scorecard/index.tsx');
  assert.match(source, /<Box\s+as="button"\s+type="button"/);
  assert.match(source, /aria-label=\{`Rate \$\{star\} out of 5`\}/);
  assert.match(source, /aria-pressed=\{star <= value\}/);
  assert.match(source, /<Icon name="status\.featured" decorative size=\{22\} \/>/);
  assert.doesNotMatch(source, /onKeyDown|onKeyUp|onKeyPress/, 'native button semantics must not grow manual key handlers');
  assert.match(source, /onClick=\{\(\) => onChange\(star\)\}/, 'rating callback must be preserved');
  assert.match(source, /onMouseEnter=\{\(\) => setHovered\(star\)\}/, 'rating hover preview must be preserved');
  assert.match(source, /onChange: \(rating: number\)/, 'rating onChange contract must be preserved');
});
