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
 * ALCANCE: TODO LO QUE PINTA BAJO MODERN, en tres clases de lectura. Classic y
 * Rustic estan congelados por decision del owner (2026-09-05) y ninguna orden
 * de trabajo les agrega contenido, asi que contar su pintura convertiria deuda
 * congelada en ruido permanente en un ratchet que existe para bajar. Congelado
 * es lo UNICO que queda fuera: el filtro original `/engines/modern/` tambien
 * dejaba fuera el CSS compartido que el entrypoint base importa bajo todo
 * engine y los `var()` inline del TSX, y esos pintan bajo Modern igual.
 *
 *   modernSkin      el skin de `engines/modern`: contador decrece-solo.
 *   sharedPaint     todo el CSS autorado fuera de los engines congelados y del
 *                   skin Modern (skin agnostico, tokens de componente,
 *                   foundation, personality, modern/theme).
 *   componentInline `var(--ds-*)` literal en el TS/TSX productivo de
 *                   src/components (sin tests, stories ni engines congelados).
 *
 * Las dos clases nuevas entraron con deuda ya medida, asi que su baseline es un
 * LEDGER nombre por lector, no un numero: una lectura sin productor que no este
 * en el ledger es anonima y enrojece, y una fila que ya no es deuda enrojece
 * hasta que se la borre. Un numero dejaria pasar un cambio de un nombre por
 * otro; el ledger no.
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

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { collectSkinFiles } from '../../../libraries/engine/skins/files/index.mjs';
import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';
import {
  collectAuthoredStylesheets,
  collectChannelProducers,
} from '../../../libraries/tokens/producers/index.mjs';
import { varCalls } from '../cascade-wiring/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = findPackageRoot(HERE);
export const BASELINE_PATH = join(HERE, 'baseline/index.json');

const stripComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '');
const stripScriptComments = (source) => stripComments(source).replace(/^\s*\/\/.*$/gm, '');
const posix = (file) => file.split(sep).join('/');
const FROZEN_ENGINE = /\/engines\/(?:classic|rustic)\//;
const NOT_PRODUCTIVE_SCRIPT =
  /(?:^|\/)(?:tests?|__tests__|stories|fixtures|__snapshots__|generated)(?:\/|$)|\.(?:test|spec|stories)\.[cm]?[jt]sx?$|\.d\.ts$/;
/** Un `var(--ds-x` literal; `var(--ds-x-${...}` es un prefijo interpolado, no un nombre. */
const INLINE_READ = /var\(\s*(--ds-[a-zA-Z0-9_-]+)(\$\{)?/g;

/** El lector como lo escribe el ledger: relativo a la raiz que contiene `src/`. */
export function readerPath(file) {
  const path = posix(file);
  const at = path.lastIndexOf('/src/');
  return at >= 0 ? path.slice(at + 1) : path;
}

/** El skin del unico engine productivo. */
export function collectModernSkinFiles(files = collectSkinFiles()) {
  return files.filter((file) => file.split(sep).join('/').includes('/engines/modern/'));
}

/** sharedPaint: todo el CSS autorado que pinta bajo Modern y no es su skin. */
export function collectSharedPaintFiles(root = PACKAGE_ROOT) {
  const modern = new Set(collectModernSkinFiles(collectSkinFiles(root)));
  return collectAuthoredStylesheets(root).filter(
    (file) => !FROZEN_ENGINE.test(posix(file)) && !modern.has(file),
  );
}

/** componentInline: el TS/TSX productivo de los componentes. */
export function collectComponentInlineFiles(root = PACKAGE_ROOT) {
  const files = [];
  const walk = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join(dir, entry.name);
      const path = posix(full);
      if (FROZEN_ENGINE.test(`${path}/`) || NOT_PRODUCTIVE_SCRIPT.test(path)) continue;
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && /\.tsx?$/.test(entry.name)) files.push(full);
    }
  };
  walk(join(root, 'src/components'));
  return files.sort();
}

