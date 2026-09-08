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
 *   (b) EMISION DEL COMPILADOR. Un canal que un derivador de familia escribe
 *       (`vars["--ds-x"] = …`) o que la rampa de tintes registra. Se leen del
 *       registro de derivacion con el MISMO extractor que usa
 *       `channel-liveness`, importado y no reimplementado.
 *
 * Lo que NO cuenta como productor: un `var()` en un skin (eso es una lectura),
 * un nombre citado en un comentario, un fixture, un test o un artefacto
 * generado. Un conjunto de productores inflado convierte deuda real en verde.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, sep } from 'node:path';

import {
  collectBrandThemeCompilerSources,
  extractDirectVarsAssignments,
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
export function collectCompiledChannels(sources = collectBrandThemeCompilerSources()) {
  const emitted = new Set();
  for (const source of sources) {
    for (const name of extractDirectVarsAssignments(source.text).keys()) emitted.add(name);
    for (const name of extractTintRampEmissions(source.text).names) emitted.add(name);
  }
  return emitted;
}

/** (a) ∪ (b): el conjunto que las dos preguntas comparten. */
export function collectChannelProducers(options = {}) {
  const declared = options.declared ?? collectDeclaredChannels();
  const compiled = options.compiled ?? collectCompiledChannels();
  return {
    declared,
    compiled,
    producers: new Set([...declared, ...compiled]),
  };
}
