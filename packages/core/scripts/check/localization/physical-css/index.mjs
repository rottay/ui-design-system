#!/usr/bin/env node
/**
 * PHYSICAL CSS (WO-INV-01) -- the stylesheet half of the paint law.
 *
 * `direction-authority` governs how a component ASKS for the reading
 * direction; `physical-properties` governs the physical edges a component
 * writes into a STYLE OBJECT. Neither reads a single byte of CSS, and the
 * Modern engine paints from its skins: `margin-left`, `border-right`,
 * `left: 50%` and a signed `translateX()` written in a stylesheet land on the
 * wrong side under RTL exactly the way an inline `marginLeft` does. This gate
 * is that third scan, so the WO's "Modern CSS is 100 % logical" outcome is
 * measured instead of asserted.
 *
 * SCOPE: every authored CSS owner below `CSS_ROOT` (`SCAN_ROOTS`) -- the
 * Modern engine, the engine-agnostic component skins, and the engine-agnostic
 * foundations they paint from (responsive channels, keyframes, transitions).
 * Scoping the scan to the skins alone would have measured a `margin-left` in a
 * skin and missed the same edge in the keyframe the skin animates with.
 * Classic and Rustic are frozen by owner decision and are excluded BY PATH,
 * not pinned: the freeze gate already governs them with written,
 * content-pinned exceptions, and a second ratchet over the same files would
 * duplicate noise rather than signal.
 *
 * SHORTHANDS COUNT. A longhand vocabulary fails open: `padding: 8px 32px 8px
 * 12px` and `border-radius: 0 8px 8px 0` write different inline edges without
 * ever spelling `padding-left`. Box shorthands are read at positions 2 and 4,
 * `border-radius` as its two inline corner pairs, and only an ASYMMETRIC value
 * is a site.
 *
 * A REAL TOKENIZER, NOT A REGEX. The scan is a postcss parse, so a declaration
 * counts however it is nested (media query, supports, keyframes, nested rule),
 * comments and strings never become declarations, and a `transform` is read by
 * its function arguments rather than by the letters in its text.
 *
 * FOUR CLASSES, MEASURED APART.
 *
 *   NAMED EXCEPTIONS. A declaration that is physical BY NATURE and whose
 *       logical spelling would be the bug. The open class is
 *       `env(safe-area-inset-left|right)`: the viewport inset itself is a
 *       physical edge the UA reports, so `padding-inline-start` fed by
 *       `safe-area-inset-left` would pad the wrong notch under RTL. Declared
 *       per SITE -- path plus a locator (`selector | property: value`) -- with
 *       a class whose rationale is written once in `exceptionClasses`.
 *
 *   PHYSICAL STAMP. A declaration keyed on a physical `data-*` contract:
 *       `[data-placement='left']`, `[data-fixed='right']`, `[data-align='left']`.
 *       While the ATTRIBUTE vocabulary is physical the paint must follow it,
 *       so the migration is the vocabulary's, not the stylesheet's. Declared
 *       per SELECTOR so the band drains selector by selector as each contract
 *       turns logical, and counted, so a new physical stamp cannot hide behind
 *       an already-declared one.
 *
 *   INERT. Both inline edges pinned to the same value (`left: 0` with
 *       `right: 0`), a centred `left: 50%` paired with a translate, or a
 *       translate whose only x component is the centring +/-50%. Flipping the
 *       direction moves nothing, so clearing one is a zero-pixel change --
 *       counted rather than excluded by rule, because a pinned band is what
 *       stops tomorrow's unpaired `left: 0` arriving unnoticed.
 *
 *   PINNED DEBT. Everything else: a physical edge that should be logical, or
 *       an asymmetric `translateX` with no `:dir(rtl)` mirror. Count per file,
 *       decrease-only: growth fails, a site in an unpinned file fails as a new
 *       owner, and a fix fails with an instruction to lower the pin.
 *
 * MIRRORED TRANSFORMS ARE NOT SITES. A signed `translateX` whose rule has an
 * RTL-qualified twin (`:dir(rtl)` / `[dir='rtl']`) that re-declares the
 * transform is already direction-correct: the base rule paints LTR, the twin
 * paints the mirror. Unlike an inset, a transform has no logical spelling to
 * migrate to -- the mirror IS the migration -- so the pair is green and the
 * gate reports it as a tally rather than as debt. The twin has to WIN,
 * though: the qualifier is read per selector part, and the twin must either
 * out-specify the base or tie and be declared after it, so a twin written
 * above an equally specific base is dead paint rather than a mirror.
 *
 * Usage:
 *   node scripts/check/localization/physical-css/index.mjs           # report
 *   node scripts/check/localization/physical-css/index.mjs --check   # exit 1 on any finding
 *   node scripts/check/localization/physical-css/index.mjs --write   # (re)seed the baseline counts
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import postcss from 'postcss';

import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = findPackageRoot(HERE);
const BASELINE_PATH = join(HERE, 'baseline/index.json');

/** Paths are reported relative to this owner, so both scan roots read alike. */
export const CSS_ROOT = 'src/foundation/tokens/css';

