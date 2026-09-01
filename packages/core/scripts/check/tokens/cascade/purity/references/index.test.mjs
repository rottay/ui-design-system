import assert from 'node:assert/strict';
import test from 'node:test';

import { CLASSES, buildPurity, classify, modeOfSlot, normalise, replacementDelta, scopesOf } from './index.mjs';

const CATALOG = { roots: [
  { rootId: 'tier.base.fg', channel: '--ds-ink' },
  { rootId: 'tier.control.bg', channel: '--ds-control-bg' },
  { rootId: 'tier.raised.bg', channel: '--ds-nunca-emitido' },
] };

/** Compilador de juguete: base con dos canales, superposición que re-declara uno. */
const arm = {
  themes: { demo: {} },
  compile: () => ({
    cssVariables: { '--ds-ink': '#14283B', '--ds-control-bg': '#FFFFFF' },
    modeBlocks: [{ mode: 'dark', variables: { '--ds-ink': '#9AACBF' } }],
  }),
};

const row = (over) => ({ slotId: `demo:${over.slotPath}`, vertical: 'demo', rule: 'R2', ...over });

const INVENTORY = { rows: [
  row({ slotPath: 'CHROME.card.color', rootId: 'tier.base.fg', authoredValue: '#14283B' }),
  row({ slotPath: 'CHROME.card.headerColor', rootId: 'tier.base.fg', authoredValue: '#53697E' }),
  row({ slotPath: 'SURFACES.surfaceRoles.card.background', rootId: 'tier.raised.bg', authoredValue: '#FFFFFF' }),
  // La superposición hereda la base: --ds-control-bg NO se re-declara en dark.
  row({ slotPath: 'OVERLAY.chrome.card.bg', rootId: 'tier.control.bg', authoredValue: '#FFFFFF' }),
  // Y el canal que dark SÍ re-declara se compara contra el valor del modo.
  row({ slotPath: 'OVERLAY.chrome.card.color', rootId: 'tier.base.fg', authoredValue: '#9AACBF' }),
  row({ slotPath: 'CHROME.card.sinRaiz', rootId: null, authoredValue: '#000000' }),
] };

const build = () => buildPurity({ arm, inventory: INVENTORY, catalog: CATALOG });
const forSlot = (doc, slotId) => doc.rows.find((item) => item.slotId === slotId);

test('COLAPSO PURO — la cabeza ya emite ese valor: pasa', async () => {
  const doc = await build();
  const item = forSlot(doc, 'demo:CHROME.card.color');
  assert.equal(item.class, 'pure');
  assert.equal(item.headChannel, '--ds-ink');
  assert.equal(item.headEmitted, true);
});

test('CAMBIO DE VALOR — la cabeza emite otro valor: falla como colapsable', async () => {
  const doc = await build();
  const item = forSlot(doc, 'demo:CHROME.card.headerColor');
  assert.equal(item.class, 'value-shift');
  assert.notEqual(item.class, 'pure', 'aplastar la hoja contra la raiz no es un colapso');
});

test('STOP — cabeza no emitida: ni pure ni value-shift, es su propia clase', async () => {
  const doc = await build();
  const item = forSlot(doc, 'demo:SURFACES.surfaceRoles.card.background');
  assert.equal(item.class, 'head-not-emitted');
  assert.equal(item.headEmitted, false);
  // Y el valor autorado COINCIDE con nada porque no hay contra que comparar:
  // la clase no puede degradar a `pure` por casualidad.
  assert.notEqual(item.class, 'pure');
});

test('la superposicion hereda la base: un canal no re-declarado no es head-not-emitted', async () => {
  const doc = await build();
  const item = forSlot(doc, 'demo:OVERLAY.chrome.card.bg');
  assert.equal(item.scope, 'dark');
  assert.equal(item.class, 'pure', 'comparar contra la superposicion pelada daria un STOP falso');
});

test('un canal re-declarado en el modo se compara contra el valor DEL MODO', async () => {
  const doc = await build();
  assert.equal(forSlot(doc, 'demo:OVERLAY.chrome.card.color').class, 'pure');
  // el mismo valor en base seria value-shift
  const inBase = classify({
    row: { authoredValue: '#9AACBF', rootId: 'tier.base.fg' },
    headChannel: '--ds-ink',
    scope: { '--ds-ink': '#14283B' },
  });
  assert.equal(inBase.klass, 'value-shift');
});

