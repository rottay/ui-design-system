#!/usr/bin/env node
/**
 * PHYSICAL PROPERTIES (WO-INV-01) -- the paint half of the one-direction law.
 *
 * `direction-authority` governs how a component ASKS for the reading direction.
 * This gate governs what it does with the answer: a physical edge written into
 * a style object -- `marginLeft`, `paddingRight`, `left`, `borderRight`,
 * `textAlign: 'left'`, `float` -- does not follow the reading direction, so
 * under RTL it lands on the wrong side of the box. The logical spellings
 * (`marginInlineStart`, `insetInlineStart`, `textAlign: 'start'`) already are
 * the house idiom: six live owners use them today.
 *
 * SCOPE: STYLE OBJECTS UNDER `src/components`. There is no `.css` under that
 * root -- skin stylesheets live in `src/foundation/tokens/css` and are governed
 * by their own owners -- so this gate reads what a component writes inline,
 * which is the only physical paint a component itself decides.
 *
 * SYNTAX, NOT SPELLING. The scan reads the TypeScript syntax tree, so a key
 * counts however it is written: bare, quoted, computed string or template,
 * shorthand or kebab; and a style object counts however it reaches paint:
 * inline in `style`, through a same-file binding, spread, branch, memo or
 * style-returning function, as a `CSSProperties`-typed value, or as an
 * imperative `.style` write. A computed key whose name is only known at runtime
 * is not a site this scanner can name.
 *
 * FROZEN ENGINES ARE EXCLUDED BY PATH, not pinned. 223 of the 245 measured
 * sites live under `engines/classic/` or `engines/rustic/`, and the freeze law
 * already governs them with its own gate, where every exception is written and
 * content-pinned. A second ratchet over the same files would duplicate noise
 * rather than signal. If the freeze is ever lifted from one of them it enters
 * the live population at that moment and is pinned then.
 *
 * THREE BANDS, MEASURED APART.
 *
 *   NAMED EXCEPTIONS. A measured viewport coordinate is PHYSICAL by nature: a
 *       pointer position, a `getBoundingClientRect()` edge, an offscreen
 *       sentinel. Rewriting one as `insetInlineStart` would reinterpret the
 *       same number under RTL and put the panel on the wrong side -- the
 *       migration would be the bug. Each is declared per SITE -- path plus a
 *       locator (`scope property: value`) -- with its reason, and exempts that
 *       site only: any other physical site in the same file is judged as if
 *       the exception did not exist, and a locator that stops matching fails.
 *
 *   PINNED DEBT. A physical edge that should be logical. Count per file,
 *       decrease-only: growth fails, a site in an unpinned file fails as a new
 *       owner, and a fix fails with an instruction to lower the pin.
 *
 *   INERT. `left: 0` beside `right: 0`, or a centred `left: '50%'` paired with
 *       a transform: both edges pinned or the box centred, so flipping the
 *       direction moves nothing. Counted rather than excluded by rule --
 *       proving symmetry pair-by-pair is fragile, and a pinned band is what
 *       stops tomorrow's unpaired `left: 0` from arriving unnoticed. Clearing
 *       one is a zero-pixel change.
 *
 * Usage:
 *   node scripts/check/localization/physical-properties/index.mjs          # report
 *   node scripts/check/localization/physical-properties/index.mjs --check  # exit 1 on any finding
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = findPackageRoot(HERE);
const BASELINE_PATH = join(HERE, 'baseline/index.json');

/** The scanned corpus: authored component source, tests and stories excluded. */
export const SCAN_ROOT = 'src/components';

/** Frozen by owner decision; the freeze gate governs them, not this one. */
export const FROZEN = /\/engines\/(classic|rustic)\//;

/**
 * The physical property names. Every one has a logical counterpart that follows
 * the reading direction; `textAlign` and `float` count only when their VALUE is
 * physical, since `center` and `none` are direction-neutral.
 */
