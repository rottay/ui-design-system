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
 *       se reporta en `unresolved`; nunca se descarta en silencio. Un dominio
 *       literal cerrado es tambien el conjunto de call sites de una funcion
 *       privada que recibe el hueco del template como parametro y a la que
 *       TODOS sus llamadores pasan un literal (`resolveThroughLiteralCallSites`).
 *
 * Lo que NO cuenta como productor: un `var()` en un skin (eso es una lectura),
 * un nombre citado en un comentario, un fixture, un test o un artefacto
 * generado. Un conjunto de productores inflado convierte deuda real en verde.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

import ts from 'typescript';

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

/** Los nodos cuyo `name` introduce un binding de valor en su ambito. */
const BINDING_KINDS = new Set([
  ts.SyntaxKind.VariableDeclaration,
  ts.SyntaxKind.Parameter,
  ts.SyntaxKind.BindingElement,
  ts.SyntaxKind.FunctionDeclaration,
  ts.SyntaxKind.FunctionExpression,
  ts.SyntaxKind.ClassDeclaration,
  ts.SyntaxKind.ClassExpression,
  ts.SyntaxKind.EnumDeclaration,
  ts.SyntaxKind.ModuleDeclaration,
  ts.SyntaxKind.ImportEqualsDeclaration,
]);

/** `node` es el nombre de un binding distinto de `except` (el parametro mismo). */
const shadowsParameter = (node, except) =>
  node !== except && BINDING_KINDS.has(node.parent?.kind) && node.parent.name === node;

/** Los envoltorios por los que un target de asignacion sube hasta su operador. */
const PATTERN_PARENTS = new Set([
  ts.SyntaxKind.ParenthesizedExpression,
  ts.SyntaxKind.ArrayLiteralExpression,
  ts.SyntaxKind.ObjectLiteralExpression,
  ts.SyntaxKind.SpreadElement,
  ts.SyntaxKind.SpreadAssignment,
  ts.SyntaxKind.ShorthandPropertyAssignment,
  ts.SyntaxKind.AsExpression,
  ts.SyntaxKind.SatisfiesExpression,
  ts.SyntaxKind.TypeAssertionExpression,
  ts.SyntaxKind.NonNullExpression,
]);

const isAssignment = (node) =>
  ts.isBinaryExpression(node) &&
  node.operatorToken.kind >= ts.SyntaxKind.FirstAssignment &&
  node.operatorToken.kind <= ts.SyntaxKind.LastAssignment;

/**
 * `node` (una referencia) es escrito: sube por los patrones de destructuring
 * (`[x] = …`, `({ a: x } = …)`, `[x = d] = …`, `[...x] = …`) hasta el operador
 * que lo escribe, o es operando de `++`/`--`, o es la cabecera de un
 * `for…in`/`for…of`. Un identificador que solo aparece DENTRO de una clave
 * (`vars[`…${x}…`] = v`) nunca sube: su padre es un template, no un patron.
 */
function writesIdentifier(node) {
  let current = node;
  for (;;) {
    const parent = current.parent;
    if (parent === undefined) return false;
    if (isAssignment(parent)) {
      if (parent.left === current) return true;
      // `[x = d]` dentro de un patron: el default no es el target, el left si.
      return false;
    }
    if (
      (ts.isPrefixUnaryExpression(parent) || ts.isPostfixUnaryExpression(parent)) &&
      (parent.operator === ts.SyntaxKind.PlusPlusToken || parent.operator === ts.SyntaxKind.MinusMinusToken)
    ) {
      return true;
    }
    if ((ts.isForOfStatement(parent) || ts.isForInStatement(parent)) && parent.initializer === current) return true;
    if (ts.isPropertyAssignment(parent)) {
      if (parent.initializer !== current) return false;
    } else if (!PATTERN_PARENTS.has(parent.kind)) return false;
    current = parent;
  }
}

