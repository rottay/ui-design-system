#!/usr/bin/env node

/**
 * DS-A002 — pattern/surface presentation-ownership gate.
 *
 * Patterns and surfaces are composition owners. They may arrange primitives and
 * may calculate runtime geometry, but they must not silently become a second
 * primitive/theme implementation. This census reports five kinds of ownership
 * leakage in productive TS/TSX sources under `src/ui/{patterns,surfaces}`:
 *
 *  - native-interactive: raw interactive HTML instead of a DS primitive;
 *  - local-svg: component-local SVG where the graphics/icon owner should be used;
 *  - utility-class: Tailwind-like presentation utilities in `className`;
 *  - shared-chrome-literal: stable inline paint/chrome instead of a token/skin;
 *  - primitive-reconstruction: polymorphic or ARIA reconstruction of a known
 *    primitive contract (`Box as="button"`, `div role="tab"`, and peers).
 *
 * Stable literals are deliberately distinct from dynamic runtime geometry.
 * `left: drag.x`, `width: measuredWidth`, and equivalent computed expressions do
 * not count. `padding: 12`, `color: '#fff'`, or `width: '380px'` do count. A CSS
 * value backed by `var(--...)` is token-owned and does not count.
 *
 * The baseline is a multiset keyed by path + category + rule + normalized
 * evidence, never by line number. Moving a finding within a file stays green;
 * adding another copy or moving debt to a different owner is red. The allowlist
 * is for legitimate permanent ownership only and requires a written reason.
 *
 * Usage:
 *   node scripts/pattern-surface-ownership-gate.mjs --check
 *   node scripts/pattern-surface-ownership-gate.mjs --report --details=100
 *   node scripts/pattern-surface-ownership-gate.mjs --write-baseline
 *   node scripts/pattern-surface-ownership-gate.mjs --write-baseline --allow-increase
 */

import { createHash } from 'node:crypto';
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const SCRIPT_DIR = dirname(SCRIPT_PATH);
const DEFAULT_PACKAGE_ROOT = resolve(SCRIPT_DIR, '..');
const DEFAULT_SOURCE_ROOT = resolve(DEFAULT_PACKAGE_ROOT, 'src');
const DEFAULT_BASELINE_PATH = resolve(SCRIPT_DIR, 'pattern-surface-ownership-gate.baseline.json');
const DEFAULT_ALLOWLIST_PATH = resolve(SCRIPT_DIR, 'pattern-surface-ownership-gate.allowlist.json');

const SOURCE_FILE_RE = /\.[cm]?[jt]sx?$/u;
const NON_PRODUCTIVE_FILE_RE = /(?:\.d\.[cm]?ts|\.(?:test|spec|stories)\.[cm]?[jt]sx?)$/u;
const NON_PRODUCTIVE_SEGMENTS = new Set([
  '__fixtures__',
  '__tests__',
  'examples',
  'fixtures',
  'generated',
  'story-helpers',
  'stories',
  'tests',
]);

const NATIVE_INTERACTIVE_TAGS = new Set([
  'a',
  'button',
  'details',
  'dialog',
  'input',
  'select',
  'summary',
  'textarea',
]);

const RECONSTRUCTED_ROLES = new Set([
  'alertdialog',
  'checkbox',
  'dialog',
  'menuitem',
  'option',
  'progressbar',
  'radio',
  'slider',
  'switch',
  'tab',
  'tooltip',
]);

const POLYMORPHIC_INTERACTIVE_TAGS = new Set([
  'a',
  'button',
  'details',
  'dialog',
  'input',
  'select',
  'summary',
  'textarea',
]);

const EXACT_UTILITY_CLASSES = new Set([
  'absolute', 'antialiased', 'block', 'contents', 'fixed', 'flex', 'flex-1',
  'flow-root', 'grid', 'hidden', 'inline', 'inline-block', 'inline-flex',
  'inline-grid', 'isolate', 'italic', 'not-italic', 'relative', 'sr-only',
  'static', 'sticky', 'table', 'truncate', 'underline', 'no-underline',
]);

const UTILITY_PREFIX = /^(?:-?(?:m[trblxy]?|p[trblxy]?|gap(?:-[xy])?|space-[xy]|inset(?:-[xy])?|top|right|bottom|left|z|w|h|min-w|max-w|min-h|max-h|basis|grow|shrink|order|grid-cols|grid-rows|col-span|row-span|items|justify|content|self|place-items|place-content|place-self|overflow(?:-[xy])?|overscroll(?:-[xy])?|text|font|leading|tracking|whitespace|break|line-clamp|bg|from|via|to|border(?:-[trblxy])?|rounded(?:-[trbl])?|shadow|ring(?:-offset)?|outline|opacity|transition|duration|ease|delay|animate|cursor|select|pointer-events|object|aspect|divide-[xy]|translate-[xy]|scale|rotate|skew-[xy]|origin)-|\[[^\]]+\]$)/u;

