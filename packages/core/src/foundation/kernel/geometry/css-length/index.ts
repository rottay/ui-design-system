/**
 * @fileoverview The one conversion from an authored CSS length to pixels.
 *
 * The tenant validator rejects an authored dimension that exceeds a cap, and
 * the Classic engine adapter has to hand antd a NUMBER of px for a radius the
 * tenant wrote as CSS text. A second conversion would let a value pass the cap
 * as one unit and paint as another, so both read this owner.
 */

/**
 * The root font size this conversion is defined against. It is the convention
 * the tenant caps have always been enforced with; `em` folds into it because
 * an authored theme value has no element context at compile time.
 */
export const PX_PER_ROOT_EM = 16;

/** One number plus its unit, with the empty unit meaning "already px". */
const ONE_DIMENSION = /^([+-]?(?:\d+\.?\d*|\.\d+))([a-z%]*)$/i;

/**
 * The compiler's dialed operand, `calc(<length> / <scale>)`. The division is
 * expressed for the browser rather than evaluated, so a reader that needs a
 * number has to undo it here.
 */
const DIALED_LENGTH = /^calc\(\s*(.+?)\s*\/\s*([+-]?(?:\d+\.?\d*|\.\d+))\s*\)$/;

/**
 * Convert one already-parsed magnitude and unit. `null` means "not a length
 * this convention can express in px" — a percentage, a viewport unit, an
 * angle — and is never a default.
 */
export function dimensionToPx(value: number, unit: string): number | null {
  if (!Number.isFinite(value)) return null;
  if (unit === "px" || unit === "") return value;
  if (unit === "rem" || unit === "em") return value * PX_PER_ROOT_EM;
  return null;
}

/**
 * Convert ONE complete authored dimension: the whole string must be that one
 * dimension. A shorthand, a function call or trailing text yields `null`
 * rather than the leading number, which is the `parseFloat` failure that let
 * `0.5rem` become 0.5px.
 */
export function cssLengthToPx(value: string): number | null {
  const match = ONE_DIMENSION.exec(value.trim());
  if (!match) return null;
  return dimensionToPx(Number(match[1]), match[2].toLowerCase());
}

/**
 * Convert an authored dimension in either shape the compiler emits: the bare
 * length, or the dialed operand. A zero or non-finite divisor, and an inner
 * value that is not one complete dimension, all yield `null`.
 */
export function dialedCssLengthToPx(value: string): number | null {
  const trimmed = value.trim();
  const dialed = DIALED_LENGTH.exec(trimmed);
  if (!dialed) return cssLengthToPx(trimmed);
  const authored = cssLengthToPx(dialed[1]);
  const divisor = Number(dialed[2]);
  if (authored === null || !Number.isFinite(divisor) || divisor === 0) return null;
  const resolved = authored / divisor;
  return Number.isFinite(resolved) ? resolved : null;
}
