import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  CEILINGS_BASELINE_RELATIVE,
  CEILINGS_SCHEMA_VERSION,
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
  write(root, 'contracts/package/entrypoints/index.json', `${JSON.stringify(manifest, null, 2)}\n`);
  write(root, 'package.json', `${JSON.stringify({
    name: '@rottay/design-system',
    exports: {
      './primitives/box': {
        types: `./dist/${output}.d.ts`,
        import: `./dist/${output}.js`,
        require: `./dist/${output}.cjs`,
      },
      './public-entrypoints-manifest': { default: './contracts/package/entrypoints/index.json' },
    },
    files: ['contracts/package/entrypoints/index.json'],
    releaseSync: { sourceEntrypoints: { './primitives/box': source.slice(4) } },
  }, null, 2)}\n`);
  write(root, 'vite.config.ts', `
readFileSync(resolve(__dirname, 'contracts/package/entrypoints/index.json'), 'utf8');
const entry = { ...publicEntries };
const output = { preserveModules: true, preserveModulesRoot: 'src' };
`);
  write(root, source, `'use client';\nexport { Box } from '../../../../components/primitives/layout/Box';\n`);
  write(root, 'src/components/primitives/layout/Box/index.ts', 'export const Box = 1;\n');
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
  write(root, 'src/components/primitives/layout/Box/index.ts', "export { Box } from '../../index';\n");
  write(root, 'src/components/primitives/index.ts', 'export const Box = 1;\n');
  assert.throws(
    () => runPublicEntrypointGate({ root, silent: true }),
      /forbidden root\/tier barrel src\/components\/primitives\/index\.ts/,
  );
});

test('rejects reachable fan-out above the reviewed ceiling', () => {
  const { root, manifest } = runtimeFixture();
  manifest.entries['./primitives/box'].budget.maxReachableModules = 1;
  write(root, 'contracts/package/entrypoints/index.json', `${JSON.stringify(manifest, null, 2)}\n`);
  assert.throws(
    () => runPublicEntrypointGate({ root, silent: true }),
    /reachable fan-out 2 exceeds 1/,
  );
});

test('rejects source bytes above the reviewed ceiling', () => {
  const { root, manifest } = runtimeFixture();
  manifest.entries['./primitives/box'].budget.maxSourceBytes = 1;
  write(root, 'contracts/package/entrypoints/index.json', `${JSON.stringify(manifest, null, 2)}\n`);
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
  write(root, 'contracts/package/entrypoints/index.json', `${JSON.stringify(manifest, null, 2)}\n`);
  anchorCeilings(root, manifest);
  write(root, entry.source, `'use client';\nexport type { BoxProps } from '../../../../components/primitives/layout/Box/contracts';\n`);
  write(root, 'src/components/primitives/layout/Box/contracts/index.ts', 'export interface BoxProps {}\n');
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
  assert.deepEqual(evaluateCeilings({ './a': 10 }, { schemaVersion: 1, ceilings: { './a': 10 } }), []);
  const nuevo = evaluateCeilings({ './a': 10, './b': 20 }, { schemaVersion: 1, ceilings: { './a': 10 } });
  assert.equal(nuevo.length, 1);
  assert.match(nuevo[0], /\.\/b: techo 20 sin anclar/);
  assert.match(nuevo[0], /entra por revision, no por omision/);
  const huerfano = evaluateCeilings({ './a': 10 }, { schemaVersion: 1, ceilings: { './a': 10, './z': 5 } });
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
  const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../../..');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'contracts/package/entrypoints/index.json'), 'utf8'));
  const baseline = JSON.parse(fs.readFileSync(path.join(root, CEILINGS_BASELINE_RELATIVE), 'utf8'));
  const live = readCeilings(manifest);
  assert.equal(Object.keys(live).length, 77, 'los 77 subpaths del asiento E-2, medidos');
  assert.deepEqual(evaluateCeilings(live, baseline), []);
  // Los 18 de la ampliacion E-2 salen de su propio tag en el manifest, no de una lista a mano.
  const tagged = Object.entries(manifest.entries).filter(([, entry]) => entry.budgetNote).map(([subpath]) => subpath);
  assert.equal(tagged.length, 18);
  assert.deepEqual(baseline.consolidationCandidates, tagged.sort());
});

