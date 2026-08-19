/**
 * Reverse projection: every public component the package root exports must
 * resolve to EXACTLY ONE family-inventory row.
 *
 * WHY THIS DIRECTION. The family inventory is checked forward -- every row
 * points at a source owner that exists, and the taxonomy parity gate proves
 * rows agree with folders, manifests and the Showroom registry. Nothing
 * checked the other way. A component could be added to `src/index.ts`, ship
 * to every app, and never appear in the denominator; or a folder could be
 * split so one file sits inside two owners and be counted twice. Both are
 * invisible to a forward-only check, and both are exactly the failures
 * CLAUDE.md forbids: "Every public component has exactly one canonical family
 * ID and one source owner."
 *
 * HOW OWNERSHIP IS DECIDED. By source containment, not by name. A component
 * is owned by the row whose `sourceOwner` directory contains its terminal
 * declaration file. Name matching was tried first and is wrong: it reports
 * `ModalHeader`, `SkeletonText` and `AvatarBadge` as unowned even though they
 * are compound members of a family that does have a row, and it reports
 * aliases like `WorkspaceHeader` as unowned even though they resolve to
 * `CollectionHeader`'s file. CLAUDE.md settles it -- "Aliases, compatibility
 * paths and multiple exports must resolve to the same row" -- and only
 * containment gives that. The AST resolver chases every re-export chain to a
 * terminal declaration, so an alias and its original land on one file and
 * therefore on one row.
 *
 * WHICH EXPORTS COUNT. `isComponentShaped` from the shared resolver is
 * necessary but not sufficient: it matches every exported function, class and
 * arrow, so `useTokens`, `warnInDev` and `validateTenantThemeConfig` all pass
 * it. Two further discriminators make the population honest -- a PascalCase
 * name, and a terminal file under `packages/core/src/ui`. Every inventory row
 * has a `sourceOwner` under that root, so nothing outside it could be owned
 * anyway, and a lowercase name is not a React component. PascalCase also
 * excludes hooks for free, since `useX` starts lowercase.
 *
 * THE RESOLVER IS SHARED, NOT REIMPLEMENTED. `lib/root-public-resolver.mjs` is
 * the one fail-closed AST resolver in this package. A second resolver -- and
 * especially a regex one -- would drift from it and quietly disagree about
 * what is public.
 *
 * THE UNOWNED REGISTER IS DEBT, NOT A BASELINE. A number of public components
 * still project onto no row. They are recorded below by NAME with a written
 * reason per cohort, asserted as an exact set. It is not a count that can
 * absorb a new violation: adding an unowned component turns this red, and so
 * does fixing one without deleting its name. CLAUDE.md requires a removal,
 * merge or reclassification to be "applied atomically to inventory,
 * manifests, reverse projections, gates and evidence" -- this file is the
 * reverse projection that sentence names, so a lane that adds a row edits
 * this register in the same change.
 *
 * RELATED, AND DELIBERATELY NOT MERGED YET. `taxonomy-parity-gate.mjs` keeps a
 * `GOVERNED_PUBLIC_SUPPORT` map that names most of the same components with
 * dispositions (`support` vs `pending-adjudication`). Two hand-maintained
 * registers for one fact will drift. The fix is to export that map and have
 * this file assert set equality against it, so neither can move alone; it is
 * not done here because that map lives in another lane's file mid-flight.
 *
 * THE DRILLS BELOW PROVE IT CAN FAIL. A projection nobody has watched go red
 * is not evidence. The synthetic fixtures plant one defect each into an
 * otherwise clean world -- a component with no row, a component inside two
 * owners, a barrel export whose target declares nothing -- and the clean
 * control proves the fixture reports nothing, which is what makes the others
 * mean anything.
 *
 * WHAT "FAIL-CLOSED" HAD TO BE FIXED TO MEAN. That test originally asserted
 * only that no component hid behind an import cycle, while `MISSING` and
 * `AMBIGUOUS` -- which hide a component just as completely -- went unchecked.
 * A half-landed rename proved it: the root barrel kept exporting a name whose
 * declaration had already moved, so every consumer's import would throw, and
 * this file called the tree clean because a name with no terminal file is
 * simply never projected. Both states are now asserted empty by name.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { createRootPublicResolver } from './lib/root-public-resolver.mjs';
import { packageRoot as findPackageRoot } from './lib/repo-root/index.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
/** `packages/core`. */
const CORE_ROOT = findPackageRoot(HERE);
/** Repository root: inventory `sourceOwner` values are relative to it. */
const REPO_ROOT = path.resolve(CORE_ROOT, '..', '..');
const ENTRY_FILE = path.join(CORE_ROOT, 'src', 'index.ts');
const INVENTORY_FILE = path.join(
  CORE_ROOT,
  'scripts/quality-evidence/programs/modern-rescue/family-inventory.json',
);