const PAINT_PROPERTIES = /^(?:accentColor|backdropFilter|background(?:Color|Image)?|border(?:Top|Right|Bottom|Left)?(?:Color|Style|Width)?|boxShadow|caretColor|color|fill|filter|opacity|outline(?:Color|Style|Width)?|stroke|textShadow|WebkitBackdropFilter|WebkitTextStroke)$/u;
const SPACING_PROPERTIES = /^(?:columnGap|gap|margin(?:Top|Right|Bottom|Left|Block|Inline|BlockStart|BlockEnd|InlineStart|InlineEnd)?|padding(?:Top|Right|Bottom|Left|Block|Inline|BlockStart|BlockEnd|InlineStart|InlineEnd)?|rowGap)$/u;
const TYPOGRAPHY_PROPERTIES = /^(?:fontFamily|fontSize|fontStyle|fontWeight|letterSpacing|lineHeight|textDecoration|textTransform)$/u;
const SHAPE_PROPERTIES = /^(?:borderRadius|borderTopLeftRadius|borderTopRightRadius|borderBottomLeftRadius|borderBottomRightRadius|clipPath)$/u;
const MOTION_PROPERTIES = /^(?:animation|animationDelay|animationDuration|animationTimingFunction|transition|transitionDelay|transitionDuration|transitionProperty|transitionTimingFunction)$/u;
const GEOMETRY_PROPERTIES = /^(?:bottom|flexBasis|height|inset|left|maxHeight|maxWidth|minHeight|minWidth|right|top|transform|width)$/u;
const DYNAMIC_GEOMETRY_PROPERTIES = new Set([
  'bottom', 'flexBasis', 'height', 'inset', 'left', 'maxHeight', 'maxWidth',
  'minHeight', 'minWidth', 'right', 'top', 'transform', 'width',
]);

const BENIGN_LITERAL_VALUES = new Set([
  'auto', 'currentColor', 'inherit', 'initial', 'none', 'normal', 'transparent',
  'unset',
]);

const CATEGORY_REMEDIATION = Object.freeze({
  'local-svg': 'Use the graphics/icon facade, or add a reasoned allowlist entry for an owned data visualization.',
  'native-interactive': 'Compose the corresponding DS Button/Link/Input/Select/Disclosure/Dialog primitive.',
  'primitive-reconstruction': 'Use the canonical primitive contract instead of recreating its semantics on Box/native HTML.',
  'shared-chrome-literal': 'Move stable chrome to a skin/token/recipe; keep only measured or state-derived geometry inline.',
  'utility-class': 'Replace presentation utilities with primitive props, data-state hooks, or an engine skin.',
});
const OWNERSHIP_CATEGORIES = new Set(Object.keys(CATEGORY_REMEDIATION));

function toPosix(path) {
  return path.split(sep).join('/');
}

function scriptKind(path) {
  if (/\.tsx$/u.test(path)) return ts.ScriptKind.TSX;
  if (/\.jsx$/u.test(path)) return ts.ScriptKind.JSX;
  if (/\.[cm]?js$/u.test(path)) return ts.ScriptKind.JS;
  return ts.ScriptKind.TS;
}

function isProductiveSource(relativePath) {
  if (!SOURCE_FILE_RE.test(relativePath) || NON_PRODUCTIVE_FILE_RE.test(relativePath)) return false;
  return !relativePath.split('/').some((segment) => NON_PRODUCTIVE_SEGMENTS.has(segment));
}

function walkProductiveSources(root) {
  if (!existsSync(root)) return [];
  const out = [];
  for (const entry of readdirSync(root, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))) {
    const path = resolve(root, entry.name);
    if (entry.isDirectory()) out.push(...walkProductiveSources(path));
    if (entry.isFile() && isProductiveSource(toPosix(path))) out.push(path);
  }
  return out;
}

export function collectOwnershipFiles(sourceRoot) {
  return [
    ...walkProductiveSources(resolve(sourceRoot, 'ui/patterns')),
    ...walkProductiveSources(resolve(sourceRoot, 'ui/surfaces')),
  ].sort((left, right) => left.localeCompare(right));
}

