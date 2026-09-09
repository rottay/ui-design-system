import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  BUDGET_FIELDS,
  CEILINGS_BASELINE_RELATIVE,
  CEILINGS_ROOT_KEYS,
  CEILINGS_SCHEMA_VERSION,
  GOVERNED_BUDGET_DIMENSIONS,
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

/** Un techo completo: las dos dimensiones gobernadas, para no repetir la forma. */
function ceiling(maxReachableModules, maxSourceBytes) {
  return { maxReachableModules, maxSourceBytes };
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

/** Reescribe el manifest sintetico tras mutarlo en un drill. */
function rewriteManifest(root, manifest) {
  write(root, 'contracts/package/entrypoints/index.json', `${JSON.stringify(manifest, null, 2)}\n`);
}

/** Ancla los techos de un manifest sintetico: el gate falla cerrado sin ancla. */
function anchorCeilings(root, manifest, override = null, extraRoot = null) {
  const ceilings = override ?? Object.fromEntries(
    Object.entries(manifest.entries).map(([subpath, entry]) => [
      subpath,
      Object.fromEntries(GOVERNED_BUDGET_DIMENSIONS.map((dimension) => [dimension, entry.budget[dimension]])),
    ]),
  );
  const doc = { schemaVersion: CEILINGS_SCHEMA_VERSION, law: 'fixture', ceilings, ...(extraRoot ?? {}) };
  write(root, CEILINGS_BASELINE_RELATIVE, `${JSON.stringify(doc, null, 2)}\n`);
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
  rewriteManifest(root, manifest);
  anchorCeilings(root, manifest);
  assert.throws(
    () => runPublicEntrypointGate({ root, silent: true }),
    /reachable fan-out 2 exceeds 1/,
  );
});

test('rejects source bytes above the reviewed ceiling', () => {
  const { root, manifest } = runtimeFixture();
  manifest.entries['./primitives/box'].budget.maxSourceBytes = 1;
  rewriteManifest(root, manifest);
  anchorCeilings(root, manifest);
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
  rewriteManifest(root, manifest);
  anchorCeilings(root, manifest);
  write(root, entry.source, `'use client';\nexport type { BoxProps } from '../../../../components/primitives/layout/Box/contracts';\n`);
  write(root, 'src/components/primitives/layout/Box/contracts/index.ts', 'export interface BoxProps {}\n');
  assert.throws(
    () => runPublicEntrypointGate({ root, silent: true }),
    /non-client boundary must remain directive-free/,
  );
});

/* ── DRILL-77 + C2: los DOS techos son decrece-solo, y ahora mecanicamente ── */

test('TECHO — un techo de BYTES que SUBE falla, y el mensaje manda adelgazar el grafo, no el ancla', () => {
  const { root, manifest } = runtimeFixture();
  anchorCeilings(root, manifest, { './primitives/box': ceiling(3, 900) });
  assert.throws(
    () => runPublicEntrypointGate({ root, silent: true }),
    (error) => /\[techo\] \.\/primitives\/box \[maxSourceBytes\]: techo 900 -> 1000 SUBIO/.test(error.message)
      && /se adelgaza el grafo, no el ancla/.test(error.message)
      && /--widen --reason/.test(error.message),
  );
});

test('TECHO/MODULOS — el defecto que este lote cierra: una AMPLIACION DE MODULOS sin autorizar FALLA', () => {
  /* Este era el agujero real. El ancla gobernaba `maxSourceBytes` y NADA MAS, asi
   * que `maxReachableModules` podia subir con el ancla en verde: el C2 movio
   * `./runtime/visual-authority` de 6 a 8 modulos y el gate no tuvo nada que
   * decir. El drill fija que ahora SI lo dice, y que lo dice por su nombre. */
  const { root, manifest } = runtimeFixture();
  anchorCeilings(root, manifest, { './primitives/box': ceiling(2, 1000) });
  assert.throws(
    () => runPublicEntrypointGate({ root, silent: true }),
    (error) => /\[techo\] \.\/primitives\/box \[maxReachableModules\]: techo 2 -> 3 SUBIO/.test(error.message)
      && /--widen --reason/.test(error.message)
      /* Y NO arrastra la otra dimension: los bytes no se movieron. */
      && !/maxSourceBytes/.test(error.message.split('\n').filter((line) => line.includes('SUBIO')).join('\n')),
  );
});

