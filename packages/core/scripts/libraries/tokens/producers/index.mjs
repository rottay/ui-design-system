/**
 * El conjunto de canales `--ds-*` QUE TIENEN PRODUCTOR, medido una sola vez.
 *
 * Dos gates preguntan lo mismo con palabras distintas: `read-without-producer`
 * pregunta si un nombre leido por un skin Modern lo escribe alguien, y el arma
 * transitiva de `cascade-wiring` pregunta si una cadena de fallbacks aterriza
 * en algo que alguien escribe. Si cada uno midiera su propio conjunto, dos
 * numeros del mismo runner discreparian sobre que es una raiz. Aqui esta el
 * conjunto, y los dos lo importan.
 *
 * UN PRODUCTOR ES UNA DE DOS COSAS, y nada mas:
 *
 *   (a) DECLARACION AUTORADA. Una propiedad personalizada declarada en el CSS
 *       del paquete (`--ds-x: <valor>;`). Se lee del TEXTO, sin comentarios:
 *       `var(--ds-x, …)` nunca hace match porque tras el nombre viene `,` o
 *       `)`, jamas `:`.
 *
 *   (b) EMISION DEL COMPILADOR. Un canal que el compilador escribe
 *       (`vars["--ds-x"] = …`) o que la rampa de tintes registra, leido con los
 *       MISMOS extractores que usa `channel-liveness`, importados y no
 *       reimplementados. Tres raices, cada una con su clase
 *       (`COMPILER_PRODUCER_ROOTS`): el registro de derivacion, el kernel del
 *       compilador y `lowering/foundation`. Fuera del registro, una clave
 *       interpolada o no literal se resuelve sobre un dominio literal cerrado o
 *       se reporta en `unresolved`; nunca se descarta en silencio.
 *
 * Lo que NO cuenta como productor: un `var()` en un skin (eso es una lectura),
 * un nombre citado en un comentario, un fixture, un test o un artefacto
 * generado. Un conjunto de productores inflado convierte deuda real en verde.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

import {
  collectFlatThemeCompilerSources,
  extractDirectVarsAssignments,
  extractIdentifierVarsAssignments,
  extractInterpolatedAssignments,
  extractKeyedVarsEmissions,
  extractTintRampEmissions,
} from '../../../check/tokens/cascade/channels/liveness/index.mjs';
import { packageRoot as findPackageRoot } from '../../repo-root/index.mjs';

const HERE = new URL('.', import.meta.url).pathname;
const DEFAULT_ROOT = findPackageRoot(HERE);

/** Las raices de CSS autorado del paquete. Los artefactos generados quedan fuera. */
export const AUTHORED_CSS_ROOTS = Object.freeze([
  'src/foundation/tokens/css',
  'src/components',
]);

const GENERATED_OR_FIXTURE =
  /(?:^|\/)(?:facade\/artifacts|generated|dist|node_modules|coverage|__snapshots__|tests|fixtures)(?:\/|$)/u;

const stripComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '');
const DECLARATION = /(--ds-[a-zA-Z0-9_-]+)\s*:/g;

/** Cada `.css` autorado bajo las raices, sin generados ni fixtures. */
export function collectAuthoredStylesheets(root = DEFAULT_ROOT) {
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
      const posix = full.split(sep).join('/');
      if (GENERATED_OR_FIXTURE.test(posix)) continue;
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith('.css')) files.push(full);
    }
  };
  for (const cssRoot of AUTHORED_CSS_ROOTS) walk(join(root, cssRoot));
  return files.sort();
}

/** (a) Todo `--ds-x:` declarado en el CSS autorado. */
export function collectDeclaredChannels(files = collectAuthoredStylesheets()) {
  const declared = new Set();
  for (const file of files) {
    const text = stripComments(readFileSync(file, 'utf8'));
    for (const match of text.matchAll(DECLARATION)) declared.add(match[1]);
  }
  return declared;
}

/** (b) Todo canal que un derivador de familia emite. */
export function collectCompiledChannels(sources = collectFlatThemeCompilerSources()) {
  const emitted = new Set();
  for (const source of sources) {
    for (const name of extractDirectVarsAssignments(source.text).keys()) emitted.add(name);
    for (const name of extractTintRampEmissions(source.text).names) emitted.add(name);
  }
  return emitted;
}

/**
 * Las raices del compilador que emiten canales, con la clase de productor de
 * cada una. `derived` es el registro de derivacion de `channel-liveness`, que
 * ya vigila sus propias claves no literales; las otras dos raices no las vigila
 * nadie mas, y por eso aqui se resuelven o se reportan.
 */