/**
 * The scanned corpus: every authored CSS owner below `CSS_ROOT`. The roots are
 * named rather than implied so a drill can mirror them, but together they are
 * the whole tree: the Modern engine, the engine-agnostic component skins AND
 * the engine-agnostic foundations those skins consume -- the responsive
 * channel vocabulary, the keyframe library and the transition library all
 * paint physical edges that reach Modern through `@import` and class use.
 * Nothing below `CSS_ROOT` is exempt; the frozen engines are cut by path.
 */
export const SCAN_ROOTS = Object.freeze([
  'facade',
  'foundation',
  'presentation',
  'runtime',
]);

/** Frozen by owner decision; the freeze gate governs them, not this one. */
export const FROZEN = /(^|\/)engines\/(classic|rustic)\//;

/**
 * The physical inline-axis properties. Every one has a logical counterpart
 * that follows the reading direction; `text-align` and `float` count only when
 * their VALUE is physical, since `center`, `justify` and `none` are neutral.
 */
export const PHYSICAL_PROPERTIES = Object.freeze([
  'left', 'right',
  'margin-left', 'margin-right',
  'padding-left', 'padding-right',
  'border-left', 'border-right',
  'border-left-width', 'border-right-width',
  'border-left-color', 'border-right-color',
  'border-left-style', 'border-right-style',
  'border-top-left-radius', 'border-top-right-radius',
  'border-bottom-left-radius', 'border-bottom-right-radius',
  'scroll-margin-left', 'scroll-margin-right',
  'scroll-padding-left', 'scroll-padding-right',
  'text-align', 'float',
]);

/**
 * The physical SHORTHANDS. A longhand vocabulary alone fails open: `padding:
 * 8px 32px 8px 12px` writes a different inline start and end without ever
 * spelling `padding-left`. A box shorthand lists top/right/bottom/left, so its
 * inline edges are the 2nd and 4th value and only the four-value form can be
 * asymmetric; `border-radius` lists TL/TR/BR/BL, so it carries two inline
 * pairs. A symmetric value is not a site: it paints the same on both edges, so
 * there is nothing for the reading direction to move and nothing to drain.
 */
export const PHYSICAL_SHORTHANDS = Object.freeze({
  inset: 'box',
  margin: 'box',
  padding: 'box',
  'border-width': 'box',
  'border-color': 'box',
  'border-style': 'box',
  'scroll-margin': 'box',
  'scroll-padding': 'box',
  'border-radius': 'corner',
});

const PHYSICAL = new Set(PHYSICAL_PROPERTIES);
const VALUE_GATED = new Set(['text-align', 'float']);
/**
 * A physical keyword, wherever the value spells it: bare, or as the fallback of
 * a `var()` (`text-align: var(--ds-x, left)`), which a space-delimited match
 * would read as neutral because a `)` follows it.
 */