test('una fila sin raiz no entra al censo', async () => {
  const doc = await build();
  assert.equal(forSlot(doc, 'demo:CHROME.card.sinRaiz'), undefined);
  assert.equal(doc.stats.rows, 5);
});

/* VUELCO (2026-08-28). Este drill afirmaba lo contrario -- "CSS no distingue el
 * caso de un hex: un STOP por mayusculas seria ruido" -- y por eso la deuda
 * caso-hex vivio protegida por un test EN VERDE desde la cohorte 2. La premisa
 * era cierta y la conclusion no: el navegador no distingue el caso, pero la ley
 * de aceptacion del colapso (cero-delta resuelto) compara STRING-EXACTO, asi
 * que un flip de caso mueve bytes y el `--against` lo frena. La clase cobro dos
 * veces en produccion antes de que alguien releyera este test. */
test('la clasificacion SI distingue mayusculas de minusculas en el valor', () => {
  const verdict = classify({
    row: { authoredValue: '#ffffff', rootId: 'tier.control.bg' },
    headChannel: '--ds-control-bg', scope: { '--ds-control-bg': '#FFFFFF' },
  });
  assert.equal(verdict.klass, 'value-shift', 'declararla pure la manda a un colapso que el --against frena');
  assert.equal(verdict.headValue, '#FFFFFF', 'el veredicto conserva el valor de la cabeza tal cual se emitio');
});

test('helpers puros', () => {
  assert.equal(modeOfSlot('OVERLAY.chrome.x'), 'overlay');
  assert.equal(modeOfSlot('CHROME.x'), 'base');
  assert.equal(normalise('  #FFF  '), '#FFF', 'trim si, toLowerCase no');
  assert.equal(replacementDelta('#14283B', '--ds-ink'), '"var(--ds-ink)"'.length - '"#14283B"'.length);
  const scopes = scopesOf(arm.compile());
  assert.deepEqual(Object.keys(scopes).sort(), ['base', 'dark']);
  assert.equal(scopes.dark['--ds-control-bg'], '#FFFFFF', 'el modo lleva la base por debajo');
  assert.equal(scopes.dark['--ds-ink'], '#9AACBF');
});

test('el vocabulario de clases es cerrado', () => {
  assert.deepEqual(CLASSES, ['pure', 'value-shift', 'head-not-emitted', 'no-root']);
});

test('sobre el arbol real: las clases PARTICIONAN la poblacion y ninguna se fabrica', async () => {
  const { readFileSync } = await import('node:fs');
  const doc = JSON.parse(readFileSync(new URL('../../../../../../artifacts/generated/manifest/cascade/purity/index.json', import.meta.url), 'utf8'));
  /* El pin NUMERICO vive donde viven los pines: en el artefacto, que `--check`
   * compara byte a byte. Congelar aqui una terna (162/458/230) hacia que el
   * drill se rompiera cada vez que el frente RE-ATRIBUYE legitimamente, y un
   * test que hay que re-teclear con cada mejora deja de ser un detector. Lo que
   * se afirma aca son las PROPIEDADES, que no pueden moverse nunca. */
  const fam = (rootId) => (rootId.startsWith('tier.') ? 'tier' : rootId.startsWith('state.delta.') ? 'state' : rootId.split('.')[0]);
  const cohort = doc.rows.filter((item) => item.rule === 'R2' && ['tier', 'state', 'ramp'].includes(fam(item.rootId)));
  assert.ok(cohort.length > 0);
  const byClass = cohort.reduce((acc, item) => { acc[item.class] = (acc[item.class] ?? 0) + 1; return acc; }, {});
  assert.equal(Object.values(byClass).reduce((a, b) => a + b, 0), cohort.length, 'las clases particionan: ni una fila fuera');
  for (const klass of Object.keys(byClass)) assert.ok(CLASSES.includes(klass));
  // Ninguna clase se fabrica: head-not-emitted <=> headEmitted false, y al reves.
  for (const item of doc.rows) {
    assert.equal(item.headEmitted, item.class !== 'head-not-emitted');
    if (item.class === 'pure') assert.ok(item.headChannel, 'una fila pura nombra la cabeza contra la que se comparo');
  }
  assert.equal(doc.stats.byClass.pure + doc.stats.byClass['value-shift'] + doc.stats.byClass['head-not-emitted'], doc.stats.rows);
});

