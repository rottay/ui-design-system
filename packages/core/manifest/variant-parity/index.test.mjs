import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import {
  DOMICILES,
  METADATA_EXCLUSION,
  PAINT_DENOMINATOR,
  analyzeSource,
  buildDoc,
  build,
  evaluate,
  emptinessFailures,
  metadataGuard,
  parseDocblocks,
  pathIndex,
  serialize,
  BASELINE_PATH,
} from './index.mjs';
import { TENANTS, PACKAGE_ROOT, sourcePath, authoredLeafPaths as authoredLeafPathsReal } from '../mirror-parity/index.mjs';

/**
 * Los fixtures son texto de fuente SINTETICO y se mutan EN MEMORIA — nunca en
 * `src/`. Son chicos a proposito: la matriz de cada drill se puede verificar a
 * ojo contra el texto de al lado.
 */

const SIN_TAGS = `
const PALETTE = {
  primary: '#111111',
  secondary: '#222222',
};

const rottayBrandTheme = {
  id: 'x',
  palette: PALETTE,
};
`;

const CON_TAGS = `
/**
 * @domicile seed
 * @governor dial: palette.seeds
 */
const PALETTE = {
  primary: '#111111',
  /**
   * @domicile derived
   * @governor deriva de: --ds-color-primary
   */
  secondary: '#222222',
  ramps: {
    a: '#333333',
  },
};
`;

const provenanceFalsa = { sources: [], mtimeExcluded: 'fixture' };
// `enforceMetadata: false` en los fixtures: la lista de 36 metadatos habla de
// las fuentes REALES; exigirla sobre un corpus sintetico serian 36 fallas que
// no prueban nada. Su diente se verifica aparte, sobre el corpus real.
const doc = (sources) => buildDoc({ sources, provenance: provenanceFalsa, enforceMetadata: false });

/* ── 1. positivo: los 3 alcances, herencia y cercania ───────────────────── */

test('positivo: el docblock de const cubre sus hojas y el de hoja gana por cercania', () => {
  const a = analyzeSource({ tenant: 'rottay', text: CON_TAGS });
  assert.deepEqual(a.failures, [], 'un fixture bien formado no produce fallas');
  // 3 hojas: PALETTE.primary, PALETTE.secondary, PALETTE.ramps.a
  assert.equal(a.leaves.size, 3);
  // 2 tags de alcance: el const y la hoja
  assert.equal(a.tags.length, 2);
  assert.deepEqual(a.tags.map((t) => t.scope).sort(), ['PALETTE', 'PALETTE.secondary']);
  // las 3 quedan cubiertas: 2 heredan del const, 1 por su propio docblock
  assert.equal(a.coveredCount, 3);
});

test('positivo: la clase de governor se reporta por domicilio', () => {
  const a = analyzeSource({ tenant: 'rottay', text: CON_TAGS });
  const porScope = Object.fromEntries(a.tags.map((t) => [t.scope, t.governorClass]));
  assert.equal(porScope.PALETTE, 'dial');
  assert.equal(porScope['PALETTE.secondary'], 'funcion-o-raiz');
});

test('el vocabulario de domicilios es exactamente el cerrado', () => {
  assert.deepEqual(DOMICILES, ['seed', 'derived', 'pro-expert', 'unassigned']);
});

/**
 * F4A-close, Lote C (Fable arbitraje final, C-1b): `baseline` retirado del
 * vocabulario cerrado. Ruling K5a v2 P1-3 lo pedia como deuda separada; 0
 * usos en los 3 temas medidos antes de retirar. Esta negativa prueba que la
 * palabra ya no es un domicilio valido: un docblock que la use falla igual
 * que cualquier otro token fuera del vocabulario cerrado.
 */
test('drill C-1b: @domicile baseline ya no es valido -- vocabulario cerrado sin el', () => {
  const text = CON_TAGS.replace('@domicile seed', '@domicile baseline');
  const a = analyzeSource({ tenant: 'rottay', text });
  assert.equal(a.failures.length, 1);
  assert.equal(
    a.failures[0].replace(/^rottay:\d+:\s*/, ''),
    '@domicile desconocido "baseline" (cerrado: seed | derived | pro-expert | unassigned)',
  );
});

/* ── 2. vocabulario ──────────────────────────────────────────────────────── */

test('drill vocabulario: @domicile semilla falla nombrando tag y linea', () => {
  const text = CON_TAGS.replace('@domicile seed', '@domicile semilla');
  const a = analyzeSource({ tenant: 'rottay', text });
  assert.equal(a.failures.length, 1);
  assert.match(a.failures[0], /@domicile desconocido "semilla"/);
  assert.match(a.failures[0], /^rottay:\d+:/, 'la falla cita tema y linea');
});

/* ── 3. forma ────────────────────────────────────────────────────────────── */

test('drill forma: @domicile sin @governor falla', () => {
  const text = CON_TAGS.replace(' * @governor dial: palette.seeds\n', '');
  const a = analyzeSource({ tenant: 'rottay', text });
  assert.equal(a.failures.length, 1);
  assert.match(a.failures[0], /sin @governor/);
});

test('drill forma: @governor multilinea falla', () => {
  const text = CON_TAGS.replace(
    ' * @governor dial: palette.seeds\n',
    ' * @governor dial: palette.seeds\n *   y una segunda linea que no deberia estar\n',
  );
  const a = analyzeSource({ tenant: 'rottay', text });
  assert.ok(a.failures.some((f) => /multilinea/.test(f)), `esperaba una falla de multilinea, hubo: ${JSON.stringify(a.failures)}`);
});