/* ── los dos defectos que encontro independent code audit, drilleados para que no vuelvan ──── */

test('TECHO/CORRUPTION — un ancla CORRUPTA no pasa en silencio, en ninguna de sus formas', () => {
  /* La primera version comparaba con `>` y `<` sin validar la forma, y en JS las
   * dos comparaciones son FALSAS contra un string, un array, un objeto o NaN:
   * el ancla rota daba cero errores. Cada forma va nombrada para que el arreglo
   * no se pueda deshacer sin que algo enrojezca. */
  for (const corrupto of ['not-a-number', null, [1000], {}, NaN, Infinity, -5, 10.5, 0, true]) {
    const failures = evaluateCeilings({ './a': 1000 }, { schemaVersion: 1, ceilings: { './a': corrupto } });
    assert.equal(failures.length, 1, `ancla ${JSON.stringify(corrupto)} paso en silencio`);
    assert.match(failures[0], /el techo anclado .* no es un entero positivo/);
  }
  // Y del lado VIVO igual: un manifest con basura tampoco se compara.
  for (const corrupto of ['x', null, NaN, -5, 10.5, 0]) {
    const failures = evaluateCeilings({ './a': corrupto }, { schemaVersion: 1, ceilings: { './a': 1000 } });
    assert.equal(failures.length, 1, `vivo ${JSON.stringify(corrupto)} paso en silencio`);
    assert.match(failures[0], /el techo vivo .* no es un entero positivo/);
  }
  // Un ancla huerfana Y corrupta se nombra por las dos cosas, no por una.
  assert.match(evaluateCeilings({}, { schemaVersion: 1, ceilings: { './z': 'x' } })[0], /ni siquiera es un techo/);
  // `ceilings` como array es corrupcion de la raiz, no un mapa vacio.
  assert.deepEqual(evaluateCeilings({ './a': 1 }, { schemaVersion: 1, ceilings: [] }), ['el ancla de techos no existe o no tiene `ceilings`']);
  assert.equal(isValidCeiling(1), true);
  assert.equal(isValidCeiling(1.5), false);
});

test('TECHO/CORRUPTION — un techo invalido en el manifest NO se vuelve invisible', () => {
  /* `readCeilings` copia lo que el manifest declare, valido o no. Si filtrara,
   * el subpath desapareceria del lado vivo y el ancla lo veria como huerfano:
   * el mensaje diria "ya no le pone techo" cuando la verdad es "le puso basura". */
  const live = readCeilings({ entries: { './a': { budget: { maxSourceBytes: 'x' } } } });
  assert.deepEqual(live, { './a': 'x' });
  assert.match(evaluateCeilings(live, { schemaVersion: 1, ceilings: { './a': 1000 } })[0], /el techo vivo "x" no es un entero positivo/);
});

