/**
 * @fileoverview Structural selector projection for first-party vertical CSS.
 *
 * Generated first-party artifacts must support two equivalent static scopes:
 *
 * 1. the legacy document root (`html[data-tenant='<slug>']`), and
 * 2. a provider root (`[data-ds-root][data-vertical='<vertical>']`).
 *
 * This module deliberately has no PostCSS/runtime dependency. It scans CSS
 * rule preludes (never declaration values) and tokenizes the one compound it
 * owns. Comments, strings, generic tenant selectors, and other tenants are
 * preserved byte-for-byte.
 */

const STATIC_SCOPE_KEY_PATTERN = /^[a-z][a-z0-9-]*$/;

interface OwnedSelectorMatch {
  end: number;
  source: string;
}

function assertStaticScopeKey(value: string, label: string): void {
  if (!STATIC_SCOPE_KEY_PATTERN.test(value)) {
    throw new Error(`${label} must be a lowercase CSS-safe key; received ${JSON.stringify(value)}`);
  }
}

function isCssWhitespace(char: string | undefined): boolean {
  return char === ' ' || char === '\n' || char === '\r' || char === '\t' || char === '\f';
}

function isTypeSelectorBoundary(char: string | undefined): boolean {
  return char === undefined || isCssWhitespace(char) || char === ',' || char === '>' || char === '+' || char === '~' || char === '(';
}

function skipComment(source: string, start: number): number {
  const close = source.indexOf('*/', start + 2);
  return close === -1 ? source.length : close + 2;
}

function skipString(source: string, start: number): number {
  const quote = source[start];
  let cursor = start + 1;

  while (cursor < source.length) {
    if (source[cursor] === '\\') {
      cursor += 2;
      continue;
    }
    if (source[cursor] === quote) return cursor + 1;
    cursor += 1;
  }

  return source.length;
}

function skipAttributeTrivia(source: string, start: number): number {
  let cursor = start;
  while (cursor < source.length) {
    if (isCssWhitespace(source[cursor])) {
      cursor += 1;
      continue;
    }
    if (source[cursor] === '/' && source[cursor + 1] === '*') {
      cursor = skipComment(source, cursor);
      continue;
    }
    break;
  }
  return cursor;
}

/**
 * Parse exactly `html[data-tenant='<tenantSlug>']` at `start`.
 *
 * Whitespace and comments inside the attribute selector are valid CSS and are
 * accepted. The type selector and attribute must remain one compound (no
 * whitespace between `html` and `[`), and flags/operators other than exact `=`
 * are rejected. The original bytes are retained as the legacy `:is()` arm.
 */
function matchOwnedTenantSelector(
  selector: string,
  start: number,
  tenantSlug: string,
): OwnedSelectorMatch | undefined {
  if (!isTypeSelectorBoundary(selector[start - 1])) return undefined;
  if (!selector.startsWith('html[', start)) return undefined;

  let cursor = skipAttributeTrivia(selector, start + 'html['.length);
  if (!selector.startsWith('data-tenant', cursor)) return undefined;
  cursor += 'data-tenant'.length;

  // Prevent a longer attribute name such as data-tenant-id from matching.
  const afterName = selector[cursor];
  if (!isCssWhitespace(afterName) && afterName !== '=' && !(afterName === '/' && selector[cursor + 1] === '*')) {
    return undefined;
  }

  cursor = skipAttributeTrivia(selector, cursor);
  if (selector[cursor] !== '=') return undefined;
  cursor = skipAttributeTrivia(selector, cursor + 1);

  let attributeValue = '';
  const quote = selector[cursor];
  if (quote === "'" || quote === '"') {
    const valueStart = cursor + 1;
    const valueEnd = skipString(selector, cursor) - 1;
    if (valueEnd < valueStart || selector[valueEnd] !== quote) return undefined;
    attributeValue = selector.slice(valueStart, valueEnd);
    cursor = valueEnd + 1;
  } else {
    const valueStart = cursor;
    while (
      cursor < selector.length
      && !isCssWhitespace(selector[cursor])
      && selector[cursor] !== ']'
      && !(selector[cursor] === '/' && selector[cursor + 1] === '*')
    ) {
      cursor += 1;
    }
    attributeValue = selector.slice(valueStart, cursor);
  }

  if (attributeValue !== tenantSlug) return undefined;
  cursor = skipAttributeTrivia(selector, cursor);
  if (selector[cursor] !== ']') return undefined;

  const end = cursor + 1;
  return {
    end,
    source: selector.slice(start, end),
  };
}