function jsxTagName(name) {
  if (ts.isIdentifier(name)) return name.text;
  if (ts.isJsxNamespacedName(name)) return `${name.namespace.text}:${name.name.text}`;
  if (ts.isPropertyAccessExpression(name)) return `${jsxTagName(name.expression)}.${name.name.text}`;
  return name.getText();
}

function getJsxAttribute(attributes, name) {
  return attributes.properties.find((attribute) => (
    ts.isJsxAttribute(attribute) && attribute.name.text === name
  ));
}

function jsxAttributeStaticText(attribute) {
  if (!attribute || !attribute.initializer) return null;
  if (ts.isStringLiteral(attribute.initializer)) return attribute.initializer.text;
  if (!ts.isJsxExpression(attribute.initializer) || !attribute.initializer.expression) return null;
  const expression = unwrap(attribute.initializer.expression);
  if (ts.isStringLiteralLike(expression)) return expression.text;
  return null;
}

function unwrap(node) {
  let current = node;
  while (
    ts.isParenthesizedExpression(current)
    || ts.isAsExpression(current)
    || ts.isSatisfiesExpression?.(current)
    || ts.isNonNullExpression(current)
    || ts.isTypeAssertionExpression(current)
  ) current = current.expression;
  return current;
}

const EVENT_PLUMBING_CALLS = new Set(['stopPropagation', 'preventDefault']);

/**
 * An onClick whose entire body only calls `event.stopPropagation()` /
 * `event.preventDefault()` carries no click semantics of its own — it shields a
 * genuinely interactive part (own pointer/keyboard handlers) from an ancestor
 * activation, so it is not a reconstructed clickable.
 */
function isEventPlumbingOnlyClick(attribute) {
  if (!attribute || !attribute.initializer) return false;
  if (!ts.isJsxExpression(attribute.initializer) || !attribute.initializer.expression) return false;
  const handler = unwrap(attribute.initializer.expression);
  if (!ts.isArrowFunction(handler) && !ts.isFunctionExpression(handler)) return false;
  const param = handler.parameters[0];
  const paramName = param && ts.isIdentifier(param.name) ? param.name.text : null;
  const statements = [];
  if (ts.isBlock(handler.body)) statements.push(...handler.body.statements);
  else statements.push(ts.factory.createExpressionStatement(handler.body));
  return statements.every((statement) => {
    if (!ts.isExpressionStatement(statement)) return false;
    const expression = unwrap(statement.expression);
    if (!ts.isCallExpression(expression) || expression.arguments.length > 0) return false;
    const callee = unwrap(expression.expression);
    if (!ts.isPropertyAccessExpression(callee)) return false;
    if (!EVENT_PLUMBING_CALLS.has(callee.name.text)) return false;
    const receiver = unwrap(callee.expression);
    return ts.isIdentifier(receiver) && paramName !== null && receiver.text === paramName;
  });
}

function collectStaticClassText(node, out = []) {
  if (!node) return out;
  const expression = unwrap(node);
  if (ts.isStringLiteralLike(expression)) {
    out.push(expression.text);
    return out;
  }
  if (ts.isTemplateExpression(expression)) {
    out.push(expression.head.text);
    for (const span of expression.templateSpans) {
      collectStaticClassText(span.expression, out);
      out.push(span.literal.text);
    }
    return out;
  }
  if (ts.isBinaryExpression(expression) || ts.isConditionalExpression(expression)) {
    if (ts.isBinaryExpression(expression)) {
      collectStaticClassText(expression.left, out);
      collectStaticClassText(expression.right, out);
    } else {
      collectStaticClassText(expression.whenTrue, out);
      collectStaticClassText(expression.whenFalse, out);
    }
    return out;
  }
  if (ts.isArrayLiteralExpression(expression)) {
    for (const element of expression.elements) collectStaticClassText(element, out);
    return out;
  }
  if (ts.isCallExpression(expression)) {
    for (const argument of expression.arguments) collectStaticClassText(argument, out);
    return out;
  }
  if (ts.isObjectLiteralExpression(expression)) {
    for (const property of expression.properties) {
      if (ts.isPropertyAssignment(property)) {
        if (ts.isStringLiteralLike(property.name)) out.push(property.name.text);
        collectStaticClassText(property.initializer, out);
      } else if (ts.isShorthandPropertyAssignment(property)) {
        // The shorthand's runtime value is unknown and therefore not a static class.
      }
    }
  }
  return out;
}

function stripUtilityVariants(token) {
  const parts = token.split(':');
  return parts[parts.length - 1].replace(/^!/u, '');
}

export function isPresentationUtility(token) {
  const base = stripUtilityVariants(token.trim());
  return EXACT_UTILITY_CLASSES.has(base) || UTILITY_PREFIX.test(base);
}