export const PHYSICAL_PROPERTIES = Object.freeze([
  'marginLeft', 'marginRight', 'paddingLeft', 'paddingRight',
  'left', 'right',
  'borderLeft', 'borderRight',
  'borderLeftWidth', 'borderRightWidth', 'borderLeftColor', 'borderRightColor',
  'borderLeftStyle', 'borderRightStyle',
  'borderTopLeftRadius', 'borderTopRightRadius',
  'borderBottomLeftRadius', 'borderBottomRightRadius',
  'textAlign', 'float',
]);

const PHYSICAL = new Set(PHYSICAL_PROPERTIES);
const VALUE_GATED = new Set(['textAlign', 'float']);
const PHYSICAL_VALUE = /^\s*(left|right)\b/;
const CSS_PROPERTIES_TYPE = /\bCSSProperties\b/;

const toPosix = (value) => value.split(sep).join('/');
const isAuthored = (name) =>
  /\.tsx?$/.test(name) && !/\.(test|spec|stories)\.tsx?$/.test(name);
const camel = (name) => name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
const squash = (text) => text.replace(/\s+/g, ' ').trim();

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === 'node_modules' || entry === 'tests') continue;
      walk(full, out);
    } else if (isAuthored(entry)) {
      out.push(full);
    }
  }
  return out;
}

function unwrap(node) {
  let current = node;
  while (
    current
    && (ts.isParenthesizedExpression(current) || ts.isAsExpression(current) || ts.isSatisfiesExpression(current)
      || ts.isNonNullExpression(current) || ts.isTypeAssertionExpression(current))
  ) {
    current = current.expression;
  }
  return current;
}

const isScopeContainer = (node) =>
  ts.isSourceFile(node) || ts.isBlock(node) || ts.isModuleBlock(node) || ts.isCaseClause(node) || ts.isDefaultClause(node);

const isFunctionValue = (node) =>
  Boolean(node) && (ts.isArrowFunction(node) || ts.isFunctionExpression(node) || ts.isFunctionDeclaration(node));

/** Lexical same-file resolution of a name to its initializer; a parameter of that name shadows and stops it. */
function resolveName(identifier) {
  const name = identifier.text;
  for (let node = identifier.parent; node; node = node.parent) {
    if (ts.isFunctionLike(node)
      && node.parameters?.some((parameter) => ts.isIdentifier(parameter.name) && parameter.name.text === name)) {
      return null;
    }
    if (!isScopeContainer(node)) continue;
    for (const statement of node.statements) {
      if (ts.isVariableStatement(statement)) {
        for (const declaration of statement.declarationList.declarations) {
          if (ts.isIdentifier(declaration.name) && declaration.name.text === name) return declaration.initializer ?? null;
        }
      } else if (ts.isFunctionDeclaration(statement) && statement.name?.text === name) {
        return statement;
      }
    }
  }
  return null;
}

/** The strings an expression can spell: literals, hole-free templates, branches and same-file constants. */
function literalStrings(node, seen = new Set()) {
  const target = unwrap(node);
  if (!target || seen.has(target)) return [];
  seen.add(target);
  if (ts.isStringLiteral(target) || ts.isNoSubstitutionTemplateLiteral(target)) return [target.text];
  if (ts.isConditionalExpression(target)) {
    return [...literalStrings(target.whenTrue, seen), ...literalStrings(target.whenFalse, seen)];
  }
  if (ts.isBinaryExpression(target)
    && [ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.AmpersandAmpersandToken]
      .includes(target.operatorToken.kind)) {
    return [...literalStrings(target.left, seen), ...literalStrings(target.right, seen)];
  }
  if (ts.isIdentifier(target)) {
    const initializer = resolveName(target);
    return initializer && !isFunctionValue(initializer) ? literalStrings(initializer, seen) : [];
  }
  return [];
}

function keyNames(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNoSubstitutionTemplateLiteral(name)) return [name.text];
  if (ts.isComputedPropertyName(name)) return literalStrings(name.expression);
  return [];
}

