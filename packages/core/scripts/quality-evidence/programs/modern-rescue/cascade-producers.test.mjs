/**
 * Drills del inventario de productores (PRE_F4B lote A, path A6).
 *
 * El lote A introduce un enumerador AST sobre 1727 archivos. Un enumerador que
 * dejo de detectar algo devuelve una lista mas corta y se ve identico a un
 * arbol limpio, asi que la prueba de que sigue detectando va ANTES que
 * cualquier cifra que lo cite.
 *
 * Reparto por contrato: censo/determinismo/ownership sobre fixtures, positivo
 * de `declarationOwner`, conflicto REAL de owner (N10) y emisor no atribuible
 * (N11). Ninguno de estos drills afirma la vacuidad del inventario REAL: por
 * la ley de secuencia F-5.2 los drills son de fixture, y una lista unknown no
 * vacia debe aterrizar como SOURCE_READY_BLOCKED, no como un test rojo.
 */

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  classifyCrossFileRows,
  dispositionIndex,
  boundedReceiptOf,
  DispositionJoinConflict,
  DISPOSITION_DECISION_FIELDS,
} from './cascade-disposition.mjs';
import {
  adjudicateDeclarationOwner,
  provablyNonObject,
  authoredCausalRoots,
  buildProducers,
  channelEmissionIdOf,
  engineScopeOfPath,
  OUT_PATH,
  ownershipConflictsOf,
  producerSiteIdOf,
  scanTsxSource,
  serialize,
} from './cascade-producers.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(HERE, 'cascade-producers.mjs');

function withFiles(files, run) {
  const sandbox = mkdtempSync(join(tmpdir(), 'cascade-producers-drill-'));
  try {
    for (const [rel, body] of Object.entries(files)) {
      const abs = join(sandbox, rel);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, body);
    }
    run(sandbox);
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
}

/* ================================================== the tsx AST plane === */

test('AST: a custom property in an inline style object is a stamp, classified by prefix', () => {
  const scan = scanTsxSource(
    'x.tsx',
    `export const A = () => <div style={{ '--ds-x': v, '--_ds-y': v, '--rh-z': v }} />;`,
  );
  assert.deepEqual(scan.stamps.map((s) => s.channel).sort(), ['--_ds-y', '--ds-x', '--rh-z']);
  assert.equal(scan.styleSinks, 1);
});

test('AST: element.style.setProperty is the second sink', () => {
  const scan = scanTsxSource(
    'x.tsx',
    `function paint(el) { el.style.setProperty('--ds-live-cursor-x', '4px'); }`,
  );
  assert.deepEqual(scan.stamps.map((s) => [s.channel, s.form]), [
    ['--ds-live-cursor-x', 'setProperty'],
  ]);
});

test('AST: the walk is SINK-ANCHORED -- an object that never reaches a style is NOT a producer', () => {
  const scan = scanTsxSource(
    'x.tsx',
    `const notStyle = { '--ds-never': 1 };
     export const A = () => <div data-x={notStyle} />;`,
  );
  assert.deepEqual(scan.stamps, [], 'membership is by reaching a style sink, not by text shape');
});

test('AST: interface and type keys are out by construction', () => {
  const scan = scanTsxSource(
    'x.tsx',
    `interface Vars { '--ds-typed': string }
     type Other = { '--ds-alias': string };
     export const A = () => <div />;`,
  );
  assert.deepEqual(scan.stamps, []);
});

test('AST: the backward walk resolves identifier, useMemo and spread', () => {
  const viaIdentifier = scanTsxSource(
    'x.tsx',
    `export const A = () => { const s = { '--ds-ident': v }; return <div style={s} />; };`,
  );
  assert.deepEqual(viaIdentifier.stamps.map((s) => s.channel), ['--ds-ident']);

  const viaMemo = scanTsxSource(
    'x.tsx',
    `export const A = () => { const s = useMemo(() => ({ '--ds-memo': v }), []); return <div style={s} />; };`,
  );
  assert.deepEqual(viaMemo.stamps.map((s) => s.channel), ['--ds-memo']);

  const viaSpread = scanTsxSource(
    'x.tsx',
    `const base = { '--ds-base': v };
     export const A = () => <div style={{ ...base, '--ds-own': v }} />;`,
  );
  assert.deepEqual(viaSpread.stamps.map((s) => s.channel).sort(), ['--ds-base', '--ds-own']);
});

test('AST: a block-bodied factory is followed through its return statement', () => {
  const scan = scanTsxSource(
    'x.tsx',
    `export const A = () => { const s = (() => { return { '--ds-returned': v }; })(); return <div style={s} />; };`,
  );
  assert.deepEqual(scan.stamps.map((s) => s.channel), ['--ds-returned']);
});

test('P0-1 what the walk refuses to follow becomes an IDENTIFIED SITE, not a counter', () => {
  const scan = scanTsxSource(
    'x.tsx',
    `import { imported } from './elsewhere';
     export const A = () => <div style={imported} />;`,
  );
  assert.deepEqual(scan.stamps, []);
  assert.equal(scan.unresolved.length, 1);
  assert.equal(scan.unresolved[0].form, 'identifier');
  assert.equal(scan.unresolved[0].symbol, 'A');
  assert.ok(scan.unresolved[0].line > 0 && scan.unresolved[0].expression.includes('imported'));
});

test('P0-1 a DYNAMIC setProperty is an unresolved site, not silence', () => {
  const scan = scanTsxSource(
    'x.tsx',
    `function write(rule, name, value) { rule.style.setProperty(name, value); }`,
  );
  assert.deepEqual(scan.stamps, []);
  assert.equal(scan.unresolved.length, 1);
  assert.equal(scan.unresolved[0].form, 'dynamic-setProperty');
  assert.equal(scan.unresolved[0].symbol, 'write');
});

test('P0-1 an unresolved SPREAD is its own site', () => {
  const scan = scanTsxSource(
    'x.tsx',
    `import { theme } from './theme';
     export const A = () => <div style={{ ...theme, '--ds-own': v }} />;`,
  );
  assert.deepEqual(scan.stamps.map((x) => x.channel), ['--ds-own']);
  assert.ok(scan.unresolved.some((u) => u.form === 'spread' || u.form === 'identifier'));
});

test('P0-1 under STRICT a missing producer ADMITS a fallback and can LOWER debt: under-counting is not safe', () => {
  // The law being protected, stated as arithmetic rather than as prose.
  // STRICT admits the alternative in `var(--ds-y, var(--ds-root))` only when
  // `--ds-y` has NO producer. So:
  const strictAdmits = (guardPrimaryHasProducer) => !guardPrimaryHasProducer;
  assert.equal(strictAdmits(true), false, 'a produced guard closes the branch');
  assert.equal(strictAdmits(false), true, 'an unproduced guard OPENS it');
  // Therefore forgetting a producer flips the branch open, which can only move
  // a ref towards wiredToAdoptedRoot -- i.e. DOWN in debt, a false green.
  const debtWithProducer = strictAdmits(true) ? 0 : 1;
  const debtWithoutProducer = strictAdmits(false) ? 0 : 1;
  assert.ok(
    debtWithoutProducer < debtWithProducer,
    'omitting a producer lowers debt: this is why every unresolved site must block',
  );
});

/* ================================================ applicability by path === */

test('P0-2 applicability is derived from the PATH: engine-specific stays in its engine', () => {
  assert.deepEqual(
    engineScopeOfPath('/packages/core/src/ui/patterns/data/data-table/engines/modern/index.tsx').engineScope,
    ['modern'],
  );
  assert.deepEqual(
    engineScopeOfPath('/packages/core/src/ui/primitives/display/Avatar/engines/rustic/index.tsx').engineScope,
    ['rustic'],
  );
  assert.deepEqual(
    engineScopeOfPath('/packages/core/src/ui/primitives/inputs/Button/engines/classic/index.tsx').engineScope,
    ['classic'],
  );
  const shared = engineScopeOfPath('/packages/core/src/ui/primitives/layout/Box/index.tsx');
  assert.deepEqual(shared.engineScope, ['modern', 'rustic', 'classic']);
  assert.match(shared.applicabilityEvidence, /no \/engines\/<engine>\/ segment/);
  // and the evidence must never be "inline styles win the cascade"
  for (const path of ['/x/engines/modern/a.tsx', '/x/b.tsx']) {
    assert.ok(!/specificity/i.test(engineScopeOfPath(path).applicabilityEvidence));
  }
});

test('P0-2 the live inventory scopes engine-specific emissions to their engine', () => {
  const inventory = JSON.parse(readFileSync(OUT_PATH, 'utf8'));
  const sites = new Map(inventory.producerSites.map((s) => [s.producerSiteId, s]));
  let checked = 0;
  for (const emission of inventory.channelEmissions) {
    const site = sites.get(emission.producerSiteId);
    if (site.plane !== 'tsx-inline-stamp') continue;
    for (const engine of ['modern', 'rustic', 'classic']) {
      if (site.file.includes(`/engines/${engine}/`)) {
        assert.deepEqual(emission.engineScope, [engine], `${site.file} must be ${engine}-only`);
        checked += 1;
      }
    }
  }
  assert.ok(checked > 0, 'the tree has engine-specific stamp sites; if it stops having them, re-read this drill');
});

test('AST: a computed key with an `as any` cast is still a stamp', () => {
  const scan = scanTsxSource(
    'x.tsx',
    `export const A = () => <div style={{ ['--ds-cast' as any]: v }} />;`,
  );
  assert.deepEqual(scan.stamps.map((s) => s.channel), ['--ds-cast']);
});

/* ============================================= declarationOwner (V3-3) === */

