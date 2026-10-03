import ts from 'typescript';
import { report, rewrite } from '../../resolve/findings/index.mjs';
import { objectSites, propSites } from '../../resolve/usages/index.mjs';

const ASSIGNMENT_FIRST = ts.SyntaxKind.FirstAssignment;
const ASSIGNMENT_LAST = ts.SyntaxKind.LastAssignment;

/** True when evaluating the expression cannot run consumer code or change state. */
export function isSideEffectFree(node) {
  if (!node) return true;
  if (ts.isStringLiteralLike(node) || ts.isNumericLiteral(node) || ts.isBigIntLiteral(node)
    || ts.isRegularExpressionLiteral(node) || ts.isIdentifier(node) || ts.isArrowFunction(node)
    || ts.isFunctionExpression(node) || ts.isOmittedExpression(node)) return true;
  switch (node.kind) {
    case ts.SyntaxKind.TrueKeyword:
    case ts.SyntaxKind.FalseKeyword:
    case ts.SyntaxKind.NullKeyword:
    case ts.SyntaxKind.ThisKeyword:
      return true;
    default:
  }
  if (ts.isPropertyAccessExpression(node) || ts.isParenthesizedExpression(node) || ts.isNonNullExpression(node)
    || ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isTypeOfExpression(node)
    || ts.isVoidExpression(node) || ts.isSpreadElement(node)) return isSideEffectFree(node.expression);
  if (ts.isElementAccessExpression(node)) {
    return isSideEffectFree(node.expression) && isSideEffectFree(node.argumentExpression);
  }
  if (ts.isPrefixUnaryExpression(node)) {
    return node.operator !== ts.SyntaxKind.PlusPlusToken && node.operator !== ts.SyntaxKind.MinusMinusToken
      && isSideEffectFree(node.operand);
  }
  if (ts.isBinaryExpression(node)) {
    const operator = node.operatorToken.kind;
    return (operator < ASSIGNMENT_FIRST || operator > ASSIGNMENT_LAST)
      && isSideEffectFree(node.left) && isSideEffectFree(node.right);
  }
  if (ts.isConditionalExpression(node)) {
    return isSideEffectFree(node.condition) && isSideEffectFree(node.whenTrue) && isSideEffectFree(node.whenFalse);
  }
  if (ts.isTemplateExpression(node)) return node.templateSpans.every((span) => isSideEffectFree(span.expression));
  if (ts.isArrayLiteralExpression(node)) return node.elements.every(isSideEffectFree);
  if (ts.isObjectLiteralExpression(node)) {
    return node.properties.every((property) => {
      if (ts.isPropertyAssignment(property)) {
        return (!ts.isComputedPropertyName(property.name) || isSideEffectFree(property.name.expression))
          && isSideEffectFree(property.initializer);
      }
      if (ts.isSpreadAssignment(property)) return isSideEffectFree(property.expression);
      return true;
    });
  }
  return false;
}

function attributeValueIsSideEffectFree(attribute) {
  const value = attribute.initializer;
  if (!value || ts.isStringLiteral(value)) return true;
  return ts.isJsxExpression(value) && isSideEffectFree(value.expression);
}

export function reportUnprovenSites(context, analysis, entry, sites, findings, label) {
  for (const site of sites) {
    if (site.kind === 'indirect') {
      findings.push(report(analysis, entry, site.attribute, 'indirect',
        `${label}: \`${site.element.tagName.getText(analysis.sourceFile)}\` is a consumer wrapper around the design-system component; the kit does not follow wrappers`));
      continue;
    }
    for (const spread of site.spreads) {
      findings.push(report(analysis, entry, spread, 'spread',
        `${label}: a spread on the design-system component may carry the prop; inspect the spread object`));
    }
  }
  for (const site of objectSites(analysis, entry)) {
    findings.push(report(analysis, entry, site.node, site.kind,
      `${label}: an object handed to the component as props is not an attribute list; edit it by hand`));
  }
}

/**
 * A prop retired with no successor: deleted from elements proven to be the design-system component
 * when its value cannot have a side effect; everything else is reported.
 */
export const transform = {
  class: 'prop-removed',
  run(context, analysis, entries) {
    const findings = [];
    for (const entry of entries) {
      if (!analysis.text.includes(entry.member)) continue;
      const label = `\`${entry.member}\` is removed from ${entry.components.map((name) => `\`${name}\``).join(' / ')}`;
      const sites = propSites(context, analysis, entry);
      for (const site of sites) {
        if (site.kind !== 'direct' || !site.attribute) continue;
        if (attributeValueIsSideEffectFree(site.attribute)) {
          const start = /^\s*$/.test(analysis.text.slice(site.attribute.getFullStart(), site.attribute.getStart(analysis.sourceFile)))
            ? site.attribute.getFullStart()
            : site.attribute.getStart(analysis.sourceFile);
          findings.push(rewrite(analysis, entry, site.attribute, 'attribute-deleted',
            `${label}${entry.guidance ? `. ${entry.guidance}` : ''}`, [{ start, end: site.attribute.end, text: '' }]));
        } else {
          findings.push(report(analysis, entry, site.attribute, 'side-effect',
            `${label}, but its value may have a side effect; delete it by hand and keep the evaluation`));
        }
      }
      reportUnprovenSites(context, analysis, entry, sites, findings, label);
    }
    return findings;
  },
};
