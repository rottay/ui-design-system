import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  CEILINGS_BASELINE_RELATIVE,
  evaluateCeilings,
  isValidCeiling,
  readCeilings,
  runPublicEntrypointGate,
  writeCeilingsBaseline,
} from './index.mjs';

function write(root, relativePath, source) {
  const filePath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, source);
}

function runtimeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'public-entrypoint-gate-'));
  const source = 'src/entrypoints/public/primitives/box/index.ts';
  const output = 'entrypoints/public/primitives/box/index';
  const manifest = {
    schemaVersion: 2,
    package: '@rottay/design-system',
    coverage: { runtimeSymbols: 1, typeSymbols: 0, totalSymbols: 1 },
    entries: {
      './primitives/box': {
        owner: 'primitives',
        family: 'box',
        boundary: 'runtime',
        client: true,
        source,
        output,
        budget: { maxDirectSources: 1, maxReachableModules: 3, maxSourceBytes: 1000 },
        symbols: [{ name: 'Box', kind: 'value' }],
      },
    },
  };
  write(root, 'public-entrypoints.manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
  write(root, 'package.json', `${JSON.stringify({
    name: '@rottay/design-system',
    exports: {
      './primitives/box': {
        types: `./dist/${output}.d.ts`,
        import: `./dist/${output}.js`,
        require: `./dist/${output}.cjs`,
      },
      './public-entrypoints-manifest': { default: './public-entrypoints.manifest.json' },
    },
    files: ['public-entrypoints.manifest.json'],
    releaseSync: { sourceEntrypoints: { './primitives/box': source.slice(4) } },
  }, null, 2)}\n`);
  write(root, 'vite.config.ts', `
readFileSync(resolve(__dirname, 'public-entrypoints.manifest.json'), 'utf8');
const entry = { ...publicEntries };
const output = { preserveModules: true, preserveModulesRoot: 'src' };
`);
  write(root, source, `'use client';\nexport { Box } from '../../../../ui/primitives/layout/Box';\n`);
  write(root, 'src/ui/primitives/layout/Box/index.ts', 'export const Box = 1;\n');
  anchorCeilings(root, manifest);
  return { root, manifest };
}

/** Ancla los techos de un manifest sintetico: el gate falla cerrado sin ancla. */
function anchorCeilings(root, manifest, override = null) {
  const ceilings = override ?? Object.fromEntries(
    Object.entries(manifest.entries).map(([subpath, entry]) => [subpath, entry.budget.maxSourceBytes]),
  );
  write(root, CEILINGS_BASELINE_RELATIVE, `${JSON.stringify({ schemaVersion: 1, law: 'fixture', ceilings }, null, 2)}\n`);
}

test('accepts a direct family wrapper within its graph budget', () => {
  const { root } = runtimeFixture();
  assert.doesNotThrow(() => runPublicEntrypointGate({ root, silent: true }));
});

test('rejects a graph that reaches a tier barrel', () => {
  const { root } = runtimeFixture();
  write(root, 'src/ui/primitives/layout/Box/index.ts', "export { Box } from '../../index';\n");
  write(root, 'src/ui/primitives/index.ts', 'export const Box = 1;\n');
  assert.throws(
    () => runPublicEntrypointGate({ root, silent: true }),
    /forbidden root\/tier barrel src\/ui\/primitives\/index\.ts/,
  );
});

