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

  // The drills borrow a family the tree measures with no held entry. It is found, not named: a family
  // leaves this view with its last violating site, as button did at the classic strip.
  const emptyFamily = () => Object.keys(view.families).find((fam) => !view.families[fam].carrier && view.families[fam].part.length === 0 && view.families[fam].state.length === 0);

  it('a family held-set violation is red: a new caller-part dependent on a family with no held entry', () => {
    const v = clone(view);
    const fam = emptyFamily();
    assert.ok(fam, 'the tree still measures a non-carrier family with no held entry');
    v.families[fam].part.push('patterns/drill/index.tsx#DrillChild#drill-part#0');
    v.counters.callerPartDependents += 1;
    const findings = evaluatePassThrough(v, ledger);
    assert.deepEqual(kinds(findings), ['counter/grew', 'part-dependent/grew']);
    assert.ok(findings.find((f) => f.kind === 'part-dependent').detail.startsWith(`${fam}: NEW caller-part dependent`));
  });

  it('a held entry that clears makes its family eligible only after the door lowers it, keeping the others\' routing', () => {
    const v = clone(view);
    const fam = emptyFamily();
    assert.ok(fam, 'the tree still measures a non-carrier family with no held entry');
    assert.deepEqual(v.families[fam].part, [], 'the drill seeds its own held entry on a family the tree measures empty');
    const l = clone(ledger);
    l.families[fam].part = [{ key: 'patterns/drill/index.tsx#DrillChild#drill-part#0', atBaseline: 'patterns/drill/index.tsx:1', routing: 'drill' }];
    l.counters.callerPartDependents += 1;
    assert.equal(eligibility(l)[fam].partStripEligible, false);
    assert.deepEqual(kinds(evaluatePassThrough(v, l)), ['counter/shrank', 'part-dependent/shrank']);
    const door = tightenLedger(l, v);
    assert.equal(door.ok, true);
    const e = eligibility(door.ledger);
    assert.equal(e[fam].partStripEligible, true);
    assert.equal(e.typography.partStripEligible, false);
    assert.equal(e.box.partStripEligible, false, 'a layout carrier waits on the owner carrier ruling whatever its set says');
    assert.ok(door.ledger.families.typography.part.length > 0, 'a surviving held set exists to check');
    // A held entry carries its routing, or -- newly visible under census v7.1 -- its cutNote.
    assert.ok(door.ledger.families.typography.part.every((h) => typeof h === 'object' && (h.routing || h.cutNote)), 'surviving held entries keep their routing or cutNote');
    assert.deepEqual(door.ledger.families.typography.part, ledger.families.typography.part, 'the door rewrites no surviving held entry');
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
  // The exemplar is read from the ledger, never named: a family leaves `families` once its
  // last roster row is stripped, so a named one would turn these drills red on its own lot.
  const emptyHeldNonCarrier = (l) => {
    const family = Object.keys(l.families).sort().find((k) => l.families[k].carrier === false && l.families[k].part.length === 0 && l.families[k].state.length === 0);
    assert.ok(family, 'the ledger holds a non-carrier family with empty held sets to drill');
    return family;
  };

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
    const family = emptyHeldNonCarrier(l);
    assert.equal(l.families[family].carrier, false);
    l.families[family].carrier = true;
    const findings = evaluatePassThrough(view, l);
    assert.deepEqual(kinds(findings), ['carrier/fail']);
    assert.equal(findings[0].detail, `${family}: the ledger says carrier=true, canonical LAYOUT_CARRIERS says false`);
    const e = eligibility(l)[family];
    assert.equal(e.partStripEligible, true, 'eligibility reads the canonical fact, not the false flag');
    assert.equal(e.waitsOn, undefined);
  });

  it('a non-carrier family with empty held sets stays fully eligible (the legitimate positive)', () => {
    assert.deepEqual(evaluatePassThrough(view, ledger), []);
    const e = eligibility(ledger)[emptyHeldNonCarrier(ledger)];
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
    // The specimen seeds its own family row: stepper leaves `families` once its last site does,
    // and a repainted wrapper of a family with no row would add a second finding (carrier/fail).
    const seeded = clone(ledger);
    seeded.families.stepper ??= { carrier: false, part: [], state: [] };
    try {
      const v = measureCopy();
      const findings = evaluatePassThrough(v, seeded);
      assert.deepEqual(kinds(findings), ['counter/grew', 'site/grew', 'tripwire/grew']);
      assert.ok(findings.some((f) => /TRIPWIRE primitives\/navigation\/stepper\/engines\/modern\/index\.tsx#default#nav#none#0 is painted again/.test(f.detail)));
      // Non-vacuity: the seeded row is what classifies the repainted wrapper's family.
      assert.equal(v.roster.find((r) => /stepper\/engines\/modern\/index\.tsx#default#nav#none#0$/.test(r.key))?.family, 'stepper');
      const unseeded = clone(seeded);
      delete unseeded.families.stepper;
      assert.ok(evaluatePassThrough(v, unseeded).some((f) => f.kind === 'carrier' && /^stepper: the ledger has no carrier classification/.test(f.detail)));
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

  // census v7.1: a caller tag is resolved THROUGH a barrel by its lexical re-export chain, and an
  // opener whose family does not resolve is reported, never skipped. v7.1.1: a tag that only
  // SHARES a family's name (antd's Card, a local element variable called Grid, an unimported
  // Stack) is not that family's caller -- the name guess is gone.
  it('resolves a caller through the barrel, and reports what it cannot resolve', () => {
    const dir = join(core(), 'src/components/structures/zz-resolver-drill');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.tsx'), [
      "import React from 'react';",
      "import { Card, Card as AntCard } from 'antd';",
      "import { Box, Heading, Nope, Text } from '@/components/primitives';",
      "import { Text as DeepText } from '../../primitives';",
      "import { Text as CompoundText } from '@ui/primitives/display/typography/compound/text';",
      'export function ZzResolverDrill({ level }: { level: 2 | 3 }) {',
      '  const LocalHeading = `h${level}`;',
      "  const Grid: 'dl' | 'div' = level === 2 ? 'div' : 'dl';",
      '  return (',
      '    <div data-part="zz-intrinsic">',
      '      <Text data-part="zz-barrel" />',
      '      <DeepText data-part="zz-deep-relative" />',
      '      <Heading data-part="zz-heading" />',
      '      <CompoundText data-part="zz-compound-import" />',
      '      <Box data-part="zz-tag-is-family" />',
      '      <LocalHeading data-part="zz-local-intrinsic" />',
      '      <AntCard data-part="zz-third-party" />',
      '      <Card data-part="zz-antd-named-like-a-family" />',
      '      <Grid data-part="zz-local-named-like-a-family" />',
      '      <Stack data-part="zz-unimported-named-like-a-family" />',
      '      <Mystery data-part="zz-unknown" />',
      '      <Nope data-part="zz-broken-chain" />',
      '    </div>',
      '  );',
      '}',
      '',
    ].join('\n'));
    try {
      const { raw, census } = measurePassThrough({ repoRoot: ws, fresh: true });
      const mine = (row) => row.file.endsWith('structures/zz-resolver-drill/index.tsx');
      const resolved = Object.fromEntries(raw.compoundSites.filter(mine).map((c) => [c.callerPart, `${c.childFamily} (${c.resolvedBy})`]));
      assert.deepEqual(resolved, {
        'zz-barrel': 'typography (re-export-chain)',
        'zz-deep-relative': 'typography (re-export-chain)',
        'zz-heading': 'typography (re-export-chain)',
        'zz-compound-import': 'typography (import-path)',
        'zz-tag-is-family': 'box (re-export-chain)',
      });
      const reported = Object.fromEntries(census.unresolvedCallers.rows.filter(mine).map((u) => [u.callerPart, u.class]));
      assert.deepEqual(reported, {
        'zz-local-intrinsic': 'local-intrinsic-variable',
        'zz-third-party': 'third-party',
        'zz-antd-named-like-a-family': 'third-party',
        'zz-local-named-like-a-family': 'local-intrinsic-variable',
        'zz-unimported-named-like-a-family': 'unresolvable',
        'zz-unknown': 'unresolvable',
        'zz-broken-chain': 'unresolvable',
      });
      const everywhere = [...raw.compoundSites, ...census.unresolvedCallers.rows].filter(mine).map((r) => r.callerPart);
      assert.ok(!everywhere.includes('zz-intrinsic'), 'an intrinsic element is not a caller');
      assert.deepEqual(census.unresolvedCallers.genuinelyUnresolvable.filter(mine).map((u) => u.callerPart).sort(), ['zz-broken-chain', 'zz-unimported-named-like-a-family', 'zz-unknown']);
      assert.deepEqual(raw.compoundSites.filter(mine).filter((c) => ['card', 'grid', 'stack'].includes(c.childFamily)), [], 'a shared name attributes nothing');
      assert.match(census.unresolvedCallers.rows.find((u) => u.callerPart === 'zz-broken-chain').evidence, /no export 'Nope'/);
      // The four typography callers are dependents of nothing here (no owner skin), so the gate
      // stays green on counters; the callers themselves are in the enumeration G1 reads.
      assert.equal(census.totals.unresolvedCallersGenuine, JUSTIFIED_UNRESOLVED.length + 3);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

/**
 * The openers whose element type is not statically known, each justified. Closed: a new one is
 * red until it is resolved or justified here. Keys are line-free: <file>#<tag>#<literal part>.
 */
const JUSTIFIED_UNRESOLVED = [
  // A slot override defaulting to an intrinsic element (`modernSlots?.CatalogGrid ?? "div"`).
  'patterns/data/widget-board/engines/foundation/index.tsx#CatalogGrid#catalog-grid',
  // A ternary over semantic icons (no family); the part is a computed marker, not a literal.
  'patterns/foundation/active-filter-state-glyph/index.tsx#Glyph#data-part',
  // The polymorphic `as` prop: the opener is the component's OWN root and stamps its own part.
  'primitives/display/crop-marks/index.tsx#As#root',
  'primitives/display/texture-backdrop/index.tsx#As#root',
  'primitives/display/typewriter/index.tsx#As#root',
  'primitives/layout/ascii-frame/index.tsx#As#root',
  'primitives/layout/invert-section/index.tsx#As#root',
  'primitives/layout/semantic-surface/index.tsx#Component#root',
  'structures/headers/section-frame/index.tsx#As#root',
  // The typography engines' own roots (`as` / Tag): counted as violating SITES, not as callers.
  'primitives/display/typography/engines/classic/index.tsx#TextElement#root',
  'primitives/display/typography/engines/modern/index.tsx#Component#root',
  'primitives/display/typography/engines/modern/index.tsx#Component#root',
  'primitives/display/typography/engines/rustic/index.tsx#HeadingElement#root',
  'primitives/display/typography/engines/rustic/index.tsx#TextElement#root',
  // An icon component handed in as a prop (`icon: Icon`); icons are not an engine family.
  'structures/dashboard/data-terminal-card/index.tsx#Icon#header-icon',
  'structures/dashboard/data-terminal-card/index.tsx#Icon#header-icon',
  'structures/dashboard/data-terminal-card/index.tsx#Icon#header-icon',
  'structures/dashboard/data-terminal-card/index.tsx#Icon#prompt-icon',
  'structures/dashboard/data-terminal-card/index.tsx#Icon#quick-action-icon',
  'structures/dashboard/data-terminal-card/index.tsx#Icon#stat-icon',
  // A heading-level prop used as the tag (`const Heading = headingLevel`, 'h2' by default).
  'structures/headers/section-frame/index.tsx#Heading#title',
];

describe('engine/skins/pass-through -- census v7.1: no caller is skipped in silence', () => {
  let raw;
  let census;
  before(() => {
    ({ raw, census } = measurePassThrough({ repoRoot: REPO }));
  });
  const short = (file) => file.replace('packages/core/src/components/', '');

  it('typography callers imported through a barrel are in the enumeration', () => {
    const typography = census.perFamilyPrecondition.byChildFamily.typography;
    assert.ok(typography, 'typography has a precondition row');
    assert.equal(typography.callerPartDependents, ledger.families.typography.part.length);
  });

  it('a family is attributed by proof only: no caller is resolved by its tag name (v7.1.1)', () => {
    const how = new Set(raw.compoundSites.map((c) => c.resolvedBy));
    assert.deepEqual([...how].sort(), ['import-path', 're-export-chain']);
    // The two rows the name guess used to claim, at this tree: reported, with their evidence.
    const reported = (file, tag) => census.unresolvedCallers.rows.filter((u) => short(u.file) === file && u.tag === tag).map((u) => u.class);
    assert.deepEqual(reported('patterns/visualization/kanban-board/engines/classic/index.tsx', 'Card'), ['third-party']);
    assert.deepEqual(reported('patterns/data/record-facts/engines/foundation/index.tsx', 'Grid'), ['local-intrinsic-variable']);
    const claimed = raw.compoundSites.filter((c) => (short(c.file) === 'patterns/visualization/kanban-board/engines/classic/index.tsx' && c.tag === 'Card')
      || (short(c.file) === 'patterns/data/record-facts/engines/foundation/index.tsx' && c.tag === 'Grid'));
    assert.deepEqual(claimed, []);
  });

  it('every unresolved opener is classified, and the statically-unknown set is the justified roster', () => {
    const { rows, total, byClass, genuinelyUnresolvable } = census.unresolvedCallers;
    assert.equal(total, rows.length);
    assert.equal(census.totals.unresolvedCallers, rows.length);
    assert.equal(Object.values(byClass).reduce((a, n) => a + n, 0), rows.length);
    const known = ['local-intrinsic-variable', 'local-component', 'third-party', 'non-family-component', 'local-dynamic-binding', 'unresolvable'];
    for (const u of rows) {
      assert.ok(known.includes(u.class), `${u.file}:${u.line} has class ${u.class}`);
      assert.ok(u.evidence, `${u.file}:${u.line} carries its evidence`);
    }
    assert.deepEqual(genuinelyUnresolvable.filter((u) => u.class === 'unresolvable'), [], 'no opener is plainly unresolvable');
    assert.deepEqual(
      genuinelyUnresolvable.map((u) => `${short(u.file)}#${u.tag}#${u.callerPart}`).sort(),
      [...JUSTIFIED_UNRESOLVED].sort(),
    );
  });

  it('every pin of the census inventory names a live site', () => {
    const { pinCheck } = census;
    assert.ok(Array.isArray(pinCheck), 'the census reports its pin inventory');
    for (const row of pinCheck) {
      assert.equal(row.present, row.censusSites.length > 0, `${row.pin}: present agrees with its census sites`);
    }
    assert.deepEqual(
      pinCheck.filter((row) => row.present !== true).map((row) => row.pin),
      [],
      'a pin with no census site is stale: remove the row or re-aim its predicate',
    );
  });
});
