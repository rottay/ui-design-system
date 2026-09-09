/**
 * Does a gate's transitive MODULE GRAPH reach `dist/`?
 *
 * WHY THIS EXISTS. `gates:ci` is consumed by `pretest` and by the CI step that
 * runs BEFORE the build, so a gate listed there must be valid on a clean
 * checkout that has no `dist/`. Four blocking entries were not: the slot
 * inventory dynamically imports `dist/server.js`, and the membership gate and
 * both drills import the slot inventory. On a clean clone they die on a
 * missing input, and a gate that is red for that reason gets downgraded --
 * the exact failure class the gate manifest exists to prevent.
 *
 * WHY AN AST AND NOT A GREP. The first version of this walk was a regex over
 * file text and reported eight gates; four of them were fixtures -- a test
 * that writes `import { x } from "@rottay/design-system"` INTO a temporary
 * file to prove the boundary gate rejects it, and a JSDoc `@example` line.
 * A string that spells an import is not an import. Module specifiers are read
 * from the TypeScript AST: static `import`/`export ... from`, `require('...')`
 * with a literal, and dynamic `import(...)` (whose argument is usually an
 * expression, so its SOURCE TEXT is what is inspected -- `import(pathToFileURL(
 * join(coreRoot, 'dist/server.js')).href)` is exactly the shape found).
 *
 * The walk follows RELATIVE specifiers only. A bare specifier is either a
 * third-party package (not this tree) or the package's own name, which
 * resolves through `exports` into `dist/` and is therefore itself a hit.
 *
 * WHY IMPORTS ARE NOT ENOUGH (2026-09-08). `validateManifest()` reported no
 * problem while five real pre-build entries could not run on a clean checkout.
 * None of them IMPORTED `dist/`: two read a compiled contract off the
 * filesystem through a path variable, two read `dist/bithire.css` the same way,
 * and one spawned a command that walked every exported build target. An import
 * is one of three ways to need a build, and the other two were invisible. So
 * the walk now also reports:
 *
 *   path-literal   a `dist/` path a module builds or reads, including
 *                  `join(root, 'dist', …)` where no single literal spells it;
 * and it FOLLOWS a child command -- a script the gate spawns, including through
 * a `pnpm run` alias -- into that script's own graph, so what the child reads is
 * part of what the parent needs. Following is not accusing: the spawn itself is
 * never a hit, only what the spawned module turns out to read.
 *
 * A module that MENTIONS `dist/` without depending on one -- a drill that
 * fabricates a fake `dist/` in a tmpdir is the honest case -- is not silently
 * forgiven: the manifest entry carries a written `distExemption`, which is
 * reviewed like every other exemption in that file.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

import ts from 'typescript';

/** Resolution order for an extensionless relative specifier in this tree. */
const CANDIDATE_SUFFIXES = ['', '.mjs', '.mts', '.ts', '.tsx', '.js', '/index.mjs', '/index.ts', '/index.tsx'];

const SELF_PACKAGE = '@rottay/design-system';

function scriptKindFor(file) {
  if (file.endsWith('.tsx')) return ts.ScriptKind.TSX;
  if (file.endsWith('.ts') || file.endsWith('.mts')) return ts.ScriptKind.TS;
  return ts.ScriptKind.JS;
}