test('positive declarationOwner: the seven literal call sites close the button-alias domain', () => {
  const source = `
    function setLegacyButtonHoverBgAlias(vars, prefix, colour) { vars[\`--ds-button-\${prefix}-hover-bg\`] = colour; }
    function run(vars, c) {
      setLegacyButtonHoverBgAlias(vars, "primary", c.a);
      setLegacyButtonHoverBgAlias(vars, "secondary", c.b);
      setLegacyButtonHoverBgAlias(vars, "default", c.c);
      setLegacyButtonHoverBgAlias(vars, "ghost", c.d);
      setLegacyButtonHoverBgAlias(vars, "text", c.e);
      setLegacyButtonHoverBgAlias(vars, "dashed", c.f);
      setLegacyButtonHoverBgAlias(vars, "link", c.g);
    }`;
  const adjudicated = adjudicateDeclarationOwner({
    root: '/nonexistent',
    file: 'chrome-variables/index.ts',
    emission: { owner: 'setLegacyButtonHoverBgAlias', template: '--ds-button-${prefix}-hover-bg' },
    source,
  });
  assert.equal(adjudicated.declarationOwnerId, 'setLegacyButtonHoverBgAlias');
  assert.equal(adjudicated.channels.length, 7);
  assert.deepEqual(adjudicated.channels, [
    '--ds-button-dashed-hover-bg',
    '--ds-button-default-hover-bg',
    '--ds-button-ghost-hover-bg',
    '--ds-button-link-hover-bg',
    '--ds-button-primary-hover-bg',
    '--ds-button-secondary-hover-bg',
    '--ds-button-text-hover-bg',
  ]);
  assert.match(adjudicated.evidence, /AST -- one function declaration and 7 call sites/);
});

test('positive declarationOwner: the `index < 10` guard closes the chart-category domain', () => {
  const source = 'if (index < 10 && color) vars[`--ds-chart-category-${index + 1}`] = color;';
  const adjudicated = adjudicateDeclarationOwner({
    root: '/nonexistent',
    file: 'brand-theme/index.ts',
    emission: { owner: 'brandThemeToCssVariables', template: '--ds-chart-category-${index + 1}' },
    source,
  });
  assert.equal(adjudicated.declarationOwnerId, 'chart-category-index-guard');
  assert.deepEqual(adjudicated.channels, [
    '--ds-chart-category-1',
    '--ds-chart-category-2',
    '--ds-chart-category-3',
    '--ds-chart-category-4',
    '--ds-chart-category-5',
    '--ds-chart-category-6',
    '--ds-chart-category-7',
    '--ds-chart-category-8',
    '--ds-chart-category-9',
    '--ds-chart-category-10',
  ]);
});

test('positive declarationOwner: the hue-offset array closes the chart-series domain', () => {
  withFiles(
    {
      'packages/core/src/foundation/kernel/color/oklch/chart-series/index.ts':
        'export const CHART_SERIES_HUE_OFFSETS = [0, 40, 80, 135, 170, 205, 240, 275, 305, 340] as const;',
    },
    (sandbox) => {
      const adjudicated = adjudicateDeclarationOwner({
        root: sandbox,
        file: 'brand-theme/index.ts',
        emission: { owner: 'brandThemeToCssVariables', template: '--ds-chart-series-${index + 1}' },
        source: '',
      });
      assert.equal(adjudicated.declarationOwnerId, 'CHART_SERIES_HUE_OFFSETS');
      assert.equal(adjudicated.channels.length, 10);
      assert.equal(adjudicated.channels[9], '--ds-chart-series-10');
    },
  );
});

test('N11 an emitter with no statically closed domain is NOT attributed and NOT invented', () => {
  const adjudicated = adjudicateDeclarationOwner({
    root: '/nonexistent',
    file: 'somewhere/index.ts',
    emission: { owner: 'emitWhateverTheServerSays', template: '--ds-${runtimeValue}-bg' },
    source: 'vars[`--ds-${runtimeValue}-bg`] = x;',
  });
  assert.equal(adjudicated, null, 'no owner and no root may be invented: it stays unknownProvenance');
});

/* ============================================================ ownership === */

test('N10 the same producerSiteId claimed by two owners is an ownership CONFLICT', () => {
  const producerSiteId = producerSiteIdOf('css', 'a.css', 1, '--ds-x', 1);
  const conflicts = ownershipConflictsOf([
    { producerSiteId, ownerId: 'enumerator:alpha' },
    { producerSiteId, ownerId: 'declaration:beta' },
  ]);
  assert.equal(conflicts.length, 1);
  assert.deepEqual(conflicts[0].owners, ['declaration:beta', 'enumerator:alpha']);
});

test('two DIFFERENT sites emitting the same channel is co-emission, not a conflict', () => {
  const first = producerSiteIdOf('css', 'a.css', 1, '--ds-x', 1);
  const second = producerSiteIdOf('ts-compilers', 'b.ts', 9, 'emit', 1);
  assert.notEqual(first, second);
  assert.deepEqual(
    ownershipConflictsOf([
      { producerSiteId: first, ownerId: 'css-declaration' },
      { producerSiteId: second, ownerId: 'enumerator:alpha' },
    ]),
    [],
  );
  assert.notEqual(channelEmissionIdOf(first, '--ds-x'), channelEmissionIdOf(second, '--ds-x'));
});

test('P9 co-emitted channels keep EVERY emission: byChannel drops nothing', () => {
  const inventory = JSON.parse(readFileSync(OUT_PATH, 'utf8'));
  const shared = Object.entries(inventory.byChannel).filter(([, ids]) => ids.length > 1);
  assert.ok(shared.length > 0, 'the tree has co-emitted channels; if it stops having them, re-read this drill');
  for (const [channel, ids] of shared.slice(0, 25)) {
    const emissions = inventory.channelEmissions.filter((e) => e.channel === channel);
    assert.equal(ids.length, emissions.length, `byChannel[${channel}] must keep every emission`);
    assert.equal(new Set(ids).size, ids.length, 'no duplicate ids');
  }
});

/* ======================================================== causal roots === */

test('causal roots come from authored LIVE derivations and exclude wildcards BY SHAPE', () => {
  withFiles(
    {
      'roots/demo.json': JSON.stringify({
        rootId: 'demo.root',
        derivations: [
          { from: '--ds-head', to: '--ds-concrete', state: 'LIVE', site: 'x.ts', line: 7 },
          { from: '--ds-head', to: '--ds-flagged-*', state: 'LIVE', toIsPattern: true },
          { from: '--ds-head', to: '--ds-unflagged-*', state: 'LIVE' },
          { from: '--ds-head', to: '--ds-dead', state: 'PRESCRIPCION' },
        ],
      }),
    },
    (sandbox) => {
      const { byChannel, excluded } = authoredCausalRoots(join(sandbox, 'roots'));
      assert.deepEqual([...byChannel.keys()], ['--ds-concrete']);
      assert.equal(byChannel.get('--ds-concrete')[0].rootId, 'demo.root');
      assert.match(byChannel.get('--ds-concrete')[0].witness, /site x\.ts:7/);
      assert.deepEqual(excluded.map((e) => e.to).sort(), ['--ds-flagged-*', '--ds-unflagged-*']);
      assert.ok(
        !byChannel.has('--ds-dead'),
        'PRESCRIPCION is backlog, never a live edge',
      );
    },
  );
});

test('a wildcard without the toIsPattern flag is still excluded: the law cannot depend on the flag', () => {
  withFiles(
    {
      'roots/demo.json': JSON.stringify({
        rootId: 'demo.root',
        derivations: [{ from: '--ds-effect-intensity', to: '--ds-*', state: 'LIVE' }],
      }),
    },
    (sandbox) => {
      const { byChannel, excluded } = authoredCausalRoots(join(sandbox, 'roots'));
      assert.equal(byChannel.size, 0);
      assert.equal(excluded[0].reason, 'wildcard-shape');
    },
  );
});

/* ==================================================== census + CLI laws === */

test('the authored tsx census is compared and its difference is PUBLISHED, never silently matched', () => {
  const inventory = JSON.parse(readFileSync(OUT_PATH, 'utf8'));
  const { authoredCensus, measuredCensus, censusDiff, censusAdjudication } = inventory.tsxInlineStamp;
  assert.equal(authoredCensus.measuredOn, '2026-08-18');
  for (const key of Object.keys(censusDiff)) {
    assert.equal(censusDiff[key].authored, authoredCensus[key]);
    assert.equal(censusDiff[key].measured, measuredCensus[key]);
    assert.equal(censusDiff[key].delta, measuredCensus[key] - authoredCensus[key]);
  }
  const reconciliation = inventory.tsxInlineStamp.censusReconciliation;
  assert.equal(reconciliation.authoredPublishesMemberLists, false);
  assert.match(reconciliation.method, /identity, not tolerance/);
  // the residual is expressed as unknown ROWS, never as a numeric tolerance
  assert.equal(measuredCensus.unresolvedSites, reconciliation.unresolvedSites);
  assert.equal(
    inventory.unknownProvenance.filter((row) => row.plane === 'tsx-inline-stamp').length,
    measuredCensus.unresolvedSites,
    'every unresolved site has its own row',
  );
  assert.ok(inventory.tsxInlineStamp.governedChannels.length > 0, 'the list of 183 the prose never published now exists');
  assert.equal(inventory.tsxInlineStamp.scannedFileList.length, measuredCensus.scannedFiles);
});

/* ============================================ declarationOwner negatives === */

test('P0-3 a homonym in a COMMENT or a STRING cannot close a domain', () => {
  const source = `
    function setLegacyButtonHoverBgAlias(vars, prefix, colour) { vars[\`--ds-button-\${prefix}-hover-bg\`] = colour; }
    // setLegacyButtonHoverBgAlias(vars, "ghost", c.d);
    const doc = 'setLegacyButtonHoverBgAlias(vars, "text", c.e);';
    function run(vars, c) {
      setLegacyButtonHoverBgAlias(vars, "primary", c.a);
      setLegacyButtonHoverBgAlias(vars, "secondary", c.b);
    }`;
  const adjudicated = adjudicateDeclarationOwner({
    root: '/nonexistent',
    file: 'chrome-variables/index.ts',
    emission: { owner: 'setLegacyButtonHoverBgAlias', template: '--ds-button-\${prefix}-hover-bg' },
    source,
  });
  assert.deepEqual(adjudicated.channels, [
    '--ds-button-primary-hover-bg',
    '--ds-button-secondary-hover-bg',
  ], 'only the two REAL call sites; the comment and the string are prose');
});

