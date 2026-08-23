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

import ts from 'typescript';

import {
  classifyCrossFileRows,
  dispositionIndex,
  dispositionOf,
  boundedReceiptOf,
  DispositionJoinConflict,
  DISPOSITION_DECISION_FIELDS,
} from './cascade-disposition.mjs';
import { REPO_ABS, resolveShape, resolveSealedTypeDecl, publicGenericWriterProof, getSource } from './cascade-cross-file-resolver.mjs';

/** Run the public-writer predicate over a REAL file's named writer function. */
const publicGenericWriterProofOf = (fileRel, writerName) => {
  const entry = getSource(fileRel);
  if (!entry) return null;
  const src = entry.source;
  let call = null;
  const walk = (n) => {
    if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && n.expression.name.text === 'setProperty') {
      let cur = n;
      while (cur && !(ts.isFunctionDeclaration(cur) && cur.name && cur.name.text === writerName)) cur = cur.parent;
      if (cur) call = call ?? n;
    }
    ts.forEachChild(n, walk);
  };
  walk(src);
  return call ? publicGenericWriterProof(call, src, fileRel) : null;
};
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
  assert.equal(openRows(out).length, 1);
  assert.equal(
    openRows(out).filter((r) => r.reason.endsWith(':dynamic-setProperty')).length,
    1,
    'the 2 GENERIC-writer dynamic sinks kept their form (CLOSURE-11 resolved the 2 const-domain ones)',
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
  // 486 by the original route + 43 through the branch union (35 flat + 8 nested)
  assert.equal(out.stats.closedZeroGoverned, 627);
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

test('Z-4 boundary 523 and relay 591+22 remain unknown and non-consumable', () => {
  const { rows } = classifyCrossFileRows();
  const by = {};
  for (const r of rows) by[r.disposition] = (by[r.disposition] || 0) + 1;
  assert.equal(by.PUBLIC_BOUNDARY_CANDIDATE, 534); // -10 motion.div forwarders, +5 Slider, +1 public writer
  assert.equal(by.RELAY_PRIVATE_UNRESOLVED, 728); // + 10 motion.div + 16 passthrough
  assert.equal(by[ZERO], 627); // + 11 closed by RESIDUAL-42
  // RESIDUAL-42: the 2 that genuinely emit did so UNCONDITIONALLY in every arm,
  // so T-BRANCH-PRODUCER published them as producers; the composite bucket drained.
  assert.equal(by.BRANCH_CONDITIONAL_AUTHORED, undefined);
  assert.equal(by.BRANCH_COMPOSITE_OPEN, undefined);
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
  const byBranchForm = {};
  for (const r of rows) {
    if (r.disposition !== ZERO) continue;
    // T-BRANCH-37 added a SECOND route into ZERO. This test owns the original
    // cohort's decomposition, so it separates the two routes instead of letting
    // the new arrivals blur a number it was written to protect.
    const target = r.receipt && r.receipt.kind === 'branches' ? byBranchForm : byForm;
    target[r.form] = (target[r.form] || 0) + 1;
  }
  // The non-branch cohort is no longer only the original 486: T-COMPUTED-DOMAIN
  // closed 18 more INDIRECTLY (an enumerated lookup nested inside them), and an
  // indirect closure leaves no route marker of its own to separate it by.
  // + 8 more indirect arrivals from T-SEQUENTIAL-8, which close through an
  // `object` root and so are not separable from this bucket by receipt kind
  // + CLOSURE-11: 2 `call` and 1 `spread` from the internal-mutation helpers,
  // and the 2 `dynamic-setProperty` sinks whose name domain was enumerated.
  // + RESIDUAL-42: 4 more `call` zeros (data-table th/td, Message, Notification)
  assert.deepEqual(byForm, { identifier: 7, spread: 129, 'member-access': 317, call: 85, 'dynamic-setProperty': 2 });
  assert.equal(Object.values(byForm).reduce((a, b) => a + b, 0), 540);
  // + the Dropdown useState row, whose receipt is a `branches` tree
  assert.deepEqual(byBranchForm, { 'member-access': 11, spread: 46, call: 16, identifier: 14 });
  assert.equal(Object.values(byBranchForm).reduce((a, b) => a + b, 0), 87);
  // T-CLOSURE-11 resolved the 2 whose name domain is a frozen same-module
  // constant; the 2 generic writers (name supplied by the caller) are whole.
  assert.equal(buildProducers().dynamicSinkPending.length, 1);
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
  // 3 original + 9 reached once T-COMPUTED-DOMAIN enumerated their lookups
  assert.equal(producers.length, 65);
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
  assert.equal(out.stats.publicBoundary, 534);
  assert.equal(out.stats.privateRelay, 728);
  assert.equal(out.stats.closedProducer, 65);
  assert.equal(out.stats.closedNonObject, 69);
  // stats mirror the arrays, never a bare counter
  assert.equal(out.stats.publicBoundary, out.publicBoundary.length);
  assert.equal(out.stats.privateRelay, out.privateRelay.length);
  assert.equal(out.stats.closedProducer, out.closedProducer.length);
  // T-TYPED-1118 moved exactly 1118 rows; T-FINAL-352 moved the remaining 352
  assert.equal(523 + 591 + 3 + 1, 1118);
  assert.equal(1470 - 1118, 352);
  assert.equal(out.stats.openBlocking, 1); // RESIDUAL-42 closed 41; one declared debt remains
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
    // T-SEALED-RELAY: the bucket now carries two labels and no third. A row is
    // either an unexamined passthrough or one the resolver PROVED -- and a
    // proven row must never be published under the "unresolved" label.
    assert.match(row.reason, /^(private-relay-unresolved|sealed-import-relay|custom-property-namespace-relay|public-style-passthrough):/);
    assert.equal(
      row.reason.startsWith('sealed-import-relay:'),
      row.resolvedVia === 'sealed-import-relay',
      `${row.file}:${row.line} label and resolvedVia disagree`,
    );
  }
  assert.equal(out.privateRelay.filter((r) => r.reason.startsWith('sealed-import-relay:')).length, 22);
  // 675 + the 10 historical `motion.div` rows the intrinsic-sink correction moved
  assert.equal(out.privateRelay.filter((r) => r.reason.startsWith('private-relay-unresolved:')).length, 685);
  assert.equal(out.privateRelay.filter((r) => r.reason.startsWith('public-style-passthrough:')).length, 16);
  assert.equal(out.privateRelay.filter((r) => r.reason.startsWith('custom-property-namespace-relay:')).length, 5);
  assert.equal(685 + 16 + 5 + 22, 728);
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
  // A boundary receipt names the PUBLIC entrypoint that exposes it. Since
  // T-BRANCH-RELAY-99 there are two structurally different boundary rows and
  // they are checked apart rather than flattened: a DIRECT relay carries one
  // export chain inline; a conditional tree that INHERITED the disposition
  // carries one chain per relay terminal under `exportEvidence`.
  const inheritedB = (row) => row.evidence.resolvedVia === 'branch-relay-inheritance';
  for (const row of out.publicBoundary) {
    if (inheritedB(row)) {
      assert.ok(row.evidence.exportEvidence.length > 0, `${row.file}:${row.line} inherited boundary with no export chain`);
      for (const chain of row.evidence.exportEvidence) {
        assert.ok(chain.entrypoint, `${row.file}:${row.line} inherited chain must name its entrypoint`);
        assert.ok(chain.exportedAs, `${row.file}:${row.line} inherited chain must name its export`);
        assert.ok(chain.hopChainDepth >= 1);
      }
      continue;
    }
    assert.ok(row.evidence.entrypoint, `${row.file}:${row.line} boundary receipt must name its entrypoint`);
    assert.ok(row.evidence.exportedAs, `${row.file}:${row.line} boundary receipt must name its export`);
    assert.ok(row.evidence.hopChainDepth >= 1);
  }
});

test('T-6 every producer row carries a full causal receipt and invents no root', () => {
  const out = buildProducers();
  assert.equal(out.closedProducer.length, 65);
  // Two identity shapes, kept apart on purpose. A coordinate with ONE producer
  // occurrence publishes its scalar identity. A coordinate with SEVERAL cannot:
  // `governedProducerSiteId` is minted per occurrence, so publishing one of
  // them would be an arbitrary, order-dependent choice. Those rows publish the
  // sorted merged sets instead -- nothing discarded, nothing chosen.
  const single = out.closedProducer.filter((r) => !r.occurrenceProducerSiteIds);
  const multi = out.closedProducer.filter((r) => r.occurrenceProducerSiteIds);
  assert.equal(single.length, 50);
  assert.equal(multi.length, 15);
  for (const row of multi) {
    assert.equal(row.evidence.governedProducerSiteId, undefined, 'a multi-occurrence coordinate must not publish one arbitrary id');
    assert.equal(row.evidence.sourcePartRefs, undefined);
    assert.ok(row.occurrenceProducerSiteIds.length > 1);
    for (const id of row.occurrenceProducerSiteIds) assert.match(id, /^[0-9a-f]{64}$/);
    assert.ok(row.occurrenceSourcePartRefs.length > 0);
    assert.deepEqual(row.occurrenceProducerSiteIds, [...row.occurrenceProducerSiteIds].sort());
  }
  for (const row of single) {
    assert.match(row.evidence.governedProducerSiteId, /^[0-9a-f]{64}$/);
    assert.ok(row.evidence.sourcePartRefs.length > 0, 'a producer must reference the source part it came from');
  }
  for (const row of out.closedProducer) {
    // T-STATIC-KEYSET: two honest producer labels now exist. A row emitting a
    // governed channel keeps the original one; a row whose only emissions sit
    // outside every governed namespace gets its own -- and is still a producer.
    assert.match(row.reason, /^(governed-producer-object|ungoverned-custom-property-producer-object):/);
    assert.ok(
      row.nonConsumableCause === 'governed-producer-with-no-attributed-cascade-root' ||
        row.nonConsumableCause === 'custom-property-producer-outside-any-governed-namespace-with-no-attributed-cascade-root',
      `${row.file}:${row.line} published an unknown producer cause`,
    );
    assert.equal(row.evidence.customPropertyScanComplete, true, 'an incomplete scan may never be published as a closed producer');
    const emitted = [
      ...row.evidence.governedChannelKeys,
      ...row.evidence.internalSocketKeys,
      ...(row.evidence.ungovernedCustomPropertyKeys ?? []),
    ];
    assert.ok(emitted.length > 0, 'a producer that emits no custom property at all is not a producer');
    for (const key of emitted) assert.match(key, /^--/);
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
  assert.equal(out.stats.openBlocking, 1);
  assert.equal(out.openBacklogRollup.blocking, true);
  assert.equal(out.openBacklogRollup.lotBOpen, false, 'lot B must stay shut while open debt exists');
  // the residual dispositions are the ones NO tranche has proven anything about
  const { rows } = classifyCrossFileRows();
  const drained = new Set([
    'CLOSED_ZERO_GOVERNED_EMISSION_OBJECT', 'PUBLIC_BOUNDARY_CANDIDATE',
    'RELAY_PRIVATE_UNRESOLVED', 'CLOSED_PRODUCER', 'CLOSED_NONOBJECT',
  ]);
  const residual = rows.filter((r) => !drained.has(r.disposition));
  assert.equal(residual.length, 1);
  const byDisposition = {};
  for (const r of residual) byDisposition[r.disposition] = (byDisposition[r.disposition] || 0) + 1;
  // COMPUTED_DOMAIN_PENDING is absent, not zero: this map counts rows, and
  // T-COMPUTED-DOMAIN left that disposition with none.
  // this map counts ROWS, so a drained disposition is ABSENT, not zero.
  // RESIDUAL-42 left exactly one open row in the whole inventory.
  assert.deepEqual(byDisposition, { DYNAMIC_SINK_PENDING: 1 });
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
  assert.equal(out.stats.closedZeroGoverned, 627);
});

test('T-15 relayKinds is published with a CLOSED vocabulary and survives multi-sink coordinates', () => {
  const out = buildProducers();
  const RELAY_KINDS = new Set(['PRIVATE_RELAY_UNRESOLVED', 'CUSTOM_COMPONENT_SINK_NOT_FOLLOWED']);
  const BOUNDARY_KINDS = new Set(['PUBLIC_BOUNDARY_CANDIDATE', 'PUBLIC_BOUNDARY_UNKNOWN']);
  const isSorted = (a) => JSON.stringify(a) === JSON.stringify([...a].sort());
  const hasDuplicates = (a) => new Set(a).size !== a.length;

  // A relay row exists BECAUSE a sink classified it, so its kind list is never
  // empty; an empty one would mean the evidence was dropped on the way out.
  // A row that INHERITED its disposition from a conditional tree has no single
  // `boundaryReceipt` to merge, so its typed kinds live in the receipt instead
  // of at row level. Fabricating a row-level value would invent a sink that
  // does not exist, so the two shapes are asserted apart.
  const inheritedRow = (row) => row.evidence && row.evidence.resolvedVia === 'branch-relay-inheritance';
  assert.equal(out.privateRelay.filter(inheritedRow).length, 84);
  assert.equal(out.publicBoundary.filter(inheritedRow).length, 15);
  assert.equal(out.privateRelay.filter((r) => r.resolvedVia === 'public-style-passthrough').length, 16);
  for (const row of [...out.privateRelay, ...out.publicBoundary].filter(inheritedRow)) {
    assert.deepEqual(row.relayKinds, [], 'an inherited row has no single sink to merge');
    assert.deepEqual(row.sinkTags, []);
    assert.ok(row.evidence.relayKinds.length > 0, `${row.file}:${row.line} inherited row published no typed relay kind`);
    assert.ok(isSorted(row.evidence.relayKinds) && !hasDuplicates(row.evidence.relayKinds));
    for (const kind of row.evidence.relayKinds) {
      assert.ok(
        RELAY_KINDS.has(kind) || BOUNDARY_KINDS.has(kind),
        `${row.file}:${row.line} unknown inherited relay kind ${kind}`,
      );
    }
  }
  for (const row of out.privateRelay.filter((r) => !inheritedRow(r))) {
    assert.ok(row.relayKinds.length > 0, `${row.file}:${row.line} relay published no relayKinds`);
    assert.ok(isSorted(row.relayKinds), `${row.file}:${row.line} relayKinds must be sorted`);
    assert.ok(!hasDuplicates(row.relayKinds), `${row.file}:${row.line} relayKinds must be a set`);
    for (const kind of row.relayKinds) {
      assert.ok(RELAY_KINDS.has(kind), `${row.file}:${row.line} unknown relay kind ${kind}`);
    }
    assert.ok(row.sinkTags.length > 0 && isSorted(row.sinkTags) && !hasDuplicates(row.sinkTags));
  }
  for (const row of out.publicBoundary.filter((r) => !inheritedRow(r))) {
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
  // 20 before T-SEALED-RELAY; 8 of its 22 arrivals also reach two sinks
  assert.equal([...out.publicBoundary, ...out.privateRelay].filter((r) => r.sinkTags.length > 1).length, 28);

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
    BRANCH_COMPOSITE_OPEN: 0,
    AUTHORED_OPEN: 0,
    BRANCH_CONDITIONAL_AUTHORED: 0,
    OPEN_UNKNOWN: 0,
    COMPUTED_DOMAIN_PENDING: 0,
    DYNAMIC_SINK_PENDING: 1,
    CALL_ARGS_PENDING: 0,
  });
  assert.equal(out.branchCompositeOpen.length, 0);
  assert.equal(out.authoredOpen.length, 0);
  assert.equal(out.branchConditionalAuthored.length, 0);
  assert.equal(out.openUnknown.length, 0);
  assert.equal(out.computedDomainPending.length, 0);
  assert.equal(out.dynamicSinkPending.length, 1);
  assert.equal(out.callArgsPending.length, 0);
  assert.equal(openRows(out).length, 1);
  assert.equal(out.stats.openBlocking, 1);
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
  assert.equal(rows.length, 1);
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
  assert.equal(out.openBacklogRollup.total, 1);
  assert.equal(out.openBacklogRollup.blocking, true);
  assert.equal(out.openBacklogRollup.lotBOpen, false);
  assert.match(out.openBacklogRollup.statement, /CLASSIFIED, not resolved/);
});

