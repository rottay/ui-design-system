/**
 * Evaluate a substituted CSS value down to a typed leaf.
 *
 * Runs AFTER reference substitution, so what arrives here is a value with no
 * custom-property references left -- and, in the shipped artifacts, still
 * predominantly an expression: mixes, arithmetic and range functions.
 *
 * Three refusals are deliberate and are never guesses:
 *
 *  - arithmetic that mixes two units cannot be reduced without inventing a root
 *    font size, and the document root is fluid. It refuses as `unit-mix`.
 *  - a range function whose arguments are not all same-unit literals is not a
 *    constant. Picking its midpoint would report a value no viewport produces,
 *    so it refuses as `unevaluable`.
 *  - a value whose CSS type has no numeric decomposition a non-CSS consumer
 *    could act on stays CSS-typed, but only for a reason on the closed roster.
 *    An unrecognised composite refuses rather than widening the escape hatch.
 */

import {
  hexToOklab,
  oklabToOklch,
  oklchToHex,
  oklchToOklab,
  type Oklab,
} from "@/foundation/kernel/color/oklch";
import {
  CSS_TYPED_LEAF_REASONS,
  type CssTypedLeafReason,
  type ThemeTokenLeaf,
  type TokenEmissionEnvironment,
} from "@/contracts/theme/runtime/compilation";

export type EvaluationRefusal = "unevaluable" | "unit-mix";

export type EvaluationOutcome =
  | { readonly leaf: ThemeTokenLeaf; readonly refused: null }
  | { readonly leaf: null; readonly refused: EvaluationRefusal };

const evaluated = (leaf: ThemeTokenLeaf): EvaluationOutcome => ({ leaf, refused: null });
const refuse = (refused: EvaluationRefusal): EvaluationOutcome => ({ leaf: null, refused });

/* ── numeric quantities ──────────────────────────────────────────────────── */

interface Quantity {
  readonly value: number;
  /** The empty string is a plain number; every other unit is carried as written. */
  readonly unit: string;
}

const LENGTH_UNITS = new Set(["px", "rem", "em", "%"]);
const TIME_UNITS = new Set(["s", "ms"]);
const ANGLE_UNITS = new Set(["deg", "rad", "turn", "grad"]);

const NUMBER = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i;
const DIMENSION = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)([a-z%]*)$/i;

function parseQuantity(text: string): Quantity | null {
  const match = DIMENSION.exec(text.trim());
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value)) return null;
  return { value, unit: match[2].toLowerCase() };
}

/** Serialize a quantity the way the emitter re-reads it: a bare literal. */
function formatQuantity({ value, unit }: Quantity): string {
  const rounded = Math.abs(value) < 1e-9 ? 0 : Number(value.toPrecision(12));
  return `${rounded}${unit}`;
}

/* ── colors ──────────────────────────────────────────────────────────────── */

interface Rgba {
  /** 0-255, not yet rounded. */
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;
}

const HEX = /^#([0-9a-f]{3,8})$/i;

function parseHexColor(text: string): Rgba | null {
  const match = HEX.exec(text.trim());
  if (!match) return null;
  const digits = match[1];
  const expand = (pair: string) => Number.parseInt(pair, 16);
  if (digits.length === 3 || digits.length === 4) {
    const parts = [...digits].map((digit) => expand(digit + digit));
    return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] === undefined ? 1 : parts[3] / 255 };
  }
  if (digits.length === 6 || digits.length === 8) {
    const parts = [0, 2, 4, 6]
      .filter((offset) => offset < digits.length)
      .map((offset) => expand(digits.slice(offset, offset + 2)));
    return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] === undefined ? 1 : parts[3] / 255 };
  }
  return null;
}

/** Split a function's arguments at top-level commas, or at whitespace when it has none. */
function splitArguments(body: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const character of body) {
    if (character === "(") depth += 1;
    if (character === ")") depth -= 1;
    if (character === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
      continue;
    }
    current += character;
  }
  parts.push(current.trim());
  return parts.filter((part) => part.length > 0);
}

