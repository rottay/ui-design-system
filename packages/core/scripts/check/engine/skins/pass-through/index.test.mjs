/**
 * Drills for engine/skins/pass-through. Each drill makes ONE move and asserts the EXACT finding
 * set it produces (isolation): a drill that turned red for a second reason would prove nothing.
 *
 * The comparison drills reuse one real measurement of this tree and mutate a clone of the
 * projected view or of the ledger. The two source drills copy packages/core/src to a temp
 * workspace, mutate ONE file there, and re-measure end to end, so the census itself (not a
 * hand-made view) is what turns the gate red.
 */
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { repoRoot as findRepoRoot } from '../../../../libraries/repo-root/index.mjs';
import { measurePassThrough } from '../../../../libraries/engine/skins/pass-through/index.mjs';
import { BASELINE_PATH, eligibility, evaluatePassThrough, headCommit, projectMeasurement, readLedger, serializeLedger, tightenLedger } from './index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = findRepoRoot(HERE);
const kinds = (findings) => findings.map((f) => `${f.kind}/${f.direction}`).sort();
const clone = (x) => structuredClone(x);

let view;
let ledger;
before(() => {
  view = projectMeasurement(measurePassThrough({ repoRoot: REPO }));
  ledger = readLedger();
});

describe('engine/skins/pass-through -- the committed ledger', () => {
  it('is green at this tree', () => {
    assert.deepEqual(evaluatePassThrough(view, ledger), []);
  });
});

