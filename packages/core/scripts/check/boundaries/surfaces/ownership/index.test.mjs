import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { FROZEN } from '../../../engine/lifecycle/freeze/index.mjs';
import { debtOf } from '../../../automation/gates/baselines/index.mjs';
import {
  BASELINE_SCHEMA,
  F86_THRESHOLD,
  FROZEN_TRANSFERRED,
  PRODUCTIVE,
  counterOf,
  describeLedgerCounters,
  f86Line,
  ledgerRows,
  ownerClass,
  tallyCounters,
  totalOf,
} from './counters/index.mjs';
import {
  analyzeOwnershipSource,
  applyAllowlist,
  buildBaseline,
  evaluateBaseline,
  isPresentationUtility,
  runOwnershipGate,
  summaryLines,
  tightenBaseline,
  upgradeLegacyBaseline,
  validateAllowlist,
  validateBaseline,
} from './index.mjs';

const path = 'src/components/patterns/example/engines/modern/index.tsx';
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const WIDGET_BOARD_FOUNDATION = 'components/patterns/data/widget-board/engines/foundation/index.tsx';
const GATE = resolve(SCRIPT_DIR, 'index.mjs');
const REAL_BASELINE = resolve(SCRIPT_DIR, 'baseline/index.json');

const MODERN_FILE = 'components/patterns/example/engines/modern/index.tsx';
const SHARED_FILE = 'components/patterns/example/presentation/index.tsx';
const CLASSIC_FILE = 'components/patterns/example/engines/classic/index.tsx';
const RUSTIC_FILE = 'components/patterns/example/engines/rustic/index.tsx';

const component = (name, body) => `export function ${name}() {\n  return <section>${body}</section>;\n}\n`;

/** A throwaway source root with one finding per owner class and an exact baseline. */
function plantTree() {
  const sourceRoot = mkdtempSync(resolve(tmpdir(), 'ds-a002-counters-'));
  const paths = {
    sourceRoot,
    baselinePath: resolve(sourceRoot, 'baseline.json'),
    allowlistPath: resolve(sourceRoot, 'allowlist.json'),
  };
  const write = (file, text) => {
    mkdirSync(dirname(resolve(sourceRoot, file)), { recursive: true });
    writeFileSync(resolve(sourceRoot, file), text);
  };
  write(MODERN_FILE, component('Modern', '<button>Run</button>'));
  write(SHARED_FILE, component('Shared', '<a href="/x">Go</a>'));
  write(CLASSIC_FILE, component('Classic', '<button>Run</button><button>Stop</button>'));
  write(RUSTIC_FILE, component('Rustic', '<input />'));
  const pin = () => {
    const census = runOwnershipGate(paths);
    writeFileSync(paths.baselinePath, `${JSON.stringify(buildBaseline(census.findings), null, 2)}\n`);
  };
  const readBaseline = () => JSON.parse(readFileSync(paths.baselinePath, 'utf8'));
  const writeBaseline = (document) => writeFileSync(paths.baselinePath, `${JSON.stringify(document, null, 2)}\n`);
  const cli = (...flags) => spawnSync(process.execPath, [
    GATE,
    `--source-root=${sourceRoot}`,
    `--baseline=${paths.baselinePath}`,
    `--allowlist=${paths.allowlistPath}`,
    ...flags,
  ], { encoding: 'utf8' });
  pin();
  return {
    ...paths,
    paths,
    write,
    readBaseline,
    writeBaseline,
    cli,
    run: () => runOwnershipGate(paths),
    dispose: () => rmSync(sourceRoot, { recursive: true, force: true }),
  };
}

function withTree(body) {
  const tree = plantTree();
  try {
    body(tree);
  } finally {
    tree.dispose();
  }
}

