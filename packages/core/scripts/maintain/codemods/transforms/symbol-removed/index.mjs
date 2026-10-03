import ts from 'typescript';
import { reachesByPublishedName } from '../../resolve/index.mjs';
import { replaceNode, report, rewrite } from '../../resolve/findings/index.mjs';
import { referencesOf, symbolKey, symbolSites } from '../../resolve/usages/index.mjs';

function nameIsTaken(analysis, name) {
  let taken = false;
  analysis.walk((node) => {
    if (!taken && ts.isIdentifier(node) && node.text === name) taken = true;
  });
  return taken;
}

function referenceEdit(analysis, reference, oldName, newName) {
  const parent = reference.parent;
  if (ts.isShorthandPropertyAssignment(parent)) return replaceNode(analysis, reference, `${oldName}: ${newName}`);
  if (ts.isExportSpecifier(parent) && !parent.propertyName) {
    return replaceNode(analysis, reference, `${newName} as ${oldName}`);
  }
  return replaceNode(analysis, reference, newName);
}

function isReplacement(origin, entry) {
  return origin.kind === 'ds' && origin.subpath === entry.replacement.subpath
    && origin.name === entry.replacement.symbol && origin.members.length === 0;
}

/** True when the replacement name, read through the same specifier or namespace, is not the design system's. */
function shadowed(context, analysis, entry, site) {
  const next = entry.replacement.symbol;
  const { workspace } = context;
  if (site.type === 'import' || site.type === 'reexport') {
    let statement = site.node;
    while (!ts.isImportDeclaration(statement) && !ts.isExportDeclaration(statement)) statement = statement.parent;
    return !isReplacement(workspace.resolveImport(analysis.file, statement.moduleSpecifier.text, next), entry);
  }
  if (site.type === 'member' || site.type === 'element-access') {
    const base = analysis.originOfExpression(ts.isQualifiedName(site.node) ? site.node.left : site.node.expression);
    return !isReplacement(workspace.memberOf(base, next), entry);
  }
  return false;
}

function rewriteImport(analysis, entry, site, label) {
  const specifier = site.node;
  const next = entry.replacement.symbol;
  if (specifier.propertyName) {
    const edits = specifier.name.text === next
      ? [{ start: specifier.propertyName.getStart(analysis.sourceFile), end: specifier.name.end, text: next }]
      : [replaceNode(analysis, specifier.propertyName, next)];
    return rewrite(analysis, entry, specifier, 'import-binding', `${label}; the local alias is kept`, edits);
  }
  if (nameIsTaken(analysis, next)) {
    return rewrite(analysis, entry, specifier, 'import-binding-aliased',
      `${label}; \`${next}\` is already a name in this file, so the import keeps its local name`,
      [replaceNode(analysis, specifier.name, `${next} as ${specifier.name.text}`)]);
  }
  const references = referencesOf(analysis, specifier);
  const edits = [
    replaceNode(analysis, specifier.name, next),
    ...references.map((reference) => referenceEdit(analysis, reference, specifier.name.text, next)),
  ];
  return rewrite(analysis, entry, specifier, 'import-binding',
    `${label}; ${references.length} reference(s) follow the binding`, edits);
}

/**
 * A retired export with a public replacement of the same meaning: the import
 * binding moves to the published name and every reference bound to it follows.
 */
export const transform = {
  class: 'symbol-removed',
  run(context, analysis, entries) {
    const findings = [];
    const sites = symbolSites(analysis, context.map.memberRoots);
    for (const entry of entries) {
      const next = entry.replacement.symbol;
      const label = `\`${entry.symbol}\` -> \`${next}\`${entry.note ? ` (${entry.note})` : ''}`;
      for (const site of sites.get(symbolKey(entry.subpath, entry.symbol)) ?? []) {
        if (entry.replacement.subpath !== entry.subpath) {
          findings.push(report(analysis, entry, site.node, 'cross-subpath',
            `${label} lives on \`${entry.replacement.subpath}\`; move the import by hand`));
        } else if (!reachesByPublishedName(site.origin)) {
          const hop = site.origin.hops.find((item) => item.kind === 'named' || item.kind === 'alias');
          findings.push(report(analysis, entry, site.node, 'indirect',
            `${label}: reached under a consumer-owned name declared in ${context.relative(hop.file)}; resolved at that declaration`));
        } else if (shadowed(context, analysis, entry, site)) {
          findings.push(report(analysis, entry, site.node, 'replacement-shadowed',
            `${label}: through this specifier \`${next}\` does not resolve to the design system (a consumer module declares its own); rename by hand`));
        } else if (site.type === 'import') {
          findings.push(rewriteImport(analysis, entry, site, label));
        } else if (site.type === 'reexport') {
          const element = site.node;
          const edits = element.propertyName
            ? [element.name.text === next
              ? { start: element.propertyName.getStart(analysis.sourceFile), end: element.name.end, text: next }
              : replaceNode(analysis, element.propertyName, next)]
            : [replaceNode(analysis, element.name, `${next} as ${element.name.text}`)];
          findings.push(rewrite(analysis, entry, element, 're-export',
            `${label}; the consumer module keeps exporting its own name`, edits));
        } else if (site.type === 'member') {
          findings.push(rewrite(analysis, entry, site.node, 'namespace-member', label,
            [replaceNode(analysis, site.nameNode, next)]));
        } else if (site.type === 'element-access') {
          const literal = site.nameNode;
          findings.push(rewrite(analysis, entry, site.node, 'namespace-member', label,
            [{ start: literal.getStart(analysis.sourceFile) + 1, end: literal.end - 1, text: next }]));
        } else if (site.type === 'import-type') {
          findings.push(rewrite(analysis, entry, site.node, 'import-type', label,
            [replaceNode(analysis, site.node.qualifier, next)]));
        } else {
          findings.push(report(analysis, entry, site.node, 'destructured',
            `${label}: destructured from a namespace; rename the binding by hand`));
        }
      }
    }
    return findings;
  },
};