/* ── 4. placeholder ──────────────────────────────────────────────────────── */

const PH_OK = `
/**
 * @placeholder PALETTE.secondary
 * @domicile unassigned
 * @governor none — gap aceptado: bithire no pinta secundario
 */
const PALETTE = {
  primary: '#999999',
};
`;

test('drill placeholder: bien formado aporta posicion y BAJA la divergencia', () => {
  const sinPh = doc({ rottay: CON_TAGS, bithire: '\nconst PALETTE = {\n  primary: \'#999999\',\n};\n' });
  const conPh = doc({ rottay: CON_TAGS, bithire: PH_OK });
  assert.equal(conPh.failures.length, 0);
  assert.ok(
    conPh.ratchet.divergentSlots < sinPh.ratchet.divergentSlots,
    `el placeholder tiene que bajar la divergencia: ${sinPh.ratchet.divergentSlots} -> ${conPh.ratchet.divergentSlots}`,
  );
  assert.equal(conPh.matrix.positions.bithire.placeholder, 1);
});

test('drill placeholder: contradictorio (el mismo tema SI autora el slot) falla', () => {
  const text = PH_OK.replace('  primary: \'#999999\',', '  primary: \'#999999\',\n  secondary: \'#888888\',');
  const a = analyzeSource({ tenant: 'bithire', text });
  assert.equal(a.failures.length, 1);
  assert.match(a.failures[0], /contradictorio/);
});

test('drill placeholder: sin razon falla', () => {
  const text = PH_OK.replace(' * @governor none — gap aceptado: bithire no pinta secundario\n', '');
  const a = analyzeSource({ tenant: 'bithire', text });
  assert.ok(a.failures.some((f) => /sin @governor/.test(f)), JSON.stringify(a.failures));
});

/* ── 4b. @absent (F4A-close, disposicion declared-absent, por HOJA EXACTA) ── */

const RA_EXCLUSIVA = `
const PALETTE = {
  primary: '#111111',
  secondary: '#222222',
  ramps: {
    a: '#333333',
  },
};
`;
const RB_SOLO_PRIMARY = `
const PALETTE = {
  primary: '#999999',
};
`;
const RB_CON_ABSENT = `
const PALETTE = {
  /**
   * @absent PALETTE.secondary
   * @governor canal muerto: 0 lecturas medidas (fixture)
   */
  /**
   * @absent PALETTE.ramps.a
   * @governor sin emision en :root; el skin resuelve con su propio fallback (fixture)
   */
  primary: '#999999',
};
`;

test('drill @absent: PASS — exclusividad legitima con declared-absent en los otros 2 baja silentPairs a 0 para ese slot', () => {
  const sinAbsent = doc({ rottay: RA_EXCLUSIVA, bithire: RB_SOLO_PRIMARY, evnto: RB_SOLO_PRIMARY });
  const conAbsent = doc({ rottay: RA_EXCLUSIVA, bithire: RB_CON_ABSENT, evnto: RB_CON_ABSENT });
  assert.deepEqual(conAbsent.failures, [], JSON.stringify(conAbsent.failures));
  // sin @absent: bithire y evnto callan sobre 2 slots cada uno = 4 pares silenciosos.
  assert.equal(sinAbsent.ratchet.silentPairs, 4, 'silencio: 2 tenants x 2 slots sin ninguna disposicion');
  // con @absent: los 4 pares pasan a declared-absent, silentPairs baja a 0 para ese universo.
  assert.equal(conAbsent.ratchet.silentPairs, 0, 'las 4 declaraciones tapan el silencio, no lo esconden');
  assert.equal(conAbsent.ratchet.placeholderPairs, sinAbsent.ratchet.placeholderPairs,
    'declared-absent NO es placeholder: el contador de placeholders no se mueve');
  assert.deepEqual(conAbsent.matrix.declaredAbsent, { rottay: 0, bithire: 2, evnto: 2 });
});

test('drill @absent: retirar una declaracion vuelve a silencio (sube silentPairs)', () => {
  const conAbsent = doc({ rottay: RA_EXCLUSIVA, bithire: RB_CON_ABSENT, evnto: RB_CON_ABSENT });
  const unaMenos = RB_CON_ABSENT.replace(
    /\/\*\*\n\s*\* @absent PALETTE\.ramps\.a\n\s*\* @governor[^\n]*\n\s*\*\/\n/,
    '',
  );
  const retirada = doc({ rottay: RA_EXCLUSIVA, bithire: unaMenos, evnto: RB_CON_ABSENT });
  assert.deepEqual(retirada.failures, []);
  assert.equal(retirada.ratchet.silentPairs, conAbsent.ratchet.silentPairs + 1,
    'retirar la declaracion sin sustituirla es silencio de nuevo');
});

test('drill @absent: negativa anti-tapadera — sustituir @absent por @placeholder muerde placeholderPairs', () => {
  const conAbsent = doc({ rottay: RA_EXCLUSIVA, bithire: RB_CON_ABSENT, evnto: RB_CON_ABSENT });
  const tapado = RB_CON_ABSENT
    .replace('@absent PALETTE.secondary', '@placeholder PALETTE.secondary')
    .replace('@governor canal muerto: 0 lecturas medidas (fixture)', '@domicile unassigned\n   * @governor tapado (fixture)');
  const conPlaceholder = doc({ rottay: RA_EXCLUSIVA, bithire: tapado, evnto: RB_CON_ABSENT });
  assert.deepEqual(conPlaceholder.failures, [], JSON.stringify(conPlaceholder.failures));
  assert.equal(conPlaceholder.ratchet.silentPairs, conAbsent.ratchet.silentPairs,
    'el silencio no sube: el placeholder SI cubre posicion');
  assert.equal(conPlaceholder.ratchet.placeholderPairs, conAbsent.ratchet.placeholderPairs + 1,
    'pero placeholderPairs SI sube — es exactamente lo que el ratchet decrease-only tiene que morder');
});