/** Cada nombre `--ds-*` leido por la clase, con sus lectores. */
function readersByName(files, kind) {
  const readers = new Map();
  let prefixSites = 0;
  const add = (name, file) => {
    const set = readers.get(name) ?? new Set();
    set.add(readerPath(file));
    readers.set(name, set);
  };
  for (const file of files) {
    const raw = readFileSync(file, 'utf8');
    if (kind === 'css') {
      for (const call of varCalls(stripComments(raw))) {
        if (call.name.startsWith('--ds-')) add(call.name, file);
      }
      continue;
    }
    for (const match of stripScriptComments(raw).matchAll(INLINE_READ)) {
      if (match[2] || match[1].endsWith('-')) prefixSites += 1;
      else add(match[1], file);
    }
  }
  return { readers, prefixSites };
}

/**
 * Una clase de lectura fuera del skin Modern: denominador, y la deuda como
 * pares nombre -> lectores, que es la forma que el ledger pina.
 */
export function classifyReadClass(files, kind, producers) {
  const { readers, prefixSites } = readersByName(files, kind);
  const debt = {};
  for (const name of [...readers.keys()].sort()) {
    if (!producers.has(name)) debt[name] = [...readers.get(name)].sort();
  }
  return { files: files.length, denominator: readers.size, debt, prefixSites };
}