export const COMPILER_PRODUCER_ROOTS = Object.freeze([
  Object.freeze({
    kind: 'derived',
    root: 'src/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation',
  }),
  Object.freeze({ kind: 'kernel', root: 'src/infrastructure/compilers/kernel' }),
  Object.freeze({
    kind: 'lowering-foundation',
    root: 'src/infrastructure/compilers/runtime/theme/runtime/lowering/foundation',
  }),
]);

const TEST_OWNER = /(?:^|\/)tests(?:\/|$)/u;

const countByLine = (lines) => {
  const counts = new Map();
  for (const line of lines) counts.set(line, (counts.get(line) ?? 0) + 1);
  return counts;
};

/** Cada `vars[<clave>] =` del fuente, con la clave entre corchetes equilibrados. */
function assignmentSites(sourceText) {
  const sites = [];
  const opener = /\bvars\[/gu;
  let match;
  while ((match = opener.exec(sourceText)) !== null) {
    let depth = 1;
    let index = match.index + match[0].length;
    let quote = null;
    for (; index < sourceText.length && depth > 0; index += 1) {
      const ch = sourceText[index];
      if (quote) {
        if (ch === '\\') index += 1;
        else if (ch === quote) quote = null;
      } else if (ch === '"' || ch === "'" || ch === '`') quote = ch;
      else if (ch === '[') depth += 1;
      else if (ch === ']') depth -= 1;
    }
    if (depth !== 0 || !/^\s*=/u.test(sourceText.slice(index))) continue;
    const key = sourceText.slice(match.index + match[0].length, index - 1).trim();
    sites.push({ key, line: sourceText.slice(0, match.index).split('\n').length });
  }
  return sites;
}

/**
 * Las claves que ningun extractor de `channel-liveness` lee (p. ej.
 * `vars[TABLE[key]]`): cada sitio de asignacion que sobra por linea.
 */
function unreadKeyShapes(sourceText) {
  const read = countByLine([
    ...[...extractDirectVarsAssignments(sourceText).values()].flat().map((site) => site.line),
    ...extractInterpolatedAssignments(sourceText).map((site) => site.line),
    ...extractIdentifierVarsAssignments(sourceText).map((site) => site.line),
  ]);
  const residual = [];
  for (const site of assignmentSites(sourceText)) {
    const left = read.get(site.line) ?? 0;
    if (left > 0) read.set(site.line, left - 1);
    else residual.push(site);
  }
  return residual;
}

/**
 * (b) por clase: lo que emite cada raiz de `COMPILER_PRODUCER_ROOTS`, y los
 * sitios cuya clave no se pudo enumerar.
 */
export function collectCompilerEmissions({ coreRoot = DEFAULT_ROOT, roots = COMPILER_PRODUCER_ROOTS } = {}) {
  const byKind = {};
  const unresolved = [];
  for (const { kind, root } of roots) {
    const absoluteRoot = join(coreRoot, root);
    if (kind === 'derived') {
      byKind[kind] = collectCompiledChannels(collectFlatThemeCompilerSources(absoluteRoot));
      continue;
    }
    const sources = collectFlatThemeCompilerSources(absoluteRoot).filter(
      (source) => !TEST_OWNER.test(relative(absoluteRoot, source.path).split(sep).join('/')),
    );
    const emitted = collectCompiledChannels(sources);
    for (const source of sources) {
      const path = relative(coreRoot, source.path).split(sep).join('/');
      const keyed = extractKeyedVarsEmissions(source.text, { file: source.path, coreRoot });
      for (const name of keyed.resolved.keys()) emitted.add(name);
      for (const site of keyed.unresolved) unresolved.push({ kind, path, ...site });
      for (const site of unreadKeyShapes(source.text)) {
        unresolved.push({
          kind,
          path,
          raw: site.key,
          line: site.line,
          reason: 'no channel-liveness extractor reads this key shape',
        });
      }
    }
    byKind[kind] = emitted;
  }
  unresolved.sort((a, b) => a.path.localeCompare(b.path) || a.line - b.line);
  return { byKind, unresolved };
}

/** (a) ∪ (b): el conjunto que las preguntas comparten. */
export function collectChannelProducers(options = {}) {
  const declared = options.declared ?? collectDeclaredChannels();
  const emissions = collectCompilerEmissions();
  const compiled = options.compiled ?? new Set(Object.values(emissions.byKind).flatMap((set) => [...set]));
  return {
    declared,
    compiled,
    compiledByKind: emissions.byKind,
    unresolved: emissions.unresolved,
    producers: new Set([...declared, ...compiled]),
  };
}
