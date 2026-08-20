/**
 * Planted-violation drills for the canonical taxonomy parity gate.
 *
 * WHY THIS FILE IS BLOCKING SEPARATELY FROM THE GATE. The gate is now itself
 * `blocking: true` in `ci-gates.manifest.mjs`, green on the real tree, with the
 * original 72 layer/identity violations resolved and the `public` binding it
 * gained afterwards fail-closed. That does not make these drills redundant --
 * it makes them the reason the green is worth anything. A gate passing on the
 * real tree is indistinguishable from a gate that stopped detecting, and only
 * a planted defect can tell the two apart.
 *
 * These drills run against synthetic fixtures instead of the repository, so
 * they neither depend on the live inventory nor go red when it changes. They
 * fail the moment the gate stops catching a category of violation.
 *
 * Every drill plants ONE defect into an otherwise clean fixture. The first
 * test proves the clean fixture reports nothing, which is what makes the rest
 * evidence: without it, a gate that always failed would pass every drill.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { createRootPublicResolver } from '../../lib/taxonomy/root-public-resolver/index.mjs';
import {
  auditTaxonomyParity,
  normalizeFamilySlug,
  parseShowroomRegistry,
  CANONICAL_LAYERS,
} from './index.mjs';

const UI_ROOT = 'packages/core/src/ui';

/**
 * A minimal but structurally faithful world: two primitive families in one
 * category, each a real folder with an index, mirrored in the manifest index,
 * the per-family cells and the Showroom registry.
 */
function buildCleanFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'taxonomy-parity-'));
  const programRoot = path.join(root, 'program');
  // The manifest lives beside the programme, not inside it (it graduated to the
  // package root), so the fixture models it as its own planted tree.
  const manifestRoot = path.join(root, 'manifest');
  const registryRoot = path.join(root, 'registry');

  const rows = [
    {
      id: 'primitive/display/avatar',
      layer: 'primitive',
      category: 'display',
      family: 'Avatar',
      sourceOwner: `${UI_ROOT}/primitives/display/Avatar`,
      resolvedBy: 'folder-slug',
      components: ['Avatar'],
    },
    {
      id: 'primitive/display/badge',
      layer: 'primitive',
      category: 'display',
      family: 'Badge',
      sourceOwner: `${UI_ROOT}/primitives/display/Badge`,
      resolvedBy: 'folder-slug',
      components: ['Badge'],
    },
  ];

  // The public binding reads real source through a real barrel, so the fixture
  // has to be a real (tiny) package rather than a set of empty files.
  for (const row of rows) {
    const owner = path.join(root, row.sourceOwner);
    fs.mkdirSync(owner, { recursive: true });
    fs.writeFileSync(
      path.join(owner, 'index.tsx'),
      `export const ${row.family} = () => null;\n`,
    );
  }

  const entryDir = path.join(root, 'packages/core/src');
  fs.mkdirSync(entryDir, { recursive: true });
  fs.writeFileSync(
    path.join(entryDir, 'index.ts'),
    rows.map((row) => `export * from '../../../${row.sourceOwner}';\n`).join(''),
  );

  // Both roots are planted explicitly: the manifest no longer lives inside the
  // programme folder, so creating one no longer creates the other.
  fs.mkdirSync(programRoot, { recursive: true });
  fs.mkdirSync(path.join(manifestRoot, 'families/primitive/display'), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(programRoot, 'family-inventory.json'),
    JSON.stringify({ denominator: rows.length, rows }, null, 2),
  );
  fs.writeFileSync(
    path.join(manifestRoot, 'index.json'),
    JSON.stringify(
      { families: rows.map((row) => ({ familyId: row.id, path: `manifest/families/${row.id}.json` })) },
      null,
      2,
    ),
  );
  for (const row of rows) {
    fs.writeFileSync(
      path.join(manifestRoot, `families/${row.id}.json`),
      JSON.stringify({ familyId: row.id }, null, 2),
    );
  }

  fs.mkdirSync(registryRoot, { recursive: true });
  writeRegistry(registryRoot, ['avatar', 'badge']);

  return { root, programRoot, manifestRoot, registryRoot };
}

