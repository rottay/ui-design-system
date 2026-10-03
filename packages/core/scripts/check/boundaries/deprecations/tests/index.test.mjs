/**
 * The drill for the deprecation ledger gate.
 *
 * Every mutant is planted on a fixture tree, never on the package: a marker
 * the ledger does not name, a row whose marker is gone, a receiver that is
 * closed, a claim the tree contradicts. Each negative asserts that the gate is
 * red for that reason and for nothing else, so a mutant cannot pass because an
 * unrelated rule happened to fire. N1-N14 and P1-P5 are the numbered cases of
 * the instrument's design; the unnumbered ones cover the remaining refusals.
 */
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, describe, it } from 'node:test';

import {
  BLOCKERS, CLASSES, CODEMOD_FIXTURES_PATH, CODEMOD_MAP_PATH, CODEMOD_TESTS_PATH, GATES_MANIFEST_PATH, HEADER_KEYS,
  LEDGER_PATH, REGISTRY_PATH, ROW_KEYS, codemodIdProblem, evaluate, fixtureVerdict, identifierResolves,
  loadCodemodLookup, measure, parseArgs, reasonProblem, run, scanMarkers,
} from '../index.mjs';
import { packageRoot as findPackageRoot } from '../../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REAL_PACKAGE = findPackageRoot(HERE);

const OWNER = 'WO-RET-01';
const SUCCESSOR = 'WO-FIX-06';
const OTHER_RETIRE = 'WO-RET-04';

const sandboxes = [];
after(() => { for (const dir of sandboxes) rmSync(dir, { recursive: true, force: true }); });

const CONTRACTS = 'src/widget/contracts/index.ts';
const CLASSIC = 'src/widget/engines/classic/index.tsx';
const MODERN = 'src/widget/engines/modern/index.tsx';
const LOWERING = 'src/widget/runtime/lowering/index.ts';
const SHOWROOM_PAGE = 'packages/showroom/src/page.tsx';

const SOURCES = {
  [CONTRACTS]: [
    'export interface WidgetProps {',
    '  /** @deprecated Use `paddingInlineEnd`. */',
    '  paddingRight?: number;',
    '  paddingInlineEnd?: number;',
    '  /**',
    '   * Colour axis.',
    '   * @deprecated Use `tone`.',
    '   */',
    '  variant?: string;',
    '  tone?: string;',
    '  /** @deprecated Use `cellRender`. */',
    '  dateCellRender?: () => void;',
    '  /** @deprecated Use `surfaceRoles`. */',
    '  materials?: object;',
    '  surfaceRoles?: object;',
    '  /** @deprecated Use `spacing`. */',
    '  margin?: number;',
    '  spacing?: number;',
    '}',
    '',
    'export type WidgetSide =',
    "  | 'inline-start'",
    '  /** @deprecated Use `inline-start`. */',
    "  | 'left';",
    '',
  ].join('\n'),
  [CLASSIC]: [
    "const SIDES = { left: 'left' };",
    'export function ClassicWidget(props: { paddingRight?: number }) {',
    '  return <div style={{ paddingRight: props.paddingRight }} data-side={SIDES.left} />;',
    '}',
    '',
  ].join('\n'),
  [MODERN]: [
    'export function ModernWidget(props: { paddingInlineEnd?: number; dateCellRender?: () => void }) {',
    '  props.dateCellRender?.();',
    '  return <div style={{ paddingInlineEnd: props.paddingInlineEnd }} />;',
    '}',
    '',
  ].join('\n'),
  [LOWERING]: 'export const roles = (s: { surfaceRoles?: object; materials?: object }) => s.surfaceRoles ?? s.materials;\n',
};

function baseRow(anchor, fields) {
  return {
    file: CONTRACTS,
    anchor,
    class: 'debt',
    reason: 'Earlier name of the `spacing` prop of the widget; no caller in the consumer roots passes it.',
    scope: 'One optional prop of `WidgetProps`.',
    replacement: '`spacing`',
    canonicalOwner: null,
    blocker: null,
    receiver: OWNER,
    since: '2026-09-01',
    removeIn: '3.0',
    evidence: [],
    codemod: null,
    changeset: null,
    ...fields,
  };
}

function baseRows() {
  return [
    baseRow('WidgetProps.paddingRight', {
      class: 'compat-frozen-sole-implementer',
      reason: 'The frozen Classic widget engine reads `paddingRight` and has no reader for `paddingInlineEnd`.',
      replacement: '`paddingInlineEnd`',
      canonicalOwner: MODERN,
      blocker: 'frozen-equivalence-absent',
      removeIn: '4.0',
      evidence: [{ kind: 'frozen-implementer', path: `packages/core/${CLASSIC}`, needle: 'props.paddingRight', absentNeedle: 'paddingInlineEnd' }],
    }),
    baseRow('WidgetProps.variant', {
      class: 'compat-consumed',
      reason: 'The showroom page still authors `variant` on the widget; the tone mapping has no parity verdict.',
      replacement: '`tone`',
      canonicalOwner: CONTRACTS,
      blocker: 'parity-unproven',
      evidence: [{ kind: 'consumer', path: SHOWROOM_PAGE, needle: '<Widget variant="primary" />' }],
    }),
    baseRow('WidgetProps.dateCellRender', {
      class: 'compat-canon-pending',
      reason: 'The Modern widget engine renders cells only through `dateCellRender` and does not read `cellRender`.',
      replacement: '`cellRender`',
      canonicalOwner: MODERN,
      blocker: 'replacement-capability-absent:cellRender',
      removeIn: '4.0',
      evidence: [{ kind: 'gate', id: 'widget-cells' }],
    }),
    baseRow('WidgetProps.materials', {
      class: 'compat-persisted-data',
      reason: 'Stored schema-v1 payloads may carry `materials`; the lowering reads it when `surfaceRoles` is absent.',
      replacement: '`surfaceRoles`',
      canonicalOwner: CONTRACTS,
      blocker: 'persisted-data-unproven',
      removeIn: '4.0',
      evidence: [{ kind: 'persisted-reader', path: `packages/core/${LOWERING}`, needle: 's.surfaceRoles ?? s.materials' }],
    }),
    baseRow('WidgetProps.margin', {}),
    baseRow("WidgetSide.'left'", {
      class: 'compat-frozen-sole-implementer',
      reason: 'The frozen Classic widget engine maps sides through a physical table with `left` and no `inline-start`.',
      replacement: "`'inline-start'`",
      canonicalOwner: MODERN,
      blocker: 'frozen-equivalence-absent',
      removeIn: '4.0',
      evidence: [{ kind: 'frozen-implementer', path: `packages/core/${CLASSIC}`, needle: "left: 'left'", absentNeedle: 'inline-start' }],
    }),
  ];
}

