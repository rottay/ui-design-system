/**
 * value-eval.mjs — typed CSS value evaluator for the cascade probe (leg 1).
 *
 * Two stages, in the order the CSS spec uses them:
 *   1. TEXTUAL var() substitution (`expandVars`). A custom property is
 *      substituted by its declared token stream. The fallback of `var(--a, F)`
 *      is used ONLY when `--a` resolves to the guaranteed-invalid value, i.e.
 *      when it is undeclared or is part of a dependency cycle. This is the
 *      trap the program already stepped into: a DECLARED channel never uses
 *      the fallback, so `var(--ds-font-size-md, 0.875rem)` is 1rem, not
 *      0.875rem.
 *   2. TYPED arithmetic (`evaluate`). calc()/min()/max()/clamp() are folded to
 *      a typed quantity. The type is carried, never erased: `1.5` (number) and
 *      `1.5rem` (length) are DIFFERENT and comparing them is a failure, not a
 *      match.
 *
 * Cycles: per CSS Variables §3 a custom property in a cycle computes to the
 * guaranteed-invalid value. Verified against Chromium 1228 on 2026-08-18:
 * `--a: var(--b); --b: var(--a)` makes getPropertyValue('--a') === '' while
 * the declaration is present, and `var(--a, 7px)` then DOES take the fallback.
 * This module reproduces exactly that, and records the cycle so the caller can
 * report it rather than silently swallowing it as a fallback.
 */
import { splitTopLevel } from "./css-parse.mjs";

export const GUARANTEED_INVALID = Symbol("guaranteed-invalid");

/** Length units this evaluator converts. `em`/`ex`/`ch` are context-dependent
 *  and deliberately NOT guessed — they surface as `unresolved`. */
const ABSOLUTE_PX = {
  px: 1,
  in: 96,
  pc: 16,
  pt: 96 / 72,
  cm: 96 / 2.54,
  mm: 96 / 25.4,
  q: 96 / 101.6,
};
const CONTEXT_UNITS = new Set([
  "em",
  "ex",
  "ch",
  "lh",
  "cap",
  "ic",
  "rlh",
  "vw",
  "vh",
  "vmin",
  "vmax",
  "cqw",
  "cqh",
  "cqi",
  "cqb",
  "cqmin",
  "cqmax",
]);

/**
 * Typed quantity constructors. `kind` is the CSS TYPE and it is the first
 * thing compared; two values of different kinds never match.
 */
export const Q = {
  number: (n) => ({ kind: "number", n }),
  length: (px, unit) => ({ kind: "length", px, unit }),
  percent: (n) => ({ kind: "percent", n }),
  time: (ms) => ({ kind: "time", ms }),
  angle: (deg) => ({ kind: "angle", deg }),
  keyword: (text) => ({ kind: "keyword", text: text.trim() }),
  unresolved: (reason, raw) => ({ kind: "unresolved", reason, raw }),
  invalid: (reason) => ({ kind: "invalid", reason }),
};

/**
 * Textual var() substitution.
 *
 * @param {string} value raw declaration value
 * @param {Map<string,string>} env  channel -> raw declared value
 * @param {object} [state] carries `cycles` (Set of channel names) and the
 *        active resolution `stack` across the recursion
 * @returns {{ text: string|typeof GUARANTEED_INVALID, cycles: string[], undeclared: string[], chain: string[] }}
 */
export function expandVars(value, env, state = {}) {
  const cycles = state.cycles instanceof Set ? state.cycles : new Set();
  const undeclared =
    state.undeclared instanceof Set ? state.undeclared : new Set();
  const chain = state.chain instanceof Set ? state.chain : new Set();
  const stack = state.stack || [];
  const text = substitute(value, env, stack, cycles, undeclared, chain);
  return {
    text,
    cycles: [...cycles],
    undeclared: [...undeclared],
    chain: [...chain],
  };
}