test('drill @absent: sin @governor falla', () => {
  const text = RB_CON_ABSENT.replace(' * @governor canal muerto: 0 lecturas medidas (fixture)\n', '');
  const a = analyzeSource({ tenant: 'bithire', text });
  assert.ok(a.failures.some((f) => /@absent PALETTE\.secondary sin @governor/.test(f)), JSON.stringify(a.failures));
});

test('drill @absent: sobre hoja que el propio tema SI autora falla (contradiccion, igualdad exacta)', () => {
  const text = RB_CON_ABSENT.replace("primary: '#999999',", "primary: '#999999',\n  secondary: '#888888',");
  const a = analyzeSource({ tenant: 'bithire', text });
  assert.ok(a.failures.some((f) => /@absent PALETTE\.secondary contradictorio/.test(f)), JSON.stringify(a.failures));
});

test('drill @absent: fuera del universo (nadie autora esa hoja, en ningun tema) falla en buildDoc', () => {
  const text = `
const PALETTE = {
  /**
   * @absent PALETTE.noExisteEnNadie
   * @governor fixture: hoja inexistente
   */
  primary: '#999999',
};
`;
  const d = doc({ rottay: RA_EXCLUSIVA, bithire: text });
  assert.ok(
    d.failures.some((f) => /@absent PALETTE\.noExisteEnNadie no pertenece al universo de hojas autoradas/.test(f)),
    JSON.stringify(d.failures),
  );
});

test('drill @absent: por PREFIJO (rama, no hoja exacta) falla — el prefijo esta PROHIBIDO', () => {
  const text = `
const PALETTE = {
  /**
   * @absent PALETTE.ramps
   * @governor fixture: intento de afirmacion de familia
   */
  primary: '#999999',
};
`;
  // PALETTE.ramps NUNCA es una hoja: solo PALETTE.ramps.a lo es (autorada por rottay).
  // Un @absent sobre el PREFIJO tiene que fallar por igualdad exacta, nunca colar por prefijo.
  const d = doc({ rottay: RA_EXCLUSIVA, bithire: text });
  assert.ok(
    d.failures.some((f) => /@absent PALETTE\.ramps no pertenece al universo de hojas autoradas/.test(f)),
    JSON.stringify(d.failures),
  );
});

test('drill @absent: no se combina con @domicile/@placeholder en el mismo docblock', () => {
  const text = `
const PALETTE = {
  /**
   * @absent PALETTE.secondary
   * @domicile unassigned
   * @governor fixture: combinacion invalida
   */
  primary: '#999999',
};
`;
  const a = analyzeSource({ tenant: 'bithire', text });
  assert.ok(a.failures.some((f) => /@absent no se combina con @domicile\/@placeholder/.test(f)), JSON.stringify(a.failures));
});

test('drill @absent: ya cubierta por @placeholder del mismo tema falla (aunque aparezcan en orden invertido)', () => {
  const text = `
const PALETTE = {
  /**
   * @absent PALETTE.secondary
   * @governor fixture: intenta declarar lo que el placeholder ya cubre
   */
  /**
   * @placeholder PALETTE.secondary
   * @domicile unassigned
   * @governor fixture: placeholder real
   */
  primary: '#999999',
};
`;
  const a = analyzeSource({ tenant: 'bithire', text });
  assert.ok(a.failures.some((f) => /@absent PALETTE\.secondary ya cubierta por @placeholder/.test(f)), JSON.stringify(a.failures));
});

test('drill @absent: duplicado en el mismo tema falla', () => {
  const text = `
const PALETTE = {
  /**
   * @absent PALETTE.secondary
   * @governor fixture: primera declaracion
   */
  /**
   * @absent PALETTE.secondary
   * @governor fixture: segunda declaracion, duplicada
   */
  primary: '#999999',
};
`;
  const a = analyzeSource({ tenant: 'bithire', text });
  assert.ok(a.failures.some((f) => /@absent PALETTE\.secondary duplicado en este tema/.test(f)), JSON.stringify(a.failures));
});

test('drill @absent: no interfiere con orphanPlaceholders (sigue en 0)', () => {
  const conAbsent = doc({ rottay: RA_EXCLUSIVA, bithire: RB_CON_ABSENT, evnto: RB_CON_ABSENT });
  assert.deepEqual(conAbsent.matrix.orphanPlaceholders, []);
});

/**
 * P2-1 (F4A-close, hallazgo Fable postaudit real-keypath-parity): `nextIsText`
 * en `finishBlock` reconocia solo `@(domicile|governor|placeholder)` como
 * continuacion valida de linea. Un docblock con `@governor` ANTES que
 * `@absent` (orden invertido a la forma canonica) hacia que la linea
 * `@absent ...` pareciera texto derramado del governor -> `malformed:
 * governor multilinea`. Fail-closed (rojo de mas), pero por la razon
 * equivocada. Fix: agregar `absent` al patron negativo.
 */