/**
 * Un template de una sola interpolacion cuyo hueco es un PARAMETRO de la
 * funcion que lo emite, resuelto por los call sites de esa funcion:
 *
 *   function setPremiumCardVars(vars, namespace, card) {
 *     if (card.iconBg) vars[`--ds-${namespace}-icon-bg`] = card.iconBg;
 *   }
 *   setPremiumCardVars(vars, "workspace-card", chrome.workspaceCard);
 *
 * produce `--ds-workspace-card-icon-bg`. El dominio es cerrado SOLO si nada
 * puede llamar a la funcion con otro valor, asi que cualquier duda deja el
 * sitio en `unresolved` (devuelve null), nunca inventa un nombre:
 *   - la funcion es una declaracion con nombre, no exportada;
 *   - el hueco es un parametro por identificador y la funcion no tiene otro
 *     binding con ese nombre (`const`/`let`/`var`, funcion, clase, `catch`,
 *     parametro anidado): el nombre se compara por TEXTO, asi que cualquier
 *     sombra posible cierra el dominio (`shadowsParameter`);
 *   - el cuerpo no lo escribe por NINGUNA forma: asignacion simple o
 *     compuesta, patron de array u objeto (con default o rest), `++`/`--`,
 *     o cabecera de `for…in`/`for…of` (`writesIdentifier`); y no lee
 *     `arguments` ni llama a `eval`;
 *   - hay al menos un call site, y en el archivo el nombre de la funcion solo
 *     aparece como callee directo (pasarla como valor es una fuga);
 *   - cada call site pasa en esa posicion un literal de string.
 * El dominio es la union de esos literales.
 */
export function resolveThroughLiteralCallSites(sourceText, site) {
  const parts = /^`([^$`]*)\$\{\s*([A-Za-z_$][\w$]*)\s*\}([^$`]*)`$/u.exec(site.raw);
  if (parts === null) return null;
  const [, head, param, tail] = parts;
  const file = ts.createSourceFile('census.ts', sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const at = file.getPositionOfLineAndCharacter(site.line - 1, 0);
  let owner = null;
  const findOwner = (node) => {
    if (ts.isFunctionDeclaration(node) && node.body && node.getStart(file) <= at && at <= node.end) owner = node;
    ts.forEachChild(node, findOwner);
  };
  findOwner(file);
  if (owner === null || owner.name === undefined) return null;
  if (owner.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) return null;
  const position = owner.parameters.findIndex(
    (parameter) => ts.isIdentifier(parameter.name) && parameter.name.text === param,
  );
  if (position < 0) return null;

  const fnName = owner.name.text;
  const values = new Set();
  let calls = 0;
  let closed = true;
  const walk = (node) => {
    if (ts.isIdentifier(node) && node.text === fnName && node !== owner.name) {
      const call = node.parent;
      if (ts.isCallExpression(call) && call.expression === node) {
        calls += 1;
        const argument = call.arguments[position];
        if (argument && (ts.isStringLiteral(argument) || ts.isNoSubstitutionTemplateLiteral(argument))) {
          values.add(argument.text);
        } else closed = false;
      } else closed = false;
    }
    ts.forEachChild(node, walk);
  };
  walk(file);

  // Dentro de la funcion (parametros y cuerpo), el nombre del hueco debe
  // denotar SOLO al parametro y nadie debe escribirlo; ante la duda, null.
  const own = owner.parameters[position].name;
  const scan = (node) => {
    if (ts.isIdentifier(node)) {
      if (node.text === param && (shadowsParameter(node, own) || writesIdentifier(node))) closed = false;
      if (node.text === 'arguments' || node.text === 'eval') closed = false;
    }
    ts.forEachChild(node, scan);
  };
  owner.parameters.forEach(scan);
  scan(owner.body);
  if (!closed || calls === 0) return null;
  return [...values].sort().map((value) => `${head}${value}${tail}`);
}

/**
 * (b) por clase: lo que emite cada raiz de `COMPILER_PRODUCER_ROOTS`, y los
 * sitios cuya clave no se pudo enumerar.
 */
export function collectCompilerEmissions({ coreRoot = DEFAULT_ROOT, roots = COMPILER_PRODUCER_ROOTS } = {}) {
  const byKind = {};
  const unresolved = [];
  const throughCallSites = [];
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
      for (const site of keyed.unresolved) {
        const names = resolveThroughLiteralCallSites(source.text, site);
        if (names === null) {
          unresolved.push({ kind, path, ...site });
          continue;
        }
        for (const name of names) emitted.add(name);
        throughCallSites.push({ kind, path, raw: site.raw, line: site.line, names });
      }
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
  throughCallSites.sort((a, b) => a.path.localeCompare(b.path) || a.line - b.line);
  return { byKind, unresolved, throughCallSites };
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
