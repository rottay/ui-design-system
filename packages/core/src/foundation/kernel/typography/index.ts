/**
 * Typography kernel — pure font-stack policy shared by the static BrandTheme
 * and DB appearance compilers (DS-A007).
 *
 * A tenant selects the FRONT of a font stack; it can never remove the
 * Arabic-safe tail, because the program requires AR/RTL rendering under every
 * tenant. The fallback insertion is idempotent and preserves the tenant's
 * families first.
 */

const ARABIC_SAFE_FAMILY = '"Noto Sans Arabic"';

const ARABIC_CAPABLE_PATTERN =
  /noto\s+(?:sans|kufi|naskh)\s+arabic|geeza\s+pro|tahoma/i;

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