describe('engine/skins/pass-through -- comparison drills (one move each)', () => {
  it('a counter bump is red, and nothing else is', () => {
    const v = clone(view);
    v.counters.callerStateDependents += 1;
    assert.deepEqual(kinds(evaluatePassThrough(v, ledger)), ['counter/grew']);
  });

  it('a roster id renamed is red: the measured key is new and the pinned one left', () => {
    const l = clone(ledger);
    const original = l.roster[0].key;
    l.roster[0].key = original.replace(/#\d+$/, '#99');
    const findings = evaluatePassThrough(view, l);
    assert.deepEqual(kinds(findings), ['site/grew', 'site/shrank']);
    assert.match(findings.find((f) => f.direction === 'grew').detail, new RegExp(`NEW violating site ${original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  });

  it('a breach class gained on a pinned site is red', () => {
    const v = clone(view);
    const row = v.roster.find((r) => !r.breach.includes('state-forward'));
    row.breach = [...row.breach, 'state-forward'].sort();
    assert.deepEqual(kinds(evaluatePassThrough(v, ledger)), ['site-breach/grew']);
  });

  it('a site that leaves is red until the decrease-only door lowers it; then the suite is green', () => {
    const v = clone(view);
    const tripKeys = new Set(ledger.tripwires.map((t) => t.key));
    const gone = v.roster.findIndex((r) => !tripKeys.has(r.key));
    v.roster.splice(gone, 1);
    v.counters.passThroughViolations -= 1;
    assert.deepEqual(kinds(evaluatePassThrough(v, ledger)), ['counter/shrank', 'site/shrank']);
    const door = tightenLedger(ledger, v, { head: 'drill', date: 'drill' });
    assert.equal(door.ok, true);
    assert.equal(door.ledger.lastMoveKind, 'decrease');
    assert.equal(door.ledger.counters.passThroughViolations, ledger.counters.passThroughViolations - 1);
    assert.deepEqual(evaluatePassThrough(v, door.ledger), []);
  });

  it('the door refuses any growth (it only lowers)', () => {
    const v = clone(view);
    v.counters.callerPartDependents += 1;
    const door = tightenLedger(ledger, v);
    assert.equal(door.ok, false);
    assert.deepEqual(kinds(door.refusals), ['counter/grew']);
  });

  it('a family held-set violation is red: a new caller-part dependent on button', () => {
    const v = clone(view);
    v.families.button.part.push('patterns/drill/index.tsx#ModernButton#drill-part#0');
    v.counters.callerPartDependents += 1;
    const findings = evaluatePassThrough(v, ledger);
    assert.deepEqual(kinds(findings), ['counter/grew', 'part-dependent/grew']);
    assert.match(findings.find((f) => f.kind === 'part-dependent').detail, /^button: NEW caller-part dependent/);
  });

  it('a held entry that clears makes its family eligible only after the door lowers it, keeping the others\' routing', () => {
    const v = clone(view);
    assert.deepEqual(v.families.button.part, [], 'the drill seeds its own held entry on a family the tree measures empty');
    const l = clone(ledger);
    l.families.button.part = [{ key: 'patterns/drill/index.tsx#ModernButton#drill-part#0', atBaseline: 'patterns/drill/index.tsx:1', routing: 'drill' }];
    l.counters.callerPartDependents += 1;
    assert.equal(eligibility(l).button.partStripEligible, false);
    assert.deepEqual(kinds(evaluatePassThrough(v, l)), ['counter/shrank', 'part-dependent/shrank']);
    const door = tightenLedger(l, v);
    assert.equal(door.ok, true);
    const e = eligibility(door.ledger);
    assert.equal(e.button.partStripEligible, true);
    assert.equal(e.typography.partStripEligible, false);
    assert.equal(e.box.partStripEligible, false, 'a layout carrier waits on the owner carrier ruling whatever its set says');
    assert.ok(door.ledger.families.typography.part.length > 0, 'a surviving held set exists to check');
    assert.ok(door.ledger.families.typography.part.every((h) => typeof h === 'object' && h.routing), 'surviving held entries keep their routing');
  });

  it('a site that sheds its paint to leave the count is refused (a NEW unpainted row)', () => {
    const v = clone(view);
    const tripKeys = new Set(ledger.tripwires.map((t) => t.key));
    const i = v.roster.findIndex((r) => !tripKeys.has(r.key));
    const [row] = v.roster.splice(i, 1);
    v.tripwires = [...v.tripwires, row.key].sort();
    v.counters.passThroughViolations -= 1;
    const findings = evaluatePassThrough(v, ledger);
    assert.deepEqual(kinds(findings), ['counter/shrank', 'site/shrank', 'tripwire/grew']);
    assert.equal(tightenLedger(ledger, v).ok, false);
  });

  it('an unresolved C4 engine-scope selector fails closed', () => {
    const v = clone(view);
    v.c4.unresolved = 1;
    assert.deepEqual(kinds(evaluatePassThrough(v, ledger)), ['c4/fail']);
  });
});

describe('engine/skins/pass-through -- carrier classification (audit, Defect A)', () => {
  const WAITS = 'owner carrier ruling (§6): layout carriers are not scheduled by this gate';

  it('flipping a layout carrier to carrier=false is red, and eligibility still holds it on the owner ruling', () => {
    const l = clone(ledger);
    assert.equal(l.families.container.carrier, true, 'container is a layout carrier in the committed ledger');
    l.families.container.carrier = false;
    const findings = evaluatePassThrough(view, l);
    assert.deepEqual(kinds(findings), ['carrier/fail']);
    assert.match(findings[0].detail, /^container: the ledger says carrier=false, canonical LAYOUT_CARRIERS says true$/);
    const e = eligibility(l).container;
    assert.equal(e.partStripEligible, false);
    assert.equal(e.stateStripEligible, false);
    assert.equal(e.waitsOn, WAITS);
    assert.equal(tightenLedger(l, view).ok, false, 'the door refuses a tampered classification');
  });

  it('a missing carrier key is red', () => {
    const l = clone(ledger);
    delete l.families.container.carrier;
    assert.deepEqual(kinds(evaluatePassThrough(view, l)), ['carrier/fail']);
    assert.equal(eligibility(l).container.waitsOn, WAITS);
  });

  it('a non-boolean carrier is red', () => {
    const l = clone(ledger);
    l.families.box.carrier = 'true';
    const findings = evaluatePassThrough(view, l);
    assert.deepEqual(kinds(findings), ['carrier/fail']);
    assert.match(findings[0].detail, /^box: carrier must be a boolean/);
  });

  it('a non-carrier falsely flagged carrier=true is red too (the check is symmetric)', () => {
    const l = clone(ledger);
    assert.equal(l.families.select.carrier, false);
    l.families.select.carrier = true;
    const findings = evaluatePassThrough(view, l);
    assert.deepEqual(kinds(findings), ['carrier/fail']);
    assert.match(findings[0].detail, /^select: the ledger says carrier=true, canonical LAYOUT_CARRIERS says false$/);
    const e = eligibility(l).select;
    assert.equal(e.partStripEligible, true, 'eligibility reads the canonical fact, not the false flag');
    assert.equal(e.waitsOn, undefined);
  });

  it('a non-carrier family with empty held sets stays fully eligible (the legitimate positive)', () => {
    assert.deepEqual(evaluatePassThrough(view, ledger), []);
    const e = eligibility(ledger).select;
    assert.deepEqual(e, { partStripEligible: true, stateStripEligible: true, heldPart: [], heldState: [] });
    for (const carrier of ['box', 'flex', 'stack', 'grid', 'container', 'space']) {
      if (ledger.families[carrier]) assert.equal(eligibility(ledger)[carrier].waitsOn, WAITS, carrier);
    }
  });
});

describe('engine/skins/pass-through -- door fidelity (F-1)', () => {
  it('a lower keeps the c4 prose and records a non-null head', () => {
    const l = clone(ledger);
    l.c4.crossRosterRule = 'closed set (skin file#selector): drill prose that must survive a lower';
    const tripKeys = new Set(l.tripwires.map((t) => t.key));
    const v = clone(view);
    v.roster.splice(v.roster.findIndex((r) => !tripKeys.has(r.key)), 1);
    v.counters.passThroughViolations -= 1;
    const head = headCommit();
    assert.match(head ?? '', /^[0-9a-f]{40}$/, 'HEAD resolves');
    const door = tightenLedger(l, v, { head, date: 'drill' });
    assert.equal(door.ok, true);
    assert.equal(door.ledger.c4.crossRosterRule, l.c4.crossRosterRule);
    assert.equal(door.ledger.lastMove.head, head);
    assert.deepEqual(door.ledger.c4.crossRoster, v.c4.crossRoster);
  });

  it('a lower is byte-minimal: it keeps the file\'s own escaping style', () => {
    const doc = { a: 'layout carriers (§6)', n: 1 };
    const raw = serializeLedger(doc, '{\n "x": "(§6)"\n}\n');
    const escapedPrev = '{\n "x": "(\\u00a7)"\n}\n';
    assert.equal(raw, `${JSON.stringify(doc, null, 1)}\n`);
    assert.ok(serializeLedger(doc, escapedPrev).includes('(\\u00a76)'));
    assert.deepEqual(JSON.parse(serializeLedger(doc, escapedPrev)), doc);
    const current = readFileSync(BASELINE_PATH, 'utf8');
    assert.equal(serializeLedger(JSON.parse(current), current), current, 'a no-op rewrite of the committed ledger changes no byte');
  });
});

describe('engine/skins/pass-through -- source drills (the census itself turns the gate red)', () => {
  let ws;
  const core = () => join(ws, 'packages/core');
  before(() => {
    ws = mkdtempSync(join(tmpdir(), 'pass-through-drill-'));
    mkdirSync(core(), { recursive: true });
    cpSync(join(REPO, 'packages/core/src'), join(core(), 'src'), { recursive: true });
    cpSync(join(REPO, 'packages/core/package.json'), join(core(), 'package.json'));
    symlinkSync(join(REPO, 'packages/core/node_modules'), join(core(), 'node_modules'));
  });
  after(() => { if (ws) rmSync(ws, { recursive: true, force: true }); });
  const measureCopy = () => projectMeasurement(measurePassThrough({ repoRoot: ws, fresh: true }));

  it('a TRIPWIRE that is painted again re-enters the counted roster and is red', () => {
    const rel = 'src/components/primitives/navigation/stepper/engines/modern/index.tsx';
    const path = join(core(), rel);
    const original = readFileSync(path, 'utf8');
    const from = 'className={className || undefined}';
    assert.equal(original.split(from).length, 2, 'the tripwire wrapper is located exactly once');
    writeFileSync(path, original.replace(from, "className={['ds-stepper-track', className].filter(Boolean).join(' ')}"));
    try {
      const findings = evaluatePassThrough(measureCopy(), ledger);
      assert.deepEqual(kinds(findings), ['counter/grew', 'site/grew', 'tripwire/grew']);
      assert.ok(findings.some((f) => /TRIPWIRE primitives\/navigation\/stepper\/engines\/modern\/index\.tsx#default#nav#none#0 is painted again/.test(f.detail)));
    } finally {
      writeFileSync(path, original);
    }
  });

  it('a NEW violation site is red: a skinned element that lets a caller part replace its own', () => {
    const dir = join(core(), 'src/components/primitives/display/zz-drill/engines/modern');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.tsx'), [
      "import React from 'react';",
      'export default function ZzDrill(props: React.HTMLAttributes<HTMLDivElement>) {',
      '  const { className, ...rest } = props;',
      '  return <div className={`ds-zz-drill ${className ?? \'\'}`} data-part="root" {...rest} />;',
      '}',
      '',
    ].join('\n'));
    try {
      const v = measureCopy();
      const findings = evaluatePassThrough(v, ledger);
      // The new family zz-drill also has no ledger carrier classification (Defect A's check).
      assert.deepEqual(kinds(findings), ['carrier/fail', 'counter/grew', 'site/grew']);
      assert.match(findings.find((f) => f.kind === 'site').detail, /NEW violating site primitives\/display\/zz-drill\/engines\/modern\/index\.tsx#default#div#root#0 \[part-replace, state-forward\]/);
    } finally {
      rmSync(join(core(), 'src/components/primitives/display/zz-drill'), { recursive: true, force: true });
    }
  });
});
