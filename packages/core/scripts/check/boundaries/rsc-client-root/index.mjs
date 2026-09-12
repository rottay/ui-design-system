#!/usr/bin/env node
/**
 * rsc-client-root — a server module never takes a server-safe symbol from the
 * client barrel.
 *
 * WHY THIS EXISTS. `src/index.ts` begins with `'use client'`, so every module
 * that resolves `@rottay/design-system` joins the client graph. A React Server
 * Component that only wanted the engine roster therefore dragged the whole
 * client barrel into the RSC build, and the showroom's server-rendered routes
 * failed on it (F-20). The roster owner was React-free the whole time; what was
 * missing was a published door to it that carries no directive.
 *
 * WHAT IT MEASURES. Not a hand-written list of symbols: the policed set is
 * exactly what the server boundary RE-EXPORTS FROM the engine-identity owner.
 * A symbol with a directive-free door has no excuse for arriving through the
 * client one; a symbol without a door is not this gate's business, so the law
 * cannot report a finding nobody can fix. The set grows when the boundary
 * grows, and the gate spells no engine name and no symbol name of its own.
 *
 * ITS THREE PREMISES FAIL CLOSED. If the root barrel loses its directive, if
 * the boundary grows one, or if the boundary stops re-exporting the owner,
 * this gate reports THAT instead of quietly policing nothing.
 *
 * CLASSIFICATION IS CONSERVATIVE, NOT A GRAPH. A module is treated as
 * server-reachable unless its own prologue declares `'use client'`. This gate
 * resolves no transitive import graph and claims no knowledge of which routes
 * render which module: a directive-free module MAY execute on the server, and
 * that possibility is the risk. A module carrying the directive is excluded
 * because the client barrel is already legal for it.
 *
 * ONLY RUNTIME BINDINGS COUNT. `import type` / `export type` and per-element
 * type modifiers are erased before a bundler sees them, so they cannot pull the
 * client barrel anywhere and are not findings. `import()` and `require()` are:
 * their names live on the destructuring pattern or the property access around
 * the call, so the detector reads the use site rather than the call.
 *
 * Usage:
 *   node scripts/check/boundaries/rsc-client-root/index.mjs [--json]
 *   node scripts/check/boundaries/rsc-client-root/index.mjs --drill=<class>
 *   node scripts/check/boundaries/rsc-client-root/index.mjs --list-drills
 *
 * Drill classes: client-root-import | client-root-reexport |
 * client-root-dynamic-import | client-root-require | boundary-silent |
 * root-directive-gone. Each plants ONE violation in a throwaway tree and
 * requires the matching leg to report it, beside an UNMUTATED twin that must
 * stay green -- a red that would have been red anyway measures the plumbing.
 *
 * Exit 0 = clean. Exit 1 = at least one finding, or a drill that stayed green.
 */

import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);

/** The published specifier that carries the client graph. */
export const CLIENT_ROOT_SPECIFIER = '@rottay/design-system';

/** The published specifier that does not. */
export const SERVER_BOUNDARY_SPECIFIER = '@rottay/design-system/server';

export const CLIENT_ROOT_SOURCE = 'src/index.ts';
export const SERVER_BOUNDARY_SOURCE = 'src/entrypoints/server/index.ts';
export const ENGINE_IDENTITY_OWNER = 'src/foundation/contracts/kernel/engine-identity';

/** Consumer trees this repository owns and can therefore hold to the law. */
export const CONSUMER_ROOTS = Object.freeze(['../showroom/src', '../showroom/scripts']);

const SOURCE_EXTENSIONS = /\.(ts|tsx|mts|cts|mjs|js|jsx)$/;
const SKIPPED_DIRECTORIES = new Set(['node_modules', 'dist', '.next', 'out', 'build', '__snapshots__']);

function parse(text, fileName) {
  return ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}

/** Next.js reads the directive prologue, so this reads the same thing. */
export function hasClientDirective(text) {
  const source = parse(text, 'directive.tsx');
  for (const statement of source.statements) {
    if (!ts.isExpressionStatement(statement) || !ts.isStringLiteral(statement.expression)) return false;
    if (statement.expression.text === 'use client') return true;
  }
  return false;
}