test('TECHO/MODULOS — la puerta de escritura tampoco deja pasar una ampliacion de modulos sin --widen', () => {
  const { root, manifest } = runtimeFixture();
  anchorCeilings(root, manifest, { './primitives/box': ceiling(2, 1000) });
  assert.throws(
    () => writeCeilingsBaseline({ root, reason: 'sin puerta' }),
    (error) => /me niego a AMPLIAR el ancla en 1 techo/.test(error.message)
      && /\.\/primitives\/box \[maxReachableModules\] \(2 -> 3\)/.test(error.message),
  );
  // El ancla no se toco: una puerta que se niega no deja rastro.
  const intacta = JSON.parse(fs.readFileSync(path.join(root, CEILINGS_BASELINE_RELATIVE), 'utf8'));
  assert.deepEqual(intacta.ceilings['./primitives/box'], ceiling(2, 1000));
});

test('TECHO/AMBAS — una ampliacion autorizada REGISTRA LAS DOS DIMENSIONES, movidas o no', () => {
  /* El informe del C2 dijo que los modulos "seguian en 8" cuando habian pasado de
   * 6 a 8. Un resumen que solo nombra lo que se movio deja al lector sin saber si
   * la otra dimension se reviso o ni siquiera se mira: `lastMoveKind` nombra las
   * dos SIEMPRE, con su conteo, y el drill lo afirma en los dos casos. */
  const { root, manifest } = runtimeFixture();
  anchorCeilings(root, manifest, { './primitives/box': ceiling(2, 900) });     // las DOS suben
  const out = writeCeilingsBaseline({ root, reason: 'ampliacion medida de prueba', widen: true });
  assert.deepEqual(out.dimensions, ['maxReachableModules', 'maxSourceBytes']);
  assert.deepEqual(out.raised, [
    { subpath: './primitives/box', dimension: 'maxReachableModules', from: 2, to: 3 },
    { subpath: './primitives/box', dimension: 'maxSourceBytes', from: 900, to: 1000 },
  ]);
  assert.deepEqual(out.added, []);
  const written = JSON.parse(fs.readFileSync(path.join(root, CEILINGS_BASELINE_RELATIVE), 'utf8'));
  assert.deepEqual(written.ceilings['./primitives/box'], ceiling(3, 1000));
  assert.equal(written.lastMove, 'ampliacion medida de prueba');
  assert.equal(
    written.lastMoveKind,
    'ampliacion autorizada por nombre (--widen) — maxReachableModules: 1 subido(s), 0 sin ancla valida; '
    + 'maxSourceBytes: 1 subido(s), 0 sin ancla valida',
  );
  assert.doesNotThrow(() => runPublicEntrypointGate({ root, silent: true }));
});

test('TECHO/AMBAS — la dimension QUIETA tambien queda nombrada, con su cero', () => {
  const { root, manifest } = runtimeFixture();
  anchorCeilings(root, manifest, { './primitives/box': ceiling(3, 900) });     // solo suben los bytes
  const out = writeCeilingsBaseline({ root, reason: 'solo bytes', widen: true });
  assert.deepEqual(out.raised, [{ subpath: './primitives/box', dimension: 'maxSourceBytes', from: 900, to: 1000 }]);
  const written = JSON.parse(fs.readFileSync(path.join(root, CEILINGS_BASELINE_RELATIVE), 'utf8'));
  assert.match(written.lastMoveKind, /maxReachableModules: 0 subido\(s\), 0 sin ancla valida/);
  assert.match(written.lastMoveKind, /maxSourceBytes: 1 subido\(s\), 0 sin ancla valida/);
});

test('TECHO — un techo que BAJA tambien falla, con la instruccion de bajar el ancla', () => {
  const { root, manifest } = runtimeFixture();
  anchorCeilings(root, manifest, { './primitives/box': ceiling(4, 1200) });
  const failures = evaluateCeilings(readCeilings(manifest), JSON.parse(fs.readFileSync(path.join(root, CEILINGS_BASELINE_RELATIVE), 'utf8')));
  assert.equal(failures.length, 2, 'las dos dimensiones bajaron: dos fallos, uno por dimension');
  assert.throws(
    () => runPublicEntrypointGate({ root, silent: true }),
    (error) => /\[techo\] \.\/primitives\/box \[maxSourceBytes\]: techo 1200 -> 1000 bajo/.test(error.message)
      && /\[techo\] \.\/primitives\/box \[maxReachableModules\]: techo 4 -> 3 bajo/.test(error.message)
      && /MISMO commit/.test(error.message),
  );
});

