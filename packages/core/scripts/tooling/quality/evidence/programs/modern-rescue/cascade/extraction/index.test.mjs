/**
 * Drills del extractor de cascada (PRE_F4B lote A, path A3).
 *
 * `index.mjs` NO tenia ni un test. Emitia un artefacto de 466
 * archivos que dos consumidores downstream leen, escribia al importarse, y
 * documentaba en su cabecera un flag `--write` que ninguna linea de codigo
 * implementaba. Estos drills fijan lo que el contrato v3 + addendum exigen de
 * el, y cada uno planta su propio arbol CSS en `mkdtempSync(tmpdir())`: la
 * unica funcion que toca el arbol real es la de pureza, y precisamente lo que
 * afirma es que NO lo toca.
 *
 * Reparto por contrato (v3 §12): P1, P2 (membresia D1/D2), P4, N13-extract,
 * N15, N16 (+ gemelo Rustic del addendum F-2), N17 (ambos modos del addendum
 * V3-2). Los drills de clasificacion, cubetas y baseline son del lote B.
 */

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  buildEdges,
  edgeSealTuple,
  enumerateRefs,
  isGraphRef,
  OUT_PATH,
  pathEnginesOf,
  readRefIdOf,
  scopeOf,
  selectorEnginesOf,
  serialize,
} from './index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(HERE, 'index.mjs');

/** Plant a css tree in tmpdir and build from it. Nothing real is read. */
function withCss(files, run) {
  const sandbox = mkdtempSync(join(tmpdir(), 'cascade-extract-drill-'));
  try {
    for (const [rel, body] of Object.entries(files)) {
      const abs = join(sandbox, rel);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, body);
    }
    run(buildEdges({ cssRoot: sandbox, cssRootRel: 'fixture/css' }), sandbox);
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
}

const edgeShape = (e) => ({
  from: e.from,
  to: e.to,
  edgeClass: e.edgeClass,
  guardPrimary: e.guardPrimary ?? null,
});

/** Reverse traversal `to -> from`: the ONLY direction reach may use. */
function reachReverse(edges, start) {
  const byTo = new Map();
  for (const e of edges) {
    if (!byTo.has(e.to)) byTo.set(e.to, []);
    byTo.get(e.to).push(e.from);
  }
  const seen = new Set([start]);
  const path = [start];
  const walk = (node) => {
    for (const next of byTo.get(node) ?? []) {
      if (seen.has(next)) continue;
      seen.add(next);
      path.push(next);
      walk(next);
    }
  };
  walk(start);
  return path;
}

/* ------------------------------------------------------------------ P1 --- */

test('P1 golden chain: the stored edge list and the reverse path are exact, not just a count', () => {
  withCss(
    { 'presentation/components/skin/p1.css': `.card { background: var(--ds-x, var(--ds-color-primary)); }` },
    (out) => {
      assert.deepEqual(out.edges.map(edgeShape), [
        {
          from: '--ds-color-primary',
          to: '--ds-x',
          edgeClass: 'leaf-fallback',
          guardPrimary: '--ds-x',
        },
      ]);
      assert.deepEqual(reachReverse(out.edges, '--ds-x'), ['--ds-x', '--ds-color-primary']);
      assert.equal(out.readSites.length, 1);
      assert.equal(out.readSites[0].property, 'background');
      assert.deepEqual(
        out.readSites[0].refs.map((r) => [r.refIndex, r.channel, r.depth, r.role, r.parentRefIndex, r.terminal]),
        [
          [0, '--ds-x', 0, 'primary', null, 'var'],
          [1, '--ds-color-primary', 1, 'fallback', 0, 'none'],
        ],
      );
    },
  );
});

/* ------------------------------------------------------------------ P2 --- */

