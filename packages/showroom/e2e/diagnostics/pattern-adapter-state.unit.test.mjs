import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SHOWROOM_ROOT = path.resolve(HERE, '../..');

const FIXTURES = path.join(
  SHOWROOM_ROOT,
  'src/app/(docs)/patterns/[group]/[pattern]/pattern-preview-fixtures.tsx',
);
const ROUTE = path.join(
  SHOWROOM_ROOT,
  'src/app/(docs)/patterns/[group]/[pattern]/pattern-preview.tsx',
);
const REGISTRY = path.join(SHOWROOM_ROOT, 'src/data/registry/patterns.ts');
const NAVIGATION = path.join(SHOWROOM_ROOT, 'src/data/navigation.ts');
const ALLOWLIST = path.join(SHOWROOM_ROOT, 'scripts/design-cards/no-fixture-allowlist.json');

/** A pattern preview has three states, and only one of them may claim to be a
 *  rendering of the real DS export.
 *
 *  The bug this pins: `pending` had no representation. A slug with no truthful
 *  payload still returned a ReactNode, so every consumer treated it as live --
 *  the docs route framed it in live-runtime chrome, and the design-card
 *  harvester counted six placeholders as valid cards. Nothing failed, because
 *  nothing was asked.
 *
 *  So the roster is governed here. A seventh pending cannot appear quietly, a
 *  pending cannot name a pattern that does not exist, a pending cannot keep a
 *  stale live fixture, and no placeholder may be written inline where the
 *  declaration cannot see it. */

const EXPECTED_PENDING = [
  'branding-preview-sandbox',
  'decision-panorama',
  'feature-workspace-frame',
  'tenant-preview',
  'token-inspector',
  'virtual-list',
];

/** The single navigation route under `/patterns/<group>/<slug>` that is not a
 *  component family: the charts index, which fans out to its own 18 chart
 *  pages rather than documenting one export. It is named as one value, not a
 *  list, so it cannot quietly grow back into an allowlist. */
const NON_FAMILY_PATTERN_ROUTE = 'visualization/charts';

function assertNoDuplicates(pairs, label) {
  const seen = new Set();
  const duplicates = [];
  for (const pair of pairs) {
    if (seen.has(pair)) duplicates.push(pair);
    seen.add(pair);
  }
  assert.deepEqual(duplicates, [], `${label} names the same group/slug twice`);
}

/** `terminator` differs by construct: an object literal closes on `\n};`, a
 *  function declaration on a bare `\n}` at column zero. */
function readBlock(source, opener, file, terminator = '\n};') {
  const start = source.indexOf(opener);
  assert.ok(start !== -1, `${opener} not found in ${file}`);
  const end = source.indexOf(terminator, start);
  assert.ok(end !== -1, `unterminated block for ${opener} in ${file}`);
  return source.slice(start, end);
}

function topLevelKeys(block) {
  // Entries are written at exactly one indent level inside the object literal;
  // nested object keys sit deeper and must not be collected as slugs.
  return [...block.matchAll(/^ {2}'?([a-zA-Z][a-zA-Z0-9-]*)'?:/gm)].map((match) => match[1]);
}

const fixturesSource = readFileSync(FIXTURES, 'utf8');
const pendingBlock = readBlock(fixturesSource, 'export const PATTERN_ADAPTER_PENDING', FIXTURES);
const previewsBlock = readBlock(
  fixturesSource,
  'const PATTERN_PREVIEWS: Record<string, ReactNode> = {',
  FIXTURES,
);
const pendingSlugs = topLevelKeys(pendingBlock);
const liveSlugs = topLevelKeys(previewsBlock);

