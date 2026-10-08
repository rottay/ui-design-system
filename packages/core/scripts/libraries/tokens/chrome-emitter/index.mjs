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
 * (optionally wrapped in `as` / `satisfies`). The one admitted helper is the
 * existing `chromeVariableMap` arrow, matched by its exact syntax tree. A writer,
 * a function, a statement or a value import in a data member throws, because
 * the readers that attribute emissions by `${file}::${fn}` only look at the root.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';

import ts from 'typescript';

export const CHROME_EMITTER_DIR = 'src/infrastructure/compilers/kernel/foundation/css/chrome-variables';

export const CHROME_EMITTER_FILES = Object.freeze([
  Object.freeze({ path: 'index.ts', role: 'root' }),
  Object.freeze({ path: 'tables/index.ts', role: 'data' }),
]);

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

function isDataValue(node) {
  const value = unwrap(node);
  if (
    ts.isStringLiteralLike(value) ||
    ts.isNumericLiteral(value) ||
    ts.isIdentifier(value) ||
    value.kind === ts.SyntaxKind.TrueKeyword ||
    value.kind === ts.SyntaxKind.FalseKeyword ||
    value.kind === ts.SyntaxKind.NullKeyword
  ) {
    return true;
  }
  if (ts.isArrayLiteralExpression(value)) return value.elements.every(isDataValue);
  if (ts.isObjectLiteralExpression(value)) {
    return value.properties.every(
      (property) =>
        ts.isPropertyAssignment(property) &&
        !ts.isComputedPropertyName(property.name) &&
        isDataValue(property.initializer),
    );
  }
  if (ts.isCallExpression(value)) {
    return (
      ts.isIdentifier(value.expression) &&
      value.expression.text === ADMITTED_HELPER &&
      value.arguments.every(isDataValue)
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
      if (!isDataValue(initializer)) violations.push(`:${at(declaration)} ${name} is not data`);
    }
  }
  return violations;
}

/**
 * The validated emitter files, absolute, in declared order. Throws unless the
 * inventory, the value-import closure and the declared list are one set and
 * every data member is data only.
 */
export function chromeEmitterSources(coreRoot) {
  const dir = join(coreRoot, CHROME_EMITTER_DIR);
  const declared = CHROME_EMITTER_FILES.map((entry) => entry.path).sort();
  const inventory = chromeEmitterInventory(dir);
  const closure = chromeEmitterClosure(coreRoot, dir);
  const problems = [];
  for (const path of inventory) if (!closure.includes(path)) problems.push(`orphan ${path} is not imported by the root`);
  for (const path of declared) if (!closure.includes(path)) problems.push(`declared ${path} is not imported by the root`);
  for (const path of closure) if (!declared.includes(path)) problems.push(`undeclared ${path} is imported by the root`);
  if (problems.length > 0) fail(problems.join('; '));
  for (const entry of CHROME_EMITTER_FILES) {
    if (entry.role !== 'data') continue;
    const file = join(dir, entry.path);
    const violations = dataOnlyViolations(file, readFileSync(file, 'utf8'));
    if (violations.length > 0) fail(`data member ${entry.path} is not data only: ${violations.join(', ')}`);
  }
  return CHROME_EMITTER_FILES.map((entry) => join(dir, entry.path));
}
