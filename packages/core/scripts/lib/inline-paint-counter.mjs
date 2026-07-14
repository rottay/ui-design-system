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
export const ARC09_PAINT_EXEMPT = new Set([
  "borderCollapse",
  "borderSpacing",
  // Not CSS properties at all -- they are PROP names that the `border*` family
  // pattern happens to match. Counting them invents paint that cannot exist.
  "bordered",
  "borderless",
]);

/**
 * The same paint names in ES6 SHORTHAND position: `style={{ color }}`, or a bare
 * `color,` inside a style object. The colon-anchored regex above cannot see these,
 * so a file could report ZERO inline paint while still painting inline — a gate
 * that certifies a false zero is worse than no gate. Found in the wild at
 * structures/dashboard/stats-header (WO-SKIN-06 CK-A inventory).
 *
 * Deliberately NARROW: only counted inside a `style` object. A bare `{ color }`
 * elsewhere is far more often a DESTRUCTURING pattern (`const { color } = props`)
 * than paint, and counting those would flood the ratchet with false positives.
 */
export const ARC09_PAINT_SHORTHAND_RE = new RegExp(
  ARC09_PAINT_KEY_RE.source.replace(/\\s\*:$/, "") + "\\s*(?=[,}])",
);

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
  // Stack depths at which a TYPE body opened (`interface X {`, `type X = {`).
  // A member named `color`/`background`/`fill` inside one is a type annotation,
  // not paint -- it cannot be migrated to a skin, so counting it would leave the
  // file permanently unable to reach 0. The parameter case (`(filter: FilterDef)`)
  // is already excluded structurally by the innermost-bracket rule; interface and
  // type-alias bodies are not, because their innermost bracket IS `{`.
  const typeBodyDepths = [];
  const inTypeBody = () => typeBodyDepths.length > 0;
  let pendingTypeBody = false;
  // Stack depths at which a STYLE object opened (`style={{ … }}`, `style: { … }`).
  // ES6 shorthand paint (`{ color }`) is only counted inside one -- see
  // ARC09_PAINT_SHORTHAND_RE's doc for why the narrow scope is deliberate.
  const styleObjDepths = [];
  const inStyleObj = () => styleObjDepths.length > 0;
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
    // `interface X {` / `type X = {` open a type body, not an object literal.
    if (/[A-Za-z]/.test(c) && (i === 0 || !/[A-Za-z0-9_$]/.test(text[i - 1]))) {
      // `interface X {` and `type X = {` -- and ONLY those. A bare `type` is an
      // extremely common object KEY (`{ type: 'success' }`); matching it would
      // silence the whole object literal that follows and hide real paint.
      const ahead = text.slice(i, i + 120);
      const kw =
        /^interface\s+[A-Za-z_$]/.test(ahead) ? "interface"
        : /^type\s+[A-Za-z_$][\w$]*\s*(<[^=<>]*>)?\s*=/.test(ahead) ? "type"
        : null;
      if (kw && !inTypeBody()) {
        pendingTypeBody = true;
        i += kw.length;
        continue;
      }
    }
    if (c === "{" || c === "(" || c === "[") {
      if (c === "{" && pendingTypeBody) {
        typeBodyDepths.push(stack.length);
        pendingTypeBody = false;
      }
      if (c === "{") {
        // `const { bordered, backgroundColor } = props` is a DESTRUCTURING PATTERN,
        // not an object literal: its keys are PROP NAMES that merely resemble paint
        // (`bordered` matches the `border*` family). Counting them invents paint that
        // does not exist -- Card rustic reported a phantom site this way.
        const beforeDestr = text.slice(Math.max(0, i - 12), i);
        if (/\b(const|let|var)\s*$/.test(beforeDestr) && !inTypeBody()) {
          typeBodyDepths.push(stack.length);
        }
        // A RETURN-TYPE annotation opens a type body too: `function f(x: T): { color: string }`.
        // Its innermost bracket is `{`, so without this its members read as paint. The
        // `)` -> `:` -> `{` signature is unambiguous; an object literal's `key: {` is
        // never preceded by a closing paren.
        const beforeBrace = text.slice(Math.max(0, i - 40), i);
        if (/\)\s*:\s*$/.test(beforeBrace) && !inTypeBody()) {
          typeBodyDepths.push(stack.length);
        }
        // `style={{`, `style={`, `style: {` -- and any object nested inside one.
        const back = text.slice(Math.max(0, i - 24), i);
        if (/\bstyle\s*(=\s*\{?|:)\s*$/.test(back) || inStyleObj()) {
          styleObjDepths.push(stack.length);
        }
      }
      stack.push(c);
      i++;
      continue;
    }
    if (c === ";" && pendingTypeBody && !inTypeBody()) {
      // `type Alias = string;` -- never opened a body.
      pendingTypeBody = false;
      i++;
      continue;
    }
    if (c === "}") {
      if (topIs("{") || topIs("$")) {
        stack.pop();
        if (typeBodyDepths.length > 0 && typeBodyDepths[typeBodyDepths.length - 1] === stack.length) {
          typeBodyDepths.pop();
        }
        if (styleObjDepths.length > 0 && styleObjDepths[styleObjDepths.length - 1] === stack.length) {
          styleObjDepths.pop();
        }
      }
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
    if (topIs("{") && !inTypeBody() && /[A-Za-z]/.test(c) && (i === 0 || !/[A-Za-z0-9_$]/.test(text[i - 1]))) {
      const ahead = text.slice(i, i + 48);
      // An object KEY is preceded (skipping whitespace) by `{` or `,` and nothing
      // else. Without this guard the `color` in `background: active ? color : x`
      // reads as a second key -- the TERNARY's own colon looks like a key's colon --
      // and the counter inflates. A gate that over-counts sends agents hunting
      // paint that does not exist; it is as useless as one that under-counts.
      let k = i - 1;
      while (k >= 0 && /\s/.test(text[k])) k -= 1;
      const atKeyPosition = k >= 0 && (text[k] === "{" || text[k] === ",");
      const m = atKeyPosition ? ARC09_PAINT_KEY_RE.exec(ahead) : null;
      if (m && !ARC09_PAINT_EXEMPT.has(m[1])) count += 1;
      else if (atKeyPosition && inStyleObj()) {
        const sh = ARC09_PAINT_SHORTHAND_RE.exec(ahead);
        if (sh && !ARC09_PAINT_EXEMPT.has(sh[1])) count += 1;
      }
    }
    i++;
  }
  return count;
}