test('P2 internal sockets are transitable graph nodes and are NEVER in D1/D2', () => {
  withCss(
    {
      'presentation/components/skin/p2.css':
        `.card { color: var(--_ds-bridge, var(--ds-x, var(--ds-color-primary))); }`,
    },
    (out) => {
      const site = out.readSites[0];
      // graphRef: all three are refs of the site, in textual order.
      assert.deepEqual(site.refs.map((r) => r.channel), [
        '--_ds-bridge',
        '--ds-x',
        '--ds-color-primary',
      ]);
      // governedRef: only the --ds-* ones.
      assert.deepEqual(site.refs.filter((r) => r.governed).map((r) => r.channel), [
        '--ds-x',
        '--ds-color-primary',
      ]);
      assert.equal(site.refs.find((r) => r.channel === '--_ds-bridge').governed, false);
      assert.equal(site.refs.find((r) => r.channel === '--_ds-bridge').internalSocket, true);
      // D1 counts governed refs only; the socket is counted apart, never inside.
      assert.equal(out.stats.readRefs, 3);
      assert.equal(out.stats.governedReadRefs, 2);
      assert.equal(out.stats.internalSocketReadRefs, 1);
      // ...and it is still a transitable node: the chain runs THROUGH it.
      assert.deepEqual(out.edges.map(edgeShape), [
        { from: '--ds-x', to: '--_ds-bridge', edgeClass: 'leaf-fallback', guardPrimary: '--_ds-bridge' },
        { from: '--ds-color-primary', to: '--ds-x', edgeClass: 'leaf-fallback', guardPrimary: '--ds-x' },
      ]);
      assert.deepEqual(reachReverse(out.edges, '--_ds-bridge'), [
        '--_ds-bridge',
        '--ds-x',
        '--ds-color-primary',
      ]);
    },
  );
});

/* ------------------------------------------------------------------ P4 --- */

test('P4 a declaration-only chain reaches the root at depth 2 with no fallback edge at all', () => {
  withCss(
    {
      'presentation/components/a.css': `:root { --ds-a: var(--ds-radius-md); }`,
      'foundation/themes/default.css':
        `:root { --ds-radius-md: calc(var(--ds-radius-md-base) * var(--ds-radius-scale)); }`,
    },
    (out) => {
      assert.deepEqual(out.edges.map(edgeShape).sort((a, b) => (a.from < b.from ? -1 : 1)), [
        { from: '--ds-radius-md', to: '--ds-a', edgeClass: 'decl', guardPrimary: null },
        { from: '--ds-radius-md-base', to: '--ds-radius-md', edgeClass: 'decl', guardPrimary: null },
        { from: '--ds-radius-scale', to: '--ds-radius-md', edgeClass: 'decl', guardPrimary: null },
      ]);
      assert.equal(out.stats.edgesByClass['decl-fallback'], 0);
      assert.equal(out.stats.edgesByClass['leaf-fallback'], 0);
      const path = reachReverse(out.edges, '--ds-a');
      assert.ok(path.includes('--ds-radius-scale'), `expected the scale root in ${JSON.stringify(path)}`);
      assert.equal(path.indexOf('--ds-radius-md'), 1, 'depth 1 hop');
    },
  );
});

/* --------------------------------------------------- C2: no shortcut --- */

test('C2 a nested fallback attaches to its PARENT PRIMARY, and the shortcut to the head is never emitted', () => {
  withCss(
    { 'presentation/components/x.css': `:root { --ds-x: var(--ds-y, var(--ds-root)); }` },
    (out) => {
      assert.deepEqual(out.edges.map(edgeShape), [
        { from: '--ds-y', to: '--ds-x', edgeClass: 'decl', guardPrimary: null },
        { from: '--ds-root', to: '--ds-y', edgeClass: 'decl-fallback', guardPrimary: '--ds-y' },
      ]);
      assert.equal(
        out.edges.filter((e) => e.from === '--ds-root' && e.to === '--ds-x').length,
        0,
        'the schemaVersion 1 shortcut root -> x must not exist: it hides whether y has a producer',
      );
      assert.deepEqual(reachReverse(out.edges, '--ds-x'), ['--ds-x', '--ds-y', '--ds-root']);
    },
  );
});

/* ----------------------------------------------------------------- N15 --- */

test('N15 orientation: traversing the STORED direction from the leaf reaches nothing; only to -> from works', () => {
  withCss(
    { 'presentation/components/x.css': `:root { --ds-leaf: var(--ds-mid); --ds-mid: var(--ds-root); }` },
    (out) => {
      // stored direction is from = source read, to = declared head.
      const forward = new Map();
      for (const e of out.edges) {
        if (!forward.has(e.from)) forward.set(e.from, []);
        forward.get(e.from).push(e.to);
      }
      assert.deepEqual(forward.get('--ds-leaf') ?? [], [], 'the leaf is nobody’s source');
      assert.deepEqual(reachReverse(out.edges, '--ds-leaf'), ['--ds-leaf', '--ds-mid', '--ds-root']);
      // ...and the stored direction runs CONSUMER-ward: from the root it walks
      // down to the paint, which is the opposite of the reach question. That is
      // precisely why `to -> from` has to be named and tested.
      assert.deepEqual(forward.get('--ds-root') ?? [], ['--ds-mid']);
      assert.deepEqual(forward.get('--ds-mid') ?? [], ['--ds-leaf']);
    },
  );
});