function moduleSpecifierOf(node) {
  if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node))
    && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
    return node.moduleSpecifier.text;
  }
  if (ts.isCallExpression(node)) {
    const [argument] = node.arguments;
    if (!argument || !ts.isStringLiteral(argument)) return null;
    if (node.expression.kind === ts.SyntaxKind.ImportKeyword) return argument.text;
    if (ts.isIdentifier(node.expression) && node.expression.text === 'require') return argument.text;
  }
  return null;
}

/**
 * The RUNTIME names a static import or re-export binds.
 *
 * Type-only clauses and per-element type modifiers are dropped: TypeScript
 * erases them, so they never reach a module graph, and a gate that reported
 * them would name a defect that cannot happen.
 */
function staticBindings(node) {
  if (ts.isImportDeclaration(node)) {
    const clause = node.importClause;
    if (!clause || clause.isTypeOnly) return { names: [], namespace: false };
    if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) {
      return { names: [], namespace: true };
    }
    if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
      return { names: valueNamesOf(clause.namedBindings.elements), namespace: false };
    }
    return { names: [], namespace: false };
  }
  if (ts.isExportDeclaration(node)) {
    if (node.isTypeOnly) return { names: [], namespace: false };
    if (!node.exportClause) return { names: [], namespace: true };
    if (ts.isNamedExports(node.exportClause)) {
      return { names: valueNamesOf(node.exportClause.elements), namespace: false };
    }
    return { names: [], namespace: true };
  }
  return { names: [], namespace: false };
}

function valueNamesOf(elements) {
  return elements
    .filter((element) => !element.isTypeOnly)
    .map((element) => (element.propertyName ?? element.name).text);
}

/** What a destructuring pattern takes off a module namespace object. */
function patternBindings(name) {
  if (ts.isIdentifier(name)) return { names: [], namespace: true };
  if (!ts.isObjectBindingPattern(name)) return { names: [], namespace: false };
  const names = [];
  let namespace = false;
  for (const element of name.elements) {
    if (element.dotDotDotToken) {
      namespace = true;
      continue;
    }
    const key = element.propertyName ?? element.name;
    if (ts.isIdentifier(key) || ts.isStringLiteral(key)) names.push(key.text);
    else namespace = true;
  }
  return { names, namespace };
}

/**
 * The runtime names an `import()` / `require()` call binds.
 *
 * A call is an expression, so it binds nothing by itself; the names are on what
 * consumes its value -- an await, a destructuring declaration, a property
 * access. `typeof import('...')` is an ImportTypeNode and never arrives here.
 */
function callBindings(call) {
  let value = call;
  while (value.parent
    && (ts.isAwaitExpression(value.parent) || ts.isParenthesizedExpression(value.parent))) {
    value = value.parent;
  }
  const parent = value.parent;
  if (!parent) return { names: [], namespace: false };
  if (ts.isPropertyAccessExpression(parent) && parent.expression === value) {
    return { names: [parent.name.text], namespace: false };
  }
  if (ts.isElementAccessExpression(parent) && parent.expression === value
    && parent.argumentExpression && ts.isStringLiteral(parent.argumentExpression)) {
    return { names: [parent.argumentExpression.text], namespace: false };
  }
  if ((ts.isVariableDeclaration(parent) || ts.isBindingElement(parent)) && parent.initializer === value) {
    return patternBindings(parent.name);
  }
  return { names: [], namespace: false };
}

/** Every name a node binds from the client root, static or dynamic. */
export function runtimeBindings(node) {
  return ts.isCallExpression(node) ? callBindings(node) : staticBindings(node);
}

/** The door's inventory: what the boundary republishes, values and types alike. */
function republishedNames(node) {
  if (!ts.isExportDeclaration(node) || !node.exportClause || !ts.isNamedExports(node.exportClause)) {
    return [];
  }
  return node.exportClause.elements.map((element) => (element.propertyName ?? element.name).text);
}

/**
 * Every name the boundary republishes FROM the identity owner.
 *
 * Resolved against the owner's directory rather than a spelled path list, so a
 * boundary that reaches the same owner through another relative route is still
 * recognised and a boundary that reaches a DIFFERENT owner is not.
 */
export function boundarySymbols(coreRoot) {
  const boundaryPath = join(coreRoot, SERVER_BOUNDARY_SOURCE);
  const ownerPath = resolve(coreRoot, ENGINE_IDENTITY_OWNER);
  const source = parse(readFileSync(boundaryPath, 'utf8'), boundaryPath);
  const symbols = new Set();
  for (const statement of source.statements) {
    const specifier = moduleSpecifierOf(statement);
    if (!specifier || !specifier.startsWith('.')) continue;
    if (resolve(dirname(boundaryPath), specifier) !== ownerPath) continue;
    for (const name of republishedNames(statement)) symbols.add(name);
  }
  return symbols;
}

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      if (!SKIPPED_DIRECTORIES.has(entry)) walk(path, out);
      continue;
    }
    if (SOURCE_EXTENSIONS.test(entry)) out.push(path);
  }
  return out;
}