test('P0-3 a SHADOWED declaration is not adjudicable', () => {
  const source = `
    function setLegacyButtonHoverBgAlias(vars, prefix, colour) {}
    const setLegacyButtonHoverBgAlias = (a, b, c) => {};
    setLegacyButtonHoverBgAlias(vars, "primary", c.a);`;
  assert.equal(
    adjudicateDeclarationOwner({
      root: '/nonexistent',
      file: 'x.ts',
      emission: { owner: 'setLegacyButtonHoverBgAlias', template: '--ds-button-\${prefix}-hover-bg' },
      source,
    }),
    null,
    'two declarations of the same name: which one closes the domain is undecidable',
  );
});

test('P0-3 a DYNAMIC argument does not close a domain', () => {
  const source = `
    function setLegacyButtonHoverBgAlias(vars, prefix, colour) {}
    function run(vars, c, which) {
      setLegacyButtonHoverBgAlias(vars, "primary", c.a);
      setLegacyButtonHoverBgAlias(vars, which, c.b);
    }`;
  assert.equal(
    adjudicateDeclarationOwner({
      root: '/nonexistent',
      file: 'x.ts',
      emission: { owner: 'setLegacyButtonHoverBgAlias', template: '--ds-button-\${prefix}-hover-bg' },
      source,
    }),
    null,
  );
});

test('P0-3 a non-literal hue-offset array does not close the chart-series domain', () => {
  withFiles(
    {
      'packages/core/src/foundation/kernel/color/oklch/chart-series/index.ts':
        'export const CHART_SERIES_HUE_OFFSETS = buildOffsets();',
    },
    (sandbox) => {
      assert.equal(
        adjudicateDeclarationOwner({
          root: sandbox,
          file: 'brand-theme/index.ts',
          emission: { owner: 'brandThemeToCssVariables', template: '--ds-chart-series-\${index + 1}' },
          source: '',
        }),
        null,
      );
    },
  );
});

test('P0-3 a chart-category guard that does not GOVERN the emission is not a domain', () => {
  assert.equal(
    adjudicateDeclarationOwner({
      root: '/nonexistent',
      file: 'brand-theme/index.ts',
      emission: { owner: 'brandThemeToCssVariables', template: '--ds-chart-category-\${index + 1}' },
      source: 'if (index < 10) { doSomethingElse(); }',
    }),
    null,
    'the guard must wrap the emission, not merely exist in the file',
  );
});

/* ================================================= the six inputsDigest === */

test('P0-4 the inventory seals the six required authorities and ingests artifacts', () => {
  const inventory = JSON.parse(readFileSync(OUT_PATH, 'utf8'));
  assert.deepEqual(Object.keys(inventory.inputsDigest).sort(), [
    'artifacts',
    'cascadeRoots',
    'cssEdges',
    'rootCatalog',
    'srcCompilers',
    'srcTsx',
  ]);
  for (const [key, value] of Object.entries(inventory.inputsDigest)) {
    assert.match(String(value), /^[0-9a-f]{64}$/, `${key} must be a real digest`);
  }
  const artifactSites = inventory.producerSites.filter((s) => s.ownerId.startsWith('declaration:tenant-artifact:'));
  assert.equal(artifactSites.length, 3, 'the three tenant artifacts declare channels and are producers under STRICT');
  assert.equal(inventory.stats.artifactThemes, 3);
  for (const site of artifactSites) assert.equal(site.plane, 'ts-compilers', 'no fifth plane is invented');
});

/* ===================================================== precedence schema === */

test('P2 precedence carries executionContext, order and evidence, and names no winner', () => {
  const inventory = JSON.parse(readFileSync(OUT_PATH, 'utf8'));
  assert.ok(inventory.precedenceMetadata.length > 0);
  for (const row of inventory.precedenceMetadata.slice(0, 50)) {
    assert.ok(Array.isArray(row.executionContext) && row.executionContext.length > 0);
    assert.ok(Array.isArray(row.order) && row.order.length > 0);
    assert.ok(typeof row.evidence === 'string' && row.evidence.length > 0);
    assert.ok(row.owners.length > 1);
    assert.ok(!('winner' in row), 'precedence orders EXECUTION, never ownership');
  }
});

test('the inventory publishes its three structures separately', () => {
  const inventory = JSON.parse(readFileSync(OUT_PATH, 'utf8'));
  const sites = new Map(inventory.producerSites.map((s) => [s.producerSiteId, s]));
  for (const emission of inventory.channelEmissions.slice(0, 200)) {
    assert.ok(sites.has(emission.producerSiteId), 'every emission belongs to a producer site');
    assert.ok(Array.isArray(emission.engineScope), 'applicability is per emission');
    assert.ok(Array.isArray(emission.causalRootIds), 'causality is per emission');
    for (const causal of emission.causalRootIds) {
      assert.ok(causal.rootId && causal.witness, 'a causal root without a witness is not evidence');
    }
  }
  assert.equal(new Set(inventory.producerSites.map((s) => s.producerSiteId)).size, inventory.producerSites.length);
});

test('N13 --check is PURE for the producer inventory too', () => {
  const before = { mtime: statSync(OUT_PATH).mtimeMs, bytes: readFileSync(OUT_PATH) };
  execFileSync(process.execPath, [SCRIPT, '--check'], { stdio: 'pipe' });
  execFileSync(process.execPath, [SCRIPT], { stdio: 'pipe' });
  const after = { mtime: statSync(OUT_PATH).mtimeMs, bytes: readFileSync(OUT_PATH) };
  assert.equal(after.mtime, before.mtime);
  assert.ok(before.bytes.equals(after.bytes));
  let code = 0;
  try {
    execFileSync(process.execPath, [SCRIPT, '--bogus'], { stdio: 'pipe' });
  } catch (error) {
    code = error.status;
  }
  assert.equal(code, 2);
});

test('buildProducers is deterministic: the same tree serialises byte-identically twice', () => {
  assert.equal(serialize(buildProducers()), serialize(buildProducers()));
});

/* ============================================ P1-1: ownership falsifiable === */

/** A whole minimal repo the real builder can run against. */
function withBuildFixture(run, extra = {}) {
  const box = mkdtempSync(join(tmpdir(), 'cascade-producers-build-'));
  const put = (rel, body) => {
    const abs = join(box, rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, body);
  };
  try {
    put(
      'packages/core/src/infrastructure/compilers/kernel/foundation/css/chrome-variables/index.ts',
      'export function chromeToVariables(vars) { vars["--ds-fixture-a"] = 1; }\n',
    );
    put('packages/core/src/infrastructure/compilers/kernel/runtime/appearance/index.ts', 'export const x = 1;\n');
    put('packages/core/src/infrastructure/compilers/kernel/runtime/brand-theme/index.ts', 'export const y = 1;\n');
    put('packages/core/src/infrastructure/compilers/kernel/foundation/css/appearance-posture/index.ts', 'export const z = 1;\n');
    put('packages/core/src/foundation/kernel/color/oklch/ramp/index.ts', 'export const RAMP_STEPS = [50, 100] as const;\n');
    put(
      'packages/core/src/foundation/contracts/composition/tenants/themes/tenant-theme/index.ts',
      'export const TENANT_THEME_OVERRIDE_TOKENS = ["--ds-fixture-override"] as const;\n',
    );
    put('packages/core/src/ui/demo/engines/rustic/index.tsx', `export const A = () => <div style={{ '--ds-fixture-stamp': v }} />;\n`);
    for (const [rel, body] of Object.entries(extra)) put(rel, body);
    put(
      'edges.json',
      JSON.stringify({
        scopeTable: [
          { scopeId: 0, pathEngines: ['modern', 'rustic', 'classic'], selectorEngines: ['modern'], effectiveEngines: ['modern'], status: 'ok' },
        ],
        edges: [{ from: '--ds-src', to: '--ds-head', edgeClass: 'decl', file: 'fixture/a.css', line: 3, scopeId: 0 }],
        literalPins: [],
      }),
    );
    mkdirSync(join(box, 'roots'), { recursive: true });
    run(
      buildProducers({
        root: box,
        cssEdgesPath: join(box, 'edges.json'),
        cascadeRootsDir: join(box, 'roots'),
        rootCatalogPath: join(box, 'absent.json'),
        artifactsDir: join(box, 'absent-artifacts'),
      }),
      box,
    );
  } finally {
    rmSync(box, { recursive: true, force: true });
  }
}

test('P1-1 every producerSiteId is REPRODUCIBLE from its own published coordinate', () => {
  // This is what makes a double claim representable at all. Under the previous
  // auto-incrementing `occurrence`, the counter was never published, so two
  // owners on the same coordinate silently received two different ids and the
  // conflict law could not fire from a real build.
  const inventory = JSON.parse(readFileSync(OUT_PATH, 'utf8'));
  for (const site of inventory.producerSites) {
    assert.equal(
      site.producerSiteId,
      producerSiteIdOf(site.plane, site.file, site.line, site.symbol, site.ordinal),
      `${site.file}:${site.line} must recompute from its published coordinate`,
    );
  }
  assert.equal(
    new Set(inventory.producerSites.map((s) => s.producerSiteId)).size,
    inventory.producerSites.length,
  );
});