test('rejects reachable fan-out above the reviewed ceiling', () => {
  const { root, manifest } = runtimeFixture();
  manifest.entries['./primitives/box'].budget.maxReachableModules = 1;
  write(root, 'public-entrypoints.manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
  assert.throws(
    () => runPublicEntrypointGate({ root, silent: true }),
    /reachable fan-out 2 exceeds 1/,
  );
});

test('rejects source bytes above the reviewed ceiling', () => {
  const { root, manifest } = runtimeFixture();
  manifest.entries['./primitives/box'].budget.maxSourceBytes = 1;
  write(root, 'public-entrypoints.manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
  assert.throws(
    () => runPublicEntrypointGate({ root, silent: true }),
    /source bytes \d+ exceeds 1/,
  );
});

test('rejects a client directive on a pure contracts boundary', () => {
  const { root, manifest } = runtimeFixture();
  const entry = manifest.entries['./primitives/box'];
  delete manifest.entries['./primitives/box'];
  Object.assign(entry, {
    owner: 'contracts',
    family: 'primitives',
    boundary: 'contracts',
    client: false,
    source: 'src/entrypoints/public/contracts/primitives/index.ts',
    output: 'entrypoints/public/contracts/primitives/index',
    symbols: [{ name: 'BoxProps', kind: 'type' }],
  });
  manifest.entries['./contracts/primitives'] = entry;
  manifest.coverage = { runtimeSymbols: 0, typeSymbols: 1, totalSymbols: 1 };
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  delete packageJson.exports['./primitives/box'];
  packageJson.exports['./contracts/primitives'] = {
    types: `./dist/${entry.output}.d.ts`,
    import: `./dist/${entry.output}.js`,
    require: `./dist/${entry.output}.cjs`,
  };
  packageJson.releaseSync.sourceEntrypoints = {
    './contracts/primitives': entry.source.slice(4),
  };
  write(root, 'package.json', `${JSON.stringify(packageJson, null, 2)}\n`);
  write(root, 'public-entrypoints.manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
  anchorCeilings(root, manifest);
  write(root, entry.source, `'use client';\nexport type { BoxProps } from '../../../../ui/primitives/layout/Box/contracts';\n`);
  write(root, 'src/ui/primitives/layout/Box/contracts/index.ts', 'export interface BoxProps {}\n');
  assert.throws(
    () => runPublicEntrypointGate({ root, silent: true }),
    /non-client boundary must remain directive-free/,
  );
});

/* ── DRILL-77: el techo de bytes es decrece-solo, y ahora mecanicamente ───── */

test('TECHO — un techo que SUBE falla, y el mensaje manda adelgazar el grafo, no el ancla', () => {
  const { root, manifest } = runtimeFixture();
  anchorCeilings(root, manifest, { './primitives/box': 900 });
  assert.throws(
    () => runPublicEntrypointGate({ root, silent: true }),
    (error) => /\[techo\] \.\/primitives\/box: techo 900 -> 1000 SUBIO/.test(error.message)
      && /se adelgaza el grafo, no el ancla/.test(error.message)
      && /--widen --reason/.test(error.message),
  );
});

test('TECHO — un techo que BAJA tambien falla, con la instruccion de bajar el ancla', () => {
  const { root, manifest } = runtimeFixture();
  anchorCeilings(root, manifest, { './primitives/box': 1200 });
  assert.throws(
    () => runPublicEntrypointGate({ root, silent: true }),
    (error) => /\[techo\] \.\/primitives\/box: techo 1200 -> 1000 bajo/.test(error.message)
      && /MISMO commit/.test(error.message),
  );
});

test('TECHO — ancla ausente o corrupta: FALLA CERRADO', () => {
  const { root } = runtimeFixture();
  fs.rmSync(path.join(root, CEILINGS_BASELINE_RELATIVE));
  assert.throws(() => runPublicEntrypointGate({ root, silent: true }), /el ancla de techos no existe/);
  write(root, CEILINGS_BASELINE_RELATIVE, '{"schemaVersion":1}\n');
  assert.throws(() => runPublicEntrypointGate({ root, silent: true }), /no tiene `ceilings`/);
  // Y sin `ceilings` valido no se aprueba por defecto ni con el manifest intacto.
  assert.deepEqual(evaluateCeilings({ './a': 1 }, null), ['el ancla de techos no existe o no tiene `ceilings`']);
});

test('TECHO — los dos desacuerdos de CONJUNTO se ven, no solo los de valor', () => {
  assert.deepEqual(evaluateCeilings({ './a': 10 }, { ceilings: { './a': 10 } }), []);
  const nuevo = evaluateCeilings({ './a': 10, './b': 20 }, { ceilings: { './a': 10 } });
  assert.equal(nuevo.length, 1);
  assert.match(nuevo[0], /\.\/b: techo 20 sin anclar/);
  assert.match(nuevo[0], /entra por revision, no por omision/);
  const huerfano = evaluateCeilings({ './a': 10 }, { ceilings: { './a': 10, './z': 5 } });
  assert.deepEqual(huerfano, ['./z: el ancla lo declara y el manifest ya no le pone techo']);
});

test('TECHO — la PUERTA: subir exige --widen; bajar exige razon; sin razon no se escribe', () => {
  const { root, manifest } = runtimeFixture();
  anchorCeilings(root, manifest, { './primitives/box': 900 });          // el vivo (1000) SUBE
  assert.throws(() => writeCeilingsBaseline({ root, reason: null }), /exige --reason/);
  assert.throws(() => writeCeilingsBaseline({ root, reason: 'porque si' }),
    (error) => /me niego a AMPLIAR el ancla en 1 techo/.test(error.message)
      && /\.\/primitives\/box \(900 -> 1000\)/.test(error.message)
      && /--widen --reason/.test(error.message));
  // Con la puerta pedida por nombre, se escribe y queda REGISTRADO que fue ampliacion.
  const out = writeCeilingsBaseline({ root, reason: 'ampliacion autorizada de prueba', widen: true });
  assert.deepEqual(out.raised, ['./primitives/box']);
  assert.deepEqual(out.added, []);
  const written = JSON.parse(fs.readFileSync(path.join(root, CEILINGS_BASELINE_RELATIVE), 'utf8'));
  assert.equal(written.ceilings['./primitives/box'], 1000);
  assert.equal(written.lastMove, 'ampliacion autorizada de prueba');
  assert.match(written.lastMoveKind, /ampliacion autorizada por nombre/);
  assert.doesNotThrow(() => runPublicEntrypointGate({ root, silent: true }));
});

test('TECHO — bajar NO necesita --widen, y se registra como decrece-solo', () => {
  const { root, manifest } = runtimeFixture();
  anchorCeilings(root, manifest, { './primitives/box': 1200 });          // el vivo (1000) BAJA
  const out = writeCeilingsBaseline({ root, reason: 'el grafo adelgazo' });
  assert.deepEqual(out.raised, []);
  const written = JSON.parse(fs.readFileSync(path.join(root, CEILINGS_BASELINE_RELATIVE), 'utf8'));
  assert.equal(written.ceilings['./primitives/box'], 1000);
  assert.equal(written.lastMoveKind, 'decrece-solo');
});

test('TECHO — el arbol REAL esta en su ancla, techo por techo', () => {
  const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'public-entrypoints.manifest.json'), 'utf8'));
  const baseline = JSON.parse(fs.readFileSync(path.join(root, CEILINGS_BASELINE_RELATIVE), 'utf8'));
  const live = readCeilings(manifest);
  assert.equal(Object.keys(live).length, 77, 'los 77 subpaths del asiento E-2, medidos');
  assert.deepEqual(evaluateCeilings(live, baseline), []);
  // Los 18 de la ampliacion E-2 salen de su propio tag en el manifest, no de una lista a mano.
  const tagged = Object.entries(manifest.entries).filter(([, entry]) => entry.budgetNote).map(([subpath]) => subpath);
  assert.equal(tagged.length, 18);
  assert.deepEqual(baseline.widenedByE2, tagged.sort());
});