function lineOf(source, node) {
  return source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
}

function auditFile(path, text, symbols, label) {
  if (hasClientDirective(text)) return [];
  const source = parse(text, path);
  const findings = [];
  const visit = (node) => {
    const specifier = moduleSpecifierOf(node);
    if (specifier === CLIENT_ROOT_SPECIFIER) {
      const { names, namespace } = runtimeBindings(node);
      const hits = names.filter((name) => symbols.has(name));
      if (namespace) {
        findings.push({ file: label, line: lineOf(source, node), symbol: '*', kind: 'namespace' });
      }
      for (const name of hits) {
        findings.push({ file: label, line: lineOf(source, node), symbol: name, kind: 'named' });
      }
    }
    ts.forEachChild(node, visit);
  };
  ts.forEachChild(source, visit);
  return findings;
}

/**
 * The whole verdict, over roots a caller supplies. Every filesystem read that
 * is not a source file lives above, so a drill can build a tree of three files
 * and get the same law the repository gets.
 */
export function audit({ coreRoot = CORE_ROOT, consumerRoots = CONSUMER_ROOTS } = {}) {
  const findings = [];
  const rootBarrel = readFileSync(join(coreRoot, CLIENT_ROOT_SOURCE), 'utf8');
  if (!hasClientDirective(rootBarrel)) {
    findings.push({
      file: CLIENT_ROOT_SOURCE,
      line: 1,
      symbol: '-',
      kind: 'premise',
      detail: `${CLIENT_ROOT_SOURCE} no longer opens with 'use client'; this law's premise moved, adjudicate it rather than deleting the gate`,
    });
  }
  const boundaryText = readFileSync(join(coreRoot, SERVER_BOUNDARY_SOURCE), 'utf8');
  if (hasClientDirective(boundaryText)) {
    findings.push({
      file: SERVER_BOUNDARY_SOURCE,
      line: 1,
      symbol: '-',
      kind: 'premise',
      detail: `${SERVER_BOUNDARY_SOURCE} carries 'use client'; the server-safe door must stay directive-free`,
    });
  }
  const symbols = boundarySymbols(coreRoot);
  if (symbols.size === 0) {
    findings.push({
      file: SERVER_BOUNDARY_SOURCE,
      line: 1,
      symbol: '-',
      kind: 'premise',
      detail: `${SERVER_BOUNDARY_SOURCE} republishes nothing from ${ENGINE_IDENTITY_OWNER}; the door this law points at is gone`,
    });
  }
  for (const root of consumerRoots) {
    const absolute = resolve(coreRoot, root);
    for (const path of walk(absolute)) {
      findings.push(...auditFile(path, readFileSync(path, 'utf8'), symbols, relative(resolve(coreRoot, '..'), path)));
    }
  }
  return { symbols: [...symbols].sort(), findings };
}

export function report(result) {
  for (const finding of result.findings) {
    const detail = finding.detail
      ?? `takes \`${finding.symbol}\` from ${CLIENT_ROOT_SPECIFIER}; a server module must import it from ${SERVER_BOUNDARY_SPECIFIER}`;
    console.error(`  ${finding.file}:${finding.line} ${detail}`);
  }
  if (result.findings.length === 0) {
    console.log(`rsc-client-root: clean — ${result.symbols.length} boundary symbol(s) policed, 0 server module(s) on the client root`);
  } else {
    console.error(`rsc-client-root: ${result.findings.length} finding(s)`);
  }
}

/* ------------------------------- drills ---------------------------------- */

/** A throwaway core root holding the three real files the law reads. */
function plantCore(base) {
  const root = join(base, 'core');
  for (const relativePath of [CLIENT_ROOT_SOURCE, SERVER_BOUNDARY_SOURCE, `${ENGINE_IDENTITY_OWNER}/index.ts`]) {
    const target = join(root, relativePath);
    mkdirSync(dirname(target), { recursive: true });
    cpSync(join(CORE_ROOT, relativePath), target);
  }
  return root;
}

