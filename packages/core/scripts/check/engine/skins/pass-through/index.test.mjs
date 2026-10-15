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
import { fileURLToPath, pathToFileURL } from 'node:url';

import { repoRoot as findRepoRoot } from '../../../../libraries/repo-root/index.mjs';
import { LAYOUT_CARRIERS, excludedKeys, measurePassThrough } from '../../../../libraries/engine/skins/pass-through/index.mjs';
import { BASELINE_PATH, eligibility, evaluatePassThrough, headCommit, projectMeasurement, readLedger, reclassifyLedger, serializeLedger, tightenLedger } from './index.mjs';

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
    // E8-b: every pinned site now forwards state, so the drill adds the part breach a site lacks.
    const row = v.roster.find((r) => !r.breach.includes('part-replace'));
    assert.ok(row, 'the tree still pins a site without a part breach');
    row.breach = [...row.breach, 'part-replace'].sort();
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
    // E8-b stripped typography's last held entries; the surviving held set is found, not named.
    const noted = (h) => typeof h === 'object';
    const held = Object.keys(ledger.families).find((f) => f !== fam && f !== 'box' && ledger.families[f].part.some(noted));
    assert.ok(held, 'a surviving held set exists to check');
    assert.equal(e[held].partStripEligible, false);
    assert.equal(e.box.partStripEligible, false, 'a layout carrier waits on the owner carrier ruling whatever its set says');
    // A held entry carries its routing, or -- newly visible under census v7.1 -- its cutNote.
    assert.ok(door.ledger.families[held].part.filter(noted).every((h) => h.routing || h.cutNote), 'surviving held entries keep their routing or cutNote');
    assert.deepEqual(door.ledger.families[held].part, ledger.families[held].part, 'the door rewrites no surviving held entry');
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

  // The container specimen seeds its own family row: container leaves `families` once its last
  // roster row is stripped, and the drill must not depend on which carrier rows remain.
  const withContainer = (l) => {
    l.families.container ??= { carrier: true, part: [], state: [] };
    return l;
  };

  it('flipping a layout carrier to carrier=false is red, and eligibility still holds it on the owner ruling', () => {
    const l = withContainer(clone(ledger));
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
    const l = withContainer(clone(ledger));
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

  // E8-b: typography has no caller left; box carries the barrel (re-export-chain) callers now.
  it('box callers imported through a barrel are in the enumeration', () => {
    const box = census.perFamilyPrecondition.byChildFamily.box;
    assert.ok(box, 'box has a precondition row');
    assert.ok(raw.compoundSites.some((c) => c.childFamily === 'box' && c.resolvedBy === 're-export-chain'), 'box has callers imported through a barrel');
    assert.equal(box.callerPartDependents, ledger.families.box.part.length);
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

/**
 * census v7.1.9 -- the STRUCTURAL-FORWARD class (owner 2026-10-14, CARRIERS answer 2, option 3;
 * P-88 kernel/common:166). The negatives N1-N9 of the lane-I debrief §4.4: each one move, its exact
 * finding set, red on its mutant; the committed ledger is green.
 */
describe('engine/skins/pass-through -- structural forwards (census v7.1.9)', () => {
  const CARRIER = new Set(LAYOUT_CARRIERS);
  /** The ledger as it stood before its reclassification: every structural key counted again. */
  const preReclassification = (l) => {
    const p = clone(l);
    p.roster = [...p.roster, ...p.structuralForwards.map(({ key, engine, family, breach }) => ({ key, engine, family, breach }))];
    p.counters.passThroughViolations += p.structuralForwards.length;
    delete p.counters.structuralForwards;
    delete p.structuralForwards;
    return p;
  };
  const modernCarrierKey = () => view.roster.find((r) => r.engine === 'modern' && CARRIER.has(r.family)).key;

  it('is published and conserved: every ratified key is measured, none is excluded, forwardingMeasured = sites + structural', () => {
    const { census } = measurePassThrough({ repoRoot: REPO });
    const sf = census.structuralForwards;
    assert.ok(sf.rows.length > 0, 'the lot ratifies at least the render-proven carriers');
    assert.equal(census.totals.forwardingMeasured, census.totals.sites + census.totals.structuralForwards);
    assert.equal(ledger.counters.passThroughViolations + ledger.counters.structuralForwards, census.totals.forwardingMeasured);
    assert.deepEqual(sf.rosterMismatch, []);
    assert.deepEqual(view.structuralForwards.map((r) => r.key).sort(), sf.roster.map((r) => r.key).sort(), 'the library roster is exactly what is measured');
    assert.deepEqual(ledger.structuralForwards.map((r) => r.key).sort(), sf.roster.map((r) => r.key).sort(), 'the ledger holds exactly the library roster');
    const excluded = new Set(excludedKeys(census.excluded).map(({ key }) => key));
    for (const row of sf.rows) {
      assert.ok(!excluded.has(row.key), `${row.key} is not excluded`);
      assert.ok(Object.values(row.structuralPredicate).every(Boolean), `${row.key} satisfies s1-s5`);
      assert.match(row.structuralForward.authority, /CARRIERS answer 2.*P-88 kernel\/common:166/);
      assert.match(row.structuralForward.evidence, /carriers-i1 battery/);
    }
    for (const key of sf.candidates) assert.ok(view.roster.some((r) => r.key === key), `candidate ${key} stays a counted site`);
  });

  it('N9: the classic/rustic rows that are not layout carriers stay counted (the frozen engines are not excluded wholesale)', () => {
    const frozen = view.roster.filter((r) => (r.engine === 'classic' || r.engine === 'rustic') && !CARRIER.has(r.family));
    const tally = {};
    for (const r of frozen) tally[`${r.family}/${r.engine}`] = (tally[`${r.family}/${r.engine}`] ?? 0) + 1;
    // E8-b stripped the 4 rustic typography sites; step 3 stripped the 6 classic ones.
    assert.deepEqual(tally, { 'divider/rustic': 2 });
    const { census } = measurePassThrough({ repoRoot: REPO });
    for (const r of frozen) {
      const site = census.sites.find((s) => s.key === r.key);
      assert.equal(site.structuralPredicate.s1, false, `${r.key} is no layout carrier (s1)`);
      assert.equal(site.structuralCandidate, undefined);
    }
  });

  it('reads the carrier skins by class: the layout-primitives and rustic/layout files are seen, with no anatomy rule', () => {
    const { census } = measurePassThrough({ repoRoot: REPO });
    const all = [...census.sites, ...census.structuralForwards.rows];
    const row = (re) => all.find((s) => re.test(s.id));
    const flex = row(/^primitives\/layout\/flex\/engines\/classic\/index\.tsx:/);
    assert.ok(flex.ownSkinFiles.includes('presentation/components/skin/layout-primitives/index.css'));
    assert.equal(flex.ownAnatomyRules, 0);
    const box = row(/^primitives\/layout\/box\/engines\/rustic\/index\.tsx:/);
    assert.ok(box.ownSkinFiles.includes('runtime/engines/rustic/skin/layout/index.css'));
    assert.equal(box.ownAnatomyRules, 0);
    assert.ok(row(/^primitives\/layout\/box\/engines\/modern\/index\.tsx:/).ownAnatomyRules > 0, 'the modern Box is selected by its own anatomy (box-surface)');
  });

  it('N6: a ledger key the library roster does not ratify is red', () => {
    const l = clone(ledger);
    const key = modernCarrierKey();
    l.structuralForwards.push({ key, engine: 'modern', family: 'box', breach: [] });
    l.counters.structuralForwards += 1;
    const findings = evaluatePassThrough(view, l);
    assert.deepEqual(kinds(findings), ['counter/shrank', 'structural/fail']);
    assert.match(findings.find((f) => f.kind === 'structural').detail, /the library roster does not ratify it/);
  });

  it('N6: a ratified key removed from the ledger by hand is red', () => {
    const l = clone(ledger);
    const [gone] = l.structuralForwards.splice(0, 1);
    l.counters.structuralForwards -= 1;
    const findings = evaluatePassThrough(view, l);
    assert.deepEqual(kinds(findings), ['counter/grew', 'structural/fail']);
    assert.match(findings.find((f) => f.kind === 'structural').detail, new RegExp(`${gone.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} is held nowhere`));
  });

  it('N6: a ledger row added without its counter is red', () => {
    const l = clone(ledger);
    l.structuralForwards.push({ key: modernCarrierKey(), engine: 'modern', family: 'box', breach: [] });
    assert.deepEqual(kinds(evaluatePassThrough(view, l)), ['structural/fail', 'structural/fail']);
  });

  it('N3/N4 (measurement side): a structural key the library roster does not hold is red', () => {
    const v = clone(view);
    const i = v.roster.findIndex((r) => r.engine === 'modern' && CARRIER.has(r.family));
    const [row] = v.roster.splice(i, 1);
    v.structuralForwards.push(row);
    v.counters.passThroughViolations -= 1;
    v.counters.structuralForwards += 1;
    const findings = evaluatePassThrough(v, ledger);
    assert.deepEqual(kinds(findings), ['counter/grew', 'counter/shrank', 'site/shrank', 'structural/fail']);
    assert.equal(reclassifyLedger(ledger, v).ok, false);
  });

  it('N7: structuralForwards growing is counter/grew, and the door refuses a broken conservation line', () => {
    const v = clone(view);
    v.counters.structuralForwards += 1;
    assert.deepEqual(kinds(evaluatePassThrough(v, ledger)), ['counter/grew']);
    const pre = preReclassification(ledger);
    const broken = clone(view);
    broken.counters.passThroughViolations += 1;
    const door = reclassifyLedger(pre, broken);
    assert.equal(door.ok, false);
    assert.ok(door.refusals.some((f) => f.kind === 'conservation'), 'the conservation line is named');
  });

  it('N8: --update-baseline refuses a reclassification; --reclassify-structural performs it and reproduces the committed ledger', () => {
    const pre = preReclassification(ledger);
    const n = ledger.structuralForwards.length;
    const findings = evaluatePassThrough(view, pre);
    assert.deepEqual(kinds(findings), ['counter/grew', 'counter/shrank', ...Array(n).fill('site/shrank'), ...Array(n).fill('structural/grew')].sort());
    const lower = tightenLedger(pre, view);
    assert.equal(lower.ok, false, 'a lower cannot launder a reclassification');
    assert.ok(lower.refusals.some((f) => f.kind === 'structural' && f.direction === 'grew'));
    const door = reclassifyLedger(pre, view, { head: 'drill', date: 'drill' });
    assert.equal(door.ok, true, JSON.stringify(door.refusals));
    assert.deepEqual(evaluatePassThrough(view, door.ledger), []);
    for (const field of ['counters', 'roster', 'structuralForwards', 'families', 'tripwires', 'c4', 'structuralForwardRule']) {
      assert.deepEqual(door.ledger[field], ledger[field], field);
    }
    assert.equal(door.ledger.lastMoveKind, 'reclassification');
    assert.match(door.ledger.lastMove.note, new RegExp(`forwardingMeasured ${ledger.counters.passThroughViolations + n} = passThroughViolations ${ledger.counters.passThroughViolations} \\+ structuralForwards ${n}`));
    assert.equal(reclassifyLedger(ledger, view).ok, false, 'nothing is left to move: the door is not idempotent cover for anything else');
  });

  it('the door admits a carrier-relabelled owner-skin family, and refuses one the ledger never counted under a carrier', () => {
    const fam = Object.keys(view.families).sort().find((f) => !CARRIER.has(f) && view.families[f].part.length === 0
      && view.families[f].state.length === 0 && view.roster.some((r) => r.family === f));
    assert.ok(fam, 'a non-carrier family with sites and empty held sets exists to drill');
    const pre = preReclassification(ledger);
    delete pre.families[fam];
    const relabelled = clone(pre);
    for (const r of relabelled.roster) if (r.family === fam) r.family = 'stack';
    const door = reclassifyLedger(relabelled, view, { head: 'drill', date: 'drill' });
    assert.equal(door.ok, true, JSON.stringify(door.refusals));
    assert.deepEqual(door.ledger.families[fam], { carrier: false, part: [], state: [] });
    const refused = reclassifyLedger(pre, view);
    assert.equal(refused.ok, false);
    assert.deepEqual(kinds(refused.refusals), ['carrier/fail']);
  });
});

describe('engine/skins/pass-through -- structural forwards, source drills (the census itself turns the gate red)', () => {
  let ws;
  const core = () => join(ws, 'packages/core');
  before(() => {
    ws = mkdtempSync(join(tmpdir(), 'pass-through-structural-'));
    mkdirSync(core(), { recursive: true });
    cpSync(join(REPO, 'packages/core/src'), join(core(), 'src'), { recursive: true });
    cpSync(join(REPO, 'packages/core/package.json'), join(core(), 'package.json'));
    symlinkSync(join(REPO, 'packages/core/node_modules'), join(core(), 'node_modules'));
  });
  after(() => { if (ws) rmSync(ws, { recursive: true, force: true }); });
  const measureCopy = () => measurePassThrough({ repoRoot: ws, fresh: true });
  /** Mutate one file of the copy, measure, restore. */
  const withMutant = (rel, from, to, fn) => {
    const path = join(core(), rel);
    const original = readFileSync(path, 'utf8');
    assert.equal(original.split(from).length, 2, `${rel}: the mutation point is located exactly once`);
    writeFileSync(path, original.replace(from, to));
    try { return fn(); } finally { writeFileSync(path, original); }
  };
  const ratified = (re) => ledger.structuralForwards.filter((r) => re.test(r.key));
  const expected = (k) => ['counter/grew', 'counter/shrank', ...Array(k).fill('site/grew'), ...Array(k).fill('structural/fail')].sort();

  it('N1: a ratified classic Box that stamps data-part="root" before the spread fails and is counted again', () => {
    const k = ratified(/^primitives\/layout\/box\/engines\/classic\//).length;
    assert.ok(k > 0, 'the classic Box is ratified');
    withMutant('src/components/primitives/layout/box/engines/classic/index.tsx', 'const elementProps = {\n    ...htmlAttributes,', 'const elementProps = {\n    "data-part": "root",\n    ...htmlAttributes,', () => {
      const findings = evaluatePassThrough(projectMeasurement(measureCopy()), ledger);
      assert.deepEqual(kinds(findings), expected(k));
      assert.ok(findings.filter((f) => f.kind === 'structural').every((f) => /it stamps a part of its own/.test(f.detail)));
    });
  });

  it('N1b: a ratified classic Box that stamps its own data-state fails (s2) under the same key', () => {
    const k = ratified(/^primitives\/layout\/box\/engines\/classic\//).length;
    withMutant('src/components/primitives/layout/box/engines/classic/index.tsx', 'const elementProps = {\n    ...htmlAttributes,', 'const elementProps = {\n    "data-state": "idle",\n    ...htmlAttributes,', () => {
      const findings = evaluatePassThrough(projectMeasurement(measureCopy()), ledger);
      assert.deepEqual(kinds(findings), expected(k));
      assert.ok(findings.filter((f) => f.kind === 'structural').every((f) => /predicate s2 fails/.test(f.detail)));
    });
  });

  it('N2: an anatomy rule on a ratified carrier class in layout-primitives fails (s4: the blind-spot regression)', () => {
    const k = ratified(/^primitives\/layout\/flex\/engines\/classic\//).length;
    assert.equal(k, 1, 'the classic Flex is ratified');
    const css = 'src/foundation/tokens/css/presentation/components/skin/layout-primitives/index.css';
    const original = readFileSync(join(core(), css), 'utf8');
    writeFileSync(join(core(), css), `${original}\n.rottay-flex--classic[data-part='x'] { color: red; }\n`);
    try {
      const m = measureCopy();
      const findings = evaluatePassThrough(projectMeasurement(m), ledger);
      assert.deepEqual(kinds(findings), expected(1));
      assert.match(findings.find((f) => f.kind === 'structural').detail, /predicate s4 fails/);
      assert.equal(m.census.sites.find((s) => /^primitives\/layout\/flex\/engines\/classic\//.test(s.id)).ownAnatomyRules, 1);
    } finally {
      writeFileSync(join(core(), css), original);
    }
  });

  it('N2b: a :where()-wrapped state rule on the rustic Stack class is read by class too', () => {
    const css = 'src/foundation/tokens/css/presentation/components/skin/layout-primitives/index.css';
    const original = readFileSync(join(core(), css), 'utf8');
    writeFileSync(join(core(), css), `${original}\n:where(.rottay-stack--rustic)[data-state] { color: red; }\n`);
    try {
      const m = measureCopy();
      const k = ratified(/^primitives\/layout\/stack\/engines\/rustic\//).length;
      const rows = [...m.census.sites, ...m.census.structuralForwards.rows].filter((s) => /^primitives\/layout\/stack\/engines\/rustic\//.test(s.id));
      assert.deepEqual(rows.map((s) => [s.ownAnatomyRules, s.structuralPredicate.s4, Boolean(s.structuralForward)]), [[1, false, false]]);
      assert.deepEqual(kinds(evaluatePassThrough(projectMeasurement(m), ledger)), k ? expected(k) : []);
    } finally {
      writeFileSync(join(core(), css), original);
    }
  });

  it('N5: a NEW classic carrier twin outside the roster stays a counted site (structuralCandidate) and is red', () => {
    const rel = 'src/components/primitives/layout/container/engines/classic/index.tsx';
    const original = readFileSync(join(core(), rel), 'utf8');
    writeFileSync(join(core(), rel), `${original}\nexport const ContainerTwin = React.forwardRef<HTMLDivElement, any>((props, ref) => {\n  const { className, ...rest } = props;\n  return <div ref={ref} className={className} style={{ boxSizing: "border-box" }} {...rest} />;\n});\n`);
    try {
      const m = measureCopy();
      const twin = m.census.sites.find((s) => s.key === 'primitives/layout/container/engines/classic/index.tsx#ContainerTwin#div#none#0');
      assert.ok(twin, 'the twin is measured');
      assert.equal(twin.structuralCandidate, true);
      // The container family row is seeded: it leaves `families` once its last roster row does.
      const seeded = clone(ledger);
      seeded.families.container ??= { carrier: true, part: [], state: [] };
      const findings = evaluatePassThrough(projectMeasurement(m), seeded);
      assert.deepEqual(kinds(findings), ['counter/grew', 'site/grew']);
    } finally {
      writeFileSync(join(core(), rel), original);
    }
  });

  // NotifierStack no longer forwards a caller state, so the anchoring is drilled on a mutant that
  // forwards it again: the re-counted site must be charged to its owner skin, never to `stack`.
  it('anchors the carriers by path: NotifierStack is charged to its owner skin, not to the stack carrier', () => {
    withMutant('src/components/primitives/feedback/foundation/notifier/presentation/stack/index.tsx', "'data-state': _callerDataState, ", '', () => {
      const measured = projectMeasurement(measureCopy());
      const notifier = measured.roster.filter((r) => r.key.startsWith('primitives/feedback/foundation/notifier/presentation/stack/index.tsx#'));
      assert.deepEqual(notifier.map((r) => r.family), ['notifier']);
      const seeded = clone(ledger);
      seeded.families.notifier ??= { carrier: false, part: [], state: [] };
      assert.equal(eligibility(seeded).notifier.waitsOn, undefined);
      assert.deepEqual(kinds(evaluatePassThrough(measured, seeded)), ['counter/grew', 'site/grew']);
    });
  });

  /** A private copy of the census library whose STRUCTURAL_FORWARDS roster gains one row. */
  const libraryWithRow = async (tag, key, engine, family) => {
    const dir = join(core(), `scripts/libraries-${tag}`);
    cpSync(join(REPO, 'packages/core/scripts/libraries'), dir, { recursive: true });
    const classify = join(dir, 'engine/skins/pass-through/classify/index.mjs');
    const text = readFileSync(classify, 'utf8');
    const anchor = 'const STRUCTURAL_FORWARDS = [\n';
    assert.equal(text.split(anchor).length, 2);
    writeFileSync(classify, text.replace(anchor, `${anchor}  { key: ${JSON.stringify(key)}, engine: ${JSON.stringify(engine)}, family: ${JSON.stringify(family)}, authority: STRUCTURAL_AUTHORITY, evidence: 'drill' },\n`));
    return import(pathToFileURL(join(dir, 'engine/skins/pass-through/index.mjs')).href);
  };

  it('N3: a MODERN carrier key added to the library roster fails the predicate and is red', async () => {
    const row = view.roster.find((r) => r.engine === 'modern' && r.family === 'box');
    const lib = await libraryWithRow('n3', row.key, 'modern', 'box');
    const findings = evaluatePassThrough(projectMeasurement(lib.measurePassThrough({ repoRoot: ws, fresh: true })), ledger);
    assert.deepEqual(kinds(findings), ['structural/fail']);
    assert.match(findings[0].detail, /lost its structural shape \(predicate s1 fails; predicate s2 fails; predicate s3 fails; predicate s4 fails\)/);
  });

  it('N4: a frozen-engine site that is no layout carrier, added to the library roster, fails s1 and is red', async () => {
    // Step 3 stripped the classic typography sites; the frozen non-carrier rows left are rustic.
    const row = view.roster.find((r) => (r.engine === 'classic' || r.engine === 'rustic') && !LAYOUT_CARRIERS.includes(r.family));
    assert.ok(row, 'the tree still pins a frozen-engine site that is no layout carrier');
    const lib = await libraryWithRow('n4', row.key, row.engine, row.family);
    const findings = evaluatePassThrough(projectMeasurement(lib.measurePassThrough({ repoRoot: ws, fresh: true })), ledger);
    assert.deepEqual(kinds(findings), ['structural/fail']);
    assert.match(findings[0].detail, /predicate s1 fails/);
  });
});