/* ── los dos defectos que encontro Codex, drilleados para que no vuelvan ──── */

test('TECHO/CODEX-1 — un ancla CORRUPTA no pasa en silencio, en ninguna de sus formas', () => {
  /* La primera version comparaba con `>` y `<` sin validar la forma, y en JS las
   * dos comparaciones son FALSAS contra un string, un array, un objeto o NaN:
   * el ancla rota daba cero errores. Cada forma va nombrada para que el arreglo
   * no se pueda deshacer sin que algo enrojezca. */
  for (const corrupto of ['not-a-number', null, [1000], {}, NaN, Infinity, -5, 10.5, 0, true]) {
    const failures = evaluateCeilings({ './a': 1000 }, { ceilings: { './a': corrupto } });
    assert.equal(failures.length, 1, `ancla ${JSON.stringify(corrupto)} paso en silencio`);
    assert.match(failures[0], /el techo anclado .* no es un entero positivo/);
  }
  // Y del lado VIVO igual: un manifest con basura tampoco se compara.
  for (const corrupto of ['x', null, NaN, -5, 10.5, 0]) {
    const failures = evaluateCeilings({ './a': corrupto }, { ceilings: { './a': 1000 } });
    assert.equal(failures.length, 1, `vivo ${JSON.stringify(corrupto)} paso en silencio`);
    assert.match(failures[0], /el techo vivo .* no es un entero positivo/);
  }
  // Un ancla huerfana Y corrupta se nombra por las dos cosas, no por una.
  assert.match(evaluateCeilings({}, { ceilings: { './z': 'x' } })[0], /ni siquiera es un techo/);
  // `ceilings` como array es corrupcion de la raiz, no un mapa vacio.
  assert.deepEqual(evaluateCeilings({ './a': 1 }, { ceilings: [] }), ['el ancla de techos no existe o no tiene `ceilings`']);
  assert.equal(isValidCeiling(1), true);
  assert.equal(isValidCeiling(1.5), false);
});