const PASCAL_CASE = /^[A-Z][A-Za-z0-9]*$/;

/**
 * Public components that no row owns today, by cohort, with the reason each
 * cohort exists. Sorted names, one flat set at the end.
 *
 * A cohort is a written exception, never a resting place. It retires the
 * moment its finding is actually fixed -- and because this register asserts
 * set equality, a fix that lands without deleting its cohort turns the drill
 * red exactly as loudly as a new finding does. That coupling is the point: it
 * forces the source change and the bookkeeping into one commit.
 *
 * Four cohorts retired that way while this file was being written, and the
 * shape of each fix is worth keeping, because each is a different legitimate
 * ending. `overlay-runtime` (FocusTrap, Overlay, Portal, PortalScope) ended by
 * *withdrawal* -- the machinery behind Modal and Drawer stopped being public at
 * all. `chrome-rendering` (SurfaceActionBar, SurfaceSectionCard,
 * SurfaceTabbedLabel) ended by *promotion* -- three chrome islands stranded on
 * `structures/foundation/chrome/presentation/rendering` became a real owner at
 * `structures/shell/surface-chrome`. `capability-anatomy-pending-row` and
 * `surface-lifecycle-pending-row` ended by *bookkeeping* -- the source was
 * already right and the inventory row caught up.
 *
 * So: an entry here is a claim that a component is publicly reachable and no
 * family legitimately owns it. If that stops being true for any reason, delete
 * the entry. Do not add a name to keep this test green.
 */
const UNOWNED_REGISTER = Object.freeze({
  // Chart internals published from `patterns/visualization/charts` support
  // segments (`presentation/`, `runtime/`). CLAUDE.md: "Support folders such
  // as foundation, runtime, composition, presentation, facade ... never
  // create family rows by themselves" -- so the honest fix is to stop
  // exporting them publicly, not to invent nine chart rows.
  'chart-internals': [
    'ChartFamilyFrame',
    'ChartFrame',
    'ChartImperativePlot',
    'ChartMetricTrendView',
    'ChartRankedRowsView',
    'ChartScaffold',
    'ChartTooltip',
    'TooltipSeries',
    'TooltipValue',
  ],
  // `patterns/runtime/pulse` -- a value-change animation wrapper. Same
  // support-segment question as the chart internals above, and the same likely
  // ending: stop publishing it, rather than mint a row for a support path.
  'pattern-runtime': ['PulseValue'],
});

const UNOWNED_EXPECTED = Object.freeze(
  Object.values(UNOWNED_REGISTER)
    .flat()
    .sort((a, b) => a.localeCompare(b)),
);

// ---------------------------------------------------------------------------
// Projection
// ---------------------------------------------------------------------------

/**
 * Project every component-shaped public export onto the rows that own it.
 *
 * @param {object} input
 * @param {{ enumerate: () => Map<string, any>, isComponentShaped: (r: any) => boolean }} input.resolver
 * @param {Array<{ id: string, sourceOwner: string }>} input.rows
 * @param {string} input.repoRoot Absolute root the `sourceOwner` values are relative to.
 * @param {string} input.uiRoot Absolute directory a terminal file must sit under to count.
 */
