import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/**
 * Every `color-mix()` argument must resolve to a `<color>` under every tenant.
 *
 * `color-mix()` is a colour operation. If an argument resolves to a gradient, a
 * shadow list, a bare number or `none`, the function is invalid at
 * computed-value time, the WHOLE declaration is dropped, and the surface paints
 * nothing at all. Nothing in the suite sees this: invalid CSS does not throw,
 * does not warn, and does not move a snapshot, so it ships and keeps shipping.
 *
 * The trap is that a surface ROLE (`--ds-surface-*`, and the `--ds-color-*`
 * bridges aliased to one) is contractually allowed to carry a gradient
 * (`SemanticSurfaceRoleTokens.background` is documented "Main fill or gradient
 * for the role"). One tenant authoring a gradient there silently blanks every
 * consumer that mixed against it -- while the tenants that authored a colour
 * keep rendering, which is why this survives review.
 *
 * Usage:
 *   node scripts/color-mix-argument-purity-gate.mjs --check
 *   node scripts/color-mix-argument-purity-gate.mjs --check --quiet
 */

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = path.resolve(SCRIPT_DIR, '..');

/**
 * A path change must not let this gate pass by scanning nothing. The real
 * corpus is ~480 stylesheets; the floor sits well below that so ordinary
 * deletions do not trip it, and well above zero so a broken glob does.
 */
const CORPUS_FLOOR = 300;

