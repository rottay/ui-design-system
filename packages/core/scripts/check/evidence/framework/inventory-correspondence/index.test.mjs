/**
 * Drills for inventory correspondence.
 *
 * The inventory is the denominator every other check divides by, so a row that
 * resolves by name coincidence rather than by physical containment corrupts
 * every downstream census. These drills pin terminal identity, ownership by
 * containment, the acronym-slug law and generated-field drift.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  loadProgramContracts,
} from '../contracts/index.mjs';
import {
  publicExportSurface,
  resolveInventory,
  AUTHORED_ROW_FIELDS,
  RESOLUTION_LAW,
  DIMENSION_POLICY,
  toPersistedInventoryRow,
  checkInventoryCorrespondence,
} from './index.mjs';

const contracts = loadProgramContracts();

const TERMINAL_FIXTURE_ROOTS = new Set();
test.afterEach(() => {
  for (const root of TERMINAL_FIXTURE_ROOTS) fs.rmSync(root, { recursive: true, force: true });
  TERMINAL_FIXTURE_ROOTS.clear();
});

// --- Acronym-slug law ---------------------------------------------------------------------
//
// A family id's last segment spells the folder that owns it. It is not re-derived from the
// component name, because a per-capital slugger reading `OTPInput` emits `o-tp-input` for a
// folder named `otp-input`, and `normalizeSlug()` erases the punctuation that separates the
// two -- so the row resolves, the gate stays green, and the drift survives review as
// cosmetic. These drills pin both directions of the defect and both preconditions that keep
// the law exact.
//
// The subject used to be `OAuthTransitionScreen`/`oauth-transition`. That family left the DS
// with WO-CAN-04 (F-18: a parallel design system with product identity), so the law is now
// pinned on the acronym families that remain -- `OTPInput` and `QRCode` -- rather than on a
// row a planted mutation could no longer find.

const ACRONYM_BLOCKER = 'punctuates its own owner differently';

function withPlantedId(oldId, newId) {
  const rows = contracts.inventory.rows.map((row) => (row.id === oldId ? { ...row, id: newId } : row));
  assert.ok(
    rows.some((row) => row.id === newId),
    `drill precondition: ${oldId} must exist in the live inventory to be re-spelled`,
  );
  return { ...contracts, inventory: { ...contracts.inventory, rows } };
}

function acronymBlockers(result) {
  return result.blockers.filter((blocker) => blocker.includes(ACRONYM_BLOCKER));
}

// --- Terminal identity, ownership by containment, and generated-field drift ---------------
//
// Ownership used to be a global NAME coincidence: a family claimed every public name that its
// folder also happened to export. `LinkProps` is the case that exposes it. The package
// publishes a bare `LinkProps` whose declaration lives in Typography's contracts, while the
// navigation Link folder separately exports a LOCAL `LinkProps` that reaches the public
// surface only under the alias `NavLinkProps`. Intersecting names credited Typography's
// export to the navigation row -- and the row then satisfied "all declared components are
// public" on the strength of a symbol it does not own.
//
// The fixture below is the same shape in miniature, so the defect can be reproduced and the
// fix can be shown to depend on terminal identity rather than on the live tree happening to
// agree today.

const NAV_LINK_PROJECTION = ['NavLinkProps', 'NavLinkType', 'NAV_LINK_DEFAULTS', 'NAV_LINK_TYPE_COLORS', 'NavLink'];

function fixtureFile(root, relative, lines) {
  const absolute = path.join(root, 'packages/core', relative);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, `${lines.join('\n')}\n`);
}

/**
 * A miniature package with two homonymous `LinkProps` declarations and a root barrel that
 * aliases the navigation one. Options plant one defect each.
 */
function homonymFixture({ navLinkPropsFrom = 'navigation/Link', nestedOwner = false, danglingExport = false } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rottay-qe-terminal-'));
  TERMINAL_FIXTURE_ROOTS.add(root);

  fixtureFile(root, 'package.json', [
    JSON.stringify({ name: '@fixture/design-system', exports: { '.': './src/index.ts' } }, null, 2),
  ]);

  fixtureFile(root, 'src/components/primitives/display/Typography/contracts/index.ts', [
    'export interface LinkProps { readonly href: string }',
    'export interface TypographyProps { readonly tone: string }',
  ]);
  fixtureFile(root, 'src/components/primitives/display/Typography/index.ts', [
    "export type { LinkProps, TypographyProps } from './contracts';",
    "export const Typography = 'Typography';",
  ]);

  fixtureFile(root, 'src/components/primitives/navigation/Link/contracts/index.ts', [
    'export interface LinkProps { readonly to: string }',
    "export type LinkType = 'default' | 'muted';",
    "export const LINK_DEFAULTS = { type: 'default' };",
    "export const LINK_TYPE_COLORS = { default: 'var(--ds-color-link)' };",
  ]);
  fixtureFile(root, 'src/components/primitives/navigation/Link/index.ts', [
    "export type { LinkProps, LinkType } from './contracts';",
    "export { LINK_DEFAULTS, LINK_TYPE_COLORS } from './contracts';",
    "export const NavLink = 'NavLink';",
  ]);

  fixtureFile(root, 'src/components/surfaces/presentation/pages/semantic-surface/index.ts', [
    "export const SemanticSurface = 'SemanticSurface';",
  ]);

  if (nestedOwner) {
    fixtureFile(root, 'src/components/primitives/navigation/Link/compound/Item/index.ts', [
      "export const LinkItem = 'LinkItem';",
    ]);
  }

  const navLinkPropsSource =
    navLinkPropsFrom === 'navigation/Link'
      ? './components/primitives/navigation/Link'
      : './components/primitives/display/Typography';

  fixtureFile(root, 'src/index.ts', [
    "export type { LinkProps, TypographyProps } from './components/primitives/display/Typography';",
    "export { Typography } from './components/primitives/display/Typography';",
    `export type { LinkProps as NavLinkProps } from '${navLinkPropsSource}';`,
    "export type { LinkType as NavLinkType } from './components/primitives/navigation/Link';",
    "export { LINK_DEFAULTS as NAV_LINK_DEFAULTS, LINK_TYPE_COLORS as NAV_LINK_TYPE_COLORS, NavLink } from './components/primitives/navigation/Link';",
    "export { SemanticSurface } from './components/surfaces/presentation/pages/semantic-surface';",
    ...(nestedOwner ? ["export { LinkItem } from './components/primitives/navigation/Link/compound/Item';"] : []),
    ...(danglingExport ? ["export { Vanished } from './components/primitives/navigation/Vanished';"] : []),
  ]);

  return root;
}

