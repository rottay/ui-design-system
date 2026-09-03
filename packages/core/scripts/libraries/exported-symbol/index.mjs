/**
 * exported-symbol — resolve an exported declaration by IDENTITY, not by text.
 *
 * WHY THIS EXISTS. The integration audit sliced its emitters between two string
 * markers and treated a missing start marker as an empty scope, so renaming an
 * emitter removed it from the scan with no diagnostic and exit 0. Its end
 * marker was worse than fragile: `export const compileBrandTheme` is a literal
 * PREFIX of `export const compileBrandThemeDeprecated`, and both are in the
 * file. `indexOf` picks the shorter one today, so the window is correct by
 * luck; rename the real declaration while the deprecated alias keeps a
 * prefix-compatible name and the window silently widens by 220 lines.
 *
 * Identifier equality on the declaration node separates the two exactly where
 * substring matching conflates them. The resolver is deliberately TOTAL: it
 * returns exactly one declaration or it throws. There is no empty-string
 * return, because "" is what let a broken fence read as a clean one.
 *
 * `typescript` is already a devDependency and is imported by 38 scripts under
 * `scripts/`; this adds no dependency.
 */
import ts from 'typescript';

import { readFileSync } from 'node:fs';

export class SymbolAbsentError extends Error {
  constructor(name, filePath) {
    super(`${filePath}: no exported declaration named ${name}`);
    this.name = 'SymbolAbsentError';
    this.symbol = name;
    this.filePath = filePath;
  }
}

export class SymbolAmbiguousError extends Error {
  constructor(name, filePath, lines) {
    super(`${filePath}: ${lines.length} exported declarations named ${name} (lines ${lines.join(', ')})`);
    this.name = 'SymbolAmbiguousError';
    this.symbol = name;
    this.filePath = filePath;
    this.lines = lines;
  }
}

function hasExportModifier(node) {
  return (node.modifiers ?? []).some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
}

/**
 * Every exported declaration in a source file, keyed by declared name.
 *
 * All declaration forms are counted. Missing one would undercount both absence
 * and duplication, which are the two verdicts this library exists to produce.
 * `export default` is deliberately excluded: it has no name, so a named lookup
 * for it must be an absence rather than a silent match.
 */
export function collectExportedDeclarations(filePath, sourceText) {
  const text = sourceText ?? readFileSync(filePath, 'utf8');
  const source = ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true);
  const found = [];
  const record = (name, kind, node) => {
    const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
    found.push({
      name,
      kind,
      line: line + 1,
      endLine: source.getLineAndCharacterOfPosition(node.getEnd()).line + 1,
      text: text.slice(node.getStart(source), node.getEnd()),
    });
  };

  for (const statement of source.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name && hasExportModifier(statement)) {
      record(statement.name.text, 'function', statement);
    } else if (ts.isClassDeclaration(statement) && statement.name && hasExportModifier(statement)) {
      record(statement.name.text, 'class', statement);
    } else if (ts.isEnumDeclaration(statement) && hasExportModifier(statement)) {
      record(statement.name.text, 'enum', statement);
    } else if (ts.isTypeAliasDeclaration(statement) && hasExportModifier(statement)) {
      record(statement.name.text, 'type', statement);
    } else if (ts.isInterfaceDeclaration(statement) && hasExportModifier(statement)) {
      record(statement.name.text, 'interface', statement);
    } else if (ts.isVariableStatement(statement) && hasExportModifier(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) record(declaration.name.text, 'const', declaration);
      }
    } else if (ts.isExportDeclaration(statement) && statement.exportClause
      && ts.isNamedExports(statement.exportClause)) {
      for (const specifier of statement.exportClause.elements) {
        record(specifier.name.text, 'export-specifier', specifier);
      }
    }
  }
  return found;
}

/**
 * Resolve `name` to EXACTLY ONE exported declaration. Throws otherwise; never
 * returns an empty scope.
 */
export function requireExactlyOneExportedDeclaration(filePath, name, sourceText) {
  const matches = collectExportedDeclarations(filePath, sourceText).filter(
    (declaration) => declaration.name === name,
  );
  if (matches.length === 0) throw new SymbolAbsentError(name, filePath);
  if (matches.length > 1) {
    throw new SymbolAmbiguousError(name, filePath, matches.map((match) => match.line));
  }
  return matches[0];
}

/**
 * Batch form. Every failure is aggregated before throwing, so one rename does
 * not hide the next.
 */
export function requireExportedDeclarations(filePath, names, sourceText) {
  const text = sourceText ?? readFileSync(filePath, 'utf8');
  const resolved = new Map();
  const failures = [];
  for (const name of names) {
    try {
      resolved.set(name, requireExactlyOneExportedDeclaration(filePath, name, text));
    } catch (error) {
      failures.push(error);
    }
  }
  if (failures.length > 0) {
    const aggregate = new Error(failures.map((failure) => failure.message).join('; '));
    aggregate.name = 'SymbolResolutionError';
    aggregate.failures = failures;
    throw aggregate;
  }
  return resolved;
}