function projectSelectorPrelude(
  prelude: string,
  tenantSlug: string,
  verticalKey: string,
): string {
  const providerRoot = `:where([data-ds-root][data-vertical='${verticalKey}'])`;
  const chunks: string[] = [];
  let copyFrom = 0;
  let cursor = 0;

  while (cursor < prelude.length) {
    if (prelude[cursor] === '/' && prelude[cursor + 1] === '*') {
      cursor = skipComment(prelude, cursor);
      continue;
    }
    if (prelude[cursor] === "'" || prelude[cursor] === '"') {
      cursor = skipString(prelude, cursor);
      continue;
    }

    const match = prelude[cursor] === 'h'
      ? matchOwnedTenantSelector(prelude, cursor, tenantSlug)
      : undefined;

    if (!match) {
      cursor += 1;
      continue;
    }

    chunks.push(prelude.slice(copyFrom, cursor));
    chunks.push(`:is(${match.source}, ${providerRoot})`);
    cursor = match.end;
    copyFrom = cursor;
  }

  if (chunks.length === 0) return prelude;
  chunks.push(prelude.slice(copyFrom));
  return chunks.join('');
}

function firstSignificantCharacter(source: string): string | undefined {
  let cursor = 0;
  while (cursor < source.length) {
    if (isCssWhitespace(source[cursor])) {
      cursor += 1;
      continue;
    }
    if (source[cursor] === '/' && source[cursor + 1] === '*') {
      cursor = skipComment(source, cursor);
      continue;
    }
    return source[cursor];
  }
  return undefined;
}

/**
 * Project every rule owned by one first-party tenant into the vertical root.
 *
 * The provider branch is wrapped in `:where()` and paired with the untouched
 * legacy selector through `:is()`. Consequently `:is()` takes its specificity
 * from the legacy arm, so existing cascade behavior remains unchanged while a
 * matching provider root receives the same vertical baseline directly.
 */
export function projectFirstPartyArtifactScopes(
  css: string,
  tenantSlug: string,
  verticalKey: string,
): string {
  assertStaticScopeKey(tenantSlug, 'tenantSlug');
  assertStaticScopeKey(verticalKey, 'verticalKey');

  const chunks: string[] = [];
  let copyFrom = 0;
  let statementStart = 0;
  let cursor = 0;
  let parenthesesDepth = 0;
  let bracketsDepth = 0;

  while (cursor < css.length) {
    const char = css[cursor];

    if (char === '/' && css[cursor + 1] === '*') {
      cursor = skipComment(css, cursor);
      continue;
    }
    if (char === "'" || char === '"') {
      cursor = skipString(css, cursor);
      continue;
    }
    if (char === '(') {
      parenthesesDepth += 1;
      cursor += 1;
      continue;
    }
    if (char === ')' && parenthesesDepth > 0) {
      parenthesesDepth -= 1;
      cursor += 1;
      continue;
    }
    if (char === '[') {
      bracketsDepth += 1;
      cursor += 1;
      continue;
    }
    if (char === ']' && bracketsDepth > 0) {
      bracketsDepth -= 1;
      cursor += 1;
      continue;
    }

    if (parenthesesDepth === 0 && bracketsDepth === 0 && char === '{') {
      const prelude = css.slice(statementStart, cursor);
      // At-rule preludes (`@media`, `@supports`, `@keyframes`, ...) own a
      // block but are not selector lists. Rules nested inside them are visited
      // normally because statementStart advances beyond this opening brace.
      if (firstSignificantCharacter(prelude) !== '@') {
        const projected = projectSelectorPrelude(prelude, tenantSlug, verticalKey);
        if (projected !== prelude) {
          chunks.push(css.slice(copyFrom, statementStart), projected);
          copyFrom = cursor;
        }
      }
      statementStart = cursor + 1;
    } else if (parenthesesDepth === 0 && bracketsDepth === 0 && (char === '}' || char === ';')) {
      statementStart = cursor + 1;
    }

    cursor += 1;
  }

  if (chunks.length === 0) return css;
  chunks.push(css.slice(copyFrom));
  return chunks.join('');
}