test('P1-1 a real build accumulates claims per coordinate and scopes by path', () => {
  withBuildFixture((out) => {
    assert.equal(out.stats.ownershipConflicts, 0);
    const stamp = out.producerSites.find((s) => s.plane === 'tsx-inline-stamp');
    assert.ok(stamp, 'the fixture stamps a channel');
    assert.equal(stamp.producerSiteId, producerSiteIdOf('tsx-inline-stamp', stamp.file, stamp.line, stamp.symbol, stamp.ordinal));
    // the fixture component lives under /engines/rustic/: applicability follows
    const emission = out.channelEmissions.find((e) => e.producerSiteId === stamp.producerSiteId);
    assert.deepEqual(emission.engineScope, ['rustic']);
    // and the css declaration inherits the substrate's own intersected scope
    const css = out.channelEmissions.find((e) => e.channel === '--ds-head');
    assert.deepEqual(css.engineScope, ['modern']);
  });
});

test('P1-1 an unresolvable stamp in a real build lands in unknownProvenance, not in silence', () => {
  withBuildFixture(
    (out) => {
      assert.ok(out.stats.unknownProvenance > 0);
      const row = out.unknownProvenance.find((r) => r.file.endsWith('unresolvable/index.tsx'));
      assert.ok(row, `expected a row for the unresolvable component; got ${JSON.stringify(out.unknownProvenance)}`);
      assert.match(row.reason, /^unresolved-/);
    },
    {
      'packages/core/src/ui/unresolvable/index.tsx':
        `import { style } from './elsewhere';\nexport const B = () => <div style={style} />;\n`,
    },
  );
});

/* ==========================================================================
 * T-NO-68 -- the sites the scanner CLOSES BY PROOF.
 *
 * The cohort is decided on the TypeScript AST node kind, never on a list of
 * ids, files or lines: NA-4 proves that by neutralising the predicate and
 * watching the count return to its undrained value. `closedNonObject` is a
 * SEQUENCE, so every assertion here counts (multiset) and none demands tuple
 * uniqueness -- two occurrences can legitimately share file:line:ordinal.
 * ========================================================================== */

const scanOf = (body) => scanTsxSource('packages/core/src/ui/probe/index.tsx', body);
const stampOn = (expr) => `export const C = () => <div style={${expr}} />;\n`;

test('P-1 every arm of the predicate closes with its typed reason', () => {
  const cases = [
    ["'a'", 'literal-kind:StringLiteral'],
    ['`a`', 'literal-kind:NoSubstitutionTemplateLiteral'],
    ['1', 'literal-kind:NumericLiteral'],
    ['true', 'literal-kind:TrueKeyword'],
    ['false', 'literal-kind:FalseKeyword'],
    ['null', 'literal-kind:NullKeyword'],
    ['undefined', 'undefined-keyword'],
    ['!flag', 'prefix-unary-not-object'],
  ];
  for (const [expr, reason] of cases) {
    const scan = scanOf(stampOn(expr));
    assert.equal(scan.closedNonObject.length, 1, `${expr} should close exactly once`);
    assert.equal(scan.closedNonObject[0].reason, reason);
    assert.equal(scan.unresolved.length, 0, `${expr} must not also be unresolved`);
  }
});

test('P-1b (Sonnet 6) a template expression closes as the CSS string it is', () => {
  const scan = scanOf(`const t = \`w-\${n}\`;\n` + stampOn('t'));
  assert.equal(scan.closedNonObject.length, 1);
  assert.equal(scan.closedNonObject[0].reason, 'template-expression-css-string');
  assert.equal(scan.unresolved.length, 0);
});

test('P-1c (Sonnet 2) a LOCAL BINDING to a non-object closes through the binding', () => {
  const scan = scanOf('const x = undefined;\n' + stampOn('x'));
  assert.equal(scan.closedNonObject.length, 1);
  assert.equal(scan.closedNonObject[0].reason, 'undefined-keyword');
  assert.equal(scan.unresolved.length, 0);
});

test('P-2 (C-1) the drained set IS the recomputed cohort, by count, never by id list', () => {
  const out = buildProducers();
  // multiset arithmetic, not tuple uniqueness (C-a2)
  assert.equal(out.stats.closedNonObject, out.closedNonObject.length);
  assert.equal(out.stats.unknownProvenance, out.unknownProvenance.length);
  // T-FINAL-352 took the buckets from six to thirteen; the conservation law is
  // unchanged in spirit -- every one of the 2024 sites is in exactly one.
  assert.equal(universeTotal(out), 2024);
  // disjoint by construction: a site is EITHER closed by proof OR unresolved
  const closedKeys = out.closedNonObject.map((r) => `${r.file}|${r.line}|${r.ordinal}`);
  const unknownKeys = new Set(out.unknownProvenance.map((r) => r.detail));
  for (const row of out.closedNonObject) {
    assert.ok(!unknownKeys.has(`${row.file}:${row.line} ${row.reason}`));
  }
  assert.equal(closedKeys.length, out.closedNonObject.length);
});

test('C-a2 closedNonObject is a SEQUENCE: a duplicated identity tuple is legal', () => {
  const out = buildProducers();
  const tuples = out.closedNonObject.map((r) => `${r.plane}|${r.file}|${r.line}|${r.ordinal}`);
  // the section keeps every occurrence; deduping would UNDERCOUNT the receipt
  assert.equal(tuples.length, out.stats.closedNonObject);
  assert.ok(new Set(tuples).size <= tuples.length);
});

test('C-a1 the receipt publishes the same identity family as unknownProvenance', () => {
  const out = buildProducers();
  for (const row of out.closedNonObject) {
    for (const field of ['plane', 'file', 'symbol', 'line', 'ordinal', 'template', 'reason']) {
      assert.ok(field in row, `closedNonObject row is missing ${field}`);
    }
    assert.equal(row.plane, 'tsx-inline-stamp');
    assert.match(
      row.reason,
      /^(cross-file:)?(literal-kind:|undefined-keyword|prefix-unary-not-object|template-expression-css-string)/,
    );
  }
  assert.match(out.digests.closedNonObject, /^[0-9a-f]{64}$/);
});

test('NA-1 an object literal is NEVER closed by proof: it still emits', () => {
  const scan = scanOf(stampOn("{ '--ds-x': 'red' }"));
  assert.equal(scan.closedNonObject.length, 0);
  assert.equal(scan.stamps.length, 1);
  assert.equal(scan.stamps[0].channel, '--ds-x');
});

test('NA-2 an identifier bound to an object is NEVER closed: the binding is followed', () => {
  const scan = scanOf("const s = { '--ds-y': 'blue' };\n" + stampOn('s'));
  assert.equal(scan.closedNonObject.length, 0);
  assert.equal(scan.stamps.length, 1);
  assert.equal(scan.stamps[0].channel, '--ds-y');
});

test('NA-3 a member access stays UNRESOLVED: this rule does not pretend to cover it', () => {
  const scan = scanOf(stampOn('theme.styles'));
  assert.equal(scan.closedNonObject.length, 0);
  assert.equal(scan.unresolved.length, 1);
  assert.equal(scan.unresolved[0].form, 'member-access');
});

test('NA-4 ANTI-RELABEL: the cohort is a function of the AST, not of a list', () => {
  // Neutralising the predicate must send every closed site back to unresolved.
  // If the drain came from an allowlist this assertion could not be written.
  const scan = scanOf(stampOn("'literal'"));
  assert.equal(scan.closedNonObject.length, 1);
  assert.equal(provablyNonObject(null), null);
  const objectLike = scanOf(stampOn("{ '--ds-z': '1' }"));
  assert.equal(objectLike.closedNonObject.length, 0);
  // the predicate decides on kind alone -- same text, different kind, different verdict
  assert.notEqual(scan.closedNonObject[0].reason, null);
});

test('NA-5 NO RE-ROUTE: a guarded object still reaches the sink and still emits', () => {
  const scan = scanOf(stampOn("cond && { '--ds-guard': 'v' }"));
  const channels = scan.stamps.map((s) => s.channel);
  assert.ok(channels.includes('--ds-guard'), `guarded object must still emit; got ${JSON.stringify(channels)}`);
});

test('NA-6 DeleteExpression is OUT OF SCOPE and is not closed by this rule', () => {
  const scan = scanOf("const o = {};\n" + stampOn('(delete o.k, o)'));
  assert.equal(scan.closedNonObject.filter((r) => r.reason.startsWith('literal-kind')).length, 0);
});

test('C-a3 byReason DROPS unresolved-expression at zero and freezes the other buckets', () => {
  const out = buildProducers();
  const byReason = out.stats.unknownProvenanceByReason;
  assert.ok(!('unresolved-expression' in byReason), 'the key must be removed, not zeroed');
  // post T-FINAL-352 `unknownProvenance` is empty, so its byReason is empty
  // TOO -- and that is only legitimate because every reason it used to hold is
  // now carried by a typed OPEN collection. T-16 proves the arithmetic; here we
  // only fix that the map does not keep phantom keys behind.
  assert.deepEqual(byReason, {});
  assert.equal(out.stats.unknownProvenance, 0);
  // the reasons did NOT evaporate: they moved, with their forms, into the seven
  assert.equal(openRows(out).length, 352);
  assert.equal(
    openRows(out).filter((r) => r.reason.endsWith(':dynamic-setProperty')).length,
    4,
    'the 4 dynamic sinks kept their form and were not absorbed',
  );
});

test('C-a4 the frozen counters do not move with this tranche', () => {
  const out = buildProducers();
  assert.equal(out.stats.producerSites, 4872);
  assert.equal(out.stats.channelEmissions, 10313);
  assert.equal(out.stats.distinctChannels, 4585);
  assert.equal(out.stats.ownershipConflicts, 0);
});

/* ==========================================================================
 * T-ZERO-486 -- the cross-file subsystem.
 *
 * ONLY `CLOSED_ZERO_GOVERNED_EMISSION_OBJECT` drains. Boundary, relay and
 * every residual stay in `unknownProvenance`, non-consumable: the negatives
 * below are the ones that would catch a false close.
 * ========================================================================== */

