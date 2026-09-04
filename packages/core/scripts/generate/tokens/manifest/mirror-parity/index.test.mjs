/**
 * @fileoverview Tests de la paridad de espejo.
 *
 * Los oraculos unitarios usan CSS sintetico minimo y verificable a ojo; los de
 * integracion se apoyan en los tres artefactos reales y su procedencia
 * registrada. Ningun test escribe: los artefactos se LEEN.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  realpathSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve as resolvePath, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { packageRoot as findPackageRoot } from '../../../../libraries/repo-root/index.mjs';
import {
  OUTPUT_PATH as COVERAGE_PATH,
  buildChecklists,
  loadCanon,
  loadFacts,
  serialize as serializeChecklists,
} from '../root-checklists/index.mjs';

import {
  OUTPUT_PATH,
  PACKAGE_ROOT,
  TENANTS,
  artifactPath,
  sourcePath,
  blankComments,
  scopeRole,
  declarationsOf,
  occurrenceCount,
  valueSignature,
  surfaceParity,
  valueParity,
  pairwise,
  readsOf,
  cascadeSeverance,
  declarationSites,
  readFloorCorpus,
  floorVerdict,
  tenantSeedAuthority,
  effectiveRoleValues,
  DERIVED_VALUE,
  multiDeclaration,
  authoredLeafPaths,
  build,
  serialize,
} from './index.mjs';

const doc = JSON.parse(readFileSync(OUTPUT_PATH, 'utf8'));

/**
 * Insumos crudos, leidos una sola vez.
 *
 * Varias afirmaciones de abajo no se conforman con la cifra publicada: la
 * RECALCULAN sobre el checklist y los artefactos. Es la unica forma de
 * separar "cambio el alcance de la medicion" de "cambio la realidad medida",
 * que es exactamente lo que se confundio cuando `root-checklist.mjs` se
 * generalizo. Ningun test escribe: los artefactos se LEEN.
 */
// Built in memory, like the generator itself. This file used to read the
// coverage artifact at MODULE TOP LEVEL, so on a clean checkout -- where the
// artifact is gitignored and therefore absent -- the whole suite failed to
// import rather than reporting anything.
const CHECKLISTS = JSON.parse(serializeChecklists(buildChecklists(loadFacts(), loadCanon())));
const ARTIFACT_DECLS = Object.fromEntries(
  TENANTS.map((t) => [
    t,
    declarationsOf(readFileSync(join(PACKAGE_ROOT, artifactPath(t)), 'utf8')),
  ]),
);

/**
 * El patron de dial numerico, PRIMERA fuente de raices de `root-checklist.mjs`.
 * La segunda fuente son los manifiestos de `governance/manifest/cascade/roots/<id>/index.json`.
 * Filtrar por este patron reconstruye exactamente el alcance ANTERIOR a la
 * generalizacion, y es asi como los controles de mas abajo distinguen un
 * ensanche legitimo de una regresion.
 */
const PATTERN_ROOT = /^--ds-[a-z0-9-]+-scale$/;

/**
 * El PISO del design system, leido una sola vez.
 *
 * Es el arbitro de la clasificacion de raices: `rootPinned` frente a
 * `rootFrozen` no se decide por el nombre del canal ni por una lista curada,
 * sino por la FORMA con la que el piso declara ese canal. Los tests de abajo
 * lo usan tal cual esta en disco y, cuando hay que probar los dientes, lo
 * mutan EN MEMORIA — nunca en `src/`.
 */
const FLOOR = readFloorCorpus();

/** Un piso sintetico, para los oraculos unitarios. */
const fakeFloor = (decls) => ({
  dir: 'piso-sintetico',
  excludes: 'n/a',
  excludeReason: 'n/a',
  files: 1,
  channels: Object.keys(decls).length,
  sha256: '0'.repeat(64),
  sites: new Map(Object.entries(decls).map(([ch, value]) => [ch, [{ file: 'piso.css', line: 1, value }]])),
});

/** Copia superficial de un mapa de declaraciones, para mutar sin tocar disco. */
const mutateDecls = (decls, channel, entries) => {
  const copy = new Map(decls);
  if (entries === null) copy.delete(channel);
  else copy.set(channel, entries);
  return copy;
};

/* ─────────────────────────────────────────────────────────────────────────
 * Lectura de declaraciones
 * ───────────────────────────────────────────────────────────────────────── */

test('blankComments conserva offsets y lineas', () => {
  const src = 'a {\n  /* --ds-fantasma: 1px;\n  */ --ds-real: 2px;\n}\n';
  const out = blankComments(src);
  assert.equal(out.length, src.length);
  assert.equal(out.split('\n').length, src.split('\n').length);
  const d = declarationsOf(src);
  assert.deepEqual([...d.keys()], ['--ds-real'], 'un canal comentado no se declara');
});

test('una lectura var() dentro de un valor NO es una declaracion', () => {
  // Forma real del artefacto: `--ds-badge-radius: var(--ds-radius-sm);`
  const d = declarationsOf(":root { --ds-badge-radius: var(--ds-radius-sm); }");
  assert.deepEqual([...d.keys()], ['--ds-badge-radius']);
  assert.equal(d.has('--ds-radius-sm'), false, 'el canal leido no se cuenta como declarado');
});

test('la ultima declaracion de un bloque, sin `;`, tambien cuenta', () => {
  const d = declarationsOf(':root { --ds-a: 1px; --ds-b: 2px }');
  assert.deepEqual([...d.keys()].sort(), ['--ds-a', '--ds-b']);
});

test('una propiedad que no es canal se ignora', () => {
  const d = declarationsOf(":root { color-scheme: dark; --radius-box: 1px; --ds-x: 2px; }");
  assert.deepEqual([...d.keys()], ['--ds-x']);
});

test('identidad != ocurrencias: el mismo canal en dos scopes es UN canal', () => {
  const css = ":root { --ds-x: 1px; }\n:root[data-theme='dark'] { --ds-x: 2px; }";
  assert.equal(declarationsOf(css).size, 1);
  assert.equal(occurrenceCount(css), 2);
});

/* ─────────────────────────────────────────────────────────────────────────
 * Rol de scope
 * ───────────────────────────────────────────────────────────────────────── */

test('scopeRole clasifica los cuatro roles reales del artefacto', () => {
  const T = "html[data-tenant='rottay']";
  assert.equal(scopeRole(T, false), 'base');
  assert.equal(scopeRole(`${T}:not([data-theme='light']):not(.light)`, false), 'default-mode');
  assert.equal(scopeRole(`${T}[data-theme='light']`, false), 'overlay-mode');
  assert.equal(scopeRole(`${T}.dark`, false), 'overlay-mode');
  assert.equal(scopeRole(T, true), 'reduced-motion');
});

test('scopeRole es insensible al estilo de comillas', () => {
  // bithire escribe con comillas dobles y rottay con simples.
  assert.equal(scopeRole('html[data-tenant="bithire"]:not([data-theme="dark"]):not(.dark)', false), 'default-mode');
});

test('el rol viaja con cada declaracion', () => {
  const css = [
    "html[data-tenant='t'] { --ds-x: 1px; }",
    "html[data-tenant='t']:not([data-theme='light']):not(.light) { --ds-x: 2px; }",
    '@media (prefers-reduced-motion: reduce) {',
    "  html[data-tenant='t'] { --ds-x: 0s; }",
    '}',
  ].join('\n');
  assert.deepEqual(declarationsOf(css).get('--ds-x'), [
    { role: 'base', value: '1px' },
    { role: 'default-mode', value: '2px' },
    { role: 'reduced-motion', value: '0s' },
  ]);
});

/* ─────────────────────────────────────────────────────────────────────────
 * Superficie y valor
 * ───────────────────────────────────────────────────────────────────────── */

function fake(rottay, bithire, evnto) {
  return { rottay: declarationsOf(rottay), bithire: declarationsOf(bithire), evnto: declarationsOf(evnto) };
}

test('los seis bolsones mas la interseccion reconstruyen la union', () => {
  const s = surfaceParity(fake(
    ':root { --ds-a: 1px; --ds-b: 1px; --ds-r: 1px; }',
    ':root { --ds-a: 1px; --ds-b: 1px; --ds-x: 1px; }',
    ':root { --ds-a: 1px; }',
  ));
  const sum = Object.values(s.venn).reduce((n, v) => n + v.length, 0);
  assert.equal(sum, s.union, 'el Venn particiona la union sin solapes ni huecos');
  assert.deepEqual(s.venn['only-rottay'], ['--ds-r']);
  assert.deepEqual(s.venn['rottay+bithire-not-evnto'], ['--ds-b']);
  assert.deepEqual(s.venn['all-three'], ['--ds-a']);
});

test('la salida contesta "que declara bithire y no rottay", no solo cuanto', () => {
  const s = surfaceParity(fake(':root { --ds-a: 1px; }', ':root { --ds-a: 1px; --ds-solo: 1px; }', ':root { --ds-a: 1px; }'));
  assert.deepEqual(s.venn['bithire+evnto-not-rottay'].concat(s.venn['only-bithire']), ['--ds-solo']);
});