function fixtureAuthoredRows({ nestedOwner = false } = {}) {
  const rows = [
    {
      id: 'primitive/navigation/link',
      layer: 'primitive',
      category: 'navigation',
      family: 'NavLink',
      components: ['NavLink'],
      sourceRoot: 'packages/core/src/components/primitives/navigation',
    },
    {
      id: 'primitive/display/typography',
      layer: 'primitive',
      category: 'display',
      family: 'Typography',
      components: ['Typography'],
      sourceRoot: 'packages/core/src/components/primitives/display',
    },
    {
      id: 'surface/pages/semantic-surface',
      layer: 'surface',
      category: 'pages',
      family: 'SemanticSurface',
      components: ['SemanticSurface'],
      sourceRoot: 'packages/core/src/components/surfaces/presentation/pages',
    },
  ];
  if (nestedOwner) {
    rows.push({
      id: 'primitive/navigation/item',
      layer: 'primitive',
      category: 'navigation',
      family: 'LinkItem',
      components: ['LinkItem'],
      sourceRoot: 'packages/core/src/components/primitives/navigation',
    });
  }
  return rows;
}

/** Authored-only contracts: every generated field is deliberately absent. */
function fixtureContracts({ nestedOwner = false } = {}) {
  const rows = fixtureAuthoredRows({ nestedOwner });
  const counts = {};
  for (const row of rows) counts[row.layer] = (counts[row.layer] ?? 0) + 1;
  return {
    program: { denominators: { visibleFamilies: rows.length } },
    rubric: { dimensions: contracts.rubric.dimensions },
    inventory: { counts, rows },
  };
}

/**
 * What the writer WOULD persist for this fixture, built through the same
 * `toPersistedInventoryRow` the writer uses. No file is written: the drills need the
 * document, not the side effect.
 */
function fixturePersisted(root, options = {}) {
  const authored = fixtureContracts(options);
  const resolved = resolveInventory({ contracts: authored, root, aliases: [] });
  return {
    ...authored,
    inventory: {
      ...authored.inventory,
      resolutionLaw: RESOLUTION_LAW,
      dimensionPolicy: DIMENSION_POLICY,
      rows: resolved.rows.map(toPersistedInventoryRow),
    },
  };
}

function fixtureRow(root, id, options = {}) {
  const resolved = resolveInventory({ contracts: fixtureContracts(options), root, aliases: [] });
  const row = resolved.rows.find((candidate) => candidate.id === id);
  assert.ok(row, `${id} must resolve in the fixture`);
  return row;
}

function addCollisionEntrypoint(root, entry, source) {
  fixtureFile(root, `src/entrypoints/${entry}/index.ts`, [source]);
}

test('every family id spells its own folder exactly', () => {
  const result = checkInventoryCorrespondence();
  assert.deepEqual(acronymBlockers(result), []);
});

test('POSITIVE EXAMPLE: a compound name keeps its word boundary in id AND folder', () => {
  // The ruling's two named cases plus TreeMap, resolved from the live tree. `HeatMap` is two
  // words, so `heat-map` is the correct spelling on BOTH sides; the fix was to rename the
  // folder, never to fuse the id. Asserting the resolved owner (not just the absence of a
  // blocker) makes this fail if a later wave renames the folder back to `heatmap`.
  const resolved = resolveInventory();
  const ownerOf = (id) => {
    const row = resolved.rows.find((candidate) => candidate.id === id);
    assert.ok(row, `${id} must exist in the live inventory`);
    assert.equal(row.resolvedBy, 'folder-slug');
    return path.basename(row.sourceOwner);
  };
  assert.equal(ownerOf('chart/spatial/heat-map'), 'heat-map');
  assert.equal(ownerOf('chart/temporal/calendar-heat-map'), 'calendar-heat-map');
  assert.equal(ownerOf('chart/hierarchical/tree-map'), 'tree-map');
  assert.equal(ownerOf('primitive/inputs/otp-input'), 'otp-input');
  assert.equal(ownerOf('primitive/display/qr-code'), 'qr-code');
});