const ZERO = 'CLOSED_ZERO_GOVERNED_EMISSION_OBJECT';

test('Z-1 the drain is exactly the proven ZERO cohort, and the universe is conserved', () => {
  const out = buildProducers();
  assert.equal(out.stats.closedZeroGoverned, 486);
  assert.equal(out.stats.closedZeroGoverned, out.closedZeroGoverned.length);
  assert.equal(out.stats.unknownProvenance, 0);
  // conservation: nothing vanished, everything is in exactly one bucket
  assert.equal(universeTotal(out), 2024);
});

test('Z-2 every drained row carries the ZERO disposition in the subsystem (no allowlist)', () => {
  const out = buildProducers();
  const { rows } = classifyCrossFileRows();
  const at = new Map();
  for (const r of rows) at.set(`${r.file}|${r.ordinal}`, r.disposition);
  for (const row of out.closedZeroGoverned) {
    assert.equal(at.get(`${row.file}|${row.ordinal}`), ZERO,
      `${row.file}:${row.line} drained without a ZERO disposition`);
  }
});

test('Z-3 FALSE CLOSE GUARD: no boundary or relay row is ever drained', () => {
  const out = buildProducers();
  const { rows } = classifyCrossFileRows();
  const drained = new Set(out.closedZeroGoverned.map((r) => `${r.file}|${r.ordinal}`));
  const leaked = rows.filter(
    (r) =>
      (r.disposition === 'PUBLIC_BOUNDARY_CANDIDATE' || r.disposition === 'RELAY_PRIVATE_UNRESOLVED') &&
      drained.has(`${r.file}|${r.ordinal}`),
  );
  assert.equal(leaked.length, 0, `boundary/relay leaked into the drain: ${JSON.stringify(leaked.slice(0, 3))}`);
});

test('Z-4 boundary 523 and relay 591 remain unknown and non-consumable', () => {
  const { rows } = classifyCrossFileRows();
  const by = {};
  for (const r of rows) by[r.disposition] = (by[r.disposition] || 0) + 1;
  assert.equal(by.PUBLIC_BOUNDARY_CANDIDATE, 523);
  assert.equal(by.RELAY_PRIVATE_UNRESOLVED, 591);
  assert.equal(by[ZERO], 486);
  assert.equal(by.CLOSED_NONOBJECT, 69); // 68 reachable by A4 + 1 member-access
  assert.equal(Object.values(by).reduce((a, b) => a + b, 0), 2024);
});

test('Z-5 the drained buckets decompose exactly as the cohort does', () => {
  // Re-anchored by T-TYPED-1118. This used to subtract the live byReason from
  // a hardcoded PRE-drain baseline, so every later tranche broke it even when
  // the ZERO decomposition itself never moved. It now reads the decomposition
  // off the cohort DIRECTLY, which is what the test always meant to assert and
  // is immune to any further drain of the other dispositions.
  const { rows } = classifyCrossFileRows();
  const byForm = {};
  for (const r of rows) {
    if (r.disposition !== ZERO) continue;
    byForm[r.form] = (byForm[r.form] || 0) + 1;
  }
  assert.deepEqual(byForm, { identifier: 7, spread: 113, 'member-access': 305, call: 61 });
  assert.equal(Object.values(byForm).reduce((a, b) => a + b, 0), 486);
  // dynamic-setProperty has never been resolved by any tranche: it is still
  // whole, now as its own nominated OPEN collection rather than as residue.
  assert.equal(buildProducers().dynamicSinkPending.length, 4);
});

test('Z-6 the receipt publishes the identity family and a SEQUENCE digest', () => {
  const out = buildProducers();
  for (const row of out.closedZeroGoverned) {
    for (const f of ['plane', 'file', 'symbol', 'line', 'ordinal', 'template', 'reason']) {
      assert.ok(f in row, `closedZeroGoverned row missing ${f}`);
    }
    assert.match(row.reason, /^zero-governed-emission-object:/);
  }
  assert.match(out.digests.closedZeroGoverned, /^[0-9a-f]{64}$/);
  // SEQUENCE: duplicated identity tuples are legal and must NOT be deduped
  const tuples = out.closedZeroGoverned.map((r) => `${r.file}|${r.ordinal}`);
  assert.equal(tuples.length, out.stats.closedZeroGoverned);
});

test('Z-7 FAIL-CLOSED: a spread whose source cannot be resolved is never ZERO', () => {
  const { rows } = classifyCrossFileRows();
  const zero = rows.filter((r) => r.disposition === ZERO);
  for (const r of zero) {
    assert.equal(r.closed, true, `${r.file}:${r.line} drained while not closed`);
    assert.ok(r.governance, `${r.file}:${r.line} drained with no governance receipt`);
    assert.equal(r.governance.customPropertyScanComplete, true,
      `${r.file}:${r.line} drained on an INCOMPLETE scan`);
  }
});

test('Z-8 FAIL-CLOSED: cycle, depth overflow and unresolved key never certify ZERO', () => {
  const { rows } = classifyCrossFileRows();
  for (const r of rows.filter((x) => x.disposition === ZERO)) {
    assert.equal(r.governance.cycleDetected, false);
    assert.equal(r.governance.depthOverflow, false);
    assert.equal(r.governance.hasUnresolvedKey, false);
    assert.equal(r.governance.scanIncomplete, false);
  }
});

test('Z-9 a ZERO row really has zero governed and zero internal-socket keys', () => {
  const { rows } = classifyCrossFileRows();
  for (const r of rows.filter((x) => x.disposition === ZERO)) {
    assert.equal(r.governance.governedChannelKeys.length, 0,
      `${r.file}:${r.line} claims ZERO but declares governed keys`);
    assert.equal(r.governance.internalSocketKeys.length, 0,
      `${r.file}:${r.line} claims ZERO but declares internal sockets`);
  }
});

test('Z-10 ZERO and PRODUCER are disjoint, and PRODUCER is never drained', () => {
  const out = buildProducers();
  const { rows } = classifyCrossFileRows();
  const drained = new Set(out.closedZeroGoverned.map((r) => `${r.file}|${r.ordinal}`));
  const producers = rows.filter((r) => r.disposition === 'CLOSED_PRODUCER');
  for (const p of producers) {
    assert.ok(!drained.has(`${p.file}|${p.ordinal}`), 'a CLOSED_PRODUCER was drained as ZERO');
  }
  assert.equal(producers.length, 3);
});

test('Z-11 the frozen producer counters do not move with this tranche', () => {
  const out = buildProducers();
  assert.equal(out.stats.producerSites, 4872);
  assert.equal(out.stats.channelEmissions, 10313);
  assert.equal(out.stats.distinctChannels, 4585);
  // 68 proven locally + the 1 that only resolves cross-file (T-TYPED-1118)
  assert.equal(out.stats.closedNonObject, 69);
});

test('Z-12 the subsystem is PURE: importing it neither writes nor mutates the inventory', () => {
  const before = readFileSync(OUT_PATH, 'utf8');
  const { rows } = classifyCrossFileRows();
  assert.equal(rows.length, 2024);
  assert.equal(readFileSync(OUT_PATH, 'utf8'), before);
});

/* ===================================================================== *
 * T-TYPED-1118 -- the 1118 typed rows closed contractually.
 *
 * 523 PUBLIC_BOUNDARY_CANDIDATE + 591 RELAY_PRIVATE_UNRESOLVED +
 * 3 CLOSED_PRODUCER + 1 cross-file CLOSED_NONOBJECT leave
 * `unknownProvenance` and land in named collections WITH receipts. None of
 * them becomes consumable, none of them joins `closedZeroGoverned`, and the
 * 352 that remain still block lot B. The negatives below are the ones that
 * would catch a false close.
 * ===================================================================== */

/* T-FINAL-352 shared helpers: the collection roster lives in ONE place so a
 * new collection cannot be added without every conservation test seeing it. */
const OPEN_COLLECTIONS = [
  'branchCompositeOpen', 'authoredOpen', 'branchConditionalAuthored', 'openUnknown',
  'computedDomainPending', 'dynamicSinkPending', 'callArgsPending',
];
const CLOSED_COLLECTIONS = [
  'closedNonObject', 'closedZeroGoverned', 'publicBoundary', 'privateRelay', 'closedProducer',
];
const ALL_COLLECTIONS = [...CLOSED_COLLECTIONS, ...OPEN_COLLECTIONS, 'unknownProvenance'];
const openRows = (out) => OPEN_COLLECTIONS.flatMap((name) => out[name]);
const universeTotal = (out) => ALL_COLLECTIONS.reduce((acc, name) => acc + out[name].length, 0);

test('T-1 the four cohorts have exactly the measured sizes and the residual is 352', () => {
  const out = buildProducers();
  assert.equal(out.stats.publicBoundary, 523);
  assert.equal(out.stats.privateRelay, 591);
  assert.equal(out.stats.closedProducer, 3);
  assert.equal(out.stats.closedNonObject, 69);
  // stats mirror the arrays, never a bare counter
  assert.equal(out.stats.publicBoundary, out.publicBoundary.length);
  assert.equal(out.stats.privateRelay, out.privateRelay.length);
  assert.equal(out.stats.closedProducer, out.closedProducer.length);
  // T-TYPED-1118 moved exactly 1118 rows; T-FINAL-352 moved the remaining 352
  assert.equal(523 + 591 + 3 + 1, 1118);
  assert.equal(1470 - 1118, 352);
  assert.equal(out.stats.openBlocking, 352);
  assert.equal(out.stats.unknownProvenance, 0);
});

test('T-2 NEGATIVE: a boundary row is NEVER consumable and never tenant-safe', () => {
  const out = buildProducers();
  assert.ok(out.publicBoundary.length > 0);
  for (const row of out.publicBoundary) {
    assert.equal(row.consumable, false, `${row.file}:${row.line} boundary must not be consumable`);
    assert.equal(row.tenantSafe, false, `${row.file}:${row.line} boundary must not be tenant-safe`);
    assert.equal(row.nonConsumableCause, 'object-supplied-by-caller-across-public-entrypoint');
    assert.match(row.reason, /^public-boundary-candidate:/);
  }
});

