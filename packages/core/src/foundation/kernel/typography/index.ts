/**
 * Typography kernel — pure font-stack policy shared by the static BrandTheme
 * and DB appearance compilers (DS-A007).
 *
 * A tenant selects the FRONT of a font stack; it can never remove the
 * Arabic-safe tail, because the program requires AR/RTL rendering under every
 * tenant. The fallback insertion is idempotent and preserves the tenant's
 * families first.
 */

/**
 * Families that satisfy the Arabic-safe tail. A stack containing any of them
 * carries the coverage; `MANDATORY_FONT_FALLBACK_FAMILY` is the one this module
 * appends when a stack carries none.
 */
export const MANDATORY_FONT_FALLBACK_FAMILY = '"Noto Sans Arabic"';

/**
 * CSS channels whose stacks must carry the mandatory fallback. Mono is absent
 * on purpose: a code face renders no Arabic body text, and forcing the tail
 * onto it would change every mono stack for no reading benefit.
 */
export const MANDATORY_FALLBACK_FONT_CHANNELS = [
  "--ds-font-family-base",
  "--ds-font-family-heading",
  "--ds-font-family-display",
] as const;

const ARABIC_SAFE_FAMILY = MANDATORY_FONT_FALLBACK_FAMILY;

const ARABIC_CAPABLE_PATTERN =
  /noto\s+(?:sans|kufi|naskh)\s+arabic|geeza\s+pro|tahoma/i;

/** Whether a font stack already carries Arabic-capable coverage. */
export function hasMandatoryFontFallback(stack: string): boolean {
  return ARABIC_CAPABLE_PATTERN.test(stack);
}

/**
 * Fail-closed check over an emitted variable map. `withArabicSafeFallback`
 * appends the tail on the way in; this is what stops a later mapping, override
 * or compat path from taking it back out again without anyone noticing — the
 * evnto artifact shipped Arabic-less stacks for exactly that reason.
 */
export function assertMandatoryFontFallback(
  variables: Record<string, string>,
  context: string
): void {
  for (const channel of MANDATORY_FALLBACK_FONT_CHANNELS) {
    const stack = variables[channel];
    if (stack == null || hasMandatoryFontFallback(stack)) continue;
    throw new Error(
      `${context}: ${channel} omits the mandatory font fallback ` +
        `${MANDATORY_FONT_FALLBACK_FAMILY} (stack: ${stack}).`
    );
  }
}

const TRAILING_GENERIC_PATTERN =
  /(,\s*)(sans-serif|serif|monospace|system-ui|ui-rounded|ui-serif)\s*$/i;

/**
 * Append the Arabic-safe fallback to a tenant-authored family stack. The
 * tenant's families stay first; the safe family lands immediately before a
 * trailing CSS generic when one exists, otherwise at the end with a generic.
 */
export function withArabicSafeFallback(family: string): string {
  const trimmed = family.trim();
  if (trimmed.length === 0) return family;
  if (ARABIC_CAPABLE_PATTERN.test(trimmed)) return family;
  if (TRAILING_GENERIC_PATTERN.test(trimmed)) {
    return trimmed.replace(
      TRAILING_GENERIC_PATTERN,
      `$1${ARABIC_SAFE_FAMILY}, $2`
    );
  }
  return `${trimmed}, ${ARABIC_SAFE_FAMILY}, sans-serif`;
}