function returnedExpressions(fn) {
  if (!fn.body) return [];
  if (!ts.isBlock(fn.body)) return [fn.body];
  const out = [];
  const visit = (node) => {
    if (node !== fn.body && ts.isFunctionLike(node)) return;
    if (ts.isReturnStatement(node) && node.expression) out.push(node.expression);
    ts.forEachChild(node, visit);
  };
  visit(fn.body);
  return out;
}

function scopeOf(node) {
  for (let current = node.parent; current; current = current.parent) {
    if ((ts.isVariableDeclaration(current) || ts.isFunctionDeclaration(current) || ts.isMethodDeclaration(current)
      || ts.isClassDeclaration(current) || ts.isPropertyDeclaration(current))
      && current.name && ts.isIdentifier(current.name)) {
      return current.name.text;
    }
  }
  return '(module)';
}

/** The physical sites one source file writes. Exported so a drill can measure a single fixture. */
export function fileSites(path, text) {
  const source = ts.createSourceFile(
    path, text, ts.ScriptTarget.Latest, true, path.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const sites = [];
  const recorded = new Set();
  const visited = new Set();

  const consider = (node, rawName, valueNode, valueText) => {
    const property = camel(rawName);
    if (!PHYSICAL.has(property)) return;
    if (VALUE_GATED.has(property) && !literalStrings(valueNode).some((value) => PHYSICAL_VALUE.test(value))) return;
    const start = node.getStart(source);
    if (recorded.has(start)) return;
    recorded.add(start);
    sites.push({
      path,
      line: source.getLineAndCharacterOfPosition(start).line + 1,
      property,
      locator: `${scopeOf(node)} ${property}: ${squash(valueText)}`,
    });
  };

  const styleObject = (node) => {
    const target = unwrap(node);
    if (!target || visited.has(target)) return;
    visited.add(target);
    if (ts.isObjectLiteralExpression(target)) {
      for (const member of target.properties) {
        if (ts.isPropertyAssignment(member)) {
          for (const name of keyNames(member.name)) {
            consider(member, name, member.initializer, member.initializer.getText(source));
          }
          if (ts.isObjectLiteralExpression(unwrap(member.initializer))) styleObject(member.initializer);
        } else if (ts.isShorthandPropertyAssignment(member)) {
          consider(member, member.name.text, member.name, member.name.text);
        } else if (ts.isSpreadAssignment(member)) {
          styleObject(member.expression);
        }
      }
    } else if (ts.isConditionalExpression(target)) {
      styleObject(target.whenTrue);
      styleObject(target.whenFalse);
    } else if (ts.isBinaryExpression(target)) {
      styleObject(target.left);
      styleObject(target.right);
    } else if (ts.isArrayLiteralExpression(target)) {
      target.elements.forEach(styleObject);
    } else if (ts.isIdentifier(target)) {
      const resolved = resolveName(target);
      if (resolved) styleObject(resolved);
    } else if (ts.isPropertyAccessExpression(target) && ts.isIdentifier(target.expression)) {
      const owner = unwrap(resolveName(target.expression));
      const member = owner && ts.isObjectLiteralExpression(owner)
        ? owner.properties.find((property) => property.name && keyNames(property.name).includes(target.name.text))
        : null;
      if (member && ts.isPropertyAssignment(member)) styleObject(member.initializer);
    } else if (isFunctionValue(target)) {
      returnedExpressions(target).forEach(styleObject);
    } else if (ts.isCallExpression(target)) {
      const callee = unwrap(target.expression);
      if (ts.isIdentifier(callee)) {
        const resolved = unwrap(resolveName(callee));
        if (isFunctionValue(resolved)) styleObject(resolved);
      }
      const objectAssign = callee.getText(source) === 'Object.assign';
      for (const argument of target.arguments) {
        if (objectAssign || isFunctionValue(unwrap(argument))) styleObject(argument);
      }
    }
  };

  const typeMentionsCss = (type) => Boolean(type) && CSS_PROPERTIES_TYPE.test(type.getText(source));
  const isStyleTarget = (node) => {
    const target = unwrap(node);
    return (ts.isPropertyAccessExpression(target) && target.name.text === 'style')
      || (ts.isElementAccessExpression(target) && literalStrings(target.argumentExpression).includes('style'));
  };

  const visit = (node) => {
    if (ts.isJsxAttribute(node) && node.name.getText(source) === 'style'
      && node.initializer && ts.isJsxExpression(node.initializer) && node.initializer.expression) {
      styleObject(node.initializer.expression);
    } else if ((ts.isVariableDeclaration(node) || ts.isPropertyDeclaration(node) || ts.isParameter(node))
      && node.initializer && typeMentionsCss(node.type)) {
      styleObject(node.initializer);
    } else if (ts.isFunctionLike(node) && typeMentionsCss(node.type)) {
      returnedExpressions(node).forEach(styleObject);
    } else if ((ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isTypeAssertionExpression(node))
      && typeMentionsCss(node.type)) {
      styleObject(node.expression);
    } else if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      const left = unwrap(node.left);
      if (ts.isPropertyAccessExpression(left) && isStyleTarget(left.expression)) {
        consider(left, left.name.text, node.right, node.right.getText(source));
      } else if (ts.isElementAccessExpression(left) && isStyleTarget(left.expression)) {
        for (const name of literalStrings(left.argumentExpression)) {
          consider(left, name, node.right, node.right.getText(source));
        }
      } else if (isStyleTarget(left)) {
        styleObject(node.right);
      }
    } else if (ts.isCallExpression(node)) {
      const callee = unwrap(node.expression);
      if (ts.isPropertyAccessExpression(callee) && callee.name.text === 'setProperty' && node.arguments.length > 0) {
        const value = node.arguments[1];
        for (const name of literalStrings(node.arguments[0])) {
          consider(node, name, value ?? node.arguments[0], value ? value.getText(source) : '');
        }
      } else if (callee.getText(source) === 'Object.assign' && node.arguments.length > 1 && isStyleTarget(node.arguments[0])) {
        node.arguments.slice(1).forEach(styleObject);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return sites.sort((a, b) => a.line - b.line || a.locator.localeCompare(b.locator));
}

/**
 * Every physical-property site under the scan root. `root` exists so the drill
 * can measure a sandbox copy; without it a planted red would prove nothing
 * about the real gate.
 */
export function physicalSites(root = ROOT) {
  const scanRoot = join(root, SCAN_ROOT);
  const sites = [];
  for (const file of walk(scanRoot)) {
    const path = toPosix(relative(scanRoot, file));
    if (FROZEN.test(`/${path}`)) continue;
    sites.push(...fileSites(path, readFileSync(file, 'utf8')));
  }
  return sites;
}

/** Site COUNT per file -- the unit the debt and inert bands pin. */
export function countSites(sites) {
  const counts = {};
  for (const site of sites) counts[site.path] = (counts[site.path] ?? 0) + 1;
  return counts;
}

export function physicalCounts(root = ROOT) {
  return countSites(physicalSites(root));
}

export function readBaseline(baselinePath = BASELINE_PATH) {
  return JSON.parse(readFileSync(baselinePath, 'utf8'));
}

export function namedExceptions(baseline = readBaseline()) {
  return baseline.namedExceptions;
}

const isExcepted = (site, exceptions) =>
  Boolean(exceptions[site.path]?.sites.some((row) => row.locator === site.locator));

/**
 * The verdict, over SITES: an exception exempts exactly the one site its
 * locator names; every other site is judged by the per-file debt and inert pins.
 */
export function judge(sites, baseline = readBaseline()) {
  if (!Array.isArray(sites)) {
    throw new TypeError('judge() takes the site list: a count map cannot bind an exception to its site');
  }
  const findings = [];
  const { namedExceptions: exceptions, pinnedDebt, inert } = baseline;

  for (const [path, row] of Object.entries(exceptions).sort()) {
    for (const { locator } of row.sites) {
      const matches = sites.filter((site) => site.path === path && site.locator === locator).length;
      if (matches === 0) {
        findings.push(
          `${path}: named exception \`${locator}\` matches no physical site -- retire it, or adjudicate the site that replaced it.`,
        );
      } else if (matches > 1) {
        findings.push(`${path}: named exception \`${locator}\` matches ${matches} sites -- an exception names exactly one.`);
      }
    }
  }

  const residual = sites.filter((site) => !isExcepted(site, exceptions));
  const counts = countSites(residual);
  const bandOf = (path) => (pinnedDebt[path] ? 'debt' : inert[path] ? 'inert' : null);

  for (const [path, count] of Object.entries(counts).sort()) {
    const band = bandOf(path);
    if (band === null) {
      const named = residual.filter((site) => site.path === path).map((site) => `\`${site.locator}\``).join(', ');
      findings.push(
        `${path}: ${count} physical-property site(s) in a file no band declares: ${named}. `
          + 'Write the logical spelling, or declare the site in the baseline with the reason it must stay physical.',
      );
      continue;
    }
    const pin = band === 'debt' ? pinnedDebt[path] : inert[path];
    if (count > pin.sites) {
      findings.push(`${path}: physical sites GREW from ${pin.sites} to ${count} (${band}).`);
    } else if (count < pin.sites) {
      findings.push(`${path}: physical sites FELL from ${pin.sites} to ${count} (${band}) -- lower the pin to ${count}.`);
    }
  }

  for (const [band, rows] of [['debt', pinnedDebt], ['inert', inert]]) {
    for (const [path, pin] of Object.entries(rows).sort()) {
      if (counts[path] === undefined) {
        findings.push(`${path}: pinned at ${pin.sites} ${band} site(s) and now has none -- remove the pin.`);
      }
    }
  }

  return findings;
}

export function run(root = ROOT, baseline = readBaseline()) {
  const sites = physicalSites(root);
  return { sites, counts: countSites(sites), findings: judge(sites, baseline) };
}

function main() {
  const baseline = readBaseline();
  const { sites, counts, findings } = run(ROOT, baseline);
  const band = (rows) => Object.entries(counts).filter(([path]) => rows[path]);
  const total = (entries) => entries.reduce((sum, [, count]) => sum + count, 0);
  const excepted = sites.filter((site) => isExcepted(site, baseline.namedExceptions));
  const residual = countSites(sites.filter((site) => !isExcepted(site, baseline.namedExceptions)));
  const debt = band(baseline.pinnedDebt).map(([path]) => [path, residual[path] ?? 0]);
  const inert = band(baseline.inert).map(([path]) => [path, residual[path] ?? 0]);

  const lines = [
    '[physical-properties]',
    `  debt awaiting the logical spelling : ${total(debt)} in ${debt.length} file(s)`,
    `  inert (symmetric / centred)        : ${total(inert)} in ${inert.length} file(s)`,
    `  named exceptions (measured space)  : ${excepted.length} site(s) in ${new Set(excepted.map((site) => site.path)).size} file(s)`,
    `  frozen engines                     : excluded by path (the freeze gate owns them)`,
  ];
  for (const [path, count] of debt.sort()) lines.push(`  DEBT  ${path}: ${count}`);
  for (const [path, count] of inert.sort()) lines.push(`  INERT ${path}: ${count}`);
  for (const site of excepted) lines.push(`  EXCEPTION ${site.path}:${site.line} \`${site.locator}\``);
  for (const finding of findings) lines.push(`  FINDING ${finding}`);
  lines.push(findings.length > 0 ? '[physical-properties] FAIL' : '[physical-properties] OK');

  process.stdout.write(`${lines.join('\n')}\n`);
  if (findings.length > 0 && process.argv.includes('--check')) process.exitCode = 1;
}

if (process.argv[1] && toPosix(process.argv[1]).endsWith('check/localization/physical-properties/index.mjs')) {
  main();
}