test('detects native interactive HTML, local SVG, utility classes, and primitive reconstruction', () => {
  const source = `
    export function Example() {
      return <section>
        <button className="flex items-center gap-2 rottay-action">Run</button>
        <Box as="button">Move</Box>
        <div role="tab">Overview</div>
        <span onClick={run}>Clickable text</span>
        <svg viewBox="0 0 20 20"><path d="M0 0" /></svg>
      </section>;
    }
  `;
  const result = analyzeOwnershipSource(source, path);
  assert.deepEqual(
    result.findings.map(({ category, rule }) => ({ category, rule })),
    [
      { category: 'native-interactive', rule: 'native-button' },
      { category: 'utility-class', rule: 'presentation-utility' },
      { category: 'primitive-reconstruction', rule: 'polymorphic-interactive' },
      { category: 'primitive-reconstruction', rule: 'aria-role-reconstruction' },
      { category: 'primitive-reconstruction', rule: 'clickable-noninteractive' },
      { category: 'local-svg', rule: 'local-svg-root' },
    ],
  );
  assert.match(result.findings[1].evidence, /items-center/);
  assert.match(result.findings[1].evidence, /gap-2/);
  assert.doesNotMatch(result.findings[1].evidence, /rottay-action/);
});

test('exempts plumbing-only onClick but keeps flagging handlers with real click work', () => {
  const source = `
    export function Example({ onResize }) {
      return <section>
        <span
          role="separator"
          tabIndex={0}
          onKeyDown={(e) => onResize(e.key)}
          onClick={(e) => e.stopPropagation()}
        >
          <span data-part="resize-handle-bar" />
        </span>
        <span onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>Shielded</span>
        <span onClick={(e) => { e.stopPropagation(); onResize(e); }}>Does work</span>
        <span onClick={(event) => (event.preventDefault(), onResize(event))}>Comma work</span>
      </section>;
    }
  `;
  const result = analyzeOwnershipSource(source, path);
  assert.deepEqual(
    result.findings.map(({ rule, evidence }) => ({ rule, evidence })),
    [
      { rule: 'clickable-noninteractive', evidence: '<span onClick={…}>' },
      { rule: 'clickable-noninteractive', evidence: '<span onClick={…}>' },
    ],
  );
});

test('flags stable shared chrome but exempts token-owned chrome and dynamic geometry', () => {
  const source = `
    const opacity = 0.8;
    const fixed = { padding: 12, color: '#fff', width: '380px', opacity };
    export function Example({ measuredWidth, drag }) {
      return <>
        <div style={fixed} />
        <div style={{ width: measuredWidth, left: drag.x, color: 'var(--ds-text-primary)' }} />
      </>;
    }
  `;
  const result = analyzeOwnershipSource(source, path);
  assert.deepEqual(
    result.findings.map(({ rule, evidence }) => ({ rule, evidence })),
    [
      { rule: 'stable-spacing', evidence: 'padding: 12' },
      { rule: 'stable-paint', evidence: 'color: "#fff"' },
      { rule: 'stable-geometry', evidence: 'width: "380px"' },
      { rule: 'stable-paint', evidence: 'opacity: 0.8' },
    ],
  );
  assert.equal(result.dynamicGeometryExemptions, 2);
  assert.equal(result.tokenOwnedChrome, 1);
});

test('collects static utility branches without treating arbitrary component classes as utilities', () => {
  assert.equal(isPresentationUtility('md:hover:px-4'), true);
  assert.equal(isPresentationUtility('text-sm'), true);
  assert.equal(isPresentationUtility('rottay-list-toolbar'), false);
  assert.equal(isPresentationUtility('candidate-card'), false);

  const result = analyzeOwnershipSource(
    `<div className={cn('grid gap-3', active && 'bg-blue-500', 'candidate-card')} />`,
    path,
  );
  assert.equal(result.findings.length, 1);
  assert.equal(result.findings[0].category, 'utility-class');
  assert.equal(result.findings[0].evidence, 'bg-blue-500 gap-3 grid');
});