test('drill P2-1: orden invertido @governor -> @absent NO es governor multilinea', () => {
  const ordenInvertido = `
const PALETTE = {
  /**
   * @governor fixture: orden invertido, governor antes que absent
   * @absent PALETTE.secondary
   */
  primary: '#999999',
};
`;
  const a = analyzeSource({ tenant: 'bithire', text: ordenInvertido });
  assert.deepEqual(a.failures, [], `orden invertido tiene que pasar limpio: ${JSON.stringify(a.failures)}`);
  assert.equal(a.absences.length, 1);
  assert.equal(a.absences[0].slot, 'PALETTE.secondary');
  assert.equal(a.absences[0].governor, 'fixture: orden invertido, governor antes que absent');
});

/* ── 5. scope ambiguo ────────────────────────────────────────────────────── */

test('drill scope: dos docblocks aplicables a la misma cercania fallan', () => {
  const text = `
/**
 * @domicile seed
 * @governor dial: uno
 */
const PALETTE = {
  primary: '#111111',
};

/**
 * @domicile derived
 * @governor razon: dos
 */
const PALETTE2 = {
  primary: '#222222',
};
`;
  // Dos scopes DISTINTOS no son ambiguos: cada hoja tiene un solo dueno.
  const ok = analyzeSource({ tenant: 'rottay', text });
  assert.deepEqual(ok.failures, []);

  // Ambiguo de verdad: dos docblocks con @domicile sobre el MISMO const.
  const ambiguo = `
/**
 * @domicile seed
 * @governor dial: uno
 */
/**
 * @domicile derived
 * @governor razon: dos
 */
const PALETTE = {
  primary: '#111111',
};
`;
  const a = analyzeSource({ tenant: 'rottay', text: ambiguo });
  assert.ok(a.failures.some((f) => /alcance ambiguo/.test(f)), JSON.stringify(a.failures));
});

/* ── 6. ratchet ──────────────────────────────────────────────────────────── */

test('drill ratchet: sube -> FAIL; baja -> FAIL con instruccion; igual -> PASS (silentPairs + placeholderPairs)', () => {
  const d = doc({ rottay: SIN_TAGS, bithire: SIN_TAGS, evnto: SIN_TAGS });
  const s = d.ratchet.silentPairs;
  const p = d.ratchet.placeholderPairs;
  const u = d.ratchet.untaggedAuthoredLeaves;

  assert.deepEqual(evaluate(d, { silentPairs: s, placeholderPairs: p, untaggedAuthoredLeaves: u }), [], 'igual = PASS');

  const subio = evaluate(d, { silentPairs: s - 1, placeholderPairs: p, untaggedAuthoredLeaves: u });
  assert.ok(subio.some((f) => /silentPairs GREW from/.test(f)), JSON.stringify(subio));

  const bajo = evaluate(d, { silentPairs: s + 1, placeholderPairs: p, untaggedAuthoredLeaves: u });
  assert.ok(bajo.some((f) => /silentPairs SHRANK from/.test(f)), JSON.stringify(bajo));
  assert.ok(bajo.some((f) => /lower `silentPairs` in manifest\/variant-parity\/variant-parity\.baseline\.json/.test(f)));

  const subioPh = evaluate(d, { silentPairs: s, placeholderPairs: p - 1, untaggedAuthoredLeaves: u });
  assert.ok(subioPh.some((f) => /placeholderPairs GREW from/.test(f)), JSON.stringify(subioPh));
});

test('drill ratchet: divergentSlots ya NO se pinea ni se evalua (informativo, F4A-close)', () => {
  const d = doc({ rottay: SIN_TAGS, bithire: SIN_TAGS, evnto: SIN_TAGS });
  // Un baseline que sólo trae divergentSlots (la ley vieja) tiene que fallar
  // por FALTA de los pines nuevos, nunca por divergentSlots en sí: ese campo
  // ya no es parte del vocabulario de `evaluate`.
  const f = evaluate(d, { divergentSlots: 0, untaggedAuthoredLeaves: d.ratchet.untaggedAuthoredLeaves });
  assert.ok(f.some((x) => /no pinea un silentPairs numerico/.test(x)), JSON.stringify(f));
  assert.ok(!f.some((x) => /divergentSlots/.test(x)), `divergentSlots no debe aparecer en los findings: ${JSON.stringify(f)}`);
});

test('drill ratchet: un baseline sin cifra numerica falla', () => {
  const d = doc({ rottay: SIN_TAGS });
  const f = evaluate(d, { silentPairs: 'muchos', placeholderPairs: 0, untaggedAuthoredLeaves: 1 });
  assert.ok(f.some((x) => /no pinea un silentPairs numerico/.test(x)), JSON.stringify(f));
});

/* ── 7. frescura ─────────────────────────────────────────────────────────── */

test('drill frescura: un doc serializado alterado deja de coincidir byte a byte', () => {
  const d = doc({ rottay: SIN_TAGS, bithire: SIN_TAGS });
  const bueno = serialize(d);
  const alterado = bueno.replace('"universe"', '"universo"');
  assert.notEqual(bueno, alterado, 'la mutacion tiene que cambiar los bytes');
  assert.equal(bueno, serialize(doc({ rottay: SIN_TAGS, bithire: SIN_TAGS })));
});

/* ── 8. anti-vacio ───────────────────────────────────────────────────────── */