/* ── string-exacto: el caso separa, el whitespace de bordes no ───────────── */

test('el trim SE QUEDA: los mismos bytes con whitespace de borde siguen siendo pure', () => {
  for (const authored of ['  #FFFFFF', '#FFFFFF  ', '\t#FFFFFF\n']) {
    const verdict = classify({
      row: { rootId: 'tier.control.bg', authoredValue: authored },
      headChannel: '--ds-control-bg',
      scope: { '--ds-control-bg': '#FFFFFF' },
    });
    assert.equal(verdict.klass, 'pure', `${JSON.stringify(authored)}: el whitespace de bordes no lo distingue ningun navegador`);
  }
  assert.equal(normalise('  #FFFFFF  '), '#FFFFFF', 'trim si, toLowerCase no');
  assert.notEqual(normalise('#FFFFFF'), normalise('#ffffff'), 'el caso separa');
});

test('caso y whitespace son ejes INDEPENDIENTES: trim no rescata un flip de caso', () => {
  const verdict = classify({
    row: { rootId: 'tier.control.bg', authoredValue: '  #ffffff  ' },
    headChannel: '--ds-control-bg',
    scope: { '--ds-control-bg': '#FFFFFF' },
  });
  assert.equal(verdict.klass, 'value-shift');
});

test('sobre el arbol real: NINGUNA fila pure difiere de su cabeza solo por el caso', async () => {
  const { readFileSync } = await import('node:fs');
  const { join } = await import('node:path');
  const { loadArm, CORE_ROOT } = await import('./index.mjs');
  /* Se afirma la PROPIEDAD, no la lista de las 43: una lista congelada se rompe
   * con cada re-atribucion legitima del frente y deja de ser un detector. El
   * censo POR NOMBRE vive en el asiento del lote; el invariante vive aca. */
  const doc = JSON.parse(readFileSync(new URL('../../../../../../artifacts/generated/manifest/cascade/purity/index.json', import.meta.url), 'utf8'));
  const inventory = JSON.parse(readFileSync(join(CORE_ROOT, 'artifacts/generated/manifest/cascade/slots/index.json'), 'utf8'));
  const authoredOf = new Map(inventory.rows.map((row) => [row.slotId, row.authoredValue]));
  const arm = await loadArm({ coreRoot: CORE_ROOT });
  const scopes = {};
  for (const [vertical, theme] of Object.entries(arm.themes)) {
    scopes[vertical] = scopesOf(arm.compile({ brandTheme: theme, tenantSlug: vertical }));
  }
  const overlayNameOf = (vertical) => Object.keys(scopes[vertical]).find((name) => name !== 'base') ?? 'base';

  /* Los dos colectores se llenan ANTES de asertar. La version anterior asertaba
   * dentro del bucle, asi que el primer desvio cortaba la corrida y el colector
   * de caso-hex era inalcanzable: el mensaje decia una fila cuando podian ser
   * cuarenta y tres. Un drill que enumera vale mas que uno que aborta. */
  const caseOnly = [];
  const otherMismatch = [];
  for (const row of doc.rows) {
    if (row.class !== 'pure') continue;
    const authored = String(authoredOf.get(row.slotId)).trim();
    const scope = scopes[row.vertical][modeOfSlot(row.slotPath ?? row.slotId.split(':')[1]) === 'overlay' ? overlayNameOf(row.vertical) : 'base'];
    const head = String(scope?.[row.headChannel]).trim();
    if (head === authored) continue;
    (head.toLowerCase() === authored.toLowerCase() ? caseOnly : otherMismatch).push(
      `${row.slotId} (autorado ${authored} / cabeza ${head})`,
    );
  }
  assert.deepEqual(caseOnly, [], 'una fila pure que difiere solo por el caso es la deuda que este lote cerro');
  assert.deepEqual(otherMismatch, [], 'una fila pure cuya cabeza no emite ese valor exacto no es pure');
});