test('text glued across a template boundary is read as one class name', () => {
  const evidenceOf = (template) => analyzeOwnershipSource(
    `<div className={${template}} />`,
    path,
  ).findings.map((finding) => finding.evidence);

  assert.deepEqual(evidenceOf("`ds-surface ds-report ds-report--${wide ? 'sidebar' : 'top-filters'}`"), []);
  assert.deepEqual(evidenceOf("`ds-report ${wide ? 'top-4' : 'left-2'}`"), ['left-2 top-4']);
  assert.deepEqual(evidenceOf("`ds-x--${wide ? 'a top-4' : 'b'}`"), ['top-4']);
  assert.deepEqual(evidenceOf("`hover:${wide ? 'bg-red-500' : 'bg-blue-500'}`"), ['hover:bg-blue-500 hover:bg-red-500']);
  assert.deepEqual(evidenceOf("`md:${wide ? 'flex' : 'grid'}`"), ['md:flex md:grid']);
  assert.deepEqual(evidenceOf("`${wide ? 'w-' : 'h-'}full`"), ['h-full w-full']);
  assert.deepEqual(evidenceOf("`ds ${wide ? 'top-' : 'left-'}4`"), ['left-4 top-4']);
  assert.deepEqual(evidenceOf("`min-${wide ? 'w-4' : 'h-4'}`"), ['min-h-4 min-w-4']);
});

test('a handler passed to a same-file wrapper is read on the intrinsic it spreads onto', () => {
  const direct = analyzeOwnershipSource(
    'export function Board({ open }) { return <div onClick={open}>Card</div>; }',
    path,
  ).findings;
  const wrapped = analyzeOwnershipSource(`
    function Card({ tone, ...rest }) { return <div data-tone={tone} {...rest} />; }
    const Row = forwardRef(function Row(props, ref) { return <tr ref={ref} {...props} />; });
    const Action = ({ ...rest }) => <button {...rest} />;
    export function Board({ open }) {
      return <>
        <Card onClick={open}>Card</Card>
        <Row onClick={() => open()} />
        <Card onClick={(event) => event.stopPropagation()}>Shield</Card>
        <Action onClick={open}>Run</Action>
        <Imported onClick={open} />
      </>;
    }
  `, path).findings.filter((finding) => finding.rule === 'clickable-noninteractive');

  assert.deepEqual(wrapped.map((finding) => finding.evidence), [
    '<div onClick={…}> via <Card>',
    '<tr onClick={…}> via <Row>',
  ]);
  assert.equal(direct.length, 1);
  assert.equal(wrapped[0].id, direct[0].id);
});

test('moving a pinned handler behind a wrapper is not a drain, and a new one behind it is a finding', () => {
  withTree((tree) => {
    tree.write(MODERN_FILE, component('Modern', '<button>Run</button><div onClick={run}>Card</div>'));
    writeFileSync(tree.baselinePath, `${JSON.stringify(buildBaseline(tree.run().findings), null, 2)}\n`);
    assert.equal(tree.run().ok, true);

    const wrapper = 'function Card({ ...rest }) {\n  return <div {...rest} />;\n}\n';
    tree.write(MODERN_FILE, wrapper + component('Modern', '<button>Run</button><Card onClick={run}>Card</Card>'));
    const moved = tree.run();
    assert.equal(moved.ok, true);
    assert.deepEqual(moved.stale, []);
    assert.equal(tree.cli('--check').status, 0);

    tree.write(MODERN_FILE, wrapper + component(
      'Modern',
      '<button>Run</button><Card onClick={run}>Card</Card><Card onClick={run}>Again</Card>',
    ));
    const grown = tree.run();
    assert.equal(grown.ok, false);
    assert.equal(grown.counters[PRODUCTIVE].regressions, 1);
    assert.equal(grown.regressions[0].rule, 'clickable-noninteractive');
    assert.equal(tree.cli('--update-baseline').status, 1);
  });
});