test('presencia y valor son dos figuras separadas', () => {
  // Mismo canal en los tres, valor distinto: espejo LEGITIMO.
  const byTenant = fake(':root { --ds-a: red; }', ':root { --ds-a: blue; }', ':root { --ds-a: green; }');
  const v = valueParity(byTenant, ['--ds-a']);
  assert.equal(v.commonChannels, 1);
  assert.equal(v.identicalValue, 0);
  assert.equal(v.divergentValue, 1);
  assert.equal(v.identicalRoleShape, 1, 'la ranura autorada SI coincide');
});

test('valueSignature compara por rol, no por orden de escritura', () => {
  const a = [{ role: 'base', value: '1px' }, { role: 'overlay-mode', value: '2px' }];
  const b = [{ role: 'overlay-mode', value: '2px' }, { role: 'base', value: '1px' }];
  assert.equal(valueSignature(a), valueSignature(b));
});

test('pairwise mide contra la union del par y contra el mas chico', () => {
  const p = pairwise({
    rottay: new Set(['a', 'b', 'c', 'd']),
    bithire: new Set(['a', 'b']),
    evnto: new Set(['a']),
  });
  assert.deepEqual(p['rottay+bithire'], { shared: 2, union: 4, pctOfUnion: 50, pctOfSmaller: 100 });
});

/* ─────────────────────────────────────────────────────────────────────────
 * Hojas de fuente
 * ───────────────────────────────────────────────────────────────────────── */

test('authoredLeafPaths anota rutas de hoja, no contenedores', () => {
  const ts = 'const PALETTE = {\n  accent: { strong: "#fff", soft: "#eee" },\n  canvas: "#000",\n};\n';
  assert.deepEqual([...authoredLeafPaths(ts)].sort(), ['PALETTE.accent.soft', 'PALETTE.accent.strong', 'PALETTE.canvas']);
});

test('authoredLeafPaths ignora comentarios y no se traga las llaves de una cadena', () => {
  const ts = 'const X = {\n  // a: 1,\n  /* b: 2, */\n  c: "{ no es un bloque }",\n};\n';
  assert.deepEqual([...authoredLeafPaths(ts)], ['X.c']);
});

test('el const de esqueleto se normaliza para que no invente exclusivas', () => {
  const a = authoredLeafPaths('const rottayBrandTheme = { palette: PALETTE };');
  const b = authoredLeafPaths('const evntoBrandTheme = { palette: PALETTE };');
  assert.deepEqual([...a], ['THEME.palette']);
  assert.deepEqual([...a], [...b]);
});

/* ─────────────────────────────────────────────────────────────────────────
 * Integracion contra los artefactos reales
 * ───────────────────────────────────────────────────────────────────────── */

test('la salida es determinista y --check esta verde', () => {
  const a = serialize(build());
  assert.equal(a, serialize(build()));
  assert.equal(readFileSync(OUTPUT_PATH, 'utf8'), a);
});

test('la procedencia declara que el artefacto es un snapshot generado', () => {
  assert.match(doc.$warning, /SNAPSHOTS GENERADOS/);
  assert.equal(doc.provenance.artifacts.length, 3);
  for (const a of doc.provenance.artifacts) {
    assert.match(a.sha256, /^[0-9a-f]{64}$/);
    assert.ok(a.bytes > 0);
    assert.equal(a.file.startsWith('src/'), true, 'ruta relativa, nunca absoluta');
  }
  assert.ok(doc.provenance.mtimeExcluded.length > 0, 'la exclusion del mtime queda declarada');
});

test('el sha256 registrado es el del artefacto en disco', () => {
  for (const t of TENANTS) {
    const rec = doc.provenance.artifacts.find((a) => a.file === artifactPath(t));
    const real = createHash('sha256')
      .update(readFileSync(join(PACKAGE_ROOT, artifactPath(t)), 'utf8'))
      .digest('hex');
    assert.equal(rec.sha256, real, t);
  }
});

test('control: las nueve cifras de superficie del artefacto', () => {
  const s = doc.surface;
  assert.deepEqual(s.declares, { rottay: 1212, bithire: 1236, evnto: 477 });
  assert.equal(s.union, 1757);
  assert.equal(s.intersection, 439);
  assert.equal(s.intersectionPct, 25);
  assert.equal(s.venn['only-rottay'].length, 485);
  assert.equal(s.venn['only-bithire'].length, 543);
  assert.equal(s.venn['only-evnto'].length, 0);
  assert.equal(s.venn['rottay+bithire-not-evnto'].length, 252);
  assert.equal(s.venn['rottay+evnto-not-bithire'].length, 36);
  assert.equal(s.venn['bithire+evnto-not-rottay'].length, 2);
  assert.equal(s.venn['all-three'].length, 439);
});

test('control: la trampa de ocurrencias queda a la vista en los tres', () => {
  assert.deepEqual(doc.occurrenceTrap.rottay, { occurrences: 1876, distinctChannels: 1212 });
  for (const t of TENANTS) {
    assert.ok(
      doc.occurrenceTrap[t].occurrences > doc.occurrenceTrap[t].distinctChannels,
      `${t}: si estas dos cifras coinciden, alguien reescribio el artefacto`,
    );
  }
});

test('control: presencia de declaracion por raiz — NO es severidad', () => {
  // ── ALCANCE DE LA MEDICION (se afirma ANTES que cualquier conteo) ────────
  // `cascadePresence` recorre TODAS las raices que `root-checklist.mjs`
  // descubre, y ese descubrimiento tiene DOS fuentes:
  //   • patron `^--ds-[a-z0-9-]+-scale$` ....... 25 raices (diales numericos)
  //   • manifiestos `governance/manifest/cascade/roots/**/index.json`, de los
  //     cuales 13 no los alcanza ningun `-scale` (color,
  //     familias tipograficas, elevacion, tono de sidebar, anatomia)
  //   └ union sin duplicados ................... 38 raices medidas
  // El total de canales de mas abajo NO se puede leer sin estas tres cifras:
  // decia 86 cuando el alcance eran 25 raices y dice 310 con 38. Aquella
  // afirmacion no era falsa, era de alcance menor, y se conserva viva en el
  // control aditivo de mas abajo. Pinar el alcance aqui hace que el proximo
  // ensanche sea un rojo explicito y no un corrimiento silencioso.
  assert.equal(doc.cascadePresence.roots.length, 38, 'alcance: raices medidas');
  const patternRoots = doc.cascadePresence.roots.filter((r) => PATTERN_ROOT.test(r.root));
  assert.equal(patternRoots.length, 25, 'alcance: raices que aporta el patron de dial numerico');
  assert.equal(
    doc.cascadePresence.roots.length - patternRoots.length,
    13,
    'alcance: raices que SOLO aporta el manifiesto de raiz',
  );

  const by = Object.fromEntries(doc.cascadePresence.roots.map((r) => [r.root, r]));
  assert.equal(by['--ds-density-scale'].declaredByAny, 32);
  assert.equal(by['--ds-type-scale'].declaredByAny, 28);
  assert.equal(by['--ds-radius-scale'].declaredByAny, 18);
  assert.equal(by['--ds-rhythm-scale'].declaredByAny, 11);
  assert.equal(by['--ds-motion-duration-scale'].declaredByAny, 6);
  assert.equal(by['--ds-state-press-scale'].declaredByAny, 0);
  // Las raices que solo existen por el manifiesto: sin ellas la presencia no
  // veia ni un canal de color, tipografia, elevacion o sidebar.
  assert.equal(by['--ds-color-primary'].declaredByAny, 193);
  assert.equal(by['--ds-color-error'].declaredByAny, 13);
  assert.equal(by['--ds-color-success'].declaredByAny, 4);
  assert.equal(by['--ds-elevation-1'].declaredByAny, 19);
  assert.equal(by['--ds-font-family-base'].declaredByAny, 15);
  assert.equal(by['--ds-sidebar-bg'].declaredByAny, 1);

  assert.equal(doc.cascadePresence.distinctChannelsDeclared, 310, 'canales distintos declarados, sobre las 38 raices');
  assert.match(doc.cascadePresence.notSeverity, /NO severidad/);
});

test('readsOf extrae los canales que una declaracion consulta', () => {
  assert.deepEqual(readsOf('calc(9px / 1.25 * var(--ds-radius-scale, 1))'), ['--ds-radius-scale']);
  assert.deepEqual(readsOf('var(--_ds-a, var(--ds-b, 1px))'), ['--_ds-a', '--ds-b']);
  assert.deepEqual(readsOf('13px'), []);
});