function substitute(value, env, stack, cycles, undeclared, chain) {
  let out = "";
  let i = 0;
  const n = value.length;
  while (i < n) {
    const idx = value.indexOf("var(", i);
    if (idx < 0) {
      out += value.slice(i);
      break;
    }
    // guard against matching inside an identifier like `--my-var(`
    const prev = idx > 0 ? value[idx - 1] : "";
    if (/[A-Za-z0-9_-]/.test(prev)) {
      out += value.slice(i, idx + 4);
      i = idx + 4;
      continue;
    }
    out += value.slice(i, idx);
    const close = matchParen(value, idx + 3);
    if (close < 0) {
      // unbalanced — surface the raw tail rather than inventing a value
      out += value.slice(idx);
      break;
    }
    const inner = value.slice(idx + 4, close);
    const parts = splitTopLevel(inner, ",");
    const name = parts[0].trim();
    const fallback = parts.length > 1 ? parts.slice(1).join(",") : null;

    const resolved = resolveChannel(name, env, stack, cycles, undeclared, chain);
    if (resolved === GUARANTEED_INVALID) {
      if (fallback === null) return GUARANTEED_INVALID;
      const fb = substitute(fallback, env, stack, cycles, undeclared, chain);
      if (fb === GUARANTEED_INVALID) return GUARANTEED_INVALID;
      out += fb;
    } else {
      out += resolved;
    }
    i = close + 1;
  }
  return out;
}

function resolveChannel(name, env, stack, cycles, undeclared, chain) {
  if (!env.has(name)) {
    undeclared.add(name);
    return GUARANTEED_INVALID;
  }
  if (stack.includes(name)) {
    // every property on the cycle computes to guaranteed-invalid
    const start = stack.indexOf(name);
    for (const m of stack.slice(start)) cycles.add(m);
    cycles.add(name);
    return GUARANTEED_INVALID;
  }
  chain.add(name);
  stack.push(name);
  const result = substitute(env.get(name), env, stack, cycles, undeclared, chain);
  stack.pop();
  if (result === GUARANTEED_INVALID) {
    cycles.add(name);
    return GUARANTEED_INVALID;
  }
  return result;
}

