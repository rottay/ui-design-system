/**
 * Drills del read-without-producer-ratchet.
 *
 * Dos plantan CSS real en el corpus (un nombre nuevo sin productor, y ese mismo
 * nombre con productor) y los demas plantan la ROTURA DEL CLASIFICADOR, que es
 * lo que los invariantes de forma existen para cazar: un contador puede estar
 * verde y estar contando mal.
 *
 * El CSS plantado NO se escribe en el arbol real: `collectSkinFiles()` acepta
 * una raiz, y el drill arma una sandbox de tmpdir con la unica carpeta
 * `engines/modern/skin/` que le importa.
 */

import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { collectSkinFiles } from '../../../libraries/engine/skins/files/index.mjs';
import { collectChannelProducers } from '../../../libraries/tokens/producers/index.mjs';
import {
  BASELINE_PATH,
  classifyReadWithoutProducer,
  collectFindings,
  collectModernSkinFiles,
  shapeFailures,
} from './index.mjs';

const PRODUCERS = collectChannelProducers().producers;

function expectFinding(findings, fragment, message) {
  assert.ok(
    findings.some((finding) => finding.includes(fragment)),
    `${message}; got ${JSON.stringify(findings, null, 1)}`,
  );
}

/** Planta `css` bajo un `engines/modern/skin/` sandbox y suma lo hallado al corpus real. */
function withPlantedModernCss(css, run) {
  const sandbox = mkdtempSync(join(tmpdir(), 'read-without-producer-drill-'));
  const skinDir = join(sandbox, 'src/foundation/tokens/css/runtime/engines/modern/skin');
  mkdirSync(skinDir, { recursive: true });
  writeFileSync(join(skinDir, '__read-without-producer-drill.css'), css);
  try {
    run([...collectModernSkinFiles(), ...collectModernSkinFiles(collectSkinFiles(sandbox))]);
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
}

test('the live tree matches its baseline', () => {
  assert.deepEqual(collectFindings(), []);
});

test('the pinned debt is the measured debt, not a guess', () => {
  const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
  const result = classifyReadWithoutProducer();
  assert.equal(result.debt.length, baseline.debt);
  assert.equal(result.denominator.length, baseline.denominator);
  assert.equal(result.produced, baseline.produced);
});

test('the corpus is Modern only: no frozen-engine skin file is ever read', () => {
  const files = collectModernSkinFiles();
  assert.ok(files.length > 0, 'un corpus vacio nunca es un pase');
  for (const file of files) {
    assert.ok(!file.includes('/engines/classic/'), `classic esta congelado: ${file}`);
    assert.ok(!file.includes('/engines/rustic/'), `rustic esta congelado: ${file}`);
  }
});

test('a NEW name with no producer grows the debt and fails', () => {
  withPlantedModernCss(
    '.ds-read-drill { color: var(--ds-read-without-producer-drill-orphan, #ff0000); }\n',
    (files) => {
      const result = classifyReadWithoutProducer(files, PRODUCERS);
      assert.ok(result.debt.includes('--ds-read-without-producer-drill-orphan'));
      expectFinding(
        collectFindings({ files }),
        'debt GREW from',
        'un nombre que nadie escribe tiene que subir el contador y enrojecer',
      );
    },
  );
});

test('the same name WITH a producer does not grow the debt', () => {
  // El control que prueba que el rojo de arriba lo causa la FALTA DE PRODUCTOR
  // y no la aparicion del nombre.
  const name = '--ds-read-without-producer-drill-orphan';
  withPlantedModernCss(`.ds-read-drill { color: var(${name}, #ff0000); }\n`, (files) => {
    const findings = collectFindings({
      files,
      producers: new Set([...PRODUCERS, name]),
    });
    assert.equal(
      findings.filter((finding) => finding.includes('debt GREW')).length,
      0,
      `darle productor al nombre no puede subir el contador; got ${JSON.stringify(findings)}`,
    );
  });
});

test('INJECTION: un nombre que solo vive dentro de un comentario CSS no entra al denominador', () => {
  const name = '--ds-read-without-producer-injection';
  withPlantedModernCss(`/* .ds-x { color: var(${name}); } */\n.ds-y { color: var(--ds-color-primary); }\n`, (files) => {
    const result = classifyReadWithoutProducer(files, PRODUCERS);
    assert.ok(!result.denominator.includes(name), 'un comentario no es pintura');
  });
  // El control que impide que el drill pase por no medir nada.
  withPlantedModernCss(`.ds-x { color: var(${name}); }\n`, (files) => {
    const result = classifyReadWithoutProducer(files, PRODUCERS);
    assert.ok(result.denominator.includes(name), 'fuera del comentario el mismo nombre si entra');
  });
});

test('SHAPE: a name that HAS a producer can never be reported as debt', () => {
  const broken = {
    denominator: ['--ds-color-primary'],
    debt: ['--ds-color-primary'],
    produced: 0,
  };
  expectFinding(
    shapeFailures(broken, PRODUCERS).failures,
    'has a producer and must never be counted as debt',
    'el invariante tiene que cazar un clasificador que declara deudora a una raiz producida',
  );
});

test('SHAPE: an empty corpus is never a pass', () => {
  expectFinding(
    shapeFailures({ denominator: [], debt: [], produced: 0 }, PRODUCERS).failures,
    'resolved to zero read names',
    'un corpus vacio tiene que fallar en vez de reportar cero deuda',
  );
});

test('the producer set is the SHARED one, not a second measurement', () => {
  // La misma pregunta que responde el arma transitiva de cascade-wiring: si
  // este gate midiera su propio conjunto, dos numeros del mismo runner
  // discreparian sobre que es una raiz.
  const { declared, compiled, producers } = collectChannelProducers();
  assert.ok(declared.size > 0, 'el CSS autorado declara canales');
  assert.ok(compiled.size > 0, 'los derivadores de familia emiten canales');
  assert.equal(producers.size, new Set([...declared, ...compiled]).size);
});

/** Corre `collectFindings` contra una copia del baseline editada por `edit`. */
function withEditedBaseline(edit, run) {
  const sandbox = mkdtempSync(join(tmpdir(), 'read-without-producer-residue-'));
  const path = join(sandbox, 'index.json');
  const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
  edit(baseline);
  writeFileSync(path, JSON.stringify(baseline));
  try {
    run(path);
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
}

const RESIDUE = JSON.parse(readFileSync(BASELINE_PATH, 'utf8')).namedResidue['list-toolbar'];
const CHANNELS = collectChannelProducers();

for (const arm of ['readWithoutProducer', 'kernelAuthorableWithoutRest']) {
  test(`RESIDUE ${arm}: an unpinned residue name fails as growth`, () => {
    const [name] = Object.keys(RESIDUE[arm]);
    withEditedBaseline(
      (baseline) => delete baseline.namedResidue['list-toolbar'][arm][name],
      (baselinePath) =>
        expectFinding(
          collectFindings({ baselinePath, channelProducers: CHANNELS }),
          `residue list-toolbar.${arm} GREW: ${name}`,
          'un residuo que nadie pino tiene que enrojecer',
        ),
    );
  });
}

test('RESIDUE readWithoutProducer: a pinned name that gains a producer fails as a silent fix', () => {
  const [name] = Object.keys(RESIDUE.readWithoutProducer);
  expectFinding(
    collectFindings({ producers: new Set([...CHANNELS.producers, name]), channelProducers: CHANNELS }),
    `residue list-toolbar.readWithoutProducer: ${name} is no longer residue`,
    'dar productor a un residuo pineado sin el checkpoint del owner tiene que enrojecer',
  );
});

test('RESIDUE kernelAuthorableWithoutRest: a pinned name that gains a rest declaration fails as a silent fix', () => {
  const [name] = Object.keys(RESIDUE.kernelAuthorableWithoutRest);
  const declared = new Set([...CHANNELS.declared, name]);
  expectFinding(
    collectFindings({ channelProducers: { ...CHANNELS, declared } }),
    `residue list-toolbar.kernelAuthorableWithoutRest: ${name} is no longer residue`,
    'declarar el reposo de un residuo pineado sin el checkpoint del owner tiene que enrojecer',
  );
});

test('RESIDUE language scope: --ds-toolbar-title-letter-spacing fails on growth and on a silent fix', () => {
  const name = '--ds-toolbar-title-letter-spacing';
  assert.ok(name in RESIDUE.readWithoutProducer, 'el residuo de idioma esta pineado');
  withEditedBaseline(
    (baseline) => delete baseline.namedResidue['list-toolbar'].readWithoutProducer[name],
    (baselinePath) =>
      expectFinding(
        collectFindings({ baselinePath, channelProducers: CHANNELS }),
        `residue list-toolbar.readWithoutProducer GREW: ${name}`,
        'despinear el residuo de idioma tiene que enrojecer',
      ),
  );
  expectFinding(
    collectFindings({ producers: new Set([...CHANNELS.producers, name]), channelProducers: CHANNELS }),
    `residue list-toolbar.readWithoutProducer: ${name} is no longer residue`,
    'derivarlo en la raiz sin el checkpoint del owner tiene que enrojecer',
  );
});