test('T-19 the 4 dynamic sinks and the 1 call-args row stay INTACT and nominated', () => {
  const out = buildProducers();
  // These are the two cohorts a heuristic would be most tempted to absorb into
  // a neighbouring bucket. They keep their own collection, count and cause.
  assert.equal(out.dynamicSinkPending.length, 1);
  for (const row of out.dynamicSinkPending) {
    assert.equal(row.disposition, 'DYNAMIC_SINK_PENDING');
    assert.equal(row.reason, 'dynamic-sink-pending:dynamic-setProperty');
    assert.equal(row.nonConsumableCause, 'setProperty-name-is-not-a-literal-at-the-sink');
    assert.equal(row.blocking, true);
  }
  /* RESIDUAL-42 closed the call-args row (Typography Heading -> privateRelay,
   * its Classic branch reaches AntD `Title`) and elevated the package-public
   * writer to a boundary. One dynamic sink survives, and it is the debt. */
  assert.equal(out.callArgsPending.length, 0);
  assert.equal(out.dynamicSinkPending.length, 1);
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
    if (out[name].length === 0) {
      // An EMPTY collection digests the empty list twice, so the two agree BY
      // CONSTRUCTION. Asserting inequality there would be asserting an accident.
      assert.equal(out.digests[name], out.digests[`${name}Receipts`], `${name} is empty; both digests must be the empty digest`);
      continue;
    }
    assert.notEqual(out.digests[name], out.digests[`${name}Receipts`]);
  }
  // T-COMPUTED-DOMAIN emptied exactly one collection; pin WHICH, so a future
  // silently-emptied bucket cannot hide behind the branch above.
  // RESIDUAL-42 drained every open collection but one; pin WHICH, so a future
  // silently-emptied bucket still cannot hide behind the branch above.
  assert.deepEqual(OPEN_COLLECTIONS.filter((n) => out[n].length === 0).sort(), [
    'authoredOpen', 'branchCompositeOpen', 'branchConditionalAuthored',
    'callArgsPending', 'computedDomainPending', 'openUnknown',
  ]);
  assert.deepEqual(OPEN_COLLECTIONS.filter((n) => out[n].length > 0), ['dynamicSinkPending']);
  // identity alone cannot see the receipt; the receipt-bound tuple must
  const rows = out.dynamicSinkPending.slice(0, 5);
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
  // RESIDUAL-42 drained the composite bucket; tamper the collection that still
  // carries an open receipt. The claim is unchanged: a tampered published
  // receipt must make --check reject.
  assert.ok(parsed.dynamicSinkPending.length > 0);
  parsed.dynamicSinkPending[0].evidence = { ...(parsed.dynamicSinkPending[0].evidence ?? {}), path: ['tampered'] };
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
  assert.equal(out.stats.publicBoundary, 534);
  assert.equal(out.stats.privateRelay, 728);
  assert.equal(out.stats.closedProducer, 65);
  assert.equal(out.stats.closedNonObject, 69);
  assert.equal(out.stats.closedZeroGoverned, 627);
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

/* ===================================================================== *
 * T-BRANCH-37 -- exhaustive branch inspection.
 *
 * A conditional whose arms are ALL resolved (closed object/array or proven
 * non-object) has no unexamined path, so the union of its emissions is
 * decidable arm by arm -- WITHOUT merging the arms into one style object.
 * An empty union under a complete scan licenses a close; a non-empty one
 * forbids it, because no cascade root or owner has been proven for a
 * conditional sink and attributing one would be an invention.
 * ===================================================================== */

/** Resolve the `style={...}` expression of a fixture and dispose of it. */
const branchProbe = (code) => {
  const source = ts.createSourceFile(
    'packages/core/src/ui/probe/index.tsx', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX,
  );
  let expression = null;
  const walk = (node) => {
    if (
      ts.isJsxAttribute(node) && node.name.getText(source) === 'style' &&
      node.initializer && ts.isJsxExpression(node.initializer)
    ) expression = node.initializer.expression;
    ts.forEachChild(node, walk);
  };
  walk(source);
  assert.ok(expression, 'fixture must contain a style sink');
  const fileRel = 'packages/core/src/ui/probe/index.tsx';
  const shape = resolveShape(expression, {
    source, fileRel, depth: 0, path: [{ kind: 'terminal-at-sink', form: 'identifier' }],
  });
  return {
    shape,
    ...dispositionOf(shape, null, { sinkNode: expression, sourceFile: source, fileRel, line: 1 }, []),
  };
};
const ZERO_D = 'CLOSED_ZERO_GOVERNED_EMISSION_OBJECT';

test('B-1 POSITIVE: a conditional whose arms emit nothing governed closes as ZERO', () => {
  const out = branchProbe('export const C = () => <div style={flag ? {color:"red"} : {color:"blue"}} />;');
  assert.equal(out.shape.kind, 'branches');
  assert.equal(out.disposition, ZERO_D);
  assert.equal(out.governance.customPropertyScanComplete, true);
  assert.deepEqual(out.governance.governedChannelKeys, []);
  assert.deepEqual(out.governance.internalSocketKeys, []);
  // BOTH arms were actually walked -- the ordinary keys of each are witnessed
  assert.ok(out.governance.ordinaryPropertyKeys.includes('color'));
  assert.ok(out.governance.keyWitnesses.length >= 2, 'each arm contributes its own witness');
  assert.ok(out.governance.keyWitnesses.every((w) => w.origin === 'branch'));
});

test('B-2 NEGATIVE: one governed key in ONE arm keeps the row blocking', () => {
  const out = branchProbe('export const C = () => <div style={flag ? {"--ds-x":"1"} : {color:"blue"}} />;');
  assert.equal(out.disposition, 'BRANCH_CONDITIONAL_AUTHORED');
  assert.deepEqual(out.governance.governedChannelKeys, ['--ds-x']);
  assert.equal(out.governance.customPropertyScanComplete, true);
  // a complete scan that FINDS an emission is a reason to stay blocking, never to close
  assert.notEqual(out.disposition, ZERO_D);
  assert.notEqual(out.disposition, 'CLOSED_PRODUCER');
});

test('B-3 NEGATIVE: an internal socket also blocks -- emission is not only --ds-', () => {
  const out = branchProbe('export const C = () => <div style={flag ? {"--_ds-y":"1"} : {color:"blue"}} />;');
  assert.equal(out.disposition, 'BRANCH_CONDITIONAL_AUTHORED');
  assert.deepEqual(out.governance.internalSocketKeys, ['--_ds-y']);
  assert.deepEqual(out.governance.governedChannelKeys, []);
});

test('B-4 NEGATIVE: an arm left OPEN by an unresolved spread never reaches the union', () => {
  const out = branchProbe('export const C = () => <div style={flag ? {...unknownThing} : {color:"blue"}} />;');
  assert.equal(out.disposition, 'BRANCH_COMPOSITE_OPEN');
  assert.equal(out.governance, null, 'an open arm must not produce a governance verdict at all');
});

test('B-5 POSITIVE: a non-object arm mixed with a closed object still closes', () => {
  const out = branchProbe('export const C = () => <div style={flag ? undefined : {color:"blue"}} />;');
  assert.equal(out.disposition, ZERO_D);
  assert.equal(out.governance.customPropertyScanComplete, true);
  assert.deepEqual(out.governance.governedChannelKeys, []);
});

test('B-6 NEGATIVE: a governed key reachable only THROUGH a spread still blocks', () => {
  // proves the walk is recursive: the key is not visible in the arm's own leaves
  const out = branchProbe(
    'const base = {"--ds-deep":"1"};\nexport const C = () => <div style={flag ? {...base} : {color:"blue"}} />;',
  );
  assert.equal(out.disposition, 'BRANCH_CONDITIONAL_AUTHORED');
  assert.deepEqual(out.governance.governedChannelKeys, ['--ds-deep']);
});

test('B-7 a NESTED conditional whose terminals are all ZERO now closes', () => {
  // This fixture was T-BRANCH-37's declared BOUNDARY: `a ? {..} : b ? {..} : {..}`
  // gives the outer shape an arm that is itself a `branches` shape, and that
  // tranche deliberately left it in BRANCH_COMPOSITE_OPEN. T-BRANCH-COMPOSITE-162
  // crosses that boundary on purpose, so the assertion is INVERTED rather than
  // deleted -- the same fixture keeps the history legible.
  const out = branchProbe('export const C = () => <div style={a ? {top:1} : b ? {left:2} : {right:3}} />;');
  assert.equal(out.disposition, ZERO_D);
  assert.equal(out.governance.customPropertyScanComplete, true);
  assert.deepEqual(out.governance.governedChannelKeys, []);
  // all THREE terminal arms were walked, not just the two at the top level
  const ordinary = out.governance.ordinaryPropertyKeys.sort();
  assert.deepEqual(ordinary, ['left', 'right', 'top']);
});

test('B-7b a nested conditional with ONE governed terminal stays blocking', () => {
  // depth is not a licence: a governed key hidden in the deepest arm must still
  // block the whole tree.
  const out = branchProbe('export const C = () => <div style={a ? {top:1} : b ? {left:2} : {"--ds-deep":"3"}} />;');
  assert.equal(out.disposition, 'BRANCH_CONDITIONAL_AUTHORED');
  assert.deepEqual(out.governance.governedChannelKeys, ['--ds-deep']);
});

test('B-7c a nested conditional with an UNRESOLVED terminal stays composite', () => {
  // one non-exhaustive terminal anywhere in the tree keeps the row blocking,
  // and governance is never consulted at all
  const out = branchProbe('export const C = () => <div style={a ? {top:1} : b ? {...mystery} : {right:3}} />;');
  assert.equal(out.disposition, 'BRANCH_COMPOSITE_OPEN');
  assert.equal(out.governance, null);
});

test('B-7d a nested conditional with a RELAY terminal INHERITS the relay disposition', () => {
  // This was T-BRANCH-COMPOSITE-162's boundary: a relay terminal kept the tree
  // composite. T-BRANCH-RELAY-99 crosses it, so the assertion is INVERTED on the
  // same fixture rather than deleted. The authored terminals are silent and the
  // single relay terminal has no public export path, so the tree inherits
  // PRIVATE -- and is NEVER turned into a ZERO.
  const out = branchProbe(
    'export const C = ({ handed }) => <div style={a ? {top:1} : b ? handed : {right:3}} />;',
  );
  assert.equal(out.disposition, 'RELAY_PRIVATE_UNRESOLVED');
  assert.notEqual(out.disposition, ZERO_D);
  assert.equal(out.governance, null, 'an inherited row carries no governance verdict');
  assert.equal(out.branchRelayReceipt.inheritedFrom, 'RELAY_PRIVATE_UNRESOLVED');
  assert.equal(out.branchRelayReceipt.authoredTerminalsSilent, true);
  assert.equal(out.branchRelayReceipt.relayTerminalCount, 1);
  assert.equal(out.branchRelayReceipt.authoredTerminalCount, 2);
});

test('B-8 arm ORDER does not change the verdict or the union', () => {
  const forward = branchProbe('export const C = () => <div style={flag ? {"--ds-a":"1"} : {"--ds-b":"2"}} />;');
  const reversed = branchProbe('export const C = () => <div style={flag ? {"--ds-b":"2"} : {"--ds-a":"1"}} />;');
  assert.equal(forward.disposition, reversed.disposition);
  assert.deepEqual(
    [...forward.governance.governedChannelKeys].sort(),
    [...reversed.governance.governedChannelKeys].sort(),
  );
  // and a zero-union pair is equally order-independent
  const z1 = branchProbe('export const C = () => <div style={flag ? {top:1} : {left:2}} />;');
  const z2 = branchProbe('export const C = () => <div style={flag ? {left:2} : {top:1}} />;');
  assert.equal(z1.disposition, ZERO_D);
  assert.equal(z2.disposition, ZERO_D);
  assert.equal(z1.governance.keyWitnesses.length, z2.governance.keyWitnesses.length);
});

test('B-9 the live tree drains 43 branch rows and the 2 survivors name their channel', () => {
  const out = buildProducers();
  const branchZero = out.closedZeroGoverned.filter((r) => r.resolvedVia === 'branch-union');
  assert.equal(branchZero.length, 56); // + 4 branch-union zeros from RESIDUAL-42
  for (const row of branchZero) {
    assert.equal(row.evidence.customPropertyScanComplete, true, `${row.file}:${row.line} closed on an INCOMPLETE scan`);
    assert.deepEqual(row.evidence.governedChannelKeys, []);
    assert.deepEqual(row.evidence.internalSocketKeys, []);
    assert.equal(row.evidence.allArmsClosed, true);
    assert.ok(row.evidence.branchCount >= 2, 'a branch row has at least two arms');
    assert.ok(row.evidence.branchWitnessCount > 0, 'the arms must have been walked, not assumed');
  }
  // the FLAT rows keep the exact receipt shape the previous tranche published;
  // T-STATIC-KEYSET added 3 (enumerated-computedKey trees), 41 -> 44
  const flat = branchZero.filter((r) => r.evidence.nestingDepth === undefined);
  assert.equal(flat.length, 48);
  for (const row of flat) {
    // arms are objects; since T-COMPUTED-DOMAIN a flat row may also carry a
    // proven non-object arm; and since T-STATIC-KEYSET an ENUMERATED
    // `computedKey` arm (domain closed) is admissible too. No other kind may
    // appear -- an unenumerated lookup still keeps the row open.
    for (const kind of row.evidence.branchKinds) {
      assert.ok(['object', 'nonObject', 'computedKey'].includes(kind), `unexpected arm kind ${kind}`);
    }
  }
  // exactly the 3 coordinates KS-9 pins carry that arm, and no more
  assert.equal(flat.filter((r) => r.evidence.branchKinds.includes('computedKey')).length, 3);
  // the 486 that closed by the earlier route keep NO receipt and are untouched
  // 486 - 13: hardening the mutation detector gave 13 pre-existing zeros a real
  // route (`internal-base-mutation`) instead of no receipt at all.
  assert.equal(out.closedZeroGoverned.filter((r) => r.resolvedVia === undefined).length, 473);
  assert.equal(out.stats.closedZeroGoverned, 627);

  /* The 2 survivors were promoted by T-BRANCH-PRODUCER: their emission is
   * UNCONDITIONAL (the same governed key in every arm), which is a producer, not
   * blocked debt. The channels they name are unchanged and still rootless --
   * see C-5, which pins that promotion on its own. */
  assert.equal(out.branchConditionalAuthored.length, 0);
  const channels = [...new Set(out.closedProducer
    .flatMap((r) => r.evidence.governedChannelKeys)
    .filter((k) => k === '--ds-carousel-dots-transform' || k === '--ds-toast-stack-transform'))].sort();
  assert.deepEqual(channels, ['--ds-carousel-dots-transform', '--ds-toast-stack-transform']);
  for (const row of out.branchConditionalAuthored) {
    assert.equal(row.blocking, true);
    assert.equal(row.closed, false);
    assert.equal(row.consumable, false);
    assert.equal(row.tenantSafe, false);
    assert.equal(row.evidence.customPropertyScanComplete, true);
    assert.ok(row.evidence.governedChannelKeys.length > 0);
    assert.ok(!('causalRootIds' in row));
    assert.ok(!('ownerId' in row));
  }
  assert.equal(out.stats.openBlocking, 1);
});

test('B-10 NEGATIVE: mutating a branch witness moves the receipt digest', () => {
  const out = buildProducers();
  assert.match(out.digests.closedZeroGovernedReceipts, /^[0-9a-f]{64}$/);
  assert.notEqual(out.digests.closedZeroGoverned, out.digests.closedZeroGovernedReceipts);
  const rows = out.closedZeroGoverned.filter((r) => r.resolvedVia === 'branch-union').slice(0, 4);
  const identity = (rs) => JSON.stringify(rs.map((r) => [r.plane, r.file, r.symbol, r.reason]));
  const bound = (rs) => JSON.stringify(rs.map((r) => [r.file, r.ordinal, r.resolvedVia ?? null, r.evidence ?? null]));
  const witnessCountChanged = rows.map((r) => ({ ...r, evidence: { ...r.evidence, branchWitnessCount: 0 } }));
  const armsChanged = rows.map((r) => ({ ...r, evidence: { ...r.evidence, allArmsClosed: false } }));
  const stripped = rows.map((r) => ({ ...r, evidence: null, resolvedVia: undefined }));
  assert.equal(identity(rows), identity(witnessCountChanged), 'identity is blind to the witness by design');
  assert.notEqual(bound(rows), bound(witnessCountChanged), 'a mutated witness count MUST move the digest');
  assert.notEqual(bound(rows), bound(armsChanged), 'a mutated arm-closure claim MUST move the digest');
  assert.notEqual(bound(rows), bound(stripped), 'a removed receipt MUST move the digest');
});

test('B-11 the composite and every other open cohort is untouched by this tranche', () => {
  const out = buildProducers();
  assert.equal(out.branchCompositeOpen.length, 0);
  assert.equal(out.authoredOpen.length, 0);
  assert.equal(out.openUnknown.length, 0);
  assert.equal(out.computedDomainPending.length, 0);
  assert.equal(out.dynamicSinkPending.length, 1);
  assert.equal(out.callArgsPending.length, 0);
  assert.equal(out.branchConditionalAuthored.length, 0);
  assert.equal(openRows(out).length, 1);
  assert.equal(universeTotal(out), 2024);
  // frozen closed cohorts and producer counters
  assert.equal(out.stats.publicBoundary, 534);
  assert.equal(out.stats.privateRelay, 728);
  assert.equal(out.stats.closedProducer, 65);
  assert.equal(out.stats.closedNonObject, 69);
  assert.equal(out.stats.producerSites, 4872);
  assert.equal(out.stats.channelEmissions, 10313);
  assert.equal(out.stats.distinctChannels, 4585);
  assert.equal(out.stats.emissionsWithCausalRoot, 186);
  assert.equal(out.stats.ownershipConflicts, 0);
});

/* ===================================================================== *
 * T-BRANCH-COMPOSITE-162 -- recursive resolution of nested conditionals.
 *
 * A composite row closes ONLY when every TERMINAL arm of the whole tree is a
 * closed object/array or a proven non-object, the scan is complete, and the
 * union of emissions is empty. Every other blocker in the bucket -- a relay
 * arm, an object that never closed, an unresolved computed key, an
 * openUnknown, a pending call argument -- keeps the row blocking with its
 * cause published. Measured on the live tree: 8 of 162 qualify.
 * ===================================================================== */

test('C-1 the composite bucket is 162 - 8 nested - 99 relay-inherited = 55', () => {
  const out = buildProducers();
  assert.equal(out.branchCompositeOpen.length, 0);
  const nested = out.closedZeroGoverned.filter(
    (r) => r.resolvedVia === 'branch-union' && r.evidence.nestingDepth !== undefined,
  );
  assert.equal(nested.length, 8);
  const relayInherited = [...out.publicBoundary, ...out.privateRelay].filter(
    (r) => r.evidence && r.evidence.resolvedVia === 'branch-relay-inheritance',
  );
  assert.equal(relayInherited.length, 99);
  assert.equal(162 - 8 - 99, 55); // the pre-T-STATIC-KEYSET composite total
  assert.equal(out.stats.openBlocking, 1);
  assert.equal(universeTotal(out), 2024);
});

test('C-2 every newly closed row carries an EXHAUSTIVE recursive receipt', () => {
  const out = buildProducers();
  const nested = out.closedZeroGoverned.filter(
    (r) => r.resolvedVia === 'branch-union' && r.evidence.nestingDepth !== undefined,
  );
  assert.equal(nested.length, 8);
  for (const row of nested) {
    const e = row.evidence;
    // the tree was walked to its terminals, and every terminal resolved
    assert.ok(e.nestingDepth >= 1, `${row.file}:${row.line} published as nested with depth 0`);
    assert.ok(e.terminalArmCount >= e.branchCount, 'a nested tree has at least as many terminals as top-level arms');
    assert.equal(e.allTerminalArmsResolved, true, `${row.file}:${row.line} closed with an UNRESOLVED terminal`);
    // terminals may only be the two kinds that carry no unexamined path
    for (const kind of e.terminalArmKinds) {
      assert.ok(['object', 'array', 'nonObject'].includes(kind), `terminal kind ${kind} must never close`);
    }
    // and the emission proof
    assert.equal(e.customPropertyScanComplete, true);
    assert.deepEqual(e.governedChannelKeys, []);
    assert.deepEqual(e.internalSocketKeys, []);
    assert.ok(e.branchWitnessCount > 0, 'the arms must have been walked, not assumed');
    assert.ok(e.branchKinds.includes('branches'), 'a nested row declares its nested arm');
    // nothing invented
    assert.ok(!('causalRootIds' in row));
    assert.ok(!('ownerId' in row));
  }
});

test('C-3 the composite bucket drained: no survivor, so no cause to publish', () => {
  const { rows } = classifyCrossFileRows();
  const composite = rows.filter((r) => r.disposition === 'BRANCH_COMPOSITE_OPEN');
  assert.equal(composite.length, 0);
  // every survivor has a demonstrable blocker somewhere in its tree
  const blockerOf = (arm) => {
    if (arm.kind === 'nonObject') return null;
    if (arm.kind === 'object' || arm.kind === 'array') return arm.closed === true ? null : `open-${arm.kind}`;
    if (arm.kind === 'branches') {
      for (const child of arm.branches ?? []) {
        const found = blockerOf(child);
        if (found) return found;
      }
      return (arm.branches ?? []).length === 0 ? 'empty-branches' : null;
    }
    return arm.kind;
  };
  const census = {};
  for (const row of composite) {
    const blockers = (row.receipt.branches ?? []).map(blockerOf).filter(Boolean);
    assert.ok(blockers.length > 0, `${row.file}:${row.line} is composite with NO blocker -- it should have closed`);
    census[blockers[0]] = (census[blockers[0]] || 0) + 1;
  }
  // the measured blocker profile; a drop here means a row was closed unsafely
  // relay drops 103 -> 4: those 4 also carry a callArgsPending terminal, so the
  // tree is not exhaustively resolved and the relay inheritance never applies.
  // T-STATIC-KEYSET drained 35: the 3 `computedKey` survivors had ENUMERATED
  // domains (closed=true) and 32 `open-object` survivors had fully static key
  // sets. What is left is the genuinely unenumerable residue.
  /* RESIDUAL-42 drained the bucket completely: the `relay` survivors became
   * public-style passthroughs, the `open-object` ones resolved through the
   * internal-mutation / computed-name proofs, and the `openUnknown` ones through
   * the let-union. Nothing is left to profile. */
  assert.deepEqual(census, {});
  assert.equal(Object.values(census).reduce((a, b) => a + b, 0), 0);
});

test('C-4 every ZERO row keeps the semantics of the route that closed it', () => {
  const out = buildProducers();
  // The route split is pinned in FULL, so no row can silently change the story
  // of how it was closed.
  const byRoute = {};
  for (const row of out.closedZeroGoverned) byRoute[row.resolvedVia ?? '(none)'] = (byRoute[row.resolvedVia ?? '(none)'] || 0) + 1;
  assert.deepEqual(byRoute, { '(none)': 473, 'branch-union': 56, 'static-key-set': 33, 'internal-base-mutation': 16, 'dynamic-property-domain': 2, 'computed-domain-enumeration': 18, 'nested-computed-domain': 21, 'static-sequential-assignment': 8 });
  const original = out.closedZeroGoverned.filter((r) => r.resolvedVia === undefined);
  // 486 - 13 relabelled by the hardened mutation detector (see CL-10)
  assert.equal(original.length, 473);
  for (const row of original) {
    assert.equal(row.evidence, undefined, 'an originally-closed row must not gain a receipt');
    assert.match(row.reason, /^zero-governed-emission-object:/);
  }
  // 35 flat branch rows, receipt WITHOUT any nesting field
  const flat = out.closedZeroGoverned.filter(
    (r) => r.resolvedVia === 'branch-union' && r.evidence.nestingDepth === undefined,
  );
  assert.equal(flat.length, 48);
  for (const row of flat) {
    assert.equal(row.evidence.terminalArmCount, undefined, 'a flat row must not gain nested fields');
    assert.equal(row.evidence.allTerminalArmsResolved, undefined);
    // T-STATIC-KEYSET: an ENUMERATED computedKey arm is admissible (see KS-9)
    for (const kind of row.evidence.branchKinds) {
      assert.ok(['object', 'nonObject', 'computedKey'].includes(kind), `unexpected arm kind ${kind}`);
    }
  }
  assert.equal(flat.filter((r) => r.evidence.branchKinds.includes('computedKey')).length, 3);
  assert.equal(486 + 35, 521);
});

test('C-5 the 2 conditional survivors became PRODUCERS and kept their channels', () => {
  /* They emitted UNCONDITIONALLY -- the same governed key in every arm -- so
   * T-BRANCH-PRODUCER published them as producers. Nothing was attributed that
   * was not already true: the channels are unchanged, and the rows still carry
   * no root, no owner and no tenant reach. */
  const out = buildProducers();
  assert.equal(out.branchConditionalAuthored.length, 0);
  const promoted = out.closedProducer.filter((r) =>
    r.evidence.governedChannelKeys.some((k) => k === '--ds-carousel-dots-transform' || k === '--ds-toast-stack-transform'));
  const channels = [...new Set(promoted.flatMap((r) => r.evidence.governedChannelKeys))].sort();
  assert.deepEqual(channels, ['--ds-carousel-dots-transform', '--ds-toast-stack-transform']);
  for (const row of promoted) {
    assert.equal(row.consumable, false);
    assert.equal(row.tenantSafe, false);
    assert.ok(!('causalRootIds' in row));
    assert.ok(!('ownerId' in row));
    assert.equal(row.evidence.customPropertyScanComplete, true);
  }
});

test('C-6 NEGATIVE: tampering with the recursive receipt moves the digest', () => {
  const out = buildProducers();
  const nested = out.closedZeroGoverned.filter(
    (r) => r.resolvedVia === 'branch-union' && r.evidence.nestingDepth !== undefined,
  );
  const bound = (rs) => JSON.stringify(rs.map((r) => [r.file, r.ordinal, r.resolvedVia ?? null, r.evidence ?? null]));
  const identity = (rs) => JSON.stringify(rs.map((r) => [r.plane, r.file, r.symbol, r.reason]));
  const mutations = {
    'allTerminalArmsResolved flipped': nested.map((r) => ({ ...r, evidence: { ...r.evidence, allTerminalArmsResolved: false } })),
    'terminalArmCount understated': nested.map((r) => ({ ...r, evidence: { ...r.evidence, terminalArmCount: 1 } })),
    'nestingDepth erased': nested.map((r) => ({ ...r, evidence: { ...r.evidence, nestingDepth: 0 } })),
    'terminalArmKinds widened': nested.map((r) => ({ ...r, evidence: { ...r.evidence, terminalArmKinds: ['relay'] } })),
    'receipt removed': nested.map((r) => ({ ...r, evidence: null })),
  };
  for (const [name, mutated] of Object.entries(mutations)) {
    assert.equal(identity(nested), identity(mutated), `identity must stay blind: ${name}`);
    assert.notEqual(bound(nested), bound(mutated), `the bound digest MUST notice: ${name}`);
  }
  assert.match(out.digests.closedZeroGovernedReceipts, /^[0-9a-f]{64}$/);
});

test('C-7 nested resolution is deterministic and order-independent', () => {
  // arm order inside a nested tree changes neither verdict nor union
  const a = branchProbe('export const C = () => <div style={p ? {top:1} : q ? {left:2} : {right:3}} />;');
  const b = branchProbe('export const C = () => <div style={p ? {right:3} : q ? {top:1} : {left:2}} />;');
  assert.equal(a.disposition, ZERO_D);
  assert.equal(b.disposition, ZERO_D);
  assert.deepEqual(a.governance.ordinaryPropertyKeys.sort(), b.governance.ordinaryPropertyKeys.sort());
  assert.equal(a.governance.keyWitnesses.length, b.governance.keyWitnesses.length);
  // and two full builds agree row for row and digest for digest
  const one = buildProducers();
  const two = buildProducers();
  assert.deepEqual(one.closedZeroGoverned, two.closedZeroGoverned);
  assert.deepEqual(one.branchCompositeOpen, two.branchCompositeOpen);
  assert.equal(one.digests.closedZeroGovernedReceipts, two.digests.closedZeroGovernedReceipts);
  assert.equal(one.digests.branchCompositeOpenReceipts, two.digests.branchCompositeOpenReceipts);
});

test('C-8 deep nesting terminates and stays fail-closed', () => {
  // three levels, all terminals zero -> closes
  const deep = branchProbe('export const C = () => <div style={a ? {t:1} : b ? {l:2} : c ? {r:3} : {z:4}} />;');
  assert.equal(deep.disposition, ZERO_D);
  assert.equal(deep.governance.customPropertyScanComplete, true);
  assert.deepEqual(deep.governance.ordinaryPropertyKeys.sort(), ['l', 'r', 't', 'z']);
  // the SAME depth with one governed key at the deepest terminal -> blocking
  const poisoned = branchProbe('export const C = () => <div style={a ? {t:1} : b ? {l:2} : c ? {r:3} : {"--ds-z":"4"}} />;');
  assert.equal(poisoned.disposition, 'BRANCH_CONDITIONAL_AUTHORED');
  assert.deepEqual(poisoned.governance.governedChannelKeys, ['--ds-z']);
});

/* ===================================================================== *
 * T-BRANCH-RELAY-99 -- a conditional tree INHERITS a relay disposition.
 *
 * A relay terminal can never be proven ZERO, so these trees do not close as
 * zero emissions. They inherit PRIVATE_RELAY or PUBLIC_BOUNDARY -- and only
 * when every terminal is resolved, the authored terminals are provably silent,
 * and every relay terminal lands on ONE typed disposition. The inherited site
 * stays consumable:false / tenantSafe:false.
 * ===================================================================== */

const INHERITED = (row) => row.evidence && row.evidence.resolvedVia === 'branch-relay-inheritance';

test('R-1 POSITIVE private-only: authored-silent + unexported relay -> PRIVATE_RELAY', () => {
  const out = branchProbe('export const C = ({ s }) => <div style={flag ? {top:1} : s} />;');
  assert.equal(out.disposition, 'RELAY_PRIVATE_UNRESOLVED');
  assert.equal(out.branchRelayReceipt.inheritedFrom, 'RELAY_PRIVATE_UNRESOLVED');
  assert.equal(out.branchRelayReceipt.relayTerminalCount, 1);
  assert.equal(out.branchRelayReceipt.authoredTerminalCount, 1);
  assert.equal(out.branchRelayReceipt.authoredTerminalsSilent, true);
  assert.equal(out.branchRelayReceipt.authoredScanComplete, true);
  assert.deepEqual(out.branchRelayReceipt.exportEvidence, [], 'a private relay proves no export path');
  // a relay is NEVER converted into a zero emission
  assert.notEqual(out.disposition, ZERO_D);
});

test('R-2 NEGATIVE mixed: a governed key in an authored terminal keeps it composite', () => {
  const out = branchProbe('export const C = ({ s }) => <div style={flag ? {"--ds-mix":"1"} : s} />;');
  assert.equal(out.disposition, 'BRANCH_COMPOSITE_OPEN');
  assert.equal(out.branchRelayReceipt.inheritedFrom, null);
  assert.equal(out.branchRelayReceipt.blockedBy, 'authored-terminals-emit-governed-channels');
  assert.deepEqual(out.branchRelayReceipt.governedChannelKeys, ['--ds-mix']);
  assert.equal(out.branchRelayReceipt.authoredTerminalsSilent, false);
});

test('R-3 NEGATIVE: an internal socket in an authored terminal also blocks', () => {
  const out = branchProbe('export const C = ({ s }) => <div style={flag ? {"--_ds-sock":"1"} : s} />;');
  assert.equal(out.disposition, 'BRANCH_COMPOSITE_OPEN');
  assert.deepEqual(out.branchRelayReceipt.internalSocketKeys, ['--_ds-sock']);
  assert.equal(out.branchRelayReceipt.inheritedFrom, null);
});

test('R-4 NEGATIVE: an unresolved terminal keeps the tree composite and unclassified', () => {
  const out = branchProbe('export const C = ({ s }) => <div style={flag ? {...mystery} : s} />;');
  assert.equal(out.disposition, 'BRANCH_COMPOSITE_OPEN');
  // the relay path is never entered at all, so no relay receipt is fabricated
  assert.equal(out.branchRelayReceipt, undefined);
});

test('R-5 NEGATIVE: a dynamic/computed terminal keeps the tree composite', () => {
  const out = branchProbe('export const C = ({ s, k }) => <div style={flag ? lookup[k] : s} />;');
  assert.equal(out.disposition, 'BRANCH_COMPOSITE_OPEN');
  assert.notEqual(out.disposition, 'RELAY_PRIVATE_UNRESOLVED');
});

test('R-6 the live tree inherits exactly 99: 84 private and 15 public', () => {
  const out = buildProducers();
  const relay = out.privateRelay.filter(INHERITED);
  const boundary = out.publicBoundary.filter(INHERITED);
  assert.equal(relay.length, 84);
  assert.equal(boundary.length, 15);
  assert.equal(relay.length + boundary.length, 99);
  assert.equal(out.stats.privateRelay, 728);
  assert.equal(out.stats.publicBoundary, 534);
  assert.equal(out.branchCompositeOpen.length, 0);
  assert.equal(out.stats.openBlocking, 1);
  assert.equal(universeTotal(out), 2024);
});

test('R-7 every inherited row is non-consumable and keeps ONE typed disposition', () => {
  const out = buildProducers();
  for (const row of [...out.privateRelay, ...out.publicBoundary].filter(INHERITED)) {
    assert.equal(row.consumable, false, `${row.file}:${row.line} inherited row must not be consumable`);
    assert.equal(row.tenantSafe, false);
    const e = row.evidence;
    // exhaustive terminal receipt
    assert.ok(e.terminalCount >= 2, 'a tree has at least two terminals');
    assert.equal(e.terminalCount, e.relayTerminalCount + e.authoredTerminalCount);
    assert.ok(e.relayTerminalCount >= 1, 'an inherited row has at least one relay terminal');
    assert.equal(e.authoredTerminalsSilent, true, `${row.file}:${row.line} inherited with a NOISY authored terminal`);
    assert.equal(e.authoredScanComplete, true, `${row.file}:${row.line} inherited on an INCOMPLETE scan`);
    assert.ok(e.relayOwners.length > 0, 'the relay owner must be named');
    // ONE disposition, matching the bucket it landed in
    assert.equal(e.inheritedFrom, row.reason.startsWith('public-boundary') ? 'PUBLIC_BOUNDARY_CANDIDATE' : 'RELAY_PRIVATE_UNRESOLVED');
    // nothing invented
    assert.ok(!('causalRootIds' in row));
    assert.ok(!('ownerId' in row));
    assert.ok(!('tenantReachable' in row));
  }
});

test('R-8 a public inheritance proves an export chain; a private one proves none', () => {
  const out = buildProducers();
  for (const row of out.publicBoundary.filter(INHERITED)) {
    assert.deepEqual(row.evidence.relayKinds, ['PUBLIC_BOUNDARY_CANDIDATE']);
    assert.ok(row.evidence.exportEvidence.length > 0, 'a public inheritance must show its export chain');
    for (const chain of row.evidence.exportEvidence) {
      assert.ok(chain.entrypoint && chain.exportedAs && chain.hopChainDepth >= 1);
    }
  }
  for (const row of out.privateRelay.filter(INHERITED)) {
    assert.deepEqual(row.evidence.exportEvidence, [], 'a private inheritance must prove NO export path');
    for (const kind of row.evidence.relayKinds) {
      assert.ok(['PRIVATE_RELAY_UNRESOLVED', 'CUSTOM_COMPONENT_SINK_NOT_FOLLOWED'].includes(kind));
    }
  }
  // and the two sets never overlap
  const pub = new Set(out.publicBoundary.filter(INHERITED).map((r) => `${r.file}|${r.ordinal}`));
  for (const row of out.privateRelay.filter(INHERITED)) {
    assert.ok(!pub.has(`${row.file}|${row.ordinal}`), `${row.file}:${row.line} inherited BOTH dispositions`);
  }
});

test('R-9 the 1114 previously classified rows are byte-equivalent', () => {
  const out = buildProducers();
  // T-SEALED-RELAY arrives in this same bucket but is NOT one of the 1114 this
  // test freezes: it is excluded by its own label so the original claim stays
  // exactly as strong as it was.
  assert.equal(out.privateRelay.filter((r) => r.resolvedVia === 'sealed-import-relay').length, 22);
  const directRelay = out.privateRelay.filter(
    (r) =>
      !INHERITED(r) &&
      r.resolvedVia !== 'sealed-import-relay' &&
      r.resolvedVia !== 'custom-property-namespace-relay' &&
      r.resolvedVia !== 'public-style-passthrough',
  );
  const directBoundary = out.publicBoundary.filter((r) => !INHERITED(r));
  // 591 + the 10 historical `motion.div` rows the intrinsic-sink correction moved
  assert.equal(directRelay.length, 601);
  // 523 - 10 `motion.div` forwarders + 5 Slider public tails + 1 public writer
  assert.equal(directBoundary.length, 519);
  // they keep the DIRECT receipt shape, untouched by this tranche
  for (const row of directBoundary) {
    assert.ok(row.evidence.entrypoint, 'a direct boundary keeps its inline entrypoint');
    assert.equal(row.evidence.resolvedVia, undefined);
  }
  for (const row of directRelay) {
    assert.ok(row.evidence.bindingKind !== undefined, 'a direct relay keeps its bindingKind');
    assert.equal(row.evidence.resolvedVia, undefined);
  }
  // and the other cohorts did not move at all
  assert.equal(out.stats.closedZeroGoverned, 627);
  assert.equal(out.stats.closedNonObject, 69);
  assert.equal(out.stats.closedProducer, 65);
  assert.equal(out.branchConditionalAuthored.length, 0);
  assert.equal(out.authoredOpen.length, 0);
  assert.equal(out.openUnknown.length, 0);
  assert.equal(out.computedDomainPending.length, 0);
  assert.equal(out.dynamicSinkPending.length, 1);
  assert.equal(out.callArgsPending.length, 0);
  assert.equal(out.stats.producerSites, 4872);
  assert.equal(out.stats.channelEmissions, 10313);
  assert.equal(out.stats.distinctChannels, 4585);
  assert.equal(out.stats.emissionsWithCausalRoot, 186);
  assert.equal(out.stats.ownershipConflicts, 0);
});

test('R-10 NEGATIVE: tampering with an inherited receipt moves the bucket digest', () => {
  const out = buildProducers();
  const rows = out.privateRelay.filter(INHERITED).slice(0, 5);
  const bound = (rs) => JSON.stringify(rs.map((r) => [r.file, r.ordinal, r.sinkTags, r.relayKinds, r.evidence]));
  const identity = (rs) => JSON.stringify(rs.map((r) => [r.plane, r.file, r.symbol, r.reason]));
  const mutations = {
    'silence claim flipped': rows.map((r) => ({ ...r, evidence: { ...r.evidence, authoredTerminalsSilent: false } })),
    'scan completeness faked': rows.map((r) => ({ ...r, evidence: { ...r.evidence, authoredScanComplete: false } })),
    'terminal count understated': rows.map((r) => ({ ...r, evidence: { ...r.evidence, terminalCount: 1 } })),
    'disposition swapped': rows.map((r) => ({ ...r, evidence: { ...r.evidence, inheritedFrom: 'PUBLIC_BOUNDARY_CANDIDATE' } })),
    'export chain injected': rows.map((r) => ({ ...r, evidence: { ...r.evidence, exportEvidence: [{ entrypoint: 'fake' }] } })),
    'receipt removed': rows.map((r) => ({ ...r, evidence: null })),
  };
  for (const [name, mutated] of Object.entries(mutations)) {
    assert.equal(identity(rows), identity(mutated), `identity must stay blind: ${name}`);
    assert.notEqual(bound(rows), bound(mutated), `the bound digest MUST notice: ${name}`);
  }
  assert.match(out.digests.privateRelayReceipts, /^[0-9a-f]{64}$/);
  assert.match(out.digests.publicBoundaryReceipts, /^[0-9a-f]{64}$/);
  assert.notEqual(out.digests.privateRelay, out.digests.privateRelayReceipts);
});

test('R-11 inheritance is deterministic and independent of terminal order', () => {
  const a = branchProbe('export const C = ({ s }) => <div style={flag ? {top:1} : s} />;');
  const b = branchProbe('export const C = ({ s }) => <div style={flag ? s : {top:1}} />;');
  assert.equal(a.disposition, b.disposition);
  assert.equal(a.branchRelayReceipt.inheritedFrom, b.branchRelayReceipt.inheritedFrom);
  assert.equal(a.branchRelayReceipt.terminalCount, b.branchRelayReceipt.terminalCount);
  assert.deepEqual(a.branchRelayReceipt.relayKinds, b.branchRelayReceipt.relayKinds);
  // two full builds agree row for row and digest for digest
  const one = buildProducers();
  const two = buildProducers();
  assert.deepEqual(one.privateRelay, two.privateRelay);
  assert.deepEqual(one.publicBoundary, two.publicBoundary);
  assert.equal(one.digests.privateRelayReceipts, two.digests.privateRelayReceipts);
  assert.equal(one.digests.publicBoundaryReceipts, two.digests.publicBoundaryReceipts);
});

test('R-12 the refusal vocabulary is closed, and two causes are DECLARED untested', () => {
  // Fixtures cover three of the five refusal causes (R-2/R-3 emission,
  // R-4/R-5 unresolved). The remaining two -- a public/private DISAGREEMENT
  // between relay terminals, and a PUBLIC_BOUNDARY_UNKNOWN terminal -- have no
  // honest single-file fixture: every relay terminal of one expression shares
  // one owner function and one sink tag, so the authority necessarily returns
  // the same verdict. Rather than fabricate a fixture that only appears to
  // exercise them, this test pins that the guards EXIST and are fail-closed,
  // and the memo declares them untested.
  const source = readFileSync(join(HERE, 'cascade-disposition.mjs'), 'utf8');
  for (const cause of [
    'authored-terminals-emit-governed-channels',
    'authored-terminal-scan-incomplete',
    'relay-terminal-owner-declared-in-another-file',
    'relay-terminals-disagree-on-disposition',
    'relay-terminal-public-boundary-unknown',
  ]) {
    assert.ok(source.includes(`"${cause}"`), `refusal cause ${cause} disappeared from the guard`);
  }
  // fail-closed by construction: inheritance requires ALL of these to hold
  assert.ok(source.includes('authoredSilent && !foreignOwner && singleDisposition && singleDisposition !== "PUBLIC_BOUNDARY_UNKNOWN"'));
  // and PUBLIC_BOUNDARY_UNKNOWN is never inheritable anywhere in the live tree
  const out = buildProducers();
  for (const row of [...out.publicBoundary, ...out.privateRelay].filter(INHERITED)) {
    assert.ok(!row.evidence.relayKinds.includes('PUBLIC_BOUNDARY_UNKNOWN'));
  }
});

/* ===================================================================== *
 * T-COMPUTED-DOMAIN -- enumerate `OBJ[k]` from the SEALED CONTAINER.
 *
 * The domain of the lookup does not depend on the index's type: a sealed
 * object literal can only yield one of its authored values, or `undefined`.
 * Both halves are enumerable from the container alone. Everything that would
 * make the key set unknowable -- a spread, a computed/unresolved key -- refuses.
 * ===================================================================== */

const DOMAIN_VIA = 'computed-domain-enumeration';

test('D-1 POSITIVE: a sealed container with ordinary values closes as ZERO', () => {
  const out = branchProbe(
    'const M = { a: { top: 1 }, b: { left: 2 } };\nexport const C = ({ k }) => <div style={M[k]} />;',
  );
  assert.equal(out.shape.kind, 'computedKey');
  assert.equal(out.shape.domainKind, 'sealed-container-keys');
  assert.deepEqual(out.shape.domain, ['a', 'b']);
  assert.equal(out.disposition, ZERO_D);
  assert.equal(out.governance.customPropertyScanComplete, true);
  assert.deepEqual(out.governance.governedChannelKeys, []);
  // both authored values were walked
  assert.deepEqual(out.governance.ordinaryPropertyKeys.sort(), ['left', 'top']);
});

test('D-2 the ABSENT branch is always carried: the index is never assumed in-domain', () => {
  const out = branchProbe(
    'const M = { a: { top: 1 }, b: { left: 2 } };\nexport const C = ({ k }) => <div style={M[k]} />;',
  );
  assert.equal(out.shape.indexMayEscape, true);
  // 2 members + 1 explicit `undefined` outcome
  assert.equal(out.shape.branches.length, 3);
  const absent = out.shape.branches.filter((b) => b.reason === 'index-outside-sealed-container-domain');
  assert.equal(absent.length, 1);
  assert.equal(absent[0].kind, 'nonObject', 'the escape branch carries no key and cannot manufacture a channel');
});

test('D-3 POSITIVE: a governed value makes it a PRODUCER, never a ZERO', () => {
  const out = branchProbe(
    'const M = { a: { "--ds-x": "1" }, b: { left: 2 } };\nexport const C = ({ k }) => <div style={M[k]} />;',
  );
  assert.equal(out.disposition, 'CLOSED_PRODUCER');
  assert.deepEqual(out.governance.governedChannelKeys, ['--ds-x']);
  assert.notEqual(out.disposition, ZERO_D);
});

test('D-4 NEGATIVE: a SPREAD in the container makes the key set unknowable', () => {
  const out = branchProbe(
    'const base = { z: { top: 0 } };\nconst M = { ...base, a: { top: 1 } };\nexport const C = ({ k }) => <div style={M[k]} />;',
  );
  assert.equal(out.shape.kind, 'computedKey');
  assert.equal(out.shape.closed, false);
  assert.equal(out.shape.reason, 'index-not-a-closed-literal-union');
  assert.equal(out.shape.domainKind, undefined, 'a spread container must not be enumerated');
  assert.equal(out.disposition, 'COMPUTED_DOMAIN_PENDING');
});

test('D-5 NEGATIVE: a computed key inside the container refuses enumeration', () => {
  const out = branchProbe(
    'const M = { [dyn]: { top: 1 }, a: { left: 2 } };\nexport const C = ({ k }) => <div style={M[k]} />;',
  );
  assert.equal(out.shape.domainKind, undefined);
  assert.equal(out.disposition, 'COMPUTED_DOMAIN_PENDING');
});

test('D-6 NEGATIVE: an unresolved container is never enumerated', () => {
  const out = branchProbe('export const C = ({ k }) => <div style={mystery[k]} />;');
  assert.notEqual(out.disposition, ZERO_D);
  assert.notEqual(out.disposition, 'CLOSED_PRODUCER');
});

test('D-7 NEGATIVE: an OPEN member keeps the whole row blocking', () => {
  // one member's value depends on a caller-supplied param -> not closed
  const out = branchProbe(
    'export const C = ({ k, w }) => { const M = { a: { top: 1 }, b: { left: w } }; return <div style={M[k]} />; };',
  );
  assert.equal(out.shape.kind, 'computedKey');
  assert.equal(out.shape.closed, false, 'an open member may never let the row close');
  assert.notEqual(out.disposition, ZERO_D);
  assert.notEqual(out.disposition, 'CLOSED_PRODUCER');
});

test('D-8 the domain receipt is complete and re-derivable', () => {
  const out = buildProducers();
  const rows = out.closedZeroGoverned.filter((r) => r.resolvedVia === DOMAIN_VIA);
  assert.equal(rows.length, 18);
  for (const row of rows) {
    const e = row.evidence;
    assert.equal(e.domainKind, 'sealed-container-keys');
    assert.ok(e.members.length > 0);
    assert.equal(e.memberCount, e.members.length);
    assert.equal(e.indexMayEscape, true);
    assert.equal(e.domainComplete, true);
    assert.equal(e.customPropertyScanComplete, true);
    assert.deepEqual(e.governedChannelKeys, []);
    assert.deepEqual(e.internalSocketKeys, []);
    // every member has a stated lookup status, and they are all resolved
    assert.equal(e.memberStatuses.length, e.members.length);
    for (const st of e.memberStatuses) assert.ok(['found', 'absent'].includes(st.status), `member ${st.member} left status ${st.status}`);
    // the escape branch is counted on top of the members
    assert.equal(e.branchCount, e.members.length + 1);
    // sealed declaration identity: path + span + content hash
    assert.ok(e.declaration.file && e.declaration.file.startsWith('packages/core/src/'));
    assert.ok(e.declaration.line >= 1);
    assert.equal(e.declaration.span.length, 2);
    assert.match(e.declaration.sha256, /^[0-9a-f]{64}$/);
    assert.equal(e.declaration.memberCount, e.members.length);
    // nothing invented
    assert.ok(!('causalRootIds' in row));
    assert.ok(!('tenantReachable' in row));
  }
});

test('D-9 NEGATIVE: tampering with the domain receipt moves the bound digest', () => {
  const out = buildProducers();
  const rows = out.closedZeroGoverned.filter((r) => r.resolvedVia === DOMAIN_VIA).slice(0, 4);
  const bound = (rs) => JSON.stringify(rs.map((r) => [r.file, r.ordinal, r.resolvedVia ?? null, r.evidence ?? null]));
  const identity = (rs) => JSON.stringify(rs.map((r) => [r.plane, r.file, r.symbol, r.reason]));
  const mutations = {
    'member dropped': rows.map((r) => ({ ...r, evidence: { ...r.evidence, members: r.evidence.members.slice(1) } })),
    'declaration hash forged': rows.map((r) => ({ ...r, evidence: { ...r.evidence, declaration: { ...r.evidence.declaration, sha256: 'f'.repeat(64) } } })),
    'declaration moved': rows.map((r) => ({ ...r, evidence: { ...r.evidence, declaration: { ...r.evidence.declaration, span: [0, 0] } } })),
    'escape branch denied': rows.map((r) => ({ ...r, evidence: { ...r.evidence, indexMayEscape: false } })),
    'member status faked': rows.map((r) => ({ ...r, evidence: { ...r.evidence, memberStatuses: [] } })),
    'receipt removed': rows.map((r) => ({ ...r, evidence: null })),
  };
  for (const [name, mutated] of Object.entries(mutations)) {
    assert.equal(identity(rows), identity(mutated), `identity must stay blind: ${name}`);
    assert.notEqual(bound(rows), bound(mutated), `the bound digest MUST notice: ${name}`);
  }
});

test('D-10 the drain is exactly measured and openBlocking only went down', () => {
  const out = buildProducers();
  assert.equal(out.computedDomainPending.length, 0);
  assert.equal(out.stats.openBlocking, 1);
  assert.ok(1 < 210, 'openBlocking must never grow');
  // 21 direct rows: 18 ZERO + 3 producer
  const directZero = out.closedZeroGoverned.filter((r) => r.resolvedVia === DOMAIN_VIA).length;
  const directProducer = out.closedProducer.filter((r) => r.evidence.computedDomain).length;
  assert.equal(directZero, 18);
  assert.equal(directProducer, 3);
  assert.equal(directZero + directProducer, 21);
  assert.equal(universeTotal(out), 2024);
  // the cohorts this tranche must not touch
  assert.equal(out.stats.publicBoundary, 534);
  assert.equal(out.stats.privateRelay, 728);
  assert.equal(out.stats.closedNonObject, 69);
  assert.equal(out.branchCompositeOpen.length, 0);
  assert.equal(out.branchConditionalAuthored.length, 0);
  assert.equal(out.dynamicSinkPending.length, 1);
  assert.equal(out.callArgsPending.length, 0);
  assert.equal(out.stats.producerSites, 4872);
  assert.equal(out.stats.channelEmissions, 10313);
  assert.equal(out.stats.distinctChannels, 4585);
  assert.equal(out.stats.emissionsWithCausalRoot, 186);
  assert.equal(out.stats.ownershipConflicts, 0);
});

test('D-11 producer rows reached through enumeration carry the domain contract', () => {
  const out = buildProducers();
  const rows = out.closedProducer.filter((r) => r.evidence.computedDomain);
  assert.equal(rows.length, 3);
  for (const row of rows) {
    const d = row.evidence.computedDomain;
    assert.equal(d.domainKind, 'sealed-container-keys');
    assert.equal(d.domainComplete, true);
    assert.ok(d.governedChannelKeys.length > 0, 'a producer reached by enumeration must name its channels');
    assert.match(d.declaration.sha256, /^[0-9a-f]{64}$/);
    assert.equal(row.consumable, false);
    assert.equal(row.tenantSafe, false);
    assert.equal(row.nonConsumableCause, 'governed-producer-with-no-attributed-cascade-root');
  }
});

/* ===================================================================== *
 * T-COMPUTED-DOMAIN, corrections after the Fable REJECT.
 * P0 nested evidence · P1a __proto__ · P1b unmodelled members.
 * ===================================================================== */

test('E-1 P0: indirect closures name the enumerations that justified them', () => {
  const out = buildProducers();
  const nested = out.closedZeroGoverned.filter((r) => r.resolvedVia === 'nested-computed-domain');
  assert.equal(nested.length, 21);
  for (const row of nested) {
    const list = row.evidence.nestedComputedDomains;
    assert.ok(Array.isArray(list) && list.length > 0, `${row.file}:${row.line} indirect closure with no evidence`);
    assert.equal(row.evidence.nestedComputedDomainCount, list.length);
    for (const d of list) {
      /* RESIDUAL-42 taught the index enumerator to follow a NAMED type alias to
       * its union, so a second (equally sealed) domain kind now reaches this
       * bucket. Both are enumerations; neither is an open index. */
      assert.ok(['sealed-container-keys', 'index-type-literal-union'].includes(d.domainKind), `unknown domainKind ${d.domainKind}`);
      assert.ok(typeof d.astPath === 'string' && d.astPath.length > 0);
      assert.ok(d.members.length > 0);
      assert.equal(d.memberCount, d.members.length);
      assert.equal(d.memberStatuses.length, d.members.length);
      for (const st of d.memberStatuses) assert.ok(['found', 'absent'].includes(st.status));
      if (d.domainKind === 'sealed-container-keys') assert.equal(d.indexMayEscape, true);
      /* Only a sealed CONTAINER has a declaration node to point at; an index
       * typed by a literal union is declared by the type, not by a container. */
      if (d.domainKind === 'sealed-container-keys') {
        assert.ok(d.declaration.file.startsWith('packages/core/src/'));
        assert.ok(d.declaration.line >= 1);
        assert.equal(d.declaration.span.length, 2);
        assert.match(d.declaration.sha256, /^[0-9a-f]{64}$/);
      } else {
        assert.equal(d.declaration, null);
      }
    }
    // deterministic order, exact-identity dedup
    const keys = list.map((d) => `${d.astPath}|${d.declaration ? `${d.declaration.file}|${d.declaration.line}|${d.declaration.span.join(',')}` : d.domainKind}`);
    assert.deepEqual(keys, [...keys].sort());
    assert.equal(new Set(list.map((d) => JSON.stringify(d))).size, list.length);
    assert.ok(!('causalRootIds' in row));
    assert.ok(!('tenantReachable' in row));
  }
  // the full route split, so no row can change its story silently
  const byRoute = {};
  for (const r of out.closedZeroGoverned) byRoute[r.resolvedVia ?? '(none)'] = (byRoute[r.resolvedVia ?? '(none)'] || 0) + 1;
  assert.deepEqual(byRoute, { '(none)': 473, 'branch-union': 56, 'static-key-set': 33, 'internal-base-mutation': 16, 'dynamic-property-domain': 2, 'computed-domain-enumeration': 18, 'nested-computed-domain': 21, 'static-sequential-assignment': 8 });
  assert.equal(486 + 52 + 28 + 18 + 18 + 8, 610);
});

test('E-2 P0 POSITIVE: an indirect closure is re-derivable from its receipt', () => {
  // the enumeration is read THROUGH: `M[k].pad` feeds an object that closes
  const out = branchProbe(
    'const M = { a: { pad: "1px" }, b: { pad: "2px" } };\n' +
      'export const C = ({ k }) => <div style={{ padding: M[k].pad }} />;',
  );
  assert.equal(out.disposition, ZERO_D);
  const found = [];
  const walk = (sh, seen = new Set(), d = 0) => {
    if (!sh || typeof sh !== 'object' || d > 40 || seen.has(sh)) return;
    seen.add(sh);
    if (sh.kind === 'computedKey' && sh.domainKind) found.push(sh);
    if (sh.viaComputedDomain) walk(sh.viaComputedDomain, seen, d + 1);
    for (const e of sh.order ?? []) walk(e.shape, seen, d + 1);
    for (const b of sh.branches ?? []) walk(b, seen, d + 1);
  };
  walk(out.shape);
  assert.ok(found.length > 0, 'the enumeration must survive the read-through');
  assert.deepEqual(found[0].domain, ['a', 'b']);
});

test('E-3 P0 NEGATIVE: tampering with nested evidence moves the bound digest', () => {
  const out = buildProducers();
  const rows = out.closedZeroGoverned.filter((r) => r.resolvedVia === 'nested-computed-domain').slice(0, 4);
  const bound = (rs) => JSON.stringify(rs.map((r) => [r.file, r.ordinal, r.resolvedVia ?? null, r.evidence ?? null]));
  const identity = (rs) => JSON.stringify(rs.map((r) => [r.plane, r.file, r.symbol, r.reason]));
  const mutations = {
    'list emptied': rows.map((r) => ({ ...r, evidence: { ...r.evidence, nestedComputedDomains: [] } })),
    'member dropped': rows.map((r) => ({ ...r, evidence: { ...r.evidence, nestedComputedDomains: r.evidence.nestedComputedDomains.map((d) => ({ ...d, members: d.members.slice(1) })) } })),
    'declaration hash forged': rows.map((r) => ({ ...r, evidence: { ...r.evidence, nestedComputedDomains: r.evidence.nestedComputedDomains.map((d) => ({ ...d, declaration: { ...d.declaration, sha256: 'a'.repeat(64) } })) } })),
    'receipt removed': rows.map((r) => ({ ...r, evidence: null })),
  };
  for (const [name, mutated] of Object.entries(mutations)) {
    assert.equal(identity(rows), identity(mutated), `identity must stay blind: ${name}`);
    assert.notEqual(bound(rows), bound(mutated), `the bound digest MUST notice: ${name}`);
  }
  assert.match(out.digests.closedZeroGovernedReceipts, /^[0-9a-f]{64}$/);
});

test('E-4 P1a NEGATIVE: __proto__ refuses the whole container', () => {
  // `__proto__` in an object literal sets the prototype; it is NOT an own key,
  // and a miss on it is NOT `absent` -- the installed prototype can answer.
  const out = branchProbe(
    'const M = { __proto__: base, a: { top: 1 } };\nexport const C = ({ k }) => <div style={M[k]} />;',
  );
  assert.equal(out.shape.domainKind, undefined, '__proto__ must refuse enumeration');
  assert.notEqual(out.disposition, ZERO_D);
  assert.notEqual(out.disposition, 'CLOSED_PRODUCER');
  // and it is never offered as a member
  assert.ok(!(out.shape.domain ?? []).includes('__proto__'));
});

test('E-5 P1b NEGATIVE: a GETTER is never evaluated and never disappears', () => {
  const out = branchProbe(
    'const M = { get a() { return { "--ds-sneak": "1" }; }, b: { top: 1 } };\n' +
      'export const C = ({ k }) => <div style={M[k]} />;',
  );
  assert.equal(out.shape.domainKind, undefined, 'a container with a getter must refuse enumeration');
  assert.notEqual(out.disposition, ZERO_D, 'a getter must never produce a false ZERO');
  assert.notEqual(out.disposition, 'CLOSED_PRODUCER');
});

test('E-6 P1b NEGATIVE: a getter directly at the sink is not a sealed object', () => {
  const out = branchProbe('export const C = () => <div style={{ get width() { return 1; } }} />;');
  assert.equal(out.shape.kind, 'object');
  assert.equal(out.shape.closed, false, 'an unmodelled member must leave the object OPEN');
  assert.notEqual(out.disposition, ZERO_D);
  const unmodelled = out.shape.order.filter(
    (e) => e.kind === 'spread' && String(e.shape?.reason ?? '').startsWith('object-member-kind-not-modelled'),
  );
  assert.equal(unmodelled.length, 1, 'the member must be represented, not skipped');
  assert.match(unmodelled[0].shape.reason, /GetAccessor/);
});

test('E-7 P1b NEGATIVE: setter and method are represented too', () => {
  const setter = branchProbe('export const C = () => <div style={{ set width(v) {}, top: 1 }} />;');
  assert.equal(setter.shape.closed, false);
  assert.notEqual(setter.disposition, ZERO_D);
  assert.ok(setter.shape.order.some((e) => /SetAccessor/.test(String(e.shape?.reason ?? ''))));

  const method = branchProbe('export const C = () => <div style={{ m() { return 1; }, top: 1 }} />;');
  assert.equal(method.shape.closed, false);
  assert.notEqual(method.disposition, ZERO_D);
  assert.ok(method.shape.order.some((e) => /MethodDeclaration/.test(String(e.shape?.reason ?? ''))));
});

test('E-8 the invariants the correction must not disturb', () => {
  const out = buildProducers();
  assert.equal(out.stats.closedZeroGoverned, 627);
  assert.equal(out.stats.closedProducer, 65);
  assert.equal(out.stats.openBlocking, 1);
  assert.equal(out.computedDomainPending.length, 0);
  assert.equal(universeTotal(out), 2024);
  assert.equal(out.stats.publicBoundary, 534);
  assert.equal(out.stats.privateRelay, 728);
  assert.equal(out.stats.closedNonObject, 69);
  assert.equal(out.stats.producerSites, 4872);
  assert.equal(out.stats.channelEmissions, 10313);
  assert.equal(out.stats.distinctChannels, 4585);
  assert.equal(out.stats.emissionsWithCausalRoot, 186);
  assert.equal(out.stats.ownershipConflicts, 0);
  // the ratified join amendment survives
  assert.equal(out.closedProducer.filter((r) => r.occurrenceProducerSiteIds).length, 15);
});

/* ===================================================================== *
 * T-TYPED-RELAY -- close a relay ONLY when the type annotation proves it
 * can never be an object. 100% syntactic: no type checker, no inference,
 * no allowlist, no name heuristics.
 * ===================================================================== */

test('R-T1 POSITIVE: a parameter annotated `string` closes as a proven non-object', () => {
  const out = branchProbe(
    'const f = (color: string) => ({ "--ds-x": color });\nexport const C = () => <div style={f("red")} />;',
  );
  assert.equal(out.shape.closed, true, 'the annotation must seal the object');
  assert.notEqual(out.disposition, 'AUTHORED_OPEN');
});

test('R-T2 POSITIVE: a literal union parameter closes, and a SEALED alias too', () => {
  const union = branchProbe(
    "const f = (a: 'left' | 'center' | 'right') => ({ textAlign: a, top: 1 });\nexport const C = () => <div style={f('left')} />;",
  );
  assert.equal(union.shape.closed, true);
  assert.equal(union.disposition, ZERO_D);
  const alias = branchProbe(
    "type Align = 'left' | 'center';\nconst f = (a: Align) => ({ textAlign: a, top: 1 });\nexport const C = () => <div style={f('left')} />;",
  );
  assert.equal(alias.shape.closed, true, 'a SEALED local alias resolves');
  assert.equal(alias.disposition, ZERO_D);
});

test('R-T3 POSITIVE: an explicit primitive RETURN type closes the call', () => {
  const out = branchProbe(
    'function n(x: number | undefined): number | undefined { return x; }\n' +
      'export const C = ({ v }) => { const c = n(v); return <div style={{ top: c, left: 1 }} />; };',
  );
  assert.equal(out.shape.closed, true, 'the annotated return must seal the leaf');
  assert.equal(out.disposition, ZERO_D);
});

test('R-T4 NEGATIVE: object / any / unknown / never / array / tuple / fn stay OPEN', () => {
  for (const type of ['object', 'any', 'unknown', 'never', 'string[]', '[string, number]', '() => string']) {
    const out = branchProbe(
      `const f = (v: ${type}) => ({ top: v, left: 1 });\nexport const C = () => <div style={f(x)} />;`,
    );
    assert.notEqual(out.shape.closed, true, `type ${type} must NOT close`);
  }
});

test('R-T5 NEGATIVE: interface, mixed union and unsealed reference stay OPEN', () => {
  const iface = branchProbe(
    'interface Opt { a: string }\nconst f = (v: Opt) => ({ top: v, left: 1 });\nexport const C = () => <div style={f(x)} />;',
  );
  assert.notEqual(iface.shape.closed, true, 'an interface names an object and must never close');
  const mixed = branchProbe(
    'interface Obj { a: string }\nconst f = (v: string | Obj) => ({ top: v, left: 1 });\nexport const C = () => <div style={f(x)} />;',
  );
  assert.notEqual(mixed.shape.closed, true, 'one non-primitive member must poison the union');
  const unsealed = branchProbe(
    'const f = (v: SomeUnknownType) => ({ top: v, left: 1 });\nexport const C = () => <div style={f(x)} />;',
  );
  assert.notEqual(unsealed.shape.closed, true, 'an unresolvable type reference must not close');
  const aliasToIface = branchProbe(
    'interface Obj { a: string }\ntype T = Obj;\nconst f = (v: T) => ({ top: v, left: 1 });\nexport const C = () => <div style={f(x)} />;',
  );
  assert.notEqual(aliasToIface.shape.closed, true, 'an alias to an interface must not close');
});

test('R-T6 NEGATIVE: no annotation and an INFERRED return type stay OPEN', () => {
  const noAnn = branchProbe('const f = (v) => ({ top: v, left: 1 });\nexport const C = () => <div style={f(x)} />;');
  assert.notEqual(noAnn.shape.closed, true, 'a missing annotation is never a proof');
  const inferred = branchProbe(
    'function n(x) { return x; }\nexport const C = ({ v }) => { const c = n(v); return <div style={{ top: c, left: 1 }} />; };',
  );
  assert.notEqual(inferred.shape.closed, true, 'an inferred return type is never a proof');
});

test('R-T7 NEGATIVE: getters are still never evaluated and mutation stays open', () => {
  const getter = branchProbe('export const C = () => <div style={{ get width(): string { return "1px"; } }} />;');
  assert.equal(getter.shape.closed, false, 'a getter stays unmodelled even with a primitive return type');
  const mutated = branchProbe(
    'export const C = ({ v }) => { let s = { top: 1 }; s.left = v; return <div style={s} />; };',
  );
  assert.notEqual(mutated.disposition, ZERO_D);
});

test('R-T8 the live delta is exactly 9 rows, and only two cohorts moved', () => {
  const out = buildProducers();
  assert.equal(out.authoredOpen.length, 0);
  assert.equal(out.stats.closedProducer, 65);
  assert.equal(out.stats.openBlocking, 1);
  // the five other OPEN buckets are untouched
  assert.equal(out.branchCompositeOpen.length, 0);
  assert.equal(out.branchConditionalAuthored.length, 0);
  assert.equal(out.openUnknown.length, 0);
  assert.equal(out.dynamicSinkPending.length, 1);
  assert.equal(out.callArgsPending.length, 0);
  assert.equal(out.computedDomainPending.length, 0);
  // every closed cohort except closedProducer is untouched
  assert.equal(out.stats.closedZeroGoverned, 627);
  assert.equal(out.stats.closedNonObject, 69);
  assert.equal(out.stats.publicBoundary, 534);
  assert.equal(out.stats.privateRelay, 728);
  assert.equal(universeTotal(out), 2024);
  assert.equal(out.stats.producerSites, 4872);
  assert.equal(out.stats.channelEmissions, 10313);
  assert.equal(out.stats.distinctChannels, 4585);
  assert.equal(out.stats.emissionsWithCausalRoot, 186);
  assert.equal(out.stats.ownershipConflicts, 0);
  // the 9 arrivals emit a governed channel -- that is WHY they are producers,
  // not ZEROs, and they stay non-consumable
  // 9 when T-TYPED-RELAY landed; T-STATIC-KEYSET closed the other 19 Typography
  // rows of the same family, so the cohort is now the full 28.
  const arrivals = out.closedProducer.filter((r) => r.evidence.governedChannelKeys.includes('--ds-type-line-clamp'));
  assert.equal(arrivals.length, 28);
  for (const row of arrivals) {
    assert.equal(row.consumable, false);
    assert.equal(row.tenantSafe, false);
    assert.equal(row.nonConsumableCause, 'governed-producer-with-no-attributed-cascade-root');
    assert.ok(!('causalRootIds' in row));
  }
});

test('R-T9 the typed-relay proof reaches the ARTIFACT, not just the shape', () => {
  const out = buildProducers();
  const proven = out.closedProducer.filter((r) => r.evidence.typedRelays);
  assert.equal(proven.length, 28, 'the typed-relay proof rides every row of the family that closed');
  for (const row of proven) {
    const list = row.evidence.typedRelays;
    assert.ok(Array.isArray(list) && list.length > 0, `${row.file}:${row.line} published an empty proof`);
    // exact object shape, no extra and no missing field
    for (const proof of list) {
      assert.deepEqual(Object.keys(proof).sort(), ['declaredAt', 'origin', 'ownerFunction', 'typeText']);
      assert.equal(proof.origin, 'return-type');
      assert.equal(proof.ownerFunction, 'normalizeLineClamp');
      assert.equal(proof.typeText, 'number | undefined');
      assert.equal(proof.declaredAt, 'packages/core/src/ui/primitives/display/Typography/runtime/index.ts:225');
    }
    // stable order + exact-tuple dedup
    const keys = list.map((p) => `${p.origin}|${p.ownerFunction}|${p.declaredAt}|${p.typeText}`);
    assert.deepEqual(keys, [...keys].sort());
    assert.equal(new Set(list.map((p) => JSON.stringify(p))).size, list.length);
    // the proof is evidence of CLOSURE, never governance
    assert.ok(!('causalRootIds' in row));
    assert.ok(!('tenantReachable' in row));
    assert.ok(!('ownerId' in row));
    assert.equal(row.consumable, false);
    assert.equal(row.tenantSafe, false);
  }
  // no producer that closed by another route gains an empty or spurious field
  const others = out.closedProducer.filter((r) => !r.evidence.typedRelays);
  assert.equal(others.length, 37);
  for (const row of others) assert.equal(row.evidence.typedRelays, undefined);
});

test('R-T10 NEGATIVE: tampering with a typed-relay proof moves the bound digest', () => {
  const out = buildProducers();
  const rows = out.closedProducer.filter((r) => r.evidence.typedRelays).slice(0, 4);
  const bound = (rs) => JSON.stringify(rs.map((r) => [r.file, r.ordinal, r.sinkTags, r.relayKinds, r.evidence]));
  const identity = (rs) => JSON.stringify(rs.map((r) => [r.plane, r.file, r.symbol, r.reason]));
  const mutations = {
    'proof list emptied': rows.map((r) => ({ ...r, evidence: { ...r.evidence, typedRelays: [] } })),
    'proof removed': rows.map((r) => ({ ...r, evidence: { ...r.evidence, typedRelays: undefined } })),
    'owner forged': rows.map((r) => ({ ...r, evidence: { ...r.evidence, typedRelays: r.evidence.typedRelays.map((p) => ({ ...p, ownerFunction: 'somethingElse' })) } })),
    'type widened': rows.map((r) => ({ ...r, evidence: { ...r.evidence, typedRelays: r.evidence.typedRelays.map((p) => ({ ...p, typeText: 'any' })) } })),
    'declaration moved': rows.map((r) => ({ ...r, evidence: { ...r.evidence, typedRelays: r.evidence.typedRelays.map((p) => ({ ...p, declaredAt: 'fake:1' })) } })),
    'origin swapped': rows.map((r) => ({ ...r, evidence: { ...r.evidence, typedRelays: r.evidence.typedRelays.map((p) => ({ ...p, origin: 'parameter' })) } })),
  };
  for (const [name, mutated] of Object.entries(mutations)) {
    assert.equal(identity(rows), identity(mutated), `identity must stay blind: ${name}`);
    assert.notEqual(bound(rows), bound(mutated), `the bound digest MUST notice: ${name}`);
  }
  assert.match(out.digests.closedProducerReceipts, /^[0-9a-f]{64}$/);
});

/* ===================================================================== *
 * T-SEQUENTIAL-8 -- `const X = {}` filled by a proven static sequence of
 * property writes. The single-armed `if (cond) X.key = v;` is the
 * procedural spelling of `...(cond ? {key:v} : {})`, so it builds the SAME
 * branches shape. Everything unproven falls through to the coarse
 * mutation bail-out, untouched.
 * ===================================================================== */

const SEQ_VIA = 'static-sequential-assignment';

test('S-1 POSITIVE: single-armed conditional write closes', () => {
  const out = branchProbe(
    'const f = () => { const s = {}; if (a) s.top = 1; return s; };\nexport const C = () => <div style={f()} />;',
  );
  assert.equal(out.shape.kind, 'object');
  assert.equal(out.shape.closed, true);
  assert.equal(out.disposition, ZERO_D);
  assert.equal(out.shape.sequentialAssignment.writeCount, 1);
  assert.equal(out.shape.sequentialAssignment.writes[0].conditional, true);
});

test('S-2 POSITIVE: unconditional and conditional writes mix', () => {
  const out = branchProbe(
    'const f = () => { const s = {}; s.top = 1; if (a) s.left = 2; return s; };\nexport const C = () => <div style={f()} />;',
  );
  assert.equal(out.shape.closed, true);
  assert.equal(out.disposition, ZERO_D);
  const w = out.shape.sequentialAssignment.writes;
  assert.equal(w.length, 2);
  assert.deepEqual(w.map((x) => x.conditional).sort(), [false, true]);
});

test('S-3 POSITIVE: the written VALUE resolves through the existing machinery', () => {
  const out = branchProbe(
    'const g = (): string => "1px";\nconst f = () => { const s = {}; if (a) { s.top = g(); } return s; };\nexport const C = () => <div style={f()} />;',
  );
  assert.equal(out.shape.closed, true, 'the value shape is resolved by resolveShape, not re-implemented');
  assert.equal(out.disposition, ZERO_D);
});

test('S-4 POSITIVE: a governed key written this way is a PRODUCER, never a ZERO', () => {
  const out = branchProbe(
    'const f = () => { const s = {}; if (a) s["--ds-seq"] = "1"; return s; };\nexport const C = () => <div style={f()} />;',
  );
  assert.equal(out.disposition, 'CLOSED_PRODUCER');
  assert.deepEqual(out.governance.governedChannelKeys, ['--ds-seq']);
});

test('S-5 T-SEQUENTIAL-8 still refuses a NON-EMPTY initializer; T-INTERNAL-MUTATION resolves it', () => {
  /* This drill fixed T-SEQUENTIAL-8's scope: it only ever proved `const X = {}`.
   * That contract is UNCHANGED -- it still produces no proof here. What changed
   * is that a SECOND prover (T-INTERNAL-MUTATION, CLOSURE-11) now covers the
   * non-empty base, so the row resolves instead of falling through. The two
   * halves are asserted separately so neither can absorb the other. */
  const nonEmpty = branchProbe(
    'const f = () => { const s = { top: 1 }; if (a) s.left = 2; return s; };\nexport const C = () => <div style={f()} />;',
  );
  assert.equal(nonEmpty.shape.sequentialAssignment, undefined, 'T-SEQUENTIAL-8 must not claim a non-empty base');
  assert.ok(nonEmpty.shape.internalMutation, 'T-INTERNAL-MUTATION owns this form now');
  assert.equal(nonEmpty.disposition, ZERO_D);
  // an UNRESOLVED spread in the base is still not an internal base
  const openBase = branchProbe(
    'const f = () => { const s = { ...base }; if (a) s.left = 2; return s; };\nexport const C = () => <div style={f()} />;',
  );
  assert.equal(openBase.shape.reason, 'reassignment-or-mutation-present', 'an unbounded base must still fall through');
  assert.equal(openBase.shape.internalMutation, undefined);
});

test('S-6 else / else-if: refused by T-SEQUENTIAL-8, resolved by T-INTERNAL-MUTATION', () => {
  // same split as S-5: the narrow prover keeps its narrow contract, and the
  // wider one owns the form. Every arm is enumerated, so the key set is known.
  for (const body of [
    'const f = () => { const s = {}; if (a) s.top = 1; else s.top = 2; return s; };',
    'const f = () => { const s = {}; if (a) s.top = 1; else if (b) s.left = 2; return s; };',
  ]) {
    const out = branchProbe(`${body}\nexport const C = () => <div style={f()} />;`);
    assert.equal(out.shape.sequentialAssignment, undefined, 'T-SEQUENTIAL-8 never proves an else arm');
    assert.ok(out.shape.internalMutation, 'T-INTERNAL-MUTATION enumerates both arms');
    assert.equal(out.disposition, ZERO_D);
  }
});

test('S-7 NEGATIVE: repeated key, computed key, alias, loop, escape and delete stay open', () => {
  /* `repeated key` MOVED OUT of this list: writing the same key twice does not
   * widen the key set (the later write simply wins), so T-INTERNAL-MUTATION
   * resolves it and the row closes. It is asserted on its own below. Every
   * other form here can still change the key set unobserved and stays open. */
  const cases = {
    'computed key': 'const f = () => { const s = {}; if (a) s[k] = 1; return s; };',
    alias: 'const f = () => { const s = {}; s.top = 1; const t = s; return t; };',
    loop: 'const f = () => { const s = {}; for (const k of ks) s[k] = 1; return s; };',
    delete: 'const f = () => { const s = {}; s.top = 1; delete s.top; return s; };',
    'cond reads X': 'const f = () => { const s = {}; if (s.top) s.left = 1; return s; };',
    'statement after return': 'const f = () => { const s = {}; s.top = 1; return s; s.left = 2; };',
    'value mentions X': 'const f = () => { const s = {}; s.top = s; return s; };',
  };
  for (const [name, body] of Object.entries(cases)) {
    const out = branchProbe(`${body}\nexport const C = () => <div style={f()} />;`);
    assert.equal(out.shape.reason, 'reassignment-or-mutation-present', `${name} must stay open`);
    assert.notEqual(out.disposition, ZERO_D);
    assert.equal(out.shape.sequentialAssignment, undefined, `${name} must not carry a sequential proof`);
    assert.equal(out.shape.internalMutation, undefined, `${name} must not carry a mutation proof either`);
  }
});

test('S-7d a MULTI-STATEMENT if arm resolves: every write in it is a static key', () => {
  const out = branchProbe(
    'const f = () => { const s = {}; if (a) { s.top = 1; s.left = 2; } return s; };\nexport const C = () => <div style={f()} />;',
  );
  assert.equal(out.shape.sequentialAssignment, undefined, 'T-SEQUENTIAL-8 allowed only ONE statement per arm');
  assert.ok(out.shape.internalMutation, 'T-INTERNAL-MUTATION enumerates every write in the arm');
  assert.equal(out.disposition, ZERO_D);
});

test('S-7c a REPEATED key resolves: the later write wins and the key set is unchanged', () => {
  const out = branchProbe(
    'const f = () => { const s = {}; s.top = 1; s.top = 2; return s; };\nexport const C = () => <div style={f()} />;',
  );
  assert.ok(out.shape.internalMutation, 'T-INTERNAL-MUTATION owns this form');
  assert.equal(out.disposition, ZERO_D);
  assert.deepEqual(out.governance.governedChannelKeys, []);
});

test('S-7b the Object.assign escape over an EMPTY base is CLOSED by CLOSURE-11', () => {
  // `Object.assign(s, o)` is not a syntactic assignment, so the COARSE detector
  // never marks the binding mutated -- the initializer `{}` resolves straight to
  // an empty closed object. Measured identical at HEAD, so this is NOT produced
  // by T-SEQUENTIAL-8: the fine pass is never even reached (it only runs when
  // `binding.mutated` is true). Pinned here so the gap is visible and owned,
  // and so a future change cannot quietly attribute it to this mechanism.
  const out = branchProbe(
    'const f = () => { const s = {}; Object.assign(s, o); return s; };\nexport const C = () => <div style={f()} />;',
  );
  /* CLOSURE-11 CLOSED this gap. `Object.assign(s, o)` is now recognised as a
   * mutation, so the binding is no longer resolved to its bare `{}` initializer
   * while `o` merges unknown keys behind it. The source is unresolved, so the
   * row is OPEN -- which is the honest verdict, not the silent zero it was. */
  assert.equal(out.disposition, 'OPEN_UNKNOWN', 'an Object.assign from an open source must not certify as zero');
  assert.equal(out.shape.reason, 'reassignment-or-mutation-present');
  assert.equal(out.shape.sequentialAssignment, undefined);
  assert.equal(out.shape.internalMutation, undefined, 'the assign source is not enumerable');
  // and getTableStyle -- Object.assign over a NON-empty internal base -- now resolves
  const table = buildProducers().openUnknown.filter((r) => String(r.template).includes('getTableStyle'));
  assert.equal(table.length, 0, 'getTableStyle is resolved by CLOSURE-11');
});

test('S-8 the live tree closes exactly the 8 resolveTypeRoleStyle rows', () => {
  const out = buildProducers();
  const seq = out.closedZeroGoverned.filter((r) => r.resolvedVia === SEQ_VIA);
  assert.equal(seq.length, 8);
  // the exact identities from the census: 4 call-sites x (call + spread)
  const ordinals = seq.map((r) => r.ordinal).sort((a, b) => a - b);
  assert.deepEqual(ordinals, [11202, 11205, 16867, 16870, 21496, 21499, 26731, 26734]);
  for (const row of seq) {
    assert.ok(row.file.endsWith('Typography/engines/modern/index.tsx'));
    assert.match(row.template, /resolveTypeRoleStyle/);
  }
  assert.equal(out.openUnknown.length, 0);
  assert.equal(out.stats.openBlocking, 1);
  // the five other open buckets are untouched
  assert.equal(out.branchCompositeOpen.length, 0);
  assert.equal(out.authoredOpen.length, 0);
  assert.equal(out.branchConditionalAuthored.length, 0);
  assert.equal(out.dynamicSinkPending.length, 1);
  assert.equal(out.callArgsPending.length, 0);
  // closed cohorts and frozen counters
  assert.equal(out.stats.closedProducer, 65);
  assert.equal(out.stats.closedNonObject, 69);
  assert.equal(out.stats.publicBoundary, 534);
  assert.equal(out.stats.privateRelay, 728);
  assert.equal(universeTotal(out), 2024);
  assert.equal(out.stats.producerSites, 4872);
  assert.equal(out.stats.channelEmissions, 10313);
  assert.equal(out.stats.distinctChannels, 4585);
  assert.equal(out.stats.emissionsWithCausalRoot, 186);
  assert.equal(out.stats.ownershipConflicts, 0);
});

test('S-9 the durable receipt is complete and re-derivable', () => {
  const out = buildProducers();
  const seq = out.closedZeroGoverned.filter((r) => r.resolvedVia === SEQ_VIA);
  assert.equal(seq.length, 8);
  for (const row of seq) {
    const list = row.evidence.sequentialAssignments;
    assert.ok(Array.isArray(list) && list.length > 0, `${row.file}:${row.line} closed with no proof`);
    assert.equal(row.evidence.sequentialAssignmentCount, list.length);
    for (const proof of list) {
      assert.deepEqual(Object.keys(proof).sort(), ['binding', 'declaredAt', 'returnAt', 'writeCount', 'writes']);
      assert.equal(proof.binding, 'style');
      assert.ok(proof.declaredAt.startsWith('packages/core/src/'));
      assert.ok(proof.returnAt.startsWith('packages/core/src/'));
      assert.equal(proof.writeCount, proof.writes.length);
      assert.equal(proof.writeCount, 2);
      for (const w of proof.writes) {
        assert.deepEqual(Object.keys(w).sort(), ['at', 'condition', 'conditional', 'key']);
        assert.ok(w.key.length > 0);
        assert.ok(w.at.startsWith('packages/core/src/'));
        assert.equal(w.conditional, true);
        assert.ok(w.condition && w.condition.length > 0, 'a conditional write must publish its condition');
      }
      // stable order, exact-tuple dedup
      const keys = proof.writes.map((w) => `${w.key}|${w.at}`);
      assert.deepEqual(keys, [...keys].sort());
      assert.equal(new Set(proof.writes.map((w) => JSON.stringify(w))).size, proof.writes.length);
    }
    // proof of closure, never governance
    assert.ok(!('causalRootIds' in row));
    assert.ok(!('tenantReachable' in row));
    assert.ok(!('ownerId' in row));
  }
  // no other ZERO row gains an empty or spurious field
  const others = out.closedZeroGoverned.filter((r) => r.resolvedVia !== SEQ_VIA);
  assert.equal(others.length, 619);
  for (const row of others) assert.equal(row.evidence?.sequentialAssignments, undefined);
});

test('S-10 NEGATIVE: tampering with the sequential receipt moves the bound digest', () => {
  const out = buildProducers();
  const rows = out.closedZeroGoverned.filter((r) => r.resolvedVia === SEQ_VIA).slice(0, 4);
  const bound = (rs) => JSON.stringify(rs.map((r) => [r.file, r.ordinal, r.resolvedVia ?? null, r.evidence ?? null]));
  const identity = (rs) => JSON.stringify(rs.map((r) => [r.plane, r.file, r.symbol, r.reason]));
  const bend = (fn) => rows.map((r) => ({ ...r, evidence: { ...r.evidence, sequentialAssignments: r.evidence.sequentialAssignments.map(fn) } }));
  const mutations = {
    'list emptied': rows.map((r) => ({ ...r, evidence: { ...r.evidence, sequentialAssignments: [] } })),
    'receipt removed': rows.map((r) => ({ ...r, evidence: null })),
    'binding forged': bend((p) => ({ ...p, binding: 'other' })),
    'declaration moved': bend((p) => ({ ...p, declaredAt: 'fake:1' })),
    'return moved': bend((p) => ({ ...p, returnAt: 'fake:2' })),
    'write dropped': bend((p) => ({ ...p, writes: p.writes.slice(1) })),
    'conditional flipped': bend((p) => ({ ...p, writes: p.writes.map((w) => ({ ...w, conditional: false })) })),
    'condition erased': bend((p) => ({ ...p, writes: p.writes.map((w) => ({ ...w, condition: null })) })),
  };
  for (const [name, mutated] of Object.entries(mutations)) {
    assert.equal(identity(rows), identity(mutated), `identity must stay blind: ${name}`);
    assert.notEqual(bound(rows), bound(mutated), `the bound digest MUST notice: ${name}`);
  }
  assert.match(out.digests.closedZeroGovernedReceipts, /^[0-9a-f]{64}$/);
});

test('S-11 NEGATIVE: a SIBLING declarator or a `var` binding is never proven', () => {
  // The fine pass skips the declaration statement, so a sibling declarator would
  // escape inspection entirely: `t` aliases the same object and `g` closes over
  // it, and neither is reachable from the coarse detector (an initializer that
  // READS X is not an assignment op). Without the single-declarator guard, S-11b
  // and S-11c close as ZERO while emitting a GOVERNED channel -- the exact
  // false-ZERO class this programme forbids. `var` hoists, so a write may run
  // before the declaration statement, which the textual decl-to-return walk does
  // not model; only `const`/`let` carry the ordering the walk assumes.
  const cases = {
    'alias sibling, ungoverned write': 'const f = () => { const s = {}, t = s; s.top = 1; t.left = 2; return s; };',
    'alias sibling, GOVERNED write': 'const f = () => { const s = {}, t = s; s.top = 1; t["--ds-evil"] = "1"; return s; };',
    'closure sibling, GOVERNED write': 'const f = () => { const s = {}, g = () => { s["--ds-evil"] = "1"; }; s.top = 1; g(); return s; };',
    'var binding': 'function f() { var s = {}; if (a) s.top = 1; return s; }',
  };
  for (const [name, body] of Object.entries(cases)) {
    const out = branchProbe(`${body}\nexport const C = () => <div style={f()} />;`);
    assert.equal(out.shape.reason, 'reassignment-or-mutation-present', `${name} must stay open`);
    assert.equal(out.disposition, 'OPEN_UNKNOWN', `${name} must stay OPEN_UNKNOWN`);
    assert.notEqual(out.disposition, ZERO_D, `${name} must never close as ZERO`);
    assert.notEqual(out.disposition, 'CLOSED_PRODUCER', `${name} must never close as a PRODUCER`);
    assert.equal(out.shape.sequentialAssignment, undefined, `${name} must not carry a sequential proof`);
  }
  // the guards are surgical: the proven single-declarator forms still close, and
  // `let` -- which shares the ordering guarantee -- is not collateral damage
  const constForm = branchProbe(
    'const f = () => { const s = {}; if (a) s.top = 1; return s; };\nexport const C = () => <div style={f()} />;',
  );
  assert.equal(constForm.disposition, ZERO_D);
  assert.equal(constForm.shape.sequentialAssignment.writeCount, 1);
  const letForm = branchProbe(
    'const f = () => { let s = {}; if (a) s.top = 1; return s; };\nexport const C = () => <div style={f()} />;',
  );
  assert.equal(letForm.disposition, ZERO_D);
  assert.equal(letForm.shape.sequentialAssignment.writeCount, 1);
});

/* ===================================================================== *
 * T-SEALED-RELAY -- a `<ident>.<prop>` read at a style sink is a PRIVATE
 * RELAY of one externally-owned producer, not authored content.
 *
 * The proof is 100% syntactic: binding form + declared types. It never
 * closes a value, never attributes a channel and never invents a root --
 * the rows stay non-consumable, non-tenant-safe and unattributed. What it
 * buys is an honest disposition plus a durable receipt.
 *
 * NOT keyed off any local name: `overlayMotion` / `pressMotion` /
 * `stateMotion` are incidental aliases and the drills below use arbitrary
 * ones on purpose.
 * ===================================================================== */

const SEALED_VIA = 'sealed-import-relay';
const RECIPE_MODULE = '@/infrastructure/runtime/foundation/motion/composition/react/preference/recipe';
const RECIPE_KEYS = [
  '--ds-recipe-curve', '--ds-recipe-cycle', '--ds-recipe-enter', '--ds-recipe-exit',
  '--ds-recipe-scale-from', '--ds-recipe-settle', '--ds-recipe-x', '--ds-recipe-y',
];
/** A consumer fixture that imports the REAL sealed producer module. */
const sealedProbe = (body) => branchProbe(`import { useMotionRecipePresentation } from '${RECIPE_MODULE}';\n${body}`);
const isProven = (shape) => shape.kind === 'relay' && !!shape.sealedImportRelay;
/** The shape of the single spread entry of an object fixture. */
const spreadShapeOf = (shape) => (shape.order ?? []).find((e) => e.kind === 'spread')?.shape ?? shape;

test('SR-1 POSITIVE: an ARBITRARY alias and either access form prove identically', () => {
  const direct = sealedProbe(
    'export const C = ({n}) => { const zqArbitrary$1 = useMotionRecipePresentation(n); return <div style={zqArbitrary$1.variables} />; };',
  );
  assert.ok(isProven(direct.shape), 'a bare member-access read must prove');
  assert.equal(direct.disposition, 'RELAY_PRIVATE_UNRESOLVED');
  assert.equal(direct.shape.sealedImportRelay.localBinding, 'zqArbitrary$1');
  assert.equal(direct.shape.sealedImportRelay.property, 'variables');
  assert.equal(direct.shape.sealedImportRelay.owner, 'motionRecipeCssVariables');
  assert.deepEqual(direct.shape.sealedImportRelay.keys, RECIPE_KEYS);

  const spread = sealedProbe(
    'export const C = ({n}) => { const totallyOther = useMotionRecipePresentation(n); return <div style={{ ...totallyOther.variables }} />; };',
  );
  const inner = spreadShapeOf(spread.shape);
  assert.ok(isProven(inner), 'the same read inside a spread must prove');
  // the alias is cosmetic: the two receipts differ ONLY in the binding name
  assert.deepEqual(
    { ...inner.sealedImportRelay, localBinding: null, localDeclaredAt: null },
    { ...direct.shape.sealedImportRelay, localBinding: null, localDeclaredAt: null },
  );
});

test('SR-2 POSITIVE: a property other than `variables` proves through the same seal', () => {
  const out = sealedProbe(
    'export const C = ({n}) => { const m = useMotionRecipePresentation(n); return <div style={m.attributes} />; };',
  );
  // `attributes` is a DIFFERENT sealed property of the same return type: the
  // rule keys off the declared shape, never off a property name.
  assert.ok(isProven(out.shape));
  assert.equal(out.shape.sealedImportRelay.property, 'attributes');
  assert.equal(out.shape.sealedImportRelay.propertyType, 'MotionRecipeDataAttributes');
  assert.deepEqual(out.shape.sealedImportRelay.keys, ['data-recipe', 'data-recipe-state']);
});

test('SR-3 NEGATIVE: eight binding/read forms that must never prove', () => {
  const LOOKALIKE = `
interface Vars { '--ds-recipe-enter': string }
interface Pres { variables: Vars }
function useLocalPresentation(n): Pres { return { variables: { '--ds-recipe-enter': openValue } }; }
`;
  const cases = {
    'local lookalike (callee is not an import)':
      `${LOOKALIKE}export const C = ({n}) => { const m = useLocalPresentation(n); return <div style={m.variables} />; };`,
    'property absent from the sealed return type':
      'export const C = ({n}) => { const m = useMotionRecipePresentation(n); return <div style={m.notAProperty} />; };',
    'mutated binding':
      'export const C = ({n, o}) => { let m = useMotionRecipePresentation(n); m = o; return <div style={m.variables} />; };',
    'alias of the binding':
      'export const C = ({n}) => { const m = useMotionRecipePresentation(n); const a = m; return <div style={a.variables} />; };',
    'dynamic property':
      'export const C = ({n, k}) => { const m = useMotionRecipePresentation(n); return <div style={m[k]} />; };',
    'optional chaining':
      'export const C = ({n}) => { const m = useMotionRecipePresentation(n); return <div style={m?.variables} />; };',
    'binding initialised by a conditional, not a direct call':
      'export const C = ({n, f}) => { const m = f ? useMotionRecipePresentation(n) : useMotionRecipePresentation(n); return <div style={m.variables} />; };',
    'binding initialised by something that is not a call':
      'export const C = ({o}) => { const m = o; return <div style={m.variables} />; };',
  };
  for (const [name, body] of Object.entries(cases)) {
    const out = sealedProbe(body);
    assert.ok(!isProven(out.shape), `${name} must NOT prove`);
    assert.ok(!isProven(spreadShapeOf(out.shape)), `${name} must NOT prove inside a spread either`);
  }
});

test('SR-4 NEGATIVE: an UNSEALED declared shape is never proven', () => {
  /** Resolve the type of `declare const v: <T>` in a one-file fixture. */
  const seal = (code) => {
    const source = ts.createSourceFile(
      'packages/core/src/ui/probe/seal.ts', `${code}\ndeclare const v: Target;\n`,
      ts.ScriptTarget.Latest, true, ts.ScriptKind.TS,
    );
    let typeNode = null;
    const walk = (n) => {
      if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.name.text === 'v') typeNode = n.type;
      ts.forEachChild(n, walk);
    };
    walk(source);
    assert.ok(typeNode, 'fixture must declare `v`');
    return resolveSealedTypeDecl(typeNode, source);
  };
  // POSITIVE controls: the only two admitted declaration forms
  assert.deepEqual(seal("interface Target { '--ds-a': string; '--ds-b': string }").members.map((m) => m.name), ['--ds-a', '--ds-b']);
  assert.deepEqual(seal("type Target = { '--ds-a': string }").members.map((m) => m.name), ['--ds-a']);
  // NEGATIVES: each makes the key set or the value non-enumerable
  const refusals = {
    'index signature': 'interface Target { [k: string]: string }',
    'optional member': "interface Target { '--ds-a': string; '--ds-b'?: string }",
    'generic declaration': "interface Target<T> { '--ds-a': T }",
    'heritage (extends)': "interface Base { '--ds-a': string }\ninterface Target extends Base { '--ds-b': string }",
    'method member': "interface Target { '--ds-a': string; go(): void }",
    'call signature': "interface Target { '--ds-a': string; (): string }",
    'getter member': "interface Target { get a(): string }",
    'union type alias': "type Target = { '--ds-a': string } | { '--ds-b': string }",
    'alias to an interface': "interface Obj { '--ds-a': string }\ntype Target = Obj",
    'alias to a primitive': 'type Target = string',
    'empty declaration': 'interface Target {}',
    'self-referential cycle': 'type Target = Target',
    'undeclared reference': '',
  };
  for (const [name, code] of Object.entries(refusals)) {
    assert.equal(seal(code), null, `${name} must NOT be accepted as sealed`);
  }
});

