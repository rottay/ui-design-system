/**
 * @fileoverview Link-destination sanitizer -- the security core of MarkdownView.
 *
 * A raw markdown link destination is untrusted. Before it can become an `href`
 * attribute, it must be reduced to the exact string a browser would resolve and
 * checked against a scheme allowlist. This module does that reduction as a pure
 * function so it can be exhaustively unit-tested against a hostile corpus,
 * independent of React.
 *
 * The reduction mirrors what a browser does before scheme resolution:
 *   1. Decode HTML character references (`&#x6a;` -> `j`, `&colon;` -> `:`),
 *      because a browser decodes entity-encoded hrefs before navigating.
 *   2. Strip C0 control characters and DEL anywhere, and trim surrounding
 *      whitespace -- browsers ignore embedded tabs/newlines when detecting the
 *      scheme (`java\tscript:` is `javascript:`).
 *   3. Extract the leading scheme and match it, case-insensitively, against the
 *      allowlist.
 *
 * Anything that resolves to a non-allowlisted scheme -- `javascript:`, `data:`,
 * `vbscript:`, `file:`, ... -- is rejected (returns `null`), and the caller
 * renders the link's label as inert text. Relative and fragment destinations
 * are allowed; protocol-relative `//host` destinations are rejected for safety.
 */

import type { MarkdownLinkScheme } from '../../contracts';

const DEFAULT_ALLOW: readonly MarkdownLinkScheme[] = ['http', 'https', 'mailto'];

/** Named references that could smuggle scheme-significant characters. */
const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  colon: ':',
  sol: '/',
  tab: '\t',
  newline: '\n',
  lpar: '(',
  rpar: ')',
};

/** Decode numeric and a bounded named set of HTML character references. */
function decodeEntities(input: string): string {
  return input.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, body: string) => {
    if (body[0] === '#') {
      const isHex = body[1] === 'x' || body[1] === 'X';
      const codePoint = Number.parseInt(body.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      if (Number.isFinite(codePoint) && codePoint > 0 && codePoint <= 0x10ffff) {
        try {
          return String.fromCodePoint(codePoint);
        } catch {
          return match;
        }
      }
      return match;
    }
    const named = NAMED_ENTITIES[body.toLowerCase()];
    return named ?? match;
  });
}

/** Reduce a raw destination to the string a browser would resolve. */
function reduce(raw: string): string {
  // Decode twice so an entity-encoded entity (`&amp;#x6a;`) cannot survive.
  let decoded = decodeEntities(raw);
  decoded = decodeEntities(decoded);
  // Strip C0 controls (U+0000-U+001F) and DEL (U+007F) anywhere; browsers
  // ignore them when detecting the scheme.
  // eslint-disable-next-line no-control-regex
  const stripped = decoded.replace(/[\u0000-\u001f\u007f]/g, '');
  return stripped.trim();
}

const SCHEME_RE = /^([a-z][a-z0-9+.-]*):/i;

/**
 * Sanitize a markdown link destination against a scheme allowlist.
 *
 * @param raw - The verbatim destination captured by the parser.
 * @param allow - Allowed schemes; defaults to http/https/mailto.
 * @returns A safe href string to place in the DOM, or `null` when the
 *   destination must be downgraded to plain text.
 */
export function sanitizeHref(
  raw: string,
  allow: readonly MarkdownLinkScheme[] = DEFAULT_ALLOW,
): string | null {
  if (typeof raw !== 'string') return null;
  const reduced = reduce(raw);
  if (reduced === '') return null;

  const schemeMatch = SCHEME_RE.exec(reduced);
  if (schemeMatch) {
    const scheme = schemeMatch[1].toLowerCase();
    return (allow as readonly string[]).includes(scheme) ? reduced : null;
  }

  // No scheme. Protocol-relative destinations are rejected; other relative
  // references (path, query, fragment) are allowed as-is.
  if (reduced.startsWith('//')) {
    return null;
  }
  return reduced;
}