test('TECHO — ancla ausente o corrupta: FALLA CERRADO', () => {
  const { root } = runtimeFixture();
  fs.rmSync(path.join(root, CEILINGS_BASELINE_RELATIVE));
  assert.throws(() => runPublicEntrypointGate({ root, silent: true }), /el ancla de techos no existe/);
  write(root, CEILINGS_BASELINE_RELATIVE, `{"schemaVersion":${CEILINGS_SCHEMA_VERSION}}\n`);
  assert.throws(() => runPublicEntrypointGate({ root, silent: true }), /no tiene `ceilings`/);
  // Y sin `ceilings` valido no se aprueba por defecto ni con el manifest intacto.
  assert.deepEqual(evaluateCeilings({ './a': ceiling(1, 1) }, null), ['el ancla de techos no existe o no tiene `ceilings`']);
});

test('TECHO — los desacuerdos de CONJUNTO se ven, no solo los de valor', () => {
  const anchor = (ceilings) => ({ schemaVersion: CEILINGS_SCHEMA_VERSION, ceilings });
  assert.deepEqual(evaluateCeilings({ './a': ceiling(2, 10) }, anchor({ './a': ceiling(2, 10) })), []);

  const nuevo = evaluateCeilings({ './a': ceiling(2, 10), './b': ceiling(4, 20) }, anchor({ './a': ceiling(2, 10) }));
  assert.equal(nuevo.length, 1);
  assert.match(nuevo[0], /\.\/b: techos maxReachableModules=4 maxSourceBytes=20 sin anclar/);
  assert.match(nuevo[0], /entra por revision, no por omision/);

  const huerfano = evaluateCeilings({ './a': ceiling(2, 10) }, anchor({ './a': ceiling(2, 10), './z': ceiling(1, 5) }));
  assert.deepEqual(huerfano, ['./z: el ancla lo declara y el manifest ya no le pone techo']);

  // Una DIMENSION que el ancla no cubre es tan "sin anclar" como un subpath entero.
  const media = evaluateCeilings({ './a': ceiling(2, 10) }, anchor({ './a': { maxSourceBytes: 10 } }));
  assert.equal(media.length, 1);
  assert.match(media[0], /\.\/a \[maxReachableModules\]: techo 2 sin anclar/);
  assert.match(media[0], /una dimension nueva entra por revision, no por omision/);

  // Y una dimension que el MANIFEST dejo de declarar tampoco se compara en silencio.
  const sinDeclarar = evaluateCeilings({ './a': { maxSourceBytes: 10 } }, anchor({ './a': ceiling(2, 10) }));
  assert.equal(sinDeclarar.length, 1);
  assert.match(sinDeclarar[0], /\.\/a \[maxReachableModules\]: el manifest ya no declara la dimension/);
});

test('TECHO — la PUERTA: subir exige --widen; bajar exige razon; sin razon no se escribe', () => {
  const { root, manifest } = runtimeFixture();
  anchorCeilings(root, manifest, { './primitives/box': ceiling(3, 900) });     // el vivo (1000 B) SUBE
  assert.throws(() => writeCeilingsBaseline({ root, reason: null }), /exige --reason/);
  assert.throws(() => writeCeilingsBaseline({ root, reason: 'porque si' }),
    (error) => /me niego a AMPLIAR el ancla en 1 techo/.test(error.message)
      && /\.\/primitives\/box \[maxSourceBytes\] \(900 -> 1000\)/.test(error.message)
      && /--widen --reason/.test(error.message));
  const out = writeCeilingsBaseline({ root, reason: 'ampliacion autorizada de prueba', widen: true });
  assert.deepEqual(out.raised.map((move) => move.dimension), ['maxSourceBytes']);
  assert.deepEqual(out.added, []);
  const written = JSON.parse(fs.readFileSync(path.join(root, CEILINGS_BASELINE_RELATIVE), 'utf8'));
  assert.deepEqual(written.ceilings['./primitives/box'], ceiling(3, 1000));
  assert.equal(written.lastMove, 'ampliacion autorizada de prueba');
  assert.match(written.lastMoveKind, /ampliacion autorizada por nombre/);
  assert.doesNotThrow(() => runPublicEntrypointGate({ root, silent: true }));
});

test('TECHO — bajar NO necesita --widen, y se registra como decrece-solo con las dos dimensiones', () => {
  const { root, manifest } = runtimeFixture();
  anchorCeilings(root, manifest, { './primitives/box': ceiling(4, 1200) });    // el vivo BAJA en las dos
  const out = writeCeilingsBaseline({ root, reason: 'el grafo adelgazo' });
  assert.deepEqual(out.raised, []);
  assert.deepEqual(out.added, []);
  const written = JSON.parse(fs.readFileSync(path.join(root, CEILINGS_BASELINE_RELATIVE), 'utf8'));
  assert.deepEqual(written.ceilings['./primitives/box'], ceiling(3, 1000));
  assert.equal(
    written.lastMoveKind,
    'decrece-solo — maxReachableModules: 0 subido(s), 0 sin ancla valida; maxSourceBytes: 0 subido(s), 0 sin ancla valida',
  );
});