function utilityTokensForAttribute(attribute) {
  if (!attribute.initializer) return [];
  let expression;
  if (ts.isStringLiteral(attribute.initializer)) expression = attribute.initializer;
  else if (ts.isJsxExpression(attribute.initializer)) expression = attribute.initializer.expression;
  if (!expression) return [];
  const strings = collectStaticClassText(expression);
  return [...new Set(
    strings.flatMap((value) => value.split(/\s+/u))
      .map((token) => token.trim())
      .filter(Boolean)
      .filter(isPresentationUtility),
  )].sort();
}

function propertyName(node) {
  if (!node) return null;
  if (ts.isIdentifier(node) || ts.isPrivateIdentifier(node) || ts.isStringLiteralLike(node)) return node.text;
  if (ts.isComputedPropertyName(node) && ts.isStringLiteralLike(unwrap(node.expression))) {
    return unwrap(node.expression).text;
  }
  return null;
}

function stableLiteral(node, variables, seen = new Set()) {
  if (!node) return null;
  const expression = unwrap(node);
  if (ts.isStringLiteralLike(expression)) return { text: JSON.stringify(expression.text), value: expression.text };
  if (ts.isNumericLiteral(expression)) return { text: expression.text, value: Number(expression.text) };
  if (expression.kind === ts.SyntaxKind.TrueKeyword) return { text: 'true', value: true };
  if (expression.kind === ts.SyntaxKind.FalseKeyword) return { text: 'false', value: false };
  if (expression.kind === ts.SyntaxKind.NullKeyword) return { text: 'null', value: null };
  if (ts.isPrefixUnaryExpression(expression) && ts.isNumericLiteral(expression.operand)) {
    const text = expression.getText().replace(/\s+/gu, '');
    return { text, value: Number(text) };
  }
  if (ts.isIdentifier(expression) && variables.has(expression.text) && !seen.has(expression.text)) {
    const nextSeen = new Set(seen).add(expression.text);
    return stableLiteral(variables.get(expression.text), variables, nextSeen);
  }
  if (ts.isConditionalExpression(expression)) {
    const yes = stableLiteral(expression.whenTrue, variables, seen);
    const no = stableLiteral(expression.whenFalse, variables, seen);
    if (yes && no) return { text: `${yes.text}|${no.text}`, value: undefined };
  }
  if (ts.isBinaryExpression(expression)) {
    const left = stableLiteral(expression.left, variables, seen);
    const right = stableLiteral(expression.right, variables, seen);
    if (left && right) {
      return { text: `${left.text}${expression.operatorToken.getText()}${right.text}`, value: undefined };
    }
  }
  return null;
}

function chromeRuleForProperty(name) {
  if (PAINT_PROPERTIES.test(name) && name !== 'borderCollapse' && name !== 'borderSpacing') return 'stable-paint';
  if (SPACING_PROPERTIES.test(name)) return 'stable-spacing';
  if (TYPOGRAPHY_PROPERTIES.test(name)) return 'stable-typography';
  if (SHAPE_PROPERTIES.test(name)) return 'stable-shape';
  if (MOTION_PROPERTIES.test(name)) return 'stable-motion';
  if (GEOMETRY_PROPERTIES.test(name)) return 'stable-geometry';
  return null;
}