test('TECHO/CODEX-1 — un techo invalido en el manifest NO se vuelve invisible', () => {
  /* `readCeilings` copia lo que el manifest declare, valido o no. Si filtrara,
   * el subpath desapareceria del lado vivo y el ancla lo veria como huerfano:
   * el mensaje diria "ya no le pone techo" cuando la verdad es "le puso basura". */
  const live = readCeilings({ entries: { './a': { budget: { maxSourceBytes: 'x' } } } });
  assert.deepEqual(live, { './a': 'x' });
  assert.match(evaluateCeilings(live, { ceilings: { './a': 1000 } })[0], /el techo vivo "x" no es un entero positivo/);
});

test('TECHO/CODEX-2 — un subpath NUEVO es ampliacion: exige --widen y se registra como tal', () => {
  const { root, manifest } = runtimeFixture();
  anchorCeilings(root, manifest, {});                       // ancla vacia: el vivo es TODO nuevo
  /* Subir un techo y agregar un subpath agrandan lo mismo: la superficie
   * gobernada. La version anterior solo miraba `value > anchored`, asi que un
   * subpath sin ancla previa se colaba por la puerta de bajada y quedaba
   * registrado como "decrece-solo" -- una ampliacion con la etiqueta al reves. */
  assert.throws(() => writeCeilingsBaseline({ root, reason: 'sin puerta' }),
    (error) => /me niego a AMPLIAR el ancla en 1 techo/.test(error.message)
      && /\.\/primitives\/box \(sin ancla valida, techo 1000\)/.test(error.message));
  const out = writeCeilingsBaseline({ root, reason: 'subpath nuevo revisado', widen: true });
  assert.deepEqual(out.added, ['./primitives/box']);
  assert.deepEqual(out.raised, []);
  const written = JSON.parse(fs.readFileSync(path.join(root, CEILINGS_BASELINE_RELATIVE), 'utf8'));
  assert.match(written.lastMoveKind, /ampliacion autorizada por nombre/);
  assert.match(written.lastMoveKind, /1 sin ancla valida/);
  assert.doesNotThrow(() => runPublicEntrypointGate({ root, silent: true }));
});

test('TECHO/CODEX-2 — el gate ya veia el subpath nuevo; lo que fallaba era la ESCRITURA', () => {
  // El --check nunca dejo pasar un techo sin anclar: el agujero estaba en la
  // puerta, y por eso el drill afirma las dos mitades por separado.
  assert.match(evaluateCeilings({ './b': 20 }, { ceilings: {} })[0], /\.\/b: techo 20 sin anclar/);
});

test('TECHO — el ancla vive donde la ley R3 la admite', () => {
  /* El scripts-tree-gate solo admite en una capacidad `index.mjs`, sus tests, y
   * archivos que empiecen con el nombre de la capacidad. El primer nombre que le
   * puse (`source-bytes-ceilings.baseline.json`) era R3-foreign-file y el
   * barrido lo cazo. El drill fija la convencion para que no se repita. */
  const capability = 'public-entrypoint-boundary-gate';
  const fileName = CEILINGS_BASELINE_RELATIVE.split('/').pop();
  assert.equal(CEILINGS_BASELINE_RELATIVE, `scripts/boundaries/${capability}/${fileName}`);
  assert.ok(fileName.startsWith(`${capability}.`) || fileName.startsWith(`${capability}-`),
    `${fileName} no empieza con el nombre de la capacidad: seria R3-foreign-file`);
});