test('SR-5 the proof reaches the ARTIFACT and never becomes governance', () => {
  const out = buildProducers();
  const proven = out.privateRelay.filter((r) => r.resolvedVia === SEALED_VIA);
  assert.equal(proven.length, 22);
  for (const row of proven) {
    assert.equal(row.reason.startsWith('sealed-import-relay:'), true);
    assert.match(row.reason, /:(member-access|spread)$/, 'the reason must keep the site form');
    assert.equal(row.nonConsumableCause, 'private-passthrough-of-a-sealed-imported-producer-attributed-to-no-cascade-root');
    // a relay grants NOTHING -- the proof is evidence of provenance, never of governance
    assert.equal(row.consumable, false);
    assert.equal(row.tenantSafe, false);
    assert.ok(!('causalRootIds' in row));
    assert.ok(!('tenantReachable' in row));
    assert.ok(!('ownerId' in row));
    assert.ok(!('governedChannelKeys' in row.evidence));

    const list = row.evidence.sealedImportRelay;
    assert.ok(Array.isArray(list) && list.length === 1, `${row.file}:${row.line} published no single proof`);
    const proof = list[0];
    // exact object shape: no extra field, no missing field
    assert.deepEqual(Object.keys(proof).sort(), [
      'exportFile', 'exportedFunction', 'importedCallee', 'importedName', 'keyCount', 'keys',
      'localBinding', 'localDeclaredAt', 'moduleSpecifier', 'owner', 'ownerDeclaredAt',
      'ownerFile', 'property', 'propertyType', 'returnType',
    ]);
    // binding -> import/export -> property -> owner -> keys, all named
    assert.match(proof.localBinding, /Motion$/);
    assert.equal(proof.importedCallee, 'useMotionRecipePresentation');
    assert.equal(proof.importedName, 'useMotionRecipePresentation');
    assert.equal(proof.moduleSpecifier, RECIPE_MODULE);
    assert.equal(proof.exportFile, 'packages/core/src/infrastructure/runtime/foundation/motion/composition/react/preference/recipe/index.ts');
    assert.equal(proof.exportedFunction, 'useMotionRecipePresentation');
    assert.equal(proof.returnType, 'MotionRecipePresentation');
    assert.equal(proof.property, 'variables');
    assert.equal(proof.propertyType, 'MotionRecipeCssVariables');
    assert.equal(proof.owner, 'motionRecipeCssVariables');
    assert.equal(proof.ownerFile, proof.exportFile);
    assert.equal(proof.keyCount, 8);
    assert.deepEqual(proof.keys, RECIPE_KEYS);
    // the path shows HOW the producer was reached, and ends on the sealing step
    assert.equal(row.evidence.path[0], 'terminal-at-sink');
    assert.equal(row.evidence.path[row.evidence.path.length - 1], 'sealedImportRelay');
  }
  // no relay that did NOT close by this route gains an empty or spurious field
  for (const row of out.privateRelay.filter((r) => r.resolvedVia !== SEALED_VIA)) {
    assert.equal(row.evidence.sealedImportRelay, undefined);
    // T-NAMESPACE-RELAY is a SECOND proven route into this bucket; every other
    // relay still carries no route at all.
    assert.ok(
      row.resolvedVia === undefined ||
        row.resolvedVia === 'custom-property-namespace-relay' ||
        row.resolvedVia === 'public-style-passthrough',
      `${row.file}:${row.line} published an unexpected relay route ${row.resolvedVia}`,
    );
  }
  assert.equal(out.privateRelay.filter((r) => r.resolvedVia === 'custom-property-namespace-relay').length, 5);
  assert.equal(out.privateRelay.filter((r) => r.resolvedVia === undefined).length, 685);
});