/** `rgb()`/`rgba()` accept both the comma and the space grammar, with an optional `/ alpha`. */
function parseRgbFunction(name: string, body: string): Rgba | null {
  const [head, alphaPart] = body.split("/");
  const raw = head.includes(",") ? splitArguments(head) : head.trim().split(/\s+/);
  const args = raw.filter((part) => part.length > 0);
  if (args.length < 3) return null;
  const channel = (text: string): number | null => {
    const quantity = parseQuantity(text);
    if (!quantity) return null;
    if (quantity.unit === "%") return (quantity.value / 100) * 255;
    if (quantity.unit !== "") return null;
    return quantity.value;
  };
  const [r, g, b] = [channel(args[0]), channel(args[1]), channel(args[2])];
  if (r === null || g === null || b === null) return null;
  const alphaText = alphaPart ?? args[3];
  const alpha = alphaText === undefined ? 1 : parseAlpha(alphaText);
  if (alpha === null) return null;
  if (name === "rgb" && args.length > 4) return null;
  return { r, g, b, a: alpha };
}

function parseAlpha(text: string): number | null {
  const quantity = parseQuantity(text);
  if (!quantity) return null;
  if (quantity.unit === "%") return quantity.value / 100;
  if (quantity.unit !== "") return null;
  return quantity.value;
}

function parseHslFunction(body: string): Rgba | null {
  const [head, alphaPart] = body.split("/");
  const raw = head.includes(",") ? splitArguments(head) : head.trim().split(/\s+/);
  const args = raw.filter((part) => part.length > 0);
  if (args.length < 3) return null;
  const hue = parseQuantity(args[0]);
  const saturation = parseQuantity(args[1]);
  const lightness = parseQuantity(args[2]);
  if (!hue || !saturation || !lightness) return null;
  if (hue.unit !== "" && !ANGLE_UNITS.has(hue.unit)) return null;
  if (saturation.unit !== "%" || lightness.unit !== "%") return null;
  const alphaText = alphaPart ?? args[3];
  const alpha = alphaText === undefined ? 1 : parseAlpha(alphaText);
  if (alpha === null) return null;
  const h = ((toDegrees(hue) % 360) + 360) % 360;
  const s = saturation.value / 100;
  const l = lightness.value / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const sextant = Math.floor(h / 60) % 6;
  const table: readonly (readonly [number, number, number])[] = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ];
  const [r, g, b] = table[sextant];
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255, a: alpha };
}

function toDegrees({ value, unit }: Quantity): number {
  if (unit === "rad") return (value * 180) / Math.PI;
  if (unit === "turn") return value * 360;
  if (unit === "grad") return value * 0.9;
  return value;
}

const NAMED_COLORS: Readonly<Record<string, Rgba>> = Object.freeze({
  transparent: { r: 0, g: 0, b: 0, a: 0 },
  black: { r: 0, g: 0, b: 0, a: 1 },
  white: { r: 255, g: 255, b: 255, a: 1 },
});

function parseColor(text: string): Rgba | null {
  const value = text.trim();
  const named = NAMED_COLORS[value.toLowerCase()];
  if (named) return named;
  const hex = parseHexColor(value);
  if (hex) return hex;
  const call = splitFunction(value);
  if (!call || call.before !== "" || call.after !== "") return null;
  if (call.name === "rgb" || call.name === "rgba") return parseRgbFunction("rgb", call.body);
  if (call.name === "hsl" || call.name === "hsla") return parseHslFunction(call.body);
  if (call.name === "oklch" || call.name === "oklab") return parseOkFunction(call.name, call.body);
  return null;
}

