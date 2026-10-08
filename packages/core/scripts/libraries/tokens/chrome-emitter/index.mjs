/**
 * chrome-emitter — the one authority for which files ARE the chrome CSS
 * variable emitter (`kernel/foundation/css/chrome-variables`).
 *
 * Every instrument that reads the emitter (theme parity, the hook manifest,
 * tenant reach, cascade producers) takes its file list from here, so a file
 * the emitter grows can never be read by one reader and missed by another.
 *
 * The list is CLOSED and checked three ways against the real tree before any
 * reader may use it:
 *   - the productive inventory: every non-test source file under the folder;
 *   - the value-import closure of the root `index.ts` (type-only imports,
 *     comments, strings and `tests/` are not edges; targets outside the folder
 *     are not members);
 *   - the declared members below.
 * The three sets must be equal. An orphan file, a declared file nobody
 * imports, or a new undeclared import each throws; nothing is admitted by
 * directory or by name pattern.
 *
 * A `data` member must be data only: type-only imports, type declarations and
 * `const` bindings to object/array literals or `chromeVariableMap(...)` calls
 * (optionally wrapped in `as` / `satisfies`). A bare identifier is data only when
 * it names an earlier admitted const of the same member. The one admitted helper
 * is the existing `chromeVariableMap` arrow, matched by its exact syntax tree. A
 * writer, a function, a statement or a value import in a data member throws.
 *
 * A `writer` member holds template-free channel writers only: type-only
 * imports, type declarations, plain function declarations and one trailing
 * `export { … }` naming exactly those functions. A writer imports no value: a
 * writer -> data edge is a sibling-owner dependency the structure law refuses.
 * Every call site stays in the root, and no writer builds a channel name from a
 * template, because the readers that attribute interpolated emissions by
 * `${file}::${fn}` and the census that resolves literal call sites read one file.
 * The root must import exactly the exported writers and may not shadow them.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';

import ts from 'typescript';

export const CHROME_EMITTER_DIR = 'src/infrastructure/compilers/kernel/foundation/css/chrome-variables';

export const CHROME_EMITTER_FILES = Object.freeze([
  Object.freeze({ path: 'index.ts', role: 'root' }),
  Object.freeze({ path: 'tables/index.ts', role: 'data' }),
  Object.freeze({ path: 'writers/index.ts', role: 'writer' }),
]);

const CHROME_EMITTER_ROLES = Object.freeze(['root', 'data', 'writer']);

const NON_PRODUCTIVE_DIRS = new Set(['tests', 'test', '__tests__', 'fixtures', '__fixtures__', 'stories']);
const SOURCE_FILE = /\.(?:ts|tsx|mts|cts|js|mjs|cjs|jsx)$/;
const NON_PRODUCTIVE_FILE = /(?:\.d\.ts|\.(?:test|spec|stories)\.[cm]?[jt]sx?)$/;
const RESOLVE_SUFFIXES = ['.ts', '.tsx', `${sep}index.ts`, `${sep}index.tsx`];
const ADMITTED_HELPER = 'chromeVariableMap';
// The admitted helper's syntax tree, printed without comments; compared token by token (kind and exact raw
// text, literals byte for byte), ignoring whitespace, comments and trailing commas.
const ADMITTED_HELPER_TREE = `<T extends object>(prefix: string, fields: readonly (keyof T)[]): Readonly<Record<keyof T, string>> =>
  Object.fromEntries(fields.map((field) => [field, \`\${prefix}\${String(field).replace(/[A-Z]/g, (letter) => \`-\${letter.toLowerCase()}\`)}\`]))
  as Readonly<Record<keyof T, string>>`;
const HELPER_PRINTER = ts.createPrinter({ removeComments: true, newLine: ts.NewLineKind.LineFeed });
const CLOSERS = new Set([
  ts.SyntaxKind.CloseParenToken,
  ts.SyntaxKind.CloseBracketToken,
  ts.SyntaxKind.CloseBraceToken,
  ts.SyntaxKind.GreaterThanToken,
]);
const EXPRESSION_ENDS = new Set([
  ts.SyntaxKind.Identifier,
  ts.SyntaxKind.PrivateIdentifier,
  ts.SyntaxKind.NumericLiteral,
  ts.SyntaxKind.BigIntLiteral,
  ts.SyntaxKind.StringLiteral,
  ts.SyntaxKind.NoSubstitutionTemplateLiteral,
  ts.SyntaxKind.TemplateTail,
  ts.SyntaxKind.RegularExpressionLiteral,
  ts.SyntaxKind.CloseParenToken,
  ts.SyntaxKind.CloseBracketToken,
  ts.SyntaxKind.CloseBraceToken,
  ts.SyntaxKind.ThisKeyword,
  ts.SyntaxKind.SuperKeyword,
  ts.SyntaxKind.TrueKeyword,
  ts.SyntaxKind.FalseKeyword,
  ts.SyntaxKind.NullKeyword,
  ts.SyntaxKind.PlusPlusToken,
  ts.SyntaxKind.MinusMinusToken,
]);

/** Tokens as kind + exact raw text (literals byte for byte); trivia and closer-trailing commas drop. Null if unscannable. */
function canonicalHelperTokens(text) {
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, true, ts.LanguageVariant.Standard, text);
  const tokens = [];
  const braces = [];
  for (let kind = scanner.scan(); kind !== ts.SyntaxKind.EndOfFileToken; kind = scanner.scan()) {
    if (kind === ts.SyntaxKind.CloseBraceToken && braces.at(-1) === 'template') {
      braces.pop();
      kind = scanner.reScanTemplateToken(false);
    } else if (
      (kind === ts.SyntaxKind.SlashToken || kind === ts.SyntaxKind.SlashEqualsToken) &&
      !EXPRESSION_ENDS.has(tokens.at(-1)?.kind)
    ) {
      kind = scanner.reScanSlashToken();
    }
    if (kind === ts.SyntaxKind.Unknown || scanner.isUnterminated()) return null;
    if (kind === ts.SyntaxKind.TemplateHead || kind === ts.SyntaxKind.TemplateMiddle) braces.push('template');
    else if (kind === ts.SyntaxKind.OpenBraceToken) braces.push('brace');
    else if (kind === ts.SyntaxKind.CloseBraceToken) braces.pop();
    tokens.push({ kind, text: scanner.getTokenText() });
  }
  return tokens
    .filter((token, index) => token.kind !== ts.SyntaxKind.CommaToken || !CLOSERS.has(tokens[index + 1]?.kind))
    .map((token) => `${ts.SyntaxKind[token.kind]} ${token.text}`);
}