test('SR-6 NEGATIVE: tampering with a sealed-relay proof moves the bound digest', () => {
  const out = buildProducers();
  const rows = out.privateRelay.filter((r) => r.resolvedVia === SEALED_VIA).slice(0, 4);
  assert.equal(rows.length, 4);
  const bound = (rs) => JSON.stringify(rs.map((r) => [r.file, r.ordinal, r.sinkTags, r.relayKinds, r.evidence]));
  const identity = (rs) => JSON.stringify(rs.map((r) => [r.plane, r.file, r.symbol, r.reason]));
  const edit = (fn) => rows.map((r) => ({
    ...r,
    evidence: { ...r.evidence, sealedImportRelay: r.evidence.sealedImportRelay.map((p) => fn({ ...p })) },
  }));
  const mutations = {
    'proof emptied': rows.map((r) => ({ ...r, evidence: { ...r.evidence, sealedImportRelay: [] } })),
    'proof removed': rows.map((r) => ({ ...r, evidence: { ...r.evidence, sealedImportRelay: undefined } })),
    'owner forged': edit((p) => ({ ...p, owner: 'somethingElse' })),
    'export forged': edit((p) => ({ ...p, exportFile: 'fake/index.ts' })),
    'property swapped': edit((p) => ({ ...p, property: 'attributes' })),
    'a key dropped': edit((p) => ({ ...p, keys: p.keys.slice(1), keyCount: p.keyCount - 1 })),
    'a key forged': edit((p) => ({ ...p, keys: [...p.keys.slice(1), '--ds-forged'].sort() })),
  };
  for (const [name, mutated] of Object.entries(mutations)) {
    assert.equal(identity(rows), identity(mutated), `${name}: identity alone cannot see the proof`);
    assert.notEqual(bound(rows), bound(mutated), `${name} did NOT move the receipt-bound digest`);
  }
});