test('CORTA vs RE-DERIVA: una re-derivacion NO es un defecto', () => {
  // Las dos formas reales de bithire, lado a lado.
  const checklists = { roots: [{ root: '--ds-radius-scale', channels: [
    { channel: '--ds-radius-scale' },
    { channel: '--ds-button-md-radius' },
    { channel: '--ds-button-md-font-size' },
  ] }] };
  const css = [
    ':root {',
    '  --ds-radius-scale: 1.25;',
    '  --ds-button-md-radius: calc(9px / 1.25 * var(--ds-radius-scale, 1));',
    '  --ds-button-md-font-size: 13px;',
    '}',
  ].join('\n');
  const d = declarationsOf(css);
  // El piso no declara `--ds-radius-scale`: la semilla del dial es del tema.
  const s = cascadeSeverance(checklists, { rottay: d, bithire: d, evnto: d }, fakeFloor({}));
  const t = s.perTenant.rottay;
  assert.equal(t.declaredInCascade, 3);
  assert.deepEqual(
    t.rootPinned.channels.map((x) => [x.channel, x.reason]),
    [['--ds-radius-scale', 'floor-absent']],
    'fijar el dial propio no es cortar cuando el piso no deriva nada detras',
  );
  assert.equal(t.rootFrozen.count, 0);
  assert.deepEqual(t.severs.channels.map((x) => x.channel), ['--ds-button-md-font-size']);
  assert.deepEqual(t.reDerives.channels.map((x) => x.channel), ['--ds-button-md-radius']);
  assert.equal(t.reDerives.reachingRoot, 1, 'la re-derivacion alcanza la raiz: el dial sigue viajando');
  assert.equal(t.reDerives.reachingLiveRoot, 1, 'y la raiz que alcanza no esta congelada');
});

test('una seed continua Standard usa autoridad del manifest, no la forma del fallback', () => {
  const root = { root: '--ds-seed', rootId: 'palette.status-seeds', rootAuthority: 'tenant-seed', channels: [
    { channel: '--ds-seed' },
    { channel: '--ds-leaf' },
  ] };
  const decls = declarationsOf(':root { --ds-seed: #123456; --ds-leaf: var(--ds-seed); }');
  const floor = fakeFloor({ '--ds-seed': 'var(--ds-seed-600)' });
  const v = cascadeSeverance({ roots: [root] }, { rottay: decls, bithire: decls, evnto: decls }, floor).perTenant.rottay;

  assert.equal(tenantSeedAuthority(root).rootId, 'palette.status-seeds');
  assert.deepEqual(v.rootPinned.channels.map((x) => [x.channel, x.reason]), [['--ds-seed', 'tenant-seed']]);
  assert.equal(v.rootFrozen.count, 0);

  const floorArbitratedRoot = { ...root, rootAuthority: 'floor-arbitrated' };
  const counter = cascadeSeverance(
    { roots: [floorArbitratedRoot] },
    { rottay: decls, bithire: decls, evnto: decls },
    floor,
  ).perTenant.rottay;
  assert.deepEqual(counter.rootFrozen.channels.map((x) => x.channel), ['--ds-seed']);
  assert.equal(tenantSeedAuthority(floorArbitratedRoot), null);
});

test('una raiz mixta conserva vivo default y corta overlay, con bloqueo por rol', () => {
  const root = { root: '--ds-root', channels: [{ channel: '--ds-root' }, { channel: '--ds-leaf' }] };
  const decls = declarationsOf([
    ':root { --ds-root: var(--ds-seed); --ds-leaf: var(--ds-root); }',
    ':root.dark { --ds-root: #123456; }',
  ].join('\n'));
  assert.deepEqual(effectiveRoleValues(decls.get('--ds-root')), [
    { role: 'default-mode', value: 'var(--ds-seed)' },
    { role: 'overlay-mode', value: '#123456' },
  ]);
  const v = cascadeSeverance(
    { roots: [root] },
    { rottay: decls, bithire: decls, evnto: decls },
    fakeFloor({ '--ds-root': 'var(--ds-root-500)' }),
  ).perTenant.rottay;
  const frozen = v.rootFrozen.channels[0];
  assert.equal(frozen.channel, '--ds-root');
  assert.deepEqual(frozen.liveRoles, ['default-mode']);
  assert.deepEqual(frozen.frozenRoles, ['overlay-mode']);
  assert.equal(frozen.mixed, true);
  assert.deepEqual(frozen.readerRoles, [{ channel: '--ds-leaf', roles: ['overlay-mode'] }]);
  const leaf = v.reDerives.channels.find((x) => x.channel === '--ds-leaf');
  assert.deepEqual(leaf.liveRootRoles, ['default-mode']);
  assert.deepEqual(leaf.blockedRoles, ['overlay-mode']);
  assert.equal(leaf.blockedUpstream, true);

  const inverseDecls = declarationsOf([
    ':root { --ds-root: #123456; --ds-leaf: var(--ds-root, var(--ds-live)); --ds-live: var(--ds-seed); }',
    ':root.dark { --ds-root: var(--ds-seed); }',
  ].join('\n'));
  const inverse = cascadeSeverance(
    { roots: [root] },
    { rottay: inverseDecls, bithire: inverseDecls, evnto: inverseDecls },
    fakeFloor({ '--ds-root': 'var(--ds-root-500)' }),
  ).perTenant.rottay;
  assert.deepEqual(inverse.rootFrozen.channels[0].frozenRoles, ['default-mode']);
  assert.deepEqual(inverse.rootFrozen.channels[0].liveRoles, ['overlay-mode']);
  assert.deepEqual(inverse.reDerives.channels.find((x) => x.channel === '--ds-leaf').blockedRoles, [], 'un upstream vivo evita el bloqueo');

  assert.throws(
    () => effectiveRoleValues([{ role: 'base', value: '1px' }, { role: 'base', value: '2px' }]),
    /declaraciones divergentes en el mismo rol/,
  );
});

test('invariante: declara = pin + congelado + corta + re-deriva, sin solape', () => {
  for (const t of TENANTS) {
    const v = doc.cascadeSeverance.perTenant[t];
    assert.equal(
      v.rootPinned.count + v.rootFrozen.count + v.severs.count + v.reDerives.count,
      v.declaredInCascade,
      `${t}: el reparto tiene que ser TOTAL — una raiz que se cae de las cuatro clases es un punto ciego`,
    );
    const names = [
      ...v.rootPinned.channels.map((x) => x.channel),
      ...v.rootFrozen.channels.map((x) => x.channel),
      ...v.severs.channels.map((x) => x.channel),
      ...v.reDerives.channels.map((x) => x.channel),
    ];
    assert.equal(new Set(names).size, names.length, `${t}: un canal cae en exactamente una clase`);
    // Y las cifras publicadas de cada clase coinciden con su propia lista.
    assert.equal(v.rootPinned.count, v.rootPinned.channels.length, t);
    assert.equal(v.rootFrozen.count, v.rootFrozen.channels.length, t);
    assert.equal(
      v.severedTotal,
      v.severs.count + v.rootFrozen.count + v.partiallySevered.count,
      `${t}: severedTotal incluye cortes totales, raices congeladas y cortes por modo`,
    );
  }
});

test('control: la severidad real de cascada, por tenant', () => {
  // Alcance: 38 raices (25 de patron + 13 solo-manifiesto).
  const P = doc.cascadeSeverance.perTenant;
  assert.equal(doc.cascadeSeverance.roots, 38, 'alcance: raices de cascada');
  assert.equal(doc.cascadeSeverance.universe, 1026, 'canales distintos bajo esas 38 raices');
  assert.deepEqual([P.rottay.declaredInCascade, P.bithire.declaredInCascade, P.evnto.declaredInCascade], [156, 262, 79]);
  assert.deepEqual([P.rottay.rootPinned.count, P.bithire.rootPinned.count, P.evnto.rootPinned.count], [9, 11, 9]);
  assert.deepEqual([P.rottay.rootFrozen.count, P.bithire.rootFrozen.count, P.evnto.rootFrozen.count], [3, 4, 2]);
  assert.deepEqual(
    TENANTS.map((t) => P[t].rootPinned.count + P[t].rootFrozen.count),
    [12, 15, 11],
    'la suma preserva la particion de raices declaradas',
  );
  assert.deepEqual([P.rottay.severs.count, P.bithire.severs.count, P.evnto.severs.count], [47, 75, 14]);
  assert.deepEqual([P.rottay.reDerives.count, P.bithire.reDerives.count, P.evnto.reDerives.count], [97, 172, 54]);
  assert.deepEqual([P.rottay.reDerives.reachingRoot, P.bithire.reDerives.reachingRoot, P.evnto.reDerives.reachingRoot], [47, 110, 36]);
  assert.equal(P.evnto.severs.count, 14, 'evnto SI corta, fuera de los diales numericos');
  assert.deepEqual([P.rottay.partiallySevered.count, P.bithire.partiallySevered.count, P.evnto.partiallySevered.count], [14, 61, 1]);
  assert.deepEqual([P.rottay.severedTotal, P.bithire.severedTotal, P.evnto.severedTotal], [64, 140, 17]);
});

/**
 * Contraprueba acotada a las 25 raices `*-scale` frente a las 38 totales.
 */