/**
 * Writes a Showroom primitives registry. An item may be a bare slug -- which
 * produces the entry the clean fixture expects, PascalCase name under the
 * `display` category -- or a record, so a drill can plant exactly one wrong
 * field without hand-writing the whole literal.
 */
function writeRegistry(registryRoot, items) {
  const pascal = (slug) => slug.replace(/(^|-)([a-z])/g, (_, __, letter) => letter.toUpperCase());
  const entries = items
    .map((item) => (typeof item === 'string' ? { slug: item } : item))
    .map(({ slug, name = pascal(slug), category = 'display' }) =>
      `  { slug: '${slug}', name: '${name}', category: '${category}' },`,
    )
    .join('\n');
  fs.writeFileSync(
    path.join(registryRoot, 'primitives.ts'),
    `export const primitives = [\n${entries}\n];\n`,
  );
}

function audit(fixture) {
  return auditTaxonomyParity({
    repositoryRoot: fixture.root,
    programRoot: fixture.programRoot,
    manifestRoot: fixture.manifestRoot,
    showroomRegistryRoot: fixture.registryRoot,
    // The fixture models one tier, so it declares one registry. The real run
    // takes the default and checks all five.
    registries: [{ file: 'primitives.ts', layers: ['primitive'] }],
    rootEntryFile: path.join(fixture.root, 'packages/core/src/index.ts'),
  });
}

/** Absolute path to a file inside a fixture family folder. */
function ownerFile(fixture, family, name) {
  return path.join(fixture.root, `${UI_ROOT}/primitives/display/${family}`, name);
}

/** The fixture's package-root barrel. */
function entryFile(fixture) {
  return path.join(fixture.root, 'packages/core/src/index.ts');
}

/**
 * What the fixture's root barrel actually publishes, asked of the resolver
 * directly rather than through the gate. `aliases: []` stops the resolver
 * walking out of the temp directory and picking up the real repository's
 * tsconfig paths.
 */
function publishedNames(fixture) {
  const resolver = createRootPublicResolver({ entryFile: entryFile(fixture), aliases: [] });
  return { resolver, names: [...resolver.enumerate().keys()].sort() };
}

function mutateInventory(fixture, mutate) {
  const file = path.join(fixture.programRoot, 'family-inventory.json');
  const inventory = JSON.parse(fs.readFileSync(file, 'utf8'));
  mutate(inventory);
  fs.writeFileSync(file, JSON.stringify(inventory, null, 2));
}

function kinds(result) {
  return result.violations.map((violation) => violation.kind);
}

/**
 * Registry files parsed on the real showroom are only meaningful if a
 * registry with zero component entries is itself refused; otherwise a
 * registry that stopped parsing would read as "everything present".
 */
test('an empty registry is a finding, not a free pass', () => {
  const fixture = buildCleanFixture();
  writeRegistry(fixture.registryRoot, []);
  fs.writeFileSync(path.join(fixture.registryRoot, 'primitives.ts'), 'export const primitives = [];\n');
  const result = audit(fixture);
  assert.ok(
    result.violations.some((violation) => /parsed to zero entries/.test(violation.detail)),
    'a registry that parses to nothing must fail',
  );
});

test('the clean fixture reports no violations', () => {
  const fixture = buildCleanFixture();
  const result = audit(fixture);
  assert.deepEqual(result.violations, [], 'clean fixture must be silent');
  assert.equal(result.rowCount, 2);
});

test('a planted forbidden layer fails', () => {
  for (const layer of ['commercial', 'surface-composition', 'composition', 'misc']) {
    const fixture = buildCleanFixture();
    mutateInventory(fixture, (inventory) => {
      inventory.rows[0].layer = layer;
    });
    const result = audit(fixture);
    assert.ok(
      kinds(result).includes('forbidden-layer'),
      `layer "${layer}" must be refused`,
    );
  }
});

