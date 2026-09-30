// Node unit test (no browser) for the conditional-coverage classifier of the
// dead-selector audit (P-79 follow-up).
//
// A deadAnchor row may leave the failing class ONLY with positive source
// evidence: the owning component stamps the part on a DOM host, and every render
// path to it passes a condition the fixture did not satisfy. These tests pin
// that bias with synthetic mutants and against the committed report plus the
// live component sources.
//
// Run: node --test packages/showroom/e2e/diagnostics/dead-anchor-classification.unit.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  anchorParts,
  anchorTree,
  buildCensus,
  classifyReport,
  classifyRow,
  COMPONENTS_ROOT,
  loadReport,
  requiredAnchors,
} from './dead-anchor-classification.lib.mjs';

function syntheticTree(t, files) {
  const src = mkdtempSync(join(tmpdir(), 'dead-anchor-classification-'));
  t.after(() => rmSync(src, { recursive: true, force: true }));
  const components = join(src, 'components');
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(join(components, path, '..'), { recursive: true });
    writeFileSync(join(components, path), body);
  }
  return buildCensus(components);
}

const WIDGET = `
import React from 'react';
import { Card } from '../../../../display/card';

export const List = ({ rows }) => <ul data-part="list">{rows.map((r) => <li key={r} data-part="row-item" />)}</ul>;

export const Widget = ({ editable, showTime, loading, items }) => {
  if (loading) return null;
  const header = showTime ? <div data-part="time-column" /> : null;
  return (
    <div className="ds-widget" data-part="root">
      {header}
      {editable && <span data-part="edit-actions" />}
      {items.map((item) => <i key={item} data-part="item" />)}
      {editable && <Card data-part="edit-card" />}
      <b data-part="glyph" />
    </div>
  );
};
`;

const SYNTHETIC = {
  'primitives/inputs/widget/engines/modern/index.tsx': WIDGET,
  'primitives/inputs/other/engines/modern/index.tsx':
    "export const Other = ({ open }) => (open ? <div className=\"ds-other\" data-part=\"foreign-part\" /> : null);\n",
  'primitives/display/card/index.tsx': 'export const Card = (props) => <section>{props.children}</section>;\n',
};

const SKIN = 'modern/widget/index.css';
const row = (census, part, control) => classifyRow(census, SKIN, `.ds-widget [data-part='${part}']`, control);

test('mutant: a typo\'d part is TRUE_DEAD (no component stamps it)', (t) => {
  const census = syntheticTree(t, SYNTHETIC);
  const r = row(census, 'edit-actons');
  assert.equal(r.class, 'TRUE_DEAD');
  assert.match(r.reason, /'edit-actons' is stamped by no component source/);
});

test('mutant: a prop-gated part is CONDITIONAL with the owner, stamp line and condition', (t) => {
  const census = syntheticTree(t, SYNTHETIC);
  const r = row(census, 'edit-actions');
  assert.equal(r.class, 'CONDITIONAL', r.reason);
  assert.equal(r.owner, 'primitives/inputs/widget');
  const [stamp] = r.evidence[0].stamps;
  assert.equal(stamp.file, 'components/primitives/inputs/widget/engines/modern/index.tsx');
  assert.equal(stamp.line, WIDGET.split('\n').findIndex((l) => l.includes('"edit-actions"')) + 1);
  assert.deepEqual(stamp.required.map((c) => c.text), ['editable', '!(loading)']);
  assert.deepEqual(stamp.required[0].names, [{ name: 'editable', kind: 'prop' }]);
  assert.ok(r.conditionNames.includes('editable'));

  // A stamp held in a local and rendered later carries the local's gate.
  const time = row(census, 'time-column');
  assert.equal(time.class, 'CONDITIONAL', time.reason);
  assert.ok(time.conditionNames.includes('showTime'));
});

test('mutant: a part stamped only by a DIFFERENT component is TRUE_DEAD', (t) => {
  const census = syntheticTree(t, SYNTHETIC);
  const r = row(census, 'foreign-part');
  assert.equal(r.class, 'TRUE_DEAD');
  assert.match(r.reason, /not stamped by the owner primitives\/inputs\/widget \(only by a different component\)/);
});