/* --------------------------------------------------------- N16 + twin --- */

test('N16 a shared file narrowed by .ds-engine-modern is admissible in Modern only', () => {
  withCss(
    {
      'presentation/components/skin/shared.css':
        `.ds-engine-modern .thing { color: var(--ds-x); }`,
    },
    (out) => {
      const scope = out.scopeTable[out.readSites[0].scopeId];
      assert.deepEqual(scope.pathEngines, ['modern', 'rustic', 'classic']);
      assert.deepEqual(scope.selectorEngines, ['modern']);
      assert.deepEqual(scope.effectiveEngines, ['modern']);
      assert.equal(scope.status, 'ok');
    },
  );
});

test('N16 twin: a shared file narrowed by .rottay-input--rustic is admissible in Rustic only', () => {
  withCss(
    {
      'presentation/components/skin/search-command-bar.css':
        `.rottay-input--rustic { border-color: var(--ds-x); }`,
    },
    (out) => {
      const scope = out.scopeTable[out.readSites[0].scopeId];
      assert.deepEqual(scope.effectiveEngines, ['rustic']);
      assert.ok(!scope.effectiveEngines.includes('modern'));
      assert.ok(!scope.effectiveEngines.includes('classic'));
    },
  );
});

test('the closed grammar recognises its three families and ignores at-rule preludes', () => {
  assert.deepEqual(selectorEnginesOf('.ds-engine-classic .x').engines, ['classic']);
  assert.deepEqual(selectorEnginesOf('.ds-card--modern::before').engines, ['modern']);
  assert.deepEqual(selectorEnginesOf('.rottay-scroll-area-rustic::-webkit-scrollbar').engines, ['rustic']);
  // an animation NAME is not an engine discriminator: keyframes names are global.
  const kf = selectorEnginesOf('@keyframes ds-button-pulse-modern 0%');
  assert.equal(kf.mode, 'set');
  assert.deepEqual(kf.engines, ['modern', 'rustic', 'classic']);
  // a comma group is a UNION of alternatives...
  assert.deepEqual(selectorEnginesOf('.a--modern, .b--rustic').engines, ['modern', 'rustic']);
  // ...while a descendant chain is an INTERSECTION, and this one is empty.
  assert.deepEqual(selectorEnginesOf('.ds-engine-modern .b--rustic').engines, []);
});

/* ----------------------------------------------------------------- N17 --- */

test('N17a an engine word outside the closed grammar is `unknown`, sub-accredits, and is published', () => {
  withCss(
    {
      'presentation/components/skin/odd.css':
        `[data-engine="modern"] .thing { color: var(--ds-x); }`,
    },
    (out) => {
      const scope = out.scopeTable[out.readSites[0].scopeId];
      assert.equal(scope.selectorEngines, 'unknown');
      assert.deepEqual(scope.effectiveEngines, [], 'unknown must NEVER expand to every engine');
      assert.equal(scope.status, 'unadjudicated');
      assert.equal(out.unadjudicatedSelectors.length, 1);
      assert.equal(out.stats.scope.unadjudicatedSelectors, 1);
      assert.equal(out.stats.scope.scopeContradictions, 0);
    },
  );
});

test('N17b a recognised discriminator whose intersection is impossible is a scope CONTRADICTION', () => {
  withCss(
    {
      'runtime/engines/rustic/skin/impossible.css':
        `.ds-engine-modern .thing { color: var(--ds-x); }`,
    },
    (out) => {
      const scope = out.scopeTable[out.readSites[0].scopeId];
      assert.deepEqual(scope.pathEngines, ['rustic']);
      assert.deepEqual(scope.selectorEngines, ['modern']);
      assert.deepEqual(scope.effectiveEngines, []);
      assert.equal(scope.status, 'contradiction');
      assert.equal(out.scopeContradictions.length, 1);
      assert.equal(out.stats.scope.unadjudicatedSelectors, 0);
    },
  );
});