const toPosix = (path) => path.split(sep).join('/');

function fail(message) {
  throw new Error(`chrome-emitter: ${message}`);
}

/** Every productive source file under the emitter folder, folder-relative. */
export function chromeEmitterInventory(emitterDir) {
  const found = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!NON_PRODUCTIVE_DIRS.has(entry.name)) walk(full);
        continue;
      }
      if (SOURCE_FILE.test(entry.name) && !NON_PRODUCTIVE_FILE.test(entry.name)) {
        found.push(toPosix(relative(emitterDir, full)));
      }
    }
  };
  walk(emitterDir);
  return found.sort();
}

function parse(file, text) {
  return ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function isTypeOnlyImport(node) {
  const clause = node.importClause;
  if (!clause) return false;
  if (clause.isTypeOnly) return true;
  if (clause.name) return false;
  const bindings = clause.namedBindings;
  return Boolean(
    bindings &&
      ts.isNamedImports(bindings) &&
      bindings.elements.length > 0 &&
      bindings.elements.every((element) => element.isTypeOnly),
  );
}

/** Module specifiers a file depends on at RUNTIME. */
export function valueImportSpecifiers(sourceFile) {
  const specifiers = [];
  const visit = (node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      if (!isTypeOnlyImport(node)) specifiers.push(node.moduleSpecifier.text);
    } else if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      !node.isTypeOnly
    ) {
      specifiers.push(node.moduleSpecifier.text);
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments[0] &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      specifiers.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return specifiers;
}

function resolveSpecifier(coreRoot, fromFile, specifier) {
  let base;
  if (specifier.startsWith('.')) base = resolve(dirname(fromFile), specifier);
  else if (specifier.startsWith('@/')) base = join(coreRoot, 'src', specifier.slice(2));
  else return null;
  base = base.replace(/\.(?:js|ts)$/, '');
  for (const suffix of RESOLVE_SUFFIXES) {
    if (existsSync(`${base}${suffix}`)) return `${base}${suffix}`;
  }
  return { unresolved: base };
}

/** The value-import closure of the root, restricted to the emitter folder. */
export function chromeEmitterClosure(coreRoot, emitterDir = join(coreRoot, CHROME_EMITTER_DIR)) {
  const rootFile = join(emitterDir, 'index.ts');
  if (!existsSync(rootFile)) fail(`root ${toPosix(relative(coreRoot, rootFile))} is missing`);
  const members = new Set();
  const queue = [rootFile];
  while (queue.length > 0) {
    const file = queue.shift();
    const rel = toPosix(relative(emitterDir, file));
    if (members.has(rel)) continue;
    members.add(rel);
    for (const specifier of valueImportSpecifiers(parse(file, readFileSync(file, 'utf8')))) {
      const target = resolveSpecifier(coreRoot, file, specifier);
      if (target === null) continue;
      const targetPath = typeof target === 'string' ? target : target.unresolved;
      const inside = relative(emitterDir, targetPath);
      if (inside.startsWith('..') || inside === '') continue;
      if (inside.split(sep).some((segment) => NON_PRODUCTIVE_DIRS.has(segment))) continue;
      if (typeof target !== 'string') fail(`${rel} imports "${specifier}", which resolves to no file`);
      queue.push(target);
    }
  }
  return [...members].sort();
}

function unwrap(node) {
  let current = node;
  while (
    ts.isAsExpression(current) ||
    ts.isSatisfiesExpression(current) ||
    ts.isParenthesizedExpression(current) ||
    ts.isTypeAssertionExpression(current)
  ) {
    current = current.expression;
  }
  return current;
}

function isDataValue(node, admitted) {
  const value = unwrap(node);
  if (ts.isIdentifier(value)) return admitted.has(value.text) && value.text !== ADMITTED_HELPER;
  if (
    ts.isStringLiteralLike(value) ||
    ts.isNumericLiteral(value) ||
    value.kind === ts.SyntaxKind.TrueKeyword ||
    value.kind === ts.SyntaxKind.FalseKeyword ||
    value.kind === ts.SyntaxKind.NullKeyword
  ) {
    return true;
  }
  if (ts.isArrayLiteralExpression(value)) return value.elements.every((element) => isDataValue(element, admitted));
  if (ts.isObjectLiteralExpression(value)) {
    return value.properties.every(
      (property) =>
        ts.isPropertyAssignment(property) &&
        !ts.isComputedPropertyName(property.name) &&
        isDataValue(property.initializer, admitted),
    );
  }
  if (ts.isCallExpression(value)) {
    return (
      ts.isIdentifier(value.expression) &&
      value.expression.text === ADMITTED_HELPER &&
      value.arguments.every((argument) => isDataValue(argument, admitted))
    );
  }
  return false;
}

function isAdmittedHelper(initializer, sourceFile) {
  const candidate = canonicalHelperTokens(HELPER_PRINTER.printNode(ts.EmitHint.Expression, initializer, sourceFile));
  const admitted = canonicalHelperTokens(ADMITTED_HELPER_TREE);
  return (
    candidate !== null &&
    admitted !== null &&
    candidate.length === admitted.length &&
    candidate.every((token, index) => token === admitted[index])
  );
}

/** Violations of the data-only grammar for one member; empty means data only. */
export function dataOnlyViolations(file, text) {
  const sourceFile = parse(file, text);
  const violations = [];
  const at = (node) => sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
  let helpers = 0;
  const admitted = new Set();
  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement)) {
      if (!statement.importClause?.isTypeOnly) violations.push(`:${at(statement)} value import`);
      continue;
    }
    if (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) continue;
    if (!ts.isVariableStatement(statement)) {
      violations.push(`:${at(statement)} ${ts.SyntaxKind[statement.kind]}`);
      continue;
    }
    if ((statement.declarationList.flags & ts.NodeFlags.Const) === 0) {
      violations.push(`:${at(statement)} non-const binding`);
      continue;
    }
    for (const declaration of statement.declarationList.declarations) {
      const name = ts.isIdentifier(declaration.name) ? declaration.name.text : null;
      const initializer = declaration.initializer && unwrap(declaration.initializer);
      if (!name || !initializer) {
        violations.push(`:${at(declaration)} unsupported binding`);
        continue;
      }
      if (name === ADMITTED_HELPER && !ts.isCallExpression(initializer)) {
        helpers += 1;
        if (helpers > 1) violations.push(`:${at(declaration)} second ${ADMITTED_HELPER}`);
        if (!isAdmittedHelper(declaration.initializer, sourceFile)) {
          violations.push(`:${at(declaration)} ${ADMITTED_HELPER} is not the admitted helper`);
        }
        continue;
      }
      if (isDataValue(initializer, admitted)) admitted.add(name);
      else violations.push(`:${at(declaration)} ${name} is not data`);
    }
  }
  return violations;
}

