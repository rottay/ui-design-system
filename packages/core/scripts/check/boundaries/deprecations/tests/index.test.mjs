/**
 * The drill for the deprecation ledger gate.
 *
 * Every mutant is planted on a fixture tree, never on the package: a marker
 * the ledger does not name, a row whose marker is gone, a receiver that is
 * closed, a claim the tree contradicts. Each negative asserts that the gate is
 * red for that reason and for nothing else, so a mutant cannot pass because an
 * unrelated rule happened to fire. N1-N14 and P1-P5 are the numbered cases of
 * the instrument's design; the unnumbered ones cover the remaining refusals.
 * E1-E17 drill evidence in a sibling checkout, its receipts and their audited
 * mark against scratch git repositories.
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, describe, it } from 'node:test';

import {
  BLOCKERS, CLASSES, CODEMOD_FIXTURES_PATH, CODEMOD_MAP_PATH, CODEMOD_TESTS_PATH, GATES_MANIFEST_PATH, HEADER_KEYS,
  LEDGER_PATH, RECEIPTS_PATH, RECEIPT_AUDIT_KEYS, RECEIPT_KEYS, REGISTRY_PATH, ROW_KEYS, codemodIdProblem, digestOf, evaluate,
  fixtureVerdict, identifierResolves, loadCodemodLookup, matchOf, measure, mintIntegrityOf, parseArgs, reasonProblem,
  receiptIntegrityOf, rowDigestOf, run, scanMarkers,
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
    assert.deepEqual(result.report.unverifiedByRow, { [`${CONTRACTS}#WidgetProps.variant`]: 1 });
    assert.deepEqual(result.report.siblingEvidence.map((entry) => entry.status), ['not-verified']);
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
      check: true, json: true, consumers: true, writeReceipts: false, auditReceipts: false, by: null, record: null,
      siblings: 'detect', assumeDone: ['WO-RET-01', 'WO-RET-04'], unknown: [],
    });
    const audit = parseArgs(['--audit-receipts', '--by=someone', '--record=a/b/index.json']);
    assert.deepEqual([audit.auditReceipts, audit.by, audit.record], [true, 'someone', 'a/b/index.json']);
    assert.deepEqual(parseArgs(['--by=', '--record=']).unknown, ['--by=', '--record=']);
    assert.equal(parseArgs(['--write-receipts']).writeReceipts, true);
    assert.equal(parseArgs(['--check', '--siblings=absent']).siblings, 'absent');
    assert.deepEqual(parseArgs(['--siblings=present']).unknown, ['--siblings=present']);
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

const GIT_ENV = {
  ...process.env,
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_CONFIG_SYSTEM: '/dev/null',
  GIT_AUTHOR_NAME: 'fixture',
  GIT_AUTHOR_EMAIL: 'fixture@example.invalid',
  GIT_COMMITTER_NAME: 'fixture',
  GIT_COMMITTER_EMAIL: 'fixture@example.invalid',
};
const ORIGIN = 'https://example.invalid/app-fixture.git';
const NEEDLE = '<Widget variant="primary" />';
const PAGE = 'src/page.tsx';
const PAGE_SOURCE = `export const Page = () => ${NEEDLE};\n`;
const VARIANT = 'WidgetProps.variant';
const TODAY = '2026-10-03';
const AUDITOR = 'fixture-auditor';
const RECORD = `packages/core/${dirname(RECEIPTS_PATH)}/audits/${TODAY}/index.json`;
let scratchCount = 0;

/**
 * A fixture workspace whose `compat-consumed` row cites a scratch sibling
 * repository, re-homed so that closure is green but for that evidence.
 */
