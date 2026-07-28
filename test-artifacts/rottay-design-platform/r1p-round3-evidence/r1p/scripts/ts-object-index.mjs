/**
 * Index the leaf value spans of an object literal in a TypeScript source file.
 *
 * Hand-editing 49 nested fields is how the wrong field gets set; this walks the
 * literal with a string/comment-aware scanner and returns exact character spans
 * keyed by dotted path, so the writer never pattern-matches on a value.
 */
export function indexObjectLiteral(src, declRegex) {
  const decl = declRegex.exec(src);
  if (!decl) throw new Error(`declaration not found: ${declRegex}`);
  const open = src.indexOf('{', decl.index + decl[0].length - 1);
  if (open < 0) throw new Error('object literal not found');

  const spans = new Map();

  function skipTrivia(i) {
    for (;;) {
      const ch = src[i];
      if (ch === undefined) return i;
      if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') { i += 1; continue; }
      if (ch === '/' && src[i + 1] === '/') { i = src.indexOf('\n', i); if (i < 0) return src.length; continue; }
      if (ch === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i); i = e < 0 ? src.length : e + 2; continue; }
      return i;
    }
  }

  /** Scan one value starting at `i`; returns the index just past it. */
  function scanValue(i) {
    let depth = 0;
    for (;;) {
      const ch = src[i];
      if (ch === undefined) return i;
      if (ch === '/' && src[i + 1] === '/') { i = src.indexOf('\n', i); if (i < 0) return src.length; continue; }
      if (ch === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i); i = e < 0 ? src.length : e + 2; continue; }
      if (ch === "'" || ch === '"' || ch === '`') {
        const quote = ch;
        i += 1;
        while (i < src.length && src[i] !== quote) i += src[i] === '\\' ? 2 : 1;
        i += 1;
        continue;
      }
      if ('{[('.includes(ch)) { depth += 1; i += 1; continue; }
      if ('}])'.includes(ch)) {
        if (depth === 0) return i;
        depth -= 1; i += 1; continue;
      }
      if (ch === ',' && depth === 0) return i;
      i += 1;
    }
  }

  function walkObject(i, prefix) {
    // `i` points just past the opening brace.
    for (;;) {
      i = skipTrivia(i);
      if (src[i] === '}' || src[i] === undefined) return i + 1;
      if (src[i] === ',') { i += 1; continue; }
      if (src.startsWith('...', i)) { i = scanValue(i); continue; }

      let key;
      if (src[i] === "'" || src[i] === '"') {
        const quote = src[i];
        const end = src.indexOf(quote, i + 1);
        key = src.slice(i + 1, end);
        i = end + 1;
      } else {
        const m = /^[A-Za-z_$][\w$]*/.exec(src.slice(i));
        if (!m) { i = scanValue(i); continue; }
        key = m[0];
        i += m[0].length;
      }
      i = skipTrivia(i);
      if (src[i] !== ':') { i = scanValue(i); continue; }
      i = skipTrivia(i + 1);

      const path = prefix ? `${prefix}.${key}` : key;
      if (src[i] === '{') {
        i = walkObject(i + 1, path);
      } else {
        const start = i;
        const end = scanValue(i);
        spans.set(path, { start, end, text: src.slice(start, end).trim() });
        i = end;
      }
    }
  }

  walkObject(open + 1, '');
  return spans;
}
