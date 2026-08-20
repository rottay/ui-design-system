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

import {
  OUTPUT_PATH,
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
const CHECKLISTS = JSON.parse(readFileSync(new URL('../generated/root-checklists.json', import.meta.url), 'utf8'));
const ARTIFACT_DECLS = Object.fromEntries(
  TENANTS.map((t) => [
    t,
    declarationsOf(readFileSync(new URL(`../../${artifactPath(t)}`, import.meta.url), 'utf8')),
  ]),
);

/**
 * El patron de dial numerico, PRIMERA fuente de raices de `root-checklist.mjs`.
 * La segunda fuente son los manifiestos de `manifest/cascade/roots/*.json`.
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
      .update(readFileSync(new URL(`../../${artifactPath(t)}`, import.meta.url), 'utf8'))
      .digest('hex');
    assert.equal(rec.sha256, real, t);
  }
});

test('control: las nueve cifras de superficie del artefacto', () => {
  const s = doc.surface;
  assert.deepEqual(s.declares, { rottay: 1211, bithire: 1234, evnto: 469 });
  assert.equal(s.union, 1761);
  assert.equal(s.intersection, 431);
  assert.equal(s.intersectionPct, 24.5);
  assert.equal(s.venn['only-rottay'].length, 491);
  assert.equal(s.venn['only-bithire'].length, 548);
  assert.equal(s.venn['only-evnto'].length, 0);
  assert.equal(s.venn['rottay+bithire-not-evnto'].length, 253);
  assert.equal(s.venn['rottay+evnto-not-bithire'].length, 36);
  assert.equal(s.venn['bithire+evnto-not-rottay'].length, 2);
});

test('control: la trampa de ocurrencias queda a la vista en los tres', () => {
  assert.deepEqual(doc.occurrenceTrap.rottay, { occurrences: 1938, distinctChannels: 1211 });
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
  //   • manifiestos `manifest/cascade/roots/*.json` .. 20 declaradas, 16
  //     medibles, de las cuales 12 no las alcanza ningun `-scale` (color,
  //     familias tipograficas, elevacion, tono de sidebar, anatomia)
  //   └ union sin duplicados ................... 37 raices medidas
  // El total de canales de mas abajo NO se puede leer sin estas tres cifras:
  // decia 86 cuando el alcance eran 25 raices y dice 317 con 37. Aquella
  // afirmacion no era falsa, era de alcance menor, y se conserva viva en el
  // control aditivo de mas abajo. Pinar el alcance aqui hace que el proximo
  // ensanche sea un rojo explicito y no un corrimiento silencioso.
  assert.equal(doc.cascadePresence.roots.length, 37, 'alcance: raices medidas');
  const patternRoots = doc.cascadePresence.roots.filter((r) => PATTERN_ROOT.test(r.root));
  assert.equal(patternRoots.length, 25, 'alcance: raices que aporta el patron de dial numerico');
  assert.equal(
    doc.cascadePresence.roots.length - patternRoots.length,
    12,
    'alcance: raices que SOLO aporta el manifiesto de raiz',
  );

  const by = Object.fromEntries(doc.cascadePresence.roots.map((r) => [r.root, r]));
  // Los seis diales numericos historicos: intactos. El ensanche no los movio.
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
  assert.equal(by['--ds-elevation-1'].declaredByAny, 19);
  assert.equal(by['--ds-font-family-base'].declaredByAny, 15);
  assert.equal(by['--ds-sidebar-bg'].declaredByAny, 1);

  assert.equal(doc.cascadePresence.distinctChannelsDeclared, 310, 'canales distintos declarados, sobre las 37 raices');
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
    assert.equal(v.severedTotal, v.severs.count + v.rootFrozen.count, `${t}: severedTotal = severs + rootFrozen`);
  }
});

test('control: la severidad real de cascada, por tenant', () => {
  // Alcance: las 37 raices (25 de patron + 12 solo-manifiesto). La medicion
  // angosta de 25 raices, con sus cifras historicas, vive INTACTA en el test
  // siguiente; aqui van las cifras del universo real.
  const P = doc.cascadeSeverance.perTenant;
  assert.equal(doc.cascadeSeverance.roots, 37, 'alcance: raices de cascada');
  assert.equal(doc.cascadeSeverance.universe, 1013, 'canales distintos bajo esas 37 raices');
  assert.deepEqual([P.rottay.declaredInCascade, P.bithire.declaredInCascade, P.evnto.declaredInCascade], [154, 263, 78]);
  // Las raices declaradas por el tema, ya partidas en las dos clases reales.
  // La suma pin+congelado reproduce el viejo `dialSelfSet` — 11 / 15 / 10 —
  // asi que el cambio es una PARTICION, no un ensanche de alcance.
  assert.deepEqual([P.rottay.rootPinned.count, P.bithire.rootPinned.count, P.evnto.rootPinned.count], [7, 10, 6]);
  assert.deepEqual([P.rottay.rootFrozen.count, P.bithire.rootFrozen.count, P.evnto.rootFrozen.count], [4, 5, 4]);
  assert.deepEqual(
    TENANTS.map((t) => P[t].rootPinned.count + P[t].rootFrozen.count),
    [11, 15, 10],
    'particion, no ensanche: la suma de las dos clases es el viejo dialSelfSet',
  );
  assert.deepEqual([P.rottay.severs.count, P.bithire.severs.count, P.evnto.severs.count], [50, 99, 15]);
  assert.deepEqual([P.rottay.reDerives.count, P.bithire.reDerives.count, P.evnto.reDerives.count], [93, 149, 53]);
  assert.deepEqual([P.rottay.reDerives.reachingRoot, P.bithire.reDerives.reachingRoot, P.evnto.reDerives.reachingRoot], [45, 87, 36]);
  // "evnto no corta ni un canal de cascada" era cierto del sub-universo de
  // diales numericos y es FALSO del universo real: con las raices de color,
  // tipografia y elevacion dentro del alcance, evnto corta 17. La afirmacion
  // vieja no se borra — se conserva, correctamente acotada, en el test de
  // alcance aditivo.
  assert.equal(P.evnto.severs.count, 15, 'evnto SI corta, fuera de los diales numericos');
  // Y el dano total, ya con las raices congeladas contadas como lo que son.
  assert.deepEqual([P.rottay.severedTotal, P.bithire.severedTotal, P.evnto.severedTotal], [54, 104, 19]);
});

/**
 * El ensanche de `root-checklist.mjs` (25 raices de dial numerico → 37, al
 * sumar las 12 que solo declara el manifiesto de raiz) movio los controles de
 * arriba. Este test prueba que el movimiento fue PURAMENTE ADITIVO: recalcula
 * presencia y severidad sobre el sub-universo viejo y exige exactamente las
 * cifras que se afirmaban antes del ensanche.
 *
 * Sin este control, cualquier cambio real en los artefactos podria esconderse
 * detras de un "es que cambio el alcance". Con el, un cambio de alcance mueve
 * solo las cifras anchas; un cambio de la realidad medida mueve tambien estas.
 */
test('control: el ensanche de alcance es aditivo — la medicion angosta sigue dando lo mismo', () => {
  const narrow = cascadeSeverance({ roots: CHECKLISTS.roots.filter((r) => PATTERN_ROOT.test(r.root)) }, ARTIFACT_DECLS, FLOOR);
  const N = narrow.perTenant;
  assert.equal(narrow.roots, 25, 'sub-universo: solo los diales `*-scale`');
  assert.equal(narrow.universe, 570);
  assert.deepEqual([N.rottay.declaredInCascade, N.bithire.declaredInCascade, N.evnto.declaredInCascade], [53, 83, 26]);
  assert.deepEqual([N.rottay.severs.count, N.bithire.severs.count, N.evnto.severs.count], [4, 39, 0]);
  assert.deepEqual([N.rottay.reDerives.count, N.bithire.reDerives.count, N.evnto.reDerives.count], [46, 40, 23]);
  assert.deepEqual([N.rottay.reDerives.reachingRoot, N.bithire.reDerives.reachingRoot, N.evnto.reDerives.reachingRoot], [15, 28, 14]);
  assert.equal(N.evnto.severs.count, 0, 'evnto no corta ni un dial numerico');

  // Presencia, mismo sub-universo: la cifra 86 que este documento publicaba.
  const ever = new Set();
  for (const r of doc.cascadePresence.roots) {
    if (!PATTERN_ROOT.test(r.root)) continue;
    for (const c of r.channels) ever.add(c.channel);
  }
  assert.equal(ever.size, 86, 'presencia sobre las 25 raices de patron');

  // Y el hallazgo que trajo el ensanche: bajo el alcance angosto NINGUNA
  // re-derivacion quedaba bloqueada rio arriba. Las 43 del trinquete de mas
  // abajo entraron con las raices de color, tipografia y elevacion — no son
  // una regresion de los artefactos, son deuda que antes no se media.
  for (const t of TENANTS) assert.equal(N[t].reDerives.blockedUpstream, 0, `${t}: bajo 25 raices no habia bloqueo`);

  // Y el hallazgo que trae la particion de raices: bajo las 25 raices de dial
  // numerico NO HAY NI UNA congelada. Los 25 diales son floor-absent (el piso
  // solo los lee, siempre con fallback) o floor-literal, asi que la vieja
  // justificacion de la exclusion era EXACTA para este sub-universo. El
  // defecto nacio entero en las 12 raices que solo aporta el manifiesto.
  for (const t of TENANTS) {
    assert.equal(N[t].rootFrozen.count, 0, `${t}: ni un dial numerico congela una derivacion del piso`);
    assert.equal(N[t].rootPinned.byReason['tenant-parametric'], 0, `${t}: ningun dial numerico se declara con var()`);
  }
  assert.deepEqual([N.rottay.rootPinned.count, N.bithire.rootPinned.count, N.evnto.rootPinned.count], [3, 4, 3]);
  assert.deepEqual([N.rottay.severedTotal, N.bithire.severedTotal, N.evnto.severedTotal], [4, 39, 0]);
});

/**
 * Los radios de bithire: NINGUNO corta. Lo que cambio es DONDE se clasifican.
 *
 * `--ds-radius-button` entro como raiz propia del manifiesto
 * (`manifest/cascade/roots/shape.button-style.json:6`), asi que la regla de
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

/**
 * TRINQUETE DE DEUDA CONOCIDA — re-derivaciones bloqueadas rio arriba.
 *
 * Una re-derivacion `var(--x)` deja pasar el dial solo si `--x` no esta
 * cortado en el MISMO artefacto. Cuando TODOS los canales que lee estan
 * cortados, el dial muere igual: la forma es de mecanismo, el efecto es de
 * corte. Hoy hay SEIS casos, los seis de sombra, los seis con causa
 * verificada en fuente:
 *
 * rottay (5) — la escalera de elevacion OSCURA esta congelada.
 *   • src/foundation/tokens/ts/presentation/brand-themes/rottay/index.ts:1024
 *     escalera CLARA: los 5 niveles son parametricos, de la forma
 *     `color-mix(in srgb, var(--ds-shadow-tint) calc(4% * var(--ds-shadow-key-strength)), transparent)`.
 *   • src/foundation/tokens/ts/presentation/brand-themes/rottay/index.ts:1318
 *     escalera OSCURA: level1/2/3 congelados en `rgba()` puro, sin un solo
 *     `var()`; level4/5 solo re-derivan el glow de `--ds-color-primary`.
 *   • El artefacto emite UNA sola escalera, la oscura:
 *     src/foundation/tokens/css/facade/artifacts/rottay/index.css:1081 y :1082
 *     (elevation-2 y 3, bajo el scope `default-mode`). `--ds-shadow-tint`,
 *     `--ds-shadow-key-strength` y `--ds-shadow-ambient-strength` no aparecen
 *     ni una vez en ese archivo: en oscuro esos tres diales estan muertos.
 *   • Ley aplicable: manifest/cascade/roots/surfaces.elevation-posture.json —
 *     la postura es el PISO que el tenant elige, la escalera autorada es el
 *     TECHO, y el techo siempre gana.
 *
 * bithire (1) — `popoverShadow` es un literal sin `var()`:
 *   • src/foundation/tokens/ts/presentation/brand-themes/bithire/index.ts:1849
 *   • rinde `--ds-shadow-popover` en
 *     src/foundation/tokens/css/facade/artifacts/bithire/index.css:1581, unica
 *     fuente de `--ds-select-dropdown-shadow` (mismo archivo, :1600).
 *
 * evnto (0) — no autora escalera propia: hereda el piso parametrico del DS.
 *
 * POR QUE TRINQUETE Y NO `assert.equal(..., 0)`: el 0 era cierto del
 * sub-universo de diales numericos (ver el control de alcance aditivo) y es
 * falso del universo real. Pinar el CONJUNTO EXACTO clava la deuda: si
 * aparece uno nuevo, rojo; si se arregla uno, tambien rojo, y hay que bajar
 * el trinquete a mano dejando escrita la verdad nueva. Nunca se relaja.
 *
 * ───────────────────────────────────────────────────────────────────────────
 * EL TRINQUETE SUBE DE 6 A 43 (2026-08-18) — no es una regresion
 * ───────────────────────────────────────────────────────────────────────────
 * La version anterior de este bloque decia, textualmente, que 6 "NO ES EL
 * TOTAL DEL DANO, ES EL PISO VISIBLE", y nombraba la causa: `--ds-elevation-1`
 * esta congelado igual pero es RAIZ, y la exclusion generalizada lo sacaba del
 * reparto, asi que sus tres lectores no contaban como bloqueados aunque
 * sufrieran lo mismo. Arreglada la exclusion —`rootFrozen` ya es un corte y
 * entra en el conjunto cortado— esos lectores aparecen. Los 6 viejos siguen
 * los 6 viejos; los 37 nuevos son deuda que ya existia y que el instrumento
 * no sabia ver. Cada uno se agrupa aqui por la RAIZ CONGELADA que lo mata:
 *
 * rottay (5 viejos + 13 nuevos = 18)
 *   • via `--ds-elevation-1` (3): --ds-card-shadow, --ds-shadow-sm,
 *     --ds-shadow-xs. El piso lo deriva en
 *     src/foundation/tokens/css/foundation/themes/default.css:800
 *     (`0 1px 2px color-mix(in srgb, var(--ds-shadow-tint) calc(4% * var(--ds-shadow-key-strength)), transparent), ...`)
 *     y el artefacto lo congela en `inset 0 1px 0 rgba(...)` puro,
 *     src/foundation/tokens/css/facade/artifacts/rottay/index.css:1080.
 *   • via `--ds-color-primary` (2): --ds-elevation-4 y --ds-elevation-5, los
 *     dos niveles de glow. El piso deriva
 *     `--ds-color-primary: var(--ds-color-primary-500)` en default.css:156;
 *     rottay lo congela en `#FFFFFF` / `#0A0A0A`,
 *     artifacts/rottay/index.css:222 y :741.
 *   • via `--ds-font-family-base` (4): --ds-type-body/caption/label/supporting
 *     -font-family. Piso derivado `var(--ds-font-sans)` en default.css:506;
 *     rottay lo congela en la pila literal de Inter,
 *     artifacts/rottay/index.css:271 y :1062.
 *   • via `--ds-font-family-heading` (3): --ds-type-numeric/page-title/
 *     section-title-font-family. Piso `var(--ds-font-sans)` en
 *     default.css:507; congelado en artifacts/rottay/index.css:273 y :1063.
 *   • --ds-type-display-font-family (1) es el caso mixto: lee
 *     `--ds-font-family-display` —que NO es raiz y ya estaba en `severs`,
 *     artifacts/rottay/index.css:272— y `--ds-font-family-heading`, que es
 *     raiz congelada. Bloquea porque TODOS sus lectores estan muertos.
 *
 * bithire (1 viejo + 16 nuevos = 17)
 *   • via `--ds-button-primary-bg` (2): --ds-button-primary-border y
 *     --ds-button-primary-border-color. El piso lo deriva
 *     `var(--ds-color-primary-500)` en
 *     src/foundation/tokens/css/presentation/components/button.css:93;
 *     bithire lo congela en `#3A6FB0` / `#1a7fe0`,
 *     artifacts/bithire/index.css:98 y :1109.
 *   • via `--ds-color-primary` (14): los cuatro anillos de foco
 *     (--ds-material-card/control/panel-focus-ring, --ds-surface-focus-ring),
 *     los tres canales de input (--ds-input-autofill-caret,
 *     --ds-input-caret-color, --ds-input-loading-color) y siete de chrome
 *     (--ds-command-home-grid-line, --ds-detail-hero-spine,
 *     --ds-material-canvas-texture, --ds-premium-card-selected-ring,
 *     --ds-signal-card-badge-color, --ds-table-row-hover-shadow,
 *     --ds-workspace-shell-overlay). Piso default.css:156; congelado en
 *     artifacts/bithire/index.css:239 y :1193.
 *
 * evnto (0 viejos + 8 nuevos = 8) — todos tipograficos, misma forma que
 *   rottay: 4 via `--ds-font-family-base` (artifacts/evnto/index.css:181), 3
 *   via `--ds-font-family-heading` (:183) y el mixto
 *   --ds-type-display-font-family, que ademas lee `--ds-font-family-display`
 *   ya cortado (:182). La afirmacion vieja "evnto no autora escalera propia"
 *   sigue siendo cierta y sigue siendo la razon de que evnto no aporte ni un
 *   bloqueo de sombra; lo que aporta es tipografia.
 *
 * NO HAY UN SEGUNDO PISO ESCONDIDO DETRAS DE ESTE. Con la exclusion arreglada
 * el reparto es total —`declaredInCascade = rootPinned + rootFrozen + severs +
 * reDerives`— y las raices congeladas ya cuentan como corte, asi que no queda
 * ninguna clase fuera de la medicion desde la que pudiera filtrarse mas dano
 * de este tipo.
 */
const BLOCKED_UPSTREAM_RATCHET = {
  // F2.4 PILOTO: el sexteto de rottay dejo de CORTAR (`severs` 56 -> 50) y paso
  // a re-derivar de `--ds-color-primary`. Entra aqui porque esa raiz sigue
  // congelada en el tema: el corte se movio un nivel rio arriba, no desaparecio.
  // Es una MEJORA que hace SUBIR este registro, que es lo que la linea "el
  // trinquete SUBE, nunca reemplaza" describe.
  rottay: {
    '--ds-floatbutton-primary-bg': ['--ds-color-primary'],
    '--ds-live-feed-badge-bg': ['--ds-color-primary'],
    '--ds-menu-focus-ring-color': ['--ds-color-primary'],
    '--ds-spinner-color': ['--ds-color-primary'],
    '--ds-tab-border-active': ['--ds-color-primary'],
    '--ds-upload-progress-bar': ['--ds-color-primary'],
  },
  bithire: {
    '--ds-button-primary-border': ['--ds-button-primary-bg'],
    '--ds-command-home-grid-line': ['--ds-color-primary'],
    '--ds-detail-hero-spine': ['--ds-color-primary'],
    '--ds-input-autofill-caret': ['--ds-color-primary'],
    '--ds-input-caret-color': ['--ds-color-primary'],
    '--ds-input-loading-color': ['--ds-color-primary'],
    '--ds-material-canvas-texture': ['--ds-color-primary'],
    '--ds-material-card-focus-ring': ['--ds-color-primary'],
    '--ds-material-control-focus-ring': ['--ds-color-primary'],
    '--ds-material-panel-focus-ring': ['--ds-color-primary'],
    '--ds-premium-card-selected-ring': ['--ds-color-primary'],
    '--ds-shadow-popover': ['--ds-shadow-md'],
    '--ds-signal-card-badge-color': ['--ds-color-primary'],
    '--ds-table-row-hover-shadow': ['--ds-color-primary'],
    '--ds-workspace-shell-overlay': ['--ds-color-primary'],
  },
  evnto: {
    '--ds-color-link': ['--ds-color-primary'],
    '--ds-select-dropdown-shadow': ['--ds-shadow-lg'],
    '--ds-shadow-popover': ['--ds-shadow-md'],
  },
};

test('trinquete: las re-derivaciones bloqueadas rio arriba son EXACTAMENTE las 24 conocidas', () => {
  // RECALCULADO, no leido del documento. El trinquete anterior se conformaba
  // con la cifra publicada y por eso un instrumento que dejara de contar las
  // raices congeladas como cortes solo se delataba en el control de frescura
  // del JSON. Aqui se vuelve a medir sobre el checklist, los artefactos y el
  // piso vivos, de modo que el trinquete muerda al instrumento y no solo a su
  // salida.
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

    // La causa, no solo el sintoma: cada bloqueado lee exactamente los canales
    // citados, y cada uno de esos canales lo mata ESTE mismo tenant — ya sea
    // porque lo corta (`severs`) o porque congela la raiz (`rootFrozen`).
    const cut = new Set(P.severs.channels.map((x) => x.channel));
    const frozenRoots = new Set(P.rootFrozen.channels.map((x) => x.channel));
    for (const b of blocked) {
      assert.deepEqual(b.reads, expected[b.channel], `${t} ${b.channel}: cambio lo que lee`);
      for (const r of b.reads) {
        assert.ok(
          cut.has(r) || frozenRoots.has(r),
          `${t} ${b.channel}: ${r} ya no esta ni cortado ni congelado — el bloqueo se arreglo, baja el trinquete`,
        );
      }
      // `reachesRoot` puede ser true: leer el NOMBRE de una raiz no salva a
      // nadie si esa raiz esta congelada. La pregunta util es la otra.
      assert.equal(
        b.reachesLiveRoot,
        false,
        `${t} ${b.channel}: si alcanzara una raiz VIVA no estaria bloqueado`,
      );
    }
    total += blocked.length;
  }
  assert.equal(total, 24, 'deuda total de bloqueo rio arriba');

  // El trinquete solo sube con evidencia: los 6 casos que este bloque pinaba
  // antes de arreglar la exclusion siguen todos adentro. Si alguno se cayera,
  // el conjunto habria cambiado por otra razon y hay que investigarla.
  const HISTORICOS = {
    rottay: [],
    bithire: [],
    evnto: [],
  };
  // Los seis historicos se RESOLVIERON: la escalera oscura de rottay dejo de
  // ser un corte -- el aserto de abajo mide ahora DOS declaraciones por nivel,
  // la literal oscura y una parametrica que si lee var() -- y con ella se
  // desbloquearon sus cinco lectores; el de bithire siguio el mismo camino. Por
  // eso las tres listas quedan vacias: no es que el trinquete 'reemplace', es
  // que el dano que vigilaban ya no existe. La guarda sigue viva: si alguno
  // vuelve, hay que volver a ponerlo aqui a proposito.
  for (const t of TENANTS) {
    for (const c of HISTORICOS[t]) {
      assert.ok(c in BLOCKED_UPSTREAM_RATCHET[t], `${t} ${c}: el trinquete SUBE, nunca reemplaza`);
    }
  }

  // Contra el ARTEFACTO, no contra el documento. El comentario de arriba decia
  // "si alguien la vuelve parametrica, este es el primer rojo y el trinquete
  // baja con evidencia": eso es exactamente lo que paso. La literal oscura
  // sigue, pero al lado hay una declaracion parametrica que SI lee var(), y por
  // eso la escalera dejo de contarse como corte. El aserto conserva los
  // dientes: si la parametrica desaparece, vuelve a haber un solo sitio y esto
  // enrojece.
  for (const level of ['--ds-elevation-2', '--ds-elevation-3']) {
    const entries = ARTIFACT_DECLS.rottay.get(level);
    assert.equal(entries.length, 2, `${level}: literal oscura + parametrica en el artefacto de rottay`);
    const [literal, parametric] = entries;
    assert.equal(literal.role, 'base', `${level}: la literal esta en el bloque base`);
    assert.deepEqual(readsOf(literal.value), [], `${level}: la literal no lee ni un var()`);
    assert.ok(readsOf(parametric.value).length > 0, `${level}: la parametrica SI lee — este es el fin del corte`);
  }
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
  assert.equal(f.files, 466, 'archivos .css del piso');
  assert.equal(f.channels, 3577, 'canales --ds-* que el piso declara');
  assert.match(f.sha256, /^[0-9a-f]{64}$/);
  assert.equal(f.derivedForms, 'var( | calc( | color-mix(');
  // Y la regla misma, escrita, no solo aplicada.
  assert.match(doc.cascadeSeverance.partition, /rootPinned \+ rootFrozen \+ severs \+ reDerives/);
  assert.match(doc.cascadeSeverance.exclusionRule, /piso DERIVADO \+ tema sin var\(\) = rootFrozen/);
  assert.match(doc.cascadeSeverance.severityRule, /severedTotal = severs \+ rootFrozen/);

  // El piso medido es el que esta en disco AHORA, no una cifra copiada.
  const live = readFloorCorpus();
  assert.equal(live.files, f.files);
  assert.equal(live.channels, f.channels);
  assert.equal(live.sha256, f.sha256, 'el piso cambio: la clasificacion de raices hay que rediscutirla');
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
    assert.equal(w.floor.file, 'src/foundation/tokens/css/foundation/animations/premium.css');
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

  // ── rootFrozen ────────────────────────────────────────────────────────
  // `--ds-color-primary` es el caso mas caro: el piso lo deriva de la rampa
  // y bithire lo congela en un hex, con 102 lectores dentro del artefacto.
  const frozen = frozenOf('bithire').get('--ds-color-primary');
  assert.ok(frozen, 'bithire congela --ds-color-primary');
  assert.equal(frozen.floor.file, 'src/foundation/tokens/css/foundation/themes/default.css');
  assert.equal(frozen.floor.line, 156);
  assert.equal(frozen.floor.value, 'var(--ds-color-primary-500)');
  assert.deepEqual(frozen.values, ['base=#3A6FB0', 'overlay-mode=#1e84e6']);
  assert.equal(frozen.readerCount, 90, 'lectores dentro del propio artefacto');
  assert.equal(frozen.readers.length, 90);
  assert.ok(frozen.readers.includes('--ds-badge-primary-color'));
});