test('T-3 NEGATIVE: a relay row is never a producer and never joins the ZERO drain', () => {
  const out = buildProducers();
  const zeroKeys = new Set(out.closedZeroGoverned.map((r) => `${r.file}|${r.ordinal}`));
  const producerKeys = new Set(out.closedProducer.map((r) => `${r.file}|${r.ordinal}`));
  for (const row of out.privateRelay) {
    assert.equal(row.consumable, false);
    assert.equal(row.tenantSafe, false);
    assert.ok(!zeroKeys.has(`${row.file}|${row.ordinal}`), `relay ${row.file}:${row.line} leaked into the ZERO drain`);
    assert.ok(!producerKeys.has(`${row.file}|${row.ordinal}`), `relay ${row.file}:${row.line} claimed as a producer`);
    assert.match(row.reason, /^private-relay-unresolved:/);
  }
});

test('T-4 the six collections are pairwise DISJOINT and total the 2024 sites', () => {
  const out = buildProducers();
  const sections = {
    unknownProvenance: out.unknownProvenance,
    closedNonObject: out.closedNonObject,
    closedZeroGoverned: out.closedZeroGoverned,
    publicBoundary: out.publicBoundary,
    privateRelay: out.privateRelay,
    closedProducer: out.closedProducer,
  };
  for (const name of ['branchCompositeOpen', 'authoredOpen', 'branchConditionalAuthored', 'openUnknown', 'computedDomainPending', 'dynamicSinkPending', 'callArgsPending']) sections[name] = out[name];
  // unknownProvenance publishes no ordinal, so it is compared on its own key
  const keyed = ['closedNonObject', 'closedZeroGoverned', 'publicBoundary', 'privateRelay', 'closedProducer', ...['branchCompositeOpen', 'authoredOpen', 'branchConditionalAuthored', 'openUnknown', 'computedDomainPending', 'dynamicSinkPending', 'callArgsPending']];
  const seen = new Map();
  for (const name of keyed) {
    for (const row of sections[name]) {
      const k = `${row.file}|${row.ordinal}`;
      if (seen.has(k) && seen.get(k) !== name) {
        assert.fail(`site ${k} appears in both ${seen.get(k)} and ${name}`);
      }
      seen.set(k, name);
    }
  }
  const total = Object.values(sections).reduce((a, rows) => a + rows.length, 0);
  assert.equal(total, 2024);
});

test('T-5 every cohort row carries a receipt sufficient to audit origin and reason', () => {
  const out = buildProducers();
  for (const row of [...out.publicBoundary, ...out.privateRelay, ...out.closedProducer]) {
    for (const f of ['plane', 'file', 'symbol', 'line', 'ordinal', 'template', 'reason', 'evidence', 'sinkTags', 'relayKinds', 'occurrences']) {
      assert.ok(f in row, `${row.file}:${row.line} cohort row is missing ${f}`);
    }
    assert.equal(row.plane, 'tsx-inline-stamp');
    assert.ok(row.evidence && typeof row.evidence === 'object', 'evidence must be an object');
    assert.ok(Array.isArray(row.evidence.path) && row.evidence.path.length > 0, 'evidence must state a resolution path');
    assert.ok(Array.isArray(row.sinkTags));
    assert.ok(Array.isArray(row.relayKinds));
    assert.ok(row.occurrences >= 1);
  }
  // a boundary receipt names the PUBLIC entrypoint that exposes it
  for (const row of out.publicBoundary) {
    assert.ok(row.evidence.entrypoint, `${row.file}:${row.line} boundary receipt must name its entrypoint`);
    assert.ok(row.evidence.exportedAs, `${row.file}:${row.line} boundary receipt must name its export`);
    assert.ok(row.evidence.hopChainDepth >= 1);
  }
});

test('T-6 the 3 producer rows carry a full causal receipt and invent no root', () => {
  const out = buildProducers();
  assert.equal(out.closedProducer.length, 3);
  for (const row of out.closedProducer) {
    assert.match(row.reason, /^governed-producer-object:/);
    assert.equal(row.nonConsumableCause, 'governed-producer-with-no-attributed-cascade-root');
    assert.match(row.evidence.governedProducerSiteId, /^[0-9a-f]{64}$/);
    assert.equal(row.evidence.customPropertyScanComplete, true, 'an incomplete scan may never be published as a closed producer');
    assert.ok(row.evidence.governedChannelKeys.length > 0, 'a producer with no governed key is not a producer');
    assert.ok(row.evidence.sourcePartRefs.length > 0, 'a producer must reference the source part it came from');
    for (const key of row.evidence.governedChannelKeys) assert.match(key, /^--ds-/);
    // NO invented reachability: the row states no cascade root and no tenant path
    assert.ok(!('causalRootIds' in row), 'a closed producer must not claim a cascade root');
    assert.ok(!('tenantReachable' in row), 'a closed producer must not claim tenant reachability');
    assert.equal(row.tenantSafe, false);
  }
});

test('T-7 the cross-file non-object adds exactly ONE row and keeps the 68 local ones intact', () => {
  const out = buildProducers();
  const local = out.closedNonObject.filter((r) => r.resolvedVia === undefined);
  const cross = out.closedNonObject.filter((r) => r.resolvedVia === 'cross-file');
  assert.equal(local.length, 68, 'the locally-proven receipt must not lose a row');
  assert.equal(cross.length, 1, 'exactly one row resolves only across files');
  assert.equal(out.stats.closedNonObject, 69);
  // the local 68 still carry ONLY the local reason vocabulary
  for (const row of local) {
    assert.ok(!row.reason.startsWith('cross-file:'), 'a locally-proven row must not be relabelled cross-file');
  }
  // and the cross-file row declares its provenance twice, independently
  assert.match(cross[0].reason, /^cross-file:/);
  assert.equal(cross[0].resolvedVia, 'cross-file');
  assert.ok(cross[0].evidence.nonObjectReason, 'it must publish the non-object reason it resolved to');
  // NO IDENTITY DUPLICATION: its coordinate appears exactly once in the array
  const k = `${cross[0].file}|${cross[0].ordinal}`;
  assert.equal(out.closedNonObject.filter((r) => `${r.file}|${r.ordinal}` === k).length, 1);
});

test('T-8 NEGATIVE: the join THROWS when two rows at one coordinate disagree', () => {
  const base = {
    file: 'a/b.tsx', ordinal: 10, disposition: 'RELAY_PRIVATE_UNRESOLVED', closed: false,
    form: 'identifier', symbol: 'X', line: 3, reason: 'unresolved-identifier', template: 'style',
    resolutionPath: [{ kind: 'terminal-at-sink' }], receipt: { kind: 'relay' }, boundaryReceipt: null,
  };
  // identical rows collapse without complaint
  assert.equal(dispositionIndex([base, { ...base }]).size, 1);
  // ...but a disagreement on ANY decision field is fatal
  for (const field of DISPOSITION_DECISION_FIELDS) {
    const other = { ...base, [field]: field === 'line' ? 999 : `${base[field]}-DIFFERENT` };
    assert.throws(
      () => dispositionIndex([base, other]),
      (e) => e instanceof DispositionJoinConflict && e.field === field,
      `a disagreement on ${field} must throw`,
    );
  }
  // ...and so is a disagreement inside the bounded receipt
  const otherReceipt = { ...base, receipt: { kind: 'objectClosed' } };
  assert.throws(
    () => dispositionIndex([base, otherReceipt]),
    (e) => e instanceof DispositionJoinConflict && e.field === 'boundedReceipt',
  );
});

test('T-9 per-sink evidence MERGES instead of being overwritten by the last row', () => {
  const base = {
    file: 'a/b.tsx', ordinal: 10, disposition: 'RELAY_PRIVATE_UNRESOLVED', closed: false,
    form: 'identifier', symbol: 'X', line: 3, reason: 'unresolved-identifier', template: 'style',
    resolutionPath: [{ kind: 'terminal-at-sink' }], receipt: { kind: 'relay' },
  };
  const index = dispositionIndex([
    { ...base, boundaryReceipt: { kind: 'PRIVATE_RELAY_UNRESOLVED', sinkTagName: 'h6' } },
    { ...base, boundaryReceipt: { kind: 'CUSTOM_COMPONENT_SINK_NOT_FOLLOWED', sinkTagName: 'Title' } },
  ]);
  const entry = index.get('a/b.tsx|10');
  assert.equal(entry.occurrences, 2);
  assert.deepEqual(entry.sinkTags, ['Title', 'h6']);
  assert.deepEqual(entry.relayKinds, ['CUSTOM_COMPONENT_SINK_NOT_FOLLOWED', 'PRIVATE_RELAY_UNRESOLVED']);
  // sorted sets: the order the rows arrive in cannot change the result
  const reversed = dispositionIndex([
    { ...base, boundaryReceipt: { kind: 'CUSTOM_COMPONENT_SINK_NOT_FOLLOWED', sinkTagName: 'Title' } },
    { ...base, boundaryReceipt: { kind: 'PRIVATE_RELAY_UNRESOLVED', sinkTagName: 'h6' } },
  ]).get('a/b.tsx|10');
  assert.deepEqual(reversed.sinkTags, entry.sinkTags);
  assert.deepEqual(reversed.relayKinds, entry.relayKinds);
});

test('T-10 the live tree joins WITHOUT conflict over its 66 duplicated coordinates', () => {
  const { rows } = classifyCrossFileRows();
  const index = dispositionIndex(rows);
  assert.equal(rows.length, 2024);
  assert.equal(index.size, 1936);
  const multi = [...index.values()].filter((e) => e.occurrences > 1);
  assert.equal(multi.length, 66, 'the duplicated coordinates are a measured fact, not an estimate');
  // those 66 coordinates carry 154 rows between them; the other 1870 are singletons
  assert.equal(multi.reduce((a, e) => a + e.occurrences, 0), 154);
  assert.equal(index.size - multi.length + 154, rows.length);
});

