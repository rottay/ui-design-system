// Single source of truth for the inline-paint lexer: the engine-token-audit
// ratchet and the WO-SKIN census must never disagree on what counts as paint.
export const ARC09_PAINT_KEY_RE = new RegExp(
  "^(" +
    [
      "background[A-Za-z]*",
      "border[A-Za-z]*",
      "outline[A-Za-z]*",
      "color",
      "boxShadow",
      "textShadow",
      "fill",
      "stroke",
      "accentColor",
      "filter",
      "backdropFilter",
      "WebkitBackdropFilter",
      "transform",
    ].join("|") +
    ")\\s*:",
);
// border*/table box-model that is layout, not paint.
export const ARC09_PAINT_EXEMPT = new Set(["borderCollapse", "borderSpacing"]);

/**
 * Count inline paint in a TSX source: paint-named object-literal keys AND
 * imperative `el.style.<paint> = …` mutations.
 *
 * Paint does not live only in inline `style={{}}` literals — these engines also
 * assemble it in `const cellStyle = { … }` objects later spread into a style
 * prop, in conditional spreads `...(cond ? { background } : {})`, and in
 * imperative hover writes (`onMouseEnter` sets `el.style.background` directly
 * instead of using a `:hover` rule). The first three are object-literal keys,
 * so this scans keys whose innermost open bracket is an object `{`, which a
 * `style={{}}`-span scanner misses (measured: it saw 4 of Table rustic's ~50
 * consts); the fourth is caught by the `.style.` mutation check below.
 *
 * Two false-positive classes are excluded structurally, not by value regex:
 * (1) strings, template-literal text and comments are skipped, so a `@keyframes`
 * CSS string (`'…transform:rotate…'`, the spinner animation — an exempt residual)
 * and any CSS value with a colon do NOT count; (2) a paint-named key is counted
 * only when the innermost open bracket is `{`, so a function-parameter type
 * annotation like `(filter: FilterDef)` (innermost `(`) does not count — that
 * `filter` is a param name, not paint. `${…}` template expressions are scanned
 * as code.
 */
export function countArc09PaintInFile(text) {
  const n = text.length;
  let count = 0;
  let str = null; // "'" | '"' while inside a plain string
  // Bracket stack: "{" "(" "[" for code brackets, "`" for a template literal,
  // "$" for a ${…} expression (opened by `${`, closed by its matching `}`).
  const stack = [];
  const topIs = (ch) => stack.length > 0 && stack[stack.length - 1] === ch;
  let i = 0;
  while (i < n) {
    const c = text[i];
    const c2 = text[i + 1];
    if (str) {
      if (c === "\\") i += 2;
      else {
        if (c === str) str = null;
        i++;
      }
      continue;
    }
    if (topIs("`")) {
      if (c === "\\") i += 2;
      else if (c === "`") {
        stack.pop();
        i++;
      } else if (c === "$" && c2 === "{") {
        stack.push("$");
        i += 2;
      } else i++;
      continue;
    }
    // code context (stack empty, inside a bracket, or inside a ${…} expression)
    if (c === "/" && c2 === "/") {
      while (i < n && text[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && c2 === "*") {
      i += 2;
      while (i < n && !(text[i] === "*" && text[i + 1] === "/")) i++;
      i += 2;
      continue;
    }
    if (c === "'" || c === '"') {
      str = c;
      i++;
      continue;
    }
    if (c === "`") {
      stack.push("`");
      i++;
      continue;
    }
    if (c === "{" || c === "(" || c === "[") {
      stack.push(c);
      i++;
      continue;
    }
    if (c === "}") {
      if (topIs("{") || topIs("$")) stack.pop();
      i++;
      continue;
    }
    if (c === ")") {
      if (topIs("(")) stack.pop();
      i++;
      continue;
    }
    if (c === "]") {
      if (topIs("[")) stack.pop();
      i++;
      continue;
    }
    // Imperative paint mutation: `el.style.background = …` (the onMouseEnter/Leave
    // hover writes these engines use instead of a `:hover` rule) or
    // `.style.setProperty('background-color', …)`. These are inline paint too —
    // a component can reach 0 object-literal paint keys while still mutating
    // paint imperatively — so the migration must move them to CSS and this must
    // see them. Reads (`const x = el.style.color`) are not counted: the write
    // form requires a following `=`.
    if (c === "." && text.startsWith(".style.", i)) {
      const after = text.slice(i + 7, i + 60);
      const setProp = /^setProperty\(\s*(['"])([a-zA-Z-]+)\1/.exec(after);
      if (setProp) {
        const camel = setProp[2].replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
        if (ARC09_PAINT_KEY_RE.test(camel + ":") && !ARC09_PAINT_EXEMPT.has(camel)) count += 1;
      } else {
        const assign = /^([A-Za-z]+)\s*=(?![=])/.exec(after);
        if (assign && ARC09_PAINT_KEY_RE.test(assign[1] + ":") && !ARC09_PAINT_EXEMPT.has(assign[1]))
          count += 1;
      }
      i += 7;
      continue;
    }
    // a paint key is an object-literal key (innermost bracket is `{`) starting
    // at an identifier boundary.
    if (topIs("{") && /[A-Za-z]/.test(c) && (i === 0 || !/[A-Za-z0-9_$]/.test(text[i - 1]))) {
      const m = ARC09_PAINT_KEY_RE.exec(text.slice(i, i + 48));
      if (m && !ARC09_PAINT_EXEMPT.has(m[1])) count += 1;
    }
    i++;
  }
  return count;
}