test('pathEnginesOf reads the engine tree and defaults to shared', () => {
  assert.deepEqual(pathEnginesOf('x/runtime/engines/modern/skin/a.css'), ['modern']);
  assert.deepEqual(pathEnginesOf('x/runtime/engines/rustic/skin/a.css'), ['rustic']);
  assert.deepEqual(pathEnginesOf('x/runtime/engines/classic/theme.css'), ['classic']);
  assert.deepEqual(pathEnginesOf('x/presentation/components/skin/a.css'), ['modern', 'rustic', 'classic']);
  assert.equal(scopeOf('x/presentation/components/a.css', '').status, 'ok');
});

/* ---------------------------------------------------------- unit laws --- */

test('byKind counts DECLARATIONS while edges counts REFERENCES: two units, both real', () => {
  withCss(
    { 'presentation/components/x.css': `[data-part='a'] { --ds-x: var(--ds-p) var(--ds-q); }` },
    (out) => {
      assert.equal(out.stats.byKind['data-attr-select'], 1, 'one declaration');
      assert.equal(out.edges.filter((e) => e.kind === 'data-attr-select').length, 2, 'two references');
    },
  );
});

test('enumerateRefs marks the terminal of every reference', () => {
  const refs = enumerateRefs('var(--ds-a) var(--ds-b, 4px) var(--ds-c, var(--ds-d))');
  assert.deepEqual(refs.map((r) => [r.channel, r.terminal, r.role, r.depth]), [
    ['--ds-a', 'none', 'primary', 0],
    ['--ds-b', 'literal', 'primary', 0],
    ['--ds-c', 'var', 'primary', 0],
    ['--ds-d', 'none', 'fallback', 1],
  ]);
});

test('serialize is stable: the same tree serialises byte-identically twice', () => {
  withCss(
    { 'presentation/components/skin/a.css': `.a { color: var(--ds-x, var(--ds-color-primary)); }` },
    (out, sandbox) => {
      const again = buildEdges({ cssRoot: sandbox, cssRootRel: 'fixture/css' });
      assert.equal(serialize(out), serialize(again));
      assert.equal(serialize(out).endsWith('\n'), true);
      assert.deepEqual(JSON.parse(serialize(out)).stats.edges, out.stats.edges);
    },
  );
});

/* ------------------------------------------------------- N13 (extract) --- */

test('N13 --check is PURE: it changes neither mtime nor bytes of the artifact', () => {
  const before = { mtime: statSync(OUT_PATH).mtimeMs, bytes: readFileSync(OUT_PATH) };
  execFileSync(process.execPath, [SCRIPT, '--check'], { stdio: 'pipe' });
  execFileSync(process.execPath, [SCRIPT], { stdio: 'pipe' }); // no flag == --check
  const after = { mtime: statSync(OUT_PATH).mtimeMs, bytes: readFileSync(OUT_PATH) };
  assert.equal(after.mtime, before.mtime, '--check must not touch mtime');
  assert.ok(before.bytes.equals(after.bytes), '--check must not touch bytes');
});

test('N13 an unknown flag exits 2 with usage, and never writes', () => {
  const before = readFileSync(OUT_PATH);
  let code = 0;
  try {
    execFileSync(process.execPath, [SCRIPT, '--bogus'], { stdio: 'pipe' });
  } catch (error) {
    code = error.status;
  }
  assert.equal(code, 2);
  assert.ok(before.equals(readFileSync(OUT_PATH)));
});

