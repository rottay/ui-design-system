/**
 * P-88 pass-through census -- the SELECTOR-LIST tokenizer (census v7.1.11). One rule prelude in, its
 * complex selectors out, split on the TOP-LEVEL commas only.
 *
 * v7.1.10 and earlier split a prelude with `prelude.split(',')`. A comma inside a functional
 * pseudo-class argument list belongs to that list, not to the rule's: `.o:is([data-part="p"], .o__p)
 * [data-state="open"]` is ONE selector relating part `p` and state `open`, and the raw split severed
 * it into two fragments that each carry one half, so the census credited the relation zero times.
 *
 * Grouping honoured, every one closing only its own opener:
 *   - parentheses: :is() :where() :not() :has() :nth-child(... of S) and any nesting of them;
 *   - square brackets: attribute selectors;
 *   - strings: '...' and "..." (a comma, bracket or paren inside a quoted value is text);
 *   - escapes: a backslash takes the next code point literally, inside or outside a string
 *     (`.a\,b` is one class; `"a\"b"` does not close the string).
 * A stray closer with no opener is kept as text and never drives the depth negative. An unterminated
 * string or group runs to the end of the prelude (it cannot hide a comma that would otherwise split).
 * Parts are trimmed; an empty part (a leading, doubled or trailing comma) is not a selector and is
 * dropped. No dependency: postcss's `list.comma` (the claims library's idiom) tracks strings,
 * parentheses and escapes but not brackets; this module is pinned whole with the census tool.
 */

const CLOSER = { '(': ')', '[': ']' };

/** @param {string} prelude  a rule prelude, comments already stripped. @returns {string[]} */
export function splitSelectorList(prelude) {
  const out = [];
  const open = []; // the expected closers, innermost last
  let quote = null;
  let escaped = false;
  let cur = '';
  for (const ch of String(prelude)) {
    if (escaped) { escaped = false; cur += ch; continue; }
    if (ch === '\\') { escaped = true; cur += ch; continue; }
    if (quote) { if (ch === quote) quote = null; cur += ch; continue; }
    if (ch === '"' || ch === "'") quote = ch;
    else if (Object.hasOwn(CLOSER, ch)) open.push(CLOSER[ch]);
    else if (open.length && ch === open[open.length - 1]) open.pop();
    else if (ch === ',' && open.length === 0) { out.push(cur); cur = ''; continue; }
    cur += ch;
  }
  out.push(cur);
  return out.map((x) => x.trim()).filter(Boolean);
}