test('a planted unknown layer fails even when it is not on the refused list', () => {
  const fixture = buildCleanFixture();
  mutateInventory(fixture, (inventory) => {
    inventory.rows[0].layer = 'widget';
  });
  const result = audit(fixture);
  assert.ok(kinds(result).includes('forbidden-layer'));
  assert.ok(
    result.violations.some((violation) => /not one of the five canonical layers/.test(violation.detail)),
  );
});

test('every canonical layer is accepted', () => {
  for (const layer of CANONICAL_LAYERS) {
    const fixture = buildCleanFixture();
    mutateInventory(fixture, (inventory) => {
      inventory.rows[0].layer = layer;
    });
    const result = audit(fixture);
    assert.ok(
      !kinds(result).includes('forbidden-layer'),
      `layer "${layer}" is canonical and must be accepted`,
    );
  }
});

test('a planted category that restates its layer fails', () => {
  const fixture = buildCleanFixture();
  mutateInventory(fixture, (inventory) => {
    inventory.rows[0].id = 'primitive/primitive/avatar';
  });
  assert.ok(kinds(audit(fixture)).includes('duplicated-segment'));
});

// Regression guard. The first revision compared every adjacent id segment, so
// `primitive/layout/layout` -- a component genuinely named `Layout` in the
// `layout` category -- was reported as a defect. A slug matching its category
// is a naming coincidence; only a category restating its LAYER smuggles a tier.
test('a slug that matches its own category is not a duplicated segment', () => {
  const fixture = buildCleanFixture();
  mutateInventory(fixture, (inventory) => {
    inventory.rows[0].id = 'primitive/layout/layout';
    inventory.rows[0].category = 'layout';
  });
  assert.ok(
    !kinds(audit(fixture)).includes('duplicated-segment'),
    'a slug equal to its category must not be reported',
  );
});

test('a planted duplicate id fails', () => {
  const fixture = buildCleanFixture();
  mutateInventory(fixture, (inventory) => {
    inventory.rows[1].id = inventory.rows[0].id;
  });
  assert.ok(kinds(audit(fixture)).includes('duplicate-identity'));
});

test('a planted duplicate family name fails', () => {
  const fixture = buildCleanFixture();
  mutateInventory(fixture, (inventory) => {
    inventory.rows[1].family = inventory.rows[0].family;
  });
  const result = audit(fixture);
  assert.ok(
    result.violations.some((violation) => /claims 2 rows/.test(violation.detail)),
    'one component must not inflate the denominator through two rows',
  );
});

test('a planted unowned component folder fails', () => {
  const fixture = buildCleanFixture();
  const intruder = path.join(fixture.root, UI_ROOT, 'primitives/display/Ghost');
  fs.mkdirSync(intruder, { recursive: true });
  fs.writeFileSync(path.join(intruder, 'index.tsx'), 'export {};\n');
  const result = audit(fixture);
  assert.ok(kinds(result).includes('unowned-folder'));
  assert.ok(result.violations.some((violation) => /Ghost/.test(violation.detail)));
});

test('a support folder beside families is not reported as unowned', () => {
  const fixture = buildCleanFixture();
  for (const name of ['tests', 'engines', 'contracts']) {
    const support = path.join(fixture.root, UI_ROOT, 'primitives/display', name);
    fs.mkdirSync(support, { recursive: true });
    fs.writeFileSync(path.join(support, 'index.tsx'), 'export {};\n');
  }
  assert.deepEqual(audit(fixture).violations, [], 'support owners are not families');
});

test('a planted ghost sourceOwner fails', () => {
  const fixture = buildCleanFixture();
  mutateInventory(fixture, (inventory) => {
    inventory.rows[0].sourceOwner = `${UI_ROOT}/primitives/display/Vanished`;
  });
  const result = audit(fixture);
  assert.ok(kinds(result).includes('source-binding'));
  assert.ok(result.violations.some((violation) => /does not exist/.test(violation.detail)));
});

test('a sourceOwner outside the UI tree fails', () => {
  const fixture = buildCleanFixture();
  mutateInventory(fixture, (inventory) => {
    inventory.rows[0].sourceOwner = 'packages/core/src/foundation/tokens';
  });
  assert.ok(kinds(audit(fixture)).includes('source-binding'));
});

