import ts from 'typescript';
import { dsSubpath, specifierFor } from '../../resolve/index.mjs';
import { report, rewrite } from '../../resolve/findings/index.mjs';
import { symbolKey } from '../../resolve/usages/index.mjs';

const CLASS = 'subpath-removed';

function unmappedEntry(subpath) {
  return { id: `${CLASS}/${subpath}#*`, class: CLASS, subpath, symbol: '*' };
}

function specifierEdit(analysis, literal, target, packageName) {
  return [{ start: literal.getStart(analysis.sourceFile) + 1, end: literal.end - 1, text: specifierFor(target, packageName) }];
}

function importedNames(statement) {
  if (ts.isExportDeclaration(statement)) {
    const clause = statement.exportClause;
    if (!clause) return { shape: 'star-reexport' };
    if (ts.isNamespaceExport(clause)) return { shape: 'namespace-reexport' };
    return { shape: 'named', names: clause.elements.map((element) => (element.propertyName ?? element.name).text) };
  }
  const clause = statement.importClause;
  if (!clause) return { shape: 'side-effect' };
  if (clause.name) return { shape: 'default-import' };
  if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) return { shape: 'namespace-import' };
  return { shape: 'named', names: (clause.namedBindings?.elements ?? []).map((element) => (element.propertyName ?? element.name).text) };
}

/**
 * A subpath that left the package. A declaration is re-pointed only when every name it lists is published by
 * the target door (or the map renames it there); namespace, default and dynamic imports and stylesheets are reported.
 */
export const transform = {
  class: CLASS,
  run(context, analysis, entries) {
    const { packageName } = context;
    if (!analysis.text.includes(packageName)) return [];
    const bySubpath = new Map(entries.map((entry) => [entry.subpath, entry]));
    const findings = [];

    const lookup = (literal) => {
      const subpath = context.workspace.packageSubpath(literal.text, analysis.file);
      if (!subpath) return null;
      const entry = bySubpath.get(subpath);
      if (entry) return entry;
      if (context.surface && !context.surface.isPublished(subpath) && !context.options.only) {
        findings.push(report(analysis, unmappedEntry(subpath), literal, 'unmapped-unpublished-subpath',
          `\`${subpath}\` is not published by this package and the map has no entry for it`));
      }
      return null;
    };

    const visitDeclaration = (statement) => {
      const literal = statement.moduleSpecifier;
      const entry = lookup(literal);
      if (!entry) return;
      const label = `\`${entry.subpath}\`${entry.replacement ? ` -> \`${entry.replacement.subpath}\`` : ' is removed'}`;
      if (!entry.replacement) {
        findings.push(report(analysis, entry, statement, 'no-target', `${label}. ${entry.guidance ?? ''}`.trim()));
        return;
      }
      const target = entry.replacement.subpath;
      const edits = specifierEdit(analysis, literal, target, packageName);
      const { shape, names } = importedNames(statement);
      if (entry.kind === 'stylesheet') {
        findings.push(rewrite(analysis, entry, statement, 'specifier-repointed', label, edits));
        return;
      }
      if (shape !== 'named') {
        findings.push(report(analysis, entry, statement, shape,
          `${label}: a ${shape.replace('-', ' ')} cannot be checked name by name against the target door; re-point it by hand`));
        return;
      }
      const published = context.surface?.exportsOf(target) ?? null;
      if (!published) {
        findings.push(report(analysis, entry, statement, 'target-surface-unknown',
          `${label}: the exports of the target door are not readable from this checkout, so no name can be verified`));
        return;
      }
      const moves = (name) => context.map.symbolIndex.get(symbolKey(target, name))?.class === 'symbol-removed';
      const missing = names.filter((name) => !published.has(name) && !moves(name));
      if (missing.length > 0) {
        findings.push(report(analysis, entry, statement, 'not-exported-at-target',
          `${label}: the target door does not publish ${missing.map((name) => `\`${name}\``).join(', ')}`));
        return;
      }
      findings.push(rewrite(analysis, entry, statement, 'specifier-repointed',
        `${label}; ${names.length} name(s) verified on the target door`, edits));
    };

    for (const statement of analysis.sourceFile.statements) {
      if ((ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement))
        && statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)) visitDeclaration(statement);
    }
    analysis.walk((node) => {
      let literal = null;
      if (ts.isCallExpression(node) && node.arguments.length > 0 && ts.isStringLiteralLike(node.arguments[0])) {
        literal = node.arguments[0];
      } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)
        && ts.isStringLiteral(node.argument.literal)) {
        literal = node.argument.literal;
      }
      if (!literal) return;
      const entry = lookup(literal);
      if (!entry) return;
      findings.push(report(analysis, entry, node, 'dynamic-import',
        `\`${entry.subpath}\` is named by a call or type query (${entry.replacement ? `target \`${entry.replacement.subpath}\`` : 'no target'}); the names it reads are not statically listed`));
    });
    return findings;
  },

  runStylesheet(context, sheet, entries) {
    const findings = [];
    const { packageName } = context;
    if (!sheet.code.includes(packageName)) return findings;
    const bySubpath = new Map(entries.map((entry) => [entry.subpath, entry]));
    const pattern = new RegExp(`(?<![\\w@/.-])${packageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(/[\\w@/.*-]+)?(?![\\w/-])`, 'g');
    for (const hit of sheet.code.matchAll(pattern)) {
      const subpath = dsSubpath(hit[0], packageName);
      const entry = bySubpath.get(subpath);
      if (entry) {
        findings.push(sheet.report(entry, hit.index, hit[0], 'stylesheet-import',
          `\`${entry.subpath}\`${entry.replacement ? ` -> \`${entry.replacement.subpath}\`` : ' is removed'}: named in a stylesheet; stylesheets are reported, never rewritten`));
      } else if (context.surface && !context.surface.isPublished(subpath) && !context.options.only) {
        findings.push(sheet.report(unmappedEntry(subpath), hit.index, hit[0], 'unmapped-unpublished-subpath',
          `\`${subpath}\` is not published by this package and the map has no entry for it`));
      }
    }
    return findings;
  },
};