/* ── nada que el gate no lea vive en el ancla ni en el presupuesto ────────── */

test('RAIZ-CERRADA — una clave de raiz DESCONOCIDA falla; no se ignora', () => {
  /* El defecto es literal y estaba en el arbol: el ancla llevaba
   * `"./runtime/visual-authority": 47190` colgando de la raiz, al lado de
   * `ceilings`, con la forma exacta de un techo y sin ningun lector. Un numero
   * con pinta de ley que nadie compara es peor que no tenerlo, porque un
   * revisor lo lee como si gobernara. */
  const { root, manifest } = runtimeFixture();
  anchorCeilings(root, manifest, null, { './runtime/visual-authority': 47190 });
  assert.throws(
    () => runPublicEntrypointGate({ root, silent: true }),
    (error) => /\[techo\] clave de raiz desconocida "\.\/runtime\/visual-authority"/.test(error.message)
      && /el gate no la lee, asi que no gobierna nada/.test(error.message),
  );
  // Cualquier campo decorativo cae igual, no solo el que tiene forma de techo.
  const conBasura = evaluateCeilings(
    { './a': ceiling(2, 10) },
    { schemaVersion: CEILINGS_SCHEMA_VERSION, ceilings: { './a': ceiling(2, 10) }, notas: 'inerte' },
  );
  assert.equal(conBasura.length, 1);
  assert.match(conBasura[0], /clave de raiz desconocida "notas"/);
  // Y las claves declaradas NO estorban: el conjunto cerrado es el que se usa.
  const completa = { schemaVersion: CEILINGS_SCHEMA_VERSION, ceilings: { './a': ceiling(2, 10) } };
  for (const key of CEILINGS_ROOT_KEYS) if (!(key in completa)) completa[key] = key === 'consolidationCandidates' ? [] : 'x';
  assert.deepEqual(evaluateCeilings({ './a': ceiling(2, 10) }, completa), []);
});

test('RAIZ-CERRADA — la ESCRITURA tampoco lava una clave fantasma', () => {
  /* Si la puerta re-anclara encima, el campo desapareceria sin que nadie lo
   * hubiera decidido: el `--check` enrojece, el operador re-ancla, y el diff ya
   * no muestra que ahi habia una ley falsa. Se nombra y se para. */
  const { root, manifest } = runtimeFixture();
  anchorCeilings(root, manifest, null, { './runtime/visual-authority': 47190 });
  assert.throws(
    () => writeCeilingsBaseline({ root, reason: 'reparo', widen: true }),
    (error) => /clave\(s\) de raiz que este gate no lee/.test(error.message)
      && /"\.\/runtime\/visual-authority"/.test(error.message)
      && /re-anclar encima las lavaria/.test(error.message),
  );
  const intacta = JSON.parse(fs.readFileSync(path.join(root, CEILINGS_BASELINE_RELATIVE), 'utf8'));
  assert.equal(intacta['./runtime/visual-authority'], 47190, 'la puerta que se niega no toca el archivo');
});

test('RAIZ-CERRADA — una DIMENSION desconocida dentro de un techo tampoco se ignora', () => {
  const failures = evaluateCeilings(
    { './a': ceiling(2, 10) },
    { schemaVersion: CEILINGS_SCHEMA_VERSION, ceilings: { './a': { ...ceiling(2, 10), maxSourceBytes_: 99 } } },
  );
  assert.equal(failures.length, 1);
  assert.match(failures[0], /\.\/a: dimension desconocida "maxSourceBytes_" en el ancla/);
  assert.match(failures[0], /las dimensiones gobernadas son maxReachableModules, maxSourceBytes/);
});

test('PRESUPUESTO-CERRADO — un `budget` con campo de mas, o al que le falta una dimension, FALLA', () => {
  /* `graph.files.length > undefined` es `false` en JavaScript: un budget sin
   * `maxReachableModules` pasaba su propio techo en silencio, un nivel por
   * debajo del ancla. Las dos formas van drilleadas. */
  for (const mutacion of [
    { drop: 'maxReachableModules', match: /budget\.maxReachableModules null is not a positive integer/ },
    { drop: 'maxSourceBytes', match: /budget\.maxSourceBytes null is not a positive integer/ },
    { drop: 'maxDirectSources', match: /budget\.maxDirectSources null is not a positive integer/ },
  ]) {
    const { root, manifest } = runtimeFixture();
    delete manifest.entries['./primitives/box'].budget[mutacion.drop];
    rewriteManifest(root, manifest);
    assert.throws(() => runPublicEntrypointGate({ root, silent: true }), mutacion.match, `falto ${mutacion.drop} y paso`);
  }
  const { root, manifest } = runtimeFixture();
  manifest.entries['./primitives/box'].budget.maxSourceBytes_ = 9999;
  rewriteManifest(root, manifest);
  assert.throws(
    () => runPublicEntrypointGate({ root, silent: true }),
    /budget declares unknown field "maxSourceBytes_"; the governed fields are maxDirectSources, maxReachableModules, maxSourceBytes/,
  );
  assert.deepEqual([...BUDGET_FIELDS], ['maxDirectSources', 'maxReachableModules', 'maxSourceBytes']);
});