test('control: la medicion angosta conserva identidad y cifras exactas', () => {
  const narrow = cascadeSeverance({ roots: CHECKLISTS.roots.filter((r) => PATTERN_ROOT.test(r.root)) }, ARTIFACT_DECLS, FLOOR);
  const N = narrow.perTenant;
  assert.equal(narrow.roots, 25, 'sub-universo: solo los diales `*-scale`');
  assert.equal(narrow.universe, 570);
  assert.deepEqual([N.rottay.declaredInCascade, N.bithire.declaredInCascade, N.evnto.declaredInCascade], [53, 83, 26]);
  assert.deepEqual([N.rottay.severs.count, N.bithire.severs.count, N.evnto.severs.count], [3, 18, 0]);
  assert.deepEqual([N.rottay.reDerives.count, N.bithire.reDerives.count, N.evnto.reDerives.count], [47, 61, 23]);
  assert.deepEqual([N.rottay.reDerives.reachingRoot, N.bithire.reDerives.reachingRoot, N.evnto.reDerives.reachingRoot], [16, 49, 14]);
  assert.equal(N.evnto.severs.count, 0, 'evnto no corta ni un dial numerico');

  // Presencia, mismo sub-universo: la cifra 86 que este documento publicaba.
  const ever = new Set();
  for (const r of doc.cascadePresence.roots) {
    if (!PATTERN_ROOT.test(r.root)) continue;
    for (const c of r.channels) ever.add(c.channel);
  }
  assert.equal(ever.size, 86, 'presencia sobre las 25 raices de patron');

  for (const t of TENANTS) assert.equal(N[t].reDerives.blockedUpstream, 0, `${t}: bajo 25 raices no habia bloqueo`);

  for (const t of TENANTS) {
    assert.equal(N[t].rootFrozen.count, 0, `${t}: ni un dial numerico congela una derivacion del piso`);
    assert.equal(N[t].rootPinned.byReason['tenant-parametric'], 0, `${t}: ningun dial numerico se declara con var()`);
  }
  assert.deepEqual([N.rottay.rootPinned.count, N.bithire.rootPinned.count, N.evnto.rootPinned.count], [3, 4, 3]);
  assert.deepEqual([N.rottay.severedTotal, N.bithire.severedTotal, N.evnto.severedTotal], [3, 18, 0]);
});

/**
 * Los radios de bithire: NINGUNO corta. Lo que cambio es DONDE se clasifican.
 *
 * `--ds-radius-button` entro como raiz propia del manifiesto
 * (`governance/manifest/cascade/roots/shape/button-style/index.json:6`), asi que la regla de
 * exclusion de `cascadeSeverance` ("fijar el dial propio no es cortar") lo
 * saca de `reDerives` y lo pone entre las raices. Es una RECLASIFICACION, no
 * un corte: en el artefacto sigue escrito
 * `--ds-radius-button: calc(9px / 1.25 * var(--ds-radius-scale, 1))`
 * (src/foundation/tokens/css/facade/artifacts/bithire/index.css:683), la forma
 * mecanismo-con-variante de manual. La afirmacion "ninguno corta" sigue
 * siendo cierta; lo que hay que arreglar es COMO se comprueba.
 *
 * Con la particion de raices el caso queda ademas EXPLICADO y no solo
 * excluido: `--ds-radius-button` cae en `rootPinned` con razon
 * `tenant-parametric` —el tema lo declara CON `var()`, o sea que ni siquiera
 * lo congela— aunque el piso lo derive
 * (src/foundation/tokens/css/foundation/base/borders.css:27,
 * `--ds-radius-button: var(--ds-radius-md)`). Si el tema lo congelara, la
 * misma cita del piso lo mandaria a `rootFrozen`.
 *
 * Y la comprobacion sigue siendo contra el ARTEFACTO, no contra el documento:
 * una raiz queda fuera del reparto severs/reDerives, asi que el test lee el
 * archivo y exige que la declaracion siga leyendo la raiz.
 */
test('los radios de bithire no cortan: 18 declarados = 2 raices propias + 16 re-derivan', () => {
  const P = doc.cascadeSeverance.perTenant.bithire;
  const red = new Map(P.reDerives.channels.map((x) => [x.channel, x]));
  const cut = new Set(P.severs.channels.map((x) => x.channel));
  const pinned = new Map(P.rootPinned.channels.map((x) => [x.channel, x.reason]));
  const frozen = new Set(P.rootFrozen.channels.map((x) => x.channel));
  const dial = new Set([...pinned.keys(), ...frozen]);
  const classOf = (c) =>
    (pinned.has(c) ? 'rootPinned' : frozen.has(c) ? 'rootFrozen' : red.has(c) ? 'reDerives' : cut.has(c) ? 'severs' : 'ausente');

  // Los cinco canales testigo, cada uno con su clase esperada explicita: una
  // reclasificacion futura no puede pasar como "sigue verde".
  const WITNESS = {
    '--ds-button-md-radius': 'reDerives',
    '--ds-card-radius': 'reDerives',
    '--ds-radius-button': 'rootPinned', // raiz propia desde shape.button-style
    '--ds-table-radius': 'reDerives',
    '--ds-textarea-radius': 'reDerives',
  };
  assert.equal(pinned.get('--ds-radius-button'), 'tenant-parametric', 'y el pin esta razonado, no supuesto');
  for (const [c, expected] of Object.entries(WITNESS)) {
    assert.equal(cut.has(c), false, `${c} NO corta`);
    assert.equal(classOf(c), expected, `${c}: clase de cascada`);
  }

  // El punto ciego, cerrado contra el artefacto: el canal reclasificado a raiz
  // sigue leyendo `--ds-radius-scale`. Si alguien lo congela, esto se pone
  // rojo aunque el documento lo siga llamando "dial propio".
  const buttonRadius = ARTIFACT_DECLS.bithire.get('--ds-radius-button');
  assert.equal(buttonRadius.length, 1, '--ds-radius-button: una sola declaracion');
  assert.deepEqual(
    readsOf(buttonRadius[0].value),
    ['--ds-radius-scale'],
    '--ds-radius-button dejo de leer la raiz: eso SI seria un corte, escondido tras la exclusion de dial propio',
  );

  // Y el reparto completo del cascade de `--ds-radius-scale` en bithire, para
  // que el conteo no dependa de los cinco testigos.
  const radiusCascade = CHECKLISTS.roots.find((r) => r.root === '--ds-radius-scale').channels.map((c) => c.channel);
  const declared = radiusCascade.filter((c) => ARTIFACT_DECLS.bithire.has(c));
  assert.equal(declared.length, 18, 'radios que bithire declara bajo --ds-radius-scale');
  assert.deepEqual(declared.filter((c) => cut.has(c)), [], 'ni un solo radio de bithire corta');
  assert.equal(declared.filter((c) => dial.has(c)).length, 2, 'raiz propia: --ds-radius-scale y --ds-radius-button');
  assert.equal(declared.filter((c) => frozen.has(c)).length, 0, 'y ninguna de las dos congela una derivacion del piso');
  assert.equal(declared.filter((c) => red.has(c)).length, 16, 're-derivan');
});

/** Identidad y modo exactos de la deuda viva; la aceptacion sigue siendo cero. */
const BLOCKED_UPSTREAM_RATCHET = {
  rottay: {
    '--ds-card-elevated-shadow': { reads: ['--ds-elevation-3'], roles: ['default-mode'] },
    '--ds-card-shadow': { reads: ['--ds-elevation-1'], roles: ['default-mode'] },
    '--ds-card-shadow-elevated': { reads: ['--ds-elevation-3'], roles: ['default-mode'] },
    '--ds-card-shadow-hover': { reads: ['--ds-elevation-2'], roles: ['default-mode'] },
    '--ds-shadow-lg': { reads: ['--ds-elevation-3'], roles: ['default-mode'] },
    '--ds-shadow-md': { reads: ['--ds-elevation-2'], roles: ['default-mode'] },
    '--ds-shadow-popover': { reads: ['--ds-shadow-md'], roles: ['overlay-mode'] },
    '--ds-shadow-sm': { reads: ['--ds-elevation-1'], roles: ['default-mode'] },
    '--ds-shadow-xs': { reads: ['--ds-elevation-1'], roles: ['default-mode'] },
  },
  bithire: {
    '--ds-button-primary-border': { reads: ['--ds-button-primary-bg'], roles: ['overlay-mode'] },
    '--ds-input-border-focus': { reads: ['--ds-material-control-border-active'], roles: ['default-mode'] },
    '--ds-select-dropdown-shadow': { reads: ['--ds-shadow-lg', '--ds-shadow-popover'], roles: ['default-mode', 'overlay-mode'] },
    '--ds-shadow-popover': { reads: ['--ds-shadow-md'], roles: ['overlay-mode'] },
    '--ds-surface-card-shadow': { reads: ['--ds-material-card-shadow'], roles: ['default-mode'] },
    '--ds-surface-card-shadow-hover': { reads: ['--ds-material-card-shadow-hover'], roles: ['default-mode'] },
  },
  evnto: {
    '--ds-select-dropdown-shadow': { reads: ['--ds-shadow-lg'], roles: ['default-mode', 'overlay-mode'] },
    '--ds-shadow-popover': { reads: ['--ds-shadow-md'], roles: ['default-mode', 'overlay-mode'] },
  },
};