function isTokenOwnedLiteral(literal) {
  return typeof literal.value === 'string' && /var\(\s*--/u.test(literal.value);
}

function isBenignLiteral(rule, literal) {
  if (literal.value === 0 || literal.value === '0') return true;
  if (typeof literal.value === 'string' && BENIGN_LITERAL_VALUES.has(literal.value)) return true;
  return rule === 'stable-geometry' && literal.value === '100%';
}

function collectStyleObjects(node, variables, out, seen = new Set()) {
  if (!node) return;
  const expression = unwrap(node);
  if (ts.isIdentifier(expression)) {
    if (seen.has(expression.text) || !variables.has(expression.text)) return;
    collectStyleObjects(variables.get(expression.text), variables, out, new Set(seen).add(expression.text));
    return;
  }
  if (ts.isObjectLiteralExpression(expression)) {
    out.push(expression);
    for (const member of expression.properties) {
      if (ts.isSpreadAssignment(member)) collectStyleObjects(member.expression, variables, out, seen);
    }
    return;
  }
  if (ts.isConditionalExpression(expression)) {
    collectStyleObjects(expression.whenTrue, variables, out, seen);
    collectStyleObjects(expression.whenFalse, variables, out, seen);
    return;
  }
  if (ts.isCallExpression(expression)) {
    const callee = expression.expression.getText();
    if (/^(?:React\.)?useMemo$/u.test(callee)) {
      const factory = expression.arguments[0];
      if (factory && (ts.isArrowFunction(factory) || ts.isFunctionExpression(factory))) {
        if (ts.isBlock(factory.body)) {
          for (const statement of factory.body.statements) {
            if (ts.isReturnStatement(statement)) collectStyleObjects(statement.expression, variables, out, seen);
          }
        } else collectStyleObjects(factory.body, variables, out, seen);
      }
    }
  }
}

function lineFor(sourceFile, node) {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
}

function normalizedEvidence(value) {
  return value.trim().replace(/\s+/gu, ' ').slice(0, 240);
}

function findingId(path, category, rule, anchor) {
  return createHash('sha256')
    .update(`${path}\0${category}\0${rule}\0${anchor}`)
    .digest('hex')
    .slice(0, 20);
}

function ownedInlineSvgPath(path) {
  // Charts own data-driven SVG rendering. Icon-like SVG elsewhere remains a
  // finding; other legitimate visualization owners can use the reasoned
  // allowlist instead of broad path magic.
  return path.includes('/ui/patterns/visualization/charts/');
}

function addFinding(findings, sourceFile, path, node, category, rule, anchor, evidence) {
  findings.push({
    id: findingId(path, category, rule, anchor),
    path,
    line: lineFor(sourceFile, node),
    category,
    rule,
    evidence: normalizedEvidence(evidence),
    remediation: CATEGORY_REMEDIATION[category],
  });
}

/** Analyze one in-memory productive source. Exported for parser unit tests. */
export function analyzeOwnershipSource(source, path = 'src/ui/patterns/example/index.tsx') {
  const sourceFile = ts.createSourceFile(
    path,
    source,
    ts.ScriptTarget.Latest,
    true,
    scriptKind(path),
  );
  const variables = new Map();
  const findings = [];
  let dynamicGeometryExemptions = 0;
  let tokenOwnedChrome = 0;

  function collectVariables(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      variables.set(node.name.text, node.initializer);
    }
    ts.forEachChild(node, collectVariables);
  }
  collectVariables(sourceFile);

  function inspectOpening(node) {
    const nameNode = ts.isJsxElement(node) ? node.openingElement.tagName : node.tagName;
    const attributes = ts.isJsxElement(node) ? node.openingElement.attributes : node.attributes;
    const tag = jsxTagName(nameNode);
    const intrinsic = /^[a-z]/u.test(tag);

    if (intrinsic && NATIVE_INTERACTIVE_TAGS.has(tag)) {
      addFinding(findings, sourceFile, path, nameNode, 'native-interactive', `native-${tag}`, tag, `<${tag}>`);
    }

    if (tag === 'svg' && !ownedInlineSvgPath(path)) {
      addFinding(findings, sourceFile, path, nameNode, 'local-svg', 'local-svg-root', 'svg', '<svg>');
    }

    const asAttribute = getJsxAttribute(attributes, 'as');
    const asTag = jsxAttributeStaticText(asAttribute);
    if (!intrinsic && asTag && POLYMORPHIC_INTERACTIVE_TAGS.has(asTag)) {
      addFinding(
        findings,
        sourceFile,
        path,
        asAttribute,
        'primitive-reconstruction',
        'polymorphic-interactive',
        `${tag}:as:${asTag}`,
        `<${tag} as=${JSON.stringify(asTag)}>`,
      );
    }

    const roleAttribute = getJsxAttribute(attributes, 'role');
    const role = jsxAttributeStaticText(roleAttribute);
    if (role && RECONSTRUCTED_ROLES.has(role) && intrinsic) {
      addFinding(
        findings,
        sourceFile,
        path,
        roleAttribute,
        'primitive-reconstruction',
        'aria-role-reconstruction',
        `${tag}:role:${role}`,
        `<${tag} role=${JSON.stringify(role)}>`,
      );
    }

    const clickAttribute = getJsxAttribute(attributes, 'onClick');
    if (
      intrinsic
      && !NATIVE_INTERACTIVE_TAGS.has(tag)
      && clickAttribute
      && !isEventPlumbingOnlyClick(clickAttribute)
    ) {
      addFinding(
        findings,
        sourceFile,
        path,
        clickAttribute,
        'primitive-reconstruction',
        'clickable-noninteractive',
        `${tag}:onClick`,
        `<${tag} onClick={…}>`,
      );
    }

    const classAttribute = getJsxAttribute(attributes, 'className');
    if (classAttribute) {
      const tokens = utilityTokensForAttribute(classAttribute);
      if (tokens.length) {
        addFinding(
          findings,
          sourceFile,
          path,
          classAttribute,
          'utility-class',
          'presentation-utility',
          tokens.join(' '),
          tokens.join(' '),
        );
      }
    }

    const styleAttribute = getJsxAttribute(attributes, 'style');
    if (!styleAttribute || !styleAttribute.initializer || !ts.isJsxExpression(styleAttribute.initializer)) return;
    const objects = [];
    collectStyleObjects(styleAttribute.initializer.expression, variables, objects);
    const visited = new Set();
    for (const object of objects) {
      if (visited.has(object)) continue;
      visited.add(object);
      for (const member of object.properties) {
        if (!ts.isPropertyAssignment(member) && !ts.isShorthandPropertyAssignment(member)) continue;
        const name = propertyName(member.name);
        if (!name || name.startsWith('--')) continue;
        const rule = chromeRuleForProperty(name);
        if (!rule) continue;
        const valueNode = ts.isPropertyAssignment(member)
          ? member.initializer
          : variables.get(member.name.text);
        const literal = stableLiteral(valueNode, variables);
        if (!literal) {
          if (DYNAMIC_GEOMETRY_PROPERTIES.has(name)) dynamicGeometryExemptions += 1;
          continue;
        }
        if (isTokenOwnedLiteral(literal)) {
          tokenOwnedChrome += 1;
          continue;
        }
        if (isBenignLiteral(rule, literal)) continue;
        addFinding(
          findings,
          sourceFile,
          path,
          member,
          'shared-chrome-literal',
          rule,
          `${name}:${literal.text}`,
          `${name}: ${literal.text}`,
        );
      }
    }
  }

  function visit(node) {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) inspectOpening(node);
    if (ts.isCallExpression(node)
      && /(?:^|\.)createElement$/u.test(node.expression.getText())
      && node.arguments[0]
      && ts.isStringLiteralLike(node.arguments[0])) {
      const tag = node.arguments[0].text;
      if (NATIVE_INTERACTIVE_TAGS.has(tag)) {
        addFinding(findings, sourceFile, path, node, 'native-interactive', `create-element-${tag}`, tag, `createElement('${tag}')`);
      }
      if (tag === 'svg' && !ownedInlineSvgPath(path)) {
        addFinding(findings, sourceFile, path, node, 'local-svg', 'create-element-svg', 'svg', "createElement('svg')");
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);

  // V8 sort is stable: source traversal order remains the tie-breaker for
  // multiple properties/attributes authored on the same line.
  findings.sort((left, right) => left.line - right.line);
  return { findings, dynamicGeometryExemptions, tokenOwnedChrome };
}

function globToRegExp(glob) {
  let pattern = '^';
  for (let index = 0; index < glob.length; index += 1) {
    const char = glob[index];
    const next = glob[index + 1];
    if (char === '*' && next === '*') {
      pattern += '.*';
      index += 1;
    } else if (char === '*') pattern += '[^/]*';
    else if ('\\^$+?.()|{}[]'.includes(char)) pattern += `\\${char}`;
    else pattern += char;
  }
  return new RegExp(`${pattern}$`, 'u');
}

export function validateAllowlist(allowlist, today = new Date()) {
  const issues = [];
  if (!allowlist || allowlist.schemaVersion !== 1 || !Array.isArray(allowlist.entries)) {
    return ['allowlist must have schemaVersion 1 and an entries array'];
  }
  for (const [index, entry] of allowlist.entries.entries()) {
    const prefix = `allowlist.entries[${index}]`;
    if (typeof entry.reason !== 'string' || entry.reason.trim().length < 12) {
      issues.push(`${prefix}.reason must explain the permanent ownership exception (at least 12 characters)`);
    }
    if (!entry.id && !entry.path) issues.push(`${prefix} must select an id or path`);
    if (!entry.id && (!entry.category || !entry.rule)) {
      issues.push(`${prefix} path selectors must also name category and rule; use id for a single exact site`);
    }
    if (entry.category && !OWNERSHIP_CATEGORIES.has(entry.category)) {
      issues.push(`${prefix}.category '${entry.category}' is not an ownership category`);
    }
    if (entry.expires) {
      const expiry = new Date(`${entry.expires}T23:59:59Z`);
      if (Number.isNaN(expiry.valueOf())) issues.push(`${prefix}.expires is not YYYY-MM-DD`);
      else if (expiry < today) issues.push(`${prefix} expired on ${entry.expires}`);
    }
  }
  return issues;
}

function matchesAllowlist(finding, entry) {
  if (entry.id && entry.id !== finding.id) return false;
  if (entry.path && !globToRegExp(entry.path).test(finding.path)) return false;
  if (entry.category && entry.category !== finding.category) return false;
  if (entry.rule && entry.rule !== finding.rule) return false;
  return true;
}

export function applyAllowlist(findings, allowlist) {
  const allowed = [];
  const active = [];
  const matchedEntries = new Set();
  for (const finding of findings) {
    const entryIndex = allowlist.entries.findIndex((candidate) => matchesAllowlist(finding, candidate));
    if (entryIndex >= 0) {
      matchedEntries.add(entryIndex);
      allowed.push({ finding, reason: allowlist.entries[entryIndex].reason });
    }
    else active.push(finding);
  }
  const unusedEntries = allowlist.entries.filter((_, index) => !matchedEntries.has(index));
  return { active, allowed, unusedEntries };
}

export function buildBaseline(findings) {
  const entries = new Map();
  for (const finding of findings) {
    const current = entries.get(finding.id);
    if (current) current.count += 1;
    else entries.set(finding.id, {
      id: finding.id,
      path: finding.path,
      category: finding.category,
      rule: finding.rule,
      count: 1,
    });
  }
  return {
    schemaVersion: 1,
    scope: ['src/ui/patterns', 'src/ui/surfaces'],
    entries: [...entries.values()].sort((left, right) => (
      left.path.localeCompare(right.path)
      || left.category.localeCompare(right.category)
      || left.rule.localeCompare(right.rule)
      || left.id.localeCompare(right.id)
    )),
  };
}

export function evaluateBaseline(findings, baseline) {
  const ceiling = new Map((baseline?.entries ?? []).map((entry) => [entry.id, entry.count]));
  const seen = new Map();
  const regressions = [];
  for (const finding of findings) {
    const occurrence = (seen.get(finding.id) ?? 0) + 1;
    seen.set(finding.id, occurrence);
    if (occurrence > (ceiling.get(finding.id) ?? 0)) {
      regressions.push({ ...finding, occurrence, ceiling: ceiling.get(finding.id) ?? 0 });
    }
  }
  const currentCount = findings.length;
  const baselineCount = [...ceiling.values()].reduce((sum, count) => sum + count, 0);
  return { ok: regressions.length === 0, regressions, currentCount, baselineCount };
}

export function validateBaseline(baseline) {
  const issues = [];
  if (!baseline || baseline.schemaVersion !== 1 || !Array.isArray(baseline.entries)) {
    return ['baseline must have schemaVersion 1 and an entries array'];
  }
  const ids = new Set();
  for (const [index, entry] of baseline.entries.entries()) {
    const prefix = `baseline.entries[${index}]`;
    if (typeof entry.id !== 'string' || !/^[a-f0-9]{20}$/u.test(entry.id)) issues.push(`${prefix}.id is invalid`);
    else if (ids.has(entry.id)) issues.push(`${prefix}.id duplicates ${entry.id}; counts belong in one multiset row`);
    else ids.add(entry.id);
    if (typeof entry.path !== 'string' || !entry.path.startsWith('src/ui/')) issues.push(`${prefix}.path is invalid`);
    if (!OWNERSHIP_CATEGORIES.has(entry.category)) issues.push(`${prefix}.category is invalid`);
    if (typeof entry.rule !== 'string' || entry.rule.length === 0) issues.push(`${prefix}.rule is invalid`);
    if (!Number.isInteger(entry.count) || entry.count < 1) issues.push(`${prefix}.count must be a positive integer`);
  }
  return issues;
}

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, 'utf8'));
}

