/**
 * css-parse.mjs — tokenizer/parser for the cascade probe.
 *
 * LAW OBEYED HERE (program law, paid for once already at a cost of 446 lost
 * channels): a line-by-line scanner loses multi-line declarations. Everything
 * below strips comments FIRST and then walks the character stream with
 * balanced braces, balanced parentheses and quote state. A declaration ends at
 * a `;` or `}` seen at paren-depth 0, never at a newline.
 *
 * Comment stripping preserves newlines so every reported line number stays
 * exact against the on-disk file.
 *
 * No dependencies. Pure functions.
 */

/**
 * Replace every /* ... *\/ comment with an equal number of newlines/spaces so
 * byte offsets shift but LINE NUMBERS stay exact.
 */
export function stripComments(text) {
  let out = "";
  let i = 0;
  const n = text.length;
  let quote = null;
  while (i < n) {
    const c = text[i];
    if (quote) {
      out += c;
      if (c === "\\" && i + 1 < n) {
        out += text[i + 1];
        i += 2;
        continue;
      }
      if (c === quote) quote = null;
      i += 1;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      out += c;
      i += 1;
      continue;
    }
    if (c === "/" && text[i + 1] === "*") {
      let j = i + 2;
      while (j < n && !(text[j] === "*" && text[j + 1] === "/")) j += 1;
      const chunk = text.slice(i, Math.min(j + 2, n));
      // keep only the newlines
      out += chunk.replace(/[^\n]/g, "");
      i = Math.min(j + 2, n);
      continue;
    }
    out += c;
    i += 1;
  }
  return out;
}

function lineAt(text, index) {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i += 1) {
    if (text[i] === "\n") line += 1;
  }
  return line;
}

/**
 * Build a prefix table so lineAt is not O(n) per call on large files.
 */
function makeLineIndex(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === "\n") starts.push(i + 1);
  }
  return (index) => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= index) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };
}

/**
 * Parse a stylesheet into a flat list of declarations, each carrying its full
 * context: the selector it sits under and the stack of at-rules above it.
 *
 * Returns { declarations, atRuleStatements, layerStatements, imports }.
 *
 * A declaration is:
 *   { prop, value, line, selector, atStack, file }
 * where `atStack` is an array of { name, prelude } from outermost to innermost.
 * `selector` is null for declarations sitting directly inside an at-rule block
 * that takes declarations (e.g. `@font-face`), which we keep but never treat
 * as cascade input.
 */
export function parseStylesheet(rawText, file = "<inline>") {
  const text = stripComments(rawText);
  const lineOf = makeLineIndex(text);
  const declarations = [];
  const imports = [];
  const layerStatements = [];

  const n = text.length;
  let i = 0;
  let buf = "";
  let bufStart = 0;
  /** @type {Array<{ name: string|null, prelude: string, selector: string|null }>} */
  const stack = [];

  const flushDeclaration = () => {
    const raw = buf.trim();
    buf = "";
    if (!raw) return;
    const colon = findTopLevelColon(raw);
    if (colon < 0) return;
    const prop = raw.slice(0, colon).trim();
    const value = raw.slice(colon + 1).trim();
    if (!prop) return;
    const atStack = stack
      .filter((f) => f.name !== null)
      .map((f) => ({ name: f.name, prelude: f.prelude }));
    const selector = lastSelector(stack);
    declarations.push({
      prop,
      value,
      line: lineOf(bufStart),
      selector,
      atStack,
      file,
    });
  };

  while (i < n) {
    const c = text[i];
    // Anchor the reported line at the first NON-whitespace character of the
    // declaration; otherwise every declaration reports the line of the newline
    // that ended the previous one (off-by-one).
    if (buf.trim() === "") bufStart = i;

    if (c === '"' || c === "'") {
      const q = c;
      let j = i + 1;
      while (j < n) {
        if (text[j] === "\\") {
          j += 2;
          continue;
        }
        if (text[j] === q) break;
        j += 1;
      }
      buf += text.slice(i, Math.min(j + 1, n));
      i = Math.min(j + 1, n);
      continue;
    }

    if (c === "(") {
      // consume a balanced paren run wholesale so `;` inside url()/calc() is safe
      let depth = 0;
      let j = i;
      let q = null;
      while (j < n) {
        const d = text[j];
        if (q) {
          if (d === "\\") {
            j += 2;
            continue;
          }
          if (d === q) q = null;
          j += 1;
          continue;
        }
        if (d === '"' || d === "'") {
          q = d;
          j += 1;
          continue;
        }
        if (d === "(") depth += 1;
        else if (d === ")") {
          depth -= 1;
          if (depth === 0) {
            j += 1;
            break;
          }
        }
        j += 1;
      }
      buf += text.slice(i, j);
      i = j;
      continue;
    }

    if (c === "{") {
      const prelude = buf.trim();
      buf = "";
      if (prelude.startsWith("@")) {
        const sp = prelude.search(/\s/);
        const name = (sp < 0 ? prelude : prelude.slice(0, sp)).slice(1).toLowerCase();
        const rest = sp < 0 ? "" : prelude.slice(sp).trim();
        stack.push({ name, prelude: rest, selector: null });
      } else {
        stack.push({ name: null, prelude: "", selector: prelude });
      }
      i += 1;
      continue;
    }

    if (c === "}") {
      flushDeclaration();
      stack.pop();
      i += 1;
      continue;
    }

    if (c === ";") {
      const raw = buf.trim();
      if (raw.startsWith("@")) {
        buf = "";
        const line = lineOf(bufStart);
        if (/^@import\b/i.test(raw)) imports.push(parseImportRule(raw, line, file));
        else if (/^@layer\b/i.test(raw)) {
          layerStatements.push({
            names: raw
              .slice(6)
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            line,
            file,
          });
        }
      } else {
        flushDeclaration();
      }
      i += 1;
      continue;
    }

    buf += c;
    i += 1;
  }
  flushDeclaration();

  return { declarations, imports, layerStatements };
}