const GRADIENT = /(^|[\s,(])(repeating-)?(linear|radial|conic)-gradient\s*\(|url\s*\(|image-set\s*\(|cross-fade\s*\(|-webkit-gradient\s*\(/i;
const COLOR_FUNCTION = /^(rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark)\s*\(/i;
const COLOR_KEYWORD = /^(transparent|currentcolor|inherit|initial|unset|revert|revert-layer|canvas|canvastext|buttonface|buttontext|buttonborder|highlight|highlighttext|linktext|visitedtext|activetext|graytext|field|fieldtext|mark|marktext|selecteditem|selecteditemtext|accentcolor|accentcolortext|white|black|red|green|blue|gray|grey|silver|maroon|navy|olive|purple|teal|aqua|fuchsia|lime|yellow|orange|pink|brown|cyan|magenta|rebeccapurple)$/i;
const HEX = /^#[0-9a-fA-F]{3,8}$/;
const PERCENTAGE = /^[\d.]+%$/;
/** Sub-expressions whose `var()` references are numbers, never colours. */
const NUMERIC_FUNCTION = /\b(calc|clamp|min|max|round|mod|rem)\s*\(/gi;

/** Comments are prose. A `--ds-x:` inside one is not a declaration. */
function readSource(filePath) {
  return fs
    .readFileSync(filePath, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '));
}

function relative(root, filePath) {
  return path.relative(root, filePath).split(path.sep).join('/');
}

function lineOf(text, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) if (text[i] === '\n') line += 1;
  return line;
}

/**
 * The declaration authority: authored stylesheets plus the BrandTheme sources
 * that compile into them. Tests, stories and arbitrary `.tsx` prose are not
 * token declarations and only inject noise.
 */
function collectSources(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'dist', 'coverage', 'tests', '__tests__', 'stories'].includes(entry.name)) continue;
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) collectSources(filePath, out);
    else if (/\.(test|spec|stories)\.[tj]sx?$/.test(entry.name)) continue;
    else if (entry.name.endsWith('.css')) out.push(filePath);
    else if (entry.name.endsWith('.ts') && filePath.includes(`${path.sep}brand-themes${path.sep}`)) out.push(filePath);
  }
  return out;
}

/** The end of a declaration value: `;` or `}` at paren depth zero. */
function valueEnd(text, start) {
  let depth = 0;
  for (let i = start; i < text.length; i += 1) {
    const char = text[i];
    if (char === '(') depth += 1;
    else if (char === ')') {
      if (depth === 0) return i;
      depth -= 1;
    } else if ((char === ';' || char === '}') && depth === 0) return i;
  }
  return text.length;
}

function collectDeclarations(root, files) {
  const declarations = new Map();
  const add = (name, value, file, line) => {
    if (!declarations.has(name)) declarations.set(name, []);
    declarations.get(name).push({ value: value.trim(), file: relative(root, file), line });
  };

  for (const filePath of files) {
    const text = readSource(filePath);
    const custom = /(--[a-zA-Z][a-zA-Z0-9_-]*)\s*:/g;
    let match;
    while ((match = custom.exec(text))) {
      const end = valueEnd(text, custom.lastIndex);
      add(match[1], text.slice(custom.lastIndex, end), filePath, lineOf(text, match.index));
    }
    if (filePath.endsWith('.ts')) {
      const literal = /["'`](--[a-zA-Z][a-zA-Z0-9_-]*)["'`]\s*:\s*["'`]([^"'`]*)["'`]/g;
      while ((match = literal.exec(text))) add(match[1], match[2], filePath, lineOf(text, match.index));
    }
  }
  return declarations;
}

/** True when the value is exactly one balanced function call. */
function isSingleFunction(value) {
  const open = value.indexOf('(');
  if (open === -1) return false;
  let depth = 0;
  for (let i = open; i < value.length; i += 1) {
    if (value[i] === '(') depth += 1;
    else if (value[i] === ')') {
      depth -= 1;
      if (depth === 0) return value.slice(i + 1).trim() === '';
    }
  }
  return false;
}

/** Splits `var(--name, fallback)` into its two parts. */
function parseVar(value) {
  const inner = value.slice(value.indexOf('(') + 1, value.lastIndexOf(')'));
  let depth = 0;
  for (let i = 0; i < inner.length; i += 1) {
    if (inner[i] === '(') depth += 1;
    else if (inner[i] === ')') depth -= 1;
    else if (inner[i] === ',' && depth === 0) {
      return [inner.slice(0, i).trim(), inner.slice(i + 1).trim()];
    }
  }
  return [inner.trim(), null];
}

/** 'color' | 'percentage' | 'gradient' | 'composite' | 'alias' */
function rawKind(value) {
  const trimmed = value.trim();
  if (!trimmed) return 'composite';
  if (GRADIENT.test(trimmed)) return 'gradient';
  if (/^var\s*\(/.test(trimmed) && isSingleFunction(trimmed)) return 'alias';
  if (PERCENTAGE.test(trimmed)) return 'percentage';
  if (COLOR_FUNCTION.test(trimmed) && isSingleFunction(trimmed)) return 'color';
  if (HEX.test(trimmed) || COLOR_KEYWORD.test(trimmed)) return 'color';
  // Shadow lists, borders, transitions, lengths, bare numbers, `none`.
  return 'composite';
}

/**
 * Every value kind a name can hold across every tenant scope in the corpus.
 *
 * A declared name makes its own `var()` fallback unreachable, so the fallback
 * is followed only when the target is declared nowhere -- reading the fallback
 * of a declared name is how a sweep talks itself out of a live defect.
 */
function createResolver(declarations) {
  const memo = new Map();
  const blame = new Map();

  function noteBlame(name, reason) {
    if (!blame.has(name)) blame.set(name, new Set());
    blame.get(name).add(reason);
  }

  function kindsOfValue(value, seen) {
    const kind = rawKind(value);
    if (kind !== 'alias') return new Set([kind]);
    const [target, fallback] = parseVar(value);
    const targetKinds = resolve(target, seen);
    if (targetKinds.has('undeclared') && fallback) return kindsOfValue(fallback, seen);
    return targetKinds;
  }

  function resolve(name, seen = new Set()) {
    if (memo.has(name)) return memo.get(name);
    if (seen.has(name)) return new Set();
    seen.add(name);

    const entries = declarations.get(name);
    if (!entries) return new Set(['undeclared']);

    const kinds = new Set();
    for (const entry of entries) {
      const kind = rawKind(entry.value);
      if (kind !== 'alias') {
        kinds.add(kind);
        if (kind === 'gradient' || kind === 'composite') {
          noteBlame(name, `${entry.file}:${entry.line} declares it as ${kind} -- ${entry.value.replace(/\s+/g, ' ').slice(0, 72)}`);
        }
        continue;
      }
      const [target, fallback] = parseVar(entry.value);
      const targetKinds = resolve(target, new Set(seen));
      const reached = targetKinds.has('undeclared') && fallback
        ? kindsOfValue(fallback, seen)
        : targetKinds;
      for (const kind2 of reached) kinds.add(kind2);
      if (reached.has('gradient') || reached.has('composite')) {
        noteBlame(name, `${entry.file}:${entry.line} aliases ${target}`);
        // Carry the root causes up verbatim; each hop already names its target,
        // so the chain reads without re-prefixing every inherited line.
        for (const inherited of blame.get(target) ?? []) noteBlame(name, inherited);
      }
    }

    if (seen.size === 1) memo.set(name, kinds);
    return kinds;
  }

  return {
    resolve,
    /** Evaluates a whole value expression, honouring its `var()` fallback chain. */
    kindsOfExpression: (value) => kindsOfValue(value, new Set()),
    blameFor: (name) => [...(blame.get(name) ?? [])],
  };
}

/** Top-level comma-separated arguments of a function's interior. */
function splitArguments(inner) {
  const args = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < inner.length; i += 1) {
    if (inner[i] === '(') depth += 1;
    else if (inner[i] === ')') depth -= 1;
    else if (inner[i] === ',' && depth === 0) {
      args.push(inner.slice(start, i));
      start = i + 1;
    }
  }
  args.push(inner.slice(start));
  return args;
}

/** Removes `calc()`-family interiors: their `var()` references are numbers. */
function stripNumericFunctions(argument) {
  const marked = argument.replace(NUMERIC_FUNCTION, ' (');
  let out = '';
  let i = 0;
  while (i < marked.length) {
    if (marked[i] !== ' ') {
      out += marked[i];
      i += 1;
      continue;
    }
    i += 1;
    let depth = 0;
    for (; i < marked.length; i += 1) {
      if (marked[i] === '(') depth += 1;
      else if (marked[i] === ')') {
        depth -= 1;
        if (depth === 0) {
          i += 1;
          break;
        }
      }
    }
  }
  return out;
}

/**
 * The outermost `var(...)` expressions in an argument, each returned whole.
 *
 * Nested references inside a fallback are not returned separately: the resolver
 * walks the chain itself, and reporting them twice would blame the wrong name.
 */
function topLevelVarExpressions(argument) {
  const expressions = [];
  const opener = /var\s*\(/g;
  let match;
  while ((match = opener.exec(argument))) {
    const open = argument.indexOf('(', match.index);
    const close = closingParen(argument, open);
    if (close === -1) break;
    expressions.push(argument.slice(match.index, close + 1));
    opener.lastIndex = close + 1;
  }
  return expressions;
}

function closingParen(text, open) {
  let depth = 0;
  for (let i = open; i < text.length; i += 1) {
    if (text[i] === '(') depth += 1;
    else if (text[i] === ')') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

export function runColorMixArgumentPurityGate({ root = DEFAULT_ROOT, silent = false, minSources } = {}) {
  const sourceRoot = path.join(root, 'src');
  const files = collectSources(sourceRoot);
  const floor = minSources ?? (root === DEFAULT_ROOT ? CORPUS_FLOOR : 1);

  if (files.length < floor) {
    throw new Error(
      `Color-mix argument purity gate found ${files.length} stylesheet(s) under ${relative(root, sourceRoot)}, `
      + `below the corpus floor of ${floor}. A gate that scans nothing passes everything -- fix the path, do not lower the floor.`,
    );
  }

  const declarations = collectDeclarations(root, files);
  const { kindsOfExpression, blameFor } = createResolver(declarations);

  const failures = [];
  let colorMixSites = 0;
  let checkedArguments = 0;

  for (const filePath of files) {
    const text = readSource(filePath);
    const calls = /color-mix\s*\(/gi;
    let match;
    while ((match = calls.exec(text))) {
      const open = text.indexOf('(', match.index);
      const close = closingParen(text, open);
      if (close === -1) continue;
      colorMixSites += 1;
      const line = lineOf(text, match.index);
      const args = splitArguments(text.slice(open + 1, close));

      // args[0] is the `in <colorspace>` interpolation method.
      for (let i = 1; i < args.length; i += 1) {
        const argument = stripNumericFunctions(args[i]);

        if (GRADIENT.test(argument)) {
          checkedArguments += 1;
          failures.push(
            `${relative(root, filePath)}:${line} mixes against an inline gradient\n`
            + `      ${argument.replace(/\s+/g, ' ').trim().slice(0, 96)}`,
          );
          continue;
        }

        // Whole expressions, not bare names: an argument's verdict depends on
        // its `var()` fallback chain, and a gradient can hide in a fallback.
        for (const expression of topLevelVarExpressions(argument)) {
          checkedArguments += 1;
          const impure = [...kindsOfExpression(expression)]
            .filter((kind) => kind === 'gradient' || kind === 'composite');
          if (impure.length === 0) continue;
          const name = expression.match(/var\s*\(\s*(--[a-zA-Z][a-zA-Z0-9_-]*)/)[1];
          const reasons = blameFor(name);
          failures.push(
            `${relative(root, filePath)}:${line} mixes against ${name}, which can resolve to ${impure.join('/')}\n`
            + (reasons.length > 0
              ? reasons.map((reason) => `      ${reason}`).join('\n')
              : `      ${expression.replace(/\s+/g, ' ').trim().slice(0, 96)}`),
          );
        }
      }
    }
  }

  if (failures.length > 0) {
    throw new Error(
      'Color-mix argument purity gate failed -- these declarations are dropped entirely '
      + 'and their surfaces paint nothing:\n  - '
      + failures.join('\n  - '),
    );
  }

  const report = {
    sources: files.length,
    tokens: declarations.size,
    colorMixSites,
    checkedArguments,
  };
  if (!silent) {
    console.log(
      `PASS color-mix-argument-purity sources=${report.sources} tokens=${report.tokens} `
      + `sites=${report.colorMixSites} arguments=${report.checkedArguments}`,
    );
  }
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    runColorMixArgumentPurityGate({ silent: process.argv.includes('--quiet') });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