test('an ungated stamp, an iteration-only gate and a non-DOM host never relax a row', (t) => {
  const census = syntheticTree(t, SYNTHETIC);
  // Stamped at rest: its absence is unexplained -- the P-79 class.
  const list = row(census, 'list');
  assert.equal(list.class, 'TRUE_DEAD');
  assert.match(list.reason, /ungated render path \(root; no condition\)/);
  // `.map` over data the fixture may well hold is not a feature switch.
  const rowItem = row(census, 'row-item');
  assert.equal(rowItem.class, 'TRUE_DEAD');
  assert.match(rowItem.reason, /iteration:rows \(not a gate\)/);
  const item = row(census, 'item');
  assert.equal(item.class, 'CONDITIONAL', 'the early return on `loading` gates it, not the iteration');
  assert.deepEqual(item.evidence[0].stamps[0].required.map((c) => c.text), ['!(loading)']);
  // `<Card data-part>` is exactly the drop P-79 found: landing is unproven.
  const card = row(census, 'edit-card');
  assert.equal(card.class, 'TRUE_DEAD');
  assert.match(card.reason, /non-DOM host: landing unproven/);
});

test('positive control: a condition a LIVE part proves true at rest cannot explain an absence', (t) => {
  const census = syntheticTree(t, SYNTHETIC);
  const report = { deadAnchors: [{ file: SKIN, selectors: [".ds-widget [data-part='glyph']", ".ds-widget [data-part='edit-actions']"] }] };
  const rules = [
    { engine: 'modern', file: 'widget/index.css', selector: ".ds-widget [data-part='glyph']" },
    { engine: 'modern', file: 'widget/index.css', selector: ".ds-widget [data-part='edit-actions']" },
    // The browser saw `root`: every condition on all of its paths held at rest.
    { engine: 'modern', file: 'widget/index.css', selector: ".ds-widget [data-part='root']" },
  ];
  // Without the control, `!(loading)` alone would relax the ungated-looking glyph.
  assert.equal(classifyRow(census, SKIN, ".ds-widget [data-part='glyph']").class, 'CONDITIONAL');
  const { rows, control } = classifyReport(report, { census, rules });
  assert.ok([...control.atRest].some((k) => k.endsWith(':!(loading)')));
  const [glyph, edit] = rows;
  assert.equal(glyph.class, 'TRUE_DEAD');
  assert.match(glyph.reason, /held at rest/);
  assert.equal(edit.class, 'CONDITIONAL');
  assert.deepEqual(edit.evidence[0].stamps[0].required.map((c) => c.text), ['editable']);
});

test('cross-file: a part file rendered by its engine inherits the engine\'s gate; a public barrel does not', (t) => {
  const census = syntheticTree(t, {
    'primitives/display/grid/engines/modern/index.tsx':
      "import { Chip } from './parts';\nexport const Grid = ({ chips }) => <div className=\"ds-grid\">{chips && <Chip />}</div>;\n",
    'primitives/display/grid/engines/modern/parts/index.ts': "export { Chip } from './chip';\n",
    'primitives/display/grid/engines/modern/parts/chip/index.tsx': 'export const Chip = () => <span data-part="chip" />;\n',
    'primitives/display/grid/compound/cell/index.tsx': 'export const Cell = () => <span data-part="cell" />;\n',
    'index.ts': "export { Cell } from './primitives/display/grid/compound/cell';\n",
  });
  const chip = classifyRow(census, 'modern/grid/index.css', ".ds-grid [data-part='chip']");
  assert.equal(chip.class, 'CONDITIONAL', chip.reason);
  assert.deepEqual(chip.conditionNames, ['chips']);
  const cell = classifyRow(census, 'modern/grid/index.css', ".ds-grid [data-part='cell']");
  assert.equal(cell.class, 'TRUE_DEAD', 'a publicly exported compound may be rendered ungated by any consumer');
});

// ---------------------------------------------------------------------------
// Real corpus: the committed report + the live component sources.
// ---------------------------------------------------------------------------