const PHYSICAL_VALUE = /(^|[\s,(])(left|right)([\s,)]|$)/i;
const TRANSFORM_PROPERTIES = new Set(['transform', 'translate', '-webkit-transform']);
const RTL_QUALIFIER = /:dir\(\s*rtl\s*\)|\[\s*dir\s*[~|^$*]?=\s*['"]?rtl['"]?\s*\]/gi;
const ZERO = /^[+-]?0(?:\.0+)?(?:px|%|r?em|vw|vh|ch|ex|pt|cm|mm|in|pc|q|vmin|vmax)?$/i;
const CENTRING = /^[+-]?50%$/;
/** A component that actually moves the box: a number, or an expression that resolves to one. `none` and the CSS-wide keywords do not. */
const LENGTH = /^([+-]?(\d+\.?\d*|\.\d+)|calc\(|var\(|min\(|max\(|clamp\(|matrix\(\))/i;
const SAFE_AREA = /env\(\s*safe-area-inset-(left|right)\b/i;

const toPosix = (value) => value.split(sep).join('/');
const squash = (text) => text.replace(/\s+/g, ' ').trim();

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === 'node_modules' || entry === 'tests') continue;
      walk(full, out);
    } else if (entry.endsWith('.css')) {
      out.push(full);
    }
  }
  return out;
}

/** Splits a value on top-level commas, so `translate(a, b)` stays one argument list. */
function splitArguments(text) {
  const parts = [];
  let depth = 0;
  let current = '';
  for (const character of text) {
    if (character === '(') depth += 1;
    if (character === ')') depth -= 1;
    if (character === ',' && depth === 0) {
      parts.push(current);
      current = '';
      continue;
    }
    current += character;
  }
  parts.push(current);
  return parts.map((part) => part.trim()).filter(Boolean);
}

/** The top-level `name(args)` calls a value spells, in order. */
function functionCalls(value) {
  const calls = [];
  const pattern = /([a-z][a-z0-9-]*)\s*\(/gi;
  let match = pattern.exec(value);
  while (match) {
    let depth = 1;
    let index = pattern.lastIndex;
    while (index < value.length && depth > 0) {
      if (value[index] === '(') depth += 1;
      if (value[index] === ')') depth -= 1;
      index += 1;
    }
    calls.push({ name: match[1].toLowerCase(), args: value.slice(pattern.lastIndex, index - 1) });
    pattern.lastIndex = index;
    match = pattern.exec(value);
  }
  return calls;
}

/** Splits a value on top-level whitespace, so `var(--a, b)` stays one term. */
function splitTerms(text) {
  const parts = [];
  let depth = 0;
  let current = '';
  for (const character of text) {
    if (character === '(') depth += 1;
    if (character === ')') depth -= 1;
    if (depth === 0 && /\s/.test(character)) {
      if (current) parts.push(current);
      current = '';
      continue;
    }
    current += character;
  }
  if (current) parts.push(current);
  return parts;
}

/**
 * The inline-edge PAIRS a physical shorthand writes, as `[start-side,
 * end-side]` in physical order. A pair whose two members differ is a site: the
 * declaration paints one inline edge differently from the other and carries no
 * logical spelling to follow the reading direction. The elliptical
 * `border-radius a / b` form is two radius lists and is out of scope; a value
 * the gate cannot read as a list (one term, a CSS-wide keyword, a `var()`
 * standing for the whole list) yields no pair rather than a guess.
 */
export function shorthandInlinePairs(property, value) {
  const kind = PHYSICAL_SHORTHANDS[property];
  if (!kind) return [];
  const text = squash(value);
  if (kind === 'corner' && text.includes('/')) return [];
  const terms = splitTerms(text);
  if (terms.length < 2 || terms.length > 4) return [];
  if (kind === 'box') return terms.length === 4 ? [[terms[3], terms[1]]] : [];
  const [topLeft, topRight = topLeft, bottomRight = topLeft, bottomLeft = topRight] = terms;
  return [[topLeft, topRight], [bottomLeft, bottomRight]];
}

/** True when a shorthand paints its two inline edges differently. */
const isAsymmetricShorthand = (property, value) =>
  shorthandInlinePairs(property, value).some(([start, end]) => start !== end);

const SPEC_FUNCTIONAL = /:(where|is|not|has|matches|any)\(/i;
const SPEC_ID = /#[-\w]+/g;
const SPEC_CLASS = /\.[-\w]+/g;
const SPEC_ATTRIBUTE = /\[[^\]]*\]/g;
const SPEC_PSEUDO_ELEMENT = /::[-\w]+/g;
const SPEC_PSEUDO_CLASS = /:[-\w]+/g;
const SPEC_TYPE = /(^|[\s>+~])([a-z][-\w]*)/gi;

/** Ordering over `[id, class, type]` specificity triples. */
export function compareSpecificity(left, right) {
  for (let slot = 0; slot < 3; slot += 1) {
    if (left[slot] !== right[slot]) return left[slot] > right[slot] ? 1 : -1;
  }
  return 0;
}

/**
 * The `[id, class, type]` specificity of one selector. At-rule segments of a
 * nesting chain carry none, `:where()` contributes nothing, and `:is()`,
 * `:not()` and `:has()` contribute their most specific argument. It exists so
 * an RTL twin is only read as a mirror when the cascade actually lets it win.
 */
export function specificity(selector) {
  let text = selector.split(' / ').filter((segment) => !segment.startsWith('@')).join(' ');
  const total = [0, 0, 0];
  let guard = 0;
  let match = SPEC_FUNCTIONAL.exec(text);
  while (match && guard < 64) {
    guard += 1;
    const open = match.index + match[0].length - 1;
    let depth = 1;
    let index = open + 1;
    while (index < text.length && depth > 0) {
      if (text[index] === '(') depth += 1;
      if (text[index] === ')') depth -= 1;
      index += 1;
    }
    if (match[1].toLowerCase() !== 'where') {
      let best = [0, 0, 0];
      for (const argument of splitArguments(text.slice(open + 1, index - 1))) {
        const inner = specificity(argument);
        if (compareSpecificity(inner, best) > 0) best = inner;
      }
      for (let slot = 0; slot < 3; slot += 1) total[slot] += best[slot];
    }
    text = `${text.slice(0, match.index)}${text.slice(index)}`;
    match = SPEC_FUNCTIONAL.exec(text);
  }
  text = text.replace(/:([-\w]+)\([^()]*\)/g, ':$1');
  const count = (pattern) => (text.match(pattern) ?? []).length;
  total[0] += count(SPEC_ID);
  text = text.replace(SPEC_ID, ' ');
  const pseudoElements = count(SPEC_PSEUDO_ELEMENT);
  text = text.replace(SPEC_PSEUDO_ELEMENT, ' ');
  total[1] += count(SPEC_CLASS) + count(SPEC_ATTRIBUTE) + count(SPEC_PSEUDO_CLASS);
  text = text.replace(SPEC_CLASS, ' ').replace(SPEC_ATTRIBUTE, ' ').replace(SPEC_PSEUDO_CLASS, ' ');
  total[2] += pseudoElements + count(SPEC_TYPE);
  return total;
}

/**
 * The x components a transform-family value moves the box by, `0` dropped. A
 * `matrix()` is not decomposed: it is returned as an unresolved component, so
 * it is judged as asymmetric rather than silently passed.
 */
export function inlineTranslations(property, value) {
  const components = [];
  if (property === 'translate') {
    const top = splitArguments(value);
    const [x] = top.length > 1 ? top : value.trim().split(/\s+/);
    if (x) components.push(x);
  }
  for (const call of functionCalls(value)) {
    if (call.name === 'translatex') components.push(...splitArguments(call.args).slice(0, 1));
    else if (call.name === 'translate' || call.name === 'translate3d') components.push(...splitArguments(call.args).slice(0, 1));
    else if (call.name === 'matrix' || call.name === 'matrix3d') components.push('matrix()');
  }
  return components.filter((component) => LENGTH.test(component) && !ZERO.test(component));
}

/** The nesting chain a declaration sits in, as one readable selector. */
function selectorOf(node) {
  const chain = [];
  for (let current = node.parent; current && current.type !== 'root'; current = current.parent) {
    if (current.type === 'rule') chain.unshift(current.selector);
    else if (current.type === 'atrule') chain.unshift(`@${current.name} ${current.params}`);
  }
  return squash(chain.join(' / '));
}

/**
 * The selector a twin mirrors: the RTL qualifier removed, and any functional
 * pseudo-class it emptied removed with it, so `.x:where(:dir(rtl))` cores to
 * `.x` instead of to a `:where()` that matches nothing.
 */
const stripRtl = (selector) => squash(
  selector
    .replace(RTL_QUALIFIER, '')
    .replace(/:(where|is|not|has|matches|any)\(\s*\)/gi, ''),
);
/** A comma list is a list of rules that happen to share a body; each part mirrors on its own. */
const selectorParts = (selector) => splitArguments(selector).map(stripRtl).filter(Boolean);
const isRtlQualified = (selector) => {
  RTL_QUALIFIER.lastIndex = 0;
  return RTL_QUALIFIER.test(selector);
};

/**
 * The physical sites one stylesheet writes. Exported so a drill can measure a
 * single fixture without mirroring a tree.
 *
 * `kind` is what the declaration is; `band` is how the law reads it, before
 * the baseline gets a say: `inert` for a symmetric or centred site,
 * `mirrored` for a translate whose RTL twin already flips it, `physical`
 * otherwise. Only `safeArea` is decided here from the value itself, because
 * the UA -- not the author -- makes that number physical.
 */
export function fileSites(path, text) {
  const root = postcss.parse(text, { from: path });
  const sites = [];
  /** Document order, so the cascade's last-one-wins tie can be judged. */
  const order = new Map();
  root.walkDecls((declaration) => order.set(declaration, order.size));

  /**
   * Selectors whose RTL twin re-declares a transform, with the twin's
   * specificity and source position. A qualifier is read PER SELECTOR PART:
   * in `.a, .b:dir(rtl)` only `.b` is mirrored, and reading the rule as a
   * whole would hand `.a` a mirror it never had.
   */
  const mirroredCores = new Map();

  root.walkDecls((declaration) => {
    if (!TRANSFORM_PROPERTIES.has(declaration.prop.toLowerCase())) return;
    const selector = selectorOf(declaration);
    for (const part of splitArguments(selector)) {
      if (!isRtlQualified(part)) continue;
      const core = stripRtl(part);
      if (!core) continue;
      const twin = { specificity: specificity(part), index: order.get(declaration) };
      const previous = mirroredCores.get(core);
      if (!previous || twin.index > previous.index) mirroredCores.set(core, twin);
    }
  });

  /**
   * A twin only mirrors what the cascade lets it override: it must be more
   * specific than the base, or tie on specificity and be declared after it.
   * A twin written ABOVE an equally specific base is dead paint, not a mirror.
   */
  const isMirroredBy = (selector, index) => selectorParts(selector).some((part) => {
    const twin = mirroredCores.get(part);
    if (!twin) return false;
    const relation = compareSpecificity(twin.specificity, specificity(part));
    return relation > 0 || (relation === 0 && twin.index > index);
  });

  root.walkDecls((declaration) => {
    const property = declaration.prop.toLowerCase();
    const value = squash(declaration.value);
    const selector = selectorOf(declaration);
    const rule = declaration.parent;
    const siblingValue = (name) => rule?.nodes
      ?.filter((node) => node.type === 'decl' && node.prop.toLowerCase() === name)
      .map((node) => squash(node.value))
      .pop();

    let kind = null;
    let band = 'physical';

    if (PHYSICAL_SHORTHANDS[property]) {
      if (!isAsymmetricShorthand(property, value)) return;
      kind = 'shorthand';
    } else if (PHYSICAL.has(property)) {
      if (VALUE_GATED.has(property)) {
        if (!PHYSICAL_VALUE.test(value)) return;
        kind = 'declaration';
      } else {
        kind = 'declaration';
        if (SAFE_AREA.test(value)) band = 'safeArea';
        else if (property === 'left' || property === 'right') {
          const opposite = siblingValue(property === 'left' ? 'right' : 'left');
          const transform = ['transform', 'translate', '-webkit-transform']
            .map((name) => [name, siblingValue(name)])
            .find(([, sibling]) => sibling !== undefined);
          if (opposite !== undefined && opposite === value) band = 'inert';
          else if (CENTRING.test(value) && transform && inlineTranslations(transform[0], transform[1]).length > 0) band = 'inert';
        }
      }
    } else if (TRANSFORM_PROPERTIES.has(property)) {
      const components = inlineTranslations(property, value);
      if (components.length === 0) return;
      kind = 'transform';
      if (isRtlQualified(selector) || isMirroredBy(selector, order.get(declaration))) band = 'mirrored';
      else if (components.every((component) => CENTRING.test(component))) band = 'inert';
    }

    if (kind === null) return;
    sites.push({
      path,
      line: declaration.source?.start?.line ?? 0,
      property,
      selector,
      kind,
      band,
      locator: `${selector} | ${property}: ${value}`,
    });
  });

  return sites.sort((a, b) => a.line - b.line || a.locator.localeCompare(b.locator));
}

/** Every physical CSS site under the scan roots. `root` exists so a drill can measure a sandbox copy. */
export function physicalCssSites(root = ROOT) {
  const cssRoot = join(root, CSS_ROOT);
  const sites = [];
  for (const scanRoot of SCAN_ROOTS) {
    for (const file of walk(join(cssRoot, scanRoot))) {
      const path = toPosix(relative(cssRoot, file));
      if (FROZEN.test(`/${path}`)) continue;
      sites.push(...fileSites(path, readFileSync(file, 'utf8')));
    }
  }
  return sites.sort((a, b) => a.path.localeCompare(b.path) || a.line - b.line);
}

/** Site COUNT per file -- the unit every band pins. */
export function countSites(sites) {
  const counts = {};
  for (const site of sites) counts[site.path] = (counts[site.path] ?? 0) + 1;
  return counts;
}

export function readBaseline(baselinePath = BASELINE_PATH) {
  return JSON.parse(readFileSync(baselinePath, 'utf8'));
}

export function namedExceptions(baseline = readBaseline()) {
  return baseline.namedExceptions;
}

const isExcepted = (site, exceptions) =>
  Boolean(exceptions[site.path]?.sites.some((row) => row.locator === site.locator));

const declaredStamp = (site, stamps) =>
  stamps[site.path]?.selectors.some((row) => row.selector === site.selector);

/**
 * Sorts the measured sites into the four classes plus the mirrored tally. The
 * baseline decides two of them (an exception names a site, a stamp names a
 * selector); the measurement decides the rest.
 */
export function classify(sites, baseline = readBaseline()) {
  const bands = { excepted: [], stamp: [], inert: [], debt: [], mirrored: [] };
  for (const site of sites) {
    if (site.band === 'mirrored') bands.mirrored.push(site);
    else if (isExcepted(site, baseline.namedExceptions)) bands.excepted.push(site);
    else if (declaredStamp(site, baseline.physicalStamp)) bands.stamp.push(site);
    else if (site.band === 'inert') bands.inert.push(site);
    else bands.debt.push(site);
  }
  return bands;
}

/**
 * The verdict, over SITES: an exception exempts exactly the one site its
 * locator names, a stamp exempts exactly the selector it names, and everything
 * else is judged by the per-file debt and inert pins.
 */
export function judge(sites, baseline = readBaseline()) {
  if (!Array.isArray(sites)) {
    throw new TypeError('judge() takes the site list: a count map cannot bind an exception to its site');
  }
  const findings = [];
  const { namedExceptions: exceptions, exceptionClasses, physicalStamp, pinnedDebt, inert } = baseline;

  for (const [path, row] of Object.entries(exceptions).sort()) {
    for (const { locator, class: className } of row.sites) {
      const matches = sites.filter((site) => site.path === path && site.locator === locator).length;
      if (matches === 0) {
        findings.push(
          `${path}: named exception \`${locator}\` matches no physical site -- retire it, or adjudicate the site that replaced it.`,
        );
      } else if (matches > 1) {
        findings.push(`${path}: named exception \`${locator}\` matches ${matches} sites -- an exception names exactly one.`);
      }
      if (!exceptionClasses[className]) {
        findings.push(`${path}: named exception \`${locator}\` claims the undeclared class \`${className}\`.`);
      }
    }
  }

  const bands = classify(sites, baseline);

  for (const [path, row] of Object.entries(physicalStamp).sort()) {
    for (const pin of row.selectors) {
      const matches = bands.stamp.filter((site) => site.path === path && site.selector === pin.selector).length;
      if (matches === 0) {
        findings.push(
          `${path}: physical stamp \`${pin.selector}\` matches no site -- the contract turned logical, so remove the row.`,
        );
      } else if (matches > pin.sites) {
        findings.push(`${path}: physical stamp \`${pin.selector}\` GREW from ${pin.sites} to ${matches}.`);
      } else if (matches < pin.sites) {
        findings.push(`${path}: physical stamp \`${pin.selector}\` FELL from ${pin.sites} to ${matches} -- lower the pin to ${matches}.`);
      }
    }
  }

  for (const [band, pins, banded] of [['debt', pinnedDebt, bands.debt], ['inert', inert, bands.inert]]) {
    const counts = countSites(banded);
    for (const [path, count] of Object.entries(counts).sort()) {
      const pin = pins[path];
      if (!pin) {
        const named = banded.filter((site) => site.path === path).map((site) => `\`${site.locator}\``).join(', ');
        findings.push(
          `${path}: ${count} physical-CSS ${band} site(s) no band declares: ${named}. `
            + 'Write the logical spelling, or declare the site in the baseline with the reason it must stay physical.',
        );
        continue;
      }
      if (count > pin.sites) findings.push(`${path}: physical-CSS ${band} sites GREW from ${pin.sites} to ${count}.`);
      else if (count < pin.sites) findings.push(`${path}: physical-CSS ${band} sites FELL from ${pin.sites} to ${count} (${band}) -- lower the pin to ${count}.`);
    }
    for (const [path, pin] of Object.entries(pins).sort()) {
      if (counts[path] === undefined) {
        findings.push(`${path}: pinned at ${pin.sites} ${band} site(s) and now has none -- remove the pin.`);
      }
    }
  }

  return findings;
}

export function run(root = ROOT, baseline = readBaseline()) {
  const sites = physicalCssSites(root);
  return { sites, bands: classify(sites, baseline), findings: judge(sites, baseline) };
}

/**
 * Seeds the band COUNTS from the measured tree, keeping every reason already
 * written. It never invents an exception and never turns a debt row into a
 * stamp: a new site arrives as debt, with the measurement quoted in its reason,
 * and stays there until someone adjudicates it by hand.
 */
export function seedBaseline(root = ROOT, baseline = readBaseline()) {
  const sites = physicalCssSites(root);
  const bands = classify(sites, baseline);
  const TAIL = {
    debt: 'An asymmetric translate owes a `:dir(rtl)` mirror (the L3 lot of WO-INV-01); a physical edge owes its logical spelling.',
    inert: 'Both inline edges carry the same value, or the offset is the centring +/-50% paired with a translate, so the reading '
      + 'direction moves nothing and clearing the row is a zero-pixel change.',
  };
  const describe = (rows, band) => {
    const tally = {};
    for (const site of rows) {
      const label = site.kind === 'transform'
        ? `${site.property} (signed x)`
        : (site.kind === 'shorthand' ? `${site.property} (asymmetric inline pair)` : site.property);
      tally[label] = (tally[label] ?? 0) + 1;
    }
    const spread = Object.entries(tally).sort().map(([label, count]) => `${count} x ${label}`).join(', ');
    const named = rows.slice(0, 4).map((site) => `\`${site.locator}\``).join('; ');
    return `${rows.length} measured site(s): ${spread}. First: ${named}. ${TAIL[band]}`;
  };
  const band = (rows, previous, name) => {
    const out = {};
    for (const [path, count] of Object.entries(countSites(rows)).sort()) {
      out[path] = {
        sites: count,
        reason: previous[path]?.reason ?? describe(rows.filter((site) => site.path === path), name),
      };
    }
    return out;
  };
  const stamp = {};
  for (const [path, row] of Object.entries(baseline.physicalStamp).sort()) {
    const selectors = row.selectors
      .map((pin) => ({
        selector: pin.selector,
        sites: bands.stamp.filter((site) => site.path === path && site.selector === pin.selector).length,
        reason: pin.reason,
      }))
      .filter((pin) => pin.sites > 0);
    if (selectors.length > 0) stamp[path] = { selectors };
  }
  return {
    ...baseline,
    physicalStamp: stamp,
    pinnedDebt: band(bands.debt, baseline.pinnedDebt, 'debt'),
    inert: band(bands.inert, baseline.inert, 'inert'),
  };
}

function main() {
  const baseline = readBaseline();
  if (process.argv.includes('--write')) {
    writeFileSync(BASELINE_PATH, `${JSON.stringify(seedBaseline(ROOT, baseline), null, 2)}\n`);
    process.stdout.write(`[physical-css] baseline seeded at ${toPosix(relative(ROOT, BASELINE_PATH))}\n`);
    return;
  }
  const { bands, findings } = run(ROOT, baseline);
  const files = (rows) => new Set(rows.map((site) => site.path)).size;
  const lines = [
    '[physical-css]',
    `  debt awaiting the logical spelling : ${bands.debt.length} in ${files(bands.debt)} file(s)`,
    `  inert (symmetric / centred)        : ${bands.inert.length} in ${files(bands.inert)} file(s)`,
    `  physical stamp (physical contract) : ${bands.stamp.length} in ${files(bands.stamp)} file(s)`,
    `  named exceptions (declared class)  : ${bands.excepted.length} site(s) in ${files(bands.excepted)} file(s)`,
    `  mirrored translates (:dir(rtl))    : ${bands.mirrored.length} site(s), not debt`,
    '  frozen engines                     : excluded by path (the freeze gate owns them)',
  ];
  for (const [path, count] of Object.entries(countSites(bands.debt)).sort()) lines.push(`  DEBT  ${path}: ${count}`);
  for (const [path, count] of Object.entries(countSites(bands.inert)).sort()) lines.push(`  INERT ${path}: ${count}`);
  for (const [path, count] of Object.entries(countSites(bands.stamp)).sort()) lines.push(`  STAMP ${path}: ${count}`);
  for (const site of bands.excepted) lines.push(`  EXCEPTION ${site.path}:${site.line} \`${site.locator}\``);
  for (const finding of findings) lines.push(`  FINDING ${finding}`);
  lines.push(findings.length > 0 ? '[physical-css] FAIL' : '[physical-css] OK');

  process.stdout.write(`${lines.join('\n')}\n`);
  if (findings.length > 0 && process.argv.includes('--check')) process.exitCode = 1;
}

if (process.argv[1] && toPosix(process.argv[1]).endsWith('check/localization/physical-css/index.mjs')) {
  main();
}