function categoryCounts(findings) {
  const counts = {};
  for (const finding of findings) counts[finding.category] = (counts[finding.category] ?? 0) + 1;
  return counts;
}

export function runOwnershipGate({
  sourceRoot = DEFAULT_SOURCE_ROOT,
  baselinePath = DEFAULT_BASELINE_PATH,
  allowlistPath = DEFAULT_ALLOWLIST_PATH,
} = {}) {
  const allowlist = readJson(allowlistPath, { schemaVersion: 1, entries: [] });
  const allowlistIssues = validateAllowlist(allowlist);
  if (allowlistIssues.length) {
    return { ok: false, configurationIssues: allowlistIssues, findings: [], regressions: [] };
  }
  const files = collectOwnershipFiles(sourceRoot);
  const allFindings = [];
  let dynamicGeometryExemptions = 0;
  let tokenOwnedChrome = 0;
  for (const file of files) {
    const relativePath = toPosix(relative(sourceRoot, file));
    const result = analyzeOwnershipSource(readFileSync(file, 'utf8'), `src/${relativePath}`);
    allFindings.push(...result.findings);
    dynamicGeometryExemptions += result.dynamicGeometryExemptions;
    tokenOwnedChrome += result.tokenOwnedChrome;
  }
  const { active, allowed, unusedEntries } = applyAllowlist(allFindings, allowlist);
  const baseline = readJson(baselinePath, { schemaVersion: 1, entries: [] });
  const baselineIssues = validateBaseline(baseline);
  const staleAllowlistIssues = unusedEntries.map((entry) => (
    `unused allowlist entry '${entry.id ?? entry.path}' no longer owns a finding; remove the stale exception`
  ));
  if (baselineIssues.length || staleAllowlistIssues.length) {
    return {
      ok: false,
      files,
      findings: active,
      allowed,
      baseline,
      regressions: [],
      configurationIssues: [...baselineIssues, ...staleAllowlistIssues],
    };
  }
  const evaluation = evaluateBaseline(active, baseline);
  return {
    ok: evaluation.ok,
    files,
    findings: active,
    allowed,
    baseline,
    ...evaluation,
    counts: categoryCounts(active),
    dynamicGeometryExemptions,
    tokenOwnedChrome,
    configurationIssues: [],
  };
}