test('TECHO — el arbol REAL esta en su ancla, techo por techo y dimension por dimension', () => {
  const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../../..');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'contracts/package/entrypoints/index.json'), 'utf8'));
  const baseline = JSON.parse(fs.readFileSync(path.join(root, CEILINGS_BASELINE_RELATIVE), 'utf8'));
  const live = readCeilings(manifest);
  // 77 -> 76 (WO-CAN-04): `./surfaces/oauth-transition` left the package with
  // the surface it published. Decrece-solo, como los dos techos que gobierna.
  assert.equal(Object.keys(live).length, 76, 'los 76 subpaths del asiento E-2, medidos');
  assert.deepEqual(evaluateCeilings(live, baseline), []);
  // Cada techo real cubre las DOS dimensiones: ni una entrada a medias.
  for (const [subpath, anchored] of Object.entries(baseline.ceilings)) {
    assert.deepEqual(Object.keys(anchored).sort(), [...GOVERNED_BUDGET_DIMENSIONS].sort(), `${subpath} no ancla las dos dimensiones`);
  }
  // Los 18 de la ampliacion E-2 salen de su propio tag en el manifest, no de una lista a mano.
  const tagged = Object.entries(manifest.entries).filter(([, entry]) => entry.budgetNote).map(([subpath]) => subpath);
  assert.equal(tagged.length, 18);
  assert.deepEqual(baseline.consolidationCandidates, tagged.sort());
});

test('C2/EXACTO — el techo de `./runtime/visual-authority` es el grafo MEDIDO, no holgura', () => {
  /* El lote C2 movio este subpath en las DOS dimensiones y el informe dijo que
   * los modulos no se habian movido. Aqui queda clavado lo que de verdad mide el
   * gate, para que la proxima diferencia se vea contra un numero y no contra una
   * frase.
   *
   * 62115 -> 63931 (WO-CON-06): `TenantThemeArtifact` gana el metadato de
   * procedencia serializado, y el verificador de mount valida su forma y lo
   * mete en el digest que recomputa. Los modulos NO se mueven: el duenio del
   * ledger no se importa aqui a proposito, porque un vocabulario que este lado
   * recomputara seria un vocabulario que un transporte podria falsificar. */
  const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../../..');
  const [report] = runPublicEntrypointGate({ root, silent: true })
    .filter((entry) => entry.subpath === './runtime/visual-authority');
  assert.deepEqual(
    { reachableModules: report.reachableModules, sourceBytes: report.sourceBytes },
    { reachableModules: 9, sourceBytes: 63931 },
  );
  const baseline = JSON.parse(fs.readFileSync(path.join(root, CEILINGS_BASELINE_RELATIVE), 'utf8'));
  assert.deepEqual(baseline.ceilings['./runtime/visual-authority'], ceiling(9, 63931), 'el ancla es el valor medido, sin holgura');
});

/* ── los defectos que encontro independent code audit, drilleados ─────────── */