function parseOkFunction(name: string, body: string): Rgba | null {
  const [head, alphaPart] = body.split("/");
  const args = head.trim().split(/\s+/).filter((part) => part.length > 0);
  if (args.length < 3) return null;
  const first = parseQuantity(args[0]);
  const second = parseQuantity(args[1]);
  const third = parseQuantity(args[2]);
  if (!first || !second || !third) return null;
  const alpha = alphaPart === undefined ? 1 : parseAlpha(alphaPart);
  if (alpha === null) return null;
  const lightness = first.unit === "%" ? first.value / 100 : first.value;
  const lab: Oklab =
    name === "oklab"
      ? { l: lightness, a: second.value, b: third.value }
      : oklchToOklab({
          l: lightness,
          c: second.unit === "%" ? (second.value / 100) * 0.4 : second.value,
          h: toDegrees(third),
        });
  return { ...oklabToRgba(lab), a: alpha };
}

/* ── the shared oklab <-> sRGB leg, through the one colour owner ─────────── */

function rgbaToHex({ r, g, b }: Rgba): string {
  const channel = (value: number) =>
    Math.round(Math.min(255, Math.max(0, value)))
      .toString(16)
      .padStart(2, "0");
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

function rgbaToOklab(color: Rgba): Oklab {
  return hexToOklab(rgbaToHex(color));
}

function oklabToRgba(lab: Oklab): Rgba {
  // The colour owner's own terminal does the chroma reduction and the transfer
  // curve; only the alpha its float shape does not carry is added back here.
  // Re-reading its hex is what keeps this a consumer of that chain rather than
  // a second conversion with its own rounding.
  const parsed = parseHexColor(oklchToHex(oklabToOklch(lab)));
  return parsed ? { ...parsed, a: 1 } : { r: 0, g: 0, b: 0, a: 1 };
}

/* ── expression reduction ────────────────────────────────────────────────── */

interface FunctionCall {
  readonly before: string;
  readonly name: string;
  readonly body: string;
  readonly after: string;
}

const CALLABLE = /(^|[^\w-])([a-z][a-z0-9-]*)\($/i;

/** The first function call in `text`, with balanced parentheses. */
function splitFunction(text: string): FunctionCall | null {
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] !== "(") continue;
    const head = CALLABLE.exec(text.slice(0, index + 1));
    if (!head) continue;
    let depth = 0;
    for (let scan = index; scan < text.length; scan += 1) {
      if (text[scan] === "(") depth += 1;
      else if (text[scan] === ")") {
        depth -= 1;
        if (depth === 0) {
          return {
            before: text.slice(0, index - head[2].length),
            name: head[2].toLowerCase(),
            body: text.slice(index + 1, scan),
            after: text.slice(scan + 1),
          };
        }
      }
    }
    return null;
  }
  return null;
}

const REDUCIBLE = new Set(["calc", "color-mix", "clamp", "min", "max"]);

/** True when the body still holds a reducible call of its own. */
function holdsReducible(text: string): boolean {
  let rest = text;
  for (let guard = 0; guard < 64; guard += 1) {
    const call = splitFunction(rest);
    if (!call) return false;
    if (REDUCIBLE.has(call.name)) return true;
    rest = call.body + call.after;
  }
  return false;
}

export function evaluateCssValue(
  text: string,
  environment: TokenEmissionEnvironment
): EvaluationOutcome {
  let current = text.trim();
  if (current === "") return refuse("unevaluable");
  for (let guard = 0; guard < 128; guard += 1) {
    const call = findInnermostReducible(current);
    if (!call) break;
    const reduced = reduceCall(call, environment);
    if (reduced.refused !== null) return refuse(reduced.refused);
    current = `${call.before}${reduced.text}${call.after}`;
  }
  return classify(current, environment);
}

function findInnermostReducible(text: string): FunctionCall | null {
  let offset = 0;
  let rest = text;
  for (let guard = 0; guard < 128; guard += 1) {
    const call = splitFunction(rest);
    if (!call) return null;
    if (REDUCIBLE.has(call.name) && !holdsReducible(call.body)) {
      return {
        before: text.slice(0, offset + call.before.length),
        name: call.name,
        body: call.body,
        after: call.after,
      };
    }
    if (REDUCIBLE.has(call.name) || holdsReducible(call.body)) {
      offset += call.before.length + call.name.length + 1;
      rest = call.body + ")" + call.after;
      continue;
    }
    offset += call.before.length + call.name.length + 1 + call.body.length + 1;
    rest = call.after;
  }
  return null;
}