test('chart rendering is an explicit SVG owner but ordinary patterns are not', () => {
  const chart = analyzeOwnershipSource(
    '<svg><path /></svg>',
    'src/components/patterns/visualization/charts/families/sparkline/index.tsx',
  );
  const pattern = analyzeOwnershipSource('<svg />', path);
  assert.equal(chart.findings.length, 0);
  assert.equal(pattern.findings[0].category, 'local-svg');
});

test('baseline is a path-stable multiset and only additional copies regress', () => {
  const finding = analyzeOwnershipSource('<button />', path).findings[0];
  const baseline = buildBaseline([finding]);
  assert.equal(evaluateBaseline([{ ...finding, line: 999 }], baseline).ok, true);

  const growth = evaluateBaseline([finding, { ...finding, line: 12 }], baseline);
  assert.equal(growth.ok, false);
  assert.equal(growth.regressions.length, 1);
  assert.equal(growth.regressions[0].occurrence, 2);
  assert.deepEqual(validateBaseline(baseline), []);
});

test('owner class is the engine freeze law applied to the path', () => {
  assert.equal(FROZEN.test(`src/${CLASSIC_FILE}`), true);
  assert.equal(FROZEN.test(`src/${RUSTIC_FILE}`), true);
  assert.equal(FROZEN.test(`src/${MODERN_FILE}`), false);
  for (const file of [CLASSIC_FILE, RUSTIC_FILE, MODERN_FILE, SHARED_FILE]) {
    assert.equal(counterOf(`src/${file}`) === FROZEN_TRANSFERRED, FROZEN.test(`src/${file}`));
  }
  assert.equal(ownerClass(`src/${CLASSIC_FILE}`), 'classic');
  assert.equal(ownerClass(`src/${RUSTIC_FILE}`), 'rustic');
  assert.equal(ownerClass(`src/${MODERN_FILE}`), 'modern');
  assert.equal(ownerClass(`src/${SHARED_FILE}`), 'shared');
  assert.equal(ownerClass('src/components/patterns/classic-engines/index.tsx'), 'shared');
});

test('the gate reports two named counters, each exact, and never a netted figure', () => {
  withTree((tree) => {
    const result = tree.run();
    assert.equal(result.ok, true);
    assert.deepEqual(Object.keys(result.counters), [PRODUCTIVE, FROZEN_TRANSFERRED]);
    assert.deepEqual(
      [result.counters[PRODUCTIVE].live.occurrences, result.counters[PRODUCTIVE].live.rows],
      [2, 2],
    );
    assert.deepEqual(
      [result.counters[FROZEN_TRANSFERRED].live.occurrences, result.counters[FROZEN_TRANSFERRED].live.rows],
      [3, 2],
    );
    assert.deepEqual(result.counters[FROZEN_TRANSFERRED].live.classes, {
      classic: { occurrences: 2, rows: 1 },
      rustic: { occurrences: 1, rows: 1 },
    });
    const report = summaryLines(result).join('\n');
    assert.match(report, /productive \(Modern engine \+ shared core\): 2 occurrence\(s\) in 2 row\(s\) — pin 2\/2 — exact — receiver WO-EVI-02/u);
    assert.match(report, /frozen-transferred \(Classic \+ Rustic\) → WO-RET-06: 3 occurrence\(s\) in 2 row\(s\) — pin 3\/2 — exact/u);
    assert.match(report, /OPEN, transferred, not resolved/u);
  });
});

test('a new productive occurrence reds the productive counter and only that one', () => {
  withTree((tree) => {
    tree.write(MODERN_FILE, component('Modern', '<button>Run</button><button>Again</button>'));
    const result = tree.run();
    assert.equal(result.ok, false);
    assert.equal(result.counters[PRODUCTIVE].regressions, 1);
    assert.equal(result.counters[FROZEN_TRANSFERRED].regressions, 0);
    assert.equal(result.regressions[0].counter, PRODUCTIVE);
    assert.equal(result.regressions[0].ownerClass, 'modern');
    const check = tree.cli('--check');
    assert.equal(check.status, 1);
    assert.match(check.stdout, /New ownership findings — productive may not grow/u);
  });
});

