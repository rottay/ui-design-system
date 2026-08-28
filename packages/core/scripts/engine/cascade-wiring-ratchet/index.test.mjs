/**
 * Drills del cascade-wiring-ratchet. Dos plantan CSS real en el corpus (un
 * canal huerfano nuevo, y ese mismo canal recableado a raiz) y dos plantan la
 * ROTURA DEL CLASIFICADOR, que es lo que los invariantes de forma existen para
 * cazar: un contador puede estar verde y estar contando mal.
 *
 * El CSS plantado NO se escribe en el arbol real. `collectSkinFiles()` (el
 * unico walker, compartido con el token-audit y el literal-ownership-gate)
 * ahora acepta una raiz; el drill arma una sandbox de tmpdir con la unica
 * carpeta `skin/` que le importa, deja que el walker la descubra ahi, y
 * concatena ese hallazgo con el corpus real sin plantar nada en `src/`. Antes
 * escribia y borraba un archivo real bajo
 * `src/foundation/tokens/css/presentation/components/skin/`, lo que hacia
 * ENOENT determinista a otros tests que caminan ese arbol en paralelo
 * (`app-ds-hook-contract-gate/index.test.mjs`).
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { collectSkinFiles } from '../../lib/engine/skin-files/index.mjs';
import {
  BASELINE_PATH,
  classifyCascadeWiring,
  collectFindings,
  shapeFailures,
  varCalls,
} from './index.mjs';

const MODULE_URL = new URL('./index.mjs', import.meta.url).href;
const BANNER = /cascade-wiring-ratchet OK/;

function expectFinding(findings, fragment, message) {
  assert.ok(
    findings.some((finding) => finding.includes(fragment)),
    `${message}; got ${JSON.stringify(findings, null, 1)}`,
  );
}

/**
 * Planta `css` en una carpeta `skin/` sandbox bajo tmpdir y le da a `run` el
 * corpus real MAS lo que el walker descubre ahi -- nunca escribe en `src/`.
 */
function withPlantedCss(css, run) {
  const sandbox = mkdtempSync(join(tmpdir(), 'cascade-ratchet-drill-'));
  const skinDir = join(sandbox, 'src/foundation/tokens/css/presentation/components/skin');
  mkdirSync(skinDir, { recursive: true });
  writeFileSync(join(skinDir, '__cascade-ratchet-drill.css'), css);
  try {
    const files = [...collectSkinFiles(), ...collectSkinFiles(sandbox)];
    run(files);
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
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
    (files) => {
      expectFinding(
        collectFindings({ files }),
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
    (files) => {
      const findings = collectFindings({ files });
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
    (files) => {
      const findings = collectFindings({ files });
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
  withPlantedCss(`.ds-cascade-ratchet-drill { color: var(${victim}, var(--ds-color-primary)); }\n`, (files) => {
    expectFinding(
      collectFindings({ files }),
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

test('cerca PRE_F4B (C-3): rootsExcluded es |fallbackTargets| y el ratchet trata un canal real como raiz posicional', () => {
  const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
  const r = classifyCascadeWiring();
  assert.equal(r.roots, baseline.rootsExcluded);                    // la clave pasa a tener lector real
  assert.ok(r.fallbackTargets.has('--ds-input-md-icon-size'));      // testigo C-3, medido true hoy
  assert.ok(!r.reachesRoot.has('--ds-input-md-icon-size'));         // medido false hoy
  assert.ok(!r.denominator.includes('--ds-input-md-icon-size'));    // excluido del denominador, medido
});

/* ── el guard del entry: importar NO ejecuta el main ─────────────────────── */

test('importar este modulo desde un entry llamado index.mjs NO corre su main', () => {
  /* LA LATENCIA QUEDA DRILLEADA, NO SOLO ARREGLADA. El guard anterior era
   * `process.argv[1].endsWith('index.mjs')` y por la ley folder/index eso es
   * verdadero para CUALQUIER productor del arbol: importar este modulo desde
   * otro le ejecutaba el main, y un fallo habria matado al importador con un
   * `process.exit(1)` ajeno. El entry de prueba se llama `index.mjs` a
   * proposito -- es el nombre que disparaba el defecto. */
  const dir = mkdtempSync(join(tmpdir(), 'guard-drill-'));
  try {
    writeFileSync(join(dir, 'index.mjs'), `await import(${JSON.stringify(MODULE_URL)});\nconsole.log('IMPORT-OK');\n`);
    const run = spawnSync(process.execPath, [join(dir, 'index.mjs')], { encoding: 'utf8' });
    assert.equal(run.status, 0, `el import no debe fallar:\n${run.stderr}`);
    assert.match(run.stdout, /IMPORT-OK/, 'el entry de prueba corrio');
    assert.doesNotMatch(run.stdout, BANNER, 'el main corrio por el solo hecho de importar el modulo');
    assert.doesNotMatch(run.stderr, BANNER);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('el modulo SIGUE corriendo cuando es el entry (el guard no lo desarmo)', () => {
  const run = spawnSync(process.execPath, [fileURLToPath(MODULE_URL)], { encoding: 'utf8' });
  assert.match(`${run.stdout}${run.stderr}`, BANNER, 'el guard endurecido no debe matar la invocacion CLI');
});