test('trinquete: identidad exacta por modo y aceptacion de cero bloqueos', () => {
  const live = cascadeSeverance(CHECKLISTS, ARTIFACT_DECLS, FLOOR).perTenant;

  let total = 0;
  for (const t of TENANTS) {
    const P = doc.cascadeSeverance.perTenant[t];
    assert.deepEqual(
      live[t].reDerives.channels.filter((x) => x.blockedUpstream).map((x) => x.channel).sort(),
      Object.keys(BLOCKED_UPSTREAM_RATCHET[t]).sort(),
      `${t}: el conjunto RECALCULADO no coincide con el trinquete`,
    );
    const expected = BLOCKED_UPSTREAM_RATCHET[t];
    const blocked = P.reDerives.channels.filter((x) => x.blockedUpstream);
    assert.deepEqual(
      blocked.map((x) => x.channel).sort(),
      Object.keys(expected).sort(),
      `${t}: cambio el conjunto bloqueado — no muevas la cifra, revisa la fuente citada arriba`,
    );
    assert.equal(P.reDerives.blockedUpstream, blocked.length, `${t}: la cifra publicada no coincide con la lista`);

    const cutRoles = new Map();
    const addCut = (channel, roles) => {
      if (!cutRoles.has(channel)) cutRoles.set(channel, new Set());
      for (const role of roles) cutRoles.get(channel).add(role);
    };
    for (const x of P.severs.channels) addCut(x.channel, x.severedRoles);
    for (const x of P.reDerives.channels) addCut(x.channel, x.severedRoles);
    for (const x of P.rootFrozen.channels) addCut(x.channel, x.frozenRoles);
    for (const b of blocked) {
      assert.deepEqual(b.reads, expected[b.channel].reads, `${t} ${b.channel}: cambio lo que lee`);
      assert.deepEqual(b.blockedRoles, expected[b.channel].roles, `${t} ${b.channel}: cambio el modo bloqueado`);
      for (const role of b.blockedRoles) {
        for (const r of b.readsByRole.find((x) => x.role === role).reads) {
          assert.ok(cutRoles.get(r)?.has(role), `${t} ${b.channel}: ${r} no corta ${role}`);
        }
      }
    }
    total += blocked.length;
  }
  assert.equal(total, 17, 'deuda total medida por identidad');

  // Contraprueba sobre el artefacto: un mismo canal puede vivir en un modo y cortar en otro.
  for (const level of ['--ds-elevation-2', '--ds-elevation-3']) {
    const entries = ARTIFACT_DECLS.rottay.get(level);
    assert.equal(entries.length, 2, `${level}: literal oscura + parametrica en el artefacto de rottay`);
    const [literal, parametric] = entries;
    assert.equal(literal.role, 'base', `${level}: la literal esta en el bloque base`);
    assert.deepEqual(readsOf(literal.value), [], `${level}: la literal no lee ni un var()`);
    assert.ok(readsOf(parametric.value).length > 0, `${level}: la parametrica SI lee — este es el fin del corte`);
  }

  // ACEPTACION. La linea original decia `total === 0` inmediatamente despues de
  // `total === 17`: dos afirmaciones contradictorias sobre la misma variable, de
  // modo que el test no podia pasar nunca. La que mide algo es el trinquete de
  // arriba, que fija el conjunto EXACTO canal por canal; la de cero era la
  // aspiracion, no un hecho.
  //
  // Lo que la aceptacion tiene que decir es lo unico que el trinquete todavia no
  // dice: que ningun canal bloqueado queda FUERA de la tabla enumerada. La deuda
  // de 17 re-derivaciones bloqueadas rio arriba es de la lane de cascada; se
  // drena bajando el trinquete, nunca aflojando esta linea.
  const enumerated = TENANTS.reduce((sum, t) => sum + Object.keys(BLOCKED_UPSTREAM_RATCHET[t]).length, 0);
  assert.equal(
    total,
    enumerated,
    'ACEPTACION: cada re-derivacion bloqueada tiene que estar enumerada en el trinquete, con su lectura y su modo',
  );
  assert.ok(enumerated > 0, 'un trinquete vacio haria vacua la igualdad de arriba');
});

/* ─────────────────────────────────────────────────────────────────────────
 * El PISO como arbitro: rootPinned frente a rootFrozen
 * ───────────────────────────────────────────────────────────────────────── */

test('declarationSites lee la linea de la declaracion, no la del bloque', () => {
  const css = ':root {\n  color: red;\n  --ds-a: 1px;\n\n  --ds-b:\n    var(--ds-a);\n}\n';
  assert.deepEqual(declarationSites(css), [
    { channel: '--ds-a', value: '1px', line: 3 },
    { channel: '--ds-b', value: 'var(--ds-a)', line: 5 },
  ]);
});

test('declarationSites no confunde una LECTURA con una declaracion', () => {
  // `--ds-y` aparece dentro del valor de `--ds-x`: no es un sitio de --ds-y.
  assert.deepEqual(
    declarationSites(':root { --ds-x: var(--ds-y, 2px); }').map((s) => s.channel),
    ['--ds-x'],
  );
});

test('DERIVED_VALUE reconoce las tres formas con las que el piso deja pasar un dial', () => {
  for (const v of ['var(--ds-font-sans)', 'calc(9px * var(--ds-radius-scale, 1))', 'color-mix(in srgb, #000 4%, transparent)']) {
    assert.equal(DERIVED_VALUE.test(v), true, v);
  }
  for (const v of ['1', '1.05', '#FFFFFF', '1px', "'Inter', sans-serif", 'inset 0 1px 0 rgba(255, 255, 255, 0.04)']) {
    assert.equal(DERIVED_VALUE.test(v), false, v);
  }
});

/**
 * El criterio queda DECLARADO en el documento, con el tamano del piso medido.
 *
 * Sin estas cifras la clasificacion de raices seria una opinion: cualquiera
 * podria mover un canal de clase agregando o borrando un `.css` del piso sin
 * que se notara. Con el hash, un cambio de piso se ve como un movimiento de
 * esta evidencia y obliga a volver a discutir la clase.
 */
test('control: el documento declara el criterio y el tamano del piso medido', () => {
  const f = doc.cascadeSeverance.floorCorpus;
  assert.equal(f.dir, 'src/foundation/tokens/css');
  assert.equal(f.excludes, 'src/foundation/tokens/css/facade/artifacts/');
  assert.equal(f.files, 466, 'archivos .css del piso tras retirar el puente duplicado sin consumidores');
  assert.equal(f.channels, 3578, 'canales --ds-* que el piso declara');
  assert.match(f.sha256, /^[0-9a-f]{64}$/);
  assert.equal(f.derivedForms, 'var( | calc( | color-mix(');
  // Y la regla misma, escrita, no solo aplicada.
  assert.match(doc.cascadeSeverance.partition, /rootPinned \+ rootFrozen \+ severs \+ reDerives/);
  assert.match(doc.cascadeSeverance.exclusionRule, /semilla continua Standard/);
  assert.match(doc.cascadeSeverance.exclusionRule, /al menos un modo sin var\(\) = rootFrozen/);
  assert.match(doc.cascadeSeverance.severityRule, /partiallySevered/);
  assert.match(doc.cascadeSeverance.severityRule, /bloqueo se decide por modo efectivo/);
  assert.match(doc.cascadeSeverance.roleModel, /base alcanza default-mode y overlay-mode/);

  // El piso medido es el que esta en disco AHORA, no una cifra copiada.
  const live = readFloorCorpus();
  assert.equal(live.files, f.files);
  assert.equal(live.channels, f.channels);
  assert.equal(live.sha256, f.sha256, 'el piso cambio: la clasificacion de raices hay que rediscutirla');

  assert.equal(
    doc.cascadeSeverance.rootAuthoritySource,
    'artifacts/generated/manifest/cascade/coverage/index.json#roots[].rootAuthority',
  );
  const rootAuthorities = new Map(CHECKLISTS.roots.map((root) => [root.rootId, root.rootAuthority]));
  assert.equal(rootAuthorities.get('palette.seeds'), 'tenant-seed');
  assert.equal(rootAuthorities.get('palette.status-seeds'), 'tenant-seed');
  assert.equal(rootAuthorities.get('navigation.sidebar-tone'), 'floor-arbitrated');
});

/**
 * Un testigo por clase, por nombre, con su causa citada en el piso.
 *
 * Los cuatro casos existen de verdad en los tres artefactos, y son cuatro
 * causas DISTINTAS. Un test que solo mirara los conteos no distinguiria
 * "clasifica bien" de "clasifica todo igual y los numeros dan".
 */
