/**
 * The shared touch-target chain follower, resolving PER CASCADE CONTEXT.
 *
 * WHY THIS EXISTS AS ITS OWN OWNER. `a11y-floors-contract.test.ts` carried a
 * private copy whose `declaredValues()` joined eight files into one string and
 * asked `.some()`. Measured (WO-INV-03 Lot B): restoring the bare `2.75rem` at
 * `foundation/responsive/button/index.css` left the suite green, because
 * `presentation/components/button/index.css` declares the SAME channel with
 * `max(44px, 2.75rem)` somewhere else in the corpus. One correct declaration
 * absolved a wrong one. A floor that a sibling file can satisfy on your behalf
 * is not a floor.
 *
 * WHAT A CASCADE CONTEXT IS HERE. Every declaration is kept as a site --
 * channel, value, file, line and the `@media` conditions enclosing it -- and
 * classified against the one context this contract governs, a coarse pointer:
 *
 *   `coarse`        the site is inside `(pointer: coarse)` / `(hover: none)`;
 *                   it is written FOR this context and overrides the base
 *   `base`          the site is unconditional, or conditioned on something
 *                   that does not constrain the pointer (width, contrast,
 *                   colour scheme); it applies under coarse unless a `coarse`
 *                   site for the same channel exists
 *   `inapplicable`  the site is inside `(pointer: fine)` / `(hover: hover)` /
 *                   `print`; a coarse pointer never sees it, so it is dropped
 *
 * The governing set of a channel is every site at the HIGHEST rank present --
 * `coarse` if any, else `base` -- and ALL of them must reach the floor. This is
 * a deliberate over-approximation on one axis: file order across the import
 * graph is not used to pick a single winner inside a rank, so two base sites
 * both have to be correct. A gate that guessed the winner and was wrong would
 * be worse than one that requires every candidate to be safe.
 *
 * FALLBACKS ARE ONLY READ WHEN THE CHANNEL IS UNDECLARED. `var(--c, 44px)` does
 * not reach the floor when `--c` resolves to `2.75rem`: the fallback arm is
 * unreachable by construction. The private copy consulted the fallback anyway,
 * which is the second way it passed a value that never ships.
 */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const postcss = require('postcss');

export const COARSE = 'coarse';
export const BASE = 'base';
export const INAPPLICABLE = 'inapplicable';

const COARSE_CONDITION = /\(\s*pointer\s*:\s*coarse\s*\)|\(\s*hover\s*:\s*none\s*\)/;
const FINE_CONDITION = /\(\s*pointer\s*:\s*fine\s*\)|\(\s*hover\s*:\s*hover\s*\)/;
const PRINT_CONDITION = /(^|[\s,(])print([\s,)]|$)/;

/** A media query list is a disjunction: one coarse arm makes the whole list reachable. */
export function classifyMedia(conditions) {
  if (conditions.length === 0) return BASE;
  let rank = BASE;
  for (const condition of conditions) {
    if (COARSE_CONDITION.test(condition)) {
      rank = COARSE;
      continue;
    }
    // A query that is ONLY about a fine pointer or print cannot be entered by
    // the device this floor protects.
    if (!COARSE_CONDITION.test(condition) && (FINE_CONDITION.test(condition) || PRINT_CONDITION.test(condition))) {
      return INAPPLICABLE;
    }
  }
  return rank;
}

function enclosingMedia(node) {
  const conditions = [];
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (parent.type === 'atrule' && parent.name === 'media') conditions.unshift(parent.params);
  }
  return conditions;
}

/**
 * Every custom-property declaration in the corpus, not only the touch-named
 * ones: a chain reaches the floor through whatever it names, and
 * `--ds-data-table-touch-target` reaches `--ds-spacing-11`.
 */
export function collectDeclarations(sources) {
  const declarations = [];
  for (const source of sources) {
    const root = postcss.parse(source.content, { from: source.name });
    root.walkDecls((decl) => {
      if (!decl.prop.startsWith('--')) return;
      const conditions = enclosingMedia(decl);
      declarations.push({
        channel: decl.prop,
        value: decl.value.trim(),
        file: source.name,
        line: decl.source?.start?.line ?? 0,
        selector: decl.parent?.type === 'rule' ? decl.parent.selector : '',
        conditions,
        rank: classifyMedia(conditions),
      });
    });
  }
  return declarations;
}

/**
 * Channel -> the sites that govern it under a coarse pointer. `coarse` sites
 * shadow `base` ones; `inapplicable` sites never enter.
 */
export function buildCascade(declarations) {
  const byChannel = new Map();
  for (const declaration of declarations) {
    if (declaration.rank === INAPPLICABLE) continue;
    const bucket = byChannel.get(declaration.channel);
    if (bucket) bucket.push(declaration);
    else byChannel.set(declaration.channel, [declaration]);
  }
  const cascade = new Map();
  for (const [channel, sites] of byChannel) {
    const coarse = sites.filter((site) => site.rank === COARSE);
    cascade.set(channel, coarse.length > 0 ? coarse : sites);
  }
  return cascade;
}

