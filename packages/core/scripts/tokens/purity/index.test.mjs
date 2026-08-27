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

test('la clasificacion no distingue mayusculas de minusculas en el valor', () => {
  const verdict = classify({
    row: { authoredValue: '#ffffff', rootId: 'tier.control.bg' },
    headChannel: '--ds-control-bg', scope: { '--ds-control-bg': '#FFFFFF' },
  });
  assert.equal(verdict.klass, 'pure', 'CSS no distingue el caso de un hex: un STOP por mayusculas seria ruido');
});

test('helpers puros', () => {
  assert.equal(modeOfSlot('OVERLAY.chrome.x'), 'overlay');
  assert.equal(modeOfSlot('CHROME.x'), 'base');
  assert.equal(normalise('  #FFF  '), '#fff');
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
  const doc = JSON.parse(readFileSync(new URL('../../../manifest/generated/purity.json', import.meta.url), 'utf8'));
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