function baseRegistry() {
  return {
    workOrders: [
      { id: OWNER, lane: 'retire', status: 'in-progress', programs: ['audit'] },
      { id: 'WO-RET-02', lane: 'retire', status: 'done', programs: ['audit'] },
      { id: OTHER_RETIRE, lane: 'retire', status: 'todo', programs: ['audit'] },
      { id: SUCCESSOR, lane: 'retire', status: 'todo', programs: ['audit'] },
      { id: 'WO-CRA-15', lane: 'craft', status: 'todo', phase: '2C', programs: ['improvements'] },
    ],
    traceability: { improvements: { phaseControls: { '2C': { claimState: 'locked' } } } },
  };
}

/**
 * A fixture workspace. `mutate` receives the mutable parts before they are
 * written: `sources` (package-relative), `files` (repo-relative), `ledger`,
 * `registry` and `pkg`.
 */
function tree(mutate = () => {}) {
  const repoRoot = mkdtempSync(join(tmpdir(), 'ret01-deprecations-'));
  sandboxes.push(repoRoot);
  const packageRoot = join(repoRoot, 'packages/core');
  const parts = {
    sources: { ...SOURCES },
    files: {
      [SHOWROOM_PAGE]: 'export const Page = () => <Widget variant="primary" />;\n',
      [`packages/core/${GATES_MANIFEST_PATH}`]:
        "export const GATES = [{ id: 'widget-cells', run: ['node', 'x.mjs'], blocking: true }];\n",
    },
    ledger: { schema: 1, sealedAt: '2026-10-03', noDebtReceivers: [SUCCESSOR], compatReceivers: [SUCCESSOR], notes: [], rows: baseRows() },
    registry: baseRegistry(),
    pkg: { name: '@rottay/design-system', version: '2.19.36' },
  };
  mutate(parts);
  const write = (root, path, content) => {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  };
  write(repoRoot, 'pnpm-workspace.yaml', 'packages:\n  - packages/*\n');
  write(packageRoot, 'package.json', JSON.stringify(parts.pkg, null, 2));
  for (const [path, content] of Object.entries(parts.sources)) {
    if (content !== null) write(packageRoot, path, content);
  }
  for (const [path, content] of Object.entries(parts.files)) write(repoRoot, path, content);
  if (parts.ledger !== null) {
    write(packageRoot, LEDGER_PATH, typeof parts.ledger === 'string' ? parts.ledger : JSON.stringify(parts.ledger, null, 2));
  }
  write(repoRoot, REGISTRY_PATH, JSON.stringify(parts.registry, null, 2));
  return { packageRoot, repoRoot };
}

function check(mutate, options) {
  return evaluate(measure(tree(mutate)), options);
}

/** The gate is red, and every failure it reports matches `pattern`. */
function assertRedOnlyFor(result, pattern, count) {
  assert.ok(result.failures.length > 0, 'the gate stayed green on a planted defect');
  for (const failure of result.failures) assert.match(failure, pattern);
  if (count !== undefined) assert.equal(result.failures.length, count, result.failures.join('\n'));
}

function assertGreen(result) {
  assert.deepEqual(result.failures, [], result.failures.join('\n'));
}

const rowOf = (parts, anchor) => parts.ledger.rows.find((row) => row.anchor === anchor);
const dropRow = (parts, anchor) => { parts.ledger.rows = parts.ledger.rows.filter((row) => row.anchor !== anchor); };
const replaceIn = (parts, path, from, to) => {
  assert.ok(parts.sources[path].includes(from), `fixture drift: ${path} has no \`${from}\``);
  parts.sources[path] = parts.sources[path].replace(from, to);
};

const FIXTURE = 'prop-renamed/widget-variant';
const idOf = (row) => `prop-renamed/.#WidgetProps.${row.anchor.split('.').at(-1).replace(/'/g, '')}`;
/** A wired codemod lookup that knows exactly the given ids. */
const wiredFor = (known) => ({ status: 'wired', has: (id) => known.includes(id) });
const ALL_IDS = ['paddingRight', 'variant', 'dateCellRender', 'materials', 'margin', 'left'].map((name) => `prop-renamed/.#WidgetProps.${name}`);

const NEW_MARKER_SOURCE = ['  /** @deprecated Use `spacing`. */', '  margin?: number;'].join('\n');
const WITH_NEW_MARKER = [NEW_MARKER_SOURCE, '  /** @deprecated Use `label`. */', '  title?: string;'].join('\n');