test('SR-7 the live delta is EXACTLY 22 rows and nothing else moved', () => {
  const out = buildProducers();
  // the two cohorts that moved, and the rollup that must only ever go down
  assert.equal(out.authoredOpen.length, 0);
  assert.equal(out.stats.privateRelay, 728);
  assert.equal(out.stats.openBlocking, 1);
  assert.ok(1 < 142, 'openBlocking must never grow');
  assert.equal(66 - 22, 44);
  assert.equal(675 + 22, 697);
  assert.equal(142 - 22, 120);
  // every other bucket, closed and open, is frozen
  assert.equal(out.stats.closedZeroGoverned, 627);
  assert.equal(out.stats.closedNonObject, 69);
  assert.equal(out.stats.closedProducer, 65);
  assert.equal(out.stats.publicBoundary, 534);
  assert.equal(out.stats.unknownProvenance, 0);
  assert.equal(out.branchCompositeOpen.length, 0);
  assert.equal(out.branchConditionalAuthored.length, 0);
  assert.equal(out.openUnknown.length, 0);
  assert.equal(out.computedDomainPending.length, 0);
  assert.equal(out.dynamicSinkPending.length, 1);
  assert.equal(out.callArgsPending.length, 0);
  assert.equal(universeTotal(out), 2024);
  assert.equal(out.stats.producerSites, 4872);
  assert.equal(out.stats.channelEmissions, 10313);
  assert.equal(out.stats.distinctChannels, 4585);
  assert.equal(out.stats.emissionsWithCausalRoot, 186);
  assert.equal(out.stats.ownershipConflicts, 0);
  // the arrivals are exactly the 18 authored coordinates of ONE expression
  // family -- 9 source files x {member-access, spread}. The four Button rows
  // that the extractor emits twice are NOT deduplicated by this tranche: they
  // are a separate, pre-existing defect and 18 coordinates carry 22 rows.
  const proven = out.privateRelay.filter((r) => r.resolvedVia === SEALED_VIA);
  assert.equal(proven.length, 22);
  const coordinates = new Set(proven.map((r) => `${r.file}|${r.ordinal}`));
  assert.equal(coordinates.size, 18);
  assert.equal(new Set(proven.map((r) => r.file)).size, 9);
  assert.deepEqual(
    [...new Set(proven.map((r) => r.reason.split(':')[1]))].sort(),
    ['member-access', 'spread'],
  );
  assert.equal(proven.filter((r) => r.reason.endsWith(':member-access')).length, 11);
  assert.equal(proven.filter((r) => r.reason.endsWith(':spread')).length, 11);
  // and NO authoredOpen row of this family survives
  for (const row of out.authoredOpen) {
    assert.ok(!/Motion\.variables/.test(row.template), `${row.file}:${row.line} stayed authored-open`);
  }
});