function projectPublicComponents({ resolver, rows, repoRoot, uiRoot }) {
  const owners = rows.map((row) => ({
    id: row.id,
    // Trailing separator so `.../Card` cannot claim `.../CardGrid/index.tsx`.
    dir: path.resolve(repoRoot, row.sourceOwner) + path.sep,
  }));
  const uiPrefix = uiRoot.endsWith(path.sep) ? uiRoot : uiRoot + path.sep;

  const owned = [];
  const unowned = [];
  const multi = [];
  const unresolved = [];
  const dangling = [];
  const states = new Map();
  let considered = 0;

  for (const [name, resolution] of resolver.enumerate()) {
    states.set(resolution.state, (states.get(resolution.state) ?? 0) + 1);
    if (resolution.state === 'UNRESOLVED') {
      unresolved.push({ name, reason: resolution.reason ?? '' });
    }
    if (resolution.state === 'MISSING' || resolution.state === 'AMBIGUOUS') {
      dangling.push({ name, state: resolution.state });
    }

    if (!resolver.isComponentShaped(resolution)) continue;
    if (!PASCAL_CASE.test(name)) continue;

    const file = resolution.terminal?.file ?? '';
    if (!file.startsWith(uiPrefix)) continue;

    considered += 1;
    const hits = owners.filter((owner) => (file + path.sep).startsWith(owner.dir));
    const entry = { name, file: path.relative(repoRoot, file), rows: hits.map((h) => h.id) };

    if (hits.length === 0) unowned.push(entry);
    else if (hits.length > 1) multi.push(entry);
    else owned.push(entry);
  }

  const byName = (a, b) => a.name.localeCompare(b.name);
  return {
    considered,
    owned: owned.sort(byName),
    unowned: unowned.sort(byName),
    multi: multi.sort(byName),
    unresolved: unresolved.sort(byName),
    dangling: dangling.sort(byName),
    states,
  };
}

function describe(entries) {
  return entries.map((entry) => `  - ${entry.name} <- ${entry.file}`).join('\n');
}

// ---------------------------------------------------------------------------
// Real tree
// ---------------------------------------------------------------------------

const realProjection = (() => {
  const inventory = JSON.parse(fs.readFileSync(INVENTORY_FILE, 'utf8'));
  const resolver = createRootPublicResolver({ entryFile: ENTRY_FILE });
  return {
    inventory,
    ...projectPublicComponents({
      resolver,
      rows: inventory.rows,
      repoRoot: REPO_ROOT,
      uiRoot: path.join(CORE_ROOT, 'src', 'ui'),
    }),
  };
})();

test('the projection sees a real population (a silent zero would pass everything)', () => {
  assert.ok(
    realProjection.considered > 200,
    `only ${realProjection.considered} public components were considered -- the resolver or the ` +
      'discriminators are broken, and every assertion below would pass vacuously',
  );
  assert.equal(realProjection.inventory.rows.length, realProjection.inventory.denominator);
});