test('a new frozen occurrence reds the frozen counter by name: frozen debt may not grow', () => {
  withTree((tree) => {
    tree.write(RUSTIC_FILE, component('Rustic', '<input /><select />'));
    const result = tree.run();
    assert.equal(result.ok, false);
    assert.equal(result.counters[FROZEN_TRANSFERRED].regressions, 1);
    assert.equal(result.counters[PRODUCTIVE].regressions, 0);
    assert.equal(result.regressions[0].counter, FROZEN_TRANSFERRED);
    assert.equal(result.regressions[0].ownerClass, 'rustic');
    const check = tree.cli('--check');
    assert.equal(check.status, 1);
    assert.match(check.stdout, /New ownership findings — frozen-transferred may not grow/u);
  });
});

test('a counter may not rise while the other falls: there is no arithmetic between them', () => {
  withTree((tree) => {
    tree.write(CLASSIC_FILE, component('Classic', '<span>Drained</span>'));
    tree.write(MODERN_FILE, component('Modern', '<button>Run</button><button>Again</button>'));
    const result = tree.run();
    assert.equal(result.total.live.occurrences < result.total.pinned.occurrences, true);
    assert.equal(result.ok, false);
    assert.equal(result.counters[PRODUCTIVE].regressions, 1);
    assert.equal(result.counters[FROZEN_TRANSFERRED].stale, 1);

    const before = readFileSync(tree.baselinePath, 'utf8');
    const update = tree.cli('--update-baseline');
    assert.equal(update.status, 1);
    assert.match(update.stderr, /Refusing to update the ownership baseline/u);
    assert.match(update.stderr, /productive: 1 row\(s\)/u);
    assert.equal(readFileSync(tree.baselinePath, 'utf8'), before);
  });
});

test('headroom is a finding: a pin above the live count fails the check', () => {
  withTree((tree) => {
    tree.write(CLASSIC_FILE, component('Classic', '<button>Run</button>'));
    const result = tree.run();
    assert.equal(result.ok, false);
    assert.equal(result.regressions.length, 0);
    assert.deepEqual(result.stale.map(({ count, live, counter }) => ({ count, live, counter })), [
      { count: 2, live: 1, counter: FROZEN_TRANSFERRED },
    ]);
    const check = tree.cli('--check');
    assert.equal(check.status, 1);
    assert.match(check.stdout, /Stale pins — frozen-transferred is below its ceiling/u);

    tree.write(SHARED_FILE, component('Shared', '<span>Drained</span>'));
    const drained = tree.run();
    assert.equal(drained.counters[PRODUCTIVE].stale, 1);
    assert.equal(drained.stale.some((row) => row.live === 0 && row.counter === PRODUCTIVE), true);
  });
});

test('a frozen pin lowered while the finding is still in the source reds', () => {
  withTree((tree) => {
    const document = tree.readBaseline();
    const [id] = Object.entries(document.entries).find(([, row]) => row.path === `src/${CLASSIC_FILE}`);
    document.entries[id].count = 1;
    tree.writeBaseline(document);
    const lowered = tree.run();
    assert.equal(lowered.ok, false);
    assert.equal(lowered.counters[FROZEN_TRANSFERRED].regressions, 1);

    delete document.entries[id];
    tree.writeBaseline(document);
    const deleted = tree.run();
    assert.equal(deleted.ok, false);
    assert.equal(deleted.counters[FROZEN_TRANSFERRED].regressions, 2);
    assert.equal(deleted.counters[FROZEN_TRANSFERRED].live.occurrences, 3);
  });
});