test('TECHO — el gate esta CABLEADO al runner, y blocking', async () => {
  /* LA LEY NO VALE SI NADIE LA CORRE. Hasta el lote DRILL-77 este gate tenia 0
   * entradas en el gates-manifest: corria solo en `prebuild`/`prepack`, asi que
   * el "101 PASS" del barrido no era evidencia de nada suyo. El drill fija el
   * cableado, porque quitar una linea del manifest es tan facil como agregarla
   * y el barrido no bajaria de color al hacerlo -- solo dejaria de mirar. */
  const { CI_GATES } = await import('../../ci/gates-manifest/index.mjs');
  const mine = CI_GATES.filter((gate) => gate.run.join(' ').includes('public-entrypoint-boundary-gate'));
  assert.equal(mine.length, 2, 'DOS entradas: el gate y su drill; ni una sola ni duplicadas');
  assert.ok(mine.every((gate) => gate.blocking === true), 'un gate que no bloquea es un gate que no gobierna');

  const gate = mine.find((entry) => !entry.run.includes('--test'));
  const drill = mine.find((entry) => entry.run.includes('--test'));
  assert.deepEqual(gate.run, ['node', 'scripts/boundaries/public-entrypoint-boundary-gate/index.mjs']);
  assert.deepEqual(drill.run, ['node', '--test', 'scripts/boundaries/public-entrypoint-boundary-gate/index.test.mjs']);
  assert.equal(drill.id, 'public-entrypoint-boundary-drill');
  assert.equal(gate.id, 'public-entrypoint-boundary');

  /* EL DRILL ANTES QUE EL GATE, como el resto del frente: si el detector se
   * rompio, enterarse por el detector es mas barato que por el gate en verde. */
  assert.ok(CI_GATES.indexOf(drill) < CI_GATES.indexOf(gate), 'el drill corre antes que el gate');

  // Y el runner los LISTA: el manifest podria tenerlos y el runner filtrarlos.
  const { execFileSync } = await import('node:child_process');
  const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
  const listed = execFileSync(process.execPath, ['scripts/ci/runner/index.mjs', '--list'], { cwd: root, encoding: 'utf8' });
  assert.ok(listed.includes('public-entrypoint-boundary-drill'), 'el runner --list no nombra el drill');
  assert.ok(listed.includes('public-entrypoint-boundary'), 'el runner --list no nombra el gate');
});

test('TECHO/FABLE — la puerta NO lava un ancla corrupta: sin --widen no repara una subida', () => {
  /* CASO I10 (Fable). Un ancla previa INVALIDA PERO PRESENTE no era `raised`
   * --no es valida-- ni `added` --no es `undefined`--, asi que `widening` quedaba
   * vacio y la escritura pasaba sin `--widen`, etiquetada `decrece-solo`. Con el
   * techo vivo ya subido eso LAVABA la subida y `lastMoveKind` mentia.
   *
   * Y la secuencia es la via NORMAL de reparacion: el `--check` enrojece por
   * ancla corrupta, alguien corre `--write-baseline --reason "reparo el ancla"`,
   * y la subida entra por la puerta de bajada. Por eso el filtro es por VALIDEZ,
   * no por presencia. Las seis formas van enumeradas: el arreglo no se puede
   * deshacer a medias. */
  for (const corrupto of ['x', null, 0, [], {}, 10.5, NaN, -5]) {
    const { root, manifest } = runtimeFixture();
    manifest.entries['./primitives/box'].budget.maxSourceBytes = 6000;      // el vivo YA subio
    write(root, 'public-entrypoints.manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
    anchorCeilings(root, manifest, { './primitives/box': corrupto });
    assert.throws(
      () => writeCeilingsBaseline({ root, reason: 'reparo el ancla' }),
      (error) => /me niego a AMPLIAR el ancla en 1 techo/.test(error.message)
        && /\.\/primitives\/box \(sin ancla valida, techo 6000\)/.test(error.message),
      `ancla ${JSON.stringify(corrupto)} se lavo sin --widen`,
    );
    // El ancla NO se toco: una puerta que se niega no deja rastro.
    const intacta = JSON.parse(fs.readFileSync(path.join(root, CEILINGS_BASELINE_RELATIVE), 'utf8'));
    assert.deepEqual(intacta.ceilings, { './primitives/box': corrupto === undefined ? undefined : JSON.parse(JSON.stringify(corrupto)) });

    // Con la puerta pedida por nombre SI repara, y queda contado como ampliacion.
    const out = writeCeilingsBaseline({ root, reason: 'reparo el ancla, revisado', widen: true });
    assert.deepEqual(out.added, ['./primitives/box']);
    assert.deepEqual(out.raised, []);
    const escrita = JSON.parse(fs.readFileSync(path.join(root, CEILINGS_BASELINE_RELATIVE), 'utf8'));
    assert.equal(escrita.ceilings['./primitives/box'], 6000);
    assert.match(escrita.lastMoveKind, /ampliacion autorizada por nombre/);
    assert.match(escrita.lastMoveKind, /1 sin ancla valida/);
    assert.doesNotMatch(escrita.lastMoveKind, /decrece-solo/, 'lastMoveKind no puede mentir sobre lo que paso');
  }
});

test('TECHO/FABLE — el texto no llama "nuevo" a un subpath que ya existia', () => {
  const { root, manifest } = runtimeFixture();
  anchorCeilings(root, manifest, { './primitives/box': 'x' });
  assert.throws(() => writeCeilingsBaseline({ root, reason: 'r' }), /sin ancla valida/);
  assert.throws(() => writeCeilingsBaseline({ root, reason: 'r' }), (error) => !/\(nuevo,/.test(error.message));
});