/** Violations of the closed role list: exactly one member per role, no other role. */
export function chromeEmitterRoleViolations(files) {
  const violations = [];
  for (const entry of files) {
    if (!CHROME_EMITTER_ROLES.includes(entry.role)) violations.push(`${entry.path} has unknown role "${entry.role}"`);
  }
  for (const role of CHROME_EMITTER_ROLES) {
    const count = files.filter((entry) => entry.role === role).length;
    if (count !== 1) violations.push(`role ${role} has ${count} members, not 1`);
  }
  return violations;
}

const hasModifier = (node, kind) => Boolean(node.modifiers?.some((modifier) => modifier.kind === kind));

/** Top-level function declaration names of a parsed member. */
function declaredFunctionNames(sourceFile) {
  return sourceFile.statements
    .filter((statement) => ts.isFunctionDeclaration(statement) && statement.name)
    .map((statement) => statement.name.text);
}

/** Violations of the writer grammar for one member; empty means admitted. */
export function writerViolations(file, text) {
  const sourceFile = parse(file, text);
  const violations = [];
  const at = (node) => sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
  const functions = declaredFunctionNames(sourceFile);
  const statements = sourceFile.statements;
  let exportList = null;
  statements.forEach((statement, index) => {
    if (ts.isImportDeclaration(statement)) {
      if (statement.importClause?.isTypeOnly) return;
      violations.push(`:${at(statement)} value import of "${statement.moduleSpecifier.text}" (sibling-owner-dependency)`);
      return;
    }
    if (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) return;
    if (ts.isFunctionDeclaration(statement)) {
      const name = statement.name?.text ?? '<anonymous>';
      if (hasModifier(statement, ts.SyntaxKind.ExportKeyword)) violations.push(`:${at(statement)} inline export of ${name}`);
      if (hasModifier(statement, ts.SyntaxKind.AsyncKeyword) || statement.asteriskToken) violations.push(`:${at(statement)} ${name} is async or a generator`);
      if (!statement.body) violations.push(`:${at(statement)} ${name} has no body`);
      if (name === ADMITTED_HELPER) violations.push(`:${at(statement)} ${ADMITTED_HELPER} is not a writer`);
      return;
    }
    if (
      ts.isExportDeclaration(statement) &&
      !statement.moduleSpecifier &&
      !statement.isTypeOnly &&
      statement.exportClause &&
      ts.isNamedExports(statement.exportClause) &&
      index === statements.length - 1 &&
      exportList === null
    ) {
      exportList = statement.exportClause.elements;
      for (const element of exportList) {
        if (element.propertyName || element.isTypeOnly) violations.push(`:${at(element)} aliased or type-only export ${element.name.text}`);
      }
      return;
    }
    if (ts.isVariableStatement(statement)) {
      violations.push(`:${at(statement)} binding in a writer`);
      return;
    }
    violations.push(`:${at(statement)} ${ts.SyntaxKind[statement.kind]}`);
  });
  const exported = (exportList ?? []).map((element) => (element.propertyName ?? element.name).text);
  if (exportList === null) violations.push('no single trailing export list');
  else if (exported.length !== functions.length || [...exported].sort().join() !== [...functions].sort().join()) {
    violations.push(`export list [${exported.join(', ')}] is not the declared writers [${functions.join(', ')}]`);
  }
  const writerNames = new Set(functions);
  const visit = (node) => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && writerNames.has(node.expression.text)) {
      violations.push(`:${at(node)} writer calls writer ${node.expression.text}`);
    }
    if (
      ts.isElementAccessExpression(node) &&
      (ts.isTemplateExpression(node.argumentExpression) || ts.isNoSubstitutionTemplateLiteral(node.argumentExpression))
    ) {
      violations.push(`:${at(node)} template channel key`);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return violations;
}