test('drill anti-vacio: universo vacio y fuente sin hojas fallan distinguido', () => {
  const vacio = doc({ rottay: '', bithire: '' });
  const f = emptinessFailures(vacio);
  assert.ok(f.some((x) => /el universo de slots esta vacio/.test(x)), JSON.stringify(f));
  assert.ok(f.some((x) => /rottay no aporto ni una hoja/.test(x)), JSON.stringify(f));
  assert.ok(evaluate(vacio, { silentPairs: 0, placeholderPairs: 0, untaggedAuthoredLeaves: 0 }).length > 0,
    'un corpus vacio NUNCA puede salir verde en silencio');
});

/* ── 9. determinismo ─────────────────────────────────────────────────────── */

test('determinismo: dos corridas sobre el mismo fixture dan bytes identicos', () => {
  const f = { rottay: CON_TAGS, bithire: PH_OK, evnto: SIN_TAGS };
  assert.equal(serialize(doc(f)), serialize(doc(f)));
});

/* ── el lexer, por partes ────────────────────────────────────────────────── */

test('parseDocblocks solo lee /** */ — un // nunca es un tag', () => {
  const text = '// @domicile seed\n// @governor dial: no\nconst PALETTE = {\n  a: 1,\n};\n';
  assert.deepEqual(parseDocblocks(text), []);
  assert.deepEqual(analyzeSource({ tenant: 'rottay', text }).tags, []);
});

test('pathIndex normaliza el const de esqueleto a THEME, como authoredLeafPaths', () => {
  const idx = pathIndex('const rottayBrandTheme = {\n  id: \'x\',\n};\n');
  assert.equal(idx[1].opens, 'THEME');
  assert.equal(idx[2].opens, 'THEME.id');
});

/* ── integracion: el corpus REAL de HEAD ─────────────────────────────────── */

test('integracion: las anclas de F4A-0 reproducen exactas sobre las 3 fuentes', () => {
  const real = build();
  // F4A-5 (K2): el par border dejo de restatearse en los overlays de los 3
  // temas, asi que la fuente perdio 3 hojas y el universo un slot. La pintura
  // no se movio (36/36 pares resueltos identicos); la cuenta lexica si.
  // F4A-6 (K3): rottay pierde 35 restituciones de overlay al derivar los canales
  // de tier.page a la raiz nueva; los tres ganan la hoja `textPageColor`.
  // K1 (descongelar --ds-color-primary): mismo mecanismo, tercera vez. rottay
  // pierde 30 restituciones de overlay y evnto 2 -- exactamente los 30/0/2
  // canales re-cableados a `var(--ds-color-primary)`, que al valer lo mismo en
  // ambos scopes dejan de restatearse en el bloque claro. bithire no se movio
  // porque K1 no lo toco. 1786/1504/397 -> 1756/1504/395, union 2586 -> 2559.
  assert.deepEqual(real.matrix.leaves, { rottay: 1756, bithire: 1504, evnto: 395 });
  assert.equal(real.matrix.union, 2559);
  // La interseccion AUTORADA es el ancla estatica (345); la DEL DOCUMENTO se
  // mueve con los placeholders (787 tras F4A-4) y el conteo del ratchet vive
  // pineado en el baseline, no aca: el pin estatico de un contador que baja
  // por diseno convierte cada lote bueno en rojo.
  assert.equal(real.matrix.intersection, 342);
  // F4A-7: 890 -> 1040. La interseccion AUTORADA (342) NO se mueve porque el
  // lote no agrega ni una hoja; la POSICIONAL si, porque los 90 placeholders de
  // hoja de OVERLAY.palette/OVERLAY.surfaces dan posicion sobre 150 slots que
  // antes solo tenian uno o dos temas. Es el espejo exacto de `divergentSlots`,
  // que baja 1669 -> 1519 en la misma corrida.
  // F4A-8: 1040 -> 1145, misma ley. Los 59 placeholders de hoja de SURFACES dan
  // posicion sobre 105 slots mas, y `divergentSlots` baja 1519 -> 1414 en la
  // misma corrida: otra vez el espejo exacto.
  // F4A-9: 1145 -> 1601. CHROME.controls es la familia con mas superficie de
  // ausencia parcial del frente (402/295/93 hojas sobre una union de 514), y sus
  // 295 placeholders de hoja dan posicion sobre 456 slots mas. `divergentSlots`
  // baja 1414 -> 958 en la misma corrida: el espejo, por tercera vez.
  // F4A-10: 1601 -> 2288. OVERLAY.chrome es la familia mas grande y la mas
  // dispar entre temas (507/293/31 hojas sobre una union de 710: evnto autora 31
  // y necesita 188 placeholders). Sus 436 placeholders dan posicion sobre 687
  // slots mas y `divergentSlots` baja 958 -> 271. Cuarta vez el mismo espejo.
  // F4A-11: 2288 -> 2387. Las 14 familias de navegacion/estructura suman 171
  // placeholders de hoja, que dan posicion sobre 99 slots mas; `divergentSlots`
  // baja 271 -> 172. Quinta vez, y el margen se achica porque quedan pocos slots
  // divergentes: el frente esta cerca de agotar esta superficie.
  // F4A-12: 2387 -> 2520. El barrido de las 36 familias chicas de CHROME suma
  // 209 placeholders de hoja sobre 133 slots mas, y `divergentSlots` baja
  // 172 -> 39. Sexta vez el mismo espejo, y la superficie casi agotada: quedan
  // 39 slots divergentes para F4A-13..15.
  // F4A-13: 2520 -> 2526. El cierre del frente (capacidades, vocabulario de
  // forma, TYPOGRAPHY y el esqueleto THEME) es casi todo TAG y casi nada
  // placeholder: 141 tags contra 20 placeholders, que dan posicion sobre 6
  // slots. `divergentSlots` baja 39 -> 33 y ahi se queda: lo que resta son
  // slots que ningun tema autora en ninguno de los tres, no ausencias
  // parciales. El 0 real se certifica sobre keypaths evaluados en F4A-close,
  // no con este contador.
  assert.equal(real.matrix.positionIntersection, 2526);
  assert.deepEqual(real.matrix.exclusive, { rottay: 1007, bithire: 795, evnto: 3 });
});