/** Every row re-homed to the successor, with a verdict fixture and a codemod id; the debt row is retired. */
function rehome(parts) {
  replaceIn(parts, CONTRACTS, `${NEW_MARKER_SOURCE}\n`, '');
  dropRow(parts, 'WidgetProps.margin');
  parts.files[`packages/core/${CODEMOD_FIXTURES_PATH}/${FIXTURE}/expected/index.tsx`] = 'export {};\n';
  for (const row of parts.ledger.rows) {
    row.receiver = SUCCESSOR;
    row.codemod = idOf(row);
  }
  rowOf(parts, 'WidgetProps.variant').blocker = `parity-failed:${FIXTURE}`;
}

describe('deprecations — positives', () => {
  it('P1: a clean tree is green and reports its classes', () => {
    const result = check();
    assertGreen(result);
    assert.equal(result.report.markers, 6);
    assert.equal(result.report.rows, 6);
    assert.deepEqual(result.report.byClass, {
      debt: 1,
      'compat-consumed': 1,
      'compat-frozen-sole-implementer': 2,
      'compat-canon-pending': 1,
      'compat-persisted-data': 1,
    });
  });

  it('P2: a marker and its row removed together stay green', () => {
    assertGreen(check((parts) => {
      replaceIn(parts, CONTRACTS, `${NEW_MARKER_SOURCE}\n`, '');
      dropRow(parts, 'WidgetProps.margin');
    }));
  });

  it('P3: --consumers with one resolved use is green', () => {
    const asked = [];
    const result = check(undefined, { consumers: (row) => { asked.push(row.anchor); return { uses: 1, roots: ['showroom'] }; } });
    assertGreen(result);
    assert.deepEqual(asked, ['WidgetProps.variant'], 'only compat-consumed rows are asked');
    assert.deepEqual(result.report.consumers, [{ row: `${CONTRACTS}#WidgetProps.variant`, uses: 1, roots: ['showroom'] }]);
  });

  it('P4: a fully re-homed tree is green with and without --assume-done', () => {
    const codemods = wiredFor(ALL_IDS);
    assertGreen(check(rehome, { codemods }));
    const closed = check(rehome, { assumeDone: [OWNER], codemods });
    assertGreen(closed);
    assert.equal(closed.report.byClass.debt, 0);
    assert.deepEqual(closed.report.byReceiver, { [SUCCESSOR]: 5 });
    assert.deepEqual(closed.report.codemodLookup, { map: 5 });
  });

  it('P5: a debt row naming another open work order of lane retire is green', () => {
    assertGreen(check((parts) => { rowOf(parts, 'WidgetProps.margin').receiver = OTHER_RETIRE; }));
  });

  it('a marker introduced after the seal is green once its changeset names it', () => {
    assertGreen(check((parts) => {
      replaceIn(parts, CONTRACTS, NEW_MARKER_SOURCE, WITH_NEW_MARKER);
      parts.files['.changeset/widget-title.md'] = '---\n"@rottay/design-system": major\n---\n`WidgetProps.title` is deprecated.\n';
      parts.ledger.rows.push(baseRow('WidgetProps.title', {
        reason: 'Earlier name of the `label` prop of the widget; deprecated in this release with no caller left.',
        replacement: '`label`',
        since: '2026-10-10',
        changeset: '.changeset/widget-title.md',
      }));
    }));
  });

  it('a module-level marker anchors to <module>', () => {
    const { packageRoot } = tree((parts) => {
      parts.sources['src/widget/compound/legacy/index.tsx'] = [
        "'use client';",
        '',
        '/**',
        ' * @deprecated import `Widget`.',
        ' */',
        '',
        "import { forwardRef } from 'react';",
        'export const Legacy = forwardRef(() => null);',
        '',
      ].join('\n');
    });
    const scan = scanMarkers(packageRoot);
    assert.deepEqual(scan.problems, []);
    assert.ok(scan.markers.some((marker) => marker.anchor === '<module>' && marker.file.endsWith('legacy/index.tsx')));
  });
});