test('every registered pattern has exactly one declared state', () => {
  // This doubles as the parse guard. Without it a bad block slice makes the
  // checks below pass by finding nothing: an empty PATTERN_PREVIEWS trivially
  // contains no inline placeholder and trivially overlaps no pending slug.
  //
  // It is also the real invariant. `live` and `pending` currently partition
  // the registry exactly, so a pattern can neither lose its preview silently
  // nor be published with no state at all.
  assert.ok(liveSlugs.includes('data-table'), 'a known live preview is missing from the parse');

  const registry = readFileSync(REGISTRY, 'utf8');
  const registered = [
    ...registry.matchAll(/\{\s*slug:\s*'([a-z0-9-]+)',\s*name:\s*'[^']*'/g),
  ].map((match) => match[1]);

  const stated = new Set([...liveSlugs, ...pendingSlugs]);
  const unstated = registered.filter((slug) => !stated.has(slug));
  assert.deepEqual(unstated, [], 'registered pattern with neither a live preview nor a declaration');
  assert.equal(
    liveSlugs.length + pendingSlugs.length,
    registered.length,
    `${liveSlugs.length} live + ${pendingSlugs.length} pending should cover ${registered.length} registered patterns`,
  );
});

test('the pending roster is exactly the governed set', () => {
  assert.deepEqual(
    [...pendingSlugs].sort(),
    EXPECTED_PENDING,
    'a pending preview was added or removed without adjudication',
  );
});

test('every pending slug is a real registered pattern', () => {
  const registry = readFileSync(REGISTRY, 'utf8');
  const registered = new Set(
    [...registry.matchAll(/\{\s*slug:\s*'([a-z0-9-]+)'/g)].map((match) => match[1]),
  );
  for (const slug of pendingSlugs) {
    assert.ok(registered.has(slug), `pending "${slug}" is not in the pattern registry`);
  }
});

test('a pending slug keeps no live fixture', () => {
  // Otherwise `getPatternAdapterState` resolves pending while a stale preview
  // sits one lookup away, and the next refactor silently promotes it back.
  const overlap = pendingSlugs.filter((slug) => liveSlugs.includes(slug));
  assert.deepEqual(overlap, [], 'slug is declared pending and still has a PATTERN_PREVIEWS entry');
});

test('placeholders exist only as declarations', () => {
  // An inline <HonestMigrationNote> inside PATTERN_PREVIEWS is a placeholder
  // the adapter-state model cannot see -- exactly the shape that made six of
  // these read as rendered previews.
  assert.ok(
    !previewsBlock.includes('HonestMigrationNote'),
    'PATTERN_PREVIEWS contains an inline placeholder; declare it in PATTERN_ADAPTER_PENDING instead',
  );
});

test('renderPatternPreview refuses to return a pending node', () => {
  const body = readBlock(fixturesSource, 'export function renderPatternPreview', FIXTURES, '\n}');
  assert.match(
    body,
    /if \(PATTERN_ADAPTER_PENDING\[slug\]\) return null;/,
    'renderPatternPreview must return null for pending slugs so consumers stay honest by default',
  );
});

test('the docs route gates live chrome on the declared state', () => {
  const route = readFileSync(ROUTE, 'utf8');
  assert.match(
    route,
    /const state = getPatternAdapterState\(slug\);/,
    'pattern-preview.tsx must read the declared adapter state',
  );
  assert.match(
    route,
    /if \(state !== 'live'\) \{/,
    'only a live adapter may reach the live-runtime chrome',
  );
});

test('no pending copy claims the component renders', () => {
  // The whole point of the state is to stop asserting render parity for a
  // placeholder, so the words that assert it are refused in the copy.
  const forbidden = /\b(rendered here|renders here|live preview of|is rendered)\b/i;
  const titles = [...pendingBlock.matchAll(/title:\s*'([^']*)'/g)].map((m) => m[1]);
  const descriptions = [...pendingBlock.matchAll(/description:\s*\n?\s*'([^']*)'/g)].map(
    (m) => m[1],
  );
  assert.equal(titles.length, EXPECTED_PENDING.length, 'every pending entry needs a title');
  assert.equal(
    descriptions.length,
    EXPECTED_PENDING.length,
    'every pending entry needs a stated reason',
  );
  for (const copy of [...titles, ...descriptions]) {
    assert.ok(!forbidden.test(copy), `pending copy claims a rendering: "${copy}"`);
  }
});

test('the sidebar publishes exactly the registered pattern families', () => {
  // The bug this pins: `data/cell-renderers` kept a navigation leaf, and so a
  // route and a preview, after it was retired from the registry. It never
  // published a component -- the export is a record of render helpers -- so the
  // page advertised a family that does not exist. Nothing caught it, because
  // registry and navigation were two hand-maintained lists that no test
  // compared.
  //
  // Set equality, not counts: a count check passes when one family is dropped
  // and another invented in the same edit.
  const registrySource = readFileSync(REGISTRY, 'utf8');
  const registryPairs = [
    ...registrySource.matchAll(
      /\{\s*slug:\s*'([a-z0-9-]+)',\s*name:\s*'[^']*',\s*group:\s*'([a-z-]+)'/g,
    ),
  ].map((match) => `${match[2]}/${match[1]}`);

  const navigationSource = readFileSync(NAVIGATION, 'utf8');
  const navigationPairs = [
    ...navigationSource.matchAll(/path:\s*'\/patterns\/([a-z0-9-]+)\/([a-z0-9-]+)'/g),
  ].map((match) => `${match[1]}/${match[2]}`);

  // Non-vacuity guard. Either parse could stop matching after a formatting
  // change, and two empty collections compare equal without complaint.
  assert.ok(registryPairs.includes('data/data-table'), 'the registry parse found no known family');
  assert.ok(
    navigationPairs.includes('data/data-table'),
    'the navigation parse found no known family',
  );

  assertNoDuplicates(registryPairs, 'the pattern registry');
  assertNoDuplicates(navigationPairs, 'the pattern navigation');

  assert.deepEqual(
    [...navigationPairs].sort(),
    [...registryPairs, NON_FAMILY_PATTERN_ROUTE].sort(),
    'pattern navigation and the pattern registry disagree; a route without a registered family is false evidence',
  );
});

test('the design-card allowlist matches the pending roster exactly', () => {
  // The harvester counts any non-`data-missing` body as a valid card. Pending
  // slugs must therefore be allowlisted no-fixture, and nothing else may hide
  // in that list.
  const allowlist = JSON.parse(readFileSync(ALLOWLIST, 'utf8'));
  assert.deepEqual(
    [...(allowlist.slugs ?? [])].sort(),
    EXPECTED_PENDING,
    'design-card allowlist and PATTERN_ADAPTER_PENDING disagree',
  );
});