function matchParen(s, openIdx) {
  let depth = 0;
  let q = null;
  for (let i = openIdx; i < s.length; i += 1) {
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
    else if (c === ")") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/* ---------------------------------------------------------------------- */
/* Typed arithmetic                                                        */
/* ---------------------------------------------------------------------- */

/**
 * Evaluate a var-free value string to a typed quantity.
 * @param {string} text
 * @param {{ rootFontSizePx?: number }} [opts]
 */
export function evaluate(text, opts = {}) {
  const raw = String(text).trim();
  if (raw === "") return Q.invalid("empty");
  const one = evaluateSingle(raw, opts);
  if (one.kind !== "keyword") return one;
  // SHORTHAND LISTS. `padding: 8px 16px` and `margin: 0.25rem 0 0` are not one
  // quantity, they are a positional LIST of them. Evaluating the whole string
  // as one expression makes it fall through to the keyword branch, and then a
  // text comparison decides rest-equivalence — which is exactly the failure
  // this probe exists to prevent: `8px 16px` vs `calc(0.5rem * 1) 16px` are
  // the same paint and would be reported as a shift. So split at TOP-LEVEL
  // whitespace and evaluate each component on its own; the list is equal only
  // when it has the same arity and every component matches by type and value.
  const parts = splitTopLevelWhitespace(raw);
  if (parts.length < 2) return one;
  const items = parts.map((p) => evaluateSingle(p, opts));
  if (items.every((v) => v.kind === "keyword" && v.text === raw)) return one;
  return { kind: "list", items, text: raw };
}

function evaluateSingle(raw, opts = {}) {
  const rootPx = opts.rootFontSizePx ?? 16;
  try {
    const toks = tokenize(raw);
    const p = new Parser(toks, rootPx);
    const v = p.parseSum(false);
    if (!p.atEnd()) return Q.keyword(raw);
    return v;
  } catch (err) {
    if (err && err.__typed) return err.value;
    return Q.keyword(raw);
  }
}

/** Split at whitespace that is outside parens, brackets and quotes. */
export function splitTopLevelWhitespace(s) {
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
    if (c === "(" || c === "[") depth += 1;
    if (c === ")" || c === "]") depth -= 1;
    if (/\s/.test(c) && depth === 0) {
      if (cur.trim()) out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += c;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function tokenize(s) {
  const toks = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) {
      i += 1;
      continue;
    }
    if ("()+-*/,".includes(c)) {
      toks.push({ t: c });
      i += 1;
      continue;
    }
    const num = /^[0-9]*\.?[0-9]+(?:[eE][+-]?[0-9]+)?/.exec(s.slice(i));
    if (num) {
      i += num[0].length;
      const unitM = /^[A-Za-z%]+/.exec(s.slice(i));
      const unit = unitM ? unitM[0].toLowerCase() : "";
      i += unitM ? unitM[0].length : 0;
      toks.push({ t: "num", n: Number(num[0]), unit });
      continue;
    }
    const ident = /^[A-Za-z_][A-Za-z0-9_-]*/.exec(s.slice(i));
    if (ident) {
      toks.push({ t: "ident", v: ident[0].toLowerCase() });
      i += ident[0].length;
      continue;
    }
    toks.push({ t: "other", v: c });
    i += 1;
  }
  return toks;
}

function bail(value) {
  const e = new Error(value.reason || value.kind);
  e.__typed = true;
  e.value = value;
  throw e;
}

class Parser {
  constructor(toks, rootPx) {
    this.toks = toks;
    this.i = 0;
    this.rootPx = rootPx;
  }
  peek() {
    return this.toks[this.i];
  }
  next() {
    return this.toks[this.i++];
  }
  atEnd() {
    return this.i >= this.toks.length;
  }
  expect(t) {
    const tok = this.next();
    if (!tok || tok.t !== t) bail(Q.keyword("parse"));
    return tok;
  }
  parseSum(inMath) {
    let left = this.parseProduct(inMath);
    for (;;) {
      const tok = this.peek();
      if (!tok || (tok.t !== "+" && tok.t !== "-")) break;
      this.next();
      const right = this.parseProduct(inMath);
      left = addSub(left, right, tok.t);
    }
    return left;
  }
  parseProduct(inMath) {
    let left = this.parseUnary(inMath);
    for (;;) {
      const tok = this.peek();
      if (!tok || (tok.t !== "*" && tok.t !== "/")) break;
      this.next();
      const right = this.parseUnary(inMath);
      left = tok.t === "*" ? mul(left, right) : div(left, right);
    }
    return left;
  }
  parseUnary(inMath) {
    const tok = this.peek();
    if (tok && (tok.t === "+" || tok.t === "-")) {
      this.next();
      const v = this.parseUnary(inMath);
      return tok.t === "-" ? negate(v) : v;
    }
    return this.parseAtom(inMath);
  }
  parseAtom(inMath) {
    const tok = this.next();
    if (!tok) bail(Q.keyword("eof"));
    if (tok.t === "(") {
      const v = this.parseSum(inMath);
      this.expect(")");
      return v;
    }
    if (tok.t === "num") return quantity(tok.n, tok.unit, this.rootPx);
    if (tok.t === "ident") {
      const nxt = this.peek();
      if (nxt && nxt.t === "(") {
        this.next();
        const args = [this.parseSum(true)];
        while (this.peek() && this.peek().t === ",") {
          this.next();
          args.push(this.parseSum(true));
        }
        this.expect(")");
        return applyFunction(tok.v, args);
      }
      if (tok.v === "infinity") return Q.number(Infinity);
      bail(Q.keyword(tok.v));
    }
    bail(Q.keyword("token"));
    return null;
  }
}

function quantity(n, unit, rootPx) {
  if (unit === "") return Q.number(n);
  if (unit === "%") return Q.percent(n);
  if (unit === "rem") return Q.length(n * rootPx, "rem");
  if (unit in ABSOLUTE_PX) return Q.length(n * ABSOLUTE_PX[unit], unit);
  if (unit === "s") return Q.time(n * 1000);
  if (unit === "ms") return Q.time(n);
  if (unit === "deg") return Q.angle(n);
  if (CONTEXT_UNITS.has(unit))
    bail(Q.unresolved(`context-dependent unit '${unit}'`, `${n}${unit}`));
  bail(Q.keyword(`${n}${unit}`));
  return null;
}

function scalarOf(v) {
  if (v.kind === "number") return v.n;
  if (v.kind === "length") return v.px;
  if (v.kind === "percent") return v.n;
  if (v.kind === "time") return v.ms;
  if (v.kind === "angle") return v.deg;
  return null;
}
function rebuild(kind, scalar, unitHint) {
  if (kind === "number") return Q.number(scalar);
  if (kind === "length") return Q.length(scalar, unitHint || "px");
  if (kind === "percent") return Q.percent(scalar);
  if (kind === "time") return Q.time(scalar);
  if (kind === "angle") return Q.angle(scalar);
  return Q.invalid(kind);
}

function addSub(a, b, op) {
  guardNumeric(a);
  guardNumeric(b);
  if (a.kind !== b.kind)
    bail(
      Q.invalid(
        `type mismatch in '${op}': ${describeType(a)} vs ${describeType(b)}`,
      ),
    );
  const s = op === "+" ? scalarOf(a) + scalarOf(b) : scalarOf(a) - scalarOf(b);
  return rebuild(a.kind, s, a.unit || b.unit);
}
function mul(a, b) {
  guardNumeric(a);
  guardNumeric(b);
  if (a.kind !== "number" && b.kind !== "number")
    bail(
      Q.invalid(
        `type mismatch in '*': ${describeType(a)} * ${describeType(b)}`,
      ),
    );
  if (a.kind === "number" && b.kind === "number")
    return Q.number(a.n * b.n);
  const dim = a.kind === "number" ? b : a;
  const factor = a.kind === "number" ? a.n : b.n;
  return rebuild(dim.kind, scalarOf(dim) * factor, dim.unit);
}
function div(a, b) {
  guardNumeric(a);
  guardNumeric(b);
  if (b.kind !== "number") {
    if (a.kind === b.kind) return Q.number(scalarOf(a) / scalarOf(b));
    bail(
      Q.invalid(
        `type mismatch in '/': ${describeType(a)} / ${describeType(b)}`,
      ),
    );
  }
  return rebuild(a.kind, scalarOf(a) / b.n, a.unit);
}
function negate(a) {
  guardNumeric(a);
  return rebuild(a.kind, -scalarOf(a), a.unit);
}
function guardNumeric(v) {
  if (
    v.kind !== "number" &&
    v.kind !== "length" &&
    v.kind !== "percent" &&
    v.kind !== "time" &&
    v.kind !== "angle"
  )
    bail(v.kind === "unresolved" ? v : Q.invalid(`non-numeric ${v.kind}`));
}

function applyFunction(name, args) {
  if (name === "calc") return args[0];
  if (name === "min" || name === "max") {
    args.forEach(guardNumeric);
    const kinds = new Set(args.map((a) => a.kind));
    if (kinds.size > 1)
      bail(
        Q.invalid(
          `type mismatch in ${name}(): ${args.map(describeType).join(", ")}`,
        ),
      );
    const scalars = args.map(scalarOf);
    const s = name === "min" ? Math.min(...scalars) : Math.max(...scalars);
    return rebuild(args[0].kind, s, args.find((a) => a.unit)?.unit);
  }
  if (name === "clamp") {
    if (args.length !== 3) bail(Q.invalid("clamp() arity"));
    args.forEach(guardNumeric);
    const kinds = new Set(args.map((a) => a.kind));
    if (kinds.size > 1)
      bail(
        Q.invalid(
          `type mismatch in clamp(): ${args.map(describeType).join(", ")}`,
        ),
      );
    const [lo, mid, hi] = args.map(scalarOf);
    return rebuild(
      args[1].kind,
      Math.max(lo, Math.min(mid, hi)),
      args.find((a) => a.unit)?.unit,
    );
  }
  bail(Q.unresolved(`unsupported function ${name}()`, name));
  return null;
}

export function describeType(v) {
  if (!v) return "none";
  if (v.kind === "length") return `length(${v.unit || "px"})`;
  if (v.kind === "number") return "number(unitless)";
  if (v.kind === "percent") return "percentage";
  if (v.kind === "time") return "time";
  if (v.kind === "angle") return "angle";
  if (v.kind === "list") return `list[${v.items.map(describeType).join(" ")}]`;
  if (v.kind === "keyword") return `keyword(${v.text})`;
  if (v.kind === "unresolved") return `unresolved(${v.reason})`;
  return `invalid(${v.reason})`;
}

export function formatValue(v) {
  if (!v) return "<none>";
  switch (v.kind) {
    case "number":
      return `${round(v.n)}`;
    case "length":
      return `${round(v.px)}px`;
    case "percent":
      return `${round(v.n)}%`;
    case "time":
      return `${round(v.ms)}ms`;
    case "angle":
      return `${round(v.deg)}deg`;
    case "list":
      return v.items.map(formatValue).join(" ");
    case "keyword":
      return v.text;
    case "unresolved":
      return `<unresolved: ${v.reason}>`;
    default:
      return `<invalid: ${v.reason}>`;
  }
}
function round(n) {
  if (!Number.isFinite(n)) return String(n);
  return Math.abs(n - Math.round(n)) < 1e-9
    ? String(Math.round(n))
    : String(Number(n.toFixed(6)));
}

/**
 * Comparison used for rest-equivalence.
 *
 * TYPE FIRST. A number and a length never match, even when the bare digits are
 * identical: `line-height: 1.5` renders 21px on 14px text while `1.5rem`
 * renders 24px. The returned reason names both units so the report can say
 * WHICH unit pair broke it.
 */
export function sameValue(a, b) {
  if (!a || !b) return { equal: false, reason: "missing side" };
  if (a.kind !== b.kind)
    return {
      equal: false,
      reason: `CSS type differs: ${describeType(a)} vs ${describeType(b)}`,
    };
  if (a.kind === "list") {
    if (a.items.length !== b.items.length)
      return {
        equal: false,
        reason: `list arity differs: ${a.items.length} vs ${b.items.length} (${formatValue(a)} vs ${formatValue(b)})`,
      };
    for (let i = 0; i < a.items.length; i += 1) {
      const cmp = sameValue(a.items[i], b.items[i]);
      if (!cmp.equal) return { equal: false, reason: `list position ${i + 1}: ${cmp.reason}` };
    }
    return { equal: true };
  }
  if (a.kind === "keyword")
    return a.text === b.text
      ? { equal: true }
      : { equal: false, reason: `keyword ${a.text} vs ${b.text}` };
  if (a.kind === "unresolved" || a.kind === "invalid") {
    // Both sides unresolvable in the SAME way is not a shift: it is an
    // unchanged pre-existing condition, and calling it a regression would
    // redden edits that did not cause it. `equal` stays false-ish for callers
    // that want the distinction, so the shape carries `bothUnresolved`.
    if (a.kind === b.kind && (a.reason ?? null) === (b.reason ?? null))
      return {
        equal: true,
        bothUnresolved: true,
        reason: `unchanged ${describeType(a)} on both sides`,
      };
    return { equal: false, reason: `${describeType(a)} vs ${describeType(b)}` };
  }
  const sa = scalarOf(a);
  const sb = scalarOf(b);
  if (Math.abs(sa - sb) < 1e-6) return { equal: true };
  return {
    equal: false,
    reason: `value ${formatValue(a)} vs ${formatValue(b)}`,
  };
}

export { scalarOf };
