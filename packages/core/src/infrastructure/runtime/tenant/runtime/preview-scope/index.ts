/**
 * @fileoverview Preview scoping and value-sanitization primitives shared by
 * every tenant preview injector (legacy TenantPreview CSS rescoping and the
 * tenant-theme artifact preview).
 *
 * A preview must never publish rules against the document-root tenant
 * selector: inside the preview container they are dead, and when the previewed
 * slug equals the active tenant they restyle the entire document. Every
 * preview rule is therefore anchored to {@link PREVIEW_SCOPE_ATTRIBUTE}, an
 * attribute only the preview root carries, and every declaration value is
 * whitelist-filtered so hostile config values, names, or slugs cannot escape
 * the injected <style> tag's scope.
 *
 * The value checker mirrors the injection-safety core of the tenant-theme
 * compiler's `isSafeVisualValue` (infrastructure/compilers/composition/
 * tenant-theme, module-private there). The authored-caps tier (shadow-layer
 * counts, dimension caps, var-reference ledger) is intentionally not applied:
 * preview values are DS-computed outputs, not authored inputs.
 */

/** Attribute stamped on the preview root; the only anchor preview CSS may use. */
export const PREVIEW_SCOPE_ATTRIBUTE = 'data-ds-tenant-preview-root';

const MAX_VALUE_LENGTH = 512;

/** CSS value functions the tenant CSS generator may legitimately emit. */
const ALLOWED_VALUE_FUNCTIONS = new Set([
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
 * Reduce a slug to characters that are inert inside a CSS attribute selector.
 * Falls back to 'preview' so an all-hostile slug still yields a valid scope.
 */
export function sanitizePreviewSlug(slug: string): string {
  const safe = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
  return safe.length > 0 ? safe : 'preview';
}

/** Selector every preview rule is anchored to. Matches only elements stamped by the preview root. */
export function buildPreviewScopeSelector(safeSlug: string): string {
  return `[${PREVIEW_SCOPE_ATTRIBUTE}='${safeSlug}']`;
}

/**
 * True when a declaration value cannot terminate the declaration, close the
 * rule block, open a comment, close the <style> element, or trigger a fetch.
 */
export function isSafePreviewCssValue(value: string): boolean {
  if (value.length === 0 || value.length > MAX_VALUE_LENGTH || value !== value.trim()) {
    return false;
  }
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f{};<>[\]@\\]/.test(value)) return false;
  if (/\/\*|\*\/|!\s*important|expression\s*\(|url\s*\(|javascript\s*:|data\s*:|-moz-binding/i.test(value)) {
    return false;
  }

  let parenDepth = 0;
  for (const char of value) {
    if (char === '(') parenDepth += 1;
    else if (char === ')') {
      parenDepth -= 1;
      if (parenDepth < 0) return false;
    }
  }
  if (parenDepth !== 0) return false;
  if ((value.split("'").length - 1) % 2 !== 0) return false;
  if ((value.split('"').length - 1) % 2 !== 0) return false;

  const functionNames = [...value.matchAll(/([a-z][a-z0-9-]*)\s*\(/gi)].map((match) =>
    match[1].toLowerCase()
  );
  return functionNames.every((name) => ALLOWED_VALUE_FUNCTIONS.has(name));
}