function plantConsumer(base, text) {
  const root = join(base, 'consumer');
  mkdirSync(root, { recursive: true });
  writeFileSync(join(root, 'index.ts'), text);
  return root;
}

/** A consumer that already obeys the law, spelled from the boundary itself. */
function cleanConsumer(core) {
  const symbol = [...boundarySymbols(core)].sort()[0];
  return `import { ${symbol} } from '${SERVER_BOUNDARY_SPECIFIER}';\nexport const policed = ${symbol};\n`;
}

export const DRILLS = Object.freeze({
  'client-root-import': (base) => {
    const core = plantCore(base);
    const symbol = [...boundarySymbols(core)].sort()[0];
    return {
      core,
      consumer: plantConsumer(base, `import { ${symbol} } from '${CLIENT_ROOT_SPECIFIER}';\nexport const engines = [...${symbol}];\n`),
    };
  },
  'client-root-reexport': (base) => {
    const core = plantCore(base);
    const symbol = [...boundarySymbols(core)].sort()[0];
    return {
      core,
      consumer: plantConsumer(base, `export { ${symbol} } from '${CLIENT_ROOT_SPECIFIER}';\n`),
    };
  },
  'client-root-dynamic-import': (base) => {
    const core = plantCore(base);
    const symbol = [...boundarySymbols(core)].sort()[0];
    return {
      core,
      consumer: plantConsumer(base, `export async function engines() {\n  const { ${symbol} } = await import('${CLIENT_ROOT_SPECIFIER}');\n  return [...${symbol}];\n}\n`),
    };
  },
  'client-root-require': (base) => {
    const core = plantCore(base);
    const symbol = [...boundarySymbols(core)].sort()[0];
    return {
      core,
      consumer: plantConsumer(base, `const { ${symbol} } = require('${CLIENT_ROOT_SPECIFIER}');\nexport const engines = [...${symbol}];\n`),
    };
  },
  'boundary-silent': (base) => {
    const core = plantCore(base);
    const boundary = join(core, SERVER_BOUNDARY_SOURCE);
    writeFileSync(boundary, readFileSync(boundary, 'utf8').replace(/from '\.\.\/\.\.\/foundation\/contracts\/kernel\/engine-identity';/g, "from '../../foundation/i18n/runtime/resolution/locale';"));
    return { core, consumer: plantConsumer(base, cleanConsumer(CORE_ROOT)) };
  },
  'root-directive-gone': (base) => {
    const core = plantCore(base);
    const barrel = join(core, CLIENT_ROOT_SOURCE);
    writeFileSync(barrel, readFileSync(barrel, 'utf8').replace(/^'use client';\n/, ''));
    return { core, consumer: plantConsumer(base, cleanConsumer(CORE_ROOT)) };
  },
});

export function runDrill(name) {
  const plant = DRILLS[name];
  if (!plant) throw new Error(`rsc-client-root: unknown drill class "${name}"; known: ${Object.keys(DRILLS).join(' | ')}`);
  const base = mkdtempSync(join(tmpdir(), 'rsc-client-root-'));
  try {
    const twinBase = join(base, 'twin');
    mkdirSync(twinBase, { recursive: true });
    const twin = audit({ coreRoot: plantCore(twinBase), consumerRoots: [plantConsumer(twinBase, cleanConsumer(CORE_ROOT))] });
    const planted = plant(base);
    const mutated = audit({ coreRoot: planted.core, consumerRoots: [planted.consumer] });
    return { twin: twin.findings, planted: mutated.findings };
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const drill = process.argv.find((argument) => argument.startsWith('--drill='))?.slice('--drill='.length);
  if (process.argv.includes('--list-drills')) {
    console.log(Object.keys(DRILLS).join('\n'));
    process.exit(0);
  }
  if (drill) {
    const { twin, planted } = runDrill(drill);
    const ok = twin.length === 0 && planted.length > 0;
    console.log(`rsc-client-root drill ${drill}: twin=${twin.length} finding(s), planted=${planted.length} finding(s)`);
    for (const finding of planted) console.log(`  planted -> ${finding.file}:${finding.line} ${finding.kind} ${finding.symbol}`);
    if (!ok) console.error(`rsc-client-root drill ${drill}: FAILED — a drill that cannot be seen failing is not evidence`);
    process.exit(ok ? 0 : 1);
  }
  const result = audit();
  if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 2));
  else report(result);
  process.exit(result.findings.length === 0 ? 0 : 1);
}