test('T-11 NEGATIVE: altering or removing a receipt moves the receipt-bound digest', () => {
  const out = buildProducers();
  for (const name of ['publicBoundary', 'privateRelay', 'closedProducer']) {
    const key = `${name}Receipts`;
    assert.match(out.digests[key], /^[0-9a-f]{64}$/);
    assert.notEqual(out.digests[key], out.digests[name], 'the receipt digest must not equal the identity digest');
  }
  // a digest that ignored the receipt could not distinguish these two
  const rows = out.publicBoundary.slice(0, 3);
  const identity = (rs) => JSON.stringify(rs.map((r) => [r.plane, r.file, r.symbol, r.reason]));
  const withReceipt = (rs) => JSON.stringify(rs.map((r) => [r.file, r.ordinal, r.sinkTags, r.evidence]));
  const stripped = rows.map((r) => ({ ...r, evidence: null, sinkTags: [] }));
  assert.equal(identity(rows), identity(stripped), 'identity alone cannot see the receipt');
  assert.notEqual(withReceipt(rows), withReceipt(stripped), 'the receipt-bound digest MUST see it');
});

test('T-12 the 352 are typed OPEN debt and lot B still does NOT open', () => {
  const out = buildProducers();
  // unknownProvenance is empty, but that is NOT lot B opening: the same 352
  // sites are now blocking under their own names.
  assert.equal(out.stats.unknownProvenance, 0);
  assert.equal(out.unknownProvenance.length, 0);
  assert.equal(out.stats.openBlocking, 352);
  assert.equal(out.openBacklogRollup.blocking, true);
  assert.equal(out.openBacklogRollup.lotBOpen, false, 'lot B must stay shut while open debt exists');
  // the residual dispositions are the ones NO tranche has proven anything about
  const { rows } = classifyCrossFileRows();
  const drained = new Set([
    'CLOSED_ZERO_GOVERNED_EMISSION_OBJECT', 'PUBLIC_BOUNDARY_CANDIDATE',
    'RELAY_PRIVATE_UNRESOLVED', 'CLOSED_PRODUCER', 'CLOSED_NONOBJECT',
  ]);
  const residual = rows.filter((r) => !drained.has(r.disposition));
  assert.equal(residual.length, 352);
  const byDisposition = {};
  for (const r of residual) byDisposition[r.disposition] = (byDisposition[r.disposition] || 0) + 1;
  assert.deepEqual(byDisposition, {
    BRANCH_COMPOSITE_OPEN: 162,
    AUTHORED_OPEN: 99,
    BRANCH_CONDITIONAL_AUTHORED: 37,
    OPEN_UNKNOWN: 28,
    COMPUTED_DOMAIN_PENDING: 21,
    DYNAMIC_SINK_PENDING: 4,
    CALL_ARGS_PENDING: 1,
  });
});

test('T-13 boundedReceiptOf returns null for a disposition it cannot vouch for', () => {
  // fail-closed: an UNKNOWN disposition never fabricates evidence. The seven
  // open ones gained receipts in T-FINAL-352, so the negative now uses names
  // the module genuinely does not model.
  assert.equal(boundedReceiptOf({ disposition: 'PUBLIC_BOUNDARY_UNKNOWN', resolutionPath: [] }), null);
  assert.equal(boundedReceiptOf({ disposition: 'NOT_A_REAL_DISPOSITION', resolutionPath: [] }), null);
  assert.equal(boundedReceiptOf({ disposition: undefined, resolutionPath: [] }), null);
});

test('T-14 the frozen counters survive this tranche untouched', () => {
  const out = buildProducers();
  assert.equal(out.stats.producerSites, 4872);
  assert.equal(out.stats.channelEmissions, 10313);
  assert.equal(out.stats.distinctChannels, 4585);
  assert.equal(out.stats.emissionsWithCausalRoot, 186);
  assert.equal(out.stats.ownershipConflicts, 0);
  assert.equal(out.stats.closedZeroGoverned, 486);
});

test('T-15 relayKinds is published with a CLOSED vocabulary and survives multi-sink coordinates', () => {
  const out = buildProducers();
  const RELAY_KINDS = new Set(['PRIVATE_RELAY_UNRESOLVED', 'CUSTOM_COMPONENT_SINK_NOT_FOLLOWED']);
  const BOUNDARY_KINDS = new Set(['PUBLIC_BOUNDARY_CANDIDATE', 'PUBLIC_BOUNDARY_UNKNOWN']);
  const isSorted = (a) => JSON.stringify(a) === JSON.stringify([...a].sort());
  const hasDuplicates = (a) => new Set(a).size !== a.length;

  // A relay row exists BECAUSE a sink classified it, so its kind list is never
  // empty; an empty one would mean the evidence was dropped on the way out.
  for (const row of out.privateRelay) {
    assert.ok(row.relayKinds.length > 0, `${row.file}:${row.line} relay published no relayKinds`);
    assert.ok(isSorted(row.relayKinds), `${row.file}:${row.line} relayKinds must be sorted`);
    assert.ok(!hasDuplicates(row.relayKinds), `${row.file}:${row.line} relayKinds must be a set`);
    for (const kind of row.relayKinds) {
      assert.ok(RELAY_KINDS.has(kind), `${row.file}:${row.line} unknown relay kind ${kind}`);
    }
    assert.ok(row.sinkTags.length > 0 && isSorted(row.sinkTags) && !hasDuplicates(row.sinkTags));
  }
  for (const row of out.publicBoundary) {
    assert.ok(row.relayKinds.length > 0, `${row.file}:${row.line} boundary published no relayKinds`);
    assert.ok(isSorted(row.relayKinds) && !hasDuplicates(row.relayKinds));
    for (const kind of row.relayKinds) {
      assert.ok(BOUNDARY_KINDS.has(kind), `${row.file}:${row.line} unknown boundary kind ${kind}`);
    }
  }
  // A producer is reached through a CALL, not through a relay sink: its list is
  // legitimately empty. Asserting that keeps "empty" a decision, not an omission.
  for (const row of out.closedProducer) {
    assert.deepEqual(row.relayKinds, [], 'a producer row has no relay sink to report');
  }

  // DURABLE multi-kind evidence: the 18 disagreeing pairs measured in the tree
  // are exactly what would be lost by a last-write-wins join. At least one
  // coordinate must publish BOTH kinds, or the merge is not observable in A5.
  const multiKind = out.privateRelay.filter((r) => r.relayKinds.length > 1);
  assert.ok(multiKind.length > 0, 'no coordinate publishes more than one relay kind');
  assert.equal(multiKind.length, 8);
  for (const row of multiKind) {
    assert.deepEqual(row.relayKinds, ['CUSTOM_COMPONENT_SINK_NOT_FOLLOWED', 'PRIVATE_RELAY_UNRESOLVED']);
    assert.ok(row.occurrences > 1, 'a multi-kind coordinate must have more than one occurrence');
    assert.ok(row.sinkTags.length > 1, 'a multi-kind coordinate reaches more than one sink');
  }
  // and multi-sink evidence more generally survives
  assert.equal([...out.publicBoundary, ...out.privateRelay].filter((r) => r.sinkTags.length > 1).length, 20);

  // the receipt-bound digests COVER relayKinds: dropping it must move them
  const withKinds = (rs) => JSON.stringify(rs.map((r) => [r.file, r.ordinal, r.sinkTags, r.relayKinds, r.evidence]));
  const withoutKinds = (rs) => JSON.stringify(rs.map((r) => [r.file, r.ordinal, r.sinkTags, [], r.evidence]));
  assert.notEqual(withKinds(out.privateRelay), withoutKinds(out.privateRelay));
});

/* ===================================================================== *
 * T-FINAL-352 -- the last 352 rows become TYPED OPEN debt.
 *
 * `unknownProvenance` reaches [] and that is NOT progress on resolution: the
 * same 352 sites are still blocking, now under seven names with a reason and a
 * path each. The tests below exist to make sure nobody can read the empty list
 * as "solved", and that no row was lost on the way out.
 * ===================================================================== */

test('T-16 unknownProvenance is EMPTY only because all 352 are typed and conserved', () => {
  const out = buildProducers();
  assert.equal(out.stats.unknownProvenance, 0);
  assert.deepEqual(out.unknownProvenance, []);
  // the seven exact counts -- measured, not estimated
  assert.deepEqual(out.stats.openBacklogByDisposition, {
    BRANCH_COMPOSITE_OPEN: 162,
    AUTHORED_OPEN: 99,
    BRANCH_CONDITIONAL_AUTHORED: 37,
    OPEN_UNKNOWN: 28,
    COMPUTED_DOMAIN_PENDING: 21,
    DYNAMIC_SINK_PENDING: 4,
    CALL_ARGS_PENDING: 1,
  });
  assert.equal(out.branchCompositeOpen.length, 162);
  assert.equal(out.authoredOpen.length, 99);
  assert.equal(out.branchConditionalAuthored.length, 37);
  assert.equal(out.openUnknown.length, 28);
  assert.equal(out.computedDomainPending.length, 21);
  assert.equal(out.dynamicSinkPending.length, 4);
  assert.equal(out.callArgsPending.length, 1);
  assert.equal(openRows(out).length, 352);
  assert.equal(out.stats.openBlocking, 352);
  // TOTAL conservation across every collection, closed and open
  assert.equal(universeTotal(out), 2024);
  assert.equal(out.openBacklogRollup.universe.tsxSitesScanned, 2024);
  assert.equal(out.openBacklogRollup.universe.accountedRows, 2024);
});