test('control: un testigo por clase de raiz, con la cita del piso', () => {
  const P = doc.cascadeSeverance.perTenant;
  const pinnedOf = (t) => new Map(P[t].rootPinned.channels.map((x) => [x.channel, x]));
  const frozenOf = (t) => new Map(P[t].rootFrozen.channels.map((x) => [x.channel, x]));

  // ── rootPinned / floor-literal ────────────────────────────────────────
  // `--ds-effect-intensity: 1` es un literal del piso. Los tres temas lo
  // fijan y los tres estan en su derecho: la semilla no deriva de nada.
  for (const t of TENANTS) {
    const w = pinnedOf(t).get('--ds-effect-intensity');
    assert.ok(w, `${t}: --ds-effect-intensity tiene que estar en rootPinned`);
    assert.equal(w.reason, 'floor-literal', t);
    assert.equal(w.floor.file, 'src/foundation/tokens/css/foundation/animations/premium/index.css');
    assert.equal(w.floor.line, 27);
    assert.equal(w.floor.value, '1');
    assert.equal(frozenOf(t).has('--ds-effect-intensity'), false, `${t}: y NO se cuenta como corte`);
  }

  // ── rootPinned / floor-absent ─────────────────────────────────────────
  // El piso nunca declara `--ds-radius-scale`: solo lo LEE, siempre con
  // fallback. La semilla es del tema por construccion.
  assert.equal(FLOOR.sites.has('--ds-radius-scale'), false, 'el piso no declara el dial de radio');
  for (const t of TENANTS) {
    const w = pinnedOf(t).get('--ds-radius-scale');
    assert.equal(w.reason, 'floor-absent', t);
    assert.equal(w.floor, null, `${t}: sin cita porque no hay nada que citar`);
  }

  // ── rootPinned / tenant-parametric ────────────────────────────────────
  // bithire declara `--ds-font-family-base` CON `var()`, asi que no congela
  // nada — aunque el piso lo derive. La razon la da el TEMA, no el piso.
  const parametric = pinnedOf('bithire').get('--ds-font-family-base');
  assert.equal(parametric.reason, 'tenant-parametric');
  assert.ok(parametric.values.every((v) => /var\(/.test(v)), 'y se ve en el valor publicado');
  assert.equal(floorVerdict(FLOOR, '--ds-font-family-base').kind, 'derived', 'el piso SI lo deriva');

  // ── tenant-seed frente a rootFrozen ───────────────────────────────────
  assert.equal(frozenOf('bithire').has('--ds-color-primary'), false);
  assert.equal(pinnedOf('bithire').get('--ds-color-primary').reason, 'tenant-seed');
  assert.equal(pinnedOf('bithire').get('--ds-color-success').reason, 'tenant-seed');
  assert.equal(frozenOf('bithire').has('--ds-color-success'), false);

  // `token-overrides` es un escape hatch, no autoridad de semilla.
  const frozen = frozenOf('bithire').get('--ds-color-error');
  assert.ok(frozen, 'bithire congela --ds-color-error');
  assert.equal(frozen.floor.file, 'src/foundation/tokens/css/foundation/themes/default/index.css');
  assert.equal(frozen.floor.line, 184);
  assert.equal(frozen.floor.value, 'var(--ds-color-error-400)');
  assert.deepEqual(frozen.values, ['base=#C5504C', 'overlay-mode=#e04848']);
  assert.equal(frozen.readerCount, 20, 'lectores dentro del propio artefacto');
  assert.equal(frozen.readers.length, 20);
  assert.ok(frozen.readers.includes('--ds-badge-error-bg'));
});

/** Raices congeladas y lectores afectados por modo. */
test('control: raices congeladas y lectores arrastrados, por tenant', () => {
  const P = doc.cascadeSeverance.perTenant;
  assert.deepEqual(TENANTS.map((t) => P[t].rootFrozen.count), [3, 4, 2]);
  assert.deepEqual(TENANTS.map((t) => P[t].rootFrozen.readerEdges), [12, 22, 9]);
  assert.deepEqual(TENANTS.map((t) => P[t].rootFrozen.distinctReaders), [12, 22, 9]);
  assert.deepEqual(TENANTS.map((t) => P[t].rootFrozen.mixedRoleValues), [1, 1, 0]);

  assert.deepEqual(P.rottay.rootFrozen.channels.map((x) => x.channel), [
    '--ds-color-error', '--ds-elevation-1', '--ds-sidebar-bg',
  ]);
  assert.deepEqual(P.bithire.rootFrozen.channels.map((x) => x.channel), [
    '--ds-button-primary-bg', '--ds-color-error', '--ds-elevation-1', '--ds-sidebar-bg',
  ]);
  assert.deepEqual(P.evnto.rootFrozen.channels.map((x) => x.channel), [
    '--ds-color-error', '--ds-sidebar-bg',
  ]);

  const mixed = new Map([
    ['rottay', P.rottay.rootFrozen.channels.find((x) => x.channel === '--ds-elevation-1')],
    ['bithire', P.bithire.rootFrozen.channels.find((x) => x.channel === '--ds-button-primary-bg')],
  ]);
  assert.deepEqual(mixed.get('rottay').frozenRoles, ['default-mode']);
  assert.deepEqual(mixed.get('rottay').liveRoles, ['overlay-mode']);
  assert.deepEqual(mixed.get('bithire').frozenRoles, ['overlay-mode']);
  assert.deepEqual(mixed.get('bithire').liveRoles, ['default-mode']);

  const live = cascadeSeverance(CHECKLISTS, ARTIFACT_DECLS, FLOOR).perTenant;
  for (const t of TENANTS) {
    assert.deepEqual(
      live[t].rootFrozen.channels.map((x) => [x.channel, x.readerCount]),
      P[t].rootFrozen.channels.map((x) => [x.channel, x.readerCount]),
      `${t}: el documento publicado no coincide con la medicion viva`,
    );
    for (const f of live[t].rootFrozen.channels) {
      const effective = effectiveRoleValues(ARTIFACT_DECLS[t].get(f.channel));
      for (const role of f.frozenRoles) {
        const entry = effective.find((e) => e.role === role);
        assert.deepEqual(readsOf(entry.value), [], `${t} ${f.channel}@${role}: el modo congelado es literal`);
      }
      for (const role of f.liveRoles) {
        const entry = effective.find((e) => e.role === role);
        assert.ok(readsOf(entry.value).length > 0, `${t} ${f.channel}@${role}: el modo vivo conserva una lectura`);
      }
      const verdict = floorVerdict(FLOOR, f.channel);
      assert.equal(verdict.kind, 'derived', `${t} ${f.channel}: el piso tiene que derivarlo`);
      assert.deepEqual(f.floor, verdict.site, `${t} ${f.channel}: la cita publicada es la del piso vivo`);

      let readers = 0;
      for (const [other, es] of ARTIFACT_DECLS[t]) {
        const readsFrozen = effectiveRoleValues(es)
          .some((e) => f.frozenRoles.includes(e.role) && readsOf(e.value).includes(f.channel));
        if (other !== f.channel && readsFrozen) readers += 1;
      }
      assert.equal(f.readerCount, readers, `${t} ${f.channel}: la cuenta de lectores`);
    }
  }
});

/* ─────────────────────────────────────────────────────────────────────────
 * DIENTES — mutaciones EN MEMORIA, nunca sobre `src/`
 * ───────────────────────────────────────────────────────────────────────── */

/**
 * (a) Volver PARAMETRICA una raiz congelada la saca de `rootFrozen`.
 *
 * La mutacion usa una raiz congelada viva y exige el cambio de clase, la baja
 * de dano y la desaparicion exacta de sus lectores.
 */
test('diente (a): volver parametrica una raiz congelada la saca de rootFrozen', () => {
  const before = doc.cascadeSeverance.perTenant.bithire;
  const witness = before.rootFrozen.channels.find((x) => x.channel === '--ds-color-error');
  assert.ok(witness, 'el testigo existe y esta congelado antes de la mutacion');
  const mutated = mutateDecls(ARTIFACT_DECLS.bithire, '--ds-color-error', [
    { role: 'base', value: 'var(--ds-color-error-400)' },
  ]);
  const after = cascadeSeverance(CHECKLISTS, { ...ARTIFACT_DECLS, bithire: mutated }, FLOOR).perTenant.bithire;

  const frozen = new Map(after.rootFrozen.channels.map((x) => [x.channel, x]));
  const pinned = new Map(after.rootPinned.channels.map((x) => [x.channel, x.reason]));
  assert.equal(frozen.has('--ds-color-error'), false, 'ya no congela');
  assert.equal(pinned.get('--ds-color-error'), 'tenant-parametric', 'y la razon del pin queda escrita');
  assert.equal(after.rootFrozen.count, before.rootFrozen.count - 1, '4 -> 3');
  assert.equal(after.severedTotal, before.severedTotal - 1, 'el dano baja en uno');
  assert.equal(after.rootFrozen.readerEdges, before.rootFrozen.readerEdges - witness.readerCount);
  assert.equal(after.rootFrozen.distinctReaders, before.rootFrozen.distinctReaders - witness.readerCount);
  assert.equal(after.reDerives.blockedUpstream, before.reDerives.blockedUpstream, 'no inventa bloqueos laterales');
  // El reparto sigue siendo total despues de la mutacion.
  assert.equal(
    after.rootPinned.count + after.rootFrozen.count + after.severs.count + after.reDerives.count,
    after.declaredInCascade,
  );
});

/**
 * (b) Congelar una raiz que hoy re-deriva la METE en `rootFrozen`.
 *
 * La direccion "se rompio", y con el caso mas dificil: bithire hoy declara
 * `--ds-font-family-base` con `var(--ds-font-pack-humanist-text, ...)`, o sea
 * que es `tenant-parametric` aunque el piso lo derive. Si alguien lo congela
 * en la pila literal, el instrumento tiene que verlo como corte, contarle los
 * lectores y bloquear a los que solo leian de ahi.
 */
test('diente (b): congelar una raiz que hoy re-deriva la mete en rootFrozen', () => {
  const before = doc.cascadeSeverance.perTenant.bithire;
  const mutated = mutateDecls(ARTIFACT_DECLS.bithire, '--ds-font-family-base', [
    { role: 'base', value: "'Public Sans', ui-sans-serif, system-ui, sans-serif" },
  ]);
  const after = cascadeSeverance(CHECKLISTS, { ...ARTIFACT_DECLS, bithire: mutated }, FLOOR).perTenant.bithire;

  const frozen = new Map(after.rootFrozen.channels.map((x) => [x.channel, x]));
  const w = frozen.get('--ds-font-family-base');
  assert.ok(w, 'congelada: el piso la deriva y el tema ya no lee nada');
  assert.equal(w.floor.file, 'src/foundation/tokens/css/foundation/themes/default/index.css');
  assert.equal(w.floor.line, 513);
  assert.ok(w.readerCount > 0, 'y viene con sus lectores, que es donde se ve el dano');
  assert.equal(after.rootFrozen.count, before.rootFrozen.count + 1);
  assert.equal(after.severedTotal, before.severedTotal + 1);
  assert.ok(
    after.reDerives.blockedUpstream > before.reDerives.blockedUpstream,
    'y aparecen bloqueos rio arriba que antes no existian',
  );
});

/**
 * (c) Un `rootPinned` legitimo NUNCA se cuenta como corte.
 *
 * El piso arbitra raices comunes; la autoridad explicita arbitra seeds tenant.
 */
test('diente (c): piso y autoridad de seed arbitran sin confundirse', () => {
  for (const t of TENANTS) {
    const P = doc.cascadeSeverance.perTenant[t];
    assert.equal(P.rootFrozen.channels.some((x) => x.channel === '--ds-effect-intensity'), false, t);
    assert.equal(P.severs.channels.some((x) => x.channel === '--ds-effect-intensity'), false, t);
    for (const b of P.reDerives.channels.filter((x) => x.blockedUpstream)) {
      assert.equal(b.reads.includes('--ds-effect-intensity'), false, `${t}: un pin legitimo no bloquea a nadie`);
    }
  }

  // Mutacion del PISO, en memoria: mismo artefacto, otro veredicto.
  const mutatedFloor = {
    ...FLOOR,
    sites: new Map([
      ...FLOOR.sites,
      ['--ds-effect-intensity', [{ file: 'piso-mutado.css', line: 1, value: 'calc(var(--ds-premium-intensity, 1))' }]],
    ]),
  };
  const after = cascadeSeverance(CHECKLISTS, ARTIFACT_DECLS, mutatedFloor).perTenant.rottay;
  const frozen = new Map(after.rootFrozen.channels.map((x) => [x.channel, x]));
  assert.ok(frozen.has('--ds-effect-intensity'), 'con el piso derivandolo, congelarlo pasa a ser un corte');
  assert.equal(frozen.get('--ds-effect-intensity').floor.file, 'piso-mutado.css');
  assert.equal(after.rootFrozen.count, doc.cascadeSeverance.perTenant.rottay.rootFrozen.count + 1);
  // Una seed tenant conserva su autoridad aunque el piso cambie.
  const withoutPrimary = { ...FLOOR, sites: new Map([...FLOOR.sites].filter(([c]) => c !== '--ds-color-primary')) };
  const relaxed = cascadeSeverance(CHECKLISTS, ARTIFACT_DECLS, withoutPrimary).perTenant.rottay;
  assert.equal(
    new Map(relaxed.rootPinned.channels.map((x) => [x.channel, x.reason])).get('--ds-color-primary'),
    'tenant-seed',
  );
});

test('diente (d): el reparto es total tambien en un oraculo sintetico de las cuatro clases', () => {
  const checklists = { roots: [{ root: '--ds-color-primary', channels: [
    { channel: '--ds-color-primary' },
    { channel: '--ds-effect-intensity' },
    { channel: '--ds-radius-scale' },
    { channel: '--ds-hoja-cortada' },
    { channel: '--ds-hoja-viva' },
  ] }, { root: '--ds-effect-intensity', channels: [] }, { root: '--ds-radius-scale', channels: [] }] };
  const css = [
    ':root {',
    '  --ds-color-primary: #123456;',   // piso derivado + congelado → rootFrozen
    '  --ds-effect-intensity: 1;',       // piso literal            → rootPinned
    '  --ds-radius-scale: 1.25;',        // piso ausente            → rootPinned
    '  --ds-hoja-cortada: 13px;',        // no raiz, sin var()      → severs
    '  --ds-hoja-viva: var(--ds-color-primary);', // no raiz, con var() → reDerives
    '}',
  ].join('\n');
  const d = declarationsOf(css);
  const floor = fakeFloor({
    '--ds-color-primary': 'var(--ds-color-primary-500)',
    '--ds-effect-intensity': '1',
  });
  const v = cascadeSeverance(checklists, { rottay: d, bithire: d, evnto: d }, floor).perTenant.rottay;

  assert.equal(v.declaredInCascade, 5);
  assert.deepEqual(v.rootFrozen.channels.map((x) => x.channel), ['--ds-color-primary']);
  assert.deepEqual(v.rootFrozen.channels[0].readers, ['--ds-hoja-viva']);
  assert.equal(v.rootFrozen.channels[0].readerCount, 1);
  assert.deepEqual(v.rootPinned.channels.map((x) => [x.channel, x.reason]), [
    ['--ds-effect-intensity', 'floor-literal'],
    ['--ds-radius-scale', 'floor-absent'],
  ]);
  assert.deepEqual(v.severs.channels.map((x) => x.channel), ['--ds-hoja-cortada']);
  assert.deepEqual(v.reDerives.channels.map((x) => x.channel), ['--ds-hoja-viva']);
  assert.equal(v.rootPinned.count + v.rootFrozen.count + v.severs.count + v.reDerives.count, v.declaredInCascade);
  assert.equal(v.severedTotal, 2, 'la raiz congelada suma al dano igual que el canal cortado');
  // Y el punto entero del arreglo: `--ds-hoja-viva` lee una raiz, pero la raiz
  // esta congelada, asi que el dial NO viaja.
  const viva = v.reDerives.channels[0];
  assert.equal(viva.reachesRoot, true, 'lee el nombre de una raiz');
  assert.equal(viva.reachesLiveRoot, false, 'pero esa raiz esta congelada');
  assert.equal(viva.blockedUpstream, true, 'y por eso el bloqueo se ve');
});

test('todo canal que corta viene con su valor, y todo el que re-deriva con lo que lee', () => {
  for (const t of TENANTS) {
    for (const s of doc.cascadeSeverance.perTenant[t].severs.channels) {
      assert.ok(s.values.length > 0);
      for (const v of s.values) assert.equal(/var\(--/.test(v), false, `${t} ${s.channel}: un corte no puede leer una variable`);
    }
    for (const r of doc.cascadeSeverance.perTenant[t].reDerives.channels) {
      assert.ok(r.reads.length > 0, `${t} ${r.channel}: una re-derivacion lee al menos un canal`);
    }
  }
});

test('declaracion multiple es variante de modo, NO duplicacion', () => {
  const m = doc.multiDeclaration;
  assert.match(m.notDuplication, /NO duplicacion|no duplicacion/i);
  assert.equal(m.perTenant.rottay.channelsDeclaredMoreThanOnce, 664);
  assert.equal(m.perTenant.bithire.channelsDeclaredMoreThanOnce, 438);
  assert.equal(m.perTenant.evnto.channelsDeclaredMoreThanOnce, 87);
  // Casi todas caen en roles distintos: es el bloque claro y el oscuro.
  assert.equal(m.perTenant.rottay.allInDistinctRoles, 664);
  assert.equal(m.perTenant.bithire.allInDistinctRoles, 438);
  assert.equal(m.perTenant.evnto.allInDistinctRoles, 87);
  assert.equal(m.perTenant.evnto.sameRoleTwice, 0);
  // Ya NO hay ningun caso de mismo-rol-dos-veces en ningun tema: los tres
  // artefactos regenerados dejaron `sameRoleTwice` en cero, y con el se fue el
  // unico pisado real que habia (`--ds-surface-card-border-strong` en rottay).
  // El aserto se mantiene -- si vuelve a aparecer uno, este control lo nombra.
  const real = TENANTS.flatMap((t) => m.perTenant[t].sameRoleTwiceChannels.filter((c) => c.valuesDifferWithinRole));
  assert.deepEqual(real.map((c) => c.channel), []);
});

test('multiDeclaration separa el mismo rol dos veces, que si es otra cosa', () => {
  const d = declarationsOf(":root { --ds-a: 1px; --ds-a: 2px; }\n:root.dark { --ds-b: 1px; }\n:root { --ds-b: 2px; }");
  const m = multiDeclaration({ rottay: d, bithire: d, evnto: d }).perTenant.rottay;
  assert.equal(m.channelsDeclaredMoreThanOnce, 2);
  assert.equal(m.sameRoleTwice, 1, '--ds-a se pisa a si mismo en el mismo rol');
  assert.equal(m.allInDistinctRoles, 1, '--ds-b es variante de modo');
});

test('la cifra de fuente es de otra unidad y nunca se fusiona con la del artefacto', () => {
  assert.equal(doc.sourceSkeleton.unit, 'authored-decision-leaf-path');
  assert.match(doc.sourceSkeleton.note, /NUNCA fusionar/);
  assert.notDeepEqual(doc.sourceSkeleton.authors, doc.surface.declares);
  assert.equal(doc.provenance.sources.length, 3);
  for (const t of TENANTS) {
    assert.ok(doc.provenance.sources.some((s) => s.file === sourcePath(t)));
  }
});

test('el documento no filtra rutas absolutas', () => {
  const text = readFileSync(OUTPUT_PATH, 'utf8');
  assert.equal(text.includes('/Users/'), false);
});

/* --------------------------------------------------------------------------
 * coverage-artifact ownership
 * -------------------------------------------------------------------------- */

const COVERAGE_HERE = dirname(fileURLToPath(import.meta.url));
const COVERAGE_CORE_ROOT = findPackageRoot(COVERAGE_HERE);
const MIRROR_PARITY = resolvePath(COVERAGE_HERE, 'index.mjs');
const ROOT_CHECKLISTS = resolvePath(COVERAGE_HERE, '../root-checklists/index.mjs');


test('mirror-parity builds with the ignored artifact absent from disk', () => {
  // The build no longer touches the file at all, so its absence cannot be
  // observed from inside `build()`. Assert the source has stopped reading it
  // AND that the build succeeds -- the first without the second would pass on a
  // generator that had simply stopped working.
  const source = readFileSync(MIRROR_PARITY, 'utf8');
  assert.doesNotMatch(
    source,
    /readFileSync\([^)]*cascade\/coverage/,
    'mirror-parity must not read an artifact it does not own',
  );
  const document = build();
  assert.ok(document.$generatedBy.endsWith('mirror-parity/index.mjs'));
});

test('the in-memory document is byte-identical to the on-disk artifact', () => {
  // The substitution's whole warrant. If these ever diverge, the artifact and
  // the value mirror-parity consumes are two different documents.
  const inMemory = serializeChecklists(buildChecklists(loadFacts(), loadCanon()));
  if (!existsSync(COVERAGE_PATH)) {
    assert.ok(true, 'artifact absent in this checkout; the determinism gate covers that case');
    return;
  }
  const onDisk = readFileSync(COVERAGE_PATH, 'utf8');
  assert.equal(inMemory.length, onDisk.length, 'in-memory and on-disk documents differ in size');
  assert.equal(inMemory, onDisk);
  assert.deepEqual(JSON.parse(inMemory), JSON.parse(onDisk));
});

test('the document is deterministic: two independent builds agree', () => {
  const first = serializeChecklists(buildChecklists(loadFacts(), loadCanon()));
  const second = serializeChecklists(buildChecklists(loadFacts(), loadCanon()));
  assert.equal(first, second);
  // Non-vacuity: a builder returning a constant would satisfy the equality above.
  const document = JSON.parse(first);
  assert.ok(Array.isArray(document.roots) && document.roots.length > 10);
  assert.ok(document.summary.roots > 10);
});

/**
 * A throwaway package tree these generators can DELETE from and WRITE into.
 *
 * Everything read is symlinked; only the directories on a write path are real,
 * because a write through a symlinked directory lands in the real tree. The two
 * generator modules are COPIED rather than linked: Node resolves an ESM symlink
 * to its realpath, so a linked entrypoint would compute the real package root
 * and operate there -- the exact defect this fixture exists to prevent.
 * `realpathSync` on the sandbox is what makes `import.meta.url === argv[1]`
 * hold on macOS, where the temp directory is itself a symlink.
 */
function isolatedPackageTree(realDirs) {
  const sandbox = realpathSync(mkdtempSync(join(tmpdir(), 'ds-coverage-ownership-')));
  const root = join(sandbox, 'packages', 'core');

  // Every directory that must be a REAL directory in the sandbox: the ones
  // named, and every ancestor of each. Built FIRST and as a set, because a
  // symlinked ancestor makes every later write land in the real tree.
  const realSet = new Set(['']);
  for (const relativeDir of realDirs) {
    const segments = relativeDir.split('/');
    for (let index = 1; index <= segments.length; index += 1) {
      realSet.add(segments.slice(0, index).join('/'));
    }
  }
  for (const relativeDir of realSet) {
    mkdirSync(join(root, relativeDir), { recursive: true });
  }

  // Then link every child that is not itself a real directory. A file child of
  // a real directory is linked too, EXCEPT a generator entrypoint: Node
  // resolves an ESM symlink to its realpath, so a linked entrypoint would
  // compute the real package root and operate there.
  for (const relativeDir of realSet) {
    const from = relativeDir ? join(COVERAGE_CORE_ROOT, relativeDir) : COVERAGE_CORE_ROOT;
    if (!existsSync(from)) continue;
    for (const entry of readdirSync(from)) {
      const child = relativeDir ? `${relativeDir}/${entry}` : entry;
      if (realSet.has(child)) continue;
      const source = join(from, entry);
      const target = join(root, child);
      if (existsSync(target)) continue;
      if (entry === 'index.mjs' && realDirs.includes(relativeDir)) {
        cpSync(source, target);
        continue;
      }
      symlinkSync(source, target, statSync(source).isDirectory() ? 'dir' : 'file');
    }
  }
  return { sandbox, root };
}

/** A fingerprint of everything the real tree could have lost to this drill. */
function realTreeFingerprint() {
  const coverageDir = dirname(COVERAGE_PATH);
  const status = spawnSync('git', ['status', '--porcelain=v1'], {
    cwd: COVERAGE_CORE_ROOT,
    encoding: 'utf8',
  });
  return JSON.stringify({
    coverageDirExists: existsSync(coverageDir),
    coverage: existsSync(COVERAGE_PATH)
      ? createHash('sha256').update(readFileSync(COVERAGE_PATH)).digest('hex')
      : null,
    mirror: existsSync(OUTPUT_PATH)
      ? createHash('sha256').update(readFileSync(OUTPUT_PATH)).digest('hex')
      : null,
    status: status.stdout,
  });
}

test('N-8.1: with the ignored directory deleted, the generator WRITES and --check passes', () => {
  // The regression for the missing `mkdirSync`. On a fresh clone the directory
  // is gitignored, hence absent, hence `writeFileSync` failed -- and then
  // mirror-parity failed on the file the failed write did not produce.
  //
  // HERMETIC: the deletion, the write and both checks happen in a throwaway
  // package tree. Removing the real ignored directory and restoring one file
  // afterwards made a TEST the last writer of a committed artifact, and a
  // restore that runs in a `finally` is still a window in which the worktree is
  // wrong -- this file's own header claims no test writes.
  const before = realTreeFingerprint();
  const coverageRelative = relative(COVERAGE_CORE_ROOT, COVERAGE_PATH).split(sep);
  const { sandbox, root } = isolatedPackageTree([
    coverageRelative.slice(0, -1).join('/'),
    'scripts/generate/tokens/manifest/root-checklists',
    'scripts/generate/tokens/manifest/mirror-parity',
  ]);
  try {
    const sandboxCoverage = join(root, ...coverageRelative);
    const sandboxCoverageDir = dirname(sandboxCoverage);
    const rootChecklists = join(root, 'scripts/generate/tokens/manifest/root-checklists/index.mjs');
    const mirrorParity = join(root, 'scripts/generate/tokens/manifest/mirror-parity/index.mjs');
    const stashed = existsSync(sandboxCoverage) ? readFileSync(sandboxCoverage, 'utf8') : null;

    rmSync(sandboxCoverageDir, { recursive: true, force: true });
    assert.equal(existsSync(sandboxCoverageDir), false, 'precondition: the ignored directory is gone');

    const check = spawnSync(process.execPath, [rootChecklists, '--check'], {
      cwd: root,
      encoding: 'utf8',
    });
    assert.equal(check.status, 0, check.stdout + check.stderr);
    assert.match(check.stdout, /determinista/);

    const mirror = spawnSync(process.execPath, [mirrorParity, '--check'], {
      cwd: root,
      encoding: 'utf8',
    });
    assert.equal(mirror.status, 0, mirror.stdout + mirror.stderr);

    const write = spawnSync(process.execPath, [rootChecklists], { cwd: root, encoding: 'utf8' });
    assert.equal(write.status, 0, write.stdout + write.stderr);
    assert.ok(existsSync(sandboxCoverage), 'the generator must create the directory it owns');
    if (stashed !== null) {
      assert.equal(
        readFileSync(sandboxCoverage, 'utf8'),
        stashed,
        'the regenerated artifact must be byte-identical to the one that was there',
      );
    }

    // The planted negative, kept: a generator that does NOT create its own
    // directory fails exactly here, which is what this drill was written for.
    rmSync(sandboxCoverageDir, { recursive: true, force: true });
    assert.equal(existsSync(sandboxCoverage), false);
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }

  // And the real tree never moved: not the ignored directory, not either
  // artifact, not the index.
  assert.equal(realTreeFingerprint(), before, 'the drill mutated the real worktree');
});