type ReductionOutcome =
  | { readonly text: string; readonly refused: null }
  | { readonly text: ""; readonly refused: EvaluationRefusal };

const reduced = (text: string): ReductionOutcome => ({ text, refused: null });
const refuseReduction = (refused: EvaluationRefusal): ReductionOutcome => ({ text: "", refused });

function reduceCall(call: FunctionCall, environment: TokenEmissionEnvironment): ReductionOutcome {
  if (call.name === "calc") return reduceArithmetic(call.body);
  if (call.name === "color-mix") return reduceColorMix(call.body);
  return reduceRange(call.name, call.body, environment);
}

/* ── calc ────────────────────────────────────────────────────────────────── */

type Token = { kind: "quantity"; quantity: Quantity } | { kind: "operator"; operator: string };

function tokenizeArithmetic(body: string): readonly Token[] | null {
  const tokens: Token[] = [];
  let index = 0;
  while (index < body.length) {
    const character = body[index];
    if (/\s/.test(character)) {
      index += 1;
      continue;
    }
    if (character === "(" || character === ")") {
      tokens.push({ kind: "operator", operator: character });
      index += 1;
      continue;
    }
    if (character === "*" || character === "/") {
      tokens.push({ kind: "operator", operator: character });
      index += 1;
      continue;
    }
    if ((character === "+" || character === "-") && expectsOperator(tokens)) {
      tokens.push({ kind: "operator", operator: character });
      index += 1;
      continue;
    }
    const rest = body.slice(index);
    const match = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?[a-z%]*/i.exec(rest);
    if (!match) return null;
    const quantity = parseQuantity(match[0]);
    if (!quantity) return null;
    tokens.push({ kind: "quantity", quantity });
    index += match[0].length;
  }
  return tokens;
}

function expectsOperator(tokens: readonly Token[]): boolean {
  const last = tokens[tokens.length - 1];
  return last !== undefined && (last.kind === "quantity" || last.operator === ")");
}

function reduceArithmetic(body: string): ReductionOutcome {
  const tokens = tokenizeArithmetic(body);
  if (!tokens) return refuseReduction("unevaluable");
  const state = { index: 0 };
  const result = parseSum(tokens, state);
  if (result === "unit-mix") return refuseReduction("unit-mix");
  if (result === null || state.index !== tokens.length) return refuseReduction("unevaluable");
  return reduced(formatQuantity(result));
}

type ArithmeticResult = Quantity | null | "unit-mix";

function parseSum(tokens: readonly Token[], state: { index: number }): ArithmeticResult {
  let left = parseProduct(tokens, state);
  if (left === null || left === "unit-mix") return left;
  for (;;) {
    const token = tokens[state.index];
    if (!token || token.kind !== "operator" || (token.operator !== "+" && token.operator !== "-")) {
      return left;
    }
    state.index += 1;
    const right = parseProduct(tokens, state);
    if (right === null || right === "unit-mix") return right;
    // Addition is only defined between the same unit. A mix cannot be reduced
    // without inventing a root font size, and the root is fluid.
    if (left.unit !== right.unit) return "unit-mix";
    const sum: number =
      token.operator === "+" ? left.value + right.value : left.value - right.value;
    left = { value: sum, unit: left.unit };
  }
}

function parseProduct(tokens: readonly Token[], state: { index: number }): ArithmeticResult {
  let left = parseAtom(tokens, state);
  if (left === null || left === "unit-mix") return left;
  for (;;) {
    const token = tokens[state.index];
    if (!token || token.kind !== "operator" || (token.operator !== "*" && token.operator !== "/")) {
      return left;
    }
    state.index += 1;
    const right = parseAtom(tokens, state);
    if (right === null || right === "unit-mix") return right;
    if (token.operator === "*") {
      if (left.unit !== "" && right.unit !== "") return "unit-mix";
      left = { value: left.value * right.value, unit: left.unit === "" ? right.unit : left.unit };
      continue;
    }
    if (right.unit !== "") return "unit-mix";
    if (right.value === 0) return null;
    left = { value: left.value / right.value, unit: left.unit };
  }
}

