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
import { eligibility, evaluatePassThrough, projectMeasurement, readLedger, tightenLedger } from './index.mjs';

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
    assert.equal(eligibility(ledger).button.partStripEligible, false);
    const v = clone(view);
    v.families.button.part = [];
    v.counters.callerPartDependents -= 1;
    assert.deepEqual(kinds(evaluatePassThrough(v, ledger)), ['counter/shrank', 'part-dependent/shrank']);
    const door = tightenLedger(ledger, v);
    assert.equal(door.ok, true);
    const e = eligibility(door.ledger);
    assert.equal(e.button.partStripEligible, true);
    assert.equal(e.typography.partStripEligible, false);
    assert.equal(e.box.partStripEligible, false, 'a layout carrier waits on the owner carrier ruling whatever its set says');
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
      assert.deepEqual(kinds(findings), ['counter/grew', 'site/grew']);
      assert.match(findings.find((f) => f.kind === 'site').detail, /NEW violating site primitives\/display\/zz-drill\/engines\/modern\/index\.tsx#default#div#root#0 \[part-replace, state-forward\]/);
    } finally {
      rmSync(join(core(), 'src/components/primitives/display/zz-drill'), { recursive: true, force: true });
    }
  });
});