test('a manifest cell without an inventory row fails', () => {
  const fixture = buildCleanFixture();
  fs.writeFileSync(
    path.join(fixture.manifestRoot, 'families/primitive/display/orphan.json'),
    JSON.stringify({ familyId: 'primitive/display/orphan' }),
  );
  const result = audit(fixture);
  assert.ok(kinds(result).includes('manifest-parity'));
  assert.ok(result.violations.some((violation) => /orphan/.test(violation.detail)));
});

test('an inventory row without a manifest cell fails', () => {
  const fixture = buildCleanFixture();
  fs.rmSync(path.join(fixture.manifestRoot, 'families/primitive/display/badge.json'));
  const result = audit(fixture);
  assert.ok(
    result.violations.some((violation) => /has no manifest\/families cell/.test(violation.detail)),
  );
});

test('a family missing from the manifest index fails', () => {
  const fixture = buildCleanFixture();
  const indexPath = path.join(fixture.manifestRoot, 'index.json');
  const manifest = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  manifest.families = manifest.families.slice(0, 1);
  fs.writeFileSync(indexPath, JSON.stringify(manifest, null, 2));
  const result = audit(fixture);
  assert.ok(
    result.violations.some((violation) => /has no manifest family/.test(violation.detail)),
  );
});

test('showroom drift fails in both directions', () => {
  const missing = buildCleanFixture();
  writeRegistry(missing.registryRoot, ['avatar']);
  assert.ok(
    audit(missing).violations.some((violation) => /has no entry in primitives\.ts/.test(violation.detail)),
    'a family absent from the Showroom must fail',
  );

  const extra = buildCleanFixture();
  writeRegistry(extra.registryRoot, ['avatar', 'badge', 'phantom']);
  assert.ok(
    audit(extra).violations.some((violation) => /resolves to no family row/.test(violation.detail)),
    'a Showroom entry with no family must fail',
  );
});

test('slug normalization crosses the declared conventions and nothing more', () => {
  // The two conventions the registries actually use.
  assert.equal(normalizeFamilySlug('pattern-data-table'), normalizeFamilySlug('data-table'));
  assert.equal(normalizeFamilySlug('scatter-chart'), normalizeFamilySlug('scatter'));
  assert.equal(normalizeFamilySlug('bar-chart'), normalizeFamilySlug('bar-chart'));
  // Distinct families must stay distinct: stripping `map` as well would fuse
  // these two, which is why the normalizer deliberately does not.
  assert.notEqual(normalizeFamilySlug('heat-map'), normalizeFamilySlug('map-view'));
  assert.notEqual(normalizeFamilySlug('avatar'), normalizeFamilySlug('badge'));
});

test('the registry parser ignores navigation group tables', () => {
  // Regression guard. Matching a bare `slug:` swept in `patternGroups`
  // entries and reported every navigation category as an unresolved family.
  const source = [
    "export const patterns = [",
    "  { slug: 'data-table', name: 'DataTable', group: 'data' },",
    '];',
    'export const patternGroups: { slug: PatternGroup; label: string }[] = [',
    "  { slug: 'data', label: 'Data', count: data.length },",
    '];',
  ].join('\n');
  assert.deepEqual(parseShowroomRegistry(source), [
    { slug: 'data-table', name: 'DataTable', group: 'data' },
  ]);
});

test('a registry that publishes a family under the wrong name is reported', () => {
  // The real finding this exists for: `page-shell` shipped as `PageShell`
  // while the family, the source and the package root all say
  // `PatternPageShell`. The slug matched, so slug-only parity stayed silent.
  const fixture = buildCleanFixture();
  writeRegistry(fixture.registryRoot, [{ slug: 'avatar', name: 'UserAvatar' }, 'badge']);
  assert.deepEqual(kinds(audit(fixture)), ['showroom-name-parity']);
});

test('a registry that files a family under the wrong group is reported', () => {
  const fixture = buildCleanFixture();
  writeRegistry(fixture.registryRoot, [{ slug: 'avatar', category: 'feedback' }, 'badge']);
  assert.deepEqual(kinds(audit(fixture)), ['showroom-group-parity']);
});