function parseAtom(tokens: readonly Token[], state: { index: number }): ArithmeticResult {
  const token = tokens[state.index];
  if (!token) return null;
  if (token.kind === "quantity") {
    state.index += 1;
    return token.quantity;
  }
  if (token.operator === "(") {
    state.index += 1;
    const inner = parseSum(tokens, state);
    const closing = tokens[state.index];
    if (!closing || closing.kind !== "operator" || closing.operator !== ")") return null;
    state.index += 1;
    return inner;
  }
  return null;
}

/* ── color-mix ───────────────────────────────────────────────────────────── */

function reduceColorMix(body: string): ReductionOutcome {
  const args = splitArguments(body);
  if (args.length !== 3) return refuseReduction("unevaluable");
  const space = /^in\s+([a-z-]+)$/i.exec(args[0].trim());
  if (!space) return refuseReduction("unevaluable");
  const interpolation = space[1].toLowerCase();
  if (interpolation !== "srgb" && interpolation !== "oklab") return refuseReduction("unevaluable");
  const first = parseMixOperand(args[1]);
  const second = parseMixOperand(args[2]);
  if (!first || !second) return refuseReduction("unevaluable");

  // CSS Color 5: absent percentages default to the complement, both absent is
  // an even mix, and a pair that sums below 100% scales the result's alpha.
  const declared1 = first.percentage;
  const declared2 = second.percentage;
  const p1 =
    declared1 !== null ? declared1 : declared2 !== null ? 100 - declared2 : 50;
  const p2 =
    declared2 !== null ? declared2 : declared1 !== null ? 100 - declared1 : 50;
  const sum = p1 + p2;
  if (sum <= 0) return refuseReduction("unevaluable");
  const alphaMultiplier = sum < 100 ? sum / 100 : 1;
  const w1 = p1 / sum;
  const w2 = p2 / sum;
  const mixed =
    interpolation === "srgb"
      ? mixPremultipliedSrgb(first.color, second.color, w1, w2)
      : mixPremultipliedOklab(first.color, second.color, w1, w2);
  const alpha = clampUnit(mixed.a * alphaMultiplier);
  return reduced(serializeRgba({ ...mixed, a: alpha }));
}

interface MixOperand {
  readonly color: Rgba;
  readonly percentage: number | null;
}

function parseMixOperand(text: string): MixOperand | null {
  const trimmed = text.trim();
  const tail = /\s([+-]?(?:\d+\.?\d*|\.\d+))%$/.exec(trimmed);
  if (tail) {
    const color = parseColor(trimmed.slice(0, trimmed.length - tail[0].length));
    return color ? { color, percentage: Number(tail[1]) } : null;
  }
  const leading = /^([+-]?(?:\d+\.?\d*|\.\d+))%\s+/.exec(trimmed);
  if (leading) {
    const color = parseColor(trimmed.slice(leading[0].length));
    return color ? { color, percentage: Number(leading[1]) } : null;
  }
  const color = parseColor(trimmed);
  return color ? { color, percentage: null } : null;
}

const clampUnit = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Premultiplied-alpha mixing, which is what makes a mix toward `transparent`
 * move ONLY the alpha. Un-premultiplied interpolation drags the colour toward
 * the transparent operand's black, which is the exact defect a hex-only mixer
 * hides by returning its base colour unchanged.
 */
function mixPremultipliedSrgb(first: Rgba, second: Rgba, w1: number, w2: number): Rgba {
  const a = first.a * w1 + second.a * w2;
  const channel = (one: number, two: number) => {
    const premultiplied = one * first.a * w1 + two * second.a * w2;
    return a === 0 ? 0 : premultiplied / a;
  };
  return {
    r: channel(first.r, second.r),
    g: channel(first.g, second.g),
    b: channel(first.b, second.b),
    a,
  };
}

