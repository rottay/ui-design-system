/**
 * Skin literal census by class (owner ruling 7, HARD-2): the hardcode-census
 * obligations F.2-F.10 folded into engine-token-audit instead of a second
 * census. Pure and importable -- the audit's top-level census is not run.
 *
 * Every class counts SITES (one per declaration, at-rule or selector) over the
 * text that remains after comments, strings, `url()` and every `var()` call
 * (fallback included) are removed. A `var(--x, 12px)` is therefore never a
 * literal here: the fallback-parity counters own DEF. TEC and FLOOR
 * exclusions are declared in `./exclusions` and nowhere else.
 */
import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import ts from 'typescript';

import { FLOOR_CONTEXTS, TEC_CONTEXTS, isExcluded } from './exclusions/index.mjs';

export const SKIN_LITERAL_CLASSES = Object.freeze([
  'fontWeight',
  'lineHeight',
  'letterSpacing',
  'fontFamily',
  'spacing',
  'size',
  'radius',
  'opacity',
  'shadow',
  'color',
  'duration',
  'easing',
  'zIndex',
  'containerQuery',
  'important',
  'dataTenant',
  'channelLiteral',
]);

const LENGTH_RE = /(?<![\w.#-])-?(?:\d+\.?\d*|\.\d+)(?:px|rem|em)\b/gi;
const TIME_RE = /(?<![\w.#-])(?:\d+\.?\d*|\.\d+)(?:ms|s)\b/gi;
const NUMBER_TOKEN_RE = /(?<![\w.#-])-?(?:\d+\.?\d*|\.\d+)%?(?![\w.])/g;
const HEX_RE = /(?<![\w&])#[0-9a-f]{3,8}\b/gi;
const COLOR_FN_RE = /(?<![\w-])(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/gi;
const GENERIC_FAMILIES = new Set([
  'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'ui-serif',
  'ui-sans-serif', 'ui-monospace', 'ui-rounded', 'emoji', 'math', 'fangsong',
]);
const CSS_WIDE = new Set(['inherit', 'initial', 'unset', 'revert', 'revert-layer']);
// CSS named colours; `transparent`, `currentcolor` and system colours are not paint decisions.
const NAMED_COLORS = new Set(
  ('aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown ' +
    'burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan ' +
    'darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid ' +
    'darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet ' +
    'deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ' +
    'ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki ' +
    'lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow ' +
    'lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray ' +
    'lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine ' +
    'mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise ' +
    'mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab ' +
    'orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru ' +
    'pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown ' +
    'seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan ' +
    'teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen').split(' '),
);
const NAMED_COLOR_RE = new RegExp(`(?<![\\w-])(?:${[...NAMED_COLORS].join('|')})(?![\\w-])`, 'gi');

const PROPERTY_CLASSES = [
  ['fontWeight', /^font-weight$/],
  ['lineHeight', /^line-height$/],
  ['letterSpacing', /^letter-spacing$/],
  ['fontFamily', /^font-family$/],
  ['spacing', /^(?:padding|margin|gap|row-gap|column-gap|grid-gap|scroll-padding|scroll-margin|inset|top|right|bottom|left)(?:-|$)/],
  ['size', /^(?:(?:min-|max-)?(?:width|height|inline-size|block-size)|flex-basis|flex|grid-template-(?:columns|rows)|grid-auto-(?:columns|rows))$/],
  ['radius', /^border(?:-[a-z]+)*-radius$/],
  ['opacity', /^(?:opacity|fill-opacity|stroke-opacity)$/],
  ['shadow', /^(?:box-shadow|text-shadow)$/],
  ['zIndex', /^z-index$/],
];
const MOTION_PROPERTY_RE = /^(?:transition|animation)(?:-|$)/;

/** Replace each balanced `name(` ... `)` call with ` V ` (nested calls included). */
function stripCalls(value, name) {
  const opener = new RegExp(`\\b${name}\\(`, 'gi');
  let out = value;
  for (;;) {
    opener.lastIndex = 0;
    const m = opener.exec(out);
    if (!m) return out;
    let depth = 1;
    let i = m.index + m[0].length;
    while (i < out.length && depth > 0) {
      if (out[i] === '(') depth += 1;
      else if (out[i] === ')') depth -= 1;
      i += 1;
    }
    out = `${out.slice(0, m.index)} V ${out.slice(i)}`;
  }
}

/** The literal-bearing remainder of a declaration value. */
export function literalRemainder(value) {
  const unquoted = value.replace(/"[^"]*"|'[^']*'/g, ' S ');
  return stripCalls(stripCalls(stripCalls(unquoted, 'url'), 'env'), 'var').toLowerCase();
}

function matches(text, re) {
  re.lastIndex = 0;
  return text.match(re) ?? [];
}

function contextOf(node) {
  const contexts = { floor: false, tecExcept: null };
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (parent.type !== 'atrule') continue;
    const name = parent.name.toLowerCase();
    if (FLOOR_CONTEXTS.some((c) => c.atRule === name && c.params.test(parent.params))) contexts.floor = true;
    const tec = TEC_CONTEXTS.find((c) => name === c.atRule || name.endsWith(`-${c.atRule}`));
    if (tec) contexts.tecExcept = new Set(tec.exceptClasses);
  }
  return contexts;
}

function anyCounted(klass, tokens, property) {
  return tokens.some((token) => !isZeroLength(token) && !isExcluded(klass, token, property));
}

/** `0px`, `-0rem`, `0.0em`: a zero length is unit-free in CSS and decides nothing. */
function isZeroLength(token) {
  return /(?:px|rem|em)$/.test(token) && Number.parseFloat(token) === 0;
}

function classifyDeclaration(decl) {
  const property = decl.prop.toLowerCase();
  const rest = literalRemainder(decl.value);
  const hits = [];

  if (property.startsWith('--')) {
    const tokens = [...matches(rest, LENGTH_RE), ...matches(rest, TIME_RE)];
    if (anyCounted('channelLiteral', tokens, property)) hits.push('channelLiteral');
  }

  for (const [klass, re] of PROPERTY_CLASSES) {
    if (!re.test(property)) continue;
    let tokens;
    if (klass === 'fontWeight') tokens = matches(rest, /(?<![\w-])(?:\d{3}|bold|bolder|lighter)(?![\w-])/g);
    else if (klass === 'lineHeight' || klass === 'letterSpacing' || klass === 'opacity' || klass === 'zIndex') {
      tokens = matches(rest, NUMBER_TOKEN_RE).concat(matches(rest, LENGTH_RE));
    } else tokens = matches(rest, LENGTH_RE);
    if (anyCounted(klass, [...new Set(tokens)], property)) hits.push(klass);
  }

  if (property === 'font-family') {
    const families = rest.split(',').map((f) => f.trim()).filter((f) => f && f !== 'v' && !CSS_WIDE.has(f));
    const readsToken = /\bv\b/.test(rest);
    const named = families.filter((f) => !(readsToken && GENERIC_FAMILIES.has(f)));
    if (named.length > 0) hits.push('fontFamily');
  }

  if (MOTION_PROPERTY_RE.test(property)) {
    const durations = matches(rest, TIME_RE).filter((t) => {
      if (isExcluded('duration', t, property)) return false;
      const n = Number.parseFloat(t);
      const ms = t.endsWith('ms') ? n : n * 1000;
      return !(ms >= 1000 && isExcluded('duration', '>=1s', property));
    });
    if (durations.length > 0) hits.push('duration');
    const easings = [
      ...matches(rest, /\b(?:cubic-bezier|steps|linear)\(/g),
      ...matches(rest, /(?<![\w-])(?:ease|ease-in|ease-out|ease-in-out|linear|step-start|step-end)(?![\w-(])/g),
    ];
    if (anyCounted('easing', easings, property)) hits.push('easing');
  }

  const colorTokens = [...matches(rest, HEX_RE), ...matches(rest, COLOR_FN_RE), ...matches(rest, NAMED_COLOR_RE)];
  const currentColorMix = /color-mix\([^;]*\bcurrentcolor\s+-?\d*\.?\d+%/.test(rest);
  if ((colorTokens.length > 0 || currentColorMix) && !isExcluded('color', 'mask', property)) hits.push('color');

  if (decl.important) hits.push('important');
  return hits;
}

/**
 * Count every class over one stylesheet. Returns `{ counts, sites }`; a parse
 * failure is reported as `parseFailure: true` with zero counts (the exact-0
 * `skins.parseErrors` counter already fails the build on it).
 */
export function countSkinLiteralsInCss(css, from = 'skin.css') {
  const counts = Object.fromEntries(SKIN_LITERAL_CLASSES.map((klass) => [klass, 0]));
  const sites = [];
  let root;
  try {
    root = postcss.parse(css, { from });
  } catch {
    return { counts, sites, parseFailure: true };
  }
  const record = (klass, node, text) => {
    counts[klass] += 1;
    sites.push({ klass, line: node.source?.start?.line ?? 0, text });
  };

  root.walkDecls((decl) => {
    const context = contextOf(decl);
    for (const klass of classifyDeclaration(decl)) {
      if (context.floor) continue;
      if (context.tecExcept && !context.tecExcept.has(klass)) continue;
      record(klass, decl, `${decl.prop}: ${decl.value}${decl.important ? ' !important' : ''}`);
    }
  });
  root.walkAtRules((rule) => {
    if (rule.name.toLowerCase() !== 'container') return;
    if (matches(literalRemainder(rule.params), LENGTH_RE).length > 0) record('containerQuery', rule, `@container ${rule.params}`);
  });
  root.walkRules((rule) => {
    if (/\[\s*data-tenant\b/i.test(rule.selector)) record('dataTenant', rule, rule.selector);
  });
  return { counts, sites, parseFailure: false };
}

/** Census over a file list: per-file class counts plus per-class totals. */
export function countSkinLiterals(files, relativePathOf) {
  const perFile = {};
  const totals = Object.fromEntries(SKIN_LITERAL_CLASSES.map((klass) => [klass, 0]));
  let parseFailures = 0;
  for (const file of files) {
    const result = countSkinLiteralsInCss(readFileSync(file, 'utf8'), file);
    if (result.parseFailure) parseFailures += 1;
    perFile[relativePathOf(file)] = result;
    for (const klass of SKIN_LITERAL_CLASSES) totals[klass] += result.counts[klass];
  }
  return { perFile, totals, parseFailures };
}

/* -------------------------------------------------------------------------- */
/* Inline geometry (F-64): the sibling of fleet.inlinePaint for layout names. */
/* -------------------------------------------------------------------------- */

export const INLINE_GEOMETRY_KEY_RE =
  /^(?:(?:min|max)?(?:Width|Height)|(?:min|max)?(?:InlineSize|BlockSize)|width|height|inlineSize|blockSize|minWidth|minHeight|maxWidth|maxHeight|padding[A-Za-z]*|margin[A-Za-z]*|gap|rowGap|columnGap|inset[A-Za-z]*|top|right|bottom|left|flexBasis|borderRadius|border[A-Za-z]*Radius|fontSize|lineHeight|letterSpacing|fontWeight)$/;

function isStaticGeometryLiteral(node) {
  const value = unwrap(node);
  if (ts.isNumericLiteral(value)) return Number(value.text) !== 0;
  if (ts.isPrefixUnaryExpression(value) && ts.isNumericLiteral(value.operand)) return Number(value.operand.text) !== 0;
  if (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) {
    return matches(literalRemainder(value.text), /(?<![\w.#-])-?(?:\d+\.?\d*|\.\d+)(?:px|rem|em)?\b/g).some(
      (token) => Number.parseFloat(token) !== 0,
    );
  }
  if (ts.isConditionalExpression(value)) return isStaticGeometryLiteral(value.whenTrue) || isStaticGeometryLiteral(value.whenFalse);
  if (ts.isBinaryExpression(value) && value.operatorToken.kind === ts.SyntaxKind.BarBarToken) {
    return isStaticGeometryLiteral(value.right);
  }
  if (ts.isBinaryExpression(value) && value.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken) {
    return isStaticGeometryLiteral(value.right);
  }
  return false;
}

function unwrap(node) {
  let current = node;
  while (
    ts.isParenthesizedExpression(current) ||
    ts.isAsExpression(current) ||
    ts.isSatisfiesExpression?.(current) ||
    ts.isNonNullExpression(current)
  ) {
    current = current.expression;
  }
  return current;
}

function propertyName(property) {
  const name = property.name;
  if (!name) return null;
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text;
  return null;
}

/**
 * Static geometry literals inside JSX `style={{ ... }}` object literals: a
 * layout property set to a number or a length string the skin should own.
 * Runtime-computed values (`width: columnWidth`) are data, not hardcodes, and
 * do not count; a literal on either side of a ternary or as a `||`/`??`
 * default does. Style bags built outside the attribute are out of reach.
 */
export function countInlineGeometryInFile(text, fileName = 'source.tsx') {
  const kind = /\.tsx$/i.test(fileName) ? ts.ScriptKind.TSX : /\.jsx$/i.test(fileName) ? ts.ScriptKind.JSX : ts.ScriptKind.TS;
  const source = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true, kind);
  let count = 0;
  const visitObject = (object) => {
    for (const property of object.properties) {
      if (ts.isSpreadAssignment(property)) {
        const spread = unwrap(property.expression);
        if (ts.isObjectLiteralExpression(spread)) visitObject(spread);
        continue;
      }
      if (!ts.isPropertyAssignment(property)) continue;
      const name = propertyName(property);
      if (name && INLINE_GEOMETRY_KEY_RE.test(name) && isStaticGeometryLiteral(property.initializer)) count += 1;
    }
  };
  const visit = (node) => {
    if (ts.isJsxAttribute(node) && node.name.getText(source) === 'style' && node.initializer && ts.isJsxExpression(node.initializer)) {
      const expression = node.initializer.expression && unwrap(node.initializer.expression);
      if (expression && ts.isObjectLiteralExpression(expression)) visitObject(expression);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return count;
}

/* -------------------------------------------------------------------------- */
/* Root-scope duplicate declarations (DUP).                                   */
/* -------------------------------------------------------------------------- */

/** Names declared at bare `:root` by more than one file: `Map<name, files[]>`. */
export function duplicateRootDeclarations(declarationsByFile) {
  const owners = new Map();
  for (const [file, names] of declarationsByFile) {
    for (const name of new Set(names)) {
      if (!owners.has(name)) owners.set(name, []);
      owners.get(name).push(file);
    }
  }
  return new Map([...owners].filter(([, files]) => files.length > 1).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}