test('NEGATIVE DRILL: a dash driven into an acronym is caught (o-tp over otp-input)', () => {
  const result = checkInventoryCorrespondence({
    contracts: withPlantedId('primitive/inputs/otp-input', 'primitive/inputs/o-tp-input'),
  });
  const found = acronymBlockers(result);
  assert.equal(found.length, 1);
  assert.match(found[0], /primitive\/inputs\/o-tp-input/);
  assert.match(found[0], /id slug 'o-tp-input' vs folder 'otp-input'/);
  assert.equal(result.valid, false);
});

test('NEGATIVE DRILL: the same law catches the opposite error -- a compound fused shut', () => {
  // The mirror image, and the one that matters for review discipline: the first attempt at
  // the OAuth finding "fixed" the charts by concatenating their ids to match the folders.
  // That direction is equally a mis-spelling, and the law does not care which side moved.
  const result = checkInventoryCorrespondence({
    contracts: withPlantedId('chart/spatial/heat-map', 'chart/spatial/heatmap'),
  });
  const found = acronymBlockers(result);
  assert.equal(found.length, 1);
  assert.match(found[0], /id slug 'heatmap' vs folder 'heat-map'/);
});

test("BOUND: the tree's documented shorthands are not acronym findings", () => {
  // 25 rows carry a deliberate prefix or suffix the folder omits (`pattern-data-table` for
  // `data-table`, `gauge-chart` for `gauge`, `detail-header` for `detail`). They normalize
  // UNEQUAL, so the law never reaches them -- it fires only when an id already denotes its
  // folder and merely punctuates it differently. If this ever goes red the law has stopped
  // being an exact-spelling check and started legislating naming style.
  const resolved = resolveInventory();
  const shorthands = ['pattern/data/pattern-data-table', 'chart/statistical/gauge-chart', 'structure/headers/detail-header'];
  for (const id of shorthands) {
    const row = resolved.rows.find((candidate) => candidate.id === id);
    assert.ok(row, `${id} must exist in the live inventory`);
    const idSlug = row.id.split('/').pop();
    const folder = path.basename(row.sourceOwner);
    assert.notEqual(idSlug, folder);
    assert.notEqual(
      idSlug.replace(/[^a-z0-9]/g, ''),
      folder.replace(/[^a-z0-9]/g, ''),
      `${id} must differ from its folder by more than punctuation, or the law would judge it`,
    );
  }
  assert.deepEqual(acronymBlockers(checkInventoryCorrespondence()), []);
});

test('BOUND: a PascalCase folder makes no claim about kebab word boundaries', () => {
  // The law's first precondition: the folder must already be written in the id's
  // own vocabulary -- lowercase kebab -- before it can be authoritative about
  // where the word boundaries fall. A PascalCase folder says nothing about kebab
  // boundaries, so it is exempt.
  //
  // The live tree no longer carries a single PascalCase family folder (the
  // structural relocation kebab-folded all 255), so this bound is measured on a
  // fixture that does. Asserting it against the live inventory would be a
  // vacuous pass: zero rows would reach the precondition at all.
  const resolved = resolveInventory();
  const livePascal = resolved.rows.filter(
    (row) => row.sourceOwner && path.basename(row.sourceOwner) !== path.basename(row.sourceOwner).toLowerCase(),
  );
  assert.deepEqual(
    livePascal.map((row) => row.id),
    [],
    'the live tree is fully kebab-folded; if that changes, measure this bound on the tree instead',
  );

  const root = homonymFixture();
  // `primitive/display/typography` owns the folder `Typography`: the two spellings
  // normalize EQUAL and differ only in case, so without the lowercase precondition
  // the law would fire on it.
  const exempt = checkInventoryCorrespondence({ contracts: fixtureContracts(), root, aliases: [] });
  const exemptRow = resolveInventory({ contracts: fixtureContracts(), root, aliases: [] }).rows.find(
    (row) => row.id === 'primitive/display/typography',
  );
  assert.equal(path.basename(exemptRow.sourceOwner), 'Typography');
  assert.notEqual(exemptRow.id.split('/').pop(), path.basename(exemptRow.sourceOwner));
  assert.deepEqual(acronymBlockers(exempt), []);

  // The precondition is load-bearing, not decorative: the SAME punctuation-only
  // difference over a lowercase folder does fire. Without this half, a law that
  // had silently stopped firing altogether would pass the assertion above.
  const lowercaseOwner = {
    ...fixtureContracts(),
    inventory: {
      ...fixtureContracts().inventory,
      rows: fixtureContracts().inventory.rows.map((row) =>
        row.id === 'surface/pages/semantic-surface' ? { ...row, id: 'surface/pages/semanticsurface' } : row,
      ),
    },
  };
  const fired = acronymBlockers(
    checkInventoryCorrespondence({ contracts: lowercaseOwner, root, aliases: [] }),
  );
  assert.equal(fired.length, 1);
  assert.match(fired[0], /id slug 'semanticsurface' vs folder 'semantic-surface'/);
});

test('a family claims only the public names whose DECLARATION lives inside its own owner', () => {
  const root = homonymFixture();
  const nav = fixtureRow(root, 'primitive/navigation/link');

  // Exactly the aliases the package really publishes, in the folder's own export order.
  assert.deepEqual(nav.publicExports, NAV_LINK_PROJECTION);
  assert.equal(nav.sourceResolution, 'RESOLVED_SOURCE_AND_PUBLIC_EXPORT');

  // The bare name is public, and it is NOT the navigation family's.
  const surface = publicExportSurface({ root, aliases: [], cache: false });
  assert.ok(surface.names.has('LinkProps'));
  assert.ok(
    !nav.publicExports.includes('LinkProps'),
    'the navigation family must not claim a name whose declaration lives in Typography',
  );

  const typography = fixtureRow(root, 'primitive/display/typography');
  assert.ok(typography.publicExports.includes('LinkProps'));
  assert.ok(typography.publicExports.includes('TypographyProps'));
});