/** Module specifiers a file really declares, as `{ text, dynamic }`. */
export function moduleSpecifiers(source, fileName) {
  const parsed = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, scriptKindFor(fileName));
  const found = [];
  const visit = (node) => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier
      && ts.isStringLiteral(node.moduleSpecifier)) {
      found.push({ text: node.moduleSpecifier.text, dynamic: false });
    } else if (ts.isCallExpression(node)) {
      const [argument] = node.arguments;
      if (node.expression.kind === ts.SyntaxKind.ImportKeyword && argument) {
        found.push({
          text: ts.isStringLiteral(argument) ? argument.text : argument.getText(parsed),
          dynamic: true,
        });
      } else if (ts.isIdentifier(node.expression) && node.expression.text === 'require'
        && argument && ts.isStringLiteral(argument)) {
        found.push({ text: argument.text, dynamic: false });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(parsed);
  return found;
}

/** True when a specifier names something that only exists after a build. */
function reachesDist(specifier) {
  return /\bdist\//.test(specifier)
    || specifier === SELF_PACKAGE
    || specifier.startsWith(`${SELF_PACKAGE}/`);
}

/**
 * A path expression that names a `dist/` segment, however it is spelled --
 * excluding a dependency's own build output. `node_modules/vite/dist/node` is
 * present on a clean checkout after `pnpm install`; this package's `dist/` is
 * not, and only the second is what a phase declaration is about.
 */
const DIST_SEGMENT = /(?:^|[/'"`])dist(?:\/|['"`]|$)/;
const VENDOR_PATH = /(?:^|\/)node_modules(?:\/|$)/;

/** The child-process entry points a gate can hand another program to. */
const SPAWN_CALLEES = new Set([
  'spawn', 'spawnSync', 'exec', 'execSync', 'execFile', 'execFileSync', 'fork',
]);

/**
 * The filesystem reads that turn a path into a DEPENDENCY.
 *
 * The distinction matters: a module that filters `dist` out of a corpus walk,
 * or names it in a comment, does not need a build. A module that asks the
 * filesystem for something under `dist/` does, and a run without one dies
 * there. Only the second is a hit.
 */
const FS_READ_CALLEES = new Set([
  'readFileSync', 'readdirSync', 'realpathSync', 'opendirSync', 'cpSync', 'globSync',
  'readFile', 'readdir', 'cp', 'glob',
]);

/**
 * Path reads and child commands a module carries.
 *
 * `join(coreRoot, 'dist', 'bithire.css')` names no `dist/` substring, and the
 * result is usually held in a const and read several statements later, so the
 * walk carries the dist-ness of a path through its variable: an initializer
 * that names a `dist` segment marks the name, and a read of that name is a hit.
 */
export function distPathsAndCommands(source, fileName) {
  const parsed = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, scriptKindFor(fileName));
  const paths = [];
  const commands = [];
  const distNames = new Set();
  const literal = (node) => (node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
    ? node.text
    : null);

  /** Does this expression evaluate to a path under `dist/`? */
  const namesDist = (node) => {
    if (!node) return false;
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      return !VENDOR_PATH.test(node.text) && DIST_SEGMENT.test(node.text);
    }
    if (ts.isIdentifier(node)) return distNames.has(node.text);
    if (ts.isTemplateExpression(node)) {
      return DIST_SEGMENT.test(node.getText(parsed))
        || node.templateSpans.some((span) => namesDist(span.expression));
    }
    if (ts.isCallExpression(node)) {
      const callee = node.expression.getText(parsed);
      const name = callee.slice(callee.lastIndexOf('.') + 1);
      if (!['join', 'resolve', 'pathToFileURL', 'normalize', 'fileURLToPath'].includes(name)) return false;
      if (node.arguments.some((argument) => VENDOR_PATH.test(literal(argument) ?? ''))) return false;
      return node.arguments.some((argument) => literal(argument) === 'dist' || namesDist(argument));
    }
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
      return namesDist(node.left) || namesDist(node.right);
    }
    if (ts.isPropertyAccessExpression(node)) return distNames.has(node.getText(parsed)) || namesDist(node.expression);
    if (ts.isArrayLiteralExpression(node)) return node.elements.some((element) => namesDist(element));
    return false;
  };

  // Which names hold a `dist/` path. `const distDir = join(root, 'dist')` marks
  // `distDir`, and `const full = join(distDir, relative)` inherits the mark, so
  // the read three statements later is still seen. Two passes let a name built
  // from an earlier one carry it.
  const collect = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && namesDist(node.initializer)) {
      distNames.add(node.name.text);
    }
    ts.forEachChild(node, collect);
  };
  collect(parsed);
  collect(parsed);

  /** A module-scope `const X = 'scripts/…'` a spawn call names by variable. */
  const constantStrings = new Map();
  for (const statement of parsed.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      const value = literal(declaration.initializer);
      if (ts.isIdentifier(declaration.name) && value !== null) constantStrings.set(declaration.name.text, value);
    }
  }
  const spawnArgument = (node) => literal(node)
    ?? (node && ts.isIdentifier(node) ? constantStrings.get(node.text) ?? null : null);

  const visit = (node) => {
    // A dynamic import of a dist path is the shape the compiled-contract gates
    // use, and it never spells `dist/` at the import site.
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const [argument] = node.arguments;
      if (argument && (namesDist(argument) || DIST_SEGMENT.test(argument.getText(parsed)))) {
        paths.push(`import(${argument.getText(parsed).slice(0, 120)})`);
      }
    }
    if (ts.isCallExpression(node)) {
      const callee = node.expression.getText(parsed);
      const name = callee.slice(callee.lastIndexOf('.') + 1);
      if (FS_READ_CALLEES.has(name)) {
        const hit = node.arguments.find((argument) => namesDist(argument));
        if (hit) paths.push(`${name}(${hit.getText(parsed).slice(0, 120)})`);
      }
      if (SPAWN_CALLEES.has(name)) {
        const first = spawnArgument(node.arguments[0]);
        const rest = node.arguments[1] && ts.isArrayLiteralExpression(node.arguments[1])
          ? node.arguments[1].elements.map(spawnArgument)
          : [];
        if (first) commands.push({ command: first, args: rest.filter((value) => value !== null) });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(parsed);
  return { paths, commands };
}

/** The modules a `pnpm run <script>` alias makes node execute. */
function scriptTargetsOf(packageRoot, script) {
  let scripts;
  try {
    scripts = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8')).scripts ?? {};
  } catch {
    return [];
  }
  const command = scripts[script];
  if (!command) return [];
  return [...command.matchAll(/(?:\.\.\/\.\.\/)?scripts\/[\w./-]+\.mjs/g)].map((match) => match[0]);
}

function resolveRelative(packageRoot, fromRelative, specifier) {
  if (!specifier.startsWith('.')) return null;
  const base = resolve(dirname(join(packageRoot, fromRelative)), specifier);
  for (const suffix of CANDIDATE_SUFFIXES) {
    const candidate = base + suffix;
    if (existsSync(candidate) && statSync(candidate).isFile()) return relative(packageRoot, candidate);
  }
  return null;
}

/** A directory argument (a vitest suite folder) expands to the suites inside it. */
export function expandEntry(packageRoot, entry) {
  const absolute = join(packageRoot, entry);
  if (!existsSync(absolute)) return [];
  if (statSync(absolute).isFile()) return [entry];
  const out = [];
  const walk = (directory) => {
    for (const child of readdirSync(directory, { withFileTypes: true })) {
      const full = join(directory, child.name);
      if (child.isDirectory()) walk(full);
      else if (/\.test\.(ts|tsx|mts|mjs)$/.test(child.name)) out.push(relative(packageRoot, full));
    }
  };
  walk(absolute);
  return out;
}

/**
 * Every `dist/`-bound specifier reachable from `entries`, as
 * `{ file, specifier }`. Empty means the gate is valid before a build.
 */
export function distReachableFrom(packageRoot, entries) {
  const hits = [];
  const seen = new Set();
  const queue = entries.flatMap((entry) => expandEntry(packageRoot, entry));
  while (queue.length > 0) {
    const file = queue.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    let source;
    try {
      source = readFileSync(join(packageRoot, file), 'utf8');
    } catch {
      continue; // a target that does not resolve is validateManifest's finding, not this walk's
    }
    let specifiers;
    try {
      specifiers = moduleSpecifiers(source, file);
    } catch {
      continue;
    }
    for (const { text } of specifiers) {
      if (reachesDist(text)) hits.push({ file, specifier: text, kind: 'import' });
      const resolved = resolveRelative(packageRoot, file, text);
      if (resolved) queue.push(resolved);
    }
    let carried;
    try {
      carried = distPathsAndCommands(source, file);
    } catch {
      continue;
    }
    for (const path of carried.paths) hits.push({ file, specifier: path, kind: 'path-literal' });
    for (const { command, args } of carried.commands) {
      const targets = command === 'pnpm' && args[0] === 'run' && args[1]
        ? scriptTargetsOf(packageRoot, args[1])
        : [command, ...args].filter((argument) => /\.(mjs|cjs|js|mts|cts)$/.test(argument));
      for (const target of targets) {
        const normalized = target.startsWith(packageRoot) ? relative(packageRoot, target) : target;
        // Following, not accusing: a spawned script joins the graph and is
        // judged by what IT reads. Reporting the spawn itself would condemn
        // every gate that runs another one.
        for (const expanded of expandEntry(packageRoot, normalized)) queue.push(expanded);
      }
    }
  }
  return hits;
}