let real;
const realCorpus = () => {
  if (!real) {
    const census = buildCensus();
    real = { census, report: loadReport(), result: classifyReport(loadReport(), { census }) };
  }
  return real;
};

const pinned = (file, part) => realCorpus().result.rows.find((r) => r.file === file && r.parts.includes(part));
const stampOf = (r, part) => r.evidence.find((e) => e.part === part).stamps;

test('real pin: data-table inline-edit-actions is gated on the editing row and the actions column', () => {
  const r = pinned('modern/data-table/index.css', 'inline-edit-actions');
  assert.equal(r.class, 'CONDITIONAL', r.reason);
  assert.equal(r.owner, 'patterns/data/data-table');
  const [stamp] = stampOf(r, 'inline-edit-actions');
  assert.equal(stamp.file, 'components/patterns/data/data-table/engines/modern/index.tsx');
  assert.deepEqual(stamp.required.map((c) => c.text).sort(), ['actions', 'isRowEditing']);
  assert.ok(r.conditionNames.includes('editingCell') && r.conditionNames.includes('actions'), r.conditionNames.join(','));
});

test('real pin: upload preview-modal is gated on the previewImage state', () => {
  const r = pinned('modern/upload/index.css', 'preview-modal');
  assert.equal(r.class, 'CONDITIONAL', r.reason);
  assert.equal(r.owner, 'primitives/inputs/upload');
  const [stamp] = stampOf(r, 'preview-modal');
  assert.equal(stamp.file, 'components/primitives/inputs/upload/engines/modern/index.tsx');
  assert.deepEqual(stamp.required.map((c) => c.text), ['previewImage']);
  assert.deepEqual(stamp.required[0].names, [{ name: 'previewImage', kind: 'state' }]);
});

test('real pin: date-picker time-column is gated on the showTime prop', () => {
  const r = pinned('modern/date-picker/index.css', 'time-column');
  assert.equal(r.class, 'CONDITIONAL', r.reason);
  assert.equal(r.owner, 'primitives/inputs/date-picker');
  const [stamp] = stampOf(r, 'time-column');
  assert.equal(stamp.file, 'components/primitives/inputs/date-picker/engines/modern/index.tsx');
  const showTime = stamp.required.find((c) => c.text === 'showTime');
  assert.ok(showTime, stamp.required.map((c) => c.text).join(' & '));
  assert.ok(showTime.names.some((n) => n.name === 'showTime' && n.kind === 'prop'));
});

test('real pin: select search-input is gated on isSearchable (searchable / showSearch props)', () => {
  const r = pinned('modern/select/index.css', 'search-input');
  assert.equal(r.class, 'CONDITIONAL', r.reason);
  assert.equal(r.owner, 'primitives/inputs/select');
  const [stamp] = stampOf(r, 'search-input');
  assert.equal(stamp.file, 'components/primitives/inputs/select/engines/modern/index.tsx');
  const searchable = stamp.required.find((c) => c.text === 'isSearchable');
  assert.ok(searchable, stamp.required.map((c) => c.text).join(' & '));
  assert.deepEqual(searchable.names.map((n) => n.name).sort(), ['searchable', 'showSearch']);
});