test('NEGATIVE DRILL: rewiring the alias to the other homonym removes it from the navigation family', () => {
  // The causal proof. Nothing about the navigation folder changes -- it still declares its
  // own `LinkProps` -- but the public `NavLinkProps` now terminates in Typography, so the
  // navigation row loses it. Under global-name matching the row's projection would be
  // identical in both fixtures, which is exactly why that rule could not see the defect.
  const rewired = homonymFixture({ navLinkPropsFrom: 'display/Typography' });
  const nav = fixtureRow(rewired, 'primitive/navigation/link');

  assert.ok(!nav.publicExports.includes('NavLinkProps'));
  assert.deepEqual(nav.publicExports, ['NavLinkType', 'NAV_LINK_DEFAULTS', 'NAV_LINK_TYPE_COLORS', 'NavLink']);

  const typography = fixtureRow(rewired, 'primitive/display/typography');
  assert.ok(typography.publicExports.includes('NavLinkProps'));
});

test('NEGATIVE DRILL: a declaration that lands inside two owners is a source blocker', () => {
  // Ownership must be a partition. A compound child promoted to a family row nests inside
  // its parent's folder, so `LinkItem` is physically inside BOTH owners and both rows would
  // claim it. There is no ranking that makes that honest, so it fails closed.
  const root = homonymFixture({ nestedOwner: true });
  const result = checkInventoryCorrespondence({
    contracts: fixtureContracts({ nestedOwner: true }),
    root,
    aliases: [],
  });

  const found = result.sourceBlockers.filter((blocker) => blocker.includes('lands inside 2 owners'));
  assert.equal(found.length, 1);
  assert.match(found[0], /compound\/Item/);
  assert.match(found[0], /primitive\/navigation\/link/);
  assert.match(found[0], /primitive\/navigation\/item/);
  assert.equal(result.sourceValid, false);
  assert.equal(result.valid, false);
});

test('NEGATIVE DRILL: a public name the resolver cannot terminate is a source blocker', () => {
  // A hole in the authority this module reads FROM. Dropping the name and reporting
  // agreement over the smaller surface is the one outcome that must be impossible.
  const root = homonymFixture({ danglingExport: true });
  const result = checkInventoryCorrespondence({ contracts: fixtureContracts(), root, aliases: [] });

  const found = result.sourceBlockers.filter((blocker) => blocker.includes('does not resolve from'));
  assert.equal(found.length, 1);
  assert.match(found[0], /public name Vanished/);
  assert.equal(result.sourceValid, false);
  assert.equal(result.publicResolutionFailures, 1);
});

test('NEGATIVE DRILL: duplicate row ids are blocked without merging their bindings', () => {
  const root = homonymFixture();
  const authored = fixtureContracts();
  authored.inventory.rows[1] = {
    ...authored.inventory.rows[1],
    id: authored.inventory.rows[0].id,
  };

  const resolved = resolveInventory({ contracts: authored, root, aliases: [] });
  const [navigation, typography] = resolved.rows;
  assert.ok(navigation.publicExports.includes('NavLink'));
  assert.ok(!navigation.publicExports.includes('Typography'));
  assert.ok(typography.publicExports.includes('Typography'));
  assert.ok(!typography.publicExports.includes('NavLink'));

  const result = checkInventoryCorrespondence({ contracts: authored, root, aliases: [] });
  assert.equal(result.sourceValid, false);
  assert.equal(
    result.sourceBlockers.filter((blocker) => blocker.includes('ids must be unique')).length,
    1,
  );
});

test('NEGATIVE DRILL: an empty component roster cannot pass vacuously', () => {
  const root = homonymFixture();
  const authored = fixtureContracts();
  authored.inventory.rows[0] = { ...authored.inventory.rows[0], components: [] };
  const result = checkInventoryCorrespondence({ contracts: authored, root, aliases: [] });
  assert.equal(result.sourceValid, false);
  assert.ok(result.sourceBlockers.some((blocker) => blocker.includes('must declare at least one component')));
  assert.equal(resolveInventory({ contracts: authored, root, aliases: [] }).rows[0].sourceResolution, 'RESOLVED_SOURCE_ONLY');
});

test('NEGATIVE DRILL: malformed or duplicate component symbols are source blockers', () => {
  const root = homonymFixture();
  for (const components of [['NavLink', 'NavLink'], ['NavLink', ''], ['NavLink', 7]]) {
    const authored = fixtureContracts();
    authored.inventory.rows[0] = { ...authored.inventory.rows[0], components };
    const result = checkInventoryCorrespondence({ contracts: authored, root, aliases: [] });
    assert.equal(result.sourceValid, false);
  }
});