/** Names a parsed file value-imports from one absolute target. */
function importedNamesFrom(sourceFile, resolveImport, target) {
  const names = [];
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || statement.importClause?.isTypeOnly) continue;
    if (!ts.isStringLiteral(statement.moduleSpecifier) || resolveImport(statement.moduleSpecifier.text) !== target) continue;
    const bindings = statement.importClause?.namedBindings;
    if (bindings && ts.isNamedImports(bindings)) {
      for (const element of bindings.elements) if (!element.isTypeOnly) names.push((element.propertyName ?? element.name).text);
    } else {
      names.push('<non-named import>');
    }
  }
  return names;
}

/**
 * The validated emitter files, absolute, in declared order. Throws unless the
 * inventory, the value-import closure and the declared list are one set and
 * every data member is data only.
 */
export function chromeEmitterSources(coreRoot) {
  const roles = chromeEmitterRoleViolations(CHROME_EMITTER_FILES);
  if (roles.length > 0) fail(roles.join('; '));
  const dir = join(coreRoot, CHROME_EMITTER_DIR);
  const declared = CHROME_EMITTER_FILES.map((entry) => entry.path).sort();
  const inventory = chromeEmitterInventory(dir);
  const closure = chromeEmitterClosure(coreRoot, dir);
  const problems = [];
  for (const path of inventory) if (!closure.includes(path)) problems.push(`orphan ${path} is not imported by the root`);
  for (const path of declared) if (!closure.includes(path)) problems.push(`declared ${path} is not imported by the root`);
  for (const path of closure) if (!declared.includes(path)) problems.push(`undeclared ${path} is imported by the root`);
  if (problems.length > 0) fail(problems.join('; '));
  const memberOf = (role) => join(dir, CHROME_EMITTER_FILES.find((entry) => entry.role === role).path);
  const rootFile = memberOf('root');
  const dataFile = memberOf('data');
  const writerFile = memberOf('writer');
  const resolverFor = (file) => (specifier) => {
    const target = resolveSpecifier(coreRoot, file, specifier);
    return typeof target === 'string' ? target : null;
  };
  const dataViolations = dataOnlyViolations(dataFile, readFileSync(dataFile, 'utf8'));
  if (dataViolations.length > 0) fail(`data member ${relative(dir, dataFile)} is not data only: ${dataViolations.join(', ')}`);
  const writerText = readFileSync(writerFile, 'utf8');
  const writerProblems = writerViolations(writerFile, writerText);
  if (writerProblems.length > 0) fail(`writer member ${relative(dir, writerFile)} is not a writer: ${writerProblems.join(', ')}`);
  const rootSource = parse(rootFile, readFileSync(rootFile, 'utf8'));
  const writers = declaredFunctionNames(parse(writerFile, writerText));
  const imported = importedNamesFrom(rootSource, resolverFor(rootFile), writerFile);
  const rootFunctions = declaredFunctionNames(rootSource);
  const crossProblems = [];
  if ([...new Set(imported)].sort().join() !== [...writers].sort().join() || imported.length !== writers.length) {
    crossProblems.push(`the root imports [${imported.join(', ')}] from the writer, not its writers [${writers.join(', ')}]`);
  }
  for (const name of writers) if (rootFunctions.includes(name)) crossProblems.push(`the root shadows writer ${name}`);
  const seen = new Set();
  for (const name of [...rootFunctions, ...writers]) {
    if (seen.has(name)) crossProblems.push(`function ${name} is declared twice across members`);
    seen.add(name);
  }
  if (crossProblems.length > 0) fail(crossProblems.join('; '));
  return CHROME_EMITTER_FILES.map((entry) => join(dir, entry.path));
}