test('TECHO/CORRUPTION — un ancla CORRUPTA no pasa en silencio, en ninguna de sus formas', () => {
  /* La primera version comparaba con `>` y `<` sin validar la forma, y en JS las
   * dos comparaciones son FALSAS contra un string, un array, un objeto o NaN:
   * el ancla rota daba cero errores. Cada forma va nombrada para que el arreglo
   * no se pueda deshacer sin que algo enrojezca. */
  for (const corrupto of ['not-a-number', null, [1000], {}, NaN, Infinity, -5, 10.5, 0, true]) {
    const failures = evaluateCeilings(
      { './a': ceiling(2, 1000) },
      { schemaVersion: CEILINGS_SCHEMA_VERSION, ceilings: { './a': { maxReachableModules: 2, maxSourceBytes: corrupto } } },
    );
    assert.equal(failures.length, 1, `ancla ${JSON.stringify(corrupto)} paso en silencio`);
    assert.match(failures[0], /\[maxSourceBytes\]: el techo anclado .* no es un entero positivo/);
  }
  // Del lado VIVO igual: un manifest con basura tampoco se compara.
  for (const corrupto of ['x', null, NaN, -5, 10.5, 0]) {
    const failures = evaluateCeilings(
      { './a': { maxReachableModules: corrupto, maxSourceBytes: 1000 } },
      { schemaVersion: CEILINGS_SCHEMA_VERSION, ceilings: { './a': ceiling(2, 1000) } },
    );
    assert.equal(failures.length, 1, `vivo ${JSON.stringify(corrupto)} paso en silencio`);
    assert.match(failures[0], /\[maxReachableModules\]: el techo vivo .* no es un entero positivo/);
  }
  // Un techo entero que ni siquiera es un registro se nombra por eso, no por sus dimensiones.
  const escalar = evaluateCeilings({ './a': ceiling(2, 10) }, { schemaVersion: CEILINGS_SCHEMA_VERSION, ceilings: { './a': 10 } });
  assert.equal(escalar.length, 1);
  assert.match(escalar[0], /el ancla lo declara como 10 y no como un registro/);
  // Un ancla huerfana Y corrupta se nombra por las dos cosas, no por una.
  assert.match(evaluateCeilings({}, { schemaVersion: CEILINGS_SCHEMA_VERSION, ceilings: { './z': 'x' } })[0], /ni siquiera es un techo/);
  // `ceilings` como array es corrupcion de la raiz, no un mapa vacio.
  assert.deepEqual(
    evaluateCeilings({ './a': ceiling(1, 1) }, { schemaVersion: CEILINGS_SCHEMA_VERSION, ceilings: [] }),
    ['el ancla de techos no existe o no tiene `ceilings`'],
  );
  assert.equal(isValidCeiling(1), true);
  assert.equal(isValidCeiling(1.5), false);
});

test('TECHO/CORRUPTION — un techo invalido en el manifest NO se vuelve invisible', () => {
  /* `readCeilings` copia lo que el manifest declare, valido o no. Si filtrara,
   * el subpath desapareceria del lado vivo y el ancla lo veria como huerfano:
   * el mensaje diria "ya no le pone techo" cuando la verdad es "le puso basura". */
  const live = readCeilings({ entries: { './a': { budget: { maxReachableModules: 2, maxSourceBytes: 'x' } } } });
  assert.deepEqual(live, { './a': { maxReachableModules: 2, maxSourceBytes: 'x' } });
  assert.match(
    evaluateCeilings(live, { schemaVersion: CEILINGS_SCHEMA_VERSION, ceilings: { './a': ceiling(2, 1000) } })[0],
    /\[maxSourceBytes\]: el techo vivo "x" no es un entero positivo/,
  );
  // Y un budget que no declara NINGUNA dimension gobernada no inventa una entrada viva.
  assert.deepEqual(readCeilings({ entries: { './a': { budget: { maxDirectSources: 1 } } } }), {});
});

test('TECHO/NEW-SUBPATH — un subpath NUEVO es ampliacion en LAS DOS dimensiones: exige --widen', () => {
  const { root, manifest } = runtimeFixture();
  anchorCeilings(root, manifest, {});                       // ancla vacia: el vivo es TODO nuevo
  /* Subir un techo y agregar un subpath agrandan lo mismo: la superficie
   * gobernada. La version anterior solo miraba `value > anchored`, asi que un
   * subpath sin ancla previa se colaba por la puerta de bajada y quedaba
   * registrado como "decrece-solo" -- una ampliacion con la etiqueta al reves. */
  assert.throws(() => writeCeilingsBaseline({ root, reason: 'sin puerta' }),
    (error) => /me niego a AMPLIAR el ancla en 2 techo\(s\)/.test(error.message)
      && /\.\/primitives\/box \[maxReachableModules\] \(sin ancla valida, techo 3\)/.test(error.message)
      && /\.\/primitives\/box \[maxSourceBytes\] \(sin ancla valida, techo 1000\)/.test(error.message));
  const out = writeCeilingsBaseline({ root, reason: 'subpath nuevo revisado', widen: true });
  assert.deepEqual(out.added.map((move) => move.dimension), ['maxReachableModules', 'maxSourceBytes']);
  assert.deepEqual(out.raised, []);
  const written = JSON.parse(fs.readFileSync(path.join(root, CEILINGS_BASELINE_RELATIVE), 'utf8'));
  assert.match(written.lastMoveKind, /ampliacion autorizada por nombre/);
  assert.match(written.lastMoveKind, /maxReachableModules: 0 subido\(s\), 1 sin ancla valida/);
  assert.match(written.lastMoveKind, /maxSourceBytes: 0 subido\(s\), 1 sin ancla valida/);
  assert.doesNotThrow(() => runPublicEntrypointGate({ root, silent: true }));
});