test('NEGATIVE DRILL: every authored row field is required and nonblank', () => {
  const root = homonymFixture();
  for (const field of AUTHORED_ROW_FIELDS) {
    const authored = fixtureContracts();
    delete authored.inventory.rows[0][field];
    // Serialize + parse: `undefined` own-properties disappear exactly as they
    // would in the real JSON file and cannot make this test pass accidentally.
    const reparsed = JSON.parse(JSON.stringify(authored));
    const result = checkInventoryCorrespondence({ contracts: reparsed, root, aliases: [] });
    assert.equal(result.sourceValid, false);
    assert.ok(result.sourceBlockers.some((blocker) => blocker.includes(`missing authored field ${field}`)));
  }
  for (const field of ['id', 'layer', 'category', 'family', 'sourceRoot']) {
    const authored = fixtureContracts();
    authored.inventory.rows[0][field] = '  ';
    const result = checkInventoryCorrespondence({
      contracts: JSON.parse(JSON.stringify(authored)),
      root,
      aliases: [],
    });
    assert.equal(result.sourceValid, false);
    assert.ok(
      result.sourceBlockers.some((blocker) =>
        blocker.includes(`authored field ${field} must be a non-empty string`),
      ),
    );
  }
});

test('NEGATIVE DRILL: a nonexistent component symbol blocks the writer preflight', () => {
  const root = homonymFixture();
  const authored = fixtureContracts();
  authored.inventory.rows[0] = {
    ...authored.inventory.rows[0],
    components: ['DefinitelyNotARealPublicSymbol'],
  };
  const result = checkInventoryCorrespondence({ contracts: authored, root, aliases: [] });
  assert.equal(result.sourceValid, false);
  assert.ok(result.sourceBlockers.some((blocker) => blocker.includes('DefinitelyNotARealPublicSymbol')));
  assert.equal(resolveInventory({ contracts: authored, root, aliases: [] }).rows[0].sourceResolution, 'RESOLVED_SOURCE_ONLY');
});

