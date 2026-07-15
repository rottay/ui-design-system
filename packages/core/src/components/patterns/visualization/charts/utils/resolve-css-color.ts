/**
 * A chart-owned element whose inherited custom properties define chart paint.
 *
 * Keeping the owner explicit is what lets two provider roots render different
 * tenants in the same document without consulting global document state.
 */
export type ChartColorOwner = HTMLElement | SVGElement;

const MAX_RESOLUTION_DEPTH = 16;

function hasCssVariable(value: string): boolean {
  return value.includes('var(');
}

function splitVariableExpression(expression: string): {
  name: string;
  fallback: string | undefined;
} | null {
  let parenthesisDepth = 0;

  for (let index = 0; index < expression.length; index += 1) {
    const character = expression.at(index);

    if (character === '(') {
      parenthesisDepth += 1;
      continue;
    }

    if (character === ')') {
      parenthesisDepth -= 1;
      continue;
    }

    if (character === ',' && parenthesisDepth === 0) {
      const name = expression.slice(0, index).trim();
      if (!/^--[a-zA-Z0-9_-]+$/.test(name)) return null;

      return {
        name,
        fallback: expression.slice(index + 1).trim(),
      };
    }
  }

  const name = expression.trim();
  if (!/^--[a-zA-Z0-9_-]+$/.test(name)) return null;

  return { name, fallback: undefined };
}

function findClosingParenthesis(value: string, openingIndex: number): number {
  let depth = 0;

  for (let index = openingIndex; index < value.length; index += 1) {
    const character = value.at(index);
    if (character === '(') depth += 1;
    if (character === ')') depth -= 1;
    if (depth === 0) return index;
  }

  return -1;
}

function readCustomProperty(owner: ChartColorOwner, name: string): string {
  if (
    typeof window === 'undefined' ||
    typeof window.getComputedStyle !== 'function'
  ) {
    return '';
  }

  try {
    // The chart element is deliberately the lookup root. Custom properties
    // inherit through its own provider chain, so sibling tenant roots cannot
    // leak paint into one another.
    return window.getComputedStyle(owner).getPropertyValue(name).trim();
  } catch {
    return '';
  }
}

interface CssColorResolution {
  value: string;
  valid: boolean;
}

function resolveExpression(
  value: string,
  owner: ChartColorOwner | null | undefined,
  seen: ReadonlySet<string>,
  depth: number,
): CssColorResolution {
  const source = value.trim();
  if (!hasCssVariable(source)) return { value: source, valid: true };
  if (depth >= MAX_RESOLUTION_DEPTH) return { value: '', valid: false };

  let result = source;
  let searchFrom = 0;

  while (searchFrom < result.length) {
    const variableIndex = result.indexOf('var(', searchFrom);
    if (variableIndex < 0) break;

    const openingIndex = variableIndex + 3;
    const closingIndex = findClosingParenthesis(result, openingIndex);
    if (closingIndex < 0) return { value: '', valid: false };

    const parsed = splitVariableExpression(
      result.slice(openingIndex + 1, closingIndex),
    );
    if (!parsed) return { value: '', valid: false };

    const nextSeen = new Set(seen);
    let replacement: CssColorResolution = { value: '', valid: false };

    if (owner && !seen.has(parsed.name)) {
      nextSeen.add(parsed.name);
      const customProperty = readCustomProperty(owner, parsed.name);
      if (customProperty) {
        replacement = resolveExpression(
          customProperty,
          owner,
          nextSeen,
          depth + 1,
        );
      }
    }

    if (!replacement.valid && parsed.fallback !== undefined) {
      replacement = resolveExpression(
        parsed.fallback,
        owner,
        nextSeen,
        depth + 1,
      );
    }

    // A missing/cyclic variable without its own fallback invalidates the whole
    // CSS value. Do not manufacture strings such as `rgb( / .5)` and mistake
    // them for successfully resolved colors.
    if (!replacement.valid) return { value: '', valid: false };

    result = `${result.slice(0, variableIndex)}${replacement.value}${result.slice(closingIndex + 1)}`;
    searchFrom = variableIndex + replacement.value.length;
  }

  return hasCssVariable(result)
    ? { value: '', valid: false }
    : { value: result.trim(), valid: true };
}

/**
 * Resolves CSS custom-property references relative to a chart-owned element.
 *
 * Concrete colors pass through unchanged. `var()` expressions, including
 * nested fallbacks, are read from `owner` rather than from a document-global
 * root. In SSR, with no owner, on a cycle, or when a variable is absent, the
 * explicit concrete fallback is returned (or an empty string when omitted).
 */
export function resolveCssColor(
  value: string,
  owner: ChartColorOwner | null | undefined,
  fallback = '',
): string {
  const resolved = resolveExpression(value, owner, new Set<string>(), 0);
  if (resolved.valid && resolved.value) return resolved.value;

  const resolvedFallback = resolveExpression(
    fallback,
    owner,
    new Set<string>(),
    0,
  );

  return resolvedFallback.valid &&
    resolvedFallback.value &&
    !hasCssVariable(resolvedFallback.value)
    ? resolvedFallback.value
    : '';
}