test('editing the baseline cannot move a row between classes: class is derived, never stored', () => {
  withTree((tree) => {
    const pristine = tree.readBaseline();
    const [id] = Object.entries(pristine.entries).find(([, row]) => row.path === `src/${CLASSIC_FILE}`);

    const repathed = structuredClone(pristine);
    repathed.entries[id].path = `src/${MODERN_FILE}`;
    tree.writeBaseline(repathed);
    const result = tree.run();
    assert.equal(result.ok, false);
    assert.deepEqual(result.misattributed, [{
      id,
      recorded: `src/${MODERN_FILE}`,
      measured: `src/${CLASSIC_FILE}`,
      counter: FROZEN_TRANSFERRED,
    }]);
    assert.equal(result.counters[FROZEN_TRANSFERRED].live.occurrences, 3);
    assert.equal(result.counters[PRODUCTIVE].live.occurrences, 2);
    assert.equal(tree.cli('--check').status, 1);

    const classed = structuredClone(pristine);
    classed.entries[id].ownerClass = 'productive';
    assert.match(validateBaseline(classed).join('\n'), /ownerClass is not a row field/u);
    tree.writeBaseline(classed);
    assert.equal(tree.run().ok, false);
    assert.match(tree.cli('--check').stderr, /owner class is derived from the path/u);

    const header = structuredClone(pristine);
    header.counters = { productive: 0 };
    assert.match(validateBaseline(header).join('\n'), /counters and owner classes are derived, never stored/u);
  });
});

