/**
 * The crash-safe fallback allowance: a NAMED three-property allowance, not a
 * threshold.
 *
 * Owner resolution R4 (2026-09-19) replaced the old `floor: 8` cardinality
 * exemption for the surface-lifecycle error boundary. A floor could only say
 * "this file still has at least N counter-visible paint sites"; it could not
 * say WHICH sites, so eight arbitrary paint properties satisfied it and a
 * fourth unrelated one was invisible. This module states the allowance the way
 * R4 words it:
 *
 *   - exactly three properties -- background, foreground and border;
 *   - each one reads its governed `--ds-surface-lifecycle-error-*` channel
 *     FIRST, so a healthy tree never renders the literal;
 *   - each fallback is the documented per-mode `light-dark()` pair, because a
 *     single light-only pair measured 1.7-2.5:1 in dark scopes;
 *   - keyed to ONE file. No other component may copy the pattern, so the
 *     allowance names its owner and refuses the key anywhere else.
 *
 * Anything else on that crash surface -- a fourth property, a missing one, a
 * bare literal, a wrong channel, paint the name lexer cannot see -- fails.
 */
import ts from 'typescript';

import { ARC09_PAINT_EXEMPT, ARC09_PAINT_KEY_RE, countArc09PaintInFile } from '../inline/index.mjs';

/**
 * The one component R4 approved, and the exact properties it may paint inline.
 * The configuration file must restate this map; it may not widen it. A fourth
 * entry here would need a new owner resolution, not an edit.
 */
export const CRASH_SAFE_FALLBACK_ALLOWANCE = Object.freeze({
  file: 'structures/feedback/surface-lifecycle/error-boundary/index.tsx',
  properties: Object.freeze({
    backgroundColor: '--ds-surface-lifecycle-error-bg',
    color: '--ds-surface-lifecycle-error-color',
    border: '--ds-surface-lifecycle-error-border',
  }),
});

/** The config key that opts a file into the named allowance. */
export const CRASH_SAFE_ENTRY_KEY = 'crashSafeProperties';