function mixPremultipliedOklab(first: Rgba, second: Rgba, w1: number, w2: number): Rgba {
  const one = rgbaToOklab(first);
  const two = rgbaToOklab(second);
  const a = first.a * w1 + second.a * w2;
  const axis = (left: number, right: number) => {
    const premultiplied = left * first.a * w1 + right * second.a * w2;
    return a === 0 ? 0 : premultiplied / a;
  };
  const lab: Oklab = {
    l: axis(one.l, two.l),
    a: axis(one.a, two.a),
    b: axis(one.b, two.b),
  };
  return { ...oklabToRgba(lab), a };
}

/** A reduced colour re-enters the pipeline as a literal the classifier reads. */
function serializeRgba({ r, g, b, a }: Rgba): string {
  const channel = (value: number) => Math.round(Math.min(255, Math.max(0, value)));
  const alpha = Number(clampUnit(a).toPrecision(12));
  return `rgba(${channel(r)},${channel(g)},${channel(b)},${alpha})`;
}

/* ── clamp / min / max ───────────────────────────────────────────────────── */

function reduceRange(
  name: string,
  body: string,
  _environment: TokenEmissionEnvironment
): ReductionOutcome {
  const args = splitArguments(body).map((argument) => parseQuantity(argument));
  if (args.some((argument) => argument === null)) return refuseReduction("unevaluable");
  const quantities = args as Quantity[];
  if (quantities.length === 0) return refuseReduction("unevaluable");
  const unit = quantities[0].unit;
  // A viewport-relative argument is not a constant. Refusing is the whole
  // point: a midpoint would report a value no viewport ever produces.
  if (quantities.some((quantity) => quantity.unit !== unit)) return refuseReduction("unevaluable");
  if (name === "min") {
    return reduced(formatQuantity({ value: Math.min(...quantities.map((q) => q.value)), unit }));
  }
  if (name === "max") {
    return reduced(formatQuantity({ value: Math.max(...quantities.map((q) => q.value)), unit }));
  }
  if (quantities.length !== 3) return refuseReduction("unevaluable");
  const [low, preferred, high] = quantities.map((quantity) => quantity.value);
  return reduced(formatQuantity({ value: Math.max(low, Math.min(preferred, high)), unit }));
}

/* ── classification ──────────────────────────────────────────────────────── */

const KEYWORD = /^[a-z][a-z0-9-]*$/i;

function classify(text: string, environment: TokenEmissionEnvironment): EvaluationOutcome {
  const value = text.trim();
  const color = parseColor(value);
  if (color) {
    return evaluated({
      kind: "color",
      srgb: [round8(color.r), round8(color.g), round8(color.b)],
      alpha: Number(clampUnit(color.a).toPrecision(12)),
    });
  }
  const quantity = parseQuantity(value);
  if (quantity) {
    if (quantity.unit === "") {
      return evaluated({ kind: "number", value: normalize(quantity.value) });
    }
    if (LENGTH_UNITS.has(quantity.unit)) {
      return evaluated({
        kind: "length",
        value: normalize(quantity.value),
        unit: quantity.unit as "px" | "rem" | "em" | "%",
      });
    }
    if (TIME_UNITS.has(quantity.unit)) {
      const ms = quantity.unit === "s" ? quantity.value * 1000 : quantity.value;
      return evaluated({ kind: "time", ms: normalize(ms) });
    }
    if (ANGLE_UNITS.has(quantity.unit)) {
      return evaluated({ kind: "angle", deg: normalize(toDegrees(quantity)) });
    }
    return refuse("unevaluable");
  }
  if (NUMBER.test(value)) return evaluated({ kind: "number", value: Number(value) });
  if (KEYWORD.test(value)) return evaluated({ kind: "keyword", value });
  const reason = cssTypedReason(value);
  if (reason) return evaluated({ kind: "css", css: value, reason });
  return refuse("unevaluable");
}

