import ts from 'typescript';
import { report, rewrite } from '../../resolve/findings/index.mjs';
import { propSites } from '../../resolve/usages/index.mjs';

function collectLiterals(expression, literals) {
  if (ts.isStringLiteralLike(expression)) {
    literals.push(expression);
    return true;
  }
  if (ts.isParenthesizedExpression(expression)) return collectLiterals(expression.expression, literals);
  if (ts.isConditionalExpression(expression)) {
    const whenTrue = collectLiterals(expression.whenTrue, literals);
    const whenFalse = collectLiterals(expression.whenFalse, literals);
    return whenTrue && whenFalse;
  }
  return false;
}

/**
 * A literal retired from a prop's union: rewritten only as a string literal on an element proven to be the
 * design-system component. Physical -> logical differs under RTL, so it is reported unless `--assume-ltr`.
 */
export const transform = {
  class: 'union-member-removed',
  run(context, analysis, entries) {
    const findings = [];
    for (const entry of entries) {
      if (!analysis.text.includes(entry.prop)) continue;
      const next = entry.replacement?.member ?? null;
      const label = `\`${entry.prop}="${entry.member}"\`${next ? ` -> \`"${next}"\`` : ' is removed'} on ${entry.components.map((name) => `\`${name}\``).join(' / ')}`;
      for (const site of propSites(context, analysis, { ...entry, member: entry.prop })) {
        for (const spread of site.kind === 'direct' ? site.spreads : []) {
          findings.push(report(analysis, entry, spread, 'spread',
            `${label}: a spread on the design-system component may carry the prop; inspect the spread object`));
        }
        if (!site.attribute?.initializer) continue;
        const value = site.attribute.initializer;
        const literals = [];
        const proven = ts.isStringLiteral(value)
          ? collectLiterals(value, literals)
          : ts.isJsxExpression(value) && value.expression ? collectLiterals(value.expression, literals) : false;
        const hits = literals.filter((literal) => literal.text === entry.member);
        if (site.kind === 'indirect') {
          if (hits.length > 0 || !proven) {
            findings.push(report(analysis, entry, site.attribute, 'indirect',
              `${label}: the element is a consumer wrapper around the design-system component; the kit does not follow wrappers`));
          }
          continue;
        }
        if (!proven) {
          findings.push(report(analysis, entry, site.attribute, 'dynamic',
            `${label}: the value is not a string literal, so the kit cannot prove which member it carries`));
        }
        for (const literal of hits) {
          if (!next) {
            findings.push(report(analysis, entry, literal, 'no-replacement',
              `${label}. ${entry.guidance ?? ''}`.trim()));
          } else if (entry.directional && !context.options.assumeLtr) {
            findings.push(report(analysis, entry, literal, 'direction-semantics',
              `${label}: physical and logical sides differ under RTL; pass --assume-ltr to rewrite`));
          } else {
            const quote = analysis.text[literal.getStart(analysis.sourceFile)];
            findings.push(rewrite(analysis, entry, literal, 'literal-rewritten', label,
              [{ start: literal.getStart(analysis.sourceFile), end: literal.end, text: `${quote}${next}${quote}` }]));
          }
        }
      }
    }
    return findings;
  },
};