test('TECHO/NEW-SUBPATH — un subpath NUEVO es ampliacion: exige --widen y se registra como tal', () => {
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

test('TECHO/NEW-SUBPATH — el gate ya veia el subpath nuevo; lo que fallaba era la ESCRITURA', () => {
  // El --check nunca dejo pasar un techo sin anclar: el agujero estaba en la
  // puerta, y por eso el drill afirma las dos mitades por separado.
  assert.match(evaluateCeilings({ './b': 20 }, { schemaVersion: 1, ceilings: {} })[0], /\.\/b: techo 20 sin anclar/);
});

test('TECHO — el ancla vive en un subdominio folder-index declarativo', () => {
  const expected = 'scripts/check/boundaries/public-api/ceilings/index.json';
  assert.equal(CEILINGS_BASELINE_RELATIVE, expected);
  assert.equal(path.basename(CEILINGS_BASELINE_RELATIVE), 'index.json');
  assert.equal(path.basename(path.dirname(CEILINGS_BASELINE_RELATIVE)), 'ceilings');
});

test('TECHO — el gate esta CABLEADO al runner, y blocking', async () => {
  /* LA LEY NO VALE SI NADIE LA CORRE. Hasta el lote DRILL-77 este gate tenia 0
   * entradas en el gates-manifest: corria solo en `prebuild`/`prepack`, asi que
   * el "101 PASS" del barrido no era evidencia de nada suyo. El drill fija el
   * cableado, porque quitar una linea del manifest es tan facil como agregarla
   * y el barrido no bajaria de color al hacerlo -- solo dejaria de mirar. */
  const { CI_GATES } = await import('../../automation/gates/manifest/index.mjs');
  const mine = CI_GATES.filter((gate) => gate.run.join(' ').includes('boundaries/public-api'));
  assert.equal(mine.length, 2, 'DOS entradas: el gate y su drill; ni una sola ni duplicadas');
  assert.ok(mine.every((gate) => gate.blocking === true), 'un gate que no bloquea es un gate que no gobierna');

  const gate = mine.find((entry) => !entry.run.includes('--test'));
  const drill = mine.find((entry) => entry.run.includes('--test'));
  assert.deepEqual(gate.run, ['node', 'scripts/check/boundaries/public-api/index.mjs']);
  assert.deepEqual(drill.run, ['node', '--test', 'scripts/check/boundaries/public-api/index.test.mjs']);
  assert.equal(drill.id, 'public-entrypoint-boundary-drill');
  assert.equal(gate.id, 'public-entrypoint-boundary');

  /* EL DRILL ANTES QUE EL GATE, como el resto del frente: si el detector se
   * rompio, enterarse por el detector es mas barato que por el gate en verde. */
  assert.ok(CI_GATES.indexOf(drill) < CI_GATES.indexOf(gate), 'el drill corre antes que el gate');

  // Y el runner los LISTA: el manifest podria tenerlos y el runner filtrarlos.
  const { execFileSync } = await import('node:child_process');
  const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../../..');
  const listed = execFileSync(process.execPath, ['scripts/check/automation/runner/index.mjs', '--list'], { cwd: root, encoding: 'utf8' });
  assert.ok(listed.includes('public-entrypoint-boundary-drill'), 'el runner --list no nombra el drill');
  assert.ok(listed.includes('public-entrypoint-boundary'), 'el runner --list no nombra el gate');
});

test('TECHO/WRITE-GUARD — la puerta NO lava un ancla corrupta: sin --widen no repara una subida', () => {
  /* CASO I10 (independent audit). Un ancla previa INVALIDA PERO PRESENTE no era `raised`
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
    write(root, 'contracts/package/entrypoints/index.json', `${JSON.stringify(manifest, null, 2)}\n`);
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

test('TECHO/WRITE-GUARD — el texto no llama "nuevo" a un subpath que ya existia', () => {
  const { root, manifest } = runtimeFixture();
  anchorCeilings(root, manifest, { './primitives/box': 'x' });
  assert.throws(() => writeCeilingsBaseline({ root, reason: 'r' }), /sin ancla valida/);
  assert.throws(() => writeCeilingsBaseline({ root, reason: 'r' }), (error) => !/\(nuevo,/.test(error.message));
});

/* ── el schemaVersion del ancla se verifica, en las DOS rutas ─────────────── */

/** Escribe un ancla valida salvo por su `schemaVersion`. */
function anchorWithSchema(root, manifest, schemaVersion) {
  const ceilings = Object.fromEntries(
    Object.entries(manifest.entries).map(([subpath, entry]) => [subpath, entry.budget.maxSourceBytes]),
  );
  const doc = { law: 'fixture', ceilings };
  if (schemaVersion !== undefined) doc.schemaVersion = schemaVersion;
  write(root, CEILINGS_BASELINE_RELATIVE, `${JSON.stringify(doc, null, 2)}\n`);
}

test('SCHEMA — un ancla con schemaVersion ausente, null o desconocido NO se compara', () => {
  /* El archivo declaraba `schemaVersion: 1` desde que nacio y no lo leia nadie.
   * Un campo de version que no se comprueba no versiona nada: la primera vez que
   * el formato cambie de verdad, el gate leera un archivo de otra forma creyendo
   * que entiende lo que dice. Se compara con `===`, asi que el string "1"
   * tampoco pasa -- un numero serializado como texto ES una discrepancia de
   * formato, y es justo lo que este campo existe para atrapar. */
  for (const schemaVersion of [undefined, null, 999, '1', 0, 2, true]) {
    const failures = evaluateCeilings({ './a': 1000 }, { schemaVersion, ceilings: { './a': 1000 } });
    assert.equal(failures.length, 1, `schemaVersion ${JSON.stringify(schemaVersion)} paso en silencio`);
    assert.match(failures[0], /schemaVersion .* y este gate lee la version 1/);
    assert.match(failures[0], /no se compara un archivo cuyo formato no se entiende/);
  }
  // Y la version correcta no estorba: sin desvio, cero fallos.
  assert.deepEqual(evaluateCeilings({ './a': 1000 }, { schemaVersion: 1, ceilings: { './a': 1000 } }), []);
  assert.equal(CEILINGS_SCHEMA_VERSION, 1);
});

test('SCHEMA — el gate falla cerrado sobre un arbol real con el ancla de otra version', () => {
  for (const schemaVersion of [undefined, null, 999]) {
    const { root, manifest } = runtimeFixture();
    anchorWithSchema(root, manifest, schemaVersion);
    assert.throws(
      () => runPublicEntrypointGate({ root, silent: true }),
      /\[techo\] el ancla declara schemaVersion .* y este gate lee la version 1/,
      `schemaVersion ${JSON.stringify(schemaVersion)} no freno el gate`,
    );
  }
});

test('SCHEMA — la ruta --write-baseline tambien: no se re-ancla sobre un formato ajeno', () => {
  /* La escritura importa tanto como la lectura: `previous` se esparce al
   * documento nuevo, asi que un ancla de otro formato se propagaria intacta, y
   * ademas `raised`/`added` se calculan contra ella. Reparar sobre un archivo
   * que no se entiende no es reparar. */
  for (const schemaVersion of [undefined, null, 999]) {
    const { root, manifest } = runtimeFixture();
    anchorWithSchema(root, manifest, schemaVersion);
    assert.throws(
      () => writeCeilingsBaseline({ root, reason: 'reparo el ancla', widen: true }),
      /schemaVersion .* y este gate escribe la version 1/,
      `schemaVersion ${JSON.stringify(schemaVersion)} dejo escribir`,
    );
    // Y no dejo rastro: el ancla ajena queda tal cual estaba.
    const intacta = JSON.parse(fs.readFileSync(path.join(root, CEILINGS_BASELINE_RELATIVE), 'utf8'));
    assert.equal(intacta.schemaVersion ?? null, schemaVersion ?? null);
  }
});

test('SCHEMA — el documento escrito lleva SIEMPRE la version que el gate entiende', () => {
  const { root, manifest } = runtimeFixture();
  anchorCeilings(root, manifest, { './primitives/box': 1200 });          // baja: no necesita --widen
  writeCeilingsBaseline({ root, reason: 'el grafo adelgazo' });
  const written = JSON.parse(fs.readFileSync(path.join(root, CEILINGS_BASELINE_RELATIVE), 'utf8'));
  assert.equal(written.schemaVersion, CEILINGS_SCHEMA_VERSION);
});

test('SCHEMA — el ancla REAL declara la version que el gate lee', () => {
  const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../../..');
  const baseline = JSON.parse(fs.readFileSync(path.join(root, CEILINGS_BASELINE_RELATIVE), 'utf8'));
  assert.equal(baseline.schemaVersion, CEILINGS_SCHEMA_VERSION);
  assert.equal(Object.keys(baseline.ceilings).length, 77, 'los 77 techos, intactos');
});