test('integracion: la lista de metadato son 36 y el denominador publicado es 3690', () => {
  assert.equal(METADATA_EXCLUSION.length, 36);
  assert.equal(PAINT_DENOMINATOR.value, 3690);
  assert.match(PAINT_DENOMINATOR.derivation, /3726/);
  for (const t of TENANTS) assert.ok(METADATA_EXCLUSION.some((m) => m.tenant === t), `${t} sin metadato enumerado`);
});

test('integracion: la guarda anti-rename del metadato tiene dientes', () => {
  const sources = Object.fromEntries(TENANTS.map((t) => [t, readFileSync(path.join(PACKAGE_ROOT, sourcePath(t)), 'utf8')]));
  const perTenant = Object.fromEntries(TENANTS.map((t) => [t, analyzeSource({ tenant: t, text: sources[t] })]));
  assert.deepEqual(metadataGuard(perTenant, sources), [], 'sobre HEAD la lista tiene que ser verdad');

  // Planto el rename: le saco a rottay la hoja THEME.name.
  const mutado = { ...sources, rottay: sources.rottay.replace(/\n(\s*)name:/, '\n$1renombrada:') };
  const perMutado = { ...perTenant, rottay: analyzeSource({ tenant: 'rottay', text: mutado.rottay }) };
  const f = metadataGuard(perMutado, mutado);
  assert.ok(f.some((x) => /THEME\.name ya no existe/.test(x)), `la guarda no mordio: ${JSON.stringify(f)}`);

  // Y el caso `via`: si evnto inlinea su motion, la referencia al preset se cae.
  // .replace con string cambia solo la PRIMERA aparicion y evnto la nombra dos
  // veces (import + uso): hace falta el global o la guarda no ve nada.
  const sinPreset = { ...sources, evnto: sources.evnto.replace(/EVNTO_CANONICAL_MOTION/g, 'MOTION_INLINE') };
  const g = metadataGuard({ ...perTenant, evnto: analyzeSource({ tenant: 'evnto', text: sinPreset.evnto }) }, sinPreset);
  assert.ok(g.some((x) => /via EVNTO_CANONICAL_MOTION/.test(x)), `la guarda del preset no mordio: ${JSON.stringify(g)}`);
});

test('integracion: el baseline autorado pinea los tres contadores de la corrida real', () => {
  const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
  const real = build();
  assert.equal(baseline.silentPairs, real.ratchet.silentPairs);
  assert.equal(baseline.placeholderPairs, real.ratchet.placeholderPairs);
  assert.equal(baseline.untaggedAuthoredLeaves, real.ratchet.untaggedAuthoredLeaves);
  assert.match(baseline.law, /decrease-only/);
  assert.deepEqual(evaluate(real, baseline), [], 'HEAD contra su baseline tiene que dar PASS');
});

test('integracion: silentPairs 0 y placeholderPairs congelado en 3969 sobre el corpus real', () => {
  const real = build();
  assert.equal(real.ratchet.silentPairs, 0, 'F4A-close: las 53 disposiciones @absent tienen que cerrar el silencio a 0');
  assert.equal(real.ratchet.placeholderPairs, 3969, 'placeholderPairs no se mueve: ningun @absent tapa un placeholder');
  assert.equal(real.ratchet.declaredAbsentPairs, 53, 'exactamente los 53 pares adjudicados por Fable B-6');
  assert.deepEqual(real.matrix.declaredAbsent, { rottay: 19, bithire: 1, evnto: 33 });
});

test('integracion: los tags del corpus real son del vocabulario cerrado y no hay failures', () => {
  const real = build();
  // F4A-3b autora los primeros 37 (32 seed + 5 pro-expert). La expectativa
  // pineada en cero de F4A-2 queda retirada por diseño (AGED_EXPECTATION): lo
  // que se exige aca es el vocabulario cerrado y la ausencia de failures; el
  // conteo lo gobierna el ratchet, no este test.
  assert.ok(real.tagRegistry.count > 0, 'desde F4A-3b las fuentes llevan tags');
  for (const entry of real.tagRegistry.entries) {
    // `absent` (F4A-close) es su propia disposicion, PARALELA a @domicile, no
    // una quinta entrada de su vocabulario: no lleva domicile ni governorClass.
    if (entry.kind === 'absent') {
      assert.ok(typeof entry.governor === 'string' && entry.governor.length > 0, `governor vacio en @absent ${entry.slot}`);
      continue;
    }
    assert.ok(DOMICILES.includes(entry.domicile), `domicile fuera del vocabulario cerrado: ${entry.domicile}`);
    assert.ok(typeof entry.governor === 'string' && entry.governor.length > 0, `governor vacio en ${entry.slot ?? entry.scope}`);
  }
  assert.deepEqual(real.failures, []);
});

/* ═══════════════════════════════════════════════════════════════════════════
 * F4A-2b — el indice de scope, con la forma FEA del corpus
 *
 * Los 22 drills de arriba pasaban con el indice roto: sus fixtures cierran
 * todas las llaves en linea propia, que es la forma linda que uno escribe a
 * mano. El corpus real no lo hace, y ahi el indice se rompia. Estos fixtures
 * tienen la forma fea a proposito.
 * ═══════════════════════════════════════════════════════════════════════════ */