function siblingCase({ committed = PAGE_SOURCE } = {}) {
  scratchCount += 1;
  const name = `ret01-app-${process.pid}-${scratchCount}`;
  const path = `../${name}/${PAGE}`;
  const roots = tree((parts) => {
    rehome(parts);
    rowOf(parts, VARIANT).evidence = [{ kind: 'consumer', path, needle: NEEDLE }];
  });
  const dir = join(dirname(roots.repoRoot), name);
  const hidden = `${dir}.hidden`;
  sandboxes.push(dir, hidden);
  const git = (...args) => execFileSync('git', ['-C', dir, ...args], { env: GIT_ENV, encoding: 'utf8' }).trim();
  /** Commit the page; `pushed` moves the scratch `origin/main` with it, as a push would. */
  const commit = (content, message, { pushed = true } = {}) => {
    mkdirSync(dirname(join(dir, PAGE)), { recursive: true });
    writeFileSync(join(dir, PAGE), content);
    git('add', '-A');
    git('commit', '-q', '-m', message);
    if (pushed) git('update-ref', 'refs/remotes/origin/main', 'HEAD');
    return git('rev-parse', 'HEAD');
  };
  mkdirSync(dir, { recursive: true });
  git('init', '-q');
  git('remote', 'add', 'origin', ORIGIN);
  const first = commit(committed, 'page');
  const receiptsFile = join(roots.packageRoot, RECEIPTS_PATH);
  const ledgerFile = join(roots.packageRoot, LEDGER_PATH);
  const recordFile = join(roots.repoRoot, RECORD);
  const readReceipts = () => JSON.parse(readFileSync(receiptsFile, 'utf8'));
  const options = { codemods: wiredFor(ALL_IDS) };
  /** The record an independent auditor keeps: every receipt re-derived, in the auditor's own schema. */
  const writeRecord = (edit = () => {}) => {
    const record = {
      schema: 1,
      audit: { date: TODAY, auditor: `independent auditor (${AUDITOR})` },
      receipts: readReceipts().receipts.map((receipt) => ({
        row: `${receipt.file}#${receipt.anchor}`,
        kind: receipt.kind,
        path: receipt.path,
        needle: receipt.needle,
        commit: receipt.commit,
        recomputed: {
          fileSha256: receipt.fileDigest,
          matchLine: receipt.matchLine,
          matchDigest: receipt.matchDigest,
          rowDigest: receipt.rowDigest,
          integrity: mintIntegrityOf(receipt),
        },
        verdict: 'VERIFIED',
      })),
    };
    edit(record);
    mkdirSync(dirname(recordFile), { recursive: true });
    writeFileSync(recordFile, JSON.stringify(record, null, 2));
  };
  const mint = () => run(['--write-receipts'], { ...roots, today: TODAY });
  const audit = () => run(['--audit-receipts', `--by=${AUDITOR}`, `--record=${RECORD}`], roots);
  return {
    roots, dir, path, first, git, commit, mint, audit, writeRecord, readReceipts,
    key: `${CONTRACTS}#${VARIANT}`,
    hide: () => renameSync(dir, hidden),
    show: () => renameSync(hidden, dir),
    writeWorkingTree: (content) => writeFileSync(join(dir, PAGE), content),
    mintAudited: async () => {
      assert.equal((await mint()).code, 0);
      writeRecord();
      const result = await audit();
      assert.equal(result.code, 0, result.failures.join('\n'));
      return result;
    },
    receiptsText: () => readFileSync(receiptsFile, 'utf8'),
    /** Edit the one receipt; `reseal` recomputes its integrity digest as a forger would. */
    editReceipt: (edit, { reseal = false } = {}) => {
      const document = readReceipts();
      edit(document.receipts[0], document);
      if (reseal) document.receipts[0].integrity = receiptIntegrityOf(document.receipts[0]);
      writeFileSync(receiptsFile, JSON.stringify(document, null, 2));
    },
    editLedger: (edit) => {
      const ledger = JSON.parse(readFileSync(ledgerFile, 'utf8'));
      edit(ledger);
      writeFileSync(ledgerFile, JSON.stringify(ledger, null, 2));
    },
    preliminary: (extra = {}) => evaluate(measure(roots), { ...options, ...extra }),
    closure: (extra = {}) => evaluate(measure(roots), { ...options, assumeDone: [OWNER], ...extra }),
  };
}

const statusOf = (result) => result.report.siblingEvidence.map((entry) => entry.status);
const variantRow = (ledger) => ledger.rows.find((row) => row.anchor === VARIANT);
const UNSATISFIED = /`WidgetProps\.variant`: compat-consumed row: `consumer` evidence is NOT VERIFIED under --assume-done/;
const UNAUDITED = /`WidgetProps\.variant`: receipt for `consumer` at \S+: UNAUDITED: it carries no audited mark/;
const anyOf = (...patterns) => new RegExp(patterns.map((pattern) => pattern.source).join('|'));

