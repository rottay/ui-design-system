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
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { collectSkinFiles } from '../../../libraries/engine/skins/files/index.mjs';
import { collectDeclaredChannels } from '../../../libraries/tokens/producers/index.mjs';
import {
  BASELINE_PATH,
  classifyCascadeWiring,
  collectFindings,
  collectFoundationBaseRoots,
  collectProductionEvidence,
  reachesTerminalRoot,
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

test('the pinned transitivelyUnwired is the measured one, and never below the direct debt', () => {
  const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
  const result = classifyCascadeWiring();
  assert.equal(result.transitivelyUnwired.length, baseline.transitivelyUnwired);
  assert.ok(
    result.transitivelyUnwired.length >= result.debt.length,
    'la cota superior no puede quedar por debajo de la inferior',
  );
});

test('TRANSITIVO: una cadena que muere en un nombre sin productor NO esta cableada', () => {
  // Mencionar un fallback no prueba que haya un valor producido al final.
  withPlantedCss(
    '.ds-x { color: var(--ds-cascade-transitive-drill-a, var(--ds-cascade-transitive-drill-b)); }\n',
    (files) => {
      const result = classifyCascadeWiring(files);
      assert.ok(
        !result.reachesRoot.has('--ds-cascade-transitive-drill-a'),
        'un destino sin valor producido tampoco recibe credito directo',
      );
      assert.ok(
        result.transitivelyUnwired.includes('--ds-cascade-transitive-drill-a'),
        'la cadena muere en un nombre sin productor, asi que el arma transitiva tiene que contarlo',
      );
      expectFinding(
        collectFindings({ files }),
        'transitivelyUnwired GREW from',
        'una cadena rota tiene que subir el contador transitivo y enrojecer',
      );
    },
  );
});

test('TRANSITIVO: la MISMA cadena que aterriza en un nombre con productor si esta cableada', () => {
  // El control. `--ds-color-primary` esta declarado en el CSS autorado, asi que
  // la cadena de dos saltos llega a un valor real y no es deuda.
  withPlantedCss(
    '.ds-x { color: var(--ds-cascade-transitive-drill-a, var(--ds-cascade-transitive-drill-b)); }\n' +
      '.ds-x { color: var(--ds-cascade-transitive-drill-b, var(--ds-color-primary)); }\n',
    (files) => {
      const result = classifyCascadeWiring(files);
      assert.ok(
        !result.transitivelyUnwired.includes('--ds-cascade-transitive-drill-a'),
        'dos saltos hasta una raiz producida es una cadena entera, no deuda',
      );
      assert.deepEqual(
        collectFindings({ files }).filter((finding) => finding.includes('transitivelyUnwired GREW')),
        [],
        'cablear bien no puede subir el contador transitivo',
      );
    },
  );
});

test('TRANSITIVO: un ciclo de fallbacks termina el walk y no cuenta como cableado', () => {
  // Se comprueba sobre el walk directamente y no plantando CSS, porque la regla
  // (a) saca del denominador a los dos nombres del ciclo -- ambos son destino de
  // fallback del otro. Lo que hay que pinnear es el walk: que TERMINE y que no
  // declare cableada una cadena que no aterriza en ningun valor.
  const edges = new Map([
    ['--ds-cycle-a', new Set(['--ds-cycle-b'])],
    ['--ds-cycle-b', new Set(['--ds-cycle-a'])],
  ]);
  assert.equal(reachesTerminalRoot('--ds-cycle-a', edges, new Set()), false);
  // El control: el mismo ciclo con una salida a un nombre con productor SI llega.
  edges.set('--ds-cycle-b', new Set(['--ds-cycle-a', '--ds-fixture-terminal']));
  withSemanticCascade(':root { --ds-fixture-terminal: #123456; }', '.ds-probe { color: red; }', (_, proof) => {
    assert.equal(reachesTerminalRoot('--ds-cycle-a', edges, proof), true);
    assert.equal(reachesTerminalRoot('--ds-cycle-a', edges, new Set(['--ds-fixture-terminal'])), false);
  });
});

test('INJECTION: un canal nombrado SOLO dentro de un comentario CSS no mueve el contador', () => {
  // El drill de evasion de la familia `cascade-wiring`, gemelo del de
  // `themeCss.*`. Alli el contador leia tokens dentro de comentarios `//` y una
  // frase que anunciaba el DRENAJE de unas clases las certificaba como vivas
  // (auditoria F-23). Aqui la evasion equivalente es un `var(--ds-…)` escrito
  // dentro de `/* … */`: si `stripComments` dejara de correr, ese nombre
  // entraria al denominador y a la deuda sin que ninguna regla lo pinte.
  const name = '--ds-cascade-ratchet-injection-orphan';
  withPlantedCss(`/* .ds-x { color: var(${name}); } */\n.ds-y { color: var(--ds-color-primary); }\n`, (files) => {
    const result = classifyCascadeWiring(files);
    assert.ok(
      !result.denominator.includes(name),
      'un nombre que solo vive en un comentario no es pintura y no puede entrar al denominador',
    );
    assert.deepEqual(
      collectFindings({ files }).filter((finding) => finding.includes('debt GREW')),
      [],
      'un comentario no puede subir la deuda',
    );
  });

  // El control que impide que este drill pase por no medir nada: EL MISMO
  // nombre, fuera del comentario, si tiene que entrar y enrojecer.
  withPlantedCss(`.ds-x { color: var(${name}); }\n`, (files) => {
    const result = classifyCascadeWiring(files);
    assert.ok(result.denominator.includes(name), 'el mismo nombre, pintado de verdad, si cuenta');
    expectFinding(
      collectFindings({ files }),
      'debt GREW from',
      'el control tiene que enrojecer, o el drill de arriba no prueba nada',
    );
  });
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

/* ---------------- regla (a) por pertenencia: las raices de foundation/base ---------------- */

test('PERTENENCIA: una raiz de foundation/base leida pelada sale del denominador, no entra a la deuda', () => {
  // `--ds-spacing-52` esta declarada solo en foundation/base y hoy ningun skin
  // la lee: plantarla pelada es el caso limpio del defecto que --ds-z-fixed
  // mostro en el arbol real.
  const name = '--ds-spacing-52';
  withPlantedCss(`.ds-cascade-ratchet-drill { margin: var(${name}); }\n`, (files) => {
    const result = classifyCascadeWiring(files);
    assert.ok(result.ownedRoots.includes(name), 'una raiz de la escala base es raiz aunque nadie la nombre como destino');
    assert.ok(!result.denominator.includes(name), 'una raiz no es un canal: queda fuera del denominador');
    assert.ok(!result.debt.includes(name));
    assert.deepEqual(
      collectFindings({ files }).filter((finding) => finding.includes('debt GREW')),
      [],
      'leer una raiz pelada no puede subir la deuda',
    );
  });
  // El testigo vivo: la lectura pelada de back-top.
  const live = classifyCascadeWiring();
  assert.ok(live.ownedRoots.includes('--ds-z-fixed'));
  assert.ok(!live.debt.includes('--ds-z-fixed'));
});

test('PERTENENCIA: un canal de componente declarado con literal y leido sin cadena SIGUE en deuda (§1.6)', () => {
  const result = classifyCascadeWiring();
  const roots = collectFoundationBaseRoots();
  for (const name of ['--ds-qrcode-refresh-button-font-size', '--ds-floatbutton-badge-font-size']) {
    assert.ok(!roots.has(name), `${name} es canal de componente, no raiz de la escala base`);
    assert.ok(result.debt.includes(name), `${name} tiene productor pero ningun camino a raiz: es deuda`);
  }
});

test('PERTENENCIA: un nombre sin productor sigue en deuda', () => {
  // El canal del rustic congelado, y un huerfano plantado.
  assert.ok(classifyCascadeWiring().debt.includes('--ds-calendar-radius'));
  withPlantedCss('.ds-cascade-ratchet-drill { color: var(--ds-cascade-ratchet-drill-orphan); }\n', (files) => {
    assert.ok(classifyCascadeWiring(files).debt.includes('--ds-cascade-ratchet-drill-orphan'));
  });
});

test('PERTENENCIA: el tema puede re-declarar una raiz; un archivo de componente la convierte en canal', () => {
  const sandbox = mkdtempSync(join(tmpdir(), 'cascade-base-roots-'));
  const at = (rel, css) => {
    const file = join(sandbox, 'src/foundation/tokens/css', rel);
    mkdirSync(join(file, '..'), { recursive: true });
    writeFileSync(file, css);
    return file;
  };
  try {
    const files = [
      at('foundation/base/drill/index.css', ':root { --ds-drill-base-only: 1px; --ds-drill-base-theme: 1px; --ds-drill-base-component: 1px; }'),
      at('foundation/themes/drill/index.css', ':root { --ds-drill-base-theme: 2px; --ds-drill-theme-only: 2px; }'),
      at('presentation/components/drill/index.css', ':root { --ds-drill-base-component: 3px; }'),
      at('foundation/base/drill/prose.css', '/* --ds-drill-comment-only: 1px; */'),
    ];
    const roots = collectFoundationBaseRoots(files);
    assert.ok(roots.has('--ds-drill-base-only'));
    assert.ok(roots.has('--ds-drill-base-theme'), 'un tema que re-declara el valor de una raiz no la convierte en canal');
    assert.ok(!roots.has('--ds-drill-base-component'), 'declarada tambien en un componente: es canal');
    assert.ok(!roots.has('--ds-drill-theme-only'), 'sin declaracion en la escala base no hay raiz por pertenencia');
    assert.ok(!roots.has('--ds-drill-comment-only'), 'una declaracion en un comentario no es declaracion');
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
});

test('MUTANTE: sin la clausula de pertenencia la raiz base vuelve a la deuda, y solo raices base se mueven', () => {
  const name = '--ds-spacing-52';
  withPlantedCss(`.ds-cascade-ratchet-drill { margin: var(${name}); }\n`, (files) => {
    const off = classifyCascadeWiring(files, undefined, new Set());
    assert.ok(off.debt.includes(name), 'sin la clausula, la lectura pelada de una raiz vuelve a contarse como deuda');
    assert.ok(!classifyCascadeWiring(files).debt.includes(name));
  });
  // Conservacion: la clausula saca de la deuda SOLO raices de la escala base, y
  // el arma transitiva se mueve exactamente por los mismos nombres.
  const roots = collectFoundationBaseRoots();
  const on = classifyCascadeWiring(undefined, undefined, roots);
  const off = classifyCascadeWiring(undefined, undefined, new Set());
  const left = off.debt.filter((name) => !on.debt.includes(name));
  assert.ok(left.length > 0, 'el arbol tiene lecturas peladas de raices base: el mutante tiene que moverse');
  assert.ok(left.includes('--ds-z-fixed'));
  assert.deepEqual(on.debt.filter((name) => !off.debt.includes(name)), [], 'la clausula no puede meter nombres a la deuda');
  for (const name of left) assert.ok(roots.has(name), `${name} salio de la deuda sin ser raiz base`);
  assert.deepEqual(off.transitivelyUnwired.filter((name) => !on.transitivelyUnwired.includes(name)), left);
  assert.deepEqual(on.denominator, off.denominator.filter((name) => !on.ownedRoots.includes(name)));
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

test('SHAPE: a foundation-base root counted as debt fails (rule a by ownership broken)', () => {
  const { failures } = shapeFailures({
    denominator: ['--ds-z-fixed'],
    debt: ['--ds-z-fixed'],
    fallbackTargets: new Set(),
    ownedRoots: ['--ds-z-fixed'],
    reachesRoot: new Set(),
  });
  expectFinding(failures, 'is a foundation-base root and must never be counted as debt', 'una raiz base no es deuda');
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

function withAuthoredTerminalFixture(rootValue, paint, run) {
  const sandbox = mkdtempSync(join(tmpdir(), 'cascade-terminal-contract-'));
  const base = join(sandbox, 'src/foundation/tokens/css/foundation/base/probe/index.css');
  const skin = join(sandbox, 'src/foundation/tokens/css/presentation/components/skin/probe/index.css');
  try {
    mkdirSync(join(base, '..'), { recursive: true });
    mkdirSync(join(skin, '..'), { recursive: true });
    writeFileSync(base, `:root { --ds-fixture-terminal: ${rootValue}; }\n`);
    writeFileSync(skin, paint);
    const authored = [base, skin];
    const producers = collectDeclaredChannels(authored);
    const roots = collectFoundationBaseRoots(authored);
    run(classifyCascadeWiring(collectSkinFiles(sandbox), producers, roots), producers, roots);
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
}

test('FIXTURE CONTRACT: an authored literal terminal completes the two-hop chain', (t) => {
  const paint = '.ds-probe { color: var(--ds-fixture-a, var(--ds-fixture-b)); background: var(--ds-fixture-b, var(--ds-fixture-terminal)); }';
  withAuthoredTerminalFixture('#123456', paint, (result, producers, roots) => {
    t.diagnostic(JSON.stringify({ debt: result.debt, transitive: result.transitivelyUnwired, reachesRoot: [...result.reachesRoot] }));
    assert.ok(producers.has('--ds-fixture-terminal'));
    assert.ok(roots.has('--ds-fixture-terminal'));
    assert.deepEqual(result.denominator, ['--ds-fixture-a']);
    assert.ok(result.reachesRoot.has('--ds-fixture-a'));
    assert.deepEqual(result.debt, []);
    assert.deepEqual(result.transitivelyUnwired, []);
  });
});

test('FIXTURE CONTRACT: an unproduced terminal receives no direct root credit', (t) => {
  const paint = '.ds-probe { color: var(--ds-fixture-a, var(--ds-fixture-missing)); }';
  withAuthoredTerminalFixture('#123456', paint, (result, producers) => {
    t.diagnostic(JSON.stringify({ debt: result.debt, transitive: result.transitivelyUnwired, reachesRoot: [...result.reachesRoot] }));
    assert.ok(!producers.has('--ds-fixture-missing'));
    assert.deepEqual(result.denominator, ['--ds-fixture-a']);
    assert.deepEqual(result.transitivelyUnwired, ['--ds-fixture-a']);
    assert.equal(result.reachesRoot.has('--ds-fixture-a'), false, 'mentioning an unproduced fallback is not root reach');
  });
});

test('FIXTURE CONTRACT: a broken authored terminal value leaves the matched chain unwired', (t) => {
  const paint = '.ds-probe { color: var(--ds-fixture-a, var(--ds-fixture-b)); background: var(--ds-fixture-b, var(--ds-fixture-terminal)); }';
  withAuthoredTerminalFixture('var(--ds-fixture-missing)', paint, (result, producers, roots) => {
    t.diagnostic(JSON.stringify({ debt: result.debt, transitive: result.transitivelyUnwired, reachesRoot: [...result.reachesRoot] }));
    assert.ok(producers.has('--ds-fixture-terminal'));
    assert.ok(roots.has('--ds-fixture-terminal'));
    assert.ok(!producers.has('--ds-fixture-missing'));
    assert.deepEqual(result.denominator, ['--ds-fixture-a']);
    assert.deepEqual(result.transitivelyUnwired, ['--ds-fixture-a'], 'foundation membership and declaration presence cannot terminate a broken value chain');
  });
});


function withSemanticCascade(baseCss, paint, run) {
  const sandbox = mkdtempSync(join(tmpdir(), 'cascade-value-proof-'));
  const base = join(sandbox, 'src/foundation/tokens/css/foundation/base/probe/index.css');
  const skin = join(sandbox, 'src/foundation/tokens/css/presentation/components/skin/probe/index.css');
  try {
    mkdirSync(join(base, '..'), { recursive: true });
    mkdirSync(join(skin, '..'), { recursive: true });
    writeFileSync(base, baseCss);
    writeFileSync(skin, paint);
    const authored = [base, skin];
    const producers = collectDeclaredChannels(authored);
    run(classifyCascadeWiring(collectSkinFiles(sandbox), producers, collectFoundationBaseRoots(authored)),
      collectProductionEvidence(authored, producers));
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
}

const PROBE_PAINT = '.ds-probe { color: var(--ds-probe-channel, var(--ds-fixture-terminal)); }';

const TERMINAL_CASES = [
  ['literal root', ':root { --ds-fixture-terminal: #123456; }', true],
  ['value dependency', ':root { --ds-fixture-leaf: #123456; --ds-fixture-terminal: var(--ds-fixture-leaf); }', true],
  ['literal fallback in a produced value', ':root { --ds-fixture-terminal: var(--ds-missing, #123456); }', true],
  ['missing value dependency', ':root { --ds-fixture-terminal: var(--ds-missing); }', false],
  ['self cycle with fallback', ':root { --ds-fixture-terminal: var(--ds-fixture-terminal, red); }', false],
  ['indirect cycle', ':root { --ds-fixture-terminal: var(--ds-cycle); --ds-cycle: var(--ds-fixture-terminal, red); }', false],
  ['later broken override', ':root { --ds-fixture-terminal: red; --ds-fixture-terminal: var(--ds-missing); }', false],
  ['later repaired override', ':root { --ds-fixture-terminal: var(--ds-missing); --ds-fixture-terminal: red; }', true],
  ['important broken override', ':root { --ds-fixture-terminal: var(--ds-missing) !important; --ds-fixture-terminal: red; }', false],
  ['unmatched conditional', '@media print { :root { --ds-fixture-terminal: red; } }', false],
  ['disjoint selector', '.ds-unrelated { --ds-fixture-terminal: red; }', false],
  ['same selector', '.ds-probe { --ds-fixture-terminal: red; }', true],
  ['local broken override', ':root { --ds-fixture-terminal: red; } .ds-probe { --ds-fixture-terminal: var(--ds-missing); }', false],
  ['dependency computed at root', ':root { --ds-fixture-terminal: var(--ds-local-only); } .ds-probe { --ds-local-only: red; }', false],
];
for (const [label, css, expected] of TERMINAL_CASES) {
  test(`SEMANTIC CONTRACT: cascade terminal ${label}`, () => {
    withSemanticCascade(css, PROBE_PAINT, (result) => {
      assert.equal(result.reachesRoot.has('--ds-probe-channel'), expected);
      assert.equal(result.debt.includes('--ds-probe-channel'), !expected);
      assert.equal(result.transitivelyUnwired.includes('--ds-probe-channel'), !expected);
      assert.deepEqual(shapeFailures(result).failures, []);
    });
  });
}

test('SEMANTIC CONTRACT: functional fallback requires every value dependency', () => {
  const good = ':root { --ds-fixture-terminal: red; --ds-fixture-other: blue; }';
  const paint = '.ds-probe { color: var(--ds-probe-channel, color-mix(in srgb, var(--ds-fixture-terminal) 50%, var(--ds-fixture-other))); }';
  withSemanticCascade(good, paint, (result) => assert.deepEqual(result.debt, []));
  withSemanticCascade(':root { --ds-fixture-terminal: red; }', paint, (result) => {
    assert.deepEqual(result.debt, ['--ds-probe-channel']);
    assert.deepEqual(result.transitivelyUnwired, ['--ds-probe-channel']);
  });
});

test('SEMANTIC CONTRACT: two-hop read edges require the same selector scope', () => {
  const root = ':root { --ds-fixture-terminal: red; }';
  const first = '.ds-probe { color: var(--ds-probe-channel, var(--ds-ramp)); }';
  withSemanticCascade(root, `${first} .ds-probe { background: var(--ds-ramp, var(--ds-fixture-terminal)); }`, (result) => {
    assert.equal(result.reachesRoot.has('--ds-probe-channel'), true);
  });
  withSemanticCascade(root, `${first} .ds-unrelated { background: var(--ds-ramp, var(--ds-fixture-terminal)); }`, (result) => {
    assert.equal(result.reachesRoot.has('--ds-probe-channel'), false);
    assert.deepEqual(result.transitivelyUnwired, ['--ds-probe-channel']);
  });
});


test('SEMANTIC CONTRACT: value dependencies retain the active conditional context', () => {
  const root = ':root { --ds-fixture-terminal: var(--ds-leaf); --ds-leaf: red; } @media print { :root { --ds-leaf: var(--ds-missing); } }';
  withSemanticCascade(root, PROBE_PAINT, (result) => assert.equal(result.reachesRoot.has('--ds-probe-channel'), false));
  withSemanticCascade(root, `@media print { ${PROBE_PAINT} }`, (result) => {
    assert.deepEqual(result.debt, ['--ds-probe-channel']);
    assert.deepEqual(result.transitivelyUnwired, ['--ds-probe-channel']);
  });
});


test('SEMANTIC CONTRACT: a component literal without a fallback stays cascade debt', () => {
  withSemanticCascade('', '.ds-probe { --ds-component-only: 16px; font-size: var(--ds-component-only); }', (result) => {
    assert.deepEqual(result.debt, ['--ds-component-only']);
    assert.deepEqual(result.transitivelyUnwired, ['--ds-component-only']);
  });
});


const RECOVERY_CASES = [
  ['separate indirect cycle recovers through literal', ':root { --ds-a: var(--ds-b); --ds-b: var(--ds-a); --ds-fixture-terminal: var(--ds-a, red); }', true],
  ['unselected cyclic fallback does not invalidate its consumer', ':root { --ds-leaf: red; --ds-loop: var(--ds-loop); --ds-fixture-terminal: var(--ds-leaf, var(--ds-loop)); }', true],
  ['cycle without recovery stays invalid', ':root { --ds-loop: var(--ds-loop); --ds-fixture-terminal: var(--ds-loop); }', false],
  ['fallback reference to self remains a cycle', ':root { --ds-leaf: red; --ds-fixture-terminal: var(--ds-leaf, var(--ds-fixture-terminal)); }', false],
  ['fallback reference completing indirect cycle stays invalid', ':root { --ds-leaf: red; --ds-loop: var(--ds-fixture-terminal); --ds-fixture-terminal: var(--ds-leaf, var(--ds-loop)); }', false],
  ['conditional media invalidation is possible outside media', ':root { --ds-fixture-terminal: red; } @media print { :root { --ds-fixture-terminal: var(--missing); } }', false],
  ['conditional supports invalidation is possible outside supports', ':root { --ds-fixture-terminal: red; } @supports (display: grid) { :root { --ds-fixture-terminal: var(--missing); } }', false],
  ['all possible conditional values resolve', ':root { --ds-fixture-terminal: red; } @media print { :root { --ds-fixture-terminal: blue; } }', true],
  ['possible child override can invalidate inherited root', ':root { --ds-fixture-terminal: red; } @media print { .ds-probe { --ds-fixture-terminal: var(--missing); } }', false],
  ['conditional-only production cannot prove unconditional coverage', '@supports (display: grid) { :root { --ds-fixture-terminal: red; } }', false],
  ['anonymous important layer beats unlayered important', '@layer { :root { --ds-fixture-terminal: var(--missing) !important; } } :root { --ds-fixture-terminal: red !important; }', false],
  ['valid anonymous important layer beats invalid unlayered important', '@layer { :root { --ds-fixture-terminal: red !important; } } :root { --ds-fixture-terminal: var(--missing) !important; }', true],
  ['earlier anonymous important layer wins', '@layer { :root { --ds-fixture-terminal: red !important; } } @layer { :root { --ds-fixture-terminal: var(--missing) !important; } }', true],
  ['later anonymous normal layer wins', '@layer { :root { --ds-fixture-terminal: var(--missing); } } @layer { :root { --ds-fixture-terminal: red; } }', true],
  ['unlayered normal beats anonymous normal', '@layer { :root { --ds-fixture-terminal: var(--missing); } } :root { --ds-fixture-terminal: red; }', true],
  ['invalid unlayered normal beats valid anonymous normal', ':root { --ds-fixture-terminal: var(--missing); } @layer { :root { --ds-fixture-terminal: red; } }', false],
  ['named important layer beats unlayered important', '@layer alpha { :root { --ds-fixture-terminal: red !important; } } :root { --ds-fixture-terminal: var(--missing) !important; }', true],
  ['unresolved named important order retains invalid contender', '@layer alpha { :root { --ds-fixture-terminal: red !important; } } @layer beta { :root { --ds-fixture-terminal: var(--missing) !important; } }', false],
];
for (const [label, css, expected] of RECOVERY_CASES) {
  test(`ADVERSARIAL CONTRACT: cascade ${label}`, () => {
    withSemanticCascade(css, PROBE_PAINT, (result) => {
      assert.equal(result.reachesRoot.has('--ds-probe-channel'), expected);
      assert.equal(result.debt.includes('--ds-probe-channel'), !expected);
      assert.equal(result.transitivelyUnwired.includes('--ds-probe-channel'), !expected);
    });
  });
}

test('ADVERSARIAL CONTRACT: matching nested conditions keep their valid production', () => {
  const css = '@media print { @supports (display: grid) { :root { --ds-fixture-terminal: red; } } }';
  withSemanticCascade(css, `@media print { @supports (display: grid) { ${PROBE_PAINT} } }`, (result) => {
    assert.deepEqual(result.debt, []);
    assert.deepEqual(result.transitivelyUnwired, []);
  });
});

const REALM_CASES = [
  ['classic terminal cannot produce Modern fallback', 'classic', ':root { --ds-fixture-terminal: red; }', '', '', false],
  ['rustic terminal cannot produce Modern fallback', 'rustic', ':root { --ds-fixture-terminal: red; }', '', '', false],
  ['frozen successful reader cannot credit the same productive channel', 'classic', ':root { --ds-fixture-terminal: red; } .ds-probe { color: var(--ds-probe-channel, var(--ds-fixture-terminal)); }', '', '', false],
  ['classic read edge cannot complete Modern path', 'classic', '.ds-probe { color: var(--ds-ramp, var(--ds-fixture-terminal)); }', ':root { --ds-fixture-terminal: red; }', '.ds-probe { color: var(--ds-probe-channel, var(--ds-ramp)); }', false],
  ['shared read edge completes Modern path', 'classic', '', ':root { --ds-fixture-terminal: red; } .ds-probe { background: var(--ds-ramp, var(--ds-fixture-terminal)); }', '.ds-probe { color: var(--ds-probe-channel, var(--ds-ramp)); }', true],
  ['Modern terminal stays productive beside frozen invalid value', 'classic', ':root { --ds-fixture-terminal: var(--missing); }', ':root { --ds-fixture-terminal: red; }', '', true],
];
for (const [label, engine, frozenCss, sharedCss, modernCss, expected] of REALM_CASES) {
  test(`ADVERSARIAL CONTRACT: realm ${label}`, () => {
    const sandbox = mkdtempSync(join(tmpdir(), 'cascade-realm-proof-'));
    try {
      const modern = join(sandbox, 'src/foundation/tokens/css/runtime/engines/modern/skin/probe/index.css');
      const frozen = join(sandbox, `src/foundation/tokens/css/runtime/engines/${engine}/skin/probe/index.css`);
      const shared = join(sandbox, 'src/foundation/tokens/css/presentation/components/skin/probe/index.css');
      const entries = [[modern, modernCss || PROBE_PAINT], [frozen, frozenCss], [shared, sharedCss]];
      for (const [file, css] of entries) {
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, css);
      }
      const files = collectSkinFiles(sandbox);
      const producers = collectDeclaredChannels(files);
      const result = classifyCascadeWiring(files, producers, new Set());
      assert.equal(result.files, files.length);
      assert.equal(result.reachesRoot.has('--ds-probe-channel'), expected);
      assert.ok(result.denominator.includes('--ds-probe-channel'));
      assert.equal(result.debt.includes('--ds-probe-channel'), !expected);
    } finally {
      rmSync(sandbox, { recursive: true, force: true });
    }
  });
}


test('ADVERSARIAL CONTRACT: frozen-only readers retain their denominator and own-realm disposition', () => {
  const sandbox = mkdtempSync(join(tmpdir(), 'cascade-frozen-proof-'));
  try {
    const frozen = join(sandbox, 'src/foundation/tokens/css/runtime/engines/classic/skin/probe/index.css');
    const modern = join(sandbox, 'src/foundation/tokens/css/runtime/engines/modern/skin/probe/index.css');
    const entries = [
      [frozen, ':root { --ds-frozen-root: red; } .ds-probe { color: var(--ds-frozen-channel, var(--ds-frozen-root)); }'],
      [modern, '.ds-probe { color: var(--ds-modern-channel, var(--ds-frozen-root)); }'],
    ];
    for (const [file, css] of entries) {
      mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, css);
    }
    const files = collectSkinFiles(sandbox);
    const result = classifyCascadeWiring(files, collectDeclaredChannels(files), new Set());
    assert.equal(result.files, 2);
    assert.deepEqual(result.denominator, ['--ds-frozen-channel', '--ds-modern-channel']);
    assert.equal(result.reachesRoot.has('--ds-frozen-channel'), true);
    assert.equal(result.reachesRoot.has('--ds-modern-channel'), false);
    assert.deepEqual(result.debt, ['--ds-modern-channel']);
    assert.deepEqual(result.transitivelyUnwired, ['--ds-modern-channel']);
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
});

const CONTENDER_LAYOUTS = ['conditional', 'cross-file', 'named-layer'];
const CONTENDER_VALUES = [
  ['cycle participant', 'var(--ds-fixture-terminal)', 'var(--branch, red)', false],
  ['separate cycle recovery', 'var(--branch)', 'var(--branch, red)', true],
  ['all valid alternatives', 'green', 'var(--branch, red)', true],
  ['fallback cycle participant', 'var(--valid, var(--ds-fixture-terminal))', 'var(--branch, red)', false],
  ['primary bypass of separate cycle', 'var(--branch)', 'var(--valid, var(--branch))', true],
];
for (const layout of CONTENDER_LAYOUTS) {
  for (const [label, value, terminal, expected] of CONTENDER_VALUES) {
    test(`CONTENDER CONTRACT: cascade ${layout} ${label}`, () => {
      const sandbox = mkdtempSync(join(tmpdir(), 'cascade-contender-proof-'));
      try {
        const base = join(sandbox, 'src/foundation/tokens/css/foundation/base/a/index.css');
        const other = join(sandbox, 'src/foundation/tokens/css/foundation/base/z/index.css');
        const skin = join(sandbox, 'src/foundation/tokens/css/runtime/engines/modern/skin/probe/index.css');
        const root = `:root { --ds-fixture-terminal: ${terminal}; --valid: blue; }`;
        const first = ':root { --branch: blue; }';
        const later = `:root { --branch: ${value}; }`;
        const css = layout === 'named-layer'
          ? `${root} @layer alpha { ${first} } @layer beta { ${later} }`
          : `${root} ${first} ${layout === 'conditional' ? `@media print { ${later} }` : ''}`;
        const entries = [[base, css], [other, layout === 'cross-file' ? later : ''], [skin, PROBE_PAINT]];
        for (const [file, source] of entries) {
          mkdirSync(dirname(file), { recursive: true });
          writeFileSync(file, source);
        }
        const authored = entries.map(([file]) => file);
        const producers = collectDeclaredChannels(authored);
        const result = classifyCascadeWiring(collectSkinFiles(sandbox), producers, collectFoundationBaseRoots(authored));
        const proof = collectProductionEvidence(authored, producers);
        assert.equal(proof.hasProducedValue('--ds-fixture-terminal', { file: skin, selector: '.ds-probe', conditions: [] }), expected);
        assert.equal(result.reachesRoot.has('--ds-probe-channel'), expected);
        assert.equal(result.debt.includes('--ds-probe-channel'), !expected);
        assert.equal(result.transitivelyUnwired.includes('--ds-probe-channel'), !expected);
        assert.deepEqual(shapeFailures(result).failures, []);
      } finally {
        rmSync(sandbox, { recursive: true, force: true });
      }
    });
  }
}