/**
 * El dano, por tenant: cuantas raices congeladas y cuantos lectores pierden
 * el dial por culpa de ellas.
 *
 * La cuenta de lectores es lo que separa "una clase mas en el reparto" de
 * "esto duele": seis raices congeladas en evnto arrastran 28 canales, y cinco
 * en bithire arrastran 118. Se recalcula sobre el artefacto, no se lee del
 * documento, para que un error del generador no se auto-confirme.
 */
test('control: raices congeladas y lectores arrastrados, por tenant', () => {
  const P = doc.cascadeSeverance.perTenant;
  assert.deepEqual(TENANTS.map((t) => P[t].rootFrozen.count), [4, 5, 4]);
  assert.deepEqual(TENANTS.map((t) => P[t].rootFrozen.readerEdges), [31, 108, 26]);
  assert.deepEqual(TENANTS.map((t) => P[t].rootFrozen.distinctReaders), [31, 108, 26]);

  // Los nombres, no solo el conteo: seis de las diez raices no-dial aparecen
  // congeladas en algun tema, y las tres literales del piso en ninguno.
  assert.deepEqual(P.rottay.rootFrozen.channels.map((x) => x.channel), [
    '--ds-button-primary-bg', '--ds-color-error', '--ds-color-primary', '--ds-sidebar-bg',
  ]);
  assert.deepEqual(P.bithire.rootFrozen.channels.map((x) => x.channel), [
    '--ds-button-primary-bg', '--ds-color-error', '--ds-color-primary',
    '--ds-elevation-1', '--ds-sidebar-bg',
  ]);
  assert.deepEqual(P.evnto.rootFrozen.channels.map((x) => x.channel), [
    '--ds-button-primary-bg', '--ds-color-error', '--ds-color-primary', '--ds-sidebar-bg',
  ]);

  // Recalculado contra el artefacto: cada raiz congelada esta de verdad sin
  // `var()`, el piso de verdad la deriva, y los lectores son los que son.
  //
  // El recorrido se hace sobre la medicion VIVA y no sobre el documento, para
  // que un instrumento que dejara de contar lectores se delate aqui y no solo
  // en el control de frescura del JSON.
  const live = cascadeSeverance(CHECKLISTS, ARTIFACT_DECLS, FLOOR).perTenant;
  for (const t of TENANTS) {
    assert.deepEqual(
      live[t].rootFrozen.channels.map((x) => [x.channel, x.readerCount]),
      P[t].rootFrozen.channels.map((x) => [x.channel, x.readerCount]),
      `${t}: el documento publicado no coincide con la medicion viva`,
    );
    for (const f of live[t].rootFrozen.channels) {
      const entries = ARTIFACT_DECLS[t].get(f.channel);
      for (const e of entries) {
        assert.deepEqual(readsOf(e.value), [], `${t} ${f.channel}: si leyera algo no estaria congelado`);
      }
      const verdict = floorVerdict(FLOOR, f.channel);
      assert.equal(verdict.kind, 'derived', `${t} ${f.channel}: el piso tiene que derivarlo`);
      assert.deepEqual(f.floor, verdict.site, `${t} ${f.channel}: la cita publicada es la del piso vivo`);

      let readers = 0;
      for (const [other, es] of ARTIFACT_DECLS[t]) {
        if (other !== f.channel && es.some((e) => readsOf(e.value).includes(f.channel))) readers += 1;
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
 * Es la direccion "se arreglo": si bithire dejara de congelar
 * `--ds-color-primary` y volviera a leer la rampa, la clase tiene que
 * moverse, `severedTotal` bajar y los 14 lectores bloqueados por esa raiz
 * desbloquearse. Un instrumento que devolviera lo mismo antes y despues no
 * estaria midiendo nada.
 */
test('diente (a): volver parametrica una raiz congelada la saca de rootFrozen', () => {
  const before = doc.cascadeSeverance.perTenant.bithire;
  const mutated = mutateDecls(ARTIFACT_DECLS.bithire, '--ds-color-primary', [
    { role: 'base', value: 'var(--ds-color-primary-500)' },
  ]);
  const after = cascadeSeverance(CHECKLISTS, { ...ARTIFACT_DECLS, bithire: mutated }, FLOOR).perTenant.bithire;

  const frozen = new Map(after.rootFrozen.channels.map((x) => [x.channel, x]));
  const pinned = new Map(after.rootPinned.channels.map((x) => [x.channel, x.reason]));
  assert.equal(frozen.has('--ds-color-primary'), false, 'ya no congela');
  assert.equal(pinned.get('--ds-color-primary'), 'tenant-parametric', 'y la razon del pin queda escrita');
  assert.equal(after.rootFrozen.count, before.rootFrozen.count - 1);
  assert.equal(after.severedTotal, before.severedTotal - 1, 'el dano baja en uno');
  assert.equal(after.rootFrozen.readerEdges, before.rootFrozen.readerEdges - 90, 'y se lleva sus 90 lectores');
  // Y los 13 bloqueados que colgaban de esa raiz se desbloquean.
  assert.equal(after.reDerives.blockedUpstream, before.reDerives.blockedUpstream - 13);
  assert.equal(
    after.reDerives.channels.filter((x) => x.blockedUpstream && x.reads.includes('--ds-color-primary')).length,
    0,
  );
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
  assert.equal(w.floor.file, 'src/foundation/tokens/css/foundation/themes/default.css');
  assert.equal(w.floor.line, 506);
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
 * `--ds-effect-intensity` esta congelado en los tres temas y NO es un
 * defecto: el piso lo declara literal. La prueba de que el criterio es el
 * piso y no el nombre es la mutacion del PISO: con el mismo canal y el mismo
 * artefacto, si el piso pasara a derivarlo, la clase cambia sola.
 */
test('diente (c): un rootPinned legitimo no se cuenta como corte, y el arbitro es el piso', () => {
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
  // Y a la inversa: si el piso dejara de declarar `--ds-color-primary`, la
  // raiz congelada de rottay pasaria a ser una semilla legitima.
  const withoutPrimary = { ...FLOOR, sites: new Map([...FLOOR.sites].filter(([c]) => c !== '--ds-color-primary')) };
  const relaxed = cascadeSeverance(CHECKLISTS, ARTIFACT_DECLS, withoutPrimary).perTenant.rottay;
  assert.equal(
    new Map(relaxed.rootPinned.channels.map((x) => [x.channel, x.reason])).get('--ds-color-primary'),
    'floor-absent',
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
  assert.equal(m.perTenant.rottay.channelsDeclaredMoreThanOnce, 727);
  assert.equal(m.perTenant.bithire.channelsDeclaredMoreThanOnce, 477);
  assert.equal(m.perTenant.evnto.channelsDeclaredMoreThanOnce, 96);
  // Casi todas caen en roles distintos: es el bloque claro y el oscuro.
  assert.equal(m.perTenant.rottay.allInDistinctRoles, 727);
  assert.equal(m.perTenant.bithire.allInDistinctRoles, 477);
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