test('the resolver reaches a terminal for every public name (fail-closed)', () => {
  // CYCLE_ONLY would hide a component behind an import cycle. There are none,
  // and none may appear.
  assert.equal(realProjection.states.get('CYCLE_ONLY') ?? 0, 0);

  // MISSING and AMBIGUOUS hide a component exactly as effectively as
  // CYCLE_ONLY, and until now this test asserted neither -- so it promised
  // "fail-closed" while leaving the two states open. MISSING is the worse of
  // the pair: the root barrel still advertises the name, but the file or
  // symbol behind it is gone, which is a broken public API that no amount of
  // ownership bookkeeping downstream can detect. It is registered by name and
  // not by count so a half-landed rename cannot trade one dangling export for
  // another and stay green.
  assert.deepEqual(
    realProjection.dangling.map((entry) => `${entry.name} (${entry.state})`),
    [],
    'the package root barrel exports names whose target no longer resolves to a declaration. ' +
      'Each one is a public import that throws at runtime, and each is invisible to every ' +
      'ownership assertion below. This is normally a rename or a move that landed in source ' +
      'before the barrel and the family folder caught up -- finish that migration rather than ' +
      'registering the names here',
  );

  const specifiers = [
    ...new Set(
      realProjection.unresolved.map((entry) =>
        // reason reads `cannot resolve <specifier> (from <file>)`
        entry.reason.replace(/^cannot resolve /, '').replace(/ \(from .*\)$/, ''),
      ),
    ),
  ].sort((a, b) => a.localeCompare(b));

  // UNRESOLVED hides a public name exactly as effectively as MISSING: the
  // specifier resolves to no file at all, so every name behind it silently
  // leaves the projection. This once carried a by-specifier register for the
  // in-flight `widget-board/runtime/solver` -> shared `adaptive-layout` move;
  // that move has landed, so the set is empty and stays empty. A dangling
  // specifier now fails the drill instead of being registered past it.
  assert.deepEqual(
    specifiers,
    [],
    'the package root barrel names module specifiers that do not resolve to a file, so every ' +
      'public name behind them is invisible to this projection:\n' +
      realProjection.unresolved.map((e) => `  - ${e.name}: ${e.reason}`).join('\n'),
  );
});

test('no public component resolves to more than one family row', () => {
  assert.deepEqual(
    realProjection.multi.map((entry) => `${entry.name} -> ${entry.rows.join(' + ')}`),
    [],
    'a source file sits inside two row sourceOwner directories, so one component is counted twice ' +
      'in the denominator:\n' +
      realProjection.multi.map((e) => `  - ${e.name} <- ${e.file} -> ${e.rows.join(', ')}`).join('\n'),
  );
});

