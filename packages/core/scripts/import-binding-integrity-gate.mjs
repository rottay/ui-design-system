import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';
import { packageRoot as findPackageRoot } from './lib/repo-root/index.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = findPackageRoot(SCRIPT_DIR);
const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.mts', '.cts'];

function relative(root, filePath) {
  return path.relative(root, filePath).split(path.sep).join('/');
}

function resolveSourceModule(root, importer, specifier) {
  let base;
  if (specifier.startsWith('.')) base = path.resolve(path.dirname(importer), specifier);
  else if (specifier.startsWith('@/')) base = path.resolve(root, 'src', specifier.slice(2));
  else if (specifier.startsWith('@ui/')) base = path.resolve(root, 'src/ui', specifier.slice(4));
  else if (specifier.startsWith('@types/')) base = path.resolve(root, 'src/foundation/contracts', specifier.slice(7));
  else return null;

  const candidates = [
    ...SOURCE_EXTENSIONS.map((extension) => `${base}${extension}`),
    ...SOURCE_EXTENSIONS.map((extension) => path.join(base, `index${extension}`)),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function parseModule(filePath) {
  return ts.createSourceFile(
    filePath,
    fs.readFileSync(filePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
}

function collectSourceFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) collectSourceFiles(filePath, out);
    else if (SOURCE_EXTENSIONS.some((extension) => entry.name.endsWith(extension)) && !entry.name.endsWith('.d.ts')) {
      out.push(filePath);
    }
  }
  return out;
}

/** Flattens `const a`, `const { a, b: c }` and `const [a, b]` to their bound names. */
function bindingNames(name, out = []) {
  if (ts.isIdentifier(name)) out.push(name.text);
  else if (ts.isObjectBindingPattern(name) || ts.isArrayBindingPattern(name)) {
    for (const element of name.elements) {
      if (ts.isBindingElement(element)) bindingNames(element.name, out);
    }
  }
  return out;
}

/**
 * Every binding name a module publishes, following `export * from` transitively.
 *
 * `complete` is false when the module re-exports a star from something this gate
 * cannot resolve (an external package, or a cycle). An incomplete export set can
 * never prove a binding absent, so importers of that module are skipped rather
 * than reported.
 */
function moduleExports(root, filePath, cache = new Map(), stack = new Set()) {
  const cached = cache.get(filePath);
  if (cached) return cached;
  if (stack.has(filePath)) return { names: new Set(), complete: false };
  stack.add(filePath);

  const names = new Set();
  let complete = true;

  for (const statement of parseModule(filePath).statements) {
    const modifiers = ts.canHaveModifiers(statement) ? (ts.getModifiers(statement) ?? []) : [];
    const exported = modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
    const isDefault = modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword);

    if (ts.isExportAssignment(statement) || (exported && isDefault)) {
      names.add('default');
      if (!isDefault) continue;
    }

    if (exported && (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement))) {
      if (statement.name) names.add(statement.name.text);
      continue;
    }
    if (exported && (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)
      || ts.isEnumDeclaration(statement) || ts.isModuleDeclaration(statement))) {
      if (statement.name && ts.isIdentifier(statement.name)) names.add(statement.name.text);
      continue;
    }
    if (exported && ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        for (const name of bindingNames(declaration.name)) names.add(name);
      }
      continue;
    }
    if (!ts.isExportDeclaration(statement)) continue;

    const target = statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)
      ? resolveSourceModule(root, filePath, statement.moduleSpecifier.text)
      : null;

    if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
      for (const element of statement.exportClause.elements) names.add(element.name.text);
      continue;
    }
    if (statement.exportClause && ts.isNamespaceExport(statement.exportClause)) {
      names.add(statement.exportClause.name.text);
      continue;
    }
    // `export * from '...'`
    if (!target) {
      complete = false;
      continue;
    }
    const inherited = moduleExports(root, target, cache, stack);
    for (const name of inherited.names) names.add(name);
    if (!inherited.complete) complete = false;
  }

  stack.delete(filePath);
  const result = { names, complete };
  cache.set(filePath, result);
  return result;
}

function namedValueBindings(statement) {
  if (ts.isImportDeclaration(statement)) {
    const clause = statement.importClause;
    if (!clause || clause.isTypeOnly) return [];
    const bindings = clause.namedBindings;
    if (!bindings || !ts.isNamedImports(bindings)) return [];
    return bindings.elements
      .filter((element) => !element.isTypeOnly)
      .map((element) => (element.propertyName ?? element.name).text);
  }
  if (ts.isExportDeclaration(statement)) {
    if (statement.isTypeOnly || !statement.exportClause || !ts.isNamedExports(statement.exportClause)) return [];
    return statement.exportClause.elements
      .filter((element) => !element.isTypeOnly)
      .map((element) => (element.propertyName ?? element.name).text);
  }
  return [];
}

/**
 * Fails when a module imports or re-exports a named binding its target does not
 * publish. TypeScript catches this on a typecheck, but a deep-path rewrite lands
 * as `undefined` at runtime long before anyone runs one: the alias for a compound
 * primitive can live in a parent barrel while the deep module publishes only the
 * long name, so every rewritten importer silently renders an invalid element.
 */
export function runImportBindingIntegrityGate({ root = DEFAULT_ROOT, silent = false } = {}) {
  const sourceRoot = path.join(root, 'src');
  const files = collectSourceFiles(sourceRoot);
  const cache = new Map();
  const failures = [];
  let checkedEdges = 0;
  let skippedIncomplete = 0;

  for (const filePath of files) {
    for (const statement of parseModule(filePath).statements) {
      if (!ts.isImportDeclaration(statement) && !ts.isExportDeclaration(statement)) continue;
      const specifierNode = statement.moduleSpecifier;
      if (!specifierNode || !ts.isStringLiteral(specifierNode)) continue;
      const names = namedValueBindings(statement);
      if (names.length === 0) continue;
      const target = resolveSourceModule(root, filePath, specifierNode.text);
      if (!target) continue;

      const published = moduleExports(root, target, cache);
      if (!published.complete) {
        skippedIncomplete += 1;
        continue;
      }
      checkedEdges += 1;
      for (const name of names) {
        if (published.names.has(name)) continue;
        failures.push(
          `${relative(root, filePath)} imports "${name}" from "${specifierNode.text}" `
          + `(${relative(root, target)}) which does not publish it`,
        );
      }
    }
  }

  if (failures.length > 0) {
    throw new Error(`Import binding integrity gate failed:\n- ${failures.join('\n- ')}`);
  }
  if (!silent) {
    console.log(`PASS import-binding-integrity modules=${files.length} edges=${checkedEdges} unresolvable=${skippedIncomplete}`);
  }
  return { modules: files.length, checkedEdges, skippedIncomplete };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runImportBindingIntegrityGate();
}
