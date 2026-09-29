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
  buildCensus,
  classifyReport,
  classifyRow,
  COMPONENTS_ROOT,
  loadReport,
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
        assert.ok(lineOf(s.file, s.line).includes(part), `${s.file}:${s.line} does not stamp '${part}'`);
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