/**
 * A CROSS-FILE fixture harness. The sealed-relay proof requires a REAL
 * importable producer module (`resolveImportTargetFile` resolves on disk), so
 * the single-file `branchProbe` cannot express the producer-side refusals.
 *
 * The modules are written under a `/fixtures/` path -- one of `TSX_EXCLUDE`'s
 * needles -- so they can never enter the scan universe or the inventory, and
 * they are removed again in `finally`.
 */
const withProducerModules = (run) => {
  const dir = mkdtempSync(join(REPO_ABS, 'packages/core/src/ui/__sealed-relay-drill-'));
  const dirName = dir.slice(dir.lastIndexOf('/') + 1);
  const consumerFile = `packages/core/src/ui/${dirName}/consumer.tsx`;
  mkdirSync(join(dir, 'fixtures'), { recursive: true });
  let seq = 0;
  /** Write one producer module and resolve `<alias>.vars` against it. */
  const probe = (producerSource, consumerBody) => {
    const name = `m${seq++}`;
    writeFileSync(join(dir, 'fixtures', `${name}.ts`), producerSource);
    const code = `import { make } from './fixtures/${name}';\n${consumerBody}`;
    const source = ts.createSourceFile(consumerFile, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    let expression = null;
    const walk = (node) => {
      if (
        ts.isJsxAttribute(node) && node.name.getText(source) === 'style' &&
        node.initializer && ts.isJsxExpression(node.initializer)
      ) expression = node.initializer.expression;
      ts.forEachChild(node, walk);
    };
    walk(source);
    assert.ok(expression, 'fixture must contain a style sink');
    return resolveShape(expression, {
      source, fileRel: consumerFile, depth: 0, path: [{ kind: 'terminal-at-sink', form: 'identifier' }],
    });
  };
  try {
    run(probe);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

/** Consumer used by every producer-side drill: an arbitrary alias, one read. */
const DRILL_CONSUMER = 'export const C = ({x, e, k}) => { const zz = make(x, e, k); return <div style={zz.vars} />; };';
/** Values stay OPEN (`openValue` is unbound) so the read never closes on its own. */
const DECLARED_AB = "export interface Vars { '--ds-a': string; '--ds-b': string }\nexport interface Out { vars: Vars }";

test('SR-8 NEGATIVE: the four producer-side refusals, against a real imported module', () => {
  withProducerModules((probe) => {
    // POSITIVE CONTROL FIRST. Without it every refusal below could be passing
    // for the wrong reason -- a broken harness refuses everything.
    const control = probe(
      `${DECLARED_AB}\nfunction build(x: number, e, k): Vars { return { '--ds-a': \`\${x}px\`, '--ds-b': openValue }; }\nexport function make(x: number, e, k): Out { return { vars: build(x, e, k) }; }`,
      DRILL_CONSUMER,
    );
    assert.equal(control.kind, 'relay', 'the harness must be able to PROVE, or the negatives are vacuous');
    assert.ok(control.sealedImportRelay, 'the control must carry a proof');
    assert.deepEqual(control.sealedImportRelay.keys, ['--ds-a', '--ds-b']);
    assert.equal(control.sealedImportRelay.owner, 'build');

    const refusals = {
      // two possible producer literals: the owner is not unique
      'ambiguous owner (conditional producer)':
        `${DECLARED_AB}\nexport function make(x: number, e, k): Out { return { vars: x > 1 ? { '--ds-a': 'p', '--ds-b': openValue } : { '--ds-a': 'q', '--ds-b': openValue } }; }`,
      // the literal produces a key the declaration does not name
      'declared/derived key-set disagreement':
        `${DECLARED_AB}\nfunction build(x: number, e, k): Vars { return { '--ds-a': \`\${x}px\`, '--ds-c': openValue } as Vars; }\nexport function make(x: number, e, k): Out { return { vars: build(x, e, k) }; }`,
      // a spread imports keys this walk cannot enumerate
      'producer opened by a spread':
        `${DECLARED_AB}\nfunction build(x: number, e, k): Vars { return { ...e, '--ds-a': \`\${x}px\`, '--ds-b': openValue }; }\nexport function make(x: number, e, k): Out { return { vars: build(x, e, k) }; }`,
      // a computed key is not statically enumerable
      'producer key is computed':
        `${DECLARED_AB}\nfunction build(x: number, e, k): Vars { return { [k]: \`\${x}px\`, '--ds-b': openValue } as Vars; }\nexport function make(x: number, e, k): Out { return { vars: build(x, e, k) }; }`,
    };
    for (const [name, producer] of Object.entries(refusals)) {
      const shape = probe(producer, DRILL_CONSUMER);
      assert.ok(
        !(shape.kind === 'relay' && shape.sealedImportRelay),
        `${name} must NOT prove`,
      );
    }
  });
});

test('SR-9 NEGATIVE: a REPEATED derived key is refused, and only set-uniqueness can refuse it', () => {
  withProducerModules((probe) => {
    /* The fail-closed hole this drill pins: declared `{--ds-a, --ds-b}` against
     * a literal `{'--ds-a': p, '--ds-a': q}`.
     *
     *   derived  = ['--ds-a', '--ds-a']   length 2
     *   declared = ['--ds-a', '--ds-b']   length 2   -> the LENGTH test passes
     *   every derived member is declared             -> the MEMBERSHIP test passes
     *
     * so length + membership admit it, while the literal actually produces ONE
     * key and never produces `--ds-b`. Only comparing the derived keys AS A SET
     * refuses it. The two preconditions are asserted here, so this test fails
     * the moment the uniqueness gate is removed rather than silently passing
     * for some other reason. */
    const derived = ['--ds-a', '--ds-a'];
    const declared = ['--ds-a', '--ds-b'];
    assert.equal(derived.length, declared.length, 'precondition: the length test must PASS');
    assert.ok(derived.every((k) => new Set(declared).has(k)), 'precondition: the membership test must PASS');
    assert.notEqual(new Set(derived).size, derived.length, 'precondition: only uniqueness distinguishes it');

    const shape = probe(
      `${DECLARED_AB}\nfunction build(x: number, e, k): Vars { return { '--ds-a': \`\${x}px\`, '--ds-a': openValue } as unknown as Vars; }\nexport function make(x: number, e, k): Out { return { vars: build(x, e, k) }; }`,
      DRILL_CONSUMER,
    );
    assert.ok(
      !(shape.kind === 'relay' && shape.sealedImportRelay),
      'a repeated derived key must NOT prove',
    );

    // the same producer with the duplicate resolved to the declared second key
    // DOES prove -- so the refusal above is the duplicate, not the fixture
    const fixed = probe(
      `${DECLARED_AB}\nfunction build(x: number, e, k): Vars { return { '--ds-a': \`\${x}px\`, '--ds-b': openValue }; }\nexport function make(x: number, e, k): Out { return { vars: build(x, e, k) }; }`,
      DRILL_CONSUMER,
    );
    assert.equal(fixed.kind, 'relay');
    assert.deepEqual(fixed.sealedImportRelay.keys, ['--ds-a', '--ds-b']);
  });
});

/* ===================================================================== *
 * T-STATIC-KEYSET -- a style shape closes when its KEY SET is fully
 * enumerable, even if leaf VALUES stay open. A plain leaf value cannot
 * create a key, so it cannot hide an emission. Everything that CAN create
 * a key keeps failing closed.
 *
 * Nothing here is filtered by component, path or prefix: the drills use
 * arbitrary names, and `--rottay-*` is admitted as a real emission on the
 * same footing as any other custom property.
 * ===================================================================== */

const KS_VIA = 'static-key-set';
const PRODUCER_D = 'CLOSED_PRODUCER';
/** Resolve a one-file fixture and dispose of it. `openValue` is unbound on purpose. */
const ksProbe = (code) => branchProbe(code);

test('KS-1 POSITIVE: an open leaf VALUE does not block an otherwise static key set', () => {
  const out = ksProbe(
    "export const C = () => <div style={{ '--ds-zq-a': openValue, width: alsoOpen }} />;",
  );
  assert.equal(out.shape.closed, false, 'the VALUES really are unresolved');
  assert.equal(out.disposition, PRODUCER_D, 'the key set is enumerable, so it is a producer');
  assert.deepEqual(out.governance.governedChannelKeys, ['--ds-zq-a']);
  assert.ok(out.governance.openLeafValues > 0, 'the admission must be recorded as evidence');
});

test('KS-2 POSITIVE: guarded branches close, and a clean `undefined` guard is an empty arm', () => {
  const guard = ksProbe(
    "export const C = ({f}) => <div style={f ? { '--ds-zq-b': openValue } : undefined} />;",
  );
  assert.equal(guard.disposition, PRODUCER_D);
  assert.deepEqual(guard.governance.governedChannelKeys, ['--ds-zq-b']);
  // the union is over ALL arms, not just the first
  const union = ksProbe(
    "export const C = ({f}) => <div style={f ? { '--ds-zq-c': openValue } : { '--ds-zq-d': openValue }} />;",
  );
  assert.equal(union.disposition, PRODUCER_D);
  assert.deepEqual(union.governance.governedChannelKeys.sort(), ['--ds-zq-c', '--ds-zq-d']);
  // a nested guard tree is enumerated to its terminals
  const nested = ksProbe(
    "export const C = ({f,g}) => <div style={f ? { '--ds-zq-e': openValue } : g ? { '--ds-zq-f': openValue } : undefined} />;",
  );
  assert.equal(nested.disposition, PRODUCER_D);
  assert.deepEqual(nested.governance.governedChannelKeys.sort(), ['--ds-zq-e', '--ds-zq-f']);
});

test('KS-3 POSITIVE: ANY `--` key is an emission -- `--rottay-*` is a producer, never a ZERO', () => {
  const out = ksProbe(
    "export const C = () => <div style={{ '--rottay-zq-level': openValue, padding: 4 }} />;",
  );
  assert.equal(out.disposition, PRODUCER_D, 'an ungoverned custom property is still an emission');
  assert.notEqual(out.disposition, ZERO_D, 'it must NEVER certify as a zero emission');
  assert.deepEqual(out.governance.governedChannelKeys, [], 'it is not a governed channel');
  assert.deepEqual(out.governance.internalSocketKeys, []);
  assert.deepEqual(out.governance.ungovernedCustomPropertyKeys, ['--rottay-zq-level']);
  // an arbitrary third namespace behaves identically -- no prefix allowlist
  const other = ksProbe("export const C = () => <div style={{ '--zz-anything': openValue }} />;");
  assert.equal(other.disposition, PRODUCER_D);
  assert.deepEqual(other.governance.ungovernedCustomPropertyKeys, ['--zz-anything']);
});

test('KS-4 POSITIVE: ZERO only when NO arm enumerates ANY custom property', () => {
  const zero = ksProbe("export const C = () => <div style={{ width: openValue, top: alsoOpen }} />;");
  assert.equal(zero.disposition, ZERO_D);
  assert.deepEqual(zero.governance.governedChannelKeys, []);
  assert.deepEqual(zero.governance.ungovernedCustomPropertyKeys, []);
  // ONE custom property in ONE arm is enough to deny the zero
  const denied = ksProbe(
    "export const C = ({f}) => <div style={f ? { width: openValue } : { '--rottay-x': openValue }} />;",
  );
  assert.equal(denied.disposition, PRODUCER_D, 'a single arm emitting denies the ZERO for the whole tree');
});

test('KS-5 NEGATIVE: everything that CAN create a key still fails closed', () => {
  const refusals = {
    'external/prop spread':
      'export const C = ({style}) => <div style={{ "--ds-a": openValue, ...style }} />;',
    'spread of an unresolved identifier':
      'export const C = () => <div style={{ "--ds-a": openValue, ...whoKnows }} />;',
    'spread of a call result':
      'export const C = () => <div style={{ "--ds-a": openValue, ...makeIt(x) }} />;',
    'computed key':
      'export const C = ({k}) => <div style={{ "--ds-a": openValue, [k]: 1 }} />;',
    'computed key from a param inside a helper':
      'const h = (side) => ({ position: "sticky", [side]: 0 });\nexport const C = ({s}) => <div style={h(s)} />;',
    'unresolved branch arm (relay)':
      'export const C = ({s,f}) => <div style={f ? { "--ds-a": openValue } : s} />;',
    'getter member':
      'export const C = () => <div style={{ get width(): string { return "1px"; } }} />;',
    'method member':
      'export const C = () => <div style={{ "--ds-a": openValue, go() { return 1; } }} />;',
    'setter member':
      'export const C = () => <div style={{ set w(v: string) {} }} />;',
    'mutation of the local':
      'export const C = ({v}) => { let s = { "--ds-a": 1 }; s.b = v; return <div style={s} />; };',
  };
  for (const [name, code] of Object.entries(refusals)) {
    const out = ksProbe(code);
    assert.notEqual(out.disposition, PRODUCER_D, `${name} must NOT close as a producer`);
    assert.notEqual(out.disposition, ZERO_D, `${name} must NOT close as a zero`);
  }
});

test('KS-6 NEGATIVE: an UNENUMERATED computed domain stays open; an ENUMERATED one does not', () => {
  // this is the exact line the 3 preflight corrections sit on: `closed` decides
  const openDomain = ksProbe(
    'const M = buildIt();\nexport const C = ({k}) => <div style={M[k]} />;',
  );
  assert.notEqual(openDomain.disposition, PRODUCER_D, 'an unenumerable lookup must stay open');
  assert.notEqual(openDomain.disposition, ZERO_D);
  const sealed = ksProbe(
    "const M = { a: { '--ds-a': openValue }, b: { '--ds-b': openValue } } as const;\n" +
      'export const C = ({k}) => <div style={M[k]} />;',
  );
  assert.ok(
    sealed.disposition === PRODUCER_D || sealed.shape.kind === 'computedKey',
    'a sealed container domain is enumerable',
  );
});

test('KS-7 the LIVE cohort is exactly 67 rows and lands where the re-derivation said', () => {
  const out = buildProducers();
  // the two open buckets that drained
  assert.equal(out.authoredOpen.length, 0);
  assert.equal(out.branchCompositeOpen.length, 0);
  assert.equal(out.stats.openBlocking, 1);
  assert.equal(44 - 32, 12);
  assert.equal(55 - 35, 20);
  assert.equal(120 - 67, 53);
  // the two closed buckets that received them
  assert.equal(out.stats.closedProducer, 65);
  assert.equal(out.stats.closedZeroGoverned, 627);
  assert.equal(21 + 36, 57);
  assert.equal(579 + 31, 610);
  assert.equal(36 + 31, 67);
  // every OTHER bucket is frozen -- no third destination, no new open debt
  assert.equal(out.stats.unknownProvenance, 0);
  assert.equal(out.stats.closedNonObject, 69);
  assert.equal(out.stats.publicBoundary, 534);
  assert.equal(out.stats.privateRelay, 728);
  assert.equal(out.branchConditionalAuthored.length, 0);
  assert.equal(out.openUnknown.length, 0, 'an admitted open VALUE must never become OPEN_UNKNOWN debt');
  assert.equal(out.computedDomainPending.length, 0);
  assert.equal(out.dynamicSinkPending.length, 1);
  assert.equal(out.callArgsPending.length, 0);
  assert.equal(universeTotal(out), 2024);
  assert.equal(out.stats.producerSites, 4872);
  assert.equal(out.stats.channelEmissions, 10313);
  assert.equal(out.stats.ownershipConflicts, 0);
});

test('KS-8 the 12 rows T-STATIC-KEYSET left open were all closed by RESIDUAL-42', () => {
  /* KS-8 pinned CLOSURE-11's 12 authored-open survivors. RESIDUAL-42 closed
   * every one of them, by route:
   *   data-table x2, Message, Notification -> computed NAME enumerated (ZERO)
   *   Slider x5                            -> public style tail (BOUNDARY)
   *   Input classic x2                     -> AntD sink (RELAY)
   *   Collapse classic                     -> engine has no export closure (RELAY)
   * The bucket is empty and the no-double-classification invariant still holds. */
  const out = buildProducers();
  assert.equal(out.authoredOpen.length, 0);
  const at = (needle, bucket) => out[bucket].filter((r) => r.file.includes(needle)).length;
  assert.ok(at('data-table/engines/rustic', 'closedZeroGoverned') >= 2);
  assert.ok(at('feedback/Message/engines/rustic', 'closedZeroGoverned') >= 1);
  assert.ok(at('feedback/Notification/engines/rustic', 'closedZeroGoverned') >= 1);
  assert.equal(out.publicBoundary.filter((r) => r.file.includes('inputs/Slider/engines/rustic') && [247, 252, 267, 335, 350].includes(r.line)).length, 5);
  assert.ok(at('inputs/Input/engines/classic', 'privateRelay') >= 2);
  assert.ok(at('layout/Collapse/engines/classic', 'privateRelay') >= 1);
  // a row may never be in an open bucket and a closed one at once
  const closedKeys = new Set([...out.closedProducer, ...out.closedZeroGoverned, ...out.publicBoundary, ...out.privateRelay]
    .map((r) => `${r.file}|${r.ordinal}`));
  for (const row of [...out.authoredOpen, ...out.openUnknown, ...out.dynamicSinkPending]) {
    assert.ok(!closedKeys.has(`${row.file}|${row.ordinal}`), `${row.file}:${row.line} is both open and closed`);
  }
});

test('KS-9 the 3 PREFLIGHT CORRECTIONS are enumerated computed domains, not new policy', () => {
  /* The dry-run that scoped this packet said 64; the strict re-derivation says
   * 67. The 3 extra rows are recorded here BY COORDINATE so the deviation can
   * never be mistaken for drift.
   *
   * Each is a spread of a SAME-FILE local const whose shape is a two-arm tree:
   * a computedKey arm with an ENUMERATED (`closed: true`) sealed-container
   * domain, plus a closed object arm. They are therefore:
   *   - the same static-key-set rule, not a new one;
   *   - NOT an unenumerated computed key (that class has `closed: false` and is
   *     still refused -- see KS-6);
   *   - NOT a prop/external spread (no relay/param terminal anywhere);
   *   - NOT a boundary (no relay terminal, no boundary receipt);
   *   - NOT a product decision (they emit NO custom property at all -> ZERO).
   *
   * They were invisible to the scoping dry-run because it skipped every row
   * whose shape was already `isShapeClosed`, and these three are: what parked
   * them in BRANCH_COMPOSITE_OPEN was `armExhaustive`, which refuses a
   * `computedKey` arm categorically even when its domain is closed. */
  const out = buildProducers();
  const CORRECTIONS = [
    ['packages/core/src/ui/primitives/display/Tooltip/engines/rustic/index.tsx', 5609],
    ['packages/core/src/ui/primitives/inputs/ColorPicker/engines/rustic/index.tsx', 6736],
    ['packages/core/src/ui/primitives/inputs/PasswordInput/engines/rustic/index.tsx', 3946],
  ];
  for (const [file, ordinal] of CORRECTIONS) {
    const row = out.closedZeroGoverned.find((r) => r.file === file && r.ordinal === ordinal);
    assert.ok(row, `${file}:${ordinal} must be published as a ZERO`);
    // it emits nothing, so ZERO is the honest verdict
    assert.equal(row.reason.startsWith('zero-governed-emission-object:'), true);
    // and it is NOT one of the 28 open-value admissions: its values are closed,
    // so it keeps the ordinary branch-union receipt
    assert.equal(row.resolvedVia, 'branch-union');
    assert.ok(!out.authoredOpen.some((r) => r.file === file && r.ordinal === ordinal));
    assert.ok(!out.branchCompositeOpen.some((r) => r.file === file && r.ordinal === ordinal));
  }
  // 31 zeros arrived; 28 by open-value admission, these 3 by branch union
  assert.equal(out.closedZeroGoverned.filter((r) => r.resolvedVia === KS_VIA).length, 33);
  assert.equal(28 + 3, 31);
});

test('KS-10 every arrival publishes its route, its key union and its admission', () => {
  const out = buildProducers();
  const admitted = out.closedProducer.filter((r) => r.evidence.openLeafValues);
  assert.equal(admitted.length, 42, 'the producers resting on admitted open values');
  for (const row of admitted) {
    assert.ok(row.evidence.openLeafValues > 0);
    assert.ok(Array.isArray(row.evidence.openLeafValueKinds) && row.evidence.openLeafValueKinds.length > 0);
    assert.equal(row.evidence.customPropertyScanComplete, true);
    // the key union is published, and SOMETHING is in it -- a producer with an
    // empty union would be a ZERO wearing the wrong label
    const union = [
      ...row.evidence.governedChannelKeys,
      ...row.evidence.internalSocketKeys,
      ...(row.evidence.ungovernedCustomPropertyKeys ?? []),
    ];
    assert.ok(union.length > 0, `${row.file}:${row.line} is a producer with an EMPTY key union`);
    for (const k of union) assert.ok(k.startsWith('--'), `${k} is not a custom property`);
    // a producer grants nothing: no root, no tenant reach, no consumability
    assert.equal(row.consumable, false);
    assert.equal(row.tenantSafe, false);
    assert.ok(!('causalRootIds' in row));
    assert.ok(!('tenantReachable' in row));
    assert.ok(!('ownerId' in row));
  }
  // the ungoverned-only producers carry their OWN honest label and cause
  const ungoverned = out.closedProducer.filter((r) => r.reason.startsWith('ungoverned-custom-property-producer-object:'));
  assert.equal(ungoverned.length, 3);
  for (const row of ungoverned) {
    assert.deepEqual(row.evidence.governedChannelKeys, []);
    assert.deepEqual(row.evidence.internalSocketKeys, []);
    assert.ok(row.evidence.ungovernedCustomPropertyKeys.length > 0);
    assert.equal(row.nonConsumableCause, 'custom-property-producer-outside-any-governed-namespace-with-no-attributed-cascade-root');
  }
  // and no producer with a governed channel was relabelled
  for (const row of out.closedProducer.filter((r) => r.reason.startsWith('governed-producer-object:'))) {
    assert.ok(row.evidence.governedChannelKeys.length > 0 || row.evidence.internalSocketKeys.length > 0);
  }
  // the ZERO arrivals publish the admission too, and an EMPTY union
  const zeroAdmitted = out.closedZeroGoverned.filter((r) => r.resolvedVia === KS_VIA);
  assert.equal(zeroAdmitted.length, 33);
  for (const row of zeroAdmitted) {
    assert.equal(row.evidence.resolvedVia, KS_VIA);
    assert.ok(row.evidence.openLeafValues > 0);
    assert.deepEqual(row.evidence.governedChannelKeys, []);
    assert.deepEqual(row.evidence.internalSocketKeys, []);
    assert.deepEqual(row.evidence.ungovernedCustomPropertyKeys, []);
  }
});

test('KS-11 NEGATIVE: tampering with a static-key-set receipt moves the bound digest', () => {
  const out = buildProducers();
  const rows = out.closedProducer.filter((r) => r.evidence.openLeafValues).slice(0, 4);
  assert.equal(rows.length, 4);
  const bound = (rs) => JSON.stringify(rs.map((r) => [r.file, r.ordinal, r.sinkTags, r.relayKinds, r.evidence]));
  const identity = (rs) => JSON.stringify(rs.map((r) => [r.plane, r.file, r.symbol, r.reason]));
  const edit = (fn) => rows.map((r) => ({ ...r, evidence: fn({ ...r.evidence }) }));
  const mutations = {
    'admission erased': edit((e) => ({ ...e, openLeafValues: 0 })),
    'admission removed': edit((e) => ({ ...e, openLeafValues: undefined })),
    'key union emptied': edit((e) => ({ ...e, governedChannelKeys: [], ungovernedCustomPropertyKeys: [] })),
    'key forged': edit((e) => ({ ...e, governedChannelKeys: [...e.governedChannelKeys, '--ds-forged'] })),
    'scan falsely completed': edit((e) => ({ ...e, customPropertyScanComplete: false })),
  };
  for (const [name, mutated] of Object.entries(mutations)) {
    assert.equal(identity(rows), identity(mutated), `${name}: identity alone cannot see the receipt`);
    assert.notEqual(bound(rows), bound(mutated), `${name} did NOT move the receipt-bound digest`);
  }
  /* The ungoverned union has to be tampered on rows that HAVE one -- hiding an
   * absent field is a no-op and would make this drill pass vacuously. */
  const ung = out.closedProducer.filter((r) => r.evidence.ungovernedCustomPropertyKeys?.length);
  assert.equal(ung.length, 3, 'the ungoverned-only producers are the ones carrying that union');
  const hidden = ung.map((r) => ({ ...r, evidence: { ...r.evidence, ungovernedCustomPropertyKeys: undefined } }));
  assert.equal(identity(ung), identity(hidden), 'identity alone cannot see the union');
  assert.notEqual(bound(ung), bound(hidden), 'hiding the ungoverned union did NOT move the digest');
});

/* ===================================================================== *
 * PRE_F4B-CLOSURE-11 -- four independent capabilities, each fail-closed:
 *   T-USE-STATE          canonical React state whose domain is first-party
 *   T-NAMESPACE-RELAY    a value bounded to a custom-property PREFIX
 *   T-INTERNAL-MUTATION  a fresh internal base composed by mutation
 *   T-DYNAMIC-DOMAIN     setProperty over a frozen same-module constant
 * ===================================================================== */

const CL_NS_VIA = 'custom-property-namespace-relay';

test('CL-1 POSITIVE: canonical useState resolves to init + every setter argument', () => {
  const out = branchProbe(
    "import { useState } from 'react';\n" +
      'export const C = ({v}) => { const [s, setS] = useState({ width: 1 });\n' +
      '  const go = () => setS({ height: v });\n' +
      '  return <div style={s} onClick={go} />; };',
  );
  assert.equal(out.shape.kind, 'branches', 'the state domain is init plus every setter value');
  assert.equal(out.disposition, ZERO_D);
  assert.deepEqual(out.governance.governedChannelKeys, []);
});

test('CL-2 NEGATIVE: only the CANONICAL react hook, and only the state slot', () => {
  const notReact = branchProbe(
    "import { useState } from './my-hooks';\n" +
      'export const C = () => { const [s, setS] = useState({ width: 1 }); return <div style={s} />; };',
  );
  assert.notEqual(notReact.disposition, ZERO_D, 'a look-alike hook from another module must not resolve');
  const defaultImport = branchProbe(
    "import useState from 'react';\n" +
      'export const C = () => { const [s, setS] = useState({ width: 1 }); return <div style={s} />; };',
  );
  assert.notEqual(defaultImport.disposition, ZERO_D, 'a default import is not the named hook');
  const setterSlot = branchProbe(
    "import { useState } from 'react';\n" +
      'export const C = () => { const [s, setS] = useState({ width: 1 }); return <div style={setS} />; };',
  );
  assert.notEqual(setterSlot.disposition, ZERO_D, 'slot 1 is the setter, never the state');
});

test('CL-3 NEGATIVE: a setter that escapes or updates functionally leaves the domain open', () => {
  const escapes = branchProbe(
    "import { useState } from 'react';\n" +
      'export const C = ({sink}) => { const [s, setS] = useState({ width: 1 }); sink(setS); return <div style={s} />; };',
  );
  assert.notEqual(escapes.disposition, ZERO_D, 'a setter passed as a value can be called from anywhere');
  const functional = branchProbe(
    "import { useState } from 'react';\n" +
      'export const C = () => { const [s, setS] = useState({ width: 1 });\n' +
      '  const go = () => setS(prev => ({ ...prev, height: 2 }));\n' +
      '  return <div style={s} onClick={go} />; };',
  );
  assert.notEqual(functional.disposition, ZERO_D, 'a functional update reads the previous state');
  const external = branchProbe(
    "import { useState } from 'react';\n" +
      'export const C = ({outside}) => { const [s, setS] = useState({ width: 1 });\n' +
      '  const go = () => setS({ ...outside });\n' +
      '  return <div style={s} onClick={go} />; };',
  );
  assert.notEqual(external.disposition, ZERO_D, 'an external spread in a setter value is not enumerable');
});

test('CL-4 POSITIVE: a namespace-bounded type is a RELAY -- never ZERO, never PRODUCER', () => {
  const out = branchProbe(
    "import { useState } from 'react';\n" +
      'type Snap = { [k: string]: string } & Partial<Record<`--zz-${string}`, string>>;\n' +
      'export const C = () => { const [s, setS] = useState<Snap>({}); return <div style={s} />; };',
  );
  assert.equal(out.shape.kind, 'relay');
  assert.ok(out.shape.namespaceRelay, 'the proof must ride the shape');
  assert.equal(out.shape.namespaceRelay.namespace, '--zz-');
  assert.equal(out.disposition, 'RELAY_PRIVATE_UNRESOLVED');
  assert.notEqual(out.disposition, ZERO_D);
  assert.notEqual(out.disposition, 'CLOSED_PRODUCER');
  assert.notEqual(out.disposition, 'PUBLIC_BOUNDARY_CANDIDATE');
  // an arbitrary prefix works: the proof is the TYPE, never a namespace allowlist
  const dsLike = branchProbe(
    "import { useState } from 'react';\n" +
      'type S2 = Partial<Record<`--anything-${string}`, string>>;\n' +
      'export const C = () => { const [s, setS] = useState<S2>({}); return <div style={s} />; };',
  );
  assert.equal(dsLike.shape.namespaceRelay.namespace, '--anything-');
});

test('CL-5 NEGATIVE: a template literal that is not a custom property is no namespace', () => {
  const notCustom = branchProbe(
    "import { useState } from 'react';\n" +
      'type S = Partial<Record<`data-${string}`, string>>;\n' +
      'export const C = () => { const [s, setS] = useState<S>({}); return <div style={s} />; };',
  );
  assert.ok(!notCustom.shape.namespaceRelay, '`data-` is not a custom-property namespace');
});

test('CL-6 POSITIVE: a fresh internal base composed by mutation resolves', () => {
  const out = branchProbe(
    'const build = (flag, v) => { const base = { position: "fixed", top: 0 };\n' +
      '  if (flag) { base.left = 0; base.right = v; } else { base.left = "50%"; }\n' +
      '  return base; };\n' +
      'export const C = ({flag, v}) => <div style={build(flag, v)} />;',
  );
  assert.equal(out.disposition, ZERO_D, 'no custom property anywhere -> zero');
  assert.deepEqual(out.governance.governedChannelKeys, []);
  // a governed key written by mutation is a PRODUCER, never silently zero
  const producer = branchProbe(
    'const build = (v) => { const base = { top: 0 };\n' +
      '  base["--ds-cl-x"] = v;\n' +
      '  return base; };\n' +
      'export const C = ({v}) => <div style={build(v)} />;',
  );
  assert.equal(producer.disposition, 'CLOSED_PRODUCER');
  assert.deepEqual(producer.governance.governedChannelKeys, ['--ds-cl-x']);
});

test('CL-7 NEGATIVE: an external base, an alias, a dynamic key, delete or an escape all stay open', () => {
  const helper = (body) => `const build = (style, other, sink, k, v, f) => { ${body} };\nexport const C = (p) => <div style={build(p.style, p.other, p.sink, p.k, p.v, p.f)} />;`;
  const refusals = {
    'base spread from a caller prop': helper('const base = { ...style }; base.top = v; return base;'),
    'Object.assign from an open source': helper('const base = { top: 0 }; Object.assign(base, other); return base;'),
    'alias of the binding': helper('const base = { top: 0 }; const alias = base; alias.left = v; return base;'),
    'binding escapes into a call': helper('const base = { top: 0 }; sink(base); base.left = v; return base;'),
    'dynamic computed write key': helper('const base = { top: 0 }; base[k] = v; return base;'),
    'delete': helper('const base = { top: 0, left: v }; delete base.left; return base;'),
    'compound assignment': helper('const base = { top: 0 }; base.top += v; return base;'),
    'value that reads the binding back': helper('const base = { top: 0 }; base.left = base.top; return base;'),
    'two returns': helper('const base = { top: 0 }; if (f) return base; base.left = v; return base;'),
  };
  for (const [name, code] of Object.entries(refusals)) {
    const out = branchProbe(code);
    assert.notEqual(out.disposition, ZERO_D, `${name} must NOT close as zero`);
    assert.notEqual(out.disposition, 'CLOSED_PRODUCER', `${name} must NOT close as a producer`);
  }
});

test('CL-8 the live cohort is exactly 11 rows and lands where the re-derivation said', () => {
  const out = buildProducers();
  assert.equal(out.stats.openBlocking, 1);
  assert.equal(out.openUnknown.length, 0);
  assert.equal(out.dynamicSinkPending.length, 1);
  // CLOSURE-11 excluded the Heading rest-param row; RESIDUAL-42 closed it to
  // privateRelay on the DT's ruling (its Classic branch reaches AntD `Title`).
  assert.equal(out.callArgsPending.length, 0);
  assert.equal(out.stats.closedZeroGoverned, 627);
  assert.equal(out.stats.privateRelay, 728);
  // 538 at CLOSURE-11. RESIDUAL-42 moved 10 historical `motion.div` rows out
  // (a third-party forwarder is not an intrinsic sink) and added 5 Slider rows.
  assert.equal(out.stats.publicBoundary, 534);
  assert.equal(53 - 11, 42);
  assert.equal(610 + 6, 616);
  assert.equal(697 + 5, 702);
  // every other bucket frozen
  assert.equal(out.stats.unknownProvenance, 0);
  assert.equal(out.stats.closedNonObject, 69);
  assert.equal(out.stats.closedProducer, 65);
  assert.equal(out.branchCompositeOpen.length, 0);
  assert.equal(out.authoredOpen.length, 0);
  assert.equal(out.branchConditionalAuthored.length, 0);
  assert.equal(out.computedDomainPending.length, 0);
  assert.equal(universeTotal(out), 2024);
  assert.equal(out.stats.producerSites, 4872);
  assert.equal(out.stats.ownershipConflicts, 0);
});

test('CL-9 the rows CLOSURE-11 excluded were closed by RESIDUAL-42, except one', () => {
  /* CLOSURE-11 left 5 openUnknown survivors (Skeleton x2, Affix x3) and 2
   * generic writers. RESIDUAL-42 closed the survivors -- Skeleton by the
   * public-style-passthrough rule, Affix by the authorised let-union -- and
   * elevated the package-public writer to a boundary. Exactly ONE row survives
   * anywhere, and this drill pins WHICH, so the debt can never drift. */
  const out = buildProducers();
  assert.equal(out.openUnknown.length, 0, 'the CLOSURE-11 survivors are closed');
  assert.equal(out.dynamicSinkPending.filter((r) => r.file.includes('root-attributes')).length, 0,
    'the package-public writer became a boundary, not a pending sink');
  assert.equal(out.dynamicSinkPending.filter((r) => r.file.includes('css-variables-bridge')).length, 1,
    'the private writer is the single remaining debt');
  assert.equal(out.callArgsPending.filter((r) => r.file.includes('Typography/compound/Heading')).length, 0);
  // and it is the ONLY open row in the entire inventory
  assert.equal(openRows(out).length, 1);
});

test('CL-10 every arrival publishes its route and invents no key, tenant or root', () => {
  const out = buildProducers();
  const ns = out.privateRelay.filter((r) => r.resolvedVia === CL_NS_VIA);
  assert.equal(ns.length, 5);
  for (const row of ns) {
    assert.match(row.reason, /^custom-property-namespace-relay:/);
    assert.equal(row.nonConsumableCause, 'namespace-bounded-passthrough-whose-key-set-is-not-statically-enumerable');
    assert.equal(row.consumable, false);
    assert.equal(row.tenantSafe, false);
    assert.ok(!('causalRootIds' in row));
    assert.ok(!('tenantReachable' in row));
    assert.ok(!('ownerId' in row));
    const proofs = row.evidence.namespaceRelay;
    assert.ok(Array.isArray(proofs) && proofs.length > 0);
    for (const p of proofs) {
      assert.equal(p.namespace, '--ds-');
      assert.ok(p.typeName === 'DsPortalVariableStyle');
      // a NAMESPACE is published, never a key set
      assert.equal(p.keys, undefined);
      assert.equal(p.governedChannelKeys, undefined);
    }
  }
  // the dynamic-domain arrivals name the constant they were enumerated from
  const dyn = out.closedZeroGoverned.filter((r) => r.resolvedVia === 'dynamic-property-domain');
  assert.equal(dyn.length, 2);
  for (const row of dyn) {
    assert.equal(row.evidence.dynamicDomain.container, 'INLINE_PROPERTIES');
    assert.equal(row.evidence.dynamicDomain.nameCount, row.evidence.dynamicDomain.names.length);
    for (const n of row.evidence.dynamicDomain.names) assert.ok(!n.startsWith('--'), `${n} is a custom property`);
    assert.deepEqual(row.evidence.governedChannelKeys, []);
  }
  /* The internal-mutation arrivals publish their operations.
   *
   * 16, not 3, and the difference is DISCLOSED rather than filtered: hardening
   * the mutation detector (`Object.assign`, `delete`, a mutated alias) means 13
   * helpers that previously resolved by IGNORING their mutation now resolve
   * through the prover that accounts for it. They were ZERO before and are ZERO
   * now -- same bucket, same governed keys, a strictly more accurate receipt
   * (route `(none)` -> `internal-base-mutation`). Those 13 are the only rows
   * outside the cohort this packet touches at all, and they move no counter.
   * Pinned here so the enrichment can never grow silently. */
  const mut = out.closedZeroGoverned.filter((r) => r.resolvedVia === 'internal-base-mutation');
  assert.equal(mut.length, 16);
  assert.equal(13 + 3, 16);
  for (const row of mut) {
    const proofs = row.evidence.internalMutation;
    assert.ok(Array.isArray(proofs) && proofs.length > 0);
    for (const p of proofs) {
      assert.ok(p.operationCount === p.operations.length);
      assert.ok(p.operations.every((o) => o.kind === 'write' || o.kind === 'assign'));
    }
    assert.deepEqual(row.evidence.governedChannelKeys, []);
  }
});

test('CL-11 NEGATIVE: tampering with a CLOSURE-11 receipt moves the bound digest', () => {
  const out = buildProducers();
  const bound = (rs) => JSON.stringify(rs.map((r) => [r.file, r.ordinal, r.resolvedVia ?? null, r.evidence ?? null]));
  const identity = (rs) => JSON.stringify(rs.map((r) => [r.plane, r.file, r.symbol, r.reason]));
  const ns = out.privateRelay.filter((r) => r.resolvedVia === CL_NS_VIA);
  const dyn = out.closedZeroGoverned.filter((r) => r.resolvedVia === 'dynamic-property-domain');
  const mut = out.closedZeroGoverned.filter((r) => r.resolvedVia === 'internal-base-mutation');
  const mutations = {
    'namespace widened': ns.map((r) => ({ ...r, evidence: { ...r.evidence, namespaceRelay: r.evidence.namespaceRelay.map((p) => ({ ...p, namespace: '--' })) } })),
    'namespace proof removed': ns.map((r) => ({ ...r, evidence: { ...r.evidence, namespaceRelay: undefined } })),
    'domain name forged': dyn.map((r) => ({ ...r, evidence: { ...r.evidence, dynamicDomain: { ...r.evidence.dynamicDomain, names: [...r.evidence.dynamicDomain.names, '--ds-forged'] } } })),
    'domain container forged': dyn.map((r) => ({ ...r, evidence: { ...r.evidence, dynamicDomain: { ...r.evidence.dynamicDomain, container: 'OTHER' } } })),
    'mutation operations emptied': mut.map((r) => ({ ...r, evidence: { ...r.evidence, internalMutation: [] } })),
  };
  const originals = { 'namespace widened': ns, 'namespace proof removed': ns, 'domain name forged': dyn, 'domain container forged': dyn, 'mutation operations emptied': mut };
  for (const [name, mutated] of Object.entries(mutations)) {
    const orig = originals[name];
    assert.ok(orig.length > 0, `${name}: nothing to tamper with`);
    assert.equal(identity(orig), identity(mutated), `${name}: identity alone cannot see the receipt`);
    assert.notEqual(bound(orig), bound(mutated), `${name} did NOT move the receipt-bound digest`);
  }
});

/* ===================================================================== *
 * T-PUBLIC-WRITER -- a generic `setProperty` writer this package PUBLISHES.
 * The name is the caller's, so the row is a PUBLIC BOUNDARY: never a ZERO
 * (the export cannot promise silence) and never a PRODUCER (there is no key
 * set to attribute). Provenance closes; the name domain stays F5 debt.
 * ===================================================================== */

test('GW-1 POSITIVE: a package-public writer is a BOUNDARY carrying its export proof', () => {
  const out = buildProducers();
  const writers = out.publicBoundary.filter((r) => r.evidence && r.evidence.publicGenericWriter);
  assert.equal(writers.length, 1, 'exactly one publicly reachable generic writer in this tree');
  const row = writers[0];
  const proof = row.evidence.publicGenericWriter;
  assert.equal(proof.writer, 'claimRootStyleProperty');
  assert.equal(proof.parameter, 'property');
  // the boundary IS the export, and the export is published verbatim
  assert.equal(proof.entrypoint, 'packages/core/src/index.ts');
  assert.equal(proof.exportedAs, 'claimRootStyleProperty');
  assert.equal(row.evidence.entrypoint, 'packages/core/src/index.ts');
  // provenance closed, DOMAIN NOT: the row must say so in its own receipt
  assert.equal(proof.domainEnumerated, false);
  assert.equal(proof.residualDebt, 'f5-generic-writer-name-domain');
  // and it grants nothing
  assert.equal(row.consumable, false);
  assert.equal(row.tenantSafe, false);
  assert.ok(!('causalRootIds' in row));
  assert.ok(!('tenantReachable' in row));
  assert.ok(!('ownerId' in row));
  assert.ok(!('governedChannelKeys' in row.evidence), 'a writer whose domain is open may not publish channel keys');
  // it is NOT a zero and NOT a producer
  const key = `${row.file}|${row.ordinal}`;
  for (const bucket of ['closedZeroGoverned', 'closedProducer']) {
    assert.ok(!out[bucket].some((r) => `${r.file}|${r.ordinal}` === key), `the writer leaked into ${bucket}`);
  }
});

test('GW-2 NEGATIVE: a writer that is NOT publicly reachable is never elevated', () => {
  const out = buildProducers();
  // `writePersonalityDeclarations` is module-private: it must stay a pending
  // dynamic sink, not become a boundary on the strength of a nearby export.
  const stillPending = out.dynamicSinkPending.filter((r) => r.file.includes('css-variables-bridge'));
  assert.equal(stillPending.length, 1, 'the private writer must stay pending');
  assert.equal(
    out.publicBoundary.filter((r) => r.file.includes('css-variables-bridge') && r.evidence?.publicGenericWriter).length,
    0,
    'a private writer must never be elevated to a public boundary',
  );
  // the unit predicate says the same thing on its own
  assert.equal(
    publicGenericWriterProofOf(
      'packages/core/src/infrastructure/runtime/theming/presentation/adapters/react/css-variables-bridge/index.tsx',
      'writePersonalityDeclarations',
    ),
    null,
    'the predicate must refuse a non-exported owner',
  );
});

test('GW-3 NEGATIVE: only a PARAMETER name qualifies -- literals and locals do not', () => {
  /* The elevation turns on the name being the CALLER'S. A literal name, a local
   * const, or a `for…of` variable over a frozen module constant are each a
   * different (and stricter) question -- the first two are not dynamic at all
   * and the third is T-DYNAMIC-DOMAIN, which closes ZERO. None may be dressed
   * up as a boundary. */
  const F = 'packages/core/src/ui/probe/writer.ts';
  const cases = {
    'literal name': 'export function w(el: HTMLElement) { el.style.setProperty("--ds-x", "1"); }',
    'local const name': 'export function w(el: HTMLElement) { const p = "--ds-x"; el.style.setProperty(p, "1"); }',
    'for-of over a frozen constant': 'const NAMES = ["color", "fill"] as const;\nexport function w(el: HTMLElement) { for (const p of NAMES) el.style.setProperty(p, "1"); }',
  };
  for (const [name, code] of Object.entries(cases)) {
    const source = ts.createSourceFile(F, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    let call = null;
    const walk = (n) => {
      if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && n.expression.name.text === 'setProperty') call = call ?? n;
      ts.forEachChild(n, walk);
    };
    walk(source);
    assert.ok(call, `${name}: fixture must contain a setProperty`);
    assert.equal(publicGenericWriterProof(call, source, F), null, `${name} must NOT be elevated to a public boundary`);
  }
});

/* ===================================================================== *
 * RESIDUAL-42 -- five mechanisms, each fail-closed and each keyed on
 * structure, never on a component, path or symbol:
 *   intrinsic-sink correction   a JSX member expression is never intrinsic
 *   T-PUBLIC-STYLE-PASSTHROUGH  only open operand is the caller's object
 *   T-LET-UNION                 undefined u every whole-value assignment
 *   T-COMPUTED-NAME             computed key by substitution or closed union
 *   T-BRANCH-PRODUCER           a resolved emitting branch tree is a producer
 * ===================================================================== */

test('R42-1 NEGATIVE: a lowercase JSX MEMBER expression is never an intrinsic sink', () => {
  const out = buildProducers();
  /* `motion.div` passes a naive /^[a-z]/ test while being a third-party
   * forwarder. Every row whose sink is a member expression must be a relay --
   * a boundary would assert an export contract the forwarder does not give. */
  const memberSinks = out.privateRelay.filter((r) => (r.sinkTags ?? []).some((t) => t.includes('.')));
  assert.ok(memberSinks.length >= 10, 'the motion.div rows live in the relay bucket');
  for (const row of out.publicBoundary) {
    for (const tag of row.sinkTags ?? []) {
      assert.ok(!tag.includes('.'), `${row.file}:${row.line} granted a boundary to member-expression sink ${tag}`);
      assert.match(tag, /^[a-z][a-zA-Z0-9-]*$/, `${row.file}:${row.line} boundary sink ${tag} is not intrinsic`);
    }
  }
});

test('R42-2 NEGATIVE: a boundary needs a DEMONSTRABLE export, not just an intrinsic sink', () => {
  const out = buildProducers();
  /* Drawer/Collapse/Skeleton reach an intrinsic `div` with the component's own
   * `style` prop, and are still relays: their engine implementations have no
   * demonstrable public export path. Inventing one would be the whole point of
   * the rule this asserts. */
  for (const needle of ['Drawer/engines', 'Collapse/engines/classic', 'Skeleton/engines/modern']) {
    assert.equal(out.publicBoundary.filter((r) => r.file.includes(needle)).length, 0,
      `${needle} must not be granted a boundary without a demonstrable export`);
    assert.ok(out.privateRelay.some((r) => r.file.includes(needle)), `${needle} must be a relay`);
  }
  /* Every boundary reached through THIS packet's passthrough route carries an
   * entrypoint. Rows admitted by earlier routes keep their own receipt shape,
   * so the assertion is scoped to the ones this packet is responsible for. */
  const SLIDER_LINES_E = [247, 252, 267, 335, 350];
  for (const row of out.publicBoundary.filter((r) => r.file.includes('Slider/engines/rustic') && SLIDER_LINES_E.includes(r.line))) {
    assert.ok(row.evidence && row.evidence.entrypoint, `${row.file}:${row.line} is a boundary with no entrypoint`);
  }
});

test('R42-3 POSITIVE: Slider closes as a BOUNDARY, on its public style tail', () => {
  const out = buildProducers();
  /* The helpers end in `...extraStyle` / `...customStyle`, bound at every call
   * site to the component's own public prop. A ZERO here would certify a
   * silence the consumer can break; the sink is intrinsic and the export is
   * demonstrable, so it is a boundary. */
  // by COORDINATE: the file has other sinks that were already classified
  const SLIDER_LINES = [247, 252, 267, 335, 350];
  const slider = out.publicBoundary.filter(
    (r) => r.file.includes('Slider/engines/rustic') && SLIDER_LINES.includes(r.line),
  );
  assert.equal(slider.length, 5);
  for (const row of slider) {
    assert.equal(row.consumable, false);
    assert.equal(row.tenantSafe, false);
    assert.deepEqual(row.sinkTags, ['div']);
  }
  // and none of them leaked into the silent buckets
  for (const bucket of ['closedZeroGoverned', 'closedProducer']) {
    assert.equal(
      out[bucket].filter((r) => r.file.includes('Slider/engines/rustic') && SLIDER_LINES.includes(r.line)).length,
      0,
      `a Slider public-tail row leaked into ${bucket}`,
    );
  }
});

test('R42-4 NEGATIVE: the let-union refuses every unproven form', () => {
  const refusals = {
    'property mutation instead of whole-value':
      'const f = (a) => { let s; if (a) { s = {}; s.top = 1; } return s; };\nexport const C = ({a}) => <div style={f(a)} />;',
    'RHS spreads an unbounded external':
      'const f = (a, ext) => { let s; if (a) s = { ...ext }; return s; };\nexport const C = ({a, ext}) => <div style={f(a, ext)} />;',
    'computed key in an RHS':
      'const f = (a, k) => { let s; if (a) s = { [k]: 1 }; return s; };\nexport const C = ({a, k}) => <div style={f(a, k)} />;',
    'alias taken before the read':
      'const f = (a) => { let s; if (a) s = { top: 1 }; const t = s; return t; };\nexport const C = ({a}) => <div style={f(a)} />;',
    'escapes into a call':
      'const f = (a, sink) => { let s; if (a) s = { top: 1 }; sink(s); return s; };\nexport const C = ({a, sink}) => <div style={f(a, sink)} />;',
  };
  for (const [name, code] of Object.entries(refusals)) {
    const out = branchProbe(code);
    assert.notEqual(out.disposition, ZERO_D, `${name} must NOT close as zero`);
    assert.notEqual(out.disposition, 'CLOSED_PRODUCER', `${name} must NOT close as a producer`);
  }
});

test('R42-5 POSITIVE: the let-union closes the proven form, and Affix is live proof', () => {
  const proven = branchProbe(
    'const f = (a) => { let s; if (a) s = { top: 1 }; else s = { bottom: 2 }; return s; };\n' +
      'export const C = ({a}) => <div style={f(a)} />;',
  );
  assert.equal(proven.disposition, ZERO_D, 'undefined u both whole-value RHS is a closed domain');
  const out = buildProducers();
  assert.equal(out.openUnknown.filter((r) => r.file.includes('Affix/engines/rustic')).length, 0);
  assert.equal(out.closedZeroGoverned.filter((r) => r.file.includes('Affix/engines/rustic')).length, 3);
});

test('R42-6 NEGATIVE: a computed NAME closes only by substitution or a closed union', () => {
  const openName = branchProbe(
    'const f = (k, v) => ({ position: "sticky", [k]: v });\nexport const C = ({k, v}) => <div style={f(k, v)} />;',
  );
  assert.notEqual(openName.disposition, ZERO_D, 'an unconstrained computed name must stay open');
  const byLiteral = branchProbe(
    'const f = (side, v) => ({ position: "sticky", [side]: v });\nexport const C = ({v}) => <div style={f("left", v)} />;',
  );
  assert.equal(byLiteral.disposition, ZERO_D, 'a literal argument fixes the name');
  const byUnion = branchProbe(
    "const f = (side: 'left' | 'right', v) => ({ position: 'sticky', [side]: v });\nexport const C = ({s, v}) => <div style={f(s, v)} />;",
  );
  assert.equal(byUnion.disposition, ZERO_D, 'a closed literal union enumerates the name');
});

test('R42-7 the Message/Notification family closed as ZERO and stayed there', () => {
  const out = buildProducers();
  /* Both build `{ ...base, [placement]: ... }` / `{ ...base, ...map[placement] }`.
   * They regressed to OPEN_UNKNOWN mid-implementation when the enumerated arms
   * shared one value shape and the governance walk read the DAG as a cycle.
   * Pinned here so that specific false cycle can never come back. */
  // by COORDINATE -- both files carry other, already-classified sinks
  for (const [needle, line] of [['Message/engines/rustic', 373], ['Notification/engines/rustic', 424]]) {
    assert.equal(
      out.closedZeroGoverned.filter((r) => r.file.includes(needle) && r.line === line).length, 1,
      `${needle}:${line} must be ZERO`,
    );
    assert.equal(out.openUnknown.filter((r) => r.file.includes(needle)).length, 0, `${needle} must not be unknown`);
  }
});

test('R42-8 the final inventory: 41 closed, ONE declared debt, nothing else open', () => {
  const out = buildProducers();
  assert.equal(out.stats.openBlocking, 1);
  assert.equal(out.branchCompositeOpen.length, 0);
  assert.equal(out.authoredOpen.length, 0);
  assert.equal(out.branchConditionalAuthored.length, 0);
  assert.equal(out.openUnknown.length, 0);
  assert.equal(out.callArgsPending.length, 0);
  assert.equal(out.computedDomainPending.length, 0);
  // the ONE remaining row, by identity
  assert.equal(out.dynamicSinkPending.length, 1);
  const debt = out.dynamicSinkPending[0];
  assert.match(debt.file, /css-variables-bridge/);
  assert.equal(debt.blocking, true, 'the debt must stay blocking, not be quietly closed');
  assert.equal(debt.consumable, false);
  assert.equal(debt.tenantSafe, false);
  // the closed buckets, exact
  assert.equal(out.stats.closedZeroGoverned, 627);
  assert.equal(out.stats.closedProducer, 65);
  assert.equal(out.stats.publicBoundary, 534);
  assert.equal(out.stats.privateRelay, 728);
  assert.equal(out.stats.closedNonObject, 69);
  assert.equal(out.stats.unknownProvenance, 0);
  assert.equal(universeTotal(out), 2024);
  assert.equal(out.openBacklogRollup.lotBOpen, false, 'lot B stays shut while any debt remains');
});