const round8 = (value: number) => Math.round(Math.min(255, Math.max(0, value)));
const normalize = (value: number) => Number(value.toPrecision(12));

const GRADIENT = /(?:^|[\s(,])(?:repeating-)?(?:linear|radial|conic)-gradient\(/i;
const FILTER_FUNCTIONS = new Set([
  "blur", "brightness", "contrast", "drop-shadow", "grayscale",
  "hue-rotate", "invert", "opacity", "saturate", "sepia",
]);
const TRANSFORM_FUNCTIONS =
  /^(?:translate|scale|rotate|skew|matrix|perspective)[a-z0-9]*$/i;
const FONT_NAME = /^(?:"[^"]*"|'[^']*'|-?[a-z][\w-]*(?:\s+[a-z][\w-]*)*)$/i;

/** Split a value at top-level whitespace, keeping function calls whole. */
function topLevelTokens(value: string): string[] {
  const tokens = [];
  let depth = 0;
  let current = "";
  for (const character of value) {
    if (character === "(") depth += 1;
    if (character === ")") depth -= 1;
    if (depth === 0 && /\s/.test(character)) {
      if (current.length > 0) tokens.push(current);
      current = "";
      continue;
    }
    current += character;
  }
  if (current.length > 0) tokens.push(current);
  return tokens;
}

/** The function name of a top-level call, or null when the token is not one. */
function callNameOf(token: string): string | null {
  const call = splitFunction(token);
  return call && call.before === "" && call.after === "" ? call.name : null;
}

/**
 * One shadow: an optional `inset`, two to four lengths, and at most one colour.
 * Anything else in the item -- a keyword such as `solid`, a second colour --
 * makes it some other shorthand, which this roster does not name.
 */
function readShadowItem(item: string): { colors: number } | null {
  let lengths = 0;
  let colors = 0;
  for (const token of topLevelTokens(item)) {
    if (/^inset$/i.test(token)) continue;
    const quantity = parseQuantity(token);
    if (quantity && (quantity.unit === "" ? quantity.value === 0 : LENGTH_UNITS.has(quantity.unit))) {
      lengths += 1;
      continue;
    }
    if (parseColor(token)) {
      colors += 1;
      continue;
    }
    return null;
  }
  if (lengths < 2 || lengths > 4 || colors > 1) return null;
  return { colors };
}

/**
 * The closed roster, read against the value's real shape rather than against a
 * substring. A shorthand this roster does not name is NOT CSS-typed: it refuses,
 * because a `css` leaf that accepts anything is the escape hatch the bound
 * exists to prevent.
 */
function cssTypedReason(value: string): CssTypedLeafReason | null {
  if (GRADIENT.test(value)) return "gradient";
  const items = splitArguments(value);
  const tokens = topLevelTokens(value);

  const calls = tokens.map((token) => callNameOf(token));
  if (tokens.length > 0 && calls.every((name) => name !== null && FILTER_FUNCTIONS.has(name))) {
    return "filter";
  }
  if (tokens.length > 0 && calls.every((name) => name !== null && TRANSFORM_FUNCTIONS.test(name))) {
    return "transform";
  }

  const shadows = items.map((item) => readShadowItem(item));
  if (shadows.every((item) => item !== null) && shadows.some((item) => (item as { colors: number }).colors > 0)) {
    return "shadow-list";
  }

  if (
    items.length > 0 &&
    items.every((item) => {
      const parts = topLevelTokens(item);
      return (
        parts.some((part) => {
          const quantity = parseQuantity(part);
          return quantity !== null && TIME_UNITS.has(quantity.unit);
        }) && parts.length >= 2
      );
    })
  ) {
    return "transition-shorthand";
  }

  if (items.length > 1 && items.every((item) => FONT_NAME.test(item.trim()))) {
    return "font-family-stack";
  }
  return null;
}