test('the unowned register is exact -- no new unowned component, no stale entry', () => {
  const actual = realProjection.unowned.map((entry) => entry.name).sort((a, b) => a.localeCompare(b));
  const expected = [...UNOWNED_EXPECTED];

  const added = actual.filter((name) => !expected.includes(name));
  const removed = expected.filter((name) => !actual.includes(name));

  const detail = [
    added.length
      ? `NEW unowned public components (add a family row, or stop exporting them publicly):\n${describe(
          realProjection.unowned.filter((entry) => added.includes(entry.name)),
        )}`
      : '',
    removed.length
      ? `Register entries that are now owned -- delete them from UNOWNED_REGISTER in this file, ` +
        `in the same change that gave them a row:\n${removed.map((name) => `  - ${name}`).join('\n')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  assert.deepEqual(actual, expected, detail);
});

// ---------------------------------------------------------------------------
// Planted-defect drills
// ---------------------------------------------------------------------------

const UI_REL = 'packages/core/src/ui';

/**
 * A minimal but structurally faithful world: one primitive family that is a
 * real folder with an index, exported from a real root barrel, and mirrored
 * by one inventory row. Extra exports can be planted on top of it.
 *
 * @param {{ extraExports?: string, extraFiles?: Record<string,string>, rows?: Array<{id:string,sourceOwner:string}> }} plant
 */
function buildFixture(plant = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'public-component-projection-'));
  const write = (rel, contents) => {
    const file = path.join(root, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, contents);
  };

  write(
    `${UI_REL}/primitives/display/Alpha/index.tsx`,
    'export function Alpha() { return null; }\nexport function useAlpha() { return 1; }\n',
  );
  write(
    'packages/core/src/index.ts',
    `export { Alpha, useAlpha } from './ui/primitives/display/Alpha';\n${plant.extraExports ?? ''}`,
  );
  for (const [rel, contents] of Object.entries(plant.extraFiles ?? {})) write(rel, contents);

  return {
    root,
    rows: plant.rows ?? [
      { id: 'primitive/display/alpha', sourceOwner: `${UI_REL}/primitives/display/Alpha` },
    ],
    cleanup: () => fs.rmSync(root, { recursive: true, force: true }),
  };
}

function projectFixture(fixture) {
  return projectPublicComponents({
    // `aliases: []` keeps the resolver from walking out of the temp directory
    // looking for a tsconfig and picking up the real repository's paths.
    resolver: createRootPublicResolver({
      entryFile: path.join(fixture.root, 'packages/core/src/index.ts'),
      aliases: [],
    }),
    rows: fixture.rows,
    repoRoot: fixture.root,
    uiRoot: path.join(fixture.root, UI_REL),
  });
}

test('drill control: a clean fixture reports one owned component and nothing else', () => {
  const fixture = buildFixture();
  try {
    const result = projectFixture(fixture);
    // `useAlpha` is component-shaped to the resolver and is deliberately not
    // considered -- that is the PascalCase discriminator doing its job.
    assert.equal(result.considered, 1);
    assert.deepEqual(result.owned.map((e) => e.name), ['Alpha']);
    assert.deepEqual(result.unowned, []);
    assert.deepEqual(result.multi, []);
  } finally {
    fixture.cleanup();
  }
});

test('drill: a component-shaped public export with no row is reported unowned', () => {
  const fixture = buildFixture({
    extraExports: "export { Beta } from './ui/primitives/display/Beta';\n",
    extraFiles: {
      [`${UI_REL}/primitives/display/Beta/index.tsx`]: 'export function Beta() { return null; }\n',
    },
  });
  try {
    const result = projectFixture(fixture);
    assert.equal(result.considered, 2);
    assert.deepEqual(result.unowned.map((e) => e.name), ['Beta']);
    assert.deepEqual(result.multi, []);
  } finally {
    fixture.cleanup();
  }
});

test('drill: a component inside two row sourceOwner directories is reported multi', () => {
  const fixture = buildFixture({
    rows: [
      { id: 'primitive/display/alpha', sourceOwner: `${UI_REL}/primitives/display/Alpha` },
      // A second row that owns the parent directory: Alpha's file now sits
      // inside both, which is how one component gets counted twice.
      { id: 'primitive/display/display', sourceOwner: `${UI_REL}/primitives/display` },
    ],
  });
  try {
    const result = projectFixture(fixture);
    assert.deepEqual(result.owned, []);
    assert.deepEqual(result.unowned, []);
    assert.deepEqual(
      result.multi.map((e) => `${e.name} -> ${e.rows.join(' + ')}`),
      ['Alpha -> primitive/display/alpha + primitive/display/display'],
    );
  } finally {
    fixture.cleanup();
  }
});

test('drill: a barrel export whose target declares nothing is reported dangling', () => {
  // The half-landed-rename shape, and the reason the fail-closed test asserts
  // MISSING at all. The module resolves -- so this is NOT the UNRESOLVED case
  // the specifier register covers -- but the symbol behind the name is gone.
  // The export survives in the barrel, every consumer's import throws, and the
  // ownership assertions never see it because it has no terminal file to
  // project. It has to be caught here or not at all.
  const fixture = buildFixture({
    extraExports: "export { Gamma } from './ui/primitives/display/Alpha';\n",
  });
  try {
    const result = projectFixture(fixture);
    assert.deepEqual(
      result.dangling.map((entry) => `${entry.name} (${entry.state})`),
      ['Gamma (MISSING)'],
    );
    // Proof it is invisible downstream: the projection still sees exactly the
    // one real component, so a count-based check would call this world clean.
    assert.equal(result.considered, 1);
    assert.deepEqual(result.unowned, []);
  } finally {
    fixture.cleanup();
  }
});

test('drill: an alias resolves to the same row as the component it re-exports', () => {
  const fixture = buildFixture({
    extraExports: "export { Alpha as AlphaCompat } from './ui/primitives/display/Alpha';\n",
  });
  try {
    const result = projectFixture(fixture);
    assert.equal(result.considered, 2);
    assert.deepEqual(
      result.owned.map((e) => `${e.name} -> ${e.rows.join('')}`),
      ['Alpha -> primitive/display/alpha', 'AlphaCompat -> primitive/display/alpha'],
    );
    assert.deepEqual(result.unowned, []);
  } finally {
    fixture.cleanup();
  }
});
