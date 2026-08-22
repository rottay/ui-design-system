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
  adjudicateDeclarationOwner,
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
