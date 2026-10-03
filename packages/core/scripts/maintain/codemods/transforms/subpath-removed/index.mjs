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
  const named = (elements) => ({
    shape: 'named', elements, names: elements.map((element) => (element.propertyName ?? element.name).text),
  });
  if (ts.isExportDeclaration(statement)) {
    const clause = statement.exportClause;
    if (!clause) return { shape: 'star-reexport' };
    if (ts.isNamespaceExport(clause)) return { shape: 'namespace-reexport' };
    return named([...clause.elements]);
  }
  const clause = statement.importClause;
  if (!clause) return { shape: 'side-effect' };
  if (clause.name) return { shape: 'default-import' };
  if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) return { shape: 'namespace-import' };
  return named([...(clause.namedBindings?.elements ?? [])]);
}

/** The specifier keeps its local name: `Old` becomes `New as Old`, `Old as Local` becomes `New as Local`. */
function renameEdit(analysis, element, next) {
  if (element.propertyName) {
    return { start: element.propertyName.getStart(analysis.sourceFile), end: element.propertyName.end, text: next };
  }
  return { start: element.name.getStart(analysis.sourceFile), end: element.name.end, text: `${next} as ${element.name.text}` };
}

/**
 * A subpath that left the package. A declaration is re-pointed only when every name it lists is published by
 * the target door (or the map renames it there); namespace, default and dynamic imports and stylesheets are reported.
 * A name with a symbol entry keyed on the retired door moves to that entry's successor or holds the declaration back.
 */
export const transform = {
  class: CLASS,
  run(context, analysis, entries) {
    const { packageName } = context;
    if (!analysis.text.includes(packageName)) return [];
    const bySubpath = new Map(entries.map((entry) => [entry.subpath, entry]));
    const findings = [];
    const handled = new Set();
    analysis.doorRenamed = handled;

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
      const { shape, names, elements } = importedNames(statement);
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
      // A name the map retires on this door is never the target door's homonym: it follows its own entry.
      const retired = (name) => context.map.symbolIndex.get(symbolKey(entry.subpath, name)) ?? null;
      const renames = (name) => {
        const own = retired(name);
        return own?.class === 'symbol-removed' && own.mode === 'rewrite' && own.replacement.subpath === target
          && published.has(own.replacement.symbol) ? own : null;
      };
      const quoted = (list) => list.map((name) => `\`${name}\``).join(', ');
      const missing = names.filter((name) => !renames(name) && !published.has(name) && !moves(name));
      if (missing.length > 0) {
        findings.push(report(analysis, entry, statement, 'not-exported-at-target',
          `${label}: the target door does not publish ${quoted(missing)}`));
        return;
      }
      const held = names.filter((name) => retired(name) && !renames(name));
      if (held.length > 0) {
        findings.push(report(analysis, entry, statement, 'retired-on-door',
          `${label}: ${quoted(held)} ${held.length === 1 ? 'is' : 'are'} retired on this door with no successor the kit can write, `
          + 'so the declaration stays on the old door; a name the target door also publishes is a different export'));
        return;
      }
      const renamed = elements.filter((element) => renames((element.propertyName ?? element.name).text));
      if (entry.mode !== 'report-only') {
        for (const element of renamed) {
          const own = renames((element.propertyName ?? element.name).text);
          findings.push(rewrite(analysis, own, element, 'import-binding-aliased',
            `\`${own.symbol}\` -> \`${own.replacement.symbol}\` on \`${target}\`; the import keeps its local name`,
            [renameEdit(analysis, element, own.replacement.symbol)]));
          handled.add(element);
        }
      }
      findings.push(rewrite(analysis, entry, statement, 'specifier-repointed',
        `${label}; ${names.length - renamed.length} name(s) verified on the target door`
        + `${renamed.length > 0 ? `, ${renamed.length} moved to the successor the map records` : ''}`, edits));
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