/** La forma exacta de `rottay/index.ts:1681`: contenido y cierre en la misma
 *  linea. Con el indice viejo la pila no bajaba nunca y `alert` terminaba
 *  colgando de `buttonPrimary`. */
const CIERRE_INLINE = `
const CHROME = {
  controls: {
    buttonPrimary: {
      bg: '#FFFFFF',
      shadowActive: "var(--ds-shadow-x)", bgHover: '#E0E0E0' },
  },
  alert: {
    bg: '#111111',
  },
};
`;

test('drill F4A-2b: un cierre en linea CON CONTENIDO devuelve la pila a su nivel', () => {
  const idx = pathIndex(CIERRE_INLINE);
  const opens = idx.map((e, line) => (e?.opens ? `${line}:${e.opens}` : null)).filter(Boolean);
  assert.ok(opens.includes('8:CHROME.alert'), `alert tiene que colgar de CHROME, no de buttonPrimary. Abiertas: ${JSON.stringify(opens)}`);
  assert.ok(
    !opens.some((o) => /alert/.test(o) && /buttonPrimary/.test(o)),
    'con el indice viejo esto daba CHROME.controls.buttonPrimary.alert',
  );
  assert.ok(opens.includes('6:CHROME.controls.buttonPrimary.shadowActive'),
    'y la hoja de la linea del cierre cuelga de buttonPrimary, no del nivel ya cerrado');
});

test('drill F4A-2b: scopeOfBlock atribuye cada docblock a su ruta real', () => {
  const text = `
const CHROME = {
  controls: {
    buttonPrimary: {
      bg: '#FFFFFF', shadowActive: 'x' },
  },
  /**
   * @domicile seed
   * @governor dial: navigation.sidebar-tone
   */
  sidebar: {
    bg: '#0D0D10',
  },
};
`;
  const a = analyzeSource({ tenant: 'rottay', text });
  assert.deepEqual(a.failures, []);
  assert.equal(a.tags.length, 1);
  assert.equal(a.tags[0].scope, 'CHROME.sidebar',
    `el docblock cubre CHROME.sidebar; con el indice viejo caia en una ruta acumulada. Dio: ${a.tags[0].scope}`);
  // y la hoja de sidebar queda cubierta por ese tag
  assert.equal(a.coveredCount, 1);
});

test('drill F4A-2b: una llave dentro de un string no mueve el nivel', () => {
  const text = `
const CHROME = {
  card: {
    content: 'no cierra }{ aca',
    bg: '#111111',
  },
  alert: {
    bg: '#222222',
  },
};
`;
  const idx = pathIndex(text);
  const opens = idx.map((e, line) => (e?.opens ? `${line}:${e.opens}` : null)).filter(Boolean);
  assert.ok(opens.includes('7:CHROME.alert'), `las llaves del string no cuentan. Abiertas: ${JSON.stringify(opens)}`);
  assert.ok(opens.includes('4:CHROME.card.content'));
});

test('drill F4A-2b: un comentario de linea con dos puntos no es una clave', () => {
  // `blankComments` limpia los bloques, no los `//`. Sin el corte, esto daba
  // rutas como `PALETTE.// Semantic`.
  const text = `
const PALETTE = {
  // Semantic ramp: la rampa semantica va abajo
  primary: '#111111',
};
`;
  const idx = pathIndex(text);
  const opens = idx.map((e) => e?.opens).filter(Boolean);
  assert.deepEqual(opens, ['PALETTE', 'PALETTE.primary'],
    `un // no aporta clave. Dio: ${JSON.stringify(opens)}`);
});

test('integracion F4A-2b: cero rutas incoherentes sobre las 3 fuentes reales', () => {
  // El cross-check que delato el bug: TODA ruta que el indice abre tiene que
  // existir como hoja o como prefijo real de una hoja.
  for (const t of TENANTS) {
    const text = readFileSync(path.join(PACKAGE_ROOT, sourcePath(t)), 'utf8');
    const idx = pathIndex(text);
    const leaves = [...authoredLeafPathsReal(text, t)];
    const malas = [];
    for (let line = 1; line < idx.length; line += 1) {
      const o = idx[line]?.opens;
      if (!o) continue;
      if (!leaves.some((h) => h === o || h.startsWith(`${o}.`))) malas.push(`${t}:${line}: ${o}`);
    }
    assert.deepEqual(malas, [], `${t} abre rutas que no existen: ${malas.slice(0, 5).join(' | ')}`);
  }
});

test('integracion F4A-2b: las anclas de familia aparecen todas', () => {
  // Antes del arreglo rottay daba 22 anclas para 54 familias, y bithire 39
  // para 39 — esa asimetria fue el sintoma.
  const esperado = { rottay: 54, bithire: 39, evnto: 18 };
  const SECCIONES = new Set(['RECIPES', 'EXPRESSIVE', 'PALETTE', 'TYPOGRAPHY', 'SURFACES', 'MOTION', 'CHARTS', 'CAPABILITIES']);
  for (const t of TENANTS) {
    const text = readFileSync(path.join(PACKAGE_ROOT, sourcePath(t)), 'utf8');
    const idx = pathIndex(text);
    let n = 0;
    for (const line of text.split('\n')) {
      const m = line.match(/^const ([A-Z0-9_]+)(?::|\s*=)/);
      if (m && SECCIONES.has(m[1])) n += 1;
    }
    for (let line = 1; line < idx.length; line += 1) {
      const o = idx[line]?.opens;
      if (!o) continue;
      const seg = o.split('.');
      if (seg.length === 2 && (seg[0] === 'CHROME' || seg[0] === 'OVERLAY')) n += 1;
    }
    assert.equal(n, esperado[t], `${t}: anclas de familia`);
  }
});