function argumentValue(name) {
  const exact = process.argv.indexOf(name);
  if (exact >= 0) return process.argv[exact + 1];
  const inline = process.argv.find((argument) => argument.startsWith(`${name}=`));
  return inline?.slice(name.length + 1);
}

function printFinding(finding, stream = console.error) {
  stream(`${finding.path}:${finding.line} [${finding.category}/${finding.rule}] ${finding.evidence}`);
  stream(`  ${finding.remediation}`);
}

function printSummary(result, stream = console.log) {
  stream(`DS-A002 ownership census: ${result.findings.length} active finding(s) across ${result.files.length} productive file(s).`);
  for (const [category, count] of Object.entries(result.counts).sort()) stream(`  ${category}: ${count}`);
  stream(`  allowlisted: ${result.allowed.length}`);
  stream(`  dynamic geometry exempted: ${result.dynamicGeometryExemptions}`);
  stream(`  token-owned inline chrome observed: ${result.tokenOwnedChrome}`);
  stream(`  ratchet: ${result.currentCount}/${result.baselineCount}`);
}

function writeBaseline(path, result, allowIncrease) {
  const next = buildBaseline(result.findings);
  const previousCount = result.baselineCount;
  const nextCount = result.findings.length;
  if (existsSync(path) && nextCount > previousCount && !allowIncrease) {
    throw new Error(
      `Refusing to raise the ownership baseline from ${previousCount} to ${nextCount}. `
      + 'Review the growth, then pass --allow-increase explicitly.',
    );
  }
  writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`);
}

async function main() {
  const sourceRoot = resolve(argumentValue('--source-root') ?? DEFAULT_SOURCE_ROOT);
  const baselinePath = resolve(argumentValue('--baseline') ?? DEFAULT_BASELINE_PATH);
  const allowlistPath = resolve(argumentValue('--allowlist') ?? DEFAULT_ALLOWLIST_PATH);
  const check = process.argv.includes('--check');
  const report = process.argv.includes('--report');
  const write = process.argv.includes('--write-baseline');
  const quiet = process.argv.includes('--quiet');
  const details = Number(argumentValue('--details') ?? (report ? 100 : 30));
  const result = runOwnershipGate({ sourceRoot, baselinePath, allowlistPath });

  if (result.configurationIssues.length) {
    for (const issue of result.configurationIssues) console.error(`DS-A002 configuration: ${issue}`);
    process.exitCode = 1;
    return;
  }
  if (!quiet) printSummary(result);

  if (write) {
    try {
      writeBaseline(baselinePath, result, process.argv.includes('--allow-increase'));
      if (!quiet) console.log(`Wrote ${relative(DEFAULT_PACKAGE_ROOT, baselinePath)}.`);
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
      return;
    }
  }

  const shown = report ? result.findings : result.regressions;
  if (!quiet && shown.length) {
    console.log(report ? '\nCurrent ownership findings:' : '\nNew ownership findings:');
    for (const finding of shown.slice(0, Math.max(0, details))) printFinding(finding, console.log);
    if (shown.length > details) console.log(`  … ${shown.length - details} more; use --details=<n>.`);
  }
  if (check && !result.ok) process.exitCode = 1;
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : '';
if (import.meta.url === invokedPath) await main();