test('a registry entry with no group key is reported, never skipped', () => {
  // Fail-closed: an unparseable group must not read as agreement.
  const fixture = buildCleanFixture();
  fs.writeFileSync(
    path.join(fixture.registryRoot, 'primitives.ts'),
    [
      'export const primitives = [',
      "  { slug: 'avatar', name: 'Avatar' },",
      "  { slug: 'badge', name: 'Badge', category: 'display' },",
      '];',
      '',
    ].join('\n'),
  );
  assert.deepEqual(kinds(audit(fixture)), ['showroom-parity']);
});

test('the registry parser does not count a commented-out entry as live', () => {
  // A commented-out family read as registered, so a component could vanish
  // from the Showroom while parity still reported agreement.
  const source = [
    'export const patterns = [',
    "  { slug: 'data-table', name: 'DataTable', group: 'data' },",
    "  // { slug: 'kanban-board', name: 'KanbanBoard', group: 'data' },",
    '  /* { slug: \'gantt\', name: \'Gantt\', group: \'data\' }, */',
    '];',
  ].join('\n');
  assert.deepEqual(
    parseShowroomRegistry(source).map((entry) => entry.slug),
    ['data-table'],
  );
});

test('comment stripping does not truncate an entry whose description contains a URL', () => {
  // `//` inside a string is not a comment. A naive strip cut the literal here
  // and silently dropped every entry after it.
  const source = [
    'export const patterns = [',
    "  { slug: 'data-table', name: 'DataTable', group: 'data', description: 'see https://rottay.com/docs' },",
    "  { slug: 'kanban-board', name: 'KanbanBoard', group: 'data' },",
    '];',
  ].join('\n');
  assert.deepEqual(
    parseShowroomRegistry(source).map((entry) => entry.slug),
    ['data-table', 'kanban-board'],
  );
});

// --- public reachability -----------------------------------------------
// Every one of these is modelled on a defect the binding actually found in the
// real inventory, so a regression that stops computing reachability from source
// fails here instead of reporting agreement.

test('a declared component that is only a type fails', () => {
  // The real `pattern/data/cell-renderers` shape: the row declared
  // `CellRenderers`, which is `export type CellRenderers = typeof cellRenderers`.
  // It self-certified RESOLVED_SOURCE_AND_PUBLIC_EXPORT and three of the four
  // bindings agreed, because none of them read the source.
  const fixture = buildCleanFixture();
  fs.writeFileSync(
    path.join(fixture.root, `${UI_ROOT}/primitives/display/Avatar/index.tsx`),
    'const avatar = {};\nexport type Avatar = typeof avatar;\n',
  );
  const { violations } = audit(fixture);
  const found = violations.filter((violation) => violation.kind === 'public-binding');
  assert.equal(found.length, 1);
  assert.match(found[0].detail, /declares "Avatar".*TYPE_ONLY/s);
});