function findTopLevelColon(s) {
  let depth = 0;
  let q = null;
  for (let i = 0; i < s.length; i += 1) {
    const c = s[i];
    if (q) {
      if (c === "\\") {
        i += 1;
        continue;
      }
      if (c === q) q = null;
      continue;
    }
    if (c === '"' || c === "'") {
      q = c;
      continue;
    }
    if (c === "(") depth += 1;
    else if (c === ")") depth -= 1;
    else if (c === ":" && depth === 0) return i;
  }
  return -1;
}

function lastSelector(stack) {
  for (let i = stack.length - 1; i >= 0; i -= 1) {
    if (stack[i].name === null) return stack[i].selector;
  }
  return null;
}

function parseImportRule(raw, line, file) {
  // @import "spec" layer(name) supports(...) media;
  // @import url("spec") layer;
  let spec = null;
  const q = raw.match(/@import\s+(?:url\(\s*)?["']([^"']+)["']/i);
  if (q) spec = q[1];
  else {
    const u = raw.match(/@import\s+url\(\s*([^)"']+?)\s*\)/i);
    if (u) spec = u[1].trim();
  }
  const layerMatch = raw.match(/\blayer\(\s*([^)]*?)\s*\)/i);
  const bareLayer = /\blayer\b(?!\s*\()/i.test(raw);
  return {
    spec,
    layer: layerMatch ? layerMatch[1].trim() : bareLayer ? "" : null,
    raw,
    line,
    file,
  };
}

/**
 * Split a comma-separated argument list at TOP-LEVEL commas only.
 * `var(--a, var(--b, 1px))` -> ["--a", " var(--b, 1px)"]
 */
export function splitTopLevel(s, sep = ",") {
  const out = [];
  let depth = 0;
  let q = null;
  let cur = "";
  for (let i = 0; i < s.length; i += 1) {
    const c = s[i];
    if (q) {
      cur += c;
      if (c === "\\") {
        if (i + 1 < s.length) cur += s[i + 1];
        i += 1;
        continue;
      }
      if (c === q) q = null;
      continue;
    }
    if (c === '"' || c === "'") {
      q = c;
      cur += c;
      continue;
    }
    if (c === "(") depth += 1;
    if (c === ")") depth -= 1;
    if (c === sep && depth === 0) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  out.push(cur);
  return out;
}

/**
 * Enumerate every `var(--name...)` reference in a value, at any nesting depth.
 * Text-wide scan with balanced parens — a `var(` whose name lands on the next
 * physical line is found exactly like one that does not.
 */
export function varReferences(value) {
  const names = [];
  const re = /var\(\s*(--[A-Za-z0-9_-]+)/g;
  let m;
  while ((m = re.exec(value)) !== null) names.push(m[1]);
  return names;
}