test('the F-86 line is printed at 1,000 and above and disappears below it', () => {
  assert.equal(F86_THRESHOLD, 1000);
  assert.equal(f86Line({ occurrences: 999, rows: 999 }), null);
  assert.equal(
    f86Line({ occurrences: 1000, rows: 640 }),
    'F-86 < 1.000: NOT MET (total 1000 occurrence(s) / 640 row(s))',
  );

  const censusOf = (frozenCount) => {
    const findings = [
      ...analyzeOwnershipSource('<button />', `src/${MODERN_FILE}`).findings,
      ...Array.from({ length: frozenCount }, () => (
        analyzeOwnershipSource('<input />', `src/${RUSTIC_FILE}`).findings[0]
      )),
    ];
    return {
      findings,
      files: [],
      allowed: [],
      counts: {},
      dynamicGeometryExemptions: 0,
      tokenOwnedChrome: 0,
      ...evaluateBaseline(findings, buildBaseline(findings)),
    };
  };
  const below = summaryLines(censusOf(998)).join('\n');
  const at = summaryLines(censusOf(999)).join('\n');
  assert.doesNotMatch(below, /F-86 < 1\.000/u);
  assert.match(at, /F-86 < 1\.000: NOT MET \(total 1000 occurrence\(s\) \/ 2 row\(s\)\)/u);

  const stalePin = censusOf(999);
  const drainedLive = censusOf(998);
  const pinnedHigh = {
    ...drainedLive,
    ...evaluateBaseline(drainedLive.findings, buildBaseline(stalePin.findings)),
  };
  assert.match(summaryLines(pinnedHigh).join('\n'), /F-86 < 1\.000: NOT MET \(total 1000/u);
});

test('the producer only tightens: it refuses any increase and any new row', () => {
  const modern = analyzeOwnershipSource('<button />', `src/${MODERN_FILE}`).findings[0];
  const classic = analyzeOwnershipSource('<button />', `src/${CLASSIC_FILE}`).findings[0];
  const baseline = buildBaseline([modern, classic, classic]);

  const lowered = tightenBaseline([modern, classic], baseline);
  assert.equal(lowered.ok, true);
  assert.equal(lowered.next.entries[classic.id].count, 1);

  const dropped = tightenBaseline([modern], baseline);
  assert.equal(dropped.ok, true);
  assert.deepEqual(Object.keys(dropped.next.entries), [modern.id]);

  const raised = tightenBaseline([modern, modern, classic], baseline);
  assert.equal(raised.ok, false);
  assert.equal(raised.next, null);
  assert.deepEqual(raised.refusals.map(({ kind, counter, pinned, count }) => ({ kind, counter, pinned, count })), [
    { kind: 'increase', counter: PRODUCTIVE, pinned: 1, count: 2 },
  ]);

  const rustic = analyzeOwnershipSource('<input />', `src/${RUSTIC_FILE}`).findings[0];
  const added = tightenBaseline([modern, classic, rustic], baseline);
  assert.equal(added.ok, false);
  assert.deepEqual(added.refusals.map(({ kind, counter }) => ({ kind, counter })), [
    { kind: 'new-row', counter: FROZEN_TRANSFERRED },
  ]);

  assert.equal(tightenBaseline([modern], buildBaseline([])).ok, false);
});

test('--update-baseline lowers a drained pin, refuses growth, and the removed flags fail', () => {
  withTree((tree) => {
    tree.write(CLASSIC_FILE, component('Classic', '<button>Run</button>'));
    assert.equal(tree.cli('--check').status, 1);
    const tightened = tree.cli('--update-baseline');
    assert.equal(tightened.status, 0);
    assert.match(tightened.stdout, /Tightened .*: 5\/4 → 4\/4 \(occurrences\/rows\)/u);
    assert.equal(tree.cli('--check').status, 0);

    tree.write(RUSTIC_FILE, component('Rustic', '<input /><textarea />'));
    const before = readFileSync(tree.baselinePath, 'utf8');
    const refused = tree.cli('--update-baseline');
    assert.equal(refused.status, 1);
    assert.match(refused.stderr, /frozen-transferred: 1 row\(s\)/u);
    assert.match(refused.stderr, /new-row/u);
    assert.equal(readFileSync(tree.baselinePath, 'utf8'), before);

    for (const flag of ['--write-baseline', '--allow-increase']) {
      const removed = tree.cli(flag);
      assert.equal(removed.status, 1);
      assert.match(removed.stderr, /was removed/u);
      assert.equal(readFileSync(tree.baselinePath, 'utf8'), before);
    }

    rmSync(tree.baselinePath);
    assert.equal(tree.cli('--update-baseline').status, 1);
  });
});

test('a schema 1 ledger is refused by the check and upgraded only through the producer', () => {
  const finding = analyzeOwnershipSource('<button />', `src/${MODERN_FILE}`).findings[0];
  const legacy = {
    schemaVersion: 1,
    scope: ['src/components/patterns', 'src/components/surfaces'],
    entries: [{ id: finding.id, path: finding.path, category: finding.category, rule: finding.rule, count: 3 }],
  };
  assert.match(validateBaseline(legacy).join('\n'), /schema 1/u);
  const upgraded = upgradeLegacyBaseline(legacy);
  assert.equal(upgraded.schema, BASELINE_SCHEMA);
  assert.deepEqual(validateBaseline(upgraded), []);
  assert.equal(upgraded.entries[finding.id].count, 3);
  assert.equal(tightenBaseline([finding, finding, finding, finding], upgraded).ok, false);
});

test('the ledger on disk exposes its real debt to the generic walk the runner prints', () => {
  const document = JSON.parse(readFileSync(REAL_BASELINE, 'utf8'));
  assert.deepEqual(validateBaseline(document), []);
  const counters = tallyCounters(ledgerRows(document));
  const total = totalOf(counters);
  const debt = debtOf(REAL_BASELINE);
  assert.equal(debt.counters, total.rows);
  assert.equal(debt.frozen, total.occurrences);
  assert.equal(debt.atZero, 0);

  const sentence = describeLedgerCounters(document);
  assert.match(sentence, new RegExp(
    `^productive ${counters[PRODUCTIVE].occurrences} occurrence\\(s\\) / ${counters[PRODUCTIVE].rows} row\\(s\\) → WO-EVI-02`,
    'u',
  ));
  assert.match(sentence, new RegExp(
    `frozen-transferred ${counters[FROZEN_TRANSFERRED].occurrences} occurrence\\(s\\) / ${counters[FROZEN_TRANSFERRED].rows} row\\(s\\) → WO-RET-06`,
    'u',
  ));
  assert.equal(/F-86 < 1\.000: NOT MET/u.test(sentence), total.occurrences >= F86_THRESHOLD);
});

/**
 * Negative drill. A census only earns trust when it is shown to bite, so this
 * exercises the real widget-board engine in a throwaway source root: the file
 * as it stands must be free of native-interactive debt, and re-introducing a
 * single productive `<button>` must turn the gate red at that exact path. The
 * real tree is never mutated and no baseline on disk is touched.
 */
test('gate reddens when a new native button appears in the widget-board engine', () => {
  const realSource = readFileSync(
    resolve(SCRIPT_DIR, '../../../../..', 'src', WIDGET_BOARD_FOUNDATION),
    'utf8',
  );
  const sourceRoot = mkdtempSync(resolve(tmpdir(), 'ds-a002-drill-'));
  const fixture = resolve(sourceRoot, WIDGET_BOARD_FOUNDATION);
  const baselinePath = resolve(sourceRoot, 'baseline.json');
  const allowlistPath = resolve(sourceRoot, 'allowlist.json');

  try {
    mkdirSync(dirname(fixture), { recursive: true });
    writeFileSync(fixture, realSource);

    // Freeze the file's current debt as the ceiling, then confirm the ceiling
    // holds and that ownership of the interactive surfaces really did move to
    // the primitives.
    const census = runOwnershipGate({ sourceRoot, baselinePath, allowlistPath });
    writeFileSync(baselinePath, `${JSON.stringify(buildBaseline(census.findings), null, 2)}\n`);

    const clean = runOwnershipGate({ sourceRoot, baselinePath, allowlistPath });
    assert.equal(clean.ok, true);
    assert.deepEqual(
      clean.findings.filter((finding) => (
        finding.category === 'native-interactive'
        || finding.category === 'primitive-reconstruction'
      )),
      [],
    );

    // The drill: one new productive native button in the same owner.
    writeFileSync(
      fixture,
      `${realSource}\nexport function DrillControl() {\n  return <button type="button">Drill</button>;\n}\n`,
    );

    const regressed = runOwnershipGate({ sourceRoot, baselinePath, allowlistPath });
    assert.equal(regressed.ok, false);
    assert.equal(regressed.regressions.length, 1);
    assert.equal(regressed.regressions[0].category, 'native-interactive');
    assert.equal(regressed.regressions[0].rule, 'native-button');
    assert.equal(regressed.regressions[0].path, `src/${WIDGET_BOARD_FOUNDATION}`);
    assert.equal(regressed.regressions[0].ceiling, 0);
  } finally {
    rmSync(sourceRoot, { recursive: true, force: true });
  }
});

test('allowlist needs justification and can target path/category/rule', () => {
  const invalid = { schemaVersion: 1, entries: [{ path: '**/*.tsx', reason: 'short' }] };
  assert.equal(validateAllowlist(invalid).length, 2);

  const finding = analyzeOwnershipSource('<svg />', path).findings[0];
  const allowlist = {
    schemaVersion: 1,
    entries: [{
      path: 'src/components/patterns/example/**',
      category: 'local-svg',
      rule: 'local-svg-root',
      reason: 'This fixture intentionally owns its generated data visualization.',
    }],
  };
  assert.deepEqual(validateAllowlist(allowlist), []);
  const result = applyAllowlist([finding], allowlist);
  assert.equal(result.active.length, 0);
  assert.equal(result.allowed.length, 1);
});