test('a declared component that resolves into another row territory fails', () => {
  // The real `primitive/navigation/link` shape: the row declared `Link`, but the
  // root's `Link` is Typography's compound. The navigation primitive is
  // published as `NavLink`, so the row named a component it does not own.
  const fixture = buildCleanFixture();
  // `Emblem` is declared inside the Badge family's folder, so it is genuinely
  // public and unambiguous -- it simply is not Avatar's to claim.
  fs.appendFileSync(
    path.join(fixture.root, `${UI_ROOT}/primitives/display/Badge/index.tsx`),
    'export const Emblem = () => null;\n',
  );
  mutateInventory(fixture, (inventory) => {
    inventory.rows[0].components = ['Avatar', 'Emblem'];
  });
  const { violations } = audit(fixture);
  const found = violations.filter((violation) => violation.kind === 'public-binding');
  assert.equal(found.length, 1);
  assert.match(found[0].detail, /declares "Emblem".*belongs to primitive\/display\/badge/s);
  assert.match(found[0].detail, /not inside this row's sourceOwner/);
});

test('a declared component the root never exports fails', () => {
  const fixture = buildCleanFixture();
  mutateInventory(fixture, (inventory) => {
    inventory.rows[0].components = ['Avatar', 'AvatarNeverExported'];
  });
  const { violations } = audit(fixture);
  assert.ok(
    violations.some(
      (violation) =>
        violation.kind === 'public-binding' && /AvatarNeverExported.*MISSING/s.test(violation.detail),
    ),
    'expected the unexported declaration to be reported as MISSING',
  );
});

test('a public component no row owns fails as unowned', () => {
  // The reverse direction: the forward pass alone cannot see a whole component
  // that the catalog simply never mentions.
  const fixture = buildCleanFixture();
  const stray = path.join(fixture.root, `${UI_ROOT}/primitives/display/Stray`);
  fs.mkdirSync(stray, { recursive: true });
  fs.writeFileSync(path.join(stray, 'index.tsx'), 'export const StrayWidget = () => null;\n');
  fs.appendFileSync(
    path.join(fixture.root, 'packages/core/src/index.ts'),
    `export * from '../../../${UI_ROOT}/primitives/display/Stray';\n`,
  );
  const { violations } = audit(fixture);
  assert.ok(
    violations.some(
      (violation) => violation.kind === 'public-unowned' && /StrayWidget/.test(violation.detail),
    ),
    'expected the unowned public component to be reported',
  );
});

test('hooks and non-component values are not reported as unowned components', () => {
  // The reverse projection must not turn every public value into a finding --
  // an over-eager shape test is how a real signal gets buried in noise.
  const fixture = buildCleanFixture();
  const support = path.join(fixture.root, `${UI_ROOT}/primitives/display/Support`);
  fs.mkdirSync(support, { recursive: true });
  fs.writeFileSync(
    path.join(support, 'index.tsx'),
    [
      'export const useThing = () => null;',
      'export const helperValue = 3;',
      'export type ThingProps = { a: string };',
      'export const FROZEN = Object.freeze({ a: 1 });',
    ].join('\n'),
  );
  fs.appendFileSync(
    path.join(fixture.root, 'packages/core/src/index.ts'),
    `export * from '../../../${UI_ROOT}/primitives/display/Support';\n`,
  );
  const { violations } = audit(fixture);
  assert.deepEqual(
    violations.filter((violation) => violation.kind === 'public-unowned'),
    [],
  );
});

// --- resolver drills: the four ways a public name can have no terminal ------
//
// WHY THESE ARE HERE AND NOT ONLY IN THE RESOLVER'S OWN TESTS. The reverse
// projection used to open with `if (resolution.state !== 'VALUE') continue`, so
// a name the resolver refused to follow was skipped rather than reported --
// and skipping is indistinguishable from agreement in the gate's output. It
// printed `OK` while 21 root exports behind an in-flight
// `widget-board/runtime/solver` rename resolved to nothing at all. Each drill
// below therefore drives the GATE, not the resolver in isolation: an honest
// world must stay silent, and the planted defect must come back named.
//
// The fixtures are synthetic temp directories on purpose. Pointing a drill at a
// real source path would make it rot the next time a lane moves that folder,
// which is how a drill quietly stops proving anything.

/**
 * Two barrels that re-export each other. `terminal` is appended to the second,
 * so the same ring can be built with a real declaration inside it or with
 * nothing behind the name at all.
 */
function writeReExportRing(fixture, terminal) {
  fs.writeFileSync(ownerFile(fixture, 'Avatar', 'index.tsx'), "export { Avatar } from './ring-a';\n");
  fs.writeFileSync(ownerFile(fixture, 'Avatar', 'ring-a.tsx'), "export * from './ring-b';\n");
  fs.writeFileSync(ownerFile(fixture, 'Avatar', 'ring-b.tsx'), `export * from './ring-a';\n${terminal}`);
}

test('drill (a): a default-export alias chain is followed through every hop', () => {
  // `export { default as X } from './y'` is the one re-export form that changes
  // the name AND the kind of the binding at once, so a resolver that stops
  // early here reports a component as unreachable, or -- worse -- attributes it
  // to the intermediate barrel's folder and therefore to the wrong row.
  const fixture = buildCleanFixture();
  fs.writeFileSync(ownerFile(fixture, 'Avatar', 'index.tsx'), "export { Avatar } from './hop-a';\n");
  fs.writeFileSync(
    ownerFile(fixture, 'Avatar', 'hop-a.tsx'),
    "export { default as Avatar } from './hop-b';\n",
  );
  fs.writeFileSync(
    ownerFile(fixture, 'Avatar', 'hop-b.tsx'),
    'export default function Avatar() { return null; }\n',
  );

  assert.deepEqual(audit(fixture).violations, [], 'a resolvable chain is not a finding');

  // Silence is not enough: prove the chain landed on the declaration and not on
  // one of the two barrels it passed through.
  const resolution = publishedNames(fixture).resolver.resolve('Avatar');
  assert.equal(resolution.state, 'VALUE');
  assert.equal(path.basename(resolution.terminal.file), 'hop-b.tsx');
  assert.equal(resolution.terminal.declKind, 'function');

  // Planted negative: the last hop stops default-exporting, which is what a
  // half-landed `export default` -> named-export refactor leaves behind.
  fs.writeFileSync(
    ownerFile(fixture, 'Avatar', 'hop-b.tsx'),
    'export function Avatar() { return null; }\n',
  );
  const broken = audit(fixture);
  assert.ok(
    broken.violations.some(
      (violation) =>
        violation.kind === 'public-unresolved' && /"Avatar".*no default export/s.test(violation.detail),
    ),
    'a chain that reaches no declaration must be reported by name',
  );
  // Both directions see it -- the row that declares the name, and the barrel
  // that publishes it. They ask different questions, so both speak.
  assert.ok(kinds(broken).includes('public-binding'));
});

test('drill (b): a re-export cycle with nothing behind it is reported CYCLE_ONLY', () => {
  // Control first. A cycle is not itself a defect -- two barrels may legally
  // re-export each other as long as something in the ring declares the name.
  // Without this half, the drill below would only prove the gate dislikes
  // cycles, not that it detects an absent declaration.
  const legal = buildCleanFixture();
  writeReExportRing(legal, 'export const Avatar = () => null;\n');
  assert.deepEqual(audit(legal).violations, [], 'a cycle with a real terminal is legal');

  // Planted negative: the same ring, now with no declaration anywhere in it.
  // `Avatar` is still exported from the package root and still imports cleanly
  // to a reader of the barrel; nothing can render it.
  const empty = buildCleanFixture();
  writeReExportRing(empty, '');
  const result = audit(empty);
  assert.ok(
    result.violations.some(
      (violation) =>
        violation.kind === 'public-cycle-only' && /"Avatar".*CYCLE_ONLY/s.test(violation.detail),
    ),
    'a name reachable only through a re-export cycle must be reported',
  );
});

test('drill (c): a namespace re-export publishes the namespace, never its children', () => {
  // `export * as NS from './m'` publishes ONE binding. Treating `m`'s exports
  // as root exports is the single most common way an audit convinces itself a
  // symbol is public when no consumer can import it -- it would inflate the
  // reverse projection with children that owe no row and cannot be imported.
  const fixture = buildCleanFixture();
  const kit = path.join(fixture.root, `${UI_ROOT}/primitives/foundation/kit`);
  fs.mkdirSync(kit, { recursive: true });
  fs.writeFileSync(path.join(kit, 'index.tsx'), 'export const KitPart = () => null;\n');
  fs.appendFileSync(
    entryFile(fixture),
    `export * as AvatarKit from '../../../${UI_ROOT}/primitives/foundation/kit';\n`,
  );

  const { resolver, names } = publishedNames(fixture);
  assert.deepEqual(names, ['Avatar', 'AvatarKit', 'Badge'], 'the namespace is one published name');
  assert.equal(resolver.resolve('KitPart').state, 'MISSING', 'a namespace child is not a root export');
  assert.deepEqual(audit(fixture).violations, [], 'and it owes no family row');

  // Planted negative: publish the same module's children for real. The only
  // edit is `* as AvatarKit` -> `*`, so what changes is exactly the namespace
  // semantics -- and now `KitPart` IS a public component that no row owns.
  const barrel = fs.readFileSync(entryFile(fixture), 'utf8');
  fs.writeFileSync(entryFile(fixture), barrel.replace('export * as AvatarKit from', 'export * from'));
  assert.deepEqual([...publishedNames(fixture).names], ['Avatar', 'Badge', 'KitPart']);
  assert.ok(
    audit(fixture).violations.some(
      (violation) => violation.kind === 'public-unowned' && /KitPart/.test(violation.detail),
    ),
    'a genuinely star-exported child must be reported -- which is what makes the assertion above real',
  );
});

test('drill (d): one name star-exported from two declarations is reported AMBIGUOUS', () => {
  // Control: ONE declaration reached through two star paths. Aliases and
  // compatibility paths do this constantly and must stay legal -- CLAUDE.md
  // requires them to "resolve to the same row".
  const shared = buildCleanFixture();
  fs.writeFileSync(ownerFile(shared, 'Avatar', 'widget.tsx'), 'export const Widget = () => null;\n');
  fs.appendFileSync(ownerFile(shared, 'Avatar', 'index.tsx'), "export * from './widget';\n");
  fs.appendFileSync(ownerFile(shared, 'Badge', 'index.tsx'), "export * from '../Avatar/widget';\n");
  assert.deepEqual(audit(shared).violations, [], 'two paths to one declaration are not ambiguous');

  // Planted negative: two DIFFERENT declarations under one name. Which one a
  // consumer gets depends on the order the star exports are resolved in, so
  // the catalog cannot say which row owns it -- and the old `continue` skipped
  // it precisely because it has no single terminal file.
  const forked = buildCleanFixture();
  for (const family of ['Avatar', 'Badge']) {
    fs.writeFileSync(ownerFile(forked, family, 'widget.tsx'), 'export const Widget = () => null;\n');
    fs.appendFileSync(ownerFile(forked, family, 'index.tsx'), "export * from './widget';\n");
  }
  const result = audit(forked);
  assert.deepEqual(kinds(result), ['public-ambiguous']);
  assert.match(result.violations[0].detail, /"Widget".*AMBIGUOUS/s);
  // The message names both candidate declarations; a bare state would leave the
  // reader with nowhere to start.
  assert.match(result.violations[0].detail, /Avatar\/widget\.tsx \| .*Badge\/widget\.tsx/);
});

test('drill (e): a root export whose target declares nothing is reported MISSING', () => {
  // The remaining non-VALUE state, and the cheapest one to create: a barrel
  // that still advertises a name after the declaration behind it moved away.
  const fixture = buildCleanFixture();
  fs.appendFileSync(
    entryFile(fixture),
    `export { Vanished } from '../../../${UI_ROOT}/primitives/display/Avatar';\n`,
  );
  const result = audit(fixture);
  assert.deepEqual(kinds(result), ['public-missing']);
  assert.match(result.violations[0].detail, /"Vanished".*MISSING/s);
});

test('an Object.assign compound component is recognised as a component', () => {
  // 36 public exports use `Object.assign(Base, { Slot })`, Button among them.
  // Reading those as non-components is the dangerous direction: a real public
  // component that no row owns would go unreported.
  const fixture = buildCleanFixture();
  const compound = path.join(fixture.root, `${UI_ROOT}/primitives/display/Compound`);
  fs.mkdirSync(compound, { recursive: true });
  fs.writeFileSync(
    path.join(compound, 'index.tsx'),
    [
      'const Base = () => null;',
      'const Slot = () => null;',
      'export const CompoundThing = Object.assign(Base, { Slot });',
    ].join('\n'),
  );
  fs.appendFileSync(
    path.join(fixture.root, 'packages/core/src/index.ts'),
    `export * from '../../../${UI_ROOT}/primitives/display/Compound';\n`,
  );
  const { violations } = audit(fixture);
  assert.ok(
    violations.some(
      (violation) => violation.kind === 'public-unowned' && /CompoundThing/.test(violation.detail),
    ),
    'expected the Object.assign compound to be seen as a component',
  );
});
