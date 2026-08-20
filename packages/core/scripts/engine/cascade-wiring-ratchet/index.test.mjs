/**
 * Drills del cascade-wiring-ratchet. Dos plantan CSS real en el corpus (un
 * canal huerfano nuevo, y ese mismo canal recableado a raiz) y dos plantan la
 * ROTURA DEL CLASIFICADOR, que es lo que los invariantes de forma existen para
 * cazar: un contador puede estar verde y estar contando mal.
 */

import assert from 'node:assert/strict';
import { readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { packageRoot as findPackageRoot } from '../../lib/repo-root/index.mjs';
import {
  BASELINE_PATH,
  classifyCascadeWiring,
  collectFindings,
  shapeFailures,
  varCalls,
} from './index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);
/** Un archivo de skin nuevo entra al corpus por el propio walker: es `skin/`. */
const PLANTED = join(
  CORE_ROOT,
  'src/foundation/tokens/css/presentation/components/skin/__cascade-ratchet-drill.css',
);

function expectFinding(findings, fragment, message) {
  assert.ok(
    findings.some((finding) => finding.includes(fragment)),
    `${message}; got ${JSON.stringify(findings, null, 1)}`,
  );
}

function withPlantedCss(css, run) {
  writeFileSync(PLANTED, css);
  try {
    run();
  } finally {
    unlinkSync(PLANTED);
  }
}

test('the live tree matches its baseline', () => {
  assert.deepEqual(collectFindings(), []);
});

test('the pinned debt is the measured debt, not a guess', () => {
  const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
  const result = classifyCascadeWiring();
  assert.equal(result.debt.length, baseline.debt);
  assert.equal(result.denominator.length, baseline.denominator);
});

test('a NEW unwired channel grows the debt and fails', () => {
  withPlantedCss(
    '.ds-cascade-ratchet-drill { color: var(--ds-cascade-ratchet-drill-orphan); }\n',
    () => {
      expectFinding(
        collectFindings(),
        'debt GREW from',
        'un canal sin camino a raiz tiene que subir el contador y enrojecer',
      );
    },
  );
});

test('the same channel WIRED to a root does not grow the debt', () => {
  // El mismo nombre, ahora con fallback a raiz. Es el control que prueba que el
  // rojo de arriba lo causa la FALTA DE CAMINO y no la aparicion del nombre.
  withPlantedCss(
    '.ds-cascade-ratchet-drill { color: var(--ds-cascade-ratchet-drill-orphan, var(--ds-color-primary)); }\n',
    () => {
      const findings = collectFindings();
      assert.equal(
        findings.filter((finding) => finding.includes('debt GREW')).length,
        0,
        `cablear a raiz no puede subir el contador; got ${JSON.stringify(findings)}`,
      );
    },
  );
});

test('a functional fallback wrapped in color-mix still counts as wired (rule b)', () => {
  withPlantedCss(
    '.ds-cascade-ratchet-drill { color: var(--ds-cascade-ratchet-drill-mix, ' +
      'color-mix(in srgb, var(--ds-color-primary) 8%, transparent)); }\n',
    () => {
      const findings = collectFindings();
      assert.equal(
        findings.filter((finding) => finding.includes('debt GREW')).length,
        0,
        `un fallback que alcanza raiz dentro de color-mix() esta cableado; got ${JSON.stringify(findings)}`,
      );
    },
  );
});

test('rewiring an existing debt name to a root shrinks the debt and fails until the baseline follows', () => {
  const result = classifyCascadeWiring();
  const victim = result.debt[0];
  assert.ok(victim, 'el arbol tiene que tener deuda para que este drill signifique algo');
  // Un sitio de lectura con fallback a raiz basta: la ley es "algun camino".
  withPlantedCss(`.ds-cascade-ratchet-drill { color: var(${victim}, var(--ds-color-primary)); }\n`, () => {
    expectFinding(
      collectFindings(),
      'debt SHRANK from',
      'bajar la deuda tiene que exigir bajar el baseline a proposito',
    );
  });
});

/* ---------------- invariantes de forma: el clasificador roto ---------------- */

test('SHAPE: a root/ramp counted as debt fails (rule a broken)', () => {
  const { failures } = shapeFailures({
    denominator: ['--ds-color-primary'],
    debt: ['--ds-color-primary'],
    fallbackTargets: new Set(['--ds-color-primary']),
    reachesRoot: new Set(),
  });
  expectFinding(
    failures,
    'is a fallback destination (root/ramp) and must never be counted as debt',
    'contar una raiz como deuda hace subir el contador al recablear bien',
  );
});

test('SHAPE: a channel with a root-reaching fallback counted as debt fails (rule b broken)', () => {
  const { failures } = shapeFailures({
    denominator: ['--ds-card-bg'],
    debt: ['--ds-card-bg'],
    fallbackTargets: new Set(),
    reachesRoot: new Set(['--ds-card-bg']),
  });
  expectFinding(
    failures,
    'has a fallback that reaches a root and must never be counted as debt',
    'la pintura que ya obedece la ley no puede contarse como deudora',
  );
});

test('the fallback is read to the BALANCED paren, not to the first comma', () => {
  // Sin esto, `color-mix(in srgb, var(--ds-raiz) 8%, transparent)` se cortaria
  // en la primera coma y la raiz de adentro se perderia: la regla (b) moriria
  // en silencio y el contador subiria.
  const calls = [...varCalls('a { color: var(--ds-x, color-mix(in srgb, var(--ds-root) 8%, transparent)); }')];
  assert.equal(calls.length, 2);
  assert.equal(calls[0].name, '--ds-x');
  assert.ok(calls[0].fallback.includes('var(--ds-root)'), `fallback truncado: ${calls[0].fallback}`);
});