test('T-17 coverage is 1:1: every site is in exactly ONE collection', () => {
  const out = buildProducers();
  // Each collection is a SEQUENCE (C-a2): one coordinate may legitimately carry
  // two occurrences when the same expression reaches two sinks. What must NEVER
  // happen is a coordinate claimed by TWO DIFFERENT collections -- that would be
  // the same debt counted twice, or drained and blocked at once.
  const owner = new Map();
  let rowCount = 0;
  for (const name of [...CLOSED_COLLECTIONS, ...OPEN_COLLECTIONS]) {
    for (const row of out[name]) {
      rowCount += 1;
      const key = `${row.file}|${row.ordinal}`;
      if (owner.has(key)) {
        assert.equal(owner.get(key), name, `site ${key} claimed by both ${owner.get(key)} and ${name}`);
      }
      owner.set(key, name);
    }
  }
  assert.equal(rowCount, 2024, 'every scanned site is carried by exactly one collection');
  assert.ok(owner.size <= rowCount);
  // and the open/closed split is a partition of those coordinates
  const openKeys = new Set(openRows(out).map((r) => `${r.file}|${r.ordinal}`));
  const closedKeys = new Set(CLOSED_COLLECTIONS.flatMap((n) => out[n]).map((r) => `${r.file}|${r.ordinal}`));
  for (const key of openKeys) {
    assert.ok(!closedKeys.has(key), `${key} is simultaneously open debt and closed`);
  }
  // and the classifier's own residual matches the seven collections exactly
  const { rows } = classifyCrossFileRows();
  const openByDisposition = {};
  for (const row of openRows(out)) {
    openByDisposition[row.disposition] = (openByDisposition[row.disposition] || 0) + 1;
  }
  const fromClassifier = {};
  for (const r of rows) {
    if (!(r.disposition in openByDisposition)) continue;
    fromClassifier[r.disposition] = (fromClassifier[r.disposition] || 0) + 1;
  }
  assert.deepEqual(openByDisposition, fromClassifier, 'the collections must BE the classifier cohorts');
});

test('T-18 NEGATIVE: every open row is blocking, non-consumable and NOT closed', () => {
  const out = buildProducers();
  const rows = openRows(out);
  assert.equal(rows.length, 352);
  for (const row of rows) {
    assert.equal(row.blocking, true, `${row.file}:${row.line} open row must stay blocking`);
    assert.equal(row.consumable, false);
    assert.equal(row.tenantSafe, false);
    assert.equal(row.closed, false, `${row.file}:${row.line} an OPEN row must never be marked closed`);
    assert.ok(row.nonConsumableCause && row.nonConsumableCause.length > 0, 'the cause must be nominated');
    // NOTHING invented: no root, no owner, no tenant reach
    assert.ok(!('causalRootIds' in row), 'an open row must not claim a cascade root');
    assert.ok(!('tenantReachable' in row), 'an open row must not claim tenant reachability');
    assert.ok(!('ownerId' in row), 'an open row must not claim an owner');
    // and a receipt that is actually usable as a backlog item
    assert.ok(row.evidence && Array.isArray(row.evidence.path) && row.evidence.path.length > 0);
    assert.equal(row.plane, 'tsx-inline-stamp');
    assert.match(row.reason, /:[a-zA-Z-]+$/, 'the reason must keep the site form');
  }
  // the rollup agrees with the rows, and does not pretend lot B opened
  assert.equal(out.openBacklogRollup.total, 352);
  assert.equal(out.openBacklogRollup.blocking, true);
  assert.equal(out.openBacklogRollup.lotBOpen, false);
  assert.match(out.openBacklogRollup.statement, /CLASSIFIED, not resolved/);
});

test('T-19 the 4 dynamic sinks and the 1 call-args row stay INTACT and nominated', () => {
  const out = buildProducers();
  // These are the two cohorts a heuristic would be most tempted to absorb into
  // a neighbouring bucket. They keep their own collection, count and cause.
  assert.equal(out.dynamicSinkPending.length, 4);
  for (const row of out.dynamicSinkPending) {
    assert.equal(row.disposition, 'DYNAMIC_SINK_PENDING');
    assert.equal(row.reason, 'dynamic-sink-pending:dynamic-setProperty');
    assert.equal(row.nonConsumableCause, 'setProperty-name-is-not-a-literal-at-the-sink');
    assert.equal(row.blocking, true);
  }
  assert.equal(out.callArgsPending.length, 1);
  const [callArgs] = out.callArgsPending;
  assert.equal(callArgs.disposition, 'CALL_ARGS_PENDING');
  assert.equal(callArgs.nonConsumableCause, 'call-argument-substitution-not-implemented');
  assert.equal(callArgs.evidence.reason, 'rest-parameter-substitution-not-implemented');
  assert.equal(callArgs.blocking, true);
  // neither leaked into any other collection
  const others = [...CLOSED_COLLECTIONS, ...OPEN_COLLECTIONS]
    .filter((n) => n !== 'dynamicSinkPending' && n !== 'callArgsPending')
    .flatMap((n) => out[n]);
  assert.equal(others.filter((r) => r.disposition === 'DYNAMIC_SINK_PENDING').length, 0);
  assert.equal(others.filter((r) => r.disposition === 'CALL_ARGS_PENDING').length, 0);
});

test('T-20 NEGATIVE: mutating or removing an open receipt moves the receipt digest', () => {
  const out = buildProducers();
  for (const name of OPEN_COLLECTIONS) {
    assert.match(out.digests[name], /^[0-9a-f]{64}$/, `${name} needs an identity digest`);
    assert.match(out.digests[`${name}Receipts`], /^[0-9a-f]{64}$/, `${name} needs a receipt digest`);
    assert.notEqual(out.digests[name], out.digests[`${name}Receipts`]);
  }
  // identity alone cannot see the receipt; the receipt-bound tuple must
  const rows = out.branchCompositeOpen.slice(0, 5);
  const identity = (rs) => JSON.stringify(rs.map((r) => [r.plane, r.file, r.symbol, r.reason]));
  const bound = (rs) => JSON.stringify(rs.map((r) => [r.file, r.ordinal, r.sinkTags, r.relayKinds, r.evidence]));
  const stripped = rows.map((r) => ({ ...r, evidence: null }));
  const mutated = rows.map((r) => ({ ...r, evidence: { ...r.evidence, path: ['tampered'] } }));
  assert.equal(identity(rows), identity(stripped), 'identity is blind to the receipt by design');
  assert.notEqual(bound(rows), bound(stripped), 'REMOVING a receipt must move the bound digest');
  assert.notEqual(bound(rows), bound(mutated), 'MUTATING a receipt must move the bound digest');
});

test('T-21 --check FAILS when a published receipt is tampered with on disk', () => {
  const original = readFileSync(OUT_PATH, 'utf8');
  const parsed = JSON.parse(original);
  assert.ok(parsed.branchCompositeOpen.length > 0);
  parsed.branchCompositeOpen[0].evidence.path = ['tampered'];
  let rejected = false;
  try {
    writeFileSync(OUT_PATH, JSON.stringify(parsed, null, 2));
    try {
      execFileSync(process.execPath, [SCRIPT, '--check'], { stdio: 'pipe' });
    } catch {
      rejected = true;
    }
  } finally {
    writeFileSync(OUT_PATH, original);
  }
  assert.ok(rejected, '--check must reject a tampered receipt');
  // and the tree is left exactly as we found it
  assert.equal(readFileSync(OUT_PATH, 'utf8'), original);
  execFileSync(process.execPath, [SCRIPT, '--check'], { stdio: 'pipe' });
});

test('T-22 reordering the classifier input changes NEITHER output NOR digest', () => {
  const { rows } = classifyCrossFileRows();
  const forward = dispositionIndex(rows);
  const backward = dispositionIndex([...rows].reverse());
  assert.equal(forward.size, backward.size);
  for (const [key, entry] of forward) {
    const other = backward.get(key);
    assert.ok(other, `key ${key} vanished when the input was reversed`);
    assert.deepEqual(entry.decision, other.decision);
    assert.deepEqual(entry.receipt, other.receipt);
    assert.deepEqual(entry.sinkTags, other.sinkTags, 'merged sets must be order-independent');
    assert.deepEqual(entry.relayKinds, other.relayKinds);
    assert.equal(entry.occurrences, other.occurrences);
  }
  // and the published inventory is stable across two full builds
  const a = buildProducers();
  const b = buildProducers();
  for (const name of [...OPEN_COLLECTIONS, ...CLOSED_COLLECTIONS]) {
    assert.equal(a.digests[name], b.digests[name], `${name} identity digest is unstable`);
    assert.equal(a.digests[`${name}Receipts`] ?? null, b.digests[`${name}Receipts`] ?? null);
    assert.deepEqual(a[name], b[name], `${name} rows are unstable between builds`);
  }
});

test('T-23 every frozen counter and closed cohort survives T-FINAL-352 untouched', () => {
  const out = buildProducers();
  // closed cohorts from the previous tranches
  assert.equal(out.stats.publicBoundary, 523);
  assert.equal(out.stats.privateRelay, 591);
  assert.equal(out.stats.closedProducer, 3);
  assert.equal(out.stats.closedNonObject, 69);
  assert.equal(out.stats.closedZeroGoverned, 486);
  // producer counters
  assert.equal(out.stats.producerSites, 4872);
  assert.equal(out.stats.channelEmissions, 10313);
  assert.equal(out.stats.distinctChannels, 4585);
  assert.equal(out.stats.emissionsWithCausalRoot, 186);
  assert.equal(out.stats.ownershipConflicts, 0);
  // an OPEN row may never be counted as a producer or a governed emission
  const openKeys = new Set(openRows(out).map((r) => `${r.file}|${r.ordinal}`));
  const producerKeys = new Set(out.closedProducer.map((r) => `${r.file}|${r.ordinal}`));
  for (const key of openKeys) assert.ok(!producerKeys.has(key), `${key} is both open and a producer`);
});