test('H5 import-purity: a FRESH process that only imports the module writes nothing', () => {
  // The regression this names is real: the schemaVersion 1 extractor wrote the
  // artifact as a side effect of `import`. Asserting it from THIS process is
  // worthless -- the module is already imported at the top of this file, so the
  // write, if any, happened before the snapshot. The only probative shape is a
  // new process whose entire body is the import.
  const before = { mtime: statSync(OUT_PATH).mtimeMs, bytes: readFileSync(OUT_PATH) };
  const sandbox = mkdtempSync(join(tmpdir(), 'cascade-extract-import-'));
  try {
    const probe = join(sandbox, 'probe.mjs');
    writeFileSync(probe, `await import(${JSON.stringify(pathToFileURL(SCRIPT).href)});\n`);
    execFileSync(process.execPath, [probe], { stdio: 'pipe' });
    const after = { mtime: statSync(OUT_PATH).mtimeMs, bytes: readFileSync(OUT_PATH) };
    assert.equal(after.mtime, before.mtime, 'import must not touch mtime');
    assert.ok(before.bytes.equals(after.bytes), 'import must not touch bytes');
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
});

/* ------------------------------------------------------------------ H1 --- */

test('H1 calc-offset: additive and subtractive calc declarations stay in the graph', () => {
  withCss(
    {
      'foundation/z-index.css': `:root {
         --ds-z-index-alert: calc(var(--ds-z-index-base) + 1);
         --ds-gap-tight: calc(var(--ds-gap-base) - 4px);
       }`,
      'presentation/components/console.css':
        `:root { --ds-console-min-height: var(--ds-console-base, calc(100vh - 108px)); }`,
    },
    (out) => {
      assert.equal(out.stats.unclassifiedCalc, 0);
      assert.deepEqual(out.stats.unclassifiedSamples, []);
      assert.equal(out.stats.byKind['calc-offset'], 3, 'all three additive shapes are classified');
      // the heads are DECLARED and each carries an inbound edge, with scope.
      const heads = out.edges.map((e) => e.to);
      assert.ok(heads.includes('--ds-z-index-alert'));
      assert.ok(heads.includes('--ds-gap-tight'));
      assert.ok(heads.includes('--ds-console-min-height'));
      assert.deepEqual(edgeShape(out.edges.find((e) => e.to === '--ds-z-index-alert')), {
        from: '--ds-z-index-base',
        to: '--ds-z-index-alert',
        edgeClass: 'decl',
        guardPrimary: null,
      });
      for (const edge of out.edges) {
        assert.equal(typeof edge.scopeId, 'number', 'every edge carries its scope');
        assert.ok(out.derivationKinds.includes(edge.kind), `kind ${edge.kind} must be in the closed vocabulary`);
      }
    },
  );
});

/* ------------------------------------------------------------------ H2 --- */

test('H2 every literal pin carries its scopeId, shared / Modern / Rustic alike', () => {
  withCss(
    {
      'presentation/components/skin/shared.css': `.thing { --ds-pin-shared: 4px; }`,
      'runtime/engines/modern/skin/m.css': `.thing { --ds-pin-modern: 4px; }`,
      'runtime/engines/rustic/skin/r.css': `.thing { --ds-pin-rustic: 4px; }`,
    },
    (out) => {
      assert.equal(out.literalPins.length, 3);
      const scopeOfPin = (channel) =>
        out.scopeTable[out.literalPins.find((p) => p.channel === channel).scopeId].effectiveEngines;
      assert.deepEqual(scopeOfPin('--ds-pin-shared'), ['modern', 'rustic', 'classic']);
      assert.deepEqual(scopeOfPin('--ds-pin-modern'), ['modern']);
      assert.deepEqual(scopeOfPin('--ds-pin-rustic'), ['rustic']);
      for (const pin of out.literalPins) assert.equal(typeof pin.scopeId, 'number');
    },
  );
});

test('H2 a literal pin whose scope is an impossible intersection is a contradiction too', () => {
  withCss(
    { 'runtime/engines/rustic/skin/r.css': `.ds-engine-modern .thing { --ds-pin: 4px; }` },
    (out) => {
      const scope = out.scopeTable[out.literalPins[0].scopeId];
      assert.deepEqual(scope.effectiveEngines, []);
      assert.equal(scope.status, 'contradiction');
      assert.equal(out.scopeContradictions.length, 1);
    },
  );
});

/* ------------------------------------------------------------------ H3 --- */

test('H3 readRefId is materialised with its exact serialisation, unique and stable', () => {
  withCss(
    {
      'presentation/components/skin/a.css':
        `.a { color: var(--ds-x, var(--ds-color-primary)); background: var(--ds-y); }`,
    },
    (out, sandbox) => {
      const ids = [];
      for (const site of out.readSites) {
        for (const ref of site.refs) {
          const expected = createHash('sha256')
            .update(`${site.readSiteId}|${ref.refIndex}`)
            .digest('hex');
          assert.equal(ref.readRefId, expected, 'sha256(readSiteId + "|" + refIndex), nothing else');
          assert.equal(ref.readRefId, readRefIdOf(site.readSiteId, ref.refIndex));
          ids.push(ref.readRefId);
        }
      }
      assert.equal(ids.length, 3);
      assert.equal(new Set(ids).size, ids.length, 'readRefId is unique');
      const again = buildEdges({ cssRoot: sandbox, cssRootRel: 'fixture/css' });
      assert.deepEqual(
        again.readSites.flatMap((s) => s.refs.map((r) => r.readRefId)),
        ids,
        'and stable across runs',
      );
    },
  );
});

/* ------------------------------------------------------------------ H4 --- */

test('H4 edges[] is closed to graphRef endpoints; the four combinations are separated', () => {
  withCss(
    {
      'presentation/components/x.css': `:root {
         --ds-a: var(--ds-b);
         --ds-c: var(--rh-foreign);
         --rh-head: var(--ds-d);
         --rh-other: var(--ant-foreign);
       }`,
    },
    (out) => {
      assert.deepEqual(out.edges.map(edgeShape), [
        { from: '--ds-b', to: '--ds-a', edgeClass: 'decl', guardPrimary: null },
      ]);
      for (const edge of out.edges) {
        assert.ok(isGraphRef(edge.from) && isGraphRef(edge.to));
      }
      const foreign = out.foreignEdges.map((e) => [e.from, e.to, e.reason]).sort();
      assert.deepEqual(foreign, [
        ['--ant-foreign', '--rh-other', 'foreign-both'],
        ['--ds-d', '--rh-head', 'foreign-head'],
        ['--rh-foreign', '--ds-c', 'foreign-source'],
      ]);
      // and none of them leaked into the normative graph
      for (const edge of out.foreignEdges) {
        assert.equal(
          out.edges.some((e) => e.from === edge.from && e.to === edge.to),
          false,
        );
        assert.equal(typeof edge.scopeId, 'number');
        assert.ok(edge.kind && edge.file && edge.line);
      }
      assert.equal(out.stats.foreignEdges, 3);
      assert.ok(out.digests.foreignEdges && out.digests.edges);
      assert.notEqual(out.digests.foreignEdges, out.digests.edges);
    },
  );
});

test('H4 the foreign digest seals the FULL evidence, in the exact documented order', () => {
  withCss(
    { 'presentation/components/x.css': `:root { --ds-c: var(--rh-foreign); }` },
    (out) => {
      const rows = out.foreignEdges;
      assert.equal(rows.length, 1);
      // the exact formula, recomputed here rather than trusted
      assert.deepEqual(edgeSealTuple(rows[0]), [
        rows[0].from,
        rows[0].to,
        rows[0].kind,
        rows[0].edgeClass,
        rows[0].guardPrimary ?? null,
        rows[0].file,
        rows[0].line,
        rows[0].scopeId,
        rows[0].reason,
      ]);
      const formula = (list) => createHash('sha256').update(JSON.stringify(list.map(edgeSealTuple))).digest('hex');
      assert.equal(out.digests.foreignEdges, formula(rows));
      assert.equal(out.digests.edges, formula(out.edges));

      // ...and it MOVES when the evidence moves. An earlier form hashed only
      // endpoints/class/file/line, so these two mutations left it invariant.
      const mutatedScope = [{ ...rows[0], scopeId: rows[0].scopeId + 1 }];
      assert.notEqual(formula(mutatedScope), out.digests.foreignEdges, 'scopeId must be sealed');
      const mutatedKind = [{ ...rows[0], kind: 'identity' }];
      assert.notEqual(formula(mutatedKind), out.digests.foreignEdges, 'kind must be sealed');
      const mutatedGuard = [{ ...rows[0], guardPrimary: '--ds-anything' }];
      assert.notEqual(formula(mutatedGuard), out.digests.foreignEdges, 'guardPrimary must be sealed');
      const mutatedReason = [{ ...rows[0], reason: 'foreign-both' }];
      assert.notEqual(formula(mutatedReason), out.digests.foreignEdges, 'reason must be sealed');
      // the weak predecessor would NOT have moved on scopeId or kind:
      const weak = (list) =>
        createHash('sha256')
          .update(JSON.stringify(list.map((e) => [e.from, e.to, e.edgeClass, e.file, e.line, e.reason])))
          .digest('hex');
      assert.equal(weak(mutatedScope), weak(rows), 'documents exactly what the old seal could not see');
      assert.equal(weak(mutatedKind), weak(rows));
    },
  );
});