/** El ledger de una clase contra su medida: toda diferencia es un hallazgo. */
export function readClassFindings(label, measured, pinned) {
  const findings = [];
  if (!pinned || typeof pinned.names !== 'object' || pinned.names === null) {
    return [`${label}: the baseline carries no \`names\` ledger for this read class`];
  }
  if (measured.denominator === 0) {
    findings.push(`shape: ${label} resolved to zero read names -- an empty corpus is never a pass`);
  }
  for (const [name, readers] of Object.entries(measured.debt)) {
    const row = pinned.names[name];
    if (!row) {
      findings.push(
        `${label} GREW: ${name} is read by ${readers.join(', ')} and nobody writes it -- an anonymous ` +
          'read without producer. Give it a producer or retire the read; a new ledger row is a new exemption',
      );
      continue;
    }
    const pinnedReaders = new Set(row.readers ?? []);
    for (const reader of readers) {
      if (!pinnedReaders.has(reader)) {
        findings.push(`${label} GREW: ${reader} is a new reader of the unproduced ${name}`);
      }
    }
    for (const reader of pinnedReaders) {
      if (!readers.includes(reader)) {
        findings.push(
          `${label} SHRANK: ${reader} no longer reads the unproduced ${name} -- remove it from the row's readers`,
        );
      }
    }
  }
  for (const [name, row] of Object.entries(pinned.names)) {
    if (!measured.debt[name]) {
      findings.push(
        `${label} SHRANK: ${name} is no longer a read without producer -- delete its ledger row ` +
          '(decrease-only: the ledger follows the tree DOWN)',
      );
    }
    if (typeof row.family !== 'string' || !row.family) {
      findings.push(`${label}: ${name} carries no family`);
    }
    if (!('owner' in row) || (row.owner !== null && typeof row.owner !== 'string')) {
      findings.push(`${label}: ${name} carries no owner field (a work order id, or null while unrouted)`);
    }
    if (row.owner === null && !('ownerProposal' in row)) {
      findings.push(`${label}: ${name} has a null owner and no ownerProposal field`);
    }
  }
  if (typeof pinned.prefixSites === 'number' && measured.prefixSites !== pinned.prefixSites) {
    const verb = measured.prefixSites > pinned.prefixSites ? 'GREW' : 'SHRANK';
    findings.push(
      `${label} prefixSites ${verb} from ${pinned.prefixSites} to ${measured.prefixSites}: an interpolated ` +
        '`var(--ds-x-${...})` names no channel the ledger can check; resolve it to literal names instead of re-pinning',
    );
  }
  return findings;
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

/**
 * Residuo nombrado por skin: lo que queda sin productor (o solo con la puerta
 * autorable del kernel) por decision abierta, contado nombre por nombre.
 */
export function residueFindings(residue, { files, producers, compiledByKind }) {
  const findings = [];
  for (const [family, pin] of Object.entries(residue ?? {})) {
    const skin = files.find((file) => file.split(sep).join('/').endsWith(pin.skin));
    if (!skin) {
      findings.push(`residue ${family}: skin ${pin.skin} is not in the Modern corpus`);
      continue;
    }
    const reads = new Set();
    for (const call of varCalls(stripComments(readFileSync(skin, 'utf8')))) {
      if (call.name.startsWith('--ds-')) reads.add(call.name);
    }
    const kernelOnly = (name) =>
      compiledByKind.kernel?.has(name) &&
      Object.entries(compiledByKind).every(([kind, set]) => kind === 'kernel' || !set.has(name)) &&
      !producers.declared.has(name);
    const arms = [
      ['readWithoutProducer', (name) => !producers.all.has(name)],
      ['kernelAuthorableWithoutRest', kernelOnly],
    ];
    for (const [arm, measured] of arms) {
      const pinned = new Set(Object.keys(pin[arm] ?? {}));
      const actual = [...reads].filter(measured).sort();
      for (const name of actual) {
        if (!pinned.has(name)) findings.push(`residue ${family}.${arm} GREW: ${name} is not pinned`);
      }
      for (const name of [...pinned].sort()) {
        if (!actual.includes(name)) {
          findings.push(
            `residue ${family}.${arm}: ${name} is no longer residue -- a pinned open decision was resolved ` +
              'without its owner checkpoint; remove the pin only with that ruling',
          );
        }
      }
    }
  }
  return findings;
}

export function collectFindings({
  baselinePath = BASELINE_PATH,
  files,
  sharedFiles,
  inlineFiles,
  producers,
  channelProducers,
} = {}) {
  const measured = channelProducers ?? collectChannelProducers();
  const producerSet = producers ?? measured.producers;
  const corpus = files ?? collectModernSkinFiles();
  const result = classifyReadWithoutProducer(corpus, producerSet);
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
  findings.push(
    ...residueFindings(baseline.namedResidue, {
      files: corpus,
      producers: { all: producerSet, declared: measured.declared },
      compiledByKind: measured.compiledByKind,
    }),
  );
  if (typeof baseline.denominator === 'number' && baseline.denominator !== result.denominator.length) {
    findings.push(
      `denominator moved from ${baseline.denominator} to ${result.denominator.length}; re-read the census before touching \`debt\``,
    );
  }
  const classes = baseline.readClasses ?? {};
  findings.push(
    ...readClassFindings(
      'sharedPaint',
      classifyReadClass(sharedFiles ?? collectSharedPaintFiles(), 'css', producerSet),
      classes.sharedPaint,
    ),
    ...readClassFindings(
      'componentInline',
      classifyReadClass(inlineFiles ?? collectComponentInlineFiles(), 'script', producerSet),
      classes.componentInline,
    ),
  );
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
  const producers = collectChannelProducers().producers;
  const shared = classifyReadClass(collectSharedPaintFiles(), 'css', producers);
  const inline = classifyReadClass(collectComponentInlineFiles(), 'script', producers);
  const pinnedPairs = (measured) => Object.values(measured.debt).reduce((sum, readers) => sum + readers.length, 0);
  console.log(
    `read-without-producer-ratchet OK -- ${result.debt.length} of ${result.denominator.length} names read by the ` +
      `Modern skin have NO producer (${result.produced} do; ${result.producers} producers known; ` +
      `${result.files} Modern skin files); sharedPaint ${Object.keys(shared.debt).length} of ${shared.denominator} ` +
      `(${pinnedPairs(shared)} reads, ${shared.files} files), componentInline ${Object.keys(inline.debt).length} of ` +
      `${inline.denominator} (${pinnedPairs(inline)} reads, ${inline.files} files, ${inline.prefixSites} prefix sites), ` +
      'every one named in the ledger',
  );
}

/* El guard nombra el ARCHIVO, no el nombre del entry: por la ley folder/index
 * todo productor se llama `index.mjs`, asi que un guard por nombre le correria
 * el main a cualquier importador. */
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
