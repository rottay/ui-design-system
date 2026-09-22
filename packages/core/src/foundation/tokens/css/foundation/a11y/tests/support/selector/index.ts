/**
 * Selector instruments shared by the two floor suites.
 *
 * A `:where()` convention that only a reviewer's eye enforces is not a law, and
 * the guard's (0,2,1) device is a number, not a shape -- both need computing.
 */

export interface Specificity {
  a: number;
  b: number;
  c: number;
}

const ZERO: Specificity = { a: 0, b: 0, c: 0 };

const add = (left: Specificity, right: Specificity): Specificity => ({
  a: left.a + right.a,
  b: left.b + right.b,
  c: left.c + right.c,
});

const greater = (left: Specificity, right: Specificity): boolean =>
  left.a !== right.a ? left.a > right.a : left.b !== right.b ? left.b > right.b : left.c > right.c;

export const specificityIsGreater = greater;

export const isZero = (value: Specificity): boolean =>
  value.a === 0 && value.b === 0 && value.c === 0;

export const format = (value: Specificity): string => `(${value.a},${value.b},${value.c})`;

const IDENT = /[-\w -￿\\]/;
/** Functional pseudo-classes that take the specificity of their most specific argument. */
const MATCH_ANY = new Set(['is', 'not', 'has', 'matches', '-moz-any', '-webkit-any']);
/** Pseudo-elements that predate the `::` spelling and still count as elements. */
const LEGACY_ELEMENTS = new Set(['before', 'after', 'first-line', 'first-letter']);

/** Index of the `)` closing the `(` at `open`. */
function closeParen(selector: string, open: number): number {
  let depth = 0;
  for (let index = open; index < selector.length; index += 1) {
    if (selector[index] === '(') depth += 1;
    else if (selector[index] === ')') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return selector.length;
}

/** Split a selector list on commas that are not inside `()`. */
export function splitSelectorList(list: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let buffer = '';
  for (const character of list) {
    if (character === '(') depth += 1;
    if (character === ')') depth -= 1;
    if (character === ',' && depth === 0) {
      parts.push(buffer);
      buffer = '';
      continue;
    }
    buffer += character;
  }
  parts.push(buffer);
  return parts.map((part) => part.trim()).filter(Boolean);
}

/**
 * Specificity of ONE complex selector, per selectors-4: `:where()` contributes
 * zero however deep it nests, `:is()`/`:not()`/`:has()` contribute their most
 * specific argument.
 */
export function specificity(selector: string): Specificity {
  let total: Specificity = ZERO;
  let index = 0;
  const readIdent = (from: number): string => {
    let end = from;
    while (end < selector.length && IDENT.test(selector[end])) end += 1;
    return selector.slice(from, end);
  };

  while (index < selector.length) {
    const character = selector[index];

    if (character === '#') {
      const name = readIdent(index + 1);
      total = add(total, { a: 1, b: 0, c: 0 });
      index += 1 + Math.max(name.length, 1);
      continue;
    }

    if (character === '.') {
      const name = readIdent(index + 1);
      total = add(total, { a: 0, b: 1, c: 0 });
      index += 1 + Math.max(name.length, 1);
      continue;
    }

    if (character === '[') {
      let depth = 0;
      let end = index;
      for (; end < selector.length; end += 1) {
        if (selector[end] === '[') depth += 1;
        else if (selector[end] === ']') {
          depth -= 1;
          if (depth === 0) break;
        }
      }
      total = add(total, { a: 0, b: 1, c: 0 });
      index = end + 1;
      continue;
    }

    if (character === ':') {
      const isElement = selector[index + 1] === ':';
      const nameStart = index + (isElement ? 2 : 1);
      const name = readIdent(nameStart).toLowerCase();
      let end = nameStart + name.length;
      let argument = '';
      if (selector[end] === '(') {
        const close = closeParen(selector, end);
        argument = selector.slice(end + 1, close);
        end = close + 1;
      }
      if (!isElement && name === 'where') {
        // The whole subtree contributes nothing. This is the floor's device.
      } else if (!isElement && MATCH_ANY.has(name)) {
        let strongest: Specificity = ZERO;
        for (const part of splitSelectorList(argument)) {
          const partSpecificity = specificity(part);
          if (greater(partSpecificity, strongest)) strongest = partSpecificity;
        }
        total = add(total, strongest);
      } else if (isElement || LEGACY_ELEMENTS.has(name)) {
        total = add(total, { a: 0, b: 0, c: 1 });
      } else {
        total = add(total, { a: 0, b: 1, c: 0 });
      }
      index = end;
      continue;
    }

    if (character === '*') {
      index += 1;
      continue;
    }

    if (/[a-zA-Z]/.test(character)) {
      const name = readIdent(index);
      total = add(total, { a: 0, b: 0, c: 1 });
      index += Math.max(name.length, 1);
      continue;
    }

    index += 1;
  }

  return total;
}

/** CSS with comments removed: these files DOCUMENT their selectors in prose. */
export const code = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, '');

/** Every rule prelude in the sheet, at-rules descended into and not reported. */
export function ruleSelectors(css: string): string[] {
  const stripped = code(css);
  const preludes: string[] = [];
  let buffer = '';
  for (const character of stripped) {
    if (character === '{') {
      const prelude = buffer.trim();
      buffer = '';
      if (prelude && !prelude.startsWith('@')) preludes.push(prelude);
      continue;
    }
    if (character === '}') {
      buffer = '';
      continue;
    }
    buffer += character;
  }
  return preludes;
}

/** `--ds-*` declarations of a sheet, in source order. */
export function declaredChannels(css: string): { channel: string; value: string }[] {
  return [...code(css).matchAll(/(--[a-z0-9-]+)\s*:\s*([^;}]+)[;}]/g)].map((match) => ({
    channel: match[1],
    value: match[2].trim(),
  }));
}

/**
 * Every declaration block in the sheet as `{ selector, body }`, at-rules
 * descended into. Unlike `ruleSelectors` this keeps the body, which is what a
 * scoped-block scan has to read.
 */
export function ruleBlocks(css: string): { selector: string; body: string }[] {
  const stripped = code(css);
  const blocks: { selector: string; body: string }[] = [];
  let prelude = '';
  let index = 0;
  while (index < stripped.length) {
    const character = stripped[index];
    if (character === '{') {
      const selector = prelude.trim();
      prelude = '';
      if (selector.startsWith('@')) {
        index += 1;
        continue;
      }
      let depth = 1;
      let end = index + 1;
      while (end < stripped.length && depth > 0) {
        if (stripped[end] === '{') depth += 1;
        else if (stripped[end] === '}') depth -= 1;
        end += 1;
      }
      blocks.push({ selector, body: stripped.slice(index + 1, end - 1) });
      index = end;
      continue;
    }
    if (character === '}') {
      prelude = '';
      index += 1;
      continue;
    }
    prelude += character;
    index += 1;
  }
  return blocks;
}