test('TECHO/NEW-SUBPATH — el gate ya veia el subpath nuevo; lo que fallaba era la ESCRITURA', () => {
  // El --check nunca dejo pasar un techo sin anclar: el agujero estaba en la
  // puerta, y por eso el drill afirma las dos mitades por separado.
  assert.match(
    evaluateCeilings({ './b': ceiling(4, 20) }, { schemaVersion: CEILINGS_SCHEMA_VERSION, ceilings: {} })[0],
    /\.\/b: techos maxReachableModules=4 maxSourceBytes=20 sin anclar/,
  );
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
   * no por presencia. Las formas van enumeradas: el arreglo no se puede deshacer
   * a medias. Y se aplica POR DIMENSION: un ancla valida en bytes y corrupta en
   * modulos sigue siendo media puerta abierta. */
  for (const corrupto of ['x', null, 0, [], {}, 10.5, NaN, -5]) {
    const { root, manifest } = runtimeFixture();
    manifest.entries['./primitives/box'].budget.maxSourceBytes = 6000;      // el vivo YA subio
    rewriteManifest(root, manifest);
    anchorCeilings(root, manifest, { './primitives/box': { maxReachableModules: 3, maxSourceBytes: corrupto } });
    assert.throws(
      () => writeCeilingsBaseline({ root, reason: 'reparo el ancla' }),
      (error) => /me niego a AMPLIAR el ancla en 1 techo/.test(error.message)
        && /\.\/primitives\/box \[maxSourceBytes\] \(sin ancla valida, techo 6000\)/.test(error.message),
      `ancla ${JSON.stringify(corrupto)} se lavo sin --widen`,
    );
    // El ancla NO se toco: una puerta que se niega no deja rastro.
    const intacta = JSON.parse(fs.readFileSync(path.join(root, CEILINGS_BASELINE_RELATIVE), 'utf8'));
    assert.deepEqual(
      intacta.ceilings['./primitives/box'],
      JSON.parse(JSON.stringify({ maxReachableModules: 3, maxSourceBytes: corrupto })),
    );

    // Con la puerta pedida por nombre SI repara, y queda contado como ampliacion.
    const out = writeCeilingsBaseline({ root, reason: 'reparo el ancla, revisado', widen: true });
    assert.deepEqual(out.added.map((move) => move.dimension), ['maxSourceBytes']);
    assert.deepEqual(out.raised, []);
    const escrita = JSON.parse(fs.readFileSync(path.join(root, CEILINGS_BASELINE_RELATIVE), 'utf8'));
    assert.deepEqual(escrita.ceilings['./primitives/box'], ceiling(3, 6000));
    assert.match(escrita.lastMoveKind, /ampliacion autorizada por nombre/);
    assert.match(escrita.lastMoveKind, /maxSourceBytes: 0 subido\(s\), 1 sin ancla valida/);
    assert.doesNotMatch(escrita.lastMoveKind, /decrece-solo/, 'lastMoveKind no puede mentir sobre lo que paso');
  }
});