test('NEGATIVE DRILL: one public name reaching two owned terminals is inexpressible', () => {
  const root = homonymFixture();
  addCollisionEntrypoint(
    root,
    'nav-collision',
    "export { NavLink as SharedPublicName } from '../../components/primitives/navigation/Link';",
  );
  addCollisionEntrypoint(
    root,
    'type-collision',
    "export { Typography as SharedPublicName } from '../../components/primitives/display/Typography';",
  );

  const result = checkInventoryCorrespondence({ contracts: fixtureContracts(), root, aliases: [] });
  assert.equal(result.publicResolutionFailures, 0, 'the individual entrypoints resolve normally');
  assert.equal(result.sourceValid, false);
  const collisions = result.sourceBlockers.filter((blocker) => blocker.includes('SharedPublicName'));
  assert.equal(collisions.length, 1);
  assert.match(collisions[0], /2 terminals \(2 owned:/);
  assert.match(collisions[0], /publicExports is a string\[\]/);
});

test('NEGATIVE DRILL: a mixed owned/unowned terminal collision is inexpressible too', () => {
  const root = homonymFixture();
  fixtureFile(root, 'src/foundation/unowned/index.ts', ["export const SharedMixedName = 'outside';"]);
  addCollisionEntrypoint(
    root,
    'owned-mixed',
    "export { NavLink as SharedMixedName } from '../../components/primitives/navigation/Link';",
  );
  addCollisionEntrypoint(
    root,
    'unowned-mixed',
    "export { SharedMixedName } from '../../foundation/unowned';",
  );

  const result = checkInventoryCorrespondence({ contracts: fixtureContracts(), root, aliases: [] });
  assert.equal(result.publicResolutionFailures, 0);
  assert.equal(result.sourceValid, false);
  const collisions = result.sourceBlockers.filter((blocker) => blocker.includes('SharedMixedName'));
  assert.equal(collisions.length, 1);
  assert.match(collisions[0], /2 terminals \(1 owned:/);
});

test('BOUND: a same-name collision wholly outside family owners remains unclaimed', () => {
  const root = homonymFixture();
  fixtureFile(root, 'src/foundation/unowned-left/index.ts', ["export const ExternalTwin = 'left';"]);
  fixtureFile(root, 'src/foundation/unowned-right/index.ts', ["export const ExternalTwin = 'right';"]);
  addCollisionEntrypoint(root, 'unowned-left', "export { ExternalTwin } from '../../foundation/unowned-left';");
  addCollisionEntrypoint(root, 'unowned-right', "export { ExternalTwin } from '../../foundation/unowned-right';");

  const result = checkInventoryCorrespondence({ contracts: fixturePersisted(root), root, aliases: [] });
  assert.equal(result.publicResolutionFailures, 0);
  assert.equal(result.sourceValid, true);
  assert.ok(!result.sourceBlockers.some((blocker) => blocker.includes('ExternalTwin')));
});

test('NEGATIVE DRILL: an owned and an external terminal sharing a public name are inexpressible', () => {
  const root = homonymFixture();
  addCollisionEntrypoint(
    root,
    'owned-external-name',
    "export { NavLink as SharedExternalName } from '../../components/primitives/navigation/Link';",
  );
  addCollisionEntrypoint(
    root,
    'external-name',
    "export { SharedExternalName } from 'third-party-package';",
  );

  const result = checkInventoryCorrespondence({ contracts: fixtureContracts(), root, aliases: [] });
  assert.equal(result.publicResolutionFailures, 0);
  assert.equal(result.sourceValid, false);
  const collisions = result.sourceBlockers.filter((blocker) => blocker.includes('SharedExternalName'));
  assert.equal(collisions.length, 1);
  assert.match(collisions[0], /2 terminals \(1 owned:/);
});

test('BOUND: same-name external terminals without an owner remain unclaimed', () => {
  const root = homonymFixture();
  addCollisionEntrypoint(root, 'external-one', "export { ExternalOnly } from 'package-one';");
  addCollisionEntrypoint(root, 'external-two', "export { ExternalOnly } from 'package-two';");

  const result = checkInventoryCorrespondence({ contracts: fixturePersisted(root), root, aliases: [] });
  assert.equal(result.publicResolutionFailures, 0);
  assert.equal(result.sourceValid, true);
  assert.ok(!result.sourceBlockers.some((blocker) => blocker.includes('ExternalOnly')));
});

test('NEGATIVE DRILL: a public homonym in another owner does not satisfy sourceResolution', () => {
  const root = homonymFixture();
  const authored = fixtureContracts();
  authored.inventory.rows[0] = {
    ...authored.inventory.rows[0],
    components: ['LinkProps'],
  };

  const resolved = resolveInventory({ contracts: authored, root, aliases: [] });
  const navigation = resolved.rows[0];
  assert.ok(resolved.publicNames.has('LinkProps'), 'the homonym really is public');
  assert.ok(!navigation.publicExports.includes('LinkProps'));
  assert.equal(navigation.sourceResolution, 'RESOLVED_SOURCE_ONLY');
  assert.deepEqual(navigation.declaredComponentsPublic, []);
  assert.deepEqual(navigation.declaredComponentsNotPubliclyNamed, ['LinkProps']);
});

test('NEGATIVE DRILL: physical containment rejects a symlink that escapes the owner', () => {
  const root = homonymFixture();
  fixtureFile(root, 'src/runtime/escaped-terminal.ts', ["export const EscapedTerminal = 'outside';"]);
  const link = path.join(root, 'packages/core/src/components/primitives/navigation/Link/escaped.ts');
  fs.symlinkSync(path.join(root, 'packages/core/src/runtime/escaped-terminal.ts'), link);
  const index = path.join(root, 'packages/core/src/index.ts');
  fs.appendFileSync(index, "export { EscapedTerminal as NavEscaped } from './components/primitives/navigation/Link/escaped';\n");

  const resolved = resolveInventory({ contracts: fixtureContracts(), root, aliases: [], cache: false });
  const navigation = resolved.rows.find((row) => row.id === 'primitive/navigation/link');
  assert.ok(resolved.publicNames.has('NavEscaped'));
  assert.ok(!navigation.publicExports.includes('NavEscaped'));
});

test('BOUND: real and symlink spellings of one declaration remain one physical terminal', () => {
  const root = homonymFixture();
  const real = path.join(root, 'packages/core/src/components/primitives/navigation/Link/index.ts');
  const alias = path.join(root, 'packages/core/src/components/primitives/navigation/LinkAlias.ts');
  fs.symlinkSync(real, alias);
  addCollisionEntrypoint(
    root,
    'real-spelling',
    "export { NavLink as PhysicalNavLink } from '../../components/primitives/navigation/Link';",
  );
  addCollisionEntrypoint(
    root,
    'symlink-spelling',
    "export { NavLink as PhysicalNavLink } from '../../components/primitives/navigation/LinkAlias';",
  );

  const resolved = resolveInventory({ contracts: fixtureContracts(), root, aliases: [], cache: false });
  const bindings = resolved.bindings.filter((binding) => binding.name === 'PhysicalNavLink');
  assert.equal(bindings.length, 1);
  assert.equal(bindings[0].file, fs.realpathSync(real));
  assert.ok(!resolved.sourceBlockers.some((blocker) => blocker.includes('PhysicalNavLink')));
  const navigation = resolved.rows.find((row) => row.id === 'primitive/navigation/link');
  assert.equal(navigation.publicExports.filter((name) => name === 'PhysicalNavLink').length, 1);
});

test('cache identity includes the alias configuration', () => {
  const root = homonymFixture();
  fixtureFile(root, 'src/components/primitives/navigation/Link/alias-thing.ts', [
    "export const AliasThing = 'navigation';",
  ]);
  fixtureFile(root, 'src/components/primitives/display/Typography/alias-thing.ts', [
    "export const AliasThing = 'typography';",
  ]);
  const index = path.join(root, 'packages/core/src/index.ts');
  fs.appendFileSync(index, "export { AliasThing } from '@thing';\n");
  const aliasFor = (target) => [
    {
      wildcard: false,
      prefix: '@thing',
      baseDir: path.join(root, 'packages/core'),
      rawTargets: [target],
    },
  ];

  const navigation = publicExportSurface({
    root,
    aliases: aliasFor('src/components/primitives/navigation/Link/alias-thing'),
    cache: true,
  });
  const typography = publicExportSurface({
    root,
    aliases: aliasFor('src/components/primitives/display/Typography/alias-thing'),
    cache: true,
  });
  assert.match(navigation.bindings.find((binding) => binding.name === 'AliasThing').file, /navigation\/Link/);
  assert.match(typography.bindings.find((binding) => binding.name === 'AliasThing').file, /display\/Typography/);
});

test('cache:false re-reads a source graph changed after a cached preflight', () => {
  const root = homonymFixture();
  const first = publicExportSurface({ root, aliases: [], cache: true });
  const index = path.join(root, 'packages/core/src/index.ts');
  fs.writeFileSync(
    index,
    fs
      .readFileSync(index, 'utf8')
      .replace(
        "export type { LinkProps as NavLinkProps } from './components/primitives/navigation/Link';",
        "export type { LinkProps as NavLinkProps } from './components/primitives/display/Typography';",
      ),
  );

  const cached = publicExportSurface({ root, aliases: [], cache: true });
  const fresh = publicExportSurface({ root, aliases: [], cache: false });
  const terminal = (surface) => surface.bindings.find((binding) => binding.name === 'NavLinkProps').file;
  assert.equal(terminal(cached), terminal(first), 'cache:true deliberately preserves the preflight snapshot');
  assert.notEqual(terminal(fresh), terminal(first), 'cache:false must observe the changed source graph');

  const cli = fs.readFileSync(new URL('../cli/index.mjs', import.meta.url), 'utf8');
  assert.match(
    cli,
    /loadProgramContracts\(\{ fresh: true \}\)[\s\S]*?cache: false/,
    'the writer postcheck must refresh both persisted contracts and the source surface',
  );
});

test('POSITIVE: a document written from source reports no generated drift', () => {
  const root = homonymFixture();
  const result = checkInventoryCorrespondence({ contracts: fixturePersisted(root), root, aliases: [] });

  assert.deepEqual(result.staleGeneratedRows, []);
  assert.deepEqual(result.staleGeneratedTopLevelFields, []);
  assert.deepEqual(result.blockers, []);
  assert.equal(result.sourceValid, true);
  assert.equal(result.valid, true);
});

test('NEGATIVE DRILL: a hand-edited publicExports list is reported on that field and that row alone', () => {
  // The check used to recompute every field and compare it to the value it had just
  // recomputed, so it agreed with itself no matter what the file said. This is the drill
  // that fails if that ever returns.
  const root = homonymFixture();
  const persisted = fixturePersisted(root);
  const tampered = {
    ...persisted,
    inventory: {
      ...persisted.inventory,
      rows: persisted.inventory.rows.map((row) =>
        row.id === 'primitive/navigation/link'
          ? { ...row, publicExports: [...row.publicExports, 'LinkProps'] }
          : row,
      ),
    },
  };

  const result = checkInventoryCorrespondence({ contracts: tampered, root, aliases: [] });
  assert.deepEqual(result.staleGeneratedRows, [
    { id: 'primitive/navigation/link', fields: ['publicExports'] },
  ]);
  assert.equal(result.valid, false);
  // Drift is not a source defect: the writer must stay able to repair it.
  assert.equal(result.sourceValid, true);
});

test('NEGATIVE DRILL: reordering publicExports is drift, because the order is part of the contract', () => {
  const root = homonymFixture();
  const persisted = fixturePersisted(root);
  const tampered = {
    ...persisted,
    inventory: {
      ...persisted.inventory,
      rows: persisted.inventory.rows.map((row) =>
        row.id === 'primitive/navigation/link' ? { ...row, publicExports: [...row.publicExports].reverse() } : row,
      ),
    },
  };

  const result = checkInventoryCorrespondence({ contracts: tampered, root, aliases: [] });
  assert.deepEqual(result.staleGeneratedRows, [
    { id: 'primitive/navigation/link', fields: ['publicExports'] },
  ]);
});

test('NEGATIVE DRILL: a row key the writer would drop is reported as unexpected drift', () => {
  const root = homonymFixture();
  const persisted = fixturePersisted(root);
  const tampered = {
    ...persisted,
    inventory: {
      ...persisted.inventory,
      rows: persisted.inventory.rows.map((row) =>
        row.id === 'primitive/navigation/link'
          ? { ...row, legacyGeneratedEvidence: 'stale' }
          : row,
      ),
    },
  };

  const result = checkInventoryCorrespondence({ contracts: tampered, root, aliases: [] });
  assert.deepEqual(result.staleGeneratedRows, [
    { id: 'primitive/navigation/link', fields: ['unexpected:legacyGeneratedEvidence'] },
  ]);
  assert.equal(result.sourceValid, false);
  assert.ok(result.sourceBlockers.some((blocker) => blocker.includes('unknown row field legacyGeneratedEvidence')));
  assert.equal(result.valid, false);
});

test('BOUND: the persisted row shape is exactly authored plus generated fields', () => {
  const root = homonymFixture();
  const persisted = JSON.parse(JSON.stringify(fixturePersisted(root)));
  const expectedKeys = [...AUTHORED_ROW_FIELDS, ...[
    'sourceOwner',
    'resolvedBy',
    'layerProfile',
    'layerProfileSignal',
    'divergenceProfile',
    'publicExports',
    'declaredComponentsPublic',
    'declaredComponentsNotPubliclyNamed',
    'sourceResolution',
  ]];
  for (const row of persisted.inventory.rows) assert.deepEqual(Object.keys(row), expectedKeys);
  assert.deepEqual(
    checkInventoryCorrespondence({ contracts: persisted, root, aliases: [] }).staleGeneratedRows,
    [],
  );
});

test('BOUND: editing an AUTHORED field produces no generated drift', () => {
  // The separation has to hold in both directions. `family` is a human's declaration, not
  // an output of this module, so changing it must not make the file look stale -- otherwise
  // every authoring edit would demand a regeneration and the signal would be worthless.
  const root = homonymFixture();
  const persisted = fixturePersisted(root);
  const renamed = {
    ...persisted,
    inventory: {
      ...persisted.inventory,
      rows: persisted.inventory.rows.map((row) =>
        row.id === 'primitive/display/typography' ? { ...row, family: 'TypographyFamily' } : row,
      ),
    },
  };

  const result = checkInventoryCorrespondence({ contracts: renamed, root, aliases: [] });
  assert.deepEqual(result.staleGeneratedRows, []);
  assert.deepEqual(result.staleGeneratedTopLevelFields, []);
});

test('NEGATIVE DRILL: a stale generated top-level field is reported by name', () => {
  const root = homonymFixture();
  const persisted = fixturePersisted(root);
  const tampered = {
    ...persisted,
    inventory: { ...persisted.inventory, resolutionLaw: 'hand-maintained; do not regenerate' },
  };

  const result = checkInventoryCorrespondence({ contracts: tampered, root, aliases: [] });
  assert.deepEqual(result.staleGeneratedTopLevelFields, ['resolutionLaw']);
  assert.deepEqual(result.staleGeneratedRows, []);
  assert.equal(result.valid, false);
});

test('NEGATIVE DRILL: a perfectly current document does not excuse a source blocker', () => {
  // `sourceValid` is what the writer preflights on, so it must not be satisfiable by
  // regenerating the file. Here every generated field already agrees with source and the
  // source is still broken; preflight has to refuse.
  const root = homonymFixture({ danglingExport: true });
  const persisted = fixturePersisted(root);
  const result = checkInventoryCorrespondence({ contracts: persisted, root, aliases: [] });

  assert.deepEqual(result.staleGeneratedRows, []);
  assert.deepEqual(result.staleGeneratedTopLevelFields, []);
  assert.equal(result.sourceValid, false);
  assert.equal(result.valid, false);
});

test('LIVE: the navigation Link family projects its aliases and never the bare LinkProps', () => {
  // The same law on the real tree. `LinkProps` is genuinely public and genuinely belongs to
  // Typography; this is the assertion the previous implementation could not make.
  const resolved = resolveInventory();
  const nav = resolved.rows.find((row) => row.id === 'primitive/navigation/link');
  assert.ok(nav, 'primitive/navigation/link must exist in the live inventory');
  assert.deepEqual(nav.publicExports, NAV_LINK_PROJECTION);

  assert.ok(resolved.publicNames.has('LinkProps'), 'the bare name is still publicly exported');
  const terminals = new Set(
    resolved.bindings.filter((binding) => binding.name === 'LinkProps').map((binding) => binding.file),
  );
  assert.equal(terminals.size, 1);
  assert.match([...terminals][0], /components\/primitives\/display\/typography\/contracts/);
});

test('LIVE: the public surface resolves completely and ownership stays a partition', () => {
  // Both source-level laws measured against the real package rather than a fixture. A
  // regression in either one makes every ownership claim below it unreliable, so they are
  // asserted as zero rather than reported as a count.
  const result = checkInventoryCorrespondence();
  assert.equal(result.publicResolutionFailures, 0);
  assert.deepEqual(result.sourceBlockers, []);
  assert.equal(result.sourceValid, true);
});

// --- The resolution law the refactor changed, which nothing exercised --------
//
// Two rules landed with the folderization and had no drill: the category root
// is excluded from candidacy, and remaining candidates are ordered by path
// depth rather than taken in symbol-table order (`bySymbol[0]`). Both decide
// WHICH OWNER a family resolves to, so an untested change here silently
// re-attributes rows.

test('the category root is never a family owner, on either resolution tier', () => {
  // A category folder aggregates peer families; attributing a family to it
  // would make the owner set stop being a partition, which every ownership
  // claim below depends on.
  const resolved = resolveInventory();
  const categoryRoots = new Set(resolved.rows.map((row) => `${row.sourceRoot}/${row.category}`));
  const offenders = resolved.rows.filter((row) => row.sourceOwner && categoryRoots.has(row.sourceOwner));
  assert.deepEqual(offenders.map((row) => row.id), []);
  // Non-vacuity: the emptiness above must come from real rows carrying real
  // owners, not from an empty inventory.
  assert.ok(resolved.rows.length >= 200, `expected the live inventory, got ${resolved.rows.length}`);
  assert.equal(resolved.rows.filter((row) => !row.sourceOwner).length, 0, 'every row must resolve an owner');
});

test('candidate owners are ordered by depth, so the shallowest real owner wins', () => {
  // `bySymbol[0]` took whatever the symbol table happened to list first, which
  // is insertion order, not a law. Depth ordering is the law: a family owner is
  // the shallowest folder that declares it and is not the category root.
  const resolved = resolveInventory();
  for (const row of resolved.rows) {
    if (row.resolvedBy !== 'component-symbol') continue;
    assert.ok(
      row.sourceOwner.startsWith(`${row.sourceRoot}/`),
      `${row.id} resolved to ${row.sourceOwner}, outside its declared source root`,
    );
  }
  // And the ordering itself, stated as a property rather than sampled: no row
  // may name an owner that strictly contains another row's owner in the same
  // category, because the contained one is the more specific real owner.
  const owners = new Map();
  for (const row of resolved.rows) if (row.sourceOwner) owners.set(row.sourceOwner, row.id);
  for (const [owner, id] of owners) {
    for (const [other, otherId] of owners) {
      if (owner === other) continue;
      assert.equal(
        other.startsWith(`${owner}/`),
        false,
        `${id} owns ${owner}, which strictly contains ${otherId}'s owner ${other}`,
      );
    }
  }
});
