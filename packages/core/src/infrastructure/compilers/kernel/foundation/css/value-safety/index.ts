/**
 * @fileoverview The single admission grammar for CSS text the theme pipeline
 * assembles.
 *
 * Every productive emitter -- the first-party artifact renderer, the DB artifact
 * renderer, visual-authority's admission recompute, the brand-studio preview,
 * the branding sandbox, the tenant preview -- reaches CSS text through
 * `runtime/theme/runtime/emission`. A channel that fails this grammar is
 * omitted there, before a single character is assembled, so a value can never
 * terminate its own declaration, close the rule, escape the `<style>` element
 * or open a rule of its own.
 *
 * WHY IT LIVES HERE. `Theme` declares open string leaves (`palette.primaryColor`,
 * `typography.fontFamilyBase`) and open is a contract, not an oversight: the
 * option domains in `themes/iso/schema` close what the contract closes and must
 * not narrow the rest. The compiler therefore cannot vouch for the shape of the
 * strings it lowers, and the guarantee has to sit at the boundary that turns a
 * value into CSS text. This owner is the lowest one both that boundary and the
 * runtime preview consumers can import: `infrastructure/compilers` is below
 * `infrastructure/runtime`, and `kernel` is below `runtime` inside compilers, so
 * the emission layer reaches it without inverting and
 * `runtime/tenant/runtime/preview-scope` re-exports it rather than restating it.
 *
 * @module Compilers/Kernel/Foundation/Css/ValueSafety
 * @category Compilers
 * @package @rottay/design-system
 */

/** The canonical channel-name grammar. A name outside it is not a DS channel. */
const CHANNEL_NAME = /^--ds-[a-z0-9-]+$/i;

const MAX_VALUE_LENGTH = 512;

/** CSS value functions the theme pipeline may legitimately emit. */
const ALLOWED_VALUE_FUNCTIONS: ReadonlySet<string> = new Set([
  'rgb',
  'rgba',
  'hsl',
  'hsla',
  'oklch',
  'lab',
  'lch',
  'light-dark',
  'color-mix',
  'linear-gradient',
  'radial-gradient',
  'conic-gradient',
  'var',
  'calc',
  'min',
  'max',
  'clamp',
  'blur',
  'saturate',
  'drop-shadow',
  'cubic-bezier',
  /** The CSS easing function, emitted by the governed spring recipes. */
  'linear',
  'translate',
  'translatex',
  'translatey',
  'scale',
  'scalex',
  'scaley',
  'rotate',
  'repeat',
  'minmax',
  'fit-content',
]);

/**
 * Characters that end a declaration, close a rule, leave the `<style>` element
 * or introduce an escape. Refused everywhere, quoted context included.
 */
const STRUCTURAL_BREAKOUT = /[{};<>[\]\\]/;

/** Token sequences that fetch, escape the value context, or outrank the cascade. */
const FORBIDDEN_TOKENS =
  /\/\*|\*\/|!\s*important|expression\s*\(|url\s*\(|javascript\s*:|data\s*:|-moz-binding/i;

const TAB = 9;
const LINE_FEED = 10;
const CARRIAGE_RETURN = 13;
const FIRST_PRINTABLE = 32;
const DELETE = 127;

interface ValueScan {
  balanced: boolean;
  atOutsideQuotes: boolean;
  hasControl: boolean;
}

/**
 * One pass over the value, tracking control characters and quote/parenthesis
 * state.
 *
 * Backslash is refused before this runs, so no escape sequence exists and a
 * quote character always opens or closes a string. That makes the quoted spans
 * exact rather than approximate.
 *
 * Tab, newline and carriage return are admitted: CSS reads them as whitespace
 * and the multi-line shadow values the compiler already emits carry them, while
 * none of them can terminate a declaration or close a rule.
 */
function scanValue(value: string): ValueScan {
  let quote: string | null = null;
  let depth = 0;
  let atOutsideQuotes = false;
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code === DELETE || (code < FIRST_PRINTABLE && code !== TAB && code !== LINE_FEED && code !== CARRIAGE_RETURN)) {
      return { balanced: false, atOutsideQuotes, hasControl: true };
    }
    const char = value[index];
    if (quote !== null) {
      if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === '@') atOutsideQuotes = true;
    else if (char === '(') depth += 1;
    else if (char === ')') {
      depth -= 1;
      if (depth < 0) return { balanced: false, atOutsideQuotes, hasControl: false };
    }
  }
  return { balanced: quote === null && depth === 0, atOutsideQuotes, hasControl: false };
}

/** True when the name is a DS channel this pipeline is allowed to declare. */
export function isSafeCssChannelName(name: string): boolean {
  return CHANNEL_NAME.test(name);
}

/**
 * True when the value cannot terminate its declaration, close the rule block,
 * open a comment, close the `<style>` element or trigger a fetch.
 *
 * `@` is refused outside a quoted string only: inside one it cannot begin an
 * at-rule, and the governed provenance markers publish their identity that way.
 */
export function isSafeCssValue(value: string): boolean {
  if (typeof value !== 'string') return false;
  if (value.length === 0 || value.length > MAX_VALUE_LENGTH || value !== value.trim()) {
    return false;
  }
  if (STRUCTURAL_BREAKOUT.test(value)) return false;
  if (FORBIDDEN_TOKENS.test(value)) return false;

  const scan = scanValue(value);
  if (scan.hasControl || !scan.balanced || scan.atOutsideQuotes) return false;

  return [...value.matchAll(/([a-z][a-z0-9-]*)\s*\(/gi)].every((match) =>
    ALLOWED_VALUE_FUNCTIONS.has(match[1]!.toLowerCase())
  );
}

/** True when both halves of a declaration are admissible. */
export function isSafeCssDeclaration(name: string, value: unknown): boolean {
  return typeof value === 'string' && isSafeCssChannelName(name) && isSafeCssValue(value);
}

/**
 * The admissible subset of a channel map, in source order.
 *
 * Refuse, never repair: an inadmissible channel is omitted whole. Rewriting a
 * value would publish something its author never wrote, and escaping it by
 * string replacement is how a second, weaker grammar gets born.
 */
export function admitCssVariables(
  variables: Readonly<Record<string, string>>
): Record<string, string> {
  const admitted: Record<string, string> = {};
  for (const [name, value] of Object.entries(variables)) {
    if (value == null) continue;
    if (!isSafeCssDeclaration(name, value)) continue;
    admitted[name] = value;
  }
  return admitted;
}
