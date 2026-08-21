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
  assert.deepEqual(DOMICILES, ['seed', 'baseline', 'derived', 'pro-expert', 'unassigned']);
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
 * @domicile baseline
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
 * @domicile baseline
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

test('drill ratchet: sube -> FAIL; baja -> FAIL con instruccion; igual -> PASS', () => {
  const d = doc({ rottay: SIN_TAGS, bithire: SIN_TAGS, evnto: SIN_TAGS });
  const n = d.ratchet.divergentSlots;
  const u = d.ratchet.untaggedAuthoredLeaves;

  assert.deepEqual(evaluate(d, { divergentSlots: n, untaggedAuthoredLeaves: u }), [], 'igual = PASS');

  const subio = evaluate(d, { divergentSlots: n - 1, untaggedAuthoredLeaves: u });
  assert.ok(subio.some((f) => /divergentSlots GREW from/.test(f)), JSON.stringify(subio));

  const bajo = evaluate(d, { divergentSlots: n + 1, untaggedAuthoredLeaves: u });
  assert.ok(bajo.some((f) => /divergentSlots SHRANK from/.test(f)), JSON.stringify(bajo));
  assert.ok(bajo.some((f) => /lower `divergentSlots` in manifest\/variant-parity\/variant-parity\.baseline\.json/.test(f)));
});

test('drill ratchet: un baseline sin cifra numerica falla', () => {
  const d = doc({ rottay: SIN_TAGS });
  const f = evaluate(d, { divergentSlots: 'muchos', untaggedAuthoredLeaves: 1 });
  assert.ok(f.some((x) => /no pinea un divergentSlots numerico/.test(x)), JSON.stringify(f));
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
  assert.ok(evaluate(vacio, { divergentSlots: 0, untaggedAuthoredLeaves: 0 }).length > 0,
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
  assert.deepEqual(real.matrix.leaves, { rottay: 1820, bithire: 1503, evnto: 397 });
  assert.equal(real.matrix.union, 2613);
  assert.equal(real.matrix.intersection, 345);
  assert.equal(real.ratchet.divergentSlots, 2268);
  assert.deepEqual(real.matrix.exclusive, { rottay: 1061, bithire: 788, evnto: 2 });
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

test('integracion: el baseline autorado pinea los dos contadores de la corrida real', () => {
  const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
  const real = build();
  assert.equal(baseline.divergentSlots, real.ratchet.divergentSlots);
  assert.equal(baseline.untaggedAuthoredLeaves, real.ratchet.untaggedAuthoredLeaves);
  assert.match(baseline.law, /decrease-only/);
  assert.deepEqual(evaluate(real, baseline), [], 'HEAD contra su baseline tiene que dar PASS');
});

test('integracion: los tags del corpus real son del vocabulario cerrado y no hay failures', () => {
  const real = build();
  // F4A-3b autora los primeros 37 (32 seed + 5 pro-expert). La expectativa
  // pineada en cero de F4A-2 queda retirada por diseño (AGED_EXPECTATION): lo
  // que se exige aca es el vocabulario cerrado y la ausencia de failures; el
  // conteo lo gobierna el ratchet, no este test.
  assert.ok(real.tagRegistry.count > 0, 'desde F4A-3b las fuentes llevan tags');
  for (const entry of real.tagRegistry.entries) {
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