const VAR_CALL = /var\(\s*(--[a-zA-Z0-9_-]+)\s*(?:,([\s\S]*))?\)/;

/** The `var()` calls at the TOP level of an expression, with balanced fallbacks. */
export function topLevelVars(expression) {
  const calls = [];
  for (let index = expression.indexOf('var('); index !== -1; index = expression.indexOf('var(', index + 4)) {
    let depth = 0;
    let end = -1;
    for (let cursor = index + 3; cursor < expression.length; cursor += 1) {
      const character = expression[cursor];
      if (character === '(') depth += 1;
      else if (character === ')') {
        depth -= 1;
        if (depth === 0) {
          end = cursor;
          break;
        }
      }
    }
    if (end === -1) break;
    const call = expression.slice(index, end + 1);
    const match = VAR_CALL.exec(call);
    if (match) calls.push({ channel: match[1], fallback: (match[2] ?? '').trim(), call });
    index = end - 3;
  }
  return calls;
}

/** Absolute pixel lengths written in place, ignoring anything inside a `var()`. */
function literalPixels(expression) {
  let stripped = expression;
  for (const { call } of topLevelVars(expression)) stripped = stripped.split(call).join(' ');
  return [...stripped.matchAll(/(-?\d+(?:\.\d+)?)px/g)].map((match) => Number(match[1]));
}

/**
 * Does this expression resolve to at least `floorPx` PHYSICAL pixels under a
 * coarse pointer? `min()` is refused by name: it contains a satisfying literal
 * and still resolves below it.
 */
export function reachesFloor(expression, cascade, floorPx, depth = 0) {
  if (!expression || depth > 6) return { reached: false, why: depth > 6 ? 'chain too deep' : 'empty value' };
  if (/\bmin\s*\(/.test(expression)) {
    return { reached: false, why: `min() can resolve below its own literals: ${expression}` };
  }
  if (literalPixels(expression).some((pixels) => pixels >= floorPx)) {
    return { reached: true, why: `${floorPx}px or more written in place` };
  }
  const calls = topLevelVars(expression);
  if (calls.length === 0) {
    return { reached: false, why: `no ${floorPx}px and no channel to follow: ${expression}` };
  }
  const failures = [];
  for (const { channel, fallback } of calls) {
    const sites = cascade.get(channel);
    if (sites && sites.length > 0) {
      // The channel IS declared, so the fallback arm can never be taken. Every
      // site that could win has to carry the floor on its own.
      const bad = sites
        .map((site) => ({ site, verdict: reachesFloor(site.value, cascade, floorPx, depth + 1) }))
        .filter((row) => !row.verdict.reached);
      if (bad.length === 0) return { reached: true, why: `${channel} reaches the floor at every governing site` };
      failures.push(
        ...bad.map((row) => `${channel} @ ${row.site.file}:${row.site.line} = ${row.site.value} (${row.verdict.why})`)
      );
      continue;
    }
    if (fallback) {
      const verdict = reachesFloor(fallback, cascade, floorPx, depth + 1);
      if (verdict.reached) return { reached: true, why: `${channel} is undeclared; its fallback reaches the floor` };
      failures.push(`${channel} is undeclared and its fallback does not reach: ${fallback}`);
      continue;
    }
    failures.push(`${channel} is undeclared and has no fallback`);
  }
  return { reached: false, why: failures.join('; ') };
}

const TOUCH_CHANNEL = /^--ds-[a-z0-9-]*touch-(?:target|size)[a-z0-9-]*$/;

/**
 * Properties whose value IS the box. For these the whole expression is judged,
 * so `max(var(--ds-touch-target-min, 44px), var(--ds-context-menu-…, 2rem))`
 * passes on the arm that reaches. Everywhere else -- the `::after` hit-area
 * idiom writes `inset: calc(50% - var(--ds-badge-remove-touch-size) / 2)` --
 * the expression is a position, not a length to compare against 44px, so the
 * unit judged is the touch channel it names.
 */
const SIZING_PROPERTY = /^(?:min-)?(?:block-size|inline-size|height|width)$/;

export function isTouchChannel(channel) {
  return TOUCH_CHANNEL.test(channel);
}

/** Every touch channel a source READS, with the enclosing media context. */
export function collectTouchReads(sources) {
  const reads = [];
  for (const source of sources) {
    const root = postcss.parse(source.content, { from: source.name });
    root.walkDecls((decl) => {
      if (decl.prop.startsWith('--')) return;
      const conditions = enclosingMedia(decl);
      if (classifyMedia(conditions) === INAPPLICABLE) return;
      for (const { channel, fallback } of topLevelVars(decl.value)) {
        if (!isTouchChannel(channel)) continue;
        const sizing = SIZING_PROPERTY.test(decl.prop);
        reads.push({
          channel,
          fallback,
          sizing,
          expression: sizing
            ? decl.value.trim()
            : fallback
              ? `var(${channel}, ${fallback})`
              : `var(${channel})`,
          property: decl.prop,
          file: source.name,
          line: decl.source?.start?.line ?? 0,
          conditions,
        });
      }
    });
  }
  return reads;
}
