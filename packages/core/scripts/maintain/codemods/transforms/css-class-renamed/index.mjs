import ts from 'typescript';
import { report } from '../../resolve/findings/index.mjs';

function escape(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matcher(entries, tableOf, prefixesOf) {
  const owners = new Map();
  const prefixes = [];
  for (const entry of entries) {
    for (const name of Object.keys(tableOf(entry) ?? {})) owners.set(name, entry);
    for (const [from, to] of Object.entries(prefixesOf(entry) ?? {})) prefixes.push({ from, to, entry });
  }
  const names = [...owners.keys()].sort((left, right) => right.length - left.length).map(escape);
  const families = prefixes.map((prefix) => `${escape(prefix.from)}[\\w-]+`);
  if (names.length + families.length === 0) return null;
  const pattern = new RegExp(`(?<![\\w-])(${[...names, ...families].join('|')})(?![\\w-])`, 'g');
  const resolve = (token) => {
    if (owners.has(token)) return { entry: owners.get(token), successor: tableOf(owners.get(token))[token] };
    const prefix = prefixes.find((item) => token.startsWith(item.from));
    return { entry: prefix.entry, successor: `${prefix.to}${token.slice(prefix.from.length)}` };
  };
  return { pattern, resolve };
}

function classAttributeOwner(node) {
  let current = node.parent;
  while (current && !ts.isJsxAttribute(current)) {
    if (ts.isJsxElement(current) || ts.isStatement(current)) return null;
    current = current.parent;
  }
  if (!current || current.name.getText() !== 'className') return null;
  return current.parent.parent;
}

function describe(token, successor) {
  return successor ? `\`${token}\` -> \`${successor}\`` : `\`${token}\` is removed with no recorded successor`;
}

/**
 * A report-only class over exact tokens in strings and stylesheets. A token is not resolvable through an
 * import and consumers author rules in the same namespace, so nothing is edited: each exact token is reported.
 */
export function tokenReporter({ className, tableOf, prefixesOf = () => null, why, markPackageElements = false }) {
  return {
    class: className,
    reportOnly: true,
    run(context, analysis, entries) {
      const match = matcher(entries, tableOf, prefixesOf);
      if (!match) return [];
      match.pattern.lastIndex = 0;
      if (!match.pattern.test(analysis.text)) return [];
      const findings = [];
      analysis.walk((node) => {
        const isText = ts.isStringLiteralLike(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node)
          || ts.isTemplateTail(node) || ts.isJsxText(node);
        if (!isText) return;
        const text = node.getText(analysis.sourceFile);
        match.pattern.lastIndex = 0;
        const seen = new Set();
        for (const hit of text.matchAll(match.pattern)) {
          if (seen.has(hit[1])) continue;
          seen.add(hit[1]);
          const { entry, successor } = match.resolve(hit[1]);
          const element = markPackageElements ? classAttributeOwner(node) : null;
          const onPackageElement = element ? analysis.originOfExpression(element.tagName).kind === 'ds' : false;
          const item = report(analysis, entry, node, onPackageElement ? 'class-attribute-on-ds-element' : 'string-literal',
            `${describe(hit[1], successor)}: ${why}`);
          item.token = hit[1];
          findings.push(item);
        }
      });
      return findings;
    },

    runStylesheet(context, sheet, entries) {
      const match = matcher(entries, tableOf, prefixesOf);
      if (!match) return [];
      const findings = [];
      match.pattern.lastIndex = 0;
      for (const hit of sheet.code.matchAll(match.pattern)) {
        const { entry, successor } = match.resolve(hit[1]);
        const item = sheet.report(entry, hit.index, hit[1], 'stylesheet',
          `${describe(hit[1], successor)}: stylesheets are reported, never rewritten`);
        item.token = hit[1];
        findings.push(item);
      }
      return findings;
    },
  };
}

export const transform = tokenReporter({
  className: 'css-class-renamed',
  tableOf: (entry) => entry.classes,
  why: 'a class string is not resolvable through an import; rename it by hand',
  markPackageElements: true,
});
