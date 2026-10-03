import ts from 'typescript';
import { replaceNode, report, rewrite } from '../../resolve/findings/index.mjs';
import { propSites } from '../../resolve/usages/index.mjs';
import { reportUnprovenSites } from '../prop-removed/index.mjs';

function literalValue(attribute) {
  const value = attribute.initializer;
  if (!value) return null;
  if (ts.isStringLiteral(value)) return value;
  if (ts.isJsxExpression(value) && value.expression && ts.isStringLiteralLike(value.expression)) return value.expression;
  return null;
}

function quoteLike(analysis, literal, text) {
  const quote = analysis.text[literal.getStart(analysis.sourceFile)];
  return `${quote}${text}${quote}`;
}

/**
 * A prop renamed on the same component: the attribute is renamed on elements proven to be the
 * design-system component. A value map applies to string literals only; any other value is reported.
 */
export const transform = {
  class: 'prop-renamed',
  run(context, analysis, entries) {
    const findings = [];
    for (const entry of entries) {
      if (!analysis.text.includes(entry.member)) continue;
      const next = entry.replacement.member;
      const label = `\`${entry.member}\` -> \`${next}\` on ${entry.components.map((name) => `\`${name}\``).join(' / ')}`;
      const sites = propSites(context, analysis, entry);
      for (const site of sites) {
        if (site.kind !== 'direct' || !site.attribute) continue;
        const attribute = site.attribute;
        const conflict = site.element.attributes.properties.some((item) => ts.isJsxAttribute(item)
          && item.name.getText(analysis.sourceFile) === next);
        if (conflict) {
          findings.push(report(analysis, entry, attribute, 'conflict',
            `${label}: the element already states \`${next}\`; decide which value survives`));
          continue;
        }
        const edits = [replaceNode(analysis, attribute.name, next)];
        if (entry.replacement.values) {
          const literal = literalValue(attribute);
          if (!literal) {
            findings.push(report(analysis, entry, attribute, 'non-literal-value',
              `${label}: the value also changes vocabulary and is not a string literal; map it by hand`));
            continue;
          }
          if (!Object.hasOwn(entry.replacement.values, literal.text)) {
            findings.push(report(analysis, entry, attribute, 'unmapped-value',
              `${label}: \`${literal.text}\` has no mapped value`));
            continue;
          }
          const mapped = entry.replacement.values[literal.text];
          if (mapped !== literal.text) edits.push(replaceNode(analysis, literal, quoteLike(analysis, literal, mapped)));
        }
        findings.push(rewrite(analysis, entry, attribute, 'attribute-renamed',
          `${label}${entry.note ? ` (${entry.note})` : ''}`, edits));
      }
      reportUnprovenSites(context, analysis, entry, sites, findings, label);
    }
    return findings;
  },
};
