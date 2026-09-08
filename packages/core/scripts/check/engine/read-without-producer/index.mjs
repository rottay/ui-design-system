/**
 * read-without-producer — cuantos nombres lee el skin Modern que NO escribe nadie.
 *
 * Es la otra mitad de `cascade-wiring`. Aquel pregunta si un canal tiene CAMINO
 * a una raiz; este pregunta si el nombre que la pintura lee EXISTE. Un
 * `var(--ds-x, LITERAL)` sin productor resuelve SIEMPRE al literal: el canal
 * parece personalizable y no lo es, y ningun token nuevo lo mueve. Ese es el
 * techo mecanico de F-09 -- "agregar tokens no mueve los nombres sin productor:
 * hay que reescribir cada var(--ds-x, LITERAL)".
 *
 * ALCANCE: SOLO MODERN. Classic y Rustic estan congelados por decision del
 * owner (2026-09-05) y ninguna orden de trabajo les agrega contenido, asi que
 * contar su pintura convertiria deuda congelada en ruido permanente en un
 * ratchet que existe para bajar.
 *
 * UN SOLO WALKER y UN SOLO CONJUNTO DE PRODUCTORES. El corpus lo da
 * `collectSkinFiles()` (el mismo del token-audit, del literal-ownership-gate y
 * de cascade-wiring), filtrado a `engines/modern`. Los productores los da
 * `libraries/tokens/producers`, el mismo modulo que usa el arma transitiva de
 * `cascade-wiring`: dos medidas distintas del mismo conjunto serian dos
 * verdades.
 *
 * BASELINE HONESTO, decrece-solo. El numero de hoy es grande a proposito: es la
 * medida, no una meta. Sube => rojo; baja => rojo con instruccion de bajar el
 * pin, que es como el baseline sigue al arbol HACIA ABAJO y nunca hacia arriba.
 *
 * Usage: node scripts/check/engine/read-without-producer/index.mjs
 * Exit 0 = la deuda es exactamente la del baseline. Exit 1 = se movio.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { collectSkinFiles } from '../../../libraries/engine/skins/files/index.mjs';
import { collectChannelProducers } from '../../../libraries/tokens/producers/index.mjs';
import { varCalls } from '../cascade-wiring/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const BASELINE_PATH = join(HERE, 'baseline/index.json');

const stripComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '');

/** El skin del unico engine productivo. */
export function collectModernSkinFiles(files = collectSkinFiles()) {
  return files.filter((file) => file.split(sep).join('/').includes('/engines/modern/'));
}

/** La clasificacion completa, en una pasada sobre el corpus Modern. */
export function classifyReadWithoutProducer(files = collectModernSkinFiles(), producers) {
  const producerSet = producers ?? collectChannelProducers().producers;
  const read = new Set();
  for (const file of files) {
    const text = stripComments(readFileSync(file, 'utf8'));
    for (const call of varCalls(text)) {
      if (!call.name.startsWith('--ds-')) continue;
      read.add(call.name);
    }
  }
  const denominator = [...read].sort();
  const debt = denominator.filter((name) => !producerSet.has(name));
  return {
    files: files.length,
    denominator,
    produced: denominator.length - debt.length,
    debt,
    producers: producerSet.size,
  };
}

/**
 * Los invariantes de forma. Un contador puede estar verde y estar contando mal.
 */
export function shapeFailures(result, producers) {
  const failures = [];
  const denominatorSet = new Set(result.denominator);
  for (const name of result.debt) {
    if (!denominatorSet.has(name)) {
      failures.push(`shape: ${name} is counted as debt but is not in the denominator`);
    }
    if (producers.has(name)) {
      failures.push(`shape: ${name} has a producer and must never be counted as debt`);
    }
  }
  if (result.debt.length > result.denominator.length) {
    failures.push('shape: the debt set is larger than the denominator it comes from');
  }
  if (result.denominator.length === 0) {
    failures.push('shape: the Modern skin corpus resolved to zero read names -- an empty corpus is never a pass');
  }
  return { failures };
}

export function collectFindings({ baselinePath = BASELINE_PATH, files, producers } = {}) {
  const producerSet = producers ?? collectChannelProducers().producers;
  const result = classifyReadWithoutProducer(files ?? collectModernSkinFiles(), producerSet);
  const findings = [...shapeFailures(result, producerSet).failures];

  if (!existsSync(baselinePath)) return ['baseline/index.json is missing'];
  let baseline;
  try {
    baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
  } catch {
    return ['baseline/index.json is not valid JSON'];
  }

  const pinned = baseline.debt;
  if (typeof pinned !== 'number') {
    findings.push(
      `baseline/index.json does not pin a numeric debt (got ${JSON.stringify(pinned ?? null)})`,
    );
    return findings;
  }
  if (result.debt.length > pinned) {
    findings.push(
      `debt GREW from ${pinned} to ${result.debt.length}: a Modern skin now reads a --ds-* name nobody writes. ` +
        'Give the name a producer (declare it in the authored CSS, or emit it from a family deriver) instead of raising the baseline',
    );
  } else if (result.debt.length < pinned) {
    findings.push(
      `debt SHRANK from ${pinned} to ${result.debt.length} -- good news that still has to be written down: ` +
        'lower `debt` in scripts/check/engine/read-without-producer/baseline/index.json ' +
        '(decrease-only means the baseline follows the tree DOWN, never up)',
    );
  }
  if (typeof baseline.denominator === 'number' && baseline.denominator !== result.denominator.length) {
    findings.push(
      `denominator moved from ${baseline.denominator} to ${result.denominator.length}; re-read the census before touching \`debt\``,
    );
  }
  return findings;
}

function main() {
  const findings = collectFindings();
  const result = classifyReadWithoutProducer();
  if (findings.length > 0) {
    console.error('read-without-producer-ratchet FAILED:');
    for (const finding of findings) console.error(`  - ${finding}`);
    process.exit(1);
  }
  console.log(
    `read-without-producer-ratchet OK -- ${result.debt.length} of ${result.denominator.length} names read by the ` +
      `Modern skin have NO producer (${result.produced} do; ${result.producers} producers known; ` +
      `${result.files} Modern skin files)`,
  );
}

/* El guard nombra el ARCHIVO, no el nombre del entry: por la ley folder/index
 * todo productor se llama `index.mjs`, asi que un guard por nombre le correria
 * el main a cualquier importador. */
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