test('TECHO/WRITE-GUARD — el texto no llama "nuevo" a un subpath que ya existia', () => {
  const { root, manifest } = runtimeFixture();
  anchorCeilings(root, manifest, { './primitives/box': { maxReachableModules: 3, maxSourceBytes: 'x' } });
  assert.throws(() => writeCeilingsBaseline({ root, reason: 'r' }), /sin ancla valida/);
  assert.throws(() => writeCeilingsBaseline({ root, reason: 'r' }), (error) => !/\(nuevo,/.test(error.message));
});

/* ── el schemaVersion del ancla se verifica, en las DOS rutas ─────────────── */

/** Escribe un ancla valida salvo por su `schemaVersion`. */
function anchorWithSchema(root, manifest, schemaVersion) {
  const ceilings = Object.fromEntries(
    Object.entries(manifest.entries).map(([subpath, entry]) => [
      subpath,
      Object.fromEntries(GOVERNED_BUDGET_DIMENSIONS.map((dimension) => [dimension, entry.budget[dimension]])),
    ]),
  );
  const doc = { law: 'fixture', ceilings };
  if (schemaVersion !== undefined) doc.schemaVersion = schemaVersion;
  write(root, CEILINGS_BASELINE_RELATIVE, `${JSON.stringify(doc, null, 2)}\n`);
}

test('SCHEMA — un ancla con schemaVersion ausente, null o desconocido NO se compara', () => {
  /* El archivo declaraba `schemaVersion: 1` desde que nacio y no lo leia nadie.
   * Un campo de version que no se comprueba no versiona nada: la primera vez que
   * el formato cambie de verdad, el gate leera un archivo de otra forma creyendo
   * que entiende lo que dice. Se compara con `===`, asi que el string "2"
   * tampoco pasa -- un numero serializado como texto ES una discrepancia de
   * formato, y es justo lo que este campo existe para atrapar.
   *
   * La version 1 esta en la lista a proposito: es el formato de UN solo techo
   * por subpath, y compararlo contra el de dos dimensiones seria leer un archivo
   * de otra forma creyendo que se entiende. */
  for (const schemaVersion of [undefined, null, 999, '2', 0, 1, true]) {
    const failures = evaluateCeilings({ './a': ceiling(2, 1000) }, { schemaVersion, ceilings: { './a': ceiling(2, 1000) } });
    assert.equal(failures.length, 1, `schemaVersion ${JSON.stringify(schemaVersion)} paso en silencio`);
    assert.match(failures[0], /schemaVersion .* y este gate lee la version 2/);
    assert.match(failures[0], /no se compara un archivo cuyo formato no se entiende/);
  }
  // Y la version correcta no estorba: sin desvio, cero fallos.
  assert.deepEqual(
    evaluateCeilings({ './a': ceiling(2, 1000) }, { schemaVersion: CEILINGS_SCHEMA_VERSION, ceilings: { './a': ceiling(2, 1000) } }),
    [],
  );
  assert.equal(CEILINGS_SCHEMA_VERSION, 2);
});

test('SCHEMA — el gate falla cerrado sobre un arbol real con el ancla de otra version', () => {
  for (const schemaVersion of [undefined, null, 999, 1]) {
    const { root, manifest } = runtimeFixture();
    anchorWithSchema(root, manifest, schemaVersion);
    assert.throws(
      () => runPublicEntrypointGate({ root, silent: true }),
      /\[techo\] el ancla declara schemaVersion .* y este gate lee la version 2/,
      `schemaVersion ${JSON.stringify(schemaVersion)} no freno el gate`,
    );
  }
});

test('SCHEMA — la ruta --write-baseline tambien: no se re-ancla sobre un formato ajeno', () => {
  /* La escritura importa tanto como la lectura: el documento nuevo arrastra los
   * campos declarativos del previo, asi que un ancla de otro formato se
   * propagaria intacta, y ademas `raised`/`added` se calculan contra ella.
   * Reparar sobre un archivo que no se entiende no es reparar. */
  for (const schemaVersion of [undefined, null, 999, 1]) {
    const { root, manifest } = runtimeFixture();
    anchorWithSchema(root, manifest, schemaVersion);
    assert.throws(
      () => writeCeilingsBaseline({ root, reason: 'reparo el ancla', widen: true }),
      /schemaVersion .* y este gate escribe la version 2/,
      `schemaVersion ${JSON.stringify(schemaVersion)} dejo escribir`,
    );
    // Y no dejo rastro: el ancla ajena queda tal cual estaba.
    const intacta = JSON.parse(fs.readFileSync(path.join(root, CEILINGS_BASELINE_RELATIVE), 'utf8'));
    assert.equal(intacta.schemaVersion ?? null, schemaVersion ?? null);
  }
});

test('SCHEMA — el documento escrito lleva SIEMPRE la version que el gate entiende', () => {
  const { root, manifest } = runtimeFixture();
  anchorCeilings(root, manifest, { './primitives/box': ceiling(4, 1200) });    // baja: no necesita --widen
  writeCeilingsBaseline({ root, reason: 'el grafo adelgazo' });
  const written = JSON.parse(fs.readFileSync(path.join(root, CEILINGS_BASELINE_RELATIVE), 'utf8'));
  assert.equal(written.schemaVersion, CEILINGS_SCHEMA_VERSION);
  // Y solo claves del conjunto cerrado: lo escrito vuelve a pasar su propio --check.
  assert.deepEqual(Object.keys(written).filter((key) => !CEILINGS_ROOT_KEYS.includes(key)), []);
});

test('SCHEMA — el ancla REAL declara la version que el gate lee', () => {
  const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../../..');
  const baseline = JSON.parse(fs.readFileSync(path.join(root, CEILINGS_BASELINE_RELATIVE), 'utf8'));
  assert.equal(baseline.schemaVersion, CEILINGS_SCHEMA_VERSION);
  assert.equal(Object.keys(baseline.ceilings).length, 76, 'los 76 techos, intactos');
  assert.deepEqual(Object.keys(baseline).filter((key) => !CEILINGS_ROOT_KEYS.includes(key)), [],
    'el ancla real no lleva ninguna clave de raiz que el gate no lea');
});