test('real corpus: every CONDITIONAL row cites a stamp that is really at that file:line', () => {
  const { result } = realCorpus();
  const cache = new Map();
  const lineOf = (file, line) => {
    if (!cache.has(file)) cache.set(file, readFileSync(join(COMPONENTS_ROOT, file.replace(/^components\//, '')), 'utf8').split('\n'));
    return cache.get(file)[line - 1] ?? '';
  };
  for (const r of result.conditional) {
    assert.ok(r.evidence.length > 0, `${r.file} ${r.selector}: CONDITIONAL without evidence`);
    for (const { part, stamps } of r.evidence) {
      for (const s of stamps) {
        // A class anchor cites the literal or the template prefix that produces it.
        const token = s.kind === 'class' ? s.match : part;
        assert.ok(lineOf(s.file, s.line).includes(token), `${s.file}:${s.line} does not stamp '${token}'`);
        assert.ok(s.required.length > 0 || s.anyOf.every((g) => g.length > 0), `${s.file}:${s.line} '${part}' has an ungated path`);
      }
    }
  }
});

test('real corpus: every row is classified and both classes are populated', () => {
  const { report, result } = realCorpus();
  const total = report.deadAnchors.reduce((n, e) => n + e.selectors.length, 0);
  assert.equal(result.rows.length, total);
  assert.equal(result.trueDead.length + result.conditional.length, total);
  assert.ok(result.conditional.length > 0, 'nothing relaxed: the classifier is inert');
  assert.ok(result.trueDead.length > 0, 'nothing left failing: the classifier relaxes on guesses');
  // Class-only anchors carry no part to prove: they must all stay failing.
  for (const r of result.rows.filter((x) => x.parts.length === 0)) assert.equal(r.class, 'TRUE_DEAD');
});

test('non-vacuity: the census resolves a plausible share of the real component tree', () => {
  const { census } = realCorpus();
  // ~1,200 production sources and ~1,870 distinct parts at the time of writing.
  // The floors bite on a stale COMPONENTS_ROOT (0) without tracking routine edits.
  assert.ok(census.files.size > 500, `only ${census.files.size} component sources scanned`);
  assert.ok(census.global.size > 1000, `the static census resolved only ${census.global.size} parts`);
  let pairs = 0;
  let located = 0;
  let sites = 0;
  for (const [file, entry] of census.files) {
    if (entry.gateParts.size === 0) continue;
    const found = new Set(census.sitesOf(file).map((s) => s.part));
    sites += census.sitesOf(file).length;
    for (const part of entry.gateParts) {
      pairs += 1;
      if (found.has(part)) located += 1;
    }
  }
  assert.ok(sites > 3000, `the AST located only ${sites} stamp sites`);
  // The AST must place (almost) every stamp the static gate's regex sees; the
  // remainder are querySelector strings and forwarded values, never relaxed.
  assert.ok(located / pairs > 0.98, `the AST located ${located}/${pairs} gate stamps`);
});

// ---------------------------------------------------------------------------
// The misread shapes of the first adjudication waves (M1-M8), one mutant each.
// A live rule is the positive control's input: `rules` lists every rule of the
// report's files; the ones not in `deadAnchors` are what the browser saw alive.
// ---------------------------------------------------------------------------

const rulesOf = (entries) => entries.map(([file, selector]) => {
  const [engine, ...rest] = file.split('/');
  return { engine, file: rest.join('/'), selector };
});
const classify = (census, dead, live) => {
  const report = { deadAnchors: Object.entries(Object.groupBy(dead, ([f]) => f)).map(([file, rows]) => ({ file, selectors: rows.map(([, s]) => s) })) };
  return classifyReport(report, { census, rules: rulesOf([...dead, ...live]) });
};

test('M1: :is() arms are alternatives -- a live :is(root, dropdown) row proves nothing about dropdown', (t) => {
  const census = syntheticTree(t, {
    'primitives/inputs/drop/engines/modern/index.tsx': `
export const Drop = ({ open }) => (
  <div className="ds-drop" data-part="root">
    <b data-part="glyph" />
    {open && <div className="ds-drop ds-drop-panel" data-part="dropdown"><i data-part="menu-column" /></div>}
  </div>
);
`,
  });
  const tree = anchorTree(".ds-drop:is([data-part='root'], [data-part='dropdown']) [data-part='glyph']");
  assert.deepEqual([...requiredAnchors(tree).parts], ['glyph'], 'only the part every arm needs is required');
  assert.deepEqual(anchorParts(".ds-drop:is([data-part='root'], [data-part='dropdown']) [data-part='glyph']").sort(), ['dropdown', 'glyph', 'root']);
  const SKIN = 'modern/drop/index.css';
  const { rows, control } = classify(census, [
    [SKIN, ".ds-drop.ds-drop-panel[data-part='dropdown']"],
    [SKIN, ".ds-drop :is([data-part='dropdown'], [data-part='menu-column'])"],
    [SKIN, ".ds-drop :is([data-part='dropdown'], [data-part='glyph'])"],
  ], [[SKIN, ".ds-drop:is([data-part='root'], [data-part='dropdown']) [data-part='glyph']"]]);
  assert.ok(![...control.atRest].some((k) => k.endsWith(':open')), 'the live :is() row matched through root, never through dropdown');
  const [panel, bothGated, oneOpen] = rows;
  assert.equal(panel.class, 'CONDITIONAL', panel.reason);
  assert.deepEqual(panel.evidence[0].stamps[0].required.map((c) => c.text), ['open']);
  assert.equal(bothGated.class, 'CONDITIONAL', 'every arm gated: the alternation is explained');
  assert.equal(oneOpen.class, 'TRUE_DEAD', 'an ungated arm keeps the alternation unexplained');
});

test('M2: a held condition only counts on a site whose ancestry can satisfy the row', (t) => {
  const census = syntheticTree(t, {
    'primitives/inputs/field/engines/modern/index.tsx': `
export const Field = ({ showCount }) => (
  <div className="ds-field" data-part="field">
    <input data-part="control" />
    {showCount && <span data-part="count" />}
  </div>
);
`,
    'primitives/inputs/field/compound/area/index.tsx': `
export const Area = ({ showCount }) => (
  <div className="ds-area" data-part="root">
    <textarea data-part="control" />
    {showCount && <span data-part="count" />}
  </div>
);
`,
  });
  // The compound's own skin proves its count renders at rest.
  // (The control reads live rules of files that also have dead rows.)
  const { rows, control } = classify(census, [
    ['modern/field/index.css', ".ds-field[data-part='field'] > [data-part='count']"],
    ['agnostic/area/index.css', ".ds-area[data-part='root'] > [data-part='count'] + [data-part='count']"],
  ], [['agnostic/area/index.css', ".ds-area[data-part='root'] > [data-part='count']"]]);
  assert.ok([...control.atRest].some((k) => k.includes('compound/area') && k.endsWith(':showCount')));
  const [r] = rows;
  assert.equal(r.class, 'CONDITIONAL', r.reason);
  const stamps = r.evidence.find((e) => e.part === 'count').stamps;
  assert.deepEqual(stamps.map((s) => s.file), ['components/primitives/inputs/field/engines/modern/index.tsx'], 'the area site cannot sit under [field] >');
});

test('M3: a live part is credited to the owner only when the match cannot be a nested component\'s', (t) => {
  const census = syntheticTree(t, {
    'primitives/overlay/pop/engines/modern/index.tsx': `
export const Pop = ({ isOpen, children }) => (
  <div className="ds-pop" data-part="trigger">
    {children}
    {isOpen && <div data-part="surface"><div data-part="content" /></div>}
  </div>
);
`,
    'primitives/inputs/btn/engines/modern/index.tsx': 'export const Btn = () => <button data-part="content" />;\n',
  });
  const SKIN = 'modern/pop/index.css';
  const { rows, control } = classify(census, [[SKIN, ".ds-pop[data-part='trigger'] [data-part='surface']"]], [[SKIN, ".ds-pop[data-part='trigger'] [data-part='content']"]]);
  assert.ok(![...control.atRest].some((k) => k.endsWith(':isOpen')), 'a Button inside the trigger may be what the browser saw');
  assert.equal(rows[0].class, 'CONDITIONAL', rows[0].reason);
});

test('M4: conditions held on different instances never combine into held-together', (t) => {
  const census = syntheticTree(t, {
    'primitives/inputs/slider/engines/modern/index.tsx': `
export const Slider = ({ range, tip }) => {
  const tooltip = () => (tip ? <span data-part="tooltip" /> : null);
  if (range) return <div className="ds-sl" data-part="root"><i data-part="rail" />{tooltip()}</div>;
  return <div className="ds-sl" data-part="root">{tooltip()}</div>;
};
`,
  });
  const SKIN = 'modern/slider/index.css';
  const { rows, control } = classify(census, [[SKIN, ".ds-sl [data-part='rail'] + [data-part='tooltip']"]], [
    [SKIN, ".ds-sl [data-part='rail']"],
    [SKIN, ".ds-sl [data-part='tooltip']"],
  ]);
  assert.ok([...control.atRest].some((k) => k.endsWith(':range')) && [...control.atRest].some((k) => k.endsWith(':tip')), 'each condition held on its own');
  assert.ok(!control.witnesses.some((w) => [...w].some((k) => k.endsWith(':range')) && [...w].some((k) => k.endsWith(':tip'))), 'but never on one instance');
  const [r] = rows;
  assert.equal(r.class, 'CONDITIONAL', r.reason);
  assert.deepEqual(r.evidence.find((e) => e.part === 'tooltip').stamps[0].required.map((c) => c.text).sort(), ['range', 'tip']);
});

test('M5: variable intrinsic tags and forwarding components land; a dropping or overriding host does not', (t) => {
  const census = syntheticTree(t, {
    'primitives/display/sheet/engines/modern/index.tsx': `
import { Pass, Drop, Over } from '../../parts';
export const Sheet = ({ level, title, a, b, c }) => {
  const Heading = \`h\${level}\` as keyof JSX.IntrinsicElements;
  return (
    <div className="ds-sheet" data-part="root">
      {title && <Heading data-part="title">{title}</Heading>}
      {a && <Pass data-part="passed" />}
      {b && <Drop data-part="dropped" />}
      {c && <Over data-part="overridden" />}
    </div>
  );
};
`,
    'primitives/display/sheet/parts/index.tsx': `
export const Pass = ({ 'data-part': dataPart, children }) => <section data-part={dataPart ?? 'root'}>{children}</section>;
export const Drop = ({ children }) => <section>{children}</section>;
export const Over = ({ ...rest }) => <section {...rest} data-part="fixed" />;
`,
  });
  const row = (part) => classifyRow(census, 'modern/sheet/index.css', `.ds-sheet [data-part='${part}']`);
  assert.equal(row('title').class, 'CONDITIONAL', row('title').reason);
  assert.equal(row('passed').class, 'CONDITIONAL', row('passed').reason);
  assert.match(row('dropped').reason, /non-DOM host: landing unproven/);
  assert.match(row('overridden').reason, /non-DOM host: landing unproven/);
});

test('M6: a lookup-table member and a prop-driven class are gates; an unreadable selection is UNKNOWN', (t) => {
  const census = syntheticTree(t, {
    'primitives/feedback/res/engines/modern/index.tsx': `
const icons = { ok: <i data-part="status-icon" />, '404': <div data-part="status-code" /> };
const spread = { a: <i data-part="loose" /> };
export const Res = ({ status }) => (
  <div className="ds-res" data-part="root">
    {icons[status]}
    {Object.values(spread)}
  </div>
);
`,
    'primitives/layout/fold/engines/modern/index.tsx': `
export const Fold = ({ ghost, variant }) => (
  <div className={\`ds-fold ds-fold--\${variant}\${ghost ? ' ds-fold--ghost' : ''}\`} data-part="root">
    <p data-part="panel" />
  </div>
);
`,
  });
  const code = classifyRow(census, 'modern/res/index.css', ".ds-res [data-part='status-code']");
  assert.equal(code.class, 'CONDITIONAL', code.reason);
  assert.deepEqual(code.evidence[0].stamps[0].required.map((c) => c.text), ['status === "404"']);
  const loose = classifyRow(census, 'modern/res/index.css', ".ds-res [data-part='loose']");
  assert.equal(loose.class, 'TRUE_DEAD');
  assert.match(loose.reason, /unanalysable gate/);
  const ghost = classifyRow(census, 'modern/fold/index.css', ".ds-fold.ds-fold--ghost [data-part='panel']");
  assert.equal(ghost.class, 'CONDITIONAL', ghost.reason);
  // Two producers: the literal behind `ghost`, and the variant template when variant is 'ghost'.
  assert.deepEqual(ghost.evidence.find((e) => e.part === '.ds-fold--ghost').stamps.map((st) => st.required.map((c) => c.text).join(' & ')).sort(), ['ghost', 'variant === "ghost"']);
  const filled = classifyRow(census, 'modern/fold/index.css', ".ds-fold.ds-fold--filled [data-part='panel']");
  assert.equal(filled.class, 'CONDITIONAL', filled.reason);
  assert.deepEqual(filled.evidence.find((e) => e.part === '.ds-fold--filled').stamps[0].required.map((c) => c.text), ['variant === "filled"']);
  // The identity class carries no gate of its own: it explains nothing.
  assert.equal(classifyRow(census, 'modern/fold/index.css', ".ds-fold [data-part='panel']").class, 'TRUE_DEAD');
});

test('M7: a compound the engine reads by displayName as data is no evidence for the engine\'s rows', (t) => {
  const census = syntheticTree(t, {
    'primitives/navigation/steps/engines/modern/index.tsx': `
export const Steps = ({ children }) => {
  const items = [];
  const panels = [];
  React.Children.forEach(children, (child) => {
    if (child.type.displayName === 'Steps.Step') items.push(child.props);
  });
  React.Children.forEach(children, (child) => {
    if (child.type.displayName !== 'Steps.Panel') return;
    panels.push(React.cloneElement(child));
  });
  return <ol className="ds-steps" data-part="root">{items.map((it) => (it.description ? <li data-part="description" /> : <li data-part="label" />))}{panels}</ol>;
};
`,
    'primitives/navigation/steps/compound/step/index.tsx': "export const Step = ({ description }) => <div className=\"ds-step\"><span data-part=\"description\" /></div>;\nStep.displayName = 'Steps.Step';\n",
    'primitives/navigation/steps/compound/panel/index.tsx': "export const Panel = () => <div data-part=\"panel\" />;\nPanel.displayName = 'Steps.Panel';\n",
  });
  const desc = classifyRow(census, 'modern/steps/index.css', ".ds-steps[data-part='root'] [data-part='description']");
  assert.equal(desc.class, 'CONDITIONAL', desc.reason);
  assert.deepEqual(desc.evidence[0].stamps.map((s) => s.file), ['components/primitives/navigation/steps/engines/modern/index.tsx']);
  // Cloned and rendered: the Panel compound still counts, and it renders ungated.
  assert.equal(classifyRow(census, 'modern/steps/index.css', ".ds-steps [data-part='panel']").class, 'TRUE_DEAD');
  // The compound's own skin keeps reading the compound.
  assert.match(classifyRow(census, 'agnostic/step/index.css', ".ds-step [data-part='description']").reason, /compound\/step/);
});

test('M8: a portal crossing or a wrapper the composition always inserts is a DEAD RULE; an orphan class too', (t) => {
  const census = syntheticTree(t, {
    'primitives/overlay/portal/index.tsx': 'export const Portal = ({ children }) => children;\n',
    'primitives/overlay/pop/index.tsx': `
import { Portal } from '../portal';
export const Pop = ({ content }) => <span><Portal>{content}</Portal></span>;
export const Inline = ({ content, css }) => {
  const node = <div>{content}</div>;
  return css ? node : <Portal>{node}</Portal>;
};
`,
    'primitives/overlay/trap/index.tsx': "export const Trap = ({ children, className = '' }) => <div className={`trap ${className}`.trim()}>{children}</div>;\n",
    'patterns/data/table/index.tsx': `
import { Pop, Inline } from '../../../primitives/overlay/pop';
export const Table = () => (
  <div className="ds-table" data-part="root">
    <Pop content={<i data-part="menu" />} />
    <Inline content={<i data-part="inline-menu" />} />
  </div>
);
`,
    'primitives/feedback/dialog/engines/rustic/index.tsx': `
import { Trap } from '../../../../overlay/trap';
export const Dialog = ({ open }) => (
  <div className="ds-dialog-root" data-part="root">
    {open && <Trap><div data-part="surface" /></Trap>}
    {open && <Trap className="ds-dialog-root"><div data-part="loose-surface" /></Trap>}
  </div>
);
`,
  });
  const menu = classifyRow(census, 'agnostic/table/index.css', ".ds-table [data-part='menu']");
  assert.equal(menu.verdict, 'dead-rule', menu.reason);
  assert.match(menu.reason, /DEAD RULE: 'menu'.*portal/);
  // Rendered inline on one branch (the modern Popover's anchor-css path): never a proof.
  assert.notEqual(classifyRow(census, 'agnostic/table/index.css', ".ds-table [data-part='inline-menu']").verdict, 'dead-rule');
  const surface = classifyRow(census, 'rustic/dialog/index.css', ".ds-dialog-root > [data-part='surface']");
  assert.equal(surface.verdict, 'dead-rule', surface.reason);
  assert.match(surface.reason, /its parent never carries \.ds-dialog-root/);
  // A call site that passes the class makes the wrapper's classes open: no proof.
  assert.notEqual(classifyRow(census, 'rustic/dialog/index.css', ".ds-dialog-root > [data-part='loose-surface']").verdict, 'dead-rule');
  const orphan = classifyRow(census, 'agnostic/overlay-modal-compounds/index.css', ".ds-never-generated[data-part='root']");
  assert.equal(orphan.class, 'TRUE_DEAD');
  assert.equal(orphan.verdict, 'dead-rule');
  assert.match(orphan.reason, /generated by no source \(orphan selector\); owned by the token-drainage wave, not a component defect/);
});

// ---------------------------------------------------------------------------
// Regression pins on the real corpus: the dead skin arms retired at df09cad39
// and c2df6644f, and the rustic modal root the repaired instrument found.
// ---------------------------------------------------------------------------

const withRows = (extra) => {
  const report = structuredClone(loadReport());
  for (const [file, selector] of extra) {
    const entry = report.deadAnchors.find((e) => e.file === file) ?? (report.deadAnchors.push({ file, selectors: [] }), report.deadAnchors.at(-1));
    entry.selectors.push(selector);
  }
  return report;
};

test('real pins: the retired skin arms never relax, and the provable ones read as DEAD RULE', () => {
  const PINS = [
    ['modern/menu/index.css', ".ds-menu--modern[data-part='root'] [data-part='item'][data-state~='disabled'] [data-part='arrow-icon']"],
    ['agnostic/input-compounds/index.css', ".ds-input-group[data-part='group'][data-compact='true'] > :first-child:not(:last-child) .ds-select-shell [data-part='trigger']"],
    ['agnostic/input-compounds/index.css', ".ds-input-group[data-part='group'][data-compact='true'] > :last-child:not(:first-child) .ds-select-shell [data-part='trigger']"],
    ['agnostic/input-compounds/index.css', ".ds-input-group[data-part='group'][data-compact='true'] > :not(:first-child):not(:last-child) .ds-select-shell [data-part='trigger']"],
    ['agnostic/data-table-mobile/index.css', '.ds-pattern-data-table.ds-data-table--mobile [data-part="row-actions-menu"]'],
  ];
  const { census } = realCorpus();
  const { rows } = classifyReport(withRows(PINS), { census });
  const pinned = PINS.map(([file, selector]) => rows.find((r) => r.file === file && r.selector === selector));
  for (const r of pinned) assert.equal(r.class, 'TRUE_DEAD', `${r.selector} relaxed: ${r.reason}`);
  // The modern Popover renders content inline under strategy anchor-css: NOT a portal proof.
  assert.notEqual(pinned[4].verdict, 'dead-rule', pinned[4].reason);
  const modal = rows.find((r) => r.file === 'rustic/modal/index.css' && r.selector.replace(/\s+/g, ' ') === ".rottay-modal-root--rustic > [data-part='surface']");
  assert.ok(modal, 'the rustic modal root row is in the report');
  assert.equal(modal.verdict, 'dead-rule', modal.reason);
  assert.match(modal.reason, /its parent never carries \.rottay-modal-root--rustic/);
});

test('real pins: the orphan overlay-modal classes read as drainage-owned dead rules', () => {
  const { result } = realCorpus();
  const orphans = result.rows.filter((r) => r.file === 'agnostic/overlay-modal-compounds/index.css');
  assert.ok(orphans.length >= 5, `expected the 5 deferred orphans, got ${orphans.length}`);
  for (const r of orphans) {
    assert.equal(r.verdict, 'dead-rule', r.reason);
    assert.match(r.reason, /owned by the token-drainage wave, not a component defect/);
  }
});