describe('deprecations — evidence in a sibling checkout', () => {
  it('E1 (positive): evidence verified live satisfies closure', () => {
    const scratch = siblingCase();
    const closed = scratch.closure();
    assertGreen(closed);
    assert.deepEqual(statusOf(closed), ['verified-live']);
    assert.deepEqual(closed.report.unverifiedByRow, {});
    assert.deepEqual(closed.report.rowsOnHistoricalReceipts, []);
  });

  it('E2 (positive): an audited receipt satisfies closure without its sibling, as a historical receipt and never as verified', async () => {
    const scratch = siblingCase();
    const minted = await scratch.mint();
    assert.equal(minted.code, 0, minted.failures.join('\n'));
    assert.deepEqual(minted.mint.minted, [`${scratch.key} consumer ${scratch.path} needle=${JSON.stringify(NEEDLE)}`]);
    const [receipt] = scratch.readReceipts().receipts;
    assert.deepEqual(Object.keys(receipt), [...RECEIPT_KEYS], 'a minted receipt carries no audited mark');
    assert.equal(receipt.repository, ORIGIN);
    assert.equal(receipt.commit, scratch.first);
    assert.equal(receipt.fileDigest, digestOf(Buffer.from(PAGE_SOURCE)));
    assert.deepEqual({ line: receipt.matchLine, digest: receipt.matchDigest }, matchOf(Buffer.from(PAGE_SOURCE), NEEDLE));
    assert.equal(receipt.date, TODAY);

    scratch.writeRecord();
    const audited = await scratch.audit();
    assert.deepEqual([audited.code, audited.audit.marked.length, audited.written], [0, 1, true]);
    const [marked] = scratch.readReceipts().receipts;
    assert.deepEqual(RECEIPT_AUDIT_KEYS.map((key) => marked[key]), [AUDITOR, TODAY, RECORD]);
    assert.equal(marked.integrity, receiptIntegrityOf(marked), 'the mark is inside the integrity body');
    assert.notEqual(marked.integrity, receipt.integrity);
    assert.equal(mintIntegrityOf(marked), receipt.integrity);
    const again = await scratch.audit();
    assert.deepEqual([again.code, again.audit.marked.length, again.audit.kept.length], [0, 0, 1]);

    const live = scratch.closure();
    assertGreen(live);
    assert.deepEqual(statusOf(live), ['verified-live']);
    assert.equal(live.report.siblingEvidence[0].receipt.reproven, true);
    assert.deepEqual(live.report.rowsOnHistoricalReceipts, []);

    scratch.hide();
    for (const result of [scratch.closure(), scratch.preliminary()]) {
      assertGreen(result);
      assert.deepEqual(statusOf(result), ['historical-receipt']);
      assert.deepEqual(result.report.siblingEvidence[0].receipt, {
        commit: scratch.first, date: TODAY, holds: true, reproven: false, audited: { by: AUDITOR, at: TODAY, record: RECORD },
      });
      assert.deepEqual(result.report.rowsOnHistoricalReceipts, [scratch.key]);
      assert.deepEqual(result.report.unverifiedEvidence, []);
      assert.doesNotMatch(JSON.stringify(result.report.siblingEvidence), /verified/, 'a receipt is never reported as a verification');
    }
    scratch.show();
    assert.deepEqual(statusOf(scratch.closure({ siblings: 'absent' })), ['historical-receipt']);
  });

  it('E3 (preliminary): unavailable evidence does not fail the row and is reported by row, never as satisfied', () => {
    const scratch = siblingCase();
    scratch.hide();
    const result = scratch.preliminary();
    assertGreen(result);
    assert.deepEqual(statusOf(result), ['not-verified']);
    assert.deepEqual(result.report.unverifiedByRow, { [scratch.key]: 1 });
    assert.deepEqual(result.report.unverifiedEvidence, [{ row: scratch.key, kind: 'consumer', path: scratch.path }]);
  });

  it('E4 (absent): at closure a kind that is only unverified, with no receipt, is red', async () => {
    const scratch = siblingCase();
    scratch.hide();
    const closed = scratch.closure();
    assertRedOnlyFor(closed, UNSATISFIED, 1);
    assert.deepEqual(closed.report.unverifiedByRow, { [scratch.key]: 1 });
    scratch.show();
    assertRedOnlyFor(scratch.closure({ siblings: 'absent' }), UNSATISFIED, 1);
    const cli = await run(['--check', `--assume-done=${OWNER}`, '--siblings=absent'], {
      ...scratch.roots, codemodLookup: async () => wiredFor(ALL_IDS),
    });
    assert.equal(cli.code, 1);
    assertRedOnlyFor(cli, UNSATISFIED, 1);
  });

  it('E5 (stale): a receipt whose row changed is red at closure and reported before it', async () => {
    const renamed = siblingCase();
    await renamed.mintAudited();
    renamed.editLedger((ledger) => { variantRow(ledger).evidence[0].needle = '<Widget variant'; });
    assertRedOnlyFor(renamed.preliminary(), /names no evidence entry of the ledger/, 1);
    renamed.hide();
    assertRedOnlyFor(renamed.closure(), anyOf(/names no evidence entry of the ledger/, UNSATISFIED), 2);

    const twoNeedles = siblingCase();
    twoNeedles.editLedger((ledger) => {
      variantRow(ledger).evidence.push({ kind: 'consumer', path: twoNeedles.path, needle: 'export const Page' });
    });
    assert.equal((await twoNeedles.mintAudited()).audit.marked.length, 2, 'one file cited for two needles earns two receipts');
    twoNeedles.hide();
    assertGreen(twoNeedles.closure());

    for (const edit of [
      (row) => { row.reason = `${row.reason} The wrapper forwards it unchanged to the table.`; },
      (row) => { row.evidence[0].note = 'Reviewed again.'; },
      (row) => { row.receiver = OTHER_RETIRE; },
    ]) {
      const scratch = siblingCase();
      await scratch.mintAudited();
      scratch.editLedger((ledger) => edit(variantRow(ledger)));
      scratch.hide();
      const closed = scratch.closure();
      const stale = closed.failures.filter((failure) => /receipt for `consumer` at \S+: STALE: it certifies row digest/.test(failure));
      assert.equal(stale.length, 1, closed.failures.join('\n'));
      assert.ok(closed.failures.some((failure) => UNSATISFIED.test(failure)), 'a stale receipt stands in for nothing');
      const open = scratch.preliminary();
      assert.deepEqual(statusOf(open), ['not-verified']);
      assert.equal(open.report.staleReceipts.length, 1);
      assert.match(open.report.staleReceipts[0].why, /^STALE: it certifies row digest/);
      assert.deepEqual(open.failures.filter((failure) => /receipt|evidence/.test(failure)), [], 'reported, not failed, before closure');
      scratch.show();
      assert.ok(scratch.closure().failures.some((failure) => /STALE: it certifies row digest/.test(failure)));
    }
  });

  it('E6 (stale): a sibling whose HEAD no longer carries the needle is red at closure', async () => {
    const scratch = siblingCase();
    await scratch.mintAudited();
    const moved = scratch.commit('export const Page = () => <Widget tone="primary" />;\n', 'migrate');
    const gone = scratch.closure();
    assert.ok(gone.failures.some((failure) => failure.includes(`STALE: at HEAD ${moved}`) && failure.includes(`read at ${scratch.first}`)));
    assertRedOnlyFor(gone, /`WidgetProps\.variant`: (receipt for `consumer` at \S+: STALE: at HEAD|evidence `consumer`: \S+ no longer contains|compat-consumed row has no verified `consumer` evidence)/, 3);

    scratch.writeWorkingTree(PAGE_SOURCE);
    assertRedOnlyFor(scratch.closure(), /receipt for `consumer` at \S+: STALE: at HEAD \w{40} of \S+ the file no longer contains/, 1);
    const open = scratch.preliminary();
    assertGreen(open);
    assert.match(open.report.staleReceipts[0].why, /^STALE: at HEAD/);
  });

  it('E7 (altered): a receipt edited by hand, its audited mark included, fails its integrity digest in every mode', async () => {
    const other = 'f'.repeat(40);
    for (const edit of [
      (receipt) => { receipt.fileDigest = digestOf('other bytes'); },
      (receipt) => { receipt.commit = other; },
      (receipt) => { receipt.rowDigest = digestOf('another row'); },
      (receipt) => { receipt.date = '2027-01-01'; },
      (receipt) => { receipt.auditedBy = 'someone-else'; },
      (receipt) => { receipt.auditedAt = '2027-01-01'; },
      (receipt) => { receipt.auditRecord = 'packages/core/another/index.json'; },
      (receipt) => { receipt.integrity = digestOf('tampered'); },
    ]) {
      const scratch = siblingCase();
      await scratch.mintAudited();
      scratch.editReceipt(edit);
      const present = scratch.preliminary();
      assertRedOnlyFor(present, /receipts\/index\.json: receipt 0 \(`WidgetProps\.variant`\): ALTERED: the integrity digest does not match/, 1);
      scratch.hide();
      assertRedOnlyFor(scratch.preliminary(), /ALTERED: the integrity digest does not match/, 1);
      const closed = scratch.closure();
      assert.ok(closed.failures.some((failure) => /ALTERED: the integrity digest does not match/.test(failure)));
      assert.ok(closed.failures.some((failure) => UNSATISFIED.test(failure)), 'an altered receipt satisfies nothing');
      assert.equal(closed.failures.length, 2, closed.failures.join('\n'));
    }
  });

  it('E8 (altered): an incomplete or malformed receipt is red and satisfies nothing', async () => {
    for (const [edit, pattern] of [
      [(receipt) => { delete receipt.fileDigest; }, /key `fileDigest` is missing/],
      [(receipt) => { receipt.reviewer = 'me'; }, /unknown key `reviewer`/],
      [(receipt) => { receipt.commit = 'main'; }, /commit `main` is not a full commit SHA/],
      [(receipt) => { receipt.matchDigest = 'yes'; }, /`matchDigest` is not a sha256 digest/],
      [(receipt) => { delete receipt.auditRecord; }, /the audited mark is partial/],
      [(receipt, document) => { document.receipts.push({ ...receipt }); }, /receipt 1 \(`WidgetProps\.variant`\): duplicate receipt/],
      [(receipt, document) => { document.approvedBy = 'me'; }, /not an object of exactly schema, receipts/],
    ]) {
      const scratch = siblingCase();
      await scratch.mintAudited();
      scratch.editReceipt(edit);
      assert.ok(scratch.preliminary().failures.some((failure) => pattern.test(failure)), String(pattern));
    }
    const scratch = siblingCase();
    await scratch.mintAudited();
    writeFileSync(join(scratch.roots.packageRoot, RECEIPTS_PATH), '{ not json');
    assertRedOnlyFor(scratch.preliminary(), /receipts\/index\.json is not valid JSON/, 1);
  });

  it('E9 (altered): a resealed forgery is refuted by the sibling it cites and by the kept audit record', async () => {
    const RECORD_DISAGREES = /AUDIT MARK: the audit record re-derived other values/;
    const forgeries = [
      [(receipt) => { receipt.fileDigest = digestOf('other bytes'); }, /ALTERED: at commit \w{40} the file digest is \w{12}, the receipt records \w{12}/],
      [(receipt) => { receipt.matchLine = 7; }, /ALTERED: at commit \w{40} the needle matches line 1 \(\w{12}\), not the recorded line/],
    ];
    for (const [edit, pattern] of forgeries) {
      const scratch = siblingCase();
      await scratch.mintAudited();
      scratch.editReceipt(edit, { reseal: true });
      for (const result of [scratch.preliminary(), scratch.closure()]) {
        assertRedOnlyFor(result, anyOf(pattern, RECORD_DISAGREES), 2);
        assert.ok(result.failures.some((failure) => pattern.test(failure)));
      }
      scratch.hide();
      assertRedOnlyFor(scratch.preliminary(), RECORD_DISAGREES, 1);
      assertRedOnlyFor(scratch.closure(), anyOf(RECORD_DISAGREES, UNSATISFIED), 2);
    }
    const origin = siblingCase();
    await origin.mintAudited();
    origin.editReceipt((receipt) => { receipt.repository = 'https://example.invalid/another.git'; }, { reseal: true });
    for (const result of [origin.preliminary(), origin.closure()]) {
      assert.ok(result.failures.some((failure) => /ALTERED: it names repository/.test(failure)));
    }
    const moved = siblingCase();
    await moved.mintAudited();
    moved.editReceipt((receipt) => { receipt.path = receipt.path.replace('page.tsx', 'other.tsx'); }, { reseal: true });
    assert.ok(moved.preliminary().failures.some((failure) => /names no evidence entry of the ledger/.test(failure)));
  });

  it('E10 (altered): file bytes that differ from the recorded digest at the recorded commit are red', async () => {
    const scratch = siblingCase();
    await scratch.mintAudited();
    const later = scratch.commit(`// reviewed\n${PAGE_SOURCE}`, 'comment');
    scratch.editReceipt((receipt) => { receipt.commit = later; }, { reseal: true });
    for (const result of [scratch.preliminary(), scratch.closure()]) {
      assert.ok(result.failures.some((failure) => failure.includes(`ALTERED: at commit ${later} the file digest is`)), result.failures.join('\n'));
    }

    const unknown = siblingCase();
    await unknown.mint();
    unknown.editReceipt((receipt) => { receipt.commit = 'f'.repeat(40); }, { reseal: true });
    assert.ok(unknown.closure().failures.some((failure) => /commit f{40} is not in \S+; the receipt cannot be re-proven/.test(failure)));
    const open = unknown.preliminary();
    assertGreen(open);
    assert.match(open.report.staleReceipts[0].why, /cannot be re-proven/);
  });

  it('E11: without the sibling a receipt shows integrity and agreement with the kept record, not provenance', async () => {
    const scratch = siblingCase();
    await scratch.mintAudited();
    scratch.editReceipt((receipt) => { receipt.fileDigest = digestOf('other bytes'); }, { reseal: true });
    scratch.writeRecord();
    assert.ok(scratch.closure().failures.some((failure) => /ALTERED: at commit/.test(failure)), 'the source refutes it');
    scratch.hide();
    const blind = scratch.closure();
    assertGreen(blind);
    assert.deepEqual(statusOf(blind), ['historical-receipt']);
    assert.equal(blind.report.siblingEvidence[0].receipt.reproven, false, 'accepted without its source is never reported as re-proven');
  });

  it('E12: --write-receipts mints only from evidence verified live, is idempotent and never destroys a receipt on a refusal', async () => {
    const scratch = siblingCase();
    assert.equal((await run(['--write-receipts', '--check'], scratch.roots)).code, 2);
    assert.equal((await run(['--write-receipts', `--assume-done=${OWNER}`], scratch.roots)).code, 2);
    assert.equal((await run(['--write-receipts', '--audit-receipts', '--by=a', '--record=b'], scratch.roots)).code, 2);
    assert.equal(existsSync(join(scratch.roots.packageRoot, RECEIPTS_PATH)), false);

    await scratch.mintAudited();
    const before = scratch.receiptsText();
    const again = await run(['--write-receipts'], { ...scratch.roots, today: '2027-01-01' });
    assert.deepEqual([again.code, again.mint.minted.length, again.mint.kept.length], [0, 0, 1]);
    assert.equal(scratch.receiptsText(), before, 'an unchanged receipt keeps its date and its audited mark');

    scratch.hide();
    const kept = await scratch.mint();
    assert.deepEqual([kept.code, kept.mint.kept.length], [0, 1], 'an intact receipt survives a run without its sibling');
    assert.equal(scratch.receiptsText(), before);
    scratch.editLedger((ledger) => { variantRow(ledger).scope = 'One optional prop of the widget contract.'; });
    const absent = await scratch.mint();
    assert.deepEqual([absent.code, absent.written], [1, false]);
    assert.match(absent.failures[0], /no receipt minted: the sibling checkout is not present/);
    assert.equal(scratch.receiptsText(), before, 'a refused run leaves the file as it was');
    scratch.show();
    const reminted = await scratch.mint();
    assert.deepEqual([reminted.code, reminted.mint.minted.length, reminted.written], [0, 1, true]);
    const [fresh] = scratch.readReceipts().receipts;
    assert.equal(fresh.rowDigest, rowDigestOf(variantRow(JSON.parse(readFileSync(join(scratch.roots.packageRoot, LEDGER_PATH), 'utf8')))));
    assert.deepEqual(Object.keys(fresh), [...RECEIPT_KEYS], 'a re-minted receipt loses the audited mark');

    const uncommitted = siblingCase({ committed: 'export const Page = () => null;\n' });
    uncommitted.writeWorkingTree(PAGE_SOURCE);
    assertGreen(uncommitted.closure());
    const refused = await uncommitted.mint();
    assert.equal(refused.code, 1);
    assert.match(refused.failures[0], /no receipt minted: at HEAD \w{40} the committed file does not contain the needle; only the working tree does/);
    assert.equal(existsSync(join(uncommitted.roots.packageRoot, RECEIPTS_PATH)), false);

    const missing = siblingCase({ committed: 'export const Page = () => null;\n' });
    const failed = await missing.mint();
    assert.equal(failed.code, 1);
    assert.match(failed.failures[0], /no receipt minted: evidence `consumer`: \S+ no longer contains/);

    const plain = siblingCase();
    rmSync(join(plain.dir, '.git'), { recursive: true, force: true });
    const unanchored = await plain.mint();
    assert.match(unanchored.failures[0], /is not a git checkout; evidence cannot be anchored to a commit/);

    const orphan = siblingCase();
    await orphan.mintAudited();
    orphan.editLedger((ledger) => { variantRow(ledger).evidence = [{ kind: 'consumer', path: SHOWROOM_PAGE, needle: NEEDLE }]; });
    assertRedOnlyFor(orphan.preliminary(), /receipt for \S+ `WidgetProps\.variant` \(`consumer` at \S+\) names no evidence entry of the ledger/, 1);
    const pruned = await orphan.mint();
    assert.deepEqual([pruned.code, pruned.mint.dropped.length], [0, 1]);
    assertGreen(orphan.closure());
  });

  it('E13: --write-receipts refuses a sibling HEAD that is not on its origin/main', async () => {
    const scratch = siblingCase();
    const local = scratch.commit(`// local only\n${PAGE_SOURCE}`, 'unpushed', { pushed: false });
    const refused = await scratch.mint();
    assert.deepEqual([refused.code, refused.written], [1, false]);
    assert.match(refused.failures[0], new RegExp(`no receipt minted: HEAD ${local} of \\S+ is not an ancestor of its origin/main`));
    assert.equal(existsSync(join(scratch.roots.packageRoot, RECEIPTS_PATH)), false);
    scratch.git('update-ref', 'refs/remotes/origin/main', 'HEAD');
    assert.equal((await scratch.mint()).code, 0);

    const noRemoteBranch = siblingCase();
    noRemoteBranch.git('update-ref', '-d', 'refs/remotes/origin/main');
    assert.match((await noRemoteBranch.mint()).failures[0], /is not an ancestor of its origin\/main/);
  });

  it('E14 (unaudited): a receipt without the audited mark is red at closure, with or without its sibling', async () => {
    const scratch = siblingCase();
    await scratch.mint();
    assertRedOnlyFor(scratch.closure(), UNAUDITED, 1);
    const open = scratch.preliminary();
    assertGreen(open);
    assert.deepEqual(open.report.unauditedReceipts, [{ row: scratch.key, kind: 'consumer', path: scratch.path }]);
    scratch.hide();
    assertRedOnlyFor(scratch.closure(), anyOf(UNAUDITED, UNSATISFIED), 2);
    const blind = scratch.preliminary();
    assertGreen(blind);
    assert.deepEqual(statusOf(blind), ['not-verified'], 'an unaudited receipt stands in for nothing');
    assert.deepEqual(blind.report.unverifiedByRow, { [scratch.key]: 1 });
    assert.deepEqual(blind.report.rowsOnHistoricalReceipts, []);
  });

  it('E15 (altered): an audited mark set by hand and resealed is red unless a kept record vouches for it hash for hash', async () => {
    const mark = (receipt, fields = {}) => {
      const { integrity, ...body } = receipt;
      for (const key of Object.keys(receipt)) delete receipt[key];
      Object.assign(receipt, body, { auditedBy: AUDITOR, auditedAt: TODAY, auditRecord: RECORD, ...fields }, { integrity });
    };
    const noRecord = siblingCase();
    await noRecord.mint();
    noRecord.editReceipt((receipt) => mark(receipt), { reseal: true });
    assertRedOnlyFor(noRecord.preliminary(), /AUDIT MARK: .*audits\/2026-10-03\/index\.json does not exist/, 1);
    noRecord.hide();
    assertRedOnlyFor(noRecord.closure(), anyOf(/AUDIT MARK: .* does not exist/, UNSATISFIED), 2);

    for (const [fields, editRecord, pattern] of [
      [{ auditedBy: 'someone-else' }, () => {}, /AUDIT MARK: auditedBy `someone-else` is not the auditor of/],
      [{ auditedAt: '2026-09-01' }, () => {}, /AUDIT MARK: auditedAt 2026-09-01 is not the date of/],
      [{ auditRecord: '../outside/index.json' }, () => {}, /AUDIT MARK: audit record `\.\.\/outside\/index\.json` is not a repository-relative path/],
      [{}, (record) => { record.receipts = []; }, /AUDIT MARK: the audit record has no entry for it/],
      [{}, (record) => { record.receipts[0].verdict = 'FAILED'; }, /AUDIT MARK: the audit record's verdict for it is `FAILED`/],
      [{}, (record) => { record.receipts[0].recomputed.fileSha256 = digestOf('what the auditor read'); }, /AUDIT MARK: the audit record re-derived other values: fileDigest/],
      [{}, (record) => { record.receipts[0].commit = 'e'.repeat(40); }, /AUDIT MARK: the audit record re-derived other values: commit/],
      [{}, (record) => { record.receipts[0].recomputed.integrity = digestOf('another receipt'); }, /AUDIT MARK: the audit record re-derived other values: integrity at minting/],
    ]) {
      const scratch = siblingCase();
      await scratch.mint();
      scratch.writeRecord(editRecord);
      scratch.editReceipt((receipt) => mark(receipt, fields), { reseal: true });
      assertRedOnlyFor(scratch.preliminary(), pattern, 1);
      scratch.hide();
      assertRedOnlyFor(scratch.closure(), anyOf(pattern, UNSATISFIED), 2);
    }
  });

  it('E16 (audit mode): a receipt that does not re-prove live on that run is refused and nothing is written', async () => {
    const usage = siblingCase();
    await usage.mint();
    assert.equal((await run(['--audit-receipts'], usage.roots)).code, 2);
    assert.equal((await run(['--audit-receipts', `--by=${AUDITOR}`], usage.roots)).code, 2);
    assert.equal((await run(['--check', `--by=${AUDITOR}`], usage.roots)).code, 2);
    assert.equal((await run(['--audit-receipts', `--by=${AUDITOR}`, `--record=${RECORD}`, '--check'], usage.roots)).code, 2);
    const noRecord = await usage.audit();
    assert.deepEqual([noRecord.code, noRecord.written], [1, false]);
    assert.match(noRecord.failures[0], /not marked audited: .* does not exist/);
    usage.writeRecord();
    const stranger = await run(['--audit-receipts', '--by=someone-else', `--record=${RECORD}`], usage.roots);
    assert.match(stranger.failures[0], /names auditor `independent auditor \(fixture-auditor\)`, not `someone-else`/);

    const cases = [
      [(scratch) => scratch.hide(), /not marked audited: \S+ is not present; nothing was re-proven on this run/],
      [(scratch) => scratch.editReceipt((receipt) => { receipt.fileDigest = digestOf('other bytes'); }, { reseal: true }), /not marked audited: ALTERED: at commit \w{40} the file digest is/],
      [(scratch) => scratch.editReceipt((receipt) => { receipt.fileDigest = digestOf('other bytes'); }), /not marked audited: ALTERED: the integrity digest does not match/],
      [(scratch) => scratch.commit('export const Page = () => null;\n', 'migrate'), /not marked audited: STALE: at HEAD/],
      [(scratch) => scratch.editLedger((ledger) => { variantRow(ledger).scope = 'Another scope of the widget.'; }), /not marked audited: STALE: it certifies row digest/],
      [(scratch) => scratch.git('update-ref', '-d', 'refs/remotes/origin/main'), /not marked audited: commit \w{40} is not an ancestor of origin\/main/],
      [(scratch) => scratch.writeRecord((record) => { record.receipts[0].recomputed.matchDigest = digestOf('another line'); }), /not marked audited: the audit record re-derived other values: matchDigest/],
      [(scratch) => scratch.writeRecord((record) => { record.receipts[0].verdict = 'FAILED'; }), /not marked audited: the audit record's verdict for it is `FAILED`/],
    ];
    for (const [plant, pattern] of cases) {
      const scratch = siblingCase();
      await scratch.mint();
      scratch.writeRecord();
      plant(scratch);
      const before = scratch.receiptsText();
      const refused = await scratch.audit();
      assert.deepEqual([refused.code, refused.written, refused.audit.marked.length], [1, false, 0], String(pattern));
      assert.match(refused.failures[0], pattern);
      assert.equal(scratch.receiptsText(), before, 'a refused audit leaves the file as it was');
    }
  });

  it('E17: closure with the sibling present needs the audited receipt re-proven on that run', async () => {
    const scratch = siblingCase();
    await scratch.mintAudited();
    const live = scratch.closure();
    assertGreen(live);
    assert.deepEqual(live.report.siblingEvidence[0].receipt, {
      commit: scratch.first, date: TODAY, holds: true, reproven: true, audited: { by: AUDITOR, at: TODAY, record: RECORD },
    });
    rmSync(join(scratch.dir, '.git'), { recursive: true, force: true });
    const unprovable = scratch.closure();
    assertRedOnlyFor(unprovable, /is present but is not a git checkout; the receipt cannot be re-proven/, 1);
    assert.equal(unprovable.report.siblingEvidence[0].receipt.reproven, false);
  });

  it('E18: audits accumulate: a later record marks only what it covers and keeps what an earlier record still backs', async () => {
    const RECORD_B = RECORD.replace(`/${TODAY}/`, `/${TODAY}-b/`);
    const second = 'export const Page';
    /** One receipt audited by the first record, then a second receipt minted for another row, covered by no record yet. */
    const twoAudits = async () => {
      const scratch = siblingCase();
      await scratch.mintAudited();
      scratch.editLedger((ledger) => {
        ledger.rows.find((row) => row.anchor === 'WidgetProps.materials').evidence.push({ kind: 'consumer', path: scratch.path, needle: second });
      });
      const minted = await scratch.mint();
      assert.deepEqual([minted.code, minted.mint.minted.length, minted.mint.kept.length], [0, 1, 1]);
      const recordA = join(scratch.roots.repoRoot, RECORD);
      const recordB = join(scratch.roots.repoRoot, RECORD_B);
      const first = readFileSync(recordA, 'utf8');
      scratch.writeRecord((record) => { record.receipts = record.receipts.filter((entry) => entry.needle === second); });
      mkdirSync(dirname(recordB), { recursive: true });
      renameSync(recordA, recordB);
      writeFileSync(recordA, first);
      return {
        scratch, recordA, first,
        auditB: () => run(['--audit-receipts', `--by=${AUDITOR}`, `--record=${RECORD_B}`], scratch.roots),
      };
    };

    const { scratch, auditB } = await twoAudits();
    const [earlier] = scratch.readReceipts().receipts;
    const marked = await auditB();
    assert.deepEqual([marked.code, marked.written, marked.audit.marked.length, marked.audit.kept.length], [0, true, 1, 1], marked.failures.join('\n'));
    const [kept, later] = scratch.readReceipts().receipts;
    assert.deepEqual(kept, earlier, 'the receipt the first record backs is untouched');
    assert.deepEqual([kept.auditRecord, later.auditRecord], [RECORD, RECORD_B]);
    const after = scratch.receiptsText();
    const again = await auditB();
    assert.deepEqual([again.code, again.audit.marked.length, again.audit.kept.length], [0, 0, 2]);
    assert.equal(scratch.receiptsText(), after);
    scratch.hide();
    const closed = scratch.closure();
    assertGreen(closed);
    assert.deepEqual(statusOf(closed), ['historical-receipt', 'historical-receipt']);

    const unbacked = await twoAudits();
    writeFileSync(unbacked.recordA, JSON.stringify({ ...JSON.parse(unbacked.first), receipts: [] }));
    const before = unbacked.scratch.receiptsText();
    const refused = await unbacked.auditB();
    assert.deepEqual([refused.code, refused.written, refused.failures.length], [1, false, 1]);
    assert.match(refused.failures[0], /WidgetProps\.variant .*not marked audited: AUDIT MARK: the audit record has no entry for it/);
    assert.equal(unbacked.scratch.receiptsText(), before, 'a refused audit leaves the file as it was');

    const uncovered = await twoAudits();
    const untouched = uncovered.scratch.receiptsText();
    const absent = await uncovered.scratch.audit();
    assert.deepEqual([absent.code, absent.written, absent.failures.length, absent.audit.kept.length], [1, false, 1, 1]);
    assert.match(absent.failures[0], /WidgetProps\.materials .*not marked audited: the audit record has no entry for it/);
    assert.equal(uncovered.scratch.receiptsText(), untouched);
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
    assert.deepEqual(ledger.compatReceivers, ['WO-RET-06'], 'the one registered successor; a receiver is added only with its work order');
    assert.deepEqual(ledger.noDebtReceivers, ['WO-RET-06'], 'a successor never receives debt');
    for (const row of ledger.rows) {
      assert.deepEqual(Object.keys(row).sort(), [...ROW_KEYS].sort(), `${row.file} ${row.anchor}`);
      assert.doesNotMatch(row.file, /[*?[\]{}]/);
      assert.ok(!row.anchor.includes('*'));
    }
  });
});