describe('deprecations — negatives', () => {
  it('N1: a marker without a row is red by name', () => {
    const result = check((parts) => replaceIn(parts, CONTRACTS, NEW_MARKER_SOURCE, WITH_NEW_MARKER));
    assertRedOnlyFor(result, /`WidgetProps\.title`: marker without a row/, 1);
  });

  it('N2: a row without a marker is red by name', () => {
    const result = check((parts) => replaceIn(parts, CONTRACTS, '  /** @deprecated Use `spacing`. */\n', ''));
    assertRedOnlyFor(result, /`WidgetProps\.margin`: row without a marker/, 1);
  });

  it('N3: a receiver that is done is red', () => {
    const result = check((parts) => { rowOf(parts, 'WidgetProps.materials').receiver = 'WO-RET-02'; });
    assertRedOnlyFor(result, /`WidgetProps\.materials`: receiver WO-RET-02 is done/, 1);
  });

  it('N4: a receiver the registry does not know is red', () => {
    const result = check((parts) => { rowOf(parts, 'WidgetProps.materials').receiver = 'WO-RET-99'; });
    assertRedOnlyFor(result, /`WidgetProps\.materials`: receiver WO-RET-99 is not a work order/, 1);
    const shapeless = check((parts) => { rowOf(parts, 'WidgetProps.materials').receiver = 'the retirement lane'; });
    assertRedOnlyFor(shapeless, /is not a work order id/, 1);
  });

  it('N5: a marker newer than the seal is red without a changeset that names it', () => {
    const plant = (changeset, files = {}) => (parts) => {
      replaceIn(parts, CONTRACTS, NEW_MARKER_SOURCE, WITH_NEW_MARKER);
      Object.assign(parts.files, files);
      parts.ledger.rows.push(baseRow('WidgetProps.title', {
        reason: 'Earlier name of the `label` prop of the widget; deprecated in this release with no caller left.',
        replacement: '`label`',
        since: '2026-10-10',
        changeset,
      }));
    };
    assertRedOnlyFor(check(plant(null)), /`WidgetProps\.title`: row is newer than sealedAt 2026-10-03 and names no changeset/, 1);
    assertRedOnlyFor(check(plant('.changeset/absent.md')), /changeset \.changeset\/absent\.md does not exist/, 1);
    assertRedOnlyFor(
      check(plant('.changeset/other.md', { '.changeset/other.md': 'A different change.\n' })),
      /changeset \.changeset\/other\.md does not name `title`/,
      1,
    );
    assertRedOnlyFor(check(plant('docs/notes.md', { 'docs/notes.md': 'title\n' })), /is not a file of \.changeset\//, 1);
  });

  it('N6: a marker on a union member is scanned, anchored and owed a row', () => {
    const { packageRoot } = tree();
    const anchors = scanMarkers(packageRoot).markers.map((marker) => marker.anchor);
    assert.ok(anchors.includes("WidgetSide.'left'"), `union literal not anchored: ${anchors.join(', ')}`);
    const result = check((parts) => dropRow(parts, "WidgetSide.'left'"));
    assertRedOnlyFor(result, /`WidgetSide\.'left'`: marker without a row/, 1);
  });

  it('N7: a frozen engine that now reads the replacement is red', () => {
    const result = check((parts) => {
      parts.sources[CLASSIC] += 'export const reads = (props: { paddingInlineEnd?: number }) => props.paddingInlineEnd;\n';
    });
    assertRedOnlyFor(result, /`WidgetProps\.paddingRight`: evidence `frozen-implementer`: .* now contains `paddingInlineEnd`|`WidgetProps\.paddingRight`: compat-frozen-sole-implementer row has no verified/);
    assert.ok(result.failures.some((failure) => /now contains `paddingInlineEnd`/.test(failure)));
  });

  it('N7b: frozen evidence outside a frozen engine, or with a missing needle, is red', () => {
    const outside = check((parts) => { rowOf(parts, 'WidgetProps.paddingRight').evidence[0].path = `packages/core/${MODERN}`; });
    assert.ok(outside.failures.some((failure) => /is not under engines\/classic or engines\/rustic/.test(failure)));
    const gone = check((parts) => replaceIn(parts, CLASSIC, 'props.paddingRight', 'undefined'));
    assert.ok(gone.failures.some((failure) => /no longer contains `props\.paddingRight`/.test(failure)));
    assertRedOnlyFor(gone, /`WidgetProps\.paddingRight`/);
  });

  it('N8: a non-debt row without a blocker is red', () => {
    const result = check((parts) => { rowOf(parts, 'WidgetProps.materials').blocker = null; });
    assertRedOnlyFor(result, /`WidgetProps\.materials`: compat-persisted-data row has no blocker/, 1);
    const invented = check((parts) => { rowOf(parts, 'WidgetProps.materials').blocker = 'waiting-for-someone'; });
    assertRedOnlyFor(invented, /blocker `waiting-for-someone` is not one of/, 1);
    const misfiled = check((parts) => { rowOf(parts, 'WidgetProps.materials').blocker = 'frozen-equivalence-absent'; });
    assertRedOnlyFor(misfiled, /does not belong to class compat-persisted-data/, 1);
  });

  it('N9: a glob row is refused and absolves no marker', () => {
    const result = check((parts) => {
      parts.ledger.rows = [baseRow('WidgetProps.*', {})];
    });
    assert.ok(result.failures.some((failure) => /a glob is a blanket exemption/.test(failure)));
    assert.equal(result.failures.filter((failure) => /marker without a row/.test(failure)).length, 6);
    const fileGlob = check((parts) => { rowOf(parts, 'WidgetProps.margin').file = 'src/**/contracts/index.ts'; });
    assert.ok(fileGlob.failures.some((failure) => /a glob is a blanket exemption/.test(failure)));
    assert.ok(fileGlob.failures.some((failure) => /`WidgetProps\.margin`: marker without a row/.test(failure)));
  });

  it('N10: --assume-done on the owner is red for every row it still receives', () => {
    const result = check(undefined, { assumeDone: [OWNER] });
    assert.ok(result.failures.some((failure) => /`WidgetProps\.margin`: receiver WO-RET-01 is assumed done/.test(failure)));
    assert.equal(result.failures.filter((failure) => /is assumed done/.test(failure)).length, 6);
    const unknown = check(undefined, { assumeDone: ['WO-RET-77'] });
    assert.ok(unknown.failures.some((failure) => /--assume-done=WO-RET-77: not a work order/.test(failure)));
  });

  it('N10b: under --assume-done a verdict or a codemod still owed is red', () => {
    const result = check((parts) => {
      replaceIn(parts, CONTRACTS, `${NEW_MARKER_SOURCE}\n`, '');
      dropRow(parts, 'WidgetProps.margin');
      for (const row of parts.ledger.rows) row.receiver = SUCCESSOR;
    }, { assumeDone: [OWNER] });
    assert.ok(result.failures.some((failure) => /`WidgetProps\.variant`: blocker `parity-unproven` under --assume-done/.test(failure)));
    assert.equal(result.failures.filter((failure) => /names no codemod entry under --assume-done/.test(failure)).length, 5);
    assertRedOnlyFor(result, /under --assume-done/);
  });

  it('H1.1: under --assume-done a debt row is red whatever its receiver', () => {
    const plant = (parts) => {
      rehome(parts);
      parts.sources[CONTRACTS] = SOURCES[CONTRACTS];
      parts.ledger.rows.push(baseRow('WidgetProps.margin', { receiver: OTHER_RETIRE }));
    };
    assertGreen(check(plant, { codemods: wiredFor(ALL_IDS) }));
    const closed = check(plant, { assumeDone: [OWNER], codemods: wiredFor(ALL_IDS) });
    assertRedOnlyFor(closed, /`WidgetProps\.margin`: debt cannot cross a closure/, 1);
  });

  it('H1.2: under --assume-done a codemod id the map did not confirm is red', () => {
    const shapeOnly = check(rehome, { assumeDone: [OWNER] });
    assertRedOnlyFor(shapeOnly, /was checked for shape only under --assume-done \(no map lookup was supplied\)/, 5);
    const unavailable = check(rehome, { assumeDone: [OWNER], codemods: { status: 'unavailable', reason: 'the kit threw' } });
    assertRedOnlyFor(unavailable, /was checked for shape only under --assume-done \(the kit threw\)/, 5);
    const live = check(rehome);
    assertGreen(live);
    assert.deepEqual(live.report.codemodLookup, { 'shape-only': 5 });
    const absent = check(rehome, { codemods: wiredFor(ALL_IDS.filter((id) => !id.endsWith('.variant'))) });
    assertRedOnlyFor(absent, /`WidgetProps\.variant`: codemod id `prop-renamed\/\.#WidgetProps\.variant` has no entry in/, 1);
  });

  it('H1.3: a parity or direction blocker needs a fixture that carries a verdict', () => {
    const codemods = wiredFor(ALL_IDS);
    for (const blocker of ['parity-failed', 'direction-semantics']) {
      const bare = check((parts) => { rehome(parts); rowOf(parts, 'WidgetProps.variant').blocker = blocker; }, { codemods });
      assertRedOnlyFor(bare, new RegExp(`blocker \`${blocker}\` is not one of`), 1);
      const nowhere = check((parts) => { rehome(parts); rowOf(parts, 'WidgetProps.variant').blocker = `${blocker}:prop-renamed/nowhere`; }, { codemods });
      assertRedOnlyFor(nowhere, /no fixture directory at scripts\/maintain\/codemods\/fixtures\/prop-renamed\/nowhere/, 1);
      const hollow = (parts) => {
        rehome(parts);
        parts.files[`packages/core/${CODEMOD_FIXTURES_PATH}/prop-renamed/hollow/input/index.tsx`] = 'export {};\n';
        rowOf(parts, 'WidgetProps.variant').blocker = `${blocker}:prop-renamed/hollow`;
      };
      for (const options of [{ codemods }, { codemods, assumeDone: [OWNER] }]) {
        assertRedOnlyFor(check(hollow, options), /fixture .*prop-renamed\/hollow carries no verdict/, 1);
      }
      const tested = (parts) => {
        hollow(parts);
        parts.files[`packages/core/${CODEMOD_TESTS_PATH}/fixtures.test.mjs`] = "test('prop-renamed/hollow', () => {});\n";
      };
      assertGreen(check(tested, { codemods, assumeDone: [OWNER] }));
    }
    const file = tree((parts) => { parts.files[`packages/core/${CODEMOD_FIXTURES_PATH}/a-file`] = 'x\n'; });
    assert.match(fixtureVerdict(file.packageRoot, 'a-file'), /no fixture directory/);
    assert.match(fixtureVerdict(file.packageRoot, '../fixtures/a-file'), /is not a fixture path/);
  });

  it('H1.4: under --assume-done a non-debt receiver must be listed in compatReceivers', () => {
    const codemods = wiredFor(ALL_IDS);
    const elsewhere = (parts) => { rehome(parts); for (const row of parts.ledger.rows) row.receiver = OTHER_RETIRE; };
    assertGreen(check(elsewhere, { codemods }));
    const closed = check(elsewhere, { assumeDone: [OWNER], codemods });
    assertRedOnlyFor(closed, /must be listed in compatReceivers; WO-RET-04 is not \(WO-FIX-06\)/, 5);
    const empty = check((parts) => { rehome(parts); parts.ledger.compatReceivers = []; }, { assumeDone: [OWNER], codemods });
    assertRedOnlyFor(empty, /must be listed in compatReceivers; WO-FIX-06 is not \(the list is empty\)/, 5);
    const unknown = check((parts) => { parts.ledger.compatReceivers = ['WO-RET-99']; });
    assertRedOnlyFor(unknown, /compatReceivers entry WO-RET-99 is not a work order of/, 1);
    const missing = check((parts) => { delete parts.ledger.compatReceivers; });
    assert.ok(missing.failures.some((failure) => /header key `compatReceivers` is missing/.test(failure)));
  });

  it('H1: the blanket transfer is red four different ways', () => {
    const blanket = (parts) => {
      for (const row of parts.ledger.rows) {
        row.receiver = OTHER_RETIRE;
        if (row.blocker === 'parity-unproven') row.blocker = 'direction-semantics';
        if (row.class !== 'debt') row.codemod = idOf(row);
      }
    };
    const result = check(blanket, { assumeDone: [OWNER] });
    const count = (pattern) => result.failures.filter((failure) => pattern.test(failure)).length;
    assert.equal(count(/debt cannot cross a closure/), 1);
    assert.equal(count(/was checked for shape only under --assume-done/), 5);
    assert.equal(count(/blocker `direction-semantics` is not one of/), 1);
    assert.equal(count(/must be listed in compatReceivers; WO-RET-04 is not/), 5);
    assert.equal(result.failures.length, 12, result.failures.join('\n'));
    const wired = check(blanket, { assumeDone: [OWNER], codemods: wiredFor(ALL_IDS) });
    assert.equal(wired.failures.length, 7, 'a confirmed map removes only the codemod failures');
  });

  it('N11: replacement-capability-absent is red once the capability exists', () => {
    const result = check((parts) => {
      parts.sources[MODERN] += 'export const cells = (props: { cellRender?: () => void }) => props.cellRender;\n';
    });
    assertRedOnlyFor(result, /`WidgetProps\.dateCellRender`: blocker `replacement-capability-absent:cellRender`: `cellRender` resolves in/, 1);
  });

  it('N11b: a capability named only in a comment or a longer identifier does not resolve', () => {
    assert.equal(identifierResolves('// cellRender is planned\nexport const dateCellRender = 1;\n', 'a.ts', 'cellRender'), false);
    assert.equal(identifierResolves('export const x = { cellRender: 1 };\n', 'a.ts', 'cellRender'), true);
    assert.equal(identifierResolves('export function f({ cellRender }: P) { return cellRender; }\n', 'a.tsx', 'cellRender'), true);
  });

  it('N12: a non-debt row with empty evidence is red', () => {
    const result = check((parts) => { rowOf(parts, 'WidgetProps.dateCellRender').evidence = []; });
    assertRedOnlyFor(result, /`WidgetProps\.dateCellRender`: compat-canon-pending row has no evidence/, 1);
  });

  it('N12b: evidence that does not verify is red', () => {
    const stale = check((parts) => { parts.files[SHOWROOM_PAGE] = 'export const Page = () => <Widget tone="primary" />;\n'; });
    assert.ok(stale.failures.some((failure) => /no longer contains `<Widget variant="primary" \/>`/.test(failure)));
    assertRedOnlyFor(stale, /`WidgetProps\.variant`/);
    const self = check((parts) => {
      rowOf(parts, 'WidgetProps.variant').evidence = [{ kind: 'consumer', path: `packages/core/${CONTRACTS}`, needle: 'variant?: string;' }];
    });
    assert.ok(self.failures.some((failure) => /is the file that declares the marker, not a consumer/.test(failure)));
    const tooling = check((parts) => {
      parts.files['packages/core/scripts/check/x/index.mjs'] = 'variant\n';
      rowOf(parts, 'WidgetProps.variant').evidence = [{ kind: 'consumer', path: 'packages/core/scripts/check/x/index.mjs', needle: 'variant' }];
    });
    assert.ok(tooling.failures.some((failure) => /is tooling, not a consumer/.test(failure)));
    const wrongKind = check((parts) => {
      rowOf(parts, 'WidgetProps.variant').evidence = [{ kind: 'gate', id: 'widget-cells' }];
    });
    assertRedOnlyFor(wrongKind, /`WidgetProps\.variant`: compat-consumed row has no verified `consumer` evidence/, 1);
    const noGate = check((parts) => { rowOf(parts, 'WidgetProps.dateCellRender').evidence = [{ kind: 'gate', id: 'no-such-gate' }]; });
    assertRedOnlyFor(noGate, /no gate `no-such-gate`/, 1);
    const prose = check((parts) => { rowOf(parts, 'WidgetProps.dateCellRender').evidence = ['the review said so']; });
    assert.ok(prose.failures.some((failure) => /evidence entry is not an object/.test(failure)));
    const escape = check((parts) => {
      rowOf(parts, 'WidgetProps.variant').evidence = [{ kind: 'consumer', path: '../../etc/passwd', needle: 'root' }];
    });
    assert.ok(escape.failures.some((failure) => /leaves the workspace/.test(failure)));
  });

  it('N13: a debt row naming a receiver listed in noDebtReceivers is red', () => {
    const result = check((parts) => { rowOf(parts, 'WidgetProps.margin').receiver = SUCCESSOR; });
    assertRedOnlyFor(result, /`WidgetProps\.margin`: debt row names WO-FIX-06, which the ledger lists in noDebtReceivers/, 1);
    const lane = check((parts) => { rowOf(parts, 'WidgetProps.margin').receiver = 'WO-CRA-15'; });
    assertRedOnlyFor(lane, /debt row names WO-CRA-15 of lane `craft`/, 1);
  });

  it('N14: @deprecated inside a string is red, not skipped', () => {
    const result = check((parts) => {
      parts.sources['src/widget/runtime/notice/index.ts'] = "export const NOTICE = 'this prop is @deprecated';\n";
    });
    assertRedOnlyFor(result, /src\/widget\/runtime\/notice\/index\.ts:1: `@deprecated` outside a comment/, 1);
    const template = check((parts) => {
      parts.sources['src/widget/runtime/notice/index.ts'] = 'export const NOTICE = `a ${1} @deprecated tail`;\n';
    });
    assertRedOnlyFor(template, /outside a comment/, 1);
  });

  it('a marker the scanner cannot anchor is red', () => {
    const trailing = check((parts) => {
      parts.sources['src/widget/runtime/legacy/index.ts'] = 'export const legacy = 1; // @deprecated\n';
    });
    assertRedOnlyFor(trailing, /is not anchored to a declaration/, 1);
    const css = check((parts) => { parts.sources['src/widget/skin/index.css'] = '/* @deprecated */ .w { color: red }\n'; });
    assertRedOnlyFor(css, /src\/widget\/skin\/index\.css: 1 `@deprecated` occurrence\(s\) in a file the scanner cannot anchor/, 1);
    const twice = check((parts) => replaceIn(
      parts, CONTRACTS, '  /** @deprecated Use `spacing`. */', '  /** @deprecated Use `spacing`. Still @deprecated. */',
    ));
    assertRedOnlyFor(twice, /second `@deprecated` on `WidgetProps\.margin`/, 1);
  });

  it('a duplicate row is red', () => {
    const result = check((parts) => { parts.ledger.rows.push(baseRow('WidgetProps.margin', {})); });
    assertRedOnlyFor(result, /`WidgetProps\.margin`: duplicate row/, 1);
  });

  it('a class outside the closed list is red', () => {
    const result = check((parts) => { rowOf(parts, 'WidgetProps.margin').class = 'accepted-legacy'; });
    assertRedOnlyFor(result, /`WidgetProps\.margin`: class `accepted-legacy` is not one of/, 1);
  });

  it('an empty or vague reason is red', () => {
    for (const reason of ['', '   ', 'Legacy.', 'Kept for backwards compatibility.', 'Deprecated alias, will be removed in a future release.', 'TBD']) {
      const result = check((parts) => { rowOf(parts, 'WidgetProps.margin').reason = reason; });
      assertRedOnlyFor(result, /`WidgetProps\.margin`: reason is (empty|vague)/, 1);
    }
    assert.equal(reasonProblem('The frozen Classic engine reads `paddingRight` and has no logical reader.'), null);
  });

  it('an empty scope or replacement is red', () => {
    assertRedOnlyFor(check((parts) => { rowOf(parts, 'WidgetProps.margin').scope = ''; }), /scope is empty/, 1);
    assertRedOnlyFor(check((parts) => { rowOf(parts, 'WidgetProps.margin').replacement = null; }), /replacement is empty/, 1);
    assertRedOnlyFor(check((parts) => { rowOf(parts, 'WidgetProps.margin').replacement = 'none'; }), /replacement `none` must say why/, 1);
  });

  it('an unknown key, a missing key or a count ceiling is red', () => {
    const extra = check((parts) => { rowOf(parts, 'WidgetProps.margin').waiver = 'approved'; });
    assert.ok(extra.failures.some((failure) => /`WidgetProps\.margin`: unknown key `waiver`/.test(failure)));
    const missing = check((parts) => { delete rowOf(parts, 'WidgetProps.margin').removeIn; });
    assert.ok(missing.failures.some((failure) => /key `removeIn` is missing/.test(failure)));
    const ceiling = check((parts) => { parts.ledger.maxMarkers = 76; });
    assertRedOnlyFor(ceiling, /unknown header key `maxMarkers`/, 1);
    const header = check((parts) => { delete parts.ledger.sealedAt; });
    assert.ok(header.failures.some((failure) => /header key `sealedAt` is missing/.test(failure)));
  });

  it('an overdue removal line is red', () => {
    const result = check((parts) => { parts.pkg.version = '3.0.0'; });
    assert.equal(result.failures.filter((failure) => /is not later than the package version 3\.0\.0: the removal is overdue/.test(failure)).length, 2);
    assertRedOnlyFor(result, /the removal is overdue/, 2);
    assertRedOnlyFor(check((parts) => { rowOf(parts, 'WidgetProps.margin').removeIn = 'someday'; }), /removeIn `someday` is not a release line/, 1);
  });

  it('a codemod id of the wrong shape is red; the kit grammar is accepted', () => {
    const bad = check((parts) => { rowOf(parts, 'WidgetProps.variant').codemod = 'rename variant to tone'; });
    assertRedOnlyFor(bad, /codemod id `rename variant to tone` is not of the form/, 1);
    for (const id of [
      'prop-removed/.#StepperProps.initial', 'symbol-removed/.#TONE_TO_TAG_VARIANT', 'prop-renamed/.#TooltipValue.color',
      'subpath-removed/./patterns/charts#*', 'subpath-removed/./commercial.css#*', 'glyph-removed/./icons#XIcon',
    ]) {
      assert.equal(codemodIdProblem(id), null, id);
    }
    for (const id of ['prop-removed', 'prop-removed/#X', 'Prop/.#X', 'prop-removed/.#', 'prop-removed/src/x#X']) {
      assert.notEqual(codemodIdProblem(id), null, id);
    }
    const good = check((parts) => { rowOf(parts, 'WidgetProps.variant').codemod = 'prop-renamed/.#WidgetProps.variant'; });
    assertGreen(good);
    assert.deepEqual(good.report.codemodLookup, { 'shape-only': 1 });
  });

  it('the codemod lookup reads the real map and fails closed when it cannot', async () => {
    const real = await loadCodemodLookup({ packageRoot: REAL_PACKAGE });
    assert.equal(real.status, 'wired', real.reason);
    const kitMap = JSON.parse(readFileSync(join(REAL_PACKAGE, CODEMOD_MAP_PATH), 'utf8'));
    for (const entry of kitMap.entries) assert.equal(codemodIdProblem(entry.id), null, `the gate refuses a real map id: ${entry.id}`);
    assert.equal(real.has(kitMap.entries[0].id), true);
    assert.equal(real.has('prop-renamed/.#WidgetProps.neverDeclared'), false);
    const missing = await loadCodemodLookup(tree());
    assert.equal(missing.status, 'unavailable');
    assert.match(missing.reason, /does not exist/);
    const broken = tree((parts) => { parts.files[`packages/core/${CODEMOD_MAP_PATH}`] = '{ "entries": [ { "id": "not an id" } ] }'; });
    const refused = await loadCodemodLookup(broken);
    assert.equal(refused.status, 'unavailable');
    assert.match(refused.reason, /could not be loaded/);
    const closed = await run(['--check', '--assume-done=WO-RET-04'], { ...tree(rehome) });
    assert.equal(closed.code, 1);
    assert.equal(closed.failures.filter((failure) => /checked for shape only under --assume-done \(.*does not exist\)/.test(failure)).length, 5);
    const thrown = await run(['--check', '--assume-done=WO-RET-04'], {
      ...tree(rehome), codemodLookup: async () => ({ status: 'unavailable', reason: 'the codemod map could not be loaded: boom' }),
    });
    assert.equal(thrown.failures.filter((failure) => /boom/.test(failure)).length, 5);
  });

  it('a missing canonical owner is red', () => {
    const result = check((parts) => { rowOf(parts, 'WidgetProps.materials').canonicalOwner = 'src/widget/absent/index.ts'; });
    assertRedOnlyFor(result, /canonicalOwner src\/widget\/absent\/index\.ts does not exist/, 1);
    const none = check((parts) => { rowOf(parts, 'WidgetProps.materials').canonicalOwner = null; });
    assertRedOnlyFor(none, /names no canonicalOwner/, 1);
  });

  it('a missing or malformed ledger or registry is red', () => {
    assert.ok(check((parts) => { parts.ledger = null; }).failures.some((failure) => /index\.json does not exist/.test(failure)));
    assert.ok(check((parts) => { parts.ledger = '{ not json'; }).failures.some((failure) => /is not valid JSON/.test(failure)));
    const noRegistry = check((parts) => { parts.registry = {}; });
    assert.equal(noRegistry.failures.filter((failure) => /receiver WO-RET-01 is not a work order of roadmap\/registry\.json/.test(failure)).length, 6);
  });

  it('--consumers: zero resolved uses is red, and a missing resolver fails closed', async () => {
    const zero = check(undefined, { consumers: () => ({ uses: 0, roots: [] }) });
    assertRedOnlyFor(zero, /`WidgetProps\.variant`: compat-consumed with zero design-system-resolved uses/, 1);
    const silent = check(undefined, { consumers: () => null });
    assertRedOnlyFor(silent, /--consumers returned no use count/, 1);
    const roots = tree();
    const closed = await run(['--check', '--consumers'], roots);
    assert.equal(closed.code, 1);
    assert.match(closed.failures[0], /no consumer resolver is wired/);
    const wired = await run(['--check', '--consumers'], { ...roots, resolver: async () => () => ({ uses: 2, roots: ['showroom'] }) });
    assert.equal(wired.code, 0, wired.failures.join('\n'));
  });
});

describe('deprecations — reports and the command line', () => {
  it('a receiver behind a locked phase is reported, never a pass by itself', () => {
    const result = check((parts) => { rowOf(parts, 'WidgetProps.materials').receiver = 'WO-CRA-15'; });
    assertGreen(result);
    assert.deepEqual(result.report.receiverPhaseLocked, [
      { row: `${CONTRACTS}#WidgetProps.materials`, receiver: 'WO-CRA-15', phase: '2C' },
    ]);
  });

  it('evidence in a sibling checkout that is absent is reported as unverified', () => {
    const result = check((parts) => {
      rowOf(parts, 'WidgetProps.variant').evidence = [{ kind: 'consumer', path: '../app-absent/src/page.tsx', needle: '<Widget variant' }];
    });
    assertGreen(result);
    assert.deepEqual(result.report.unverifiedEvidence, [
      { row: `${CONTRACTS}#WidgetProps.variant`, kind: 'consumer', path: '../app-absent/src/page.tsx' },
    ]);
  });

  it('files named as tests are counted and not ledgered; a file merely under tests/ is scanned', () => {
    const result = check((parts) => {
      parts.sources['src/widget/tests/index.test.ts'] = "it('refuses a @deprecated prop', () => {});\n";
    });
    assertGreen(result);
    assert.equal(result.report.testFileOccurrences, 1);
    const hidden = check((parts) => {
      parts.sources['src/widget/tests/index.ts'] = '/** @deprecated Use `Widget`. */\nexport const Legacy = 1;\n';
    });
    assertRedOnlyFor(hidden, /src\/widget\/tests\/index\.ts:1 `Legacy`: marker without a row/, 1);
  });

  it('parses its arguments and refuses unknown ones', async () => {
    assert.deepEqual(parseArgs(['--check', '--assume-done=WO-RET-01,WO-RET-04', '--consumers', '--json']), {
      check: true, json: true, consumers: true, assumeDone: ['WO-RET-01', 'WO-RET-04'], unknown: [],
    });
    const roots = tree();
    assert.equal((await run(['--check'], roots)).code, 0);
    assert.equal((await run(['--check', '--assume-done=WO-RET-01'], roots)).code, 1);
    for (const refused of ['--write', '--seed', '--update-baseline']) {
      const result = await run(['--check', refused], roots);
      assert.equal(result.code, 2, `${refused} must be refused`);
    }
  });

  it('the closed lists are the declared ones', () => {
    assert.deepEqual([...CLASSES], [
      'debt', 'compat-consumed', 'compat-frozen-sole-implementer', 'compat-canon-pending', 'compat-persisted-data',
    ]);
    assert.deepEqual([...BLOCKERS], [
      'frozen-equivalence-absent', 'replacement-capability-absent:', 'persisted-data-unproven',
      'direction-semantics:', 'parity-failed:', 'parity-unproven',
    ]);
    assert.deepEqual([...HEADER_KEYS], ['schema', 'sealedAt', 'noDebtReceivers', 'compatReceivers', 'notes', 'rows']);
    assert.equal(ROW_KEYS.length, 14);
  });
});

describe('deprecations — the real package', () => {
  it('every marker in src/ is anchored, including the union members', () => {
    const scan = scanMarkers(REAL_PACKAGE);
    assert.deepEqual(scan.problems, [], scan.problems.join('\n'));
    assert.equal(scan.markers.length, scan.raw, 'every raw occurrence is one anchored marker');
    for (const marker of scan.markers) assert.ok(marker.anchor.length > 0, `${marker.file}:${marker.line}`);
  });

  it('the ledger carries no wildcard and no key outside the schema', () => {
    const ledger = JSON.parse(readFileSync(join(REAL_PACKAGE, LEDGER_PATH), 'utf8'));
    assert.deepEqual(Object.keys(ledger).sort(), [...HEADER_KEYS].sort());
    assert.deepEqual(ledger.compatReceivers, [], 'no successor is registered yet: closure stays impossible');
    for (const row of ledger.rows) {
      assert.deepEqual(Object.keys(row).sort(), [...ROW_KEYS].sort(), `${row.file} ${row.anchor}`);
      assert.doesNotMatch(row.file, /[*?[\]{}]/);
      assert.ok(!row.anchor.includes('*'));
    }
  });
});