const COLOR_LITERAL_RE = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark)\s*\(/;

function isPaintName(name) {
  return ARC09_PAINT_KEY_RE.test(`${name}:`) && !ARC09_PAINT_EXEMPT.has(name);
}

function staticPropertyName(name) {
  if (ts.isIdentifier(name) || ts.isPrivateIdentifier(name)) return name.text;
  if (ts.isStringLiteralLike(name) || ts.isNumericLiteral(name)) return name.text;
  return null;
}

/**
 * Every inline paint declaration in the file, by NAME and authored value.
 *
 * Object-literal property assignments only: the ratchet's own lexer is the
 * cardinality authority, and `collectCrashSafeFailures` cross-checks this
 * reading against it so paint arriving through a channel this walk cannot see
 * (a `.style()` setter, a spread, an opaque producer) fails closed instead of
 * passing unnamed.
 */
export function collectInlinePaintDeclarations(source, fileName = 'source.tsx') {
  const sourceFile = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const declarations = [];

  const visit = (node) => {
    if (ts.isObjectLiteralExpression(node)) {
      for (const property of node.properties) {
        if (ts.isPropertyAssignment(property)) {
          const name = staticPropertyName(property.name);
          if (name !== null && isPaintName(name)) {
            declarations.push({
              name,
              value: property.initializer.getText(sourceFile),
              line: sourceFile.getLineAndCharacterOfPosition(property.getStart(sourceFile)).line + 1,
            });
          }
        } else if (ts.isShorthandPropertyAssignment(property) && isPaintName(property.name.text)) {
          declarations.push({
            name: property.name.text,
            value: property.name.text,
            line: sourceFile.getLineAndCharacterOfPosition(property.getStart(sourceFile)).line + 1,
          });
        }
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return declarations;
}

/** Strip the quotes of a single- or double-quoted authored string value. */
function unquote(text) {
  const trimmed = text.trim();
  if (trimmed.length >= 2 && ["'", '"', '`'].includes(trimmed[0]) && trimmed.at(-1) === trimmed[0]) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

/** The first balanced `var(...)` span in the value, or null. */
function firstVarSpan(value) {
  const start = value.indexOf('var(');
  if (start < 0) return null;
  let depth = 0;
  for (let i = start + 3; i < value.length; i += 1) {
    if (value[i] === '(') depth += 1;
    else if (value[i] === ')') {
      depth -= 1;
      if (depth === 0) {
        return { start, end: i + 1, inner: value.slice(start + 4, i) };
      }
    }
  }
  return null;
}

/** Split at the first top-level comma. */
function splitTopLevelComma(text) {
  let depth = 0;
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === '(') depth += 1;
    else if (text[i] === ')') depth -= 1;
    else if (text[i] === ',' && depth === 0) {
      return [text.slice(0, i), text.slice(i + 1)];
    }
  }
  return [text, null];
}

/**
 * The governed shape R4 requires: the channel first, then the documented
 * per-mode `light-dark()` literal, and no other colour anywhere in the value.
 */
function governedShapeFailure(name, channel, rawValue) {
  const label = `${name}`;
  const value = unquote(rawValue).replace(/\s+/g, ' ').trim();

  if (/^['"`]/.test(rawValue.trim()) === false && !/^var\(/.test(value)) {
    return `${label} is not an authored literal value (${rawValue.trim()}); the crash-safe floor cannot be computed at runtime`;
  }

  const span = firstVarSpan(value);
  if (!span) return `${label} does not read a governed channel: ${value}`;
  if (value.indexOf('var(', span.end) >= 0) {
    return `${label} reads more than one custom property; the floor is one channel with one literal fallback: ${value}`;
  }

  const [declaredChannel, fallback] = splitTopLevelComma(span.inner);
  if (declaredChannel.trim() !== channel) {
    return `${label} reads ${declaredChannel.trim()}; the allowance names ${channel}`;
  }
  if (fallback === null) {
    return `${label} has no fallback; the governed channel is unset in exactly the failure this floor exists for`;
  }

  const literal = fallback.trim();
  if (!literal.startsWith('light-dark(') || !literal.endsWith(')')) {
    return `${label} falls back to ${literal}; R4 requires the documented per-mode light-dark() pair`;
  }
  const [light, dark] = splitTopLevelComma(literal.slice('light-dark('.length, -1));
  if (dark === null || light.trim() === '' || dark.trim() === '') {
    return `${label} has an incomplete light-dark() pair: ${literal}`;
  }

  const outside = (value.slice(0, span.start) + value.slice(span.end)).trim();
  if (COLOR_LITERAL_RE.test(outside)) {
    return `${label} carries colour outside its governed channel (${outside || value}); the channel must be the only paint authority`;
  }

  return null;
}

/**
 * Evaluate the named allowance for one file.
 *
 * @returns {string[]} failures; empty means the crash-safe floor is exactly
 * the three governed properties R4 approved.
 */
export function collectCrashSafeFailures({
  displayPath,
  source,
  fileName,
  declaredProperties,
  countPaint = countArc09PaintInFile,
}) {
  const failures = [];
  const at = (message) => failures.push(`crash-safe allowance (${displayPath}): ${message}`);
  const allowed = CRASH_SAFE_FALLBACK_ALLOWANCE.properties;

  if (displayPath !== CRASH_SAFE_FALLBACK_ALLOWANCE.file) {
    at(`the crash-safe allowance is keyed to ${CRASH_SAFE_FALLBACK_ALLOWANCE.file} alone; no other component may copy it`);
    return failures;
  }

  const declaredNames = Object.keys(declaredProperties).sort();
  const allowedNames = Object.keys(allowed).sort();
  if (declaredNames.join(',') !== allowedNames.join(',')) {
    at(`declares [${declaredNames.join(', ')}]; the approved allowance is exactly [${allowedNames.join(', ')}]`);
  }
  for (const name of declaredNames) {
    if (Object.hasOwn(allowed, name) && declaredProperties[name] !== allowed[name]) {
      at(`declares channel ${declaredProperties[name]} for ${name}; the approved channel is ${allowed[name]}`);
    }
  }
  if (failures.length > 0) return failures;

  const declarations = collectInlinePaintDeclarations(source, fileName);
  const seen = new Map();
  for (const declaration of declarations) {
    if (seen.has(declaration.name)) {
      at(`${declaration.name} is painted twice (lines ${seen.get(declaration.name).line} and ${declaration.line})`);
      continue;
    }
    seen.set(declaration.name, declaration);
  }

  for (const declaration of declarations) {
    if (!Object.hasOwn(allowed, declaration.name)) {
      at(
        `line ${declaration.line} paints ${declaration.name}, which the allowance does not name. ` +
          `The approved floor is exactly [${allowedNames.join(', ')}]; everything beyond it is governed paint in skin/surface-states`,
      );
    }
  }
  for (const name of allowedNames) {
    if (!seen.has(name)) {
      at(`${name} is missing; the crash-safe floor must keep all three properties or the fallback stops being legible`);
    }
  }

  for (const [name, declaration] of seen) {
    if (!Object.hasOwn(allowed, name)) continue;
    const failure = governedShapeFailure(name, allowed[name], declaration.value);
    if (failure) at(`line ${declaration.line}: ${failure}`);
  }

  // The ratchet's own lexer is the cardinality authority. A disagreement means
  // paint reaches the DOM through a channel the name walk above cannot read.
  let counted;
  try {
    counted = countPaint(source, fileName);
  } catch (error) {
    at(`inline paint could not be counted: ${error.message}`);
    counted = null;
  }
  if (counted !== null && counted !== allowedNames.length) {
    at(
      `the inline-paint counter reads ${counted} site(s); the named allowance is ${allowedNames.length}. ` +
        'Either a site is painted through a channel the allowance cannot name, or the allowance is stale',
    );
  }

  return failures;
}
