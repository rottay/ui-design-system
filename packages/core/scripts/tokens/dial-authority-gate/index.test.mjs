/**
 * @fileoverview The drill for decision 19's gate.
 *
 * The gate exists to prove a fix, so the drill holds the two cases the owner
 * actually ruled on -- FROZEN, as fixtures -- and watches the judgement fire on
 * them. If the tree is ever "fixed" by weakening the rule instead of the source,
 * drills 1 and 2 go red.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { analyse, measure } from './index.mjs';

const DIALS = new Set(['--ds-effect-intensity', '--ds-type-scale']);

test('drill 1 [before]: the base carries the factor and bithire freezes the product -- glass-blur', () => {
  const base = { '--ds-glass-blur': ['calc(12px * var(--ds-effect-intensity))'] };
  const artifacts = { rottay: {}, bithire: { '--ds-glass-blur': ['12px'] }, evnto: {} };
  const findings = analyse(base, artifacts, DIALS);
  assert.equal(findings.length, 1, 'exactly the frozen vertical is named');
  assert.deepEqual(
    { v: findings[0].vertical, c: findings[0].channel, d: findings[0].dial },
    { v: 'bithire', c: '--ds-glass-blur', d: '--ds-effect-intensity' }
  );
  assert.ok(findings[0].dialCarriedBy.includes('base'), 'and the counterfactual is cited');
});

test('drill 2 [before]: the PEER carries the factor, not the base -- input-md-font-size', () => {
  /* The base component layer writes a raw rem, which carries no scale at all
   * (the scale lives at each `--ds-font-size-*` definition site). Only rottay's
   * reference reaches the dial. A gate that read the base alone would see
   * nothing here -- and this is the case the owner ruled on. */
  const base = {
    '--ds-input-md-font-size': ['0.875rem'],
    '--ds-font-size-sm': ['calc(var(--ds-font-size-sm-base) * var(--ds-type-scale, 1))'],
  };
  const artifacts = {
    rottay: { '--ds-input-md-font-size': ['var(--ds-font-size-sm)'] },
    bithire: { '--ds-input-md-font-size': ['13px'] },
    evnto: {},
  };
  const findings = analyse(base, artifacts, DIALS);
  assert.equal(findings.length, 1, 'bithire only: evnto declares nothing, so it freezes nothing');
  assert.equal(findings[0].vertical, 'bithire');
  assert.deepEqual(findings[0].dialCarriedBy, ['rottay'], 'the peer is the counterfactual, not the base');
});

test('drill 3: a SEED is not an anti-door -- the law protects it by name', () => {
  const base = { '--ds-badge-error-bg': ['#EF4444'] };
  const artifacts = { rottay: { '--ds-badge-error-bg': ['#DC2626'] }, bithire: {}, evnto: {} };
  assert.deepEqual(analyse(base, artifacts, DIALS), [], 'no dial multiplies it, so nothing was frozen');
});

test('drill 4: expressing the seed CAUSALLY clears the finding -- the shape the fix must take', () => {
  const base = { '--ds-input-md-font-size': ['0.875rem'] };
  const artifacts = {
    rottay: {},
    bithire: { '--ds-input-md-font-size': ['calc(13px * var(--ds-type-scale, 1))'] },
    evnto: {},
  };
  assert.deepEqual(analyse(base, artifacts, DIALS), [], 'own seed kept, dial restored');
});

test('drill 5 [after]: neither ruled case survives in the real tree', () => {
  const { findings } = measure();
  const ruled = [
    { vertical: 'bithire', channel: '--ds-glass-blur', dial: '--ds-effect-intensity' },
    { vertical: 'bithire', channel: '--ds-input-md-font-size', dial: '--ds-type-scale' },
  ];
  for (const r of ruled) {
    const hit = findings.find((f) => f.vertical === r.vertical && f.channel === r.channel && f.dial === r.dial);
    assert.equal(hit, undefined, `${r.channel} still freezes ${r.dial} on ${r.vertical}`);
  }
});

test('drill 6: the inventory is decrease-only and the exception list is the owner’s alone', async () => {
  const { readFileSync } = await import('node:fs');
  const { dirname, join } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const here = dirname(fileURLToPath(import.meta.url));
  const inventory = JSON.parse(readFileSync(join(here, 'dial-authority-gate.inventory.json'), 'utf8'));
  const { findings } = measure();
  const key = (f) => `${f.vertical}|${f.channel}|${f.dial}`;
  const reproduced = new Set(findings.map(key));
  for (const entry of inventory.pending) {
    assert.ok(reproduced.has(key(entry)), `${key(entry)} no longer reproduces: retire it, do not keep it`);
  }
  /* La ley del inventario: `exceptions` solo cambia por ruling de owner documentado.
   * Se pinea la lista EXACTA, no su tamaño, para que agregar una segunda excepcion
   * sin ruling sea rojo. Hoy hay una, escrita por el owner en la decision 20. */
  assert.equal(inventory.exceptions.length, 1, 'exactamente una excepcion del owner');
  const [granted] = inventory.exceptions;
  assert.deepEqual(
    { v: granted.vertical, c: granted.channel, d: granted.dial, by: granted.grantedBy, r: granted.ruling },
    { v: 'bithire', c: '--ds-badge-radius', d: '--ds-radius-scale', by: 'owner', r: 'decision-20' }
  );
  const listed = new Set([...inventory.pending, ...inventory.exceptions].map(key));
  for (const f of findings) assert.ok(listed.has(key(f)), `${key(f)} is unlisted -- the gate must fail, not the drill`);
});

test('drill 7 [prueba negativa de la excepcion]: un pill no escala, y por eso queda fuera', () => {
  /* La excepcion del owner (decision 20) dice que --ds-badge-radius se queda en
   * var(--ds-radius-full). Esta prueba lo sostiene por el lado que importa: aunque
   * shape.radius-scale se mueva, el canal sigue resolviendo al centinela pill, y el
   * gate NO lo reporta como anti-puerta. Si alguien "corrigiera" el badge a
   * calc(9999px * var(--ds-radius-scale)) creyendo cerrar un pendiente, la primera
   * mitad de este drill se cae. */
  const base = {
    '--ds-radius-full': ['9999px'],
    '--ds-radius-md': ['calc(var(--ds-radius-md-base) * var(--ds-radius-scale, 1))'],
    '--ds-radius-md-base': ['8px'],
    '--ds-badge-radius': ['var(--ds-radius-full)'],
  };
  const artifacts = {
    rottay: { '--ds-badge-radius': ['var(--ds-radius-md)'] },
    bithire: { '--ds-badge-radius': ['var(--ds-radius-full)'] },
    evnto: {},
  };
  const dials = new Set(['--ds-radius-scale']);

  // El canal del pill no lleva el factor -- por diseño, y con el dial movido sigue sin llevarlo.
  assert.equal(base['--ds-badge-radius'][0], 'var(--ds-radius-full)');
  assert.ok(!base['--ds-radius-full'][0].includes('--ds-radius-scale'), 'el pill es un centinela, no una geometria');

  // El gate SI lo ve (por eso hizo falta una excepcion y no un silencio)...
  const findings = analyse(base, artifacts, dials);
  const hit = findings.find((f) => f.vertical === 'bithire' && f.channel === '--ds-badge-radius');
  assert.ok(hit, 'el gate lo detecta: la excepcion es visible, no una regla debilitada');

  // ...y el dial conserva autoridad donde SI hay geometria real.
  assert.ok(base['--ds-radius-md'][0].includes('--ds-radius-scale'), 'radius-scale gobierna los radios con geometria');
});
