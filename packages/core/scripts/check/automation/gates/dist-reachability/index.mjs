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
      if (reachesDist(text)) hits.push({ file, specifier: text });
      const resolved = resolveRelative(packageRoot, file, text);
      if (resolved) queue.push(resolved);
    }
  }
  return hits;
}