/* ═══════════════════════════════════════════════════════════════════════════
 * F4A-4 — cobertura de placeholder POR PREFIJO
 *
 * Fixtures con la forma del corpus: cierres inline, familias anidadas. La
 * regla adjudicada es que `@placeholder P` cubre `P` y todo lo que cuelgue de
 * `P.`; antes cubria un unico slot exacto y por eso un placeholder de familia
 * creaba un slot virtual sin tapar las hojas ausentes.
 * ═══════════════════════════════════════════════════════════════════════════ */

/** rottay autora dos familias; bithire solo una. */
const A_AUTORA_DOS = `
const CHROME = {
  alert: {
    bg: '#111111',
    border: '#222222', color: '#333333' },
  badge: {
    bg: '#444444',
  },
};
`;
const B_AUTORA_UNA = `
const CHROME = {
  badge: {
    bg: '#999999',
  },
};
`;
const B_CON_PLACEHOLDER = `
const CHROME = {
  /**
   * @placeholder CHROME.alert
   * @domicile unassigned
   * @governor none — gap aceptado: bithire no pinta alert
   */
  badge: {
    bg: '#999999',
  },
};
`;

test('drill F4A-4 (a): un placeholder de sub-arbol cubre sus hojas y baja la divergencia', () => {
  const sin = doc({ rottay: A_AUTORA_DOS, bithire: B_AUTORA_UNA });
  const con = doc({ rottay: A_AUTORA_DOS, bithire: B_CON_PLACEHOLDER });
  assert.deepEqual(con.failures, []);
  // rottay autora 4 hojas, bithire 1. Las 3 de CHROME.alert son las divergentes.
  assert.equal(sin.ratchet.divergentSlots, 3, 'sin placeholder, las 3 hojas de alert divergen');
  assert.equal(con.ratchet.divergentSlots, 0, 'el placeholder de la familia tapa las 3');
  assert.equal(con.matrix.positions.bithire.placeholder, 3,
    'y la posicion `placeholder` cuenta SLOTS cubiertos, no docblocks');
});

test('drill F4A-4 (b): placeholder sobre hojas que el tema SI autora falla', () => {
  const text = B_CON_PLACEHOLDER.replace(
    "  badge: {\n    bg: '#999999',\n  },",
    "  badge: {\n    bg: '#999999',\n  },\n  alert: {\n    bg: '#888888',\n  },",
  );
  const a = analyzeSource({ tenant: 'bithire', text });
  assert.equal(a.failures.length, 1);
  assert.match(a.failures[0], /contradictorio/);
  assert.match(a.failures[0], /1 hoja\(s\) bajo esa ruta/, 'la falla dice CUANTAS y cual');
  assert.match(a.failures[0], /CHROME\.alert\.bg/);
});

test('drill F4A-4 (c): el placeholder de hoja EXACTA sigue funcionando', () => {
  const b = `
const CHROME = {
  badge: {
    /**
     * @placeholder CHROME.alert.border
     * @domicile unassigned
     * @governor none — gap aceptado: bithire no pinta ese borde
     */
    bg: '#999999',
  },
};
`;
  const d = doc({ rottay: A_AUTORA_DOS, bithire: b });
  assert.deepEqual(d.failures, []);
  assert.equal(d.matrix.positions.bithire.placeholder, 1, 'cubre exactamente una hoja');
  assert.equal(d.ratchet.divergentSlots, 2, 'quedan las otras dos de alert');
});

test('drill F4A-4 (d): un placeholder huerfano crea slot virtual y se REPORTA', () => {
  const b = B_CON_PLACEHOLDER.replace('CHROME.alert', 'CHROME.noExisteEnNadie');
  const d = doc({ rottay: A_AUTORA_DOS, bithire: b });
  assert.deepEqual(d.failures, []);
  assert.deepEqual(d.matrix.orphanPlaceholders, ['CHROME.noExisteEnNadie'],
    'nadie cuelga nada de esa ruta: es un slot virtual y tiene que verse');
  assert.ok(d.matrix.universe > 0);
});

test('drill F4A-4 (e): dos temas con placeholder y el tercero autorando = cobertura completa', () => {
  const c = B_CON_PLACEHOLDER.replace("bg: '#999999'", "bg: '#777777'");
  const d = doc({ rottay: A_AUTORA_DOS, bithire: B_CON_PLACEHOLDER, evnto: c });
  assert.deepEqual(d.failures, []);
  assert.equal(d.ratchet.divergentSlots, 0, 'las 3 hojas de alert quedan con posicion en los 3');
  assert.equal(d.matrix.positionIntersection, d.matrix.universe, 'universo enteramente cubierto');
});

test('drill F4A-4: la cobertura por prefijo NO inventa slots que nadie autora', () => {
  // Un placeholder de familia no debe agregar al universo las hojas que el
  // otro tema tampoco tiene: solo cubre lo que YA existe en el universo.
  const d = doc({ rottay: A_AUTORA_DOS, bithire: B_CON_PLACEHOLDER });
  assert.equal(d.matrix.universe, 4, 'las 4 hojas autoradas por rottay, ni una mas');
  assert.deepEqual(d.matrix.orphanPlaceholders, []);
});
